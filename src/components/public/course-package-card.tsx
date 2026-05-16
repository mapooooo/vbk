import Link from "next/link";
import type { CoursePackage } from "@/lib/content/kursushold";
import { formatHoldStart } from "@/lib/utils/format-hold-date";

export function CoursePackageCard({
  pkg,
  showCta = true,
}: {
  pkg: CoursePackage;
  showCta?: boolean;
}) {
  return (
    <article className="flex h-full flex-col rounded-xl border border-border/80 bg-card p-6 shadow-sm">
      <h2 className="font-serif text-xl leading-snug text-foreground">{pkg.title}</h2>
      {pkg.subtitle && (
        <p className="mt-1 text-sm text-muted-foreground">{pkg.subtitle}</p>
      )}
      <p className="mt-4 text-base font-medium text-foreground">{pkg.price}</p>
      <p className="mt-2 text-sm font-medium text-[#5B9BD5]">
        {formatHoldStart(pkg.startsAt, pkg.startsNote)}
      </p>
      {showCta && (
        <div className="mt-auto flex flex-col gap-3 pt-6">
          <Link
            href="/kursushold"
            className="text-sm text-muted-foreground underline-offset-4 hover:text-[#5B9BD5] hover:underline"
          >
            Se mere
          </Link>
          <Link
            href="/bliv-medlem"
            className="flex h-11 w-full items-center justify-center rounded-lg border border-foreground/20 bg-background text-sm font-medium transition hover:border-[#5B9BD5] hover:text-[#5B9BD5]"
          >
            Tilmeld her
          </Link>
        </div>
      )}
    </article>
  );
}
