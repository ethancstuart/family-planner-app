"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  MoreHorizontal,
  Save,
  LayoutTemplate,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { parseDate, formatDate, getWeekStartDate } from "@/lib/utils";
import { toast } from "sonner";

interface WeekNavigatorProps {
  weekStart: string;
  currentDate: Date;
  mealPlanId?: string;
  hasSlots?: boolean;
  onSaveTemplate?: () => void;
  onApplyTemplate?: () => void;
}

export function WeekNavigator({
  weekStart,
  currentDate,
  mealPlanId,
  hasSlots,
  onSaveTemplate,
  onApplyTemplate,
}: WeekNavigatorProps) {
  const router = useRouter();
  const [confirmCopy, setConfirmCopy] = useState(false);
  const [copying, setCopying] = useState(false);

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

  const handleCopyLastWeek = async () => {
    if (!mealPlanId) return;
    setCopying(true);

    const prevDate = parseDate(weekStart);
    prevDate.setDate(prevDate.getDate() - 7);
    const sourceWeekStart = formatDate(prevDate);

    try {
      const res = await fetch("/api/meal-planner/copy-week", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetMealPlanId: mealPlanId, sourceWeekStart }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to copy meals");
      } else if (data.copied === 0) {
        toast.info("No meals to copy from last week");
      } else {
        toast.success(`Copied ${data.copied} meals from last week`);
        router.refresh();
      }
    } catch {
      toast.error("Failed to copy meals");
    } finally {
      setCopying(false);
      setConfirmCopy(false);
    }
  };

  return (
    <>
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
        <div className="flex items-center gap-2">
          {!isCurrentWeek && (
            <Button variant="ghost" size="sm" onClick={goToToday}>
              Today
            </Button>
          )}
          {mealPlanId && (
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background text-sm font-medium shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground">
                <MoreHorizontal className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setConfirmCopy(true)}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Last Week
                </DropdownMenuItem>
                {onSaveTemplate && hasSlots && (
                  <DropdownMenuItem onClick={onSaveTemplate}>
                    <Save className="mr-2 h-4 w-4" />
                    Save as Template
                  </DropdownMenuItem>
                )}
                {onApplyTemplate && (
                  <DropdownMenuItem onClick={onApplyTemplate}>
                    <LayoutTemplate className="mr-2 h-4 w-4" />
                    Apply Template
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      <Dialog open={confirmCopy} onOpenChange={setConfirmCopy}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Copy Last Week</DialogTitle>
            <DialogDescription>
              This will replace all meals in the current week with last week&apos;s meal plan.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirmCopy(false)}>
              Cancel
            </Button>
            <Button onClick={handleCopyLastWeek} disabled={copying}>
              {copying ? "Copying..." : "Copy"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
