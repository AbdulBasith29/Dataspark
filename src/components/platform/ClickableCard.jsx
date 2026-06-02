import { useState } from "react";
import { DS } from "../../lib/ds-platform-tokens.js";

/**
 * ClickableCard — an accessible card that behaves like a button.
 * Semantic element first (role="button"), visible focus ring on keyboard
 * focus, full keyboard activation (Enter / Space), and a disabled state.
 */
export default function ClickableCard({
  onActivate,
  children,
  style,
  ariaLabel,
  disabled = false,
}) {
  const [focused, setFocused] = useState(false);

  const handleActivate = (event) => {
    if (disabled) return;
    if (typeof onActivate === "function") onActivate(event);
  };

  const handleKeyDown = (event) => {
    if (disabled) return;
    if (event.key === "Enter" || event.key === " " || event.key === "Spacebar") {
      if (event.key === " " || event.key === "Spacebar") {
        event.preventDefault();
      }
      handleActivate(event);
    }
  };

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label={ariaLabel}
      aria-disabled={disabled}
      onClick={handleActivate}
      onKeyDown={handleKeyDown}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        cursor: disabled ? "not-allowed" : "pointer",
        outline: "none",
        ...style,
        boxShadow: focused
          ? DS.focusRing
          : style && style.boxShadow !== undefined
            ? style.boxShadow
            : undefined,
      }}
    >
      {children}
    </div>
  );
}
