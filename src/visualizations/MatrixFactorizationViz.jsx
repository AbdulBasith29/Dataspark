import { useState } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

// ── Static data (all declared before component — TDZ safety) ─────────────────

const USERS = ["User A", "User B", "User C", "User D", "User E"];
const ITEMS = ["Film 1", "Film 2", "Film 3", "Film 4", "Film 5"];

// Original sparse matrix: null = unknown/missing
const R_MATRIX = [
  //  F1     F2     F3     F4     F5
  [5,    3,    null, null,  1   ], // User A
  [4,    null, null, 1,    1   ], // User B
  [1,    1,    null, 5,    4   ], // User C
  [null, null, 4,    4,    null], // User D
  [null, 1,    5,    4,    null], // User E
];

// User latent factor matrix U (5 users × 2 factors)
const U_MATRIX = [
  [0.90, 0.12],
  [0.82, 0.19],
  [0.14, 0.91],
  [0.21, 0.88],
  [0.18, 0.93],
];

// Item latent factor matrix Vt (2 factors × 5 items)
const VT_MATRIX = [
  [0.88, 0.76, 0.20, 0.18, 0.15],
  [0.11, 0.22, 0.91, 0.89, 0.80],
];

// Predicted (reconstructed) full matrix = U × Vt, clamped 1-5
const PRED_MATRIX = R_MATRIX.map((row, i) =>
  row.map((cell, j) => {
    const pred = U_MATRIX[i][0] * VT_MATRIX[0][j] + U_MATRIX[i][1] * VT_MATRIX[1][j];
    return Math.min(5, Math.max(1, pred * 5));
  })
);

// Which cells were originally missing (need highlighting in step 2)
const WAS_MISSING = R_MATRIX.map((row) => row.map((cell) => cell === null));

const BLUE = "#0EA5E9";
const AMBER = "#F59E0B";
const PURPLE = "#8B5CF6";
const GREEN = "#10B981";

const STEPS = [
  { label: "R", title: "Original Rating Matrix R" },
  { label: "Decompose", title: "Factor Matrices  U × Vᵀ" },
  { label: "Predict", title: "Reconstructed Predictions" },
];

// ── Sub-components ────────────────────────────────────────────────────────────

function StarRating({ value }) {
  const stars = Math.round(value);
  return (
    <span style={{ color: AMBER, fontSize: 10, letterSpacing: -1 }}>
      {"★".repeat(stars)}
      {"☆".repeat(5 - stars)}
    </span>
  );
}

function MatrixCell({ value, isMissing, showPred, isHeader, isRowHeader }) {
  const base = {
    width: isRowHeader ? 52 : 52,
    height: isHeader ? 24 : 44,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    fontSize: isHeader ? 10 : 12,
    fontFamily: isHeader ? "var(--ds-sans), sans-serif" : "var(--ds-mono), monospace",
    fontWeight: isHeader ? 600 : 400,
    borderRadius: 4,
    transition: "all 0.25s",
  };

  if (isHeader) {
    return (
      <div style={{ ...base, color: "#94A3B8", background: "transparent" }}>
        {value}
      </div>
    );
  }

  if (isRowHeader) {
    return (
      <div
        style={{
          ...base,
          width: 58,
          color: "#94A3B8",
          fontSize: 10,
          background: "transparent",
          fontFamily: "var(--ds-sans), sans-serif",
          fontWeight: 600,
        }}
      >
        {value}
      </div>
    );
  }

  if (showPred && isMissing) {
    // Predicted (was unknown)
    return (
      <div
        style={{
          ...base,
          background: `${AMBER}22`,
          border: `1.5px solid ${AMBER}55`,
          color: AMBER,
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 700 }}>{value.toFixed(1)}</div>
        <StarRating value={value} />
      </div>
    );
  }

  if (showPred && !isMissing) {
    // Known (reconstructed)
    return (
      <div
        style={{
          ...base,
          background: `${GREEN}14`,
          border: `1px solid ${GREEN}33`,
          color: GREEN,
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 700 }}>{value.toFixed(1)}</div>
        <StarRating value={value} />
      </div>
    );
  }

  if (value === null) {
    return (
      <div
        style={{
          ...base,
          background: "rgba(255,255,255,0.02)",
          border: "1px dashed rgba(255,255,255,0.1)",
          color: "#374151",
        }}
      >
        ?
      </div>
    );
  }

  return (
    <div
      style={{
        ...base,
        background: `${BLUE}18`,
        border: `1px solid ${BLUE}33`,
        color: "#E2E8F0",
      }}
    >
      <div style={{ fontSize: 13, fontWeight: 700 }}>{value}</div>
      <StarRating value={value} />
    </div>
  );
}

function OriginalMatrix() {
  return (
    <div>
      <div style={{ display: "flex", gap: 3, marginBottom: 3 }}>
        {/* empty corner */}
        <div style={{ width: 58 }} />
        {ITEMS.map((item) => (
          <MatrixCell key={item} value={item} isHeader />
        ))}
      </div>
      {USERS.map((user, i) => (
        <div key={user} style={{ display: "flex", gap: 3, marginBottom: 3 }}>
          <MatrixCell value={user} isRowHeader />
          {R_MATRIX[i].map((cell, j) => (
            <MatrixCell key={j} value={cell} isMissing={cell === null} />
          ))}
        </div>
      ))}
    </div>
  );
}

