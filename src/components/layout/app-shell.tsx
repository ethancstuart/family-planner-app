"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import {
  ChefHat,
  UtensilsCrossed,
  LayoutDashboard,
  Settings,
  LogOut,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const navItems = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/recipes", label: "Recipes", icon: UtensilsCrossed },
  { href: "/settings", label: "Settings", icon: Settings },
];

interface AppShellProps {
  user: User;
  children: React.ReactNode;
}

export function AppShell({ user, children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  const initials =
    user.user_metadata?.full_name
      ?.split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase() ||
    user.email?.[0]?.toUpperCase() ||
    "?";

  return (
    <div className="min-h-screen pb-16 md:pb-0">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-60 flex-col border-r border-border bg-card md:flex">
        <div className="flex h-14 items-center gap-2.5 border-b border-border px-5">
          <ChefHat className="h-5 w-5 text-primary" />
          <span className="font-bold">Family Planner</span>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  isActive
                    ? "bg-primary/10 font-medium text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border p-3 space-y-2">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Sun className="h-4 w-4 dark:hidden" />
            <Moon className="hidden h-4 w-4 dark:block" />
            <span className="dark:hidden">Dark mode</span>
            <span className="hidden dark:inline">Light mode</span>
          </button>
          <div className="flex items-center gap-3 rounded-lg px-3 py-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.user_metadata?.avatar_url} />
              <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {user.user_metadata?.full_name ?? user.email}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              className="h-8 w-8 shrink-0"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="fixed top-0 z-50 flex h-14 w-full items-center justify-between border-b border-border bg-card/80 px-4 backdrop-blur-md md:hidden">
        <div className="flex items-center gap-2">
          <ChefHat className="h-5 w-5 text-primary" />
          <span className="font-bold">Family Planner</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="h-9 w-9"
            aria-label="Toggle theme"
          >
            <Sun className="h-4 w-4 dark:hidden" />
            <Moon className="hidden h-4 w-4 dark:block" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSignOut}
            className="h-9 w-9"
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 z-50 flex w-full items-center justify-around border-t border-border bg-card/95 backdrop-blur-md md:hidden">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center gap-1 py-3 text-[10px] font-medium transition-colors ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Main content */}
      <main className="pt-14 md:pt-0 md:pl-60">
        <div className="mx-auto max-w-5xl p-4 sm:p-6">{children}</div>
      </main>
    </div>
  );
}
