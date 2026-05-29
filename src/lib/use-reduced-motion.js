import { useState, useEffect } from "react";

/**
 * useReducedMotion — returns true when the user has requested reduced motion
 * via the `prefers-reduced-motion: reduce` media query. SSR-safe (returns
 * false when `window` is unavailable).
 */
export default function useReducedMotion() {
  const getInitial = () => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return false;
    }
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  };

  const [reduced, setReduced] = useState(getInitial);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return undefined;
    }
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = (event) => setReduced(event.matches);

    // Sync in case the value changed between render and effect.
    setReduced(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return reduced;
}
