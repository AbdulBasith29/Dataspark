import { useMemo, useReducer, useState } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

/**
 * IteratorEngine — visualizes the two ideas behind every `for` loop in Python.
 *
 *   Mode 1  "Iterator protocol"   — step __iter__ / __next__ by hand. Watch the
 *                                   cursor advance, items move into the yielded
 *                                   tray, and StopIteration fire. Toggle the
 *                                   `iter(x) is x` lens to see iterable vs iterator.
 *   Mode 2  "Lazy pipeline"       — chain filter → map → take. Pull one item at a
 *                                   time and watch ONLY the values needed flow.
 *                                   Compare with the eager path that materializes
 *                                   intermediate lists.
 *
 * Scope: py-c2 — Loops, Iterators & Generators. Distinct visual language from
 * BranchRouter (which animates top-down branch fall-through) and ComprehensionForge
 * (which dissects comprehension grammar). This viz is about *time* — one tick of
 * `next()` per click.
 */

// ──────────────────────────────────────────────────────────────
// Mode 1 — Iterator Protocol: step __iter__ / __next__ by hand.
// ──────────────────────────────────────────────────────────────

const PROTOCOL_SOURCES = [
  {
    id: "list",
    label: "[10, 20, 30, 40]",
    py: "[10, 20, 30, 40]",
    items: [10, 20, 30, 40],
    iterableKind: "iterable",
    iterIsSelf: false,
    note: "list is an **iterable**. iter([…]) returns a fresh list_iterator every call.",
    bodyDoc: "list_iterator(at=N).__next__() returns items[N], then increments N.",
  },
  {
    id: "range",
    label: "range(3, 7)",
    py: "range(3, 7)",
    items: [3, 4, 5, 6],
    iterableKind: "iterable",
    iterIsSelf: false,
    note: "range is a lazy iterable — does not store items, computes them on demand.",
    bodyDoc: "range_iterator increments an internal counter; release the cursor and the range itself is fresh again.",
  },
  {
    id: "gen",
    label: "(x*x for x in range(4))",
    py: "(x * x for x in range(4))",
    items: [0, 1, 4, 9],
    iterableKind: "iterator",
    iterIsSelf: true,
    note: "generator expression — IS an iterator. iter(g) is g. One-shot.",
    bodyDoc: "Each next() resumes the body until the next yield. After the last yield → StopIteration. Re-iterating gives nothing.",
  },
  {
    id: "fn",
    label: "def countdown(n=3): yield n …",
    py: "countdown(3)",
    items: [3, 2, 1],
    iterableKind: "iterator",
    iterIsSelf: true,
    note: "generator function — calling it returns a generator (iterator). Body has not run yet at construction time.",
    bodyDoc: "First next() runs from top until first yield. Locals (n) survive across yields on the heap.",
  },
];

function protocolReducer(state, action) {
  switch (action.type) {
    case "next": {
      if (state.exhausted) return { ...state, lastEvent: "StopIteration (still raised — cursor never resets)" };
      const src = action.source;
      const at = state.cursor;
      if (at >= src.items.length) {
        return { ...state, exhausted: true, lastEvent: "StopIteration (no more items)" };
      }
      const item = src.items[at];
      return {
        ...state,
        cursor: at + 1,
        yielded: [...state.yielded, item],
        lastEvent: `next() → returned ${item}; cursor now at ${at + 1}`,
        exhausted: at + 1 === src.items.length ? false : false, // exhaustion is detected on the *next* call after the end
      };
    }
    case "reset":
      return { cursor: 0, yielded: [], exhausted: false, lastEvent: "iter(source) → fresh cursor" };
    case "newSource":
      return { cursor: 0, yielded: [], exhausted: false, lastEvent: "iter(new source) → fresh cursor" };
    default:
      return state;
  }
}

