import { useMemo, useState } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

/**
 * StringFormatAtelier — a creative, typographic "print shop" for the Python
 * f-string format mini-language. The learner composes a spec piece-by-piece
 * and watches the output typeset live. Intentionally different from the other
 * vizzes in the codebase: the teaching device is an interactive **anatomy bar**
 * (color-coded grammar slots) + an output ruler, not a chart.
 *
 * Scope: `py-b2` — Strings, f-strings & String Methods.
 *
 * Grammar modelled (subset — covers ~everything interviewers quiz on):
 *   {value!conv:[[fill]align][sign][#][0][width][,_][.precision][type]}
 */

// ──────────────────────────────────────────────────────────────
// Format engine (JS emulation of Python's str.format / f-string)
// ──────────────────────────────────────────────────────────────

function addThousands(intStr, sep) {
  const neg = intStr.startsWith("-");
  const digits = neg ? intStr.slice(1) : intStr;
  const withSep = digits.replace(/\B(?=(\d{3})+(?!\d))/g, sep);
  return neg ? "-" + withSep : withSep;
}

function addThousandsToDecimal(numStr, sep) {
  const [intPart, decPart] = numStr.split(".");
  const joined = addThousands(intPart, sep);
  return decPart != null ? `${joined}.${decPart}` : joined;
}

/**
 * Format a value against a parsed spec. Aims for Python-parity on the cases
 * a learner will plausibly explore; not a full CPython reimplementation.
 */
function formatValue(rawValue, conv, spec) {
  // 1) Apply conversion flag — these run BEFORE the format spec in Python.
  let displayValue = rawValue;
  if (conv === "r" || conv === "a") {
    // repr/ascii — wrap strings in single quotes; numbers unchanged.
    if (typeof rawValue === "string") {
      displayValue = `'${rawValue}'`;
    } else {
      displayValue = String(rawValue);
    }
  } else if (conv === "s") {
    displayValue = String(rawValue);
  }

  const {
    fill,
    align,
    sign,
    alt,
    zero,
    width,
    grouping,
    precision,
    type,
  } = spec;

  const numericTypes = "bcdeEfFgGnoxX%";
  const isNumericType = numericTypes.includes(type);

  // For numeric formatting we need the underlying number, not the
  // repr-wrapped string.
  const nRaw = typeof rawValue === "number" ? rawValue : Number(rawValue);
  const validNumber = Number.isFinite(nRaw);

  let body = "";
  let signPart = "";
  let prefix = "";
  let error = null;

  if (isNumericType && validNumber) {
    const neg = nRaw < 0;
    const abs = Math.abs(nRaw);
    signPart = neg ? "-" : sign === "+" ? "+" : sign === " " ? " " : "";

    if (type === "d" || type === "n") {
      body = Math.trunc(abs).toString();
      if (grouping) body = addThousands(body, grouping);
    } else if (type === "b") {
      body = Math.trunc(abs).toString(2);
      if (alt) prefix = "0b";
    } else if (type === "o") {
      body = Math.trunc(abs).toString(8);
      if (alt) prefix = "0o";
    } else if (type === "x" || type === "X") {
      body = Math.trunc(abs).toString(16);
      if (type === "X") body = body.toUpperCase();
      if (alt) prefix = type === "X" ? "0X" : "0x";
    } else if (type === "c") {
      body = String.fromCodePoint(Math.trunc(abs));
    } else if (type === "f" || type === "F") {
      const p = precision != null ? precision : 6;
      body = abs.toFixed(p);
      if (grouping) body = addThousandsToDecimal(body, grouping);
    } else if (type === "e" || type === "E") {
      const p = precision != null ? precision : 6;
      body = abs.toExponential(p);
      if (type === "E") body = body.toUpperCase();
      // Python pads exponent to at least 2 digits (e.g. 1.00e+05).
      body = body.replace(/([eE])([+-]?)(\d)$/, "$1$20$3");
    } else if (type === "g" || type === "G") {
      const p = precision != null ? precision : 6;
      body = abs.toPrecision(p);
      if (body.includes(".") && !/e/i.test(body)) {
        body = body.replace(/\.?0+$/, "");
      }
      if (type === "G") body = body.toUpperCase();
    } else if (type === "%") {
      const p = precision != null ? precision : 6;
      body = (abs * 100).toFixed(p) + "%";
    } else {
      body = abs.toString();
    }
  } else if (isNumericType && !validNumber) {
    error = `Numeric type '${type}' needs a number. '${rawValue}' is not numeric — the format spec silently falls back.`;
    body = String(displayValue);
  } else {
    // String / default type.
    body = String(displayValue);
    if (precision != null && (type === "s" || type === "")) {
      body = body.slice(0, precision);
    }
    if (sign || grouping || alt) {
      // These flags are numeric-only; Python raises. We surface a hint.
      error = `Flags like sign / # / , apply only to numeric types. They are being ignored for '${type || "s"}'.`;
    }
  }

  // Combine sign + prefix + body with padding per align rules.
  const effectiveAlign = align || (isNumericType ? ">" : "<");
  const padChar = zero && !align ? "0" : fill;
  const zeroFillEquals = zero && !align && isNumericType;

  let out;
  if (zeroFillEquals || effectiveAlign === "=") {
    const pad = Math.max(0, width - (signPart.length + prefix.length + body.length));
    out = signPart + prefix + padChar.repeat(pad) + body;
  } else {
    const full = signPart + prefix + body;
    const pad = Math.max(0, width - full.length);
    if (effectiveAlign === "<") out = full + padChar.repeat(pad);
    else if (effectiveAlign === ">") out = padChar.repeat(pad) + full;
    else {
      const left = Math.floor(pad / 2);
      const right = pad - left;
      out = padChar.repeat(left) + full + padChar.repeat(right);
    }
  }

  return { output: out, error };
}

