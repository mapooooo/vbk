"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { UserAvatar } from "@/components/ui/user-avatar";
import { formatRelative } from "@/lib/utils/date";
import type { Conversation, ProfilePreview } from "@/lib/types";
import { Search } from "lucide-react";
import { toast } from "sonner";

export function MessagesPageClient({
  members,
  conversations: initialConversations,
  currentUserId,
  startUserId,
}: {
  members: ProfilePreview[];
  conversations: Conversation[];
  currentUserId: string;
  startUserId?: string;
}) {
  const [search, setSearch] = useState("");
  const [conversations, setConversations] = useState(initialConversations);
  const router = useRouter();

  const filteredMembers = members.filter((m) =>
    m.full_name.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    if (!startUserId) return;

    async function startChat() {
      const existing = conversations.find(
        (c) =>
          c.other_user?.id === startUserId ||
          c.user_a === startUserId ||
          c.user_b === startUserId
      );
      if (existing) {
        router.push(`/beskeder/${existing.id}`);
        return;
      }

      const supabase = createClient();
      const userA = currentUserId < startUserId! ? currentUserId : startUserId!;
      const userB = currentUserId < startUserId! ? startUserId! : currentUserId;

      const { data, error } = await supabase
        .from("conversations")
        .insert({ user_a: userA, user_b: userB })
        .select()
        .single();

      if (error) {
        if (error.code === "23505") {
          const { data: found } = await supabase
            .from("conversations")
            .select("id")
            .eq("user_a", userA)
            .eq("user_b", userB)
            .single();
          if (found) router.push(`/beskeder/${found.id}`);
        } else {
          toast.error(error.message);
        }
        return;
      }

      router.push(`/beskeder/${data.id}`);
    }

    startChat();
  }, [startUserId, currentUserId, conversations, router]);

  async function openChatWith(memberId: string) {
    const existing = conversations.find(
      (c) => c.user_a === memberId || c.user_b === memberId
    );
    if (existing) {
      router.push(`/beskeder/${existing.id}`);
      return;
    }

    const supabase = createClient();
    const userA = currentUserId < memberId ? currentUserId : memberId;
    const userB = currentUserId < memberId ? memberId : currentUserId;

    const { data, error } = await supabase
      .from("conversations")
      .insert({ user_a: userA, user_b: userB })
      .select()
      .single();

    if (error && error.code !== "23505") {
      toast.error(error.message);
      return;
    }

    const convId =
      data?.id ??
      (
        await supabase
          .from("conversations")
          .select("id")
          .eq("user_a", userA)
          .eq("user_b", userB)
          .single()
      ).data?.id;

    if (convId) router.push(`/beskeder/${convId}`);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <h1 className="font-serif text-2xl">Seneste samtaler</h1>
        {conversations.length === 0 ? (
          <p className="text-muted-foreground">Ingen samtaler endnu.</p>
        ) : (
          <ul className="space-y-2">
            {conversations.map((conv) => (
              <li key={conv.id}>
                <Link
                  href={`/beskeder/${conv.id}`}
                  className="flex items-center gap-3 rounded-xl bg-card p-4 shadow-sm transition hover:shadow-md"
                >
                  <UserAvatar profile={conv.other_user} />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{conv.other_user?.full_name}</p>
                    <p className="truncate text-sm text-muted-foreground">
                      {conv.last_message ?? "Ny samtale"}
                    </p>
                  </div>
                  {conv.last_message_at && (
                    <span className="text-xs text-muted-foreground">
                      {formatRelative(conv.last_message_at)}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="space-y-4">
        <h2 className="font-serif text-xl">Medlemmer</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Søg medlemmer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-12 pl-10"
          />
        </div>
        <ul className="max-h-[60vh] space-y-2 overflow-y-auto">
          {filteredMembers.map((m) => (
            <li key={m.id}>
              <button
                type="button"
                onClick={() => openChatWith(m.id)}
                className="flex w-full items-center gap-3 rounded-xl bg-card p-4 text-left shadow-sm transition hover:shadow-md"
              >
                <UserAvatar profile={m} />
                <span className="font-medium">{m.full_name}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
