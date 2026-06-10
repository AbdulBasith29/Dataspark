import { useState, useEffect, useRef } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

const AMBER = "#F59E0B";
const CDN_BASE = "https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/";

// ── Default schema (all SQL foundation / advanced / design lessons) ─────────

const DEFAULT_SEED = `
CREATE TABLE users (
  user_id INTEGER PRIMARY KEY,
  name TEXT, email TEXT, country TEXT, signup_date TEXT
);
INSERT INTO users VALUES
  (1,'Alice Chen','alice@example.com','US','2024-01-15'),
  (2,'Bob Kumar','bob@example.com','IN','2024-02-20'),
  (3,'Carol Smith','carol@example.com','UK','2024-03-10'),
  (4,'David Lee','david@example.com','US','2024-04-05'),
  (5,'Emma Wilson','emma@example.com','CA','2024-05-12'),
  (6,'Frank Tanaka','frank@example.com','JP','2024-06-01'),
  (7,'Grace Park','grace@example.com','KR','2024-07-08'),
  (8,'Henry Brown','henry@example.com','AU','2024-08-14'),
  (9,'Iris Müller','iris@example.com','DE','2024-09-22'),
  (10,'Jack Nguyen','jack@example.com','US','2024-10-30');

CREATE TABLE products (
  product_id INTEGER PRIMARY KEY,
  name TEXT, category TEXT, price REAL
);
INSERT INTO products VALUES
  (1,'DataSpark Pro','subscription',99.0),
  (2,'DataSpark Team','subscription',299.0),
  (3,'SQL Mastery','course',49.0),
  (4,'ML Foundations','course',79.0),
  (5,'Python Bootcamp','course',59.0),
  (6,'Career Coaching','service',149.0),
  (7,'Mock Interview Pack','service',99.0),
  (8,'GenAI Crash Course','course',69.0);

CREATE TABLE orders (
  order_id INTEGER PRIMARY KEY,
  user_id INTEGER, product_id INTEGER,
  amount REAL, status TEXT, created_at TEXT
);
INSERT INTO orders VALUES
  (1,1,1,99.0,'completed','2024-01-05'),(2,2,3,49.0,'completed','2024-01-07'),
  (3,1,4,79.0,'completed','2024-01-12'),(4,3,2,299.0,'completed','2024-01-15'),
  (5,4,5,59.0,'refunded','2024-01-18'),(6,5,1,99.0,'completed','2024-01-20'),
  (7,6,3,49.0,'completed','2024-01-22'),(8,2,7,99.0,'completed','2024-02-01'),
  (9,7,8,69.0,'completed','2024-02-03'),(10,3,6,149.0,'completed','2024-02-05'),
  (11,8,1,99.0,'completed','2024-02-08'),(12,4,4,79.0,'completed','2024-02-10'),
  (13,9,2,299.0,'completed','2024-02-14'),(14,1,6,149.0,'completed','2024-02-18'),
  (15,5,3,49.0,'completed','2024-02-20'),(16,10,5,59.0,'pending','2024-02-22'),
  (17,6,4,79.0,'completed','2024-03-01'),(18,7,1,99.0,'completed','2024-03-03'),
  (19,2,8,69.0,'completed','2024-03-07'),(20,8,7,99.0,'completed','2024-03-10'),
  (21,3,5,59.0,'completed','2024-03-12'),(22,4,6,149.0,'completed','2024-03-15'),
  (23,9,1,99.0,'completed','2024-03-18'),(24,5,2,299.0,'refunded','2024-03-20'),
  (25,10,3,49.0,'completed','2024-03-22'),(26,1,7,99.0,'completed','2024-04-02'),
  (27,6,8,69.0,'completed','2024-04-05'),(28,7,5,59.0,'completed','2024-04-08'),
  (29,2,6,149.0,'completed','2024-04-10'),(30,3,4,79.0,'completed','2024-04-12'),
  (31,4,1,99.0,'completed','2024-04-15'),(32,8,3,49.0,'completed','2024-04-18'),
  (33,9,7,99.0,'completed','2024-04-20'),(34,10,8,69.0,'completed','2024-04-22'),
  (35,5,4,79.0,'completed','2024-05-01'),(36,1,3,49.0,'completed','2024-05-05'),
  (37,6,6,149.0,'pending','2024-05-08'),(38,7,2,299.0,'completed','2024-05-10'),
  (39,2,1,99.0,'completed','2024-05-12'),(40,3,8,69.0,'completed','2024-05-15'),
  (41,8,5,59.0,'completed','2024-05-18'),(42,4,7,99.0,'completed','2024-05-20'),
  (43,9,3,49.0,'completed','2024-05-22'),(44,10,4,79.0,'refunded','2024-05-25'),
  (45,5,6,149.0,'completed','2024-06-01'),(46,1,2,299.0,'completed','2024-06-03'),
  (47,6,1,99.0,'completed','2024-06-05'),(48,7,7,99.0,'completed','2024-06-08'),
  (49,2,4,79.0,'completed','2024-06-10'),(50,3,3,49.0,'completed','2024-06-12');

CREATE TABLE events (
  event_id INTEGER PRIMARY KEY,
  user_id INTEGER, event_type TEXT, page TEXT, event_time TEXT
);
INSERT INTO events VALUES
  (1,1,'page_view','home','2024-03-01 09:00'),(2,1,'page_view','pricing','2024-03-01 09:02'),
  (3,1,'add_to_cart','pricing','2024-03-01 09:04'),(4,1,'purchase','checkout','2024-03-01 09:06'),
  (5,2,'page_view','home','2024-03-02 10:00'),(6,2,'page_view','courses','2024-03-02 10:03'),
  (7,2,'add_to_cart','courses','2024-03-02 10:05'),(8,2,'page_view','checkout','2024-03-02 10:07'),
  (9,3,'page_view','home','2024-03-03 11:00'),(10,3,'add_to_cart','pricing','2024-03-03 11:02'),
  (11,3,'purchase','checkout','2024-03-03 11:05'),(12,4,'page_view','home','2024-03-04 12:00'),
  (13,4,'page_view','courses','2024-03-04 12:02'),(14,4,'page_view','pricing','2024-03-04 12:04'),
  (15,5,'page_view','home','2024-03-05 08:00'),(16,5,'add_to_cart','courses','2024-03-05 08:03'),
  (17,5,'add_to_cart','pricing','2024-03-05 08:05'),(18,5,'purchase','checkout','2024-03-05 08:08'),
  (19,6,'page_view','home','2024-03-06 14:00'),(20,6,'page_view','courses','2024-03-06 14:02'),
  (21,7,'page_view','home','2024-03-07 15:00'),(22,7,'add_to_cart','pricing','2024-03-07 15:03'),
  (23,7,'purchase','checkout','2024-03-07 15:06'),(24,8,'page_view','home','2024-03-08 09:00'),
  (25,8,'page_view','pricing','2024-03-08 09:02'),(26,8,'add_to_cart','pricing','2024-03-08 09:04'),
  (27,8,'purchase','checkout','2024-03-08 09:07'),(28,9,'page_view','home','2024-03-09 10:00'),
  (29,9,'page_view','courses','2024-03-09 10:03'),(30,9,'add_to_cart','courses','2024-03-09 10:05'),
  (31,9,'purchase','checkout','2024-03-09 10:08'),(32,10,'page_view','home','2024-03-10 16:00'),
  (33,10,'page_view','pricing','2024-03-10 16:02'),(34,1,'page_view','courses','2024-04-01 09:00'),
  (35,2,'page_view','home','2024-04-02 10:00'),(36,2,'add_to_cart','courses','2024-04-02 10:03'),
  (37,3,'page_view','home','2024-04-03 11:00'),(38,4,'page_view','pricing','2024-04-04 12:00'),
  (39,4,'add_to_cart','pricing','2024-04-04 12:03'),(40,4,'purchase','checkout','2024-04-04 12:06');
`;

