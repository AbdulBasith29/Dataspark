import { useState } from "react";
import { DS, dsGlassCard } from "../../lib/ds-platform-tokens.js";
import { getLessonFraming } from "../../lib/use-learner-intent.js";

const MONO = "var(--ds-mono), monospace";
const SANS = "var(--ds-sans), sans-serif";

/**
 * IntentLessonIntro (DS-203) — a compact, intent-aware banner that sits at the
 * top of a lesson. It reframes the lesson for the learner's chosen intent
 * (interview prep / upskilling / foundational) and offers a tailored CTA.
 *
 * Props:
 *   intent      — the chosen learner intent id (or falsy). Falsy => renders nothing.
 *   lessonTitle — the lesson title, woven into the framing copy.
 *   onCta       — optional handler; the CTA button only renders when this is a function.
 */
export default function IntentLessonIntro({ intent, lessonTitle, onCta }) {
  const [focused, setFocused] = useState(false);

  // No chosen intent -> lessons stay neutral.
  if (!intent) return null;

  const framing = getLessonFraming(intent, lessonTitle);
  if (!framing) return null;

  const { introLabel, introBody, ctaLabel, accent } = framing;
  const hasCta = typeof onCta === "function";

  return (
    <div
      style={dsGlassCard({
        display: "flex",
        flexDirection: "column",
        gap: 10,
        padding: "14px 16px 14px 18px",
        borderRadius: DS.radiusMd,
        borderLeft: `3px solid ${accent}`,
      })}
    >
      <span
        style={{
          fontFamily: MONO,
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: accent,
        }}
      >
        {introLabel}
      </span>

      <p
        style={{
          margin: 0,
          fontFamily: SANS,
          fontSize: 14,
          lineHeight: 1.5,
          color: DS.t2,
        }}
      >
        {introBody}
      </p>

      {hasCta && (
        <button
          type="button"
          onClick={onCta}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            alignSelf: "flex-start",
            fontFamily: MONO,
            fontSize: 12,
            lineHeight: 1,
            fontWeight: 600,
            padding: "9px 14px",
            cursor: "pointer",
            borderRadius: DS.radiusSm,
            border: `1px solid ${accent}`,
            background: "transparent",
            color: accent,
            transition: "box-shadow 0.15s ease, border-color 0.15s ease, background 0.15s ease",
            outline: "none",
            boxShadow: focused ? DS.focusRing : "none",
          }}
        >
          {ctaLabel}
        </button>
      )}
    </div>
  );
}
