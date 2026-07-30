// Streams chat completions from Groq (free tier) to the browser as plain text
// chunks. Falls back to a single JSON payload when `stream` is not requested.
const MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";
const ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  if (!process.env.GROQ_API_KEY) {
    res.status(500).json({ error: "Server misconfigured: GROQ_API_KEY is not set" });
    return;
  }

  const { system, messages = [], max_tokens, stream = true } = req.body || {};

  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: "messages must be a non-empty array" });
    return;
  }

  const payload = {
    model: MODEL,
    max_tokens: max_tokens || 1200,
    temperature: 0.7,
    stream: Boolean(stream),
    messages: [
      ...(system ? [{ role: "system", content: system }] : []),
      ...messages
        .filter((m) => m && typeof m.content === "string")
        .map((m) => ({ role: m.role === "user" ? "user" : "assistant", content: m.content })),
    ],
  };

  try {
    const upstream = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    if (!upstream.ok) {
      const detail = await upstream.text();
      let message = "Upstream request failed";
      try {
        message = JSON.parse(detail)?.error?.message || message;
      } catch {
        /* keep default message */
      }
      res.status(upstream.status).json({ error: message });
      return;
    }

    if (!payload.stream) {
      const data = await upstream.json();
      res.status(200).json({
        content: [{ type: "text", text: data.choices?.[0]?.message?.content || "" }],
      });
      return;
    }

    res.writeHead(200, {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    });

    const reader = upstream.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        const data = trimmed.slice(5).trim();
        if (!data || data === "[DONE]") continue;
        try {
          const token = JSON.parse(data).choices?.[0]?.delta?.content;
          if (token) res.write(token);
        } catch {
          /* ignore malformed keep-alive frames */
        }
      }
    }

    res.end();
  } catch (err) {
    if (res.headersSent) {
      res.end();
      return;
    }
    res.status(500).json({ error: "Proxy request failed", detail: String(err) });
  }
}