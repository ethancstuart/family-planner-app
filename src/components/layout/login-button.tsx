"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface LoginButtonProps {
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
}

export function LoginButton({ variant = "default", size = "default" }: LoginButtonProps) {
  const handleLogin = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <Button onClick={handleLogin} variant={variant} size={size}>
      Get started free
      <ArrowRight className="ml-2 h-4 w-4" />
    </Button>
  );
}
