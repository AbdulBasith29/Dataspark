import { useMemo, useState } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

/**
 * ComprehensionForge — a 4-stage pipeline that takes a Python comprehension
 * apart. Items flow SOURCE → FILTER → TRANSFORM → COLLECT; rejected items
 * fade in place, kept items pulse green into the next column. A live "source
 * echo" panel prints both the comprehension and its equivalent for-loop.
 *
 * Scope: py-b5 — Comprehensions: The Pythonic Way. Intentionally distinct
 * from StringFormatAtelier / HashLab — teaches by RE-ORDERING Python's
 * syntax into its execution order, which is the single biggest beginner
 * gotcha.
 */

// ──────────────────────────────────────────────────────────────
// Dataset library (fixed presets — no eval, no arbitrary code).
// Each dataset ships its own filter + transform options so the viz
// stays honest (no picker that can't format its data).
// ──────────────────────────────────────────────────────────────

const DATASETS = {
  nums: {
    label: "ints · 1..10",
    items: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    varName: "x",
    pyLiteral: "[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]",
    repr: (x) => String(x),
    filters: [
      { id: "none", py: "", fn: () => true, label: "no filter" },
      { id: "even", py: "x % 2 == 0", fn: (x) => x % 2 === 0, label: "x % 2 == 0" },
      { id: "gt5", py: "x > 5", fn: (x) => x > 5, label: "x > 5" },
      { id: "lt5", py: "x < 5", fn: (x) => x < 5, label: "x < 5" },
    ],
    transforms: [
      { id: "id", py: "x", fn: (x) => x, label: "x" },
      { id: "sq", py: "x ** 2", fn: (x) => x * x, label: "x ** 2" },
      { id: "x10", py: "x * 10", fn: (x) => x * 10, label: "x * 10" },
      { id: "neg", py: "-x", fn: (x) => -x, label: "-x" },
    ],
    keyFns: [
      { id: "sq", py: "x ** 2", fn: (x) => x * x, label: "x ** 2" },
      { id: "id", py: "x", fn: (x) => x, label: "x" },
      { id: "str", py: "str(x)", fn: (x) => `'${String(x)}'`, fnRaw: (x) => String(x), label: "str(x)" },
    ],
  },
  words: {
    label: "strs · fruit",
    items: ["apple", "banana", "cherry", "date", "elderberry", "fig", "grape"],
    varName: "w",
    pyLiteral: "['apple', 'banana', 'cherry', 'date', 'elderberry', 'fig', 'grape']",
    repr: (w) => `'${w}'`,
    filters: [
      { id: "none", py: "", fn: () => true, label: "no filter" },
      { id: "long", py: "len(w) > 4", fn: (w) => w.length > 4, label: "len(w) > 4" },
      { id: "starts_a", py: 'w.startswith("a")', fn: (w) => w.startsWith("a"), label: 'startswith("a")' },
      { id: "has_e", py: '"e" in w', fn: (w) => w.includes("e"), label: '"e" in w' },
    ],
    transforms: [
      { id: "id", py: "w", fn: (w) => w, label: "w" },
      { id: "upper", py: "w.upper()", fn: (w) => w.toUpperCase(), label: "w.upper()" },
      { id: "len", py: "len(w)", fn: (w) => w.length, label: "len(w)" },
      { id: "first", py: "w[0]", fn: (w) => w[0], label: "w[0]" },
    ],
    keyFns: [
      { id: "id", py: "w", fn: (w) => `'${w}'`, fnRaw: (w) => w, label: "w" },
      { id: "first", py: "w[0]", fn: (w) => `'${w[0]}'`, fnRaw: (w) => w[0], label: "w[0]" },
      { id: "len", py: "len(w)", fn: (w) => String(w.length), fnRaw: (w) => w.length, label: "len(w)" },
    ],
  },
  users: {
    label: "dicts · users",
    items: [
      { name: "ada", age: 34, active: true },
      { name: "bob", age: 17, active: true },
      { name: "cara", age: 52, active: false },
      { name: "dan", age: 28, active: true },
      { name: "eve", age: 19, active: false },
      { name: "frank", age: 45, active: true },
    ],
    varName: "u",
    pyLiteral: `users = [
    {'name': 'ada', 'age': 34, 'active': True},
    {'name': 'bob', 'age': 17, 'active': True},
    {'name': 'cara', 'age': 52, 'active': False},
    {'name': 'dan', 'age': 28, 'active': True},
    {'name': 'eve', 'age': 19, 'active': False},
    {'name': 'frank', 'age': 45, 'active': True},
]`,
    repr: (u) => `{'name': '${u.name}', 'age': ${u.age}, 'active': ${u.active ? "True" : "False"}}`,
    filters: [
      { id: "none", py: "", fn: () => true, label: "no filter" },
      { id: "adult", py: "u['age'] >= 18", fn: (u) => u.age >= 18, label: "adult" },
      { id: "active", py: "u['active']", fn: (u) => u.active, label: "active" },
      { id: "young", py: "u['age'] < 30", fn: (u) => u.age < 30, label: "age < 30" },
    ],
    transforms: [
      { id: "name", py: "u['name']", fn: (u) => u.name, label: "u['name']" },
      { id: "age", py: "u['age']", fn: (u) => u.age, label: "u['age']" },
      { id: "nameUpper", py: "u['name'].upper()", fn: (u) => u.name.toUpperCase(), label: "u['name'].upper()" },
      { id: "u", py: "u", fn: (u) => u, label: "u (passthrough)" },
    ],
    keyFns: [
      { id: "name", py: "u['name']", fn: (u) => `'${u.name}'`, fnRaw: (u) => u.name, label: "u['name']" },
      { id: "age", py: "u['age']", fn: (u) => String(u.age), fnRaw: (u) => u.age, label: "u['age']" },
    ],
  },
};

