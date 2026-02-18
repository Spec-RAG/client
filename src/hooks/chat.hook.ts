import { useCallback, useEffect, useRef, useState } from "react";
import type { ChatMsg } from "@/types/chat.type";
import { parseChatResponse } from "@/lib/utils";

type UseChatOptions = {
  endpoint?: string;
  sessionId: string;

  messages: ChatMsg[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMsg[]>>;
};

export const useChat = ({
  endpoint = "/api/chat",
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
    (msg: ChatMsg) => {
      setMessages((prev) => [...prev, msg]);
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

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, sessionId }),
      });

      const replyText = await parseChatResponse(res);

      appendMessage({
        id: crypto.randomUUID(),
        role: "assistant",
        text: replyText,
      });
    } catch {
      appendMessage({
        id: crypto.randomUUID(),
        role: "assistant",
        text: "요청 실패 (서버/프록시/CORS 확인)",
      });
    } finally {
      setIsSending(false);
    }
  }, [appendMessage, endpoint, input, isSending, sessionId]);

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
