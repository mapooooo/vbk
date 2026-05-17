import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PublicHeader } from "@/components/layout/header";
import { MemberLoginForm } from "@/components/auth/member-login-form";
import { AuthErrorBanner } from "@/components/auth/auth-error-banner";
import { AuthHashHandler } from "@/components/auth/auth-hash-handler";
import { createClient } from "@/lib/supabase/server";

export default async function LogIndPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("approved_at, password_set_at")
      .eq("id", user.id)
      .single();

    if (profile?.approved_at) {
      redirect(profile.password_set_at ? "/hjem" : "/auth/set-password");
    }
    redirect("/auth/complete");
  }

  return (
    <>
      <PublicHeader />
      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader>
            <CardTitle className="font-serif text-2xl">Medlemslogin</CardTitle>
            <CardDescription>
              Indtast din e-mail — vi finder selv ud af, om du skal fuldføre
              oprettelse eller logge ind.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Suspense fallback={null}>
              <AuthHashHandler next="/auth/complete" />
            </Suspense>
            <Suspense fallback={null}>
              <AuthErrorBanner />
            </Suspense>
            <Suspense
              fallback={
                <p className="text-center text-muted-foreground">Indlæser...</p>
              }
            >
              <MemberLoginForm />
            </Suspense>
            <p className="text-sm text-muted-foreground">
              Har du ikke adgang endnu?{" "}
              <Link href="/bliv-medlem" className="text-[#5B9BD5] hover:underline">
                Send en ansøgning
              </Link>
            </p>
            <Link
              href="/"
              className="inline-block text-sm text-[#5B9BD5] hover:underline"
            >
              ← Tilbage til forsiden
            </Link>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
