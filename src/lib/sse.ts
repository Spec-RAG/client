import type { StreamChunk } from "@/types/chat.type";

const parseSseEvent = (rawEvent: string): StreamChunk[] => {
  const lines = rawEvent.split("\n");
  const chunks: StreamChunk[] = [];

  const dataLines = lines
    .filter((l) => l.startsWith("data:"))
    .map((l) => l.replace(/^data:\s?/, ""));

  if (dataLines.length === 0) return chunks;

  const data = dataLines.join("\n").trim();

  if (data === "[DONE]") {
    return [{ type: "done" }];
  }

  try {
    const parsed = JSON.parse(data);

    if (parsed.type === "chunk") {
      chunks.push({
        type: "token",
        value: parsed.content ?? "",
      });
    }

    if (parsed.type === "error") {
      chunks.push({
        type: "error",
        message: parsed.message ?? "Unknown error",
      });
    }

    if (parsed.type === "sources") {
      const sources = Array.isArray(parsed.sources)
        ? parsed.sources.map((s: any) => ({
            index: s.index,
            url: s.source_url,
          }))
        : [];

      chunks.push({
        type: "sources",
        sources,
      });
    }
  } catch {
    chunks.push({
      type: "token",
      value: data,
    });
  }

  return chunks;
};

export const consumeSse = async (
  res: Response,
  onChunk: (c: StreamChunk) => void,
) => {
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    onChunk({
      type: "error",
      message: text || `HTTP ${res.status}`,
    });
    return;
  }

  const reader = res.body?.getReader();
  if (!reader) {
    onChunk({
      type: "error",
      message: "ReadableStream not supported",
    });
    return;
  }

  const decoder = new TextDecoder("utf-8");
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    let idx: number;
    while ((idx = buffer.indexOf("\n\n")) !== -1) {
      const rawEvent = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 2);

      parseSseEvent(rawEvent).forEach(onChunk);
    }
  }

  if (buffer.trim().length > 0) {
    parseSseEvent(buffer).forEach(onChunk);
  }

  onChunk({ type: "done" });
};
