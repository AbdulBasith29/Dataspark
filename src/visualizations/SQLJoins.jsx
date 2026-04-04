import { useMemo, useState } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

const JOIN_TYPES = [
  "INNER JOIN",
  "LEFT JOIN",
  "RIGHT JOIN",
  "FULL OUTER JOIN",
  "LEFT ANTI JOIN",
  "RIGHT ANTI JOIN",
];

/** Realistic tiny warehouse — same semantics as before, clearer column names */
const employees = [
  { employee_id: 101, full_name: "Alice Chen", dept: "Sales" },
  { employee_id: 102, full_name: "Bob Iyer", dept: "Marketing" },
  { employee_id: 103, full_name: "Carol Diaz", dept: "Finance" },
  { employee_id: 104, full_name: "David Park", dept: "Sales" },
];

const departments = [
  { dept: "Sales", manager: "Sara Okonkwo", headcount_budget: 12 },
  { dept: "Finance", manager: "Fred Martins", headcount_budget: 6 },
  { dept: "HR", manager: "Hannah Li", headcount_budget: 4 },
];

const KEY = "dept";

function computeJoinRows(joinType) {
  const rows = [];

  if (joinType === "INNER JOIN") {
    employees.forEach((e) => {
      departments.filter((d) => d[KEY] === e[KEY]).forEach((d) => rows.push({ e, d }));
    });
  } else if (joinType === "LEFT JOIN") {
    employees.forEach((e) => {
      const matches = departments.filter((d) => d[KEY] === e[KEY]);
      if (matches.length === 0) rows.push({ e, d: null });
      else matches.forEach((d) => rows.push({ e, d }));
    });
  } else if (joinType === "RIGHT JOIN") {
    departments.forEach((d) => {
      const matches = employees.filter((e) => e[KEY] === d[KEY]);
      if (matches.length === 0) rows.push({ e: null, d });
      else matches.forEach((e) => rows.push({ e, d }));
    });
  } else if (joinType === "FULL OUTER JOIN") {
    const seenPairs = new Set();
    employees.forEach((e) => {
      const matches = departments.filter((d) => d[KEY] === e[KEY]);
      if (matches.length === 0) rows.push({ e, d: null });
      else {
        matches.forEach((d) => {
          seenPairs.add(`${e.employee_id}|${d.manager}`);
          rows.push({ e, d });
        });
      }
    });
    departments.forEach((d) => {
      const matches = employees.filter((e) => e[KEY] === d[KEY]);
      if (matches.length === 0) rows.push({ e: null, d });
      else {
        matches.forEach((e) => {
          const k = `${e.employee_id}|${d.manager}`;
          if (!seenPairs.has(k)) rows.push({ e, d });
        });
      }
    });
  } else if (joinType === "LEFT ANTI JOIN") {
    employees.forEach((e) => {
      if (!departments.some((d) => d[KEY] === e[KEY])) rows.push({ e, d: null });
    });
  } else if (joinType === "RIGHT ANTI JOIN") {
    departments.forEach((d) => {
      if (!employees.some((e) => e[KEY] === d[KEY])) rows.push({ e: null, d });
    });
  }

  return rows;
}

function employeeHasDeptMatch(e) {
  return departments.some((d) => d[KEY] === e[KEY]);
}

function departmentHasEmployeeMatch(d) {
  return employees.some((e) => e[KEY] === d[KEY]);
}

function leftRowVisual(e, joinType) {
  const m = employeeHasDeptMatch(e);
  switch (joinType) {
    case "INNER JOIN":
      return m ? "active" : "muted";
    case "LEFT JOIN":
      return "active";
    case "RIGHT JOIN":
      return m ? "active" : "muted";
    case "FULL OUTER JOIN":
      return "active";
    case "LEFT ANTI JOIN":
      return m ? "muted" : "active";
    case "RIGHT ANTI JOIN":
      return "muted";
    default:
      return "active";
  }
}

