/** Shared with marketing (`landing-page.jsx` P) — keep platform visually in-family. */
export const DS = {
  bg: "#020617",
  bgElev: "#080E1A",
  // Surface ladder: opaque steps, depth via luminance — not blur/shadow
  cardGlass: "#0A0F1E",
  card: "rgba(255,255,255,0.02)",
  surface2: "#111726",
  border: "rgba(255,255,255,0.07)",
  borderHover: "rgba(255,255,255,0.13)",
  borderStrong: "rgba(129,140,248,0.22)",
  t1: "#F8FAFC",
  t2: "rgba(255,255,255,0.82)",
  t3: "#94A3B8",
  dim: "#5B6678",
  ind: "#818CF8",
  grn: "#34D399",
  indB: "#6366F1",
  // Top-edge highlight is the elevation cue — no drop shadows in dark mode
  shadowCard: "inset 0 1px 0 rgba(255,255,255,0.05)",
  shadowCta: "inset 0 1px 0 rgba(255,255,255,0.10)",
  radiusLg: 16,
  radiusMd: 12,
  radiusSm: 8,
  focusRing: "0 0 0 2px rgba(99,102,241,0.55)",
  // Motion tokens — mirror the CSS vars in index.html for inline-style use
  easeOut: "cubic-bezier(0.23, 1, 0.32, 1)",
  easeInOut: "cubic-bezier(0.77, 0, 0.175, 1)",
  durFast: "140ms",
  durBase: "200ms",
};

export function dsGlassCard(extra = {}) {
  return {
    background: DS.cardGlass,
    border: `1px solid ${DS.border}`,
    borderRadius: DS.radiusLg,
    boxShadow: DS.shadowCard,
    ...extra,
  };
}


export function dsInteractiveButton(base = {}) {
  return {
    outline: "none",
    transition: `box-shadow ${DS.durBase} ${DS.easeOut}, border-color ${DS.durFast} ${DS.easeOut}`,
    ...base,
  };
}
