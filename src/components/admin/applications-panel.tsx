"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { MembershipApplication } from "@/lib/types";
import { formatShortDate } from "@/lib/utils/date";
import { toast } from "sonner";
import { Copy, Mail, Send } from "lucide-react";

const statusLabels: Record<MembershipApplication["status"], string> = {
  pending: "Afventer",
  invited: "Inviteret",
  rejected: "Afvist",
};

export function ApplicationsPanel({
  applications: initial,
}: {
  applications: MembershipApplication[];
}) {
  const [applications, setApplications] = useState(initial);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin;

  async function createInviteFromApplication(app: MembershipApplication) {
    setLoadingId(app.id);

    const res = await fetch(`/api/admin/applications/${app.id}/invite`, {
      method: "POST",
    });
    const data = await res.json().catch(() => ({}));

    setLoadingId(null);

    if (!res.ok) {
      toast.error(
        data.message ?? data.error ?? "Kunne ikke oprette invitation"
      );
      return;
    }

    if (data.inviteUrl) {
      await navigator.clipboard.writeText(data.inviteUrl);
    }

    if (data.emailSent) {
      toast.success(
        `Invitation sendt til ${app.email} — link også kopieret til udklipsholder`
      );
    } else {
      toast.warning(
        data.emailError
          ? `Invitation oprettet — mail kunne ikke sendes (${data.emailError}); link kopieret`
          : "Invitation oprettet — mail kunne ikke sendes; link kopieret"
      );
    }

    setApplications((prev) =>
      prev.map((a) =>
        a.id === app.id
          ? {
              ...a,
              status: "invited" as const,
              invite_id: data.inviteId ?? a.invite_id,
              invites: { token: data.token },
            }
          : a
      )
    );
  }

  async function resendInviteEmail(app: MembershipApplication) {
    setLoadingId(`resend-${app.id}`);

    const res = await fetch(
      `/api/admin/applications/${app.id}/invite/resend`,
      { method: "POST" }
    );
    const data = await res.json().catch(() => ({}));

    setLoadingId(null);

    if (!res.ok) {
      toast.error(data.message ?? data.error ?? "Kunne ikke sende mail");
      return;
    }

    if (data.emailSent) {
      toast.success(`Invitationsmail sendt igen til ${app.email}`);
    } else {
      toast.warning(
        data.emailError
          ? `Mail kunne ikke sendes: ${data.emailError}`
          : "Mail kunne ikke sendes — tjek Resend-opsætning"
      );
    }
  }

  function copyInviteLink(token: string) {
    const link = `${appUrl}/invite/${token}`;
    navigator.clipboard.writeText(link);
    toast.success("Invitationslink kopieret");
  }

  async function rejectApplication(app: MembershipApplication) {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase
      .from("membership_applications")
      .update({
        status: "rejected",
        reviewed_at: new Date().toISOString(),
        reviewed_by: user!.id,
      })
      .eq("id", app.id);

    if (error) {
      toast.error(error.message);
      return;
    }

    setApplications((prev) =>
      prev.map((a) =>
        a.id === app.id ? { ...a, status: "rejected" as const } : a
      )
    );
    toast.success("Ansøgning afvist");
  }

  const pending = applications.filter((a) => a.status === "pending");

  return (
    <Card className="border-none shadow-md">
      <CardHeader>
        <CardTitle className="font-serif text-lg">
          Ansøgninger {pending.length > 0 && `(${pending.length} nye)`}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {applications.length === 0 ? (
          <p className="text-sm text-muted-foreground">Ingen ansøgninger endnu.</p>
        ) : (
          applications.map((app) => (
            <div
              key={app.id}
              className="space-y-3 rounded-xl border bg-muted/30 p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-medium">{app.full_name}</p>
                  <p className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Mail className="h-3.5 w-3.5" />
                    {app.email}
                    {app.phone && ` · ${app.phone}`}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatShortDate(app.created_at)}
                  </p>
                </div>
                <Badge
                  variant={
                    app.status === "pending"
                      ? "default"
                      : app.status === "invited"
                        ? "secondary"
                        : "outline"
                  }
                >
                  {statusLabels[app.status]}
                </Badge>
              </div>
              {app.dog_info && (
                <p className="text-sm">
                  <span className="font-medium">Hund:</span> {app.dog_info}
                </p>
              )}
              <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                {app.message}
              </p>
              {app.status === "invited" && app.invites?.token && (
                <div className="space-y-2 rounded-lg border border-[#5B9BD5]/30 bg-[#5B9BD5]/5 p-3">
                  <p className="text-sm text-muted-foreground">
                    Ansøgeren skal åbne invitationslinket og gennemføre første
                    login der — derefter virker medlemslogin.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1"
                      onClick={() => copyInviteLink(app.invites!.token)}
                    >
                      <Copy className="h-4 w-4" />
                      Kopiér invitationslink
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1"
                      disabled={loadingId === `resend-${app.id}`}
                      onClick={() => resendInviteEmail(app)}
                    >
                      <Send className="h-4 w-4" />
                      {loadingId === `resend-${app.id}`
                        ? "Sender..."
                        : "Send mail igen"}
                    </Button>
                  </div>
                </div>
              )}
              {app.status === "pending" && (
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    className="bg-[#5B9BD5]"
                    disabled={loadingId === app.id}
                    onClick={() => createInviteFromApplication(app)}
                  >
                    <Mail className="mr-1 h-4 w-4" />
                    {loadingId === app.id
                      ? "Godkender..."
                      : "Godkend og send invitation"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => rejectApplication(app)}
                  >
                    Afvis
                  </Button>
                </div>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
