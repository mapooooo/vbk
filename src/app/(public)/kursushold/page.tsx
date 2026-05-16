import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const holds = [
  {
    title: "Hvalpetræning",
    desc: "Gode vaner fra start — socialisering og grundlæggende øvelser for de mindste.",
    image: "/images/hvalpetræning.png",
  },
  {
    title: "Lydighed",
    desc: "Kursushold for voksne hunde — vi hjælper med en god og lydig hund I kan nyde mange timer med.",
    image: "/images/lydighed1.png",
  },
  {
    title: "Sporarbejde",
    desc: "Træning i spor og næsework for hunde med drive og nysgerrighed.",
    image: "/images/spor1.png",
  },
];

export default function KursusholdPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-serif text-3xl">Kursushold</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Vi tilbyder kursushold til både hvalpe og voksne hunde. Som medlem kan du
        tilmelde dig hold direkte i klubplatformen.
      </p>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {holds.map((hold) => (
          <Card key={hold.title} className="overflow-hidden border-none shadow-md">
            <div className="relative aspect-[4/3]">
              <Image src={hold.image} alt={hold.title} fill className="object-cover" />
            </div>
            <CardHeader>
              <CardTitle className="font-serif text-xl">{hold.title}</CardTitle>
            </CardHeader>
            <CardContent className="-mt-2 text-muted-foreground">{hold.desc}</CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
