"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { UserAvatar } from "@/components/ui/user-avatar";
import { formatRelative, formatEventDate } from "@/lib/utils/date";
import type { Post, PostComment } from "@/lib/types";
import { Heart, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export function PostDetail({
  post: initialPost,
  comments: initialComments,
  currentUserId,
  isAdmin,
}: {
  post: Post;
  comments: PostComment[];
  currentUserId: string;
  isAdmin: boolean;
}) {
  const [post, setPost] = useState(initialPost);
  const [comments, setComments] = useState(initialComments);
  const [commentBody, setCommentBody] = useState("");
  const [loading, setLoading] = useState(false);

  async function toggleLike() {
    const supabase = createClient();
    if (post.liked_by_me) {
      await supabase
        .from("post_likes")
        .delete()
        .eq("post_id", post.id)
        .eq("user_id", currentUserId);
      setPost((p) => ({
        ...p,
        liked_by_me: false,
        like_count: (p.like_count ?? 1) - 1,
      }));
    } else {
      await supabase.from("post_likes").insert({
        post_id: post.id,
        user_id: currentUserId,
      });
      setPost((p) => ({
        ...p,
        liked_by_me: true,
        like_count: (p.like_count ?? 0) + 1,
      }));
    }
  }

  async function submitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!commentBody.trim()) return;
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("post_comments")
      .insert({
        post_id: post.id,
        user_id: currentUserId,
        body: commentBody.trim(),
      })
      .select(`*, author:profiles!user_id(id, full_name, avatar_url)`)
      .single();
    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    setComments((c) => [
      ...c,
      {
        ...data,
        author: Array.isArray(data.author) ? data.author[0] : data.author,
      },
    ]);
    setCommentBody("");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        href="/hjem"
        className="inline-flex items-center gap-2 text-sm text-[#5B9BD5] hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Tilbage til feed
      </Link>

      <article className="rounded-xl bg-card p-6 shadow-md">
        <div className="flex items-start gap-3">
          <UserAvatar profile={post.author} size="lg" />
          <div>
            <p className="font-medium">{post.author?.full_name}</p>
            <p className="text-sm text-muted-foreground">
              {formatRelative(post.created_at)}
            </p>
          </div>
        </div>
        <h1 className="mt-4 font-serif text-3xl">{post.title}</h1>
        {post.starts_at && (
          <p className="mt-2 font-medium text-[#5B9BD5]">
            {formatEventDate(post.starts_at)}
            {post.location ? ` · ${post.location}` : ""}
          </p>
        )}
        <p className="mt-4 whitespace-pre-wrap text-lg leading-relaxed">
          {post.body}
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <Button
            variant="outline"
            size="lg"
            onClick={toggleLike}
            className="h-12 gap-2"
          >
            <Heart
              className={`h-5 w-5 ${post.liked_by_me ? "fill-[#5B9BD5] text-[#5B9BD5]" : ""}`}
            />
            {post.like_count ?? 0} synes godt om
          </Button>
          {post.author?.id && post.author.id !== currentUserId && (
            <Link
              href={`/beskeder?user=${post.author.id}`}
              className="inline-flex h-12 items-center justify-center rounded-lg border px-4 text-sm font-medium hover:bg-muted"
            >
              Skriv til forfatter
            </Link>
          )}
        </div>
      </article>

      <section className="space-y-4">
        <h2 className="font-serif text-xl">
          Kommentarer ({comments.length})
        </h2>
        {comments.map((c) => (
          <div key={c.id} className="flex gap-3 rounded-lg bg-card p-4 shadow-sm">
            <UserAvatar profile={c.author} />
            <div>
              <p className="text-sm font-medium">
                {c.author?.full_name}{" "}
                <span className="font-normal text-muted-foreground">
                  · {formatRelative(c.created_at)}
                </span>
              </p>
              <p className="mt-1 whitespace-pre-wrap">{c.body}</p>
            </div>
          </div>
        ))}
        <form onSubmit={submitComment} className="space-y-3">
          <Textarea
            value={commentBody}
            onChange={(e) => setCommentBody(e.target.value)}
            placeholder="Skriv en kommentar..."
            rows={3}
            className="text-base"
          />
          <Button
            type="submit"
            disabled={loading}
            className="h-12 w-full sm:w-auto bg-[#5B9BD5]"
          >
            {loading ? "Sender..." : "Send kommentar"}
          </Button>
        </form>
      </section>
    </div>
  );
}
