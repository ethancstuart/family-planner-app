"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { parseDate, formatDate, getWeekStartDate } from "@/lib/utils";
import { DAYS_OF_WEEK_SHORT } from "@/lib/constants";

interface WeekNavigatorProps {
  weekStart: string;
  currentDate: Date;
}

export function WeekNavigator({ weekStart, currentDate }: WeekNavigatorProps) {
  const router = useRouter();

  const goToWeek = (offset: number) => {
    const date = parseDate(weekStart);
    date.setDate(date.getDate() + offset * 7);
    router.push(`/meal-planner?week=${formatDate(date)}`);
  };

  const goToToday = () => {
    router.push(`/meal-planner?week=${getWeekStartDate()}`);
  };

  const endDate = new Date(currentDate);
  endDate.setDate(endDate.getDate() + 6);

  const formatRange = () => {
    const startMonth = currentDate.toLocaleDateString("en-US", { month: "short" });
    const endMonth = endDate.toLocaleDateString("en-US", { month: "short" });
    const startDay = currentDate.getDate();
    const endDay = endDate.getDate();

    if (startMonth === endMonth) {
      return `${startMonth} ${startDay} – ${endDay}`;
    }
    return `${startMonth} ${startDay} – ${endMonth} ${endDay}`;
  };

  const isCurrentWeek = weekStart === getWeekStartDate();

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => goToWeek(-1)}
          aria-label="Previous week"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="min-w-[140px] text-center text-sm font-medium">
          {formatRange()}
        </span>
        <Button
          variant="outline"
          size="icon"
          onClick={() => goToWeek(1)}
          aria-label="Next week"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      {!isCurrentWeek && (
        <Button variant="ghost" size="sm" onClick={goToToday}>
          Today
        </Button>
      )}
    </div>
  );
}
