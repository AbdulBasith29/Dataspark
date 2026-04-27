import { useMemo, useState } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

/**
 * TracebackTheater — visualizes Python error handling and traceback shape.
 *
 *   Mode 1  "Try/Except Router"     — pick what happens inside the try block
 *                                     (raise ValueError | raise KeyError |
 *                                      return early | no error |
 *                                      raise inside except). Pick an except
 *                                     chain. The visualization highlights
 *                                     EXACTLY which clauses run, in order, and
 *                                     shows the final outcome (return value,
 *                                     uncaught exception, or successful exit).
 *
 *   Mode 2  "Hierarchy Match"       — pick a raised exception class from the
 *                                     built-in tree. Pick a chain of `except`
 *                                     clauses. The viz walks the chain
 *                                     top-down using `isinstance` and
 *                                     highlights the FIRST match (or "dead
 *                                     code" warning if a subclass is unreachable
 *                                     because a parent caught it first).
 *
 *   Mode 3  "Traceback Reader"      — toggle three raise modes:
 *                                       (a) raise NewError() from e
 *                                       (b) raise NewError() (during except)
 *                                       (c) raise NewError() from None
 *                                     Each renders a real-shaped Python
 *                                     traceback with the boilerplate strings
 *                                     ('direct cause of' vs 'during handling
 *                                     of' vs nothing) annotated and the
 *                                     bottom-most line called out as THE error.
 *
 * Scope: py-c5 — Error Handling & Debugging. Visual language is the Python
 * REPL traceback (red/dim mono blocks) plus a stacked-clauses ladder. Distinct
 * from BranchRouter (which animates `if/elif/else`), IteratorEngine (lazy flow),
 * ArgumentBinder (parameter binding), and FoldMachine (reduce computation).
 */

// ──────────────────────────────────────────────────────────────
// Mode 1 — Try/Except Router.
// ──────────────────────────────────────────────────────────────

const TRY_ACTIONS = [
  { id: "ok",       label: "no error",                    py: "x = int('42')",                  raises: null,            returns: null },
  { id: "value",    label: "raise ValueError",            py: "x = int('old')",                 raises: "ValueError",    returns: null },
  { id: "key",      label: "raise KeyError",              py: "x = row['age']",                 raises: "KeyError",      returns: null },
  { id: "io",       label: "raise FileNotFoundError",     py: "f = open('missing')",            raises: "FileNotFoundError", returns: null },
  { id: "ret",      label: "return early",                py: "return 'fast-path'",             raises: null,            returns: "'fast-path'" },
  { id: "boom",     label: "raise inside except",         py: "x = int('old')",                 raises: "ValueError",    returns: null,
    note: "...and the matching except handler itself raises a new error." },
];

const EXCEPT_CHAINS = [
  {
    id: "value_only",
    label: "except ValueError",
    clauses: [{ types: ["ValueError"], action: "log + handled" }],
    handlerRaises: false,
  },
  {
    id: "value_key",
    label: "except (ValueError, KeyError)",
    clauses: [{ types: ["ValueError", "KeyError"], action: "log + handled" }],
    handlerRaises: false,
  },
  {
    id: "narrow_then_broad",
    label: "except FNF → except OSError → except Exception",
    clauses: [
      { types: ["FileNotFoundError"], action: "treat as missing" },
      { types: ["OSError"],            action: "log io error" },
      { types: ["Exception"],          action: "log + bail" },
    ],
    handlerRaises: false,
  },
  {
    id: "wrong_order",
    label: "except OSError → except FileNotFoundError  ⚠ unreachable",
    clauses: [
      { types: ["OSError"],            action: "log io error" },
      { types: ["FileNotFoundError"],  action: "treat as missing", dead: true },
    ],
    handlerRaises: false,
  },
  {
    id: "broad",
    label: "except Exception   (anti-pattern in most cases)",
    clauses: [{ types: ["Exception"], action: "swallow + warn" }],
    handlerRaises: false,
  },
  {
    id: "raise_in_handler",
    label: "except ValueError → re-raise as InvalidConfig from e",
    clauses: [{ types: ["ValueError"], action: "raise InvalidConfig from e" }],
    handlerRaises: "InvalidConfig",
  },
];

// Built-in exception subclass relations we visualize. Lighter than CPython's
// real tree but matches the lesson.
const EXCEPTION_TREE = {
  BaseException: { parent: null },
  SystemExit: { parent: "BaseException" },
  KeyboardInterrupt: { parent: "BaseException" },
  GeneratorExit: { parent: "BaseException" },
  Exception: { parent: "BaseException" },
  ArithmeticError: { parent: "Exception" },
  ZeroDivisionError: { parent: "ArithmeticError" },
  LookupError: { parent: "Exception" },
  KeyError: { parent: "LookupError" },
  IndexError: { parent: "LookupError" },
  OSError: { parent: "Exception" },
  FileNotFoundError: { parent: "OSError" },
  PermissionError: { parent: "OSError" },
  ValueError: { parent: "Exception" },
  TypeError: { parent: "Exception" },
  RuntimeError: { parent: "Exception" },
  StopIteration: { parent: "Exception" },
  AttributeError: { parent: "Exception" },
  InvalidConfig: { parent: "Exception" },
};

