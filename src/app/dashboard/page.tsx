import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  // Check if user has a household, if not redirect to onboarding
  const { data: memberships } = await supabase
    .from("household_members")
    .select("household_id, role, households(id, name)")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (!memberships) {
    redirect("/dashboard/onboarding");
  }

  return (
    <AppShell user={user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user.user_metadata?.full_name?.split(" ")[0] ?? "there"}.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            { title: "Recipes", value: "--", href: "/recipes" },
            { title: "This Week", value: "No meal plan", href: "/meal-planner" },
            { title: "Grocery Items", value: "--", href: "/grocery" },
            { title: "To-Dos", value: "--", href: "/todos" },
          ].map((card) => (
            <a
              key={card.title}
              href={card.href}
              className="rounded-lg border border-border bg-card p-6 transition-colors hover:border-primary/30"
            >
              <p className="text-sm text-muted-foreground">{card.title}</p>
              <p className="mt-1 text-2xl font-semibold">{card.value}</p>
            </a>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
