// AGENT: curriculum-agent
// COURSE: SQL for Analytics
// STATUS: Complete — 40 questions
// REVIEWED: Pending review-agent

export const SQL_QUESTIONS = [

  // ═══ SQL BASICS (8 questions) ═══
  {
    id: "sql-q01", courseId: "sql", topicId: "sql-basics",
    title: "Filter Completed Payments",
    difficulty: "Easy", company: "Stripe", type: "code", language: "sql", estimatedMinutes: 8,
    prompt: `You're a data analyst at Stripe. The payments table has columns: payment_id, user_id, amount, status ('completed','failed','pending'), created_at. Write a query to find all completed payments over $1000 in the last 30 days, ordered by amount descending.`,
    hints: ["Use WHERE with multiple conditions joined by AND", "CURRENT_DATE - INTERVAL '30 days' for date math", "ORDER BY amount DESC"],
    modelAnswer: `SELECT payment_id, user_id, amount, created_at
FROM payments
WHERE status = 'completed'
  AND amount > 1000
  AND created_at >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY amount DESC;`,
    rubric: ["Correct WHERE clause with all 3 conditions", "Proper date arithmetic", "ORDER BY correct direction", "Selects relevant columns"],
    tags: ["filtering", "where-clause", "date-math"],
    commonMistakes: ["Using = instead of >= for dates", "Forgetting the status filter"]
  },
  {
    id: "sql-q02", courseId: "sql", topicId: "sql-basics",
    title: "Distinct Active Markets",
    difficulty: "Easy", company: "Uber", type: "code", language: "sql", estimatedMinutes: 7,
    prompt: `You're analyzing Uber's ride data. The trips table has columns: trip_id, driver_id, rider_id, city, status ('completed','cancelled','in_progress'), fare_amount, started_at. Write a query to get all distinct cities where at least one trip was completed today.`,
    hints: ["DISTINCT eliminates duplicate cities", "Use DATE(started_at) = CURRENT_DATE for today", "Filter status before applying DISTINCT"],
    modelAnswer: `SELECT DISTINCT city
FROM trips
WHERE status = 'completed'
  AND DATE(started_at) = CURRENT_DATE
ORDER BY city;`,
    rubric: ["Uses DISTINCT correctly", "Correct date filter", "Status filter present", "Clean output"],
    tags: ["distinct", "filtering", "date-functions"],
    commonMistakes: ["Forgetting DISTINCT and getting duplicates", "Using BETWEEN for today when DATE() is simpler"]
  },
  {
    id: "sql-q03", courseId: "sql", topicId: "sql-basics",
    title: "Handle Missing Host Prices",
    difficulty: "Easy", company: "Airbnb", type: "code", language: "sql", estimatedMinutes: 8,
    prompt: `You're a data analyst at Airbnb. The listings table has columns: listing_id, host_id, city, nightly_price, cleaning_fee, minimum_nights. Some hosts haven't set a cleaning_fee (NULL). Write a query that returns listing_id, city, nightly_price, and a column called effective_fee that shows the cleaning_fee if set, otherwise defaults to 25.00. Only show listings where nightly_price IS NOT NULL.`,
    hints: ["COALESCE(col, default_value) returns first non-NULL argument", "IS NOT NULL checks for non-null values", "COALESCE is cleaner than CASE WHEN for simple null defaults"],
    modelAnswer: `SELECT
  listing_id,
  city,
  nightly_price,
  COALESCE(cleaning_fee, 25.00) AS effective_fee
FROM listings
WHERE nightly_price IS NOT NULL
ORDER BY listing_id;`,
    rubric: ["Uses COALESCE correctly with 25.00 default", "IS NOT NULL filter present", "Alias effective_fee applied", "No spurious columns"],
    tags: ["null-handling", "coalesce", "is-not-null"],
    commonMistakes: ["Using = NULL instead of IS NULL", "Forgetting to alias the COALESCE column", "Using IFNULL (MySQL-only) instead of portable COALESCE"]
  },
  {
    id: "sql-q04", courseId: "sql", topicId: "sql-basics",
    title: "Categorize Watch Duration",
    difficulty: "Easy", company: "Netflix", type: "code", language: "sql", estimatedMinutes: 10,
    prompt: `You work on the engagement team at Netflix. The watch_events table has columns: event_id, user_id, content_id, watch_duration_seconds, watched_at. Write a query that returns event_id, user_id, watch_duration_seconds, and a new column engagement_tier: 'binge' if > 3600 seconds, 'normal' if between 600 and 3600 inclusive, 'bounce' if < 600.`,
    hints: ["CASE WHEN ... THEN ... WHEN ... THEN ... ELSE ... END creates conditional columns", "Order WHEN clauses from most restrictive to least, or use explicit range conditions", "The ELSE branch handles any remaining rows"],
    modelAnswer: `SELECT
  event_id,
  user_id,
  watch_duration_seconds,
  CASE
    WHEN watch_duration_seconds > 3600 THEN 'binge'
    WHEN watch_duration_seconds >= 600 THEN 'normal'
    ELSE 'bounce'
  END AS engagement_tier
FROM watch_events
ORDER BY event_id;`,
    rubric: ["CASE WHEN syntax correct", "Correct threshold values (>3600, >=600)", "ELSE covers bounce case", "Column aliased as engagement_tier"],
    tags: ["case-when", "conditional-logic", "categorization"],
    commonMistakes: ["Using >= 3600 for binge and accidentally putting 3600-second events in wrong bucket", "Missing ELSE clause leaving NULLs", "Using IF() which is not standard SQL"]
  },
  {
    id: "sql-q05", courseId: "sql", topicId: "sql-basics",
    title: "Top Tracks by Play Count",
    difficulty: "Easy", company: "Spotify", type: "code", language: "sql", estimatedMinutes: 7,
    prompt: `You're an analyst at Spotify. The track_plays table has columns: play_id, user_id, track_id, track_name, artist_name, played_at. Write a query to retrieve the top 10 most-played tracks in the last 7 days. Return track_id, track_name, artist_name, and play_count.`,
    hints: ["COUNT(*) counts all rows per group", "GROUP BY track_id, track_name, artist_name", "LIMIT 10 after ORDER BY play_count DESC"],
    modelAnswer: `SELECT
  track_id,
  track_name,
  artist_name,
  COUNT(*) AS play_count
FROM track_plays
WHERE played_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY track_id, track_name, artist_name
ORDER BY play_count DESC
LIMIT 10;`,
    rubric: ["Correct GROUP BY including all non-aggregated columns", "Date filter applied before grouping", "ORDER BY DESC", "LIMIT 10"],
    tags: ["top-n", "group-by", "count", "limit"],
    commonMistakes: ["Forgetting to include track_name and artist_name in GROUP BY", "Filtering after grouping with HAVING instead of WHERE for date range"]
  },
  {
    id: "sql-q06", courseId: "sql", topicId: "sql-basics",
    title: "Order Friends by Mutual Connections",
    difficulty: "Medium", company: "Meta", type: "code", language: "sql", estimatedMinutes: 12,
    prompt: `You're working on Meta's friend recommendation feature. The users table has columns: user_id, name, signup_date, country. Write a query to return all users who signed up in 2023, showing their user_id, name, country, and days_since_signup (calculated from signup_date to today). Sort by days_since_signup ascending. Handle users where country is NULL by displaying 'Unknown' instead.`,
    hints: ["CURRENT_DATE - signup_date gives days in PostgreSQL; DATEDIFF in MySQL", "COALESCE(country, 'Unknown') handles NULLs", "EXTRACT(YEAR FROM signup_date) = 2023 or signup_date BETWEEN '2023-01-01' AND '2023-12-31'"],
    modelAnswer: `SELECT
  user_id,
  name,
  COALESCE(country, 'Unknown') AS country,
  CURRENT_DATE - signup_date AS days_since_signup
FROM users
WHERE signup_date >= '2023-01-01'
  AND signup_date < '2024-01-01'
ORDER BY days_since_signup ASC;`,
    rubric: ["Correct year filter (avoids EXTRACT for index-friendliness)", "COALESCE applied to country", "days_since_signup calculated correctly", "ORDER BY ascending"],
    tags: ["date-arithmetic", "coalesce", "null-handling", "ordering"],
    commonMistakes: ["Using EXTRACT(YEAR...) which may prevent index usage", "Not handling NULL country", "Using DESC instead of ASC for days_since_signup"]
  },
  {
    id: "sql-q07", courseId: "sql", topicId: "sql-basics",
    title: "Find Orders with NULL Delivery Date",
    difficulty: "Easy", company: "Amazon", type: "code", language: "sql", estimatedMinutes: 6,
    prompt: `You're an analyst on Amazon's logistics team. The orders table has columns: order_id, customer_id, order_date, promised_delivery_date, actual_delivery_date, status. Some orders haven't been delivered yet (actual_delivery_date is NULL). Write a query to find all orders where delivery is overdue: promised_delivery_date is in the past AND actual_delivery_date is NULL. Return order_id, customer_id, promised_delivery_date, and days_overdue.`,
    hints: ["IS NULL tests for null values", "CURRENT_DATE - promised_delivery_date gives days overdue", "Both conditions needed: IS NULL AND date < CURRENT_DATE"],
    modelAnswer: `SELECT
  order_id,
  customer_id,
  promised_delivery_date,
  CURRENT_DATE - promised_delivery_date AS days_overdue
FROM orders
WHERE actual_delivery_date IS NULL
  AND promised_delivery_date < CURRENT_DATE
ORDER BY days_overdue DESC;`,
    rubric: ["IS NULL used correctly (not = NULL)", "Date comparison correct", "days_overdue computed", "Both conditions present with AND"],
    tags: ["is-null", "date-comparison", "overdue-logic"],
    commonMistakes: ["Writing actual_delivery_date = NULL instead of IS NULL", "Using > instead of < for past dates", "Missing the IS NULL condition entirely"]
  },
  {
    id: "sql-q08", courseId: "sql", topicId: "sql-basics",
    title: "Explain Query Readability Best Practices",
    difficulty: "Medium", company: "Google", type: "open-ended", estimatedMinutes: 15,
    prompt: `You're mentoring a junior analyst at Google who writes SQL like this:\n\nSELECT u.id,u.nm,count(*) cnt,sum(o.amt) tot FROM users u,orders o WHERE u.id=o.uid AND o.stat='C' AND o.dt>='2024-01-01' GROUP BY u.id,u.nm HAVING tot>500 ORDER BY tot DESC\n\nExplain at least 5 specific readability and correctness improvements, and rewrite the query.`,
    hints: ["Implicit joins (comma syntax) are dangerous — use explicit JOIN", "Aliases should be descriptive, not cryptic", "HAVING filters after aggregation; can reference aliases in some dialects but not standard SQL"],
    modelAnswer: `## SQL Readability Review\n\n**Problems identified:**\n\n1. **Implicit JOIN syntax** (\`FROM users u, orders o\`) — The comma-join is ANSI SQL-89 and creates a cross join if the WHERE filter is ever accidentally dropped. Use explicit \`INNER JOIN ... ON\` instead.\n\n2. **Cryptic aliases** — \`u.nm\`, \`cnt\`, \`tot\`, \`uid\`, \`stat\`, \`amt\` require the reader to mentally decode every reference. Use full names or at least clear abbreviations.\n\n3. **No indentation or line breaks** — Clauses (SELECT, FROM, WHERE, GROUP BY) should each start on a new line. Conditions in WHERE should each be on their own line.\n\n4. **HAVING references alias \`tot\`** — Standard SQL doesn't allow referencing SELECT aliases in HAVING. Some engines (MySQL, BigQuery) permit it, but it's non-portable. Use the full expression: \`HAVING SUM(o.amount) > 500\`.\n\n5. **SELECT *** or unqualified columns** — While qualified with table alias here, be explicit about column sources when joining.\n\n**Rewritten query:**\n\n\`\`\`sql\nSELECT\n  u.user_id,\n  u.name,\n  COUNT(*) AS order_count,\n  SUM(o.amount) AS total_amount\nFROM users u\nINNER JOIN orders o ON u.user_id = o.user_id\nWHERE o.status = 'completed'\n  AND o.order_date >= '2024-01-01'\nGROUP BY u.user_id, u.name\nHAVING SUM(o.amount) > 500\nORDER BY total_amount DESC;\n\`\`\``,
    rubric: ["Identifies implicit JOIN as an issue", "Mentions descriptive aliases", "Mentions formatting/indentation", "Addresses HAVING alias portability", "Provides correct rewritten query"],
    tags: ["sql-style", "readability", "best-practices", "joins"],
    commonMistakes: ["Only mentioning formatting without addressing the implicit JOIN danger", "Not rewriting the query", "Missing the HAVING alias portability issue"]
  },

  // ═══ SQL AGGREGATION (8 questions) ═══

  {
    id: "sql-q09", courseId: "sql", topicId: "sql-aggregation",
    title: "Daily Revenue Summary",
    difficulty: "Easy", company: "Stripe", type: "code", language: "sql", estimatedMinutes: 8,
    prompt: `You're on Stripe's analytics team. The charges table has columns: charge_id, merchant_id, amount, currency, status, created_at. Write a query to calculate total revenue (sum of amount) and total charge count per day for the last 30 days, for completed charges only. Return the date, total_revenue, and charge_count, sorted by date ascending.`,
    hints: ["DATE(created_at) or CAST(created_at AS DATE) extracts the date part", "SUM(amount) and COUNT(*) are your aggregation functions", "GROUP BY the date expression"],
    modelAnswer: `SELECT
  DATE(created_at) AS charge_date,
  SUM(amount) AS total_revenue,
  COUNT(*) AS charge_count
FROM charges
WHERE status = 'completed'
  AND created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY charge_date ASC;`,
    rubric: ["DATE() or equivalent used to extract date", "SUM and COUNT both present", "Status filter applied", "GROUP BY matches SELECT expression", "ORDER BY date ascending"],
    tags: ["group-by", "sum", "count", "date-truncation"],
    commonMistakes: ["Grouping by created_at (full timestamp) instead of DATE(created_at)", "Forgetting the status filter", "Using ORDER BY 1 without clarity"]
  },
  {
    id: "sql-q10", courseId: "sql", topicId: "sql-aggregation",
    title: "Driver Earnings with HAVING Filter",
    difficulty: "Easy", company: "Uber", type: "code", language: "sql", estimatedMinutes: 10,
    prompt: `You work on the driver incentives team at Uber. The trips table has columns: trip_id, driver_id, fare_amount, tip_amount, status, completed_at. Write a query to find all drivers who have completed at least 50 trips this month and earned more than $2000 in total fare. Return driver_id, trip_count, and total_fare.`,
    hints: ["WHERE filters rows before aggregation; HAVING filters after", "Use COUNT(*) for trip count, SUM(fare_amount) for total fare", "Multiple HAVING conditions are joined with AND"],
    modelAnswer: `SELECT
  driver_id,
  COUNT(*) AS trip_count,
  SUM(fare_amount) AS total_fare
FROM trips
WHERE status = 'completed'
  AND DATE_TRUNC('month', completed_at) = DATE_TRUNC('month', CURRENT_DATE)
GROUP BY driver_id
HAVING COUNT(*) >= 50
  AND SUM(fare_amount) > 2000
ORDER BY total_fare DESC;`,
    rubric: ["WHERE used for row-level filters (status, month)", "HAVING used for aggregate conditions", "Both HAVING conditions present", "COUNT and SUM correct"],
    tags: ["having", "group-by", "aggregate-filtering"],
    commonMistakes: ["Putting aggregate conditions in WHERE instead of HAVING", "Using trip_count alias in HAVING (not standard SQL)", "Off-by-one: using > 50 instead of >= 50"]
  },
  {
    id: "sql-q11", courseId: "sql", topicId: "sql-aggregation",
    title: "COUNT(*) vs COUNT(col) Behavior",
    difficulty: "Medium", company: "Airbnb", type: "open-ended", estimatedMinutes: 12,
    prompt: `An Airbnb analyst runs two queries on the reviews table and gets different counts:\n\nQuery A: SELECT COUNT(*) FROM reviews WHERE listing_id = 101;\nQuery B: SELECT COUNT(reviewer_comment) FROM reviews WHERE listing_id = 101;\n\nQuery A returns 200, Query B returns 143. Explain exactly why the counts differ, when you'd use each form, and write a query that shows total reviews, reviews with comments, and the percentage that have comments.`,
    hints: ["COUNT(*) counts all rows regardless of NULL values", "COUNT(col) skips NULL values in that column", "NULL means the reviewer left no comment"],
    modelAnswer: `## COUNT(*) vs COUNT(column)\n\n**Why the counts differ:**\n\n- \`COUNT(*)\` counts **every row** in the result set, regardless of whether any column has a NULL value. Result: 200 total reviews.\n- \`COUNT(reviewer_comment)\` counts only rows where \`reviewer_comment\` **is NOT NULL**. Result: 143 reviews that actually contain a written comment. The 57 difference means 57 reviewers submitted a star rating but left no text.\n\n**When to use each:**\n\n| Form | Use when |\n|------|----------|\n| COUNT(*) | Counting rows / total records |\n| COUNT(col) | Counting non-null occurrences of a specific attribute |\n| COUNT(DISTINCT col) | Counting unique non-null values |\n\n**Query showing the breakdown:**\n\n\`\`\`sql\nSELECT\n  COUNT(*) AS total_reviews,\n  COUNT(reviewer_comment) AS reviews_with_comments,\n  ROUND(\n    100.0 * COUNT(reviewer_comment) / COUNT(*), 1\n  ) AS pct_with_comments\nFROM reviews\nWHERE listing_id = 101;\n\`\`\``,
    rubric: ["Correctly explains COUNT(*) counts all rows", "Correctly explains COUNT(col) skips NULLs", "Identifies 57 missing comments", "Provides correct breakdown query", "Percentage calculation uses 100.0 to avoid integer division"],
    tags: ["count", "null-handling", "count-vs-count-star"],
    commonMistakes: ["Thinking COUNT(*) only counts non-NULL rows", "Integer division giving 0% in some dialects", "Not mentioning COUNT(DISTINCT col) variant"]
  },
  {
    id: "sql-q12", courseId: "sql", topicId: "sql-aggregation",
    title: "Monthly Active Users with ROLLUP",
    difficulty: "Medium", company: "Meta", type: "code", language: "sql", estimatedMinutes: 15,
    prompt: `You're analyzing user activity at Meta. The user_events table has columns: event_id, user_id, platform ('mobile','desktop','tablet'), event_type, created_at. Write a query that counts distinct users per platform per month for Q1 2024, and includes subtotals per month (across all platforms) and a grand total. Use GROUP BY ROLLUP.`,
    hints: ["GROUP BY ROLLUP(month, platform) adds subtotal rows", "DATE_TRUNC('month', created_at) groups by month", "NULL in ROLLUP output means 'all values' — use COALESCE to label them"],
    modelAnswer: `SELECT
  COALESCE(CAST(DATE_TRUNC('month', created_at) AS TEXT), 'All Months') AS month,
  COALESCE(platform, 'All Platforms') AS platform,
  COUNT(DISTINCT user_id) AS active_users
FROM user_events
WHERE created_at >= '2024-01-01'
  AND created_at < '2024-04-01'
GROUP BY ROLLUP(DATE_TRUNC('month', created_at), platform)
ORDER BY month, platform;`,
    rubric: ["DATE_TRUNC or equivalent for month grouping", "ROLLUP syntax correct", "COUNT(DISTINCT user_id) used", "COALESCE labels the NULL subtotal rows", "Date range covers Q1 2024"],
    tags: ["rollup", "group-by", "count-distinct", "subtotals"],
    commonMistakes: ["Using COUNT(*) instead of COUNT(DISTINCT user_id)", "Not handling NULL labels from ROLLUP", "Using CUBE instead of ROLLUP (CUBE generates all combinations, ROLLUP is hierarchical)"]
  },
  {
    id: "sql-q13", courseId: "sql", topicId: "sql-aggregation",
    title: "Average Order Value by Category",
    difficulty: "Easy", company: "Amazon", type: "code", language: "sql", estimatedMinutes: 8,
    prompt: `You're on the merchant analytics team at Amazon. The orders table has order_id, customer_id, product_category, order_total, order_date. Write a query to compute, for each product_category in 2024: the number of orders, the average order value (rounded to 2 decimal places), the minimum and maximum order total. Only include categories with at least 100 orders. Sort by average order value descending.`,
    hints: ["ROUND(AVG(col), 2) rounds to 2 decimal places", "HAVING COUNT(*) >= 100 filters small categories", "MIN and MAX are straightforward aggregate functions"],
    modelAnswer: `SELECT
  product_category,
  COUNT(*) AS order_count,
  ROUND(AVG(order_total), 2) AS avg_order_value,
  MIN(order_total) AS min_order,
  MAX(order_total) AS max_order
FROM orders
WHERE order_date >= '2024-01-01'
  AND order_date < '2025-01-01'
GROUP BY product_category
HAVING COUNT(*) >= 100
ORDER BY avg_order_value DESC;`,
    rubric: ["ROUND(AVG(...), 2) correct", "All four aggregates present", "HAVING filters on count", "WHERE filters year correctly", "ORDER BY avg desc"],
    tags: ["avg", "min", "max", "round", "having"],
    commonMistakes: ["Forgetting ROUND", "Using WHERE to filter on aggregate values", "Missing MIN or MAX"]
  },
  {
    id: "sql-q14", courseId: "sql", topicId: "sql-aggregation",
    title: "Playlist Length Percentiles",
    difficulty: "Hard", company: "Spotify", type: "code", language: "sql", estimatedMinutes: 18,
    prompt: `You're a data scientist at Spotify analyzing playlist engagement. The playlists table has columns: playlist_id, creator_id, track_count, total_duration_seconds, follower_count, created_at. Write a query that computes the 25th, 50th, 75th, and 95th percentiles of follower_count for playlists created in 2024 with at least 10 tracks. Also include the mean and standard deviation.`,
    hints: ["PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY col) computes exact percentile", "STDDEV_POP or STDDEV_SAMP for standard deviation", "This is a single-row aggregate — no GROUP BY needed"],
    modelAnswer: `SELECT
  PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY follower_count) AS p25,
  PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY follower_count) AS median,
  PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY follower_count) AS p75,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY follower_count) AS p95,
  ROUND(AVG(follower_count), 2) AS mean_followers,
  ROUND(STDDEV_SAMP(follower_count), 2) AS stddev_followers,
  COUNT(*) AS playlist_count
FROM playlists
WHERE created_at >= '2024-01-01'
  AND created_at < '2025-01-01'
  AND track_count >= 10;`,
    rubric: ["PERCENTILE_CONT syntax correct for all 4 percentiles", "WITHIN GROUP (ORDER BY ...) clause present", "STDDEV_SAMP or STDDEV_POP used", "WHERE filters applied correctly", "AVG and COUNT included"],
    tags: ["percentile-cont", "within-group", "stddev", "distribution-analysis"],
    commonMistakes: ["Using PERCENTILE_DISC instead of PERCENTILE_CONT (DISC returns an actual data value, CONT interpolates)", "Forgetting WITHIN GROUP syntax", "Adding unnecessary GROUP BY"]
  },
  {
    id: "sql-q15", courseId: "sql", topicId: "sql-aggregation",
    title: "Courier On-Time Rate by Zone",
    difficulty: "Medium", company: "DoorDash", type: "code", language: "sql", estimatedMinutes: 12,
    prompt: `You're analyzing delivery performance at DoorDash. The deliveries table has: delivery_id, courier_id, zone_id, promised_minutes, actual_minutes, delivered_at. A delivery is on-time if actual_minutes <= promised_minutes. Write a query that calculates, per zone_id: total deliveries, on-time deliveries, and on_time_rate (as a percentage rounded to 1 decimal place). Only show zones with more than 200 deliveries. Sort by on_time_rate ascending to find worst-performing zones.`,
    hints: ["SUM(CASE WHEN condition THEN 1 ELSE 0 END) counts conditional rows", "100.0 * SUM(...) / COUNT(*) computes a rate without integer division", "HAVING COUNT(*) > 200 filters small zones"],
    modelAnswer: `SELECT
  zone_id,
  COUNT(*) AS total_deliveries,
  SUM(CASE WHEN actual_minutes <= promised_minutes THEN 1 ELSE 0 END) AS on_time_deliveries,
  ROUND(
    100.0 * SUM(CASE WHEN actual_minutes <= promised_minutes THEN 1 ELSE 0 END) / COUNT(*),
    1
  ) AS on_time_rate
FROM deliveries
GROUP BY zone_id
HAVING COUNT(*) > 200
ORDER BY on_time_rate ASC;`,
    rubric: ["CASE WHEN inside SUM counts conditionally", "100.0 used to force float division", "ROUND to 1 decimal", "HAVING > 200", "ORDER BY ascending to find worst zones"],
    tags: ["conditional-aggregation", "case-when", "rates", "having"],
    commonMistakes: ["Integer division producing 0 or 1", "Using WHERE instead of HAVING for the 200 threshold", "Dividing before multiplying by 100"]
  },
  {
    id: "sql-q16", courseId: "sql", topicId: "sql-aggregation",
    title: "NULLs in Aggregation Explained",
    difficulty: "Medium", company: "LinkedIn", type: "open-ended", estimatedMinutes: 12,
    prompt: `A LinkedIn analyst is confused. They have a table of job applications with a salary_expectation column. Many rows have NULL salary_expectation. They notice AVG(salary_expectation) returns 85000, but when they manually sum and divide by total rows, they get 42500. Explain what's happening, how SQL handles NULLs in aggregate functions, and how to correctly compute both figures. Include a code example.`,
    hints: ["AVG ignores NULL values by default", "COUNT(*) counts all rows but COUNT(col) skips NULLs", "To include NULLs as zero, use COALESCE"],
    modelAnswer: `## NULLs in SQL Aggregation\n\n**What's happening:**\n\nSQL's \`AVG()\` function **ignores NULL values** entirely. It only considers rows where salary_expectation is not NULL. If there are 200 total applications but only 100 have a salary expectation, \`AVG(salary_expectation)\` divides the sum by 100 (non-NULL rows), returning 85000.\n\nThe analyst's manual calculation divides by 200 (all rows), getting 42500. Both are mathematically correct — they're answering different questions.\n\n**SQL aggregate behavior with NULLs:**\n\n| Function | NULL behavior |\n|----------|--------------|\n| SUM(col) | Ignores NULLs |\n| AVG(col) | Ignores NULLs (divides by non-NULL count) |\n| COUNT(col) | Ignores NULLs |\n| COUNT(*) | Counts all rows including NULLs |\n| MIN/MAX(col) | Ignores NULLs |\n\n**Code showing both calculations:**\n\n\`\`\`sql\n-- AVG ignoring NULLs (only applicants who stated a salary)\nSELECT AVG(salary_expectation) AS avg_of_stated\nFROM job_applications;\n\n-- AVG treating NULLs as 0 (penalizes non-responses)\nSELECT AVG(COALESCE(salary_expectation, 0)) AS avg_treating_null_as_zero\nFROM job_applications;\n\n-- Full breakdown\nSELECT\n  COUNT(*) AS total_apps,\n  COUNT(salary_expectation) AS apps_with_salary,\n  AVG(salary_expectation) AS avg_stated_salary,\n  AVG(COALESCE(salary_expectation, 0)) AS avg_all_rows\nFROM job_applications;\n\`\`\``,
    rubric: ["Correctly explains AVG ignores NULLs", "Shows COUNT(*) vs COUNT(col) difference", "Provides COALESCE solution", "Clear explanation of both interpretations", "Code example is correct"],
    tags: ["null-handling", "aggregation", "avg", "coalesce"],
    commonMistakes: ["Thinking AVG includes NULLs as zero", "Not mentioning COUNT(*) vs COUNT(col) distinction", "Using ISNULL instead of COALESCE"]
  },

  // ═══ SQL JOINS (8 questions) ═══

  {
    id: "sql-q17", courseId: "sql", topicId: "sql-joins",
    title: "Customer Orders with INNER JOIN",
    difficulty: "Easy", company: "Amazon", type: "code", language: "sql", estimatedMinutes: 8,
    prompt: `You're an analyst at Amazon. You have two tables:\n- customers: customer_id, name, email, signup_date\n- orders: order_id, customer_id, order_total, order_date, status\n\nWrite a query to return the name, email, and total number of orders for every customer who has placed at least one order. Sort by order count descending.`,
    hints: ["INNER JOIN only returns rows with matches in both tables", "JOIN customers ON orders.customer_id = customers.customer_id", "GROUP BY the customer columns, then COUNT orders"],
    modelAnswer: `SELECT
  c.name,
  c.email,
  COUNT(o.order_id) AS order_count
FROM customers c
INNER JOIN orders o ON c.customer_id = o.customer_id
GROUP BY c.customer_id, c.name, c.email
ORDER BY order_count DESC;`,
    rubric: ["INNER JOIN syntax correct with ON clause", "GROUP BY includes all non-aggregated columns", "COUNT on order_id (not *) is appropriate", "ORDER BY desc"],
    tags: ["inner-join", "join-basics", "group-by"],
    commonMistakes: ["Using comma join syntax instead of explicit INNER JOIN", "Not including customer_id in GROUP BY (even if not in SELECT)", "Using COUNT(*) which would behave identically here but is less precise"]
  },
  {
    id: "sql-q18", courseId: "sql", topicId: "sql-joins",
    title: "All Hosts Including Those Without Bookings",
    difficulty: "Easy", company: "Airbnb", type: "code", language: "sql", estimatedMinutes: 10,
    prompt: `You're on Airbnb's host success team. Tables:\n- hosts: host_id, name, email, joined_date\n- bookings: booking_id, host_id, listing_id, guest_id, check_in_date, total_amount\n\nWrite a query to show all hosts and their total booking revenue. Hosts with no bookings should appear with total_revenue = 0. Sort by total_revenue descending.`,
    hints: ["LEFT JOIN keeps all rows from the left (hosts) table even without matches", "SUM returns NULL if there are no rows — COALESCE(SUM(...), 0) fixes this", "Alternatively COALESCE on the SUM of the join result"],
    modelAnswer: `SELECT
  h.host_id,
  h.name,
  h.email,
  COALESCE(SUM(b.total_amount), 0) AS total_revenue
FROM hosts h
LEFT JOIN bookings b ON h.host_id = b.host_id
GROUP BY h.host_id, h.name, h.email
ORDER BY total_revenue DESC;`,
    rubric: ["LEFT JOIN used (not INNER)", "COALESCE wraps SUM to handle no-booking hosts", "GROUP BY includes all host columns", "ORDER BY revenue desc"],
    tags: ["left-join", "coalesce", "null-in-aggregation"],
    commonMistakes: ["Using INNER JOIN which would exclude hosts with no bookings", "Forgetting COALESCE so no-booking hosts show NULL instead of 0", "Using LEFT OUTER JOIN (equivalent but verbose — either is fine)"]
  },
  {
    id: "sql-q19", courseId: "sql", topicId: "sql-joins",
    title: "Employee Manager Self-Join",
    difficulty: "Medium", company: "Google", type: "code", language: "sql", estimatedMinutes: 12,
    prompt: `You're analyzing Google's org structure. The employees table has: employee_id, name, manager_id, department, salary. The manager_id references another employee_id in the same table. Write a query to return each employee's name, their manager's name (or 'No Manager' for top-level employees), and both their salaries. Include employees who have no manager.`,
    hints: ["Self-join: alias the same table twice with different aliases (e", "g", "e for employee, m for manager)", "LEFT JOIN to include employees without a manager", "COALESCE on manager name for NULL manager_id rows"],
    modelAnswer: `SELECT
  e.employee_id,
  e.name AS employee_name,
  e.salary AS employee_salary,
  COALESCE(m.name, 'No Manager') AS manager_name,
  m.salary AS manager_salary
FROM employees e
LEFT JOIN employees m ON e.manager_id = m.employee_id
ORDER BY e.department, e.name;`,
    rubric: ["Same table aliased twice (e and m)", "LEFT JOIN to include employees without managers", "COALESCE handles NULL manager", "ON clause references correct columns"],
    tags: ["self-join", "left-join", "hierarchical-data"],
    commonMistakes: ["Using INNER JOIN which drops employees without managers", "Joining on wrong columns (e.employee_id instead of e.manager_id)", "Not using COALESCE for NULL manager names"]
  },
  {
    id: "sql-q20", courseId: "sql", topicId: "sql-joins",
    title: "Find Users Who Never Ordered (Anti-Join)",
    difficulty: "Medium", company: "DoorDash", type: "code", language: "sql", estimatedMinutes: 10,
    prompt: `You're on DoorDash's re-engagement team. Tables:\n- users: user_id, name, email, signup_date\n- orders: order_id, user_id, total_amount, placed_at\n\nFind all users who signed up in the last 90 days but have NEVER placed an order. Return user_id, name, email, and signup_date. This is an anti-join pattern.`,
    hints: ["Anti-join pattern: LEFT JOIN then WHERE right_table.key IS NULL", "Alternative: NOT EXISTS subquery", "Alternative: NOT IN (be careful with NULLs in the subquery)"],
    modelAnswer: `-- Anti-join with LEFT JOIN WHERE IS NULL
SELECT
  u.user_id,
  u.name,
  u.email,
  u.signup_date
FROM users u
LEFT JOIN orders o ON u.user_id = o.user_id
WHERE o.order_id IS NULL
  AND u.signup_date >= CURRENT_DATE - INTERVAL '90 days'
ORDER BY u.signup_date DESC;`,
    rubric: ["LEFT JOIN used correctly", "WHERE IS NULL on the orders side creates anti-join", "signup_date filter present", "No spurious columns"],
    tags: ["anti-join", "left-join", "is-null", "never-done-pattern"],
    commonMistakes: ["Using NOT IN with a subquery (breaks silently if subquery returns any NULLs)", "Filtering in the ON clause vs WHERE clause (changes semantics)", "Using INNER JOIN which would return users who DID order"]
  },
  {
    id: "sql-q21", courseId: "sql", topicId: "sql-joins",
    title: "Many-to-Many: Songs on Playlists",
    difficulty: "Medium", company: "Spotify", type: "code", language: "sql", estimatedMinutes: 14,
    prompt: `You're working on Spotify's playlist analytics. You have:\n- songs: song_id, title, artist_id, duration_seconds\n- playlists: playlist_id, name, creator_id\n- playlist_songs: playlist_id, song_id, added_at (bridge table)\n\nWrite a query to find the top 10 songs that appear on the most playlists. Return song_id, title, and playlist_count.`,
    hints: ["Many-to-many requires joining through the bridge table", "JOIN songs to playlist_songs, then count distinct playlist_ids", "You don't need to join the playlists table if you only need the count"],
    modelAnswer: `SELECT
  s.song_id,
  s.title,
  COUNT(ps.playlist_id) AS playlist_count
FROM songs s
INNER JOIN playlist_songs ps ON s.song_id = ps.song_id
GROUP BY s.song_id, s.title
ORDER BY playlist_count DESC
LIMIT 10;`,
    rubric: ["Bridge table joined correctly", "COUNT on playlist_id", "GROUP BY song_id and title", "ORDER BY desc LIMIT 10"],
    tags: ["many-to-many", "bridge-table", "join", "count"],
    commonMistakes: ["Joining all three tables unnecessarily", "Using COUNT(*) which would also work but COUNT(ps.playlist_id) is more explicit", "Not including song_id in GROUP BY"]
  },
  {
    id: "sql-q22", courseId: "sql", topicId: "sql-joins",
    title: "Multi-Condition JOIN: Match Drivers to Zones",
    difficulty: "Hard", company: "Uber", type: "code", language: "sql", estimatedMinutes: 18,
    prompt: `You're building Uber's surge pricing model. Tables:\n- drivers: driver_id, current_zone_id, vehicle_type ('X','XL','Black'), is_active\n- surge_zones: zone_id, vehicle_type, surge_multiplier, effective_from, effective_until\n\nWrite a query to find all active drivers and their current surge multiplier. A driver matches a surge zone if their current_zone_id matches zone_id AND their vehicle_type matches, AND the current timestamp is between effective_from and effective_until. Drivers with no matching surge zone should show surge_multiplier = 1.0.`,
    hints: ["JOIN on multiple conditions: ON a.col1 = b.col1 AND a.col2 = b.col2 AND condition", "LEFT JOIN to include drivers with no matching zone", "COALESCE(surge_multiplier, 1.0) for non-surge drivers"],
    modelAnswer: `SELECT
  d.driver_id,
  d.current_zone_id,
  d.vehicle_type,
  COALESCE(sz.surge_multiplier, 1.0) AS surge_multiplier
FROM drivers d
LEFT JOIN surge_zones sz
  ON d.current_zone_id = sz.zone_id
  AND d.vehicle_type = sz.vehicle_type
  AND CURRENT_TIMESTAMP BETWEEN sz.effective_from AND sz.effective_until
WHERE d.is_active = TRUE
ORDER BY d.driver_id;`,
    rubric: ["Multi-condition ON clause includes all 3 conditions", "LEFT JOIN used for non-surge drivers", "COALESCE defaults surge to 1.0", "is_active filter in WHERE"],
    tags: ["multi-condition-join", "left-join", "coalesce", "between"],
    commonMistakes: ["Moving timestamp condition to WHERE (turns LEFT JOIN into INNER JOIN)", "Using INNER JOIN which drops non-surge drivers", "Missing the vehicle_type join condition"]
  },
  {
    id: "sql-q23", courseId: "sql", topicId: "sql-joins",
    title: "CROSS JOIN for Date Spine Generation",
    difficulty: "Hard", company: "Netflix", type: "code", language: "sql", estimatedMinutes: 20,
    prompt: `You're building a reporting dashboard at Netflix. You need a complete matrix showing every combination of region ('US','EU','APAC','LATAM') and content_type ('movie','series','documentary') — even combinations with no data — so charts don't have missing bars. The watch_stats table has: region, content_type, month, watch_hours. Write a query that uses CROSS JOIN to generate all 12 region/content_type combinations for January 2024, then LEFT JOINs to actual watch data, showing 0 for missing combinations.`,
    hints: ["CROSS JOIN generates every combination of two sets", "Use VALUES or a small subquery to create the reference sets", "LEFT JOIN the actual data to fill in watch_hours, defaulting to 0"],
    modelAnswer: `WITH regions AS (
  SELECT unnest(ARRAY['US','EU','APAC','LATAM']) AS region
),
content_types AS (
  SELECT unnest(ARRAY['movie','series','documentary']) AS content_type
),
combinations AS (
  SELECT r.region, ct.content_type
  FROM regions r
  CROSS JOIN content_types ct
)
SELECT
  c.region,
  c.content_type,
  COALESCE(ws.watch_hours, 0) AS watch_hours
FROM combinations c
LEFT JOIN watch_stats ws
  ON c.region = ws.region
  AND c.content_type = ws.content_type
  AND ws.month = '2024-01-01'
ORDER BY c.region, c.content_type;`,
    rubric: ["CROSS JOIN used to generate combinations", "CTE or subquery approach for the reference sets", "LEFT JOIN to actual data", "COALESCE handles missing combinations", "All 12 combinations produced"],
    tags: ["cross-join", "date-spine", "combinations", "left-join"],
    commonMistakes: ["Using INNER JOIN which drops missing combinations", "Forgetting to filter by month on the watch_stats side", "Not accounting for all combinations in the CROSS JOIN"]
  },
  {
    id: "sql-q24", courseId: "sql", topicId: "sql-joins",
    title: "Design a JOIN Strategy for Large Tables",
    difficulty: "Hard", company: "Meta", type: "open-ended", estimatedMinutes: 20,
    prompt: `At Meta, you need to join two very large tables:\n- user_events: 5 billion rows (user_id, event_type, ts, properties JSON)\n- user_profiles: 3 billion rows (user_id, country, age_bucket, signup_date)\n\nThe query runs in 45 minutes. A colleague suggests always using INNER JOIN for speed. Explain: (1) whether JOIN type affects query speed, (2) what actually makes large joins slow, and (3) at least 4 specific strategies to optimize this query.`,
    hints: ["JOIN type (INNER vs LEFT) has minimal effect on performance — the optimizer handles it", "Partition pruning, broadcast joins (for small tables), and filter pushdown matter more", "Sorting/hashing strategies depend on whether join keys are indexed/partitioned"],
    modelAnswer: `## Large-Scale JOIN Optimization\n\n### 1. Does JOIN type affect speed?\nMinimally. Modern query optimizers (Spark, Presto, BigQuery) choose join strategies based on statistics, not JOIN type. INNER JOIN may marginally reduce output rows, but the dominant cost is reading and shuffling the input data, not the join operation itself.\n\n### 2. What makes large joins slow?\n- **Data shuffling (network I/O)** — In distributed systems, joining 5B + 3B rows requires hashing or sorting both tables by join key and sending matching partitions to the same node\n- **No partition pruning** — If neither table is partitioned by user_id, the engine reads all data\n- **Skewed keys** — If some user_ids appear millions of times (bots, test accounts), one partition does 1000x the work\n- **Full column reads** — Reading the properties JSON column when you only need 2 fields\n\n### 3. Optimization strategies\n\n1. **Pre-filter before joining**\n   \`\`\`sql\n   WITH filtered_events AS (\n     SELECT user_id, event_type, ts\n     FROM user_events\n     WHERE ts >= '2024-01-01'  -- prune partitions\n       AND event_type = 'purchase'  -- reduce rows 100x\n   )\n   SELECT ...\n   FROM filtered_events fe\n   JOIN user_profiles up ON fe.user_id = up.user_id;\n   \`\`\`\n\n2. **Select only needed columns** — Avoid \`SELECT *\`; reading the JSON properties column for 5B rows wastes enormous I/O.\n\n3. **Partition/cluster on join key** — If user_events and user_profiles are both partitioned by user_id range, the engine can join each shard locally without shuffling.\n\n4. **Broadcast join for small lookup table** — If user_profiles were smaller (say, 10M rows), you could hint the engine to broadcast it:\n   In Spark SQL: \`/*+ BROADCAST(up) */\`\n\n5. **Handle skew with salting** — Add a random salt (0–9) to hot user_ids on both sides, join on (user_id, salt), then aggregate.\n\n6. **Materialize intermediate results** — Persist filtered user_events as a temp table, letting the optimizer use statistics on the smaller dataset.`,
    rubric: ["Correctly explains JOIN type has minimal performance impact", "Identifies shuffling as the main cost", "Mentions partition pruning", "Provides filter pushdown strategy", "Mentions broadcast join", "Addresses data skew"],
    tags: ["join-optimization", "large-scale-sql", "performance", "distributed-systems"],
    commonMistakes: ["Claiming INNER JOIN is always faster than LEFT JOIN", "Not mentioning data shuffling in distributed systems", "Missing partition pruning as a strategy"]
  },

  // ═══ SQL WINDOW FUNCTIONS (8 questions) ═══

  {
    id: "sql-q25", courseId: "sql", topicId: "sql-window",
    title: "Rank Drivers by Weekly Earnings",
    difficulty: "Easy", company: "Uber", type: "code", language: "sql", estimatedMinutes: 10,
    prompt: `You're building a leaderboard at Uber. The driver_earnings table has: driver_id, city, week_start_date, total_earnings. Write a query that ranks drivers within each city by their earnings for the most recent week, using DENSE_RANK so tied drivers get the same rank and the next rank has no gap. Return driver_id, city, total_earnings, and earnings_rank.`,
    hints: ["DENSE_RANK() OVER (PARTITION BY city ORDER BY total_earnings DESC)", "RANK would leave gaps after ties; DENSE_RANK does not", "Filter to the most recent week with a WHERE or subquery"],
    modelAnswer: `SELECT
  driver_id,
  city,
  total_earnings,
  DENSE_RANK() OVER (
    PARTITION BY city
    ORDER BY total_earnings DESC
  ) AS earnings_rank
FROM driver_earnings
WHERE week_start_date = (SELECT MAX(week_start_date) FROM driver_earnings)
ORDER BY city, earnings_rank;`,
    rubric: ["DENSE_RANK used (not RANK)", "PARTITION BY city correct", "ORDER BY earnings DESC", "Filtered to most recent week"],
    tags: ["dense-rank", "window-functions", "partition-by"],
    commonMistakes: ["Using RANK which leaves gaps (1,1,3 instead of 1,1,2)", "Using ROW_NUMBER which gives different ranks to tied rows", "Forgetting to filter to the current week"]
  },
  {
    id: "sql-q26", courseId: "sql", topicId: "sql-window",
    title: "Compare Each Order to Previous Order",
    difficulty: "Medium", company: "Amazon", type: "code", language: "sql", estimatedMinutes: 12,
    prompt: `You're on Amazon's customer analytics team. The orders table has: order_id, customer_id, order_total, order_date. For each order, write a query that shows the previous order total for the same customer (ordered by date), and the difference. Return customer_id, order_id, order_date, order_total, prev_order_total, and amount_change.`,
    hints: ["LAG(col, 1) OVER (PARTITION BY customer_id ORDER BY order_date) gets the previous row value", "amount_change = order_total - LAG(order_total, 1)", "First order per customer will have NULL for prev_order_total"],
    modelAnswer: `SELECT
  customer_id,
  order_id,
  order_date,
  order_total,
  LAG(order_total, 1) OVER (
    PARTITION BY customer_id
    ORDER BY order_date
  ) AS prev_order_total,
  order_total - LAG(order_total, 1) OVER (
    PARTITION BY customer_id
    ORDER BY order_date
  ) AS amount_change
FROM orders
ORDER BY customer_id, order_date;`,
    rubric: ["LAG(order_total, 1) syntax correct", "PARTITION BY customer_id", "ORDER BY order_date", "amount_change computed correctly"],
    tags: ["lag", "window-functions", "partition-by"],
    commonMistakes: ["Using LEAD instead of LAG (LEAD looks ahead)", "Not partitioning by customer_id (would compare across customers)", "Forgetting the 1 offset (defaults to 1, but explicit is better)"]
  },
  {
    id: "sql-q27", courseId: "sql", topicId: "sql-window",
    title: "Running Total of Streaming Revenue",
    difficulty: "Medium", company: "Netflix", type: "code", language: "sql", estimatedMinutes: 12,
    prompt: `You're tracking Netflix's daily subscription revenue. The daily_revenue table has: revenue_date, region, amount. Write a query to compute, for each region, the running total of revenue ordered by date. Return revenue_date, region, amount, and cumulative_revenue.`,
    hints: ["SUM(amount) OVER (PARTITION BY region ORDER BY revenue_date) computes cumulative sum", "By default ORDER BY in a window function uses ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW", "No GROUP BY needed — window functions operate on individual rows"],
    modelAnswer: `SELECT
  revenue_date,
  region,
  amount,
  SUM(amount) OVER (
    PARTITION BY region
    ORDER BY revenue_date
    ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
  ) AS cumulative_revenue
FROM daily_revenue
ORDER BY region, revenue_date;`,
    rubric: ["SUM OVER with PARTITION BY region", "ORDER BY revenue_date in the window", "ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW (explicit or implicit)", "No GROUP BY in query"],
    tags: ["running-total", "sum-over", "window-functions", "cumulative"],
    commonMistakes: ["Using GROUP BY which would collapse rows", "Missing PARTITION BY (running total across all regions)", "Using RANGE BETWEEN vs ROWS BETWEEN (RANGE can double-count ties on same date)"]
  },
  {
    id: "sql-q28", courseId: "sql", topicId: "sql-window",
    title: "7-Day Moving Average for App Metrics",
    difficulty: "Medium", company: "Meta", type: "code", language: "sql", estimatedMinutes: 15,
    prompt: `You're analyzing daily active users on Meta's apps. The dau_metrics table has: metric_date, platform, dau_count. Write a query that computes the 7-day moving average of dau_count for each platform, considering the current day and the 6 preceding days. Return metric_date, platform, dau_count, and moving_avg_7d rounded to 0 decimal places.`,
    hints: ["ROWS BETWEEN 6 PRECEDING AND CURRENT ROW defines the 7-row window", "AVG(col) OVER (PARTITION BY platform ORDER BY metric_date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW)", "ROUND(..., 0) rounds to nearest integer"],
    modelAnswer: `SELECT
  metric_date,
  platform,
  dau_count,
  ROUND(
    AVG(dau_count) OVER (
      PARTITION BY platform
      ORDER BY metric_date
      ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
    ), 0
  ) AS moving_avg_7d
FROM dau_metrics
ORDER BY platform, metric_date;`,
    rubric: ["ROWS BETWEEN 6 PRECEDING AND CURRENT ROW for 7-day window", "AVG inside the window function", "PARTITION BY platform", "ROUND to 0 decimals"],
    tags: ["moving-average", "rows-between", "window-functions"],
    commonMistakes: ["Using RANGE BETWEEN (can behave unexpectedly with duplicate dates)", "Using 7 PRECEDING (that's 8 days total)", "Forgetting PARTITION BY platform (averages across platforms)"]
  },
  {
    id: "sql-q29", courseId: "sql", topicId: "sql-window",
    title: "Assign Quartiles to Trips with NTILE",
    difficulty: "Medium", company: "DoorDash", type: "code", language: "sql", estimatedMinutes: 12,
    prompt: `You're segmenting DoorDash couriers into performance quartiles based on their weekly delivery count. The weekly_stats table has: courier_id, week_start, delivery_count. For the most recent week, assign each courier to a quartile (1=bottom 25%, 4=top 25%) based on delivery_count. Return courier_id, delivery_count, and performance_quartile.`,
    hints: ["NTILE(4) OVER (ORDER BY delivery_count ASC) divides into 4 buckets", "Lower delivery count = lower quartile number", "Filter to most recent week using a subquery"],
    modelAnswer: `SELECT
  courier_id,
  delivery_count,
  NTILE(4) OVER (ORDER BY delivery_count ASC) AS performance_quartile
FROM weekly_stats
WHERE week_start = (SELECT MAX(week_start) FROM weekly_stats)
ORDER BY performance_quartile, delivery_count;`,
    rubric: ["NTILE(4) with ASC order for lowest=quartile 1", "Filtered to most recent week", "OVER clause has no PARTITION BY (ranking all couriers together)", "Correct column aliasing"],
    tags: ["ntile", "quartiles", "window-functions"],
    commonMistakes: ["Using DESC order which inverts quartile meaning", "Adding unnecessary PARTITION BY", "Using 4 in NTILE and then subtracting from 5 to flip order (over-engineering)"]
  },
  {
    id: "sql-q30", courseId: "sql", topicId: "sql-window",
    title: "Find Each User's First and Last Purchase",
    difficulty: "Medium", company: "Stripe", type: "code", language: "sql", estimatedMinutes: 15,
    prompt: `You're on Stripe's customer lifecycle team. The transactions table has: transaction_id, customer_id, amount, created_at. Use window functions to return each transaction along with: first_purchase_date, last_purchase_date, and is_first_purchase (TRUE/FALSE) for each row. Do not use subqueries — use only window functions.`,
    hints: ["FIRST_VALUE(created_at) OVER (PARTITION BY customer_id ORDER BY created_at) gives the first date", "LAST_VALUE with ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING is needed to see the last row", "ROW_NUMBER() = 1 identifies the first purchase"],
    modelAnswer: `SELECT
  transaction_id,
  customer_id,
  amount,
  created_at,
  FIRST_VALUE(created_at) OVER (
    PARTITION BY customer_id
    ORDER BY created_at
  ) AS first_purchase_date,
  LAST_VALUE(created_at) OVER (
    PARTITION BY customer_id
    ORDER BY created_at
    ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
  ) AS last_purchase_date,
  CASE WHEN ROW_NUMBER() OVER (
    PARTITION BY customer_id ORDER BY created_at
  ) = 1 THEN TRUE ELSE FALSE END AS is_first_purchase
FROM transactions
ORDER BY customer_id, created_at;`,
    rubric: ["FIRST_VALUE used correctly", "LAST_VALUE with ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING", "ROW_NUMBER = 1 check for is_first_purchase", "All PARTITION BY customer_id"],
    tags: ["first-value", "last-value", "row-number", "window-functions"],
    commonMistakes: ["LAST_VALUE without ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING returns current row due to default frame", "Using MIN/MAX in a subquery instead of window functions as asked", "Forgetting PARTITION BY customer_id"]
  },
  {
    id: "sql-q31", courseId: "sql", topicId: "sql-window",
    title: "Deduplicate with ROW_NUMBER",
    difficulty: "Hard", company: "LinkedIn", type: "code", language: "sql", estimatedMinutes: 18,
    prompt: `LinkedIn's application_events table has duplicate rows due to a pipeline bug. The table has: event_id, user_id, job_id, event_type, created_at. For each (user_id, job_id, event_type) combination, keep only the most recent event (by created_at). Write a query using ROW_NUMBER to identify and remove duplicates, returning only the latest record per combination.`,
    hints: ["ROW_NUMBER() OVER (PARTITION BY user_id, job_id, event_type ORDER BY created_at DESC) = 1 keeps the latest", "Wrap in a CTE or subquery, then filter WHERE rn = 1", "This is the canonical deduplication pattern in SQL"],
    modelAnswer: `WITH ranked_events AS (
  SELECT
    event_id,
    user_id,
    job_id,
    event_type,
    created_at,
    ROW_NUMBER() OVER (
      PARTITION BY user_id, job_id, event_type
      ORDER BY created_at DESC
    ) AS rn
  FROM application_events
)
SELECT
  event_id,
  user_id,
  job_id,
  event_type,
  created_at
FROM ranked_events
WHERE rn = 1
ORDER BY user_id, job_id;`,
    rubric: ["ROW_NUMBER PARTITION BY all three columns", "ORDER BY created_at DESC for latest", "Filter rn = 1", "CTE or subquery approach", "Removes rn from final SELECT"],
    tags: ["row-number", "deduplication", "cte", "window-functions"],
    commonMistakes: ["Partitioning by only one column (misses partial duplicates)", "Using ORDER BY ASC (keeps oldest, not latest)", "Not filtering rn = 1 in a subquery/CTE (window functions can't be in WHERE directly)"]
  },
  {
    id: "sql-q32", courseId: "sql", topicId: "sql-window",
    title: "RANK vs DENSE_RANK vs ROW_NUMBER Explained",
    difficulty: "Medium", company: "Google", type: "open-ended", estimatedMinutes: 15,
    prompt: `You're onboarding a new analyst at Google who asks: 'I have a scores table and I want to rank students. I tried RANK, DENSE_RANK, and ROW_NUMBER and got different results for tied scores. Can you explain exactly how each one works and when to use each?'\n\nGive concrete examples with the scores [100, 95, 95, 90, 85] and explain the business context for each function.`,
    hints: ["Show the output of all three functions on the same dataset", "RANK leaves gaps; DENSE_RANK doesn't; ROW_NUMBER is always unique", "Use cases: RANK for sports standings, DENSE_RANK for percentiles, ROW_NUMBER for deduplication"],
    modelAnswer: `## RANK vs DENSE_RANK vs ROW_NUMBER\n\nGiven scores: 100, 95, 95, 90, 85 (two students tied at 95):

| student | score | ROW_NUMBER | RANK | DENSE_RANK |
|---------|-------|------------|------|------------|
| Alice   | 100   | 1          | 1    | 1          |
| Bob     | 95    | 2          | 2    | 2          |
| Carol   | 95    | 3          | 2    | 2          |
| Dave    | 90    | 4          | 4    | 3          |
| Eve     | 85    | 5          | 5    | 4          |

**ROW_NUMBER:** Always assigns a unique sequential number regardless of ties. The assignment is arbitrary among tied rows (depends on row order). Use for: deduplication (WHERE rn = 1), pagination, picking exactly one row per group.

**RANK:** Tied rows get the same rank, and the next rank **skips** numbers (Bob and Carol are both rank 2; Dave gets rank 4, not 3). The number of ranks equals position if all rows were unique. Use for: sports standings (Olympic medals — two silvers, no bronze), competitive rankings where you want gaps to reflect the true positional gap.

**DENSE_RANK:** Tied rows get the same rank, but ranks are **consecutive** (no gaps). Dave gets rank 3, not 4. Use for: percentile buckets, tier assignment (Platinum/Gold/Silver/Bronze), anywhere ties should share a tier and the next tier is immediately adjacent.

\`\`\`sql
SELECT
  student_name,
  score,
  ROW_NUMBER() OVER (ORDER BY score DESC) AS row_num,
  RANK()       OVER (ORDER BY score DESC) AS rank_val,
  DENSE_RANK() OVER (ORDER BY score DESC) AS dense_rank_val
FROM students;
\`\`\``,
    rubric: ["Correct output table showing all three functions", "Explains RANK creates gaps after ties", "Explains DENSE_RANK has no gaps", "Explains ROW_NUMBER is always unique (arbitrary for ties)", "Provides appropriate use case for each"],
    tags: ["rank", "dense-rank", "row-number", "window-functions", "comparison"],
    commonMistakes: ["Confusing RANK and DENSE_RANK behavior", "Thinking ROW_NUMBER is deterministic for ties (it depends on the ORDER BY)", "Not providing concrete examples with tied values"]
  },

  // ═══ SQL ADVANCED (8 questions) ═══

  {
    id: "sql-q33", courseId: "sql", topicId: "sql-advanced",
    title: "CTE for Multi-Step User Funnel",
    difficulty: "Medium", company: "Airbnb", type: "code", language: "sql", estimatedMinutes: 18,
    prompt: `You're analyzing Airbnb's booking funnel. The events table has: user_id, event_type ('search','view_listing','start_booking','confirm_booking'), event_timestamp. Use a CTE chain to calculate: (1) users who searched, (2) of those, who viewed a listing, (3) of those, who started a booking, (4) of those, who confirmed. Return each funnel step with user_count and the conversion rate from the previous step.`,
    hints: ["Each CTE filters users who completed that step", "Use DISTINCT user_id counts at each step", "The final query JOINs or UNION ALL the step counts", "Conversion = step_n / step_(n-1) * 100"],
    modelAnswer: `WITH searched AS (
  SELECT DISTINCT user_id FROM events WHERE event_type = 'search'
),
viewed AS (
  SELECT DISTINCT user_id FROM events WHERE event_type = 'view_listing'
    AND user_id IN (SELECT user_id FROM searched)
),
started AS (
  SELECT DISTINCT user_id FROM events WHERE event_type = 'start_booking'
    AND user_id IN (SELECT user_id FROM viewed)
),
confirmed AS (
  SELECT DISTINCT user_id FROM events WHERE event_type = 'confirm_booking'
    AND user_id IN (SELECT user_id FROM started)
),
funnel AS (
  SELECT 1 AS step, 'search' AS step_name, COUNT(*) AS users FROM searched
  UNION ALL
  SELECT 2, 'view_listing', COUNT(*) FROM viewed
  UNION ALL
  SELECT 3, 'start_booking', COUNT(*) FROM started
  UNION ALL
  SELECT 4, 'confirm_booking', COUNT(*) FROM confirmed
)
SELECT
  step,
  step_name,
  users,
  LAG(users) OVER (ORDER BY step) AS prev_step_users,
  ROUND(100.0 * users / NULLIF(LAG(users) OVER (ORDER BY step), 0), 1) AS conversion_rate
FROM funnel
ORDER BY step;`,
    rubric: ["Multiple CTEs chained correctly", "DISTINCT user_id counts", "UNION ALL for funnel table", "LAG for previous step users", "NULLIF prevents division by zero"],
    tags: ["cte", "funnel-analysis", "with-clause", "conversion-rate"],
    commonMistakes: ["Not using DISTINCT — counting events instead of unique users", "Division by zero for first step", "Not filtering each step to previous step's users"]
  },
  {
    id: "sql-q34", courseId: "sql", topicId: "sql-advanced",
    title: "Correlated Subquery: Flag Above-Average Orders",
    difficulty: "Medium", company: "Amazon", type: "code", language: "sql", estimatedMinutes: 15,
    prompt: `You're at Amazon. The orders table has: order_id, customer_id, product_category, order_total, order_date. Write a query using a correlated subquery to return all orders where the order_total is above the average order_total for that customer's country. You have a customers table with customer_id and country.`,
    hints: ["A correlated subquery references the outer query's table", "For each order row, compute AVG(order_total) for all customers in that country", "JOIN customers in the outer query to get country, then correlate on country"],
    modelAnswer: `SELECT
  o.order_id,
  o.customer_id,
  c.country,
  o.product_category,
  o.order_total
FROM orders o
INNER JOIN customers c ON o.customer_id = c.customer_id
WHERE o.order_total > (
  SELECT AVG(o2.order_total)
  FROM orders o2
  INNER JOIN customers c2 ON o2.customer_id = c2.customer_id
  WHERE c2.country = c.country
)
ORDER BY c.country, o.order_total DESC;`,
    rubric: ["Correlated subquery references outer query's c.country", "Subquery computes AVG per country", "WHERE uses > for above-average comparison", "Correct table aliases prevent ambiguity"],
    tags: ["correlated-subquery", "avg-per-group", "subquery"],
    commonMistakes: ["Writing an uncorrelated subquery that computes global average", "Referencing wrong alias in subquery", "Using >= instead of > (includes exactly-average orders)"]
  },
  {
    id: "sql-q35", courseId: "sql", topicId: "sql-advanced",
    title: "EXISTS vs IN: Find Active Customers",
    difficulty: "Medium", company: "Stripe", type: "open-ended", estimatedMinutes: 15,
    prompt: `A Stripe analyst needs to find customers who have at least one successful charge in 2024. They write:\n\nVersion A: WHERE customer_id IN (SELECT customer_id FROM charges WHERE status='succeeded' AND YEAR(created_at)=2024)\n\nVersion B: WHERE EXISTS (SELECT 1 FROM charges c WHERE c.customer_id = customers.customer_id AND c.status='succeeded' AND YEAR(c.created_at)=2024)\n\nExplain: (1) the semantic difference, (2) which performs better and why, (3) when NOT IN can silently return wrong results, and (4) the preferred modern pattern.`,
    hints: ["EXISTS stops as soon as it finds one match (short-circuits)", "IN materializes the full subquery result set", "NOT IN with NULLs in the subquery returns no rows — a silent bug"],
    modelAnswer: `## EXISTS vs IN\n\n### 1. Semantic difference\n- **IN**: Executes the subquery once, builds a set of customer_ids, then checks if each outer customer_id is in that set. Conceptually like a set membership test.\n- **EXISTS**: For each outer row, executes the subquery with the outer row's values and checks if any row is returned. Stops at first match (short-circuit evaluation).\n\nBoth return the same results here, but their execution models differ.\n\n### 2. Performance\n**EXISTS is typically faster** when:\n- The subquery would return many rows (EXISTS short-circuits after the first match)\n- There's an index on charges.customer_id\n\n**IN may be faster** when:\n- The subquery result is small and cacheable\n- The optimizer rewrites both to a semi-join anyway (modern optimizers often do)\n\nIn practice, Postgres, SQL Server, and BigQuery often produce identical plans for both.\n\n### 3. NOT IN silent NULL bug\nIf \`charges.customer_id\` has any NULL values, \`NOT IN (SELECT customer_id FROM charges ...)\` returns **zero rows** — not the rows you expect. This is because \`x NOT IN (1, 2, NULL)\` evaluates to UNKNOWN (not TRUE) for any x, due to three-valued logic.\n\n\`\`\`sql\n-- This can silently return no results if any customer_id is NULL in subquery\nWHERE customer_id NOT IN (SELECT customer_id FROM charges WHERE ...)\n\n-- Safe alternative:\nWHERE NOT EXISTS (SELECT 1 FROM charges c WHERE c.customer_id = customers.customer_id AND ...)\n\`\`\`\n\n### 4. Preferred modern pattern\nUse **NOT EXISTS** for negation (avoids NULL trap). Use **EXISTS** or a semi-join for positive checks. Many engineers prefer LEFT JOIN + IS NULL (anti-join) for readability.`,
    rubric: ["Correctly explains EXISTS short-circuits", "Explains IN materializes full result set", "Identifies NOT IN NULL silent bug", "Recommends NOT EXISTS for safety", "Discusses optimizer rewriting"],
    tags: ["exists", "not-exists", "in", "not-in", "null-trap", "subquery"],
    commonMistakes: ["Claiming IN is always slower", "Not mentioning the NOT IN NULL bug", "Thinking EXISTS and IN always produce different results"]
  },
  {
    id: "sql-q36", courseId: "sql", topicId: "sql-advanced",
    title: "Recursive CTE: Organizational Hierarchy",
    difficulty: "Hard", company: "LinkedIn", type: "code", language: "sql", estimatedMinutes: 22,
    prompt: `You're building LinkedIn's org chart tool. The employees table has: employee_id, name, manager_id, level, department. Write a recursive CTE to find all direct and indirect reports under a specific VP (employee_id = 42). Return employee_id, name, depth (1 = direct report, 2 = reports of reports, etc.), and the full reporting path as a string like 'VP > Manager > Employee'.`,
    hints: ["Recursive CTE: anchor member selects the root, recursive member JOINs to children", "WITH RECURSIVE cte AS (anchor UNION ALL recursive member)", "Track depth with depth + 1", "Build path string with CONCAT(path, ' > ', name)"],
    modelAnswer: `WITH RECURSIVE org_tree AS (
  -- Anchor: direct reports of VP 42
  SELECT
    employee_id,
    name,
    manager_id,
    1 AS depth,
    CAST(name AS TEXT) AS path
  FROM employees
  WHERE manager_id = 42

  UNION ALL

  -- Recursive: reports of reports
  SELECT
    e.employee_id,
    e.name,
    e.manager_id,
    ot.depth + 1,
    ot.path || ' > ' || e.name
  FROM employees e
  INNER JOIN org_tree ot ON e.manager_id = ot.employee_id
)
SELECT
  employee_id,
  name,
  depth,
  path
FROM org_tree
ORDER BY depth, name;`,
    rubric: ["WITH RECURSIVE syntax correct", "Anchor selects direct reports of manager_id = 42", "Recursive joins employees to CTE on manager_id = employee_id", "depth + 1 incremented", "Path concatenation builds trail"],
    tags: ["recursive-cte", "hierarchical-data", "with-recursive"],
    commonMistakes: ["Forgetting RECURSIVE keyword (required in PostgreSQL)", "Anchor selecting the VP themselves instead of their reports", "Infinite loop from circular manager relationships (add depth < 10 guard)"]
  },
  {
    id: "sql-q37", courseId: "sql", topicId: "sql-advanced",
    title: "Query Optimization with EXPLAIN",
    difficulty: "Hard", company: "Google", type: "open-ended", estimatedMinutes: 20,
    prompt: `A Google engineer shares this slow query (runs in 8 seconds on a 500M row events table):\n\nSELECT user_id, COUNT(*) as cnt\nFROM events\nWHERE DATE(event_timestamp) = '2024-03-15'\n AND event_type = 'click'\nGROUP BY user_id\nHAVING cnt > 5;\n\nThe EXPLAIN output shows a full table scan. Walk through: (1) why DATE() on a column prevents index usage, (2) what the EXPLAIN output likely shows, (3) at least 3 specific fixes, and (4) how to verify improvement.`,
    hints: ["Function wrapping a column (DATE(col)) prevents the optimizer from using an index on that column", "Range condition col >= x AND col < y IS sargable (index-usable)", "EXPLAIN ANALYZE shows actual rows vs estimated rows"],
    modelAnswer: `## Query Optimization Analysis\n\n### 1. Why DATE(event_timestamp) prevents index use\n\nThis is a **non-sargable predicate**. When you wrap a column in a function (\`DATE(event_timestamp)\`), the database cannot use a B-tree index on \`event_timestamp\` because it would need to evaluate the function for every row to determine which ones match. The index stores raw timestamp values, not pre-computed dates.\n\n### 2. What EXPLAIN likely shows\n\n\`\`\`\nSeq Scan on events  (cost=0.00..98000.00 rows=500000000)\n  Filter: ((date(event_timestamp) = '2024-03-15') AND (event_type = 'click'))\n\`\`\`\n\nKey warning signs: "Seq Scan" (full scan), high cost, no "Index Scan" node.\n\n### 3. Fixes\n\n**Fix 1: Rewrite date filter as a sargable range**\n\`\`\`sql\nWHERE event_timestamp >= '2024-03-15 00:00:00'\n  AND event_timestamp < '2024-03-16 00:00:00'\n\`\`\`\nNow the optimizer can use an index on event_timestamp.\n\n**Fix 2: Composite index on (event_type, event_timestamp)**\n\`\`\`sql\nCREATE INDEX idx_events_type_ts\nON events (event_type, event_timestamp);\n\`\`\`\nThis index supports both the event_type equality filter and the timestamp range in one scan.\n\n**Fix 3: Rewrite HAVING with a CTE filter**\nFor very large aggregations, pre-filter with a CTE to reduce rows before grouping:\n\`\`\`sql\nWITH filtered AS (\n  SELECT user_id\n  FROM events\n  WHERE event_timestamp >= '2024-03-15'\n    AND event_timestamp < '2024-03-16'\n    AND event_type = 'click'\n)\nSELECT user_id, COUNT(*) AS cnt\nFROM filtered\nGROUP BY user_id\nHAVING COUNT(*) > 5;\n\`\`\`\n\n**Fix 4: Table partitioning** by day on event_timestamp enables partition pruning — only the March 15 partition is scanned.\n\n### 4. Verify improvement\n\n\`\`\`sql\nEXPLAIN ANALYZE\nSELECT user_id, COUNT(*) AS cnt\nFROM events\nWHERE event_timestamp >= '2024-03-15'\n  AND event_timestamp < '2024-03-16'\n  AND event_type = 'click'\nGROUP BY user_id\nHAVING COUNT(*) > 5;\n\`\`\`\n\nLook for "Index Scan" or "Index Only Scan" replacing "Seq Scan", and actual time dropping from 8s to under 500ms.`,
    rubric: ["Explains non-sargable predicate concept", "Shows EXPLAIN plan characteristics", "Provides range condition rewrite", "Recommends appropriate index", "Mentions EXPLAIN ANALYZE for verification"],
    tags: ["query-optimization", "explain", "indexes", "sargable", "performance"],
    commonMistakes: ["Thinking adding any index fixes the query (must fix the predicate too)", "Not explaining WHY functions prevent index usage", "Missing EXPLAIN ANALYZE (vs plain EXPLAIN which shows estimates only)"]
  },
  {
    id: "sql-q38", courseId: "sql", topicId: "sql-advanced",
    title: "PIVOT Song Genre Counts by Month",
    difficulty: "Hard", company: "Spotify", type: "code", language: "sql", estimatedMinutes: 20,
    prompt: `You're building a reporting table at Spotify. The song_plays table has: play_id, user_id, genre ('pop','rock','hip-hop'), played_at. Write a query that pivots the data: each row is a month (Jan-Jun 2024), each column is a genre, and the value is the play count. Use conditional aggregation (CASE WHEN) since standard SQL PIVOT syntax varies by database.`,
    hints: ["SUM(CASE WHEN genre = 'pop' THEN 1 ELSE 0 END) creates a pop column", "DATE_TRUNC('month', played_at) groups by month", "Repeat CASE WHEN for each genre", "CROSSTAB in PostgreSQL or PIVOT in SQL Server are alternatives"],
    modelAnswer: `SELECT
  DATE_TRUNC('month', played_at) AS month,
  SUM(CASE WHEN genre = 'pop'     THEN 1 ELSE 0 END) AS pop_plays,
  SUM(CASE WHEN genre = 'rock'    THEN 1 ELSE 0 END) AS rock_plays,
  SUM(CASE WHEN genre = 'hip-hop' THEN 1 ELSE 0 END) AS hiphop_plays
FROM song_plays
WHERE played_at >= '2024-01-01'
  AND played_at < '2024-07-01'
GROUP BY DATE_TRUNC('month', played_at)
ORDER BY month;`,
    rubric: ["DATE_TRUNC for month grouping", "CASE WHEN for each genre column", "SUM not COUNT for the conditional aggregation", "Date range filter for H1 2024", "GROUP BY the date expression"],
    tags: ["pivot", "conditional-aggregation", "case-when", "crosstab"],
    commonMistakes: ["Using COUNT with CASE WHEN (works but SUM is cleaner)", "Not filtering the date range", "Forgetting to GROUP BY the month expression"]
  },
  {
    id: "sql-q39", courseId: "sql", topicId: "sql-advanced",
    title: "Index Strategy for Analytics Queries",
    difficulty: "Hard", company: "Meta", type: "open-ended", estimatedMinutes: 20,
    prompt: `You're a senior analyst at Meta consulting on database performance. A team has a user_actions table (1 billion rows) with columns: action_id, user_id, action_type, country, created_at, metadata (JSON). They run these three query patterns frequently:\n\n1. WHERE user_id = ? AND action_type = ? (point lookups)\n2. WHERE country = ? AND created_at >= ? (regional time-range scans)\n3. WHERE created_at >= ? GROUP BY action_type (daily summaries)\n\nRecommend specific indexes for each pattern, explain the tradeoffs, and discuss when indexes hurt performance.`,
    hints: ["Composite indexes should match the column order of your filters", "High-cardinality columns (user_id) should come first in composite indexes", "Covering indexes include all queried columns to avoid heap fetches", "Indexes slow down writes — weigh read/write ratio"],
    modelAnswer: `## Index Strategy for user_actions\n\n### Pattern 1: Point lookups \`WHERE user_id = ? AND action_type = ?\`\n\n**Recommended index:**\n\`\`\`sql\nCREATE INDEX idx_user_action_type\nON user_actions (user_id, action_type);\n\`\`\`\n**Why:** Both columns used in equality filters. user_id should come first — it has higher cardinality (more unique values), so it prunes rows more aggressively. If the query only selects action_id and created_at, a **covering index** eliminates heap lookups:\n\`\`\`sql\nCREATE INDEX idx_user_action_covering\nON user_actions (user_id, action_type) INCLUDE (action_id, created_at);\n\`\`\`\n\n### Pattern 2: Regional time-range \`WHERE country = ? AND created_at >= ?\`\n\n**Recommended index:**\n\`\`\`sql\nCREATE INDEX idx_country_created\nON user_actions (country, created_at DESC);\n\`\`\`\n**Why:** country equality filter first (prefix match), then created_at range scan. DESC helps if queries frequently want most recent rows first.\n\n**Alternative: Partitioning** — Partition the table by country or by created_at month. This enables partition pruning, which outperforms indexes at very large scale.\n\n### Pattern 3: Daily summaries \`WHERE created_at >= ? GROUP BY action_type\`\n\n**Recommended index:**\n\`\`\`sql\nCREATE INDEX idx_created_at ON user_actions (created_at);\n\`\`\`\nFor aggregations, this index lets the engine use range scan + heap access. If the query only reads action_type and created_at:\n\`\`\`sql\nCREATE INDEX idx_created_action_type ON user_actions (created_at, action_type);\n\`\`\`\n\n### When indexes hurt performance\n\n1. **High write volume** — Every INSERT/UPDATE/DELETE must update all indexes. A table with 10 indexes has 10x write amplification.\n2. **Low-selectivity columns** — An index on a boolean column (is_active: 80% TRUE) won't help; the engine may scan anyway.\n3. **Small tables** — For tables under ~10,000 rows, a sequential scan is often faster than index lookup.\n4. **Indexes on JSON/metadata columns** — B-tree indexes on JSON are expensive; use expression indexes on specific JSON paths instead.\n5. **Unused indexes** — Query patterns change; run \`pg_stat_user_indexes\` to find indexes with 0 scans.`,
    rubric: ["Recommends composite index for pattern 1 with correct column order", "Explains high-cardinality column first principle", "Mentions covering index", "Addresses partitioning as alternative", "Explains write amplification as index cost"],
    tags: ["indexes", "query-optimization", "composite-index", "covering-index", "performance"],
    commonMistakes: ["Suggesting an index on every column", "Not explaining column order in composite indexes", "Missing the write-performance tradeoff of indexes"]
  },
  {
    id: "sql-q40", courseId: "sql", topicId: "sql-advanced",
    title: "Session Attribution with CTEs",
    difficulty: "Hard", company: "Google", type: "code", language: "sql", estimatedMinutes: 25,
    prompt: `You're on Google Ads analytics team. The page_events table has: event_id, user_id, page_url, event_timestamp. A "session" is defined as a sequence of events where no gap between consecutive events for the same user exceeds 30 minutes. Write a query to assign a session_id to each event. Use a CTE chain: first identify session starts (where the gap from the previous event > 30 min), then assign cumulative session numbers per user.`,
    hints: ["LAG(event_timestamp) OVER (PARTITION BY user_id ORDER BY event_timestamp) gets previous event time", "CASE WHEN gap > 30 THEN 1 ELSE 0 END flags new sessions", "SUM(is_new_session) OVER (PARTITION BY user_id ORDER BY event_timestamp) assigns cumulative session IDs"],
    modelAnswer: `WITH event_gaps AS (
  SELECT
    event_id,
    user_id,
    page_url,
    event_timestamp,
    LAG(event_timestamp) OVER (
      PARTITION BY user_id
      ORDER BY event_timestamp
    ) AS prev_event_ts
  FROM page_events
),
session_flags AS (
  SELECT
    event_id,
    user_id,
    page_url,
    event_timestamp,
    CASE
      WHEN prev_event_ts IS NULL THEN 1
      WHEN EXTRACT(EPOCH FROM (event_timestamp - prev_event_ts)) > 1800 THEN 1
      ELSE 0
    END AS is_new_session
  FROM event_gaps
),
session_ids AS (
  SELECT
    event_id,
    user_id,
    page_url,
    event_timestamp,
    is_new_session,
    user_id || '-' || CAST(
      SUM(is_new_session) OVER (
        PARTITION BY user_id
        ORDER BY event_timestamp
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
      ) AS TEXT
    ) AS session_id
  FROM session_flags
)
SELECT
  event_id,
  user_id,
  session_id,
  page_url,
  event_timestamp
FROM session_ids
ORDER BY user_id, event_timestamp;`,
    rubric: ["LAG to compute time gap between events", "NULL check for first event per user (is_new_session = 1)", "30 minute threshold (1800 seconds) used", "SUM(is_new_session) OVER for cumulative session count", "Session ID combines user_id and session number"],
    tags: ["session-analysis", "cte", "lag", "window-functions", "sessionization"],
    commonMistakes: ["Not handling the first event per user (NULL prev_event_ts)", "Using INTERVAL comparison incorrectly across dialects", "Forgetting ROWS BETWEEN UNBOUNDED PRECEDING for cumulative sum"]
  },

];