function isSubclass(child, parent) {
  let cur = child;
  while (cur) {
    if (cur === parent) return true;
    cur = EXCEPTION_TREE[cur]?.parent ?? null;
  }
  return false;
}

function matchesAny(raised, types) {
  return types.some((t) => isSubclass(raised, t));
}

function simulateTry({ action, chain }) {
  const events = [];
  const tryAction = TRY_ACTIONS.find((a) => a.id === action);
  const chainSpec = EXCEPT_CHAINS.find((c) => c.id === chain);

  events.push({ kind: "try-enter", code: tryAction.py });

  if (tryAction.returns) {
    events.push({ kind: "try-return", value: tryAction.returns });
    events.push({ kind: "finally", note: "always runs — even on return" });
    return { events, outcome: "return", returnValue: tryAction.returns };
  }

  if (!tryAction.raises) {
    events.push({ kind: "try-success" });
    events.push({ kind: "else", note: "runs only after a successful try" });
    events.push({ kind: "finally", note: "always runs" });
    return { events, outcome: "success" };
  }

  events.push({ kind: "try-raise", exc: tryAction.raises });

  let matchedClauseIdx = -1;
  for (let i = 0; i < chainSpec.clauses.length; i++) {
    const c = chainSpec.clauses[i];
    const matched = matchesAny(tryAction.raises, c.types);
    events.push({
      kind: "except-test",
      idx: i,
      types: c.types,
      matched,
      dead: c.dead,
    });
    if (matched) {
      matchedClauseIdx = i;
      break;
    }
  }

  if (matchedClauseIdx === -1) {
    events.push({ kind: "no-match", exc: tryAction.raises });
    events.push({ kind: "finally", note: "runs even when nothing matched" });
    events.push({ kind: "uncaught", exc: tryAction.raises });
    return { events, outcome: "uncaught", uncaughtExc: tryAction.raises };
  }

  const matchedClause = chainSpec.clauses[matchedClauseIdx];
  events.push({
    kind: "except-run",
    idx: matchedClauseIdx,
    types: matchedClause.types,
    action: matchedClause.action,
  });

  if (action === "boom" || chainSpec.handlerRaises) {
    const newExc = chainSpec.handlerRaises || "RuntimeError";
    events.push({ kind: "except-raises", exc: newExc, from: tryAction.raises });
    events.push({ kind: "finally", note: "runs even when except itself raised" });
    events.push({ kind: "uncaught", exc: newExc, chainedFrom: tryAction.raises, chainKind: chainSpec.handlerRaises ? "from" : "context" });
    return { events, outcome: "uncaught", uncaughtExc: newExc, chainedFrom: tryAction.raises };
  }

  events.push({ kind: "finally", note: "always runs" });
  return { events, outcome: "handled", handledBy: matchedClauseIdx };
}

