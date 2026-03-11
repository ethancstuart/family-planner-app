"use client";

import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";

interface DroppableSlotProps {
  id: string;
  children: React.ReactNode;
}

export function DroppableSlot({ id, children }: DroppableSlotProps) {
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "rounded-lg transition-all",
        isOver && "ring-2 ring-primary ring-dashed ring-offset-1 ring-offset-background"
      )}
    >
      {children}
    </div>
  );
}
