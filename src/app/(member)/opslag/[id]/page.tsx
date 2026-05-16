import { notFound } from "next/navigation";
import { requireApprovedMember, getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PostDetail } from "@/components/feed/post-detail";

export default async function OpslagPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireApprovedMember();
  const profile = await getProfile();
  const { id } = await params;
  const supabase = await createClient();

  const { data: post } = await supabase
    .from("posts")
    .select(`*, author:profiles!author_id(id, full_name, avatar_url)`)
    .eq("id", id)
    .single();

  if (!post) notFound();

  const { data: comments } = await supabase
    .from("post_comments")
    .select(`*, author:profiles!user_id(id, full_name, avatar_url)`)
    .eq("post_id", id)
    .order("created_at", { ascending: true });

  const { data: like } = await supabase
    .from("post_likes")
    .select("post_id")
    .eq("post_id", id)
    .eq("user_id", profile!.id)
    .maybeSingle();

  const { count: likeCount } = await supabase
    .from("post_likes")
    .select("*", { count: "exact", head: true })
    .eq("post_id", id);

  return (
    <PostDetail
      post={{
        ...post,
        author: Array.isArray(post.author) ? post.author[0] : post.author,
        liked_by_me: !!like,
        like_count: likeCount ?? 0,
      }}
      comments={(comments ?? []).map((c) => ({
        ...c,
        author: Array.isArray(c.author) ? c.author[0] : c.author,
      }))}
      currentUserId={profile!.id}
      isAdmin={profile!.role === "admin"}
    />
  );
}
