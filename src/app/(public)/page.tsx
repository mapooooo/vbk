import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function HomePage() {
  return (
    <>
      <section className="relative h-[min(70vh,520px)] w-full overflow-hidden">
        <Image
          src="/images/spor1.png"
          alt="Hund i træning på VBK bane"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute bottom-8 left-4 right-4 mx-auto max-w-3xl rounded-xl bg-black/50 p-6 text-white backdrop-blur-sm sm:left-8 sm:right-auto sm:max-w-lg">
          <h1 className="font-serif text-2xl font-medium sm:text-3xl">
            Velkommen til Vandel Brugshundeklub
          </h1>
          <p className="mt-2 text-sm text-white/90 sm:text-base">
            Træning, kursushold og hyggeligt fællesskab for hunde og ejere.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-8 md:grid-cols-3">
          <Card className="border-none shadow-md">
            <CardContent className="pt-6">
              <h2 className="font-serif text-xl text-[#5B9BD5]">Kursushold</h2>
              <p className="mt-2 text-muted-foreground">
                Hold til hvalpe og voksne hunde — vi hjælper jer med en god og
                lydig hund, så I kan nyde mange timer sammen.
              </p>
              <Link
                href="/kursushold"
                className="mt-3 inline-block text-sm text-[#5B9BD5] hover:underline"
              >
                Læs mere →
              </Link>
            </CardContent>
          </Card>
          <Card className="border-none shadow-md">
            <CardContent className="pt-6">
              <h2 className="font-serif text-xl text-[#5B9BD5]">Medlemstræning</h2>
              <p className="mt-2 text-muted-foreground">
                Træning der minder om politiets øvelser — med fokus på positiv
                oplevelse for både hund og ejer.
              </p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-md">
            <CardContent className="pt-6">
              <h2 className="font-serif text-xl text-[#5B9BD5]">Klubplatform</h2>
              <p className="mt-2 text-muted-foreground">
                Har du fået en invitation? Log ind for at se opslag, tilmelde dig
                hold og skrive med andre medlemmer.
              </p>
              <Link
                href="/log-ind"
                className="mt-4 flex h-12 w-full items-center justify-center rounded-lg bg-[#5B9BD5] text-sm font-medium text-white hover:bg-[#4a8ac4]"
              >
                Medlemslogin
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}