const DEFAULT_STARTERS = [
  {
    label: "Revenue by category",
    sql: `SELECT p.category,
  COUNT(*)                AS orders,
  ROUND(SUM(o.amount), 2) AS revenue
FROM orders o
JOIN products p ON o.product_id = p.product_id
WHERE o.status = 'completed'
GROUP BY p.category
ORDER BY revenue DESC;`,
  },
  {
    label: "Top 5 customers",
    sql: `SELECT u.name,
  COUNT(o.order_id)       AS orders,
  ROUND(SUM(o.amount), 2) AS total_spend
FROM orders o
JOIN users u ON o.user_id = u.user_id
WHERE o.status = 'completed'
GROUP BY u.user_id, u.name
ORDER BY total_spend DESC
LIMIT 5;`,
  },
  {
    label: "Monthly revenue + running total",
    sql: `WITH monthly AS (
  SELECT SUBSTR(created_at, 1, 7) AS month,
         ROUND(SUM(amount), 2)    AS revenue
  FROM orders
  WHERE status = 'completed'
  GROUP BY month
)
SELECT month,
       revenue,
       ROUND(SUM(revenue) OVER (ORDER BY month), 2) AS running_total
FROM monthly
ORDER BY month;`,
  },
  {
    label: "Conversion funnel",
    sql: `SELECT event_type,
  COUNT(DISTINCT user_id) AS unique_users,
  COUNT(*)                AS total_events
FROM events
GROUP BY event_type
ORDER BY total_events DESC;`,
  },
  {
    label: "Show schema",
    sql: `SELECT name, sql FROM sqlite_master
WHERE type = 'table'
ORDER BY name;`,
  },
];

