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
