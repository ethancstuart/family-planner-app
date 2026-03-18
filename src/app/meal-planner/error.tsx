"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ui/error-state";

export default function MealPlannerError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[MEAL-PLANNER] Error:", error.message, "Digest:", error.digest, error);
  }, [error]);

  return (
    <div>
      <ErrorState error={error} reset={reset} />
      <pre className="mx-auto mt-4 max-w-md rounded bg-muted p-4 text-xs text-muted-foreground">
        Digest: {error.digest ?? "none"}
      </pre>
    </div>
  );
}
