import { useMemo, useState } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

/**
 * ArgumentBinder — visualizes how Python binds a call site to a signature.
 *
 *   Mode 1  "Signature dissector" — pick a recipe (5-slot signature) and watch
 *                                   each parameter colored by its slot kind:
 *                                   POS-ONLY · POS-OR-KW · *ARGS · KW-ONLY · **KWARGS.
 *                                   Hover/click to see what the / and * dividers mean.
 *   Mode 2  "Live call binder"    — same signature, plus a configurable call site.
 *                                   Add positional, keyword, *list, **dict args.
 *                                   Watch the binder route each one to a slot;
 *                                   red arrows for the five canonical TypeErrors.
 *   Mode 3  "Mutable-default trap" — three sequential calls to the *same* function;
 *                                    the default list grows across frames. The bug,
 *                                    made literal.
 *
 * Scope: py-c3 — Functions: Args, *args, **kwargs. Distinct from BranchRouter
 * (top-down branch fall-through) and IteratorEngine (one-tick-at-a-time pulls).
 * This viz is about *spatial routing* — arrows from a horizontal call site
 * down into a labeled slot rack.
 */

// ──────────────────────────────────────────────────────────────
// Signature recipes.
// Each parameter has: name, kind (P|B|A|K|W), default? (string repr or null),
// required (true if no default and not variadic).
// ──────────────────────────────────────────────────────────────

const SIG_RECIPES = [
  {
    id: "render",
    label: "render(template, /, data, *layers, theme='dark', **opts)",
    pyDef: "def render(template, /, data, *layers, theme='dark', **opts):",
    params: [
      { name: "template", kind: "P", required: true,  default: null },
      { name: "data",     kind: "B", required: true,  default: null },
      { name: "layers",   kind: "A", required: false, default: "()" },
      { name: "theme",    kind: "K", required: false, default: "'dark'" },
      { name: "opts",     kind: "W", required: false, default: "{}" },
    ],
    note: "all five slot kinds in one signature. The / makes template positional-only; the *layers makes theme keyword-only.",
  },
  {
    id: "connect",
    label: "connect(host, port, *, timeout=10, retries=3)",
    pyDef: "def connect(host, port, *, timeout=10, retries=3):",
    params: [
      { name: "host",    kind: "B", required: true,  default: null },
      { name: "port",    kind: "B", required: true,  default: null },
      { name: "timeout", kind: "K", required: false, default: "10" },
      { name: "retries", kind: "K", required: false, default: "3" },
    ],
    note: "the bare * forces timeout/retries to be keyword-only. connect('db', 5432, 30) is a TypeError — the third positional has no slot.",
  },
  {
    id: "fetch",
    label: "fetch(url, /, *, json=None, **headers)",
    pyDef: "def fetch(url, /, *, json=None, **headers):",
    params: [
      { name: "url",     kind: "P", required: true,  default: null },
      { name: "json",    kind: "K", required: false, default: "None" },
      { name: "headers", kind: "W", required: false, default: "{}" },
    ],
    note: "url is positional-only (locked name); everything else is keyword. Extra keywords land in **headers — perfect for HTTP wrappers.",
  },
  {
    id: "sum",
    label: "total(*nums)",
    pyDef: "def total(*nums):",
    params: [
      { name: "nums", kind: "A", required: false, default: "()" },
    ],
    note: "the variadic-only signature. Any number of positionals are absorbed into the nums tuple. total() is fine — empty tuple.",
  },
  {
    id: "mixed",
    label: "f(a, b, /, c, d=1, *e, g, h=2, **i)",
    pyDef: "def f(a, b, /, c, d=1, *e, g, h=2, **i):",
    params: [
      { name: "a", kind: "P", required: true,  default: null },
      { name: "b", kind: "P", required: true,  default: null },
      { name: "c", kind: "B", required: true,  default: null },
      { name: "d", kind: "B", required: false, default: "1" },
      { name: "e", kind: "A", required: false, default: "()" },
      { name: "g", kind: "K", required: true,  default: null },
      { name: "h", kind: "K", required: false, default: "2" },
      { name: "i", kind: "W", required: false, default: "{}" },
    ],
    note: "the kitchen-sink signature. Drill: predict where each call-site argument lands before turning Mode 2 on.",
  },
];

const SLOT_META = {
  P: { label: "POS-ONLY",   color: "#FCA5A5", short: "pos-only" },
  B: { label: "POS-OR-KW",  color: "#A78BFA", short: "either" },
  A: { label: "*ARGS",      color: "#7DD3FC", short: "variadic pos" },
  K: { label: "KW-ONLY",    color: "#FCD34D", short: "kw-only" },
  W: { label: "**KWARGS",   color: "#34D399", short: "variadic kw" },
};

