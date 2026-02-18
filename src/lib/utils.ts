import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type AnyObj = Record<string, unknown>;

const isObj = (v: unknown): v is AnyObj => typeof v === "object" && v !== null;

export const parseChatResponse = async (res: Response): Promise<string> => {
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return text
      ? `HTTP ${res.status}: ${text}`
      : `HTTP ${res.status} 요청 실패`;
  }

  try {
    const data: unknown = await res.json();

    if (isObj(data)) {
      const candidate =
        (typeof data.answer === "string" && data.answer) ||
        (typeof data.message === "string" && data.message) ||
        (typeof data.text === "string" && data.text);

      if (candidate) return candidate;
    }

    return "(응답 파싱 실패: answer/message/text 중 하나가 필요)";
  } catch {
    const text = await res.text().catch(() => "");
    return text || "(응답 파싱 실패: JSON도 아니고 text도 비어있음)";
  }
};
