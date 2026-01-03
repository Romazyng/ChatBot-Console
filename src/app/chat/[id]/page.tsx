"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Conversation } from "@/shared/types/chat";
import { loadConversations, saveConversations } from "@/shared/lib/storage";
import { Chat } from "@/shared/ui/Chat";

export default function ChatPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [conversation, setConversation] = useState<Conversation | null>(null);

  // Загружаем conversation только один раз
  useEffect(() => {
    const all = loadConversations();
    const found = all.find((c) => c.id === id);

    if (!found) {
      router.replace("/"); // если чат не найден
      return;
    }

    setConversation(found);
  }, [id, router]);

  // Функция для обновления conversation и сохранения в localStorage
  const updateConversation = (updated: Conversation) => {
    setConversation(updated); // <-- обновляем state локально
    const all = loadConversations().map((c) =>
      c.id === updated.id ? updated : c
    );
    saveConversations(all); // <-- синхронизация с localStorage
  };

  if (!conversation) return null;

  return (
    <div className="flex-1 flex flex-col p-4">
      <Chat
        conversation={conversation}
        onUpdateConversation={updateConversation}
      />
    </div>
  );
}
