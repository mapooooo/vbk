import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { createServiceClient } from "@/lib/supabase/service";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type AccountSetupStatus =
  | "session_ready"
  | "session_needs_complete"
  | "session_needs_password"
  | "continue_via_link"
  | "invite_page"
  | "login_email"
  | "no_account"
  | "application_pending";

export async function findAuthUserIdByEmail(
  service: SupabaseClient,
  email: string
): Promise<string | null> {
  let page = 1;
  const perPage = 1000;

  for (;;) {
    const { data, error } = await service.auth.admin.listUsers({
      page,
      perPage,
    });
    if (error) throw error;

    const match = data.users.find((u) => u.email?.toLowerCase() === email);
    if (match) return match.id;

    if (data.users.length < perPage) return null;
    page += 1;
  }
}

export async function getActiveInviteForEmail(
  service: SupabaseClient,
  email: string
) {
  const { data } = await service
    .from("invites")
    .select("token")
    .eq("email", email)
    .is("used_at", null)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return data;
}

export async function getInvitedApplication(
  service: SupabaseClient,
  email: string
) {
  const { data } = await service
    .from("membership_applications")
    .select("full_name, status")
    .eq("email", email)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return data;
}

export async function createDirectLoginLink(email: string) {
  const service = createServiceClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const redirectTo = `${appUrl}/auth/session?next=${encodeURIComponent("/auth/complete")}`;

  const { data, error } = await service.auth.admin.generateLink({
    type: "magiclink",
    email,
    options: { redirectTo },
  });

  if (error) {
    throw new Error(error.message);
  }

  const actionLink = data.properties?.action_link;
  if (!actionLink) {
    throw new Error("Kunne ikke oprette login-link");
  }

  return actionLink;
}

export async function setInviteSetupCookies(
  inviteToken: string,
  fullName: string
) {
  const cookieStore = await cookies();
  cookieStore.set("vbk_invite_token", inviteToken, {
    path: "/",
    maxAge: 3600,
    sameSite: "lax",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  });
  cookieStore.set("vbk_full_name", encodeURIComponent(fullName), {
    path: "/",
    maxAge: 3600,
    sameSite: "lax",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  });
}

export async function resolveEmailLoginStatus(
  email: string
): Promise<{
  status: AccountSetupStatus;
  redirectUrl?: string;
}> {
  const normalized = email.trim().toLowerCase();
  if (!EMAIL_RE.test(normalized)) {
    return { status: "no_account" };
  }

  const service = createServiceClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const application = await getInvitedApplication(service, normalized);
  if (application?.status === "pending") {
    return { status: "application_pending" };
  }

  const invite = await getActiveInviteForEmail(service, normalized);
  const userId = await findAuthUserIdByEmail(service, normalized);

  if (userId) {
    const { data: profile } = await service
      .from("profiles")
      .select("approved_at, password_set_at")
      .eq("id", userId)
      .single();

    if (profile?.approved_at) {
      return { status: "login_email" };
    }

    const fullName = application?.full_name?.trim();
    if (invite?.token && fullName) {
      await setInviteSetupCookies(invite.token, fullName);
      const url = await createDirectLoginLink(normalized);
      return { status: "continue_via_link", redirectUrl: url };
    }

    if (invite?.token) {
      return {
        status: "invite_page",
        redirectUrl: `${appUrl}/invite/${invite.token}`,
      };
    }

    const url = await createDirectLoginLink(normalized);
    return { status: "continue_via_link", redirectUrl: url };
  }

  if (invite?.token) {
    const fullName = application?.full_name?.trim();
    if (fullName) {
      await setInviteSetupCookies(invite.token, fullName);
      const url = await createDirectLoginLink(normalized);
      return { status: "continue_via_link", redirectUrl: url };
    }
    return {
      status: "invite_page",
      redirectUrl: `${appUrl}/invite/${invite.token}`,
    };
  }

  return { status: "no_account" };
}
