import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { SettingsForm } from "@/components/settings/settings-form";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/");

  const { data: membership } = await supabase
    .from("household_members")
    .select("household_id, role, households(id, name)")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (!membership) redirect("/dashboard/onboarding");

  const { data: settings } = await supabase
    .from("household_settings")
    .select("*")
    .eq("household_id", membership.household_id)
    .single();

  const { data: members } = await supabase
    .from("household_members")
    .select("user_id, role, users(email, full_name)")
    .eq("household_id", membership.household_id);

  const { data: calConnection } = await supabase
    .from("calendar_connections")
    .select("id")
    .eq("user_id", user.id)
    .single();

  return (
    <AppShell user={user}>
      <div className="mx-auto max-w-2xl space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your household and API keys.
          </p>
        </div>

        <SettingsForm
          householdId={membership.household_id}
          householdName={(membership.households as unknown as { name: string })?.name ?? ""}
          settings={settings}
          members={(members ?? []) as unknown as Parameters<typeof SettingsForm>[0]["members"]}
          isOwner={membership.role === "owner"}
          isCalendarConnected={!!calConnection}
        />
      </div>
    </AppShell>
  );
}
