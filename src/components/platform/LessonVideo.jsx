import { useState } from "react";
import { DS } from "../../lib/ds-platform-tokens.js";

/**
 * Embeds a YouTube video inline — no redirect, no retention kill.
 * Props:
 *   videoId  — YouTube video ID (e.g. "W8KRzm-HUcc")
 *   title    — descriptive label shown above the embed
 *   start    — optional start time in seconds (default 0)
 *   note     — optional short text shown below, e.g. "Watch 2:40–8:00 for the key section"
 */
export default function LessonVideo({ videoId, title, start = 0, note }) {
  const [loaded, setLoaded] = useState(false);
  const [clicked, setClicked] = useState(false);

  if (!videoId) return null;

  const src = `https://www.youtube.com/embed/${videoId}?start=${start}&rel=0&modestbranding=1&color=white`;
  const thumb = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

  return (
    <div style={{ marginBottom: 28 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 6,
          background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 12, color: "#EF4444",
        }}>▶</div>
        <div>
          <div style={{ fontSize: 10, color: DS.t3, fontFamily: "var(--ds-mono), monospace", letterSpacing: "0.1em", fontWeight: 600 }}>CURATED CLIP</div>
          {title && <div style={{ fontSize: 13, color: DS.t1, fontFamily: "var(--ds-sans), sans-serif", fontWeight: 600, marginTop: 1 }}>{title}</div>}
        </div>
      </div>

      {/* Embed container */}
      <div style={{
        position: "relative",
        width: "100%",
        paddingBottom: "56.25%", // 16:9
        borderRadius: 12,
        overflow: "hidden",
        border: `1px solid rgba(255,255,255,0.08)`,
        background: "#000",
      }}>
        {!clicked ? (
          /* Click-to-load thumbnail — avoids iframe load until user wants it */
          <div
            onClick={() => setClicked(true)}
            style={{
              position: "absolute", inset: 0,
              backgroundImage: `url(${thumb})`,
              backgroundSize: "cover", backgroundPosition: "center",
              cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            {/* Dark overlay */}
            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)" }} />
            {/* Play button */}
            <div style={{
              position: "relative", zIndex: 1,
              width: 64, height: 64, borderRadius: "50%",
              background: "rgba(239,68,68,0.92)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 24px rgba(239,68,68,0.5)",
              transition: "transform 0.15s",
            }}>
              <span style={{ color: "#fff", fontSize: 22, marginLeft: 4 }}>▶</span>
            </div>
          </div>
        ) : (
          <iframe
            src={src}
            title={title || "Lesson video"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            onLoad={() => setLoaded(true)}
            style={{
              position: "absolute", inset: 0,
              width: "100%", height: "100%",
              border: "none",
              opacity: loaded ? 1 : 0,
              transition: "opacity 0.3s",
            }}
          />
        )}
      </div>

      {note && (
        <div style={{
          marginTop: 8, fontSize: 11, color: DS.t3,
          fontFamily: "var(--ds-mono), monospace", lineHeight: 1.5,
          paddingLeft: 4,
        }}>
          ◈ {note}
        </div>
      )}
    </div>
  );
}
