import type { ChatListItem, ChatMsg } from "@/types/chat.type";
import { ChatSidebar } from "./chat-sidebar";
import { ChatThread } from "./chat-thread";

type Props = {
  title?: string;

  chats: ChatListItem[];
  onNewChat?: () => void;
  onSelectChat?: (chatId: string) => void;

  input: string;
  setInput: (v: string) => void;
  messages: ChatMsg[];
  isSending: boolean;
  onSend: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  bottomRef: React.RefObject<HTMLDivElement | null>;
};

const ChatView = ({
  title,
  chats,
  onNewChat,
  onSelectChat,
  input,
  setInput,
  messages,
  isSending,
  onSend,
  onKeyDown,
  bottomRef,
}: Props) => {
  return (
    <div className="h-screen w-screen bg-background text-foreground">
      <div className="flex h-full">
        <ChatSidebar
          title={title}
          chats={chats}
          onNewChat={onNewChat}
          onSelectChat={onSelectChat}
        />
        <main className="flex flex-1">
          <ChatThread
            messages={messages}
            input={input}
            setInput={setInput}
            isSending={isSending}
            onSend={onSend}
            onKeyDown={onKeyDown}
            bottomRef={bottomRef}
          />
        </main>
      </div>
    </div>
  );
};

export default ChatView;
