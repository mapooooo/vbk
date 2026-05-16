"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function InviteForm({
  token,
  lockedEmail,
}: {
  token: string;
  lockedEmail: string | null;
}) {
  const [email, setEmail] = useState(lockedEmail ?? "");
  const [fullName, setFullName] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    document.cookie = `vbk_invite_token=${token}; path=/; max-age=3600; SameSite=Lax`;
    document.cookie = `vbk_full_name=${encodeURIComponent(fullName)}; path=/; max-age=3600; SameSite=Lax`;

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    setSent(true);
    toast.success("Tjek din e-mail for login-linket");
  }

  if (sent) {
    return (
      <p className="text-center text-muted-foreground">
        Vi har sendt et login-link til <strong>{email}</strong>. Klik på linket
        i e-mailen for at fortsætte.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fullName">Fulde navn</Label>
        <Input
          id="fullName"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          placeholder="Dit navn"
          className="h-12 text-base"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={!!lockedEmail}
          placeholder="din@email.dk"
          className="h-12 text-base"
        />
      </div>
      <Button
        type="submit"
        disabled={loading}
        className="h-12 w-full bg-[#5B9BD5] text-base hover:bg-[#4a8ac4]"
      >
        {loading ? "Sender..." : "Send login-link"}
      </Button>
    </form>
  );
}
