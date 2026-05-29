import { useState, useMemo } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

const INITIAL_DATA = [
  { user_id: 101, event_type: "click",    timestamp: "2024-01-15 09:00", value: 23 },
  { user_id: 102, event_type: "purchase", timestamp: "2024-01-15 09:05", value: 149 },
  { user_id: 101, event_type: "view",     timestamp: "2024-01-15 09:10", value: 5  },
  { user_id: 103, event_type: "click",    timestamp: "2024-01-15 09:15", value: 67 },
  { user_id: 104, event_type: "purchase", timestamp: "2024-01-15 09:20", value: 299 },
  { user_id: 102, event_type: "view",     timestamp: "2024-01-15 09:25", value: 5  },
  { user_id: 103, event_type: "purchase", timestamp: "2024-01-15 09:30", value: 89 },
  { user_id: 105, event_type: "click",    timestamp: "2024-01-15 09:35", value: 12 },
];

const ALL_COLS = ["user_id", "event_type", "timestamp", "value"];

// Each operation takes state and returns next state
// state: { rows, cols, filteredSet (Set of row._uid for filtered-out rows), originalIndex (map _uid→orig), indexReset }
const OPERATIONS = [
  {
    id: "col_select",
    code: `df[["user_id", "value"]]`,
    label: "Column select",
    desc: "Keep only user_id & value",
    chainFn: (code, chain) => `${chain}[["user_id", "value"]]`,
    apply: (state) => ({
      ...state,
      cols: state.cols.filter(c => c === "user_id" || c === "value"),
      newCols: [],
    }),
  },
  {
    id: "bool_filter",
    code: `df[df["value"] > 50]`,
    label: "Boolean filter",
    desc: "Keep rows where value > 50",
    chainFn: (code, chain) => `${chain}[${chain}["value"] > 50]`,
    apply: (state) => {
      const newFiltered = new Set(state.filteredSet);
      state.rows.forEach(r => { if (r.value <= 50) newFiltered.add(r._uid); });
      return { ...state, filteredSet: newFiltered, newCols: [] };
    },
  },
  {
    id: "assign",
    code: `df.assign(is_active=df["value"] > 50)`,
    label: "assign()",
    desc: "Add is_active column",
    chainFn: (_, chain) => `${chain}.assign(is_active=${chain}["value"] > 50)`,
    apply: (state) => ({
      ...state,
      rows: state.rows.map(r => ({ ...r, is_active: r.value > 50 })),
      cols: state.cols.includes("is_active") ? state.cols : [...state.cols, "is_active"],
      newCols: ["is_active"],
    }),
  },
  {
    id: "rename",
    code: `df.rename(columns={"event_type": "event"})`,
    label: "rename()",
    desc: 'Rename event_type → event',
    chainFn: (_, chain) => `${chain}.rename(columns={"event_type": "event"})`,
    apply: (state) => ({
      ...state,
      rows: state.rows.map(r => {
        const { event_type, ...rest } = r;
        return { ...rest, event: event_type !== undefined ? event_type : r.event };
      }),
      cols: state.cols.map(c => c === "event_type" ? "event" : c),
      newCols: ["event"],
    }),
  },
  {
    id: "sort",
    code: `df.sort_values("value", ascending=False)`,
    label: "sort_values()",
    desc: "Sort by value descending",
    chainFn: (_, chain) => `${chain}.sort_values("value", ascending=False)`,
    apply: (state) => ({
      ...state,
      rows: [...state.rows].sort((a, b) => b.value - a.value),
      newCols: [],
    }),
  },
  {
    id: "reset_index",
    code: `df.reset_index(drop=True)`,
    label: "reset_index()",
    desc: "Reset numeric index",
    chainFn: (_, chain) => `${chain}.reset_index(drop=True)`,
    apply: (state) => {
      // After reset_index, assign new sequential originalIndex, clear filter dimming
      const newOriginalIndex = {};
      const kept = state.rows.filter(r => !state.filteredSet.has(r._uid));
      kept.forEach((r, i) => { newOriginalIndex[r._uid] = i; });
      return {
        ...state,
        filteredSet: new Set(),
        originalIndex: newOriginalIndex,
        newCols: [],
      };
    },
  },
];

