/**
 * Machine Learning → Evaluation course section.
 * Senior-level lesson modules (ml-e1..ml-e4). Shape matches the LessonModuleSpec
 * typedef in ../lesson-modules.js. Imported and merged by the central wiring file.
 */

/** @type {Record<string, import("../lesson-modules.js").LessonModuleSpec>} */
export const ML_EVALUATION = {
  "ml-e1": {
    durationLabel: "18–20 min",
    outcomes: [
      "Read a **confusion matrix** fluently and derive **precision, recall, and F1** from TP/FP/FN/TN without looking them up.",
      "Choose **precision vs recall vs F1** from the *cost structure* of the problem (missed cancer vs spam in the inbox), not from habit.",
      "Explain how the **decision threshold** turns one ranking model into a whole family of operating points — and why accuracy is the wrong dial.",
      "Avoid the senior-level traps: **accuracy paradox** under imbalance, **macro vs micro** averaging, and reporting a single F1 as if it were threshold-free.",
    ],
    learnMarkdown: `## The mental model: one ranker, many classifiers

Almost every classifier you ship outputs a **score** (a probability, a margin, a logit), not a hard label. The hard label only appears when you compare that score to a **threshold**. So a single trained model is really a *family* of classifiers — one per threshold. The confusion matrix is how you photograph **one** member of that family.

Lay it out the way scikit-learn does (rows = actual, columns = predicted):

| | Predicted Negative | Predicted Positive |
|---|---|---|
| **Actual Negative** | TN | FP (type I) |
| **Actual Positive** | FN (type II) | TP |

Four numbers. Every scalar metric you have ever heard of is a ratio of these four. If you can rebuild the table on a whiteboard and point at each cell, you can derive any metric live in an interview instead of reciting a memorized formula you might transpose under pressure.

## The three workhorse metrics

- **Precision** = TP / (TP + FP). *Of the things I flagged positive, how many were right?* Punishes **false alarms**.
- **Recall** (sensitivity, TPR) = TP / (TP + FN). *Of the truly positive things, how many did I catch?* Punishes **misses**.
- **F1** = 2·P·R / (P + R), the **harmonic mean** of precision and recall. Harmonic, not arithmetic, because it refuses to be fooled: a model with precision 1.0 and recall 0.01 has arithmetic mean ~0.5 but F1 ~0.02. F1 collapses toward the *worse* of the two.

Note what is **absent**: every one of these ignores TN. That is deliberate. In fraud, search, and medical screening the negatives vastly outnumber positives, and a metric that rewards "correctly ignoring the boring majority" is a metric that rewards doing nothing.

## Accuracy is a trap (the imbalance paradox)

Accuracy = (TP + TN) / total. On a dataset that is 99% negative (say, 1% fraud), a model that predicts "never fraud" scores **99% accuracy** and catches **zero** fraud. Recall is 0, precision is undefined, the business loses every dollar — and the dashboard glows green. This is the single most common way a junior misreads a model in production. The fix is to *never quote accuracy alone on imbalanced data*; quote precision/recall (or PR-AUC) at a stated threshold.

## Choosing the metric from the cost of being wrong

The metric follows from **which error hurts more**:

| Scenario | Costly error | Optimize for | Why |
|---|---|---|---|
| Cancer screening | Missing a sick patient (FN) | **Recall** | A missed tumor can be fatal; a false alarm costs a follow-up scan |
| Spam filter | Flagging a real email (FP) | **Precision** | Losing a job offer to the spam folder is worse than seeing one spam |
| Fraud alerts (analyst-reviewed) | Both, bounded by review capacity | **Precision@k** | You can only review *k* cases/day; maximize hits within that budget |
| Search / recommendations | Irrelevant results erode trust | **Precision@k / F1** | Users see the top few; tail recall barely matters |
| Information retrieval (legal e-discovery) | Missing a responsive doc | **Recall** (high), then triage | Sanctions for missing evidence dwarf review cost |

The senior move is to state the trade in business units — dollars, lives, analyst-hours — and *then* pick the metric, rather than defaulting to F1 because it is "balanced."

## The threshold is the real knob

Raising the threshold means you demand more confidence before predicting positive: **fewer** positives, so FP and TP both fall → precision usually **up**, recall **down**. Lowering it floods predictions positive → recall up, precision down. Sweeping the threshold from 1→0 traces the **precision–recall curve** (and the ROC, covered in ml-e2). Two consequences:

1. **F1 is threshold-dependent.** "Our F1 is 0.82" is meaningless without "at threshold 0.5" — and 0.5 is rarely optimal. Pick the threshold on a **validation set** to hit a business target (e.g., "recall ≥ 0.90 at the best achievable precision"), then *freeze* it before touching test.
2. **You tune the threshold, not the model, for many launches.** Re-training is expensive; moving the operating point along an existing PR curve is free and instant. Senior engineers exhaust the threshold lever before retraining.

## Multiclass: macro vs micro vs weighted

With more than two classes you compute per-class precision/recall (one-vs-rest) and then **average**:

- **Macro** — unweighted mean across classes. Treats a 5-sample class and a 5000-sample class equally; surfaces failure on **rare** classes. Use when every class matters regardless of frequency.
- **Micro** — pool all TP/FP/FN globally, then compute once. Dominated by the **frequent** classes; equals accuracy in single-label settings.
- **Weighted** — macro weighted by class support. A compromise; can still hide a tanking rare class.

Quoting "F1 = 0.9" without saying *which average* is a red flag in a senior review.

## Pitfalls

- **Reporting accuracy on imbalanced data.** Covered above; it is the canonical interview gotcha.
- **Optimizing F1 globally when costs are asymmetric.** F1 weights precision and recall equally; if a miss costs 10× a false alarm, use **F-beta** (β > 1 favors recall) or an explicit cost matrix.
- **Tuning the threshold on the test set.** That leaks; your reported metric is now optimistic. Threshold selection is a *fitting* step — do it on validation.
- **Precision undefined at high thresholds.** When you predict zero positives, TP + FP = 0 and precision is 0/0. Libraries return 0 or NaN; know which, and do not let a NaN silently zero out an average.
- **Confusing recall with accuracy on positives.** Recall ignores negatives entirely; it says nothing about false alarms.

## Specificity, NPV, and the metrics people forget

Precision and recall live on the *positive* side of the table, but interviewers love to check whether you know the negative-side twins:

- **Specificity** (true-negative rate) = TN / (TN + FP). *Of the truly negative things, how many did I correctly clear?* This is recall's mirror image; FPR = 1 − specificity drives the ROC x-axis (ml-e2).
- **Negative predictive value (NPV)** = TN / (TN + FN). *Of the things I cleared, how many were actually fine?* In a screening context, NPV is what a patient who got a "negative" result actually cares about.

Why does this matter? Because *which* metric your stakeholder feels depends on their position in the funnel. A radiologist downstream of a screen cares about precision (don't waste my time) and the patient cares about recall and NPV (don't send me home sick). Senior engineers map each metric to a human who experiences it, rather than reciting all four mechanically.

## The harmonic-mean intuition, drawn out

It is worth internalizing *why* F1 behaves the way it does, because "harmonic mean" is a phrase people say without feeling it. The harmonic mean of two numbers is always ≤ their arithmetic mean and is pulled hard toward the smaller value. Concretely: P = 0.9, R = 0.9 → F1 = 0.90 (balanced, no penalty). P = 0.9, R = 0.1 → arithmetic mean 0.5 but F1 = 0.18. The lopsided model is *punished* down to roughly twice the smaller value. That is the entire design goal: F1 refuses to let a model buy a good score by maxing one metric and abandoning the other. When a stakeholder says "we want a model that's good at both," F1 is the scalar that encodes "both."

## Threshold-independent vs threshold-dependent metrics

Keep two buckets straight, because senior interviewers test it. **Threshold-dependent** metrics — precision, recall, F1, accuracy, specificity — describe *one* operating point and only mean something when you state the threshold. **Threshold-independent** (ranking) metrics — AUC, average precision (ml-e2) — summarize the model across *all* thresholds. The practical consequence: when comparing two *models* before deployment, lean on ranking metrics, because two models with different default thresholds are not comparable on raw F1. When tuning a *deployed* model, you fix the model and slide the threshold-dependent metrics. Mixing the two — e.g., comparing model A's F1@0.5 to model B's F1@0.5 and concluding A ranks better — is a classic confusion, since A might simply have a more favorable default threshold while ranking worse overall.

## A worked threshold sweep

Anchor the intuition numerically. Imagine 100 positives and 900 negatives, and a decent ranker. At threshold 0.9 you predict only the 30 most-confident cases positive: 28 are real (precision 0.93) but you caught only 28 of 100 (recall 0.28). Drop to 0.5 and you predict 200 positive: 85 real (precision 0.43) but recall climbs to 0.85. Drop to 0.2 and you predict 600 positive: 98 real (precision 0.16) and recall 0.98. Watch precision fall monotonically as recall rises — the same model, three radically different classifiers. The "right" point is wherever the business cost is minimized, and nothing about the *model* tells you which; only the cost structure does.

## Putting it together: the operating-point conversation

In a real review the sequence is: (1) agree on the costly error, (2) pick the headline metric, (3) read the PR curve to see what is *achievable*, (4) pick a threshold to hit a target, (5) freeze and validate on held-out data. Skipping straight to "our F1 is 0.82" skips the four steps that actually matter. The number is the *end* of the conversation, not the start.

## Interview questions

- "Your fraud model has 99.5% accuracy. Should you ship it?" — Ask for the **base rate** and the **confusion matrix**; accuracy is meaningless until you know recall on the 0.5% positives.
- "Precision is 0.9, recall is 0.3. The business wants to catch more fraud. What do you change *first*?" — **Lower the threshold** (free), re-quote precision at the new recall, and only retrain if the PR curve itself is too low.
- "When is F1 the wrong objective?" — When error costs are asymmetric (use F-beta / cost matrix) or when you only care about the top-*k* (use precision@k).
- "What does a precision of 0/0 mean and how does your code handle it?" — No positive predictions; define behavior explicitly.
- "Distinguish recall from specificity." — Recall is TP/(TP+FN) over positives; specificity is TN/(TN+FP) over negatives. They move in opposite directions as you slide the threshold.
- "Why a harmonic mean for F1?" — It is dominated by the smaller of precision/recall, so it cannot be gamed by sacrificing one.`,
    video: null,
    videoFallbackMarkdown: `## Deep dive without video

Draw the 2×2 matrix from memory and label every cell (TN, FP, FN, TP). Now run a thought experiment on a **1%-positive** dataset of 1,000 rows (10 positives, 990 negatives):

1. Model A predicts *all negative*. Fill in the matrix: TP=0, FN=10, FP=0, TN=990. Compute accuracy (0.99), recall (0.0), precision (undefined). Notice the dashboard looks great and the model is useless.
2. Model B catches 8 of 10 positives but raises 40 false alarms. Matrix: TP=8, FN=2, FP=40, TN=950. Now precision = 8/48 ≈ 0.17, recall = 0.8, accuracy = 0.958 — *lower* accuracy, vastly more useful model.
3. Write one sentence: "I would pick the threshold to hit recall ≥ ___ because a miss costs ___." Filling that blank with a business unit is the muscle interviewers probe.`,
    tryGuidance: `Use the **Confusion Matrix** visualization. Drag the threshold from low to high and narrate out loud: as the threshold rises, which cells shrink, and which of precision/recall climbs while the other falls? Find the threshold where F1 peaks — then ask yourself whether the *business* would actually want that point, or would prefer to trade some precision for more recall.`,
    interviewGraph: {
            initialStageId: "e1_click_accuracy",
            artifactDimensions: [
              {
                label: "Metric Selection",
                recoveryStageId: "e1_recovery_metrics",
              },
              {
                label: "Precision-Recall Tradeoff",
                recoveryStageId: "e1_recovery_threshold",
              },
              {
                label: "F-Scores",
                recoveryStageId: "e1_recovery_fbeta",
                passLabel: "Classification Metrics Mastery",
              },
            ],
            stages: {
              e1_click_accuracy: {
                id: "e1_click_accuracy",
                type: "click_target",
                badge: "Stage 1",
                title: "Stage 1 · Spotting misleading accuracy",
                prompt: "The code below evaluates a fraud detection model and reports accuracy as the headline metric to stakeholders. Click the line that obscures the model's actual fraud-detection ability.",
                code_snippet: `from sklearn.metrics import accuracy_score, classification_report

# Dataset: 100,000 transactions — 99% legitimate, 1% fraud
model.fit(X_train, y_train)
y_pred = model.predict(X_test)

acc = accuracy_score(y_test, y_pred)
print(f"Model accuracy: {acc:.1%}")   # ds-target:misleading_accuracy
# Output: Model accuracy: 99.2%

# A model that predicts 'legitimate' for EVERY transaction
# would also score 99.0% accuracy`,
                validationCopy: {
                  misleading_accuracy: "Correct. On a 99% negative-class dataset, even a trivial classifier that always predicts 'legitimate' achieves 99% accuracy. Reporting 99.2% accuracy to stakeholders gives the impression of excellent performance while completely hiding the fact that the model may be missing most actual fraud cases. Precision, recall, and F1 on the positive (fraud) class are the relevant metrics here.",
                },
                branches: {
                  misleading_accuracy: "e1_choice_conservative",
                },
              },
              e1_choice_conservative: {
                id: "e1_choice_conservative",
                type: "scenario_choice",
                badge: "Stage 2",
                title: "Stage 2 · Interpreting precision and recall operationally",
                prompt: "A fraud detection model has Precision=0.90 and Recall=0.30 on the fraud class. What does this mean operationally?",
                code_snippet: `from sklearn.metrics import precision_score, recall_score

prec = precision_score(y_test, y_pred)   # 0.90
rec  = recall_score(y_test, y_pred)      # 0.30

# Out of 1,000 actual fraud cases in the test set,
# how many did the model flag? How many flags were correct?`,
                choices: [
                  {
                    id: "a",
                    label: "Model is very conservative — few false alarms, but missing 70% of actual fraud",
                    description: "Correct. Precision=0.90 means 90% of fraud alerts are real fraud (few false positives). Recall=0.30 means only 30% of actual fraud cases were caught — 700 out of 1,000 real fraud transactions go undetected. This is a high-precision, low-recall system.",
                  },
                  {
                    id: "b",
                    label: "Model is aggressive — catching most fraud but raising many false alarms",
                    description: "An aggressive model has high recall (catches most fraud) and low precision (many false alarms). This model is the opposite: high precision, low recall.",
                  },
                  {
                    id: "c",
                    label: "Precision=0.90 means the model is 90% accurate overall",
                    description: "Precision is a class-specific metric: of all predicted positives, how many are true positives. It is not the same as overall accuracy.",
                  },
                  {
                    id: "d",
                    label: "Recall=0.30 means 30% of the model's predictions are wrong",
                    description: "Recall (sensitivity) is true positives / (true positives + false negatives) — the fraction of actual fraud cases that were caught. It says nothing about the error rate of the model's positive predictions.",
                  },
                ],
                branches: {
                  a: "e1_choice_threshold",
                  b: "e1_recovery_metrics",
                  c: "e1_recovery_metrics",
                  d: "e1_recovery_metrics",
                },
                rationale: "High precision + low recall = conservative model: when it says 'fraud', it's usually right, but it lets most fraud slip through. High recall + low precision = aggressive model: catches most fraud but generates many false alarms. In fraud detection, missing real fraud (low recall) is usually costlier than false alarms — this model's recall=0.30 is a serious problem.",
              },
              e1_recovery_metrics: {
                id: "e1_recovery_metrics",
                type: "scenario_choice",
                badge: "Recovery 1",
                title: "Recovery · Choosing the right metric for imbalanced classes",
                prompt: "Your fraud dataset has 99% negative class. Which metric set should you use as your primary evaluation framework?",
                code_snippet: `# Dataset: 990 legitimate, 10 fraud (per 1,000 records)
# Candidate metrics:
# A: Accuracy only
# B: Precision, Recall, F1 on the fraud (positive) class
# C: ROC-AUC
# D: B + C together`,
                choices: [
                  {
                    id: "a",
                    label: "Accuracy only",
                    description: "Accuracy is dominated by the majority class in imbalanced settings. A model that always predicts 'legitimate' achieves 99% accuracy while detecting zero fraud.",
                  },
                  {
                    id: "b",
                    label: "Precision, Recall, F1 on the positive class + ROC-AUC",
                    description: "Correct. Precision and recall on the minority (fraud) class directly measure what matters. ROC-AUC evaluates the model's ranking ability across thresholds. Together they give a complete picture of both threshold-specific and threshold-independent performance.",
                  },
                  {
                    id: "c",
                    label: "ROC-AUC alone",
                    description: "ROC-AUC is relatively robust to imbalance and measures discrimination ability, but doesn't tell you precision/recall at your operating threshold. Pair it with threshold-specific metrics.",
                  },
                  {
                    id: "d",
                    label: "F1 score only",
                    description: "F1 is better than accuracy for imbalanced classes, but alone doesn't show whether errors lean toward false positives or false negatives — which is operationally crucial for fraud detection.",
                  },
                ],
                branches: {
                  a: "e1_choice_threshold",
                  b: "e1_choice_threshold",
                  c: "e1_choice_threshold",
                  d: "e1_choice_threshold",
                },
                rationale: "For imbalanced datasets: (1) never rely on accuracy alone; (2) use precision/recall/F1 on the minority class; (3) augment with ROC-AUC for threshold-independent evaluation; (4) consider AUPRC (area under precision-recall curve) for extremely imbalanced data.",
              },
              e1_choice_threshold: {
                id: "e1_choice_threshold",
                type: "scenario_choice",
                badge: "Stage 3",
                title: "Stage 3 · Classification threshold effects",
                prompt: "You lower the fraud model's classification threshold from 0.5 to 0.2. What happens to precision and recall?",
                code_snippet: `# Original threshold: 0.5
y_pred_05 = (model.predict_proba(X_test)[:, 1] >= 0.5).astype(int)
# prec=0.90, rec=0.30

# Lower threshold: 0.2
y_pred_02 = (model.predict_proba(X_test)[:, 1] >= 0.2).astype(int)
# prec=?, rec=?`,
                choices: [
                  {
                    id: "a",
                    label: "Recall increases, precision decreases — more positives flagged, including more false positives",
                    description: "Correct. A lower threshold flags more transactions as fraud. This catches more actual fraud (recall up) but also flags more legitimate transactions as fraud (precision down). There is an inherent precision-recall tradeoff controlled by the threshold.",
                  },
                  {
                    id: "b",
                    label: "Both precision and recall increase — a more sensitive model is better on both metrics",
                    description: "Increasing recall by lowering the threshold necessarily admits more false positives, which decreases precision. You cannot simultaneously increase both by threshold adjustment alone.",
                  },
                  {
                    id: "c",
                    label: "Precision increases, recall decreases — more conservative at lower threshold",
                    description: "This is backwards. A lower threshold means more liberal positive predictions — more flags, higher recall, lower precision.",
                  },
                  {
                    id: "d",
                    label: "Neither changes — threshold only affects the output labels, not the underlying probabilities",
                    description: "The threshold directly determines which predicted probabilities become positive labels, which changes TP, FP, FN counts and therefore precision and recall.",
                  },
                ],
                branches: {
                  a: "e1_choice_fbeta",
                  b: "e1_recovery_threshold",
                  c: "e1_recovery_threshold",
                  d: "e1_recovery_threshold",
                },
                rationale: "The classification threshold is a business decision, not a model parameter. Lower threshold → more positive predictions → higher recall, lower precision. Higher threshold → fewer positive predictions → higher precision, lower recall. The optimal threshold depends on the relative cost of false positives vs false negatives in your domain.",
              },
              e1_recovery_threshold: {
                id: "e1_recovery_threshold",
                type: "scenario_choice",
                badge: "Recovery 2",
                title: "Recovery · Threshold and precision-recall tradeoff",
                prompt: "A medical screening model. Missing a cancer case (false negative) is far more costly than a false alarm (false positive). How should you set the threshold?",
                code_snippet: `# Cost matrix:
# False Negative (missed cancer): very high cost
# False Positive (unnecessary follow-up): low cost

y_proba = model.predict_proba(X_test)[:, 1]
# threshold = ?`,
                choices: [
                  {
                    id: "a",
                    label: "Lower the threshold — prioritise recall to minimise missed cancers, accepting more false alarms",
                    description: "Correct. When false negatives are very costly, you prioritise recall. A lower threshold flags more positives, catching more true cancers at the cost of more false alarms (unnecessary but low-cost follow-ups).",
                  },
                  {
                    id: "b",
                    label: "Raise the threshold — maximise precision so every flagged case is definitely cancer",
                    description: "Raising the threshold increases precision but decreases recall — you'd miss more real cancers. In this cost structure that is the more dangerous error.",
                  },
                  {
                    id: "c",
                    label: "Use the default threshold of 0.5 — it balances both errors equally",
                    description: "The default threshold of 0.5 is arbitrary and appropriate only when false positives and false negatives have equal cost. When costs are asymmetric, the threshold must reflect that asymmetry.",
                  },
                  {
                    id: "d",
                    label: "Use F1 score to find the optimal threshold automatically",
                    description: "F1 gives equal weight to precision and recall, which doesn't match the asymmetric cost structure here. Use F-beta with beta > 1, or directly optimise recall above a minimum precision constraint.",
                  },
                ],
                branches: {
                  a: "e1_choice_fbeta",
                  b: "e1_choice_fbeta",
                  c: "e1_choice_fbeta",
                  d: "e1_choice_fbeta",
                },
                rationale: "Threshold selection is a business decision driven by the cost ratio of false negatives to false positives. High FN cost → low threshold (prioritise recall). High FP cost → high threshold (prioritise precision). Use cost-sensitive thresholding or F-beta with beta tuned to the cost ratio.",
              },
              e1_choice_fbeta: {
                id: "e1_choice_fbeta",
                type: "scenario_choice",
                badge: "Stage 4",
                title: "Stage 4 · F1 vs F-beta",
                prompt: "When would you use F2 score instead of F1 score to evaluate a model?",
                code_snippet: `from sklearn.metrics import fbeta_score

f1 = fbeta_score(y_test, y_pred, beta=1)  # equal weight
f2 = fbeta_score(y_test, y_pred, beta=2)  # recall weighted 2x

# F-beta formula:
# F_beta = (1 + beta²) * (precision * recall)
#          / (beta² * precision + recall)`,
                choices: [
                  {
                    id: "a",
                    label: "When recall is twice as important as precision — e.g., medical screening where missing a case is costlier than a false alarm",
                    description: "Correct. F-beta weights recall beta² times more than precision. F2 (beta=2) weights recall 4x more than precision — appropriate when false negatives are significantly more costly than false positives, such as disease screening or safety-critical defect detection.",
                  },
                  {
                    id: "b",
                    label: "When you want a higher numeric score to impress stakeholders",
                    description: "Choosing a metric because it produces a higher number, rather than because it reflects business priorities, is metric gaming and produces misleading evaluations.",
                  },
                  {
                    id: "c",
                    label: "When precision is more important than recall",
                    description: "When precision matters more, use F-beta with beta < 1 (e.g., F0.5). F2 with beta=2 weights recall more heavily than precision.",
                  },
                  {
                    id: "d",
                    label: "F2 and F1 are identical — the beta parameter has no effect",
                    description: "Beta controls the relative weight of recall vs precision. F1 (beta=1) weights them equally; F2 (beta=2) weights recall 4x more than precision in the harmonic mean formula.",
                  },
                ],
                branches: {
                  a: "e1_terminal",
                  b: "e1_recovery_fbeta",
                  c: "e1_recovery_fbeta",
                  d: "e1_recovery_fbeta",
                },
                rationale: "F-beta = (1+β²) × (P×R) / (β²×P + R). β=1: equal weight (F1). β=2: recall weighted 4x more than precision (F2). β=0.5: precision weighted 4x more (F0.5). Choose beta based on the cost ratio of false negatives to false positives in your domain.",
              },
              e1_recovery_fbeta: {
                id: "e1_recovery_fbeta",
                type: "scenario_choice",
                badge: "Recovery 3",
                title: "Recovery · F-score variants",
                prompt: "A spam filter. Sending a legitimate email to spam (false positive) is annoying but tolerable. Missing spam (false negative) is mildly bad. Which F-score is most appropriate?",
                code_snippet: `# spam = positive class
# FP: legitimate email → spam folder (annoying)
# FN: spam email → inbox (mildly bad, similar cost to FP)

# beta = ? in fbeta_score(y_test, y_pred, beta=?)`,
                choices: [
                  {
                    id: "a",
                    label: "F1 (beta=1) — costs are roughly symmetric; equal weight to precision and recall",
                    description: "Correct. When false positives (legit email marked spam) and false negatives (spam in inbox) have roughly similar business cost, F1 with equal weighting is appropriate.",
                  },
                  {
                    id: "b",
                    label: "F2 (beta=2) — recall is more important so F2 is always better for spam",
                    description: "F2 would deprioritise precision, accepting more legitimate emails in spam. That's only appropriate if false negatives are significantly costlier than false positives, which isn't the case described here.",
                  },
                  {
                    id: "c",
                    label: "F0.5 (beta=0.5) — precision is critical for spam filters",
                    description: "F0.5 would prioritise precision (fewer false alarms) at the cost of recall. This is appropriate when FP cost far exceeds FN cost — but the scenario describes roughly equal costs.",
                  },
                  {
                    id: "d",
                    label: "Accuracy — spam datasets are balanced so accuracy works fine",
                    description: "Spam datasets are typically imbalanced (most email is legitimate), so accuracy alone is misleading.",
                  },
                ],
                branches: {
                  a: "e1_terminal",
                  b: "e1_terminal",
                  c: "e1_terminal",
                  d: "e1_terminal",
                },
                rationale: "F-score selection maps directly to the cost asymmetry: symmetric costs → F1; recall more important → F2 or higher beta; precision more important → F0.5 or lower beta. Always justify your metric choice with the business cost of each error type.",
              },
              e1_terminal: {
                id: "e1_terminal",
                type: "scenario_choice",
                badge: "Final",
                title: "Revision complete · Classification Metrics Mastery",
                terminal: true,
                prompt: "Design an evaluation framework for a spam filter. What metrics, what threshold, and how do you A/B test it?",
                code_snippet: `# Spam filter: email client, 100M emails/day
# Business constraints:
# - < 0.1% legitimate emails going to spam (FP rate)
# - Catch > 95% of spam (recall)
# - A/B test window: 2 weeks`,
                choices: [
                  {
                    id: "a",
                    label: "Use precision-recall curve to find threshold meeting both constraints; primary metric = recall at precision ≥ 99.9%; A/B test by routing 5% traffic to new model and comparing metrics on labelled sample",
                    description: "Correct. The business constraints (< 0.1% FP on legitimate email = precision ≥ 99.9%; recall > 95%) define threshold selection from the precision-recall curve. A/B testing routes a small traffic fraction to the challenger model, collects labels via user reports + manual review, and uses statistical significance tests on precision and recall differences.",
                  },
                  {
                    id: "b",
                    label: "Optimise for overall accuracy; A/B test by giving 50% of users the new model for one day",
                    description: "Accuracy ignores the class imbalance and the asymmetric cost structure. One day is insufficient for statistical significance on rare-event metrics like false positives in a 99.9% precision regime.",
                  },
                  {
                    id: "c",
                    label: "Report F1 score; no A/B test needed if offline evaluation looks good",
                    description: "F1 equally weights precision and recall, which doesn't match the asymmetric constraint (precision ≥ 99.9% is a hard floor). Offline evaluation alone is insufficient — distribution shift between historical data and live traffic makes A/B testing essential.",
                  },
                ],
                branches: {
                  a: "e1_terminal",
                  b: "e1_terminal",
                  c: "e1_terminal",
                },
                rationale: "Evaluation framework for a high-precision requirement: (1) primary metric = recall subject to precision ≥ constraint; (2) plot precision-recall curve to select operating threshold; (3) A/B test on live traffic with a small hold-out fraction; (4) collect labels via user feedback + sampled manual review; (5) use two-proportion z-test or bootstrapped confidence intervals to determine if differences are significant. Run for at least 1-2 weeks to capture daily/weekly traffic patterns.",
              },
            },
          },
    knowledgeCheck: [
      {
        question: "A model on a 1%-fraud dataset reports 99% accuracy. What is the most likely explanation a senior engineer suspects first?",
        options: [
          "The model is excellent and ready to ship",
          "The model may be predicting 'not fraud' for almost everything, so recall on fraud could be near zero",
          "Accuracy of 99% guarantees high precision and recall",
        ],
        correctIndex: 1,
        explanation: "With a 99% negative base rate, predicting the majority class trivially yields 99% accuracy while catching no positives. Always inspect recall/precision on the minority class.",
      },
      {
        question: "You raise the decision threshold from 0.5 to 0.8. What typically happens to precision and recall?",
        options: [
          "Precision tends to rise, recall tends to fall",
          "Both precision and recall rise together",
          "Recall rises, precision falls",
        ],
        correctIndex: 0,
        explanation: "A higher threshold demands more confidence, producing fewer positive predictions: TP and FP both drop, usually lifting precision while recall declines.",
      },
      {
        question: "Why is F1 defined as the harmonic mean rather than the arithmetic mean of precision and recall?",
        options: [
          "Harmonic means are faster to compute",
          "It rewards models that are good at precision even if recall is near zero",
          "It collapses toward the worse of the two, refusing to reward a model that sacrifices one metric entirely",
        ],
        correctIndex: 2,
        explanation: "Precision 1.0 with recall 0.01 has arithmetic mean ~0.5 but harmonic mean ~0.02. F1 punishes lopsided trade-offs.",
      },
      {
        question: "For a cancer-screening model where a missed diagnosis can be fatal but a false alarm only triggers a follow-up scan, which metric should you primarily optimize?",
        options: [
          "Recall (sensitivity)",
          "Precision",
          "Raw accuracy",
        ],
        correctIndex: 0,
        explanation: "Missing a true positive (FN) is the catastrophic error, so you maximize recall, accepting more false alarms (lower precision).",
      },
      {
        question: "An engineer selects the decision threshold that maximizes F1 on the test set and reports that F1. What is wrong?",
        options: [
          "Nothing; the test set is the right place to tune the threshold",
          "Choosing the threshold on test leaks information, so the reported F1 is optimistically biased",
          "F1 should never be used for binary classification",
        ],
        correctIndex: 1,
        explanation: "Threshold selection is a fitting decision. Do it on validation, freeze it, then measure on test. Tuning on test inflates the reported number.",
      },
      {
        question: "Which metric completely ignores the true-negative count?",
        options: [
          "Accuracy",
          "Specificity",
          "Precision, recall, and F1",
        ],
        correctIndex: 2,
        explanation: "Precision, recall, and F1 are built only from TP, FP, and FN. Ignoring TN is intentional so the metric isn't inflated by a large, easy negative class.",
      },
      {
        question: "In a 50-class problem with several rare classes, which averaging scheme best surfaces poor performance on the rare classes?",
        options: [
          "Micro-averaging",
          "Macro-averaging",
          "Weighted-averaging",
        ],
        correctIndex: 1,
        explanation: "Macro gives every class equal weight regardless of support, so a tanking rare class drags the score down. Micro and weighted are dominated by frequent classes.",
      },
      {
        question: "A miss costs roughly 10× a false alarm. F1 weights precision and recall equally. What is a better objective?",
        options: [
          "Plain accuracy, since it accounts for all four cells",
          "F-beta with β > 1 (or an explicit cost matrix) to weight recall more heavily",
          "Precision alone, to minimize false alarms",
        ],
        correctIndex: 1,
        explanation: "Asymmetric costs call for F-beta (β > 1 favors recall) or a cost-sensitive decision rule, not the symmetric F1.",
      },
    ],
  },

  "ml-e2": {
    durationLabel: "18–20 min",
    outcomes: [
      "Define the **ROC curve** as the locus of (FPR, TPR) over all thresholds, and read **AUC** as the probability a random positive outranks a random negative.",
      "Explain *why* **ROC is threshold-free and prevalence-invariant**, and what that buys you over a single confusion matrix.",
      "Decide between **ROC-AUC and PR-AUC** based on class balance and which error you actually care about.",
      "Avoid the senior traps: **trusting AUC under heavy imbalance**, **comparing AUCs without confidence intervals**, and **confusing ranking quality with calibration**.",
    ],
    learnMarkdown: `## What the ROC curve actually plots

A classifier that emits scores defines a confusion matrix *per threshold*. The **ROC curve** plots one point per threshold:

- **x-axis: FPR** = FP / (FP + TN) — the fraction of negatives you falsely flag.
- **y-axis: TPR** (recall) = TP / (TP + FN) — the fraction of positives you catch.

Sweep the threshold from +∞ down to −∞ and you trace a monotone curve from (0,0) — predict nothing positive — to (1,1) — predict everything positive. The **diagonal** is random guessing: any classifier whose ROC sits on the diagonal ranks positives and negatives indistinguishably. Curves bowing toward the **top-left** are better; the ideal classifier hits (0,1).

The crucial property: the ROC depends only on **how the model ranks** examples, not on where you put the threshold. It summarizes the *entire family* of classifiers at once. That is why it is the standard tool for comparing models before you have committed to an operating point.

## AUC: one number with a clean probabilistic meaning

**AUC** (area under the ROC) collapses the curve to a scalar in [0, 1]:

- 0.5 = random ranking; 1.0 = perfect ranking; below 0.5 = worse than random (flip your scores).
- The interpretation that wins interviews: **AUC is the probability that a randomly chosen positive is scored higher than a randomly chosen negative.** It is exactly the Mann–Whitney U statistic / the normalized rank-sum. This is why AUC is called a measure of *ranking* or *discrimination* quality.

Because it integrates over all thresholds, AUC answers "is the *ranking* any good?" without committing to a threshold — useful early, when you do not yet know your operating constraints.

## The property that makes ROC powerful — and dangerous

TPR and FPR are each computed **within a single class** (TPR over positives, FPR over negatives). Changing the *ratio* of positives to negatives does not change either rate, so the **ROC curve is invariant to class prevalence**. That is genuinely useful: an ROC measured on a balanced sample transfers to a different base rate.

But invariance to prevalence is exactly what makes ROC-AUC **misleading under heavy imbalance**. FPR has the huge negative count (TN) in its denominator, so even thousands of false positives barely move FPR when negatives number in the millions. A model can look excellent on ROC (AUC 0.97) while its *precision* at any usable threshold is abysmal — because the analyst reviewing alerts experiences FP / (TP + FP), not FP / negatives.

## ROC vs Precision–Recall: pick by what the consumer feels

| Question | ROC curve | PR curve |
|---|---|---|
| Axes | FPR vs TPR | Recall vs Precision |
| Sees the negative class size? | Yes (via FPR denominator) | **No** — precision ignores TN |
| Behavior under heavy imbalance | Optimistic, can hide poor precision | **Honest** — precision tanks visibly |
| Baseline (random) | Diagonal, AUC 0.5 | Horizontal line at the **positive prevalence** |
| Best when | Classes ~balanced, both errors matter | Positives rare, you care about the flagged set |
| Probabilistic reading | P(pos ranked above neg) | Area = average precision (AP) |

Rule of thumb: **if the positive class is rare and you act on the positive predictions (fraud, disease, retrieval), report PR-AUC / average precision.** ROC-AUC is the right summary when classes are roughly balanced or when you genuinely care about performance on *both* classes symmetrically. Note the PR baseline *moves with prevalence* — a PR-AUC of 0.4 is excellent at 1% prevalence and terrible at 50%, so always state the base rate.

## AUC does not measure calibration

A model can have AUC 0.95 and be **badly miscalibrated** — its "0.9" probabilities might empirically mean 0.6. AUC only cares about the *order* of scores, not their numeric value, because thresholds slide freely. If you need probabilities to mean what they say (expected-value decisions, pricing, blending models), measure calibration separately (reliability diagram, Brier score, log loss) and calibrate (Platt / isotonic). Conflating "high AUC" with "trustworthy probabilities" is a classic senior-level error.

## Partial AUC: only the region you operate in

Global AUC integrates over *every* false-positive rate from 0 to 1 — but you may only ever deploy at, say, FPR < 5% (because beyond that the alert volume is unmanageable). A model can win on global AUC by being excellent in the high-FPR region you will never use, while losing in the low-FPR region you actually care about. **Partial AUC** restricts the integral to the operating region, giving a comparison aligned with reality. Whenever a stakeholder names a constraint like "we can tolerate at most X false alarms per day," translate it to an FPR (or precision) band and compare models *there*, not globally. This is the kind of nuance that separates "I computed AUC" from "I chose the metric that matches the decision."

## ROC and PR are two views of the same confusion matrices

A useful unifying idea: both curves are generated from the *same* sequence of confusion matrices as the threshold sweeps — they just plot different ratios of the four cells. ROC plots (FPR, TPR); PR plots (recall, precision). Because recall *equals* TPR, the two curves share an axis; they differ only in whether the other axis uses the negative count (FPR, prevalence-invariant) or not (precision, prevalence-sensitive). There is even a theorem (Davis & Goadrich) that a curve dominates in ROC space if and only if it dominates in PR space — so the *ranking* of models is consistent, but the *visual emphasis* and the *summary scalar* differ, and that difference is exactly what makes PR the honest choice under imbalance.

## Comparing two AUCs responsibly

AUC is an estimate from a finite test set; it has variance. "Model A's AUC is 0.91 vs B's 0.90, ship A" is unjustified without a **confidence interval** or a paired test (DeLong's test for correlated ROC curves, or bootstrap). On small or imbalanced test sets the CI can be wide enough to swamp a 0.01 gap. Senior reviewers ask for the interval, not just the point estimate.

## Building the ROC by hand (and why it is a step function)

On a finite test set the ROC is not smooth — it is a **staircase**. Sort all examples by score, descending, and walk down the list lowering the threshold past each one. Every time you cross a **positive**, TPR jumps up by 1/P (a vertical step). Every time you cross a **negative**, FPR jumps right by 1/N (a horizontal step). Ties (equal scores) produce a **diagonal** segment, since you cross positives and negatives simultaneously. The AUC is literally the area under that staircase, and it equals the fraction of all (positive, negative) pairs the model ranks in the correct order — which is exactly the probabilistic definition again, now derived geometrically. Being able to sketch this staircase live is a strong signal in an interview because it shows you understand the curve as a *consequence of ranking*, not a black-box library output.

## Average precision: the honest scalar for PR

Just as AUC summarizes the ROC, **average precision (AP)** summarizes the PR curve. AP is the precision averaged over the recall levels at which it changes — equivalently, a weighted mean of precisions where the weight is the increase in recall. scikit-learn's \`average_precision_score\` computes this and is preferred over the trapezoidal "PR-AUC" because the PR curve's sawtooth shape makes naive interpolation optimistic. When you say "PR-AUC" in a senior setting, be ready to clarify you mean AP, and to note that AP's baseline is the positive prevalence (so AP must always be read against the base rate).

## Threshold-free vs operating-point thinking

ROC/AUC and PR/AP are **threshold-free** summaries: they describe the model across *all* operating points and are the right tool for **model comparison and selection**. But you cannot deploy a curve — production runs at **one** threshold. So the workflow is two-phase: use AUC/AP to choose the *model*, then use the PR (or cost) curve to choose the *threshold* for that model. Confusing these phases — e.g., picking a model by AUC and then being surprised that its default-0.5 precision is poor — is the most common practical misuse of these metrics.

## Pitfalls

- **Quoting ROC-AUC on a 0.1%-positive problem.** It will look great and tell you nothing about the precision your reviewers experience. Use PR-AUC.
- **Treating AUC as accuracy.** AUC says nothing about any single operating point; you still must pick a threshold for deployment.
- **Comparing AUCs across different test sets.** Different prevalence/difficulty makes the numbers incomparable; ROC's prevalence-invariance is per-curve, not across datasets of different hardness.
- **Assuming high AUC ⇒ calibrated.** Ranking ≠ probability. Calibrate if you make value-based decisions.
- **Ignoring the convex-hull / partial-AUC region you actually operate in.** If you only ever run at FPR < 0.05, global AUC can reward behavior you will never use; consider partial AUC.

## Interview questions

- "What does AUC mean, in one sentence?" — Probability a random positive outranks a random negative.
- "Your AUC is 0.97 but the on-call team says alerts are mostly garbage. Reconcile that." — Heavy imbalance: FPR is tiny because negatives are huge, but precision = TP/(TP+FP) is low. Switch to PR-AUC and tune the threshold for precision.
- "When do you prefer PR over ROC?" — Rare positives and you act on the positive set.
- "Is a model with AUC 0.92 well calibrated?" — Unknown; AUC is rank-only. Check a reliability curve / Brier score.
- "A is 0.91, B is 0.90 — pick one." — Demand a confidence interval or DeLong test before claiming a difference.`,
    video: null,
    videoFallbackMarkdown: `## Deep dive without video

Take a tiny scored test set and build the ROC by hand. Sort 5 examples by score descending with labels [P, P, N, P, N]. Start at (0,0); walk down the sorted list, stepping **up** by 1/P for each positive and **right** by 1/N for each negative (here P=3, N=2). You will trace the staircase (0,0)→(0,⅓)→(0,⅔)→(½,⅔)→(½,1)→(1,1). The area under that staircase *is* the AUC; verify it equals the fraction of (positive, negative) pairs the model ranks correctly. Now imagine duplicating the two negatives 1000× each: the ROC is **unchanged** (prevalence-invariant), but precision at any threshold collapses — which is exactly why you would switch to a PR curve for that imbalanced version.`,
    tryGuidance: `Open the **ROC Curve** visualization and drag the threshold along the curve. Watch the green operating point slide from (1,1) at a low threshold toward (0,0) at a high one, and confirm the AUC number stays fixed — it summarizes the whole curve, not your current threshold. Then mentally picture the same data with 100× more negatives: the ROC would barely move, but precision would crater. That gap is the case for PR curves.`,
    interviewGraph: {
            initialStageId: "e2_click_auc_only",
            artifactDimensions: [
              {
                label: "AUC Interpretation",
                recoveryStageId: "e2_recovery_auc",
              },
              {
                label: "Operating Point Selection",
                recoveryStageId: "e2_recovery_operating",
              },
              {
                label: "ROC vs PR Curve",
                recoveryStageId: "e2_recovery_pr",
                passLabel: "ROC & AUC Mastery",
              },
            ],
            stages: {
              e2_click_auc_only: {
                id: "e2_click_auc_only",
                type: "click_target",
                badge: "Stage 1",
                title: "Stage 1 · AUC as sole decision criterion",
                prompt: "The code below selects the production model based solely on AUC, ignoring the business constraint that only operates at very low false positive rate. Click the line that draws the wrong conclusion.",
                code_snippet: `from sklearn.metrics import roc_auc_score, roc_curve

auc_a = roc_auc_score(y_test, model_a.predict_proba(X_test)[:, 1])
auc_b = roc_auc_score(y_test, model_b.predict_proba(X_test)[:, 1])

# auc_a = 0.91, auc_b = 0.87
# At FPR=0.02 (business operating point):
#   model_a TPR = 0.58,  model_b TPR = 0.74

deploy_model = "A" if auc_a > auc_b else "B"  # ds-target:auc_only_decision
print(f"Deploying model {deploy_model} — higher AUC wins")`,
                validationCopy: {
                  auc_only_decision: "Correct. AUC is a global metric that integrates performance over all thresholds. At the specific business operating point (FPR=0.02), Model B has a TPR of 0.74 vs Model A's 0.58 — meaning Model B catches 27% more true positives where it actually matters. Selecting purely on AUC ignores the operationally relevant region of the ROC curve.",
                },
                branches: {
                  auc_only_decision: "e2_choice_auc_meaning",
                },
              },
              e2_choice_auc_meaning: {
                id: "e2_choice_auc_meaning",
                type: "scenario_choice",
                badge: "Stage 2",
                title: "Stage 2 · Interpreting AUC = 0.5",
                prompt: "Your binary classifier's ROC-AUC is 0.5. What does this mean?",
                code_snippet: `from sklearn.metrics import roc_auc_score
import numpy as np

auc = roc_auc_score(y_test, y_pred_proba)
print(f"AUC: {auc:.3f}")  # 0.500`,
                choices: [
                  {
                    id: "a",
                    label: "Model performs no better than random — its ROC curve lies along the diagonal",
                    description: "Correct. AUC=0.5 means the model has zero discriminative ability — equivalent to randomly assigning probability scores. The ROC curve traces the diagonal from (0,0) to (1,1). A useful model should have AUC > 0.5.",
                  },
                  {
                    id: "b",
                    label: "Model is correct 50% of the time",
                    description: "AUC is not accuracy. AUC=0.5 means the model's predicted probabilities have no ordering relationship with the true labels — not that it predicts the right class 50% of the time.",
                  },
                  {
                    id: "c",
                    label: "Model needs more training data to improve beyond 0.5",
                    description: "AUC=0.5 can occur regardless of data size — it means the features or model architecture provide no discriminative information. More data won't help if the features are uninformative.",
                  },
                  {
                    id: "d",
                    label: "AUC=0.5 is an excellent result — perfect precision-recall balance",
                    description: "AUC=0.5 represents the worst useful outcome — equivalent to random chance. A perfect model has AUC=1.0.",
                  },
                ],
                branches: {
                  a: "e2_choice_operating_point",
                  b: "e2_recovery_auc",
                  c: "e2_recovery_auc",
                  d: "e2_recovery_auc",
                },
                rationale: "AUC is the probability that a randomly chosen positive example is ranked higher than a randomly chosen negative example. AUC=0.5 → random ranking. AUC=1.0 → perfect ranking. AUC < 0.5 → worse than random (predictions are systematically inverted — flip them!). Typical useful models: AUC 0.7–0.9 depending on domain difficulty.",
              },
              e2_recovery_auc: {
                id: "e2_recovery_auc",
                type: "scenario_choice",
                badge: "Recovery 1",
                title: "Recovery · AUC geometric meaning",
                prompt: "Which statement correctly describes the geometric meaning of AUC?",
                code_snippet: `# ROC curve: TPR on y-axis, FPR on x-axis
# Each point = (FPR, TPR) at a different threshold
# AUC = area under this curve
#
# Random model:    AUC = 0.5  (diagonal line, area = 0.5)
# Perfect model:   AUC = 1.0  (step to top-left corner)
# Inverted model:  AUC < 0.5  (below diagonal)`,
                choices: [
                  {
                    id: "a",
                    label: "AUC is the probability that the model ranks a random positive example higher than a random negative example",
                    description: "Correct. This is the exact probabilistic interpretation of AUC: P(score(positive) > score(negative)) when randomly sampling one positive and one negative. It is threshold-independent.",
                  },
                  {
                    id: "b",
                    label: "AUC is the average accuracy across all classification thresholds",
                    description: "AUC integrates TPR over FPR, not accuracy. Accuracy requires a threshold; AUC is threshold-free.",
                  },
                  {
                    id: "c",
                    label: "AUC is the percentage of positive examples correctly classified",
                    description: "That description is recall (sensitivity) at a specific threshold. AUC is a global, threshold-independent ranking metric.",
                  },
                  {
                    id: "d",
                    label: "AUC is the F1 score averaged over all thresholds",
                    description: "F1 is a threshold-specific metric. AUC is not related to F1 — it is computed from TPR and FPR, not precision.",
                  },
                ],
                branches: {
                  a: "e2_choice_operating_point",
                  b: "e2_choice_operating_point",
                  c: "e2_choice_operating_point",
                  d: "e2_choice_operating_point",
                },
                rationale: "The Wilcoxon-Mann-Whitney interpretation of AUC: for randomly drawn pairs (positive, negative), AUC = P(model scores the positive higher). This makes AUC interpretable, threshold-independent, and robust to class imbalance.",
              },
              e2_choice_operating_point: {
                id: "e2_choice_operating_point",
                type: "scenario_choice",
                badge: "Stage 3",
                title: "Stage 3 · Model selection at the operating point",
                prompt: "Model A has AUC=0.82. Model B has AUC=0.79. At your business operating threshold (FPR=0.05), Model B has TPR=0.81 while Model A has TPR=0.69. Which do you deploy?",
                code_snippet: `fpr_a, tpr_a, _ = roc_curve(y_test, proba_a)
fpr_b, tpr_b, _ = roc_curve(y_test, proba_b)

# At FPR ≈ 0.05:
#   Model A TPR = 0.69   (AUC = 0.82 globally)
#   Model B TPR = 0.81   (AUC = 0.79 globally)

# Which model goes to production?`,
                choices: [
                  {
                    id: "a",
                    label: "Model B — AUC is global; what matters is the TPR at your specific operating FPR",
                    description: "Correct. AUC summarises performance across ALL thresholds equally. Your business only operates at FPR=0.05. At that point, Model B catches 12% more true positives. The global AUC comparison is irrelevant to the actual deployment scenario.",
                  },
                  {
                    id: "b",
                    label: "Model A — always choose the higher AUC model",
                    description: "Higher AUC means better average performance globally, but if you only ever operate at one specific threshold, the local TPR/FPR at that point is what determines real-world performance.",
                  },
                  {
                    id: "c",
                    label: "Neither — a difference of 0.03 AUC is not statistically significant",
                    description: "Statistical significance of AUC difference is a separate question from operating-point performance. At FPR=0.05, Model B's advantage is 12 percentage points in TPR — operationally substantial regardless of global AUC significance.",
                  },
                  {
                    id: "d",
                    label: "Average the two models' probabilities to get the best of both",
                    description: "Ensembling might be valid in some cases, but it doesn't address the question of which single model to deploy when one clearly outperforms at the specific operating point.",
                  },
                ],
                branches: {
                  a: "e2_choice_imbalance",
                  b: "e2_recovery_operating",
                  c: "e2_recovery_operating",
                  d: "e2_recovery_operating",
                },
                rationale: "AUC is an aggregate statistic. If your system always operates at a specific precision or FPR constraint, evaluate models at that exact operating point on the ROC or precision-recall curve. Don't let a global metric override the local metric that determines actual business performance.",
              },
              e2_recovery_operating: {
                id: "e2_recovery_operating",
                type: "scenario_choice",
                badge: "Recovery 2",
                title: "Recovery · Finding the operating threshold from ROC",
                prompt: "You need to operate at exactly TPR=0.90 (catch 90% of positives). How do you find the corresponding threshold from an ROC curve?",
                code_snippet: `fpr, tpr, thresholds = roc_curve(y_test, y_pred_proba)

# How do you find the threshold for TPR = 0.90?`,
                choices: [
                  {
                    id: "a",
                    label: "Find the index where TPR first meets or exceeds 0.90 in the tpr array, then use thresholds[that index]",
                    description: "Correct. sklearn's roc_curve returns sorted (fpr, tpr, thresholds) arrays. Find the first index where tpr >= 0.90, then read off the corresponding threshold value. This is the minimum threshold that achieves the target recall.",
                  },
                  {
                    id: "b",
                    label: "Use threshold = 1 - 0.90 = 0.10 directly",
                    description: "The threshold value is not simply 1 - TPR. The mapping from threshold to TPR depends on the model's score distribution — there's no arithmetic shortcut.",
                  },
                  {
                    id: "c",
                    label: "Set threshold = 0.90 since TPR and threshold are on the same scale",
                    description: "Threshold values are model output scores (usually between 0 and 1) and have no direct arithmetic relationship to TPR values. The relationship is data-dependent.",
                  },
                  {
                    id: "d",
                    label: "ROC curves don't contain threshold information — you must use trial and error",
                    description: "sklearn's roc_curve returns the thresholds array alongside fpr and tpr, making it straightforward to find the threshold for any target TPR or FPR.",
                  },
                ],
                branches: {
                  a: "e2_choice_imbalance",
                  b: "e2_choice_imbalance",
                  c: "e2_choice_imbalance",
                  d: "e2_choice_imbalance",
                },
                rationale: "The roc_curve function returns three arrays of the same length: fpr, tpr, and thresholds. To find the threshold for a target recall: idx = np.searchsorted(tpr, target_tpr); threshold = thresholds[idx]. To find the threshold for a target FPR, sort by FPR and find the corresponding threshold.",
              },
              e2_choice_imbalance: {
                id: "e2_choice_imbalance",
                type: "scenario_choice",
                badge: "Stage 4",
                title: "Stage 4 · ROC-AUC vs PR-AUC for imbalanced data",
                prompt: "Your dataset has 99% negative class. AUC = 0.95. A colleague says to use PR-AUC instead. Are they right?",
                code_snippet: `from sklearn.metrics import roc_auc_score, average_precision_score

roc_auc = roc_auc_score(y_test, y_proba)          # 0.95
pr_auc  = average_precision_score(y_test, y_proba) # 0.31

# Which metric should be the primary evaluation criterion?`,
                choices: [
                  {
                    id: "a",
                    label: "Both are valuable — but PR-AUC is often more informative for highly imbalanced datasets because it focuses on the minority class",
                    description: "Correct. ROC-AUC counts true negatives (which are abundant in imbalanced data), making it relatively easy to achieve high AUC even with mediocre minority-class recall. PR-AUC focuses only on precision and recall for the positive class — a model with PR-AUC=0.31 on a 1% positive-class dataset is not very useful despite AUC=0.95.",
                  },
                  {
                    id: "b",
                    label: "ROC-AUC=0.95 proves the model is excellent — PR-AUC is unnecessary",
                    description: "ROC-AUC can be inflated by a model that correctly classifies the majority of negatives while doing poorly on the rare positives. For 1% prevalence, PR-AUC tells a more honest story.",
                  },
                  {
                    id: "c",
                    label: "PR-AUC is always better than ROC-AUC regardless of class balance",
                    description: "For balanced datasets, ROC-AUC is perfectly informative. PR-AUC becomes distinctly preferable in highly imbalanced settings where the minority class is what matters.",
                  },
                  {
                    id: "d",
                    label: "Neither is valid — use accuracy for all binary classification problems",
                    description: "Accuracy is the least appropriate metric for imbalanced data. Both AUC variants are far more informative.",
                  },
                ],
                branches: {
                  a: "e2_terminal",
                  b: "e2_recovery_pr",
                  c: "e2_recovery_pr",
                  d: "e2_recovery_pr",
                },
                rationale: "ROC-AUC: measures how well the model separates ALL examples; relatively robust to imbalance but can be overly optimistic when TN >> TP. PR-AUC (average precision): focuses purely on how well the model identifies positive examples — more pessimistic and more informative when positive class is rare. A model can have AUC=0.95 and PR-AUC=0.20, meaning it looks good globally but rarely finds the rare class precisely.",
              },
              e2_recovery_pr: {
                id: "e2_recovery_pr",
                type: "scenario_choice",
                badge: "Recovery 3",
                title: "Recovery · PR curve construction",
                prompt: "Which axis pair defines a precision-recall curve?",
                code_snippet: `from sklearn.metrics import precision_recall_curve

precision, recall, thresholds = precision_recall_curve(
    y_test, y_pred_proba
)
# Plot: x-axis = ?, y-axis = ?`,
                choices: [
                  {
                    id: "a",
                    label: "x-axis = Recall (TPR), y-axis = Precision; threshold decreases left to right",
                    description: "Correct. The PR curve plots precision (y) against recall (x) as the threshold varies. Moving left to right on the x-axis corresponds to lowering the threshold (more positive predictions → higher recall, lower precision). The ideal point is (1.0, 1.0) — top right.",
                  },
                  {
                    id: "b",
                    label: "x-axis = FPR, y-axis = TPR; this is the same as the ROC curve",
                    description: "That is the ROC curve, not the PR curve. The PR curve replaces FPR with Precision on the y-axis.",
                  },
                  {
                    id: "c",
                    label: "x-axis = Threshold, y-axis = F1 score",
                    description: "This is a threshold-vs-F1 plot, which is useful but not the PR curve.",
                  },
                  {
                    id: "d",
                    label: "x-axis = Precision, y-axis = Recall; the curve goes from (0,1) to (1,0)",
                    description: "The axes are swapped. Recall is conventionally on the x-axis, precision on the y-axis. The curve runs from high-threshold (high precision, low recall) to low-threshold (low precision, high recall).",
                  },
                ],
                branches: {
                  a: "e2_terminal",
                  b: "e2_terminal",
                  c: "e2_terminal",
                  d: "e2_terminal",
                },
                rationale: "PR curve: x-axis = recall, y-axis = precision. Baseline = positive class prevalence (a random classifier has PR-AUC ≈ prevalence). ROC curve: x-axis = FPR, y-axis = TPR. Baseline = diagonal (AUC=0.5). Both sweep over all possible thresholds.",
              },
              e2_terminal: {
                id: "e2_terminal",
                type: "scenario_choice",
                badge: "Final",
                title: "Revision complete · ROC & AUC Mastery",
                terminal: true,
                prompt: "Walk through constructing an ROC curve from scratch and explain when PR-AUC is a better choice than ROC-AUC.",
                code_snippet: `# Binary classifier, test set: 1,000 samples (950 neg, 50 pos)
# Model outputs: predicted probabilities in [0, 1]
# Steps to construct ROC curve from scratch?`,
                choices: [
                  {
                    id: "a",
                    label: "Sort by predicted probability descending; sweep threshold from 1→0, computing (FPR, TPR) at each unique probability value; plot these pairs; AUC = area under curve. Prefer PR-AUC when positive class is rare (<5%) because ROC-AUC is inflated by easy TN classification",
                    description: "Correct. ROC construction: (1) sort examples by score descending; (2) for each unique score as threshold, compute TPR = TP/(TP+FN), FPR = FP/(FP+TN); (3) plot (FPR, TPR); (4) integrate. For 5% positive prevalence (like this 50/1000 dataset), ROC-AUC may look artificially high because the model easily classifies the 95% negatives. PR-AUC focuses on how well the model identifies the rare positives.",
                  },
                  {
                    id: "b",
                    label: "ROC and PR curves are constructed the same way — just with different axis labels",
                    description: "They both sweep thresholds, but the metrics plotted are different: ROC uses FPR and TPR; PR curve uses Recall and Precision. Precision depends on the predicted positive count (TP+FP), not on TN — this is the key difference in imbalanced settings.",
                  },
                  {
                    id: "c",
                    label: "ROC-AUC is always the right choice — PR-AUC is only for research papers",
                    description: "PR-AUC is widely used in industry for imbalanced problems (fraud, medical diagnosis, anomaly detection). The choice between them is a practical decision based on class imbalance and business goals.",
                  },
                ],
                branches: {
                  a: "e2_terminal",
                  b: "e2_terminal",
                  c: "e2_terminal",
                },
                rationale: "ROC curve construction: sort predicted probabilities descending → sweep threshold → at each value compute TPR and FPR → plot → compute AUC via trapezoidal rule. When to use PR-AUC: imbalanced datasets (positive prevalence < ~10%) where TN volume inflates ROC-AUC. The baseline for PR-AUC is the positive prevalence (e.g., 0.05 for 5% prevalence), making it harder to look good — and more honest.",
              },
            },
          },
    knowledgeCheck: [
      {
        question: "What does an AUC of 0.85 mean, precisely?",
        options: [
          "There is an 85% chance a randomly chosen positive is scored higher than a randomly chosen negative",
          "The model is correct on 85% of test examples",
          "The model's predicted probabilities are accurate to within 15%",
        ],
        correctIndex: 0,
        explanation: "AUC equals the probability that a random positive outranks a random negative (the Mann–Whitney U interpretation). It is a ranking measure, not accuracy or calibration.",
      },
      {
        question: "Why can ROC-AUC look excellent on a 0.1%-positive dataset even when the model is operationally poor?",
        options: [
          "ROC-AUC is computed incorrectly on imbalanced data",
          "FPR has the huge negative count in its denominator, so many false positives barely move FPR while precision stays low",
          "AUC always equals 1.0 on imbalanced data",
        ],
        correctIndex: 1,
        explanation: "With millions of negatives, even thousands of FPs keep FPR tiny, so the ROC stays bowed toward the corner. Precision = TP/(TP+FP), which the model can fail badly — hence prefer PR-AUC.",
      },
      {
        question: "What is the baseline (random-classifier) line for a precision–recall curve?",
        options: [
          "The diagonal from (0,0) to (1,1)",
          "A horizontal line at precision = the positive class prevalence",
          "A vertical line at recall = 0.5",
        ],
        correctIndex: 1,
        explanation: "A random classifier's precision equals the base rate of positives, so the PR baseline is horizontal at that prevalence. This is why PR-AUC must be read relative to prevalence.",
      },
      {
        question: "You must choose between ROC and PR curves for a rare-disease screen where you act on positive predictions. Which is more informative?",
        options: [
          "ROC, because it is prevalence-invariant",
          "PR, because precision reflects the experience of acting on the flagged positives",
          "Neither; use accuracy",
        ],
        correctIndex: 1,
        explanation: "When positives are rare and you act on the positive set, precision (and thus the PR curve) reflects what users actually feel; ROC's prevalence-invariance hides poor precision.",
      },
      {
        question: "A model has AUC 0.95. What can you conclude about its predicted probabilities?",
        options: [
          "They are well calibrated, since AUC is high",
          "Nothing about calibration; AUC measures only the ordering of scores",
          "They are exactly correct for the positive class",
        ],
        correctIndex: 1,
        explanation: "AUC depends only on rank order. A model can rank perfectly yet be badly miscalibrated. Check a reliability diagram or Brier score for calibration.",
      },
      {
        question: "Model A's test AUC is 0.91 and Model B's is 0.90. What is the responsible next step before declaring A better?",
        options: [
          "Ship A immediately; 0.91 > 0.90",
          "Estimate a confidence interval or run a paired test (e.g., DeLong) since AUC has sampling variance",
          "Retrain both until one reaches 0.95",
        ],
        correctIndex: 1,
        explanation: "AUC is an estimate with variance. On small or imbalanced test sets a 0.01 gap may not be significant; quantify uncertainty before choosing.",
      },
      {
        question: "What does the diagonal line on an ROC plot represent?",
        options: [
          "A classifier whose ranking is no better than random (AUC = 0.5)",
          "A perfect classifier",
          "The decision threshold of 0.5",
        ],
        correctIndex: 0,
        explanation: "Points on the diagonal have TPR = FPR, meaning positives and negatives are ranked indistinguishably — random performance, AUC 0.5.",
      },
      {
        question: "Why is the ROC curve described as invariant to class prevalence?",
        options: [
          "Because AUC is always 0.5",
          "Because TPR and FPR are each computed within one class, so changing the positive:negative ratio doesn't change either rate",
          "Because the curve is recomputed for each base rate",
        ],
        correctIndex: 1,
        explanation: "TPR is over positives only, FPR over negatives only. Resampling the class ratio leaves both rates unchanged — which is useful but also why ROC hides imbalance problems that PR exposes.",
      },
    ],
  },

  "ml-e3": {
    durationLabel: "18–20 min",
    outcomes: [
      "Contrast **grid, random, and Bayesian** search by how each spends a fixed evaluation budget, and know when each wins.",
      "Use **cross-validation** correctly inside tuning, and explain why a single split inflates your reported score.",
      "Explain **nested CV** and *why* an inner loop for tuning plus an outer loop for estimation is the only honest way to report tuned performance.",
      "Spot **tuning leakage**: preprocessing fit on all data, tuning on the test set, and over-tuning to a small validation fold.",
    ],
    learnMarkdown: `## The problem: you are searching, and search can lie to you

Hyperparameters (regularization strength, tree depth, learning rate, number of neighbors) are knobs you set *before* training. You do not learn them by gradient descent on the training loss — you **search** for them by training many models and scoring each on held-out data. The catch: the more configurations you try, the more chances you give some configuration to look good **by luck** on your validation data. Tuning is itself a fitting process, and like any fitting process it overfits if you are not disciplined. Everything below is about searching efficiently *and* reporting honestly.

## Three search strategies

**Grid search** enumerates the Cartesian product of discrete value lists. Exhaustive, reproducible, embarrassingly parallel — but it suffers the **curse of dimensionality**: 5 values across 5 hyperparameters is 3,125 fits, and most of them vary parameters that barely matter. Worse, grid search wastes its budget on the dimensions that don't matter while under-sampling the ones that do.

**Random search** samples configurations from distributions (uniform, log-uniform for scale parameters like learning rate). Bergstra & Bengio's key result: random search **finds good configurations faster than grid** in practice, because real objectives usually depend strongly on only a few hyperparameters. Random search effectively gives you more *distinct* values of the important parameter for the same budget, since it never wastes trials repeating the same important-axis value while sweeping an irrelevant one. Default to random search over grid for >2–3 hyperparameters.

**Bayesian optimization** (e.g., Gaussian-process or TPE-based, as in Optuna/Hyperopt) builds a *surrogate model* of "config → validation score" and uses an **acquisition function** (expected improvement) to pick the next config that best balances **exploration** (uncertain regions) and **exploitation** (near the current best). It converges in **fewer evaluations**, which matters when each fit is expensive (deep nets, large data). Costs: it is sequential (harder to parallelize than random), adds its own meta-hyperparameters, and can get stuck if the surrogate is misled by noise.

| Method | Budget use | Parallelism | Best when |
|---|---|---|---|
| Grid | Wasteful in high-dim | Trivially parallel | ≤2–3 params, each truly discrete |
| Random | Efficient, scales | Trivially parallel | Many params, cheap-ish fits, strong default |
| Bayesian | Most sample-efficient | Sequential (or batched) | Each fit is expensive; budget is small |

A common production pattern: **random search to map the landscape, then Bayesian (or a narrowed random search) to refine** around the promising region. Also consider **Hyperband / successive halving**, which allocate budget by early-stopping bad configs — orthogonal to the search strategy and a big win when partial training is informative.

## Cross-validation: why one split lies

Scoring each candidate on a single validation split makes your choice hostage to *that split's* noise; you will pick the config that happened to suit it. **k-fold CV** averages the score over k held-out folds, giving a lower-variance estimate and using all data for both training and validation across folds. Use **stratified** k-fold for classification so each fold preserves class proportions (critical under imbalance), and a **time-series split** (no future data in training folds) for temporal data, where ordinary k-fold leaks the future.

## Nested CV: the honest way to report tuned performance

Here is the subtle, senior-level point. If you tune on CV and then **report that same CV score**, the number is **optimistically biased** — you selected the config *because* it scored well on those folds, so the score reflects luck plus skill. The fix is **nested cross-validation**:

- **Inner loop:** CV over candidate hyperparameters → selects the best config (this is model *selection*).
- **Outer loop:** CV that wraps the entire inner procedure → estimates generalization of "the whole tuning pipeline" (this is performance *estimation*).

Because the outer test fold is never seen during inner-loop selection, the outer score is unbiased for "how well does my tuning process generalize." Use nested CV when you must *report* a tuned model's expected performance (papers, model cards, go/no-go decisions). It is expensive (k_outer × k_inner × n_configs fits); for large data a single held-out test set after CV-tuning is a cheaper, acceptable substitute — provided you touch that test set **once**.

## Leakage: the failure that survives all the above

You can do grid/random/Bayesian + nested CV perfectly and still ship a lie if **preprocessing leaks**:

- **Fit scalers / imputers / encoders / feature selection on the full dataset before splitting.** The training folds now "know" statistics from the validation/test folds (the mean, the top-k features). Always fit preprocessing **inside** the CV loop on training folds only — use a scikit-learn \`Pipeline\` so CV refits every step per fold.
- **Target leakage:** a feature that encodes the label or is only available *after* the prediction time (e.g., "account_closed_date" predicting churn). No CV scheme catches this — only domain reasoning does.
- **Tuning on the test set:** picking the threshold/config that maximizes the *test* metric. The test set is now part of training; report a fresh untouched set.
- **Group leakage:** the same patient/user in both train and validation folds inflates scores. Use **GroupKFold** so a group never spans the split.

## A concrete CV-leakage walkthrough

Make the leakage failure vivid. Suppose you select the top 50 features by correlation with the target on the **full** dataset, *then* run 5-fold CV on those 50 features. Every fold's "training" data was used to pick the features, so each fold's model already benefits from having seen its own validation rows during selection. CV scores soar; production tanks. The fix is mechanical: the feature-selection step must live **inside** a \`Pipeline\` so that within each fold it re-runs using only that fold's training portion. The same applies to scaling, imputation, target encoding, and dimensionality reduction. The mental rule: *anything that learns from data is a model step and must be refit per fold* — and that includes the steps you don't think of as "the model."

## Successive halving and Hyperband

Beyond the three core strategies, modern tuning often uses **successive halving**: start many configurations on a small budget (few epochs / a data subset), keep the top fraction, give survivors more budget, repeat. **Hyperband** wraps successive halving in an outer loop that hedges across different "how aggressively to prune" settings. These are *orthogonal* to grid/random/Bayesian — you choose *which* configs to try (search strategy) and *how much budget* to give each (halving). They shine when partial training is predictive of final performance (deep nets, gradient boosting with many trees) and can deliver 5–30× speedups. The senior framing: search strategy and budget allocation are two separate axes, and the best systems tune both.

## Reproducibility and the seed trap

A subtle credibility issue: random search, Bayesian search, and CV folds all depend on random seeds. Report results across **multiple seeds** (or fixed, documented seeds) — a single lucky seed can manufacture a 0.01 "improvement" that evaporates on re-run. Likewise, a Bayesian search that converges to a great config under one seed may not under another; treat the tuning procedure itself as a stochastic estimator with variance, not a deterministic oracle.

## Search-budget discipline

- **Use log-uniform ranges** for scale parameters (learning rate, C, regularization), uniform for naturally linear ones. Sampling learning rate uniformly in [0.0001, 0.1] wastes ~99% of trials above 0.001.
- **Set a budget up front** (n trials or wall-clock) and a clear objective metric on a fixed CV scheme; do not chase a moving target.
- **Beware variance from tiny validation folds:** a 0.002 metric improvement on a 200-row fold is noise. Prefer repeated CV or larger folds before believing small gains.

## Interview questions

- "Grid vs random — which and why?" — Random for >2–3 hyperparameters: most objectives depend on a few params, so random gives more distinct values of the ones that matter for the same budget.
- "Why nested CV?" — Inner loop selects, outer loop estimates; reusing the selection CV score for reporting is optimistically biased.
- "Where does leakage sneak into a tuning pipeline?" — Preprocessing fit on all data, group overlap across folds, tuning on test, target leakage. Wrap everything in a Pipeline and fit per fold.
- "When is Bayesian optimization worth its complexity?" — When each fit is expensive and the evaluation budget is small, so sample-efficiency dominates parallelism.
- "Your tuned CV score is 0.94 but production is 0.86 — what happened?" — Likely optimistic tuning bias and/or leakage; you reported the selection score, not an out-of-fold estimate.`,
    video: null,
    videoFallbackMarkdown: `## Deep dive without video

Sketch a 2-D hyperparameter space where the objective depends almost entirely on the x-axis (say learning rate) and barely on the y-axis. Plot a 5×5 **grid**: you get only **5 distinct x-values** despite 25 fits — the y-sweep is wasted. Now plot **25 random** points: you get ~25 distinct x-values, so you sample the dimension that matters 5× more finely for the same cost. That single picture is the entire grid-vs-random argument. Then layer the honesty point: write "inner CV picks the config; outer CV (never seen during picking) tells me how the *process* generalizes." If you only have one loop, the score you report is the score you optimized — biased upward.`,
    tryGuidance: `If a search-visualization is available, sweep the number of trials for grid vs random on a landscape with one dominant parameter and watch random reach a good score with fewer evaluations. Otherwise, reason it on paper: for a fixed budget of N fits across D hyperparameters where only one matters, count how many distinct values of the important parameter grid vs random gives you. Then add a CV loop and articulate why the score you *select on* cannot be the score you *report*.`,
    interviewGraph: {
            initialStageId: "e3_click_leakage",
            artifactDimensions: [
              {
                label: "Hyperparameter Leakage",
                recoveryStageId: "e3_recovery_leakage",
              },
              {
                label: "Search Strategy",
                recoveryStageId: "e3_recovery_search",
              },
              {
                label: "Nested CV & Overfitting",
                recoveryStageId: "e3_recovery_nested",
                passLabel: "Hyperparameter Tuning Mastery",
              },
            ],
            stages: {
              e3_click_leakage: {
                id: "e3_click_leakage",
                type: "click_target",
                badge: "Stage 1",
                title: "Stage 1 · Hyperparameter selection leakage",
                prompt: "The code below uses GridSearchCV on the full dataset and then reports best_score_ as the model's expected test performance. Click the line that leaks test data into hyperparameter selection.",
                code_snippet: `from sklearn.model_selection import GridSearchCV
from sklearn.ensemble import GradientBoostingClassifier

param_grid = {
    "n_estimators": [100, 200, 500],
    "max_depth":    [3, 5, 7],
    "learning_rate": [0.01, 0.1, 0.3],
}

gs = GridSearchCV(GradientBoostingClassifier(),
                  param_grid, cv=5, scoring="roc_auc")
gs.fit(X, y)   # ds-target:full_data_fit

print(f"Expected AUC: {gs.best_score_:.3f}")
model = gs.best_estimator_`,
                validationCopy: {
                  full_data_fit: "Correct. GridSearchCV is fitted on the entire dataset X (including what should be the held-out test set). The best_score_ reflects cross-validation performance on all available data — but there is no truly independent test set to estimate generalisation. The reported AUC will be optimistically biased because hyperparameter selection was driven by all available data.",
                },
                branches: {
                  full_data_fit: "e3_choice_random_vs_grid",
                },
              },
              e3_choice_random_vs_grid: {
                id: "e3_choice_random_vs_grid",
                type: "scenario_choice",
                badge: "Stage 2",
                title: "Stage 2 · Random search vs grid search",
                prompt: "Random search and grid search explore the same hyperparameter space with the same number of trials. Why is random search often more efficient?",
                code_snippet: `# Grid search: 3 × 3 × 3 = 27 fixed combinations
grid_search = GridSearchCV(model, {
    "n_estimators": [100, 200, 300],
    "max_depth":    [3, 5, 7],
    "learning_rate": [0.01, 0.1, 1.0],
}, cv=5)

# Random search: 27 random samples from distributions
random_search = RandomizedSearchCV(model, {
    "n_estimators": randint(50, 500),
    "max_depth":    randint(2, 10),
    "learning_rate": loguniform(0.001, 1.0),
}, n_iter=27, cv=5)`,
                choices: [
                  {
                    id: "a",
                    label: "Random search samples hyperparameter distributions broadly — not all dimensions matter equally, so random samples find good regions faster",
                    description: "Correct. Research (Bergstra & Bengio 2012) shows that in high-dimensional hyperparameter spaces, only a few dimensions significantly affect performance. Grid search wastes trials on unimportant dimensions with fixed values. Random search samples each dimension independently, giving more unique values per important dimension across the same trial budget.",
                  },
                  {
                    id: "b",
                    label: "Random search trains each model faster because it uses fewer data points",
                    description: "Random search and grid search evaluate each model on the same data. Speed comes from sampling fewer hyperparameter combinations, not from using less data.",
                  },
                  {
                    id: "c",
                    label: "Grid search is always more thorough — random search might miss the optimal combination",
                    description: "Grid search is only more thorough on its chosen discrete grid. With continuous distributions, random search can discover values between grid points that grid search never tests.",
                  },
                  {
                    id: "d",
                    label: "They are equivalent — random is just a shuffled grid",
                    description: "Random search samples from continuous distributions, covering the full hyperparameter space more densely for important dimensions. Grid search is restricted to the predefined discrete values.",
                  },
                ],
                branches: {
                  a: "e3_choice_test_contamination",
                  b: "e3_recovery_search",
                  c: "e3_recovery_search",
                  d: "e3_recovery_search",
                },
                rationale: "The key insight: grid search marginalises over the full grid for every hyperparameter. If n_estimators has three values but doesn't matter much, all three are equally explored while learning_rate (which matters a lot) only gets 3 distinct values. Random search assigns unique values to important dimensions across all trials, giving more coverage where it counts.",
              },
              e3_recovery_search: {
                id: "e3_recovery_search",
                type: "scenario_choice",
                badge: "Recovery 1",
                title: "Recovery · Choosing a search strategy",
                prompt: "Each training run takes 4 hours. You have a budget of 20 runs. Which hyperparameter search strategy is most appropriate?",
                code_snippet: `# Budget: 20 trials × 4 hours = 80 GPU-hours
# Hyperparameters: learning_rate, batch_size,
#                  dropout, weight_decay, architecture depth
# Constraint: cannot afford to waste any trial`,
                choices: [
                  {
                    id: "a",
                    label: "Bayesian optimization — models the objective surface and directs trials toward promising regions",
                    description: "Correct. When each trial is very expensive and the budget is small, Bayesian optimization (e.g., Optuna, Hyperopt) uses the history of evaluated trials to model the objective function and select the next hyperparameter configuration most likely to improve performance. It outperforms random search when trial cost is high.",
                  },
                  {
                    id: "b",
                    label: "Grid search over all 5 hyperparameters at 2 values each",
                    description: "2⁵ = 32 combinations exceeds the 20-trial budget. Even within budget, grid search wastes trials on unimportant dimensions.",
                  },
                  {
                    id: "c",
                    label: "Random search — it's the standard approach for all budgets",
                    description: "Random search is efficient but not adaptive. With only 20 trials and expensive evaluations, Bayesian optimization's ability to learn from previous trials and focus on promising regions gives it a significant advantage.",
                  },
                  {
                    id: "d",
                    label: "Manual search based on intuition — hyperparameter tuning tools are too complex",
                    description: "Manual search is the least reproducible and typically worse than even random search with similar trial count. Modern tools like Optuna are straightforward to use.",
                  },
                ],
                branches: {
                  a: "e3_choice_test_contamination",
                  b: "e3_choice_test_contamination",
                  c: "e3_choice_test_contamination",
                  d: "e3_choice_test_contamination",
                },
                rationale: "Search strategy selection by trial cost: cheap trials (seconds) → grid or random search. Moderate cost (minutes) → random search. Expensive trials (hours) → Bayesian optimization. Very expensive (days) → Bayesian + early stopping (e.g., Hyperband/ASHA). Bayesian optimization's benefit grows with trial cost.",
              },
              e3_choice_test_contamination: {
                id: "e3_choice_test_contamination",
                type: "scenario_choice",
                badge: "Stage 3",
                title: "Stage 3 · Test set contamination during tuning",
                prompt: "You run 100-trial random search, select the best hyperparameters, then evaluate on the held-out test set. Is the test score reliable?",
                code_snippet: `# Workflow:
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42)

rs = RandomizedSearchCV(model, param_dist,
                        n_iter=100, cv=5,
                        scoring="roc_auc")
rs.fit(X_train, y_train)  # tuned entirely on X_train

final_model = rs.best_estimator_
test_auc = roc_auc_score(y_test,
               final_model.predict_proba(X_test)[:, 1])
print(f"Test AUC: {test_auc:.3f}")`,
                choices: [
                  {
                    id: "a",
                    label: "Yes — the test set was never touched during tuning; it gives an unbiased generalisation estimate",
                    description: "Correct. The entire hyperparameter search (including all 100 trials and their cross-validation) was conducted on X_train only. The test set was held out until the very final evaluation. This is the correct procedure — the test score is an unbiased estimate of generalisation performance.",
                  },
                  {
                    id: "b",
                    label: "No — running 100 trials inflates the test score through multiple comparisons",
                    description: "The 100 trials only compared models on cross-validation folds of X_train. The test set was never involved in any trial. Multiplicity affects the cross-validation score (optimistic bias in best_score_), not the independent test score.",
                  },
                  {
                    id: "c",
                    label: "No — GridSearchCV and RandomizedSearchCV always use the test set internally",
                    description: "GridSearchCV/RandomizedSearchCV perform k-fold cross-validation on the data passed to .fit() — which is X_train. They have no access to X_test unless you pass it.",
                  },
                  {
                    id: "d",
                    label: "The workflow is invalid because you should never use train_test_split with cross-validation",
                    description: "Train-test split + cross-validation is the standard evaluation pattern. The outer split creates a held-out test; inner CV is used for hyperparameter selection. This is correct and widely used.",
                  },
                ],
                branches: {
                  a: "e3_choice_bayesian",
                  b: "e3_recovery_leakage",
                  c: "e3_recovery_leakage",
                  d: "e3_recovery_leakage",
                },
                rationale: "The golden rule: touch the test set exactly once. As long as all model development (feature engineering, hyperparameter tuning, architecture search) is done on training data only, the test score is unbiased. The optimistic bias from hyperparameter selection affects the CV best_score_ (not the final test score), which is why nested cross-validation is needed for unbiased CV estimates.",
              },
              e3_recovery_leakage: {
                id: "e3_recovery_leakage",
                type: "scenario_choice",
                badge: "Recovery 2",
                title: "Recovery · Correct hyperparameter tuning pipeline",
                prompt: "Which workflow prevents both hyperparameter selection bias and test set contamination?",
                code_snippet: `# Workflow A:
gs.fit(X, y)  # all data
report(gs.best_score_)

# Workflow B:
X_tr, X_te = split(X)
gs.fit(X_tr, y_tr)  # tune on train
report(eval(gs.best_estimator_, X_te))

# Workflow C:
X_tr, X_te = split(X)
gs.fit(X_tr, y_tr)
report(gs.best_score_)  # CV score as test estimate`,
                choices: [
                  {
                    id: "a",
                    label: "Workflow B — tune on train with CV, evaluate best model on independent held-out test",
                    description: "Correct. Workflow B is the standard pattern: split → tune with CV on train → final evaluation on held-out test. The test score is unbiased. Note: gs.best_score_ (Workflow C) is slightly optimistic because the best is selected from multiple CV runs — use the independent test score instead.",
                  },
                  {
                    id: "b",
                    label: "Workflow A — using all data for CV gives the most reliable estimate",
                    description: "Workflow A has no independent test set — best_score_ is optimistically biased by hyperparameter selection. No unbiased generalisation estimate is possible.",
                  },
                  {
                    id: "c",
                    label: "Workflow C — CV score equals the true test error",
                    description: "The CV best_score_ is from the same data used to select hyperparameters — it is optimistically biased. For an unbiased test estimate, evaluate the best model on a separate held-out test set.",
                  },
                  {
                    id: "d",
                    label: "None — you must use nested cross-validation for any unbiased estimate",
                    description: "Nested CV is the theoretically cleanest approach, but Workflow B (train/val/test split) is a valid and widely used practical alternative that gives an unbiased test score.",
                  },
                ],
                branches: {
                  a: "e3_choice_bayesian",
                  b: "e3_choice_bayesian",
                  c: "e3_choice_bayesian",
                  d: "e3_choice_bayesian",
                },
                rationale: "Workflow B is the standard industry pattern. The bias in best_score_ comes from optimising over multiple hyperparameter configurations — you've 'peeked' at the CV results to pick the best. Using an independent test set that was never involved in any decision removes this bias.",
              },
              e3_choice_bayesian: {
                id: "e3_choice_bayesian",
                type: "scenario_choice",
                badge: "Stage 4",
                title: "Stage 4 · Bayesian optimization over random search",
                prompt: "Bayesian optimization vs random search for hyperparameter tuning. When does Bayesian optimization win most decisively?",
                code_snippet: `# Scenario A: model trains in 2 seconds, budget = 1000 trials
# Scenario B: model trains in 3 hours, budget = 20 trials
# Scenario C: 2 hyperparameters, wide ranges, budget = 50 trials
# Scenario D: 20 hyperparameters, complex dependencies, budget = 100 trials`,
                choices: [
                  {
                    id: "a",
                    label: "Scenario B and D — expensive trials or complex dependency structure where learning from previous trials is most valuable",
                    description: "Correct. Bayesian optimization fits a surrogate model (Gaussian process or TPE) on previous (hyperparameters → score) observations. This pays off when: (1) trials are expensive (B) — each trial's information is precious; (2) the search space is complex with dependencies (D) — random search spreads too thinly. For cheap trials (A), random search's simplicity wins. For few hyperparameters (C), random search is nearly optimal.",
                  },
                  {
                    id: "b",
                    label: "Scenario A — more trials mean Bayesian optimization converges faster",
                    description: "With cheap trials and a large budget, random search can densely sample the space efficiently. Bayesian optimization's sequential acquisition overhead becomes a bottleneck and doesn't outperform parallelised random search.",
                  },
                  {
                    id: "c",
                    label: "Bayesian optimization is never worth the complexity — use random search everywhere",
                    description: "For expensive models (hours/days per trial), Bayesian optimization's sample efficiency provides substantial practical benefits that outweigh its setup complexity.",
                  },
                  {
                    id: "d",
                    label: "Scenario C — Bayesian optimization is specifically designed for 2-hyperparameter problems",
                    description: "Bayesian optimization works across all dimensionalities. For low-dimensional, simple search spaces, random search is competitive and simpler. Bayesian optimization's advantage grows with dimensionality and trial cost.",
                  },
                ],
                branches: {
                  a: "e3_terminal",
                  b: "e3_recovery_nested",
                  c: "e3_recovery_nested",
                  d: "e3_recovery_nested",
                },
                rationale: "Bayesian optimization uses an acquisition function (e.g., expected improvement) guided by a surrogate model to select the next hyperparameter configuration. Its key advantage is sample efficiency — it finds good regions faster than random search when each evaluation is expensive. For cheap evaluations with large budgets, random search often performs comparably with less overhead.",
              },
              e3_recovery_nested: {
                id: "e3_recovery_nested",
                type: "scenario_choice",
                badge: "Recovery 3",
                title: "Recovery · Why nested cross-validation is necessary",
                prompt: "You use 5-fold CV to select the best hyperparameters and report the best CV score as the model's performance estimate. Why is this estimate optimistically biased?",
                code_snippet: `param_grid = {"C": [0.01, 0.1, 1, 10, 100]}
gs = GridSearchCV(LogisticRegression(), param_grid, cv=5)
gs.fit(X_train, y_train)

# Is gs.best_score_ an unbiased performance estimate?
print(f"Best CV score: {gs.best_score_:.3f}")`,
                choices: [
                  {
                    id: "a",
                    label: "Yes — because you selected the best C from 5 candidates using the same CV folds that produced the score",
                    description: "Correct. The selection process (pick C with highest CV score) uses the same fold scores. This is a form of multiple comparisons — with 5 C values and 5 folds, you select the maximum of 5 noisy estimates. The maximum is positively biased relative to a new independent test set.",
                  },
                  {
                    id: "b",
                    label: "No — cross-validation is always unbiased regardless of how the result is used",
                    description: "Cross-validation gives an unbiased estimate of a fixed model's performance. When you SELECT a model based on CV scores, the selected score is optimistically biased — the selection process introduces bias.",
                  },
                  {
                    id: "c",
                    label: "The bias is negligible — 5-fold CV with 5 candidates is fine",
                    description: "The magnitude of bias depends on the variance in CV scores and the number of candidates. With more candidates or noisier data, the bias can be substantial. Nested CV quantifies it empirically.",
                  },
                  {
                    id: "d",
                    label: "Only biased if the dataset is small",
                    description: "Selection bias (choosing the best from multiple options) affects estimates regardless of dataset size. Sample size affects the variance of CV scores, not whether selection introduces bias.",
                  },
                ],
                branches: {
                  a: "e3_terminal",
                  b: "e3_terminal",
                  c: "e3_terminal",
                  d: "e3_terminal",
                },
                rationale: "When you select the best model from cross-validation, the reported score is E[max(CV scores)] — the expected maximum of multiple noisy evaluations. This is always >= the true performance. Nested cross-validation wraps an outer CV loop around the inner CV+selection loop, providing an unbiased performance estimate of the model selection procedure itself.",
              },
              e3_terminal: {
                id: "e3_terminal",
                type: "scenario_choice",
                badge: "Final",
                title: "Revision complete · Hyperparameter Tuning Mastery",
                terminal: true,
                prompt: "Explain nested cross-validation and when it is necessary. Why does regular cross-validation with model selection give optimistic performance estimates?",
                code_snippet: `# Standard (biased) approach:
gs = GridSearchCV(model, param_grid, cv=5)
gs.fit(X_train, y_train)
report(gs.best_score_)  # biased — how biased?

# Nested CV approach:
outer_cv = KFold(n_splits=5)
inner_cv  = KFold(n_splits=3)
nested_scores = cross_val_score(
    GridSearchCV(model, param_grid, cv=inner_cv),
    X_train, y_train, cv=outer_cv
)
report(nested_scores.mean())  # unbiased`,
                choices: [
                  {
                    id: "a",
                    label: "Standard CV best_score_ is biased upward because model selection uses the same folds that produced the score; nested CV wraps an outer loop to score the selection procedure on held-out folds — necessary when reporting generalisation performance in research or high-stakes production decisions",
                    description: "Correct. In nested CV: inner loop = hyperparameter search; outer loop = evaluates the best model from each inner fold on left-out outer fold data. The outer fold was never seen during hyperparameter selection, so the outer-fold scores are unbiased estimates of the full pipeline's generalisation. Necessary when: (1) publishing results; (2) comparing multiple model architectures; (3) small datasets where bias from selection is large.",
                  },
                  {
                    id: "b",
                    label: "Standard CV is unbiased — nested CV is only needed for time-series data",
                    description: "Time-series requires special CV (e.g., TimeSeriesSplit), but nested CV addresses selection bias, which is independent of data type. Standard CV with selection is optimistically biased for all data types.",
                  },
                  {
                    id: "c",
                    label: "Nested CV is the same as standard CV — just with more folds",
                    description: "Nested CV has two nested loops: an outer loop that scores the full model selection procedure on held-out folds, and an inner loop that performs hyperparameter search on the remaining data. It is structurally different from simply increasing the fold count.",
                  },
                ],
                branches: {
                  a: "e3_terminal",
                  b: "e3_terminal",
                  c: "e3_terminal",
                },
                rationale: "Nested CV gives an unbiased estimate of the generalisation performance of a model class (including its hyperparameter selection procedure). When to use: comparing architectures on small datasets, reporting results in papers, auditing a full ML pipeline. When standard train/val/test split suffices: large datasets with a truly held-out test set that is touched only once. The difference in scores between nested and non-nested CV quantifies the selection bias.",
              },
            },
          },
    knowledgeCheck: [
      {
        question: "For tuning 5 hyperparameters on a moderately expensive model, why is random search often preferred over grid search?",
        options: [
          "Random search is guaranteed to find the global optimum",
          "Most objectives depend strongly on only a few hyperparameters, so random gives more distinct values of the important ones per fixed budget",
          "Grid search cannot be parallelized",
        ],
        correctIndex: 1,
        explanation: "Bergstra & Bengio showed random search explores the important dimensions more finely for the same budget, because grid wastes trials sweeping irrelevant axes.",
      },
      {
        question: "What is the purpose of the OUTER loop in nested cross-validation?",
        options: [
          "To produce an unbiased estimate of how the entire tuning procedure generalizes, on folds never seen during selection",
          "To select the best hyperparameters",
          "To speed up training by parallelizing folds",
        ],
        correctIndex: 0,
        explanation: "The inner loop selects hyperparameters; the outer loop estimates generalization on data untouched by selection, removing the optimistic bias of reporting the selection score.",
      },
      {
        question: "When is Bayesian optimization most worth its added complexity over random search?",
        options: [
          "When you have unlimited cheap evaluations and many CPUs",
          "When each model fit is expensive and the evaluation budget is small, so sample-efficiency matters most",
          "Whenever the dataset is imbalanced",
        ],
        correctIndex: 1,
        explanation: "Bayesian search converges in fewer evaluations by modeling the objective, which pays off when fits are costly. With cheap, abundant evaluations, random search's easy parallelism often wins.",
      },
      {
        question: "You fit a StandardScaler on the entire dataset, then run k-fold CV to tune. Why is this a problem?",
        options: [
          "Scaling should never be used with cross-validation",
          "The scaler learned statistics from the validation folds, leaking information and inflating CV scores",
          "It slows down training but is otherwise correct",
        ],
        correctIndex: 1,
        explanation: "Preprocessing must be fit inside the CV loop on training folds only. Fitting on all data leaks validation-fold statistics into training; use a Pipeline so each fold refits.",
      },
      {
        question: "Your tuned CV score is 0.94 but production performance is 0.86. What is the most likely senior-level diagnosis?",
        options: [
          "The production data is simply harder and nothing is wrong",
          "Optimistic tuning bias and/or leakage: you likely reported the selection score or leaked preprocessing/target information",
          "The model needs a larger learning rate",
        ],
        correctIndex: 1,
        explanation: "A large CV-to-production gap points to reporting the score you optimized on (no outer loop) and/or leakage in preprocessing, groups, or the target.",
      },
      {
        question: "For tuning learning rate over the range [0.0001, 0.1], which sampling distribution is appropriate?",
        options: [
          "Uniform, because all values are equally likely to be optimal",
          "Log-uniform, so trials are spread evenly across orders of magnitude",
          "Normal centered at 0.05",
        ],
        correctIndex: 1,
        explanation: "Scale parameters like learning rate should be sampled log-uniformly; uniform sampling would waste ~99% of trials above 0.001.",
      },
      {
        question: "The same patient appears in both a training fold and a validation fold during CV. What should you use?",
        options: [
          "Plain KFold; duplicates are fine",
          "GroupKFold (or a grouped split) so a patient never spans train and validation",
          "Leave-one-out CV",
        ],
        correctIndex: 1,
        explanation: "Group overlap leaks identity-specific signal across the split and inflates scores. GroupKFold keeps each group entirely on one side.",
      },
      {
        question: "Which leakage problem can NO cross-validation scheme detect on its own?",
        options: [
          "A feature only available after prediction time that encodes the target (target leakage)",
          "Fitting a scaler on all folds",
          "Using too few folds",
        ],
        correctIndex: 0,
        explanation: "Target leakage from a post-hoc feature requires domain reasoning to catch; it produces great CV scores precisely because the feature secretly carries the label.",
      },
    ],
  },

  "ml-e4": {
    durationLabel: "18–20 min",
    outcomes: [
      "Diagnose **class imbalance** and explain why accuracy and ROC-AUC mislead, framing evaluation around **precision/recall and PR-AUC** instead.",
      "Choose among **class weights, resampling (SMOTE / random under- and over-sampling), and threshold tuning** by their costs and failure modes.",
      "Apply resampling **correctly inside the CV loop** so synthetic or duplicated rows never leak across folds, and never resample the test set.",
      "Reason about **cost-sensitive thresholds** from a cost matrix rather than chasing a balanced dataset for its own sake.",
    ],
    learnMarkdown: `## Why imbalance breaks the naive workflow

When one class is rare — 1% fraud, 0.1% rare disease, a handful of defective parts per million — the default training and evaluation machinery quietly fails. The loss is dominated by the majority class, so the model learns that **predicting the majority is a great strategy**. Accuracy rewards exactly that. As shown in ml-e1, "always negative" can score 99% accuracy and catch zero positives. And as ml-e2 showed, ROC-AUC stays optimistic because FPR's denominator is huge. The first senior move on any imbalanced problem is therefore **not** a resampling trick — it is **fixing the evaluation frame**: report precision, recall, and **PR-AUC / average precision** at a stated threshold, with the base rate quoted alongside.

## Three families of fixes (and a fourth that often wins)

**1. Class weights / cost-sensitive learning.** Tell the loss that a minority mistake costs more — \`class_weight="balanced"\` in scikit-learn, \`scale_pos_weight\` in XGBoost, or a custom cost matrix. Cheap, leak-free, keeps all real data, and is usually the **first thing to try**. It reshapes the *decision boundary* by re-weighting gradients without inventing or discarding data.

**2. Resampling the training set.**
- **Random oversampling** duplicates minority rows. Simple, but exact duplicates encourage **overfitting** to those specific points.
- **SMOTE** (Synthetic Minority Over-sampling) interpolates *new* minority points between a minority example and its minority neighbors. Reduces duplication-overfit, but can create unrealistic points in feature space, **blur class boundaries** (it interpolates blindly, even across the true boundary), and behaves poorly with categorical or high-dimensional sparse features. Variants (Borderline-SMOTE, ADASYN) focus synthesis near the boundary.
- **Random undersampling** drops majority rows to balance. Fast and great when you have *abundant* majority data, but it **throws away information** and raises variance when data is scarce. Hybrids (SMOTE + Tomek/ENN cleaning) combine synthesis with majority pruning.

**3. Threshold tuning.** Often the highest-leverage and most under-used lever. The model already ranks; you just need to *stop using 0.5*. Pick the operating threshold on a **validation** PR curve to hit the business target (e.g., recall ≥ 0.90 at best precision, or the point that maximizes expected value under your cost matrix). No retraining, no synthetic data, no leakage risk. Frequently a well-ranked model + a tuned threshold beats elaborate resampling.

**4. Get more (or better) minority data / change the problem.** Active learning, targeted labeling, anomaly-detection framing, or two-stage cascades. Sometimes the honest answer is that 50 positives cannot support a reliable classifier and you need more signal.

| Technique | Touches data? | Leakage risk | Main downside | Reach for when |
|---|---|---|---|---|
| Class weights | No | None | May still need threshold tuning | Almost always, first |
| Random oversample | Duplicates minority | Yes if outside CV | Overfits to copies | Small minority, tree models |
| SMOTE | Synthesizes minority | **High** if outside CV | Unrealistic points, blurred boundary | Continuous features, moderate dim |
| Random undersample | Drops majority | Low | Discards data, higher variance | Abundant majority data |
| Threshold tuning | No | None (tune on val) | Needs a decent ranker | Almost always, cheap & strong |

## The cardinal rule: resample INSIDE the CV loop, never the test set

This is where most imbalanced-learning code is wrong. If you SMOTE (or oversample) the **whole** dataset and *then* split into train/validation:

1. Synthetic minority points are interpolated from neighbors that may land in the **validation fold**, so train and validation share information → leakage → wildly optimistic scores.
2. With plain oversampling, exact **duplicates** straddle the split: the model memorizes a row in training and is "tested" on its clone.

Correct procedure: split first, then **resample only the training fold** inside each CV iteration (use \`imblearn.pipeline.Pipeline\`, which applies samplers to training folds only). The **validation and test sets must keep the real, imbalanced distribution** — that is the distribution production will see, and resampling them would measure performance on a fantasy world. Class weights sidestep this entirely (no data is created), which is part of why they are a safe default.

## Cost-sensitive thinking beats "make it balanced"

Balancing the classes is a *means*, not an end. The end is a decision rule that minimizes expected cost. If a false negative costs \`C_FN\` and a false positive costs \`C_FP\`, the expected-value-optimal threshold on a *calibrated* probability is roughly \`t* = C_FP / (C_FP + C_FN)\`. Frame the problem as: estimate good probabilities (calibrate if needed — see ml-e2), then choose the threshold from the cost matrix. This makes the trade explicit and defensible to stakeholders, and often dissolves the urge to resample at all.

## A decision flowchart you can defend

When handed an imbalanced problem, senior engineers tend to walk a predictable path rather than reaching for the fanciest tool:

1. **Fix the metrics first.** Switch to precision/recall, PR-AUC / average precision, and quote the base rate. Stop reporting accuracy and ROC-AUC as headline numbers.
2. **Try class weights.** Leak-free, keeps all data, one parameter. Re-evaluate.
3. **Tune the threshold** on the validation PR curve toward the business target or cost-optimal point. Often steps 2–3 alone are enough.
4. **Only then resample** — and prefer the simplest that works (random under/oversample) before SMOTE; keep resampling strictly inside the CV training folds.
5. **If still failing, get more minority signal** (targeted labeling, anomaly framing, two-stage cascade) or accept that the data cannot support the classifier.

Notice the expensive, leak-prone techniques are *last*, not first. Reaching straight for SMOTE on a problem that a threshold change would have solved is a junior reflex.

## Why a 1:1 resample is rarely optimal

The instinct to oversample to a perfect 50/50 is usually wrong. The resampling ratio is a **hyperparameter** to tune like any other; pushing to 1:1 floods the model with so much synthetic or duplicated minority data that it over-predicts the positive class and precision craters. Empirically the best ratio is often modest (e.g., bringing 1% up to 10–20%), and it should be selected on validation alongside the threshold — not assumed.

## Probabilities lie after resampling

A point worth stating twice because it bites people: both resampling and class weighting change the **prior** the model trains on, so the predicted probabilities no longer reflect the true base rate — a model trained on rebalanced data will output systematically *too-high* probabilities for the minority class. If those probabilities feed an expected-value decision (the cost-matrix threshold above), you must **recalibrate** (Platt/isotonic) against the *real* distribution, or correct the prior analytically. Skipping this turns a principled cost-based threshold into garbage.

## Pitfalls

- **Resampling before the split / resampling the test set.** Leakage and a fantasy evaluation. Resample training folds only; keep eval sets real.
- **Reporting accuracy or ROC-AUC under heavy skew.** Use PR-AUC / average precision and report the base rate.
- **Blind SMOTE on categorical or very high-dim data.** Interpolation produces nonsense; use SMOTE-NC or skip to class weights / threshold tuning.
- **Over-oversampling to 50/50 by reflex.** The "best" minority ratio is a hyperparameter to tune, not automatically 1:1; over-synthesis can hurt precision.
- **Forgetting calibration.** Resampling and class weights distort the predicted probabilities (the model now sees a different prior); recalibrate before using probabilities for cost-based decisions.
- **Chasing balance instead of business value.** The goal is minimum expected cost, reached via threshold + costs — not a balanced confusion matrix.

## Interview questions

- "Your fraud model has 99% accuracy. What do you do?" — Reframe: quote base rate, recall, precision, PR-AUC; accuracy is meaningless here.
- "Walk me through applying SMOTE without leaking." — Split first; SMOTE the training fold only inside CV via an imblearn Pipeline; never touch validation/test.
- "Class weights vs SMOTE vs undersampling — pick one and defend it." — Default to class weights (leak-free, keeps data) plus threshold tuning; reach for SMOTE only with continuous features and when weights underperform; undersample when majority data is abundant.
- "Why keep the test set imbalanced?" — It must reflect the production distribution; a rebalanced test set measures a world that doesn't exist.
- "How do you pick the deployment threshold?" — From the validation PR curve and the cost matrix; the EV-optimal threshold on calibrated probabilities is C_FP/(C_FP+C_FN).`,
    video: null,
    videoFallbackMarkdown: `## Deep dive without video

Take 1,000 rows, 1% positive (10 positives). Mentally run "predict all negative": accuracy 0.99, recall 0.0 — useless, glowing dashboard. Now compare two real fixes. **(a) Class weights:** the loss now treats one missed positive like ~99 missed negatives, bending the boundary toward catching positives, *no synthetic data*. **(b) SMOTE:** you synthesize ~980 fake positives between real ones — but if you did that *before* splitting, a fake positive interpolated from a row now sitting in your validation fold means train and val share information, and your score is a mirage. Write the one rule that prevents it: "split first, resample the training fold only, leave validation and test at the real 1% rate." Finally note: a well-ranked model often needs *no* resampling — just move the threshold off 0.5 using the PR curve and a cost matrix.`,
    tryGuidance: `Open the **Imbalanced Classes** visualization. Crank the imbalance ratio toward extreme skew and watch accuracy stay near the top while recall on the minority class collapses — the accuracy paradox, live. Now drag the decision threshold down and see recall recover at the cost of precision; toggle "rebalance" to feel how class weighting shifts the operating point. The takeaway to narrate: accuracy is the liar, the threshold is the cheap lever, and the confusion matrix never lets you hide.`,
    interviewGraph: {
            initialStageId: "e4_click_smote_leakage",
            artifactDimensions: [
              {
                label: "Resampling Pipeline Correctness",
                recoveryStageId: "e4_recovery_pipeline",
              },
              {
                label: "Oversampling Techniques",
                recoveryStageId: "e4_recovery_techniques",
              },
              {
                label: "Metrics for Imbalanced Data",
                recoveryStageId: "e4_recovery_metrics",
                passLabel: "Imbalanced Classes Mastery",
              },
            ],
            stages: {
              e4_click_smote_leakage: {
                id: "e4_click_smote_leakage",
                type: "click_target",
                badge: "Stage 1",
                title: "Stage 1 · SMOTE leaking into test set",
                prompt: "The code below applies SMOTE before the train/test split. Click the line that causes synthetic minority samples to leak into the test set.",
                code_snippet: `from imblearn.over_sampling import SMOTE
from sklearn.model_selection import train_test_split

X, y = load_fraud_data()
# Class distribution: 99% legitimate (0), 1% fraud (1)

sm = SMOTE(random_state=42)
X_res, y_res = sm.fit_resample(X, y)   # ds-target:smote_before_split

X_train, X_test, y_train, y_test = train_test_split(
    X_res, y_res, test_size=0.2, random_state=42
)

model.fit(X_train, y_train)
print(model.score(X_test, y_test))`,
                validationCopy: {
                  smote_before_split: "Correct. SMOTE is applied to the entire dataset before splitting. The synthetic minority samples are interpolated from the original data — including from points that will end up in the test set. This means the test set contains synthetic samples generated using test-fold neighbours, creating data leakage. SMOTE must be applied only inside the training fold, never before splitting.",
                },
                branches: {
                  smote_before_split: "e4_choice_class_weight",
                },
              },
              e4_choice_class_weight: {
                id: "e4_choice_class_weight",
                type: "scenario_choice",
                badge: "Stage 2",
                title: "Stage 2 · class_weight=balanced mechanics",
                prompt: "You train a classifier with class_weight='balanced' on a dataset with 1% positive class. What does this parameter do?",
                code_snippet: `from sklearn.linear_model import LogisticRegression

model = LogisticRegression(class_weight="balanced")
model.fit(X_train, y_train)

# class distribution: 990 negatives, 10 positives
# balanced weights: negative = ?, positive = ?`,
                choices: [
                  {
                    id: "a",
                    label: "Upweights minority class in the loss function — misclassifying a positive costs ~99× more than misclassifying a negative",
                    description: "Correct. class_weight='balanced' sets weights inversely proportional to class frequencies: weight_i = n_samples / (n_classes × count_i). For 1% positive class: positive weight ≈ 99× negative weight. This penalises minority-class errors more heavily, pushing the model to focus on correctly classifying the rare class.",
                  },
                  {
                    id: "b",
                    label: "Duplicates minority class samples to create a balanced dataset",
                    description: "class_weight modifies the loss function weighting, not the data. Duplication is random oversampling — a different (and often inferior) technique.",
                  },
                  {
                    id: "c",
                    label: "Automatically applies SMOTE to generate synthetic samples",
                    description: "class_weight and SMOTE are separate mechanisms. class_weight adjusts loss weights; SMOTE generates new synthetic data points.",
                  },
                  {
                    id: "d",
                    label: "Normalises feature values so all classes have equal influence",
                    description: "class_weight is about the contribution of each training example to the loss function based on class membership — not about feature normalisation.",
                  },
                ],
                branches: {
                  a: "e4_choice_smote_placement",
                  b: "e4_recovery_pipeline",
                  c: "e4_recovery_pipeline",
                  d: "e4_recovery_pipeline",
                },
                rationale: "class_weight='balanced' computes: weight_i = n_samples / (n_classes × n_i). For 1000 samples, 10 positives, 990 negatives: weight_positive = 1000/(2×10) = 50; weight_negative = 1000/(2×990) ≈ 0.5. The ratio 50:0.5 = 100:1 means each positive example counts 100× more in the gradient update. No new data is created — only the loss landscape is modified.",
              },
              e4_recovery_pipeline: {
                id: "e4_recovery_pipeline",
                type: "scenario_choice",
                badge: "Recovery 1",
                title: "Recovery · Correct resampling pipeline",
                prompt: "Which pipeline correctly applies SMOTE during cross-validation without leakage?",
                code_snippet: `# Option A: apply SMOTE before CV
X_res, y_res = SMOTE().fit_resample(X_train, y_train)
cross_val_score(model, X_res, y_res, cv=5)

# Option B: imbalanced-learn Pipeline
from imblearn.pipeline import Pipeline
pipe = Pipeline([("smote", SMOTE()), ("clf", model)])
cross_val_score(pipe, X_train, y_train, cv=5)

# Option C: apply SMOTE only once on full training set
X_res, y_res = SMOTE().fit_resample(X_train, y_train)
model.fit(X_res, y_res)`,
                choices: [
                  {
                    id: "a",
                    label: "Option A — SMOTE before CV with the original training set is clean",
                    description: "Option A still leaks: SMOTE is applied to all of X_train before CV folds are created. Synthetic points are generated using neighbours from validation folds, inflating CV scores.",
                  },
                  {
                    id: "b",
                    label: "Option B — imbalanced-learn Pipeline applies SMOTE inside each CV fold, only on the training portion",
                    description: "Correct. When using imblearn's Pipeline with cross_val_score, the pipeline's .fit() (including SMOTE) is called only on the training folds. The validation fold is passed through without resampling, ensuring no leakage.",
                  },
                  {
                    id: "c",
                    label: "Option C — SMOTE on full training set before final model fit is valid for production",
                    description: "Option C is valid for fitting the production model (no test set leakage if X_train was already separated from X_test). However, it cannot be used for cross-validation without leakage — which is Option B's purpose.",
                  },
                  {
                    id: "d",
                    label: "All options are equivalent — SMOTE doesn't cause leakage",
                    description: "Options A and C with CV do cause leakage. Only Option B (Pipeline inside CV) guarantees SMOTE is applied only to training folds.",
                  },
                ],
                branches: {
                  a: "e4_choice_smote_placement",
                  b: "e4_choice_smote_placement",
                  c: "e4_choice_smote_placement",
                  d: "e4_choice_smote_placement",
                },
                rationale: "The correct pattern: use imblearn.pipeline.Pipeline (not sklearn's) to combine SMOTE with a classifier. When passed to cross_val_score or GridSearchCV, the pipeline ensures SMOTE is re-fitted on each training fold only. This is the only leak-free way to cross-validate with resampling.",
              },
              e4_choice_smote_placement: {
                id: "e4_choice_smote_placement",
                type: "scenario_choice",
                badge: "Stage 3",
                title: "Stage 3 · Where SMOTE must be applied",
                prompt: "SMOTE generates synthetic minority samples. At which stage of a pipeline must it be applied to avoid data leakage?",
                code_snippet: `# Full ML workflow:
# 1. Load data
# 2. Train/test split
# 3. Feature engineering / scaling
# 4. ???  ← where does SMOTE go?
# 5. Model training
# 6. Evaluation on test set

# With cross-validation inside step 5:
# a. SMOTE before outer CV loop
# b. SMOTE before inner CV loop only
# c. SMOTE inside each inner fold (training portion only)`,
                choices: [
                  {
                    id: "a",
                    label: "Inside each training fold only — never on validation or test data",
                    description: "Correct. SMOTE interpolates between existing minority samples. If it sees validation or test points, the synthetic samples are influenced by held-out data — leakage. Apply SMOTE only to the training portion of each fold, after the split is made.",
                  },
                  {
                    id: "b",
                    label: "Before the train/test split — using all data for SMOTE improves synthetic sample quality",
                    description: "This is the pattern shown in Stage 1 — it causes test data to influence synthetic sample generation, leaking information from the test set.",
                  },
                  {
                    id: "c",
                    label: "After the test split but before cross-validation — the test set is already safe",
                    description: "Applying SMOTE to X_train before CV folds are created means validation folds from X_train influence the synthetic sample interpolation — still a form of leakage for CV purposes.",
                  },
                  {
                    id: "d",
                    label: "On the test set only — the test set needs synthetic samples to match training distribution",
                    description: "The test set must never be modified. It represents the real-world distribution the model will encounter — adding synthetic samples would make evaluation invalid.",
                  },
                ],
                branches: {
                  a: "e4_choice_oversample_vs_smote",
                  b: "e4_recovery_techniques",
                  c: "e4_recovery_techniques",
                  d: "e4_recovery_techniques",
                },
                rationale: "Resampling rule: any data augmentation technique (SMOTE, random oversampling, undersampling) must be applied exclusively to training data, after the validation/test split. This ensures the evaluation data reflects the real, unmodified class distribution. Use imblearn.pipeline.Pipeline to enforce this automatically.",
              },
              e4_recovery_techniques: {
                id: "e4_recovery_techniques",
                type: "scenario_choice",
                badge: "Recovery 2",
                title: "Recovery · Oversampling vs undersampling tradeoffs",
                prompt: "When should you prefer undersampling the majority class over oversampling the minority class?",
                code_snippet: `# Dataset: 1,000,000 records — 990,000 neg, 10,000 pos
# Undersampling: reduce negatives to ~10,000
# Oversampling (SMOTE): increase positives to ~990,000

# Option A: oversample to balance (2× minority)
# Option B: undersample to balance (reduce majority)
# Option C: both (combination) — e.g. SMOTEENN`,
                choices: [
                  {
                    id: "a",
                    label: "When the dataset is very large and training time is prohibitive — undersampling dramatically reduces compute while retaining enough majority-class signal",
                    description: "Correct. With 1M rows, oversampling to 50/50 could create ~2M rows. Training time doubles or worse. Undersampling to e.g. 10,000 negatives gives a manageable dataset and often sufficient majority-class coverage when the original majority class is large enough. The key risk: you discard potentially informative majority examples.",
                  },
                  {
                    id: "b",
                    label: "Undersampling is always better than SMOTE because it uses real data",
                    description: "Undersampling discards real data, which can lose informative examples and hurt model performance. SMOTE's synthetic data, while artificial, preserves all real minority samples. Neither is universally superior.",
                  },
                  {
                    id: "c",
                    label: "Never undersample — always oversample because you're removing information",
                    description: "Undersampling is a valid strategy, especially for very large datasets where training time is a constraint and the majority class is over-represented relative to the true signal density.",
                  },
                  {
                    id: "d",
                    label: "Undersample whenever the positive class rate is below 5%",
                    description: "Class imbalance level alone doesn't determine the choice. Training data size, compute budget, and the nature of the majority class all factor into the decision.",
                  },
                ],
                branches: {
                  a: "e4_choice_oversample_vs_smote",
                  b: "e4_choice_oversample_vs_smote",
                  c: "e4_choice_oversample_vs_smote",
                  d: "e4_choice_oversample_vs_smote",
                },
                rationale: "Undersampling: fast training (smaller dataset), may lose informative majority examples. Oversampling: preserves all data, risks overfitting to duplicated/synthetic points, increases training time. Combination methods (SMOTEENN, SMOTETomek) apply both and often outperform either alone. Choose based on dataset size, compute budget, and empirical cross-validation performance.",
              },
              e4_choice_oversample_vs_smote: {
                id: "e4_choice_oversample_vs_smote",
                type: "scenario_choice",
                badge: "Stage 4",
                title: "Stage 4 · Random oversampling vs SMOTE",
                prompt: "Random oversampling duplicates existing minority samples. SMOTE generates new synthetic points. What is the key practical difference?",
                code_snippet: `from imblearn.over_sampling import RandomOverSampler, SMOTE

# Random oversampling: duplicate existing minority samples
ros = RandomOverSampler(random_state=42)
X_ros, y_ros = ros.fit_resample(X_train, y_train)

# SMOTE: interpolate new points between neighbours
sm = SMOTE(k_neighbors=5, random_state=42)
X_sm, y_sm = sm.fit_resample(X_train, y_train)`,
                choices: [
                  {
                    id: "a",
                    label: "Random oversampling can cause overfitting to specific minority examples; SMOTE interpolates between nearest neighbours creating diverse synthetic points that generalise better",
                    description: "Correct. Random oversampling simply repeats existing samples — the model sees identical points many times, which can cause it to memorise those specific samples. SMOTE creates new points along line segments connecting minority class neighbours, introducing variation and reducing the risk of exact overfitting to specific training examples.",
                  },
                  {
                    id: "b",
                    label: "They are equivalent — both produce the same training distribution",
                    description: "Random oversampling preserves exactly the original minority support (same points, more copies). SMOTE creates a convex hull of synthetic points between existing samples — a fundamentally different distribution with more coverage.",
                  },
                  {
                    id: "c",
                    label: "Random oversampling is always better because it uses real data",
                    description: "Using exact duplicates of real data can lead to overfitting those specific points. SMOTE's synthetic interpolation often generalises better, especially when the minority class is small.",
                  },
                  {
                    id: "d",
                    label: "SMOTE can only be used for binary classification",
                    description: "SMOTE works for multi-class problems as well — it generates synthetic samples for each minority class independently.",
                  },
                ],
                branches: {
                  a: "e4_terminal",
                  b: "e4_recovery_metrics",
                  c: "e4_recovery_metrics",
                  d: "e4_recovery_metrics",
                },
                rationale: "Random oversampling: duplicate minority samples → model may overfit to those exact feature vectors. SMOTE: for each minority sample, pick k nearest minority neighbours, select a random one, interpolate a new synthetic point along the connecting vector. This creates a denser, more varied synthetic minority region. Key weakness of SMOTE: it can generate synthetic points in overlap regions with the majority class if k-neighbours cross class boundaries.",
              },
              e4_recovery_metrics: {
                id: "e4_recovery_metrics",
                type: "scenario_choice",
                badge: "Recovery 3",
                title: "Recovery · Right metrics for imbalanced evaluation",
                prompt: "You have a 0.5% positive class dataset. Your model achieves 99.6% accuracy. Which metrics would actually tell you if the model is useful?",
                code_snippet: `from sklearn.metrics import (
    accuracy_score,
    precision_score, recall_score, f1_score,
    average_precision_score, roc_auc_score
)

acc = accuracy_score(y_test, y_pred)        # 0.996
prec = precision_score(y_test, y_pred)      # ?
rec  = recall_score(y_test, y_pred)         # ?
f1   = f1_score(y_test, y_pred)             # ?
auprc = average_precision_score(y_test, proba)  # ?`,
                choices: [
                  {
                    id: "a",
                    label: "Precision, Recall, F1 on positive class + AUPRC — these directly measure minority-class performance without being dominated by the majority class",
                    description: "Correct. With 0.5% positive class, a model that predicts 'negative' for everything gets 99.5% accuracy. Precision/recall/F1 on the positive class and AUPRC are unaffected by the abundance of true negatives and directly measure what matters: how well the model identifies the rare positive cases.",
                  },
                  {
                    id: "b",
                    label: "ROC-AUC only — it is the gold standard for all classification problems",
                    description: "ROC-AUC is robust to imbalance but still inflated by easy TN classification in extreme cases. For 0.5% positive prevalence, AUPRC is more informative because its baseline is the prevalence (0.005) rather than 0.5.",
                  },
                  {
                    id: "c",
                    label: "Balanced accuracy — it averages sensitivity and specificity",
                    description: "Balanced accuracy is better than raw accuracy, but still doesn't show you precision (how reliable positive predictions are) — which is critical for the business decision to act on a positive prediction.",
                  },
                  {
                    id: "d",
                    label: "Accuracy is sufficient — 99.6% proves the model works",
                    description: "A model that always predicts 'negative' achieves 99.5% accuracy on a 0.5% positive-class dataset. 99.6% accuracy is barely better than the trivial baseline and tells you nothing about whether any positives were detected.",
                  },
                ],
                branches: {
                  a: "e4_terminal",
                  b: "e4_terminal",
                  c: "e4_terminal",
                  d: "e4_terminal",
                },
                rationale: "For highly imbalanced datasets (< 5% positive class): (1) never report accuracy alone; (2) precision/recall/F1 on positive class directly measure minority performance; (3) AUPRC provides a threshold-independent view with a meaningful baseline (= prevalence); (4) consider cost-sensitive metrics if FP and FN costs are quantified.",
              },
              e4_terminal: {
                id: "e4_terminal",
                type: "scenario_choice",
                badge: "Final",
                title: "Revision complete · Imbalanced Classes Mastery",
                terminal: true,
                prompt: "Your positive class is 0.1%. A colleague suggests oversampling to 50/50. What are the trade-offs and what metrics would you use to evaluate the final model?",
                code_snippet: `# Original: 1,000,000 rows — 999,000 neg, 1,000 pos (0.1%)
# Option A: oversample minority to 50/50
#   → 999,000 pos (synthetic) + 999,000 neg = 1,998,000 rows
# Option B: undersample to 50/50
#   → 1,000 pos + 1,000 neg = 2,000 rows
# Option C: class_weight='balanced', no resampling
# Option D: mild oversampling, e.g. to 10% minority`,
                choices: [
                  {
                    id: "a",
                    label: "50/50 via oversampling: massive SMOTE computation + risk of overfitting/mode collapse; prefer class_weight or mild oversampling (5-10%); evaluate with AUPRC, Recall@precision_floor, and confusion matrix at business threshold",
                    description: "Correct. Oversampling 0.1% to 50/50 means generating 998× more synthetic samples than real ones — dominated by synthetic data, losing real-data diversity and risking mode collapse. class_weight='balanced' achieves similar loss-function rebalancing with no data inflation. Mild oversampling (to 5-10%) is a reasonable middle ground. Metrics: AUPRC (baseline=0.001, so hard to game), recall at a minimum precision floor, confusion matrix at the operating threshold.",
                  },
                  {
                    id: "b",
                    label: "Always oversample to 50/50 — perfectly balanced classes always produce the best models",
                    description: "There is no empirical support for 50/50 being universally optimal. The optimal ratio depends on the cost asymmetry between FP and FN. Extreme oversampling of a 0.1% class creates massive synthetic datasets that don't represent the real distribution.",
                  },
                  {
                    id: "c",
                    label: "Undersample to 50/50 (2,000 rows) — smaller dataset is faster to train",
                    description: "Undersampling to 2,000 rows discards 999,997 real observations — nearly all your data. While fast, this throws away enormous amounts of real signal from the majority class and will likely produce a poorly calibrated model.",
                  },
                ],
                branches: {
                  a: "e4_terminal",
                  b: "e4_terminal",
                  c: "e4_terminal",
                },
                rationale: "Handling 0.1% positive class in practice: (1) start with class_weight='balanced' — no data manipulation, just loss reweighting; (2) if that's insufficient, try mild oversampling (SMOTE to 1-5%) inside a Pipeline; (3) avoid extreme 50/50 oversampling — it inflates training data with synthetic noise; (4) for evaluation use AUPRC (baseline = 0.001 makes high scores meaningful), precision/recall at business threshold, and calibration plots; (5) always apply resampling inside CV folds using imblearn.pipeline.Pipeline.",
              },
            },
          },
    knowledgeCheck: [
      {
        question: "On a 1%-positive dataset, what is the FIRST thing a senior engineer fixes before reaching for SMOTE?",
        options: [
          "Immediately oversample the minority class to 50/50",
          "The evaluation frame: stop quoting accuracy/ROC-AUC and report precision, recall, and PR-AUC at a stated threshold",
          "Increase the model's learning rate",
        ],
        correctIndex: 1,
        explanation: "Imbalance first breaks measurement. Fixing the metrics (PR-AUC, precision/recall with base rate) is the prerequisite; resampling tricks come after the frame is honest.",
      },
      {
        question: "Why must you resample (SMOTE/oversample) only the training folds and keep the test set imbalanced?",
        options: [
          "Because resampling the test set is computationally expensive",
          "Synthetic/duplicated rows leaking across the split inflates scores, and the test set must reflect the real production distribution",
          "Because the test set must always be balanced to be valid",
        ],
        correctIndex: 1,
        explanation: "Resampling before splitting leaks (interpolated/duplicated points straddle folds). The test set must keep the true imbalanced distribution production will see.",
      },
      {
        question: "What is the main drawback of SMOTE compared to using class weights?",
        options: [
          "It is impossible to parallelize",
          "It synthesizes points by blind interpolation, which can create unrealistic samples and blur the class boundary, and it carries leakage risk if done outside CV",
          "It always reduces recall",
        ],
        correctIndex: 1,
        explanation: "SMOTE interpolates between minority neighbors regardless of the true boundary, risking unrealistic points and boundary blur, plus leakage if applied before splitting. Class weights create no data.",
      },
      {
        question: "Given a false negative cost C_FN and false positive cost C_FP, the expected-value-optimal threshold on a calibrated probability is approximately:",
        options: [
          "t* = C_FP / (C_FP + C_FN)",
          "Always 0.5",
          "t* = C_FN / C_FP, capped at 1",
        ],
        correctIndex: 0,
        explanation: "Minimizing expected cost on calibrated probabilities gives t* = C_FP/(C_FP+C_FN); a costlier FN pushes the threshold down so you predict positive more readily.",
      },
      {
        question: "Why are class weights often the safest first technique for imbalance?",
        options: [
          "They guarantee perfect recall",
          "They create no synthetic or duplicated data, so there is no leakage risk and no information is discarded",
          "They make accuracy a valid metric again",
        ],
        correctIndex: 1,
        explanation: "Reweighting the loss reshapes the boundary using only real data, sidestepping the leakage and overfitting concerns of resampling. They keep all data intact.",
      },
      {
        question: "When is random undersampling a reasonable choice?",
        options: [
          "When the majority class is abundant, so dropping some majority rows costs little information",
          "When the minority class has only a handful of examples",
          "Whenever SMOTE fails to converge",
        ],
        correctIndex: 0,
        explanation: "Undersampling discards majority data, which is fine when that data is plentiful but harmful (high variance) when data is scarce.",
      },
      {
        question: "After applying class weights or resampling, why might you need to recalibrate the model's probabilities?",
        options: [
          "Because the model now trains faster",
          "Because reweighting/resampling changes the class prior the model sees, distorting the predicted probabilities used for cost-based thresholds",
          "Calibration is never needed after resampling",
        ],
        correctIndex: 1,
        explanation: "Both techniques alter the effective base rate during training, so the output probabilities no longer match the true prior. Recalibrate before making expected-value decisions.",
      },
      {
        question: "A well-ranked model scores AUC 0.95 but, at the default 0.5 threshold, recall on the minority class is poor. What is the cheapest effective fix?",
        options: [
          "Retrain with SMOTE on the full dataset",
          "Lower the decision threshold using the validation PR curve, since the ranking is already good",
          "Switch to a more complex model architecture",
        ],
        correctIndex: 1,
        explanation: "Good ranking (high AUC) means the model orders examples well; you simply need a better operating point. Threshold tuning is free, leak-free, and often beats resampling.",
      },
    ],
  },
};