// ──────────────────────────────────────────────────────────────
// Call-site argument tokens.
// ──────────────────────────────────────────────────────────────

const TOKEN_LIBRARY = [
  { id: "pos1", kind: "pos",   label: "1",            py: "1",            value: 1 },
  { id: "pos2", kind: "pos",   label: "2",            py: "2",            value: 2 },
  { id: "pos3", kind: "pos",   label: "3",            py: "3",            value: 3 },
  { id: "posA", kind: "pos",   label: '"x"',          py: '"x"',          value: "x" },
  { id: "kw_data",   kind: "kw",   label: "data={1,2}",       py: "data={1,2}",       name: "data", value: "{1,2}" },
  { id: "kw_theme",  kind: "kw",   label: "theme='light'",    py: "theme='light'",    name: "theme", value: "'light'" },
  { id: "kw_timeout",kind: "kw",   label: "timeout=30",       py: "timeout=30",       name: "timeout", value: "30" },
  { id: "kw_retries",kind: "kw",   label: "retries=5",        py: "retries=5",        name: "retries", value: "5" },
  { id: "kw_g",      kind: "kw",   label: "g=99",             py: "g=99",             name: "g", value: "99" },
  { id: "kw_h",      kind: "kw",   label: "h=42",             py: "h=42",             name: "h", value: "42" },
  { id: "kw_url",    kind: "kw",   label: "url='/api'",       py: "url='/api'",       name: "url", value: "'/api'" },
  { id: "kw_json",   kind: "kw",   label: "json={'a':1}",     py: "json={'a':1}",     name: "json", value: "{'a':1}" },
  { id: "kw_extra",  kind: "kw",   label: "x=7",              py: "x=7",              name: "x", value: "7" },
  { id: "starlist",  kind: "star", label: "*[10, 20]",        py: "*[10, 20]",        items: [10, 20] },
  { id: "starlist2", kind: "star", label: "*('a','b','c')",   py: "*('a','b','c')",   items: ["a", "b", "c"] },
  { id: "kwdict",    kind: "starstar", label: "**{'theme':'dark'}", py: "**{'theme':'dark'}", entries: [["theme", "'dark'"]] },
  { id: "kwdict2",   kind: "starstar", label: "**{'a':1,'b':2}",    py: "**{'a':1,'b':2}",    entries: [["a", "1"], ["b", "2"]] },
];

const TOKEN_GROUPS = [
  { title: "POSITIONAL", filter: (t) => t.kind === "pos" },
  { title: "KEYWORD",    filter: (t) => t.kind === "kw" },
  { title: "* / ** UNPACK", filter: (t) => t.kind === "star" || t.kind === "starstar" },
];

// ──────────────────────────────────────────────────────────────
// Binding logic — implements the canonical Python rules.
// Returns { bindings: { paramName: { source: 'pos'|'kw'|'default', value: str } },
//           absorbed: { args: [...], kwargs: { ... } },
//           errors: [str],
//           arrows: [{ tokenId, paramName, kind: 'ok'|'err' }],
//           tokensState: [{ id, state: 'placed'|'absorbed-args'|'absorbed-kwargs'|'error', target?: paramName, msg? }] }
// ──────────────────────────────────────────────────────────────

function expandTokens(tokens) {
  // Expand *list and **dict into individual positional / keyword "virtual" tokens
  // that retain their parent token id so we can map errors back.
  const expanded = [];
  for (const t of tokens) {
    if (t.kind === "pos") {
      expanded.push({ parent: t.id, kind: "pos", py: t.py, value: t.value });
    } else if (t.kind === "kw") {
      expanded.push({ parent: t.id, kind: "kw", name: t.name, py: t.py, value: t.value });
    } else if (t.kind === "star") {
      for (const v of t.items) {
        expanded.push({ parent: t.id, kind: "pos", py: String(v), value: v, fromStar: true });
      }
    } else if (t.kind === "starstar") {
      for (const [k, v] of t.entries) {
        expanded.push({ parent: t.id, kind: "kw", name: k, py: `${k}=${v}`, value: v, fromStarStar: true });
      }
    }
  }
  return expanded;
}

