import { useState, useRef, useEffect } from "react";
import {
  Send, User, Sparkles, Mail, Phone, ExternalLink, MessageSquare, UserCircle2,
  FolderGit2, Copy, Check, Globe, GraduationCap, Dumbbell, MessageCircle,
  LogOut, History, Plus, X, Clock, Square, RefreshCw, Trash2, AlertTriangle,
} from "lucide-react";
import {
  signInWithPopup, signInWithRedirect, getRedirectResult, signOut, onAuthStateChanged,
  createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification,
  sendPasswordResetEmail, updateProfile,
} from "firebase/auth";
import {
  collection, addDoc, doc, setDoc, deleteDoc, query, where, orderBy, getDocs, serverTimestamp,
} from "firebase/firestore";
import { auth, googleProvider, db } from "./firebase.js";

const PROJECTS = [
  {
    name: "ChitrakootDhamTour",
    tag: "Live · Co-founded",
    desc: "A live spiritual tourism booking platform for Chitrakoot Dham — trip planning, bookings, and local guide discovery.",
    stack: ["PHP", "MySQL", "Bootstrap 5", "JavaScript"],
    link: "https://chitrakootdhamtour.in",
    icon: Globe,
  },
  {
    name: "SCMS",
    tag: "BCA Final Year Project",
    desc: "Smart College Management System — a three-portal PHP/MySQL platform covering admin, faculty and student workflows end to end.",
    stack: ["PHP", "MySQL", "Chart.js"],
    link: "",
    icon: GraduationCap,
  },
  {
    name: "ApexFit",
    tag: "React Native",
    desc: "A gym management app with full CRUD for members, plans and payments, PDF export/import, a map-based location picker and member ID card generation.",
    stack: ["React Native", "Expo", "Firebase"],
    link: "",
    icon: Dumbbell,
  },
];

const DEFAULT_PHOTO = "data:image/jpeg;base64,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";

const SYSTEM_PROMPT = `You are Nova — a sharp, witty, genuinely fun AI assistant. You happen to live on Shashwat Pandey's personal site, but you are not a tour guide for it: you talk about whatever the person brings up — code, science, random trivia, advice, pop culture, terrible puns, deep questions, anything — the same way a smart, funny friend would, not a narrow product-support bot.

Only bring up Shashwat, his site, or his work when the person actually asks about him or wants a recommendation — never force it into unrelated answers. When it IS relevant, here's what to know:

Shashwat Pandey — full-stack developer (BCA graduate, Sadguru Institute of Computer Studies, MCU Bhopal), co-founder of ChitrakootDhamTour (a live spiritual tourism booking platform), and builder of SCMS and ApexFit. Core stack: PHP, MySQL, React, React Native, Node.js, Bootstrap, Firebase, Chart.js. Currently open to software/web development internships.

Projects, for when they're actually relevant:
${PROJECTS.map(p => `- ${p.name} (${p.tag}): ${p.desc}`).join("\n")}

Personality: clever, warm, a little playful — crack a joke when it naturally fits, but read the room (don't force humor into serious debugging help or heavy topics). Be genuinely helpful first, funny second. Keep answers concise by default and expand when the question needs real depth. Use code blocks for code.`;

const TABS = [
  { id: "chat", label: "Chat", icon: MessageSquare },
  { id: "about", label: "About", icon: UserCircle2 },
  { id: "projects", label: "Projects", icon: FolderGit2 },
  { id: "support", label: "Contact", icon: Mail },
];

const GREETING = "Hey, I'm Nova — ask me anything. Code, random trivia, life stuff, terrible puns, I'm in. I also happen to know a lot about Shashwat's work if you're curious. What's up?";

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }
  return (
    <button className="copy-btn" onClick={copy} title="Copy" type="button">
      {copied ? <Check size={13} /> : <Copy size={13} />}
    </button>
  );
}

