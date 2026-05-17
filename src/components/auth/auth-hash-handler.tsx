"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * Supabase admin.generateLink sender ofte access_token i URL-hashen.
 * Server-routes kan ikke læse hash — denne komponent etablerer sessionen.
 */
export function AuthHashHandler({
  next = "/auth/complete",
}: {
  next?: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "working" | "done" | "none">(
    "idle"
  );

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash || !hash.includes("access_token")) {
      setStatus("none");
      return;
    }

    setStatus("working");

    const params = new URLSearchParams(hash.replace(/^#/, ""));
    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token");

    if (!access_token || !refresh_token) {
      setStatus("none");
      return;
    }

    const supabase = createClient();

    supabase.auth
      .setSession({ access_token, refresh_token })
      .then(({ error }) => {
        const cleanUrl = new URL(window.location.href);
        cleanUrl.hash = "";
        cleanUrl.searchParams.delete("error");
        window.history.replaceState(
          null,
          "",
          cleanUrl.pathname + cleanUrl.search
        );

        if (error) {
          console.error("auth hash setSession:", error.message);
          router.replace("/log-ind?error=auth");
          return;
        }

        setStatus("done");
        const target = next.startsWith("/") ? next : "/auth/complete";
        router.replace(target);
        router.refresh();
      });
  }, [next, router]);

  if (status === "none" || status === "idle") return null;

  return (
    <p className="py-6 text-center text-muted-foreground">
      {status === "working" || status === "done"
        ? "Logger dig ind..."
        : null}
    </p>
  );
}