function FactorMatrix({ title, data, rowLabels, colLabels, color }) {
  return (
    <div>
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          color,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          marginBottom: 6,
          textAlign: "center",
        }}
      >
        {title}
      </div>
      {/* col header */}
      <div style={{ display: "flex", gap: 3, marginBottom: 3, paddingLeft: 40 }}>
        {colLabels.map((c) => (
          <div
            key={c}
            style={{
              width: 38,
              fontSize: 9,
              color: "#64748B",
              textAlign: "center",
              fontFamily: "var(--ds-mono), monospace",
            }}
          >
            {c}
          </div>
        ))}
      </div>
      {data.map((row, i) => (
        <div key={i} style={{ display: "flex", gap: 3, alignItems: "center", marginBottom: 3 }}>
          <div
            style={{
              width: 36,
              fontSize: 9,
              color: "#64748B",
              fontFamily: "var(--ds-mono), monospace",
              textAlign: "right",
              paddingRight: 4,
              flexShrink: 0,
            }}
          >
            {rowLabels[i]}
          </div>
          {row.map((val, j) => (
            <div
              key={j}
              style={{
                width: 38,
                height: 28,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: `${color}16`,
                border: `1px solid ${color}33`,
                borderRadius: 4,
                fontSize: 10.5,
                color: color,
                fontFamily: "var(--ds-mono), monospace",
              }}
            >
              {val.toFixed(2)}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function PredictedMatrix() {
  return (
    <div>
      <div style={{ display: "flex", gap: 3, marginBottom: 3 }}>
        <div style={{ width: 58 }} />
        {ITEMS.map((item) => (
          <MatrixCell key={item} value={item} isHeader />
        ))}
      </div>
      {USERS.map((user, i) => (
        <div key={user} style={{ display: "flex", gap: 3, marginBottom: 3 }}>
          <MatrixCell value={user} isRowHeader />
          {PRED_MATRIX[i].map((cell, j) => (
            <MatrixCell
              key={j}
              value={cell}
              isMissing={WAS_MISSING[i][j]}
              showPred
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function MatrixFactorizationViz() {
  const [step, setStep] = useState(0);

  const containerStyle = {
    fontFamily: "var(--ds-sans), sans-serif",
    background: "rgba(2,6,23,0.72)",
    borderRadius: 12,
    border: "1px solid rgba(14,165,233,0.18)",
    padding: "20px 22px",
    maxWidth: 520,
    margin: "0 auto",
    color: "#E2E8F0",
  };

  const cardStyle = {
    background: "rgba(255,255,255,0.02)",
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.06)",
    padding: "14px 16px",
  };

  return (
    <div style={containerStyle}>
      {/* Title */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#F1F5F9", marginBottom: 2 }}>
          Matrix Factorization
        </div>
        <div style={{ fontSize: 12, color: "#64748B" }}>
          Decompose sparse ratings matrix R ≈ U × Vᵀ to predict missing values
        </div>
      </div>

      {/* Step buttons */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
        {STEPS.map((s, idx) => (
          <button
            key={idx}
            onClick={() => setStep(idx)}
            style={{
              flex: 1,
              padding: "7px 6px",
              borderRadius: 8,
              border: `1.5px solid ${step === idx ? BLUE : "rgba(255,255,255,0.1)"}`,
              background:
                step === idx ? `${BLUE}22` : "rgba(255,255,255,0.03)",
              color: step === idx ? BLUE : "#6B7280",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Step title */}
      <div
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: "#94A3B8",
          marginBottom: 10,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        {STEPS[step].title}
      </div>

      {/* Step content */}
      <div style={cardStyle}>
        {step === 0 && (
          <div>
            <OriginalMatrix />
            <div style={{ marginTop: 10, fontSize: 11, color: "#475569" }}>
              <span style={{ color: BLUE, fontWeight: 600 }}>■</span> Known ratings &nbsp;
              <span style={{ color: "#374151", fontWeight: 600 }}>?</span> Missing — to be predicted
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              <FactorMatrix
                title="U — User Factors"
                data={U_MATRIX}
                rowLabels={["A", "B", "C", "D", "E"]}
                colLabels={["f1", "f2"]}
                color={BLUE}
              />

              {/* × symbol */}
              <div
                style={{
                  fontSize: 22,
                  color: "#475569",
                  alignSelf: "center",
                  paddingTop: 14,
                }}
              >
                ×
              </div>

              <FactorMatrix
                title="Vᵀ — Item Factors"
                data={VT_MATRIX}
                rowLabels={["f1", "f2"]}
                colLabels={["F1", "F2", "F3", "F4", "F5"]}
                color={PURPLE}
              />
            </div>

            <div style={{ marginTop: 12, fontSize: 11, color: "#475569" }}>
              Latent factors capture hidden patterns — e.g. genre preference vs. blockbuster taste.
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <PredictedMatrix />
            <div style={{ marginTop: 10, fontSize: 11, color: "#475569" }}>
              <span style={{ color: GREEN, fontWeight: 600 }}>■</span> Known (reconstructed) &nbsp;
              <span style={{ color: AMBER, fontWeight: 600 }}>■</span> Predicted (was missing)
            </div>
          </div>
        )}
      </div>

      {/* Bottom explanation */}
      <div
        style={{
          marginTop: 12,
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 8,
        }}
      >
        {[
          { label: "Latent factors", value: "2", color: BLUE },
          { label: "Known ratings", value: "13 / 25", color: GREEN },
          { label: "To predict", value: "12 / 25", color: AMBER },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 8,
              padding: "8px 10px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: 17,
                fontWeight: 700,
                color: stat.color,
                fontFamily: "var(--ds-mono), monospace",
              }}
            >
              {stat.value}
            </div>
            <div style={{ fontSize: 10, color: "#475569", marginTop: 2 }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
