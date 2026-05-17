"use client";

import { useState } from "react";
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
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/invite/send-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        email: email.trim().toLowerCase(),
        fullName: fullName.trim(),
      }),
    });

    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      if (data.error === "invalid_invite") {
        toast.error("Invitationen er ugyldig eller udløbet.");
      } else if (data.error === "email_mismatch") {
        toast.error("E-mail matcher ikke invitationen.");
      } else {
        toast.error(data.error ?? "Kunne ikke fortsætte. Prøv igen.");
      }
      return;
    }

    if (data.url) {
      window.location.href = data.url;
      return;
    }

    toast.error("Kunne ikke oprette login. Prøv igen.");
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
      <p className="text-sm text-muted-foreground">
        Du sendes videre med det samme — du behøver ikke vente på en ekstra
        e-mail.
      </p>
      <Button
        type="submit"
        disabled={loading}
        className="h-12 w-full bg-[#5B9BD5] text-base hover:bg-[#4a8ac4]"
      >
        {loading ? "Opretter konto..." : "Fortsæt oprettelse"}
      </Button>
    </form>
  );
}
