import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { coursePackages, getNextHoldStart } from "@/lib/content/kursushold";
import { formatHoldStart } from "@/lib/utils/format-hold-date";

export function HomeFeatureCards() {
  const next = getNextHoldStart();

  return (
    <div className="grid gap-6 md:grid-cols-2 md:gap-8">
      <Card className="border-none shadow-md">
        <CardContent className="flex h-full flex-col space-y-3 pt-6">
          <h2 className="font-serif text-xl text-[#5B9BD5]">Kursushold</h2>
          <p className="text-muted-foreground">
            Hold til hvalpe, voksne hunde og brugshunde. Vi hjælper jer med en
            god og lydig hund, så I kan nyde mange timer sammen.
          </p>
          {next && (
            <p className="text-sm font-medium text-foreground">
              Næste holdstart:{" "}
              <span className="text-[#5B9BD5]">
                {formatHoldStart(next.startsAt)}
              </span>
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            {coursePackages.length} holdtyper · se alle datoer og priser
          </p>
          <div className="mt-auto pt-4">
            <Link
              href="/kursushold"
              className="flex h-12 w-full items-center justify-center rounded-lg border border-foreground/20 text-sm font-medium transition hover:border-[#5B9BD5] hover:text-[#5B9BD5]"
            >
              Se kursushold
            </Link>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-md">
        <CardContent className="flex h-full flex-col space-y-3 pt-6">
          <h2 className="font-serif text-xl text-[#5B9BD5]">Bliv en del af klubben</h2>
          <p className="text-muted-foreground">
            Send en kort ansøgning — eller log ind, hvis du allerede har fået
            invitation til medlemsplatformen.
          </p>
          <div className="mt-auto flex flex-col gap-2 pt-4">
            <Link
              href="/bliv-medlem"
              className="flex h-12 w-full items-center justify-center rounded-lg bg-[#5B9BD5] px-4 text-center text-sm font-medium text-white hover:bg-[#4a8ac4]"
            >
              Ansøg om medlemskab
            </Link>
            <Link
              href="/log-ind"
              className="flex h-12 w-full items-center justify-center rounded-lg border border-[#5B9BD5] px-4 text-center text-sm font-medium text-[#5B9BD5] hover:bg-[#5B9BD5]/10"
            >
              Medlemslogin
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
