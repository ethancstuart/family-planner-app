"use client";

import type { TodoItem, User } from "@/types";
import { AssignMemberPopover } from "./assign-member-popover";
import { cn } from "@/lib/utils";
import { X, Calendar } from "lucide-react";
import { motion } from "framer-motion";

interface TodoItemRowProps {
  item: TodoItem;
  members: User[];
  onToggle: (id: string, completed: boolean) => void;
  onAssign: (id: string, userId: string | null) => void;
  onDelete: (id: string) => void;
}

export function TodoItemRow({
  item,
  members,
  onToggle,
  onAssign,
  onDelete,
}: TodoItemRowProps) {
  const isOverdue =
    !item.completed &&
    item.due_date &&
    new Date(item.due_date + "T00:00:00") < new Date(new Date().toDateString());

  const assignedMember = item.assigned_to
    ? members.find((m) => m.id === item.assigned_to)
    : null;

  const formatDueDate = (date: string) => {
    const d = new Date(date + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (d.getTime() === today.getTime()) return "Today";
    if (d.getTime() === tomorrow.getTime()) return "Tomorrow";
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="group flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-muted/50"
    >
      <button
        onClick={() => onToggle(item.id, !item.completed)}
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
          item.completed
            ? "border-primary bg-primary text-primary-foreground"
            : "border-muted-foreground/30 hover:border-primary"
        )}
        aria-label={item.completed ? "Mark incomplete" : "Mark complete"}
      >
        {item.completed && (
          <svg
            className="h-3 w-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
      </button>

      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "text-sm",
            item.completed && "text-muted-foreground line-through"
          )}
        >
          {item.title}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {item.due_date && (
          <span
            className={cn(
              "flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium",
              isOverdue
                ? "bg-destructive/10 text-destructive"
                : "bg-muted text-muted-foreground"
            )}
          >
            <Calendar className="h-2.5 w-2.5" />
            {formatDueDate(item.due_date)}
          </span>
        )}

        <AssignMemberPopover
          members={members}
          assignedTo={item.assigned_to}
          assignedMember={assignedMember}
          onAssign={(userId) => onAssign(item.id, userId)}
        />

        <button
          onClick={() => onDelete(item.id)}
          className="hidden shrink-0 text-muted-foreground transition-colors hover:text-destructive group-hover:block"
          aria-label="Delete task"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
}
