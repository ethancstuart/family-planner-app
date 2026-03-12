"use client";

import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  illustration?: React.ReactNode;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  illustration,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="relative flex flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-primary/20 px-6 py-20 text-center"
    >
      {/* Animated gradient background */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-accent/4" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,oklch(0.72_0.19_25/0.06),transparent)]" />

      <div className="relative">
        {illustration || (
          <div className="animate-float mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary/15 to-accent/10">
            <Icon className="h-7 w-7 text-primary" />
          </div>
        )}
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          {description}
        </p>
        {actionLabel && (actionHref || onAction) && (
          <div className="mt-6">
            {actionHref ? (
              <Link
                href={actionHref}
                className="inline-flex h-8 items-center justify-center rounded-lg bg-gradient-to-r from-primary to-accent px-2.5 text-sm font-medium text-primary-foreground shadow-sm shadow-primary/25 transition-all hover:shadow-md hover:brightness-110"
              >
                {actionLabel}
              </Link>
            ) : (
              <Button onClick={onAction}>{actionLabel}</Button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
