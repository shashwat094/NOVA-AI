import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";

export default function CopyButton({ text, label }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  async function copy() {
    try {
      await navigator.clipboard?.writeText(text);
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable (insecure context) — silently ignore */
    }
  }

  return (
    <button className="copy-btn" onClick={copy} type="button" title="Copy">
      {copied ? <Check size={13} /> : <Copy size={13} />}
      {label ? <span>{copied ? "Copied" : label}</span> : null}
    </button>
  );
}