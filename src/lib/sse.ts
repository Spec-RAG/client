import type { StreamChunk } from "@/types/chat.type";

const parseSseEvent = (rawEvent: string): StreamChunk[] => {
  const lines = rawEvent.split("\n");
  const chunks: StreamChunk[] = [];

  // data: 로 시작하는 줄만 추출
  const dataLines = lines
    .filter((l) => l.startsWith("data:"))
    .map((l) => l.replace(/^data:\s?/, ""));

  if (dataLines.length === 0) return chunks;

  const data = dataLines.join("\n").trim();

  // 스트림 종료
  if (data === "[DONE]") {
    return [{ type: "done" }];
  }

  try {
    // 서버가 JSON 형태로 내려보내는 경우
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
      // 필요하면 sources를 따로 처리
      // 지금은 화면에 표시 안 함
    }
  } catch {
    // JSON 파싱 실패하면 그냥 텍스트로 처리
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

      const chunks = parseSseEvent(rawEvent);
      chunks.forEach(onChunk);
    }
  }

  if (buffer.trim().length > 0) {
    parseSseEvent(buffer).forEach(onChunk);
  }

  onChunk({ type: "done" });
};
