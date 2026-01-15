"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Edit2, Trash2, Menu, Sun, Moon, X } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
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
  const { theme, toggleTheme, mounted } = useTheme();

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
  const [isSavingTitle, setIsSavingTitle] = useState(false);
  const [showNewChatHint, setShowNewChatHint] = useState(false);

  // Проверяем, нужно ли показать подсказку
  useEffect(() => {
    const hintDismissed = localStorage.getItem("newChatHintDismissed");
    if (!hintDismissed && conversations.length === 0) {
      setShowNewChatHint(true);
    } else if (conversations.length > 0) {
      // Скрываем подсказку, если появились чаты
      setShowNewChatHint(false);
    }
  }, [conversations.length]);

  const dismissHint = () => {
    setShowNewChatHint(false);
    localStorage.setItem("newChatHintDismissed", "true");
  };

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
    setIsSavingTitle(true);
    updateConversationTitle(id, editingTitle);
    setTimeout(() => {
      setEditingId(null);
      setEditingTitle("");
      setIsSavingTitle(false);
    }, 300);
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
          fixed md:relative top-0 left-0 h-screen w-72 bg-white dark:bg-sidebar border-r p-4 gap-2 flex flex-col
          transform transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
          md:translate-x-0
          z-40
        `}
      >
        <div className="flex items-center justify-between">
          <h1 className="text-black dark:text-sidebar-foreground text-2xl font-bold">ChatBot Console</h1>
          {mounted && (
            <Button
              size="icon"
              variant="ghost"
              onClick={toggleTheme}
              aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
              className="h-9 w-9"
            >
              {theme === "light" ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </Button>
          )}
        </div>

        <div className="relative mb-3">
          <Button
            variant="outline"
            className="w-full"
            onClick={createConversation}
          >
            + New Chat
          </Button>
          {showNewChatHint && (
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
                    className={
                      isSavingTitle
                        ? "bg-green-50 dark:bg-green-500/20 border-green-300 dark:border-green-500/50"
                        : ""
                    }
                    onChange={(e) => setEditingTitle(e.target.value)}
                    onBlur={() => saveTitle(c.id)}
                    onKeyDown={(e) => e.key === "Enter" && saveTitle(c.id)}
                  />
                ) : (
                  <button
                    type="button"
                    className="flex-1 truncate text-left hover:underline"
                    onClick={() => {
                      router.push(`/chat/${c.id}`);
                      setSidebarOpen(false); // закрываем sidebar при выборе чата
                    }}
                  >
                    {c.title}
                  </button>
                )}

                <Button
                  size="icon"
                  variant="ghost"
                  aria-label="Edit conversation title"
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
              <DialogDescription>
                This action cannot be undone. The conversation and all its messages will be permanently deleted.
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
