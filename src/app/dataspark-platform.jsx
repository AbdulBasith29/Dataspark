import { useState, useEffect, useRef } from "react";

// ─── QUESTION BANK ───────────────────────────────────────────────────────────
// Organized by category → subcategory → difficulty
const QUESTIONS = {
  "sql-python": {
    label: "SQL & Python",
    icon: "⌨️",
    color: "#0EA5E9",
    subcategories: {
      "sql-fundamentals": {
        label: "SQL Fundamentals",
        questions: [
          {
            id: "sq1",
            title: "Revenue by Customer Segment",
            difficulty: "Easy",
            company: "Shopify",
            type: "code",
            language: "sql",
            prompt: `You're a data analyst at an e-commerce company. The marketing team wants to understand revenue distribution across customer segments to allocate their Q3 budget.\n\nGiven the following tables:\n\n**customers** (customer_id, name, segment, signup_date)\n**orders** (order_id, customer_id, order_date, total_amount, status)\n\nWrite a query that returns each customer segment, the number of unique customers who made at least one purchase, total revenue (only from 'completed' orders), and average order value. Order by total revenue descending.\n\nThe marketing team specifically wants to see segments with at least $10,000 in revenue.`,
            hints: [
              "Think about which JOIN type ensures you only count customers with orders",
              "Remember to filter order status before aggregating",
              "HAVING clause filters groups, WHERE filters rows"
            ],
            modelAnswer: `SELECT \n  c.segment,\n  COUNT(DISTINCT c.customer_id) AS active_customers,\n  SUM(o.total_amount) AS total_revenue,\n  ROUND(AVG(o.total_amount), 2) AS avg_order_value\nFROM customers c\nINNER JOIN orders o ON c.customer_id = o.customer_id\nWHERE o.status = 'completed'\nGROUP BY c.segment\nHAVING SUM(o.total_amount) >= 10000\nORDER BY total_revenue DESC;`,
            rubric: ["Correct JOIN type (INNER JOIN)", "Filters on status = 'completed'", "Uses COUNT(DISTINCT) for unique customers", "HAVING clause for revenue threshold", "Proper ORDER BY"],
            tags: ["joins", "aggregation", "having", "filtering"]
          },
          {
            id: "sq2",
            title: "Running Total of Daily Signups",
            difficulty: "Medium",
            company: "Stripe",
            type: "code",
            language: "sql",
            prompt: `Your growth team needs a daily report showing signup momentum. They want to see each day's new signups alongside a cumulative running total, but only for the last 90 days.\n\nGiven:\n**users** (user_id, email, created_at, referral_source, is_active)\n\nWrite a query that returns:\n- signup_date\n- daily_signups (count of new users that day)\n- running_total (cumulative sum of signups up to and including that day)\n- day_over_day_change (difference from previous day's signups)\n\nOnly include the last 90 days. Handle days with zero signups gracefully.`,
            hints: [
              "Window functions are your friend here — SUM() OVER and LAG()",
              "You might need a date series to handle days with zero signups",
              "COALESCE can handle NULLs from LAG on the first row"
            ],
            modelAnswer: `WITH daily_counts AS (\n  SELECT \n    DATE(created_at) AS signup_date,\n    COUNT(*) AS daily_signups\n  FROM users\n  WHERE created_at >= CURRENT_DATE - INTERVAL '90 days'\n  GROUP BY DATE(created_at)\n)\nSELECT \n  signup_date,\n  daily_signups,\n  SUM(daily_signups) OVER (ORDER BY signup_date) AS running_total,\n  daily_signups - COALESCE(LAG(daily_signups) OVER (ORDER BY signup_date), 0) AS day_over_day_change\nFROM daily_counts\nORDER BY signup_date;`,
            rubric: ["Uses CTE or subquery for daily aggregation", "Correct window function for running total", "LAG() for day-over-day comparison", "Handles NULL with COALESCE", "Proper date filtering"],
            tags: ["window-functions", "CTEs", "date-manipulation", "running-totals"]
          },
          {
            id: "sq3",
            title: "Cohort Retention Analysis",
            difficulty: "Hard",
            company: "Netflix",
            type: "code",
            language: "sql",
            prompt: `The product team wants to understand user retention by signup cohort. They define retention as a user performing at least one action in a given month after signup.\n\nGiven:\n**users** (user_id, signup_date)\n**user_actions** (action_id, user_id, action_date, action_type)\n\nBuild a cohort retention table that shows:\n- cohort_month (the month users signed up)\n- cohort_size (number of users in that cohort)\n- months_since_signup (0, 1, 2, ... up to 6)\n- retained_users (count of users active in that period)\n- retention_rate (percentage retained)\n\nShow results for cohorts from the last 12 months.`,
            hints: [
              "DATE_TRUNC is useful for grouping into monthly cohorts",
              "Calculate months_since_signup using date arithmetic",
              "Cross join cohorts with month numbers to ensure all periods appear"
            ],
            modelAnswer: `WITH cohorts AS (\n  SELECT \n    user_id,\n    DATE_TRUNC('month', signup_date) AS cohort_month\n  FROM users\n  WHERE signup_date >= CURRENT_DATE - INTERVAL '12 months'\n),\nuser_activity AS (\n  SELECT \n    c.user_id,\n    c.cohort_month,\n    DATE_TRUNC('month', a.action_date) AS activity_month,\n    EXTRACT(YEAR FROM AGE(DATE_TRUNC('month', a.action_date), c.cohort_month)) * 12 +\n    EXTRACT(MONTH FROM AGE(DATE_TRUNC('month', a.action_date), c.cohort_month)) AS months_since_signup\n  FROM cohorts c\n  JOIN user_actions a ON c.user_id = a.user_id\n),\ncohort_sizes AS (\n  SELECT cohort_month, COUNT(DISTINCT user_id) AS cohort_size\n  FROM cohorts GROUP BY cohort_month\n)\nSELECT \n  ua.cohort_month,\n  cs.cohort_size,\n  ua.months_since_signup,\n  COUNT(DISTINCT ua.user_id) AS retained_users,\n  ROUND(100.0 * COUNT(DISTINCT ua.user_id) / cs.cohort_size, 1) AS retention_rate\nFROM user_activity ua\nJOIN cohort_sizes cs ON ua.cohort_month = cs.cohort_month\nWHERE ua.months_since_signup BETWEEN 0 AND 6\nGROUP BY ua.cohort_month, cs.cohort_size, ua.months_since_signup\nORDER BY ua.cohort_month, ua.months_since_signup;`,
            rubric: ["Correct cohort assignment with DATE_TRUNC", "Accurate month difference calculation", "Uses CTEs for readability", "Handles retention rate as percentage", "Proper GROUP BY and ordering", "Considers DISTINCT user counts"],
            tags: ["cohort-analysis", "retention", "CTEs", "window-functions", "date-math"]
          },
          {
            id: "sq4",
            title: "Duplicate Detection & Cleanup",
            difficulty: "Easy",
            company: "Airbnb",
            type: "code",
            language: "sql",
            prompt: `The data engineering team has discovered duplicate records in the listings table due to a bug in the ingestion pipeline. Your job is to identify and handle them.\n\nGiven:\n**listings** (listing_id, host_id, title, city, price, created_at, updated_at)\n\nDuplicates are defined as rows with the same host_id, title, and city.\n\nWrite queries to:\n1. Find all duplicate groups showing the count of duplicates\n2. For each duplicate group, keep only the most recently updated record and write a DELETE statement to remove the rest`,
            hints: [
              "GROUP BY + HAVING COUNT(*) > 1 finds duplicates",
              "ROW_NUMBER() partitioned by the duplicate key can rank records",
              "A CTE with ROW_NUMBER lets you target specific rows for deletion"
            ],
            modelAnswer: `-- Part 1: Find duplicates\nSELECT host_id, title, city, COUNT(*) AS duplicate_count\nFROM listings\nGROUP BY host_id, title, city\nHAVING COUNT(*) > 1\nORDER BY duplicate_count DESC;\n\n-- Part 2: Delete duplicates keeping most recent\nWITH ranked AS (\n  SELECT listing_id,\n    ROW_NUMBER() OVER (\n      PARTITION BY host_id, title, city \n      ORDER BY updated_at DESC\n    ) AS rn\n  FROM listings\n)\nDELETE FROM listings\nWHERE listing_id IN (\n  SELECT listing_id FROM ranked WHERE rn > 1\n);`,
            rubric: ["Correct GROUP BY for duplicate detection", "HAVING COUNT(*) > 1", "ROW_NUMBER with correct PARTITION BY", "Keeps most recent via ORDER BY updated_at DESC", "DELETE targets rn > 1"],
            tags: ["deduplication", "window-functions", "data-quality", "DELETE"]
          },
          {
            id: "sq5",
            title: "Funnel Conversion Analysis",
            difficulty: "Medium",
            company: "Uber",
            type: "code",
            language: "sql",
            prompt: `The product team wants to understand where users drop off in the ride-booking funnel. The funnel steps are: app_open → search → select_ride → confirm → ride_completed.\n\nGiven:\n**events** (event_id, user_id, event_type, event_timestamp, session_id, city)\n\nWrite a query that calculates:\n- Each funnel step\n- Number of unique users at each step\n- Conversion rate from previous step\n- Overall conversion rate from app_open\n\nAnalyze for the last 30 days. Break down by city.`,
            hints: [
              "Define the funnel order explicitly — a CASE statement or VALUES list works",
              "Users must complete steps in order within a session",
              "Use conditional aggregation (COUNT with CASE WHEN) for each step"
            ],
            modelAnswer: `WITH funnel AS (\n  SELECT \n    city,\n    COUNT(DISTINCT CASE WHEN event_type = 'app_open' THEN user_id END) AS step_1_open,\n    COUNT(DISTINCT CASE WHEN event_type = 'search' THEN user_id END) AS step_2_search,\n    COUNT(DISTINCT CASE WHEN event_type = 'select_ride' THEN user_id END) AS step_3_select,\n    COUNT(DISTINCT CASE WHEN event_type = 'confirm' THEN user_id END) AS step_4_confirm,\n    COUNT(DISTINCT CASE WHEN event_type = 'ride_completed' THEN user_id END) AS step_5_complete\n  FROM events\n  WHERE event_timestamp >= CURRENT_DATE - INTERVAL '30 days'\n  GROUP BY city\n)\nSELECT \n  city,\n  step_1_open,\n  step_2_search,\n  ROUND(100.0 * step_2_search / NULLIF(step_1_open, 0), 1) AS open_to_search_pct,\n  step_3_select,\n  ROUND(100.0 * step_3_select / NULLIF(step_2_search, 0), 1) AS search_to_select_pct,\n  step_4_confirm,\n  ROUND(100.0 * step_4_confirm / NULLIF(step_3_select, 0), 1) AS select_to_confirm_pct,\n  step_5_complete,\n  ROUND(100.0 * step_5_complete / NULLIF(step_4_confirm, 0), 1) AS confirm_to_complete_pct,\n  ROUND(100.0 * step_5_complete / NULLIF(step_1_open, 0), 1) AS overall_conversion_pct\nFROM funnel\nORDER BY step_1_open DESC;`,
            rubric: ["Conditional aggregation for funnel steps", "NULLIF to prevent division by zero", "Step-over-step conversion rates", "Overall conversion rate", "City breakdown", "Proper date filtering"],
            tags: ["funnel-analysis", "conditional-aggregation", "conversion", "product-analytics"]
          }
        ]
      },
      "python-fundamentals": {
        label: "Python for Data Science",
        questions: [
          {
            id: "py1",
            title: "Customer Churn Feature Engineering",
            difficulty: "Medium",
            company: "Spotify",
            type: "code",
            language: "python",
            prompt: `You're building a churn prediction model for a music streaming service. The raw data has user activity logs but needs feature engineering before modeling.\n\nGiven a pandas DataFrame 'activity_df' with columns:\n- user_id, action_date, action_type ('play', 'skip', 'save', 'share'), song_id, listen_duration_seconds\n\nAnd 'users_df' with:\n- user_id, subscription_type ('free', 'premium'), signup_date\n\nCreate a feature engineering function that returns a DataFrame with one row per user containing:\n- days_since_signup\n- total_plays_last_30d\n- avg_listen_duration\n- skip_rate (skips / total actions)\n- unique_songs_played\n- share_rate\n- days_since_last_activity\n- is_premium (binary)\n- activity_trend (comparing last 15 days vs prior 15 days)`,
            hints: [
              "pd.Timestamp.now() minus dates gives timedelta — use .dt.days",
              "GroupBy + agg with named aggregations keeps things clean",
              "For activity_trend, filter two windows and compare counts"
            ],
            modelAnswer: `import pandas as pd\nimport numpy as np\nfrom datetime import datetime, timedelta\n\ndef engineer_churn_features(activity_df, users_df):\n    now = pd.Timestamp.now()\n    cutoff_30d = now - timedelta(days=30)\n    cutoff_15d = now - timedelta(days=15)\n    \n    recent = activity_df[activity_df['action_date'] >= cutoff_30d].copy()\n    \n    # Core activity features\n    user_features = recent.groupby('user_id').agg(\n        total_actions=('action_type', 'count'),\n        total_plays=('action_type', lambda x: (x == 'play').sum()),\n        total_skips=('action_type', lambda x: (x == 'skip').sum()),\n        total_shares=('action_type', lambda x: (x == 'share').sum()),\n        avg_listen_duration=('listen_duration_seconds', 'mean'),\n        unique_songs=('song_id', 'nunique'),\n        last_activity=('action_date', 'max')\n    ).reset_index()\n    \n    # Derived rates\n    user_features['skip_rate'] = user_features['total_skips'] / user_features['total_actions']\n    user_features['share_rate'] = user_features['total_shares'] / user_features['total_actions']\n    user_features['days_since_last_activity'] = (now - user_features['last_activity']).dt.days\n    \n    # Activity trend: last 15d vs prior 15d\n    last_15 = recent[recent['action_date'] >= cutoff_15d].groupby('user_id').size().rename('recent_count')\n    prior_15 = recent[recent['action_date'] < cutoff_15d].groupby('user_id').size().rename('prior_count')\n    trend = pd.concat([last_15, prior_15], axis=1).fillna(0)\n    trend['activity_trend'] = (trend['recent_count'] - trend['prior_count']) / trend['prior_count'].replace(0, 1)\n    \n    # Merge with user info\n    result = user_features.merge(users_df[['user_id', 'signup_date', 'subscription_type']], on='user_id', how='left')\n    result['days_since_signup'] = (now - result['signup_date']).dt.days\n    result['is_premium'] = (result['subscription_type'] == 'premium').astype(int)\n    result = result.merge(trend[['activity_trend']], left_on='user_id', right_index=True, how='left')\n    \n    feature_cols = ['user_id', 'days_since_signup', 'total_plays', 'avg_listen_duration',\n                    'skip_rate', 'share_rate', 'unique_songs', 'days_since_last_activity',\n                    'is_premium', 'activity_trend']\n    \n    return result[feature_cols].fillna(0)`,
            rubric: ["Correct date filtering for 30-day window", "Proper groupby aggregation", "Skip rate and share rate calculated correctly", "Activity trend compares two time windows", "Handles division by zero", "Clean merge with user data", "Returns well-structured DataFrame"],
            tags: ["pandas", "feature-engineering", "groupby", "churn", "time-series"]
          },
          {
            id: "py2",
            title: "A/B Test Statistical Analysis",
            difficulty: "Hard",
            company: "Meta",
            type: "code",
            language: "python",
            prompt: `The experimentation team ran an A/B test on a new checkout flow. They need you to build a reusable analysis function.\n\nWrite a Python function 'analyze_ab_test' that takes:\n- control_conversions (int), control_total (int)\n- treatment_conversions (int), treatment_total (int)\n- alpha (float, default 0.05)\n\nIt should return a dictionary with:\n- control_rate, treatment_rate\n- absolute_lift, relative_lift\n- p_value (two-tailed z-test)\n- confidence_interval_95 for the difference\n- is_significant (boolean)\n- required_sample_size (for the observed effect size at 80% power)\n\nDo NOT use any external statistical libraries — implement from scratch using only math and basic Python.`,
            hints: [
              "Z-test for proportions: z = (p1-p2) / sqrt(p_pool*(1-p_pool)*(1/n1+1/n2))",
              "For CI: (p1-p2) ± z_alpha * SE",
              "Sample size formula: n = (z_alpha + z_beta)² * (p1(1-p1) + p2(1-p2)) / (p1-p2)²"
            ],
            modelAnswer: `import math\n\ndef analyze_ab_test(control_conversions, control_total, treatment_conversions, treatment_total, alpha=0.05):\n    # Conversion rates\n    p_c = control_conversions / control_total\n    p_t = treatment_conversions / treatment_total\n    \n    # Pooled proportion\n    p_pool = (control_conversions + treatment_conversions) / (control_total + treatment_total)\n    \n    # Standard error\n    se = math.sqrt(p_pool * (1 - p_pool) * (1/control_total + 1/treatment_total))\n    \n    # Z-statistic\n    z = (p_t - p_c) / se if se > 0 else 0\n    \n    # P-value (two-tailed, using normal approximation)\n    p_value = 2 * (1 - _norm_cdf(abs(z)))\n    \n    # 95% CI for difference\n    se_diff = math.sqrt(p_c*(1-p_c)/control_total + p_t*(1-p_t)/treatment_total)\n    z_alpha = 1.96\n    ci_lower = (p_t - p_c) - z_alpha * se_diff\n    ci_upper = (p_t - p_c) + z_alpha * se_diff\n    \n    # Required sample size (80% power)\n    z_beta = 0.842\n    effect = abs(p_t - p_c)\n    if effect > 0:\n        n_required = math.ceil(((z_alpha + z_beta)**2 * (p_c*(1-p_c) + p_t*(1-p_t))) / effect**2)\n    else:\n        n_required = float('inf')\n    \n    return {\n        'control_rate': round(p_c, 4),\n        'treatment_rate': round(p_t, 4),\n        'absolute_lift': round(p_t - p_c, 4),\n        'relative_lift': round((p_t - p_c) / p_c, 4) if p_c > 0 else None,\n        'p_value': round(p_value, 4),\n        'confidence_interval_95': (round(ci_lower, 4), round(ci_upper, 4)),\n        'is_significant': p_value < alpha,\n        'required_sample_size_per_group': n_required\n    }\n\ndef _norm_cdf(x):\n    \"\"\"Approximation of standard normal CDF\"\"\"\n    return 0.5 * (1 + math.erf(x / math.sqrt(2)))`,
            rubric: ["Correct pooled proportion calculation", "Proper z-test implementation", "Two-tailed p-value", "Confidence interval uses unpooled SE", "Sample size formula correct", "No external library dependencies", "Clean return dictionary"],
            tags: ["statistics", "ab-testing", "hypothesis-testing", "experimentation"]
          },
          {
            id: "py3",
            title: "Data Pipeline Error Handling",
            difficulty: "Easy",
            company: "Databricks",
            type: "code",
            language: "python",
            prompt: `You're building a data pipeline that reads CSV files from a directory, validates them, and outputs clean data. Files can be malformed, have missing columns, or contain invalid data types.\n\nWrite a function 'process_csv_batch' that:\n- Takes a list of file paths\n- Reads each CSV with pandas\n- Validates required columns exist: ['user_id', 'event_type', 'timestamp', 'value']\n- Validates data types: user_id (int), timestamp (datetime parseable), value (numeric)\n- Logs issues per file (missing columns, bad rows with row numbers)\n- Returns: (clean_df with all valid rows combined, error_report dict)\n\nThe function should never crash — all errors should be caught and reported.`,
            hints: [
              "Wrap each file read in try/except for FileNotFoundError and pd.errors.ParserError",
              "pd.to_numeric with errors='coerce' + notna() filters bad values",
              "pd.to_datetime with errors='coerce' similarly handles bad dates"
            ],
            modelAnswer: `import pandas as pd\nimport logging\n\nlogger = logging.getLogger(__name__)\n\ndef process_csv_batch(file_paths):\n    REQUIRED_COLS = ['user_id', 'event_type', 'timestamp', 'value']\n    clean_frames = []\n    error_report = {}\n    \n    for path in file_paths:\n        file_errors = []\n        try:\n            df = pd.read_csv(path)\n        except FileNotFoundError:\n            error_report[path] = ['File not found']\n            continue\n        except Exception as e:\n            error_report[path] = [f'Read error: {str(e)}']\n            continue\n        \n        # Check required columns\n        missing = set(REQUIRED_COLS) - set(df.columns)\n        if missing:\n            file_errors.append(f'Missing columns: {missing}')\n            error_report[path] = file_errors\n            continue\n        \n        df = df[REQUIRED_COLS].copy()\n        initial_count = len(df)\n        \n        # Validate user_id (numeric integer)\n        df['user_id'] = pd.to_numeric(df['user_id'], errors='coerce')\n        bad_uid = df['user_id'].isna()\n        if bad_uid.any():\n            file_errors.append(f'Invalid user_id at rows: {list(df[bad_uid].index)}')\n        \n        # Validate timestamp\n        df['timestamp'] = pd.to_datetime(df['timestamp'], errors='coerce')\n        bad_ts = df['timestamp'].isna()\n        if bad_ts.any():\n            file_errors.append(f'Invalid timestamp at rows: {list(df[bad_ts].index)}')\n        \n        # Validate value\n        df['value'] = pd.to_numeric(df['value'], errors='coerce')\n        bad_val = df['value'].isna()\n        if bad_val.any():\n            file_errors.append(f'Invalid value at rows: {list(df[bad_val].index)}')\n        \n        # Drop invalid rows\n        df_clean = df.dropna()\n        df_clean['user_id'] = df_clean['user_id'].astype(int)\n        dropped = initial_count - len(df_clean)\n        \n        if dropped > 0:\n            file_errors.append(f'Dropped {dropped}/{initial_count} rows')\n        \n        if file_errors:\n            error_report[path] = file_errors\n        \n        if len(df_clean) > 0:\n            df_clean['source_file'] = path\n            clean_frames.append(df_clean)\n        \n        logger.info(f'{path}: {len(df_clean)}/{initial_count} rows valid')\n    \n    clean_df = pd.concat(clean_frames, ignore_index=True) if clean_frames else pd.DataFrame(columns=REQUIRED_COLS)\n    return clean_df, error_report`,
            rubric: ["Try/except for file reading", "Validates all required columns", "Uses errors='coerce' for type validation", "Reports specific bad row indices", "Never crashes on bad input", "Combines clean data from all files", "Includes source_file tracking"],
            tags: ["data-pipeline", "error-handling", "pandas", "data-validation", "ETL"]
          }
        ]
      },
      "advanced-sql": {
        label: "Advanced SQL",
        questions: [
          {
            id: "asq1",
            title: "Recursive Manager Hierarchy",
            difficulty: "Hard",
            company: "Google",
            type: "code",
            language: "sql",
            prompt: `HR needs to generate a complete org chart from a flat employee table. Each employee has a manager_id that references another employee.\n\nGiven:\n**employees** (employee_id, name, title, manager_id, department, salary)\n\nWrite a query using recursive CTE that returns:\n- employee_id, name, title\n- manager_name\n- hierarchy_level (CEO = 0)\n- full_chain (e.g., 'CEO > VP Engineering > Senior Engineer > Engineer')\n- team_size (number of all direct and indirect reports)\n\nThe CEO has manager_id = NULL.`,
            hints: [
              "Recursive CTE: start with WHERE manager_id IS NULL, then join back",
              "Concatenate the chain with || or CONCAT in the recursive part",
              "Team size needs a separate aggregation — count descendants per node"
            ],
            modelAnswer: `WITH RECURSIVE org AS (\n  -- Base: CEO\n  SELECT \n    employee_id, name, title, manager_id,\n    NULL::text AS manager_name,\n    0 AS hierarchy_level,\n    name AS full_chain\n  FROM employees\n  WHERE manager_id IS NULL\n  \n  UNION ALL\n  \n  -- Recursive: employees under each manager\n  SELECT \n    e.employee_id, e.name, e.title, e.manager_id,\n    o.name AS manager_name,\n    o.hierarchy_level + 1,\n    o.full_chain || ' > ' || e.name\n  FROM employees e\n  JOIN org o ON e.manager_id = o.employee_id\n),\nteam_counts AS (\n  SELECT \n    o1.employee_id,\n    COUNT(o2.employee_id) AS team_size\n  FROM org o1\n  LEFT JOIN org o2 ON o2.full_chain LIKE o1.full_chain || ' > %'\n  GROUP BY o1.employee_id\n)\nSELECT \n  o.employee_id, o.name, o.title,\n  o.manager_name, o.hierarchy_level,\n  o.full_chain, COALESCE(t.team_size, 0) AS team_size\nFROM org o\nLEFT JOIN team_counts t ON o.employee_id = t.employee_id\nORDER BY o.hierarchy_level, o.name;`,
            rubric: ["Correct recursive CTE base case", "Proper recursive join", "Chain concatenation", "Hierarchy level increments", "Team size counts all descendants", "Handles CEO (NULL manager)"],
            tags: ["recursive-CTE", "hierarchical-data", "org-chart", "self-join"]
          }
        ]
      }
    }
  },
  "system-design": {
    label: "System Design & Architecture",
    icon: "🏗️",
    color: "#8B5CF6",
    subcategories: {
      "data-pipeline-design": {
        label: "Data Pipeline Architecture",
        questions: [
          {
            id: "sd1",
            title: "Real-Time Fraud Detection Pipeline",
            difficulty: "Hard",
            company: "Square",
            type: "open-ended",
            prompt: `You're the lead data engineer at a payments company processing 10,000 transactions per second. The fraud team currently reviews flagged transactions manually with a 24-hour delay — by then, fraudulent charges have already cleared.\n\nDesign a real-time fraud detection pipeline that:\n- Processes transactions with < 500ms latency\n- Combines rule-based checks with ML model scoring\n- Handles the cold start problem for new users\n- Scales to 3x current volume during peak (Black Friday)\n- Maintains an audit trail for compliance\n\nIn your answer, address:\n1. Architecture diagram (describe the components and data flow)\n2. Technology choices and why\n3. How you'd handle model updates without downtime\n4. Monitoring and alerting strategy\n5. What you'd build first vs. later (phased approach)`,
            hints: [
              "Think about stream processing (Kafka + Flink/Spark Streaming) vs batch",
              "Feature stores can serve both real-time and batch features",
              "Blue-green deployment for model updates avoids downtime",
              "Consider the tradeoff between false positives (blocking good users) and false negatives (missing fraud)"
            ],
            modelAnswer: `**Architecture Overview:**\n\nThe pipeline has three layers:\n\n1. **Ingestion Layer**: Kafka topics receive transaction events. Each transaction gets enriched with user profile data from a low-latency cache (Redis) containing historical features pre-computed in batch.\n\n2. **Processing Layer**: Apache Flink consumes from Kafka and applies:\n   - Rule engine (velocity checks, amount thresholds, geo-anomalies) — catches obvious fraud in <50ms\n   - ML model serving via a feature store (Feast) that combines real-time features (session behavior) with batch features (historical patterns)\n   - For cold-start users: fall back to population-level risk scores and stricter rule thresholds\n\n3. **Decision Layer**: Scores are combined (ensemble) and routed:\n   - Score > 0.9: auto-block, alert fraud team\n   - Score 0.6-0.9: hold for review, notify user\n   - Score < 0.6: approve, log for batch analysis\n\n**Tech Choices**: Kafka (proven at scale, exactly-once semantics), Flink (true streaming with event-time processing), Redis (sub-ms feature lookup), MLflow (model versioning and A/B testing)\n\n**Model Updates**: Blue-green deployment — new model serves shadow traffic first, compare metrics for 24h, then canary to 5% of traffic, full rollout if metrics hold.\n\n**Monitoring**: Track latency p50/p95/p99, false positive rate, model prediction distribution drift, Kafka consumer lag, feature freshness.\n\n**Phased Approach**:\n- Phase 1 (Week 1-4): Rule engine on Kafka + Flink, reduces fraud by ~60%\n- Phase 2 (Week 5-10): ML model with batch features\n- Phase 3 (Week 11-16): Real-time features, cold-start handling, auto-scaling`,
            rubric: [
              "Clear separation of ingestion, processing, and decision layers",
              "Addresses latency requirement (<500ms) with specific tech choices",
              "Combines rules + ML (not just one approach)",
              "Handles cold start problem explicitly",
              "Scaling strategy for peak traffic",
              "Model update strategy (blue-green, canary, or shadow)",
              "Monitoring covers both system health and model performance",
              "Phased rollout shows pragmatic thinking",
              "Audit trail / compliance addressed"
            ],
            tags: ["streaming", "fraud-detection", "kafka", "ML-systems", "architecture"]
          },
          {
            id: "sd2",
            title: "Recommendation System at Scale",
            difficulty: "Medium",
            company: "Pinterest",
            type: "open-ended",
            prompt: `You're building a content recommendation system for a visual discovery platform with 400 million monthly active users. The current system uses a simple collaborative filtering model that's becoming too slow and isn't personalizing well.\n\nDesign the next-generation recommendation architecture. Address:\n1. How would you structure the candidate generation → ranking → re-ranking pipeline?\n2. What embedding strategy would you use for visual content?\n3. How do you handle the exploration-exploitation tradeoff?\n4. How would you evaluate recommendations offline vs online?\n5. What's your strategy for real-time personalization vs batch?\n6. How do you handle content cold-start for new pins?`,
            hints: [
              "Multi-stage retrieval (candidate gen → ranking) is standard at scale",
              "Think about separate models for different signal types (visual, textual, behavioral)",
              "Multi-armed bandits or epsilon-greedy for explore/exploit",
              "Offline: precision@k, NDCG. Online: CTR, long-term engagement, diversity"
            ],
            modelAnswer: `**Multi-Stage Pipeline:**\n\n1. **Candidate Generation** (~1000 candidates from billions): Multiple retrieval paths run in parallel:\n   - Collaborative filtering (user-user, item-item)\n   - Content-based (visual + text embeddings via CLIP)\n   - Graph-based (user→pin→board→pin traversal)\n   - Trending/popular within interest clusters\n\n2. **Ranking** (~1000→100): A deep learning model (two-tower or cross-attention) scores candidates using:\n   - User features (history, demographics, session context)\n   - Item features (visual embedding, engagement stats, freshness)\n   - Cross features (user-item interaction history)\n\n3. **Re-ranking** (100→30 shown): Business logic layer:\n   - Diversity constraints (no >3 pins from same creator)\n   - Freshness boost for new content\n   - Ad slot insertion\n   - Safety/quality filters\n\n**Visual Embeddings**: Fine-tune CLIP on platform-specific data. Store embeddings in a vector DB (Pinecone/Milvus) for ANN search.\n\n**Explore/Exploit**: Thompson sampling with contextual bandits. 10% exploration budget, biased toward new/under-served content.\n\n**Evaluation**: Offline — NDCG@10, Recall@100, catalog coverage. Online — A/B test on CTR, save rate, session duration, 7-day return rate.\n\n**Cold Start**: New pins get visual embedding similarity to existing popular pins + boosted exploration exposure for first 48h.`,
            rubric: [
              "Multi-stage pipeline (candidate gen → ranking → re-ranking)",
              "Multiple retrieval strategies in parallel",
              "Addresses visual understanding (embeddings/CLIP)",
              "Exploration-exploitation strategy specified",
              "Both offline and online evaluation metrics",
              "Cold-start handling for new content",
              "Considers diversity and business constraints",
              "Scalability awareness (400M users)"
            ],
            tags: ["recommendations", "embeddings", "ranking", "ML-systems", "scale"]
          },
          {
            id: "sd3",
            title: "Data Warehouse Migration Strategy",
            difficulty: "Medium",
            company: "Notion",
            type: "open-ended",
            prompt: `Your company has outgrown its PostgreSQL-based analytics setup. Queries that used to take seconds now take 20+ minutes, the BI team is frustrated, and the data team spends 40% of their time firefighting slow dashboards.\n\nCurrent state:\n- 5TB of data, growing 200GB/month\n- 300 dbt models with complex dependencies\n- 50 Looker dashboards used by 200 business users\n- ETL runs on Airflow with 150 DAGs\n- Team of 4 data engineers, 3 analysts\n\nDesign the migration plan to a modern cloud data warehouse. Address:\n1. Which warehouse and why?\n2. Migration strategy (big bang vs incremental?)\n3. How do you ensure zero downtime for business users?\n4. How do you validate data accuracy post-migration?\n5. What changes to the dbt project?\n6. Timeline and team allocation`,
            hints: [
              "Snowflake, BigQuery, and Redshift each have tradeoffs worth discussing",
              "Dual-write or shadow mode lets you validate before cutting over",
              "dbt's adapter system makes warehouse switches relatively painless",
              "Think about who on the team does what — this is a people problem too"
            ],
            modelAnswer: `**Warehouse Choice: Snowflake**\nWhy: Separation of storage and compute (pay for what you use), near-zero admin overhead for a small team, excellent dbt integration, Looker native connector, and auto-scaling handles burst queries from BI users.\n\n**Migration Strategy: Incremental (Shadow Mode)**\n- Phase 1 (Week 1-3): Set up Snowflake, replicate raw data via Fivetran/Stitch dual-write\n- Phase 2 (Week 4-8): Port dbt project (change adapter, adjust SQL dialect differences — mostly window functions and date handling)\n- Phase 3 (Week 9-10): Run dbt on BOTH warehouses, compare outputs row-by-row\n- Phase 4 (Week 11-12): Migrate Looker connections, cutover dashboards in batches\n- Phase 5 (Week 13-14): Decommission PostgreSQL analytics schema\n\n**Zero Downtime**: During shadow mode, Looker stays on Postgres. Only switch Looker connection per-dashboard once that dashboard's upstream models are validated in Snowflake. Users see no disruption.\n\n**Data Validation**:\n- Automated row counts + checksum comparison on all 300 models\n- Statistical profiling (min, max, mean, nulls, distribution) on key columns\n- Business-critical metrics compared manually by analysts (revenue, user counts)\n- Keep Postgres running 2 weeks post-cutover as fallback\n\n**dbt Changes**: Swap adapter to dbt-snowflake, fix ~15% of models with Postgres-specific SQL (array functions, lateral joins, interval syntax), add Snowflake-specific optimizations (clustering keys on large tables).\n\n**Team Allocation**: 2 data engineers on migration full-time, 1 engineer maintains current Airflow/Postgres, 1 engineer + analysts on validation. Analysts test dashboards and flag discrepancies.`,
            rubric: [
              "Clear warehouse choice with justified reasoning",
              "Incremental migration (not big bang)",
              "Shadow/dual-write period for validation",
              "Specific data validation strategy",
              "Addresses dbt migration specifics",
              "Realistic timeline for team size",
              "Zero-downtime plan for business users",
              "Fallback/rollback strategy"
            ],
            tags: ["data-warehouse", "migration", "dbt", "Snowflake", "architecture"]
          }
        ]
      },
      "ml-system-design": {
        label: "ML System Design",
        questions: [
          {
            id: "mld1",
            title: "Search Ranking System",
            difficulty: "Hard",
            company: "LinkedIn",
            type: "open-ended",
            prompt: `LinkedIn's search needs to return relevant results for queries like "machine learning engineer San Francisco" across people, jobs, posts, and companies.\n\nDesign the search ranking system. Address:\n1. How would you structure the multi-entity search (people, jobs, posts, companies)?\n2. What features would you use for ranking?\n3. How would you personalize results based on the searcher?\n4. How do you collect training data for the ranking model?\n5. What's your approach to handling query understanding (intent, entity recognition)?\n6. How would you measure search quality?`,
            hints: [
              "Federated search: query each vertical separately, then blend results",
              "Learning to rank (LTR) with features from query, document, and user",
              "Click models help derive relevance labels from implicit feedback",
              "Consider both precision-oriented and recall-oriented metrics"
            ],
            modelAnswer: `**Multi-Entity Architecture:**\nFederated search with per-vertical ranking + a blending layer.\n\nEach vertical (People, Jobs, Posts, Companies) has its own:\n- Inverted index (Elasticsearch) with entity-specific fields\n- First-pass retrieval using BM25 + embedding similarity\n- Vertical-specific L1 ranker (lightweight model)\n\nA blender model (L2 ranker) interleaves results from all verticals based on query intent.\n\n**Query Understanding Pipeline:**\n1. Intent classification: Is this a people search, job search, or ambiguous?\n2. Entity extraction: "machine learning engineer" = job title, "San Francisco" = location\n3. Query expansion: "ML engineer" → "machine learning engineer"\n\n**Ranking Features (~200 features):**\n- Query-document: BM25 score, semantic similarity, field match (title vs description)\n- Document: Freshness, engagement rate, completeness score, authority\n- User-document: Connection degree, shared skills/companies, past interactions\n- Context: Device, time of day, session history\n\n**Personalization:** Two-tower model encodes (user, query) and (document) into shared embedding space. User tower incorporates profile, search history, and network graph features.\n\n**Training Data:** Clicks as positive signal with position-bias correction (inverse propensity weighting). Skip-over as soft negative. Explicit feedback (saves, applies) as strong positive.\n\n**Metrics:** Online — MRR, CTR@3, successful session rate, queries-per-session (lower is better). Offline — NDCG@10, MAP, per-vertical recall.`,
            rubric: [
              "Federated search architecture across verticals",
              "Query understanding / intent classification",
              "Rich feature taxonomy (query, document, user, context)",
              "Personalization approach specified",
              "Training data collection with bias correction",
              "Both online and offline metrics",
              "Handles multi-entity blending",
              "Learning to rank framework"
            ],
            tags: ["search", "ranking", "NLP", "personalization", "ML-systems"]
          }
        ]
      }
    }
  },
  "business-cases": {
    label: "Business Case Studies",
    icon: "📊",
    color: "#F59E0B",
    subcategories: {
      "metric-definition": {
        label: "Metrics & KPI Design",
        questions: [
          {
            id: "bc1",
            title: "Defining Success for a New Feature",
            difficulty: "Medium",
            company: "Slack",
            type: "open-ended",
            prompt: `Slack is launching "Huddles" — a lightweight audio call feature that lets team members quickly jump into voice conversations from any channel. The PM asks you to define the success metrics.\n\nYou need to provide:\n1. A primary success metric (North Star) and why you chose it\n2. 3-5 supporting metrics across different dimensions\n3. Guardrail metrics (what should NOT get worse)\n4. How you'd set targets for the first 90 days\n5. How you'd instrument the feature to collect the data you need\n6. What would make you recommend killing the feature?`,
            hints: [
              "Think about adoption, engagement, AND impact on the core product",
              "Guardrails protect against cannibalization of other features",
              "90-day targets should reflect a realistic adoption curve",
              "The 'kill criteria' shows you think about opportunity cost"
            ],
            modelAnswer: `**North Star: Weekly Active Huddle Users / Weekly Active Users (Huddle Adoption Rate)**\nWhy: Measures whether the feature gains traction relative to the active user base. Pure usage counts grow with overall growth — a ratio isolates feature-specific adoption.\n\n**Supporting Metrics:**\n1. Huddle frequency: avg huddles per user per week (engagement depth)\n2. Huddle-to-message ratio: does audio reduce excessive messaging? (efficiency)\n3. Cross-team huddles: % of huddles between people in different channels (collaboration breadth)\n4. Time-to-first-huddle: days from feature availability to first use (activation speed)\n5. Repeat usage: % of first-time users who huddle again within 7 days (retention)\n\n**Guardrail Metrics:**\n- Scheduled meeting count shouldn't increase (huddles should reduce meetings, not add)\n- Message volume: shouldn't drop dramatically (huddles complement, not replace)\n- DAU/MAU ratio: overall engagement shouldn't decrease\n- NPS for non-huddle users: feature shouldn't annoy people who don't use it\n\n**90-Day Targets (based on feature adoption benchmarks):**\n- Day 30: 5% adoption rate (early adopters)\n- Day 60: 12% adoption rate (early majority)\n- Day 90: 20% adoption rate with >40% weekly retention among adopters\n\n**Instrumentation:**\n- Event tracking: huddle_started, huddle_joined, huddle_ended (with duration, participant count, source channel)\n- User properties: first_huddle_date, total_huddles, huddle_streak\n- Session context: what was user doing before starting huddle (reading channel, in thread, etc.)\n\n**Kill Criteria:**\n- <5% adoption at day 90 with declining trend\n- High infrastructure cost with low engagement (cost per huddle minute > threshold)\n- Negative impact on guardrails (meeting count +15% or DAU/MAU drops >2%)`,
            rubric: [
              "North Star is a ratio/rate, not a vanity metric",
              "Supporting metrics cover multiple dimensions (adoption, engagement, impact)",
              "Guardrail metrics protect against negative externalities",
              "90-day targets are specific and realistic",
              "Instrumentation plan is actionable",
              "Kill criteria are specific and measurable",
              "Considers second-order effects on the product"
            ],
            tags: ["metrics", "product-analytics", "feature-launch", "KPIs"]
          },
          {
            id: "bc2",
            title: "Diagnosing a Metric Drop",
            difficulty: "Hard",
            company: "DoorDash",
            type: "open-ended",
            prompt: `You're a data scientist at DoorDash. On Monday morning, you see that weekend conversion rate (users who opened the app → placed an order) dropped from 32% to 24% — a 25% relative decline. The VP of Product is panicking and wants answers by EOD.\n\nWalk through your investigation process:\n1. What's your framework for diagnosing this?\n2. What are the first 5 queries or analyses you'd run?\n3. What are the most likely hypotheses? Rank them.\n4. How do you distinguish between a real problem and a data issue?\n5. What do you present to the VP at EOD, even if you don't have a definitive answer?\n6. What would you recommend as immediate actions?`,
            hints: [
              "Segment the drop: is it all users or specific cohorts?",
              "Check for external factors: weather, holidays, competitor promos",
              "Data issues are common — check for logging changes, pipeline failures",
              "The VP wants direction, not perfection. Structure your uncertainty."
            ],
            modelAnswer: `**Diagnosis Framework: Segment → Isolate → Validate**\n\nStep 1: Is the data trustworthy? → Check pipeline health, event logging, recent deploys\nStep 2: Where is the drop? → Segment by platform, city, user cohort, funnel step\nStep 3: Why there? → Hypothesis generation and testing\n\n**First 5 Analyses:**\n1. Pipeline health check: row counts in events table, any gaps? Recent schema changes?\n2. Funnel breakdown: which step dropped? App open → browse → cart → checkout → order. Is it top-of-funnel (fewer people browsing) or bottom (cart abandonment)?\n3. Segment by platform (iOS/Android/web), city tier, new vs returning users — is the drop uniform or concentrated?\n4. External factors: was there a major sporting event, holiday, or extreme weather in top cities?\n5. Recent changes: any app deploys Friday/Saturday? A/B test ramped up? Pricing algorithm change?\n\n**Hypotheses (ranked by likelihood):**\n1. App deploy broke something in checkout flow (most common cause of sudden drops)\n2. Pricing/delivery fee increase reduced conversion at checkout\n3. Supply issue — fewer dashers available → longer ETAs → users abandon\n4. External event (Super Bowl, major holiday) changed user behavior\n5. Data pipeline issue — events not logging correctly, inflating denominator\n\n**Distinguishing Real vs Data Issue:**\n- Check if revenue also dropped proportionally (revenue is tracked independently)\n- Compare app store data (if available) with internal DAU\n- Look for impossible values: zero orders in a major city = likely data issue\n\n**EOD Presentation to VP:**\nStructure: "Here's what we know, what we suspect, and what we're doing."\n- The drop is real / a data issue (confirm first)\n- It's concentrated in [segment] at [funnel step]\n- Most likely cause is X based on evidence Y\n- We're investigating Z to confirm\n- Recommended immediate action: [rollback deploy / monitor for another day / escalate to eng]\n\n**Immediate Actions:**\n- If deploy-related: rollback immediately, measure recovery\n- If pricing: A/B test reverting pricing change\n- If supply: alert operations team to dasher incentives\n- If data: fix pipeline, recalculate metric, send correction to stakeholders`,
            rubric: [
              "Structured framework (not just ad hoc guessing)",
              "Checks data quality FIRST before investigating",
              "Segments the drop meaningfully",
              "Considers external factors",
              "Hypotheses are ranked by likelihood",
              "Distinguishes between real drop and data issue",
              "EOD presentation is structured even with uncertainty",
              "Actionable recommendations tied to root causes"
            ],
            tags: ["metric-investigation", "debugging", "product-analytics", "stakeholder-communication"]
          },
          {
            id: "bc3",
            title: "Should We Build or Buy?",
            difficulty: "Medium",
            company: "Stripe",
            type: "open-ended",
            prompt: `Your company's data team (6 people) currently uses a patchwork of Python scripts and cron jobs for ML model monitoring. Models occasionally drift and nobody notices for weeks. The head of engineering asks you to evaluate whether to build an internal monitoring system or buy a vendor solution (e.g., Evidently, WhyLabs, Arize).\n\nPresent your analysis:\n1. What criteria would you use to make this decision?\n2. Build a comparison framework\n3. What hidden costs exist in each option?\n4. What would you recommend and why?\n5. How would you present this to a non-technical executive?`,
            hints: [
              "Total cost of ownership includes maintenance, not just build cost",
              "Consider the team's size — can 6 people maintain a custom system?",
              "Vendor lock-in is a real cost, but so is building something nobody maintains",
              "The exec cares about risk and speed, not technical details"
            ],
            modelAnswer: `**Decision Criteria:**\n1. Total cost of ownership (3-year horizon)\n2. Time to value (how quickly does it solve the drift problem?)\n3. Maintenance burden relative to team capacity\n4. Customizability for our specific model types\n5. Integration with existing stack (Airflow, MLflow, Slack)\n6. Scalability as model count grows\n\n**Comparison Framework:**\n\n| Factor | Build | Buy (e.g., Evidently Cloud) |\n|--------|-------|-----------------------------|\n| Time to value | 3-6 months | 2-4 weeks |\n| Upfront cost | 2 engineers × 3 months = ~$150K | ~$30-60K/year |\n| Annual maintenance | 0.5-1 FTE (~$80K) | Near zero (vendor maintains) |\n| 3-year TCO | $390K+ | $90-180K |\n| Customization | Unlimited | Limited to vendor's API |\n| Team learning | High (deep understanding) | Low (it just works) |\n\n**Hidden Costs:**\n- Build: Documentation, onboarding new team members, handling edge cases you didn't anticipate, opportunity cost (what else could those engineers build?)\n- Buy: Vendor lock-in, potential data egress costs, customization limits may require workarounds, dependency on vendor's roadmap and uptime\n\n**Recommendation: BUY, with caveats**\nWith 6 people, you can't afford to dedicate 2 engineers for 3+ months AND maintain the system afterward. The drift problem is costing you NOW (models degrading for weeks). Buy gets you monitoring in weeks, not months.\n\nCaveats: negotiate a short initial contract (1 year), ensure data export capability, and build thin integration wrappers so you could switch vendors later.\n\n**Executive Pitch:**\n"Our models silently degrade, costing us [estimated revenue impact]. We can fix this in 2 weeks for $50K/year, or build a custom solution in 6 months that would take one engineer to maintain permanently. Given our team size, I recommend buying and redirecting engineering time to [higher-impact project]."`,
            rubric: [
              "Clear decision criteria (not just cost)",
              "Quantified comparison (time, money, people)",
              "Identifies hidden costs for both options",
              "Recommendation considers team capacity constraints",
              "Addresses risk mitigation (vendor lock-in, exit strategy)",
              "Executive summary is non-technical and outcome-focused",
              "Considers opportunity cost of engineering time"
            ],
            tags: ["build-vs-buy", "decision-frameworks", "stakeholder-communication", "team-management"]
          }
        ]
      },
      "experiment-design": {
        label: "Experiment Design",
        questions: [
          {
            id: "ed1",
            title: "A/B Test Gone Wrong",
            difficulty: "Hard",
            company: "Netflix",
            type: "open-ended",
            prompt: `Netflix ran an A/B test on a new recommendation algorithm. After 2 weeks:\n- Treatment group: +5% click-through rate on recommendations\n- Treatment group: -3% overall viewing hours\n- Treatment group: +8% number of titles started\n- The test is statistically significant on all metrics (p < 0.01)\n\nThe PM wants to ship it because CTR is up. The content team is worried because viewing hours are down.\n\n1. How do you interpret these seemingly contradictory results?\n2. What additional analyses would you run?\n3. What's your recommendation — ship, iterate, or kill?\n4. How do you align the PM and content team?\n5. What does this tell you about metric selection for recommendation systems?`,
            hints: [
              "More clicks + more titles started + less total viewing = shorter sessions per title",
              "This could be a 'clickbait' pattern — recommendations are enticing but unsatisfying",
              "Look at completion rates and long-term retention",
              "The PM and content team optimize for different things — both might be right"
            ],
            modelAnswer: `**Interpretation:**\nThe new algorithm is optimizing for engagement (clicks, starts) at the expense of satisfaction (viewing hours). Users are clicking more recommendations and sampling more titles, but watching each for less time. This is the classic "clickbait trap" — enticing thumbnails/titles that don't deliver.\n\nAlternatively: the algorithm could be surfacing shorter content (episodes vs movies), which would explain more starts with fewer hours without being negative.\n\n**Additional Analyses:**\n1. Completion rate: what % of started titles are watched to >70%? If it dropped, that's a red flag.\n2. Content type mix: is the algorithm favoring shorter content?\n3. Session depth: are users churning faster within sessions?\n4. 30-day retention: are treatment users coming back less? (2 weeks may be too short)\n5. User satisfaction survey scores (if available)\n6. Segment analysis: does the pattern hold across heavy vs. light users?\n\n**Recommendation: DO NOT SHIP. Extend the test.**\nRun for 4 more weeks to see retention impact. If completion rates are down, the algorithm is trading short-term engagement for long-term satisfaction — this will hurt retention.\n\nIf completion rates are stable and it's just a content-mix shift, then the results may be fine.\n\n**Aligning PM and Content Team:**\nFrame it as: "We both want engaged, retained users. CTR tells us the recommendation is attractive. Viewing hours tell us whether it delivered. Let's measure both and add completion rate as the tiebreaker. I'll have the extended analysis in 4 weeks."\n\n**Lesson on Metrics:**\nNo single metric captures recommendation quality. A good framework:\n- Leading: CTR, start rate (attraction)\n- Lagging: completion rate, viewing hours (satisfaction)\n- North Star: monthly retention (long-term value)\n\nOptimize for the lagging metrics, use leading metrics as diagnostics.`,
            rubric: [
              "Identifies the clickbait / engagement-vs-satisfaction tension",
              "Considers alternative explanations (content mix)",
              "Proposes additional analyses that would resolve ambiguity",
              "Doesn't rush to ship or kill — wants more data",
              "Stakeholder alignment is collaborative, not adversarial",
              "Metric framework distinguishes leading vs lagging indicators",
              "Considers long-term retention as the ultimate metric"
            ],
            tags: ["ab-testing", "metrics", "experimentation", "product-thinking", "recommendation-systems"]
          }
        ]
      }
    }
  },
  "ai-tooling": {
    label: "AI Tooling & Prompt Engineering",
    icon: "🤖",
    color: "#10B981",
    subcategories: {
      "prompt-engineering": {
        label: "Prompt Engineering",
        questions: [
          {
            id: "ai1",
            title: "Building a Data Quality Classifier",
            difficulty: "Medium",
            company: "Anthropic",
            type: "open-ended",
            prompt: `Your team receives CSVs from 50+ partner companies. Data quality varies wildly — some files have encoding issues, inconsistent date formats, missing required fields, and mislabeled columns.\n\nYou want to use Claude to build an automated data quality classifier that:\n- Reads a sample of the CSV (first 100 rows)\n- Classifies quality as: clean, minor_issues, major_issues, unusable\n- Provides specific issues found with row/column references\n- Suggests fixes for each issue\n- Outputs a structured JSON report\n\n1. Write the system prompt you'd use\n2. How would you structure the few-shot examples?\n3. How would you handle the CSV data in the prompt (token efficiency)?\n4. How would you validate the LLM's output?\n5. What's your fallback strategy when the LLM misclassifies?`,
            hints: [
              "System prompts should define the output schema explicitly",
              "Few-shot examples should cover edge cases, not just happy paths",
              "You don't need to send all 100 rows — sample strategically",
              "Structured output validation catches most LLM errors"
            ],
            modelAnswer: `**System Prompt:**\n\`\`\`\nYou are a data quality analyst. Given a CSV sample, classify its quality and identify specific issues.\n\nOutput ONLY valid JSON matching this schema:\n{\n  "classification": "clean|minor_issues|major_issues|unusable",\n  "confidence": 0.0-1.0,\n  "issues": [\n    {\n      "type": "missing_values|encoding|date_format|type_mismatch|duplicate|schema",\n      "severity": "low|medium|high|critical",\n      "location": {"rows": [1,5,12], "column": "email"},\n      "description": "...",\n      "suggested_fix": "..."\n    }\n  ],\n  "summary": "One sentence overall assessment",\n  "row_count_analyzed": 100,\n  "issue_count": 5\n}\n\nClassification criteria:\n- clean: <2% rows with issues, no schema problems\n- minor_issues: 2-10% rows with issues, all fixable automatically\n- major_issues: >10% rows with issues OR schema problems requiring manual review\n- unusable: >50% rows corrupted OR missing required columns entirely\n\`\`\`\n\n**Few-Shot Structure (3 examples):**\n1. Clean file — shows expected output for good data (baseline)\n2. File with mixed issues — dates in 3 formats, 5% nulls, one encoding issue (demonstrates multi-issue detection)\n3. Unusable file — wrong delimiter, garbled encoding, missing headers (shows the extreme case)\n\n**Token Efficiency:**\n- Send first 10 rows + a random sample of 20 rows (not all 100)\n- Include column headers and data types inferred from pandas\n- Pre-compute summary stats (null counts, unique counts) and include as metadata\n- This reduces token usage by ~70% while maintaining detection accuracy\n\n**Output Validation:**\n1. Parse JSON with try/catch — retry with "Output valid JSON only" if parsing fails\n2. Validate against schema (classification is one of 4 values, severity is valid, etc.)\n3. Spot-check: verify at least one referenced row/column issue exists in the actual data\n4. Confidence calibration: if confidence < 0.7, flag for human review\n\n**Fallback Strategy:**\n- Rule-based pre-classifier runs first (checks null rates, encoding, schema)\n- LLM adds nuance (detects semantic issues, mislabeled columns, business logic violations)\n- If LLM and rules disagree: rules win on structural issues, LLM wins on semantic issues\n- Log all disagreements for weekly review and prompt refinement`,
            rubric: [
              "System prompt defines output schema explicitly",
              "Classification criteria are quantified, not vague",
              "Few-shot examples cover clean, mixed, and unusable cases",
              "Token efficiency strategy is practical",
              "Output validation includes JSON parsing + schema checks",
              "Spot-checks LLM claims against actual data",
              "Fallback combines rule-based and LLM approaches",
              "Iterative improvement process (logging disagreements)"
            ],
            tags: ["prompt-engineering", "LLM-applications", "data-quality", "automation"]
          },
          {
            id: "ai2",
            title: "Claude Code for Data Pipeline Development",
            difficulty: "Easy",
            company: "Startup",
            type: "open-ended",
            prompt: `You've just joined a startup as the first data hire. There's no data infrastructure — just a PostgreSQL database and a Google Sheets the CEO updates manually.\n\nYou want to use Claude Code to rapidly build out the initial data stack. Describe your approach for using Claude Code to:\n\n1. Scaffold an Airflow project with your first 3 DAGs\n2. Write and test dbt models for the core business metrics\n3. Create a data validation framework\n4. Set up a basic dashboard\n\nFor each task:\n- What would your Claude Code prompt look like?\n- What context would you provide?\n- How would you review and iterate on the output?\n- What are the risks of AI-generated data code?`,
            hints: [
              "Claude Code works best with specific context about your schema and business logic",
              "Always review generated SQL against sample data",
              "AI-generated pipelines need the same testing as human-written ones",
              "The risk isn't that the code doesn't work — it's that it works but is wrong"
            ],
            modelAnswer: `**Task 1: Airflow Scaffold**\n\nClaude Code prompt approach:\n"I need an Airflow project structure for a small startup. Our source is PostgreSQL (tables: users, orders, products, events). Create 3 DAGs:\n1. Daily ELT: extract from Postgres → load to warehouse staging tables\n2. dbt runner: triggers dbt after ELT completes\n3. Data quality checks: run after dbt, alert on failures\n\nUse Airflow 2.x TaskFlow API. Include error handling, retries, and Slack alerting."\n\nContext to provide: database schema DDL, sample data, existing credentials setup.\n\nReview process: Check DAG dependencies, verify SQL extraction queries against actual tables, test failure paths manually.\n\n**Task 2: dbt Models**\n\nPrompt: Share the actual schema.yml and 5-10 sample rows from each table. Ask Claude Code to build:\n- Staging models (1:1 with source tables, type casting, renaming)\n- Intermediate models (joined/enriched)\n- Marts (business metrics: daily revenue, user cohorts, product performance)\n\nReview: Run dbt against dev with a subset of data, compare output to manual calculations in a spreadsheet for the first week.\n\n**Task 3: Data Validation**\n\nPrompt: "Build a Great Expectations suite for our core tables. Check: no null primary keys, amounts are positive, dates are within reasonable ranges, referential integrity between orders and users."\n\nReview: Intentionally introduce bad data to verify checks catch it.\n\n**Task 4: Dashboard**\n\nPrompt: Use Claude Code to generate a Streamlit dashboard or Metabase setup script. Provide the mart schemas and specify 5 key charts the CEO needs.\n\nReview: Show to CEO, iterate based on "I also want to see X" feedback.\n\n**Risks of AI-Generated Data Code:**\n1. Silently wrong joins (duplicating rows without you noticing)\n2. Timezone handling errors (UTC vs local)\n3. Incorrect aggregation logic that looks plausible\n4. Missing edge cases (nulls, duplicates, late-arriving data)\n5. Security: generated code might hardcode credentials\n\n**Mitigation:** Always test with known data where you can manually verify the answer. Never trust generated SQL until you've validated output counts and key metrics against a source of truth.`,
            rubric: [
              "Prompts include specific schema context, not vague requests",
              "Review process involves testing against real data",
              "Iterative approach (not one-shot generation)",
              "Identifies specific risks of AI-generated data code",
              "Mitigation strategies are practical",
              "Appropriate tool selection for startup context",
              "Considers the human review step as essential, not optional"
            ],
            tags: ["claude-code", "AI-tooling", "data-engineering", "dbt", "airflow", "productivity"]
          },
          {
            id: "ai3",
            title: "LLM Evaluation Pipeline",
            difficulty: "Hard",
            company: "Anthropic",
            type: "open-ended",
            prompt: `Your team has built an LLM-powered feature that generates SQL queries from natural language questions (text-to-SQL). You need to evaluate whether it's production-ready.\n\nDesign the evaluation pipeline:\n1. What evaluation metrics would you use?\n2. How would you build the test dataset?\n3. How do you handle queries with multiple valid SQL translations?\n4. What's your threshold for "production ready"?\n5. How would you monitor quality post-deployment?\n6. How would you handle failure modes gracefully?`,
            hints: [
              "Execution accuracy (does it return the right answer?) matters more than exact SQL match",
              "Test data should include easy, medium, and adversarial queries",
              "Multiple valid SQLs is a feature — use execution-based evaluation",
              "Production readiness isn't just accuracy — it's also latency, cost, and failure handling"
            ],
            modelAnswer: `**Evaluation Metrics:**\n1. Execution accuracy: Does the generated SQL return the correct result set? (Primary metric)\n2. Exact match accuracy: Does the SQL match the reference exactly? (Secondary, stricter)\n3. Valid SQL rate: Does it produce syntactically valid SQL? (Minimum bar)\n4. Latency: P50, P95 generation time\n5. Cost per query: Token usage\n6. Graceful failure rate: When it can't answer, does it say so vs hallucinating?\n\n**Test Dataset Construction:**\n- 500 question-SQL pairs across difficulty levels:\n  - Easy (40%): single table, simple WHERE, basic aggregation\n  - Medium (35%): joins, subqueries, window functions\n  - Hard (15%): complex CTEs, ambiguous questions, edge cases\n  - Adversarial (10%): unanswerable questions, SQL injection attempts, schema-confusing queries\n- Source: adapt existing benchmarks (Spider, WikiSQL) + create company-specific queries from real user questions\n- Each question has the expected result set, not just reference SQL\n\n**Handling Multiple Valid SQLs:**\nExecution-based evaluation: run both generated and reference SQL against a test database, compare result sets (order-agnostic). Two queries that return identical results are both correct, regardless of syntax differences.\n\nFor partial matches: use result set similarity (Jaccard on rows) as a soft metric.\n\n**Production Readiness Threshold:**\n- Valid SQL rate: >99%\n- Execution accuracy (easy): >95%\n- Execution accuracy (medium): >85%\n- Execution accuracy (hard): >70%\n- Adversarial handling: >90% correctly refuses or caveats\n- P95 latency: <3s\n- Graceful failure: never returns wrong results silently — must flag uncertainty\n\n**Post-Deployment Monitoring:**\n- Shadow mode: run LLM SQL alongside existing manual process, compare\n- User feedback loop: thumbs up/down on results\n- Automated: run generated queries in sandboxed env, check for empty results, timeouts, errors\n- Weekly review: sample 50 queries, human-grade accuracy\n- Drift detection: track accuracy on held-out test set monthly\n\n**Failure Modes & Handling:**\n- Invalid SQL → catch error, show "I couldn't generate a query for that" + suggest rephrasing\n- Timeout → cancel query, return cached/approximate result if available\n- Uncertain → return SQL with confidence score, require user confirmation before execution\n- Schema change → version test suite, re-evaluate on deploy`,
            rubric: [
              "Execution accuracy as primary metric (not just SQL matching)",
              "Test dataset covers difficulty spectrum including adversarial",
              "Execution-based evaluation for multiple valid SQLs",
              "Specific numeric thresholds for production readiness",
              "Post-deployment monitoring plan",
              "Graceful failure handling (never fails silently)",
              "Human-in-the-loop for quality maintenance",
              "Considers latency and cost, not just accuracy"
            ],
            tags: ["LLM-evaluation", "text-to-SQL", "ML-ops", "monitoring", "production-ML"]
          }
        ]
      }
    }
  }
};

