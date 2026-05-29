import { useState } from "react";
import { DS, dsGlassCard } from "../../lib/ds-platform-tokens.js";
import { LEARNER_INTENTS } from "../../lib/use-learner-intent.js";

const MONO = "var(--ds-mono), monospace";
const SANS = "var(--ds-sans), sans-serif";

/**
 * IntentCard — a single selectable card in full mode. Real <button> for
 * keyboard accessibility, aria-pressed, visible focus ring.
 */
function IntentCard({ option, selected, onSelect }) {
  const [focused, setFocused] = useState(false);

  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={() => onSelect(option.id)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={dsGlassCard({
        display: "block",
        width: "100%",
        textAlign: "left",
        padding: "16px 18px",
        cursor: "pointer",
        font: "inherit",
        borderRadius: DS.radiusMd,
        border: `1px solid ${selected ? DS.ind : DS.border}`,
        background: selected ? "rgba(129,140,248,0.12)" : DS.cardGlass,
        transition: "box-shadow 0.15s ease, border-color 0.15s ease, background 0.15s ease",
        outline: "none",
        boxShadow: focused ? DS.focusRing : DS.shadowCard,
      })}
    >
      <span
        style={{
          display: "block",
          fontFamily: SANS,
          fontSize: 15,
          fontWeight: 600,
          color: selected ? DS.t1 : DS.t2,
        }}
      >
        {option.label}
      </span>
      <span
        style={{
          display: "block",
          marginTop: 6,
          fontFamily: SANS,
          fontSize: 13,
          lineHeight: 1.45,
          color: DS.t3,
        }}
      >
        {option.blurb}
      </span>
    </button>
  );
}

/**
 * IntentPill — a small inline pill button for compact (header) mode.
 */
function IntentPill({ option, selected, onSelect }) {
  const [focused, setFocused] = useState(false);

  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={() => onSelect(option.id)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        fontFamily: MONO,
        fontSize: 12,
        lineHeight: 1,
        padding: "7px 12px",
        cursor: "pointer",
        whiteSpace: "nowrap",
        borderRadius: 999,
        border: `1px solid ${selected ? DS.ind : DS.border}`,
        background: selected ? "rgba(129,140,248,0.14)" : DS.card,
        color: selected ? DS.t1 : DS.t3,
        transition: "box-shadow 0.15s ease, border-color 0.15s ease, background 0.15s ease",
        outline: "none",
        boxShadow: focused ? DS.focusRing : "none",
      }}
    >
      {option.label}
    </button>
  );
}

/**
 * IntentSelector — selection UI for the three learner intents (DS-106).
 *
 * Props:
 *   intent   — the currently selected intent id (or null).
 *   onSelect — called with the chosen id.
 *   compact  — when true, renders an inline pill row for header placement.
 */
export default function IntentSelector({ intent = null, onSelect, compact = false }) {
  const handleSelect = (id) => {
    if (typeof onSelect === "function") onSelect(id);
  };

  if (compact) {
    return (
      <div
        role="group"
        aria-label="Learner intent"
        style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}
      >
        {LEARNER_INTENTS.map((option) => (
          <IntentPill
            key={option.id}
            option={option}
            selected={intent === option.id}
            onSelect={handleSelect}
          />
        ))}
      </div>
    );
  }

  return (
    <section aria-label="Learner intent" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <h2
        style={{
          margin: 0,
          fontFamily: SANS,
          fontSize: 18,
          fontWeight: 700,
          color: DS.t1,
        }}
      >
        What brings you here?
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {LEARNER_INTENTS.map((option) => (
          <IntentCard
            key={option.id}
            option={option}
            selected={intent === option.id}
            onSelect={handleSelect}
          />
        ))}
      </div>
    </section>
  );
}