const CONTAINERS = [
  { id: "list", py: "[ ]", label: "list", open: "[", close: "]" },
  { id: "set", py: "{ }", label: "set", open: "{", close: "}" },
  { id: "dict", py: "{ : }", label: "dict", open: "{", close: "}" },
  { id: "gen", py: "( )", label: "generator", open: "(", close: ")" },
];

// ──────────────────────────────────────────────────────────────
// Renderers
// ──────────────────────────────────────────────────────────────

function reprPy(v) {
  if (typeof v === "string") return `'${v}'`;
  if (typeof v === "number") return String(v);
  if (typeof v === "boolean") return v ? "True" : "False";
  if (v && typeof v === "object") {
    const entries = Object.entries(v).map(([k, val]) => `'${k}': ${reprPy(val)}`);
    return `{${entries.join(", ")}}`;
  }
  return String(v);
}

function shortRepr(v) {
  if (typeof v === "string") return `'${v}'`;
  if (typeof v === "number") return String(v);
  if (v && typeof v === "object") return `{...}`;
  return String(v);
}

// ──────────────────────────────────────────────────────────────
// Main component
// ──────────────────────────────────────────────────────────────

export default function ComprehensionForge() {
  const [datasetKey, setDatasetKey] = useState("nums");
  const dataset = DATASETS[datasetKey];
  const [filterKey, setFilterKey] = useState("even");
  const [transformKey, setTransformKey] = useState("sq");
  const [keyFnKey, setKeyFnKey] = useState(dataset.keyFns[0].id);
  const [container, setContainer] = useState("list");

  // when dataset changes, snap filter/transform/key into valid picks
  const ensureValid = (ds, fKey, tKey, kKey) => {
    const f = ds.filters.find((o) => o.id === fKey) ? fKey : ds.filters[0].id;
    const t = ds.transforms.find((o) => o.id === tKey) ? tKey : ds.transforms[0].id;
    const k = ds.keyFns.find((o) => o.id === kKey) ? kKey : ds.keyFns[0].id;
    return [f, t, k];
  };

  const handleDataset = (next) => {
    const ds = DATASETS[next];
    const [f, t, k] = ensureValid(ds, filterKey, transformKey, keyFnKey);
    setDatasetKey(next);
    setFilterKey(f);
    setTransformKey(t);
    setKeyFnKey(k);
  };

  const filterObj = dataset.filters.find((o) => o.id === filterKey);
  const transformObj = dataset.transforms.find((o) => o.id === transformKey);
  const keyFnObj = dataset.keyFns.find((o) => o.id === keyFnKey);

  const stages = useMemo(() => {
    const source = dataset.items.map((item, i) => ({ i, item, keep: filterObj.fn(item) }));
    const kept = source.filter((s) => s.keep);
    const transformed = kept.map(({ i, item }) => ({ i, item, out: transformObj.fn(item) }));
    return { source, kept, transformed };
  }, [dataset, filterObj, transformObj]);

  // Final collected output — container-specific
  const collected = useMemo(() => {
    const vals = stages.transformed.map((t) => t.out);
    if (container === "list" || container === "gen") return { items: vals };
    if (container === "set") {
      const seen = new Set();
      const out = [];
      for (const v of vals) {
        const k = reprPy(v);
        if (!seen.has(k)) {
          seen.add(k);
          out.push(v);
        }
      }
      return { items: out, droppedDupes: vals.length - out.length };
    }
    if (container === "dict") {
      // key = keyFn(item), value = transform(item) — later key wins
      const m = new Map();
      for (const t of stages.transformed) {
        const k = keyFnObj.fnRaw ? keyFnObj.fnRaw(t.item) : keyFnObj.fn(t.item);
        m.set(k, t.out);
      }
      return { pairs: Array.from(m.entries()), droppedDupes: stages.transformed.length - m.size };
    }
    return { items: vals };
  }, [stages, container, keyFnObj]);

  // Python source echo (comprehension + equivalent for-loop)
  const comp = buildComprehension({
    container,
    transform: transformObj.py,
    varName: dataset.varName,
    source: "data",
    filter: filterObj.py,
    keyExpr: keyFnObj.py,
  });

  const forLoop = buildForLoop({
    container,
    transform: transformObj.py,
    varName: dataset.varName,
    source: "data",
    filter: filterObj.py,
    keyExpr: keyFnObj.py,
  });

  return (
    <div style={{ fontFamily: "var(--ds-sans), sans-serif" }}>
      <div style={{ fontSize: 17, fontWeight: 700, color: DS.t1, marginBottom: 4 }}>
        The comprehension forge
      </div>
      <p style={{ fontSize: 12, color: DS.t3, fontFamily: "var(--ds-mono), monospace", lineHeight: 1.6, marginBottom: 14 }}>
        Items flow <span style={{ color: DS.ind }}>SOURCE → FILTER → TRANSFORM → COLLECT</span>.
        Python reads <em>expression first, filter last</em> — but <strong style={{ color: DS.t1 }}>execution goes the other way</strong>. Watch both at once.
      </p>

      {/* Controls bar */}
      <div
        style={{
          padding: "14px 14px 8px",
          borderRadius: 14,
          border: `1px solid ${DS.border}`,
          background: "rgba(255,255,255,0.015)",
          marginBottom: 14,
        }}
      >
        <Row>
          <Field label="source · for x in data">
            <ChipRow
              options={Object.entries(DATASETS).map(([k, v]) => [k, v.label])}
              value={datasetKey}
              onChange={handleDataset}
              color="#60A5FA"
            />
          </Field>
          <Field label={`filter · if ${filterObj.py || "(none)"}`}>
            <ChipRow
              options={dataset.filters.map((o) => [o.id, o.label])}
              value={filterKey}
              onChange={setFilterKey}
              color="#FCD34D"
              wrap
            />
          </Field>
        </Row>
        <Row>
          <Field label={`transform · ${transformObj.py}`}>
            <ChipRow
              options={dataset.transforms.map((o) => [o.id, o.label])}
              value={transformKey}
              onChange={setTransformKey}
              color="#34D399"
              wrap
            />
          </Field>
          <Field label="collect into">
            <ChipRow
              options={CONTAINERS.map((c) => [c.id, c.label])}
              value={container}
              onChange={setContainer}
              color="#A78BFA"
            />
          </Field>
        </Row>
        {container === "dict" && (
          <Row>
            <Field label={`dict key · ${keyFnObj.py}`}>
              <ChipRow
                options={dataset.keyFns.map((o) => [o.id, o.label])}
                value={keyFnKey}
                onChange={setKeyFnKey}
                color="#F472B6"
                wrap
              />
            </Field>
          </Row>
        )}
      </div>

      {/* Pipeline */}
      <div
        style={{
          padding: 14,
          borderRadius: 14,
          border: `1px solid ${DS.border}`,
          background: "linear-gradient(180deg, rgba(99,102,241,0.05), rgba(6,8,20,0.35))",
          marginBottom: 14,
        }}
      >
        <div style={{ fontSize: 9, letterSpacing: 1.4, color: DS.dim, fontFamily: "var(--ds-mono), monospace", fontWeight: 700, marginBottom: 12 }}>
          PIPELINE · EXECUTION ORDER
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 10,
          }}
        >
          <Stage
            label="source"
            subtitle={`for ${dataset.varName} in data`}
            color="#60A5FA"
            count={stages.source.length}
          >
            {stages.source.map(({ i, item, keep }) => (
              <ItemChip key={i} color="#60A5FA" dim={false}>
                {dataset.repr(item)}
                {!keep && <span style={{ color: DS.dim, marginLeft: 4 }}>↓</span>}
              </ItemChip>
            ))}
          </Stage>

          <Stage
            label="filter"
            subtitle={filterObj.py ? `if ${filterObj.py}` : "(pass-through)"}
            color="#FCD34D"
            count={stages.kept.length}
            countSub={stages.source.length - stages.kept.length ? `${stages.source.length - stages.kept.length} dropped` : null}
          >
            {stages.source.map(({ i, item, keep }) => (
              <ItemChip key={i} color={keep ? "#FCD34D" : DS.dim} dim={!keep} strike={!keep}>
                {dataset.repr(item)}
              </ItemChip>
            ))}
          </Stage>

          <Stage
            label="transform"
            subtitle={transformObj.py}
            color="#34D399"
            count={stages.transformed.length}
          >
            {stages.transformed.map(({ i, out }) => (
              <ItemChip key={i} color="#34D399">
                {shortRepr(out)}
              </ItemChip>
            ))}
          </Stage>

          <Stage
            label="collect"
            subtitle={CONTAINERS.find((c) => c.id === container).py}
            color="#A78BFA"
            count={container === "dict" ? collected.pairs.length : collected.items?.length || 0}
            countSub={collected.droppedDupes ? `${collected.droppedDupes} dup${collected.droppedDupes > 1 ? "s" : ""} dropped` : null}
            dashed
          >
            {container === "dict"
              ? collected.pairs.map(([k, v], i) => (
                  <ItemChip key={i} color="#A78BFA">
                    {shortRepr(k)}: {shortRepr(v)}
                  </ItemChip>
                ))
              : (collected.items || []).map((v, i) => (
                  <ItemChip key={i} color="#A78BFA">
                    {shortRepr(v)}
                  </ItemChip>
                ))}
            {container === "gen" && collected.items?.length > 0 && (
              <div style={{ marginTop: 6, fontSize: 10, color: DS.dim, fontFamily: "var(--ds-mono), monospace" }}>
                lazy · not materialized until iterated
              </div>
            )}
          </Stage>
        </div>

        <div
          style={{
            marginTop: 14,
            padding: "10px 12px",
            borderRadius: 10,
            background: "rgba(6,8,20,0.55)",
            border: `1px dashed ${DS.border}`,
            fontFamily: "var(--ds-mono), monospace",
            fontSize: 12,
            color: DS.t2,
            overflowX: "auto",
            whiteSpace: "nowrap",
            lineHeight: 1.5,
          }}
        >
          <span style={{ color: DS.dim }}>result · </span>
          <FinalRepr container={container} collected={collected} />
        </div>
      </div>

      {/* Side-by-side: comprehension vs for-loop */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
        <CodeBlock label="comprehension" color="#34D399" code={comp} />
        <CodeBlock label="equivalent for-loop" color={DS.t3} code={forLoop} />
      </div>

      {/* Call-out about syntax vs execution */}
      <div
        style={{
          padding: "12px 14px",
          borderRadius: 10,
          border: `1px solid ${DS.ind}33`,
          background: `${DS.ind}0d`,
          fontSize: 12,
          color: DS.t2,
          lineHeight: 1.65,
        }}
      >
        <strong style={{ color: DS.ind }}>read-vs-run mismatch · </strong>
        In <code style={{ color: DS.ind, fontFamily: "var(--ds-mono), monospace" }}>[ <span style={{ color: "#34D399" }}>transform</span> for {dataset.varName} in data if <span style={{ color: "#FCD34D" }}>filter</span> ]</code>, your eye reads <span style={{ color: "#34D399" }}>transform</span> first — but Python runs <span style={{ color: "#FCD34D" }}>filter</span> first for every item. That is the #1 beginner trap: write the execution order left-to-right, then put the expression at the front.
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Stage column
// ──────────────────────────────────────────────────────────────

function Stage({ label, subtitle, color, children, count, countSub, dashed }) {
  return (
    <div
      style={{
        padding: 10,
        borderRadius: 10,
        border: `1px ${dashed ? "dashed" : "solid"} ${color}33`,
        background: `${color}08`,
        minHeight: 180,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 6,
          marginBottom: 6,
        }}
      >
        <span style={{ fontSize: 9, letterSpacing: 1.2, color, fontFamily: "var(--ds-mono), monospace", fontWeight: 700 }}>{label}</span>
        <span style={{ fontSize: 10, color: DS.dim, fontFamily: "var(--ds-mono), monospace" }}>
          n = {count}
        </span>
      </div>
      <div style={{ fontSize: 11, color: DS.t3, fontFamily: "var(--ds-mono), monospace", marginBottom: 8, wordBreak: "break-word" }}>
        {subtitle}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>{children}</div>
      {countSub && (
        <div style={{ marginTop: 8, fontSize: 10, color: "#FCD34D", fontFamily: "var(--ds-mono), monospace" }}>
          {countSub}
        </div>
      )}
    </div>
  );
}

function ItemChip({ color, dim, strike, children }) {
  return (
    <div
      style={{
        padding: "4px 8px",
        borderRadius: 6,
        background: dim ? "transparent" : `${color}14`,
        border: `1px solid ${dim ? DS.border : `${color}44`}`,
        color: dim ? DS.dim : DS.t1,
        fontFamily: "var(--ds-mono), monospace",
        fontSize: 11,
        textDecoration: strike ? "line-through" : "none",
        lineHeight: 1.4,
        wordBreak: "break-word",
      }}
    >
      {children}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Code builders
// ──────────────────────────────────────────────────────────────

function buildComprehension({ container, transform, varName, source, filter, keyExpr }) {
  const filterPart = filter ? ` if ${filter}` : "";
  if (container === "list") {
    return `result = [${transform} for ${varName} in ${source}${filterPart}]`;
  }
  if (container === "set") {
    return `result = {${transform} for ${varName} in ${source}${filterPart}}`;
  }
  if (container === "gen") {
    return `result = (${transform} for ${varName} in ${source}${filterPart})`;
  }
  // dict
  return `result = {${keyExpr}: ${transform} for ${varName} in ${source}${filterPart}}`;
}

function buildForLoop({ container, transform, varName, source, filter, keyExpr }) {
  const guard = filter ? `        if ${filter}:\n            ` : "        ";
  const body = {
    list: `${guard}result.append(${transform})`,
    set: `${guard}result.add(${transform})`,
    gen: `${guard}yield ${transform}`,
    dict: `${guard}result[${keyExpr}] = ${transform}`,
  }[container];

  if (container === "gen") {
    return `def result_gen(${source}):
    for ${varName} in ${source}:
${body}

result = result_gen(data)`;
  }

  const init = { list: "[]", set: "set()", dict: "{}" }[container];
  return `result = ${init}
for ${varName} in ${source}:
${body}`;
}

// ──────────────────────────────────────────────────────────────
// UI atoms
// ──────────────────────────────────────────────────────────────

function Row({ children }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: 12,
        padding: "8px 0",
        borderTop: `1px dashed ${DS.border}`,
      }}
    >
      {children}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label style={{ display: "block" }}>
      <div style={{ fontSize: 10, color: DS.t3, fontFamily: "var(--ds-mono), monospace", marginBottom: 6, letterSpacing: 0.2 }}>{label}</div>
      {children}
    </label>
  );
}