function buildSpecString(spec) {
  const { fill, align, sign, alt, zero, width, grouping, precision, type } = spec;
  let s = "";
  if (fill !== " " && align) s += fill + align;
  else if (align) s += align;
  if (sign && sign !== "-") s += sign;
  if (alt) s += "#";
  if (zero) s += "0";
  if (width > 0) s += String(width);
  if (grouping) s += grouping;
  if (precision != null) s += "." + precision;
  if (type) s += type;
  return s;
}

// ──────────────────────────────────────────────────────────────
// UI
// ──────────────────────────────────────────────────────────────

const PART_COLORS = {
  literal: DS.t3,
  brace: DS.dim,
  value: "#F472B6",
  conv: "#F59E0B",
  fill: "#A78BFA",
  align: DS.ind,
  sign: "#34D399",
  alt: "#FB7185",
  width: "#FACC15",
  group: "#22D3EE",
  precision: "#818CF8",
  type: "#34D399",
};

const DEMO_VALUES = {
  string: { raw: "ada lovelace", label: 'str: "ada lovelace"' },
  int: { raw: 7, label: "int: 7" },
  bigint: { raw: 1234567, label: "int: 1_234_567" },
  float: { raw: 3.14159265, label: "float: 3.14159265" },
  negative: { raw: -482.5, label: "float: -482.5" },
  fraction: { raw: 0.0734, label: "float: 0.0734" },
  byte: { raw: 255, label: "int: 255" },
};

