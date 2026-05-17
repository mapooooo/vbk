import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { AdminPanel } from "@/components/admin/admin-panel";
import { ApplicationsPanel } from "@/components/admin/applications-panel";
import { PendingPaymentsPanel } from "@/components/admin/pending-payments-panel";
import { fetchPendingPaymentRegistrations } from "@/lib/admin/pending-payments";

export default async function AdminPage() {
  await requireAdmin();
  const supabase = await createClient();

  const [{ data: invites }, { data: applications }, pendingPayments] =
    await Promise.all([
      supabase
        .from("invites")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50),
      supabase
        .from("membership_applications")
        .select("*, invites(token)")
        .order("created_at", { ascending: false })
        .limit(50),
      fetchPendingPaymentRegistrations(),
    ]);

  return (
    <div className="space-y-8">
      <PendingPaymentsPanel initial={pendingPayments} />
      <ApplicationsPanel applications={applications ?? []} />
      <AdminPanel invites={invites ?? []} />
    </div>
  );
}
