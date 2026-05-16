"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { RequestLoginDebug } from "@/lib/auth/login-debug";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoginDebugPanel } from "@/components/auth/login-debug-panel";
import { toast } from "sonner";

type Step = "email" | "sent";
type LoginMode = "magic" | "password";

export function MemberLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/hjem";

  const [mode, setMode] = useState<LoginMode>("magic");
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [debug, setDebug] = useState<RequestLoginDebug | null>(null);

  async function handleRequestLink(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setDebug(null);

    const normalizedEmail = email.trim().toLowerCase();

    const res = await fetch("/api/auth/request-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: normalizedEmail,
        redirect: redirectTo.startsWith("/") ? redirectTo : "/hjem",
      }),
    });

    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      if (data.error === "invalid_email") {
        toast.error("Indtast en gyldig e-mailadresse");
      } else {
        toast.error("Kunne ikke sende mail. Prøv igen senere.");
      }
      return;
    }

    if (data.debug) {
      setDebug(data.debug as RequestLoginDebug);
      if (!data.debug.emailSent && data.debug.approved) {
        toast.error(
          data.debug.supabaseError ?? "Mail blev ikke sendt — se udvikler-info nedenfor"
        );
        return;
      }
    }

    setStep("sent");
  }

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    setLoading(false);

    if (error) {
      toast.error(
        error.message.includes("Invalid login credentials")
          ? "Forkert e-mail eller adgangskode. Har du ikke oprettet adgangskode endnu? Brug login-mail."
          : error.message
      );
      return;
    }

    router.push(redirectTo.startsWith("/") ? redirectTo : "/hjem");
    router.refresh();
  }

  function handleBack() {
    setStep("email");
    setDebug(null);
  }

  if (mode === "magic" && step === "sent") {
    return (
      <div className="space-y-4">
        <p className="text-center text-muted-foreground">
          Vi har sendt dig en mail til login på{" "}
          <strong className="text-foreground">{email}</strong>.
        </p>
        <p className="text-center text-sm text-muted-foreground">
          Åbn mailen og klik på login-linket. Linket kan kun bruges én gang og
          udløber efter kort tid.
        </p>
        <button
          type="button"
          onClick={handleBack}
          className="w-full text-sm text-[#5B9BD5] hover:underline"
        >
          Brug en anden e-mail
        </button>
        {debug && <LoginDebugPanel debug={debug} />}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div
        role="tablist"
        className="flex rounded-lg border bg-muted/40 p-1"
      >
        <button
          type="button"
          role="tab"
          aria-selected={mode === "magic"}
          onClick={() => {
            setMode("magic");
            setStep("email");
            setDebug(null);
          }}
          className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
            mode === "magic"
              ? "bg-white text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Login-mail
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "password"}
          onClick={() => {
            setMode("password");
            setStep("email");
            setDebug(null);
          }}
          className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
            mode === "password"
              ? "bg-white text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Adgangskode
        </button>
      </div>

      {mode === "magic" ? (
        <form onSubmit={handleRequestLink} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="login-email">E-mail</Label>
            <Input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="din@email.dk"
              className="h-12 text-base"
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="h-12 w-full bg-[#5B9BD5] text-base hover:bg-[#4a8ac4]"
          >
            {loading ? "Sender..." : "Send login-mail"}
          </Button>
        </form>
      ) : (
        <form onSubmit={handlePasswordLogin} className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Brug den adgangskode, du oprettede efter første login med mail.
          </p>
          <div className="space-y-2">
            <Label htmlFor="pw-email">E-mail</Label>
            <Input
              id="pw-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="din@email.dk"
              className="h-12 text-base"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pw-password">Adgangskode</Label>
            <Input
              id="pw-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="h-12 text-base"
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="h-12 w-full bg-[#5B9BD5] text-base hover:bg-[#4a8ac4]"
          >
            {loading ? "Logger ind..." : "Log ind"}
          </Button>
        </form>
      )}

      {debug && <LoginDebugPanel debug={debug} />}
    </div>
  );
}
