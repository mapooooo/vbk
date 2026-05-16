import Image from "next/image";
import { HomeFeatureCards } from "@/components/public/home-feature-cards";

export default function HomePage() {
  return (
    <>
      <section className="relative h-[min(52vh,440px)] w-full overflow-hidden bg-background">
        <div className="absolute -right-[6%] -top-[10%] h-[118%] w-[118%]">
          <Image
            src="/images/landingpage_subtle.png"
            alt="Schæferhund i spring over forhindring — illustration"
            fill
            className="object-contain object-right object-top"
            priority
          />
        </div>
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background via-background/50 to-transparent pointer-events-none" />
        <div className="absolute bottom-5 left-4 right-4 mx-auto max-w-3xl rounded-xl border border-border/60 bg-card/95 p-5 shadow-lg backdrop-blur-sm sm:left-6 sm:right-auto sm:max-w-lg sm:p-6">
          <h1 className="font-serif text-2xl font-medium text-foreground sm:text-3xl">
            Velkommen til Vandel Brugshundeklub
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            Træning, kursushold og hyggeligt fællesskab for hunde og ejere.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 md:py-12">
        <HomeFeatureCards />
      </section>
    </>
  );
}
