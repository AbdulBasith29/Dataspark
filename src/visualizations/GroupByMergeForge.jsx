import { useState, useMemo } from "react";
import { DS } from "../lib/ds-platform-tokens.js";
import useReducedMotion from "../lib/use-reduced-motion.js";

/**
 * GroupByMergeForge — Interactive visualization for "GroupBy, Merge, Pivot"
 * Lesson: py-d3
 *
 * Three tabs:
 *   1. GroupBy — color-banded rows collapse into aggregated result
 *   2. Merge   — two DataFrames joined with row-level color coding
 *   3. Pivot   — long → wide transformation with heat-map cells
 */

// ─── Data ────────────────────────────────────────────────────────────────────

const TRANSACTIONS = [
  { tx_id: 1, user_id: "u1", event_type: "purchase", date: "2024-01-01", value: 120 },
  { tx_id: 2, user_id: "u2", event_type: "click",    date: "2024-01-01", value: 5   },
  { tx_id: 3, user_id: "u1", event_type: "view",     date: "2024-01-02", value: 0   },
  { tx_id: 4, user_id: "u3", event_type: "purchase", date: "2024-01-02", value: 340 },
  { tx_id: 5, user_id: "u2", event_type: "purchase", date: "2024-01-03", value: 88  },
  { tx_id: 6, user_id: "u1", event_type: "click",    date: "2024-01-03", value: 5   },
  { tx_id: 7, user_id: "u3", event_type: "click",    date: "2024-01-01", value: 5   },
  { tx_id: 8, user_id: "u2", event_type: "view",     date: "2024-01-02", value: 0   },
];

const ORDERS = [
  { order_id: 1, user_id: 101, amount: 50  },
  { order_id: 2, user_id: 102, amount: 150 },
  { order_id: 3, user_id: 103, amount: 75  },
  { order_id: 4, user_id: 101, amount: 200 },
  { order_id: 5, user_id: 104, amount: 30  },
];
const USERS = [
  { user_id: 101, name: "Alice", tier: "premium" },
  { user_id: 102, name: "Bob",   tier: "basic"   },
  { user_id: 103, name: "Carol", tier: "premium" },
  { user_id: 105, name: "Dave",  tier: "basic"   },
];

const LONG_DATA = [
  { date: "2024-01-01", event: "click",    count: 120 },
  { date: "2024-01-01", event: "purchase", count: 15  },
  { date: "2024-01-01", event: "view",     count: 340 },
  { date: "2024-01-02", event: "click",    count: 98  },
  { date: "2024-01-02", event: "purchase", count: 22  },
  { date: "2024-01-02", event: "view",     count: 410 },
  { date: "2024-01-03", event: "click",    count: 145 },
  { date: "2024-01-03", event: "purchase", count: 31  },
  { date: "2024-01-03", event: "view",     count: 290 },
];

// ─── Shared style helpers ────────────────────────────────────────────────────

const MONO = { fontFamily: "var(--ds-mono), monospace" };
const LABEL_STYLE = {
  fontSize: 9, letterSpacing: 1.4, color: DS.dim,
  fontFamily: "var(--ds-mono), monospace", fontWeight: 700,
  textTransform: "uppercase", marginBottom: 6,
};
const CODE_BLOCK = {
  background: "rgba(0,0,0,0.35)", border: `1px solid ${DS.border}`,
  borderRadius: 8, padding: "10px 14px",
  ...MONO, fontSize: 12, color: DS.t2, lineHeight: 1.6,
  marginBottom: 12,
};
const TH = {
  padding: "6px 10px", borderBottom: `1px solid ${DS.border}`,
  ...MONO, fontSize: 11, color: DS.dim, textAlign: "left",
  fontWeight: 700, letterSpacing: 0.5,
};
const TD_BASE = { padding: "6px 10px", ...MONO, fontSize: 12, color: DS.t2 };

