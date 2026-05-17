"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { PendingPaymentRow } from "@/lib/admin/pending-payments";
import { MOBILEPAY_NUMBER } from "@/lib/payments";
import { formatEventDate, formatShortDate } from "@/lib/utils/date";
import { toast } from "sonner";
import { Check, Smartphone } from "lucide-react";

export function PendingPaymentsPanel({
  initial,
}: {
  initial: PendingPaymentRow[];
}) {
  const [rows, setRows] = useState(initial);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function confirmPayment(row: PendingPaymentRow) {
    setLoadingId(row.id);

    const res = await fetch(
      `/api/admin/registrations/${row.id}/confirm-payment`,
      { method: "POST" }
    );
    const data = await res.json().catch(() => ({}));

    setLoadingId(null);

    if (!res.ok) {
      toast.error(data.message ?? data.error ?? "Kunne ikke godkende");
      return;
    }

    setRows((prev) => prev.filter((r) => r.id !== row.id));

    if (data.memberNotified) {
      toast.success(
        `Betaling godkendt — ${row.member_name} har fået bekræftelse på mail`
      );
    } else {
      toast.success("Betaling godkendt");
      if (row.member_email) {
        toast.warning(
          "Bekræftelsesmail kunne ikke sendes — tjek Resend-opsætning"
        );
      }
    }
  }

  return (
    <Card className="border-none shadow-md">
      <CardHeader>
        <CardTitle className="flex flex-wrap items-center gap-2 font-serif text-lg">
          <Smartphone className="h-5 w-5 text-[#5B9BD5]" />
          MobilePay afventer godkendelse
          {rows.length > 0 && (
            <Badge variant="default">{rows.length}</Badge>
          )}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Når du har modtaget betaling på {MOBILEPAY_NUMBER}, godkend her — medlemmet
          får mail om at pladsen er bekræftet.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Ingen afventende MobilePay-tilmeldinger.
          </p>
        ) : (
          rows.map((row) => (
            <div
              key={row.id}
              className="space-y-3 rounded-xl border bg-muted/30 p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-medium">{row.member_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {row.member_email || "Ingen e-mail fundet"}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Tilmeldt {formatShortDate(row.created_at)}
                  </p>
                </div>
                <Badge variant={row.status === "waitlist" ? "secondary" : "default"}>
                  {row.status === "waitlist" ? "Venteliste" : "Tilmeldt"}
                </Badge>
              </div>
              <div>
                <p className="font-medium">{row.event_title}</p>
                <p className="text-sm text-[#5B9BD5]">
                  {formatEventDate(row.event_starts_at)} ·{" "}
                  {(row.price_cents / 100).toFixed(0)} kr
                </p>
              </div>
              <Button
                size="sm"
                className="gap-1 bg-[#5B9BD5]"
                disabled={loadingId === row.id}
                onClick={() => confirmPayment(row)}
              >
                <Check className="h-4 w-4" />
                {loadingId === row.id
                  ? "Godkender..."
                  : "Betaling modtaget — send bekræftelse"}
              </Button>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
