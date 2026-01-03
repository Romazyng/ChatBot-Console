"use client";

import { useState, useRef, useEffect } from "react";
import {
  InputGroup,
  InputGroupTextarea,
  InputGroupAddon,
  InputGroupText,
} from "@/components/ui/input-group";

export function Composer({
  onSend,
  disabled,
  onStop,
  isStreaming = false,
}: {
  onSend: (text: string) => void;
  disabled: boolean;
  onStop?: () => void;
  isStreaming?: boolean;
}) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // возврат фокуса после отправки
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
    <div className="w-full mx-auto">
      <InputGroup>
        <InputGroupTextarea
          ref={textareaRef}
          value={value}
          placeholder="Enter your message"
          disabled={disabled || isStreaming}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
        />

        <InputGroupAddon align="block-end">
          {isStreaming ? (
            <InputGroupText className="text-red-500 cursor-pointer" onClick={onStop}>
              Stop
            </InputGroupText>
          ) : disabled ? (
            <InputGroupText className="text-muted-foreground text-xs">sending…</InputGroupText>
          ) : (
            <InputGroupText className="text-muted-foreground text-xs">
              {1200 - value.length} characters left
            </InputGroupText>
          )}
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
}
