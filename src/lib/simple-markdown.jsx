import { DS } from "./ds-platform-tokens.js";
import { renderInlineMarkdown } from "./inline-markdown.jsx";

/** Minimal markdown: ## / ### / #### headings, paragraphs, - lists, **bold**, `code`, tables. No deps. */

function parseTableRow(line) {
  return line.replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
}

function isSeparatorRow(line) {
  return /^\|[\s\-:|]+\|/.test(line);
}

export function SimpleMarkdown({ text, accent }) {
  if (!text?.trim()) return null;
  const lines = text.trim().split("\n");
  const out = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith("```")) {
      const language = line.slice(3).trim();
      i += 1;
      const codeLines = [];
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i += 1;
      }
      if (i < lines.length && lines[i].startsWith("```")) i += 1;
      out.push(
        <pre
          key={key++}
          style={{
            margin: "0 0 18px",
            padding: "14px 16px",
            overflowX: "auto",
            borderRadius: 12,
            border: `1px solid ${DS.border}`,
            background: "rgba(2,6,23,0.72)",
            color: DS.t1,
            fontSize: 13,
            lineHeight: 1.65,
            fontFamily: "var(--ds-mono), monospace",
          }}
        >
          <code data-language={language || undefined}>{codeLines.join("\n")}</code>
        </pre>,
      );
      continue;
    }
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
    if (line.startsWith("#### ")) {
      out.push(
        <h4
          key={key++}
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: DS.t2,
            margin: "16px 0 6px",
            fontFamily: "var(--ds-sans), sans-serif",
          }}
        >
          {line.slice(5).trim()}
        </h4>,
      );
      i += 1;
      continue;
    }
    if (line.trimStart().startsWith("|")) {
      const tableLines = [];
      while (i < lines.length && lines[i].trimStart().startsWith("|")) {
        tableLines.push(lines[i]);
        i += 1;
      }
      const nonSep = tableLines.filter((l) => !isSeparatorRow(l));
      if (nonSep.length > 0) {
        const [headerRow, ...bodyRows] = nonSep;
        const headers = parseTableRow(headerRow);
        out.push(
          <div key={key++} style={{ overflowX: "auto", margin: "0 0 18px" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, fontFamily: "var(--ds-sans), sans-serif" }}>
              <thead>
                <tr>
                  {headers.map((h, j) => (
                    <th
                      key={j}
                      style={{
                        padding: "8px 12px",
                        textAlign: "left",
                        fontWeight: 700,
                        color: DS.t1,
                        background: "rgba(255,255,255,0.05)",
                        borderBottom: `2px solid ${accent || DS.ind}`,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {renderInlineMarkdown(h)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bodyRows.map((row, ri) => (
                  <tr key={ri} style={{ borderBottom: `1px solid ${DS.border}` }}>
                    {parseTableRow(row).map((cell, ci) => (
                      <td
                        key={ci}
                        style={{
                          padding: "7px 12px",
                          color: DS.t2,
                          verticalAlign: "top",
                          lineHeight: 1.5,
                        }}
                      >
                        {renderInlineMarkdown(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>,
        );
      }
      continue;
    }
    if (line.startsWith("```")) {
      const language = line.slice(3).trim();
      i += 1;
      const codeLines = [];
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i += 1;
      }
      if (i < lines.length && lines[i].startsWith("```")) i += 1;
      out.push(
        <pre
          key={key++}
          style={{
            margin: "0 0 18px",
            padding: "14px 16px",
            overflowX: "auto",
            borderRadius: 12,
            border: `1px solid ${DS.border}`,
            background: "rgba(2,6,23,0.72)",
            color: DS.t1,
            fontSize: 13,
            lineHeight: 1.65,
            fontFamily: "var(--ds-mono), monospace",
          }}
        >
          <code data-language={language || undefined}>{codeLines.join("\n")}</code>
        </pre>,
      );
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
            <li key={j} style={{ marginBottom: 6 }}>{renderInlineMarkdown(item)}</li>
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
    while (i < lines.length && lines[i].trim() !== "" && !lines[i].startsWith("#") && !lines[i].startsWith("- ") && !lines[i].trimStart().startsWith("|")) {
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
        {renderInlineMarkdown(para.join(" "))}
      </p>,
    );
  }

  return <div style={{ fontFamily: "var(--ds-sans), sans-serif" }}>{out}</div>;
}
