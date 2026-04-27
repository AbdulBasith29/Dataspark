import { useMemo, useState } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

/**
 * FoldMachine — visualizes lambda / map / filter / reduce.
 *
 *   Mode 1  "Lambda decoder"   — pick a lambda recipe and see the four equivalents
 *                                side-by-side: named def, comprehension, operator.*,
 *                                functools.partial. A verdict pill calls out which
 *                                form a senior reviewer would prefer.
 *   Mode 2  "Pipeline lab"     — pick a filter and a map. Watch the whole list flow
 *                                through both stages at once: rejected items struck
 *                                out, transformed values lit. (Different from
 *                                IteratorEngine, which animates one tick at a time —
 *                                this view shows the *function applied to the
 *                                whole list*, the way `[fn(x) for x in xs]` reads.)
 *   Mode 3  "Fold animation"   — pick a binary reducer and an initial value, then
 *                                step through `acc = fn(acc, x)` one frame at a
 *                                time with the running tape of all past
 *                                accumulators. Includes the empty-iterable trap.
 *
 * Scope: py-c4 — Lambda, Map, Filter, Reduce. Distinct visual language from
 * BranchRouter, IteratorEngine, and ArgumentBinder.
 */

// ──────────────────────────────────────────────────────────────
// Mode 1 — Lambda decoder.
// ──────────────────────────────────────────────────────────────

const LAMBDA_RECIPES = [
  {
    id: "key_revenue",
    title: "extract a dict field for sorting",
    lambda: 'lambda r: r["revenue"]',
    context: 'sorted(rows, key=…)',
    equivs: [
      { kind: "def",   code: 'def get_revenue(r):\n    return r["revenue"]', verdict: "ok" },
      { kind: "comp",  code: "n/a — not a list-shape transform; this is a key extractor",  verdict: "n/a" },
      { kind: "op",    code: 'operator.itemgetter("revenue")',  verdict: "best" },
      { kind: "part",  code: "n/a — partial fixes args; doesn't index", verdict: "n/a" },
    ],
    note: "key extraction is the canonical itemgetter use case — shorter, faster (C), nicer in tracebacks.",
    senior: 'sorted(rows, key=operator.itemgetter("revenue"))',
  },
  {
    id: "key_attr",
    title: "sort by an attribute",
    lambda: "lambda u: u.last_name",
    context: "sorted(users, key=…)",
    equivs: [
      { kind: "def",   code: "def last_name(u):\n    return u.last_name", verdict: "ok" },
      { kind: "comp",  code: "n/a — not a list-shape transform",  verdict: "n/a" },
      { kind: "op",    code: 'operator.attrgetter("last_name")',  verdict: "best" },
      { kind: "part",  code: "n/a — attrgetter does the dotted walk", verdict: "n/a" },
    ],
    note: "attrgetter even walks dotted paths: attrgetter('user.id') = lambda x: x.user.id.",
    senior: 'sorted(users, key=operator.attrgetter("last_name", "first_name"))',
  },
  {
    id: "transform_upper",
    title: "uppercase every name",
    lambda: "lambda s: s.upper()",
    context: "map(…, names)",
    equivs: [
      { kind: "def",   code: "def upper(s):\n    return s.upper()", verdict: "ok" },
      { kind: "comp",  code: "[s.upper() for s in names]", verdict: "best" },
      { kind: "op",    code: 'operator.methodcaller("upper")', verdict: "ok" },
      { kind: "part",  code: "n/a — no positional arg to fix", verdict: "n/a" },
    ],
    note: "since str.upper is a bound method, list(map(str.upper, names)) is also fine — but the comprehension reads top-to-bottom.",
    senior: "[s.upper() for s in names]",
  },
  {
    id: "predicate_pos",
    title: "keep positive numbers",
    lambda: "lambda x: x > 0",
    context: "filter(…, xs)",
    equivs: [
      { kind: "def",   code: "def is_positive(x):\n    return x > 0", verdict: "ok" },
      { kind: "comp",  code: "[x for x in xs if x > 0]", verdict: "best" },
      { kind: "op",    code: "n/a — no operator for 'compare to 0'", verdict: "n/a" },
      { kind: "part",  code: "partial(operator.lt, 0)  # 0 < x", verdict: "ok" },
    ],
    note: "comprehension wins on readability; the partial form is clever but less obvious.",
    senior: "[x for x in xs if x > 0]",
  },
  {
    id: "binop_add",
    title: "elementwise add two columns",
    lambda: "lambda a, b: a + b",
    context: "map(…, xs, ys)",
    equivs: [
      { kind: "def",   code: "def add(a, b):\n    return a + b", verdict: "ok" },
      { kind: "comp",  code: "[a + b for a, b in zip(xs, ys, strict=True)]", verdict: "best" },
      { kind: "op",    code: "operator.add", verdict: "best" },
      { kind: "part",  code: "n/a — both args vary", verdict: "n/a" },
    ],
    note: "tie between operator.add and the comprehension; both beat the lambda.",
    senior: "list(map(operator.add, xs, ys))",
  },
  {
    id: "partial_double",
    title: "double every value",
    lambda: "lambda x: x * 2",
    context: "map(…, xs)",
    equivs: [
      { kind: "def",   code: "def double(x):\n    return x * 2", verdict: "ok" },
      { kind: "comp",  code: "[x * 2 for x in xs]", verdict: "best" },
      { kind: "op",    code: "n/a — no zero-arg operator for *2", verdict: "n/a" },
      { kind: "part",  code: "partial(operator.mul, 2)", verdict: "ok" },
    ],
    note: "partial is the right tool when fixing a constant arg of a binary op.",
    senior: "[x * 2 for x in xs]",
  },
];

