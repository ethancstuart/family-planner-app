"use client";

import { useState } from "react";
import type { User } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserPlus, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface AssignMemberPopoverProps {
  members: User[];
  assignedTo: string | null;
  assignedMember: User | null | undefined;
  onAssign: (userId: string | null) => void;
}

export function AssignMemberPopover({
  members,
  assignedTo,
  assignedMember,
  onAssign,
}: AssignMemberPopoverProps) {
  const [open, setOpen] = useState(false);

  const getInitials = (user: User) =>
    user.full_name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() ||
    user.email[0]?.toUpperCase() ||
    "?";

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex shrink-0 items-center"
        aria-label="Assign member"
      >
        {assignedMember ? (
          <Avatar className="h-6 w-6">
            <AvatarImage src={assignedMember.avatar_url ?? undefined} />
            <AvatarFallback className="bg-primary/10 text-[10px] font-medium text-primary">
              {getInitials(assignedMember)}
            </AvatarFallback>
          </Avatar>
        ) : (
          <div className="flex h-6 w-6 items-center justify-center rounded-full border border-dashed border-muted-foreground/30 text-muted-foreground transition-colors hover:border-primary hover:text-primary">
            <UserPlus className="h-3 w-3" />
          </div>
        )}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-8 z-50 min-w-[180px] rounded-lg border border-border bg-card p-1 shadow-lg">
            {assignedTo && (
              <button
                onClick={() => {
                  onAssign(null);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted"
              >
                <X className="h-3.5 w-3.5" />
                Unassign
              </button>
            )}
            {members.map((member) => (
              <button
                key={member.id}
                onClick={() => {
                  onAssign(member.id);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted",
                  assignedTo === member.id && "bg-primary/10"
                )}
              >
                <Avatar className="h-5 w-5">
                  <AvatarImage src={member.avatar_url ?? undefined} />
                  <AvatarFallback className="bg-primary/10 text-[8px] font-medium text-primary">
                    {getInitials(member)}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate">
                  {member.full_name ?? member.email}
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