function ChipRow({ options, value, onChange, color, wrap = false }) {
  return (
    <div style={{ display: "flex", flexWrap: wrap ? "wrap" : "nowrap", gap: 6, overflowX: wrap ? "visible" : "auto" }}>
      {options.map(([val, label]) => {
        const active = value === val;
        return (
          <button
            key={String(val)}
            type="button"
            onClick={() => onChange(val)}
            style={{
              padding: "6px 10px",
              borderRadius: 8,
              border: `1px solid ${active ? color : DS.border}`,
              background: active ? `${color}1e` : "rgba(255,255,255,0.02)",
              color: active ? color : DS.t2,
              fontSize: 11,
              fontFamily: "var(--ds-mono), monospace",
              fontWeight: 600,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

function CodeBlock({ label, code, color }) {
  return (
    <div>
      <div style={{ fontSize: 9, letterSpacing: 1.4, color: DS.dim, fontFamily: "var(--ds-mono), monospace", marginBottom: 6, fontWeight: 700 }}>
        {label.toUpperCase()}
      </div>
      <pre
        style={{
          margin: 0,
          padding: "12px 14px",
          borderRadius: 10,
          background: "rgba(6,8,20,0.6)",
          border: `1px solid ${color === DS.t3 ? DS.border : `${color}33`}`,
          color: DS.t1,
          fontFamily: "var(--ds-mono), monospace",
          fontSize: 12,
          lineHeight: 1.6,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          overflowX: "auto",
        }}
      >
        {code}
      </pre>
    </div>
  );
}

function FinalRepr({ container, collected }) {
  if (container === "gen") {
    return <span style={{ color: DS.dim }}>&lt;generator object at 0x... &middot; not iterated yet&gt;</span>;
  }
  if (container === "dict") {
    return (
      <>
        {"{"}
        {collected.pairs.map(([k, v], i) => (
          <span key={i}>
            {i ? ", " : ""}
            <span style={{ color: "#F472B6" }}>{reprPy(k)}</span>: <span style={{ color: "#34D399" }}>{reprPy(v)}</span>
          </span>
        ))}
        {"}"}
      </>
    );
  }
  const open = container === "set" ? "{" : "[";
  const close = container === "set" ? "}" : "]";
  if ((collected.items || []).length === 0 && container === "set") return <span style={{ color: DS.dim }}>set()</span>;
  return (
    <>
      {open}
      {(collected.items || []).map((v, i) => (
        <span key={i}>
          {i ? ", " : ""}
          <span style={{ color: "#34D399" }}>{reprPy(v)}</span>
        </span>
      ))}
      {close}
    </>
  );
}
