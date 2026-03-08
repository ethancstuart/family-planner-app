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
      <section className="mx-auto max-w-5xl px-6 pt-28 pb-16 sm:pt-36 sm:pb-24">
        <div className="mx-auto max-w-2xl text-center">
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
      </section>

      {/* How it works — the killer feature */}
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
            ].map((item) => (
              <div key={item.step} className="text-center">
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
            ))}
          </div>
        </div>
      </section>

      {/* Import methods */}
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
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/30 hover:shadow-sm"
              >
                <item.icon className="mb-3 h-6 w-6 text-primary" />
                <h3 className="font-semibold">{item.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features grid */}
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
            ].map((item) => (
              <div
                key={item.title}
                className="flex gap-4 rounded-xl border border-border bg-card p-6"
              >
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
            ))}
          </div>
        </div>
      </section>

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
