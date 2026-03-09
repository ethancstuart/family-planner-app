"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { parseGroceryInput } from "@/lib/utils";
import { getCategoryForIngredient } from "@/lib/constants";

interface AddItemInputProps {
  onAdd: (item: {
    name: string;
    quantity: number | null;
    unit: string | null;
    category: string;
  }) => void;
}

export function AddItemInput({ onAdd }: AddItemInputProps) {
  const [value, setValue] = useState("");

  const handleSubmit = () => {
    if (!value.trim()) return;

    const parsed = parseGroceryInput(value);
    onAdd({
      ...parsed,
      category: getCategoryForIngredient(parsed.name),
    });
    setValue("");
  };

  return (
    <div className="flex items-center gap-2">
      <Input
        placeholder='Add item (e.g., "2 lbs chicken")'
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
      />
      <Button
        onClick={handleSubmit}
        disabled={!value.trim()}
        size="icon"
        aria-label="Add item"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}
