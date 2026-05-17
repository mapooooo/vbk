import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAnonServerClient } from "@/lib/supabase/anon-server";
import { resolveEmailLoginStatus } from "@/lib/auth/account-setup";

/** Finder korrekt næste skridt for login — omdirigerer automatisk når muligt. */
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const redirect =
    typeof body.redirect === "string" && body.redirect.startsWith("/")
      ? body.redirect
      : "/hjem";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("approved_at, password_set_at")
      .eq("id", user.id)
      .single();

    if (profile?.approved_at) {
      const path = profile.password_set_at ? redirect : "/auth/set-password";
      return NextResponse.json({
        action: "redirect",
        url: path,
      });
    }

    return NextResponse.json({
      action: "redirect",
      url: "/auth/complete",
    });
  }

  if (!email) {
    return NextResponse.json({ action: "needs_email" });
  }

  try {
    const resolved = await resolveEmailLoginStatus(email);

    if (resolved.status === "continue_via_link" && resolved.redirectUrl) {
      return NextResponse.json({
        action: "redirect",
        url: resolved.redirectUrl,
      });
    }

    if (resolved.status === "invite_page" && resolved.redirectUrl) {
      return NextResponse.json({
        action: "redirect",
        url: resolved.redirectUrl,
      });
    }

    if (resolved.status === "application_pending") {
      return NextResponse.json({ action: "application_pending" });
    }

    if (resolved.status === "login_email") {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
      const callbackUrl = `${appUrl}/auth/callback?next=${encodeURIComponent(redirect)}`;
      const anon = createAnonServerClient();
      const { error } = await anon.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
          emailRedirectTo: callbackUrl,
        },
      });

      if (error) {
        return NextResponse.json({ action: "error", message: error.message });
      }

      return NextResponse.json({ action: "login_email_sent" });
    }

    return NextResponse.json({ action: "no_account" });
  } catch (err) {
    console.error("resolve-login:", err);
    const message =
      err instanceof Error ? err.message : "Kunne ikke fortsætte";
    return NextResponse.json({ action: "error", message }, { status: 500 });
  }
}
