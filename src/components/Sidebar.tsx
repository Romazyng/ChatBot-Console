"use client";

import { useState, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useConversations } from "@/hooks/useConversations";
import { SidebarHeader } from "./sidebar/SidebarHeader";
import { NewChatButton } from "./sidebar/NewChatButton";
import { SearchBar } from "./sidebar/SearchBar";
import { ConversationList } from "./sidebar/ConversationList";
import { DeleteDialog } from "./sidebar/DeleteDialog";
import { SidebarToggle } from "./sidebar/SidebarToggle";

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
  const [isSavingTitle, setIsSavingTitle] = useState(false);

  const activeId = useMemo(
    () =>
      pathname?.startsWith("/chat/") ? pathname.replace("/chat/", "") : null,
    [pathname]
  );

  const filtered = useMemo(
    () =>
      conversations.filter((c) =>
        c.title.toLowerCase().includes(search.toLowerCase())
      ),
    [conversations, search]
  );

  const createConversation = () => {
    const conv = createConv();
    router.push(`/chat/${conv.id}`);
    setSidebarOpen(false);
  };

  const saveTitle = (id: string, title: string) => {
    setIsSavingTitle(true);
    updateConversationTitle(id, title);
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

  const handleSelectConversation = (id: string) => {
    router.push(`/chat/${id}`);
    setSidebarOpen(false);
  };

  const handleEditConversation = (id: string, title: string) => {
    setEditingId(id);
    setEditingTitle(title);
  };

  return (
    <>
      {!sidebarOpen && <SidebarToggle onClick={() => setSidebarOpen(true)} />}

      <aside
        className={`
          fixed md:relative top-0 left-0 h-screen w-72 bg-white dark:bg-sidebar border-r p-4 gap-2 flex flex-col
          transform transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
          md:translate-x-0
          z-40
        `}
      >
        <SidebarHeader />

        <NewChatButton
          onCreateConversation={createConversation}
          conversations={conversations}
        />

        <SearchBar value={search} onChange={setSearch} />

        <ConversationList
          conversations={filtered}
          activeId={activeId}
          editingId={editingId}
          editingTitle={editingTitle}
          isSavingTitle={isSavingTitle}
          onSelectConversation={handleSelectConversation}
          onEditConversation={handleEditConversation}
          onSaveTitle={saveTitle}
          onDeleteConversation={setDeleteId}
          onTitleChange={setEditingTitle}
        />

        <Button
          variant="outline"
          className="md:hidden mt-2"
          onClick={() => setSidebarOpen(false)}
        >
          Close
        </Button>

        <DeleteDialog
          open={!!deleteId}
          onClose={() => setDeleteId(null)}
          onConfirm={handleDeleteConversation}
        />
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
