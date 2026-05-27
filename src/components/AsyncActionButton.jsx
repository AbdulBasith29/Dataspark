import { DS } from "../lib/ds-platform-tokens.js";

export default function AsyncActionButton({
  onClick,
  state = "idle", // idle | pending | success | error
  idleLabel,
  pendingLabel = "Working...",
  successLabel = "Done",
  errorLabel = "Try again",
  style = {},
  disabled = false,
  title,
}) {
  const isBusy = state === "pending";
  const isDisabled = disabled || isBusy;

  const label = state === "pending"
    ? pendingLabel
    : state === "success"
      ? successLabel
      : state === "error"
        ? errorLabel
        : idleLabel;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      aria-busy={isBusy}
      title={title}
      style={{
        background: !isDisabled ? DS.indB : "rgba(255,255,255,0.06)",
        border: "none",
        borderRadius: DS.radiusSm,
        padding: "14px 22px",
        color: !isDisabled ? "#fff" : DS.dim,
        fontSize: 14,
        fontWeight: 700,
        cursor: !isDisabled ? "pointer" : "not-allowed",
        fontFamily: "var(--ds-sans), sans-serif",
        boxShadow: !isDisabled ? DS.shadowCta : "none",
        ...style,
      }}
    >
      {label}
    </button>
  );
}
