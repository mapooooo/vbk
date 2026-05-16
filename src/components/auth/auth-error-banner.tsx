"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function parseHashError(hash: string): string | null {
  if (!hash) return null;
  const params = new URLSearchParams(hash.replace(/^#/, ""));
  const code = params.get("error_code") ?? params.get("error");
  if (code === "otp_expired") return "otp_expired";
  if (code === "access_denied") return "access_denied";
  return null;
}

const MESSAGES: Record<string, string> = {
  otp_expired:
    "Login-linket er udløbet. Indtast din e-mail nedenfor for at få en ny login-mail.",
  access_denied:
    "Login blev afvist. Prøv igen med en ny login-mail nedenfor.",
  auth: "Tidligere login mislykkedes. Indtast din e-mail nedenfor for at få en ny login-mail.",
};

export function AuthErrorBanner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [hashError, setHashError] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const fromHash = parseHashError(window.location.hash);
    if (fromHash) {
      setHashError(fromHash);
      const url = new URL(window.location.href);
      url.hash = "";
      window.history.replaceState(null, "", url.pathname + url.search);
    }
  }, []);

  const queryError = searchParams.get("error");
  const errorKey = hashError ?? queryError;

  function dismiss() {
    setDismissed(true);
    setHashError(null);
    if (queryError) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("error");
      const qs = params.toString();
      router.replace(qs ? `/log-ind?${qs}` : "/log-ind");
    }
  }

  if (dismissed || !errorKey || !MESSAGES[errorKey]) return null;

  return (
    <div
      role="alert"
      className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950"
    >
      <div className="flex items-start justify-between gap-2">
        <p>{MESSAGES[errorKey]}</p>
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 text-amber-800 underline hover:no-underline"
          aria-label="Luk"
        >
          Luk
        </button>
      </div>
    </div>
  );
}
