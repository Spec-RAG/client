import { useMemo, useState } from "react";
import { useChat } from "./hooks/chat.hook";
import type { ChatListItem, ChatMsg } from "@/types/chat.type";
import { useSessionId } from "./hooks/session.hook";
import ChatView from "./components/chat/chat-view";

const DEFAULT_CHAT_ID = "c1";

const App = () => {
  const sessionId = useSessionId();

  const [activeChatId, setActiveChatId] = useState(DEFAULT_CHAT_ID);
  const [messagesByChatId, setMessagesByChatId] = useState<
    Record<string, ChatMsg[]>
  >({
    [DEFAULT_CHAT_ID]: [],
  });

  const messages = messagesByChatId[activeChatId] ?? [];

  const { input, setInput, isSending, send, onKeyDown, bottomRef } = useChat({
    endpoint: "/api/proxy",
    sessionId,
    messages,
    setMessages: (updater) => {
      setMessagesByChatId((prev) => {
        const current = prev[activeChatId] ?? [];
        const next =
          typeof updater === "function"
            ? (updater as (p: ChatMsg[]) => ChatMsg[])(current)
            : updater;

        return { ...prev, [activeChatId]: next };
      });
    },
  });

  const chats = useMemo<ChatListItem[]>(
    () => [{ id: DEFAULT_CHAT_ID, title: "Default Room", active: true }],
    [],
  );

  return (
    <ChatView
      title="SpecRAG Chat"
      chats={chats}
      onSelectChat={(id: string) => setActiveChatId(id)}
      input={input}
      setInput={setInput}
      messages={messages}
      isSending={isSending}
      onSend={send}
      onKeyDown={onKeyDown}
      bottomRef={bottomRef}
    />
  );
};

export default App;
