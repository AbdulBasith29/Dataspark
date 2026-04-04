import { DS, dsGlassCard } from "../../lib/ds-platform-tokens.js";

/**
 * Wraps interactive lesson labs so they match landing “glass + mono label” language.
 */
export default function VizLabShell({ accent = DS.ind, accentSoft = "rgba(129,140,248,0.12)", children }) {
  return (
    <div
      style={{
        ...dsGlassCard({ overflow: "hidden" }),
        border: `1px solid ${DS.border}`,
        boxShadow: `${DS.shadowCard}, 0 0 0 1px ${accentSoft} inset`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 18px",
          borderBottom: `1px solid ${DS.border}`,
          background: `linear-gradient(90deg, ${accentSoft}, transparent 55%)`,
        }}
      >
        <span
          style={{
            fontSize: 9,
            fontFamily: "var(--ds-mono)",
            fontWeight: 700,
            letterSpacing: 1.6,
            color: accent,
          }}
        >
          INTERACTIVE LAB
        </span>
        <span style={{ flex: 1, height: 1, background: DS.border, opacity: 0.85 }} />
        <span style={{ fontSize: 10, color: DS.t3, fontFamily: "var(--ds-mono)" }}>Explore · no grades</span>
      </div>
      <div style={{ padding: "20px 20px 22px" }}>{children}</div>
    </div>
  );
}
