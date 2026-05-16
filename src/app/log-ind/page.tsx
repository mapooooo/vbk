import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PublicHeader } from "@/components/layout/header";

export default function LogIndPage() {
  return (
    <>
      <PublicHeader />
      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader>
            <CardTitle className="font-serif text-2xl">Medlemslogin</CardTitle>
            <CardDescription>
              Du skal have en invitation fra klubben for at oprette adgang.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Har du modtaget et invitationslink? Åbn linket i din e-mail eller
              besked fra klubben — der kan du logge ind med magic link.
            </p>
            <p className="text-sm text-muted-foreground">
              Har du ikke en invitation? Kontakt bestyrelsen i klubben.
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
