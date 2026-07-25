import { useState, useRef, useEffect } from "react";
import {
  Send, User, Sparkles, Mail, Phone, ExternalLink, MessageSquare, UserCircle2,
  FolderGit2, HandHeart, Copy, Check, Globe, GraduationCap, Dumbbell, MessageCircle,
  LogOut, History, Plus, X, Clock, ImagePlus, Square, RefreshCw, Trash2, AlertTriangle,
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

const DEFAULT_PHOTO = "__DEFAULT_PHOTO_PLACEHOLDER__";

const SYSTEM_PROMPT = `You are Nova, an AI assistant built by Shashwat Pandey for his personal site.

Who Shashwat is: a full-stack developer (BCA graduate, Sadguru Institute of Computer Studies, MCU Bhopal), co-founder of ChitrakootDhamTour (a live spiritual tourism booking platform), and builder of SCMS and ApexFit. Core stack: PHP, MySQL, React, React Native, Node.js, Bootstrap, Firebase, Chart.js. He's currently open to software/web development internships.

Projects to reference when relevant (don't force them into unrelated answers):
${PROJECTS.map(p => `- ${p.name} (${p.tag}): ${p.desc}`).join("\n")}

Your priorities, in order:
1. Help with coding — debugging, explaining concepts, writing snippets, reviewing approaches. Be precise and give working code.
2. Answer questions about Shashwat and his work using the information above. If you don't know something, say so plainly.
3. When genuinely relevant, point people to the matching project.

You can't generate images yourself inside a text reply. If someone asks for an image, tell them to type "/image" followed by a description (or tap the image icon next to the message box) — that routes the request to a separate image-generation model. Don't pretend to have created or attached an image yourself.

Tone: clear, competent, and personable — like a sharp colleague, not a mascot. You can be warm and occasionally light, but keep it professional; skip heavy slang or forced jokes. Keep answers concise by default and expand only when the question needs depth. Use code blocks for code.`;

const TABS = [
  { id: "chat", label: "Chat", icon: MessageSquare },
  { id: "about", label: "About", icon: UserCircle2 },
  { id: "projects", label: "Projects", icon: FolderGit2 },
  { id: "support", label: "Support", icon: HandHeart },
];

const GREETING = "Hi, I'm Nova — an AI assistant built for this site. I can help debug code, explain concepts, generate images, or tell you about Shashwat's work. What can I help with?";

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
  const [loadingKind, setLoadingKind] = useState("text");
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
      // Images are never persisted to Firestore — a single generated image can
      // exceed the 1MiB document-size limit, and storing base64 blobs in a chat
      // history document isn't a great use of the database anyway. We keep a
      // human-readable placeholder instead so the conversation still reads fine.
      const storable = sessionMessages.map(m =>
        m.type === "image"
          ? { role: m.role, content: `[Image generated from: "${m.prompt || "untitled prompt"}" — images aren't saved in history]` }
          : { role: m.role, content: m.content }
      );
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
    setLoadingKind("text");
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
          messages: nextMessages.map(m => ({
            role: m.role,
            content: m.type === "image" ? (m.content || `[Generated an image for: "${m.prompt}"]`) : m.content,
          })),
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

  async function requestImageReply(nextMessages, prompt) {
    setLoading(true);
    setLoadingKind("image");
    try {
      const response = await fetch("/api/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await response.json();
      if (!response.ok) {
        setMessages(m => [...m, { role: "assistant", content: `⚠️ Image generation failed: ${data.error || response.status}` }]);
        return;
      }
      const imageMessage = {
        role: "assistant",
        type: "image",
        prompt,
        content: data.caption || "",
        image: { data: data.image, mimeType: data.mimeType || "image/png" },
      };
      const finalMessages = [...nextMessages, imageMessage];
      setMessages(finalMessages);
      if (user) saveSession(finalMessages);
    } catch (err) {
      setMessages(m => [...m, { role: "assistant", content: `⚠️ Connection failed: ${String(err.message || err)}` }]);
    } finally {
      setLoading(false);
    }
  }

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setTimeout(autoGrow, 0);

    const imageMatch = text.match(/^\/(image|img)\s+([\s\S]+)/i);
    const nextMessages = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);

    if (imageMatch) {
      await requestImageReply(nextMessages, imageMatch[2].trim());
    } else {
      await requestAssistantReply(nextMessages);
    }
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

  function insertImageCommand() {
    setInput(v => (v.trim().toLowerCase().startsWith("/image") || v.trim().toLowerCase().startsWith("/img") ? v : "/image "));
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

  function renderMessage(m) {
    if (m.type === "image") {
      return (
        <div className="msg-image-wrap">
          {m.image?.data && (
            <img
              className="msg-image"
              src={`data:${m.image.mimeType};base64,${m.image.data}`}
              alt={m.prompt || "Generated image"}
            />
          )}
          {m.content && <p className="msg-image-caption">{m.content}</p>}
        </div>
      );
    }
    return renderMessageContent(m.content);
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
                const isLastAssistant = m.role === "assistant" && i === messages.length - 1 && i > 0 && m.type !== "image" && !loading;
                return (
                  <div key={i} className={`msg-row ${m.role}`}>
                    <div className={`msg-icon ${m.role}`}>
                      {m.role === "assistant" ? <Sparkles size={13} /> : <User size={13} />}
                    </div>
                    <div className="msg-col">
                      <div className={`msg-bubble ${m.role} ${m.type === "image" ? "has-image" : ""}`}>{renderMessage(m)}</div>
                      {isLastAssistant && (
                        <button className="regen-btn" onClick={regenerateLast} type="button"><RefreshCw size={11} /> Regenerate</button>
                      )}
                    </div>
                  </div>
                );
              })}
              {messages.length === 1 && (
                <div className="suggestions">
                  <button className="suggest-chip" onClick={() => suggestPrompt("Can you help me debug a React useEffect loop?")}>Debug a useEffect loop</button>
                  <button className="suggest-chip" onClick={() => suggestPrompt("What has Shashwat built recently?")}>What has he built?</button>
                  <button className="suggest-chip" onClick={() => suggestPrompt("Explain how JWT auth works, simply")}>Explain JWT auth</button>
                  <button className="suggest-chip" onClick={() => suggestPrompt("/image a serene mountain lake at sunrise, digital painting")}>Generate an image</button>
                </div>
              )}
              {loading && (
                <div className="msg-row assistant">
                  <div className="msg-icon assistant"><Sparkles size={13} /></div>
                  <div className="msg-bubble assistant">
                    {loadingKind === "image" ? (
                      <div className="image-loading"><span className="spinner" /> Generating image…</div>
                    ) : (
                      <div className="typing-dots"><span></span><span></span><span></span></div>
                    )}
                  </div>
                </div>
              )}
              <div ref={scrollRef} />
            </div>
            <div className="chat-input-row">
              <button className="chat-image-btn" type="button" onClick={insertImageCommand} title="Generate an image" aria-label="Generate an image">
                <ImagePlus size={16} />
              </button>
              <textarea
                ref={textareaRef}
                rows={1}
                placeholder="Message Nova... (try /image a sunset)"
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
                <p>Nova is the AI assistant built into this site — designed to be a useful technical companion rather than a generic chatbot. It's tuned specifically around Shashwat's work, so it can speak knowledgeably about the projects, stack, and background on this page, in addition to general-purpose assistance.</p>
                <p>Under the hood, Nova's text responses run on OpenAI's GPT-OSS 120B model, served through Groq's low-latency inference infrastructure, with a serverless function on Vercel acting as the API layer between the frontend and the model provider. Image generation runs on Google's Gemini 2.5 Flash Image model through a separate serverless endpoint. This keeps both API keys secure server-side and keeps response times fast.</p>
                <p>Each conversation runs fresh — Nova doesn't carry context between separate chat sessions. If you sign in, your text conversations are saved to your account so you can revisit them later; if you're not signed in, everything lives only in the current browser session and disappears on reload. Generated images aren't stored — only the current session shows them.</p>
                <div className="capability-list">
                  <div className="cap-item"><span className="cap-dot" />Debugging and reviewing code across common web stacks</div>
                  <div className="cap-item"><span className="cap-dot" />Explaining technical concepts at varying levels of depth</div>
                  <div className="cap-item"><span className="cap-dot" />Generating images from a text prompt (type /image)</div>
                  <div className="cap-item"><span className="cap-dot" />Answering questions about Shashwat's projects and experience</div>
                  <div className="cap-item"><span className="cap-dot" />General-purpose conversation and assistance</div>
                </div>
                <div className="tag-row">
                  <span className="tag">GPT-OSS 120B</span><span className="tag">Groq</span><span className="tag">Gemini 2.5 Flash Image</span><span className="tag">React</span><span className="tag">Vercel Functions</span>
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
              <h2>Support &amp; Contact</h2>
              <p>Ways to reach out or support ongoing work.</p>
            </div>
            <div className="grid-2">
              <div className="card support-card">
                <div className="support-icon"><HandHeart size={17} /></div>
                <h2>Support</h2>
                <p>If this site or Nova was useful to you, contributions are welcome via UPI.</p>
                <div className="contact-row mono">7024487353@airtel <CopyButton text="7024487353@airtel" /></div>
              </div>
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

        {tab !== "chat" && <div className="footer-note">© {new Date().getFullYear()} Shashwat Pandey · Built with React, Groq &amp; Gemini</div>}
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
        html, body, #root { margin: 0 !important; padding: 0 !important; height: 100% !important; width: 100% !important; background-color: #0b0c0f; }
        body { display: block !important; place-items: unset !important; min-width: 0 !important; }
        #root { max-width: none !important; width: 100% !important; text-align: left !important; border: none !important; }

        .nova-app {
          --bg: #0b0c0f;
          --panel: #141519;
          --panel-2: #1a1b20;
          --border: #26272e;
          --border-soft: #1e1f25;
          --accent: #5b7cfa;
          --accent-soft: #5b7cfa1a;
          --accent-glow: #5b7cfa40;
          --text: #e8e9ec;
          --text-dim: #8b8d96;
          --text-faint: #5d5f68;
          --green: #34d399;
          --amber: #f59e0b;
          font-family: 'Inter', -apple-system, sans-serif;
          background: var(--bg);
          color: var(--text);
          position: relative;
          min-height: 100vh;
          overflow-x: hidden;
        }
        .mono { font-family: 'JetBrains Mono', monospace; }
        .display { font-family: 'Space Grotesk', sans-serif; }

        .mesh-bg {
          position: fixed; inset: 0; z-index: 0; pointer-events: none; overflow: hidden;
        }
        .mesh-blob {
          position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.16;
          animation: meshDrift 24s ease-in-out infinite alternate;
        }
        .mesh-blob.b1 { width: 420px; height: 420px; background: #5b7cfa; top: -10%; left: -8%; }
        .mesh-blob.b2 { width: 380px; height: 380px; background: #7c5bfa; bottom: -12%; right: -6%; animation-delay: -8s; animation-duration: 30s; }
        .mesh-blob.b3 { width: 300px; height: 300px; background: #5bd0fa; top: 40%; right: 20%; opacity: 0.08; animation-delay: -14s; animation-duration: 26s; }
        @keyframes meshDrift {
          from { transform: translate(0, 0) scale(1); }
          to { transform: translate(40px, 30px) scale(1.08); }
        }
        @media (prefers-reduced-motion: reduce) { .mesh-blob { animation: none; } }
        .nova-app > *:not(.mesh-bg):not(.load-screen):not(.bottom-nav):not(.modal-backdrop) { position: relative; z-index: 1; }

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
        .msg-bubble.has-image { padding: 6px; max-width: 320px; }

        .msg-image { width: 100%; display: block; border-radius: 8px; }
        .msg-image-caption { margin: 8px 4px 2px; font-size: 12.5px; color: var(--text-dim); line-height: 1.5; white-space: pre-wrap; }

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

        .image-loading { display: flex; align-items: center; gap: 8px; font-size: 13.5px; color: var(--text-dim); }

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
        .chat-image-btn {
          background: none; border: none; color: var(--text-dim); width: 34px; height: 36px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center; cursor: pointer;
          border-radius: 8px; align-self: flex-end; transition: all 0.15s;
        }
        .chat-image-btn:hover { color: var(--text); background: var(--panel-2); }
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
        @media (max-width: 640px) { .chat-send, .chat-image-btn { width: 42px; height: 42px; } }

        /* CARDS */
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        @media (max-width: 720px) { .grid-2 { grid-template-columns: 1fr; } }
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
      `}</style>
    </div>
  );
}
