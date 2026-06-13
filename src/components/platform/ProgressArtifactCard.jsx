import React, { useState } from "react";
import { Check } from "lucide-react";
import { DS, dsGlassCard } from "../../lib/ds-platform-tokens.js";

const MONO = "var(--ds-mono), monospace";

function formatGeneratedDate() {
  try {
    return new Date().toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

/**
 * Pure helper: build a clean plaintext/markdown summary of the scorecard.
 * Defensive against missing/empty arrays and undefined values.
 */
export function buildSummaryMarkdown({
  completionRate,
  unlockedSkills = [],
  readinessMilestones = [],
  learnerName,
} = {}) {
  const skills = Array.isArray(unlockedSkills) ? unlockedSkills : [];
  const milestones = Array.isArray(readinessMilestones) ? readinessMilestones : [];
  const rate = typeof completionRate === "number" ? Math.round(completionRate) : 0;

  const lines = [];
  lines.push("# DataSpark · Python Progress");
  lines.push("");
  if (learnerName) lines.push(`Learner: ${learnerName}`);
  lines.push(`Completion: ${rate}%`);
  lines.push("");
  lines.push("## Skills unlocked");
  if (skills.length) {
    skills.forEach((s) => lines.push(`- ${s}`));
  } else {
    lines.push("- (none yet — keep going!)");
  }
  lines.push("");
  lines.push("## Interview readiness");
  if (milestones.length) {
    milestones.forEach((m) => lines.push(`- ${m}`));
  } else {
    lines.push("- (no milestones reached yet)");
  }
  lines.push("");
  lines.push(`Generated ${formatGeneratedDate()} · dataspark`);
  return lines.join("\n");
}

export default function ProgressArtifactCard({
  completionRate,
  unlockedSkills = [],
  readinessMilestones = [],
  learnerName,
}) {
  const [copied, setCopied] = useState(false);
  const [focused, setFocused] = useState(null);

  const skills = Array.isArray(unlockedSkills) ? unlockedSkills : [];
  const milestones = Array.isArray(readinessMilestones) ? readinessMilestones : [];
  const rate = typeof completionRate === "number" ? Math.round(completionRate) : 0;
  const generated = formatGeneratedDate();

  const summaryProps = {
    completionRate: rate,
    unlockedSkills: skills,
    readinessMilestones: milestones,
    learnerName,
  };

  const handleCopy = async () => {
    const md = buildSummaryMarkdown(summaryProps);
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(md);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // Clipboard can fail (permissions / insecure context); fail silently.
    }
  };

  const handleDownload = () => {
    const md = buildSummaryMarkdown(summaryProps);
    try {
      const blob = new Blob([md], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "dataspark-python-progress.md";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      // Best-effort download; ignore environments without DOM/Blob.
    }
  };

  // Conic-gradient progress ring around the completion rate.
  const ringSize = 96;
  const ringStyle = {
    width: ringSize,
    height: ringSize,
    borderRadius: "50%",
    background: `conic-gradient(${DS.ind} ${rate * 3.6}deg, rgba(255,255,255,0.07) ${rate * 3.6}deg)`,
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
  };
  const ringInner = {
    width: ringSize - 16,
    height: ringSize - 16,
    borderRadius: "50%",
    background: DS.bgElev,
    display: "grid",
    placeItems: "center",
    fontFamily: MONO,
    fontSize: 22,
    fontWeight: 700,
    color: DS.t1,
  };

  const buttonBase = (key) => ({
    appearance: "none",
    cursor: "pointer",
    fontFamily: MONO,
    fontSize: 13,
    fontWeight: 600,
    padding: "10px 16px",
    borderRadius: DS.radiusSm,
    border: `1px solid ${DS.border}`,
    background: DS.card,
    color: DS.t2,
    outline: "none",
    transition: "box-shadow 0.15s ease, border-color 0.15s ease",
    boxShadow: focused === key ? DS.focusRing : "none",
  });

  const sectionTitle = {
    margin: "0 0 8px",
    fontFamily: MONO,
    fontSize: 11,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: DS.t3,
  };

  const listItem = {
    display: "flex",
    alignItems: "center",
    gap: 8,
    color: DS.t2,
    fontSize: 14,
    lineHeight: 1.6,
  };

  const emptyText = { color: DS.dim, fontSize: 14, fontStyle: "italic", margin: 0 };

  return (
    <div>
      <div style={{ ...dsGlassCard({ padding: "24px 28px", maxWidth: 480 }) }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 20 }}>
          <div style={ringStyle}>
            <div style={ringInner}>{rate}%</div>
          </div>
          <div>
            <div
              style={{
                fontFamily: MONO,
                fontSize: 11,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: DS.ind,
                marginBottom: 4,
              }}
            >
              DataSpark · Python Progress
            </div>
            <h2 style={{ margin: 0, color: DS.t1, fontSize: 20 }}>
              {learnerName ? `${learnerName}'s scorecard` : "Your scorecard"}
            </h2>
          </div>
        </div>

        {/* Skills unlocked */}
        <div style={{ marginBottom: 18 }}>
          <p style={sectionTitle}>Skills unlocked</p>
          {skills.length ? (
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {skills.map((skill) => (
                <li key={skill} style={listItem}>
                  <span aria-hidden="true" style={{ color: DS.grn, flexShrink: 0 }}>
                    <Check size={14} strokeWidth={2.5} />
                  </span>
                  {skill}
                </li>
              ))}
            </ul>
          ) : (
            <p style={emptyText}>No skills unlocked yet — keep going!</p>
          )}
        </div>

        {/* Interview readiness */}
        <div style={{ marginBottom: 20 }}>
          <p style={sectionTitle}>Interview readiness</p>
          {milestones.length ? (
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {milestones.map((milestone) => (
                <li key={milestone} style={listItem}>
                  <span aria-hidden="true" style={{ color: DS.ind }}>
                    ★
                  </span>
                  {milestone}
                </li>
              ))}
            </ul>
          ) : (
            <p style={emptyText}>No milestones reached yet.</p>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            borderTop: `1px solid ${DS.border}`,
            paddingTop: 12,
            fontFamily: MONO,
            fontSize: 11,
            color: DS.dim,
          }}
        >
          Generated {generated} · dataspark
        </div>
      </div>

      {/* Action row */}
      <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
        <button
          type="button"
          onClick={handleCopy}
          onFocus={() => setFocused("copy")}
          onBlur={() => setFocused(null)}
          style={buttonBase("copy")}
        >
          {copied ? "Copied!" : "Copy summary"}
        </button>
        <button
          type="button"
          onClick={handleDownload}
          onFocus={() => setFocused("download")}
          onBlur={() => setFocused(null)}
          style={buttonBase("download")}
        >
          Download .md
        </button>
      </div>
    </div>
  );
}
