"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, Shield, Users, Compass } from "lucide-react";
import { InviteSection } from "@/components/settings/invite-section";

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
}

export function SettingsForm({
  householdId,
  householdName,
  settings,
  members,
  isOwner,
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
    <div className="space-y-8">
      {/* Household */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Household</h2>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
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
      </div>

      {isOwner && (
        <>
          <Separator />
          <InviteSection />
        </>
      )}

      <Separator />

      {/* Claude API Key */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Claude API Key</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Powers AI recipe import from URLs, videos, and photos. Your key is
          stored securely and only used server-side. All household members share
          this key.
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

      <Separator />

      {/* Spoonacular API Key */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Compass className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Spoonacular API Key</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Powers recipe discovery. Get a free API key at{" "}
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
    </div>
  );
}
