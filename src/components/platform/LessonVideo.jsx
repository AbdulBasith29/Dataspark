import { useState } from "react";
import { DS } from "../../lib/ds-platform-tokens.js";

export default function LessonVideo({ videoId, title, start = 0, note }) {
  const [active, setActive] = useState(false);
  const [loaded, setLoaded] = useState(false);

  if (!videoId) return null;

  const src = `https://www.youtube.com/embed/${videoId}?start=${start}&rel=0&modestbranding=1&autoplay=1&color=white`;

  return (
    <div style={{ marginBottom: 28 }}>
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 6,
          background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 11, color: "#EF4444", flexShrink: 0,
        }}>▶</div>
        <div>
          <div style={{ fontSize: 10, color: DS.t3, fontFamily: "var(--ds-mono), monospace", letterSpacing: "0.1em", fontWeight: 600 }}>
            CURATED CLIP
          </div>
          {title && (
            <div style={{ fontSize: 13, color: DS.t1, fontFamily: "var(--ds-sans), sans-serif", fontWeight: 600, marginTop: 1 }}>
              {title}
            </div>
          )}
        </div>
      </div>

      {/* Video container — always visible */}
      <div style={{
        position: "relative",
        width: "100%",
        paddingBottom: "56.25%",
        borderRadius: 12,
        overflow: "hidden",
        border: `1px solid rgba(255,255,255,0.08)`,
        background: "#0a0a0f",
      }}>
        {!active ? (
          /* Styled placeholder — no external image dependency */
          <div
            onClick={() => setActive(true)}
            style={{
              position: "absolute", inset: 0,
              cursor: "pointer",
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              gap: 14,
              background: "linear-gradient(135deg, #0d0d1a 0%, #0a0f1e 100%)",
            }}
          >
            {/* YouTube-style logo mark */}
            <div style={{
              width: 72, height: 50, borderRadius: 12,
              background: "#EF4444",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 24px rgba(239,68,68,0.45)",
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <polygon points="9.5,7 9.5,17 17,12" />
              </svg>
            </div>

            <div style={{ textAlign: "center" }}>
              <div style={{
                fontSize: 14, fontWeight: 600, color: DS.t1,
                fontFamily: "var(--ds-sans), sans-serif", marginBottom: 4,
              }}>
                {title || "Watch lesson video"}
              </div>
              <div style={{
                fontSize: 11, color: DS.t3,
                fontFamily: "var(--ds-mono), monospace",
              }}>
                Click to play · stays on DataSpark
              </div>
            </div>

            {/* Decorative grid lines for depth */}
            <div style={{
              position: "absolute", inset: 0, pointerEvents: "none",
              backgroundImage:
                "linear-gradient(rgba(129,140,248,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(129,140,248,0.04) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }} />
          </div>
        ) : (
          <>
            {!loaded && (
              <div style={{
                position: "absolute", inset: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "#000", zIndex: 1,
              }}>
                <div style={{ color: DS.t3, fontFamily: "var(--ds-mono), monospace", fontSize: 12 }}>
                  Loading…
                </div>
              </div>
            )}
            <iframe
              src={src}
              title={title || "Lesson video"}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
              onLoad={() => setLoaded(true)}
              style={{
                position: "absolute", inset: 0,
                width: "100%", height: "100%",
                border: "none",
                opacity: loaded ? 1 : 0,
                transition: "opacity 0.3s",
                zIndex: 2,
              }}
            />
          </>
        )}
      </div>

      {note && (
        <div style={{
          marginTop: 8, fontSize: 11, color: DS.t3,
          fontFamily: "var(--ds-mono), monospace", lineHeight: 1.55,
          paddingLeft: 2,
        }}>
          ◈ {note}
        </div>
      )}
    </div>
  );
}
