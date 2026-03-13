"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";

interface AddTodoInputProps {
  onAdd: (item: { title: string; due_date: string | null }) => void;
}

export function AddTodoInput({ onAdd }: AddTodoInputProps) {
  const [value, setValue] = useState("");

  const handleSubmit = () => {
    if (!value.trim()) return;

    const { title, dueDate } = parseTodoInput(value);
    onAdd({ title, due_date: dueDate });
    setValue("");
  };

  return (
    <div className="relative">
      <Plus className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        aria-label="Add a task"
        placeholder='Add a task (try "Buy milk due:friday")'
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        className="pl-9"
      />
    </div>
  );
}

function parseTodoInput(input: string): {
  title: string;
  dueDate: string | null;
} {
  const dueMatch = input.match(/\bdue:(\S+)/i);

  if (!dueMatch) {
    return { title: input.trim(), dueDate: null };
  }

  const title = input.replace(dueMatch[0], "").trim();
  const dueStr = dueMatch[1].toLowerCase();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dayNames = [
    "sunday", "monday", "tuesday", "wednesday",
    "thursday", "friday", "saturday",
  ];

  let dueDate: Date | null = null;

  if (dueStr === "today") {
    dueDate = today;
  } else if (dueStr === "tomorrow") {
    dueDate = new Date(today);
    dueDate.setDate(dueDate.getDate() + 1);
  } else {
    const dayIndex = dayNames.indexOf(dueStr);
    if (dayIndex !== -1) {
      dueDate = new Date(today);
      const currentDay = dueDate.getDay();
      let diff = dayIndex - currentDay;
      if (diff <= 0) diff += 7;
      dueDate.setDate(dueDate.getDate() + diff);
    } else {
      // Try parsing as YYYY-MM-DD or MM/DD
      const parsed = new Date(dueStr);
      if (!isNaN(parsed.getTime())) {
        dueDate = parsed;
      }
    }
  }

  if (dueDate) {
    const year = dueDate.getFullYear();
    const month = String(dueDate.getMonth() + 1).padStart(2, "0");
    const day = String(dueDate.getDate()).padStart(2, "0");
    return { title, dueDate: `${year}-${month}-${day}` };
  }

  return { title, dueDate: null };
}
