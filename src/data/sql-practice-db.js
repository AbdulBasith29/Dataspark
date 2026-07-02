// Shared PostgreSQL practice database for the SQL question runner.
// Executed once in PGlite (Postgres compiled to WASM) when the learner first
// runs a query. Data is generated with SQL so dates stay relative to "today"
// (the questions filter on CURRENT_DATE), and setseed() keeps the one random()
// usage reproducible within a session — user and model answers are always
// compared against identical data.

export const SQL_PRACTICE_SEED = `
SELECT setseed(0.42);

-- ── customers: 60 signups spread over the last ~13 months ──────────────────
CREATE TABLE customers (
  id         int PRIMARY KEY,
  segment    text NOT NULL,
  created_at timestamp NOT NULL
);
INSERT INTO customers (id, segment, created_at)
SELECT g,
       (ARRAY['consumer','smb','enterprise'])[1 + (g % 3)],
       DATE_TRUNC('month', CURRENT_DATE) - ((g % 13) || ' months')::interval
         + (((g * 7) % 28) || ' days')::interval
FROM generate_series(1, 60) AS g;

-- ── products: 3 product lines × 3 products ─────────────────────────────────
CREATE TABLE products (
  product_id   int PRIMARY KEY,
  product_name text NOT NULL,
  category     text NOT NULL,
  product_line text NOT NULL
);
INSERT INTO products (product_id, product_name, category, product_line) VALUES
  (1, 'Aurora Headphones',    'Audio',     'Electronics'),
  (2, 'Nimbus Speaker',       'Audio',     'Electronics'),
  (3, 'Pulse Smartwatch',     'Wearables', 'Electronics'),
  (4, 'Trail Jacket',         'Outerwear', 'Clothing'),
  (5, 'Everyday Tee',         'Basics',    'Clothing'),
  (6, 'Merino Socks',         'Basics',    'Clothing'),
  (7, 'Single-Origin Coffee', 'Pantry',    'Food'),
  (8, 'Dark Chocolate Box',   'Pantry',    'Food'),
  (9, 'Olive Oil Tin',        'Pantry',    'Food');

-- ── orders: 420 orders over the last 12 months, mixed statuses ──────────────
CREATE TABLE orders (
  id          int PRIMARY KEY,
  customer_id int NOT NULL REFERENCES customers(id),
  product_id  int NOT NULL REFERENCES products(product_id),
  amount      numeric(10,2) NOT NULL,
  status      text NOT NULL,
  order_date  date NOT NULL
);
INSERT INTO orders (id, customer_id, product_id, amount, status, order_date)
SELECT g,
       1 + (g % 60),
       1 + (g % 9),
       ROUND((25 + random() * 475)::numeric, 2),
       CASE WHEN g % 11 = 0 THEN 'refunded'
            WHEN g % 7  = 0 THEN 'pending'
            ELSE 'completed' END,
       CURRENT_DATE - ((g * 13) % 365)
FROM generate_series(1, 420) AS g;

-- ── sessions: post-signup activity with realistic month-over-month decay ────
CREATE TABLE sessions (
  customer_id int NOT NULL REFERENCES customers(id),
  created_at  timestamp NOT NULL
);
INSERT INTO sessions (customer_id, created_at)
SELECT c.id,
       c.created_at + (m || ' months')::interval
         + (((c.id * (m + 1)) % 20) || ' days')::interval
FROM customers c
CROSS JOIN generate_series(0, 6) AS m
WHERE (m = 0 OR ((c.id * 7 + m * 13) % 10) < (7 - m))
  AND c.created_at + (m || ' months')::interval <= CURRENT_DATE::timestamp;

-- ── funnel_events: 180 users, monotone 5-step funnel, last 30 days ──────────
CREATE TABLE funnel_events (
  user_id    int NOT NULL,
  step       text NOT NULL,
  city       text NOT NULL,
  event_date date NOT NULL
);
INSERT INTO funnel_events (user_id, step, city, event_date)
SELECT u,
       (ARRAY['app_open','search','select','confirm','complete'])[s],
       (ARRAY['Sydney','Melbourne','Brisbane'])[1 + (u % 3)],
       CURRENT_DATE - ((u * 3) % 29)
FROM generate_series(1, 180) AS u
CROSS JOIN LATERAL generate_series(1,
  CASE WHEN (u * 79) % 100 < 28 THEN 1
       WHEN (u * 79) % 100 < 55 THEN 2
       WHEN (u * 79) % 100 < 75 THEN 3
       WHEN (u * 79) % 100 < 90 THEN 4
       ELSE 5 END) AS s;

-- ── employees: 12 people, 4 levels, one CEO ─────────────────────────────────
CREATE TABLE employees (
  id         int PRIMARY KEY,
  name       text NOT NULL,
  manager_id int REFERENCES employees(id)
);
INSERT INTO employees (id, name, manager_id) VALUES
  (1,  'Priya Sharma',    NULL),
  (2,  'Marcus Chen',     1),
  (3,  'Elena Rodriguez', 1),
  (4,  'Tom Nguyen',      2),
  (5,  'Aisha Khan',      2),
  (6,  'Jack Wilson',     3),
  (7,  'Sofia Rossi',     3),
  (8,  'Liam O''Brien',   4),
  (9,  'Mei Lin',         4),
  (10, 'Noah Taylor',     5),
  (11, 'Zara Ahmed',      6),
  (12, 'Ethan Park',      7);

-- ── users: ~90 days of signups with recurring zero-signup gap days ──────────
CREATE TABLE users (
  id         int PRIMARY KEY,
  created_at timestamp NOT NULL
);
INSERT INTO users (id, created_at)
SELECT g,
       CURRENT_DATE - ((g * 53) % 90) + ((g % 24) || ' hours')::interval
FROM generate_series(1, 140) AS g
WHERE ((g * 53) % 90) % 7 NOT IN (2, 5);

-- ── listings: 24 rows forming 8 duplicate groups of 3 ───────────────────────
CREATE TABLE listings (
  id         int PRIMARY KEY,
  host_id    int NOT NULL,
  title      text NOT NULL,
  city       text NOT NULL,
  updated_at timestamp NOT NULL
);
INSERT INTO listings (id, host_id, title, city, updated_at)
SELECT g,
       1 + (g % 8),
       (ARRAY['Cozy Studio','Harbour View Apt','Garden Loft','CBD Penthouse'])[1 + (g % 4)],
       (ARRAY['Sydney','Melbourne'])[1 + (g % 2)],
       CURRENT_DATE - ((g * 5) % 200)
FROM generate_series(1, 24) AS g;

-- ── order_items: line items for the top-N-per-group ranking question ────────
CREATE TABLE order_items (
  id         int PRIMARY KEY,
  order_id   int NOT NULL,
  product_id int NOT NULL REFERENCES products(product_id),
  amount     numeric(10,2) NOT NULL
);
INSERT INTO order_items (id, order_id, product_id, amount)
SELECT g,
       1 + (g % 420),
       1 + ((g * 7) % 9),
       ROUND((15 + ((g * 37) % 300))::numeric, 2)
FROM generate_series(1, 360) AS g;

-- ── events: 6 users × 20 clicks; a 59-min gap every 4th event splits sessions
CREATE TABLE events (
  id         int PRIMARY KEY,
  user_id    int NOT NULL,
  event_time timestamp NOT NULL
);
INSERT INTO events (id, user_id, event_time)
SELECT u * 100 + k,
       u,
       CURRENT_DATE::timestamp - (u || ' days')::interval
         + (((k * 9) + (k / 4) * 50) || ' minutes')::interval
FROM generate_series(1, 6) AS u
CROSS JOIN generate_series(0, 19) AS k;
`;

