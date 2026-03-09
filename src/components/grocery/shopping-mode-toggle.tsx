"use client";

import { Button } from "@/components/ui/button";
import { ShoppingCart, X } from "lucide-react";

interface ShoppingModeToggleProps {
  active: boolean;
  onToggle: () => void;
}

export function ShoppingModeToggle({
  active,
  onToggle,
}: ShoppingModeToggleProps) {
  return (
    <Button
      variant={active ? "default" : "outline"}
      size="sm"
      onClick={onToggle}
    >
      {active ? (
        <>
          <X className="mr-1.5 h-4 w-4" />
          Exit
        </>
      ) : (
        <>
          <ShoppingCart className="mr-1.5 h-4 w-4" />
          Shop
        </>
      )}
    </Button>
  );
}
