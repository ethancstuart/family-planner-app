"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ChefHat,
  ArrowRight,
  ArrowLeft,
  Loader2,
  UtensilsCrossed,
  CalendarDays,
  ShoppingCart,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const steps = [
  { id: 1, title: "Name your household" },
  { id: 2, title: "What you can do" },
  { id: 3, title: "Add your first recipe" },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [recipeUrl, setRecipeUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [, setHouseholdCreated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const check = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/");
        return;
      }

      setUserEmail(user.email ?? null);

      const { data: membership } = await supabase
        .from("household_members")
        .select("household_id")
        .eq("user_id", user.id)
        .limit(1)
        .single();

      if (membership) {
        router.push("/dashboard");
        return;
      }

      setChecking(false);
    };
    check();
  }, [router]);

  const handleCreateHousehold = async () => {
    if (!name.trim()) return;
    setLoading(true);

    try {
      const res = await fetch("/api/household/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Could not create household");
        setLoading(false);
        return;
      }

      setHouseholdCreated(true);
      setLoading(false);
      setStep(2);
    } catch {
      toast.error("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const handleFinish = () => {
    if (recipeUrl.trim()) {
      // Store the URL to import after redirect
      sessionStorage.setItem("pending_recipe_url", recipeUrl.trim());
    }
    window.location.href = "/dashboard";
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 80 : -80,
      opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (direction: number) => ({
      x: direction < 0 ? 80 : -80,
      opacity: 0,
    }),
  };

  const features = [
    {
      icon: UtensilsCrossed,
      title: "Save Recipes",
      desc: "Import from any URL, video, or photo with AI",
    },
    {
      icon: CalendarDays,
      title: "Plan Meals",
      desc: "Organize breakfast, lunch, dinner for the week",
    },
    {
      icon: ShoppingCart,
      title: "Grocery Lists",
      desc: "Auto-generate from your meal plan",
    },
  ];

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* Progress dots */}
        <div className="mb-10 flex items-center justify-center gap-2">
          {steps.map((s) => (
            <div
              key={s.id}
              className={`h-2 rounded-full transition-all duration-300 ${
                s.id === step
                  ? "w-8 bg-primary"
                  : s.id < step
                    ? "w-2 bg-primary/50"
                    : "w-2 bg-muted"
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait" custom={step}>
          {step === 1 && (
            <motion.div
              key="step1"
              custom={1}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="space-y-6"
            >
              <div className="space-y-3 text-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1, duration: 0.4, ease: "easeOut" }}
                  className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10"
                >
                  <ChefHat className="h-7 w-7 text-primary" />
                </motion.div>
                <h1 className="text-2xl font-bold tracking-tight">
                  Welcome to Family Planner
                </h1>
                <p className="text-sm text-muted-foreground">
                  Name your household to get started. You can invite family
                  members later.
                </p>
                {userEmail && (
                  <p className="text-xs text-muted-foreground">
                    Signed in as {userEmail}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Household name</Label>
                <Input
                  id="name"
                  placeholder='e.g. "The Stuarts" or "Home"'
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                  required
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleCreateHousehold();
                    }
                  }}
                />
              </div>

              <Button
                onClick={handleCreateHousehold}
                className="w-full"
                size="lg"
                disabled={loading || !name.trim()}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>

              <button
                type="button"
                onClick={handleSignOut}
                className="block w-full text-center text-sm text-muted-foreground hover:text-foreground"
              >
                Sign out
              </button>
              <p className="text-center text-xs text-muted-foreground">
                Have an invite link? Ask your household owner to share it with
                you.
              </p>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              custom={1}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="space-y-6"
            >
              <div className="space-y-3 text-center">
                <h1 className="text-2xl font-bold tracking-tight">
                  Here&apos;s what you can do
                </h1>
                <p className="text-sm text-muted-foreground">
                  Your household is ready. Here&apos;s a quick look at the
                  features.
                </p>
              </div>

              <div className="space-y-3">
                {features.map((feature, i) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: 0.15 + i * 0.1,
                      duration: 0.35,
                      ease: "easeOut",
                    }}
                    className="flex items-start gap-4 rounded-xl border border-border bg-card p-5"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <feature.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">{feature.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {feature.desc}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="w-12"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  className="flex-1"
                  size="lg"
                >
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              custom={1}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="space-y-6"
            >
              <div className="space-y-3 text-center">
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    delay: 0.1,
                    duration: 0.5,
                    type: "spring",
                    bounce: 0.4,
                  }}
                  className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10"
                >
                  <Sparkles className="h-7 w-7 text-primary" />
                </motion.div>
                <h1 className="text-2xl font-bold tracking-tight">
                  Add your first recipe
                </h1>
                <p className="text-sm text-muted-foreground">
                  Paste a recipe URL to get started, or skip this step and add
                  one later.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="recipeUrl">Recipe URL (optional)</Label>
                <Input
                  id="recipeUrl"
                  placeholder="https://www.allrecipes.com/..."
                  value={recipeUrl}
                  onChange={(e) => setRecipeUrl(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep(2)}
                  className="w-12"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Button
                  onClick={handleFinish}
                  className="flex-1"
                  size="lg"
                >
                  {recipeUrl.trim()
                    ? "Go to Dashboard"
                    : "Skip & Go to Dashboard"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
