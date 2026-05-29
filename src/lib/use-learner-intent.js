import { useState, useEffect } from "react";

/**
 * Learner intent segmentation (DS-106). Three segments the critique named,
 * used to tailor CTA framing across the platform.
 */
export const LEARNER_INTENTS = [
  {
    id: "interview",
    label: "Interview prep",
    blurb: "Land the offer — drill explanations and tradeoffs.",
    ctaFraming: "Practice explaining this out loud.",
  },
  {
    id: "upskill",
    label: "Upskilling for my role",
    blurb: "Level up on the job — apply this to real pipelines.",
    ctaFraming: "Apply this to your current codebase.",
  },
  {
    id: "foundational",
    label: "Building foundations",
    blurb: "Learn it properly from the ground up.",
    ctaFraming: "Master the basics before moving on.",
  },
];

const STORAGE_KEY = "ds_learner_intent";
const DEFAULT_FRAMING = "Put this into practice.";

function readStored() {
  if (typeof window === "undefined" || !window.localStorage) return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    // Stored as a plain id string; tolerate legacy JSON-wrapped values.
    let value = raw;
    if (raw.charAt(0) === '"') {
      try {
        value = JSON.parse(raw);
      } catch {
        value = raw;
      }
    }
    return LEARNER_INTENTS.some((i) => i.id === value) ? value : null;
  } catch {
    return null;
  }
}

/**
 * getIntentFraming — returns the ctaFraming for an intent id, or a sensible
 * default when the id is null/unknown.
 */
export function getIntentFraming(intentId) {
  const match = LEARNER_INTENTS.find((i) => i.id === intentId);
  return match ? match.ctaFraming : DEFAULT_FRAMING;
}

/**
 * useLearnerIntent — reads the persisted learner intent and exposes a setter
 * that writes back to localStorage. SSR-safe and resilient to storage errors.
 */
export default function useLearnerIntent() {
  const [intent, setIntentState] = useState(null);

  // Hydrate from storage on mount (avoids SSR/hydration mismatch).
  useEffect(() => {
    const stored = readStored();
    if (stored) setIntentState(stored);
  }, []);

  const setIntent = (id) => {
    const valid = LEARNER_INTENTS.some((i) => i.id === id) ? id : null;
    setIntentState(valid);
    if (typeof window === "undefined" || !window.localStorage) return;
    try {
      if (valid) {
        window.localStorage.setItem(STORAGE_KEY, valid);
      } else {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // Ignore storage failures (private mode, quota, disabled).
    }
  };

  const intentMeta = LEARNER_INTENTS.find((i) => i.id === intent) || null;

  return { intent, setIntent, intentMeta };
}

/**
 * INTENT_LESSON_FRAMING (DS-203) — per-intent framing for lesson intros/CTAs.
 * `introBody` is a function of the lesson title so the framing names the lesson.
 * `accent` is a plain string (hex or token value) resolved by the component,
 * keeping this lib free of UI-token imports and safe to import anywhere.
 */
export const INTENT_LESSON_FRAMING = {
  interview: {
    introLabel: "Interview lens",
    introBody: (t) =>
      `Be ready to explain ${t} out loud — focus on tradeoffs and failure modes an interviewer will probe.`,
    ctaLabel: "Practice explaining this",
    accent: "#818CF8",
  },
  upskill: {
    introLabel: "On-the-job lens",
    introBody: (t) =>
      `Map ${t} to a real pipeline you own — what would you change in your codebase after this?`,
    ctaLabel: "Apply to your work",
    accent: "#34D399",
  },
  foundational: {
    introLabel: "Foundations lens",
    introBody: (t) =>
      `Take ${t} slow and build correct mental models before moving on — depth beats speed here.`,
    ctaLabel: "Master the basics",
    accent: "#FCD34D",
  },
};

/**
 * getLessonFraming — resolves the lesson framing for an intent id, with the
 * introBody string already computed from the lesson title. Returns null when
 * the intent id is falsy or unknown so callers can render nothing.
 */
export function getLessonFraming(intentId, lessonTitle) {
  if (!intentId) return null;
  const framing = INTENT_LESSON_FRAMING[intentId];
  if (!framing) return null;
  return {
    introLabel: framing.introLabel,
    introBody: framing.introBody(lessonTitle),
    ctaLabel: framing.ctaLabel,
    accent: framing.accent,
  };
}
