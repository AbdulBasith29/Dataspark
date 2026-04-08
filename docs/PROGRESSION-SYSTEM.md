# DataSpark — Progression & Content System

## Lesson Content Structure

Every lesson is a **full module** (target **18–20 minutes** minimum engaged time — see `docs/CURRICULUM-SCOPE.md` §2.1). It is **not** acceptable to ship a single short page plus one widget; learners need read → watch or deep-dive → hands-on → check.

Every lesson is a layered experience with **5 content layers** plus the tutor:

### Layer 1: Written Concept Explanation (Original)
- Substantial, jargon-decoded tutorial: **1,200–2,000 words** for a typical lesson (see `CURRICULUM-SCOPE.md` §2.2)
- Written in conversational tone — "here's what this actually means"
- Multiple subheadings, at least one full worked example, pitfalls / “gotchas,” and key takeaways
- Format: markdown rendered in-app (scrollable **Learn** section — not a single card)

### Layer 2: Curated Video (Embedded YouTube)
- Hand-picked best video for this exact topic (timestamped segment when the full video is longer than needed)
- Priority channels: StatQuest (stats/ML), 3Blue1Brown (math/intuition), 
  Corey Schafer (Python), Tech With Tim (Python), sentdex (ML), 
  Fireship (quick overviews), CS Dojo (algorithms)
- **Fallback:** if no great video exists, replace with **original deep-dive prose + second worked example + timed “you try”** totaling ~3–6 minutes — do not omit this layer

### Layer 3: Interactive Element
- Code sandbox for Python/SQL topics (run code in browser)
- Interactive visualization for conceptual topics
- Drag-and-drop exercises for architectural topics
- "Fill in the blank" SQL/Python for quick practice
- Should include **guided prompts** so the learner spends **~4–6 minutes** actively manipulating, not passively watching

### Layer 4: Knowledge Check (Adaptive)
- **Required for mastery** when the lesson ships (2–3 questions minimum)
- 2-3 multiple choice or short answer questions tied to **this lesson’s** claims
- Must score 70%+ to "master" the lesson
- Failed checks suggest reviewing specific sections

### Layer 5: AI Tutor (Always Available)
- Floating button on every lesson page
- Scoped to the current course topic
- Can explain concepts, review code, answer "but why?"

---

## Progression System

### 1. Level-Gated Progression

Each course has a linear path with gates:

```
PYTHON FUNDAMENTALS
├── Module 1: Core Syntax (unlocked by default)
│   ├── Lesson 1.1: Variables & Types .............. ✅ Mastered
│   ├── Lesson 1.2: Strings & f-strings ............ ✅ Mastered
│   ├── Lesson 1.3: Lists, Tuples & Mutability ..... 🔓 In Progress
│   ├── Lesson 1.4: Dictionaries & Sets ............ 🔒 Locked
│   └── Lesson 1.5: Comprehensions ................. 🔒 Locked
│   └── [Module Quiz: 3 questions] ................ 🔒 Locked
│
├── Module 2: Control Flow (unlocks after Module 1 quiz)
│   ├── ...
│
├── Module 3: OOP (unlocks after Module 2 quiz)
│   ├── ...
│
└── Module 4: NumPy & Pandas (unlocks after Module 3 quiz)
    ├── ...
```

**Unlock Rules:**
- Lessons unlock sequentially within a module
- A lesson is "complete" when you've read the content (scrolled to bottom / marked done)
- A lesson is "mastered" when you pass the knowledge check (if one exists)
- Module quiz unlocks after all lessons in module are complete
- Next module unlocks after passing module quiz at 70%+
- Practice questions for a topic unlock when that lesson is completed

### 2. Cross-Course Prerequisite Map

