"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChefHat, ArrowRight, Loader2 } from "lucide-react";

export default function OnboardingPage() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const router = useRouter();

  // Check auth on mount
  useEffect(() => {
    const check = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/");
        return;
      }

      setUserEmail(user.email ?? null);

      // Check if already has a household
      const { data: membership } = await supabase
        .from("household_members")
        .select("household_id")
        .eq("user_id", user.id)
        .limit(1)
        .single();

      if (membership) {
        router.push("/dashboard");
        return;
      }

      setChecking(false);
    };
    check();
  }, [router]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error("You need to be signed in");
      router.push("/");
      return;
    }

    // Debug: verify session
    const { data: sessionData } = await supabase.auth.getSession();
    console.log("Session:", sessionData.session ? "exists" : "missing");
    console.log("User ID:", user.id);
    console.log("Access token:", sessionData.session?.access_token ? "present" : "missing");

    // Step 1: Create household
    const { data: household, error: hError } = await supabase
      .from("households")
      .insert({ name: name.trim() })
      .select()
      .single();

    if (hError || !household) {
      setLoading(false);
      toast.error(`Could not create household: ${hError?.message ?? "Unknown error"}`);
      console.error("Household creation error:", hError);
      console.error("Session at time of error:", sessionData.session ? "valid" : "null");
      return;
    }

    // Step 2: Add self as owner
    const { error: mError } = await supabase
      .from("household_members")
      .insert({
        household_id: household.id,
        user_id: user.id,
        role: "owner",
      });

    if (mError) {
      setLoading(false);
      toast.error(`Could not join household: ${mError.message}`);
      console.error("Membership creation error:", mError);
      return;
    }

    // Step 3: Create settings
    const { error: sError } = await supabase
      .from("household_settings")
      .insert({ household_id: household.id });

    if (sError) {
      console.error("Settings creation error (non-blocking):", sError);
    }

    toast.success("Household created!");
    router.push("/dashboard");
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <form onSubmit={handleCreate} className="w-full max-w-sm space-y-6">
        <div className="space-y-3 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <ChefHat className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Name your household
          </h1>
          <p className="text-sm text-muted-foreground">
            This is your family&apos;s shared space for recipes, meals, and
            lists. You can invite others later.
          </p>
          {userEmail && (
            <p className="text-xs text-muted-foreground">
              Signed in as {userEmail}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Household name</Label>
          <Input
            id="name"
            placeholder='e.g. "The Stuarts" or "Home"'
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            required
          />
        </div>

        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              Create household
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>

        <button
          type="button"
          onClick={handleSignOut}
          className="block w-full text-center text-sm text-muted-foreground hover:text-foreground"
        >
          Sign out
        </button>
      </form>
    </div>
  );
}
