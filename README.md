<div align="center">

# ⚡ NOVA

### An AI agent that codes with you, brags about its creator, and occasionally misplaces a semicolon.

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-Powered-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![Groq](https://img.shields.io/badge/Groq-GPT--OSS%20120B-a855f7?style=for-the-badge)](https://groq.com)
[![Status](https://img.shields.io/badge/status-caffeinated-34d399?style=for-the-badge)]()

</div>

---

## `> what is this`

**Nova** is a cyberpunk-themed AI agent built for [Shashwat Pandey's](https://github.com/shashwat094) personal site. It's not just a chatbot — it's a developer's sidekick that:

- 🐛 **Debugs your code** — paste a bug, get a fix, no lectures
- 🎨 **Generates images** — type `/image <description>` or tap the image icon
- 🚀 **Talks about Shashwat's work** — knows every project, ready to recommend the right one
- 💬 **Has actual personality** — dry humor, zero patience for unclosed brackets
- 🔐 **Remembers you** — sign in with Google or email to save and revisit past conversations
- ☕ **Takes donations** — because chai isn't free

---

## `> features`

| Feature | Description |
|---|---|
| 🖥️ Boot sequence | Terminal-style intro animation on load |
| 🎨 Cursor-reactive UI | A soft glow follows your mouse across the app |
| ⌨️ Typewriter greeting | Nova's first message types itself out |
| 🖼️ Image generation | `/image <prompt>` or the image icon next to the input |
| ⏹️ Stop / 🔁 regenerate | Cancel an in-flight reply, or re-roll the last answer |
| 📋 Copy-to-clipboard | One-tap copy on code blocks, email, phone, and UPI ID |
| 📱 Fully responsive | Desktop tabs → mobile bottom nav, single-scroll architecture |
| 🎯 Per-project accent colors | Each project gets its own color-coded card |
| 🟢 Live status badge | Pulsing "open to internships" indicator |
| 🔐 Google + email auth | Sign up, log in, log out, password reset, email verification |
| 🕓 Chat history | Saved per-account in Firestore, with delete-per-conversation |

---

## `> tech stack`

```
Frontend    →  React 19 + Vite
Styling     →  Custom CSS (no framework, fully hand-tuned)
Icons       →  lucide-react
Auth + DB   →  Firebase (Authentication + Firestore)
Text model  →  openai/gpt-oss-120b via Groq
Image model →  Gemini 2.5 Flash Image ("Nano Banana")
Fonts       →  Space Grotesk · JetBrains Mono · Inter
```

---

## `> project structure`

Everything lives flat at the project root (not under `src/`) — `index.html` loads `/main.jsx` directly, so that's where it has to live.

```
nova-agent/
├── api/
│   ├── chat.js          # Serverless proxy → Groq (text)
│   └── image.js         # Serverless proxy → Gemini (images)
├── App.jsx               # Nova, in full
├── main.jsx               # Entry point
├── firebase.js             # Firebase config + auth/Firestore exports
├── index.css
├── index.html
├── vite.config.js
├── .env.example
└── package.json
```

---

## `> running it locally`

```bash
git clone https://github.com/shashwat094/nova-agent.git
cd nova-agent
npm install
```

The frontend and the `/api` serverless functions are two different things — pick the one that matches what you're testing:

```bash
npm run dev        # frontend only, at http://localhost:5173 — chat & image requests will 404
npx vercel dev      # frontend + working /api routes — this is what you want most of the time
```

`vercel dev` needs the [Vercel CLI](https://vercel.com/docs/cli) (`npm i -g vercel`) and reads your API keys from a local `.env` file (see below) — it emulates the real serverless environment so `/api/chat` and `/api/image` actually respond.

---

## `> setting up the AI backend (Groq + Gemini)`

Both API routes need a key. Copy the example env file and fill it in:

```bash
cp .env.example .env
```

1. **Groq (text chat)** — free tier, no card required. Grab a key at [console.groq.com/keys](https://console.groq.com/keys) and set `GROQ_API_KEY`.
2. **Gemini (image generation)** — free tier via Google AI Studio. Grab a key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey) and set `GEMINI_API_KEY`.

For production, add both as Environment Variables in your Vercel project settings (Project → Settings → Environment Variables) rather than committing `.env`.

> **Model note:** `api/chat.js` uses `openai/gpt-oss-120b`. Groq deprecated `llama-3.3-70b-versatile` (the model this project originally shipped with) — see [console.groq.com/docs/deprecations](https://console.groq.com/docs/deprecations) for the current list if you ever need to swap models again.

---

## `> deploying`

```bash
npm run build
```

Push to Vercel (recommended, since `api/` is already laid out as Vercel serverless functions) — connect the repo at [vercel.com/new](https://vercel.com/new), or run `npx vercel` from the project root. Add `GROQ_API_KEY` and `GEMINI_API_KEY` under the project's Environment Variables before your first deploy.

---

## `> built by`

**Shashwat Pandey** — developer, professional stack-trace whisperer, co-founder of [ChitrakootDhamTour](https://chitrakootdhamtour.in)

[![GitHub](https://img.shields.io/badge/GitHub-shashwat094-181717?style=flat-square&logo=github)](https://github.com/shashwat094)
[![Instagram](https://img.shields.io/badge/Instagram-dev__yashh-E4405F?style=flat-square&logo=instagram&logoColor=white)](https://instagram.com/dev_yashh)
[![WhatsApp](https://img.shields.io/badge/WhatsApp-Chat-25D366?style=flat-square&logo=whatsapp&logoColor=white)](https://wa.me/917024487353)

---

<div align="center">

**built with chai, react, and mild sleep deprivation ⚡**

</div>

---

## Setting up Google Sign-In & Chat History (Firebase)

Nova supports Google and email/password sign-in and saves each signed-in user's chat history (text only — generated images aren't persisted). This requires a free Firebase project — here's the setup:

### 1. Create a Firebase project
- Go to [console.firebase.google.com](https://console.firebase.google.com) → **Add project** → follow the steps (Google Analytics is optional, skip it if you want)

### 2. Enable sign-in methods
- In your project, go to **Build → Authentication → Get started**
- Under **Sign-in method**, enable **Google** and **Email/Password**
- Add your Vercel domain (e.g. `nova-ai-xi-khaki.vercel.app`) under **Authorized domains** if it's not there already

### 3. Create a Firestore database
- Go to **Build → Firestore Database → Create database**
- Start in **production mode**
- Once created, go to the **Rules** tab and replace the rules with:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /chatSessions/{sessionId} {
      allow read, update, delete: if request.auth != null && request.auth.uid == resource.data.uid;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.uid;
    }
  }
}
```
This ensures a user can only ever read, write, or delete their **own** chat history — never anyone else's.

### 4. Get your config keys
- Go to **Project Settings** (gear icon) → scroll to **Your apps** → click the **Web** icon (`</>`) to register a web app
- Copy the `firebaseConfig` object it gives you

### 5. Drop the config into the project
- Open `firebase.js` in this project
- Replace the placeholder `firebaseConfig` values with your real ones

### 6. Deploy
- Push the updated `firebase.js` to your repo and redeploy on Vercel — no environment variables needed for this part, since Firebase's client config is meant to be public (security is enforced by the Firestore rules above, not by hiding the config).

Once set up: signed-out visitors can still chat with Nova and generate images normally (nothing changes for them) — signing in just adds a **history icon** in the header to save and revisit past text conversations, plus password reset and email verification.
