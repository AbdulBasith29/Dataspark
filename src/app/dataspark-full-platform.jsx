import { useState, useEffect, useRef, useCallback } from "react";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DATASPARK — Complete Data Science Learning Platform
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ─── FULL CURRICULUM DATA ────────────────────────────────────────────────────
const CURRICULUM = [
  {
    id: "python",
    title: "Python Fundamentals",
    icon: "🐍",
    color: "#3B82F6",
    accent: "#60A5FA",
    description: "The foundation of every data science career. Master Python's core — not just syntax, but how to think programmatically.",
    topics: [
      {
        id: "py-basics",
        title: "Core Syntax & Data Types",
        lessons: [
          { id: "py-b1", title: "Variables, Types & Type Hints", duration: "15 min", hasViz: true },
          { id: "py-b2", title: "Strings, f-strings & String Methods", duration: "12 min", hasViz: false },
          { id: "py-b3", title: "Lists, Tuples & Mutability", duration: "18 min", hasViz: true },
          { id: "py-b4", title: "Dictionaries & Sets", duration: "15 min", hasViz: true },
          { id: "py-b5", title: "Comprehensions: The Pythonic Way", duration: "10 min", hasViz: true },
        ]
      },
      {
        id: "py-control",
        title: "Control Flow & Functions",
        lessons: [
          { id: "py-c1", title: "Conditionals & Pattern Matching", duration: "12 min", hasViz: false },
          { id: "py-c2", title: "Loops, Iterators & Generators", duration: "20 min", hasViz: true },
          { id: "py-c3", title: "Functions: Args, *args, **kwargs", duration: "15 min", hasViz: true },
          { id: "py-c4", title: "Lambda, Map, Filter, Reduce", duration: "12 min", hasViz: true },
          { id: "py-c5", title: "Error Handling & Debugging", duration: "10 min", hasViz: false },
        ]
      },
      {
        id: "py-oop",
        title: "Object-Oriented Python",
        lessons: [
          { id: "py-o1", title: "Classes, Objects & __init__", duration: "18 min", hasViz: true },
          { id: "py-o2", title: "Inheritance & Polymorphism", duration: "15 min", hasViz: true },
          { id: "py-o3", title: "Dunder Methods & Operator Overloading", duration: "12 min", hasViz: false },
          { id: "py-o4", title: "Decorators & Context Managers", duration: "15 min", hasViz: true },
        ]
      },
      {
        id: "py-ds",
        title: "Python for Data (NumPy & Pandas)",
        lessons: [
          { id: "py-d1", title: "NumPy Arrays & Vectorization", duration: "20 min", hasViz: true },
          { id: "py-d2", title: "Pandas Series & DataFrames", duration: "25 min", hasViz: true },
          { id: "py-d3", title: "GroupBy, Merge, Pivot", duration: "20 min", hasViz: true },
          { id: "py-d4", title: "Handling Missing Data", duration: "12 min", hasViz: false },
          { id: "py-d5", title: "Performance: Vectorize Don't Loop", duration: "15 min", hasViz: true },
        ]
      }
    ],
    questions: [
      { id: "pq1", title: "Build a Data Validator Class", difficulty: "Medium", type: "code", prompt: "Create a Python class DataValidator that takes a pandas DataFrame and validates column types, null thresholds, and value ranges based on a config dict. Include proper error reporting.", tags: ["OOP", "pandas", "validation"] },
      { id: "pq2", title: "Implement a LRU Cache from Scratch", difficulty: "Hard", type: "code", prompt: "Implement a Least Recently Used cache using only Python builtins (no functools). Support get(key) and put(key, value) with O(1) time complexity. Use an OrderedDict or build your own doubly-linked list + dict.", tags: ["data-structures", "algorithms", "OOP"] },
      { id: "pq3", title: "Refactor This Messy Script", difficulty: "Easy", type: "code", prompt: "Given a 50-line script that reads a CSV, filters rows, calculates stats, and writes output — all in one giant function with no error handling — refactor it into clean, modular, documented Python.", tags: ["clean-code", "refactoring", "functions"] },
      { id: "pq4", title: "Generator Pipeline for Large Files", difficulty: "Medium", type: "code", prompt: "Write a generator-based pipeline that reads a 10GB CSV file line by line, filters rows where amount > 1000, transforms dates to ISO format, and yields cleaned records without loading the full file into memory.", tags: ["generators", "memory-efficiency", "ETL"] },
      { id: "pq5", title: "Decorator for Function Timing & Logging", difficulty: "Easy", type: "code", prompt: "Write a decorator @profile that logs the function name, arguments, return value, and execution time. It should work with any function signature.", tags: ["decorators", "logging", "functions"] },
    ]
  },
  {
    id: "sql",
    title: "SQL & Databases",
    icon: "🗄️",
    color: "#0EA5E9",
    accent: "#38BDF8",
    description: "The language of data. From basic queries to advanced window functions, CTEs, and query optimization.",
    topics: [
      {
        id: "sql-basics",
        title: "SQL Fundamentals",
        lessons: [
          { id: "sq-b1", title: "SELECT, WHERE, ORDER BY", duration: "12 min", hasViz: false },
          { id: "sq-b2", title: "JOINs Visualized: INNER, LEFT, RIGHT, FULL", duration: "20 min", hasViz: true },
          { id: "sq-b3", title: "GROUP BY & Aggregation Functions", duration: "15 min", hasViz: true },
          { id: "sq-b4", title: "HAVING vs WHERE: When to Filter", duration: "10 min", hasViz: true },
          { id: "sq-b5", title: "Subqueries & Correlated Subqueries", duration: "18 min", hasViz: true },
        ]
      },
      {
        id: "sql-advanced",
        title: "Advanced SQL",
        lessons: [
          { id: "sq-a1", title: "Window Functions: ROW_NUMBER, RANK, DENSE_RANK", duration: "22 min", hasViz: true },
          { id: "sq-a2", title: "LAG, LEAD & Running Calculations", duration: "18 min", hasViz: true },
          { id: "sq-a3", title: "CTEs & Recursive Queries", duration: "20 min", hasViz: true },
          { id: "sq-a4", title: "PIVOT, UNPIVOT & Conditional Aggregation", duration: "15 min", hasViz: false },
          { id: "sq-a5", title: "Query Optimization & EXPLAIN Plans", duration: "25 min", hasViz: true },
        ]
      },
      {
        id: "sql-design",
        title: "Database Design",
        lessons: [
          { id: "sq-d1", title: "Normalization: 1NF → 3NF → BCNF", duration: "20 min", hasViz: true },
          { id: "sq-d2", title: "Indexing Strategies", duration: "18 min", hasViz: true },
          { id: "sq-d3", title: "Star Schema vs Snowflake Schema", duration: "15 min", hasViz: true },
          { id: "sq-d4", title: "OLTP vs OLAP: Choosing the Right DB", duration: "12 min", hasViz: true },
        ]
      }
    ],
    questions: [
      { id: "sqq1", title: "Revenue by Customer Segment", difficulty: "Easy", type: "code", prompt: "Write a query returning each customer segment, unique purchasers, total revenue (completed orders only), and avg order value. Filter to segments with >$10K revenue.", tags: ["joins", "aggregation", "HAVING"] },
      { id: "sqq2", title: "Cohort Retention Analysis", difficulty: "Hard", type: "code", prompt: "Build a monthly cohort retention table showing cohort_month, cohort_size, months_since_signup (0-6), retained_users, and retention_rate for the last 12 months.", tags: ["CTEs", "window-functions", "cohort-analysis"] },
      { id: "sqq3", title: "Funnel Conversion by City", difficulty: "Medium", type: "code", prompt: "Calculate step-over-step conversion rates for a 5-step funnel (app_open → search → select → confirm → complete) broken down by city for the last 30 days.", tags: ["conditional-aggregation", "funnel", "product-analytics"] },
      { id: "sqq4", title: "Recursive Org Chart", difficulty: "Hard", type: "code", prompt: "Using a recursive CTE, generate a full org hierarchy showing employee, manager, level, full chain path, and team size (all direct + indirect reports).", tags: ["recursive-CTE", "hierarchy", "self-join"] },
      { id: "sqq5", title: "Running Total with Gaps", difficulty: "Medium", type: "code", prompt: "Calculate daily signups with a running total, day-over-day change, and 7-day moving average. Handle days with zero signups using a date series.", tags: ["window-functions", "date-series", "running-totals"] },
      { id: "sqq6", title: "Duplicate Detection & Cleanup", difficulty: "Easy", type: "code", prompt: "Find duplicate listings (same host_id, title, city), show counts, then write a DELETE keeping only the most recently updated record per group.", tags: ["deduplication", "ROW_NUMBER", "data-quality"] },
    ]
  },
  {
    id: "statistics",
    title: "Statistics & Probability",
    icon: "📐",
    color: "#8B5CF6",
    accent: "#A78BFA",
    description: "The mathematical backbone. Understand distributions, hypothesis testing, and statistical thinking — not just formulas, but intuition.",
    topics: [
      {
        id: "stat-foundations",
        title: "Descriptive Statistics",
        lessons: [
          { id: "st-f1", title: "Mean, Median, Mode & When Each Matters", duration: "15 min", hasViz: true },
          { id: "st-f2", title: "Variance, Std Dev & The Shape of Data", duration: "18 min", hasViz: true },
          { id: "st-f3", title: "Percentiles, IQR & Outlier Detection", duration: "12 min", hasViz: true },
          { id: "st-f4", title: "Correlation vs Causation (Seriously)", duration: "15 min", hasViz: true },
        ]
      },
      {
        id: "stat-probability",
        title: "Probability & Distributions",
        lessons: [
          { id: "st-p1", title: "Bayes' Theorem: Updating Beliefs", duration: "20 min", hasViz: true },
          { id: "st-p2", title: "Normal Distribution & The 68-95-99.7 Rule", duration: "15 min", hasViz: true },
          { id: "st-p3", title: "Binomial, Poisson & When to Use Each", duration: "18 min", hasViz: true },
          { id: "st-p4", title: "Central Limit Theorem: Why Everything is Normal", duration: "20 min", hasViz: true },
        ]
      },
      {
        id: "stat-inference",
        title: "Inferential Statistics",
        lessons: [
          { id: "st-i1", title: "Hypothesis Testing: The Framework", duration: "22 min", hasViz: true },
          { id: "st-i2", title: "P-Values: What They Actually Mean", duration: "18 min", hasViz: true },
          { id: "st-i3", title: "t-Tests, Chi-Squared, ANOVA", duration: "25 min", hasViz: true },
          { id: "st-i4", title: "Confidence Intervals: Precision of Estimates", duration: "15 min", hasViz: true },
          { id: "st-i5", title: "Type I & Type II Errors: The Tradeoff", duration: "15 min", hasViz: true },
          { id: "st-i6", title: "Power Analysis & Sample Size", duration: "18 min", hasViz: true },
        ]
      },
      {
        id: "stat-applied",
        title: "Applied Statistics for DS",
        lessons: [
          { id: "st-a1", title: "A/B Testing: Design to Decision", duration: "25 min", hasViz: true },
          { id: "st-a2", title: "Multiple Testing & Bonferroni Correction", duration: "12 min", hasViz: true },
          { id: "st-a3", title: "Bootstrap Methods", duration: "15 min", hasViz: true },
          { id: "st-a4", title: "Bayesian vs Frequentist: The Debate", duration: "18 min", hasViz: false },
        ]
      }
    ],
    questions: [
      { id: "stq1", title: "A/B Test from Scratch (No Libraries)", difficulty: "Hard", type: "code", prompt: "Implement a full A/B test analysis function: conversion rates, z-test, p-value, 95% CI, and sample size calculation — using only math, no scipy.", tags: ["hypothesis-testing", "z-test", "from-scratch"] },
      { id: "stq2", title: "The PM Says It's Significant at p=0.049", difficulty: "Medium", type: "open-ended", prompt: "Your PM ran 12 A/B tests simultaneously and one came back significant at p=0.049. They want to ship. What do you tell them? Discuss multiple testing, practical significance, and how to communicate this diplomatically.", tags: ["multiple-testing", "communication", "p-values"] },
      { id: "stq3", title: "Choose the Right Statistical Test", difficulty: "Easy", type: "open-ended", prompt: "Given 5 different scenarios (comparing two means, testing independence, comparing proportions, testing normality, comparing 3+ groups), identify the appropriate test and justify why.", tags: ["test-selection", "fundamentals"] },
      { id: "stq4", title: "Power Analysis for a Pricing Experiment", difficulty: "Medium", type: "open-ended", prompt: "Your company wants to test a 5% price increase. Current conversion is 12%. How many users per group do you need? What assumptions are you making? What if the CEO wants results in 1 week?", tags: ["power-analysis", "sample-size", "business-context"] },
      { id: "stq5", title: "Simpson's Paradox in Real Data", difficulty: "Hard", type: "open-ended", prompt: "You find that Drug A has a higher recovery rate overall, but Drug B has a higher rate in every individual subgroup. Explain how this is possible, what you'd recommend, and how you'd present this to a non-technical stakeholder.", tags: ["paradoxes", "confounding", "communication"] },
    ]
  },
  {
    id: "ml",
    title: "Machine Learning",
    icon: "🧠",
    color: "#F59E0B",
    accent: "#FBBF24",
    description: "From linear regression to gradient boosting. Learn to build, evaluate, and deploy ML models that solve real problems.",
    topics: [
      {
        id: "ml-foundations",
        title: "ML Foundations",
        lessons: [
          { id: "ml-f1", title: "Supervised vs Unsupervised vs Reinforcement", duration: "15 min", hasViz: true },
          { id: "ml-f2", title: "Bias-Variance Tradeoff: The Core Tension", duration: "20 min", hasViz: true },
          { id: "ml-f3", title: "Train/Val/Test Split & Cross-Validation", duration: "15 min", hasViz: true },
          { id: "ml-f4", title: "Feature Engineering: The Art", duration: "22 min", hasViz: true },
          { id: "ml-f5", title: "Feature Scaling & Encoding", duration: "15 min", hasViz: true },
        ]
      },
      {
        id: "ml-supervised",
        title: "Supervised Learning",
        lessons: [
          { id: "ml-s1", title: "Linear Regression: From Scratch to Intuition", duration: "25 min", hasViz: true },
          { id: "ml-s2", title: "Logistic Regression & Decision Boundaries", duration: "20 min", hasViz: true },
          { id: "ml-s3", title: "Decision Trees: Splitting Criteria Visualized", duration: "22 min", hasViz: true },
          { id: "ml-s4", title: "Random Forests & Bagging", duration: "18 min", hasViz: true },
          { id: "ml-s5", title: "Gradient Boosting: XGBoost & LightGBM", duration: "25 min", hasViz: true },
          { id: "ml-s6", title: "SVM: Margins & Kernels", duration: "20 min", hasViz: true },
        ]
      },
      {
        id: "ml-unsupervised",
        title: "Unsupervised Learning",
        lessons: [
          { id: "ml-u1", title: "K-Means: Clustering Step by Step", duration: "18 min", hasViz: true },
          { id: "ml-u2", title: "DBSCAN & Hierarchical Clustering", duration: "15 min", hasViz: true },
          { id: "ml-u3", title: "PCA: Dimensionality Reduction Visualized", duration: "22 min", hasViz: true },
          { id: "ml-u4", title: "t-SNE & UMAP for Visualization", duration: "15 min", hasViz: true },
        ]
      },
      {
        id: "ml-evaluation",
        title: "Model Evaluation & Tuning",
        lessons: [
          { id: "ml-e1", title: "Confusion Matrix, Precision, Recall, F1", duration: "18 min", hasViz: true },
          { id: "ml-e2", title: "ROC Curves & AUC Explained", duration: "15 min", hasViz: true },
          { id: "ml-e3", title: "Hyperparameter Tuning: Grid, Random, Bayesian", duration: "20 min", hasViz: true },
          { id: "ml-e4", title: "Handling Imbalanced Classes", duration: "15 min", hasViz: true },
        ]
      }
    ],
    questions: [
      { id: "mlq1", title: "Churn Feature Engineering Pipeline", difficulty: "Medium", type: "code", prompt: "Build a feature engineering function for churn prediction: compute recency, frequency, monetary features, activity trends, and engagement ratios from raw event logs.", tags: ["feature-engineering", "pandas", "churn"] },
      { id: "mlq2", title: "Model Selection: Why Not Always XGBoost?", difficulty: "Medium", type: "open-ended", prompt: "Your junior DS always defaults to XGBoost. For these 4 scenarios (linear relationship with 10 features, 50M rows with 3 features, highly interpretable model needed for compliance, sparse text data), explain which model you'd choose and why.", tags: ["model-selection", "tradeoffs", "reasoning"] },
      { id: "mlq3", title: "Debug a Leaking Pipeline", difficulty: "Hard", type: "open-ended", prompt: "Your model has 99.2% accuracy in development but 61% in production. Walk through your systematic debugging process. What are the most likely causes? How do you prevent this in the future?", tags: ["data-leakage", "debugging", "ML-pipelines"] },
      { id: "mlq4", title: "End-to-End ML Pipeline", difficulty: "Hard", type: "code", prompt: "Build a complete sklearn pipeline: imputation, encoding, scaling, feature selection, model training with cross-validation, and hyperparameter tuning. Use Pipeline and ColumnTransformer.", tags: ["sklearn", "pipelines", "end-to-end"] },
      { id: "mlq5", title: "Explain Your Model to the CEO", difficulty: "Easy", type: "open-ended", prompt: "You built a gradient boosting model that predicts which customers will churn. The CEO asks 'how does it work?' and 'why should I trust it?'. Explain without jargon. Then explain what SHAP values show.", tags: ["explainability", "communication", "SHAP"] },
    ]
  },
  {
    id: "deep-learning",
    title: "Deep Learning",
    icon: "🔮",
    color: "#EC4899",
    accent: "#F472B6",
    description: "Neural networks from first principles. Build intuition for architectures, then implement with PyTorch.",
    topics: [
      {
        id: "dl-foundations",
        title: "Neural Network Foundations",
        lessons: [
          { id: "dl-f1", title: "Perceptrons & The Universal Approximator", duration: "18 min", hasViz: true },
          { id: "dl-f2", title: "Backpropagation: How Networks Learn", duration: "25 min", hasViz: true },
          { id: "dl-f3", title: "Activation Functions: ReLU, Sigmoid, Tanh", duration: "15 min", hasViz: true },
          { id: "dl-f4", title: "Gradient Descent & Its Variants (SGD, Adam)", duration: "22 min", hasViz: true },
          { id: "dl-f5", title: "Regularization: Dropout, BatchNorm, Weight Decay", duration: "18 min", hasViz: true },
        ]
      },
      {
        id: "dl-architectures",
        title: "Architectures",
        lessons: [
          { id: "dl-a1", title: "CNNs: Convolutions & Feature Maps", duration: "25 min", hasViz: true },
          { id: "dl-a2", title: "RNNs & LSTMs: Sequence Modeling", duration: "22 min", hasViz: true },
          { id: "dl-a3", title: "Transformers: Attention Is All You Need", duration: "30 min", hasViz: true },
          { id: "dl-a4", title: "Transfer Learning & Fine-Tuning", duration: "18 min", hasViz: true },
        ]
      }
    ],
    questions: [
      { id: "dlq1", title: "CNN vs RNN vs Transformer", difficulty: "Medium", type: "open-ended", prompt: "For each scenario (image classification, time series forecasting, document summarization, audio classification), pick the best architecture and explain the tradeoffs.", tags: ["architecture-selection", "tradeoffs"] },
      { id: "dlq2", title: "Training Loss Not Decreasing", difficulty: "Medium", type: "open-ended", prompt: "Your neural network's training loss is flat after 10 epochs. Walk through a systematic debugging checklist: what could be wrong and what would you try in what order?", tags: ["debugging", "training", "practical"] },
      { id: "dlq3", title: "Implement a Simple Neural Network from Scratch", difficulty: "Hard", type: "code", prompt: "Build a 2-layer neural network using only NumPy. Implement forward pass, backprop, and training loop. Train it on a simple classification task.", tags: ["from-scratch", "numpy", "backprop"] },
    ]
  },
  {
    id: "genai",
    title: "GenAI & LLMs",
    icon: "✨",
    color: "#10B981",
    accent: "#34D399",
    description: "The frontier. Understand how LLMs work, how to build with them, and how to evaluate AI-powered systems.",
    topics: [
      {
        id: "genai-foundations",
        title: "LLM Foundations",
        lessons: [
          { id: "ga-f1", title: "How Language Models Actually Work", duration: "22 min", hasViz: true },
          { id: "ga-f2", title: "Tokenization & Embeddings", duration: "18 min", hasViz: true },
          { id: "ga-f3", title: "Attention Mechanism Deep Dive", duration: "25 min", hasViz: true },
          { id: "ga-f4", title: "Fine-Tuning vs RAG vs Prompting", duration: "20 min", hasViz: true },
        ]
      },
      {
        id: "genai-applied",
        title: "Building with LLMs",
        lessons: [
          { id: "ga-a1", title: "Prompt Engineering: Principles & Patterns", duration: "25 min", hasViz: false },
          { id: "ga-a2", title: "RAG: Retrieval Augmented Generation", duration: "22 min", hasViz: true },
          { id: "ga-a3", title: "Agentic Frameworks & LangGraph", duration: "25 min", hasViz: true },
          { id: "ga-a4", title: "Building UIs with Streamlit", duration: "18 min", hasViz: false },
          { id: "ga-a5", title: "LLM Evaluation: How to Know If It's Good", duration: "20 min", hasViz: true },
        ]
      }
    ],
    questions: [
      { id: "aiq1", title: "Design a Data Quality Classifier Prompt", difficulty: "Medium", type: "open-ended", prompt: "Design a system prompt for Claude that classifies CSV data quality. Include the prompt, few-shot strategy, output schema, validation approach, and fallback for misclassification.", tags: ["prompt-engineering", "system-design", "data-quality"] },
      { id: "aiq2", title: "RAG vs Fine-Tuning Decision", difficulty: "Medium", type: "open-ended", prompt: "Your company has 10,000 internal documents and wants an AI assistant for employees. Compare RAG vs fine-tuning across cost, accuracy, freshness, and maintenance. What do you recommend?", tags: ["RAG", "architecture", "decision-making"] },
      { id: "aiq3", title: "LLM Evaluation Pipeline for Text-to-SQL", difficulty: "Hard", type: "open-ended", prompt: "Design an eval pipeline for an LLM text-to-SQL feature. Cover metrics, test data construction, handling multiple valid SQLs, production readiness thresholds, and post-deployment monitoring.", tags: ["evaluation", "text-to-SQL", "MLOps"] },
    ]
  },
  {
    id: "product-sense",
    title: "Product Sense & Business Cases",
    icon: "📊",
    color: "#F97316",
    accent: "#FB923C",
    description: "The questions that separate good from great. Metric design, experiment analysis, stakeholder communication, and ambiguity.",
    topics: [
      {
        id: "ps-metrics",
        title: "Metrics & KPIs",
        lessons: [
          { id: "ps-m1", title: "North Star Metrics: Choosing What Matters", duration: "18 min", hasViz: false },
          { id: "ps-m2", title: "Leading vs Lagging Indicators", duration: "12 min", hasViz: true },
          { id: "ps-m3", title: "Guardrail Metrics: What Shouldn't Break", duration: "10 min", hasViz: false },
          { id: "ps-m4", title: "Metric Decomposition Trees", duration: "15 min", hasViz: true },
        ]
      },
      {
        id: "ps-experiment",
        title: "Experimentation",
        lessons: [
          { id: "ps-e1", title: "A/B Test Design: End to End", duration: "25 min", hasViz: true },
          { id: "ps-e2", title: "When A/B Tests Go Wrong", duration: "18 min", hasViz: false },
          { id: "ps-e3", title: "Novelty Effects & Long-Term Holdouts", duration: "12 min", hasViz: true },
          { id: "ps-e4", title: "Network Effects & Interference", duration: "15 min", hasViz: true },
        ]
      },
      {
        id: "ps-cases",
        title: "Business Case Studies",
        lessons: [
          { id: "ps-c1", title: "Diagnosing a Metric Drop: Framework", duration: "20 min", hasViz: false },
          { id: "ps-c2", title: "Build vs Buy Decisions", duration: "15 min", hasViz: false },
          { id: "ps-c3", title: "Communicating to Non-Technical Stakeholders", duration: "18 min", hasViz: false },
        ]
      }
    ],
    questions: [
      { id: "psq1", title: "Slack Huddles: Define Success Metrics", difficulty: "Medium", type: "open-ended", prompt: "Slack is launching Huddles. Define the North Star metric, 3-5 supporting metrics, guardrails, 90-day targets, instrumentation plan, and kill criteria.", tags: ["metrics", "product-launch", "KPIs"] },
      { id: "psq2", title: "Conversion Dropped 25% — Now What?", difficulty: "Hard", type: "open-ended", prompt: "DoorDash weekend conversion dropped from 32% to 24%. Walk through your investigation: framework, first 5 analyses, hypotheses ranked, distinguishing data issues from real problems, and what you present to the VP by EOD.", tags: ["metric-investigation", "debugging", "stakeholders"] },
      { id: "psq3", title: "A/B Test Shows Contradictory Results", difficulty: "Hard", type: "open-ended", prompt: "Netflix A/B test: +5% CTR, -3% viewing hours, +8% titles started. PM wants to ship. Content team is worried. Interpret the results, propose additional analyses, and make a recommendation.", tags: ["AB-testing", "tradeoffs", "experimentation"] },
      { id: "psq4", title: "Build vs Buy: ML Monitoring", difficulty: "Medium", type: "open-ended", prompt: "Team of 6, patchwork monitoring. Evaluate build vs buy for ML monitoring. Cover decision criteria, cost comparison, hidden costs, recommendation, and executive presentation.", tags: ["build-vs-buy", "decision-framework", "communication"] },
    ]
  },
  {
    id: "system-design",
    title: "System Design & Architecture",
    icon: "🏗️",
    color: "#6366F1",
    accent: "#818CF8",
    description: "How to design data systems that scale. Pipelines, ML infrastructure, and the architecture decisions interviewers love to ask.",
    topics: [
      {
        id: "sd-pipelines",
        title: "Data Pipeline Architecture",
        lessons: [
          { id: "sd-p1", title: "Batch vs Streaming: When & Why", duration: "20 min", hasViz: true },
          { id: "sd-p2", title: "ETL vs ELT & Modern Data Stack", duration: "18 min", hasViz: true },
          { id: "sd-p3", title: "Kafka, Spark, Flink: The Streaming Trinity", duration: "22 min", hasViz: true },
          { id: "sd-p4", title: "Data Warehouse Design Patterns", duration: "20 min", hasViz: true },
        ]
      },
      {
        id: "sd-ml-systems",
        title: "ML System Design",
        lessons: [
          { id: "sd-m1", title: "ML System Design Framework", duration: "25 min", hasViz: true },
          { id: "sd-m2", title: "Feature Stores & Feature Engineering at Scale", duration: "18 min", hasViz: true },
          { id: "sd-m3", title: "Model Serving: Batch vs Real-Time", duration: "15 min", hasViz: true },
          { id: "sd-m4", title: "Recommendation Systems at Scale", duration: "25 min", hasViz: true },
        ]
      }
    ],
    questions: [
      { id: "sdq1", title: "Real-Time Fraud Detection Pipeline", difficulty: "Hard", type: "open-ended", prompt: "Design a fraud detection pipeline: 10K TPS, <500ms latency, rules + ML, cold start handling, 3x scaling for Black Friday, audit trail. Cover architecture, tech choices, model updates, monitoring, phased rollout.", tags: ["streaming", "fraud", "architecture"] },
      { id: "sdq2", title: "Recommendation System for 400M Users", difficulty: "Hard", type: "open-ended", prompt: "Design a multi-stage recommendation pipeline: candidate gen → ranking → re-ranking. Cover embedding strategy, explore/exploit, offline vs online evaluation, real-time personalization, and cold-start.", tags: ["recommendations", "scale", "ML-systems"] },
      { id: "sdq3", title: "Data Warehouse Migration Plan", difficulty: "Medium", type: "open-ended", prompt: "Migrate from Postgres to cloud warehouse. 5TB data, 300 dbt models, 50 Looker dashboards, team of 7. Cover warehouse choice, migration strategy, zero downtime, validation, dbt changes, timeline.", tags: ["migration", "data-warehouse", "dbt"] },
    ]
  },
  {
    id: "mlops",
    title: "MLOps, Cloud & Tools",
    icon: "⚙️",
    color: "#64748B",
    accent: "#94A3B8",
    description: "The engineering skills that make you production-ready. CI/CD for ML, cloud services, Git, APIs, and environments.",
    topics: [
      {
        id: "mlops-core",
        title: "MLOps Fundamentals",
        lessons: [
          { id: "mo-c1", title: "CI/CD for Machine Learning", duration: "20 min", hasViz: true },
          { id: "mo-c2", title: "Model Versioning & Experiment Tracking", duration: "15 min", hasViz: false },
          { id: "mo-c3", title: "Monitoring & Drift Detection", duration: "18 min", hasViz: true },
          { id: "mo-c4", title: "Automated Retraining Pipelines", duration: "15 min", hasViz: true },
        ]
      },
      {
        id: "mlops-tools",
        title: "Essential Tools",
        lessons: [
          { id: "mo-t1", title: "Git Workflows for Data Teams", duration: "18 min", hasViz: true },
          { id: "mo-t2", title: "Virtual Environments: venv, conda, poetry", duration: "12 min", hasViz: false },
          { id: "mo-t3", title: "Building APIs with FastAPI", duration: "22 min", hasViz: false },
          { id: "mo-t4", title: "Docker for Data Scientists", duration: "20 min", hasViz: true },
          { id: "mo-t5", title: "Cloud Basics: AWS for DS", duration: "25 min", hasViz: true },
        ]
      },
      {
        id: "mlops-viz",
        title: "Data Visualization",
        lessons: [
          { id: "mo-v1", title: "Matplotlib & Seaborn: Static Viz Done Right", duration: "20 min", hasViz: true },
          { id: "mo-v2", title: "Plotly: Interactive Visualizations", duration: "18 min", hasViz: true },
          { id: "mo-v3", title: "Dashboard Design Principles", duration: "15 min", hasViz: false },
        ]
      }
    ],
    questions: [
      { id: "moq1", title: "Design a CI/CD Pipeline for ML", difficulty: "Medium", type: "open-ended", prompt: "Design a CI/CD pipeline for an ML model: include linting, testing, data validation, model training, evaluation gates, staging deployment, canary release, and rollback strategy.", tags: ["CI/CD", "MLOps", "deployment"] },
      { id: "moq2", title: "Your Model is Drifting — Now What?", difficulty: "Medium", type: "open-ended", prompt: "You get an alert that your production model's prediction distribution has shifted significantly from training. Walk through your response: investigation, diagnosis, short-term fix, long-term prevention.", tags: ["monitoring", "drift", "production"] },
      { id: "moq3", title: "Build a Model Serving API", difficulty: "Easy", type: "code", prompt: "Build a FastAPI endpoint that loads a trained sklearn model, accepts JSON input, validates it with Pydantic, returns predictions with confidence scores, and handles errors gracefully.", tags: ["FastAPI", "deployment", "API"] },
    ]
  },
  {
    id: "specialized",
    title: "Specialized AI",
    icon: "🎯",
    color: "#EF4444",
    accent: "#F87171",
    description: "Deep dives into recommendation engines, time series analysis, and NLP — the specialized skills that make you stand out.",
    topics: [
      {
        id: "spec-recsys",
        title: "Recommendation Engines",
        lessons: [
          { id: "sp-r1", title: "Collaborative Filtering: User-User & Item-Item", duration: "22 min", hasViz: true },
          { id: "sp-r2", title: "Content-Based Recommendations", duration: "15 min", hasViz: true },
          { id: "sp-r3", title: "Hybrid Systems & Matrix Factorization", duration: "20 min", hasViz: true },
          { id: "sp-r4", title: "Evaluation: Beyond Accuracy", duration: "15 min", hasViz: true },
        ]
      },
      {
        id: "spec-timeseries",
        title: "Time Series Analysis",
        lessons: [
          { id: "sp-t1", title: "Stationarity & Decomposition", duration: "18 min", hasViz: true },
          { id: "sp-t2", title: "ARIMA Family Models", duration: "22 min", hasViz: true },
          { id: "sp-t3", title: "Prophet & Modern Forecasting", duration: "18 min", hasViz: true },
          { id: "sp-t4", title: "LSTM for Sequence Prediction", duration: "20 min", hasViz: true },
        ]
      },
      {
        id: "spec-nlp",
        title: "Natural Language Processing",
        lessons: [
          { id: "sp-n1", title: "Text Preprocessing & Tokenization", duration: "15 min", hasViz: true },
          { id: "sp-n2", title: "Word Embeddings: Word2Vec to BERT", duration: "25 min", hasViz: true },
          { id: "sp-n3", title: "Sentiment Analysis & Text Classification", duration: "18 min", hasViz: false },
          { id: "sp-n4", title: "Named Entity Recognition", duration: "15 min", hasViz: true },
        ]
      }
    ],
    questions: [
      { id: "spq1", title: "Cold Start Problem in Recommendations", difficulty: "Medium", type: "open-ended", prompt: "New users and new items have no interaction history. Design a strategy to handle cold start for both, covering what data you'd use, fallback approaches, and how you'd transition to personalized recommendations.", tags: ["cold-start", "recommendations", "design"] },
      { id: "spq2", title: "Forecast Daily Revenue with Seasonality", difficulty: "Medium", type: "code", prompt: "Given 2 years of daily revenue data with weekly + yearly seasonality and a holiday effect, build a forecasting pipeline. Compare ARIMA, Prophet, and a simple baseline. Evaluate with proper time series CV.", tags: ["forecasting", "time-series", "evaluation"] },
      { id: "spq3", title: "NLP Pipeline for Customer Feedback", difficulty: "Medium", type: "open-ended", prompt: "Your company receives 10K customer reviews daily. Design an NLP pipeline that: classifies sentiment, extracts key topics, identifies urgent issues, and generates a daily summary for the product team.", tags: ["NLP", "pipeline", "product"] },
    ]
  }
];

