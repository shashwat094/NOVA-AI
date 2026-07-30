// Proxies chat requests to Groq (free tier, no card required) and reshapes
// the response to match what the frontend expects, so App.jsx never has to change.
//
// Model note: this uses openai/gpt-oss-120b. Groq deprecated llama-3.3-70b-versatile
// (shutdown 08/16/2026) — see https://console.groq.com/docs/deprecations. If you'd
// rather use a different model, just change MODEL below; any Groq chat-completions
// model ID will work.
const MODEL = "openai/gpt-oss-120b";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!process.env.GROQ_API_KEY) {
    res.status(500).json({ error: 'Server misconfigured: GROQ_API_KEY is not set' });
    return;
  }

  try {
    const { system, messages = [], max_tokens } = req.body || {};

    const groqMessages = [
      ...(system ? [{ role: 'system', content: system }] : []),
      ...messages.map(m => ({ role: m.role, content: m.content })),
    ];

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: groqMessages,
        max_tokens: max_tokens || 1000,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      res.status(response.status).json({ error: data.error?.message || 'Groq request failed' });
      return;
    }

    const text = data.choices?.[0]?.message?.content || '';
    res.status(200).json({ content: [{ type: 'text', text }] });
  } catch (err) {
    res.status(500).json({ error: 'Proxy request failed', detail: String(err) });
  }
}
