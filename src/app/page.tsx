"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChefHat, Lock } from "lucide-react";

export default function PinLockPage() {
  const [pin, setPin] = useState(["", "", "", ""]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    // Only allow digits
    const digit = value.replace(/\D/g, "").slice(-1);
    const newPin = [...pin];
    newPin[index] = digit;
    setPin(newPin);
    setError(false);

    // Auto-advance to next input
    if (digit && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 4 digits entered
    if (digit && index === 3) {
      const fullPin = newPin.join("");
      if (fullPin.length === 4) {
        submitPin(fullPin);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "Enter") {
      const fullPin = pin.join("");
      if (fullPin.length === 4) {
        submitPin(fullPin);
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    if (pasted.length === 4) {
      const newPin = pasted.split("");
      setPin(newPin);
      submitPin(pasted);
    }
  };

  const submitPin = async (fullPin: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: fullPin }),
      });

      if (res.ok) {
        router.push("/dashboard");
        router.refresh();
      } else {
        setError(true);
        setPin(["", "", "", ""]);
        inputRefs.current[0]?.focus();
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 bg-background">
      {/* Subtle gradient background */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,oklch(0.72_0.20_285/0.08),transparent)]" />

      <div className="relative w-full max-w-xs space-y-8 text-center">
        {/* Logo */}
        <div className="space-y-3">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <ChefHat className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Stuart Family</h1>
          <p className="text-sm text-muted-foreground">Enter PIN to continue</p>
        </div>

        {/* PIN inputs */}
        <div className="flex justify-center gap-4">
          {pin.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={i === 0 ? handlePaste : undefined}
              disabled={loading}
              className={`h-16 w-14 rounded-xl border-2 bg-card text-center text-2xl font-bold transition-all
                focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20
                ${error ? "border-destructive animate-shake" : "border-border"}
                ${loading ? "opacity-50" : ""}
              `}
              aria-label={`PIN digit ${i + 1}`}
            />
          ))}
        </div>

        {/* Error message */}
        {error && (
          <div className="flex items-center justify-center gap-2 text-sm text-destructive">
            <Lock className="h-4 w-4" />
            Wrong PIN. Try again.
          </div>
        )}

        {/* Subtle hint */}
        <p className="text-xs text-muted-foreground/50">
          Family Planner
        </p>
      </div>
    </div>
  );
}