function rightRowVisual(d, joinType) {
  const m = departmentHasEmployeeMatch(d);
  switch (joinType) {
    case "INNER JOIN":
      return m ? "active" : "muted";
    case "LEFT JOIN":
      return m ? "active" : "muted";
    case "RIGHT JOIN":
      return "active";
    case "FULL OUTER JOIN":
      return "active";
    case "LEFT ANTI JOIN":
      return "muted";
    case "RIGHT ANTI JOIN":
      return m ? "muted" : "active";
    default:
      return "active";
  }
}

function sqlForJoin(joinType) {
  const antiLeft = `SELECT e.*
FROM employees e
WHERE NOT EXISTS (
  SELECT 1 FROM departments d WHERE d.dept = e.dept
);`;
  const antiRight = `SELECT d.*
FROM departments d
WHERE NOT EXISTS (
  SELECT 1 FROM employees e WHERE e.dept = d.dept
);`;

  if (joinType === "LEFT ANTI JOIN") return antiLeft;
  if (joinType === "RIGHT ANTI JOIN") return antiRight;

  return `SELECT
  e.employee_id,
  e.full_name,
  e.dept        AS dept_code,
  d.manager,
  d.headcount_budget
FROM employees e
${joinType} departments d
  ON e.dept = d.dept;`;
}

const ide = {
  surface: "rgba(13, 17, 23, 0.95)",
  headerBg: "rgba(22, 27, 34, 0.98)",
  grid: "rgba(255,255,255,0.08)",
  text: DS.t1,
  muted: DS.dim,
  keyAccent: "rgba(129, 140, 248, 0.35)",
  rowActive: "rgba(99, 102, 241, 0.12)",
  rowMuted: "rgba(255,255,255,0.02)",
  mono: "var(--ds-mono), 'JetBrains Mono', ui-monospace, monospace",
};

function NullCell() {
  return (
    <span
      style={{
        color: ide.muted,
        fontStyle: "italic",
        fontWeight: 400,
        letterSpacing: "0.02em",
      }}
    >
      NULL
    </span>
  );
}

function SchemaTable({ title, schema, children }) {
  return (
    <div
      style={{
        border: `1px solid ${ide.grid}`,
        borderRadius: 8,
        overflow: "hidden",
        background: ide.surface,
        minWidth: 0,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 8,
          padding: "8px 12px",
          borderBottom: `1px solid ${ide.grid}`,
          background: ide.headerBg,
          fontFamily: ide.mono,
          fontSize: 11,
        }}
      >
        <span style={{ color: DS.ind, fontWeight: 600 }}>{title}</span>
        <span style={{ color: ide.muted, fontSize: 10 }}>{schema}</span>
      </div>
      {children}
    </div>
  );
}

function SqlStrip({ sql }) {
  return (
    <pre
      style={{
        margin: 0,
        padding: "12px 14px",
        fontFamily: ide.mono,
        fontSize: 11,
        lineHeight: 1.55,
        color: DS.t2,
        background: "rgba(0,0,0,0.35)",
        border: `1px solid ${ide.grid}`,
        borderRadius: 8,
        overflowX: "auto",
        whiteSpace: "pre",
      }}
    >
      {sql}
    </pre>
  );
}

