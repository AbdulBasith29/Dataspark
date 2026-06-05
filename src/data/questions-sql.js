export const SQL_QUESTIONS = [
  {
    id: "sqq1", courseId: "sql", topicId: "sql-foundations",
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
    title: "Cohort Retention Analysis", difficulty: "Hard", type: "code", language: "sql", estimatedMinutes: 25,
    prompt: "Build a monthly cohort retention table showing cohort_month, cohort_size, months_since_signup (0–6), retained_users, and retention_rate for the last 12 months.",
    hints: [
      "First CTE: find each user's cohort_month (DATE_TRUNC of their signup date)",
      "Second CTE: for every session, calculate months between cohort_month and activity month",
      "Divide retained users by cohort_size * 100 for the rate",
    ],
    modelAnswer: `WITH cohorts AS (
  SELECT
    customer_id,
    DATE_TRUNC('month', created_at) AS cohort_month
  FROM customers
  WHERE created_at >= DATEADD('month', -12, DATE_TRUNC('month', CURRENT_DATE))
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
    DATEDIFF('month', c.cohort_month,
      DATE_TRUNC('month', s.created_at)) AS months_since_signup
  FROM cohorts c
  JOIN sessions s ON c.customer_id = s.customer_id
  WHERE DATEDIFF('month', c.cohort_month,
          DATE_TRUNC('month', s.created_at)) BETWEEN 0 AND 6
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
GROUP BY a.cohort_month, cs.cohort_size, a.months_since_signup
ORDER BY a.cohort_month, a.months_since_signup;`,
    rubric: [
      "CTE correctly identifies cohort_month per user",
      "Second CTE calculates months_since_signup using DATEDIFF",
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
];
