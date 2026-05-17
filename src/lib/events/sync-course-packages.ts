import { coursePackages } from "@/lib/content/kursushold";
import { createServiceClient } from "@/lib/supabase/service";

function buildDescription(pkg: (typeof coursePackages)[number]) {
  const parts = [
    pkg.description,
    pkg.subtitle,
    pkg.price,
    pkg.startsNote ? `Holdstart: ${pkg.startsNote}` : null,
  ].filter(Boolean);
  return parts.join("\n\n");
}

/** Synkroniserer kursushold fra kursushold.ts til events-tabellen (én gang pr. load). */
export async function syncCoursePackagesToEvents(): Promise<{
  synced: number;
  error?: string;
}> {
  const service = createServiceClient();

  const { data: admin, error: adminError } = await service
    .from("profiles")
    .select("id")
    .eq("role", "admin")
    .limit(1)
    .maybeSingle();

  if (adminError || !admin) {
    return {
      synced: 0,
      error: adminError?.message ?? "Ingen admin-profil til at oprette hold",
    };
  }

  let synced = 0;

  for (const pkg of coursePackages) {
    const startsAt = new Date(`${pkg.startsAt}T10:00:00`);

    const row = {
      course_package_id: pkg.id,
      title: pkg.title,
      description: buildDescription(pkg),
      starts_at: startsAt.toISOString(),
      ends_at: null,
      location: pkg.location ?? "Vandel Brugshundeklub",
      capacity: pkg.capacity ?? null,
      price_cents: pkg.priceCents,
      stripe_price_id: null,
      created_by: admin.id,
      published: true,
    };

    const { data: existing } = await service
      .from("events")
      .select("id")
      .eq("course_package_id", pkg.id)
      .maybeSingle();

    if (existing) {
      const { error } = await service
        .from("events")
        .update({
          title: row.title,
          description: row.description,
          starts_at: row.starts_at,
          location: row.location,
          capacity: row.capacity,
          price_cents: row.price_cents,
          published: true,
        })
        .eq("id", existing.id);

      if (!error) synced += 1;
      else console.error("sync course update:", pkg.id, error);
    } else {
      const { error } = await service.from("events").insert(row);
      if (!error) synced += 1;
      else console.error("sync course insert:", pkg.id, error);
    }
  }

  return { synced };
}
