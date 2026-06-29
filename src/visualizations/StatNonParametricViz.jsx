import { useState } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

// --- Constants declared before component to avoid TDZ crashes ---

const ACCENT = "#8B5CF6";
const ACCENT_LT = "#A78BFA";
const AMBER = "#F59E0B";
const GREEN = "#34D399";
const RED = "#F87171";

// Each test definition. `clean` is the well-behaved data; `messy` injects an
// outlier / skew that breaks the parametric test but not the rank-based one.
const TESTS = {
  mann_whitney: {
    id: "mann_whitney",
    name: "Mann-Whitney U",
    parametric: "Independent t-test",
    tagline: "Two independent groups · tests a distribution/median shift",
    groups: ["Therapy A", "Therapy B"],
    clean: [
      [12, 15, 18, 21, 24],
      [9, 11, 14, 16, 19],
    ],
    messy: [
      [12, 15, 18, 21, 24],
      [9, 11, 14, 16, 96], // one huge outlier in group B
    ],
    messyNote:
      "One participant in Therapy B reports an extreme score (96). The mean of B is dragged up so the t-test now says 'no difference' — but only that single value moved.",
  },
  wilcoxon: {
    id: "wilcoxon",
    name: "Wilcoxon signed-rank",
    parametric: "Paired t-test",
    tagline: "Same subjects, before vs after · ranks the differences",
    groups: ["Before", "After"],
    clean: [
      [22, 25, 19, 28, 24],
      [18, 20, 17, 21, 19],
    ],
    messy: [
      [22, 25, 19, 28, 24],
      [18, 20, 17, 21, 70], // one participant got dramatically worse
    ],
    messyNote:
      "One participant's 'after' score spikes to 70 (a data-entry error or a true outlier). The mean difference flips sign, so the paired t-test loses significance — yet 4 of 5 people clearly improved.",
  },
  kruskal: {
    id: "kruskal",
    name: "Kruskal-Wallis",
    parametric: "One-way ANOVA",
    tagline: "Three or more independent groups · the ANOVA on ranks",
    groups: ["Low dose", "Mid dose", "High dose"],
    clean: [
      [8, 10, 12],
      [14, 16, 18],
      [20, 22, 24],
    ],
    messy: [
      [8, 10, 12],
      [14, 16, 18],
      [20, 22, 88], // one extreme value in the high-dose group
    ],
    messyNote:
      "One high-dose participant scores 88. ANOVA's F-ratio is built on squared deviations, so this single value inflates within-group variance and the test can lose significance — even though the groups still separate cleanly by rank.",
  },
};

const TEST_ORDER = ["mann_whitney", "wilcoxon", "kruskal"];

// Map parametric ↔ non-parametric for the side panel.
const MAPPING = [
  ["Independent t-test", "Mann-Whitney U"],
  ["Paired t-test", "Wilcoxon signed-rank"],
  ["One-way ANOVA", "Kruskal-Wallis H"],
  ["Pearson's r", "Spearman's rho"],
];

// ── Pure helper math (approximate but conceptually faithful) ────────────────

function mean(arr) {
  return arr.reduce((s, x) => s + x, 0) / arr.length;
}

function sd(arr) {
  const m = mean(arr);
  const v = arr.reduce((s, x) => s + (x - m) ** 2, 0) / Math.max(1, arr.length - 1);
  return Math.sqrt(v);
}

// Assign average ranks across a pooled set of {value, group, idx} entries.
function rankPooled(entries) {
  const sorted = [...entries].sort((a, b) => a.value - b.value);
  const ranks = new Array(sorted.length);
  let i = 0;
  while (i < sorted.length) {
    let j = i;
    while (j < sorted.length - 1 && sorted[j + 1].value === sorted[i].value) j += 1;
    const avgRank = (i + 1 + (j + 1)) / 2; // average of tied positions (1-indexed)
    for (let k = i; k <= j; k += 1) sorted[k].rank = avgRank;
    i = j + 1;
  }
  return sorted;
}

// Approximate Mann-Whitney U + verdict.
function computeMannWhitney(g1, g2) {
  const pooled = rankPooled([
    ...g1.map((value, idx) => ({ value, group: 0, idx })),
    ...g2.map((value, idx) => ({ value, group: 1, idx })),
  ]);
  const n1 = g1.length;
  const n2 = g2.length;
  const R1 = pooled.filter((e) => e.group === 0).reduce((s, e) => s + e.rank, 0);
  const U1 = R1 - (n1 * (n1 + 1)) / 2;
  const U2 = n1 * n2 - U1;
  const U = Math.min(U1, U2);
  const muU = (n1 * n2) / 2;
  const sigmaU = Math.sqrt((n1 * n2 * (n1 + n2 + 1)) / 12);
  const z = sigmaU > 0 ? (U - muU) / sigmaU : 0;
  return { pooled, statLabel: "U", statValue: U, R1, z, significant: Math.abs(z) > 1.6 };
}

