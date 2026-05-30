import { useState } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

const ACCENT = "#F59E0B";
const GREEN = "#10B981";
const RED = "#F87171";
const BLUE = "#0EA5E9";
const PURPLE = "#8B5CF6";

// Normalization steps
const STEPS = [
  {
    id: "unnormalized",
    label: "Unnormalized",
    badge: "UNF",
    badgeColor: RED,
    anomaly: "Repeating groups: multiple courses stored in a single comma-separated column. Cannot query individual courses without string parsing.",
    fixed: null,
    tables: [
      {
        name: "student_courses",
        columns: ["student_id", "student_name", "dept", "dept_head", "courses"],
        rows: [
          { student_id: "S1", student_name: "Alice", dept: "CS", dept_head: "Prof. Kim", courses: "Math, Physics, CS101" },
          { student_id: "S2", student_name: "Bob", dept: "CS", dept_head: "Prof. Kim", courses: "CS101, CS201" },
          { student_id: "S3", student_name: "Carol", dept: "Math", dept_head: "Prof. Lee", courses: "Math, Stats" },
        ],
        highlight: ["courses"],
      },
    ],
  },
  {
    id: "1nf",
    label: "1st Normal Form",
    badge: "1NF",
    badgeColor: AMBER,
    anomaly: "Repeating groups eliminated — each cell is atomic. But the table has partial dependencies: student_name depends only on student_id, not on (student_id, course_id).",
    fixed: "Expanded multi-valued courses column into one row per course. Primary key is now (student_id, course_id).",
    tables: [
      {
        name: "student_courses",
        columns: ["student_id", "course_id", "student_name", "dept", "dept_head"],
        rows: [
          { student_id: "S1", course_id: "Math", student_name: "Alice", dept: "CS", dept_head: "Prof. Kim" },
          { student_id: "S1", course_id: "Physics", student_name: "Alice", dept: "CS", dept_head: "Prof. Kim" },
          { student_id: "S1", course_id: "CS101", student_name: "Alice", dept: "CS", dept_head: "Prof. Kim" },
          { student_id: "S2", course_id: "CS101", student_name: "Bob", dept: "CS", dept_head: "Prof. Kim" },
          { student_id: "S2", course_id: "CS201", student_name: "Bob", dept: "CS", dept_head: "Prof. Kim" },
          { student_id: "S3", course_id: "Math", student_name: "Carol", dept: "Math", dept_head: "Prof. Lee" },
          { student_id: "S3", course_id: "Stats", student_name: "Carol", dept: "Math", dept_head: "Prof. Lee" },
        ],
        highlight: ["student_name", "dept", "dept_head"],
        pkCols: ["student_id", "course_id"],
      },
    ],
  },
  {
    id: "2nf",
    label: "2nd Normal Form",
    badge: "2NF",
    badgeColor: ACCENT,
    anomaly: "Partial dependencies removed. But transitive dependency remains: dept_head depends on dept, and dept depends on student_id. Updating a dept head requires touching many rows.",
    fixed: "Split student attributes (student_name, dept) into a Students table. Enrollment facts stay in a junction table.",
    tables: [
      {
        name: "students",
        columns: ["student_id", "student_name", "dept"],
        rows: [
          { student_id: "S1", student_name: "Alice", dept: "CS" },
          { student_id: "S2", student_name: "Bob", dept: "CS" },
          { student_id: "S3", student_name: "Carol", dept: "Math" },
        ],
        highlight: [],
        pkCols: ["student_id"],
      },
      {
        name: "enrollments",
        columns: ["student_id", "course_id"],
        rows: [
          { student_id: "S1", course_id: "Math" },
          { student_id: "S1", course_id: "Physics" },
          { student_id: "S1", course_id: "CS101" },
          { student_id: "S2", course_id: "CS101" },
          { student_id: "S2", course_id: "CS201" },
          { student_id: "S3", course_id: "Math" },
          { student_id: "S3", course_id: "Stats" },
        ],
        highlight: [],
        pkCols: ["student_id", "course_id"],
      },
    ],
  },
  {
    id: "3nf",
    label: "3rd Normal Form",
    badge: "3NF",
    badgeColor: GREEN,
    anomaly: "No remaining transitive dependencies. Each non-key attribute depends only on the primary key. Update anomalies are eliminated.",
    fixed: "Extracted departments into its own table. dept_head now lives in departments, not in students.",
    tables: [
      {
        name: "departments",
        columns: ["dept", "dept_head"],
        rows: [
          { dept: "CS", dept_head: "Prof. Kim" },
          { dept: "Math", dept_head: "Prof. Lee" },
        ],
        highlight: [],
        pkCols: ["dept"],
      },
      {
        name: "students",
        columns: ["student_id", "student_name", "dept"],
        rows: [
          { student_id: "S1", student_name: "Alice", dept: "CS" },
          { student_id: "S2", student_name: "Bob", dept: "CS" },
          { student_id: "S3", student_name: "Carol", dept: "Math" },
        ],
        highlight: [],
        pkCols: ["student_id"],
      },
      {
        name: "enrollments",
        columns: ["student_id", "course_id"],
        rows: [
          { student_id: "S1", course_id: "Math" },
          { student_id: "S1", course_id: "CS101" },
          { student_id: "S2", course_id: "CS101" },
          { student_id: "S3", course_id: "Stats" },
        ],
        highlight: [],
        pkCols: ["student_id", "course_id"],
      },
    ],
  },
];