// ─── INTERACTIVE VISUALIZATIONS ──────────────────────────────────────────────

const NormalDistViz = () => {
  const canvasRef = useRef(null);
  const [mean, setMean] = useState(0);
  const [stdDev, setStdDev] = useState(1);
  const animRef = useRef(null);
  const particlesRef = useRef([]);

  const gaussian = (x, m, s) => (1 / (s * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * ((x - m) / s) ** 2);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width = canvas.offsetWidth * 2;
    const H = canvas.height = canvas.offsetHeight * 2;
    ctx.scale(1, 1);

    // Generate particles
    if (particlesRef.current.length === 0) {
      for (let i = 0; i < 200; i++) {
        let u1 = Math.random(), u2 = Math.random();
        let z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        particlesRef.current.push({ x: z, y: Math.random(), vy: 0.2 + Math.random() * 0.5, opacity: 0.3 + Math.random() * 0.7, size: 1.5 + Math.random() * 2 });
      }
    }

    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      const xMin = mean - 4 * stdDev;
      const xMax = mean + 4 * stdDev;
      const toCanvasX = (x) => ((x - xMin) / (xMax - xMin)) * W;
      const maxY = gaussian(mean, mean, stdDev);
      const toCanvasY = (y) => H - (y / maxY) * H * 0.78 - 30;

      // Draw filled curve
      ctx.beginPath();
      ctx.moveTo(0, H);
      for (let px = 0; px <= W; px += 2) {
        const x = xMin + (px / W) * (xMax - xMin);
        const y = gaussian(x, mean, stdDev);
        ctx.lineTo(px, toCanvasY(y));
      }
      ctx.lineTo(W, H);
      ctx.closePath();

      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, "rgba(139, 92, 246, 0.3)");
      grad.addColorStop(1, "rgba(139, 92, 246, 0.02)");
      ctx.fillStyle = grad;
      ctx.fill();

      // Draw curve line
      ctx.beginPath();
      for (let px = 0; px <= W; px += 2) {
        const x = xMin + (px / W) * (xMax - xMin);
        const y = gaussian(x, mean, stdDev);
        px === 0 ? ctx.moveTo(px, toCanvasY(y)) : ctx.lineTo(px, toCanvasY(y));
      }
      ctx.strokeStyle = "#A78BFA";
      ctx.lineWidth = 3;
      ctx.stroke();

      // Draw std dev zones
      [1, 2, 3].forEach((n, i) => {
        const left = toCanvasX(mean - n * stdDev);
        const right = toCanvasX(mean + n * stdDev);
        ctx.strokeStyle = `rgba(167, 139, 250, ${0.3 - i * 0.08})`;
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath(); ctx.moveTo(left, 0); ctx.lineTo(left, H); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(right, 0); ctx.lineTo(right, H); ctx.stroke();
        ctx.setLineDash([]);

        const pcts = ["68.3%", "95.4%", "99.7%"];
        ctx.fillStyle = `rgba(167, 139, 250, ${0.6 - i * 0.15})`;
        ctx.font = `${20 - i * 2}px 'JetBrains Mono'`;
        ctx.textAlign = "center";
        ctx.fillText(pcts[i], (left + right) / 2, H - 8 - i * 22);
      });

      // Animate particles
      particlesRef.current.forEach(p => {
        const px = toCanvasX(p.x * stdDev + mean);
        const py = toCanvasY(gaussian(p.x * stdDev + mean, mean, stdDev));
        const dropY = py + p.y * (H - py);
        p.y += p.vy * 0.008;
        if (p.y > 1) { p.y = 0; p.x = (Math.random() - 0.5) * 6; }
        ctx.beginPath();
        ctx.arc(px, dropY, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(196, 181, 253, ${p.opacity * (1 - p.y)})`;
        ctx.fill();
      });

      // Mean line
      const meanX = toCanvasX(mean);
      ctx.beginPath(); ctx.moveTo(meanX, 0); ctx.lineTo(meanX, H);
      ctx.strokeStyle = "#F59E0B"; ctx.lineWidth = 2; ctx.setLineDash([6, 3]); ctx.stroke(); ctx.setLineDash([]);

      ctx.fillStyle = "#F59E0B";
      ctx.font = "bold 22px 'JetBrains Mono'";
      ctx.textAlign = "center";
      ctx.fillText(`μ = ${mean.toFixed(1)}`, meanX, 30);

      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [mean, stdDev]);

  return (
    <div style={{ background: "#0B1120", borderRadius: 16, padding: 24, border: "1px solid #1E293B" }}>
      <div style={{ fontSize: 18, fontWeight: 700, color: "#F8FAFC", marginBottom: 4, fontFamily: "'Outfit'" }}>Normal Distribution Explorer</div>
      <div style={{ fontSize: 12, color: "#64748B", fontFamily: "'JetBrains Mono'", marginBottom: 16 }}>Drag the sliders to see how μ and σ change the shape</div>
      <canvas ref={canvasRef} style={{ width: "100%", height: 280, borderRadius: 8 }} />
      <div style={{ display: "flex", gap: 24, marginTop: 16 }}>
        <label style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: "#94A3B8", fontFamily: "'JetBrains Mono'", marginBottom: 6 }}>Mean (μ): {mean.toFixed(1)}</div>
          <input type="range" min={-3} max={3} step={0.1} value={mean} onChange={e => setMean(+e.target.value)} style={{ width: "100%", accentColor: "#F59E0B" }} />
        </label>
        <label style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: "#94A3B8", fontFamily: "'JetBrains Mono'", marginBottom: 6 }}>Std Dev (σ): {stdDev.toFixed(1)}</div>
          <input type="range" min={0.3} max={3} step={0.1} value={stdDev} onChange={e => setStdDev(+e.target.value)} style={{ width: "100%", accentColor: "#8B5CF6" }} />
        </label>
      </div>
    </div>
  );
};

const GradientDescentViz = () => {
  const canvasRef = useRef(null);
  const [lr, setLr] = useState(0.1);
  const [ballPos, setBallPos] = useState(3.5);
  const [isRunning, setIsRunning] = useState(false);
  const [trail, setTrail] = useState([]);
  const animRef = useRef(null);
  const posRef = useRef(3.5);
  const velRef = useRef(0);

  const f = (x) => 0.15 * (x - 1) * (x - 1) * (x + 2) * (x + 2) + 0.5;
  const df = (x) => 0.15 * (2 * (x - 1) * (x + 2) * (x + 2) + 2 * (x - 1) * (x - 1) * (x + 2));

  const reset = () => { posRef.current = 3.5; velRef.current = 0; setBallPos(3.5); setTrail([]); setIsRunning(false); };

  useEffect(() => {
    if (!isRunning) return;
    const step = () => {
      const grad = df(posRef.current);
      posRef.current -= lr * grad;
      posRef.current = Math.max(-4, Math.min(4, posRef.current));
      setBallPos(posRef.current);
      setTrail(t => [...t.slice(-50), posRef.current]);
      if (Math.abs(grad) > 0.01) animRef.current = setTimeout(step, 80);
      else setIsRunning(false);
    };
    animRef.current = setTimeout(step, 80);
    return () => clearTimeout(animRef.current);
  }, [isRunning, lr]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width = canvas.offsetWidth * 2;
    const H = canvas.height = canvas.offsetHeight * 2;

    const toX = (x) => ((x + 4.5) / 9) * W;
    const toY = (y) => H - (y / 8) * H * 0.85 - 20;

    ctx.clearRect(0, 0, W, H);

    // Draw function
    const grad = ctx.createLinearGradient(0, H, 0, 0);
    grad.addColorStop(0, "rgba(249, 115, 22, 0.05)");
    grad.addColorStop(1, "rgba(249, 115, 22, 0.15)");

    ctx.beginPath();
    ctx.moveTo(toX(-4.5), H);
    for (let x = -4.5; x <= 4.5; x += 0.05) {
      ctx.lineTo(toX(x), toY(f(x)));
    }
    ctx.lineTo(toX(4.5), H);
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.beginPath();
    for (let x = -4.5; x <= 4.5; x += 0.05) {
      x === -4.5 ? ctx.moveTo(toX(x), toY(f(x))) : ctx.lineTo(toX(x), toY(f(x)));
    }
    ctx.strokeStyle = "#F97316";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw trail
    trail.forEach((x, i) => {
      ctx.beginPath();
      ctx.arc(toX(x), toY(f(x)), 4, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(59, 130, 246, ${(i / trail.length) * 0.5})`;
      ctx.fill();
    });

    // Draw ball
    const bx = toX(ballPos);
    const by = toY(f(ballPos));
    ctx.beginPath();
    ctx.arc(bx, by, 14, 0, Math.PI * 2);
    ctx.fillStyle = "#3B82F6";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(bx, by, 14, 0, Math.PI * 2);
    ctx.strokeStyle = "#60A5FA";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Gradient arrow
    const g = df(ballPos);
    const arrowLen = Math.min(Math.abs(g) * 25, 80);
    const dir = g > 0 ? -1 : 1;
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(bx + dir * arrowLen, by);
    ctx.strokeStyle = "#10B981";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = "#F8FAFC";
    ctx.font = "bold 20px 'JetBrains Mono'";
    ctx.textAlign = "left";
    ctx.fillText(`x = ${ballPos.toFixed(2)}`, 20, 36);
    ctx.fillText(`f(x) = ${f(ballPos).toFixed(2)}`, 20, 62);
    ctx.fillStyle = "#10B981";
    ctx.fillText(`∇f = ${df(ballPos).toFixed(2)}`, 20, 88);
  }, [ballPos, trail]);

  return (
    <div style={{ background: "#0B1120", borderRadius: 16, padding: 24, border: "1px solid #1E293B" }}>
      <div style={{ fontSize: 18, fontWeight: 700, color: "#F8FAFC", marginBottom: 4, fontFamily: "'Outfit'" }}>Gradient Descent in Action</div>
      <div style={{ fontSize: 12, color: "#64748B", fontFamily: "'JetBrains Mono'", marginBottom: 16 }}>Watch the ball roll downhill following the gradient</div>
      <canvas ref={canvasRef} style={{ width: "100%", height: 250, borderRadius: 8 }} />
      <div style={{ display: "flex", gap: 16, marginTop: 16, alignItems: "flex-end" }}>
        <label style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: "#94A3B8", fontFamily: "'JetBrains Mono'", marginBottom: 6 }}>Learning Rate: {lr.toFixed(2)}</div>
          <input type="range" min={0.01} max={0.5} step={0.01} value={lr} onChange={e => setLr(+e.target.value)} style={{ width: "100%", accentColor: "#3B82F6" }} />
        </label>
        <button onClick={() => isRunning ? setIsRunning(false) : setIsRunning(true)} style={{ background: isRunning ? "#EF4444" : "#3B82F6", border: "none", borderRadius: 8, padding: "8px 20px", color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "'JetBrains Mono'" }}>
          {isRunning ? "Pause" : "Run"}
        </button>
        <button onClick={reset} style={{ background: "#1E293B", border: "1px solid #334155", borderRadius: 8, padding: "8px 20px", color: "#94A3B8", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "'JetBrains Mono'" }}>
          Reset
        </button>
      </div>
    </div>
  );
};

