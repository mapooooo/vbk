import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { randomBytes } from "crypto";

/** Opret første invitation når ingen medlemmer findes endnu */
export async function POST(request: Request) {
  const secret = request.headers.get("x-setup-secret");
  if (!secret || secret !== process.env.ADMIN_SETUP_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY required" },
      { status: 500 }
    );
  }

  const supabase = await createServiceClient();

  const { count } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .not("approved_at", "is", null);

  if ((count ?? 0) > 0) {
    return NextResponse.json(
      { error: "Setup already completed" },
      { status: 400 }
    );
  }

  const token = randomBytes(24).toString("hex");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  const { data, error } = await supabase
    .from("invites")
    .insert({
      token,
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  return NextResponse.json({
    invite_url: `${appUrl}/invite/${token}`,
    expires_at: data.expires_at,
    note: "Første bruger der bruger dette link bliver automatisk admin.",
  });
}
