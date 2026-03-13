"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link2, Copy, Loader2, Trash2, UserPlus } from "lucide-react";

interface Invitation {
  id: string;
  token: string;
  expires_at: string;
  created_at: string;
}

export function InviteSection() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [loadingList, setLoadingList] = useState(true);

  const fetchInvitations = async () => {
    try {
      const res = await fetch("/api/household/invite");
      if (res.ok) {
        const data = await res.json();
        setInvitations(data.invitations);
      }
    } catch {
      // silently fail
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, []);

  const handleCreate = async () => {
    setCreating(true);
    try {
      const res = await fetch("/api/household/invite", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to create invite");
        return;
      }

      setGeneratedUrl(data.invite_url);
      fetchInvitations();
      toast.success("Invite link created");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setCreating(false);
    }
  };

  const handleCopy = async () => {
    if (!generatedUrl) return;
    try {
      await navigator.clipboard.writeText(generatedUrl);
      toast.success("Link copied to clipboard");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleRevoke = async (id: string) => {
    try {
      const res = await fetch("/api/household/invite", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) {
        toast.error("Failed to revoke invitation");
        return;
      }

      setInvitations((prev) => prev.filter((inv) => inv.id !== id));
      toast.success("Invitation revoked");
    } catch {
      toast.error("Something went wrong");
    }
  };

  const formatExpiry = (expiresAt: string) => {
    const diff = new Date(expiresAt).getTime() - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days <= 0) return "Expired";
    if (days === 1) return "Expires in 1 day";
    return `Expires in ${days} days`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <UserPlus className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-lg font-semibold">Invite Members</h2>
      </div>
      <p className="text-sm text-muted-foreground">
        Generate a shareable invite link. Anyone with the link can join your
        household. Links expire after 7 days.
      </p>

      <Button onClick={handleCreate} disabled={creating} variant="outline">
        {creating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating...
          </>
        ) : (
          <>
            <Link2 className="mr-2 h-4 w-4" />
            Generate Invite Link
          </>
        )}
      </Button>

      {generatedUrl && (
        <div className="flex gap-2">
          <Input value={generatedUrl} readOnly className="text-xs" />
          <Button onClick={handleCopy} variant="outline" size="icon">
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      )}

      {!loadingList && invitations.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            Active invitations
          </p>
          {invitations.map((inv) => (
            <div
              key={inv.id}
              className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3"
            >
              <div>
                <p className="text-xs font-mono text-muted-foreground">
                  ...{inv.token.slice(-8)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatExpiry(inv.expires_at)}
                </p>
              </div>
              <Button
                onClick={() => handleRevoke(inv.id)}
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
