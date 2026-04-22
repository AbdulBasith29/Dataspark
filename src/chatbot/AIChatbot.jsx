import { useState, useEffect, useRef } from "react";
import { SYSTEM_PROMPTS } from "./system-prompts";
import { CHATBOT_CONFIG } from "./chatbot-config";

// Reusable AI Chatbot component, scoped per course.
// Expects a full `course` object (from CURRICULUM) and an `onClose` handler.

const buildSystemPrompt = (course) => {
  const base = SYSTEM_PROMPTS[course.id];
  const topics =
    course.topics
      ?.map((t) => `${t.title}: ${t.lessons?.map((l) => l.title).join(", ")}`)
      .join("\n") || "";

  const formattingAndScope = `

INTERVIEW CONTEXT:
- Relate concepts back to data science and ML interview scenarios when helpful.
- When relevant, suggest how the learner could structure a strong interview answer.

FORMATTING:
- Use markdown with short headings, bullet lists, and **bold** for key ideas.
- Use fenced code blocks with language tags, for example:

\`\`\`python
# example code here
\`\`\`

- Prefer short paragraphs over walls of text. Use inline \`code\` for identifiers.

OFF-TOPIC HANDLING:
- You are **strictly scoped** to this course's topic area.
- If the user asks about topics outside your scope, say **one concise sentence** that it's outside your specialty and explicitly point them to the more relevant tutor (e.g. "SQL tutor", "ML tutor").
- Do **not** dive deep into off-topic areas — always steer the conversation back to this course's domain.`;

  return `${base?.prompt || ""}

COURSE CONTEXT:
- Course title: ${course.title}
- Course topics and lessons:
${topics}
${formattingAndScope}`;
};

