"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Conversation } from "@/shared/types/chat";

interface NewChatButtonProps {
  onCreateConversation: () => void;
  conversations: Conversation[];
}

export function NewChatButton({
  onCreateConversation,
  conversations,
}: NewChatButtonProps) {
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    const hintDismissed = localStorage.getItem("newChatHintDismissed");
    if (!hintDismissed && conversations.length === 0) {
      setShowHint(true);
    } else if (conversations.length > 0) {
      setShowHint(false);
    }
  }, [conversations.length]);

  const dismissHint = () => {
    setShowHint(false);
    localStorage.setItem("newChatHintDismissed", "true");
  };

  return (
    <div className="relative mb-3">
      <Button
        variant="outline"
        className="w-full"
        onClick={onCreateConversation}
      >
        + New Chat
      </Button>
      {showHint && (
        <div className="absolute left-full ml-2 top-0 bg-popover dark:bg-card border border-border rounded-md p-3 shadow-lg w-[220px] z-50 hidden md:block">
          <button
            onClick={dismissHint}
            className="absolute top-1 right-1 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close hint"
          >
            <X className="h-3 w-3" />
          </button>
          <p className="text-sm text-foreground pr-4">
            Нажмите на эту кнопку, чтобы создать новый чат
          </p>
        </div>
      )}
    </div>
  );
}