function TryRouterMode() {
  const [action, setAction] = useState("value");
  const [chain, setChain] = useState("value_key");

  const sim = useMemo(() => simulateTry({ action, chain }), [action, chain]);
  const chainSpec = EXCEPT_CHAINS.find((c) => c.id === chain);
  const tryAction = TRY_ACTIONS.find((a) => a.id === action);

  // Which clauses light up (matched/tested/dead)?
  const clauseStates = chainSpec.clauses.map((_, i) => {
    const tested = sim.events.find((e) => e.kind === "except-test" && e.idx === i);
    const ran = sim.events.find((e) => e.kind === "except-run" && e.idx === i);
    if (ran) return "matched";
    if (tested?.dead) return "dead";
    if (tested && !tested.matched) return "missed";
    if (tested && tested.matched) return "matched";
    return "untested";
  });

  const ranElse    = sim.events.some((e) => e.kind === "else");
  const ranFinally = sim.events.some((e) => e.kind === "finally");

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
        <SectionFrame title="WHAT HAPPENS INSIDE try" tone="neutral">
          <div style={{ display: "flex", flexDirection: "column", gap: 5, marginTop: 8 }}>
            {TRY_ACTIONS.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => setAction(a.id)}
                style={pickerBtn(action === a.id, "#FCA5A5")}
              >
                <span style={{ color: action === a.id ? DS.t1 : DS.t3 }}>{a.label}</span>
                {a.raises && <span style={{ color: "#FCA5A5", marginLeft: 6, fontSize: 10 }}>· {a.raises}</span>}
                {a.returns && <span style={{ color: DS.grn, marginLeft: 6, fontSize: 10 }}>· returns {a.returns}</span>}
              </button>
            ))}
          </div>
        </SectionFrame>

        <SectionFrame title="EXCEPT CHAIN" tone="neutral">
          <div style={{ display: "flex", flexDirection: "column", gap: 5, marginTop: 8 }}>
            {EXCEPT_CHAINS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setChain(c.id)}
                style={pickerBtn(chain === c.id, DS.ind)}
              >
                {c.label}
              </button>
            ))}
          </div>
        </SectionFrame>
      </div>

      <SectionFrame title="EXECUTION TRACE · clauses run top-to-bottom" tone={sim.outcome === "uncaught" ? "danger" : sim.outcome === "handled" ? "ok" : "neutral"}>
        <div style={{ display: "flex", flexDirection: "column", gap: 0, marginTop: 8 }}>
          <ClauseRow
            label="try:"
            body={tryAction.py + (tryAction.note ? `\n# ${tryAction.note}` : "")}
            state={tryAction.raises ? "raised" : tryAction.returns ? "returned" : "ran"}
            note={tryAction.raises ? `→ raised ${tryAction.raises}` : tryAction.returns ? `→ return ${tryAction.returns}` : "→ completed"}
          />
          {chainSpec.clauses.map((c, i) => {
            const state = clauseStates[i];
            const stateMap = { matched: "ran", missed: "skipped", dead: "dead", untested: "skipped" };
            const noteMap = {
              matched: `→ ${c.action}`,
              missed:  `→ no match (${c.types.join("|")} doesn't catch ${tryAction.raises})`,
              dead:    `→ ⚠ unreachable: parent above already caught it`,
              untested: `→ never reached (try succeeded or earlier clause caught)`,
            };
            return (
              <ClauseRow
                key={i}
                label={`except ${c.types.length === 1 ? c.types[0] : `(${c.types.join(", ")})`}:`}
                body={c.action}
                state={stateMap[state]}
                note={noteMap[state]}
              />
            );
          })}
          <ClauseRow
            label="else:"
            body="success_path()"
            state={ranElse ? "ran" : "skipped"}
            note={ranElse ? "→ try succeeded — runs once, before finally" : "→ skipped (try did not complete cleanly)"}
          />
          <ClauseRow
            label="finally:"
            body="cleanup()"
            state={ranFinally ? "ran" : "skipped"}
            note="→ always runs — even on return, raise, or no-match"
            terminal
          />
        </div>
      </SectionFrame>

      <SectionFrame title="OUTCOME" tone={sim.outcome === "uncaught" ? "danger" : sim.outcome === "handled" || sim.outcome === "success" ? "ok" : "neutral"}>
        <OutcomePanel sim={sim} />
      </SectionFrame>
    </div>
  );
}

