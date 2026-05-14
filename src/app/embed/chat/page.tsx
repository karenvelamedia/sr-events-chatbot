import { ChatWidget } from "@/components/chat-widget";

export default function EmbedChatPage() {
  return (
    <main className="flex h-dvh flex-col bg-white p-3">
      <ChatWidget className="flex-1" />
    </main>
  );
}
