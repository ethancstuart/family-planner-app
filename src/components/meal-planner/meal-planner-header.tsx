"use client";

import { useState } from "react";
import { WeekNavigator } from "./week-navigator";
import { SaveTemplateDialog } from "./save-template-dialog";
import { ApplyTemplateDialog } from "./apply-template-dialog";
import { SyncMealsButton } from "@/components/calendar/sync-meals-button";

interface MealPlannerHeaderProps {
  weekStart: string;
  currentDate: Date;
  mealPlanId: string;
  hasSlots: boolean;
  hasCalendarConnection?: boolean;
}

export function MealPlannerHeader({
  weekStart,
  currentDate,
  mealPlanId,
  hasSlots,
  hasCalendarConnection,
}: MealPlannerHeaderProps) {
  const [saveOpen, setSaveOpen] = useState(false);
  const [applyOpen, setApplyOpen] = useState(false);

  return (
    <>
      {hasCalendarConnection && hasSlots && (
        <div className="flex justify-end">
          <SyncMealsButton mealPlanId={mealPlanId} weekStartDate={weekStart} />
        </div>
      )}
      <WeekNavigator
        weekStart={weekStart}
        currentDate={currentDate}
        mealPlanId={mealPlanId}
        hasSlots={hasSlots}
        onSaveTemplate={() => setSaveOpen(true)}
        onApplyTemplate={() => setApplyOpen(true)}
      />
      <SaveTemplateDialog
        open={saveOpen}
        onOpenChange={setSaveOpen}
        mealPlanId={mealPlanId}
      />
      <ApplyTemplateDialog
        open={applyOpen}
        onOpenChange={setApplyOpen}
        mealPlanId={mealPlanId}
      />
    </>
  );
}
