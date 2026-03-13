"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShoppingCart, CalendarDays, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface CreateListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  householdId: string;
  mealPlans: { id: string; week_start_date: string }[];
}

export function CreateListDialog({
  open,
  onOpenChange,
  householdId,
  mealPlans,
}: CreateListDialogProps) {
  const router = useRouter();
  const [mode, setMode] = useState<"choose" | "blank" | "generate">("choose");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  const resetAndClose = () => {
    setMode("choose");
    setTitle("");
    onOpenChange(false);
  };

  const handleCreateBlank = async () => {
    if (!title.trim()) return;
    setLoading(true);

    const supabase = createClient();
    const { data, error } = await supabase
      .from("grocery_lists")
      .insert({
        household_id: householdId,
        title: title.trim(),
      })
      .select()
      .single();

    if (error) {
      toast.error("Failed to create list");
      setLoading(false);
    } else {
      resetAndClose();
      router.push(`/grocery/${data.id}`);
    }
  };

  const handleGenerate = async (mealPlanId: string) => {
    setLoading(true);

    const res = await fetch("/api/grocery/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ meal_plan_id: mealPlanId }),
    });

    if (!res.ok) {
      const err = await res.json();
      toast.error(err.error || "Failed to generate list");
      setLoading(false);
    } else {
      const { grocery_list } = await res.json();
      resetAndClose();
      router.push(`/grocery/${grocery_list.id}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={resetAndClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Grocery List</DialogTitle>
          <DialogDescription>
            {mode === "choose"
              ? "Start from scratch or generate from a meal plan."
              : mode === "blank"
                ? "Give your list a name."
                : "Pick a meal plan to generate items from."}
          </DialogDescription>
        </DialogHeader>

        {mode === "choose" && (
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              onClick={() => setMode("blank")}
              className="flex flex-col items-center gap-3 rounded-xl border border-border p-6 text-center transition-colors hover:border-primary/30 hover:bg-primary/5"
            >
              <ShoppingCart className="h-8 w-8 text-primary" />
              <div>
                <p className="font-medium">Blank List</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Add items manually
                </p>
              </div>
            </button>
            <button
              onClick={() => setMode("generate")}
              disabled={mealPlans.length === 0}
              className="flex flex-col items-center gap-3 rounded-xl border border-border p-6 text-center transition-colors hover:border-primary/30 hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <CalendarDays className="h-8 w-8 text-primary" />
              <div>
                <p className="font-medium">From Meal Plan</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {mealPlans.length === 0
                    ? "No meal plans yet"
                    : "Auto-merge ingredients"}
                </p>
              </div>
            </button>
          </div>
        )}

        {mode === "blank" && (
          <>
            <Input
              aria-label="List name"
              placeholder="e.g., Weekly groceries"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleCreateBlank()}
            />
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setMode("choose")}
                disabled={loading}
              >
                Back
              </Button>
              <Button
                onClick={handleCreateBlank}
                disabled={!title.trim() || loading}
              >
                {loading && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
                Create
              </Button>
            </DialogFooter>
          </>
        )}

        {mode === "generate" && (
          <>
            <div className="max-h-[250px] space-y-1 overflow-y-auto">
              {mealPlans.map((plan) => {
                const date = new Date(plan.week_start_date + "T00:00:00");
                const label = `Week of ${date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;

                return (
                  <button
                    key={plan.id}
                    onClick={() => handleGenerate(plan.id)}
                    disabled={loading}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-muted disabled:opacity-50"
                  >
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{label}</span>
                  </button>
                );
              })}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setMode("choose")}
                disabled={loading}
              >
                Back
              </Button>
              {loading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </div>
              )}
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
