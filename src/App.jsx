import { useCallback, useEffect, useRef, useState } from "react";
import { Menu } from "lucide-react";
import { onAuthStateChanged, getRedirectResult, sendEmailVerification, signOut } from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";

import { auth, db } from "./firebase.js";
import { SYSTEM_PROMPT } from "./lib/content.js";
import Sidebar from "./components/Sidebar.jsx";
import ChatView from "./components/ChatView.jsx";
import AboutView from "./components/AboutView.jsx";
import ProjectsView from "./components/ProjectsView.jsx";
import ContactView from "./components/ContactView.jsx";
import AuthModal from "./components/AuthModal.jsx";

const VIEW_TITLES = { chat: "Chat", about: "About", projects: "Projects", contact: "Contact" };

function uid() {
  return globalThis.crypto?.randomUUID
    ? globalThis.crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function App() {
  const [view, setView] = useState("chat");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState("idle"); // idle | submitted | streaming

  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authOpen, setAuthOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [banner, setBanner] = useState("");

  const abortRef = useRef(null);
  const sessionIdRef = useRef(null);
  const bannerTimer = useRef(null);

  const notify = useCallback((text) => {
    setBanner(text);
    clearTimeout(bannerTimer.current);
    bannerTimer.current = setTimeout(() => setBanner(""), 6000);
  }, []);

  useEffect(() => () => clearTimeout(bannerTimer.current), []);

  const loadSessions = useCallback(async (currentUid) => {
    try {
      const q = query(
        collection(db, "chatSessions"),
        where("uid", "==", currentUid),
        orderBy("updatedAt", "desc"),
      );
      const snap = await getDocs(q);
      setSessions(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error("Failed to load chat history:", err);
    }
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
      if (u) {
        loadSessions(u.uid);
      } else {
        setSessions([]);
        setActiveSessionId(null);
        sessionIdRef.current = null;
      }
    });
    getRedirectResult(auth).catch((err) => console.error("Redirect sign-in failed:", err));
    return unsub;
  }, [loadSessions]);

  useEffect(() => {
    function onKey(e) {
      if (e.key !== "Escape") return;
      setMenuOpen(false);
      setSidebarOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    function onDown(e) {
      if (!e.target.closest(".account")) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [menuOpen]);

  // Abort any in-flight request when the app unmounts.
  useEffect(() => () => abortRef.current?.abort(), []);

  const persistSession = useCallback(
    async (history) => {
      if (!auth.currentUser || history.length === 0) return;
      const storable = history.map((m) => ({ role: m.role, content: m.content }));
      const title = storable.find((m) => m.role === "user")?.content?.slice(0, 48) || "New chat";
      try {
        if (sessionIdRef.current) {
          await setDoc(
            doc(db, "chatSessions", sessionIdRef.current),
            { uid: auth.currentUser.uid, title, messages: storable, updatedAt: serverTimestamp() },
            { merge: true },
          );
        } else {
          const ref = await addDoc(collection(db, "chatSessions"), {
            uid: auth.currentUser.uid,
            title,
            messages: storable,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          sessionIdRef.current = ref.id;
          setActiveSessionId(ref.id);
        }
        await loadSessions(auth.currentUser.uid);
      } catch (err) {
        console.error("Failed to save conversation:", err);
        notify("Couldn't save this conversation.");
      }
    },
    [loadSessions, notify],
  );

  const runCompletion = useCallback(
    async (history) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setStatus("submitted");

      const assistantId = uid();
      let text = "";

      // Pure updater: safe under StrictMode's double-invoked state updates.
      const pushChunk = (chunk) => {
        text += chunk;
        const snapshot = text;
        setMessages((prev) =>
          prev.some((m) => m.id === assistantId)
            ? prev.map((m) => (m.id === assistantId ? { ...m, content: snapshot } : m))
            : [...prev, { id: assistantId, role: "assistant", content: snapshot }],
        );
      };

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            system: SYSTEM_PROMPT,
            max_tokens: 1200,
            stream: true,
            messages: history.map((m) => ({ role: m.role, content: m.content })),
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          let detail = `Request failed (${response.status})`;
          try {
            detail = (await response.json())?.error || detail;
          } catch {
            /* non-JSON error body */
          }
          throw new Error(detail);
        }

        const contentType = response.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          const data = await response.json();
          const reply = (data.content || []).map((b) => b.text || "").join("\n");
          pushChunk(reply || "I didn't get a response — try rephrasing.");
        } else if (response.body) {
          setStatus("streaming");
          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          for (;;) {
            const { value, done } = await reader.read();
            if (done) break;
            pushChunk(decoder.decode(value, { stream: true }));
          }
          if (!text.trim()) pushChunk("I didn't get a response — try rephrasing.");
        }

        const finalHistory = [...history, { id: assistantId, role: "assistant", content: text }];
        persistSession(finalHistory);
      } catch (err) {
        if (err.name === "AbortError") {
          if (text.trim()) persistSession([...history, { id: assistantId, role: "assistant", content: text }]);
          return;
        }
        console.error("Chat request failed:", err);
        setMessages((prev) => [
          ...prev,
          {
            id: uid(),
            role: "assistant",
            content: `Something went wrong: ${err.message || err}. Please try again.`,
          },
        ]);
      } finally {
        if (abortRef.current === controller) abortRef.current = null;
        setStatus("idle");
      }
    },
    [persistSession],
  );

  const handleSend = useCallback(
    (text) => {
      const next = [...messages, { id: uid(), role: "user", content: text }];
      setMessages(next);
      setInput("");
      runCompletion(next);
    },
    [messages, runCompletion],
  );

  const handleRegenerate = useCallback(() => {
    if (status !== "idle") return;
    let cut = -1;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "user") {
        cut = i;
        break;
      }
    }
    if (cut === -1) return;
    const truncated = messages.slice(0, cut + 1);
    setMessages(truncated);
    runCompletion(truncated);
  }, [messages, runCompletion, status]);

  function handleStop() {
    abortRef.current?.abort();
  }

  function startNewChat() {
    abortRef.current?.abort();
    setMessages([]);
    setInput("");
    setActiveSessionId(null);
    sessionIdRef.current = null;
    setView("chat");
    setSidebarOpen(false);
  }

  function openSession(session) {
    abortRef.current?.abort();
    setMessages((session.messages || []).map((m) => ({ ...m, id: uid() })));
    setActiveSessionId(session.id);
    sessionIdRef.current = session.id;
    setView("chat");
    setSidebarOpen(false);
  }

  async function deleteSession(id) {
    if (!window.confirm("Delete this conversation? This can't be undone.")) return;
    try {
      await deleteDoc(doc(db, "chatSessions", id));
      if (sessionIdRef.current === id) startNewChat();
      setSessions((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error("Failed to delete conversation:", err);
      notify("Couldn't delete that conversation.");
    }
  }

  async function handleSignOut() {
    setMenuOpen(false);
    await signOut(auth);
    startNewChat();
  }

  async function handleResendVerification() {
    setMenuOpen(false);
    try {
      if (auth.currentUser) await sendEmailVerification(auth.currentUser);
      notify("Verification email sent — check your inbox.");
    } catch (err) {
      console.error("Failed to resend verification:", err);
      notify("Couldn't send the verification email.");
    }
  }

  function selectView(next) {
    setView(next);
    setSidebarOpen(false);
  }

  return (
    <div className="app">
      <Sidebar
        open={sidebarOpen}
        view={view}
        onSelectView={selectView}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onNewChat={startNewChat}
        onOpenSession={openSession}
        onDeleteSession={deleteSession}
        user={user}
        authLoading={authLoading}
        menuOpen={menuOpen}
        onToggleMenu={() => setMenuOpen((o) => !o)}
        onSignIn={() => {
          setAuthOpen(true);
          setSidebarOpen(false);
        }}
        onSignOut={handleSignOut}
        onResendVerification={handleResendVerification}
      />

      {sidebarOpen && <div className="scrim" onClick={() => setSidebarOpen(false)} />}

      <main className="main">
        <header className="topbar">
          <button
            className="icon-btn menu-toggle"
            type="button"
            aria-label="Open menu"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={17} />
          </button>
          <span className="topbar-title">{VIEW_TITLES[view]}</span>
          <span className="topbar-spacer" />
        </header>

        {banner && <div className="banner">{banner}</div>}

        {view === "chat" ? (
          <ChatView
            messages={messages}
            input={input}
            setInput={setInput}
            status={status}
            onSend={handleSend}
            onStop={handleStop}
            onRegenerate={handleRegenerate}
          />
        ) : (
          <div className="view">
            {view === "about" && <AboutView />}
            {view === "projects" && <ProjectsView />}
            {view === "contact" && <ContactView />}
          </div>
        )}
      </main>

      {authOpen && (
        <AuthModal
          onClose={() => setAuthOpen(false)}
          onSuccess={() => setAuthOpen(false)}
          onNotify={notify}
        />
      )}
    </div>
  );
}