function ClauseRow({ label, body, state, note, terminal }) {
  const palette = {
    ran:      { border: "rgba(52,211,153,0.40)",  bg: "rgba(52,211,153,0.08)",  accent: DS.grn,    rune: "✓ ran" },
    raised:   { border: "rgba(248,113,113,0.45)", bg: "rgba(248,113,113,0.07)", accent: "#FCA5A5", rune: "✗ raised" },
    returned: { border: "rgba(252,211,77,0.45)",  bg: "rgba(252,211,77,0.07)",  accent: "#FDE68A", rune: "↵ returned" },
    skipped:  { border: DS.border,                bg: "rgba(255,255,255,0.02)", accent: DS.dim,    rune: "· skipped" },
    dead:     { border: "rgba(248,113,113,0.30)", bg: "rgba(248,113,113,0.04)", accent: "#FCA5A5", rune: "⚠ dead code" },
  }[state] ?? { border: DS.border, bg: "rgba(255,255,255,0.02)", accent: DS.dim, rune: "· skipped" };

  return (
    <div
      style={{
        padding: "10px 12px",
        borderLeft: `3px solid ${palette.accent}`,
        background: palette.bg,
        border: `1px solid ${palette.border}`,
        borderLeftWidth: 3,
        borderRadius: 8,
        marginBottom: terminal ? 0 : 6,
        opacity: state === "skipped" ? 0.55 : 1,
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
        <span style={{ fontFamily: "var(--ds-mono), monospace", fontSize: 12, fontWeight: 700, color: palette.accent, minWidth: 200 }}>
          {label}
        </span>
        <span style={{ fontFamily: "var(--ds-mono), monospace", fontSize: 11, color: DS.t2, flex: 1, whiteSpace: "pre-wrap" }}>
          {body}
        </span>
        <span style={{ fontFamily: "var(--ds-mono), monospace", fontSize: 9, fontWeight: 700, color: palette.accent, letterSpacing: 0.8 }}>
          {palette.rune}
        </span>
      </div>
      <div style={{ marginTop: 4, marginLeft: 12, fontFamily: "var(--ds-mono), monospace", fontSize: 10, color: DS.t3 }}>
        {note}
      </div>
    </div>
  );
}

function OutcomePanel({ sim }) {
  if (sim.outcome === "success") {
    return (
      <div style={{ marginTop: 8, fontFamily: "var(--ds-mono), monospace", fontSize: 12, color: DS.grn }}>
        try block completed without raising. <span style={{ color: DS.t2 }}>else</span> ran. <span style={{ color: DS.t2 }}>finally</span> ran. Function returns normally.
      </div>
    );
  }
  if (sim.outcome === "return") {
    return (
      <div style={{ marginTop: 8, fontFamily: "var(--ds-mono), monospace", fontSize: 12, color: "#FDE68A" }}>
        try block returned <span style={{ color: DS.t1, fontWeight: 700 }}>{sim.returnValue}</span>. <span style={{ color: DS.t2 }}>finally</span> still ran. <span style={{ color: DS.t3 }}>else</span> did not (no successful fall-through).
      </div>
    );
  }
  if (sim.outcome === "handled") {
    return (
      <div style={{ marginTop: 8, fontFamily: "var(--ds-mono), monospace", fontSize: 12, color: DS.grn }}>
        exception handled by <span style={{ color: DS.t1, fontWeight: 700 }}>except clause #{sim.handledBy + 1}</span>. <span style={{ color: DS.t2 }}>finally</span> ran. Function returns normally.
      </div>
    );
  }
  return (
    <div style={{ marginTop: 8 }}>
      <pre
        style={{
          fontFamily: "var(--ds-mono), monospace",
          fontSize: 11,
          lineHeight: 1.6,
          color: "#FCA5A5",
          background: "rgba(2,6,23,0.65)",
          padding: "10px 12px",
          borderRadius: 10,
          border: "1px solid rgba(248,113,113,0.30)",
          whiteSpace: "pre-wrap",
          margin: 0,
        }}
      >
{sim.chainedFrom
  ? `Traceback (most recent call last):
  File "demo.py", line N, in caller
${"    "}<your call>
${sim.uncaughtExc}: ${exampleMsg(sim.uncaughtExc)}

${sim.chainKind === "from"
  ? "The above exception was the direct cause of the following exception:"
  : "During handling of the above exception, another exception occurred:"}

  File "demo.py", line N, in handler
${"    "}<re-raise>
${sim.uncaughtExc}: wrapped`
  : `Traceback (most recent call last):
  File "demo.py", line N, in caller
${"    "}<your call>
${sim.uncaughtExc}: ${exampleMsg(sim.uncaughtExc)}`}
      </pre>
      <div style={{ marginTop: 6, fontFamily: "var(--ds-mono), monospace", fontSize: 10, color: DS.t3 }}>
        no clause matched (or the handler itself raised). exception propagates up the stack.
      </div>
    </div>
  );
}

function exampleMsg(exc) {
  return ({
    ValueError: "invalid literal for int() with base 10: 'old'",
    KeyError: "'age'",
    FileNotFoundError: "[Errno 2] No such file or directory: 'missing'",
    OSError: "[Errno 5] I/O error",
    Exception: "something went wrong",
    InvalidConfig: "could not parse age",
    RuntimeError: "rollback failed",
  })[exc] ?? "...";
}

// ──────────────────────────────────────────────────────────────
// Mode 2 — Hierarchy Match.
// ──────────────────────────────────────────────────────────────

const RAISABLE = [
  "ValueError",
  "KeyError",
  "IndexError",
  "FileNotFoundError",
  "PermissionError",
  "ZeroDivisionError",
  "TypeError",
  "KeyboardInterrupt",
];

const EXCEPT_CATALOG = [
  { id: "ValueError",        label: "except ValueError" },
  { id: "KeyError",          label: "except KeyError" },
  { id: "IndexError",        label: "except IndexError" },
  { id: "LookupError",       label: "except LookupError" },
  { id: "FileNotFoundError", label: "except FileNotFoundError" },
  { id: "OSError",           label: "except OSError" },
  { id: "ZeroDivisionError", label: "except ZeroDivisionError" },
  { id: "ArithmeticError",   label: "except ArithmeticError" },
  { id: "TypeError",         label: "except TypeError" },
  { id: "Exception",         label: "except Exception" },
  { id: "BaseException",     label: "except BaseException  ⚠" },
  { id: "BARE",              label: "except:  (bare ⚠)" },
];

function HierarchyMatchMode() {
  const [raised, setRaised] = useState("FileNotFoundError");
  const [chain, setChain] = useState(["FileNotFoundError", "OSError", "Exception"]);

  const trace = useMemo(() => {
    const out = [];
    let matched = -1;
    for (let i = 0; i < chain.length; i++) {
      const cls = chain[i];
      let isMatch;
      if (cls === "BARE" || cls === "BaseException") {
        isMatch = true;
      } else {
        isMatch = isSubclass(raised, cls);
      }
      out.push({ idx: i, cls, matched: isMatch, dead: matched !== -1 });
      if (isMatch && matched === -1) matched = i;
    }
    return { steps: out, matched };
  }, [raised, chain]);

  function addClause(id) {
    if (chain.length >= 6) return;
    setChain([...chain, id]);
  }
  function removeClause(idx) {
    setChain(chain.filter((_, i) => i !== idx));
  }
  function moveClause(idx, dir) {
    const next = [...chain];
    const tgt = idx + dir;
    if (tgt < 0 || tgt >= next.length) return;
    [next[idx], next[tgt]] = [next[tgt], next[idx]];
    setChain(next);
  }

  return (
    <div>
      <SectionFrame title="RAISED EXCEPTION · pick what gets raised">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
          {RAISABLE.map((cls) => (
            <button
              key={cls}
              type="button"
              onClick={() => setRaised(cls)}
              style={pickerBtn(raised === cls, "#FCA5A5")}
            >
              {cls}
            </button>
          ))}
        </div>
        <div style={{ marginTop: 10, fontFamily: "var(--ds-mono), monospace", fontSize: 10, color: DS.t3 }}>
          ancestry: {ancestryString(raised)}
        </div>
      </SectionFrame>

      <SectionFrame title={`EXCEPT CHAIN · tested top-down with isinstance(raised, cls)`}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
          {chain.map((cls, i) => {
            const step = trace.steps[i];
            return (
              <ChainRow
                key={i}
                idx={i}
                cls={cls}
                step={step}
                onUp={() => moveClause(i, -1)}
                onDown={() => moveClause(i, +1)}
                onRemove={() => removeClause(i)}
                isLast={i === chain.length - 1}
                isFirst={i === 0}
              />
            );
          })}
          {chain.length === 0 && (
            <div style={{ fontSize: 11, color: DS.dim, fontFamily: "var(--ds-mono), monospace" }}>
              (no except clauses — every exception will propagate uncaught)
            </div>
          )}
        </div>
        <div style={{ marginTop: 10 }}>
          <SectionLabel>ADD CLAUSE</SectionLabel>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 6 }}>
            {EXCEPT_CATALOG.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => addClause(c.id)}
                disabled={chain.length >= 6}
                style={{
                  padding: "5px 9px",
                  borderRadius: 7,
                  border: `1px solid ${DS.border}`,
                  background: "rgba(255,255,255,0.02)",
                  color: chain.length >= 6 ? DS.dim : DS.t3,
                  fontSize: 10,
                  fontFamily: "var(--ds-mono), monospace",
                  fontWeight: 600,
                  cursor: chain.length >= 6 ? "not-allowed" : "pointer",
                }}
              >
                + {c.label}
              </button>
            ))}
          </div>
        </div>
      </SectionFrame>

      <SectionFrame title="VERDICT" tone={trace.matched === -1 ? "danger" : "ok"}>
        {trace.matched === -1 ? (
          <div style={{ marginTop: 8, fontFamily: "var(--ds-mono), monospace", fontSize: 12, color: "#FCA5A5", lineHeight: 1.7 }}>
            no clause matched. <span style={{ color: DS.t2 }}>{raised}</span> propagates uncaught up the call stack.
          </div>
        ) : (
          <div style={{ marginTop: 8 }}>
            <div style={{ fontFamily: "var(--ds-mono), monospace", fontSize: 12, color: DS.grn, lineHeight: 1.7 }}>
              clause #{trace.matched + 1} (<span style={{ color: DS.t1, fontWeight: 700 }}>except {chain[trace.matched] === "BARE" ? "" : chain[trace.matched]}{chain[trace.matched] === "BARE" ? ":" : ""}</span>) catches it.
              <span style={{ color: DS.t3 }}>{" "}— first match wins; later clauses never run.</span>
            </div>
            {chain.slice(trace.matched + 1).some((cls, j) => {
              const step = trace.steps[trace.matched + 1 + j];
              return step.dead;
            }) && (
              <div style={{ marginTop: 6, fontSize: 10, color: "#FCA5A5", fontFamily: "var(--ds-mono), monospace" }}>
                ⚠ {chain.length - trace.matched - 1} clause(s) below are dead code for this exception. Reorder so the most specific class comes first.
              </div>
            )}
            {(chain[trace.matched] === "BARE" || chain[trace.matched] === "BaseException") && (
              <div style={{ marginTop: 6, fontSize: 10, color: "#FCA5A5", fontFamily: "var(--ds-mono), monospace" }}>
                ⚠ bare except: / except BaseException: also catches <span style={{ color: DS.t1 }}>KeyboardInterrupt</span> and <span style={{ color: DS.t1 }}>SystemExit</span>. Almost always wrong.
              </div>
            )}
          </div>
        )}
      </SectionFrame>
    </div>
  );
}

