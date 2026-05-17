"use client";

import { badgeVariants } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { UserAvatar } from "@/components/ui/user-avatar";
import type { EventParticipant } from "@/lib/types";
import { ChevronDown, Users } from "lucide-react";
import { cn } from "@/lib/utils";

export function EventParticipantsBadge({
  registeredCount,
  capacity,
  participants,
}: {
  registeredCount: number;
  capacity: number;
  participants: EventParticipant[];
}) {
  const registered = participants.filter((p) => p.status === "registered");
  const waitlist = participants.filter((p) => p.status === "waitlist");

  return (
    <Popover>
      <PopoverTrigger
        className={cn(
          badgeVariants({ variant: "secondary" }),
          "cursor-pointer hover:bg-secondary/70"
        )}
        aria-label={`${registeredCount} af ${capacity} tilmeldt — vis deltagere`}
      >
        <Users className="h-3 w-3" />
        {registeredCount}/{capacity} tilmeldt
        <ChevronDown className="h-3 w-3 opacity-50" />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 p-0">
        <PopoverHeader className="border-b px-3 py-2.5">
          <PopoverTitle className="font-serif text-base">
            Deltagere
          </PopoverTitle>
          <p className="text-xs text-muted-foreground">
            {registeredCount} af {capacity} pladser optaget
          </p>
        </PopoverHeader>
        <div className="max-h-64 overflow-y-auto p-2">
          {registered.length === 0 && waitlist.length === 0 ? (
            <p className="px-2 py-3 text-center text-sm text-muted-foreground">
              Ingen tilmeldte endnu
            </p>
          ) : (
            <>
              {registered.length > 0 && (
                <ParticipantSection title="Tilmeldte" items={registered} />
              )}
              {waitlist.length > 0 && (
                <ParticipantSection
                  title="Venteliste"
                  items={waitlist}
                  className={registered.length > 0 ? "mt-2 border-t pt-2" : ""}
                />
              )}
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function ParticipantSection({
  title,
  items,
  className,
}: {
  title: string;
  items: EventParticipant[];
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="px-2 pb-1 text-xs font-medium text-muted-foreground">
        {title}
      </p>
      <ul className="space-y-0.5">
        {items.map((p, i) => (
          <li
            key={`${p.full_name}-${i}`}
            className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted/60"
          >
            <UserAvatar
              profile={{ full_name: p.full_name, avatar_url: p.avatar_url }}
              size="sm"
            />
            <span className="truncate text-sm">{p.full_name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
