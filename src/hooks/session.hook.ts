import { useState } from "react";

const STORAGE_KEY = "specrag.sessionId";

export const useSessionId = () => {
  const [sessionId] = useState(() => {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (existing) return existing;

    const created =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    localStorage.setItem(STORAGE_KEY, created);
    return created;
  });

  return sessionId;
};