function ProtocolMode() {
  const [sourceId, setSourceId] = useState("list");
  const source = PROTOCOL_SOURCES.find((s) => s.id === sourceId);
  const [state, dispatch] = useReducer(
    protocolReducer,
    { cursor: 0, yielded: [], exhausted: false, lastEvent: "iter(source) → fresh cursor" },
  );

  return (
    <div>
      <SourcePicker
        label="SOURCE · pick the iterable"
        options={PROTOCOL_SOURCES}
        valueId={sourceId}
        onChange={(id) => {
          setSourceId(id);
          dispatch({ type: "newSource" });
        }}
      />

      {/* iter(x) is x — the lens */}
      <div
        style={{
          marginTop: 12,
          marginBottom: 14,
          padding: "10px 14px",
          borderRadius: 12,
          border: `1px solid ${source.iterIsSelf ? "rgba(252,211,77,0.35)" : DS.border}`,
          background: source.iterIsSelf ? "rgba(252,211,77,0.06)" : "rgba(255,255,255,0.015)",
          display: "flex",
          gap: 14,
          alignItems: "center",
          flexWrap: "wrap",
          fontFamily: "var(--ds-mono), monospace",
          fontSize: 12,
        }}
      >
        <div style={{ color: DS.dim, fontSize: 9, letterSpacing: 1.4, fontWeight: 700 }}>LENS</div>
        <div style={{ color: DS.t2 }}>
          <span style={{ color: DS.t1 }}>iter({source.py})</span>
          <span style={{ color: DS.dim }}> is </span>
          <span style={{ color: DS.t1 }}>{source.py}</span>
          <span style={{ color: DS.dim }}> → </span>
          <span style={{ color: source.iterIsSelf ? "#FCD34D" : DS.grn, fontWeight: 700 }}>
            {source.iterIsSelf ? "True" : "False"}
          </span>
        </div>
        <div style={{ color: source.iterIsSelf ? "#FCD34D" : DS.grn, fontSize: 11, fontWeight: 600 }}>
          {source.iterIsSelf ? "iterator (one-shot)" : "iterable (fresh cursor each time)"}
        </div>
      </div>

      {/* Source array with cursor */}
      <SectionFrame title="SOURCE · cursor position">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 6 }}>
          {source.items.map((item, i) => {
            const consumed = i < state.cursor;
            const atCursor = i === state.cursor && !state.exhausted;
            return (
              <CellSlot
                key={i}
                label={String(item)}
                state={consumed ? "consumed" : atCursor ? "cursor" : "pending"}
              />
            );
          })}
          <StopSlot exhausted={state.cursor >= source.items.length} />
        </div>
        <div style={{ marginTop: 12, fontSize: 10, color: DS.dim, fontFamily: "var(--ds-mono), monospace", lineHeight: 1.6 }}>
          # {source.bodyDoc}
        </div>
      </SectionFrame>

      {/* Controls */}
      <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
        <ActionButton
          label={state.exhausted ? "next()  // raises again" : "next(it)"}
          tone={state.exhausted ? "danger" : "primary"}
          onClick={() => dispatch({ type: "next", source })}
        />
        <ActionButton label="iter(source)  // fresh cursor" tone="ghost" onClick={() => dispatch({ type: "reset" })} />
        <ActionButton
          label="advance to end"
          tone="ghost"
          onClick={() => {
            for (let i = state.cursor; i <= source.items.length; i++) {
              dispatch({ type: "next", source });
            }
          }}
        />
      </div>

      {/* Yielded tray + state log */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 14 }}>
        <SectionFrame title="YIELDED · what next() has returned" tone={state.yielded.length ? "ok" : "neutral"}>
          {state.yielded.length === 0 ? (
            <div style={{ marginTop: 6, fontSize: 12, color: DS.dim, fontFamily: "var(--ds-mono), monospace" }}>
              (empty — call next() to consume)
            </div>
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
              {state.yielded.map((v, i) => (
                <CellSlot key={i} label={String(v)} state="yielded" />
              ))}
            </div>
          )}
        </SectionFrame>

        <SectionFrame title="LAST EVENT" tone={state.exhausted ? "danger" : "neutral"}>
          <div style={{ marginTop: 6, fontSize: 12, color: state.exhausted ? "#FCA5A5" : DS.t2, fontFamily: "var(--ds-mono), monospace", lineHeight: 1.6 }}>
            {state.lastEvent}
          </div>
          <div style={{ marginTop: 8, fontSize: 10, color: DS.dim, fontFamily: "var(--ds-mono), monospace", lineHeight: 1.6 }}>
            # {source.note}
          </div>
        </SectionFrame>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Mode 2 — Lazy Pipeline: filter → map → take, pulled by hand.