export default function SQLJoins() {
  const [joinType, setJoinType] = useState("INNER JOIN");
  const [hoverResultIdx, setHoverResultIdx] = useState(null);

  const resultRows = useMemo(() => computeJoinRows(joinType), [joinType]);
  const sql = useMemo(() => sqlForJoin(joinType), [joinType]);

  const explanation = {
    "INNER JOIN": "Only keys that exist on both sides appear. Unmatched employees and orphan departments drop out.",
    "LEFT JOIN": "Every employee row is preserved; department columns are NULL when there is no matching dept row.",
    "RIGHT JOIN": "Every department row is preserved; employee columns are NULL when no one is assigned to that dept.",
    "FULL OUTER JOIN": "Union of both sides: expect NULL pads wherever a row has no partner.",
    "LEFT ANTI JOIN": "Employees in depts that do not exist in the dimension table — classic data-quality red flag.",
    "RIGHT ANTI JOIN": "Departments with zero mapped employees — org structure or ETL gap.",
  };

  return (
    <div>
      <div style={{ fontSize: 17, fontWeight: 700, color: DS.t1, fontFamily: "var(--ds-sans), sans-serif", marginBottom: 6 }}>
        Join execution view
      </div>
      <p style={{ fontSize: 12, color: DS.t3, fontFamily: ide.mono, lineHeight: 1.6, marginBottom: 14 }}>
        Source tables use a warehouse-style layout. Toggle the join — rows dim when they do not participate; the result set is a single wide table like BigQuery / Snowflake / pgAdmin.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: 12,
          marginBottom: 14,
        }}
        className="sql-joins-sources"
      >
        <SchemaTable title="employees" schema="e · prod.hr.employees">
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: ide.mono, fontSize: 11 }}>
            <thead>
              <tr style={{ background: ide.headerBg }}>
                <th style={th(false)}>employee_id</th>
                <th style={th(false)}>full_name</th>
                <th style={th(true)}>dept</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((e) => {
                const v = leftRowVisual(e, joinType);
                const pulse =
                  hoverResultIdx !== null &&
                  resultRows[hoverResultIdx]?.e?.employee_id === e.employee_id;
                return (
                  <tr
                    key={e.employee_id}
                    style={trSource(v, pulse)}
                  >
                    <td style={tdNum()}>{e.employee_id}</td>
                    <td style={td()}>{e.full_name}</td>
                    <td style={tdKey(v)}>{e.dept}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </SchemaTable>

        <SchemaTable title="departments" schema="d · prod.hr.departments">
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: ide.mono, fontSize: 11 }}>
            <thead>
              <tr style={{ background: ide.headerBg }}>
                <th style={th(true)}>dept</th>
                <th style={th(false)}>manager</th>
                <th style={th(false)}>headcount_budget</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((d) => {
                const v = rightRowVisual(d, joinType);
                const pulse =
                  hoverResultIdx !== null &&
                  resultRows[hoverResultIdx]?.d?.dept === d.dept &&
                  resultRows[hoverResultIdx]?.d !== null;
                return (
                  <tr key={d.dept} style={trSource(v, pulse)}>
                    <td style={tdKey(v)}>{d.dept}</td>
                    <td style={td()}>{d.manager}</td>
                    <td style={tdNum()}>{d.headcount_budget}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </SchemaTable>
      </div>

      <div style={{ marginBottom: 12, display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
        <label style={{ fontSize: 11, color: DS.t3, fontFamily: ide.mono, fontWeight: 600 }}>JOIN operator</label>
        <select
          value={joinType}
          onChange={(e) => setJoinType(e.target.value)}
          aria-label="Join type"
          style={{
            background: ide.surface,
            borderRadius: 6,
            border: `1px solid ${ide.grid}`,
            padding: "8px 12px",
            color: DS.t1,
            fontSize: 12,
            fontFamily: ide.mono,
            outline: "none",
            minWidth: 200,
          }}
        >
          {JOIN_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <span style={{ fontSize: 11, color: ide.muted, fontFamily: ide.mono }}>
          {resultRows.length} row{resultRows.length === 1 ? "" : "s"} · ON e.dept = d.dept
        </span>
      </div>

      <SqlStrip sql={sql} />

      <div style={{ marginTop: 14, marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
        <span style={{ fontSize: 10, fontFamily: ide.mono, fontWeight: 700, letterSpacing: "0.14em", color: DS.grn }}>
          RESULT SET
        </span>
        <span style={{ fontSize: 11, color: ide.muted, fontFamily: ide.mono }}>Hover a row to trace sources</span>
      </div>

      <div
        style={{
          border: `1px solid ${ide.grid}`,
          borderRadius: 8,
          overflow: "auto",
          background: ide.surface,
          maxHeight: 320,
        }}
      >
        <table style={{ width: "100%", minWidth: 640, borderCollapse: "collapse", fontFamily: ide.mono, fontSize: 11 }}>
          <thead>
            <tr style={{ position: "sticky", top: 0, background: ide.headerBg, zIndex: 1, boxShadow: `0 1px 0 ${ide.grid}` }}>
              <th style={th(false)}>#</th>
              <th style={th(false)}>e.employee_id</th>
              <th style={th(false)}>e.full_name</th>
              <th style={th(true)}>e.dept</th>
              <th style={th(false)}>d.manager</th>
              <th style={th(false)}>d.headcount_budget</th>
            </tr>
          </thead>
          <tbody>
            {resultRows.map((row, idx) => (
              <tr
                key={idx}
                onMouseEnter={() => setHoverResultIdx(idx)}
                onMouseLeave={() => setHoverResultIdx(null)}
                style={{
                  background: idx % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent",
                  cursor: "default",
                  outline: hoverResultIdx === idx ? `1px solid ${DS.ind}55` : "none",
                  outlineOffset: -1,
                }}
              >
                <td style={{ ...tdNum(), color: ide.muted, fontSize: 10 }}>{idx + 1}</td>
                <td style={tdNum()}>{row.e ? row.e.employee_id : <NullCell />}</td>
                <td style={td()}>{row.e ? row.e.full_name : <NullCell />}</td>
                <td style={{ ...td(), fontWeight: 600, background: "rgba(129, 140, 248, 0.06)" }}>
                  {row.e ? row.e.dept : row.d ? row.d.dept : <NullCell />}
                </td>
                <td style={td()}>{row.d ? row.d.manager : <NullCell />}</td>
                <td style={tdNum()}>{row.d ? row.d.headcount_budget : <NullCell />}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {resultRows.length === 0 && (
          <div style={{ padding: 24, textAlign: "center", color: ide.muted, fontFamily: ide.mono, fontSize: 12 }}>
            Empty result — no rows satisfy this join.
          </div>
        )}
      </div>

      <p style={{ marginTop: 14, fontSize: 12, color: DS.t3, lineHeight: 1.65, fontFamily: "var(--ds-sans), sans-serif" }}>
        {explanation[joinType]}
      </p>

      <style>{`
        @media (max-width: 720px) {
          .sql-joins-sources { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

function th(isKey) {
  return {
    textAlign: "left",
    padding: "8px 10px",
    color: isKey ? DS.ind : DS.t3,
    fontWeight: 600,
    fontSize: 10,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    borderBottom: `1px solid ${ide.grid}`,
    borderRight: `1px solid ${ide.grid}`,
    whiteSpace: "nowrap",
    boxShadow: isKey ? `inset 0 -2px 0 ${DS.ind}99` : "none",
  };
}

function td() {
  return {
    padding: "7px 10px",
    borderBottom: `1px solid ${ide.grid}`,
    borderRight: `1px solid ${ide.grid}`,
    color: ide.text,
  };
}

function tdNum() {
  return {
    ...td(),
    textAlign: "right",
    fontVariantNumeric: "tabular-nums",
  };
}

function tdKey(visual) {
  return {
    ...td(),
    background:
      visual === "active"
        ? "rgba(129, 140, 248, 0.08)"
        : visual === "muted"
          ? "transparent"
          : "rgba(129, 140, 248, 0.06)",
    fontWeight: 600,
    color: visual === "muted" ? ide.muted : DS.t2,
  };
}

function trSource(visual, pulse) {
  const base =
    visual === "active"
      ? ide.rowActive
      : visual === "muted"
        ? ide.rowMuted
        : ide.rowActive;
  return {
    background: pulse ? "rgba(129, 140, 248, 0.22)" : base,
    opacity: visual === "muted" ? 0.38 : 1,
    transition: "background 0.15s ease, opacity 0.2s ease",
  };
}
