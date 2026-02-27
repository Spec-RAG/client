type Req = {
  method?: string;
  body?: unknown;
};

type Res = {
  status: (code: number) => Res;
  setHeader: (name: string, value: string) => void;
  write: (chunk: Uint8Array) => void;
  end: (data?: string) => void;
};

export default async function handler(req: Req, res: Res) {
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).end("Method Not Allowed");
    return;
  }

  const BACKEND = "http://15.164.96.57:30080";

  try {
    const upstream = await fetch(`${BACKEND}/api/chat/rag/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
      },
      body: JSON.stringify(req.body ?? {}),
    });

    res.status(upstream.status);
    res.setHeader(
      "Content-Type",
      upstream.headers.get("content-type") ?? "text/event-stream",
    );
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    if (!upstream.body) {
      res.end();
      return;
    }

    const reader = upstream.body.getReader();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) res.write(value);
    }

    res.end();
  } catch {
    res.status(502).end("Bad Gateway");
  }
}