const DEFAULT_HINT = `Tables: users(user_id, name, email, country, signup_date)
         products(product_id, name, category, price)
         orders(order_id, user_id, product_id, amount, status, created_at)
         events(event_id, user_id, event_type, page, event_time)`;

// ── Capstone schema (sql-capstone-01 — StreamCore) ───────────────────────────
// Uses datetime('now', '-N days') so "recent" data stays current at runtime.
// SQLite equivalents for PostgreSQL functions:
//   NOW() - INTERVAL 'N days'  →  datetime('now', '-N days')
//   DATE_TRUNC('month', NOW()) →  strftime('%Y-%m-01', 'now')

const CAPSTONE_SEED = `
CREATE TABLE users (
  user_id INTEGER PRIMARY KEY,
  email TEXT,
  plan_type TEXT,
  created_at TEXT
);
INSERT INTO users VALUES
  (1,'alice@sc.io','premium', datetime('now','-95 days')),
  (2,'bob@sc.io','free',      datetime('now','-80 days')),
  (3,'carol@sc.io','premium', datetime('now','-70 days')),
  (4,'david@sc.io','premium', datetime('now','-60 days')),
  (5,'emma@sc.io','free',     datetime('now','-50 days')),
  (6,'frank@sc.io','premium', datetime('now','-40 days')),
  (7,'grace@sc.io','premium', datetime('now','-30 days')),
  (8,'henry@sc.io','free',    datetime('now','-20 days')),
  (9,'iris@sc.io','premium',  datetime('now','-15 days')),
  (10,'jack@sc.io','premium', datetime('now','-10 days')),
  (11,'kim@sc.io','free',     datetime('now','-100 days')),
  (12,'leo@sc.io','premium',  datetime('now','-85 days'));

CREATE TABLE artists (
  artist_id INTEGER PRIMARY KEY,
  artist_name TEXT
);
INSERT INTO artists VALUES
  (1,'The Midnight'),(2,'Jungle'),(3,'Bonobo'),
  (4,'FKJ'),(5,'Khruangbin');

CREATE TABLE streams (
  stream_id INTEGER PRIMARY KEY,
  user_id INTEGER,
  artist_id INTEGER,
  song_id INTEGER,
  country TEXT,
  streamed_at TEXT
);
INSERT INTO streams VALUES
  -- recent streams: this month, active users ──────────────────────
  (1,1,1,101,'US', datetime('now','-1 day')),
  (2,1,2,102,'US', datetime('now','-2 days')),
  (3,1,1,103,'US', datetime('now','-3 days')),
  (4,1,3,104,'US', datetime('now','-5 days')),
  (5,1,1,105,'US', datetime('now','-6 days')),
  (6,3,2,106,'UK', datetime('now','-1 day')),
  (7,3,2,107,'UK', datetime('now','-4 days')),
  (8,3,4,108,'UK', datetime('now','-2 days')),
  (9,4,3,109,'US', datetime('now','-3 days')),
  (10,4,3,110,'US', datetime('now','-1 day')),
  (11,6,5,111,'JP', datetime('now','-2 days')),
  (12,6,5,112,'JP', datetime('now','-5 days')),
  (13,7,1,113,'KR', datetime('now','-1 day')),
  (14,7,2,114,'KR', datetime('now','-3 days')),
  (15,9,3,115,'DE', datetime('now','-2 days')),
  (16,9,4,116,'DE', datetime('now','-4 days')),
  (17,10,1,117,'US', datetime('now','-1 day')),
  (18,10,5,118,'US', datetime('now','-3 days')),
  -- this month, 8+ days ago (no longer "last 7 days") ─────────────
  (19,1,1,101,'US', strftime('%Y-%m-08','now')),
  (20,1,2,102,'US', strftime('%Y-%m-09','now')),
  (21,3,3,103,'UK', strftime('%Y-%m-10','now')),
  (22,4,1,104,'US', strftime('%Y-%m-11','now')),
  (23,6,2,105,'JP', strftime('%Y-%m-12','now')),
  (24,7,4,106,'KR', strftime('%Y-%m-13','now')),
  (25,9,5,107,'DE', strftime('%Y-%m-14','now')),
  (26,10,3,108,'US', strftime('%Y-%m-15','now')),
  -- older streams (>30 days, outside current month) ────────────────
  (27,2,1,101,'IN', datetime('now','-35 days')),
  (28,5,2,102,'CA', datetime('now','-40 days')),
  (29,8,3,103,'AU', datetime('now','-45 days')),
  (30,11,4,104,'US', datetime('now','-50 days')),
  (31,12,5,105,'UK', datetime('now','-55 days')),
  (32,1,2,102,'US', datetime('now','-60 days')),
  (33,3,1,101,'UK', datetime('now','-65 days')),
  (34,4,5,105,'US', datetime('now','-70 days')),
  (35,6,3,103,'JP', datetime('now','-75 days')),
  (36,7,4,104,'KR', datetime('now','-80 days'));
`;

