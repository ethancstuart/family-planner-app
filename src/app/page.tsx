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
      <nav className="fixed top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <ChefHat className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold">Family Planner</span>
          </div>
          <LoginButton variant="outline" size="sm" />
        </div>
      </nav>

      {/* Hero */}
      <section className="relative mx-auto max-w-5xl px-6 pt-28 pb-16 sm:pt-36 sm:pb-24">
        {/* Radial gradient background */}
        <div className="pointer-events-none absolute inset-0 -top-20 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,oklch(0.55_0.18_38/0.12),transparent)]" />

        <HeroAnimations>
          <div className="relative mx-auto max-w-2xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              AI-powered recipe import
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Your family&apos;s recipes,{" "}
              <span className="text-primary">finally organized</span>
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

          {/* Browser mockup */}
          <div className="relative mx-auto mt-16 max-w-3xl" style={{ perspective: "1200px" }}>
            <div
              className="overflow-hidden rounded-xl border border-border bg-card shadow-2xl dark:shadow-black/40"
              style={{ transform: "rotateX(4deg)" }}
            >
              {/* Title bar */}
              <div className="flex items-center gap-2 border-b border-border bg-muted/50 px-4 py-2.5">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-400/60" />
                  <div className="h-3 w-3 rounded-full bg-yellow-400/60" />
                  <div className="h-3 w-3 rounded-full bg-green-400/60" />
                </div>
                <div className="mx-auto rounded-md bg-muted px-12 py-1 text-[10px] text-muted-foreground">
                  familyplanner.app/dashboard
                </div>
              </div>
              {/* Fake dashboard content */}
              <div className="p-6">
                <div className="mb-4 flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-primary/20" />
                  <div className="h-4 w-28 rounded bg-foreground/10" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {["Recipe Vault", "Meal Plan", "Grocery List"].map((label) => (
                    <div
                      key={label}
                      className="rounded-lg border border-border bg-muted/30 p-3"
                    >
                      <div className="mb-2 h-3 w-3 rounded bg-primary/30" />
                      <div className="h-3 w-16 rounded bg-foreground/8" />
                      <div className="mt-1 h-2 w-12 rounded bg-foreground/5" />
                    </div>
                  ))}
                </div>
                <div className="mt-3 grid grid-cols-3 gap-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="rounded-lg border border-border bg-muted/30 p-3"
                    >
                      <div className="mb-2 h-6 w-full rounded bg-primary/10" />
                      <div className="h-2 w-full rounded bg-foreground/5" />
                      <div className="mt-1 h-2 w-2/3 rounded bg-foreground/5" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </HeroAnimations>
      </section>

      {/* How it works — the killer feature */}
      <ScrollReveal>
        <section className="border-y border-border bg-muted/30 py-16 sm:py-24">
          <div className="mx-auto max-w-5xl px-6">
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
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div className="mb-2 text-xs font-bold uppercase tracking-widest text-primary">
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
          <div className="mx-auto max-w-5xl px-6">
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
                  <div className="rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/30 hover:shadow-sm hover:-translate-y-0.5">
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
        <section className="border-y border-border bg-muted/30 py-16 sm:py-24">
          <div className="mx-auto max-w-5xl px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Everything your family needs
              </h2>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-2">
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
                  status: "Coming soon",
                },
                {
                  icon: ShoppingCart,
                  title: "Smart Grocery Lists",
                  desc: "Auto-generate from your meal plan. Smart ingredient merging, aisle grouping, and a tap-to-check shopping mode.",
                  status: "Coming soon",
                },
                {
                  icon: ListTodo,
                  title: "Family To-Do",
                  desc: "Shared task lists for chores, errands, and school stuff. Assign to family members, set recurring schedules.",
                  status: "Coming soon",
                },
              ].map((item, i) => (
                <StaggerItem key={item.title} index={i}>
                  <div className="flex gap-4 rounded-xl border border-border bg-card p-6 transition-all hover:-translate-y-0.5 hover:shadow-sm">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{item.title}</h3>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${
                            item.status === "Live"
                              ? "bg-accent/10 text-accent"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
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
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-5xl px-6 text-center">
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
      <footer className="border-t border-border py-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-2 px-6 text-center text-sm text-muted-foreground">
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
