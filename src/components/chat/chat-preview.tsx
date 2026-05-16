import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserAvatar } from "@/components/ui/user-avatar";
import { formatRelative } from "@/lib/utils/date";

export async function ChatPreview() {
  const profile = await getProfile();
  const supabase = await createClient();

  const { data: conversations } = await supabase
    .from("conversations")
    .select("*")
    .or(`user_a.eq.${profile!.id},user_b.eq.${profile!.id}`)
    .order("created_at", { ascending: false })
    .limit(5);

  const enriched = await Promise.all(
    (conversations ?? []).map(async (conv) => {
      const otherId = conv.user_a === profile!.id ? conv.user_b : conv.user_a;
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

      return { ...conv, other_user: other, last_message: lastMsg?.body, last_message_at: lastMsg?.created_at };
    })
  );

  return (
    <Card className="border-none shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="font-serif text-lg">Seneste samtaler</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {enriched.length === 0 ? (
          <p className="text-sm text-muted-foreground">Ingen beskeder endnu.</p>
        ) : (
          enriched.map((conv) => (
            <Link
              key={conv.id}
              href={`/beskeder/${conv.id}`}
              className="flex items-center gap-3 rounded-lg p-2 transition hover:bg-muted"
            >
              <UserAvatar profile={conv.other_user} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {conv.other_user?.full_name}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {conv.last_message ?? "Start samtalen"}
                </p>
              </div>
              {conv.last_message_at && (
                <span className="text-xs text-muted-foreground">
                  {formatRelative(conv.last_message_at)}
                </span>
              )}
            </Link>
          ))
        )}
        <Link
          href="/beskeder"
          className="block pt-2 text-center text-sm text-[#5B9BD5] hover:underline"
        >
          Se alle beskeder →
        </Link>
      </CardContent>
    </Card>
  );
}
