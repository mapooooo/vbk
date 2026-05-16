"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Profile } from "@/lib/types";
import { ChangePasswordSection } from "@/components/profile/change-password-section";
import { toast } from "sonner";

const roleLabels: Record<string, string> = {
  member: "Medlem",
  trainer: "Træner",
  admin: "Admin",
};

export function ProfileForm({ profile }: { profile: Profile }) {
  const [fullName, setFullName] = useState(profile.full_name);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url ?? "");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        avatar_url: avatarUrl || null,
      })
      .eq("id", profile.id);
    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Profil opdateret");
    router.refresh();
  }

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <Card className="border-none shadow-md">
      <CardContent className="space-y-6 pt-6">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{roleLabels[profile.role]}</Badge>
        </div>
        <form onSubmit={save} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Fulde navn</Label>
            <Input
              id="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="h-12 text-base"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="avatar">Avatar URL (valgfri)</Label>
            <Input
              id="avatar"
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://..."
              className="h-12"
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="h-12 w-full bg-[#5B9BD5]"
          >
            {loading ? "Gemmer..." : "Gem ændringer"}
          </Button>
        </form>
        {profile.password_set_at && <ChangePasswordSection />}
        <Button
          variant="outline"
          className="h-12 w-full"
          onClick={logout}
        >
          Log ud
        </Button>
      </CardContent>
    </Card>
  );
}
