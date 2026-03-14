"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { MealPlanSlot, Recipe, DayOfWeek, MealType } from "@/types";
import { DayColumn } from "./day-column";
import { MealSlotCard } from "./meal-slot-card";
import { DAYS_OF_WEEK_SHORT, MEAL_TYPES } from "@/lib/constants";
import { parseDate } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { toast } from "sonner";

interface WeekViewProps {
  weekStart: string;
  mealPlanId: string;
  slots: MealPlanSlot[];
  recipes: Recipe[];
}

export function WeekView({
  weekStart,
  mealPlanId,
  slots,
  recipes,
}: WeekViewProps) {
  const router = useRouter();
  const startDate = parseDate(weekStart);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [activeSlot, setActiveSlot] = useState<MealPlanSlot | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const todayRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to today's column on mobile
  useEffect(() => {
    if (todayRef.current && containerRef.current) {
      const container = containerRef.current;
      const todayEl = todayRef.current;
      const scrollLeft = todayEl.offsetLeft - container.offsetLeft - 16;
      container.scrollTo({ left: scrollLeft, behavior: "smooth" });
    }
  }, []);

  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: { distance: 8 },
  });

  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: { delay: 250, tolerance: 5 },
  });

  const sensors = useSensors(mouseSensor, touchSensor);

  const handleDragStart = (event: DragStartEvent) => {
    const slot = event.active.data.current?.slot as MealPlanSlot | undefined;
    setActiveSlot(slot ?? null);
    // Disable scroll during drag on mobile
    if (containerRef.current) {
      containerRef.current.style.overflowX = "hidden";
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveSlot(null);
    // Restore scroll
    if (containerRef.current) {
      containerRef.current.style.overflowX = "";
    }

    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const draggedSlot = active.data.current?.slot as MealPlanSlot | undefined;
    if (!draggedSlot) return;

    // Parse target: "dayOfWeek-mealType"
    const targetId = over.id as string;
    const dashIndex = targetId.indexOf("-");
    if (dashIndex === -1) return;

    const targetDayOfWeek = parseInt(targetId.substring(0, dashIndex)) as DayOfWeek;
    const targetMealType = targetId.substring(dashIndex + 1) as MealType;

    if (!MEAL_TYPES.includes(targetMealType)) return;

    // Check if target slot is occupied
    const targetSlot = slots.find(
      (s) => s.day_of_week === targetDayOfWeek && s.meal_type === targetMealType
    );

    const supabase = createClient();

    if (targetSlot) {
      // Swap: update both slots
      const [res1, res2] = await Promise.all([
        supabase
          .from("meal_plan_slots")
          .update({
            day_of_week: targetDayOfWeek,
            meal_type: targetMealType,
          })
          .eq("id", draggedSlot.id),
        supabase
          .from("meal_plan_slots")
          .update({
            day_of_week: draggedSlot.day_of_week,
            meal_type: draggedSlot.meal_type,
          })
          .eq("id", targetSlot.id),
      ]);

      if (res1.error || res2.error) {
        toast.error("Failed to swap meals");
        return;
      }
    } else {
      // Move to empty slot
      const { error } = await supabase
        .from("meal_plan_slots")
        .update({
          day_of_week: targetDayOfWeek,
          meal_type: targetMealType,
        })
        .eq("id", draggedSlot.id);

      if (error) {
        toast.error("Failed to move meal");
        return;
      }
    }

    router.refresh();
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {/* Summary row */}
      <div className="mb-2 hidden md:grid md:grid-cols-7 gap-3">
        {DAYS_OF_WEEK_SHORT.map((dayName, index) => {
          const count = slots.filter((s) => s.day_of_week === index).length;
          return (
            <div key={index} className="text-center text-[10px] font-medium text-muted-foreground">
              {count > 0 ? `${count} meal${count !== 1 ? "s" : ""}` : "\u00A0"}
            </div>
          );
        })}
      </div>

      <div
        ref={containerRef}
        className="flex gap-3 overflow-x-auto pb-4 md:grid md:grid-cols-7 md:gap-4 md:overflow-visible"
      >
        {DAYS_OF_WEEK_SHORT.map((dayName, index) => {
          const date = new Date(startDate);
          date.setDate(date.getDate() + index);
          const isToday = date.getTime() === today.getTime();
          const daySlots = slots.filter(
            (s) => s.day_of_week === (index as DayOfWeek)
          );

          return (
            <div key={index} ref={isToday ? todayRef : undefined}>
              <DayColumn
                dayName={dayName}
                dayOfWeek={index as DayOfWeek}
                date={date}
                isToday={isToday}
                slots={daySlots}
                mealPlanId={mealPlanId}
                recipes={recipes}
              />
            </div>
          );
        })}
      </div>

      <DragOverlay>
        {activeSlot?.recipe ? (
          <div className="w-[140px] rotate-2 scale-105 opacity-90 shadow-xl">
            <MealSlotCard
              slot={activeSlot}
              label=""
              mealPlanId={mealPlanId}
              dayOfWeek={activeSlot.day_of_week}
              mealType={activeSlot.meal_type}
              recipes={recipes}
              isDragging
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
