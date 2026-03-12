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
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PageTransition } from "./page-transition";

const mobileNavItems = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/recipes", label: "Recipes", icon: UtensilsCrossed },
  { href: "/meal-planner", label: "Meals", icon: CalendarDays },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/grocery", label: "Grocery", icon: ShoppingCart },
  { href: "/todos", label: "To-Do", icon: ListTodo },
];

const desktopNavItems = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/recipes", label: "Recipes", icon: UtensilsCrossed },
  { href: "/recipes/discover", label: "Discover", icon: Compass },
  { href: "/meal-planner", label: "Meals", icon: CalendarDays },
  { href: "/grocery", label: "Grocery", icon: ShoppingCart },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/todos", label: "To-Do", icon: ListTodo },
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
      <aside className="glass fixed inset-y-0 left-0 z-50 hidden w-60 flex-col md:flex">
        <div className="flex h-14 items-center gap-2.5 border-b border-white/[0.06] px-5">
          <ChefHat className="h-5 w-5 text-primary" />
          <span className="font-bold gradient-text">Family Planner</span>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {desktopNavItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors text-muted-foreground hover:bg-white/5 hover:text-foreground"
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-indicator"
                    className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/15 to-accent/10"
                    transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
                  />
                )}
                {isActive && (
                  <motion.div
                    layoutId="sidebar-bar"
                    className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full bg-gradient-to-b from-primary to-accent"
                    transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
                  />
                )}
                <item.icon
                  className={`relative h-4 w-4 ${isActive ? "text-primary drop-shadow-[0_0_6px_oklch(0.72_0.19_25/0.5)]" : ""}`}
                />
                <span className={`relative ${isActive ? "font-medium text-foreground" : ""}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/[0.06] p-3 space-y-2">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
          >
            <Sun className="h-4 w-4 dark:hidden" />
            <Moon className="hidden h-4 w-4 dark:block" />
            <span className="dark:hidden">Dark mode</span>
            <span className="hidden dark:inline">Light mode</span>
          </button>
          <div className="glass-subtle flex items-center gap-3 rounded-lg px-3 py-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.user_metadata?.avatar_url} />
              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/10 text-xs font-medium text-primary">
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
      <header className="glass fixed top-0 z-50 flex h-14 w-full items-center justify-between px-4 md:hidden">
        <div className="flex items-center gap-2">
          <ChefHat className="h-5 w-5 text-primary" />
          <span className="font-bold gradient-text">Family Planner</span>
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
            className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-white/5"
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
      <nav className="glass fixed bottom-0 z-50 flex w-full items-center justify-around md:hidden">
        {mobileNavItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <motion.div key={item.href} whileTap={{ scale: 0.95 }} className="flex-1">
              <Link
                href={item.href}
                className="relative flex flex-col items-center gap-1 py-3 text-[10px] font-medium transition-colors text-muted-foreground"
              >
                {isActive && (
                  <motion.div
                    layoutId="bottom-indicator"
                    className="absolute inset-x-2 top-1.5 bottom-1.5 rounded-xl bg-gradient-to-b from-primary/15 to-accent/10"
                    transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
                  />
                )}
                <motion.div
                  animate={isActive ? { scale: 1.15 } : { scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <item.icon className={`relative h-5 w-5 ${isActive ? "text-primary drop-shadow-[0_0_6px_oklch(0.72_0.19_25/0.5)]" : ""}`} />
                </motion.div>
                <span className={`relative ${isActive ? "text-primary" : ""}`}>{item.label}</span>
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* Main content */}
      <main className="pt-14 md:pt-0 md:pl-60">
        <div className="mx-auto max-w-6xl p-4 sm:p-6">
          <PageTransition key={pathname}>{children}</PageTransition>
        </div>
      </main>
    </div>
  );
}
