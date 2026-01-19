"use client";

import { useEffect, useRef } from "react";
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";
import DOMPurify from "isomorphic-dompurify";
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
    // разделяем код и обычный текст по ```
    const parts = content.split(/```([\w]*)\n([\s\S]*?)```/g);

    return (
      <div>
        {parts.map((part, i) => {
          // Используем комбинацию индекса и хеша части для более стабильного key
          const partHash = part.length > 0 ? part.slice(0, 20).replace(/\s/g, '') : 'empty';
          const key = `part-${i}-${partHash}`;
          // part — это код или обычный текст
          if (i % 3 === 0) {
            // обычный текст
            return (
              <span
                key={key}
                dangerouslySetInnerHTML={{
                  __html: formatText(part),
                }}
              />
            );
          } else if (i % 3 === 2) {
            // код
            const lang = parts[i - 1] || "plaintext";
            const highlightedHtml = Prism.highlight(
              part,
              Prism.languages[lang] || Prism.languages.plaintext,
              lang
            );
            // Санитизируем HTML от Prism перед использованием в dangerouslySetInnerHTML
            const sanitizedHtml = DOMPurify.sanitize(highlightedHtml, {
              ALLOWED_TAGS: ["span", "code"],
              ALLOWED_ATTR: ["class"],
            });
            return (
              <pre
                key={key}
                style={{
                  position: "relative",
                  background: "#2d2d2d",
                  color: "#fff",
                  padding: 8,
                  borderRadius: 4,
                  overflowX: "auto",
                }}
              >
                <code dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
                <button
                  className="copy-btn"
                  aria-label="Copy code to clipboard"
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

  // useEffect(() => {
  //   Prism.highlightAll();
  // }, [messages]);

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
      className="h-full overflow-y-auto flex flex-col gap-2 pr-5"
    >
      {messages.map((m, i) => (
        <div
          key={m.id}
          data-testid={m.role === "assistant" ? `assistant-${m.id}` : undefined}
          className={`${
            m.role === "user"
              ? "bg-muted dark:bg-secondary"
              : "bg-blue-50 dark:bg-card"
          }`}
          style={{
            padding: 8,
            borderRadius: 8,
            maxWidth: "80%",
            alignSelf: m.role === "user" ? "flex-end" : "flex-start",
            wordBreak: "break-word",
          }}
        >
          <strong className="dark:text-white dark:font-semibold">{m.role === "user" ? "User" : "Assistant"}</strong>
          <div className="dark:text-white/95" style={{ marginTop: 4 }}>{renderContent(m.content)}</div>

          {m.status === "error" && (
            <button
              onClick={() => onRetry(m.id, messages[i - 1]?.content ?? "")}
              className="mt-1 text-xs text-destructive hover:underline"
              aria-label="Retry sending message"
            >
              Retry
            </button>
          )}
          {m.status === "sending" && (
            <span className="text-xs text-muted-foreground mt-0.5" aria-live="polite">
              sending…
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
