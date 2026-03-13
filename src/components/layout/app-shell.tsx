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
  CalendarDays,
  ShoppingCart,
  ListTodo,
  Compass,
  Calendar,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PageTransition } from "./page-transition";

const navItems = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/recipes", label: "Recipes", icon: UtensilsCrossed },
  { href: "/recipes/discover", label: "Discover", icon: Compass },
  { href: "/meal-planner", label: "Meals", icon: CalendarDays },
  { href: "/grocery", label: "Grocery", icon: ShoppingCart },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/todos", label: "To-Do", icon: ListTodo },
];

const mobileNavItems = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/recipes", label: "Recipes", icon: UtensilsCrossed },
  { href: "/meal-planner", label: "Meals", icon: CalendarDays },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/grocery", label: "Grocery", icon: ShoppingCart },
  { href: "/todos", label: "To-Do", icon: ListTodo },
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
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-2 focus:left-2 focus:rounded focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Skip to content
      </a>

      {/* Desktop top nav */}
      <header className="fixed top-0 z-50 hidden w-full border-b border-border bg-card/95 backdrop-blur-sm md:block">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-1 px-4">
          {/* Logo */}
          <Link href="/dashboard" className="mr-4 flex items-center gap-2">
            <ChefHat className="h-5 w-5 text-primary" />
            <span className="font-bold text-primary">Family Planner</span>
          </Link>

          {/* Nav items */}
          <nav className="flex items-center gap-0.5" aria-label="Main navigation">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted hover:text-foreground ${
                    isActive
                      ? "bg-primary/10 text-foreground font-medium after:absolute after:inset-x-3 after:bottom-0 after:h-[2px] after:rounded-full after:bg-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  <item.icon
                    className={`h-4 w-4 ${isActive ? "text-primary" : ""}`}
                  />
                  <span>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Right side: settings, theme, avatar */}
          <div className="ml-auto flex items-center gap-1">
            <Link
              href="/settings"
              className={`relative flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-muted ${
                pathname === "/settings" ? "text-primary" : "text-muted-foreground"
              }`}
              aria-label="Settings"
            >
              <Settings className="h-4 w-4" />
            </Link>
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
            <div className="ml-1 flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-primary/15 text-xs font-medium text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
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
        </div>
      </header>

      {/* Mobile top bar */}
      <header className="fixed top-0 z-50 flex h-14 w-full items-center justify-between border-b border-border bg-card/95 backdrop-blur-sm px-4 md:hidden">
        <div className="flex items-center gap-2">
          <ChefHat className="h-5 w-5 text-primary" />
          <span className="font-bold text-primary">Family Planner</span>
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
          <Link
            href="/settings"
            className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-muted"
            aria-label="Settings"
          >
            <Settings className="h-4 w-4" />
          </Link>
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
      <nav className="fixed bottom-0 z-50 flex w-full items-center justify-around border-t border-border bg-card/95 backdrop-blur-sm md:hidden" aria-label="Mobile navigation">
        {mobileNavItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <div key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`flex flex-col items-center gap-1 py-3 text-[10px] font-medium transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            </div>
          );
        })}
      </nav>

      {/* Main content — full width, no sidebar offset */}
      <main className="pt-14" id="main-content">
        <div className="mx-auto max-w-7xl p-4 sm:p-6">
          <PageTransition key={pathname}>{children}</PageTransition>
        </div>
      </main>
    </div>
  );
}
