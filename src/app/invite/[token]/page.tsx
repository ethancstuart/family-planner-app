import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { AcceptInvite } from "@/components/invite/accept-invite";

export const metadata: Metadata = { title: "Join Household" };

interface InvitePageProps {
  params: Promise<{ token: string }>;
}

export default async function InvitePage({ params }: InvitePageProps) {
  const { token } = await params;
  const adminClient = createAdminClient();

  // Look up invitation with household name and inviter name
  const { data: invitation } = await adminClient
    .from("household_invitations")
    .select(
      "id, token, household_id, expires_at, used_by, created_by, households(name), users!household_invitations_created_by_fkey(full_name)"
    )
    .eq("token", token)
    .single();

  if (!invitation) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-sm space-y-4 text-center">
          <h1 className="text-2xl font-bold">Invalid Invite Link</h1>
          <p className="text-sm text-muted-foreground">
            This invite link is not valid. Please ask for a new one.
          </p>
        </div>
      </div>
    );
  }

  if (invitation.used_by) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-sm space-y-4 text-center">
          <h1 className="text-2xl font-bold">Invite Already Used</h1>
          <p className="text-sm text-muted-foreground">
            This invite link has already been used.
          </p>
        </div>
      </div>
    );
  }

  if (new Date(invitation.expires_at) < new Date()) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-sm space-y-4 text-center">
          <h1 className="text-2xl font-bold">Invite Expired</h1>
          <p className="text-sm text-muted-foreground">
            This invite link has expired. Please ask for a new one.
          </p>
        </div>
      </div>
    );
  }

  // Check if current user is authenticated and has a household
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let hasHousehold = false;
  if (user) {
    const { data: membership } = await supabase
      .from("household_members")
      .select("household_id")
      .eq("user_id", user.id)
      .limit(1)
      .single();
    hasHousehold = !!membership;
  }

  const householdName =
    (invitation.households as unknown as { name: string })?.name ?? "a household";
  const inviterName =
    (invitation.users as unknown as { full_name: string | null })?.full_name ?? "Someone";

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <AcceptInvite
        token={token}
        householdName={householdName}
        inviterName={inviterName}
        isAuthenticated={!!user}
        hasHousehold={hasHousehold}
      />
    </div>
  );
}
