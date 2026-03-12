"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import type { CalendarEvent, MealType } from "@/types";

const mealTypeColors: Record<MealType, string> = {
  breakfast: "border-l-amber-400",
  lunch: "border-l-green-400",
  dinner: "border-l-orange-400",
  snack: "border-l-purple-400",
};

interface CalendarEventCardProps {
  event: CalendarEvent;
}

export function CalendarEventCard({ event }: CalendarEventCardProps) {
  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (event.source === "meal-plan") {
    const card = (
      <div
        className={cn(
          "rounded-lg border border-border border-l-2 bg-card p-2 transition-all hover:border-primary/30",
          event.mealType ? mealTypeColors[event.mealType] : "border-l-primary"
        )}
      >
        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          {event.mealType ?? "Meal"}
        </p>
        <p className="mt-0.5 text-xs font-medium leading-snug line-clamp-2">
          {event.title.includes(": ")
            ? event.title.split(": ").slice(1).join(": ")
            : event.title}
        </p>
      </div>
    );

    if (event.recipeId) {
      return (
        <Link href={`/recipes/${event.recipeId}`} className="block">
          {card}
        </Link>
      );
    }
    return card;
  }

  // Google Calendar event
  return (
    <div className="rounded-lg border border-border bg-card/50 p-2">
      {!event.allDay && (
        <p className="text-[10px] text-muted-foreground">
          {formatTime(event.start)}
        </p>
      )}
      <p className="text-xs font-medium leading-snug line-clamp-2">
        {event.title}
      </p>
    </div>
  );
}