const CAPSTONE_STARTERS = [
  {
    label: "Anti-join: never streamed (90 days)",
    sql: `-- SQLite: datetime('now','-90 days') replaces NOW() - INTERVAL '90 days'
-- LEFT JOIN + IS NULL = anti-join pattern
SELECT u.user_id, u.email
FROM users u
LEFT JOIN streams s ON u.user_id = s.user_id
WHERE u.created_at >= datetime('now', '-90 days')
  AND s.user_id IS NULL;`,
  },
  {
    label: "Top 3 artists per country",
    sql: `-- SQLite: strftime('%Y-%m-01','now') replaces DATE_TRUNC('month', NOW())
WITH ranked AS (
  SELECT s.country, a.artist_name,
         COUNT(*) AS total_streams,
         ROW_NUMBER() OVER (
           PARTITION BY s.country
           ORDER BY COUNT(*) DESC
         ) AS rn
  FROM streams s
  JOIN artists a ON s.artist_id = a.artist_id
  WHERE s.streamed_at >= strftime('%Y-%m-01', 'now')
  GROUP BY s.country, s.artist_id
)
SELECT country, artist_name, total_streams
FROM ranked
WHERE rn <= 3
ORDER BY country, rn;`,
  },
  {
    label: "Premium: active this month, quiet 7 days",
    sql: `WITH active_this_month AS (
  SELECT u.user_id
  FROM users u
  JOIN streams s ON u.user_id = s.user_id
  WHERE u.plan_type = 'premium'
    AND s.streamed_at >= strftime('%Y-%m-01', 'now')
  GROUP BY u.user_id
  HAVING COUNT(*) > 3
),
recent_streamers AS (
  SELECT DISTINCT user_id FROM streams
  WHERE streamed_at >= datetime('now', '-7 days')
)
SELECT a.user_id, u.email
FROM active_this_month a
JOIN users u ON a.user_id = u.user_id
LEFT JOIN recent_streamers r ON a.user_id = r.user_id
WHERE r.user_id IS NULL;`,
  },
  {
    label: "Stream counts by country + artist",
    sql: `SELECT s.country, a.artist_name,
  COUNT(*) AS streams
FROM streams s
JOIN artists a ON s.artist_id = a.artist_id
GROUP BY s.country, a.artist_name
ORDER BY s.country, streams DESC;`,
  },
  {
    label: "Show schema",
    sql: `SELECT name, sql FROM sqlite_master
WHERE type = 'table'
ORDER BY name;`,
  },
];

const CAPSTONE_HINT = `Tables: users(user_id, email, plan_type, created_at)
         artists(artist_id, artist_name)
         streams(stream_id, user_id, artist_id, song_id, country, streamed_at)
SQLite date hint: datetime('now','-N days') · strftime('%Y-%m-01','now')`;

