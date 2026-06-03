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
    interviewGraph: {
            initialStageId: "f1_paradigm_click",
            artifactDimensions: [
              {
                label: "Supervision Signal",
                recoveryStageId: "f1_recovery_supervision",
              },
              {
                label: "Paradigm Classification",
                recoveryStageId: "f1_recovery_paradigm",
              },
              {
                label: "Hybrid & Edge Cases",
                recoveryStageId: "f1_recovery_hybrid",
                passLabel: "Paradigm Mastery",
              },
            ],
            stages: {
              f1_paradigm_click: {
                id: "f1_paradigm_click",
                type: "click_target",
                badge: "Stage 1",
                title: "Stage 1 · Unsupervised evaluation mistake",
                prompt: "Your colleague ran a clustering pipeline and then measured its quality. Click the line that contradicts the fundamental principle that unsupervised learning has no ground-truth labels.",
                code_snippet: `from sklearn.cluster import KMeans
from sklearn.metrics import accuracy_score

X = load_customer_data()
labels_true = load_ground_truth_labels()   # ds-target:load_labels

kmeans = KMeans(n_clusters=4)
kmeans.fit(X)
preds = kmeans.labels_

acc = accuracy_score(labels_true, preds)   # ds-target:accuracy_eval
print("Cluster accuracy:", acc)`,
                validationCopy: {
                  load_labels: "Partially right — loading labels isn't the core error, but it sets up the problem. The contradiction is actually evaluating an unsupervised model with supervised accuracy. Try the accuracy_score line.",
                  accuracy_eval: "Correct. Unsupervised learning by definition has no ground-truth labels. Using accuracy_score with true labels contradicts the paradigm — you're treating clustering like a classification task. Use intrinsic metrics (silhouette score, inertia) or only compare to labels in a post-hoc analysis.",
                },
                branches: {
                  load_labels: "f1_recovery_supervision",
                  accuracy_eval: "f1_recommendation_choice",
                },
              },
              f1_recommendation_choice: {
                id: "f1_recommendation_choice",
                type: "scenario_choice",
                badge: "Stage 2",
                title: "Stage 2 · Recommendation system paradigm",
                prompt: "A recommendation system learns from implicit signals: clicks, dwell-time, and skips. Users never provide explicit star ratings. The model updates its weights after every session. Which learning paradigm best describes this system?",
                code_snippet: `# System receives:
# - user_id
# - item_id
# - event_type: "click" | "skip" | "dwell_30s"
# - session_context

# Model updates after each session.
# No explicit label y is ever collected.`,
                choices: [
                  {
                    id: "a",
                    label: "Self-supervised / unsupervised signal learning",
                    description: "Implicit signals (clicks, skips) are treated as proxy labels derived from user behaviour — no human annotation required. This is the dominant paradigm for collaborative filtering and contrastive recommendation models.",
                  },
                  {
                    id: "b",
                    label: "Supervised learning",
                    description: "Supervised learning requires explicit labels (e.g., a user rating). Implicit signals are not ground-truth labels — they are noisy proxies that must be interpreted carefully.",
                  },
                  {
                    id: "c",
                    label: "Reinforcement learning",
                    description: "RL applies when the model takes actions that affect future state and receives a reward signal. A recommendation system that simply learns from historical interactions without an explicit reward/action loop is not RL by default.",
                  },
                  {
                    id: "d",
                    label: "Semi-supervised learning",
                    description: "Semi-supervised learning combines a small labelled set with a large unlabelled set. This system has no labelled set at all — it uses only implicit feedback.",
                  },
                ],
                branches: {
                  a: "f1_fraud_choice",
                  b: "f1_recovery_supervision",
                  c: "f1_recovery_supervision",
                  d: "f1_recovery_paradigm",
                },
                rationale: "Implicit feedback recommendation systems occupy the unsupervised / self-supervised space. Clicks and dwell-time are behavioural proxies, not ground-truth labels. RL would apply only if the model explicitly takes actions (e.g., selects content) and receives a delayed reward that affects future recommendations in a policy-gradient loop.",
              },
              f1_fraud_choice: {
                id: "f1_fraud_choice",
                type: "scenario_choice",
                badge: "Stage 3",
                title: "Stage 3 · Novel fraud patterns",
                prompt: "Your team has 90 days of labeled fraud transactions (0 = legitimate, 1 = fraud). Last week a new fraud ring emerged with entirely different patterns — no labels exist for these new events yet. Which approach best covers these novel patterns?",
                code_snippet: `# Available data:
# - 90 days of transactions with fraud labels (historical)
# - 7 days of recent transactions (no labels yet)

# Goal: detect BOTH known fraud types AND novel emerging patterns.`,
                choices: [
                  {
                    id: "a",
                    label: "Unsupervised anomaly detection on the recent unlabelled data",
                    description: "Anomaly detection (isolation forest, autoencoder reconstruction error) flags statistical outliers without needing labels. This is exactly the right tool for novel patterns that have never been seen before.",
                  },
                  {
                    id: "b",
                    label: "Retrain the supervised classifier on the 90-day labelled set",
                    description: "The supervised classifier can only recognise patterns it was trained on. Novel fraud patterns from last week are out-of-distribution — the classifier will likely miss them or assign low fraud probability.",
                  },
                  {
                    id: "c",
                    label: "Use reinforcement learning to penalise fraudulent transactions",
                    description: "RL is unsuitable here — you don't have a clear reward signal for novel patterns, and the environment is not defined as a sequential decision process with known state transitions.",
                  },
                  {
                    id: "d",
                    label: "Collect more labels and retrain before deploying anything",
                    description: "Waiting weeks for labels leaves you exposed to the active fraud ring. Anomaly detection can flag suspicious clusters now, which analysts can then label to bootstrap a future supervised model.",
                  },
                ],
                branches: {
                  a: "f1_terminal",
                  b: "f1_recovery_paradigm",
                  c: "f1_recovery_paradigm",
                  d: "f1_recovery_hybrid",
                },
                rationale: "Novel patterns have no labels by definition, so supervised learning is blind to them. Unsupervised anomaly detection identifies transactions that deviate from the learned 'normal' distribution — it catches what it has never seen before. A production system often layers both: the supervised model handles known fraud types with high precision, while an anomaly detector surfaces emerging threats for analyst review.",
              },
              f1_recovery_supervision: {
                id: "f1_recovery_supervision",
                type: "scenario_choice",
                badge: "Recovery A",
                title: "Recovery · Supervision signal definition",
                prompt: "What is the defining characteristic that separates supervised learning from unsupervised learning?",
                code_snippet: `# Supervised:
# X_train, y_train = load_labelled_data()
# model.fit(X_train, y_train)

# Unsupervised:
# X_train = load_raw_data()
# model.fit(X_train)`,
                choices: [
                  {
                    id: "a",
                    label: "The presence of ground-truth labels (y) provided during training",
                    description: "Correct. Supervised learning optimises a model against explicit targets. Unsupervised learning finds structure in X alone — no y is available or used during training.",
                  },
                  {
                    id: "b",
                    label: "The size of the training dataset",
                    description: "Dataset size is irrelevant to the paradigm. A tiny labelled dataset is still supervised; a massive unlabelled corpus is still unsupervised.",
                  },
                  {
                    id: "c",
                    label: "Whether the model uses gradient descent",
                    description: "Both supervised and unsupervised models can use gradient descent. The optimisation algorithm does not determine the paradigm.",
                  },
                  {
                    id: "d",
                    label: "Whether the model makes predictions on new data",
                    description: "All trained models can make predictions on new data. The paradigm is determined by how the model is trained, not how it is used at inference.",
                  },
                ],
                branches: {
                  a: "f1_recommendation_choice",
                  b: "f1_recovery_supervision",
                  c: "f1_recovery_supervision",
                  d: "f1_recovery_supervision",
                },
                rationale: "The supervision signal is the label y. In supervised learning, the model learns a mapping f(X) → y by minimising a loss against known targets. In unsupervised learning, no y exists — the model discovers structure, clusters, or representations purely from X.",
              },
              f1_recovery_paradigm: {
                id: "f1_recovery_paradigm",
                type: "scenario_choice",
                badge: "Recovery B",
                title: "Recovery · Paradigm classification",
                prompt: "A game-playing AI receives +1 for winning, -1 for losing, and 0 for all other moves. It plays millions of games and improves its move selection over time. Which paradigm is this?",
                code_snippet: `# After each game:
# reward = +1  # win
# reward = -1  # loss
# reward =  0  # draw or intermediate move

# The agent updates its policy based on rewards.`,
                choices: [
                  {
                    id: "a",
                    label: "Reinforcement learning",
                    description: "Correct. The agent takes actions (moves), those actions affect future game state, and a delayed reward signal is used to update a policy. This is the canonical RL setting.",
                  },
                  {
                    id: "b",
                    label: "Supervised learning",
                    description: "There are no pre-labelled 'correct move' examples for every game state. The agent is learning from outcomes, not from labelled decisions.",
                  },
                  {
                    id: "c",
                    label: "Unsupervised learning",
                    description: "There is an explicit reward signal. Unsupervised learning has no such signal — it finds structure with no external feedback.",
                  },
                  {
                    id: "d",
                    label: "Self-supervised learning",
                    description: "Self-supervised learning generates pseudo-labels from the data itself (e.g., predict masked tokens). A game reward signal from the environment is RL, not self-supervised.",
                  },
                ],
                branches: {
                  a: "f1_fraud_choice",
                  b: "f1_recovery_paradigm",
                  c: "f1_recovery_paradigm",
                  d: "f1_recovery_paradigm",
                },
                rationale: "Reinforcement learning is defined by the agent–environment loop: the agent selects actions, the environment transitions to a new state, and a reward signal is received. The key distinguisher from supervised learning is that there are no pre-labelled correct actions — only delayed outcome signals.",
              },
              f1_recovery_hybrid: {
                id: "f1_recovery_hybrid",
                type: "scenario_choice",
                badge: "Recovery C",
                title: "Recovery · Hybrid paradigms",
                prompt: "Semi-supervised learning is useful when labelling is expensive. Which scenario is the best fit for semi-supervised learning?",
                code_snippet: `# Scenario A: 1 million images, 500 labelled by radiologists
# Scenario B: 10,000 fully labelled customer records
# Scenario C: 2 million transactions, no labels exist
# Scenario D: 100 samples with labels, 100 samples without`,
                choices: [
                  {
                    id: "a",
                    label: "Scenario A: 1M images, 500 labelled by radiologists",
                    description: "Correct. Semi-supervised learning shines when a large unlabelled pool is cheap to collect but labelling is expensive (radiologist time). The model learns representations from the 1M unlabelled images and fine-tunes on the 500 labelled ones.",
                  },
                  {
                    id: "b",
                    label: "Scenario B: 10,000 fully labelled customer records",
                    description: "When all data is labelled, fully supervised learning is the right choice. Semi-supervised adds complexity without benefit when labels are complete.",
                  },
                  {
                    id: "c",
                    label: "Scenario C: 2M transactions, no labels at all",
                    description: "With zero labels, you cannot use semi-supervised learning — it requires at least some labelled examples. This is a pure unsupervised setting.",
                  },
                  {
                    id: "d",
                    label: "Scenario D: 100 labelled + 100 unlabelled",
                    description: "While technically semi-supervised, 100 unlabelled samples is usually too few to gain meaningful representation learning. Semi-supervised is most powerful when unlabelled data vastly outnumbers labelled data.",
                  },
                ],
                branches: {
                  a: "f1_terminal",
                  b: "f1_recovery_hybrid",
                  c: "f1_recovery_hybrid",
                  d: "f1_recovery_hybrid",
                },
                rationale: "Semi-supervised learning is the paradigm for high-label-cost domains: medical imaging, legal document classification, scientific annotation. The key ratio is a small labelled set surrounded by a large unlabelled pool. The model uses the unlabelled data for self-supervised pre-training or consistency regularisation, then fine-tunes on the labelled subset.",
              },
              f1_terminal: {
                id: "f1_terminal",
                type: "scenario_choice",
                badge: "Complete",
                title: "Revision complete · ML Paradigms mastered",
                terminal: true,
                prompt: "A content moderation system flags posts, human reviewers approve or reject the flags, and the model updates its weights based on reviewer decisions. Which paradigm does this most closely resemble, and what is the key risk in this setup?",
                code_snippet: `# Pipeline:
# 1. model.predict(post) → flag_score
# 2. if flag_score > threshold: send to human_review_queue
# 3. reviewer labels: approved_flag | rejected_flag
# 4. model.update(post, reviewer_label)`,
                choices: [
                  {
                    id: "a",
                    label: "Supervised / active learning — risk: reviewer bias becomes encoded in the model",
                    description: "Correct. Reviewer decisions are ground-truth labels used to update the model — this is supervised learning with a human-in-the-loop. The key risk is systematic reviewer bias: if reviewers consistently under-flag certain content types, the model learns that bias and perpetuates it at scale.",
                  },
                  {
                    id: "b",
                    label: "Reinforcement learning — risk: reward hacking",
                    description: "RL would require a formal action-reward loop with delayed outcomes. Here the reviewer label is an immediate supervised signal, not a delayed environmental reward.",
                  },
                  {
                    id: "c",
                    label: "Unsupervised — risk: no interpretability",
                    description: "The system has explicit labels from reviewers. It is not unsupervised.",
                  },
                ],
                branches: {
                  a: "f1_terminal",
                  b: "f1_terminal",
                  c: "f1_terminal",
                },
                rationale: "Human-in-the-loop systems are a form of active supervised learning. The human label IS the ground truth. This creates a feedback loop where model errors influence what gets reviewed (only flagged posts reach reviewers), and reviewer biases get encoded into training data. Auditing reviewer agreement rates and maintaining a random sample of unflagged posts for review are essential safeguards.",
              },
            },
          },
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
    interviewGraph: {
            initialStageId: "f2_variance_click",
            artifactDimensions: [
              {
                label: "Overfitting Diagnosis",
                recoveryStageId: "f2_recovery_overfit",
              },
              {
                label: "Bias-Variance Balance",
                recoveryStageId: "f2_recovery_biasvar",
              },
              {
                label: "Regularization Strategy",
                recoveryStageId: "f2_recovery_regularize",
                passLabel: "Bias-Variance Mastery",
              },
            ],
            stages: {
              f2_variance_click: {
                id: "f2_variance_click",
                type: "click_target",
                badge: "Stage 1",
                title: "Stage 1 · High-variance deployment",
                prompt: "A data scientist trained a decision tree with 1000 leaf nodes and immediately deployed it. Click the line that most directly creates the high-variance problem.",
                code_snippet: `from sklearn.tree import DecisionTreeClassifier

X_train, y_train = load_training_data()

dt = DecisionTreeClassifier(max_depth=None, min_samples_leaf=1)  # ds-target:no_regularize
dt.fit(X_train, y_train)

# No validation set evaluation performed
score = dt.score(X_train, y_train)   # ds-target:train_score_only
print("Ready to deploy, score:", score)
deploy(dt)                            # ds-target:deploy_no_val`,
                validationCopy: {
                  no_regularize: "Correct. Setting max_depth=None and min_samples_leaf=1 allows the tree to grow until every leaf is pure — memorising every training example including noise. This is the root cause of high variance.",
                  train_score_only: "Good instinct — evaluating only on training data misses the overfitting. But the real cause is the unconstrained tree configuration. The train-only evaluation is a symptom of the workflow problem, not the model problem. Try the DecisionTreeClassifier line.",
                  deploy_no_val: "Deploying without validation is reckless, but the high-variance problem is created earlier — when the model is configured with no depth limit. Try the DecisionTreeClassifier line.",
                },
                branches: {
                  no_regularize: "f2_mse_choice",
                  train_score_only: "f2_recovery_overfit",
                  deploy_no_val: "f2_recovery_overfit",
                },
              },
              f2_mse_choice: {
                id: "f2_mse_choice",
                type: "scenario_choice",
                badge: "Stage 2",
                title: "Stage 2 · Diagnosing train/val gap",
                prompt: "After training a regression model you observe: Train MSE = 0.02, Validation MSE = 2.1. What does this gap indicate, and what is the correct diagnosis?",
                code_snippet: `# Results after training:
train_mse = 0.02   # nearly perfect on training data
val_mse   = 2.10   # 100x worse on unseen data

# The model has 847 parameters.
# Training set size: 1,200 samples.`,
                choices: [
                  {
                    id: "a",
                    label: "High variance — the model is overfitting the training set",
                    description: "Correct. A 100x gap between train and validation loss is a textbook sign of high variance. The model has memorised training-set noise rather than learning the underlying signal. Solutions: reduce model complexity, add regularization, collect more training data.",
                  },
                  {
                    id: "b",
                    label: "High bias — the model is too simple to fit the data",
                    description: "High bias causes both train AND validation error to be high. Here train MSE is excellent (0.02) — the model fits training data perfectly. The problem is it fails to generalise.",
                  },
                  {
                    id: "c",
                    label: "Optimal fit — 0.02 training error is the target",
                    description: "A near-zero training error paired with a 100x higher validation error is not optimal. It signals the model has memorised the training set.",
                  },
                  {
                    id: "d",
                    label: "Data quality issue — validation set must be corrupted",
                    description: "While data quality should always be checked, a 100x error ratio is a classical overfitting signature. Blaming data quality without investigating the model complexity is premature.",
                  },
                ],
                branches: {
                  a: "f2_complexity_choice",
                  b: "f2_recovery_biasvar",
                  c: "f2_recovery_overfit",
                  d: "f2_recovery_overfit",
                },
                rationale: "The bias-variance tradeoff manifests in the train/val gap. Low train error + high val error = high variance (overfitting). High train error + high val error = high bias (underfitting). The gap size is your diagnostic signal: a 100x ratio demands complexity reduction or regularization.",
              },
              f2_complexity_choice: {
                id: "f2_complexity_choice",
                type: "scenario_choice",
                badge: "Stage 3",
                title: "Stage 3 · Complexity vs. validation error",
                prompt: "You increase your decision tree's max_depth from 3 to 20 in steps. Training error drops steadily. Validation error drops until depth=7, then rises consistently. What should you do?",
                code_snippet: `# Learning curve observations:
# depth=3:  train_err=0.18, val_err=0.20  (underfitting)
# depth=7:  train_err=0.09, val_err=0.11  (sweet spot)
# depth=12: train_err=0.05, val_err=0.16  (overfitting begins)
# depth=20: train_err=0.01, val_err=0.29  (severe overfitting)`,
                choices: [
                  {
                    id: "a",
                    label: "Set max_depth=7 and apply early stopping or pruning",
                    description: "Correct. Depth=7 is the sweet spot where the bias-variance tradeoff is best balanced. Beyond that, increasing complexity only increases variance. Apply cost-complexity pruning or simply cap depth at 7.",
                  },
                  {
                    id: "b",
                    label: "Continue increasing depth to further reduce training error",
                    description: "Training error will continue to fall, but validation error will keep rising. You are moving further into high-variance territory. The training error is not the metric you should be optimising.",
                  },
                  {
                    id: "c",
                    label: "Add more features to reduce the gap",
                    description: "Adding features increases model complexity, which will worsen the overfitting at higher depths. The problem is complexity, not insufficient features.",
                  },
                  {
                    id: "d",
                    label: "Collect a larger test set to get a more accurate measure",
                    description: "The validation set is for model selection, not diagnosis. The learning curve already clearly shows where the optimum lies — more validation data confirms it but doesn't change the action.",
                  },
                ],
                branches: {
                  a: "f2_bias_choice",
                  b: "f2_recovery_overfit",
                  c: "f2_recovery_regularize",
                  d: "f2_recovery_biasvar",
                },
                rationale: "The validation learning curve is your guide for model selection. The sweet spot is where validation error is minimised — adding complexity beyond that point is pure variance increase with no bias benefit. In practice you'd use cross-validation to find this point robustly, and apply pruning or regularization to stabilise the model there.",
              },
              f2_bias_choice: {
                id: "f2_bias_choice",
                type: "scenario_choice",
                badge: "Stage 4",
                title: "Stage 4 · High bias diagnosis",
                prompt: "A linear regression model has Train R²=0.31 and Val R²=0.29 — essentially no gap, but both are poor. Adding 50 additional noisy features does not improve performance. What does the model need?",
                code_snippet: `# Current state:
# Linear model, 12 features
# train_r2 = 0.31
# val_r2   = 0.29  # tiny gap → not overfitting

# After adding 50 noisy features:
# train_r2 = 0.33
# val_r2   = 0.28  # still poor, gap widens slightly`,
                choices: [
                  {
                    id: "a",
                    label: "A more expressive model or non-linear feature engineering",
                    description: "Correct. When both train and val errors are high and roughly equal, you have high bias — the model cannot represent the true relationship. A linear model may be fundamentally wrong for this data. Try polynomial features, interaction terms, or a non-linear model (gradient boosted trees, neural net).",
                  },
                  {
                    id: "b",
                    label: "More regularization to reduce the slight val gap",
                    description: "There is virtually no train/val gap — this is not an overfitting problem. Adding regularization would increase bias further, making performance worse.",
                  },
                  {
                    id: "c",
                    label: "More training data to reduce variance",
                    description: "More data helps with high variance, not high bias. The tiny train/val gap confirms this is a bias problem. More data will not help a model that is fundamentally too simple.",
                  },
                  {
                    id: "d",
                    label: "Feature scaling — the features may have different magnitudes",
                    description: "Feature scaling can help linear models converge faster but does not change the model's expressive power. If the true relationship is non-linear, scaling will not close the bias gap.",
                  },
                ],
                branches: {
                  a: "f2_terminal",
                  b: "f2_recovery_regularize",
                  c: "f2_recovery_biasvar",
                  d: "f2_recovery_regularize",
                },
                rationale: "High bias (underfitting) is diagnosed by high train error AND a small train/val gap. The model is equally bad everywhere — it lacks the capacity to fit the data. The fix is always more model capacity or better features. Adding noisy features does not help because they carry no signal; you need features that capture the true non-linear structure.",
              },
              f2_recovery_overfit: {
                id: "f2_recovery_overfit",
                type: "scenario_choice",
                badge: "Recovery A",
                title: "Recovery · Overfitting diagnosis",
                prompt: "Which learning curve pattern is the clearest sign of high variance (overfitting)?",
                code_snippet: `# Pattern A: as training size grows,
#   train_error stays low (~0.02), val_error stays high (~0.18)
#   → gap does NOT close

# Pattern B: as training size grows,
#   train_error rises from 0.01 to 0.12
#   val_error drops from 0.25 to 0.13
#   → gap closes, both converge

# Pattern C: as training size grows,
#   both train_error and val_error stay high (~0.22)
#   → gap is always small`,
                choices: [
                  {
                    id: "a",
                    label: "Pattern A — persistent large gap between train and val error",
                    description: "Correct. A gap that stays wide as training size grows is the hallmark of high variance. The model has too much capacity relative to the signal — more data helps but slowly. You need regularization or a simpler model.",
                  },
                  {
                    id: "b",
                    label: "Pattern B — gap closes as training size grows",
                    description: "Pattern B shows a model that was initially overfitting on small data but generalises better with more samples. This is expected behaviour, not chronic overfitting.",
                  },
                  {
                    id: "c",
                    label: "Pattern C — both errors high and close together",
                    description: "Both errors high with a small gap is high bias (underfitting). The model is too simple for the task.",
                  },
                  {
                    id: "d",
                    label: "All patterns indicate overfitting",
                    description: "Patterns B and C do not indicate overfitting. Pattern B shows convergence; Pattern C shows underfitting.",
                  },
                ],
                branches: {
                  a: "f2_mse_choice",
                  b: "f2_recovery_overfit",
                  c: "f2_recovery_overfit",
                  d: "f2_recovery_overfit",
                },
                rationale: "Learning curves plot error vs. training set size. High variance shows as a persistent wide gap — the model memorises whatever data it gets but fails on new data. High bias shows as high error on both sets with a small gap. This visual distinction is one of the most important diagnostic tools in ML.",
              },
              f2_recovery_biasvar: {
                id: "f2_recovery_biasvar",
                type: "scenario_choice",
                badge: "Recovery B",
                title: "Recovery · Bias-variance balance",
                prompt: "Total prediction error can be decomposed into three components. Which decomposition is correct?",
                code_snippet: `# For a model's expected MSE on unseen data:
# Option A: MSE = Bias² + Variance + Irreducible Noise
# Option B: MSE = Bias  + Variance + Model Complexity
# Option C: MSE = Bias² + Variance²+ Irreducible Noise
# Option D: MSE = Bias² + Variance + Training Error`,
                choices: [
                  {
                    id: "a",
                    label: "Option A: MSE = Bias² + Variance + Irreducible Noise",
                    description: "Correct. The bias-variance decomposition says: expected test MSE = (bias of the estimator)² + variance of the estimator + irreducible noise. The bias is squared because it represents the systematic offset from the true value.",
                  },
                  {
                    id: "b",
                    label: "Option B: MSE = Bias + Variance + Model Complexity",
                    description: "Model complexity is not a direct component of the error decomposition. It influences bias and variance but is not itself part of the MSE formula.",
                  },
                  {
                    id: "c",
                    label: "Option C: MSE = Bias² + Variance² + Irreducible Noise",
                    description: "Variance is not squared in the decomposition. Bias is squared (it represents a systematic deviation), but variance enters linearly.",
                  },
                  {
                    id: "d",
                    label: "Option D: MSE = Bias² + Variance + Training Error",
                    description: "Training error is not a component of the generalisation error decomposition. The decomposition applies to the expected error on unseen data.",
                  },
                ],
                branches: {
                  a: "f2_complexity_choice",
                  b: "f2_recovery_biasvar",
                  c: "f2_recovery_biasvar",
                  d: "f2_recovery_biasvar",
                },
                rationale: "MSE = Bias² + Variance + Irreducible Noise. This decomposition explains the fundamental tradeoff: reducing bias (using a more complex model) typically increases variance, and vice versa. The irreducible noise floor is the best any model can do given the inherent randomness in the data.",
              },
              f2_recovery_regularize: {
                id: "f2_recovery_regularize",
                type: "scenario_choice",
                badge: "Recovery C",
                title: "Recovery · Regularization strategy",
                prompt: "L2 regularization (Ridge) adds λ·Σw² to the loss function. What is the primary effect on the bias-variance tradeoff?",
                code_snippet: `# Ridge loss:
# L = MSE(y, ŷ) + λ * sum(w_i ** 2)

# As λ increases from 0 to ∞:
# A) bias increases, variance decreases
# B) bias decreases, variance increases
# C) both bias and variance decrease
# D) neither changes; only convergence speed changes`,
                choices: [
                  {
                    id: "a",
                    label: "Bias increases, variance decreases",
                    description: "Correct. L2 regularization penalises large weights, shrinking them toward zero. Smaller weights mean a smoother, less flexible model — higher bias but lower variance. As λ→∞, all weights approach zero (the model predicts the mean), which is maximum bias / minimum variance.",
                  },
                  {
                    id: "b",
                    label: "Bias decreases, variance increases",
                    description: "This is the opposite direction. Regularization restricts the model — it can't fit the training data as well (more bias) but fits new data more consistently (less variance).",
                  },
                  {
                    id: "c",
                    label: "Both bias and variance decrease",
                    description: "The bias-variance tradeoff generally prevents both from decreasing simultaneously. Regularization is a deliberate trade: accept more bias in exchange for less variance.",
                  },
                  {
                    id: "d",
                    label: "Neither changes; only convergence speed changes",
                    description: "Regularization fundamentally changes the model's functional form. It is not just a solver parameter — it changes the solution found by optimisation.",
                  },
                ],
                branches: {
                  a: "f2_bias_choice",
                  b: "f2_recovery_regularize",
                  c: "f2_recovery_regularize",
                  d: "f2_recovery_regularize",
                },
                rationale: "Regularization is a deliberate bias-variance trade. L2 (Ridge) shrinks weights toward zero, reducing model flexibility (higher bias) but making the model more stable across different training samples (lower variance). The hyperparameter λ controls where you sit on the tradeoff curve. Cross-validation is used to find the λ that minimises validation error.",
              },
              f2_terminal: {
                id: "f2_terminal",
                type: "scenario_choice",
                badge: "Complete",
                title: "Revision complete · Bias-Variance mastered",
                terminal: true,
                prompt: "A model has Train AUC=0.99, Validation AUC=0.61. An interviewer asks you to walk through your diagnosis and name three concrete fixes. Which answer is most complete and accurate?",
                code_snippet: `# Observation:
train_auc = 0.99
val_auc   = 0.61
# Gap = 0.38 AUC points
# Model: gradient boosted trees, 500 estimators, no max_depth limit
# Training set: 8,000 samples`,
                choices: [
                  {
                    id: "a",
                    label: "High variance. Fix 1: reduce tree depth/add max_depth. Fix 2: add L2 regularization (lambda/min_child_weight). Fix 3: collect more training data or use dropout-equivalent subsampling.",
                    description: "Correct and complete. The 0.38 AUC gap with near-perfect train performance is textbook high variance. All three fixes directly reduce variance: capacity restriction, parameter regularization, and data augmentation / subsampling all move the model along the bias-variance curve toward lower variance.",
                  },
                  {
                    id: "b",
                    label: "High bias. Fix 1: add more features. Fix 2: use a deeper model. Fix 3: remove regularization.",
                    description: "This diagnosis is backwards. Train AUC=0.99 means the model has MORE than enough capacity. High bias would show both train and val AUC being low. The proposed fixes would increase variance further.",
                  },
                  {
                    id: "c",
                    label: "Data leakage. Fix 1: check the validation pipeline. Fix 2: re-split the data. Fix 3: audit feature engineering.",
                    description: "Data leakage would cause val performance to be spuriously HIGH, not low. A val AUC of 0.61 versus train 0.99 is the opposite of leakage — it's generalisation failure.",
                  },
                ],
                branches: {
                  a: "f2_terminal",
                  b: "f2_terminal",
                  c: "f2_terminal",
                },
                rationale: "The diagnostic pattern: train AUC near 1.0 + large train/val gap = high variance. The model has memorised training data. Three systematic fixes: (1) reduce model capacity (shallower trees, fewer estimators), (2) add regularization parameters (lambda, min_child_weight, min_samples_leaf), (3) more data or subsampling (row/column sampling reduces correlation between trees and lowers ensemble variance). Always report which metric you use and why when diagnosing in an interview.",
              },
            },
          },
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
    interviewGraph: {
            initialStageId: "f3_leakage_click",
            artifactDimensions: [
              {
                label: "Data Leakage Prevention",
                recoveryStageId: "f3_recovery_leakage",
              },
              {
                label: "Validation Reliability",
                recoveryStageId: "f3_recovery_valreliability",
              },
              {
                label: "Temporal & Pipeline Splits",
                recoveryStageId: "f3_recovery_temporal",
                passLabel: "Evaluation Mastery",
              },
            ],
            stages: {
              f3_leakage_click: {
                id: "f3_leakage_click",
                type: "click_target",
                badge: "Stage 1",
                title: "Stage 1 · Pipeline data leakage",
                prompt: "A data scientist fitted a scaler on the full dataset before splitting into train and test sets. Click the line that introduces data leakage.",
                code_snippet: `from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split

X, y = load_data()

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)   # ds-target:fit_before_split

X_train, X_test, y_train, y_test = train_test_split(
    X_scaled, y, test_size=0.2, random_state=42
)

model.fit(X_train, y_train)
print("Test score:", model.score(X_test, y_test))`,
                validationCopy: {
                  fit_before_split: "Correct. Calling fit_transform on the full dataset before splitting means the scaler's mean and standard deviation are computed using test-set rows. The test set has now 'leaked' its statistics into the preprocessing step — your test score will be optimistically biased.",
                },
                branches: {
                  fit_before_split: "f3_val_tuning_choice",
                },
              },
              f3_val_tuning_choice: {
                id: "f3_val_tuning_choice",
                type: "scenario_choice",
                badge: "Stage 2",
                title: "Stage 2 · Validation set reliability",
                prompt: "You tune hyperparameters 20 times using the same validation set, selecting the configuration with the best validation score. Is your final validation score a reliable estimate of test performance?",
                code_snippet: `best_val_score = 0
best_params = None

for trial in range(20):
    params = sample_hyperparameters()
    model = train(X_train, y_train, **params)
    val_score = evaluate(model, X_val, y_val)   # same val set, 20 times

    if val_score > best_val_score:
        best_val_score = val_score
        best_params = params

print("Best val score:", best_val_score)  # Is this trustworthy?`,
                choices: [
                  {
                    id: "a",
                    label: "No — repeated selection on the same val set makes it an optimistic oracle",
                    description: "Correct. Each time you evaluate on the validation set and keep the best result, you are effectively fitting to the val set's noise. After 20 trials, your best val score includes a lucky overfit to that specific val sample. The true generalisation estimate requires a held-out test set that was never used for selection.",
                  },
                  {
                    id: "b",
                    label: "Yes — you never used the val set for training, only evaluation",
                    description: "Using the val set 20 times for selection IS a form of indirect training. You are selecting hyperparameters that happened to work well on this particular val sample — overfitting the selection process to the val set's idiosyncrasies.",
                  },
                  {
                    id: "c",
                    label: "Yes — as long as you use random search, not grid search",
                    description: "The search strategy (random vs. grid) does not change the optimistic bias. The problem is the number of evaluations on the same held-out sample combined with always keeping the best.",
                  },
                  {
                    id: "d",
                    label: "Partially — it is reliable if the val set is large enough",
                    description: "A larger val set reduces variance but does not eliminate the selection bias from 20 evaluations. The expected val score for the selected model is still systematically higher than its true generalisation error.",
                  },
                ],
                branches: {
                  a: "f3_timeseries_choice",
                  b: "f3_recovery_valreliability",
                  c: "f3_recovery_valreliability",
                  d: "f3_recovery_valreliability",
                },
                rationale: "This is the 'multiple comparisons on the val set' problem — analogous to p-hacking. After k trials of selecting the best val score, you have implicitly optimised for that specific val sample. The fix is either nested cross-validation (inner loop for hyperparameters, outer loop for generalisation estimate) or a strictly held-out test set that is touched exactly once at the end.",
              },
              f3_timeseries_choice: {
                id: "f3_timeseries_choice",
                type: "scenario_choice",
                badge: "Stage 3",
                title: "Stage 3 · Time-series splitting",
                prompt: "You have 3 years of daily stock price features and want to predict next-day returns. You apply sklearn's train_test_split with shuffle=True (default), using 80% train / 20% test. What is wrong with this approach?",
                code_snippet: `import pandas as pd
from sklearn.model_selection import train_test_split

df = load_3_years_of_prices()   # 1095 rows, sorted by date
X = df.drop("next_day_return", axis=1)
y = df["next_day_return"]

# Default split — random shuffle
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.20, random_state=42   # ds-target:random_split
)`,
                choices: [
                  {
                    id: "a",
                    label: "Temporal leakage — future data is included in the training set",
                    description: "Correct. A random split ignores the time dimension. Training rows can include data from day 1000 while test rows contain data from day 50. The model effectively sees 'future' information during training, making the test score a massive overestimate of real-world performance.",
                  },
                  {
                    id: "b",
                    label: "The test set is too small at 20%",
                    description: "Test set size is a separate concern. The fundamental error is the random shuffle, not the 80/20 ratio. Even a 50/50 random split would be wrong for time-series data.",
                  },
                  {
                    id: "c",
                    label: "train_test_split should not be used for regression problems",
                    description: "train_test_split works for regression. The problem is the random ordering, which is valid for i.i.d. data but not for time-series data.",
                  },
                  {
                    id: "d",
                    label: "The random_state should be omitted for time-series data",
                    description: "The random_state controls reproducibility. Removing it changes nothing about the fundamental problem — you still get a randomly shuffled split regardless of the seed.",
                  },
                ],
                branches: {
                  a: "f3_terminal",
                  b: "f3_recovery_temporal",
                  c: "f3_recovery_temporal",
                  d: "f3_recovery_leakage",
                },
                rationale: "Time-series data violates the i.i.d. assumption that underpins random splitting. The correct approach is a chronological split: the first 80% of days for training, the last 20% for testing. For cross-validation, use TimeSeriesSplit which expands the training window forward in time. Never shuffle time-series data before splitting.",
              },
              f3_recovery_leakage: {
                id: "f3_recovery_leakage",
                type: "scenario_choice",
                badge: "Recovery A",
                title: "Recovery · Correct pipeline order",
                prompt: "Which pipeline order correctly prevents data leakage when using a scaler and a classifier?",
                code_snippet: `# Option A:
scaler.fit_transform(X_all)
X_train, X_test = split(X_all_scaled)
clf.fit(X_train); clf.score(X_test)

# Option B:
X_train, X_test = split(X_all)
scaler.fit(X_train)
X_train_s = scaler.transform(X_train)
X_test_s  = scaler.transform(X_test)
clf.fit(X_train_s); clf.score(X_test_s)

# Option C:
X_train, X_test = split(X_all)
scaler.fit_transform(X_train)
scaler.fit_transform(X_test)
clf.fit(X_train); clf.score(X_test)`,
                choices: [
                  {
                    id: "a",
                    label: "Option B — split first, then fit scaler on training set only, then transform both",
                    description: "Correct. Splitting before fitting the scaler ensures that the scaler's parameters (mean, std) are derived only from training data. The test set is then transformed using those same training-derived parameters — simulating a truly unseen deployment scenario.",
                  },
                  {
                    id: "b",
                    label: "Option A — fit scaler on all data first for the most stable statistics",
                    description: "Fitting on all data leaks test set statistics into preprocessing. The 'more stable statistics' argument is wrong — using test data to inform preprocessing is always leakage, regardless of the benefit.",
                  },
                  {
                    id: "c",
                    label: "Option C — fit a separate scaler on the test set",
                    description: "Fitting a separate scaler on the test set means train and test are on different scales. In deployment you won't have the luxury of fitting a new scaler for each incoming batch — you must use the training scaler.",
                  },
                  {
                    id: "d",
                    label: "Options A and B are equivalent because StandardScaler is deterministic",
                    description: "They are not equivalent. Option A's scaler sees all 1000 rows; Option B's scaler sees only 800. The mean and std will differ, and Option A encodes test information into the transformation.",
                  },
                ],
                branches: {
                  a: "f3_val_tuning_choice",
                  b: "f3_recovery_leakage",
                  c: "f3_recovery_leakage",
                  d: "f3_recovery_leakage",
                },
                rationale: "The golden rule: fit preprocessing on training data only, transform both train and test using training statistics. This mirrors production: you train a scaler once, save it, and apply it to incoming data at inference. Fitting on test data is always leakage — even if the improvement looks small in practice.",
              },
              f3_recovery_valreliability: {
                id: "f3_recovery_valreliability",
                type: "scenario_choice",
                badge: "Recovery B",
                title: "Recovery · K-fold cross-validation",
                prompt: "Why does k-fold cross-validation produce a more reliable generalisation estimate than a single train/val split?",
                code_snippet: `# Single split:
# Train on 80%, evaluate on 20% → one val score

# 5-fold CV:
# Fold 1: train on folds 2-5, val on fold 1 → score_1
# Fold 2: train on folds 1,3-5, val on fold 2 → score_2
# Fold 3: train on folds 1-2,4-5, val on fold 3 → score_3
# Fold 4: train on folds 1-3,5, val on fold 4 → score_4
# Fold 5: train on folds 1-4, val on fold 5 → score_5
# Final: mean(score_1..5) ± std(score_1..5)`,
                choices: [
                  {
                    id: "a",
                    label: "Every data point serves as validation exactly once, reducing variance from unlucky splits",
                    description: "Correct. A single val split may be unusually easy or hard depending on which 20% was randomly assigned to validation. K-fold averages over k different validation sets, giving a lower-variance estimate of true generalisation performance. The std across folds also quantifies stability.",
                  },
                  {
                    id: "b",
                    label: "K-fold trains on more data overall, so the models are stronger",
                    description: "K-fold trains k separate models, each on (1-1/k) of the data. The purpose is a better estimate of generalisation, not stronger models. The final deployed model is typically retrained on all data using the best hyperparameters found.",
                  },
                  {
                    id: "c",
                    label: "K-fold prevents overfitting by training on smaller subsets",
                    description: "K-fold is an evaluation technique, not a regularization technique. It does not prevent the model from overfitting — it gives a better estimate of whether the model has overfit.",
                  },
                  {
                    id: "d",
                    label: "K-fold automatically handles data leakage from preprocessing",
                    description: "K-fold does not automatically handle preprocessing leakage. You must use sklearn Pipeline to ensure preprocessing is fit inside each fold. If you preprocess outside the CV loop, you still have leakage.",
                  },
                ],
                branches: {
                  a: "f3_timeseries_choice",
                  b: "f3_recovery_valreliability",
                  c: "f3_recovery_valreliability",
                  d: "f3_recovery_valreliability",
                },
                rationale: "K-fold's key advantage is variance reduction in the evaluation estimate. One random split gives one data point about model quality; k folds give k data points. The mean is a more reliable estimate, and the std tells you how sensitive the model is to the particular training sample. For small datasets, k-fold is especially important because no single 20% split is representative.",
              },
              f3_recovery_temporal: {
                id: "f3_recovery_temporal",
                type: "scenario_choice",
                badge: "Recovery C",
                title: "Recovery · Temporal data splitting",
                prompt: "For time-series cross-validation, which strategy is correct?",
                code_snippet: `# Strategy A: shuffle all data, then use standard k-fold
# Strategy B: TimeSeriesSplit — expanding window
#   Fold 1: train [t1..t200], val [t201..t250]
#   Fold 2: train [t1..t250], val [t251..t300]
#   Fold 3: train [t1..t300], val [t301..t350]
# Strategy C: fixed window
#   Fold 1: train [t1..t200],   val [t201..t250]
#   Fold 2: train [t51..t250],  val [t251..t300]
#   Fold 3: train [t101..t300], val [t301..t350]`,
                choices: [
                  {
                    id: "a",
                    label: "Strategy B — TimeSeriesSplit with expanding training window",
                    description: "Correct. The expanding window always trains on past data and validates on future data, mirroring real deployment. It grows the training set over time, which also tests whether more historical data improves performance.",
                  },
                  {
                    id: "b",
                    label: "Strategy A — shuffle then k-fold",
                    description: "Shuffling destroys the temporal order, introducing future leakage into every fold. This is the mistake we want to avoid.",
                  },
                  {
                    id: "c",
                    label: "Strategy C — sliding window with fixed training size",
                    description: "Sliding window is valid in some scenarios (concept drift, where old data is irrelevant), but it does not test how performance improves with more data and can underestimate generalisation error. TimeSeriesSplit is the standard default.",
                  },
                  {
                    id: "d",
                    label: "All strategies are equivalent if the data has no seasonality",
                    description: "Temporal leakage occurs regardless of seasonality. Any strategy that allows future data into training is invalid for time-series, even if there is no cyclical pattern.",
                  },
                ],
                branches: {
                  a: "f3_terminal",
                  b: "f3_recovery_temporal",
                  c: "f3_recovery_temporal",
                  d: "f3_recovery_temporal",
                },
                rationale: "TimeSeriesSplit ensures that the validation set is always in the future relative to the training set. This is the only honest evaluation strategy for sequential data. Shuffling destroys the causal ordering and produces optimistically biased estimates of real-world performance.",
              },
              f3_terminal: {
                id: "f3_terminal",
                type: "scenario_choice",
                badge: "Complete",
                title: "Revision complete · Evaluation Mastery",
                terminal: true,
                prompt: "A recruiter says: 'Your model hit 94% accuracy on the test set.' You are suspicious. Which set of three questions would best expose whether this score is reliable?",
                code_snippet: `# Context:
# - Binary classification (fraud detection, 5% positive rate)
# - Test set used: unknown provenance
# - Model selection: unknown process
# - Preprocessing: unknown pipeline order`,
                choices: [
                  {
                    id: "a",
                    label: "1) Was preprocessing fit on training data only? 2) Was the test set used more than once (for selection or tuning)? 3) Is accuracy the right metric for a 5% positive-rate problem?",
                    description: "Correct and comprehensive. These three questions cover the three most common evaluation failures: preprocessing leakage, test set reuse, and metric mismatch. A 94% accuracy on a 5% positive-rate dataset is achievable by predicting all negatives — the model may have learned nothing useful.",
                  },
                  {
                    id: "b",
                    label: "1) What algorithm was used? 2) How large is the training set? 3) Was GPU training used?",
                    description: "These questions are about model architecture, not evaluation reliability. They do not probe for leakage, test set reuse, or metric validity.",
                  },
                  {
                    id: "c",
                    label: "1) Was cross-validation used? 2) What is the test set size? 3) Did you use early stopping?",
                    description: "Partially useful, but misses the critical leakage question. Knowing whether CV was used doesn't help if preprocessing was done outside the CV loop. Test set size and early stopping don't address the metric mismatch issue.",
                  },
                ],
                branches: {
                  a: "f3_terminal",
                  b: "f3_terminal",
                  c: "f3_terminal",
                },
                rationale: "Three red flags to always probe: (1) preprocessing leakage — fit_transform on full data before split inflates scores; (2) test set reuse — every time you peek at the test set and adjust something, it becomes part of your training signal; (3) metric relevance — accuracy on imbalanced data is misleading. For fraud detection, AUC-PR, F1, or cost-sensitive metrics are far more meaningful than raw accuracy.",
              },
            },
          },
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
    interviewGraph: {
            initialStageId: "f4_target_leakage_click",
            artifactDimensions: [
              {
                label: "Target Leakage Detection",
                recoveryStageId: "f4_recovery_targetleak",
              },
              {
                label: "Regularization & Selection",
                recoveryStageId: "f4_recovery_l1selection",
              },
              {
                label: "High-Cardinality Encoding",
                recoveryStageId: "f4_recovery_cardinality",
                passLabel: "Feature Engineering Mastery",
              },
            ],
            stages: {
              f4_target_leakage_click: {
                id: "f4_target_leakage_click",
                type: "click_target",
                badge: "Stage 1",
                title: "Stage 1 · Target leakage in feature construction",
                prompt: "An analyst is engineering features for a churn prediction model. The target variable is `churned` (1 if the account closed). Click the line that introduces target leakage.",
                code_snippet: `import pandas as pd

df = load_account_data()
# df has: account_id, signup_date, event_date (churn event), churned (0/1)

df["tenure_days"] = (df["event_date"] - df["signup_date"]).dt.days  # ds-target:tenure_days
df["days_since_last_login"] = compute_days_since_login(df)          # ds-target:last_login
df["days_until_churn"] = (df["event_date"] - df["snapshot_date"]).dt.days  # ds-target:days_until_churn

X = df[["tenure_days", "days_since_last_login", "days_until_churn"]]
y = df["churned"]`,
                validationCopy: {
                  tenure_days: "Not quite. Tenure (time since signup) is a legitimate feature — it doesn't use the churn event date to predict the outcome. Look for a feature that encodes information about when the churn event happened.",
                  last_login: "Close, but days_since_last_login is valid if computed from the snapshot date, not the event date. The most blatant leakage is a feature that directly encodes the future event timestamp. Look for a feature that measures time relative to event_date.",
                  days_until_churn: "Correct. `days_until_churn` is computed as (event_date - snapshot_date) — it directly encodes how far in the future the churn event occurs. This feature would only be available at the moment of churning, not before. Any model with this feature will appear perfect on training data but fail completely in production.",
                },
                branches: {
                  tenure_days: "f4_recovery_targetleak",
                  last_login: "f4_recovery_targetleak",
                  days_until_churn: "f4_l1_choice",
                },
              },
              f4_l1_choice: {
                id: "f4_l1_choice",
                type: "scenario_choice",
                badge: "Stage 2",
                title: "Stage 2 · L1 regularization effects",
                prompt: "You have 500 raw features. After training a logistic regression with L1 (Lasso) regularization, 480 of the feature coefficients are exactly zero. Is this feature selection, overfitting prevention, or both?",
                code_snippet: `from sklearn.linear_model import LogisticRegression

lr = LogisticRegression(penalty="l1", solver="liblinear", C=0.01)
lr.fit(X_train_500_features, y_train)

non_zero = (lr.coef_ != 0).sum()
print(f"Non-zero coefficients: {non_zero} / 500")
# Output: Non-zero coefficients: 20 / 500`,
                choices: [
                  {
                    id: "a",
                    label: "Both — L1 simultaneously performs feature selection and reduces overfitting",
                    description: "Correct. L1 regularization produces sparse solutions by driving many weights to exactly zero. This is simultaneously: feature selection (only 20 features survive) and regularization (the restricted model generalises better than an unregularised 500-feature model). L1 is unique among regularizers in producing true sparsity — L2 shrinks weights but rarely reaches exactly zero.",
                  },
                  {
                    id: "b",
                    label: "Feature selection only — L1 is a filter method, not a regularizer",
                    description: "L1 is a wrapper/embedded method, not a filter method, and it is definitively a regularizer. It modifies the loss function during training, which directly affects both sparsity (selection) and generalisation (regularization).",
                  },
                  {
                    id: "c",
                    label: "Overfitting prevention only — the zero weights just happen to select features as a side effect",
                    description: "The sparsity is not a side effect — it is the mechanism. L1's geometry (L1 ball has corners at axis points) causes the optimum to land at sparse solutions. Both effects are primary and intentional.",
                  },
                  {
                    id: "d",
                    label: "Neither — 480 zeroed features means the model has underfit",
                    description: "Underfitting depends on whether the remaining 20 features are sufficient to represent the true relationship. It is possible to overfit (too complex) or underfit (too simple) with any number of features. L1 with a high regularization strength (low C) may underfit, but that is a tuning question, not an inherent property.",
                  },
                ],
                branches: {
                  a: "f4_cardinality_choice",
                  b: "f4_recovery_l1selection",
                  c: "f4_recovery_l1selection",
                  d: "f4_recovery_l1selection",
                },
                rationale: "L1's defining property is exact sparsity — it produces coefficients that are exactly zero, unlike L2 which shrinks toward zero but rarely hits it. This makes L1 both a feature selection method (zero coefficients drop features) and a regularizer (restricted model weights generalise better). In high-dimensional settings, L1 is a principled way to simultaneously discover signal features and prevent overfitting.",
              },
              f4_cardinality_choice: {
                id: "f4_cardinality_choice",
                type: "scenario_choice",
                badge: "Stage 3",
                title: "Stage 3 · High-cardinality encoding risk",
                prompt: "A feature `user_country` has 180 unique values. You apply pd.get_dummies() before training a gradient boosted tree. What is the primary risk of this approach?",
                code_snippet: `import pandas as pd

df = load_user_data()
print(df["user_country"].nunique())  # 180 unique countries

# One-hot encode
df_encoded = pd.get_dummies(df, columns=["user_country"])
# Result: adds 180 binary columns to the feature matrix

X = df_encoded.drop("target", axis=1)
# Training set has 5,000 rows, now ~200+ features`,
                choices: [
                  {
                    id: "a",
                    label: "180 sparse binary columns → high dimensionality, overfitting risk, and poor generalisation for rare categories",
                    description: "Correct. With 5,000 rows and 180 new binary columns, many country dummies will have fewer than 10 positive examples — the model can't learn a reliable signal for rare countries and may overfit to noise. Additionally, sparse high-dimensional representations slow training and hurt interpretability. Better approaches: target encoding (replace with mean target per category), frequency encoding, or grouping rare countries into 'Other'.",
                  },
                  {
                    id: "b",
                    label: "get_dummies will fail if the test set has unseen countries",
                    description: "This is a real deployment risk, but it is a different problem from high cardinality overfitting. The question asks about the primary risk, which is the statistical quality of the encoding, not the engineering failure mode.",
                  },
                  {
                    id: "c",
                    label: "Tree models can't use one-hot encoded features",
                    description: "Tree models handle one-hot encoded features. In fact, some tree implementations handle categorical features natively. The concern is not compatibility but statistical efficiency when cardinality is high.",
                  },
                  {
                    id: "d",
                    label: "One-hot encoding doubles the memory usage",
                    description: "Memory usage increases, but for 5,000 rows and 180 columns this is manageable. The primary statistical risk — sparse representations and overfitting on rare categories — is the more important concern.",
                  },
                ],
                branches: {
                  a: "f4_terminal",
                  b: "f4_recovery_cardinality",
                  c: "f4_recovery_cardinality",
                  d: "f4_recovery_cardinality",
                },
                rationale: "High-cardinality one-hot encoding creates a sparse, wide feature matrix. For rare categories (e.g., a country with 3 training examples), the model sees almost no signal and may memorise those few examples. Target encoding replaces each category with the mean target value in that category, collapsing 180 columns to 1. Regularised target encoding (with smoothing) prevents target leakage on low-frequency categories.",
              },
              f4_recovery_targetleak: {
                id: "f4_recovery_targetleak",
                type: "scenario_choice",
                badge: "Recovery A",
                title: "Recovery · Identifying target leakage",
                prompt: "Which of these features would introduce target leakage in a loan default prediction model (target: will the borrower default within 12 months)?",
                code_snippet: `# Features under consideration:
# A) debt_to_income_ratio at time of application
# B) number_of_late_payments in the 6 months AFTER the loan was issued
# C) credit_score at time of application
# D) annual_income at time of application`,
                choices: [
                  {
                    id: "a",
                    label: "B — late payments AFTER loan issuance",
                    description: "Correct. Information about events that occur after the prediction point (loan issuance) cannot be known at the time of prediction. Including these post-event features means the model is trained on future data — it will appear perfect in training but completely fail in production where those features don't exist yet.",
                  },
                  {
                    id: "b",
                    label: "A — debt-to-income ratio",
                    description: "Debt-to-income ratio at application time is valid. It is known at the moment of the decision and captures the financial risk profile at prediction time.",
                  },
                  {
                    id: "c",
                    label: "C — credit score at application",
                    description: "Credit score at application time is valid and one of the most predictive features for loan default. It is available before the target event.",
                  },
                  {
                    id: "d",
                    label: "D — annual income at application",
                    description: "Annual income at application is a valid feature — it is known at prediction time and is a legitimate risk signal.",
                  },
                ],
                branches: {
                  a: "f4_l1_choice",
                  b: "f4_recovery_targetleak",
                  c: "f4_recovery_targetleak",
                  d: "f4_recovery_targetleak",
                },
                rationale: "Target leakage occurs when a feature encodes information that is only available after the target event occurs. The test: 'Would I have this feature value at the time I need to make a prediction?' Post-event data (late payments after issuance, claims after underwriting) always leaks. Pre-event data (financial state at application time) is always valid.",
              },
              f4_recovery_l1selection: {
                id: "f4_recovery_l1selection",
                type: "scenario_choice",
                badge: "Recovery B",
                title: "Recovery · L1 vs L2 regularization",
                prompt: "You want to automatically identify which features are irrelevant and remove them from your model. Which regularization penalty achieves this most directly?",
                code_snippet: `# Option A: L1 (Lasso) penalty: add λ * Σ|w_i| to loss
# Option B: L2 (Ridge) penalty: add λ * Σw_i² to loss
# Option C: Elastic Net: add λ₁ * Σ|w_i| + λ₂ * Σw_i²
# Option D: Dropout (neural network only)`,
                choices: [
                  {
                    id: "a",
                    label: "L1 (Lasso) — produces exactly-zero coefficients for irrelevant features",
                    description: "Correct. L1's geometry creates exact sparsity. The L1 ball has corners at coordinate axes, so the optimal solution tends to land at points where some coefficients are exactly zero — effectively removing those features from the model. L2 shrinks all weights toward zero but almost never reaches exactly zero.",
                  },
                  {
                    id: "b",
                    label: "L2 (Ridge) — shrinks all weights toward zero equally",
                    description: "L2 shrinks weights but keeps all features with non-zero (though small) coefficients. You cannot use L2 to identify irrelevant features because no coefficient is driven to exactly zero.",
                  },
                  {
                    id: "c",
                    label: "Elastic Net — best of both L1 and L2",
                    description: "Elastic Net is good when you want sparse solutions but also stability under correlated features (a weakness of pure L1). However, if the primary goal is feature selection through sparsity, pure L1 is simpler and more directly applicable.",
                  },
                  {
                    id: "d",
                    label: "Dropout — random feature removal during training",
                    description: "Dropout randomly deactivates neurons during training to prevent co-adaptation. It is a regularization technique for neural networks, not a feature selection method. It does not identify or remove specific features.",
                  },
                ],
                branches: {
                  a: "f4_cardinality_choice",
                  b: "f4_recovery_l1selection",
                  c: "f4_recovery_l1selection",
                  d: "f4_recovery_l1selection",
                },
                rationale: "L1's unique property is exact zeros. This arises from the geometry of the L1 penalty ball: its non-smooth corners at the axes make the loss minimum often occur at a sparse point. In practice, L1 regularization is used as an embedded feature selection method for linear models — you get a model and a feature selection in one step.",
              },
              f4_recovery_cardinality: {
                id: "f4_recovery_cardinality",
                type: "scenario_choice",
                badge: "Recovery C",
                title: "Recovery · Encoding high-cardinality categories",
                prompt: "Target encoding replaces each category value with the mean target value for that category. What is the main risk of naive target encoding, and how is it mitigated?",
                code_snippet: `# Naive target encoding:
# For each category c:
#   encoding[c] = mean(y[X == c])

# Example: user_country = "LU" appears 2 times in training
# Both rows are positive (churned)
# Naive encoding: 2/2 = 1.0 → perfect signal!
# But this is just noise from a tiny sample.`,
                choices: [
                  {
                    id: "a",
                    label: "Target leakage for rare categories — mitigated by smoothing with the global mean",
                    description: "Correct. Rare categories have very few samples, so their target mean is based on almost no data and will be noisy. This noise leaks target information directly into the feature. Smoothing blends the category mean toward the global mean proportional to sample size: encoding = (n_c * mean_c + k * global_mean) / (n_c + k). This shrinks rare categories toward the global mean and prevents overfitting on noise.",
                  },
                  {
                    id: "b",
                    label: "Model complexity — mitigated by using fewer categories",
                    description: "Model complexity is not the primary concern with target encoding. The issue is noise in category estimates for rare values, not the number of categories in the model.",
                  },
                  {
                    id: "c",
                    label: "Scaling issues — target encoding produces values in [0,1] which confuse tree models",
                    description: "Tree models are scale-invariant — they use rank-order splits. Target encoding values being in [0,1] is not a problem for tree-based models.",
                  },
                  {
                    id: "d",
                    label: "Collinearity with the target — mitigated by PCA after encoding",
                    description: "PCA after encoding would destroy the semantic meaning of the encoded feature. The risk is target leakage on training data, not collinearity with the target in a PCA sense.",
                  },
                ],
                branches: {
                  a: "f4_terminal",
                  b: "f4_recovery_cardinality",
                  c: "f4_recovery_cardinality",
                  d: "f4_recovery_cardinality",
                },
                rationale: "Smoothed target encoding is the industry standard for high-cardinality categoricals. The formula blends each category's empirical mean with the global mean, weighted by the category's sample count. For categories with hundreds of examples, the encoding is close to the empirical mean. For categories with 1-2 examples, the encoding is pulled toward the global mean — preventing the model from treating noise as a strong signal.",
              },
              f4_terminal: {
                id: "f4_terminal",
                type: "scenario_choice",
                badge: "Complete",
                title: "Revision complete · Feature Engineering Mastery",
                terminal: true,
                prompt: "You are predicting customer churn from raw clickstream data (page_viewed, timestamp, session_id, user_id, duration_seconds). Which set of engineered features best captures meaningful churn signals?",
                code_snippet: `# Raw clickstream schema:
# user_id, session_id, page_viewed, timestamp, duration_seconds

# Your task: engineer predictive features for churn prediction
# Target: will the user churn within the next 30 days?`,
                choices: [
                  {
                    id: "a",
                    label: "1) days_since_last_session (recency of engagement) · 2) sessions_per_week_last_4w (frequency trend) · 3) avg_session_duration_last_4w (depth of engagement)",
                    description: "Correct. These three features capture the RFM (Recency, Frequency, Monetary/depth) framework applied to clickstream: recency tells you if the user has gone quiet, frequency trend captures declining engagement, and session duration reflects how deeply users engage per visit. All are computable from historical data before the prediction point — no target leakage.",
                  },
                  {
                    id: "b",
                    label: "1) total_pages_ever_viewed · 2) account_age_days · 3) number_of_support_tickets",
                    description: "These are valid but weaker features. Total pages ever viewed mixes historical and recent signal without distinguishing current engagement trend. Account age is a background feature. Support tickets are useful but not derived from clickstream. None captures the recency and frequency signals that best predict churn.",
                  },
                  {
                    id: "c",
                    label: "1) pages_viewed_after_churn_date · 2) final_session_duration · 3) days_until_account_close",
                    description: "All three features are target leakage. They all require knowledge of the churn event date, which only exists after the user has already churned. These would never be available at prediction time.",
                  },
                ],
                branches: {
                  a: "f4_terminal",
                  b: "f4_terminal",
                  c: "f4_terminal",
                },
                rationale: "Effective churn features from clickstream follow the RFM pattern: Recency (how recently did the user engage?), Frequency (how often over recent windows?), and Depth (how long per session?). A user who was highly active 3 months ago but has not visited in 2 weeks is a churn risk — this shows in all three metrics. Always compute features at the snapshot date, never using information from after the prediction point.",
              },
            },
          },
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
    interviewGraph: {
            initialStageId: "f5_scaling_click",
            artifactDimensions: [
              {
                label: "Scaler Pipeline Order",
                recoveryStageId: "f5_recovery_pipeline",
              },
              {
                label: "Scaler Selection",
                recoveryStageId: "f5_recovery_scalerchoice",
              },
              {
                label: "Encoding Correctness",
                recoveryStageId: "f5_recovery_encoding",
                passLabel: "Scaling & Encoding Mastery",
              },
            ],
            stages: {
              f5_scaling_click: {
                id: "f5_scaling_click",
                type: "click_target",
                badge: "Stage 1",
                title: "Stage 1 · Scaler before split",
                prompt: "A data scientist applied MinMaxScaler to the full dataset before splitting. Click the line where the scaler first sees test data, causing leakage.",
                code_snippet: `from sklearn.preprocessing import MinMaxScaler
from sklearn.model_selection import train_test_split

X, y = load_data()

scaler = MinMaxScaler()
X_scaled = scaler.fit_transform(X)     # ds-target:fit_all

X_train, X_test, y_train, y_test = train_test_split(
    X_scaled, y, test_size=0.2
)

model.fit(X_train, y_train)
test_score = model.score(X_test, y_test)`,
                validationCopy: {
                  fit_all: "Correct. fit_transform(X) computes the min and max from ALL rows — including the rows that will become the test set. MinMaxScaler maps values to [0,1] using these global min/max values, so the test set's scale information is baked into the transformation. The correct approach: split first, then fit the scaler on X_train only, then transform both X_train and X_test using the training min/max.",
                },
                branches: {
                  fit_all: "f5_outlier_choice",
                },
              },
              f5_outlier_choice: {
                id: "f5_outlier_choice",
                type: "scenario_choice",
                badge: "Stage 2",
                title: "Stage 2 · Scaler vs. outliers",
                prompt: "A feature `transaction_amount` has a heavy right-skew: most values are between $5–$200, but 3 transactions are $50,000+. You apply StandardScaler. What happens to the majority of values?",
                code_snippet: `import numpy as np
from sklearn.preprocessing import StandardScaler

# transaction_amount distribution:
# 99.7% of values: $5 - $200   (mean ≈ $45, std ≈ $28 without outliers)
# 0.3% of values:  $50,000+    (3 extreme outliers)

# After StandardScaler:
# mean_actual ≈ $192  (pulled up by outliers)
# std_actual  ≈ $1,847 (inflated by outliers)

# Most values get scaled to: (X - 192) / 1847`,
                choices: [
                  {
                    id: "a",
                    label: "Most values get squashed near zero — outliers dominate the mean and std",
                    description: "Correct. The three $50,000+ outliers inflate the mean to ~$192 and the standard deviation to ~$1,847. For a typical $50 transaction: (50-192)/1847 ≈ -0.077. For a $100 transaction: (100-192)/1847 ≈ -0.050. Nearly all values land in a narrow band around zero, destroying the signal differences between normal transactions. Use RobustScaler (uses median and IQR instead of mean and std) or apply a log transform first.",
                  },
                  {
                    id: "b",
                    label: "Outliers get clipped to a maximum of 3 standard deviations",
                    description: "StandardScaler does not clip outliers. It shifts and scales all values including outliers. The clipping behavior you describe is a separate step (e.g., Winsorization) that must be applied explicitly.",
                  },
                  {
                    id: "c",
                    label: "All values become normally distributed after scaling",
                    description: "StandardScaler does not change the shape of the distribution — it only shifts (subtracts mean) and scales (divides by std). A right-skewed distribution remains right-skewed after StandardScaler. The normal distribution claim is a common misconception.",
                  },
                  {
                    id: "d",
                    label: "The outliers are automatically removed as they exceed 3 standard deviations",
                    description: "StandardScaler does not remove any values. Every value, including extreme outliers, is transformed and retained. StandardScaler has no concept of outlier removal.",
                  },
                ],
                branches: {
                  a: "f5_tree_scaling_choice",
                  b: "f5_recovery_scalerchoice",
                  c: "f5_recovery_scalerchoice",
                  d: "f5_recovery_scalerchoice",
                },
                rationale: "StandardScaler uses mean and std, both of which are sensitive to outliers. When outliers inflate these statistics, the transformation squashes the majority of values into a tiny band near zero. RobustScaler uses the median (50th percentile) and IQR (75th - 25th percentile), which are resistant to extreme values. Alternatively, a log or power transform applied before StandardScaler can reduce skew before scaling.",
              },
              f5_tree_scaling_choice: {
                id: "f5_tree_scaling_choice",
                type: "scenario_choice",
                badge: "Stage 3",
                title: "Stage 3 · Scaling and tree models",
                prompt: "A teammate spends an hour carefully tuning a StandardScaler before training a Random Forest classifier. Is this time well spent?",
                code_snippet: `from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline

# Teammate's pipeline:
pipe = Pipeline([
    ("scaler", StandardScaler()),
    ("rf", RandomForestClassifier(n_estimators=100))
])
pipe.fit(X_train, y_train)`,
                choices: [
                  {
                    id: "a",
                    label: "No — decision trees and random forests are scale-invariant; scaling has no effect on predictions",
                    description: "Correct. Tree-based models make splits based on threshold comparisons (e.g., 'is feature X > 0.47?'). Whether X is in its original scale or standardised, the relative ordering of values is identical, so the optimal split threshold and the resulting tree structure are the same. StandardScaler will not change Random Forest predictions, feature importances, or performance metrics.",
                  },
                  {
                    id: "b",
                    label: "Yes — scaling improves the random forest's convergence speed",
                    description: "Random forests do not use gradient-based optimisation, so there is no convergence to speed up. Trees are grown using greedy split search, which is purely based on value comparisons — completely unaffected by scale.",
                  },
                  {
                    id: "c",
                    label: "Yes — scaled features improve the quality of random splits in the forest",
                    description: "'Random splits' in random forests refer to random feature sampling at each node, not random value splits. The split thresholds are optimised greedily regardless of scale.",
                  },
                  {
                    id: "d",
                    label: "It depends on whether the features have negative values",
                    description: "Tree models handle negative values natively. Scale and sign of features have no effect on tree split decisions.",
                  },
                ],
                branches: {
                  a: "f5_ohe_choice",
                  b: "f5_recovery_scalerchoice",
                  c: "f5_recovery_scalerchoice",
                  d: "f5_recovery_scalerchoice",
                },
                rationale: "Scale-invariant algorithms: decision trees, random forests, gradient boosted trees, and any algorithm based on rank-order comparisons. Scale-sensitive algorithms: linear models, SVM, k-NN, k-means, PCA, and neural networks (anything that uses distances, dot products, or gradient steps). Knowing which algorithms need scaling is a fundamental production ML skill.",
              },
              f5_ohe_choice: {
                id: "f5_ohe_choice",
                type: "scenario_choice",
                badge: "Stage 4",
                title: "Stage 4 · Dummy variable trap",
                prompt: "You one-hot encode a categorical feature with k=50 categories for a logistic regression. What is the correct action regarding the encoded columns?",
                code_snippet: `import pandas as pd
from sklearn.linear_model import LogisticRegression

df = load_data()
# "product_category" has 50 unique values

# One-hot encoding:
df_ohe = pd.get_dummies(df, columns=["product_category"])
# Creates 50 binary columns: product_category_A ... product_category_AX

X = df_ohe.drop("target", axis=1)
model = LogisticRegression()
model.fit(X, y)  # ← is something missing?`,
                choices: [
                  {
                    id: "a",
                    label: "Drop one column (e.g., drop_first=True) to avoid perfect multicollinearity",
                    description: "Correct. With 50 one-hot columns, they sum to exactly 1 for every row (exactly one category is active). This perfect multicollinearity means the design matrix is rank-deficient — the 50th column is a perfect linear combination of the other 49. For logistic regression this causes the dummy variable trap: coefficients are not uniquely identified. Dropping one reference column removes the linear dependency while preserving all information (the dropped category becomes the baseline).",
                  },
                  {
                    id: "b",
                    label: "Keep all 50 columns — regularization will handle multicollinearity",
                    description: "Regularization reduces the magnitude of collinear coefficients but does not resolve the identification problem. With perfect multicollinearity (not just high correlation), the inverse of X^T X is undefined without regularization. While L2 regularization technically makes the system solvable by adding λI to the matrix, it obscures interpretation and the fix is better applied at the encoding step.",
                  },
                  {
                    id: "c",
                    label: "Keep all 50 columns — pandas get_dummies automatically handles this",
                    description: "pandas get_dummies does NOT automatically drop a column. You must pass drop_first=True or handle the reference category manually.",
                  },
                  {
                    id: "d",
                    label: "Drop all columns and use label encoding instead",
                    description: "Label encoding (mapping categories to integers 0–49) implies ordinal ordering that does not exist for nominal categories. Dropping all OHE columns removes the categorical information entirely.",
                  },
                ],
                branches: {
                  a: "f5_terminal",
                  b: "f5_recovery_encoding",
                  c: "f5_recovery_encoding",
                  d: "f5_recovery_encoding",
                },
                rationale: "The dummy variable trap arises from perfect multicollinearity in one-hot encoded features. The k dummy columns always sum to 1, making one column a linear combination of the others. For linear and logistic regression, drop one reference column (drop_first=True in pandas, or handle via the encoder). For tree-based models, keeping all k columns is fine and sometimes preferred for interpretability.",
              },
              f5_recovery_pipeline: {
                id: "f5_recovery_pipeline",
                type: "scenario_choice",
                badge: "Recovery A",
                title: "Recovery · Correct scaler pipeline order",
                prompt: "You are using 5-fold cross-validation to evaluate a pipeline with StandardScaler + LogisticRegression. Which implementation correctly avoids data leakage?",
                code_snippet: `# Option A — scale outside CV loop:
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)
scores = cross_val_score(LogisticRegression(), X_scaled, y, cv=5)

# Option B — scale inside CV loop using Pipeline:
from sklearn.pipeline import Pipeline
pipe = Pipeline([("scaler", StandardScaler()), ("lr", LogisticRegression())])
scores = cross_val_score(pipe, X, y, cv=5)`,
                choices: [
                  {
                    id: "a",
                    label: "Option B — Pipeline ensures the scaler is fit inside each CV fold",
                    description: "Correct. When you pass a Pipeline to cross_val_score, sklearn refits the entire pipeline (including the scaler) on each fold's training data. The validation fold is then transformed using the training fold's statistics only. Option A leaks: the scaler sees all 5 folds before any split.",
                  },
                  {
                    id: "b",
                    label: "Option A — scaling once is more efficient and equally correct",
                    description: "Option A is NOT equally correct. Fitting the scaler before the CV loop means the scaler's mean and std are computed from all data including each fold's validation set. This is exactly the leakage we want to avoid.",
                  },
                  {
                    id: "c",
                    label: "Both are equivalent if you use StandardScaler (which is deterministic)",
                    description: "Determinism is not the issue. The issue is whether the scaler's statistics are contaminated by test-fold data. Option A always contaminates; Option B never does.",
                  },
                  {
                    id: "d",
                    label: "Neither — you should always do manual CV to control the scaler",
                    description: "sklearn Pipeline handles this correctly and is the recommended production approach. Manual CV with proper scaler handling is equivalent but more error-prone.",
                  },
                ],
                branches: {
                  a: "f5_outlier_choice",
                  b: "f5_recovery_pipeline",
                  c: "f5_recovery_pipeline",
                  d: "f5_recovery_pipeline",
                },
                rationale: "sklearn Pipeline is the correct abstraction for preventing preprocessing leakage in cross-validation. It ensures that every step (scaler, encoder, selector, model) is fit only on the training fold and applied (not refit) on the validation fold. This is the production-grade pattern — always use Pipeline when combining preprocessing with a model.",
              },
              f5_recovery_scalerchoice: {
                id: "f5_recovery_scalerchoice",
                type: "scenario_choice",
                badge: "Recovery B",
                title: "Recovery · Choosing the right scaler",
                prompt: "Match each situation to the best scaler choice.",
                code_snippet: `# Situation A: features are roughly normally distributed, no extreme outliers
# → Best: StandardScaler (zero mean, unit variance)

# Situation B: feature has extreme outliers that should not dominate scaling
# → Best: RobustScaler (uses median and IQR)

# Situation C: features need to be in a bounded range [0,1] for sigmoid output
# → Best: MinMaxScaler

# Situation D: you are training a Random Forest on mixed numeric features
# → Best: ???`,
                choices: [
                  {
                    id: "a",
                    label: "Situation D: No scaling needed — tree models are scale-invariant",
                    description: "Correct. Decision trees and ensemble methods (Random Forest, Gradient Boosting) split on value thresholds, which depend only on relative order, not absolute scale. Scaling does not change predictions, feature importances, or performance. The time spent scaling is wasted.",
                  },
                  {
                    id: "b",
                    label: "Situation D: StandardScaler — consistent preprocessing is always good practice",
                    description: "Consistent preprocessing is valuable for scale-sensitive algorithms. For tree models, it is unnecessary overhead. Applying it 'for consistency' adds computational cost and complexity without benefit.",
                  },
                  {
                    id: "c",
                    label: "Situation D: MinMaxScaler — tree splits work better in [0,1] range",
                    description: "Tree splits are based on threshold comparisons, not distances or magnitudes. The [0,1] range has no benefit for tree models.",
                  },
                  {
                    id: "d",
                    label: "Situation D: RobustScaler — robust to the outliers that often appear in mixed features",
                    description: "Robustness to outliers is only relevant when scale affects the algorithm. Since trees are scale-invariant, RobustScaler provides no benefit over no scaling at all.",
                  },
                ],
                branches: {
                  a: "f5_tree_scaling_choice",
                  b: "f5_recovery_scalerchoice",
                  c: "f5_recovery_scalerchoice",
                  d: "f5_recovery_scalerchoice",
                },
                rationale: "Scaler selection should be driven by algorithm requirements: StandardScaler for normally-distributed features with gradient-based models, RobustScaler when outliers are present and the algorithm is distance-based, MinMaxScaler when a bounded range is required (e.g., neural network sigmoid outputs, image pixel values). For tree-based models, no scaling is needed — skip it entirely.",
              },
              f5_recovery_encoding: {
                id: "f5_recovery_encoding",
                type: "scenario_choice",
                badge: "Recovery C",
                title: "Recovery · Encoding strategies",
                prompt: "A categorical feature has 3 ordered levels: Low, Medium, High. Which encoding is most appropriate for a linear regression?",
                code_snippet: `# Feature: severity = ["Low", "Medium", "High"]
# Three encoding options:

# A) Label encoding: Low=0, Medium=1, High=2
# B) One-hot encoding: [1,0,0], [0,1,0], [0,0,1]
# C) Binary encoding: Low=[0,0], Medium=[0,1], High=[1,0]
# D) Ordinal encoding with equal spacing: Low=-1, Medium=0, High=1`,
                choices: [
                  {
                    id: "a",
                    label: "Ordinal / label encoding (A or D) — the natural order should be preserved",
                    description: "Correct. When a categorical feature has a meaningful order (Low < Medium < High), encoding it as an ordered integer preserves the ordinal relationship. A linear regression can then learn a coefficient that captures the monotonic relationship. One-hot encoding discards the ordering and is less efficient for ordinal features. The equal-spacing assumption (D) is a reasonable default unless domain knowledge suggests otherwise.",
                  },
                  {
                    id: "b",
                    label: "One-hot encoding (B) — always preferred for categorical features",
                    description: "One-hot encoding is preferred for NOMINAL categories (no order). For ordinal categories like severity levels, it discards the meaningful ordering and requires 3 coefficients instead of 1 to represent a single feature, reducing efficiency.",
                  },
                  {
                    id: "c",
                    label: "Binary encoding (C) — most compact representation",
                    description: "Binary encoding is useful for reducing dimensionality when cardinality is high. For a 3-level ordinal feature, it encodes the values in a way that loses the ordinal meaning. Ordinal encoding is simpler and more interpretable here.",
                  },
                  {
                    id: "d",
                    label: "No encoding needed — linear regression handles string features natively",
                    description: "Linear regression requires numeric inputs. String features must be encoded before passing to any sklearn model.",
                  },
                ],
                branches: {
                  a: "f5_ohe_choice",
                  b: "f5_recovery_encoding",
                  c: "f5_recovery_encoding",
                  d: "f5_recovery_encoding",
                },
                rationale: "Encoding strategy depends on the nature of the categorical variable: Nominal (no order) → one-hot encoding (or target encoding for high cardinality). Ordinal (meaningful order) → label/ordinal encoding preserving the order. High cardinality (100+ values) → target encoding or embeddings. The type of model also matters: tree models can handle label encoding for nominal features without implying order; linear models cannot.",
              },
              f5_terminal: {
                id: "f5_terminal",
                type: "scenario_choice",
                badge: "Complete",
                title: "Revision complete · Scaling & Encoding Mastery",
                terminal: true,
                prompt: "A teammate applies StandardScaler across the full dataset before cross-validation. What goes wrong, and how do you fix it?",
                code_snippet: `# Teammate's code (flawed):
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import cross_val_score
from sklearn.linear_model import LogisticRegression

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)   # ← fit on ALL data

scores = cross_val_score(
    LogisticRegression(), X_scaled, y, cv=5
)
print("CV score:", scores.mean())`,
                choices: [
                  {
                    id: "a",
                    label: "Problem: scaler sees validation fold statistics during fit, inflating CV scores. Fix: use sklearn Pipeline to fit scaler inside each fold.",
                    description: "Correct and complete. The scaler's mean and std are computed from all rows including each fold's validation data. When that fold is later used for validation, it has already influenced the transformation — the validation set is no longer truly unseen. Fix: wrap the scaler and model in a Pipeline and pass the Pipeline to cross_val_score. sklearn will then refit the scaler on each fold's training data.",
                  },
                  {
                    id: "b",
                    label: "Problem: StandardScaler is slow on large datasets. Fix: use MinMaxScaler instead.",
                    description: "Performance is not the issue here. Both scalers have the same data leakage problem when applied before CV. The problem is the pipeline order, not the choice of scaler.",
                  },
                  {
                    id: "c",
                    label: "Problem: the cross-validation uses too many folds. Fix: reduce to 3-fold CV.",
                    description: "The number of folds is unrelated to the leakage issue. Whether you use 3, 5, or 10 folds, fitting the scaler before splitting leaks information in all cases.",
                  },
                ],
                branches: {
                  a: "f5_terminal",
                  b: "f5_terminal",
                  c: "f5_terminal",
                },
                rationale: "This is one of the most common preprocessing mistakes in practice. The fix is always the same: use sklearn Pipeline. The corrected code is: pipe = Pipeline([('scaler', StandardScaler()), ('lr', LogisticRegression())]); cross_val_score(pipe, X, y, cv=5). This guarantees that preprocessing is fit on the training fold only and applied (not refit) on the validation fold — mirroring the correct deployment pattern.",
              },
            },
          },
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
