import Link from "next/link";
import { requireApprovedMember } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatEventDate } from "@/lib/utils/date";
import { ArrowLeft } from "lucide-react";

export default async function MineTilmeldingerPage() {
  const profile = await requireApprovedMember();
  const supabase = await createClient();

  const { data: registrations } = await supabase
    .from("event_registrations")
    .select(
      `
      status,
      payment_status,
      events (id, title, starts_at, location)
    `
    )
    .eq("user_id", profile.id)
    .in("status", ["registered", "waitlist"])
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        href="/tilmelding"
        className="inline-flex items-center gap-2 text-[#5B9BD5] hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Tilbage
      </Link>
      <h1 className="font-serif text-2xl">Mine tilmeldinger</h1>
      {!registrations?.length ? (
        <p className="text-muted-foreground">Du har ingen aktive tilmeldinger.</p>
      ) : (
        <ul className="space-y-4">
          {registrations.map((reg) => {
            const event = Array.isArray(reg.events) ? reg.events[0] : reg.events;
            if (!event) return null;
            return (
              <li key={event.id}>
                <Card className="border-none shadow-md">
                  <CardHeader>
                    <CardTitle className="font-serif text-lg">
                      {event.title}
                    </CardTitle>
                    <p className="text-sm text-[#5B9BD5]">
                      {formatEventDate(event.starts_at)}
                      {event.location ? ` · ${event.location}` : ""}
                    </p>
                  </CardHeader>
                  <CardContent className="flex gap-2">
                    <Badge>
                      {reg.status === "waitlist" ? "Venteliste" : "Tilmeldt"}
                    </Badge>
                    <Badge variant="outline">
                      {reg.payment_status === "free"
                        ? "Gratis"
                        : reg.payment_status}
                    </Badge>
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
