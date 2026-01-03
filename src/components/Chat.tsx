"use client";

import { useState, useEffect } from "react";
import { Message, Conversation } from "@/shared/types/chat";
import { MessageList } from "@/components/MessageList";
import { Composer } from "@/components/Composer";

export function Chat({
  conversation,
  onUpdateConversation,
}: {
  conversation: Conversation;
  onUpdateConversation: (updated: Conversation) => void;
}) {
  const [messages, setMessages] = useState<Message[]>(conversation.messages);
  const [isSending, setIsSending] = useState(false);
  const [streamingController, setStreamingController] =
    useState<AbortController | null>(null);

  // ⚡ Синхронизация локальных сообщений с conversation при смене чата
  useEffect(() => {
    setMessages(conversation.messages);
  }, [conversation.id]);

  // ⚡ Синхронизация глобального conversation после изменения messages
  useEffect(() => {
    onUpdateConversation({ ...conversation, messages });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  const updateMessages = (updater: (prev: Message[]) => Message[]) => {
    setMessages((prev) => updater(prev)); // только локальный state
  };

  const sendMessage = async (text: string) => {
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "User",
      content: text,
    };

    const assistantMessage: Message = {
      id: crypto.randomUUID(),
      role: "Assistant",
      content: "",
      status: "sending",
    };

    updateMessages((prev) => [...prev, userMessage, assistantMessage]);
    setIsSending(true);

    const controller = new AbortController();
    setStreamingController(controller);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
        signal: controller.signal,
      });

      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value);
          updateMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessage.id
                ? { ...msg, content: msg.content + chunk }
                : msg
            )
          );
        }
      }

      updateMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessage.id ? { ...msg, status: undefined } : msg
        )
      );
    } catch (e: any) {
      updateMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessage.id
            ? { ...msg, status: e.name === "AbortError" ? "stopped" : "error" }
            : msg
        )
      );
    } finally {
      setIsSending(false);
      setStreamingController(null);
    }
  };

  const retry = (id: string, originalText: string) => {
    updateMessages((prev) => prev.filter((msg) => msg.id !== id));
    sendMessage(originalText);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        <MessageList messages={messages} onRetry={retry} />
      </div>

      <div className="mt-auto">
        <Composer
          onSend={async (text) => await sendMessage(text)}
          disabled={isSending}
          isStreaming={!!streamingController}
          onStop={() => streamingController?.abort()}
        />
      </div>
    </div>
  );
}
