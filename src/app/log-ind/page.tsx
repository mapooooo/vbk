import Link from "next/link";
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

export default function LogIndPage() {
  return (
    <>
      <PublicHeader />
      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader>
            <CardTitle className="font-serif text-2xl">Medlemslogin</CardTitle>
            <CardDescription>
              Log ind med den e-mail, du brugte da du blev medlem.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Suspense fallback={null}>
              <AuthErrorBanner />
            </Suspense>
            <Suspense fallback={<p className="text-muted-foreground">Indlæser...</p>}>
              <MemberLoginForm />
            </Suspense>
            <p className="text-sm text-muted-foreground">
              Har du ikke adgang endnu?{" "}
              <Link href="/bliv-medlem" className="text-[#5B9BD5] hover:underline">
                Send en ansøgning
              </Link>{" "}
              — bestyrelsen sender et invitationslink, når du er godkendt.
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
