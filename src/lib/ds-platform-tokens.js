/** Shared with marketing (`landing-page.jsx` P) — keep platform visually in-family. */
export const DS = {
  bg: "#020617",
  bgElev: "#080E1A",
  cardGlass: "rgba(6,8,20,0.78)",
  card: "rgba(255,255,255,0.02)",
  border: "rgba(255,255,255,0.06)",
  borderStrong: "rgba(129,140,248,0.22)",
  t1: "#F8FAFC",
  t2: "#E2E8F0",
  t3: "#94A3B8",
  dim: "#475569",
  ind: "#818CF8",
  grn: "#34D399",
  indB: "#6366F1",
  shadowCard: "0 32px 64px rgba(0,0,0,0.5)",
  shadowCta: "0 6px 24px rgba(99,102,241,0.45)",
  radiusLg: 18,
  radiusMd: 12,
  radiusSm: 10,
};

export function dsGlassCard(extra = {}) {
  return {
    background: DS.cardGlass,
    backdropFilter: "blur(28px)",
    WebkitBackdropFilter: "blur(28px)",
    border: `1px solid ${DS.border}`,
    borderRadius: DS.radiusLg,
    boxShadow: DS.shadowCard,
    ...extra,
  };
}
