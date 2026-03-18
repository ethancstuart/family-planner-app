"use client";

import dynamic from "next/dynamic";
import type { MealPlanSlot, Recipe } from "@/types";

const WeekView = dynamic(
  () =>
    import("./week-view").then((mod) => ({ default: mod.WeekView })),
  { ssr: false }
);

interface WeekViewLoaderProps {
  weekStart: string;
  mealPlanId: string;
  slots: MealPlanSlot[];
  recipes: Recipe[];
}

export function WeekViewLoader(props: WeekViewLoaderProps) {
  return <WeekView {...props} />;
}
