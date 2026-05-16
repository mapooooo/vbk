import { MemberHeader } from "@/components/layout/member-header";
import { MemberNav } from "@/components/layout/member-nav";

export default function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <MemberHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-24 pt-4 md:pb-8">
        {children}
      </main>
      <MemberNav />
    </>
  );
}