function ChainRow({ idx, cls, step, onUp, onDown, onRemove, isLast, isFirst }) {
  const matched = step?.matched && !step?.dead;
  const dead = step?.dead;
  const palette = matched
    ? { border: "rgba(52,211,153,0.45)", bg: "rgba(52,211,153,0.10)", accent: DS.grn,    label: "✓ MATCH" }
    : dead
      ? { border: "rgba(248,113,113,0.30)", bg: "rgba(248,113,113,0.05)", accent: "#FCA5A5", label: "⚠ DEAD" }
      : { border: DS.border,                bg: "rgba(255,255,255,0.02)", accent: DS.dim,    label: "✗ skip" };
  return (
    <div
      style={{
        padding: "9px 12px",
        borderLeft: `3px solid ${palette.accent}`,
        background: palette.bg,
        border: `1px solid ${palette.border}`,
        borderLeftWidth: 3,
        borderRadius: 8,
        opacity: dead ? 0.65 : 1,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ minWidth: 22, fontFamily: "var(--ds-mono), monospace", fontSize: 10, color: DS.dim, fontWeight: 700 }}>
          #{idx + 1}
        </span>
        <span style={{ fontFamily: "var(--ds-mono), monospace", fontSize: 12, fontWeight: 700, color: palette.accent, flex: 1 }}>
          {cls === "BARE" ? "except:" : `except ${cls}:`}
        </span>
        <span style={{ fontFamily: "var(--ds-mono), monospace", fontSize: 9, fontWeight: 700, color: palette.accent, letterSpacing: 0.8 }}>
          {palette.label}
        </span>
        <button type="button" onClick={onUp} disabled={isFirst} style={miniBtn(isFirst)}>↑</button>
        <button type="button" onClick={onDown} disabled={isLast} style={miniBtn(isLast)}>↓</button>
        <button type="button" onClick={onRemove} style={miniBtn(false)}>×</button>
      </div>
    </div>
  );
}