const RECIPES = [
  {
    id: "currency",
    label: "USD currency",
    hint: "Right-align, 2 decimals, thousands sep, always show sign.",
    demo: "float",
    literalPrefix: "$",
    literalSuffix: "",
    conv: "",
    spec: { fill: " ", align: ">", sign: "+", alt: false, zero: false, width: 12, grouping: ",", precision: 2, type: "f" },
  },
  {
    id: "percent",
    label: "Percent (2dp)",
    hint: "Multiplies by 100 and adds %. Use for rates.",
    demo: "fraction",
    literalPrefix: "",
    literalSuffix: "",
    conv: "",
    spec: { fill: " ", align: null, sign: "-", alt: false, zero: false, width: 0, grouping: "", precision: 2, type: "%" },
  },
  {
    id: "sci",
    label: "Scientific (3dp)",
    hint: "Great for huge or tiny numbers in logs.",
    demo: "bigint",
    literalPrefix: "",
    literalSuffix: "",
    conv: "",
    spec: { fill: " ", align: null, sign: "-", alt: false, zero: false, width: 0, grouping: "", precision: 3, type: "e" },
  },
  {
    id: "idpad",
    label: "Zero-padded ID",
    hint: "Pad to 6 with zeros — stable-width IDs in filenames.",
    demo: "int",
    literalPrefix: "user_",
    literalSuffix: ".csv",
    conv: "",
    spec: { fill: " ", align: null, sign: "-", alt: false, zero: true, width: 6, grouping: "", precision: null, type: "d" },
  },
  {
    id: "hex",
    label: "Hex byte",
    hint: "Two-digit upper-case hex with 0x prefix — forensic tables.",
    demo: "byte",
    literalPrefix: "byte=",
    literalSuffix: "",
    conv: "",
    spec: { fill: "0", align: ">", sign: "-", alt: true, zero: false, width: 4, grouping: "", precision: null, type: "X" },
  },
  {
    id: "centerlabel",
    label: "Centered label",
    hint: "Center in a 20-char gutter with dashes as fill.",
    demo: "string",
    literalPrefix: "",
    literalSuffix: "",
    conv: "",
    spec: { fill: "-", align: "^", sign: "-", alt: false, zero: false, width: 22, grouping: "", precision: null, type: "s" },
  },
  {
    id: "truncate",
    label: "Truncated string",
    hint: "Precision on strings *truncates* — cap column width.",
    demo: "string",
    literalPrefix: "name=",
    literalSuffix: "",
    conv: "",
    spec: { fill: " ", align: null, sign: "-", alt: false, zero: false, width: 0, grouping: "", precision: 5, type: "s" },
  },
  {
    id: "repr",
    label: "!r for logs",
    hint: "Conversion !r wraps strings in quotes — preserves invisibles.",
    demo: "string",
    literalPrefix: "got ",
    literalSuffix: " from api",
    conv: "r",
    spec: { fill: " ", align: null, sign: "-", alt: false, zero: false, width: 0, grouping: "", precision: null, type: "" },
  },
];

// ──────────────────────────────────────────────────────────────

