import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const errorCode =
    searchParams.get("error_code") ?? searchParams.get("error");
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = searchParams.get("next") ?? "/auth/complete";

  if (errorCode) {
    const isExpired =
      errorCode === "otp_expired" ||
      searchParams.get("error_description")
        ?.toLowerCase()
        .includes("expired");
    const errorParam = isExpired ? "otp_expired" : "auth";
    return NextResponse.redirect(`${origin}/log-ind?error=${errorParam}`);
  }

  const redirectTarget = next.startsWith("/") ? next : "/auth/complete";
  let response = NextResponse.redirect(`${origin}${redirectTarget}`);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as "email" | "magiclink" | "signup" | "invite" | "recovery",
    });

    if (!error) {
      return response;
    }

    console.error("auth/callback verifyOtp:", error.message);
    const isExpired =
      error.message.toLowerCase().includes("expired") ||
      error.message.toLowerCase().includes("invalid");
    const errorParam = isExpired ? "otp_expired" : "auth";
    return NextResponse.redirect(`${origin}/log-ind?error=${errorParam}`);
  }

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return response;
    }

    console.error("auth/callback exchangeCodeForSession:", error.message);
    const isExpired =
      error.message.toLowerCase().includes("expired") ||
      error.message.toLowerCase().includes("invalid");
    const errorParam = isExpired ? "otp_expired" : "auth";
    return NextResponse.redirect(`${origin}/log-ind?error=${errorParam}`);
  }

  const nextParam = encodeURIComponent(redirectTarget);
  return NextResponse.redirect(`${origin}/auth/session?next=${nextParam}`);
}
