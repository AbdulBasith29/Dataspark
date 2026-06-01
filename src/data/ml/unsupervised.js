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
