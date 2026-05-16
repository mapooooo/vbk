import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";
import { FeedClient } from "./feed-client";

export async function FeedPanel() {
  const supabase = await createClient();
  const profile = await getProfile();

  const { data: posts } = await supabase
    .from("posts")
    .select(`*, author:profiles!author_id(id, full_name, avatar_url)`)
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false });

  const postIds = posts?.map((p) => p.id) ?? [];

  let likeCounts: Record<string, number> = {};
  let commentCounts: Record<string, number> = {};
  let likedSet = new Set<string>();

  if (postIds.length > 0) {
    const { data: likes } = await supabase
      .from("post_likes")
      .select("post_id, user_id")
      .in("post_id", postIds);

    for (const l of likes ?? []) {
      likeCounts[l.post_id] = (likeCounts[l.post_id] ?? 0) + 1;
      if (l.user_id === profile!.id) likedSet.add(l.post_id);
    }

    const { data: comments } = await supabase
      .from("post_comments")
      .select("post_id")
      .in("post_id", postIds);

    for (const c of comments ?? []) {
      commentCounts[c.post_id] = (commentCounts[c.post_id] ?? 0) + 1;
    }
  }

  const enriched = (posts ?? []).map((p) => ({
    ...p,
    author: Array.isArray(p.author) ? p.author[0] : p.author,
    like_count: likeCounts[p.id] ?? 0,
    comment_count: commentCounts[p.id] ?? 0,
    liked_by_me: likedSet.has(p.id),
  }));

  return (
    <FeedClient initialPosts={enriched} isAdmin={profile?.role === "admin"} />
  );
}
