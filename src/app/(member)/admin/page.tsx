import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { AdminPanel } from "@/components/admin/admin-panel";
import { ApplicationsPanel } from "@/components/admin/applications-panel";

export default async function AdminPage() {
  await requireAdmin();
  const supabase = await createClient();

  const [{ data: invites }, { data: applications }] = await Promise.all([
    supabase
      .from("invites")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("membership_applications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  return (
    <div className="space-y-8">
      <ApplicationsPanel applications={applications ?? []} />
      <AdminPanel invites={invites ?? []} />
    </div>
  );
}
