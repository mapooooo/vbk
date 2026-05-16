import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function decodeJwtRole(key: string): string | null {
  try {
    const part = key.split(".")[1];
    if (!part) return null;
    const json = Buffer.from(part, "base64url").toString("utf8");
    const payload = JSON.parse(json) as { role?: string };
    return payload.role ?? null;
  } catch {
    return null;
  }
}

export function createServiceClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  const role = decodeJwtRole(key);
  if (role && role !== "service_role") {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY er ikke service_role — brug 'service_role' secret fra Supabase → Project Settings → API (ikke anon/publishable)."
    );
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function createSystemInvite(token: string, expiresAt: string) {
  const supabase = createServiceClient();

  const { data, error } = await supabase.rpc("create_system_invite", {
    p_token: token,
    p_expires_at: expiresAt,
  });

  if (!error) {
    return { data, error: null };
  }

  // Fallback hvis migration 002 ikke er kørt endnu
  const direct = await supabase
    .from("invites")
    .insert({ token, expires_at: expiresAt })
    .select()
    .single();

  return { data: direct.data, error: direct.error };
}
