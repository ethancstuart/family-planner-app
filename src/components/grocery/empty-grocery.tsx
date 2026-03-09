"use client";

import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyGroceryProps {
  onCreateList: () => void;
}

export function EmptyGrocery({ onCreateList }: EmptyGroceryProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-primary/20 bg-primary/5 px-6 py-20 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
        <ShoppingCart className="h-7 w-7 text-primary" />
      </div>
      <h3 className="text-lg font-semibold">No grocery lists yet</h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Create a blank list or generate one automatically from your meal plan.
        Share it with your family for real-time synced shopping.
      </p>
      <div className="mt-6">
        <Button onClick={onCreateList}>Create your first list</Button>
      </div>
    </div>
  );
}
