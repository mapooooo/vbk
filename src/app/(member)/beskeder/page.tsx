import { requireApprovedMember, getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { MessagesPageClient } from "@/components/chat/messages-page-client";

export default async function BeskederPage({
  searchParams,
}: {
  searchParams: Promise<{ user?: string }>;
}) {
  const profile = await requireApprovedMember();
  const { user: startUserId } = await searchParams;
  const supabase = await createClient();

  const { data: members } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url")
    .neq("id", profile.id)
    .not("approved_at", "is", null)
    .order("full_name");

  const { data: conversations } = await supabase
    .from("conversations")
    .select("*")
    .or(`user_a.eq.${profile.id},user_b.eq.${profile.id}`);

  const enriched = await Promise.all(
    (conversations ?? []).map(async (conv) => {
      const otherId = conv.user_a === profile.id ? conv.user_b : conv.user_a;
      const { data: other } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .eq("id", otherId)
        .single();

      const { data: lastMsg } = await supabase
        .from("messages")
        .select("body, created_at")
        .eq("conversation_id", conv.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      return {
        ...conv,
        other_user: other,
        last_message: lastMsg?.body,
        last_message_at: lastMsg?.created_at,
      };
    })
  );

  enriched.sort((a, b) => {
    const ta = a.last_message_at ?? a.created_at;
    const tb = b.last_message_at ?? b.created_at;
    return new Date(tb).getTime() - new Date(ta).getTime();
  });

  return (
    <MessagesPageClient
      members={members ?? []}
      conversations={enriched}
      currentUserId={profile.id}
      startUserId={startUserId}
    />
  );
}
