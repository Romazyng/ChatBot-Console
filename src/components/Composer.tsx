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
    if (!trimmed || trimmed.length > 1200) return;
    onSend(trimmed);
    setValue("");
  };

  return (
    <div className="w-full mx-auto max-w-full">
      <InputGroup className="max-w-full">
        <InputGroupTextarea
          ref={textareaRef}
          value={value}
          placeholder="Enter your message"
          disabled={disabled || isStreaming || value.length > 1200}
          onChange={(e) => {
            if (e.target.value.length <= 1200) {
              setValue(e.target.value);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          style={{ wordWrap: "break-word", overflowWrap: "break-word" }}
        />

        <InputGroupAddon align="block-end">
          {isStreaming ? (
            <InputGroupText
              className="text-red-500 cursor-pointer"
              onClick={onStop}
            >
              Stop
            </InputGroupText>
          ) : disabled ? (
            <InputGroupText className="text-muted-foreground text-xs">
              sending…
            </InputGroupText>
          ) : (
            <InputGroupText
              className={`text-xs ${
                value.length > 1200
                  ? "text-red-500 font-semibold"
                  : value.length > 1000
                  ? "text-orange-500"
                  : "text-muted-foreground"
              }`}
            >
              {value.length > 1200
                ? `${value.length - 1200} characters over limit`
                : `${1200 - value.length} characters left`}
            </InputGroupText>
          )}
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
}
