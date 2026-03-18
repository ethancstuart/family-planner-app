import { WeekViewLoader } from "@/components/meal-planner/week-view-loader";
import { MealPlannerHeader } from "@/components/meal-planner/meal-planner-header";
import { EmptyMealPlan } from "@/components/meal-planner/empty-meal-plan";

export default async function MealPlannerPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Meal Planner - Diagnostic Step 2</h1>
      <p>Testing meal-planner component imports.</p>
      <div className="mt-4 space-y-2 text-sm">
        <p>WeekViewLoader: {typeof WeekViewLoader}</p>
        <p>MealPlannerHeader: {typeof MealPlannerHeader}</p>
        <p>EmptyMealPlan: {typeof EmptyMealPlan}</p>
      </div>
    </div>
  );
}