const VERDICT_META = {
  best: { label: "preferred", color: DS.grn,  bg: "rgba(52,211,153,0.10)", border: "rgba(52,211,153,0.35)" },
  ok:   { label: "acceptable", color: "#FCD34D", bg: "rgba(252,211,77,0.08)", border: "rgba(252,211,77,0.30)" },
  "n/a":{ label: "not applicable", color: DS.dim, bg: "rgba(255,255,255,0.015)", border: DS.border },
};

const KIND_LABELS = {
  def:  "named def",
  comp: "comprehension",
  op:   "operator.*",
  part: "functools.partial",
};

function LambdaDecoderMode() {
  const [recipeId, setRecipeId] = useState("key_revenue");
  const recipe = LAMBDA_RECIPES.find((r) => r.id === recipeId);

  return (
    <div>
      <SectionFrame title="LAMBDA RECIPE · pick a use case">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
          {LAMBDA_RECIPES.map((r) => (
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
                textAlign: "left",
              }}
            >
              {r.title}
            </button>
          ))}
        </div>
      </SectionFrame>

      <SectionFrame title="THE LAMBDA · what you'd write first" tone="neutral">
        <pre style={{ ...codeStyle, marginTop: 6 }}>
{`# context: ${recipe.context}
${recipe.lambda}`}
        </pre>
      </SectionFrame>

      <SectionFrame title="FOUR EQUIVALENT FORMS · pick the one a senior reviewer would">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10 }}>
          {recipe.equivs.map((e) => (
            <EquivCard key={e.kind} equiv={e} />
          ))}
        </div>
      </SectionFrame>

      <SectionFrame title="SENIOR-CODE-REVIEW VERSION" tone="ok">
        <pre style={{ ...codeStyle, marginTop: 6 }}>{recipe.senior}</pre>
        <div style={{ marginTop: 10, fontSize: 11, color: DS.dim, fontFamily: "var(--ds-mono), monospace", lineHeight: 1.6 }}>
          # {recipe.note}
        </div>
      </SectionFrame>
    </div>
  );
}

