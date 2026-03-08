"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, PenLine, Link2, Video, ImageIcon } from "lucide-react";
import { ManualRecipeForm } from "./manual-recipe-form";
import { ImportRecipeForm } from "./import-recipe-form";

type Mode = "choose" | "manual" | "url" | "video" | "image";

export function AddRecipeButton() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("choose");

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => setMode("choose"), 200);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setTimeout(() => setMode("choose"), 200); }}>
      <DialogTrigger
        render={<Button />}
      >
        <Plus className="mr-2 h-4 w-4" />
        Add Recipe
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        {mode === "choose" && (
          <>
            <DialogHeader>
              <DialogTitle>Add a recipe</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setMode("manual")}
                className="flex flex-col items-center gap-2 rounded-lg border border-border p-6 text-center transition-colors hover:border-primary/30 hover:bg-muted"
              >
                <PenLine className="h-6 w-6 text-muted-foreground" />
                <span className="text-sm font-medium">Manual entry</span>
                <span className="text-xs text-muted-foreground">
                  Type it in yourself
                </span>
              </button>
              <button
                onClick={() => setMode("url")}
                className="flex flex-col items-center gap-2 rounded-lg border border-border p-6 text-center transition-colors hover:border-primary/30 hover:bg-muted"
              >
                <Link2 className="h-6 w-6 text-muted-foreground" />
                <span className="text-sm font-medium">Paste a URL</span>
                <span className="text-xs text-muted-foreground">
                  Import from any recipe site
                </span>
              </button>
              <button
                onClick={() => setMode("video")}
                className="flex flex-col items-center gap-2 rounded-lg border border-border p-6 text-center transition-colors hover:border-primary/30 hover:bg-muted"
              >
                <Video className="h-6 w-6 text-muted-foreground" />
                <span className="text-sm font-medium">Video link</span>
                <span className="text-xs text-muted-foreground">
                  TikTok, YouTube, Instagram
                </span>
              </button>
              <button
                onClick={() => setMode("image")}
                className="flex flex-col items-center gap-2 rounded-lg border border-border p-6 text-center transition-colors hover:border-primary/30 hover:bg-muted"
              >
                <ImageIcon className="h-6 w-6 text-muted-foreground" />
                <span className="text-sm font-medium">Photo / Screenshot</span>
                <span className="text-xs text-muted-foreground">
                  Recipe cards, screenshots, handwritten
                </span>
              </button>
            </div>
          </>
        )}

        {mode === "manual" && (
          <>
            <DialogHeader>
              <DialogTitle>Add recipe manually</DialogTitle>
            </DialogHeader>
            <ManualRecipeForm onSuccess={handleClose} onBack={() => setMode("choose")} />
          </>
        )}

        {(mode === "url" || mode === "video" || mode === "image") && (
          <>
            <DialogHeader>
              <DialogTitle>
                {mode === "url" && "Import from URL"}
                {mode === "video" && "Import from video"}
                {mode === "image" && "Import from photo"}
              </DialogTitle>
            </DialogHeader>
            <ImportRecipeForm
              mode={mode}
              onSuccess={handleClose}
              onBack={() => setMode("choose")}
            />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