const MONO = { fontFamily: "var(--ds-mono), monospace" };
const SECTION_LABEL = { fontSize: 9, letterSpacing: 1.4, color: DS.dim, ...MONO, fontWeight: 700, textTransform: "uppercase" };
const CARD = { padding: "12px 14px", borderRadius: 14, border: `1px solid ${DS.border}`, background: "rgba(255,255,255,0.015)" };

function ModeTab({ active, onClick, label, hint }) {
  return (
    <button type="button" onClick={onClick} style={{
      flex: 1, padding: "12px 14px",
      background: active ? "rgba(99,102,241,0.1)" : "rgba(255,255,255,0.02)",
      border: `1px solid ${active ? `${DS.ind}66` : DS.border}`,
      borderRadius: 10, color: active ? DS.t1 : DS.t3,
      fontFamily: "var(--ds-mono), monospace", fontSize: 12, fontWeight: 700, cursor: "pointer", textAlign: "left",
    }}>
      <div style={{ color: active ? DS.ind : DS.t2, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 10, color: DS.dim, letterSpacing: 0.2, fontWeight: 500 }}>{hint}</div>
    </button>
  );
}

function CodeLine({ code }) {
  // Highlight numeric literals in yellow
  const parts = code.split(/(\b\d+\b)/g);
  return (
    <span>
      {parts.map((p, i) =>
        /^\d+$/.test(p)
          ? <span key={i} style={{ color: "#FBBF24", background: "rgba(251,191,36,0.12)", borderRadius: 3, padding: "0 2px" }}>{p}</span>
          : <span key={i}>{p}</span>
      )}
    </span>
  );
}

