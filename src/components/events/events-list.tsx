"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatEventDate } from "@/lib/utils/date";
import { MobilePayNotice } from "@/components/payments/mobilepay-notice";
import {
  MOBILEPAY_NUMBER,
  mobilePayPaymentLabel,
  usesManualMobilePay,
} from "@/lib/payments";
import type { Event } from "@/lib/types";
import { Calendar, MapPin } from "lucide-react";
import { toast } from "sonner";
import { CreateEventDialog } from "./create-event-dialog";
import { EventParticipantsBadge } from "./event-participants-badge";

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
    const res = await fetch("/api/registrations/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventId: event.id }),
    });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      toast.error(data.error ?? "Kunne ikke tilmelde");
      return;
    }

    const status = data.status as string;

    if (status === "waitlist") {
      toast.success("Du er på venteliste");
    } else if (event.price_cents > 0 && usesManualMobilePay()) {
      toast.success(
        `Du er tilmeldt! Betal ${(event.price_cents / 100).toFixed(0)} kr til ${MOBILEPAY_NUMBER} med holdnavn i beskeden. Du får mail, når betalingen er godkendt.`,
        { duration: 10000 }
      );
    } else {
      toast.success("Du er tilmeldt!");
    }
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

      {usesManualMobilePay() && <MobilePayNotice />}

      {events.length === 0 ? (
        <p className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
          Ingen kommende hold lige nu. Hold fra{" "}
          <Link href="/kursushold" className="text-[#5B9BD5] hover:underline">
            Kursushold
          </Link>{" "}
          vises her, når de er synkroniseret — kontakt admin hvis listen er tom.
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
                  {event.price_cents > 0 && usesManualMobilePay() && (
                    <MobilePayNotice compact holdTitle={event.title} />
                  )}
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    {event.capacity != null && (
                      <EventParticipantsBadge
                        registeredCount={event.registration_count ?? 0}
                        capacity={event.capacity}
                        participants={event.participants ?? []}
                      />
                    )}
                    <Badge variant="outline">
                      {mobilePayPaymentLabel(event.price_cents)}
                    </Badge>
                    {isRegistered && (
                      <Badge
                        className={
                          reg?.payment_status === "paid" || event.price_cents === 0
                            ? "bg-green-600"
                            : reg?.payment_status === "pending"
                              ? "bg-amber-600"
                              : "bg-green-600"
                        }
                      >
                        {reg?.payment_status === "pending"
                          ? "Afventer betaling"
                          : reg?.payment_status === "paid"
                            ? "Plads godkendt"
                            : "Tilmeldt"}
                      </Badge>
                    )}
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
