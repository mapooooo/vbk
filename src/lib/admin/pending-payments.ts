import { createServiceClient } from "@/lib/supabase/service";
import { getUserEmail } from "@/lib/email/get-user-email";

export type PendingPaymentRow = {
  id: string;
  status: string;
  payment_status: string;
  created_at: string;
  member_name: string;
  member_email: string;
  event_title: string;
  event_starts_at: string;
  price_cents: number;
};

export async function fetchPendingPaymentRegistrations(): Promise<
  PendingPaymentRow[]
> {
  const service = createServiceClient();

  const { data, error } = await service
    .from("event_registrations")
    .select(
      `
      id,
      status,
      payment_status,
      created_at,
      user_id,
      profiles (full_name),
      events (title, starts_at, price_cents)
    `
    )
    .eq("payment_status", "pending")
    .in("status", ["registered", "waitlist"])
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  const rows: PendingPaymentRow[] = [];

  for (const reg of data) {
    const event = Array.isArray(reg.events) ? reg.events[0] : reg.events;
    const profile = Array.isArray(reg.profiles)
      ? reg.profiles[0]
      : reg.profiles;
    if (!event) continue;

    const email = (await getUserEmail(reg.user_id)) ?? "";

    rows.push({
      id: reg.id,
      status: reg.status,
      payment_status: reg.payment_status,
      created_at: reg.created_at,
      member_name: profile?.full_name ?? "Medlem",
      member_email: email,
      event_title: event.title,
      event_starts_at: event.starts_at,
      price_cents: event.price_cents ?? 0,
    });
  }

  return rows;
}
