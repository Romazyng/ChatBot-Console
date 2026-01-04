import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Conversation } from "@/shared/types/chat";
import { loadConversations, saveConversations } from "@/shared/lib/storage";

export function useConversation(id: string | null) {
  const router = useRouter();
  const [conversation, setConversation] = useState<Conversation | null>(null);

  useEffect(() => {
    if (!id) {
      setConversation(null);
      return;
    }

    const all = loadConversations();
    const found = all.find((c) => c.id === id);

    if (!found) {
      router.replace("/");
      return;
    }

    setConversation(found);
  }, [id, router]);

  const updateConversation = useCallback((updated: Conversation) => {
    setConversation(updated);
    const all = loadConversations().map((c) =>
      c.id === updated.id ? updated : c
    );
    saveConversations(all);
  }, []);

  return {
    conversation,
    updateConversation,
  };
}
