"use client";

import { useState } from "react";
import Link from "next/link";
import type { GroceryList } from "@/types";
import { CreateListDialog } from "./create-list-dialog";
import { EmptyGrocery } from "./empty-grocery";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Button } from "@/components/ui/button";
import { Plus, ShoppingCart, ArrowRight } from "lucide-react";

interface GroceryListIndexProps {
  lists: GroceryList[];
  itemCounts: Record<string, { total: number; checked: number }>;
  householdId: string;
  mealPlans: { id: string; week_start_date: string }[];
}

export function GroceryListIndex({
  lists,
  itemCounts,
  householdId,
  mealPlans,
}: GroceryListIndexProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  if (lists.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Grocery Lists
            </h1>
            <p className="mt-1 text-muted-foreground">
              Generate from your meal plan or create a blank list.
            </p>
          </div>
        </div>
        <EmptyGrocery onCreateList={() => setDialogOpen(true)} />
        <CreateListDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          householdId={householdId}
          mealPlans={mealPlans}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Grocery Lists
          </h1>
          <p className="mt-1 text-muted-foreground">
            {lists.length} list{lists.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)} size="sm">
          <Plus className="mr-1.5 h-4 w-4" />
          New List
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {lists.map((list) => {
          const counts = itemCounts[list.id] ?? { total: 0, checked: 0 };
          const isDone = counts.total > 0 && counts.checked === counts.total;

          return (
            <Link
              key={list.id}
              href={`/grocery/${list.id}`}
              className="group flex flex-col gap-3 rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <ShoppingCart className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{list.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {counts.total === 0
                        ? "Empty list"
                        : isDone
                          ? "All done!"
                          : `${counts.checked}/${counts.total} items`}
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </div>

              {counts.total > 0 && (
                <ProgressBar value={counts.checked} max={counts.total} />
              )}
            </Link>
          );
        })}
      </div>

      <CreateListDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        householdId={householdId}
        mealPlans={mealPlans}
      />
    </div>
  );
}
