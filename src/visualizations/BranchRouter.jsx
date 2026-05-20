import { useMemo, useState } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

/**
 * BranchRouter — a value enters at the top and falls through a stack of
 * branches. Each branch is **tested → rejected**, **matched → entered**,
 * or **skipped** (the branch never runs because a previous one fired).
 *
 *   Mode 1  "if-chain"   — classic if/elif/else with truthiness on the right
 *   Mode 2  "match/case" — structural pattern matching with live bindings
 *
 * Scope: py-c1 — Conditionals & Pattern Matching. Distinct from prior vizzes
 * (no pipeline, no hash table, no spec dissector). Teaches by *animating
 * top-down evaluation* with a lit branch and a tail of dimmed skips.
 */

// ──────────────────────────────────────────────────────────────
// IF-CHAIN MODE
// Each value is a primitive Python literal we render and reason about.
// ──────────────────────────────────────────────────────────────

const IF_VALUES = [
  { id: "none", label: "None", value: null, py: "None", isFalsy: true },
  { id: "false", label: "False", value: false, py: "False", isFalsy: true },
  { id: "zero", label: "0", value: 0, py: "0", isFalsy: true },
  { id: "zero_f", label: "0.0", value: 0.0, py: "0.0", isFalsy: true },
  { id: "empty_str", label: '""', value: "", py: '""', isFalsy: true },
  { id: "empty_list", label: "[]", value: [], py: "[]", isFalsy: true },
  { id: "empty_dict", label: "{}", value: {}, py: "{}", isFalsy: true },
  { id: "true", label: "True", value: true, py: "True", isFalsy: false },
  { id: "small_int", label: "1", value: 1, py: "1", isFalsy: false },
  { id: "neg_int", label: "-3", value: -3, py: "-3", isFalsy: false },
  { id: "str", label: '"ada"', value: "ada", py: '"ada"', isFalsy: false },
  { id: "list", label: "[1, 2]", value: [1, 2], py: "[1, 2]", isFalsy: false },
  { id: "dict", label: '{"k": 1}', value: { k: 1 }, py: '{"k": 1}', isFalsy: false },
];

const IF_BRANCHES = [
  {
    py: "x is None",
    test: (v) => v === null,
    note: "the only idiomatic 'is' check — sentinel match.",
  },
  {
    py: "isinstance(x, bool)",
    test: (v) => typeof v === "boolean",
    note: "bool comes before int — Python sees True/False as a *kind* of int but isinstance picks bool first.",
  },
  {
    py: "isinstance(x, (int, float))",
    test: (v) => (typeof v === "number") && typeof v !== "boolean",
    note: "numeric branch. Use `isinstance` not `type(x) == int` for inheritance safety.",
  },
  {
    py: 'isinstance(x, str)',
    test: (v) => typeof v === "string",
    note: "string branch — comes before generic `not x` so empty strings hit here, not the truthiness branch.",
  },
  {
    py: "len(x) == 0",
    test: (v) => v != null && (Array.isArray(v) ? v.length === 0 : (typeof v === "object" && Object.keys(v).length === 0)),
    note: "explicit empty-collection check. Use this when 0 / '' / None must NOT be treated the same as []/{}.",
  },
  {
    py: "x  # truthy fallback",
    test: (v) => Boolean(v),
    note: "`if x:` — the catch-all truthy branch. Already covered above for primitives.",
  },
  {
    py: "else  # nothing matched",
    test: () => true,
    note: "the final escape hatch.",
  },
];

function isFalsyPy(v) {
  if (v === null || v === false || v === 0 || v === "") return true;
  if (Array.isArray(v) && v.length === 0) return true;
  if (typeof v === "object" && v !== null && !Array.isArray(v) && Object.keys(v).length === 0) return true;
  return false;
}

// ──────────────────────────────────────────────────────────────
// MATCH-CASE MODE
// Subjects are structured Python literals; each pattern is matched by a
// hand-written matcher that mirrors PEP 634 semantics for the cases that
// fit on a screen.
// ──────────────────────────────────────────────────────────────

