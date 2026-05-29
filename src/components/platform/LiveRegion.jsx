/**
 * LiveRegion — a visually-hidden ARIA live region used to announce state
 * changes (e.g. "lesson loaded", "marked complete") to screen readers.
 */
export default function LiveRegion({ message, politeness = "polite" }) {
  return (
    <div
      aria-live={politeness}
      role="status"
      style={{
        position: "absolute",
        width: 1,
        height: 1,
        padding: 0,
        margin: -1,
        overflow: "hidden",
        clip: "rect(0, 0, 0, 0)",
        whiteSpace: "nowrap",
        border: 0,
      }}
    >
      {message}
    </div>
  );
}
