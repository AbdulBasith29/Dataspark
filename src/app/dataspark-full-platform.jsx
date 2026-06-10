import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { Check, ArrowLeft } from "lucide-react";
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
import LearningParadigms from "../visualizations/LearningParadigms.jsx";
import FeatureEngineeringLab from "../visualizations/FeatureEngineeringLab.jsx";
import RandomForestBagging from "../visualizations/RandomForestBagging.jsx";
import GradientBoosting from "../visualizations/GradientBoosting.jsx";
import SVMMargins from "../visualizations/SVMMargins.jsx";
import DBSCANClustering from "../visualizations/DBSCANClustering.jsx";
import TSNEvsUMAP from "../visualizations/TSNEvsUMAP.jsx";
import ImbalancedClasses from "../visualizations/ImbalancedClasses.jsx";
import ClassObjectLab from "../visualizations/ClassObjectLab.jsx";
import InheritanceExplorer from "../visualizations/InheritanceExplorer.jsx";
import DecoratorForge from "../visualizations/DecoratorForge.jsx";
import PandasDataLab from "../visualizations/PandasDataLab.jsx";
import VectorizationRace from "../visualizations/VectorizationRace.jsx";
import GroupByMergeForge from "../visualizations/GroupByMergeForge.jsx";
import SQLOrderOfExecution from "../visualizations/SQLOrderOfExecution.jsx";
import SQLNullLogic from "../visualizations/SQLNullLogic.jsx";
import SQLGroupByViz from "../visualizations/SQLGroupByViz.jsx";
import SQLSubqueryVsJoin from "../visualizations/SQLSubqueryVsJoin.jsx";
import SQLWindowFunctionsViz from "../visualizations/SQLWindowFunctionsViz.jsx";
import SQLLagLeadViz from "../visualizations/SQLLagLeadViz.jsx";
import SQLCteExplorer from "../visualizations/SQLCteExplorer.jsx";
import SQLPivotViz from "../visualizations/SQLPivotViz.jsx";
import SQLExplainPlanViz from "../visualizations/SQLExplainPlanViz.jsx";
import SQLNormalizationViz from "../visualizations/SQLNormalizationViz.jsx";
import SQLIndexingViz from "../visualizations/SQLIndexingViz.jsx";
import SQLStarSnowflakeViz from "../visualizations/SQLStarSnowflakeViz.jsx";
import SQLOltpOlapViz from "../visualizations/SQLOltpOlapViz.jsx";
import StatMeanMedianModeViz from "../visualizations/StatMeanMedianModeViz.jsx";
import StatPercentileIQRViz from "../visualizations/StatPercentileIQRViz.jsx";
import StatCorrelationViz from "../visualizations/StatCorrelationViz.jsx";
import StatBinomialPoissonViz from "../visualizations/StatBinomialPoissonViz.jsx";
import StatCLTViz from "../visualizations/StatCLTViz.jsx";
import StatPValueViz from "../visualizations/StatPValueViz.jsx";
import StatTestsViz from "../visualizations/StatTestsViz.jsx";
import StatConfidenceIntervalViz from "../visualizations/StatConfidenceIntervalViz.jsx";
import StatTypeErrorsViz from "../visualizations/StatTypeErrorsViz.jsx";
import StatPowerAnalysisViz from "../visualizations/StatPowerAnalysisViz.jsx";
import StatMultipleTestingViz from "../visualizations/StatMultipleTestingViz.jsx";
import StatBootstrapViz from "../visualizations/StatBootstrapViz.jsx";
import StatBayesFrequentistViz from "../visualizations/StatBayesFrequentistViz.jsx";
import DLRNNLSTMViz from "../visualizations/DLRNNLSTMViz.jsx";
import DLTransferLearningViz from "../visualizations/DLTransferLearningViz.jsx";
import ChunkingStrategyViz from "../visualizations/ChunkingStrategyViz.jsx";
import RAGPipelineViz from "../visualizations/RAGPipelineViz.jsx";
import AdvancedRAGViz from "../visualizations/AdvancedRAGViz.jsx";
import MLDriftMonitorViz from "../visualizations/MLDriftMonitorViz.jsx";
import AirflowDAGViz from "../visualizations/AirflowDAGViz.jsx";
import CanaryDeploymentViz from "../visualizations/CanaryDeploymentViz.jsx";
import ARIMACFViz from "../visualizations/ARIMACFViz.jsx";
import ProphetDecompositionViz from "../visualizations/ProphetDecompositionViz.jsx";
import MatrixFactorizationViz from "../visualizations/MatrixFactorizationViz.jsx";
import MatplotlibAnatomyViz from "../visualizations/MatplotlibAnatomyViz.jsx";
import RecEvalMetricsViz from "../visualizations/RecEvalMetricsViz.jsx";
import TextPreprocessingPipelineViz from "../visualizations/TextPreprocessingPipelineViz.jsx";
import MLCICDPipelineViz from "../visualizations/MLCICDPipelineViz.jsx";
import GitWorkflowViz from "../visualizations/GitWorkflowViz.jsx";
import AWSDataScienceViz from "../visualizations/AWSDataScienceViz.jsx";
import DriftConceptViz from "../visualizations/DriftConceptViz.jsx";
import AutoRetrainingViz from "../visualizations/AutoRetrainingViz.jsx";
import PlotlyInteractiveViz from "../visualizations/PlotlyInteractiveViz.jsx";
import DashboardDesignViz from "../visualizations/DashboardDesignViz.jsx";
import ContentBasedRecViz from "../visualizations/ContentBasedRecViz.jsx";
import LSTMSequenceViz from "../visualizations/LSTMSequenceViz.jsx";
import NERViz from "../visualizations/NERViz.jsx";
import VenvCondaViz from "../visualizations/VenvCondaViz.jsx";
import SentimentAnalysisViz from "../visualizations/SentimentAnalysisViz.jsx";
import VizLabShell from "../components/platform/VizLabShell.jsx";
import LessonModule from "../components/platform/LessonModule.jsx";
import PracticeQuestion from "../components/platform/PracticeQuestion.jsx";
import { getResolvedLessonModule, auditPythonLessonIntegrity, PYTHON_CLUSTER_MILESTONES } from "../data/lesson-modules.js";
import { PYTHON_QUESTIONS } from "../data/questions-python.js";
import { STATISTICS_QUESTIONS } from "../data/questions-statistics.js";
import { SQL_QUESTIONS } from "../data/questions-sql.js";
import { ML_QUESTIONS } from "../data/questions-ml.js";
import { DL_QUESTIONS } from "../data/questions-dl.js";
import { GENAI_QUESTIONS } from "../data/questions-genai.js";
import { DS, dsGlassCard } from "../lib/ds-platform-tokens.js";
import { trackLvsEvent, buildLvsMetadata, LVS_EVENT_NAMES, buildPythonProgressArtifacts } from "../lib/analytics.js";
import useLearnerIntent from "../lib/use-learner-intent.js";
import IntentSelector from "../components/platform/IntentSelector.jsx";
import ProgressArtifactCard from "../components/platform/ProgressArtifactCard.jsx";
import LiveRegion from "../components/platform/LiveRegion.jsx";

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

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DATASPARK — Complete Data Science Learning Platform
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ─── FULL CURRICULUM DATA ────────────────────────────────────────────────────
const CURRICULUM = [
  {
    id: "python",
    title: "Python Fundamentals",
    mark: "PY",
    color: "#3B82F6",
    accent: "#60A5FA",
    description: "The foundation of every data science career. Master Python's core — not just syntax, but how to think programmatically.",
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
        id: "sql-revision",
        title: "Rapid Revision & Foundations",
        lessons: [
          { id: "sql-found-01", title: "SQL Order of Execution", duration: "12 min", hasViz: true },
          { id: "sql-found-02", title: "Three-Valued Logic of NULL", duration: "12 min", hasViz: true },
          { id: "sql-found-03", title: "GROUP BY & Aggregations", duration: "12 min", hasViz: true },
          { id: "sql-found-04", title: "Subqueries vs Basic Joins", duration: "12 min", hasViz: true },
        ]
      },
      {
        id: "sql-advanced",
        title: "Advanced SQL",
        lessons: [
          { id: "sq-a1", title: "Window Functions: ROW_NUMBER, RANK, DENSE_RANK", duration: "22 min", hasViz: true },
          { id: "sq-a2", title: "LAG, LEAD & Running Calculations", duration: "18 min", hasViz: true },
          { id: "sq-a3", title: "CTEs & Recursive Queries", duration: "20 min", hasViz: true },
          { id: "sq-a4", title: "PIVOT, UNPIVOT & Conditional Aggregation", duration: "15 min", hasViz: true },
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
      },
      {
        id: "sql-capstone",
        title: "Capstone Assessment",
        lessons: [
          { id: "sql-capstone-01", title: "StreamCore Analytics Challenge", duration: "45 min", hasViz: false, isCapstone: true },
        ]
      }
    ],
    questions: SQL_QUESTIONS,
  },
  {
    id: "statistics",
    title: "Statistics & Probability",
    mark: "STAT",
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
          { id: "st-a4", title: "Bayesian vs Frequentist: The Debate", duration: "18 min", hasViz: true },
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
    questions: ML_QUESTIONS,
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
    questions: DL_QUESTIONS,
  },
  {
    id: "genai",
    title: "GenAI & LLMs",
    mark: "GEN",
    color: "#06B6D4",
    accent: "#22D3EE",
    description: "The frontier. LLMs, RAG at every level, agents, evaluation, fine-tuning, and responsible AI — everything you need to build and ship production LLM systems.",
    topics: [
      {
        id: "genai-foundations",
        title: "LLM Foundations",
        lessons: [
          { id: "ga-f1", title: "How Language Models Actually Work", duration: "22 min", hasViz: false },
          { id: "ga-f2", title: "Tokenization & Embeddings", duration: "18 min", hasViz: true },
          { id: "ga-f3", title: "Attention Mechanism Deep Dive", duration: "25 min", hasViz: true },
          { id: "ga-f4", title: "Fine-Tuning vs RAG vs Prompting: The Strategy Map", duration: "20 min", hasViz: false },
        ]
      },
      {
        id: "genai-rag",
        title: "Retrieval & RAG",
        lessons: [
          { id: "ga-r1", title: "Embeddings & Vector Representations", duration: "22 min", hasViz: false },
          { id: "ga-r2", title: "Vector Databases: Storage, Indexing & ANN Search", duration: "25 min", hasViz: false },
          { id: "ga-r3", title: "Semantic Search & Hybrid Retrieval", duration: "20 min", hasViz: false },
          { id: "ga-r4", title: "Chunking Strategies: From Fixed to Contextual", duration: "25 min", hasViz: true },
          { id: "ga-r5", title: "Naive RAG Pipeline: Ingest, Retrieve, Generate", duration: "25 min", hasViz: true },
          { id: "ga-r6", title: "Advanced RAG: Reranking, HyDE & Agentic Retrieval", duration: "30 min", hasViz: true },
        ]
      },
      {
        id: "genai-agents",
        title: "Agents & Orchestration",
        lessons: [
          { id: "ga-a1", title: "Prompt Engineering: CoT, Few-Shot & System Design", duration: "25 min", hasViz: false },
          { id: "ga-a3", title: "Agentic Frameworks: LangGraph, AutoGen & CrewAI", duration: "25 min", hasViz: false },
          { id: "ga-ag1", title: "Tool Use & Function Calling", duration: "22 min", hasViz: false },
          { id: "ga-ag2", title: "Reasoning Loops: ReAct, ToT & Self-Reflection", duration: "22 min", hasViz: false },
          { id: "ga-ag3", title: "Multi-Agent Workflows & Coordination Patterns", duration: "25 min", hasViz: false },
        ]
      },
      {
        id: "genai-ops",
        title: "Ops & Evaluation",
        lessons: [
          { id: "ga-a5", title: "LLM Evaluation: LLM-as-Judge, RAGAS & Benchmarks", duration: "20 min", hasViz: false },
          { id: "ga-ops1", title: "Optimization: Latency, Caching & Prompt Compression", duration: "22 min", hasViz: false },
          { id: "ga-ops2", title: "Fine-Tuning in Practice: LoRA, PEFT & When to Use It", duration: "25 min", hasViz: false },
          { id: "ga-ops3", title: "Human-in-the-Loop & Product Thinking", duration: "18 min", hasViz: false },
        ]
      },
      {
        id: "genai-safety",
        title: "Safety & Ethics",
        lessons: [
          { id: "ga-s1", title: "Bias, Fairness & Hallucination in LLMs", duration: "20 min", hasViz: false },
          { id: "ga-s2", title: "Security, Privacy & Compliance", duration: "18 min", hasViz: false },
          { id: "ga-s3", title: "Prompt Injection & Red Teaming", duration: "22 min", hasViz: false },
        ]
      },
    ],
    questions: GENAI_QUESTIONS,
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
      { id: "psq2", title: "Conversion Dropped 25% — Now What?", difficulty: "Hard", type: "open-ended", prompt: "DoorDash weekend conversion dropped from 32% to 24%. Walk through your investigation: framework, first 5 analyses, hypotheses ranked, distinguishing data issues from real problems, and what you present to the VP by EOD.", tags: ["metric-investigation", "debugging", "stakeholders"] },
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
      { id: "sdq2", title: "Recommendation System for 400M Users", difficulty: "Hard", type: "open-ended", prompt: "Design a multi-stage recommendation pipeline: candidate gen → ranking → re-ranking. Cover embedding strategy, explore/exploit, offline vs online evaluation, real-time personalization, and cold-start.", tags: ["recommendations", "scale", "ML-systems"] },
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
          { id: "mo-t2", title: "Virtual Environments: venv, conda, poetry", duration: "12 min", hasViz: true },
          { id: "mo-t3", title: "ML Pipeline Orchestration with Airflow", duration: "22 min", hasViz: true },
          { id: "mo-t4", title: "Deployment Strategies: Canary & Blue/Green", duration: "20 min", hasViz: true },
          { id: "mo-t5", title: "Cloud Basics: AWS for DS", duration: "25 min", hasViz: true },
        ]
      },
      {
        id: "mlops-viz",
        title: "Data Visualization",
        lessons: [
          { id: "mo-v1", title: "Matplotlib & Seaborn: Static Viz Done Right", duration: "20 min", hasViz: true },
          { id: "mo-v2", title: "Plotly: Interactive Visualizations", duration: "18 min", hasViz: true },
          { id: "mo-v3", title: "Dashboard Design Principles", duration: "15 min", hasViz: true },
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
    mark: "ADV",
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
          { id: "sp-n3", title: "Sentiment Analysis & Text Classification", duration: "18 min", hasViz: true },
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
    <>
      <div style={{ fontSize: 17, fontWeight: 700, color: DS.t1, marginBottom: 4, fontFamily: "var(--ds-sans), sans-serif" }}>Normal distribution explorer</div>
      <div style={{ fontSize: 12, color: DS.t3, fontFamily: "var(--ds-mono), monospace", marginBottom: 16, lineHeight: 1.55 }}>Drag the sliders to see how μ and σ change the shape — same family as the landing “systems" story: intuition first.</div>
      <canvas ref={canvasRef} style={{ width: "100%", height: 280, borderRadius: 12, border: `1px solid ${DS.border}`, background: "rgba(255,255,255,0.02)" }} />
      <div style={{ display: "flex", gap: 24, marginTop: 16 }}>
        <label style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: DS.t3, fontFamily: "var(--ds-mono), monospace", marginBottom: 6 }}>Mean (μ): {mean.toFixed(1)}</div>
          <input type="range" min={-3} max={3} step={0.1} value={mean} onChange={e => setMean(+e.target.value)} style={{ width: "100%", accentColor: DS.indB }} />
        </label>
        <label style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: DS.t3, fontFamily: "var(--ds-mono), monospace", marginBottom: 6 }}>Std Dev (σ): {stdDev.toFixed(1)}</div>
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
    ctx.fillText(`∇f = ${df(ballPos).toFixed(2)}`, 20, 88);
  }, [ballPos, trail]);

  return (
    <>
      <div style={{ fontSize: 17, fontWeight: 700, color: DS.t1, marginBottom: 4, fontFamily: "var(--ds-sans), sans-serif" }}>Gradient descent in action</div>
      <div style={{ fontSize: 12, color: DS.t3, fontFamily: "var(--ds-mono), monospace", marginBottom: 16, lineHeight: 1.55 }}>Watch the ball roll downhill following the gradient — learning rate is the step size.</div>
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
    <>
      <div style={{ fontSize: 17, fontWeight: 700, color: DS.t1, marginBottom: 4, fontFamily: "var(--ds-sans), sans-serif" }}>Bias–variance tradeoff</div>
      <div style={{ fontSize: 12, color: DS.t3, fontFamily: "var(--ds-mono), monospace", marginBottom: 16, lineHeight: 1.55 }}>Drag complexity — DataSpark is built on reasoning, not memorization; this is the core tension.</div>
      <canvas ref={canvasRef} style={{ width: "100%", height: 250, borderRadius: 12, border: `1px solid ${DS.border}`, background: "rgba(255,255,255,0.02)" }} />
      <label style={{ display: "block", marginTop: 16 }}>
        <div style={{ fontSize: 11, color: DS.t3, fontFamily: "var(--ds-mono), monospace", marginBottom: 6 }}>
          Model complexity: {complexity.toFixed(1)} — {complexity < 3 ? "Underfitting (high bias)" : complexity > 6 ? "Overfitting (high variance)" : "Good balance"}
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
  "dl-a2": DLRNNLSTMViz,
  "dl-a3": Attention,
  "dl-a4": DLTransferLearningViz,
  "dl-f5": RegularizationEffect,
  "ml-f1": LearningParadigms,
  "ml-f2": BiasVarianceViz,
  "ml-f3": TrainValTestSplit,
  "ml-f4": FeatureEngineeringLab,
  "ml-f5": FeatureScaling,
  "ml-s1": LinearRegression,
  "ml-s2": LogisticRegression,
  "ml-s3": DecisionTree,
  "ml-s4": RandomForestBagging,
  "ml-s5": GradientBoosting,
  "ml-s6": SVMMargins,
  "ml-u1": KMeansClustering,
  "ml-u2": DBSCANClustering,
  "ml-u3": PCA,
  "ml-u4": TSNEvsUMAP,
  "ml-e1": ConfusionMatrix,
  "ml-e2": ROCCurve,
  "ml-e3": CrossValidation,
  "ml-e4": ImbalancedClasses,
  "st-f2": NormalDistViz,
  "sq-b2": SQLJoins,
  "sq-a1": WindowFunctions,
  "ga-f2": WordEmbeddings,
  "ga-f3": Attention,
  "ga-r4": ChunkingStrategyViz,
  "ga-r5": RAGPipelineViz,
  "ga-r6": AdvancedRAGViz,
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
  "py-o1": ClassObjectLab,
  "py-o2": InheritanceExplorer,
  "py-o4": DecoratorForge,
  "py-d1": FeatureScaling,
  "py-d2": PandasDataLab,
  "py-d3": GroupByMergeForge,
  "py-d5": VectorizationRace,
  "sd-p1": BatchVsStreaming,
  "sd-p2": ETLPipeline,
  "sd-p3": StreamingEnginesTrinity,
  "sd-p4": WarehouseStarSchema,
  "sd-m1": MLSystemPipeline,
  "sd-m2": FeatureStoreViz,
  "sd-m3": BatchVsStreaming,
  "sd-m4": RecSysCollaborativeFiltering,
  "mo-c1": MLCICDPipelineViz,
  "mo-t3": AirflowDAGViz,
  "mo-t4": CanaryDeploymentViz,
  "mo-v1": MatplotlibAnatomyViz,
  "sp-r3": MatrixFactorizationViz,
  "sp-r4": RecEvalMetricsViz,
  "sp-t2": ARIMACFViz,
  "sp-t3": ProphetDecompositionViz,
  "sp-n1": TextPreprocessingPipelineViz,
  "sql-found-01": SQLOrderOfExecution,
  "sql-found-02": SQLNullLogic,
  "sql-found-03": SQLGroupByViz,
  "sql-found-04": SQLSubqueryVsJoin,
  "sq-a1": SQLWindowFunctionsViz,
  "sq-a2": SQLLagLeadViz,
  "sq-a3": SQLCteExplorer,
  "sq-a4": SQLPivotViz,
  "sq-a5": SQLExplainPlanViz,
  "sq-d1": SQLNormalizationViz,
  "sq-d2": SQLIndexingViz,
  "sq-d3": SQLStarSnowflakeViz,
  "sq-d4": SQLOltpOlapViz,
  "st-f1": StatMeanMedianModeViz,
  "st-f3": StatPercentileIQRViz,
  "st-f4": StatCorrelationViz,
  "st-p3": StatBinomialPoissonViz,
  "st-p4": StatCLTViz,
  "st-i2": StatPValueViz,
  "st-i3": StatTestsViz,
  "st-i4": StatConfidenceIntervalViz,
  "st-i5": StatTypeErrorsViz,
  "st-i6": StatPowerAnalysisViz,
  "st-a2": StatMultipleTestingViz,
  "st-a3": StatBootstrapViz,
  "st-a4": StatBayesFrequentistViz,
  "mo-t1": GitWorkflowViz,
  "mo-t2": VenvCondaViz,
  "mo-t5": AWSDataScienceViz,
  "mo-c3": DriftConceptViz,
  "mo-c4": AutoRetrainingViz,
  "mo-v2": PlotlyInteractiveViz,
  "mo-v3": DashboardDesignViz,
  "sp-r2": ContentBasedRecViz,
  "sp-t4": LSTMSequenceViz,
  "sp-n3": SentimentAnalysisViz,
  "sp-n4": NERViz,
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

// ─── AI CHATBOT COMPONENT ────────────────────────────────────────────────────
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN APP
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

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
  const [chatbotSeed, setChatbotSeed] = useState("");
  const [progress, setProgress] = useState({});
  const [courseTab, setCourseTab] = useState("learn");
  const [diffFilter, setDiffFilter] = useState("All");
  const [evalLoading, setEvalLoading] = useState(false);
  const [evalError, setEvalError] = useState(null);
  const [evalResult, setEvalResult] = useState(null);
  const { intent, setIntent } = useLearnerIntent();

  // Screen-reader announcement for the current view (DS-101 accessibility).
  const liveMessage =
    view === "lesson" && activeLesson ? `Lesson opened: ${activeLesson.title}`
    : view === "course" && activeCourse ? `Course opened: ${activeCourse.title}`
    : view === "question" && activeQuestion ? `Practice question opened: ${activeQuestion.title}`
    : view === "home" ? "Home"
    : "";

  const totalLessons = CURRICULUM.reduce((a, c) => a + c.topics.reduce((b, t) => b + t.lessons.length, 0), 0);
  const totalQuestions = CURRICULUM.reduce((a, c) => a + c.questions.length, 0);
  useEffect(() => {
    window.history.pushState({ dsView: view }, "");
  }, [view]);

  useEffect(() => {
    try {
      const issues = auditPythonLessonIntegrity(CURRICULUM, VISUALIZATIONS);
      if (issues.length > 0) {
        console.warn("[DataSpark] Python lesson integrity issues:", issues);
      }
    } catch {
      // Audit is non-blocking — never let it crash the platform.
    }
  }, []);

  useEffect(() => {
    const onPop = (event) => {
      const nextView = event?.state?.dsView;
      if (nextView && ["home", "course", "lesson", "question"].includes(nextView)) {
        setView(nextView);
      } else if (view !== "home") {
        setView("home");
      }
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [view]);

  const completedLessons = Object.keys(progress).filter(k => progress[k] === "done").length;

  useEffect(() => {
    if (view === "lesson" && activeLesson && activeCourse) {
      try {
        trackLvsEvent({
          eventName: LVS_EVENT_NAMES.lessonStart,
          page: "/platform",
          metadata: buildLvsMetadata({ courseId: activeCourse.id, lessonId: activeLesson.id }),
        });
      } catch {
        // Never block UX on analytics failures.
      }
    }
  }, [view, activeLesson, activeCourse]);

  const submitPracticeAnswer = useCallback(async (answerText) => {
    if (!activeQuestion || !answerText?.trim()) return;
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
          userAnswer: answerText.trim(),
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
  }, [activeQuestion]);

  const diffBadge = (d) => {
    const c = { Easy: DS.grn, Medium: "#F59E0B", Hard: "#EF4444" };
    return <span style={{ background: `${c[d]}18`, color: c[d], padding: "3px 10px", borderRadius: 999, fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", border: `1px solid ${c[d]}35`, fontFamily: "var(--ds-mono), monospace" }}>{d}</span>;
  };

  // ─── HOME VIEW ─────────────────────────────────────────────────────────────
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
          The DataSpark approach: <span style={{ color: DS.t1, fontWeight: 600 }}>systems thinking</span>
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
              <div style={{ fontSize: "clamp(22px, 4vw, 28px)", fontWeight: 650, color: DS.t1, fontFamily: "var(--ds-sans), sans-serif", letterSpacing: "-0.02em" }}>{s.n}</div>
              <div style={{ fontSize: 10, color: DS.dim, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "var(--ds-mono), monospace" }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ ...dsGlassCard({ padding: "14px 18px", marginBottom: 20 }), display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div style={{ fontSize: 12, color: DS.t3, fontFamily: "var(--ds-mono), monospace", fontWeight: 600 }}>
          What brings you here?
        </div>
        <IntentSelector intent={intent} onSelect={setIntent} compact />
      </div>

      {(() => {
        const pythonCourse = CURRICULUM.find((c) => c.id === "python");
        const pythonLessonCount = pythonCourse
          ? pythonCourse.topics.reduce((a, t) => a + t.lessons.length, 0)
          : 0;
        const completedPythonIds = pythonCourse
          ? pythonCourse.topics.flatMap((t) => t.lessons.map((l) => l.id)).filter((id) => progress[id] === "done")
          : [];
        const artifacts = buildPythonProgressArtifacts({
          completedLessonIds: completedPythonIds,
          totalPythonLessons: pythonLessonCount,
        });
        if (artifacts.unlockedSkills.length === 0 && artifacts.readinessMilestones.length === 0) return null;
        const donePy = new Set(completedPythonIds);
        const CLUSTER_LESSONS = {
          "py-basics": ["py-b1", "py-b2", "py-b3", "py-b4", "py-b5"],
          "py-control": ["py-c1", "py-c2", "py-c3", "py-c4", "py-c5"],
          "py-oop": ["py-o1", "py-o2", "py-o3", "py-o4"],
          "py-data": ["py-d1", "py-d2", "py-d3", "py-d4", "py-d5"],
        };
        const clusterNarratives = Object.entries(CLUSTER_LESSONS)
          .filter(([, ids]) => ids.every((id) => donePy.has(id)))
          .map(([cid]) => PYTHON_CLUSTER_MILESTONES?.[cid])
          .filter(Boolean);
        return (
          <div style={{ ...dsGlassCard({ padding: "16px 20px", marginBottom: 20, border: `1px solid rgba(59,130,246,0.25)` }) }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#60A5FA", fontFamily: "var(--ds-mono), monospace", letterSpacing: "0.12em", marginBottom: 10, textTransform: "uppercase" }}>
              Python Progress &mdash; {artifacts.completionRate}% complete
            </div>
            {artifacts.unlockedSkills.length > 0 && (
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 11, color: DS.t3, fontFamily: "var(--ds-mono), monospace", marginBottom: 6 }}>Unlocked skills</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {artifacts.unlockedSkills.map((skill) => (
                    <span key={skill} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 999, background: "rgba(59,130,246,0.12)", color: "#60A5FA", fontFamily: "var(--ds-mono), monospace", fontWeight: 600, border: "1px solid rgba(59,130,246,0.3)" }}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {artifacts.readinessMilestones.length > 0 && (
              <div>
                <div style={{ fontSize: 11, color: DS.t3, fontFamily: "var(--ds-mono), monospace", marginBottom: 6 }}>Milestones reached</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {artifacts.readinessMilestones.map((m) => (
                    <span key={m} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 999, background: "rgba(52,211,153,0.12)", color: DS.grn, fontFamily: "var(--ds-mono), monospace", fontWeight: 600, border: "1px solid rgba(52,211,153,0.3)" }}>
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {clusterNarratives.length > 0 && (
              <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${DS.border}`, display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ fontSize: 11, color: DS.t3, fontFamily: "var(--ds-mono), monospace" }}>You can now</div>
                {clusterNarratives.map((c) => (
                  <div key={c.title} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                    <span aria-hidden="true" style={{ color: DS.grn, lineHeight: 1.5, flexShrink: 0, marginTop: 2 }}><Check size={13} strokeWidth={2.5} /></span>
                    <span style={{ fontSize: 13, color: DS.t2, lineHeight: 1.5, fontFamily: "var(--ds-sans), sans-serif" }}>{c.completionStatement}</span>
                  </div>
                ))}
              </div>
            )}
            <div style={{ marginTop: 16 }}>
              <ProgressArtifactCard
                completionRate={artifacts.completionRate}
                unlockedSkills={artifacts.unlockedSkills}
                readinessMilestones={artifacts.readinessMilestones}
              />
            </div>
          </div>
        );
      })()}

      <div className="ds-stagger" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16, paddingBottom: 72 }}>
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
                ...dsGlassCard({ cursor: "pointer", transition: `transform ${DS.durBase} ${DS.easeOut}, background ${DS.durBase} ${DS.easeOut}, border-color ${DS.durFast} ${DS.easeOut}` }),
                padding: "22px 20px",
                position: "relative",
                overflow: "hidden",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = `${course.color}55`;
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.background = DS.surface2;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = DS.border;
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.background = DS.cardGlass;
              }}
            >
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${course.color}, ${course.color}00)` }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <CourseMark color={course.color} mark={course.mark} size="lg" />
                <span style={{ fontSize: 11, color: DS.dim, fontFamily: "var(--ds-mono), monospace", fontWeight: 600 }}>{lessonCount} lessons · {course.questions.length} Qs</span>
              </div>
              <div style={{ fontSize: 17, fontWeight: 700, color: DS.t1, fontFamily: "var(--ds-sans), sans-serif", marginBottom: 8 }}>{course.title}</div>
              <div style={{ fontSize: 13, color: DS.t3, lineHeight: 1.55, fontFamily: "var(--ds-sans), sans-serif", marginBottom: 14, minHeight: 44 }}>{course.description}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
                {course.topics.slice(0, 3).map(t => (
                  <span key={t.id} style={{ fontSize: 11, padding: "3px 8px", borderRadius: 6, background: "rgba(255,255,255,0.04)", color: DS.t3, fontFamily: "var(--ds-mono), monospace", border: `1px solid ${DS.border}` }}>{t.title}</span>
                ))}
                {course.topics.length > 3 && <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 6, background: "rgba(255,255,255,0.04)", color: DS.dim, fontFamily: "var(--ds-mono), monospace", border: `1px solid ${DS.border}` }}>+{course.topics.length - 3}</span>}
              </div>
              <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 6, height: 4, overflow: "hidden" }}>
                <div style={{ width: `${pct}%`, height: "100%", background: `linear-gradient(90deg, ${course.color}, ${course.accent})`, borderRadius: 6, transition: "width 0.4s" }} />
              </div>
              <div style={{ fontSize: 11, color: DS.dim, marginTop: 6, fontFamily: "var(--ds-mono), monospace" }}>{pct}% complete</div>
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
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 clamp(16px, 4vw, 28px)" }}>
        <button type="button" onClick={() => setView("home")} style={{ background: "none", border: "none", color: DS.t3, fontSize: 12, cursor: "pointer", padding: "20px 0 8px", fontFamily: "var(--ds-mono), monospace", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 5 }}><ArrowLeft size={14} /> All courses</button>

        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 8 }}>
          <CourseMark color={c.color} mark={c.mark} size="md" />
          <div>
            <h1 style={{ fontSize: "clamp(22px, 4vw, 30px)", fontWeight: 650, color: DS.t1, margin: 0, letterSpacing: "-0.03em" }}>{c.title}</h1>
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
                <div className="ds-stagger" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
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
                          ...dsGlassCard({ padding: "14px 16px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", transition: `border-color ${DS.durFast} ${DS.easeOut}, background ${DS.durBase} ${DS.easeOut}` }),
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${c.color}55`; e.currentTarget.style.background = DS.surface2; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = DS.border; e.currentTarget.style.background = DS.cardGlass; }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{
                            width: 30, height: 30, borderRadius: "50%",
                            background: isDone ? `${DS.grn}18` : "rgba(255,255,255,0.04)",
                            border: `2px solid ${isDone ? DS.grn : DS.border}`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 12, color: isDone ? DS.grn : DS.dim, fontWeight: 700, fontFamily: "var(--ds-mono), monospace",
                          }}>
                            {isDone ? <Check size={13} strokeWidth={2.5} /> : li + 1}
                          </div>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 600, color: DS.t1 }}>{lesson.title}</div>
                            <div style={{ fontSize: 11, color: DS.t3, fontFamily: "var(--ds-mono), monospace", marginTop: 2 }}>{lesson.duration}</div>
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          {lesson.hasViz && <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 6, background: `${c.color}18`, color: c.accent, fontFamily: "var(--ds-mono), monospace", fontWeight: 600, border: `1px solid ${c.color}30` }}>Interactive</span>}
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
                  background: diffFilter === d ? `${c.color}18` : "transparent", border: `1px solid ${diffFilter === d ? `${c.color}35` : DS.border}`,
                  borderRadius: 8, padding: "6px 12px", color: diffFilter === d ? DS.t1 : DS.dim, fontSize: 12, cursor: "pointer", fontFamily: "var(--ds-mono), monospace", fontWeight: 600,
                }}>{d}</button>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {c.questions.filter(q => diffFilter === "All" || q.difficulty === diffFilter).map(q => (
                <div
                  key={q.id}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setActiveQuestion(q); setEvalLoading(false); setEvalResult(null); setEvalError(null); setView("question"); } }}
                  onClick={() => { setActiveQuestion(q); setEvalLoading(false); setEvalResult(null); setEvalError(null); setView("question"); }}
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
                        {(q.tags || []).map(t => <span key={t} style={{ fontSize: 11, padding: "2px 7px", borderRadius: 6, background: "rgba(255,255,255,0.04)", color: DS.t3, fontFamily: "var(--ds-mono), monospace", border: `1px solid ${DS.border}` }}>{t}</span>)}
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                      <span style={{ fontSize: 11, color: DS.t3, fontFamily: "var(--ds-mono), monospace" }}>{q.type === "code" ? "Coding" : "Open-ended"}</span>
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
        backLabel={`Back to ${activeCourse.title}`}
        onMarkComplete={() => {
          try {
            trackLvsEvent({
              eventName: LVS_EVENT_NAMES.lessonComplete,
              page: "/platform",
              metadata: buildLvsMetadata({ courseId: activeCourse.id, lessonId: activeLesson.id, passed: true }),
            });
          } catch {
            // Never block UX on analytics failures.
          }
          setProgress((p) => ({ ...p, [activeLesson.id]: "done" }));
          setView("course");
        }}
        onAskTutor={() => { setChatbotSeed(""); setChatbotCourse(activeCourse); }}
        onOpenPractice={() => { setCourseTab("practice"); setView("course"); }}
        intent={intent}
        onAskTutorWithPrompt={(prompt) => { setChatbotSeed(prompt || ""); setChatbotCourse(activeCourse); }}
      />
    );
  };

  // ─── QUESTION VIEW ─────────────────────────────────────────────────────────
  const renderQuestion = () => {
    if (!activeQuestion || !activeCourse) return null;
    const q = activeQuestion;

    return (
      <div style={{ padding: "0 clamp(8px, 2vw, 16px)" }}>
        <button type="button" onClick={() => { setCourseTab("practice"); setView("course"); }} style={{ background: "none", border: "none", color: DS.t3, fontSize: 12, cursor: "pointer", padding: "16px 0 8px", fontFamily: "var(--ds-mono), monospace", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 5 }}><ArrowLeft size={14} /> Back to practice</button>

        <PracticeQuestion
          question={q}
          courseAccent={activeCourse.color}
          onSubmit={submitPracticeAnswer}
          evalLoading={evalLoading}
          evalResult={evalResult}
          evalError={evalError}
          onAskTutor={() => setChatbotCourse(activeCourse)}
        />
      </div>
    );
  };

  return (
    <div style={{ minHeight: "100vh", background: DS.bg, color: DS.t1, fontFamily: "var(--ds-sans), system-ui, sans-serif", position: "relative" }}>
      <LiveRegion message={liveMessage} />
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
        @media (max-width: 640px) {
          .ds-nav { flex-wrap: wrap !important; padding: 8px 16px 6px !important; gap: 6px !important; }
          .ds-nav-right { max-width: 100% !important; width: 100%; padding-bottom: 4px; }
          .ds-g2 { grid-template-columns: 1fr !important; }
          .ds-g3 { grid-template-columns: 1fr !important; }
          .ds-artifact-row { grid-template-columns: 1fr !important; }
          .ds-artifact-tier { text-align: left !important; }
          .ds-code-line--tap { min-height: 44px !important; align-items: center; }
        }
      `}</style>

      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        <div style={{ position: "absolute", width: 720, height: 720, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.04) 0%, transparent 68%)", top: "-18%", left: "-10%" }} />
        <div style={{ position: "absolute", width: 480, height: 480, borderRadius: "50%", background: "radial-gradient(circle, rgba(52,211,153,0.05) 0%, transparent 70%)", bottom: "0%", right: "-8%" }} />
      </div>

      <nav className="ds-nav" style={{
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
            Home
          </Link>
          <Link
            to="/platform/insights"
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
            Insights
          </Link>
        </div>

        <div className="ds-nav-right" style={{ display: "flex", gap: 4, overflowX: "auto", maxWidth: "min(68vw, 520px)", paddingBottom: 2 }}>
          {CURRICULUM.slice(0, 6).map(c => (
            <button
              key={c.id}
              type="button"
              onClick={() => { setActiveCourse(c); setView("course"); setCourseTab("learn"); }}
              style={{
                background: activeCourse?.id === c.id ? `${c.color}18` : "transparent",
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
        {view === "home" && <div key="home" className="ds-animate-in">{renderHome()}</div>}
        {view === "course" && <div key={`course-${activeCourse?.id}`} className="ds-animate-in">{renderCourse()}</div>}
        {view === "lesson" && <div key={`lesson-${activeLesson?.id}`} className="ds-animate-in">{renderLesson()}</div>}
        {view === "question" && <div key={`question-${activeQuestion?.id}`} className="ds-animate-in">{renderQuestion()}</div>}
      </main>

      {chatbotCourse && <AIChatbot course={chatbotCourse} seedInput={chatbotSeed} onClose={() => { setChatbotCourse(null); setChatbotSeed(""); }} />}
    </div>
  );
}


