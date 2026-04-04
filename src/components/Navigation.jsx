import { useMemo } from "react";

const P = {
  bg: "rgba(2,6,23,0.96)",
  border: "rgba(148,163,184,0.25)",
  chip: "rgba(15,23,42,0.9)",
  chipActive: "rgba(79,70,229,0.25)",
  t1: "#F8FAFC",
  t2: "#E2E8F0",
  t3: "#94A3B8",
  indB: "#6366F1",
  grn: "#34D399",
};

export default function Navigation({
  courses = [],
  activeCourseId,
  onSelectCourse,
  onBackHome,
  summary,
}) {
  const activeCourse = useMemo(
    () => courses.find((c) => c.id === activeCourseId) || null,
    [courses, activeCourseId],
  );

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 20,
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        background: P.bg,
        borderBottom: `1px solid ${P.border}`,
      }}
    >
      <div
        style={{
          maxWidth: 1120,
          margin: "0 auto",
          padding: "10px 16px 12px",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: 9,
                background:
                  "radial-gradient(circle at 0% 0%,#6366F1,#22C55E 55%,#0EA5E9 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
                fontWeight: 800,
                color: "#0B1120",
              }}
            >
              DS
            </div>
            <div>
              <div
                style={{
                  fontSize: 13,
                  letterSpacing: 0.4,
                  fontWeight: 800,
                  textTransform: "uppercase",
                  color: P.t2,
                }}
              >
                DataSpark Practice
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: P.t3,
                  fontFamily: "var(--mono)",
                }}
              >
                Strategy-first interview prep workspace
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexWrap: "wrap",
              justifyContent: "flex-end",
            }}
          >
            {summary ? (
              <div
                style={{
                  fontSize: 11,
                  color: P.t3,
                  fontFamily: "var(--mono)",
                  padding: "6px 10px",
                  borderRadius: 999,
                  border: `1px solid ${P.border}`,
                  background: "rgba(15,23,42,0.9)",
                  maxWidth: 220,
                  textAlign: "right",
                }}
              >
                {summary}
              </div>
            ) : null}
            {onBackHome ? (
              <button
                type="button"
                onClick={onBackHome}
                style={{
                  borderRadius: 999,
                  border: `1px solid ${P.border}`,
                  background: "rgba(15,23,42,0.9)",
                  color: P.t2,
                  fontSize: 11,
                  fontWeight: 600,
                  padding: "8px 12px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <span style={{ opacity: 0.8 }}>←</span>
                <span>All courses</span>
              </button>
            ) : null}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 8,
            overflowX: "auto",
            paddingBottom: 4,
            WebkitOverflowScrolling: "touch",
          }}
        >
          {courses.map((course) => {
            const isActive = course.id === activeCourseId;
            return (
              <button
                key={course.id}
                type="button"
                onClick={() => onSelectCourse && onSelectCourse(course.id)}
                style={{
                  borderRadius: 999,
                  border: `1px solid ${isActive ? P.indB : P.border}`,
                  background: isActive ? P.chipActive : P.chip,
                  color: P.t2,
                  fontSize: 11,
                  padding: "6px 12px",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background:
                      course.color ||
                      (course.theme === "green" ? P.grn : P.indB),
                  }}
                />
                <span>{course.shortTitle || course.title}</span>
                {typeof course.progress === "number" ? (
                  <span
                    style={{
                      fontSize: 10,
                      color: P.t3,
                      fontFamily: "var(--mono)",
                    }}
                  >
                    {course.progress.toFixed(0)}%
                  </span>
                ) : null}
              </button>
            );
          })}

          {!courses.length ? (
            <span
              style={{
                fontSize: 11,
                color: P.t3,
                fontFamily: "var(--mono)",
              }}
            >
              Courses will appear here.
            </span>
          ) : null}
        </div>

        {activeCourse ? (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 10,
              flexWrap: "wrap",
              fontSize: 11,
              color: P.t3,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                minWidth: 0,
              }}
            >
              <span
                style={{
                  fontSize: 10,
                  letterSpacing: 1.2,
                  textTransform: "uppercase",
                  fontFamily: "var(--mono)",
                  opacity: 0.75,
                }}
              >
                Active course
              </span>
              <span
                style={{
                  fontWeight: 600,
                  color: P.t2,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: 260,
                }}
              >
                {activeCourse.title}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  borderRadius: 999,
                  border: `1px solid ${P.border}`,
                  padding: "4px 10px",
                  fontFamily: "var(--mono)",
                }}
              >
                {activeCourse.lessons?.length || 0} lessons
              </span>
              <span
                style={{
                  borderRadius: 999,
                  border: `1px solid ${P.border}`,
                  padding: "4px 10px",
                  fontFamily: "var(--mono)",
                }}
              >
                {activeCourse.questionsPerCourse || 0} questions
              </span>
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}

