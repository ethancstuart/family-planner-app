import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { Shield, ChefHat, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  const hasClaudeKey = !!process.env.CLAUDE_API_KEY;

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Family Planner configuration.
          </p>
        </div>

        {/* Family info */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <ChefHat className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Stuart Family</h2>
              <p className="text-sm text-muted-foreground">Personal family planner</p>
            </div>
          </div>
        </div>

        {/* Claude API Key Status */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold">Claude API Key</h2>
              <p className="text-sm text-muted-foreground">Powers AI recipe import</p>
            </div>
            <Badge variant={hasClaudeKey ? "default" : "secondary"}>
              {hasClaudeKey ? "Configured" : "Not set"}
            </Badge>
          </div>

          <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/50 p-4">
            <Info className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground" />
            <div className="text-sm text-muted-foreground space-y-1">
              {hasClaudeKey ? (
                <p>Your Claude API key is configured via environment variables. AI recipe extraction is active.</p>
              ) : (
                <>
                  <p>Add your Claude API key to <code className="rounded bg-muted px-1 py-0.5 text-xs font-mono">.env.local</code>:</p>
                  <code className="block rounded bg-muted px-2 py-1 text-xs font-mono">CLAUDE_API_KEY=sk-ant-...</code>
                </>
              )}
            </div>
          </div>
        </div>

        {/* PIN info */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Lock Screen PIN</h2>
              <p className="text-sm text-muted-foreground">Simple PIN gate for family access</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/50 p-4">
            <Info className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              The PIN is hardcoded in the source code. To change it, update the PIN value in{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-xs font-mono">src/middleware.ts</code> and{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-xs font-mono">src/app/api/auth/pin/route.ts</code>.
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
