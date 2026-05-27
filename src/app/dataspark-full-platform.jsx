import { DS, dsGlassCard } from "../lib/ds-platform-tokens.js";

export default function DataSparkPlatform() {
  return (
    <div style={{ minHeight: "100dvh", background: DS.bg, color: DS.t1, padding: "32px 20px", fontFamily: "var(--ds-sans), system-ui, sans-serif" }}>
      <div style={{ maxWidth: 920, margin: "0 auto" }}>
        <div style={{ ...dsGlassCard({ padding: "22px 24px" }) }}>
          <h1 style={{ margin: "0 0 10px", fontSize: "clamp(24px,4vw,34px)", letterSpacing: "-0.02em" }}>DataSpark Platform</h1>
          <p style={{ margin: 0, color: DS.t3, lineHeight: 1.7 }}>
            We temporarily placed the platform in a safe-render mode to eliminate the recurring runtime crash on <strong>/platform</strong>.
            The landing page and routing remain stable while we re-introduce lesson modules and visual labs incrementally with crash isolation.
          </p>
        </div>
      </div>
    </div>
  );
}
