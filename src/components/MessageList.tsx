"use client";

import { useEffect, useRef } from "react";
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";
import { Message } from "@/shared/types/chat";
import { formatText } from "@/shared/lib/formatText";

export function MessageList({
  messages,
  onRetry,
}: {
  messages: Message[];
  onRetry: (id: string, text: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  const renderContent = (content: string) => {
    // разделяем код и обычный текст по ``` (если нужно)
    const parts = content.split(/```([\w]*)\n([\s\S]*?)```/g);

    return (
      <div>
        {parts.map((part, i) => {
          // part — это код или обычный текст
          if (i % 3 === 0) {
            // обычный текст
            return (
              <span
                key={i}
                dangerouslySetInnerHTML={{
                  __html: formatText(part),
                }}
              />
            );
          } else if (i % 3 === 2) {
            // код
            const lang = parts[i - 1] || "plaintext";
            const html = Prism.highlight(
              part,
              Prism.languages[lang] || Prism.languages.plaintext,
              lang
            );
            return (
              <pre
                key={i}
                style={{
                  position: "relative",
                  background: "#2d2d2d",
                  color: "#fff",
                  padding: 8,
                  borderRadius: 4,
                  overflowX: "auto",
                }}
              >
                <code dangerouslySetInnerHTML={{ __html: html }} />
                <button
                  className="copy-btn"
                  style={{
                    position: "absolute",
                    top: 4,
                    right: 4,
                    fontSize: 12,
                    padding: "2px 6px",
                    cursor: "pointer",
                  }}
                >
                  Copy
                </button>
              </pre>
            );
          }
        })}
      </div>
    );
  };

  // скролл вниз
  useEffect(() => {
    containerRef.current?.scrollTo({
      top: containerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  // переподсветка prism
  useEffect(() => {
    Prism.highlightAll();
  }, [messages]);

  // copy button
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.classList.contains("copy-btn")) return;
      const codeEl = target.previousElementSibling as HTMLElement;
      if (!codeEl) return;

      navigator.clipboard.writeText(codeEl.innerText).then(() => {
        const oldText = target.innerText;
        target.innerText = "Copied ✓";
        setTimeout(() => (target.innerText = oldText), 1500);
      });
    };

    container.addEventListener("click", handleClick);
    return () => container.removeEventListener("click", handleClick);
  }, [messages]);

  return (
    <div
      ref={containerRef}
      className="max-h-[85vh] overflow-y-auto flex flex-col gap-2 pr-5"
    >
      {messages.map((m, i) => (
        <div
          key={m.id}
          data-testid={m.role === "Assistant" ? `assistant-${m.id}` : undefined}
          style={{
            background: m.role === "User" ? "#eee" : "#f6f6ff",
            padding: 8,
            borderRadius: 8,
            maxWidth: "80%",
            alignSelf: m.role === "User" ? "flex-end" : "flex-start",
            wordBreak: "break-word",
          }}
        >
          <strong>{m.role}</strong>
          <div style={{ marginTop: 4 }}>{renderContent(m.content)}</div>

          {m.status === "error" && (
            <button
              onClick={() => onRetry(m.id, messages[i - 1]?.content ?? "")}
              style={{ marginTop: 4, fontSize: 12, cursor: "pointer" }}
            >
              Retry
            </button>
          )}
          {m.status === "sending" && (
            <span style={{ fontSize: 12, color: "#666", marginTop: 2 }}>
              sending…
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
