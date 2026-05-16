import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
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
  const inviteToken = cookieStore.get("vbk_invite_token")?.value;
  const fullName = cookieStore.get("vbk_full_name")?.value
    ? decodeURIComponent(cookieStore.get("vbk_full_name")!.value)
    : "";

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
      />
    </main>
  );
}
