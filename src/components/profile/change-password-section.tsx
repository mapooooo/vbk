"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const MIN_LENGTH = 8;

export function ChangePasswordSection() {
  const [open, setOpen] = useState(false);
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
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Adgangskode opdateret");
    setPassword("");
    setConfirm("");
    setOpen(false);
  }

  if (!open) {
    return (
      <Button
        type="button"
        variant="outline"
        className="h-12 w-full"
        onClick={() => setOpen(true)}
      >
        Skift adgangskode
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 border-t pt-4">
      <p className="text-sm font-medium">Skift adgangskode</p>
      <div className="space-y-2">
        <Label htmlFor="profile-new-pw">Ny adgangskode</Label>
        <Input
          id="profile-new-pw"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={MIN_LENGTH}
          autoComplete="new-password"
          className="h-12"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="profile-confirm-pw">Gentag adgangskode</Label>
        <Input
          id="profile-confirm-pw"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          minLength={MIN_LENGTH}
          autoComplete="new-password"
          className="h-12"
        />
      </div>
      <div className="flex gap-2">
        <Button
          type="submit"
          disabled={loading}
          className="h-12 flex-1 bg-[#5B9BD5]"
        >
          {loading ? "Gemmer..." : "Gem"}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-12"
          onClick={() => setOpen(false)}
        >
          Annuller
        </Button>
      </div>
    </form>
  );
}