// ──────────────────────────────────────────────────────────────

const PIPELINE_SOURCE = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5, 8, 9, 7, 9, 3];

const FILTERS = [
  { id: "all", label: "x", py: "lambda x: True", test: () => true, doc: "passes everything (no filter)" },
  { id: "gt3", label: "x > 3", py: "lambda x: x > 3", test: (x) => x > 3, doc: "keeps strictly greater than 3" },
  { id: "even", label: "x % 2 == 0", py: "lambda x: x % 2 == 0", test: (x) => x % 2 === 0, doc: "keeps even numbers only" },
  { id: "odd", label: "x % 2 == 1", py: "lambda x: x % 2 == 1", test: (x) => x % 2 === 1, doc: "keeps odd numbers only" },
];

const MAPS = [
  { id: "id", label: "x", py: "lambda x: x", apply: (x) => x, doc: "identity (no transform)" },
  { id: "sq", label: "x * x", py: "lambda x: x * x", apply: (x) => x * x, doc: "square the value" },
  { id: "neg", label: "-x", py: "lambda x: -x", apply: (x) => -x, doc: "negate the value" },
  { id: "x10", label: "x * 10", py: "lambda x: x * 10", apply: (x) => x * 10, doc: "scale by ten" },
];

const TAKES = [3, 5, 8];

/** Walk the pipeline lazily, one source item per "tick". Returns events: each event
 *  represents the journey of ONE source item (filtered out, or transformed and either
 *  taken or stopping the pull). */
function buildLazyEvents({ source, filterFn, mapFn, take }) {
  const events = [];
  let taken = 0;
  for (let i = 0; i < source.length; i++) {
    if (taken >= take) break;
    const x = source[i];
    if (!filterFn(x)) {
      events.push({ kind: "drop", srcIndex: i, x });
      continue;
    }
    const mapped = mapFn(x);
    taken += 1;
    events.push({ kind: "yield", srcIndex: i, x, mapped, takenAfter: taken });
  }
  return events;
}