const BiasVarianceViz = () => {
  const [complexity, setComplexity] = useState(3);
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width = canvas.offsetWidth * 2;
    const H = canvas.height = canvas.offsetHeight * 2;
    ctx.clearRect(0, 0, W, H);

    const bias = (x) => 3.5 * Math.exp(-0.5 * x) + 0.2;
    const variance = (x) => 0.2 + 0.3 * Math.exp(0.35 * x);
    const total = (x) => bias(x) + variance(x);

    const toX = (x) => (x / 10) * W * 0.9 + W * 0.05;
    const toY = (y) => H - (y / 6) * H * 0.8 - H * 0.08;

    // Draw curves
    const drawCurve = (fn, color, label, labelX) => {
      ctx.beginPath();
      for (let x = 0; x <= 10; x += 0.1) {
        x === 0 ? ctx.moveTo(toX(x), toY(fn(x))) : ctx.lineTo(toX(x), toY(fn(x)));
      }
      ctx.strokeStyle = color;
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.fillStyle = color;
      ctx.font = "bold 20px 'JetBrains Mono'";
      ctx.textAlign = "left";
      ctx.fillText(label, toX(labelX) + 8, toY(fn(labelX)) - 10);
    };

    drawCurve(bias, "#3B82F6", "Bias²", 1);
    drawCurve(variance, "#EF4444", "Variance", 8);
    drawCurve(total, "#F59E0B", "Total Error", 6);

    // Complexity marker
    const cx = toX(complexity);
    ctx.beginPath(); ctx.moveTo(cx, toY(0)); ctx.lineTo(cx, toY(5.5));
    ctx.strokeStyle = "#F8FAFC40"; ctx.lineWidth = 2; ctx.setLineDash([6, 4]); ctx.stroke(); ctx.setLineDash([]);

    // Dots on marker
    [[bias, "#3B82F6"], [variance, "#EF4444"], [total, "#F59E0B"]].forEach(([fn, c]) => {
      ctx.beginPath(); ctx.arc(cx, toY(fn(complexity)), 8, 0, Math.PI * 2);
      ctx.fillStyle = c; ctx.fill();
    });

    // Optimal zone
    const optX = 2.8;
    ctx.fillStyle = "#10B98130";
    ctx.fillRect(toX(optX - 0.5), toY(5.5), toX(optX + 0.5) - toX(optX - 0.5), toY(0) - toY(5.5));
    ctx.fillStyle = "#10B981";
    ctx.font = "16px 'JetBrains Mono'";
    ctx.textAlign = "center";
    ctx.fillText("Sweet Spot", toX(optX), toY(5.2));

    // Labels
    ctx.fillStyle = "#64748B";
    ctx.font = "16px 'JetBrains Mono'";
    ctx.textAlign = "center";
    ctx.fillText("Simple ← Model Complexity → Complex", W / 2, H - 6);
  }, [complexity]);

  return (
    <div style={{ background: "#0B1120", borderRadius: 16, padding: 24, border: "1px solid #1E293B" }}>
      <div style={{ fontSize: 18, fontWeight: 700, color: "#F8FAFC", marginBottom: 4, fontFamily: "'Outfit'" }}>Bias-Variance Tradeoff</div>
      <div style={{ fontSize: 12, color: "#64748B", fontFamily: "'JetBrains Mono'", marginBottom: 16 }}>Drag complexity to see how bias and variance change</div>
      <canvas ref={canvasRef} style={{ width: "100%", height: 250, borderRadius: 8 }} />
      <label style={{ display: "block", marginTop: 16 }}>
        <div style={{ fontSize: 11, color: "#94A3B8", fontFamily: "'JetBrains Mono'", marginBottom: 6 }}>
          Model Complexity: {complexity.toFixed(1)} — {complexity < 3 ? "Underfitting (high bias)" : complexity > 6 ? "Overfitting (high variance)" : "Good balance"}
        </div>
        <input type="range" min={0.5} max={9.5} step={0.1} value={complexity} onChange={e => setComplexity(+e.target.value)} style={{ width: "100%", accentColor: "#F59E0B" }} />
      </label>
    </div>
  );
};

