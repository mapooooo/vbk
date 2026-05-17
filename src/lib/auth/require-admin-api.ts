import { createClient } from "@/lib/supabase/server";

export async function requireAdminApi() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, approved_at")
    .eq("id", user.id)
    .single();

  if (!profile?.approved_at || profile.role !== "admin") {
    return null;
  }

  return { supabase, user, profile };
}