const AIChatbot = ({ course, onClose }) => {
  const [messages, setMessages] = useState(() => {
    const cfg = CHATBOT_CONFIG[course.id] || {};
    const tutorName = cfg.tutorName || SYSTEM_PROMPTS[course.id]?.name || "Tutor";
    return [
      {
        role: "assistant",
        content: `Hi! I'm **${tutorName}**, your **${course.title}** tutor. Ask me anything about this course — concepts, how things work, interview-style questions, or help with a specific problem. I’ll stay focused on **${course.title}** and closely related ideas.`,
      },
    ];
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const system = buildSystemPrompt(course);
      const prior = messages
        .filter((m, idx) => !(idx === 0 && m.role === "assistant"))
        .concat({ role: "user", content: userMsg })
        .map((m) => ({ role: m.role, content: m.content }));

      const resp = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          max_tokens: 800,
          system,
          messages: prior,
        }),
      });

      const data = await resp.json();
      if (!resp.ok || !data?.text) {
        const details =
          data?.details?.message ||
          data?.details?.error?.message ||
          data?.error ||
          "unknown_error";
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `I couldn't generate a response right now. Error: \`${details}\``,
          },
        ]);
        setLoading(false);
        return;
      }
      const text = data.text;

      setMessages((prev) => [...prev, { role: "assistant", content: text }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, I'm having trouble reaching the AI service right now. Please try again in a bit.",
        },
      ]);
    }

    setLoading(false);
  };

  const inlineCodeStyle = {
    background: "#1E293B",
    padding: "2px 6px",
    borderRadius: 4,
    fontSize: 12,
    fontFamily: "'JetBrains Mono', monospace",
    color: course.accent,
  };

  const renderInlineText = (segment, keyPrefix) => {
    // 1) inline code: `like this`
    const codeParts = segment.split(/(`[^`]*`)/g);
    const nodes = [];
    let partIdx = 0;

    for (const part of codeParts) {
      if (!part) continue;

      if (part.startsWith("`") && part.endsWith("`")) {
        const inner = part.slice(1, -1);
        nodes.push(
          <code key={`${keyPrefix}-code-${partIdx}`} style={inlineCodeStyle}>
            {inner}
          </code>
        );
        partIdx += 1;
        continue;
      }

      // 2) bold: **like this**
      const boldRegex = /\*\*(.+?)\*\*/g;
      let last = 0;
      let match;
      let boldIdx = 0;
      while ((match = boldRegex.exec(part)) !== null) {
        const before = part.slice(last, match.index);
        if (before) {
          nodes.push(
            <span key={`${keyPrefix}-t-${partIdx}-${boldIdx}`}>{before}</span>
          );
          boldIdx += 1;
        }
        nodes.push(
          <strong key={`${keyPrefix}-b-${partIdx}-${boldIdx}`}>
            {match[1]}
          </strong>
        );
        boldIdx += 1;
        last = match.index + match[0].length;
      }
      const after = part.slice(last);
      if (after) {
        nodes.push(
          <span key={`${keyPrefix}-t-${partIdx}-${boldIdx}`}>{after}</span>
        );
      }

      partIdx += 1;
    }

    return nodes;
  };

  const renderMessageContent = (text) => {
    const nodes = [];
    const fenceRegex = /```(\w+)?\n([\s\S]*?)```/g;
    let lastIndex = 0;
    let fenceIdx = 0;
    let segmentIdx = 0;

    const pushPlainText = (plain, idx) => {
      const lines = plain.split("\n");
      lines.forEach((line, lineIdx) => {
        const lineNodes = renderInlineText(line, `seg-${idx}-${lineIdx}`);
        nodes.push(
          <span key={`seg-${idx}-${lineIdx}`} style={{ whiteSpace: "pre-wrap" }}>
            {lineNodes}
          </span>
        );
        if (lineIdx < lines.length - 1) nodes.push(<br key={`br-${idx}-${lineIdx}`} />);
      });
    };

    let match;
    while ((match = fenceRegex.exec(text)) !== null) {
      const start = match.index;
      const before = text.slice(lastIndex, start);
      if (before) pushPlainText(before, segmentIdx);

      const lang = (match[1] || "").trim();
      const code = match[2] ?? "";

      nodes.push(
        <div
          key={`fence-${fenceIdx}`}
          style={{
            margin: "10px 0",
            background: "#0F172A",
            border: "1px solid #1E293B",
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          {lang ? (
            <div
              style={{
                background: "#1E293B",
                color: "#CBD5E1",
                fontFamily: "'JetBrains Mono'",
                fontSize: 11,
                padding: "6px 10px",
              }}
            >
              {lang}
            </div>
          ) : null}
          <pre
            style={{
              margin: 0,
              padding: "12px 14px",
              overflowX: "auto",
              fontFamily: "'JetBrains Mono', monospace",
              color: "#E2E8F0",
              fontSize: 12,
              lineHeight: 1.55,
            }}
          >
            <code>{code}</code>
          </pre>
        </div>
      );

      lastIndex = start + match[0].length;
      fenceIdx += 1;
      segmentIdx += 1;
    }

    const rest = text.slice(lastIndex);
    if (rest) pushPlainText(rest, segmentIdx);

    return nodes;
  };

  const tutorCfg = CHATBOT_CONFIG[course.id] || {};
  const tutorName = tutorCfg.tutorName || SYSTEM_PROMPTS[course.id]?.name || "Tutor";
  const headerIcon = tutorCfg.icon;
  const headerSubtitle = tutorCfg.scopeLabel || "AI-powered · Topic-scoped";
  const courseMark = course.mark;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        right: 0,
        width: "100%",
        maxWidth: 440,
        height: "70vh",
        background: "#0B1120",
        border: "1px solid #1E293B",
        borderRadius: "16px 16px 0 0",
        display: "flex",
        flexDirection: "column",
        zIndex: 1000,
        boxShadow: "0 -8px 40px rgba(0,0,0,0.5)",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "14px 20px",
          borderBottom: "1px solid #1E293B",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {courseMark ? (
            <span
              aria-hidden
              style={{
                width: 40,
                height: 40,
                minWidth: 40,
                borderRadius: 10,
                background: `linear-gradient(145deg, ${course.color}28, ${course.color}0a)`,
                border: `1px solid ${course.color}50`,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: courseMark.length > 3 ? 9 : 11,
                fontWeight: 700,
                color: course.color,
                letterSpacing: "0.03em",
              }}
            >
              {courseMark}
            </span>
          ) : headerIcon ? (
            <span style={{ fontSize: 20 }}>{headerIcon}</span>
          ) : null}
          <div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: "#F8FAFC",
                fontFamily: "'Outfit'",
              }}
            >
              {tutorName} · {course.title}
            </div>
            <div
              style={{
                fontSize: 10,
                color: course.accent,
                fontFamily: "'JetBrains Mono'",
              }}
            >
              {headerSubtitle}
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            color: "#64748B",
            fontSize: 20,
            cursor: "pointer",
            padding: 4,
          }}
        >
          ✕
        </button>
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: 16,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: m.role === "user" ? "flex-end" : "flex-start",
            }}
          >
            <div
              style={{
                maxWidth: "85%",
                padding: "10px 14px",
                borderRadius: 12,
                background:
                  m.role === "user" ? course.color + "20" : "#1E293B",
                border: `1px solid ${
                  m.role === "user" ? course.color + "30" : "#334155"
                }`,
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  color: "#CBD5E1",
                  lineHeight: 1.65,
                  fontFamily: "'Outfit'",
                }}
              >
                {renderMessageContent(m.content)}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", gap: 4, padding: "10px 14px" }}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: course.accent,
                  animation: `pulse 1s infinite ${i * 0.15}s`,
                }}
              />
            ))}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div
        style={{
          padding: "12px 16px",
          borderTop: "1px solid #1E293B",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder={`Ask about ${course.title.toLowerCase()}...`}
            style={{
              flex: 1,
              background: "#0F172A",
              border: "1px solid #334155",
              borderRadius: 10,
              padding: "10px 14px",
              color: "#F8FAFC",
              fontSize: 13,
              fontFamily: "'Outfit'",
              outline: "none",
            }}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            style={{
              background:
                input.trim() && !loading ? course.color : "#1E293B",
              border: "none",
              borderRadius: 10,
              padding: "10px 16px",
              color: "#fff",
              fontWeight: 700,
              fontSize: 13,
              cursor:
                input.trim() && !loading ? "pointer" : "not-allowed",
              fontFamily: "'Outfit'",
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChatbot;

