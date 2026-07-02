export const SQL_QUESTIONS = [
  {
    id: "sqq1", courseId: "sql", topicId: "sql-foundations",
    runnable: true, runnerTables: ["orders", "customers"],
    title: "Revenue by Customer Segment", difficulty: "Easy", type: "code", language: "sql", estimatedMinutes: 12,
    prompt: "Write a query returning each customer segment, unique purchasers, total revenue (completed orders only), and avg order value. Filter to segments with >$10K revenue.",
    hints: [
      "JOIN orders to a customers table to get the segment",
      "Use COUNT(DISTINCT customer_id) for unique purchasers",
      "HAVING filters after aggregation — don't use WHERE for the revenue threshold",
    ],
    modelAnswer: `SELECT
  c.segment,
  COUNT(DISTINCT o.customer_id)          AS unique_purchasers,
  SUM(o.amount)                           AS total_revenue,
  ROUND(SUM(o.amount) /
        COUNT(DISTINCT o.customer_id), 2) AS avg_order_value
FROM orders o
JOIN customers c ON o.customer_id = c.id
WHERE o.status = 'completed'
GROUP BY c.segment
HAVING SUM(o.amount) > 10000
ORDER BY total_revenue DESC;`,
    rubric: [
      "Joins orders to customers on customer_id",
      "Filters to completed status in WHERE (not HAVING)",
      "Uses COUNT(DISTINCT) for unique purchasers",
      "Calculates avg_order_value as total / unique purchasers",
      "HAVING clause filters revenue > 10000",
      "Result ordered by revenue descending",
    ],
    tags: ["joins", "aggregation", "HAVING"],
    commonMistakes: ["Using WHERE instead of HAVING for aggregate filter", "COUNT(*) instead of COUNT(DISTINCT)", "Dividing by COUNT(*) instead of unique purchasers"],
  },
  {
    id: "sqq2", courseId: "sql", topicId: "sql-foundations",
    runnable: true, runnerTables: ["customers", "sessions"],
    title: "Cohort Retention Analysis", difficulty: "Hard", type: "code", language: "sql", estimatedMinutes: 25,
    prompt: "Build a monthly cohort retention table showing cohort_month, cohort_size, months_since_signup (0–6), retained_users, and retention_rate for the last 12 months.",
    hints: [
      "First CTE: find each user's cohort_month (DATE_TRUNC of their signup date)",
      "For every session, months since signup = (year diff) * 12 + (month diff) — Postgres has no DATEDIFF",
      "Divide retained users by cohort_size * 100 for the rate",
    ],
    modelAnswer: `WITH cohorts AS (
  SELECT
    id AS customer_id,
    DATE_TRUNC('month', created_at) AS cohort_month
  FROM customers
  WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '12 months'
),
cohort_sizes AS (
  SELECT cohort_month, COUNT(*) AS cohort_size
  FROM cohorts
  GROUP BY cohort_month
),
activity AS (
  SELECT
    c.customer_id,
    c.cohort_month,
    (EXTRACT(YEAR  FROM s.created_at) - EXTRACT(YEAR  FROM c.cohort_month)) * 12
  + (EXTRACT(MONTH FROM s.created_at) - EXTRACT(MONTH FROM c.cohort_month)) AS months_since_signup
  FROM cohorts c
  JOIN sessions s ON c.customer_id = s.customer_id
)
SELECT
  a.cohort_month,
  cs.cohort_size,
  a.months_since_signup,
  COUNT(DISTINCT a.customer_id)                        AS retained_users,
  ROUND(100.0 * COUNT(DISTINCT a.customer_id)
        / cs.cohort_size, 1)                           AS retention_rate
FROM activity a
JOIN cohort_sizes cs ON a.cohort_month = cs.cohort_month
WHERE a.months_since_signup BETWEEN 0 AND 6
GROUP BY a.cohort_month, cs.cohort_size, a.months_since_signup
ORDER BY a.cohort_month, a.months_since_signup;`,
    rubric: [
      "CTE correctly identifies cohort_month per user",
      "Computes months_since_signup with year/month arithmetic (Postgres has no DATEDIFF)",
      "Filters cohort window to last 12 months",
      "Limits months_since_signup to 0–6",
      "COUNT(DISTINCT) for retained_users",
      "Retention rate expressed as percentage of cohort_size",
    ],
    tags: ["CTEs", "window-functions", "cohort-analysis"],
    commonMistakes: ["Not deduplicating users within the same cohort-month cell", "Off-by-one in DATEDIFF direction", "Forgetting month 0 (signup month itself)"],
  },
  {
    id: "sqq3", courseId: "sql", topicId: "sql-foundations",
    runnable: true, runnerTables: ["funnel_events"],
    title: "Funnel Conversion by City", difficulty: "Medium", type: "code", language: "sql", estimatedMinutes: 18,
    prompt: "Calculate step-over-step conversion rates for a 5-step funnel (app_open → search → select → confirm → complete) broken down by city for the last 30 days.",
    hints: [
      "COUNT users at each step; only count them if they reached that step",
      "Use conditional aggregation: COUNT(DISTINCT CASE WHEN step='search' THEN user_id END)",
      "Step-over-step rate = step_n / step_(n-1) * 100",
    ],
    modelAnswer: `SELECT
  city,
  COUNT(DISTINCT CASE WHEN step = 'app_open'  THEN user_id END) AS s1_app_open,
  COUNT(DISTINCT CASE WHEN step = 'search'    THEN user_id END) AS s2_search,
  COUNT(DISTINCT CASE WHEN step = 'select'    THEN user_id END) AS s3_select,
  COUNT(DISTINCT CASE WHEN step = 'confirm'   THEN user_id END) AS s4_confirm,
  COUNT(DISTINCT CASE WHEN step = 'complete'  THEN user_id END) AS s5_complete,
  ROUND(100.0 * COUNT(DISTINCT CASE WHEN step = 'search'   THEN user_id END)
             / NULLIF(COUNT(DISTINCT CASE WHEN step = 'app_open' THEN user_id END), 0), 1) AS open_to_search_pct,
  ROUND(100.0 * COUNT(DISTINCT CASE WHEN step = 'select'   THEN user_id END)
             / NULLIF(COUNT(DISTINCT CASE WHEN step = 'search'   THEN user_id END), 0), 1) AS search_to_select_pct,
  ROUND(100.0 * COUNT(DISTINCT CASE WHEN step = 'confirm'  THEN user_id END)
             / NULLIF(COUNT(DISTINCT CASE WHEN step = 'select'   THEN user_id END), 0), 1) AS select_to_confirm_pct,
  ROUND(100.0 * COUNT(DISTINCT CASE WHEN step = 'complete' THEN user_id END)
             / NULLIF(COUNT(DISTINCT CASE WHEN step = 'confirm'  THEN user_id END), 0), 1) AS confirm_to_complete_pct
FROM funnel_events
WHERE event_date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY city
ORDER BY s1_app_open DESC;`,
    rubric: [
      "Uses conditional aggregation with CASE WHEN for each step",
      "COUNT(DISTINCT user_id) to avoid double-counting",
      "NULLIF to handle division by zero",
      "Step-over-step rates (not overall funnel rate)",
      "30-day date filter applied",
      "Results broken down by city",
    ],
    tags: ["conditional-aggregation", "funnel", "product-analytics"],
    commonMistakes: ["Dividing by total users instead of previous step", "Missing NULLIF causing division by zero", "Using COUNT(*) instead of COUNT(DISTINCT user_id)"],
  },
  {
    id: "sqq4", courseId: "sql", topicId: "sql-foundations",
    runnable: true, runnerTables: ["employees"],
    title: "Recursive Org Chart", difficulty: "Hard", type: "code", language: "sql", estimatedMinutes: 22,
    prompt: "Using a recursive CTE, generate a full org hierarchy showing employee, manager, level, full chain path, and team size (all direct + indirect reports).",
    hints: [
      "Anchor: SELECT root employees where manager_id IS NULL",
      "Recursive step: JOIN employees to the CTE on manager_id = cte.id",
      "Build path as parent_path || ' > ' || name",
    ],
    modelAnswer: `WITH RECURSIVE org AS (
  -- Anchor: top-level (no manager)
  SELECT
    id,
    name,
    manager_id,
    0                     AS level,
    name                  AS path
  FROM employees
  WHERE manager_id IS NULL

  UNION ALL

  -- Recursive: each employee's direct reports
  SELECT
    e.id,
    e.name,
    e.manager_id,
    o.level + 1,
    o.path || ' > ' || e.name
  FROM employees e
  JOIN org o ON e.manager_id = o.id
),
team_sizes AS (
  -- Count all reports (direct + indirect) per manager
  SELECT
    o.id,
    COUNT(r.id) AS team_size
  FROM org o
  LEFT JOIN org r ON r.path LIKE o.path || '%' AND r.id != o.id
  GROUP BY o.id
)
SELECT
  o.name        AS employee,
  e2.name       AS manager,
  o.level,
  o.path        AS chain_path,
  ts.team_size
FROM org o
LEFT JOIN employees e2 ON o.manager_id = e2.id
JOIN  team_sizes ts ON o.id = ts.id
ORDER BY o.path;`,
    rubric: [
      "Correct RECURSIVE CTE anchor with manager_id IS NULL",
      "Recursive step joins on manager_id = parent id",
      "Level increments correctly at each depth",
      "Path string concatenated to show full chain",
      "Team size counts both direct and indirect reports",
      "Final output joins back to get manager name",
    ],
    tags: ["recursive-CTE", "hierarchy", "self-join"],
    commonMistakes: ["Infinite recursion due to cycles — should add cycle detection for real data", "Forgetting the anchor condition (missing manager_id IS NULL)", "Team size counting only direct reports"],
  },
  {
    id: "sqq5", courseId: "sql", topicId: "sql-foundations",
    runnable: true, runnerTables: ["users"],
    title: "Running Total with Gaps", difficulty: "Medium", type: "code", language: "sql", estimatedMinutes: 18,
    prompt: "Calculate daily signups with a running total, day-over-day change, and 7-day moving average. Handle days with zero signups using a date series.",
    hints: [
      "Generate a date spine with generate_series or a calendar table",
      "LEFT JOIN signup counts onto the spine to fill gaps with 0",
      "SUM() OVER (ORDER BY date) for running total; AVG() OVER (ORDER BY date ROWS 6 PRECEDING) for 7-day MA",
    ],
    modelAnswer: `WITH date_spine AS (
  SELECT generate_series(
    (SELECT DATE_TRUNC('day', MIN(created_at)) FROM users),
    CURRENT_DATE,
    INTERVAL '1 day'
  )::date AS signup_date
),
daily_signups AS (
  SELECT
    DATE_TRUNC('day', created_at)::date AS signup_date,
    COUNT(*) AS signups
  FROM users
  GROUP BY 1
),
filled AS (
  SELECT
    d.signup_date,
    COALESCE(s.signups, 0) AS signups
  FROM date_spine d
  LEFT JOIN daily_signups s ON d.signup_date = s.signup_date
)
SELECT
  signup_date,
  signups,
  SUM(signups) OVER (ORDER BY signup_date)                                  AS running_total,
  signups - LAG(signups) OVER (ORDER BY signup_date)                        AS day_over_day_change,
  ROUND(AVG(signups) OVER (ORDER BY signup_date
        ROWS BETWEEN 6 PRECEDING AND CURRENT ROW), 1)                       AS moving_avg_7d
FROM filled
ORDER BY signup_date;`,
    rubric: [
      "Date spine generated to fill gaps",
      "LEFT JOIN preserves zero-signup days with COALESCE",
      "Running total uses SUM() OVER (ORDER BY date)",
      "Day-over-day uses LAG() window function",
      "7-day MA uses ROWS BETWEEN 6 PRECEDING AND CURRENT ROW",
      "Results ordered chronologically",
    ],
    tags: ["window-functions", "date-series", "running-totals"],
    commonMistakes: ["Not handling gaps — skipping days with 0 signups breaks running totals", "Wrong frame in moving average (RANGE vs ROWS)", "LAG without ORDER BY is non-deterministic"],
  },
  {
    id: "sqq6", courseId: "sql", topicId: "sql-foundations",
    runnable: true, runnerTables: ["listings"],
    title: "Duplicate Detection & Cleanup", difficulty: "Easy", type: "code", language: "sql", estimatedMinutes: 15,
    prompt: "Find duplicate listings (same host_id, title, city), show counts, then write a DELETE keeping only the most recently updated record per group.",
    hints: [
      "GROUP BY (host_id, title, city) HAVING COUNT(*) > 1 to find duplicates",
      "ROW_NUMBER() OVER (PARTITION BY host_id, title, city ORDER BY updated_at DESC) to rank within group",
      "DELETE WHERE row_num > 1",
    ],
    modelAnswer: `-- Step 1: Find duplicates
SELECT
  host_id, title, city,
  COUNT(*) AS duplicate_count
FROM listings
GROUP BY host_id, title, city
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC;

-- Step 2: Delete keeping the most recently updated record
WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY host_id, title, city
      ORDER BY updated_at DESC
    ) AS rn
  FROM listings
)
DELETE FROM listings
WHERE id IN (
  SELECT id FROM ranked WHERE rn > 1
);`,
    rubric: [
      "Detection query groups on all three dedup columns",
      "HAVING COUNT(*) > 1 to isolate duplicates",
      "ROW_NUMBER() partitioned correctly",
      "ORDER BY updated_at DESC keeps newest",
      "DELETE targets rows with rn > 1",
      "Uses CTE or subquery — does not delete directly from ranked CTE",
    ],
    tags: ["deduplication", "ROW_NUMBER", "data-quality"],
    commonMistakes: ["Deleting directly inside CTE (not supported in most dialects)", "Keeping the oldest record instead of newest", "Not verifying with a SELECT before running DELETE"],
  },

  {
    id: "sqq7", courseId: "sql", topicId: "sql-advanced",
    runnable: true, runnerTables: ["order_items", "products"],
    title: "Top-N Per Group (Ranking Pattern)", difficulty: "Medium", type: "code", language: "sql", estimatedMinutes: 15,
    company: "Airbnb",
    prompt: "For each product category, return the top 3 products by total revenue. Include category, product_name, total_revenue, and rank. Break ties by product_id ascending.",
    hints: [
      "Aggregate revenue per product first, then rank within each category",
      "ROW_NUMBER() OVER (PARTITION BY category ORDER BY total_revenue DESC) assigns unique ranks",
      "Filter WHERE rank <= 3 in an outer query — window functions can't be in WHERE directly",
    ],
    modelAnswer: `WITH product_revenue AS (
  SELECT
    p.category,
    p.product_id,
    p.product_name,
    SUM(o.amount) AS total_revenue
  FROM order_items o
  JOIN products p ON o.product_id = p.product_id
  GROUP BY p.category, p.product_id, p.product_name
),
ranked AS (
  SELECT
    category,
    product_name,
    total_revenue,
    ROW_NUMBER() OVER (
      PARTITION BY category
      ORDER BY total_revenue DESC, product_id ASC
    ) AS rank
  FROM product_revenue
)
SELECT category, product_name, total_revenue, rank
FROM ranked
WHERE rank <= 3
ORDER BY category, rank;`,
    rubric: [
      "Aggregates revenue per product in a CTE before ranking",
      "ROW_NUMBER partitioned by category, ordered by revenue DESC",
      "Tie-breaking by product_id ASC included",
      "Rank filter in outer query, not in the window function's WHERE",
      "Output includes all four required columns",
      "Results ordered by category then rank",
    ],
    tags: ["window-functions", "ranking", "top-N"],
    commonMistakes: ["Using RANK() instead of ROW_NUMBER() — RANK() can return multiple rows with the same rank when revenue ties", "Trying to use WHERE rank <= 3 in the same query that defines the window function", "Forgetting to aggregate before ranking — ranking unaggregated rows gives wrong results"],
  },
  {
    id: "sqq8", courseId: "sql", topicId: "sql-advanced",
    runnable: true, runnerTables: ["events"],
    title: "Session Gap Detection", difficulty: "Hard", type: "code", language: "sql", estimatedMinutes: 22,
    company: "Spotify",
    prompt: "Define a user session as a sequence of events where no gap between consecutive events exceeds 30 minutes. Given an events table (user_id, event_time), assign a session_id to each event and count total sessions per user.",
    hints: [
      "LAG(event_time) to find the previous event time for the same user",
      "Flag a new session when the gap exceeds 30 minutes (or when it is the first event)",
      "SUM() OVER (PARTITION BY user_id ORDER BY event_time) of the flag gives a monotonically increasing session counter",
    ],
    modelAnswer: `WITH event_gaps AS (
  SELECT
    user_id,
    event_time,
    LAG(event_time) OVER (
      PARTITION BY user_id ORDER BY event_time
    ) AS prev_event_time
  FROM events
),
session_flags AS (
  SELECT
    user_id,
    event_time,
    CASE
      WHEN prev_event_time IS NULL
        OR EXTRACT(EPOCH FROM (event_time - prev_event_time)) / 60 > 30
      THEN 1
      ELSE 0
    END AS is_new_session
  FROM event_gaps
),
sessions AS (
  SELECT
    user_id,
    event_time,
    SUM(is_new_session) OVER (
      PARTITION BY user_id ORDER BY event_time
    ) AS session_id
  FROM session_flags
)
SELECT user_id, COUNT(DISTINCT session_id) AS total_sessions
FROM sessions
GROUP BY user_id
ORDER BY user_id;`,
    rubric: [
      "LAG window function retrieves previous event time per user",
      "Gap threshold correctly checks > 30 minutes (not >=)",
      "NULL prev_event_time handled to flag the very first event",
      "Cumulative SUM of flags creates monotonically increasing session_id",
      "Final aggregation counts DISTINCT session_ids per user",
      "PARTITION BY user_id used throughout to isolate per-user logic",
    ],
    tags: ["window-functions", "sessionisation", "gap-and-island"],
    commonMistakes: ["Not handling the NULL case for a user's first event", "Using minutes threshold incorrectly (DATEDIFF returns an integer in some dialects — check units)", "Counting sessions as COUNT(*) from session_flags instead of DISTINCT session_ids"],
  },
  {
    id: "sqq9", courseId: "sql", topicId: "sql-advanced",
    title: "Read and Diagnose an EXPLAIN Plan", difficulty: "Medium", type: "open-ended", estimatedMinutes: 18,
    company: "Stripe",
    prompt: "You run EXPLAIN ANALYZE on a query joining orders (50M rows) to customers (2M rows) on customer_id. The plan shows: Seq Scan on orders (cost=0..1842000 rows=50000000), Hash Join, Seq Scan on customers (cost=0..45000 rows=2000000). The query takes 42 seconds. Diagnose what is happening and give the exact steps to fix it.",
    hints: [
      "Seq Scan on a 50M-row table means no index is being used for the JOIN column",
      "Hash Join is chosen because both tables are large — this is expected, not the problem",
      "An index on orders.customer_id would convert the Seq Scan to an Index Scan and allow a Nested Loop for the common case",
    ],
    modelAnswer: `**Diagnosis:**

The plan shows two sequential scans: the database is reading every row of both orders (50M) and customers (2M) into memory before performing the Hash Join. This is expensive because:
1. No index on orders.customer_id — the engine cannot seek directly to matching rows
2. With 50M rows, the sequential scan dominates query time
3. Hash Join is the planner's best option given both tables are scanned — but the root cause is the missing index, not the join algorithm

**Steps to fix:**

1. **Add an index on the foreign key:**
\`\`\`sql
CREATE INDEX CONCURRENTLY idx_orders_customer_id ON orders(customer_id);
\`\`\`
Use CONCURRENTLY to avoid locking the table in production.

2. **Re-run EXPLAIN ANALYZE** — expect the plan to change from Seq Scan → Index Scan, and Hash Join → Nested Loop (planner will switch when one side is indexed and the other is selective).

3. **If the query also filters on order_date**, create a composite index:
\`\`\`sql
CREATE INDEX CONCURRENTLY idx_orders_customer_date ON orders(customer_id, order_date DESC);
\`\`\`
This allows an Index Only Scan for queries that filter on both columns.

4. **Check statistics freshness** — if ANALYZE hasn't run recently, row estimates may be stale, causing the planner to choose a suboptimal join strategy:
\`\`\`sql
ANALYZE orders;
\`\`\`

**Expected improvement:** 42 seconds → 200–500ms for point lookups once the index is present and the planner switches to Nested Loop + Index Scan.`,
    rubric: [
      "Correctly identifies missing index on orders.customer_id as root cause",
      "Explains why Seq Scan on 50M rows is expensive",
      "Provides CREATE INDEX CONCURRENTLY to avoid production lock",
      "Re-runs EXPLAIN ANALYZE after the fix to verify the plan changed",
      "Mentions composite index if the query filters on additional columns",
      "Mentions ANALYZE to refresh planner statistics",
    ],
    tags: ["EXPLAIN", "performance", "indexing"],
    commonMistakes: ["Blaming the Hash Join algorithm instead of the missing index", "Using CREATE INDEX without CONCURRENTLY on a live table (causes table lock)", "Expecting the index to help when the query returns >15% of the table"],
  },
  {
    id: "sqq10", courseId: "sql", topicId: "sql-advanced",
    runnable: true, runnerTables: ["orders", "products"],
    title: "Monthly Revenue Pivot by Product Line", difficulty: "Medium", type: "code", language: "sql", estimatedMinutes: 18,
    company: "Amazon",
    prompt: "Pivot monthly revenue into columns for each product line (Electronics, Clothing, Food). Output: year, month, electronics_revenue, clothing_revenue, food_revenue, total_revenue. Show only months with revenue > $0.",
    hints: [
      "SUM(CASE WHEN product_line = 'Electronics' THEN amount END) creates one pivot column",
      "COALESCE the result to 0 — if a product line had no sales that month the CASE returns NULL",
      "Total revenue is just SUM(amount) — no CASE needed",
    ],
    modelAnswer: `SELECT
  EXTRACT(YEAR  FROM order_date)              AS year,
  EXTRACT(MONTH FROM order_date)              AS month,
  COALESCE(SUM(CASE WHEN product_line = 'Electronics'
                    THEN amount END), 0)      AS electronics_revenue,
  COALESCE(SUM(CASE WHEN product_line = 'Clothing'
                    THEN amount END), 0)      AS clothing_revenue,
  COALESCE(SUM(CASE WHEN product_line = 'Food'
                    THEN amount END), 0)      AS food_revenue,
  SUM(amount)                                AS total_revenue
FROM orders
JOIN products USING (product_id)
WHERE status = 'completed'
GROUP BY year, month
HAVING SUM(amount) > 0
ORDER BY year, month;`,
    rubric: [
      "SUM(CASE WHEN) pattern used — one expression per output column",
      "COALESCE applied to handle months where a category had zero sales",
      "Total revenue uses plain SUM(amount) without a CASE",
      "GROUP BY year and month",
      "HAVING SUM(amount) > 0 filters empty months",
      "JOIN to products table to get product_line",
    ],
    tags: ["PIVOT", "conditional-aggregation", "reporting"],
    commonMistakes: ["Forgetting COALESCE — leaves NULLs in pivot columns that break downstream summing", "Using COUNT instead of SUM for revenue", "Putting the revenue > 0 filter in WHERE instead of HAVING"],
  },
  {
    id: "sqq11", courseId: "sql", topicId: "sql-design",
    title: "Normalize an E-Commerce Schema to 3NF", difficulty: "Medium", type: "open-ended", estimatedMinutes: 20,
    company: "Shopify",
    prompt: "A legacy orders table has: order_id, customer_email, customer_name, customer_city, product_sku, product_name, product_category, unit_price, quantity, order_date. Identify every normalization violation and design a 3NF schema. List each new table with its columns and primary/foreign keys.",
    hints: [
      "1NF check: are all values atomic? Any repeating groups?",
      "2NF: is the primary key composite? Do any non-key columns depend on only part of it?",
      "3NF: do any non-key columns depend on another non-key column (transitive dependency)?",
    ],
    modelAnswer: `**Violations found:**

**1NF:** No obvious violations — each cell holds one value.

**2NF violations (partial dependencies on implied composite key order_id + product_sku):**
- customer_email, customer_name, customer_city depend only on customer (not product)
- product_name, product_category depend only on product_sku (not order)

**3NF violations (transitive dependencies):**
- customer_city might transitively depend on a customer_id → address relationship
- product_category depends on product_sku → category (could itself have a category table if many products share categories)

**3NF Schema:**

\`\`\`sql
-- Customers (customer_email is natural key; surrogate id added for FK efficiency)
CREATE TABLE customers (
  customer_id   SERIAL PRIMARY KEY,
  email         TEXT UNIQUE NOT NULL,
  name          TEXT NOT NULL,
  city          TEXT
);

-- Categories (resolve transitive product → category dependency)
CREATE TABLE categories (
  category_id   SERIAL PRIMARY KEY,
  name          TEXT UNIQUE NOT NULL
);

-- Products
CREATE TABLE products (
  product_id    SERIAL PRIMARY KEY,
  sku           TEXT UNIQUE NOT NULL,
  name          TEXT NOT NULL,
  unit_price    NUMERIC(10,2) NOT NULL,
  category_id   INT REFERENCES categories(category_id)
);

-- Orders (header — one row per order)
CREATE TABLE orders (
  order_id      SERIAL PRIMARY KEY,
  customer_id   INT NOT NULL REFERENCES customers(customer_id),
  order_date    DATE NOT NULL
);

-- Order line items (handles multiple products per order)
CREATE TABLE order_items (
  order_item_id SERIAL PRIMARY KEY,
  order_id      INT NOT NULL REFERENCES orders(order_id),
  product_id    INT NOT NULL REFERENCES products(product_id),
  quantity      INT NOT NULL,
  unit_price    NUMERIC(10,2) NOT NULL  -- snapshot price at time of order
);
\`\`\`

**Note on unit_price:** stored in both products (current price) and order_items (price at time of purchase). This is intentional — order history must be immutable even if the product price changes.`,
    rubric: [
      "Correctly identifies partial dependency violations (2NF)",
      "Correctly identifies transitive dependency violations (3NF)",
      "Customers, Products, Orders, OrderItems tables created",
      "All foreign keys defined correctly",
      "order_items holds quantity and snapshot unit_price",
      "Explains why unit_price is duplicated in order_items (immutable history)",
    ],
    tags: ["normalization", "schema-design", "3NF"],
    commonMistakes: ["Missing the order_items table — creating a flat orders table that can't support multiple products per order", "Not snapshotting unit_price in order_items (price changes would corrupt historical order data)", "Putting customer_city directly on orders rather than normalising to a customers table"],
  },
  {
    id: "sqq12", courseId: "sql", topicId: "sql-design",
    title: "Design Indexes for a Slow Analytics Dashboard", difficulty: "Medium", type: "open-ended", estimatedMinutes: 18,
    company: "Databricks",
    prompt: "Three dashboard queries run on a 200M-row events table (user_id, event_type, created_at, session_id, device_type). Query A: filter by event_type + date range. Query B: filter by user_id + date range, ORDER BY created_at. Query C: COUNT(*) GROUP BY device_type over last 7 days. Design the minimum set of indexes needed.",
    hints: [
      "One index per common query pattern — avoid over-indexing (each index slows INSERTs)",
      "Composite index column order: equality predicates first, then range, then ORDER BY columns",
      "Query C's GROUP BY on low-cardinality device_type may be faster with a partial index",
    ],
    modelAnswer: `**Analysis:**

Query A: WHERE event_type = ? AND created_at BETWEEN ? AND ?
→ Equality on event_type + range on created_at
→ Composite: (event_type, created_at)

Query B: WHERE user_id = ? AND created_at >= ? ORDER BY created_at DESC
→ Equality on user_id + range + sort
→ Composite: (user_id, created_at DESC) — covers filter and sort, potential Index Only Scan if SELECT columns are also indexed

Query C: WHERE created_at >= NOW() - INTERVAL '7 days' GROUP BY device_type
→ Range-only scan with low-cardinality grouping — device_type has ~5 values
→ Partial index or just (created_at) — a full index on device_type alone is low benefit because cardinality is low; the planner may choose a Seq Scan anyway for 7/200M days of data

**Recommended indexes:**

\`\`\`sql
-- Query A
CREATE INDEX idx_events_type_time
  ON events(event_type, created_at);

-- Query B (covering index includes common SELECT columns to enable Index Only Scan)
CREATE INDEX idx_events_user_time
  ON events(user_id, created_at DESC);

-- Query C (partial index on recent data only — avoids indexing 200M historical rows)
CREATE INDEX idx_events_recent_device
  ON events(created_at, device_type)
  WHERE created_at >= NOW() - INTERVAL '90 days';
\`\`\`

**Trade-offs:**
- Each index adds ~20–40% INSERT overhead on this table
- Partial index on Query C stays small (only 90 days of data) — refresh by recreating monthly
- For Query C, if runtime is still slow, consider a pre-aggregated materialized view refreshed hourly`,
    rubric: [
      "Equality columns placed before range columns in each composite index",
      "Query B index includes DESC to match ORDER BY direction",
      "Partial index proposed for Query C to limit index size",
      "Mentions INSERT overhead trade-off from multiple indexes",
      "Suggests covering index or materialized view for Query C if needed",
      "Three targeted indexes, not one catch-all index",
    ],
    tags: ["indexing", "query-optimization", "schema-design"],
    commonMistakes: ["Putting range column before equality column in composite index (invalidates index prefix usage)", "Adding a separate index on device_type alone — low cardinality makes it useless for GROUP BY", "Not considering INSERT overhead — indexing every column degrades write performance"],
  },
  {
    id: "sqq13", courseId: "sql", topicId: "sql-design",
    title: "Design a Star Schema for Sales Reporting", difficulty: "Medium", type: "open-ended", estimatedMinutes: 20,
    company: "Snowflake",
    prompt: "A retail company needs an OLAP schema for a dashboard showing: daily sales by store, product, customer segment, and promotion. Design a star schema with a fact table and all necessary dimension tables. Justify key design decisions.",
    hints: [
      "The grain of the fact table = one row per transaction line item (store + product + day + customer)",
      "Date dimension is almost always worth having — enables easy filtering on fiscal year, quarter, weekday",
      "Degenerate dimensions (promo code) can live on the fact table if they have no attributes worth storing separately",
    ],
    modelAnswer: `**Star Schema Design:**

**Fact Table — fact_sales (grain: one row per order line item)**
\`\`\`
fact_sales:
  sale_id         BIGINT PK
  date_key        INT FK → dim_date
  store_key       INT FK → dim_store
  product_key     INT FK → dim_product
  customer_key    INT FK → dim_customer
  promotion_key   INT FK → dim_promotion (nullable)
  quantity        INT
  unit_price      NUMERIC
  discount_amount NUMERIC
  net_revenue     NUMERIC  -- pre-computed: (unit_price - discount) * quantity
\`\`\`

**Dimension Tables:**
\`\`\`
dim_date:       date_key, full_date, year, quarter, month, week, day_of_week, is_holiday, fiscal_year
dim_store:      store_key, store_id, store_name, city, region, store_type
dim_product:    product_key, sku, product_name, category, subcategory, brand, unit_cost
dim_customer:   customer_key, customer_id, segment, acquisition_channel, first_order_date
dim_promotion:  promotion_key, promo_code, promo_type, discount_pct, start_date, end_date
\`\`\`

**Key design decisions:**
1. **Pre-compute net_revenue** on the fact table — avoids repeated arithmetic in every query
2. **Date dimension** — enables slice/dice by fiscal year, quarter, weekday without EXTRACT() calls that would prevent index use
3. **Nullable promotion_key** — most sales have no promotion; FK nullable to avoid a dummy "No Promotion" row in dim_promotion (though a sentinel row is a valid alternative)
4. **Customer segment in dim_customer** — not on the fact table, to keep the fact table narrow and allow segment changes to be tracked via SCD Type 2 if needed
5. **Surrogate keys** everywhere — insulates the schema from source system key changes`,
    rubric: [
      "Fact table grain stated explicitly (one row per line item)",
      "Date, store, product, customer dimensions all present",
      "Measures (revenue, quantity) on fact table, attributes on dimensions",
      "Pre-computed net_revenue justified",
      "Nullable promotion_key or sentinel row approach justified",
      "Surrogate keys mentioned",
    ],
    tags: ["star-schema", "data-warehouse", "dimensional-modeling"],
    commonMistakes: ["Putting all attributes on the fact table (no dimension separation)", "Grain not stated — leads to double-counting when joining multiple dimensions", "Forgetting the date dimension — using raw dates makes time intelligence queries complex"],
  },
  {
    id: "sqq14", courseId: "sql", topicId: "sql-design",
    title: "Diagnose and Architect an OLTP/OLAP Separation", difficulty: "Hard", type: "open-ended", estimatedMinutes: 22,
    company: "Confluent",
    prompt: "Your team's OLTP PostgreSQL database (10M orders/day) is experiencing 5-10 second query spikes that degrade the checkout API. Investigation shows the spikes correlate with analyst queries running GROUP BY and window functions over 6 months of orders. Design a solution architecture that lets analysts query freely without impacting production.",
    hints: [
      "Read replicas solve contention but don't solve the query pattern mismatch (row-oriented vs columnar)",
      "A streaming ETL (Kafka or Debezium) keeps the analytical store fresh without polling the primary",
      "The right separation: transactional workloads stay on OLTP, aggregate workloads move to a columnar store",
    ],
    modelAnswer: `**Root cause:**
Analysts are running full-table sequential scans on the primary OLTP database. PostgreSQL is row-oriented — scans of 6-month windows read every page of large tables, competing for I/O buffer pool with the transactional queries that the checkout API depends on.

**Target architecture:**

\`\`\`
[App servers] → [PostgreSQL primary] → [WAL streaming]
                        ↓                       ↓
               [PG read replica]        [Debezium CDC]
               (hot OLTP reads)               ↓
                                      [Kafka topic: orders]
                                               ↓
                                     [Spark/Flink streaming]
                                               ↓
                                  [Columnar store: Snowflake / BigQuery / Redshift]
                                       (analyst queries here)
\`\`\`

**Steps:**

1. **Immediate relief:** Route analyst traffic to a PostgreSQL read replica. This stops I/O contention on the primary within hours. Read replicas lag by ~seconds, acceptable for analytical queries.

2. **Medium-term fix:** Stand up a columnar analytical store (Snowflake, BigQuery, or Redshift). Use Debezium (or AWS DMS) to stream WAL changes from PostgreSQL into Kafka → transform → load into the columnar store. Analysts query the columnar store; the OLTP primary only handles transactional load.

3. **Data freshness SLA:** With streaming CDC, the columnar store can be 1–5 minutes behind the OLTP primary — communicate this lag SLA to the analytics team. For reports that can tolerate daily lag, a nightly batch export is cheaper.

4. **Guardrails:** Add a query timeout (e.g. 30 seconds) and a max-rows limit (5M) on the read replica to prevent runaway queries even as a short-term measure.

**Trade-offs:**
- Streaming CDC adds infrastructure cost and operational complexity
- Columnar stores charge per-query or per-TB scanned — set up cost controls
- The read replica alone doesn't solve the query pattern mismatch for very large scans (both will be slow on row-oriented data)`,
    rubric: [
      "Identifies I/O contention from sequential scans as root cause",
      "Proposes read replica as immediate mitigation",
      "Proposes columnar analytical store as long-term solution",
      "Mentions CDC streaming (Debezium, Kafka) to keep analytical store fresh",
      "Addresses freshness SLA for analyst data",
      "Discusses trade-offs (cost, complexity, acceptable lag)",
    ],
    tags: ["OLTP-OLAP", "architecture", "performance"],
    commonMistakes: ["Proposing only a read replica — it reduces contention but row-oriented scans are still slow", "Recommending adding more indexes to the primary — indexes help point lookups, not aggregate scans", "Not addressing data freshness — analysts need to know if data is 5 minutes or 24 hours old"],
  },

];
