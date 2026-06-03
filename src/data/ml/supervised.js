/**
 * Machine Learning → Supervised Learning lesson modules (ml-s1 .. ml-s6).
 * Each value is a LessonModuleSpec (see src/data/lesson-modules.js typedef).
 * Senior interview-grade depth; calibrated against py-c2 / ml-f2.
 */

/** @type {Record<string, import("../lesson-modules.js").LessonModuleSpec>} */
export const ML_SUPERVISED = {
  "ml-s1": {
    durationLabel: "18–20 min",
    outcomes: [
      "Derive **ordinary least squares** two ways — the geometry of projecting y onto the column space of X, and the calculus that lands on the **normal equations** (XᵀX)β = Xᵀy.",
      "State the **Gauss–Markov assumptions** (linearity, exogeneity, homoscedasticity, no perfect multicollinearity) and name exactly which one each diagnostic plot is checking.",
      "Choose between the **closed-form solve** and **gradient descent**, and explain why GD wins once X has millions of rows or columns.",
      "Read coefficients and **residual plots** like an analyst: detect heteroscedasticity, leverage points, and the multicollinearity that quietly inflates standard errors.",
    ],
    learnMarkdown: `## The mental model: find the line that the errors agree on

Linear regression assumes the target is a **weighted sum** of features plus noise:

\`\`\`
y = β₀ + β₁x₁ + β₂x₂ + … + βₚxₚ + ε
\`\`\`

Everything interesting is in how we pick the βs and what we are willing to assume about ε. "Linear" refers to **linearity in the parameters**, not the features — \`y = β₀ + β₁x + β₂x²\` is still a linear model (just fit on the column \`x²\`). That distinction is a common interview gotcha.

## Motivation (a pricing team that shipped a wrong elasticity)

A marketplace team regresses units sold on price to estimate elasticity. The coefficient comes back **positive** — raise price, sell more — which is nonsense. The bug is not the math; it is **omitted-variable bias**: premium SKUs both cost more and sell more, and "is-premium" was never in the model. The regression faithfully reported the correlation it was handed. Senior takeaway: OLS gives you the *best linear unbiased estimate under its assumptions* — when the answer is absurd, suspect the assumptions before the solver.

## OLS, geometrically

Stack the data into a matrix \`X\` (n rows, p+1 columns including the intercept) and a vector \`y\`. The model space — every prediction the model *can* produce — is the **column space of X**. OLS finds the prediction \`ŷ = Xβ\` that is **closest** to \`y\` in Euclidean distance. Closest means the residual \`y − ŷ\` is **orthogonal** to the column space:

\`\`\`
Xᵀ(y − Xβ) = 0   ⟹   XᵀXβ = Xᵀy   (the normal equations)
\`\`\`

That is the whole derivation. The "least squares" loss is not arbitrary: minimizing squared error *is* projecting y onto the model space, and the right angle is why the residuals sum to zero (when an intercept is present).

## The same answer from calculus

Minimize \`L(β) = ‖y − Xβ‖²\`. Take the gradient, set it to zero:

\`\`\`
∇L = −2Xᵀ(y − Xβ) = 0   ⟹   β = (XᵀX)⁻¹Xᵀy
\`\`\`

The inverse exists iff \`X\` has **full column rank** — i.e. no feature is a perfect linear combination of the others. Perfect multicollinearity makes \`XᵀX\` singular and the closed form blows up; *near*-collinearity makes it nearly singular, which inflates variance (more below).

## Why anyone uses gradient descent instead

Inverting \`XᵀX\` costs roughly **O(p³)** and forming it costs **O(np²)**. With p in the thousands (text features, one-hots) that is painful, and with n in the billions you cannot even materialize \`XᵀX\`. Gradient descent updates \`β ← β − η·∇L\` and costs **O(np)** per step, streams over data in mini-batches, and is the only option for the regularized or non-closed-form variants you actually ship. Trade-offs:

| Approach | Cost | Best when | Watch out for |
|---|---|---|---|
| Normal equations | O(np² + p³) | p small (< ~10⁴), one-shot | Singular XᵀX, memory on np² |
| Batch / SGD | O(np) per epoch | huge n or p, online updates | Learning-rate tuning, feature scaling |
| QR / SVD solve | O(np²) | numerically nasty X | Slower than normal eqns for tiny p |

Practitioners rarely literally invert — \`numpy.linalg.lstsq\` and sklearn use **QR or SVD**, which are more numerically stable than \`(XᵀX)⁻¹\`.

## The assumptions, and what each plot checks

The Gauss–Markov theorem says OLS is **BLUE** — Best Linear Unbiased Estimator — *if* these hold:

| Assumption | Plain English | Diagnostic |
|---|---|---|
| Linearity | mean of y is linear in features | residuals-vs-fitted should be a flat cloud |
| Exogeneity E[ε|X]=0 | noise uncorrelated with features | non-flat residual trend ⟹ omitted variable / wrong form |
| Homoscedasticity | constant noise variance | fan/cone shape ⟹ heteroscedasticity |
| No autocorrelation | errors independent | residuals over time should not wave |
| No perfect multicollinearity | features not redundant | high VIF (> 5–10) |

Note normality of errors is **not** needed for unbiasedness — only for the usual t/F inference and confidence intervals.

## Multicollinearity: the silent variance inflator

When two features are nearly collinear, OLS cannot decide how to split the credit between them. Coefficients become **unstable** (huge standard errors, flip sign on a tiny data change) even though *predictions* may stay fine. Measure it with the **Variance Inflation Factor**, \`VIF_j = 1/(1−R²_j)\`, where \`R²_j\` is from regressing feature j on the others. Fixes: drop one, combine them, or move to **ridge regression**, which adds \`λ‖β‖²\` to the loss and makes \`XᵀX + λI\` invertible by construction.

## Gradient descent, mechanically

When you cannot or will not solve in closed form, you walk downhill on the loss. The gradient of \`L = ‖y − Xβ‖²\` is \`∇L = −2Xᵀ(y − Xβ)\`, so the update is:

\`\`\`
β ← β − η · (−2/n)·Xᵀ(y − Xβ)     # η = learning rate
\`\`\`

Three flavors trade noise for speed:

- **Batch GD** uses all n rows per step — smooth, but one step touches the whole dataset.
- **Stochastic GD (SGD)** uses one row per step — noisy, cheap, escapes shallow traps, and is *online* (update as data streams).
- **Mini-batch GD** (32–512 rows) is the production default: vectorized like batch, stochastic enough to scale.

Because the OLS loss is **convex** (a single bowl), GD converges to the *same* global optimum the normal equations give — there are no local minima to fear. What can go wrong is the **learning rate**: too large and the iterates oscillate or diverge; too small and you wait forever. And GD is **scale-sensitive** — if one feature ranges 0–1 and another 0–10⁶, the loss surface is a long thin valley and GD zig-zags. **Standardize features** (zero mean, unit variance) before GD; the closed form does not care about scale, but GD does. This is a frequent "why is my training so slow?" interview answer.

## A worked intuition: one feature, by hand

With a single feature the slope is \`β₁ = Cov(x, y) / Var(x)\` and the intercept forces the line through the means: \`β₀ = ȳ − β₁x̄\`. Read that: the slope is the covariance *normalized by how much x varies*, which is exactly the correlation times the ratio of standard deviations, \`β₁ = r · (sᵧ/sₓ)\`. So a strong correlation with a small spread in x produces a steep slope. Memorizing this connects three interview objects — covariance, correlation, and the regression coefficient — into one picture.

## Regularization: when OLS is too greedy

OLS is *unbiased* but can have high variance, especially with many or collinear features. We trade a little bias for a lot of variance reduction by penalizing large coefficients:

| Method | Penalty added to loss | Effect | When |
|---|---|---|---|
| **Ridge (L2)** | λ‖β‖² | shrinks all coefficients toward 0, never exactly 0 | many correlated features; stabilizes ill-conditioned XᵀX |
| **Lasso (L1)** | λ‖β‖₁ | drives some coefficients exactly to 0 → feature selection | sparse signal, want a smaller model |
| **Elastic Net** | mix of both | grouped selection among correlated features | high-dim, correlated predictors |

Ridge has a clean closed form, \`β = (XᵀX + λI)⁻¹Xᵀy\` — the \`+λI\` is what makes the inverse always exist, directly fixing the multicollinearity blow-up. \`λ\` is chosen by cross-validation; as \`λ → 0\` you recover OLS, as \`λ → ∞\` all coefficients vanish. Geometrically, regularization shrinks the solution toward the origin; the L1 penalty's diamond-shaped constraint region has corners on the axes, which is *why* lasso zeroes coefficients while ridge's circular region does not.

## Reading the coefficient table

A regression summary reports, per coefficient, a **standard error**, a **t-statistic** (β̂ divided by its SE), and a **p-value** (probability of seeing a t this large if the true β were 0). A small p-value means the feature's effect is unlikely to be noise — but it says nothing about effect *size* or business relevance, and with many features you will get spurious "significant" ones by chance (multiple-comparisons). The **confidence interval** on β is more honest than a bare p-value because it shows the plausible range and the magnitude together. Senior framing: report intervals and effect sizes, not just stars, and remember every one of these numbers assumes the model is correctly specified — garbage in, confidently-wrong inference out.

## Pitfalls senior interviewers probe

- **R² worship.** R² never decreases when you add features — use **adjusted R²** or held-out error. A high R² on training data says nothing about generalization.
- **Extrapolation.** The line is only trustworthy inside the range of the training x. Predicting far outside it is fantasy.
- **Leverage and influence.** A single high-leverage outlier can drag the whole fit; check Cook's distance, do not just eyeball the scatter.
- **Forgetting to scale before GD.** The closed form is scale-invariant; gradient descent is not — unscaled features make it crawl.
- **Reading correlation as causation.** OLS coefficients are *associations* unless your design (randomization, instruments, controls) earns a causal reading.

## Interview questions

- "Derive the normal equations and tell me geometrically what they mean." (Orthogonal projection; residual ⊥ column space.)
- "When would you *not* use the closed-form solution?" (Large p, large n, regularized/online settings, ill-conditioned X.)
- "Your coefficient flipped sign when you added a feature — what happened?" (Multicollinearity or confounding / omitted-variable bias.)
- "Does OLS need normally distributed errors?" (Not for BLUE — only for the standard inference.)
- "Ridge vs lasso — when and why?" (L2 shrinks/stabilizes correlated features; L1 selects by zeroing — diamond corners on the axes.)
- "Why standardize features for gradient descent but not for the closed form?" (GD zig-zags on an elongated loss surface; the normal equations are scale-invariant.)`,
    video: null,
    videoFallbackMarkdown: `## Deep dive without video (10 min, paper + the lab)

1. **Derive it cold.** On paper, write \`L(β)=‖y−Xβ‖²\`, expand, differentiate, set to zero, and arrive at \`XᵀXβ=Xᵀy\`. Say out loud the geometric meaning of each step.
2. **Break an assumption on purpose.** In the lab, drag points so the spread grows with x (a fan shape). Predict what the residual plot does *before* you look — that is heteroscedasticity.
3. **Two sentences:** "OLS minimizes squared error, which is equivalent to ___ y onto the column space of X. I'd switch to gradient descent when ___." Fill the blanks and rehearse the answer.`,
    tryGuidance: `Before touching the lab, predict where the OLS line will sit, then drag the slope and intercept and watch SSE. Now move one point far off the trend and predict whether the line follows it — that is the leverage story.`,
    interviewGraph: {
            initialStageId: "s1_r2_click",
            artifactDimensions: [
              {
                label: "R² Interpretation",
                recoveryStageId: "s1_recovery_r2",
              },
              {
                label: "Feature Scaling & Coefficients",
                recoveryStageId: "s1_recovery_coef",
              },
              {
                label: "Regression Assumptions",
                recoveryStageId: "s1_recovery_assumptions",
                passLabel: "OLS Mastery",
              },
            ],
            stages: {
              s1_r2_click: {
                id: "s1_r2_click",
                type: "click_target",
                badge: "Stage 1",
                title: "Stage 1 · Overoptimistic Evaluation",
                prompt: "Your colleague reports the model quality using R² computed on the training set. Click the line that gives an overoptimistic — and misleading — measure of model quality.",
                code_snippet: `from sklearn.linear_model import LinearRegression
from sklearn.metrics import r2_score

model = LinearRegression()
model.fit(X_train, y_train)

train_r2 = r2_score(y_train, model.predict(X_train))  # ds-target:train_r2_line
print(f"Model R²: {train_r2:.3f}")   # reported as final quality`,
                validationCopy: {
                  train_r2_line: "Correct. R² on the training set is always optimistic — it rises as you add features even if they are noise. Report R² on a held-out set or use cross-validated R² to get an honest estimate of generalisation.",
                },
                branches: {
                  train_r2_line: "s1_coef_choice",
                },
              },
              s1_coef_choice: {
                id: "s1_coef_choice",
                type: "scenario_choice",
                badge: "Stage 2",
                title: "Stage 2 · Coefficient Interpretation",
                prompt: "A linear regression yields: age=2.1, salary=-0.003. A colleague says salary is nearly unimportant because its coefficient is tiny. What is the correct interpretation?",
                code_snippet: `# OLS fit — no standardisation applied
# age measured in years (range ~20–70)
# salary measured in dollars (range ~30000–200000)
coef = {"age": 2.1, "salary": -0.003}`,
                choices: [
                  {
                    id: "a",
                    label: "Salary is unimportant — the coefficient is almost zero",
                    description: "The raw magnitude of an OLS coefficient reflects the unit scale of the feature, not its importance.",
                  },
                  {
                    id: "b",
                    label: "Coefficient magnitude is meaningless without standardising features first",
                    description: "A $1 change in salary is tiny; a 1-year change in age is substantial. Compare standardised coefficients or feature importances after scaling.",
                  },
                  {
                    id: "c",
                    label: "Use the p-value of salary to decide importance",
                    description: "p-values test statistical significance, not practical importance, and do not fix the scale problem.",
                  },
                  {
                    id: "d",
                    label: "Multiply coefficient by mean feature value to normalise",
                    description: "This is not the standard approach; standardising features before fitting (z-score) is the correct method.",
                  },
                ],
                branches: {
                  a: "s1_recovery_coef",
                  b: "s1_irrelevant_choice",
                  c: "s1_recovery_coef",
                  d: "s1_recovery_coef",
                },
                rationale: "OLS coefficients are in units of (output / input). Because salary is measured in dollars and age in years, a one-unit change means very different things. Always standardise features before comparing coefficients, or use permutation importance on the original scale.",
              },
              s1_irrelevant_choice: {
                id: "s1_irrelevant_choice",
                type: "scenario_choice",
                badge: "Stage 3",
                title: "Stage 3 · Irrelevant Features & R²",
                prompt: "You add 20 randomly generated (noise) features to a linear regression with no regularization. What happens to training R²?",
                code_snippet: `import numpy as np
from sklearn.linear_model import LinearRegression

# original 5 features + 20 pure noise columns
X_augmented = np.hstack([X_train, np.random.randn(len(X_train), 20)])
model = LinearRegression().fit(X_augmented, y_train)
print(model.score(X_augmented, y_train))  # training R²`,
                choices: [
                  {
                    id: "a",
                    label: "Training R² decreases — noise hurts the fit",
                    description: "OLS minimises training error; adding any column (even noise) cannot make the in-sample fit worse.",
                  },
                  {
                    id: "b",
                    label: "Training R² stays the same — noise has no effect",
                    description: "OLS can always fit noise columns; training R² will weakly increase.",
                  },
                  {
                    id: "c",
                    label: "Training R² never decreases; validation R² may drop significantly",
                    description: "Adding noise features allows the model to fit the training set better spuriously. Adjusted R² or cross-validation reveals the truth.",
                  },
                  {
                    id: "d",
                    label: "Training R² increases and so does validation R²",
                    description: "Noise features hurt out-of-sample performance even as they inflate training R².",
                  },
                ],
                branches: {
                  a: "s1_recovery_r2",
                  b: "s1_recovery_r2",
                  c: "s1_residuals_choice",
                  d: "s1_recovery_r2",
                },
                rationale: "Ordinary R² never decreases on training data when you add features — OLS will find tiny coefficients that reduce residuals. Adjusted R² penalises for the number of predictors. On validation data the noise features hurt generalisation.",
              },
              s1_residuals_choice: {
                id: "s1_residuals_choice",
                type: "scenario_choice",
                badge: "Stage 4",
                title: "Stage 4 · Residual Diagnostics",
                prompt: "After fitting a linear regression, the residual-vs-fitted plot shows a clear U-shape (curved pattern). What is the most important implication?",
                code_snippet: `import matplotlib.pyplot as plt

preds = model.predict(X_train)
residuals = y_train - preds
plt.scatter(preds, residuals)
# Plot shows a clear upward-then-downward curve (U-shape)`,
                choices: [
                  {
                    id: "a",
                    label: "Heteroscedasticity — variance is non-constant",
                    description: "Heteroscedasticity shows as a funnel shape (widening spread), not a U-shape.",
                  },
                  {
                    id: "b",
                    label: "The linearity assumption is violated; the relationship is non-linear",
                    description: "A systematic curve in residuals means the linear model is missing a curved relationship — add polynomial terms or use a non-linear model.",
                  },
                  {
                    id: "c",
                    label: "Multicollinearity is causing instability",
                    description: "Multicollinearity inflates coefficient variance but does not produce a curved residual pattern.",
                  },
                  {
                    id: "d",
                    label: "Outliers are distorting the fit",
                    description: "Outliers produce isolated extreme residuals, not a systematic curve across all fitted values.",
                  },
                ],
                branches: {
                  a: "s1_recovery_assumptions",
                  b: "s1_terminal",
                  c: "s1_recovery_assumptions",
                  d: "s1_recovery_assumptions",
                },
                rationale: "A U-shape in residuals vs fitted values is the textbook sign of a violated linearity assumption — the true relationship is curved. Remedies: add x² terms, apply a log transform to the target, or use a nonlinear model.",
              },
              s1_recovery_r2: {
                id: "s1_recovery_r2",
                type: "scenario_choice",
                badge: "Recovery 1",
                title: "Recovery · R² and Adjusted R²",
                prompt: "You fit two models. Model A has 3 features, R²=0.72. Model B has 25 features, R²=0.74. Which model is better, and what metric should you use to decide?",
                code_snippet: `# Model A: 3 features, R²_train = 0.72
# Model B: 25 features, R²_train = 0.74
# n = 200 observations`,
                choices: [
                  {
                    id: "a",
                    label: "Model B — higher R² always means better",
                    description: "Training R² always increases with more features; this comparison is misleading.",
                  },
                  {
                    id: "b",
                    label: "Use adjusted R² or cross-validated R² to penalise for model complexity",
                    description: "Adjusted R² penalises for additional predictors. If adjusted R² for B is not materially higher, Model A is preferable for its parsimony.",
                  },
                  {
                    id: "c",
                    label: "Use AIC to compare — lowest AIC wins",
                    description: "AIC is valid but is mainly used for maximum-likelihood models; adjusted R² or cross-val R² is more direct here.",
                  },
                  {
                    id: "d",
                    label: "Compare RMSE on training data",
                    description: "Training RMSE has the same problem as training R² — more features always reduce it.",
                  },
                ],
                branches: {
                  a: "s1_recovery_r2",
                  b: "s1_irrelevant_choice",
                  c: "s1_recovery_r2",
                  d: "s1_recovery_r2",
                },
                rationale: "Training R² is monotonically non-decreasing in the number of features. Adjusted R² and cross-validated metrics account for complexity. For prediction, hold-out or cross-validated RMSE is the gold standard.",
              },
              s1_recovery_coef: {
                id: "s1_recovery_coef",
                type: "scenario_choice",
                badge: "Recovery 2",
                title: "Recovery · Multicollinearity",
                prompt: "Two features in your regression have a Pearson correlation of 0.97. What problem does this cause and what is a standard remedy?",
                code_snippet: `import pandas as pd
corr = X_train.corr()
# corr['income']['education'] = 0.97`,
                choices: [
                  {
                    id: "a",
                    label: "No problem — OLS handles correlated features automatically",
                    description: "OLS can still produce a fit, but the coefficients become unstable and hard to interpret.",
                  },
                  {
                    id: "b",
                    label: "Multicollinearity inflates coefficient variance; fix by dropping one feature, PCA, or Ridge regularisation",
                    description: "High VIF (>10) signals multicollinearity. Ridge regression shrinks correlated coefficients jointly; PCA creates orthogonal components.",
                  },
                  {
                    id: "c",
                    label: "Log-transform both features to reduce correlation",
                    description: "Log transforms can sometimes reduce skew-driven correlation but are not a reliable fix for multicollinearity.",
                  },
                  {
                    id: "d",
                    label: "Increase sample size to resolve multicollinearity",
                    description: "More data helps with noise but does not fix structural multicollinearity between features.",
                  },
                ],
                branches: {
                  a: "s1_recovery_coef",
                  b: "s1_residuals_choice",
                  c: "s1_recovery_coef",
                  d: "s1_recovery_coef",
                },
                rationale: "Multicollinearity makes OLS coefficients sensitive to small data changes (high variance). Detection: Variance Inflation Factor (VIF). Remedies: remove one correlated feature, use PCA, or apply Ridge (L2) regularisation.",
              },
              s1_recovery_assumptions: {
                id: "s1_recovery_assumptions",
                type: "scenario_choice",
                badge: "Recovery 3",
                title: "Recovery · OLS Assumptions",
                prompt: "Which assumption of OLS linear regression is violated when the variance of residuals grows with the fitted values (funnel shape in residual plot)?",
                code_snippet: `# Residual plot shows funnel: small residuals at low predictions,
# large residuals at high predictions`,
                choices: [
                  {
                    id: "a",
                    label: "Linearity",
                    description: "Linearity violation produces a curved residual pattern, not a funnel.",
                  },
                  {
                    id: "b",
                    label: "Homoscedasticity (constant variance)",
                    description: "A funnel shape is the classic signature of heteroscedasticity — variance is not constant across fitted values. Remedies: log-transform the target, use WLS, or robust standard errors.",
                  },
                  {
                    id: "c",
                    label: "Independence of errors",
                    description: "Dependence (e.g., autocorrelation) shows up in time-ordered residual plots, not a funnel by fitted value.",
                  },
                  {
                    id: "d",
                    label: "Normality of residuals",
                    description: "Normality violations are detected with Q-Q plots, not residual-vs-fitted plots.",
                  },
                ],
                branches: {
                  a: "s1_recovery_assumptions",
                  b: "s1_terminal",
                  c: "s1_recovery_assumptions",
                  d: "s1_recovery_assumptions",
                },
                rationale: "Homoscedasticity means residual variance is constant. A funnel = heteroscedasticity. OLS is still unbiased but standard errors are wrong, making inference unreliable. Fix: log(y), Box-Cox, or weighted least squares.",
              },
              s1_terminal: {
                id: "s1_terminal",
                type: "scenario_choice",
                badge: "Terminal",
                title: "Revision complete · Linear Regression Mastered",
                terminal: true,
                prompt: "VIF for two predictors is 14. Explain what multicollinearity is, why a VIF of 14 is concerning, and name two concrete ways to handle it.",
                code_snippet: `from statsmodels.stats.outliers_influence import variance_inflation_factor
vifs = [variance_inflation_factor(X.values, i) for i in range(X.shape[1])]
# Output: [14.2, 13.8, 1.4, 2.1]`,
                choices: [
                  {
                    id: "a",
                    label: "Multicollinearity = high correlation between predictors; VIF>10 is problematic; fix with Ridge or drop one feature",
                    description: "VIF = 1/(1-R²_j) where R²_j is from regressing feature j on all others. VIF=14 means ~93% of feature j's variance is explained by other features — coefficients are unstable.",
                  },
                  {
                    id: "b",
                    label: "VIF=14 just means the features are useful; keep all of them",
                    description: "High VIF indicates redundancy, not usefulness. Coefficients become unreliable even if predictions are stable.",
                  },
                  {
                    id: "c",
                    label: "Drop both features since both have high VIF",
                    description: "Usually you only need to drop or combine one of the correlated pair. Ridge regression is often preferable to dropping.",
                  },
                ],
                branches: {
                  a: "s1_terminal",
                  b: "s1_terminal",
                  c: "s1_terminal",
                },
                rationale: "VIF = 1/(1−R²_j). VIF > 10 is a common threshold for concern. Consequences: inflated standard errors, unstable and sign-flipping coefficients. Fixes: (1) Drop the less theoretically important feature of the correlated pair. (2) Apply Ridge (L2) regularisation which shrinks correlated coefficients jointly. (3) PCA to create orthogonal components.",
              },
            },
          },
    knowledgeCheck: [
      {
        question: "Geometrically, what does ordinary least squares compute?",
        options: [
          "The orthogonal projection of y onto the column space of X",
          "The point in X closest to the origin",
          "The eigenvector of X with the largest eigenvalue",
        ],
        correctIndex: 0,
        explanation: "Minimizing ‖y−Xβ‖² makes the residual orthogonal to the column space — OLS projects y onto the space of achievable predictions.",
      },
      {
        question: "Why would you choose gradient descent over the closed-form (XᵀX)⁻¹Xᵀy?",
        options: [
          "It always finds a lower training error than the closed form",
          "When p is large or n is huge, O(np) per step beats forming and inverting XᵀX (O(np²+p³))",
          "Because gradient descent needs no learning rate",
        ],
        correctIndex: 1,
        explanation: "Both target the same global optimum (convex loss). GD scales to large/streaming data and regularized variants; it does not beat the closed form on error, and it needs a learning rate.",
      },
      {
        question: "Two features are nearly collinear. What is the most likely symptom?",
        options: [
          "Predictions become wildly inaccurate on every point",
          "Coefficient estimates become unstable with inflated standard errors, even if predictions are fine",
          "The model becomes guaranteed unbiased",
        ],
        correctIndex: 1,
        explanation: "Near-collinearity makes XᵀX ill-conditioned, so OLS cannot allocate credit between the features — coefficients swing and standard errors inflate (high VIF), while ŷ can stay stable.",
      },
      {
        question: "Which assumption is NOT required for OLS to be the Best Linear Unbiased Estimator?",
        options: [
          "Normally distributed errors",
          "No perfect multicollinearity",
          "Errors have constant variance (homoscedasticity)",
        ],
        correctIndex: 0,
        explanation: "Gauss–Markov gives BLUE without normality; normality is only needed for the usual t/F inference and confidence intervals.",
      },
      {
        question: "A residuals-vs-fitted plot shows a clear cone/fan widening to the right. What does it indicate?",
        options: [
          "Perfect model fit",
          "Heteroscedasticity (non-constant error variance)",
          "The intercept is missing",
        ],
        correctIndex: 1,
        explanation: "A fan shape means the error variance grows with the fitted value — heteroscedasticity. Coefficients stay unbiased but the standard errors are wrong, so inference is untrustworthy.",
      },
      {
        question: "You added one feature and adjusted R² went DOWN while plain R² went up. What do you conclude?",
        options: [
          "The new feature added more complexity than explanatory power; it likely is not worth keeping",
          "The model is now definitely better",
          "R² can never increase, so the data is corrupted",
        ],
        correctIndex: 0,
        explanation: "Plain R² never decreases when you add a feature. Adjusted R² penalizes added parameters, so a drop signals the feature did not earn its place.",
      },
      {
        question: "Why does 'linear' in linear regression NOT forbid fitting a curve like y = β₀ + β₁x + β₂x²?",
        options: [
          "Because squaring is secretly a logarithm",
          "Because linearity refers to being linear in the parameters β, not in the raw features",
          "Because x² is dropped automatically",
        ],
        correctIndex: 1,
        explanation: "The model is linear in β; x² is just another column. You can fit polynomials, splines, and interactions and still use OLS machinery.",
      },
      {
        question: "Production code rarely literally computes (XᵀX)⁻¹. Why?",
        options: [
          "The inverse does not exist for any real matrix",
          "QR/SVD-based solvers are more numerically stable, especially when X is ill-conditioned",
          "Matrix inversion is illegal in floating point",
        ],
        correctIndex: 1,
        explanation: "Explicitly inverting XᵀX squares the condition number and amplifies round-off. QR and SVD solve the least-squares system more stably, which is what numpy.linalg.lstsq and sklearn use.",
      },
    ],
  },

  "ml-s2": {
    durationLabel: "18–20 min",
    outcomes: [
      "Explain why we model **log-odds** linearly and why the **sigmoid** is the inverse-link that maps any real score to a (0,1) probability.",
      "Read a logistic coefficient as a **change in log-odds** (and exp(β) as an odds ratio), not as a probability shift.",
      "Distinguish **discrimination** (ranking, AUC) from **calibration** (do predicted 0.7s happen 70% of the time) and know which one a business decision actually needs.",
      "Diagnose why the loss is **cross-entropy** not MSE, what **perfect separation** does to the fit, and where the **decision boundary** lives.",
    ],
    learnMarkdown: `## The mental model: a linear model wearing a probability costume

Logistic regression is linear regression's classifier sibling. We still compute a **linear score** \`z = β₀ + βᵀx\`, but instead of using z as the prediction, we squash it through the **sigmoid**:

\`\`\`
σ(z) = 1 / (1 + e^(−z))     →     p = P(y = 1 | x)
\`\`\`

The sigmoid is not a magic curve someone liked the shape of. It is the **inverse of the logit (log-odds)** function. We *assume the log-odds are linear* in the features:

\`\`\`
log( p / (1 − p) ) = β₀ + βᵀx
\`\`\`

Solve that for p and you get the sigmoid. So "logistic regression" = "linear regression on the log-odds scale." That single sentence wins half the interviews on this topic.

## Motivation (a fraud team that optimized the wrong number)

A payments team trains a fraud classifier, sees **AUC 0.96**, and ships a rule: block transactions above 0.9. Chargebacks barely move. The model **ranks** beautifully — fraud scores higher than non-fraud — but it is **miscalibrated**: a "0.9" actually corresponds to ~40% real fraud risk, so the threshold is mis-set and the expected-loss math is wrong. Discrimination was great; calibration was broken. Senior takeaway: **AUC answers "can it rank?"; calibration answers "can I trust the number?"** Decisions that multiply probability by a dollar amount need the second.

## Why log-odds, and how to read a coefficient

Modeling p directly is awkward — p is bounded in [0,1], but a linear function is not. The **odds** \`p/(1−p)\` live in (0, ∞), and the **log-odds** live in (−∞, ∞), which is exactly the range a linear function produces. That is why we model log-odds linearly. Consequences for interpretation:

- A one-unit increase in feature \`xⱼ\` adds \`βⱼ\` to the **log-odds**.
- \`exp(βⱼ)\` is the **odds ratio** — multiply the odds by that factor per unit.
- The effect on the **probability** is *not* constant; it depends on where you are on the S-curve (steepest near p = 0.5, flat in the tails).

So "β = 0.7" does **not** mean "+0.7 probability." It means odds multiply by \`e^0.7 ≈ 2\`.

## The loss: why cross-entropy, not MSE

We fit by **maximum likelihood**. For Bernoulli outcomes the negative log-likelihood is **binary cross-entropy**:

\`\`\`
L = − Σ [ yᵢ log pᵢ + (1 − yᵢ) log(1 − pᵢ) ]
\`\`\`

Two reasons this beats squared error for classification:

1. **Convexity.** Cross-entropy paired with the sigmoid is convex in β, so gradient descent reaches the global optimum. MSE on a sigmoid is **non-convex** with flat regions, so optimization stalls.
2. **Gradient health.** With cross-entropy the gradient is the clean \`(p − y)·x\` — confident-and-wrong predictions produce large gradients. With MSE the sigmoid derivative \`p(1−p)\` multiplies in and **vanishes** exactly when the model is confidently wrong, killing learning.

## The decision boundary

A point is classified 1 when \`p ≥ threshold\`. At threshold 0.5, that is \`σ(z) ≥ 0.5\` ⟺ \`z ≥ 0\` ⟺ \`β₀ + βᵀx ≥ 0\`. That equation \`β₀ + βᵀx = 0\` is a **hyperplane** — a straight line in 2D. So plain logistic regression always has a **linear decision boundary**; the *probability* surface is curved (the sigmoid), but the boundary where it crosses 0.5 is flat. To get curved boundaries you add nonlinear features (interactions, polynomials, splines) — the boundary is then linear in the *expanded* feature space.

## Threshold ≠ model

The 0.5 cutoff is a **business choice**, not part of the model. Moving the threshold trades precision against recall and traces out the ROC / PR curves. For imbalanced or asymmetric-cost problems you set the threshold from the **cost matrix** (cost of a false negative vs false positive), not from a default.

## Calibration vs discrimination

| Property | Question it answers | Metric | Fix if broken |
|---|---|---|---|
| Discrimination | Can it rank positives above negatives? | AUC-ROC, AUC-PR | Better features/model |
| Calibration | Do predicted probabilities match reality? | reliability curve, Brier, ECE | Platt scaling, isotonic regression |

A model can be a great ranker and badly calibrated (common after class-weighting, SMOTE, or with tree ensembles / SVMs). Plot a **reliability diagram**: bin predictions, plot mean predicted vs observed frequency; the diagonal is perfect.

## Perfect separation: when the fit explodes

If some feature perfectly splits the classes, the likelihood is maximized by pushing that coefficient to **±∞** — the optimizer never converges and standard errors blow up. Signs: a coefficient or its standard error ballooning each iteration. Fixes: **regularization (L2 ridge / L1 lasso penalties)**, which keeps β finite, or Firth's penalized likelihood. Regularized logistic regression is the default in practice for exactly this reason.

## Maximum likelihood, in one paragraph

Why cross-entropy at all? Because logistic regression is a **probabilistic model**: each label is a Bernoulli draw with probability \`σ(z)\`. The likelihood of the whole dataset is the product of those Bernoulli probabilities, and we pick the β that maximizes it. Taking the log turns the product into a sum (numerically stable, easier to differentiate) and the negative log-likelihood *is* the binary cross-entropy loss. There is no closed-form solution — the sigmoid makes the equations nonlinear — so we fit iteratively with gradient descent or Newton's method (IRLS, iteratively reweighted least squares, is the classic). That probabilistic foundation is what makes the outputs interpretable as calibrated probabilities when the model is well-specified, and it is the bridge to the cross-entropy used throughout deep learning.

## Regularization: the default, not an option

Because of separation and because real models have many correlated features, you almost always train **penalized** logistic regression. **L2 (ridge)** keeps all coefficients small and finite — the standard choice and the cure for separation. **L1 (lasso)** zeroes weak coefficients, giving a sparse, interpretable model when you have many features and suspect most are noise. sklearn's \`LogisticRegression\` is regularized by default, controlled by \`C\` (the *inverse* regularization strength — small C = strong penalty), which is a deliberate echo of the SVM convention and a common point of confusion. Regularization also improves calibration stability and is the reason a "perfectly separable" training set still yields a usable model.

## From two classes to many: softmax

For K classes, logistic regression generalizes to **multinomial (softmax) regression**. Each class gets a linear score \`zₖ\`, and the probabilities are

\`\`\`
P(y = k | x) = e^(zₖ) / Σⱼ e^(zⱼ)
\`\`\`

The loss is **categorical cross-entropy**, the multiclass analog of the binary version. An alternative is **one-vs-rest**: train K independent binary classifiers and normalize. Softmax models the classes jointly (probabilities sum to 1 by construction); one-vs-rest is simpler and parallelizable but its raw scores need normalization to behave like a distribution. The same sigmoid-vs-softmax distinction reappears in the output layer of neural-network classifiers, so the intuition transfers directly.

## Evaluation depth: what the threshold buys you

Because the model outputs a probability and the threshold is a separate knob, you evaluate the *ranking* and the *operating point* separately:

| Curve / metric | What it varies | Reads best for |
|---|---|---|
| ROC / AUC-ROC | TPR vs FPR across thresholds | balanced classes, ranking quality |
| PR curve / AUC-PR | precision vs recall across thresholds | **imbalanced** classes (rare positives) |
| Reliability diagram | predicted vs observed frequency | **calibration** |
| Brier score | mean squared (p − y) | calibration + discrimination combined |

On a 99%-negative problem, AUC-ROC can look great while the model is useless at any usable threshold, because FPR's denominator (the huge negative class) hides false positives. **PR-AUC** exposes that. Pick the operating threshold from the **expected cost**: if a false negative costs 20× a false positive, set the threshold where marginal cost is balanced — not at 0.5.

## Pitfalls senior interviewers probe

- **Treating the probability as calibrated by default** — it usually is for well-specified logistic regression, but resampling and reweighting break it.
- **Reading β as a probability change** — it is a log-odds change.
- **Class imbalance** — accuracy is meaningless at 99% negatives; use PR-AUC and the right threshold.
- **Confusing sklearn's C** — it is *inverse* regularization strength; small C means stronger penalty.
- **Assuming a nonlinear boundary** — vanilla logistic regression cannot bend; you must engineer features or use a kernel/tree model.

## Interview questions

- "Why sigmoid and why cross-entropy — could I use MSE?" (Sigmoid = inverse-logit; cross-entropy is convex with healthy gradients, MSE is not.)
- "What does a coefficient of 0.7 mean?" (Odds ratio ≈ 2 per unit; not a probability shift.)
- "AUC is 0.95 but the product team complains the probabilities are wrong — explain." (Great discrimination, poor calibration; recalibrate.)
- "Your training never converges and one coefficient explodes — diagnose." (Perfect/quasi separation; add regularization.)
- "How does logistic regression extend to multiple classes?" (Softmax / multinomial cross-entropy, or one-vs-rest.)
- "When do you prefer PR-AUC over ROC-AUC?" (Heavy class imbalance — ROC hides false positives behind the large negative denominator.)`,
    video: null,
    videoFallbackMarkdown: `## Deep dive without video (10 min, lab + a reliability sketch)

1. **Trace the boundary.** In the lab, find where the model crosses p = 0.5 and confirm it is a straight line. Now mentally add an \`x₁·x₂\` feature — where would the boundary be allowed to bend?
2. **Calibration by hand.** Take 10 predictions, bin them into [0–0.5) and [0.5–1], and ask: of the points I called ">0.5", what fraction were actually positive? That ratio vs 0.75 is a one-bin reliability check.
3. **Two sentences:** "I model log-odds linearly because ___. AUC measures ___ while calibration measures ___." Fill and rehearse.`,
    tryGuidance: `Predict, before sliding, how the sigmoid steepens as you increase the weight, and where the 0.5 decision boundary lands. Then shift the threshold and watch which points flip — that is precision-vs-recall in motion.`,
    interviewGraph: {
            initialStageId: "s2_loss_click",
            artifactDimensions: [
              {
                label: "Loss Function Choice",
                recoveryStageId: "s2_recovery_loss",
              },
              {
                label: "Threshold & Class Imbalance",
                recoveryStageId: "s2_recovery_threshold",
              },
              {
                label: "Regularisation in Logistic Reg",
                recoveryStageId: "s2_recovery_reg",
                passLabel: "Logistic Regression Mastery",
              },
            ],
            stages: {
              s2_loss_click: {
                id: "s2_loss_click",
                type: "click_target",
                badge: "Stage 1",
                title: "Stage 1 · Wrong Loss Function",
                prompt: "The following code trains a binary classifier using the wrong loss function. Click the line that uses an inappropriate loss for a classification task.",
                code_snippet: `import torch
import torch.nn as nn

model = nn.Linear(10, 1)
optimizer = torch.optim.SGD(model.parameters(), lr=0.01)

criterion = nn.MSELoss()  # ds-target:wrong_loss
# criterion = nn.BCEWithLogitsLoss()  # correct choice

for X_batch, y_batch in loader:
    pred = model(X_batch).squeeze()
    loss = criterion(pred, y_batch.float())
    loss.backward()
    optimizer.step()`,
                validationCopy: {
                  wrong_loss: "Correct. MSE loss treats the output as a continuous value and its gradient does not match the probabilistic nature of binary labels. Binary cross-entropy (BCE) is the correct loss — it penalises confident wrong predictions much more steeply and is derived from maximum likelihood with a Bernoulli distribution.",
                },
                branches: {
                  wrong_loss: "s2_threshold_choice",
                },
              },
              s2_threshold_choice: {
                id: "s2_threshold_choice",
                type: "scenario_choice",
                badge: "Stage 2",
                title: "Stage 2 · Threshold Selection",
                prompt: "A logistic regression outputs probability=0.6. The default threshold is 0.5, so the model predicts class 1. A colleague says this is 'the model's decision'. What is the more accurate framing?",
                code_snippet: `prob = model.predict_proba(X_test)[:, 1]  # output: 0.6
threshold = 0.5
prediction = int(prob >= threshold)  # → 1`,
                choices: [
                  {
                    id: "a",
                    label: "0.5 is the mathematically correct threshold for all problems",
                    description: "0.5 minimises error only when classes are balanced and misclassification costs are equal — rarely true in practice.",
                  },
                  {
                    id: "b",
                    label: "The threshold is a design choice separate from the model; adjust based on cost of FP vs FN",
                    description: "The model outputs a probability; the threshold converts it to a label. For fraud detection you might use 0.2 to catch more true positives; for medical screening even lower.",
                  },
                  {
                    id: "c",
                    label: "Probabilities above 0.5 always mean class 1 is correct",
                    description: "The probability estimate is only as good as the model's calibration and the chosen operating point.",
                  },
                  {
                    id: "d",
                    label: "Use the ROC curve to find the threshold that maximises accuracy",
                    description: "Maximising accuracy is often the wrong objective; prefer maximising F1, or minimising a cost-weighted error.",
                  },
                ],
                branches: {
                  a: "s2_recovery_threshold",
                  b: "s2_imbalance_choice",
                  c: "s2_recovery_threshold",
                  d: "s2_recovery_threshold",
                },
                rationale: "Logistic regression learns probabilities. The threshold is a post-hoc decision that should be tuned to the business cost of false positives vs false negatives. The ROC and Precision-Recall curves visualise this trade-off across all thresholds.",
              },
              s2_imbalance_choice: {
                id: "s2_imbalance_choice",
                type: "scenario_choice",
                badge: "Stage 3",
                title: "Stage 3 · Class Imbalance & Accuracy",
                prompt: "Training accuracy=99%, but 95% of labels are class 0 (not fraud). Is this a good model?",
                code_snippet: `# Dataset: 950 class-0, 50 class-1
# Model accuracy on training set: 99%
from sklearn.metrics import classification_report
print(classification_report(y_train, model.predict(X_train)))`,
                choices: [
                  {
                    id: "a",
                    label: "Yes — 99% is excellent in any context",
                    description: "A model that always predicts class 0 achieves 95% accuracy on this dataset. Accuracy is a misleading metric for imbalanced data.",
                  },
                  {
                    id: "b",
                    label: "No — a trivial model predicting all-0 gets 95%; use precision, recall, and F1 on the minority class",
                    description: "With 95% class-0 prevalence, accuracy is nearly useless. Check recall on class 1 (fraud): a model with recall=0 on fraud is worthless despite high accuracy.",
                  },
                  {
                    id: "c",
                    label: "No — but only because the model is overfitting",
                    description: "Overfitting is a separate concern; the core issue here is that accuracy is misleading for imbalanced classes.",
                  },
                  {
                    id: "d",
                    label: "Yes, but retrain with more epochs to push accuracy to 100%",
                    description: "Driving accuracy higher on imbalanced data will typically make the minority-class performance worse, not better.",
                  },
                ],
                branches: {
                  a: "s2_recovery_threshold",
                  b: "s2_reg_choice",
                  c: "s2_recovery_threshold",
                  d: "s2_recovery_threshold",
                },
                rationale: "Accuracy = (TP+TN)/N is dominated by the majority class when labels are skewed. Prefer: F1 score (harmonic mean of precision and recall), ROC-AUC, or PR-AUC. Also consider class_weight='balanced' or oversampling the minority class.",
              },
              s2_reg_choice: {
                id: "s2_reg_choice",
                type: "scenario_choice",
                badge: "Stage 4",
                title: "Stage 4 · Regularisation & Multicollinearity",
                prompt: "Two input features are highly correlated (r=0.95). You apply L2 regularisation (C=1.0 in sklearn) to logistic regression. What does L2 do to the correlated features' coefficients?",
                code_snippet: `from sklearn.linear_model import LogisticRegression

# penalty='l2' is the default in sklearn
model = LogisticRegression(C=1.0, penalty='l2', solver='lbfgs')
model.fit(X_train, y_train)`,
                choices: [
                  {
                    id: "a",
                    label: "L2 sets one correlated coefficient to zero, keeping only the more important one",
                    description: "L1 (Lasso) tends to zero out one of a correlated pair. L2 does something different.",
                  },
                  {
                    id: "b",
                    label: "L2 spreads weight evenly between correlated features, shrinking both but keeping both non-zero",
                    description: "L2 penalises the sum of squared weights, which encourages correlated features to share weight equally rather than one dominating. This stabilises the fit.",
                  },
                  {
                    id: "c",
                    label: "L2 has no effect on correlated features — use PCA instead",
                    description: "L2 does help with multicollinearity by shrinking coefficients, even if PCA is also a valid option.",
                  },
                  {
                    id: "d",
                    label: "L2 increases the magnitude of correlated coefficients to compensate for shared information",
                    description: "L2 always shrinks coefficients toward zero; it never increases their magnitude.",
                  },
                ],
                branches: {
                  a: "s2_recovery_reg",
                  b: "s2_terminal",
                  c: "s2_recovery_reg",
                  d: "s2_recovery_reg",
                },
                rationale: "L2 (Ridge) adds λΣw² to the loss. Because the penalty is quadratic, it prefers to spread weight across correlated features equally rather than concentrating on one. L1 (Lasso) tends to pick one and zero out the other — useful for feature selection but can be arbitrary with highly correlated pairs.",
              },
              s2_recovery_loss: {
                id: "s2_recovery_loss",
                type: "scenario_choice",
                badge: "Recovery 1",
                title: "Recovery · Loss Functions for Classification",
                prompt: "Why is binary cross-entropy preferred over MSE for binary classification?",
                code_snippet: `# BCE: L = -[y*log(p) + (1-y)*log(1-p)]
# MSE: L = (y - p)²
# For y=1, p=0.01 (very wrong prediction):
import math
bce = -math.log(0.01)   # ≈ 4.6 (large penalty)
mse = (1 - 0.01)**2     # ≈ 0.98 (small penalty)`,
                choices: [
                  {
                    id: "a",
                    label: "BCE is faster to compute",
                    description: "Speed is not the reason; the mathematical properties matter more.",
                  },
                  {
                    id: "b",
                    label: "BCE is derived from maximum likelihood with Bernoulli outputs and penalises confident wrong predictions much more steeply",
                    description: "For a confident wrong prediction (p≈0, y=1), BCE → ∞ while MSE ≈ 1. This creates much stronger gradients for correction.",
                  },
                  {
                    id: "c",
                    label: "MSE works fine for classification — the choice is stylistic",
                    description: "MSE gradients vanish when the sigmoid output is near 0 or 1 (the saturation region), causing very slow learning.",
                  },
                  {
                    id: "d",
                    label: "BCE is used only in multi-class problems, not binary",
                    description: "BCE (binary cross-entropy) is specifically for binary classification; categorical cross-entropy extends it to multi-class.",
                  },
                ],
                branches: {
                  a: "s2_recovery_loss",
                  b: "s2_threshold_choice",
                  c: "s2_recovery_loss",
                  d: "s2_recovery_loss",
                },
                rationale: "BCE = -[y log p + (1-y) log(1-p)]. It is the negative log-likelihood of a Bernoulli distribution, so minimising BCE = maximising likelihood. Crucially, -log(0.01) ≈ 4.6 vs MSE ≈ 0.98 — BCE punishes confident mistakes far more severely.",
              },
              s2_recovery_threshold: {
                id: "s2_recovery_threshold",
                type: "scenario_choice",
                badge: "Recovery 2",
                title: "Recovery · Threshold & Metrics for Imbalanced Data",
                prompt: "In a fraud detection system (1% fraud rate), which metric should you primarily optimise and why?",
                code_snippet: `# 10000 transactions: 9900 legit, 100 fraud
# Model A: accuracy=99.0%, recall_fraud=0%
# Model B: accuracy=97.5%, recall_fraud=80%`,
                choices: [
                  {
                    id: "a",
                    label: "Accuracy — Model A wins with 99%",
                    description: "Model A never detects fraud. High accuracy on imbalanced data is meaningless.",
                  },
                  {
                    id: "b",
                    label: "Recall on the fraud class (or F1 / PR-AUC), because missing a fraud is more costly than a false alarm",
                    description: "Model B catches 80% of fraud at a small accuracy cost. In fraud/medical settings, false negatives carry high cost — optimise recall or a cost-weighted F1.",
                  },
                  {
                    id: "c",
                    label: "Precision — minimise false positives",
                    description: "Pure precision optimisation can lead to predicting fraud only on near-certain cases, missing most fraud.",
                  },
                  {
                    id: "d",
                    label: "ROC-AUC alone, ignoring the threshold",
                    description: "ROC-AUC is useful but does not account for the class imbalance directly; PR-AUC is more informative when positives are rare.",
                  },
                ],
                branches: {
                  a: "s2_recovery_threshold",
                  b: "s2_reg_choice",
                  c: "s2_recovery_threshold",
                  d: "s2_recovery_threshold",
                },
                rationale: "With 1% fraud: a model predicting all-legit achieves 99% accuracy. PR-AUC and recall on the minority class are the meaningful metrics. Use class_weight='balanced', oversample (SMOTE), or adjust the decision threshold to improve minority-class recall.",
              },
              s2_recovery_reg: {
                id: "s2_recovery_reg",
                type: "scenario_choice",
                badge: "Recovery 3",
                title: "Recovery · L1 vs L2 Regularisation",
                prompt: "You want to perform automatic feature selection in logistic regression. Should you use L1 or L2 regularisation, and why?",
                code_snippet: `# sklearn LogisticRegression
# L1: penalty='l1', solver='liblinear' or 'saga'
# L2: penalty='l2', solver='lbfgs'  (default)`,
                choices: [
                  {
                    id: "a",
                    label: "L2 — it zeros out unimportant features",
                    description: "L2 shrinks coefficients but rarely sets them exactly to zero. It does not perform feature selection.",
                  },
                  {
                    id: "b",
                    label: "L1 — it induces sparsity by driving some coefficients exactly to zero",
                    description: "L1 (Lasso) adds λΣ|w| to the loss. The non-smooth L1 penalty creates a solution at corners of the constraint polytope where many weights are zero — this is built-in feature selection.",
                  },
                  {
                    id: "c",
                    label: "Neither — use a tree-based feature importance instead",
                    description: "Tree-based importance is useful, but L1 logistic regression is a valid and commonly used feature selection approach.",
                  },
                  {
                    id: "d",
                    label: "L2 with a very small C value",
                    description: "Very small C (strong L2) shrinks all weights toward zero but does not zero them out exactly.",
                  },
                ],
                branches: {
                  a: "s2_recovery_reg",
                  b: "s2_terminal",
                  c: "s2_recovery_reg",
                  d: "s2_recovery_reg",
                },
                rationale: "L1 norm ‖w‖₁ creates sparsity because its gradient is ±1 (constant), which can exactly cancel a small weight's gradient and push it to zero. L2 norm ‖w‖₂² has gradient 2w, which only asymptotically approaches zero. Use L1 for feature selection, L2 for handling multicollinearity while keeping all features.",
              },
              s2_terminal: {
                id: "s2_terminal",
                type: "scenario_choice",
                badge: "Terminal",
                title: "Revision complete · Logistic Regression Mastered",
                terminal: true,
                prompt: "Your logistic regression has C=0.001 (very high regularisation). All coefficients are near zero and training accuracy barely exceeds the baseline. What is happening and what do you try next?",
                code_snippet: `model = LogisticRegression(C=0.001, penalty='l2')
model.fit(X_train, y_train)
# training accuracy = 0.53, baseline (majority class) = 0.51
# all |coef_| < 0.002`,
                choices: [
                  {
                    id: "a",
                    label: "Underfitting due to excessive regularisation — increase C (reduce penalty strength)",
                    description: "C = 1/λ in sklearn. C=0.001 means λ=1000, an extremely strong penalty that drives all weights to zero. The model has no freedom to fit. Increase C (try 0.1, 1, 10) or use cross-validation to find the optimal C.",
                  },
                  {
                    id: "b",
                    label: "Overfitting — decrease C further",
                    description: "The model is already underfitting (training ≈ baseline). Decreasing C further makes regularisation even stronger and the model even worse.",
                  },
                  {
                    id: "c",
                    label: "Scale the features — unscaled features cause near-zero coefficients",
                    description: "Feature scaling is important for logistic regression, but the primary issue here is over-regularisation (C too small).",
                  },
                  {
                    id: "d",
                    label: "Add more training data to stabilise the coefficients",
                    description: "More data helps generalisation but does not fix a model that is prevented from learning by extreme regularisation.",
                  },
                ],
                branches: {
                  a: "s2_terminal",
                  b: "s2_terminal",
                  c: "s2_terminal",
                  d: "s2_terminal",
                },
                rationale: "C = 1/λ: small C = strong regularisation. C=0.001 (λ=1000) crushes all weights toward zero — the model underfits. Fix: grid-search C over [0.001, 0.01, 0.1, 1, 10, 100] with cross-validation. Also ensure features are standardised before fitting, as logistic regression is sensitive to scale.",
              },
            },
          },
    knowledgeCheck: [
      {
        question: "Why does logistic regression model the log-odds as a linear function of the features?",
        options: [
          "Because log-odds are bounded in [0,1] like probabilities",
          "Because log-odds range over all reals, matching the range of a linear function, while probabilities are bounded",
          "Because the sigmoid only works on integers",
        ],
        correctIndex: 1,
        explanation: "Probabilities live in [0,1] but a linear function is unbounded. The log-odds (logit) maps (0,1) to (−∞,∞), so modeling it linearly is consistent; inverting gives the sigmoid.",
      },
      {
        question: "A logistic coefficient is β = 0.7. The correct interpretation is:",
        options: [
          "A one-unit increase in the feature raises the predicted probability by 0.7",
          "A one-unit increase multiplies the odds by exp(0.7) ≈ 2 (an odds ratio)",
          "The feature explains 70% of the variance",
        ],
        correctIndex: 1,
        explanation: "β acts additively on the log-odds, so exp(β) is the odds ratio. The effect on probability is non-constant along the S-curve.",
      },
      {
        question: "Why is cross-entropy preferred over MSE for training logistic regression?",
        options: [
          "MSE is undefined for probabilities",
          "Cross-entropy with the sigmoid is convex and yields healthy gradients; MSE on a sigmoid is non-convex and its gradient vanishes when confidently wrong",
          "Cross-entropy always gives higher accuracy",
        ],
        correctIndex: 1,
        explanation: "Convexity guarantees the global optimum, and the (p−y)x gradient stays large for confident errors. MSE introduces a p(1−p) factor that kills the gradient exactly when learning is needed.",
      },
      {
        question: "A model has AUC 0.95 but its predicted probabilities are systematically too high. What is the issue and fix?",
        options: [
          "Poor discrimination; collect more features",
          "Poor calibration; apply Platt scaling or isotonic regression",
          "Nothing — AUC of 0.95 guarantees good probabilities",
        ],
        correctIndex: 1,
        explanation: "AUC measures ranking (discrimination), which is fine here. The probabilities are miscalibrated, so recalibrate with Platt/isotonic without changing the ranking.",
      },
      {
        question: "What shape is the decision boundary of plain (no feature engineering) logistic regression in 2D?",
        options: [
          "A straight line (hyperplane where β₀ + βᵀx = 0)",
          "Always a circle",
          "An arbitrary curved surface",
        ],
        correctIndex: 0,
        explanation: "At threshold 0.5 the boundary is z = 0, which is linear in the features. Curved boundaries require nonlinear features or a kernel/tree model.",
      },
      {
        question: "During training, one coefficient and its standard error keep growing without bound. The most likely cause is:",
        options: [
          "The learning rate is too small",
          "Perfect (or quasi-) separation — a feature perfectly splits the classes, pushing β toward ±∞",
          "Too few features",
        ],
        correctIndex: 1,
        explanation: "Under perfect separation the unpenalized likelihood is maximized at infinite weights. Regularization (L2/L1) or Firth's correction keeps the coefficients finite.",
      },
      {
        question: "On a 99%-negative fraud dataset, which evaluation choice is most defensible?",
        options: [
          "Report accuracy and pick the 0.5 threshold",
          "Use PR-AUC and set the threshold from the cost of false negatives vs false positives",
          "Maximize AUC and ship the default cutoff",
        ],
        correctIndex: 1,
        explanation: "Accuracy is dominated by the majority class. PR-AUC focuses on the rare positives, and the threshold should come from the asymmetric cost matrix, not a default.",
      },
      {
        question: "Where on the sigmoid does a one-unit change in a feature move the predicted probability the MOST?",
        options: [
          "In the tails, near p = 0 or p = 1",
          "Near the boundary, around p = 0.5 where the curve is steepest",
          "The effect is identical everywhere",
        ],
        correctIndex: 1,
        explanation: "The sigmoid's slope is maximal at z = 0 (p = 0.5) and flattens in the tails, so the same log-odds change moves probability most near the decision boundary.",
      },
    ],
  },

  "ml-s3": {
    durationLabel: "18–20 min",
    outcomes: [
      "Compute and compare **Gini impurity** and **entropy/information gain**, and explain why they almost always agree on the split.",
      "Explain the **greedy, axis-aligned, recursive** nature of CART and why a single deep tree is a **low-bias, high-variance** learner.",
      "Distinguish **pre-pruning** (max_depth, min_samples_leaf) from **post-pruning** (cost-complexity α) and pick the right knob for a symptom.",
      "Recognize the structural **biases** of trees: instability, no extrapolation, and a tilt toward high-cardinality features.",
    ],
    learnMarkdown: `## The mental model: a flowchart that asks the most informative yes/no question first

A decision tree is a sequence of **axis-aligned yes/no questions** ("is income > 50k?", "is tenure < 6 months?"). At each node, CART (Classification And Regression Trees) **greedily** picks the single feature-and-threshold split that most reduces **impurity** in the children, then recurses on each child. That greediness is the source of both its speed and its blind spots.

## Motivation (a churn model that nobody could trust twice)

A retention team builds a deep decision tree on churn. It scores well in the bake-off, so they ship it. The next month they retrain on slightly newer data and the **entire top of the tree changes** — the root split flips from "contract type" to "monthly charges." Stakeholders lose faith: "Last month tenure mattered, now it doesn't?" Nothing is broken; this is **variance**. A single unpruned tree is exquisitely sensitive to the exact training sample, because one slightly-better split near the root reshapes everything below it. Senior takeaway: a lone deep tree is **interpretable but unstable** — which is precisely why we ensemble them (ml-s4, ml-s5).

## Measuring impurity

A split is good if the children are **purer** (more single-class) than the parent. Two standard measures for class proportions \`pₖ\`:

\`\`\`
Gini    = 1 − Σ pₖ²
Entropy = − Σ pₖ log₂ pₖ
\`\`\`

Both are 0 for a pure node and maximal for a 50/50 mix. We pick the split maximizing **impurity decrease** — for entropy this is called **information gain**:

\`\`\`
IG = Impurity(parent) − Σ (nᵢ/n)·Impurity(childᵢ)
\`\`\`

| | Gini | Entropy |
|---|---|---|
| Range (binary) | 0 to 0.5 | 0 to 1 |
| Cost | no log → faster | log per class |
| Behavior | slightly favors larger partitions | slightly more sensitive to rare-class purity |
| Practical effect | **agree on the split ~98% of the time** | same |

Interview answer: **the choice rarely matters**; Gini is the default because it is cheaper (no logarithm) and the resulting trees are nearly identical. For **regression** trees the criterion is variance / MSE reduction instead.

## Why trees overfit

Left unconstrained, a tree keeps splitting until every leaf is **pure** — in the limit, one training point per leaf. That memorizes noise: **train error → 0, test error climbs**. It is the canonical high-variance learner. The model class can represent any axis-aligned partition, so its bias is low and its variance is the problem.

## Pruning: two philosophies

**Pre-pruning (early stopping)** — stop growing before purity:

- \`max_depth\` — hard cap on tree height.
- \`min_samples_split\` / \`min_samples_leaf\` — refuse splits that create tiny leaves.
- \`min_impurity_decrease\` — refuse splits that barely help.

Cheap, but **myopic**: it might stop at a weak split that would have enabled a great split one level deeper (the XOR problem — neither single feature helps until both are used).

**Post-pruning (cost-complexity / weakest-link pruning)** — grow a big tree, then prune back:

\`\`\`
R_α(T) = R(T) + α·|leaves(T)|
\`\`\`

Grow fully, then for increasing penalty **α** repeatedly remove the subtree whose removal raises error least per leaf saved. Choose α by cross-validation. This avoids the myopia of early stopping because the great deeper split already happened before pruning evaluates it. \`ccp_alpha\` in sklearn exposes exactly this.

| Symptom | Lever |
|---|---|
| Train ≈ 0, test high (overfit) | lower max_depth, raise min_samples_leaf, raise ccp_alpha |
| Train high, test high (underfit) | raise max_depth, lower min_samples_leaf |
| Unstable / changes every retrain | ensemble (bagging / RF) rather than tune a single tree |

## Structural biases to name in an interview

- **Instability / high variance.** Small data changes → different tree (the churn story).
- **No extrapolation.** A tree predicts a constant in each leaf, so beyond the training range it just repeats the edge leaf's value — it cannot trend upward like a line.
- **Greedy ≠ optimal.** The split that looks best now may foreclose a better global tree; finding the optimal tree is NP-hard, so we accept greedy.
- **High-cardinality bias.** Splitting on a feature with many distinct values (IDs, zip codes) gives the greedy search many cut points and can manufacture spurious gain; impurity-based feature importances inherit this bias.
- **Axis-aligned only.** A diagonal boundary needs a staircase of many splits, which is inefficient — a hint for why linear models or kernels can beat trees on smoothly-linear problems.

## Why greedy, and what it costs

Finding the *globally* optimal decision tree — the smallest tree achieving a given accuracy — is **NP-hard**, so every practical algorithm (CART, ID3, C4.5) is **greedy**: pick the locally best split now and never reconsider. This is fast and usually good, but it is **myopic**. The textbook failure is **XOR**: with features where the class is positive only when exactly one of two binary features is on, *neither feature alone* reduces impurity, so a greedy stump finds no useful first split and may stop — even though a depth-2 tree solves it perfectly. This is exactly why pre-pruning can be dangerous and why the XOR pattern is a favorite interview probe: it exposes whether you understand that greedy split selection looks only one level ahead.

## Worked split: computing the gain

Suppose a node has 8 rows: 6 positive, 2 negative. Its Gini is \`1 − (6/8)² − (2/8)² = 0.375\`. A candidate split sends {4 pos, 0 neg} left and {2 pos, 2 neg} right. Left Gini = \`1 − 1² − 0² = 0\` (pure); right Gini = \`1 − 0.5² − 0.5² = 0.5\`. The weighted child impurity is \`(4/8)·0 + (4/8)·0.5 = 0.25\`, so the **impurity decrease is 0.375 − 0.25 = 0.125**. The greedy algorithm computes this for every feature and every candidate threshold and keeps the maximum. For a continuous feature it sorts the values and only needs to test thresholds *between* adjacent distinct values — that sorted scan is why tree training is roughly \`O(n·p·log n)\`.

## Categoricals, missing values, and feature scale

Three practical properties that make trees attractive and show up in interviews:

- **No feature scaling needed.** A split is "is x < t?"; multiplying x by 1000 just rescales t. Unlike linear/SVM/KNN, trees are **invariant to monotonic transforms** of a single feature — no standardization, no log-transform required for the model to work.
- **Categoricals.** CART traditionally needs numeric inputs, so categories are one-hot or target-encoded; some libraries (LightGBM, CatBoost) handle categoricals natively by finding the best *subset* split. Beware one-hotting very high-cardinality categoricals — it explodes the feature count and feeds the high-cardinality split bias.
- **Missing values.** Trees handle them gracefully via **surrogate splits** (a backup feature that mimics the primary split) or by learning a default direction for NaNs — no imputation required. This is a real operational advantage over linear models.

## Regression trees: the same engine, different leaf

For regression the leaf prediction is the **mean of the targets** in that leaf and the split criterion is **variance / squared-error reduction** instead of Gini. The output surface is therefore **piecewise constant** — a staircase. That is why a regression tree cannot extrapolate a trend and why, for smooth functions, you often see a *forest* or *boosting* (many staircases averaged/added) approximating the curve far better than one tree. MAE-based splitting is an alternative that is more robust to target outliers but slower.

## How trees compare to linear models

| | Decision tree | Linear / logistic |
|---|---|---|
| Boundary | axis-aligned, piecewise | linear (or in feature-expanded space) |
| Feature scaling | not needed | required (esp. with regularization/GD) |
| Interactions | captured automatically | must be engineered |
| Extrapolation | none (flat outside range) | yes (continues the trend) |
| Interpretability | a readable flowchart (if shallow) | coefficients / odds ratios |
| Monotonic-transform invariance | yes | no |

The takeaway interviewers want: trees and linear models have **complementary inductive biases**. Trees shine when interactions and nonlinearity dominate and scaling is a nuisance; linear models shine on smooth, roughly-linear, high-dimensional problems and give calibrated, interpretable coefficients.

## Pitfalls

- **Trusting impurity-based feature importance** — biased toward high-cardinality and correlated features; prefer **permutation importance**.
- **Pruning by deleting nodes ad hoc** — use cost-complexity, not vibes.
- **Expecting calibrated probabilities** — leaf frequencies from a deep tree are extreme (0/1); calibrate if you need probabilities.
- **One-hotting high-cardinality categoricals into a tree** — feeds the high-cardinality split bias; prefer native handling or target encoding with care.
- **One tree in production** — almost always you want a forest or boosting; a single tree is for interpretability or as a teaching/baseline model.

## Interview questions

- "Gini vs entropy — when does it matter?" (Almost never; Gini is cheaper, results nearly identical.)
- "Why does a single deep tree overfit, and how do you stop it?" (Splits to pure leaves → high variance; pre- or post-prune.)
- "Pre-pruning vs post-pruning — which is more principled and why?" (Post-pruning avoids the myopia of early stopping; cost-complexity with CV.)
- "Why do trees not need feature scaling but KNN/SVM/linear do?" (Splits are threshold comparisons, invariant to monotonic transforms.)
- "Why can a tree fail to capture a simple linear or XOR relationship cleanly?" (Axis-aligned greedy splits — staircase for a line; XOR needs two features before either gives gain.)`,
    video: null,
    videoFallbackMarkdown: `## Deep dive without video (10 min, compute + the lab)

1. **Compute impurity by hand.** A node with 6 positives and 2 negatives: Gini = 1 − (6/8)² − (2/8)² = 0.375; entropy = −0.75·log₂0.75 − 0.25·log₂0.25 ≈ 0.811. Verify a split that yields a pure (4,0) and a (2,2) child lowers both.
2. **Provoke overfitting.** In the decision-tree lab, keep adding splits and narrate where train error hits zero while the boundary turns into a jagged staircase — that is variance.
3. **Two sentences:** "A single tree is high variance because ___. I'd prefer post-pruning over early stopping because ___." Fill and rehearse.`,
    tryGuidance: `Predict which feature the greedy root split will choose before you step through the lab, then watch each new axis-aligned cut shrink impurity — and notice when extra splits start memorizing noise rather than finding signal.`,
    interviewGraph: {
            initialStageId: "s3_overfit_click",
            artifactDimensions: [
              {
                label: "Overfitting & Depth Control",
                recoveryStageId: "s3_recovery_depth",
              },
              {
                label: "Split Criteria",
                recoveryStageId: "s3_recovery_criteria",
              },
              {
                label: "Feature Importance",
                recoveryStageId: "s3_recovery_importance",
                passLabel: "Decision Tree Mastery",
              },
            ],
            stages: {
              s3_overfit_click: {
                id: "s3_overfit_click",
                type: "click_target",
                badge: "Stage 1",
                title: "Stage 1 · Guaranteed Overfit",
                prompt: "The following decision tree is trained for production use. Click the line that guarantees the tree will overfit the training data.",
                code_snippet: `from sklearn.tree import DecisionTreeClassifier

model = DecisionTreeClassifier(
    max_depth=None,           # ds-target:no_depth_limit
    min_samples_leaf=1,
    criterion='gini'
)
model.fit(X_train, y_train)
print(f"Train accuracy: {model.score(X_train, y_train):.3f}")`,
                validationCopy: {
                  no_depth_limit: "Correct. max_depth=None combined with min_samples_leaf=1 allows the tree to grow until every leaf is pure — it will perfectly memorise the training set (100% training accuracy) and almost certainly overfit. Set max_depth or min_samples_leaf to a meaningful value and validate on held-out data.",
                },
                branches: {
                  no_depth_limit: "s3_criteria_choice",
                },
              },
              s3_criteria_choice: {
                id: "s3_criteria_choice",
                type: "scenario_choice",
                badge: "Stage 2",
                title: "Stage 2 · Gini vs Entropy",
                prompt: "Should you use Gini impurity or entropy as the split criterion for a decision tree? When does the choice actually matter?",
                code_snippet: `# Gini: 1 - Σ p_i²
# Entropy: -Σ p_i * log2(p_i)
# Both measure class impurity at a node

from sklearn.tree import DecisionTreeClassifier
m1 = DecisionTreeClassifier(criterion='gini')
m2 = DecisionTreeClassifier(criterion='entropy')`,
                choices: [
                  {
                    id: "a",
                    label: "Entropy is always better — it has a stronger theoretical basis",
                    description: "Both criteria are theoretically justified. In practice they produce nearly identical trees.",
                  },
                  {
                    id: "b",
                    label: "Gini is always better — it avoids log calculations",
                    description: "Gini is slightly faster (no log), but the choice rarely affects accuracy in practice.",
                  },
                  {
                    id: "c",
                    label: "The choice rarely matters in practice; both optimise similar objectives — Gini is faster, entropy may produce slightly more balanced splits on skewed classes",
                    description: "Empirically, trees built with Gini vs entropy differ on only a few splits and have near-identical test performance. Entropy can produce slightly more balanced trees when class distributions are very skewed.",
                  },
                  {
                    id: "d",
                    label: "Use entropy for regression trees, Gini for classification trees",
                    description: "Regression trees use MSE or MAE as the split criterion, not Gini or entropy. Both Gini and entropy are for classification.",
                  },
                ],
                branches: {
                  a: "s3_recovery_criteria",
                  b: "s3_recovery_criteria",
                  c: "s3_depth_choice",
                  d: "s3_recovery_criteria",
                },
                rationale: "Both Gini and entropy measure node impurity and select very similar splits. The empirical differences in test accuracy are negligible. Gini avoids logarithm computations (faster). Entropy can favour slightly more balanced splits. Default to Gini (sklearn default) unless you have a specific reason.",
              },
              s3_depth_choice: {
                id: "s3_depth_choice",
                type: "scenario_choice",
                badge: "Stage 3",
                title: "Stage 3 · Depth Tuning",
                prompt: "A tree trained with max_depth=None achieves val accuracy=0.63. You reduce max_depth to 4 and val accuracy rises to 0.71. What is the explanation?",
                code_snippet: `from sklearn.tree import DecisionTreeClassifier

deep_tree = DecisionTreeClassifier(max_depth=None)
deep_tree.fit(X_train, y_train)
print(deep_tree.score(X_val, y_val))   # 0.63

shallow_tree = DecisionTreeClassifier(max_depth=4)
shallow_tree.fit(X_train, y_train)
print(shallow_tree.score(X_val, y_val))  # 0.71`,
                choices: [
                  {
                    id: "a",
                    label: "The shallow tree found a luckier random split",
                    description: "Decision trees are deterministic given the same data and parameters; there is no randomness here.",
                  },
                  {
                    id: "b",
                    label: "The deep tree was overfitting; restricting depth reduces variance and improves generalisation",
                    description: "max_depth=None allows the tree to memorise the training set. By limiting depth to 4, the model captures only the most reliable patterns rather than noise.",
                  },
                  {
                    id: "c",
                    label: "The deep tree underfits because it creates too many small leaves",
                    description: "More depth = more splits = more complex model = higher variance, not underfitting.",
                  },
                  {
                    id: "d",
                    label: "max_depth=4 is always the optimal depth for decision trees",
                    description: "Optimal depth is dataset-dependent; always tune max_depth via cross-validation.",
                  },
                ],
                branches: {
                  a: "s3_recovery_depth",
                  b: "s3_importance_choice",
                  c: "s3_recovery_depth",
                  d: "s3_recovery_depth",
                },
                rationale: "A deep unconstrained tree memorises training noise (high variance). Reducing max_depth is a form of regularisation that cuts off the branches that capture noise. The bias-variance tradeoff: shallower = more bias, less variance. Tune depth with cross-validation.",
              },
              s3_importance_choice: {
                id: "s3_importance_choice",
                type: "scenario_choice",
                badge: "Stage 4",
                title: "Stage 4 · Feature Importance",
                prompt: "How does sklearn's feature_importances_ work for decision trees, and what is a known limitation?",
                code_snippet: `model = DecisionTreeClassifier(max_depth=5)
model.fit(X_train, y_train)

importances = model.feature_importances_
# [0.45, 0.30, 0.15, 0.07, 0.03]`,
                choices: [
                  {
                    id: "a",
                    label: "Counts the number of times each feature is used as a split",
                    description: "Frequency of use is not weighted by the quality of the split; sklearn uses impurity decrease, not frequency.",
                  },
                  {
                    id: "b",
                    label: "Uses mean decrease in impurity (MDI); biased toward high-cardinality features",
                    description: "MDI sums the weighted impurity decrease from all splits on a feature. But features with many unique values can create more and better splits by chance, inflating their importance.",
                  },
                  {
                    id: "c",
                    label: "Uses permutation importance — randomly shuffles each feature and measures accuracy drop",
                    description: "Permutation importance is a different (and generally more reliable) method available in sklearn separately. feature_importances_ uses MDI.",
                  },
                  {
                    id: "d",
                    label: "Measures the depth of first split on each feature — earlier splits are more important",
                    description: "Depth of first split correlates with importance but is not how feature_importances_ is computed.",
                  },
                ],
                branches: {
                  a: "s3_recovery_importance",
                  b: "s3_terminal",
                  c: "s3_recovery_importance",
                  d: "s3_recovery_importance",
                },
                rationale: "sklearn feature_importances_ = Mean Decrease in Impurity (MDI): Σ (proportion of samples reaching node) × (impurity decrease) across all nodes using that feature. Known bias: high-cardinality features (many unique values) can achieve high MDI by chance. Use permutation importance or SHAP for more reliable rankings.",
              },
              s3_recovery_depth: {
                id: "s3_recovery_depth",
                type: "scenario_choice",
                badge: "Recovery 1",
                title: "Recovery · Depth & Overfitting",
                prompt: "You are cross-validating max_depth over [1, 2, 4, 8, 16, None]. The CV curve peaks at max_depth=6 and then declines. What does this pattern tell you?",
                code_snippet: `depths = [1, 2, 4, 6, 8, 16, None]
cv_scores = [0.60, 0.65, 0.70, 0.73, 0.70, 0.66, 0.63]
# Peak at depth=6`,
                choices: [
                  {
                    id: "a",
                    label: "max_depth=6 is overfit — use max_depth=1 for simplicity",
                    description: "max_depth=1 (a stump) is the most underfit option. The CV curve shows depth=6 has the best generalisation.",
                  },
                  {
                    id: "b",
                    label: "max_depth=6 is the bias-variance sweet spot for this dataset; shallower underfits, deeper overfits",
                    description: "The inverted-U CV curve is the classic bias-variance tradeoff signature. Depth < 6 = high bias; depth > 6 = high variance. Choose the peak.",
                  },
                  {
                    id: "c",
                    label: "You need more data — the curve will shift right with more samples",
                    description: "More data does shift the overfitting threshold, but the correct action here is to use depth=6 for this dataset.",
                  },
                  {
                    id: "d",
                    label: "Decision trees cannot overfit if max_depth is set explicitly",
                    description: "Any finite max_depth can still overfit if it is too large for the signal-to-noise ratio in the data.",
                  },
                ],
                branches: {
                  a: "s3_recovery_depth",
                  b: "s3_importance_choice",
                  c: "s3_recovery_depth",
                  d: "s3_recovery_depth",
                },
                rationale: "The CV accuracy curve peaks at depth=6 then decreases — classic high-variance overfitting for larger depths. Bias-variance tradeoff: low depth → high bias (underfits). High depth → high variance (memorises noise). Cross-validation finds the sweet spot.",
              },
              s3_recovery_criteria: {
                id: "s3_recovery_criteria",
                type: "scenario_choice",
                badge: "Recovery 2",
                title: "Recovery · Information Gain",
                prompt: "A node has 50 class-0 and 50 class-1 samples (Gini=0.5). After splitting on feature A, left child has 40 class-0 and 10 class-1; right child has 10 class-0 and 40 class-1. Is this a good split?",
                code_snippet: `# Before split: p0=0.5, p1=0.5
# Gini = 1 - (0.5² + 0.5²) = 0.5

# After split on A:
# Left (50 samples): p0=0.8, p1=0.2 → Gini = 1-(0.64+0.04) = 0.32
# Right (50 samples): p0=0.2, p1=0.8 → Gini = 0.32
# Weighted Gini = 0.5*0.32 + 0.5*0.32 = 0.32`,
                choices: [
                  {
                    id: "a",
                    label: "No — the children still have impurity > 0, so the split is bad",
                    description: "A perfect split is rarely achievable. The question is whether impurity decreased — here it dropped from 0.5 to 0.32.",
                  },
                  {
                    id: "b",
                    label: "Yes — Gini decreased from 0.5 to 0.32; information gain = 0.18, a substantial improvement",
                    description: "Information gain = parent Gini − weighted child Gini = 0.5 − 0.32 = 0.18. The split separates classes much better than the parent node.",
                  },
                  {
                    id: "c",
                    label: "Cannot tell without knowing the feature's data type",
                    description: "The type of the feature affects how the split is found (threshold for numerical, set for categorical) but not whether the Gini decrease is meaningful.",
                  },
                  {
                    id: "d",
                    label: "Bad split — both children have equal Gini, meaning the split is symmetric and uninformative",
                    description: "Symmetric splits are valid and informative. Both children have Gini=0.32, which is a substantial improvement over the parent's 0.5.",
                  },
                ],
                branches: {
                  a: "s3_recovery_criteria",
                  b: "s3_depth_choice",
                  c: "s3_recovery_criteria",
                  d: "s3_recovery_criteria",
                },
                rationale: "Information gain (Gini) = parent Gini − weighted average of children's Gini = 0.5 − 0.32 = 0.18. This is a good split — each child is substantially more pure than the parent. Decision trees greedily choose the feature+threshold that maximises information gain at each node.",
              },
              s3_recovery_importance: {
                id: "s3_recovery_importance",
                type: "scenario_choice",
                badge: "Recovery 3",
                title: "Recovery · Tree Instability",
                prompt: "You train the same decision tree twice on the same data and get different results. Why might this happen, and how do you fix it?",
                code_snippet: `# Run 1
m1 = DecisionTreeClassifier()
m1.fit(X_train, y_train)

# Run 2 — same data, same parameters
m2 = DecisionTreeClassifier()
m2.fit(X_train, y_train)

# m1.tree_ != m2.tree_  ← different structures`,
                choices: [
                  {
                    id: "a",
                    label: "Decision trees are always deterministic — this cannot happen",
                    description: "Without fixing random_state, when multiple features have equal information gain the tie-breaking is random.",
                  },
                  {
                    id: "b",
                    label: "When multiple features tie on information gain, sklearn breaks ties randomly; fix with random_state=42",
                    description: "sklearn's splitter has a random component for tie-breaking. Setting random_state ensures reproducibility.",
                  },
                  {
                    id: "c",
                    label: "The data was shuffled between runs, producing a different tree",
                    description: "If data order differs, the tree can differ. But even with identical data order, random tie-breaking can cause differences.",
                  },
                  {
                    id: "d",
                    label: "sklearn resamples training data each fit call by default",
                    description: "sklearn DecisionTreeClassifier does not resample by default — it uses all training data. RandomForestClassifier uses bootstrapping.",
                  },
                ],
                branches: {
                  a: "s3_recovery_importance",
                  b: "s3_terminal",
                  c: "s3_recovery_importance",
                  d: "s3_recovery_importance",
                },
                rationale: "sklearn decision trees use a random tie-breaker when multiple features have equal (or near-equal) information gain. This makes the tree non-deterministic across runs. Fix: set random_state=42 (or any integer). For production, always fix random_state for reproducibility.",
              },
              s3_terminal: {
                id: "s3_terminal",
                type: "scenario_choice",
                badge: "Terminal",
                title: "Revision complete · Decision Tree Mastered",
                terminal: true,
                prompt: "A decision tree with the same training data gives different structures on two runs. Why? How do you fix it? And why are individual decision trees considered 'high variance' models?",
                code_snippet: `# Both runs use identical X_train, y_train
# max_depth=10, random_state not set
tree_a = DecisionTreeClassifier(max_depth=10).fit(X_train, y_train)
tree_b = DecisionTreeClassifier(max_depth=10).fit(X_train, y_train)
# tree_a.feature_importances_ != tree_b.feature_importances_`,
                choices: [
                  {
                    id: "a",
                    label: "Random tie-breaking in splits → set random_state; high variance because small data changes flip splits near the root, cascading through the whole tree",
                    description: "Decision trees are greedy and non-robust: a small perturbation in training data can select a different feature at the root, producing a completely different tree. This is high variance. Random forests mitigate this by averaging many trees.",
                  },
                  {
                    id: "b",
                    label: "The model overfits — use max_depth=1 to fix both issues",
                    description: "max_depth=1 fixes overfitting but does not explain the non-determinism, and a depth-1 stump underfits.",
                  },
                  {
                    id: "c",
                    label: "High variance comes from the Gini criterion — switch to entropy for stability",
                    description: "Both Gini and entropy produce high-variance trees; the issue is the greedy recursive nature, not the criterion.",
                  },
                ],
                branches: {
                  a: "s3_terminal",
                  b: "s3_terminal",
                  c: "s3_terminal",
                },
                rationale: "Non-determinism: sklearn breaks ties in information gain randomly — fix with random_state. High variance: decision trees make hard splits greedily; small changes in data can change which feature is chosen at the root, causing the entire subtree to differ. This instability is why ensemble methods (Random Forests, Gradient Boosting) average many trees to reduce variance.",
              },
            },
          },
    knowledgeCheck: [
      {
        question: "In practice, how different are trees built with Gini vs entropy as the splitting criterion?",
        options: [
          "Entropy always produces a far more accurate tree",
          "They agree on the chosen split the vast majority of the time; Gini is preferred mainly because it avoids the logarithm",
          "Gini can only be used for regression",
        ],
        correctIndex: 1,
        explanation: "Both are minimized by pure nodes and rank splits almost identically. Gini is the cheaper default; the accuracy difference is usually negligible.",
      },
      {
        question: "Why is a single, fully grown decision tree described as low-bias, high-variance?",
        options: [
          "It can represent flexible axis-aligned partitions (low bias) but is very sensitive to the exact training sample (high variance)",
          "It is too simple to fit the data",
          "It always underfits",
        ],
        correctIndex: 0,
        explanation: "Unconstrained, a tree can split down to pure leaves, so it fits almost anything (low bias), but tiny data changes flip splits near the root and reshape the tree (high variance).",
      },
      {
        question: "What is the main weakness of pre-pruning (early stopping) compared with post-pruning?",
        options: [
          "It is computationally infeasible",
          "It is myopic: it may stop at a weak split that would have unlocked a strong split one level deeper (e.g. XOR)",
          "It cannot control tree size at all",
        ],
        correctIndex: 1,
        explanation: "Early stopping evaluates only the immediate gain. Post-pruning grows the full tree first, so the beneficial deeper split already exists before pruning decides what to remove.",
      },
      {
        question: "Cost-complexity pruning minimizes R(T) + α·|leaves|. What does increasing α do?",
        options: [
          "Grows a larger, deeper tree",
          "Penalizes leaf count more, producing a smaller, more pruned tree",
          "Switches the criterion from Gini to entropy",
        ],
        correctIndex: 1,
        explanation: "α is the per-leaf penalty. Larger α makes additional leaves 'cost' more, so weakest-link pruning removes more subtrees; α is tuned by cross-validation.",
      },
      {
        question: "Why can a decision tree struggle to model a simple increasing linear trend beyond the training range?",
        options: [
          "Trees require normalized features",
          "Each leaf predicts a constant and trees are axis-aligned, so they cannot extrapolate a trend — they just repeat the edge leaf's value",
          "Trees can only output probabilities",
        ],
        correctIndex: 1,
        explanation: "A regression tree outputs a piecewise-constant surface. Outside the training range there are no splits, so it cannot continue a trend the way a line does.",
      },
      {
        question: "Impurity-based feature importances are biased toward which kind of feature?",
        options: [
          "Binary features only",
          "High-cardinality features (many distinct values), because the greedy search gets many candidate split points",
          "Features with missing values",
        ],
        correctIndex: 1,
        explanation: "More distinct values means more thresholds to try, manufacturing apparent gain. Permutation importance is a less biased alternative.",
      },
      {
        question: "Your single decision tree gets ~0% training error and high test error. The best first lever is:",
        options: [
          "Increase max_depth further",
          "Constrain the tree (lower max_depth / raise min_samples_leaf or ccp_alpha), or move to an ensemble",
          "Remove the intercept",
        ],
        correctIndex: 1,
        explanation: "Zero train error with high test error is classic overfitting/variance. Regularize the tree via depth/leaf constraints or cost-complexity pruning, or ensemble it.",
      },
      {
        question: "For a regression tree, what plays the role that Gini/entropy plays for classification?",
        options: [
          "Variance (MSE) reduction within child nodes",
          "Information gain on class labels",
          "AUC of the leaf",
        ],
        correctIndex: 0,
        explanation: "Regression trees choose splits that most reduce within-node variance (squared error); Gini and entropy are class-impurity measures for classification.",
      },
    ],
  },

  "ml-s4": {
    durationLabel: "18–20 min",
    outcomes: [
      "Explain **bagging** as variance reduction by averaging decorrelated learners, and why it needs **high-variance, low-bias** base models (deep trees).",
      "Describe **bootstrap sampling** and the **feature subsampling** at each split that makes a Random Forest more than just bagged trees.",
      "Use the **out-of-bag (OOB)** sample as a free validation estimate and know its limits.",
      "Contrast Random Forests with boosting on the **bias/variance**, parallelism, and overfitting axes.",
    ],
    learnMarkdown: `## The mental model: a committee of overfit experts who disagree in useful ways

One deep tree overfits and is unstable (ml-s3). But here is the trick: if you train **many** overfit trees on slightly different data and **average** their predictions, the individual errors — being largely *independent* — cancel out, while the shared signal survives. The forest keeps the low bias of deep trees and **slashes their variance**. The entire design of a Random Forest is in service of making the trees both **strong** and **uncorrelated**.

## Motivation (a credit model that survived the data refresh)

The same retention/credit team from ml-s3, burned by a single tree that reshuffled every retrain, switches to a Random Forest of 500 trees. Now retraining on fresh data leaves predictions **stable** — no individual tree dominates, so no single split flip moves the ensemble. Accuracy also ticks up. The cost: the model is no longer a readable flowchart. Senior takeaway: **bagging buys stability and accuracy by spending interpretability**, and it does so without careful tuning, which is why RFs are the default "strong baseline."

## Bagging = Bootstrap AGGregating

Two steps:

1. **Bootstrap:** draw N samples *with replacement* from the N-row training set. Each bootstrap set is the same size but contains ~63.2% unique rows (some rows appear several times, ~36.8% appear zero times). Train one tree per bootstrap set.
2. **Aggregate:** average the predictions (regression) or majority-vote (classification).

The math that matters: if you average B identically-distributed predictions each with variance \`σ²\` and pairwise correlation \`ρ\`, the variance of the average is

\`\`\`
ρ·σ²  +  (1 − ρ)/B · σ²
\`\`\`

More trees (B↑) drives the second term to zero, but the **first term, ρ·σ², is the floor**. You cannot average away correlation. This single formula explains the whole Random Forest design.

## What makes a Random Forest more than bagged trees

Bagged trees are still **correlated**: if one feature is strongly predictive, *every* tree splits on it at the root, so they make similar mistakes — ρ stays high. Random Forests add **feature subsampling at each split**: at every node the tree may only consider a random subset of features (commonly \`√p\` for classification, \`p/3\` for regression). This **forces different trees to use different features**, lowering ρ and therefore lowering the variance floor. The price is slightly higher bias per tree (each tree is handicapped), but the variance reduction wins. That deliberate decorrelation is the "Random" in Random Forest.

| Knob | Effect | Direction to reduce overfit |
|---|---|---|
| n_estimators (B) | more trees → lower variance, never overfits in B | raise (diminishing returns + cost) |
| max_features | lower → more decorrelation, higher per-tree bias | lower toward √p |
| max_depth / min_samples_leaf | controls per-tree complexity | constrain modestly (RF tolerates deep trees) |
| bootstrap | on → enables OOB and diversity | keep on |

Crucially, **adding more trees never increases overfitting** — it only stabilizes the average. That is a key distinction from boosting.

## Out-of-bag evaluation: free cross-validation

Because each tree skips ~36.8% of rows, every training row is "out-of-bag" for roughly a third of the trees. Predict each row using **only the trees that never saw it**, aggregate, and you get the **OOB error** — an almost-unbiased generalization estimate **without a separate validation split**. Useful when data is scarce. Caveats: OOB can be noisy for small forests, and it is **not** a substitute for a proper hold-out when there is temporal structure or leakage risk.

## Random Forest vs Gradient Boosting (the inevitable follow-up)

| Axis | Random Forest (bagging) | Gradient Boosting |
|---|---|---|
| Trees built | independently, in **parallel** | sequentially, each fixes the last |
| What it reduces | **variance** (trees are low-bias) | **bias** (weak learners, low-variance) |
| Base learner | deep trees | shallow stumps/trees |
| Overfit with more trees? | **no** (averaging) | **yes** — needs early stopping |
| Tuning sensitivity | forgiving | sensitive (lr, depth, rounds) |
| Typical accuracy ceiling | strong | usually higher on tabular |

One-liner: **RF reduces variance by averaging independent strong learners; boosting reduces bias by sequentially adding weak learners.** That contrast is the single most common ensemble interview question — covered in depth in ml-s5.

## Why averaging works: the wisdom-of-crowds math

The reason a forest beats its trees is the **bias–variance decomposition of the ensemble**. Averaging B unbiased predictors leaves the **bias unchanged** (the average of unbiased estimates is unbiased) but **divides the independent part of the variance by B**. So if the trees were perfectly independent, variance would shrink toward zero and only bias would remain — and since deep trees have low bias, the ensemble would be nearly perfect. Reality intervenes through correlation ρ, which is why the design fights to keep trees diverse. This is the same statistical principle behind "ask 1000 people to guess the jar's bean count and average": individual guesses are noisy and roughly unbiased, so the average is tight. The forest engineers that independence on purpose via bootstrapping and feature subsampling.

## Extra Trees: even more randomness

A close cousin, **Extremely Randomized Trees (Extra Trees)**, pushes the decorrelation idea further: instead of searching for the *best* threshold at each split, it picks **random thresholds** and keeps the best among those random candidates, and often skips bootstrapping (trains each tree on the full set). The result is even lower correlation ρ (more variance reduction) at the cost of a bit more bias per tree, plus faster training because there is no threshold search. It is a useful alternative when an RF is still slightly overfitting or training is too slow.

## Feature importance, done right

RFs ship two importance flavors, and the interview trap is knowing their failure modes:

- **Impurity (Gini) importance** — sum of impurity decrease attributed to each feature. Fast, but **biased toward high-cardinality and continuous features** and unreliable with **correlated features** (importance gets split arbitrarily between them). Computed on training data, so it can reward overfitting.
- **Permutation importance** — shuffle one feature's values on held-out data and measure the drop in performance. Model-agnostic and far less biased, but expensive and still **misleading under correlation** (shuffling one of two correlated features changes little because the other carries the signal).
- **SHAP** — game-theoretic attribution, consistent and local (per-prediction), the modern default for explanations; costlier still.

Senior answer: never quote raw Gini importances in a stakeholder deck without checking with permutation or SHAP, and always note correlated-feature caveats.

## Tuning and deployment in practice

RFs are forgiving, which is why they are the canonical "strong baseline." Practical guidance:

- **n_estimators**: more is safer (no overfitting); set it as high as your latency/memory budget allows, then stop when OOB or CV error flattens.
- **max_features**: the real accuracy lever — lower it to decorrelate more. \`√p\` (classification) / \`p/3\` (regression) are good starts.
- **max_depth / min_samples_leaf**: RF tolerates deep trees, but capping depth bounds memory and inference latency.
- **Inference cost**: prediction means traversing all B trees, so a 500-tree forest is ~500× a single tree's latency — a real constraint for low-latency serving. This is where a single distilled tree or a boosted model with fewer trees can win operationally.
- **Parallelism**: trees are independent, so training and inference parallelize trivially across cores — a genuine advantage over sequential boosting.

## Pitfalls

- **Expecting more accuracy from infinite trees** — variance plateaus; past a few hundred trees you mostly pay compute.
- **Trusting default (impurity) feature importance** — inherits the tree's high-cardinality bias; use **permutation importance** or SHAP.
- **Forgetting correlation is the floor** — on a dataset dominated by one feature, RFs help less because trees stay correlated.
- **Ignoring inference latency** — hundreds of deep trees can be too slow for real-time serving.
- **Using shallow trees in an RF** — RF wants high-variance base learners; stumps make a *boosting* base, not a bagging base.

## Interview questions

- "Why does a Random Forest need *deep* (overfit) trees but boosting needs *shallow* ones?" (Bagging reduces variance of low-bias learners; boosting reduces bias of low-variance learners.)
- "Bagging averages away variance — what's the limit?" (The ρ·σ² correlation floor; feature subsampling lowers ρ.)
- "What is OOB error and when would you rely on it?" (Free validation from the ~37% unseen rows; scarce-data settings, but not for temporal/leaky data.)
- "Will adding more trees ever overfit a Random Forest?" (No — it stabilizes the average; contrast with boosting.)
- "How do Extra Trees differ from a Random Forest?" (Random thresholds, often no bootstrap → lower ρ, faster, slightly more bias.)
- "Why are impurity-based importances risky and what do you use instead?" (High-cardinality + correlation bias; prefer permutation importance or SHAP.)`,
    video: null,
    videoFallbackMarkdown: `## Deep dive without video (10 min, formula + the lab)

1. **Internalize the variance formula.** Write \`Var = ρσ² + (1−ρ)σ²/B\`. Set ρ = 0.5, σ² = 1: at B = 10 the variance is 0.55; at B = ∞ it is 0.5. Conclude: trees → ∞ cannot beat the correlation floor, so we must lower ρ (feature subsampling).
2. **Watch the boundary smooth.** In the bagging lab, slide the number of trees up and narrate how the jagged single-tree boundary becomes a smooth ensemble boundary as variance drops.
3. **Two sentences:** "Bagging reduces ___ by averaging ___ learners. Feature subsampling helps because ___." Fill and rehearse.`,
    tryGuidance: `Predict how the decision boundary changes as you raise the number of trees from 1 to many, then verify in the lab — watch the jagged single-tree boundary smooth out as variance falls toward the correlation floor.`,
    interviewGraph: {
            initialStageId: "s4_features_click",
            artifactDimensions: [
              {
                label: "Bootstrap & OOB",
                recoveryStageId: "s4_recovery_oob",
              },
              {
                label: "Feature Importance Caveats",
                recoveryStageId: "s4_recovery_importance",
              },
              {
                label: "Bagging Theory",
                recoveryStageId: "s4_recovery_bagging",
                passLabel: "Random Forest Mastery",
              },
            ],
            stages: {
              s4_features_click: {
                id: "s4_features_click",
                type: "click_target",
                badge: "Stage 1",
                title: "Stage 1 · Correlated Trees",
                prompt: "The following random forest is constructed in a way that maximises correlation between individual trees, defeating the purpose of the ensemble. Click the line responsible.",
                code_snippet: `from sklearn.ensemble import RandomForestClassifier

model = RandomForestClassifier(
    n_estimators=100,
    max_features=None,   # ds-target:all_features
    bootstrap=True,
    random_state=42
)
model.fit(X_train, y_train)`,
                validationCopy: {
                  all_features: "Correct. max_features=None means every tree considers all features at every split. This makes trees highly correlated — they all tend to pick the same dominant features early. The power of random forests comes from max_features='sqrt' (or 'log2'), which forces each tree to find the best split among a random subset of features, decorrelating the ensemble.",
                },
                branches: {
                  all_features: "s4_oob_choice",
                },
              },
              s4_oob_choice: {
                id: "s4_oob_choice",
                type: "scenario_choice",
                badge: "Stage 2",
                title: "Stage 2 · Out-of-Bag Score",
                prompt: "A random forest reports an OOB score of 0.82. What does this mean, and when is it preferable to a separate validation set?",
                code_snippet: `model = RandomForestClassifier(
    n_estimators=200,
    oob_score=True,
    random_state=42
)
model.fit(X_train, y_train)
print(model.oob_score_)  # 0.82`,
                choices: [
                  {
                    id: "a",
                    label: "OOB score = training accuracy on 82% of the data that was bootstrapped",
                    description: "OOB score is estimated on samples NOT in each tree's bootstrap sample, not on the bootstrap sample itself.",
                  },
                  {
                    id: "b",
                    label: "OOB score estimates generalisation accuracy using samples not seen by each tree; useful when data is too small to withhold a validation set",
                    description: "Each bootstrap sample omits ~37% of training rows (OOB samples). Each tree is used to predict only its OOB samples. The aggregate is an almost-unbiased generalisation estimate — no data is 'wasted' on a validation split.",
                  },
                  {
                    id: "c",
                    label: "OOB score is the same as k-fold cross-validation accuracy",
                    description: "OOB and k-fold are both unbiased generalisation estimates but computed differently. OOB is specific to bagging ensembles.",
                  },
                  {
                    id: "d",
                    label: "OOB score only works for classification, not regression",
                    description: "OOB scoring works for both RandomForestClassifier and RandomForestRegressor.",
                  },
                ],
                branches: {
                  a: "s4_recovery_oob",
                  b: "s4_corr_importance_choice",
                  c: "s4_recovery_oob",
                  d: "s4_recovery_oob",
                },
                rationale: "With bootstrap sampling, each tree sees ~63% of training rows. The remaining ~37% (OOB samples) are used to evaluate that tree. Averaging across all trees gives the OOB score — a low-bias estimate of generalisation performance at no extra computational cost. Particularly valuable for small datasets.",
              },
              s4_corr_importance_choice: {
                id: "s4_corr_importance_choice",
                type: "scenario_choice",
                badge: "Stage 3",
                title: "Stage 3 · Feature Importance with Correlated Features",
                prompt: "Random forest feature importances: feature A=0.45, feature B=0.30, everything else near 0. Features A and B have correlation=0.92. Is this importance ranking reliable?",
                code_snippet: `import pandas as pd
fi = pd.Series(
    model.feature_importances_,
    index=feature_names
).sort_values(ascending=False)
# A: 0.45, B: 0.30, C: 0.03, ...
# corr(A, B) = 0.92`,
                choices: [
                  {
                    id: "a",
                    label: "Yes — A is roughly 1.5x as important as B based on MDI",
                    description: "When A and B are highly correlated, their MDI importances are split arbitrarily between them. The true combined importance is roughly 0.75, but the split 0.45/0.30 is unreliable.",
                  },
                  {
                    id: "b",
                    label: "No — correlated features split MDI importance between them; the individual rankings are unreliable; use SHAP or permutation importance",
                    description: "When two features carry similar information, trees randomly choose between them. Each individual MDI looks smaller than the true feature contribution. SHAP values account for feature interactions and are more reliable.",
                  },
                  {
                    id: "c",
                    label: "Drop feature B since its importance is lower",
                    description: "B may carry as much predictive information as A — the lower MDI is an artifact of their correlation, not a reliable signal of lower importance.",
                  },
                  {
                    id: "d",
                    label: "Run the model again with a different random_state to get stable importances",
                    description: "Different random seeds will redistribute the 0.45/0.30 split arbitrarily between A and B — the instability is the problem, not a fixable side-effect.",
                  },
                ],
                branches: {
                  a: "s4_recovery_importance",
                  b: "s4_interpretability_choice",
                  c: "s4_recovery_importance",
                  d: "s4_recovery_importance",
                },
                rationale: "MDI (Mean Decrease Impurity) is biased for correlated features: when A and B carry the same information, each tree may split on either one, distributing the importance arbitrarily. The combined importance (≈0.75) is meaningful but the 0.45 vs 0.30 split is not. Use permutation importance or SHAP (which handles collinearity via Shapley values) for reliable rankings.",
              },
              s4_interpretability_choice: {
                id: "s4_interpretability_choice",
                type: "scenario_choice",
                badge: "Stage 4",
                title: "Stage 4 · RF vs Gradient Boosting for Interpretability",
                prompt: "A stakeholder needs both predictive accuracy and interpretability. You are choosing between Random Forest and Gradient Boosting. What is the right framing?",
                code_snippet: `from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
import shap

rf = RandomForestClassifier(n_estimators=200)
gb = GradientBoostingClassifier(n_estimators=200, learning_rate=0.05)`,
                choices: [
                  {
                    id: "a",
                    label: "Random forest is interpretable; gradient boosting is not",
                    description: "Neither is directly interpretable as a black box; both require SHAP or similar post-hoc tools.",
                  },
                  {
                    id: "b",
                    label: "Gradient boosting typically wins on accuracy; random forest is faster and parallelisable; both need SHAP for interpretability",
                    description: "Gradient boosting sequentially corrects errors and often achieves better accuracy. Random forests train trees in parallel and are more robust to hyperparameter choices. For interpretability, use SHAP for either model.",
                  },
                  {
                    id: "c",
                    label: "Use a single decision tree for interpretability — ensembles are always black boxes",
                    description: "A single shallow tree is interpretable but sacrifices accuracy. SHAP allows ensembles to be interpreted nearly as well.",
                  },
                  {
                    id: "d",
                    label: "Random forest always outperforms gradient boosting on tabular data",
                    description: "Gradient boosting (XGBoost, LightGBM) typically outperforms random forests on tabular data in practice.",
                  },
                ],
                branches: {
                  a: "s4_recovery_bagging",
                  b: "s4_terminal",
                  c: "s4_recovery_bagging",
                  d: "s4_recovery_bagging",
                },
                rationale: "Gradient boosting generally achieves higher accuracy on tabular data by sequentially correcting residuals. Random forests are parallelisable, faster to train, and less sensitive to hyperparameters. Both are 'black boxes' without tools like SHAP; SHAP provides consistent, additive feature attribution for any ensemble.",
              },
              s4_recovery_oob: {
                id: "s4_recovery_oob",
                type: "scenario_choice",
                badge: "Recovery 1",
                title: "Recovery · Bootstrap Sampling",
                prompt: "A random forest uses bootstrap sampling. Approximately what fraction of training samples is NOT included in a single bootstrap sample (i.e., the OOB fraction)?",
                code_snippet: `# Bootstrap: sample n rows WITH replacement from n rows
import numpy as np

n = 1000
bootstrap_idx = np.random.choice(n, size=n, replace=True)
oob_fraction = len(set(range(n)) - set(bootstrap_idx)) / n
# What is the expected value of oob_fraction?`,
                choices: [
                  {
                    id: "a",
                    label: "~50% — half the data is left out",
                    description: "The probability that a specific row is omitted from a bootstrap sample approaches 1/e ≈ 0.368, not 0.5.",
                  },
                  {
                    id: "b",
                    label: "~37% — because (1 - 1/n)^n → 1/e ≈ 0.368 as n→∞",
                    description: "The probability that a single row is never selected in n draws with replacement = (1-1/n)^n → e^(-1) ≈ 0.368. So about 37% of rows are OOB for each tree.",
                  },
                  {
                    id: "c",
                    label: "~10% — most data is used",
                    description: "Bootstrap samples have substantial overlap but not 90% coverage; approximately 63% are included, 37% excluded.",
                  },
                  {
                    id: "d",
                    label: "Exactly 0% — bootstrap uses all rows by definition",
                    description: "Bootstrap samples n rows WITH replacement, meaning some rows appear multiple times and others not at all (~37% excluded).",
                  },
                ],
                branches: {
                  a: "s4_recovery_oob",
                  b: "s4_corr_importance_choice",
                  c: "s4_recovery_oob",
                  d: "s4_recovery_oob",
                },
                rationale: "(1 - 1/n)^n → e^(-1) ≈ 0.368 as n → ∞. For practical sample sizes (n≥100), about 37% of training rows are OOB for each tree. This is why OOB score is a nearly unbiased generalisation estimate — each row is evaluated only by trees that did not train on it.",
              },
              s4_recovery_importance: {
                id: "s4_recovery_importance",
                type: "scenario_choice",
                badge: "Recovery 2",
                title: "Recovery · Permutation Importance",
                prompt: "You suspect MDI importance is unreliable for your dataset. How does permutation importance work, and what are its advantages?",
                code_snippet: `from sklearn.inspection import permutation_importance

result = permutation_importance(
    model, X_val, y_val,
    n_repeats=10,
    random_state=42
)
# Shuffles each feature column, measures accuracy drop`,
                choices: [
                  {
                    id: "a",
                    label: "Permutation importance retrains the model with each feature removed",
                    description: "That would be LOCO (Leave-One-Covariate-Out) importance, not permutation importance. Permutation importance does not retrain.",
                  },
                  {
                    id: "b",
                    label: "Shuffles each feature column, measures accuracy drop on validation data; avoids MDI bias and works on any model",
                    description: "By randomly permuting feature j, you break its relationship with the target. The drop in validation accuracy measures how much the model relied on feature j. Works on any model, measures validation-time importance.",
                  },
                  {
                    id: "c",
                    label: "Computes the correlation between each feature and the model output",
                    description: "Correlation measures linear association, not the non-linear contribution captured by permutation importance.",
                  },
                  {
                    id: "d",
                    label: "Same as MDI but computed on validation data instead of training data",
                    description: "Permutation importance is algorithmically different from MDI — it measures accuracy drop after shuffling, not impurity decrease during training.",
                  },
                ],
                branches: {
                  a: "s4_recovery_importance",
                  b: "s4_interpretability_choice",
                  c: "s4_recovery_importance",
                  d: "s4_recovery_importance",
                },
                rationale: "Permutation importance: for each feature j, randomly shuffle its values in the validation set, re-evaluate the model, and record the accuracy drop. Advantages: (1) works on any model, (2) measures test-time importance (not training-time), (3) less biased for correlated/high-cardinality features than MDI.",
              },
              s4_recovery_bagging: {
                id: "s4_recovery_bagging",
                type: "scenario_choice",
                badge: "Recovery 3",
                title: "Recovery · Why Averaging Reduces Variance",
                prompt: "You average 100 independent decision trees, each with variance σ². What is the variance of the average, and what assumption is violated in a random forest?",
                code_snippet: `# If trees are independent with variance σ²:
# Var(average) = σ²/n   ← n=100 trees
# But in a random forest, trees share training data
# and use similar features → trees are correlated`,
                choices: [
                  {
                    id: "a",
                    label: "Variance = σ²/100; random forests achieve this because bootstrap makes trees independent",
                    description: "Bootstrap reduces but does not eliminate correlation — trees trained on overlapping data are still correlated.",
                  },
                  {
                    id: "b",
                    label: "Variance = σ²/100 only for independent trees; with correlation ρ, Var = ρσ² + (1-ρ)σ²/n — random forests reduce ρ via random feature selection but cannot reach σ²/100",
                    description: "Correct. The variance of an average of n correlated trees = ρσ² + (1-ρ)σ²/n. Even with n→∞, variance does not go below ρσ². Reducing ρ (via max_features) is as important as increasing n.",
                  },
                  {
                    id: "c",
                    label: "Variance stays at σ² — averaging correlated trees does not help",
                    description: "Even correlated trees reduce variance compared to a single tree, just not as much as independent trees would.",
                  },
                  {
                    id: "d",
                    label: "Variance = 0 for sufficiently many trees",
                    description: "Averaging correlated estimators has an irreducible variance floor of ρσ² > 0.",
                  },
                ],
                branches: {
                  a: "s4_recovery_bagging",
                  b: "s4_terminal",
                  c: "s4_recovery_bagging",
                  d: "s4_recovery_bagging",
                },
                rationale: "For n correlated estimators with pairwise correlation ρ and variance σ²: Var(mean) = ρσ² + (1-ρ)σ²/n. As n→∞, Var → ρσ². Random forests reduce ρ via random feature subsets (max_features), which is why this hyperparameter is critical. More trees (n) reduces the second term; lower correlation (smaller ρ) reduces the floor.",
              },
              s4_terminal: {
                id: "s4_terminal",
                type: "scenario_choice",
                badge: "Terminal",
                title: "Revision complete · Random Forest Mastered",
                terminal: true,
                prompt: "Why does increasing n_estimators in a random forest reduce variance but not bias? What is the theoretical guarantee, and when does adding more trees stop helping?",
                code_snippet: `from sklearn.ensemble import RandomForestClassifier

for n in [10, 50, 100, 500, 1000]:
    rf = RandomForestClassifier(n_estimators=n, random_state=42)
    rf.fit(X_train, y_train)
    # val score stabilises after ~200 trees`,
                choices: [
                  {
                    id: "a",
                    label: "More trees = more bias reduction — each tree is weaker so the average has lower bias",
                    description: "Individual tree bias does not change with n_estimators. Each tree has the same expected value; averaging more of them does not shift that expectation.",
                  },
                  {
                    id: "b",
                    label: "Averaging reduces variance (Var ∝ 1/n for independent estimators) but each tree is still an unregularised (high-bias or low-bias) estimator; the average's bias = a single tree's bias; gains diminish once variance is low",
                    description: "The expectation of the average equals the expectation of a single tree, so bias is unchanged. Variance decreases as Var ∝ ρσ² + (1-ρ)σ²/n. After ~200-500 trees, the variance term is negligible and extra trees yield diminishing returns.",
                  },
                  {
                    id: "c",
                    label: "More trees reduce both bias and variance — always use as many trees as computationally feasible",
                    description: "Bias is not reduced by adding trees. Beyond a threshold (~200-500 trees), variance gains are negligible.",
                  },
                  {
                    id: "d",
                    label: "The theoretical guarantee is that with infinite trees a random forest converges to the Bayes error rate",
                    description: "The law-of-large-numbers guarantee is that the average converges in variance, not that it achieves Bayes error. Bayes error depends on the individual trees' bias.",
                  },
                ],
                branches: {
                  a: "s4_terminal",
                  b: "s4_terminal",
                  c: "s4_terminal",
                  d: "s4_terminal",
                },
                rationale: "E[mean of n trees] = E[single tree] → bias is identical to one tree. Var[mean] = ρσ² + (1-ρ)σ²/n → decreases with n. The law of large numbers guarantees convergence of the average, but to the expected value of a single tree (which may be biased). Adding trees beyond ~200-500 yields diminishing variance reduction while cost grows linearly.",
              },
            },
          },
    knowledgeCheck: [
      {
        question: "Bagging primarily reduces which error component, and what base learner does it therefore want?",
        options: [
          "Bias; it wants shallow, high-bias learners",
          "Variance; it wants deep, low-bias (high-variance) learners like full decision trees",
          "Irreducible error; the base learner does not matter",
        ],
        correctIndex: 1,
        explanation: "Averaging cancels independent errors, cutting variance. It needs low-bias/high-variance base learners (deep trees); shallow stumps are for boosting.",
      },
      {
        question: "What does feature subsampling at each split add beyond plain bagged trees?",
        options: [
          "It speeds up training but changes nothing statistically",
          "It decorrelates the trees (lowers ρ), reducing the variance floor that pure bagging cannot beat",
          "It guarantees the trees are identical",
        ],
        correctIndex: 1,
        explanation: "Bagged trees all split on the dominant feature and stay correlated. Restricting candidate features per split forces diversity, lowering ρ and thus the ρσ² variance floor.",
      },
      {
        question: "In a bootstrap sample of N rows drawn with replacement, roughly what fraction of unique original rows appears?",
        options: [
          "About 63.2%, leaving ~36.8% out-of-bag",
          "About 100%",
          "Exactly 50%",
        ],
        correctIndex: 0,
        explanation: "P(a given row is never picked) ≈ (1−1/N)^N → 1/e ≈ 0.368, so ~63.2% of rows are included and ~36.8% are out-of-bag.",
      },
      {
        question: "The variance of an average of B correlated trees is ρσ² + (1−ρ)σ²/B. What does this imply?",
        options: [
          "Adding trees can drive variance to zero regardless of ρ",
          "As B grows, variance approaches the floor ρσ²; you must reduce correlation ρ to go lower",
          "Variance is independent of the number of trees",
        ],
        correctIndex: 1,
        explanation: "The second term vanishes as B→∞, but the ρσ² floor remains. Lowering ρ (via feature subsampling) is the only way past it.",
      },
      {
        question: "What is the out-of-bag (OOB) error estimate?",
        options: [
          "Error on a separate test set you must hold out",
          "Error computed by predicting each row with only the trees whose bootstrap sample excluded it — a near-free validation estimate",
          "The training error of the deepest tree",
        ],
        correctIndex: 1,
        explanation: "Each row is unseen by ~37% of trees; aggregating those predictions gives an almost-unbiased generalization estimate without a dedicated split.",
      },
      {
        question: "Will increasing n_estimators (number of trees) eventually cause a Random Forest to overfit?",
        options: [
          "No — more trees stabilize the average; variance plateaus and you mainly pay compute",
          "Yes, just like adding rounds to gradient boosting",
          "Yes, but only if bootstrap is enabled",
        ],
        correctIndex: 0,
        explanation: "Averaging more independent trees cannot increase overfitting; it converges. This is a key contrast with boosting, where extra rounds can overfit and need early stopping.",
      },
      {
        question: "On a dataset dominated by one extremely predictive feature, why might a Random Forest help less than usual?",
        options: [
          "Because OOB error is undefined",
          "Because every tree keeps splitting on that feature, so correlation ρ stays high and the variance floor stays high",
          "Because bootstrap sampling fails",
        ],
        correctIndex: 1,
        explanation: "When one feature dominates, even feature subsampling often leaves it selected, so trees remain correlated and the ρσ² floor limits the variance reduction.",
      },
      {
        question: "Which statement best contrasts Random Forests with gradient boosting?",
        options: [
          "Both build trees sequentially to reduce bias",
          "RF builds independent deep trees in parallel to reduce variance; boosting builds shallow trees sequentially to reduce bias",
          "RF reduces bias while boosting reduces variance",
        ],
        correctIndex: 1,
        explanation: "Bagging/RF averages strong independent learners (variance reduction, parallel); boosting adds weak learners that each correct the prior residuals (bias reduction, sequential).",
      },
    ],
  },

  "ml-s5": {
    durationLabel: "18–20 min",
    outcomes: [
      "Explain boosting as **stage-wise additive modeling** that fits each new tree to the **negative gradient (pseudo-residuals)** of the loss.",
      "Tune the central trade-off: small **learning rate** + many rounds + **early stopping**, and why shrinkage regularizes.",
      "Name the engineering ideas that make **XGBoost** and **LightGBM** fast and accurate — regularized objective, second-order info, histogram binning, leaf-wise growth, **GOSS/EFB**.",
      "Decide between **gradient boosting and Random Forests** by bias/variance, tuning effort, and data shape.",
    ],
    learnMarkdown: `## The mental model: a relay of specialists, each fixing the last one's mistakes

Random Forests build trees **in parallel** and average them (ml-s4). Gradient boosting builds trees **sequentially**: each new tree is trained to fix the errors the current ensemble still makes. Start with a constant prediction; compute what's left over (the residual); fit a small tree to that; add a shrunken version of it; repeat. The ensemble grows by **stage-wise addition**:

\`\`\`
F₀(x) = constant
Fₘ(x) = Fₘ₋₁(x) + η · hₘ(x)
\`\`\`

where \`hₘ\` is a weak learner (a shallow tree) and \`η\` is the learning rate. Where bagging attacks **variance**, boosting attacks **bias** by relentlessly adding capacity in the direction the loss is still wrong.

## Motivation (a tabular Kaggle that a forest could not crack)

A demand-forecasting team plateaus at a Random Forest's accuracy. The residuals show a clear remaining pattern — the forest *averaged away* the noise but never *targeted* the structured error. They switch to gradient boosting: each tree explicitly fits the current residuals, and error drops below the RF. The cost is real: boosting is **easy to overfit** and far more sensitive to hyperparameters. Senior takeaway: on structured/tabular data, **well-tuned gradient boosting is usually the accuracy leader**, but it trades the RF's "set-and-forget" robustness for tuning discipline and early stopping.

## "Gradient" boosting: residuals are the gradient

For squared-error loss, the residual \`y − F(x)\` *is* the negative gradient of the loss w.r.t. the prediction. Gradient boosting generalizes this: for **any** differentiable loss, each new tree fits the **negative gradient of the loss evaluated at the current predictions** — the **pseudo-residuals**. That is the unifying idea:

\`\`\`
pseudo-residual = − ∂L(y, F) / ∂F   evaluated at F = Fₘ₋₁
\`\`\`

So boosting is **gradient descent in function space**: each tree is one step downhill on the loss, with the step direction approximated by a tree. Swap the loss (logistic, Huber, quantile, ranking) and the same machinery handles classification, robust regression, and ranking.

## The learning rate is the master knob

\`η\` (shrinkage) scales each tree's contribution. Small η means each tree corrects only a little, so you need **more rounds**, but the ensemble generalizes better — shrinkage is a **regularizer** that prevents any single tree from dominating. The canonical recipe: **low learning rate (0.01–0.1), many trees, and early stopping** on a validation set to pick the number of rounds automatically.

| Hyperparameter | Effect | Overfit if… |
|---|---|---|
| learning_rate (η) | step size per tree | too high → overshoots, memorizes |
| n_estimators / rounds | total capacity | too many without early stopping |
| max_depth / num_leaves | per-tree complexity | too deep → high-variance steps |
| subsample / colsample | stochastic boosting | (lowering these *helps* generalization) |
| reg_lambda / reg_alpha | L2/L1 on leaf weights | (raising these *helps*) |
| min_child_weight | min data per leaf | too low → tiny noisy leaves |

**Early stopping** is non-negotiable: train while validation loss improves, stop after \`k\` rounds of no improvement, keep the best iteration. It is how you choose n_estimators without a grid search and the main guard against boosting's overfitting tendency.

## What XGBoost and LightGBM actually contribute

The algorithm is decades old; these libraries made it fast and well-regularized:

- **Regularized objective.** XGBoost adds an explicit penalty on leaf count and leaf-weight magnitude to the loss, so each split must earn its complexity — overfitting control baked into the objective.
- **Second-order optimization.** XGBoost uses both the gradient *and the Hessian* (a Newton step), giving better split scoring than first-order residual fitting.
- **Histogram binning.** Continuous features are bucketed into ~255 bins, so split-finding scans bins, not every value — a large constant-factor speedup (LightGBM popularized this; XGBoost added \`hist\`).
- **Leaf-wise vs level-wise growth.** LightGBM grows the **leaf with the largest loss reduction** (leaf-wise), reaching lower loss faster but risking deeper, overfit trees — control with \`num_leaves\` / \`max_depth\`. XGBoost defaults to level-wise.
- **GOSS** (Gradient-based One-Side Sampling): keep the large-gradient (hard) examples, subsample the small-gradient (easy) ones — speed without much accuracy loss.
- **EFB** (Exclusive Feature Bundling): bundle rarely-co-occurring sparse features (e.g. one-hots) into one, shrinking feature count.
- **Native missing-value handling.** Each split learns a default direction for NaNs instead of requiring imputation.

CatBoost adds **ordered boosting** and strong categorical handling to fight a subtle target-leakage in greedy boosting.

## Random Forest vs Gradient Boosting (the decision)

| Choose RF when | Choose GBM when |
|---|---|
| you want a robust baseline with little tuning | you need the last few points of accuracy |
| training must be embarrassingly parallel | sequential training is acceptable |
| you fear overfitting and won't babysit | you'll tune lr/depth + use early stopping |
| noisy labels (averaging is forgiving) | clean-ish tabular data with structure |

One-liner: **RF averages independent low-bias trees to cut variance; GBM adds weak trees sequentially to cut bias — and therefore needs early stopping while RF does not.**

## A concrete pass through one round

Start with \`F₀(x) = ȳ\`, the mean target. Compute each row's residual \`rᵢ = yᵢ − F₀(xᵢ)\`. Fit a shallow tree \`h₁\` to predict those residuals — it learns *where the mean is wrong and in which direction*. Update \`F₁ = F₀ + η·h₁\`. With \`η = 0.1\`, you only take a tenth of the correction, so \`F₁\` is barely better than the mean — but now recompute residuals against \`F₁\` and fit \`h₂\` to *those*, and so on. After many rounds the sum of shrunken trees traces the target. The visualization makes this literal: each click shrinks the red residual bars. Crucially, a row that is already well-predicted has a near-zero residual, so later trees **ignore it and focus on the hard cases** — the opposite of bagging, where every tree sees a fresh random view of everything.

## Stochastic boosting and other regularizers

Beyond shrinkage and early stopping, three more knobs fight overfitting:

- **Row subsampling (\`subsample\` < 1)** — fit each tree on a random fraction of rows (stochastic gradient boosting). Adds randomness, reduces variance, and speeds training.
- **Column subsampling (\`colsample_bytree\`)** — like a Random Forest's feature subsampling, per tree or per split, decorrelating the weak learners.
- **L1/L2 penalties on leaf weights (\`reg_alpha\`, \`reg_lambda\`)** — shrink leaf outputs directly, keeping individual corrections small.

The mental model: boosting has *many* ways to regularize, and they stack. A well-tuned GBM is a careful balance of learning rate, depth, subsampling, and penalties, validated by early stopping.

## AdaBoost vs gradient boosting (the lineage)

The original **AdaBoost** is a special case: it reweights *misclassified examples* upward each round and combines learners by a weighted vote, which turns out to be gradient boosting on the **exponential loss**. Gradient boosting generalized this to *any* differentiable loss by fitting pseudo-residuals, which is why it dominates today — you can plug in logistic loss for classification, squared/Huber loss for regression, or a ranking loss (LambdaMART) for search ranking, all with the same machinery. If asked "how does AdaBoost relate to gradient boosting?", that one sentence — *AdaBoost is gradient boosting with exponential loss and example reweighting* — is the senior answer.

## Pitfalls

- **High learning rate with few trees** — coarse steps that overshoot and overfit; prefer low η + early stopping.
- **No early stopping / no validation set** — boosting will happily memorize.
- **Leaf-wise growth without a leaf cap** — LightGBM can grow very deep, unbalanced trees and overfit.
- **Boosting on tiny, noisy data** — it chases noise; an RF or regularized linear model may generalize better.
- **Tuning hyperparameters on the same data used for early stopping** — leaks the validation signal; keep a separate test set.
- **Assuming GBM is always best** — on small or label-noisy data, RF's averaging often wins with far less effort.

## Interview questions

- "What is the 'gradient' in gradient boosting?" (Each tree fits the negative gradient of the loss — pseudo-residuals — i.e. gradient descent in function space.)
- "Why low learning rate + many trees + early stopping?" (Shrinkage regularizes; early stopping picks the optimal round and prevents overfitting.)
- "How does boosting differ from bagging in what it reduces?" (Bias vs variance; sequential vs parallel; overfits with more rounds vs does not.)
- "Name two reasons LightGBM is fast." (Histogram binning + leaf-wise growth; plus GOSS/EFB.)
- "When would you pick a Random Forest over XGBoost?" (Robust baseline, minimal tuning, noisy labels, parallel training.)`,
    video: null,
    videoFallbackMarkdown: `## Deep dive without video (10 min, the lab + a residual trace)

1. **Watch residuals shrink.** In the boosting lab, click to add one weak learner at a time and read the residual magnitude after each. Predict, before the next click, that the largest remaining errors will be targeted next.
2. **Feel the learning rate.** Set η high and add a few trees: the fit overshoots and gets jagged. Set η low: each step is gentle and you need more rounds — that is shrinkage as regularization.
3. **Two sentences:** "Boosting fits each tree to the ___ of the loss. I prevent overfitting with ___ and ___." Fill and rehearse.`,
    tryGuidance: `Predict how many weak learners it takes before the fit tracks the curve, then step through the lab adding one at a time. Now raise the learning rate and predict whether you'll need more or fewer trees — and whether overfitting risk goes up.`,
    interviewGraph: {
            initialStageId: "s5_no_early_stop_click",
            artifactDimensions: [
              {
                label: "Learning Rate vs n_estimators",
                recoveryStageId: "s5_recovery_lr",
              },
              {
                label: "Early Stopping",
                recoveryStageId: "s5_recovery_early_stop",
              },
              {
                label: "XGBoost Regularisation",
                recoveryStageId: "s5_recovery_reg",
                passLabel: "Gradient Boosting Mastery",
              },
            ],
            stages: {
              s5_no_early_stop_click: {
                id: "s5_no_early_stop_click",
                type: "click_target",
                badge: "Stage 1",
                title: "Stage 1 · Missing Early Stopping",
                prompt: "The following XGBoost training loop is at high risk of overfitting. Click the line most responsible for the risk.",
                code_snippet: `import xgboost as xgb

model = xgb.XGBClassifier(
    n_estimators=500,
    learning_rate=0.3,   # ds-target:high_lr_no_stop
    max_depth=6,
    use_label_encoder=False,
    eval_metric='logloss'
)
model.fit(X_train, y_train)
# No early_stopping_rounds, no eval_set`,
                validationCopy: {
                  high_lr_no_stop: "Correct. learning_rate=0.3 with n_estimators=500 and no early stopping is a recipe for overfitting. A high learning rate means each tree makes large corrections; without early stopping the model will keep fitting noise. Fix: add early_stopping_rounds=50 and an eval_set=[(X_val, y_val)] so training halts when validation loss stops improving.",
                },
                branches: {
                  high_lr_no_stop: "s5_lgbm_choice",
                },
              },
              s5_lgbm_choice: {
                id: "s5_lgbm_choice",
                type: "scenario_choice",
                badge: "Stage 2",
                title: "Stage 2 · XGBoost vs LightGBM",
                prompt: "You have a dataset with 5 million rows and 200 features. Should you use XGBoost or LightGBM, and what is the key algorithmic difference?",
                code_snippet: `# XGBoost: level-wise tree growth
# LightGBM: leaf-wise tree growth + histogram binning
import lightgbm as lgb
import xgboost as xgb`,
                choices: [
                  {
                    id: "a",
                    label: "XGBoost — it is more accurate on large datasets",
                    description: "LightGBM is generally faster and often matches or exceeds XGBoost accuracy on large tabular datasets.",
                  },
                  {
                    id: "b",
                    label: "LightGBM — histogram-based binning reduces feature values to discrete bins; leaf-wise growth is faster and uses less memory on large datasets",
                    description: "LightGBM bins continuous features into ~255 bins (histogram), dramatically reducing computation. Leaf-wise growth expands the leaf with the highest gain, producing deeper unbalanced trees more efficiently than XGBoost's level-wise approach.",
                  },
                  {
                    id: "c",
                    label: "They are identical in speed and accuracy — choose based on API preference",
                    description: "LightGBM is substantially faster on large datasets due to GOSS (Gradient-based One-Side Sampling) and histogram binning.",
                  },
                  {
                    id: "d",
                    label: "XGBoost — LightGBM is only for ranking problems",
                    description: "LightGBM handles classification, regression, and ranking. It is not limited to ranking.",
                  },
                ],
                branches: {
                  a: "s5_recovery_lr",
                  b: "s5_val_loss_choice",
                  c: "s5_recovery_lr",
                  d: "s5_recovery_lr",
                },
                rationale: "LightGBM advantages on large data: (1) Histogram binning: O(#bins) instead of O(#unique values) for split finding. (2) Leaf-wise growth: finds the best leaf to expand, achieving lower loss faster. (3) GOSS: down-samples low-gradient instances. Together these make LightGBM 5-20x faster than XGBoost on large datasets.",
              },
              s5_val_loss_choice: {
                id: "s5_val_loss_choice",
                type: "scenario_choice",
                badge: "Stage 3",
                title: "Stage 3 · Early Stopping",
                prompt: "Training loss decreases every round. Validation loss decreases until round 45, then starts increasing. What is the correct action?",
                code_snippet: `evals_result = {}
model = xgb.XGBClassifier(
    n_estimators=200,
    learning_rate=0.1,
    early_stopping_rounds=20,
    eval_metric='logloss'
)
model.fit(
    X_train, y_train,
    eval_set=[(X_val, y_val)],
    verbose=True
)
print(model.best_iteration)  # → 45`,
                choices: [
                  {
                    id: "a",
                    label: "Continue training — val loss may decrease again after round 45",
                    description: "If val loss increases for 20+ consecutive rounds after round 45, it is overfitting. More rounds will likely make it worse.",
                  },
                  {
                    id: "b",
                    label: "Use early_stopping_rounds to stop at the best validation round and set n_estimators=best_iteration for final model",
                    description: "early_stopping_rounds=20 stops training when val loss has not improved for 20 rounds. model.best_iteration gives the optimal number of trees. For the final model, retrain with n_estimators=45 or use model.predict with iteration_range=(0, model.best_iteration).",
                  },
                  {
                    id: "c",
                    label: "Increase learning_rate to converge faster and avoid the overfitting region",
                    description: "Higher learning rate makes overfitting worse, not better — each tree makes larger corrections, overfitting the noise faster.",
                  },
                  {
                    id: "d",
                    label: "Add more data — overfitting is always a data size problem",
                    description: "More data helps but is not always available. Early stopping is a direct and effective remedy.",
                  },
                ],
                branches: {
                  a: "s5_recovery_early_stop",
                  b: "s5_reg_choice",
                  c: "s5_recovery_early_stop",
                  d: "s5_recovery_early_stop",
                },
                rationale: "The divergence between training and validation loss after round 45 is the classic overfitting signature. Early stopping: stop adding trees when validation metric stops improving for N rounds (patience). best_iteration=45 is the optimal model. For deployment: use n_estimators=45 or XGBoost's predict with ntree_limit=45.",
              },
              s5_reg_choice: {
                id: "s5_reg_choice",
                type: "scenario_choice",
                badge: "Stage 4",
                title: "Stage 4 · XGBoost Regularisation Parameters",
                prompt: "XGBoost has alpha (L1) and lambda (L2) regularisation parameters. What does each penalise, and what is the practical effect?",
                code_snippet: `model = xgb.XGBClassifier(
    n_estimators=100,
    reg_alpha=0.5,    # L1 regularisation
    reg_lambda=1.0,   # L2 regularisation
    learning_rate=0.1
)`,
                choices: [
                  {
                    id: "a",
                    label: "alpha=L1 penalises large individual leaf weights (induces sparsity); lambda=L2 penalises all weights smoothly (prevents any weight from being too large)",
                    description: "In XGBoost's objective: Ω(f) = γT + ½λΣwⱼ² + αΣ|wⱼ| where T=number of leaves, wⱼ=leaf weights. L1 (alpha) encourages sparse leaf weights; L2 (lambda) smoothly shrinks all leaf weights.",
                  },
                  {
                    id: "b",
                    label: "alpha controls tree depth; lambda controls the number of trees",
                    description: "max_depth controls tree depth; n_estimators controls tree count. alpha and lambda are weight regularisation terms.",
                  },
                  {
                    id: "c",
                    label: "Both do the same thing — use one or the other, not both",
                    description: "L1 and L2 have different mathematical properties and can be used together. XGBoost defaults: alpha=0, lambda=1.",
                  },
                  {
                    id: "d",
                    label: "lambda=L1 (lasso) and alpha=L2 (ridge) — note the reversed naming",
                    description: "In XGBoost: alpha=L1, lambda=L2. This matches the mathematical convention (α for L1 in elastic net terminology used by XGBoost).",
                  },
                ],
                branches: {
                  a: "s5_terminal",
                  b: "s5_recovery_reg",
                  c: "s5_recovery_reg",
                  d: "s5_recovery_reg",
                },
                rationale: "XGBoost tree objective: L(θ) + Ω(f) where Ω = γT + ½λΣwⱼ² + αΣ|wⱼ|. γ: minimum gain to split (controls tree complexity), λ (reg_lambda): L2 on leaf weights (default=1, always on), α (reg_alpha): L1 on leaf weights (default=0). L1 promotes sparse leaves; L2 smoothly regularises. Both are applied to leaf scores, not feature weights.",
              },
              s5_recovery_lr: {
                id: "s5_recovery_lr",
                type: "scenario_choice",
                badge: "Recovery 1",
                title: "Recovery · Learning Rate vs n_estimators Tradeoff",
                prompt: "What is the fundamental tradeoff between learning_rate and n_estimators in gradient boosting?",
                code_snippet: `# Config A: fast but risky
xgb_a = xgb.XGBClassifier(learning_rate=0.3, n_estimators=100)

# Config B: slow but safer
xgb_b = xgb.XGBClassifier(learning_rate=0.01, n_estimators=3000)`,
                choices: [
                  {
                    id: "a",
                    label: "Higher learning rate always gives better accuracy",
                    description: "High learning rate causes large jumps that overshoot minima and overfit. Lower learning_rate with more estimators typically achieves better generalisation.",
                  },
                  {
                    id: "b",
                    label: "Lower learning_rate requires more trees to achieve the same training loss but typically generalises better; always use early stopping to find the right n_estimators",
                    description: "Each tree corrects a fraction (learning_rate) of the residual. Small steps + many trees = smoother optimisation path with better generalisation. Use early stopping to avoid manually guessing n_estimators.",
                  },
                  {
                    id: "c",
                    label: "learning_rate and n_estimators are independent — tuning one does not affect the other",
                    description: "They are strongly coupled. Halving learning_rate roughly doubles the n_estimators needed to reach the same training loss.",
                  },
                  {
                    id: "d",
                    label: "Use learning_rate=1.0 for maximum speed and reduce n_estimators to compensate",
                    description: "learning_rate=1.0 means no shrinkage — equivalent to non-regularised boosting, which overfits severely.",
                  },
                ],
                branches: {
                  a: "s5_recovery_lr",
                  b: "s5_val_loss_choice",
                  c: "s5_recovery_lr",
                  d: "s5_recovery_lr",
                },
                rationale: "Gradient boosting update: F_m(x) = F_{m-1}(x) + η·h_m(x) where η=learning_rate. Small η: model changes slowly, needs more trees (n_estimators), but each step is more conservative. Empirical rule: lower learning_rate + more trees + early stopping often yields best test performance. Typical: η=0.05, n_estimators up to 3000 with early stopping.",
              },
              s5_recovery_early_stop: {
                id: "s5_recovery_early_stop",
                type: "scenario_choice",
                badge: "Recovery 2",
                title: "Recovery · Overfitting Diagnosis in Boosting",
                prompt: "Training AUC increases to 0.98 and stays there. Validation AUC peaks at 0.83 at round 60 and slowly declines to 0.79 by round 200. What are the key diagnostics and what should you try?",
                code_snippet: `# Round 60:  train_auc=0.94, val_auc=0.83  ← best val
# Round 100: train_auc=0.97, val_auc=0.81
# Round 200: train_auc=0.98, val_auc=0.79`,
                choices: [
                  {
                    id: "a",
                    label: "The model is underfitting — increase max_depth",
                    description: "Training AUC=0.98 indicates the model fits training data very well. The gap between train (0.98) and val (0.79) is overfitting, not underfitting.",
                  },
                  {
                    id: "b",
                    label: "Classic overfitting: use early stopping at round 60; then try reducing max_depth, increasing min_child_weight, adding subsampling, or increasing reg_lambda",
                    description: "Three diagnostic signs: (1) high train/val gap, (2) val metric peaked and declined, (3) training kept improving. Early stopping at best_iteration=60. Regularisation options: smaller max_depth, larger min_child_weight (min samples per leaf), subsample < 1.0, reg_lambda > 1.",
                  },
                  {
                    id: "c",
                    label: "Increase n_estimators to 1000 — the model needs more trees to converge",
                    description: "More trees will worsen overfitting here — the model is already overfitting by round 60.",
                  },
                  {
                    id: "d",
                    label: "Lower learning_rate to 0.001 without early stopping",
                    description: "Lower learning_rate helps but without early stopping the model will still overfit eventually — just more slowly.",
                  },
                ],
                branches: {
                  a: "s5_recovery_early_stop",
                  b: "s5_reg_choice",
                  c: "s5_recovery_early_stop",
                  d: "s5_recovery_early_stop",
                },
                rationale: "Train AUC 0.98, val AUC 0.79 = large generalisation gap = overfitting. Prioritised remedies: (1) Early stopping at best_iteration=60 (most impactful). (2) Reduce max_depth (smaller, simpler trees). (3) Increase min_child_weight (require more samples per leaf). (4) Add colsample_bytree/subsample (stochastic boosting). (5) Increase reg_lambda/reg_alpha.",
              },
              s5_recovery_reg: {
                id: "s5_recovery_reg",
                type: "scenario_choice",
                badge: "Recovery 3",
                title: "Recovery · Boosting vs Bagging",
                prompt: "What is the fundamental difference between boosting (XGBoost) and bagging (Random Forest)?",
                code_snippet: `# Bagging: trees trained in parallel on bootstrap samples
# Boosting: trees trained sequentially, each on residuals of the previous

# Random Forest: average of independent trees → reduces variance
# XGBoost: sum of trees correcting previous errors → reduces bias`,
                choices: [
                  {
                    id: "a",
                    label: "Both train trees in parallel — boosting just uses more trees",
                    description: "Boosting is sequential by definition: each tree learns from the errors of all previous trees.",
                  },
                  {
                    id: "b",
                    label: "Bagging reduces variance by averaging independent models; boosting reduces bias by sequentially correcting errors — both risk overfitting but through different mechanisms",
                    description: "Bagging: Var(mean) ≈ ρσ²/n — lowers variance. Boosting: each tree fits residuals → reduces bias. Bagging overfits slowly (many independent high-variance trees average out). Boosting overfits when it starts fitting noise in the residuals.",
                  },
                  {
                    id: "c",
                    label: "Boosting is always better — it reduces both bias and variance",
                    description: "Boosting primarily reduces bias. It can overfit (increase variance) if too many trees are added without regularisation.",
                  },
                  {
                    id: "d",
                    label: "Bagging is better for noisy data; boosting only works on clean data",
                    description: "Both work on noisy data; boosting requires more careful regularisation (early stopping, learning rate) on noisy data.",
                  },
                ],
                branches: {
                  a: "s5_recovery_reg",
                  b: "s5_terminal",
                  c: "s5_recovery_reg",
                  d: "s5_recovery_reg",
                },
                rationale: "Bagging: parallel training on bootstrap samples → average reduces variance (each tree is independent). Boosting: sequential, each tree fits the gradient of the loss on the residuals → reduces bias. Random forests rarely overfit catastrophically; gradient boosting can overfit badly without regularisation (early stopping, depth limits, shrinkage).",
              },
              s5_terminal: {
                id: "s5_terminal",
                type: "scenario_choice",
                badge: "Terminal",
                title: "Revision complete · Gradient Boosting Mastered",
                terminal: true,
                prompt: "An XGBoost model with 500 trees has train AUC=0.98, val AUC=0.71. Name 3 interventions in the order you would try them and explain the reasoning.",
                code_snippet: `model = xgb.XGBClassifier(
    n_estimators=500,
    learning_rate=0.1,
    max_depth=8,
    # no early stopping
    # no subsampling
    # reg_lambda=1 (default)
)`,
                choices: [
                  {
                    id: "a",
                    label: "(1) Add early stopping to find best_iteration; (2) reduce max_depth from 8 to 4-6; (3) add subsampling (subsample=0.8, colsample_bytree=0.8)",
                    description: "Ordered by impact and ease: Early stopping is free and immediately identifies the optimal tree count (likely well below 500). max_depth reduction simplifies trees structurally. Subsampling introduces randomness similar to random forests, reducing overfitting.",
                  },
                  {
                    id: "b",
                    label: "(1) Increase n_estimators to 2000; (2) lower learning_rate; (3) collect more data",
                    description: "More trees at the same learning_rate will worsen the existing overfitting. The problem is too many trees, not too few.",
                  },
                  {
                    id: "c",
                    label: "(1) Switch to Random Forest; (2) use SHAP for feature selection; (3) retrain XGBoost",
                    description: "Switching models is a last resort; standard regularisation should be tried first.",
                  },
                ],
                branches: {
                  a: "s5_terminal",
                  b: "s5_terminal",
                  c: "s5_terminal",
                },
                rationale: "Train AUC 0.98 / val AUC 0.71 = severe overfitting (0.27 gap). Ordered interventions: (1) Early stopping (eval_set + early_stopping_rounds=50) — identifies if fewer trees fix it; lowest cost change. (2) Reduce max_depth to 4-6 — shallower trees have lower variance. (3) Stochastic boosting: subsample=0.8 (row sampling), colsample_bytree=0.8 (column sampling) — adds regularisation via randomness. If still overfitting: increase reg_lambda, reduce learning_rate and increase trees with early stopping.",
              },
            },
          },
    knowledgeCheck: [
      {
        question: "What is each new tree in gradient boosting trained to predict?",
        options: [
          "The original target y directly, like every other tree",
          "The negative gradient of the loss at the current predictions (the pseudo-residuals)",
          "A bootstrap sample of the data, independently of prior trees",
        ],
        correctIndex: 1,
        explanation: "Boosting is gradient descent in function space: each tree approximates the negative gradient of the loss (for squared error, the ordinary residual), so it corrects the current ensemble's errors.",
      },
      {
        question: "Why is the recipe usually 'small learning rate + many trees + early stopping'?",
        options: [
          "Small steps are faster to compute per tree",
          "Shrinkage regularizes (no single tree dominates), more rounds restore capacity, and early stopping picks the best round and guards against overfitting",
          "Early stopping is only for neural networks",
        ],
        correctIndex: 1,
        explanation: "Low η makes each correction modest and improves generalization; you compensate with more rounds; early stopping on validation loss selects n_estimators and prevents memorization.",
      },
      {
        question: "Which error component does boosting primarily reduce, and what base learner does it use?",
        options: [
          "Bias, using shallow weak learners that each correct the residuals",
          "Variance, using deep trees",
          "Irreducible error, using linear models",
        ],
        correctIndex: 0,
        explanation: "Boosting adds weak (high-bias, low-variance) learners sequentially, each lowering the remaining bias. Bagging/RF instead reduces variance using deep trees.",
      },
      {
        question: "Why does LightGBM's leaf-wise (best-first) tree growth need a num_leaves / max_depth cap?",
        options: [
          "Because it cannot handle continuous features",
          "Leaf-wise growth chases the largest loss reduction and can build very deep, unbalanced trees that overfit",
          "Because it requires the data to be sorted",
        ],
        correctIndex: 1,
        explanation: "Leaf-wise growth reaches lower training loss faster than level-wise but tends to grow deep, so you must cap leaves/depth to control overfitting.",
      },
      {
        question: "Histogram-based split finding (used by LightGBM and XGBoost's hist) speeds training by:",
        options: [
          "Skipping the loss function entirely",
          "Bucketing continuous features into a fixed number of bins so split search scans bins instead of every value",
          "Training all trees in parallel like a Random Forest",
        ],
        correctIndex: 1,
        explanation: "Binning features into ~255 buckets turns split finding into a histogram scan, a large constant-factor speedup, at a tiny cost in split granularity.",
      },
      {
        question: "Unlike a Random Forest, what happens to a gradient boosting model as you keep adding rounds without early stopping?",
        options: [
          "It cannot overfit; performance only stabilizes",
          "It reverts to a single tree",
          "It can overfit, because each round keeps reducing training loss by fitting residual noise",
        ],
        correctIndex: 2,
        explanation: "Boosting keeps targeting remaining error, so extra rounds eventually fit noise. RFs average independent trees and do not overfit with more trees — hence early stopping matters for boosting.",
      },
      {
        question: "What does XGBoost's use of second-order (Hessian) information provide?",
        options: [
          "A way to skip the gradient entirely",
          "A Newton-style split score using both gradient and curvature, giving better split selection than first-order residual fitting",
          "Automatic feature scaling",
        ],
        correctIndex: 1,
        explanation: "XGBoost approximates the loss with a second-order Taylor expansion, using gradient and Hessian to score splits and set leaf weights more precisely.",
      },
      {
        question: "On a small dataset with noisy labels, why might a Random Forest beat gradient boosting?",
        options: [
          "Boosting cannot run on small data",
          "Boosting sequentially chases the noisy residuals and overfits, while RF's averaging is more forgiving and needs little tuning",
          "Random Forests always have higher accuracy on every dataset",
        ],
        correctIndex: 1,
        explanation: "Boosting's strength — relentlessly fitting residuals — becomes a liability with label noise and few rows. Averaging in an RF is robust to such noise with minimal tuning.",
      },
    ],
  },

  "ml-s6": {
    durationLabel: "18–20 min",
    outcomes: [
      "Explain the **maximum-margin** principle and why the widest-margin separator generalizes better than an arbitrary one.",
      "Interpret the **soft-margin C** parameter as the bias/variance dial trading margin width against margin violations.",
      "Describe **support vectors** and why the solution depends only on them — the source of SVM sparsity and robustness.",
      "Explain the **kernel trick**: implicitly mapping to a high-dimensional space via inner products (linear, polynomial, **RBF**) without ever computing the mapping.",
    ],
    learnMarkdown: `## The mental model: don't just separate the classes — separate them with the most breathing room

Many lines can separate two classes; logistic regression picks one based on likelihood. A Support Vector Machine asks a sharper question: of all separating hyperplanes, **which one leaves the widest gap (margin) between the classes?** The intuition is generalization — a boundary jammed against the nearest points is fragile, while the **maximum-margin** boundary is the most robust to perturbation of the data. Formally, SVM maximizes the distance from the boundary to the closest points of either class.

## Motivation (a text classifier in 50,000 dimensions)

A team classifies support tickets using bag-of-words: tens of thousands of sparse features, only a few thousand labeled examples. Logistic regression overfits; trees flail in such high dimensions. A **linear SVM** thrives — it is built for high-dimensional, sparse, margin-separable data, and its solution depends only on a handful of **support vectors**, so it is memory-light and robust. Senior takeaway: SVMs shine when **dimensions ≫ samples** and when you want a principled, max-margin boundary; they fall behind tree ensembles on large, messy tabular data and scale poorly past ~100k rows because of the kernel matrix.

## The geometry: margin, hard and soft

For a hyperplane \`wᵀx + b = 0\`, the margin width is \`2/‖w‖\`. Maximizing the margin means **minimizing ‖w‖²** subject to every point being on the correct side with at least unit signed distance:

\`\`\`
minimize  ½‖w‖²   subject to   yᵢ(wᵀxᵢ + b) ≥ 1  for all i
\`\`\`

That is the **hard-margin** SVM — it assumes the data is perfectly separable, which real data rarely is. One outlier makes it infeasible or absurdly narrow.

## Soft margin and the C parameter

Real data needs slack. We allow violations \`ξᵢ ≥ 0\` and penalize them, giving the **soft-margin** objective:

\`\`\`
minimize  ½‖w‖² + C·Σ ξᵢ
\`\`\`

\`C\` is the **regularization dial**, and reading it correctly is the most common SVM interview question:

| C | Behavior | Bias / variance |
|---|---|---|
| **Large C** | heavily penalizes violations → narrow margin, fits training data tightly | **low bias, high variance** (overfit risk) |
| **Small C** | tolerates violations → wide margin, ignores some points | **high bias, low variance** (smoother) |

So C is the inverse of regularization strength: **large C = trust the data, small C = trust the margin.** Tune it by cross-validation. (Note: this is the opposite direction from λ in ridge/lasso, a classic trip-up.)

## Support vectors: the solution is sparse

The optimal boundary is determined **only by the points on or inside the margin** — the **support vectors**. Points comfortably on the correct side have zero influence; you could delete them and the boundary would not move. Consequences:

- The model is **sparse** in the data: prediction depends on the support vectors only.
- It is **robust** to far-away points but **sensitive** to points near the boundary.
- The number of support vectors is a rough complexity / overfitting gauge — too many often means C is too large or the kernel too flexible.

## The kernel trick: nonlinearity for free

What if no straight line separates the classes (e.g. one class encircling another)? Map the data to a higher-dimensional space where it *is* linearly separable, then find the max-margin hyperplane there — its preimage is a curved boundary in the original space. The magic: the SVM optimization and prediction depend on the data **only through inner products** \`xᵢᵀxⱼ\`. A **kernel** \`K(xᵢ, xⱼ)\` computes the inner product *in the mapped space* without ever constructing the mapping:

\`\`\`
K(xᵢ, xⱼ) = φ(xᵢ)ᵀφ(xⱼ)     ← computed directly, φ never materialized
\`\`\`

Common kernels:

| Kernel | K(x, x′) | Use |
|---|---|---|
| Linear | xᵀx′ | high-dim sparse data (text), dims ≫ samples |
| Polynomial | (γ·xᵀx′ + r)^d | interaction features up to degree d |
| **RBF (Gaussian)** | exp(−γ‖x−x′‖²) | default nonlinear; γ sets locality |

For **RBF**, \`γ\` controls how far each point's influence reaches: **large γ** = tight, wiggly boundary (low bias, high variance, overfit risk); **small γ** = smooth, broad boundary (high bias). With RBF you tune **C and γ together** — they jointly set the bias/variance of the model. RBF implicitly maps to an **infinite-dimensional** space, which is why it can fit almost any boundary (and why it can overfit).

## The XOR / circle intuition for kernels

Picture two classes where one forms a tight cluster and the other surrounds it as a ring — no straight line can separate them. Now add a third coordinate \`z = x² + y²\` (distance from center squared): the inner cluster sits low, the ring sits high, and a flat plane \`z = c\` separates them cleanly. Project that plane back to the original 2D space and it becomes a **circle**. That is the entire kernel idea in one image — lift to a space where the classes are linearly separable, separate them with a hyperplane, and the boundary curves when viewed in the original space. The RBF kernel does this lift implicitly into an infinite-dimensional space, which is why it can carve essentially any boundary, and why feature scaling matters so much: the lift is built from distances.

## Why the kernel trick is possible: the dual

Solving the margin problem with its constraints leads (via Lagrange multipliers) to the **dual formulation**, in which the prediction depends on the data **only through inner products** \`xᵢᵀxⱼ\` and the optimal weight vector is a weighted sum of the training points, \`w = Σ αᵢ yᵢ xᵢ\`. The multipliers \`αᵢ\` are **zero for every non-support-vector** — that is *why* only support vectors matter, falling straight out of the optimization (the KKT conditions). And because everything is expressed through inner products, you can swap \`xᵢᵀxⱼ\` for a kernel \`K(xᵢ, xⱼ)\` and instantly work in a richer space. A function is a valid kernel iff its Gram matrix is positive semi-definite (**Mercer's condition**) — that guarantees it corresponds to *some* inner product in *some* feature space, even an infinite-dimensional one for the RBF.

## SVM vs logistic regression (the inevitable comparison)

They produce similar linear boundaries but optimize different losses:

| | SVM (hinge loss) | Logistic regression (log loss) |
|---|---|---|
| Loss | max(0, 1 − y·f(x)) | log(1 + e^(−y·f(x))) |
| Driven by | points near/inside margin (support vectors) | all points, weighted by confidence |
| Output | signed distance (not a probability) | calibrated probability |
| Nonlinearity | kernels (implicit, powerful) | feature engineering |
| Sparsity | sparse in data (few SVs) | dense |

Hinge loss is exactly zero for confidently-correct points, which is why far-away points are ignored; log loss never reaches zero, so every point nudges the boundary. If you need **probabilities**, reach for logistic regression (or Platt-scale the SVM). If you have **dims ≫ samples** or want kernelized nonlinearity, the SVM is the natural pick.

## Multiclass and regression variants

SVMs are inherently binary, so multiclass uses **one-vs-rest** (K classifiers) or **one-vs-one** (K(K−1)/2 pairwise classifiers, libsvm's default). For regression there is **Support Vector Regression (SVR)**, which flips the idea: instead of a margin that separates, it fits a tube of width \`ε\` around the function and penalizes only points *outside* the tube — an ε-insensitive loss. The same C, kernel, and support-vector machinery apply.

## Pitfalls senior interviewers probe

- **Misreading C** — large C is *less* regularized (opposite of ridge's λ).
- **Skipping feature scaling** — RBF and the margin depend on distances; unscaled features wreck the kernel. Always standardize.
- **Defaulting to RBF on huge data** — the kernel (Gram) matrix is O(n²) memory and training is roughly O(n²)–O(n³); above ~10⁵ rows prefer a **linear SVM** (liblinear / SGD) or a tree ensemble.
- **No calibration** — SVM outputs signed distances, not probabilities; use Platt scaling if you need P(y|x).
- **γ and C tuned independently** — they interact; grid/search them jointly.
- **Inventing arbitrary kernels** — a kernel must be PSD (Mercer) to correspond to a real inner-product space.

## Interview questions

- "What does the SVM actually maximize, and why does that help generalization?" (The margin 2/‖w‖; the widest gap is most robust.)
- "Explain C — and how is it different from ridge's λ?" (C penalizes violations; large C = low regularization, the opposite direction of λ.)
- "What are support vectors and why do they matter?" (Points on/inside the margin define the boundary; the rest are irrelevant → sparse, robust solution.)
- "What is the kernel trick and why does RBF overfit at high γ?" (Inner products in an implicit feature space; high γ shrinks each point's influence radius → wiggly boundary.)
- "SVM vs logistic regression — when each?" (SVM: hinge loss, sparse, kernelizable, dims ≫ samples; logistic: calibrated probabilities, all points contribute.)
- "Why does only the dual depend on inner products, and why does that enable kernels?" (Dual prediction uses xᵢᵀxⱼ with αᵢ = 0 off the support vectors; swap the product for a Mercer kernel.)
- "When would you NOT use an SVM?" (Very large n — O(n²) kernel matrix; messy large tabular data where boosting wins.)`,
    video: null,
    videoFallbackMarkdown: `## Deep dive without video (10 min, the lab + a margin sketch)

1. **Find the support vectors.** In the SVM lab, identify which points touch the margin — those alone fix the boundary. Drag a far-away point and confirm the boundary does not move; drag a support vector and watch it shift.
2. **Feel C and γ.** Slide C up: the margin narrows and the boundary hugs points (overfit). Toggle to RBF and raise γ: the boundary turns wiggly. Predict each effect before you move the control.
3. **Two sentences:** "An SVM maximizes ___, which generalizes because ___. Large C means ___ regularization." Fill and rehearse.`,
    tryGuidance: `Before sliding C, predict whether a larger C widens or narrows the margin and which way overfitting risk moves. Then toggle the kernel: predict whether linear or RBF can separate the encircled points, and verify which become support vectors.`,
    interviewGraph: {
            initialStageId: "s6_high_c_click",
            artifactDimensions: [
              {
                label: "C Parameter & Margin",
                recoveryStageId: "s6_recovery_c",
              },
              {
                label: "Kernel Trick",
                recoveryStageId: "s6_recovery_kernel",
              },
              {
                label: "SVM Limitations",
                recoveryStageId: "s6_recovery_scale",
                passLabel: "SVM Mastery",
              },
            ],
            stages: {
              s6_high_c_click: {
                id: "s6_high_c_click",
                type: "click_target",
                badge: "Stage 1",
                title: "Stage 1 · Over-penalising Misclassifications",
                prompt: "An SVM is applied to a dataset with overlapping classes and significant noise. Click the line that makes the model prone to overfitting by not tolerating any margin violations.",
                code_snippet: `from sklearn.svm import SVC

model = SVC(
    C=1000,           # ds-target:extreme_c
    kernel='rbf',
    gamma='scale'
)
model.fit(X_train, y_train)
print(f"Train accuracy: {model.score(X_train, y_train):.3f}")`,
                validationCopy: {
                  extreme_c: "Correct. C=1000 (extremely high) forces the SVM to classify every training point correctly, allowing almost no margin violations. On a noisy, overlapping dataset this means the decision boundary contorts to fit outliers — a classic overfit. Reduce C (try C=0.1 or C=1.0) to allow a wider margin and tolerance for misclassifications, which improves generalisation.",
                },
                branches: {
                  extreme_c: "s6_c_choice",
                },
              },
              s6_c_choice: {
                id: "s6_c_choice",
                type: "scenario_choice",
                badge: "Stage 2",
                title: "Stage 2 · C Parameter Interpretation",
                prompt: "In an SVM, a high value of C means:",
                code_snippet: `# SVM objective: minimise ½‖w‖² + C·Σξᵢ
# ‖w‖²: margin term (want to maximise margin)
# C·Σξᵢ: penalty for misclassifications / margin violations
# C controls the tradeoff

from sklearn.svm import SVC
svc_low_c  = SVC(C=0.01)   # soft margin
svc_high_c = SVC(C=1000)   # hard margin`,
                choices: [
                  {
                    id: "a",
                    label: "Wide margin, many violations allowed, underfits training data",
                    description: "Wide margin and tolerance for violations is the effect of LOW C. High C does the opposite.",
                  },
                  {
                    id: "b",
                    label: "Small margin, few violations allowed, can overfit to training data",
                    description: "High C heavily penalises misclassifications (Σξᵢ term is large), so the optimiser sacrifices margin width to correctly classify training points. This can memorise noise.",
                  },
                  {
                    id: "c",
                    label: "Faster training — C controls the convergence rate of the optimiser",
                    description: "C is a regularisation parameter, not a learning rate. It affects the shape of the decision boundary, not convergence speed.",
                  },
                  {
                    id: "d",
                    label: "More support vectors — high C selects more points to define the boundary",
                    description: "High C often leads to FEWER support vectors because the boundary fits tightly. Low C (wide margin) tends to have more support vectors.",
                  },
                ],
                branches: {
                  a: "s6_recovery_c",
                  b: "s6_kernel_choice",
                  c: "s6_recovery_c",
                  d: "s6_recovery_c",
                },
                rationale: "SVM objective: min ½‖w‖² + CΣξᵢ. The ‖w‖² term maximises margin; CΣξᵢ penalises violations. High C: violations are heavily penalised → narrow margin, fits training data closely → risk overfitting. Low C: violations tolerated → wide, smooth margin → better generalisation on noisy data. C is the inverse of regularisation strength.",
              },
              s6_kernel_choice: {
                id: "s6_kernel_choice",
                type: "scenario_choice",
                badge: "Stage 3",
                title: "Stage 3 · The Kernel Trick",
                prompt: "Data is not linearly separable in 2D. You apply an RBF kernel to an SVM. What happens mathematically?",
                code_snippet: `# Linear SVM: finds hyperplane w·x + b = 0 in input space
# RBF kernel: K(x, x') = exp(-γ‖x - x'‖²)
# The kernel computes dot products in a high-dimensional space
# without explicitly computing the mapping φ(x)

from sklearn.svm import SVC
model = SVC(kernel='rbf', C=1.0, gamma='scale')`,
                choices: [
                  {
                    id: "a",
                    label: "The RBF kernel adds polynomial features up to degree 3 to make data separable",
                    description: "Polynomial features are added by the polynomial kernel. RBF corresponds to an infinite-dimensional feature space.",
                  },
                  {
                    id: "b",
                    label: "The kernel implicitly maps data to a higher-dimensional (potentially infinite) space where linear separation may exist; the SVM finds the max-margin hyperplane in that space without explicitly computing the mapping",
                    description: "K(x,x') = φ(x)·φ(x'). The RBF kernel corresponds to infinite-dimensional feature space. The kernel trick computes dot products in that space via a simple exponential function, making the computation tractable.",
                  },
                  {
                    id: "c",
                    label: "The RBF kernel normalises the feature vectors, making them linearly separable",
                    description: "Normalisation is a preprocessing step, not what a kernel does. The kernel defines a similarity function that enables non-linear decision boundaries.",
                  },
                  {
                    id: "d",
                    label: "The kernel randomly projects data into a higher-dimensional space",
                    description: "Random projection is a different technique (e.g., Random Kitchen Sinks). The RBF kernel uses a specific, deterministic similarity function.",
                  },
                ],
                branches: {
                  a: "s6_recovery_kernel",
                  b: "s6_scale_choice",
                  c: "s6_recovery_kernel",
                  d: "s6_recovery_kernel",
                },
                rationale: "Kernel trick: instead of explicitly computing φ(x) (which may be infinite-dimensional), we define K(x,x') = φ(x)·φ(x'). The SVM only needs dot products in the feature space (for the dual formulation), which the kernel provides cheaply. RBF kernel K(x,x') = exp(-γ‖x-x'‖²) corresponds to infinite-dimensional Gaussian features — any compact dataset is separable in this space for appropriate γ.",
              },
              s6_scale_choice: {
                id: "s6_scale_choice",
                type: "scenario_choice",
                badge: "Stage 4",
                title: "Stage 4 · SVM Scalability",
                prompt: "You have a dataset with 1 million rows. Comparing SVM with RBF kernel vs Logistic Regression — which is more practical and why?",
                code_snippet: `# SVM training complexity: O(n²) to O(n³)
# Logistic regression (SGD): O(n) per epoch

from sklearn.svm import SVC
from sklearn.linear_model import SGDClassifier

# SVC(kernel='rbf').fit(X, y)  ← n=1M rows: hours/days?
# SGDClassifier(loss='log_loss').fit(X, y)  ← n=1M: minutes`,
                choices: [
                  {
                    id: "a",
                    label: "SVM with RBF kernel — kernels handle large datasets efficiently",
                    description: "Standard SVM scales as O(n²) to O(n³) in training time and O(n_sv) in prediction, where n_sv can be large. This is impractical for 1M rows.",
                  },
                  {
                    id: "b",
                    label: "Logistic Regression (SGD) is more practical — SVMs do not scale well to large n; use LinearSVC or gradient boosting if non-linearity is needed",
                    description: "SVM training requires solving a quadratic program whose cost grows quadratically with n. For 1M rows, use: (1) SGD-based logistic regression, (2) LinearSVC (kernel-free, scales to large n), or (3) gradient boosting (XGBoost/LightGBM) for non-linear problems.",
                  },
                  {
                    id: "c",
                    label: "Both scale equally — use whichever has better default accuracy",
                    description: "SVM scales as O(n²–n³); logistic regression with SGD scales as O(n) per epoch. The difference at n=1M is enormous.",
                  },
                  {
                    id: "d",
                    label: "Use SVM with a linear kernel — it scales the same as logistic regression",
                    description: "LinearSVC (linear kernel SVM) does scale better and is a reasonable choice. But RBF-kernel SVC specifically does not scale well, and the question specifies RBF.",
                  },
                ],
                branches: {
                  a: "s6_recovery_scale",
                  b: "s6_terminal",
                  c: "s6_recovery_scale",
                  d: "s6_recovery_scale",
                },
                rationale: "SVM (kernel) training solves a QP problem: O(n²) memory, O(n²–n³) time. For n=1M: impractical. Alternatives: LinearSVC (O(n) per iteration), SGDClassifier with hinge loss (= online SVM), or approximate kernel methods (Nyström, Random Features). For non-linear large-scale problems, gradient boosting (XGBoost/LightGBM) is the practical choice.",
              },
              s6_recovery_c: {
                id: "s6_recovery_c",
                type: "scenario_choice",
                badge: "Recovery 1",
                title: "Recovery · Margin Intuition",
                prompt: "Explain the concept of a 'margin' in SVM. What are support vectors, and why does maximising the margin improve generalisation?",
                code_snippet: `# Margin = 2/‖w‖ (distance between the two margin hyperplanes)
# Support vectors: training points closest to the decision boundary
# SVM objective: max margin = min ‖w‖² subject to constraints`,
                choices: [
                  {
                    id: "a",
                    label: "The margin is the training accuracy — higher accuracy = larger margin",
                    description: "The margin is a geometric concept (distance), not accuracy. A model can have high training accuracy with a tiny margin (overfit).",
                  },
                  {
                    id: "b",
                    label: "The margin is the minimum distance between the decision boundary and the nearest training points (support vectors); larger margin = less sensitive to small perturbations in input, better generalisation by VC theory",
                    description: "Margin = 2/‖w‖. By VC theory, maximising the margin minimises an upper bound on the generalisation error. Support vectors are the only training points that influence the boundary — all other points can be removed without changing the SVM.",
                  },
                  {
                    id: "c",
                    label: "The margin is the number of support vectors — fewer support vectors = larger margin",
                    description: "Fewer support vectors often correlates with a larger margin but is not the definition. The margin is a geometric distance, not a count.",
                  },
                  {
                    id: "d",
                    label: "Maximising the margin reduces training error — it is a direct optimisation of accuracy",
                    description: "SVM maximises margin, which is a regularisation objective. It does not directly minimise training error (unlike ERM models).",
                  },
                ],
                branches: {
                  a: "s6_recovery_c",
                  b: "s6_kernel_choice",
                  c: "s6_recovery_c",
                  d: "s6_recovery_c",
                },
                rationale: "Margin = 2/‖w‖ = twice the distance from the boundary to the nearest points. Maximising margin minimises ‖w‖², which (by VC dimension theory) minimises the generalisation error bound. Support vectors are the training points on the margin — they are the only points that determine the decision boundary. This is an elegant property: the SVM ignores non-support-vector points entirely.",
              },
              s6_recovery_kernel: {
                id: "s6_recovery_kernel",
                type: "scenario_choice",
                badge: "Recovery 2",
                title: "Recovery · Gamma Parameter in RBF Kernel",
                prompt: "RBF kernel has parameter gamma (γ). High gamma means the kernel has a very small radius of influence. What is the practical effect on the decision boundary?",
                code_snippet: `# RBF: K(x, x') = exp(-γ‖x - x'‖²)
# High γ: only nearby points have non-zero similarity
# Low γ: distant points still have significant similarity

svc_high_gamma = SVC(kernel='rbf', C=1.0, gamma=100)
svc_low_gamma  = SVC(kernel='rbf', C=1.0, gamma=0.001)`,
                choices: [
                  {
                    id: "a",
                    label: "High gamma creates a very smooth, global decision boundary",
                    description: "High gamma is the opposite: each training point influences only a tiny region, creating a bumpy, local decision boundary.",
                  },
                  {
                    id: "b",
                    label: "High gamma creates a very complex, wiggly boundary that fits tightly around each training point — tends to overfit",
                    description: "With high γ, each support vector's influence decays rapidly. The model creates small 'bubbles' around each training point rather than a smooth boundary — classic overfit behaviour.",
                  },
                  {
                    id: "c",
                    label: "High gamma makes the SVM equivalent to a linear SVM",
                    description: "Low gamma (γ→0) makes all pairwise similarities equal, approximating a linear kernel. High gamma creates the most non-linear boundary.",
                  },
                  {
                    id: "d",
                    label: "High gamma is always preferred — it captures more complex patterns",
                    description: "High gamma overfits to training data. The optimal gamma balances complexity and generalisation — tune with cross-validation.",
                  },
                ],
                branches: {
                  a: "s6_recovery_kernel",
                  b: "s6_scale_choice",
                  c: "s6_recovery_kernel",
                  d: "s6_recovery_kernel",
                },
                rationale: "γ in K(x,x') = exp(-γ‖x-x'‖²) controls the 'reach' of each training point. High γ: kernel decays rapidly → each support vector affects only nearby predictions → complex, local decision boundary → overfitting. Low γ: slow decay → smooth, global boundary → may underfit. Jointly tune C and gamma with grid search or RandomizedSearchCV.",
              },
              s6_recovery_scale: {
                id: "s6_recovery_scale",
                type: "scenario_choice",
                badge: "Recovery 3",
                title: "Recovery · SVM Preprocessing Requirements",
                prompt: "Why must features be scaled (standardised) before training an SVM, and what happens if you skip this step?",
                code_snippet: `from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline

# Correct: scale first
pipe = Pipeline([
    ('scaler', StandardScaler()),
    ('svm', SVC(kernel='rbf', C=1.0))
])

# Incorrect: raw features with very different scales
# svc.fit(X_raw, y)  ← feature_1 in [0,1], feature_2 in [0,10000]`,
                choices: [
                  {
                    id: "a",
                    label: "Scaling is optional for SVMs — the kernel handles different scales automatically",
                    description: "The RBF kernel computes ‖x-x'‖². If feature scales differ by orders of magnitude, the distance is dominated by the large-scale feature, effectively ignoring all others.",
                  },
                  {
                    id: "b",
                    label: "SVMs are sensitive to feature scale because the RBF kernel uses Euclidean distance; unscaled features cause the model to ignore small-scale features entirely",
                    description: "‖x-x'‖² = Σ(xᵢ-xᵢ')². A feature with range [0,10000] contributes ~10^8 to the squared distance; a feature in [0,1] contributes at most 1. Without scaling, the kernel is blind to the small features.",
                  },
                  {
                    id: "c",
                    label: "Scaling is needed only for linear SVMs, not RBF kernels",
                    description: "RBF kernels are especially sensitive to scale because they use Euclidean distance explicitly. Linear SVMs also benefit from scaling for similar reasons.",
                  },
                  {
                    id: "d",
                    label: "Scaling hurts SVM performance by removing important magnitude information",
                    description: "Magnitude differences between features are arbitrary (unit choices) and should not determine which features the model attends to. Scaling removes this arbitrary bias.",
                  },
                ],
                branches: {
                  a: "s6_recovery_scale",
                  b: "s6_terminal",
                  c: "s6_recovery_scale",
                  d: "s6_recovery_scale",
                },
                rationale: "RBF kernel: K(x,x') = exp(-γ‖x-x'‖²). If feature A ∈ [0,1] and feature B ∈ [0,10,000], then ‖x-x'‖² ≈ (A-A')² + (B-B')² ≈ (B-B')² — the model effectively only uses feature B. StandardScaler (z-score normalisation) or MinMaxScaler ensures all features contribute equally to the distance calculation.",
              },
              s6_terminal: {
                id: "s6_terminal",
                type: "scenario_choice",
                badge: "Terminal",
                title: "Revision complete · SVM Mastered",
                terminal: true,
                prompt: "Explain the kernel trick to a junior engineer without using math jargon. What problem does it solve, and why is it computationally elegant?",
                code_snippet: `# Without kernel: you'd have to manually create
# millions of new features (x1², x2², x1*x2, x1³, ...)
# then train a linear SVM on those expanded features

# With kernel: you just change one line
model = SVC(kernel='rbf')  # magic happens inside
# The kernel secretly computes dot products in that
# high-dimensional space without creating the features`,
                choices: [
                  {
                    id: "a",
                    label: "The kernel trick transforms data by normalising it, so a linear boundary always works",
                    description: "Normalisation and the kernel trick are different operations. The kernel trick enables non-linear boundaries, not normalisation.",
                  },
                  {
                    id: "b",
                    label: "The kernel trick lets you find non-linear boundaries by imagining your data in a higher-dimensional space where they DO separate linearly — but it computes this without ever creating those extra dimensions, making it fast",
                    description: "Intuition: imagine your 2D data can't be separated by a line. In 3D (add x² feature), it can. The kernel 'asks': how similar are two points in that high-dimensional space? It answers this question using only the original features — no explicit expansion needed.",
                  },
                  {
                    id: "c",
                    label: "The kernel trick is a way to avoid cross-validation by estimating the best C and gamma automatically",
                    description: "The kernel trick is about feature space expansion, not hyperparameter selection. C and gamma still need to be tuned via cross-validation.",
                  },
                ],
                branches: {
                  a: "s6_terminal",
                  b: "s6_terminal",
                  c: "s6_terminal",
                },
                rationale: "Simple explanation: 'Sometimes data can't be separated by a straight line. If we could add extra dimensions (like squaring the features), it might become separable. But adding millions of features is expensive. The kernel trick says: I don't need to actually create those features — I just need to know how similar two data points are in that higher-dimensional space, which I can calculate directly from the original features using a simple formula.' Computationally elegant: the SVM dual formulation only needs pairwise dot products φ(x)·φ(x'), and the kernel provides these without computing φ(x) explicitly.",
              },
            },
          },
    knowledgeCheck: [
      {
        question: "What does a Support Vector Machine maximize, and why does that aid generalization?",
        options: [
          "The number of correctly classified points; more correct points always generalize better",
          "The margin (distance from the boundary to the nearest points); the widest gap is most robust to data perturbation",
          "The likelihood of the data, exactly like logistic regression",
        ],
        correctIndex: 1,
        explanation: "SVMs find the maximum-margin separator. A boundary with the most breathing room is least sensitive to small shifts in the data, which improves generalization.",
      },
      {
        question: "How should you interpret a LARGE value of the soft-margin parameter C?",
        options: [
          "Strong regularization: a wide margin that tolerates many violations",
          "Weak regularization: heavily penalize violations, giving a narrow margin that fits training data tightly (overfit risk)",
          "C only affects training speed, not the boundary",
        ],
        correctIndex: 1,
        explanation: "Large C makes margin violations expensive, so the model fits the data tightly with a narrow margin — low bias, high variance. This is the opposite direction from ridge's λ.",
      },
      {
        question: "Which points determine the SVM decision boundary?",
        options: [
          "Only the support vectors — points on or inside the margin; the rest can be deleted without moving the boundary",
          "All training points equally",
          "Only the class centroids",
        ],
        correctIndex: 0,
        explanation: "The solution is sparse: the boundary depends solely on the support vectors. Points well on the correct side have zero influence, which makes the model robust to far-away data.",
      },
      {
        question: "What is the kernel trick?",
        options: [
          "Explicitly computing the high-dimensional feature mapping φ(x) for every point",
          "Computing inner products in a (possibly infinite-dimensional) feature space directly via K(x,x′), without ever materializing φ",
          "Randomly dropping features to speed up training",
        ],
        correctIndex: 1,
        explanation: "SVMs depend on data only through inner products. A kernel returns φ(x)ᵀφ(x′) directly, enabling nonlinear boundaries without building the (possibly infinite-dim) mapping.",
      },
      {
        question: "For an RBF kernel, what does a LARGE γ do?",
        options: [
          "Produces a smooth, broad boundary with high bias",
          "Turns the RBF kernel into a linear kernel",
          "Shrinks each point's influence radius, producing a tight, wiggly boundary prone to overfitting (low bias, high variance)",
        ],
        correctIndex: 2,
        explanation: "γ scales the exponent exp(−γ‖x−x′‖²). Large γ means influence decays fast, so the boundary follows individual points closely — overfitting risk; small γ gives smooth boundaries.",
      },
      {
        question: "Why must you standardize/scale features before training an RBF SVM?",
        options: [
          "Because SVMs require integer features",
          "Because the margin and RBF kernel depend on distances; features on larger scales dominate and distort the boundary",
          "Scaling is unnecessary for any SVM",
        ],
        correctIndex: 1,
        explanation: "Distance-based methods are scale-sensitive. Without standardization, large-magnitude features dominate ‖x−x′‖, so the kernel and margin are governed by units rather than signal.",
      },
      {
        question: "When is an SVM a poor choice?",
        options: [
          "When dimensions greatly exceed the number of samples (e.g. sparse text)",
          "On very large datasets (n ≫ 10⁵) with a nonlinear kernel, because the Gram matrix is O(n²) memory and training is ~O(n²)–O(n³)",
          "When the data is linearly separable",
        ],
        correctIndex: 1,
        explanation: "Kernel SVMs scale poorly: the kernel matrix and training cost grow quadratically/cubically in n. For huge data prefer a linear SVM or a tree ensemble. SVMs excel when dims ≫ samples.",
      },
      {
        question: "A hard-margin SVM is rarely used directly on real data because:",
        options: [
          "It is slower than the soft-margin version",
          "It assumes perfect linear separability, so a single outlier makes it infeasible or forces an absurdly narrow margin",
          "It cannot use kernels",
        ],
        correctIndex: 1,
        explanation: "Hard margin requires every point on the correct side with full margin. Real data is rarely perfectly separable, so we add slack (soft margin, controlled by C) to tolerate violations.",
      },
    ],
  },
};
