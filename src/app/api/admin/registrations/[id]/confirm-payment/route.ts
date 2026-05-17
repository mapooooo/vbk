import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { getUserEmail } from "@/lib/email/get-user-email";
import { sendPaymentConfirmedMemberEmail } from "@/lib/email/send-payment-emails";
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

  const { data: reg, error: fetchError } = await service
    .from("event_registrations")
    .select(
      `
      id,
      user_id,
      status,
      payment_status,
      events (title, starts_at, price_cents),
      profiles (full_name)
    `
    )
    .eq("id", id)
    .single();

  if (fetchError || !reg) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  if (reg.payment_status !== "pending") {
    return NextResponse.json(
      { error: "not_pending", message: "Betalingen er ikke afventende" },
      { status: 400 }
    );
  }

  const event = Array.isArray(reg.events) ? reg.events[0] : reg.events;
  const profile = Array.isArray(reg.profiles) ? reg.profiles[0] : reg.profiles;

  if (!event) {
    return NextResponse.json({ error: "event_missing" }, { status: 500 });
  }

  const { error: updateError } = await service
    .from("event_registrations")
    .update({ payment_status: "paid" })
    .eq("id", id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  const memberEmail = await getUserEmail(reg.user_id);
  let memberNotified = false;

  if (memberEmail) {
    const result = await sendPaymentConfirmedMemberEmail({
      to: memberEmail,
      memberName: profile?.full_name ?? "Medlem",
      eventTitle: event.title,
      eventDate: event.starts_at,
      amountKr: (event.price_cents ?? 0) / 100,
    });
    memberNotified = result.sent;
  }

  return NextResponse.json({
    ok: true,
    memberNotified,
    memberEmail: memberEmail ?? null,
  });
}
