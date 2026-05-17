import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { sendInviteEmail } from "@/lib/email/send-invite-email";
import { createServiceClient } from "@/lib/supabase/service";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdminApi();
  if (!admin) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const service = createServiceClient();

  const { data: application, error: fetchError } = await service
    .from("membership_applications")
    .select("*, invites(token, expires_at, used_at)")
    .eq("id", id)
    .single();

  if (fetchError || !application) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  if (application.status !== "invited") {
    return NextResponse.json(
      { error: "invalid_status", message: "Ansøgningen er ikke inviteret" },
      { status: 400 }
    );
  }

  const invite = application.invites as {
    token: string;
    expires_at: string;
    used_at: string | null;
  } | null;

  if (!invite?.token) {
    return NextResponse.json({ error: "no_invite" }, { status: 400 });
  }

  if (invite.used_at) {
    return NextResponse.json(
      { error: "invite_used", message: "Invitationen er allerede brugt" },
      { status: 400 }
    );
  }

  if (new Date(invite.expires_at) <= new Date()) {
    return NextResponse.json(
      { error: "invite_expired", message: "Invitationen er udløbet" },
      { status: 400 }
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const inviteUrl = `${appUrl}/invite/${invite.token}`;

  const emailResult = await sendInviteEmail({
    to: application.email,
    fullName: application.full_name,
    inviteUrl,
    expiresAt: new Date(invite.expires_at),
  });

  return NextResponse.json({
    ok: true,
    inviteUrl,
    emailSent: emailResult.sent,
    emailError:
      emailResult.sent === false
        ? emailResult.reason === "not_configured"
          ? "RESEND_API_KEY mangler"
          : emailResult.error
        : undefined,
  });
}