```
Python Fundamentals ──────┬──► Machine Learning
                          │
SQL & Databases ──────────┤
                          │
Statistics & Probability ─┼──► Deep Learning ──► GenAI & LLMs
                          │
                          ├──► Product Sense & Cases
                          │
                          └──► System Design
                          
MLOps & Tools ← (recommended after ML, no hard gate)
Specialized AI ← (recommended after ML + DL, no hard gate)
```

**Gate Types:**
- **Hard gate:** Cannot access course until prerequisite is complete (at least 60% mastery)
- **Soft gate:** Can access but sees a warning: "We recommend completing X first"
- Python, SQL, Statistics = no prerequisites (entry points)
- ML = requires Python (hard) + Statistics (soft)
- Deep Learning = requires ML (hard)
- GenAI = requires Deep Learning (soft) + Python (hard)
- Product Sense = requires Statistics (soft)
- System Design = requires SQL (soft) + Python (soft)
- MLOps = all soft gates
- Specialized AI = all soft gates

### 3. Mastery Scoring

Each subtopic (e.g., "Window Functions" within SQL) has a mastery score:

```
Mastery Score = weighted average of:
  - Lesson completion: 20% (did you read/watch the content?)
  - Knowledge check: 30% (did you pass the post-lesson quiz?)
  - Practice questions: 50% (how did you score on related practice Qs?)
```

**Mastery Levels:**
- 0-29%: 🔴 Not Started / Needs Work
- 30-59%: 🟡 Learning
- 60-79%: 🟢 Proficient
- 80-100%: ⭐ Mastered

**Course-level mastery** = average of all subtopic mastery scores

**Overall mastery** = weighted average of all course mastery scores

### 4. Spaced Repetition Engine

Questions you get wrong enter the review queue:

```
REVIEW SCHEDULE:
  Day 0: Answer question, get it wrong
  Day 1: Question appears in "Review Queue" 
  Day 3: If answered correctly on Day 1, appears again
  Day 7: If answered correctly on Day 3, appears again
  Day 14: If answered correctly on Day 7, appears again
  Day 30: Final review — if correct, marked as "retained"
  
  If wrong at any stage: reset to Day 1
```

**Review Queue UI:**
- Dashboard shows: "You have 5 questions to review today"
- Review questions are mixed across courses
- Each review takes 5-10 minutes
- Streak counter: "7-day review streak 🔥"

---

## Lesson Data Schema

```javascript
{
  id: "ml-f2",
  courseId: "ml",
  moduleId: "ml-foundations",
  title: "Bias-Variance Tradeoff: The Core Tension",
  order: 2,  // position within module
  duration: "18-20 min",  // minimum module size; see CURRICULUM-SCOPE.md §2.1
  
  // Content layers
  content: {
    written: "markdown string with the full lesson text...",
    
    video: {
      url: "https://youtube.com/watch?v=EuBBz3bI-aA",
      channel: "StatQuest",
      title: "Bias and Variance",
      startTime: 0,  // seconds, for timestamped links
      duration: "6:24"
    },
    
    visualization: "BiasVariance",  // component name to render
    
    codeSandbox: null,  // or { language: "python", starterCode: "...", solution: "..." }
  },
  
  // Knowledge check (adaptive — only if questions exist)
  knowledgeCheck: [
    {
      question: "A model with high bias and low variance is likely:",
      options: ["Overfitting", "Underfitting", "Well-balanced", "Impossible to tell"],
      correct: 1,
      explanation: "High bias = too simple = underfitting. The model makes strong assumptions and misses patterns."
    },
    {
      question: "Which technique primarily addresses high variance?",
      options: ["Adding more features", "Regularization", "Removing training data", "Increasing model complexity"],
      correct: 1,
      explanation: "Regularization (L1/L2, dropout) penalizes complexity, reducing variance at the cost of slightly more bias."
    }
  ],
  
  // Prerequisites
  requires: ["ml-f1"],  // must complete this lesson first
  
  // Linked practice questions
  practiceQuestionIds: ["mlq2", "mlq3"],
  
  // Tags for search
  tags: ["bias-variance", "overfitting", "underfitting", "model-complexity"]
}
```

