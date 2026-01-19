"use client";

import { Conversation } from "@/shared/types/chat";
import { ConversationItem } from "./ConversationItem";

interface ConversationListProps {
  conversations: Conversation[];
  activeId: string | null;
  editingId: string | null;
  editingTitle: string;
  isSavingTitle: boolean;
  onSelectConversation: (id: string) => void;
  onEditConversation: (id: string, title: string) => void;
  onSaveTitle: (id: string, title: string) => void;
  onDeleteConversation: (id: string) => void;
  onTitleChange: (title: string) => void;
}

export function ConversationList({
  conversations,
  activeId,
  editingId,
  editingTitle,
  isSavingTitle,
  onSelectConversation,
  onEditConversation,
  onSaveTitle,
  onDeleteConversation,
  onTitleChange,
}: ConversationListProps) {
  return (
    <div className="flex-1 overflow-y-auto space-y-1">
      {conversations.map((conversation) => (
        <ConversationItem
          key={conversation.id}
          conversation={conversation}
          isActive={conversation.id === activeId}
          isEditing={conversation.id === editingId}
          editingTitle={editingTitle}
          isSavingTitle={isSavingTitle}
          onSelect={() => onSelectConversation(conversation.id)}
          onEdit={() => onEditConversation(conversation.id, conversation.title)}
          onSaveTitle={onSaveTitle}
          onDelete={onDeleteConversation}
          onTitleChange={onTitleChange}
        />
      ))}
    </div>
  );
}
