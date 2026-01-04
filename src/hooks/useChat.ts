import { useState, useEffect, useCallback, useRef } from "react";
import { Message } from "@/shared/types/chat";

interface UseChatOptions {
  initialMessages: Message[];
  onMessagesChange: (messages: Message[]) => void;
}

export function useChat({ initialMessages, onMessagesChange }: UseChatOptions) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isSending, setIsSending] = useState(false);
  const [streamingController, setStreamingController] =
    useState<AbortController | null>(null);
  const messagesRef = useRef(messages);
  const onMessagesChangeRef = useRef(onMessagesChange);

  // обновляем ref для callback
  useEffect(() => {
    onMessagesChangeRef.current = onMessagesChange;
  }, [onMessagesChange]);

  // синхронизация с initialMessages при смене чата
  useEffect(() => {
    skipNextCallbackRef.current = true; // пропускаем callback при синхронизации
    setMessages(initialMessages);
    messagesRef.current = initialMessages;
  }, [initialMessages]);

  // обновляем ref при изменении messages
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // отслеживаем состояние streaming
  const isStreamingRef = useRef(false);
  const skipNextCallbackRef = useRef(false);

  // вызываем callback после обновления messages, но не во время streaming для каждого chunk
  useEffect(() => {
    if (skipNextCallbackRef.current) {
      skipNextCallbackRef.current = false;
      return;
    }
    if (!isStreamingRef.current) {
      onMessagesChangeRef.current(messages);
    }
  }, [messages]);

  const sendMessage = useCallback(async (text: string) => {
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "User",
      content: text,
    };

    const assistantMessage: Message = {
      id: crypto.randomUUID(),
      role: "Assistant",
      content: "",
      status: "sending",
    };

    setIsSending(true);

    // устанавливаем флаг streaming перед setMessages, чтобы useEffect не вызывал callback
    isStreamingRef.current = true;

    setMessages((prev) => {
      const updated = [...prev, userMessage, assistantMessage];
      messagesRef.current = updated;
      return updated;
    });

    const controller = new AbortController();
    setStreamingController(controller);

    try {
      // используем ref для получения актуальных messages
      const currentMessages = messagesRef.current;
      const messagesToSend = [...currentMessages, userMessage].map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: messagesToSend }),
        signal: controller.signal,
      });

      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value);
          setMessages((prev) => {
            const updated = prev.map((msg) =>
              msg.id === assistantMessage.id
                ? { ...msg, content: msg.content + chunk }
                : msg
            );
            messagesRef.current = updated;
            // не вызываем onMessagesChange при каждом chunk - только при завершении
            return updated;
          });
        }
      }

      setMessages((prev) => {
        const updated = prev.map((msg) =>
          msg.id === assistantMessage.id ? { ...msg, status: undefined } : msg
        );
        messagesRef.current = updated;
        return updated;
      });
      isStreamingRef.current = false;
    } catch (e: any) {
      const errorStatus: Message["status"] =
        e.name === "AbortError" ? "stopped" : "error";
      setMessages((prev) => {
        const updated = prev.map((msg) =>
          msg.id === assistantMessage.id ? { ...msg, status: errorStatus } : msg
        );
        messagesRef.current = updated;
        return updated;
      });
      isStreamingRef.current = false;
    } finally {
      setIsSending(false);
      setStreamingController(null);
    }
  }, []);

  const retry = useCallback(
    (id: string, originalText: string) => {
      setMessages((prev) => {
        const filtered = prev.filter((msg) => msg.id !== id);
        messagesRef.current = filtered;
        return filtered;
      });
      // используем useLayoutEffect через ref для вызова sendMessage после обновления
      sendMessage(originalText);
    },
    [sendMessage]
  );

  const stopStreaming = useCallback(() => {
    streamingController?.abort();
  }, [streamingController]);

  return {
    messages,
    isSending,
    isStreaming: !!streamingController,
    sendMessage,
    retry,
    stopStreaming,
  };
}
