const MAP = [
  ["unauthorized-domain", "This domain isn't authorized for sign-in yet. Add it under Firebase → Authentication → Settings → Authorized domains."],
  ["popup-blocked", "Sign-in popup was blocked. Try again."],
  ["cancelled-popup-request", "Sign-in was interrupted. Try again."],
  ["network-request-failed", "Network error — check your connection and try again."],
  ["invalid-api-key", "Firebase isn't configured — check your Firebase project config."],
  ["api-key-not-valid", "Firebase isn't configured — check your Firebase project config."],
  ["email-already-in-use", "That email is already registered — try logging in instead."],
  ["weak-password", "Password should be at least 6 characters."],
  ["invalid-email", "That email address looks invalid."],
  ["user-not-found", "Incorrect email or password."],
  ["invalid-credential", "Incorrect email or password."],
  ["wrong-password", "Incorrect email or password."],
  ["too-many-requests", "Too many attempts — wait a moment and try again."],
  ["operation-not-allowed", "This sign-in method isn't enabled in Firebase yet."],
  ["configuration-not-found", "Authentication isn't set up for this Firebase project yet."],
];

export function describeAuthError(err) {
  const code = err?.code || "";
  const hit = MAP.find(([key]) => code.includes(key));
  const msg = hit ? hit[1] : "Something went wrong. Please try again.";
  return code ? `${msg} (${code})` : msg;
}