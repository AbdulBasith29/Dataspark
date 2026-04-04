const P = {
  track: "rgba(15,23,42,0.9)",
  fill: "linear-gradient(90deg,#6366F1,#34D399)",
  border: "rgba(148,163,184,0.4)",
  t1: "#F8FAFC",
  t2: "#E2E8F0",
  t3: "#94A3B8",
};

export default function ProgressBar({
  value = 0,
  label,
  compact = false,
}) {
  const clamped = Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0));

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 6,
        width: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 8,
          fontSize: compact ? 11 : 12,
          color: P.t3,
        }}
      >
        {label ? (
          <span
            style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {label}
          </span>
        ) : (
          <span />
        )}
        <span
          style={{
            fontWeight: 600,
            color: P.t2,
            fontSize: compact ? 11 : 12,
          }}
        >
          {clamped.toFixed(0)}%
        </span>
      </div>

      <div
        style={{
          height: compact ? 8 : 10,
          borderRadius: 999,
          background: P.track,
          border: `1px solid ${P.border}`,
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            transformOrigin: "left center",
            transform: `scaleX(${clamped / 100})`,
            backgroundImage: P.fill,
            transition: "transform 220ms ease-out",
          }}
        />
      </div>
    </div>
  );
}

