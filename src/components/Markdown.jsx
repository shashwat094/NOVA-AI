import CopyButton from "./CopyButton.jsx";

// Small, dependency-free renderer for the subset of markdown chat models
// actually emit: fenced code, inline code, bold, and bullet lists.
function renderInline(text, keyPrefix) {
  const regex = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  const nodes = [];
  let last = 0;
  let match;
  let i = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) {
      nodes.push(<span key={`${keyPrefix}-t${i++}`}>{text.slice(last, match.index)}</span>);
    }
    const token = match[0];
    if (token.startsWith("**")) {
      nodes.push(<strong key={`${keyPrefix}-b${i++}`}>{token.slice(2, -2)}</strong>);
    } else {
      nodes.push(
        <code className="inline-code" key={`${keyPrefix}-c${i++}`}>
          {token.slice(1, -1)}
        </code>,
      );
    }
    last = regex.lastIndex;
  }
  if (last < text.length) nodes.push(<span key={`${keyPrefix}-t${i++}`}>{text.slice(last)}</span>);
  return nodes;
}

function renderProse(text, keyPrefix) {
  const blocks = [];
  const lines = text.split("\n");
  let paragraph = [];
  let list = [];

  const flushParagraph = () => {
    if (!paragraph.length) return;
    const key = `${keyPrefix}-p${blocks.length}`;
    blocks.push(<p key={key}>{renderInline(paragraph.join("\n"), key)}</p>);
    paragraph = [];
  };

  const flushList = () => {
    if (!list.length) return;
    const key = `${keyPrefix}-ul${blocks.length}`;
    blocks.push(
      <ul key={key}>
        {list.map((item, idx) => (
          <li key={`${key}-${idx}`}>{renderInline(item, `${key}-${idx}`)}</li>
        ))}
      </ul>,
    );
    list = [];
  };

  for (const line of lines) {
    const bullet = line.match(/^\s*[-*]\s+(.*)$/);
    if (bullet) {
      flushParagraph();
      list.push(bullet[1]);
      continue;
    }
    if (!line.trim()) {
      flushParagraph();
      flushList();
      continue;
    }
    flushList();
    paragraph.push(line);
  }
  flushParagraph();
  flushList();
  return blocks;
}

export default function Markdown({ content }) {
  const parts = content.split(/(```[\s\S]*?```|```[\s\S]*$)/g).filter(Boolean);

  return parts.map((part, i) => {
    if (part.startsWith("```")) {
      const language = (part.match(/^```([a-zA-Z0-9+#-]*)/)?.[1] || "code").toLowerCase();
      const code = part
        .replace(/^```[a-zA-Z0-9+#-]*\n?/, "")
        .replace(/```\s*$/, "")
        .replace(/\n$/, "");
      return (
        <div className="code-block" key={`code-${i}`}>
          <div className="code-bar">
            <span>{language}</span>
            <CopyButton text={code} label="Copy" />
          </div>
          <pre>
            <code>{code}</code>
          </pre>
        </div>
      );
    }
    return <div key={`prose-${i}`}>{renderProse(part, `p${i}`)}</div>;
  });
}