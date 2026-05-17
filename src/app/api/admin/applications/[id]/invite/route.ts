import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import {
  generateInviteToken,
  inviteExpiresAt,
} from "@/lib/auth/generate-invite-token";
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
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !application) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  if (application.status !== "pending") {
    return NextResponse.json(
      { error: "invalid_status", message: "Ansøgningen er ikke afventende" },
      { status: 400 }
    );
  }

  const token = generateInviteToken();
  const expiresAt = inviteExpiresAt();

  const { data: invite, error: inviteError } = await service
    .from("invites")
    .insert({
      token,
      email: application.email,
      created_by: admin.user.id,
      expires_at: expiresAt.toISOString(),
    })
    .select("id, token")
    .single();

  if (inviteError || !invite) {
    console.error("invite insert error:", inviteError);
    return NextResponse.json({ error: "invite_failed" }, { status: 500 });
  }

  const { error: updateError } = await service
    .from("membership_applications")
    .update({
      status: "invited",
      invite_id: invite.id,
      reviewed_at: new Date().toISOString(),
      reviewed_by: admin.user.id,
    })
    .eq("id", id);

  if (updateError) {
    console.error("application update error:", updateError);
    return NextResponse.json({ error: "update_failed" }, { status: 500 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const inviteUrl = `${appUrl}/invite/${token}`;

  const emailResult = await sendInviteEmail({
    to: application.email,
    fullName: application.full_name,
    inviteUrl,
    expiresAt,
  });

  return NextResponse.json({
    ok: true,
    inviteUrl,
    token,
    inviteId: invite.id,
    emailSent: emailResult.sent,
    emailError:
      emailResult.sent === false
        ? emailResult.reason === "not_configured"
          ? "RESEND_API_KEY mangler"
          : emailResult.error
        : undefined,
  });
}
