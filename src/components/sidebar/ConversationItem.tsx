"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Conversation } from "@/shared/types/chat";

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  isEditing: boolean;
  editingTitle: string;
  isSavingTitle: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onSaveTitle: (id: string, title: string) => void;
  onDelete: (id: string) => void;
  onTitleChange: (title: string) => void;
}

export function ConversationItem({
  conversation,
  isActive,
  isEditing,
  editingTitle,
  isSavingTitle,
  onSelect,
  onEdit,
  onSaveTitle,
  onDelete,
  onTitleChange,
}: ConversationItemProps) {
  const handleSave = () => {
    onSaveTitle(conversation.id, editingTitle);
  };

  return (
    <div
      className={`flex items-center gap-1 rounded px-1 py-1 cursor-pointer ${
        isActive ? "bg-muted font-medium" : "hover:bg-muted"
      }`}
    >
      {isEditing ? (
        <Input
          value={editingTitle}
          autoFocus
          className={
            isSavingTitle
              ? "bg-green-50 dark:bg-green-500/20 border-green-300 dark:border-green-500/50"
              : ""
          }
          onChange={(e) => onTitleChange(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
        />
      ) : (
        <button
          type="button"
          className="flex-1 truncate text-left hover:underline"
          onClick={onSelect}
        >
          {conversation.title}
        </button>
      )}

      <Button
        size="icon"
        variant="ghost"
        aria-label="Edit conversation title"
        onClick={onEdit}
      >
        <Edit2 className="w-4 h-4" />
      </Button>

      <Button
        size="icon"
        variant="ghost"
        aria-label="delete"
        className="text-destructive"
        onClick={() => onDelete(conversation.id)}
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
}
