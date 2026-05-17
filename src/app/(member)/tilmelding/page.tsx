import { requireApprovedMember } from "@/lib/auth";
import { syncCoursePackagesToEvents } from "@/lib/events/sync-course-packages";
import { createClient } from "@/lib/supabase/server";
import { EventsList } from "@/components/events/events-list";

export default async function TilmeldingPage() {
  const profile = await requireApprovedMember();
  await syncCoursePackagesToEvents();
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

  const participantsByEvent = new Map<
    string,
    { full_name: string; avatar_url: string | null; status: "registered" | "waitlist" }[]
  >();
  if (eventIds.length > 0) {
    const { data } = await supabase
      .from("event_registrations")
      .select("event_id, status, profiles(full_name, avatar_url)")
      .in("event_id", eventIds)
      .in("status", ["registered", "waitlist"]);

    for (const row of data ?? []) {
      const profile = Array.isArray(row.profiles)
        ? row.profiles[0]
        : row.profiles;
      const entry = {
        full_name: profile?.full_name ?? "Medlem",
        avatar_url: profile?.avatar_url ?? null,
        status: row.status as "registered" | "waitlist",
      };
      const list = participantsByEvent.get(row.event_id) ?? [];
      list.push(entry);
      participantsByEvent.set(row.event_id, list);
    }
  }

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

  const enriched = (events ?? []).map((e) => {
    const participants = (participantsByEvent.get(e.id) ?? []).sort((a, b) => {
      if (a.status !== b.status) {
        return a.status === "registered" ? -1 : 1;
      }
      return a.full_name.localeCompare(b.full_name, "da");
    });
    return {
      ...e,
      registration_count: countMap.get(e.id) ?? 0,
      participants,
      my_registration: regMap.get(e.id) ?? null,
    };
  });

  const canManage = profile.role === "admin" || profile.role === "trainer";

  return (
    <EventsList
      events={enriched}
      currentUserId={profile.id}
      canManage={canManage}
    />
  );
}
