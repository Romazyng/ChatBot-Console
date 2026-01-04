"use client";

import { useState, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
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
import { useConversations } from "@/hooks/useConversations";

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const {
    conversations,
    createConversation: createConv,
    updateConversationTitle,
    deleteConversation: deleteConv,
  } = useConversations();

  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  const activeId = useMemo(
    () =>
      pathname?.startsWith("/chat/") ? pathname.replace("/chat/", "") : null,
    [pathname]
  );

  const createConversation = () => {
    const conv = createConv();
    router.push(`/chat/${conv.id}`);
    setSidebarOpen(false);
  };

  const saveTitle = (id: string) => {
    updateConversationTitle(id, editingTitle);
    setEditingId(null);
    setEditingTitle("");
  };

  const handleDeleteConversation = () => {
    if (!deleteId) return;
    deleteConv(deleteId);
    if (deleteId === activeId) router.push("/");
    setDeleteId(null);
  };

  const filtered = useMemo(
    () =>
      conversations.filter((c) =>
        c.title.toLowerCase().includes(search.toLowerCase())
      ),
    [conversations, search]
  );

  return (
    <>
      {!sidebarOpen && (
        <Button
          variant="outline"
          className="md:hidden fixed top-4 left-4 z-50"
          onClick={() => setSidebarOpen(true)} // открывает sidebar
        >
          <Menu className="w-5 h-5" />
        </Button>
      )}

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
                  name="edit"
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
                  aria-label="delete"
                  className="text-destructive"
                  onClick={() => setDeleteId(c.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            );
          })}
        </div>

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
              <DialogTitle>Delete conversation?</DialogTitle>
              <DialogDescription className="sr-only">
                description goes here This action cannot be undone.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter>
              <Button variant="destructive" onClick={handleDeleteConversation}>
                Delete
              </Button>
              <Button variant="outline" onClick={() => setDeleteId(null)}>
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
}
