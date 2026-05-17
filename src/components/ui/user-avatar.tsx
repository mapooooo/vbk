import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { ProfilePreview } from "@/lib/types";

export function UserAvatar({
  profile,
  size = "md",
}: {
  profile?: Pick<ProfilePreview, "full_name" | "avatar_url"> | null;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  const sizeClass = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
    xl: "h-24 w-24 text-lg",
  }[size];
  const initials = profile?.full_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() ?? "?";

  return (
    <Avatar className={sizeClass}>
      <AvatarImage src={profile?.avatar_url ?? undefined} />
      <AvatarFallback className="bg-[#5B9BD5]/20 text-[#2d5a7b]">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
