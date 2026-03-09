"use client";

import { ListTodo } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyTodosProps {
  onCreateList: () => void;
}

export function EmptyTodos({ onCreateList }: EmptyTodosProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-primary/20 bg-primary/5 px-6 py-20 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
        <ListTodo className="h-7 w-7 text-primary" />
      </div>
      <h3 className="text-lg font-semibold">No to-do lists yet</h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Create shared task lists for your family. Assign tasks, set due dates,
        and keep everyone on track.
      </p>
      <div className="mt-6">
        <Button onClick={onCreateList}>Create your first list</Button>
      </div>
    </div>
  );
}
