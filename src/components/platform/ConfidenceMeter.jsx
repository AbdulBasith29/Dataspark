import { DS } from "../../lib/ds-platform-tokens.js";

const meterLabel = {
  fontSize: 10,
  color: DS.dim,
  fontFamily: "var(--ds-mono), monospace",
  fontWeight: 700,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  marginBottom: 8,
};

/**
 * Compact 1–5 certainty rating control.
 *
 * @param {{
 *   value?: number,
 *   onChange?: (value: number) => void,
 *   label?: string,
 *   disabled?: boolean,
 * }} props
 */
export default function ConfidenceMeter({ value, onChange, label, disabled = false }) {
  const segments = [1, 2, 3, 4, 5];

  return (
    <div>
      <div style={meterLabel}>{label || "Certainty before answer"}</div>
      <div
        role="group"
        aria-label={label || "Certainty before answer"}
        style={{ display: "flex", gap: 6, flexWrap: "wrap" }}
      >
        {segments.map((seg) => {
          const selected = value === seg;
          return (
            <button
              key={seg}
              type="button"
              aria-pressed={selected}
              disabled={disabled}
              onClick={() => {
                if (!disabled && onChange) onChange(seg);
              }}
              style={{
                minWidth: 38,
                padding: "8px 12px",
                borderRadius: DS.radiusSm,
                border: `1px solid ${selected ? DS.ind : DS.border}`,
                background: selected ? `${DS.ind}1e` : "rgba(255,255,255,0.02)",
                color: selected ? DS.t1 : DS.t3,
                fontSize: 13,
                fontWeight: 600,
                fontFamily: "var(--ds-mono), monospace",
                cursor: disabled ? "not-allowed" : "pointer",
                opacity: disabled ? 0.5 : 1,
                outline: "none",
              }}
            >
              {seg}
            </button>
          );
        })}
      </div>
    </div>
  );
}
