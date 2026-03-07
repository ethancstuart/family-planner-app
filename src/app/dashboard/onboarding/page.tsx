"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChefHat } from "lucide-react";

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

    if (!user) return;

    // Create household
    const { data: household, error: hError } = await supabase
      .from("households")
      .insert({ name: name.trim() })
      .select()
      .single();

    if (hError || !household) {
      setLoading(false);
      return;
    }

    // Add creator as owner
    await supabase.from("household_members").insert({
      household_id: household.id,
      user_id: user.id,
      role: "owner",
    });

    // Create default household settings
    await supabase.from("household_settings").insert({
      household_id: household.id,
    });

    router.push("/dashboard");
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <form onSubmit={handleCreate} className="w-full max-w-sm space-y-6">
        <div className="space-y-2 text-center">
          <ChefHat className="mx-auto h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold">Create your household</h1>
          <p className="text-sm text-muted-foreground">
            Give your household a name. You can invite family members later.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Household name</Label>
          <Input
            id="name"
            placeholder="e.g. The Stuarts"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Creating..." : "Create household"}
        </Button>
      </form>
    </div>
  );
}
