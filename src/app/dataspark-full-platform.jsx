import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import AIChatbot from "../chatbot/AIChatbot.jsx";
import SQLJoins from "../visualizations/SQLJoins.jsx";
import TrainValTestSplit from "../visualizations/TrainValTestSplit.jsx";
import PythonMutabilityViz from "../visualizations/PythonMutabilityViz.jsx";
import VariableBindingLab from "../visualizations/VariableBindingLab.jsx";
import StringFormatAtelier from "../visualizations/StringFormatAtelier.jsx";
import HashLab from "../visualizations/HashLab.jsx";
import ComprehensionForge from "../visualizations/ComprehensionForge.jsx";
import BranchRouter from "../visualizations/BranchRouter.jsx";
import IteratorEngine from "../visualizations/IteratorEngine.jsx";
import ArgumentBinder from "../visualizations/ArgumentBinder.jsx";
import FoldMachine from "../visualizations/FoldMachine.jsx";
import TracebackTheater from "../visualizations/TracebackTheater.jsx";
import KMeansClustering from "../visualizations/KMeansClustering.jsx";
import ConfusionMatrix from "../visualizations/ConfusionMatrix.jsx";
import DecisionTree from "../visualizations/DecisionTree.jsx";
import LinearRegression from "../visualizations/LinearRegression.jsx";
import LogisticRegression from "../visualizations/LogisticRegression.jsx";
import PCA from "../visualizations/PCA.jsx";
import ROCCurve from "../visualizations/ROCCurve.jsx";
import WindowFunctions from "../visualizations/WindowFunctions.jsx";
import FeatureScaling from "../visualizations/FeatureScaling.jsx";
import NeuralNetwork from "../visualizations/NeuralNetwork.jsx";
import Attention from "../visualizations/Attention.jsx";
import BackpropAnimation from "../visualizations/BackpropAnimation.jsx";
import ActivationFunctions from "../visualizations/ActivationFunctions.jsx";
import ConvolutionFilter from "../visualizations/ConvolutionFilter.jsx";
import BayesTheorem from "../visualizations/BayesTheorem.jsx";
import HypothesisTesting from "../visualizations/HypothesisTesting.jsx";
import CrossValidation from "../visualizations/CrossValidation.jsx";
import ABTestSimulator from "../visualizations/ABTestSimulator.jsx";
import FunnelAnalysis from "../visualizations/FunnelAnalysis.jsx";
import RegularizationEffect from "../visualizations/RegularizationEffect.jsx";
import TimeSeriesDecomposition from "../visualizations/TimeSeriesDecomposition.jsx";
import WordEmbeddings from "../visualizations/WordEmbeddings.jsx";
import RecSysCollaborativeFiltering from "../visualizations/RecSysCollaborativeFiltering.jsx";
import BatchVsStreaming from "../visualizations/BatchVsStreaming.jsx";
import ETLPipeline from "../visualizations/ETLPipeline.jsx";
import StreamingEnginesTrinity from "../visualizations/StreamingEnginesTrinity.jsx";
import WarehouseStarSchema from "../visualizations/WarehouseStarSchema.jsx";
import MLSystemPipeline from "../visualizations/MLSystemPipeline.jsx";
import FeatureStoreViz from "../visualizations/FeatureStoreViz.jsx";
import VizLabShell from "../components/platform/VizLabShell.jsx";
import LessonModule from "../components/platform/LessonModule.jsx";
import { getResolvedLessonModule } from "../data/lesson-modules.js";
import { PYTHON_QUESTIONS } from "../data/questions-python.js";
import { STATISTICS_QUESTIONS } from "../data/questions-statistics.js";
import { DS, dsGlassCard } from "../lib/ds-platform-tokens.js";

const PlatformLogo = () => (
  <svg width="26" height="26" viewBox="0 0 40 40" fill="none" style={{ display: "block", flexShrink: 0 }}>
    <circle cx="20" cy="8" r="4" fill={DS.ind} /><circle cx="10" cy="30" r="4" fill={DS.grn} />
    <circle cx="30" cy="30" r="4" fill={DS.ind} /><circle cx="20" cy="20" r="4.5" fill={DS.t2} />
    <line x1="20" y1="8" x2="20" y2="20" stroke={DS.ind} strokeWidth="2" opacity=".5" />
    <line x1="10" y1="30" x2="20" y2="20" stroke={DS.grn} strokeWidth="2" opacity=".5" />
    <line x1="30" y1="30" x2="20" y2="20" stroke={DS.ind} strokeWidth="2" opacity=".5" />
  </svg>
);

/** Monogram chip — consistent across OS/fonts (replaces emoji course icons). */
function CourseMark({ color, mark, size = "lg" }) {
  const dims = { lg: 52, md: 44, sm: 26 };
  const dim = dims[size] ?? 52;
  const fs = mark.length > 4 ? 9 : mark.length > 2 ? 10 : size === "sm" ? 9 : 12;
  return (
    <span
      aria-hidden
      style={{
        width: dim,
        height: dim,
        minWidth: dim,
        borderRadius: size === "sm" ? 8 : 13,
        background: `linear-gradient(145deg, ${color}28, ${color}0a)`,
        border: `1px solid ${color}50`,
        boxShadow: size === "sm" ? `0 2px 8px ${color}14` : `0 6px 18px ${color}18`,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: fs,
        fontWeight: 700,
        color,
        letterSpacing: "0.03em",
        lineHeight: 1,
        padding: "0 4px",
        flexShrink: 0,
        ...(size === "lg" ? { marginBottom: 10 } : {}),
      }}
    >
      {mark}
    </span>
  );
}

// â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
// DATASPARK â€” Complete Data Science Learning Platform
// â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”