const MATCH_SUBJECTS = [
  { id: "ok", label: "200", py: "200", value: { kind: "int", v: 200 } },
  { id: "redirect", label: "302", py: "302", value: { kind: "int", v: 302 } },
  { id: "client", label: "418", py: "418", value: { kind: "int", v: 418 } },
  { id: "server", label: "500", py: "500", value: { kind: "int", v: 500 } },
  { id: "weird", label: "999", py: "999", value: { kind: "int", v: 999 } },
  { id: "empty", label: "[]", py: "[]", value: { kind: "list", v: [] } },
  { id: "single", label: "[42]", py: "[42]", value: { kind: "list", v: [42] } },
  { id: "many", label: "[1, 2, 3, 4]", py: "[1, 2, 3, 4]", value: { kind: "list", v: [1, 2, 3, 4] } },
  { id: "user", label: "{type:'user', id:7}", py: '{"type": "user", "id": 7}', value: { kind: "dict", v: { type: "user", id: 7 } } },
  { id: "order", label: "{type:'order', total:99}", py: '{"type": "order", "total": 99}', value: { kind: "dict", v: { type: "order", total: 99 } } },
  { id: "noisy_user", label: "{type:'user', id:7, role:'admin'}", py: '{"type": "user", "id": 7, "role": "admin"}', value: { kind: "dict", v: { type: "user", id: 7, role: "admin" } } },
  { id: "point_origin", label: "Point(0, 0)", py: "Point(0, 0)", value: { kind: "point", v: { x: 0, y: 0 } } },
  { id: "point_diag", label: "Point(3, 3)", py: "Point(3, 3)", value: { kind: "point", v: { x: 3, y: 3 } } },
  { id: "point_off", label: "Point(2, 5)", py: "Point(2, 5)", value: { kind: "point", v: { x: 2, y: 5 } } },
];

/** Each pattern returns null on no-match, or { bindings: { name: pyLiteral }, summary } on match. */
const MATCH_BRANCHES = [
  {
    py: "case 200 | 201 | 204:",
    note: "OR pattern — any of the literals match. No bindings.",
    match: (s) => s.kind === "int" && [200, 201, 204].includes(s.v) ? { bindings: {} } : null,
  },
  {
    py: "case 301 | 302 | 307 | 308:",
    note: "OR pattern (redirects).",
    match: (s) => s.kind === "int" && [301, 302, 307, 308].includes(s.v) ? { bindings: {} } : null,
  },
  {
    py: "case n if 400 <= n < 500:",
    note: "guard clause — runs *after* the pattern matches. Captures n then tests `n in [400, 500)`.",
    match: (s) => s.kind === "int" && s.v >= 400 && s.v < 500 ? { bindings: { n: String(s.v) } } : null,
  },
  {
    py: "case n if n >= 500:",
    note: "guard clause — server-error band.",
    match: (s) => s.kind === "int" && s.v >= 500 ? { bindings: { n: String(s.v) } } : null,
  },
  {
    py: "case []:",
    note: "empty-sequence pattern — matches an empty list.",
    match: (s) => s.kind === "list" && s.v.length === 0 ? { bindings: {} } : null,
  },
  {
    py: "case [only]:",
    note: "single-element sequence — captures the lone item as `only`.",
    match: (s) => s.kind === "list" && s.v.length === 1 ? { bindings: { only: pyRepr(s.v[0]) } } : null,
  },
  {
    py: "case [head, *tail]:",
    note: "head + spread — captures first element and the *rest* as a list.",
    match: (s) => s.kind === "list" && s.v.length >= 1 ? { bindings: { head: pyRepr(s.v[0]), tail: pyRepr(s.v.slice(1)) } } : null,
  },
  {
    py: 'case {"type": "user", "id": uid}:',
    note: "mapping pattern — keys must be present, extras OK. `uid` captures the value at id.",
    match: (s) => s.kind === "dict" && s.v.type === "user" && "id" in s.v ? { bindings: { uid: pyRepr(s.v.id) } } : null,
  },
  {
    py: 'case {"type": "order", "total": t}:',
    note: "mapping pattern — order branch captures total as t.",
    match: (s) => s.kind === "dict" && s.v.type === "order" && "total" in s.v ? { bindings: { t: pyRepr(s.v.total) } } : null,
  },
  {
    py: "case Point(x=0, y=0):",
    note: "class pattern with literal kwargs — exact origin only.",
    match: (s) => s.kind === "point" && s.v.x === 0 && s.v.y === 0 ? { bindings: {} } : null,
  },
  {
    py: "case Point(x, y) if x == y:",
    note: "class pattern + guard — captures both coords, then tests equality.",
    match: (s) => s.kind === "point" && s.v.x === s.v.y ? { bindings: { x: String(s.v.x), y: String(s.v.y) } } : null,
  },
  {
    py: "case Point(x, y):",
    note: "class capture — matches any Point. **Anything below is unreachable for Points.**",
    match: (s) => s.kind === "point" ? { bindings: { x: String(s.v.x), y: String(s.v.y) } } : null,
  },
  {
    py: "case _:",
    note: "wildcard — matches anything, binds nothing. Always last.",
    match: () => ({ bindings: {} }),
  },
];

