import { MemberHeader } from "@/components/layout/member-header";
import { MemberNav } from "@/components/layout/member-nav";
import { getProfile } from "@/lib/auth";

export default async function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getProfile();

  return (
    <>
      <MemberHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-24 pt-4 md:pb-8">
        {children}
      </main>
      <MemberNav isAdmin={profile?.role === "admin"} />
    </>
  );
}
