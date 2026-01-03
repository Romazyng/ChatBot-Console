"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Conversation } from "@/shared/types/chat";
import { loadConversations, saveConversations } from "@/shared/lib/storage";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    setConversations(loadConversations());
  }, []);

  const activeId = pathname?.startsWith("/chat/")
    ? pathname.replace("/chat/", "")
    : null;

  const saveAll = (next: Conversation[]) => {
    setConversations(next);
    saveConversations(next);
  };

  const createConversation = () => {
    const conv: Conversation = {
      id: crypto.randomUUID(),
      title: "New Chat",
      messages: [], // своя история
    };

    const next = [conv, ...conversations];
    saveAll(next);
    router.push(`/chat/${conv.id}`);
  };

  const saveTitle = (id: string) => {
    saveAll(
      conversations.map((c) =>
        c.id === id ? { ...c, title: editingTitle } : c
      )
    );
    setEditingId(null);
    setEditingTitle("");
  };

  const deleteConversation = () => {
    if (!deleteId) return;

    saveAll(conversations.filter((c) => c.id !== deleteId));

    if (deleteId === activeId) {
      router.push("/");
    }

    setDeleteId(null);
  };

  const filtered = conversations.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <aside className="w-72 border-r h-screen flex flex-col p-4">
      <Button
        variant="outline"
        className="mb-3 w-full"
        onClick={createConversation}
      >
        + New Chat
      </Button>

      <Input
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-3"
      />

      <div className="flex-1 overflow-y-auto space-y-1">
        {filtered.map((c) => {
          const isActive = c.id === activeId;

          return (
            <div
              key={c.id}
              className={`flex items-center gap-2 rounded px-2 py-1 cursor-pointer ${
                isActive ? "bg-muted font-medium" : "hover:bg-muted"
              }`}
            >
              {editingId === c.id ? (
                <Input
                  value={editingTitle}
                  autoFocus
                  onChange={(e) => setEditingTitle(e.target.value)}
                  onBlur={() => saveTitle(c.id)}
                  onKeyDown={(e) => e.key === "Enter" && saveTitle(c.id)}
                />
              ) : (
                <span
                  className="flex-1 truncate"
                  onClick={() => router.push(`/chat/${c.id}`)}
                >
                  {c.title}
                </span>
              )}

              <Button
                size="icon"
                variant="ghost"
                onClick={() => {
                  setEditingId(c.id);
                  setEditingTitle(c.title);
                }}
              >
                ✏️
              </Button>

              <Button
                size="icon"
                variant="ghost"
                className="text-destructive"
                onClick={() => setDeleteId(c.id)}
              >
                🗑
              </Button>
            </div>
          );
        })}
      </div>

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete conversation?</DialogTitle>
          </DialogHeader>
          <DialogFooter>
            <Button variant="destructive" onClick={deleteConversation}>
              Delete
            </Button>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </aside>
  );
}