## Module Quiz Schema

```javascript
{
  moduleId: "ml-foundations",
  title: "ML Foundations Check",
  passingScore: 70,
  questions: [
    // Mix of multiple choice + short answer
    // 5-8 questions covering the module
    // Randomly sampled from a larger pool
  ],
  unlocksModule: "ml-supervised"  // next module
}
```

---

## UI Components for Progression

### Dashboard (Home Screen)
```
┌─────────────────────────────────────────┐
│  YOUR LEARNING PATH                      │
│                                          │
│  [Python] ████████████░░ 72% mastered    │
│  [SQL]    ██████░░░░░░░░ 45% mastered    │
│  [Stats]  ████░░░░░░░░░░ 30% mastered    │
│  [ML]     🔒 Complete Python + Stats      │
│  [DL]     🔒 Complete ML                  │
│                                          │
│  📋 Review Queue: 3 questions due today   │
│  🔥 5-day streak                          │
│                                          │
│  CONTINUE WHERE YOU LEFT OFF:            │
│  📐 Statistics > Hypothesis Testing       │
│  └─ Lesson: P-Values — What They Mean    │
└─────────────────────────────────────────┘
```

### Course Page (with progression)
```
┌─────────────────────────────────────────┐
│  🧠 MACHINE LEARNING          72% ████▓░│
│                                          │
│  Module 1: Foundations        ⭐ Mastered │
│  ├── ✅ Supervised vs Unsupervised       │
│  ├── ✅ Bias-Variance Tradeoff          │
│  ├── ✅ Train/Val/Test Split            │
│  ├── ✅ Feature Engineering             │
│  └── ✅ Module Quiz (92%)               │
│                                          │
│  Module 2: Supervised Learning  🟢 75%   │
│  ├── ✅ Linear Regression               │
│  ├── ✅ Logistic Regression             │
│  ├── 🔓 Decision Trees  ← CONTINUE     │
│  ├── 🔒 Random Forests                  │
│  ├── 🔒 Gradient Boosting              │
│  └── 🔒 Module Quiz                     │
│                                          │
│  Module 3: Unsupervised        🔒 Locked │
│  Module 4: Evaluation          🔒 Locked │
└─────────────────────────────────────────┘
```

### Lesson Page Layout
```
┌─────────────────────────────────────────┐
│ ← Back to ML > Supervised Learning       │
│                                          │
│ DECISION TREES                 18–20 min │
│ Splitting Criteria Visualized            │
│                                          │
│ ┌─ LEARN ─────────────────────────────┐ │
│ │                                      │ │
│ │ [Written explanation with diagrams]  │ │
│ │                                      │ │
│ │ ▶ VIDEO: StatQuest — Decision Trees  │ │
│ │   Josh Starmer · 8:12               │ │
│ │                                      │ │
│ │ [Interactive Visualization]          │ │
│ │ Drag the split point to see how      │ │
│ │ information gain changes...          │ │
│ │                                      │ │
│ └──────────────────────────────────────┘ │
│                                          │
│ ┌─ KNOWLEDGE CHECK ───────────────────┐ │
│ │ Q1: Which metric does CART use?      │ │
│ │ ○ Entropy  ○ Gini  ○ Both  ○ Neither│ │
│ └──────────────────────────────────────┘ │
│                                          │
│ ┌─ PRACTICE ──────────────────────────┐ │
│ │ 3 related questions available:       │ │
│ │ • Debug a Leaking Pipeline (Hard)    │ │
│ │ • Model Selection (Medium)           │ │
│ │ • Explain to the CEO (Easy)          │ │
│ └──────────────────────────────────────┘ │
│                                          │
│         [Mark Complete & Continue →]     │
│                                          │
│                            💬 Ask Tutor  │
└─────────────────────────────────────────┘
```

