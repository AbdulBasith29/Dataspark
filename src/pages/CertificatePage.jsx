import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { DS } from "../lib/ds-platform-tokens.js";

const COURSE_COLORS = {
  sql: { accent: "#F59E0B", soft: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.3)", label: "SQL & Databases" },
  statistics: { accent: "#8B5CF6", soft: "rgba(139,92,246,0.12)", border: "rgba(139,92,246,0.3)", label: "Statistics & Probability" },
  python: { accent: "#10B981", soft: "rgba(16,185,129,0.12)", border: "rgba(16,185,129,0.3)", label: "Python" },
  ml: { accent: "#0EA5E9", soft: "rgba(14,165,233,0.12)", border: "rgba(14,165,233,0.3)", label: "Machine Learning" },
};

function handlePrint() {
  window.print();
}

export default function CertificatePage() {
  const { certId } = useParams();
  const [state, setState] = useState({ loading: true, cert: null });

  // Credentials are stored server-side and verified by id — nothing about
  // the certificate lives in the URL itself.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/certificates?id=${encodeURIComponent(certId)}`);
        const data = await res.json().catch(() => ({}));
        if (!cancelled) setState({ loading: false, cert: res.ok ? data.certificate : null });
      } catch {
        if (!cancelled) setState({ loading: false, cert: null });
      }
    })();
    return () => { cancelled = true; };
  }, [certId]);

  if (state.loading) {
    return (
      <div style={{ minHeight: "100vh", background: DS.bg, color: DS.t3, display: "grid", placeItems: "center", fontFamily: "var(--ds-mono), monospace", fontSize: 13 }}>
        Verifying credential…
      </div>
    );
  }

  const raw = state.cert;
  if (!raw) {
    return (
      <div style={{ minHeight: "100vh", background: DS.bg, color: DS.t2, display: "grid", placeItems: "center", padding: 24, fontFamily: "var(--ds-sans), sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <p style={{ color: DS.t3, marginBottom: 20 }}>This credential could not be verified — the link is invalid or the certificate does not exist.</p>
          <Link to="/platform" style={{ color: DS.ind, textDecoration: "none", fontSize: 14 }}>← Back to platform</Link>
        </div>
      </div>
    );
  }

  const cert = {
    id: raw.id,
    name: raw.recipient_name,
    title: raw.title,
    course: raw.course_id,
    date: raw.issued_at,
    dimensions: raw.dimensions,
  };
  const theme = COURSE_COLORS[cert.course] || COURSE_COLORS.sql;
  const issueDate = new Date(cert.date);
  const monthName = issueDate.toLocaleString("default", { month: "long" });
  const year = issueDate.getFullYear();

  const linkedInUrl = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(cert.title)}&issueYear=${year}&issueMonth=${issueDate.getMonth() + 1}&certUrl=${encodeURIComponent(window.location.href)}&certId=${encodeURIComponent(cert.id)}`;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        :root { --ds-sans: 'Manrope', system-ui, sans-serif; --ds-mono: 'JetBrains Mono', monospace; }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${DS.bg}; }
        @media print {
          .no-print { display: none !important; }
          body { background: white; }
          .cert-card { box-shadow: none !important; border: 2px solid #e2e8f0 !important; background: white !important; }
          .cert-name { color: #1e293b !important; }
          .cert-body { color: #334155 !important; }
        }
      `}</style>

      <div style={{ minHeight: "100vh", background: DS.bg, padding: "clamp(20px, 5vw, 60px) clamp(16px, 5vw, 40px)", fontFamily: "var(--ds-sans), sans-serif", display: "flex", flexDirection: "column", alignItems: "center" }}>

        {/* Nav */}
        <div className="no-print" style={{ width: "100%", maxWidth: 720, display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
          <Link to="/platform" style={{ color: DS.t3, textDecoration: "none", fontSize: 13, fontFamily: "var(--ds-mono), monospace" }}>← Back to platform</Link>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              type="button"
              onClick={handlePrint}
              style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${DS.border}`, borderRadius: 8, padding: "8px 16px", color: DS.t2, fontSize: 13, cursor: "pointer", fontFamily: "var(--ds-sans), sans-serif" }}
            >
              Save as PDF
            </button>
            <a
              href={linkedInUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ background: "#0A66C2", border: "none", borderRadius: 8, padding: "8px 16px", color: "#fff", fontSize: 13, fontWeight: 700, textDecoration: "none", fontFamily: "var(--ds-sans), sans-serif", display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              Add to LinkedIn
            </a>
          </div>
        </div>

        {/* Certificate card */}
        <div
          className="cert-card"
          style={{
            width: "100%",
            maxWidth: 720,
            background: "rgba(6,8,20,0.95)",
            border: `2px solid ${theme.border}`,
            borderRadius: 20,
            padding: "clamp(32px, 6vw, 56px) clamp(24px, 6vw, 56px)",
            boxShadow: `0 0 80px ${theme.soft}, 0 32px 64px rgba(0,0,0,0.6)`,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Background glow */}
          <div style={{ position: "absolute", top: -80, right: -80, width: 300, height: 300, borderRadius: "50%", background: `radial-gradient(circle, ${theme.soft} 0%, transparent 70%)`, pointerEvents: "none" }} />

          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 40, flexWrap: "wrap", gap: 12 }}>
            <div>
              <div style={{ fontSize: 11, fontFamily: "var(--ds-mono), monospace", fontWeight: 700, letterSpacing: "0.18em", color: theme.accent, textTransform: "uppercase", marginBottom: 6 }}>
                DataSpark
              </div>
              <div style={{ fontSize: 10, fontFamily: "var(--ds-mono), monospace", color: DS.t3, letterSpacing: "0.1em" }}>
                Certificate of Completion
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 10, fontFamily: "var(--ds-mono), monospace", color: DS.dim }}>Issued</div>
              <div style={{ fontSize: 12, fontFamily: "var(--ds-mono), monospace", color: DS.t3, marginTop: 2 }}>{monthName} {year}</div>
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: `linear-gradient(90deg, ${theme.accent}66, transparent)`, marginBottom: 36 }} />

          {/* This certifies */}
          <div style={{ fontSize: 13, color: DS.t3, marginBottom: 10, fontStyle: "italic" }}>This certifies that</div>
          <div className="cert-name" style={{ fontSize: "clamp(26px, 5vw, 40px)", fontWeight: 800, color: DS.t1, letterSpacing: "-0.02em", marginBottom: 10, lineHeight: 1.1 }}>
            {cert.name}
          </div>
          <div className="cert-body" style={{ fontSize: 15, color: DS.t2, marginBottom: 32, lineHeight: 1.6 }}>
            has successfully completed the <strong style={{ color: DS.t1 }}>{cert.title}</strong> — a scenario-based technical assessment covering {theme.label}.
          </div>

          {/* Skill dimensions */}
          {cert.dimensions && cert.dimensions.length > 0 && (
            <div style={{ marginBottom: 36 }}>
              <div style={{ fontSize: 10, fontFamily: "var(--ds-mono), monospace", fontWeight: 700, letterSpacing: "0.14em", color: DS.dim, textTransform: "uppercase", marginBottom: 14 }}>Assessed Skills</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {cert.dimensions.map((d, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderRadius: 10, background: "rgba(255,255,255,0.03)", border: `1px solid ${DS.border}`, flexWrap: "wrap", gap: 8 }}>
                    <span style={{ fontSize: 13, color: DS.t2 }}>{d.label}</span>
                    <span style={{ fontSize: 11, fontFamily: "var(--ds-mono), monospace", fontWeight: 700, color: d.result.includes("Recovery") ? "#FCD34D" : DS.grn }}>
                      {d.result}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div style={{ height: 1, background: `linear-gradient(90deg, ${theme.accent}44, transparent)`, marginBottom: 24 }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 12 }}>
            <div>
              <div style={{ fontSize: 10, fontFamily: "var(--ds-mono), monospace", color: DS.dim, marginBottom: 4 }}>Credential ID</div>
              <div style={{ fontSize: 11, fontFamily: "var(--ds-mono), monospace", color: DS.t3 }}>{cert.id}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: theme.accent }}>DataSpark</div>
              <div style={{ fontSize: 10, color: DS.dim, fontFamily: "var(--ds-mono), monospace" }}>dataspark.app</div>
            </div>
          </div>
        </div>

        {/* CTA buttons (mobile-friendly) */}
        <div className="no-print" style={{ width: "100%", maxWidth: 720, display: "flex", gap: 12, marginTop: 24, flexWrap: "wrap" }}>
          <a
            href={linkedInUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ flex: 1, minWidth: 200, background: "#0A66C2", borderRadius: 10, padding: "14px 20px", color: "#fff", fontSize: 14, fontWeight: 700, textDecoration: "none", textAlign: "center", fontFamily: "var(--ds-sans), sans-serif" }}
          >
            Add to LinkedIn Profile →
          </a>
          <button
            type="button"
            onClick={handlePrint}
            style={{ flex: 1, minWidth: 160, background: "rgba(255,255,255,0.05)", border: `1px solid ${DS.border}`, borderRadius: 10, padding: "14px 20px", color: DS.t2, fontSize: 14, cursor: "pointer", fontFamily: "var(--ds-sans), sans-serif" }}
          >
            Save as PDF
          </button>
        </div>

        <p className="no-print" style={{ marginTop: 20, fontSize: 12, color: DS.dim, textAlign: "center", fontFamily: "var(--ds-mono), monospace" }}>
          ✓ Verified credential — anyone with this URL sees the server-issued record · {window.location.href}
        </p>
      </div>
    </>
  );
}
