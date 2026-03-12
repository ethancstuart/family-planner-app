"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CalendarConnectionBanner } from "./calendar-connection-banner";
import { CalendarWeekView } from "./calendar-week-view";
import { SyncMealsButton } from "./sync-meals-button";
import { parseDate, formatDate } from "@/lib/utils";
import type { CalendarEvent, MealPlanSlot, MealType } from "@/types";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface CalendarHubProps {
  isConnected: boolean;
  weekStart: string;
  mealPlanSlots: MealPlanSlot[];
  mealPlanId?: string;
}

export function CalendarHub({
  isConnected,
  weekStart,
  mealPlanSlots,
  mealPlanId,
}: CalendarHubProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [googleEvents, setGoogleEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const connectedParam = searchParams.get("connected");

  const weekDate = parseDate(weekStart);
  const endDate = new Date(weekDate);
  endDate.setDate(endDate.getDate() + 7);

  const weekLabel = weekDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  }) +
    " – " +
    new Date(endDate.getTime() - 86400000).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const fetchGoogleEvents = useCallback(async () => {
    if (!isConnected) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/calendar/events?start=${weekStart}&end=${formatDate(endDate)}`
      );
      if (res.ok) {
        const data = await res.json();
        const mapped: CalendarEvent[] = (data.events ?? []).map(
          (e: { id: string; title: string; start: string; end: string; allDay: boolean; color?: string }) => ({
            ...e,
            source: "google" as const,
          })
        );
        setGoogleEvents(mapped);
      }
    } catch {
      // Silently fail — events just won't show
    } finally {
      setLoading(false);
    }
  }, [isConnected, weekStart]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchGoogleEvents();
  }, [fetchGoogleEvents]);

  // Build meal plan events
  const mealPlanEvents: CalendarEvent[] = mealPlanSlots
    .filter((s) => s.recipe)
    .map((slot) => {
      const mealTimes: Record<MealType, number> = {
        breakfast: 8,
        lunch: 12,
        dinner: 18,
        snack: 15,
      };
      const d = new Date(weekDate);
      d.setDate(d.getDate() + slot.day_of_week);
      const hour = mealTimes[slot.meal_type];
      d.setHours(hour, 0, 0, 0);
      const end = new Date(d);
      end.setHours(end.getHours() + 1);

      const labels: Record<MealType, string> = {
        breakfast: "Breakfast",
        lunch: "Lunch",
        dinner: "Dinner",
        snack: "Snack",
      };

      return {
        id: slot.id,
        title: `${labels[slot.meal_type]}: ${slot.recipe!.title}`,
        start: d.toISOString(),
        end: end.toISOString(),
        allDay: false,
        source: "meal-plan" as const,
        recipeId: slot.recipe_id,
        mealType: slot.meal_type,
      };
    });

  const allEvents = [...googleEvents, ...mealPlanEvents];

  // Group events by day of week
  const eventsByDay: CalendarEvent[][] = Array.from({ length: 7 }, (_, i) => {
    const dayDate = new Date(weekDate);
    dayDate.setDate(dayDate.getDate() + i);
    const dayStr = formatDate(dayDate);

    return allEvents
      .filter((e) => {
        const eDate = e.allDay ? e.start : e.start.slice(0, 10);
        return eDate === dayStr;
      })
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  });

  const navigateWeek = (direction: number) => {
    const d = new Date(weekDate);
    d.setDate(d.getDate() + direction * 7);
    router.push(`/calendar?week=${formatDate(d)}`);
  };

  return (
    <div className="space-y-4">
      <CalendarConnectionBanner
        isConnected={isConnected}
        showSuccess={connectedParam === "true"}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => navigateWeek(-1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">{weekLabel}</span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => navigateWeek(1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {isConnected && mealPlanId && mealPlanSlots.length > 0 && (
          <SyncMealsButton
            mealPlanId={mealPlanId}
            weekStartDate={weekStart}
          />
        )}
      </div>

      <CalendarWeekView
        dayNames={DAY_NAMES}
        weekDate={weekDate}
        eventsByDay={eventsByDay}
        loading={loading}
      />
    </div>
  );
}
