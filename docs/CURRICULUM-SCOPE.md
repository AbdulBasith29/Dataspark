# DataSpark — Curriculum scope & lesson depth

This document addresses two gaps: **breadth** (data science is wide; learners need a clear map) and **depth** (each lesson should feel like a real tutorial, not a bullet list plus a viz).

It complements `docs/ARCHITECTURE.md`, `docs/PROGRESSION-SYSTEM.md`, and `docs/AGENT-TASKS.md`. Question banks and tutors should trace back to the **subtopic IDs** below so filtering, mastery, and search stay coherent.

---

## 1. Design principles

1. **Spine + spokes** — Every course has a **core spine** (must-know for interviews and day-one jobs) and **spoke** modules (specializations: time series, causal inference, recsys, etc.) marked optional or “level up.”
2. **Same lesson skeleton everywhere** — Predictable structure reduces cognitive load; depth comes from content, not from reinventing the page layout each time.
3. **Written first, viz as proof** — The interactive visualization should answer “what actually happens when I change X?” after prose has defined terms and notation.
4. **Interview and job hooks** — Each lesson ends with “what you might be asked” and “how this shows up in work” (even one short paragraph each).

---

## 2. Standard lesson content spec (written + interactive)

### 2.1 Minimum module length (18–20 minutes)

A **lesson** is a full **module**, not a single screen with one widget. Target **18–20 minutes minimum engaged time** (read + watch/listen + interact + check). Shipping a lesson that is only “one interactive or page” **does not meet** the bar.

**Approximate time budget (design target):**

| Segment | Target minutes | Notes |
|---------|----------------|--------|
| Read — structured written tutorial | **8–12** | Multiple headings; worked example + pitfalls; not a wall of text |
| Watch — curated clip (or equivalent) | **3–6** | Timestamped segment when possible; if no video, replace with **extra worked walkthrough + “you try”** of similar length |
| Interact — viz / sandbox / structured exercise | **4–6** | Deliberate prompts (“change X, predict Y, then reveal”); not passive staring |
| Check — knowledge check | **3–5** | 2–3 items tied to this lesson’s claims |
| **Total** | **18–20** | Fast readers still should spend time in **Interact** + **Check** |

**Anti-pattern:** One short blurb + one viz with no reading depth, no check, and no time for reflection.

### 2.2 Written depth

Target **1,200–2,000 words** of primary prose for a standard lesson (synthesis or capstone lessons may go longer). That range supports the read-time portion of §2.1 together with headings, examples, and callouts.

Each lesson should include:

| Block | Purpose | Guidance |
|--------|---------|----------|
| **Outcome** | Learner knows success criteria | 2–4 bullets: “After this you can …” |
| **Motivation** | Why this matters in product / ML / data eng | Real constraint (latency, cost, fairness, messy data) |
| **Concepts** | Definitions, notation, common variants | Use subheadings; avoid wall of text |
| **Worked example** | Step-by-step, preferably with numbers or small tables | Walk through one full path; call out decisions |
| **Pitfalls & checks** | “Looks right but wrong” cases | 3–5 bullets; tie to bugs in interviews |
| **Visualization** | Intuition + exploration | Linked component id; 2–4 sentences on what to drag/click |
| **Mini exercise** | Active recall | Short prompt (no full IDE required unless course is code-first) |
| **Stretch** | Optional depth | Links to spoke topics or “read when you need X” |
| **Interview / on-the-job** | Transfer | 1 short paragraph each |

**Tutorial feel:** At least one **“slow path”** subsection (e.g. “Do this by hand once” or “Trace this query row by row”) before the shortcut or API call.

**Knowledge checks** (per `PROGRESSION-SYSTEM.md`): 2–3 items that reference **specific claims** from the written section, not generic trivia.

**Lesson manifests** should expose `duration: "18–20 min"` (or a numeric `durationMinutes: 20`) so the UI sets expectations and we can audit compliance.

---

## 3. Subtopic map (expanded)

Use these as `topicId` / module anchors for lessons, questions, and tutor scope. Names follow `{course-prefix}-{theme}`.

### 3.1 Python (`python`)