function bindCall(sig, tokens) {
  const params = sig.params;
  const result = {
    bindings: {},
    absorbed: { args: [], kwargs: {} },
    errors: [],
    arrows: [],
    tokensState: tokens.map((t) => ({ id: t.id, state: "pending" })),
  };
  const tokenStateById = (id) => result.tokensState.find((s) => s.id === id);

  const expanded = expandTokens(tokens);
  const positionals = expanded.filter((e) => e.kind === "pos");
  const keywords = expanded.filter((e) => e.kind === "kw");

  // 1) Place positionals into P, B slots in order, overflow into A slot if present.
  const aParam = params.find((p) => p.kind === "A");
  let posCursor = 0;
  for (const p of params) {
    if (p.kind === "P" || p.kind === "B") {
      if (posCursor < positionals.length) {
        const e = positionals[posCursor];
        result.bindings[p.name] = { source: "pos", value: e.py, fromStar: !!e.fromStar };
        result.arrows.push({ tokenId: e.parent, paramName: p.name, kind: "ok" });
        posCursor++;
      }
    }
  }
  // Overflow positionals
  while (posCursor < positionals.length) {
    const e = positionals[posCursor];
    if (aParam) {
      result.absorbed.args.push(e.py);
      result.arrows.push({ tokenId: e.parent, paramName: aParam.name, kind: "ok" });
    } else {
      const limit = params.filter((p) => p.kind === "P" || p.kind === "B").length;
      result.errors.push(`TypeError: takes ${limit} positional arguments but ${positionals.length} were given (extra: ${e.py})`);
      result.arrows.push({ tokenId: e.parent, paramName: null, kind: "err" });
    }
    posCursor++;
  }

  // 2) Bind keywords into B and K slots; leftovers into W if present, else error.
  const wParam = params.find((p) => p.kind === "W");
  for (const e of keywords) {
    const target = params.find((p) => p.name === e.name);
    if (target && (target.kind === "P")) {
      result.errors.push(`TypeError: '${e.name}' is positional-only (passed as keyword)`);
      result.arrows.push({ tokenId: e.parent, paramName: target.name, kind: "err" });
      continue;
    }
    if (target && (target.kind === "B" || target.kind === "K")) {
      if (result.bindings[target.name]) {
        result.errors.push(`TypeError: got multiple values for argument '${e.name}'`);
        result.arrows.push({ tokenId: e.parent, paramName: target.name, kind: "err" });
        continue;
      }
      result.bindings[target.name] = { source: "kw", value: e.py.split("=").slice(1).join("="), fromStarStar: !!e.fromStarStar };
      result.arrows.push({ tokenId: e.parent, paramName: target.name, kind: "ok" });
      continue;
    }
    if (wParam) {
      result.absorbed.kwargs[e.name] = e.py.split("=").slice(1).join("=");
      result.arrows.push({ tokenId: e.parent, paramName: wParam.name, kind: "ok" });
      continue;
    }
    result.errors.push(`TypeError: got an unexpected keyword argument '${e.name}'`);
    result.arrows.push({ tokenId: e.parent, paramName: null, kind: "err" });
  }

  // 3) Required slots still empty?
  for (const p of params) {
    if ((p.kind === "P" || p.kind === "B" || p.kind === "K") && p.required && !result.bindings[p.name]) {
      result.errors.push(`TypeError: missing 1 required ${p.kind === "K" ? "keyword-only" : "positional"} argument: '${p.name}'`);
    }
  }

  // Update token states
  for (const t of tokens) {
    const tokenArrows = result.arrows.filter((a) => a.tokenId === t.id);
    if (tokenArrows.length === 0) continue;
    const allOk = tokenArrows.every((a) => a.kind === "ok");
    const state = tokenStateById(t.id);
    state.state = allOk ? "placed" : "error";
    state.targets = tokenArrows.map((a) => a.paramName);
  }

  return result;
}

// ──────────────────────────────────────────────────────────────
// Mode 1 — Signature Dissector
// ──────────────────────────────────────────────────────────────

function SignatureMode() {
  const [recipeId, setRecipeId] = useState("render");
  const recipe = SIG_RECIPES.find((r) => r.id === recipeId);

  return (
    <div>
      <RecipePicker recipeId={recipeId} setRecipeId={setRecipeId} />

      <SectionFrame title="def-LINE · Python source" tone="neutral">
        <pre style={codeStyle}>{recipe.pyDef + "\n    ..."}</pre>
      </SectionFrame>

      <SectionFrame title="SLOT RACK · five kinds, in fixed order">
        <SlotRack params={recipe.params} highlightAll />
        <div style={{ marginTop: 12, fontSize: 11, color: DS.dim, fontFamily: "var(--ds-mono), monospace", lineHeight: 1.7 }}>
          # {recipe.note}
        </div>
      </SectionFrame>

      <SectionFrame title="LEGEND" tone="neutral">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 6 }}>
          {Object.entries(SLOT_META).map(([k, m]) => (
            <span key={k} style={{
              padding: "5px 10px",
              borderRadius: 8,
              border: `1px solid ${m.color}55`,
              background: `${m.color}14`,
              color: m.color,
              fontFamily: "var(--ds-mono), monospace",
              fontSize: 11,
              fontWeight: 700,
            }}>
              {m.label} <span style={{ color: DS.dim, fontWeight: 500 }}>·</span> {m.short}
            </span>
          ))}
        </div>
      </SectionFrame>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Mode 2 — Live Call Binder
