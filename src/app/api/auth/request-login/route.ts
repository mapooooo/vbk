import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { RequestLoginDebug } from "@/lib/auth/login-debug";
import { createAnonServerClient } from "@/lib/supabase/anon-server";
import { createServiceClient } from "@/lib/supabase/service";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function findAuthUserIdByEmail(
  supabase: SupabaseClient,
  email: string
): Promise<string | null> {
  let page = 1;
  const perPage = 1000;

  for (;;) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) throw error;

    const match = data.users.find((u) => u.email?.toLowerCase() === email);
    if (match) return match.id;

    if (data.users.length < perPage) return null;
    page += 1;
  }
}

/** Sender magic login-link kun til godkendte medlemmer. Returnerer altid neutralt svar i prod. */
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const redirect =
    typeof body.redirect === "string" && body.redirect.startsWith("/")
      ? body.redirect
      : "/hjem";

  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "server_config" }, { status: 500 });
  }

  const isDev = process.env.NODE_ENV === "development";
  const service = createServiceClient();
  const hints: string[] = [];
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const callbackUrl = `${appUrl}/auth/callback?next=${encodeURIComponent(redirect)}`;

  let userId: string | null;
  try {
    userId = await findAuthUserIdByEmail(service, email);
  } catch (err) {
    console.error("request-login listUsers error:", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }

  const { data: pendingInvite } = await service
    .from("invites")
    .select("id")
    .eq("email", email)
    .is("used_at", null)
    .gt("expires_at", new Date().toISOString())
    .limit(1)
    .maybeSingle();

  if (!userId) {
    if (pendingInvite) {
      if (isDev) {
        hints.push("Aktiv invitation findes — brug /invite/...-linket først.");
      }
      return NextResponse.json({
        ok: true,
        needsInvite: true,
        ...(isDev && {
          debug: {
            email,
            userFound: false,
            approved: false,
            emailSent: false,
            emailMode: "magic_link" as const,
            supabaseError: null,
            hints,
          } satisfies RequestLoginDebug,
        }),
      });
    }
    if (isDev) {
      hints.push("Ingen Supabase Auth-bruger med denne e-mail.");
      hints.push("Opret konto via /invite/... først.");
    }
    return NextResponse.json({
      ok: true,
      ...(isDev && {
        debug: {
          email,
          userFound: false,
          approved: false,
          emailSent: false,
          emailMode: "magic_link" as const,
          supabaseError: null,
          hints,
        } satisfies RequestLoginDebug,
      }),
    });
  }

  const { data: profile } = await service
    .from("profiles")
    .select("approved_at")
    .eq("id", userId)
    .single();

  if (!profile?.approved_at) {
    const completeCallback = `${appUrl}/auth/callback?next=${encodeURIComponent("/auth/complete")}`;
    const anon = createAnonServerClient();
    const { error: otpError } = await anon.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
        emailRedirectTo: completeCallback,
      },
    });

    if (isDev) {
      hints.push("Bruger findes, men profiles.approved_at er tom.");
      hints.push("Sender login-mail med redirect til /auth/complete.");
      if (otpError) hints.push(`Fejl: ${otpError.message}`);
    }

    return NextResponse.json({
      ok: true,
      needsComplete: true,
      ...(isDev && {
        debug: {
          email,
          userFound: true,
          approved: false,
          emailSent: !otpError,
          emailMode: "magic_link" as const,
          supabaseError: otpError?.message ?? null,
          hints,
        } satisfies RequestLoginDebug,
      }),
    });
  }

  const anon = createAnonServerClient();
  const { error: otpError } = await anon.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false,
      emailRedirectTo: callbackUrl,
    },
  });

  if (otpError) {
    console.error("request-login magic link error:", otpError.message);
  }

  if (isDev) {
    hints.push("Magic link sendt — bruger klikker Sign in i mailen.");
    hints.push(`Callback: ${callbackUrl}`);
    if (otpError) {
      hints.push(`Fejl: ${otpError.message}`);
    }
  }

  return NextResponse.json({
    ok: true,
    ...(isDev && {
      debug: {
        email,
        userFound: true,
        approved: true,
        emailSent: !otpError,
        emailMode: "magic_link" as const,
        supabaseError: otpError?.message ?? null,
        hints,
      } satisfies RequestLoginDebug,
    }),
  });
}
