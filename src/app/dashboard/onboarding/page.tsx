"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChefHat, ArrowRight } from "lucide-react";

export default function OnboardingPage() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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

    const { data: household, error: hError } = await supabase
      .from("households")
      .insert({ name: name.trim() })
      .select()
      .single();

    if (hError || !household) {
      setLoading(false);
      toast.error("Could not create household. Please try again.");
      return;
    }

    const { error: mError } = await supabase
      .from("household_members")
      .insert({
        household_id: household.id,
        user_id: user.id,
        role: "owner",
      });

    if (mError) {
      setLoading(false);
      toast.error("Could not join household. Please try again.");
      return;
    }

    await supabase.from("household_settings").insert({
      household_id: household.id,
    });

    toast.success("Household created!");
    router.push("/dashboard");
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  };

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
            "Creating..."
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