// Unique hue palette for group bands
const GROUP_HUES = [
  "rgba(99,102,241,0.12)",
  "rgba(52,211,153,0.10)",
  "rgba(251,191,36,0.10)",
  "rgba(239,68,68,0.10)",
  "rgba(167,139,250,0.10)",
];
const GROUP_BORDERS = [
  "rgba(99,102,241,0.25)",
  "rgba(52,211,153,0.25)",
  "rgba(251,191,36,0.22)",
  "rgba(239,68,68,0.22)",
  "rgba(167,139,250,0.22)",
];

// ─── Shared: SelectPill ──────────────────────────────────────────────────────

function SelectPill({ label, options, value, onChange }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={LABEL_STYLE}>{label}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {options.map(opt => {
          const active = opt.value === value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              style={{
                padding: "5px 12px", borderRadius: 20,
                background: active ? "rgba(99,102,241,0.18)" : "rgba(255,255,255,0.03)",
                border: `1px solid ${active ? `${DS.ind}88` : DS.border}`,
                color: active ? DS.t1 : DS.t3,
                ...MONO, fontSize: 11, fontWeight: 700, cursor: "pointer",
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Tab switch button ───────────────────────────────────────────────────────

function ModeTab({ active, onClick, label, hint }) {
  return (
    <button type="button" onClick={onClick} style={{
      flex: 1, padding: "12px 14px",
      background: active ? "rgba(99,102,241,0.1)" : "rgba(255,255,255,0.02)",
      border: `1px solid ${active ? `${DS.ind}66` : DS.border}`,
      borderRadius: 10, color: active ? DS.t1 : DS.t3,
      fontFamily: "var(--ds-mono), monospace", fontSize: 12, fontWeight: 700,
      cursor: "pointer", textAlign: "left",
    }}>
      <div style={{ color: active ? DS.ind : DS.t2, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 10, color: DS.dim, letterSpacing: 0.2, fontWeight: 500 }}>{hint}</div>
    </button>
  );
}

// ─── Annotation bubble ──────────────────────────────────────────────────────

function Annotation({ children }) {
  return (
    <div style={{
      background: "rgba(99,102,241,0.07)", border: `1px solid rgba(99,102,241,0.18)`,
      borderRadius: 8, padding: "8px 12px",
      fontSize: 11, color: DS.t3, lineHeight: 1.55, marginBottom: 12,
    }}>
      <span style={{ color: DS.ind, fontWeight: 700, marginRight: 6 }}>WHY:</span>
      {children}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TAB 1 — GroupBy
// ═══════════════════════════════════════════════════════════════════

const GB_KEYS = [
  { value: "user_id",    label: "user_id"    },
  { value: "event_type", label: "event_type" },
  { value: "date",       label: "date"       },
];
const GB_AGGS = [
  { value: "count", label: "count" },
  { value: "sum",   label: "sum"   },
  { value: "mean",  label: "mean"  },
  { value: "max",   label: "max"   },
];

function applyAgg(values, agg) {
  if (agg === "count") return values.length;
  if (agg === "sum")   return values.reduce((a, v) => a + v, 0);
  if (agg === "mean")  return +(values.reduce((a, v) => a + v, 0) / values.length).toFixed(2);
  if (agg === "max")   return Math.max(...values);
  return null;
}

function GroupByTab() {
  const reduceMotion = useReducedMotion();
  const [gbKey, setGbKey] = useState("user_id");
  const [agg,   setAgg  ] = useState("sum");

  const grouped = useMemo(() => {
    const map = {};
    TRANSACTIONS.forEach(row => {
      const k = row[gbKey];
      if (!map[k]) map[k] = [];
      map[k].push(row);
    });
    return map;
  }, [gbKey]);

  const groupKeys  = useMemo(() => Object.keys(grouped).sort(), [grouped]);
  const groupIndex = useMemo(() => {
    const idx = {};
    groupKeys.forEach((k, i) => { idx[k] = i; });
    return idx;
  }, [groupKeys]);

  const result = useMemo(() => {
    return groupKeys.map(k => ({
      key: k,
      value: applyAgg(grouped[k].map(r => r.value), agg),
      count: grouped[k].length,
    }));
  }, [grouped, groupKeys, agg]);

  const pyCode = `df.groupby("${gbKey}")["value"].${agg}()`;

  return (
    <div>
      {/* Controls */}
      <div style={{ display: "flex", gap: 16, marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 160 }}>
          <SelectPill
            label="GROUP BY KEY"
            options={GB_KEYS}
            value={gbKey}
            onChange={setGbKey}
          />
        </div>
        <div style={{ flex: 1, minWidth: 160 }}>
          <SelectPill
            label="AGGREGATION"
            options={GB_AGGS}
            value={agg}
            onChange={setAgg}
          />
        </div>
      </div>

      {/* Python code */}
      <div style={CODE_BLOCK}>
        <span style={{ color: DS.dim }}># Python</span>{"\n"}
        <span style={{ color: DS.t1 }}>{pyCode}</span>
      </div>

      <Annotation>
        In production, always verify your group keys have no unexpected nulls before aggregating —
        pandas silently drops NaN keys by default, which can cause rows to vanish from your reports.
      </Annotation>

      {/* Source table — color-banded by group */}
      <div style={LABEL_STYLE}>SOURCE TABLE (color-banded by {gbKey})</div>
      <div style={{
        border: `1px solid ${DS.border}`, borderRadius: 10,
        overflow: "hidden", marginBottom: 16,
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "rgba(0,0,0,0.3)" }}>
              {["tx_id", "user_id", "event_type", "date", "value"].map(h => (
                <th key={h} style={TH}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TRANSACTIONS.map(row => {
              const idx  = groupIndex[row[gbKey]] ?? 0;
              const bg   = GROUP_HUES[idx % GROUP_HUES.length];
              const bdr  = GROUP_BORDERS[idx % GROUP_BORDERS.length];
              const isBanded = row[gbKey] in groupIndex;
              return (
                <tr key={row.tx_id} style={{
                  background: bg,
                  borderBottom: `1px solid ${isBanded ? bdr : DS.border}`,
                  transition: reduceMotion ? "none" : "background 0.3s",
                }}>
                  {["tx_id", "user_id", "event_type", "date", "value"].map(col => (
                    <td key={col} style={{
                      ...TD_BASE,
                      color: col === gbKey ? DS.t1 : DS.t2,
                      fontWeight: col === gbKey ? 700 : 400,
                    }}>
                      {row[col]}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Result table */}
      <div style={LABEL_STYLE}>RESULT · {pyCode}</div>
      <div style={{
        border: `1px solid ${DS.border}`, borderRadius: 10, overflow: "hidden",
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "rgba(0,0,0,0.3)" }}>
              <th style={TH}>{gbKey}</th>
              <th style={TH}>count</th>
              <th style={TH}>value ({agg})</th>
            </tr>
          </thead>
          <tbody>
            {result.map((r, i) => {
              const bg  = GROUP_HUES[i % GROUP_HUES.length];
              const bdr = GROUP_BORDERS[i % GROUP_BORDERS.length];
              return (
                <tr key={r.key} style={{
                  background: bg, borderBottom: `1px solid ${bdr}`,
                  transition: reduceMotion ? "none" : "background 0.3s",
                }}>
                  <td style={{ ...TD_BASE, color: DS.t1, fontWeight: 700 }}>{r.key}</td>
                  <td style={{ ...TD_BASE, color: DS.t3 }}>{r.count}</td>
                  <td style={{
                    ...TD_BASE, fontWeight: 700,
                    background: "rgba(251,191,36,0.18)",
                    color: "#FCD34D",
                  }}>
                    {r.value}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Group legend */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
        {groupKeys.map((k, i) => (
          <div key={k} style={{
            display: "flex", alignItems: "center", gap: 5,
            background: GROUP_HUES[i % GROUP_HUES.length],
            border: `1px solid ${GROUP_BORDERS[i % GROUP_BORDERS.length]}`,
            borderRadius: 20, padding: "3px 10px",
          }}>
            <span style={{ ...MONO, fontSize: 10, color: DS.t2, fontWeight: 700 }}>{k}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TAB 2 — Merge
// ═══════════════════════════════════════════════════════════════════

const JOIN_TYPES = [
  { value: "inner", label: "inner" },
  { value: "left",  label: "left"  },
  { value: "right", label: "right" },
  { value: "outer", label: "outer" },
];

const ROW_MATCH = {
  background: "rgba(52,211,153,0.15)", border: "1px solid rgba(52,211,153,0.3)",
};
const ROW_LEFT = {
  background: "rgba(251,191,36,0.12)", border: "1px solid rgba(251,191,36,0.25)",
};
const ROW_RIGHT = {
  background: "rgba(129,140,248,0.12)", border: "1px solid rgba(129,140,248,0.25)",
};

function computeMerge(joinType) {
  const usersMap = {};
  USERS.forEach(u => { usersMap[u.user_id] = u; });
  const ordersMap = {};
  ORDERS.forEach(o => {
    if (!ordersMap[o.user_id]) ordersMap[o.user_id] = [];
    ordersMap[o.user_id].push(o);
  });

  const allUserIds = new Set([
    ...ORDERS.map(o => o.user_id),
    ...USERS.map(u => u.user_id),
  ]);

  const result = [];
  if (joinType === "inner") {
    ORDERS.forEach(o => {
      const u = usersMap[o.user_id];
      if (u) result.push({ ...o, name: u.name, tier: u.tier, _type: "match" });
    });
  } else if (joinType === "left") {
    ORDERS.forEach(o => {
      const u = usersMap[o.user_id];
      if (u) result.push({ ...o, name: u.name, tier: u.tier, _type: "match" });
      else    result.push({ ...o, name: null,  tier: null,  _type: "left"  });
    });
  } else if (joinType === "right") {
    USERS.forEach(u => {
      const orders = ordersMap[u.user_id];
      if (orders) {
        orders.forEach(o => result.push({ ...o, name: u.name, tier: u.tier, _type: "match" }));
      } else {
        result.push({ order_id: null, user_id: u.user_id, amount: null, name: u.name, tier: u.tier, _type: "right" });
      }
    });
  } else { // outer
    const seen = new Set();
    ORDERS.forEach(o => {
      const u = usersMap[o.user_id];
      seen.add(o.user_id);
      if (u) result.push({ ...o, name: u.name, tier: u.tier, _type: "match" });
      else    result.push({ ...o, name: null,  tier: null,  _type: "left"  });
    });
    USERS.forEach(u => {
      if (!seen.has(u.user_id)) {
        result.push({ order_id: null, user_id: u.user_id, amount: null, name: u.name, tier: u.tier, _type: "right" });
      }
    });
  }
  return result;
}

function NaNCell() {
  return <span style={{ color: DS.dim, fontStyle: "italic" }}>NaN</span>;
}

function RowStyle(type) {
  if (type === "match") return ROW_MATCH;
  if (type === "left")  return ROW_LEFT;
  if (type === "right") return ROW_RIGHT;
  return {};
}

function MergeTab() {
  const [joinType, setJoinType] = useState("inner");

  const mergeResult = useMemo(() => computeMerge(joinType), [joinType]);

  const matchedIds = useMemo(() => {
    const s = new Set();
    ORDERS.forEach(o => { if (USERS.find(u => u.user_id === o.user_id)) s.add(o.user_id); });
    return s;
  }, []);

  const pyCode = `pd.merge(orders, users, on="user_id", how="${joinType}")`;

  const annotations = {
    inner: "inner join silently drops order 5 (user 104) and Dave (user 105) — if your users table is incomplete, you lose revenue rows without any warning.",
    left:  "left join keeps all orders; user 104's order gets NaN for name/tier. Safe default when orders are the source of truth.",
    right: "right join keeps all users; Dave (user 105) appears with NaN order_id and amount. Use when user list is authoritative.",
    outer: "outer join keeps everything — no row is dropped. Use for auditing data completeness before deciding which rows to drop explicitly.",
  };

  return (
    <div>
      {/* Controls */}
      <SelectPill label="JOIN TYPE" options={JOIN_TYPES} value={joinType} onChange={setJoinType} />

      {/* Python code */}
      <div style={CODE_BLOCK}>
        <span style={{ color: DS.dim }}># Python</span>{"\n"}
        <span style={{ color: DS.t1 }}>{pyCode}</span>
      </div>

      <Annotation>{annotations[joinType]}</Annotation>

      {/* Legend */}
      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        {[
          { label: "matched row",  style: ROW_MATCH },
          { label: "left-only",    style: ROW_LEFT  },
          { label: "right-only",   style: ROW_RIGHT },
        ].map(({ label, style }) => (
          <div key={label} style={{
            display: "flex", alignItems: "center", gap: 6,
            background: style.background, border: style.border,
            borderRadius: 20, padding: "4px 12px",
          }}>
            <span style={{ ...MONO, fontSize: 10, color: DS.t2 }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Source tables */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
        {/* Orders */}
        <div>
          <div style={LABEL_STYLE}>ORDERS (left df)</div>
          <div style={{ border: `1px solid ${DS.border}`, borderRadius: 10, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "rgba(0,0,0,0.3)" }}>
                  {["order_id","user_id","amount"].map(h => <th key={h} style={TH}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {ORDERS.map(o => {
                  const isMatch = matchedIds.has(o.user_id);
                  return (
                    <tr key={o.order_id} style={{
                      ...(isMatch ? ROW_MATCH : ROW_LEFT),
                      borderBottom: `1px solid ${DS.border}`,
                    }}>
                      <td style={TD_BASE}>{o.order_id}</td>
                      <td style={{ ...TD_BASE, fontWeight: 700, color: DS.t1 }}>{o.user_id}</td>
                      <td style={TD_BASE}>{o.amount}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Users */}
        <div>
          <div style={LABEL_STYLE}>USERS (right df)</div>
          <div style={{ border: `1px solid ${DS.border}`, borderRadius: 10, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "rgba(0,0,0,0.3)" }}>
                  {["user_id","name","tier"].map(h => <th key={h} style={TH}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {USERS.map(u => {
                  const isMatch = matchedIds.has(u.user_id);
                  return (
                    <tr key={u.user_id} style={{
                      ...(isMatch ? ROW_MATCH : ROW_RIGHT),
                      borderBottom: `1px solid ${DS.border}`,
                    }}>
                      <td style={{ ...TD_BASE, fontWeight: 700, color: DS.t1 }}>{u.user_id}</td>
                      <td style={TD_BASE}>{u.name}</td>
                      <td style={TD_BASE}>{u.tier}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Result */}
      <div style={LABEL_STYLE}>RESULT · {joinType.toUpperCase()} JOIN ({mergeResult.length} rows)</div>
      <div style={{ border: `1px solid ${DS.border}`, borderRadius: 10, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "rgba(0,0,0,0.3)" }}>
              {["order_id","user_id","amount","name","tier"].map(h => (
                <th key={h} style={TH}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mergeResult.map((row, i) => (
              <tr key={i} style={{
                ...RowStyle(row._type),
                borderBottom: `1px solid ${DS.border}`,
              }}>
                <td style={TD_BASE}>{row.order_id ?? <NaNCell />}</td>
                <td style={{ ...TD_BASE, fontWeight: 700, color: DS.t1 }}>{row.user_id}</td>
                <td style={TD_BASE}>{row.amount  ?? <NaNCell />}</td>
                <td style={TD_BASE}>{row.name    ?? <NaNCell />}</td>
                <td style={TD_BASE}>{row.tier    ?? <NaNCell />}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TAB 3 — Pivot
// ═══════════════════════════════════════════════════════════════════

const PIVOT_MODES = [
  { value: "pivot_table", label: "pivot_table" },
  { value: "unstack",     label: "unstack"     },
];

function PivotTab() {
  const reduceMotion = useReducedMotion();
  const [mode, setMode] = useState("pivot_table");

  const { dates, events, pivotMap, maxVal } = useMemo(() => {
    const dSet = new Set();
    const eSet = new Set();
    const pMap = {};
    LONG_DATA.forEach(r => {
      dSet.add(r.date);
      eSet.add(r.event);
      if (!pMap[r.date]) pMap[r.date] = {};
      pMap[r.date][r.event] = r.count;
    });
    const allVals = LONG_DATA.map(r => r.count);
    return {
      dates: [...dSet].sort(),
      events: [...eSet].sort(),
      pivotMap: pMap,
      maxVal: Math.max(...allVals),
    };
  }, []);

  const pyCode = mode === "pivot_table"
    ? `df.pivot_table(index="date", columns="event", values="count", aggfunc="sum")`
    : `df.set_index(["date","event"])["count"].unstack(level="event")`;

  // Heat intensity: 0.05 (low) → 0.55 (high)
  function cellBg(val) {
    const t = val / maxVal;
    return `rgba(99,102,241,${(0.06 + t * 0.45).toFixed(2)})`;
  }
  function cellColor(val) {
    const t = val / maxVal;
    if (t > 0.6) return DS.t1;
    if (t > 0.3) return DS.t2;
    return DS.t3;
  }

  return (
    <div>
      <SelectPill label="PIVOT METHOD" options={PIVOT_MODES} value={mode} onChange={setMode} />

      <div style={CODE_BLOCK}>
        <span style={{ color: DS.dim }}># Python</span>{"\n"}
        <span style={{ color: DS.t1 }}>{pyCode}</span>
      </div>

      <Annotation>
        {mode === "pivot_table"
          ? "pivot_table supports aggregation (aggfunc), handles duplicate index/column combos, and fills missing combos with NaN. Use it when your data might have duplicate keys."
          : "unstack pivots an index level into columns — it's a low-level primitive. It errors on duplicate index entries. Best for already-clean, pre-aggregated data."}
      </Annotation>

      <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 16, alignItems: "start" }}>

        {/* Long format */}
        <div>
          <div style={LABEL_STYLE}>LONG FORMAT (input)</div>
          <div style={{ border: `1px solid ${DS.border}`, borderRadius: 10, overflow: "hidden" }}>
            <table style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "rgba(0,0,0,0.3)" }}>
                  {["date","event","count"].map(h => <th key={h} style={TH}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {LONG_DATA.map((r, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${DS.border}` }}>
                    <td style={{ ...TD_BASE, color: DS.t3 }}>{r.date}</td>
                    <td style={{ ...TD_BASE, color: DS.ind }}>{r.event}</td>
                    <td style={{ ...TD_BASE, color: DS.t1, fontWeight: 700 }}>{r.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pivot result */}
        <div>
          <div style={LABEL_STYLE}>WIDE FORMAT · {mode} (output)</div>

          {/* Heat scale legend */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <span style={{ ...MONO, fontSize: 9, color: DS.dim, letterSpacing: 0.8 }}>LOW</span>
            <div style={{
              flex: 1, height: 6, borderRadius: 3,
              background: "linear-gradient(to right, rgba(99,102,241,0.08), rgba(99,102,241,0.55))",
              border: `1px solid ${DS.border}`,
            }} />
            <span style={{ ...MONO, fontSize: 9, color: DS.dim, letterSpacing: 0.8 }}>HIGH</span>
          </div>

          <div style={{ border: `1px solid ${DS.border}`, borderRadius: 10, overflow: "hidden" }}>
            <table style={{ borderCollapse: "collapse", width: "100%" }}>
              <thead>
                <tr style={{ background: "rgba(0,0,0,0.3)" }}>
                  <th style={TH}>date \ event</th>
                  {events.map(e => (
                    <th key={e} style={{ ...TH, color: DS.ind }}>{e}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dates.map(d => (
                  <tr key={d} style={{ borderBottom: `1px solid ${DS.border}` }}>
                    <td style={{ ...TD_BASE, color: DS.t3, whiteSpace: "nowrap" }}>{d}</td>
                    {events.map(e => {
                      const val = pivotMap[d]?.[e];
                      return (
                        <td key={e} style={{
                          ...TD_BASE,
                          background: val != null ? cellBg(val) : "transparent",
                          color: val != null ? cellColor(val) : DS.dim,
                          fontWeight: 700, textAlign: "right",
                          transition: reduceMotion ? "none" : "background 0.3s",
                        }}>
                          {val != null ? val : <span style={{ color: DS.dim, fontStyle: "italic" }}>NaN</span>}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Column total row */}
          <div style={{
            marginTop: 8, padding: "8px 10px",
            border: `1px solid ${DS.border}`,
            borderRadius: 8,
            background: "rgba(0,0,0,0.25)",
          }}>
            <span style={{ ...MONO, fontSize: 10, color: DS.dim }}>column totals: </span>
            {events.map(e => {
              const total = LONG_DATA.filter(r => r.event === e).reduce((a, r) => a + r.count, 0);
              return (
                <span key={e} style={{ marginRight: 14 }}>
                  <span style={{ ...MONO, fontSize: 10, color: DS.ind }}>{e} </span>
                  <span style={{ ...MONO, fontSize: 10, color: DS.t1, fontWeight: 700 }}>{total}</span>
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// Root component
// ═══════════════════════════════════════════════════════════════════

const TABS = [
  { id: "groupby", label: "GroupBy",     hint: "aggregate rows by key"     },
  { id: "merge",   label: "Merge",       hint: "join two DataFrames"        },
  { id: "pivot",   label: "Pivot",       hint: "long → wide reshape"        },
];

export default function GroupByMergeForge() {
  const [tab, setTab] = useState("groupby");

  return (
    <div style={{
      background: DS.bg, minHeight: "100%",
      padding: "24px 20px",
      fontFamily: "var(--ds-sans), system-ui, sans-serif",
    }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ ...MONO, fontSize: 9, letterSpacing: 2, color: DS.dim, fontWeight: 700, marginBottom: 4 }}>
          PY-D3 · GROUPBY, MERGE, PIVOT
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, color: DS.t1, letterSpacing: -0.3 }}>
          GroupBy · Merge · Pivot
        </div>
        <div style={{ fontSize: 12, color: DS.t3, marginTop: 4, lineHeight: 1.5 }}>
          The three core reshaping operations for analytical DataFrames. Pick a tab to explore interactively.
        </div>
      </div>

      {/* Tab switcher */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {TABS.map(t => (
          <ModeTab
            key={t.id}
            active={tab === t.id}
            onClick={() => setTab(t.id)}
            label={t.label}
            hint={t.hint}
          />
        ))}
      </div>

      {/* Tab content */}
      <div style={{
        background: "rgba(255,255,255,0.02)",
        border: `1px solid ${DS.border}`,
        borderRadius: 14, padding: 20,
      }}>
        {tab === "groupby" && <GroupByTab />}
        {tab === "merge"   && <MergeTab />}
        {tab === "pivot"   && <PivotTab />}
      </div>
    </div>
  );
}
