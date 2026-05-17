"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/ui/user-avatar";
import type { Profile } from "@/lib/types";
import { ChangePasswordSection } from "@/components/profile/change-password-section";
import {
  AVATAR_ACCEPT,
  removeAvatarFiles,
  uploadAvatar,
} from "@/lib/avatar-upload";
import { toast } from "sonner";
import { Camera, X } from "lucide-react";

const roleLabels: Record<string, string> = {
  member: "Medlem",
  trainer: "Træner",
  admin: "Admin",
};

export function ProfileForm({ profile }: { profile: Profile }) {
  const [fullName, setFullName] = useState(profile.full_name);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    profile.avatar_url
  );
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    return () => {
      if (pendingFile && previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [pendingFile, previewUrl]);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (pendingFile && previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    setPendingFile(file);
    setRemoveAvatar(false);
    setPreviewUrl(URL.createObjectURL(file));
  }

  function clearAvatarSelection() {
    if (pendingFile && previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setPendingFile(null);
    setRemoveAvatar(true);
    setPreviewUrl(null);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = createClient();
      let avatarUrl: string | null = profile.avatar_url;

      if (pendingFile) {
        avatarUrl = await uploadAvatar(supabase, profile.id, pendingFile);
      } else if (removeAvatar) {
        await removeAvatarFiles(supabase, profile.id);
        avatarUrl = null;
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          avatar_url: avatarUrl,
        })
        .eq("id", profile.id);

      if (error) {
        toast.error(error.message);
        return;
      }

      if (pendingFile && previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }

      setPendingFile(null);
      setRemoveAvatar(false);
      setPreviewUrl(avatarUrl);
      toast.success("Profil opdateret");
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Kunne ikke gemme profilbillede";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const displayProfile = {
    full_name: fullName,
    avatar_url: previewUrl,
  };

  return (
    <Card className="border-none shadow-md">
      <CardContent className="space-y-6 pt-6">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{roleLabels[profile.role]}</Badge>
        </div>
        <form onSubmit={save} className="space-y-4">
          <div className="flex flex-col items-center gap-3">
            <UserAvatar profile={displayProfile} size="xl" />
            <input
              ref={fileInputRef}
              type="file"
              accept={AVATAR_ACCEPT}
              className="sr-only"
              onChange={onFileChange}
            />
            <div className="flex flex-wrap justify-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="h-4 w-4" />
                {previewUrl ? "Skift billede" : "Vælg billede af hund"}
              </Button>
              {previewUrl && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="gap-2 text-muted-foreground"
                  onClick={clearAvatarSelection}
                >
                  <X className="h-4 w-4" />
                  Fjern billede
                </Button>
              )}
            </div>
            <p className="text-center text-xs text-muted-foreground">
              JPG, PNG eller WebP · maks. 5 MB
            </p>
          </div>
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
          <Button
            type="submit"
            disabled={loading}
            className="h-12 w-full bg-[#5B9BD5]"
          >
            {loading ? "Gemmer..." : "Gem ændringer"}
          </Button>
        </form>
        {profile.password_set_at && <ChangePasswordSection />}
        <Button variant="outline" className="h-12 w-full" onClick={logout}>
          Log ud
        </Button>
      </CardContent>
    </Card>
  );
}
