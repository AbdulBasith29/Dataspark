import { useEffect, useRef, useState } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

const H = 6;
const W = 6;
const K = 3;

const IMAGE = [
  [2, 8, 6, 4, 1, 0],
  [5, 9, 7, 3, 2, 1],
  [1, 4, 8, 6, 5, 2],
  [0, 2, 5, 9, 7, 3],
  [1, 1, 3, 4, 8, 4],
  [0, 0, 2, 2, 5, 6],
];

const KERNEL = [
  [1, 0, -1],
  [1, 0, -1],
  [1, 0, -1],
];

function convAt(ii, jj) {
  let s = 0;
  for (let ki = 0; ki < K; ki++) {
    for (let kj = 0; kj < K; kj++) {
      s += IMAGE[ii + ki][jj + kj] * KERNEL[ki][kj];
    }
  }
  return s;
}

function buildOutput() {
  const o = [];
  for (let i = 0; i <= H - K; i++) {
    const row = [];
    for (let j = 0; j <= W - K; j++) row.push(convAt(i, j));
    o.push(row);
  }
  return o;
}

const OUTPUT = buildOutput();
const OH = OUTPUT.length;
const OW = OUTPUT[0].length;
const MAX_POS = OH * OW;

export default function ConvolutionFilter() {
  const [pos, setPos] = useState(0);
  const [playing, setPlaying] = useState(true);
  const canvasRef = useRef(null);

  const ii = Math.floor(pos / OW);
  const jj = pos % OW;
  const currentVal = OUTPUT[ii][jj];

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setPos((p) => (p + 1 >= MAX_POS ? 0 : p + 1));
    }, 700);
    return () => clearInterval(id);
  }, [playing]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const cssW = canvas.clientWidth || 520;
    const cssH = 300;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(cssW * dpr);
    canvas.height = Math.floor(cssH * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.clearRect(0, 0, cssW, cssH);
    ctx.fillStyle = "rgba(255,255,255,0.02)";
    ctx.fillRect(0, 0, cssW, cssH);

    const cell = Math.min(42, (cssW - 200) / (W + OW + 4));
    const gap = 8;
    const ox = 16;
    const oy = 44;

    const drawGrid = (rows, cols, data, highlightR0, highlightC0, highlightSize) => {
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          const x = ox + j * (cell + gap);
          const y = oy + i * (cell + gap);
          const inPatch =
            highlightR0 != null &&
            i >= highlightR0 &&
            i < highlightR0 + highlightSize &&
            j >= highlightC0 &&
            j < highlightC0 + highlightSize;
          const v = data[i][j];
          const norm = Math.min(1, v / 12);
          ctx.fillStyle = inPatch ? `rgba(129, 140, 248, ${0.25 + 0.45 * norm})` : `rgba(71, 85, 105, ${0.15 + 0.35 * norm})`;
          ctx.fillRect(x, y, cell, cell);
          ctx.strokeStyle = inPatch ? DS.ind : DS.border;
          ctx.lineWidth = inPatch ? 2 : 1;
          ctx.strokeRect(x, y, cell, cell);
          ctx.fillStyle = DS.t1;
          ctx.font = "12px var(--ds-mono), monospace";
          ctx.textAlign = "center";
          ctx.fillText(String(v), x + cell / 2, y + cell / 2 + 4);
        }
      }
    };

    ctx.fillStyle = DS.t3;
    ctx.font = "10px var(--ds-mono), monospace";
    ctx.textAlign = "left";
    ctx.fillText("Input patch (6x6)", ox, 28);

    drawGrid(H, W, IMAGE, ii, jj, K);

    const kx = ox + W * (cell + gap) + 24;
    ctx.fillText("Kernel (3x3)", kx, 28);
    for (let i = 0; i < K; i++) {
      for (let j = 0; j < K; j++) {
        const x = kx + j * (cell + gap);
        const y = oy + i * (cell + gap);
        const v = KERNEL[i][j];
        ctx.fillStyle = v > 0 ? "rgba(52, 211, 153, 0.35)" : v < 0 ? "rgba(248, 113, 113, 0.35)" : "rgba(148, 163, 184, 0.2)";
        ctx.fillRect(x, y, cell, cell);
        ctx.strokeStyle = DS.border;
        ctx.strokeRect(x, y, cell, cell);
        ctx.fillStyle = DS.t1;
        ctx.font = "12px var(--ds-mono), monospace";
        ctx.textAlign = "center";
        ctx.fillText(String(v), x + cell / 2, y + cell / 2 + 4);
      }
    }

    const oxOut = kx + K * (cell + gap) + 32;
    ctx.textAlign = "left";
    ctx.fillText(`Output (${OH}x${OW})`, oxOut, 28);
    for (let i = 0; i < OH; i++) {
      for (let j = 0; j < OW; j++) {
        const x = oxOut + j * (cell + gap);
        const y = oy + i * (cell + gap);
        const v = OUTPUT[i][j];
        const active = i === ii && j === jj;
        const t = Math.tanh(v / 20) * 0.5 + 0.5;
        ctx.fillStyle = active ? `rgba(251, 191, 36, ${0.35 + 0.4 * t})` : `rgba(99, 102, 241, ${0.12 + 0.25 * t})`;
        ctx.fillRect(x, y, cell, cell);
        ctx.strokeStyle = active ? "#FBBF24" : DS.border;
        ctx.lineWidth = active ? 2 : 1;
        ctx.strokeRect(x, y, cell, cell);
        ctx.fillStyle = DS.t1;
        ctx.font = "12px var(--ds-mono), monospace";
        ctx.textAlign = "center";
        ctx.fillText(String(v), x + cell / 2, y + cell / 2 + 4);
      }
    }

    ctx.fillStyle = DS.t2;
    ctx.font = "11px var(--ds-mono), monospace";
    ctx.textAlign = "left";
    ctx.fillText(`sum(elementwise product) = ${currentVal}`, ox, cssH - 14);
  }, [ii, jj, currentVal]);

  return (
    <div>
      <div style={{ fontSize: 17, fontWeight: 700, color: DS.t1, fontFamily: "var(--ds-sans), sans-serif", marginBottom: 4 }}>
        Convolution: kernel sliding over a grid
      </div>
      <p style={{ fontSize: 12, color: DS.t3, fontFamily: "var(--ds-mono), monospace", lineHeight: 1.55, marginBottom: 14 }}>
        At each output location, place the kernel over the input, multiply overlapping cells, and sum. This toy uses a vertical edge–like kernel; drag the slider or play to march through positions.
      </p>

      <canvas ref={canvasRef} style={{ width: "100%", height: 300, borderRadius: 12, border: `1px solid ${DS.border}`, display: "block" }} />

      <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
        <label style={{ fontSize: 11, color: DS.t3, fontFamily: "var(--ds-mono), monospace", flex: "1 1 200px" }}>
          Output cell {pos + 1} / {MAX_POS} (top-left of patch: row {ii}, col {jj})
          <input type="range" min={0} max={MAX_POS - 1} step={1} value={pos} onChange={(e) => setPos(+e.target.value)} style={{ width: "100%", marginTop: 6, accentColor: DS.ind }} />
        </label>
        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          style={{
            padding: "8px 14px",
            borderRadius: 8,
            border: `1px solid ${DS.border}`,
            background: playing ? "rgba(129,140,248,0.2)" : "rgba(255,255,255,0.04)",
            color: DS.t1,
            fontFamily: "var(--ds-mono), monospace",
            fontSize: 11,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          {playing ? "Pause" : "Play"}
        </button>
      </div>

      <p style={{ marginTop: 14, fontSize: 12, color: DS.t3, lineHeight: 1.65, fontFamily: "var(--ds-sans), sans-serif" }}>
        Real CNNs learn kernels, stack layers, and often add bias + nonlinearity per channel. Stride, padding, and dilation change which input windows each output sees.
      </p>
    </div>
  );
}
