/**
 * Full lesson modules: Learn (long-form) → Watch / deep dive → Try → Knowledge check.
 * Aligns with docs/CURRICULUM-SCOPE.md §2. Lessons without an entry use buildFallbackModule().
 */

export const MODULE_TIME_LABEL = "18–20 min";

const FALLBACK_CHECKS = [
  {
    question: "After this module, what is the best next step for retention?",
    options: [
      "Attempt related questions in the Practice tab and explain your reasoning out loud",
      "Skip practice until the night before an interview",
      "Only re-read the title of the lesson",
    ],
    correctIndex: 0,
    explanation: "Spaced practice with explanation beats passive re-reading for interviews and on the job.",
  },
  {
    question: "If a definition still feels fuzzy, what should you use first?",
    options: [
      "The course AI tutor, scoped to this topic",
      "A random web search with no structure",
      "Assume you will figure it out in the interview",
    ],
    correctIndex: 0,
    explanation: "The tutor is grounded in this curriculum; use it to unblock before drifting off-scope.",
  },
  {
    question: "Why does DataSpark pair long-form text with an interactive block?",
    options: [
      "Prose defines terms and traps; interaction lets you test predictions before memorizing syntax",
      "So the page loads slower",
      "Because video alone is always sufficient",
    ],
    correctIndex: 0,
    explanation: "Intuition first (predict), then verify (drag/slide/query) — the same loop strong interviewers probe.",
  },
];

function fallbackLearn(lesson, courseTitle) {
  return `## Outcomes

- Place **${lesson.title}** in a realistic data workflow (${courseTitle}).
- Spot the **failure modes** hiring managers and senior ICs ask about.
- Know **exactly** what to drill next: Practice tab + tutor, not passive scrolling.

## Why this block exists

Shipped modules in DataSpark target **${MODULE_TIME_LABEL}** of engaged time: read, watch or deep-dive, interact, then check. This lesson does not yet have a bespoke narrative in \`lesson-modules.js\`; treat this page as a **structured shell** while we expand content.

## Slow path (5 minutes)

Write, on paper or in a notes app:

1. **When** does this concept show up before modeling or shipping SQL?
2. **What** breaks if you misunderstand it (bad joins, wrong cohort, leakage, wrong index)?
3. **How** would you explain it in **two sentences** to a PM?

## Pitfalls (generic but real)

- **Treating the interactive as the whole lesson** — it is the *check* on your mental model, not the syllabus.
- **Skipping the knowledge check** — it is low-stakes practice for the “explain tradeoffs” part of interviews.
- **Memorizing syntax without a story** — interviewers pivot to *why* and *when*.

## Interview hook

Expect variations of: “Tell me about a time this went wrong in production” or “How would you validate that result?” Tie your answer to **business impact** (revenue, trust, latency), not only correctness.`;
}

function fallbackDeepDive(lesson) {
  return `## Deep dive until a curated clip ships

Turn this into an active exercise:

1. Open the **Practice** tab and pick **one** question tagged near this topic.
2. Before you write a solution, **predict** the shape of the output (rows/columns or model behavior).
3. Solve, then **diff** your prediction vs reality — that gap is what to rehearse aloud.

If there is no exact tag match, ask the **AI tutor**: “Give me a 5-minute drill on ${lesson.title} with a rubric.”`;
}

/** @typedef {{ question: string, options: string[], correctIndex: number, explanation: string }} CheckQ */

/** @typedef {{
 *   durationLabel?: string,
 *   outcomes?: string[],
 *   learnMarkdown: string,
 *   video?: { youtubeId: string, title: string, channel: string, startSeconds?: number } | null,
 *   videoFallbackMarkdown: string,
 *   tryGuidance: string,
 *   knowledgeCheck: CheckQ[],
 * }} LessonModuleSpec */

