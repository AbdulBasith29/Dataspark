/**
 * Machine Learning → Foundations lesson modules (ml-f1 .. ml-f5).
 * Senior-level narratives + bespoke interactive labs. Shape matches the
 * `LessonModuleSpec` typedef in `../lesson-modules.js`. The orchestrator wires
 * these into LESSON_MODULES and maps the visualizations.
 */

/** @type {Record<string, import("../lesson-modules.js").LessonModuleSpec>} */
export const ML_FOUNDATIONS = {
  "ml-f1": {
    durationLabel: "18–20 min",
    outcomes: [
      "Classify a problem as **supervised, unsupervised, or reinforcement** from the *shape of the feedback signal*, not the buzzwords in the prompt.",
      "Explain why the **labels** (or lack of them) — not the algorithm — decide the paradigm, and name the cost of acquiring them.",
      "Recognize the **hybrids** — self-supervised, semi-supervised, contextual bandits — that real systems actually ship, and why pure paradigms are rare in production.",
      "Avoid the canonical traps: **treating clustering as classification**, **leaking the future into a reward**, and **assuming labels are free**.",
    ],
    learnMarkdown: `## The question that actually sorts the paradigms

Every "what kind of ML is this?" interview answer collapses to one question: **what does the world tell the model after it makes a guess?**

- **Supervised** — the world hands you the *right answer* for each example, up front. You learn a mapping from inputs to known targets.
- **Unsupervised** — the world hands you *nothing*. No targets. You find structure that was already latent in the data.
- **Reinforcement** — the world hands you a *scalar reward, delayed and sparse*, in response to a sequence of actions. You learn a policy that maximizes cumulative reward.

Notice what is *not* in that list: the algorithm. A neural network can do all three. Gradient boosting is usually supervised but the same trees power some bandit systems. **The paradigm is a property of the supervision signal, not the model.** Junior candidates say "it uses a neural net so it's deep learning"; senior candidates say "we have one click label per impression, delayed by an hour, so it's supervised with a noisy target — unless we model the sequence of recommendations, in which case it becomes a bandit."

## A real-world story: the fraud team's three doors

A payments company wants to stop card fraud. Three engineers pitch three approaches in the same standup, and each one is a *different paradigm* — this is the cleanest way to feel the distinction.

**Engineer A (supervised).** "We have 18 months of disputed transactions. Each row is labeled fraud / not-fraud by the chargeback process. Train a classifier on \`amount, merchant_category, time_since_last_txn, geo_distance\`." This works *if* the labels are trustworthy and the future looks like the past. The hidden cost: labels arrive **60–90 days late** (chargebacks are slow), so the freshest, most adversarial fraud is exactly the data you *cannot* label yet. Supervised learning is only as good as its label pipeline.

**Engineer B (unsupervised).** "Forget labels — fraud is by definition *anomalous*. Fit a density model on normal behavior; flag the low-probability tail." This catches **novel** fraud the labeled model has never seen, because it never relied on labels. The hidden cost: it cannot tell you *why* something is anomalous, and "rare" is not the same as "bad" — a customer's first international trip is rare and legitimate. Unsupervised methods surface *structure*; turning structure into a *decision* still needs human judgment or a downstream label.

**Engineer C (reinforcement).** "The real objective isn't classifying one transaction — it's choosing an *action sequence*: allow, challenge with 2FA, or block, over a customer's lifetime, to maximize retained revenue minus fraud loss." Now feedback is a delayed reward (did blocking this customer make them churn next month?), and actions change future state (a blocked fraudster moves to a new card). The hidden cost: RL needs either a simulator or expensive online exploration, and exploration that blocks real customers has real dollar cost.

The punchline: **the same business problem maps to all three paradigms depending on how you frame the feedback.** Interviewers love this because it tests whether you reason about *the data-generating process* rather than reaching for a familiar tool.

## Supervised learning, precisely

You are given pairs \`(x, y)\` and you learn \`f\` so that \`f(x) ≈ y\` on *unseen* x. Two sub-flavors:

- **Regression** — \`y\` is continuous (price, latency, lifetime value). Loss is usually squared or absolute error.
- **Classification** — \`y\` is a category (spam/ham, 1-of-K). Loss is usually cross-entropy.

The defining constraint is **you must have a target column**, and that column must be *correct* and *available at training time* but *unavailable at prediction time for the same reason it's useful*. If a feature is only knowable after the label is known, it's leakage (covered in ml-f3).

## Unsupervised learning, precisely

No \`y\`. You model the structure of \`x\` itself. The main families:

- **Clustering** (k-means, DBSCAN, GMM) — group similar points. Output is a *grouping*, not a *meaning*. The clusters have no names; *you* interpret them.
- **Dimensionality reduction** (PCA, UMAP, autoencoders) — compress \`x\` into fewer coordinates that preserve the important variation.
- **Density / anomaly** — model \`p(x)\`, flag low-probability points.
- **Association** — find co-occurrence rules ("people who buy X buy Y").

The trap: **clustering is not classification with the labels hidden.** Three clusters do not mean three classes; the algorithm optimizes geometric compactness, which may have nothing to do with your business categories. "Unsupervised got 3 groups, so we have 3 customer types" is a sentence that should make a senior reviewer wince.

## Reinforcement learning, precisely

An **agent** observes a **state**, takes an **action**, receives a **reward**, and transitions to a new state. It learns a **policy** \`π(action | state)\` that maximizes *expected cumulative discounted reward*. Three properties make RL hard and distinct:

- **Delayed reward** — the payoff for a move may come many steps later (credit assignment problem).
- **The exploration/exploitation tradeoff** — to learn, you must sometimes take actions you believe are suboptimal.
- **Non-i.i.d. data** — your own policy decides what data you see next, so the distribution shifts as you learn.

A **contextual bandit** is the one-step special case (no state transitions): observe context, pick an action, get immediate reward. Most "RL in production" at ad and recommendation companies is actually bandits, because full RL's instability and sample-hunger rarely pay off.

## The hybrids that actually ship

Pure paradigms are textbook idealizations. Production systems live in between:

- **Self-supervised** — generate labels *from the data itself* (predict the next token; predict a masked pixel). It is *trained* like supervised learning but needs *no human labels*. This is how LLMs and modern vision backbones are built.
- **Semi-supervised** — a little labeled data + a lot of unlabeled data. Use the unlabeled mass to shape the representation, the labels to anchor the task.
- **Weak / distant supervision** — noisy, cheap, programmatic labels (regex rules, heuristics) instead of gold human labels.

If an interviewer says "we have a million images but only 5,000 are labeled," the senior answer is **semi-supervised or self-supervised pretraining**, not "label the rest."

## Diagnostic table — name the paradigm fast

| What you observe | Feedback signal | Paradigm | Typical method |
|---|---|---|---|
| Rows with a target column | Correct answer per example, upfront | Supervised | GBM, linear, NN |
| Rows, no target | Nothing | Unsupervised | k-means, PCA, DBSCAN |
| Agent acting in an environment | Delayed scalar reward | Reinforcement | Q-learning, PPO |
| Context → action → instant reward | Immediate reward, no transitions | Contextual bandit | LinUCB, Thompson |
| Data that predicts part of itself | Auto-generated targets | Self-supervised | masked modeling |
| Few labels + many unlabeled | Sparse correct answers | Semi-supervised | pseudo-labeling |

## Pitfalls senior interviewers probe

- **"Labels are free."** They are the single most expensive, slowest, and most error-prone part of most supervised systems. Always ask: *who labels, how, how fast, how noisy, and what is the cost of a wrong label?*
- **Confusing clustering with classification.** Clusters are geometry, not meaning. You still need a labeling or naming step to make them actionable.
- **Reward leakage in RL.** If the reward function can be "gamed" by an action the agent controls, the agent *will* game it. The classic: rewarding "time on site" trains a system that maximizes rage-scrolling.
- **Reaching for RL when a bandit (or plain supervised) suffices.** RL is justified only when *actions change future state and reward is genuinely delayed*. Most ranking problems are bandits in disguise.
- **Distribution shift in RL.** Because the policy chooses its own data, naive evaluation on logged data is biased; you need off-policy correction.

## Interview questions you should be able to answer cold

- "I have 10M product images and I want to find duplicates. Supervised, unsupervised, or RL — and why?" (*Unsupervised: no labels, structure-finding. A near-duplicate has no 'right answer' to memorize.*)
- "We label fraud via chargebacks that arrive 90 days late. What breaks, and what paradigm shift helps?" (*Label latency means the model is always trained on stale fraud; consider anomaly detection / self-supervision to cover the unlabeled recent window.*)
- "Why is recommendation usually a bandit and not full RL?" (*Reward is near-immediate (click), and modeling full state transitions rarely pays for the instability and sample cost.*)
- "Your clustering returns 5 groups. PM asks 'are these our 5 customer segments?' How do you respond?" (*Clusters optimize geometric similarity, not business meaning; validate against known outcomes before naming them.*)
- "What makes self-supervised learning different from unsupervised learning?" (*Self-supervised invents a supervised target from the data and trains with a supervised loss; it is the engine behind pretraining, whereas classic unsupervised has no target at all.*)`,
    video: null,
    videoFallbackMarkdown: `## Deep dive without video

Grab three recent product features you use (a spam filter, a "customers also bought" row, a game AI or a thermostat). For each, write one line answering: **"After the model acts, what does the world tell it?"**

- Right answer per example, upfront → supervised.
- Nothing, find structure → unsupervised.
- A delayed score for a *sequence* of actions → reinforcement.

Then flip one of them: redesign the *same product* under a different paradigm. (E.g. turn the spam filter from supervised classification into unsupervised anomaly detection — what label do you now lose, and what novel spam do you now catch?) The act of *re-framing the feedback signal* is exactly the muscle interviewers test.`,
    tryGuidance: `Toggle between the three paradigms in the lab and watch how the *feedback signal* changes — labeled colored points, an unlabeled cloud you must cluster yourself, or an agent chasing reward. Before you switch, **predict** what disappears from the screen when labels go away.`,
    knowledgeCheck: [
      {
        question:
          "A team has 2M log-line records and wants to surface 'unusual' system behavior with no examples of what 'unusual' means. Which paradigm fits, and what is the key risk?",
        options: [
          "Unsupervised anomaly detection — but 'rare' is not the same as 'bad', so legitimate-but-rare events get flagged",
          "Supervised classification — just label a few and the model generalizes perfectly to all anomaly types",
          "Reinforcement learning — the logs form an environment with delayed rewards",
        ],
        correctIndex: 0,
        explanation:
          "No labels of 'unusual' exist, so it's unsupervised. The core failure mode is conflating low probability with undesirable behavior — a first-ever legitimate event is rare yet fine.",
      },
      {
        question:
          "Why is the paradigm a property of the supervision signal rather than the model architecture?",
        options: [
          "Because only neural networks can switch paradigms",
          "Because the same model family (e.g. a neural net or trees) can be trained supervised, self-supervised, or as part of an RL policy — what differs is what feedback arrives after a prediction",
          "Because architecture choice is irrelevant to accuracy",
        ],
        correctIndex: 1,
        explanation:
          "The defining axis is the feedback: correct answers (supervised), nothing (unsupervised), or delayed reward (RL). One architecture can serve all three.",
      },
      {
        question:
          "A recommendation system shows an item, the user clicks or not within seconds, and the system updates. Actions barely change future state. Best framing?",
        options: [
          "Full reinforcement learning, because there is a reward",
          "Pure unsupervised clustering of users",
          "A contextual bandit — immediate reward, negligible state transitions, so full RL's instability isn't justified",
        ],
        correctIndex: 2,
        explanation:
          "Immediate reward and no meaningful state transitions is the textbook bandit case. Full RL adds complexity and sample cost that this problem doesn't repay.",
      },
      {
        question:
          "You have 1M images but only 5K are labeled. An interviewer asks the most cost-effective path to a strong classifier. Strongest answer?",
        options: [
          "Discard the 995K unlabeled images; they add nothing without labels",
          "Self-supervised or semi-supervised pretraining on all 1M, then fine-tune on the 5K labels",
          "Train only on the 5K and rely on heavy regularization",
        ],
        correctIndex: 1,
        explanation:
          "The unlabeled mass is the asset. Self-supervised pretraining learns a representation for free, and the 5K labels anchor the downstream task — far better than ignoring 99.5% of the data.",
      },
      {
        question:
          "What is the central danger of a poorly designed reward function in reinforcement learning?",
        options: [
          "The agent learns too slowly to be useful",
          "Reward hacking — the agent maximizes the literal reward via behavior that violates the true intent (e.g. maximizing time-on-site by enraging users)",
          "Rewards make the problem unsupervised",
        ],
        correctIndex: 1,
        explanation:
          "Agents optimize the reward they are given, not the goal you meant. If a controllable action can inflate reward without serving intent, the agent will exploit it.",
      },
      {
        question:
          "Clustering returns exactly 4 groups and a PM wants to ship them as 4 customer segments. The senior response is:",
        options: [
          "Ship immediately — 4 clusters means 4 real segments",
          "Clusters optimize geometric compactness, not business meaning; validate each cluster against known outcomes (churn, spend) and confirm the k=4 choice before naming them",
          "Re-run with k=10 because more clusters are always more informative",
        ],
        correctIndex: 1,
        explanation:
          "Cluster count is a modeling choice and clusters carry no inherent meaning. They must be validated against external signals before being treated as actionable segments.",
      },
      {
        question:
          "In supervised fraud detection where labels (chargebacks) arrive 90 days late, what is the most important consequence?",
        options: [
          "The model is always trained on stale fraud and is structurally blind to the newest adversarial patterns, motivating an unsupervised/anomaly layer for the unlabeled recent window",
          "Late labels improve accuracy because they are more certain",
          "Label latency only affects regression, not classification",
        ],
        correctIndex: 0,
        explanation:
          "Slow labels mean the freshest, most adversarial fraud is unlabeled at train time. A density/anomaly component can cover that recent window the supervised model cannot.",
      },
      {
        question:
          "How does self-supervised learning differ from classic unsupervised learning?",
        options: [
          "They are identical terms",
          "Self-supervised invents a target from the data itself (e.g. predict a masked token) and trains with a supervised loss, whereas classic unsupervised has no target at all",
          "Self-supervised always requires human labels; unsupervised never does",
        ],
        correctIndex: 1,
        explanation:
          "Self-supervised manufactures pseudo-labels from structure in the data and then trains exactly like supervised learning — the engine behind modern pretraining. Classic unsupervised never defines a target.",
      },
    ],
  },

  "ml-f2": {
    durationLabel: "18–20 min",
    outcomes: [
      "Decompose expected test error into **bias², variance, and irreducible noise**, and say *which term each lever moves*.",
      "Diagnose underfitting vs overfitting from the **gap between train and validation error**, not from a single accuracy number.",
      "Read a **learning curve** (error vs training-set size) and a **complexity curve** (error vs capacity) to decide whether to get *more data* or a *different model*.",
      "Avoid the senior traps: **double descent**, **leakage that masquerades as low bias**, and **confusing estimation bias with fairness bias**.",
    ],
    learnMarkdown: `## The one decomposition that organizes everything

For a model \`f̂\` trained on a random dataset, the *expected* squared error on a fresh point \`x\` decomposes — exactly, under squared loss — into three terms:

\`\`\`
E[(y - f̂(x))²] = Bias[f̂(x)]²  +  Var[f̂(x)]  +  σ²
                 ───────────     ──────────     ───
                 systematic       sensitivity    irreducible
                 wrongness        to the sample   noise floor
\`\`\`

- **Bias²** — how far the *average* prediction (over many training sets) is from the truth. High bias = the model family literally cannot represent the pattern. *You can't fit a line to a parabola no matter how much data you have.*
- **Variance** — how much the prediction *wobbles* if you reshuffle the training set. High variance = the model is chasing the particular noise in *this* sample.
- **σ² (irreducible)** — noise in the world itself (a coin flip, sensor jitter, mislabeled rows). No model removes it. It sets the **floor** on achievable error.

This is not an analogy; it is an identity. Internalize it and you can answer almost any "is this underfitting or overfitting" question by asking *which term is large and which lever moves it.*

## The motivation: the model that aced the offline eval and tanked online

A growth team ships a churn model. Offline AUC is **0.94** — the best the company has ever seen. Three weeks after launch, the retention campaign it powers shows **zero lift**. Leadership wants to know: did we *memorize noise* (variance) or did we *never capture the real driver* (bias) — or is something else broken entirely?

Here is the senior diagnostic, in order:

1. **Look at train vs validation error, not just one number.** Train AUC 0.99, validation 0.94. The 0.05 gap is suspicious but not damning. The *real* tell: validation was computed on a random split, but churn is *time-ordered*. Re-split by time → validation AUC collapses to 0.71. The 0.94 was **leakage** — a feature (\`days_since_last_login\`) was computed *after* the churn window, smuggling the future into the present. **Leakage looks exactly like miraculously low bias.** (We dissect this in ml-f3.)
2. **After fixing leakage**, train 0.88 / validation 0.71. Now the gap is large → **high variance**. The model has 400 features and 8,000 rows. Levers: regularize, cut features, get more rows, or ensemble.
3. **Counterfactual:** had train been 0.72 *and* validation 0.71 — small gap, both mediocre — that is **high bias**. No amount of regularization helps; you need *richer features or a more expressive model.*

The whole investigation is "which error term is large, and is the gap real or an artifact?" That is the bias–variance lens in action.

## Reading the two curves every senior draws on the whiteboard

**Complexity curve — error vs model capacity (fixed data).**

| Capacity | Train error | Val error | Regime |
|---|---|---|---|
| Too low | high | high | High bias / underfit |
| Sweet spot | moderate | minimized | Balanced |
| Too high | ~0 | rising again | High variance / overfit |

Train error falls monotonically as capacity rises. Validation error is **U-shaped**: it falls, bottoms out, then climbs as the model starts fitting noise. The minimum of the U is the operating point you want.

**Learning curve — error vs training-set size (fixed model).** This tells you whether *more data* will help:

- **High bias signature:** train and validation curves *converge* to each other, but at a *high* error. They're close and both bad → more data **won't help**; you need a better model. *Stop collecting data.*
- **High variance signature:** a *large persistent gap* between low train error and high validation error, with the gap *slowly closing* as data grows → more data **will help** (or regularize). *Keep collecting data.*

Knowing which curve you're on turns "should we spend $200k labeling more data?" from a guess into a read of two lines.

## The levers, mapped to the term they move

| Lever | Primarily reduces | Cost / risk |
|---|---|---|
| More expressive model / features | Bias | Raises variance |
| More training data | Variance | $$ and time; useless if bias-bound |
| Stronger regularization (L1/L2, dropout, early stop, max-depth) | Variance | Too much re-introduces bias |
| Ensembling / bagging | Variance | Compute, less interpretable |
| Boosting | Bias (then watch variance) | Can overfit if unchecked |
| Feature engineering | Bias | Can leak; can overfit |
| Cleaning labels / better measurement | σ² (the floor) | Often the highest-ROI and most ignored |

The art is that **bias and variance trade off**: most levers that cut one *raise* the other. The exceptions — more data (cuts variance, leaves bias), and reducing irreducible noise via better measurement (cuts the floor) — are the levers seniors reach for first because they don't pay the tradeoff tax.

## Where the classical story breaks: double descent

The clean U-shaped curve is the *classical* picture. In heavily over-parameterized models (deep nets, very wide models), pushing capacity *past* the interpolation threshold — where the model fits training data exactly — can make test error **fall again**. This is **double descent**: error goes down, up (the classical peak at the interpolation point), then *down again* in the over-parameterized regime. It is why "bigger always overfits" is wrong for modern deep learning. The senior nuance: **the classical bias–variance U holds in the under-parameterized regime; modern models often operate to the right of the second descent**, regularized implicitly by SGD and architecture. Don't quote the U-curve as gospel for a 70B-parameter model.

## The intuition behind the tradeoff: dartboards and many training sets

The cleanest mental image is the **dartboard**. The bullseye is the truth; each dart is a model trained on a *different random sample* from the same population. **Bias** is how far the *cluster's center* sits from the bullseye — a systematic miss in one direction. **Variance** is how *spread out* the darts are around their own center — how much the answer jumps when you reshuffle the data.

- **High bias, low variance:** tight cluster, but off-target. A linear model on curved data — wrong the same way every time.
- **Low bias, high variance:** centered on average, but scattered everywhere. A deep tree grown to the leaves — right *on average over many samples*, wildly different on any single one.
- **The trap:** you only ever *get one training set in real life*. You never see the cluster — you see one dart. That is exactly why a single train/test split is a noisy estimate and why cross-validation (ml-f3) exists: it gives you a *sense of the spread* by resampling the one dataset you have. When someone says "my model got 0.86," your senior instinct should be "0.86 ± *what*, over how many splits?"

This is also why **ensembling reduces variance specifically**: averaging many high-variance, low-bias models (bagging) shrinks the spread of the dart cluster without moving its center — you keep the low bias and kill the variance. Boosting works the other end: it stacks weak, high-bias learners to *move the cluster onto the bullseye*, reducing bias (and you then watch variance creep up).

## Pitfalls senior interviewers probe

- **Judging fit from one accuracy number.** A single 0.92 tells you nothing about bias vs variance. You need *the gap* between train and a leakage-free validation.
- **Leakage disguised as low bias.** A feature computed using post-label information will make train *and* a naive validation look brilliant — until production. Always ask "could this feature exist at prediction time?"
- **Throwing data at a bias problem.** If train and val have already converged at a high error, more data is wasted money. Diagnose with a learning curve *first*.
- **Over-regularizing into underfitting.** Crank L2 too hard and you trade a variance problem for a bias problem — the val error gets *worse* in a different way.
- **Quoting the U-curve for over-parameterized nets.** Double descent means the classical intuition can invert. Know the regime you're in.
- **Conflating statistical bias with fairness bias.** In an ML-systems interview, "bias" might mean *the bias² term* or *systematic harm to a group*. **Disambiguate explicitly**: "Do you mean estimation bias or social/fairness bias?" They have different cures.

## Interview questions you should be able to answer cold

- "Train error 0.30, val error 0.32. What's wrong and what do you do?" (*Both high, tiny gap → high bias / underfit. More data won't help; add capacity, features, or a richer model.*)
- "Train error 0.02, val error 0.28. What's wrong and what do you do?" (*Huge gap → high variance / overfit. Regularize, more data, simpler model, ensemble — and first rule out leakage.*)
- "Draw error vs training-set size and tell me when more data helps." (*Converged-and-high → bias, more data useless. Wide-gap-slowly-closing → variance, more data helps.*)
- "Your val AUC is 0.95 but production is 0.70. Walk me through the diagnosis." (*Suspect leakage or distribution shift first; re-split by time; check whether any feature uses post-label information.*)
- "Why does the classic bias–variance U-curve fail for large neural nets?" (*Double descent: past the interpolation threshold, test error can fall again; implicit regularization from SGD/architecture.*)
- "How is the bias² term different from algorithmic fairness bias?" (*One is the systematic component of prediction error under a model family; the other is systematic harm across protected groups — different definitions, different fixes.*)`,
    video: null,
    videoFallbackMarkdown: `## Deep dive without video

Sketch **two** plots side by side from memory and label every region:

1. **Complexity curve:** x-axis = model capacity, two lines = train error (monotonically falling) and validation error (U-shaped). Mark the underfit zone, the sweet spot at the U's minimum, and the overfit zone.
2. **Learning curve:** x-axis = training-set size, two lines = train and validation error. Draw it twice: once for a *high-bias* model (lines converge at a high error — more data won't help) and once for a *high-variance* model (a wide gap that slowly closes — more data helps).

Then write one sentence for each lever — regularization, more data, more features — naming **which term it moves and which it costs**. If you can produce both plots and the lever sentences without notes, you can defend any "underfit or overfit?" question.`,
    tryGuidance: `Drag the **complexity** dial in the lab and watch bias², variance, and total error move in real time. **Before** you touch it: predict which curve dominates the error when the model is *too simple*, and which dominates when it's *too complex* — then find the U-curve minimum yourself.`,
    knowledgeCheck: [
      {
        question:
          "A model shows train error 0.31 and validation error 0.33. What is the diagnosis and the correct first lever?",
        options: [
          "High variance; add strong L2 regularization",
          "High bias (underfitting); increase model capacity / add features — more data will not help",
          "Perfect generalization; ship it",
        ],
        correctIndex: 1,
        explanation:
          "Both errors are high with a tiny gap — the model can't represent the pattern (bias). Regularizing or adding data won't help; you need more expressive capacity or better features.",
      },
      {
        question:
          "Under squared loss, expected test error decomposes into bias², variance, and irreducible noise. Which lever reduces the *irreducible* term?",
        options: [
          "Stronger regularization",
          "A more expressive model",
          "Improving measurement / cleaning labels so the world's noise entering the target shrinks",
        ],
        correctIndex: 2,
        explanation:
          "Irreducible error (σ²) is noise in the data-generating process. No model removes it, but better measurement and cleaner labels can lower the floor itself — often the highest-ROI, least-used lever.",
      },
      {
        question:
          "On a learning curve (error vs training-set size), train and validation error have converged and both sit at 0.25. What does this tell you?",
        options: [
          "Collecting more data is the priority — the curves will keep dropping",
          "You are bias-bound; more data is wasted money, so change the model or features",
          "It indicates severe overfitting",
        ],
        correctIndex: 1,
        explanation:
          "Converged-and-high is the high-bias signature. Adding rows moves nothing because the model family itself can't fit the pattern. Diagnose this before spending on labels.",
      },
      {
        question:
          "An offline model scores 0.95 AUC but production is 0.70. Which is the most likely first cause to investigate?",
        options: [
          "Leakage or temporal distribution shift — re-split by time and check whether any feature uses post-label information",
          "The model is underfitting and needs more capacity",
          "Irreducible noise suddenly increased in production",
        ],
        correctIndex: 0,
        explanation:
          "A large offline→online gap most often signals leakage (a feature smuggling the future in) or a train/serve distribution mismatch. Leakage mimics miraculously low bias offline.",
      },
      {
        question:
          "Why can the classical U-shaped bias–variance curve fail to describe a very large neural network?",
        options: [
          "Neural networks have no variance",
          "Double descent: past the interpolation threshold, increasing capacity further can make test error decrease again, aided by implicit regularization from SGD/architecture",
          "Bias and variance don't apply to deep learning at all",
        ],
        correctIndex: 1,
        explanation:
          "In the over-parameterized regime, test error can descend a second time after the classical peak. The U-curve intuition holds under-parameterized but inverts for modern large models.",
      },
      {
        question:
          "You diagnose high variance and crank L2 regularization very hard. Validation error gets worse, not better. Why?",
        options: [
          "Regularization can only ever help; the data must be corrupted",
          "You over-regularized into the high-bias regime — too strong a penalty shrinks the model below the capacity needed to fit the real signal",
          "L2 regularization increases variance",
        ],
        correctIndex: 1,
        explanation:
          "Regularization trades variance for bias. Past the sweet spot it suppresses real signal, converting an overfitting problem into an underfitting one.",
      },
      {
        question:
          "An interviewer asks about 'bias' in your model. What is the senior move before answering?",
        options: [
          "Assume they mean overfitting and discuss regularization",
          "Disambiguate: clarify whether they mean the bias² term of estimation error or algorithmic/fairness bias (systematic harm to a group), since the cures differ",
          "Explain that bias and variance are the same thing",
        ],
        correctIndex: 1,
        explanation:
          "'Bias' is overloaded. Statistical bias (a component of error) and fairness bias (systematic group harm) need different diagnoses and fixes; clarifying first signals seniority.",
      },
      {
        question:
          "Train error 0.02, validation error 0.27, and you've confirmed there is no leakage. Which set of levers is appropriate?",
        options: [
          "Regularize, gather more data, simplify the model, or ensemble (bagging) — all reduce variance",
          "Add more features and a deeper model to reduce bias",
          "Nothing — the low train error means the model is excellent",
        ],
        correctIndex: 0,
        explanation:
          "A large gap with near-zero train error is classic high variance. Once leakage is ruled out, the right levers all reduce sensitivity to the sample: regularization, more data, simpler models, bagging.",
      },
    ],
  },

  "ml-f3": {
    durationLabel: "18–20 min",
    outcomes: [
      "Justify *why* the test set must be touched **exactly once**, and what statistical guarantee you forfeit the moment you peek.",
      "Choose the right resampling scheme — **k-fold, stratified, grouped, or time-series** CV — from the *structure of the data*, not habit.",
      "Detect and prevent the four leakage families: **target leakage, train/test contamination, temporal leakage, and group leakage**.",
      "Explain why **preprocessing must be fit inside the CV loop** and what 'fitting the pipeline on all data' silently inflates.",
    ],
    learnMarkdown: `## Why we split at all: the only honest estimate of the future

A model's training error is a *lie about the future*. It measures how well you memorized data you already have — and you can always memorize harder. The thing you actually care about is **generalization**: performance on data the model has never seen and will see in production. The only way to *estimate* that honestly is to *withhold* some data and pretend it's the future.

The canonical split:

- **Train** — the model fits its parameters here.
- **Validation (dev)** — you tune *hyperparameters and choices* here (model family, regularization strength, threshold, features). You look at this *many* times.
- **Test** — a vault. You open it **once**, at the very end, to report an unbiased estimate of generalization. The moment you tune anything based on the test set, it is no longer a test set — it has become a second validation set, and your reported number is optimistically biased.

This is the part juniors miss: **every decision you make using a dataset overfits to that dataset.** Validation error is itself an *underestimate* of true error because you chose the best-of-many configurations on it (the "multiple comparisons" / winner's-curse problem). The test set exists precisely to give you one number untainted by selection.

## The motivation: the Kaggle-winning model that lost money

A lending startup builds a default-prediction model. Cross-validated AUC: **0.91**. They deploy. Real-world AUC: **0.68**. Post-mortem reveals three independent leaks, each a textbook example:

1. **Target leakage.** A feature \`num_collection_calls\` was included. Collection calls only happen *after* a borrower has already started defaulting. The model wasn't predicting default — it was *observing* it. **A feature that could not exist at prediction time was the model's best predictor.**
2. **Preprocessing leakage.** They computed the mean for imputation and the scaler statistics on the *entire dataset* before splitting. The training folds therefore "knew" the mean of the test fold. Subtle, but it inflates CV scores by leaking summary statistics across the boundary.
3. **Temporal leakage.** They used random k-fold on time-ordered loans. So the model trained on loans from *2023* and was validated on loans from *2021* — it was predicting the past from the future. In production, only the past is available.

Any *one* of these turns a 0.68 model into a 0.91 mirage. Leakage is the single most common reason "great offline models" die in production, and detecting it is a senior signal.

## k-fold cross-validation: more honest with small data

A single train/val split wastes data and is noisy — your estimate depends on *which* rows landed in val. **k-fold CV** fixes both: partition the data into k folds, train on k−1, validate on the held-out one, rotate k times, average. Every row is used for validation exactly once; every row trains the model k−1 times. With k=5 or k=10 you get a *mean and a variance* of performance — the variance tells you how stable your estimate is. **Leave-one-out** (k=n) is the extreme: near-unbiased but high-variance and expensive, rarely worth it.

The crucial discipline: **the test set still stays in the vault.** CV happens *within* train+val. You do not cross-validate over the test set.

## Choosing the right CV scheme — the data dictates it

Plain random k-fold assumes rows are **i.i.d.** Real data usually isn't. Pick the scheme that matches the dependency structure:

| Data structure | Scheme | Why |
|---|---|---|
| i.i.d., balanced classes | Random k-fold | Default, simplest |
| Imbalanced classes | **Stratified** k-fold | Keeps class ratio in every fold so rare-class metrics are stable |
| Repeated entities (multiple rows per user/patient/store) | **Grouped** k-fold | Keep all of an entity's rows on the *same side* — else the model memorizes the entity |
| Time-ordered (forecasting, anything with drift) | **Time-series** split (expanding/rolling window) | Always train on the past, validate on the future — never shuffle |
| Spatial | Spatial/blocked CV | Nearby points are correlated; block them |

The two that interviewers love to catch you on: **grouped** and **time-series**. If you have 50 transactions per customer and you random-split, the *same customer* appears in both train and val — the model learns "this is customer #4821" and your CV score is fantasy. And if there is *any* temporal ordering or drift, random k-fold lets the model see the future. **When in doubt about time, never shuffle.**

## The non-negotiable rule: fit preprocessing inside the loop

This is where careful engineers still slip. Every transform that *learns from data* — imputation means, scaler statistics (μ, σ), target encoding, feature selection, PCA components, SMOTE oversampling — must be **fit on the training fold only**, then *applied* to the validation fold. If you fit them on the full dataset before splitting, the validation fold's information bleeds into the transform, and your CV score is optimistically biased.

The clean abstraction: **build a single pipeline** (\`preprocessing → model\`) and pass the *whole pipeline* to CV. The framework refits the entire pipeline on each fold's training portion, guaranteeing no statistic crosses the boundary. "Scale first, then split" is one of the most common silent leaks in real code, and it is invisible — your numbers just look slightly too good.

## The four leakage families — a checklist

- **Target leakage** — a feature contains information about the label that won't be available at prediction time (\`num_collection_calls\`, \`days_until_churn\`, a post-event timestamp). *Test:* "Could this value exist *before* the label is known, in production?" If no, drop it.
- **Train/test contamination** — the same or near-duplicate rows in both sides (dedup *before* splitting; group near-duplicates), or preprocessing statistics fit across the split.
- **Temporal leakage** — using future information to predict the past, or random-splitting time-ordered data. *Fix:* time-based splits, and ensure every feature uses only data available *as of* the prediction timestamp.
- **Group leakage** — correlated rows (same user/patient/device) split across folds, letting the model memorize the entity. *Fix:* grouped CV.

## A worked mental walk-through of 5-fold CV

Make this concrete so you can narrate it in an interview. You have 1,000 rows. Reserve 200 as the **test vault** — untouched until the end. The remaining 800 go into 5-fold CV:

1. Split the 800 into five folds of 160 each (stratified if classes are imbalanced, grouped if entities repeat).
2. **Fold 1:** train the *entire pipeline* (impute → scale → encode → model) on folds 2–5 (640 rows), then score on fold 1 (160 rows). Record the metric.
3. Rotate: fold 2 is held out, train on 1,3,4,5; and so on through fold 5.
4. You now have **five scores**. Report their *mean and standard deviation* — e.g. \`0.83 ± 0.02\`. The mean is your estimate of generalization; the std tells you how much that estimate depends on the luck of the split.
5. Pick your hyperparameters by *which configuration has the best CV mean* (this is where selection happens). Then refit on all 800 and report the **single test-vault number** as your final, unbiased estimate.

Two things make or break this. First, the pipeline is refit *inside every fold* — the imputation mean and scaler μ/σ for fold 1 are computed from folds 2–5 only, never from fold 1. Second, the test vault never participates in CV; if it did, your "final" number would be contaminated by the same selection that produced the model.

## Pitfalls senior interviewers probe

- **Tuning on the test set.** The most damaging and most common. Once you make *any* choice based on test performance, the number is no longer unbiased. Use a held-out validation (or nested CV).
- **Scaling/imputing before splitting.** Leaks summary statistics. Always fit transforms inside the fold.
- **Random k-fold on time series.** Trains on the future. Use forward-chaining splits.
- **Random k-fold with repeated entities.** Memorizes the entity. Use grouped CV.
- **Reporting CV mean without the variance.** A 0.84 ± 0.01 and a 0.84 ± 0.12 are *very* different stories. Always report the spread.
- **Nested-CV confusion.** When you both *select* hyperparameters and *estimate* performance, you need an *outer* loop for estimation and an *inner* loop for selection — otherwise the reported score is biased upward.

## Interview questions you should be able to answer cold

- "Why can you only look at the test set once?" (*Each decision made on a dataset overfits to it; the test set's single use is what makes its number an unbiased generalization estimate.*)
- "You have 10 visits per patient and 5,000 patients. How do you split?" (*Grouped CV by patient — never let a patient appear in both train and val, or the model memorizes the patient.*)
- "Your CV AUC is 0.91, production is 0.68. Where do you look first?" (*Leakage: target features that post-date the label, preprocessing fit before split, and random-splitting time-ordered data.*)
- "Why is StandardScaler.fit() on the whole dataset a bug?" (*It leaks the validation/test mean and variance into training; fit on the training fold and transform the rest, inside a pipeline.*)
- "When is plain k-fold wrong?" (*Whenever rows aren't i.i.d.: time ordering → time-series split; repeated entities → grouped; class imbalance → stratified.*)
- "What is nested cross-validation for?" (*Unbiased performance estimation when you also tune hyperparameters: an inner loop selects, an outer loop estimates, so selection doesn't contaminate the estimate.*)`,
    video: null,
    videoFallbackMarkdown: `## Deep dive without video

Take a dataset you know (or invent one: hospital readmission with multiple visits per patient, ordered by date). Write down, *before touching code*:

1. **Is it i.i.d.?** If there are repeated entities → grouped CV. If there is time ordering → time-series split. If classes are imbalanced → stratified.
2. **List every feature and ask:** "Could this value exist *before* the label is known, in production?" Cross out every feature that fails — those are target leaks.
3. **Trace the preprocessing:** where do you compute the imputation mean and the scaler μ/σ? If it's before the split, you have a leak. Rewrite it as a pipeline fit *inside* each fold.

Then state the guarantee you'd forfeit by tuning a threshold on the test set. If you can do all three for an unfamiliar dataset, you can defend any validation-design question.`,
    tryGuidance: `In the lab, step through k-fold cross-validation fold by fold and watch which rows train vs validate, and how the per-fold score varies. **Predict first:** what happens to the validation score if you (mentally) move a preprocessing step *outside* the loop, or random-split data that's secretly time-ordered?`,
    knowledgeCheck: [
      {
        question:
          "Why must the test set be evaluated exactly once, at the very end?",
        options: [
          "To save compute",
          "Because every choice made using a dataset overfits to it; a single, final use is what keeps the test number an *unbiased* estimate of generalization",
          "Because test sets are always smaller than validation sets",
        ],
        correctIndex: 1,
        explanation:
          "Tuning anything on the test set turns it into a second validation set and biases its score upward. Its one-time use is precisely what makes it honest.",
      },
      {
        question:
          "You have ~10 visits per patient for 5,000 patients and want to predict readmission. Which CV scheme, and why?",
        options: [
          "Random k-fold, because more shuffling reduces variance",
          "Grouped k-fold by patient, so no patient appears in both train and validation",
          "Leave-one-out, because the dataset is large",
        ],
        correctIndex: 1,
        explanation:
          "Multiple correlated rows per entity must stay on one side of the split. Random splitting lets the model memorize the patient, inflating CV scores far above production reality.",
      },
      {
        question:
          "A feature `num_collection_calls` is the strongest predictor of loan default. What is the problem?",
        options: [
          "Target leakage — collection calls happen *after* default begins, so the feature can't exist at prediction time",
          "Nothing; strong predictors should always be kept",
          "It causes high variance but is otherwise fine",
        ],
        correctIndex: 0,
        explanation:
          "The feature is a *consequence* of the label, not a cause available beforehand. In production it would be unknown at scoring time, so the offline score is a mirage.",
      },
      {
        question:
          "Why is calling `StandardScaler.fit()` on the entire dataset before splitting a bug?",
        options: [
          "It runs too slowly on large data",
          "It leaks the validation/test mean and variance into the training transform, optimistically biasing CV scores; the scaler must be fit on the training fold only",
          "StandardScaler should never be used with cross-validation",
        ],
        correctIndex: 1,
        explanation:
          "Fitting transforms on all data lets held-out summary statistics bleed into training. Wrap preprocessing and model in a pipeline so each fold refits only on its training portion.",
      },
      {
        question:
          "Data is time-ordered with clear drift. What is wrong with random k-fold?",
        options: [
          "Nothing — randomization is always safer",
          "It trains on future records to predict past ones, an information flow impossible in production; use a forward-chaining time-series split instead",
          "It only matters for regression, not classification",
        ],
        correctIndex: 1,
        explanation:
          "Random folds mix future and past. In deployment only the past is available, so temporal splits (expanding/rolling window) are required to estimate real performance.",
      },
      {
        question:
          "What does nested cross-validation provide that a single CV loop does not?",
        options: [
          "Faster training",
          "An unbiased performance estimate when you *also* tune hyperparameters: the inner loop selects, the outer loop estimates, so selection doesn't contaminate the reported score",
          "Automatic feature engineering",
        ],
        correctIndex: 1,
        explanation:
          "Selecting hyperparameters on the same folds used to report performance biases the estimate. Nested CV separates selection (inner) from estimation (outer).",
      },
      {
        question:
          "When reporting a 5-fold CV result, why is the *variance* across folds important, not just the mean?",
        options: [
          "It isn't; only the mean matters",
          "0.84 ± 0.01 and 0.84 ± 0.12 imply very different stability and risk, even with the same mean — the spread reveals how dependent the estimate is on the particular split",
          "Variance is only relevant for regression targets",
        ],
        correctIndex: 1,
        explanation:
          "Fold-to-fold spread quantifies estimate stability. A high variance warns that a single split could mislead you and that the model's performance is fragile.",
      },
      {
        question:
          "Classes are heavily imbalanced (2% positive). Which CV scheme best protects rare-class metrics?",
        options: [
          "Stratified k-fold, which preserves the class ratio in every fold",
          "Leave-one-out, which is unbiased",
          "Random k-fold with a very large k",
        ],
        correctIndex: 0,
        explanation:
          "With 2% positives, random folds can land with too few (or zero) positives, making per-fold metrics unstable. Stratification keeps the positive ratio constant across folds.",
      },
    ],
  },

  "ml-f4": {
    durationLabel: "18–20 min",
    outcomes: [
      "Explain why **feature engineering injects the domain knowledge a model can't discover**, and when a transform changes a problem from *unlearnable* to *trivial*.",
      "Choose transforms deliberately — **log/Box-Cox, binning, interactions, ratios, cyclical encodings, target encoding** — based on the feature's distribution and the model family.",
      "Engineer features that respect the **point-in-time constraint**, so nothing you build leaks the future or breaks at serving time.",
      "Avoid the senior traps: **leakage via target encoding, the curse of dimensionality from naive crossing, train/serve skew, and over-engineering past what the model needs**.",
    ],
    learnMarkdown: `## The premise: the model is only as smart as the coordinates you give it

A learning algorithm searches for patterns *in the coordinate system you hand it*. If the true signal is invisible in those coordinates, no amount of capacity will find it. Feature engineering is the act of **re-drawing the coordinate system so the signal becomes visible** — it is where your *domain knowledge* enters the model, the one thing the algorithm cannot invent on its own.

The cleanest illustration: predict whether a point is inside a circle from raw \`(x, y)\`. A linear model *cannot* draw a circle — it draws lines. It will fail forever. But add **one** engineered feature, \`r² = x² + y²\`, and the boundary becomes \`r² < threshold\` — a *single linear split* in the new coordinate. The data didn't change; the *representation* did. That is feature engineering in one picture: a transform that turns an unlearnable problem into a trivial one.

## The motivation: the demand-forecasting team that 10×'d accuracy without changing the model

A retailer forecasts daily store demand. The first model — gradient boosting on raw columns (\`date\`, \`store_id\`, \`price\`, \`temperature\`) — is mediocre. The team doesn't touch the algorithm. They engineer:

- **Cyclical time:** \`day_of_week\` and \`month\` aren't ordinal — Sunday (6) isn't "greater than" Monday (0), and December (12) is adjacent to January (1). They encode each as **\`sin(2π·t/period)\` and \`cos(2π·t/period)\`**, so the model sees the *wrap-around* and learns weekly/seasonal rhythm.
- **Lag and rolling features:** \`sales_7d_ago\`, \`rolling_mean_28d\`, \`rolling_std_28d\` — demand's best predictor is its own recent history, which the raw row never exposed.
- **Ratios over raw magnitudes:** \`price / category_avg_price\` (relative price) beats absolute price, because shoppers respond to *relative* deals.
- **Log-transformed targets and skewed inputs:** demand is right-skewed with occasional spikes; modeling \`log(1 + sales)\` stabilizes variance and stops a few huge days from dominating the loss.
- **Interaction:** \`is_weekend × is_promo\` — promotions behave differently on weekends, an effect neither feature captures alone.

Same model, same data rows. Accuracy improves dramatically because the *information was always there* — it just wasn't expressed in coordinates the model could use. This is why senior practitioners say "feature engineering, not model selection, is where most real-world gains come from" (outside pure deep learning, where the network learns features for you — at the cost of far more data).

## The transform toolkit, and when each earns its place

**Monotone transforms for skew — log, sqrt, Box-Cox.** Right-skewed positive features (income, counts, prices, durations) compress the long tail. \`log(1 + x)\` is the workhorse (handles zeros). This helps linear models (which assume roughly symmetric, additive effects) and any distance-based method; it barely matters for trees, which only care about *order*, not scale. **Match the transform to the model family.**

**Binning / discretization.** Convert a continuous feature into ranges (\`age → [<18, 18-35, 35-65, 65+]\`). Buys you non-linearity in a linear model and robustness to outliers, at the cost of throwing away within-bin resolution. Useful when the relationship is *step-like* (legal age, pricing tiers). For trees this is mostly redundant — they bin implicitly.

**Interactions and ratios.** Trees discover some interactions automatically; linear models *never* do unless you build them. \`bmi = weight / height²\`, \`clicks / impressions\` (CTR), \`debt / income\`. Ratios encode domain relationships in one column and are often far more predictive than the two raw features.

**Cyclical encoding.** Any periodic feature (hour, day-of-week, month, wind direction) must be encoded so the model knows 23:00 is *adjacent* to 00:00. The sin/cos pair does this; raw integers wrongly imply 23 is "far" from 0.

**Aggregations / target statistics.** "Average order value *for this user's segment*", "fraud rate *for this merchant*". Extremely powerful — and the most dangerous, because they invite leakage (below).

**Date/text/geo decomposition.** A timestamp is not one feature; it's \`hour, day-of-week, is-holiday, days-since-signup, is-month-end\`. Free text → counts, embeddings, sentiment. Lat/long → distance to known points, region. The raw field is almost never the right feature.

## The point-in-time constraint: the rule that governs all of it

Every engineered feature must be answerable using **only information available strictly before the prediction timestamp**. Violate this and you've built a leak (see ml-f3). Two senior traps:

- **Target encoding leakage.** Replacing a categorical with "the mean target for this category" (e.g. \`merchant → historical fraud rate\`) is powerful but leaks the label *of the current row into its own feature* unless you compute it with **out-of-fold / leave-one-out** encoding, or with only *past* data in a time-aware setting. Naive target encoding gives spectacular CV scores that vanish in production.
- **Rolling features that peek.** \`rolling_mean_28d\` must be computed **as of yesterday**, not centered on today. A centered window includes the future. Always lag your aggregations.

This is also where **train/serve skew** bites: a feature you can compute easily in a batch training job (a 90-day average over a clean warehouse table) may be impossible or expensive to compute *online* at request time with the same definition. If the training-time and serving-time computations differ even slightly, the model degrades silently. A feature you can't reproduce at serving time is a liability, no matter how predictive offline.

## The encoding-vs-feature distinction, and why both live here

There is a useful split in your head between *encoding* (mechanically turning a value into something a model can ingest — covered fully in ml-f5) and *feature creation* (inventing a new column that carries signal the raw data hid). This lesson is about the second. A junior asks "how do I turn this categorical into numbers?"; a senior asks "what *new column*, derived from these raw fields and my domain knowledge, exposes the pattern the model is blind to?"

Concretely, given a raw e-commerce row \`{ timestamp, user_id, item_price, cart_total }\`, the encodings are obvious (one-hot the category, scale the price). The *features* are where the craft lives:

- \`item_price / cart_total\` — what fraction of the basket is this item? A relative signal neither raw column carries.
- \`hours_since_last_order\` — recency, computed point-in-time, often the single strongest churn/repeat predictor.
- \`is_first_purchase\` — a boolean derived from order history that flips the meaning of every other feature.
- \`price_vs_user_median\` — is this unusually expensive *for this user*? Personalized context the global price can't express.

None of these exist in the raw schema. Each encodes a *hypothesis about behavior*. That is the difference between feature engineering and mere data wrangling: every good feature is a small, testable theory of why the target moves.

## Diagnostic table — pick the transform

| Feature looks like… | Likely transform | Helps which models |
|---|---|---|
| Right-skewed positive (income, counts) | log(1+x) / Box-Cox | Linear, distance-based |
| Periodic (hour, month, direction) | sin/cos pair | All |
| Two features whose *ratio* matters | explicit ratio | Linear (trees less so) |
| Step-like relationship / regulatory cutoff | binning | Linear |
| High-cardinality category | target / frequency encoding (out-of-fold) | All — leak-prone |
| Effect depends on *combination* | interaction term | Linear (trees partial) |
| Timestamp | decompose: dow, hour, is-holiday, lags | All |

## Pitfalls senior interviewers probe

- **Target-encoding leakage.** The single most common "great offline, dead online" feature. Always out-of-fold or strictly past-only.
- **Naive feature crossing.** Crossing two high-cardinality categoricals explodes dimensionality (curse of dimensionality), creates sparse, overfit-prone columns, and most crosses are noise. Cross deliberately, hash if needed.
- **Train/serve skew.** A feature defined differently (or unavailable) at serving time silently rots the model. Engineer with the serving path in mind.
- **Centered/peeking rolling windows.** Aggregations must look strictly backward.
- **Over-engineering.** Trees and deep nets capture many interactions and non-linearities themselves. Hand-building hundreds of features that the model would find anyway adds maintenance cost and overfitting surface without lift. Engineer where the model is *blind* (cyclical structure, ratios, point-in-time aggregates), not where it isn't.
- **Forgetting the model family.** Log-transforms and explicit interactions matter enormously for linear models and barely for trees. The right feature set depends on the learner.

## Interview questions you should be able to answer cold

- "A linear model can't separate points inside vs outside a circle. Fix it with one feature." (*Add r² = x² + y²; the boundary becomes a single linear threshold in the new coordinate.*)
- "How do you encode 'hour of day' so the model knows 23:00 is next to 00:00?" (*Cyclical sin/cos encoding; raw integers wrongly make 23 far from 0.*)
- "Target encoding gave 0.93 CV but 0.71 in production. What happened and how do you fix it?" (*Leakage — the row's own label leaked into its feature; use out-of-fold or strictly-past target encoding.*)
- "When does a log transform help and when is it pointless?" (*Helps linear/distance models on right-skewed positives; nearly pointless for trees, which only use rank order.*)
- "Your offline feature is a 90-day warehouse average. Why might it fail in production?" (*Train/serve skew — if it can't be computed identically and cheaply online, the served features differ from the trained ones.*)
- "Why not just build every possible interaction and let regularization sort it out?" (*Curse of dimensionality, sparsity, train/serve cost, and overfitting surface; deliberate, domain-driven features beat brute force.*)`,
    video: null,
    videoFallbackMarkdown: `## Deep dive without video

Take a single raw timestamp column, e.g. \`2026-06-02T23:40:00\` for an e-commerce order, and write down **every** feature you could responsibly derive from it without leaking the future:

- Decompositions: hour, day-of-week, is-weekend, is-month-end, is-holiday, days-since-signup.
- Cyclical: sin/cos of hour and of day-of-week (so 23:00 sits next to 00:00).
- Point-in-time aggregates: orders in the *prior* 7 days, rolling 28-day spend **as of yesterday** (never centered on today).

For each feature, answer the governing question out loud: **"Could I compute this, with the identical definition, at serving time, using only data available before the prediction?"** Cross out any that fail. The survivors are your real feature set — and the discipline of that one question is most of feature engineering.`,
    tryGuidance: `In the lab, pick a transform (raw, log, binned, or an interaction/ratio feature) and watch how a previously inseparable scatter becomes linearly separable — or how a fitted line snaps to the data. **Predict before you switch:** which transform will make these two classes separable with a single straight boundary?`,
    knowledgeCheck: [
      {
        question:
          "A linear classifier fails to separate points inside vs outside a circle in raw (x, y). What single engineered feature fixes it?",
        options: [
          "log(x) + log(y)",
          "r² = x² + y², which turns the circular boundary into a single linear threshold in the new coordinate",
          "Standardizing x and y to zero mean and unit variance",
        ],
        correctIndex: 1,
        explanation:
          "The signal is the distance from the origin. Adding r² makes the decision boundary 'r² < c' — a linear split the model can represent. Scaling alone doesn't add the missing coordinate.",
      },
      {
        question:
          "Why must 'hour of day' be encoded with a sin/cos pair rather than left as an integer 0–23?",
        options: [
          "To reduce memory usage",
          "Raw integers wrongly imply 23 is far from 0; the sin/cos pair encodes the wrap-around so the model knows 23:00 is adjacent to 00:00",
          "Because integers can't be used in any model",
        ],
        correctIndex: 1,
        explanation:
          "Periodic features need cyclical encoding so adjacency across the wrap point is preserved. Otherwise the model treats late night and early morning as maximally distant.",
      },
      {
        question:
          "Target encoding (replacing a category with its mean target) gives 0.93 CV but 0.71 in production. Most likely cause and fix?",
        options: [
          "The model underfit; add more capacity",
          "Leakage — each row's own label bled into its encoded feature; compute the encoding out-of-fold or using only strictly-past data",
          "The categorical had too few levels; merge them",
        ],
        correctIndex: 1,
        explanation:
          "Naive target encoding lets the current row's label influence its own feature, inflating CV. Out-of-fold or past-only encoding removes the leak and the offline/online gap.",
      },
      {
        question:
          "When does applying a log transform to a feature provide little to no benefit?",
        options: [
          "For tree-based models, which split on rank order and are invariant to monotone transforms",
          "For right-skewed income features",
          "For linear regression with skewed inputs",
        ],
        correctIndex: 0,
        explanation:
          "Trees only use the ordering of values, so any monotone transform (including log) leaves their splits unchanged. Log mainly helps linear and distance-based models on skewed positives.",
      },
      {
        question:
          "Your strongest offline feature is a 90-day average computed from the data warehouse. Why might the model degrade in production?",
        options: [
          "Averages are always less predictive than raw values",
          "Train/serve skew — if the identical definition can't be computed cheaply and consistently at request time, served features diverge from trained ones",
          "90 days is too short a window for any model",
        ],
        correctIndex: 1,
        explanation:
          "A feature easy to build in batch may be impossible or differently-defined online. Any mismatch between training and serving computation silently rots performance.",
      },
      {
        question:
          "Why is crossing two high-cardinality categorical features by brute force usually a bad idea?",
        options: [
          "Interactions never help any model",
          "It explodes dimensionality (curse of dimensionality) into sparse, overfit-prone columns, most of which are noise; cross deliberately or hash instead",
          "Tree models forbid interaction features",
        ],
        correctIndex: 1,
        explanation:
          "The product of two large vocabularies yields a huge, sparse feature space that overfits and is costly. Deliberate, domain-motivated crosses (or hashing) beat brute force.",
      },
      {
        question:
          "A `rolling_mean_28d` feature is computed as a window centered on the prediction date. What is wrong?",
        options: [
          "Nothing; centered windows are more accurate",
          "It includes future observations, leaking information unavailable at prediction time; the window must look strictly backward (as of yesterday)",
          "28 days is too long to be useful",
        ],
        correctIndex: 1,
        explanation:
          "A centered window straddles the prediction point and uses the future. Point-in-time correctness requires lagging the aggregation so it uses only past data.",
      },
      {
        question:
          "For a gradient-boosted tree model with ample data, you hand-build hundreds of pairwise interaction features. The likely effect?",
        options: [
          "Guaranteed large accuracy gain, since more features always help",
          "Often little lift plus added maintenance and overfitting surface — trees already discover many interactions; engineer where the model is blind (cyclical, ratios, point-in-time aggregates)",
          "The model will refuse to train",
        ],
        correctIndex: 1,
        explanation:
          "Trees capture many interactions on their own, so brute-force interaction features add cost and overfitting risk without much gain. Reserve hand engineering for what the learner can't find.",
      },
    ],
  },

  "ml-f5": {
    durationLabel: "18–20 min",
    outcomes: [
      "Explain *which model families are scale-sensitive and which are scale-invariant*, so you scale **only when it changes the answer**.",
      "Choose between **standardization, min-max, and robust scaling** from the feature's distribution and the presence of outliers.",
      "Encode categoricals correctly — **one-hot, ordinal, target, frequency, hashing, embeddings** — matching cardinality and model family, without inventing false order.",
      "Prevent the leakage and skew traps: **fit scalers/encoders on train only**, **handle unseen categories at serving time**, and **avoid the dummy-variable trap**.",
    ],
    learnMarkdown: `## Scaling: the question is *does my model care about distance?*

Scaling rescales numeric features to comparable ranges. Whether you *need* it is not a style choice — it's determined by **how the model uses the numbers**:

- **Scale-sensitive models** — anything that measures *distance* or uses *gradient-based optimization on raw magnitudes*: k-NN, k-means, SVMs (RBF), PCA, and neural networks. For these, a feature measured in *dollars* (range 0–100,000) will *dominate* a feature in *years* (range 0–80) purely because its numbers are bigger. Distance becomes "whoever has the largest units wins." Gradient descent zig-zags painfully down a stretched, elliptical loss surface and converges slowly. **L1/L2 regularization is also scale-sensitive** — the penalty shrinks large-magnitude coefficients unfairly if features aren't comparable.
- **Scale-invariant models** — **tree-based methods** (decision trees, random forests, gradient boosting). A tree splits on \`feature < threshold\`; that decision depends only on the *order* of values, which no monotone rescaling changes. Scaling a feature before a random forest does *nothing* to the result. Knowing this saves you from "I scaled everything because best practice" — for trees, it's a no-op you can skip.

So the senior answer to "should I scale?" is never "always" or "never" — it's **"which model, and does it use distances or magnitudes?"**

## The motivation: the k-NN model that only ever looked at salary

A team builds a k-NN classifier to flag customers likely to upgrade, using \`age\` (18–80) and \`annual_salary\` (20,000–400,000). It performs no better than guessing. The bug: Euclidean distance between two customers is dominated *entirely* by the salary difference — a 50,000-dollar gap swamps any age gap of a few years, so "nearest neighbors" are just "people with similar salary," and age is invisible. **Standardize both to mean 0, std 1**, and suddenly age contributes proportionally; accuracy jumps. Nothing about the data or the algorithm changed — only the *units*. This is the single most common scaling bug, and it is invisible: the model trains fine and reports plausible numbers; it's just quietly ignoring most of your features.

## Choosing the scaler

| Scaler | Formula | Use when | Watch out for |
|---|---|---|---|
| **Standardization (z-score)** | (x − μ) / σ | Default for distance/gradient models; roughly symmetric features | Sensitive to outliers (they inflate σ) |
| **Min–max** | (x − min) / (max − min) → [0,1] | Bounded features, or when you need a fixed range (e.g. image pixels, some NN inputs) | One outlier squashes everyone else into a tiny range |
| **Robust** | (x − median) / IQR | Heavy outliers present | Doesn't bound the range |
| **Log-then-scale** | scale(log(1+x)) | Multiplicative / heavy-tailed positives | Only for positive features |

The decision rule: **outliers present? → robust or log-first. Need a bounded [0,1]? → min-max. Otherwise → standardize.** And note: standardization does *not* make data Gaussian; it only re-centers and re-scales. A bimodal feature stays bimodal.

## Encoding: turning categories into numbers without lying about order

Models eat numbers, so categoricals must be encoded. The cardinal sin is **inventing order that doesn't exist**.

- **One-hot encoding.** One binary column per level. Correct for *nominal* (unordered) categories like \`color\`, \`country\`. Cost: a column per level — fine for low cardinality (days of week), terrible for high cardinality (50,000 ZIP codes → 50,000 sparse columns). **The dummy-variable trap:** for *linear models with an intercept*, keep only k−1 columns (drop one as the reference) — k perfectly-collinear columns make the design matrix singular. (Trees and regularized models don't care; drop-one is mainly a linear-model concern.)
- **Ordinal encoding.** Map levels to integers — but *only when a real order exists* (\`low < medium < high\`, \`XS < S < M < L\`). Applying it to \`{red, green, blue}\` tells the model green is "between" red and blue and "greater than" red — a fabricated relationship that corrupts linear and distance models. (Trees survive it better but can still split awkwardly.)
- **Target / mean encoding.** Replace each level with the mean target for that level. Compresses high cardinality into one column and is very predictive — **but it leaks** unless computed out-of-fold or strictly past-only (the same trap as ml-f4). Powerful and dangerous.
- **Frequency / count encoding.** Replace each level with how often it appears. Cheap, leak-free, useful when frequency itself is informative (rare merchant ↔ risk).
- **Hashing (the hashing trick).** Hash categories into a fixed number of buckets. Bounds dimensionality for *massive* cardinality and handles unseen categories gracefully, at the cost of collisions. Standard in large-scale online systems.
- **Embeddings.** Learn a dense low-dimensional vector per level (entity embeddings, or learned in a neural net). Best for very high cardinality with rich structure (user IDs, products), captures similarity between levels, but needs enough data and a model that learns them.

**Match encoding to cardinality and model:** low-card nominal → one-hot; ordered → ordinal; high-card → target (out-of-fold), frequency, hashing, or embeddings.

## The leakage and skew rules (non-negotiable)

- **Fit on train, transform everything.** A scaler's μ/σ and a target encoder's level means must be learned **from the training fold only**, then *applied* to validation/test/production. Fitting on all data leaks (ml-f3). Wrap scaler+encoder+model in **one pipeline** so this is automatic per fold.
- **Unseen categories at serving time.** Production *will* see a category that wasn't in training (a new country, a new merchant). One-hot encoders must be configured to map unknowns to an "other"/all-zeros bucket rather than crashing. Hashing and frequency encoding handle this naturally; target encoding needs a fallback (the global mean).
- **Consistent transform train vs serve.** The *exact* scaler statistics and encoding maps used in training must be persisted and reused at serving — recomputing them online causes train/serve skew.

## A quick worked example: why the same column needs different treatment per model

Take one feature — \`annual_income\`, right-skewed, range 15k–2M, with a handful of ultra-high earners. Watch how the *correct* preprocessing flips entirely with the model:

- **For linear regression / logistic regression:** the raw range and skew are poison. The few millionaires dominate the squared loss and the gradient. Correct move: \`log(1 + income)\` to tame the skew, *then* standardize so the coefficient is comparable to other features and L2 penalizes it fairly. Two transforms, both load-bearing.
- **For k-NN or k-means:** you don't necessarily need the log, but you *absolutely* need standardization — otherwise income (range ~2,000,000) annihilates every other feature in the Euclidean distance, exactly the salary-domination bug. Robust scaling is even safer given the outliers.
- **For a gradient-boosted tree:** do *nothing*. The tree splits on \`income < threshold\`; log, standardization, and robust scaling are all monotone, so they leave every split — and therefore every prediction — unchanged. Time spent scaling here is wasted, and worse, it's a signal in code review that the author is cargo-culting.

Same column, three different right answers, because the question is never "what does this feature look like?" but **"what does *this model* do with the numbers?"** Carry that question into every preprocessing decision.

## Pitfalls senior interviewers probe

- **Scaling before a tree model.** Harmless but pointless — a tell that someone is applying ritual, not reasoning. (Worse: spending engineering effort on it.)
- **Ordinal-encoding a nominal feature.** Fabricates order; corrupts linear/distance models. Use one-hot for unordered categories.
- **One-hot on a 50,000-level feature.** Dimensionality explosion. Reach for hashing, target (out-of-fold), or embeddings.
- **Fitting the scaler on the full dataset.** Classic silent leak. Fit on train only.
- **No plan for unseen categories.** The model crashes (or silently mis-encodes) the first time production sees a new level.
- **The dummy-variable trap.** k collinear one-hot columns + intercept in a *linear* model → singular matrix. Drop one (only matters for linear/unregularized).
- **Assuming standardization "normalizes" the distribution.** It re-centers/re-scales; it does *not* remove skew or make data Gaussian.

## Interview questions you should be able to answer cold

- "Do I need to scale features for a random forest? For k-NN?" (*No for trees — splits depend only on order. Yes for k-NN — Euclidean distance is dominated by large-magnitude features.*)
- "My k-NN ignores every feature except salary. Why?" (*Unscaled distance is dominated by the largest-range feature; standardize so each contributes proportionally.*)
- "When do you pick robust scaling over standardization?" (*When heavy outliers inflate σ; robust uses median and IQR, which outliers don't distort.*)
- "How do you encode a 50,000-level ZIP-code feature?" (*Not one-hot — use hashing, frequency, out-of-fold target encoding, or embeddings depending on the model and data size.*)
- "Why is ordinal-encoding {red, green, blue} a bug?" (*It fabricates an order/distance the categories don't have, misleading linear and distance models; use one-hot.*)
- "Production hits a category unseen in training. What happens and how do you prevent it?" (*A naive encoder crashes or mis-maps; configure an 'unknown' bucket, use hashing/frequency, or fall back to the global mean for target encoding.*)
- "Where do you fit the scaler — and why does it matter?" (*On the training fold only, inside a pipeline; fitting on all data leaks held-out statistics and inflates CV.*)`,
    video: null,
    videoFallbackMarkdown: `## Deep dive without video

Build a two-column decision table from memory and fill it in:

1. **Scaling — does the model care?** List k-NN, k-means, SVM-RBF, PCA, neural nets, L1/L2-regularized linear, and tree ensembles. For each write *scale-sensitive* or *scale-invariant* and one word why (distance / gradient / penalty / order-only). The trees should be the only "invariant" rows.
2. **Encoding — which scheme?** For each of \`{country}\` (nominal, ~200), \`{XS,S,M,L,XL}\` (ordinal), \`{ZIP code}\` (high-card ~40k), and \`{user_id}\` (very high-card with structure), pick an encoding and justify it in one line (one-hot, ordinal, hashing/target/frequency, embedding).

Finally, write the leakage rule in one sentence: *where* do you fit the scaler and target encoder, and *what* goes wrong if you fit them on all the data. If you can produce both tables and that sentence cold, you can defend any preprocessing question.`,
    tryGuidance: `Drag the blend slider in the lab to morph a skewed, outlier-stretched feature from raw units into z-scores, and watch how the points' relative positions change. **Predict first:** before you scale, which single feature would a k-NN model 'see' if you left everything in raw units?`,
    knowledgeCheck: [
      {
        question:
          "Which model is genuinely scale-invariant, making feature scaling a no-op?",
        options: [
          "A gradient-boosted tree ensemble, because splits depend only on the order of values, not their magnitude",
          "k-nearest neighbors",
          "An RBF support vector machine",
        ],
        correctIndex: 0,
        explanation:
          "Trees split on 'feature < threshold', which is invariant to any monotone rescaling. Distance- and kernel-based models (k-NN, SVM-RBF) are scale-sensitive.",
      },
      {
        question:
          "A k-NN model using unscaled `age` (18–80) and `salary` (20k–400k) ignores age entirely. Why, and what fixes it?",
        options: [
          "Age is genuinely irrelevant; drop it",
          "Euclidean distance is dominated by the large-magnitude salary; standardizing both so each has mean 0 / std 1 lets age contribute proportionally",
          "k-NN can't use two features at once",
        ],
        correctIndex: 1,
        explanation:
          "Distance is overwhelmed by the feature with the largest range, so neighbors are chosen on salary alone. Standardization equalizes the scales so both features matter.",
      },
      {
        question:
          "A feature has a few extreme outliers. Which scaler is most appropriate and why?",
        options: [
          "Min–max, because it bounds the range to [0,1]",
          "Robust scaling (median and IQR), because outliers don't distort the median/IQR the way they inflate the mean and standard deviation",
          "Standardization, because outliers improve the estimate of σ",
        ],
        correctIndex: 1,
        explanation:
          "Outliers inflate σ (hurting z-scores) and squash everyone into a tiny range under min–max. Robust scaling uses outlier-resistant statistics.",
      },
      {
        question:
          "What is wrong with ordinal-encoding a nominal feature like {red, green, blue} as 0, 1, 2?",
        options: [
          "Nothing; it's the most compact encoding",
          "It fabricates an order and distance (green 'between' red and blue, blue 'greater than' red) that corrupts linear and distance-based models; use one-hot instead",
          "It uses too much memory",
        ],
        correctIndex: 1,
        explanation:
          "Ordinal encoding implies a ranking the categories don't have. Unordered categories should be one-hot encoded; ordinal encoding is only valid when a real order exists.",
      },
      {
        question:
          "You must encode a 50,000-level ZIP-code feature for a model. Why is plain one-hot a poor choice, and what are better options?",
        options: [
          "One-hot is always best regardless of cardinality",
          "One-hot creates 50,000 sparse columns (dimensionality explosion); prefer hashing, frequency encoding, out-of-fold target encoding, or embeddings depending on model and data",
          "ZIP codes should be ordinal-encoded by numeric value",
        ],
        correctIndex: 1,
        explanation:
          "High cardinality makes one-hot impractically wide and sparse. Hashing bounds dimensionality, target/frequency compress to one column, and embeddings capture structure.",
      },
      {
        question:
          "Where should a StandardScaler and a target encoder be fit, and why does it matter?",
        options: [
          "On the entire dataset before splitting, for stability",
          "On the training fold only (inside a pipeline), because fitting on all data leaks held-out statistics/level-means and optimistically inflates CV scores",
          "On the test set, so the final metric is accurate",
        ],
        correctIndex: 1,
        explanation:
          "Any data-derived transform must learn only from training data, then be applied to held-out data. Fitting on all data leaks summary statistics across the split.",
      },
      {
        question:
          "In production, the model receives a category that never appeared in training. What is the senior precaution?",
        options: [
          "Nothing is needed; encoders always handle new values",
          "Configure encoders to map unknowns to an 'other'/all-zeros bucket (or use hashing/frequency, and a global-mean fallback for target encoding) so serving doesn't crash or mis-encode",
          "Retrain the model on every request",
        ],
        correctIndex: 1,
        explanation:
          "Unseen categories are inevitable. A naive one-hot encoder crashes or mis-maps them; robust handling requires an explicit unknown bucket or an encoding that degrades gracefully.",
      },
      {
        question:
          "The 'dummy-variable trap' in one-hot encoding most directly affects which case?",
        options: [
          "Tree ensembles, which become unstable with one-hot columns",
          "k-NN, where extra columns slow distance computation",
          "Linear models with an intercept, where k perfectly collinear one-hot columns make the design matrix singular, so you drop one reference level",
        ],
        correctIndex: 2,
        explanation:
          "k collinear dummies plus an intercept create perfect multicollinearity in a linear model. Dropping one level fixes it; trees and regularized models are largely unaffected.",
      },
    ],
  },
};
