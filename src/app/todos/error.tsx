"use client";

import { ErrorState } from "@/components/ui/error-state";

export default function TodosError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorState error={error} reset={reset} />;
}
