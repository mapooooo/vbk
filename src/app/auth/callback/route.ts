import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/auth/complete";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }

    const isExpired =
      error.message.toLowerCase().includes("expired") ||
      error.message.toLowerCase().includes("invalid");
    const errorParam = isExpired ? "otp_expired" : "auth";
    return NextResponse.redirect(`${origin}/log-ind?error=${errorParam}`);
  }

  return NextResponse.redirect(`${origin}/log-ind?error=auth`);
}
