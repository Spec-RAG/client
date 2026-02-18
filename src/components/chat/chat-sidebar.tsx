import type { ChatListItem } from "@/types/chat.type";
import { Separator } from "../ui/separator";
import { ScrollArea } from "../ui/scroll-area";
import { Button } from "../ui/button";

type Props = {
  title?: string;
  chats: ChatListItem[];
  onNewChat?: () => void;
  onSelectChat?: (chatId: string) => void;
};

export const ChatSidebar = ({
  title = "SpecRAG Chat",
  chats,
  onNewChat,
  onSelectChat,
}: Props) => {
  return (
    <aside className="w-72 border-r bg-muted/30">
      <div className="flex h-full flex-col">
        <div className="flex items-center gap-2 p-3">
          <div className="text-sm font-semibold">{title}</div>
          <div className="ml-auto">
            <Button size="sm" onClick={onNewChat}>
              + New
            </Button>
          </div>
        </div>

        <Separator />

        <ScrollArea className="flex-1 p-2">
          <div className="space-y-1">
            {chats.map((c) => (
              <button
                key={c.id}
                onClick={() => onSelectChat?.(c.id)}
                className={[
                  "w-full rounded-md px-3 py-2 text-left text-sm transition",
                  "hover:bg-accent hover:text-accent-foreground",
                  c.active
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground",
                ].join(" ")}
              >
                <div className="truncate font-medium text-foreground">
                  {c.title}
                </div>
                <div className="truncate text-xs text-muted-foreground">
                  대화 선택
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>

        <Separator />
        <div className="p-3 text-xs text-muted-foreground">SPEC-RAG</div>
      </div>
    </aside>
  );
};
