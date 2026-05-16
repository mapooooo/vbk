"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Invite } from "@/lib/types";
import { formatShortDate } from "@/lib/utils/date";
import { toast } from "sonner";
import { Copy, Plus } from "lucide-react";

function generateToken() {
  const arr = new Uint8Array(24);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function AdminPanel({ invites: initialInvites }: { invites: Invite[] }) {
  const [invites, setInvites] = useState(initialInvites);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin;

  async function createInvite(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const token = generateToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 14);

    const { data, error } = await supabase
      .from("invites")
      .insert({
        token,
        email: email || null,
        created_by: user!.id,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }

    setInvites((prev) => [data, ...prev]);
    setEmail("");
    toast.success("Invitation oprettet");
  }

  function copyLink(token: string) {
    const link = `${appUrl}/invite/${token}`;
    navigator.clipboard.writeText(link);
    toast.success("Link kopieret");
  }

  return (
    <div className="space-y-8">
      <h1 className="font-serif text-2xl">Administration</h1>

      <Card className="border-none shadow-md">
        <CardHeader>
          <CardTitle className="font-serif text-lg">Ny invitation</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={createInvite} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="invite-email">
                E-mail (valgfri — låser invitationen)
              </Label>
              <Input
                id="invite-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="medlem@email.dk"
                className="h-12"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="h-12 gap-2 bg-[#5B9BD5]"
            >
              <Plus className="h-5 w-5" />
              {loading ? "Opretter..." : "Opret invitation"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h2 className="font-serif text-lg">Invitationer</h2>
        {invites.length === 0 ? (
          <p className="text-muted-foreground">Ingen invitationer endnu.</p>
        ) : (
          <ul className="space-y-2">
            {invites.map((inv) => (
              <li
                key={inv.id}
                className="flex flex-col gap-2 rounded-xl bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-mono truncate">{inv.token.slice(0, 12)}…</p>
                  <p className="text-xs text-muted-foreground">
                    Udløber {formatShortDate(inv.expires_at)}
                    {inv.email ? ` · ${inv.email}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {inv.used_at ? (
                    <Badge variant="secondary">Brugt</Badge>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1"
                      onClick={() => copyLink(inv.token)}
                    >
                      <Copy className="h-4 w-4" />
                      Kopiér link
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
