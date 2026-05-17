"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { AuthHashHandler } from "@/components/auth/auth-hash-handler";

function SessionInner() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/auth/complete";
  const target = next.startsWith("/") ? next : "/auth/complete";

  return (
    <main className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4">
      <AuthHashHandler next={target} />
      <p className="text-muted-foreground">Fuldfører login...</p>
    </main>
  );
}

export default function AuthSessionPage() {
  return (
    <Suspense
      fallback={
        <p className="py-16 text-center text-muted-foreground">Indlæser...</p>
      }
    >
      <SessionInner />
    </Suspense>
  );
}
