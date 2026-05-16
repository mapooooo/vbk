import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SetPasswordForm } from "@/components/auth/set-password-form";

export default async function SetPasswordPage() {
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

  if (!profile?.approved_at) redirect("/auth/complete");
  if (profile.password_set_at) redirect("/hjem");

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-16">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="font-serif text-2xl">Opret adgangskode</CardTitle>
          <CardDescription>
            Første gang du er logget ind — vælg en adgangskode til fremtidige
            besøg.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SetPasswordForm isFirstTime />
        </CardContent>
      </Card>
    </main>
  );
}