// Use ACCENT reference since it's defined at file scope; need the amber hex here
const AMBER = "#F59E0B";

const DRILL_QUESTIONS = [
  {
    id: "q1",
    question: "A table has PK (order_id, product_id). The column customer_name depends only on order_id. Which normal form is violated?",
    choices: [
      { id: "a", label: "1NF — there is a repeating group", correct: false },
      { id: "b", label: "2NF — partial dependency on part of the composite key", correct: true },
      { id: "c", label: "3NF — transitive dependency", correct: false },
      { id: "d", label: "BCNF — non-trivial dependency on a non-superkey", correct: false },
    ],
    explanation: "customer_name depends only on order_id, not on the full composite key (order_id, product_id). That is a partial dependency — the definition of a 2NF violation.",
  },
  {
    id: "q2",
    question: "After normalizing to 3NF you find read-heavy analytics queries are slow because they JOIN 5 tables. What is the most common trade-off?",
    choices: [
      { id: "a", label: "Roll back to 1NF to avoid any joins", correct: false },
      { id: "b", label: "Intentionally denormalize hot read paths (materialized views, star schema)", correct: true },
      { id: "c", label: "Remove all primary keys to speed up writes", correct: false },
      { id: "d", label: "Add more indexes until normalization is irrelevant", correct: false },
    ],
    explanation: "Normalization reduces write anomalies; denormalization (star schema, materialized views, wide tables) trades some update complexity for faster analytical reads. Both are legitimate design choices depending on workload.",
  },
];

