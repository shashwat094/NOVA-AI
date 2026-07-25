<div align="center">

# ⚡ NOVA

### An AI agent that codes with you, brags about its creator, and occasionally misplaces a semicolon.

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-Powered-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![Claude](https://img.shields.io/badge/Claude-Sonnet-a855f7?style=for-the-badge)](https://anthropic.com)
[![Status](https://img.shields.io/badge/status-caffeinated-34d399?style=for-the-badge)]()

</div>

---

## `> what is this`

**Nova** is a cyberpunk-themed AI agent built for [Shashwat Pandey's](https://github.com/shashwat094) personal site. It's not just a chatbot — it's a full-stack developer's sidekick that:

- 🐛 **Debugs your code** — paste a bug, get a fix, no lectures
- 🚀 **Talks about Shashwat's work** — knows every project, ready to recommend the right one
- 💬 **Has actual personality** — dry humor, zero patience for unclosed brackets
- ☕ **Takes donations** — because chai isn't free

---

## `> features`

| Feature | Description |
|---|---|
| 🖥️ Boot sequence | Terminal-style intro animation on load |
| 🎨 Cursor-reactive UI | A soft glow follows your mouse across the app |
| ⌨️ Typewriter greeting | Nova's first message types itself out |
| 📋 Copy-to-clipboard | One-tap copy on code blocks, email, phone, and UPI ID |
| 📱 Fully responsive | Desktop tabs → mobile bottom nav, single-scroll architecture |
| 🎯 Per-project accent colors | Each project gets its own color-coded card |
| 🟢 Live status badge | Pulsing "open to internships" indicator |

---

## `> tech stack`

```
Frontend    →  React 19 + Vite
Styling     →  Custom CSS (no framework, fully hand-tuned)
Icons       →  lucide-react
AI Runtime  →  Claude (Anthropic API)
Fonts       →  Space Grotesk · JetBrains Mono · Inter
```

---

## `> running it locally`

```bash
git clone https://github.com/shashwat094/nova-agent.git
cd nova-agent
npm install
npm run dev
```

Opens at `http://localhost:5173` by default.

---

## `> deploying`

> ⚠️ **Important**: the chat calls the Anthropic API directly out of the box, which only works in a sandboxed preview. For a real deployment, route it through your own backend so your API key never touches the browser.

```bash
npm run build
```

Then push `dist/` to Vercel, Netlify, or your own hosting — whatever you're already using.

---

## `> project structure`

```
nova-agent/
├── src/
│   ├── App.jsx        # Nova, in full
│   └── main.jsx       # Entry point
├── public/
├── index.html
└── package.json
```

---

## `> built by`

**Shashwat Pandey** — full-stack developer, professional stack-trace whisperer, co-founder of [ChitrakootDhamTour](https://chitrakootdhamtour.in)

[![GitHub](https://img.shields.io/badge/GitHub-shashwat094-181717?style=flat-square&logo=github)](https://github.com/shashwat094)
[![Instagram](https://img.shields.io/badge/Instagram-dev__yashh-E4405F?style=flat-square&logo=instagram&logoColor=white)](https://instagram.com/dev_yashh)
[![WhatsApp](https://img.shields.io/badge/WhatsApp-Chat-25D366?style=flat-square&logo=whatsapp&logoColor=white)](https://wa.me/917024487353)

---

<div align="center">

**built with chai, react, and mild sleep deprivation ⚡**

</div>

---

## Setting up Google Sign-In & Chat History (Firebase)

Nova now supports Google sign-in and saves each signed-in user's chat history. This requires a free Firebase project — here's the setup:

### 1. Create a Firebase project
- Go to [console.firebase.google.com](https://console.firebase.google.com) → **Add project** → follow the steps (Google Analytics is optional, skip it if you want)

### 2. Enable Google Sign-In
- In your project, go to **Build → Authentication → Get started**
- Under **Sign-in method**, enable **Google**
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
This ensures a user can only ever read or write their **own** chat history — never anyone else's.

### 4. Get your config keys
- Go to **Project Settings** (gear icon) → scroll to **Your apps** → click the **Web** icon (`</>`) to register a web app
- Copy the `firebaseConfig` object it gives you

### 5. Drop the config into the project
- Open `firebase.js` in this project
- Replace the placeholder `firebaseConfig` values with your real ones

### 6. Deploy
- Push the updated `firebase.js` to your repo and redeploy on Vercel — no environment variables needed for this part, since Firebase's client config is meant to be public (security is enforced by the Firestore rules above, not by hiding the config).

Once set up: signed-out visitors can still chat with Nova normally (nothing changes for them) — signing in with Google just adds a **history icon** in the header to save and revisit past conversations.