function PipelineMode() {
  const [filterId, setFilterId] = useState("gt3");
  const [mapId, setMapId] = useState("sq");
  const [takeN, setTakeN] = useState(3);
  const [tick, setTick] = useState(0);
  const [eager, setEager] = useState(false);

  const filter = FILTERS.find((f) => f.id === filterId);
  const mapper = MAPS.find((m) => m.id === mapId);

  const events = useMemo(
    () => buildLazyEvents({ source: PIPELINE_SOURCE, filterFn: filter.test, mapFn: mapper.apply, take: takeN }),
    [filter, mapper, takeN],
  );

  const visible = events.slice(0, tick);
  const lastEvent = visible[visible.length - 1] ?? null;
  const consumedSrc = visible.length > 0 ? Math.max(...visible.map((e) => e.srcIndex)) + 1 : 0;
  const yieldedCount = visible.filter((e) => e.kind === "yield").length;
  const droppedCount = visible.filter((e) => e.kind === "drop").length;
  const finished = tick >= events.length;

  // Eager memory snapshot: list comprehension materializes filter pass first.
  const eagerFiltered = useMemo(() => PIPELINE_SOURCE.filter(filter.test), [filter]);
  const eagerMapped = useMemo(() => eagerFiltered.map(mapper.apply), [eagerFiltered, mapper]);
  const eagerTaken = eagerMapped.slice(0, takeN);

  function reset(updater) {
    setTick(0);
    if (updater) updater();
  }

  return (
    <div>
      {/* Pipeline configurator */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 14 }}>
        <StagePicker
          label="STAGE 1 · filter"
          options={FILTERS}
          valueId={filterId}
          onChange={(id) => reset(() => setFilterId(id))}
          accent="#FCA5A5"
        />
        <StagePicker
          label="STAGE 2 · map"
          options={MAPS}
          valueId={mapId}
          onChange={(id) => reset(() => setMapId(id))}
          accent="#7DD3FC"
        />
        <NumberPicker
          label="STAGE 3 · take(n)"
          options={TAKES}
          value={takeN}
          onChange={(n) => reset(() => setTakeN(n))}
          accent="#FCD34D"
        />
      </div>

      {/* Compiled code echo */}
      <SectionFrame title="EQUIVALENT PYTHON" tone="neutral">
        <pre style={{ ...codeStyle, marginTop: 6 }}>
{eager
? `# eager — list comprehensions
filtered = [x for x in source if ${filter.py.replace("lambda x: ", "")}]      # all ${eagerFiltered.length} items
mapped   = [${mapper.py.replace("lambda x: ", "").replace(/x/g, "y")} for y in filtered]    # all ${eagerMapped.length} items
out      = mapped[:${takeN}]`
: `# lazy — generator pipeline
filtered = (x for x in source if ${filter.py.replace("lambda x: ", "")})
mapped   = (${mapper.py.replace("lambda x: ", "").replace(/x/g, "y")} for y in filtered)
out      = list(islice(mapped, ${takeN}))`}
        </pre>
        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
          <ActionButton
            label={eager ? "▣  eager mode (materialize lists)" : "▢  eager mode (materialize lists)"}
            tone="ghost"
            onClick={() => reset(() => setEager((e) => !e))}
          />
        </div>
      </SectionFrame>

      {/* Source row */}
      <SectionFrame title="SOURCE · 16 ints" tone="neutral">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
          {PIPELINE_SOURCE.map((x, i) => {
            if (eager) {
              return <CellSlot key={i} label={String(x)} state="consumed" small />;
            }
            const ev = visible.find((e) => e.srcIndex === i);
            const cursor = i === consumedSrc && !finished;
            const state = ev ? (ev.kind === "drop" ? "dropped" : "yielded") : cursor ? "cursor" : "pending";
            return <CellSlot key={i} label={String(x)} state={state} small />;
          })}
        </div>
      </SectionFrame>

      {/* Pipeline animation */}
      {eager ? (
        <EagerPipeline
          source={PIPELINE_SOURCE}
          filtered={eagerFiltered}
          mapped={eagerMapped}
          taken={eagerTaken}
          filter={filter}
          mapper={mapper}
          takeN={takeN}
        />
      ) : (
        <LazyPipeline
          events={events}
          visible={visible}
          lastEvent={lastEvent}
          finished={finished}
          tick={tick}
          totalYielded={yieldedCount}
          totalDropped={droppedCount}
          filter={filter}
          mapper={mapper}
          takeN={takeN}
        />
      )}

      {/* Controls */}
      {!eager && (
        <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
          <ActionButton
            label={finished ? "stream exhausted" : "pull next  ·  next(pipeline)"}
            tone={finished ? "danger" : "primary"}
            onClick={() => !finished && setTick((t) => t + 1)}
          />
          <ActionButton label="reset  ·  rebuild generator" tone="ghost" onClick={() => setTick(0)} />
          <ActionButton
            label="run to completion"
            tone="ghost"
            onClick={() => setTick(events.length)}
          />
        </div>
      )}

      {/* Memory bookkeeping */}
      <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <SectionFrame title="MEMORY IN FLIGHT" tone={eager ? "danger" : "ok"}>
          <div style={{ marginTop: 6, fontSize: 12, color: DS.t2, fontFamily: "var(--ds-mono), monospace", lineHeight: 1.7 }}>
            {eager ? (
              <>
                <div>filtered list&nbsp;·&nbsp;<span style={{ color: "#FCA5A5", fontWeight: 700 }}>{eagerFiltered.length}</span> items materialized</div>
                <div>mapped list&nbsp;&nbsp;&nbsp;·&nbsp;<span style={{ color: "#FCA5A5", fontWeight: 700 }}>{eagerMapped.length}</span> items materialized</div>
                <div>output slice&nbsp;·&nbsp;<span style={{ color: DS.grn, fontWeight: 700 }}>{eagerTaken.length}</span> items kept</div>
                <div style={{ marginTop: 8, color: "#FCA5A5", fontSize: 11 }}>
                  total in RAM at peak ≈ <b>{eagerFiltered.length + eagerMapped.length + eagerTaken.length}</b>
                </div>
              </>
            ) : (
              <>
                <div>filter buffer&nbsp;·&nbsp;<span style={{ color: DS.grn, fontWeight: 700 }}>1</span> item (current)</div>
                <div>map buffer&nbsp;&nbsp;&nbsp;&nbsp;·&nbsp;<span style={{ color: DS.grn, fontWeight: 700 }}>1</span> item (current)</div>
                <div>take buffer&nbsp;&nbsp;&nbsp;·&nbsp;<span style={{ color: DS.grn, fontWeight: 700 }}>{Math.min(yieldedCount, takeN)}</span> / {takeN} yielded</div>
                <div style={{ marginTop: 8, color: DS.grn, fontSize: 11 }}>
                  total in RAM at peak ≈ <b>{Math.min(yieldedCount, takeN) + 2}</b> (output + 2 stage buffers)
                </div>
              </>
            )}
          </div>
        </SectionFrame>

        <SectionFrame title="OUTPUT" tone={(eager ? eagerTaken.length : yieldedCount) > 0 ? "ok" : "neutral"}>
          {(eager ? eagerTaken : visible.filter((e) => e.kind === "yield").map((e) => e.mapped)).length === 0 ? (
            <div style={{ marginTop: 6, fontSize: 12, color: DS.dim, fontFamily: "var(--ds-mono), monospace" }}>
              (empty — pull values to populate)
            </div>
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
              {(eager ? eagerTaken : visible.filter((e) => e.kind === "yield").map((e) => e.mapped)).map((v, i) => (
                <CellSlot key={i} label={String(v)} state="yielded" />
              ))}
            </div>
          )}
        </SectionFrame>
      </div>
    </div>
  );
}