function EquivCard({ equiv }) {
  const meta = VERDICT_META[equiv.verdict];
  return (
    <div
      style={{
        padding: "10px 12px",
        borderRadius: 12,
        border: `1px solid ${meta.border}`,
        background: meta.bg,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontSize: 9, letterSpacing: 1.4, color: DS.dim, fontFamily: "var(--ds-mono), monospace", fontWeight: 700 }}>
          {KIND_LABELS[equiv.kind]}
        </span>
        <span
          style={{
            fontSize: 9,
            padding: "3px 8px",
            borderRadius: 999,
            background: `${meta.color}1e`,
            color: meta.color,
            fontFamily: "var(--ds-mono), monospace",
            fontWeight: 700,
            border: `1px solid ${meta.color}40`,
            letterSpacing: 0.5,
          }}
        >
          {meta.label}
        </span>
      </div>
      <pre style={{ ...codeStyle, padding: "8px 10px", fontSize: 11, opacity: equiv.verdict === "n/a" ? 0.65 : 1 }}>
        {equiv.code}
      </pre>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Mode 2 — Pipeline lab (filter → map applied to whole list).
// ──────────────────────────────────────────────────────────────

const PIPELINE_SOURCE = [-3, 1, 4, -1, 5, 9, -2, 6, 5, 3, -5, 8];

const FILTERS = [
  { id: "all",  label: "(no filter)",     py: "lambda x: True", test: () => true,  doc: "passes everything" },
  { id: "pos",  label: "x > 0",           py: "lambda x: x > 0", test: (x) => x > 0, doc: "drop non-positive" },
  { id: "even", label: "x % 2 == 0",      py: "lambda x: x % 2 == 0", test: (x) => x % 2 === 0, doc: "even only" },
  { id: "abs3", label: "abs(x) >= 3",     py: "lambda x: abs(x) >= 3", test: (x) => Math.abs(x) >= 3, doc: "magnitude ≥ 3" },
];

const MAPS = [
  { id: "id",   label: "x",     py: "lambda x: x", apply: (x) => x, doc: "identity" },
  { id: "sq",   label: "x*x",   py: "lambda x: x * x", apply: (x) => x * x, doc: "square" },
  { id: "abs",  label: "abs(x)", py: "abs", apply: (x) => Math.abs(x), doc: "magnitude" },
  { id: "neg",  label: "-x",    py: "operator.neg", apply: (x) => -x, doc: "negate" },
];

function PipelineLabMode() {
  const [fid, setFid] = useState("pos");
  const [mid, setMid] = useState("sq");
  const f = FILTERS.find((x) => x.id === fid);
  const m = MAPS.find((x) => x.id === mid);

  const stages = useMemo(() => {
    return PIPELINE_SOURCE.map((x) => {
      const passed = f.test(x);
      return { x, passed, mapped: passed ? m.apply(x) : null };
    });
  }, [f, m]);

  const kept = stages.filter((s) => s.passed);
  const dropped = stages.filter((s) => !s.passed);

  const compForm = `[${m.py.replace("lambda x: ", "").replace(/^abs$/, "abs(x)").replace(/^operator\.neg$/, "-x")} for x in source if ${f.py.replace("lambda x: ", "")}]`.replace("if True", "").replace("  ", " ").trim();
  const mapFilterForm = `list(map(${m.py}, filter(${f.py}, source)))`;

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
        <StagePicker
          label="STAGE 1 · filter (predicate)"
          options={FILTERS}
          valueId={fid}
          onChange={setFid}
          accent="#FCA5A5"
        />
        <StagePicker
          label="STAGE 2 · map (transform)"
          options={MAPS}
          valueId={mid}
          onChange={setMid}
          accent="#7DD3FC"
        />
      </div>

      <SectionFrame title="TWO EQUIVALENT WRITINGS · same logic, different idiom" tone="neutral">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 8 }}>
          <div style={{ padding: "10px 12px", borderRadius: 10, border: `1px solid rgba(52,211,153,0.30)`, background: "rgba(52,211,153,0.05)" }}>
            <div style={{ fontSize: 9, letterSpacing: 1.4, color: DS.grn, fontWeight: 700, marginBottom: 6, fontFamily: "var(--ds-mono), monospace" }}>
              COMPREHENSION · preferred
            </div>
            <pre style={{ ...codeStyle, padding: "8px 10px" }}>{compForm}</pre>
          </div>
          <div style={{ padding: "10px 12px", borderRadius: 10, border: `1px solid ${DS.border}`, background: "rgba(255,255,255,0.015)" }}>
            <div style={{ fontSize: 9, letterSpacing: 1.4, color: DS.dim, fontWeight: 700, marginBottom: 6, fontFamily: "var(--ds-mono), monospace" }}>
              MAP/FILTER · also valid
            </div>
            <pre style={{ ...codeStyle, padding: "8px 10px" }}>{mapFilterForm}</pre>
          </div>
        </div>
      </SectionFrame>

      <SectionFrame title="SOURCE · 12 ints" tone="neutral">
        <Tape items={PIPELINE_SOURCE} renderCell={(x) => ({ label: String(x), state: "pending" })} />
      </SectionFrame>

      <SectionFrame title={`AFTER FILTER · ${f.py}  (${dropped.length} dropped)`}>
        <Tape
          items={stages}
          renderCell={(s) => ({
            label: String(s.x),
            state: s.passed ? "kept" : "dropped",
          })}
        />
      </SectionFrame>

      <SectionFrame title={`AFTER MAP · ${m.py}  (${kept.length} transformed)`}>
        <Tape
          items={stages}
          renderCell={(s) => ({
            label: s.passed ? String(s.mapped) : "·",
            state: s.passed ? "mapped" : "skipped",
          })}
        />
      </SectionFrame>

      <SectionFrame title="OUTPUT · final list" tone="ok">
        <Tape
          items={kept}
          renderCell={(s) => ({ label: String(s.mapped), state: "yielded" })}
        />
        <div style={{ marginTop: 10, fontFamily: "var(--ds-mono), monospace", fontSize: 11, color: DS.t3 }}>
          length · <span style={{ color: DS.t1, fontWeight: 700 }}>{kept.length}</span>
          {"   "}sum · <span style={{ color: DS.t1, fontWeight: 700 }}>{kept.reduce((a, b) => a + b.mapped, 0)}</span>
          {"   "}max · <span style={{ color: DS.t1, fontWeight: 700 }}>{kept.length ? Math.max(...kept.map((b) => b.mapped)) : "—"}</span>
        </div>
      </SectionFrame>
    </div>
  );
}

