import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/ui/user-avatar";
import { formatRelative, formatEventDate } from "@/lib/utils/date";
import type { Post } from "@/lib/types";
import { Heart, MessageCircle, Pin } from "lucide-react";

export function PostCard({ post }: { post: Post; isAdmin?: boolean }) {
  const preview =
    post.body.length > 160 ? post.body.slice(0, 160) + "…" : post.body;

  return (
    <Card className="overflow-hidden border-none shadow-md transition hover:shadow-lg">
      <CardHeader className="flex flex-row items-start gap-3 space-y-0 pb-2">
        <UserAvatar profile={post.author} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium">{post.author?.full_name}</span>
            <span className="text-sm text-muted-foreground">
              {formatRelative(post.created_at)}
            </span>
            {post.is_pinned && (
              <Badge variant="secondary" className="gap-1">
                <Pin className="h-3 w-3" /> Fastgjort
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <Link href={`/opslag/${post.id}`} className="block group">
          <h2 className="font-serif text-xl group-hover:text-[#5B9BD5]">
            {post.title}
          </h2>
          {post.starts_at && (
            <p className="mt-1 text-sm font-medium text-[#5B9BD5]">
              {formatEventDate(post.starts_at)}
              {post.location ? ` · ${post.location}` : ""}
            </p>
          )}
          <p className="mt-2 text-muted-foreground whitespace-pre-wrap">
            {preview}
          </p>
          {post.body.length > 160 && (
            <span className="text-sm text-[#5B9BD5]">Læs mere</span>
          )}
        </Link>
        <div className="flex gap-4 pt-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Heart
              className={`h-4 w-4 ${post.liked_by_me ? "fill-[#5B9BD5] text-[#5B9BD5]" : ""}`}
            />
            {post.like_count ?? 0}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle className="h-4 w-4" />
            {post.comment_count ?? 0}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