function pyRepr(v) {
  if (v === null) return "None";
  if (v === true) return "True";
  if (v === false) return "False";
  if (typeof v === "string") return `'${v}'`;
  if (Array.isArray(v)) return `[${v.map(pyRepr).join(", ")}]`;
  if (typeof v === "object") {
    const entries = Object.entries(v).map(([k, val]) => `'${k}': ${pyRepr(val)}`);
    return `{${entries.join(", ")}}`;
  }
  return String(v);
}

// ──────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────

export default function BranchRouter() {
  const [mode, setMode] = useState("if");

  return (
    <div style={{ fontFamily: "var(--ds-sans), sans-serif" }}>
      <div style={{ fontSize: 17, fontWeight: 700, color: DS.t1, marginBottom: 4 }}>
        The branch router
      </div>
      <p style={{ fontSize: 12, color: DS.t3, fontFamily: "var(--ds-mono), monospace", lineHeight: 1.6, marginBottom: 14 }}>
        Pick a value at the top — watch it fall through branches top-down. The <span style={{ color: DS.grn }}>green</span> branch fires; everything below is <span style={{ color: DS.dim }}>dead code</span> for that value.
      </p>

      <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
        <ModeTab active={mode === "if"} onClick={() => setMode("if")} label="1 · if / elif / else" hint="truthiness and predicates" />
        <ModeTab active={mode === "match"} onClick={() => setMode("match")} label="2 · match / case" hint="structural pattern matching (3.10+)" />
      </div>

      {mode === "if" ? <IfChainMode /> : <MatchMode />}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// IF chain
// ──────────────────────────────────────────────────────────────

function IfChainMode() {
  const [valueId, setValueId] = useState("empty_str");
  const subject = IF_VALUES.find((v) => v.id === valueId);

  const branches = useMemo(() => {
    let firedAt = -1;
    return IF_BRANCHES.map((b, i) => {
      const matches = b.test(subject.value);
      if (firedAt === -1 && matches) {
        firedAt = i;
        return { ...b, state: "fired" };
      }
      if (firedAt === -1) return { ...b, state: "rejected" };
      return { ...b, state: "skipped" };
    });
  }, [subject]);

  const fired = branches.find((b) => b.state === "fired");

  return (
    <div>
      {/* Value picker */}
      <div
        style={{
          padding: "12px 14px",
          borderRadius: 14,
          border: `1px solid ${DS.border}`,
          background: "rgba(255,255,255,0.015)",
          marginBottom: 14,
        }}
      >
        <SectionLabel>SUBJECT · pick a value for `x`</SectionLabel>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
          {IF_VALUES.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => setValueId(v.id)}
              style={{
                padding: "6px 10px",
                borderRadius: 8,
                border: `1px solid ${valueId === v.id ? DS.ind : DS.border}`,
                background: valueId === v.id ? `${DS.ind}1e` : "rgba(255,255,255,0.02)",
                color: valueId === v.id ? DS.t1 : DS.t2,
                fontSize: 12,
                fontFamily: "var(--ds-mono), monospace",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {v.label}
            </button>
          ))}
        </div>
        <div style={{ marginTop: 10, display: "flex", gap: 8, alignItems: "center", fontSize: 11, fontFamily: "var(--ds-mono), monospace" }}>
          <span style={{ color: DS.dim }}>truthiness:</span>
          <span style={{ color: subject.isFalsy ? "#FCA5A5" : DS.grn, fontWeight: 700 }}>
            bool({subject.py}) → {subject.isFalsy ? "False" : "True"}
          </span>
        </div>
      </div>

      {/* Branch stack */}
      <BranchStack
        leadCode={`x = ${subject.py}`}
        branches={branches}
        renderBranch={(b) => (
          <>
            <span style={{ color: DS.t3 }}>{b.state === "fired" ? "match" : b.state === "rejected" ? "tested" : "skipped"}</span>
            <span style={{ marginLeft: 8 }}>{b.py}</span>
          </>
        )}
      />

      {/* Result */}
      <ResultEcho
        kind="if"
        firedIndex={branches.findIndex((b) => b.state === "fired")}
        fired={fired}
        subjectPy={subject.py}
      />
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Match
// ──────────────────────────────────────────────────────────────

function MatchMode() {
  const [subjectId, setSubjectId] = useState("ok");
  const subject = MATCH_SUBJECTS.find((s) => s.id === subjectId);

  const branches = useMemo(() => {
    let firedAt = -1;
    return MATCH_BRANCHES.map((b, i) => {
      const result = b.match(subject.value);
      if (firedAt === -1 && result) {
        firedAt = i;
        return { ...b, state: "fired", bindings: result.bindings };
      }
      if (firedAt === -1) return { ...b, state: "rejected", bindings: {} };
      return { ...b, state: "skipped", bindings: {} };
    });
  }, [subject]);

  const fired = branches.find((b) => b.state === "fired");

  return (
    <div>
      <div
        style={{
          padding: "12px 14px",
          borderRadius: 14,
          border: `1px solid ${DS.border}`,
          background: "rgba(255,255,255,0.015)",
          marginBottom: 14,
        }}
      >
        <SectionLabel>SUBJECT · match value</SectionLabel>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
          {MATCH_SUBJECTS.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => setSubjectId(v.id)}
              style={{
                padding: "6px 10px",
                borderRadius: 8,
                border: `1px solid ${subjectId === v.id ? DS.ind : DS.border}`,
                background: subjectId === v.id ? `${DS.ind}1e` : "rgba(255,255,255,0.02)",
                color: subjectId === v.id ? DS.t1 : DS.t2,
                fontSize: 11,
                fontFamily: "var(--ds-mono), monospace",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      <BranchStack
        leadCode={`match ${subject.py}:`}
        branches={branches}
        renderBranch={(b) => (
          <>
            <span style={{ color: DS.t3 }}>{b.state === "fired" ? "match" : b.state === "rejected" ? "tested" : "skipped"}</span>
            <span style={{ marginLeft: 8 }}>{b.py}</span>
            {b.state === "fired" && Object.keys(b.bindings).length > 0 && (
              <div style={{ marginTop: 6, fontSize: 10, color: "#FCD34D", fontFamily: "var(--ds-mono), monospace" }}>
                bound:{" "}
                {Object.entries(b.bindings).map(([k, v], i) => (
                  <span key={k}>
                    {i ? ", " : ""}
                    <span style={{ color: "#FCD34D", fontWeight: 700 }}>{k}</span>
                    <span style={{ color: DS.dim }}> = </span>
                    <span style={{ color: DS.t1 }}>{v}</span>
                  </span>
                ))}
              </div>
            )}
          </>
        )}
      />

      <ResultEcho
        kind="match"
        firedIndex={branches.findIndex((b) => b.state === "fired")}
        fired={fired}
        subjectPy={subject.py}
      />
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Branch stack + result echo
// ──────────────────────────────────────────────────────────────

function BranchStack({ leadCode, branches, renderBranch }) {
  return (
    <div
      style={{
        padding: 14,
        borderRadius: 14,
        border: `1px solid ${DS.border}`,
        background: "linear-gradient(180deg, rgba(99,102,241,0.05), rgba(6,8,20,0.35))",
        marginBottom: 14,
      }}
    >
      <SectionLabel>BRANCH STACK · TOP-DOWN</SectionLabel>
      <div style={{ marginTop: 10, fontFamily: "var(--ds-mono), monospace", fontSize: 12 }}>
        <div style={{ color: DS.t2, marginBottom: 8, paddingBottom: 8, borderBottom: `1px dashed ${DS.border}` }}>
          {leadCode}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {branches.map((b, i) => (
            <BranchRow key={i} state={b.state} note={b.note}>
              {renderBranch(b)}
            </BranchRow>
          ))}
        </div>
      </div>
    </div>
  );
}

function BranchRow({ state, note, children }) {
  const palette = {
    fired: { border: DS.grn, bg: "rgba(52,211,153,0.10)", text: DS.t1, dot: DS.grn, dotLabel: "✓" },
    rejected: { border: DS.border, bg: "transparent", text: DS.t3, dot: "#FCA5A5", dotLabel: "✗" },
    skipped: { border: DS.border, bg: "transparent", text: DS.dim, dot: DS.dim, dotLabel: "·" },
  }[state];

  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        padding: "8px 10px",
        borderRadius: 8,
        border: `1px solid ${palette.border}`,
        background: palette.bg,
        opacity: state === "skipped" ? 0.5 : 1,
        transition: "all .15s",
      }}
    >
      <span
        style={{
          width: 18,
          height: 18,
          borderRadius: 999,
          background: state === "fired" ? `${palette.dot}33` : "transparent",
          border: `1px solid ${palette.dot}`,
          color: palette.dot,
          fontFamily: "var(--ds-mono), monospace",
          fontWeight: 700,
          fontSize: 10,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          marginTop: 2,
        }}
      >
        {palette.dotLabel}
      </span>
      <div style={{ flex: 1 }}>
        <div style={{ color: palette.text, fontWeight: state === "fired" ? 700 : 400, lineHeight: 1.5 }}>{children}</div>
        {state === "fired" && note && (
          <div style={{ marginTop: 4, fontSize: 10, color: DS.t3, lineHeight: 1.5 }}>
            <span style={{ color: DS.dim }}># </span>
            {note}
          </div>
        )}
      </div>
    </div>
  );
}

function ResultEcho({ kind, firedIndex, fired, subjectPy }) {
  if (firedIndex < 0) {
    return (
      <div
        style={{
          padding: "12px 14px",
          borderRadius: 12,
          border: `1px solid rgba(248,113,113,0.3)`,
          background: "rgba(248,113,113,0.06)",
          fontFamily: "var(--ds-mono), monospace",
          fontSize: 12,
          color: "#FCA5A5",
        }}
      >
        no branch matched (impossible if you have an `else` / `case _`).
      </div>
    );
  }
  return (
    <div
      style={{
        padding: "12px 14px",
        borderRadius: 12,
        border: `1px solid rgba(52,211,153,0.3)`,
        background: "rgba(52,211,153,0.06)",
        fontFamily: "var(--ds-mono), monospace",
        fontSize: 12,
        color: DS.t2,
        lineHeight: 1.55,
      }}
    >
      <div style={{ fontSize: 9, letterSpacing: 1.4, color: DS.grn, marginBottom: 6, fontWeight: 700 }}>RESULT</div>
      branch <span style={{ color: DS.grn, fontWeight: 700 }}>#{firedIndex + 1}</span> fires for <span style={{ color: DS.t1 }}>{subjectPy}</span>:{" "}
      <span style={{ color: "#FCD34D" }}>{fired.py}</span>
      {kind === "match" && Object.keys(fired.bindings || {}).length > 0 && (
        <div style={{ marginTop: 6, color: DS.t3 }}>
          local bindings ·{" "}
          {Object.entries(fired.bindings).map(([k, v], i) => (
            <span key={k}>
              {i ? ", " : ""}
              <span style={{ color: "#FCD34D", fontWeight: 700 }}>{k}</span>
              <span style={{ color: DS.dim }}> = </span>
              <span style={{ color: DS.t1 }}>{v}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function ModeTab({ active, onClick, label, hint }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flex: 1,
        padding: "12px 14px",
        background: active ? "rgba(99,102,241,0.1)" : "rgba(255,255,255,0.02)",
        border: `1px solid ${active ? `${DS.ind}66` : DS.border}`,
        borderRadius: 10,
        color: active ? DS.t1 : DS.t3,
        fontFamily: "var(--ds-mono), monospace",
        fontSize: 12,
        fontWeight: 700,
        cursor: "pointer",
        textAlign: "left",
      }}
    >
      <div style={{ color: active ? DS.ind : DS.t2, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 10, color: DS.dim, letterSpacing: 0.2, fontWeight: 500 }}>{hint}</div>
    </button>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{ fontSize: 9, letterSpacing: 1.4, color: DS.dim, fontFamily: "var(--ds-mono), monospace", fontWeight: 700 }}>
      {children}
    </div>
  );
}
