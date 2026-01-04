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
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        <MessageList messages={messages} onRetry={retry} />
      </div>

      <div className="mt-auto">
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