// ── Config registry ───────────────────────────────────────────────────────────

const CONFIGS = {
  default: {
    seed: DEFAULT_SEED,
    starters: DEFAULT_STARTERS,
    hint: DEFAULT_HINT,
  },
  "sql-capstone-01": {
    seed: CAPSTONE_SEED,
    starters: CAPSTONE_STARTERS,
    hint: CAPSTONE_HINT,
  },
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function SQLScratchpad({ lessonId }) {
  const config = CONFIGS[lessonId] || CONFIGS.default;

  const [db, setDb] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [query, setQuery] = useState(config.starters[0].sql);
  const [results, setResults] = useState(null);
  const [queryError, setQueryError] = useState(null);
  const [running, setRunning] = useState(false);
  const [activeStarter, setActiveStarter] = useState(0);
  const textareaRef = useRef(null);

  // Re-seed when lesson changes (e.g. navigating between lessons)
  const configRef = useRef(config);
  useEffect(() => {
    configRef.current = config;
    setQuery(config.starters[0].sql);
    setResults(null);
    setQueryError(null);
    setActiveStarter(0);
  }, [lessonId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let cancelled = false;

    const initDb = async (SQL) => {
      const database = new SQL.Database();
      database.run(configRef.current.seed);
      if (!cancelled) {
        setDb(database);
        setLoading(false);
      }
    };

    const loadSqlJs = async () => {
      if (window.initSqlJs) {
        try {
          const SQL = await window.initSqlJs({ locateFile: (f) => CDN_BASE + f });
          await initDb(SQL);
        } catch (e) {
          if (!cancelled) { setLoadError("SQLite init failed: " + e.message); setLoading(false); }
        }
        return;
      }
      const script = document.createElement("script");
      script.src = CDN_BASE + "sql-wasm.js";
      script.async = true;
      script.onload = async () => {
        if (cancelled) return;
        try {
          const SQL = await window.initSqlJs({ locateFile: (f) => CDN_BASE + f });
          await initDb(SQL);
        } catch (e) {
          if (!cancelled) { setLoadError("SQLite init failed: " + e.message); setLoading(false); }
        }
      };
      script.onerror = () => {
        if (!cancelled) {
          setLoadError("Could not load sql.js from CDN. Check your internet connection.");
          setLoading(false);
        }
      };
      document.head.appendChild(script);
    };

    loadSqlJs();
    return () => { cancelled = true; };
  }, []); // intentionally runs once; db is re-seeded on lessonId change via re-mount

  const runQuery = () => {
    if (!db || running) return;
    const sql = query.trim();
    if (!sql) return;
    setRunning(true);
    setQueryError(null);
    setResults(null);
    try {
      const res = db.exec(sql);
      setResults(res);
    } catch (e) {
      setQueryError(e.message);
    } finally {
      setRunning(false);
    }
  };

  const handleKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      runQuery();
    }
    if (e.key === "Tab") {
      e.preventDefault();
      const ta = textareaRef.current;
      if (!ta) return;
      const { selectionStart: s, selectionEnd: end } = ta;
      const next = query.slice(0, s) + "  " + query.slice(end);
      setQuery(next);
      requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = s + 2; });
    }
  };

  const loadStarter = (idx) => {
    setActiveStarter(idx);
    setQuery(config.starters[idx].sql);
    setResults(null);
    setQueryError(null);
    textareaRef.current?.focus();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, fontFamily: "var(--ds-sans), sans-serif" }}>

      {/* Starter query chips */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {config.starters.map((s, i) => (
          <button
            key={i}
            type="button"
            onClick={() => loadStarter(i)}
            style={{
              fontSize: 11,
              padding: "5px 10px",
              borderRadius: 999,
              border: `1px solid ${i === activeStarter ? AMBER + "88" : DS.border}`,
              background: i === activeStarter ? AMBER + "18" : "rgba(255,255,255,0.03)",
              color: i === activeStarter ? AMBER : DS.t3,
              cursor: "pointer",
              fontFamily: "var(--ds-mono), monospace",
              fontWeight: 600,
              transition: "all 0.15s",
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Editor */}
      <div style={{ position: "relative" }}>
        <textarea
          ref={textareaRef}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setActiveStarter(-1); }}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          rows={8}
          style={{
            width: "100%",
            background: "rgba(2,6,23,0.72)",
            border: `1px solid ${DS.border}`,
            borderRadius: 10,
            padding: "14px 16px",
            color: DS.t1,
            fontSize: 13,
            lineHeight: 1.7,
            fontFamily: "var(--ds-mono), monospace",
            resize: "vertical",
            outline: "none",
            boxSizing: "border-box",
            caretColor: AMBER,
          }}
          aria-label="SQL query editor"
          placeholder="Write your SQL query here..."
        />
        <button
          type="button"
          onClick={runQuery}
          disabled={!db || running}
          style={{
            position: "absolute",
            bottom: 12,
            right: 12,
            background: db ? AMBER : "rgba(245,158,11,0.2)",
            border: "none",
            borderRadius: 6,
            padding: "7px 14px",
            color: db ? "#000" : DS.dim,
            fontSize: 12,
            fontWeight: 800,
            cursor: db && !running ? "pointer" : "default",
            fontFamily: "var(--ds-mono), monospace",
            letterSpacing: "0.05em",
          }}
        >
          {loading ? "Loading…" : running ? "Running…" : "▶ Run  ⌘↵"}
        </button>
      </div>

      {/* Schema hint */}
      <div style={{
        fontSize: 11,
        color: DS.dim,
        fontFamily: "var(--ds-mono), monospace",
        lineHeight: 1.6,
        whiteSpace: "pre",
      }}>
        {config.hint}
      </div>

      {loadError && (
        <div style={{
          padding: "12px 14px",
          borderRadius: 8,
          border: "1px solid rgba(248,113,113,0.3)",
          background: "rgba(248,113,113,0.08)",
          color: "#F87171",
          fontSize: 13,
          fontFamily: "var(--ds-mono), monospace",
        }}>
          ⚠ {loadError}
        </div>
      )}

      {queryError && (
        <div style={{
          padding: "12px 14px",
          borderRadius: 8,
          border: "1px solid rgba(248,113,113,0.3)",
          background: "rgba(248,113,113,0.08)",
          color: "#F87171",
          fontSize: 13,
          fontFamily: "var(--ds-mono), monospace",
          lineHeight: 1.55,
        }}>
          <strong>Error: </strong>{queryError}
        </div>
      )}

      {results !== null && (
        results.length === 0 ? (
          <div style={{ fontSize: 13, color: DS.grn, fontFamily: "var(--ds-mono), monospace", padding: "8px 0" }}>
            ✓ Query executed successfully — no rows returned.
          </div>
        ) : (
          results.map((result, ri) => (
            <ResultTable key={ri} result={result} accent={AMBER} />
          ))
        )
      )}
    </div>
  );
}

function ResultTable({ result, accent }) {
  const { columns, values } = result;
  const MAX_ROWS = 200;
  const truncated = values.length > MAX_ROWS;
  const rows = truncated ? values.slice(0, MAX_ROWS) : values;

  return (
    <div>
      <div style={{ fontSize: 11, color: DS.dim, fontFamily: "var(--ds-mono), monospace", marginBottom: 6 }}>
        {values.length} row{values.length !== 1 ? "s" : ""}
        {truncated ? ` (showing first ${MAX_ROWS})` : ""}
        {" · "}
        {columns.length} column{columns.length !== 1 ? "s" : ""}
      </div>
      <div style={{ overflowX: "auto", borderRadius: 8, border: `1px solid ${DS.border}` }}>
        <table style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: 13,
          fontFamily: "var(--ds-mono), monospace",
        }}>
          <thead>
            <tr style={{ background: "rgba(255,255,255,0.04)", borderBottom: `1px solid ${DS.border}` }}>
              {columns.map((col) => (
                <th key={col} style={{
                  padding: "8px 12px",
                  textAlign: "left",
                  color: accent,
                  fontWeight: 700,
                  fontSize: 11,
                  letterSpacing: "0.06em",
                  whiteSpace: "nowrap",
                }}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} style={{
                borderBottom: i < rows.length - 1 ? `1px solid ${DS.border}` : "none",
                background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.015)",
              }}>
                {row.map((cell, j) => (
                  <td key={j} style={{
                    padding: "7px 12px",
                    color: cell === null ? DS.dim : DS.t2,
                    fontStyle: cell === null ? "italic" : "normal",
                    whiteSpace: "nowrap",
                  }}>
                    {cell === null ? "NULL" : String(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
