import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { ArrowUp, Square } from "lucide-react";
import Message from "./Message.jsx";
import { SUGGESTIONS } from "../lib/content.js";

export default function ChatView({
  messages,
  input,
  setInput,
  status, // idle | submitted | streaming
  onSend,
  onStop,
  onRegenerate,
}) {
  const scrollRef = useRef(null);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);
  const stickToBottom = useRef(true);

  const busy = status !== "idle";
  const lastMessage = messages[messages.length - 1];
  const streamingLast = status === "streaming" && lastMessage?.role === "assistant";

  const resize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 168)}px`;
  }, []);

  useLayoutEffect(resize, [input, resize]);

  useEffect(() => {
    if (status === "idle") textareaRef.current?.focus();
  }, [status]);

  useEffect(() => {
    if (!stickToBottom.current) return;
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages, status]);

  function handleScroll() {
    const el = scrollRef.current;
    if (!el) return;
    stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  }

  function submit() {
    if (!input.trim() || busy) return;
    stickToBottom.current = true;
    onSend(input.trim());
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit();
    }
  }

  function applySuggestion(text) {
    setInput(text);
    requestAnimationFrame(() => textareaRef.current?.focus());
  }

  let lastAssistantIndex = -1;
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === "assistant") {
      lastAssistantIndex = i;
      break;
    }
  }

  return (
    <div className="chat">
      <div className="chat-scroll" ref={scrollRef} onScroll={handleScroll}>
        <div className="chat-inner">
          {messages.length === 0 && (
            <div className="empty-state">
              <h2>How can I help?</h2>
              <p>Ask about code, ideas, or Shashwat's work.</p>
              <div className="suggestions">
                {SUGGESTIONS.map((s) => (
                  <button className="chip" key={s} type="button" onClick={() => applySuggestion(s)}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <Message
              key={m.id}
              message={m}
              streaming={streamingLast && i === messages.length - 1}
              canRegenerate={!busy && i === lastAssistantIndex}
              onRegenerate={onRegenerate}
            />
          ))}

          {status === "submitted" && (
            <div className="msg assistant">
              <span className="msg-role">Nova</span>
              <div className="bubble assistant">
                <span className="thinking" aria-label="Thinking">
                  <span />
                  <span />
                  <span />
                </span>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      <div className="composer-wrap">
        <div className="composer">
          <textarea
            ref={textareaRef}
            rows={1}
            placeholder="Message Nova…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          {busy ? (
            <button className="send-btn stop" type="button" onClick={onStop} aria-label="Stop">
              <Square size={13} fill="currentColor" />
            </button>
          ) : (
            <button
              className="send-btn"
              type="button"
              onClick={submit}
              disabled={!input.trim()}
              aria-label="Send message"
            >
              <ArrowUp size={17} />
            </button>
          )}
        </div>
        <div className="composer-hint">Enter to send · Shift + Enter for a new line</div>
      </div>
    </div>
  );
}