const VISUALIZATIONS = {
  "st-p2": NormalDistViz,
  "dl-f4": GradientDescentViz,
  "ml-f2": BiasVarianceViz,
  "st-f2": NormalDistViz,
};

// ─── AI CHATBOT COMPONENT ────────────────────────────────────────────────────
const AIChatbot = ({ course, onClose }) => {
  const [messages, setMessages] = useState([
    { role: "assistant", content: `Hi! I'm your **${course.title}** tutor. Ask me anything about ${course.title.toLowerCase()} — concepts, how things work, why something matters, or help with a specific problem. I'll keep my answers focused on this topic.` }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(scrollToBottom, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const topicContext = course.topics.map(t => `${t.title}: ${t.lessons.map(l => l.title).join(", ")}`).join("\n");
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: `You are an expert ${course.title} tutor for data science students preparing for interviews. Your scope is STRICTLY limited to ${course.title} and closely related concepts. If asked about unrelated topics, politely redirect to ${course.title}.\n\nCourse topics include:\n${topicContext}\n\nBe concise but thorough. Use examples and analogies. If explaining a formula, also explain the intuition. Keep responses under 300 words unless a detailed explanation is warranted.`,
          messages: messages.filter(m => m.role !== "assistant" || messages.indexOf(m) !== 0).concat([{ role: "user", content: userMsg }]).map(m => ({ role: m.role, content: m.content }))
        })
      });
      const data = await resp.json();
      const text = data.content?.map(b => b.text || "").join("") || "I couldn't generate a response. Please try again.";
      setMessages(prev => [...prev, { role: "assistant", content: text }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I'm having trouble connecting. Please try again in a moment." }]);
    }
    setLoading(false);
  };

  const renderMarkdown = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#F8FAFC">$1</strong>')
      .replace(/`(.*?)`/g, `<code style="background:#1E293B;padding:2px 6px;border-radius:4px;font-size:12px;font-family:'JetBrains Mono',monospace;color:${course.accent}">$1</code>`)
      .replace(/\n/g, "<br/>");
  };

  return (
    <div style={{
      position: "fixed", bottom: 0, right: 0, width: "100%", maxWidth: 440, height: "70vh",
      background: "#0B1120", border: "1px solid #1E293B", borderRadius: "16px 16px 0 0",
      display: "flex", flexDirection: "column", zIndex: 1000,
      boxShadow: "0 -8px 40px rgba(0,0,0,0.5)",
    }}>
      {/* Header */}
      <div style={{ padding: "14px 20px", borderBottom: "1px solid #1E293B", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 20 }}>{course.icon}</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#F8FAFC", fontFamily: "'Outfit'" }}>{course.title} Tutor</div>
            <div style={{ fontSize: 10, color: course.accent, fontFamily: "'JetBrains Mono'" }}>AI-powered · Topic-scoped</div>
          </div>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "#64748B", fontSize: 20, cursor: "pointer", padding: 4 }}>✕</button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{
              maxWidth: "85%", padding: "10px 14px", borderRadius: 12,
              background: m.role === "user" ? course.color + "20" : "#1E293B",
              border: `1px solid ${m.role === "user" ? course.color + "30" : "#334155"}`,
            }}>
              <div
                style={{ fontSize: 13, color: "#CBD5E1", lineHeight: 1.65, fontFamily: "'Outfit'" }}
                dangerouslySetInnerHTML={{ __html: renderMarkdown(m.content) }}
              />
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", gap: 4, padding: "10px 14px" }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                width: 8, height: 8, borderRadius: "50%", background: course.accent,
                animation: `pulse 1s infinite ${i * 0.15}s`,
              }} />
            ))}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{ padding: "12px 16px", borderTop: "1px solid #1E293B", flexShrink: 0 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && sendMessage()}
            placeholder={`Ask about ${course.title.toLowerCase()}...`}
            style={{
              flex: 1, background: "#0F172A", border: "1px solid #334155", borderRadius: 10,
              padding: "10px 14px", color: "#F8FAFC", fontSize: 13, fontFamily: "'Outfit'", outline: "none",
            }}
          />
          <button onClick={sendMessage} disabled={loading || !input.trim()} style={{
            background: input.trim() && !loading ? course.color : "#1E293B",
            border: "none", borderRadius: 10, padding: "10px 16px", color: "#fff", fontWeight: 700,
            fontSize: 13, cursor: input.trim() && !loading ? "pointer" : "not-allowed", fontFamily: "'Outfit'",
          }}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
};


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN APP
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default function DataSparkPlatform() {
  const [view, setView] = useState("home");
  const [activeCourse, setActiveCourse] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [chatbotCourse, setChatbotCourse] = useState(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [showModel, setShowModel] = useState(false);
  const [progress, setProgress] = useState({});
  const [courseTab, setCourseTab] = useState("learn");
  const [diffFilter, setDiffFilter] = useState("All");

  const totalLessons = CURRICULUM.reduce((a, c) => a + c.topics.reduce((b, t) => b + t.lessons.length, 0), 0);
  const totalQuestions = CURRICULUM.reduce((a, c) => a + c.questions.length, 0);
  const completedLessons = Object.keys(progress).filter(k => progress[k] === "done").length;

  const diffBadge = (d) => {
    const c = { Easy: "#10B981", Medium: "#F59E0B", Hard: "#EF4444" };
    return <span style={{ background: c[d] + "15", color: c[d], padding: "2px 10px", borderRadius: 20, fontSize: 10, fontWeight: 700, letterSpacing: "0.5px", textTransform: "uppercase", border: `1px solid ${c[d]}25`, fontFamily: "'JetBrains Mono'" }}>{d}</span>;
  };

  // ─── HOME VIEW ─────────────────────────────────────────────────────────────
  const renderHome = () => (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 20px" }}>
      {/* Hero */}
      <div style={{ textAlign: "center", padding: "56px 0 44px" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: "linear-gradient(135deg, #0EA5E9, #8B5CF6, #F59E0B)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24,
          }}>⚡</div>
          <span style={{
            fontSize: 44, fontWeight: 900, fontFamily: "'Outfit'",
            background: "linear-gradient(135deg, #F8FAFC 0%, #94A3B8 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>DataSpark</span>
        </div>
        <p style={{ color: "#94A3B8", fontSize: 16, maxWidth: 560, margin: "0 auto", lineHeight: 1.7, fontFamily: "'Outfit'", fontWeight: 300 }}>
          Learn data science concepts visually. Practice with context-rich problems.
          Get AI tutoring scoped to each topic. Prepare for interviews that test how you <em style={{ color: "#F8FAFC" }}>think</em>, not just what you know.
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: 32, marginTop: 32, padding: "18px 0", borderTop: "1px solid #1E293B", borderBottom: "1px solid #1E293B" }}>
          {[{ n: CURRICULUM.length, l: "Courses" }, { n: totalLessons, l: "Lessons" }, { n: totalQuestions, l: "Practice Qs" }, { n: completedLessons, l: "Completed" }].map((s, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: "#F8FAFC", fontFamily: "'Outfit'" }}>{s.n}</div>
              <div style={{ fontSize: 10, color: "#64748B", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", fontFamily: "'JetBrains Mono'" }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Course Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))", gap: 14, paddingBottom: 60 }}>
        {CURRICULUM.map((course) => {
          const lessonCount = course.topics.reduce((a, t) => a + t.lessons.length, 0);
          const doneCount = course.topics.reduce((a, t) => a + t.lessons.filter(l => progress[l.id] === "done").length, 0);
          const pct = lessonCount > 0 ? Math.round((doneCount / lessonCount) * 100) : 0;

          return (
            <div
              key={course.id}
              onClick={() => { setActiveCourse(course); setView("course"); setCourseTab("learn"); }}
              style={{
                background: "#0C1425", border: "1px solid #1E293B", borderRadius: 14,
                padding: "22px 20px", cursor: "pointer", transition: "all 0.25s",
                position: "relative", overflow: "hidden",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = course.color + "50"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 32px ${course.color}10`; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#1E293B"; e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
            >
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${course.color}, transparent)` }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <span style={{ fontSize: 28 }}>{course.icon}</span>
                <span style={{ fontSize: 10, color: "#475569", fontFamily: "'JetBrains Mono'", fontWeight: 600 }}>{lessonCount} lessons · {course.questions.length} Qs</span>
              </div>
              <div style={{ fontSize: 17, fontWeight: 700, color: "#F8FAFC", fontFamily: "'Outfit'", marginBottom: 6 }}>{course.title}</div>
              <div style={{ fontSize: 12, color: "#64748B", lineHeight: 1.6, fontFamily: "'Outfit'", fontWeight: 300, marginBottom: 14, minHeight: 40 }}>{course.description}</div>

              {/* Topic pills */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 14 }}>
                {course.topics.slice(0, 3).map(t => (
                  <span key={t.id} style={{ fontSize: 9, padding: "2px 7px", borderRadius: 4, background: "#1E293B", color: "#94A3B8", fontFamily: "'JetBrains Mono'" }}>{t.title}</span>
                ))}
                {course.topics.length > 3 && <span style={{ fontSize: 9, padding: "2px 7px", borderRadius: 4, background: "#1E293B", color: "#64748B", fontFamily: "'JetBrains Mono'" }}>+{course.topics.length - 3}</span>}
              </div>

              {/* Progress */}
              <div style={{ background: "#1E293B", borderRadius: 4, height: 3, overflow: "hidden" }}>
                <div style={{ width: `${pct}%`, height: "100%", background: course.color, borderRadius: 4, transition: "width 0.4s" }} />
              </div>
              <div style={{ fontSize: 10, color: "#475569", marginTop: 4, fontFamily: "'JetBrains Mono'" }}>{pct}% complete</div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // ─── COURSE VIEW ───────────────────────────────────────────────────────────
  const renderCourse = () => {
    if (!activeCourse) return null;
    const c = activeCourse;

    return (
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 20px" }}>
        <button onClick={() => setView("home")} style={{ background: "none", border: "none", color: "#64748B", fontSize: 12, cursor: "pointer", padding: "20px 0 8px", fontFamily: "'JetBrains Mono'" }}>← All Courses</button>

        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 8 }}>
          <span style={{ fontSize: 36 }}>{c.icon}</span>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: "#F8FAFC", fontFamily: "'Outfit'", margin: 0 }}>{c.title}</h1>
            <p style={{ fontSize: 13, color: "#64748B", fontFamily: "'Outfit'", margin: 0, fontWeight: 300 }}>{c.description}</p>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 0, borderBottom: "1px solid #1E293B", margin: "20px 0 24px" }}>
          {[{ id: "learn", label: `Learn (${c.topics.reduce((a, t) => a + t.lessons.length, 0)} lessons)` }, { id: "practice", label: `Practice (${c.questions.length} questions)` }].map(tab => (
            <button key={tab.id} onClick={() => setCourseTab(tab.id)} style={{
              background: "none", border: "none", borderBottom: courseTab === tab.id ? `2px solid ${c.color}` : "2px solid transparent",
              padding: "10px 22px", color: courseTab === tab.id ? "#F8FAFC" : "#64748B", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Outfit'",
            }}>{tab.label}</button>
          ))}
          <button onClick={() => setChatbotCourse(c)} style={{
            marginLeft: "auto", background: c.color + "15", border: `1px solid ${c.color}30`, borderRadius: 8,
            padding: "6px 14px", color: c.accent, fontSize: 12, cursor: "pointer", fontFamily: "'JetBrains Mono'", fontWeight: 600, marginBottom: 8,
          }}>
            💬 Ask AI Tutor
          </button>
        </div>

        {courseTab === "learn" && (
          <div>
            {c.topics.map(topic => (
              <div key={topic.id} style={{ marginBottom: 32 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: c.accent, fontFamily: "'Outfit'", marginBottom: 10, paddingBottom: 6, borderBottom: `1px solid ${c.color}15` }}>{topic.title}</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {topic.lessons.map((lesson, li) => {
                    const isDone = progress[lesson.id] === "done";
                    return (
                      <div
                        key={lesson.id}
                        onClick={() => { setActiveLesson(lesson); setView("lesson"); }}
                        style={{
                          background: "#0C1425", border: "1px solid #1E293B", borderRadius: 10,
                          padding: "12px 16px", cursor: "pointer", display: "flex", alignItems: "center",
                          justifyContent: "space-between", transition: "border-color 0.2s",
                        }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = c.color + "30"}
                        onMouseLeave={e => e.currentTarget.style.borderColor = "#1E293B"}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{
                            width: 28, height: 28, borderRadius: "50%",
                            background: isDone ? "#10B98120" : "#1E293B",
                            border: `2px solid ${isDone ? "#10B981" : "#334155"}`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 12, color: isDone ? "#10B981" : "#475569", fontWeight: 700,
                          }}>
                            {isDone ? "✓" : li + 1}
                          </div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: "#F8FAFC", fontFamily: "'Outfit'" }}>{lesson.title}</div>
                            <div style={{ fontSize: 10, color: "#64748B", fontFamily: "'JetBrains Mono'", marginTop: 2 }}>{lesson.duration}</div>
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          {lesson.hasViz && <span style={{ fontSize: 9, padding: "2px 7px", borderRadius: 4, background: c.color + "15", color: c.accent, fontFamily: "'JetBrains Mono'", fontWeight: 600 }}>Interactive</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {courseTab === "practice" && (
          <div>
            <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
              {["All", "Easy", "Medium", "Hard"].map(d => (
                <button key={d} onClick={() => setDiffFilter(d)} style={{
                  background: diffFilter === d ? "#1E293B" : "transparent", border: `1px solid ${diffFilter === d ? "#334155" : "#1E293B"}`,
                  borderRadius: 6, padding: "5px 12px", color: diffFilter === d ? "#F8FAFC" : "#64748B", fontSize: 11, cursor: "pointer", fontFamily: "'JetBrains Mono'", fontWeight: 600,
                }}>{d}</button>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {c.questions.filter(q => diffFilter === "All" || q.difficulty === diffFilter).map(q => (
                <div
                  key={q.id}
                  onClick={() => { setActiveQuestion(q); setUserAnswer(""); setSubmitted(false); setShowModel(false); setView("question"); }}
                  style={{
                    background: "#0C1425", border: "1px solid #1E293B", borderRadius: 10,
                    padding: "14px 18px", cursor: "pointer", transition: "border-color 0.2s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = c.color + "30"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "#1E293B"}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#F8FAFC", fontFamily: "'Outfit'", marginBottom: 4 }}>{q.title}</div>
                      <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                        {q.tags.map(t => <span key={t} style={{ fontSize: 9, padding: "2px 6px", borderRadius: 4, background: "#1E293B", color: "#94A3B8", fontFamily: "'JetBrains Mono'" }}>{t}</span>)}
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                      <span style={{ fontSize: 10, color: "#64748B", fontFamily: "'JetBrains Mono'" }}>{q.type === "code" ? "Coding" : "Open-ended"}</span>
                      {diffBadge(q.difficulty)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // ─── LESSON VIEW ───────────────────────────────────────────────────────────
  const renderLesson = () => {
    if (!activeLesson || !activeCourse) return null;
    const VizComponent = VISUALIZATIONS[activeLesson.id];

    return (
      <div style={{ maxWidth: 820, margin: "0 auto", padding: "0 20px" }}>
        <button onClick={() => setView("course")} style={{ background: "none", border: "none", color: "#64748B", fontSize: 12, cursor: "pointer", padding: "20px 0 8px", fontFamily: "'JetBrains Mono'" }}>← Back to {activeCourse.title}</button>

        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 10, color: activeCourse.accent, fontFamily: "'JetBrains Mono'", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 4 }}>{activeCourse.title} · {activeLesson.duration}</div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "#F8FAFC", fontFamily: "'Outfit'", margin: 0 }}>{activeLesson.title}</h1>
        </div>

        {/* Visualization */}
        {VizComponent && (
          <div style={{ marginBottom: 28 }}>
            <VizComponent />
          </div>
        )}

        {!VizComponent && activeLesson.hasViz && (
          <div style={{
            background: "#0C1425", border: `1px dashed ${activeCourse.color}30`, borderRadius: 14,
            padding: 40, textAlign: "center", marginBottom: 28,
          }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🎨</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: "#F8FAFC", fontFamily: "'Outfit'", marginBottom: 4 }}>Interactive Visualization</div>
            <div style={{ fontSize: 12, color: "#64748B", fontFamily: "'JetBrains Mono'" }}>Animated diagram for this concept would render here</div>
          </div>
        )}

        {/* Lesson content placeholder */}
        <div style={{ background: "#0C1425", border: "1px solid #1E293B", borderRadius: 14, padding: "28px 24px", marginBottom: 24 }}>
          <div style={{ fontSize: 14, color: "#CBD5E1", lineHeight: 1.8, fontFamily: "'Outfit'", fontWeight: 300 }}>
            <p style={{ marginBottom: 16 }}>This lesson covers <strong style={{ color: "#F8FAFC" }}>{activeLesson.title}</strong> in depth. The full content includes conceptual explanations, worked examples, common pitfalls, and practical applications in data science contexts.</p>
            <p style={{ marginBottom: 16 }}>Each concept is broken down with <span style={{ color: activeCourse.accent }}>visual aids</span> and real-world analogies to build true intuition — not just memorization of formulas or syntax.</p>
            <p>After completing this lesson, test your understanding with the practice questions in the <strong style={{ color: "#F8FAFC" }}>Practice</strong> tab, or ask the <strong style={{ color: "#F8FAFC" }}>AI Tutor</strong> to explain anything that's unclear.</p>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginBottom: 40 }}>
          <button
            onClick={() => { setProgress(p => ({ ...p, [activeLesson.id]: "done" })); setView("course"); }}
            style={{
              flex: 1, background: `linear-gradient(135deg, ${activeCourse.color}, ${activeCourse.accent})`,
              border: "none", borderRadius: 10, padding: "12px 0", color: "#fff", fontSize: 14,
              fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit'",
            }}>
            Mark Complete & Continue →
          </button>
          <button
            onClick={() => setChatbotCourse(activeCourse)}
            style={{
              background: "#1E293B", border: "1px solid #334155", borderRadius: 10, padding: "12px 20px",
              color: "#F8FAFC", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'Outfit'",
            }}>
            💬 Ask Tutor
          </button>
        </div>
      </div>
    );
  };

  // ─── QUESTION VIEW ─────────────────────────────────────────────────────────
  const renderQuestion = () => {
    if (!activeQuestion || !activeCourse) return null;
    const q = activeQuestion;

    return (
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 20px" }}>
        <button onClick={() => { setCourseTab("practice"); setView("course"); }} style={{ background: "none", border: "none", color: "#64748B", fontSize: 12, cursor: "pointer", padding: "20px 0 8px", fontFamily: "'JetBrains Mono'" }}>← Back to Practice</button>

        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            {diffBadge(q.difficulty)}
            <span style={{ fontSize: 10, color: "#64748B", fontFamily: "'JetBrains Mono'" }}>{q.type === "code" ? "Coding Problem" : "Open-Ended Case Study"}</span>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#F8FAFC", fontFamily: "'Outfit'", margin: 0 }}>{q.title}</h1>
          <div style={{ display: "flex", gap: 5, marginTop: 8 }}>
            {q.tags.map(t => <span key={t} style={{ fontSize: 9, padding: "2px 7px", borderRadius: 4, background: "#1E293B", color: "#94A3B8", fontFamily: "'JetBrains Mono'" }}>{t}</span>)}
          </div>
        </div>

        {/* Problem */}
        <div style={{
          background: "#0C1425", border: "1px solid #1E293B", borderRadius: 12,
          padding: "20px 22px", marginBottom: 20, fontSize: 13, color: "#CBD5E1",
          lineHeight: 1.75, fontFamily: "'Outfit'", whiteSpace: "pre-wrap",
        }}>
          {q.prompt}
        </div>

        {/* Answer area */}
        <textarea
          value={userAnswer}
          onChange={e => setUserAnswer(e.target.value)}
          placeholder={q.type === "code" ? "Write your code here..." : "Write your answer — explain your reasoning, tradeoffs, and approach..."}
          disabled={submitted}
          style={{
            width: "100%", minHeight: 280, background: "#080E1A", border: "1px solid #1E293B",
            borderRadius: 12, padding: 18, color: "#F8FAFC", fontSize: 13, resize: "vertical",
            fontFamily: q.type === "code" ? "'JetBrains Mono', monospace" : "'Outfit'",
            lineHeight: 1.7, outline: "none", boxSizing: "border-box", opacity: submitted ? 0.6 : 1,
          }}
        />

        <div style={{ display: "flex", gap: 10, marginTop: 16, marginBottom: 20 }}>
          {!submitted && (
            <button
              onClick={() => setSubmitted(true)}
              disabled={!userAnswer.trim()}
              style={{
                flex: 1, background: userAnswer.trim() ? `linear-gradient(135deg, ${activeCourse.color}, ${activeCourse.accent})` : "#1E293B",
                border: "none", borderRadius: 10, padding: "12px 0", color: userAnswer.trim() ? "#fff" : "#475569",
                fontSize: 14, fontWeight: 700, cursor: userAnswer.trim() ? "pointer" : "not-allowed", fontFamily: "'Outfit'",
              }}>
              Submit Answer
            </button>
          )}
          {submitted && !showModel && (
            <button
              onClick={() => setShowModel(true)}
              style={{
                flex: 1, background: "#10B981", border: "none", borderRadius: 10, padding: "12px 0",
                color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit'",
              }}>
              Show Model Answer & Rubric
            </button>
          )}
          <button
            onClick={() => setChatbotCourse(activeCourse)}
            style={{
              background: "#1E293B", border: "1px solid #334155", borderRadius: 10, padding: "12px 20px",
              color: "#F8FAFC", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Outfit'",
            }}>
            💬 Get Help
          </button>
        </div>

        {showModel && (
          <div style={{
            background: "#0C1425", border: "1px solid #10B98130", borderRadius: 12,
            padding: "22px 24px", marginBottom: 40,
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#10B981", fontFamily: "'JetBrains Mono'", marginBottom: 12, textTransform: "uppercase", letterSpacing: "1px" }}>
              Model Answer & Evaluation Criteria
            </div>
            <div style={{ fontSize: 13, color: "#94A3B8", lineHeight: 1.7, fontFamily: "'Outfit'", fontWeight: 300 }}>
              <p style={{ marginBottom: 12 }}>A strong answer to this question would demonstrate clear understanding of the core concepts, structured reasoning about tradeoffs, and practical awareness of real-world constraints.</p>
              <p style={{ marginBottom: 12 }}>The AI evaluator scores your response against the rubric below — compare your answer point-by-point to identify gaps.</p>
              <p style={{ color: "#64748B", fontSize: 12, fontStyle: "italic" }}>Full model answers with detailed rubric scoring are available in the complete platform. Use the AI Tutor to discuss your specific answer and get personalized feedback.</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ minHeight: "100vh", background: "#080E1A", color: "#F8FAFC", fontFamily: "'Outfit', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.3 } }
        ::selection { background: #8B5CF630; }
        textarea:focus, input:focus { border-color: #334155 !important; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1E293B; border-radius: 3px; }
        input[type="range"] { height: 4px; }
      `}</style>

      {/* Nav */}
      <nav style={{
        borderBottom: "1px solid #1E293B", padding: "10px 20px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, background: "#080E1Aee", backdropFilter: "blur(12px)", zIndex: 100,
      }}>
        <div onClick={() => { setView("home"); setActiveCourse(null); }} style={{
          display: "flex", alignItems: "center", gap: 8, cursor: "pointer",
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: 7,
            background: "linear-gradient(135deg, #0EA5E9, #8B5CF6)", display: "flex",
            alignItems: "center", justifyContent: "center", fontSize: 14,
          }}>⚡</div>
          <span style={{ fontSize: 18, fontWeight: 800, color: "#F8FAFC", fontFamily: "'Outfit'" }}>DataSpark</span>
        </div>

        <div style={{ display: "flex", gap: 4, overflowX: "auto", maxWidth: "70%" }}>
          {CURRICULUM.slice(0, 6).map(c => (
            <button
              key={c.id}
              onClick={() => { setActiveCourse(c); setView("course"); setCourseTab("learn"); }}
              style={{
                background: activeCourse?.id === c.id ? "#1E293B" : "transparent",
                border: "none", borderRadius: 6, padding: "5px 10px", color: activeCourse?.id === c.id ? "#F8FAFC" : "#64748B",
                fontSize: 11, cursor: "pointer", fontFamily: "'JetBrains Mono'", fontWeight: 500, whiteSpace: "nowrap",
              }}
            >
              {c.icon} {c.title.split(" ")[0]}
            </button>
          ))}
        </div>
      </nav>

      <main style={{ paddingBottom: 60 }}>
        {view === "home" && renderHome()}
        {view === "course" && renderCourse()}
        {view === "lesson" && renderLesson()}
        {view === "question" && renderQuestion()}
      </main>

      {/* AI Chatbot */}
      {chatbotCourse && <AIChatbot course={chatbotCourse} onClose={() => setChatbotCourse(null)} />}
    </div>
  );
}
