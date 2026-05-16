import { requireApprovedMember } from "@/lib/auth";
import { ProfileForm } from "@/components/profile/profile-form";

export default async function ProfilPage() {
  const profile = await requireApprovedMember();
  return (
    <div className="mx-auto max-w-md space-y-6">
      <h1 className="font-serif text-2xl">Min profil</h1>
      <ProfileForm profile={profile} />
    </div>
  );
}
