-- Family Planner App — Database Schema
-- Run this in your Supabase SQL Editor to set up the database.

-- ============================================================
-- EXTENSIONS
-- ============================================================

create extension if not exists "uuid-ossp";

-- ============================================================
-- TABLES
-- ============================================================

-- Households (tenant boundary)
create table public.households (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  created_at timestamptz not null default now()
);

-- User profiles (synced from auth.users via trigger)
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

-- Household membership
create table public.household_members (
  household_id uuid not null references public.households(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'member')),
  joined_at timestamptz not null default now(),
  primary key (household_id, user_id)
);

-- Household settings (API keys, preferences)
create table public.household_settings (
  id uuid primary key default uuid_generate_v4(),
  household_id uuid not null unique references public.households(id) on delete cascade,
  claude_api_key_encrypted text,
  spoonacular_api_key text,
  default_servings integer not null default 4,
  created_at timestamptz not null default now()
);

-- Recipes
create table public.recipes (
  id uuid primary key default uuid_generate_v4(),
  household_id uuid not null references public.households(id) on delete cascade,
  title text not null,
  description text,
  ingredients jsonb not null default '[]'::jsonb,
  steps jsonb not null default '[]'::jsonb,
  tags text[] not null default '{}',
  prep_time_minutes integer,
  cook_time_minutes integer,
  servings integer,
  source_url text,
  source_type text not null default 'manual' check (source_type in ('manual', 'url', 'video', 'image')),
  image_url text,
  is_favorite boolean not null default false,
  created_by uuid not null references public.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Meal plans (one per week per household)
create table public.meal_plans (
  id uuid primary key default uuid_generate_v4(),
  household_id uuid not null references public.households(id) on delete cascade,
  week_start_date date not null,
  created_at timestamptz not null default now(),
  unique (household_id, week_start_date)
);

-- Meal plan slots
create table public.meal_plan_slots (
  id uuid primary key default uuid_generate_v4(),
  meal_plan_id uuid not null references public.meal_plans(id) on delete cascade,
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  day_of_week integer not null check (day_of_week between 0 and 6),
  meal_type text not null check (meal_type in ('breakfast', 'lunch', 'dinner', 'snack'))
);

-- Grocery lists
create table public.grocery_lists (
  id uuid primary key default uuid_generate_v4(),
  household_id uuid not null references public.households(id) on delete cascade,
  title text not null,
  meal_plan_id uuid references public.meal_plans(id) on delete set null,
  created_at timestamptz not null default now()
);

-- Grocery items
create table public.grocery_items (
  id uuid primary key default uuid_generate_v4(),
  grocery_list_id uuid not null references public.grocery_lists(id) on delete cascade,
  name text not null,
  quantity numeric,
  unit text,
  category text,
  checked boolean not null default false
);

-- Pantry staples
create table public.pantry_staples (
  id uuid primary key default uuid_generate_v4(),
  household_id uuid not null references public.households(id) on delete cascade,
  name text not null,
  category text
);

-- Calendar connections
create table public.calendar_connections (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  provider text not null default 'google' check (provider in ('google')),
  access_token text not null,
  refresh_token text not null,
  expires_at timestamptz not null,
  calendar_id text,
  created_at timestamptz not null default now()
);

-- To-do lists
create table public.todo_lists (
  id uuid primary key default uuid_generate_v4(),
  household_id uuid not null references public.households(id) on delete cascade,
  title text not null,
  created_at timestamptz not null default now()
);

-- To-do items
create table public.todo_items (
  id uuid primary key default uuid_generate_v4(),
  todo_list_id uuid not null references public.todo_lists(id) on delete cascade,
  title text not null,
  assigned_to uuid references public.users(id) on delete set null,
  due_date date,
  is_recurring boolean not null default false,
  recurrence_rule text,
  completed boolean not null default false,
  created_at timestamptz not null default now()
);

-- ============================================================
-- INDEXES
-- ============================================================

create index idx_recipes_household on public.recipes(household_id);
create index idx_recipes_tags on public.recipes using gin(tags);
create index idx_recipes_favorite on public.recipes(household_id, is_favorite) where is_favorite = true;
create index idx_meal_plan_slots_plan on public.meal_plan_slots(meal_plan_id);
create index idx_grocery_items_list on public.grocery_items(grocery_list_id);
create index idx_todo_items_list on public.todo_items(todo_list_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.households enable row level security;
alter table public.users enable row level security;
alter table public.household_members enable row level security;
alter table public.household_settings enable row level security;
alter table public.recipes enable row level security;
alter table public.meal_plans enable row level security;
alter table public.meal_plan_slots enable row level security;
alter table public.grocery_lists enable row level security;
alter table public.grocery_items enable row level security;
alter table public.pantry_staples enable row level security;
alter table public.calendar_connections enable row level security;
alter table public.todo_lists enable row level security;
alter table public.todo_items enable row level security;

-- Helper: check if user belongs to a household
create or replace function public.user_household_ids(uid uuid)
returns setof uuid
language sql
security definer
stable
as $$
  select household_id from public.household_members where user_id = uid;
$$;

-- Users: can read own profile + household members
create policy "Users can read own profile"
  on public.users for select
  using (id = auth.uid());

create policy "Users can read household members"
  on public.users for select
  using (id in (
    select user_id from public.household_members
    where household_id in (select public.user_household_ids(auth.uid()))
  ));

create policy "Users can update own profile"
  on public.users for update
  using (id = auth.uid());

-- Households: members can read their households
create policy "Members can read household"
  on public.households for select
  using (id in (select public.user_household_ids(auth.uid())));

create policy "Authenticated users can create households"
  on public.households for insert
  with check (auth.uid() is not null);

-- Household members: read own memberships
create policy "Members can read memberships"
  on public.household_members for select
  using (household_id in (select public.user_household_ids(auth.uid())));

create policy "Owners can manage members"
  on public.household_members for all
  using (
    household_id in (
      select household_id from public.household_members
      where user_id = auth.uid() and role = 'owner'
    )
  );

-- Household settings: members can read, owners can write
create policy "Members can read settings"
  on public.household_settings for select
  using (household_id in (select public.user_household_ids(auth.uid())));

create policy "Owners can manage settings"
  on public.household_settings for all
  using (
    household_id in (
      select household_id from public.household_members
      where user_id = auth.uid() and role = 'owner'
    )
  );

-- Recipes: household-scoped CRUD
create policy "Members can read recipes"
  on public.recipes for select
  using (household_id in (select public.user_household_ids(auth.uid())));

create policy "Members can create recipes"
  on public.recipes for insert
  with check (household_id in (select public.user_household_ids(auth.uid())));

create policy "Members can update recipes"
  on public.recipes for update
  using (household_id in (select public.user_household_ids(auth.uid())));

create policy "Members can delete recipes"
  on public.recipes for delete
  using (household_id in (select public.user_household_ids(auth.uid())));

-- Meal plans: household-scoped
create policy "Members can manage meal plans"
  on public.meal_plans for all
  using (household_id in (select public.user_household_ids(auth.uid())));

create policy "Members can manage meal plan slots"
  on public.meal_plan_slots for all
  using (
    meal_plan_id in (
      select id from public.meal_plans
      where household_id in (select public.user_household_ids(auth.uid()))
    )
  );

-- Grocery: household-scoped
create policy "Members can manage grocery lists"
  on public.grocery_lists for all
  using (household_id in (select public.user_household_ids(auth.uid())));

create policy "Members can manage grocery items"
  on public.grocery_items for all
  using (
    grocery_list_id in (
      select id from public.grocery_lists
      where household_id in (select public.user_household_ids(auth.uid()))
    )
  );

create policy "Members can manage pantry staples"
  on public.pantry_staples for all
  using (household_id in (select public.user_household_ids(auth.uid())));

-- Calendar: user owns their own connections
create policy "Users manage own calendar connections"
  on public.calendar_connections for all
  using (user_id = auth.uid());

-- Todos: household-scoped
create policy "Members can manage todo lists"
  on public.todo_lists for all
  using (household_id in (select public.user_household_ids(auth.uid())));

create policy "Members can manage todo items"
  on public.todo_items for all
  using (
    todo_list_id in (
      select id from public.todo_lists
      where household_id in (select public.user_household_ids(auth.uid()))
    )
  );

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Auto-create user profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.users (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Auto-update updated_at on recipes
create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace trigger recipes_updated_at
  before update on public.recipes
  for each row execute function public.update_updated_at();

-- ============================================================
-- PHASE 2 ADDITIONS
-- ============================================================

-- Extend recipe source_type for Spoonacular imports
ALTER TABLE public.recipes DROP CONSTRAINT IF EXISTS recipes_source_type_check;
ALTER TABLE public.recipes ADD CONSTRAINT recipes_source_type_check
  CHECK (source_type IN ('manual', 'url', 'video', 'image', 'spoonacular'));

-- Track Spoonacular recipe origin (prevent duplicate imports per household)
ALTER TABLE public.recipes ADD COLUMN IF NOT EXISTS spoonacular_id integer;
CREATE UNIQUE INDEX IF NOT EXISTS idx_recipes_spoonacular_id
  ON public.recipes(household_id, spoonacular_id) WHERE spoonacular_id IS NOT NULL;

-- Meal plan templates
CREATE TABLE public.meal_plan_templates (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id uuid NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_by uuid NOT NULL REFERENCES public.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.meal_plan_template_slots (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id uuid NOT NULL REFERENCES public.meal_plan_templates(id) ON DELETE CASCADE,
  recipe_id uuid NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  day_of_week integer NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  meal_type text NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack'))
);

CREATE INDEX idx_template_slots_template ON public.meal_plan_template_slots(template_id);

ALTER TABLE public.meal_plan_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plan_template_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can manage meal plan templates"
  ON public.meal_plan_templates FOR ALL
  USING (household_id IN (SELECT public.user_household_ids(auth.uid())));

CREATE POLICY "Members can manage template slots"
  ON public.meal_plan_template_slots FOR ALL
  USING (template_id IN (
    SELECT id FROM public.meal_plan_templates
    WHERE household_id IN (SELECT public.user_household_ids(auth.uid()))
  ));
