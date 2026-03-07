import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { LoginButton } from "@/components/layout/login-button";
import {
  UtensilsCrossed,
  CalendarDays,
  ShoppingCart,
  ListTodo,
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
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-2">
            <ChefHat className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">
              Family Planner
            </h1>
          </div>
          <p className="text-muted-foreground">
            Your family command center. Recipes, meals, groceries, calendar, and
            to-dos — all in one place.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 text-left">
          {[
            {
              icon: UtensilsCrossed,
              title: "Recipe Vault",
              desc: "Store, import, and discover recipes",
            },
            {
              icon: CalendarDays,
              title: "Meal Planner",
              desc: "Plan your week, drag and drop",
            },
            {
              icon: ShoppingCart,
              title: "Grocery Lists",
              desc: "Auto-generate from meal plans",
            },
            {
              icon: ListTodo,
              title: "Family To-Do",
              desc: "Shared tasks and chores",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="rounded-lg border border-border bg-card p-4"
            >
              <feature.icon className="mb-2 h-5 w-5 text-muted-foreground" />
              <p className="text-sm font-medium">{feature.title}</p>
              <p className="text-xs text-muted-foreground">{feature.desc}</p>
            </div>
          ))}
        </div>

        <LoginButton />

        <p className="text-xs text-muted-foreground">
          Open source. Built with Claude Code.
        </p>
      </div>
    </div>
  );
}
