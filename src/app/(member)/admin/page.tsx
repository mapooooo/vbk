import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { AdminPanel } from "@/components/admin/admin-panel";

export default async function AdminPage() {
  await requireAdmin();
  const supabase = await createClient();

  const { data: invites } = await supabase
    .from("invites")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  return <AdminPanel invites={invites ?? []} />;
}
