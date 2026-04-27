import { Fragment, useMemo, useState } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

/**
 * HashLab — a two-mode, interactive dictionaries & sets lab.
 *
 *   Mode 1  "Buckets"     — type a key, watch it get hashed to an 8-slot
 *                           table. Shows collisions resolved by open-addressing
 *                           probes, demonstrates why unhashable types fail,
 *                           and keeps a live event log.
 *   Mode 2  "Algebra"     — two overlapping sets, one-click union /
 *                           intersection / difference / sym diff, each
 *                           highlighted in-place so learners *see* the rule
 *                           without the Venn-diagram cliché.
 *
 * Scope: py-b4 — Dictionaries & Sets. Designed to be distinctly different
 * from other vizzes in the app (no charts, no sliders; it teaches by
 * routing + highlighting).
 */

// ──────────────────────────────────────────────────────────────
// Toy hash (deterministic FNV-1a on a string)
// ──────────────────────────────────────────────────────────────
const TABLE_SIZE = 8;

function toyHash(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

const SLOT_COLORS = ["#F472B6", "#A78BFA", "#60A5FA", "#34D399", "#FACC15", "#FB923C", "#F87171", "#22D3EE"];

// ──────────────────────────────────────────────────────────────
// UI atoms
// ──────────────────────────────────────────────────────────────

function SectionTitle({ children }) {
  return (
    <div style={{ fontSize: 9, letterSpacing: 1.4, color: DS.dim, fontFamily: "var(--ds-mono), monospace", fontWeight: 700 }}>
      {children}
    </div>
  );
}

function Button({ onClick, children, variant = "ghost", disabled }) {
  const base = {
    padding: "8px 14px",
    borderRadius: 8,
    fontSize: 12,
    fontFamily: "var(--ds-mono), monospace",
    fontWeight: 700,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.45 : 1,
    transition: "all .12s",
  };
  const styles = {
    primary: { ...base, background: DS.indB, border: "none", color: "#fff", boxShadow: DS.shadowCta },
    ghost: { ...base, background: "rgba(255,255,255,0.03)", border: `1px solid ${DS.border}`, color: DS.t1 },
    danger: { ...base, background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.35)", color: "#FCA5A5" },
  };
  return (
    <button type="button" onClick={onClick} disabled={disabled} style={styles[variant]}>
      {children}
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

// ──────────────────────────────────────────────────────────────
// MODE 1 — Buckets
// ──────────────────────────────────────────────────────────────

function BucketsMode() {
  const [isSet, setIsSet] = useState(false); // dict (false) | set (true)
  // slots: array of { key, value, homeIdx, probes } | null
  const [slots, setSlots] = useState(() => Array(TABLE_SIZE).fill(null));
  const [keyInput, setKeyInput] = useState("apple");
  const [valueInput, setValueInput] = useState("red");
  const [log, setLog] = useState([
    { kind: "note", text: "Type a key and click insert. Watch the hash → slot → probe dance." },
  ]);
  const [lastTouched, setLastTouched] = useState(-1);
  const [lastPreviewHash, setLastPreviewHash] = useState(null);

  const preview = useMemo(() => {
    if (!keyInput) return null;
    const h = toyHash(keyInput);
    return { hash: h, slot: h % TABLE_SIZE };
  }, [keyInput]);

  const pushLog = (entry) => setLog((prev) => [entry, ...prev].slice(0, 12));

  // Open-addressing probe — linear probing for clarity.
  const findSlotForKey = (key) => {
    const home = toyHash(key) % TABLE_SIZE;
    for (let i = 0; i < TABLE_SIZE; i++) {
      const idx = (home + i) % TABLE_SIZE;
      const cell = slots[idx];
      if (cell == null) return { idx, home, probes: i, existing: false };
      if (cell.key === key) return { idx, home, probes: i, existing: true };
    }
    return { idx: -1, home, probes: TABLE_SIZE, existing: false };
  };

  const insert = () => {
    const key = keyInput.trim();
    if (!key) {
      pushLog({ kind: "warn", text: "empty key — nothing to insert" });
      return;
    }
    // simulate "unhashable" demo when user types the literal `[1, 2]`
    if (/^\[.*\]$/.test(key) || /^\{.*:.*\}$/.test(key)) {
      pushLog({ kind: "error", text: `TypeError: unhashable type — mutable containers can't be keys (${key})` });
      setLastPreviewHash(null);
      return;
    }
    const { idx, home, probes, existing } = findSlotForKey(key);
    if (idx < 0) {
      pushLog({ kind: "error", text: "table full — in CPython this would trigger a resize & rehash" });
      return;
    }
    const next = slots.slice();
    next[idx] = { key, value: isSet ? null : valueInput, homeIdx: home, probes };
    setSlots(next);
    setLastTouched(idx);
    setLastPreviewHash({ hash: toyHash(key), slot: home, landed: idx });
    pushLog({
      kind: existing ? "update" : "insert",
      text: existing
        ? `update · key ${JSON.stringify(key)} re-seats at slot ${idx}${isSet ? "" : ` with value ${JSON.stringify(valueInput)}`}`
        : `insert · hash(${JSON.stringify(key)}) % ${TABLE_SIZE} = ${home}${probes ? ` → probed ${probes} step${probes > 1 ? "s" : ""} → slot ${idx}` : ` → slot ${idx}`}`,
    });
  };

  const lookup = () => {
    const key = keyInput.trim();
    if (!key) return;
    const { idx, home, probes, existing } = findSlotForKey(key);
    if (existing) {
      setLastTouched(idx);
      setLastPreviewHash({ hash: toyHash(key), slot: home, landed: idx });
      const cell = slots[idx];
      pushLog({
        kind: "lookup",
        text: `lookup · ${JSON.stringify(key)} found at slot ${idx} in ${probes + 1} step${probes ? "s (probed past ≠ keys)" : ""} · value ${isSet ? "—" : JSON.stringify(cell.value)}`,
      });
    } else {
      setLastTouched(-1);
      setLastPreviewHash({ hash: toyHash(key), slot: home, landed: null });
      pushLog({
        kind: "miss",
        text: `miss · ${JSON.stringify(key)} hashes to slot ${home}; probed ${probes} step${probes === 1 ? "" : "s"} and hit an empty — KeyError.`,
      });
    }
  };

  const remove = () => {
    const key = keyInput.trim();
    if (!key) return;
    const { idx, existing } = findSlotForKey(key);
    if (!existing) {
      pushLog({ kind: "miss", text: `del · ${JSON.stringify(key)} not in table — KeyError in real Python` });
      return;
    }
    const next = slots.slice();
    next[idx] = null;
    setSlots(next);
    setLastTouched(idx);
    pushLog({
      kind: "delete",
      text: `del · removed ${JSON.stringify(key)} from slot ${idx} (CPython leaves a tombstone so later probes still work)`,
    });
  };

  const reset = () => {
    setSlots(Array(TABLE_SIZE).fill(null));
    setLastTouched(-1);
    setLastPreviewHash(null);
    setLog([{ kind: "note", text: "cleared — reset table to 8 empty slots." }]);
  };

  const seedCollision = () => {
    // Seed with keys that will probe, to demonstrate collisions.
    const demo = [
      ["cat", "meow"],
      ["tac", "flip"],
      ["act", "do"],
      ["atc", "hmm"],
    ];
    let next = Array(TABLE_SIZE).fill(null);
    const events = [];
    for (const [k, v] of demo) {
      const home = toyHash(k) % TABLE_SIZE;
      let probes = 0;
      let idx = home;
      while (next[idx] != null && next[idx].key !== k) {
        probes += 1;
        idx = (home + probes) % TABLE_SIZE;
        if (probes >= TABLE_SIZE) break;
      }
      next[idx] = { key: k, value: v, homeIdx: home, probes };
      events.push(`seed · ${JSON.stringify(k)} → home ${home}${probes ? ` → ${probes} probe${probes > 1 ? "s" : ""} → slot ${idx}` : ""}`);
    }
    setSlots(next);
    setLog((prev) => [
      { kind: "note", text: "seeded 4 anagram keys — look for probing on collisions" },
      ...events.reverse().map((t) => ({ kind: "insert", text: t })),
      ...prev,
    ].slice(0, 16));
  };

  const dictRepr = isSet
    ? `{${slots.filter(Boolean).map((c) => JSON.stringify(c.key)).join(", ")}}`
    : `{${slots.filter(Boolean).map((c) => `${JSON.stringify(c.key)}: ${JSON.stringify(c.value)}`).join(", ")}}`;

  return (
    <div>
      {/* Toggle & input bar */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12, marginBottom: 14 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <ToggleTag active={!isSet} onClick={() => setIsSet(false)}>dict</ToggleTag>
          <ToggleTag active={isSet} onClick={() => setIsSet(true)}>set</ToggleTag>
          <div style={{ flex: 1 }} />
          <Button variant="ghost" onClick={seedCollision}>Seed collisions</Button>
          <Button variant="ghost" onClick={reset}>Reset</Button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: isSet ? "1fr auto" : "1fr 1fr auto", gap: 8 }}>
          <LabeledInput label="key" value={keyInput} onChange={setKeyInput} placeholder="apple" />
          {!isSet && <LabeledInput label="value" value={valueInput} onChange={setValueInput} placeholder="red" />}
          <div style={{ display: "flex", gap: 6, alignItems: "flex-end" }}>
            <Button variant="primary" onClick={insert}>{isSet ? "add" : "insert"}</Button>
            <Button onClick={lookup}>look up</Button>
            <Button variant="danger" onClick={remove}>del</Button>
          </div>
        </div>

        <div style={{ fontSize: 11, color: DS.t3, fontFamily: "var(--ds-mono), monospace", lineHeight: 1.55 }}>
          <span style={{ color: DS.dim }}>preview · </span>
          {preview ? (
            <>
              <span style={{ color: DS.t2 }}>hash({JSON.stringify(keyInput)}) = </span>
              <span style={{ color: DS.ind }}>{preview.hash.toString(16)}</span>
              <span style={{ color: DS.t2 }}> → % {TABLE_SIZE} → </span>
              <span style={{ color: DS.grn }}>slot {preview.slot}</span>
            </>
          ) : (
            <span>type a key</span>
          )}
          <span style={{ color: DS.dim, marginLeft: 14 }}>
            try <kbd style={kbdStyle}>[1, 2]</kbd> as a key to see why lists aren&apos;t hashable
          </span>
        </div>
      </div>

      {/* Hash table grid */}
      <div
        style={{
          padding: 14,
          borderRadius: 14,
          border: `1px solid ${DS.border}`,
          background: "linear-gradient(180deg, rgba(99,102,241,0.06), rgba(6,8,20,0.35))",
        }}
      >
        <SectionTitle>HASH TABLE · 8 SLOTS (TOY)</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${TABLE_SIZE}, 1fr)`, gap: 8, marginTop: 12 }}>
          {slots.map((cell, i) => {
            const isPreviewHome = lastPreviewHash && lastPreviewHash.slot === i;
            const isLanded = lastPreviewHash && lastPreviewHash.landed === i;
            const isTouched = lastTouched === i;
            const probed = cell && cell.probes > 0 && cell.homeIdx !== i;
            const slotColor = SLOT_COLORS[i];
            return (
              <div
                key={i}
                style={{
                  position: "relative",
                  minHeight: 88,
                  padding: "8px 8px 10px",
                  borderRadius: 10,
                  border: `1px solid ${
                    isLanded
                      ? DS.grn
                      : isTouched
                        ? `${slotColor}aa`
                        : isPreviewHome
                          ? `${DS.ind}aa`
                          : cell
                            ? `${slotColor}40`
                            : DS.border
                  }`,
                  background: cell ? `${slotColor}12` : "rgba(255,255,255,0.015)",
                  transition: "border-color .15s, background .15s",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    fontSize: 9,
                    letterSpacing: 1.1,
                    color: slotColor,
                    fontFamily: "var(--ds-mono), monospace",
                    fontWeight: 700,
                  }}
                >
                  slot {i}
                </div>
                {cell ? (
                  <div style={{ marginTop: 6 }}>
                    <div
                      style={{
                        fontFamily: "var(--ds-mono), monospace",
                        fontSize: 12,
                        color: DS.t1,
                        fontWeight: 700,
                        wordBreak: "break-all",
                      }}
                    >
                      {cell.key}
                    </div>
                    {!isSet && cell.value != null && (
                      <div
                        style={{
                          marginTop: 3,
                          fontFamily: "var(--ds-mono), monospace",
                          fontSize: 11,
                          color: DS.t3,
                          wordBreak: "break-all",
                        }}
                      >
                        → {cell.value}
                      </div>
                    )}
                    {probed && (
                      <div
                        style={{
                          marginTop: 6,
                          fontSize: 9,
                          letterSpacing: 0.8,
                          color: "#FCD34D",
                          fontFamily: "var(--ds-mono), monospace",
                        }}
                        title={`home was slot ${cell.homeIdx}, probed ${cell.probes}`}
                      >
                        probed ←{cell.homeIdx}
                      </div>
                    )}
                  </div>
                ) : (
                  <div
                    style={{
                      marginTop: 24,
                      textAlign: "center",
                      color: DS.dim,
                      fontSize: 11,
                      fontFamily: "var(--ds-mono), monospace",
                    }}
                  >
                    ∅
                  </div>
                )}
                {isPreviewHome && !isLanded && (
                  <div
                    style={{
                      position: "absolute",
                      top: 4,
                      right: 4,
                      fontSize: 9,
                      color: DS.ind,
                      fontFamily: "var(--ds-mono), monospace",
                    }}
                  >
                    ← hash home
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div
          style={{
            marginTop: 12,
            padding: "10px 12px",
            borderRadius: 10,
            background: "rgba(6,8,20,0.55)",
            border: `1px dashed ${DS.border}`,
            fontFamily: "var(--ds-mono), monospace",
            fontSize: 12,
            color: DS.t2,
            lineHeight: 1.55,
            overflowX: "auto",
            whiteSpace: "nowrap",
          }}
        >
          <span style={{ color: DS.dim }}>repr · </span>
          {dictRepr.length > 2 ? dictRepr : <span style={{ color: DS.dim }}>{isSet ? "set()" : "{}"}</span>}
        </div>
      </div>

      {/* Log */}
      <div style={{ marginTop: 14 }}>
        <SectionTitle>EVENT LOG</SectionTitle>
        <div
          style={{
            marginTop: 8,
            padding: "10px 12px",
            borderRadius: 10,
            background: "rgba(6,8,20,0.55)",
            border: `1px solid ${DS.border}`,
            fontFamily: "var(--ds-mono), monospace",
            fontSize: 11.5,
            maxHeight: 180,
            overflowY: "auto",
          }}
        >
          {log.map((e, i) => (
            <div
              key={i}
              style={{
                color: {
                  insert: DS.grn,
                  update: "#FCD34D",
                  lookup: DS.ind,
                  delete: "#FCA5A5",
                  miss: "#FCA5A5",
                  error: "#F87171",
                  warn: "#FCD34D",
                  note: DS.dim,
                }[e.kind] || DS.t2,
                padding: "3px 0",
                lineHeight: 1.55,
              }}
            >
              <span style={{ color: DS.dim }}>{String(i).padStart(2, "0")}</span> {e.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// MODE 2 — Set Algebra
// ──────────────────────────────────────────────────────────────

function AlgebraMode() {
  const [setA, setSetA] = useState(() => new Set(["alice", "bob", "carol", "dan"]));
  const [setB, setSetB] = useState(() => new Set(["carol", "dan", "erin", "frank"]));
  const [aInput, setAInput] = useState("");
  const [bInput, setBInput] = useState("");
  const [op, setOp] = useState("union");

  const all = useMemo(() => {
    const s = new Set();
    setA.forEach((x) => s.add(x));
    setB.forEach((x) => s.add(x));
    return Array.from(s).sort();
  }, [setA, setB]);

  const result = useMemo(() => {
    const out = new Set();
    for (const x of all) {
      const inA = setA.has(x);
      const inB = setB.has(x);
      if (op === "union" && (inA || inB)) out.add(x);
      else if (op === "intersection" && inA && inB) out.add(x);
      else if (op === "difference_ab" && inA && !inB) out.add(x);
      else if (op === "difference_ba" && inB && !inA) out.add(x);
      else if (op === "sym" && inA !== inB) out.add(x);
    }
    return out;
  }, [all, setA, setB, op]);

  const addTo = (which) => {
    const raw = (which === "A" ? aInput : bInput).trim();
    if (!raw) return;
    if (which === "A") {
      const next = new Set(setA);
      next.add(raw);
      setSetA(next);
      setAInput("");
    } else {
      const next = new Set(setB);
      next.add(raw);
      setSetB(next);
      setBInput("");
    }
  };

  const pyExpr = {
    union: "A | B",
    intersection: "A & B",
    difference_ab: "A - B",
    difference_ba: "B - A",
    sym: "A ^ B",
  }[op];

  const pyMethod = {
    union: "A.union(B)",
    intersection: "A.intersection(B)",
    difference_ab: "A.difference(B)",
    difference_ba: "B.difference(A)",
    sym: "A.symmetric_difference(B)",
  }[op];

  return (
    <div>
      {/* A & B builders */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
        <SetBuilder
          name="A"
          color="#60A5FA"
          set={setA}
          onRemove={(x) => {
            const n = new Set(setA);
            n.delete(x);
            setSetA(n);
          }}
          inputValue={aInput}
          setInput={setAInput}
          onAdd={() => addTo("A")}
        />
        <SetBuilder
          name="B"
          color="#F472B6"
          set={setB}
          onRemove={(x) => {
            const n = new Set(setB);
            n.delete(x);
            setSetB(n);
          }}
          inputValue={bInput}
          setInput={setBInput}
          onAdd={() => addTo("B")}
        />
      </div>

      {/* Operation chips */}
      <div style={{ marginBottom: 14 }}>
        <SectionTitle>OPERATION</SectionTitle>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
          {[
            ["union", "A | B  union"],
            ["intersection", "A & B  intersection"],
            ["difference_ab", "A - B  in A, not B"],
            ["difference_ba", "B - A  in B, not A"],
            ["sym", "A ^ B  symmetric diff"],
          ].map(([k, label]) => {
            const active = op === k;
            return (
              <button
                key={k}
                type="button"
                onClick={() => setOp(k)}
                style={{
                  padding: "8px 12px",
                  borderRadius: 999,
                  border: `1px solid ${active ? DS.ind : DS.border}`,
                  background: active ? `${DS.ind}1e` : "rgba(255,255,255,0.02)",
                  color: active ? DS.ind : DS.t2,
                  fontSize: 12,
                  fontFamily: "var(--ds-mono), monospace",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Row of elements with membership dots */}
      <div
        style={{
          padding: 14,
          borderRadius: 14,
          border: `1px solid ${DS.border}`,
          background: "linear-gradient(180deg, rgba(52,211,153,0.04), rgba(6,8,20,0.35))",
        }}
      >
        <SectionTitle>MEMBERSHIP · IN RESULT?</SectionTitle>
        <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "80px 80px 1fr 120px", rowGap: 4, columnGap: 8, fontFamily: "var(--ds-mono), monospace", fontSize: 11 }}>
          <div style={{ color: DS.dim, fontWeight: 700 }}>A</div>
          <div style={{ color: DS.dim, fontWeight: 700 }}>B</div>
          <div style={{ color: DS.dim, fontWeight: 700 }}>element</div>
          <div style={{ color: DS.dim, fontWeight: 700, textAlign: "right" }}>result</div>
          {all.map((x) => {
            const inA = setA.has(x);
            const inB = setB.has(x);
            const inR = result.has(x);
            return (
              <Fragment key={x}>
                <div><MembershipDot on={inA} color="#60A5FA" /></div>
                <div><MembershipDot on={inB} color="#F472B6" /></div>
                <div style={{ color: inR ? DS.t1 : DS.dim, fontWeight: inR ? 700 : 400 }}>{x}</div>
                <div style={{ textAlign: "right", color: inR ? DS.grn : DS.dim }}>
                  {inR ? "✓ kept" : "—"}
                </div>
              </Fragment>
            );
          })}
        </div>
      </div>

      {/* Python-style result */}
      <div
        style={{
          marginTop: 14,
          padding: "12px 14px",
          borderRadius: 12,
          border: `1px dashed ${DS.border}`,
          background: "rgba(6,8,20,0.55)",
          fontFamily: "var(--ds-mono), monospace",
          fontSize: 13,
          color: DS.t1,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        <div style={{ fontSize: 9, letterSpacing: 1.4, color: DS.dim, marginBottom: 8, fontWeight: 700 }}>RESULT</div>
        <span style={{ color: DS.t3 }}>{pyExpr}</span>  <span style={{ color: DS.dim }}>#</span> <span style={{ color: DS.dim }}>aka</span> <span style={{ color: DS.t3 }}>{pyMethod}</span>
        {"\n"}
        <span style={{ color: DS.grn }}>→</span> {"{"}
        {Array.from(result).map((x, i) => (
          <span key={x}>
            {i ? ", " : ""}
            <span style={{ color: "#FCD34D" }}>{JSON.stringify(x)}</span>
          </span>
        ))}
        {"}"}
        {result.size === 0 && <span style={{ color: DS.dim }}> (empty)</span>}
      </div>
    </div>
  );
}

function SetBuilder({ name, color, set, onRemove, inputValue, setInput, onAdd }) {
  return (
    <div
      style={{
        padding: 12,
        borderRadius: 12,
        border: `1px solid ${color}33`,
        background: `${color}08`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <span
          style={{
            width: 24,
            height: 24,
            borderRadius: 6,
            background: `${color}22`,
            border: `1px solid ${color}66`,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            color,
            fontFamily: "var(--ds-mono), monospace",
            fontWeight: 800,
            fontSize: 12,
          }}
        >
          {name}
        </span>
        <span style={{ fontFamily: "var(--ds-mono), monospace", fontSize: 11, color: DS.dim }}>
          {set.size} element{set.size === 1 ? "" : "s"}
        </span>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10, minHeight: 30 }}>
        {Array.from(set).sort().map((x) => (
          <span
            key={x}
            onClick={() => onRemove(x)}
            title="click to remove"
            style={{
              padding: "4px 8px",
              borderRadius: 999,
              background: `${color}22`,
              border: `1px solid ${color}55`,
              color: DS.t1,
              fontFamily: "var(--ds-mono), monospace",
              fontSize: 11,
              cursor: "pointer",
            }}
          >
            {x}
          </span>
        ))}
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        <input
          value={inputValue}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onAdd();
          }}
          placeholder={`add to ${name}`}
          style={{
            flex: 1,
            padding: "6px 10px",
            background: "rgba(6,8,20,0.55)",
            border: `1px solid ${DS.border}`,
            color: DS.t1,
            borderRadius: 8,
            fontSize: 12,
            fontFamily: "var(--ds-mono), monospace",
          }}
        />
        <Button onClick={onAdd}>+</Button>
      </div>
    </div>
  );
}

function MembershipDot({ on, color }) {
  return (
    <span
      style={{
        display: "inline-block",
        width: 10,
        height: 10,
        borderRadius: 999,
        background: on ? color : "transparent",
        border: `1px solid ${on ? color : DS.border}`,
      }}
    />
  );
}

function ToggleTag({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "6px 14px",
        borderRadius: 999,
        border: `1px solid ${active ? `${DS.ind}99` : DS.border}`,
        background: active ? `${DS.ind}22` : "rgba(255,255,255,0.02)",
        color: active ? DS.t1 : DS.t3,
        fontFamily: "var(--ds-mono), monospace",
        fontSize: 12,
        fontWeight: 700,
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

function LabeledInput({ label, value, onChange, placeholder }) {
  return (
    <label style={{ display: "block" }}>
      <div style={{ fontSize: 9, color: DS.dim, letterSpacing: 1.1, fontFamily: "var(--ds-mono), monospace", marginBottom: 4 }}>{label}</div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%",
          padding: "8px 10px",
          background: "rgba(6,8,20,0.55)",
          border: `1px solid ${DS.border}`,
          color: DS.t1,
          borderRadius: 8,
          fontSize: 12,
          fontFamily: "var(--ds-mono), monospace",
        }}
      />
    </label>
  );
}

const kbdStyle = {
  padding: "1px 6px",
  borderRadius: 4,
  background: "rgba(255,255,255,0.05)",
  border: `1px solid ${DS.border}`,
  color: DS.t2,
  fontFamily: "var(--ds-mono), monospace",
  fontSize: 10,
};

// ──────────────────────────────────────────────────────────────
// Root
// ──────────────────────────────────────────────────────────────

export default function HashLab() {
  const [mode, setMode] = useState("buckets");
  return (
    <div style={{ fontFamily: "var(--ds-sans), sans-serif" }}>
      <div style={{ fontSize: 17, fontWeight: 700, color: DS.t1, marginBottom: 4 }}>
        The hash lab
      </div>
      <p style={{ fontSize: 12, color: DS.t3, fontFamily: "var(--ds-mono), monospace", lineHeight: 1.6, marginBottom: 14 }}>
        Two lenses on <code style={{ color: DS.ind }}>dict</code> and <code style={{ color: DS.ind }}>set</code>. <strong style={{ color: DS.t1 }}>Buckets</strong> shows the hashing machinery (why lookups are O(1) on average). <strong style={{ color: DS.t1 }}>Algebra</strong> shows the union / intersection / difference rules without a Venn-diagram cliché.
      </p>

      <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
        <ModeTab active={mode === "buckets"} onClick={() => setMode("buckets")} label="1 · Buckets" hint="hash → slot → probe on collision" />
        <ModeTab active={mode === "algebra"} onClick={() => setMode("algebra")} label="2 · Algebra" hint="union, intersection, difference, sym diff" />
      </div>

      {mode === "buckets" ? <BucketsMode /> : <AlgebraMode />}

      {/* Cheat sheet */}
      <div
        style={{
          marginTop: 16,
          padding: "12px 14px",
          borderRadius: 12,
          border: `1px solid ${DS.border}`,
          background: "rgba(255,255,255,0.015)",
        }}
      >
        <SectionTitle>COMPLEXITY CHEAT SHEET</SectionTitle>
        <div
          style={{
            marginTop: 10,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 6,
            fontFamily: "var(--ds-mono), monospace",
            fontSize: 11.5,
            color: DS.t3,
          }}
        >
          <div><span style={{ color: DS.grn }}>d[k]</span> / <span style={{ color: DS.grn }}>k in d</span> → <span style={{ color: DS.t1 }}>O(1)</span> avg · O(n) worst</div>
          <div><span style={{ color: DS.grn }}>s in set</span> → <span style={{ color: DS.t1 }}>O(1)</span> avg (vs O(n) for list)</div>
          <div><span style={{ color: DS.grn }}>for k in d</span> → <span style={{ color: DS.t1 }}>O(n)</span>, insertion order (3.7+)</div>
          <div><span style={{ color: DS.grn }}>A | B</span> / <span style={{ color: DS.grn }}>A &amp; B</span> → <span style={{ color: DS.t1 }}>O(|A| + |B|)</span></div>
          <div><span style={{ color: DS.grn }}>dict(a, **b)</span> / <span style={{ color: DS.grn }}>a | b</span> → <span style={{ color: DS.t1 }}>O(|a| + |b|)</span>, b wins on conflicts</div>
          <div><span style={{ color: DS.grn }}>Counter(seq).most_common</span> → <span style={{ color: DS.t1 }}>O(n log k)</span></div>
        </div>
      </div>
    </div>
  );
}
