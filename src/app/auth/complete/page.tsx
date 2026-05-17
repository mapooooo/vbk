import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { CompleteSignup } from "@/components/auth/complete-signup";

export default async function AuthCompletePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/log-ind");

  const { data: profile } = await supabase
    .from("profiles")
    .select("approved_at, password_set_at")
    .eq("id", user.id)
    .single();

  if (profile?.approved_at) {
    redirect(profile.password_set_at ? "/hjem" : "/auth/set-password");
  }

  const cookieStore = await cookies();
  let inviteToken = cookieStore.get("vbk_invite_token")?.value;
  let fullName = cookieStore.get("vbk_full_name")?.value
    ? decodeURIComponent(cookieStore.get("vbk_full_name")!.value)
    : "";

  const email = user.email?.toLowerCase();
  if (email && (!inviteToken || !fullName)) {
    const service = createServiceClient();

    if (!inviteToken) {
      const { data: invite } = await service
        .from("invites")
        .select("token")
        .eq("email", email)
        .is("used_at", null)
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (invite?.token) {
        inviteToken = invite.token;
      }
    }

    if (!fullName) {
      const { data: application } = await service
        .from("membership_applications")
        .select("full_name")
        .eq("email", email)
        .eq("status", "invited")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (application?.full_name) {
        fullName = application.full_name;
      }
    }
  }

  if (inviteToken && fullName) {
    const { error } = await supabase.rpc("complete_invite_signup", {
      p_invite_token: inviteToken,
      p_full_name: fullName,
    });

    if (!error) {
      redirect("/auth/set-password");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <CompleteSignup
        inviteToken={inviteToken}
        defaultName={fullName}
        userEmail={email}
      />
    </main>
  );
}