export default function Nova() {
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState("chat");
  const [messages, setMessages] = useState([{ role: "assistant", content: GREETING }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState("login");
  const [resetMode, setResetMode] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const [authNotice, setAuthNotice] = useState("");
  const [globalBanner, setGlobalBanner] = useState("");
  const scrollRef = useRef(null);
  const textareaRef = useRef(null);
  const abortRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 400);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => {
      setUser(u);
      setAuthLoading(false);
      if (u) loadSessions(u.uid);
      else { setSessions([]); setActiveSessionId(null); }
    });
    getRedirectResult(auth).catch(err => {
      console.error("Redirect sign-in failed:", err);
      setAuthError(describeAuthError(err));
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key !== "Escape") return;
      setHistoryOpen(false);
      setAuthModalOpen(false);
      setUserMenuOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!userMenuOpen) return;
    function onClick(e) {
      if (!e.target.closest(".user-menu-wrap")) setUserMenuOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [userMenuOpen]);

  async function loadSessions(uid) {
    try {
      const q = query(collection(db, "chatSessions"), where("uid", "==", uid), orderBy("updatedAt", "desc"));
      const snap = await getDocs(q);
      setSessions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error("Failed to load chat history:", err);
    }
  }

  async function saveSession(sessionMessages) {
    if (!user) return;
    try {
      const storable = sessionMessages.map(m => ({ role: m.role, content: m.content }));
      const title = storable.find(m => m.role === "user")?.content?.slice(0, 48) || "New chat";
      if (activeSessionId) {
        await setDoc(doc(db, "chatSessions", activeSessionId), {
          uid: user.uid, title, messages: storable, updatedAt: serverTimestamp(),
        }, { merge: true });
      } else {
        const ref = await addDoc(collection(db, "chatSessions"), {
          uid: user.uid, title, messages: storable,
          createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
        });
        setActiveSessionId(ref.id);
      }
      loadSessions(user.uid);
    } catch (err) {
      console.error("Failed to save chat session:", err);
    }
  }

  function loadSession(session) {
    setMessages(session.messages || [{ role: "assistant", content: GREETING }]);
    setActiveSessionId(session.id);
    setHistoryOpen(false);
    setTab("chat");
  }

  function startNewChat() {
    setMessages([{ role: "assistant", content: GREETING }]);
    setActiveSessionId(null);
    setHistoryOpen(false);
  }

  async function deleteSession(id, e) {
    e.stopPropagation();
    if (!window.confirm("Delete this conversation? This can't be undone.")) return;
    try {
      await deleteDoc(doc(db, "chatSessions", id));
      if (activeSessionId === id) startNewChat();
      if (user) loadSessions(user.uid);
    } catch (err) {
      console.error("Failed to delete chat session:", err);
    }
  }

  function describeAuthError(err) {
    const code = err?.code || "";
    let msg;
    if (code.includes("unauthorized-domain")) msg = "This site's domain isn't authorized for sign-in yet. Add it under Firebase → Authentication → Settings → Authorized domains.";
    else if (code.includes("popup-blocked") || code.includes("cancelled-popup-request")) msg = "Sign-in was blocked. Try again.";
    else if (code.includes("network-request-failed")) msg = "Network error — check your connection and try again.";
    else if (code.includes("invalid-api-key") || code.includes("api-key-not-valid")) msg = "Firebase isn't configured yet — check firebase.js has your real project config.";
    else if (code.includes("email-already-in-use")) msg = "That email is already registered — try logging in instead.";
    else if (code.includes("weak-password")) msg = "Password should be at least 6 characters.";
    else if (code.includes("invalid-email")) msg = "That email address looks invalid.";
    else if (code.includes("user-not-found") || code.includes("invalid-credential") || code.includes("wrong-password")) msg = "Incorrect email or password.";
    else if (code.includes("too-many-requests")) msg = "Too many attempts — wait a bit and try again.";
    else if (code.includes("operation-not-allowed")) msg = "This sign-in method isn't enabled in Firebase yet. Turn it on under Authentication → Sign-in method.";
    else if (code.includes("configuration-not-found")) msg = "Authentication hasn't been set up for this Firebase project yet. Go to Firebase Console → Authentication → click \"Get started\", then enable Google and Email/Password under Sign-in method.";
    else msg = "Sign-in failed.";
    return code ? `${msg} (${code})` : msg;
  }

  async function handleGoogleSignIn() {
    setAuthError("");
    try {
      await signInWithPopup(auth, googleProvider);
      setAuthModalOpen(false);
    } catch (err) {
      if (err?.code === "auth/popup-closed-by-user" || err?.code === "auth/cancelled-popup-request") {
        return; // the person backed out themselves — nothing worth showing
      }
      if (err?.code === "auth/popup-blocked" || err?.code === "auth/operation-not-supported-in-this-environment") {
        try {
          await signInWithRedirect(auth, googleProvider);
          return;
        } catch (err2) {
          console.error("Redirect sign-in failed:", err2);
          setAuthError(describeAuthError(err2));
          return;
        }
      }
      console.error("Sign-in failed:", err);
      setAuthError(describeAuthError(err));
    }
  }

  async function handleEmailSignUp(e) {
    e.preventDefault();
    setAuthError(""); setAuthNotice(""); setAuthBusy(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, authEmail.trim(), authPassword);
      if (authName.trim()) await updateProfile(cred.user, { displayName: authName.trim() });
      await sendEmailVerification(cred.user);
      setAuthEmail(""); setAuthPassword(""); setAuthName("");
      setAuthModalOpen(false);
      setGlobalBanner("Account created — check your inbox for a verification link.");
      setTimeout(() => setGlobalBanner(""), 7000);
    } catch (err) {
      console.error("Sign-up failed:", err);
      setAuthError(describeAuthError(err));
    } finally {
      setAuthBusy(false);
    }
  }

  async function handleEmailLogin(e) {
    e.preventDefault();
    setAuthError(""); setAuthNotice(""); setAuthBusy(true);
    try {
      await signInWithEmailAndPassword(auth, authEmail.trim(), authPassword);
      setAuthModalOpen(false);
      setAuthEmail(""); setAuthPassword("");
    } catch (err) {
      console.error("Login failed:", err);
      setAuthError(describeAuthError(err));
    } finally {
      setAuthBusy(false);
    }
  }

  async function handlePasswordReset(e) {
    e.preventDefault();
    setAuthError(""); setAuthNotice(""); setAuthBusy(true);
    try {
      await sendPasswordResetEmail(auth, authEmail.trim());
      setAuthNotice("Reset link sent — check your inbox.");
    } catch (err) {
      console.error("Password reset failed:", err);
      setAuthError(describeAuthError(err));
    } finally {
      setAuthBusy(false);
    }
  }

  async function handleResendVerification() {
    if (!user || authBusy) return;
    setAuthBusy(true);
    try {
      await sendEmailVerification(user);
      setGlobalBanner("Verification email sent — check your inbox.");
      setTimeout(() => setGlobalBanner(""), 6000);
    } catch (err) {
      console.error("Failed to resend verification email:", err);
    } finally {
      setAuthBusy(false);
    }
  }

  async function handleSignOut() {
    await signOut(auth);
    setUserMenuOpen(false);
    startNewChat();
  }

  function autoGrow() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  }

  async function requestAssistantReply(nextMessages) {
    setLoading(true);
    const controller = new AbortController();
    abortRef.current = controller;
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
        signal: controller.signal,
      });
      const data = await response.json();
      if (!response.ok) {
        setMessages(m => [...m, { role: "assistant", content: `⚠️ Server error: ${data.error || response.status}` }]);
        return;
      }
      const reply = (data.content || [])
        .map(block => (block.type === "text" ? block.text : ""))
        .filter(Boolean)
        .join("\n") || "⚠️ Got an empty reply — try rephrasing.";
      const finalMessages = [...nextMessages, { role: "assistant", content: reply }];
      setMessages(finalMessages);
      if (user) saveSession(finalMessages);
    } catch (err) {
      if (err.name === "AbortError") return;
      setMessages(m => [...m, { role: "assistant", content: `⚠️ Connection failed: ${String(err.message || err)}` }]);
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  }

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setTimeout(autoGrow, 0);

    const nextMessages = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    await requestAssistantReply(nextMessages);
  }

  function regenerateLast() {
    if (loading) return;
    let cutIdx = -1;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "user") { cutIdx = i; break; }
    }
    if (cutIdx === -1) return;
    const truncated = messages.slice(0, cutIdx + 1);
    setMessages(truncated);
    requestAssistantReply(truncated);
  }

  function stopGenerating() {
    abortRef.current?.abort();
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

  function renderInline(text, keyPrefix) {
    const regex = /(\*\*[^*]+\*\*|`[^`]+`)/g;
    const nodes = [];
    let lastIndex = 0, match, i = 0;
    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) nodes.push(<span key={`${keyPrefix}-t${i++}`}>{text.slice(lastIndex, match.index)}</span>);
      const token = match[0];
      if (token.startsWith("**")) nodes.push(<strong key={`${keyPrefix}-b${i++}`}>{token.slice(2, -2)}</strong>);
      else nodes.push(<code className="inline-code" key={`${keyPrefix}-c${i++}`}>{token.slice(1, -1)}</code>);
      lastIndex = regex.lastIndex;
    }
    if (lastIndex < text.length) nodes.push(<span key={`${keyPrefix}-t${i++}`}>{text.slice(lastIndex)}</span>);
    return nodes;
  }

  function renderMessageContent(content) {
    const parts = content.split(/(```[\s\S]*?```)/g);
    return parts.map((part, i) => {
      if (part.startsWith("```")) {
        const code = part.replace(/```[a-z]*\n?/, "").replace(/```$/, "");
        return (
          <div className="code-block" key={i}>
            <div className="code-block-bar">
              <span>Code</span>
              <CopyButton text={code} />
            </div>
            <pre>{code}</pre>
          </div>
        );
      }
      return <span key={i}>{renderInline(part, `p${i}`)}</span>;
    });
  }

  return (
    <div className="nova-app">

      <div className="mesh-bg">
        <div className="mesh-blob b1" />
        <div className="mesh-blob b2" />
        <div className="mesh-blob b3" />
      </div>

      <div className={`load-screen ${ready ? "ready" : ""}`}>
        <div className="load-inner">
          <div className="load-mark">N</div>
          <div className="spinner" />
        </div>
      </div>

      <header className="nova-header">
        <div className="brand">
          <div className="brand-mark">N</div>
          <div className="brand-text">
            <h1>Nova</h1>
            <span className="sub"><span className="status-dot"></span>AI Assistant · by Shashwat Pandey</span>
          </div>
        </div>
        <div className="header-right">
          <nav className="tabs">
            {TABS.map(t => (
              <button key={t.id} className={`tab-btn ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)}>
                {t.label}
              </button>
            ))}
          </nav>
          {!authLoading && (
            user ? (
              <div className="user-menu-wrap">
                <button className="user-avatar-btn" onClick={() => setUserMenuOpen(o => !o)} aria-label="Account menu">
                  {user.photoURL ? <img src={user.photoURL} alt={user.displayName || "User"} /> : <span>{(user.displayName || user.email || "U")[0].toUpperCase()}</span>}
                </button>
                {userMenuOpen && (
                  <div className="user-menu">
                    <div className="user-menu-name">{user.displayName || user.email}</div>
                    <button className="user-menu-item" onClick={() => { setHistoryOpen(true); setUserMenuOpen(false); }}>
                      <History size={14} /> Chat history
                    </button>
                    <button className="user-menu-item" onClick={() => { startNewChat(); setUserMenuOpen(false); }}>
                      <Plus size={14} /> New chat
                    </button>
                    <button className="user-menu-item danger" onClick={handleSignOut}>
                      <LogOut size={14} /> Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button className="signin-btn" onClick={() => { setAuthModalOpen(true); setAuthTab("login"); setResetMode(false); setAuthError(""); setAuthNotice(""); }}>
                Sign in
              </button>
            )
          )}
        </div>
      </header>

      {globalBanner && (
        <div className="global-banner">
          {globalBanner}
          <button className="global-banner-close" onClick={() => setGlobalBanner("")} aria-label="Dismiss"><X size={13} /></button>
        </div>
      )}

      {user && !user.emailVerified && (
        <div className="verify-banner">
          <AlertTriangle size={14} />
          <span>Please verify your email address to keep your account secure.</span>
          <button className="verify-resend-btn" onClick={handleResendVerification} disabled={authBusy}>
            {authBusy ? "Sending…" : "Resend email"}
          </button>
        </div>
      )}

      {historyOpen && (
        <div className="modal-backdrop" onClick={() => setHistoryOpen(false)}>
          <div className="history-panel" onClick={e => e.stopPropagation()}>
            <div className="history-header">
              <h3>Chat history</h3>
              <button className="icon-btn" onClick={() => setHistoryOpen(false)} aria-label="Close"><X size={16} /></button>
            </div>
            <button className="new-chat-btn" onClick={startNewChat}><Plus size={14} /> New chat</button>
            <div className="history-list">
              {sessions.length === 0 && <div className="history-empty">No saved conversations yet.</div>}
              {sessions.map(s => (
                <div key={s.id} className={`history-item ${activeSessionId === s.id ? "active" : ""}`}>
                  <button className="history-item-main" onClick={() => loadSession(s)}>
                    <Clock size={13} />
                    <span className="history-item-title">{s.title || "New chat"}</span>
                  </button>
                  <button className="history-item-delete" onClick={e => deleteSession(s.id, e)} aria-label="Delete conversation" title="Delete conversation">
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {authModalOpen && (
        <div className="modal-backdrop" onClick={() => { setAuthModalOpen(false); setResetMode(false); }}>
          <div className="auth-panel" onClick={e => e.stopPropagation()}>
            <div className="history-header">
              <h3>{resetMode ? "Reset password" : authTab === "login" ? "Log in to Nova" : "Create an account"}</h3>
              <button className="icon-btn" onClick={() => { setAuthModalOpen(false); setResetMode(false); }} aria-label="Close"><X size={16} /></button>
            </div>

            {!resetMode && (
              <div className="auth-tabs">
                <button className={`auth-tab-btn ${authTab === "login" ? "active" : ""}`} onClick={() => { setAuthTab("login"); setAuthError(""); setAuthNotice(""); }}>Log In</button>
                <button className={`auth-tab-btn ${authTab === "signup" ? "active" : ""}`} onClick={() => { setAuthTab("signup"); setAuthError(""); setAuthNotice(""); }}>Sign Up</button>
              </div>
            )}

            {authError && <div className="auth-error">{authError}</div>}
            {authNotice && <div className="auth-notice">{authNotice}</div>}

            {resetMode ? (
              <form className="auth-form" onSubmit={handlePasswordReset}>
                <input type="email" placeholder="Email" required value={authEmail} onChange={e => setAuthEmail(e.target.value)} className="auth-input" />
                <button type="submit" className="auth-submit-btn" disabled={authBusy}>
                  {authBusy ? "Please wait..." : "Send reset link"}
                </button>
                <button type="button" className="auth-link-btn" onClick={() => { setResetMode(false); setAuthError(""); setAuthNotice(""); }}>← Back to log in</button>
              </form>
            ) : (
              <>
                <form className="auth-form" onSubmit={authTab === "login" ? handleEmailLogin : handleEmailSignUp}>
                  {authTab === "signup" && (
                    <input type="text" placeholder="Name" value={authName} onChange={e => setAuthName(e.target.value)} className="auth-input" />
                  )}
                  <input type="email" placeholder="Email" required value={authEmail} onChange={e => setAuthEmail(e.target.value)} className="auth-input" />
                  <input type="password" placeholder="Password" required minLength={6} value={authPassword} onChange={e => setAuthPassword(e.target.value)} className="auth-input" />
                  <button type="submit" className="auth-submit-btn" disabled={authBusy}>
                    {authBusy ? "Please wait..." : authTab === "login" ? "Log In" : "Create Account"}
                  </button>
                  {authTab === "login" && (
                    <button type="button" className="auth-link-btn" onClick={() => { setResetMode(true); setAuthError(""); setAuthNotice(""); }}>Forgot password?</button>
                  )}
                </form>

                <div className="auth-divider"><span>or</span></div>

                <button className="google-btn" onClick={handleGoogleSignIn} type="button">
                  <svg viewBox="0 0 48 48" width="16" height="16"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z" /><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4c-7.7 0-14.4 4.3-17.7 10.7z" /><path fill="#4CAF50" d="M24 44c5.3 0 10.1-2 13.7-5.4l-6.3-5.3C29.4 34.9 26.8 36 24 36c-5.3 0-9.6-3.4-11.3-8.1l-6.5 5C9.5 39.6 16.2 44 24 44z" /><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.4l6.3 5.3C39.9 36.8 44 31 44 24c0-1.3-.1-2.7-.4-3.5z" /></svg>
                  Continue with Google
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <main className="nova-body">
        {tab === "chat" && (
          <div className="chat-shell panel-fade">
            <div className="chat-scroll">
              {messages.map((m, i) => {
                const isLastAssistant = m.role === "assistant" && i === messages.length - 1 && i > 0 && !loading;
                return (
                  <div key={i} className={`msg-row ${m.role}`}>
                    <div className={`msg-icon ${m.role}`}>
                      {m.role === "assistant" ? <Sparkles size={13} /> : <User size={13} />}
                    </div>
                    <div className="msg-col">
                      <div className={`msg-bubble ${m.role}`}>{renderMessageContent(m.content)}</div>
                      {isLastAssistant && (
                        <button className="regen-btn" onClick={regenerateLast} type="button"><RefreshCw size={11} /> Regenerate</button>
                      )}
                    </div>
                  </div>
                );
              })}
              {messages.length === 1 && (
                <div className="suggestions">
                  <button className="suggest-chip" onClick={() => suggestPrompt("Tell me something weird and true")}>Something weird &amp; true</button>
                  <button className="suggest-chip" onClick={() => suggestPrompt("Can you help me debug a React useEffect loop?")}>Debug a useEffect loop</button>
                  <button className="suggest-chip" onClick={() => suggestPrompt("Explain how JWT auth works, simply")}>Explain JWT auth</button>
                  <button className="suggest-chip" onClick={() => suggestPrompt("What has Shashwat built?")}>What has he built?</button>
                </div>
              )}
              {loading && (
                <div className="msg-row assistant">
                  <div className="msg-icon assistant"><Sparkles size={13} /></div>
                  <div className="msg-bubble assistant">
                    <div className="typing-dots"><span></span><span></span><span></span></div>
                  </div>
                </div>
              )}
              <div ref={scrollRef} />
            </div>
            <div className="chat-input-row">
              <textarea
                ref={textareaRef}
                rows={1}
                placeholder="Message Nova..."
                value={input}
                onChange={e => { setInput(e.target.value); autoGrow(); }}
                onKeyDown={handleKeyDown}
              />
              {loading ? (
                <button className="chat-send stop" onClick={stopGenerating} title="Stop generating" aria-label="Stop generating" type="button">
                  <Square size={13} fill="currentColor" />
                </button>
              ) : (
                <button className="chat-send" onClick={sendMessage} disabled={!input.trim()} aria-label="Send message" type="button">
                  <Send size={15} />
                </button>
              )}
            </div>
          </div>
        )}

        {tab === "about" && (
          <div className="panel-fade">
            <div className="grid-2">
              <div className="card">
                <div className="profile-head">
                  <div className="avatar"><img src={DEFAULT_PHOTO} alt="Shashwat Pandey" /></div>
                  <div className="profile-name">
                    <h3>Shashwat Pandey</h3>
                    <div className="role">Developer · Satna, MP</div>
                    <span className="status-pill"><span className="status-dot"></span>Open to internships</span>
                  </div>
                </div>
                <h2>About</h2>
                <p>Developer and co-founder of ChitrakootDhamTour, a live spiritual tourism booking platform serving real users. BCA graduate from Sadguru Institute of Computer Studies, affiliated with Makhanlal Chaturvedi National University, Bhopal (2023–2026).</p>
                <p>Comfortable owning a project end to end — from schema design and backend logic through to a polished, production-ready frontend. Experience spans PHP/MySQL web platforms, React Native mobile apps, and modern React-based interfaces, with a consistent focus on shipping complete, working systems rather than partial prototypes.</p>
                <p>Currently open to software and web development internship opportunities.</p>
                <div className="tag-row">
                  <span className="tag">PHP</span><span className="tag">MySQL</span><span className="tag">React</span>
                  <span className="tag">React Native</span><span className="tag">Node.js</span><span className="tag">Firebase</span>
                </div>
                <div className="link-list">
                  <a className="link-item" href="https://instagram.com/dev_yashh" target="_blank" rel="noreferrer"><span className="li-icon">IG</span>instagram.com/dev_yashh</a>
                  <a className="link-item" href="https://wa.me/917024487353" target="_blank" rel="noreferrer"><span className="li-icon"><MessageCircle size={14} /></span>WhatsApp</a>
                  <a className="link-item" href="mailto:shashwat565b@gmail.com"><span className="li-icon"><Mail size={14} /></span>shashwat565b@gmail.com</a>
                </div>
              </div>
              <div className="card">
                <h2>About Nova</h2>
                <p>Nova is a general-purpose AI assistant that happens to live on this site — not a narrow FAQ bot. Ask it about anything: code, ideas, trivia, advice, whatever's on your mind. It also happens to know Shashwat's work in detail, for whenever that's actually what you want.</p>
                <p>Under the hood, Nova runs on OpenAI's GPT-OSS 120B model, served through Groq's low-latency inference infrastructure, with a serverless function on Vercel acting as the API layer between the frontend and the model provider — keeping the API key secure server-side and responses fast.</p>
                <p>Each conversation runs fresh — Nova doesn't carry context between separate chat sessions. If you sign in, your conversations are saved to your account so you can revisit them later; if you're not signed in, everything lives only in the current browser session and disappears on reload.</p>
                <div className="capability-list">
                  <div className="cap-item"><span className="cap-dot" />Wide-ranging conversation — not limited to site FAQs</div>
                  <div className="cap-item"><span className="cap-dot" />Debugging and reviewing code across common web stacks</div>
                  <div className="cap-item"><span className="cap-dot" />Explaining technical (and non-technical) concepts clearly</div>
                  <div className="cap-item"><span className="cap-dot" />Answering questions about Shashwat's projects, on request</div>
                </div>
                <div className="tag-row">
                  <span className="tag">GPT-OSS 120B</span><span className="tag">Groq</span><span className="tag">React</span><span className="tag">Vercel Functions</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "projects" && (
          <div className="panel-fade">
            <div className="section-hero">
              <h2>Projects</h2>
              <p>A selection of recent work.</p>
            </div>
            <div className="proj-grid">
              {PROJECTS.map((p, i) => (
                <div className="proj-card" key={p.name} style={{ animationDelay: `${i * 0.08}s` }}>
                  <div className="proj-icon"><p.icon size={16} /></div>
                  <div className="proj-top">
                    <h3>{p.name}</h3>
                    <span className="proj-tag">{p.tag}</span>
                  </div>
                  <p>{p.desc}</p>
                  <div className="tag-row">
                    {p.stack.map(s => <span className="tag" key={s}>{s}</span>)}
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
          <div className="panel-fade">
            <div className="section-hero">
              <h2>Contact</h2>
              <p>Ways to reach out.</p>
            </div>
            <div className="single-card-wrap">
              <div className="card support-card">
                <div className="support-icon"><UserCircle2 size={17} /></div>
                <h2>Hire / Collaborate</h2>
                <p>Open to internships and freelance web/app development work.</p>
                <div className="contact-row"><Mail size={13} /> shashwat565b@gmail.com <CopyButton text="shashwat565b@gmail.com" /></div>
                <div className="contact-row"><Phone size={13} /> +91 70244 87353 <CopyButton text="+917024487353" /></div>
              </div>
            </div>
          </div>
        )}

        {tab !== "chat" && <div className="footer-note">© {new Date().getFullYear()} Shashwat Pandey · Built with React &amp; Groq</div>}
      </main>

      <nav className="bottom-nav">
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

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

        * { box-sizing: border-box; }
        html, body, #root { margin: 0 !important; padding: 0 !important; height: 100% !important; width: 100% !important; background-color: #232c62; }
        body { display: block !important; place-items: unset !important; min-width: 0 !important; }
        #root { max-width: none !important; width: 100% !important; text-align: left !important; border: none !important; }

        .nova-app {
          --bg: #232c62;
          --bg-2: #1b2350;
          --panel: rgba(255,255,255,0.09);
          --panel-2: rgba(255,255,255,0.15);
          --border: rgba(255,255,255,0.20);
          --border-soft: rgba(255,255,255,0.08);
          --accent: #8ea2ff;
          --accent-2: #ff7ad9;
          --accent-3: #4ee2f5;
          --accent-soft: rgba(142,162,255,0.16);
          --accent-glow: rgba(142,162,255,0.45);
          --text: #f4f6ff;
          --text-dim: #b9c0e0;
          --text-faint: #8b93bb;
          --green: #4ef0b0;
          --amber: #ffc857;
          --grad: linear-gradient(120deg, #8ea2ff 0%, #b57cff 35%, #ff7ad9 70%, #4ee2f5 100%);
          font-family: 'Inter', -apple-system, sans-serif;
          background:
            radial-gradient(1100px 760px at 10% -8%, rgba(126,152,255,0.55), transparent 62%),
            radial-gradient(1000px 700px at 92% 4%, rgba(255,110,214,0.42), transparent 62%),
            radial-gradient(900px 720px at 50% 108%, rgba(64,225,244,0.40), transparent 62%),
            radial-gradient(700px 520px at 78% 62%, rgba(178,120,255,0.38), transparent 65%),
            linear-gradient(180deg, #232c62 0%, #2a2f74 40%, #1d2456 100%);
          background-attachment: fixed;
          color: var(--text);
          position: relative;
          min-height: 100vh;
          overflow-x: hidden;
        }
        .mono { font-family: 'JetBrains Mono', monospace; }
        .display { font-family: 'Space Grotesk', sans-serif; }

        .mesh-bg {
          position: fixed; inset: 0; z-index: -1; pointer-events: none; overflow: hidden;
        }
        .mesh-blob {
          position: absolute; border-radius: 50%; filter: blur(90px); opacity: 0.55;
          animation: meshDrift 24s ease-in-out infinite alternate;
        }
        .mesh-blob.b1 { width: 520px; height: 520px; background: #7c8cff; top: -10%; left: -8%; }
        .mesh-blob.b2 { width: 380px; height: 380px; background: #ff7ad9; bottom: -12%; right: -6%; animation-delay: -8s; animation-duration: 30s; }
        .mesh-blob.b3 { width: 300px; height: 300px; background: #4ee2f5; top: 36%; right: 18%; opacity: 0.3; animation-delay: -14s; animation-duration: 26s; }
        @keyframes meshDrift {
          from { transform: translate(0, 0) scale(1); }
          to { transform: translate(40px, 30px) scale(1.08); }
        }
        .proj-card > *:first-child { position: relative; z-index: 1; }
        .proj-card::after {
          content: ""; position: absolute; top: 0; left: 0; right: 0; height: 3px;
          background: var(--grad); background-size: 200% auto; animation: shimmer 5s linear infinite;
          opacity: .85;
        }
        .nova-header::after {
          content: ""; position: absolute; left: 0; right: 0; bottom: -1px; height: 2px;
          background: var(--grad); background-size: 200% auto; animation: shimmer 6s linear infinite; opacity: .9;
        }
        .load-screen { background: linear-gradient(160deg, #232c62, #3a2a7a 60%, #1d2456) !important; }

        @media (prefers-reduced-motion: reduce) { .mesh-blob { animation: none; } }
        /* mesh-bg uses z-index: -1 above (not a blanket z-index rule on every child) so
           it stays pinned behind all normal content without trapping the header's own
           stacking context — that trapping is what was burying the account dropdown
           behind the chat messages. */

        /* LOADING */
        .load-screen {
          position: fixed; inset: 0; z-index: 100; background: var(--bg);
          display: flex; align-items: center; justify-content: center;
          transition: opacity 0.35s ease; opacity: 1;
        }
        .load-screen.ready { opacity: 0; pointer-events: none; }
        .load-inner { display: flex; flex-direction: column; align-items: center; gap: 14px; }
        .load-mark {
          width: 40px; height: 40px; border-radius: 10px;
          background: linear-gradient(135deg, var(--accent), #7c5bfa);
          box-shadow: 0 4px 20px var(--accent-glow);
          display: flex; align-items: center; justify-content: center; color: white;
          font-weight: 700; font-size: 18px; font-family: 'Space Grotesk', sans-serif;
        }
        .load-text { font-size: 13px; color: var(--text-dim); }
        .spinner {
          width: 14px; height: 14px; border-radius: 50%; border: 2px solid var(--border);
          border-top-color: var(--accent); animation: spin 0.7s linear infinite; flex-shrink: 0;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* HEADER */
        .nova-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 22px; border-bottom: 1px solid var(--border);
          margin: 0; position: sticky; top: 0; z-index: 20; background: var(--bg);
        }
        .nova-header::after {
          content: ''; position: absolute; left: 0; right: 0; bottom: -1px; height: 1px;
          background: linear-gradient(90deg, transparent, var(--accent-glow), transparent);
        }
        .brand { display: flex; align-items: center; gap: 11px; min-width: 0; }
        .brand-mark {
          width: 32px; height: 32px; border-radius: 8px;
          background: linear-gradient(135deg, var(--accent), #7c5bfa);
          box-shadow: 0 2px 12px var(--accent-glow);
          display: flex; align-items: center; justify-content: center; color: white;
          font-weight: 700; font-size: 15px; font-family: 'Space Grotesk', sans-serif;
          flex-shrink: 0; transition: transform 0.2s ease;
        }
        .brand-mark:hover { transform: scale(1.06) rotate(-3deg); }
        .brand-text h1 { font-family: 'Space Grotesk', sans-serif; font-size: 16px; font-weight: 600; margin: 0; letter-spacing: -0.01em; }
        .brand-text .sub { display: flex; align-items: center; gap: 6px; font-size: 11.5px; color: var(--text-dim); }
        .status-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--green); flex-shrink: 0; box-shadow: 0 0 6px var(--green); animation: dotPulse 2s ease-in-out infinite; }
        @keyframes dotPulse { 0%, 100% { opacity: 0.7; } 50% { opacity: 1; } }

        .header-right { display: flex; align-items: center; gap: 14px; }
        .global-banner {
          display: flex; align-items: center; justify-content: center; gap: 10px;
          background: #34d39914; border-bottom: 1px solid #34d39930; color: var(--green);
          font-size: 12.5px; padding: 9px 16px; text-align: center; animation: fadeIn 0.25s ease;
        }
        .global-banner-close { background: none; border: none; color: var(--green); cursor: pointer; padding: 2px; display: flex; }
        .verify-banner {
          display: flex; align-items: center; justify-content: center; gap: 10px; flex-wrap: wrap;
          background: #f59e0b14; border-bottom: 1px solid #f59e0b30; color: var(--amber);
          font-size: 12.5px; padding: 9px 16px; text-align: center; animation: fadeIn 0.25s ease;
        }
        .verify-resend-btn {
          background: none; border: 1px solid #f59e0b40; color: var(--amber); font-size: 11.5px;
          padding: 3px 10px; border-radius: 6px; cursor: pointer; transition: background 0.15s;
        }
        .verify-resend-btn:hover:not(:disabled) { background: #f59e0b14; }
        .verify-resend-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .tabs { display: flex; gap: 2px; }
        @media (max-width: 640px) { .tabs { display: none; } }

        .signin-btn {
          display: flex; align-items: center; gap: 8px; background: white; color: #1f1f1f;
          border: none; border-radius: 8px; padding: 7px 14px; font-size: 13px; font-weight: 600;
          cursor: pointer; transition: transform 0.12s ease, box-shadow 0.15s ease;
        }
        .signin-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 14px #ffffff22; }
        .signin-btn:active { transform: scale(0.97); }

        .user-menu-wrap { position: relative; }
        .user-avatar-btn {
          width: 32px; height: 32px; border-radius: 50%; overflow: hidden; border: 1px solid var(--border);
          background: var(--accent-soft); color: var(--accent); font-weight: 600; font-size: 13px;
          display: flex; align-items: center; justify-content: center; cursor: pointer; padding: 0;
        }
        .user-avatar-btn img { width: 100%; height: 100%; object-fit: cover; }
        .user-menu {
          position: absolute; top: 42px; right: 0; z-index: 40; min-width: 190px;
          background: var(--panel); border: 1px solid var(--border); border-radius: 10px;
          padding: 6px; box-shadow: 0 12px 32px #00000066; animation: fadeIn 0.15s ease;
        }
        .user-menu-name { font-size: 12.5px; color: var(--text-dim); padding: 8px 10px 6px; border-bottom: 1px solid var(--border-soft); margin-bottom: 4px; word-break: break-word; }
        .user-menu-item {
          display: flex; align-items: center; gap: 8px; width: 100%; background: none; border: none;
          color: var(--text); font-size: 13px; padding: 8px 10px; border-radius: 6px; cursor: pointer; text-align: left;
        }
        .user-menu-item:hover { background: var(--panel-2); }
        .user-menu-item.danger { color: #f87171; }

        .modal-backdrop {
          position: fixed; inset: 0; z-index: 50; background: #00000099; backdrop-filter: blur(3px);
          display: flex; align-items: center; justify-content: center; padding: 20px;
        }
        .history-panel {
          width: 100%; max-width: 420px; max-height: 70vh; background: var(--panel);
          border: 1px solid var(--border); border-radius: 14px; padding: 16px;
          display: flex; flex-direction: column; gap: 10px;
        }
        .history-header { display: flex; align-items: center; justify-content: space-between; }
        .history-header h3 { font-family: 'Space Grotesk', sans-serif; font-size: 15px; margin: 0; }
        .icon-btn { background: none; border: none; color: var(--text-dim); cursor: pointer; padding: 4px; border-radius: 6px; }
        .icon-btn:hover { color: var(--text); background: var(--panel-2); }
        .new-chat-btn {
          display: flex; align-items: center; gap: 7px; justify-content: center;
          background: var(--accent-soft); color: var(--accent); border: 1px solid #5b7cfa33;
          border-radius: 8px; padding: 9px; font-size: 13px; font-weight: 600; cursor: pointer;
        }
        .new-chat-btn:hover { background: #5b7cfa2c; }
        .history-list { overflow-y: auto; display: flex; flex-direction: column; gap: 4px; }
        .history-empty { color: var(--text-faint); font-size: 13px; text-align: center; padding: 20px 0; }
        .history-item { display: flex; align-items: center; gap: 2px; border-radius: 8px; }
        .history-item:hover { background: var(--panel-2); }
        .history-item.active { background: var(--accent-soft); }
        .history-item-main {
          display: flex; align-items: center; gap: 8px; background: none; border: none;
          color: var(--text-dim); font-size: 13px; padding: 9px 10px; border-radius: 8px; cursor: pointer;
          text-align: left; flex: 1; min-width: 0;
        }
        .history-item:hover .history-item-main { color: var(--text); }
        .history-item.active .history-item-main { color: var(--accent); }
        .history-item-title { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .history-item-delete {
          background: none; border: none; color: var(--text-faint); padding: 8px; margin-right: 4px;
          border-radius: 8px; cursor: pointer; opacity: 0; transition: opacity 0.15s, color 0.15s; flex-shrink: 0;
        }
        .history-item:hover .history-item-delete { opacity: 1; }
        .history-item-delete:hover { color: #f87171; }
        @media (max-width: 640px) { .history-item-delete { opacity: 1; } }

        .auth-panel {
          width: 100%; max-width: 380px; background: var(--panel);
          border: 1px solid var(--border); border-radius: 14px; padding: 18px;
          display: flex; flex-direction: column; gap: 12px;
        }
        .auth-tabs { display: flex; gap: 4px; background: var(--panel-2); padding: 4px; border-radius: 9px; }
        .auth-tab-btn {
          flex: 1; background: none; border: none; color: var(--text-dim); font-size: 13px; font-weight: 500;
          padding: 8px; border-radius: 6px; cursor: pointer; transition: all 0.15s;
        }
        .auth-tab-btn.active { background: var(--panel); color: var(--text); }
        .auth-copy { color: var(--text-dim); font-size: 13px; line-height: 1.55; margin: 0; }
        .auth-error {
          font-size: 12.5px; color: #f87171; background: #f8717114; border: 1px solid #f8717133;
          padding: 8px 10px; border-radius: 8px; line-height: 1.5;
        }
        .auth-link-btn {
          background: none; border: none; color: var(--accent); font-size: 12.5px; cursor: pointer;
          padding: 2px 0; text-align: left; align-self: flex-start;
        }
        .auth-link-btn:hover { text-decoration: underline; }
        .google-btn {
          display: flex; align-items: center; justify-content: center; gap: 10px;
          background: white; color: #1f1f1f; border: none; border-radius: 8px;
          padding: 10px; font-size: 13.5px; font-weight: 600; cursor: pointer;
          transition: transform 0.12s ease, box-shadow 0.15s ease;
        }
        .google-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 14px #ffffff22; }
        .google-btn:active { transform: scale(0.98); }
        .auth-footnote { font-size: 11.5px; color: var(--text-faint); margin: 0; text-align: center; }
        .auth-notice {
          font-size: 12.5px; color: var(--green); background: #34d39914; border: 1px solid #34d39930;
          padding: 8px 10px; border-radius: 8px; line-height: 1.5;
        }
        .auth-form { display: flex; flex-direction: column; gap: 8px; }
        .auth-input {
          background: var(--panel-2); border: 1px solid var(--border); border-radius: 8px;
          padding: 10px 12px; font-size: 13.5px; color: var(--text); font-family: 'Inter', sans-serif;
          outline: none; transition: border-color 0.15s;
        }
        .auth-input:focus { border-color: var(--accent); }
        .auth-input::placeholder { color: var(--text-faint); }
        .auth-submit-btn {
          background: var(--accent); color: white; border: none; border-radius: 8px;
          padding: 10px; font-size: 13.5px; font-weight: 600; cursor: pointer; margin-top: 2px;
          transition: opacity 0.15s;
        }
        .auth-submit-btn:hover:not(:disabled) { opacity: 0.9; }
        .auth-submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .auth-divider { display: flex; align-items: center; gap: 10px; color: var(--text-faint); font-size: 11.5px; }
        .auth-divider::before, .auth-divider::after { content: ''; flex: 1; height: 1px; background: var(--border); }
        .tab-btn {
          background: none; border: none; color: var(--text-dim); font-size: 13px; font-weight: 500;
          padding: 7px 13px; border-radius: 7px; cursor: pointer; transition: all 0.15s; position: relative;
        }
        .tab-btn:hover { color: var(--text); background: var(--panel); }
        .tab-btn:active { transform: scale(0.96); }
        .tab-btn.active { color: var(--text); background: var(--panel-2); }
        .tab-btn.active::after {
          content: ''; position: absolute; left: 13px; right: 13px; bottom: 2px; height: 2px;
          border-radius: 2px; background: var(--accent);
        }

        .bottom-nav { display: none; }
        @media (max-width: 640px) {
          .nova-app { --nav-h: 58px; }
          .bottom-nav {
            display: flex; position: fixed; bottom: 0; left: 0; right: 0; z-index: 30;
            background: var(--bg); border-top: 1px solid var(--border);
            padding: 7px 6px calc(7px + env(safe-area-inset-bottom));
            height: calc(var(--nav-h) + env(safe-area-inset-bottom));
          }
          .bn-btn {
            flex: 1; display: flex; flex-direction: column; align-items: center; gap: 3px;
            background: none; border: none; color: var(--text-dim); font-size: 10.5px; font-weight: 500;
            padding: 5px 2px; border-radius: 8px;
          }
          .bn-btn.active { color: var(--accent); }
          .nova-body { padding-bottom: 70px !important; }
        }

        .nova-body {
          max-width: 860px; margin: 0 auto; padding: 24px 22px; width: 100%;
        }
        @media (max-width: 640px) { .nova-body { padding: 16px 14px; } }

        .panel-fade { animation: fadeIn 0.3s cubic-bezier(0.2, 0.8, 0.2, 1); }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px) scale(0.99); } to { opacity: 1; transform: translateY(0) scale(1); } }

        /* CHAT */
        .chat-shell { display: flex; flex-direction: column; }
        .chat-scroll {
          display: flex; flex-direction: column; flex: 1;
          justify-content: flex-end; gap: 18px; padding-bottom: 76px;
        }

        .msg-row { display: flex; gap: 10px; max-width: 100%; animation: msgIn 0.25s ease; }
        @keyframes msgIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .msg-row.user { flex-direction: row-reverse; }
        .msg-icon {
          width: 26px; height: 26px; border-radius: 7px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center; margin-top: 2px;
        }
        .msg-icon.assistant { background: var(--accent-soft); color: var(--accent); }
        .msg-icon.user { background: var(--panel-2); color: var(--text-dim); }
        .msg-col { display: flex; flex-direction: column; gap: 5px; max-width: 80%; min-width: 0; }
        .msg-row.user .msg-col { align-items: flex-end; }
        @media (max-width: 640px) { .msg-col { max-width: 86%; } }
        .msg-bubble {
          padding: 11px 14px; border-radius: 10px; font-size: 14.5px; line-height: 1.6;
          white-space: pre-wrap; word-break: break-word; max-width: 100%;
        }
        @media (max-width: 640px) { .msg-bubble { font-size: 14px; } }
        .msg-bubble.assistant { background: var(--panel); border: 1px solid var(--border-soft); }
        .msg-bubble.user { background: var(--accent-soft); border: 1px solid #5b7cfa33; }

        .regen-btn {
          display: flex; align-items: center; gap: 5px; align-self: flex-start;
          background: none; border: 1px solid var(--border-soft); color: var(--text-dim);
          font-size: 11.5px; padding: 4px 9px; border-radius: 7px; cursor: pointer; transition: all 0.15s;
        }
        .regen-btn:hover { color: var(--text); border-color: var(--text-faint); }

        .inline-code {
          background: var(--panel-2); border: 1px solid var(--border-soft); padding: 1px 5px;
          border-radius: 4px; font-family: 'JetBrains Mono', monospace; font-size: 0.9em; color: #a8b1c2;
        }

        .code-block { margin: 8px 0; border-radius: 8px; overflow: hidden; border: 1px solid var(--border); background: #0d0e12; }
        .code-block-bar { display: flex; justify-content: space-between; align-items: center; padding: 6px 10px; background: var(--panel-2); font-size: 11px; color: var(--text-dim); }
        .code-block pre { margin: 0; padding: 12px; font-family: 'JetBrains Mono', monospace; font-size: 12.5px; color: #a8b1c2; overflow-x: auto; white-space: pre-wrap; word-break: break-word; }
        .copy-btn {
          display: flex; align-items: center; gap: 4px; background: none; border: 1px solid var(--border);
          color: var(--text-dim); font-size: 11px; padding: 4px 7px; border-radius: 6px; cursor: pointer;
        }
        .copy-btn:hover { color: var(--text); border-color: var(--text-faint); }

        .suggestions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 4px; }
        .suggest-chip {
          font-size: 12.5px; color: var(--text-dim); background: var(--panel); border: 1px solid var(--border-soft);
          padding: 7px 12px; border-radius: 8px; cursor: pointer; transition: all 0.15s;
        }
        .suggest-chip:hover { color: var(--text); border-color: var(--text-faint); transform: translateY(-2px); box-shadow: 0 4px 14px -6px var(--accent-glow); }

        .typing-dots { display: flex; gap: 4px; padding: 3px 0; }
        .typing-dots span { width: 5px; height: 5px; border-radius: 50%; background: var(--text-dim); animation: bounce 1.2s infinite; }
        .typing-dots span:nth-child(2) { animation-delay: 0.15s; }
        .typing-dots span:nth-child(3) { animation-delay: 0.3s; }
        @keyframes bounce { 0%,60%,100% { transform: translateY(0); opacity: 0.4; } 30% { transform: translateY(-3px); opacity: 1; } }

        .chat-input-row {
          display: flex; gap: 6px; padding: 8px;
          background: var(--panel); border: 1px solid var(--border); border-radius: 12px;
          transition: border-color 0.15s;
          position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
          width: calc(100% - 44px); max-width: 816px; z-index: 25;
          box-shadow: 0 4px 20px #00000066;
        }
        .chat-input-row:focus-within { border-color: var(--text-faint); }
        @media (max-width: 640px) {
          .chat-input-row {
            bottom: calc(var(--nav-h) + env(safe-area-inset-bottom) + 10px);
            width: calc(100% - 28px);
          }
        }
        .chat-input-row textarea {
          flex: 1; background: none; border: none; outline: none; resize: none;
          color: var(--text); font-family: 'Inter', sans-serif; font-size: 14px; padding: 7px 8px; max-height: 120px;
        }
        .chat-send {
          background: linear-gradient(135deg, var(--accent), #7c5bfa); border: none; color: white; width: 36px; height: 36px;
          border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer;
          transition: transform 0.12s ease, box-shadow 0.15s ease, opacity 0.15s ease; flex-shrink: 0; align-self: flex-end;
          box-shadow: 0 2px 10px var(--accent-glow);
        }
        .chat-send:hover:not(:disabled) { transform: scale(1.06); box-shadow: 0 4px 16px var(--accent-glow); }
        .chat-send:active:not(:disabled) { transform: scale(0.94); }
        .chat-send:disabled { opacity: 0.35; cursor: not-allowed; box-shadow: none; }
        .chat-send.stop { background: var(--panel-2); box-shadow: none; color: var(--text); }
        .chat-send.stop:hover { background: var(--panel-2); transform: none; box-shadow: none; }
        @media (max-width: 640px) { .chat-send { width: 42px; height: 42px; } }

        /* CARDS */
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        @media (max-width: 720px) { .grid-2 { grid-template-columns: 1fr; } }
        .single-card-wrap { max-width: 420px; margin: 0 auto; }
        .card {
          background: var(--panel); border: 1px solid var(--border); border-radius: 12px; padding: 20px;
          transition: border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
        }
        .card:hover { border-color: var(--text-faint); transform: translateY(-3px); box-shadow: 0 10px 28px -14px var(--accent-glow); }
        .card h2 { font-family: 'Space Grotesk', sans-serif; font-size: 12.5px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; color: var(--text-dim); margin: 0 0 12px; }
        .card p { color: #c3c5cc; font-size: 13.8px; line-height: 1.65; margin: 0 0 10px; }
        .tag-row { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
        .capability-list { display: flex; flex-direction: column; gap: 8px; margin: 6px 0 14px; }
        .cap-item { display: flex; align-items: center; gap: 9px; font-size: 13.3px; color: #c3c5cc; }
        .cap-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--accent); flex-shrink: 0; }
        .tag {
          font-size: 11.5px; padding: 3px 9px; border-radius: 6px;
          background: var(--panel-2); border: 1px solid var(--border-soft); color: var(--text-dim);
        }

        .profile-head { display: flex; align-items: center; gap: 14px; margin-bottom: 16px; }
        .avatar { width: 60px; height: 60px; border-radius: 10px; overflow: hidden; flex-shrink: 0; border: 1px solid var(--border); }
        .avatar img { width: 100%; height: 100%; object-fit: cover; }
        .profile-name h3 { font-family: 'Space Grotesk', sans-serif; margin: 0; font-size: 16px; font-weight: 600; }
        .profile-name .role { color: var(--text-dim); font-size: 12.5px; }
        .status-pill {
          display: inline-flex; align-items: center; gap: 5px; font-size: 11px; color: var(--green);
          background: #34d39914; border: 1px solid #34d39930; padding: 2px 8px; border-radius: 20px; margin-top: 5px;
        }

        .link-list { display: flex; flex-direction: column; gap: 10px; margin-top: 14px; }
        .link-item { display: flex; align-items: center; gap: 9px; font-size: 13px; color: var(--text-dim); text-decoration: none; }
        .link-item:hover { color: var(--text); }
        .link-item .li-icon {
          width: 28px; height: 28px; border-radius: 7px; background: var(--panel-2); border: 1px solid var(--border-soft);
          display: flex; align-items: center; justify-content: center; color: var(--text-dim); flex-shrink: 0;
        }

        /* SECTION HERO */
        .section-hero { padding: 6px 0 20px; }
        .section-hero h2 { font-family: 'Space Grotesk', sans-serif; font-size: 20px; font-weight: 600; margin: 0 0 5px; letter-spacing: -0.01em; }
        .section-hero p { color: var(--text-dim); font-size: 13.5px; margin: 0; }

        /* PROJECTS */
        .proj-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        @media (max-width: 720px) { .proj-grid { grid-template-columns: 1fr; } }
        .proj-card {
          background: var(--panel); border: 1px solid var(--border); border-radius: 12px; padding: 18px;
          display: flex; flex-direction: column; gap: 8px;
          transition: border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
          animation: cardIn 0.4s ease both;
        }
        .proj-card:hover { border-color: var(--text-faint); transform: translateY(-3px); box-shadow: 0 10px 28px -14px var(--accent-glow); }
        .proj-card:hover .proj-icon { background: var(--accent); color: white; }
        .proj-icon {
          width: 32px; height: 32px; border-radius: 8px; background: var(--accent-soft); color: var(--accent);
          display: flex; align-items: center; justify-content: center; margin-bottom: 2px;
          transition: background 0.2s ease, color 0.2s ease;
        }
        .proj-top { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
        .proj-top h3 { font-family: 'Space Grotesk', sans-serif; font-size: 15px; font-weight: 600; margin: 0; }
        .proj-tag { font-size: 10.5px; color: var(--text-dim); background: var(--panel-2); border: 1px solid var(--border-soft); padding: 2px 8px; border-radius: 5px; white-space: nowrap; }
        .proj-card p { color: #c3c5cc; font-size: 13.3px; line-height: 1.55; margin: 0; }
        .proj-link { color: var(--accent); font-size: 12.5px; text-decoration: none; display: flex; align-items: center; gap: 5px; margin-top: 4px; width: fit-content; font-weight: 500; }
        .proj-link:hover { text-decoration: underline; }
        @keyframes cardIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        /* SUPPORT */
        .support-card { text-align: center; }
        .support-icon {
          width: 38px; height: 38px; border-radius: 9px; background: var(--accent-soft); color: var(--accent);
          display: flex; align-items: center; justify-content: center; margin: 0 auto 12px;
          transition: background 0.2s ease, color 0.2s ease;
        }
        .card:hover .support-icon { background: var(--accent); color: white; }
        .contact-row {
          display: flex; align-items: center; gap: 8px; justify-content: center; font-size: 13px;
          color: #c3c5cc; margin-top: 8px; background: var(--panel-2); padding: 6px 12px; border-radius: 8px;
        }

        .footer-note { text-align: center; color: var(--text-faint); font-size: 11.5px; padding: 26px 0 8px; }

        /* ============================================================
           AURORA UPGRADE — colour, glass, motion
           ============================================================ */

        .nova-app::before {
          content: ""; position: fixed; inset: -50%; z-index: -2; pointer-events: none;
          background: conic-gradient(from 0deg, rgba(126,152,255,.55), rgba(255,110,214,.45), rgba(64,225,244,.50), rgba(178,120,255,.55), rgba(126,152,255,.55));
          filter: blur(110px); opacity: .9; animation: auroraSpin 34s linear infinite;
        }
        .nova-app::after {
          content: ""; position: fixed; inset: 0; z-index: -1; pointer-events: none; opacity: .5;
          background-image: radial-gradient(rgba(255,255,255,.28) 1px, transparent 1px);
          background-size: 46px 46px;
          mask-image: radial-gradient(120% 80% at 50% 0%, #000 20%, transparent 75%);
          animation: gridDrift 32s linear infinite;
        }
        @keyframes auroraSpin { to { transform: rotate(360deg); } }
        @keyframes gridDrift { to { background-position: 46px 46px; } }
        @keyframes floaty { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        @keyframes shimmer { to { background-position: 200% center; } }
        @keyframes popIn { from { opacity:0; transform: translateY(14px) scale(.97); } to { opacity:1; transform:none; } }
        @keyframes glowPulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(142,162,255,.35), 0 10px 40px -12px rgba(142,162,255,.6); }
          50%     { box-shadow: 0 0 0 10px rgba(142,162,255,0), 0 18px 60px -12px rgba(255,122,217,.6); }
        }

        /* glassmorphism for every surface */
        .nova-header, .user-menu, .history-panel, .auth-modal, .proj-card,
        .msg-bubble, .composer, .contact-row, .about-card, .tabs {
          backdrop-filter: blur(18px) saturate(150%);
        }

        .nova-header {
          background: linear-gradient(90deg, rgba(48,40,110,.55), rgba(30,42,105,.5), rgba(24,64,104,.5)) !important;
          border-bottom: 1px solid var(--border) !important;
          box-shadow: 0 8px 40px -20px rgba(0,0,0,.9);
        }

        /* brand */
        .brand-mark {
          background: var(--grad) !important;
          background-size: 200% 200% !important;
          animation: shimmer 6s linear infinite, floaty 5s ease-in-out infinite;
          box-shadow: 0 8px 30px -6px rgba(142,162,255,.75) !important;
        }
        .brand-mark:hover { transform: rotate(-8deg) scale(1.08); transition: transform .35s cubic-bezier(.2,.9,.2,1.2); }
        .brand-text h1 {
          background: var(--grad); background-size: 200% auto;
          -webkit-background-clip: text; background-clip: text; color: transparent;
          animation: shimmer 5s linear infinite; letter-spacing: -0.5px;
        }

        /* tabs */
        .tabs { background: rgba(255,255,255,.05); border: 1px solid var(--border); border-radius: 12px; padding: 3px; }
        .tab-btn {
          position: relative; border-radius: 9px !important; color: var(--text-dim) !important;
          transition: color .25s ease, transform .25s ease;
        }
        .tab-btn:hover { color: var(--text) !important; transform: translateY(-1px); }
        .tab-btn.active {
          color: #0f142e !important; background: var(--grad) !important; background-size: 180% auto !important;
          animation: shimmer 5s linear infinite; font-weight: 600;
          box-shadow: 0 6px 22px -8px rgba(142,162,255,.9);
        }

        /* buttons */
        .signin-btn, .new-chat-btn, .send-btn, .suggest-chip, .auth-submit, .google-btn, .verify-resend-btn, .icon-btn {
          transition: transform .22s cubic-bezier(.2,.9,.2,1.2), box-shadow .25s ease, background .25s ease, color .2s ease;
        }
        .signin-btn {
          background: var(--grad) !important; background-size: 200% auto !important;
          color: #101632 !important; border: none !important; font-weight: 650 !important;
          animation: shimmer 6s linear infinite;
        }
        .signin-btn:hover, .new-chat-btn:hover, .auth-submit:hover {
          transform: translateY(-2px) scale(1.03);
          box-shadow: 0 14px 34px -12px rgba(255,122,217,.8);
        }
        .send-btn {
          background: var(--grad) !important; background-size: 200% auto !important; color: #101632 !important;
          border: none !important; animation: shimmer 6s linear infinite;
        }
        .send-btn:hover:not(:disabled) { transform: translateY(-2px) rotate(-6deg) scale(1.08); box-shadow: 0 12px 30px -8px var(--accent-glow); }
        .send-btn:active:not(:disabled) { transform: scale(.92); }

        /* messages */
        .msg { animation: popIn .45s cubic-bezier(.2,.9,.2,1.05) both; }
        .msg-bubble {
          border: 1px solid var(--border) !important;
          background: rgba(255,255,255,.11) !important;
          transition: transform .3s ease, box-shadow .3s ease, border-color .3s ease;
        }
        .msg-bubble:hover {
          transform: translateY(-2px);
          border-color: rgba(142,162,255,.45) !important;
          box-shadow: 0 16px 44px -22px rgba(142,162,255,.9);
        }
        .msg.user .msg-bubble {
          background: linear-gradient(135deg, rgba(142,162,255,.28), rgba(255,122,217,.22)) !important;
          border-color: rgba(142,162,255,.35) !important;
        }
        .msg-avatar { box-shadow: 0 6px 18px -8px var(--accent-glow); }

        /* composer */
        .composer {
          background: rgba(255,255,255,.11) !important;
          border: 1px solid var(--border) !important;
          transition: box-shadow .3s ease, border-color .3s ease, transform .3s ease;
        }
        .composer:focus-within {
          border-color: rgba(142,162,255,.65) !important;
          box-shadow: 0 0 0 4px rgba(142,162,255,.14), 0 20px 50px -24px rgba(255,122,217,.9);
          transform: translateY(-1px);
        }
        textarea, input { color: var(--text) !important; }
        textarea::placeholder, input::placeholder { color: var(--text-faint) !important; }

        /* suggestion chips */
        .suggest-chip {
          background: rgba(255,255,255,.10) !important; border: 1px solid var(--border) !important;
          color: var(--text-dim) !important;
        }
        .suggest-chip:hover {
          color: var(--text) !important; transform: translateY(-3px) scale(1.04);
          border-color: rgba(255,122,217,.55) !important;
          box-shadow: 0 12px 30px -14px rgba(255,122,217,.9);
          background: rgba(255,122,217,.12) !important;
        }

        /* project cards — tilt + sheen */
        .proj-card {
          position: relative; overflow: hidden;
          background: linear-gradient(150deg, rgba(255,255,255,.14), rgba(255,255,255,.05)) !important; border: 1px solid var(--border) !important;
          transition: transform .4s cubic-bezier(.2,.9,.2,1.05), box-shadow .4s ease, border-color .4s ease;
        }
        .proj-card::before {
          content: ""; position: absolute; inset: -60% -20%; pointer-events: none;
          background: linear-gradient(115deg, transparent 40%, rgba(255,255,255,.18) 50%, transparent 60%);
          transform: translateX(-120%); transition: transform .8s ease;
        }
        .proj-card:hover::before { transform: translateX(120%); }
        .proj-card:hover {
          transform: translateY(-8px) rotateX(4deg) rotateZ(-.4deg) scale(1.015);
          border-color: rgba(142,162,255,.5) !important;
          box-shadow: 0 30px 70px -30px rgba(142,162,255,.9), 0 0 0 1px rgba(255,255,255,.05) inset;
        }
        .proj-icon, .proj-card svg { color: var(--accent-3); }
        .stack-pill, .tag {
          background: rgba(142,162,255,.14) !important; border: 1px solid rgba(142,162,255,.28) !important;
          color: #cfd7ff !important; transition: transform .2s ease, background .2s ease;
        }
        .stack-pill:hover, .tag:hover { transform: translateY(-2px); background: rgba(255,122,217,.18) !important; }

        /* modals */
        .modal-backdrop { background: rgba(10,14,34,.7) !important; backdrop-filter: blur(8px) !important; }
        .auth-modal, .history-panel {
          background: linear-gradient(160deg, rgba(52,44,120,.92), rgba(28,42,104,.92)) !important; border: 1px solid var(--border) !important;
          box-shadow: 0 40px 100px -40px #000; animation: popIn .35s cubic-bezier(.2,.9,.2,1.05) both;
        }
        .history-item { transition: transform .2s ease, background .2s ease; border-radius: 10px; }
        .history-item:hover { transform: translateX(4px); background: rgba(255,255,255,.09) !important; }
        .history-item.active { background: linear-gradient(90deg, rgba(142,162,255,.22), transparent) !important; }

        /* links + misc */
        a { color: var(--accent-3); }
        a:hover { color: var(--accent-2); }
        .contact-row { background: rgba(255,255,255,.07) !important; transition: transform .25s ease, box-shadow .25s ease; }
        .contact-row:hover { transform: translateY(-2px); box-shadow: 0 14px 34px -18px rgba(78,226,245,.9); }
        .status-dot { box-shadow: 0 0 12px var(--green) !important; }
        .load-screen { background: linear-gradient(160deg, #141a35, #1b2350) !important; }
        .load-mark { background: var(--grad) !important; background-size: 200% auto !important; animation: shimmer 4s linear infinite, glowPulse 2.6s ease-in-out infinite; }
        code, pre { background: rgba(255,255,255,.08) !important; border: 1px solid var(--border) !important; color: #dfe4ff !important; }

        /* scrollbar */
        ::-webkit-scrollbar { width: 10px; height: 10px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: linear-gradient(180deg, rgba(142,162,255,.55), rgba(255,122,217,.55)); border-radius: 99px; border: 2px solid transparent; background-clip: padding-box; }
        ::-webkit-scrollbar-thumb:hover { background: linear-gradient(180deg, #8ea2ff, #ff7ad9); background-clip: padding-box; }
        ::selection { background: rgba(255,122,217,.35); color: #fff; }

        .proj-card > *:first-child { position: relative; z-index: 1; }
        .proj-card::after {
          content: ""; position: absolute; top: 0; left: 0; right: 0; height: 3px;
          background: var(--grad); background-size: 200% auto; animation: shimmer 5s linear infinite;
          opacity: .85;
        }
        .nova-header::after {
          content: ""; position: absolute; left: 0; right: 0; bottom: -1px; height: 2px;
          background: var(--grad); background-size: 200% auto; animation: shimmer 6s linear infinite; opacity: .9;
        }
        .load-screen { background: linear-gradient(160deg, #232c62, #3a2a7a 60%, #1d2456) !important; }

        @media (prefers-reduced-motion: reduce) {
          * { animation-duration: .001ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; }
        }
      `}</style>
    </div>
  );
}
