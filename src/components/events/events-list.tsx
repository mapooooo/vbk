"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatEventDate } from "@/lib/utils/date";
import { isStripeEnabled } from "@/lib/stripe";
import type { Event } from "@/lib/types";
import { Calendar, MapPin, Users } from "lucide-react";
import { toast } from "sonner";
import { CreateEventDialog } from "./create-event-dialog";

export function EventsList({
  events: initialEvents,
  currentUserId,
  canManage,
}: {
  events: Event[];
  currentUserId: string;
  canManage: boolean;
}) {
  const [events, setEvents] = useState(initialEvents);

  async function register(event: Event) {
    const supabase = createClient();
    const registered = event.registration_count ?? 0;
    const full =
      event.capacity != null && registered >= event.capacity;

    const status = full ? "waitlist" : "registered";
    const payment_status =
      event.price_cents > 0 && isStripeEnabled() ? "pending" : "free";

    if (event.price_cents > 0 && !isStripeEnabled()) {
      toast.info("Betaling kommer snart — kontakt klubben for tilmelding.");
      return;
    }

    const { error } = await supabase.from("event_registrations").upsert(
      {
        event_id: event.id,
        user_id: currentUserId,
        status,
        payment_status,
      },
      { onConflict: "event_id,user_id" }
    );

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success(
      status === "waitlist"
        ? "Du er på venteliste"
        : "Du er tilmeldt!"
    );
    window.location.reload();
  }

  async function cancel(eventId: string) {
    const supabase = createClient();
    const { error } = await supabase
      .from("event_registrations")
      .update({ status: "cancelled" })
      .eq("event_id", eventId)
      .eq("user_id", currentUserId);

    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Tilmelding annulleret");
    window.location.reload();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl">Tilmelding</h1>
          <p className="text-muted-foreground">
            Hold og arrangementer du kan tilmelde dig
          </p>
        </div>
        {canManage && (
          <CreateEventDialog onCreated={() => window.location.reload()} />
        )}
      </div>

      <div>
        <Link
          href="/tilmelding/mine"
          className="text-[#5B9BD5] hover:underline"
        >
          Se mine tilmeldinger →
        </Link>
      </div>

      {events.length === 0 ? (
        <p className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
          Ingen kommende hold eller arrangementer lige nu.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {events.map((event) => {
            const reg = event.my_registration;
            const isRegistered = reg?.status === "registered";
            const isWaitlist = reg?.status === "waitlist";
            const spotsLeft =
              event.capacity != null
                ? event.capacity - (event.registration_count ?? 0)
                : null;

            return (
              <Card key={event.id} className="border-none shadow-md">
                <CardHeader>
                  <CardTitle className="font-serif text-xl">
                    {event.title}
                  </CardTitle>
                  <div className="flex flex-wrap gap-2 text-sm text-[#5B9BD5]">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatEventDate(event.starts_at)}
                    </span>
                    {event.location && (
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {event.location}
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {event.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    {event.capacity != null && (
                      <Badge variant="secondary" className="gap-1">
                        <Users className="h-3 w-3" />
                        {event.registration_count}/{event.capacity} tilmeldt
                      </Badge>
                    )}
                    <Badge variant="outline">
                      {event.price_cents === 0
                        ? "Gratis"
                        : `${(event.price_cents / 100).toFixed(0)} kr`}
                      {event.price_cents > 0 && !isStripeEnabled() && " · betaling snart"}
                    </Badge>
                    {isRegistered && <Badge className="bg-green-600">Tilmeldt</Badge>}
                    {isWaitlist && <Badge variant="secondary">Venteliste</Badge>}
                  </div>
                  {isRegistered || isWaitlist ? (
                    <Button
                      variant="outline"
                      className="h-12 w-full"
                      onClick={() => cancel(event.id)}
                    >
                      Afmeld
                    </Button>
                  ) : (
                    <Button
                      className="h-12 w-full bg-[#5B9BD5] hover:bg-[#4a8ac4]"
                      onClick={() => register(event)}
                      disabled={spotsLeft === 0 && event.capacity != null}
                    >
                      {spotsLeft === 0 && event.capacity != null
                        ? "Tilmeld venteliste"
                        : "Tilmeld"}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
