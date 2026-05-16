"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PostCard } from "./post-card";
import { CreatePostDialog } from "./create-post-dialog";
import type { Post } from "@/lib/types";
import { Search } from "lucide-react";

export function FeedClient({
  initialPosts,
  isAdmin,
}: {
  initialPosts: Post[];
  isAdmin: boolean;
}) {
  const [search, setSearch] = useState("");
  const [posts, setPosts] = useState(initialPosts);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return posts;
    return posts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) || p.body.toLowerCase().includes(q)
    );
  }, [posts, search]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-serif text-2xl">Klub-feed</h1>
        <CreatePostDialog
          isAdmin={isAdmin}
          onCreated={(post) => setPosts((prev) => [post, ...prev])}
        />
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Søg i opslag..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-12 pl-10 text-base"
        />
      </div>
      {filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
          {search
            ? "Ingen opslag matcher din søgning."
            : "Ingen opslag endnu — opret det første!"}
        </p>
      ) : (
        <div className="space-y-4">
          {filtered.map((post) => (
            <PostCard key={post.id} post={post} isAdmin={isAdmin} />
          ))}
        </div>
      )}
    </div>
  );
}
