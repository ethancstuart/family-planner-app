-- Household Invitations table
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS household_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  token text UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,
  created_by uuid NOT NULL REFERENCES users(id),
  expires_at timestamptz NOT NULL DEFAULT now() + interval '7 days',
  used_by uuid REFERENCES users(id),
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index on token for fast lookups
CREATE INDEX IF NOT EXISTS idx_household_invitations_token ON household_invitations(token);

-- RLS
ALTER TABLE household_invitations ENABLE ROW LEVEL SECURITY;

-- Owners can manage invitations for their household
CREATE POLICY "Owners can manage invitations"
  ON household_invitations
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM household_members
      WHERE household_members.household_id = household_invitations.household_id
        AND household_members.user_id = auth.uid()
        AND household_members.role = 'owner'
    )
  );

-- Any authenticated user can look up an invitation by token (needed for accept flow)
CREATE POLICY "Authenticated users can view invitations by token"
  ON household_invitations
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Allow users to join a household as member via invite
CREATE POLICY "Users can add themselves as member via invite"
  ON household_members
  FOR INSERT
  WITH CHECK (user_id = auth.uid() AND role = 'member');