| Module id | Themes (lessons sit under these) |
|-----------|-----------------------------------|
| `py-basics` | Types, mutability, strings, collections, comprehensions, modules, packaging basics |
| `py-control` | Functions, scope, exceptions, iterators, generators, decorators, context managers |
| `py-oop` | Classes, dataclasses, protocols, testing, fixtures |
| `py-ds` | NumPy broadcasting, Pandas indexing, merges, groupby, time basics, performance |
| `py-io` | Files, CSV/Parquet, JSON, logging, CLI argparse, env config |
| `py-async` *(spoke)* | asyncio, batching APIs, backpressure |
| `py-sql-bridge` *(spoke)* | DB-API, SQLAlchemy patterns, parameterization |

### 3.2 SQL & databases (`sql`)

| Module id | Themes |
|-----------|--------|
| `sql-fundamentals` | SELECT, WHERE, ORDER, LIMIT, NULL semantics |
| `sql-joins` | INNER/LEFT/RIGHT/FULL, multi-key joins, join order intuition |
| `sql-aggregation` | GROUP BY, HAVING, DISTINCT, filtering aggregates |
| `sql-subqueries` | IN, EXISTS, correlated subqueries, semi/anti joins |
| `sql-window` | PARTITION BY, ORDER BY frames, LAG/LEAD, running totals |
| `sql-cte` | CTEs, recursion limits, readability vs performance |
| `sql-modeling` | Normal forms, keys, indexes, star/snowflake intro |
| `sql-performance` | Explain plans, selective predicates, sargable conditions |
| `sql-modern` *(spoke)* | Warehouses (BigQuery/Snowflake/Redshift patterns), dbt mental model |

### 3.3 Statistics & probability (`statistics`)

| Module id | Themes |
|-----------|--------|
| `stat-foundations` | Descriptive stats, plots, robust measures |
| `stat-probability` | Bayes, expectations, common distributions |
| `stat-inference` | CI, tests, power, multiple testing, sequential pitfalls |
| `stat-regression` | Linear models, diagnostics, regularization intuition |
| `stat-causal` *(spoke)* | Confounding, DAG intuition, diff-in-diff intro |
| `stat-applied` | Bootstrapping, simulation, reporting to stakeholders |

### 3.4 Machine learning (`ml`)

| Module id | Themes |
|-----------|--------|
| `ml-foundations` | Supervised vs unsupervised, bias–variance, splits, leakage |
| `ml-preprocessing` | Imputation, encoding, scaling, pipelines |
| `ml-supervised-linear` | Linear/logistic regression, calibration basics |
| `ml-supervised-trees` | Trees, forests, interpretability |
| `ml-supervised-boosting` | GBDT, learning rate, early stopping |
| `ml-unsupervised` | K-means, hierarchical, clustering validation |
| `ml-dimred` | PCA, use cases and misuse |
| `ml-evaluation` | Metrics, ROC/PR, thresholds, cost-sensitive decisions |
| `ml-imbalance` | Class weights, resampling, precision–recall framing |
| `ml-timeseries` *(spoke)* | Baselines, seasonality, leakage in time |
| `ml-recsys` *(spoke)* | CF, cold start, evaluation |

### 3.5 Deep learning (`deep-learning`)

| Module id | Themes |
|-----------|--------|
| `dl-foundations` | Tensors, autodiff intuition, MLP, activations |
| `dl-training` | Optimizers, schedules, batch norm, dropout |
| `dl-cnn` | Convolutions, pooling, transfer learning |
| `dl-sequences` | RNN/LSTM/GRU when they still matter |
| `dl-transformers` | Attention, positional encoding, scaling |
| `dl-nlp` *(spoke)* | Tokenization, embeddings, seq2seq |
| `dl-vision` *(spoke)* | Augmentation, detection/segmentation overview |
| `dl-efficient` *(spoke)* | Distillation, quantization awareness (conceptual) |

### 3.6 GenAI & LLMs (`genai`)

| Module id | Themes |
|-----------|--------|
| `genai-foundations` | Tokens, context windows, sampling, stop sequences |
| `genai-prompting` | System vs user, few-shot, chain-of-thought tradeoffs |
| `genai-rag` | Chunking, retrieval metrics, grounding failures |
| `genai-tools` | Function calling, agents vs workflows |
| `genai-safety` | PII, jailbreak basics, eval harnesses |
| `genai-ops` *(spoke)* | Latency/cost, caching, observability |

### 3.7 Product sense & cases (`product-sense`)

