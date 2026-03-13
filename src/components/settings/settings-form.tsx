"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, Shield, Users, Compass, Calendar } from "lucide-react";
import { InviteSection } from "@/components/settings/invite-section";
import { CalendarConnectionBanner } from "@/components/calendar/calendar-connection-banner";

interface SettingsFormProps {
  householdId: string;
  householdName: string;
  settings: {
    claude_api_key_encrypted: string | null;
    spoonacular_api_key: string | null;
    default_servings: number;
  } | null;
  members: Array<{
    user_id: string;
    role: string;
    users: { email: string; full_name: string | null } | null;
  }>;
  isOwner: boolean;
  isCalendarConnected?: boolean;
}

export function SettingsForm({
  householdId,
  householdName,
  settings,
  members,
  isOwner,
  isCalendarConnected,
}: SettingsFormProps) {
  const router = useRouter();
  const [apiKey, setApiKey] = useState(settings?.claude_api_key_encrypted ?? "");
  const [showKey, setShowKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [spoonacularKey, setSpoonacularKey] = useState(settings?.spoonacular_api_key ?? "");
  const [showSpoonacularKey, setShowSpoonacularKey] = useState(false);
  const [savingSpoonacular, setSavingSpoonacular] = useState(false);

  const handleSaveApiKey = async () => {
    setSaving(true);
    const supabase = createClient();

    const { error } = settings
      ? await supabase
          .from("household_settings")
          .update({ claude_api_key_encrypted: apiKey.trim() || null })
          .eq("household_id", householdId)
      : await supabase.from("household_settings").insert({
          household_id: householdId,
          claude_api_key_encrypted: apiKey.trim() || null,
        });

    setSaving(false);
    if (error) {
      toast.error("Failed to save API key");
    } else {
      toast.success("API key saved");
      router.refresh();
    }
  };

  return (
    <div className="space-y-6">
      {/* Household */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Household</h2>
            <p className="text-sm text-muted-foreground">Manage your household and members</p>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-lg font-semibold">{householdName}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {members.length} member{members.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="space-y-2">
          {members.map((m) => (
            <div
              key={m.user_id}
              className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium">
                  {(m.users as { full_name: string | null })?.full_name ??
                    (m.users as { email: string })?.email}
                </p>
                <p className="text-xs text-muted-foreground">
                  {(m.users as { email: string })?.email}
                </p>
              </div>
              <Badge variant={m.role === "owner" ? "default" : "secondary"}>
                {m.role}
              </Badge>
            </div>
          ))}
        </div>

        {isOwner && <InviteSection />}
      </div>

      {/* Claude API Key */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Claude API Key</h2>
            <p className="text-sm text-muted-foreground">Powers AI recipe import</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Your key is stored securely and only used server-side. All household members share this key.
        </p>

        <div className="space-y-2">
          <Label htmlFor="api-key">API Key</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                id="api-key"
                type={showKey ? "text" : "password"}
                placeholder="sk-ant-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                disabled={!isOwner}
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-sm p-0.5 text-muted-foreground transition-colors hover:text-foreground"
                aria-label={showKey ? "Hide API key" : "Show API key"}
              >
                {showKey ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            <Button onClick={handleSaveApiKey} disabled={saving || !isOwner}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
          {!isOwner && (
            <p className="text-xs text-muted-foreground">
              Only the household owner can update the API key.
            </p>
          )}
        </div>
      </div>

      {/* Spoonacular API Key */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Compass className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Spoonacular API Key</h2>
            <p className="text-sm text-muted-foreground">Powers recipe discovery</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Get a free API key at{" "}
          <a href="https://spoonacular.com/food-api" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            spoonacular.com
          </a>.
        </p>

        <div className="space-y-2">
          <Label htmlFor="spoonacular-key">API Key</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                id="spoonacular-key"
                type={showSpoonacularKey ? "text" : "password"}
                placeholder="Your Spoonacular API key"
                value={spoonacularKey}
                onChange={(e) => setSpoonacularKey(e.target.value)}
                disabled={!isOwner}
              />
              <button
                type="button"
                onClick={() => setShowSpoonacularKey(!showSpoonacularKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-sm p-0.5 text-muted-foreground transition-colors hover:text-foreground"
                aria-label={showSpoonacularKey ? "Hide API key" : "Show API key"}
              >
                {showSpoonacularKey ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            <Button
              onClick={async () => {
                setSavingSpoonacular(true);
                const supabase = createClient();
                const { error } = settings
                  ? await supabase
                      .from("household_settings")
                      .update({ spoonacular_api_key: spoonacularKey.trim() || null })
                      .eq("household_id", householdId)
                  : await supabase.from("household_settings").insert({
                      household_id: householdId,
                      spoonacular_api_key: spoonacularKey.trim() || null,
                    });
                setSavingSpoonacular(false);
                if (error) {
                  toast.error("Failed to save API key");
                } else {
                  toast.success("Spoonacular API key saved");
                  router.refresh();
                }
              }}
              disabled={savingSpoonacular || !isOwner}
            >
              {savingSpoonacular ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </div>

      {/* Google Calendar */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Google Calendar</h2>
              <p className="text-sm text-muted-foreground">Sync your schedule with meal plans</p>
            </div>
          </div>
          <Badge variant={isCalendarConnected ? "default" : "secondary"}>
            {isCalendarConnected ? "Connected" : "Not connected"}
          </Badge>
        </div>
        <CalendarConnectionBanner isConnected={isCalendarConnected ?? false} />
      </div>
    </div>
  );
}
