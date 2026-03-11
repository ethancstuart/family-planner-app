"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { LayoutTemplate, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface TemplateInfo {
  id: string;
  name: string;
  created_at: string;
  slot_count: number;
}

interface ApplyTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mealPlanId: string;
}

export function ApplyTemplateDialog({
  open,
  onOpenChange,
  mealPlanId,
}: ApplyTemplateDialogProps) {
  const router = useRouter();
  const [templates, setTemplates] = useState<TemplateInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch("/api/meal-planner/templates")
      .then((res) => res.json())
      .then((data) => setTemplates(data.templates ?? []))
      .catch(() => toast.error("Failed to load templates"))
      .finally(() => setLoading(false));
  }, [open]);

  const handleApply = async (templateId: string) => {
    setApplying(templateId);

    try {
      const res = await fetch("/api/meal-planner/templates/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId, targetMealPlanId: mealPlanId }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to apply template");
      } else {
        toast.success(`Applied ${data.applied} meals from template`);
        onOpenChange(false);
        router.refresh();
      }
    } catch {
      toast.error("Failed to apply template");
    } finally {
      setApplying(null);
    }
  };

  const handleDelete = async (templateId: string) => {
    setDeleting(templateId);

    try {
      const res = await fetch("/api/meal-planner/templates", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId }),
      });

      if (!res.ok) {
        toast.error("Failed to delete template");
      } else {
        setTemplates((prev) => prev.filter((t) => t.id !== templateId));
        toast.success("Template deleted");
      }
    } catch {
      toast.error("Failed to delete template");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Apply Template</DialogTitle>
          <DialogDescription>
            Choose a template to fill this week. This replaces current meals.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[300px] space-y-2 overflow-y-auto">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))
          ) : templates.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <LayoutTemplate className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No templates yet. Save a week as a template first.
              </p>
            </div>
          ) : (
            templates.map((template) => (
              <div
                key={template.id}
                className="flex items-center justify-between rounded-lg border border-border p-3"
              >
                <button
                  onClick={() => handleApply(template.id)}
                  disabled={applying === template.id}
                  className="min-w-0 flex-1 text-left"
                >
                  <p className="text-sm font-medium">{template.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {template.slot_count} meals &middot;{" "}
                    {new Date(template.created_at).toLocaleDateString()}
                  </p>
                </button>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDelete(template.id)}
                    disabled={deleting === template.id}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
