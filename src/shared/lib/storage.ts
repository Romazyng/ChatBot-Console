import { Conversation } from "@/shared/types/chat";

const KEY = "chatbot_conversations";

export const loadConversations = (): Conversation[] => {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
};

export const saveConversations = (conversations: Conversation[]) => {
  localStorage.setItem(KEY, JSON.stringify(conversations));
};
