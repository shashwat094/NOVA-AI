import { RefreshCw } from "lucide-react";
import Markdown from "./Markdown.jsx";
import CopyButton from "./CopyButton.jsx";

export default function Message({ message, streaming, canRegenerate, onRegenerate }) {
  const isUser = message.role === "user";

  return (
    <div className={`msg ${isUser ? "user" : "assistant"}`}>
      <span className="msg-role">{isUser ? "You" : "Nova"}</span>
      <div className={`bubble ${isUser ? "user" : "assistant"}`}>
        {isUser ? message.content : <Markdown content={message.content} />}
        {streaming && <span className="caret" aria-hidden="true" />}
      </div>
      {!isUser && !streaming && message.content && (
        <div className="msg-actions">
          <CopyButton text={message.content} label="Copy" />
          {canRegenerate && (
            <button className="copy-btn" type="button" onClick={onRegenerate}>
              <RefreshCw size={13} />
              <span>Regenerate</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}