"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { MembershipApplication } from "@/lib/types";
import { formatShortDate } from "@/lib/utils/date";
import { toast } from "sonner";
import { Copy, Mail } from "lucide-react";

function generateToken() {
  const arr = new Uint8Array(24);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
}

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
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin;

  async function createInviteFromApplication(app: MembershipApplication) {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const token = generateToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 14);

    const { data: invite, error: inviteError } = await supabase
      .from("invites")
      .insert({
        token,
        email: app.email,
        created_by: user!.id,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (inviteError) {
      toast.error(inviteError.message);
      return;
    }

    const { error: updateError } = await supabase
      .from("membership_applications")
      .update({
        status: "invited",
        invite_id: invite.id,
        reviewed_at: new Date().toISOString(),
        reviewed_by: user!.id,
      })
      .eq("id", app.id);

    if (updateError) {
      toast.error(updateError.message);
      return;
    }

    const link = `${appUrl}/invite/${token}`;
    await navigator.clipboard.writeText(link);
    toast.success("Invitation oprettet — link kopieret til udklipsholder");

    setApplications((prev) =>
      prev.map((a) =>
        a.id === app.id
          ? { ...a, status: "invited" as const, invite_id: invite.id }
          : a
      )
    );
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
              {app.status === "pending" && (
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    className="bg-[#5B9BD5]"
                    onClick={() => createInviteFromApplication(app)}
                  >
                    <Copy className="mr-1 h-4 w-4" />
                    Opret invitation
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