export default function StringFormatAtelier() {
  const [demoKey, setDemoKey] = useState("float");
  const [literalPrefix, setLiteralPrefix] = useState("price: ");
  const [literalSuffix, setLiteralSuffix] = useState(" / unit");
  const [conv, setConv] = useState(""); // "" | "s" | "r" | "a"
  const [fill, setFill] = useState(" ");
  const [align, setAlign] = useState(null); // null | "<" | ">" | "^" | "="
  const [sign, setSign] = useState("-"); // "-" | "+" | " "
  const [alt, setAlt] = useState(false);
  const [zero, setZero] = useState(false);
  const [width, setWidth] = useState(10);
  const [grouping, setGrouping] = useState(""); // "" | "," | "_"
  const [precision, setPrecision] = useState(2);
  const [precisionEnabled, setPrecisionEnabled] = useState(true);
  const [type, setType] = useState("f");
  const [hover, setHover] = useState(null);

  const spec = useMemo(
    () => ({
      fill,
      align,
      sign,
      alt,
      zero,
      width,
      grouping,
      precision: precisionEnabled ? precision : null,
      type,
    }),
    [fill, align, sign, alt, zero, width, grouping, precision, precisionEnabled, type]
  );

  const rawValue = DEMO_VALUES[demoKey].raw;
  const specString = buildSpecString(spec);
  const formatted = useMemo(() => formatValue(rawValue, conv, spec), [rawValue, conv, spec]);

  const placeholder = `{${conv ? `!${conv}` : ""}${specString ? `:${specString}` : ""}}`;
  const fullFString = `f"${literalPrefix}${placeholder}${literalSuffix}"`;
  const fullOutput = `${literalPrefix}${formatted.output}${literalSuffix}`;

  const applyRecipe = (r) => {
    setDemoKey(r.demo);
    setLiteralPrefix(r.literalPrefix);
    setLiteralSuffix(r.literalSuffix);
    setConv(r.conv || "");
    setFill(r.spec.fill);
    setAlign(r.spec.align);
    setSign(r.spec.sign);
    setAlt(r.spec.alt);
    setZero(r.spec.zero);
    setWidth(r.spec.width);
    setGrouping(r.spec.grouping);
    if (r.spec.precision == null) {
      setPrecisionEnabled(false);
    } else {
      setPrecisionEnabled(true);
      setPrecision(r.spec.precision);
    }
    setType(r.spec.type);
  };

  return (
    <div style={{ fontFamily: "var(--ds-sans), sans-serif" }}>
      <div style={{ fontSize: 17, fontWeight: 700, color: DS.t1, marginBottom: 4 }}>
        The f-string atelier
      </div>
      <p style={{ fontSize: 12, color: DS.t3, fontFamily: "var(--ds-mono), monospace", lineHeight: 1.6, marginBottom: 16 }}>
        Compose each piece of <code style={{ color: DS.ind }}>{"{value!conv:[[fill]align][sign][#][0][width][,][.prec][type]}"}</code> and watch Python typeset it live. Hover any chip below to map the grammar onto the output.
      </p>

      {/* ─── Anatomy bar ─── */}
      <AnatomyBar
        literalPrefix={literalPrefix}
        literalSuffix={literalSuffix}
        conv={conv}
        spec={spec}
        specString={specString}
        demoKey={demoKey}
        hover={hover}
        onHover={setHover}
      />

      {/* ─── Live typeset output ─── */}
      <OutputRuler output={fullOutput} width={width} placeholderOutput={formatted.output} />

      {formatted.error && (
        <div
          style={{
            marginTop: 10,
            padding: "10px 12px",
            fontSize: 12,
            lineHeight: 1.55,
            color: "#FCD34D",
            background: "rgba(251,191,36,0.06)",
            border: "1px solid rgba(251,191,36,0.28)",
            borderRadius: 10,
            fontFamily: "var(--ds-mono), monospace",
          }}
        >
          heads-up · {formatted.error}
        </div>
      )}

      {/* ─── The spec bench ─── */}
      <div
        style={{
          marginTop: 18,
          padding: "16px 16px 10px",
          borderRadius: 14,
          border: `1px solid ${DS.border}`,
          background: "rgba(255,255,255,0.015)",
        }}
      >
        <SectionTitle>Spec bench</SectionTitle>

        <Row>
          <Field label="Demo value">
            <SelectRow options={Object.entries(DEMO_VALUES).map(([k, v]) => [k, v.label])} value={demoKey} onChange={setDemoKey} />
          </Field>
          <Field label="Conversion (!r !s !a)">
            <ChipRow
              options={[["", "none"], ["s", "!s"], ["r", "!r"], ["a", "!a"]]}
              value={conv}
              onChange={setConv}
              color={PART_COLORS.conv}
            />
          </Field>
        </Row>

        <Row>
          <Field label="Literal prefix">
            <TextInput value={literalPrefix} onChange={setLiteralPrefix} placeholder="before the slot" />
          </Field>
          <Field label="Literal suffix">
            <TextInput value={literalSuffix} onChange={setLiteralSuffix} placeholder="after the slot" />
          </Field>
        </Row>

        <Row>
          <Field label="Fill character">
            <TextInput
              value={fill}
              onChange={(v) => setFill(v.slice(-1) || " ")}
              maxLength={1}
              placeholder="·"
              mono
              width={80}
            />
          </Field>
          <Field label="Align">
            <ChipRow
              options={[
                [null, "auto"],
                ["<", "< left"],
                [">", "> right"],
                ["^", "^ center"],
                ["=", "= pad after sign"],
              ]}
              value={align}
              onChange={setAlign}
              color={PART_COLORS.align}
            />
          </Field>
        </Row>

        <Row>
          <Field label="Sign">
            <ChipRow
              options={[
                ["-", "- only neg"],
                ["+", "+ always"],
                [" ", "space for pos"],
              ]}
              value={sign}
              onChange={setSign}
              color={PART_COLORS.sign}
            />
          </Field>
          <Field label="Flags">
            <div style={{ display: "flex", gap: 8 }}>
              <ToggleChip active={alt} onClick={() => setAlt(!alt)} color={PART_COLORS.alt}>
                # alt form
              </ToggleChip>
              <ToggleChip active={zero} onClick={() => setZero(!zero)} color={PART_COLORS.width}>
                0-pad
              </ToggleChip>
            </div>
          </Field>
        </Row>

        <Row>
          <Field label={`Width · ${width}`}>
            <input
              type="range"
              min={0}
              max={30}
              step={1}
              value={width}
              onChange={(e) => setWidth(Number(e.target.value))}
              style={{ width: "100%", accentColor: PART_COLORS.width }}
            />
          </Field>
          <Field label="Thousands separator">
            <ChipRow
              options={[["", "none"], [",", ","], ["_", "_"]]}
              value={grouping}
              onChange={setGrouping}
              color={PART_COLORS.group}
            />
          </Field>
        </Row>

        <Row>
          <Field label={precisionEnabled ? `Precision · ${precision}` : "Precision · off"}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <ToggleChip
                active={precisionEnabled}
                onClick={() => setPrecisionEnabled((p) => !p)}
                color={PART_COLORS.precision}
                small
              >
                {precisionEnabled ? "on" : "off"}
              </ToggleChip>
              <input
                type="range"
                min={0}
                max={10}
                step={1}
                value={precision}
                onChange={(e) => setPrecision(Number(e.target.value))}
                disabled={!precisionEnabled}
                style={{ flex: 1, accentColor: PART_COLORS.precision, opacity: precisionEnabled ? 1 : 0.4 }}
              />
            </div>
          </Field>
          <Field label="Type">
            <ChipRow
              options={[
                ["", "none"],
                ["s", "s"],
                ["d", "d"],
                ["f", "f"],
                ["e", "e"],
                ["g", "g"],
                ["%", "%"],
                ["b", "b"],
                ["o", "o"],
                ["x", "x"],
                ["X", "X"],
              ]}
              value={type}
              onChange={setType}
              color={PART_COLORS.type}
              wrap
            />
          </Field>
        </Row>
      </div>

      {/* ─── Recipes ─── */}
      <div
        style={{
          marginTop: 18,
          padding: "14px 16px 16px",
          borderRadius: 14,
          border: `1px solid ${DS.border}`,
          background: "rgba(255,255,255,0.015)",
        }}
      >
        <SectionTitle>Recipes — click to load</SectionTitle>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
          {RECIPES.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => applyRecipe(r)}
              title={r.hint}
              style={{
                padding: "8px 12px",
                borderRadius: 999,
                border: `1px solid ${DS.border}`,
                background: "rgba(129,140,248,0.06)",
                color: DS.t2,
                fontSize: 12,
                fontFamily: "var(--ds-mono), monospace",
                cursor: "pointer",
                transition: "all .15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = `${DS.ind}66`;
                e.currentTarget.style.color = DS.t1;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = DS.border;
                e.currentTarget.style.color = DS.t2;
              }}
            >
              {r.label}
            </button>
          ))}
        </div>
        <p style={{ margin: "12px 0 0", fontSize: 12, color: DS.dim, lineHeight: 1.55 }}>
          Each recipe rewrites every control so you can reverse-engineer the grammar from the output. Try <strong style={{ color: DS.t2 }}>Zero-padded ID</strong> then flip align to <code style={{ color: DS.ind }}>&lt;</code> — you&apos;ll watch the zeros relocate.
        </p>
      </div>

      {/* ─── Source echo ─── */}
      <div
        style={{
          marginTop: 18,
          padding: "12px 14px",
          borderRadius: 12,
          background: "rgba(6,8,20,0.55)",
          border: `1px dashed ${DS.border}`,
        }}
      >
        <div style={{ fontSize: 9, letterSpacing: 1.4, color: DS.dim, fontFamily: "var(--ds-mono), monospace", marginBottom: 6 }}>
          SOURCE THE INTERPRETER SEES
        </div>
        <code
          style={{
            fontFamily: "var(--ds-mono), monospace",
            fontSize: 13,
            color: DS.t2,
            display: "block",
            whiteSpace: "pre-wrap",
            wordBreak: "break-all",
          }}
        >
          <span style={{ color: DS.grn }}>value</span> = <span style={{ color: PART_COLORS.value }}>{JSON.stringify(rawValue)}</span>
          {"\n"}
          <span style={{ color: DS.t3 }}>print(</span>
          {fullFString}
          <span style={{ color: DS.t3 }}>)</span>
          {"\n"}
          <span style={{ color: DS.dim }}># → </span>
          <span style={{ color: DS.t1 }}>{JSON.stringify(fullOutput)}</span>
        </code>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Anatomy bar — color-coded chips for each grammar part