// Approximate Wilcoxon signed-rank on the paired differences.
function computeWilcoxon(before, after) {
  const diffs = before
    .map((b, i) => ({ d: after[i] - b, i }))
    .filter((o) => o.d !== 0);
  const ranked = rankPooled(diffs.map((o) => ({ value: Math.abs(o.d), idx: o.i, sign: Math.sign(o.d) })));
  let Wpos = 0;
  let Wneg = 0;
  ranked.forEach((e) => {
    if (e.sign > 0) Wpos += e.rank;
    else Wneg += e.rank;
  });
  const W = Math.min(Wpos, Wneg);
  const n = ranked.length;
  const muW = (n * (n + 1)) / 4;
  const sigmaW = Math.sqrt((n * (n + 1) * (2 * n + 1)) / 24);
  const z = sigmaW > 0 ? (W - muW) / sigmaW : 0;
  return { ranked, statLabel: "W", statValue: W, Wpos, Wneg, z, significant: Math.abs(z) > 1.5 };
}

// Approximate Kruskal-Wallis H.
function computeKruskal(groups) {
  const entries = [];
  groups.forEach((g, gi) => g.forEach((value, idx) => entries.push({ value, group: gi, idx })));
  const pooled = rankPooled(entries);
  const N = pooled.length;
  const rankSums = groups.map((g, gi) =>
    pooled.filter((e) => e.group === gi).reduce((s, e) => s + e.rank, 0)
  );
  const H =
    (12 / (N * (N + 1))) *
      rankSums.reduce((s, R, gi) => s + (R * R) / groups[gi].length, 0) -
    3 * (N + 1);
  // df = k-1; rough chi-square critical value lookup for the verdicts shown.
  const df = groups.length - 1;
  const crit = df === 2 ? 5.99 : df === 1 ? 3.84 : 7.81;
  return { pooled, rankSums, statLabel: "H", statValue: H, significant: H > crit, crit, df };
}

// Approximate parametric verdict (t / ANOVA) — uses spread, so outliers hurt it.
function parametricVerdict(testId, data) {
  if (testId === "mann_whitney" || testId === "wilcoxon") {
    const [g1, g2] = data;
    const diffMean = Math.abs(mean(g1) - mean(g2));
    const pooledSd = Math.sqrt((sd(g1) ** 2 + sd(g2) ** 2) / 2);
    const se = pooledSd * Math.sqrt(2 / g1.length);
    const t = se > 0 ? diffMean / se : 0;
    return { statLabel: "t", statValue: t, significant: t > 2.1 };
  }
  // ANOVA-ish: between-group spread vs within-group spread.
  const grand = mean(data.flat());
  const k = data.length;
  const nEach = data[0].length;
  const ssBetween = data.reduce((s, g) => s + nEach * (mean(g) - grand) ** 2, 0);
  const ssWithin = data.reduce(
    (s, g) => s + g.reduce((t2, x) => t2 + (x - mean(g)) ** 2, 0),
    0
  );
  const dfB = k - 1;
  const dfW = k * nEach - k;
  const F = ssWithin > 0 ? ssBetween / dfB / (ssWithin / dfW) : 0;
  return { statLabel: "F", statValue: F, significant: F > 5 };
}

// ── Component ───────────────────────────────────────────────────────────────

