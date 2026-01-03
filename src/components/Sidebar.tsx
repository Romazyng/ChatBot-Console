"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Conversation } from "@/shared/types/chat";
import { loadConversations, saveConversations } from "@/shared/lib/storage";
import { Edit2, Trash2, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { DialogDescription } from "@radix-ui/react-dialog";

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false); // для мобилок

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
      messages: [],
    };
    const next = [conv, ...conversations];
    saveAll(next);
    router.push(`/chat/${conv.id}`);
    setSidebarOpen(false); // закрываем sidebar при создании чата
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
    if (deleteId === activeId) router.push("/");
    setDeleteId(null);
  };

  const filtered = conversations.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {/* Кнопка гамбургер для мобилок */}
      {!sidebarOpen && (
        <Button
          variant="outline"
          className="md:hidden fixed top-4 left-4 z-50"
          onClick={() => setSidebarOpen(true)} // открываем sidebar
        >
          <Menu className="w-5 h-5" />
        </Button>
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:relative top-0 left-0 h-screen w-72 bg-white border-r p-4 gap-2 flex flex-col
          transform transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
          md:translate-x-0
          z-40
        `}
      >
        <h1 className="text-black text-2xl font-bold">ChatBot Console</h1>

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
                className={`flex items-center gap-1 rounded px-1 py-1 cursor-pointer ${
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
                    onClick={() => {
                      router.push(`/chat/${c.id}`);
                      setSidebarOpen(false); // закрываем sidebar при выборе чата
                    }}
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
                  <Edit2 className="w-4 h-4" />
                </Button>

                <Button
                  size="icon"
                  variant="ghost"
                  className="text-destructive"
                  onClick={() => setDeleteId(c.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            );
          })}
        </div>

        {/* Закрыть Sidebar кнопкой для мобилок */}
        <Button
          variant="outline"
          className="md:hidden mt-2"
          onClick={() => setSidebarOpen(false)}
        >
          Close
        </Button>

        <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogDescription className="sr-only">
                Description
              </DialogDescription>
              <DialogTitle>Delete conversation?</DialogTitle>
              <p id="delete-dialog-description">
                This action cannot be undone.
              </p>
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

      {/* Overlay для мобильного sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
}
