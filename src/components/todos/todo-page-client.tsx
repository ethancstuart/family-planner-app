"use client";

import { useState } from "react";
import type { TodoList, TodoItem, User } from "@/types";
import { TodoListPanel } from "./todo-list-panel";
import { CreateListDialog } from "./create-list-dialog";
import { TodoFilters } from "./todo-filters";
import { EmptyTodos } from "./empty-todos";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface TodoPageClientProps {
  lists: TodoList[];
  allItems: TodoItem[];
  members: User[];
  householdId: string;
  currentUserId: string;
  filter?: string;
}

export function TodoPageClient({
  lists,
  allItems,
  members,
  householdId,
  currentUserId,
  filter,
}: TodoPageClientProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState(filter || "all");

  const filterItems = (items: TodoItem[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (activeFilter) {
      case "mine":
        return items.filter((i) => i.assigned_to === currentUserId);
      case "overdue":
        return items.filter(
          (i) =>
            !i.completed &&
            i.due_date &&
            new Date(i.due_date + "T00:00:00") < today
        );
      case "completed":
        return items.filter((i) => i.completed);
      default:
        return items;
    }
  };

  if (lists.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            To-Dos
          </h1>
          <p className="mt-1 text-muted-foreground">
            Keep your family organized with shared task lists.
          </p>
        </div>
        <EmptyTodos onCreateList={() => setDialogOpen(true)} />
        <CreateListDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          householdId={householdId}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            To-Dos
          </h1>
          <p className="mt-1 text-muted-foreground">
            {allItems.filter((i) => !i.completed).length} tasks remaining
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)} size="sm">
          <Plus className="mr-1.5 h-4 w-4" />
          New List
        </Button>
      </div>

      <TodoFilters active={activeFilter} onChange={setActiveFilter} />

      <div className="space-y-4">
        {lists.map((list) => {
          const listItems = filterItems(
            allItems.filter((i) => i.todo_list_id === list.id)
          );

          // Hide empty lists when filtering (except "all")
          if (activeFilter !== "all" && listItems.length === 0) return null;

          return (
            <TodoListPanel
              key={list.id}
              list={list}
              items={listItems}
              members={members}
              currentUserId={currentUserId}
            />
          );
        })}
      </div>

      <CreateListDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        householdId={householdId}
      />
    </div>
  );
}
