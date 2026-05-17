"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type Step = "email" | "sent" | "redirecting";
type LoginMode = "magic" | "password";

export function MemberLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/hjem";
  const emailFromUrl = searchParams.get("email") ?? "";

  const [mode, setMode] = useState<LoginMode>("magic");
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState(emailFromUrl);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [bootstrapping, setBootstrapping] = useState(true);

  async function resolveLogin(emailOverride?: string) {
    const normalized = (emailOverride ?? email).trim().toLowerCase();
    if (!normalized && mode === "magic") {
      return;
    }

    setLoading(true);
    if (emailOverride) setStep("redirecting");

    const res = await fetch("/api/auth/resolve-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: normalized || undefined,
        redirect: redirectTo.startsWith("/") ? redirectTo : "/hjem",
      }),
    });

    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok || data.action === "error") {
      toast.error(data.message ?? "Noget gik galt. Prøv igen.");
      setStep("email");
      return;
    }

    if (data.action === "redirect" && data.url) {
      if (data.url.startsWith("http")) {
        window.location.href = data.url;
      } else {
        router.push(data.url);
        router.refresh();
      }
      return;
    }

    if (data.action === "login_email_sent") {
      setEmail(normalized);
      setStep("sent");
      return;
    }

    if (data.action === "application_pending") {
      toast.message("Din ansøgning afventer godkendelse fra bestyrelsen.");
      setStep("email");
      return;
    }

    if (data.action === "no_account") {
      toast.error(
        "Ingen konto fundet. Har du fået et invitationslink fra klubben?"
      );
      setStep("email");
      return;
    }

    setStep("email");
  }

  useEffect(() => {
    if (!emailFromUrl) {
      setBootstrapping(false);
      return;
    }
    resolveLogin(emailFromUrl).finally(() => setBootstrapping(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emailFromUrl]);

  async function handleContinue(e: React.FormEvent) {
    e.preventDefault();
    await resolveLogin();
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
      if (error.message.includes("Invalid login credentials")) {
        await resolveLogin();
        return;
      }
      toast.error(error.message);
      return;
    }

    router.push(redirectTo.startsWith("/") ? redirectTo : "/hjem");
    router.refresh();
  }

  if (bootstrapping || step === "redirecting") {
    return (
      <p className="py-8 text-center text-muted-foreground">
        {loading || bootstrapping
          ? "Finder din konto og sender dig videre..."
          : "Et øjeblik..."}
      </p>
    );
  }

  if (mode === "magic" && step === "sent") {
    return (
      <div className="space-y-4">
        <p className="text-center text-muted-foreground">
          Vi har sendt en login-mail til{" "}
          <strong className="text-foreground">{email}</strong>.
        </p>
        <p className="text-center text-sm text-muted-foreground">
          Klik linket i mailen for at logge ind.
        </p>
        <button
          type="button"
          onClick={() => setStep("email")}
          className="w-full text-sm text-[#5B9BD5] hover:underline"
        >
          Brug en anden e-mail
        </button>
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
          onClick={() => setMode("magic")}
          className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
            mode === "magic"
              ? "bg-white text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Fortsæt med e-mail
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "password"}
          onClick={() => setMode("password")}
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
        <form onSubmit={handleContinue} className="space-y-4">
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
            {loading ? "Vent..." : "Fortsæt"}
          </Button>
        </form>
      ) : (
        <form onSubmit={handlePasswordLogin} className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Kun for medlemmer der allerede har oprettet adgangskode.
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
    </div>
  );
}
