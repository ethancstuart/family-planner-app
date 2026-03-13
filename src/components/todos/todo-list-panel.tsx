"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { TodoList, TodoItem, User } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { TodoItemRow } from "./todo-item-row";
import { AddTodoInput } from "./add-todo-input";
import { ChevronDown, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Celebration } from "@/components/ui/celebration";

interface TodoListPanelProps {
  list: TodoList;
  items: TodoItem[];
  members: User[];
  currentUserId: string;
  accentGradient?: string;
}

export function TodoListPanel({
  list,
  items,
  members,
  accentGradient = "from-primary to-accent",
}: TodoListPanelProps) {
  const router = useRouter();
  const [open, setOpen] = useState(true);
  const [localItems, setLocalItems] = useState(items);
  const [showCelebration, setShowCelebration] = useState(false);

  const completedCount = localItems.filter((i) => i.completed).length;
  const totalCount = localItems.length;

  const handleToggle = async (itemId: string, completed: boolean) => {
    setLocalItems((prev) => {
      const next = prev.map((i) => (i.id === itemId ? { ...i, completed } : i));
      if (completed && next.length > 0 && next.every((i) => i.completed)) {
        setShowCelebration(true);
      }
      return next;
    });

    const supabase = createClient();
    const { error } = await supabase
      .from("todo_items")
      .update({ completed })
      .eq("id", itemId);

    if (error) {
      setLocalItems((prev) =>
        prev.map((i) => (i.id === itemId ? { ...i, completed: !completed } : i))
      );
      toast.error("Failed to update task");
    }
  };

  const handleAddItem = async (item: {
    title: string;
    due_date: string | null;
  }) => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("todo_items")
      .insert({
        todo_list_id: list.id,
        title: item.title,
        due_date: item.due_date,
        assigned_to: null,
        completed: false,
      })
      .select()
      .single();

    if (error) {
      toast.error("Failed to add task");
    } else if (data) {
      setLocalItems((prev) => [...prev, data as TodoItem]);
    }
  };

  const handleAssign = async (itemId: string, userId: string | null) => {
    setLocalItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, assigned_to: userId } : i))
    );

    const supabase = createClient();
    const { error } = await supabase
      .from("todo_items")
      .update({ assigned_to: userId })
      .eq("id", itemId);

    if (error) {
      toast.error("Failed to assign task");
      router.refresh();
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    const prev = localItems;
    setLocalItems((items) => items.filter((i) => i.id !== itemId));

    const supabase = createClient();
    const { error } = await supabase
      .from("todo_items")
      .delete()
      .eq("id", itemId);

    if (error) {
      setLocalItems(prev);
      toast.error("Failed to delete task");
    }
  };

  const handleDeleteList = async () => {
    const supabase = createClient();
    await supabase.from("todo_items").delete().eq("todo_list_id", list.id);
    await supabase.from("todo_lists").delete().eq("id", list.id);
    router.refresh();
  };

  const uncompleted = localItems.filter((i) => !i.completed);
  const completed = localItems.filter((i) => i.completed);

  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-card">
      <div className={`absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r ${accentGradient}`} />
      <Celebration trigger={showCelebration} onComplete={() => setShowCelebration(false)} />
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-5 py-4"
      >
        <div className="flex items-center gap-3">
          <ChevronDown
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform",
              !open && "-rotate-90"
            )}
          />
          <h3 className="font-semibold">{list.title}</h3>
          <span className="text-xs text-muted-foreground">
            {completedCount}/{totalCount}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteList();
          }}
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          aria-label="Delete list"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </button>

      {open && (
        <div className="border-t border-border px-5 py-4 space-y-3">
          <AddTodoInput onAdd={handleAddItem} />

          <div className="space-y-1">
            {uncompleted.map((item) => (
              <TodoItemRow
                key={item.id}
                item={item}
                members={members}
                onToggle={handleToggle}
                onAssign={handleAssign}
                onDelete={handleDeleteItem}
              />
            ))}
          </div>

          {completed.length > 0 && (
            <div className="space-y-1 opacity-50">
              {completed.map((item) => (
                <TodoItemRow
                  key={item.id}
                  item={item}
                  members={members}
                  onToggle={handleToggle}
                  onAssign={handleAssign}
                  onDelete={handleDeleteItem}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
