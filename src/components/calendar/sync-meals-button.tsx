"use client";

import { useState } from "react";
import { CalendarPlus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface SyncMealsButtonProps {
  mealPlanId: string;
  weekStartDate: string;
}

export function SyncMealsButton({
  mealPlanId,
  weekStartDate,
}: SyncMealsButtonProps) {
  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch("/api/calendar/sync-meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meal_plan_id: mealPlanId,
          week_start_date: weekStartDate,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        toast.success(`${data.synced} meal${data.synced !== 1 ? "s" : ""} synced to Google Calendar`);
      } else {
        const data = await res.json();
        toast.error(data.error ?? "Failed to sync meals");
      }
    } catch {
      toast.error("Failed to sync meals");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleSync} disabled={syncing}>
      {syncing ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Syncing...
        </>
      ) : (
        <>
          <CalendarPlus className="mr-2 h-4 w-4" />
          Sync to Calendar
        </>
      )}
    </Button>
  );
}
