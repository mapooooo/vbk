import Image from "next/image";
import Link from "next/link";

const publicLinks = [
  { href: "/", label: "Hjem" },
  { href: "/kursushold", label: "Kursushold" },
  { href: "/om-os", label: "Om os" },
];

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-[#2d2d2d] text-white shadow-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="VBK logo"
            width={44}
            height={44}
            className="rounded-full bg-white p-0.5"
          />
          <span className="font-serif text-lg font-medium tracking-tight sm:text-xl">
            Vandel Brugshundeklub
          </span>
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {publicLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-white/90 transition hover:text-[#6eb5e8]"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/log-ind"
          className="inline-flex h-8 items-center justify-center rounded-lg bg-[#5B9BD5] px-3 text-sm font-medium text-white hover:bg-[#4a8ac4]"
        >
          Medlemslogin
        </Link>
      </div>
    </header>
  );
}
