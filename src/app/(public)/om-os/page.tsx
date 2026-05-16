import Image from "next/image";

export default function OmOsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-serif text-3xl">Om os</h1>
      <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
        Vi er en lille klub, Vandel Brugshundeklub, startet med det formål at
        træne vores hunde. Her træner vi et program, der minder om politiets
        øvelser, og samtidig nyder vi hyggeligt socialt samvær.
      </p>
      <p className="mt-4 text-muted-foreground leading-relaxed">
        Vi lægger vægt på at skabe en positiv træningsoplevelse for både hunde
        og deres ejere i vores fællesskab.
      </p>
      <div className="relative mt-8 aspect-[4/5] max-h-[520px] w-full overflow-hidden rounded-xl sm:aspect-[3/4]">
        <Image
          src="/images/gili.png"
          alt="Træning på VBK bane"
          fill
          className="object-cover object-[50%_32%]"
        />
      </div>
    </div>
  );
}
