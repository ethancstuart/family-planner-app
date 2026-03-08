-- Fix: Allow users to add themselves as owner of a household
-- The original "Owners can manage members" policy creates a circular dependency
-- during onboarding: you can't become an owner until you're already an owner.

-- Add policy: users can insert themselves into a household as owner
create policy "Users can add themselves as owner"
  on public.household_members for insert
  with check (
    user_id = auth.uid()
    and role = 'owner'
  );

-- Also allow users to insert their own household_settings during onboarding
create policy "Members can insert settings"
  on public.household_settings for insert
  with check (
    household_id in (select public.user_household_ids(auth.uid()))
  );
