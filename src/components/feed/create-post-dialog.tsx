"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import type { Post } from "@/lib/types";

export function CreatePostDialog({
  isAdmin,
  onCreated,
}: {
  isAdmin: boolean;
  onCreated: (post: Post) => void;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [location, setLocation] = useState("");
  const [isPinned, setIsPinned] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("posts")
      .insert({
        title,
        body,
        starts_at: startsAt || null,
        location: location || null,
        author_id: user!.id,
        is_pinned: isAdmin && isPinned,
      })
      .select(`*, author:profiles!author_id(id, full_name, avatar_url)`)
      .single();

    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    const post = {
      ...data,
      author: Array.isArray(data.author) ? data.author[0] : data.author,
      like_count: 0,
      comment_count: 0,
      liked_by_me: false,
    } as Post;

    onCreated(post);
    setOpen(false);
    setTitle("");
    setBody("");
    setStartsAt("");
    setLocation("");
    setIsPinned(false);
    toast.success("Opslag oprettet");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className={cn(
          buttonVariants(),
          "h-12 gap-2 bg-[#5B9BD5] text-white hover:bg-[#4a8ac4]"
        )}
      >
        <Plus className="h-5 w-5" />
        Nyt opslag
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif">Opret opslag</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titel</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="h-12"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="body">Beskrivelse</Label>
            <Textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
              rows={4}
              className="text-base"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="starts">Dato og tid (valgfri)</Label>
              <Input
                id="starts"
                type="datetime-local"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                className="h-12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="loc">Sted (valgfri)</Label>
              <Input
                id="loc"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="VBK bane"
                className="h-12"
              />
            </div>
          </div>
          {isAdmin && (
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
              />
              Fastgør øverst i feedet
            </label>
          )}
          <Button
            type="submit"
            disabled={loading}
            className="h-12 w-full bg-[#5B9BD5]"
          >
            {loading ? "Opretter..." : "Publicer"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