function ancestryString(cls) {
  const out = [];
  let cur = cls;
  while (cur) {
    out.push(cur);
    cur = EXCEPTION_TREE[cur]?.parent ?? null;
  }
  return out.join("  ⊂  ");
}

// ──────────────────────────────────────────────────────────────
// Mode 3 — Traceback Reader.
// ──────────────────────────────────────────────────────────────

const RAISE_FORMS = [
  {
    id: "from_e",
    label: "raise InvalidConfig(...) from e",
    description: "explicit cause chain — your own wrap of a low-level error",
    code: `try:
    age = int(row["age"])
except ValueError as e:
    raise InvalidConfig(f"bad age: {row['age']!r}") from e`,
    boilerplate: "The above exception was the direct cause of the following exception:",
    boilerplateColor: "#7DD3FC",
    setting: "__cause__",
  },
  {
    id: "context",
    label: "raise InvalidConfig(...)   (during except)",
    description: "implicit context chain — usually a cleanup bug",
    code: `try:
    age = int(row["age"])
except ValueError:
    rollback()                  # this raised DatabaseError
    raise InvalidConfig("bad age")`,
    boilerplate: "During handling of the above exception, another exception occurred:",
    boilerplateColor: "#FCA5A5",
    setting: "__context__",
  },
  {
    id: "from_none",
    label: "raise InvalidConfig(...) from None",
    description: "suppress the chain — clean traceback, original error hidden",
    code: `try:
    age = int(row["age"])
except ValueError:
    raise InvalidConfig("bad age") from None`,
    boilerplate: null,
    boilerplateColor: null,
    setting: "__cause__ = None, __suppress_context__ = True",
  },
  {
    id: "bare_reraise",
    label: "raise   (bare re-raise)",
    description: "send the same exception up — preserves the traceback",
    code: `try:
    age = int(row["age"])
except ValueError:
    log.exception("bad age")
    raise`,
    boilerplate: null,
    boilerplateColor: null,
    setting: "(no new exception — original __traceback__ preserved)",
  },
];

