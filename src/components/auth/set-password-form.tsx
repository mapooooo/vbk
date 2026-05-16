"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const MIN_LENGTH = 8;

export function SetPasswordForm({ isFirstTime = true }: { isFirstTime?: boolean }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (password.length < MIN_LENGTH) {
      toast.error(`Adgangskoden skal være mindst ${MIN_LENGTH} tegn`);
      return;
    }
    if (password !== confirm) {
      toast.error("Adgangskoderne matcher ikke");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const { error: authError } = await supabase.auth.updateUser({ password });

    if (authError) {
      setLoading(false);
      toast.error(authError.message);
      return;
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .update({ password_set_at: new Date().toISOString() })
      .eq("id", (await supabase.auth.getUser()).data.user?.id ?? "");

    setLoading(false);

    if (profileError) {
      toast.error(profileError.message);
      return;
    }

    toast.success(
      isFirstTime
        ? "Adgangskode oprettet — du kan nu logge ind med e-mail og adgangskode"
        : "Adgangskode opdateret"
    );
    router.push("/hjem");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {isFirstTime && (
        <p className="text-sm text-muted-foreground">
          Velkommen! Opret en adgangskode, så du næste gang kan logge ind uden
          at vente på en mail — eller fortsæt med login-mail, hvis du foretrækker
          det.
        </p>
      )}
      <div className="space-y-2">
        <Label htmlFor="new-password">
          {isFirstTime ? "Vælg adgangskode" : "Ny adgangskode"}
        </Label>
        <Input
          id="new-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={MIN_LENGTH}
          autoComplete="new-password"
          className="h-12 text-base"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirm-password">Gentag adgangskode</Label>
        <Input
          id="confirm-password"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          minLength={MIN_LENGTH}
          autoComplete="new-password"
          className="h-12 text-base"
        />
      </div>
      <Button
        type="submit"
        disabled={loading}
        className="h-12 w-full bg-[#5B9BD5] text-base hover:bg-[#4a8ac4]"
      >
        {loading ? "Gemmer..." : isFirstTime ? "Opret adgangskode" : "Gem adgangskode"}
      </Button>
    </form>
  );
}
