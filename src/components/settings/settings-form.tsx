"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, UserPlus } from "lucide-react";

interface SettingsFormProps {
  householdId: string;
  householdName: string;
  settings: {
    claude_api_key_encrypted: string | null;
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
  const [saved, setSaved] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");

  const handleSaveApiKey = async () => {
    setSaving(true);
    const supabase = createClient();

    if (settings) {
      await supabase
        .from("household_settings")
        .update({ claude_api_key_encrypted: apiKey.trim() || null })
        .eq("household_id", householdId);
    } else {
      await supabase.from("household_settings").insert({
        household_id: householdId,
        claude_api_key_encrypted: apiKey.trim() || null,
      });
    }

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    router.refresh();
  };

  return (
    <div className="space-y-8">
      {/* Household */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Household</h2>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="font-medium">{householdName}</p>
          <p className="text-sm text-muted-foreground">
            {members.length} member{members.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="space-y-2">
          {members.map((m) => (
            <div
              key={m.user_id}
              className="flex items-center justify-between rounded-md border border-border px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium">
                  {(m.users as { full_name: string | null })?.full_name ?? (m.users as { email: string })?.email}
                </p>
                <p className="text-xs text-muted-foreground">
                  {(m.users as { email: string })?.email}
                </p>
              </div>
              <Badge variant="secondary">{m.role}</Badge>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Claude API Key */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Claude API Key</h2>
          <p className="text-sm text-muted-foreground">
            Required for AI recipe import (URL, video, image). Your key is
            stored in the database and used server-side only. All household
            members share this key.
          </p>
        </div>

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
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showKey ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            <Button
              onClick={handleSaveApiKey}
              disabled={saving || !isOwner}
            >
              {saved ? "Saved!" : saving ? "Saving..." : "Save"}
            </Button>
          </div>
          {!isOwner && (
            <p className="text-xs text-muted-foreground">
              Only the household owner can update the API key.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