// ──────────────────────────────────────────────────────────────

function CallBinderMode() {
  const [recipeId, setRecipeId] = useState("render");
  const [tokenIds, setTokenIds] = useState(["posA", "kw_data", "kw_theme"]);
  const recipe = SIG_RECIPES.find((r) => r.id === recipeId);
  const tokens = tokenIds.map((id) => TOKEN_LIBRARY.find((t) => t.id === id)).filter(Boolean);

  // Bind freshly when either sig or tokens change.
  const result = useMemo(() => bindCall(recipe, tokens), [recipe, tokens]);

  function add(id) {
    setTokenIds((xs) => [...xs, id]);
  }
  function removeAt(i) {
    setTokenIds((xs) => xs.filter((_, k) => k !== i));
  }
  function clear() {
    setTokenIds([]);
  }

  const callPy = `${recipeFunctionName(recipe)}(${tokens.map((t) => t.py).join(", ")})`;

  return (
    <div>
      <RecipePicker recipeId={recipeId} setRecipeId={(id) => { setRecipeId(id); setTokenIds([]); }} />

      <SectionFrame title="SIGNATURE">
        <SlotRack params={recipe.params} bindings={result.bindings} arrows={result.arrows} tokens={tokens} />
        <div style={{ marginTop: 10, fontFamily: "var(--ds-mono), monospace", fontSize: 11, color: DS.dim, lineHeight: 1.6 }}>
          {recipe.pyDef}
        </div>
      </SectionFrame>

      <SectionFrame title="CALL SITE · click a token to add it; click again on the chip to remove it" tone="neutral">
        <div style={{ marginTop: 8, padding: "10px 12px", borderRadius: 10, background: "rgba(2,6,23,0.55)", border: `1px solid ${DS.border}`, fontFamily: "var(--ds-mono), monospace", fontSize: 12, color: DS.t1, lineHeight: 1.6, minHeight: 40 }}>
          {callPy}
        </div>
        <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 6 }}>
          {tokens.map((t, i) => {
            const state = result.tokensState.find((s) => s.id === t.id);
            const broken = state?.state === "error";
            return (
              <button
                key={`${t.id}_${i}`}
                type="button"
                onClick={() => removeAt(i)}
                style={{
                  padding: "5px 10px",
                  borderRadius: 8,
                  border: `1px solid ${broken ? "rgba(248,113,113,0.5)" : "rgba(99,102,241,0.4)"}`,
                  background: broken ? "rgba(248,113,113,0.08)" : "rgba(99,102,241,0.10)",
                  color: broken ? "#FCA5A5" : DS.t1,
                  fontFamily: "var(--ds-mono), monospace",
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
                title="click to remove"
              >
                {t.py}  ·  ✕
              </button>
            );
          })}
          {tokens.length === 0 && (
            <span style={{ color: DS.dim, fontSize: 11, fontFamily: "var(--ds-mono), monospace" }}>
              (empty call — pick tokens below)
            </span>
          )}
          {tokens.length > 0 && (
            <button
              type="button"
              onClick={clear}
              style={{
                padding: "5px 10px",
                borderRadius: 8,
                border: `1px solid ${DS.border}`,
                background: "rgba(255,255,255,0.02)",
                color: DS.t3,
                fontFamily: "var(--ds-mono), monospace",
                fontSize: 11,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              clear all
            </button>
          )}
        </div>
      </SectionFrame>

      <SectionFrame title="TOKEN PALETTE · click to append">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 8 }}>
          {TOKEN_GROUPS.map((g) => (
            <div
              key={g.title}
              style={{
                padding: "8px 10px",
                borderRadius: 10,
                border: `1px solid ${DS.border}`,
                background: "rgba(255,255,255,0.015)",
              }}
            >
              <div style={{ fontSize: 9, letterSpacing: 1.4, color: DS.dim, fontFamily: "var(--ds-mono), monospace", fontWeight: 700, marginBottom: 8 }}>
                {g.title}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {TOKEN_LIBRARY.filter(g.filter).map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => add(t.id)}
                    style={{
                      padding: "4px 8px",
                      borderRadius: 7,
                      border: `1px solid ${DS.border}`,
                      background: "rgba(255,255,255,0.02)",
                      color: DS.t2,
                      fontFamily: "var(--ds-mono), monospace",
                      fontSize: 10,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </SectionFrame>

      <ResultBanner result={result} recipe={recipe} />
    </div>
  );
}

function recipeFunctionName(recipe) {
  return recipe.pyDef.match(/^def\s+(\w+)/)?.[1] ?? "f";
}

function ResultBanner({ result, recipe }) {
  if (result.errors.length > 0) {
    return (
      <div
        style={{
          marginTop: 14,
          padding: "12px 14px",
          borderRadius: 12,
          border: `1px solid rgba(248,113,113,0.35)`,
          background: "rgba(248,113,113,0.07)",
          fontFamily: "var(--ds-mono), monospace",
          fontSize: 12,
          color: "#FCA5A5",
          lineHeight: 1.7,
        }}
      >
        <div style={{ fontSize: 9, letterSpacing: 1.4, color: "#FCA5A5", fontWeight: 700, marginBottom: 6 }}>BIND FAILED</div>
        {result.errors.map((e, i) => (
          <div key={i}>{e}</div>
        ))}
      </div>
    );
  }
  // success — render the bound frame
  return (
    <div
      style={{
        marginTop: 14,
        padding: "12px 14px",
        borderRadius: 12,
        border: `1px solid rgba(52,211,153,0.30)`,
        background: "rgba(52,211,153,0.05)",
        fontFamily: "var(--ds-mono), monospace",
        fontSize: 12,
        color: DS.t2,
        lineHeight: 1.7,
      }}
    >
      <div style={{ fontSize: 9, letterSpacing: 1.4, color: DS.grn, fontWeight: 700, marginBottom: 6 }}>
        BIND OK · LOCAL FRAME
      </div>
      {recipe.params.map((p) => {
        const b = result.bindings[p.name];
        const meta = SLOT_META[p.kind];
        let value;
        let from;
        if (p.kind === "A") {
          value = `(${result.absorbed.args.join(", ")})`;
          from = result.absorbed.args.length ? "absorbed" : "default";
        } else if (p.kind === "W") {
          const entries = Object.entries(result.absorbed.kwargs);
          value = `{${entries.map(([k, v]) => `'${k}': ${v}`).join(", ")}}`;
          from = entries.length ? "absorbed" : "default";
        } else if (b) {
          value = b.value;
          from = b.source === "pos" ? (b.fromStar ? "*unpack" : "positional") : (b.fromStarStar ? "**unpack" : "keyword");
        } else if (!p.required) {
          value = p.default;
          from = "default";
        } else {
          value = "??";
          from = "missing";
        }
        return (
          <div key={p.name} style={{ display: "flex", gap: 10, alignItems: "baseline" }}>
            <span style={{ color: meta.color, width: 84, fontWeight: 700 }}>{meta.label}</span>
            <span style={{ color: DS.t1, minWidth: 70 }}>{p.name}</span>
            <span style={{ color: DS.dim }}>=</span>
            <span style={{ color: DS.t1 }}>{value}</span>
            <span style={{ color: DS.dim, fontSize: 10 }}>← {from}</span>
          </div>
        );
      })}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Mode 3 — Mutable default trap
// ──────────────────────────────────────────────────────────────

function MutableDefaultMode() {
  const [calls, setCalls] = useState([]);
  const [variant, setVariant] = useState("buggy");

  function call() {
    setCalls((xs) => [...xs, xs.length + 1]);
  }
  function reset() {
    setCalls([]);
  }

  // Compute the state of the shared default after each call
  const states = useMemo(() => {
    const out = [];
    let shared = []; // the default object — captured at def-time
    for (const n of calls) {
      if (variant === "buggy") {
        shared = [...shared, `item_${n}`];
        out.push({ n, returned: [...shared], shared: [...shared] });
      } else {
        const fresh = [`item_${n}`];
        out.push({ n, returned: fresh, shared: [] });
      }
    }
    return out;
  }, [calls, variant]);

  const sharedFinal = states.length ? states[states.length - 1].shared : [];

  return (
    <div>
      <SectionFrame title="THE TWO VERSIONS">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 8 }}>
          <div
            onClick={() => { setVariant("buggy"); setCalls([]); }}
            style={{
              padding: "10px 12px",
              borderRadius: 10,
              border: `1px solid ${variant === "buggy" ? "rgba(248,113,113,0.5)" : DS.border}`,
              background: variant === "buggy" ? "rgba(248,113,113,0.06)" : "rgba(255,255,255,0.02)",
              cursor: "pointer",
            }}
          >
            <div style={{ fontSize: 9, letterSpacing: 1.4, color: variant === "buggy" ? "#FCA5A5" : DS.dim, fontWeight: 700, marginBottom: 6 }}>BUGGY · mutable default</div>
            <pre style={codeStyle}>{`def add(item, target=[]):
    target.append(item)
    return target`}</pre>
          </div>
          <div
            onClick={() => { setVariant("fixed"); setCalls([]); }}
            style={{
              padding: "10px 12px",
              borderRadius: 10,
              border: `1px solid ${variant === "fixed" ? "rgba(52,211,153,0.5)" : DS.border}`,
              background: variant === "fixed" ? "rgba(52,211,153,0.06)" : "rgba(255,255,255,0.02)",
              cursor: "pointer",
            }}
          >
            <div style={{ fontSize: 9, letterSpacing: 1.4, color: variant === "fixed" ? DS.grn : DS.dim, fontWeight: 700, marginBottom: 6 }}>FIXED · None sentinel</div>
            <pre style={codeStyle}>{`def add(item, target=None):
    if target is None:
        target = []
    target.append(item)
    return target`}</pre>
          </div>
        </div>
      </SectionFrame>

      <SectionFrame title="DEFAULT OBJECT · the [] in the def line, identified once" tone={variant === "buggy" ? "danger" : "ok"}>
        <div style={{ marginTop: 8, fontFamily: "var(--ds-mono), monospace", fontSize: 12, color: DS.t2, lineHeight: 1.7 }}>
          <div>
            id(target_default) ·{" "}
            <span style={{ color: variant === "buggy" ? "#FCA5A5" : DS.grn, fontWeight: 700 }}>
              {variant === "buggy" ? "0x7f8e_buggy_shared" : "0x7f8e_None_singleton"}
            </span>
          </div>
          <div>
            current contents ·{" "}
            <span style={{ color: DS.t1 }}>
              [{sharedFinal.map((x) => `'${x}'`).join(", ")}]
            </span>
            {variant === "buggy" && sharedFinal.length > 0 && (
              <span style={{ color: "#FCA5A5", marginLeft: 8 }}>← carried across calls</span>
            )}
            {variant === "fixed" && (
              <span style={{ color: DS.grn, marginLeft: 8 }}>← always None at def time; fresh [] inside body</span>
            )}
          </div>
        </div>
      </SectionFrame>

      <SectionFrame title="CALL FRAMES · invoke add('item_n') with no target arg">
        <div style={{ display: "flex", gap: 10, marginTop: 8, marginBottom: 12 }}>
          <ActionButton label="call add('item_…')" tone="primary" onClick={call} />
          <ActionButton label="reset" tone="ghost" onClick={reset} />
        </div>
        {states.length === 0 ? (
          <div style={{ fontSize: 11, color: DS.dim, fontFamily: "var(--ds-mono), monospace" }}>
            (no calls yet — click the button)
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {states.map((s, i) => (
              <CallFrameRow key={i} variant={variant} state={s} />
            ))}
          </div>
        )}
      </SectionFrame>

      <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: 12, border: `1px solid ${DS.border}`, fontSize: 11, color: DS.t3, fontFamily: "var(--ds-mono), monospace", lineHeight: 1.7 }}>
        <span style={{ color: DS.dim }}># </span>
        In <b>buggy</b>, every call returns the <i>same list reference</i>. Watch how the bottom row keeps growing — every caller from before sees the new items sneak in. In <b>fixed</b>, the default is the immutable <code>None</code>; the body builds a fresh list, and each return value is independent.
      </div>
    </div>
  );
}

function CallFrameRow({ variant, state }) {
  const buggy = variant === "buggy";
  return (
    <div
      style={{
        padding: "8px 10px",
        borderRadius: 8,
        border: `1px solid ${buggy ? "rgba(248,113,113,0.25)" : "rgba(52,211,153,0.25)"}`,
        background: buggy ? "rgba(248,113,113,0.04)" : "rgba(52,211,153,0.04)",
        fontFamily: "var(--ds-mono), monospace",
        fontSize: 11,
        color: DS.t2,
        display: "grid",
        gridTemplateColumns: "60px 1fr 1fr",
        gap: 10,
      }}
    >
      <span style={{ color: DS.dim }}>call #{state.n}</span>
      <span>
        return ·{" "}
        <span style={{ color: DS.t1, fontWeight: 700 }}>
          [{state.returned.map((x) => `'${x}'`).join(", ")}]
        </span>
      </span>
      <span>
        shared default after ·{" "}
        <span style={{ color: buggy ? "#FCA5A5" : DS.grn }}>
          [{state.shared.map((x) => `'${x}'`).join(", ")}]
        </span>
      </span>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Slot Rack — the visual: a row of slot pills colored by kind.
// ──────────────────────────────────────────────────────────────

function SlotRack({ params, bindings, arrows, tokens, highlightAll }) {
  return (
    <div
      style={{
        marginTop: 8,
        padding: "12px 12px",
        borderRadius: 12,
        border: `1px dashed ${DS.border}`,
        background: "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(2,6,23,0.4))",
      }}
    >
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "stretch" }}>
        {params.map((p, i) => {
          const meta = SLOT_META[p.kind];
          const showDivider = (() => {
            // before this param, do we cross / or *?
            if (i === 0) return null;
            const prev = params[i - 1];
            if (prev.kind === "P" && p.kind !== "P") return "/";
            if (prev.kind !== "A" && prev.kind !== "K" && p.kind === "K") return "*";
            return null;
          })();
          const b = bindings?.[p.name];
          const filled = (() => {
            if (p.kind === "A") return null; // shown in result banner
            if (p.kind === "W") return null;
            if (b) return b.value;
            return p.default;
          })();
          return (
            <div key={p.name} style={{ display: "flex", alignItems: "stretch", gap: 6 }}>
              {showDivider && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    paddingTop: 14,
                    color: DS.t3,
                    fontFamily: "var(--ds-mono), monospace",
                    fontSize: 14,
                    fontWeight: 700,
                    minWidth: 12,
                  }}
                  title={showDivider === "/" ? "divider: everything to the left is positional-only" : "divider: everything to the right is keyword-only"}
                >
                  {showDivider}
                </div>
              )}
              <div
                style={{
                  minWidth: 110,
                  padding: "8px 10px",
                  borderRadius: 10,
                  border: `1px solid ${meta.color}55`,
                  background: highlightAll ? `${meta.color}10` : (b ? `${meta.color}1c` : "rgba(255,255,255,0.015)"),
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                }}
              >
                <div style={{ fontSize: 9, letterSpacing: 1.2, color: meta.color, fontWeight: 700, fontFamily: "var(--ds-mono), monospace" }}>
                  {meta.label}
                </div>
                <div style={{ fontSize: 13, color: DS.t1, fontWeight: 700, fontFamily: "var(--ds-mono), monospace" }}>
                  {p.kind === "A" ? `*${p.name}` : p.kind === "W" ? `**${p.name}` : p.name}
                  {p.required ? null : <span style={{ color: DS.dim, fontWeight: 500 }}>{p.default ? `=${p.default}` : ""}</span>}
                </div>
                {filled != null && b && (
                  <div style={{ fontSize: 10, color: DS.t2, fontFamily: "var(--ds-mono), monospace", borderTop: `1px dashed ${meta.color}33`, paddingTop: 4 }}>
                    bound · <span style={{ color: meta.color }}>{filled}</span>
                  </div>
                )}
                {p.kind === "A" && bindings && (
                  <div style={{ fontSize: 10, color: DS.dim, fontFamily: "var(--ds-mono), monospace", borderTop: `1px dashed ${meta.color}33`, paddingTop: 4 }}>
                    absorbs extra positionals
                  </div>
                )}
                {p.kind === "W" && bindings && (
                  <div style={{ fontSize: 10, color: DS.dim, fontFamily: "var(--ds-mono), monospace", borderTop: `1px dashed ${meta.color}33`, paddingTop: 4 }}>
                    absorbs extra keywords
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Arrow legend — show bind sources */}
      {arrows && tokens && tokens.length > 0 && (
        <div style={{ marginTop: 12, paddingTop: 10, borderTop: `1px dashed ${DS.border}`, display: "flex", flexDirection: "column", gap: 4 }}>
          {tokens.map((t, i) => {
            const tokenArrows = arrows.filter((a) => a.tokenId === t.id);
            const allOk = tokenArrows.length > 0 && tokenArrows.every((a) => a.kind === "ok");
            return (
              <div
                key={`${t.id}_${i}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontFamily: "var(--ds-mono), monospace",
                  fontSize: 11,
                  color: DS.t2,
                }}
              >
                <span style={{ color: allOk ? DS.grn : "#FCA5A5", fontWeight: 700 }}>{allOk ? "→" : "✗"}</span>
                <span style={{ color: DS.t1, minWidth: 130 }}>{t.py}</span>
                <span style={{ color: DS.dim }}>routes to</span>
                <span style={{ color: allOk ? DS.t1 : "#FCA5A5" }}>
                  {tokenArrows.length === 0
                    ? "—"
                    : tokenArrows.map((a) => a.paramName ?? "(no slot)").filter(Boolean).join(", ") || "(no slot)"}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Pieces.
// ──────────────────────────────────────────────────────────────

function RecipePicker({ recipeId, setRecipeId }) {
  return (
    <div
      style={{
        padding: "12px 14px",
        borderRadius: 14,
        border: `1px solid ${DS.border}`,
        background: "rgba(255,255,255,0.015)",
        marginBottom: 14,
      }}
    >
      <div style={{ fontSize: 9, letterSpacing: 1.4, color: DS.dim, fontFamily: "var(--ds-mono), monospace", fontWeight: 700 }}>
        RECIPE · pick a signature
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
        {SIG_RECIPES.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => setRecipeId(r.id)}
            style={{
              padding: "6px 10px",
              borderRadius: 8,
              border: `1px solid ${recipeId === r.id ? DS.ind : DS.border}`,
              background: recipeId === r.id ? `${DS.ind}1e` : "rgba(255,255,255,0.02)",
              color: recipeId === r.id ? DS.t1 : DS.t2,
              fontSize: 11,
              fontFamily: "var(--ds-mono), monospace",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {r.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function SectionFrame({ title, children, tone }) {
  const border = tone === "danger" ? "rgba(248,113,113,0.30)" : tone === "ok" ? "rgba(52,211,153,0.28)" : DS.border;
  const bg = tone === "danger" ? "rgba(248,113,113,0.04)" : tone === "ok" ? "rgba(52,211,153,0.04)" : "rgba(255,255,255,0.015)";
  return (
    <div
      style={{
        padding: "12px 14px",
        borderRadius: 14,
        border: `1px solid ${border}`,
        background: bg,
        marginBottom: 12,
      }}
    >
      <div style={{ fontSize: 9, letterSpacing: 1.4, color: DS.dim, fontFamily: "var(--ds-mono), monospace", fontWeight: 700 }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function ActionButton({ label, onClick, tone }) {
  const palette = {
    primary: { bg: "rgba(99,102,241,0.18)", border: `${DS.ind}66`, color: DS.t1 },
    ghost: { bg: "rgba(255,255,255,0.02)", border: DS.border, color: DS.t2 },
    danger: { bg: "rgba(248,113,113,0.10)", border: "rgba(248,113,113,0.30)", color: "#FCA5A5" },
  }[tone] ?? { bg: "rgba(255,255,255,0.02)", border: DS.border, color: DS.t2 };
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "8px 14px",
        borderRadius: 10,
        border: `1px solid ${palette.border}`,
        background: palette.bg,
        color: palette.color,
        fontSize: 12,
        fontFamily: "var(--ds-mono), monospace",
        fontWeight: 600,
        cursor: "pointer",
      }}
    >
      {label}
    </button>
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

const codeStyle = {
  fontFamily: "var(--ds-mono), monospace",
  fontSize: 11,
  lineHeight: 1.6,
  color: DS.t2,
  background: "rgba(2,6,23,0.55)",
  padding: "10px 12px",
  borderRadius: 10,
  border: `1px solid ${DS.border}`,
  margin: 0,
  whiteSpace: "pre-wrap",
};

// ──────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────

export default function ArgumentBinder() {
  const [mode, setMode] = useState("call");
  return (
    <div style={{ fontFamily: "var(--ds-sans), sans-serif" }}>
      <div style={{ fontSize: 17, fontWeight: 700, color: DS.t1, marginBottom: 4 }}>
        The argument binder
      </div>
      <p style={{ fontSize: 12, color: DS.t3, fontFamily: "var(--ds-mono), monospace", lineHeight: 1.6, marginBottom: 14 }}>
        Five slot kinds. Two binding passes. Five canonical TypeErrors. Pick a signature, then route arguments into slots and watch the rules in action.
      </p>

      <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
        <ModeTab active={mode === "sig"}     onClick={() => setMode("sig")}     label="1 · signature dissector" hint="five slots in fixed order" />
        <ModeTab active={mode === "call"}    onClick={() => setMode("call")}    label="2 · live call binder"    hint="route call-site args into slots" />
        <ModeTab active={mode === "default"} onClick={() => setMode("default")} label="3 · mutable-default trap" hint="default evaluated once at def time" />
      </div>

      {mode === "sig" && <SignatureMode />}
      {mode === "call" && <CallBinderMode />}
      {mode === "default" && <MutableDefaultMode />}
    </div>
  );
}
