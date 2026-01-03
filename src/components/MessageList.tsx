"use client";

import { useEffect, useRef } from "react";
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";
import { Message } from "@/shared/types/chat";
import { marked } from "marked";

export function MessageList({
  messages,
  onRetry,
}: {
  messages: Message[];
  onRetry: (id: string, text: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Скролл вниз при новых сообщениях
  useEffect(() => {
    containerRef.current?.scrollTo({
      top: containerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  // Переподсветка Prism после рендера
  useEffect(() => {
    Prism.highlightAll();
  }, [messages]);

  // ⚡ Конвертация Markdown в HTML с подсветкой кода
  const contentToHtml = (markdown: string) => {
    // создаем кастомный renderer
    const renderer = new marked.Renderer();

    renderer.code = ({
      text,
      lang,
    }: {
      text: string;
      lang?: string | null;
    }) => {
      const language = lang || "plaintext";
      const html = Prism.highlight(
        text,
        Prism.languages[language] || Prism.languages.plaintext,
        language
      );

      return `
        <pre class="language-${language}" style="position: relative; background:#2d2d2d; color:#fff; padding:8px; border-radius:4px; overflow-x:auto;">
          <code>${html}</code>
          <button class="copy-btn" style="position:absolute; top:4px; right:4px; font-size:12px; padding:2px 6px; cursor:pointer;">Copy</button>
        </pre>
      `;
    };

    marked.setOptions({
      breaks: true, // переносы строк
    });

    return marked.parse(markdown, { renderer });
  };

  const renderContent = (content: string) => {
    return <div dangerouslySetInnerHTML={{ __html: contentToHtml(content) }} />;
  };

  // Обработка клика по кнопке Copy
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
        setTimeout(() => {
          target.innerText = oldText;
        }, 1500);
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
