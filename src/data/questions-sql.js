// AGENT: curriculum-agent
// COURSE: SQL for Analytics
// STATUS: Complete — 40 questions
// REVIEWED: Pending review-agent

export const SQL_QUESTIONS = [

  // ═══ SQL BASICS (8 questions) ═══
  {
    id: "sql-q01", courseId: "sql", topicId: "sql-basics",
    title: "Filter High-Value Completed Payments",
    difficulty: "Easy", company: "Stripe", type: "code", language: "sql", estimatedMinutes: 8,
    prompt: `You're a data analyst at Stripe. The payments table has columns: payment_id, user_id, amount, currency, status (values: 'completed', 'failed', 'pending'), created_at (timestamp). Write a query to retrieve all completed payments over $1,000 created in the last 30 days, ordered from largest to smallest amount.`,
    hints: ["Use WHERE with multiple conditions joined by AND", "CURRENT_DATE - INTERVAL '30 days' handles date math in most SQL dialects", "ORDER BY amount DESC puts largest first"],
    modelAnswer: `SELECT payment_id, user_id, amount, currency, created_at
FROM payments
WHERE status = 'completed'
  AND amount > 1000
  AND created_at >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY amount DESC;`,
    rubric: ["Correct status filter", "Amount threshold applied", "Date range logic correct", "ORDER BY direction correct", "Relevant columns selected"],
    tags: ["filtering", "where-clause", "date-math", "ordering"],
    commonMistakes: ["Using = instead of >= for date comparison", "Forgetting the status = 'completed' condition"]
  },
  {
    id: "sql-q02", courseId: "sql", topicId: "sql-basics",
    title: "Identify Distinct Active Markets",
    difficulty: "Easy", company: "Airbnb", type: "code", language: "sql", estimatedMinutes: 8,
    prompt: `You're on the analytics team at Airbnb. The listings table has columns: listing_id, host_id, city, country, price_per_night, is_active (boolean), created_at. Write a query to return a sorted list of distinct city and country combinations where active listings exist. No duplicates, sorted alphabetically by country then city.`,
    hints: ["DISTINCT removes duplicate rows", "Filter with WHERE is_active = TRUE (or = 1)", "ORDER BY can take multiple columns separated by commas"],
    modelAnswer: `SELECT DISTINCT city, country
FROM listings
WHERE is_active = TRUE
ORDER BY country, city;`,
    rubric: ["DISTINCT used correctly", "Filters only active listings", "Both city and country returned", "Sorted by country then city"],
    tags: ["distinct", "filtering", "ordering", "basics"],
    commonMistakes: ["Forgetting DISTINCT and getting duplicates", "Wrong sort order (city before country)"]
  },
  {
    id: "sql-q03", courseId: "sql", topicId: "sql-basics",
    title: "Classify Rides by Distance Bucket",
    difficulty: "Easy", company: "Uber", type: "code", language: "sql", estimatedMinutes: 10,
    prompt: `You're a data analyst at Uber. The trips table has columns: trip_id, driver_id, rider_id, distance_miles, fare_amount, trip_status, started_at. Write a query that returns trip_id, distance_miles, fare_amount, and a new column called distance_category that labels each trip as 'Short' (under 3 miles), 'Medium' (3-10 miles), or 'Long' (over 10 miles). Only include completed trips.`,
    hints: ["CASE WHEN ... THEN ... WHEN ... THEN ... ELSE ... END creates conditional columns", "Order your CASE conditions from most specific to most general", "Filter for trip_status = 'completed' in WHERE"],
    modelAnswer: `SELECT
  trip_id,
  distance_miles,
  fare_amount,
  CASE
    WHEN distance_miles < 3 THEN 'Short'
    WHEN distance_miles <= 10 THEN 'Medium'
    ELSE 'Long'
  END AS distance_category
FROM trips
WHERE trip_status = 'completed';`,
    rubric: ["CASE WHEN syntax correct", "Three categories defined accurately", "Alias distance_category applied", "Filters to completed trips only", "Correct columns selected"],
    tags: ["case-when", "conditional-logic", "filtering", "basics"],
    commonMistakes: ["Using IF instead of CASE WHEN in standard SQL", "Overlapping range boundaries (e.g. < 3 and <= 3)"]
  },
  {
    id: "sql-q04", courseId: "sql", topicId: "sql-basics",
    title: "Handle NULL Subscription End Dates",
    difficulty: "Easy", company: "Netflix", type: "code", language: "sql", estimatedMinutes: 10,
    prompt: `You're an analyst at Netflix. The subscriptions table has: subscription_id, user_id, plan_type, started_at, ended_at (NULL if still active), monthly_price. Write a query that returns all subscriptions with: subscription_id, user_id, plan_type, monthly_price, and a status column showing 'Active' when ended_at IS NULL and 'Cancelled' otherwise. Also return days_active: for active subs use CURRENT_DATE - started_at, for cancelled use ended_at - started_at.`,
    hints: ["IS NULL checks for missing values — never use = NULL", "COALESCE(ended_at, CURRENT_DATE) gives you the end date to use regardless of status", "CASE WHEN can reference the same column multiple times"],
    modelAnswer: `SELECT
  subscription_id,
  user_id,
  plan_type,
  monthly_price,
  CASE WHEN ended_at IS NULL THEN 'Active' ELSE 'Cancelled' END AS status,
  (COALESCE(ended_at, CURRENT_DATE) - started_at) AS days_active
FROM subscriptions;`,
    rubric: ["IS NULL used (not = NULL)", "Status column correct for both cases", "COALESCE or CASE handles NULL end date for days_active", "All required columns returned"],
    tags: ["null-handling", "coalesce", "case-when", "basics"],
    commonMistakes: ["Using ended_at = NULL instead of IS NULL", "Not accounting for active subscriptions in days_active calculation"]
  },
  {
    id: "sql-q05", courseId: "sql", topicId: "sql-basics",
    title: "Top 10 Trending Tracks This Week",
    difficulty: "Easy", company: "Spotify", type: "code", language: "sql", estimatedMinutes: 8,
    prompt: `You're a data analyst at Spotify. The streams table has: stream_id, track_id, user_id, streamed_at, duration_seconds, country. The tracks table has: track_id, title, artist_name, genre, release_date. Write a query to find the top 10 most-streamed tracks in the last 7 days. Return: track_id, title, artist_name, and stream_count. Order by stream_count descending.`,
    hints: ["JOIN tracks on track_id to get title and artist_name", "Filter streamed_at to last 7 days with CURRENT_DATE - INTERVAL '7 days'", "COUNT(*) counts streams, GROUP BY track_id/title/artist_name", "LIMIT 10 after ORDER BY"],
    modelAnswer: `SELECT
  s.track_id,
  t.title,
  t.artist_name,
  COUNT(*) AS stream_count
FROM streams s
JOIN tracks t ON s.track_id = t.track_id
WHERE s.streamed_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY s.track_id, t.title, t.artist_name
ORDER BY stream_count DESC
LIMIT 10;`,
    rubric: ["JOIN to tracks table correct", "Date filter for last 7 days", "COUNT(*) for stream_count", "GROUP BY includes all non-aggregated columns", "LIMIT 10 applied after ORDER BY"],
    tags: ["joins", "aggregation", "limit", "ordering", "basics"],
    commonMistakes: ["Forgetting GROUP BY non-aggregated columns", "Putting LIMIT before ORDER BY mentally"]
  },
  {
    id: "sql-q06", courseId: "sql", topicId: "sql-basics",
    title: "Explain Data Types for a Transactions Table",
    difficulty: "Easy", company: "Shopify", type: "open-ended", estimatedMinutes: 10,
    prompt: `You're joining the data team at Shopify. A colleague has designed a transactions table with these column definitions:

- transaction_id VARCHAR(50)
- order_id TEXT
- amount TEXT
- is_refund VARCHAR(5)
- created_at VARCHAR(30)
- tax_rate TEXT

Identify the problems with these data type choices and propose better types. Explain the performance and correctness implications of each change.`,
    hints: ["Consider what operations you'd want to do on each column (math on amounts, date filtering on timestamps)", "Think about storage efficiency and indexing", "VARCHAR vs TEXT vs fixed types — when does each matter?"],
    modelAnswer: `## Data Type Problems and Fixes

**transaction_id**: \`VARCHAR(50)\` is acceptable for string IDs, but if IDs are always UUIDs, \`UUID\` type is better — it validates format and uses 16 bytes vs ~37 bytes. If auto-incremented integers, use \`BIGINT\`.

**order_id**: \`TEXT\` is fine for variable-length strings, but consider \`INT\` or \`BIGINT\` if order IDs are numeric — enables faster joins and range queries.

**amount**: Storing money as \`TEXT\` is dangerous. Use \`DECIMAL(12, 2)\` or \`NUMERIC(12, 2)\`. Never use \`FLOAT\` for money (floating point rounding errors). TEXT prevents math operations like SUM and AVG.

**is_refund**: \`VARCHAR(5)\` storing 'true''/'false' wastes space. Use \`BOOLEAN\` — it's semantically correct, 1 byte, and enables \`WHERE is_refund = TRUE\`.

**created_at**: \`VARCHAR(30)\` for dates is very bad. Use \`TIMESTAMP WITH TIME ZONE\` (or \`TIMESTAMPTZ\` in PostgreSQL). Storing as text breaks date arithmetic, range queries, and indexing efficiency. You also lose timezone information.

**tax_rate**: Storing a percentage as \`TEXT\` prevents calculations. Use \`DECIMAL(5, 4)\` for rates like 0.0875 (8.75%), or \`NUMERIC(5, 2)\` if storing as whole percentages.

## Key Takeaways
- Use numeric types for anything you'll do math on
- Use proper TIMESTAMP types for dates — never strings
- Use BOOLEAN for true/false flags
- TEXT/VARCHAR should store actual text data, not encoded values`,
    rubric: ["Identifies all 6 problematic columns", "Proposes correct alternative types", "Explains money type dangers (float vs decimal)", "Addresses timestamp vs varchar for dates", "Mentions performance/indexing implications", "Covers boolean for flags"],
    tags: ["data-types", "schema-design", "best-practices", "basics"],
    commonMistakes: ["Recommending FLOAT for money", "Not distinguishing TIMESTAMP vs DATE vs VARCHAR for time storage"]
  },
  {
    id: "sql-q07", courseId: "sql", topicId: "sql-basics",
    title: "Paginate Search Results for Job Listings",
    difficulty: "Easy", company: "LinkedIn", type: "code", language: "sql", estimatedMinutes: 8,
    prompt: `You're on the data infrastructure team at LinkedIn. The job_postings table has: job_id, company_name, title, location, salary_min, salary_max, posted_at, is_active. A search results page shows 20 jobs per page. Write a query to return page 3 of active job postings in San Francisco, sorted by posted_at descending (newest first).`,
    hints: ["LIMIT controls how many rows to return", "OFFSET skips a number of rows — for page N with page_size P, offset is (N-1) * P", "Page 3 with 20 per page = OFFSET 40"],
    modelAnswer: `SELECT job_id, company_name, title, location, salary_min, salary_max, posted_at
FROM job_postings
WHERE is_active = TRUE
  AND location = 'San Francisco'
ORDER BY posted_at DESC
LIMIT 20
OFFSET 40;`,
    rubric: ["Filters active jobs in SF correctly", "ORDER BY posted_at DESC", "LIMIT 20 correct", "OFFSET 40 correct for page 3"],
    tags: ["pagination", "limit", "offset", "ordering"],
    commonMistakes: ["Using OFFSET 60 (off by one in page calculation)", "Forgetting ORDER BY makes pagination non-deterministic"]
  },
  {
    id: "sql-q08", courseId: "sql", topicId: "sql-basics",
    title: "Segment Orders by Value Tier",
    difficulty: "Easy", company: "Amazon", type: "code", language: "sql", estimatedMinutes: 10,
    prompt: `You're an analyst at Amazon. The orders table has: order_id, customer_id, order_total, order_status, order_date. Write a query that returns order_id, customer_id, order_total, and a tier column: 'Bronze' for orders under $50, 'Silver' for $50-$199.99, 'Gold' for $200-$499.99, 'Platinum' for $500 and above. Only include orders with status = 'delivered'.`,
    hints: ["CASE WHEN with BETWEEN or >= / < operators", "BETWEEN is inclusive on both ends", "Alias the CASE expression with AS tier"],
    modelAnswer: `SELECT
  order_id,
  customer_id,
  order_total,
  CASE
    WHEN order_total < 50 THEN 'Bronze'
    WHEN order_total < 200 THEN 'Silver'
    WHEN order_total < 500 THEN 'Gold'
    ELSE 'Platinum'
  END AS tier
FROM orders
WHERE order_status = 'delivered';`,
    rubric: ["Four tiers defined correctly", "CASE WHEN boundaries are non-overlapping", "Alias tier applied", "Filters to delivered orders", "All required columns returned"],
    tags: ["case-when", "segmentation", "filtering", "basics"],
    commonMistakes: ["Overlapping BETWEEN boundaries", "Missing ELSE clause leaving some orders as NULL tier"]
  },

  // ═══ SQL AGGREGATION (8 questions) ═══
  {
    id: "sql-q09", courseId: "sql", topicId: "sql-aggregation",
    title: "Daily Revenue Report by Payment Method",
    difficulty: "Easy", company: "Stripe", type: "code", language: "sql", estimatedMinutes: 10,
    prompt: `You're building a daily revenue dashboard at Stripe. The transactions table has: transaction_id, merchant_id, amount, payment_method ('card', 'bank_transfer', 'wallet'), status, created_at (date). Write a query to show the total transaction count and total revenue for each payment_method on each day in the last 14 days, for completed transactions only. Order by date descending, then payment_method.`,
    hints: ["GROUP BY can take multiple columns", "COUNT(*) for transaction count, SUM(amount) for revenue", "DATE(created_at) extracts just the date from a timestamp"],
    modelAnswer: `SELECT
  DATE(created_at) AS transaction_date,
  payment_method,
  COUNT(*) AS transaction_count,
  SUM(amount) AS total_revenue
FROM transactions
WHERE status = 'completed'
  AND created_at >= CURRENT_DATE - INTERVAL '14 days'
GROUP BY DATE(created_at), payment_method
ORDER BY transaction_date DESC, payment_method;`,
    rubric: ["DATE() extraction used for grouping", "Both COUNT and SUM present", "GROUP BY matches SELECT non-aggregated columns", "Date range filter correct", "ORDER BY both columns"],
    tags: ["group-by", "aggregation", "count", "sum", "date-functions"],
    commonMistakes: ["GROUP BY the full timestamp instead of DATE()", "Forgetting status = completed filter"]
  },
  {
    id: "sql-q10", courseId: "sql", topicId: "sql-aggregation",
    title: "Find Restaurants Below Rating Threshold",
    difficulty: "Easy", company: "DoorDash", type: "code", language: "sql", estimatedMinutes: 10,
    prompt: `You work on the quality team at DoorDash. The orders table has: order_id, restaurant_id, customer_rating (1-5), delivery_time_minutes, order_date. The restaurants table has: restaurant_id, name, cuisine_type, city. Find all restaurants that have received at least 20 orders and have an average customer rating below 3.5. Return: restaurant_id, name, cuisine_type, order_count, and avg_rating (rounded to 2 decimal places). Order by avg_rating ascending.`,
    hints: ["JOIN restaurants on restaurant_id", "HAVING filters on aggregated values — use it for the avg < 3.5 and count >= 20 conditions", "ROUND(AVG(column), 2) rounds the average"],
    modelAnswer: `SELECT
  r.restaurant_id,
  r.name,
  r.cuisine_type,
  COUNT(*) AS order_count,
  ROUND(AVG(o.customer_rating), 2) AS avg_rating
FROM orders o
JOIN restaurants r ON o.restaurant_id = r.restaurant_id
GROUP BY r.restaurant_id, r.name, r.cuisine_type
HAVING COUNT(*) >= 20 AND AVG(o.customer_rating) < 3.5
ORDER BY avg_rating ASC;`,
    rubric: ["JOIN to restaurants correct", "GROUP BY all non-aggregated columns", "HAVING for both conditions", "ROUND applied", "ORDER BY avg_rating ascending"],
    tags: ["having", "group-by", "aggregation", "joins", "avg"],
    commonMistakes: ["Using WHERE instead of HAVING for aggregated conditions", "Not including non-aggregated SELECT columns in GROUP BY"]
  },
  {
    id: "sql-q11", courseId: "sql", topicId: "sql-aggregation",
    title: "Explain HAVING vs WHERE in Aggregation",
    difficulty: "Easy", company: "Google", type: "open-ended", estimatedMinutes: 10,
    prompt: `You're being interviewed at Google. The interviewer asks: "Explain the difference between WHERE and HAVING in SQL. When would you use each? Give a concrete business example where using WHERE instead of HAVING (or vice versa) would produce incorrect results."`,
    hints: ["Think about the order of SQL execution: FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY", "WHERE filters rows before grouping; HAVING filters groups after aggregation", "Can you use both in the same query?"],
    modelAnswer: `## WHERE vs HAVING

**WHERE** filters individual rows *before* they are grouped by GROUP BY. It operates on raw row data and cannot reference aggregate functions like COUNT(), SUM(), AVG().

**HAVING** filters groups *after* GROUP BY aggregation. It can reference aggregate functions and is used to filter based on calculated group statistics.

## Execution Order
SQL processes clauses in this order:
1. FROM / JOIN
2. WHERE (filter raw rows)
3. GROUP BY (form groups)
4. HAVING (filter groups)
5. SELECT (compute output)
6. ORDER BY

## Business Example
Scenario: Find markets where average order value is over $50, but only considering completed orders.

\`\`\`sql
-- CORRECT: WHERE filters rows, HAVING filters groups
SELECT city, COUNT(*) AS orders, AVG(amount) AS avg_value
FROM orders
WHERE status = 'completed'        -- filter ROWS first
GROUP BY city
HAVING AVG(amount) > 50;          -- filter GROUPS after

-- WRONG: Cannot use aggregate in WHERE
SELECT city, COUNT(*), AVG(amount)
FROM orders
WHERE status = 'completed' AND AVG(amount) > 50  -- ERROR!
GROUP BY city;
\`\`\`

## Both Together
You can use WHERE and HAVING in the same query. WHERE reduces the rows entering the aggregation; HAVING then filters the resulting groups.`,
    rubric: ["Explains WHERE operates before GROUP BY", "Explains HAVING operates after GROUP BY", "States HAVING can reference aggregates WHERE cannot", "Correct business example provided", "Mentions both can coexist in one query"],
    tags: ["having", "where", "group-by", "aggregation", "concepts"],
    commonMistakes: ["Thinking HAVING replaces WHERE", "Not knowing WHERE runs before aggregation"]
  },
  {
    id: "sql-q12", courseId: "sql", topicId: "sql-aggregation",
    title: "Weekly Cohort Retention Summary",
    difficulty: "Medium", company: "Meta", type: "code", language: "sql", estimatedMinutes: 15,
    prompt: `You're a growth analyst at Meta. The user_events table has: user_id, event_type, event_date. The users table has: user_id, signup_date, country. Write a query to calculate, for each signup week (week of signup_date), the count of users who signed up that week and how many of those users also had any event in the 7 days after signup (retained users). Return: signup_week, cohort_size, retained_users, and retention_rate (as a percentage rounded to 1 decimal).`,
    hints: ["DATE_TRUNC('week', signup_date) groups users into weekly cohorts", "Use a LEFT JOIN or subquery to find retained users", "Retention rate = retained_users * 100.0 / cohort_size", "ROUND(..., 1) for 1 decimal place"],
    modelAnswer: `SELECT
  DATE_TRUNC('week', u.signup_date) AS signup_week,
  COUNT(DISTINCT u.user_id) AS cohort_size,
  COUNT(DISTINCT e.user_id) AS retained_users,
  ROUND(COUNT(DISTINCT e.user_id) * 100.0 / COUNT(DISTINCT u.user_id), 1) AS retention_rate
FROM users u
LEFT JOIN user_events e
  ON u.user_id = e.user_id
  AND e.event_date BETWEEN u.signup_date AND u.signup_date + INTERVAL '7 days'
GROUP BY DATE_TRUNC('week', u.signup_date)
ORDER BY signup_week;`,
    rubric: ["DATE_TRUNC for weekly cohorts", "LEFT JOIN to catch all users including unretained", "Join condition includes date range", "COUNT DISTINCT used correctly", "Retention rate formula correct", "Ordered by week"],
    tags: ["cohort-analysis", "retention", "group-by", "aggregation", "date-functions"],
    commonMistakes: ["Using INNER JOIN which drops unretained users from count", "Forgetting to use COUNT DISTINCT for users"]
  },
  {
    id: "sql-q13", courseId: "sql", topicId: "sql-aggregation",
    title: "Driver Earnings Summary with NULL Bonuses",
    difficulty: "Medium", company: "Lyft", type: "code", language: "sql", estimatedMinutes: 12,
    prompt: `You're an analyst on Lyft's driver team. The driver_payments table has: payment_id, driver_id, base_pay, tip_amount, bonus_amount (NULL when no bonus was earned), payment_date. Write a query to produce a monthly earnings summary per driver showing: driver_id, month (YYYY-MM format), total_trips, total_base_pay, total_tips, total_bonuses (treat NULL as 0), avg_bonus_when_earned (average bonus only for payments where bonus_amount IS NOT NULL, NULL if driver never earned a bonus), and total_earnings (sum of all three components).`,
    hints: ["COALESCE(bonus_amount, 0) replaces NULL with 0 for total bonuses", "For avg_bonus_when_earned, AVG() already ignores NULLs by default", "TO_CHAR(payment_date, 'YYYY-MM') or DATE_TRUNC for month grouping"],
    modelAnswer: `SELECT
  driver_id,
  TO_CHAR(payment_date, 'YYYY-MM') AS month,
  COUNT(*) AS total_trips,
  SUM(base_pay) AS total_base_pay,
  SUM(tip_amount) AS total_tips,
  SUM(COALESCE(bonus_amount, 0)) AS total_bonuses,
  AVG(bonus_amount) AS avg_bonus_when_earned,
  SUM(base_pay + tip_amount + COALESCE(bonus_amount, 0)) AS total_earnings
FROM driver_payments
GROUP BY driver_id, TO_CHAR(payment_date, 'YYYY-MM')
ORDER BY driver_id, month;`,
    rubric: ["COALESCE for NULL bonuses in total", "AVG ignores NULLs naturally for avg_bonus_when_earned", "Month formatting correct", "All 7 output columns present", "GROUP BY matches non-aggregated columns", "total_earnings adds all three components"],
    tags: ["null-handling", "coalesce", "aggregation", "group-by", "avg"],
    commonMistakes: ["Not using COALESCE causing bonus NULLs to propagate in SUM", "Manually filtering NULLs for AVG when it handles them automatically"]
  },
  {
    id: "sql-q14", courseId: "sql", topicId: "sql-aggregation",
    title: "Category Revenue Rollup Report",
    difficulty: "Medium", company: "Amazon", type: "code", language: "sql", estimatedMinutes: 15,
    prompt: `You're a BI analyst at Amazon. The sales table has: sale_id, category, subcategory, region, revenue, sale_date. The finance team wants a report showing total revenue for: each category+subcategory combination, each category total, and the grand total — all in a single query. Use ROLLUP to produce subtotals. Order by category (NULLs last), subcategory (NULLs last). Add a label column showing 'Detail', 'Category Total', or 'Grand Total' based on which level the row represents.`,
    hints: ["GROUP BY ROLLUP(category, subcategory) generates subtotals automatically", "GROUPING(column) returns 1 when that column is aggregated away in a rollup row", "CASE WHEN GROUPING(category)=1 THEN 'Grand Total' WHEN GROUPING(subcategory)=1 THEN 'Category Total' ELSE 'Detail' END"],
    modelAnswer: `SELECT
  category,
  subcategory,
  SUM(revenue) AS total_revenue,
  CASE
    WHEN GROUPING(category) = 1 THEN 'Grand Total'
    WHEN GROUPING(subcategory) = 1 THEN 'Category Total'
    ELSE 'Detail'
  END AS row_type
FROM sales
GROUP BY ROLLUP(category, subcategory)
ORDER BY
  GROUPING(category),
  category NULLS LAST,
  GROUPING(subcategory),
  subcategory NULLS LAST;`,
    rubric: ["ROLLUP syntax correct", "GROUPING() function used", "row_type label logic correct", "Ordering handles NULLs correctly", "SUM of revenue aggregated"],
    tags: ["rollup", "grouping", "aggregation", "reporting", "group-by"],
    commonMistakes: ["Confusing ROLLUP with CUBE", "Not using GROUPING() and instead checking IS NULL (breaks if real NULLs exist in data)"]
  },
  {
    id: "sql-q15", courseId: "sql", topicId: "sql-aggregation",
    title: "User Activity Heatmap by Hour and Day",
    difficulty: "Medium", company: "Twitter", type: "code", language: "sql", estimatedMinutes: 15,
    prompt: `You're a data analyst at Twitter (now X). The tweet_events table has: event_id, user_id, event_type ('tweet', 'like', 'retweet', 'reply'), created_at (timestamp). Build a heatmap dataset showing tweet volume by day of week (Monday=1 to Sunday=7) and hour of day (0-23). Return: day_of_week (integer), hour_of_day (integer), event_count, and what percentage of total events that cell represents (rounded to 3 decimal places). Only include 'tweet' events. Order by day_of_week, hour_of_day.`,
    hints: ["EXTRACT(DOW FROM created_at) in PostgreSQL gives day of week (0=Sunday)", "EXTRACT(HOUR FROM created_at) gives hour 0-23", "Percentage = count * 100.0 / SUM(count) OVER () uses a window function"],
    modelAnswer: `SELECT
  EXTRACT(ISODOW FROM created_at) AS day_of_week,
  EXTRACT(HOUR FROM created_at) AS hour_of_day,
  COUNT(*) AS event_count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 3) AS pct_of_total
FROM tweet_events
WHERE event_type = 'tweet'
GROUP BY EXTRACT(ISODOW FROM created_at), EXTRACT(HOUR FROM created_at)
ORDER BY day_of_week, hour_of_day;`,
    rubric: ["EXTRACT for day and hour", "ISODOW for Monday=1 convention", "Filter to tweet events", "Window function SUM OVER () for total percentage", "ROUND to 3 decimal places", "ORDER BY both dimensions"],
    tags: ["extract", "aggregation", "window-functions", "date-functions", "heatmap"],
    commonMistakes: ["Using DOW which gives Sunday=0 instead of ISODOW", "Calculating percentage with a subquery instead of window function"]
  },
  {
    id: "sql-q16", courseId: "sql", topicId: "sql-aggregation",
    title: "Menu Item Performance Analysis",
    difficulty: "Hard", company: "DoorDash", type: "code", language: "sql", estimatedMinutes: 18,
    prompt: `You're on the analytics team at DoorDash. The order_items table has: order_id, restaurant_id, item_id, item_name, item_price, quantity, discount_amount. The orders table has: order_id, restaurant_id, customer_id, order_date, order_status. Write a comprehensive item performance query that returns for each restaurant+item combination: restaurant_id, item_name, total_orders (distinct orders containing this item), total_quantity_sold, gross_revenue (price * quantity), total_discounts, net_revenue (gross - discounts), avg_order_size (avg quantity per order), and rank_in_restaurant (ranked by net_revenue within each restaurant, 1 = best). Only include delivered orders.`,
    hints: ["JOIN order_items to orders for the status filter", "RANK() OVER (PARTITION BY restaurant_id ORDER BY net_revenue DESC) for within-restaurant ranking", "You can use net_revenue calculation in RANK by repeating it or using a CTE"],
    modelAnswer: `SELECT
  oi.restaurant_id,
  oi.item_name,
  COUNT(DISTINCT oi.order_id) AS total_orders,
  SUM(oi.quantity) AS total_quantity_sold,
  SUM(oi.item_price * oi.quantity) AS gross_revenue,
  SUM(oi.discount_amount) AS total_discounts,
  SUM(oi.item_price * oi.quantity) - SUM(oi.discount_amount) AS net_revenue,
  AVG(oi.quantity) AS avg_order_size,
  RANK() OVER (
    PARTITION BY oi.restaurant_id
    ORDER BY SUM(oi.item_price * oi.quantity) - SUM(oi.discount_amount) DESC
  ) AS rank_in_restaurant
FROM order_items oi
JOIN orders o ON oi.order_id = o.order_id
WHERE o.order_status = 'delivered'
GROUP BY oi.restaurant_id, oi.item_name;`,
    rubric: ["JOIN to orders for status filter", "COUNT DISTINCT for order count", "Gross and net revenue formulas correct", "RANK() OVER PARTITION BY restaurant_id", "All 9 columns present", "GROUP BY correct"],
    tags: ["aggregation", "window-functions", "rank", "joins", "group-by"],
    commonMistakes: ["Using COUNT(*) instead of COUNT(DISTINCT order_id) for total_orders", "Forgetting that window functions run after GROUP BY so aggregate can be reused in OVER"]
  },
  {
    id: "sql-q17", courseId: "sql", topicId: "sql-advanced",
    title: "Explain CUBE vs ROLLUP for Multi-Dimensional Analysis",
    difficulty: "Medium", company: "Google", type: "open-ended", estimatedMinutes: 14,
    prompt: `You're presenting to the analytics team at Google. Explain the difference between ROLLUP and CUBE in SQL GROUP BY. When would you use each? What is GROUPING SETS and how does it relate to both? Provide a concrete business example for each, such as a sales analysis across region and product category.`,
    hints: ["ROLLUP creates a hierarchy of subtotals based on column order", "CUBE creates all possible subtotal combinations", "GROUPING SETS is the explicit version that lets you specify exactly which combinations to compute"],
    modelAnswer: `## ROLLUP vs CUBE vs GROUPING SETS

### ROLLUP
ROLLUP(a, b, c) generates subtotals in a **hierarchical** order following the column sequence:
- (a, b, c) — full detail
- (a, b) — subtotal dropping c
- (a) — subtotal dropping b and c
- () — grand total

Business example: Sales by Year → Quarter → Month. ROLLUP is perfect because you want year totals, quarter totals within each year, and grand total — but not month totals across all years.

\`\`\`sql
SELECT year, quarter, month, SUM(revenue)
FROM sales
GROUP BY ROLLUP(year, quarter, month);
\`\`\`

### CUBE
CUBE(a, b) generates **all possible combinations** of subtotals:
- (a, b) — full detail
- (a) — subtotal by a
- (b) — subtotal by b
- () — grand total

For CUBE(region, category): you get totals by region, by category, and the grand total — useful when there's no inherent hierarchy.

Business example: Sales cross-tabulation where you want: by region, by product category, by region+category, and grand total all at once.

\`\`\`sql
SELECT region, category, SUM(revenue)
FROM sales
GROUP BY CUBE(region, category);
\`\`\`

### GROUPING SETS
Explicitly defines which combinations to compute — more control than CUBE or ROLLUP:
\`\`\`sql
GROUP BY GROUPING SETS ((region, category), (region), (category), ())
\`\`\`

This is equivalent to the CUBE above, but you can omit combinations you don't need.

### When to Use Each
- **ROLLUP**: Time hierarchies (year/quarter/month), organizational hierarchies
- **CUBE**: Cross-dimensional analysis where all combinations are meaningful
- **GROUPING SETS**: When you want a custom subset of combinations for efficiency`,
    rubric: ["ROLLUP hierarchy correctly explained", "CUBE all-combinations correctly explained", "GROUPING SETS relationship explained", "Concrete SQL examples for each", "Business context provided", "When to use guidance given"],
    tags: ["rollup", "cube", "grouping-sets", "aggregation", "concepts"],
    commonMistakes: ["Confusing ROLLUP order dependency with CUBE's symmetry", "Not knowing GROUPING SETS is the explicit generalization of both"]
  },
  {
    id: "sql-q18", courseId: "sql", topicId: "sql-advanced",
    title: "Customer Spend Percentiles and Buckets",
    difficulty: "Hard", company: "Shopify", type: "code", language: "sql", estimatedMinutes: 20,
    prompt: `You're a senior analyst at Shopify. The orders table has: order_id, customer_id, store_id, total_amount, created_at. Calculate per customer: their total spend (last 90 days), order count, average order value, and which spend percentile bucket they fall in (P0-P25, P25-P50, P50-P75, P75-P90, P90-P99, P99+). Return results ordered by total_spend descending. Use window functions to compute percentiles without subqueries.`,
    hints: ["NTILE(100) assigns each customer to a percentile bucket", "Calculate customer aggregates first using GROUP BY, then apply NTILE over those results", "You can use NTILE in the same query as GROUP BY by wrapping in a subquery or CTE — window functions run after GROUP BY", "CASE WHEN percentile <= 25 THEN 'P0-P25' ..."],
    modelAnswer: `WITH customer_stats AS (
  SELECT
    customer_id,
    COUNT(*) AS order_count,
    SUM(total_amount) AS total_spend,
    AVG(total_amount) AS avg_order_value
  FROM orders
  WHERE created_at >= CURRENT_DATE - INTERVAL '90 days'
  GROUP BY customer_id
),
customer_percentiles AS (
  SELECT
    *,
    NTILE(100) OVER (ORDER BY total_spend) AS spend_percentile
  FROM customer_stats
)
SELECT
  customer_id,
  order_count,
  ROUND(total_spend, 2) AS total_spend,
  ROUND(avg_order_value, 2) AS avg_order_value,
  CASE
    WHEN spend_percentile > 99 THEN 'P99+'
    WHEN spend_percentile > 90 THEN 'P90-P99'
    WHEN spend_percentile > 75 THEN 'P75-P90'
    WHEN spend_percentile > 50 THEN 'P50-P75'
    WHEN spend_percentile > 25 THEN 'P25-P50'
    ELSE 'P0-P25'
  END AS spend_bucket
FROM customer_percentiles
ORDER BY total_spend DESC;`,
    rubric: ["CTE for customer aggregation", "NTILE(100) for percentile assignment", "CASE WHEN for bucket labeling", "90 day date filter", "All required columns returned", "Ordered by total_spend DESC"],
    tags: ["ntile", "percentiles", "window-functions", "aggregation", "cte"],
    commonMistakes: ["Trying to use NTILE in the same SELECT as GROUP BY without a CTE/subquery", "Wrong CASE WHEN order causing bucket overlap"]
  },

  // ═══ SQL JOINS (8 questions) ═══
  {
    id: "sql-q19", courseId: "sql", topicId: "sql-joins",
    title: "Find Customers Who Never Ordered",
    difficulty: "Easy", company: "Amazon", type: "code", language: "sql", estimatedMinutes: 10,
    prompt: `You're on the CRM team at Amazon. The customers table has: customer_id, email, signup_date, country. The orders table has: order_id, customer_id, total_amount, order_date. Find all customers who have never placed an order. Return their customer_id, email, signup_date, and days_since_signup. This is an anti-join pattern.`,
    hints: ["LEFT JOIN + WHERE right.id IS NULL is the classic anti-join", "You could also use NOT EXISTS or NOT IN — understand the tradeoffs", "Days since signup: CURRENT_DATE - signup_date"],
    modelAnswer: `-- Method 1: LEFT JOIN anti-join
SELECT
  c.customer_id,
  c.email,
  c.signup_date,
  CURRENT_DATE - c.signup_date AS days_since_signup
FROM customers c
LEFT JOIN orders o ON c.customer_id = o.customer_id
WHERE o.customer_id IS NULL
ORDER BY c.signup_date;`,
    rubric: ["LEFT JOIN used (not INNER JOIN)", "WHERE NULL check on orders side", "All required columns returned", "days_since_signup calculated", "Anti-join pattern correctly implemented"],
    tags: ["anti-join", "left-join", "null-handling", "joins"],
    commonMistakes: ["Using INNER JOIN which only returns customers WITH orders", "Checking WHERE o.order_id IS NULL instead of the join key"]
  },
  {
    id: "sql-q20", courseId: "sql", topicId: "sql-joins",
    title: "Match Riders to Their Most Recent Driver",
    difficulty: "Easy", company: "Lyft", type: "code", language: "sql", estimatedMinutes: 10,
    prompt: `You're an analyst at Lyft. The rides table has: ride_id, rider_id, driver_id, started_at, ended_at, fare. The users table has: user_id, name, email, user_type ('rider' or 'driver'), city. Write a query to return a list of all completed rides in the last 7 days showing: ride_id, rider_name, driver_name, fare, and started_at. Both rider and driver information must come from the same users table.`,
    hints: ["You need to JOIN users twice — alias one as rider and one as driver", "JOIN users AS r ON rides.rider_id = r.user_id, JOIN users AS d ON rides.driver_id = d.user_id", "Both joins should be INNER JOIN since every ride should have a valid rider and driver"],
    modelAnswer: `SELECT
  ri.ride_id,
  r.name AS rider_name,
  d.name AS driver_name,
  ri.fare,
  ri.started_at
FROM rides ri
JOIN users r ON ri.rider_id = r.user_id
JOIN users d ON ri.driver_id = d.user_id
WHERE ri.ended_at IS NOT NULL
  AND ri.started_at >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY ri.started_at DESC;`,
    rubric: ["Self-join on users table with two aliases", "First join for rider, second for driver", "Filter for completed rides (ended_at not null)", "Date range filter correct", "Column aliases rider_name and driver_name"],
    tags: ["self-join", "joins", "aliases", "basics"],
    commonMistakes: ["Trying to use a single JOIN to get both names", "Not aliasing the joined tables causing ambiguous column names"]
  },
  {
    id: "sql-q21", courseId: "sql", topicId: "sql-joins",
    title: "Full Inventory Reconciliation Report",
    difficulty: "Medium", company: "Shopify", type: "code", language: "sql", estimatedMinutes: 14,
    prompt: `You're an analyst at Shopify. The inventory_system table has: product_id, product_name, stock_count (what the system says). The warehouse_count table has: product_id, actual_count, last_counted_at (what a physical count found). Write a query to reconcile them — show ALL products from both tables, with their system stock and actual count, and a discrepancy column (actual_count - stock_count). Flag as 'Match', 'Overstocked', 'Understocked', or 'Not Counted' (if no warehouse entry) or 'Discontinued' (if no inventory entry). Handle cases where products exist in only one table.`,
    hints: ["FULL OUTER JOIN returns rows from both tables even when no match", "COALESCE(i.stock_count, 0) handles NULLs on either side", "CASE WHEN to determine the flag based on which columns are NULL"],
    modelAnswer: `SELECT
  COALESCE(i.product_id, w.product_id) AS product_id,
  COALESCE(i.product_name, 'Unknown') AS product_name,
  i.stock_count,
  w.actual_count,
  w.actual_count - i.stock_count AS discrepancy,
  CASE
    WHEN i.product_id IS NULL THEN 'Discontinued'
    WHEN w.product_id IS NULL THEN 'Not Counted'
    WHEN w.actual_count = i.stock_count THEN 'Match'
    WHEN w.actual_count > i.stock_count THEN 'Overstocked'
    ELSE 'Understocked'
  END AS status
FROM inventory_system i
FULL OUTER JOIN warehouse_count w ON i.product_id = w.product_id
ORDER BY ABS(COALESCE(w.actual_count, 0) - COALESCE(i.stock_count, 0)) DESC;`,
    rubric: ["FULL OUTER JOIN used", "COALESCE for NULL product_id and name", "discrepancy calculation correct", "All 5 status cases handled", "NULLs handled in IS NULL checks order", "ORDER BY discrepancy magnitude"],
    tags: ["full-outer-join", "coalesce", "null-handling", "joins", "case-when"],
    commonMistakes: ["Using LEFT or RIGHT JOIN instead of FULL OUTER, missing products from one side", "Not ordering CASE WHEN checks (IS NULL checks must come before comparisons)"]
  },
  {
    id: "sql-q22", courseId: "sql", topicId: "sql-joins",
    title: "Employee-Manager Hierarchy Lookup",
    difficulty: "Medium", company: "LinkedIn", type: "code", language: "sql", estimatedMinutes: 12,
    prompt: `You're an analyst at LinkedIn. The employees table has: employee_id, name, title, department, manager_id (references employee_id in the same table, NULL for top-level employees), salary. Write a query to return each employee with their direct manager's name and title. Include employees who have no manager (CEO/top-level). The result should show: employee_id, employee_name, employee_title, department, salary, manager_name (NULL if none), manager_title (NULL if none).`,
    hints: ["This is a self-join: JOIN employees AS manager ON employees.manager_id = manager.employee_id", "Use LEFT JOIN so employees without a manager still appear", "Alias both instances of the table clearly"],
    modelAnswer: `SELECT
  e.employee_id,
  e.name AS employee_name,
  e.title AS employee_title,
  e.department,
  e.salary,
  m.name AS manager_name,
  m.title AS manager_title
FROM employees e
LEFT JOIN employees m ON e.manager_id = m.employee_id
ORDER BY e.department, e.salary DESC;`,
    rubric: ["Self-join on employees table", "LEFT JOIN so top-level employees appear", "Correct join condition (manager_id = employee_id)", "Table aliases used clearly", "All 7 columns returned"],
    tags: ["self-join", "left-join", "hierarchy", "joins"],
    commonMistakes: ["Using INNER JOIN which drops top-level employees with NULL manager_id", "Joining on wrong column direction (manager.manager_id instead of manager.employee_id)"]
  },
  {
    id: "sql-q23", courseId: "sql", topicId: "sql-joins",
    title: "Match Orders to Active Promotions",
    difficulty: "Medium", company: "DoorDash", type: "code", language: "sql", estimatedMinutes: 15,
    prompt: `You're on the promotions team at DoorDash. The orders table has: order_id, customer_id, restaurant_id, order_total, order_date. The promotions table has: promo_id, promo_code, discount_pct, min_order_amount, start_date, end_date, applicable_restaurant_id (NULL means applies to all restaurants). Find all orders that were eligible for at least one promotion (order was placed within promo dates, order_total >= min_order_amount, and restaurant matches or promo is global). Return: order_id, order_total, order_date, promo_id, promo_code, discount_pct. If an order matches multiple promos, show all matches.`,
    hints: ["JOIN on a range condition: o.order_date BETWEEN p.start_date AND p.end_date", "The restaurant condition needs OR: applicable_restaurant_id IS NULL OR applicable_restaurant_id = o.restaurant_id", "No aggregation needed — a many-to-many result is fine"],
    modelAnswer: `SELECT
  o.order_id,
  o.order_total,
  o.order_date,
  p.promo_id,
  p.promo_code,
  p.discount_pct
FROM orders o
JOIN promotions p
  ON o.order_date BETWEEN p.start_date AND p.end_date
  AND o.order_total >= p.min_order_amount
  AND (p.applicable_restaurant_id IS NULL OR p.applicable_restaurant_id = o.restaurant_id)
ORDER BY o.order_id, p.discount_pct DESC;`,
    rubric: ["JOIN on date range condition", "MIN_ORDER_AMOUNT threshold applied", "Restaurant NULL OR specific condition", "Many-to-many output correctly returned", "ORDER BY order_id and discount"],
    tags: ["non-equi-join", "range-join", "joins", "many-to-many"],
    commonMistakes: ["Using equi-join only and missing range conditions", "Treating NULL restaurant_id incorrectly (NULL = column never matches)"]
  },
  {
    id: "sql-q24", courseId: "sql", topicId: "sql-joins",
    title: "Explain JOIN Types and When to Use Each",
    difficulty: "Medium", company: "Meta", type: "open-ended", estimatedMinutes: 14,
    prompt: `You're in a data engineering interview at Meta. The interviewer shows you a schema with users, posts, and comments tables and asks: "Walk me through all the JOIN types in SQL and explain when you'd use each. Use this schema as context. What are the performance implications of each? When would an anti-join be appropriate here?"`,
    hints: ["Cover INNER, LEFT, RIGHT, FULL OUTER, CROSS, and self-joins", "Anti-join = LEFT JOIN + WHERE IS NULL (or NOT EXISTS)", "Think about: which rows from each table do you want in the result?"],
    modelAnswer: `## SQL JOIN Types

### INNER JOIN
Returns only rows where the join condition matches in **both** tables. Most common join type.
\`\`\`sql
-- Users who have made at least one post
SELECT u.name, p.title FROM users u INNER JOIN posts p ON u.user_id = p.user_id;
\`\`\`

### LEFT JOIN (LEFT OUTER JOIN)
Returns all rows from the **left** table, with matching rows from the right. NULL on right side if no match.
\`\`\`sql
-- All users, including those with no posts
SELECT u.name, COUNT(p.post_id) FROM users u LEFT JOIN posts p ON u.user_id = p.user_id GROUP BY u.user_id;
\`\`\`

### RIGHT JOIN
Returns all rows from the **right** table. Rarely used — can always be rewritten as LEFT JOIN by swapping table order.

### FULL OUTER JOIN
Returns all rows from **both** tables. Useful for reconciliation when you need to see unmatched rows from both sides.
\`\`\`sql
-- Find posts and comments that have no matching user (orphaned data)
SELECT * FROM posts p FULL OUTER JOIN comments c ON p.post_id = c.post_id;
\`\`\`

### CROSS JOIN
Cartesian product — every row from left paired with every row from right. N×M rows. Use for generating combinations, testing, or date spine generation.

### Anti-Join Pattern
Find rows in A with NO match in B:
\`\`\`sql
-- Users who have never commented
SELECT u.* FROM users u LEFT JOIN comments c ON u.user_id = c.user_id WHERE c.user_id IS NULL;
\`\`\`

### Performance Notes
- INNER JOIN is cheapest when indexes exist on join keys
- LEFT JOIN may be slower if it forces a full scan of the left table
- FULL OUTER JOIN is expensive — avoid on large tables
- CROSS JOIN is O(n²) — only use intentionally with small tables`,
    rubric: ["All major join types covered", "Code examples for each type", "Anti-join pattern explained", "Performance considerations mentioned", "Business context using the schema", "RIGHT JOIN note about equivalence to LEFT"],
    tags: ["joins", "inner-join", "left-join", "full-outer-join", "anti-join", "concepts"],
    commonMistakes: ["Forgetting that RIGHT JOIN = swapped LEFT JOIN", "Not explaining the NULL behavior of outer joins"]
  },
  {
    id: "sql-q25", courseId: "sql", topicId: "sql-joins",
    title: "Tag-Based Content Recommendation Join",
    difficulty: "Hard", company: "Netflix", type: "code", language: "sql", estimatedMinutes: 20,
    prompt: `You're a data engineer at Netflix. You have three tables: content (content_id, title, content_type), content_tags (content_id, tag_id), and user_tags (user_id, tag_id, weight — how much the user likes that tag, 0.0-1.0). Write a query to generate a recommendation score for each user-content pair: the score is the SUM of weights for tags that both the content and the user share. Return user_id, content_id, title, matched_tag_count, and recommendation_score, but only for user_id = 42 and only show content with at least 2 matching tags, ordered by score descending.`,
    hints: ["Join content_tags and user_tags on tag_id to find shared tags", "Then join to content on content_id for the title", "Filter WHERE user_tags.user_id = 42", "HAVING COUNT(*) >= 2 for at least 2 matching tags"],
    modelAnswer: `SELECT
  ut.user_id,
  ct.content_id,
  c.title,
  COUNT(*) AS matched_tag_count,
  SUM(ut.weight) AS recommendation_score
FROM user_tags ut
JOIN content_tags ct ON ut.tag_id = ct.tag_id
JOIN content c ON ct.content_id = c.content_id
WHERE ut.user_id = 42
GROUP BY ut.user_id, ct.content_id, c.title
HAVING COUNT(*) >= 2
ORDER BY recommendation_score DESC;`,
    rubric: ["Three-table join using tag_id bridge", "user_id filter applied early", "COUNT(*) for matched_tag_count", "SUM(weight) for recommendation_score", "HAVING for minimum tag match", "ORDER BY score DESC"],
    tags: ["many-to-many", "bridge-table", "joins", "aggregation", "recommendation"],
    commonMistakes: ["Joining on content_id instead of tag_id for the many-to-many bridge", "Using WHERE instead of HAVING for the tag count threshold"]
  },
  {
    id: "sql-q26", courseId: "sql", topicId: "sql-joins",
    title: "Attribution: First-Touch vs Last-Touch",
    difficulty: "Hard", company: "Google", type: "code", language: "sql", estimatedMinutes: 22,
    prompt: `You're on the attribution team at Google. The events table has: event_id, user_id, channel ('organic_search', 'paid_search', 'email', 'social', 'direct'), event_time. The conversions table has: conversion_id, user_id, conversion_value, converted_at. For each conversion, find both the first-touch channel (earliest event before conversion) and last-touch channel (latest event before conversion). Return: conversion_id, user_id, conversion_value, first_touch_channel, last_touch_time, last_touch_channel, last_touch_time. Only include conversions where at least one prior event exists.`,
    hints: ["Use two separate JOINs: one for first touch (MIN event_time), one for last touch (MAX event_time)", "Correlated subqueries or CTEs work well here", "The join condition must be event_time < converted_at"],
    modelAnswer: `WITH first_touch AS (
  SELECT
    c.conversion_id,
    e.channel AS first_touch_channel,
    e.event_time AS first_touch_time
  FROM conversions c
  JOIN events e ON c.user_id = e.user_id AND e.event_time < c.converted_at
  WHERE e.event_time = (
    SELECT MIN(e2.event_time) FROM events e2
    WHERE e2.user_id = c.user_id AND e2.event_time < c.converted_at
  )
),
last_touch AS (
  SELECT
    c.conversion_id,
    e.channel AS last_touch_channel,
    e.event_time AS last_touch_time
  FROM conversions c
  JOIN events e ON c.user_id = e.user_id AND e.event_time < c.converted_at
  WHERE e.event_time = (
    SELECT MAX(e2.event_time) FROM events e2
    WHERE e2.user_id = c.user_id AND e2.event_time < c.converted_at
  )
)
SELECT
  c.conversion_id,
  c.user_id,
  c.conversion_value,
  ft.first_touch_channel,
  ft.first_touch_time,
  lt.last_touch_channel,
  lt.last_touch_time
FROM conversions c
JOIN first_touch ft ON c.conversion_id = ft.conversion_id
JOIN last_touch lt ON c.conversion_id = lt.conversion_id
ORDER BY c.converted_at;`,
    rubric: ["Events joined before conversion_time only", "First touch uses MIN event_time logic", "Last touch uses MAX event_time logic", "INNER JOIN ensures at least one prior event", "All 7 output columns present", "CTEs used for clarity"],
    tags: ["attribution", "self-join", "cte", "subquery", "joins"],
    commonMistakes: ["Including events after conversion_time", "Not handling ties (multiple events at same time) — the subquery approach does handle this cleanly"]
  },

  // ═══ SQL WINDOW FUNCTIONS (8 questions) ═══
  {
    id: "sql-q27", courseId: "sql", topicId: "sql-window",
    title: "Rank Drivers by Monthly Earnings",
    difficulty: "Easy", company: "Uber", type: "code", language: "sql", estimatedMinutes: 10,
    prompt: `You're an analyst at Uber. The driver_earnings table has: driver_id, city, earnings_amount, earnings_month (date, first of each month). Write a query to rank drivers within each city by their total earnings for the most recent month, using DENSE_RANK so that tied drivers share a rank. Return: city, driver_id, total_earnings, and earnings_rank. Only include the most recent available month.`,
    hints: ["Find the most recent month with MAX(earnings_month) in a subquery or CTE", "DENSE_RANK() OVER (PARTITION BY city ORDER BY total_earnings DESC)", "DENSE_RANK vs RANK: DENSE_RANK does not skip rank numbers after ties"],
    modelAnswer: `WITH latest_month AS (
  SELECT MAX(earnings_month) AS max_month FROM driver_earnings
),
monthly_totals AS (
  SELECT driver_id, city, SUM(earnings_amount) AS total_earnings
  FROM driver_earnings, latest_month
  WHERE earnings_month = max_month
  GROUP BY driver_id, city
)
SELECT
  city,
  driver_id,
  total_earnings,
  DENSE_RANK() OVER (PARTITION BY city ORDER BY total_earnings DESC) AS earnings_rank
FROM monthly_totals
ORDER BY city, earnings_rank;`,
    rubric: ["Filter to most recent month", "SUM for total earnings", "DENSE_RANK used (not RANK)", "PARTITION BY city", "ORDER BY total_earnings DESC", "Results ordered by city and rank"],
    tags: ["dense-rank", "window-functions", "partition-by", "ranking"],
    commonMistakes: ["Using RANK() which skips numbers after ties", "Forgetting PARTITION BY and ranking globally instead of per city"]
  },
  {
    id: "sql-q28", courseId: "sql", topicId: "sql-window",
    title: "Daily Active Users Running Total",
    difficulty: "Easy", company: "Meta", type: "code", language: "sql", estimatedMinutes: 12,
    prompt: `You're a product analyst at Meta. The daily_active_users table has: activity_date, platform ('mobile', 'desktop', 'tablet'), dau_count. Write a query to show for each platform and date: the dau_count, a 7-day running total (sum of current day plus previous 6 days), and a running cumulative total since the start of data. Order by platform, activity_date.`,
    hints: ["SUM(...) OVER (PARTITION BY platform ORDER BY activity_date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) for 7-day running total", "SUM(...) OVER (PARTITION BY platform ORDER BY activity_date) for cumulative total (default frame is RANGE UNBOUNDED PRECEDING)", "ROWS BETWEEN is more predictable than RANGE BETWEEN for most use cases"],
    modelAnswer: `SELECT
  platform,
  activity_date,
  dau_count,
  SUM(dau_count) OVER (
    PARTITION BY platform
    ORDER BY activity_date
    ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
  ) AS rolling_7day_total,
  SUM(dau_count) OVER (
    PARTITION BY platform
    ORDER BY activity_date
    ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
  ) AS cumulative_total
FROM daily_active_users
ORDER BY platform, activity_date;`,
    rubric: ["PARTITION BY platform for both windows", "ROWS BETWEEN 6 PRECEDING AND CURRENT ROW for 7-day window", "ROWS BETWEEN UNBOUNDED PRECEDING for cumulative", "Correct frame specification using ROWS not RANGE", "ORDER BY in window clause", "Output ordered by platform and date"],
    tags: ["window-functions", "running-total", "sum-over", "partition-by", "rows-between"],
    commonMistakes: ["Using RANGE BETWEEN instead of ROWS BETWEEN (different behavior with ties)", "Using 7 PRECEDING instead of 6 PRECEDING for a 7-day window (would include 8 days)"]
  },
  {
    id: "sql-q29", courseId: "sql", topicId: "sql-window",
    title: "Detect Sequential Login Streak",
    difficulty: "Medium", company: "Spotify", type: "code", language: "sql", estimatedMinutes: 15,
    prompt: `You're a data analyst at Spotify. The user_logins table has: user_id, login_date (one row per login per day, deduplicated). Write a query to find each user's current consecutive day login streak. A streak is broken if a day is missing. Return: user_id and current_streak (number of consecutive days ending on the most recent login). Hint: the classic gap-and-islands approach uses ROW_NUMBER.`,
    hints: ["ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY login_date) gives each login a sequential number", "login_date - ROW_NUMBER() days creates a constant value for each consecutive group (the island key)", "Count rows per island, then find the latest island per user"],
    modelAnswer: `WITH numbered AS (
  SELECT
    user_id,
    login_date,
    ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY login_date) AS rn
  FROM user_logins
),
islands AS (
  SELECT
    user_id,
    login_date,
    login_date - (rn * INTERVAL '1 day') AS island_key
  FROM numbered
),
streak_lengths AS (
  SELECT
    user_id,
    island_key,
    COUNT(*) AS streak_length,
    MAX(login_date) AS streak_end
  FROM islands
  GROUP BY user_id, island_key
)
SELECT
  user_id,
  streak_length AS current_streak
FROM streak_lengths
WHERE (user_id, streak_end) IN (
  SELECT user_id, MAX(streak_end) FROM streak_lengths GROUP BY user_id
)
ORDER BY current_streak DESC;`,
    rubric: ["ROW_NUMBER() used to number logins", "Island key computed as date minus rn", "Islands grouped to find streak length", "Most recent island identified per user", "Correct streak_length returned"],
    tags: ["gap-and-islands", "row-number", "window-functions", "consecutive", "partition-by"],
    commonMistakes: ["Not grouping by island_key to find the streak group", "Subtracting rn as integer instead of as an interval"]
  },
  {
    id: "sql-q30", courseId: "sql", topicId: "sql-window",
    title: "Week-over-Week Ride Count Change",
    difficulty: "Medium", company: "Lyft", type: "code", language: "sql", estimatedMinutes: 15,
    prompt: `You're on the growth team at Lyft. The weekly_rides table has: week_start_date, city, total_rides. Write a query to calculate for each city and week: total_rides, prior_week_rides (previous week's total for same city), absolute_change (total_rides - prior_week_rides), and pct_change ((change / prior_week) * 100 rounded to 1 decimal, NULL if no prior week). Order by city, week_start_date.`,
    hints: ["LAG(total_rides, 1) OVER (PARTITION BY city ORDER BY week_start_date) gives previous week's value", "Handle divide-by-zero: NULLIF(prior_week_rides, 0) returns NULL if 0", "ROUND(..., 1) for percentage"],
    modelAnswer: `SELECT
  city,
  week_start_date,
  total_rides,
  LAG(total_rides, 1) OVER (PARTITION BY city ORDER BY week_start_date) AS prior_week_rides,
  total_rides - LAG(total_rides, 1) OVER (PARTITION BY city ORDER BY week_start_date) AS absolute_change,
  ROUND(
    (total_rides - LAG(total_rides, 1) OVER (PARTITION BY city ORDER BY week_start_date))
    * 100.0
    / NULLIF(LAG(total_rides, 1) OVER (PARTITION BY city ORDER BY week_start_date), 0),
    1
  ) AS pct_change
FROM weekly_rides
ORDER BY city, week_start_date;`,
    rubric: ["LAG with PARTITION BY city", "ORDER BY week_start_date in window", "Absolute change formula correct", "NULLIF to prevent division by zero", "pct_change rounded to 1 decimal", "NULL for first week per city natural from LAG"],
    tags: ["lag", "week-over-week", "window-functions", "partition-by", "pct-change"],
    commonMistakes: ["Not partitioning by city making LAG leak across cities", "Dividing by prior_week directly causing error when 0"]
  },
  {
    id: "sql-q31", courseId: "sql", topicId: "sql-window",
    title: "7-Day Moving Average of Page Load Time",
    difficulty: "Medium", company: "Google", type: "code", language: "sql", estimatedMinutes: 14,
    prompt: `You're on the performance team at Google. The page_metrics table has: metric_date, endpoint, avg_load_ms, p95_load_ms, request_count. Write a query to compute for each endpoint and date: the avg_load_ms, a 7-day moving average of avg_load_ms (weighted by request_count, i.e., weighted average over the 7-day window), and a flag 'Degraded' if the current avg_load_ms is more than 20% above the 7-day moving average, otherwise 'Normal'.`,
    hints: ["Weighted moving average: SUM(avg_load_ms * request_count) OVER window / SUM(request_count) OVER window", "Window frame: ROWS BETWEEN 6 PRECEDING AND CURRENT ROW", "CASE WHEN avg_load_ms > 1.2 * moving_avg THEN 'Degraded' — but need a CTE to use moving_avg in CASE"],
    modelAnswer: `WITH moving_avgs AS (
  SELECT
    endpoint,
    metric_date,
    avg_load_ms,
    request_count,
    SUM(avg_load_ms * request_count) OVER (
      PARTITION BY endpoint
      ORDER BY metric_date
      ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
    ) / NULLIF(SUM(request_count) OVER (
      PARTITION BY endpoint
      ORDER BY metric_date
      ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
    ), 0) AS weighted_7day_avg
  FROM page_metrics
)
SELECT
  endpoint,
  metric_date,
  avg_load_ms,
  ROUND(weighted_7day_avg, 2) AS weighted_7day_avg,
  CASE
    WHEN avg_load_ms > 1.2 * weighted_7day_avg THEN 'Degraded'
    ELSE 'Normal'
  END AS performance_status
FROM moving_avgs
ORDER BY endpoint, metric_date;`,
    rubric: ["Weighted average formula correct (sum of product / sum of weights)", "ROWS BETWEEN 6 PRECEDING AND CURRENT ROW", "PARTITION BY endpoint", "CTE used to reference moving avg in CASE", "NULLIF prevents division by zero", "Degraded threshold at 120%"],
    tags: ["moving-average", "window-functions", "weighted-average", "rows-between", "cte"],
    commonMistakes: ["Computing simple average instead of weighted average", "Trying to use window function alias in same SELECT CASE WHEN — need CTE"]
  },
  {
    id: "sql-q32", courseId: "sql", topicId: "sql-window",
    title: "Identify Top Earning Songs Per Artist",
    difficulty: "Medium", company: "Spotify", type: "code", language: "sql", estimatedMinutes: 14,
    prompt: `You're a data analyst at Spotify. The royalty_payments table has: payment_id, artist_id, track_id, track_name, royalty_amount, payment_date. For each artist, find their top 3 tracks by total royalties (all time). Return: artist_id, track_id, track_name, total_royalties, and rank_in_artist (1 = highest earner). If two tracks are tied, both should get the same rank and the next rank should be skipped (use RANK not DENSE_RANK). Return only ranks 1 through 3.`,
    hints: ["Aggregate first: GROUP BY artist_id, track_id, track_name to get total_royalties", "Then apply RANK() OVER (PARTITION BY artist_id ORDER BY total_royalties DESC)", "Use a CTE or subquery: you can't filter on a window function alias in the same WHERE clause"],
    modelAnswer: `WITH track_totals AS (
  SELECT
    artist_id,
    track_id,
    track_name,
    SUM(royalty_amount) AS total_royalties
  FROM royalty_payments
  GROUP BY artist_id, track_id, track_name
),
ranked AS (
  SELECT
    *,
    RANK() OVER (PARTITION BY artist_id ORDER BY total_royalties DESC) AS rank_in_artist
  FROM track_totals
)
SELECT artist_id, track_id, track_name, total_royalties, rank_in_artist
FROM ranked
WHERE rank_in_artist <= 3
ORDER BY artist_id, rank_in_artist;`,
    rubric: ["GROUP BY to aggregate royalties first", "RANK() (not DENSE_RANK) used", "PARTITION BY artist_id", "CTE or subquery to filter on rank", "WHERE rank_in_artist <= 3", "ORDER BY artist then rank"],
    tags: ["rank", "window-functions", "partition-by", "top-n-per-group", "cte"],
    commonMistakes: ["Filtering WHERE rank_in_artist <= 3 in the same query as the window function (not allowed)", "Using DENSE_RANK when RANK was specified"]
  },
  {
    id: "sql-q33", courseId: "sql", topicId: "sql-window",
    title: "Session Revenue with LEAD for Next-Step Funnel",
    difficulty: "Hard", company: "Airbnb", type: "code", language: "sql", estimatedMinutes: 20,
    prompt: `You're on the funnel team at Airbnb. The funnel_events table has: session_id, user_id, step_name ('search', 'view_listing', 'select_dates', 'checkout', 'book'), step_time (timestamp), revenue (only non-null for 'book' step). For each session, use LEAD to find the next step name and time after each step, and compute the time_to_next_step in minutes. Also, for each row, show the session's booking revenue using a window function (NULL if session never booked). Only return sessions that had at least a 'search' step.`,
    hints: ["LEAD(step_name, 1) OVER (PARTITION BY session_id ORDER BY step_time) for next step", "EXTRACT(EPOCH FROM (next_time - step_time))/60 for minutes between steps", "MAX(revenue) OVER (PARTITION BY session_id) carries booking revenue to all rows"],
    modelAnswer: `WITH steps AS (
  SELECT
    session_id,
    user_id,
    step_name,
    step_time,
    revenue,
    LEAD(step_name, 1) OVER (PARTITION BY session_id ORDER BY step_time) AS next_step,
    LEAD(step_time, 1) OVER (PARTITION BY session_id ORDER BY step_time) AS next_step_time,
    MAX(revenue) OVER (PARTITION BY session_id) AS session_revenue
  FROM funnel_events
)
SELECT
  session_id,
  user_id,
  step_name,
  step_time,
  next_step,
  ROUND(
    EXTRACT(EPOCH FROM (next_step_time - step_time)) / 60.0,
    1
  ) AS time_to_next_step_mins,
  session_revenue
FROM steps
WHERE session_id IN (
  SELECT DISTINCT session_id FROM funnel_events WHERE step_name = 'search'
)
ORDER BY session_id, step_time;`,
    rubric: ["LEAD for next_step name and time", "Time difference in minutes using EPOCH", "MAX(revenue) OVER for session-level revenue", "Filter sessions with search step", "All required columns returned", "PARTITION BY session_id in all windows"],
    tags: ["lead", "window-functions", "funnel-analysis", "partition-by", "lag-lead"],
    commonMistakes: ["Not using EPOCH for interval-to-minutes conversion", "Forgetting PARTITION BY causing LEAD to cross session boundaries"]
  },
  {
    id: "sql-q34", courseId: "sql", topicId: "sql-window",
    title: "Explain ROW_NUMBER vs RANK vs DENSE_RANK",
    difficulty: "Medium", company: "Amazon", type: "open-ended", estimatedMinutes: 12,
    prompt: `You're in a data analyst interview at Amazon. The interviewer gives you a sales_data table with salesperson_id, region, and monthly_sales, and asks you to explain the difference between ROW_NUMBER(), RANK(), and DENSE_RANK(). Show with a concrete example what each returns when there are tied values. When would you choose each function?`,
    hints: ["Create a small example with tied values to illustrate the difference", "ROW_NUMBER: always unique, arbitrary tiebreak", "RANK: ties share a rank, next rank skips", "DENSE_RANK: ties share a rank, next rank does NOT skip"],
    modelAnswer: `## ROW_NUMBER vs RANK vs DENSE_RANK

Given this data for the West region:
| salesperson | sales |
|------------|-------|
| Alice      | 9500  |
| Bob        | 8200  |
| Carol      | 8200  |
| Dave       | 7100  |

### ROW_NUMBER()
Assigns a **unique sequential number** to each row. Ties are broken arbitrarily (by database engine).
\`\`\`
Alice: 1, Bob: 2, Carol: 3, Dave: 4
\`\`\`
Use when you need exactly one row per rank (e.g., deduplication, selecting exactly the top-N without ties).

### RANK()
Tied rows get the **same rank**. The next rank **skips** numbers equal to the tie count.
\`\`\`
Alice: 1, Bob: 2, Carol: 2, Dave: 4  (rank 3 is skipped)
\`\`\`
Use when you want to show true position in a competition — 2nd and 3rd place tie means no one is 3rd.

### DENSE_RANK()
Tied rows get the **same rank**. The next rank does **not skip**.
\`\`\`
Alice: 1, Bob: 2, Carol: 2, Dave: 3  (no gap after tie)
\`\`\`
Use when you want to know how many distinct rank positions exist above someone — useful for "top 3 distinct positions."

## Choosing Between Them
- **ROW_NUMBER**: Deduplication, pagination, selecting exactly one row per group
- **RANK**: Leaderboards, contests where tied positions should gap the next rank
- **DENSE_RANK**: Rankings where you care about distinct tiers ("she is the 3rd-tier salesperson")`,
    rubric: ["Concrete example with tied values shown", "ROW_NUMBER unique tiebreak explained", "RANK skips after tie explained", "DENSE_RANK no-skip behavior explained", "Business use case for each", "Clear table or illustration"],
    tags: ["row-number", "rank", "dense-rank", "window-functions", "concepts"],
    commonMistakes: ["Confusing RANK and DENSE_RANK gap behavior", "Not noting that ROW_NUMBER tiebreaking is non-deterministic without ORDER BY tiebreaker"]
  },

  // ═══ SQL ADVANCED (8 questions) ═══
  {
    id: "sql-q35", courseId: "sql", topicId: "sql-advanced",
    title: "Rewrite Subquery as CTE",
    difficulty: "Medium", company: "Stripe", type: "open-ended", estimatedMinutes: 14,
    prompt: `You're reviewing a colleague's SQL at Stripe. They wrote the following deeply nested query to find high-value merchants:\n\n\`\`\`sql\nSELECT merchant_id, name, total_volume\nFROM (\n  SELECT m.merchant_id, m.name, SUM(t.amount) AS total_volume\n  FROM merchants m\n  JOIN transactions t ON m.merchant_id = t.merchant_id\n  WHERE t.created_at >= '2024-01-01'\n  AND t.status = 'completed'\n  GROUP BY m.merchant_id, m.name\n) AS agg\nWHERE total_volume > (\n  SELECT AVG(monthly_vol) FROM (\n    SELECT merchant_id, SUM(amount) AS monthly_vol\n    FROM transactions\n    WHERE created_at >= '2024-01-01' AND status = 'completed'\n    GROUP BY merchant_id\n  ) AS avg_sub\n)\nORDER BY total_volume DESC;\n\`\`\`\n\nRewrite this using CTEs to improve readability. Explain why CTEs are preferable here and discuss any performance considerations.`,
    hints: ["Each nested subquery becomes a named CTE", "CTEs can reference other CTEs defined before them", "Some databases materialize CTEs, others inline them — this affects performance"],
    modelAnswer: `## Rewritten with CTEs

\`\`\`sql
WITH merchant_volumes AS (
  SELECT
    m.merchant_id,
    m.name,
    SUM(t.amount) AS total_volume
  FROM merchants m
  JOIN transactions t ON m.merchant_id = t.merchant_id
  WHERE t.created_at >= '2024-01-01'
    AND t.status = 'completed'
  GROUP BY m.merchant_id, m.name
),
average_volume AS (
  SELECT AVG(total_volume) AS avg_vol
  FROM merchant_volumes
)
SELECT mv.merchant_id, mv.name, mv.total_volume
FROM merchant_volumes mv, average_volume
WHERE mv.total_volume > average_volume.avg_vol
ORDER BY mv.total_volume DESC;
\`\`\`

## Why CTEs Are Better Here

**Readability**: Each logical step has a name. \`merchant_volumes\` and \`average_volume\` clearly communicate intent. The original query requires reading inside-out.

**Reusability**: \`merchant_volumes\` is computed once and reused in \`average_volume\`, avoiding the duplicate subquery in the original.

**Maintainability**: Adding filters or columns to one CTE doesn't require hunting through nested levels.

**Debugging**: You can run each CTE independently during development.

## Performance Considerations
- In **PostgreSQL**, CTEs are sometimes materialized (computed once and cached) — can help if referenced multiple times, but may prevent the optimizer from pushing predicates through
- In **BigQuery** and **Snowflake**, CTEs are typically inlined (treated as subqueries) so there's no materialization overhead
- The rewritten query avoids computing the transactions aggregation twice, which the original did
- Adding indexes on (merchant_id, created_at, status) would benefit both versions`,
    rubric: ["CTE rewrite correct and equivalent", "merchant_volumes CTE defined", "average_volume CTE references first CTE", "Explains readability improvement", "Mentions reusability benefit", "Discusses database-specific materialization behavior"],
    tags: ["cte", "subqueries", "readability", "query-optimization", "advanced"],
    commonMistakes: ["Creating redundant CTEs that repeat the same logic", "Not knowing that CTE materialization is database-dependent"]
  },
  {
    id: "sql-q36", courseId: "sql", topicId: "sql-advanced",
    title: "EXISTS vs IN for Large Datasets",
    difficulty: "Medium", company: "LinkedIn", type: "code", language: "sql", estimatedMinutes: 15,
    prompt: `You're a senior analyst at LinkedIn. The job_postings table has ~50M rows: job_id, company_id, title, location, is_active. The applications table has ~200M rows: application_id, job_id, applicant_id, applied_at, status. Write two versions of a query to find all active job postings that have received at least one application in the last 30 days: one using IN with a subquery, one using EXISTS. Then explain which performs better on this scale and why.`,
    hints: ["IN: WHERE job_id IN (SELECT job_id FROM applications WHERE ...)", "EXISTS: WHERE EXISTS (SELECT 1 FROM applications WHERE job_id = job_postings.job_id AND ...)", "EXISTS short-circuits on first match; IN may need to load all matching IDs"],
    modelAnswer: `-- Version 1: Using IN
SELECT job_id, company_id, title, location
FROM job_postings
WHERE is_active = TRUE
  AND job_id IN (
    SELECT DISTINCT job_id
    FROM applications
    WHERE applied_at >= CURRENT_DATE - INTERVAL '30 days'
  );

-- Version 2: Using EXISTS (preferred at scale)
SELECT jp.job_id, jp.company_id, jp.title, jp.location
FROM job_postings jp
WHERE jp.is_active = TRUE
  AND EXISTS (
    SELECT 1
    FROM applications a
    WHERE a.job_id = jp.job_id
      AND a.applied_at >= CURRENT_DATE - INTERVAL '30 days'
  );`,
    rubric: ["Correct IN version with subquery", "Correct EXISTS version with correlated subquery", "EXISTS uses SELECT 1 (conventional)", "Filtering active jobs in both versions", "Explanation of performance difference", "Applied_at date filter in both"],
    tags: ["exists", "in", "subquery", "performance", "advanced"],
    commonMistakes: ["Forgetting the is_active filter in one version", "Not correlating the EXISTS subquery to the outer table (must reference jp.job_id)"]
  },
  {
    id: "sql-q37", courseId: "sql", topicId: "sql-advanced",
    title: "Build an Org Chart with Recursive CTE",
    difficulty: "Hard", company: "Meta", type: "code", language: "sql", estimatedMinutes: 22,
    prompt: `You're a data engineer at Meta. The employees table has: employee_id, name, title, department, manager_id (NULL for top-level). Write a recursive CTE to traverse the full reporting hierarchy starting from the CEO (where manager_id IS NULL). Return: employee_id, name, title, level (1 = CEO, 2 = direct reports, etc.), manager_id, and full_path (a string like "CEO > VP Engineering > Director > Engineer"). Order by level, then name.`,
    hints: ["Recursive CTEs have two parts: anchor (initial rows) and recursive member (joins back to the CTE)", "WITH RECURSIVE cte AS (SELECT ... UNION ALL SELECT ... FROM cte JOIN employees ...)", "For full_path: concat parent path with ' > ' and current name", "Depth/level: start at 1 for anchor, add 1 each recursion"],
    modelAnswer: `WITH RECURSIVE org_hierarchy AS (
  -- Anchor: start with CEO (no manager)
  SELECT
    employee_id,
    name,
    title,
    manager_id,
    1 AS level,
    name::TEXT AS full_path
  FROM employees
  WHERE manager_id IS NULL

  UNION ALL

  -- Recursive: add each employee's direct reports
  SELECT
    e.employee_id,
    e.name,
    e.title,
    e.manager_id,
    oh.level + 1 AS level,
    (oh.full_path || ' > ' || e.name)::TEXT AS full_path
  FROM employees e
  JOIN org_hierarchy oh ON e.manager_id = oh.employee_id
)
SELECT
  employee_id,
  name,
  title,
  level,
  manager_id,
  full_path
FROM org_hierarchy
ORDER BY level, name;`,
    rubric: ["WITH RECURSIVE syntax correct", "Anchor selects top-level (manager_id IS NULL)", "UNION ALL connects anchor and recursive part", "Level increments correctly", "full_path concatenates parent path with delimiter", "ORDER BY level then name"],
    tags: ["recursive-cte", "hierarchy", "cte", "advanced", "tree-traversal"],
    commonMistakes: ["Using UNION instead of UNION ALL in the recursive part", "Forgetting the join back to the CTE in the recursive member", "Not casting full_path to TEXT causing type issues"]
  },
  {
    id: "sql-q38", courseId: "sql", topicId: "sql-advanced",
    title: "Diagnose and Fix a Slow Dashboard Query",
    difficulty: "Hard", company: "Airbnb", type: "open-ended", estimatedMinutes: 22,
    prompt: `You're a data engineer at Airbnb. A dashboard query that used to run in 2 seconds now takes 4 minutes. The query is:\n\n\`\`\`sql\nSELECT l.city, COUNT(DISTINCT b.booking_id) AS bookings, SUM(b.total_price) AS revenue\nFROM bookings b\nJOIN listings l ON b.listing_id = l.listing_id\nWHERE DATE(b.created_at) BETWEEN '2024-01-01' AND '2024-12-31'\nGROUP BY l.city;\n\`\`\`\n\nDescribe your debugging process. What would you check with EXPLAIN/EXPLAIN ANALYZE? List at least 5 specific optimizations you'd investigate for this query. What indexes would you recommend?`,
    hints: ["Think about what EXPLAIN shows: sequential scans, index scans, hash joins, nested loops", "DATE() on a column prevents index usage — function on indexed column breaks the index", "Consider selectivity: which filter reduces rows the most?", "DISTINCT in COUNT adds overhead"],
    modelAnswer: `## Debugging Process

### Step 1: Run EXPLAIN ANALYZE
\`\`\`sql
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT l.city, COUNT(DISTINCT b.booking_id), SUM(b.total_price)
FROM bookings b JOIN listings l ON b.listing_id = l.listing_id
WHERE DATE(b.created_at) BETWEEN '2024-01-01' AND '2024-12-31'
GROUP BY l.city;
\`\`\`
Look for: **Seq Scan** (missing index), **Hash Join** vs **Index Scan**, **actual vs estimated rows** (stale stats), **BUFFERS** showing disk reads.

### 5 Optimizations to Investigate

**1. Fix the DATE() function wrapping the index column**
\`\`\`sql
-- BAD: DATE(created_at) prevents index use
WHERE DATE(b.created_at) BETWEEN '2024-01-01' AND '2024-12-31'

-- GOOD: range on the raw column uses the index
WHERE b.created_at >= '2024-01-01' AND b.created_at < '2025-01-01'
\`\`\`

**2. Add missing indexes**
\`\`\`sql
-- Most impactful: composite index on date + listing_id for the bookings table
CREATE INDEX idx_bookings_created_listing ON bookings (created_at, listing_id);
CREATE INDEX idx_listings_listing_city ON listings (listing_id, city);
\`\`\`

**3. Replace COUNT(DISTINCT booking_id) if booking_id is already unique**
If booking_id is a primary key, COUNT(DISTINCT booking_id) = COUNT(*). Remove DISTINCT.

**4. Check for stale statistics**
\`\`\`sql
ANALYZE bookings;  -- Refresh planner statistics
\`\`\`
If tables grew significantly (data growth explains the slowdown), stats may be wrong.

**5. Consider partitioning or materialized views**
If bookings is very large, partition by year/month on created_at. Or create a nightly materialized view for the dashboard so it reads pre-aggregated data.

**6. Check for implicit type casting**
Ensure listing_id types match between tables — a type mismatch forces casting on every row, preventing index use.

## Summary Priority
1. Fix DATE() wrapping (highest impact, 5-minute fix)
2. Add composite index on (created_at, listing_id)
3. Remove unnecessary DISTINCT
4. Run ANALYZE for fresh statistics`,
    rubric: ["EXPLAIN ANALYZE usage demonstrated", "DATE() index-breaking issue identified", "At least 4 concrete optimizations listed", "Index recommendations with SQL", "Stale statistics mentioned", "Materialized view or partitioning considered"],
    tags: ["query-optimization", "indexes", "explain", "performance", "advanced"],
    commonMistakes: ["Only mentioning indexes without identifying the DATE() function problem", "Not knowing EXPLAIN vs EXPLAIN ANALYZE difference (one estimates, one actually runs)"]
  },
  {
    id: "sql-q39", courseId: "sql", topicId: "sql-advanced",
    title: "Design a Star Schema for Ad Campaign Reporting",
    difficulty: "Hard", company: "Google", type: "open-ended", estimatedMinutes: 25,
    prompt: `You're joining the data warehouse team at Google Ads. The team needs a schema to support ad campaign performance reporting. The business requirements are: report campaign performance by date, geography, device type, and ad format; calculate CTR, CPC, ROAS; support daily, weekly, monthly rollups; and handle tens of billions of impressions per day. Design a star schema. Describe your fact and dimension tables, key decisions, and how you'd handle the query volume.`,
    hints: ["Star schema: one central fact table, several dimension tables joined by surrogate keys", "Fact table should be narrow (just keys + metrics), dimensions hold attributes", "Pre-aggregate to daily level in the fact table for performance", "Consider partitioning on date for the fact table"],
    modelAnswer: `## Star Schema Design for Ad Campaign Reporting

### Fact Table: fact_ad_performance (daily grain)
\`\`\`sql
CREATE TABLE fact_ad_performance (
  date_key         INT REFERENCES dim_date(date_key),
  campaign_key     INT REFERENCES dim_campaign(campaign_key),
  geo_key          INT REFERENCES dim_geography(geo_key),
  device_key       INT REFERENCES dim_device(device_key),
  ad_format_key    INT REFERENCES dim_ad_format(ad_format_key),
  -- Additive metrics
  impressions      BIGINT,
  clicks           BIGINT,
  conversions      INT,
  cost_usd         DECIMAL(18,4),
  revenue_usd      DECIMAL(18,4)
) PARTITION BY RANGE (date_key);
\`\`\`

### Dimension Tables
**dim_date**: date_key, date, year, quarter, month, week, day_of_week, is_weekend
**dim_campaign**: campaign_key, campaign_id, campaign_name, advertiser_id, advertiser_name, campaign_type, start_date, end_date (slowly changing dimension)
**dim_geography**: geo_key, country, region, city, metro_area
**dim_device**: device_key, device_type, os, browser
**dim_ad_format**: ad_format_key, format_name, format_category, is_video

### Derived Metrics (compute at query time, not stored)
\`\`\`sql
SELECT
  d.year, d.month, c.campaign_name,
  SUM(f.impressions) AS impressions,
  SUM(f.clicks) AS clicks,
  ROUND(SUM(f.clicks) * 100.0 / NULLIF(SUM(f.impressions), 0), 4) AS ctr,
  ROUND(SUM(f.cost_usd) / NULLIF(SUM(f.clicks), 0), 4) AS cpc,
  ROUND(SUM(f.revenue_usd) / NULLIF(SUM(f.cost_usd), 0), 2) AS roas
FROM fact_ad_performance f
JOIN dim_date d ON f.date_key = d.date_key
JOIN dim_campaign c ON f.campaign_key = c.campaign_key
GROUP BY d.year, d.month, c.campaign_name;
\`\`\`

### Handling Scale
- **Partition** fact table by date (monthly partitions) for pruning
- **Cluster/sort** by campaign_key within partitions for common drill-downs
- **Materialized aggregates** for common rollups (weekly, monthly) pre-computed nightly
- **Columnar storage** (BigQuery, Snowflake, Redshift) naturally handles this pattern
- **Surrogate keys** (INT) instead of natural keys for faster joins`,
    rubric: ["Fact table defined with appropriate grain (daily)", "At least 4 dimension tables described", "Derived metrics (CTR, CPC, ROAS) not stored but computed", "Partitioning strategy mentioned", "Example query shown", "Scale handling addressed"],
    tags: ["data-modeling", "star-schema", "data-warehouse", "advanced", "dimensional-modeling"],
    commonMistakes: ["Storing derived metrics like CTR in the fact table (recompute instead)", "Not partitioning the fact table (critical for billions of rows)", "Making the fact table too wide with redundant dimension attributes"]
  },
  {
    id: "sql-q40", courseId: "sql", topicId: "sql-advanced",
    title: "Multi-Step User Funnel with Conversion Windows",
    difficulty: "Hard", company: "Uber", type: "code", language: "sql", estimatedMinutes: 25,
    prompt: `You're a senior analyst at Uber. The app_events table has: event_id, user_id, event_name ('app_open', 'ride_search', 'driver_matched', 'ride_started', 'ride_completed', 'rated'), event_time (timestamp). Write a query to analyze the conversion funnel for a cohort of users who had their first app_open in the last 30 days. For each funnel step, calculate: users who reached that step (within 1 hour of their first app_open), conversion rate from the prior step, and average time from app_open to reaching that step in minutes. Steps in order: app_open → ride_search → driver_matched → ride_started → ride_completed.`,
    hints: ["CTE to find first app_open per user in the last 30 days", "JOIN each step's events with the condition event_time BETWEEN first_open AND first_open + INTERVAL '1 hour'", "COUNT DISTINCT users at each step for funnel counts", "AVG(EXTRACT(EPOCH FROM (step_time - first_open))/60) for avg minutes to step"],
    modelAnswer: `WITH cohort AS (
  SELECT user_id, MIN(event_time) AS first_open
  FROM app_events
  WHERE event_name = 'app_open'
    AND event_time >= CURRENT_DATE - INTERVAL '30 days'
  GROUP BY user_id
),
funnel AS (
  SELECT
    c.user_id,
    c.first_open,
    MAX(CASE WHEN e.event_name = 'app_open' THEN e.event_time END) AS open_time,
    MAX(CASE WHEN e.event_name = 'ride_search' THEN e.event_time END) AS search_time,
    MAX(CASE WHEN e.event_name = 'driver_matched' THEN e.event_time END) AS matched_time,
    MAX(CASE WHEN e.event_name = 'ride_started' THEN e.event_time END) AS started_time,
    MAX(CASE WHEN e.event_name = 'ride_completed' THEN e.event_time END) AS completed_time
  FROM cohort c
  JOIN app_events e
    ON c.user_id = e.user_id
    AND e.event_time BETWEEN c.first_open AND c.first_open + INTERVAL '1 hour'
  GROUP BY c.user_id, c.first_open
),
step_counts AS (
  SELECT
    COUNT(DISTINCT CASE WHEN open_time IS NOT NULL THEN user_id END) AS open_users,
    COUNT(DISTINCT CASE WHEN search_time IS NOT NULL THEN user_id END) AS search_users,
    COUNT(DISTINCT CASE WHEN matched_time IS NOT NULL THEN user_id END) AS matched_users,
    COUNT(DISTINCT CASE WHEN started_time IS NOT NULL THEN user_id END) AS started_users,
    COUNT(DISTINCT CASE WHEN completed_time IS NOT NULL THEN user_id END) AS completed_users,
    AVG(EXTRACT(EPOCH FROM (search_time - first_open))/60) AS avg_mins_to_search,
    AVG(EXTRACT(EPOCH FROM (matched_time - first_open))/60) AS avg_mins_to_matched,
    AVG(EXTRACT(EPOCH FROM (started_time - first_open))/60) AS avg_mins_to_started,
    AVG(EXTRACT(EPOCH FROM (completed_time - first_open))/60) AS avg_mins_to_completed
  FROM funnel
)
SELECT
  step, users_reached, prev_users,
  ROUND(users_reached * 100.0 / NULLIF(prev_users, 0), 1) AS conversion_rate_pct,
  avg_mins_to_step
FROM (
  VALUES
    ('app_open',       open_users,      NULL,          NULL),
    ('ride_search',    search_users,    open_users,    ROUND(avg_mins_to_search::NUMERIC, 1)),
    ('driver_matched', matched_users,   search_users,  ROUND(avg_mins_to_matched::NUMERIC, 1)),
    ('ride_started',   started_users,   matched_users, ROUND(avg_mins_to_started::NUMERIC, 1)),
    ('ride_completed', completed_users, started_users, ROUND(avg_mins_to_completed::NUMERIC, 1))
) AS s(step, users_reached, prev_users, avg_mins_to_step)
CROSS JOIN step_counts;`,
    rubric: ["Cohort defined as first app_open in 30 days", "1-hour window applied for all subsequent steps", "Funnel pivot using conditional MAX or aggregation", "Conversion rate between adjacent steps", "AVG time to each step from first_open", "NULLIF for division safety in conversion rate"],
    tags: ["funnel-analysis", "cte", "conditional-aggregation", "advanced", "cohort"],
    commonMistakes: ["Not restricting events to the 1-hour window after app_open", "Computing conversion rate from total cohort instead of from previous step", "Forgetting DISTINCT in user counts"]
  },

];
