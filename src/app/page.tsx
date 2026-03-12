import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { LoginButton } from "@/components/layout/login-button";
import {
  UtensilsCrossed,
  CalendarDays,
  ShoppingCart,
  ListTodo,
  Sparkles,
  Link2,
  Camera,
  Video,
  ArrowRight,
  ChefHat,
} from "lucide-react";
import { HeroAnimations, ScrollReveal, StaggerItem } from "@/components/landing/hero-animations";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="glass fixed top-0 z-50 w-full border-b border-white/[0.06]">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <ChefHat className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold gradient-text">Family Planner</span>
          </div>
          <LoginButton variant="outline" size="sm" />
        </div>
      </nav>

      {/* Hero */}
      <section className="relative mx-auto max-w-6xl px-6 pt-28 pb-16 sm:pt-36 sm:pb-24">
        {/* Radial gradient background — multi-stop coral + violet */}
        <div className="pointer-events-none absolute inset-0 -top-20 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,oklch(0.72_0.19_25/0.15),oklch(0.72_0.16_280/0.08),transparent)]" />

        <HeroAnimations>
          <div className="relative mx-auto max-w-2xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              AI-powered recipe import
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Your family&apos;s recipes,{" "}
              <span className="gradient-text">finally organized</span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground sm:text-xl">
              Paste a TikTok link and get a structured recipe in seconds. Plan
              your week&apos;s meals, auto-generate grocery lists, and never ask
              &ldquo;what&apos;s for dinner?&rdquo; again.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <LoginButton size="lg" />
              <span className="text-sm text-muted-foreground">
                Free forever. No credit card.
              </span>
            </div>
          </div>

          {/* Floating recipe card mockup */}
          <div className="relative mx-auto mt-16 max-w-xs" style={{ perspective: "1200px" }}>
            <div
              className="animate-float surface-glow overflow-hidden rounded-xl border border-white/[0.06] bg-card"
              style={{ transform: "rotateY(-6deg) rotateX(4deg)" }}
            >
              {/* Fake image area */}
              <div className="h-40 bg-gradient-to-br from-rose-500/25 to-pink-500/10" />
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">Lemon Herb Chicken</p>
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-card/90 shadow-sm">
                    <span className="text-red-500 text-xs">&#9829;</span>
                  </div>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">Crispy skin, bright citrus glaze</p>
                <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                  <span>45m</span>
                  <span>4 servings</span>
                  <span>8 ingredients</span>
                </div>
                <div className="mt-3 flex gap-1.5">
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">dinner</span>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">quick</span>
                </div>
              </div>
            </div>
          </div>
        </HeroAnimations>
      </section>

      {/* How it works — the killer feature */}
      <ScrollReveal>
        <section className="border-y border-white/[0.06] bg-muted/30 py-16 sm:py-24">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                From TikTok to dinner table in 3 steps
              </h2>
              <p className="mt-3 text-muted-foreground">
                Stop screenshotting recipes you&apos;ll never find again.
              </p>
            </div>

            <div className="mt-12 grid gap-8 sm:grid-cols-3">
              {[
                {
                  step: "1",
                  icon: Link2,
                  title: "Paste any link",
                  desc: "TikTok, YouTube, Instagram, recipe blogs — drop it in and our AI reads it for you.",
                },
                {
                  step: "2",
                  icon: Sparkles,
                  title: "AI extracts the recipe",
                  desc: "Ingredients, steps, cook time, servings — structured and ready. Review and edit before saving.",
                },
                {
                  step: "3",
                  icon: ShoppingCart,
                  title: "Plan meals, make lists",
                  desc: "Drag recipes onto your weekly meal plan. One click generates your grocery list.",
                },
              ].map((item, i) => (
                <StaggerItem key={item.step} index={i}>
                  <div className="text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary/15 to-accent/10 text-primary">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div className="mb-2 text-xs font-bold uppercase tracking-widest gradient-text">
                      Step {item.step}
                    </div>
                    <h3 className="text-lg font-semibold">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {item.desc}
                    </p>
                  </div>
                </StaggerItem>
              ))}
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* Import methods */}
      <ScrollReveal>
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                4 ways to save a recipe
              </h2>
              <p className="mt-3 text-muted-foreground">
                However you find recipes, we can capture them.
              </p>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  icon: Link2,
                  title: "Paste a URL",
                  desc: "AllRecipes, NYT Cooking, food blogs",
                },
                {
                  icon: Video,
                  title: "Video links",
                  desc: "TikTok, YouTube, Instagram Reels",
                },
                {
                  icon: Camera,
                  title: "Photo or screenshot",
                  desc: "Recipe cards, handwritten, screenshots",
                },
                {
                  icon: UtensilsCrossed,
                  title: "Type it in",
                  desc: "Grandma's recipe from memory",
                },
              ].map((item, i) => (
                <StaggerItem key={item.title} index={i}>
                  <div className="rounded-xl border border-white/[0.06] border-t-2 border-t-primary/40 bg-card p-6 surface-raised transition-all hover:surface-glow hover:-translate-y-0.5">
                    <item.icon className="mb-3 h-6 w-6 text-primary" />
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {item.desc}
                    </p>
                  </div>
                </StaggerItem>
              ))}
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* Features grid */}
      <ScrollReveal>
        <section className="border-y border-white/[0.06] bg-muted/30 py-16 sm:py-24">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Everything your family needs
              </h2>
            </div>

            <div className="mt-12 space-y-8">
              {[
                {
                  icon: UtensilsCrossed,
                  title: "Recipe Vault",
                  desc: "Store every recipe your family loves. Search by ingredient, tag, or name. Favorites, categories, and source tracking.",
                  status: "Live",
                },
                {
                  icon: CalendarDays,
                  title: "Meal Planner",
                  desc: "Plan breakfast, lunch, dinner, and snacks for the week. Drag and drop from your vault. Template weeks for easy reuse.",
                  status: "Live",
                },
                {
                  icon: ShoppingCart,
                  title: "Smart Grocery Lists",
                  desc: "Auto-generate from your meal plan. Smart ingredient merging, aisle grouping, and a tap-to-check shopping mode.",
                  status: "Live",
                },
                {
                  icon: ListTodo,
                  title: "Family To-Do",
                  desc: "Shared task lists for chores, errands, and school stuff. Assign to family members, set due dates, and track progress.",
                  status: "Live",
                },
              ].map((item, i) => (
                <StaggerItem key={item.title} index={i}>
                  <div className={`flex flex-col gap-6 sm:flex-row sm:items-center ${i % 2 !== 0 ? "sm:flex-row-reverse" : ""}`}>
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-accent/10 sm:h-24 sm:w-24">
                      <item.icon className="h-8 w-8 text-primary sm:h-10 sm:w-10" />
                    </div>
                    <div className={i % 2 !== 0 ? "sm:text-right" : ""}>
                      <div className={`flex items-center gap-2 ${i % 2 !== 0 ? "sm:justify-end" : ""}`}>
                        <h3 className="text-xl font-semibold">{item.title}</h3>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${
                            item.status === "Live"
                              ? "bg-gradient-to-r from-primary/15 to-accent/10 text-primary"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* CTA */}
      <section className="relative py-16 sm:py-24 overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_50%,oklch(0.72_0.19_25/0.15),oklch(0.72_0.16_280/0.08),transparent)]" />
        <div className="relative mx-auto max-w-6xl px-6 text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Ready to organize your family&apos;s meals?
          </h2>
          <p className="mt-3 text-muted-foreground">
            Start saving recipes in under a minute. Free, open source, no strings.
          </p>
          <div className="mt-8">
            <LoginButton size="lg" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-6 text-center text-sm text-muted-foreground">
          <p>
            Open source on{" "}
            <a
              href="https://github.com/ethancstuart/family-planner-app"
              className="underline underline-offset-4 hover:text-foreground"
            >
              GitHub
            </a>
            . Built with Claude Code.
          </p>
        </div>
      </footer>
    </div>
  );
}
