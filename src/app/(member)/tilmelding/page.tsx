import { requireApprovedMember, getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { EventsList } from "@/components/events/events-list";

export default async function TilmeldingPage() {
  const profile = await requireApprovedMember();
  const supabase = await createClient();

  const { data: events } = await supabase
    .from("events")
    .select("*")
    .eq("published", true)
    .gte("starts_at", new Date().toISOString())
    .order("starts_at", { ascending: true });

  const eventIds = events?.map((e) => e.id) ?? [];

  let registrations: { event_id: string; status: string; payment_status: string }[] = [];
  if (eventIds.length > 0) {
    const { data } = await supabase
      .from("event_registrations")
      .select("event_id, status, payment_status")
      .eq("user_id", profile.id)
      .in("event_id", eventIds);
    registrations = data ?? [];
  }

  const regMap = new Map(registrations.map((r) => [r.event_id, r]));

  const counts = await Promise.all(
    (events ?? []).map(async (e) => {
      const { count } = await supabase
        .from("event_registrations")
        .select("*", { count: "exact", head: true })
        .eq("event_id", e.id)
        .eq("status", "registered");
      return { id: e.id, count: count ?? 0 };
    })
  );
  const countMap = new Map(counts.map((c) => [c.id, c.count]));

  const enriched = (events ?? []).map((e) => ({
    ...e,
    registration_count: countMap.get(e.id) ?? 0,
    my_registration: regMap.get(e.id) ?? null,
  }));

  const canManage = profile.role === "admin" || profile.role === "trainer";

  return (
    <EventsList
      events={enriched}
      currentUserId={profile.id}
      canManage={canManage}
    />
  );
}