function LazyPipeline({ events, visible, lastEvent, finished, tick, totalYielded, totalDropped, filter, mapper, takeN }) {
  // Highlight the value moving through each stage on the most recent tick.
  const inFlight = lastEvent ? { x: lastEvent.x, mapped: lastEvent.mapped, dropped: lastEvent.kind === "drop" } : null;

  return (
    <div style={{ marginTop: 14 }}>
      <SectionFrame title="LAZY PIPELINE · one item at a time" tone="neutral">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 8 }}>
          <StageBox
            label="filter"
            doc={filter.doc}
            accent="#FCA5A5"
            inFlightLabel={inFlight ? String(inFlight.x) : null}
            inFlightTone={inFlight ? (inFlight.dropped ? "drop" : "pass") : "idle"}
            tally={`${totalDropped} dropped`}
          />
          <StageBox
            label="map"
            doc={mapper.doc}
            accent="#7DD3FC"
            inFlightLabel={inFlight && !inFlight.dropped ? String(inFlight.mapped) : null}
            inFlightTone={inFlight && !inFlight.dropped ? "transform" : "idle"}
            tally={`${totalYielded} transformed`}
          />
          <StageBox
            label={`take(${takeN})`}
            doc="early-exit gate — stops pulling once N produced"
            accent="#FCD34D"
            inFlightLabel={inFlight && !inFlight.dropped ? String(inFlight.mapped) : null}
            inFlightTone={inFlight && !inFlight.dropped ? "yield" : "idle"}
            tally={`${Math.min(totalYielded, takeN)} / ${takeN}`}
          />
        </div>

        <div style={{ marginTop: 12, fontSize: 11, color: DS.dim, fontFamily: "var(--ds-mono), monospace", lineHeight: 1.7 }}>
          {finished ? (
            <span style={{ color: DS.grn }}>
              # done — pulled {tick} item{tick === 1 ? "" : "s"} from source · stream stopped early after take({takeN}) hit
            </span>
          ) : tick === 0 ? (
            <span># pipeline ready — body has not run; press &quot;pull next&quot; to start</span>
          ) : lastEvent?.kind === "drop" ? (
            <span style={{ color: "#FCA5A5" }}>
              # filter rejected x={lastEvent.x} → no map call, no take increment, source advances
            </span>
          ) : (
            <span style={{ color: DS.grn }}>
              # x={lastEvent.x} passed filter → map produced {lastEvent.mapped} → take({takeN}) at {lastEvent.takenAfter}/{takeN}
            </span>
          )}
        </div>
      </SectionFrame>

      <ProtocolLog events={events} visible={visible} takeN={takeN} />
    </div>
  );
}

