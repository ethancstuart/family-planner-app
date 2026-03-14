"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { GroceryList, GroceryItem } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { GroceryItemRow } from "./grocery-item-row";
import { AddItemInput } from "./add-item-input";
import { CategorySection } from "./category-section";
import { ShoppingModeToggle } from "./shopping-mode-toggle";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ArrowLeft, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { GROCERY_CATEGORIES } from "@/lib/constants";
import { Celebration } from "@/components/ui/celebration";

interface GroceryListViewProps {
  list: GroceryList;
  initialItems: GroceryItem[];
}

export function GroceryListView({ list, initialItems }: GroceryListViewProps) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [shoppingMode, setShoppingMode] = useState(false);

  // Supabase Realtime subscription
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`grocery-${list.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "grocery_items",
          filter: `grocery_list_id=eq.${list.id}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setItems((prev) => {
              // Avoid duplicates
              if (prev.some((i) => i.id === (payload.new as GroceryItem).id)) return prev;
              return [...prev, payload.new as GroceryItem];
            });
          } else if (payload.eventType === "UPDATE") {
            setItems((prev) =>
              prev.map((item) =>
                item.id === (payload.new as GroceryItem).id
                  ? (payload.new as GroceryItem)
                  : item
              )
            );
          } else if (payload.eventType === "DELETE") {
            setItems((prev) =>
              prev.filter((item) => item.id !== (payload.old as { id: string }).id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [list.id]);

  const [showCelebration, setShowCelebration] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { checkedCount, uncheckedItems, checkedItems, groupedUnchecked, sortedCategories } =
    useMemo(() => {
      const checked = items.filter((i) => i.checked);
      const unchecked = items.filter((i) => !i.checked);
      const grouped = new Map<string, GroceryItem[]>();
      for (const item of unchecked) {
        const cat = item.category || "Other";
        if (!grouped.has(cat)) grouped.set(cat, []);
        grouped.get(cat)!.push(item);
      }
      const sorted = [...grouped.keys()].sort((a, b) => {
        const ai = GROCERY_CATEGORIES.indexOf(a as typeof GROCERY_CATEGORIES[number]);
        const bi = GROCERY_CATEGORIES.indexOf(b as typeof GROCERY_CATEGORIES[number]);
        return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
      });
      return {
        checkedCount: checked.length,
        uncheckedItems: unchecked,
        checkedItems: checked,
        groupedUnchecked: grouped,
        sortedCategories: sorted,
      };
    }, [items]);

  const handleToggle = useCallback(async (itemId: string, checked: boolean) => {
    // Optimistic update
    setItems((prev) => {
      const next = prev.map((item) => (item.id === itemId ? { ...item, checked } : item));
      // Celebrate when all items are checked
      if (checked && next.length > 0 && next.every((i) => i.checked)) {
        setShowCelebration(true);
      }
      return next;
    });

    const supabase = createClient();
    const { error } = await supabase
      .from("grocery_items")
      .update({ checked })
      .eq("id", itemId);

    if (error) {
      // Roll back
      setItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, checked: !checked } : item
        )
      );
      toast.error("Failed to update item");
    }
  }, []);

  const handleAddItem = async (item: {
    name: string;
    quantity: number | null;
    unit: string | null;
    category: string;
  }) => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("grocery_items")
      .insert({
        grocery_list_id: list.id,
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        category: item.category,
        checked: false,
      })
      .select()
      .single();

    if (error) {
      toast.error("Failed to add item");
    } else if (data) {
      setItems((prev) => [...prev, data as GroceryItem]);
    }
  };

  const handleDeleteItem = useCallback(async (itemId: string) => {
    let rollback: GroceryItem[] | null = null;
    setItems((prev) => {
      rollback = prev;
      return prev.filter((i) => i.id !== itemId);
    });

    const supabase = createClient();
    const { error } = await supabase
      .from("grocery_items")
      .delete()
      .eq("id", itemId);

    if (error) {
      if (rollback) setItems(rollback);
      toast.error("Failed to delete item");
    }
  }, []);

  const handleDeleteList = async () => {
    const supabase = createClient();
    await supabase.from("grocery_items").delete().eq("grocery_list_id", list.id);
    await supabase.from("grocery_lists").delete().eq("id", list.id);
    router.push("/grocery");
  };

  if (shoppingMode) {
    return (
      <div className="fixed inset-0 z-50 bg-background">
        <div className="bg-background/95 backdrop-blur-sm sticky top-0 z-10 border-b border-border px-4 py-3">
          <div className="mx-auto max-w-lg">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">{list.title}</h2>
              <ShoppingModeToggle
                active={shoppingMode}
                onToggle={() => setShoppingMode(false)}
              />
            </div>
            <ProgressBar
              value={checkedCount}
              max={items.length}
              showLabel
              className="mt-3"
            />
          </div>
        </div>

        <div className="mx-auto max-w-lg p-4 pb-24">
          <div className="space-y-2">
            {uncheckedItems.map((item) => (
              <GroceryItemRow
                key={item.id}
                item={item}
                onToggle={handleToggle}
                onDelete={handleDeleteItem}
                large
              />
            ))}
          </div>

          {checkedItems.length > 0 && (
            <div className="mt-6">
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Done ({checkedItems.length})
              </p>
              <div className="space-y-1 opacity-60">
                {checkedItems.map((item) => (
                  <GroceryItemRow
                    key={item.id}
                    item={item}
                    onToggle={handleToggle}
                    onDelete={handleDeleteItem}
                    large
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-7">
      <Celebration trigger={showCelebration} onComplete={() => setShowCelebration(false)} />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/grocery"
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-muted"
            aria-label="Back to lists"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{list.title}</h1>
            <p className="text-sm text-muted-foreground">
              {items.length === 0
                ? "No items yet"
                : `${checkedCount}/${items.length} items checked`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ShoppingModeToggle
            active={shoppingMode}
            onToggle={() => setShoppingMode(true)}
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowDeleteDialog(true)}
            className="text-destructive"
            aria-label="Delete list"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {items.length > 0 && (
        <ProgressBar value={checkedCount} max={items.length} showLabel />
      )}

      <AddItemInput onAdd={handleAddItem} />

      <div className="space-y-4">
        {sortedCategories.map((category) => (
          <CategorySection key={category} category={category}>
            {groupedUnchecked.get(category)!.map((item) => (
              <GroceryItemRow
                key={item.id}
                item={item}
                onToggle={handleToggle}
                onDelete={handleDeleteItem}
              />
            ))}
          </CategorySection>
        ))}
      </div>

      {checkedItems.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Checked off ({checkedItems.length})
          </p>
          <div className="space-y-1 opacity-60">
            {checkedItems.map((item) => (
              <GroceryItemRow
                key={item.id}
                item={item}
                onToggle={handleToggle}
                onDelete={handleDeleteItem}
              />
            ))}
          </div>
        </div>
      )}

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete grocery list?</DialogTitle>
            <DialogDescription>
              &ldquo;{list.title}&rdquo; and all its items will be permanently
              removed. This can&apos;t be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteList}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