// ──────────────────────────────────────────────────────────────

function Chip({ text, color, role, hover, onHover, big }) {
  const active = hover === role;
  return (
    <span
      onMouseEnter={() => onHover(role)}
      onMouseLeave={() => onHover(null)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: big ? "6px 10px" : "3px 7px",
        margin: "0 3px",
        borderRadius: 8,
        background: active ? `${color}28` : `${color}14`,
        color,
        border: `1px solid ${active ? color : `${color}44`}`,
        fontFamily: "var(--ds-mono), monospace",
        fontSize: big ? 14 : 12,
        fontWeight: 700,
        lineHeight: 1,
        letterSpacing: "0.02em",
        transition: "background .12s, border-color .12s",
        whiteSpace: "pre",
      }}
      title={role}
    >
      {text}
    </span>
  );
}

function AnatomyBar({ literalPrefix, literalSuffix, conv, spec, specString, demoKey, hover, onHover }) {
  const hasSpec = specString.length > 0;
  const demoLabel = DEMO_VALUES[demoKey].label.split(":")[0];

  return (
    <div
      style={{
        padding: "14px 14px",
        borderRadius: 14,
        border: `1px solid ${DS.border}`,
        background: "linear-gradient(180deg, rgba(99,102,241,0.06), rgba(16,18,36,0.35))",
        overflowX: "auto",
      }}
    >
      <div style={{ fontSize: 9, letterSpacing: 1.4, color: DS.dim, fontFamily: "var(--ds-mono), monospace", marginBottom: 10 }}>
        ANATOMY · HOVER A PIECE
      </div>
      <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", rowGap: 6, fontFamily: "var(--ds-mono), monospace", fontSize: 14, color: DS.t3 }}>
        <span style={{ color: DS.t3 }}>f&quot;</span>
        {literalPrefix && <Chip text={literalPrefix} color={PART_COLORS.literal} role="literalPrefix" hover={hover} onHover={onHover} big />}
        <Chip text="{" color={PART_COLORS.brace} role="brace" hover={hover} onHover={onHover} big />
        <Chip text={demoLabel} color={PART_COLORS.value} role="value" hover={hover} onHover={onHover} big />
        {conv && (
          <>
            <Chip text="!" color={PART_COLORS.brace} role="conv" hover={hover} onHover={onHover} big />
            <Chip text={conv} color={PART_COLORS.conv} role="conv" hover={hover} onHover={onHover} big />
          </>
        )}
        {hasSpec && (
          <>
            <Chip text=":" color={PART_COLORS.brace} role="colon" hover={hover} onHover={onHover} big />
            {spec.fill !== " " && spec.align && (
              <>
                <Chip text={spec.fill} color={PART_COLORS.fill} role="fill" hover={hover} onHover={onHover} big />
              </>
            )}
            {spec.align && <Chip text={spec.align} color={PART_COLORS.align} role="align" hover={hover} onHover={onHover} big />}
            {spec.sign && spec.sign !== "-" && <Chip text={spec.sign === " " ? "␣" : spec.sign} color={PART_COLORS.sign} role="sign" hover={hover} onHover={onHover} big />}
            {spec.alt && <Chip text="#" color={PART_COLORS.alt} role="alt" hover={hover} onHover={onHover} big />}
            {spec.zero && <Chip text="0" color={PART_COLORS.width} role="zero" hover={hover} onHover={onHover} big />}
            {spec.width > 0 && <Chip text={String(spec.width)} color={PART_COLORS.width} role="width" hover={hover} onHover={onHover} big />}
            {spec.grouping && <Chip text={spec.grouping} color={PART_COLORS.group} role="grouping" hover={hover} onHover={onHover} big />}
            {spec.precision != null && <Chip text={`.${spec.precision}`} color={PART_COLORS.precision} role="precision" hover={hover} onHover={onHover} big />}
            {spec.type && <Chip text={spec.type} color={PART_COLORS.type} role="type" hover={hover} onHover={onHover} big />}
          </>
        )}
        <Chip text="}" color={PART_COLORS.brace} role="brace" hover={hover} onHover={onHover} big />
        {literalSuffix && <Chip text={literalSuffix} color={PART_COLORS.literal} role="literalSuffix" hover={hover} onHover={onHover} big />}
        <span style={{ color: DS.t3 }}>&quot;</span>
      </div>
      {hover && (
        <div style={{ marginTop: 10, fontSize: 11, color: DS.t3, fontFamily: "var(--ds-mono), monospace", lineHeight: 1.55 }}>
          {ANATOMY_HINTS[hover] || ""}
        </div>
      )}
    </div>
  );
}

