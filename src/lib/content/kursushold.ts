export type CoursePackage = {
  id: string;
  title: string;
  subtitle?: string;
  price: string;
  startsAt: string;
  startsNote?: string;
};

/** Opdater holdstarter og priser her — vises på forsiden og /kursushold */
export const coursePackages: CoursePackage[] = [
  {
    id: "hvalpe",
    title: "Træningspakke for Hvalpe",
    price: "650,- kr for 8 trænings-sessioner",
    startsAt: "2026-08-16",
  },
  {
    id: "voksne",
    title: "Træningspakke for voksne hunde",
    subtitle: "Ældre end 6 mdr.",
    price: "650,- kr for 8 trænings-sessioner",
    startsAt: "2026-08-16",
  },
  {
    id: "brugshunde",
    title: "Træningspakke Brugshunde",
    subtitle: "Hunde der har deltaget i lydighedskursus eller lign.",
    price: "650,- kr for 8 trænings-sessioner",
    startsAt: "2026-08-16",
    startsNote: "min. 4 deltagere",
  },
];

export function getNextHoldStart() {
  const sorted = [...coursePackages].sort(
    (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()
  );
  return sorted[0];
}
