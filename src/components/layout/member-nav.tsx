"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Calendar,
  Home,
  LayoutDashboard,
  MessageCircle,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

const baseTabs = [
  { href: "/hjem", label: "Hjem", icon: Home },
  { href: "/tilmelding", label: "Tilmelding", icon: Calendar },
  { href: "/beskeder", label: "Beskeder", icon: MessageCircle },
] as const;

export function MemberNav({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname();

  const tabs = [
    ...baseTabs,
    ...(isAdmin
      ? [{ href: "/admin", label: "Admin", icon: LayoutDashboard } as const]
      : []),
    { href: "/profil", label: "Profil", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur md:hidden">
      <div className="mx-auto flex w-full max-w-lg">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/profil"
              ? pathname === "/profil"
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex min-h-[56px] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-1 py-2 text-[11px] transition sm:text-xs",
                active
                  ? "font-medium text-[#5B9BD5]"
                  : "text-muted-foreground"
              )}
            >
              <Icon className="h-6 w-6 shrink-0" aria-hidden />
              <span className="truncate">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
