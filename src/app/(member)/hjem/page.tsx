import { requireApprovedMember } from "@/lib/auth";
import { FeedPanel } from "@/components/feed/feed-panel";
import { ChatPreview } from "@/components/chat/chat-preview";

export default async function HjemPage() {
  await requireApprovedMember();

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <aside className="hidden lg:block">
        <ChatPreview />
      </aside>
      <FeedPanel />
    </div>
  );
}
