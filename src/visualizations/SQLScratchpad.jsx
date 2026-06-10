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

// ── Per-lesson starter queries (all use the default seed schema) ─────────────

const LESSON_STARTERS = {
  "sql-found-01": [
    {
      label: "Full execution pipeline",
      sql: `-- FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT
SELECT status,
       COUNT(*)                AS orders,
       ROUND(SUM(amount), 2)   AS revenue
FROM orders
WHERE created_at >= '2024-03-01'  -- WHERE runs before GROUP BY
GROUP BY status
HAVING COUNT(*) > 3               -- HAVING runs after GROUP BY
ORDER BY revenue DESC
LIMIT 10;`,
    },
    {
      label: "WHERE vs HAVING",
      sql: `-- WHERE filters individual rows; HAVING filters groups.
-- Try moving the WHERE clause to a HAVING clause — what changes?
SELECT product_id,
       COUNT(*) AS orders
FROM orders
WHERE status = 'completed'   -- row filter (before aggregation)
GROUP BY product_id
HAVING COUNT(*) >= 5;        -- group filter (after aggregation)`,
    },
    {
      label: "Alias scope (SELECT runs late)",
      sql: `-- ORDER BY can reference a SELECT alias.
-- Try using 'total' in the WHERE clause — it will fail.
SELECT user_id,
       ROUND(SUM(amount), 2) AS total
FROM orders
GROUP BY user_id
ORDER BY total DESC   -- alias works: ORDER BY runs after SELECT
LIMIT 5;`,
    },
    {
      label: "LIMIT after ORDER BY",
      sql: `-- LIMIT is the final step — it truncates an already-sorted result.
-- Without ORDER BY first, LIMIT returns an arbitrary subset.
SELECT order_id, user_id, amount, created_at
FROM orders
ORDER BY created_at DESC  -- sort first
LIMIT 5;                  -- then slice`,
    },
  ],

  "sql-found-02": [
    {
      label: "NULL propagates through arithmetic",
      sql: `-- NULL + anything = NULL. Try predicting the output.
SELECT order_id,
       amount,
       CASE WHEN status = 'refunded' THEN NULL ELSE amount END AS net_amount,
       amount + CASE WHEN status = 'refunded' THEN NULL ELSE 0 END AS plus_null
FROM orders
WHERE status = 'refunded';`,
    },
    {
      label: "COUNT(*) vs COUNT(column)",
      sql: `-- COUNT(*) counts all rows. COUNT(col) skips NULLs.
-- Generate a nullable column and compare.
SELECT
  COUNT(*)                                              AS count_all_rows,
  COUNT(CASE WHEN status = 'completed' THEN 1 END)      AS count_non_null,
  COUNT(CASE WHEN status = 'refunded'  THEN NULL END)   AS count_nulls_skipped
FROM orders;`,
    },
    {
      label: "COALESCE — substitute NULLs",
      sql: `-- COALESCE returns the first non-NULL argument.
-- Useful to replace NULLs with a default value.
SELECT order_id,
       amount,
       CASE WHEN status = 'refunded' THEN NULL ELSE amount END AS nullable_amount,
       COALESCE(
         CASE WHEN status = 'refunded' THEN NULL ELSE amount END,
         0
       ) AS safe_amount
FROM orders
LIMIT 8;`,
    },
    {
      label: "Anti-join (LEFT JOIN IS NULL)",
      sql: `-- LEFT JOIN keeps all left rows; IS NULL on right = no match.
-- Find users who have NEVER placed an order.
-- (Force no-match by joining on impossible condition for demo)
SELECT u.user_id, u.name, o.order_id
FROM users u
LEFT JOIN orders o ON u.user_id = o.user_id AND o.status = 'pending'
WHERE o.order_id IS NULL;  -- NULL here means the join found no match`,
    },
  ],

  "sql-found-03": [
    {
      label: "Multi-aggregate GROUP BY",
      sql: `-- Multiple aggregates in one GROUP BY query
SELECT status,
       COUNT(*)                AS order_count,
       ROUND(AVG(amount), 2)   AS avg_order,
       ROUND(MIN(amount), 2)   AS min_order,
       ROUND(MAX(amount), 2)   AS max_order,
       ROUND(SUM(amount), 2)   AS total_revenue
FROM orders
GROUP BY status
ORDER BY total_revenue DESC;`,
    },
    {
      label: "GROUP BY multiple columns",
      sql: `-- Group by two columns to get a breakdown matrix
SELECT u.country,
       o.status,
       COUNT(*)                AS orders,
       ROUND(SUM(o.amount), 2) AS revenue
FROM orders o
JOIN users u ON o.user_id = u.user_id
GROUP BY u.country, o.status
ORDER BY u.country, revenue DESC;`,
    },
    {
      label: "HAVING — filter groups",
      sql: `-- Only show product categories that generated > $500 revenue
SELECT p.category,
       COUNT(*)                AS orders,
       ROUND(SUM(o.amount), 2) AS revenue
FROM orders o
JOIN products p ON o.product_id = p.product_id
WHERE o.status = 'completed'
GROUP BY p.category
HAVING SUM(o.amount) > 500
ORDER BY revenue DESC;`,
    },
    {
      label: "COUNT(DISTINCT ...)",
      sql: `-- How many distinct users placed orders each month?
SELECT SUBSTR(created_at, 1, 7)   AS month,
       COUNT(DISTINCT user_id)     AS unique_buyers,
       COUNT(*)                    AS total_orders
FROM orders
GROUP BY month
ORDER BY month;`,
    },
  ],

  "sql-found-04": [
    {
      label: "INNER JOIN",
      sql: `-- INNER JOIN: only rows that match on BOTH sides
SELECT o.order_id, u.name, p.name AS product, o.amount, o.status
FROM orders o
INNER JOIN users u    ON o.user_id    = u.user_id
INNER JOIN products p ON o.product_id = p.product_id
ORDER BY o.created_at DESC
LIMIT 10;`,
    },
    {
      label: "LEFT JOIN — show missing matches",
      sql: `-- LEFT JOIN keeps ALL left-table rows.
-- Rows with no match on the right get NULL in right-side columns.
-- Here: force a mismatch to show the NULL behaviour.
SELECT u.user_id, u.name,
       o.order_id, o.amount
FROM users u
LEFT JOIN orders o ON u.user_id = o.user_id AND o.status = 'refunded'
ORDER BY u.user_id;`,
    },
    {
      label: "Subquery in WHERE",
      sql: `-- Find users whose total spend is above the average spend per user.
-- The subquery computes the average; the outer query filters.
SELECT user_id,
       ROUND(SUM(amount), 2) AS total_spend
FROM orders
WHERE status = 'completed'
GROUP BY user_id
HAVING SUM(amount) > (
  SELECT AVG(user_total)
  FROM (
    SELECT SUM(amount) AS user_total
    FROM orders WHERE status = 'completed'
    GROUP BY user_id
  )
)
ORDER BY total_spend DESC;`,
    },
    {
      label: "Subquery vs JOIN — same result",
      sql: `-- These two queries return identical results.
-- The subquery version can be slower on large tables.

-- Version A: correlated subquery
SELECT o.order_id, o.amount,
       (SELECT p.name FROM products p WHERE p.product_id = o.product_id) AS product
FROM orders o LIMIT 5;

-- Version B: JOIN (uncomment to compare)
-- SELECT o.order_id, o.amount, p.name AS product
-- FROM orders o JOIN products p ON o.product_id = p.product_id LIMIT 5;`,
    },
  ],

  "sq-a1": [
    {
      label: "ROW_NUMBER() over orders",
      sql: `-- Assign a unique sequential number to every order per user
SELECT user_id, order_id, amount, created_at,
       ROW_NUMBER() OVER (
         PARTITION BY user_id
         ORDER BY created_at
       ) AS order_seq
FROM orders
ORDER BY user_id, order_seq
LIMIT 15;`,
    },
    {
      label: "RANK vs DENSE_RANK — ties",
      sql: `-- Products ranked by revenue. Ties expose RANK vs DENSE_RANK gap.
SELECT product_id,
       ROUND(SUM(amount), 2) AS revenue,
       RANK()       OVER (ORDER BY SUM(amount) DESC) AS rank_w_gap,
       DENSE_RANK() OVER (ORDER BY SUM(amount) DESC) AS dense_rank_no_gap
FROM orders
WHERE status = 'completed'
GROUP BY product_id
ORDER BY revenue DESC;`,
    },
    {
      label: "PARTITION BY — rank within country",
      sql: `-- Rank each user's total spend within their own country
WITH spend AS (
  SELECT u.user_id, u.name, u.country,
         ROUND(SUM(o.amount), 2) AS total_spend
  FROM orders o JOIN users u ON o.user_id = u.user_id
  WHERE o.status = 'completed'
  GROUP BY u.user_id, u.name, u.country
)
SELECT country, name, total_spend,
       RANK() OVER (PARTITION BY country ORDER BY total_spend DESC) AS country_rank
FROM spend
ORDER BY country, country_rank;`,
    },
    {
      label: "Top-1 order per user",
      sql: `-- Keep only each user's highest-value completed order
WITH ranked AS (
  SELECT user_id, order_id, amount,
         ROW_NUMBER() OVER (
           PARTITION BY user_id
           ORDER BY amount DESC
         ) AS rn
  FROM orders
  WHERE status = 'completed'
)
SELECT user_id, order_id, amount
FROM ranked
WHERE rn = 1
ORDER BY amount DESC;`,
    },
  ],

  "sq-a2": [
    {
      label: "LAG — previous month revenue",
      sql: `-- LAG fetches the value from the previous row in the window
WITH monthly AS (
  SELECT SUBSTR(created_at, 1, 7)   AS month,
         ROUND(SUM(amount), 2)       AS revenue
  FROM orders WHERE status = 'completed'
  GROUP BY month
)
SELECT month, revenue,
       LAG(revenue) OVER (ORDER BY month)                    AS prev_month,
       ROUND(revenue - LAG(revenue) OVER (ORDER BY month), 2) AS change
FROM monthly
ORDER BY month;`,
    },
    {
      label: "LEAD — next order value",
      sql: `-- LEAD looks forward in the window
SELECT user_id, order_id, amount, created_at,
       LEAD(amount) OVER (
         PARTITION BY user_id
         ORDER BY created_at
       ) AS next_order_amount
FROM orders
ORDER BY user_id, created_at
LIMIT 20;`,
    },
    {
      label: "Running SUM (cumulative total)",
      sql: `-- SUM() OVER with ORDER BY = running total (default RANGE frame)
WITH monthly AS (
  SELECT SUBSTR(created_at, 1, 7)   AS month,
         ROUND(SUM(amount), 2)       AS revenue
  FROM orders WHERE status = 'completed'
  GROUP BY month
)
SELECT month, revenue,
       ROUND(SUM(revenue) OVER (ORDER BY month), 2) AS running_total
FROM monthly
ORDER BY month;`,
    },
    {
      label: "3-month rolling average",
      sql: `-- ROWS BETWEEN 2 PRECEDING AND CURRENT ROW = 3-row window
WITH monthly AS (
  SELECT SUBSTR(created_at, 1, 7)   AS month,
         ROUND(SUM(amount), 2)       AS revenue
  FROM orders WHERE status = 'completed'
  GROUP BY month
)
SELECT month, revenue,
       ROUND(AVG(revenue) OVER (
         ORDER BY month
         ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
       ), 2) AS rolling_3mo_avg
FROM monthly
ORDER BY month;`,
    },
  ],

  "sq-a3": [
    {
      label: "Simple CTE",
      sql: `-- WITH defines a named subquery you can reference cleanly
WITH completed_orders AS (
  SELECT user_id, SUM(amount) AS total_spend
  FROM orders
  WHERE status = 'completed'
  GROUP BY user_id
)
SELECT u.name, u.country,
       ROUND(c.total_spend, 2) AS total_spend
FROM completed_orders c
JOIN users u ON c.user_id = u.user_id
ORDER BY total_spend DESC;`,
    },
    {
      label: "Two CTEs chained",
      sql: `-- Chain CTEs: the second one references the first
WITH monthly_revenue AS (
  SELECT SUBSTR(created_at, 1, 7) AS month,
         ROUND(SUM(amount), 2)    AS revenue
  FROM orders WHERE status = 'completed'
  GROUP BY month
),
avg_revenue AS (
  SELECT ROUND(AVG(revenue), 2) AS avg_rev FROM monthly_revenue
)
SELECT m.month, m.revenue, a.avg_rev,
       CASE WHEN m.revenue > a.avg_rev THEN 'above' ELSE 'below' END AS vs_avg
FROM monthly_revenue m, avg_revenue a
ORDER BY m.month;`,
    },
    {
      label: "Recursive CTE — integer series",
      sql: `-- Recursive CTE: anchor + recursive step
-- Classic use: generate a date/integer series
WITH RECURSIVE counter(n) AS (
  SELECT 1                        -- anchor: start at 1
  UNION ALL
  SELECT n + 1 FROM counter       -- recursive step
  WHERE n < 10                    -- termination condition
)
SELECT n FROM counter;`,
    },
    {
      label: "CTE vs subquery — same result",
      sql: `-- CTE version (easier to read and debug step-by-step):
WITH top_spenders AS (
  SELECT user_id FROM orders
  WHERE status = 'completed'
  GROUP BY user_id
  HAVING SUM(amount) > 200
)
SELECT u.name, u.country FROM users u
WHERE u.user_id IN (SELECT user_id FROM top_spenders);

-- Equivalent subquery (uncomment to compare):
-- SELECT u.name, u.country FROM users u
-- WHERE u.user_id IN (
--   SELECT user_id FROM orders WHERE status='completed'
--   GROUP BY user_id HAVING SUM(amount) > 200
-- );`,
    },
  ],

  "sq-a4": [
    {
      label: "CASE WHEN pivot — status counts",
      sql: `-- Pivot row values (status) into columns using CASE WHEN + SUM
SELECT product_id,
       SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed,
       SUM(CASE WHEN status = 'refunded'  THEN 1 ELSE 0 END) AS refunded,
       SUM(CASE WHEN status = 'pending'   THEN 1 ELSE 0 END) AS pending,
       COUNT(*) AS total
FROM orders
GROUP BY product_id
ORDER BY total DESC;`,
    },
    {
      label: "Revenue pivot by category",
      sql: `-- Pivot category revenue into separate columns
SELECT SUBSTR(o.created_at, 1, 7) AS month,
       ROUND(SUM(CASE WHEN p.category = 'subscription' THEN o.amount ELSE 0 END), 2) AS subscription_rev,
       ROUND(SUM(CASE WHEN p.category = 'course'       THEN o.amount ELSE 0 END), 2) AS course_rev,
       ROUND(SUM(CASE WHEN p.category = 'service'      THEN o.amount ELSE 0 END), 2) AS service_rev
FROM orders o
JOIN products p ON o.product_id = p.product_id
WHERE o.status = 'completed'
GROUP BY month
ORDER BY month;`,
    },
    {
      label: "Conditional aggregation with ratio",
      sql: `-- What fraction of each user's orders were refunded?
SELECT user_id,
       COUNT(*)                                              AS total_orders,
       SUM(CASE WHEN status = 'refunded' THEN 1 ELSE 0 END) AS refunds,
       ROUND(
         100.0 * SUM(CASE WHEN status = 'refunded' THEN 1 ELSE 0 END) / COUNT(*),
         1
       ) AS refund_pct
FROM orders
GROUP BY user_id
HAVING refunds > 0
ORDER BY refund_pct DESC;`,
    },
    {
      label: "UNPIVOT with UNION ALL",
      sql: `-- SQLite has no UNPIVOT keyword; use UNION ALL to melt columns into rows
SELECT product_id, 'completed' AS status_type,
       SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) AS revenue
FROM orders GROUP BY product_id
UNION ALL
SELECT product_id, 'refunded',
       SUM(CASE WHEN status = 'refunded' THEN amount ELSE 0 END)
FROM orders GROUP BY product_id
ORDER BY product_id, status_type;`,
    },
  ],

  "sq-a5": [
    {
      label: "EXPLAIN QUERY PLAN — full scan",
      sql: `-- See how SQLite plans to execute this query (no index yet)
EXPLAIN QUERY PLAN
SELECT order_id, amount
FROM orders
WHERE user_id = 3
  AND status = 'completed';
-- Look for "SCAN orders" = full table scan (all 50 rows checked)`,
    },
    {
      label: "Create index → re-EXPLAIN",
      sql: `-- Create an index, then re-run the EXPLAIN above to compare
CREATE INDEX IF NOT EXISTS idx_orders_user_status
  ON orders (user_id, status);

EXPLAIN QUERY PLAN
SELECT order_id, amount
FROM orders
WHERE user_id = 3
  AND status = 'completed';
-- Now look for "SEARCH orders USING INDEX" = only matching rows scanned`,
    },
    {
      label: "Avoid function on filter column",
      sql: `-- Wrapping a column in a function prevents index use
-- Bad (index on created_at cannot be used):
EXPLAIN QUERY PLAN
SELECT * FROM orders WHERE SUBSTR(created_at, 1, 4) = '2024';

-- Good (store year separately, or use range filter):
EXPLAIN QUERY PLAN
SELECT * FROM orders
WHERE created_at >= '2024-01-01' AND created_at < '2025-01-01';`,
    },
    {
      label: "SELECT only needed columns",
      sql: `-- SELECT * forces the engine to read every column.
-- SELECT only what you need reduces I/O and enables covering indexes.

-- Avoid:
-- SELECT * FROM orders WHERE user_id = 1;

-- Prefer (only the columns the query actually needs):
SELECT order_id, amount, status
FROM orders
WHERE user_id = 1
ORDER BY created_at DESC;`,
    },
  ],

  "sq-d1": [
    {
      label: "Inspect current schema (3NF check)",
      sql: `-- A well-normalized schema has:
-- 1NF: atomic values (no repeating groups)
-- 2NF: no partial dependencies on composite PK
-- 3NF: no transitive dependencies
SELECT name, sql
FROM sqlite_master
WHERE type = 'table'
ORDER BY name;`,
    },
    {
      label: "Transitive dependency example",
      sql: `-- In this schema, products.category → products.price is not transitive
-- because price varies per product. But if we had a categories table
-- with a flat price, that would violate 3NF.
-- Verify: do multiple products in the same category have different prices?
SELECT category,
       COUNT(DISTINCT price)   AS distinct_prices,
       MIN(price)              AS min_price,
       MAX(price)              AS max_price
FROM products
GROUP BY category;
-- If distinct_prices > 1, price is NOT determined by category alone (good)`,
    },
    {
      label: "Denormalized vs normalized query",
      sql: `-- Normalized: join to get category name (stored once in products)
SELECT o.order_id, p.name, p.category, o.amount
FROM orders o
JOIN products p ON o.product_id = p.product_id
LIMIT 5;

-- If category were repeated in orders (denormalized), updates would
-- require touching every order row for a category rename — update anomaly.`,
    },
    {
      label: "Referential integrity check",
      sql: `-- Verify every order.user_id exists in users (FK constraint)
-- A violation means orphaned rows (normalization/integrity issue)
SELECT o.order_id, o.user_id
FROM orders o
LEFT JOIN users u ON o.user_id = u.user_id
WHERE u.user_id IS NULL;
-- Empty result = referential integrity holds`,
    },
  ],

  "sq-d2": [
    {
      label: "Full scan (no index)",
      sql: `-- Without an index, SQLite scans every row
EXPLAIN QUERY PLAN
SELECT order_id, amount, status
FROM orders
WHERE user_id = 5;
-- "SCAN orders" = all 50 rows examined for 1 user's orders`,
    },
    {
      label: "Single-column index",
      sql: `CREATE INDEX IF NOT EXISTS idx_orders_user ON orders (user_id);

EXPLAIN QUERY PLAN
SELECT order_id, amount, status
FROM orders
WHERE user_id = 5;
-- "SEARCH orders USING INDEX" = only user 5's rows examined`,
    },
    {
      label: "Composite index — leftmost prefix rule",
      sql: `-- Composite index on (user_id, status)
-- Works for: WHERE user_id = X
-- Works for: WHERE user_id = X AND status = Y
-- Does NOT use index for: WHERE status = Y alone (skips leftmost column)
CREATE INDEX IF NOT EXISTS idx_orders_user_status
  ON orders (user_id, status);

EXPLAIN QUERY PLAN
SELECT * FROM orders WHERE user_id = 3 AND status = 'completed';

-- Try this — should NOT use the composite index:
EXPLAIN QUERY PLAN
SELECT * FROM orders WHERE status = 'completed';`,
    },
    {
      label: "Low-cardinality index (limited benefit)",
      sql: `-- Index on 'status' has only 3 distinct values (low cardinality).
-- For large tables, the query planner may prefer a full scan anyway.
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status);

EXPLAIN QUERY PLAN
SELECT * FROM orders WHERE status = 'completed';
-- With only 50 rows, SQLite may still scan. On 50M rows, this matters.

-- Check cardinality:
SELECT status, COUNT(*) AS rows FROM orders GROUP BY status;`,
    },
  ],

  "sq-d3": [
    {
      label: "Star schema query (fact → dimensions)",
      sql: `-- orders = fact table; users + products = dimension tables
-- Classic star query: join fact to all dimensions, aggregate
SELECT p.category         AS dim_category,
       u.country          AS dim_country,
       COUNT(*)           AS order_count,
       ROUND(SUM(o.amount), 2) AS revenue
FROM orders o                          -- fact
JOIN products p ON o.product_id = p.product_id  -- dimension
JOIN users    u ON o.user_id    = u.user_id      -- dimension
WHERE o.status = 'completed'
GROUP BY p.category, u.country
ORDER BY revenue DESC
LIMIT 10;`,
    },
    {
      label: "Drill-down by date dimension",
      sql: `-- Drill down: year → month → week
-- Date stored as TEXT; SUBSTR extracts the grain you need
SELECT SUBSTR(created_at, 1, 7) AS month,
       p.category,
       ROUND(SUM(o.amount), 2)  AS revenue
FROM orders o
JOIN products p ON o.product_id = p.product_id
WHERE o.status = 'completed'
GROUP BY month, p.category
ORDER BY month, revenue DESC;`,
    },
    {
      label: "Snowflake vs star — extra join",
      sql: `-- In a snowflake schema, category would be a separate table.
-- Simulate what that extra join looks like:
WITH categories AS (
  SELECT DISTINCT category FROM products
)
SELECT c.category, COUNT(o.order_id) AS orders
FROM orders o
JOIN products  p ON o.product_id = p.product_id
JOIN categories c ON p.category  = c.category   -- "extra snowflake join"
WHERE o.status = 'completed'
GROUP BY c.category
ORDER BY orders DESC;`,
    },
    {
      label: "Measure by two dimensions",
      sql: `-- Analyst question: revenue per country per product category
SELECT u.country, p.category,
       COUNT(*)                  AS orders,
       ROUND(SUM(o.amount), 2)   AS revenue,
       ROUND(AVG(o.amount), 2)   AS avg_order_value
FROM orders o
JOIN users    u ON o.user_id    = u.user_id
JOIN products p ON o.product_id = p.product_id
WHERE o.status = 'completed'
GROUP BY u.country, p.category
ORDER BY u.country, revenue DESC;`,
    },
  ],

  "sq-d4": [
    {
      label: "OLTP pattern — single-row lookup",
      sql: `-- OLTP: high-frequency, low-latency, single-row operations
-- Typical transaction: fetch one order by PK (uses index)
EXPLAIN QUERY PLAN
SELECT * FROM orders WHERE order_id = 17;
-- Should show SEARCH using INTEGER PRIMARY KEY (O(log n))`,
    },
    {
      label: "OLAP pattern — full-scan aggregate",
      sql: `-- OLAP: infrequent, long-running, scans millions of rows
-- This query must touch every completed order row
EXPLAIN QUERY PLAN
SELECT p.category,
       COUNT(*)                AS orders,
       ROUND(SUM(o.amount), 2) AS revenue
FROM orders o
JOIN products p ON o.product_id = p.product_id
WHERE o.status = 'completed'
GROUP BY p.category;
-- "SCAN orders" — touches all rows. Fine for analytics, kills OLTP throughput.`,
    },
    {
      label: "Mixed workload contention",
      sql: `-- OLTP and OLAP competing on the same table:
-- The OLAP scan (below) would block or be blocked by concurrent INSERTs/UPDATEs.

-- Simulate: both run against the same orders table
SELECT order_id FROM orders WHERE order_id = 42;              -- OLTP point read
SELECT COUNT(*), SUM(amount) FROM orders WHERE status='completed'; -- OLAP scan

-- Solution: replicate to a read-only analytics replica or data warehouse.`,
    },
    {
      label: "Row vs column store intuition",
      sql: `-- Row store (OLTP): retrieve all columns for one row efficiently
SELECT * FROM orders WHERE order_id = 25;  -- needs all columns

-- Column store (OLAP): scan one column across all rows efficiently
-- SQLite is row-store; simulate the column-scan pattern:
SELECT SUM(amount) FROM orders;  -- touches only 'amount' column logically
SELECT COUNT(DISTINCT user_id) FROM orders;  -- only 'user_id' column needed

-- In a real column store (Redshift, BigQuery), the 2nd type is much faster
-- because only the relevant column is read from disk.`,
    },
  ],
};

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
  // Lesson-specific config (capstone) overrides everything.
  // Otherwise use default seed/hint but swap in lesson-matched starters.
  const config = CONFIGS[lessonId] ?? {
    ...CONFIGS.default,
    starters: LESSON_STARTERS[lessonId] ?? DEFAULT_STARTERS,
  };

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
