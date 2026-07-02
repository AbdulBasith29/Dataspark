import { useState } from "react";
import { DS } from "../../lib/ds-platform-tokens.js";
import {
  SQL_PRACTICE_SEED,
  SQL_PRACTICE_TABLES,
  runRolledBack,
  resultsMatch,
} from "../../data/sql-practice-db.js";

// In-browser PostgreSQL runner for SQL practice questions. PGlite (Postgres
// compiled to WASM) is lazy-loaded on first run and seeded once per page load.

const MAX_DISPLAY_ROWS = 30;

let dbPromise = null;
function getDb() {
  if (!dbPromise) {
    dbPromise = (async () => {
      const { PGlite } = await import("@electric-sql/pglite");
      const db = new PGlite();
      await db.exec(SQL_PRACTICE_SEED);
      return db;
    })();
    // Allow a retry if the WASM download failed (offline, CDN hiccup).
    dbPromise.catch(() => { dbPromise = null; });
  }
  return dbPromise;
}

function displayCell(v) {
  if (v === null || v === undefined) return "∅";
  if (v instanceof Date) {
    const iso = v.toISOString();
    return iso.endsWith("T00:00:00.000Z") ? iso.slice(0, 10) : iso.slice(0, 16).replace("T", " ");
  }
  return String(v);
}

export default function SqlRunner({ sql, modelAnswer, runnerTables, accent }) {
  const [running, setRunning] = useState(false);
  const [engineLoading, setEngineLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [check, setCheck] = useState(null); // null | "match" | "mismatch"
  const [tablesOpen, setTablesOpen] = useState(false);

  const mono = "var(--ds-mono), monospace";
  const canRun = sql.trim().length > 0 && !running;

  const execute = async (alsoCheck) => {
    if (!canRun) return;
    setRunning(true);
    setError("");
    setCheck(null);
    try {
      if (!dbPromise) setEngineLoading(true);
      const db = await getDb();
      setEngineLoading(false);
      const userRes = await runRolledBack(db, sql);
      setResult(userRes);
      if (alsoCheck) {
        const modelRes = await runRolledBack(db, modelAnswer);
        setCheck(resultsMatch(userRes, modelRes) ? "match" : "mismatch");
      }
    } catch (err) {
      setEngineLoading(false);
      setResult(null);
      setError(err?.message || "Query failed.");
    } finally {
      setRunning(false);
    }
  };

  const btnStyle = (primary) => ({
    padding: "8px 14px",
    borderRadius: 8,
    border: primary ? "none" : `1px solid ${DS.border}`,
    background: primary ? accent : "rgba(255,255,255,0.04)",
    color: primary ? "#0B0314" : DS.t2,
    fontSize: 12.5,
    fontWeight: 700,
    fontFamily: "var(--ds-sans), sans-serif",
    cursor: canRun ? "pointer" : "not-allowed",
    opacity: canRun ? 1 : 0.55,
  });

  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <button type="button" onClick={() => execute(false)} disabled={!canRun} style={btnStyle(true)}>
          {running ? "Running…" : "▶ Run query"}
        </button>
        <button type="button" onClick={() => execute(true)} disabled={!canRun} style={btnStyle(false)}>
          Check result
        </button>
        <button
          type="button"
          onClick={() => setTablesOpen((o) => !o)}
          style={{ ...btnStyle(false), cursor: "pointer", opacity: 1, fontWeight: 500 }}
        >
          {tablesOpen ? "Hide tables" : "Tables"}
        </button>
        {engineLoading && (
          <span style={{ fontSize: 11.5, color: DS.t3, fontFamily: mono }}>
            Loading PostgreSQL engine (one-time download)…
          </span>
        )}
        {check === "match" && (
          <span style={{ fontSize: 12, fontWeight: 700, color: DS.grn, fontFamily: mono }}>
            ✓ Matches expected result
          </span>
        )}
        {check === "mismatch" && (
          <span style={{ fontSize: 12, fontWeight: 700, color: "#F59E0B", fontFamily: mono }}>
            ✗ Differs from expected result — compare row counts and values
          </span>
        )}
      </div>

      {tablesOpen && (
        <div
          style={{
            marginTop: 10,
            padding: "10px 14px",
            borderRadius: 10,
            border: `1px solid ${DS.border}`,
            background: "rgba(2,6,23,0.72)",
            display: "flex",
            flexDirection: "column",
            gap: 5,
          }}
        >
          {Object.entries(SQL_PRACTICE_TABLES)
            .filter(([name]) => !runnerTables || runnerTables.includes(name))
            .map(([name, desc]) => (
              <div key={name} style={{ fontSize: 11.5, color: DS.t3, fontFamily: mono, lineHeight: 1.6 }}>
                {desc}
              </div>
            ))}
          {runnerTables && tablesOpen !== "all" && (
            <button
              type="button"
              onClick={() => setTablesOpen("all")}
              style={{ background: "none", border: "none", padding: 0, textAlign: "left", color: DS.dim, fontSize: 11, fontFamily: mono, cursor: "pointer" }}
            >
              …show all tables
            </button>
          )}
          {tablesOpen === "all" &&
            Object.entries(SQL_PRACTICE_TABLES)
              .filter(([name]) => runnerTables && !runnerTables.includes(name))
              .map(([name, desc]) => (
                <div key={name} style={{ fontSize: 11.5, color: DS.dim, fontFamily: mono, lineHeight: 1.6 }}>
                  {desc}
                </div>
              ))}
        </div>
      )}

      {error && (
        <div
          style={{
            marginTop: 10,
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid rgba(248,113,113,0.35)",
            background: "rgba(248,113,113,0.08)",
            color: "#FCA5A5",
            fontSize: 12,
            fontFamily: mono,
            whiteSpace: "pre-wrap",
          }}
        >
          {error}
        </div>
      )}

      {result && !error && (
        <div
          style={{
            marginTop: 10,
            border: `1px solid ${DS.border}`,
            borderRadius: 10,
            background: "rgba(2,6,23,0.72)",
            overflow: "auto",
            maxHeight: 260,
          }}
        >
          <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 11.5, fontFamily: mono }}>
            <thead>
              <tr>
                {result.fields.map((f) => (
                  <th
                    key={f.name}
                    style={{
                      position: "sticky",
                      top: 0,
                      textAlign: "left",
                      padding: "7px 12px",
                      color: accent,
                      background: "rgba(2,6,23,0.95)",
                      borderBottom: `1px solid ${DS.border}`,
                      fontWeight: 700,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {f.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.rows.slice(0, MAX_DISPLAY_ROWS).map((row, i) => (
                <tr key={i}>
                  {result.fields.map((f) => (
                    <td
                      key={f.name}
                      style={{
                        padding: "5px 12px",
                        color: row[f.name] === null ? DS.dim : DS.t2,
                        borderBottom: `1px solid rgba(255,255,255,0.04)`,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {displayCell(row[f.name])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ padding: "6px 12px", fontSize: 11, color: DS.t3, fontFamily: mono }}>
            {result.rows.length} row{result.rows.length === 1 ? "" : "s"}
            {result.rows.length > MAX_DISPLAY_ROWS ? ` (showing first ${MAX_DISPLAY_ROWS})` : ""}
          </div>
        </div>
      )}
    </div>
  );
}