---

## Video Curation Database (Priority Channels)

### Statistics
| Topic | Video | Channel |
|-------|-------|---------|
| P-Values | "P-Values, clearly explained" | StatQuest |
| Normal Distribution | "Normal Distribution" | 3Blue1Brown |
| Bayes' Theorem | "Bayes theorem" | 3Blue1Brown |
| Hypothesis Testing | "Hypothesis Testing" | StatQuest |
| A/B Testing | "A/B Testing" | StatQuest |
| Confidence Intervals | "Confidence Intervals" | StatQuest |
| Chi-Squared | "Chi-Square Test" | StatQuest |
| ANOVA | "ANOVA" | StatQuest |

### Machine Learning
| Topic | Video | Channel |
|-------|-------|---------|
| Bias-Variance | "Bias and Variance" | StatQuest |
| Linear Regression | "Linear Regression" | StatQuest |
| Logistic Regression | "Logistic Regression" | StatQuest |
| Decision Trees | "Decision Trees" | StatQuest |
| Random Forest | "Random Forests" | StatQuest |
| XGBoost | "XGBoost" | StatQuest |
| K-Means | "K-Means Clustering" | StatQuest |
| PCA | "PCA" | StatQuest |
| ROC and AUC | "ROC and AUC" | StatQuest |
| Cross-Validation | "Cross Validation" | StatQuest |
| Gradient Descent | "Gradient Descent" | 3Blue1Brown |

### Deep Learning
| Topic | Video | Channel |
|-------|-------|---------|
| Neural Networks | "But what is a neural network?" | 3Blue1Brown |
| Backpropagation | "Backpropagation" | 3Blue1Brown |
| CNNs | "CNNs explained" | deeplizard |
| Transformers | "Attention is All You Need" | Yannic Kilcher |
| Attention | "Attention in transformers" | 3Blue1Brown |

### Python
| Topic | Video | Channel |
|-------|-------|---------|
| List Comprehensions | "List Comprehensions" | Corey Schafer |
| Generators | "Generators" | Corey Schafer |
| Decorators | "Decorators" | Corey Schafer |
| OOP | "OOP Tutorial" | Corey Schafer |
| Pandas | "Pandas Tutorial" | Corey Schafer |

### SQL
| Topic | Video | Channel |
|-------|-------|---------|
| JOINs | "SQL Joins" | Web Dev Simplified |
| Window Functions | "SQL Window Functions" | techTFQ |
| CTEs | "Common Table Expressions" | techTFQ |

---

## Content Roadmap

### Phase 1: MVP (Curated + Skeleton)
- **Lesson modules:** Every shipped lesson follows the **18–20 minute** structure in `docs/CURRICULUM-SCOPE.md` §2.1 (Learn → Watch or deep-dive → Try → Check), not a single interactive-only page.
- **Written lessons:** **1,200–2,000 words** for spine / priority topics; shorter placeholders only where explicitly marked “draft” in the catalog (and still must include all layers with stub copy to validate UX).
- Videos: curated YouTube embeds (timestamped) or **video-fallback** deep-dive block per Layer 2 rules above
- Visualizations: 3 done, 7 more priority ones; each embedded in a full lesson flow
- Code sandbox: embed via iframe (Replit, CodeSandbox, or Judge0 API)
- Knowledge checks: **2–3 questions per lesson** where the lesson ships as learner-ready

### Phase 2: Depth
- Written lessons: bring **all** catalog lessons up to **1,200–2,000 words** and verify real **18–20 min** engaged time with analytics or internal timing
- Original content: record videos for topics with no good YouTube coverage
- Code sandbox: custom built-in editor with test cases
- More visualizations: target 30 total

### Phase 3: Polish
- Adaptive difficulty in knowledge checks
- Personalized learning path recommendations based on weak areas
- Social features: leaderboards, study groups
- Mobile-optimized reading experience