// â”€â”€â”€ FULL CURRICULUM DATA â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const CURRICULUM = [
  {
    id: "python",
    title: "Python Fundamentals",
    mark: "PY",
    color: "#3B82F6",
    accent: "#60A5FA",
    description: "The foundation of every data science career. Master Python's core â€” not just syntax, but how to think programmatically.",
    topics: [
      {
        id: "py-basics",
        title: "Core Syntax & Data Types",
        lessons: [
          { id: "py-b1", title: "Variables, Types & Type Hints", duration: "15 min", hasViz: true },
          { id: "py-b2", title: "Strings, f-strings & String Methods", duration: "18 min", hasViz: true },
          { id: "py-b3", title: "Lists, Tuples & Mutability", duration: "18 min", hasViz: true },
          { id: "py-b4", title: "Dictionaries & Sets", duration: "20 min", hasViz: true },
          { id: "py-b5", title: "Comprehensions: The Pythonic Way", duration: "18 min", hasViz: true },
        ]
      },
      {
        id: "py-control",
        title: "Control Flow & Functions",
        lessons: [
          { id: "py-c1", title: "Conditionals & Pattern Matching", duration: "18 min", hasViz: true },
          { id: "py-c2", title: "Loops, Iterators & Generators", duration: "20 min", hasViz: true },
          { id: "py-c3", title: "Functions: Args, *args, **kwargs", duration: "15 min", hasViz: true },
          { id: "py-c4", title: "Lambda, Map, Filter, Reduce", duration: "12 min", hasViz: true },
          { id: "py-c5", title: "Error Handling & Debugging", duration: "18 min", hasViz: true },
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
    questions: PYTHON_QUESTIONS,
  },
  {
    id: "sql",
    title: "SQL & Databases",
    mark: "SQL",
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
          { id: "sq-d1", title: "Normalization: 1NF â†’ 3NF â†’ BCNF", duration: "20 min", hasViz: true },
          { id: "sq-d2", title: "Indexing Strategies", duration: "18 min", hasViz: true },
          { id: "sq-d3", title: "Star Schema vs Snowflake Schema", duration: "15 min", hasViz: true },
          { id: "sq-d4", title: "OLTP vs OLAP: Choosing the Right DB", duration: "12 min", hasViz: true },
        ]
      }
    ],
    questions: [
      { id: "sqq1", title: "Revenue by Customer Segment", difficulty: "Easy", type: "code", prompt: "Write a query returning each customer segment, unique purchasers, total revenue (completed orders only), and avg order value. Filter to segments with >$10K revenue.", tags: ["joins", "aggregation", "HAVING"] },
      { id: "sqq2", title: "Cohort Retention Analysis", difficulty: "Hard", type: "code", prompt: "Build a monthly cohort retention table showing cohort_month, cohort_size, months_since_signup (0-6), retained_users, and retention_rate for the last 12 months.", tags: ["CTEs", "window-functions", "cohort-analysis"] },
      { id: "sqq3", title: "Funnel Conversion by City", difficulty: "Medium", type: "code", prompt: "Calculate step-over-step conversion rates for a 5-step funnel (app_open â†’ search â†’ select â†’ confirm â†’ complete) broken down by city for the last 30 days.", tags: ["conditional-aggregation", "funnel", "product-analytics"] },
      { id: "sqq4", title: "Recursive Org Chart", difficulty: "Hard", type: "code", prompt: "Using a recursive CTE, generate a full org hierarchy showing employee, manager, level, full chain path, and team size (all direct + indirect reports).", tags: ["recursive-CTE", "hierarchy", "self-join"] },
      { id: "sqq5", title: "Running Total with Gaps", difficulty: "Medium", type: "code", prompt: "Calculate daily signups with a running total, day-over-day change, and 7-day moving average. Handle days with zero signups using a date series.", tags: ["window-functions", "date-series", "running-totals"] },
      { id: "sqq6", title: "Duplicate Detection & Cleanup", difficulty: "Easy", type: "code", prompt: "Find duplicate listings (same host_id, title, city), show counts, then write a DELETE keeping only the most recently updated record per group.", tags: ["deduplication", "ROW_NUMBER", "data-quality"] },
    ]
  },
  {
    id: "statistics",
    title: "Statistics & Probability",
    mark: "STAT",
    color: "#8B5CF6",
    accent: "#A78BFA",
    description: "The mathematical backbone. Understand distributions, hypothesis testing, and statistical thinking â€” not just formulas, but intuition.",
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
    questions: STATISTICS_QUESTIONS,
  },
  {
    id: "ml",
    title: "Machine Learning",
    mark: "ML",
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
    mark: "DL",
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
    mark: "GEN",
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
    mark: "PM",
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
      { id: "psq2", title: "Conversion Dropped 25% â€” Now What?", difficulty: "Hard", type: "open-ended", prompt: "DoorDash weekend conversion dropped from 32% to 24%. Walk through your investigation: framework, first 5 analyses, hypotheses ranked, distinguishing data issues from real problems, and what you present to the VP by EOD.", tags: ["metric-investigation", "debugging", "stakeholders"] },
      { id: "psq3", title: "A/B Test Shows Contradictory Results", difficulty: "Hard", type: "open-ended", prompt: "Netflix A/B test: +5% CTR, -3% viewing hours, +8% titles started. PM wants to ship. Content team is worried. Interpret the results, propose additional analyses, and make a recommendation.", tags: ["AB-testing", "tradeoffs", "experimentation"] },
      { id: "psq4", title: "Build vs Buy: ML Monitoring", difficulty: "Medium", type: "open-ended", prompt: "Team of 6, patchwork monitoring. Evaluate build vs buy for ML monitoring. Cover decision criteria, cost comparison, hidden costs, recommendation, and executive presentation.", tags: ["build-vs-buy", "decision-framework", "communication"] },
    ]
  },
  {
    id: "system-design",
    title: "System Design & Architecture",
    mark: "SYS",
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
      { id: "sdq2", title: "Recommendation System for 400M Users", difficulty: "Hard", type: "open-ended", prompt: "Design a multi-stage recommendation pipeline: candidate gen â†’ ranking â†’ re-ranking. Cover embedding strategy, explore/exploit, offline vs online evaluation, real-time personalization, and cold-start.", tags: ["recommendations", "scale", "ML-systems"] },
      { id: "sdq3", title: "Data Warehouse Migration Plan", difficulty: "Medium", type: "open-ended", prompt: "Migrate from Postgres to cloud warehouse. 5TB data, 300 dbt models, 50 Looker dashboards, team of 7. Cover warehouse choice, migration strategy, zero downtime, validation, dbt changes, timeline.", tags: ["migration", "data-warehouse", "dbt"] },
    ]
  },
  {
    id: "mlops",
    title: "MLOps, Cloud & Tools",
    mark: "OPS",
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
      { id: "moq2", title: "Your Model is Drifting â€” Now What?", difficulty: "Medium", type: "open-ended", prompt: "You get an alert that your production model's prediction distribution has shifted significantly from training. Walk through your response: investigation, diagnosis, short-term fix, long-term prevention.", tags: ["monitoring", "drift", "production"] },
      { id: "moq3", title: "Build a Model Serving API", difficulty: "Easy", type: "code", prompt: "Build a FastAPI endpoint that loads a trained sklearn model, accepts JSON input, validates it with Pydantic, returns predictions with confidence scores, and handles errors gracefully.", tags: ["FastAPI", "deployment", "API"] },
    ]
  },
  {
    id: "specialized",
    title: "Specialized AI",
    mark: "ADV",
    color: "#EF4444",
    accent: "#F87171",
    description: "Deep dives into recommendation engines, time series analysis, and NLP â€” the specialized skills that make you stand out.",
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

// â”€â”€â”€ INTERACTIVE VISUALIZATIONS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
      ctx.fillText(`Î¼ = ${mean.toFixed(1)}`, meanX, 30);

      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [mean, stdDev]);

  return (
    <>
      <div style={{ fontSize: 17, fontWeight: 700, color: DS.t1, marginBottom: 4, fontFamily: "var(--ds-sans), sans-serif" }}>Normal distribution explorer</div>
      <div style={{ fontSize: 12, color: DS.t3, fontFamily: "var(--ds-mono), monospace", marginBottom: 16, lineHeight: 1.55 }}>Drag the sliders to see how Î¼ and Ïƒ change the shape â€” same family as the landing â€œsystemsâ€ story: intuition first.</div>
      <canvas ref={canvasRef} style={{ width: "100%", height: 280, borderRadius: 12, border: `1px solid ${DS.border}`, background: "rgba(255,255,255,0.02)" }} />
      <div style={{ display: "flex", gap: 24, marginTop: 16 }}>
        <label style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: DS.t3, fontFamily: "var(--ds-mono), monospace", marginBottom: 6 }}>Mean (Î¼): {mean.toFixed(1)}</div>
          <input type="range" min={-3} max={3} step={0.1} value={mean} onChange={e => setMean(+e.target.value)} style={{ width: "100%", accentColor: DS.indB }} />
        </label>
        <label style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: DS.t3, fontFamily: "var(--ds-mono), monospace", marginBottom: 6 }}>Std Dev (Ïƒ): {stdDev.toFixed(1)}</div>
          <input type="range" min={0.3} max={3} step={0.1} value={stdDev} onChange={e => setStdDev(+e.target.value)} style={{ width: "100%", accentColor: DS.ind }} />
        </label>
      </div>
    </>
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
    ctx.fillText(`âˆ‡f = ${df(ballPos).toFixed(2)}`, 20, 88);
  }, [ballPos, trail]);

  return (
    <>
      <div style={{ fontSize: 17, fontWeight: 700, color: DS.t1, marginBottom: 4, fontFamily: "var(--ds-sans), sans-serif" }}>Gradient descent in action</div>
      <div style={{ fontSize: 12, color: DS.t3, fontFamily: "var(--ds-mono), monospace", marginBottom: 16, lineHeight: 1.55 }}>Watch the ball roll downhill following the gradient â€” learning rate is the step size.</div>
      <canvas ref={canvasRef} style={{ width: "100%", height: 250, borderRadius: 12, border: `1px solid ${DS.border}`, background: "rgba(255,255,255,0.02)" }} />
      <div style={{ display: "flex", gap: 16, marginTop: 16, alignItems: "flex-end", flexWrap: "wrap" }}>
        <label style={{ flex: 1, minWidth: 160 }}>
          <div style={{ fontSize: 11, color: DS.t3, fontFamily: "var(--ds-mono), monospace", marginBottom: 6 }}>Learning rate: {lr.toFixed(2)}</div>
          <input type="range" min={0.01} max={0.5} step={0.01} value={lr} onChange={e => setLr(+e.target.value)} style={{ width: "100%", accentColor: DS.indB }} />
        </label>
        <button type="button" onClick={() => isRunning ? setIsRunning(false) : setIsRunning(true)} style={{ background: isRunning ? "#EF4444" : DS.indB, border: "none", borderRadius: DS.radiusSm, padding: "8px 20px", color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "var(--ds-mono), monospace", boxShadow: isRunning ? "none" : DS.shadowCta }}>
          {isRunning ? "Pause" : "Run"}
        </button>
        <button type="button" onClick={reset} style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${DS.border}`, borderRadius: DS.radiusSm, padding: "8px 20px", color: DS.t3, fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "var(--ds-mono), monospace" }}>
          Reset
        </button>
      </div>
    </>
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

    drawCurve(bias, "#3B82F6", "BiasÂ²", 1);
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
    ctx.fillText("Simple â† Model Complexity â†’ Complex", W / 2, H - 6);
  }, [complexity]);

  return (
    <>
      <div style={{ fontSize: 17, fontWeight: 700, color: DS.t1, marginBottom: 4, fontFamily: "var(--ds-sans), sans-serif" }}>Biasâ€“variance tradeoff</div>
      <div style={{ fontSize: 12, color: DS.t3, fontFamily: "var(--ds-mono), monospace", marginBottom: 16, lineHeight: 1.55 }}>Drag complexity â€” the landing page promises reasoning, not memorization; this is the core tension behind that.</div>
      <canvas ref={canvasRef} style={{ width: "100%", height: 250, borderRadius: 12, border: `1px solid ${DS.border}`, background: "rgba(255,255,255,0.02)" }} />
      <label style={{ display: "block", marginTop: 16 }}>
        <div style={{ fontSize: 11, color: DS.t3, fontFamily: "var(--ds-mono), monospace", marginBottom: 6 }}>
          Model complexity: {complexity.toFixed(1)} â€” {complexity < 3 ? "Underfitting (high bias)" : complexity > 6 ? "Overfitting (high variance)" : "Good balance"}
        </div>
        <input type="range" min={0.5} max={9.5} step={0.1} value={complexity} onChange={e => setComplexity(+e.target.value)} style={{ width: "100%", accentColor: DS.grn }} />
      </label>
    </>
  );
};

const VISUALIZATIONS = {
  "st-p1": BayesTheorem,
  "st-i1": HypothesisTesting,
  "st-a1": ABTestSimulator,
  "st-p2": NormalDistViz,
  "dl-f1": NeuralNetwork,
  "dl-f2": BackpropAnimation,
  "dl-f3": ActivationFunctions,
  "dl-f4": GradientDescentViz,
  "dl-a1": ConvolutionFilter,
  "dl-f5": RegularizationEffect,
  "ml-f2": BiasVarianceViz,
  "ml-f3": TrainValTestSplit,
  "ml-f5": FeatureScaling,
  "ml-s1": LinearRegression,
  "ml-s2": LogisticRegression,
  "ml-s3": DecisionTree,
  "ml-u1": KMeansClustering,
  "ml-u3": PCA,
  "ml-e1": ConfusionMatrix,
  "ml-e2": ROCCurve,
  "ml-e3": CrossValidation,
  "st-f2": NormalDistViz,
  "sq-b2": SQLJoins,
  "sq-a1": WindowFunctions,
  "ga-f2": WordEmbeddings,
  "ga-f3": Attention,
  "ps-e1": ABTestSimulator,
  "ps-m4": FunnelAnalysis,
  "sp-t1": TimeSeriesDecomposition,
  "sp-r1": RecSysCollaborativeFiltering,
  "sp-n2": WordEmbeddings,
  "py-b1": VariableBindingLab,
  "py-b2": StringFormatAtelier,
  "py-b3": PythonMutabilityViz,
  "py-b4": HashLab,
  "py-b5": ComprehensionForge,
  "py-c1": BranchRouter,
  "py-c2": IteratorEngine,
  "py-c3": ArgumentBinder,
  "py-c4": FoldMachine,
  "py-c5": TracebackTheater,
  "sd-p1": BatchVsStreaming,
  "sd-p2": ETLPipeline,
  "sd-p3": StreamingEnginesTrinity,
  "sd-p4": WarehouseStarSchema,
  "sd-m1": MLSystemPipeline,
  "sd-m2": FeatureStoreViz,
  "sd-m3": BatchVsStreaming,
  "sd-m4": RecSysCollaborativeFiltering,
};

const ML_VIZ_FALLBACK = [
  BiasVarianceViz,
  TrainValTestSplit,
  FeatureScaling,
  LinearRegression,
  LogisticRegression,
  DecisionTree,
  KMeansClustering,
  PCA,
  ConfusionMatrix,
  ROCCurve,
];

function mlVizFallbackForLesson(lessonId) {
  let h = 0;
  for (let i = 0; i < lessonId.length; i++) h = (h * 31 + lessonId.charCodeAt(i)) | 0;
  return ML_VIZ_FALLBACK[Math.abs(h) % ML_VIZ_FALLBACK.length];
}

const SD_VIZ_FALLBACK = [
  BatchVsStreaming,
  ETLPipeline,
  StreamingEnginesTrinity,
  WarehouseStarSchema,
  MLSystemPipeline,
  FeatureStoreViz,
  RecSysCollaborativeFiltering,
  FunnelAnalysis,
];

function sdVizFallbackForLesson(lessonId) {
  let h = 0;
  for (let i = 0; i < lessonId.length; i++) h = (h * 31 + lessonId.charCodeAt(i)) | 0;
  return SD_VIZ_FALLBACK[Math.abs(h) % SD_VIZ_FALLBACK.length];
}

/** When a lesson is marked hasViz but has no bespoke component, show a course-appropriate interactive. */
function resolveLessonVizComponent(lessonId, courseId, hasViz) {
  const direct = VISUALIZATIONS[lessonId];
  if (direct) return direct;
  if (!hasViz) return null;
  if (courseId === "statistics") return NormalDistViz;
  if (courseId === "ml") return mlVizFallbackForLesson(lessonId);
  if (courseId === "deep-learning") return GradientDescentViz;
  if (courseId === "sql") return SQLJoins;
  if (courseId === "python") return PythonMutabilityViz;
  if (courseId === "system-design") return sdVizFallbackForLesson(lessonId);
  return null;
}

// â”€â”€â”€ AI CHATBOT COMPONENT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
// MAIN APP
// â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”

const DEFAULT_PRACTICE_RUBRIC = [
  "Addresses the core question directly",
  "Shows structured reasoning",
  "Mentions relevant tradeoffs or edge cases",
  "Uses correct terminology for the domain",
];

function rubricForPracticeQuestion(q) {
  if (Array.isArray(q?.rubric) && q.rubric.length > 0) return q.rubric;
  return DEFAULT_PRACTICE_RUBRIC;
}

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
  const [evalLoading, setEvalLoading] = useState(false);
  const [evalError, setEvalError] = useState(null);
  const [evalResult, setEvalResult] = useState(null);

  const totalLessons = CURRICULUM.reduce((a, c) => a + c.topics.reduce((b, t) => b + t.lessons.length, 0), 0);
  const totalQuestions = CURRICULUM.reduce((a, c) => a + c.questions.length, 0);
  const completedLessons = Object.keys(progress).filter(k => progress[k] === "done").length;

  const submitPracticeAnswer = useCallback(async () => {
    if (!activeQuestion || !userAnswer.trim()) return;
    setSubmitted(true);
    setEvalLoading(true);
    setEvalError(null);
    setEvalResult(null);
    const rubric = rubricForPracticeQuestion(activeQuestion);
    try {
      const res = await fetch("/api/ai/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionPrompt: `${activeQuestion.title}\n\n${activeQuestion.prompt}`,
          userAnswer: userAnswer.trim(),
          rubric,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setEvalError(typeof data?.error === "string" ? data.error : "Evaluation failed");
        return;
      }
      setEvalResult(data);
    } catch {
      setEvalError("Could not reach the evaluator. Check your connection or try again.");
    } finally {
      setEvalLoading(false);
    }
  }, [activeQuestion, userAnswer]);

  const diffBadge = (d) => {
    const c = { Easy: DS.grn, Medium: "#F59E0B", Hard: "#EF4444" };
    return <span style={{ background: `${c[d]}18`, color: c[d], padding: "3px 10px", borderRadius: 999, fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", border: `1px solid ${c[d]}35`, fontFamily: "var(--ds-mono), monospace" }}>{d}</span>;
  };

  // â”€â”€â”€ HOME VIEW â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const renderHome = () => (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 clamp(16px, 4vw, 28px)" }}>
      <div style={{ textAlign: "center", padding: "48px 0 40px" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
          <PlatformLogo />
          <span style={{
            fontSize: "clamp(32px, 6vw, 44px)",
            fontWeight: 800,
            fontFamily: "var(--ds-sans), sans-serif",
            letterSpacing: "-0.03em",
            background: `linear-gradient(135deg, ${DS.t1} 0%, ${DS.t3} 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
          >
            DataSpark
          </span>
        </div>
        <p style={{
          color: DS.t2,
          fontSize: "clamp(15px, 2.2vw, 17px)",
          maxWidth: 520,
          margin: "0 auto",
          lineHeight: 1.65,
          fontFamily: "var(--ds-sans), sans-serif",
          fontWeight: 400,
        }}
        >
          Same promise as the landing page: <span style={{ color: DS.ind }}>systems thinking</span>
          {" "}over syntax drills. Learn visually, practice with context, and use the tutor when you are stuck.
        </p>
        <div style={{
          display: "flex",
          justifyContent: "center",
          gap: "clamp(20px, 5vw, 40px)",
          marginTop: 28,
          padding: "20px 16px",
          borderTop: `1px solid ${DS.border}`,
          borderBottom: `1px solid ${DS.border}`,
        }}
        >
          {[{ n: CURRICULUM.length, l: "Courses" }, { n: totalLessons, l: "Lessons" }, { n: totalQuestions, l: "Practice Qs" }, { n: completedLessons, l: "Completed" }].map((s, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "clamp(22px, 4vw, 28px)", fontWeight: 800, color: DS.t1, fontFamily: "var(--ds-sans), sans-serif" }}>{s.n}</div>
              <div style={{ fontSize: 10, color: DS.dim, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "var(--ds-mono), monospace" }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16, paddingBottom: 72 }}>
        {CURRICULUM.map((course) => {
          const lessonCount = course.topics.reduce((a, t) => a + t.lessons.length, 0);
          const doneCount = course.topics.reduce((a, t) => a + t.lessons.filter(l => progress[l.id] === "done").length, 0);
          const pct = lessonCount > 0 ? Math.round((doneCount / lessonCount) * 100) : 0;

          return (
            <div
              key={course.id}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setActiveCourse(course); setView("course"); setCourseTab("learn"); } }}
              onClick={() => { setActiveCourse(course); setView("course"); setCourseTab("learn"); }}
              style={{
                ...dsGlassCard({ cursor: "pointer", transition: "transform 0.2s, box-shadow 0.2s, border-color 0.2s" }),
                padding: "22px 20px",
                position: "relative",
                overflow: "hidden",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = `${course.color}40`;
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.boxShadow = `${DS.shadowCard}, 0 0 40px ${course.color}12`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = DS.border;
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.boxShadow = DS.shadowCard;
              }}
            >
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${course.color}, ${DS.ind}40, transparent)` }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <CourseMark color={course.color} mark={course.mark} size="lg" />
                <span style={{ fontSize: 10, color: DS.dim, fontFamily: "var(--ds-mono), monospace", fontWeight: 600 }}>{lessonCount} lessons Â· {course.questions.length} Qs</span>
              </div>
              <div style={{ fontSize: 17, fontWeight: 700, color: DS.t1, fontFamily: "var(--ds-sans), sans-serif", marginBottom: 8 }}>{course.title}</div>
              <div style={{ fontSize: 13, color: DS.t3, lineHeight: 1.55, fontFamily: "var(--ds-sans), sans-serif", marginBottom: 14, minHeight: 44 }}>{course.description}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
                {course.topics.slice(0, 3).map(t => (
                  <span key={t.id} style={{ fontSize: 9, padding: "4px 8px", borderRadius: 6, background: "rgba(255,255,255,0.04)", color: DS.t3, fontFamily: "var(--ds-mono), monospace", border: `1px solid ${DS.border}` }}>{t.title}</span>
                ))}
                {course.topics.length > 3 && <span style={{ fontSize: 9, padding: "4px 8px", borderRadius: 6, background: "rgba(255,255,255,0.04)", color: DS.dim, fontFamily: "var(--ds-mono), monospace", border: `1px solid ${DS.border}` }}>+{course.topics.length - 3}</span>}
              </div>
              <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 6, height: 4, overflow: "hidden" }}>
                <div style={{ width: `${pct}%`, height: "100%", background: `linear-gradient(90deg, ${course.color}, ${course.accent})`, borderRadius: 6, transition: "width 0.4s" }} />
              </div>
              <div style={{ fontSize: 10, color: DS.dim, marginTop: 6, fontFamily: "var(--ds-mono), monospace" }}>{pct}% complete</div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // â”€â”€â”€ COURSE VIEW â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const renderCourse = () => {
    if (!activeCourse) return null;
    const c = activeCourse;

    return (
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 clamp(16px, 4vw, 28px)" }}>
        <button type="button" onClick={() => setView("home")} style={{ background: "none", border: "none", color: DS.t3, fontSize: 12, cursor: "pointer", padding: "20px 0 8px", fontFamily: "var(--ds-mono), monospace", fontWeight: 600 }}>â† All courses</button>

        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 8 }}>
          <CourseMark color={c.color} mark={c.mark} size="md" />
          <div>
            <h1 style={{ fontSize: "clamp(22px, 4vw, 30px)", fontWeight: 800, color: DS.t1, margin: 0, letterSpacing: "-0.02em" }}>{c.title}</h1>
            <p style={{ fontSize: 14, color: DS.t3, margin: "6px 0 0", fontWeight: 400, lineHeight: 1.55, maxWidth: 640 }}>{c.description}</p>
          </div>
        </div>

        <div style={{ display: "flex", gap: 0, borderBottom: `1px solid ${DS.border}`, margin: "20px 0 24px", flexWrap: "wrap", alignItems: "center" }}>
          {[{ id: "learn", label: `Learn (${c.topics.reduce((a, t) => a + t.lessons.length, 0)} lessons)` }, { id: "practice", label: `Practice (${c.questions.length} questions)` }].map(tab => (
            <button key={tab.id} type="button" onClick={() => setCourseTab(tab.id)} style={{
              background: "none", border: "none", borderBottom: courseTab === tab.id ? `2px solid ${c.color}` : "2px solid transparent",
              padding: "10px 18px", color: courseTab === tab.id ? DS.t1 : DS.dim, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "var(--ds-sans), sans-serif",
            }}>{tab.label}</button>
          ))}
          <button type="button" onClick={() => setChatbotCourse(c)} style={{
            marginLeft: "auto", background: `${c.color}18`, border: `1px solid ${c.color}35`, borderRadius: DS.radiusSm,
            padding: "8px 14px", color: c.accent, fontSize: 12, cursor: "pointer", fontFamily: "var(--ds-mono), monospace", fontWeight: 600, marginBottom: 8, boxShadow: DS.shadowCta,
          }}>
            Ask AI tutor
          </button>
        </div>

        {courseTab === "learn" && (
          <div>
            {c.topics.map(topic => (
              <div key={topic.id} style={{ marginBottom: 32 }}>
                <h3 style={{ fontSize: 11, fontWeight: 700, color: c.accent, fontFamily: "var(--ds-mono), monospace", marginBottom: 12, paddingBottom: 8, borderBottom: `1px solid ${c.color}22`, letterSpacing: "0.14em", textTransform: "uppercase" }}>{topic.title}</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {topic.lessons.map((lesson, li) => {
                    const isDone = progress[lesson.id] === "done";
                    return (
                      <div
                        key={lesson.id}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setActiveLesson(lesson); setView("lesson"); } }}
                        onClick={() => { setActiveLesson(lesson); setView("lesson"); }}
                        style={{
                          ...dsGlassCard({ padding: "14px 16px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", transition: "border-color 0.2s, box-shadow 0.2s" }),
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${c.color}40`; e.currentTarget.style.boxShadow = `${DS.shadowCard}, 0 0 24px ${c.color}10`; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = DS.border; e.currentTarget.style.boxShadow = DS.shadowCard; }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{
                            width: 30, height: 30, borderRadius: "50%",
                            background: isDone ? `${DS.grn}18` : "rgba(255,255,255,0.04)",
                            border: `2px solid ${isDone ? DS.grn : DS.border}`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 12, color: isDone ? DS.grn : DS.dim, fontWeight: 700, fontFamily: "var(--ds-mono), monospace",
                          }}>
                            {isDone ? "âœ“" : li + 1}
                          </div>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 600, color: DS.t1 }}>{lesson.title}</div>
                            <div style={{ fontSize: 10, color: DS.t3, fontFamily: "var(--ds-mono), monospace", marginTop: 2 }}>{lesson.duration}</div>
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          {lesson.hasViz && <span style={{ fontSize: 9, padding: "4px 8px", borderRadius: 6, background: `${c.color}18`, color: c.accent, fontFamily: "var(--ds-mono), monospace", fontWeight: 600, border: `1px solid ${c.color}30` }}>Interactive</span>}
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
            <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
              {["All", "Easy", "Medium", "Hard"].map(d => (
                <button key={d} type="button" onClick={() => setDiffFilter(d)} style={{
                  background: diffFilter === d ? "rgba(99,102,241,0.12)" : "transparent", border: `1px solid ${diffFilter === d ? `${c.color}35` : DS.border}`,
                  borderRadius: 8, padding: "6px 12px", color: diffFilter === d ? DS.t1 : DS.dim, fontSize: 11, cursor: "pointer", fontFamily: "var(--ds-mono), monospace", fontWeight: 600,
                }}>{d}</button>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {c.questions.filter(q => diffFilter === "All" || q.difficulty === diffFilter).map(q => (
                <div
                  key={q.id}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setActiveQuestion(q); setUserAnswer(""); setSubmitted(false); setShowModel(false); setEvalLoading(false); setEvalResult(null); setEvalError(null); setView("question"); } }}
                  onClick={() => { setActiveQuestion(q); setUserAnswer(""); setSubmitted(false); setShowModel(false); setEvalLoading(false); setEvalResult(null); setEvalError(null); setView("question"); }}
                  style={{
                    ...dsGlassCard({ padding: "16px 18px", cursor: "pointer", transition: "border-color 0.2s" }),
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${c.color}38`; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = DS.border; }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 600, color: DS.t1, marginBottom: 6 }}>{q.title}</div>
                      <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                        {(q.tags || []).map(t => <span key={t} style={{ fontSize: 9, padding: "3px 8px", borderRadius: 6, background: "rgba(255,255,255,0.04)", color: DS.t3, fontFamily: "var(--ds-mono), monospace", border: `1px solid ${DS.border}` }}>{t}</span>)}
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                      <span style={{ fontSize: 10, color: DS.t3, fontFamily: "var(--ds-mono), monospace" }}>{q.type === "code" ? "Coding" : "Open-ended"}</span>
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

  // â”€â”€â”€ LESSON VIEW â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const renderLesson = () => {
    if (!activeLesson || !activeCourse) return null;
    const VizComponent = resolveLessonVizComponent(
      activeLesson.id,
      activeCourse.id,
      activeLesson.hasViz,
    );
    const moduleSpec = getResolvedLessonModule(activeLesson, activeCourse);

    return (
      <LessonModule
        course={activeCourse}
        lesson={activeLesson}
        moduleSpec={moduleSpec}
        VizComponent={VizComponent}
        vizComingSoon={!VizComponent && !!activeLesson.hasViz}
        onBack={() => setView("course")}
        backLabel={`â† Back to ${activeCourse.title}`}
        onMarkComplete={() => {
          setProgress((p) => ({ ...p, [activeLesson.id]: "done" }));
          setView("course");
        }}
        onAskTutor={() => setChatbotCourse(activeCourse)}
      />
    );
  };

  // â”€â”€â”€ QUESTION VIEW â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const renderQuestion = () => {
    if (!activeQuestion || !activeCourse) return null;
    const q = activeQuestion;

    return (
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 clamp(16px, 4vw, 28px)" }}>
        <button type="button" onClick={() => { setCourseTab("practice"); setView("course"); }} style={{ background: "none", border: "none", color: DS.t3, fontSize: 12, cursor: "pointer", padding: "20px 0 8px", fontFamily: "var(--ds-mono), monospace", fontWeight: 600 }}>â† Back to practice</button>

        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            {diffBadge(q.difficulty)}
            <span style={{ fontSize: 10, color: DS.t3, fontFamily: "var(--ds-mono), monospace" }}>{q.type === "code" ? "Coding problem" : "Open-ended case study"}</span>
          </div>
          <h1 style={{ fontSize: "clamp(20px, 3.5vw, 26px)", fontWeight: 800, color: DS.t1, margin: 0, letterSpacing: "-0.02em" }}>{q.title}</h1>
          <div style={{ display: "flex", gap: 5, marginTop: 8, flexWrap: "wrap" }}>
            {(q.tags || []).map(t => <span key={t} style={{ fontSize: 9, padding: "3px 8px", borderRadius: 6, background: "rgba(255,255,255,0.04)", color: DS.t3, fontFamily: "var(--ds-mono), monospace", border: `1px solid ${DS.border}` }}>{t}</span>)}
          </div>
        </div>

        <div style={{
          ...dsGlassCard({ padding: "22px 24px", marginBottom: 20, fontSize: 14, color: DS.t2, lineHeight: 1.75, whiteSpace: "pre-wrap" }),
        }}>
          {q.prompt}
        </div>

        <textarea
          value={userAnswer}
          onChange={e => setUserAnswer(e.target.value)}
          placeholder={q.type === "code" ? "Write your code here..." : "Write your answer â€” explain your reasoning, tradeoffs, and approach..."}
          disabled={submitted}
          style={{
            width: "100%", minHeight: 280, background: "rgba(255,255,255,0.03)", border: `1px solid ${DS.border}`,
            borderRadius: DS.radiusMd, padding: 18, color: DS.t1, fontSize: 14, resize: "vertical",
            fontFamily: q.type === "code" ? "var(--ds-mono), monospace" : "var(--ds-sans), sans-serif",
            lineHeight: 1.7, outline: "none", boxSizing: "border-box", opacity: submitted ? 0.6 : 1,
          }}
        />

        <div style={{ display: "flex", gap: 10, marginTop: 16, marginBottom: 20, flexWrap: "wrap" }}>
          {!submitted && (
            <button
              type="button"
              onClick={() => void submitPracticeAnswer()}
              disabled={!userAnswer.trim() || evalLoading}
              style={{
                flex: 1, minWidth: 160, background: userAnswer.trim() && !evalLoading ? DS.indB : "rgba(255,255,255,0.06)",
                border: "none", borderRadius: DS.radiusSm, padding: "14px 0", color: userAnswer.trim() && !evalLoading ? "#fff" : DS.dim,
                fontSize: 14, fontWeight: 700, cursor: userAnswer.trim() && !evalLoading ? "pointer" : "not-allowed", fontFamily: "var(--ds-sans), sans-serif",
                boxShadow: userAnswer.trim() && !evalLoading ? DS.shadowCta : "none",
              }}>
              Submit & score
            </button>
          )}
          {submitted && !showModel && (
            <button
              type="button"
              onClick={() => setShowModel(true)}
              style={{
                flex: 1, minWidth: 200, background: DS.grn, border: "none", borderRadius: DS.radiusSm, padding: "14px 0",
                color: "#020617", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "var(--ds-sans), sans-serif",
              }}>
              Show model answer & rubric
            </button>
          )}
          <button
            type="button"
            onClick={() => setChatbotCourse(activeCourse)}
            style={{
              background: "rgba(255,255,255,0.04)", border: `1px solid ${DS.border}`, borderRadius: DS.radiusSm, padding: "14px 20px",
              color: DS.t1, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "var(--ds-sans), sans-serif",
            }}>
            Get help
          </button>
        </div>

        {(submitted || evalLoading) && (
          <div style={{ ...dsGlassCard({ padding: "20px 22px", marginBottom: 20, border: `1px solid ${DS.indB}40` }) }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: DS.ind, fontFamily: "var(--ds-mono), monospace", letterSpacing: "0.12em", marginBottom: 12 }}>
              AI SCORECARD
            </div>
            {evalLoading && <p style={{ color: DS.t3, fontSize: 14 }}>Scoring your answerâ€¦</p>}
            {evalError && <p style={{ color: "#FCA5A5", fontSize: 14 }}>{evalError}</p>}
            {evalResult && !evalLoading && (
              <>
                <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginBottom: 14, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 36, fontWeight: 800, color: DS.t1 }}>{Math.round(evalResult.score)}</span>
                  <span style={{ color: DS.t3, fontFamily: "var(--ds-mono), monospace", fontSize: 13 }}>{evalResult.totalScore}</span>
                </div>
                <p style={{ fontSize: 14, color: DS.t2, lineHeight: 1.65, marginBottom: 16 }}>{evalResult.feedback}</p>
                {Array.isArray(evalResult.rubricScores) && (
                  <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 8 }}>
                    {evalResult.rubricScores.map((rs, i) => (
                      <li
                        key={i}
                        style={{
                          fontSize: 12,
                          fontFamily: "var(--ds-mono), monospace",
                          color: rs.met ? DS.grn : DS.t3,
                          padding: "8px 10px",
                          borderRadius: 8,
                          background: "rgba(255,255,255,0.03)",
                          border: `1px solid ${DS.border}`,
                        }}
                      >
                        <span style={{ marginRight: 8 }}>{rs.met ? "âœ“" : "â—‹"}</span>
                        {rs.criterion}
                        <span style={{ color: DS.dim, marginLeft: 8 }}>({rs.confidence})</span>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </div>
        )}

        {showModel && (
          <div style={{
            ...dsGlassCard({ padding: "22px 24px", marginBottom: 40, border: `1px solid rgba(52,211,153,0.25)` }),
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: DS.grn, fontFamily: "var(--ds-mono), monospace", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.12em" }}>
              Model answer & evaluation criteria
            </div>
            {q.modelAnswer ? (
              <div style={{ fontSize: 14, color: DS.t2, lineHeight: 1.75, fontWeight: 400, whiteSpace: "pre-wrap", marginBottom: 16 }}>{q.modelAnswer}</div>
            ) : (
              <div style={{ fontSize: 14, color: DS.t3, lineHeight: 1.7, fontWeight: 400 }}>
                <p style={{ marginBottom: 12 }}>A strong answer to this question would demonstrate clear understanding of the core concepts, structured reasoning about tradeoffs, and practical awareness of real-world constraints.</p>
                <p style={{ marginBottom: 12 }}>Compare your scorecard above to these expectations.</p>
                <p style={{ color: DS.dim, fontSize: 13, fontStyle: "italic" }}>Use the AI tutor to dig into your specific answer line by line.</p>
              </div>
            )}
            {Array.isArray(q.rubric) && q.rubric.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: DS.t3, fontFamily: "var(--ds-mono), monospace", marginBottom: 8 }}>Rubric</div>
                <ul style={{ margin: 0, paddingLeft: 20, color: DS.t2, fontSize: 13, lineHeight: 1.65 }}>
                  {q.rubric.map((line, i) => <li key={i}>{line}</li>)}
                </ul>
              </div>
            )}
            {Array.isArray(q.hints) && q.hints.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: DS.t3, fontFamily: "var(--ds-mono), monospace", marginBottom: 8 }}>Hints</div>
                <ul style={{ margin: 0, paddingLeft: 20, color: DS.t2, fontSize: 13, lineHeight: 1.65 }}>
                  {q.hints.map((h, i) => <li key={i}>{h}</li>)}
                </ul>
              </div>
            )}
            {Array.isArray(q.commonMistakes) && q.commonMistakes.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#FCA5A5", fontFamily: "var(--ds-mono), monospace", marginBottom: 8 }}>Common mistakes</div>
                <ul style={{ margin: 0, paddingLeft: 20, color: DS.t2, fontSize: 13, lineHeight: 1.65 }}>
                  {q.commonMistakes.map((m, i) => <li key={i}>{m}</li>)}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ minHeight: "100vh", background: DS.bg, color: DS.t1, fontFamily: "var(--ds-sans), system-ui, sans-serif", position: "relative" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        :root { --ds-sans: 'Manrope', system-ui, sans-serif; --ds-mono: 'JetBrains Mono', monospace; }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.3 } }
        ::selection { background: rgba(99,102,241,.25); color: #fff; }
        textarea:focus-visible, input:focus-visible, button:focus-visible { outline: none; box-shadow: 0 0 0 3px rgba(99,102,241,.35); border-color: ${DS.indB} !important; }
        textarea:focus, input:focus { border-color: ${DS.indB} !important; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,.12); border-radius: 3px; }
        input[type="range"] { height: 4px; }
      `}</style>

      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        <div style={{ position: "absolute", width: 720, height: 720, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 68%)", top: "-18%", left: "-10%" }} />
        <div style={{ position: "absolute", width: 480, height: 480, borderRadius: "50%", background: "radial-gradient(circle, rgba(52,211,153,0.05) 0%, transparent 70%)", bottom: "0%", right: "-8%" }} />
      </div>

      <nav style={{
        borderBottom: `1px solid ${DS.border}`,
        padding: "12px clamp(16px, 3vw, 28px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        position: "sticky",
        top: 0,
        background: "rgba(2,6,23,0.88)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        zIndex: 100,
      }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
          <div
            onClick={() => { setView("home"); setActiveCourse(null); }}
            style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", flexShrink: 0 }}
          >
            <PlatformLogo />
            <span style={{ fontSize: 17, fontWeight: 800, color: DS.t1, letterSpacing: "-0.02em", whiteSpace: "nowrap" }}>DataSpark</span>
          </div>
          <Link
            to="/"
            style={{
              fontSize: 11,
              color: DS.t3,
              textDecoration: "none",
              fontFamily: "var(--ds-mono), monospace",
              fontWeight: 600,
              padding: "6px 10px",
              borderRadius: 8,
              border: `1px solid ${DS.border}`,
              flexShrink: 0,
            }}
          >
            Landing
          </Link>
        </div>

        <div style={{ display: "flex", gap: 4, overflowX: "auto", maxWidth: "min(68vw, 520px)", paddingBottom: 2 }}>
          {CURRICULUM.slice(0, 6).map(c => (
            <button
              key={c.id}
              type="button"
              onClick={() => { setActiveCourse(c); setView("course"); setCourseTab("learn"); }}
              style={{
                background: activeCourse?.id === c.id ? "rgba(99,102,241,0.12)" : "transparent",
                border: `1px solid ${activeCourse?.id === c.id ? `${c.color}35` : "transparent"}`,
                borderRadius: 8,
                padding: "4px 8px 4px 4px",
                color: activeCourse?.id === c.id ? DS.t1 : DS.dim,
                fontSize: 11,
                cursor: "pointer",
                fontFamily: "var(--ds-mono), monospace",
                fontWeight: 600,
                whiteSpace: "nowrap",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                minHeight: 36,
              }}
            >
              <CourseMark color={c.color} mark={c.mark} size="sm" />
              {c.title.split(" ")[0]}
            </button>
          ))}
        </div>
      </nav>

      <main style={{ paddingBottom: 72, position: "relative", zIndex: 1 }}>
        {view === "home" && renderHome()}
        {view === "course" && renderCourse()}
        {view === "lesson" && renderLesson()}
        {view === "question" && renderQuestion()}
      </main>

      {chatbotCourse && <AIChatbot course={chatbotCourse} onClose={() => setChatbotCourse(null)} />}
    </div>
  );
}


