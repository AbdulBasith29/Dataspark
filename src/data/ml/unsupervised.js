/**
 * Machine Learning → Unsupervised Learning lesson modules (ml-u1..ml-u4).
 * Shape matches LessonModuleSpec in ../lesson-modules.js.
 * Quality bar: the rich Python course lessons (py-c2).
 */

/** @type {Record<string, import("../lesson-modules.js").LessonModuleSpec>} */
export const ML_UNSUPERVISED = {
  "ml-u1": {
    durationLabel: "18–20 min",
    outcomes: [
      "Run **Lloyd's algorithm** in your head — assign to nearest centroid, recompute means, repeat — and explain why it only finds a **local** optimum of within-cluster variance.",
      "Choose **k** defensibly with the **elbow** and **silhouette** methods, and articulate why neither is a ground-truth oracle.",
      "Use **k-means++** initialization and **multiple restarts** to dodge the bad-seed failure mode, and know what `inertia_` actually measures.",
      "State the four assumptions k-means quietly makes — **spherical, equal-size, equal-density, Euclidean** clusters — and predict exactly how each one breaks the result.",
    ],
    learnMarkdown: `## The whole algorithm on a whiteboard

K-means is the clustering algorithm every interviewer reaches for first because it is brutally simple and yet hides three or four genuine traps. It partitions \`n\` points into \`k\` groups by minimizing the **within-cluster sum of squares** (WCSS, also called *inertia*): the sum over all points of the squared distance to their assigned centroid.

The optimization is NP-hard in general, so we do not solve it exactly. We run **Lloyd's algorithm**, which alternates two cheap steps until nothing moves:

1. **Assign** — each point joins the cluster whose centroid is nearest (Euclidean).
2. **Update** — each centroid moves to the **mean** of the points currently assigned to it.

\`\`\`
centroids = init(k)              # pick k starting centers
repeat:
    labels = argmin_j ||x_i - c_j||^2   # assign step
    for j in range(k):
        c_j = mean(points where label == j)   # update step
until labels stop changing (or max_iter)
\`\`\`

Each step **never increases** inertia, so the loop is guaranteed to converge. But it converges to a **local** minimum — the answer depends on where you started. Burn that into your head: *k-means converges, but not necessarily to the answer you want.*

---

## Why the mean? (the detail seniors get asked)

The update step uses the **arithmetic mean** for a precise reason: the mean is the point that minimizes the sum of **squared** Euclidean distances to a set of points. That is the exact quantity k-means is minimizing, so the two steps are coordinate descent on the same objective. If your objective were sum of *absolute* distances (L1), the minimizer would be the **median**, and you would have **k-medians**. If you cannot even compute a mean (categorical data, arbitrary distance matrices), you reach for **k-medoids / PAM**, which restricts centers to actual data points. Knowing *why* it is the mean signals you understand the loss, not just the recipe.

### A concrete worked picture

Imagine three customers on a single "spend" axis at \`{1, 2, 9}\`. With k=1 the centroid is the mean \`4\`, and inertia is \`(1-4)² + (2-4)² + (9-4)² = 9 + 4 + 25 = 38\`. Now split into two clusters \`{1, 2}\` and \`{9}\`: centroids \`1.5\` and \`9\`, inertia \`0.25 + 0.25 + 0 = 0.5\`. The drop from 38 to 0.5 is enormous because the lone point at 9 was dragging a single center. That is the elbow story in miniature: the first split that isolates a far-flung group pays off massively; later splits pay off less and less until you are just carving up noise. The assign/update loop is simply searching, greedily, for the split that lowers that number most — and it can get stuck if the seeds start it in the wrong basin.

---

## Choosing k: elbow vs silhouette

K is a hyperparameter you must supply. Two standard diagnostics:

**Elbow method.** Plot inertia against k. Inertia always falls as k rises (more centers → tighter clusters; at k=n it hits zero). You look for the "elbow" where the marginal gain flattens. The weakness: the elbow is often **ambiguous or smooth**, and on real data there may be no clean kink at all.

**Silhouette score.** For each point, \`s = (b - a) / max(a, b)\`, where \`a\` is its mean distance to others **in its own cluster** and \`b\` is the mean distance to points in the **nearest other cluster**. Range is \`[-1, 1]\`: near +1 means well-clustered, near 0 means on a boundary, **negative means the point is probably in the wrong cluster**. Average over all points and pick the k with the highest mean silhouette. Silhouette is more decisive than the elbow but is O(n²) to compute exactly and still assumes convex clusters.

| Method | What it rewards | Strength | Failure mode |
|--------|-----------------|----------|--------------|
| Elbow (inertia) | Compactness | Cheap, intuitive | No clear elbow; monotone curve |
| Silhouette | Compact **and** separated | More decisive; flags misassignment | O(n²); biased toward spherical |
| Gap statistic | Beats a null reference | Principled, can suggest k=1 | Costly; needs bootstrapping |
| Domain knowledge | Business meaning | Often the real answer | Not always available |

The honest senior answer to "how do you pick k?" is: *triangulate several diagnostics, sanity-check the resulting clusters against domain meaning, and never trust a single number.*

---

## Initialization is not a footnote

Random initialization can drop two centroids inside the same true blob and leave a real cluster unclaimed, giving you a bad local minimum that **looks** converged. Two defenses you should name:

- **k-means++** — seed centers one at a time, each new center chosen with probability proportional to its squared distance from the nearest already-chosen center. This spreads seeds out and gives a provable O(log k) expected-cost guarantee. It is scikit-learn's default (\`init="k-means++"\`).
- **Multiple restarts** — run the whole thing \`n_init\` times from different seeds and keep the lowest-inertia result. scikit-learn defaults to \`n_init=10\` (and now \`"auto"\`).

Empty clusters can also appear (a centroid wins zero points); libraries reseed them, but it is a smell that k may be too high.

---

## The four assumptions (and how each one breaks)

K-means is not a general clustering tool — it is a **variance minimizer with strong shape priors**:

- **Spherical / isotropic clusters.** The decision boundary between two centroids is a straight line (a Voronoi cell). Elongated or curved clusters (two moons, concentric rings) get sliced straight through. Use **DBSCAN** or spectral clustering instead.
- **Comparable cluster sizes.** A large dense blob next to a small sparse one: k-means steals points from the big cluster to balance inertia, splitting it.
- **Similar density / variance.** Equal radii are implicitly assumed; **Gaussian Mixture Models** with full covariances relax this.
- **Meaningful Euclidean distance.** Unscaled features let the largest-range feature dominate the distance entirely. **Standardize first** unless ranges are already comparable, and remember Euclidean distance is near-useless in very high dimensions (curse of dimensionality).

---

## K-means is a hard-assignment GMM

A clean way to seat k-means in the bigger picture: it is the **hard-assignment, equal-spherical-covariance limit** of a **Gaussian Mixture Model** fit by EM. GMM's E-step computes a *soft* responsibility (probability each point belongs to each cluster) instead of a winner-take-all assignment; its M-step updates means **and** covariances. Shrink every covariance toward an identity matrix and force responsibilities to 0/1 and you are back at k-means. This is why the moment your clusters are elliptical, overlapping, or differ in spread, GMM with full covariances is the natural upgrade — same EM skeleton, fewer assumptions. Mentioning this in an interview signals you see k-means as one point on a spectrum, not an isolated trick.

## Scaling and complexity

Per iteration, the assign step is \`O(n · k · d)\` (every point against every centroid in d dimensions) and the update step is \`O(n · d)\`. With \`i\` iterations the total is \`O(n · k · d · i)\` — linear in the number of points, which is why k-means scales to millions of rows where hierarchical clustering (O(n²) memory) cannot. For truly large data, **MiniBatchKMeans** updates centroids on random mini-batches: a large constant-factor speedup at a small cost in inertia. Memory is \`O(n · d + k · d)\` — you hold the data and the centroids, nothing quadratic.

---

## Pitfalls that cost production hours

- **Forgetting to scale.** Income in dollars (0–200,000) and age (0–100) → clusters are 99% about income. Always \`StandardScaler\` first unless you have a reason not to.
- **Reading inertia across different k as "quality."** Inertia is not comparable to anything but itself at the same k; it always drops with more clusters.
- **Treating cluster IDs as stable.** Labels are arbitrary integers and can permute between runs; never join on raw label without aligning.
- **Running once and trusting it.** A single random init can be badly wrong. Use k-means++ and \`n_init > 1\`.
- **Using it on categorical or mixed data.** The mean of one-hot vectors is meaningless as a center; use k-modes / k-prototypes or Gower distance.

---

## Interview questions to rehearse aloud

- "Why does k-means converge, and why might convergence still give a bad answer?" (Monotone inertia decrease → local minimum; init-dependent.)
- "How do you choose k, and what's wrong with the elbow method?" (Triangulate; elbow is often ambiguous.)
- "Your clusters look terrible on the two-moons dataset — why, and what would you use?" (Spherical assumption; DBSCAN/spectral.)
- "What does k-means++ buy you over random init?" (Spread seeds; better expected inertia; fewer restarts needed.)
- "When would you use k-medoids instead of k-means?" (Non-Euclidean distances, outlier robustness, need actual data points as centers.)
- "How does MiniBatchKMeans differ, and when is it worth it?" (Updates centroids on random mini-batches for a large speedup at a small inertia cost; worth it past hundreds of thousands of rows.)`,
    video: null,
    videoFallbackMarkdown: `## Deep dive without a clip

Sketch eight points on paper in two obvious blobs, then **deliberately seed both centroids inside one blob**. Run two iterations by hand: assign, recompute means, assign again. Watch the centroids fail to escape — that is the bad-local-minimum trap that k-means++ exists to prevent.

Then change the geometry: redraw the points as **two concentric rings**. Try to find *any* placement of two centroids that separates inner from outer ring. You cannot — the Voronoi boundary is always a straight line. Write one sentence explaining why this single fact forces you to DBSCAN or spectral clustering for non-convex shapes.`,
    tryGuidance: `Step through **Lloyd's algorithm** one iteration at a time and watch the crosshair centroids slide to the mean of their colored points. First set **k = 3** and step to convergence. Then set **k = 2** and **k = 4** and predict, before stepping, which natural blob will get split or merged. Notice that the same k can converge to different partitions depending on where the seeds landed — that is the local-minimum story made visible.`,
    interviewGraph: {
            initialStageId: "u1_click_conclusion",
            artifactDimensions: [
              {
                label: "K Selection",
                recoveryStageId: "u1_recovery_k_selection",
              },
              {
                label: "Initialization & Scaling",
                recoveryStageId: "u1_recovery_init",
              },
              {
                label: "Cluster Evaluation",
                recoveryStageId: "u1_recovery_eval",
                passLabel: "K-Means Mastery",
              },
            ],
            stages: {
              u1_click_conclusion: {
                id: "u1_click_conclusion",
                type: "click_target",
                badge: "Stage 1",
                title: "Stage 1 · Spotting invalid conclusions",
                prompt: "The code below chooses k by silhouette score on training data and then draws a hard business conclusion from it. Click the line that treats a statistical heuristic as objective ground truth without domain validation.",
                code_snippet: `from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score

best_k, best_score = 2, -1
for k in range(2, 9):
    km = KMeans(n_clusters=k, random_state=42).fit(X_train)
    s = silhouette_score(X_train, km.labels_)
    if s > best_score:
        best_k, best_score = k, s

final_model = KMeans(n_clusters=best_k, random_state=42).fit(X_train)
print(f"We found k={best_k} distinct user segments in our data.")  # ds-target:hard_conclusion
report_to_stakeholders(k=best_k)`,
                validationCopy: {
                  hard_conclusion: "Correct. The silhouette score is a geometric heuristic — it does not confirm that these are meaningful business segments. Reporting k=5 as an objective fact to stakeholders skips domain validation and interpretability checks.",
                },
                branches: {
                  hard_conclusion: "u1_choice_imbalanced",
                },
              },
              u1_choice_imbalanced: {
                id: "u1_choice_imbalanced",
                type: "scenario_choice",
                badge: "Stage 2",
                title: "Stage 2 · Diagnosing degenerate clusters",
                prompt: "K-means assigns user sessions to 4 clusters. After fitting, one cluster contains 95% of all data points. What is most likely wrong and what should you try?",
                code_snippet: `km = KMeans(n_clusters=4, init="random", n_init=1, random_state=0)
km.fit(X)
sizes = pd.Series(km.labels_).value_counts()
# cluster 0: 95 012  cluster 1: 1 203
# cluster 2:    890  cluster 3:    451`,
                choices: [
                  {
                    id: "a",
                    label: "k is too small, or data has no natural structure at k=4",
                    description: "Try k-means++ initialisation, scale the features, sweep over different k values, or consider DBSCAN if clusters are not spherical.",
                  },
                  {
                    id: "b",
                    label: "The model converged perfectly — 95% of users genuinely belong to one group",
                    description: "Possible in theory, but a 95/5 split almost always signals a problem with k, initialisation, or unscaled features, not a genuine business insight.",
                  },
                  {
                    id: "c",
                    label: "Increase n_init to 10 and the problem will disappear",
                    description: "More random restarts reduce bad initialisations but won't fix the wrong choice of k or unscaled features that cause one centroid to dominate.",
                  },
                  {
                    id: "d",
                    label: "Normalise labels with LabelEncoder before clustering",
                    description: "K-means operates on numeric feature vectors, not labels. Label encoding the target column is irrelevant here.",
                  },
                ],
                branches: {
                  a: "u1_choice_scaling",
                  b: "u1_recovery_k_selection",
                  c: "u1_recovery_k_selection",
                  d: "u1_recovery_k_selection",
                },
                rationale: "A 95% cluster is a classic sign that k is too small, centroids started poorly, or features are unscaled so one axis dominates. The fix is k-means++ init, feature scaling, elbow/silhouette sweep over k, or switching to DBSCAN for non-spherical data.",
              },
              u1_recovery_k_selection: {
                id: "u1_recovery_k_selection",
                type: "scenario_choice",
                badge: "Recovery 1",
                title: "Recovery · Choosing k correctly",
                prompt: "Which combination of techniques is most reliable for choosing k in a production K-means pipeline?",
                code_snippet: `# Which approach is most robust?
# A: Pick k where inertia drops most steeply (elbow)
# B: Sweep k, compute silhouette score, pick max
# C: Use domain knowledge about expected segments,
#    then validate with silhouette + business review
# D: Always use k=10 for large datasets`,
                choices: [
                  {
                    id: "a",
                    label: "Elbow method only",
                    description: "The elbow often has no clear bend and is subjective — using it alone is unreliable.",
                  },
                  {
                    id: "b",
                    label: "Silhouette score sweep only",
                    description: "Better than elbow, but still a purely geometric heuristic that ignores business meaning.",
                  },
                  {
                    id: "c",
                    label: "Domain knowledge + silhouette + business review",
                    description: "Correct. Start with a plausible range from domain context, use silhouette to narrow it, then validate cluster interpretability with stakeholders.",
                  },
                  {
                    id: "d",
                    label: "Always k=10",
                    description: "Fixed k with no data-driven or domain justification will produce arbitrary, uninterpretable clusters.",
                  },
                ],
                branches: {
                  a: "u1_choice_scaling",
                  b: "u1_choice_scaling",
                  c: "u1_choice_scaling",
                  d: "u1_choice_scaling",
                },
                rationale: "No single metric chooses k reliably. Combining domain knowledge (plausible number of segments), a geometric measure (silhouette), and business interpretability is the robust approach.",
              },
              u1_choice_scaling: {
                id: "u1_choice_scaling",
                type: "scenario_choice",
                badge: "Stage 3",
                title: "Stage 3 · Feature scaling and Euclidean distance",
                prompt: "You run K-means on latitude/longitude coordinates alongside a revenue feature (range: 0–5,000,000). A colleague skips StandardScaler. Does it matter?",
                code_snippet: `# lat/lon range: -90 to 90 / -180 to 180
# revenue range: 0 to 5_000_000

X = df[["latitude", "longitude", "revenue"]]
km = KMeans(n_clusters=5, random_state=42)
km.fit(X)   # no scaling applied`,
                choices: [
                  {
                    id: "a",
                    label: "Yes — revenue's large range will dominate Euclidean distance, making lat/lon irrelevant",
                    description: "Correct. Euclidean distance is scale-sensitive. An unscaled revenue column with range 5M will dwarf coordinates with range ~360, effectively clustering purely on revenue.",
                  },
                  {
                    id: "b",
                    label: "No — K-means automatically normalises features internally",
                    description: "K-means does not normalise features. It uses raw Euclidean distances, so high-magnitude features dominate.",
                  },
                  {
                    id: "c",
                    label: "No — lat/lon are already on a meaningful scale",
                    description: "The issue is the relative scale difference between features. Lat/lon vs millions-range revenue will always produce biased distances.",
                  },
                  {
                    id: "d",
                    label: "It depends on the random seed",
                    description: "The random seed affects initialisation, not how scale distorts the distance metric. Scaling is always needed when features have very different ranges.",
                  },
                ],
                branches: {
                  a: "u1_choice_elbow",
                  b: "u1_recovery_init",
                  c: "u1_recovery_init",
                  d: "u1_recovery_init",
                },
                rationale: "K-means minimises within-cluster sum of squared Euclidean distances. Features with much larger numeric ranges contribute disproportionately. Always StandardScale (or MinMaxScale) before K-means when features are on different scales.",
              },
              u1_recovery_init: {
                id: "u1_recovery_init",
                type: "scenario_choice",
                badge: "Recovery 2",
                title: "Recovery · Initialisation & distance sensitivity",
                prompt: "Which statement best describes why k-means++ initialisation outperforms random initialisation?",
                code_snippet: `# random init
KMeans(n_clusters=5, init="random", n_init=1)

# k-means++ init
KMeans(n_clusters=5, init="k-means++", n_init=10)`,
                choices: [
                  {
                    id: "a",
                    label: "k-means++ spreads initial centroids far apart probabilistically, avoiding degenerate starts",
                    description: "Correct. k-means++ samples the first centroid randomly then picks each subsequent centroid with probability proportional to its squared distance from the nearest existing centroid — ensuring spread-out initialisation.",
                  },
                  {
                    id: "b",
                    label: "k-means++ uses gradient descent instead of EM-style updates",
                    description: "Both use the same assignment/update EM loop. The difference is only in centroid initialisation.",
                  },
                  {
                    id: "c",
                    label: "k-means++ scales features before running",
                    description: "Initialisation method has nothing to do with feature scaling — that must be done separately.",
                  },
                  {
                    id: "d",
                    label: "k-means++ adds regularisation to prevent overfitting",
                    description: "K-means has no regularisation parameter. k-means++ is purely about centroid placement.",
                  },
                ],
                branches: {
                  a: "u1_choice_elbow",
                  b: "u1_choice_elbow",
                  c: "u1_choice_elbow",
                  d: "u1_choice_elbow",
                },
                rationale: "k-means++ uses a distance-weighted probability to place initial centroids far apart, dramatically reducing the chance of converging to a poor local minimum.",
              },
              u1_choice_elbow: {
                id: "u1_choice_elbow",
                type: "scenario_choice",
                badge: "Stage 4",
                title: "Stage 4 · When the elbow method fails",
                prompt: "You plot inertia vs k for k=2 to 15. The curve smoothly decreases with no obvious bend. What is your next move?",
                code_snippet: `inertias = []
for k in range(2, 16):
    km = KMeans(n_clusters=k, init="k-means++",
                n_init=10, random_state=42)
    km.fit(X_scaled)
    inertias.append(km.inertia_)
# plot shows no clear elbow — smooth monotone decrease`,
                choices: [
                  {
                    id: "a",
                    label: "Compute silhouette scores, try the gap statistic, and use domain knowledge to narrow the range",
                    description: "Correct. When the elbow is ambiguous, silhouette score (higher is better), gap statistic (compares inertia to random baseline), and subject-matter knowledge about expected cluster count together provide a more principled choice.",
                  },
                  {
                    id: "b",
                    label: "The data has no clusters — stop and use regression",
                    description: "A smooth inertia curve doesn't confirm absence of clusters; it may mean clusters overlap or the elbow is subtle. Try other metrics before abandoning clustering.",
                  },
                  {
                    id: "c",
                    label: "Pick k=2 because the first large inertia drop is there",
                    description: "Defaulting to k=2 ignores the actual structure in the data and the business question.",
                  },
                  {
                    id: "d",
                    label: "Increase n_init until an elbow appears",
                    description: "n_init controls the number of random restarts per k, not the shape of the inertia curve. A smooth curve is a property of the data distribution, not of how many restarts you use.",
                  },
                ],
                branches: {
                  a: "u1_terminal",
                  b: "u1_recovery_eval",
                  c: "u1_recovery_eval",
                  d: "u1_recovery_eval",
                },
                rationale: "The elbow method is heuristic and often ambiguous. Silhouette score, gap statistic, and domain knowledge are complementary tools that together give a more reliable choice of k.",
              },
              u1_recovery_eval: {
                id: "u1_recovery_eval",
                type: "scenario_choice",
                badge: "Recovery 3",
                title: "Recovery · Evaluating clustering quality",
                prompt: "Which metric for evaluating K-means clusters does NOT require ground truth labels?",
                code_snippet: `from sklearn.metrics import (
    silhouette_score,      # internal
    adjusted_rand_score,   # external
    fowlkes_mallows_score, # external
    calinski_harabasz_score # internal
)`,
                choices: [
                  {
                    id: "a",
                    label: "Adjusted Rand Score",
                    description: "ARI compares predicted clusters to true labels — it requires ground truth.",
                  },
                  {
                    id: "b",
                    label: "Silhouette score",
                    description: "Correct. Silhouette is an internal metric — it measures cohesion (within-cluster tightness) and separation (between-cluster distance) using only the data and cluster assignments.",
                  },
                  {
                    id: "c",
                    label: "Fowlkes-Mallows score",
                    description: "Fowlkes-Mallows is an external metric requiring true labels.",
                  },
                  {
                    id: "d",
                    label: "Accuracy",
                    description: "Accuracy requires ground truth class labels — not applicable in unsupervised settings.",
                  },
                ],
                branches: {
                  a: "u1_terminal",
                  b: "u1_terminal",
                  c: "u1_terminal",
                  d: "u1_terminal",
                },
                rationale: "Internal metrics (silhouette, Calinski-Harabasz, Davies-Bouldin) evaluate cluster quality using only the data itself. External metrics (ARI, NMI, Fowlkes-Mallows) require ground truth labels.",
              },
              u1_terminal: {
                id: "u1_terminal",
                type: "scenario_choice",
                badge: "Final",
                title: "Revision complete · K-Means Mastery",
                terminal: true,
                prompt: "K-means is run 5 times on the same dataset with different random seeds. The cluster assignments differ across runs. Why does this happen, and how do you handle it in a production pipeline?",
                code_snippet: `for seed in [0, 7, 13, 42, 99]:
    km = KMeans(n_clusters=5, init="random", n_init=1,
                random_state=seed)
    km.fit(X_scaled)
    print(seed, km.inertia_, km.labels_[:5])
# Each run produces different label assignments and inertia`,
                choices: [
                  {
                    id: "a",
                    label: "K-means converges to a local minimum that depends on initial centroids; fix by using k-means++ with n_init≥10 and persisting the best model by lowest inertia",
                    description: "Correct. K-means is non-convex — different starts reach different local minima. k-means++ + multiple restarts (n_init) dramatically reduces this; you then keep the run with lowest inertia and serialise that model.",
                  },
                  {
                    id: "b",
                    label: "It's a bug in sklearn; pin the library version to get reproducibility",
                    description: "This is expected K-means behaviour, not a bug. Library version doesn't control convergence to local minima.",
                  },
                  {
                    id: "c",
                    label: "Always set random_state=42 and use n_init=1 — one run is enough",
                    description: "A single run with fixed seed is reproducible but not robust — you may consistently land on a bad local minimum.",
                  },
                ],
                branches: {
                  a: "u1_terminal",
                  b: "u1_terminal",
                  c: "u1_terminal",
                },
                rationale: "K-means is sensitive to initialisation because the objective is non-convex with many local minima. k-means++ initialisation combined with n_init≥10 (sklearn's default) samples multiple starts and returns the best result by inertia. In production, persist the fitted model object so cluster assignments remain stable.",
              },
            },
          },
    knowledgeCheck: [
      {
        question: "Why is k-means guaranteed to converge but not guaranteed to find the best clustering?",
        options: [
          "Each assign/update step never increases inertia, so it reaches a local minimum that depends on initialization",
          "It always finds the global minimum of inertia in polynomial time",
          "Convergence is random; it may never stop without a max-iteration cap",
        ],
        correctIndex: 0,
        explanation: "Lloyd's algorithm is coordinate descent on a non-convex objective: inertia decreases monotonically to a local optimum whose quality depends on the starting centroids.",
      },
      {
        question: "What does the k-means update step actually compute for each cluster, and why that quantity?",
        options: [
          "The arithmetic mean of assigned points, because the mean minimizes the sum of squared Euclidean distances — exactly the objective",
          "The median of assigned points, because it is robust to outliers",
          "A randomly chosen member point, to keep centers on real data",
        ],
        correctIndex: 0,
        explanation: "The mean minimizes summed squared distance (the inertia objective). Using the median gives k-medians; restricting to data points gives k-medoids.",
      },
      {
        question: "A point's silhouette value is strongly negative. What does that indicate?",
        options: [
          "It is a perfect cluster center",
          "It is closer on average to a neighboring cluster than to its own — likely misassigned",
          "The dataset has exactly the right number of clusters",
        ],
        correctIndex: 1,
        explanation: "Silhouette s=(b-a)/max(a,b); negative means a (own-cluster distance) exceeds b (nearest-other-cluster distance), so the point sits closer to a different cluster.",
      },
      {
        question: "On the two-moons dataset, k-means produces two straight-edged half-and-half clusters instead of the two crescents. Why?",
        options: [
          "K-means assumes convex, roughly spherical clusters; its Voronoi boundaries are straight lines that cannot wrap a crescent",
          "The data was not shuffled before training",
          "k was set too high, so clusters merged",
        ],
        correctIndex: 0,
        explanation: "Each point goes to the nearest centroid, so boundaries are straight Voronoi edges. Non-convex shapes need density-based (DBSCAN) or spectral methods.",
      },
      {
        question: "What is the primary benefit of k-means++ over uniform random initialization?",
        options: [
          "It guarantees the global optimum",
          "It removes the need to standardize features",
          "It spreads initial centers by sampling proportional to squared distance, lowering expected inertia and reducing bad local minima",
        ],
        correctIndex: 2,
        explanation: "k-means++ chooses seeds far apart probabilistically, giving an O(log k) expected-cost guarantee and far fewer pathological starts; it does not scale features or guarantee optimality.",
      },
      {
        question: "You cluster customers using raw income (0–200,000) and age (0–100) without scaling. What happens?",
        options: [
          "Income dominates the Euclidean distance, so clusters are essentially income bins and age is ignored",
          "Age dominates because it has fewer digits",
          "Nothing — k-means is scale-invariant",
        ],
        correctIndex: 0,
        explanation: "Euclidean distance is driven by the largest-magnitude feature. Standardize (e.g., StandardScaler) so each feature contributes comparably.",
      },
      {
        question: "Why is comparing inertia across different values of k a poor way to judge clustering quality?",
        options: [
          "Inertia increases with k, so it always favors k=1",
          "Inertia decreases monotonically as k increases and reaches zero at k=n, so lower is not better",
          "Inertia is undefined for k greater than two",
        ],
        correctIndex: 1,
        explanation: "More centers always tighten clusters, so inertia is monotone non-increasing in k. The elbow looks for diminishing returns, not the minimum.",
      },
      {
        question: "When would k-medoids (PAM) be a better choice than k-means?",
        options: [
          "When you have a non-Euclidean distance matrix, want outlier robustness, or need cluster centers to be real data points",
          "When the dataset is extremely large and you need the fastest possible algorithm",
          "When all clusters are perfectly spherical and equally sized",
        ],
        correctIndex: 0,
        explanation: "Medoids work with arbitrary dissimilarities and pick actual points as centers, making them robust to outliers — at higher computational cost than k-means.",
      },
    ],
  },

  "ml-u2": {
    durationLabel: "18–20 min",
    outcomes: [
      "Explain **density-based clustering**: how DBSCAN labels points **core / border / noise** using only `eps` and `minPts`, and why it finds **arbitrary shapes** k-means cannot.",
      "Tune `eps` with a **k-distance plot** and reason about the `eps`/`minPts` tradeoff, including DBSCAN's failure on **varying-density** clusters (and HDBSCAN's fix).",
      "Build and **cut a dendrogram** from agglomerative clustering, and choose a **linkage** (single / complete / average / Ward) knowing the chaining and shape biases of each.",
      "Pick the right tool per problem: **k-means vs DBSCAN vs hierarchical** by cluster shape, noise, scale, and whether you must specify the cluster count up front.",
    ],
    learnMarkdown: `## Why density-based clustering exists

K-means asks "which center is nearest?" — a question that bakes in spherical, convex clusters. **DBSCAN** (Density-Based Spatial Clustering of Applications with Noise) asks a fundamentally different question: "where are the dense regions, and what's just sparse background?" That reframing buys two things k-means cannot give you: **arbitrarily shaped clusters** (crescents, rings, spirals) and an explicit **noise / outlier** label. And you never tell it how many clusters to find — it discovers that from the data.

Picture the motivating example interviewers love: GPS pings from delivery drivers. The dense knots are real stops (a depot, a customer cluster, a lunch spot); the scattered pings in between are just driving. K-means *forces* every ping into some cluster and invents centers in the middle of empty road. DBSCAN labels the knots as clusters and the in-between pings as **noise (−1)** — which is exactly what you wanted. Anomaly detection, spatial hotspot analysis, and "find the natural groups but ignore the junk" problems all lean on density-based clustering for precisely this reason.

---

## DBSCAN: two parameters, three kinds of point

DBSCAN needs exactly two hyperparameters:

- **\`eps\` (ε)** — the neighborhood radius. Two points are "neighbors" if within \`eps\` of each other.
- **\`minPts\` (or \`min_samples\`)** — how many neighbors (including itself) a point needs to be considered dense.

Every point is then one of three types:

- **Core point** — has at least \`minPts\` neighbors within \`eps\`. It anchors a cluster.
- **Border point** — fewer than \`minPts\` neighbors, but lies within \`eps\` of a core point. It joins that cluster but cannot grow it.
- **Noise point** — neither core nor border. Labeled \`-1\`; it belongs to **no** cluster. This is DBSCAN's killer feature: outliers fall out for free.

A cluster is grown by **density connectivity**: start at a core point, absorb everything density-reachable (chains of core points within \`eps\`, plus their border points). Because clusters propagate along chains of dense points, they can bend into any shape — that is how DBSCAN solves two-moons that defeats k-means.

\`\`\`
for each unvisited point p:
    neighbors = region_query(p, eps)
    if |neighbors| < minPts: label p as NOISE (provisional)
    else: start a new cluster, expand it through all density-reachable points
\`\`\`

---

## Tuning eps and minPts

These two interact, and getting them wrong is the usual reason DBSCAN "doesn't work":

- **\`minPts\` too low** (e.g. 1–2): almost everything is a core point, noise vanishes, and separate clusters bleed together. A common heuristic is \`minPts ≥ dimensions + 1\`, often \`2 × dimensions\`.
- **\`eps\` too small**: most points become noise and clusters fragment. **\`eps\` too large**: distinct clusters merge into one blob.
- **Choosing \`eps\` — the k-distance plot.** Compute each point's distance to its k-th nearest neighbor (k = minPts), sort ascending, and plot. The curve has a "knee" where distances jump sharply; that knee value is a good \`eps\`. It is the DBSCAN analog of the elbow plot.

**DBSCAN's structural weakness: a single global \`eps\`.** If one cluster is dense and another is sparse, no single \`eps\` fits both — tighten it and the sparse cluster shatters into noise; loosen it and the dense clusters merge. **HDBSCAN** fixes this by building clusters across *all* density scales and extracting the most stable ones, so you only set \`min_cluster_size\`. Reach for HDBSCAN when densities vary. **OPTICS** is a close cousin: rather than committing to one \`eps\`, it produces a *reachability plot* — an ordering of points whose valleys correspond to clusters at different densities — letting you read clusters off the plot post hoc.

### Walk one expansion by hand

Set \`minPts = 4\`. Pick an unvisited point p, draw a circle of radius \`eps\`, count the points inside (including p). If you count fewer than 4, mark p **provisional noise** and move on. If you count 4 or more, p is a **core** point: start a new cluster, then push all its eps-neighbors onto a queue. Pop each neighbor q; if q was provisional noise, promote it to a **border** point of this cluster; if q is itself core (≥ 4 neighbors), push *its* neighbors too. The cluster keeps growing as long as you can hop core-to-core within \`eps\`. The instant you hit a neighbor with too few of its own neighbors, that point joins as a border point but the chain stops there — it cannot extend the cluster. That stop condition is exactly why DBSCAN can trace a thin crescent yet refuse to leap a sparse gap to the next blob.

---

## Hierarchical (agglomerative) clustering

Agglomerative clustering builds a tree (**dendrogram**) bottom-up: start with every point as its own cluster, then repeatedly **merge the two closest clusters** until one remains. The height at which two clusters join encodes how dissimilar they were. You get a cluster **assignment** by **cutting** the dendrogram horizontally — the number of branches the cut crosses is your number of clusters. The huge practical win: you don't commit to k up front; you inspect the tree and cut where the merge heights jump.

**Linkage** defines "distance between two clusters" and changes everything:

| Linkage | Cluster distance = | Bias / behavior |
|---------|--------------------|-----------------|
| **Single** | nearest pair of points | Finds non-elliptical shapes; suffers **chaining** (long straggly clusters) |
| **Complete** | farthest pair of points | Compact, equal-diameter clusters; sensitive to outliers |
| **Average** | mean of all pairwise distances | Middle ground; less chaining than single |
| **Ward** | increase in within-cluster variance | Spherical, similar-size clusters; the usual default with Euclidean |

Single linkage's chaining can connect two genuinely separate clusters through one bridge of points — the classic gotcha. Ward behaves most like k-means (variance-minimizing), so it inherits the spherical bias too.

A subtle but important constraint: **Ward linkage requires Euclidean distance** to be well-defined (it reasons about variance). Single, complete, and average linkage accept any precomputed distance matrix — cosine, Jaccard, edit distance, whatever your domain needs — which is one reason hierarchical clustering shows up when you have a meaningful custom dissimilarity but no notion of a "mean". Note also that agglomerative clustering is **greedy**: once two clusters merge, the choice is never revisited, so an early bad merge propagates all the way up the tree. Divisive (top-down) clustering avoids that but is far costlier and rarely used in practice.

---

## DBSCAN vs hierarchical vs k-means

| Property | k-means | DBSCAN | Hierarchical |
|----------|---------|--------|--------------|
| Specify cluster count? | Yes (k) | No | No — cut the tree later |
| Cluster shape | Spherical/convex | Arbitrary | Depends on linkage |
| Handles noise/outliers? | No (forces all in) | Yes (label −1) | No |
| Varying density? | No | Poorly (HDBSCAN fixes) | Partially |
| Scalability | Excellent O(n·k·i) | Good w/ index O(n log n) | Poor O(n²)–O(n³) memory |
| Determinism | Init-dependent | Deterministic (modulo border ties) | Deterministic |

---

## Pitfalls that cost production hours

- **Not scaling features before DBSCAN.** \`eps\` is a single radius in feature space; if one axis is in dollars and another in years, the radius is meaningless. Standardize first.
- **Hunting for the "right" eps with no k-distance plot.** Guessing wastes hours; the knee plot gives you a principled starting value.
- **Using DBSCAN on varying-density data and blaming the algorithm.** A global \`eps\` cannot serve both — switch to HDBSCAN.
- **Cutting a dendrogram at a fixed k without looking at merge heights.** The whole point of hierarchy is to cut where the heights jump, not at an arbitrary count.
- **Single linkage on noisy data.** Chaining silently merges clusters through outlier bridges; prefer Ward or complete unless you specifically want elongated shapes.
- **Forgetting border points are order-dependent.** A border point reachable from two clusters is assigned to whichever core reaches it first — a minor but real non-determinism.

---

## Interview questions to rehearse aloud

- "Walk me through core, border, and noise points." (minPts within eps → core; near a core → border; neither → noise/−1.)
- "How do you pick eps?" (k-distance plot, find the knee; minPts ≈ 2×dims.)
- "Why does DBSCAN beat k-means on two-moons but lose on varying density?" (Density connectivity vs straight Voronoi edges; single global eps can't fit two densities.)
- "Explain chaining in single linkage." (Nearest-pair merges connect clusters through a bridge of points.)
- "When would you use hierarchical clustering over k-means?" (You don't know k, want a dendrogram to inspect structure, or have a meaningful distance matrix.)
- "Why does hierarchical clustering struggle at scale?" (O(n²) distance matrix in memory and O(n²)–O(n³) time; impractical past tens of thousands of points, where k-means or DBSCAN with a spatial index win.)`,
    video: null,
    videoFallbackMarkdown: `## Deep dive without a clip

Draw two interleaving crescents (the "two moons" shape). Pick a small \`eps\` and mark, for three or four points, how many neighbors fall inside the radius — circle the **core** points (≥ minPts neighbors), then the **border** points (near a core but sparse), then any isolated **noise**. Trace one cluster by hopping core-to-core within \`eps\`; watch it follow the curve of the crescent. That hop-along-dense-points motion is exactly why DBSCAN handles shapes k-means cannot.

Now shrink \`eps\` and re-mark: notice cores demote to noise and the crescent fragments. Enlarge it and the two crescents merge. Write one sentence on why a single global \`eps\` is DBSCAN's Achilles heel — the motivation for HDBSCAN.`,
    tryGuidance: `Drag **eps** and **minPts** and watch each point recolor as **core**, **border**, or **noise**, with clusters spreading along chains of dense points. Start with the default and confirm the two non-spherical shapes are recovered cleanly — something k-means cannot do. Then shrink \`eps\` until clusters fragment into noise, and enlarge it until they merge into one blob. Raise \`minPts\` and watch the cluster edges thin out as border points demote to noise. Narrate the eps/minPts tradeoff before reading the caption.`,
    interviewGraph: {
            initialStageId: "u2_click_epsilon",
            artifactDimensions: [
              {
                label: "DBSCAN Parameters",
                recoveryStageId: "u2_recovery_params",
              },
              {
                label: "Noise Handling",
                recoveryStageId: "u2_recovery_noise",
              },
              {
                label: "Algorithm Selection",
                recoveryStageId: "u2_recovery_scale",
                passLabel: "Density Clustering Mastery",
              },
            ],
            stages: {
              u2_click_epsilon: {
                id: "u2_click_epsilon",
                type: "click_target",
                badge: "Stage 1",
                title: "Stage 1 · Spotting a meaningless epsilon",
                prompt: "The code below runs DBSCAN on raw, unscaled data with a hardcoded epsilon. Click the line that makes the epsilon value geometrically meaningless.",
                code_snippet: `import pandas as pd
from sklearn.cluster import DBSCAN

df = pd.read_csv("customers.csv")
# Features: age (18-80), annual_spend (500-250000), tenure_days (1-3650)

X = df[["age", "annual_spend", "tenure_days"]]  # ds-target:unscaled_data
db = DBSCAN(eps=0.5, min_samples=5)
db.fit(X)

labels = db.labels_
n_clusters = len(set(labels)) - (1 if -1 in labels else 0)
print(f"Found {n_clusters} clusters")`,
                validationCopy: {
                  unscaled_data: "Correct. With unscaled features spanning ranges of 62, 249,500, and 3,649 respectively, an epsilon of 0.5 is geometrically meaningless — all points appear as noise because no two points are within 0.5 units in raw annual_spend space. Always scale before DBSCAN.",
                },
                branches: {
                  unscaled_data: "u2_choice_noise",
                },
              },
              u2_choice_noise: {
                id: "u2_choice_noise",
                type: "scenario_choice",
                badge: "Stage 2",
                title: "Stage 2 · Interpreting DBSCAN noise points",
                prompt: "After tuning DBSCAN on a fraud dataset, 30% of transactions are labelled -1 (noise). Is this good or bad?",
                code_snippet: `db = DBSCAN(eps=0.08, min_samples=3)
db.fit(X_scaled)

noise_pct = (db.labels_ == -1).mean()
print(f"Noise fraction: {noise_pct:.1%}")  # 30.2%`,
                choices: [
                  {
                    id: "a",
                    label: "It depends — in fraud detection, noise points may be exactly the anomalies you want to flag",
                    description: "Correct. DBSCAN's noise label (-1) marks points that don't belong to any dense cluster. In fraud, anomalous transactions are genuinely sparse — the 30% noise fraction may be the signal, not a problem.",
                  },
                  {
                    id: "b",
                    label: "Always bad — epsilon is too small and needs to increase",
                    description: "Increasing epsilon reduces noise by enlarging neighbourhoods, but if the noise points are real anomalies (e.g., fraud), this would merge them into clusters and destroy the signal.",
                  },
                  {
                    id: "c",
                    label: "Always bad — min_samples is too large and needs to decrease",
                    description: "Lowering min_samples makes cluster formation easier, but again blindly reducing noise fraction may hide real outliers depending on the domain.",
                  },
                  {
                    id: "d",
                    label: "Good — 30% noise proves DBSCAN found perfect density separation",
                    description: "Noise fraction alone does not prove anything. The meaning of noise points is domain-dependent and must be interpreted in context.",
                  },
                ],
                branches: {
                  a: "u2_choice_linkage",
                  b: "u2_recovery_noise",
                  c: "u2_recovery_noise",
                  d: "u2_recovery_noise",
                },
                rationale: "DBSCAN noise points are a feature, not always a bug. In anomaly detection or fraud, the -1 labels are the interesting output. In customer segmentation, a 30% noise fraction likely means epsilon needs tuning. Domain context determines which.",
              },
              u2_recovery_noise: {
                id: "u2_recovery_noise",
                type: "scenario_choice",
                badge: "Recovery 1",
                title: "Recovery · DBSCAN noise in context",
                prompt: "You run DBSCAN for customer segmentation and 40% of customers are labelled as noise. What is the correct diagnostic and fix?",
                code_snippet: `# Customer segmentation — goal: assign every customer
# to a meaningful segment
db = DBSCAN(eps=0.1, min_samples=10)
db.fit(X_scaled)
# 40% labelled -1`,
                choices: [
                  {
                    id: "a",
                    label: "Switch to K-means immediately — DBSCAN can't do segmentation",
                    description: "DBSCAN can do segmentation, but 40% noise in a segmentation task signals parameter mistuning — try increasing epsilon or reducing min_samples before abandoning the algorithm.",
                  },
                  {
                    id: "b",
                    label: "Tune epsilon upward and/or reduce min_samples; use k-distance plot to find the right epsilon",
                    description: "Correct. A k-distance plot sorts points by their distance to the k-th nearest neighbour. The 'knee' in this plot is a good epsilon estimate. Adjusting min_samples controls sensitivity to dense core regions.",
                  },
                  {
                    id: "c",
                    label: "Assign all noise points to the nearest cluster post-hoc",
                    description: "Possible as a workaround, but it converts DBSCAN into something closer to k-means and removes the geometric meaning of noise. Better to tune parameters first.",
                  },
                  {
                    id: "d",
                    label: "Increase min_samples to reduce noise",
                    description: "Increasing min_samples makes it harder to form core points — this would increase noise fraction, not decrease it.",
                  },
                ],
                branches: {
                  a: "u2_choice_linkage",
                  b: "u2_choice_linkage",
                  c: "u2_choice_linkage",
                  d: "u2_choice_linkage",
                },
                rationale: "For segmentation, high noise fraction usually means epsilon is too small. The k-distance plot provides a principled way to select epsilon: sort all points by their distance to the k-th nearest neighbour and pick the 'knee' as epsilon.",
              },
              u2_choice_linkage: {
                id: "u2_choice_linkage",
                type: "scenario_choice",
                badge: "Stage 3",
                title: "Stage 3 · Linkage and cluster shape",
                prompt: "Hierarchical clustering with Ward linkage vs single linkage. Which handles elongated, non-spherical clusters better?",
                code_snippet: `from sklearn.cluster import AgglomerativeClustering

ward   = AgglomerativeClustering(n_clusters=4, linkage="ward")
single = AgglomerativeClustering(n_clusters=4, linkage="single")

ward.fit(X)
single.fit(X)`,
                choices: [
                  {
                    id: "a",
                    label: "Single linkage — it can chain elongated clusters by connecting nearest boundary points",
                    description: "Correct. Single linkage merges clusters based on the minimum distance between any two points across clusters, allowing it to follow elongated or irregularly shaped chains. Ward linkage minimises within-cluster variance, producing compact, spherical clusters.",
                  },
                  {
                    id: "b",
                    label: "Ward linkage — minimising variance always produces better-shaped clusters",
                    description: "Ward produces compact spherical clusters, which is ideal when clusters are roughly globular, but it splits elongated structures into multiple spherical pieces.",
                  },
                  {
                    id: "c",
                    label: "Complete linkage — maximum distance between clusters handles elongation",
                    description: "Complete linkage uses the maximum distance between points in two clusters, which tends to break elongated structures into roughly equal-diameter groups — not ideal for elongated chains.",
                  },
                  {
                    id: "d",
                    label: "Average linkage — it averages all pairwise distances and handles all shapes equally",
                    description: "Average linkage is a compromise, but it still favours somewhat compact clusters and doesn't match single linkage's ability to follow elongated chains.",
                  },
                ],
                branches: {
                  a: "u2_choice_scale",
                  b: "u2_recovery_params",
                  c: "u2_recovery_params",
                  d: "u2_recovery_params",
                },
                rationale: "Single linkage can detect elongated or chain-like clusters through nearest-neighbour chaining. Its weakness is the 'chaining effect' — noise can cause unintended merges. Ward linkage is best for compact spherical clusters and is often the default choice in practice.",
              },
              u2_recovery_params: {
                id: "u2_recovery_params",
                type: "scenario_choice",
                badge: "Recovery 2",
                title: "Recovery · DBSCAN parameters deep dive",
                prompt: "How do epsilon and min_samples jointly control what DBSCAN considers a 'core point'?",
                code_snippet: `# Core point definition:
# A point p is a core point if at least min_samples
# other points lie within distance epsilon of p.
#
# epsilon=0.3, min_samples=5  →  ?
# epsilon=1.0, min_samples=5  →  ?
# epsilon=0.3, min_samples=2  →  ?`,
                choices: [
                  {
                    id: "a",
                    label: "Larger epsilon and smaller min_samples → easier to form core points → fewer noise points, larger clusters",
                    description: "Correct. Epsilon defines the neighbourhood radius; min_samples sets the density threshold. Relaxing either (bigger eps or smaller min_samples) makes it easier to qualify as a core point, merging more points into clusters.",
                  },
                  {
                    id: "b",
                    label: "Larger epsilon always produces more clusters",
                    description: "Larger epsilon merges points that were previously noise or separate clusters — it typically reduces the number of clusters, not increases them.",
                  },
                  {
                    id: "c",
                    label: "min_samples only affects noise points, not cluster shapes",
                    description: "min_samples affects which points are classified as core, border, or noise — directly changing cluster membership and shape.",
                  },
                  {
                    id: "d",
                    label: "Epsilon and min_samples are independent — you can tune them one at a time",
                    description: "They interact: their ratio determines effective density sensitivity. Changing one changes the meaning of the other in relative terms.",
                  },
                ],
                branches: {
                  a: "u2_choice_scale",
                  b: "u2_choice_scale",
                  c: "u2_choice_scale",
                  d: "u2_choice_scale",
                },
                rationale: "A core point requires at least min_samples points within radius epsilon. Together they define density: larger eps = bigger neighbourhoods, smaller min_samples = lower density threshold. Use the k-distance plot to calibrate epsilon, then tune min_samples relative to data density.",
              },
              u2_choice_scale: {
                id: "u2_choice_scale",
                type: "scenario_choice",
                badge: "Stage 4",
                title: "Stage 4 · Scalability",
                prompt: "You need to cluster 5 million records in a production pipeline that must run in under 10 minutes. Which algorithm is most appropriate?",
                code_snippet: `# Dataset: 5_000_000 rows, 20 features, mixed scales
# Latency budget: < 10 minutes
# Goal: assign each record to a named segment

# Option A: KMeans(n_clusters=8, init="k-means++", n_init=10)
# Option B: DBSCAN(eps=0.2, min_samples=5)
# Option C: AgglomerativeClustering(n_clusters=8, linkage="ward")
# Option D: MiniBatchKMeans(n_clusters=8, batch_size=10000)`,
                choices: [
                  {
                    id: "a",
                    label: "MiniBatchKMeans — processes mini-batches, O(n) per epoch, handles millions of records",
                    description: "Correct. MiniBatchKMeans is designed for large datasets — it updates centroids on random mini-batches, making each epoch O(n) with much lower memory usage. Standard KMeans with n_init=10 on 5M rows may be slow; DBSCAN and Agglomerative are O(n²) or worse without approximations.",
                  },
                  {
                    id: "b",
                    label: "DBSCAN — density-based, no need to choose k in advance",
                    description: "Standard DBSCAN is O(n log n) with a spatial index but in practice struggles with 5M points in a strict time budget. It also requires careful epsilon tuning.",
                  },
                  {
                    id: "c",
                    label: "AgglomerativeClustering — Ward linkage gives the best-quality clusters",
                    description: "Agglomerative clustering is O(n² log n) in memory and time. It is infeasible for 5M records without approximate methods.",
                  },
                  {
                    id: "d",
                    label: "Standard KMeans with n_init=1 to save time",
                    description: "Reducing n_init saves time but risks a poor local minimum. MiniBatchKMeans is the architecturally correct solution for scale.",
                  },
                ],
                branches: {
                  a: "u2_terminal",
                  b: "u2_recovery_scale",
                  c: "u2_recovery_scale",
                  d: "u2_recovery_scale",
                },
                rationale: "MiniBatchKMeans is sklearn's scalable answer to large datasets — each mini-batch update is O(batch_size), making full passes much faster than standard KMeans. For truly massive data, approximate DBSCAN variants (HDBSCAN, OPTICS with sampling) exist but MiniBatchKMeans is usually the first practical choice.",
              },
              u2_recovery_scale: {
                id: "u2_recovery_scale",
                type: "scenario_choice",
                badge: "Recovery 3",
                title: "Recovery · Algorithm scalability",
                prompt: "Why is standard AgglomerativeClustering impractical for datasets with more than ~50,000 rows?",
                code_snippet: `# Agglomerative: at each step merge the two closest clusters
# Start: N singleton clusters
# Step 1: N-1 clusters (1 merge)
# Step 2: N-2 clusters
# ...
# Final: 1 cluster (dendrogram)
#
# Memory: O(?)  |  Time: O(?)`,
                choices: [
                  {
                    id: "a",
                    label: "It requires storing an N×N distance matrix — O(n²) memory",
                    description: "Correct. Agglomerative clustering computes pairwise distances between all points, requiring O(n²) memory and O(n² log n) or O(n³) time. For n=50,000 that is 2.5B distance values — impractical without approximations.",
                  },
                  {
                    id: "b",
                    label: "It requires more than 1,000 clusters to work correctly",
                    description: "The number of target clusters doesn't affect scalability — the bottleneck is the pairwise distance computation regardless of k.",
                  },
                  {
                    id: "c",
                    label: "It can only run on balanced datasets",
                    description: "Class balance is not a constraint for agglomerative clustering. The scalability issue is purely algorithmic.",
                  },
                  {
                    id: "d",
                    label: "It only works on 2D data",
                    description: "Agglomerative clustering works in any dimensionality. The constraint is scale, not dimensionality.",
                  },
                ],
                branches: {
                  a: "u2_terminal",
                  b: "u2_terminal",
                  c: "u2_terminal",
                  d: "u2_terminal",
                },
                rationale: "Agglomerative clustering's O(n²) memory and O(n² log n) time complexity come from building the full pairwise distance matrix. For large datasets, use MiniBatchKMeans, HDBSCAN (approximate), or pre-cluster with k-means then run hierarchical on centroids.",
              },
              u2_terminal: {
                id: "u2_terminal",
                type: "scenario_choice",
                badge: "Final",
                title: "Revision complete · Density Clustering Mastery",
                terminal: true,
                prompt: "When would you choose DBSCAN over K-Means? Give the clearest case where K-Means would produce wrong results.",
                code_snippet: `# Dataset A: concentric ring clusters
# Dataset B: two interlocking crescent shapes
# Dataset C: varying-density Gaussian blobs
# Dataset D: 8 spherical clusters, balanced size`,
                choices: [
                  {
                    id: "a",
                    label: "DBSCAN for A/B/C — K-Means fails on non-spherical, varying-density, or cluster-with-noise data; K-Means only works well on D",
                    description: "Correct. K-Means assumes convex, equally-sized, spherical clusters and is sensitive to noise. DBSCAN discovers arbitrary shapes, handles noise natively, and adapts to varying density (with tuning). Dataset D (spherical balanced blobs) is the canonical K-Means sweet spot.",
                  },
                  {
                    id: "b",
                    label: "K-Means always outperforms DBSCAN because it has a well-defined objective function",
                    description: "Having an objective function does not mean it fits the data. K-Means' inertia objective assumes spherical clusters — it will produce misleading results on non-spherical data regardless of how well it minimises inertia.",
                  },
                  {
                    id: "c",
                    label: "DBSCAN only for datasets with fewer than 10,000 rows",
                    description: "Dataset size is a practical concern (DBSCAN scales as O(n log n) with KD-trees) but not the conceptual criterion for choosing DBSCAN. Shape and noise requirements drive the choice.",
                  },
                ],
                branches: {
                  a: "u2_terminal",
                  b: "u2_terminal",
                  c: "u2_terminal",
                },
                rationale: "DBSCAN's key advantage over K-Means: (1) finds arbitrary-shaped clusters via density reachability, (2) labels true outliers as noise rather than forcing them into a cluster, (3) does not require specifying k. Use K-Means when clusters are expected to be roughly spherical and similarly sized; use DBSCAN when shape is complex or anomaly detection is part of the goal.",
              },
            },
          },
    knowledgeCheck: [
      {
        question: "In DBSCAN, what distinguishes a border point from a core point?",
        options: [
          "A border point has fewer than minPts neighbors within eps but lies within eps of a core point",
          "A border point has more neighbors than a core point",
          "A border point is always labeled as noise",
        ],
        correctIndex: 0,
        explanation: "Core points meet the minPts-within-eps density threshold; border points are sparse themselves but reachable from a core, so they join but cannot expand the cluster.",
      },
      {
        question: "How does DBSCAN find non-spherical clusters that k-means cannot?",
        options: [
          "It fits an ellipse to each cluster",
          "It grows clusters by density connectivity — chaining core points and their neighborhoods — so clusters follow dense regions of any shape",
          "It projects the data to one dimension first",
        ],
        correctIndex: 1,
        explanation: "Density reachability lets a cluster propagate along chains of dense points, wrapping arbitrary shapes; k-means uses straight Voronoi boundaries.",
      },
      {
        question: "What is the recommended way to choose eps for DBSCAN?",
        options: [
          "Plot each point's distance to its k-th nearest neighbor, sort it, and look for the knee in the curve",
          "Always set eps to 0.5 regardless of the data",
          "Set eps equal to the number of clusters you expect",
        ],
        correctIndex: 0,
        explanation: "The sorted k-distance plot reveals a knee where neighbor distances spike; that value separates dense neighborhoods from sparse background.",
      },
      {
        question: "DBSCAN fails on a dataset with one dense cluster and one sparse cluster. Why, and what fixes it?",
        options: [
          "minPts must equal the number of clusters; setting it fixes the issue",
          "DBSCAN cannot handle two clusters at all; use k-means",
          "A single global eps cannot fit both densities; HDBSCAN clusters across density scales and extracts stable clusters",
        ],
        correctIndex: 2,
        explanation: "One eps either shatters the sparse cluster or merges the dense ones. HDBSCAN varies the density threshold and keeps the most persistent clusters.",
      },
      {
        question: "What does cutting a dendrogram horizontally accomplish?",
        options: [
          "It produces a flat clustering whose count equals the number of branches the cut crosses",
          "It computes the silhouette score automatically",
          "It standardizes the features",
        ],
        correctIndex: 0,
        explanation: "Agglomerative clustering builds a merge tree; a horizontal cut at a chosen height yields k clusters equal to the branches intersected — cut where merge heights jump.",
      },
      {
        question: "What is 'chaining', and which linkage is prone to it?",
        options: [
          "Single linkage can merge two separate clusters through a thin bridge of points, since it uses the nearest pair as the cluster distance",
          "Complete linkage chains clusters through their farthest points",
          "Ward linkage chains by minimizing variance",
        ],
        correctIndex: 0,
        explanation: "Single linkage = nearest-pair distance, so one bridge of close points can link otherwise-distinct clusters into a long straggly chain.",
      },
      {
        question: "Which linkage behaves most like k-means and why?",
        options: [
          "Single, because it minimizes the maximum distance",
          "Ward, because it merges to minimize the increase in within-cluster variance, favoring spherical equal-size clusters",
          "Average, because it ignores variance entirely",
        ],
        correctIndex: 1,
        explanation: "Ward's criterion is variance-based, so it shares k-means' spherical, balanced-cluster bias — and is the common Euclidean default.",
      },
      {
        question: "Which is the strongest reason to choose hierarchical clustering over k-means?",
        options: [
          "You don't know the number of clusters and want a dendrogram to inspect structure across scales before committing",
          "You have millions of points and need the fastest possible runtime",
          "Your clusters are perfectly spherical and equally sized",
        ],
        correctIndex: 0,
        explanation: "Hierarchical clustering defers the cluster-count decision and exposes nested structure; its O(n²)+ cost makes it a poor fit for huge datasets, which favors k-means.",
      },
    ],
  },

  "ml-u3": {
    durationLabel: "18–20 min",
    outcomes: [
      "Explain PCA as finding **orthogonal directions of maximum variance** via the **eigenvectors of the covariance matrix** (equivalently the **SVD** of the centered data).",
      "Read an **explained-variance / scree plot**, choose how many components to keep, and convert that into a defensible compression or denoising decision.",
      "State why **centering is mandatory and scaling usually is**, and predict how unscaled features hijack the first component.",
      "Name PCA's failure modes — **non-linear structure, non-Gaussian / multimodal data, outliers, and loss of interpretability** — and when to reach for kernel PCA, autoencoders, or t-SNE/UMAP instead.",
    ],
    learnMarkdown: `## What PCA is actually doing

PCA (Principal Component Analysis) is the workhorse of **linear dimensionality reduction**. Given data with many correlated features, it finds a new set of axes — the **principal components** — that are (1) **orthogonal** to each other and (2) ordered so the first captures the **most variance**, the second the most of what remains, and so on. You then keep the first few and discard the rest, trading a little variance for a lot fewer dimensions.

The intuition: a cloud of points in 2D that lies along a diagonal is "really" 1D plus noise. PCA rotates the axes to align with that diagonal, so the first new coordinate carries almost all the spread and the second is nearly flat. Project onto the first axis and you have compressed 2D → 1D losing almost nothing.

Why care? Three recurring jobs. **Compression / speed:** a 1,000-feature dataset where features are heavily correlated can often be squeezed to 50 components with 95% of the variance, shrinking storage and accelerating every downstream model. **Denoising:** the small-eigenvalue directions are frequently noise; dropping them and reconstructing yields a cleaner signal (the basis of eigenfaces and many image-cleanup pipelines). **Visualization and decorrelation:** projecting to the top 2–3 components gives a quick honest 2D view of high-dimensional data, and the resulting components are uncorrelated, which some models prefer. PCA is the first reduction technique to reach for because it is fast, deterministic, has no hyperparameters to tune beyond "how many components," and is fully reversible up to the discarded variance.

---

## The math, three equivalent ways

You should be able to state at least two of these:

1. **Variance maximization.** Find the unit vector \`w\` that maximizes the variance of the projected data \`Var(Xw)\`. The constraint \`||w|| = 1\` and a Lagrange multiplier turn this into an eigenvalue problem.
2. **Eigendecomposition of the covariance matrix.** Center the data, form the covariance matrix \`Σ = (1/n) Xᵀ X\`. Its **eigenvectors are the principal components**; each **eigenvalue is the variance captured** along that component. Sort eigenvalues descending; the top-k eigenvectors are your basis.
3. **SVD of the centered data.** \`X = U S Vᵀ\`. The columns of \`V\` are the principal directions, and the singular values squared (over n) are the eigenvalues. Libraries use SVD because it is numerically more stable than forming \`Σ\` explicitly.

All three give the same components. The eigenvalue / variance link is the one interviewers push on: **the k-th eigenvalue is the variance explained by the k-th component**, and \`λ_k / Σλ\` is its *fraction* of total variance.

### Why the components are orthogonal (and why that matters)

The covariance matrix is **symmetric**, and the spectral theorem guarantees a symmetric matrix has **orthogonal eigenvectors**. That is not a cosmetic property: it means the principal components are **uncorrelated** — the projected data has a diagonal covariance. So PCA does double duty: it compresses *and* **decorrelates**. That second job is why PCA is a common preprocessing step before models that dislike collinear inputs (linear regression, naive distance methods) — you hand them axes that are guaranteed independent in the second-order sense. It is also why "rotate to PCA axes, then keep the top few" is exactly a rotation followed by a truncation, and therefore **reversible** up to the discarded variance (\`X ≈ scores · componentsᵀ + mean\`). That reversibility is what lets PCA denoise: drop the small-eigenvalue components (assumed noise), reconstruct, and you get a cleaned version of the original.

---

## Choosing the number of components

- **Cumulative explained variance.** Plot the running sum of \`λ_k / Σλ\` and keep enough components to reach a target (90%, 95%, 99% are common). This is the single most useful PCA diagnostic.
- **Scree plot.** Plot eigenvalues in descending order and look for the "elbow" where they level off into a flat tail of noise components. Like the k-means elbow, it can be ambiguous.
- **Downstream task.** If PCA feeds a classifier, the only honest criterion is cross-validated downstream performance vs the number of components — sometimes 95% variance hurts and 80% helps (it can denoise).

---

## Centering and scaling: not optional details

**Centering is mandatory.** PCA explains variance *about the mean*. If you skip centering, the first component points toward the data's mean (its distance from the origin), not its direction of spread — the result is garbage. Every PCA implementation subtracts the mean for you; do not undo it.

**Scaling is usually mandatory too.** PCA maximizes variance, and variance is unit-dependent. A salary feature in dollars has variance in the billions; an age feature in years has variance in the hundreds. Without standardizing, **PC1 will be essentially the salary axis** and every other feature is invisible. Standardize (z-score) so each feature has unit variance unless the features are already in comparable units and you *want* the high-variance ones to dominate. The rule of thumb: when features have different units, run PCA on the **correlation matrix** (= standardized) not the raw covariance matrix.

---

## When PCA fails (the senior content)

PCA is **linear** and **global** — those two words explain every failure:

- **Non-linear structure.** Data on a curved manifold (a Swiss roll, a spiral) cannot be unrolled by a rotation. PCA flattens it badly. Use **kernel PCA**, **autoencoders**, or for visualization **t-SNE / UMAP**.
- **Variance ≠ importance.** PCA assumes the directions of greatest variance are the most informative. For classification, the discriminative direction can be a *low*-variance one (e.g. a small but consistent offset between two classes) that PCA throws away. **LDA** (supervised) optimizes for class separation instead.
- **Non-Gaussian / multimodal data.** PCA captures only second-order structure (variance/covariance). If clusters differ in higher moments, PCA may merge them. **ICA** finds statistically independent (non-Gaussian) sources.
- **Outliers.** Squared distance means one extreme point can rotate a whole component toward itself. Use robust PCA or clip/winsorize first.
- **Interpretability loss.** Each component is a linear combination of *all* original features, so "PC1" rarely maps to a clean business concept. If you need named features, PCA may be the wrong tool — consider feature selection. (One partial remedy: inspect the **loadings** — the eigenvector entries — to see which original features dominate a component, or use **sparse PCA** to force most loadings to zero.)

### PCA is not feature selection

A frequent confusion worth defusing out loud: PCA does **feature extraction**, not feature selection. It does not *pick* a subset of your original columns; it *builds new* columns that are weighted blends of all of them. If your goal is "tell me which of these 200 measurements matter for churn," PCA is the wrong tool — you want feature-importance or a selection method (L1, mutual information, recursive elimination). PCA's job is the opposite: when the 200 measurements are redundant and correlated, collapse them into 10 dense components that preserve the variance. Confusing the two leads to the classic mistake of "running PCA to reduce features" and then being unable to explain to a stakeholder what the surviving features *are*.

---

## PCA vs the alternatives

| Method | Linear? | Supervised? | Best for |
|--------|---------|-------------|----------|
| PCA | Yes | No | Compression, denoising, decorrelation, preprocessing |
| LDA | Yes | Yes | Dimensionality reduction that **maximizes class separation** |
| Kernel PCA | No | No | Non-linear manifolds via the kernel trick |
| Autoencoder | No | No | Learned non-linear compression at scale |
| t-SNE / UMAP | No | No | 2D/3D **visualization** of local structure (not preprocessing) |

---

## Pitfalls that cost production hours

- **Fitting PCA on train+test together (leakage).** Fit on train, then \`transform\` test with the same components and the same scaler.
- **Skipping standardization** and wondering why one feature owns PC1.
- **Using PCA components as model features and forgetting them at inference.** You must apply the *exact* fitted transform to new data.
- **Assuming high variance = useful signal** for a supervised task. It often is, but not always — validate downstream.
- **Reporting "95% variance retained" as if it's accuracy.** It is variance, not predictive performance; they can diverge sharply.

---

## Interview questions to rehearse aloud

- "What are principal components, mathematically?" (Eigenvectors of the covariance matrix; eigenvalues = variance captured; or right-singular vectors via SVD.)
- "Why must you center, and why usually scale?" (Variance about the mean; unscaled features hijack PC1.)
- "Give me a case where PCA hurts a classifier." (Discriminative direction is low-variance; PCA discards it. Use LDA.)
- "PCA vs t-SNE — when each?" (PCA: linear, reversible, good for preprocessing/compression; t-SNE: non-linear visualization only, distances unreliable.)
- "How do you choose the number of components?" (Cumulative explained variance to a target, scree elbow, or cross-validated downstream metric.)`,
    video: null,
    videoFallbackMarkdown: `## Deep dive without a clip

Plot a diagonal cloud of points on paper. By eye, draw the line the points spread along most — that is **PC1**. Draw a second line **perpendicular** to it through the center — that is **PC2**, and you can see it carries far less spread. Now project every point onto PC1 (drop a perpendicular) and notice the projections preserve almost all the variation. That single picture *is* PCA: rotate to the variance-aligned axes, keep the big one, drop the small one.

Then sabotage it: stretch the x-axis by 100× (imagine salary in dollars vs age in years). Watch PC1 swing to point almost entirely along x. Write one sentence on why this forces you to standardize before PCA whenever features have different units.`,
    tryGuidance: `Rotate the projection axis and watch the **variance of the projected coordinates** rise and fall. Find the angle where projected variance **peaks** — that is exactly the first principal component, the eigenvector of the covariance matrix with the largest eigenvalue. Use **Snap to PC1** to confirm your eyeball estimate. The green segments are each point's orthogonal drop onto your axis; the spread of those projections *is* the variance PCA maximizes. Predict, before snapping, which direction the cloud is most elongated along.`,
    interviewGraph: {
            initialStageId: "u3_click_leakage",
            artifactDimensions: [
              {
                label: "Data Leakage with PCA",
                recoveryStageId: "u3_recovery_leakage",
              },
              {
                label: "Explained Variance",
                recoveryStageId: "u3_recovery_variance",
              },
              {
                label: "PCA vs Feature Selection",
                recoveryStageId: "u3_recovery_selection",
                passLabel: "PCA Mastery",
              },
            ],
            stages: {
              u3_click_leakage: {
                id: "u3_click_leakage",
                type: "click_target",
                badge: "Stage 1",
                title: "Stage 1 · Spotting PCA data leakage",
                prompt: "The code below applies PCA before splitting the dataset. Click the line that introduces data leakage from test into training.",
                code_snippet: `from sklearn.decomposition import PCA
from sklearn.model_selection import train_test_split

X, y = load_dataset()

pca = PCA(n_components=10)
X_reduced = pca.fit_transform(X)   # ds-target:pca_leakage

X_train, X_test, y_train, y_test = train_test_split(
    X_reduced, y, test_size=0.2, random_state=42
)

model = LogisticRegression()
model.fit(X_train, y_train)
print(model.score(X_test, y_test))`,
                validationCopy: {
                  pca_leakage: "Correct. PCA is fitted on the entire dataset X before the split. The principal components are therefore influenced by test set observations — their means, variances, and covariance structure all leak into the transformation. PCA must be fitted only on X_train and then applied (transform-only) to X_test.",
                },
                branches: {
                  pca_leakage: "u3_choice_variance",
                },
              },
              u3_choice_variance: {
                id: "u3_choice_variance",
                type: "scenario_choice",
                badge: "Stage 2",
                title: "Stage 2 · Sufficiency of explained variance",
                prompt: "The first 3 principal components of a 50-feature dataset explain 85% of total variance. Is 85% always enough to retain?",
                code_snippet: `pca = PCA()
pca.fit(X_train)
cumvar = pca.explained_variance_ratio_.cumsum()
# cumvar[2] = 0.85  (3 components → 85%)`,
                choices: [
                  {
                    id: "a",
                    label: "It depends — for visualisation often yes; if the last 15% contains rare but critical signal, no",
                    description: "Correct. 85% is a popular threshold but not a universal rule. For a 2D/3D plot, 85% is usually fine. For a predictive task where rare events (fraud, failure modes) lie in low-variance directions, discarding 15% can lose the most important signal.",
                  },
                  {
                    id: "b",
                    label: "Yes — 85% is the standard data science threshold and always sufficient",
                    description: "There is no universal threshold. 85%, 90%, 95%, and 99% are all common choices depending on context. Always evaluate downstream task performance.",
                  },
                  {
                    id: "c",
                    label: "No — you should always keep all components",
                    description: "Keeping all components defeats the purpose of PCA. Dimensionality reduction is the goal; the question is where to draw the line.",
                  },
                  {
                    id: "d",
                    label: "Yes — the remaining 15% is always noise",
                    description: "Low-variance components are not necessarily noise. In signal processing or anomaly detection, rare but informative patterns often live in low-variance directions.",
                  },
                ],
                branches: {
                  a: "u3_choice_loadings",
                  b: "u3_recovery_variance",
                  c: "u3_recovery_variance",
                  d: "u3_recovery_variance",
                },
                rationale: "Explained variance ratio tells you how much of the total variation is captured, not how much predictive signal is retained. Always validate the reduced representation on a held-out set before committing to a component count.",
              },
              u3_recovery_variance: {
                id: "u3_recovery_variance",
                type: "scenario_choice",
                badge: "Recovery 1",
                title: "Recovery · Reading explained variance",
                prompt: "After fitting PCA, how do you decide how many components to keep for a classification task?",
                code_snippet: `pca = PCA().fit(X_train)
evr = pca.explained_variance_ratio_
cumvar = evr.cumsum()
# How many components k to keep?`,
                choices: [
                  {
                    id: "a",
                    label: "Pick k where cumulative variance crosses 95%, then validate downstream classifier accuracy",
                    description: "Correct. The 95% threshold is a reasonable starting point, but you must then measure classifier performance (e.g., cross-val accuracy) across different k values — the variance threshold alone may not be the performance-optimal choice.",
                  },
                  {
                    id: "b",
                    label: "Always keep k = sqrt(n_features)",
                    description: "There is no theoretical basis for this rule of thumb in general classification tasks.",
                  },
                  {
                    id: "c",
                    label: "Keep k = n_features - 1 to remove only the least informative component",
                    description: "Removing only one component provides negligible dimensionality reduction — this misses the point of PCA.",
                  },
                  {
                    id: "d",
                    label: "Keep all components where individual explained variance > 1% (Kaiser criterion)",
                    description: "The Kaiser criterion (eigenvalue > 1) is used in factor analysis and is not directly applicable to PCA in predictive modelling contexts without validation.",
                  },
                ],
                branches: {
                  a: "u3_choice_loadings",
                  b: "u3_choice_loadings",
                  c: "u3_choice_loadings",
                  d: "u3_choice_loadings",
                },
                rationale: "A common workflow: (1) plot cumulative explained variance, (2) choose a candidate k at a variance threshold (e.g., 95%), (3) run cross-validation on the downstream task across nearby k values to find the performance-optimal number of components.",
              },
              u3_choice_loadings: {
                id: "u3_choice_loadings",
                type: "scenario_choice",
                badge: "Stage 3",
                title: "Stage 3 · Interpreting principal component loadings",
                prompt: "PCA output shows PC1 has large positive loadings on features A, B, and C, and near-zero loadings on all others. What does this tell you?",
                code_snippet: `pca = PCA(n_components=3).fit(X_train)
loadings = pd.DataFrame(
    pca.components_.T,
    index=feature_names,
    columns=["PC1", "PC2", "PC3"]
)
# PC1: A=0.71, B=0.68, C=0.65, D=0.02, E=-0.01`,
                choices: [
                  {
                    id: "a",
                    label: "A, B, C are correlated and co-vary — PC1 captures their shared variance",
                    description: "Correct. Large loadings on A, B, C mean these features move together in the data. PC1 is essentially an index of the joint direction they all share. This often reveals multicollinearity.",
                  },
                  {
                    id: "b",
                    label: "A, B, C are the most important features for prediction",
                    description: "PCA loadings reflect directions of maximum variance, not predictive importance. A feature with small variance might still be a strong predictor. Loadings ≠ feature importance.",
                  },
                  {
                    id: "c",
                    label: "PC1 is the average of A, B, and C",
                    description: "PC1 is a weighted linear combination, but the weights are chosen to maximise variance, not to compute a simple average. The loadings are eigenvectors of the covariance matrix.",
                  },
                  {
                    id: "d",
                    label: "A, B, C have the highest variance individually",
                    description: "PC1 loadings reflect how features contribute to the first principal component direction, not individual feature variances. A low-variance feature could have a large loading if it co-varies with others.",
                  },
                ],
                branches: {
                  a: "u3_choice_l1",
                  b: "u3_recovery_leakage",
                  c: "u3_recovery_leakage",
                  d: "u3_recovery_leakage",
                },
                rationale: "PC loadings are the coefficients of the linear combination that defines each principal component. Large loadings on a group of features mean those features are correlated and move together — the component captures their shared variance. This is often used to detect multicollinearity or group semantically related features.",
              },
              u3_recovery_leakage: {
                id: "u3_recovery_leakage",
                type: "scenario_choice",
                badge: "Recovery 2",
                title: "Recovery · Correct PCA pipeline order",
                prompt: "Which pipeline correctly prevents data leakage when using PCA?",
                code_snippet: `# Pipeline A
pca.fit(X_all); X_r = pca.transform(X_all)
X_train, X_test = train_test_split(X_r)

# Pipeline B
X_train, X_test = train_test_split(X)
pca.fit(X_train); X_tr = pca.transform(X_train)
X_te = pca.transform(X_test)

# Pipeline C
X_train, X_test = train_test_split(X)
pca.fit_transform(X_train); pca.fit_transform(X_test)`,
                choices: [
                  {
                    id: "a",
                    label: "Pipeline A — fit PCA on all data for maximum information",
                    description: "Pipeline A leaks test data into the PCA transformation. The principal components are influenced by test set statistics.",
                  },
                  {
                    id: "b",
                    label: "Pipeline B — fit PCA only on training data, then transform both splits separately",
                    description: "Correct. PCA is fitted exclusively on X_train; X_test is only transformed (not fitted). This ensures test data never influences the learned principal directions.",
                  },
                  {
                    id: "c",
                    label: "Pipeline C — fit PCA independently on train and test for tailored components",
                    description: "Pipeline C fits PCA separately on X_test, which means the test representation uses a different coordinate system than training — the model trained on PC coordinates from train cannot generalize to test's different PCs.",
                  },
                  {
                    id: "d",
                    label: "All pipelines are equivalent because PCA is unsupervised",
                    description: "Being unsupervised doesn't prevent leakage. Test-set statistics (covariance structure) can still leak into the PCA transformation and inflate evaluation metrics.",
                  },
                ],
                branches: {
                  a: "u3_choice_l1",
                  b: "u3_choice_l1",
                  c: "u3_choice_l1",
                  d: "u3_choice_l1",
                },
                rationale: "The golden rule: fit transformations only on training data, then apply the fitted transformer to test/validation data. Use sklearn Pipeline to automate this — it automatically calls fit_transform on train and transform-only on test during cross-validation.",
              },
              u3_choice_l1: {
                id: "u3_choice_l1",
                type: "scenario_choice",
                badge: "Stage 4",
                title: "Stage 4 · PCA vs L1 regularisation for feature reduction",
                prompt: "You use PCA before logistic regression to reduce 200 features to 15. A colleague argues you should just use L1 (Lasso) regularisation instead. Who is right?",
                code_snippet: `# Approach A: PCA + LogisticRegression
pipe_a = Pipeline([("pca", PCA(n_components=15)),
                   ("lr", LogisticRegression())])

# Approach B: L1 LogisticRegression
pipe_b = Pipeline([("lr", LogisticRegression(penalty="l1",
                                              solver="saga"))])`,
                choices: [
                  {
                    id: "a",
                    label: "L1 if interpretability matters — it selects original features; PCA if multicollinearity is the problem — it creates uncorrelated axes",
                    description: "Correct. L1 zeroes out irrelevant features, keeping a sparse subset of the original interpretable features. PCA creates new synthetic axes that are linear combinations of all features — not interpretable but optimal for handling multicollinearity and compressing correlated features.",
                  },
                  {
                    id: "b",
                    label: "PCA is always better because it captures more variance",
                    description: "Capturing variance is not the same as retaining predictive signal. L1 can outperform PCA when the predictive features are a sparse subset of the original set.",
                  },
                  {
                    id: "c",
                    label: "L1 is always better because it keeps original feature names",
                    description: "Interpretability is one consideration, not the only one. If features are highly correlated, L1 may select one arbitrarily from a correlated group. PCA handles this more gracefully.",
                  },
                  {
                    id: "d",
                    label: "They are equivalent — both reduce to 15 features",
                    description: "L1 selects a sparse subset of original features. PCA constructs 15 new orthogonal axes from all 200. The representations, interpretation, and performance are fundamentally different.",
                  },
                ],
                branches: {
                  a: "u3_terminal",
                  b: "u3_recovery_selection",
                  c: "u3_recovery_selection",
                  d: "u3_recovery_selection",
                },
                rationale: "Use L1 when you want sparse, interpretable models that retain original feature names. Use PCA when features are highly correlated (multicollinearity), you want to decorrelate inputs, or you need compact representations. In practice, try both and compare cross-validation performance.",
              },
              u3_recovery_selection: {
                id: "u3_recovery_selection",
                type: "scenario_choice",
                badge: "Recovery 3",
                title: "Recovery · When PCA hurts",
                prompt: "Which scenario is most likely to produce worse performance with PCA than without it?",
                code_snippet: `# Dataset: 500 features, 1000 samples
# Target: binary classification (rare disease: 2% prevalence)
# Hypothesis: most informative features are low-variance biomarkers

# Option A: Keep all 500 features, use L1 LogReg
# Option B: PCA to 20 components (95% variance), then LogReg
# Option C: PCA to 50 components (99% variance), then LogReg`,
                choices: [
                  {
                    id: "a",
                    label: "Option B — PCA discards low-variance components that may contain the rare-disease signal",
                    description: "Correct. Rare disease biomarkers often have low population variance (only 2% of samples carry the signal). PCA to 95% variance discards the last 5% — which may include the very low-variance but high-signal biomarkers that separate the rare cases from controls.",
                  },
                  {
                    id: "b",
                    label: "Option A — too many features will always cause overfitting",
                    description: "With 1000 samples and the right regularisation (L1), 500 features is tractable. PCA may discard more signal than regularisation would.",
                  },
                  {
                    id: "c",
                    label: "Option C — 99% variance is never sufficient",
                    description: "99% variance retained is rarely the problem. The issue is specifically when the rare signal lives in the discarded 1-5% of variance.",
                  },
                  {
                    id: "d",
                    label: "All options perform equally — PCA is always information-preserving",
                    description: "PCA preserves total variance, not predictive signal. If the discriminative features have low variance in the population, PCA can actively discard them.",
                  },
                ],
                branches: {
                  a: "u3_terminal",
                  b: "u3_terminal",
                  c: "u3_terminal",
                  d: "u3_terminal",
                },
                rationale: "PCA optimises for variance, not for class discrimination. In rare-event classification, the most discriminative directions often have low population variance. Always validate with cross-validation before committing to PCA in such settings.",
              },
              u3_terminal: {
                id: "u3_terminal",
                type: "scenario_choice",
                badge: "Final",
                title: "Revision complete · PCA Mastery",
                terminal: true,
                prompt: "You reduce 200 features to 10 PCA components. A model trained on those 10 PCs underperforms a model trained on all 200 raw features. What went wrong?",
                code_snippet: `# Model A: LogReg on 200 raw features (L2)  → val AUC 0.88
# Model B: LogReg on 10 PCA components       → val AUC 0.71

pca = PCA(n_components=10)
X_pca = pca.fit_transform(X_train)   # <-- what might be wrong here?
# 10 components explain 72% of variance`,
                choices: [
                  {
                    id: "a",
                    label: "72% variance retained — the discarded 28% contained predictive signal; PCA was fitted on all data (leakage); or 10 components was too aggressive a reduction",
                    description: "Correct. Three compounding issues: (1) only 72% variance kept means meaningful signal was discarded, (2) if PCA was fitted on full data it leaked test statistics, (3) the predictive features may be in low-variance directions. Fix: fit PCA on train only, sweep component count by cross-val AUC, consider PCA + original features or just use regularisation.",
                  },
                  {
                    id: "b",
                    label: "Logistic regression cannot handle PCA output — use a tree model instead",
                    description: "Logistic regression works perfectly on PCA output (the components are continuous, uncorrelated features). The model class is not the issue.",
                  },
                  {
                    id: "c",
                    label: "PCA is not compatible with L2 regularisation",
                    description: "PCA and L2 regularisation are fully compatible — PCA decorrelates features, which can actually make L2 regularisation more well-behaved.",
                  },
                ],
                branches: {
                  a: "u3_terminal",
                  b: "u3_terminal",
                  c: "u3_terminal",
                },
                rationale: "When PCA hurts performance: (1) you may be discarding signal-rich variance, (2) data leakage inflates training metrics but hurts test metrics, (3) the component count was chosen by variance threshold rather than cross-validated task performance. Use sklearn Pipeline to prevent leakage and tune n_components as a hyperparameter.",
              },
            },
          },
    knowledgeCheck: [
      {
        question: "What are the principal components, in terms of the covariance matrix?",
        options: [
          "Its eigenvectors, ordered by eigenvalue; each eigenvalue is the variance captured along that component",
          "Its rows, ordered by magnitude",
          "Randomly chosen orthogonal vectors that decorrelate the data",
        ],
        correctIndex: 0,
        explanation: "PCA diagonalizes the covariance matrix: eigenvectors are the component directions and eigenvalues are the variances captured, sorted descending.",
      },
      {
        question: "Why is centering the data mandatory before PCA?",
        options: [
          "Centering speeds up the eigendecomposition",
          "PCA explains variance about the mean; without centering, PC1 points toward the mean's offset from the origin rather than the direction of spread",
          "Centering converts the data to unit variance",
        ],
        correctIndex: 1,
        explanation: "Variance is defined about the mean. Skipping centering makes the first component align with the data's distance from the origin, which is meaningless.",
      },
      {
        question: "You run PCA on raw salary (dollars) and age (years) without standardizing. What happens?",
        options: [
          "PC1 is essentially the salary axis because its variance dwarfs age's, so age contributes almost nothing",
          "Age dominates because it has a smaller range",
          "Nothing — PCA normalizes variance automatically",
        ],
        correctIndex: 0,
        explanation: "PCA maximizes variance, which is unit-dependent. The huge-variance feature owns the leading components unless you standardize (PCA on the correlation matrix).",
      },
      {
        question: "On a Swiss-roll (curved manifold) dataset, why does PCA give a poor 2D embedding?",
        options: [
          "PCA needs more components than the data has",
          "PCA requires labeled data for manifolds",
          "PCA is a linear rotation and cannot unroll a curved manifold; you need kernel PCA, an autoencoder, or t-SNE/UMAP",
        ],
        correctIndex: 2,
        explanation: "PCA only rotates axes (linear), so it flattens rather than unrolls non-linear manifolds. Non-linear methods are required.",
      },
      {
        question: "For a classification task, when can PCA actually hurt performance?",
        options: [
          "When the discriminative direction has low variance, PCA discards it; LDA, which maximizes class separation, would keep it",
          "When the classes are perfectly separable, PCA always fails",
          "PCA never hurts classification; it only helps",
        ],
        correctIndex: 0,
        explanation: "PCA equates variance with importance. A small but consistent class offset is low-variance and may be dropped; LDA optimizes separability instead.",
      },
      {
        question: "What does the cumulative explained-variance plot help you decide?",
        options: [
          "Which classifier to use downstream",
          "How many components to keep to reach a target fraction of total variance (e.g. 95%)",
          "Whether the data is Gaussian",
        ],
        correctIndex: 1,
        explanation: "Summing λ_k / Σλ gives the fraction of variance retained; you keep enough components to hit a target, balancing compression against information loss.",
      },
      {
        question: "Why do production PCA implementations use the SVD of the centered data rather than explicitly forming the covariance matrix?",
        options: [
          "SVD is more numerically stable and avoids squaring the condition number that forming XᵀX introduces",
          "SVD requires no centering",
          "SVD finds non-linear components",
        ],
        correctIndex: 0,
        explanation: "X = U S Vᵀ yields the same components (columns of V) and variances (singular values squared) without the numerical instability of computing XᵀX directly.",
      },
      {
        question: "How should you apply PCA when you have separate train and test sets?",
        options: [
          "Fit PCA (and the scaler) on training data only, then transform the test set with the same fitted components",
          "Fit PCA on the combined train+test data for best coverage",
          "Fit a separate PCA on the test set",
        ],
        correctIndex: 0,
        explanation: "Fitting on combined data leaks test information. Fit on train, then apply the identical transform to test — exactly as with any preprocessing step.",
      },
    ],
  },

  "ml-u4": {
    durationLabel: "18–20 min",
    outcomes: [
      "Explain what **t-SNE** and **UMAP** optimize — preserving **local neighborhoods**, not global geometry — and why they are visualization tools, **not** preprocessing.",
      "Tune **perplexity** (t-SNE) and **n_neighbors / min_dist** (UMAP), and predict how each knob trades **local detail for global structure**.",
      "Avoid the three classic misreads: **inter-cluster distances are not meaningful**, **cluster sizes/densities are distorted**, and **apparent clusters can be noise** at the wrong settings.",
      "Choose between **t-SNE and UMAP** on speed, global-structure fidelity, reproducibility, and the ability to embed new points.",
    ],
    learnMarkdown: `## The job these tools do

t-SNE and UMAP are **non-linear dimensionality reduction for visualization**. You hand them high-dimensional data (say 50 PCA components of an image embedding) and they produce a 2D or 3D scatter where **points that were neighbors in high-D stay neighbors in 2D**. That is the entire promise — and the source of every way people misuse them. They are designed to make **local structure** legible; they are *not* designed to preserve distances, densities, or the global layout, and they are *not* a feature-engineering step you feed to a model.

Contrast with PCA to make the boundary sharp. PCA is **linear, global, and reversible**: it finds straight-line directions of maximum variance and you can reconstruct the original from the components. That makes it ideal for *preprocessing* but poor at *untangling* a curved manifold — on a Swiss roll, PCA just flattens it and overlapping spirals stay overlapping. t-SNE and UMAP are **non-linear and local**: they care only about who-is-near-whom, so they can unroll that Swiss roll into clean strips. The price for that power is everything that makes a plot quantitatively trustworthy — distances, sizes, and global arrangement all become unreliable. So the rule of thumb is: **PCA to compress and preprocess; t-SNE/UMAP to look.** A common pipeline uses both — PCA to ~50 dims first, then t-SNE/UMAP to 2D.

---

## t-SNE: matching neighbor probabilities

t-SNE (t-distributed Stochastic Neighbor Embedding) works in two halves:

1. **In high-D**, for every pair of points it defines a probability that one would pick the other as a neighbor, using a Gaussian whose width is set per-point by the **perplexity**. Perplexity is, loosely, the *effective number of neighbors* each point pays attention to (typical range **5–50**).
2. **In low-D**, it defines similar probabilities but with a **Student-t (heavy-tailed)** kernel, then moves the 2D points (gradient descent on **KL divergence**) until the low-D neighbor probabilities match the high-D ones.

The heavy tail in low-D is the clever part: it lets moderately-distant points spread out, which **prevents the "crowding problem"** where everything collapses to the center. The cost: t-SNE is **O(n²)** naively (Barnes-Hut brings it to O(n log n)), **non-deterministic** (random init → different layouts each run unless you fix the seed), and it has **no reusable mapping** — you cannot embed a new point without re-running.

---

## UMAP: a graph, then a layout

UMAP (Uniform Manifold Approximation and Projection) builds a **weighted k-nearest-neighbor graph** in high-D (its locality knob is **\`n_neighbors\`**), then optimizes a 2D layout (via cross-entropy) so the low-D graph matches, with **\`min_dist\`** controlling how tightly points are allowed to pack within a cluster. Compared with t-SNE, UMAP is typically **much faster**, scales to millions of points, tends to **preserve more global structure**, and crucially can **transform new data** with the fitted model (\`umap.transform\`) — so it can serve as a (cautious) preprocessing step in a way t-SNE cannot.

### Why the heavy tail matters (the crowding problem)

The single most important design choice in t-SNE is using a **Student-t** kernel in the low-dimensional space while using a **Gaussian** in the high-dimensional space. Here is why. In high dimensions there is far more "room" — a point can have many neighbors at moderate distance. When you squash everything into 2D, those moderately-distant points have nowhere to go and pile up near the center: the **crowding problem**. The t-distribution's heavy tail assigns a non-trivial probability to larger 2D distances, so the optimization is *allowed* to push moderately-similar points apart without paying a huge penalty. The visible consequence is the crisp gaps between clusters that make t-SNE plots so appealing — and, ironically, the very reason those gaps are not to be trusted as distances. The plot is *engineered* to separate; do not read the separation as meaning.

---

## The knobs and what they trade

| Knob | Tool | Low value | High value |
|------|------|-----------|------------|
| **perplexity** | t-SNE | Many tiny fragmented clusters; noise looks like structure | Smoother, more global; clusters may merge |
| **n_neighbors** | UMAP | Very local, fine detail, fragmented | More global structure, broader manifold view |
| **min_dist** | UMAP | Tightly packed points within clusters | Evenly spread points, easier to see density |
| **learning_rate / iterations** | t-SNE | Under-converged blobs | Settled layout (but more compute) |

The single most important habit: **run several perplexities (or n_neighbors) and only trust structure that persists across them.** A cluster that appears at one setting and vanishes at the next was probably an artifact.

---

## The three misreads that get people in trouble

These appear in interviews and in real post-mortems:

1. **Inter-cluster distances are not meaningful.** If cluster A and cluster B sit far apart while C sits between them, that layout does **not** mean A and B are more different from each other than from C. t-SNE/UMAP optimize *local* neighborhoods; the gaps between blobs are essentially arbitrary. Never measure "how different" two clusters are by their separation on a t-SNE plot.
2. **Cluster sizes and densities are distorted.** t-SNE actively equalizes density — a tight cluster and a diffuse one can render at the same on-screen size. The **relative area** of a blob tells you almost nothing about how many points it has or how spread the original data was.
3. **You can hallucinate clusters.** At low perplexity, random noise fragments into crisp-looking "clusters." At the wrong settings even uniform data shows structure. Always vary the knob and cross-check against a method you trust (e.g. did k-means / DBSCAN labels actually separate, or only the picture?).

A fourth, quieter trap: **t-SNE is stochastic**, so two runs give different pictures. Fix \`random_state\` before you draw conclusions, and never compare two separately-fit embeddings point-for-point.

---

## t-SNE vs UMAP — choosing

| Property | t-SNE | UMAP |
|----------|-------|------|
| Speed / scale | Slower; struggles past ~100k points | Fast; millions of points |
| Global structure | Poor (local focus) | Better preserved |
| New-point embedding | No (must re-fit) | Yes (\`transform\`) |
| Determinism | Stochastic (seed it) | More stable, still seed it |
| Main knob | perplexity | n_neighbors, min_dist |
| Typical use | Careful exploratory viz, papers | Viz **and** light preprocessing at scale |

Default modern advice: **start with UMAP** for speed and the ability to project new data; use t-SNE when you specifically want its fine local separation and don't need to embed new points.

### A debugging checklist before you trust an embedding

When an embedding looks "wrong" or you are about to present one, run this list: (1) Did you **standardize / PCA-reduce** first? Raw, unscaled, high-dimensional input gives noisy embeddings. (2) Did you **fix the random seed** and re-run — does the local story survive? (3) Did you **sweep the locality knob** (two or three perplexities / n_neighbors) and keep only persistent structure? (4) Are you about to claim something about **distance, size, or density between clusters**? Stop — those are the unreliable quantities. (5) Did you **color by a known label** to sanity-check? If the embedding cleanly separates a label you did not feed it, that is real signal; if it separates random noise, you have over-fragmented. Treat the embedding as a *hypothesis generator* you then confirm with a method whose geometry you trust (k-means, DBSCAN, a classifier), never as the final word.

---

## Pitfalls that cost production hours

- **Feeding raw high-D data straight in.** Run **PCA to ~50 dims first** — it denoises, speeds up the neighbor search, and improves the embedding.
- **Treating the embedding as features for a model.** t-SNE especially is for *looking*, not for downstream modeling; its coordinates aren't stable or meaningful axes.
- **Reading distance between clusters as semantic distance.** The single most common misinterpretation.
- **Trusting a single run / single perplexity.** Vary the knob and the seed; keep only what persists.
- **Comparing two embeddings as if their axes align.** Each fit has arbitrary orientation, scale, and (for t-SNE) layout.

---

## Interview questions to rehearse aloud

- "What does t-SNE preserve, and what does it deliberately *not* preserve?" (Local neighborhoods; not global distances, densities, or cluster sizes.)
- "Why can't you read inter-cluster distance off a t-SNE plot?" (It optimizes local structure; gaps are arbitrary.)
- "What does perplexity control?" (Effective neighbor count; low → fragmented/local, high → global/merged.)
- "t-SNE vs UMAP — when each?" (UMAP: faster, scales, embeds new points, more global; t-SNE: fine local separation, no reusable mapping.)
- "Why run PCA before t-SNE/UMAP?" (Denoise, speed up the kNN search, stabilize the embedding.)`,
    video: null,
    videoFallbackMarkdown: `## Deep dive without a clip

Take a dataset you understand — say handwritten digits 0–9 — and predict what a good 2D embedding *should* show: ten blobs, with visually similar digits (4/9, 3/8) sitting closer. Now write down what you must **not** conclude from the picture: that a blob's on-screen **size** reflects its sample count (it doesn't — density is equalized), or that the **gap** between the "0" blob and the "1" blob measures how different those digits are (it doesn't — inter-cluster distance is arbitrary).

Finally, imagine running it twice with different random seeds. The two plots look different but tell the same local story. Write one sentence on why that means you should fix \`random_state\` and trust only structure that survives multiple perplexities.`,
    tryGuidance: `Slide the **perplexity / neighbors** knob and watch the same high-dimensional structure re-embed into 2D — the clusters visibly rearrange even though the underlying data never changed. At **low** settings the embedding fragments and over-separates; at **high** settings clusters smooth together and look more global. Critically, watch the **gaps between clusters** shift with the knob: that movement is the proof that **inter-cluster distance is not meaningful**. Before moving the slider, predict whether detail or global structure will dominate, then read the warning caption.`,
    interviewGraph: {
            initialStageId: "u4_click_tsne_features",
            artifactDimensions: [
              {
                label: "t-SNE Interpretation",
                recoveryStageId: "u4_recovery_interpretation",
              },
              {
                label: "Perplexity & Reproducibility",
                recoveryStageId: "u4_recovery_perplexity",
              },
              {
                label: "Viz vs Production Use",
                recoveryStageId: "u4_recovery_production",
                passLabel: "Dimensionality Viz Mastery",
              },
            ],
            stages: {
              u4_click_tsne_features: {
                id: "u4_click_tsne_features",
                type: "click_target",
                badge: "Stage 1",
                title: "Stage 1 · t-SNE used as predictive features",
                prompt: "The code below runs t-SNE and then feeds the 2D coordinates directly into a classifier for production use. Click the line that misuses t-SNE as a feature engineering step.",
                code_snippet: `from sklearn.manifold import TSNE
from sklearn.ensemble import RandomForestClassifier

tsne = TSNE(n_components=2, perplexity=30, random_state=42)
X_2d = tsne.fit_transform(X_train)   # ds-target:tsne_as_features

clf = RandomForestClassifier(n_estimators=200, random_state=42)
clf.fit(X_2d, y_train)

# Deployment: transform new data and predict
X_new_2d = TSNE(n_components=2).fit_transform(X_new)
preds = clf.predict(X_new_2d)`,
                validationCopy: {
                  tsne_as_features: "Correct. t-SNE is a visualisation technique, not a feature extractor for predictive models. It has no out-of-sample extension — you cannot transform new data using a previously fitted t-SNE model. Each call to fit_transform creates a completely new and different embedding, so the coordinates for X_new are on a different axis than X_train. Using them as classifier features will produce random predictions.",
                },
                branches: {
                  tsne_as_features: "u4_choice_perplexity",
                },
              },
              u4_choice_perplexity: {
                id: "u4_choice_perplexity",
                type: "scenario_choice",
                badge: "Stage 2",
                title: "Stage 2 · Perplexity effects on t-SNE layout",
                prompt: "You run t-SNE with perplexity=5 and then with perplexity=50 on the same 10,000-point dataset. What changes in the visualisation?",
                code_snippet: `tsne_5  = TSNE(n_components=2, perplexity=5,  random_state=1)
tsne_50 = TSNE(n_components=2, perplexity=50, random_state=1)

emb_5  = tsne_5.fit_transform(X)
emb_50 = tsne_50.fit_transform(X)`,
                choices: [
                  {
                    id: "a",
                    label: "perplexity=5 shows very local micro-structure with tight scattered blobs; perplexity=50 shows more global cohesion; neither is the definitive truth",
                    description: "Correct. Perplexity controls the effective number of neighbours t-SNE considers for each point. Low perplexity → tiny local neighbourhoods → fragmented, scattered dots. High perplexity → larger neighbourhoods → more global structure, smoother clusters. Both are legitimate but partial views of the data.",
                  },
                  {
                    id: "b",
                    label: "perplexity=50 is always better because it uses more neighbours",
                    description: "Neither perplexity is universally better. perplexity=50 with only 10,000 points may over-smooth structure; perplexity=5 may fragment genuine clusters. The right value depends on data density.",
                  },
                  {
                    id: "c",
                    label: "They produce identical layouts because random_state is the same",
                    description: "Same random_state ensures reproducibility within one run, but changing perplexity fundamentally changes the probability model and produces a different optimisation landscape and result.",
                  },
                  {
                    id: "d",
                    label: "perplexity=5 gives global structure; perplexity=50 gives local structure",
                    description: "This is reversed. Higher perplexity considers more neighbours → captures more global structure. Lower perplexity uses fewer neighbours → captures local micro-structure.",
                  },
                ],
                branches: {
                  a: "u4_choice_determinism",
                  b: "u4_recovery_perplexity",
                  c: "u4_recovery_perplexity",
                  d: "u4_recovery_perplexity",
                },
                rationale: "Perplexity is roughly the number of effective nearest neighbours t-SNE balances for each point. Typical guidance: perplexity between 5–50 for most datasets; rule of thumb: sqrt(n) ≈ 100 for 10,000 points. Always run multiple perplexity values — and multiple random seeds — before drawing conclusions.",
              },
              u4_recovery_perplexity: {
                id: "u4_recovery_perplexity",
                type: "scenario_choice",
                badge: "Recovery 1",
                title: "Recovery · t-SNE parameters and their meaning",
                prompt: "Which of the following is a valid reason to run t-SNE multiple times with different random seeds on the same data?",
                code_snippet: `for seed in [0, 7, 42, 99, 123]:
    emb = TSNE(n_components=2, perplexity=30,
               random_state=seed).fit_transform(X)
    plot_embedding(emb, title=f"seed={seed}")`,
                choices: [
                  {
                    id: "a",
                    label: "To verify that consistent cluster groupings appear across seeds — only stable patterns are trustworthy",
                    description: "Correct. t-SNE is non-deterministic (even with random_state, different seeds → different initialisations → different local minima). Cluster patterns that appear consistently across seeds are more likely to reflect genuine structure in the data.",
                  },
                  {
                    id: "b",
                    label: "To pick the seed that produces the most separated clusters",
                    description: "Cherry-picking the 'best-looking' seed is p-hacking for visualisations. Separated clusters don't necessarily mean more structure — they may just mean a lucky initialisation.",
                  },
                  {
                    id: "c",
                    label: "Different seeds produce completely independent visualisations with no shared information",
                    description: "Different seeds produce different layouts of the same underlying data. The high-dimensional proximity structure is the same; what varies is the 2D projection's orientation and local geometry.",
                  },
                  {
                    id: "d",
                    label: "Random state has no effect on t-SNE — all seeds give identical results",
                    description: "Random state controls initialisation. Different initialisations lead to different gradient descent paths and different final embeddings.",
                  },
                ],
                branches: {
                  a: "u4_choice_determinism",
                  b: "u4_choice_determinism",
                  c: "u4_choice_determinism",
                  d: "u4_choice_determinism",
                },
                rationale: "t-SNE's stochastic gradient descent optimisation means it can converge to different local minima from different initialisations. The scientific practice is to run multiple seeds and report only patterns that are stable across runs — these are robust features of the data, not artefacts of one lucky seed.",
              },
              u4_choice_determinism: {
                id: "u4_choice_determinism",
                type: "scenario_choice",
                badge: "Stage 3",
                title: "Stage 3 · t-SNE reproducibility",
                prompt: "Two runs of t-SNE on the same data with different random seeds produce different cluster arrangements. A junior analyst says this is a bug. Is it?",
                code_snippet: `run1 = TSNE(n_components=2, perplexity=30, random_state=1).fit_transform(X)
run2 = TSNE(n_components=2, perplexity=30, random_state=99).fit_transform(X)

# Cluster A appears top-left in run1, bottom-right in run2
# Cluster A appears merged with B in run2`,
                choices: [
                  {
                    id: "a",
                    label: "Not a bug — t-SNE is non-deterministic by default; fix with a consistent random_state, but note inter-run cluster distances are meaningless",
                    description: "Correct. t-SNE uses stochastic gradient descent without a globally convex objective. Different random seeds → different local minima → different 2D layouts. This is expected. To get reproducible plots, set random_state. Crucially, the spatial distance between clusters in t-SNE has no meaning — only within-cluster tightness is interpretable.",
                  },
                  {
                    id: "b",
                    label: "A bug — t-SNE should always produce the same output given the same input",
                    description: "t-SNE is intentionally non-deterministic due to its stochastic optimisation. This is documented behaviour, not a bug.",
                  },
                  {
                    id: "c",
                    label: "The data changed between runs — re-check the input",
                    description: "With the same dataset and different random_state values, the input data is identical. Variation is in the optimisation path, not the data.",
                  },
                  {
                    id: "d",
                    label: "Run with n_iter=1000 — more iterations will make runs converge to the same solution",
                    description: "More iterations help convergence within a run, but cannot guarantee two runs with different seeds converge to the same 2D layout because the objective is non-convex.",
                  },
                ],
                branches: {
                  a: "u4_choice_distance",
                  b: "u4_recovery_interpretation",
                  c: "u4_recovery_interpretation",
                  d: "u4_recovery_interpretation",
                },
                rationale: "t-SNE uses random initialisation + stochastic gradient descent → non-convex objective → multiple local minima. Fix reproducibility with random_state. But even reproducible t-SNE plots must not be used to interpret inter-cluster distances — only local neighbourhood structure (within-cluster density) is meaningful.",
              },
              u4_recovery_interpretation: {
                id: "u4_recovery_interpretation",
                type: "scenario_choice",
                badge: "Recovery 2",
                title: "Recovery · What t-SNE visualisations mean",
                prompt: "Which interpretation of a t-SNE plot is valid?",
                code_snippet: `# t-SNE 2D embedding of 10,000 single-cell RNA sequences
# Visible: 8 distinct point clouds (clusters)
# Observation 1: Cluster A and Cluster B are close together
# Observation 2: Cluster C points are tightly packed
# Observation 3: Cluster D is much larger than Cluster E`,
                choices: [
                  {
                    id: "a",
                    label: "Clusters A and B are similar in high-dimensional space because they are close in the t-SNE plot",
                    description: "Invalid. t-SNE does not preserve global distances. Cluster proximity in 2D t-SNE is a visualisation artefact and does not indicate similarity in the original high-dimensional space.",
                  },
                  {
                    id: "b",
                    label: "Cluster C points are locally similar to each other — tight packing suggests high within-cluster cohesion",
                    description: "Valid. t-SNE does preserve local neighbourhood structure well. Tight packing in t-SNE indicates those points are genuinely close in high-dimensional space.",
                  },
                  {
                    id: "c",
                    label: "Cluster D has more cells than Cluster E because it is larger in the plot",
                    description: "Invalid. t-SNE distorts cluster sizes — the visual size of a cluster does not directly correspond to the number of points. Point density within a cluster is also compressed by the algorithm.",
                  },
                  {
                    id: "d",
                    label: "t-SNE proves there are exactly 8 distinct cell types",
                    description: "Invalid. t-SNE can create apparent clusters from continuous data, especially at suboptimal perplexity. The number of visible blobs is not a ground truth for the number of true clusters.",
                  },
                ],
                branches: {
                  a: "u4_choice_distance",
                  b: "u4_choice_distance",
                  c: "u4_choice_distance",
                  d: "u4_choice_distance",
                },
                rationale: "t-SNE reliably preserves local neighbourhood structure (within-cluster cohesion) but does NOT preserve: global distances between clusters, cluster sizes, or absolute point counts. Valid use: 'these points cluster together locally'. Invalid use: 'these two clusters are more similar to each other than to a third cluster'.",
              },
              u4_choice_distance: {
                id: "u4_choice_distance",
                type: "scenario_choice",
                badge: "Stage 4",
                title: "Stage 4 · t-SNE distance validity",
                prompt: "A teammate uses a t-SNE plot to argue: 'Customer segment X is farther from segment Y than from segment Z — so X and Z should be merged first.' Is this reasoning valid?",
                code_snippet: `tsne = TSNE(n_components=2, perplexity=30, random_state=42)
X_2d = tsne.fit_transform(X_scaled)

# In 2D plot:
# dist(X, Y) ≈ 4.2 units
# dist(X, Z) ≈ 1.8 units
# Teammate concludes: merge X and Z`,
                choices: [
                  {
                    id: "a",
                    label: "No — t-SNE does not preserve global distances; 2D distances between clusters are meaningless",
                    description: "Correct. t-SNE optimises local neighbourhood preservation (KL divergence between local probability distributions). It actively distorts global distances to achieve this. Euclidean distances between clusters in t-SNE space have no reliable relationship to high-dimensional distances.",
                  },
                  {
                    id: "b",
                    label: "Yes — t-SNE is a distance-preserving dimensionality reduction",
                    description: "t-SNE is NOT distance-preserving. MDS (multidimensional scaling) and UMAP (to a degree) better preserve global structure. t-SNE explicitly sacrifices global distance preservation for local structure fidelity.",
                  },
                  {
                    id: "c",
                    label: "Yes — if perplexity is set correctly, t-SNE distances are valid",
                    description: "No perplexity setting makes t-SNE distances globally valid. Perplexity controls local neighbourhood size, not global distance accuracy.",
                  },
                  {
                    id: "d",
                    label: "Only valid if you normalise the 2D coordinates first",
                    description: "Normalising the coordinates doesn't recover information that t-SNE discarded. The problem is algorithmic, not a scaling issue.",
                  },
                ],
                branches: {
                  a: "u4_terminal",
                  b: "u4_recovery_production",
                  c: "u4_recovery_production",
                  d: "u4_recovery_production",
                },
                rationale: "t-SNE's objective (minimising KL divergence between high-dim and low-dim neighbourhoods) means it compresses and expands space non-linearly. Two clusters that appear close in 2D may be far apart in the original space. For distance-preserving 2D views, use UMAP (which better preserves global topology) or MDS.",
              },
              u4_recovery_production: {
                id: "u4_recovery_production",
                type: "scenario_choice",
                badge: "Recovery 3",
                title: "Recovery · t-SNE vs UMAP for production use",
                prompt: "You need a 2D embedding of high-dimensional text features to (1) visualise cluster structure and (2) serve as input features to a downstream classifier. Which embedding technique is appropriate for each task?",
                code_snippet: `# Task 1: Visualisation only
# Task 2: Production feature input for a classifier

# Options:
# A: t-SNE for both tasks
# B: UMAP for both tasks
# C: t-SNE for Task 1, UMAP for Task 2
# D: Neither — use PCA for both`,
                choices: [
                  {
                    id: "a",
                    label: "t-SNE for Task 1 (visualisation), UMAP for Task 2 (features) — they serve different purposes",
                    description: "Correct. t-SNE is excellent for visualisation but has no out-of-sample extension (cannot embed new points consistently). UMAP learns a parametric mapping that can transform new points into the same embedding space — making it suitable as a feature extractor. For Task 1, t-SNE's local structure fidelity is ideal; for Task 2, UMAP's stable, consistent mapping is required.",
                  },
                  {
                    id: "b",
                    label: "t-SNE for both — it creates the most visually distinct clusters",
                    description: "t-SNE cannot serve as production features because it has no out-of-sample extension. You cannot reliably embed new points into an existing t-SNE space.",
                  },
                  {
                    id: "c",
                    label: "UMAP for both — UMAP is strictly better than t-SNE",
                    description: "UMAP is faster and has out-of-sample extension, but t-SNE often produces visually crisper local cluster separation for exploration. Both have appropriate use cases.",
                  },
                  {
                    id: "d",
                    label: "PCA for both — it is the only transformation with a stable inverse",
                    description: "PCA is stable but produces linear projections that may miss non-linear structure. UMAP is preferable for non-linear feature extraction while preserving more structure than PCA.",
                  },
                ],
                branches: {
                  a: "u4_terminal",
                  b: "u4_terminal",
                  c: "u4_terminal",
                  d: "u4_terminal",
                },
                rationale: "Key distinction: t-SNE is transductive (no out-of-sample), UMAP is inductive (parametric, can embed new points). For visualisation, both work; t-SNE often gives crisper local separation. For production features, use UMAP (or a parametric autoencoder). Never use t-SNE coordinates as classifier inputs.",
              },
              u4_terminal: {
                id: "u4_terminal",
                type: "scenario_choice",
                badge: "Final",
                title: "Revision complete · Dimensionality Viz Mastery",
                terminal: true,
                prompt: "Why can't you use t-SNE embeddings as features for a production classifier? What would you use instead?",
                code_snippet: `# Scenario: you trained a RandomForest on t-SNE(X_train)
# Now a new batch X_new arrives every hour.
tsne = TSNE(n_components=2, random_state=42)

# Attempt 1: refit t-SNE on X_new alone
X_new_2d = tsne.fit_transform(X_new)   # Different space!

# Attempt 2: refit t-SNE on X_train + X_new
X_all_2d = tsne.fit_transform(
    np.vstack([X_train, X_new]))       # Coordinates shift!`,
                choices: [
                  {
                    id: "a",
                    label: "t-SNE has no out-of-sample extension — each call creates a new coordinate system; use UMAP (parametric), PCA, or an autoencoder for production feature extraction",
                    description: "Correct. t-SNE embeds a fixed dataset — you cannot add new points to an existing embedding without re-running on all data, which changes all coordinates. UMAP with parametric=True learns a neural network mapping that can embed new points into the same space. PCA's linear projection is also stable across new data.",
                  },
                  {
                    id: "b",
                    label: "t-SNE works fine — just refit on the new data each hour and the classifier will adapt",
                    description: "Refitting t-SNE hourly on new data produces a different coordinate system each time. A classifier trained on yesterday's t-SNE coordinates cannot interpret today's differently-rotated embedding.",
                  },
                  {
                    id: "c",
                    label: "Use t-SNE but add a calibration step to align embeddings across runs",
                    description: "Procrustes alignment can partially align two embeddings, but this is fragile and error-prone in production. Parametric UMAP or PCA are fundamentally more reliable solutions.",
                  },
                ],
                branches: {
                  a: "u4_terminal",
                  b: "u4_terminal",
                  c: "u4_terminal",
                },
                rationale: "Production ML requires stable feature spaces: new data must be embeddable into the same coordinate system the model was trained on. t-SNE is a global batch algorithm with no parametric mapping. UMAP (with parametric mode), PCA, or autoencoders all provide stable out-of-sample transformations suitable for production pipelines.",
              },
            },
          },
    knowledgeCheck: [
      {
        question: "What do t-SNE and UMAP primarily try to preserve when they map high-D data to 2D?",
        options: [
          "Local neighborhoods — points that were close in high-D stay close in 2D",
          "Exact pairwise distances between all points",
          "The global coordinate system of the original space",
        ],
        correctIndex: 0,
        explanation: "Both optimize for local neighbor relationships, deliberately sacrificing global distance and density fidelity — which is why they are visualization tools, not metric-preserving transforms.",
      },
      {
        question: "On a t-SNE plot, cluster A sits far from cluster B. What can you conclude?",
        options: [
          "Essentially nothing about how different A and B are — inter-cluster distances are not meaningful",
          "A and B are the two most dissimilar groups in the data",
          "A and B contain the same number of points",
        ],
        correctIndex: 0,
        explanation: "t-SNE optimizes local structure; the gaps and arrangement between clusters are largely arbitrary and must not be read as semantic distance.",
      },
      {
        question: "Roughly what does the perplexity parameter in t-SNE represent?",
        options: [
          "The number of output clusters t-SNE will produce",
          "The effective number of neighbors each point considers when building its high-D similarity",
          "The learning rate of the gradient descent",
        ],
        correctIndex: 1,
        explanation: "Perplexity sets the Gaussian bandwidth per point, i.e. how many neighbors it pays attention to; low values fragment, high values emphasize global structure.",
      },
      {
        question: "A blob on a t-SNE plot is twice the on-screen area of another. What does that imply about the underlying data?",
        options: [
          "Very little — t-SNE equalizes densities, so blob size and area do not reliably reflect sample count or spread",
          "It contains twice as many points",
          "It is twice as spread out in the original space",
        ],
        correctIndex: 0,
        explanation: "t-SNE distorts density and cluster size; relative area on the plot is not a reliable proxy for count or original variance.",
      },
      {
        question: "Which capability does UMAP offer that standard t-SNE does not?",
        options: [
          "It guarantees the global optimum of the embedding",
          "It requires no neighbor parameter",
          "It can transform new, unseen points using the fitted model without re-running the whole embedding",
        ],
        correctIndex: 2,
        explanation: "UMAP learns a reusable mapping (umap.transform), so new data can be projected; t-SNE has no out-of-sample extension and must be re-fit.",
      },
      {
        question: "Why is it recommended to run PCA (to ~50 dimensions) before t-SNE or UMAP?",
        options: [
          "It denoises the data, speeds up the nearest-neighbor search, and stabilizes the resulting embedding",
          "It converts the data to be perfectly Gaussian, which t-SNE requires",
          "It replaces the need for a perplexity parameter",
        ],
        correctIndex: 0,
        explanation: "A linear PCA pre-step removes noise dimensions and shrinks the input, making the costly neighbor computation faster and the embedding cleaner.",
      },
      {
        question: "You see crisp clusters at perplexity = 5 but they disappear at perplexity = 40. What is the safest interpretation?",
        options: [
          "Perplexity = 5 is always correct, so the clusters are real",
          "Structure that does not persist across settings may be an artifact; only trust clusters that survive multiple perplexities",
          "The data has exactly five clusters",
        ],
        correctIndex: 1,
        explanation: "Low perplexity can fragment even noise into apparent clusters. Robust structure persists as you vary the knob and the random seed.",
      },
      {
        question: "Why should t-SNE coordinates generally not be used as features for a downstream model?",
        options: [
          "They are non-deterministic, have arbitrary axes, and preserve only local structure — they are for visualization, not stable modeling features",
          "They are always perfectly correlated with the labels",
          "They are too high-dimensional to feed into a model",
        ],
        correctIndex: 0,
        explanation: "t-SNE is stochastic with no reusable mapping and arbitrary orientation; its 2D coordinates are meaningless as model inputs. UMAP, with transform, is a more defensible (still cautious) option.",
      },
    ],
  },
};
