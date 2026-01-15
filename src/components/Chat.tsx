"use client";

import { useCallback } from "react";
import { Conversation } from "@/shared/types/chat";
import { MessageList } from "@/components/MessageList";
import { Composer } from "@/components/Composer";
import { useChat } from "@/hooks/useChat";

export function Chat({
  conversation,
  onUpdateConversation,
}: {
  conversation: Conversation;
  onUpdateConversation: (updated: Conversation) => void;
}) {
  const handleMessagesChange = useCallback(
    (messages: Conversation["messages"]) => {
      onUpdateConversation({
        id: conversation.id,
        title: conversation.title,
        messages,
      });
    },
    [conversation.id, conversation.title, onUpdateConversation]
  );

  const {
    messages,
    isSending,
    isStreaming,
    sendMessage,
    retry,
    stopStreaming,
  } = useChat({
    initialMessages: conversation.messages,
    onMessagesChange: handleMessagesChange,
  });

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex-1 min-h-0 overflow-hidden">
        <MessageList messages={messages} onRetry={retry} />
      </div>

      <div className="shrink-0 pt-4 pb-2">
        <Composer
          onSend={sendMessage}
          disabled={isSending}
          isStreaming={isStreaming}
          onStop={stopStreaming}
        />
      </div>
    </div>
  );
}
