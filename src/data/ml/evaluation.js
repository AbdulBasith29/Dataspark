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
