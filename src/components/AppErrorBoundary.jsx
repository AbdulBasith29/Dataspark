import React from "react";
import { DS, dsGlassCard } from "../lib/ds-platform-tokens.js";

export default class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message || "Unknown error" };
  }

  componentDidCatch(error, info) {
    console.error("[DataSpark] App boundary caught render error", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: "100dvh", background: DS.bg, color: DS.t2, display: "grid", placeItems: "center", padding: 24 }}>
          <div style={{ ...dsGlassCard({ padding: "24px 28px", maxWidth: 560 }) }}>
            <h2 style={{ margin: "0 0 8px", color: DS.t1 }}>We hit a rendering error</h2>
            <p style={{ margin: 0, color: DS.t3, lineHeight: 1.6 }}>
              The platform failed to render. Refresh the page. If this persists, share this message with engineering.
            </p>
            <pre style={{ marginTop: 12, color: "#FCA5A5", whiteSpace: "pre-wrap" }}>{this.state.message}</pre>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
