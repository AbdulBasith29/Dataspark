import { useState, useMemo } from "react";
import { DS } from "../lib/ds-platform-tokens.js";
import useReducedMotion from "../lib/use-reduced-motion.js";

/**
 * DecoratorForge — two-tab interactive for "Decorators & Context Managers" (py-o4).
 *
 * Tab 1 · Decorator layers: Stack up to 3 decorators on fetch_data(). Watch the
 * Python code update in real time and step through the execution trace, including
 * the retry-on-failure path.
 *
 * Tab 2 · Context manager lifecycle: Pick a scenario (db.transaction, open,
 * tempfile.TemporaryDirectory), toggle normal vs exception path, and watch the
 * __enter__ / body / __exit__ lifecycle animate on a vertical timeline.
 */

// ──────────────────────────────────────────────────────────────
// Decorator definitions
// ──────────────────────────────────────────────────────────────

const DECORATORS = [
  {
    id: "retry",
    label: "@retry(max=3)",
    shortLabel: "retry",
    color: "#FB923C",
    pyLine: "@retry(max=3)",
    description: "wraps call in try/except, retries on exception",
    enterAction: "attempt 1 of 3",
    exitActionOk: "success · return result",
    exitActionFail: "all 3 attempts failed · raise RuntimeError",
    failSteps: [
      { label: "retry.__call__", action: "attempt 1 of 3", status: "failed" },
      { label: "retry.__call__", action: "attempt 2 of 3", status: "failed" },
      { label: "retry.__call__", action: "attempt 3 of 3 · giving up", status: "failed" },
    ],
  },
  {
    id: "timer",
    label: "@timer",
    shortLabel: "timer",
    color: "#60A5FA",
    pyLine: "@timer",
    description: "records start/end time",
    enterAction: "start clock · time.perf_counter()",
    exitActionOk: "stop clock · elapsed: 0.12s",
    exitActionFail: "stop clock · elapsed: 0.08s (aborted)",
  },
  {
    id: "log_call",
    label: "@log_call",
    shortLabel: "log_call",
    color: "#A78BFA",
    pyLine: "@log_call",
    description: "prints function name + args before/after",
    enterAction: 'fetch_data called with url="https://api.example.com/data"',
    exitActionOk: 'fetch_data returned DataFrame(50 rows)',
    exitActionFail: 'fetch_data raised HTTPError(503)',
  },
  {
    id: "cache",
    label: "@cache",
    shortLabel: "cache",
    color: "#34D399",
    pyLine: "@cache",
    description: "memoizes result, skips wrapped fn if cached",
    enterAction: 'cache miss · key="https://api.example.com/data"',
    exitActionOk: "store result in cache · return cached copy",
    exitActionFail: "exception not cached · propagate",
  },
  {
    id: "validate_types",
    label: "@validate_types",
    shortLabel: "validate",
    color: "#FCD34D",
    pyLine: "@validate_types",
    description: "checks argument types match annotations",
    enterAction: "url: str ✓ annotation check passed",
    exitActionOk: "return type: pd.DataFrame ✓ check passed",
    exitActionFail: "exception before return · skip return type check",
  },
];

const MAX_STACK = 3;

// ──────────────────────────────────────────────────────────────
// Context manager scenarios
// ──────────────────────────────────────────────────────────────

const CM_SCENARIOS = [
  {
    id: "db",
    label: "db.transaction()",
    pyLine: "with db.transaction() as tx:",
    enterLabel: "ACQUIRE connection",
    enterDetail: "conn = pool.get_connection()\nconn.begin()",
    bodyLabel: "user code",
    bodyDetail: "tx.execute('INSERT INTO events ...')\ntx.execute('UPDATE stats ...')",
    exitNormalLabel: "COMMIT",
    exitNormalDetail: "conn.commit()\npool.release(conn)",
    exitExcLabel: "ROLLBACK",
    exitExcDetail: "conn.rollback()\npool.release(conn)\n# exception re-raised",
    resourceColor: "#60A5FA",
  },
  {
    id: "file",
    label: "open(filepath)",
    pyLine: "with open(filepath, 'r') as f:",
    enterLabel: "OPEN file descriptor",
    enterDetail: "fd = os.open(filepath, os.O_RDONLY)\n# fd=7 assigned",
    bodyLabel: "user code",
    bodyDetail: "data = f.read()\nlines = f.readlines()",
    exitNormalLabel: "CLOSE file",
    exitNormalDetail: "os.close(fd)\n# fd=7 released",
    exitExcLabel: "CLOSE file (guaranteed)",
    exitExcDetail: "os.close(fd)  # always runs!\n# exception re-raised",
    resourceColor: "#34D399",
  },
  {
    id: "tmpdir",
    label: "tempfile.TemporaryDirectory()",
    pyLine: "with tempfile.TemporaryDirectory() as tmpdir:",
    enterLabel: "CREATE temp dir",
    enterDetail: 'tmpdir = "/tmp/tmpXk3f9p"\nos.makedirs(tmpdir)',
    bodyLabel: "user code",
    bodyDetail: "process_files(tmpdir)\nwrite_output(tmpdir)",
    exitNormalLabel: "CLEANUP dir",
    exitNormalDetail: 'shutil.rmtree("/tmp/tmpXk3f9p")\n# dir + all contents removed',
    exitExcLabel: "CLEANUP dir (always)",
    exitExcDetail: 'shutil.rmtree("/tmp/tmpXk3f9p")  # guaranteed!\n# exception re-raised',
    resourceColor: "#FB923C",
  },
];