export default function StatNonParametricViz() {
  const [activeId, setActiveId] = useState("mann_whitney");
  const [outlier, setOutlier] = useState(false);

  const test = TESTS[activeId];
  const data = outlier ? test.messy : test.clean;

  let np;
  if (activeId === "mann_whitney") np = computeMannWhitney(data[0], data[1]);
  else if (activeId === "wilcoxon") np = computeWilcoxon(data[0], data[1]);
  else np = computeKruskal(data);

  const param = parametricVerdict(activeId, data);

  const groupColors = [ACCENT, GREEN, AMBER];

  const panel = {
    background: "rgba(255,255,255,0.02)",
    border: `1px solid ${DS.border}`,
    borderRadius: 12,
    padding: "14px 16px",
    marginBottom: 14,
  };
  const mono = "var(--ds-mono), monospace";
  const sans = "var(--ds-sans), sans-serif";

  // Build display rows of value→rank per group.
  function rankRowsFor(groupIndex) {
    if (activeId === "wilcoxon") {
      // For Wilcoxon the ranks live on the differences, not raw values.
      return null;
    }
    const pooled = np.pooled;
    return pooled
      .filter((e) => e.group === groupIndex)
      .sort((a, b) => a.idx - b.idx);
  }

  return (
    <div style={{ fontFamily: sans, color: DS.t1 }}>
      <div style={{ fontSize: 17, fontWeight: 700, color: DS.t1, marginBottom: 4 }}>
        Non-Parametric Tests · the power of ranking
      </div>
      <p
        style={{
          fontSize: 12,
          color: DS.t3,
          fontFamily: mono,
          lineHeight: 1.55,
          marginBottom: 16,
        }}
      >
        Rank-based tests replace raw values with their order, then ask whether one
        group sits systematically higher. Switch tests, then flip on an outlier to
        watch the parametric verdict break while the rank test holds.
      </p>

      {/* ── Test toggle ── */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        {TEST_ORDER.map((id) => {
          const t = TESTS[id];
          const on = activeId === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setActiveId(id)}
              style={{
                padding: "7px 14px",
                borderRadius: 8,
                border: `1px solid ${on ? ACCENT : DS.border}`,
                background: on ? "rgba(139,92,246,0.12)" : "rgba(255,255,255,0.02)",
                color: on ? ACCENT_LT : DS.t3,
                fontSize: 11,
                fontFamily: mono,
                cursor: "pointer",
                fontWeight: on ? 700 : 400,
                transition: "all 0.15s",
              }}
            >
              {t.name}
            </button>
          );
        })}
      </div>

      {/* ── Active test header + parametric counterpart ── */}
      <div
        style={{
          ...panel,
          background: "rgba(139,92,246,0.06)",
          border: `1px solid rgba(139,92,246,0.3)`,
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 700, color: ACCENT_LT }}>{test.name}</div>
        <div style={{ fontSize: 11, color: DS.t3, marginTop: 2 }}>{test.tagline}</div>
        <div style={{ fontSize: 11, color: DS.t2, marginTop: 8, fontFamily: mono }}>
          Non-parametric counterpart to:{" "}
          <span style={{ color: AMBER, fontWeight: 700 }}>{test.parametric}</span>
        </div>
      </div>

      {/* ── Outlier toggle ── */}
      <button
        type="button"
        onClick={() => setOutlier((v) => !v)}
        style={{
          width: "100%",
          textAlign: "left",
          padding: "10px 14px",
          borderRadius: 10,
          border: `1px solid ${outlier ? RED : DS.border}`,
          background: outlier ? "rgba(248,113,113,0.08)" : "rgba(255,255,255,0.02)",
          color: outlier ? RED : DS.t2,
          fontSize: 12,
          fontFamily: mono,
          cursor: "pointer",
          marginBottom: 14,
          transition: "all 0.15s",
        }}
      >
        {outlier ? "● Outlier injected — click to remove" : "○ Inject an outlier / skew"}
      </button>

      {/* ── Data → ranks ── */}
      <div style={panel}>
        <div style={{ fontSize: 11, fontFamily: mono, color: DS.t3, marginBottom: 10 }}>
          Step 1 · Pool all observations and replace values with their rank (ties share
          the average rank).
        </div>

        {data.map((group, gi) => {
          const c = groupColors[gi % groupColors.length];
          const rows = rankRowsFor(gi);
          return (
            <div key={gi} style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: c, marginBottom: 6 }}>
                {test.groups[gi]}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {group.map((val, vi) => {
                  const rank = rows ? rows[vi]?.rank : null;
                  const isOutlier =
                    outlier && Math.max(...test.messy.flat()) === val && val > 40;
                  return (
                    <div
                      key={vi}
                      style={{
                        background: "rgba(2,6,23,0.72)",
                        border: `1px solid ${isOutlier ? RED : DS.border}`,
                        borderRadius: 8,
                        padding: "6px 9px",
                        textAlign: "center",
                        fontFamily: mono,
                        minWidth: 46,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: isOutlier ? RED : DS.t1,
                        }}
                      >
                        {val}
                      </div>
                      {rank != null && (
                        <div style={{ fontSize: 10, color: c, marginTop: 2 }}>
                          r={rank}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              {rows && (
                <div style={{ fontSize: 10, color: DS.dim, marginTop: 5, fontFamily: mono }}>
                  rank sum R = {rows.reduce((s, e) => s + e.rank, 0)}
                </div>
              )}
            </div>
          );
        })}

        {activeId === "wilcoxon" && (
          <div style={{ marginTop: 4 }}>
            <div style={{ fontSize: 11, fontFamily: mono, color: DS.t3, marginBottom: 6 }}>
              Wilcoxon ranks the absolute paired differences (after − before), then sums
              ranks by sign:
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {np.ranked.map((e, i) => (
                <div
                  key={i}
                  style={{
                    background: "rgba(2,6,23,0.72)",
                    border: `1px solid ${e.sign > 0 ? GREEN : RED}`,
                    borderRadius: 8,
                    padding: "6px 9px",
                    textAlign: "center",
                    fontFamily: mono,
                    minWidth: 52,
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 700, color: DS.t1 }}>
                    {e.sign > 0 ? "+" : "−"}
                    {e.value}
                  </div>
                  <div style={{ fontSize: 10, color: e.sign > 0 ? GREEN : RED, marginTop: 2 }}>
                    r={e.rank}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 10, color: DS.dim, marginTop: 6, fontFamily: mono }}>
              W₊ = {np.Wpos} · W₋ = {np.Wneg} · W = min = {np.statValue}
            </div>
          </div>
        )}
      </div>

      {/* ── Verdict comparison ── */}
      <div style={panel}>
        <div style={{ fontSize: 11, fontFamily: mono, color: DS.t3, marginBottom: 10 }}>
          Step 2 · Compute the statistic and compare the two approaches.
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {/* Rank-based verdict */}
          <div
            style={{
              flex: "1 1 200px",
              background: "rgba(2,6,23,0.72)",
              border: `1px solid ${np.significant ? GREEN : DS.border}`,
              borderRadius: 10,
              padding: "12px 14px",
            }}
          >
            <div style={{ fontSize: 10, fontFamily: mono, color: ACCENT_LT, letterSpacing: "0.05em" }}>
              RANK-BASED · {test.name}
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: DS.t1, marginTop: 6, fontFamily: mono }}>
              {np.statLabel} = {Math.round(np.statValue * 100) / 100}
            </div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                marginTop: 6,
                color: np.significant ? GREEN : DS.t3,
              }}
            >
              {np.significant ? "Significant difference" : "No significant difference"}
            </div>
            <div style={{ fontSize: 10, color: DS.dim, marginTop: 4 }}>
              Robust — ranks ignore the magnitude of any single extreme value.
            </div>
          </div>

          {/* Parametric verdict */}
          <div
            style={{
              flex: "1 1 200px",
              background: "rgba(2,6,23,0.72)",
              border: `1px solid ${
                outlier && param.significant !== np.significant ? RED : DS.border
              }`,
              borderRadius: 10,
              padding: "12px 14px",
            }}
          >
            <div style={{ fontSize: 10, fontFamily: mono, color: AMBER, letterSpacing: "0.05em" }}>
              PARAMETRIC · {test.parametric}
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: DS.t1, marginTop: 6, fontFamily: mono }}>
              {param.statLabel} = {Math.round(param.statValue * 100) / 100}
            </div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                marginTop: 6,
                color: param.significant ? GREEN : RED,
              }}
            >
              {param.significant ? "Significant difference" : "No significant difference"}
            </div>
            <div style={{ fontSize: 10, color: DS.dim, marginTop: 4 }}>
              Uses means &amp; variance — sensitive to outliers and skew.
            </div>
          </div>
        </div>

        {outlier && (
          <div
            style={{
              marginTop: 12,
              background: "rgba(248,113,113,0.08)",
              border: `1px solid rgba(248,113,113,0.3)`,
              borderRadius: 8,
              padding: "10px 12px",
              fontSize: 11,
              color: DS.t2,
              lineHeight: 1.55,
            }}
          >
            <strong style={{ color: RED }}>Robustness in action: </strong>
            {test.messyNote}
            {param.significant !== np.significant && (
              <span style={{ color: AMBER }}>
                {" "}
                The two tests now disagree — this is exactly when you should trust the
                rank-based result.
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── Mapping table ── */}
      <div style={panel}>
        <div style={{ fontSize: 11, fontFamily: mono, color: DS.t3, marginBottom: 8 }}>
          Parametric ↔ non-parametric counterparts
        </div>
        <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 11, fontFamily: mono }}>
          <thead>
            <tr>
              {["Parametric", "Non-parametric"].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "6px 10px",
                    borderBottom: `1px solid ${DS.border}`,
                    color: DS.t3,
                    textAlign: "left",
                    fontWeight: 600,
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MAPPING.map(([p, n]) => (
              <tr key={p}>
                <td style={{ padding: "6px 10px", color: AMBER, borderBottom: `1px solid rgba(255,255,255,0.04)` }}>
                  {p}
                </td>
                <td style={{ padding: "6px 10px", color: ACCENT_LT, borderBottom: `1px solid rgba(255,255,255,0.04)` }}>
                  {n}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p style={{ fontSize: 11, color: DS.dim, lineHeight: 1.6, fontFamily: sans }}>
        Interview tip: Non-parametric tests buy robustness at the cost of power. When
        assumptions hold, a t-test or ANOVA detects a true effect with fewer subjects.
        Reach for rank-based tests when you have ordinal data (e.g. Likert scales), small
        n, heavy skew, or outliers you can't justify removing — and remember Mann-Whitney
        tests a shift in distribution, not a difference in means.
      </p>
    </div>
  );
}