const ANATOMY_HINTS = {
  literalPrefix: "Literal text outside the braces — printed as-is.",
  literalSuffix: "Literal text outside the braces — printed as-is.",
  brace: "The { } delimit a replacement field. Use {{ and }} to print a real brace.",
  value: "The expression. In f-strings this can be any Python expression, including a function call.",
  conv: "!r / !s / !a run before the spec. !r calls repr() — shows quotes for strings.",
  colon: "Everything after : is the format spec (the mini-language).",
  fill: "Single character used to pad to width. Only meaningful with an align.",
  align: "< left, > right, ^ center, = put padding between sign/prefix and digits.",
  sign: "'+' shows sign on positives too; ' ' leaves a space for positives (aligned tables).",
  alt: "# alt form: 0b/0o/0x prefix for binary/oct/hex; forces a decimal point on floats.",
  zero: "Zero-pad is shorthand for fill=0 align== (zeros slide after the sign).",
  width: "Minimum field width. Value never gets truncated by width — only by precision.",
  grouping: "',' or '_' between every three digits. Stacks with precision on floats.",
  precision: "Floats: digits after the point. Strings: truncate to N chars. Integers: error.",
  type: "s string · d int · f fixed · e scientific · g general · % percent · b/o/x/X bin/oct/hex.",
};