function TracebackReaderMode() {
  const [formId, setFormId] = useState("from_e");
  const form = RAISE_FORMS.find((f) => f.id === formId);

  return (
    <div>
      <SectionFrame title="RAISE FORM · pick how the new exception is raised">
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
          {RAISE_FORMS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFormId(f.id)}
              style={pickerBtn(formId === f.id, "#7DD3FC")}
            >
              <div style={{ color: formId === f.id ? DS.t1 : DS.t2, fontWeight: 700 }}>{f.label}</div>
              <div style={{ color: DS.dim, fontSize: 9, marginTop: 2, fontWeight: 500 }}>{f.description}</div>
            </button>
          ))}
        </div>
      </SectionFrame>

      <SectionFrame title="HANDLER CODE">
        <pre style={codeStyle}>{form.code}</pre>
        <div style={{ marginTop: 6, fontFamily: "var(--ds-mono), monospace", fontSize: 10, color: DS.t3 }}>
          attribute set on the new exception: <span style={{ color: DS.t2 }}>{form.setting}</span>
        </div>
      </SectionFrame>

      <SectionFrame title="WHAT PYTHON PRINTS · annotated traceback" tone="danger">
        <AnnotatedTraceback form={form} />
      </SectionFrame>

      <SectionFrame title="HOW TO READ IT (senior heuristic)">
        <ol style={{ margin: "8px 0 0 18px", padding: 0, color: DS.t2, fontFamily: "var(--ds-mono), monospace", fontSize: 11, lineHeight: 1.8 }}>
          <li>Read the <span style={{ color: DS.t1, fontWeight: 700 }}>last line</span> first — it is the actual exception type and message.</li>
          <li>Look at the <span style={{ color: DS.t1, fontWeight: 700 }}>file:line just above it</span> — that is where the raise happened.</li>
          <li>Walk <span style={{ color: DS.t1, fontWeight: 700 }}>upward</span> through call frames only as far as you need.</li>
          <li>If you see <span style={{ color: "#7DD3FC" }}>"direct cause of"</span> → someone wrapped on purpose (<span style={{ color: DS.t2 }}>__cause__</span>).</li>
          <li>If you see <span style={{ color: "#FCA5A5" }}>"during handling of"</span> → cleanup code raised on top of the real error (<span style={{ color: DS.t2 }}>__context__</span>) — usually the bug.</li>
        </ol>
      </SectionFrame>
    </div>
  );
}

function AnnotatedTraceback({ form }) {
  const innerExc = "ValueError";
  const innerMsg = "invalid literal for int() with base 10: 'old'";
  const outerExc = "InvalidConfig";
  const outerMsg = "bad age: 'old'";

  if (form.id === "bare_reraise") {
    return (
      <div style={{ marginTop: 8 }}>
        <pre style={tbStyle}>
{`Traceback (most recent call last):
  File "loader.py", line 12, in load_user
    age = int(row["age"])
${innerExc}: ${innerMsg}`}
        </pre>
        <div style={{ marginTop: 8, fontFamily: "var(--ds-mono), monospace", fontSize: 10, color: DS.t3, lineHeight: 1.7 }}>
          ↳ <span style={{ color: DS.grn, fontWeight: 700 }}>last line</span> is the actual error.<br />
          ↳ no chain — the bare <span style={{ color: DS.t1 }}>raise</span> sent the SAME exception up; <span style={{ color: DS.t2 }}>__traceback__</span> is preserved exactly.
        </div>
      </div>
    );
  }

  if (form.id === "from_none") {
    return (
      <div style={{ marginTop: 8 }}>
        <pre style={tbStyle}>
{`Traceback (most recent call last):
  File "loader.py", line 14, in load_user
    raise InvalidConfig("bad age") from None
${outerExc}: ${outerMsg}`}
        </pre>
        <div style={{ marginTop: 8, fontFamily: "var(--ds-mono), monospace", fontSize: 10, color: DS.t3, lineHeight: 1.7 }}>
          ↳ <span style={{ color: DS.grn, fontWeight: 700 }}>last line</span> is the actual error (the new <span style={{ color: DS.t1 }}>{outerExc}</span>).<br />
          ↳ <span style={{ color: DS.t1 }}>from None</span> set <span style={{ color: DS.t2 }}>__suppress_context__ = True</span> — so the original <span style={{ color: DS.dim }}>{innerExc}</span> is hidden.
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginTop: 8 }}>
      <pre style={tbStyle}>
{`Traceback (most recent call last):
  File "loader.py", line 12, in load_user
    age = int(row["age"])
`}<span style={{ color: DS.dim }}>{innerExc}: {innerMsg}</span>
      </pre>
      <div
        style={{
          margin: "10px 0",
          padding: "8px 12px",
          borderLeft: `3px solid ${form.boilerplateColor}`,
          background: form.id === "context" ? "rgba(248,113,113,0.06)" : "rgba(125,211,252,0.06)",
          fontFamily: "var(--ds-mono), monospace",
          fontSize: 11,
          color: form.boilerplateColor,
          fontStyle: "italic",
        }}
      >
        {form.boilerplate}
      </div>
      <pre style={tbStyle}>
{`  File "loader.py", line 14, in load_user
    raise InvalidConfig(f"bad age: {row['age']!r}")${form.id === "from_e" ? " from e" : ""}
`}<span style={{ color: "#FCA5A5", fontWeight: 700 }}>{outerExc}: {outerMsg}</span>
      </pre>
      <div style={{ marginTop: 8, fontFamily: "var(--ds-mono), monospace", fontSize: 10, color: DS.t3, lineHeight: 1.7 }}>
        ↳ <span style={{ color: DS.grn, fontWeight: 700 }}>last line</span> is the actual error visible to your caller.<br />
        ↳ the <span style={{ color: form.boilerplateColor, fontWeight: 700 }}>middle line</span> tells you {form.id === "from_e"
          ? <>this is an <span style={{ color: DS.t1 }}>intentional wrap</span> via <span style={{ color: DS.t1 }}>__cause__</span>.</>
          : <>cleanup raised on top of the real error — <span style={{ color: DS.t1 }}>__context__</span> set automatically. Often the bug is the line that quietly raised <span style={{ color: DS.t1 }}>during</span> the except.</>}
      </div>
    </div>
  );
}

