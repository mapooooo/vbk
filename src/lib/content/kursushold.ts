export type CoursePackage = {
  id: string;
  title: string;
  subtitle?: string;
  price: string;
  /** Pris i øre til events.price_cents */
  priceCents: number;
  startsAt: string;
  startsNote?: string;
  capacity?: number | null;
  location?: string;
  description?: string;
};

/** Opdater holdstarter og priser her — synkroniseres til Tilmelding for medlemmer */
export const coursePackages: CoursePackage[] = [
  {
    id: "hvalpe",
    title: "Træningspakke for Hvalpe",
    price: "650,- kr for 8 trænings-sessioner",
    priceCents: 65000,
    startsAt: "2026-08-16",
    location: "Vandel Brugshundeklub",
    description:
      "Kursushold for hvalpe med 8 trænings-sessioner. Vi fokuserer på positiv grundtræning og socialisering.",
  },
  {
    id: "voksne",
    title: "Træningspakke for voksne hunde",
    subtitle: "Ældre end 6 mdr.",
    price: "650,- kr for 8 trænings-sessioner",
    priceCents: 65000,
    startsAt: "2026-08-16",
    location: "Vandel Brugshundeklub",
    description:
      "Kursushold for voksne hunde (ældre end 6 mdr.) med 8 trænings-sessioner.",
  },
  {
    id: "brugshunde",
    title: "Træningspakke Brugshunde",
    subtitle: "Hunde der har deltaget i lydighedskursus eller lign.",
    price: "650,- kr for 8 trænings-sessioner",
    priceCents: 65000,
    startsAt: "2026-08-16",
    startsNote: "min. 4 deltagere",
    capacity: 12,
    location: "Vandel Brugshundeklub",
    description:
      "For hunde med lydighedsgrundlag. Holdet gennemføres ved min. 4 tilmeldte.",
  },
];

export function getNextHoldStart() {
  const sorted = [...coursePackages].sort(
    (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()
  );
  return sorted[0];
}
