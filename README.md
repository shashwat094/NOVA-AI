# Nova — AI chat assistant

A minimal, professional chat interface for Nova, an AI assistant by Shashwat Pandey.

## Stack

- React 19 + Vite
- Firebase Auth (email/password + Google) and Firestore for conversation history
- `/api/chat` serverless proxy to Groq chat completions (streaming)

## Run locally

```bash
npm install
npm run dev            # UI only (chat needs the API route)
```

For the chat API locally, run the Vercel dev server in a second terminal:

```bash
GROQ_API_KEY=your_key npx vercel dev --listen 3000
```

Vite proxies `/api/*` to `http://localhost:3000` (override with `API_PROXY_TARGET`).

## Environment variables

| Variable | Where | Purpose |
| --- | --- | --- |
| `GROQ_API_KEY` | server | Required. Groq API key. |
| `GROQ_MODEL` | server | Optional. Defaults to `openai/gpt-oss-120b`. |
| `VITE_FIREBASE_*` | client | Optional overrides for the Firebase config. |

## Deploy

Deploy to Vercel and set `GROQ_API_KEY` in project settings. `vercel.json`
handles SPA routing while leaving `/api/*` to the serverless function.

## Structure

```
api/chat.js              Groq streaming proxy
src/App.jsx              App shell, auth + conversation state
src/components/          Sidebar, ChatView, Message, Markdown, AuthModal, pages
src/lib/                 Content, prompt, auth error copy
src/styles.css           Design system (single neutral palette)
```