function TableDisplay({ table }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 10, color: BLUE, fontFamily: "var(--ds-mono), monospace", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>
        {table.name}
        {table.pkCols && (
          <span style={{ color: DS.dim, fontWeight: 400, marginLeft: 8 }}>
            PK: ({table.pkCols.join(", ")})
          </span>
        )}
      </div>
      <div style={{ overflowX: "auto", borderRadius: 8, border: `1px solid ${DS.border}`, background: "rgba(2,6,23,0.5)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr>
              {table.columns.map((col) => {
                const isPk = table.pkCols && table.pkCols.includes(col);
                const isHighlighted = table.highlight && table.highlight.includes(col);
                return (
                  <th key={col} style={{
                    padding: "7px 10px",
                    textAlign: "left",
                    color: isPk ? AMBER : isHighlighted ? RED : DS.dim,
                    fontFamily: "var(--ds-mono), monospace",
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.07em",
                    textTransform: "uppercase",
                    borderBottom: `1px solid ${DS.border}`,
                    background: isHighlighted ? `${RED}08` : isPk ? `${AMBER}08` : "transparent",
                  }}>
                    {col}{isPk ? " (PK)" : ""}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, i) => (
              <tr key={i} style={{ borderBottom: `1px solid ${DS.border}22` }}>
                {table.columns.map((col) => {
                  const isHighlighted = table.highlight && table.highlight.includes(col);
                  return (
                    <td key={col} style={{
                      padding: "6px 10px",
                      color: isHighlighted ? RED : DS.t2,
                      fontFamily: "var(--ds-mono), monospace",
                      background: isHighlighted ? `${RED}06` : "transparent",
                      fontWeight: isHighlighted ? 600 : 400,
                    }}>
                      {row[col]}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function SQLNormalizationViz() {
  const [stepIdx, setStepIdx] = useState(0);
  const [drillAnswers, setDrillAnswers] = useState({});
  const [drillRevealed, setDrillRevealed] = useState({});

  const step = STEPS[stepIdx];

  function handleDrillPick(qid, cid) {
    if (drillRevealed[qid]) return;
    setDrillAnswers((prev) => ({ ...prev, [qid]: cid }));
  }
  function handleReveal(qid) {
    if (!drillAnswers[qid]) return;
    setDrillRevealed((prev) => ({ ...prev, [qid]: true }));
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <div style={{ fontSize: 11, color: DS.dim, fontFamily: "var(--ds-mono), monospace", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>
          Normalization: 1NF to 3NF
        </div>
        <p style={{ margin: 0, color: DS.t3, fontSize: 13, lineHeight: 1.6 }}>
          Start with a badly denormalized table and step through each normal form. Red columns show the anomaly being fixed at each stage.
        </p>
      </div>

      {/* Step progress bar */}
      <div style={{ display: "flex", gap: 0, borderRadius: 8, overflow: "hidden", border: `1px solid ${DS.border}` }}>
        {STEPS.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setStepIdx(i)}
            style={{
              flex: 1,
              padding: "10px 8px",
              border: "none",
              borderRight: i < STEPS.length - 1 ? `1px solid ${DS.border}` : "none",
              background: stepIdx === i ? `${s.badgeColor}18` : "rgba(255,255,255,0.02)",
              color: stepIdx === i ? s.badgeColor : DS.t3,
              fontSize: 12,
              fontWeight: stepIdx === i ? 800 : 500,
              cursor: "pointer",
              fontFamily: "var(--ds-mono), monospace",
              transition: "background 0.2s",
            }}
          >
            <div>{s.badge}</div>
            <div style={{ fontSize: 10, marginTop: 2, fontWeight: 400, color: stepIdx === i ? s.badgeColor : DS.dim }}>{s.label}</div>
          </button>
        ))}
      </div>

      {/* Navigation buttons */}
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <button
          type="button"
          onClick={() => setStepIdx((i) => Math.max(0, i - 1))}
          disabled={stepIdx === 0}
          style={{
            padding: "8px 18px",
            borderRadius: 6,
            border: `1.5px solid ${stepIdx === 0 ? DS.border : ACCENT}`,
            background: stepIdx === 0 ? "rgba(255,255,255,0.02)" : `${ACCENT}14`,
            color: stepIdx === 0 ? DS.dim : ACCENT,
            fontSize: 12,
            fontWeight: 700,
            cursor: stepIdx === 0 ? "default" : "pointer",
            fontFamily: "var(--ds-sans), sans-serif",
          }}
        >
          Previous step
        </button>
        <button
          type="button"
          onClick={() => setStepIdx((i) => Math.min(STEPS.length - 1, i + 1))}
          disabled={stepIdx === STEPS.length - 1}
          style={{
            padding: "8px 18px",
            borderRadius: 6,
            border: `1.5px solid ${stepIdx === STEPS.length - 1 ? DS.border : GREEN}`,
            background: stepIdx === STEPS.length - 1 ? "rgba(255,255,255,0.02)" : `${GREEN}14`,
            color: stepIdx === STEPS.length - 1 ? DS.dim : GREEN,
            fontSize: 12,
            fontWeight: 700,
            cursor: stepIdx === STEPS.length - 1 ? "default" : "pointer",
            fontFamily: "var(--ds-sans), sans-serif",
          }}
        >
          Next step
        </button>
        <span style={{ fontSize: 12, color: DS.dim, fontFamily: "var(--ds-mono), monospace" }}>
          {stepIdx + 1} / {STEPS.length}
        </span>
      </div>

      {/* Current step card */}
      <div style={{ padding: "16px 18px", borderRadius: 10, border: `1.5px solid ${step.badgeColor}44`, background: `${step.badgeColor}08` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <span style={{
            fontSize: 11,
            padding: "3px 10px",
            borderRadius: 999,
            background: `${step.badgeColor}22`,
            border: `1px solid ${step.badgeColor}44`,
            color: step.badgeColor,
            fontFamily: "var(--ds-mono), monospace",
            fontWeight: 700,
          }}>
            {step.badge}
          </span>
          <span style={{ fontSize: 15, fontWeight: 800, color: DS.t1 }}>{step.label}</span>
        </div>

        {step.fixed && (
          <div style={{ marginBottom: 10, padding: "8px 12px", borderRadius: 6, background: `${GREEN}0d`, border: `1px solid ${GREEN}33` }}>
            <span style={{ fontSize: 10, color: GREEN, fontFamily: "var(--ds-mono), monospace", fontWeight: 700 }}>CHANGE: </span>
            <span style={{ color: DS.t2, fontSize: 13 }}>{step.fixed}</span>
          </div>
        )}

        <div style={{ padding: "8px 12px", borderRadius: 6, background: `${step.badgeColor}0d`, border: `1px solid ${step.badgeColor}22`, marginBottom: 14 }}>
          <span style={{ fontSize: 10, color: step.badgeColor, fontFamily: "var(--ds-mono), monospace", fontWeight: 700 }}>
            {step.id === "unnormalized" || step.id === "1nf" ? "ANOMALY: " : step.id === "2nf" ? "REMAINING ISSUE: " : "STATUS: "}
          </span>
          <span style={{ color: DS.t2, fontSize: 13, lineHeight: 1.55 }}>{step.anomaly}</span>
        </div>

        {/* Tables */}
        {step.tables.map((t) => (
          <TableDisplay key={t.name} table={t} />
        ))}

        {step.tables.some((t) => t.highlight && t.highlight.length > 0) && (
          <div style={{ fontSize: 11, color: RED, marginTop: 4 }}>
            Red columns indicate the problematic dependencies being addressed at this step.
          </div>
        )}
      </div>

      {/* Normalization rules reference */}
      <div style={{ padding: "14px 16px", borderRadius: 10, border: `1px solid ${DS.border}`, background: "rgba(255,255,255,0.02)" }}>
        <div style={{ fontSize: 11, color: DS.dim, fontFamily: "var(--ds-mono), monospace", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>Normal form rules</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            { nf: "1NF", rule: "Atomic values only. No repeating groups or multi-valued columns. Rows are uniquely identifiable (PK exists).", color: RED },
            { nf: "2NF", rule: "1NF + no partial dependencies. Every non-key attribute depends on the WHOLE composite PK, not part of it.", color: AMBER },
            { nf: "3NF", rule: "2NF + no transitive dependencies. Non-key attributes must depend directly on the PK, not on another non-key column.", color: GREEN },
            { nf: "BCNF", rule: "Stricter 3NF: every determinant must be a candidate key. Resolves overlapping candidate keys that 3NF can miss.", color: PURPLE },
          ].map(({ nf, rule, color }) => (
            <div key={nf} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <span style={{
                flexShrink: 0,
                fontSize: 10,
                padding: "2px 8px",
                borderRadius: 4,
                background: `${color}18`,
                border: `1px solid ${color}44`,
                color,
                fontFamily: "var(--ds-mono), monospace",
                fontWeight: 700,
              }}>{nf}</span>
              <span style={{ fontSize: 12, color: DS.t3, lineHeight: 1.5 }}>{rule}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Drill */}
      <div style={{ padding: "16px 18px", borderRadius: 10, border: `1px solid ${ACCENT}33`, background: `${ACCENT}08` }}>
        <div style={{ fontSize: 11, color: ACCENT, fontFamily: "var(--ds-mono), monospace", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 14 }}>Quick Drill</div>
        {DRILL_QUESTIONS.map((q) => {
          const picked = drillAnswers[q.id];
          const revealed = drillRevealed[q.id];
          return (
            <div key={q.id} style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 13, color: DS.t1, fontWeight: 600, marginBottom: 10, lineHeight: 1.5 }}>{q.question}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {q.choices.map((c) => {
                  let border = `1.5px solid ${DS.border}`;
                  let bg = "rgba(255,255,255,0.02)";
                  let color = DS.t2;
                  if (picked === c.id && !revealed) { border = `1.5px solid ${ACCENT}`; bg = `${ACCENT}14`; color = ACCENT; }
                  if (revealed) {
                    if (c.correct) { border = `1.5px solid ${GREEN}`; bg = `${GREEN}14`; color = GREEN; }
                    else if (picked === c.id && !c.correct) { border = `1.5px solid ${RED}`; bg = `${RED}14`; color = RED; }
                  }
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleDrillPick(q.id, c.id)}
                      style={{
                        textAlign: "left",
                        padding: "8px 12px",
                        borderRadius: 6,
                        border,
                        background: bg,
                        color,
                        fontSize: 12,
                        cursor: revealed ? "default" : "pointer",
                        fontFamily: "var(--ds-sans), sans-serif",
                      }}
                    >
                      <strong>{c.id.toUpperCase()}.</strong> {c.label}
                    </button>
                  );
                })}
              </div>
              {picked && !revealed && (
                <button
                  type="button"
                  onClick={() => handleReveal(q.id)}
                  style={{ marginTop: 8, padding: "6px 14px", borderRadius: 6, border: `1px solid ${ACCENT}44`, background: `${ACCENT}14`, color: ACCENT, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "var(--ds-sans), sans-serif" }}
                >
                  Check answer
                </button>
              )}
              {revealed && (
                <div style={{ marginTop: 8, padding: "8px 12px", borderRadius: 6, background: `${GREEN}0d`, border: `1px solid ${GREEN}33`, color: DS.t2, fontSize: 12, lineHeight: 1.55 }}>
                  {q.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
