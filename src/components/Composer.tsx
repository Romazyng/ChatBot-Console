"use client";

import { useState, useRef, useEffect } from "react";

export function Composer({
  onSend,
  disabled,
  onStop, // необязательная функция для Stop при streaming
  isStreaming = false, // состояние потока
}: {
  onSend: (text: string) => void;
  disabled: boolean;
  onStop?: () => void;
  isStreaming?: boolean;
}) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Возврат фокуса после отправки
  useEffect(() => {
    if (!disabled && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [disabled]);

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setValue("");
  };

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <textarea
        ref={textareaRef}
        value={value}
        disabled={disabled || isStreaming}
        rows={3}
        style={{
          width: "100%",
          resize: "vertical",
          paddingRight: isStreaming ? 60 : 8,
          paddingLeft: 8,
          paddingTop: 8,
          border: "1px solid #ccc",
          borderRadius: 4,
          fontSize: 14,
        }}
        placeholder="Ask anything..."
        aria-label="Message composer"
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            submit();
          }
        }}
      />
      {/* Визуальный индикатор и кнопка Stop */}
      {isStreaming && (
        <button
          type="button"
          onClick={onStop}
          style={{
            position: "absolute",
            right: 8,
            top: 8,
            padding: "4px 8px",
            cursor: "pointer",
            background: "#f00",
            color: "#fff",
            border: "none",
            borderRadius: 4,
          }}
          aria-label="Stop streaming"
        >
          Stop
        </button>
      )}
      {/* Индикатор отправки */}
      {disabled && !isStreaming && (
        <span
          style={{
            position: "absolute",
            right: 8,
            top: 8,
            fontSize: 12,
            color: "#666",
          }}
        >
          sending…
        </span>
      )}
    </div>
  );
}
