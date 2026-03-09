"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface CreateListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  householdId: string;
}

export function CreateListDialog({
  open,
  onOpenChange,
  householdId,
}: CreateListDialogProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!title.trim()) return;
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.from("todo_lists").insert({
      household_id: householdId,
      title: title.trim(),
    });

    if (error) {
      toast.error("Failed to create list");
      setLoading(false);
    } else {
      setTitle("");
      onOpenChange(false);
      setLoading(false);
      router.refresh();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>New To-Do List</DialogTitle>
          <DialogDescription>
            Create a list to organize tasks for your family.
          </DialogDescription>
        </DialogHeader>

        <Input
          placeholder="e.g., House chores"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
        />

        <DialogFooter>
          <Button
            onClick={handleCreate}
            disabled={!title.trim() || loading}
          >
            {loading && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
            Create List
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
