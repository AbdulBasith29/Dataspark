import React from "react";
import { DS, dsGlassCard } from "../lib/ds-platform-tokens.js";

const MONO = "var(--ds-mono), monospace";

export default class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, refreshFocused: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error: error || null };
  }

  componentDidCatch(error, info) {
    console.error("[DataSpark] App boundary caught render error", error, info);
  }

  render() {
    if (this.state.hasError) {
      const error = this.state.error;
      const message = error?.message || "Unknown error";
      const stack = error?.stack || "";

      return (
        <div style={{ minHeight: "100dvh", background: DS.bg, color: DS.t2, display: "grid", placeItems: "center", padding: 24 }}>
          <div style={{ ...dsGlassCard({ padding: "24px 28px", maxWidth: 560 }) }}>
            <h2 style={{ margin: "0 0 8px", color: DS.t1 }}>Something glitched on our end</h2>
            <p style={{ margin: 0, color: DS.t3, lineHeight: 1.6 }}>
              Your progress is saved. Refreshing usually fixes this — if it keeps happening, let us know.
            </p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              onFocus={() => this.setState({ refreshFocused: true })}
              onBlur={() => this.setState({ refreshFocused: false })}
              style={{
                appearance: "none",
                cursor: "pointer",
                marginTop: 16,
                fontFamily: MONO,
                fontSize: 13,
                fontWeight: 600,
                padding: "10px 18px",
                borderRadius: DS.radiusSm,
                border: "1px solid transparent",
                background: DS.indB,
                color: DS.t1,
                outline: "none",
                transition: "box-shadow 0.15s ease",
                boxShadow: this.state.refreshFocused ? DS.focusRing : DS.shadowCta,
              }}
            >
              Refresh the page
            </button>

            <details style={{ marginTop: 18 }}>
              <summary
                style={{
                  cursor: "pointer",
                  fontFamily: MONO,
                  fontSize: 12,
                  color: DS.t3,
                  userSelect: "none",
                }}
              >
                Technical details
              </summary>
              <pre
                style={{
                  marginTop: 12,
                  marginBottom: 0,
                  color: "#FCA5A5",
                  fontFamily: MONO,
                  fontSize: 12,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {message}
                {stack ? `\n\n${stack}` : ""}
              </pre>
            </details>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
