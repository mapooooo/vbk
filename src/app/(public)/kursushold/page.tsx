import Image from "next/image";
import Link from "next/link";
import { coursePackages } from "@/lib/content/kursushold";
import { CoursePackageCard } from "@/components/public/course-package-card";

const holdGallery = [
  {
    title: "Hvalpetræning",
    image: "/images/hvalpetræning.png",
  },
  {
    title: "Lydighed",
    image: "/images/lydighed1.png",
  },
  {
    title: "Sporarbejde",
    image: "/images/spor1.png",
  },
];

export default function KursusholdPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-serif text-3xl">Kursushold</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Vi tilbyder kursushold til både hvalpe og voksne hunde. Som medlem kan du
        tilmelde dig hold direkte i klubplatformen under{" "}
        <Link href="/tilmelding" className="text-[#5B9BD5] hover:underline">
          Tilmelding
        </Link>
        .
      </p>

      <section className="mt-10">
        <h2 className="font-serif text-2xl">Holdstarter og priser</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Nye medlemmer kan ansøge via{" "}
          <Link href="/bliv-medlem" className="text-[#5B9BD5] hover:underline">
            Bliv medlem
          </Link>
          . Allerede medlem? Log ind og tilmeld dig.
        </p>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {coursePackages.map((pkg) => (
            <CoursePackageCard key={pkg.id} pkg={pkg} />
          ))}
        </div>
      </section>

      <section className="mt-14">
        <h2 className="font-serif text-2xl">Fra træningen</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {holdGallery.map((item) => (
            <div
              key={item.title}
              className="relative aspect-[4/3] overflow-hidden rounded-xl"
            >
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                <p className="text-sm font-medium text-white">{item.title}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
