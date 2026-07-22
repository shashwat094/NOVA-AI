// Proxies chat requests to Google Gemini (free tier, no card required) and reshapes
// the response to match what the frontend expects, so App.jsx never has to change.
// Uses the same GEMINI_API_KEY as api/image.js — one key for the whole app.
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!process.env.GEMINI_API_KEY) {
    res.status(500).json({ error: 'Server misconfigured: GEMINI_API_KEY is not set' });
    return;
  }

  try {
    const { system, messages = [], max_tokens } = req.body || {};

    // Gemini uses "user" / "model" roles, not "user" / "assistant"
    const contents = messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': process.env.GEMINI_API_KEY,
        },
        body: JSON.stringify({
          ...(system ? { system_instruction: { parts: [{ text: system }] } } : {}),
          contents,
          generationConfig: { maxOutputTokens: max_tokens || 1000 },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      res.status(response.status).json({ error: data.error?.message || 'Gemini request failed' });
      return;
    }

    const text = (data.candidates?.[0]?.content?.parts || []).map(p => p.text).join('') || '';
    res.status(200).json({ content: [{ type: 'text', text }] });
  } catch (err) {
    res.status(500).json({ error: 'Proxy request failed', detail: String(err) });
  }
}
