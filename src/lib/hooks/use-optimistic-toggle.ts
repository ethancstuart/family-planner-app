"use client";

import { useState, useCallback, useTransition } from "react";

interface UseOptimisticToggleOptions {
  initialValue: boolean;
  onToggle: (newValue: boolean) => Promise<void>;
}

export function useOptimisticToggle({
  initialValue,
  onToggle,
}: UseOptimisticToggleOptions) {
  const [value, setValue] = useState(initialValue);
  const [isPending, startTransition] = useTransition();

  const toggle = useCallback(() => {
    const newValue = !value;
    setValue(newValue); // Optimistic update

    startTransition(async () => {
      try {
        await onToggle(newValue);
      } catch {
        setValue(!newValue); // Roll back on failure
      }
    });
  }, [value, onToggle]);

  return { value, toggle, isPending };
}
