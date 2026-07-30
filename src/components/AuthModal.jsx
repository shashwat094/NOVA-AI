import { useState } from "react";
import { X } from "lucide-react";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  updateProfile,
} from "firebase/auth";
import { auth, googleProvider } from "../firebase.js";
import { describeAuthError } from "../lib/authErrors.js";

export default function AuthModal({ onClose, onSuccess, onNotify }) {
  const [mode, setMode] = useState("login"); // login | signup | reset
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  function switchMode(next) {
    setMode(next);
    setError("");
    setNotice("");
  }

  async function handleGoogle() {
    setError("");
    try {
      await signInWithPopup(auth, googleProvider);
      onSuccess();
    } catch (err) {
      const code = err?.code || "";
      if (code.includes("popup-closed-by-user") || code.includes("cancelled-popup-request")) return;
      if (code.includes("popup-blocked") || code.includes("not-supported-in-this-environment")) {
        try {
          await signInWithRedirect(auth, googleProvider);
          return;
        } catch (redirectErr) {
          setError(describeAuthError(redirectErr));
          return;
        }
      }
      setError(describeAuthError(err));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      if (mode === "reset") {
        await sendPasswordResetEmail(auth, email.trim());
        setNotice("Reset link sent — check your inbox.");
      } else if (mode === "signup") {
        const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        if (name.trim()) await updateProfile(cred.user, { displayName: name.trim() });
        await sendEmailVerification(cred.user);
        onNotify("Account created — check your inbox for a verification link.");
        onSuccess();
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
        onSuccess();
      }
    } catch (err) {
      setError(describeAuthError(err));
    } finally {
      setBusy(false);
    }
  }

  const title =
    mode === "reset" ? "Reset password" : mode === "signup" ? "Create an account" : "Log in";

  return (
    <div className="backdrop" onMouseDown={onClose} role="presentation">
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="modal-head">
          <h3>{title}</h3>
          <button className="icon-btn" type="button" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>

        {mode !== "reset" && (
          <div className="segmented">
            <button
              type="button"
              className={mode === "login" ? "active" : ""}
              onClick={() => switchMode("login")}
            >
              Log in
            </button>
            <button
              type="button"
              className={mode === "signup" ? "active" : ""}
              onClick={() => switchMode("signup")}
            >
              Sign up
            </button>
          </div>
        )}

        {error && <div className="alert error">{error}</div>}
        {notice && <div className="alert ok">{notice}</div>}

        <form className="form" onSubmit={handleSubmit}>
          {mode === "signup" && (
            <input
              className="input"
              type="text"
              placeholder="Name"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          )}
          <input
            className="input"
            type="email"
            placeholder="Email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {mode !== "reset" && (
            <input
              className="input"
              type="password"
              placeholder="Password"
              required
              minLength={6}
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          )}
          <button className="primary-btn" type="submit" disabled={busy}>
            {busy
              ? "Please wait…"
              : mode === "reset"
                ? "Send reset link"
                : mode === "signup"
                  ? "Create account"
                  : "Log in"}
          </button>
          {mode === "login" && (
            <button className="link-btn" type="button" onClick={() => switchMode("reset")}>
              Forgot password?
            </button>
          )}
          {mode === "reset" && (
            <button className="link-btn" type="button" onClick={() => switchMode("login")}>
              Back to log in
            </button>
          )}
        </form>

        {mode !== "reset" && (
          <>
            <div className="divider">
              <span>or</span>
            </div>
            <button className="google-btn" type="button" onClick={handleGoogle}>
              Continue with Google
            </button>
            <p className="note">Signing in saves your conversation history.</p>
          </>
        )}
      </div>
    </div>
  );
}