const tbStyle = {
  fontFamily: "var(--ds-mono), monospace",
  fontSize: 11,
  lineHeight: 1.6,
  color: DS.t3,
  background: "rgba(2,6,23,0.65)",
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid rgba(248,113,113,0.20)",
  whiteSpace: "pre-wrap",
  margin: 0,
};

// ──────────────────────────────────────────────────────────────
// Pieces.
// ──────────────────────────────────────────────────────────────

function pickerBtn(active, accent) {
  return {
    padding: "7px 10px",
    borderRadius: 8,
    border: `1px solid ${active ? accent : DS.border}`,
    background: active ? `${accent}1c` : "rgba(255,255,255,0.02)",
    color: active ? DS.t1 : DS.t2,
    fontSize: 11,
    fontFamily: "var(--ds-mono), monospace",
    fontWeight: 600,
    cursor: "pointer",
    textAlign: "left",
  };
}

function miniBtn(disabled) {
  return {
    padding: "3px 8px",
    borderRadius: 6,
    border: `1px solid ${DS.border}`,
    background: "rgba(255,255,255,0.02)",
    color: disabled ? DS.dim : DS.t3,
    fontSize: 10,
    fontFamily: "var(--ds-mono), monospace",
    fontWeight: 700,
    cursor: disabled ? "not-allowed" : "pointer",
  };
}

function SectionFrame({ title, children, tone }) {
  const border =
    tone === "danger" ? "rgba(248,113,113,0.30)" :
    tone === "ok" ? "rgba(52,211,153,0.28)" :
    DS.border;
  const bg =
    tone === "danger" ? "rgba(248,113,113,0.04)" :
    tone === "ok" ? "rgba(52,211,153,0.04)" :
    "rgba(255,255,255,0.015)";
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
  margin: "6px 0 0 0",
  whiteSpace: "pre-wrap",
};

// ──────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────

export default function TracebackTheater() {
  const [mode, setMode] = useState("router");
  return (
    <div style={{ fontFamily: "var(--ds-sans), sans-serif" }}>
      <div style={{ fontSize: 17, fontWeight: 700, color: DS.t1, marginBottom: 4 }}>
        The traceback theater
      </div>
      <p style={{ fontSize: 12, color: DS.t3, fontFamily: "var(--ds-mono), monospace", lineHeight: 1.6, marginBottom: 14 }}>
        Three views on errors: route a <span style={{ color: DS.t1 }}>try / except / else / finally</span> block,
        watch <span style={{ color: "#FCA5A5" }}>isinstance</span>-driven matching against the exception hierarchy, then read a real
        Python <span style={{ color: "#FCA5A5" }}>traceback</span> with the boilerplate decoded.
      </p>

      <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
        <ModeTab active={mode === "router"}    onClick={() => setMode("router")}    label="1 · try/except router"  hint="which clauses run, in order — including else/finally" />
        <ModeTab active={mode === "hierarchy"} onClick={() => setMode("hierarchy")} label="2 · hierarchy match"     hint="first matching except wins; subclass-before-base" />
        <ModeTab active={mode === "reader"}    onClick={() => setMode("reader")}    label="3 · traceback reader"    hint="from e · context · from None · bare raise" />
      </div>

      {mode === "router"    && <TryRouterMode />}
      {mode === "hierarchy" && <HierarchyMatchMode />}
      {mode === "reader"    && <TracebackReaderMode />}
    </div>
  );
}