function Tape({ items, renderCell }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
      {items.length === 0 ? (
        <span style={{ fontSize: 11, color: DS.dim, fontFamily: "var(--ds-mono), monospace" }}>
          (empty)
        </span>
      ) : (
        items.map((it, i) => {
          const cell = renderCell(it);
          return <CellSlot key={i} label={cell.label} state={cell.state} />;
        })
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Mode 3 — Fold animation.
// ──────────────────────────────────────────────────────────────

const FOLD_ITEMS = [3, 1, 4, 1, 5, 9, 2, 6];

const REDUCERS = [
  {
    id: "sum", label: "sum (acc + x)", py: "lambda a, x: a + x", apply: (a, x) => a + x,
    initials: [{ id: "0",   label: "0",   value: 0 }, { id: "100", label: "100", value: 100 }, { id: "none", label: "(no initial)", value: null }],
    builtin: "sum(items)  # better than reduce(add, items)",
  },
  {
    id: "max", label: "max", py: "lambda a, x: a if a > x else x", apply: (a, x) => (a > x ? a : x),
    initials: [{ id: "0",   label: "0",   value: 0 }, { id: "neg", label: "-inf", value: -Infinity }, { id: "none", label: "(no initial)", value: null }],
    builtin: "max(items)  # built-in beats any reduce form",
  },
  {
    id: "prod", label: "product (acc * x)", py: "lambda a, x: a * x", apply: (a, x) => a * x,
    initials: [{ id: "1", label: "1", value: 1 }, { id: "2", label: "2", value: 2 }, { id: "none", label: "(no initial)", value: null }],
    builtin: "math.prod(items)  # added in 3.8",
  },
  {
    id: "concat", label: "list-append (a + [x])  [O(n²) trap]", py: "lambda a, x: a + [x]", apply: (a, x) => [...a, x],
    initials: [{ id: "[]", label: "[]", value: [] }],
    builtin: "list(items)  # or [x for x in items]  — never reduce",
  },
];

function reduceTrace({ items, initial, fn }) {
  const events = [];
  let acc;
  let start = 0;
  if (initial === null || initial === undefined) {
    if (items.length === 0) {
      return { events: [], error: "TypeError: reduce() of empty iterable with no initial value", finalAcc: undefined };
    }
    acc = items[0];
    events.push({ step: 0, x: items[0], beforeAcc: undefined, afterAcc: acc, sourcedFromFirst: true });
    start = 1;
  } else {
    acc = initial;
    events.push({ step: 0, x: undefined, beforeAcc: undefined, afterAcc: acc, sourcedFromInitial: true });
    start = 0;
  }
  for (let i = start; i < items.length; i++) {
    const x = items[i];
    const before = acc;
    acc = fn(acc, x);
    events.push({ step: events.length, x, beforeAcc: before, afterAcc: acc });
  }
  return { events, error: null, finalAcc: acc };
}

function FoldAnimationMode() {
  const [reducerId, setReducerId] = useState("sum");
  const [initialId, setInitialId] = useState("0");
  const [emptyMode, setEmptyMode] = useState(false);
  const [tick, setTick] = useState(0);

  const reducer = REDUCERS.find((r) => r.id === reducerId);
  const initialOpt = reducer.initials.find((i) => i.id === initialId) ?? reducer.initials[0];

  const items = emptyMode ? [] : FOLD_ITEMS;
  const trace = useMemo(
    () => reduceTrace({ items, initial: initialOpt.value, fn: reducer.apply }),
    [items, initialOpt, reducer],
  );

  // Reset tick when configuration changes
  function reconfigure(updater) {
    setTick(0);
    updater();
  }

  const visible = trace.events.slice(0, tick);
  const current = visible[visible.length - 1] ?? null;
  const finished = !trace.error && tick >= trace.events.length;

  return (
    <div>
      <SectionFrame title="REDUCER · pick a binary fn">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
          {REDUCERS.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => reconfigure(() => {
                setReducerId(r.id);
                setInitialId(r.initials[0].id);
              })}
              style={{
                padding: "6px 10px",
                borderRadius: 8,
                border: `1px solid ${reducerId === r.id ? DS.ind : DS.border}`,
                background: reducerId === r.id ? `${DS.ind}1e` : "rgba(255,255,255,0.02)",
                color: reducerId === r.id ? DS.t1 : DS.t2,
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
      </SectionFrame>

      <SectionFrame title="INITIAL VALUE">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
          {reducer.initials.map((i) => (
            <button
              key={i.id}
              type="button"
              onClick={() => reconfigure(() => setInitialId(i.id))}
              style={{
                padding: "6px 10px",
                borderRadius: 8,
                border: `1px solid ${initialId === i.id ? "#FCD34D" : DS.border}`,
                background: initialId === i.id ? "rgba(252,211,77,0.10)" : "rgba(255,255,255,0.02)",
                color: initialId === i.id ? "#FCD34D" : DS.t3,
                fontSize: 11,
                fontFamily: "var(--ds-mono), monospace",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {i.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => reconfigure(() => setEmptyMode((e) => !e))}
            style={{
              padding: "6px 10px",
              borderRadius: 8,
              border: `1px solid ${emptyMode ? "rgba(248,113,113,0.5)" : DS.border}`,
              background: emptyMode ? "rgba(248,113,113,0.10)" : "rgba(255,255,255,0.02)",
              color: emptyMode ? "#FCA5A5" : DS.dim,
              fontSize: 11,
              fontFamily: "var(--ds-mono), monospace",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {emptyMode ? "▣  empty input" : "▢  empty input"}
          </button>
        </div>
      </SectionFrame>

      <SectionFrame title="CALL" tone="neutral">
        <pre style={{ ...codeStyle, marginTop: 6 }}>
{`from functools import reduce

reduce(${reducer.py}, ${emptyMode ? "[]" : `[${FOLD_ITEMS.join(", ")}]`}${initialOpt.value === null ? "" : `, ${formatVal(initialOpt.value)}`})`}
        </pre>
        <div style={{ marginTop: 8, fontSize: 11, color: DS.t3, fontFamily: "var(--ds-mono), monospace" }}>
          # senior-pythonic version: <span style={{ color: DS.t1 }}>{reducer.builtin}</span>
        </div>
      </SectionFrame>

      <SectionFrame title="ITEMS · fold tape">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
          {items.length === 0 ? (
            <span style={{ fontSize: 11, color: DS.dim, fontFamily: "var(--ds-mono), monospace" }}>
              (empty)
            </span>
          ) : (
            items.map((x, i) => {
              const ev = visible.find((e) => !e.sourcedFromInitial && e.step === (initialOpt.value === null ? i : i + 1));
              const consumed = !!ev;
              const cursor = !ev && tick > 0 && i === (initialOpt.value === null ? tick : tick - 1);
              return (
                <CellSlot
                  key={i}
                  label={String(x)}
                  state={consumed ? "consumed" : cursor ? "cursor" : "pending"}
                />
              );
            })
          )}
        </div>
      </SectionFrame>

      <SectionFrame title="ACCUMULATOR · running fold" tone={trace.error ? "danger" : current ? "ok" : "neutral"}>
        {trace.error ? (
          <div style={{ marginTop: 8, fontFamily: "var(--ds-mono), monospace", fontSize: 12, color: "#FCA5A5", lineHeight: 1.7 }}>
            {trace.error}
          </div>
        ) : (
          <div style={{ marginTop: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 10, background: "rgba(2,6,23,0.5)", border: `1px solid ${DS.border}` }}>
              <span style={{ fontSize: 9, letterSpacing: 1.4, color: DS.dim, fontFamily: "var(--ds-mono), monospace", fontWeight: 700 }}>
                acc
              </span>
              <span style={{ fontSize: 22, fontWeight: 800, color: current ? DS.grn : DS.dim, fontFamily: "var(--ds-mono), monospace" }}>
                {current ? formatVal(current.afterAcc) : "—"}
              </span>
              {current && current.x !== undefined && (
                <span style={{ fontFamily: "var(--ds-mono), monospace", fontSize: 11, color: DS.t3 }}>
                  ← {reducer.py.replace("lambda a, x: ", "fn(")}{")"} where a={formatVal(current.beforeAcc)}, x={formatVal(current.x)}
                </span>
              )}
              {current && current.sourcedFromInitial && (
                <span style={{ fontFamily: "var(--ds-mono), monospace", fontSize: 11, color: DS.dim }}>
                  ← seeded from initial
                </span>
              )}
              {current && current.sourcedFromFirst && (
                <span style={{ fontFamily: "var(--ds-mono), monospace", fontSize: 11, color: DS.dim }}>
                  ← seeded from items[0] (no initial)
                </span>
              )}
            </div>
            {visible.length > 1 && (
              <div style={{ marginTop: 10 }}>
                <SectionLabel>HISTORY · all past acc values</SectionLabel>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
                  {visible.map((ev, i) => (
                    <CellSlot key={i} label={formatVal(ev.afterAcc)} state={i === visible.length - 1 ? "yielded" : "consumed"} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </SectionFrame>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <ActionButton
          label={trace.error ? "(no events to step)" : finished ? "fold complete" : "step  ·  acc = fn(acc, x)"}
          tone={trace.error ? "danger" : finished ? "ghost" : "primary"}
          onClick={() => !trace.error && !finished && setTick((t) => t + 1)}
        />
        <ActionButton label="reset" tone="ghost" onClick={() => setTick(0)} />
        <ActionButton label="run to end" tone="ghost" onClick={() => !trace.error && setTick(trace.events.length)} />
      </div>

      {finished && !trace.error && (
        <div style={{ marginTop: 14, padding: "12px 14px", borderRadius: 12, border: `1px solid rgba(52,211,153,0.30)`, background: "rgba(52,211,153,0.06)", fontFamily: "var(--ds-mono), monospace", fontSize: 12, color: DS.t2 }}>
          <div style={{ fontSize: 9, letterSpacing: 1.4, color: DS.grn, fontWeight: 700, marginBottom: 6 }}>FINAL VALUE</div>
          reduce(...) → <span style={{ color: DS.grn, fontWeight: 700 }}>{formatVal(trace.finalAcc)}</span>
        </div>
      )}
    </div>
  );
}

function formatVal(v) {
  if (v === null || v === undefined) return "—";
  if (Array.isArray(v)) return `[${v.join(", ")}]`;
  if (v === Infinity) return "inf";
  if (v === -Infinity) return "-inf";
  return String(v);
}

// ──────────────────────────────────────────────────────────────
// Pieces.
// ──────────────────────────────────────────────────────────────

function CellSlot({ label, state }) {
  const palette = {
    pending:      { bg: "rgba(255,255,255,0.02)", border: DS.border,                   color: DS.dim },
    cursor:       { bg: "rgba(99,102,241,0.18)",  border: DS.ind,                      color: DS.t1 },
    consumed:     { bg: "rgba(255,255,255,0.04)", border: DS.border,                   color: DS.t3 },
    kept:         { bg: "rgba(52,211,153,0.12)",  border: "rgba(52,211,153,0.40)",     color: DS.t1 },
    dropped:      { bg: "rgba(248,113,113,0.10)", border: "rgba(248,113,113,0.35)",    color: "#FCA5A5", strike: true },
    mapped:       { bg: "rgba(125,211,252,0.12)", border: "rgba(125,211,252,0.40)",    color: "#7DD3FC" },
    skipped:      { bg: "rgba(255,255,255,0.015)",border: DS.border,                   color: DS.dim },
    yielded:      { bg: "rgba(252,211,77,0.14)",  border: "rgba(252,211,77,0.45)",     color: "#FDE68A" },
  }[state] ?? { bg: "rgba(255,255,255,0.02)", border: DS.border, color: DS.t3 };
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth: 36,
        height: 32,
        padding: "0 10px",
        borderRadius: 8,
        border: `1px solid ${palette.border}`,
        background: palette.bg,
        color: palette.color,
        fontFamily: "var(--ds-mono), monospace",
        fontSize: 12,
        fontWeight: state === "kept" || state === "yielded" || state === "cursor" ? 700 : 500,
        textDecoration: palette.strike ? "line-through" : "none",
      }}
    >
      {label}
    </span>
  );
}

function StagePicker({ label, options, valueId, onChange, accent }) {
  return (
    <div
      style={{
        padding: "10px 12px",
        borderRadius: 12,
        border: `1px solid ${accent}30`,
        background: "rgba(255,255,255,0.015)",
      }}
    >
      <div style={{ fontSize: 9, letterSpacing: 1.4, color: accent, fontFamily: "var(--ds-mono), monospace", fontWeight: 700 }}>
        {label}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 8 }}>
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => onChange(o.id)}
            style={{
              padding: "5px 8px",
              borderRadius: 7,
              border: `1px solid ${valueId === o.id ? accent : DS.border}`,
              background: valueId === o.id ? `${accent}1c` : "rgba(255,255,255,0.02)",
              color: valueId === o.id ? DS.t1 : DS.t3,
              fontSize: 10,
              fontFamily: "var(--ds-mono), monospace",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {o.label}
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

function SectionLabel({ children }) {
  return (
    <div style={{ fontSize: 9, letterSpacing: 1.4, color: DS.dim, fontFamily: "var(--ds-mono), monospace", fontWeight: 700 }}>
      {children}
    </div>
  );
}

function ActionButton({ label, onClick, tone }) {
  const palette = {
    primary: { bg: "rgba(99,102,241,0.18)", border: `${DS.ind}66`, color: DS.t1 },
    ghost:   { bg: "rgba(255,255,255,0.02)", border: DS.border,    color: DS.t2 },
    danger:  { bg: "rgba(248,113,113,0.10)", border: "rgba(248,113,113,0.30)", color: "#FCA5A5" },
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

export default function FoldMachine() {
  const [mode, setMode] = useState("decoder");
  return (
    <div style={{ fontFamily: "var(--ds-sans), sans-serif" }}>
      <div style={{ fontSize: 17, fontWeight: 700, color: DS.t1, marginBottom: 4 }}>
        The fold machine
      </div>
      <p style={{ fontSize: 12, color: DS.t3, fontFamily: "var(--ds-mono), monospace", lineHeight: 1.6, marginBottom: 14 }}>
        Three primitives: <span style={{ color: DS.t1 }}>map</span> · <span style={{ color: DS.t1 }}>filter</span> · <span style={{ color: DS.t1 }}>reduce</span>.
        Decode <span style={{ color: "#FCD34D" }}>lambda</span>s into senior alternatives, watch a pipeline, then step a fold by hand.
      </p>

      <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
        <ModeTab active={mode === "decoder"}  onClick={() => setMode("decoder")}  label="1 · lambda decoder"   hint="lambda → def / comp / operator / partial" />
        <ModeTab active={mode === "pipeline"} onClick={() => setMode("pipeline")} label="2 · pipeline lab"     hint="filter → map applied to a list" />
        <ModeTab active={mode === "fold"}     onClick={() => setMode("fold")}     label="3 · fold animation"   hint="reduce(fn, items, init) step by step" />
      </div>

      {mode === "decoder"  && <LambdaDecoderMode />}
      {mode === "pipeline" && <PipelineLabMode />}
      {mode === "fold"     && <FoldAnimationMode />}
    </div>
  );
}
