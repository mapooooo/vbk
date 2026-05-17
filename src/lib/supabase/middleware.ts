import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const AUTH_SETUP_PATH = "/auth/set-password";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isMemberRoute =
    path.startsWith("/hjem") ||
    path.startsWith("/beskeder") ||
    path.startsWith("/tilmelding") ||
    path.startsWith("/profil") ||
    path.startsWith("/admin") ||
    path.startsWith("/opslag");

  if (isMemberRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/log-ind";
    url.searchParams.set("redirect", path);
    return NextResponse.redirect(url);
  }

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("approved_at, password_set_at, role")
      .eq("id", user.id)
      .single();

    const needsPassword =
      profile?.approved_at && !profile.password_set_at;

    if (isMemberRoute && !profile?.approved_at && !path.startsWith("/auth/complete")) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/complete";
      return NextResponse.redirect(url);
    }

    if (
      needsPassword &&
      isMemberRoute &&
      !path.startsWith(AUTH_SETUP_PATH)
    ) {
      const url = request.nextUrl.clone();
      url.pathname = AUTH_SETUP_PATH;
      return NextResponse.redirect(url);
    }

    if (path === AUTH_SETUP_PATH && profile?.password_set_at) {
      const url = request.nextUrl.clone();
      url.pathname = "/hjem";
      return NextResponse.redirect(url);
    }

    if (user && profile?.approved_at && path === "/log-ind") {
      const url = request.nextUrl.clone();
      url.pathname = needsPassword ? AUTH_SETUP_PATH : "/hjem";
      return NextResponse.redirect(url);
    }

    if (
      user &&
      !profile?.approved_at &&
      (path === "/log-ind" || path.startsWith("/invite/"))
    ) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/complete";
      return NextResponse.redirect(url);
    }

    if (path.startsWith("/admin") && profile?.role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/hjem";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
