"use client";

import { useState, useMemo } from "react";
import type { TodoList, TodoItem, User } from "@/types";
import { TodoListPanel } from "./todo-list-panel";
import { CreateListDialog } from "./create-list-dialog";
import { TodoFilters } from "./todo-filters";
import { EmptyTodos } from "./empty-todos";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";

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

  const { remaining, overdue, done } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return {
      remaining: allItems.filter((i) => !i.completed).length,
      overdue: allItems.filter(
        (i) =>
          !i.completed &&
          i.due_date &&
          new Date(i.due_date + "T00:00:00") < today
      ).length,
      done: allItems.filter((i) => i.completed).length,
    };
  }, [allItems]);

  const accentGradients = [
    "from-primary to-accent",
    "from-purple-400 to-indigo-500",
    "from-violet-400 to-fuchsia-500",
    "from-teal-400 to-cyan-500",
    "from-amber-400 to-orange-500",
    "from-sky-400 to-blue-500",
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            To-Dos
          </h1>
          <p className="mt-1 text-muted-foreground">
            {remaining} tasks remaining
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)} size="sm">
          <Plus className="mr-1.5 h-4 w-4" />
          New List
        </Button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-border bg-card p-5 text-center">
          <p className="text-2xl font-bold">{remaining}</p>
          <p className="text-xs text-muted-foreground">Remaining</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 text-center">
          <p className={`text-2xl font-bold ${overdue > 0 ? "text-destructive" : ""}`}>{overdue}</p>
          <p className="text-xs text-muted-foreground">Overdue</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 text-center">
          <p className="text-2xl font-bold">{done}</p>
          <p className="text-xs text-muted-foreground">Done</p>
        </div>
      </div>

      <TodoFilters active={activeFilter} onChange={setActiveFilter} />

      <motion.div
        className="space-y-4"
        initial="hidden"
        animate="visible"
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.05 } } }}
      >
        {lists.map((list, index) => {
          const listItems = filterItems(
            allItems.filter((i) => i.todo_list_id === list.id)
          );

          // Hide empty lists when filtering (except "all")
          if (activeFilter !== "all" && listItems.length === 0) return null;

          return (
            <motion.div
              key={list.id}
              variants={{
                hidden: { opacity: 0, y: 12 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
              }}
            >
              <TodoListPanel
                list={list}
                items={listItems}
                members={members}
                currentUserId={currentUserId}
                accentGradient={accentGradients[index % accentGradients.length]}
              />
            </motion.div>
          );
        })}
      </motion.div>

      <CreateListDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        householdId={householdId}
      />
    </div>
  );
}
