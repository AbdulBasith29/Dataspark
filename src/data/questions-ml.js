export const ML_QUESTIONS = [
  {
    id: "mlq1", courseId: "ml", topicId: "ml-foundations",
    title: "Churn Feature Engineering Pipeline", difficulty: "Medium", type: "code", language: "python", estimatedMinutes: 20,
    prompt: "Build a feature engineering function for churn prediction: compute recency, frequency, monetary features, activity trends, and engagement ratios from raw event logs.",
    hints: [
      "Recency = days since last event; Frequency = total events in window; Monetary = sum of spend",
      "Trend = recent 7-day activity vs prior 7-day activity",
      "Engagement ratio = active days / total days in window",
    ],
    modelAnswer: `import pandas as pd
import numpy as np

def build_churn_features(events: pd.DataFrame, as_of: pd.Timestamp, window_days: int = 30) -> pd.DataFrame:
    """
    events: columns [user_id, event_type, amount, ts]
    Returns one row per user with RFM + trend features.
    """
    cutoff = as_of
    start  = cutoff - pd.Timedelta(days=window_days)
    mid    = cutoff - pd.Timedelta(days=window_days // 2)

    w = events[(events["ts"] >= start) & (events["ts"] < cutoff)].copy()
    w["date"] = w["ts"].dt.date

    agg = w.groupby("user_id").agg(
        recency      = ("ts",     lambda x: (cutoff - x.max()).days),
        frequency    = ("ts",     "count"),
        monetary     = ("amount", "sum"),
        active_days  = ("date",   "nunique"),
        last_event   = ("ts",     "max"),
    ).reset_index()

    # Trend: events in first half vs second half of window
    early = w[w["ts"] < mid].groupby("user_id").size().rename("events_early")
    late  = w[w["ts"] >= mid].groupby("user_id").size().rename("events_late")
    agg = agg.merge(early, on="user_id", how="left").merge(late, on="user_id", how="left")
    agg[["events_early", "events_late"]] = agg[["events_early", "events_late"]].fillna(0)
    agg["activity_trend"] = (agg["events_late"] - agg["events_early"]) / (agg["events_early"] + 1)

    # Engagement ratio
    agg["engagement_ratio"] = agg["active_days"] / window_days

    # Avg spend per event
    agg["avg_spend"] = agg["monetary"] / agg["frequency"].replace(0, np.nan)

    return agg.fillna(0)`,
    rubric: [
      "Recency computed as days since last event relative to as_of",
      "Frequency is total event count in window",
      "Monetary is sum of spend",
      "Activity trend compares early vs late half of window",
      "Engagement ratio is active days / window length",
      "Handles zero-division safely (fillna, replace)",
      "Function accepts an as_of parameter for point-in-time correctness",
    ],
    tags: ["feature-engineering", "pandas", "churn"],
    commonMistakes: ["Using current timestamp instead of as_of (causes data leakage)", "Not handling users with zero events in a period", "Division by zero when frequency is 0"],
  },
  {
    id: "mlq2", courseId: "ml", topicId: "ml-foundations",
    title: "Model Selection: Why Not Always XGBoost?", difficulty: "Medium", type: "open-ended", estimatedMinutes: 15,
    prompt: "Your junior DS always defaults to XGBoost. For these 4 scenarios (linear relationship with 10 features, 50M rows with 3 features, highly interpretable model needed for compliance, sparse text data), explain which model you'd choose and why.",
    hints: [
      "XGBoost is not free — it's slow on large data, complex to explain, and overkill for linear problems",
      "Linear regression beats XGBoost when the true relationship is linear",
      "Logistic regression with L1 regularization is interpretable AND accurate for compliance use cases",
    ],
    modelAnswer: `**Scenario 1 — Linear relationship, 10 features:**
Use **Linear/Logistic Regression**. If the true relationship is linear, XGBoost learns the same pattern but with far more parameters, longer training, and higher variance. Occam's razor: simpler model fits better when assumptions hold. Test residual plots first — if they're random, linear is enough.

**Scenario 2 — 50M rows, 3 features:**
Use **Logistic Regression or a shallow tree**. XGBoost at 50M rows takes significant RAM and training time; a linear model trains in seconds and is trivially parallelisable. With only 3 features there's little non-linearity to capture. Profile first: if accuracy is close, prefer the faster model.

**Scenario 3 — Interpretable model for compliance:**
Use **Logistic Regression (L1 regularised) or a shallow Decision Tree (depth ≤ 4)**. Logistic regression gives you coefficients and confidence intervals that regulators accept. A decision tree gives an auditable flowchart. XGBoost requires SHAP post-hoc — better than nothing, but regulators often require a "white-box" model by contract.

**Scenario 4 — Sparse text data:**
Use **Linear SVM or Logistic Regression with TF-IDF features**. Sparse high-dimensional data (10k+ columns, mostly zeros) is where linear models with regularisation excel. XGBoost struggles with very high dimensionality and sparse data. For deep NLP, a pre-trained transformer with a linear head is the modern standard.

**The meta-lesson:** XGBoost is a strong default for tabular data with non-linear patterns, but every model choice is a tradeoff of training speed, inference speed, interpretability, and accuracy given the data's structure.`,
    rubric: [
      "Correctly identifies linear regression for linear relationship",
      "Addresses scalability concern for 50M rows",
      "Recommends interpretable model (LR or shallow tree) for compliance",
      "Identifies linear models as better for sparse text",
      "Explains the reason for each choice, not just the name",
      "Acknowledges XGBoost strengths to show balance",
    ],
    tags: ["model-selection", "tradeoffs", "reasoning"],
    commonMistakes: ["Just saying 'use XGBoost' or 'use neural nets' without justification", "Not considering training/inference speed", "Claiming SHAP fully solves the compliance interpretability requirement"],
  },
  {
    id: "mlq3", courseId: "ml", topicId: "ml-foundations",
    title: "Debug a Leaking Pipeline", difficulty: "Hard", type: "open-ended", estimatedMinutes: 18,
    prompt: "Your model has 99.2% accuracy in development but 61% in production. Walk through your systematic debugging process. What are the most likely causes? How do you prevent this in the future?",
    hints: [
      "99% accuracy in dev almost always means data leakage — future data leaking into training",
      "Check: is the label included in features? Is validation done before or after preprocessing?",
      "Train/test split on time-series data must be temporal, not random",
    ],
    modelAnswer: `**Step 1 — Reproduce the gap**
Run the exact production pipeline on a holdout set that was never touched. If accuracy drops immediately, the problem is in training. If it degrades over time, suspect distribution shift.

**Most likely causes of 99% → 61%:**

1. **Data leakage (most likely):** The label or a feature derived from it leaked into training data. Common culprits: target-encoding computed on the full dataset before splitting, preprocessing (e.g. StandardScaler, imputation) fitted on all data including the test set, or a feature column that's computed post-outcome.

2. **Wrong train/test split on time-series:** Random split for temporal data lets the model "see the future." Production data only contains past signals — so the model learned a non-causal pattern.

3. **Training/serving skew:** Features are computed differently in training vs. the live pipeline (e.g. different aggregation windows, missing joins in production).

4. **Class imbalance difference:** Dev dataset was balanced; production has very different class ratios.

**Debugging checklist:**
- Audit every feature: can it causally exist BEFORE the label is known?
- Refit scaler/encoder only on training fold — re-run with strict Pipeline
- Check correlation of each feature with the target; near-1.0 is a red flag
- Temporal split: use an earlier cutoff for training, later for validation
- Shadow mode: run old and new model in parallel and compare predictions

**Prevention:**
- Always use sklearn Pipeline so preprocessing fits only on train
- For time-series, use TimeSeriesSplit
- Add a "leakage audit" step to model review checklist
- Log and version feature computation logic in MLflow/DVC`,
    rubric: [
      "Identifies data leakage as primary suspect",
      "Lists specific leakage scenarios (target encoding, scaler on full data)",
      "Addresses temporal split issue for time-series",
      "Mentions training/serving skew",
      "Proposes actionable debugging steps (feature audit, correlation check)",
      "Gives prevention recommendations (Pipeline, TimeSeriesSplit)",
    ],
    tags: ["data-leakage", "debugging", "ML-pipelines"],
    commonMistakes: ["Only mentioning 'overfitting' without explaining leakage specifically", "Not checking train/test split methodology", "Jumping to model architecture changes before auditing data"],
  },
  {
    id: "mlq4", courseId: "ml", topicId: "ml-foundations",
    title: "End-to-End ML Pipeline", difficulty: "Hard", type: "code", language: "python", estimatedMinutes: 25,
    prompt: "Build a complete sklearn pipeline: imputation, encoding, scaling, feature selection, model training with cross-validation, and hyperparameter tuning. Use Pipeline and ColumnTransformer.",
    hints: [
      "ColumnTransformer applies different preprocessing to numeric vs categorical columns",
      "FeatureUnion or a second Pipeline step for feature selection after preprocessing",
      "RandomizedSearchCV is faster than GridSearchCV for large search spaces",
    ],
    modelAnswer: `import numpy as np
import pandas as pd
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.impute import SimpleImputer
from sklearn.feature_selection import SelectFromModel
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.model_selection import RandomizedSearchCV, StratifiedKFold
from sklearn.metrics import roc_auc_score

# --- 1. Define feature groups (adjust to your dataframe) ---
num_cols = ["age", "tenure_days", "spend_30d", "sessions_7d"]
cat_cols = ["plan", "country", "acquisition_channel"]

# --- 2. Preprocessing sub-pipelines ---
num_pipe = Pipeline([
    ("impute", SimpleImputer(strategy="median")),
    ("scale",  StandardScaler()),
])
cat_pipe = Pipeline([
    ("impute", SimpleImputer(strategy="most_frequent")),
    ("encode", OneHotEncoder(handle_unknown="ignore", sparse_output=False)),
])

preprocessor = ColumnTransformer([
    ("num", num_pipe, num_cols),
    ("cat", cat_pipe, cat_cols),
], remainder="drop")

# --- 3. Full pipeline with feature selection + model ---
full_pipe = Pipeline([
    ("prep",    preprocessor),
    ("select",  SelectFromModel(RandomForestClassifier(n_estimators=50, random_state=42),
                                 threshold="mean")),
    ("model",   GradientBoostingClassifier(random_state=42)),
])

# --- 4. Hyperparameter search ---
param_dist = {
    "model__n_estimators":   [100, 200, 400],
    "model__max_depth":      [3, 4, 5],
    "model__learning_rate":  [0.01, 0.05, 0.1],
    "model__subsample":      [0.7, 0.85, 1.0],
}

cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
search = RandomizedSearchCV(
    full_pipe, param_distributions=param_dist,
    n_iter=20, cv=cv, scoring="roc_auc",
    n_jobs=-1, random_state=42, verbose=1,
)

# --- 5. Fit and evaluate ---
# search.fit(X_train, y_train)
# print(f"Best CV AUC: {search.best_score_:.4f}")
# print(f"Best params: {search.best_params_}")
# y_pred = search.best_estimator_.predict_proba(X_test)[:, 1]
# print(f"Test AUC: {roc_auc_score(y_test, y_pred):.4f}")`,
    rubric: [
      "ColumnTransformer applies correct preprocessing to numeric and categorical columns separately",
      "Numeric pipe includes imputation and scaling",
      "Categorical pipe includes imputation and one-hot encoding",
      "Pipeline ensures no data leakage (all steps fit on train only)",
      "Feature selection integrated as a pipeline step",
      "RandomizedSearchCV used for hyperparameter tuning",
      "StratifiedKFold used for imbalanced classification",
    ],
    tags: ["sklearn", "pipelines", "end-to-end"],
    commonMistakes: ["Fitting scaler/encoder before the split (leakage)", "Using GridSearchCV over large spaces (too slow)", "Not handling unknown categories in OneHotEncoder"],
  },
  {
    id: "mlq5", courseId: "ml", topicId: "ml-foundations",
    title: "Explain Your Model to the CEO", difficulty: "Easy", type: "open-ended", estimatedMinutes: 12,
    prompt: "You built a gradient boosting model that predicts which customers will churn. The CEO asks 'how does it work?' and 'why should I trust it?'. Explain without jargon. Then explain what SHAP values show.",
    hints: [
      "Use an analogy: a committee of decision trees, each correcting the last",
      "Trust comes from validation metrics + out-of-sample testing, not just 'AI'",
      "SHAP shows per-customer 'why' — not just the average importance",
    ],
    modelAnswer: `**How it works (no jargon):**
"Imagine 500 experts each studying our customer data and writing simple rules like 'if a customer hasn't logged in for 14 days AND their spend dropped >30%, flag them as at-risk.' Each expert is imperfect, but we combine all 500 opinions — the majority vote determines the final prediction. Crucially, each expert focuses on the mistakes the previous ones made, so the group gets progressively smarter. That's gradient boosting."

**Why you should trust it:**
"We tested it on 3 months of historical data the model never saw. It correctly identifies 78% of customers who churned and flags very few false alarms (precision: 81%). In plain English: out of every 10 customers it warns us about, 8 actually churn. We've been running it in shadow mode for 4 weeks — predictions match actual outcomes well."

**What SHAP values show:**
Overall feature importance tells you 'login frequency matters most to the model across all customers.' SHAP tells you *why this specific customer* got a high churn score. For example: 'Customer 4821 is high-risk primarily because (1) no login in 18 days [pushes score +0.3], (2) support ticket opened [+0.2], (3) spend dropped 40% [+0.15].' This lets your CSM team personalise their outreach — instead of 'we predict you'll churn', they can say 'we noticed you haven't logged in — can we help?'"`,
    rubric: [
      "Explains boosting using a clear non-technical analogy",
      "Justifies trust with out-of-sample validation metrics",
      "States precision and recall in business terms (not just percentages)",
      "Distinguishes global feature importance from per-customer SHAP explanations",
      "Connects SHAP output to an actionable business use (personalised outreach)",
    ],
    tags: ["explainability", "communication", "SHAP"],
    commonMistakes: ["Using technical terms like 'gradient' or 'ensemble' with the CEO", "Citing training accuracy instead of holdout metrics", "Describing SHAP as just 'feature importance' (missing the per-prediction nuance)"],
  },
];