// Runs (possibly multi-statement) SQL inside a rolled-back transaction and
// returns the last statement's result that produced columns. Rollback keeps
// the shared seed pristine even for destructive answers (one question DELETEs).
export async function runRolledBack(db, sql) {
  await db.exec("BEGIN");
  try {
    const results = await db.exec(sql);
    return [...results].reverse().find((r) => r.fields?.length > 0) || null;
  } finally {
    try { await db.exec("ROLLBACK"); } catch { /* already aborted */ }
  }
}

// Normalizes a cell so user and model results compare on value, not on
// formatting: numerics to 2dp, dates/timestamps to ISO strings.
function normCell(v) {
  if (v === null || v === undefined) return null;
  if (v instanceof Date) return v.toISOString();
  if (typeof v === "number") return Number.isInteger(v) ? v : Number(v.toFixed(2));
  if (typeof v === "string" && v !== "" && !Number.isNaN(Number(v))) {
    const n = Number(v);
    return Number.isInteger(n) ? n : Number(n.toFixed(2));
  }
  return String(v);
}

// Order-insensitive multiset comparison of two result sets by cell values —
// aliases may differ, row order may differ, values must not.
export function resultsMatch(a, b) {
  if (!a || !b) return false;
  if (a.fields.length !== b.fields.length) return false;
  if (a.rows.length !== b.rows.length) return false;
  const key = (res) =>
    res.rows
      .map((row) => JSON.stringify(res.fields.map((f) => normCell(row[f.name]))))
      .sort()
      .join("\n");
  return key(a) === key(b);
}

// Shown in the runner's "Tables" panel so learners can see what they're
// querying without leaving the question.
export const SQL_PRACTICE_TABLES = {
  customers: "customers(id, segment, created_at) — 60 signups over ~13 months; segment ∈ consumer/smb/enterprise",
  products: "products(product_id, product_name, category, product_line) — 9 products; line ∈ Electronics/Clothing/Food",
  orders: "orders(id, customer_id → customers.id, product_id → products, amount, status ∈ completed/pending/refunded, order_date)",
  sessions: "sessions(customer_id → customers.id, created_at) — post-signup activity with monthly decay",
  funnel_events: "funnel_events(user_id, step ∈ app_open→search→select→confirm→complete, city, event_date) — last 30 days",
  employees: "employees(id, name, manager_id → employees.id) — 12 people, CEO has NULL manager",
  users: "users(id, created_at) — ~90 days of signups; some days have none",
  listings: "listings(id, host_id, title, city, updated_at) — contains exact duplicates on (host_id, title, city)",
  order_items: "order_items(id, order_id, product_id → products, amount)",
  events: "events(id, user_id, event_time) — clickstream; gaps > 30 min mean a new session",
};