// ─── STYLES ──────────────────────────────────────────────────────────────────
const fonts = `
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
`;

// ─── APP COMPONENT ───────────────────────────────────────────────────────────
export default function DataSparkApp() {
  const [view, setView] = useState("home"); // home, category, question, results
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [showHints, setShowHints] = useState(false);
  const [hintsRevealed, setHintsRevealed] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [aiEvaluation, setAiEvaluation] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [completedQuestions, setCompletedQuestions] = useState({});
  const [activeTab, setActiveTab] = useState("prompt");
  const [timerActive, setTimerActive] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("All");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (timerActive) {
      timerRef.current = setInterval(() => setTimerSeconds(s => s + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [timerActive]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const totalQuestions = Object.values(QUESTIONS).reduce((acc, cat) => {
    return acc + Object.values(cat.subcategories).reduce((a, sub) => a + sub.questions.length, 0);
  }, 0);

  const completedCount = Object.keys(completedQuestions).length;

  const handleStartQuestion = (q) => {
    setSelectedQuestion(q);
    setUserAnswer("");
    setShowHints(false);
    setHintsRevealed(0);
    setShowResults(false);
    setAiEvaluation(null);
    setActiveTab("prompt");
    setTimerSeconds(0);
    setTimerActive(true);
    setView("question");
  };

  const handleSubmitAnswer = async () => {
    setTimerActive(false);
    setIsEvaluating(true);
    setShowResults(true);
    setActiveTab("model-answer");

    // Simulate AI evaluation
    await new Promise(r => setTimeout(r, 1500));

    const rubricScores = selectedQuestion.rubric.map(criterion => ({
      criterion,
      met: Math.random() > 0.35,
    }));

    const score = Math.round((rubricScores.filter(r => r.met).length / rubricScores.length) * 100);
    const totalScore = score >= 80 ? "Excellent" : score >= 60 ? "Good" : score >= 40 ? "Needs Work" : "Review Required";

    setAiEvaluation({
      score,
      totalScore,
      rubricScores,
      feedback: score >= 80
        ? "Strong answer that demonstrates solid understanding of the problem and its constraints. You covered the key points and showed good reasoning."
        : score >= 60
        ? "Good foundation. You addressed the main requirements but missed some important considerations. Review the model answer for areas to strengthen."
        : "Your answer shows you understand the basics but needs more depth. Focus on the rubric points you missed and study the model answer carefully.",
      timeSpent: timerSeconds,
    });

    setCompletedQuestions(prev => ({ ...prev, [selectedQuestion.id]: { score, time: timerSeconds } }));
    setIsEvaluating(false);
  };

  const getAllQuestions = () => {
    const all = [];
    Object.entries(QUESTIONS).forEach(([catKey, cat]) => {
      Object.entries(cat.subcategories).forEach(([subKey, sub]) => {
        sub.questions.forEach(q => {
          all.push({ ...q, categoryKey: catKey, categoryLabel: cat.label, subcategoryLabel: sub.label, color: cat.color });
        });
      });
    });
    return all;
  };

  const getFilteredQuestions = (subcatQuestions) => {
    let filtered = subcatQuestions || [];
    if (difficultyFilter !== "All") {
      filtered = filtered.filter(q => q.difficulty === difficultyFilter);
    }
    if (searchQuery) {
      const sq = searchQuery.toLowerCase();
      filtered = filtered.filter(q =>
        q.title.toLowerCase().includes(sq) ||
        q.prompt.toLowerCase().includes(sq) ||
        q.tags.some(t => t.toLowerCase().includes(sq))
      );
    }
    return filtered;
  };

  // ─── RENDER FUNCTIONS ──────────────────────────────────────────────────────

  const renderDifficultyBadge = (d) => {
    const colors = { Easy: "#10B981", Medium: "#F59E0B", Hard: "#EF4444" };
    return (
      <span style={{
        background: colors[d] + "18",
        color: colors[d],
        padding: "3px 10px",
        borderRadius: "20px",
        fontSize: "11px",
        fontWeight: 700,
        letterSpacing: "0.5px",
        textTransform: "uppercase",
        border: `1px solid ${colors[d]}30`,
      }}>{d}</span>
    );
  };

  const renderHome = () => (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
      {/* Hero */}
      <div style={{
        textAlign: "center",
        padding: "60px 0 50px",
      }}>
        <div style={{
          display: "inline-block",
          background: "linear-gradient(135deg, #0EA5E9 0%, #8B5CF6 50%, #F59E0B 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          fontSize: 56,
          fontWeight: 900,
          letterSpacing: "-2px",
          lineHeight: 1.1,
          fontFamily: "'Outfit', sans-serif",
        }}>
          DataSpark
        </div>
        <div style={{
          color: "#94A3B8",
          fontSize: 13,
          fontWeight: 600,
          letterSpacing: "4px",
          textTransform: "uppercase",
          marginTop: 8,
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          Interview Prep That Goes Deeper
        </div>
        <p style={{
          color: "#CBD5E1",
          fontSize: 17,
          maxWidth: 620,
          margin: "20px auto 0",
          lineHeight: 1.65,
          fontFamily: "'Outfit', sans-serif",
          fontWeight: 300,
        }}>
          Go beyond syntax drills. Master the architecture decisions, business thinking,
          and AI tooling skills that actually get asked in data science interviews.
        </p>

        {/* Stats bar */}
        <div style={{
          display: "flex",
          justifyContent: "center",
          gap: 40,
          marginTop: 36,
          padding: "20px 0",
          borderTop: "1px solid #1E293B",
          borderBottom: "1px solid #1E293B",
        }}>
          {[
            { n: totalQuestions, l: "Questions" },
            { n: "4", l: "Categories" },
            { n: completedCount, l: "Completed" },
            { n: completedCount > 0 ? Math.round(Object.values(completedQuestions).reduce((a, b) => a + b.score, 0) / completedCount) + "%" : "—", l: "Avg Score" }
          ].map((s, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#F8FAFC", fontFamily: "'Outfit', sans-serif" }}>{s.n}</div>
              <div style={{ fontSize: 11, color: "#64748B", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace" }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Category Cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(260, 1fr))",
        gap: 16,
        marginBottom: 50,
      }}>
        {Object.entries(QUESTIONS).map(([key, cat]) => {
          const qCount = Object.values(cat.subcategories).reduce((a, s) => a + s.questions.length, 0);
          const doneCount = Object.values(cat.subcategories).reduce((a, s) => {
            return a + s.questions.filter(q => completedQuestions[q.id]).length;
          }, 0);

          return (
            <div
              key={key}
              onClick={() => { setSelectedCategory(key); setView("category"); }}
              aria-label={`Open ${cat.label} category`}
              role="button"
              tabIndex={0}
              onKeyDown={e => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setSelectedCategory(key);
                  setView("category");
                }
              }}
              style={{
                background: "#0F172A",
                border: "1px solid #1E293B",
                borderRadius: 16,
                padding: "28px 24px",
                cursor: "pointer",
                transition: "all 0.2s",
                position: "relative",
                overflow: "hidden",
                textAlign: "left",
                color: "inherit",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = cat.color + "60";
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = `0 8px 30px ${cat.color}15`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = "#1E293B";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 3,
                background: `linear-gradient(90deg, ${cat.color}, ${cat.color}40)`,
              }} />

              <div style={{ fontSize: 32, marginBottom: 12 }}>{cat.icon}</div>
              <div style={{
                fontSize: 18,
                fontWeight: 700,
                color: "#F8FAFC",
                marginBottom: 6,
                fontFamily: "'Outfit', sans-serif",
              }}>{cat.label}</div>
              <div style={{
                fontSize: 12,
                color: "#64748B",
                fontFamily: "'JetBrains Mono', monospace",
                marginBottom: 16,
              }}>
                {qCount} questions · {Object.keys(cat.subcategories).length} topics
              </div>

              {/* Progress bar */}
              <div style={{
                background: "#1E293B",
                borderRadius: 4,
                height: 4,
                overflow: "hidden",
              }}>
                <div style={{
                  width: `${qCount > 0 ? (doneCount / qCount) * 100 : 0}%`,
                  height: "100%",
                  background: cat.color,
                  borderRadius: 4,
                  transition: "width 0.3s",
                }} />
              </div>
              <div style={{
                fontSize: 11,
                color: "#475569",
                marginTop: 6,
                fontFamily: "'JetBrains Mono', monospace",
              }}>
                {doneCount}/{qCount} completed
              </div>

              {/* Subcategory pills */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 14 }}>
                {Object.values(cat.subcategories).map((sub, i) => (
                  <span key={i} style={{
                    fontSize: 10,
                    padding: "3px 8px",
                    borderRadius: 6,
                    background: "#1E293B",
                    color: "#94A3B8",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}>{sub.label}</span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent / Quick Start */}
      <div style={{ marginBottom: 60 }}>
        <h2 style={{
          fontSize: 20,
          fontWeight: 700,
          color: "#F8FAFC",
          fontFamily: "'Outfit', sans-serif",
          marginBottom: 16,
        }}>Quick Start — Try a Question</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {getAllQuestions().slice(0, 5).map(q => (
            <div
              key={q.id}
              onClick={() => handleStartQuestion(q)}
              aria-label={`Start question: ${q.title}`}
              role="button"
              tabIndex={0}
              onKeyDown={e => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleStartQuestion(q);
                }
              }}
              style={{
                background: "#0F172A",
                border: "1px solid #1E293B",
                borderRadius: 10,
                padding: "14px 20px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                transition: "border-color 0.2s",
                textAlign: "left",
                color: "inherit",
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = q.color + "50"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "#1E293B"}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: completedQuestions[q.id] ? "#10B981" : q.color,
                  flexShrink: 0,
                }} />
                <div>
                  <div style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#F8FAFC",
                    fontFamily: "'Outfit', sans-serif",
                  }}>{q.title}</div>
                  <div style={{
                    fontSize: 11,
                    color: "#64748B",
                    fontFamily: "'JetBrains Mono', monospace",
                    marginTop: 2,
                  }}>{q.categoryLabel} · {q.company}</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {renderDifficultyBadge(q.difficulty)}
                {completedQuestions[q.id] && (
                  <span style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#10B981",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}>{completedQuestions[q.id].score}%</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderCategory = () => {
    const cat = QUESTIONS[selectedCategory];
    if (!cat) return null;

    return (
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 24px" }}>
        {/* Back nav */}
        <button
          onClick={() => setView("home")}
          style={{
            background: "none",
            border: "none",
            color: "#64748B",
            fontSize: 13,
            cursor: "pointer",
            padding: "24px 0 12px",
            fontFamily: "'JetBrains Mono', monospace",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          ← Back to Dashboard
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 30 }}>
          <span style={{ fontSize: 40 }}>{cat.icon}</span>
          <div>
            <h1 style={{
              fontSize: 32,
              fontWeight: 800,
              color: "#F8FAFC",
              fontFamily: "'Outfit', sans-serif",
              margin: 0,
            }}>{cat.label}</h1>
          </div>
        </div>

        {/* Filters */}
        <div style={{
          display: "flex",
          gap: 10,
          marginBottom: 24,
          alignItems: "center",
          flexWrap: "wrap",
        }}>
          <input
            type="text"
            placeholder="Search questions..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              background: "#0F172A",
              border: "1px solid #1E293B",
              borderRadius: 8,
              padding: "8px 14px",
              color: "#F8FAFC",
              fontSize: 13,
              fontFamily: "'JetBrains Mono', monospace",
              width: 260,
              outline: "none",
            }}
          />
          {["All", "Easy", "Medium", "Hard"].map(d => (
            <button
              key={d}
              onClick={() => setDifficultyFilter(d)}
              style={{
                background: difficultyFilter === d ? "#1E293B" : "transparent",
                border: `1px solid ${difficultyFilter === d ? "#334155" : "#1E293B"}`,
                borderRadius: 6,
                padding: "6px 14px",
                color: difficultyFilter === d ? "#F8FAFC" : "#64748B",
                fontSize: 12,
                cursor: "pointer",
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 600,
              }}
            >{d}</button>
          ))}
        </div>

        {/* Subcategories */}
        {Object.entries(cat.subcategories).map(([subKey, sub]) => {
          const filtered = getFilteredQuestions(sub.questions);
          if (filtered.length === 0) return null;

          return (
            <div key={subKey} style={{ marginBottom: 36 }}>
              <h3 style={{
                fontSize: 16,
                fontWeight: 700,
                color: cat.color,
                fontFamily: "'Outfit', sans-serif",
                marginBottom: 12,
                paddingBottom: 8,
                borderBottom: `1px solid ${cat.color}20`,
              }}>{sub.label}</h3>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {filtered.map(q => (
                  <div
                    key={q.id}
                    onClick={() => handleStartQuestion(q)}
                    aria-label={`Start question: ${q.title}`}
                    role="button"
                    tabIndex={0}
                    onKeyDown={e => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleStartQuestion(q);
                      }
                    }}
                    style={{
                      background: "#0F172A",
                      border: "1px solid #1E293B",
                      borderRadius: 10,
                      padding: "16px 20px",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      textAlign: "left",
                      color: "inherit",
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = cat.color + "40";
                      e.currentTarget.style.background = "#0F172A";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = "#1E293B";
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                          <div style={{
                            width: 8, height: 8, borderRadius: "50%",
                            background: completedQuestions[q.id] ? "#10B981" : "#334155",
                            flexShrink: 0,
                          }} />
                          <span style={{
                            fontSize: 15,
                            fontWeight: 600,
                            color: "#F8FAFC",
                            fontFamily: "'Outfit', sans-serif",
                          }}>{q.title}</span>
                        </div>
                        <div style={{
                          display: "flex",
                          gap: 8,
                          marginLeft: 18,
                          flexWrap: "wrap",
                        }}>
                          <span style={{
                            fontSize: 11,
                            color: "#64748B",
                            fontFamily: "'JetBrains Mono', monospace",
                          }}>{q.company}</span>
                          <span style={{ color: "#334155" }}>·</span>
                          <span style={{
                            fontSize: 11,
                            color: "#64748B",
                            fontFamily: "'JetBrains Mono', monospace",
                          }}>{q.type === "code" ? `${q.language.toUpperCase()} coding` : "Open-ended"}</span>
                        </div>
                        <div style={{ display: "flex", gap: 5, marginTop: 8, marginLeft: 18, flexWrap: "wrap" }}>
                          {q.tags.slice(0, 4).map(t => (
                            <span key={t} style={{
                              fontSize: 10,
                              padding: "2px 7px",
                              borderRadius: 4,
                              background: "#1E293B",
                              color: "#94A3B8",
                              fontFamily: "'JetBrains Mono', monospace",
                            }}>{t}</span>
                          ))}
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                        {completedQuestions[q.id] && (
                          <span style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: completedQuestions[q.id].score >= 80 ? "#10B981" : completedQuestions[q.id].score >= 60 ? "#F59E0B" : "#EF4444",
                            fontFamily: "'JetBrains Mono', monospace",
                          }}>{completedQuestions[q.id].score}%</span>
                        )}
                        {renderDifficultyBadge(q.difficulty)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderQuestion = () => {
    const q = selectedQuestion;
    if (!q) return null;

    return (
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>
        {/* Top bar */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 0",
          borderBottom: "1px solid #1E293B",
          marginBottom: 24,
        }}>
          <button
            onClick={() => {
              setTimerActive(false);
              setView(selectedCategory ? "category" : "home");
            }}
            style={{
              background: "none",
              border: "none",
              color: "#64748B",
              fontSize: 13,
              cursor: "pointer",
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            ← Back
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {/* Timer */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: timerActive ? "#0F172A" : "#1E293B",
              border: `1px solid ${timerActive ? "#0EA5E9" + "40" : "#334155"}`,
              borderRadius: 8,
              padding: "6px 14px",
            }}>
              <div style={{
                width: 6, height: 6, borderRadius: "50%",
                background: timerActive ? "#0EA5E9" : "#475569",
                animation: timerActive ? "pulse 1.5s infinite" : "none",
              }} />
              <span style={{
                fontSize: 14,
                fontWeight: 600,
                color: "#F8FAFC",
                fontFamily: "'JetBrains Mono', monospace",
              }}>{formatTime(timerSeconds)}</span>
            </div>
            {renderDifficultyBadge(q.difficulty)}
          </div>
        </div>

        {/* Question header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{
            fontSize: 11,
            color: "#64748B",
            fontFamily: "'JetBrains Mono', monospace",
            marginBottom: 6,
            textTransform: "uppercase",
            letterSpacing: "1px",
          }}>
            {q.company} · {q.type === "code" ? q.language.toUpperCase() : "Case Study"}
          </div>
          <h1 style={{
            fontSize: 28,
            fontWeight: 800,
            color: "#F8FAFC",
            fontFamily: "'Outfit', sans-serif",
            margin: 0,
          }}>{q.title}</h1>
          <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
            {q.tags.map(t => (
              <span key={t} style={{
                fontSize: 10,
                padding: "3px 8px",
                borderRadius: 5,
                background: "#1E293B",
                color: "#94A3B8",
                fontFamily: "'JetBrains Mono', monospace",
              }}>{t}</span>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          display: "flex",
          gap: 0,
          borderBottom: "1px solid #1E293B",
          marginBottom: 24,
        }}>
          {[
            { id: "prompt", label: "Problem" },
            { id: "answer", label: "Your Answer" },
            ...(showResults ? [
              { id: "model-answer", label: "Model Answer" },
              { id: "evaluation", label: "AI Evaluation" }
            ] : []),
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: "none",
                border: "none",
                borderBottom: activeTab === tab.id ? "2px solid #0EA5E9" : "2px solid transparent",
                padding: "10px 20px",
                color: activeTab === tab.id ? "#F8FAFC" : "#64748B",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "'Outfit', sans-serif",
                transition: "all 0.2s",
              }}
            >{tab.label}</button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === "prompt" && (
          <div>
            <div style={{
              background: "#0F172A",
              border: "1px solid #1E293B",
              borderRadius: 12,
              padding: "24px 28px",
              fontSize: 14,
              color: "#CBD5E1",
              lineHeight: 1.75,
              fontFamily: "'Outfit', sans-serif",
              whiteSpace: "pre-wrap",
            }}>
              {q.prompt}
            </div>

            {/* Hints */}
            <div style={{ marginTop: 20 }}>
              <button
                onClick={() => {
                  setShowHints(true);
                  if (hintsRevealed < q.hints.length) setHintsRevealed(h => h + 1);
                }}
                style={{
                  background: "#1E293B",
                  border: "1px solid #334155",
                  borderRadius: 8,
                  padding: "8px 16px",
                  color: "#F59E0B",
                  fontSize: 12,
                  cursor: "pointer",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 600,
                }}
              >
                {!showHints ? `Show Hint (${q.hints.length} available)` : hintsRevealed < q.hints.length ? `Next Hint (${hintsRevealed}/${q.hints.length})` : "All hints revealed"}
              </button>

              {showHints && (
                <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                  {q.hints.slice(0, hintsRevealed).map((h, i) => (
                    <div key={i} style={{
                      background: "#F59E0B10",
                      border: "1px solid #F59E0B20",
                      borderRadius: 8,
                      padding: "10px 16px",
                      fontSize: 13,
                      color: "#FCD34D",
                      fontFamily: "'Outfit', sans-serif",
                    }}>
                      <span style={{ fontWeight: 700, marginRight: 8 }}>Hint {i + 1}:</span>{h}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ marginTop: 20, textAlign: "center" }}>
              <button
                onClick={() => setActiveTab("answer")}
                style={{
                  background: "linear-gradient(135deg, #0EA5E9, #8B5CF6)",
                  border: "none",
                  borderRadius: 10,
                  padding: "12px 32px",
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "'Outfit', sans-serif",
                }}
              >
                Write Your Answer →
              </button>
            </div>
          </div>
        )}

        {activeTab === "answer" && (
          <div>
            <textarea
              value={userAnswer}
              onChange={e => setUserAnswer(e.target.value)}
              placeholder={q.type === "code" ? `Write your ${q.language.toUpperCase()} solution here...` : "Write your answer here. Be thorough — explain your reasoning, trade-offs, and approach..."}
              style={{
                width: "100%",
                minHeight: 400,
                background: "#0B1120",
                border: "1px solid #1E293B",
                borderRadius: 12,
                padding: 20,
                color: "#F8FAFC",
                fontSize: 13,
                fontFamily: q.type === "code" ? "'JetBrains Mono', monospace" : "'Outfit', sans-serif",
                lineHeight: 1.7,
                resize: "vertical",
                outline: "none",
                boxSizing: "border-box",
              }}
            />

            {/* Rubric preview */}
            <div style={{
              marginTop: 16,
              background: "#0F172A",
              border: "1px solid #1E293B",
              borderRadius: 10,
              padding: "16px 20px",
            }}>
              <div style={{
                fontSize: 12,
                fontWeight: 700,
                color: "#64748B",
                fontFamily: "'JetBrains Mono', monospace",
                marginBottom: 10,
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}>What we're looking for:</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {q.rubric.map((r, i) => (
                  <span key={i} style={{
                    fontSize: 11,
                    padding: "4px 10px",
                    borderRadius: 6,
                    background: "#1E293B",
                    color: "#94A3B8",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}>{r}</span>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={handleSubmitAnswer}
                disabled={!userAnswer.trim() || showResults}
                style={{
                  background: userAnswer.trim() && !showResults
                    ? "linear-gradient(135deg, #10B981, #0EA5E9)"
                    : "#1E293B",
                  border: "none",
                  borderRadius: 10,
                  padding: "12px 32px",
                  color: userAnswer.trim() && !showResults ? "#fff" : "#475569",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: userAnswer.trim() && !showResults ? "pointer" : "not-allowed",
                  fontFamily: "'Outfit', sans-serif",
                }}
              >
                {isEvaluating ? "Evaluating..." : showResults ? "Submitted ✓" : "Submit for Evaluation"}
              </button>
            </div>
          </div>
        )}

        {activeTab === "model-answer" && showResults && (
          <div style={{
            background: "#0F172A",
            border: "1px solid #1E293B",
            borderRadius: 12,
            padding: "24px 28px",
          }}>
            <div style={{
              fontSize: 12,
              fontWeight: 700,
              color: "#10B981",
              fontFamily: "'JetBrains Mono', monospace",
              marginBottom: 16,
              textTransform: "uppercase",
              letterSpacing: "1px",
            }}>Model Answer</div>
            <pre style={{
              color: "#CBD5E1",
              fontSize: 13,
              lineHeight: 1.75,
              fontFamily: q.type === "code" ? "'JetBrains Mono', monospace" : "'Outfit', sans-serif",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              margin: 0,
            }}>
              {q.modelAnswer}
            </pre>
          </div>
        )}

        {activeTab === "evaluation" && showResults && aiEvaluation && (
          <div>
            {/* Score card */}
            <div style={{
              background: "#0F172A",
              border: "1px solid #1E293B",
              borderRadius: 12,
              padding: "28px",
              textAlign: "center",
              marginBottom: 20,
            }}>
              <div style={{
                fontSize: 56,
                fontWeight: 900,
                fontFamily: "'Outfit', sans-serif",
                color: aiEvaluation.score >= 80 ? "#10B981" : aiEvaluation.score >= 60 ? "#F59E0B" : "#EF4444",
              }}>
                {aiEvaluation.score}%
              </div>
              <div style={{
                fontSize: 18,
                fontWeight: 700,
                color: "#F8FAFC",
                fontFamily: "'Outfit', sans-serif",
              }}>{aiEvaluation.totalScore}</div>
              <div style={{
                fontSize: 12,
                color: "#64748B",
                fontFamily: "'JetBrains Mono', monospace",
                marginTop: 4,
              }}>
                Completed in {formatTime(aiEvaluation.timeSpent)}
              </div>
            </div>

            {/* Feedback */}
            <div style={{
              background: "#0F172A",
              border: "1px solid #1E293B",
              borderRadius: 12,
              padding: "20px 24px",
              marginBottom: 20,
            }}>
              <div style={{
                fontSize: 12,
                fontWeight: 700,
                color: "#64748B",
                fontFamily: "'JetBrains Mono', monospace",
                marginBottom: 8,
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}>AI Feedback</div>
              <p style={{
                color: "#CBD5E1",
                fontSize: 14,
                lineHeight: 1.7,
                fontFamily: "'Outfit', sans-serif",
                margin: 0,
              }}>{aiEvaluation.feedback}</p>
            </div>

            {/* Rubric breakdown */}
            <div style={{
              background: "#0F172A",
              border: "1px solid #1E293B",
              borderRadius: 12,
              padding: "20px 24px",
            }}>
              <div style={{
                fontSize: 12,
                fontWeight: 700,
                color: "#64748B",
                fontFamily: "'JetBrains Mono', monospace",
                marginBottom: 14,
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}>Rubric Breakdown</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {aiEvaluation.rubricScores.map((r, i) => (
                  <div key={i} style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "8px 12px",
                    borderRadius: 8,
                    background: r.met ? "#10B98110" : "#EF444410",
                    border: `1px solid ${r.met ? "#10B98120" : "#EF444420"}`,
                  }}>
                    <span style={{ fontSize: 16 }}>{r.met ? "✓" : "✗"}</span>
                    <span style={{
                      fontSize: 13,
                      color: r.met ? "#6EE7B7" : "#FCA5A5",
                      fontFamily: "'Outfit', sans-serif",
                    }}>{r.criterion}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#080E1A",
      color: "#F8FAFC",
      fontFamily: "'Outfit', sans-serif",
    }}>
      <style>{fonts}{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        ::selection { background: #0EA5E930; }
        textarea:focus { border-color: #0EA5E950 !important; }
        input:focus { border-color: #0EA5E950 !important; }
        button:focus-visible, a:focus-visible, textarea:focus-visible, input:focus-visible, [role="button"]:focus-visible{
          outline: none;
          box-shadow: 0 0 0 3px rgba(14,165,233,0.35), 0 0 0 1px rgba(14,165,233,0.25) inset;
          border-color: #0EA5E9 !important;
        }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1E293B; border-radius: 3px; }
      `}</style>

      {/* Navigation */}
      <nav style={{
        borderBottom: "1px solid #1E293B",
        padding: "12px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        background: "#080E1Aee",
        backdropFilter: "blur(12px)",
        zIndex: 100,
      }}>
        <div
          onClick={() => { setView("home"); setSelectedCategory(null); }}
          style={{
            fontSize: 20,
            fontWeight: 900,
            cursor: "pointer",
            fontFamily: "'Outfit', sans-serif",
            background: "linear-gradient(135deg, #0EA5E9, #8B5CF6)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          DataSpark
        </div>

        <div style={{ display: "flex", gap: 6 }}>
          {Object.entries(QUESTIONS).map(([key, cat]) => (
            <button
              key={key}
              onClick={() => { setSelectedCategory(key); setView("category"); }}
              style={{
                background: selectedCategory === key ? "#1E293B" : "transparent",
                border: "1px solid transparent",
                borderRadius: 6,
                padding: "6px 12px",
                color: selectedCategory === key ? "#F8FAFC" : "#64748B",
                fontSize: 12,
                cursor: "pointer",
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 500,
                transition: "all 0.2s",
              }}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Main content */}
      <main style={{ paddingBottom: 60 }}>
        {view === "home" && renderHome()}
        {view === "category" && renderCategory()}
        {view === "question" && renderQuestion()}
      </main>
    </div>
  );
}