function EagerPipeline({ source, filtered, mapped, taken, filter, mapper, takeN }) {
  return (
    <div style={{ marginTop: 14 }}>
      <SectionFrame title="EAGER PIPELINE · materialize, then slice" tone="danger">
        <div style={{ marginTop: 6, fontSize: 11, color: "#FCA5A5", fontFamily: "var(--ds-mono), monospace", lineHeight: 1.6 }}>
          # the comprehension form runs each stage <b>to completion</b> before the next begins.
        </div>
        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
          <ListRow label={`[${filter.py.replace("lambda x: ", "")}]`} accent="#FCA5A5" items={filtered} note={`filtered list — ${filtered.length} items in RAM`} />
          <ListRow label={`[${mapper.py.replace("lambda x: ", "").replace(/x/g, "y")}]`} accent="#7DD3FC" items={mapped} note={`mapped list — another ${mapped.length} items in RAM`} />
          <ListRow label={`[: ${takeN}]`} accent="#FCD34D" items={taken} note={`final slice — ${taken.length} items kept; the others were built and discarded`} />
        </div>
      </SectionFrame>
      <div style={{ marginTop: 10, padding: "10px 14px", borderRadius: 12, border: `1px solid ${DS.border}`, fontSize: 11, color: DS.t3, fontFamily: "var(--ds-mono), monospace", lineHeight: 1.7 }}>
        <span style={{ color: DS.dim }}># </span>
        For 16 source ints the cost looks small. Replace <span style={{ color: DS.t1 }}>source</span> with <span style={{ color: DS.t1 }}>open(&quot;app.log&quot;)</span> and the eager version is the difference between
        a 50&nbsp;GB list and a constant-memory stream. <span style={{ color: DS.grn }}>Lazy</span> mode never materializes more than one item per stage.
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Pieces.
// ──────────────────────────────────────────────────────────────

function ProtocolLog({ events, visible, takeN }) {
  return (
    <div style={{ marginTop: 14 }}>
      <SectionFrame title="next() LOG · one row per pull" tone="neutral">
        {visible.length === 0 ? (
          <div style={{ marginTop: 6, fontSize: 12, color: DS.dim, fontFamily: "var(--ds-mono), monospace" }}>
            (no pulls yet)
          </div>
        ) : (
          <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
            {visible.map((ev, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "6px 10px",
                  borderRadius: 8,
                  border: `1px solid ${ev.kind === "yield" ? "rgba(52,211,153,0.25)" : "rgba(248,113,113,0.20)"}`,
                  background: ev.kind === "yield" ? "rgba(52,211,153,0.06)" : "rgba(248,113,113,0.05)",
                  fontFamily: "var(--ds-mono), monospace",
                  fontSize: 11,
                  color: DS.t2,
                }}
              >
                <span style={{ color: DS.dim, width: 28 }}>#{i + 1}</span>
                <span style={{ color: DS.t1, fontWeight: 700 }}>x = {ev.x}</span>
                <span style={{ color: DS.dim }}>→</span>
                {ev.kind === "drop" ? (
                  <span style={{ color: "#FCA5A5" }}>filter rejected</span>
                ) : (
                  <>
                    <span style={{ color: "#7DD3FC" }}>map = {ev.mapped}</span>
                    <span style={{ color: DS.dim }}>→</span>
                    <span style={{ color: "#FCD34D", fontWeight: 700 }}>take {ev.takenAfter}/{takeN}</span>
                  </>
                )}
              </div>
            ))}
            {visible.length === events.length && (
              <div style={{ marginTop: 4, fontSize: 11, color: DS.grn, fontFamily: "var(--ds-mono), monospace" }}>
                # take({takeN}) reached → islice raised StopIteration → outer for loop exits cleanly
              </div>
            )}
          </div>
        )}
      </SectionFrame>
    </div>
  );
}

