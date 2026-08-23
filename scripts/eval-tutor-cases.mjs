/**
 * Hand-labeled ground truth for the tutor evaluator.
 *
 * 30 answers spanning statistics, A/B testing, SQL, ML and product reasoning,
 * written the way learners actually write: partial answers that use the right
 * vocabulary without the reasoning, wrong answers that sound confident, correct
 * answers that are terse. The confident-but-wrong cases are the ones that
 * matter most — an evaluator that rewards fluency will pass them.
 *
 * Label semantics
 *   verdict      what the evaluator must return
 *   scoreRange   inclusive [min, max]; deliberately wide, we test calibration
 *                bands, not exact numbers
 *   rubricMet    ground truth per rubric criterion, in rubric order
 *   requiredGaps concepts the evaluator MUST surface. Each entry is a list of
 *                acceptable phrasings — matching is substring-based on the
 *                lowercased gap text, so it stays deterministic and free
 *   forbiddenGaps concepts it must NOT flag (marking a present idea as missing)
 *   hint         "required" when the answer needs a nudge, "none" when a
 *                complete answer should not be handed busywork
 *   hintMustNotLeak phrases that would hand over the answer outright
 */

export const CASES = [
  // ---------------------------------------------------------------- statistics
  {
    id: "stat-pvalue-correct",
    topic: "Statistics",
    questionPrompt: "What does a p-value of 0.03 tell you about your result?",
    rubric: [
      "Defines p-value as P(data this extreme | null hypothesis true)",
      "Does not invert it into the probability the null is true",
      "Connects it to a significance threshold decision",
    ],
    userAnswer:
      "It means that if the null hypothesis were true, there's a 3% chance of seeing a result at least this extreme just from random variation. It is not the probability that the null is true. Against a 0.05 threshold I'd reject the null, but that's a decision rule, not proof the effect is real or that it matters.",
    expected: {
      verdict: "correct",
      scoreRange: [80, 100],
      rubricMet: [true, true, true],
      requiredGaps: [],
      forbiddenGaps: ["definition", "conditional"],
      hint: "none",
    },
  },
  {
    id: "stat-pvalue-inverted",
    topic: "Statistics",
    questionPrompt: "What does a p-value of 0.03 tell you about your result?",
    rubric: [
      "Defines p-value as P(data this extreme | null hypothesis true)",
      "Does not invert it into the probability the null is true",
      "Connects it to a significance threshold decision",
    ],
    userAnswer:
      "A p-value of 0.03 means there's only a 3% chance the null hypothesis is true, so we're 97% confident our result is real and we can ship it.",
    expected: {
      verdict: "incorrect",
      scoreRange: [0, 35],
      rubricMet: [false, false, false],
      requiredGaps: [["invert", "probability the null", "conditional", "backwards", "misinterpret", "given the null"]],
      forbiddenGaps: [],
      hint: "required",
      hintMustNotLeak: ["p(data", "probability of observing data at least as extreme"],
    },
  },
  {
    id: "stat-type-errors-partial",
    topic: "Statistics",
    questionPrompt: "Explain Type I and Type II errors and how they trade off.",
    rubric: [
      "Type I is a false positive, rejecting a true null",
      "Type II is a false negative, failing to reject a false null",
      "Explains the tradeoff via alpha, power, or sample size",
    ],
    userAnswer:
      "A Type I error is a false positive — you say there's an effect when there isn't. A Type II error is a false negative, you miss a real effect.",
    expected: {
      verdict: "partial",
      scoreRange: [45, 75],
      rubricMet: [true, true, false],
      requiredGaps: [["tradeoff", "trade-off", "alpha", "power", "sample size", "relationship between"]],
      forbiddenGaps: ["false positive", "false negative"],
      hint: "required",
    },
  },
  {
    id: "stat-ci-bayesian-misread",
    topic: "Statistics",
    questionPrompt: "How do you interpret a 95% confidence interval of [2.1, 4.7] for a treatment effect?",
    rubric: [
      "Frames the 95% as a property of the procedure across repeated samples",
      "Avoids claiming 95% probability the true value lies in this interval",
      "Notes the interval excludes zero / what that implies",
    ],
    userAnswer:
      "There's a 95% probability that the true treatment effect is somewhere between 2.1 and 4.7. So we can be 95% sure the real number is in that range.",
    expected: {
      verdict: "incorrect",
      scoreRange: [0, 40],
      rubricMet: [false, false, false],
      requiredGaps: [["repeated sampl", "procedure", "long run", "frequentist", "fixed", "credible interval"]],
      forbiddenGaps: [],
      hint: "required",
    },
  },
  {
    id: "stat-clt-correct",
    topic: "Statistics",
    questionPrompt: "Why does the Central Limit Theorem matter for A/B testing?",
    rubric: [
      "Sampling distribution of the mean approaches normal regardless of population shape",
      "Justifies normal-based tests and confidence intervals on non-normal metrics",
      "Notes the caveat: needs sufficient n, and heavy tails or skew slow convergence",
    ],
    userAnswer:
      "Metrics like revenue per user are heavily skewed, but the CLT says the sampling distribution of the mean tends toward normal as n grows, whatever the underlying distribution looks like. That's what lets us use z/t-based tests and CIs on skewed metrics. The caveat is it's asymptotic — with heavy tails or a few whales you need a much larger n before the approximation holds, which is why people bootstrap or trim outliers instead.",
    expected: {
      verdict: "correct",
      scoreRange: [82, 100],
      rubricMet: [true, true, true],
      requiredGaps: [],
      forbiddenGaps: ["caveat", "sample size"],
      hint: "none",
    },
  },
  {
    id: "stat-correlation-causation-partial",
    topic: "Statistics",
    questionPrompt:
      "Users who use our search feature retain 40% better. Should we push more users toward search?",
    rubric: [
      "Identifies this as correlational, not causal",
      "Names a plausible confounder or reverse-causation story",
      "Proposes an experiment or quasi-experimental design to test it",
    ],
    userAnswer:
      "This is correlation, not causation. Engaged users probably use more features in general, so search usage might just be a symptom of being an engaged user rather than a cause of retention.",
    expected: {
      verdict: "partial",
      scoreRange: [50, 78],
      rubricMet: [true, true, false],
      requiredGaps: [["experiment", "test", "randomi", "a/b", "causal design", "how to verify"]],
      forbiddenGaps: ["confounder", "correlation"],
      hint: "required",
    },
  },

  // --------------------------------------------------------------- A/B testing
  {
    id: "abtest-peeking-correct",
    topic: "A/B testing",
    questionPrompt:
      "Your teammate checks the dashboard daily and wants to stop the test the moment p < 0.05. What's wrong with that?",
    rubric: [
      "Identifies repeated significance testing inflates the false positive rate",
      "Explains that a fixed-horizon test assumes one look at a predetermined n",
      "Offers a remedy: fixed sample size, sequential testing, or alpha spending",
    ],
    userAnswer:
      "That's peeking. Every extra look is another chance to cross the threshold by luck, so the real false positive rate ends up far above 5% — with daily checks over a couple of weeks it can be 20%+. A standard t-test assumes you look once at a sample size you fixed in advance. If the team wants to monitor continuously, use a method built for it: sequential testing, alpha spending, or Bayesian bandits.",
    expected: {
      verdict: "correct",
      scoreRange: [85, 100],
      rubricMet: [true, true, true],
      requiredGaps: [],
      forbiddenGaps: ["remedy", "solution", "sequential"],
      hint: "none",
    },
  },
  {
    id: "abtest-power-partial",
    topic: "A/B testing",
    questionPrompt: "How do you decide how long to run an A/B test?",
    rubric: [
      "Computes sample size from MDE, baseline rate, alpha and power",
      "Covers full business cycles (e.g. whole weeks) to avoid day-of-week effects",
      "Fixes the duration in advance rather than stopping on significance",
    ],
    userAnswer:
      "I'd do a power calculation first — pick the minimum detectable effect I care about, the baseline conversion rate, alpha at 0.05 and power at 80%, and that gives me the sample size per arm. Divide by daily traffic to get the number of days.",
    expected: {
      verdict: "partial",
      scoreRange: [50, 78],
      rubricMet: [true, false, false],
      requiredGaps: [
        ["week", "business cycle", "day of week", "day-of-week", "seasonal", "cycle"],
      ],
      forbiddenGaps: ["power", "mde", "minimum detectable effect", "sample size"],
      hint: "required",
    },
  },
  {
    id: "abtest-novelty-wrong",
    topic: "A/B testing",
    questionPrompt:
      "A redesign shows +25% engagement in week one, then the lift shrinks to +2% by week four. What's going on?",
    rubric: [
      "Raises novelty effect / primacy as the leading explanation",
      "Notes the week-one number is not the steady-state effect",
      "Suggests running longer or measuring by cohort to find the true effect",
    ],
    userAnswer:
      "The test is losing statistical power over time as more users enter, which dilutes the effect. I'd stop the test at week one while the result is still significant and ship the redesign based on that number.",
    expected: {
      verdict: "incorrect",
      scoreRange: [0, 30],
      rubricMet: [false, false, false],
      requiredGaps: [["novelty", "primacy", "steady state", "steady-state", "wears off", "decay"]],
      forbiddenGaps: [],
      hint: "required",
      hintMustNotLeak: ["novelty effect is the answer"],
    },
  },
  {
    id: "abtest-srm-correct",
    topic: "A/B testing",
    questionPrompt:
      "Your 50/50 test shows 49,830 users in control and 52,190 in treatment. Do you trust the results?",
    rubric: [
      "Recognises this as a sample ratio mismatch",
      "Explains that SRM signals broken randomisation or differential loss, not chance",
      "Concludes the results are untrustworthy until the cause is found",
    ],
    userAnswer:
      "No. That split is way off 50/50 — a chi-square test on those counts would return a tiny p-value, so this isn't chance. That's a sample ratio mismatch, which usually means the assignment is broken or users are being dropped differently between arms, e.g. treatment redirects failing or bot filtering hitting one side. Any lift here could be a selection artefact, so I'd debug the pipeline before reading the metrics at all.",
    expected: {
      verdict: "correct",
      scoreRange: [85, 100],
      rubricMet: [true, true, true],
      requiredGaps: [],
      forbiddenGaps: ["srm", "sample ratio"],
      hint: "none",
    },
  },
  {
    id: "abtest-multiple-testing-partial",
    topic: "A/B testing",
    questionPrompt:
      "You tested one change but tracked 20 metrics, and two came back significant at p < 0.05. How do you read that?",
    rubric: [
      "Identifies the multiple comparisons problem",
      "Quantifies the expected number of false positives under the null",
      "Proposes a correction or a pre-registered primary metric",
    ],
    userAnswer:
      "With 20 metrics you'd expect about one to come up significant by chance alone even if the change did nothing, so two significant results is roughly what randomness would produce. I wouldn't treat those as real findings.",
    expected: {
      verdict: "partial",
      scoreRange: [52, 80],
      rubricMet: [true, true, false],
      requiredGaps: [
        ["correction", "bonferroni", "fdr", "benjamini", "primary metric", "pre-register", "prereg"],
      ],
      forbiddenGaps: ["multiple compar", "false positive"],
      hint: "required",
    },
  },
  {
    id: "abtest-metric-drop-partial",
    topic: "Product analytics",
    questionPrompt: "Checkout conversion dropped 15% week over week. How do you investigate?",
    rubric: [
      "Validates the data first (tracking, pipeline, definition changes)",
      "Segments to localise the drop (platform, geo, browser, new vs returning)",
      "Correlates with known changes: releases, pricing, marketing, seasonality",
    ],
    userAnswer:
      "First I'd slice the data — check whether the drop is concentrated in a particular platform, browser, country, or user segment, or whether it's uniform across the board. A uniform drop points at something global like pricing or a site-wide release; a concentrated one usually means a bug on a specific surface.",
    expected: {
      verdict: "partial",
      scoreRange: [48, 76],
      rubricMet: [false, true, false],
      requiredGaps: [
        ["data quality", "tracking", "instrument", "pipeline", "logging", "is the drop real", "validate"],
      ],
      forbiddenGaps: ["segment", "slice"],
      hint: "required",
    },
  },

  // ---------------------------------------------------------------------- SQL
  {
    id: "sql-join-types-correct",
    topic: "SQL",
    questionPrompt: "When would you use a LEFT JOIN instead of an INNER JOIN?",
    rubric: [
      "INNER returns only matching rows; LEFT keeps all left-side rows",
      "Unmatched right-side columns come back as NULL",
      "Gives a case where preserving unmatched rows matters",
    ],
    userAnswer:
      "INNER JOIN only keeps rows that match on both sides, so anything unmatched silently disappears. LEFT JOIN keeps every row from the left table and fills the right-hand columns with NULL where there's no match. I'd use LEFT whenever the absence is the thing I care about — counting users who have never placed an order, say. With INNER those users vanish and the count is quietly wrong.",
    expected: {
      verdict: "correct",
      scoreRange: [82, 100],
      rubricMet: [true, true, true],
      requiredGaps: [],
      forbiddenGaps: ["example", "null"],
      hint: "none",
    },
  },
  {
    id: "sql-not-in-null-wrong",
    topic: "SQL",
    questionPrompt:
      "`SELECT * FROM users WHERE id NOT IN (SELECT user_id FROM orders)` returns zero rows, but plenty of users have never ordered. Why?",
    rubric: [
      "Identifies NULLs in the subquery result as the cause",
      "Explains NOT IN evaluates to UNKNOWN when comparing against NULL",
      "Offers a fix: NOT EXISTS, filtering NULLs, or an anti-join",
    ],
    userAnswer:
      "The subquery is probably too slow and timing out, or the join is matching on the wrong column. I'd add an index on orders.user_id and rewrite it as a JOIN to make it faster.",
    expected: {
      verdict: "incorrect",
      scoreRange: [0, 25],
      rubricMet: [false, false, false],
      requiredGaps: [["null", "unknown", "three-valued", "3-valued"]],
      forbiddenGaps: [],
      hint: "required",
      hintMustNotLeak: ["not exists", "use not exists instead"],
    },
  },
  {
    id: "sql-window-vs-groupby-partial",
    topic: "SQL",
    questionPrompt: "What can a window function do that GROUP BY cannot?",
    rubric: [
      "Window functions keep row-level detail alongside the aggregate",
      "GROUP BY collapses rows into one per group",
      "Names a concrete use: running total, rank, or per-row share of group",
    ],
    userAnswer:
      "A window function lets you compute an aggregate without collapsing your rows — you keep every row and get the aggregate next to it, whereas GROUP BY squashes each group down to a single row.",
    expected: {
      verdict: "partial",
      scoreRange: [55, 80],
      rubricMet: [true, true, false],
      requiredGaps: [["example", "running total", "rank", "use case", "concrete", "row_number"]],
      forbiddenGaps: ["collapse", "row-level", "row level"],
      hint: "required",
    },
  },
  {
    id: "sql-slow-query-partial",
    topic: "SQL",
    questionPrompt:
      "A query filtering on `WHERE DATE(created_at) = '2026-01-15'` is slow on a large table with an index on created_at. Why?",
    rubric: [
      "Wrapping the column in a function prevents index usage",
      "Names the concept: non-sargable predicate / index cannot be used",
      "Rewrites it as a range scan on the bare column",
    ],
    userAnswer:
      "Because you've wrapped created_at in the DATE() function, the database can't use the index on it — it has to compute DATE() for every row and compare, so you get a full table scan.",
    expected: {
      verdict: "partial",
      scoreRange: [58, 85],
      rubricMet: [true, true, false],
      requiredGaps: [[">=", "range", "rewrite", "half-open", "between", "bare column"]],
      forbiddenGaps: ["index", "function", "scan"],
      hint: "required",
    },
  },
  {
    id: "sql-having-where-correct",
    topic: "SQL",
    questionPrompt: "What's the difference between WHERE and HAVING?",
    rubric: [
      "WHERE filters rows before aggregation",
      "HAVING filters groups after aggregation",
      "Notes HAVING can reference aggregate results while WHERE cannot",
    ],
    userAnswer:
      "WHERE runs before the rows are grouped, so it filters individual rows going into the aggregation. HAVING runs after, filtering the grouped results. That's why you can write HAVING COUNT(*) > 5 but not WHERE COUNT(*) > 5 — at WHERE time the aggregate doesn't exist yet. Filtering in WHERE is generally cheaper since it cuts rows before the grouping work happens.",
    expected: {
      verdict: "correct",
      scoreRange: [85, 100],
      rubricMet: [true, true, true],
      requiredGaps: [],
      forbiddenGaps: ["aggregate", "order of execution"],
      hint: "none",
    },
  },
  {
    id: "sql-cte-partial",
    topic: "SQL",
    questionPrompt: "Why use a CTE instead of a nested subquery?",
    rubric: [
      "Readability: names the intermediate step and reads top-down",
      "Reusability: one CTE can be referenced multiple times in the query",
      "Notes the caveat that CTEs are not automatically a performance win",
    ],
    userAnswer:
      "Mainly readability — a CTE gives the intermediate result a name and you read the query in the order it executes, instead of unpicking subqueries from the inside out. It's much easier to follow for anything with a few steps.",
    expected: {
      verdict: "partial",
      scoreRange: [45, 75],
      rubricMet: [true, false, false],
      requiredGaps: [["reus", "reference", "multiple times", "performance", "materiali"]],
      forbiddenGaps: ["readab", "readable"],
      hint: "required",
    },
  },
  {
    id: "sql-fanout-correct",
    topic: "SQL",
    questionPrompt:
      "After joining orders to order_items, your SUM(orders.total) is far too high. What happened?",
    rubric: [
      "Identifies join fan-out: one order matches many items",
      "Explains the order total is duplicated once per item row",
      "Offers a fix: aggregate before joining, or sum a distinct-safe expression",
    ],
    userAnswer:
      "The join fans out — each order matches multiple order_items rows, so the order row gets duplicated once per item and its total is counted several times. Fix is to aggregate the items to one row per order in a subquery or CTE first and then join, or sum the item-level amounts instead of the order total.",
    expected: {
      verdict: "correct",
      scoreRange: [85, 100],
      rubricMet: [true, true, true],
      requiredGaps: [],
      forbiddenGaps: ["fan-out", "fanout", "duplicate"],
      hint: "none",
    },
  },

  // ----------------------------------------------------------------------- ML
  {
    id: "ml-overfitting-correct",
    topic: "Machine learning",
    questionPrompt: "Your model gets 99% train accuracy and 71% test accuracy. What's happening and what do you do?",
    rubric: [
      "Diagnoses overfitting from the train/test gap",
      "Explains the model memorised noise rather than learning signal",
      "Proposes concrete remedies: regularisation, more data, simpler model, or CV",
    ],
    userAnswer:
      "That gap is textbook overfitting — the model has enough capacity to memorise the training set, including its noise, so it doesn't generalise. I'd first make sure the split is clean and there's no leakage, then attack capacity: regularisation, fewer features or a simpler model, early stopping, and more training data if I can get it. Cross-validation gives a more stable read than a single split.",
    expected: {
      verdict: "correct",
      scoreRange: [85, 100],
      rubricMet: [true, true, true],
      requiredGaps: [],
      forbiddenGaps: ["overfit", "regularis", "regulariz"],
      hint: "none",
    },
  },
  {
    id: "ml-precision-recall-partial",
    topic: "Machine learning",
    questionPrompt:
      "For a fraud detection model, would you optimise for precision or recall?",
    rubric: [
      "Defines the two correctly in this context",
      "Ties the choice to the relative cost of false positives vs false negatives",
      "Notes the threshold is the lever, and suggests a business-informed operating point",
    ],
    userAnswer:
      "Recall matters more for fraud, because missing an actual fraudulent transaction costs you real money whereas a false alarm just means someone reviews it. So I'd optimise recall.",
    expected: {
      verdict: "partial",
      scoreRange: [48, 76],
      rubricMet: [false, true, false],
      requiredGaps: [["threshold", "operating point", "define", "definition", "trade-off", "tradeoff"]],
      forbiddenGaps: ["cost", "false negative"],
      hint: "required",
    },
  },
  {
    id: "ml-leakage-wrong",
    topic: "Machine learning",
    questionPrompt:
      "You scaled your features using the mean and standard deviation of the full dataset, then split into train and test. Any problem?",
    rubric: [
      "Identifies this as data leakage from test into train",
      "Explains the scaler saw test statistics, inflating the test score",
      "States the fix: fit the scaler on train only, then transform test",
    ],
    userAnswer:
      "No problem — scaling is just a linear transformation, it doesn't change the information content or the ranking of values. As long as you apply the same scaling everywhere the model is fine, and doing it once on the whole dataset is actually more consistent.",
    expected: {
      verdict: "incorrect",
      scoreRange: [0, 30],
      rubricMet: [false, false, false],
      requiredGaps: [["leak", "test set", "contaminat", "fit on train", "optimistic"]],
      forbiddenGaps: [],
      hint: "required",
      hintMustNotLeak: ["fit the scaler on the training set only"],
    },
  },
  {
    id: "ml-imbalance-partial",
    topic: "Machine learning",
    questionPrompt:
      "Your classifier is 98% accurate but the positive class is only 2% of the data. Is the model good?",
    rubric: [
      "Recognises 98% is what predicting the majority class always achieves",
      "Rejects accuracy as the metric for imbalanced data",
      "Names better metrics: precision/recall, F1, PR-AUC, or per-class breakdown",
    ],
    userAnswer:
      "No — a model that just predicts the negative class every single time would also score 98%, so that number tells you nothing about whether it can actually find the positives.",
    expected: {
      verdict: "partial",
      scoreRange: [52, 80],
      rubricMet: [true, true, false],
      requiredGaps: [["precision", "recall", "f1", "pr-auc", "auc", "confusion matrix", "better metric"]],
      forbiddenGaps: ["majority class", "accuracy is"],
      hint: "required",
    },
  },
  {
    id: "ml-crossval-correct",
    topic: "Machine learning",
    questionPrompt: "Why use k-fold cross-validation instead of a single train/test split?",
    rubric: [
      "Reduces variance in the estimate by averaging over k folds",
      "Every observation is used for both training and validation",
      "Notes the cost (k times the compute) or when it is inappropriate (time series)",
    ],
    userAnswer:
      "A single split gives you one noisy estimate that depends heavily on which rows happened to land in test — with a small dataset that's a lottery. k-fold averages performance across k different splits so the estimate has much lower variance, and every row gets used for both training and validation. The price is k times the training compute, and for time series you shouldn't use plain k-fold at all since random folds let the model train on the future.",
    expected: {
      verdict: "correct",
      scoreRange: [85, 100],
      rubricMet: [true, true, true],
      requiredGaps: [],
      forbiddenGaps: ["variance", "time series", "cost"],
      hint: "none",
    },
  },
  {
    id: "ml-scaling-wrong",
    topic: "Machine learning",
    questionPrompt: "Do you need to scale features before training a random forest?",
    rubric: [
      "Correctly says no — tree splits are invariant to monotonic rescaling",
      "Explains why: splits are chosen on thresholds, order is what matters",
      "Contrasts with models that do need it (SVM, kNN, linear with regularisation)",
    ],
    userAnswer:
      "Yes, always scale your features before training any model. Random forests use distance calculations to decide splits, so unscaled features with large ranges will dominate the model and skew the results.",
    expected: {
      verdict: "incorrect",
      scoreRange: [0, 28],
      rubricMet: [false, false, false],
      requiredGaps: [["tree", "split", "threshold", "monotonic", "invariant", "no scaling", "not need"]],
      forbiddenGaps: [],
      hint: "required",
    },
  },

  // ------------------------------------------------------- product / reasoning
  {
    id: "product-dau-drop-partial",
    topic: "Product analytics",
    questionPrompt: "DAU dropped 8% overnight. Walk me through your first hour.",
    rubric: [
      "Rules out instrumentation and pipeline issues before believing the number",
      "Segments by platform, version, geo and cohort to localise it",
      "Checks the change log: releases, experiments, outages, external events",
    ],
    userAnswer:
      "I'd start by checking whether we shipped anything last night — a release, a config flag, an experiment ramp — since an overnight step change usually maps to a deploy. Then I'd look at whether there was an outage or an incident on the infra side.",
    expected: {
      verdict: "partial",
      scoreRange: [42, 72],
      rubricMet: [false, false, true],
      requiredGaps: [
        ["tracking", "instrument", "data quality", "pipeline", "logging", "is it real"],
        ["segment", "slice", "platform", "cohort", "breakdown"],
      ],
      forbiddenGaps: ["release", "deploy"],
      hint: "required",
    },
  },
  {
    id: "product-north-star-correct",
    topic: "Product analytics",
    questionPrompt: "What makes a good north star metric?",
    rubric: [
      "Reflects delivered user value, not vanity or raw volume",
      "Is movable by the team and sensitive to product changes",
      "Warns about gameability and the need for guardrails",
    ],
    userAnswer:
      "It should track the value users actually get, not activity for its own sake — 'weekly active creators who publish' beats 'page views'. It has to be something the team can actually move, otherwise it's a scoreboard rather than a steering signal. And it has to be hard to game: any single number will get optimised against, so it needs guardrail metrics like retention or complaint rate alongside it to catch someone hitting the target while damaging the product.",
    expected: {
      verdict: "correct",
      scoreRange: [82, 100],
      rubricMet: [true, true, true],
      requiredGaps: [],
      forbiddenGaps: ["guardrail", "gameab"],
      hint: "none",
    },
  },
  {
    id: "product-survivorship-wrong",
    topic: "Statistics",
    questionPrompt:
      "You survey current customers about why they love the product and get glowing feedback. What can you conclude about churn?",
    rubric: [
      "Identifies survivorship bias — churned users are absent by construction",
      "Notes the sample cannot speak to reasons for leaving",
      "Suggests surveying churned or at-risk users instead",
    ],
    userAnswer:
      "The feedback shows the product is working well, so churn is probably driven by external factors like price sensitivity rather than the product itself. I'd conclude the product experience isn't the churn driver and focus on pricing.",
    expected: {
      verdict: "incorrect",
      scoreRange: [0, 30],
      rubricMet: [false, false, false],
      requiredGaps: [["survivorship", "survivor", "churned users", "who left", "selection bias", "sample"]],
      forbiddenGaps: [],
      hint: "required",
    },
  },
  {
    id: "product-simpsons-partial",
    topic: "Statistics",
    questionPrompt:
      "Variant B wins on desktop and wins on mobile, but loses overall. How is that possible?",
    rubric: [
      "Names Simpson's paradox",
      "Explains it via differing segment sizes / mix between the arms",
      "Says which read to trust and why (check assignment, then segment-level)",
    ],
    userAnswer:
      "That's Simpson's paradox — the aggregate can reverse the direction of every subgroup. It happens when the mix of segments differs between the two variants.",
    expected: {
      verdict: "partial",
      scoreRange: [55, 82],
      rubricMet: [true, true, false],
      requiredGaps: [["which", "trust", "assignment", "randomi", "srm", "what to do", "resolve"]],
      forbiddenGaps: ["simpson"],
      hint: "required",
    },
  },
  {
    id: "product-guardrails-correct",
    topic: "A/B testing",
    questionPrompt: "What are guardrail metrics and why do you need them?",
    rubric: [
      "Defines them as metrics you protect rather than try to improve",
      "Explains they catch collateral damage from a winning primary metric",
      "Gives a concrete example pair (e.g. CTR up, unsubscribes up)",
    ],
    userAnswer:
      "Guardrails are the metrics you're not trying to move but refuse to break — latency, crash rate, unsubscribes, support tickets. They exist because optimising one number usually costs you somewhere else: you can lift email CTR with aggressive subject lines and simultaneously spike unsubscribe rate, which looks like a win on the primary metric and is a loss for the business. The guardrail is what stops you shipping that.",
    expected: {
      verdict: "correct",
      scoreRange: [85, 100],
      rubricMet: [true, true, true],
      requiredGaps: [],
      forbiddenGaps: ["example", "guardrail"],
      hint: "none",
    },
  },
];

export const VERDICT_COUNTS = CASES.reduce((acc, c) => {
  acc[c.expected.verdict] = (acc[c.expected.verdict] || 0) + 1;
  return acc;
}, {});