// ──────────────────────────────────────────────────────────────
// Tab switcher
// ──────────────────────────────────────────────────────────────

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

// ──────────────────────────────────────────────────────────────
// Decorator chip toggle
// ──────────────────────────────────────────────────────────────

function DecChip({ dec, active, disabled, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "7px 12px",
        borderRadius: 8,
        border: `1px solid ${active ? dec.color : DS.border}`,
        background: active ? `${dec.color}20` : "rgba(255,255,255,0.02)",
        color: active ? dec.color : disabled ? DS.dim : DS.t3,
        fontFamily: "var(--ds-mono), monospace",
        fontSize: 11,
        fontWeight: 700,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.45 : 1,
        transition: "all 0.15s",
        whiteSpace: "nowrap",
      }}
    >
      {dec.label}
      <span style={{ fontSize: 10, color: active ? dec.color : DS.dim, marginLeft: 6, fontWeight: 500 }}>
        {dec.description}
      </span>
    </button>
  );
}

// ──────────────────────────────────────────────────────────────
// Python code panel (syntax-color-only highlighting)
// ──────────────────────────────────────────────────────────────

function PyCodePanel({ stack }) {
  // stack: array of decorator ids in application order (bottom-up)
  // In Python: outermost (applied last) is first line of @decorators
  // e.g. stack = ["timer", "retry", "log_call"] means:
  //   @log_call   ← outermost, listed first
  //   @retry(max=3)
  //   @timer      ← innermost, listed last
  //   def fetch_data(...)

  const decLines = [...stack].reverse(); // reverse so outermost is first

  return (
    <div
      style={{
        padding: "12px 14px",
        borderRadius: 14,
        border: `1px solid ${DS.border}`,
        background: "rgba(6,8,20,0.65)",
        fontFamily: "var(--ds-mono), monospace",
        fontSize: 12,
        lineHeight: 1.75,
        minHeight: 180,
        flex: 1,
      }}
    >
      <div
        style={{
          fontSize: 9,
          letterSpacing: 1.4,
          color: DS.dim,
          fontWeight: 700,
          marginBottom: 10,
        }}
      >
        PYTHON CODE
      </div>

      {stack.length === 0 && (
        <div
          style={{
            fontSize: 10,
            color: DS.dim,
            fontStyle: "italic",
            marginBottom: 8,
            fontFamily: "var(--ds-mono), monospace",
          }}
        >
          # no decorators applied yet
        </div>
      )}

      {decLines.map((id) => {
        const dec = DECORATORS.find((d) => d.id === id);
        return (
          <div key={id} style={{ color: dec.color, fontWeight: 600 }}>
            {dec.pyLine}
          </div>
        );
      })}

      {/* function signature */}
      <div>
        <span style={{ color: "#818CF8" }}>def </span>
        <span style={{ color: "#FCD34D" }}>fetch_data</span>
        <span style={{ color: DS.t2 }}>(</span>
        <span style={{ color: "#FB923C" }}>url</span>
        <span style={{ color: DS.t3 }}>: </span>
        <span style={{ color: "#34D399" }}>str</span>
        <span style={{ color: DS.t2 }}>) </span>
        <span style={{ color: DS.t3 }}>-&gt; </span>
        <span style={{ color: "#34D399" }}>pd.DataFrame</span>
        <span style={{ color: DS.t2 }}>:</span>
      </div>
      <div style={{ color: DS.dim, paddingLeft: 20 }}>
        <span style={{ color: "#60A5FA" }}>&quot;&quot;&quot;</span>
        <span style={{ color: DS.dim }}> Fetch data from API. </span>
        <span style={{ color: "#60A5FA" }}>&quot;&quot;&quot;</span>
      </div>
      <div style={{ paddingLeft: 20 }}>
        <span style={{ color: DS.t3 }}>resp </span>
        <span style={{ color: DS.dim }}>= </span>
        <span style={{ color: "#60A5FA" }}>requests</span>
        <span style={{ color: DS.t2 }}>.</span>
        <span style={{ color: "#FCD34D" }}>get</span>
        <span style={{ color: DS.t2 }}>(url)</span>
      </div>
      <div style={{ paddingLeft: 20 }}>
        <span style={{ color: "#818CF8" }}>return </span>
        <span style={{ color: "#60A5FA" }}>pd</span>
        <span style={{ color: DS.t2 }}>.</span>
        <span style={{ color: "#FCD34D" }}>DataFrame</span>
        <span style={{ color: DS.t2 }}>(resp.</span>
        <span style={{ color: "#FCD34D" }}>json</span>
        <span style={{ color: DS.t2 }}>())</span>
      </div>

      {stack.length > 0 && (
        <div style={{ marginTop: 14, paddingTop: 10, borderTop: `1px dashed ${DS.border}` }}>
          <div style={{ fontSize: 10, color: DS.dim, marginBottom: 6 }}>
            # equivalent explicit wrapping:
          </div>
          {buildExplicitWrap(stack).map((line, i) => (
            <div key={i} style={{ color: DS.t2, paddingLeft: line.indent * 16 }}>
              {line.text}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function buildExplicitWrap(stack) {
  // stack[0] = first applied (innermost), stack[last] = outermost
  // Explicit: result = outer(middle(inner(fetch_data)))
  const lines = [];
  const innermost = DECORATORS.find((d) => d.id === stack[0]);
  const middle = stack[1] ? DECORATORS.find((d) => d.id === stack[1]) : null;
  const outer = stack[2] ? DECORATORS.find((d) => d.id === stack[2]) : null;

  if (stack.length === 1) {
    lines.push({
      text: `fetch_data = ${innermost.pyLine.replace("@", "")}(fetch_data)`,
      indent: 0,
    });
  } else if (stack.length === 2) {
    lines.push({ text: `_wrapped = ${innermost.pyLine.replace("@", "")}(fetch_data)`, indent: 0 });
    lines.push({ text: `fetch_data = ${middle.pyLine.replace("@", "")}(_wrapped)`, indent: 0 });
  } else {
    lines.push({ text: `_a = ${innermost.pyLine.replace("@", "")}(fetch_data)`, indent: 0 });
    lines.push({ text: `_b = ${middle.pyLine.replace("@", "")}(_a)`, indent: 0 });
    lines.push({ text: `fetch_data = ${outer.pyLine.replace("@", "")}(_b)`, indent: 0 });
  }
  return lines;
}

// ──────────────────────────────────────────────────────────────
// Execution trace step
// ──────────────────────────────────────────────────────────────

const STATUS_STYLES = {
  pending: { bg: "rgba(255,255,255,0.03)", border: DS.border, color: DS.dim, dot: DS.dim },
  active: { bg: "rgba(99,102,241,0.12)", border: `${DS.ind}55`, color: DS.t1, dot: DS.ind },
  done: { bg: "rgba(52,211,153,0.08)", border: "#34D39940", color: DS.t2, dot: "#34D399" },
  failed: { bg: "rgba(252,165,165,0.10)", border: "#FCA5A566", color: "#FCA5A5", dot: "#FCA5A5" },
  skipped: { bg: "rgba(71,85,105,0.12)", border: DS.border, color: DS.dim, dot: DS.dim },
};

function TraceStep({ num, who, action, status, whoColor, reduceMotion }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.pending;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        padding: "9px 11px",
        borderRadius: 10,
        border: `1px solid ${s.border}`,
        background: s.bg,
        transition: reduceMotion ? "none" : "all 0.2s",
      }}
    >
      <div
        style={{
          minWidth: 20,
          height: 20,
          borderRadius: "50%",
          background: s.dot + "30",
          border: `1.5px solid ${s.dot}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 9,
          fontFamily: "var(--ds-mono), monospace",
          color: s.dot,
          fontWeight: 700,
          flexShrink: 0,
        }}
      >
        {num}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 11,
            fontFamily: "var(--ds-mono), monospace",
            fontWeight: 700,
            color: whoColor || s.color,
            marginBottom: 2,
          }}
        >
          {who}
        </div>
        <div
          style={{
            fontSize: 11,
            fontFamily: "var(--ds-mono), monospace",
            color: s.color,
            opacity: status === "pending" ? 0.6 : 1,
            wordBreak: "break-word",
          }}
        >
          {action}
        </div>
      </div>
      <div
        style={{
          fontSize: 9,
          fontFamily: "var(--ds-mono), monospace",
          color: s.dot,
          fontWeight: 700,
          letterSpacing: 0.8,
          flexShrink: 0,
          alignSelf: "center",
        }}
      >
        {status.toUpperCase()}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Build trace steps from stack
// ──────────────────────────────────────────────────────────────

function buildTrace(stack, simulateFail) {
  if (stack.length === 0) return [];

  // stack[0] = innermost, stack[last] = outermost
  // Call order: outermost first (descending), then fn, then return ascending
  const ordered = [...stack].reverse(); // outermost first

  const steps = [];
  let stepNum = 1;

  const hasRetry = stack.includes("retry");
  const retryIsOutermost = stack[stack.length - 1] === "retry";

  // ENTER phase: each decorator's __call__ entry (outer → inner)
  for (const id of ordered) {
    const dec = DECORATORS.find((d) => d.id === id);

    if (id === "retry" && simulateFail) {
      // Retry shows multiple attempts
      for (let attempt = 1; attempt <= 3; attempt++) {
        const isLast = attempt === 3;
        steps.push({
          num: stepNum++,
          who: "retry.__call__",
          action: isLast ? `attempt ${attempt} of 3 · giving up` : `attempt ${attempt} of 3`,
          status: "failed",
          whoColor: dec.color,
        });

        if (attempt < 3) {
          // Inner decorators also re-run on retry
          for (const innerId of ordered.slice(ordered.indexOf("retry") + 1)) {
            const inner = DECORATORS.find((d) => d.id === innerId);
            steps.push({
              num: stepNum++,
              who: `${inner.shortLabel}.__call__`,
              action: inner.enterAction,
              status: "failed",
              whoColor: inner.color,
            });
          }
          // The original function also fails each time
          steps.push({
            num: stepNum++,
            who: "fetch_data(url)",
            action: "HTTPError: 503 Service Unavailable",
            status: "failed",
            whoColor: "#FCA5A5",
          });
          // Inner decorators exit (fail path)
          for (const innerId of [...ordered].slice(ordered.indexOf("retry") + 1).reverse()) {
            const inner = DECORATORS.find((d) => d.id === innerId);
            steps.push({
              num: stepNum++,
              who: `${inner.shortLabel}.__call__`,
              action: inner.exitActionFail,
              status: "failed",
              whoColor: inner.color,
            });
          }
        } else {
          // Last attempt: raise
          steps.push({
            num: stepNum++,
            who: "retry.__call__",
            action: "raise RetryError('max retries exceeded')",
            status: "failed",
            whoColor: dec.color,
          });
        }
      }
      // Outer decorators (those wrapping retry) also fail
      for (const outerId of ordered.slice(0, ordered.indexOf("retry")).reverse()) {
        const outer = DECORATORS.find((d) => d.id === outerId);
        steps.push({
          num: stepNum++,
          who: `${outer.shortLabel}.__call__`,
          action: outer.exitActionFail,
          status: "failed",
          whoColor: outer.color,
        });
      }
      return steps;
    }

    steps.push({
      num: stepNum++,
      who: `${dec.shortLabel}.__call__`,
      action: dec.enterAction,
      status: simulateFail ? "active" : "active",
      whoColor: dec.color,
    });
  }

  // Original function
  if (simulateFail) {
    steps.push({
      num: stepNum++,
      who: "fetch_data(url)",
      action: "HTTPError: 503 Service Unavailable",
      status: "failed",
      whoColor: "#FCA5A5",
    });
  } else {
    steps.push({
      num: stepNum++,
      who: "fetch_data(url)",
      action: "→ DataFrame(50 rows) returned",
      status: "done",
      whoColor: "#FCD34D",
    });
  }

  // EXIT phase: each decorator's __call__ return (inner → outer)
  for (const id of [...ordered].reverse()) {
    const dec = DECORATORS.find((d) => d.id === id);
    steps.push({
      num: stepNum++,
      who: `${dec.shortLabel}.__call__`,
      action: simulateFail ? dec.exitActionFail : dec.exitActionOk,
      status: simulateFail ? "failed" : "done",
      whoColor: dec.color,
    });
  }

  return steps;
}

// ──────────────────────────────────────────────────────────────
// Tab 1 — Decorator Layers
// ──────────────────────────────────────────────────────────────

function DecoratorLayers() {
  const reduceMotion = useReducedMotion();
  const [stack, setStack] = useState([]); // ids in application order (innermost first)
  const [simulateFail, setSimulateFail] = useState(false);
  const [activeStep, setActiveStep] = useState(null); // null = show all

  const toggleDec = (id) => {
    setStack((prev) => {
      if (prev.includes(id)) return prev.filter((d) => d !== id);
      if (prev.length >= MAX_STACK) return prev;
      return [...prev, id];
    });
    setActiveStep(null);
  };

  const trace = useMemo(() => buildTrace(stack, simulateFail), [stack, simulateFail]);

  // Determine status for each step
  const stepsWithStatus = useMemo(() => {
    return trace.map((step, i) => ({
      ...step,
      status: activeStep === null ? step.status : i === activeStep ? "active" : i < activeStep ? step.status : "pending",
    }));
  }, [trace, activeStep]);

  return (
    <div>
      {/* Decorator picker */}
      <div
        style={{
          padding: "12px 14px",
          borderRadius: 14,
          border: `1px solid ${DS.border}`,
          background: "rgba(255,255,255,0.015)",
          marginBottom: 14,
        }}
      >
        <div
          style={{
            fontSize: 9,
            letterSpacing: 1.4,
            color: DS.dim,
            fontFamily: "var(--ds-mono), monospace",
            fontWeight: 700,
            marginBottom: 10,
          }}
        >
          PICK DECORATORS (up to {MAX_STACK}) — outermost applied last = top line in code
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
          {DECORATORS.map((dec) => {
            const active = stack.includes(dec.id);
            const disabled = !active && stack.length >= MAX_STACK;
            return (
              <DecChip
                key={dec.id}
                dec={dec}
                active={active}
                disabled={disabled}
                onClick={() => toggleDec(dec.id)}
              />
            );
          })}
        </div>

        {/* Stack order indicator */}
        {stack.length > 0 && (
          <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px dashed ${DS.border}` }}>
            <div
              style={{
                fontSize: 9,
                letterSpacing: 1.2,
                color: DS.dim,
                fontFamily: "var(--ds-mono), monospace",
                fontWeight: 700,
                marginBottom: 6,
              }}
            >
              WRAP ORDER · innermost → outermost
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              {stack.map((id, i) => {
                const dec = DECORATORS.find((d) => d.id === id);
                return (
                  <div key={id} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span
                      style={{
                        fontSize: 11,
                        fontFamily: "var(--ds-mono), monospace",
                        color: dec.color,
                        fontWeight: 700,
                        padding: "3px 8px",
                        borderRadius: 6,
                        border: `1px solid ${dec.color}44`,
                        background: `${dec.color}12`,
                      }}
                    >
                      {dec.shortLabel}
                      <span
                        style={{
                          fontSize: 9,
                          color: DS.dim,
                          marginLeft: 5,
                        }}
                      >
                        {i === 0 ? "innermost" : i === stack.length - 1 ? "outermost" : "middle"}
                      </span>
                    </span>
                    {i < stack.length - 1 && (
                      <span style={{ color: DS.dim, fontSize: 12 }}>→</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Simulate failure toggle */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <button
          type="button"
          onClick={() => { setSimulateFail((v) => !v); setActiveStep(null); }}
          style={{
            padding: "8px 14px",
            borderRadius: 8,
            border: `1px solid ${simulateFail ? "#FCA5A5" : DS.border}`,
            background: simulateFail ? "rgba(252,165,165,0.1)" : "rgba(255,255,255,0.02)",
            color: simulateFail ? "#FCA5A5" : DS.t3,
            fontFamily: "var(--ds-mono), monospace",
            fontSize: 11,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {simulateFail ? "⚡ failure mode ON" : "simulate failure"}
        </button>
        {simulateFail && (
          <span style={{ fontSize: 11, color: "#FB923C", fontFamily: "var(--ds-mono), monospace" }}>
            fetch_data raises HTTPError(503) — watch retry behavior
          </span>
        )}
      </div>

      {stack.length === 0 ? (
        <div
          style={{
            padding: "32px 20px",
            borderRadius: 14,
            border: `1px dashed ${DS.border}`,
            background: "rgba(255,255,255,0.01)",
            textAlign: "center",
            color: DS.dim,
            fontFamily: "var(--ds-mono), monospace",
            fontSize: 12,
          }}
        >
          Pick at least one decorator above to see the code and execution trace.
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {/* Left: Python code */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <PyCodePanel stack={stack} />
            {/* Call instruction */}
            <div
              style={{
                padding: "10px 12px",
                borderRadius: 10,
                border: `1px solid ${DS.border}`,
                background: "rgba(255,255,255,0.015)",
                fontFamily: "var(--ds-mono), monospace",
                fontSize: 11,
                color: DS.t3,
              }}
            >
              <span style={{ color: DS.dim }}>call site: </span>
              <span style={{ color: "#FCD34D" }}>fetch_data</span>
              <span style={{ color: DS.t2 }}>(</span>
              <span style={{ color: "#FB923C" }}>url</span>
              <span style={{ color: DS.dim }}>=</span>
              <span style={{ color: "#34D399" }}>&quot;https://api.example.com/data&quot;</span>
              <span style={{ color: DS.t2 }}>)</span>
            </div>
          </div>

          {/* Right: execution trace */}
          <div>
            <div
              style={{
                fontSize: 9,
                letterSpacing: 1.4,
                color: DS.dim,
                fontFamily: "var(--ds-mono), monospace",
                fontWeight: 700,
                marginBottom: 8,
              }}
            >
              EXECUTION TRACE · {simulateFail ? "failure path" : "happy path"}
            </div>

            {activeStep !== null && (
              <div style={{ marginBottom: 8 }}>
                <button
                  type="button"
                  onClick={() => setActiveStep(null)}
                  style={{
                    padding: "5px 10px",
                    borderRadius: 6,
                    border: `1px solid ${DS.border}`,
                    background: "rgba(255,255,255,0.03)",
                    color: DS.t3,
                    fontFamily: "var(--ds-mono), monospace",
                    fontSize: 10,
                    cursor: "pointer",
                  }}
                >
                  ← show all
                </button>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {stepsWithStatus.map((step, i) => (
                <div
                  key={i}
                  style={{ cursor: "pointer" }}
                  onClick={() => setActiveStep(activeStep === i ? null : i)}
                >
                  <TraceStep {...step} reduceMotion={reduceMotion} />
                </div>
              ))}
            </div>

            {trace.length > 0 && (
              <div
                style={{
                  marginTop: 10,
                  padding: "8px 10px",
                  borderRadius: 8,
                  background: "rgba(255,255,255,0.02)",
                  border: `1px dashed ${DS.border}`,
                  fontSize: 10,
                  color: DS.dim,
                  fontFamily: "var(--ds-mono), monospace",
                }}
              >
                {simulateFail
                  ? `${stack.length} decorator${stack.length > 1 ? "s" : ""} in stack · failure propagates outward · click a step to isolate`
                  : `${stack.length} decorator${stack.length > 1 ? "s" : ""} in stack · ${trace.length} trace steps · click a step to isolate`}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Tab 2 — Context manager lifecycle
// ──────────────────────────────────────────────────────────────

function TimelineNode({ phase, color, label, detail, isException, isActive, connector, reduceMotion }) {
  const borderColor = isException ? "#FCA5A5" : isActive ? color : DS.border;
  const bgColor = isException
    ? "rgba(252,165,165,0.08)"
    : isActive
    ? `${color}12`
    : "rgba(255,255,255,0.015)";

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "stretch" }}>
      <div
        style={{
          padding: "12px 14px",
          borderRadius: 12,
          border: `1px solid ${borderColor}`,
          background: bgColor,
          transition: reduceMotion ? "none" : "all 0.2s",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 6,
          }}
        >
          <div
            style={{
              padding: "2px 8px",
              borderRadius: 5,
              background: isException ? "#FCA5A530" : `${color}25`,
              border: `1px solid ${isException ? "#FCA5A566" : `${color}55`}`,
              fontSize: 9,
              fontFamily: "var(--ds-mono), monospace",
              fontWeight: 700,
              letterSpacing: 1,
              color: isException ? "#FCA5A5" : color,
            }}
          >
            {phase}
          </div>
          <div
            style={{
              fontSize: 12,
              fontFamily: "var(--ds-mono), monospace",
              fontWeight: 700,
              color: isException ? "#FCA5A5" : isActive ? DS.t1 : DS.t2,
            }}
          >
            {label}
          </div>
        </div>
        <pre
          style={{
            margin: 0,
            fontSize: 11,
            fontFamily: "var(--ds-mono), monospace",
            color: isException ? "#FCA5A5" : DS.t3,
            lineHeight: 1.6,
            whiteSpace: "pre-wrap",
          }}
        >
          {detail}
        </pre>
      </div>
      {connector && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "4px 0",
            gap: 2,
          }}
        >
          <div
            style={{
              width: 2,
              height: 16,
              background: connector === "exception" ? "#FCA5A5" : `${color}66`,
              borderRadius: 1,
            }}
          />
          <div
            style={{
              fontSize: 10,
              fontFamily: "var(--ds-mono), monospace",
              color: connector === "exception" ? "#FCA5A5" : DS.dim,
              letterSpacing: 0.4,
            }}
          >
            {connector === "exception" ? "⚡ raises exception" : "↓"}
          </div>
          <div
            style={{
              width: 2,
              height: 16,
              background: connector === "exception" ? "#FCA5A5" : `${color}66`,
              borderRadius: 1,
            }}
          />
        </div>
      )}
    </div>
  );
}

function ContextManagerLifecycle() {
  const reduceMotion = useReducedMotion();
  const [scenarioId, setScenarioId] = useState("db");
  const [exceptionPath, setExceptionPath] = useState(false);

  const scenario = CM_SCENARIOS.find((s) => s.id === scenarioId);
  const color = scenario.resourceColor;

  return (
    <div>
      {/* Scenario picker */}
      <div
        style={{
          padding: "12px 14px",
          borderRadius: 14,
          border: `1px solid ${DS.border}`,
          background: "rgba(255,255,255,0.015)",
          marginBottom: 14,
        }}
      >
        <div
          style={{
            fontSize: 9,
            letterSpacing: 1.4,
            color: DS.dim,
            fontFamily: "var(--ds-mono), monospace",
            fontWeight: 700,
            marginBottom: 10,
          }}
        >
          SCENARIO
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {CM_SCENARIOS.map((s) => {
            const active = scenarioId === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setScenarioId(s.id)}
                style={{
                  padding: "8px 14px",
                  borderRadius: 8,
                  border: `1px solid ${active ? s.resourceColor : DS.border}`,
                  background: active ? `${s.resourceColor}18` : "rgba(255,255,255,0.02)",
                  color: active ? s.resourceColor : DS.t3,
                  fontFamily: "var(--ds-mono), monospace",
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {/* Left: code preview + path toggle */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {/* Code */}
          <div
            style={{
              padding: "12px 14px",
              borderRadius: 14,
              border: `1px solid ${DS.border}`,
              background: "rgba(6,8,20,0.65)",
              fontFamily: "var(--ds-mono), monospace",
              fontSize: 12,
              lineHeight: 1.8,
            }}
          >
            <div
              style={{
                fontSize: 9,
                letterSpacing: 1.4,
                color: DS.dim,
                fontWeight: 700,
                marginBottom: 10,
              }}
            >
              PYTHON CODE
            </div>
            <div>
              <span style={{ color: "#818CF8" }}>with </span>
              <span style={{ color: color }}>{scenario.pyLine.replace("with ", "").replace(" as tx:", "").replace(" as f:", "").replace(" as tmpdir:", "")}</span>
              <span style={{ color: DS.t3 }}>{
                scenario.id === "db" ? " as tx:" : scenario.id === "file" ? " as f:" : " as tmpdir:"
              }</span>
            </div>
            <div style={{ paddingLeft: 20, color: DS.t2 }}>
              {scenario.id === "db" && (
                <>
                  <div><span style={{ color: "#34D399" }}>tx</span><span style={{ color: DS.t3 }}>.</span><span style={{ color: "#FCD34D" }}>execute</span><span style={{ color: DS.t2 }}>(&quot;INSERT INTO events ...&quot;)</span></div>
                  <div><span style={{ color: "#34D399" }}>tx</span><span style={{ color: DS.t3 }}>.</span><span style={{ color: "#FCD34D" }}>execute</span><span style={{ color: DS.t2 }}>(&quot;UPDATE stats ...&quot;)</span></div>
                </>
              )}
              {scenario.id === "file" && (
                <>
                  <div><span style={{ color: DS.t3 }}>data </span><span style={{ color: DS.dim }}>=</span><span style={{ color: " #34D399" }}> f</span><span style={{ color: DS.t3 }}>.</span><span style={{ color: "#FCD34D" }}>read</span><span style={{ color: DS.t2 }}>()</span></div>
                  <div><span style={{ color: DS.t3 }}>lines </span><span style={{ color: DS.dim }}>=</span><span style={{ color: "#34D399" }}> f</span><span style={{ color: DS.t3 }}>.</span><span style={{ color: "#FCD34D" }}>readlines</span><span style={{ color: DS.t2 }}>()</span></div>
                </>
              )}
              {scenario.id === "tmpdir" && (
                <>
                  <div><span style={{ color: "#FCD34D" }}>process_files</span><span style={{ color: DS.t2 }}>(tmpdir)</span></div>
                  <div><span style={{ color: "#FCD34D" }}>write_output</span><span style={{ color: DS.t2 }}>(tmpdir)</span></div>
                </>
              )}
              {exceptionPath && (
                <div style={{ color: "#FCA5A5" }}>
                  <span style={{ color: "#818CF8" }}>raise </span>
                  <span>
                    {scenario.id === "db" ? "IntegrityError('duplicate key')" : scenario.id === "file" ? "UnicodeDecodeError('utf-8')" : "PermissionError('read-only fs')"}
                  </span>
                </div>
              )}
            </div>

            {/* __enter__ / __exit__ signature */}
            <div style={{ marginTop: 12, paddingTop: 10, borderTop: `1px dashed ${DS.border}` }}>
              <div style={{ fontSize: 10, color: DS.dim, marginBottom: 4 }}>
                # dunder protocol:
              </div>
              <div>
                <span style={{ color: "#818CF8" }}>def </span>
                <span style={{ color: "#FCD34D" }}>__enter__</span>
                <span style={{ color: DS.t2 }}>(self):</span>
              </div>
              <div style={{ paddingLeft: 20, color: DS.t3 }}>
                ...  <span style={{ color: DS.dim }}># acquire resource, return it</span>
              </div>
              <div>
                <span style={{ color: "#818CF8" }}>def </span>
                <span style={{ color: "#FCD34D" }}>__exit__</span>
                <span style={{ color: DS.t2 }}>(self, </span>
                <span style={{ color: "#FB923C" }}>exc_type</span>
                <span style={{ color: DS.t2 }}>, </span>
                <span style={{ color: "#FB923C" }}>exc_val</span>
                <span style={{ color: DS.t2 }}>, </span>
                <span style={{ color: "#FB923C" }}>tb</span>
                <span style={{ color: DS.t2 }}>):</span>
              </div>
              <div style={{ paddingLeft: 20, color: DS.t3 }}>
                ...  <span style={{ color: DS.dim }}># always runs</span>
              </div>
              <div style={{ paddingLeft: 20, color: DS.t3 }}>
                <span style={{ color: "#818CF8" }}>return </span>
                <span style={{ color: "#FCA5A5" }}>False</span>
                <span style={{ color: DS.dim }}>  # re-raise exception</span>
              </div>
            </div>
          </div>

          {/* Path toggle */}
          <div
            style={{
              padding: "12px 14px",
              borderRadius: 12,
              border: `1px solid ${DS.border}`,
              background: "rgba(255,255,255,0.015)",
            }}
          >
            <div
              style={{
                fontSize: 9,
                letterSpacing: 1.4,
                color: DS.dim,
                fontFamily: "var(--ds-mono), monospace",
                fontWeight: 700,
                marginBottom: 10,
              }}
            >
              EXECUTION PATH
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="button"
                onClick={() => setExceptionPath(false)}
                style={{
                  flex: 1,
                  padding: "9px 10px",
                  borderRadius: 8,
                  border: `1px solid ${!exceptionPath ? "#34D39966" : DS.border}`,
                  background: !exceptionPath ? "rgba(52,211,153,0.1)" : "rgba(255,255,255,0.02)",
                  color: !exceptionPath ? "#34D399" : DS.t3,
                  fontFamily: "var(--ds-mono), monospace",
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                normal path
              </button>
              <button
                type="button"
                onClick={() => setExceptionPath(true)}
                style={{
                  flex: 1,
                  padding: "9px 10px",
                  borderRadius: 8,
                  border: `1px solid ${exceptionPath ? "#FCA5A566" : DS.border}`,
                  background: exceptionPath ? "rgba(252,165,165,0.1)" : "rgba(255,255,255,0.02)",
                  color: exceptionPath ? "#FCA5A5" : DS.t3,
                  fontFamily: "var(--ds-mono), monospace",
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                exception path
              </button>
            </div>

            {/* Key insight */}
            <div
              style={{
                marginTop: 10,
                padding: "8px 10px",
                borderRadius: 8,
                background: `${color}0d`,
                border: `1px solid ${color}30`,
                fontSize: 11,
                color: DS.t2,
                fontFamily: "var(--ds-mono), monospace",
                lineHeight: 1.6,
              }}
            >
              <span style={{ color: color, fontWeight: 700 }}>key insight: </span>
              {exceptionPath
                ? "__exit__ runs even when an exception occurs — the resource is always released."
                : "__exit__ is guaranteed to run when the with block exits, no try/finally needed."}
            </div>
          </div>
        </div>

        {/* Right: lifecycle timeline */}
        <div>
          <div
            style={{
              fontSize: 9,
              letterSpacing: 1.4,
              color: DS.dim,
              fontFamily: "var(--ds-mono), monospace",
              fontWeight: 700,
              marginBottom: 10,
            }}
          >
            LIFECYCLE TIMELINE · {exceptionPath ? "exception path" : "normal path"}
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <TimelineNode
              phase="ENTER"
              color={color}
              label="__enter__ runs"
              detail={scenario.enterDetail}
              isActive
              connector="normal"
              reduceMotion={reduceMotion}
            />
            <TimelineNode
              phase="BODY"
              color={color}
              label="user code executes"
              detail={scenario.bodyDetail + (exceptionPath ? "\n# → exception raised here!" : "")}
              isException={exceptionPath}
              isActive
              connector={exceptionPath ? "exception" : "normal"}
              reduceMotion={reduceMotion}
            />
            <TimelineNode
              phase="EXIT"
              color={color}
              label={exceptionPath ? scenario.exitExcLabel : scenario.exitNormalLabel}
              detail={
                exceptionPath
                  ? scenario.exitExcDetail +
                    "\n\n# __exit__(exc_type, exc_val, tb) called\n# return False → exception re-raised"
                  : scenario.exitNormalDetail +
                    "\n\n# __exit__(None, None, None) called\n# no exception to handle"
              }
              isException={exceptionPath}
              isActive
              connector={null}
              reduceMotion={reduceMotion}
            />
          </div>

          {/* exc_type detail box */}
          <div
            style={{
              marginTop: 12,
              padding: "10px 12px",
              borderRadius: 10,
              border: `1px solid ${DS.border}`,
              background: "rgba(255,255,255,0.015)",
              fontFamily: "var(--ds-mono), monospace",
              fontSize: 11,
              lineHeight: 1.7,
            }}
          >
            <div
              style={{
                fontSize: 9,
                letterSpacing: 1.2,
                color: DS.dim,
                fontWeight: 700,
                marginBottom: 6,
              }}
            >
              __EXIT__ SIGNATURE DECODED
            </div>
            <div>
              <span style={{ color: "#FB923C" }}>exc_type</span>
              <span style={{ color: DS.t3 }}>  = </span>
              <span style={{ color: exceptionPath ? "#FCA5A5" : "#34D399" }}>
                {exceptionPath
                  ? scenario.id === "db"
                    ? "IntegrityError"
                    : scenario.id === "file"
                    ? "UnicodeDecodeError"
                    : "PermissionError"
                  : "None"}
              </span>
            </div>
            <div>
              <span style={{ color: "#FB923C" }}>exc_val</span>
              <span style={{ color: DS.t3 }}>   = </span>
              <span style={{ color: exceptionPath ? "#FCA5A5" : "#34D399" }}>
                {exceptionPath
                  ? scenario.id === "db"
                    ? "IntegrityError('duplicate key')"
                    : scenario.id === "file"
                    ? "UnicodeDecodeError('utf-8 codec')"
                    : "PermissionError('read-only fs')"
                  : "None"}
              </span>
            </div>
            <div>
              <span style={{ color: "#FB923C" }}>tb</span>
              <span style={{ color: DS.t3 }}>        = </span>
              <span style={{ color: exceptionPath ? "#FCA5A5" : "#34D399" }}>
                {exceptionPath ? "<traceback object>" : "None"}
              </span>
            </div>
            <div style={{ marginTop: 6, color: DS.dim }}>
              # return{" "}
              <span style={{ color: "#FCA5A5" }}>False</span> (or None) → re-raise &nbsp;|&nbsp; return{" "}
              <span style={{ color: "#34D399" }}>True</span> → suppress exception
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Root export
// ──────────────────────────────────────────────────────────────

export default function DecoratorForge() {
  const [tab, setTab] = useState("layers");

  return (
    <div style={{ fontFamily: "var(--ds-sans), sans-serif" }}>
      <div style={{ fontSize: 17, fontWeight: 700, color: DS.t1, marginBottom: 4 }}>
        Decorator Forge
      </div>
      <p
        style={{
          fontSize: 12,
          color: DS.t3,
          fontFamily: "var(--ds-mono), monospace",
          lineHeight: 1.6,
          marginBottom: 16,
        }}
      >
        <span style={{ color: DS.ind }}>Decorators</span> wrap functions — the outermost is listed{" "}
        <em>first</em> but applied <em>last</em>.{" "}
        <span style={{ color: DS.grn }}>Context managers</span> guarantee cleanup via{" "}
        <span style={{ color: DS.t1 }}>__enter__</span> /{" "}
        <span style={{ color: DS.t1 }}>__exit__</span>, even on exceptions.
      </p>

      {/* Tab switcher */}
      <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
        <ModeTab
          active={tab === "layers"}
          onClick={() => setTab("layers")}
          label="Decorator layers"
          hint="stack decorators · watch wrapping order + call trace"
        />
        <ModeTab
          active={tab === "context"}
          onClick={() => setTab("context")}
          label="Context manager lifecycle"
          hint="__enter__ / __exit__ · normal + exception paths"
        />
      </div>

      {tab === "layers" ? <DecoratorLayers /> : <ContextManagerLifecycle />}
    </div>
  );
}
