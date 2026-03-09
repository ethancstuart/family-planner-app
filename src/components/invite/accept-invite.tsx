"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Users, Loader2 } from "lucide-react";

interface AcceptInviteProps {
  token: string;
  householdName: string;
  inviterName: string;
  isAuthenticated: boolean;
  hasHousehold: boolean;
}

export function AcceptInvite({
  token,
  householdName,
  inviterName,
  isAuthenticated,
  hasHousehold,
}: AcceptInviteProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/invite/${token}`,
      },
    });
  };

  const handleAccept = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/household/invite/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to join household");
        setLoading(false);
        return;
      }

      toast.success(`Welcome to ${householdName}!`);
      router.push("/dashboard");
    } catch {
      toast.error("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div className="w-full max-w-sm space-y-6 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <Users className="h-7 w-7 text-primary" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">
            Join {householdName}
          </h1>
          <p className="text-sm text-muted-foreground">
            {inviterName} invited you to join their household. Sign in with
            Google to continue.
          </p>
        </div>
        <Button onClick={handleSignIn} className="w-full" size="lg">
          Sign in with Google to join
        </Button>
      </div>
    );
  }

  // Authenticated but already in a household
  if (hasHousehold) {
    return (
      <div className="w-full max-w-sm space-y-6 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
          <Users className="h-7 w-7 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">
            Already in a Household
          </h1>
          <p className="text-sm text-muted-foreground">
            You already belong to a household. You must leave your current
            household before joining another.
          </p>
        </div>
        <Button
          onClick={() => router.push("/dashboard")}
          variant="outline"
          className="w-full"
          size="lg"
        >
          Go to Dashboard
        </Button>
      </div>
    );
  }

  // Authenticated, no household — can accept
  return (
    <div className="w-full max-w-sm space-y-6 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
        <Users className="h-7 w-7 text-primary" />
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">
          Join {householdName}
        </h1>
        <p className="text-sm text-muted-foreground">
          {inviterName} invited you to join their household.
        </p>
      </div>
      <Button
        onClick={handleAccept}
        className="w-full"
        size="lg"
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Joining...
          </>
        ) : (
          `Join ${householdName}`
        )}
      </Button>
    </div>
  );
}
