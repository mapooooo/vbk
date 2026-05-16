"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserAvatar } from "@/components/ui/user-avatar";
import { formatRelative } from "@/lib/utils/date";
import type { Message, ProfilePreview } from "@/lib/types";
import { ArrowLeft, Send } from "lucide-react";

export function ChatWindow({
  conversationId,
  otherUser,
  initialMessages,
  currentUserId,
}: {
  conversationId: string;
  otherUser: ProfilePreview;
  initialMessages: Message[];
  currentUserId: string;
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [body, setBody] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const msg = payload.new as Message;
          setMessages((prev) => {
            if (prev.some((m) => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, supabase]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;

    const text = body.trim();
    setBody("");

    const { data, error } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        sender_id: currentUserId,
        body: text,
      })
      .select()
      .single();

    if (!error && data) {
      setMessages((prev) => {
        if (prev.some((m) => m.id === data.id)) return prev;
        return [...prev, data];
      });
    }
  }

  return (
    <div className="flex h-[calc(100dvh-8rem)] flex-col md:h-[calc(100dvh-6rem)]">
      <div className="flex items-center gap-3 border-b pb-4">
        <Link href="/beskeder" className="text-[#5B9BD5]">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <UserAvatar profile={otherUser} />
        <h1 className="font-serif text-xl">{otherUser.full_name}</h1>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto py-4">
        {messages.map((m) => {
          const mine = m.sender_id === currentUserId;
          return (
            <div
              key={m.id}
              className={`flex ${mine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  mine
                    ? "bg-[#5B9BD5] text-white"
                    : "bg-muted text-foreground"
                }`}
              >
                <p className="whitespace-pre-wrap">{m.body}</p>
                <p
                  className={`mt-1 text-xs ${mine ? "text-white/70" : "text-muted-foreground"}`}
                >
                  {formatRelative(m.created_at)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={send} className="flex gap-2 border-t pt-4">
        <Input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Skriv en besked..."
          className="h-12 flex-1 text-base"
        />
        <Button type="submit" size="icon" className="h-12 w-12 bg-[#5B9BD5]">
          <Send className="h-5 w-5" />
        </Button>
      </form>
    </div>
  );
}
