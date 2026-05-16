"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, MessageCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/hjem", label: "Hjem", icon: Home },
  { href: "/tilmelding", label: "Tilmelding", icon: Calendar },
  { href: "/beskeder", label: "Beskeder", icon: MessageCircle },
  { href: "/profil", label: "Profil", icon: User },
];

export function MemberNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-lg justify-around">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex min-h-[56px] min-w-[72px] flex-col items-center justify-center gap-0.5 px-2 py-2 text-xs transition",
                active ? "text-[#5B9BD5] font-medium" : "text-muted-foreground"
              )}
            >
              <Icon className="h-6 w-6" aria-hidden />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
