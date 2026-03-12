"use client";

import { formatDate } from "@/lib/utils";
import { CalendarEventCard } from "./calendar-event-card";
import { cn } from "@/lib/utils";
import type { CalendarEvent } from "@/types";

interface CalendarWeekViewProps {
  dayNames: string[];
  weekDate: Date;
  eventsByDay: CalendarEvent[][];
  loading: boolean;
}

export function CalendarWeekView({
  dayNames,
  weekDate,
  eventsByDay,
  loading,
}: CalendarWeekViewProps) {
  const today = formatDate(new Date());

  return (
    <div className="flex gap-2 overflow-x-auto pb-4 md:grid md:grid-cols-7 md:gap-3 md:overflow-visible md:pb-0">
      {dayNames.map((name, i) => {
        const d = new Date(weekDate);
        d.setDate(d.getDate() + i);
        const dateStr = formatDate(d);
        const isToday = dateStr === today;
        const dayEvents = eventsByDay[i] ?? [];

        return (
          <div
            key={i}
            className={cn(
              "min-w-[140px] flex-shrink-0 rounded-xl p-1.5 md:min-w-0",
              isToday
                ? "glass ring-1 ring-primary/20"
                : "glass-subtle"
            )}
          >
            <div
              className={cn(
                "mb-2 rounded-lg px-2 py-1.5 text-center",
                isToday
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground"
              )}
            >
              <p className="text-[10px] font-medium uppercase tracking-wider">
                {name}
              </p>
              <p
                className={cn(
                  "text-lg font-semibold",
                  isToday ? "text-primary" : "text-foreground"
                )}
              >
                {d.getDate()}
              </p>
            </div>

            <div className="space-y-1.5">
              {loading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              ) : dayEvents.length === 0 ? (
                <p className="py-3 text-center text-[10px] text-muted-foreground">
                  No events
                </p>
              ) : (
                dayEvents.map((event) => (
                  <CalendarEventCard key={event.id} event={event} />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
