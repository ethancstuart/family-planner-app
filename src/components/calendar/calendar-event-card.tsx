"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import type { CalendarEvent, MealType } from "@/types";

const mealTypeGradients: Record<MealType, string> = {
  breakfast: "from-amber-400 to-orange-400",
  lunch: "from-green-400 to-emerald-400",
  dinner: "from-rose-400 to-primary",
  snack: "from-violet-400 to-accent",
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
        className="relative overflow-hidden rounded-lg border border-white/[0.06] bg-card p-2 pl-3 transition-all hover:border-primary/30"
      >
        <div className={cn(
          "absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b",
          event.mealType ? mealTypeGradients[event.mealType] : "from-primary to-accent"
        )} />
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
    <div className="relative rounded-lg border border-white/[0.06] bg-blue-500/5 p-2 pl-3 backdrop-blur-sm">
      <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-lg bg-blue-500/50" />
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
