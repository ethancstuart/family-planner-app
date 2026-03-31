-- Family Mode Migration
-- Run this in your Supabase SQL Editor to convert from multi-tenant SaaS to personal family tool.
-- This disables RLS and creates a default household + user for the family.

-- ============================================================
-- 1. Create the family household and user
-- ============================================================

-- Insert a family household (use a fixed UUID so the app code matches)
INSERT INTO public.households (id, name)
VALUES ('00000000-0000-0000-0000-000000000001', 'Stuart Family')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 2. Disable RLS on all tables (personal family tool, no multi-tenant needed)
-- ============================================================

ALTER TABLE public.households DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.household_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.household_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plans DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plan_slots DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.grocery_lists DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.grocery_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.pantry_staples DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_connections DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.todo_lists DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.todo_items DISABLE ROW LEVEL SECURITY;

-- Also disable on template tables if they exist
ALTER TABLE IF EXISTS public.meal_plan_templates DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.meal_plan_template_slots DISABLE ROW LEVEL SECURITY;

-- ============================================================
-- 3. Make household_id and created_by columns have defaults
--    so we don't need to pass them from the client
-- ============================================================

-- Set default household_id to the family household
ALTER TABLE public.recipes ALTER COLUMN household_id SET DEFAULT '00000000-0000-0000-0000-000000000001';
ALTER TABLE public.meal_plans ALTER COLUMN household_id SET DEFAULT '00000000-0000-0000-0000-000000000001';
ALTER TABLE public.grocery_lists ALTER COLUMN household_id SET DEFAULT '00000000-0000-0000-0000-000000000001';
ALTER TABLE public.todo_lists ALTER COLUMN household_id SET DEFAULT '00000000-0000-0000-0000-000000000001';
ALTER TABLE public.pantry_staples ALTER COLUMN household_id SET DEFAULT '00000000-0000-0000-0000-000000000001';

-- Make created_by nullable on recipes (no auth = no user ID)
ALTER TABLE public.recipes ALTER COLUMN created_by DROP NOT NULL;

-- Make created_by nullable on templates if the table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'meal_plan_templates') THEN
    ALTER TABLE public.meal_plan_templates ALTER COLUMN created_by DROP NOT NULL;
  END IF;
END $$;

-- ============================================================
-- 4. Grant public access via anon role (no auth needed)
-- ============================================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon;

-- Grant all operations on all tables to anon role
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Ensure future tables also get these grants
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;

-- ============================================================
-- Done! Your family planner is now in personal mode.
-- ============================================================
