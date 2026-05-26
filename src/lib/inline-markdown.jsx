import { DS } from "./ds-platform-tokens.js";

/** Render the inline subset shared by lesson summary bullets and SimpleMarkdown. */
export function renderInlineMarkdown(text) {
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
