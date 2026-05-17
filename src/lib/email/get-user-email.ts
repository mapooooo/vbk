import { createServiceClient } from "@/lib/supabase/service";

export async function getUserEmail(userId: string): Promise<string | null> {
  const service = createServiceClient();
  const { data, error } = await service.auth.admin.getUserById(userId);
  if (error || !data.user?.email) return null;
  return data.user.email.toLowerCase();
}

export async function getAdminNotificationEmails(): Promise<string[]> {
  const envEmail = process.env.ADMIN_NOTIFICATION_EMAIL?.trim();
  if (envEmail) {
    return [envEmail.toLowerCase()];
  }

  const service = createServiceClient();
  const { data: admins } = await service
    .from("profiles")
    .select("id")
    .eq("role", "admin");

  const emails = new Set<string>();
  for (const admin of admins ?? []) {
    const email = await getUserEmail(admin.id);
    if (email) emails.add(email);
  }

  return [...emails];
}
