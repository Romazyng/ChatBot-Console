import { useState, useEffect, useCallback } from "react";
import { Conversation } from "@/shared/types/chat";
import { loadConversations, saveConversations } from "@/shared/lib/storage";

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    setConversations(loadConversations());
  }, []);

  const updateConversations = useCallback((updated: Conversation[]) => {
    setConversations(updated);
    saveConversations(updated);
  }, []);

  const createConversation = useCallback((): Conversation => {
    const conv: Conversation = {
      id: crypto.randomUUID(),
      title: "New Chat",
      messages: [],
    };
    const updated = [conv, ...conversations];
    updateConversations(updated);
    return conv;
  }, [conversations, updateConversations]);

  const updateConversation = useCallback(
    (updated: Conversation) => {
      updateConversations(
        conversations.map((c) => (c.id === updated.id ? updated : c))
      );
    },
    [conversations, updateConversations]
  );

  const deleteConversation = useCallback(
    (id: string) => {
      updateConversations(conversations.filter((c) => c.id !== id));
    },
    [conversations, updateConversations]
  );

  const updateConversationTitle = useCallback(
    (id: string, title: string) => {
      updateConversations(
        conversations.map((c) => (c.id === id ? { ...c, title } : c))
      );
    },
    [conversations, updateConversations]
  );

  return {
    conversations,
    createConversation,
    updateConversation,
    deleteConversation,
    updateConversationTitle,
  };
}