function StageBox({ label, doc, accent, inFlightLabel, inFlightTone, tally }) {
  const toneBg = {
    pass: "rgba(52,211,153,0.10)",
    drop: "rgba(248,113,113,0.10)",
    transform: "rgba(125,211,252,0.10)",
    yield: "rgba(252,211,77,0.12)",
    idle: "transparent",
  }[inFlightTone];
  const toneFg = {
    pass: DS.grn,
    drop: "#FCA5A5",
    transform: "#7DD3FC",
    yield: "#FCD34D",
    idle: DS.dim,
  }[inFlightTone];

  return (
    <div
      style={{
        padding: "10px 12px",
        borderRadius: 12,
        border: `1px solid ${accent}33`,
        background: "rgba(255,255,255,0.015)",
      }}
    >
      <div style={{ fontSize: 9, letterSpacing: 1.4, fontWeight: 700, color: accent }}>{label.toUpperCase()}</div>
      <div style={{ marginTop: 8, padding: "10px 8px", borderRadius: 10, border: `1px dashed ${accent}40`, background: toneBg, minHeight: 48, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {inFlightLabel ? (
          <span style={{ fontFamily: "var(--ds-mono), monospace", fontSize: 16, fontWeight: 800, color: toneFg }}>
            {inFlightLabel}
          </span>
        ) : (
          <span style={{ fontFamily: "var(--ds-mono), monospace", fontSize: 11, color: DS.dim }}>idle</span>
        )}
      </div>
      <div style={{ marginTop: 6, fontSize: 10, color: DS.dim, fontFamily: "var(--ds-mono), monospace" }}>{doc}</div>
      <div style={{ marginTop: 4, fontSize: 10, color: accent, fontFamily: "var(--ds-mono), monospace" }}>{tally}</div>
    </div>
  );
}

function ListRow({ label, accent, items, note }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
        <span style={{ fontFamily: "var(--ds-mono), monospace", fontSize: 11, color: accent, fontWeight: 700 }}>{label}</span>
        <span style={{ fontFamily: "var(--ds-mono), monospace", fontSize: 10, color: DS.dim }}>{note}</span>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {items.length === 0 ? (
          <span style={{ fontSize: 11, color: DS.dim, fontFamily: "var(--ds-mono), monospace" }}>(empty)</span>
        ) : (
          items.map((v, i) => <CellSlot key={i} label={String(v)} state="materialized" small />)
        )}
      </div>
    </div>
  );
}

function CellSlot({ label, state, small }) {
  const palette = {
    pending: { bg: "rgba(255,255,255,0.02)", border: DS.border, color: DS.dim },
    cursor: { bg: "rgba(99,102,241,0.18)", border: DS.ind, color: DS.t1 },
    consumed: { bg: "rgba(255,255,255,0.04)", border: DS.border, color: DS.dim },
    yielded: { bg: "rgba(52,211,153,0.14)", border: DS.grn, color: DS.t1 },
    dropped: { bg: "rgba(248,113,113,0.12)", border: "rgba(248,113,113,0.45)", color: "#FCA5A5" },
    materialized: { bg: "rgba(252,211,77,0.10)", border: "rgba(252,211,77,0.40)", color: "#FDE68A" },
  }[state] ?? { bg: "rgba(255,255,255,0.02)", border: DS.border, color: DS.t3 };
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth: small ? 30 : 40,
        height: small ? 26 : 32,
        padding: "0 8px",
        borderRadius: 8,
        border: `1px solid ${palette.border}`,
        background: palette.bg,
        color: palette.color,
        fontFamily: "var(--ds-mono), monospace",
        fontSize: small ? 11 : 13,
        fontWeight: state === "yielded" || state === "cursor" ? 700 : 500,
      }}
    >
      {label}
    </span>
  );
}