function DataTable({ rows, cols, newCols = [], filteredSet = null, originalIndex = null }) {
  const totalShown = filteredSet ? rows.filter(r => !filteredSet.has(r._uid)).length : rows.length;
  const hasFilter = filteredSet && filteredSet.size > 0;

  return (
    <div>
      {hasFilter && (
        <div style={{ ...MONO, fontSize: 11, color: DS.grn, marginBottom: 8 }}>
          Showing {totalShown} of {INITIAL_DATA.length} rows
        </div>
      )}
      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", width: "100%", ...MONO, fontSize: 12 }}>
          <thead>
            <tr>
              <th style={{
                padding: "6px 10px", color: DS.dim, fontSize: 11,
                borderBottom: `1px solid ${DS.border}`, textAlign: "right", whiteSpace: "nowrap",
              }}>#</th>
              {cols.map(col => (
                <th key={col} style={{
                  padding: "6px 10px",
                  color: newCols.includes(col) ? DS.ind : DS.t3,
                  fontSize: 11,
                  borderBottom: `1px solid ${DS.border}`,
                  textAlign: "left",
                  whiteSpace: "nowrap",
                  background: newCols.includes(col) ? `${DS.ind}18` : "transparent",
                }}>
                  {col}
                  {newCols.includes(col) && <span style={{ marginLeft: 4, fontSize: 9, color: DS.ind }}>NEW</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const dimmed = filteredSet ? filteredSet.has(row._uid) : false;
              const idx = originalIndex ? (originalIndex[row._uid] ?? i) : i;
              return (
                <tr key={row._uid ?? i} style={{
                  opacity: dimmed ? 0.25 : 1,
                  textDecoration: dimmed ? "line-through" : "none",
                  background: i % 2 === 0 ? "rgba(255,255,255,0.01)" : "transparent",
                  transition: "opacity 0.3s",
                }}>
                  <td style={{
                    padding: "5px 10px", color: DS.dim, fontSize: 11,
                    textAlign: "right", borderBottom: `1px solid ${DS.border}22`,
                  }}>
                    {idx}
                  </td>
                  {cols.map(col => (
                    <td key={col} style={{
                      padding: "5px 10px",
                      color: newCols.includes(col) ? DS.t1 : DS.t2,
                      borderBottom: `1px solid ${DS.border}22`,
                      whiteSpace: "nowrap",
                      background: newCols.includes(col) ? `${DS.ind}22` : "transparent",
                      border: newCols.includes(col) ? `1px solid ${DS.ind}44` : undefined,
                      fontWeight: newCols.includes(col) ? 600 : 400,
                    }}>
                      {row[col] === undefined ? <span style={{ color: DS.dim }}>—</span> : String(row[col])}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function buildInitialState() {
  const rows = INITIAL_DATA.map((r, i) => ({ ...r, _uid: i }));
  const originalIndex = {};
  rows.forEach((r, i) => { originalIndex[r._uid] = i; });
  return {
    rows,
    cols: [...ALL_COLS],
    filteredSet: new Set(),
    originalIndex,
    newCols: [],
  };
}

function Tab1DataFrame() {
  const [appliedOps, setAppliedOps] = useState([]);

  const state = useMemo(() => {
    let s = buildInitialState();
    for (const opId of appliedOps) {
      const op = OPERATIONS.find(o => o.id === opId);
      if (op) s = op.apply(s);
    }
    return s;
  }, [appliedOps]);

  const lastNewCols = useMemo(() => state.newCols || [], [state]);

  const chainCode = useMemo(() => {
    if (appliedOps.length === 0) return "df";
    let chain = "df";
    for (const opId of appliedOps) {
      const op = OPERATIONS.find(o => o.id === opId);
      if (op && op.chainFn) chain = op.chainFn(op.code, chain);
    }
    return chain;
  }, [appliedOps]);

  const applyOp = (opId) => setAppliedOps(prev => [...prev, opId]);
  const reset = () => setAppliedOps([]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Pipeline chain */}
      <div style={{ ...CARD }}>
        <div style={{ ...SECTION_LABEL, marginBottom: 8 }}>Current pipeline</div>
        <div style={{
          ...MONO, fontSize: 12, color: DS.t1,
          background: "rgba(0,0,0,0.3)", borderRadius: 8,
          padding: "10px 12px", overflowX: "auto", whiteSpace: "nowrap",
        }}>
          <CodeLine code={chainCode} />
        </div>
      </div>

      {/* Operation buttons */}
      <div>
        <div style={{ ...SECTION_LABEL, marginBottom: 8 }}>Apply operation</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {OPERATIONS.map(op => {
            const alreadyApplied = appliedOps.includes(op.id);
            return (
              <button
                key={op.id}
                type="button"
                onClick={() => !alreadyApplied && applyOp(op.id)}
                disabled={alreadyApplied}
                style={{
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: `1px solid ${alreadyApplied ? DS.border : `${DS.ind}55`}`,
                  background: alreadyApplied ? "rgba(255,255,255,0.02)" : "rgba(99,102,241,0.08)",
                  color: alreadyApplied ? DS.dim : DS.t2,
                  ...MONO, fontSize: 11, cursor: alreadyApplied ? "default" : "pointer",
                  opacity: alreadyApplied ? 0.5 : 1,
                  transition: "all 0.2s",
                }}
              >
                <div style={{ fontWeight: 700, color: alreadyApplied ? DS.dim : DS.ind, marginBottom: 2 }}>{op.label}</div>
                <div style={{ fontSize: 10, color: DS.dim }}>{op.desc}</div>
              </button>
            );
          })}
          <button
            type="button"
            onClick={reset}
            style={{
              padding: "8px 12px", borderRadius: 8,
              border: "1px solid rgba(239,68,68,0.3)",
              background: "rgba(239,68,68,0.06)",
              color: "#F87171", ...MONO, fontSize: 11, cursor: "pointer",
              fontWeight: 700,
            }}
          >
            Reset
          </button>
        </div>
      </div>

      {/* Applied ops badges */}
      {appliedOps.length > 0 && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ ...SECTION_LABEL }}>Applied:</span>
          {appliedOps.map((id, i) => {
            const op = OPERATIONS.find(o => o.id === id);
            return (
              <span key={i} style={{
                ...MONO, fontSize: 10, color: DS.ind,
                background: `${DS.ind}15`, borderRadius: 6,
                padding: "3px 8px", border: `1px solid ${DS.ind}33`,
              }}>{op?.label}</span>
            );
          })}
        </div>
      )}

      {/* Table */}
      <div style={{ ...CARD }}>
        <div style={{ ...SECTION_LABEL, marginBottom: 10 }}>DataFrame result</div>
        <DataTable
          rows={state.rows}
          cols={state.cols}
          newCols={lastNewCols}
          filteredSet={state.filteredSet.size > 0 ? state.filteredSet : null}
          originalIndex={state.originalIndex}
        />
      </div>
    </div>
  );
}

const INITIAL_DTYPES = {
  user_id: "int64",
  event_type: "object",
  timestamp: "object",
  value: "int64",
};

const DTYPE_COLOR = {
  "int64": "#60A5FA",
  "float64": "#A78BFA",
  "object": DS.t3,
  "datetime64[ns]": DS.grn,
  "bool": "#FBBF24",
};

function Tab2IndexDtypes() {
  const [dtypes, setDtypes] = useState({ ...INITIAL_DTYPES });
  const [indexMode, setIndexMode] = useState("default"); // default | user_id
  const [showIndexRepr, setShowIndexRepr] = useState(false);
  const [highlightedDtype, setHighlightedDtype] = useState(null);

  const indexRepr = useMemo(() => {
    if (indexMode === "user_id") {
      const vals = INITIAL_DATA.map(r => r.user_id).join(", ");
      return `Int64Index([${vals}], dtype='int64', name='user_id')`;
    }
    return `RangeIndex(start=0, stop=${INITIAL_DATA.length}, step=1)`;
  }, [indexMode]);

  const convertTimestamp = () => {
    setDtypes(prev => ({ ...prev, timestamp: "datetime64[ns]" }));
    setHighlightedDtype("timestamp");
    setTimeout(() => setHighlightedDtype(null), 1800);
  };

  const convertValueFloat = () => {
    setDtypes(prev => ({ ...prev, value: "float64" }));
    setHighlightedDtype("value");
    setTimeout(() => setHighlightedDtype(null), 1800);
  };

  const resetDtypes = () => {
    setDtypes({ ...INITIAL_DTYPES });
    setHighlightedDtype(null);
  };

  const displayCols = indexMode === "user_id" ? ALL_COLS.filter(c => c !== "user_id") : ALL_COLS;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        {/* Left: dtype panel */}
        <div style={{ ...CARD, flex: "1 1 260px", minWidth: 220 }}>
          <div style={{ ...SECTION_LABEL, marginBottom: 10 }}>df.dtypes</div>
          <table style={{ width: "100%", borderCollapse: "collapse", ...MONO, fontSize: 12 }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", color: DS.dim, fontSize: 10, paddingBottom: 6, borderBottom: `1px solid ${DS.border}` }}>column</th>
                <th style={{ textAlign: "left", color: DS.dim, fontSize: 10, paddingBottom: 6, borderBottom: `1px solid ${DS.border}` }}>dtype</th>
              </tr>
            </thead>
            <tbody>
              {ALL_COLS.map((col, i) => {
                const dtype = dtypes[col] || "object";
                const isHighlighted = highlightedDtype === col;
                return (
                  <tr key={col} style={{
                    background: isHighlighted ? `${DS.ind}22` : i % 2 === 0 ? "rgba(255,255,255,0.01)" : "transparent",
                    transition: "background 0.4s",
                  }}>
                    <td style={{ padding: "6px 8px", color: DS.t2, borderBottom: `1px solid ${DS.border}22` }}>{col}</td>
                    <td style={{ padding: "6px 8px", borderBottom: `1px solid ${DS.border}22` }}>
                      <span style={{
                        color: DTYPE_COLOR[dtype] || DS.t3,
                        background: `${DTYPE_COLOR[dtype] || DS.t3}15`,
                        borderRadius: 5, padding: "2px 7px", fontSize: 11, fontWeight: 700,
                        border: isHighlighted ? `1px solid ${DS.ind}66` : "1px solid transparent",
                        transition: "border 0.4s",
                      }}>
                        {dtype}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div style={{ marginTop: 14 }}>
            <div style={{ ...SECTION_LABEL, marginBottom: 8 }}>Type conversions</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <button type="button" onClick={convertTimestamp} style={{
                ...MONO, fontSize: 11, padding: "7px 10px", borderRadius: 8, cursor: "pointer", textAlign: "left",
                border: `1px solid ${DS.grn}44`, background: `${DS.grn}08`, color: DS.t2,
              }}>
                <span style={{ color: DS.grn, fontWeight: 700 }}>pd.to_datetime</span>
                <span style={{ color: DS.dim }}>(df["timestamp"])</span>
              </button>
              <button type="button" onClick={convertValueFloat} style={{
                ...MONO, fontSize: 11, padding: "7px 10px", borderRadius: 8, cursor: "pointer", textAlign: "left",
                border: "1px solid #A78BFA44", background: "#A78BFA08", color: DS.t2,
              }}>
                <span style={{ color: DS.t2 }}>df["value"]</span>
                <span style={{ color: "#A78BFA", fontWeight: 700 }}>.astype(float)</span>
              </button>
              <button type="button" onClick={resetDtypes} style={{
                ...MONO, fontSize: 11, padding: "6px 10px", borderRadius: 8, cursor: "pointer",
                border: `1px solid ${DS.border}`, background: "rgba(255,255,255,0.02)", color: DS.dim,
              }}>
                Reset dtypes
              </button>
            </div>
          </div>
        </div>

        {/* Right: index panel */}
        <div style={{ ...CARD, flex: "1 1 260px", minWidth: 220 }}>
          <div style={{ ...SECTION_LABEL, marginBottom: 10 }}>Index</div>

          {/* Visual index pills */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 10, color: DS.dim, ...MONO, marginBottom: 6 }}>
              {indexMode === "user_id" ? "Index: user_id values" : "Index: RangeIndex (0–7)"}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {INITIAL_DATA.map((row, i) => {
                const label = indexMode === "user_id" ? row.user_id : i;
                return (
                  <span key={i} style={{
                    ...MONO, fontSize: 11,
                    padding: "4px 9px", borderRadius: 6,
                    background: indexMode === "user_id" ? `${DS.ind}18` : "rgba(255,255,255,0.05)",
                    color: indexMode === "user_id" ? DS.ind : DS.t3,
                    border: `1px solid ${indexMode === "user_id" ? `${DS.ind}44` : DS.border}`,
                    fontWeight: 600,
                    transition: "all 0.3s",
                  }}>
                    {label}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Index repr */}
          {showIndexRepr && (
            <div style={{
              ...MONO, fontSize: 11, color: DS.t2,
              background: "rgba(0,0,0,0.3)", borderRadius: 8,
              padding: "8px 10px", marginBottom: 10,
              border: `1px solid ${DS.border}`,
              overflowX: "auto", whiteSpace: "nowrap",
            }}>
              {indexRepr}
            </div>
          )}

          <div style={{ ...SECTION_LABEL, marginBottom: 8 }}>Index operations</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <button type="button" onClick={() => { setIndexMode("user_id"); setShowIndexRepr(false); }} style={{
              ...MONO, fontSize: 11, padding: "7px 10px", borderRadius: 8, cursor: "pointer", textAlign: "left",
              border: `1px solid ${indexMode === "user_id" ? `${DS.ind}66` : `${DS.ind}33`}`,
              background: indexMode === "user_id" ? `${DS.ind}15` : `${DS.ind}06`,
              color: indexMode === "user_id" ? DS.ind : DS.t2,
              fontWeight: indexMode === "user_id" ? 700 : 400,
            }}>
              df<span style={{ color: DS.ind, fontWeight: 700 }}>.set_index</span>("user_id")
            </button>
            <button type="button" onClick={() => { setIndexMode("default"); setShowIndexRepr(false); }} style={{
              ...MONO, fontSize: 11, padding: "7px 10px", borderRadius: 8, cursor: "pointer", textAlign: "left",
              border: `1px solid ${indexMode === "default" && !showIndexRepr ? `${DS.grn}55` : `${DS.grn}22`}`,
              background: `${DS.grn}07`, color: DS.t2,
            }}>
              df<span style={{ color: DS.grn, fontWeight: 700 }}>.reset_index</span>()
            </button>
            <button type="button" onClick={() => setShowIndexRepr(prev => !prev)} style={{
              ...MONO, fontSize: 11, padding: "7px 10px", borderRadius: 8, cursor: "pointer", textAlign: "left",
              border: `1px solid ${showIndexRepr ? "#FBBF2466" : "#FBBF2422"}`,
              background: showIndexRepr ? "rgba(251,191,36,0.1)" : "rgba(251,191,36,0.04)",
              color: showIndexRepr ? "#FBBF24" : DS.t2,
              fontWeight: showIndexRepr ? 700 : 400,
            }}>
              df<span style={{ color: "#FBBF24", fontWeight: 700 }}>.index</span>
              <span style={{ color: DS.dim }}> → show repr</span>
            </button>
          </div>

          {indexMode === "user_id" && (
            <div style={{ marginTop: 12, ...CARD, background: "rgba(0,0,0,0.2)" }}>
              <div style={{ ...SECTION_LABEL, marginBottom: 6 }}>Note</div>
              <div style={{ fontSize: 11, color: DS.t3, lineHeight: 1.6 }}>
                user_id is now the <span style={{ color: DS.ind }}>index</span> — it's no longer a regular column.<br />
                Use <span style={{ ...MONO, color: DS.grn }}>reset_index()</span> to restore it as a column.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dataset preview table */}
      <div style={{ ...CARD }}>
        <div style={{ ...SECTION_LABEL, marginBottom: 10 }}>Dataset preview</div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ borderCollapse: "collapse", width: "100%", ...MONO, fontSize: 12 }}>
            <thead>
              <tr>
                <th style={{
                  padding: "5px 10px", color: indexMode === "user_id" ? DS.ind : DS.dim,
                  fontSize: 10, borderBottom: `1px solid ${DS.border}`, textAlign: "right",
                  fontWeight: indexMode === "user_id" ? 700 : 400,
                }}>
                  {indexMode === "user_id" ? "user_id (idx)" : "#"}
                </th>
                {displayCols.map(col => (
                  <th key={col} style={{
                    padding: "5px 10px",
                    color: col === "timestamp" && dtypes.timestamp !== INITIAL_DTYPES.timestamp ? DS.grn
                      : col === "value" && dtypes.value !== INITIAL_DTYPES.value ? "#A78BFA"
                      : DS.t3,
                    fontSize: 10, borderBottom: `1px solid ${DS.border}`, textAlign: "left",
                    background: col === "timestamp" && dtypes.timestamp !== INITIAL_DTYPES.timestamp ? `${DS.grn}12`
                      : col === "value" && dtypes.value !== INITIAL_DTYPES.value ? "#A78BFA12"
                      : "transparent",
                  }}>
                    {col}
                    {col === "timestamp" && dtypes.timestamp !== INITIAL_DTYPES.timestamp && (
                      <span style={{ marginLeft: 5, fontSize: 9, color: DS.grn, fontWeight: 700 }}>datetime64</span>
                    )}
                    {col === "value" && dtypes.value !== INITIAL_DTYPES.value && (
                      <span style={{ marginLeft: 5, fontSize: 9, color: "#A78BFA", fontWeight: 700 }}>float64</span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {INITIAL_DATA.map((row, i) => {
                const idxLabel = indexMode === "user_id" ? row.user_id : i;
                return (
                  <tr key={i} style={{ background: i % 2 === 0 ? "rgba(255,255,255,0.01)" : "transparent" }}>
                    <td style={{
                      padding: "5px 10px",
                      color: indexMode === "user_id" ? DS.ind : DS.dim,
                      textAlign: "right",
                      borderBottom: `1px solid ${DS.border}22`,
                      fontWeight: indexMode === "user_id" ? 700 : 400,
                    }}>
                      {idxLabel}
                    </td>
                    {displayCols.map(col => (
                      <td key={col} style={{
                        padding: "5px 10px",
                        borderBottom: `1px solid ${DS.border}22`,
                        color: col === "value" && dtypes.value === "float64" ? "#A78BFA"
                          : col === "timestamp" && dtypes.timestamp === "datetime64[ns]" ? DS.grn
                          : DS.t2,
                        whiteSpace: "nowrap",
                      }}>
                        {col === "value" && dtypes.value === "float64"
                          ? `${row[col]}.0`
                          : String(row[col])}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function PandasDataLab() {
  const [tab, setTab] = useState("dataframe");

  return (
    <div style={{ color: DS.t1, padding: 0 }}>
      {/* Tab switcher */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <ModeTab
          active={tab === "dataframe"}
          onClick={() => setTab("dataframe")}
          label="DataFrame ops"
          hint="column select · filter · assign · rename · sort · reset_index"
        />
        <ModeTab
          active={tab === "index"}
          onClick={() => setTab("index")}
          label="Index & dtypes"
          hint="dtypes · set_index · reset_index · type casting"
        />
      </div>

      {tab === "dataframe" ? <Tab1DataFrame /> : <Tab2IndexDtypes />}
    </div>
  );
}
