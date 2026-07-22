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
