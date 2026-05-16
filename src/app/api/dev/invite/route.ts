import { NextResponse } from "next/server";
import { createSystemInvite } from "@/lib/supabase/server";
import { randomBytes } from "crypto";

/** Kun lokal udvikling — opretter invite uden "setup already done" begrænsning */
export async function POST(request: Request) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

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

  const token = randomBytes(24).toString("hex");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);
  const expiresIso = expiresAt.toISOString();

  let data;
  try {
    const result = await createSystemInvite(token, expiresIso);
    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 500 });
    }
    data = result.data;
  } catch (e) {
    const message = e instanceof Error ? e.message : "Setup failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  return NextResponse.json({
    invite_url: `${appUrl}/invite/${token}`,
    expires_at: data.expires_at,
    note: "Første godkendte bruger uden forældre bliver admin (se migration).",
  });
}