| Module id | Themes |
|-----------|--------|
| `ps-metrics` | North stars, guardrails, funnel math |
| `ps-experimentation` | Design, ethics, interpreting lifts |
| `ps-tradeoffs` | Speed vs quality, exploration vs exploitation framing |
| `ps-estimation` | Fermi, sizing markets, sanity checks |
| `ps-communication` | Exec summaries, pushing back on bad metrics |
| `ps-cases` | Root-cause drills, metric debug narratives |

### 3.8 System design (`system-design`)

| Module id | Themes |
|-----------|--------|
| `sd-data-pipelines` | Batch vs stream, idempotency, SLAs |
| `sd-storage` | Lake vs warehouse, partitioning, formats |
| `sd-serving` | Online vs offline features, latency budgets |
| `sd-ml-system` | Training vs inference, monitoring, rollback |
| `sd-reliability` | Backfills, deduplication, exactly-once vs at-least-once |
| `sd-security` *(spoke)* | IAM patterns, secrets, PII boundaries |

### 3.9 MLOps, cloud & tools (`mlops`)

| Module id | Themes |
|-----------|--------|
| `mlops-core` | Versioning (data, model, code), reproducibility |
| `mlops-ci` | Tests for data and models, gates |
| `mlops-deployment` | Containers, APIs, batch scoring |
| `mlops-monitoring` | Drift, performance, alerting playbooks |
| `mlops-cloud` | Managed services map (high level) |
| `mlops-collab` | Git workflows, reviews, notebooks vs prod |

---

## 4. Volume targets (so “comprehensive” is operational)

These are **planning targets**, not hard gates for every MVP slice.

### 4.1 Why a band (e.g. SQL 34–45)?

Interview- and job-ready **SQL** is not “learn SELECT once”—learners need repeated exposure across **NULL semantics, joins, aggregates vs detail, subqueries/EXISTS, windows, CTEs/readability, basic modeling, and explain/performance intuition**. In practice, **roughly 34–45** distinct, well-tagged problems is a reasonable **mastery** band: enough for 2–4 questions per core module without padding, plus a few spokes (e.g. warehouse/dbt-style). Fewer than ~30 tends to leave holes; beyond ~45 returns diminishing value unless you add specialized spokes (e.g. advanced analytics SQL).

Other courses can use similar reasoning; SQL is called out explicitly because it is the most common “breadth without depth” failure mode.

| Course | Core spine lessons (min) | Spoke lessons (optional) | Practice questions (from `AGENT-TASKS`) |
|--------|---------------------------|---------------------------|------------------------------------------|
| Python | 18 | +6 | 40+ |
| SQL | 14 | +5 | **34–45** (mastery band) |
| Statistics | 16 | +4 | 40+ |
| ML | 18 | +6 | 40+ |
| Deep learning | 9 | +5 | 25+ |
| GenAI | 9 | +4 | 25+ |
| Product sense | 10 | +4 | 30+ |
| System design | 8 | +3 | 20+ |
| MLOps | 12 | +4 | 25+ |

**Rule of thumb:** Each **core** lesson maps to **at least 2–4** tagged practice questions and **either** one primary visualization **or** an explicitly justified “prose + table + query plan” substitute (e.g. some product-only cases).

---

## 5. Agent / content ownership

| Agent / role | Responsibility |
|----------------|----------------|
| **curriculum-agent** | Question banks covering every **core** module; tags align with `topicId`s above |
| **lesson-content** (human or agent) | Markdown (or CMS) per lesson following §2; stored where frontend loads lesson bodies |
| **viz-agent** | Components referenced by `content.visualization` in lesson schema |
| **chatbot-agent** | System prompts list the same module ids as the tutor’s scope |

---

## 6. Next implementation steps (engineering)

1. Add **`src/data/lessons/`** (or `content/lessons/`) manifests: one file per course listing `id`, `courseId`, `topicId`, `title`, `order`, **`duration` / `durationMinutes` (18–20 min module)**, `content` refs, `visualization`, `practiceQuestionIds`.
2. Extend **`LessonPage.jsx`** to render long-form markdown (headings, callouts, code) in **sections** (Learn → Watch/Deep dive → Try → Check), embed the viz by id, and surface the duration badge — not a single undifferentiated block.
3. Backfill **high-traffic spine lessons first** (SQL joins/windows, ML evaluation/leakage, stats inference, GenAI RAG).

---

## Revision

When you add a new spoke module, update this file **and** the corresponding tutor prompt so scope stays aligned.
