import { DS, dsGlassCard } from "../lib/ds-platform-tokens.js";

const ROADMAP = [
  "Restore core course/lesson navigation",
  "Re-enable lesson module rendering",
  "Re-enable visual labs behind guarded dynamic imports",
  "Re-enable analytics instrumentation after runtime validation",
];

export default function DataSparkPlatform() {
  return (
    <div style={{ minHeight: "100dvh", background: DS.bg, color: DS.t1, padding: "32px 20px", fontFamily: "var(--ds-sans), system-ui, sans-serif" }}>
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        <div style={{ ...dsGlassCard({ padding: "24px" }), border: `1px solid ${DS.borderStrong}` }}>
          <h1 style={{ margin: "0 0 12px", fontSize: "clamp(24px,4vw,34px)", letterSpacing: "-0.02em" }}>DataSpark Platform</h1>
          <p style={{ margin: "0 0 14px", color: DS.t3, lineHeight: 1.7 }}>
            We are running the platform in <strong>stability mode</strong> to prevent the recurring runtime initialization crash on <code>/platform</code>.
          </p>
          <p style={{ margin: "0 0 10px", color: DS.t2, lineHeight: 1.7 }}>
            The previous crash signature was: <code>Cannot access variable before initialization</code>. This page intentionally avoids the failing import graph.
          </p>
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 12, color: DS.dim, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 8 }}>Recovery steps in progress</div>
            <ol style={{ margin: 0, paddingLeft: 18, color: DS.t2, lineHeight: 1.8 }}>
              {ROADMAP.map((item) => <li key={item}>{item}</li>)}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
