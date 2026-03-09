"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedCheckboxProps {
  checked: boolean;
  onToggle: () => void;
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
}

const sizes = {
  sm: { box: "h-4 w-4", icon: 12 },
  md: { box: "h-5 w-5", icon: 14 },
  lg: { box: "h-6 w-6", icon: 16 },
};

export function AnimatedCheckbox({
  checked,
  onToggle,
  size = "md",
  className,
  label,
}: AnimatedCheckboxProps) {
  const s = sizes[size];

  return (
    <motion.button
      onClick={onToggle}
      className={cn(
        "flex shrink-0 items-center justify-center rounded-md border-2 transition-colors",
        s.box,
        checked
          ? "border-primary bg-primary text-primary-foreground"
          : "border-muted-foreground/30 hover:border-primary",
        className
      )}
      animate={checked ? { scale: [1, 1.15, 1] } : { scale: 1 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      aria-label={label || (checked ? "Uncheck" : "Check")}
    >
      <svg
        width={s.icon}
        height={s.icon}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <motion.path
          d="M5 13l4 4L19 7"
          initial={false}
          animate={{ pathLength: checked ? 1 : 0, opacity: checked ? 1 : 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
      </svg>
    </motion.button>
  );
}