// ──────────────────────────────────────────────────────────────
// Output ruler — shows the formatted field inside a character grid
// ──────────────────────────────────────────────────────────────

function OutputRuler({ output, width, placeholderOutput }) {
  const rulerLen = Math.max(output.length, 24);
  const slotStart = output.indexOf(placeholderOutput);

  return (
    <div style={{ marginTop: 14 }}>
      <div style={{ fontSize: 9, letterSpacing: 1.4, color: DS.dim, fontFamily: "var(--ds-mono), monospace", marginBottom: 6 }}>
        TYPESET OUTPUT
      </div>
      <div
        style={{
          fontFamily: "var(--ds-mono), monospace",
          fontSize: 18,
          color: DS.t1,
          background: "linear-gradient(180deg, rgba(52,211,153,0.06), rgba(6,8,20,0.55))",
          border: `1px solid rgba(52,211,153,0.18)`,
          padding: "14px 14px 10px",
          borderRadius: 12,
          overflowX: "auto",
        }}
      >
        <div style={{ whiteSpace: "pre" }}>
          {output.split("").map((ch, i) => {
            const inSlot = slotStart >= 0 && i >= slotStart && i < slotStart + placeholderOutput.length;
            return (
              <span
                key={i}
                style={{
                  color: inSlot ? DS.grn : DS.t2,
                  background: inSlot ? "rgba(52,211,153,0.1)" : "transparent",
                  padding: "1px 0",
                }}
              >
                {ch === " " ? "·" : ch}
              </span>
            );
          })}
        </div>
        <div
          style={{
            marginTop: 8,
            fontSize: 9,
            color: DS.dim,
            letterSpacing: 2,
            whiteSpace: "pre",
            display: "flex",
            gap: 0,
          }}
        >
          {Array.from({ length: rulerLen }).map((_, i) => (
            <span key={i} style={{ width: "1ch", textAlign: "center", color: width > 0 && i < width ? DS.ind : DS.dim }}>
              {i % 5 === 0 ? String(i).padStart(1, " ") : "·"}
            </span>
          ))}
        </div>
      </div>
      <p style={{ margin: "8px 2px 0", fontSize: 11, color: DS.dim, fontFamily: "var(--ds-mono), monospace" }}>
        green span = formatted value · indigo ruler ticks mark the field width · spaces shown as ·
      </p>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Small UI atoms
// ──────────────────────────────────────────────────────────────

function SectionTitle({ children }) {
  return (
    <div
      style={{
        fontSize: 9,
        letterSpacing: 1.4,
        color: DS.dim,
        fontFamily: "var(--ds-mono), monospace",
        fontWeight: 700,
      }}
    >
      {children}
    </div>
  );
}

function Row({ children }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: 12,
        padding: "10px 0",
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
      <div style={{ fontSize: 10, color: DS.t3, fontFamily: "var(--ds-mono), monospace", marginBottom: 6, letterSpacing: 0.4 }}>{label}</div>
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

function ToggleChip({ active, onClick, color, children, small = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: small ? "4px 10px" : "6px 12px",
        borderRadius: 999,
        border: `1px solid ${active ? color : DS.border}`,
        background: active ? `${color}20` : "rgba(255,255,255,0.02)",
        color: active ? color : DS.t3,
        fontSize: 11,
        fontFamily: "var(--ds-mono), monospace",
        fontWeight: 600,
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

function SelectRow({ options, value, onChange }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
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
    >
      {options.map(([k, label]) => (
        <option key={k} value={k} style={{ background: "#0B1020", color: DS.t1 }}>
          {label}
        </option>
      ))}
    </select>
  );
}

function TextInput({ value, onChange, placeholder, maxLength, mono = false, width }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      maxLength={maxLength}
      style={{
        width: width ? width : "100%",
        padding: "8px 10px",
        background: "rgba(6,8,20,0.55)",
        border: `1px solid ${DS.border}`,
        color: DS.t1,
        borderRadius: 8,
        fontSize: 12,
        fontFamily: mono ? "var(--ds-mono), monospace" : "var(--ds-sans), sans-serif",
        textAlign: mono ? "center" : "left",
      }}
    />
  );
}
