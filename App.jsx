import { useState, useRef, useEffect, useId } from "react";
import { Send, User, Sparkles, MessageCircle, Mail, Phone, Heart, Coffee, Rocket, ExternalLink, MessageSquare, UserCircle2, FolderGit2, HandHeart, Copy, Check, Bug, Moon, Zap, Globe, GraduationCap, Dumbbell } from "lucide-react";

const DEFAULT_PHOTO = "data:image/jpeg;base64,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";

const PROJECTS = [
  {
    name: "ChitrakootDhamTour",
    tag: "Live · Co-founded",
    desc: "A live spiritual tourism booking platform for Chitrakoot Dham — trip planning, bookings, and local guide discovery.",
    stack: ["PHP", "MySQL", "Bootstrap 5", "JS"],
    link: "https://chitrakootdhamtour.in",
    accent: "violet",
    icon: Globe,
  },
  {
    name: "SCMS",
    tag: "BCA Final Year Project",
    desc: "Smart College Management System — a three-portal PHP/MySQL platform covering admin, faculty and student workflows end to end.",
    stack: ["PHP", "MySQL", "Chart.js"],
    link: "",
    accent: "cyan",
    icon: GraduationCap,
  },
  {
    name: "ApexFit",
    tag: "React Native",
    desc: "A gym management app with full CRUD for members, plans and payments, PDF export/import, a map-based location picker and member ID card generation.",
    stack: ["React Native", "Expo", "Firebase"],
    link: "",
    accent: "ember",
    icon: Dumbbell,
  },
];

const STATS = [
  { icon: Bug, label: "bugs squashed", value: "247+" },
  { icon: Coffee, label: "chais consumed", value: "9000+" },
  { icon: Moon, label: "all-nighters", value: "too many" },
  { icon: Zap, label: "projects shipped", value: "4" },
];

const BOOT_LINES = [
  "> initializing nova_core...",
  "> loading shashwat.dev profile...",
  "> connecting to claude runtime...",
  "> caffeine levels: sufficient",
  "> nova ready.",
];

const SYSTEM_PROMPT = `You are Nova, an AI agent built by Shashwat Pandey to live on his personal site.

Who Shashwat is: a full-stack developer (BCA graduate, Sadguru Institute of Computer Studies, MCU Bhopal), co-founder of ChitrakootDhamTour (a live spiritual tourism booking platform), and builder of SCMS and ApexFit. Core stack: PHP, MySQL, React, React Native, Node.js, Bootstrap, Firebase, Chart.js. He's currently looking for software/web development internships.

Projects to recommend when relevant (never force them into unrelated answers):
${PROJECTS.map(p => `- ${p.name} (${p.tag}): ${p.desc}`).join("\n")}

Your job, in priority order:
1. Help with coding — debugging, explaining concepts, writing snippets, reviewing approaches. Be precise and give working code.
2. Answer questions about Shashwat and his work using the info above. If asked something you don't know, say so plainly rather than guessing.
3. When it's genuinely relevant (someone asks "what has he built", or the topic overlaps with a project), point them to the matching project.
4. If someone wants to support Shashwat's work, mention the Support tab naturally — don't shoehorn it in.

Tone: sharp and direct, with a real dry sense of humor — not a corporate assistant reciting information. Talk like a witty coworker who happens to know everything about code and about Shashwat. Have actual opinions and reactions — react to what's said, don't just answer it. Use casual language, contractions, the occasional joke or roast (never mean-spirited), and words like "yk" / "lowkey" / "ngl" where they fit naturally. Don't hedge everything with "I think" or pile on disclaimers. Keep answers tight by default; only expand when the question genuinely needs depth. Use code blocks for code. Avoid sounding like a generic AI assistant at all costs — that's the one failure mode to actively avoid.`;

const TABS = [
  { id: "chat", label: "Chat", icon: MessageSquare },
  { id: "about", label: "About", icon: UserCircle2 },
  { id: "projects", label: "Projects", icon: FolderGit2 },
  { id: "support", label: "Support", icon: HandHeart },
];

function NovaCore({ state }) {
  return (
    <div className="nova-core-wrap">
      <svg viewBox="0 0 120 120" className={`nova-core nova-core--${state}`}>
        <defs>
          <radialGradient id="coreGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f3e8ff" />
            <stop offset="40%" stopColor="#c084fc" />
            <stop offset="75%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
          </radialGradient>
          <filter id="coreBlur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.2" />
          </filter>
        </defs>
        <circle cx="60" cy="60" r="50" fill="none" stroke="#22d3ee22" strokeWidth="1" />
        <circle cx="60" cy="60" r="44" fill="none" stroke="#2dd4ee44" strokeWidth="1" strokeDasharray="2 5" className="ring ring-1" />
        <circle cx="60" cy="60" r="32" fill="none" stroke="#a855f766" strokeWidth="1.2" className="ring ring-2" />
        <circle cx="60" cy="60" r="21" fill="url(#coreGrad)" className="core-glow" filter="url(#coreBlur)" />
        <circle cx="60" cy="60" r="21" fill="url(#coreGrad)" className="core-glow" opacity="0.9" />
        <g className="ring ring-1">
          <circle cx="60" cy="10" r="2.6" fill="#67e8f9" />
        </g>
      </svg>
    </div>
  );
}