function StopSlot({ exhausted }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 10px",
        height: 32,
        borderRadius: 8,
        border: `1px dashed ${exhausted ? "rgba(248,113,113,0.5)" : DS.border}`,
        background: exhausted ? "rgba(248,113,113,0.10)" : "transparent",
        color: exhausted ? "#FCA5A5" : DS.dim,
        fontFamily: "var(--ds-mono), monospace",
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: 0.5,
      }}
    >
      {exhausted ? "▲ StopIteration" : "│ end"}
    </span>
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
        marginBottom: 8,
      }}
    >
      <div style={{ fontSize: 9, letterSpacing: 1.4, color: DS.dim, fontFamily: "var(--ds-mono), monospace", fontWeight: 700 }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function SourcePicker({ label, options, valueId, onChange }) {
  return (
    <div
      style={{
        padding: "12px 14px",
        borderRadius: 14,
        border: `1px solid ${DS.border}`,
        background: "rgba(255,255,255,0.015)",
      }}
    >
      <div style={{ fontSize: 9, letterSpacing: 1.4, color: DS.dim, fontFamily: "var(--ds-mono), monospace", fontWeight: 700 }}>
        {label}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => onChange(o.id)}
            style={{
              padding: "6px 10px",
              borderRadius: 8,
              border: `1px solid ${valueId === o.id ? DS.ind : DS.border}`,
              background: valueId === o.id ? `${DS.ind}1e` : "rgba(255,255,255,0.02)",
              color: valueId === o.id ? DS.t1 : DS.t2,
              fontSize: 11,
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

function NumberPicker({ label, options, value, onChange, accent }) {
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
      <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
        {options.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            style={{
              padding: "5px 12px",
              borderRadius: 7,
              border: `1px solid ${value === n ? accent : DS.border}`,
              background: value === n ? `${accent}1c` : "rgba(255,255,255,0.02)",
              color: value === n ? DS.t1 : DS.t3,
              fontSize: 11,
              fontFamily: "var(--ds-mono), monospace",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {n}
          </button>
        ))}
      </div>
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

export default function IteratorEngine() {
  const [mode, setMode] = useState("protocol");
  return (
    <div style={{ fontFamily: "var(--ds-sans), sans-serif" }}>
      <div style={{ fontSize: 17, fontWeight: 700, color: DS.t1, marginBottom: 4 }}>
        The iterator engine
      </div>
      <p style={{ fontSize: 12, color: DS.t3, fontFamily: "var(--ds-mono), monospace", lineHeight: 1.6, marginBottom: 14 }}>
        Every <span style={{ color: DS.t1 }}>for</span> loop is just <span style={{ color: DS.t1 }}>iter()</span> + repeated <span style={{ color: DS.t1 }}>next()</span>.
        Click <span style={{ color: DS.grn }}>one tick at a time</span> to see the protocol — and how <span style={{ color: "#FCD34D" }}>laziness</span> keeps memory flat.
      </p>

      <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
        <ModeTab active={mode === "protocol"} onClick={() => setMode("protocol")} label="1 · iterator protocol" hint="__iter__ / __next__ / StopIteration" />
        <ModeTab active={mode === "pipeline"} onClick={() => setMode("pipeline")} label="2 · lazy pipeline" hint="filter → map → take, one item at a time" />
      </div>

      {mode === "protocol" ? <ProtocolMode /> : <PipelineMode />}
    </div>
  );
}
