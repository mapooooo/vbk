import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { getAdminNotificationEmails, getUserEmail } from "@/lib/email/get-user-email";
import { sendPaymentPendingAdminEmail } from "@/lib/email/send-payment-emails";
import { usesManualMobilePay } from "@/lib/payments";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const eventId = typeof body.eventId === "string" ? body.eventId : "";

  if (!eventId) {
    return NextResponse.json({ error: "missing_event" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("*")
    .eq("id", eventId)
    .eq("published", true)
    .single();

  if (eventError || !event) {
    return NextResponse.json({ error: "event_not_found" }, { status: 404 });
  }

  const { count: registered } = await supabase
    .from("event_registrations")
    .select("*", { count: "exact", head: true })
    .eq("event_id", eventId)
    .eq("status", "registered");

  const full =
    event.capacity != null && (registered ?? 0) >= event.capacity;
  const status = full ? "waitlist" : "registered";
  const payment_status = event.price_cents > 0 ? "pending" : "free";

  const { data: registration, error: regError } = await supabase
    .from("event_registrations")
    .upsert(
      {
        event_id: eventId,
        user_id: user.id,
        status,
        payment_status,
      },
      { onConflict: "event_id,user_id" }
    )
    .select("id, status, payment_status")
    .single();

  if (regError || !registration) {
    return NextResponse.json({ error: regError?.message ?? "failed" }, { status: 500 });
  }

  let adminNotified = false;

  if (
    event.price_cents > 0 &&
    payment_status === "pending" &&
    usesManualMobilePay()
  ) {
    const service = createServiceClient();
    const { data: profile } = await service
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();

    const memberEmail = (await getUserEmail(user.id)) ?? user.email ?? "";
    const adminEmails = await getAdminNotificationEmails();

    const result = await sendPaymentPendingAdminEmail({
      adminEmails,
      memberName: profile?.full_name ?? "Medlem",
      memberEmail,
      eventTitle: event.title,
      eventDate: event.starts_at,
      amountKr: event.price_cents / 100,
      registrationStatus: status,
    });

    adminNotified = result.sent;
  }

  return NextResponse.json({
    ok: true,
    registration,
    status,
    payment_status,
    adminNotified,
  });
}
