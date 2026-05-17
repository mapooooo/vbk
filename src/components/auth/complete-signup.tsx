"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export function CompleteSignup({
  inviteToken,
  defaultName,
  userEmail,
}: {
  inviteToken?: string;
  defaultName?: string;
  userEmail?: string;
}) {
  const [fullName, setFullName] = useState(defaultName ?? "");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteToken) {
      toast.error("Manglende invitation. Brug invitationslinket igen.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.rpc("complete_invite_signup", {
      p_invite_token: inviteToken,
      p_full_name: fullName,
    });
    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    router.push("/auth/set-password");
    router.refresh();
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="font-serif">Færdiggør din profil</CardTitle>
      </CardHeader>
      <CardContent>
        {!inviteToken ? (
          <div className="space-y-2 text-muted-foreground">
            <p>
              Vi kunne ikke finde en aktiv invitation
              {userEmail ? ` for ${userEmail}` : ""}. Åbn invitationslinket fra
              klubben igen, eller kontakt bestyrelsen.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Fulde navn</Label>
              <Input
                id="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="h-12"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="h-12 w-full bg-[#5B9BD5]"
            >
              {loading ? "Gemmer..." : "Gå til klubben"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
