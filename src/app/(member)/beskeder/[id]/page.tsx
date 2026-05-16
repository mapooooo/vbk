import { notFound } from "next/navigation";
import { requireApprovedMember, getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ChatWindow } from "@/components/chat/chat-window";

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const profile = await requireApprovedMember();
  const { id } = await params;
  const supabase = await createClient();

  const { data: conv } = await supabase
    .from("conversations")
    .select("*")
    .eq("id", id)
    .single();

  if (!conv) notFound();
  if (conv.user_a !== profile.id && conv.user_b !== profile.id) notFound();

  const otherId = conv.user_a === profile.id ? conv.user_b : conv.user_a;
  const { data: other } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url")
    .eq("id", otherId)
    .single();

  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", id)
    .order("created_at", { ascending: true });

  return (
    <ChatWindow
      conversationId={id}
      otherUser={other!}
      initialMessages={messages ?? []}
      currentUserId={profile.id}
    />
  );
}
