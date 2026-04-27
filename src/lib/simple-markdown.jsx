import { DS } from "./ds-platform-tokens.js";

/** Minimal markdown: ## / ### headings, paragraphs, - lists, **bold**, `code`. No deps. */
function renderInline(text) {
  if (!text) return null;
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={i}
          style={{
            fontFamily: "var(--ds-mono), monospace",
            fontSize: "0.9em",
            background: "rgba(255,255,255,0.06)",
            padding: "2px 6px",
            borderRadius: 6,
            border: `1px solid ${DS.border}`,
            color: DS.t1,
          }}
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} style={{ color: DS.t1, fontWeight: 700 }}>{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
}

export function SimpleMarkdown({ text, accent }) {
  if (!text?.trim()) return null;
  const lines = text.trim().split("\n");
  const out = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith("## ")) {
      out.push(
        <h2
          key={key++}
          style={{
            fontSize: 17,
            fontWeight: 800,
            color: DS.t1,
            margin: "28px 0 12px",
            letterSpacing: "-0.02em",
            fontFamily: "var(--ds-sans), sans-serif",
            borderLeft: `3px solid ${accent || DS.ind}`,
            paddingLeft: 12,
          }}
        >
          {line.slice(3).trim()}
        </h2>,
      );
      i += 1;
      continue;
    }
    if (line.startsWith("### ")) {
      out.push(
        <h3
          key={key++}
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: accent || DS.ind,
            margin: "20px 0 8px",
            fontFamily: "var(--ds-sans), sans-serif",
          }}
        >
          {line.slice(4).trim()}
        </h3>,
      );
      i += 1;
      continue;
    }
    if (line.startsWith("- ")) {
      const items = [];
      while (i < lines.length && lines[i].startsWith("- ")) {
        items.push(lines[i].slice(2).trim());
        i += 1;
      }
      out.push(
        <ul
          key={key++}
          style={{
            margin: "0 0 16px",
            paddingLeft: 22,
            color: DS.t2,
            lineHeight: 1.75,
            fontSize: 15,
          }}
        >
          {items.map((item, j) => (
            <li key={j} style={{ marginBottom: 6 }}>{renderInline(item)}</li>
          ))}
        </ul>,
      );
      continue;
    }
    if (line.trim() === "") {
      i += 1;
      continue;
    }
    const para = [];
    // Always consume the current line as a paragraph line so the loop makes
    // progress even when the line starts with `#` but isn't a recognized
    // heading (e.g. a bare Python comment like `# A` at column 0). Without
    // this safeguard the outer while hangs forever.
    para.push(lines[i]);
    i += 1;
    while (i < lines.length && lines[i].trim() !== "" && !lines[i].startsWith("#") && !lines[i].startsWith("- ")) {
      para.push(lines[i]);
      i += 1;
    }
    out.push(
      <p
        key={key++}
        style={{
          margin: "0 0 16px",
          color: DS.t2,
          lineHeight: 1.8,
          fontSize: 15,
          fontWeight: 400,
        }}
      >
        {renderInline(para.join(" "))}
      </p>,
    );
  }

  return <div style={{ fontFamily: "var(--ds-sans), sans-serif" }}>{out}</div>;
}
