import type { ChatMsg } from "@/types/chat.type";
import { ScrollArea } from "../ui/scroll-area";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

type Props = {
  messages: ChatMsg[];
  input: string;
  setInput: (v: string) => void;
  isSending: boolean;
  onSend: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  bottomRef: React.RefObject<HTMLDivElement | null>;
};

export const ChatThread = ({
  messages,
  input,
  setInput,
  isSending,
  onSend,
  onKeyDown,
  bottomRef,
}: Props) => {
  return (
    <div className="flex h-full w-full min-h-0 flex-col">
      <div className="min-h-0 flex-1">
        <ScrollArea className="h-full">
          <div className="mx-auto w-full max-w-3xl space-y-4 px-4 py-6">
            {messages.map((m) => (
              <div
                key={m.id}
                className={[
                  "flex",
                  m.role === "user" ? "justify-end" : "justify-start",
                ].join(" ")}
              >
                <div
                  className={[
                    "max-w-[75%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed",
                    m.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground",
                  ].join(" ")}
                >
                  {m.text ? (
                    m.text
                  ) : m.role === "assistant" && isSending ? (
                    <span className="inline-flex items-end gap-1 text-lg font-bold leading-none">
                      <span className="animate-bounce">.</span>
                      <span className="animate-bounce [animation-delay:0.2s]">
                        .
                      </span>
                      <span className="animate-bounce [animation-delay:0.4s]">
                        .
                      </span>
                    </span>
                  ) : null}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        </ScrollArea>
      </div>

      <div className="border-t py-4">
        <div className="mx-auto w-full max-w-3xl px-4">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="메시지를 입력하세요…"
              disabled={isSending}
            />
            <Button onClick={onSend} disabled={isSending || !input.trim()}>
              {isSending ? "전송중" : "전송"}
            </Button>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            Enter: 전송 · Shift+Enter: (현재 미지원)
          </div>
        </div>
      </div>
    </div>
  );
};