"use client";

import { useMemo } from "react";
import { motion, AnimatePresence, useAnimate } from "framer-motion";

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  rotation: number;
  targetX: number;
  targetY: number;
  duration: number;
  borderRadius: string;
}

const colors = [
  "oklch(0.70 0.18 45)",   // orange
  "oklch(0.63 0.22 25)",   // red
  "oklch(0.62 0.20 285)",  // violet (primary family)
  "oklch(0.72 0.14 195)",  // cyan
  "oklch(0.72 0.17 155)",  // green
  "oklch(0.80 0.18 95)",   // yellow
  "oklch(0.70 0.20 340)",  // pink
];

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => {
    const x = 50 + (Math.random() - 0.5) * 60;
    return {
      id: i,
      x,
      y: 50,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 4 + Math.random() * 6,
      rotation: Math.random() * 360,
      targetX: x + (Math.random() - 0.5) * 40,
      targetY: 50 - 30 - Math.random() * 40,
      duration: 1.2 + Math.random() * 0.5,
      borderRadius: Math.random() > 0.5 ? "50%" : "2px",
    };
  });
}

interface CelebrationProps {
  trigger: boolean;
  onComplete?: () => void;
}

export function Celebration({ trigger, onComplete }: CelebrationProps) {
  // Generate particles once per trigger change; stable when trigger is false
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const particles = useMemo(() => generateParticles(24), [trigger]);

  return (
    <AnimatePresence
      onExitComplete={() => {
        if (!trigger) onComplete?.();
      }}
    >
      {trigger && (
        <CelebrationOverlay particles={particles} />
      )}
    </AnimatePresence>
  );
}

function CelebrationOverlay({ particles }: { particles: Particle[] }) {
  const [scope, animate] = useAnimate();

  // Auto-dismiss after animation completes (handled by parent via onComplete)
  return (
    <motion.div
      ref={scope}
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="pointer-events-none fixed inset-0 z-[100] overflow-hidden"
      onAnimationComplete={() => {
        // Fade out after particles have animated
        animate(scope.current, { opacity: 0 }, { delay: 1.2 });
      }}
    >
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            scale: 0,
            rotate: 0,
            opacity: 1,
          }}
          animate={{
            left: `${p.targetX}%`,
            top: `${p.targetY}%`,
            scale: [0, 1.2, 1],
            rotate: p.rotation,
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: p.duration,
            ease: "easeOut",
          }}
          className="absolute"
          style={{
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: p.borderRadius,
          }}
        />
      ))}
    </motion.div>
  );
}
