"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Check, Unlink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface CalendarConnectionBannerProps {
  isConnected: boolean;
  showSuccess?: boolean;
}

export function CalendarConnectionBanner({
  isConnected,
  showSuccess,
}: CalendarConnectionBannerProps) {
  const router = useRouter();
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      const res = await fetch("/api/calendar/auth");
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error("Failed to start Google Calendar connection");
        setConnecting(false);
      }
    } catch {
      toast.error("Failed to connect");
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    setDisconnecting(true);
    try {
      const res = await fetch("/api/calendar/disconnect", { method: "POST" });
      if (res.ok) {
        toast.success("Google Calendar disconnected");
        router.refresh();
      } else {
        toast.error("Failed to disconnect");
      }
    } catch {
      toast.error("Failed to disconnect");
    } finally {
      setDisconnecting(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Connect Google Calendar</h3>
              <p className="mt-0.5 text-sm text-muted-foreground">
                See your schedule alongside meal plans and sync planned meals as
                calendar events.
              </p>
            </div>
          </div>
          <Button onClick={handleConnect} disabled={connecting}>
            {connecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              "Connect"
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-2.5">
      <div className="flex items-center gap-2">
        {showSuccess ? (
          <Check className="h-4 w-4 text-green-500" />
        ) : (
          <Calendar className="h-4 w-4 text-primary" />
        )}
        <span className="text-sm font-medium">
          {showSuccess ? "Google Calendar connected!" : "Google Calendar connected"}
        </span>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDisconnect}
        disabled={disconnecting}
        className="text-muted-foreground"
      >
        {disconnecting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <Unlink className="mr-1.5 h-3.5 w-3.5" />
            Disconnect
          </>
        )}
      </Button>
    </div>
  );
}
