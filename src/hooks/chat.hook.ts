import { useCallback, useEffect, useRef, useState } from "react";
import type { ChatMsg, StreamChunk } from "@/types/chat.type";
import { consumeSse } from "@/lib/sse";

type UseChatOptions = {
  endpoint?: string;
  sessionId: string;

  messages: ChatMsg[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMsg[]>>;
};

export const useChat = ({
  endpoint = "/api/proxy",
  sessionId,
  messages,
  setMessages,
}: UseChatOptions) => {
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const appendMessage = useCallback(
    (msg: ChatMsg) => setMessages((prev) => [...prev, msg]),
    [setMessages],
  );

  const appendToMessage = useCallback(
    (id: string, delta: string) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, text: m.text + delta } : m)),
      );
    },
    [setMessages],
  );

  const send = useCallback(async () => {
    if (!sessionId) return;
    if (isSending) return;

    const text = input.trim();
    if (!text) return;

    appendMessage({ id: crypto.randomUUID(), role: "user", text });
    setInput("");
    setIsSending(true);

    const assistantId = crypto.randomUUID();
    appendMessage({ id: assistantId, role: "assistant", text: "" });

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
        },
        body: JSON.stringify({ message: text, sessionId }),
      });

      await consumeSse(res, (c: StreamChunk) => {
        if (c.type === "token") appendToMessage(assistantId, c.value);
        if (c.type === "error")
          appendToMessage(assistantId, `\n\n[ERROR] ${c.message}`);
      });
    } catch {
      appendToMessage(
        assistantId,
        "\n\n[ERROR] 요청 실패 (서버/프록시/CORS 확인)",
      );
    } finally {
      setIsSending(false);
    }
  }, [appendMessage, appendToMessage, endpoint, input, isSending, sessionId]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        void send();
      }
    },
    [send],
  );

  return { input, setInput, isSending, send, onKeyDown, bottomRef };
};