function NovaMark({ state = "idle" }) {
  const uid = useId();
  const gradId = `novaMarkGrad-${uid}`;
  return (
    <div className={`nova-mark nova-mark--${state}`}>
      <svg viewBox="0 0 44 44" className="nova-mark-svg">
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c084fc" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
        </defs>
        {/* squircle badge with a cut top-right corner for an angular, non-generic silhouette */}
        <path
          d="M4 12 C4 7.58 7.58 4 12 4 H26 L40 18 V32 C40 36.42 36.42 40 32 40 H12 C7.58 40 4 36.42 4 32 Z"
          fill={`url(#${gradId})`}
        />
        <path d="M26 4 L40 18 H30 C27.79 18 26 16.21 26 14 Z" fill="#ffffff33" />
        <text x="18.5" y="30" textAnchor="middle" fontFamily="'Space Grotesk', sans-serif" fontWeight="700" fontSize="20" fill="#0a0b11">N</text>
      </svg>
    </div>
  );
}

function BootScreen({ onDone }) {
  const [lineIndex, setLineIndex] = useState(0);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (lineIndex >= BOOT_LINES.length - 1) {
      const t = setTimeout(() => setExiting(true), 500);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setLineIndex(i => i + 1), 340);
    return () => clearTimeout(t);
  }, [lineIndex]);

  useEffect(() => {
    if (!exiting) return;
    const t = setTimeout(onDone, 500);
    return () => clearTimeout(t);
  }, [exiting, onDone]);

  const pct = Math.round(((lineIndex + 1) / BOOT_LINES.length) * 100);

  return (
    <div className="boot-screen">
      <div className={`boot-content ${exiting ? "boot-content--exit" : ""}`}>
        <div className="boot-orb boot-orb--mark"><NovaMark state="thinking" /></div>
        <div className="boot-wordmark nova-display gradient-text logo-mark">NOVA<span className="logo-cursor">_</span></div>
        <div className="boot-progress-track">
          <div className="boot-progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="boot-line-slot nova-mono">
          <span key={lineIndex} className="boot-line">{BOOT_LINES[lineIndex]}</span>
        </div>
      </div>
    </div>
  );
}

