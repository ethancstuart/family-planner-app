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

      {/* Hero: most recent list */}
      {(() => {
        const heroList = lists[0];
        const heroCounts = itemCounts[heroList.id] ?? { total: 0, checked: 0 };
        const heroIsDone = heroCounts.total > 0 && heroCounts.checked === heroCounts.total;

        return (
          <Link
            href={`/grocery/${heroList.id}`}
            className="group block rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <ShoppingCart className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-lg font-semibold">{heroList.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {heroCounts.total === 0
                      ? "Empty list"
                      : heroIsDone
                        ? "All done!"
                        : `${heroCounts.checked}/${heroCounts.total} items`}
                  </p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </div>
            {heroCounts.total > 0 && (
              <div className="mt-4">
                <ProgressBar value={heroCounts.checked} max={heroCounts.total} />
              </div>
            )}
          </Link>
        );
      })()}

      {/* Other lists — compact rows */}
      {lists.length > 1 && (
        <div className="divide-y divide-border rounded-xl border border-border bg-card">
          {lists.slice(1).map((list) => {
            const counts = itemCounts[list.id] ?? { total: 0, checked: 0 };
            const isDone = counts.total > 0 && counts.checked === counts.total;

            return (
              <Link
                key={list.id}
                href={`/grocery/${list.id}`}
                className="group flex items-center justify-between px-5 py-3.5 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium">{list.title}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">
                    {counts.total === 0
                      ? "Empty"
                      : isDone
                        ? "Done"
                        : `${counts.checked}/${counts.total}`}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <CreateListDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        householdId={householdId}
        mealPlans={mealPlans}
      />
    </div>
  );
}
