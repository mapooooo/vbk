import Image from "next/image";
import Link from "next/link";
import { getProfile } from "@/lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export async function MemberHeader() {
  const profile = await getProfile();

  return (
    <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/hjem" className="flex items-center gap-2">
          <Image src="/logo.png" alt="VBK" width={36} height={36} className="rounded-full" />
          <span className="hidden font-serif text-lg sm:inline">VBK</span>
        </Link>
        <nav className="hidden items-center gap-4 md:flex">
          <Link href="/hjem" className="text-sm hover:text-[#5B9BD5]">
            Hjem
          </Link>
          <Link href="/tilmelding" className="text-sm hover:text-[#5B9BD5]">
            Tilmelding
          </Link>
          <Link href="/beskeder" className="text-sm hover:text-[#5B9BD5]">
            Beskeder
          </Link>
          {profile?.role === "admin" && (
            <Link href="/admin" className="text-sm hover:text-[#5B9BD5]">
              Admin
            </Link>
          )}
        </nav>
        <Link
          href="/profil"
          className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-muted"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={profile?.avatar_url ?? undefined} />
            <AvatarFallback>
              {profile?.full_name?.slice(0, 2).toUpperCase() ?? "?"}
            </AvatarFallback>
          </Avatar>
          <span className="hidden sm:inline">{profile?.full_name}</span>
        </Link>
      </div>
    </header>
  );
}