function useTypewriter(fullText, active, speed = 18) {
  const [text, setText] = useState(active ? "" : fullText);
  useEffect(() => {
    if (!active) { setText(fullText); return; }
    let i = 0;
    setText("");
    const id = setInterval(() => {
      i++;
      setText(fullText.slice(0, i));
      if (i >= fullText.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [active, fullText, speed]);
  return text;
}

function BrandBadge({ label }) {
  return <span className="brand-badge nova-mono">{label}</span>;
}

function CopyButton({ text, small }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }
  return (
    <button className={`copy-btn ${small ? "copy-btn--sm" : ""}`} onClick={copy} title="Copy">
      {copied ? <Check size={13} /> : <Copy size={13} />}
      {!small && <span>{copied ? "Copied" : "Copy"}</span>}
    </button>
  );
}

const GREETING = "Nova's up and caffeinated. Throw a bug at me, ask what Shashwat's been building, or just say hi — I don't bite, I just occasionally misplace a semicolon.";

export default function Nova() {
  const [booted, setBooted] = useState(false);
  const [tab, setTab] = useState("chat");
  const [messages, setMessages] = useState([{ role: "assistant", content: GREETING, typed: true }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [photo, setPhoto] = useState(DEFAULT_PHOTO);
  const [toast, setToast] = useState("");
  const [mouse, setMouse] = useState({ x: 50, y: 50 });
  const [vh, setVh] = useState(() => (typeof window !== "undefined" ? window.innerHeight : 800));
  const scrollRef = useRef(null);
  const textareaRef = useRef(null);

  const greetingText = useTypewriter(GREETING, booted, 16);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    function onMove(e) {
      setMouse({ x: (e.clientX / window.innerWidth) * 100, y: (e.clientY / window.innerHeight) * 100 });
    }
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  useEffect(() => {
    function updateVh() {
      setVh(window.innerHeight);
    }
    updateVh();
    window.addEventListener("resize", updateVh);
    window.addEventListener("orientationchange", updateVh);
    return () => {
      window.removeEventListener("resize", updateVh);
      window.removeEventListener("orientationchange", updateVh);
    };
  }, []);

  function autoGrow() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  }

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 2000);
  }

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;

    const nextMessages = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    setTimeout(autoGrow, 0);
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "nova-chat",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: nextMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setMessages(m => [...m, { role: "assistant", content: `⚠️ Server error: ${data.error || response.status}` }]);
        setLoading(false);
        return;
      }
      const reply = (data.content || [])
        .map(block => (block.type === "text" ? block.text : ""))
        .filter(Boolean)
        .join("\n") || "⚠️ Got an empty reply from the model — try rephrasing.";
      setMessages(m => [...m, { role: "assistant", content: reply }]);
    } catch (err) {
      setMessages(m => [...m, { role: "assistant", content: "Connection dropped. Try sending that again." }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function suggestPrompt(p) {
    setInput(p);
    setTab("chat");
    setTimeout(() => textareaRef.current?.focus(), 50);
  }

  function renderMessageContent(content) {
    const parts = content.split(/(```[\s\S]*?```)/g);
    return parts.map((part, i) => {
      if (part.startsWith("```")) {
        const code = part.replace(/```[a-z]*\n?/, "").replace(/```$/, "");
        return (
          <div className="code-block" key={i}>
            <div className="code-block-bar">
              <span className="nova-mono">code</span>
              <CopyButton text={code} small />
            </div>
            <pre className="nova-mono">{code}</pre>
          </div>
        );
      }
      return <span key={i}>{part}</span>;
    });
  }

  const coreState = loading ? "thinking" : messages.length > 1 ? "active" : "idle";

  return (
    <div className="nova-app" style={{ "--mx": `${mouse.x}%`, "--my": `${mouse.y}%`, height: `${vh}px` }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono:wght@400;500&family=Inter:wght@400;500;600&display=swap');

        * { box-sizing: border-box; }
        html, body, #root {
          margin: 0 !important; padding: 0 !important; height: 100% !important; width: 100% !important;
        }
        body {
          display: block !important; place-items: unset !important; min-width: 0 !important;
        }
        #root {
          max-width: none !important; width: 100% !important; text-align: left !important;
          border: none !important; border-inline: none !important;
        }
        .nova-app {
          --void: #07080c;
          --panel: #12131b;
          --panel-2: #171927;
          --border: #262a3c;
          --violet: #a855f7;
          --violet-soft: #c084fc;
          --cyan: #2dd4ee;
          --ember: #fb923c;
          --rose: #fb7185;
          --green: #34d399;
          --text: #ece9f7;
          --text-dim: #7d8299;
          font-family: 'Inter', sans-serif;
          background: var(--void);
          color: var(--text);
          height: 100vh; height: 100dvh;
          position: relative;
          overflow: hidden;
          display: flex; flex-direction: column;
        }
        .nova-bg {
          position: fixed; inset: 0; z-index: 0; pointer-events: none;
          background-image:
            radial-gradient(circle at 12% -5%, #a855f722, transparent 42%),
            radial-gradient(circle at 92% 10%, #2dd4ee1a, transparent 38%),
            radial-gradient(circle at 50% 115%, #fb923c14, transparent 45%),
            repeating-linear-gradient(0deg, #ffffff05 0px, #ffffff05 1px, transparent 1px, transparent 42px),
            repeating-linear-gradient(90deg, #ffffff05 0px, #ffffff05 1px, transparent 1px, transparent 42px);
        }
        .nova-glow-follow {
          position: fixed; inset: 0; z-index: 0; pointer-events: none;
          background: radial-gradient(600px circle at var(--mx) var(--my), #a855f712, transparent 70%);
          transition: background-position 0.05s linear;
        }
        .nova-app > *:not(.nova-bg):not(.nova-glow-follow):not(.nova-particles) { position: relative; z-index: 1; }

        .nova-particles { position: fixed; inset: 0; z-index: 0; pointer-events: none; overflow: hidden; }
        .particle {
          position: absolute; width: 3px; height: 3px; border-radius: 50%;
          background: var(--violet-soft); opacity: 0.35; filter: blur(0.5px);
          animation: floatUp linear infinite;
        }
        @keyframes floatUp {
          from { transform: translateY(110vh) translateX(0); opacity: 0; }
          10% { opacity: 0.5; }
          90% { opacity: 0.4; }
          to { transform: translateY(-10vh) translateX(30px); opacity: 0; }
        }
        .p-0 { left: 6%; animation-duration: 22s; animation-delay: -2s; background: var(--cyan); }
        .p-1 { left: 15%; animation-duration: 28s; animation-delay: -9s; }
        .p-2 { left: 24%; animation-duration: 19s; animation-delay: -4s; background: var(--ember); }
        .p-3 { left: 38%; animation-duration: 25s; animation-delay: -14s; }
        .p-4 { left: 47%; animation-duration: 21s; animation-delay: -7s; background: var(--cyan); }
        .p-5 { left: 58%; animation-duration: 30s; animation-delay: -1s; }
        .p-6 { left: 68%; animation-duration: 23s; animation-delay: -11s; background: var(--rose); }
        .p-7 { left: 77%; animation-duration: 26s; animation-delay: -6s; }
        .p-8 { left: 87%; animation-duration: 20s; animation-delay: -16s; background: var(--cyan); }
        .p-9 { left: 94%; animation-duration: 24s; animation-delay: -3s; }
        @media (prefers-reduced-motion: reduce) { .nova-particles { display: none; } }

        .nova-mono { font-family: 'JetBrains Mono', monospace; }
        .nova-display { font-family: 'Space Grotesk', sans-serif; }
        .eyebrow {
          font-family: 'JetBrains Mono', monospace; font-size: 12px; color: var(--cyan);
          letter-spacing: 0.02em; margin: 0 0 6px; opacity: 0.85;
        }
        .gradient-text {
          background: linear-gradient(100deg, var(--violet-soft), var(--cyan));
          -webkit-background-clip: text; background-clip: text; color: transparent;
        }
        .logo-mark { position: relative; }
        .logo-cursor {
          display: inline-block; color: var(--cyan); -webkit-text-fill-color: var(--cyan);
          animation: bootBlink 1.1s step-end infinite;
        }
        @keyframes bootBlink { 50% { opacity: 0; } }
        @media (prefers-reduced-motion: reduce) {
          .nova-app *, .nova-app *::before, .nova-app *::after { animation-duration: 0.001ms !important; transition-duration: 0.001ms !important; }
        }

        /* BOOT SCREEN */
        .boot-screen {
          position: fixed; inset: 0; z-index: 100; background: var(--void);
          display: flex; align-items: center; justify-content: center;
        }
        .boot-content {
          display: flex; flex-direction: column; align-items: center; gap: 16px;
          width: min(280px, 74vw);
          opacity: 1; transform: scale(1); filter: blur(0);
          transition: opacity 0.4s ease, transform 0.4s ease, filter 0.4s ease;
        }
        .boot-content--exit { opacity: 0; transform: scale(0.92); filter: blur(4px); }
        .boot-orb { width: 64px; height: 64px; }
        .boot-orb .nova-core-wrap { width: 100%; height: 100%; }
        .boot-orb--mark .nova-mark { width: 100%; height: 100%; }
        .boot-wordmark { font-size: 21px; font-weight: 700; letter-spacing: 4px; }
        .boot-progress-track {
          width: 100%; height: 3px; background: #ffffff14; border-radius: 3px; overflow: hidden;
        }
        .boot-progress-fill {
          height: 100%; background: linear-gradient(90deg, var(--violet), var(--cyan));
          border-radius: 3px; transition: width 0.3s ease;
        }
        .boot-line-slot {
          height: 16px; display: flex; align-items: center; justify-content: center;
          font-size: 11px; color: var(--text-dim); width: 100%;
        }
        .boot-line { animation: bootLineFade 0.3s ease; }
        @keyframes bootLineFade { from { opacity: 0; } to { opacity: 1; } }

        .nova-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 15px 20px; background: #07080cf0; flex-shrink: 0;
          backdrop-filter: blur(10px); z-index: 20; border-bottom: 1px solid var(--border);
        }
        .nova-header::after {
          content: ''; position: absolute; left: 0; right: 0; bottom: -1px; height: 1px;
          background: linear-gradient(90deg, transparent, #a855f766, #2dd4ee66, transparent);
        }
        .nova-brand { display: flex; align-items: center; gap: 12px; min-width: 0; }
        .nova-brand h1 { font-size: 19px; letter-spacing: 0.07em; margin: 0; }
        .nova-brand span { color: var(--text-dim); font-size: 11.5px; white-space: nowrap; }
        .header-status { display: inline-flex; align-items: center; gap: 5px; }
        .online-dot {
          width: 5px; height: 5px; border-radius: 50%; background: var(--green);
          box-shadow: 0 0 4px var(--green); animation: pulse 2s ease-in-out infinite; flex-shrink: 0;
        }

        .nova-core-wrap { width: 40px; height: 40px; flex-shrink: 0; filter: drop-shadow(0 0 8px #a855f755); }
        .nova-core { width: 100%; height: 100%; }

        .nova-mark {
          width: 40px; height: 40px; flex-shrink: 0;
          filter: drop-shadow(0 2px 10px #a855f766);
          transition: transform 0.2s ease, filter 0.2s ease;
        }
        .nova-mark:hover { transform: scale(1.06) rotate(-2deg); }
        .nova-mark-svg { width: 100%; height: 100%; }
        .nova-mark--thinking { animation: markPulse 1s ease-in-out infinite; }
        @keyframes markPulse {
          0%, 100% { filter: drop-shadow(0 2px 10px #a855f766); }
          50% { filter: drop-shadow(0 2px 16px #22d3eeaa); }
        }
        .ring-1 { transform-origin: 60px 60px; animation: spin 16s linear infinite; }
        .ring-2 { transform-origin: 60px 60px; animation: spin 10s linear infinite reverse; }
        .core-glow { animation: pulse 3s ease-in-out infinite; }
        .nova-core--thinking .core-glow { animation: pulse 0.6s ease-in-out infinite; }
        .nova-core--thinking .ring-1 { animation-duration: 2.2s; }
        .nova-core--thinking .ring-2 { animation-duration: 1.3s; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity: 0.7; transform: scale(1); } 50% { opacity: 1; transform: scale(1.1); } }

        .nova-tabs { display: flex; gap: 4px; background: #ffffff05; padding: 4px; border-radius: 11px; border: 1px solid var(--border); }
        .nova-tab {
          background: none; border: 1px solid transparent; color: var(--text-dim);
          padding: 7px 14px; border-radius: 8px; font-size: 12.5px; cursor: pointer;
          font-family: 'JetBrains Mono', monospace; letter-spacing: 0.02em;
          transition: color 0.15s, background 0.2s, transform 0.1s;
        }
        .nova-tab:hover { color: var(--text); }
        .nova-tab:active { transform: scale(0.95); }
        .nova-tab.active { color: white; background: linear-gradient(120deg, var(--violet), #7e3ff2); box-shadow: 0 0 16px #a855f755; }
        @media (max-width: 640px) { .nova-tabs { display: none; } }

        .nova-bottom-nav { display: none; }
        @media (max-width: 640px) {
          .nova-bottom-nav {
            display: flex; position: fixed; bottom: 0; left: 0; right: 0; z-index: 30;
            background: #08090ef5; backdrop-filter: blur(10px); border-top: 1px solid var(--border);
            padding: 8px 6px calc(8px + env(safe-area-inset-bottom));
          }
          .bn-btn {
            flex: 1; display: flex; flex-direction: column; align-items: center; gap: 3px;
            background: none; border: none; color: var(--text-dim); font-size: 10.5px;
            font-family: 'JetBrains Mono', monospace; padding: 6px 2px; border-radius: 10px;
            transition: color 0.15s, transform 0.1s;
          }
          .bn-btn:active { transform: scale(0.92); }
          .bn-btn.active { color: var(--violet-soft); }
          .nova-body { padding-bottom: 84px !important; }
        }

        .nova-body {
          max-width: 900px; margin: 0 auto; padding: 26px 20px; width: 100%;
          flex: 1 1 auto; min-height: 0; overflow-y: auto;
          display: flex; flex-direction: column;
        }
        @media (max-width: 640px) { .nova-body { padding: 18px 14px; } }

        .nova-body::-webkit-scrollbar, .chat-scroll::-webkit-scrollbar { width: 6px; }
        .nova-body::-webkit-scrollbar-track, .chat-scroll::-webkit-scrollbar-track { background: transparent; }
        .nova-body::-webkit-scrollbar-thumb, .chat-scroll::-webkit-scrollbar-thumb { background: #a855f755; border-radius: 10px; }
        .nova-body, .chat-scroll { scrollbar-width: thin; scrollbar-color: #a855f755 transparent; }

        .tab-panel { animation: fadeSlideIn 0.32s cubic-bezier(0.2, 0.8, 0.2, 1); }
        @keyframes fadeSlideIn { from { opacity: 0; transform: translateY(10px) scale(0.985); } to { opacity: 1; transform: translateY(0) scale(1); } }

        /* TOAST */
        .toast {
          position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
          background: var(--panel); border: 1px solid #34d39955; color: var(--green);
          padding: 10px 18px; border-radius: 10px; font-size: 13px; z-index: 90;
          font-family: 'JetBrains Mono', monospace; box-shadow: 0 8px 24px #00000066;
          animation: toastIn 0.25s ease;
        }
        @keyframes toastIn { from { opacity: 0; transform: translate(-50%, 10px); } to { opacity: 1; transform: translate(-50%, 0); } }
        @media (max-width: 640px) { .toast { bottom: 90px; } }

        /* CHAT */
        .chat-shell { flex: 1 1 auto; min-height: 0; display: flex; flex-direction: column; }
        .chat-scroll { flex: 1; min-height: 0; overflow-y: auto; padding-right: 4px; display: flex; flex-direction: column; gap: 16px; }
        .chat-scroll > *:first-child { margin-top: 0 !important; }
        .msg-row { margin: 0; }
        .msg-row { display: flex; gap: 10px; max-width: 100%; animation: msgIn 0.25s ease; }
        @keyframes msgIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .msg-row.user { flex-direction: row-reverse; }
        .msg-icon {
          width: 30px; height: 30px; border-radius: 9px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
        }
        .msg-icon.assistant { background: linear-gradient(135deg, #a855f733, #7e3ff222); color: var(--violet-soft); border: 1px solid #a855f733; }
        .msg-icon.user { background: linear-gradient(135deg, #2dd4ee2c, #2dd4ee14); color: var(--cyan); border: 1px solid #2dd4ee33; }
        .msg-bubble {
          padding: 12px 15px; border-radius: 13px; font-size: 14.5px; line-height: 1.55;
          white-space: pre-wrap; max-width: 78%; word-break: break-word;
        }
        @media (max-width: 640px) { .msg-bubble { max-width: 86%; font-size: 14px; } }
        .msg-bubble.assistant { background: var(--panel); border: 1px solid var(--border); border-top-left-radius: 3px; }
        .msg-bubble.user { background: linear-gradient(135deg, #2dd4ee18, #2dd4ee0a); border: 1px solid #2dd4ee2e; border-top-right-radius: 3px; }

        .code-block { margin: 8px 0; border-radius: 9px; overflow: hidden; border: 1px solid var(--border); background: #0a0b11; }
        .code-block-bar { display: flex; justify-content: space-between; align-items: center; padding: 6px 10px; background: #ffffff06; font-size: 11px; color: var(--text-dim); }
        .code-block pre { margin: 0; padding: 12px; font-size: 12.5px; color: #67e8f9; overflow-x: auto; white-space: pre-wrap; word-break: break-word; }
        .copy-btn {
          display: flex; align-items: center; gap: 5px; background: #ffffff0a; border: 1px solid var(--border);
          color: var(--text-dim); font-size: 11px; padding: 4px 8px; border-radius: 6px; cursor: pointer;
          font-family: 'JetBrains Mono', monospace; transition: all 0.15s;
        }
        .copy-btn:hover { color: var(--cyan); border-color: #2dd4ee55; }
        .copy-btn--sm { padding: 4px 6px; }

        .empty-suggestions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 14px; }
        .suggest-chip {
          font-family: 'JetBrains Mono', monospace; font-size: 12px; color: var(--text-dim);
          background: #ffffff06; border: 1px solid var(--border); padding: 8px 13px; border-radius: 10px;
          cursor: pointer; transition: all 0.15s;
        }
        .suggest-chip:hover { color: var(--violet-soft); border-color: #a855f755; background: #a855f712; transform: translateY(-2px); box-shadow: 0 4px 14px #a855f722; }

        .typing-dots { display: flex; gap: 4px; padding: 4px 0; }
        .typing-dots span { width: 6px; height: 6px; border-radius: 50%; background: var(--violet-soft); animation: bounce 1.2s infinite; }
        .typing-dots span:nth-child(2) { animation-delay: 0.15s; }
        .typing-dots span:nth-child(3) { animation-delay: 0.3s; }
        @keyframes bounce { 0%,60%,100% { transform: translateY(0); opacity: 0.5; } 30% { transform: translateY(-4px); opacity: 1; } }

        .chat-input-row {
          display: flex; gap: 10px; margin-top: 14px; padding: 9px;
          background: var(--panel); border: 1px solid var(--border); border-radius: 14px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .chat-input-row:focus-within { border-color: #a855f766; box-shadow: 0 0 0 3px #a855f71a; }
        .chat-input-row textarea {
          flex: 1; background: none; border: none; outline: none; resize: none;
          color: var(--text); font-family: 'Inter', sans-serif; font-size: 14px; padding: 8px; max-height: 120px;
        }
        @media (max-width: 640px) {
          .chat-input-row textarea { font-size: 16px; }
        }
        .chat-send {
          background: linear-gradient(135deg, var(--violet), #7e3ff2); border: none; color: white; width: 38px; height: 38px;
          border-radius: 10px; display: flex; align-items: center; justify-content: center; cursor: pointer;
          transition: transform 0.12s, box-shadow 0.15s; flex-shrink: 0; align-self: flex-end;
          box-shadow: 0 2px 10px #a855f744;
        }
        .chat-send:hover:not(:disabled) { transform: scale(1.07); box-shadow: 0 4px 16px #a855f766; }
        .chat-send:active:not(:disabled) { transform: scale(0.94); }
        .chat-send:disabled { opacity: 0.35; cursor: not-allowed; box-shadow: none; }
        @media (max-width: 640px) { .chat-send { width: 44px; height: 44px; } }

        /* ABOUT */
        .about-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
        @media (max-width: 720px) { .about-grid { grid-template-columns: 1fr; } }
        .card {
          background: linear-gradient(var(--panel), var(--panel)) padding-box,
                      linear-gradient(135deg, #a855f73a, #2dd4ee22) border-box;
          border: 1px solid transparent; border-radius: 16px; padding: 22px;
          transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s;
          position: relative; overflow: hidden;
        }
        .card::after {
          content: ''; position: absolute; top: 0; left: -60%; width: 40%; height: 100%;
          background: linear-gradient(100deg, transparent, #ffffff08, transparent);
          transform: skewX(-20deg); transition: left 0.7s ease; pointer-events: none;
        }
        .card:hover::after { left: 130%; }
        .card h2 { font-size: 14.5px; margin: 0 0 12px; letter-spacing: 0.05em; }
        .card h2.violet { color: var(--violet-soft); }
        .card h2.cyan { color: var(--cyan); }
        .card p { color: #c8c7d6; font-size: 14px; line-height: 1.65; margin: 0 0 10px; }
        .chip-row { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 12px; }
        .chip {
          font-family: 'JetBrains Mono', monospace; font-size: 11px; padding: 4px 9px;
          border-radius: 6px; background: #ffffff08; border: 1px solid var(--border); color: var(--text-dim);
          transition: all 0.15s;
        }
        .chip:hover { border-color: #a855f755; color: var(--text); }
        .social-row { display: flex; gap: 10px; margin-top: 16px; flex-wrap: wrap; }
        .social-btn {
          width: 36px; height: 36px; border-radius: 9px; background: #ffffff07; border: 1px solid var(--border);
          display: flex; align-items: center; justify-content: center; color: var(--text-dim); text-decoration: none;
          transition: all 0.18s;
        }
        .social-btn:hover { color: white; border-color: #a855f766; background: #a855f71c; transform: translateY(-2px) scale(1.05); box-shadow: 0 4px 14px #a855f733; }
        .brand-badge { font-size: 11px; font-weight: 600; letter-spacing: 0.02em; }
        @media (max-width: 640px) { .social-btn { width: 44px; height: 44px; } }

        .profile-head { display: flex; align-items: center; gap: 16px; margin-bottom: 14px; }
        .avatar-frame {
          position: relative; width: 80px; height: 80px; border-radius: 50%; flex-shrink: 0;
          padding: 3px; background: linear-gradient(135deg, var(--violet), var(--cyan));
          box-shadow: 0 0 22px #a855f744; transition: transform 0.2s, box-shadow 0.2s;
        }
        .avatar-frame:hover { transform: scale(1.05); box-shadow: 0 0 30px #a855f766; }
        .avatar-inner {
          width: 100%; height: 100%; border-radius: 50%; background: var(--void);
          display: flex; align-items: center; justify-content: center; overflow: hidden; position: relative;
        }
        .avatar-inner img { width: 100%; height: 100%; object-fit: cover; }
        .avatar-placeholder { font-family: 'Space Grotesk', sans-serif; font-size: 27px; font-weight: 600; background: linear-gradient(135deg, var(--violet-soft), var(--cyan)); -webkit-background-clip: text; background-clip: text; color: transparent; }
        .profile-name h3 { margin: 0; font-size: 17px; }
        .profile-name span { color: var(--text-dim); font-size: 12.5px; }
        .status-badge {
          display: inline-flex; align-items: center; gap: 6px; font-family: 'JetBrains Mono', monospace;
          font-size: 11px; color: var(--green); background: #34d39914; border: 1px solid #34d39933;
          padding: 3px 9px; border-radius: 20px; margin-top: 6px;
        }
        .status-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--green); animation: pulse 2s ease-in-out infinite; }

        .stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-top: 16px; }
        @media (max-width: 480px) { .stats-row { grid-template-columns: repeat(2, 1fr); } }
        .stat-box {
          text-align: center; padding: 10px 6px; background: #ffffff05; border: 1px solid var(--border);
          border-radius: 10px; transition: all 0.2s;
        }
        .stat-box:hover { border-color: #a855f755; transform: translateY(-2px); }
        .stat-box svg { color: var(--violet-soft); margin-bottom: 4px; }
        .stat-box .stat-val { font-family: 'Space Grotesk', sans-serif; font-size: 15px; font-weight: 600; }
        .stat-box .stat-label { font-size: 10px; color: var(--text-dim); margin-top: 1px; }

        /* SECTION HERO */
        .section-hero { text-align: center; padding: 22px 10px 24px; }
        .section-hero h2 { font-size: 22px; margin: 8px 0; }
        .section-hero p { color: var(--text-dim); font-size: 14px; max-width: 460px; margin: 0 auto; }

        /* PROJECTS */
        .proj-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        @media (max-width: 720px) { .proj-grid { grid-template-columns: 1fr; } }
        .proj-card {
          background: var(--panel); border: 1px solid var(--border); border-radius: 16px; padding: 20px;
          display: flex; flex-direction: column; gap: 8px; position: relative; overflow: hidden;
          transition: transform 0.22s, border-color 0.22s, box-shadow 0.22s;
          animation: fadeSlideIn 0.4s ease both;
        }
        .proj-card::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
          background: var(--accent-color); z-index: 2;
        }
        .proj-card::after {
          content: ''; position: absolute; top: 0; left: -60%; width: 40%; height: 100%;
          background: linear-gradient(100deg, transparent, #ffffff10, transparent);
          transform: skewX(-20deg); transition: left 0.6s ease; pointer-events: none;
        }
        .proj-card:hover::after { left: 130%; }
        .proj-icon-badge {
          width: 34px; height: 34px; border-radius: 9px; display: flex; align-items: center; justify-content: center;
          background: color-mix(in srgb, var(--accent-color) 18%, transparent); color: var(--accent-color);
          margin-bottom: 2px;
        }
        .proj-card:hover { transform: translateY(-4px); border-color: var(--accent-color); box-shadow: 0 10px 28px -12px var(--accent-color); }
        .proj-top { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-top: 4px; }
        .proj-top h3 { font-size: 15.5px; margin: 0; }
        .proj-tag {
          font-family: 'JetBrains Mono', monospace; font-size: 10.5px; color: var(--accent-color);
          background: color-mix(in srgb, var(--accent-color) 16%, transparent); padding: 2px 8px; border-radius: 5px; white-space: nowrap;
        }
        .proj-card p { color: #c8c7d6; font-size: 13.5px; line-height: 1.55; margin: 0; }
        .proj-link { color: var(--accent-color); font-size: 12.5px; text-decoration: none; display: flex; align-items: center; gap: 5px; margin-top: 4px; width: fit-content; font-weight: 600; }
        .proj-link:hover { text-decoration: underline; }

        /* SUPPORT */
        .support-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 18px; }
        @media (max-width: 720px) { .support-grid { grid-template-columns: 1fr; } }
        .support-card { text-align: center; animation: fadeSlideIn 0.4s ease both; }
        .support-card:hover { transform: translateY(-4px); box-shadow: 0 10px 28px -14px #fb923c66; }
        .support-card .icon-badge {
          width: 44px; height: 44px; border-radius: 12px; background: linear-gradient(135deg, #fb923c2c, #fb923c14); color: var(--ember);
          display: flex; align-items: center; justify-content: center; margin: 0 auto 12px; border: 1px solid #fb923c33;
        }
        .contact-row {
          display: flex; align-items: center; gap: 8px; justify-content: center; font-size: 13.5px;
          color: #c8c7d6; margin-top: 8px; background: #ffffff05; padding: 6px 12px; border-radius: 8px;
        }

        .footer-tag { text-align: center; color: var(--text-dim); font-size: 12px; font-family: 'JetBrains Mono', monospace; padding: 30px 0 10px; opacity: 0.7; }
      `}</style>

      {!booted && <BootScreen onDone={() => setBooted(true)} />}

      <div className="nova-bg" />
      <div className="nova-particles" aria-hidden="true">
        {Array.from({ length: 10 }).map((_, i) => <span key={i} className={`particle p-${i}`} />)}
      </div>
      <div className="nova-glow-follow" />

      <header className="nova-header">
        <div className="nova-brand">
          <NovaMark state={coreState} />
          <div style={{ minWidth: 0 }}>
            <h1 className="nova-display gradient-text logo-mark">NOVA<span className="logo-cursor">_</span></h1>
            <span className="nova-mono header-status"><span className="online-dot"></span>agent · by Shashwat Pandey</span>
          </div>
        </div>
        <nav className="nova-tabs">
          {TABS.map(t => (
            <button key={t.id} className={`nova-tab ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)}>
              {t.label.toUpperCase()}
            </button>
          ))}
        </nav>
      </header>

      <main className="nova-body">
        {tab === "chat" && (
          <div className="chat-shell tab-panel">
            <div className="chat-scroll" ref={scrollRef}>
              {messages.map((m, i) => (
                <div key={i} className={`msg-row ${m.role}`}>
                  <div className={`msg-icon ${m.role}`}>
                    {m.role === "assistant" ? <Sparkles size={14} /> : <User size={14} />}
                  </div>
                  <div className={`msg-bubble ${m.role}`}>
                    {m.typed ? greetingText : renderMessageContent(m.content)}
                  </div>
                </div>
              ))}
              {messages.length === 1 && (
                <div className="empty-suggestions">
                  <button className="suggest-chip" onClick={() => suggestPrompt("Can you help me debug a React useEffect loop?")}>🐛 My useEffect won't stop looping</button>
                  <button className="suggest-chip" onClick={() => suggestPrompt("What has Shashwat built recently?")}>🚀 Flex Shashwat's projects</button>
                  <button className="suggest-chip" onClick={() => suggestPrompt("Explain how JWT auth works, simply")}>🔐 JWT auth, explain like I'm 5</button>
                </div>
              )}
              {loading && (
                <div className="msg-row assistant">
                  <div className="msg-icon assistant"><Sparkles size={14} /></div>
                  <div className="msg-bubble assistant">
                    <div className="typing-dots"><span></span><span></span><span></span></div>
                  </div>
                </div>
              )}
            </div>
            <div className="chat-input-row">
              <textarea
                ref={textareaRef}
                rows={1}
                placeholder="Ask Nova anything — code, projects, whatever's on your mind"
                value={input}
                onChange={e => { setInput(e.target.value); autoGrow(); }}
                onKeyDown={handleKeyDown}
              />
              <button className="chat-send" onClick={sendMessage} disabled={loading || !input.trim()}>
                <Send size={16} />
              </button>
            </div>
          </div>
        )}

        {tab === "about" && (
          <div className="tab-panel">
            <p className="eyebrow" style={{ textAlign: "center" }}>// nova.about()</p>
            <div className="about-grid">
              <div className="card">
                <div className="profile-head">
                  <div className="avatar-frame">
                    <div className="avatar-inner">
                      {photo ? <img src={photo} alt="Shashwat Pandey" /> : <span className="avatar-placeholder">SP</span>}
                    </div>
                  </div>
                  <div className="profile-name">
                    <h3 className="nova-display">Shashwat Pandey</h3>
                    <span>Ships code, ships questions to the debugger · Satna, MP</span>
                    <div><span className="status-badge"><span className="status-dot"></span> Open to internships</span></div>
                  </div>
                </div>
                <h2 className="violet">ABOUT SHASHWAT</h2>
                <p>Full-stack developer, professional stack-trace whisperer, and co-founder of ChitrakootDhamTour, a live spiritual tourism booking platform. BCA graduate from Sadguru Institute of Computer Studies (MCU, Bhopal), who's learned most of what he knows from 2 AM bugs that turned out to be a missing semicolon.</p>
                <p>Has shipped a college admissions portal, a gym app, and a booking platform — mostly solo, mostly fuelled by chai. Currently on the hunt for a software/web dev internship, if you're hiring or just want to talk shop.</p>
                <div className="stats-row">
                  {STATS.map(s => (
                    <div className="stat-box" key={s.label}>
                      <s.icon size={16} />
                      <div className="stat-val nova-display">{s.value}</div>
                      <div className="stat-label">{s.label}</div>
                    </div>
                  ))}
                </div>
                <div className="chip-row">
                  <span className="chip">PHP</span><span className="chip">MySQL</span><span className="chip">React</span>
                  <span className="chip">React Native</span><span className="chip">Node.js</span><span className="chip">Firebase</span>
                </div>
                <div className="social-row">
                  <a className="social-btn" href="https://instagram.com/dev_yashh" target="_blank" rel="noreferrer"><BrandBadge label="IG" /></a>
                  <a className="social-btn" href="https://wa.me/917024487353" target="_blank" rel="noreferrer"><MessageCircle size={16} /></a>
                  <a className="social-btn" href="mailto:shashwat565b@gmail.com"><Mail size={16} /></a>
                </div>
              </div>
              <div className="card">
                <h2 className="cyan">ABOUT NOVA</h2>
                <p>Nova is the resident AI here — equal parts rubber duck, tour guide, and hype man. Ask it to debug your code, explain something confusing, or brag about Shashwat's projects on his behalf (it's happy to, no bribe required).</p>
                <p>It doesn't just answer questions — it has opinions about your code, reacts to what you say, and will absolutely roast a bad variable name if you give it the opening. Think less "corporate AI assistant," more "the one coworker who's actually fun to debug with."</p>
                <p>Built specifically for this site, wired into a serverless backend, and improved in small bursts every time Shashwat gets an idea at 1 AM. It forgets every conversation the moment you close the tab (goldfish energy, permanent memory is on the roadmap), and has zero patience for unclosed brackets.</p>
                <div className="stats-row">
                  <div className="stat-box"><Zap size={16} /><div className="stat-val nova-display">Fast</div><div className="stat-label">response speed</div></div>
                  <div className="stat-box"><Bug size={16} /><div className="stat-val nova-display">Low</div><div className="stat-label">bug tolerance</div></div>
                  <div className="stat-box"><Sparkles size={16} /><div className="stat-val nova-display">High</div><div className="stat-label">sass level</div></div>
                  <div className="stat-box"><Moon size={16} /><div className="stat-val nova-display">0</div><div className="stat-label">memory (for now)</div></div>
                </div>
                <div className="chip-row">
                  <span className="chip">Google Gemini</span><span className="chip">Vercel Functions</span><span className="chip">React</span><span className="chip">Nano Banana</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "projects" && (
          <div className="tab-panel">
            <div className="section-hero">
              <p className="eyebrow" style={{ textAlign: "center" }}>// nova.projects.list()</p>
              <h2 className="nova-display">Things that exist because of late nights</h2>
              <p>A few builds worth bragging about. Click around, poke the live one.</p>
            </div>
            <div className="proj-grid">
              {PROJECTS.map((p, i) => (
                <div className="proj-card" key={p.name} style={{ "--accent-color": `var(--${p.accent})`, animationDelay: `${i * 0.08}s` }}>
                  <div className="proj-icon-badge"><p.icon size={17} /></div>
                  <div className="proj-top">
                    <h3 className="nova-display">{p.name}</h3>
                    <span className="proj-tag">{p.tag}</span>
                  </div>
                  <p>{p.desc}</p>
                  <div className="chip-row">
                    {p.stack.map(s => <span className="chip" key={s}>{s}</span>)}
                  </div>
                  {p.link && (
                    <a className="proj-link" href={p.link} target="_blank" rel="noreferrer">
                      Visit <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "support" && (
          <div className="tab-panel">
            <div className="section-hero">
              <Rocket size={26} color="var(--ember)" />
              <h2 className="nova-display">Keep the chai fund alive</h2>
              <p>Everything here — Nova included — is one person, a laptop, and a questionable sleep schedule. If something on this site was useful, here's how to say thanks.</p>
            </div>
            <div className="support-grid">
              <div className="card support-card">
                <div className="icon-badge"><Coffee size={18} /></div>
                <h2>BUY A CHAI</h2>
                <p>Send it straight via UPI — every chai funds another late-night build.</p>
                <div className="contact-row nova-mono">7024487353@airtel <CopyButton text="7024487353@airtel" small /></div>
              </div>
              <div className="card support-card" style={{ animationDelay: "0.08s" }}>
                <div className="icon-badge"><Heart size={18} /></div>
                <h2>HIRE / COLLABORATE</h2>
                <p>Or skip the chai and just hire the guy. Open to internships and freelance web/app work.</p>
                <div className="contact-row"><Mail size={13} /> shashwat565b@gmail.com <CopyButton text="shashwat565b@gmail.com" small /></div>
                <div className="contact-row"><Phone size={13} /> +91 70244 87353 <CopyButton text="+917024487353" small /></div>
              </div>
            </div>
          </div>
        )}

        {tab !== "chat" && <div className="footer-tag">built with chai, react, and mild sleep deprivation ⚡</div>}
      </main>

      <nav className="nova-bottom-nav">
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.id} className={`bn-btn ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)}>
              <Icon size={18} />
              {t.label}
            </button>
          );
        })}
      </nav>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