/** @type {Record<string, LessonModuleSpec>} */
export const LESSON_MODULES = {
  "sq-b2": {
    durationLabel: MODULE_TIME_LABEL,
    outcomes: [
      "Predict join cardinality (1:1, 1:N, N:M) before you run a query.",
      "Choose INNER vs LEFT vs FULL with NULL semantics in mind.",
      "Explain to a PM why a report row count “exploded” after a join.",
    ],
    learnMarkdown: `## Outcomes

You will read **row-by-row** how SQL joins combine tables, when duplicates appear, and why **LEFT** is the default empathy join for messy real-world data.

## Motivation (Shopify-flavored)

You are building a **merchant revenue** report. You have \`orders\` (one row per order) and \`merchants\` (one row per shop). The PM wants “revenue by merchant name.” The moment you join, three things bite you:

- **Missing merchants** (orphan \`merchant_id\`) → rows disappear with INNER.
- **Duplicate keys** on the dimension side → revenue **double-counts**.
- **Timezone / status filters** applied in the wrong clause → correct SQL, wrong story.

## Concepts: what a join really does

A join is **not** magic; it is a nested loop with rules you chose.

- **INNER JOIN**: keep only pairs where the predicate matches. No match on either side → row dropped.
- **LEFT JOIN**: keep **every** row from the **left** table. If no partner on the right, right-side columns are **NULL**.
- **RIGHT JOIN**: mirror of LEFT; most teams rewrite as LEFT for consistency.
- **FULL OUTER JOIN**: keep unmatched rows from **both** sides; rare in dashboards, useful for reconciliation (“what is only in A / only in B?”).

## Slow path — trace by hand

**Tables (tiny):**

\`merchants\`: (id, name) → (1, Ada), (2, Bob)

\`orders\`: (id, merchant_id, amount) → (101, 1, 50), (102, 1, 50), (103, 99, 20)  ← 99 is bogus FK

**INNER JOIN** \`orders\` to \`merchants\` on \`merchant_id = merchants.id\`:

- Row 101 matches Ada → keep.
- Row 102 matches Ada → keep.
- Row 103 has **no** merchant 99 → **dropped**.

So INNER silently **hides bad data**. That is sometimes what you want in a **trusted** pipeline; often it is **not** what you want when auditing.

**LEFT JOIN** the same:

- Rows 101, 102 → Ada, amounts 50, 50.
- Row 103 → **NULL** merchant name, amount 20. You can now **count orphans** in a QA query.

## Pitfalls that interviewers love

- **Joining on the wrong grain** — joining a daily rollup to a line-item table without thinking → fan-out.
- **Filtering on an outer join in WHERE** — \`WHERE right.col = 5\` turns your LEFT into an INNER for those predicates. Put predicates in **ON** or use careful NULL logic.
- **Assuming 1:1** — analytics dimensions are almost never perfectly clean.

## Worked example (narrative)

You need “orders with merchant name.” Start **LEFT** from \`orders\` if revenue truth lives there and you refuse to drop orphan rows quietly. Aggregate **after** you understand duplicates: \`SUM(amount)\` per \`merchant_id\` **before** joining names if names are unique per id.

## On-the-job hook

When a stakeholder says “the dashboard is wrong,” the first SQL question is often: **“Did a join multiply rows?”** The second is: **“Did an INNER hide NULL keys?”**

## What you might be asked

- “Why did row counts jump after I added a table?”
- “When do you use LEFT vs INNER in a pipeline?”
- “How do you detect duplicate keys in a dimension?”`,

    video: {
      youtubeId: "p3qvj9hO_Bo",
      title: "Learn SQL in 60 Minutes (joins segment)",
      channel: "Web Dev Simplified",
      startSeconds: 2460,
    },
    videoFallbackMarkdown: `## If the embed is blocked

Open **Web Dev Simplified — Learn SQL in 60 Minutes** and jump to the **joins / INNER vs LEFT** chapter (~41:00). Pause after each diagram and **sketch** which rows survive vs become **NULL**.`,

    tryGuidance: `In the lab below, switch join types and watch which rows stay, which become **NULL**, and how the **result grid** matches the predicate. Before each click, **predict** the row count delta.`,

    knowledgeCheck: [
      {
        question: "You LEFT JOIN orders to merchants on merchant_id. A row in orders has merchant_id = NULL. What happens to that row?",
        options: [
          "It appears in the result with NULLs for merchant columns",
          "It is dropped because NULL never equals NULL in join predicates",
          "The database throws an error",
        ],
        correctIndex: 0,
        explanation: "LEFT preserves left rows; join predicate may fail to match, so right-side columns are NULL. (NULL = NULL is unknown, not true — the row still stays on the left.)",
      },
      {
        question: "Your revenue total doubled after joining a merchants table. What is the most common root cause?",
        options: [
          "Duplicate keys on the merchant side (one merchant_id maps to many merchant rows)",
          "Using LEFT JOIN instead of INNER JOIN",
          "Aliasing a column with AS",
        ],
        correctIndex: 0,
        explanation: "Join fan-out / duplicate dimension keys multiply fact rows — classic analytics bug.",
      },
      {
        question: "You want a QA report: all orders including those with invalid merchant_id. Which join pattern from orders → merchants is the usual choice?",
        options: [
          "LEFT JOIN merchants so orphan orders survive with NULL merchant fields",
          "INNER JOIN merchants to hide bad rows",
          "CROSS JOIN merchants to maximize rows",
        ],
        correctIndex: 0,
        explanation: "LEFT from facts keeps orphans visible for data-quality work; INNER hides them.",
      },
    ],
  },

  "py-b3": {
    durationLabel: MODULE_TIME_LABEL,
    outcomes: [
      "Explain mutability for list vs tuple vs string with id()/is examples.",
      "Predict bugs from shared references (aliases) in nested structures.",
      "Defend immutability choices in interview system-design snippets.",
    ],
    learnMarkdown: `## Outcomes

You will stop hand-waving “mutable vs immutable” and instead tie it to **identity**, **aliasing**, and **why pandas copies hurt**.

## Motivation (Airbnb-style listing pipeline)

Two engineers share a helper that “cleans” a nested dict of listing attributes. One mutates the dict in place; the other assumes callers still have the old snapshot. Production symptom: **ghost updates** in a batch job — impossible to grep because the object id never changed.

## Concepts

- **Mutable**: object **in place** can change; same \`id()\` after “update.”
- **Immutable**: operations return **new** objects; old references see old values.
- **Aliasing**: two names, **one** object — \`a = []; b = a; b.append(1)\` → \`a\` is \`[1]\`.

## Slow path

Run this mental model for **lists**: \`x = [1, 2]\`, then \`y = x\`, then \`y += [3]\` (in-place extend). Both \`x\` and \`y\` show \`[1, 2, 3]\` — **one** list object.

Contrast with a **tuple** \`t = (1, 2)\`: there is no append-in-place; \`t + (3,)\` builds a **new** tuple and leaves \`t\` unchanged.

## Pitfalls

- **Default mutable args** — \`def f(items=[])\` is a famous footgun; shared list across calls.
- **Shallow vs deep copy** — \`copy.copy\` of nested lists still shares inner lists.
- **Equality vs identity** — \`==\` vs \`is\`; interviews mix them on purpose.

## Tuple “immutability” caveat

A tuple holding a **list** is immutable **as a tuple**, but the **list inside** can still mutate. Senior interviewers check whether you say “immutable all the way down.”

## Interview / on-the-job

- “When would you return a tuple vs a frozen dataclass vs a dict?”
- “How do you debug a function that mutates shared config?”

Connect answers to **thread safety**, **hashability** (dict keys), and **reasoning about side effects**.`,

    video: {
      youtubeId: "W8KRzm-HUcc",
      title: "Python Tutorial: Lists, Tuples, and Sets",
      channel: "Corey Schafer",
      startSeconds: 0,
    },
    videoFallbackMarkdown: `## Curated clip (search)

Look up **Corey Schafer — Python mutable vs immutable** (or your favorite Python fundamentals channel). After the list/tuple segment, pause and write **three** examples of aliasing bugs in ETL configs or nested dicts.

This module still ships a full **written** walkthrough and the mutability lab — the clip deepens voice and pacing.`,

    tryGuidance: `Use the mutability lab below: change inputs and watch how **shared references** and **new objects** differ. Predict the outcome **before** each change.`,

    knowledgeCheck: [
      {
        question: "After `a = []; b = a; b.append(1)`, what is `a`?",
        options: ["[1] — same object as b", "[] — b was a copy", "[1, 1] — append duplicates"],
        correctIndex: 0,
        explanation: "b aliases a; list.append mutates in place.",
      },
      {
        question: "Which type is safe as a dict key in the usual CPython interview sense (hashable, stable if you respect constraints)?",
        options: ["tuple (if contents are hashable)", "list", "set"],
        correctIndex: 0,
        explanation: "Lists and sets are mutable/unhashable; tuples can be keys when their elements are hashable.",
      },
      {
        question: "Why is `def f(x, items=[])` dangerous?",
        options: [
          "The default list is created once and shared across calls",
          "Python forbids empty lists as defaults",
          "It always raises SyntaxError",
        ],
        correctIndex: 0,
        explanation: "Default arg objects are created at function definition time — shared mutable state.",
      },
    ],
  },

  "ml-f2": {
    durationLabel: MODULE_TIME_LABEL,
    outcomes: [
      "Describe bias vs variance using the train error vs test error story.",
      "Pick levers (model complexity, regularization, data) for a given symptom.",
      "Avoid confusing bias/variance with software bias (fairness) without nuance.",
    ],
    learnMarkdown: `## Outcomes

You will use **bias–variance** as a language for **underfitting vs overfitting**, not as buzzwords.

## Motivation (Netflix ranking)

A team ships a huge model. Training metrics look incredible; online lift is flat or negative. Leadership asks: “Is it **variance** (we memorized noise) or **bias** (we never had enough capacity to pick up the effect)?” Your answer steers regularization, data fixes, and whether to restart feature work.

## Concepts (intuition)

- **Bias**: structured error — model family is too simple to fit the real pattern → **train and test** both suffer.
- **Variance**: sensitivity to training sample — **train great, test poor**; small data changes swing predictions wildly.
- **Irreducible error**: noise you cannot model away; sets a floor.

Think **flexibility dial**: more flexible → lower bias, higher variance (usually).

## Slow path — diagnose from errors

Fill this table from memory after reading:

| Symptom | Likely diagnosis | First lever |
|--------|-------------------|-------------|
| High train, high test | ? | ? |
| Low train, high test | ? | ? |

**Answers:** (1) **High bias** — add features / complexity / better functional form. (2) **High variance** — regularize, more data, ensembles, dropout (DL), simpler model.

## Pitfalls

- **Chasing train AUC** alone — classic variance trap.
- **One split** — always sanity-check with cross-validation when data is small.
- **Leakage** masquerading as “low bias” — looks like magic until deploy.

## Fairness clarification

In ML fairness, “bias” means **systematic harm** — different term, same English word. In interviews, **disambiguate**: “Do you mean estimation bias or social bias?”

## Interview questions

- “Draw the U-shaped risk curve vs complexity.”
- “What happens if we collect 10× more diverse data but keep the same model?”

Tie answers to **which error component** moves and **why**.`,

    video: {
      youtubeId: "EuBBz3bI-aA",
      title: "Bias and Variance",
      channel: "StatQuest",
      startSeconds: 0,
    },
    videoFallbackMarkdown: `## Deep dive without video

Sketch **two** curves: train error vs complexity, test error vs complexity. Mark the **sweet spot**. Then write one sentence: “If we regularize harder, we trade ___ for ___.”`,

    tryGuidance: `Drag **model complexity** in the lab: watch **bias**, **variance**, and **total error** move. Before moving the slider, predict which curve rises first when you go **too simple** vs **too complex**.`,

    knowledgeCheck: [
      {
        question: "Train error is high and test error is also high. What is the usual diagnosis?",
        options: ["High bias (underfitting)", "High variance (overfitting)", "Perfect generalization"],
        correctIndex: 0,
        explanation: "Underfitting hurts both train and test; the model is too simple or mis-specified.",
      },
      {
        question: "Train error is low but test error is high. What is the usual diagnosis?",
        options: ["High variance (overfitting)", "High bias", "Irreducible error only"],
        correctIndex: 0,
        explanation: "Memorizing training noise without generalizing is the variance story.",
      },
      {
        question: "Which lever primarily targets high variance in classical ML?",
        options: ["Stronger regularization or more training data", "Removing all regularization", "Always switching to a linear model regardless of signal"],
        correctIndex: 0,
        explanation: "Regularization and more data reduce sensitivity to the sample; the third is not a rule.",
      },
    ],
  },
};

/**
 * @param {{ id: string, title: string, duration?: string, hasViz?: boolean }} lesson
 * @param {{ id: string, title: string }} course
 * @returns {LessonModuleSpec}
 */
export function getResolvedLessonModule(lesson, course) {
  const spec = LESSON_MODULES[lesson.id];
  if (spec) return spec;

  return {
    durationLabel: MODULE_TIME_LABEL,
    outcomes: [
      `Explain **${lesson.title}** in two sentences`,
      "Connect the idea to a product or pipeline failure mode",
      "Drill with Practice + tutor until you can teach it",
    ],
    learnMarkdown: fallbackLearn(lesson, course.title),
    video: null,
    videoFallbackMarkdown: fallbackDeepDive(lesson),
    tryGuidance: lesson.hasViz
      ? "Use the interactive lab in the **Try it** section: change one control at a time and narrate what moved before you read the label text."
      : "No primary visualization is mapped for this lesson yet. Use **Practice** questions and the tutor to simulate the same predict→verify loop.",
    knowledgeCheck: FALLBACK_CHECKS,
  };
}
