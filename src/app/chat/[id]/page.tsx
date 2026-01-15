"use client";

import { useParams } from "next/navigation";
import { Chat } from "@/components/Chat";
import { useConversation } from "@/hooks/useConversation";

export default function ChatPage() {
  const { id } = useParams<{ id: string }>();
  const { conversation, updateConversation } = useConversation(id as string);

  if (!conversation) return null;

  return (
    <div className="flex-1 flex flex-col min-h-0 p-4">
      <Chat conversation={conversation} onUpdateConversation={updateConversation} />
    </div>
  );
}
