import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";
import { redirect } from "next/navigation";

export async function getSession() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

export async function getProfile(): Promise<Profile | null> {
  const { supabase, user } = await getSession();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return data;
}

export async function requireApprovedMember() {
  const profile = await getProfile();
  if (!profile?.approved_at) {
    redirect("/auth/complete");
  }
  return profile;
}

export async function requireAdmin() {
  const profile = await requireApprovedMember();
  if (profile.role !== "admin") {
    redirect("/hjem");
  }
  return profile;
}
