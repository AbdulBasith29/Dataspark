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
  "py-b1": {
    durationLabel: MODULE_TIME_LABEL,
    outcomes: [
      "Explain the **name → object** binding model (variables are labels, not boxes).",
      "Predict when code **mutates** an object vs **rebinds** a name (and why that matters in pipelines).",
      "Use `id()`, `type()`, `is`, and `==` correctly to debug identity, aliasing, and None checks.",
      "Write boundary-safe code: **parse early, validate once**, and make contracts explicit with type hints.",
    ],
    learnMarkdown: `## The mental model (the one that prevents ghost bugs)

In Python, a “variable” is not a box that holds a value. It is a **name** bound to an **object**.

That single model explains:

- Why \`b = a\` creates **aliasing** (two names, one object)
- Why mutability creates “ghost changes”
- Why \`is\` is not the same as \`==\`
- Why “copying” is not always copying

### Objects have three important properties

- **Identity**: which exact object is this? (\`id(x)\`)
- **Type**: what operations are valid? (\`type(x)\`)
- **Value / state**: the data the object represents (varies by type)

> In CPython, \`id(x)\` often corresponds to a memory address. Treat it as a **debugging tool**, not a stable cross-run contract.

---

## Rebinding vs mutation (the core distinction)

### Rebinding: the name points to a different object

\`\`\`
x = 10
before = id(x)
x = x + 1
\`\`\`

Integers are immutable. \`x = x + 1\` **creates a new object** and rebinds \`x\`.

### Mutation: the object stays the same, its state changes

\`\`\`
a = [1, 2, 3]
before = id(a)
a.append(4)
\`\`\`

Lists are mutable. \`append\` mutates the existing object; \`id(a)\` stays the same.

### Aliasing: two names, one object

\`\`\`
a = []
b = a
b.append(1)
\`\`\`

Both \`a\` and \`b\` refer to the same list — a frequent cause of “it changed somewhere else” bugs.

---

## Equality vs identity: \`==\` vs \`is\`

- **\`==\`**: “Do these have the same value?”
- **\`is\`**: “Are these the same object?”

\`\`\`
a = [1, 2]
b = [1, 2]
a == b   # True
a is b   # False
\`\`\`

### The only default use of \`is\` you should reach for

\`\`\`
if x is None:
    ...
\`\`\`

Use \`is None\` for sentinel checks. Avoid \`x is 1000\` style comparisons (interning can make them “work” until they don’t).

---

## Types in Python: dynamic at runtime, disciplined in teams

Python is **dynamically typed**: objects have types at runtime; names can be rebound to any object.

\`\`\`
x = 5
x = "now a string"
\`\`\`

This speeds iteration, but production systems demand discipline at boundaries:

- env vars are strings
- JSON has missing keys and \`null\`
- CSV dtypes drift
- APIs evolve shapes

---

## Type hints: not enforcement — leverage

Type hints do **not** enforce runtime behavior. Their job is to make code:

- easier to review (“what shape is this?”)
- safer to refactor
- easier to test
- easier to use correctly (autocomplete + tooling)

### The senior rule: Parse early, validate once

Take untrusted input (env/JSON/config) and convert it into a clean, explicit internal shape. After that, your core logic should not keep re-checking types everywhere.

---

## Common failure modes (real bugs, not trivia)

- **Missing vs None**: missing key (\`k not in d\`) is different from present-but-empty (\`d[k] is None\`)
- **Truthiness-as-validation**: \`if user_id:\` breaks when 0 / "" are valid values
- **Aliasing in nested structures**: accidental shared lists/dicts across records
- **The mutable default argument footgun**: \`def f(x, to=[])\` creates shared state across calls

---

## Interview hook (answer like a senior)

“In Python, variables are bindings to objects. Most subtle bugs come from aliasing and unintended mutation. I use \`is None\` for sentinel checks, \`==\` for value equality, and I validate/normalize inputs at boundaries so core logic stays predictable.”`,

    // No curated clip yet; ship the deep dive as written content.
    video: null,
    videoFallbackMarkdown: `## Deep dive: build a debugger’s intuition

### 1) The “binding graph” you should picture

When you see:

\`\`\`
raw = {"batch_size": "1000"}
cfg = raw
\`\`\`

You should instantly think: “Two names, one object.” If \`cfg\` is mutated, \`raw\` changes too.

### 2) Predict first, then verify (how you learn this for real)

Run this loop mentally before you execute code:

1. Are we **mutating** an object or **rebinding** a name?
2. Which names might **alias** the same object?
3. If we print \`id(x)\`, do we expect it to stay stable?

### 3) Why this matters in data work

In ETL code, subtle shared-state bugs show up as:

- “Why did this record’s fields change after a helper ran?”
- “Why does my config grow every time the job retries?”
- “Why does a list keep accumulating values across calls?”

These are name-binding + mutability bugs, not pandas bugs.

### 4) The catastrophic default-arg bug (know this cold)

\`\`\`
def append_to(element, to=[]):
    to.append(element)
    return to
\`\`\`

Default arguments are evaluated **once** at function definition time. That list is shared across calls.

**Correct pattern:**

\`\`\`
def append_to(element, to=None):
    if to is None:
        to = []
    to.append(element)
    return to
\`\`\`

### 5) Type hints: practical guidance

- Use type hints to state intent and enable tooling.
- Still validate at boundaries: hints don’t stop \`"100"\` from sneaking in as an int.

If you can explain these tradeoffs clearly, you’ll outperform most candidates.`,

    tryGuidance: "In the interactive, treat every run as a prediction game: before you click or run code, decide whether you expect **mutation** (same id) or **rebinding** (new id). Then verify with id()/is/==. If the viz is about mutability, map the same mental model onto name binding.",

    knowledgeCheck: [
      {
        question: "In Python, what is the most accurate description of a variable?",
        options: [
          "A name bound to an object",
          "A memory box that stores a value directly",
          "A pointer that always points to a mutable location",
        ],
        correctIndex: 0,
        explanation: "Names bind to objects. Mutation changes an object; rebinding changes what the name refers to.",
      },
      {
        question: "What does `is` check?",
        options: [
          "Object identity (same object)",
          "Value equality (same contents)",
          "Type compatibility",
        ],
        correctIndex: 0,
        explanation: "`is` checks identity (same object). Use `==` for value equality. Use `is None` for sentinel checks.",
      },
      {
        question: "What prints, and why?\n\n`a = []\n b = a\n b.append(1)\n print(a)`",
        options: [
          "[1] because a and b refer to the same list",
          "[] because append only affects b",
          "It raises an exception because lists can’t be shared",
        ],
        correctIndex: 0,
        explanation: "This is aliasing: two names refer to one list, and append mutates in place.",
      },
      {
        question: "Why is `def f(x, items=[])` dangerous?",
        options: [
          "The default list is created once and shared across calls",
          "Python forbids empty lists as defaults",
          "It always creates a new empty list per call",
        ],
        correctIndex: 0,
        explanation: "Default argument objects are evaluated once at function definition time, creating shared mutable state.",
      },
      {
        question: "Type hints in Python are best described as:",
        options: [
          "Tooling-visible contracts that improve maintainability, not runtime enforcement",
          "Runtime type enforcement built into the interpreter",
          "Only useful for C extensions",
        ],
        correctIndex: 0,
        explanation: "Type hints power tooling and safer refactors, but you still validate untrusted input at boundaries.",
      },
      {
        question: "You ingest `batch_size` from an env var. What is the senior approach?",
        options: [
          "Parse/validate at the boundary, then keep the internal value consistently typed",
          "Leave it as a string and convert whenever you need it",
          "Rely on type hints to convert it automatically",
        ],
        correctIndex: 0,
        explanation: "Normalize early. Avoid repeated ad-hoc conversions that drift and break in weird places.",
      },
    ],
  },

  "py-b2": {
    durationLabel: MODULE_TIME_LABEL,
    outcomes: [
      "Treat a Python `str` as an **immutable sequence of Unicode code points**, not a bag of bytes.",
      "Compose f-strings fluently: **conversion flags** (`!r`/`!s`/`!a`) + the **format mini-language** (fill, align, sign, width, grouping, precision, type).",
      "Pick the right **string method** for the job (strip/split/join/replace/casefold) and avoid `+=` in loops.",
      "Know **when not to use f-strings**: logging, SQL, shell, i18n — each has a safer idiom.",
    ],
    learnMarkdown: `## The mental model (say this out loud)

A Python \`str\` is an **immutable sequence of Unicode code points**. Two words do all the work:

- **Immutable** — every “modification” (\`s.lower()\`, \`s.replace(...)\`, \`s + "!"\`) returns a **new** string. The old object is untouched. This is why \`s += x\` inside a tight loop is an O(n²) footgun — each iteration allocates a brand-new string.
- **Unicode** — indexing walks **code points**, not bytes. \`len("résumé") == 6\`, but when you \`encode("utf-8")\` the byte count can jump. \`str\` is characters, \`bytes\` is octets, and the line between them is where most production bugs live.

## String literals: the four you actually use

- \`'ada'\` and \`"ada"\` — interchangeable. Pick one per file and be consistent.
- \`"""triple"""\` — spans lines, keeps newlines literal. Docstrings and SQL.
- \`r"C:\\\\Users\\\\ada"\` — raw string. Backslashes are **literal**. Non-negotiable for regex and Windows paths.
- \`b"bytes"\` — a **different type**, not a string. \`str.encode("utf-8")\` converts str → bytes; \`bytes.decode("utf-8")\` converts back.

Adjacent string literals are **implicitly concatenated**: \`"hello " "world"\` → \`"hello world"\`. Handy for long SQL; dangerous inside function calls where a missing comma silently glues two args into one.

---

## f-strings: the one you will use every day

An f-string is syntax, not a function. Python parses and evaluates every expression inside \`{}\` at runtime.

The grammar to memorize:

\`\`\`
f"prefix {expression!conversion:format_spec} suffix"
\`\`\`

Three slots inside the braces, each optional except \`expression\`:

### 1 · The expression

Any Python expression: a variable, a call, a dict lookup, arithmetic, even a list comprehension. Python 3.8+ adds \`{x=}\` — it prints the **source** \`x=\` plus the value. Logging gold.

\`\`\`
unit_price, qty = 4.20, 3
print(f"{unit_price * qty = }")   # unit_price * qty = 12.6
\`\`\`

### 2 · The conversion flag: \`!r\` \`!s\` \`!a\`

Runs **before** the format spec.

- \`!s\` — default, calls \`str()\`.
- \`!r\` — calls \`repr()\`. For strings this wraps them in quotes and escapes invisibles — it is your debugging best friend. \`f"got {value!r}"\` surfaces trailing whitespace, \`\\n\`, and mixed unicode.
- \`!a\` — \`ascii()\`. Same as \`!r\` but non-ASCII characters are escaped as \`\\uXXXX\`.

Interview heuristic: if a bug involves “invisible” characters, reach for \`!r\`.

### 3 · The format mini-language

After a colon, Python parses this tiny grammar:

\`\`\`
[[fill]align][sign][#][0][width][,_][.precision][type]
\`\`\`

Read it left to right:

- **fill** + **align** — a single fill char plus one of \`<\` (left), \`>\` (right), \`^\` (center), \`=\` (pad between sign and digits). Fill is only read when align is present.
- **sign** — \`-\` (default, show sign only on negatives), \`+\` (always), \` \` (leading space for positives, so columns line up).
- **#** — alt form. Adds \`0b\`/\`0o\`/\`0x\` prefixes for bin/oct/hex; forces a decimal point on \`g\`/\`f\`.
- **0** — zero-pad. Shorthand for fill=\`0\` with align=\`=\` (zeros slide **after** the sign).
- **width** — minimum field width. The value **never** gets truncated by width — only by precision.
- **, or _** — thousands separator: \`f"{1234567:,}"\` → \`1,234,567\`.
- **.precision** — floats: digits after the point. Strings: **truncate** to N chars. Integers: error.
- **type** — \`s\` string · \`d\` int · \`f\` fixed · \`e\` scientific · \`g\` general · \`%\` percent · \`b\`/\`o\`/\`x\`/\`X\` bin/oct/hex · \`c\` codepoint.

The spec is **context-sensitive**: \`.3\` on a \`str\` truncates, on a \`float\` it means 3 decimals. Same two characters, different semantics — interviewers love this.

### Nested / dynamic specs

You can interpolate into the spec itself:

\`\`\`
width = 18
print(f"{title:<{width}} {qty:>5}")
\`\`\`

This is how you build column layouts without reaching for \`tabulate\`.

---

## The string methods senior devs reach for

Think in **pipelines**, not ad-hoc calls:

- \`s.strip()\` / \`.lstrip()\` / \`.rstrip()\` — trim whitespace. Pass a string to remove **any of those characters**, not a suffix: \`"abc.com".rstrip(".com")\` returns \`"ab"\`, not \`"abc"\`. For suffix stripping use \`str.removesuffix\` (3.9+).
- \`.split(sep=None, maxsplit=-1)\` — \`None\` splits on any whitespace and collapses runs. \`","\` splits on the literal.
- \`sep.join(iterable)\` — the only way to concatenate N strings performantly: \`", ".join(names)\` is O(n) with a single allocation. Never \`s += x\` in a loop.
- \`.replace(old, new, count=-1)\` — returns a new string; does not mutate.
- \`.startswith(prefix)\` / \`.endswith(suffix)\` — accepts a **tuple** of options: \`url.startswith(("http://", "https://"))\`. Prefer over slicing.
- \`in\` — membership: \`"error" in line\` is idiomatic. \`.find\` returns \`-1\` if missing; \`.index\` raises.
- \`.lower()\` vs \`.casefold()\` — **use \`casefold\` for case-insensitive compares**. Lower() doesn’t handle German ß, Turkish i, etc.
- \`.format(...)\` / \`%\` — legacy siblings of f-strings. Learn them only because old codebases still use them.

---

## When NOT to use f-strings

This section separates juniors from seniors.

### Logging → use \`%\`-style with lazy interpolation

\`\`\`
logger.info("user %s action %s", user_id, action)  # right
logger.info(f"user {user_id} action {action}")     # wrong: formats even when level is filtered out
\`\`\`

Lazy logging skips formatting when the log is filtered, and plays nicely with structured-logging collectors.

### SQL → parameterized queries, **always**

\`\`\`
cur.execute(f"SELECT * FROM users WHERE id = {user_id}")   # SQL injection
cur.execute("SELECT * FROM users WHERE id = %s", (user_id,))  # safe
\`\`\`

The same rule holds for shell (\`subprocess\` with a list argv) and any other eval-adjacent API.

### i18n / translation → \`.format\` with named args

Named-placeholder templates survive translator re-ordering; f-strings hard-bake the order into code.

---

## Pitfalls that cost production hours

- **\`s += x\` inside a loop** — O(n²). Build a \`list\` and \`join\` at the end.
- **Implicit literal concatenation** — \`["alpha" "beta", "gamma"]\` is a 2-element list, not 3. A missing comma is an invisible bug.
- **\`rstrip\` treats arg as a charset** — \`"data.csv".rstrip(".csv")\` is \`"dat"\`. Use \`removesuffix\`.
- **\`lower()\` for case-insensitive compare** — pass a Turkish user through it and watch your auth flake out. Use \`casefold\`.
- **Counting characters vs bytes** — \`len(s)\` is code points, not UTF-8 bytes. Database \`VARCHAR(n)\` usually counts bytes.
- **Forgetting \`r""\` for regex** — \`"\\\\d+"\` works, \`r"\\\\d+"\` is obviously correct and survives review.

---

## Interview hook (answer like a senior)

“A Python str is an immutable sequence of code points. I use f-strings for runtime display, but I reach for parameterized queries in SQL and lazy \`%\`-format in logging. The format mini-language is \`[[fill]align][sign][#][0][width][,][.precision][type]\` — most bugs come from using precision on a string (truncates) when you meant width (pad).”`,

    video: null,
    videoFallbackMarkdown: `## Deep dive: build the format spec from muscle memory

### 1) The “read the spec left to right” drill

Given \`{price:+,.2f}\`, say it aloud before you run code:

1. No fill/align → default right-align for numbers.
2. \`+\` → always show sign (useful for deltas, +3.2% / -1.1%).
3. \`,\` → thousands separator.
4. \`.2\` → two decimals.
5. \`f\` → fixed-point type.

Now try \`{name:<20.10}\`: left-align in a **20-char** field, but **truncate** the name to **10** characters first. Width and precision do different jobs — this is the exam trap.

### 2) The one diagram you must be able to draw

A table with three columns — input, \`{x:>10}\`, \`{x:0>10}\`, \`{x:_>10}\` — for values \`"42"\`, \`"1.5"\`, and \`"-7"\`. If you can fill it in without running Python, you own the mini-language.

### 3) A concrete data-engineering story

A stakeholder asks for “nice numbers” in a dashboard export. Without the mini-language you end up with ten bespoke helper functions. With it, you write one tiny row formatter:

\`\`\`
def fmt(row):
    return (
        f"{row['merchant']:<24.24} "
        f"{row['orders']:>7,d} "
        f"{row['revenue']:>+12,.2f} "
        f"{row['conv_rate']:>7.2%}"
    )
\`\`\`

That single function replaces most ad-hoc formatting you will see in notebooks.

### 4) Methods, phrased as pipelines

Real ETL code reads like sentences:

\`\`\`
record["city"] = (
    raw["city"]
    .strip()          # trim surrounding whitespace
    .casefold()       # locale-aware lower
    .removeprefix("the ")   # 3.9+ — safer than rstrip(chars)
    .replace("  ", " ")     # collapse double-spaces
)
\`\`\`

Every step returns a new string. There is **no hidden mutation**. Debugging these pipelines is a joy compared to regex everywhere.

### 5) Bytes vs strings, once and for all

- Read/write files as text → you get \`str\`. Encoding happens at the boundary (\`open(path, encoding="utf-8")\`).
- Network / file bytes → you get \`bytes\`. Decode **once**, at the boundary.
- Mixing the two silently is where \`UnicodeDecodeError\` comes from at 2am. Keep str and bytes **obviously distinct** in type hints.

If you can narrate all five of these, you are ahead of most Python screens.`,

    tryGuidance:
      "Open the atelier below and play the anatomy game: **start from a recipe** (try *USD currency* or *Zero-padded ID*), then change **one control at a time** and predict before you see the output. Watch the green span in the ruler — that is the formatted value inside the padded field. The *source the interpreter sees* panel is your ground truth.",

    knowledgeCheck: [
      {
        question: "What prints?\n\n`f\"{'hello':>8}\"`",
        options: [
          "'   hello' — right-aligned in an 8-char field (default for strings is left, but `>` overrides).",
          "'hello   ' — strings always left-align, the `>` is ignored.",
          "'hello' — width is only valid on numbers.",
        ],
        correctIndex: 0,
        explanation: "`>` forces right-alignment; width 8 pads to the left. Default align differs for types (strings left, numbers right), but explicit align wins.",
      },
      {
        question: "What does `f\"{name:.3}\"` do when `name = 'ada lovelace'`?",
        options: [
          "Truncates to 'ada' — precision on a string means 'max N chars'.",
          "Formats 3 decimal places — ValueError: you can’t use precision on a str.",
          "Pads the string out to 3 characters.",
        ],
        correctIndex: 0,
        explanation: "Precision is context-sensitive: on floats it means decimals; on strings it truncates to N code points. Classic interview trap.",
      },
      {
        question: "Which line logs correctly — i.e., skips formatting work when the log level filters the message out?",
        options: [
          "logger.info('user %s action %s', user_id, action)",
          "logger.info(f'user {user_id} action {action}')",
          "logger.info('user ' + str(user_id) + ' action ' + action)",
        ],
        correctIndex: 0,
        explanation: "The `%`-style signature is lazy: the logging framework only interpolates if the record actually emits. f-strings and `+` always eagerly build the string.",
      },
      {
        question: "`\"data.csv\".rstrip(\".csv\")` returns what, and why?",
        options: [
          "'dat' — rstrip removes any trailing character that appears in the argument (a charset, not a suffix).",
          "'data' — it strips the literal '.csv' suffix.",
          "'data.csv' — rstrip only trims whitespace.",
        ],
        correctIndex: 0,
        explanation: "rstrip treats the argument as a set of characters. For a real suffix strip use `str.removesuffix('.csv')` (3.9+).",
      },
      {
        question: "You need to format `1234567` as `001,234,567`. Which spec is correct?",
        options: [
          "f\"{n:011,d}\"",
          "f\"{n:,011d}\"",
          "f\"{n:0>11,d}\"",
        ],
        correctIndex: 0,
        explanation: "Zero-pad (`0`), width (`11`), grouping (`,`), type (`d`). Order matters: `0` before width, `,` before type. The third option also works numerically but pads zeros *including* the comma positions and can misalign signs — `0` is the idiomatic zero-pad.",
      },
      {
        question: "Why is `result += s` inside a loop of 1M strings a performance bug?",
        options: [
          "Strings are immutable — each `+=` allocates a new string. Cost is O(n²). Use `''.join(parts)` instead.",
          "Python caches all strings, so memory leaks accumulate.",
          "It works, but only on CPython; PyPy rejects it.",
        ],
        correctIndex: 0,
        explanation: "Immutability forces reallocation. `str.join` walks the iterable once and allocates once — O(n) with a single buffer.",
      },
      {
        question: "For a case-insensitive comparison of user-provided text, what is the senior choice?",
        options: [
          "a.casefold() == b.casefold()",
          "a.lower() == b.lower()",
          "a.upper() == b.upper()",
        ],
        correctIndex: 0,
        explanation: "`casefold` is the aggressive Unicode lower-case designed for compares: it handles ß → ss, Greek sigma, Turkish dotless i. `lower` preserves locale quirks.",
      },
      {
        question: "A junior writes `cur.execute(f\"SELECT * FROM users WHERE id = {uid}\")`. What’s the right review comment?",
        options: [
          "Don’t format SQL with f-strings — use parameterized queries (`%s` placeholders + a params tuple) to prevent SQL injection.",
          "Use `.format()` instead of f-string for SQL.",
          "Rename `uid` to `user_id` and ship it.",
        ],
        correctIndex: 0,
        explanation: "f-strings bake values into the SQL source string. Parameterized queries keep the value in a separate slot the driver escapes and the DB treats as data, not code.",
      },
    ],
  },

  "py-b4": {
    durationLabel: MODULE_TIME_LABEL,
    outcomes: [
      "Explain **why** `dict` and `set` lookups are O(1) average — in terms of hashing, not magic.",
      "Pick the right container fast: `dict` for key→value, `set` for membership, `Counter` / `defaultdict` for the common ETL cases.",
      "State the **hashability contract** (`__hash__` + `__eq__`) and predict which types can be keys.",
      "Use dict/set **operators** fluently: `|`, `&`, `-`, `^`, `|=`, `{**a, **b}` — and spot their complexity.",
      "Avoid the bugs: mutating during iteration, shared-reference values, relying on hash order across runs.",
    ],
    learnMarkdown: `## The mental model (say this first)

A \`dict\` is a **hash table**. So is a \`set\` — it is just a hash table that throws away the value and only keeps keys. Everything else follows from two facts:

- You must be able to **hash** a key into a number (fast, deterministic within a run).
- You must be able to **compare** two keys with \`==\` (to resolve collisions and detect duplicates).

That is the entire \`__hash__\` / \`__eq__\` contract. Violate it and the table silently loses data.

Why does this buy you **O(1) average** lookup? Because the hash is an index into an array — no scanning. The *average* matters: if many keys hash to the same slot (a **collision**), CPython probes forward until it finds an empty slot or a match. In the worst case — pathological hashing, adversarial input, or a small table — you degrade to **O(n)**. Every interviewer quizzing "why is a set faster than a list for membership?" wants this story.

---

## \`dict\` — the everyday hash table

### Four ways to build one

\`\`\`
d1 = {"a": 1, "b": 2}                # literal
d2 = dict(a=1, b=2)                  # kwargs — keys must be valid identifiers
d3 = dict([("a", 1), ("b", 2)])      # from pairs
d4 = {k: v for k, v in pairs}        # dict comprehension — the Pythonic one
\`\`\`

### Three idioms you will use every day

- \`d[k]\` — raises \`KeyError\` on miss. Use when absence is a **bug**.
- \`d.get(k, default)\` — returns default on miss. Use when absence is **expected**.
- \`d.setdefault(k, default)\` — returns existing OR inserts + returns default. One line, two operations.

### Insertion order is preserved (3.7+)

Iteration walks keys in **insertion order**, guaranteed by the language spec since Python 3.7. That is why \`OrderedDict\` is mostly legacy. Equality still ignores order: \`{"a": 1, "b": 2} == {"b": 2, "a": 1}\` is \`True\`.

### Merging — know all three

- \`{**a, **b}\` — new dict, **b wins** on conflicts. (3.5+)
- \`a | b\` — same semantics, more readable. (3.9+)
- \`a.update(b)\` — mutates \`a\` in place, b wins. Use inside a function; avoid on shared state.

---

## The stdlib cousins you should actually use

- \`collections.defaultdict(list)\` — missing key auto-inits to \`[]\`. Bucket-by-key without \`if k not in d\`.
- \`collections.Counter(iterable)\` — frequency map with \`.most_common(k)\`, arithmetic (\`c1 + c2\`), and subtraction. Interview staple.
- \`collections.ChainMap(*dicts)\` — layered lookup (scope chains, config overlays).
- \`types.MappingProxyType(d)\` — read-only view of a dict. Surfaces as \`cls.__dict__\`.

If you reach for \`if k not in d: d[k] = []\` twice in a file, switch to \`defaultdict\`. If you are counting anything, it is \`Counter\`.

---

## \`set\` and \`frozenset\` — dedupe + membership + algebra

A set is a dict without values. You get:

- \`x in s\` → **O(1) average** (versus **O(n)** on a list).
- Uniqueness: adding a duplicate is a no-op.
- **Set algebra** as operators:

| Operator | Method | Meaning |
|---|---|---|
| \`A \\| B\` | \`A.union(B)\` | in A or B |
| \`A & B\` | \`A.intersection(B)\` | in both |
| \`A - B\` | \`A.difference(B)\` | in A, not B |
| \`A ^ B\` | \`A.symmetric_difference(B)\` | in exactly one |
| \`A <= B\` | \`A.issubset(B)\` | every A in B |

\`frozenset\` is the immutable, **hashable** cousin — use it when you need a set to itself be a dict key or another set's element.

**A real data-engineering pattern:**

\`\`\`
paying_users = set(row["user_id"] for row in payments)
active_users = set(row["user_id"] for row in events_last_week)
new_payers  = paying_users - churned_user_ids
winback_pool = active_users - paying_users   # active but not paying
\`\`\`

Three one-liners that would be a loop-and-flag mess in a less suitable language.

---

## The hashability contract

A value can be a dict key / set element only if it is **hashable**: it has a stable \`__hash__\` and sensible \`__eq__\`. The rules of thumb you must know cold:

- **Hashable**: \`int\`, \`float\`, \`str\`, \`bytes\`, \`tuple\` (if **all** elements are hashable), \`frozenset\`, and your own classes by default (hash on id).
- **Unhashable**: \`list\`, \`dict\`, \`set\`, \`bytearray\`. Anything that can **mutate** in place.

\`\`\`
key = (user_id, date)      # ok — tuple of hashables
key = (user_id, [1, 2])    # TypeError when you try to use it
\`\`\`

**Dataclass gotcha:** \`@dataclass\` gives you equality but **not** hashability by default. Use \`@dataclass(frozen=True)\` to make instances hashable and usable as dict keys / set elements.

**Custom classes:** if you override \`__eq__\`, Python sets \`__hash__ = None\` unless you also define \`__hash__\`. Equal objects **must** hash to the same value — otherwise dict/set silently loses them.

---

## Iteration — and the one fatal bug

- \`for k in d\` — iterate keys (insertion order).
- \`for v in d.values()\` — values.
- \`for k, v in d.items()\` — the default you reach for.
- \`d.keys() | other\` — dict views support set algebra directly.

**Never mutate a dict while iterating it:**

\`\`\`
for k in d:
    if stale(k):
        del d[k]        # RuntimeError: dict changed size during iteration
\`\`\`

Fix: iterate a **snapshot** (\`list(d.keys())\`), or build a new dict via comprehension:

\`\`\`
d = {k: v for k, v in d.items() if not stale(k)}
\`\`\`

The comprehension version is usually cleaner and more obviously correct.

---

## Pitfalls that burn real teams

- **Hash order across runs** — for strings, CPython randomizes hashes per process (PYTHONHASHSEED). Never persist something that depends on hash order. This is why iteration order is guaranteed, but **collision layout** is not.
- **Shared-reference values** — \`d = dict.fromkeys(users, [])\` gives every user the **same** list. Mutating one mutates all. Use \`{u: [] for u in users}\`.
- **Float / NaN keys** — \`NaN != NaN\`, so \`d[float("nan")] = 1; d[float("nan")]\` raises. Don't use floats with fractional noise as keys.
- **"Nested dict" as a contract** — great for prototypes, painful at scale. Once the shape matters, reach for \`@dataclass\` or a typed schema.

---

## Interview hook (answer like a senior)

"A dict is a hash table. Lookup, insert, delete are O(1) *on average* because the hash is the index into a contiguous slot array; collisions probe forward. Worst case is O(n), which is what makes the hashability contract matter: equal objects must hash to the same value, and only immutable objects are safe to hash because their hash has to stay stable for the lifetime of the dict. Sets are the same machinery with no values. For the everyday ETL problems — bucketing, deduping, counting, joining by key — I reach for \`defaultdict\`, \`set\`, and \`Counter\` before writing any explicit loop."`,

    video: null,
    videoFallbackMarkdown: `## Deep dive: think in dict/set patterns, not loops

### 1) The "bucket-by-key" pattern — \`defaultdict(list)\`

Almost every ETL cleanup looks like: "group records by some key."

\`\`\`
from collections import defaultdict
by_user = defaultdict(list)
for event in events:
    by_user[event["user_id"]].append(event)
\`\`\`

Without \`defaultdict\` you write the ugly guard:

\`\`\`
by_user = {}
for event in events:
    if event["user_id"] not in by_user:
        by_user[event["user_id"]] = []
    by_user[event["user_id"]].append(event)
\`\`\`

Same behavior, twice the code, three times the chances of a bug.

### 2) The \`Counter\` pattern — read-once frequency maps

\`\`\`
from collections import Counter
top_countries = Counter(r["country"] for r in visits).most_common(5)
\`\`\`

You just solved the classic "top-K by count" interview question in one line. Reach for it in every frequency, histogram, or anomaly-detection warm-up.

### 3) The set-join pattern — when a JOIN isn't available

Before pandas, before SQL, these are the primitives:

\`\`\`
in_a = set(rows_a)
in_b = set(rows_b)
only_a = in_a - in_b           # left anti-join
only_b = in_b - in_a           # right anti-join
both   = in_a & in_b           # inner join (keys)
either = in_a | in_b           # outer join (keys)
\`\`\`

In debugging, these four expressions diagnose almost every "why don't these two systems agree?" question.

### 4) Dedup with order preservation (3.7+)

\`dict.fromkeys\` preserves insertion order **and** is typically faster than any hand-rolled loop:

\`\`\`
unique_preserve_order = list(dict.fromkeys(items))
\`\`\`

### 5) Why you should fear "nested dict as a contract"

Nested dicts read like JSON and feel free. The trap: there is **no type checking**, and a typo in a key just silently returns \`None\`/\`KeyError\` far from where you meant. Promote stable shapes to \`@dataclass(frozen=True)\` or \`TypedDict\` early. Keep dict/set for the *dynamic* places — grouping, dedup, counting.

### 6) One diagram you must be able to draw

Draw a row of 8 slots. Write "cat" → compute \`hash % 8\` → slot X. Then write "tac" → same slot X (toy collision). Then "act" → same slot again. Walk through linear probing. Then lookup "cat": show that the probe terminates on either a match or the first empty slot.

If you can explain this diagram in 60 seconds, the rest of the lesson comes for free.`,

    tryGuidance:
      "Play **Buckets** first: type a key, click insert, and read the log — the message narrates what CPython does (hash → slot → probe). Then click **Seed collisions** to watch anagram keys share a home and probe onward. Now flip to **Algebra** and rearrange sets A and B; watch which elements survive each of the five operations. Before each click, predict which elements end up in the result.",

    knowledgeCheck: [
      {
        question: "Why is `x in s` with a `set` typically O(1) while `x in lst` with a `list` is O(n)?",
        options: [
          "The set hashes x and goes straight to the slot; the list has to scan until it finds x or runs out.",
          "Python caches the last lookup for sets only.",
          "Lists force a linear sort at the start of each membership test.",
        ],
        correctIndex: 0,
        explanation: "Hash tables index by a computed hash → the slot is found in constant time on average. Lists are sequences; membership is a linear walk.",
      },
      {
        question: "Which value **cannot** be used as a dict key?",
        options: [
          "[1, 2] — lists are mutable and therefore unhashable",
          "(1, 2) — tuple of ints",
          "'alice' — strings are immutable and hashable",
        ],
        correctIndex: 0,
        explanation: "Mutable containers (list, dict, set, bytearray) are unhashable — using them as keys raises TypeError. Tuples of hashables and strings are fine.",
      },
      {
        question: "What does `d.get('missing_key', 0)` do when the key is absent?",
        options: [
          "Returns 0 — the supplied default — without modifying the dict.",
          "Inserts 0 under 'missing_key' and returns it.",
          "Raises KeyError.",
        ],
        correctIndex: 0,
        explanation: ".get reads-only and returns the default on miss. Use .setdefault if you want the 'insert on miss' behavior.",
      },
      {
        question: "What does `Counter(words).most_common(3)` return?",
        options: [
          "A list of the three (item, count) pairs with the highest counts, already sorted.",
          "A new Counter containing only the three most common keys.",
          "The single most common key repeated three times.",
        ],
        correctIndex: 0,
        explanation: "`.most_common(k)` returns a list of (element, count) tuples — that is why it is the go-to for top-K frequency questions.",
      },
      {
        question: "Given `a = {'x': 1, 'y': 2}` and `b = {'y': 99, 'z': 3}`, what does `{**a, **b}` produce?",
        options: [
          "{'x': 1, 'y': 99, 'z': 3} — b wins on the conflicting key 'y'.",
          "{'x': 1, 'y': 2, 'z': 3} — a wins because it comes first.",
          "A TypeError because the keys overlap.",
        ],
        correctIndex: 0,
        explanation: "Later unpackings overwrite earlier ones. Same rule as `a | b` (3.9+) and `dict(a, **b)`.",
      },
      {
        question: "Why does this loop raise at runtime?\n\n`for k in d:\n    if stale(k):\n        del d[k]`",
        options: [
          "RuntimeError: dict changed size during iteration — mutate a snapshot or build a new dict with a comprehension.",
          "KeyError — del can only remove keys that were added with d.setdefault.",
          "IndexError — dicts can't be indexed by k inside a for loop.",
        ],
        correctIndex: 0,
        explanation: "The iterator tracks the dict's structural version. Mutating keys invalidates it. Iterate `list(d)` or rebuild: `d = {k: v for k, v in d.items() if not stale(k)}`.",
      },
      {
        question: "Which expression returns 'elements in A but not in B'?",
        options: [
          "A - B  (equivalently A.difference(B))",
          "A ^ B  (symmetric difference)",
          "A & B  (intersection)",
        ],
        correctIndex: 0,
        explanation: "`-` is set difference; `^` is the elements in exactly one set (union minus intersection); `&` is common elements.",
      },
      {
        question: "Two dicts have the same keys and values but were inserted in different orders. Are they `==`?",
        options: [
          "Yes — dict equality ignores insertion order.",
          "No — iteration order matters for equality.",
          "Yes only on Python 3.7+; earlier they would be unequal.",
        ],
        correctIndex: 0,
        explanation: "Equality checks the mapping, not the order. Insertion order is preserved for iteration (3.7+), but two mappings with the same (k, v) pairs are always equal.",
      },
    ],
  },

  "py-b5": {
    durationLabel: MODULE_TIME_LABEL,
    outcomes: [
      "Read and write comprehensions in **all four flavors** — list, set, dict, generator — fluently.",
      "Translate between a comprehension and the equivalent for-loop **in either direction**, under interview time pressure.",
      "Pick **generator expressions** over list comprehensions when memory or laziness matter.",
      "Know the readability ceiling: **when a comprehension should become a loop or a helper function**.",
      "Avoid the footguns: side-effect comprehensions, the conditional-position trap, and late binding in nested cases.",
    ],
    learnMarkdown: `## The one grammar to own

Every comprehension has the same shape, read **expression-first, filter-last**:

\`\`\`
[  expression   for  var  in  iterable    if  predicate  ]
    (what)            (source)                 (optional gate)
\`\`\`

But Python **executes** it in iteration order: pull an item → test the filter → if it passes, evaluate the expression → collect. That mismatch between reading order and execution order is the **single biggest source of bugs** in beginner code. The forge below draws the execution order left-to-right so you stop fighting it.

---

## The four flavors (same grammar, different brackets)

### 1 · List comprehension — \`[ ]\`

\`\`\`
squares = [x ** 2 for x in nums if x % 2 == 0]
\`\`\`

Eager. Allocates a list. Use when you need a concrete, indexable, reusable collection.

### 2 · Set comprehension — \`{ }\`

\`\`\`
unique_lower = {name.casefold() for name in names}
\`\`\`

Eager, unique. Collision: if two items transform to the same value, the second wins and the first is silently dropped. Great for dedup; dangerous when you wanted to keep both.

### 3 · Dict comprehension — \`{ : }\`

\`\`\`
lookup = {user["id"]: user for user in users}
by_active = {u["id"]: u for u in users if u["active"]}
\`\`\`

Also eager. Same late-key-wins rule as regular dict construction — if two items share a key, the **later** pair overwrites the earlier one without a warning.

### 4 · Generator expression — \`( )\`

\`\`\`
total = sum(x ** 2 for x in nums)
\`\`\`

**Lazy.** No list is built. Each value is produced on demand and discarded. This is the form to reach for when:

- The collection would be huge and you only need an aggregate (\`sum\`, \`any\`, \`all\`, \`max\`, \`min\`).
- You are piping results into another generator / iterator.
- You want a **one-pass** stream and never need to rewind.

When a generator expression is the **only** argument to a function, you can drop the outer parens: \`sum(x*x for x in nums)\`.

---

## The conditional position trap

There are **two** positions for \`if\` / \`else\` in a comprehension, and they mean different things:

**Filter (tail of the comprehension) — single \`if\`, decides whether to *keep* the item:**

\`\`\`
[x for x in nums if x > 0]   # drops non-positive items
\`\`\`

**Conditional expression (head of the comprehension) — \`if / else\`, decides what to *emit*:**

\`\`\`
[x if x > 0 else 0 for x in nums]   # always emits, replaces negatives with 0
\`\`\`

Swapping them is a classic interview trap. Memorize: *"if at the end filters, if/else at the front transforms."*

---

## Nested for-loops (and when to stop)

Comprehensions can stack \`for\` clauses — they read **outer-to-inner**, same as the equivalent for-loop:

\`\`\`
flat = [x for row in matrix for x in row]

# equivalent:
flat = []
for row in matrix:
    for x in row:
        flat.append(x)
\`\`\`

If you find yourself writing **more than one \`for\`** or **more than one \`if\`**, refactor:

- Extract a **generator function** (\`def rows(): yield ...\`).
- Or use an intermediate variable with a plain loop.

Cleverness is fine; re-reading it in six months isn't.

---

## Comprehensions vs \`map\` / \`filter\`

\`map\` and \`filter\` return iterators in Python 3. They are idiomatic when you already have a named function:

\`\`\`
list(map(str.strip, lines))        # clear
[line.strip() for line in lines]   # also clear, slightly shorter
\`\`\`

When you need a **lambda**, prefer the comprehension — lambdas cost a call frame per item; a comprehension expression is inlined. And nested \`map(filter(...))\` becomes unreadable fast; the comprehension reads left-to-right.

---

## When NOT to use a comprehension

This is senior-level judgment.

- **Side effects** — if the purpose is \`logger.info(x)\` or \`db.write(x)\` for each item, write a **for-loop**. Comprehensions are expressions that *produce a collection*; when you use them only for the effect and throw away the list, you confuse every reviewer.
- **Debugging step-by-step** — a plain loop lets you drop a breakpoint inside; a comprehension hides the iteration.
- **Complex transforms** — the moment your expression crosses two lines or has a ternary inside a dict lookup inside a function call, stop. Name the transform: \`result = [clean(row) for row in rows if is_valid(row)]\`.
- **You need the index** — reach for \`enumerate\`: \`[(i, row) for i, row in enumerate(rows)]\`.

---

## Two power moves

### Walrus \`:=\` inside a comprehension (3.8+)

When the filter and the expression compute the **same expensive value**, bind it once:

\`\`\`
cleaned = [result for raw in batch if (result := heavy_parse(raw)) is not None]
\`\`\`

Without the walrus you would call \`heavy_parse\` twice — once in the filter, once in the expression. Use sparingly; it reads fine to Python-fluent eyes and confuses everyone else.

### \`zip\` + dict comprehension — idiomatic row builder

\`\`\`
cols = ["id", "name", "age"]
rows = [
    dict(zip(cols, row))
    for row in csv_rows
]
\`\`\`

This is how idiomatic Python turns CSV rows into dicts without pandas.

---

## Performance, honestly

- A list comprehension is typically **~1.5–2× faster** than the equivalent \`for / append\` loop. Not because of magic — the bytecode uses a specialized \`LIST_APPEND\` op and avoids attribute lookup for \`.append\`.
- A generator expression allocates essentially no memory for the output; use it inside \`sum\`, \`max\`, \`any\`, \`all\`, etc.
- The win evaporates the moment your expression calls a Python function — the per-call overhead dominates. Don't "optimize" by shoving a loop into a comprehension if it ends up calling \`some_helper(x)\` anyway.

---

## Interview hook (answer like a senior)

"A comprehension is syntactic sugar over a for-loop that produces a collection. Four flavors: list, set, dict, and generator — the generator form is the one I reach for when I only need an aggregate, because it keeps memory flat. Readability is the hard limit: one \`for\`, one \`if\`, simple expression. Beyond that I promote to a generator function. And I never use a comprehension for side effects — that signals to the reviewer that I misunderstood what the syntax is for."`,

    video: null,
    videoFallbackMarkdown: `## Deep dive: rewriting loops as comprehensions

### 1) The 4-minute drill

Take these three loops, rewrite each as a comprehension, then rewrite back. Do it on paper, not in a shell.

**A — filter + transform into a list:**

\`\`\`
out = []
for x in nums:
    if x >= 0:
        out.append(x ** 2)
\`\`\`

**B — filter + build a dict keyed by id:**

\`\`\`
out = {}
for row in rows:
    if row["active"]:
        out[row["id"]] = row["name"].upper()
\`\`\`

**C — filter + aggregate into a sum:**

\`\`\`
out = 0
for x in nums:
    if x > 0:
        out += x
\`\`\`

Expected rewrites:

- **A** → \`[x ** 2 for x in nums if x >= 0]\`
- **B** → \`{row["id"]: row["name"].upper() for row in rows if row["active"]}\`
- **C** → \`sum(x for x in nums if x > 0)\` — a **generator expression**, no list built.

If **C** tripped you, that is exactly the habit the lesson wants. You almost never want to build a temporary list only to feed it to \`sum\`, \`max\`, or \`any\`.

### 2) The memory story, with numbers

\`\`\`
sum([x ** 2 for x in range(10_000_000)])   # builds a 10M-element list first
sum(x ** 2 for x in range(10_000_000))     # builds nothing; streams
\`\`\`

On a laptop the first can use 300+ MB of RAM. The second stays near zero. This is why interviewers who ask about pipelines care whether you reach for the parens or the brackets.

### 3) \`any\` / \`all\` — short-circuit for free

\`\`\`
has_negative = any(x < 0 for x in nums)
all_positive = all(x > 0 for x in nums)
\`\`\`

Both return as soon as they know the answer. Paired with a generator expression you get **early exit + no intermediate storage** — the Python idiom for "does at least one row match?" / "do all rows match?".

### 4) Read-vs-run mismatch, visualized

In \`[expr for x in data if pred]\`:

- Your **eye** goes \`expr → for x → if pred\`.
- Python goes \`for x → if pred → expr\`.

When debugging a comprehension that misbehaves, rewrite it as a loop **in execution order**, print the state after the \`if\`, and then collapse it back. That is the safest way to fix tricky ones.

### 5) The pattern library (memorize five)

- **Flatten**: \`[x for row in m for x in row]\`
- **Dedup-and-transform**: \`{s.casefold() for s in names}\`
- **Keyed index**: \`{u["id"]: u for u in users}\`
- **Enumerate + comprehension**: \`[(i, row) for i, row in enumerate(rows)]\`
- **Pair up**: \`dict(zip(keys, values))\` — not strictly a comprehension, but the same idiom.

If those five are automatic, you can solve ~half of all Python screens without thinking about syntax at all.`,

    tryGuidance:
      "Open the forge and run this loop in your head before clicking: pick a dataset, then a filter, then a transform, then the container. The pipeline shows execution order (filter before transform), while the **comprehension** and **equivalent for-loop** panels mirror each other line-by-line. Try flipping container to **generator** and notice the result is *not materialized* — that is the laziness story. Then try a dict container and watch what happens when two items transform to the same key (later wins).",

    knowledgeCheck: [
      {
        question: "In `[x ** 2 for x in nums if x > 0]`, what order does Python execute the pieces?",
        options: [
          "For each x, test `x > 0` first; if it passes, evaluate `x ** 2` and collect — filter runs *before* the expression.",
          "The expression `x ** 2` runs first for every x, and the filter drops invalid results afterward.",
          "Python evaluates all three simultaneously — order is undefined.",
        ],
        correctIndex: 0,
        explanation: "Reading order is expression-first, but execution order is iteration → filter → expression → collect. Getting this backward is the #1 beginner bug.",
      },
      {
        question: "What’s the difference between `{x for x in items}` and `{x: 1 for x in items}`?",
        options: [
          "The first is a set comprehension; the second is a dict comprehension. The colon makes it a dict.",
          "Both build dicts — the first just uses implicit `None` values.",
          "The first is a set; the second is a syntax error because dicts need explicit parentheses.",
        ],
        correctIndex: 0,
        explanation: "The colon between key and value is how Python disambiguates set vs dict comprehensions. No colon → set. With colon → dict.",
      },
      {
        question: "You want to replace negatives with 0 but keep every row. Which comprehension is correct?",
        options: [
          "[x if x >= 0 else 0 for x in nums]",
          "[x for x in nums if x >= 0 else 0]",
          "[x >= 0 else 0 for x in nums]",
        ],
        correctIndex: 0,
        explanation: "Conditional expression (`if/else`) goes at the **front** and always emits something. A tail `if` would *filter out* the negatives instead of replacing them, and the tail position does not accept `else`.",
      },
      {
        question: "`sum(x ** 2 for x in range(10_000_000))` vs `sum([x ** 2 for x in range(10_000_000)])`. The important difference is:",
        options: [
          "The generator expression streams values one at a time — no intermediate list is built, so memory stays flat.",
          "The list comprehension is always slower because brackets are parsed twice.",
          "They are identical — the outer parens are just a style choice.",
        ],
        correctIndex: 0,
        explanation: "Generators are lazy: each value is produced, consumed, and discarded. The list version allocates 10M elements before summing. Both return the same number; the memory bill is very different.",
      },
      {
        question: "Why is this an anti-pattern?\n\n`[logger.info(row) for row in rows]`",
        options: [
          "It uses a comprehension for its side effect and discards the returned list — write a for-loop instead. Comprehensions are for *producing* collections.",
          "Comprehensions can’t contain function calls.",
          "`logger.info` must be wrapped in a lambda inside a comprehension.",
        ],
        correctIndex: 0,
        explanation: "The throwaway list costs memory, and reviewers can’t tell at a glance whether the expression’s value matters. A plain `for row in rows: logger.info(row)` is both correct and obvious.",
      },
      {
        question: "What does `{k: v for k, v in zip(cols, row)}` do for `cols = ['id', 'name']` and `row = [1, 'ada']`?",
        options: [
          "Builds `{'id': 1, 'name': 'ada'}` — the idiomatic way to turn parallel lists into a dict.",
          "Zips the two lists into a single list of tuples.",
          "Raises a TypeError because `zip` is already a dict.",
        ],
        correctIndex: 0,
        explanation: "`zip` produces `(k, v)` pairs; the dict comprehension unpacks each pair and lays it in. You will write this pattern weekly in any CSV/ETL code.",
      },
      {
        question: "Two users share the same `'id'`. What happens in `{u['id']: u for u in users}`?",
        options: [
          "The later entry overwrites the earlier one — the final dict contains only one record per id, the last one seen.",
          "Python raises `ValueError: duplicate key`.",
          "Both entries are preserved in a list under the shared key.",
        ],
        correctIndex: 0,
        explanation: "Dict construction — whether literal, `dict()`, or comprehension — always lets the later key win. If you need to preserve all, use `defaultdict(list)` and append.",
      },
      {
        question: "`[x for row in matrix for x in row]` is equivalent to which nested for-loop?",
        options: [
          "`for row in matrix:\\n    for x in row:\\n        result.append(x)` — outer-to-inner, same order as written.",
          "`for x in row:\\n    for row in matrix:\\n        result.append(x)` — inner loops come first.",
          "It can't be nested; Python requires a separate comprehension per loop.",
        ],
        correctIndex: 0,
        explanation: "Multiple `for` clauses nest **in the order written**, outer-to-inner. Reversing them flips the iteration and usually raises NameError because the inner variable hasn't been bound yet.",
      },
    ],
  },

  "py-c1": {
    durationLabel: MODULE_TIME_LABEL,
    outcomes: [
      "Use Python's truthiness rules deliberately — and override them with `is None` or `len(x) == 0` when zero, empty string, or empty list are valid values.",
      "Choose between **if/elif chains**, **conditional expressions**, and **`match` / `case`** based on what you are actually branching on.",
      "Read and write the full **structural pattern matching** vocabulary: literal, capture, wildcard, OR, sequence, mapping, class, and guard.",
      "Avoid the **capture-pattern footgun** — knowing why `case ok:` silently swallows every value while `case Status.OK:` is a real comparison.",
      "Refactor a long if-elif chain into a **strategy dict** or a **match block** when the branching is dispatching on shape rather than on a boolean.",
    ],
    learnMarkdown: `## The branch primitives

Three pieces of syntax cover **every** decision in Python. Anything fancier is sugar.

\`\`\`
if predicate:        # statement form — only one branch runs
    ...
elif other:
    ...
else:
    ...

value = a if predicate else b      # conditional expression — produces a value

0 <= x < 10           # comparison chaining — evaluates x once, then ANDs the comparisons
\`\`\`

**Comparison chaining** is the one most people miss. \`a < b < c\` is **not** \`(a < b) < c\` — it is \`(a < b) and (b < c)\`, and \`b\` is evaluated **once**. That matters when \`b\` is an expensive call: \`0 < expensive() < 100\` calls it once, but \`0 < expensive() and expensive() < 100\` calls it twice.

---

## Truthiness — the rule and its trap

When you write \`if x:\`, Python calls \`bool(x)\`. The **falsy** values are exactly:

\`\`\`
None    False    0    0.0    0j    ""    b""    []    ()    {}    set()    range(0)
\`\`\`

Everything else — including \`"False"\` (a non-empty string), \`-1\`, and a custom object that doesn't override \`__bool__\` — is **truthy**.

The trap: \`if x:\` collapses **all** falsy values into one branch. That is fine when you genuinely mean "is this value present and non-empty." It is wrong whenever \`0\`, \`""\`, or \`[]\` is a **valid** value distinct from \`None\`:

\`\`\`
def render(label):
    if not label:                  # bug: an empty string is *also* a label policy
        label = "[no label]"

def render(label):
    if label is None:              # explicit — only the missing case rewrites
        label = "[no label]"
\`\`\`

**Heuristics**

- \`x is None\` — sentinel check. Always use \`is\`, not \`==\`.
- \`if not x\` — accept any falsy value. Use only when zero / empty really mean "absent".
- \`if len(x) == 0\` — explicitly check emptiness on a known collection.

---

## Short-circuit returns the **value**, not a bool

\`and\` and \`or\` are **not** booleans-only:

- \`a and b\` returns \`a\` if \`a\` is falsy, otherwise \`b\`.
- \`a or b\` returns \`a\` if \`a\` is truthy, otherwise \`b\`.

\`\`\`
name = user.name or "anonymous"     # idiomatic default-when-missing
config = override or DEFAULT_CONFIG # but watch out: empty dict {} is also falsy
\`\`\`

The same trap as above: if \`override = {}\` is a *valid* override (an explicit "no flags"), \`override or DEFAULT_CONFIG\` will silently replace it. Use \`override if override is not None else DEFAULT_CONFIG\` instead.

---

## \`match\` / \`case\` — structural pattern matching (3.10+)

\`match\` is **not** a faster switch. It compares the **shape** of a value against patterns and **binds names** along the way. The four moving parts:

\`\`\`
match subject:
    case PATTERN if GUARD:
        BODY
\`\`\`

The subject is evaluated **once**, then each \`case\` is tried **top-down**. The first match wins. Patterns that look like literal lookups are *equality checks*; patterns that look like names are **bindings** (this is the famous footgun, below).

### The pattern vocabulary

\`\`\`
case 200 | 201 | 204:        # OR pattern — any literal can match
case None:                   # literal pattern — equality with None
case "ok":                   # literal string

case [a, b]:                 # sequence — exactly two elements; binds a, b
case [head, *rest]:          # sequence with rest — binds head and rest as list
case []:                     # empty sequence

case {"type": "user", "id": uid}:   # mapping — keys must exist; extras allowed; binds uid
case {}:                            # empty mapping (matches any dict, even with keys! see below)

case Point(x, y):            # class pattern — uses Point.__match_args__ for positional
case Point(x=0, y=0):        # class pattern with kwargs — exact origin

case Point(x, y) if x == y:  # guard — runs after the pattern matches; rejects on False

case _:                      # wildcard — matches anything, binds nothing. Always last.
\`\`\`

A few subtleties worth burning in:

- A **mapping pattern** \`{}\` matches **any** dict, not only empty ones — extras are permitted by design.
- A **sequence pattern** does **not** match strings or bytes (Python explicitly excluded those, otherwise \`case [c]\` against \`"a"\` would always succeed).
- The **OR pattern** \`A | B\` requires both alternatives to bind the **same** names (or no names).
- A **guard** is part of the case — if it fails, the next case is tried; the subject is **not** rebound to a fresh search.

---

## The capture-pattern footgun

This is the single most asked-about gotcha in Python 3.10+ interviews:

\`\`\`
class Status:
    OK = 200

match resp.code:
    case Status.OK:           # match against the dotted constant 200
        ...
    case OK:                  # NOT a comparison — this **binds** OK = resp.code, ALWAYS matches
        ...
\`\`\`

The rule:

- A name with **a dot** in it (\`Status.OK\`, \`module.CONSTANT\`) is a **value pattern** → equality check.
- A **bare name** (\`OK\`, \`x\`, \`foo\`) is a **capture pattern** → it binds, and **always matches**.
- The single underscore \`_\` is the **wildcard** — matches anything, binds nothing.

Practical consequence: any \`case x:\` that looks like a "default" branch will silently swallow every input above your real cases if you put it too early. Either move it to the bottom or use \`case _:\`.

---

## When to use \`match\` vs \`if/elif\`

Use \`if/elif\` when you are branching on a **boolean** (a predicate):

\`\`\`
if user.is_active and user.balance > 0:
    charge(user)
elif user.is_active:
    nudge(user)
\`\`\`

Use \`match\` when you are branching on the **shape** of a value — types, structure, presence of keys:

\`\`\`
match event:
    case {"type": "view",  "page": p}: track_view(p)
    case {"type": "click", "id":  i}: track_click(i)
    case {"type": "error"}:            log_error(event)
    case _:                            ignore(event)
\`\`\`

If your chain is genuinely **dispatching on a key** to a function, the most senior move is often **neither** — it is a **dict of callables**:

\`\`\`
DISPATCH = {
    "view":  track_view,
    "click": track_click,
    "error": log_error,
}
DISPATCH.get(event["type"], ignore)(event)
\`\`\`

That is constant-time, pluggable at runtime, and trivially testable. \`match\` wins when the **shape** of each branch is different (different keys, different argument counts).

---

## Common pitfalls

- **\`if not x is None:\`** parses correctly but reads awkwardly. Always write \`if x is not None:\`.
- **\`if x == None:\`** works but is non-idiomatic and breaks for proxy objects that override \`__eq__\`. Use \`is None\`.
- **Forgetting \`else:\`** — silent fall-through is the cause of half of all "function returned None" bugs. If every branch returns, prefer **early-return**: \`if cond: return x; return y\`.
- **\`case [c]:\` against a string** — does not match. Strings are intentionally excluded from sequence patterns.
- **OR patterns binding inconsistent names** — \`case [x] | (x, y)\` is a SyntaxError because the two alternatives bind different names.
- **Putting \`case _:\` first** — every subsequent case is dead code. The linter won't always catch this.

---

## Interview hook (answer like a senior)

"Conditionals come in three flavours: \`if/elif\` for predicates, conditional expressions for value-pickers, and \`match\` for shape-based dispatch. The rule I follow: if the branches differ in **what is true**, use \`if\`; if they differ in **what the value looks like**, use \`match\`; if they differ only in **which function to call**, use a dispatch dict. The capture-pattern footgun is the one I always check for in code review — \`case foo:\` is *not* a comparison; it binds \`foo\` to the subject and always matches. Use a dotted name or wrap it in parentheses with \`Const.FOO\` to mean equality."`,

    video: null,
    videoFallbackMarkdown: `## Deep dive: branching like a senior

### 1) The truthiness gotcha trio

Three checks, three meanings — interview-grade trap:

\`\`\`
if x:                # any truthy value: not None, not 0, not "", not [], not {}
if x is None:        # only the literal None
if not x:            # any falsy value (None, 0, "", [], {})
\`\`\`

Concrete failure mode:

\`\`\`
def add_tag(tags=None):
    if not tags:
        tags = []
    tags.append("new")
    return tags
\`\`\`

What is wrong? \`add_tag([])\` reaches the \`if not tags:\` branch (an empty list is falsy), reassigns \`tags\` to a **new** \`[]\`, and the caller's list is left untouched. The fix is \`if tags is None\` — it preserves the caller's empty list while still defaulting when nothing was passed.

### 2) Pattern matching real-world examples

**HTTP routing** (clean):

\`\`\`
match response.status:
    case 200 | 201 | 204:
        return "ok"
    case 301 | 302 | 307 | 308:
        return "redirect"
    case n if 400 <= n < 500:
        return "client_error"
    case n if n >= 500:
        return "server_error"
    case _:
        return "unknown"
\`\`\`

**CLI command parsing**:

\`\`\`
match argv:
    case ["deploy", env, "--dry-run"]:
        plan(env)
    case ["deploy", env]:
        deploy(env)
    case ["rollback", env, version]:
        rollback(env, version)
    case ["help" | "-h" | "--help", *_]:
        print(USAGE)
    case _:
        print("unknown command", argv)
\`\`\`

**Event payload routing**:

\`\`\`
match event:
    case {"type": "user_signup",  "id": uid}:
        on_signup(uid)
    case {"type": "user_login",   "id": uid, "ip": ip}:
        on_login(uid, ip)
    case {"type": "user_logout",  "id": uid}:
        on_logout(uid)
    case {"type": kind, **rest}:
        log_unknown(kind, rest)
\`\`\`

The last case captures the type and **the remaining keys** as a dict — useful for forward-compatible logging.

### 3) The strategy-dict alternative

If every \`match\` branch is just "call this function", a dict is shorter and faster:

\`\`\`
ROUTES = {
    "user_signup":  on_signup,
    "user_login":   on_login,
    "user_logout":  on_logout,
}

def handle(event):
    handler = ROUTES.get(event["type"], default_handler)
    handler(event)
\`\`\`

You lose: the ability to pattern-match different shapes per case.
You gain: O(1) dispatch, runtime extensibility (\`ROUTES["new_event"] = ...\`), trivial unit-tests per handler.

Rule of thumb: if every \`case\` is the **same shape** with a different value, prefer the dict. If shapes differ, prefer \`match\`.

### 4) The capture-pattern bug, isolated

\`\`\`
status_codes = {"OK": 200, "FAIL": 500}

def classify(code):
    OK = 200
    FAIL = 500
    match code:
        case OK:           # BUG — binds OK = code, always matches
            return "ok"
        case FAIL:
            return "fail"
\`\`\`

\`classify(500)\` returns \`"ok"\`. The fix is one of:

- \`case 200:\` — literal pattern.
- \`case Codes.OK:\` — dotted-name value pattern (any name with a dot).
- \`case (OK):\` — **does not** help. Parentheses don't change pattern semantics.

This is the single most common Python 3.10 review comment.

### 5) Migration drill (do this on paper)

Take this if-elif chain and rewrite as a \`match\` block:

\`\`\`
def describe(value):
    if value is None:
        return "missing"
    if isinstance(value, int) and value == 0:
        return "zero int"
    if isinstance(value, list) and len(value) == 0:
        return "empty list"
    if isinstance(value, list) and len(value) == 1:
        return f"singleton [{value[0]}]"
    if isinstance(value, dict) and "id" in value:
        return f"record id={value['id']}"
    return "other"
\`\`\`

Senior solution:

\`\`\`
def describe(value):
    match value:
        case None:                 return "missing"
        case 0:                    return "zero int"
        case []:                   return "empty list"
        case [x]:                  return f"singleton [{x}]"
        case {"id": uid, **_rest}: return f"record id={uid}"
        case _:                    return "other"
\`\`\`

Half the lines, same behaviour, clearer intent. Note how \`case 0:\` quietly handles **only** integer 0 (and \`False\`, since \`False == 0\`) — if that asymmetry matters, add \`case 0 if value is not False:\` as a guard.`,

    tryGuidance:
      "Open the **branch router** and run two experiments. **Mode 1 (if-chain)**: pick the empty string `\"\"` and notice it falls all the way to the `isinstance(x, str)` branch — the truthiness branch never fires. Then pick `None` and watch the very first branch catch it. **Mode 2 (match/case)**: send `Point(0, 0)` and watch the `Point(x=0, y=0)` branch fire instead of `Point(x, y) if x == y` — first-match-wins. Then send `Point(3, 3)` and watch how the *order* of cases changes the answer. Finally, scroll to the wildcard `case _:` and ask yourself: which branches above it are reachable for which subjects?",

    knowledgeCheck: [
      {
        question: "Which list contains exactly Python's built-in falsy values?",
        options: [
          "`None`, `False`, `0`, `0.0`, `\"\"`, `[]`, `{}`, `set()`, `range(0)` — and any custom object whose `__bool__` returns False or whose `__len__` returns 0.",
          "Only `None` and `False` — everything else (including `0` and empty containers) is truthy.",
          "`None`, `False`, and any string spelled `\"false\"` regardless of case.",
        ],
        correctIndex: 0,
        explanation: "`bool(x)` calls `__bool__`, then falls back to `__len__`. Empty built-in containers and zero numerics are all falsy. The string `\"False\"` is non-empty, so it is **truthy** — a classic interview trap.",
      },
      {
        question: "What does this evaluate to and why?\n\n`0 or \"default\"`",
        options: [
          "`\"default\"` — `or` returns the first truthy operand, or the last operand if none are truthy. `0` is falsy, so the right side is returned.",
          "`True` — `or` always returns a boolean.",
          "`0` — `or` returns the left operand whenever it is defined.",
        ],
        correctIndex: 0,
        explanation: "`a or b` returns `a` if truthy, else `b`. The result is the **operand**, not a coerced bool. This is why `name = user.name or \"anonymous\"` is the idiomatic default-when-missing pattern — but be careful when an empty string is a *valid* value distinct from missing.",
      },
      {
        question: "Inside a `match` block, what does `case foo:` actually do?",
        options: [
          "Binds the local name `foo` to the subject and **always matches**. It is a capture pattern, not an equality check.",
          "Compares the subject to a variable named `foo` defined elsewhere; matches only when they are equal.",
          "Raises `SyntaxError` because `match` cases require a literal or dotted name.",
        ],
        correctIndex: 0,
        explanation: "Bare names in `case` patterns are **captures** — they bind, never compare. To compare against a constant, use a dotted name (`case Status.OK:`) or a literal (`case 200:`). This is the single most common bug in Python 3.10+ code review.",
      },
      {
        question: "Given the chain `0 <= x < 10`, which is true?",
        options: [
          "`x` is evaluated once, and the chain is equivalent to `(0 <= x) and (x < 10)` with short-circuit.",
          "`x` is evaluated twice — once per comparison — so an expensive `x = compute()` runs twice.",
          "The expression is parsed as `(0 <= x) < 10`, comparing a bool to 10.",
        ],
        correctIndex: 0,
        explanation: "Comparison chaining is one of Python's nicer surprises. The middle term is evaluated **once**, then the chain is `(0 <= x) and (x < 10)` with short-circuit. That is why `0 < expensive() < 100` calls `expensive()` exactly once.",
      },
      {
        question: "You match `[1, 2, 3]` against `case [head, *tail]:`. What gets bound?",
        options: [
          "`head = 1`, `tail = [2, 3]` — the spread captures the remainder as a list.",
          "`head = [1, 2, 3]`, `tail = []` — the spread always grabs everything.",
          "`head = 1`, `tail = 2` — the spread captures only the next element.",
        ],
        correctIndex: 0,
        explanation: "Sequence patterns with `*name` work like extended iterable unpacking: `head` takes one element from the start, `tail` takes the rest as a fresh list. Empty tail (`[1]` against `[head, *tail]`) gives `head=1, tail=[]`.",
      },
      {
        question: "`match` evaluation order — which is correct?",
        options: [
          "The subject is evaluated **once**; cases are tried **top-down**; the **first** match wins; later cases are skipped even if they would also match.",
          "All cases are tried in parallel and Python picks the most specific one.",
          "The subject is re-evaluated for every case until one matches.",
        ],
        correctIndex: 0,
        explanation: "Top-down, first-match-wins. That is why `case _:` must be the **last** branch and why `case Point(x, y):` placed above `case Point(x=0, y=0):` makes the more specific origin case unreachable.",
      },
      {
        question: "What is the cleanest way to default a config when the caller passes `None`, but **not** when they pass an explicit empty dict `{}`?",
        options: [
          "`config = override if override is not None else DEFAULT_CONFIG`",
          "`config = override or DEFAULT_CONFIG` — Python treats `{}` and `None` the same here, which is what we want.",
          "`config = bool(override) and override or DEFAULT_CONFIG`",
        ],
        correctIndex: 0,
        explanation: "`override or DEFAULT_CONFIG` collapses *every* falsy value, including `{}`. If an empty dict means \"no flags\" (a real choice the caller made), use the explicit `is not None` check.",
      },
      {
        question: "When does a `case Point(x, y) if x == y:` branch fire?",
        options: [
          "Only when the subject is a `Point` (matches the class pattern), `x` and `y` are bound, and the guard `x == y` evaluates True. If the guard fails, Python tries the next case.",
          "Whenever the subject is any object with `x` and `y` attributes — the guard runs first to filter out non-Points.",
          "Only when the subject is exactly `Point(0, 0)`; the guard is decorative.",
        ],
        correctIndex: 0,
        explanation: "Guards run **after** the pattern matches and bindings are made. If the guard fails, the case is rejected and the next one is tried — the bindings made during the failed match are discarded.",
      },
    ],
  },

  "py-c2": {
    durationLabel: MODULE_TIME_LABEL,
    outcomes: [
      "Distinguish an **iterable** (something you can ask for an iterator) from an **iterator** (the one-shot cursor itself), and know which one a given object is.",
      "Implement the **iterator protocol** by hand — `__iter__` returns the cursor, `__next__` returns the next value or raises `StopIteration` — and read what `for` does **under the hood**.",
      "Reach for **generators** (`yield` / `yield from`) to express lazy pipelines that stay flat in memory, even over multi-GB inputs.",
      "Use the right **`itertools`** primitive — `islice`, `chain`, `takewhile`, `groupby`, `tee` — instead of rebuilding them.",
      "Avoid the four canonical footguns: **one-shot exhaustion**, **iterating while mutating**, **late-binding closures in generators**, and **eager `list(...)` of an infinite stream**.",
    ],
    learnMarkdown: `## The mental model: a cursor, not a collection

A \`for\` loop in Python is sugar over **two** ideas you should be able to draw on a whiteboard:

1. An **iterable** is anything that knows how to *hand out a cursor*. \`__iter__()\` returns one.
2. An **iterator** is the cursor itself. \`__next__()\` returns the next value or raises \`StopIteration\` when there are no more.

That is the whole protocol. Lists, tuples, strings, dicts, sets, files, ranges, generators — every "thing you can loop over" is just a polite implementation of those two methods. When you write:

\`\`\`
for x in xs:
    work(x)
\`\`\`

Python rewrites it (roughly) as:

\`\`\`
_it = iter(xs)              # call xs.__iter__()
while True:
    try:
        x = next(_it)       # call _it.__next__()
    except StopIteration:
        break
    work(x)
\`\`\`

Burn that desugaring into your head. Half of Python's subtle bugs disappear when you can mentally run that loop in slow motion.

---

## Iterable vs iterator (this is the interview trap)

A **list** is an **iterable**, but it is **not** an iterator. You can ask it for as many fresh cursors as you like:

\`\`\`
xs = [1, 2, 3]
a = iter(xs); b = iter(xs)   # two independent cursors over the same list
next(a), next(a), next(b)    # 1, 2, 1
\`\`\`

A **generator** *is* an iterator — and \`iter(gen)\` returns *the generator itself*. There is no "rewind". This is why:

\`\`\`
g = (x * x for x in range(3))
list(g)         # [0, 1, 4]
list(g)         # [] — exhausted, the cursor is at the end
\`\`\`

The contract for an iterator: **\`__iter__\` returns \`self\`**, and \`__next__\` advances. That is why \`for x in g:\` works once and then silently does nothing the second time.

> **The check you should always run mentally:** "Is this thing fresh-each-time, or one-shot?" Lists/tuples/dicts/sets/strings/ranges → fresh. Files, generators, \`zip\`, \`map\`, \`filter\`, \`enumerate\`, \`reversed\`, \`itertools.*\` → one-shot.

---

## Writing an iterator by hand

The protocol has exactly three rules. If you can state them, you can pass any "implement an iterator" screen.

\`\`\`
class Countdown:
    def __init__(self, start):
        self.n = start

    def __iter__(self):       # rule 1: return the cursor (self)
        return self

    def __next__(self):       # rule 2: return next or raise StopIteration
        if self.n <= 0:
            raise StopIteration
        self.n -= 1
        return self.n + 1

for x in Countdown(3):
    print(x)                  # 3 2 1
\`\`\`

The footgun: \`__iter__\` returns \`self\`, so \`Countdown(3)\` is a one-shot. If you need fresh starts every time, separate the **iterable** (a factory) from the **iterator** (the cursor):

\`\`\`
class CountdownIterable:
    def __init__(self, start): self.start = start
    def __iter__(self): return CountdownIterator(self.start)   # build a fresh cursor

class CountdownIterator:
    def __init__(self, n): self.n = n
    def __iter__(self): return self
    def __next__(self):
        if self.n <= 0: raise StopIteration
        self.n -= 1
        return self.n + 1
\`\`\`

This is exactly how \`list\` is built: \`list.__iter__()\` returns a *new* \`list_iterator\` every time. Two layers, two responsibilities.

---

## Generators: the same protocol, written backwards

A generator function is a **factory for iterators**. Every \`yield\` pauses the function and hands a value to whoever called \`next()\`. The local variables — \`n\`, the loop counter, the open file handle — *survive* across yields. That is how a generator can stream a 50 GB log without holding it in memory.

\`\`\`
def countdown(n):
    while n > 0:
        yield n
        n -= 1
\`\`\`

That replaces the entire \`Countdown\` class above. Same protocol; one-quarter the code.

### \`yield\` vs \`return\` inside a generator

- \`yield x\` — produce a value, pause. The next \`next()\` resumes right after the yield.
- \`return\` (bare) — end the iteration. Raises \`StopIteration\` automatically.
- \`return x\` — also ends iteration; the value goes into \`StopIteration.value\` (rarely used outside \`yield from\`).

A function with **any** \`yield\` in its body is a generator function — calling it does **not** run the body, it returns a generator. This trips up beginners who write:

\`\`\`
def warmup():
    print("starting")
    yield from range(3)

warmup()           # nothing printed — the body has not started
list(warmup())     # *now* "starting" prints, then 0 1 2
\`\`\`

### \`yield from\` — delegation in one keyword

\`yield from sub\` does what a junior writes as:

\`\`\`
for v in sub:
    yield v
\`\`\`

…but it also forwards \`send()\`, \`throw()\`, and the final return value. In day-to-day code you use it for one reason: **flatten a stream of streams**.

\`\`\`
def walk(node):
    yield node.value
    for child in node.children:
        yield from walk(child)
\`\`\`

That is a tree traversal in four lines. No accumulator, no recursion-with-list, no \`extend\`.

---

## Generator expressions vs list comprehensions (the memory story)

Same grammar, different brackets:

\`\`\`
total = sum(x * x for x in range(10_000_000))   # generator — flat memory
total = sum([x * x for x in range(10_000_000)]) # list — ~300 MB on a laptop first
\`\`\`

Heuristic: **if the only thing you do with the comprehension is feed it to \`sum\` / \`max\` / \`min\` / \`any\` / \`all\` / a constructor — drop the brackets.** When a generator expression is the **sole** argument to a function, you can omit the outer parens, hence the idiomatic \`sum(x*x for x in nums)\`.

When you need to iterate it **twice**, *do* materialize. Generators do not rewind — and \`list(g)\` after \`max(g)\` is the canonical "why is my second loop empty?" bug.

---

## \`for / else\` — the keyword Python reuses for "loop completed without break"

\`\`\`
for item in haystack:
    if item == needle:
        print("found"); break
else:
    print("not found")     # runs only if the loop finished without hitting break
\`\`\`

The \`else\` is wired to the **\`break\`**, not to the iteration count. It exists because before \`any\`/\`all\` were idiomatic, this was the cleanest "search for X" pattern. Today most senior code just uses \`if any(...): ...\` instead — but the construct still appears in the standard library and in interview questions.

---

## \`break\`, \`continue\`, and the iteration-while-mutation footgun

Two rules that prevent 80% of loop bugs:

1. **Never mutate a collection while iterating it.** \`for x in xs: if cond(x): xs.remove(x)\` skips elements (because the cursor stays put while the list shifts). Iterate \`xs[:]\` (a copy) or build a new list with a comprehension.
2. **Files are iterators, not iterables.** \`for line in f:\` consumes the file. A second \`for line in f:\` reads zero lines until you \`f.seek(0)\`.

Same pattern, two different failure modes — both rooted in "iterators are stateful one-shot cursors".

---

## The \`itertools\` shortlist (memorize these six)

The standard library already wrote the loop you are about to write. The high-leverage primitives:

- **\`islice(it, start, stop, step)\`** — \`it[start:stop:step]\` for iterators that don't support slicing. \`islice(stream, 100)\` to take the first 100 items.
- **\`chain(a, b, c)\`** — concatenate iterables lazily. \`chain.from_iterable(rows)\` flattens one level.
- **\`takewhile(pred, it)\`** / **\`dropwhile(pred, it)\`** — stop / skip while a predicate is true. *Order-sensitive*: behavior depends on input order.
- **\`groupby(it, key=...)\`** — group **consecutive** equal-key runs. Sort first if you wanted SQL-style GROUP BY.
- **\`tee(it, n)\`** — fork an iterator into N independent cursors. Cheap if consumers stay in lockstep; otherwise it buffers.
- **\`zip(a, b, strict=True)\`** — pair items, raise on length mismatch (3.10+). Without \`strict=True\` it silently truncates to the shorter input — the cause of countless off-by-one bugs.

You will reach for \`enumerate(it, start=1)\` and \`reversed(seq)\` daily; both are iterators in their own right.

---

## When **not** to use a generator

This is the line between mid-level and senior judgment:

- **You need random access**, e.g. \`xs[10]\` or \`len(xs)\`. Generators support neither.
- **You need to iterate the data more than once.** Materialize as a list or use a fresh-each-time iterable.
- **The producer is faster than the consumer and you are I/O-bound on the *consumer*.** A queue + worker is usually the right structure, not a hand-rolled generator.
- **Side-effect-only loops.** \`def emit(): for row in rows: db.write(row)\` should be a plain function, not a generator that the caller forgets to consume — a generator function whose result is discarded **does nothing at all** because the body never starts.

---

## Pitfalls that cost production hours

- **The "empty the second time" bug.** \`g = (...); print(max(g)); print(min(g))\` returns the right max and an empty min.
- **\`zip\` truncation.** Mismatched lengths silently drop the tail. Use \`zip(..., strict=True)\` in 3.10+.
- **Late binding in a generator.** \`fns = [(lambda: i) for i in range(3)]\` — every lambda closes over the *same* \`i\`. The fix is \`lambda i=i: i\`. The same trap occurs with generator expressions that close over a loop variable.
- **\`itertools.tee\` with one slow consumer.** \`tee\` buffers everything between the fastest and slowest cursor. With one cursor stuck at element 0, \`tee\` ends up holding the *entire* stream.
- **Calling a generator function and ignoring the return value.** No body runs. Symptom: "my logging function does nothing." Cause: there is a \`yield\` in it somewhere.

---

## Interview hook (answer like a senior)

"A \`for\` loop is desugared into \`iter()\` then repeated \`next()\` until \`StopIteration\`. An *iterable* hands out cursors; an *iterator* is the cursor. Generators are the cleanest way to write an iterator — \`yield\` pauses the function, locals survive across yields, and \`yield from\` delegates. I reach for generator expressions whenever I only need an aggregate, because memory stays flat. The bugs to watch for are one-shot exhaustion, iterating-while-mutating, and \`zip\` silently truncating; \`itertools.islice\`, \`chain\`, and \`groupby\` cover almost everything else without rolling my own."`,

    video: null,
    videoFallbackMarkdown: `## Deep dive: build the iterator intuition

### 1) The "is this fresh each time?" reflex

Before you loop over anything twice, ask yourself: **iterable or iterator?** The cheap test is to call \`iter(x) is x\`. Iterators say \`True\` (they are their own cursor). Iterables say \`False\` (they hand out a *new* cursor each time).

\`\`\`
xs = [1, 2, 3]
iter(xs) is xs           # False — list is an iterable
g = (x for x in xs)
iter(g) is g             # True — generator is an iterator
\`\`\`

If you take only one mental tool from this lesson, take that one.

### 2) Tracing \`for\` by hand

Given:

\`\`\`
def evens(xs):
    for x in xs:
        if x % 2 == 0:
            yield x

it = evens([1, 2, 3, 4])
\`\`\`

What happens *before* you call \`next(it)\`? Nothing. The body of \`evens\` has not executed yet. Calling \`next(it)\` resumes it from the top, runs until the first \`yield 2\`, and pauses. The next \`next(it)\` resumes after the yield, finds the next even (4), yields. The third \`next(it)\` runs the loop to completion and falls off the end → \`StopIteration\`.

The thing to internalize: **the local frame of a paused generator is preserved on the heap**. \`x\` is still 4 between yields. That is what lets a generator stream a file without buffering it.

### 3) Lazy pipeline, drawn out

Compare these two log-processing pipelines that should answer "how many lines in this 50 GB log contain ERROR?":

**Eager (memory bomb):**

\`\`\`
lines = open("app.log").readlines()           # all 50 GB into RAM
errors = [l for l in lines if "ERROR" in l]   # another giant list
print(len(errors))
\`\`\`

**Lazy (flat memory):**

\`\`\`
with open("app.log") as f:
    errors = (line for line in f if "ERROR" in line)
    print(sum(1 for _ in errors))
\`\`\`

Same answer. Memory difference: gigabytes vs kilobytes. The lazy version walks the file one line at a time; the filter is a generator expression that consumes the file iterator one line at a time; \`sum(1 for _ in errors)\` is a counter that only ever holds one line plus a running total. Senior code looks like this on purpose.

### 4) The pipeline-of-generators pattern (write this twice from memory)

\`\`\`
def lines(path):
    with open(path) as f:
        yield from f

def parse(rows):
    for row in rows:
        ts, level, msg = row.rstrip("\\n").split("|", 2)
        yield {"ts": ts, "level": level, "msg": msg}

def errors(events):
    for e in events:
        if e["level"] == "ERROR":
            yield e

def first_n(it, n):
    for i, item in enumerate(it):
        if i >= n: return
        yield item

# composition is just nesting
preview = first_n(errors(parse(lines("app.log"))), 100)
for ev in preview:
    print(ev["ts"], ev["msg"])
\`\`\`

Every stage is a generator. Memory holds one record at a time. Each stage is independently testable with a small list input. This is *the* pattern interviewers want to see when they say "process a huge log file".

### 5) The \`itertools\` muscle memory drill

Match each natural-language request to the right primitive (do this on paper):

- "Take the first 1000 lines of a stream." → \`islice(stream, 1000)\`
- "Combine three sorted feeds into one (any order)." → \`chain(a, b, c)\`
- "Stop reading the moment a row's timestamp exceeds 23:59:59." → \`takewhile(lambda r: r.ts <= cutoff, rows)\`
- "Group consecutive rows with the same user_id." → \`groupby(rows, key=lambda r: r.user_id)\` *(after sorting!)*
- "Run the same stream through two pipelines." → \`tee(stream, 2)\`
- "Pair user IDs with their scores; raise if lengths differ." → \`zip(user_ids, scores, strict=True)\`

Knowing these six replaces about half of the loops a junior would write.

### 6) The four exhaustion-and-mutation bugs, isolated

\`\`\`
# A — generator exhaustion
g = (x for x in range(5))
print(list(g))     # [0, 1, 2, 3, 4]
print(list(g))     # [] — silently!

# B — mutating while iterating
xs = [1, 2, 3, 4]
for x in xs:
    if x % 2 == 0:
        xs.remove(x)
# xs is now [1, 3, 4], not [1, 3] — index moved while items shifted

# C — late binding in a generator-of-closures
fns = [lambda: i for i in range(3)]
[fn() for fn in fns]        # [2, 2, 2] — every lambda saw the *final* i

# D — zip silently truncates
list(zip([1, 2, 3], ['a', 'b']))             # [(1,'a'), (2,'b')] — 3 lost
list(zip([1, 2, 3], ['a', 'b'], strict=True))   # ValueError, as it should
\`\`\`

If you can spot all four in code review without running it, you are calibrated.`,

    tryGuidance:
      "Open the **iterator engine** below and run it in two passes. **Mode 1 (Iterator Protocol)**: pick a small source, then click *next()* repeatedly. Watch the cursor index advance, the consumed items move into the *yielded* tray, and the eventual `StopIteration`. Try clicking *next()* one more time after exhaustion — it stays raised, the cursor doesn't reset. **Mode 2 (Lazy Pipeline)**: pick a source and chain a *filter → map → take*. Click *pull* one step at a time and watch *only one item at a time* flow through every stage — that is laziness made visible. Compare with the *eager* toggle to see how the equivalent list-comprehension version would inflate intermediate lists. The bottom \"memory in flight\" counter tells the whole story: lazy stays at 1, eager grows linearly with N.",

    knowledgeCheck: [
      {
        question: "Which best describes how Python desugars `for x in xs: body`?",
        options: [
          "`it = iter(xs); while True: try: x = next(it); except StopIteration: break; body` — call `__iter__` once, then `__next__` repeatedly until it raises.",
          "Python builds the full list `list(xs)` first, then loops by integer index from 0 to `len - 1`.",
          "Python repeatedly calls `xs[0]`, `xs[1]`, … and stops on `IndexError` — only sequences can be iterated.",
        ],
        correctIndex: 0,
        explanation: "The protocol is `__iter__` (get a cursor) + `__next__` (advance, raise `StopIteration` at end). That is why **anything** that implements those two methods can be the right-hand side of `for x in …`, not just sequences.",
      },
      {
        question: "What is the difference between an **iterable** and an **iterator** in Python?",
        options: [
          "An iterable can produce a fresh cursor each time you call `iter()` on it; an iterator **is** the cursor and is one-shot — `iter(it) is it` returns True.",
          "They are the same thing — Python uses the names interchangeably.",
          "An iterator supports random access (`it[3]`) while an iterable only supports `for` loops.",
        ],
        correctIndex: 0,
        explanation: "Lists, dicts, strings, ranges, sets are *iterables* — `iter(xs)` returns a brand-new cursor. Generators, files, `map`/`filter`/`zip`, `itertools.*` are *iterators* — they're their own cursor and exhaust after one full pass.",
      },
      {
        question: "What does this print?\n\n```\ng = (x * x for x in range(3))\nprint(sum(g))\nprint(sum(g))\n```",
        options: [
          "`5` then `0` — the first `sum` exhausts the generator; the second sees no values left.",
          "`5` then `5` — generator expressions are reusable like list comprehensions.",
          "`StopIteration` on the second `sum` because the generator hasn't been re-created.",
        ],
        correctIndex: 0,
        explanation: "Generator expressions are **iterators**, not iterables — once consumed, they're exhausted. `sum(empty_iterator)` is `0`, not an error. The fix is either materialize once (`xs = list(g)`) or rebuild the generator before each pass.",
      },
      {
        question: "Inside a function, what does writing `yield` anywhere in the body change?",
        options: [
          "Calling the function returns a **generator** without executing any of the body. The body only runs (in slices) when something calls `next()` on that generator.",
          "It's a synonym for `return` — the function still runs eagerly and returns a single value.",
          "It marks the function as `async`; you must call it with `await`.",
        ],
        correctIndex: 0,
        explanation: "A `yield` (anywhere in the body, even inside an `if False:`) makes the function a generator function. Invocation builds a paused generator object; the body advances only on each `next()`. That is why `def emit(): for row in rows: db.write(row); yield row` does **nothing** if the caller doesn't iterate the result.",
      },
      {
        question: "You need to walk a tree of nodes and stream every value. Which is the cleanest implementation?",
        options: [
          "```\ndef walk(n):\n    yield n.value\n    for c in n.children:\n        yield from walk(c)\n```",
          "```\ndef walk(n):\n    out = [n.value]\n    for c in n.children:\n        out.extend(walk(c))\n    return out\n```",
          "```\ndef walk(n):\n    return [n.value] + [walk(c) for c in n.children]\n```",
        ],
        correctIndex: 0,
        explanation: "`yield from` delegates iteration to a sub-generator — it forwards values, `StopIteration`, and even `send`/`throw`. The list-building alternatives materialize the entire tree in memory, defeating the point of streaming.",
      },
      {
        question: "Which of these is **NOT** safe for the same reason as the others?\n\n(a) `for line in file:` then later `for line in file:`  \n(b) `g = (x for x in xs); list(g); list(g)`  \n(c) `for x in [1,2,3]: print(x)` followed by another `for x in [1,2,3]:`",
        options: [
          "(c) — lists are iterables, so they hand out a fresh cursor each `for`. (a) and (b) share the bug: files and generator expressions are one-shot iterators.",
          "(a) — files are special-cased and cannot be re-iterated even after `seek(0)`.",
          "(b) — generator expressions actually buffer their results invisibly, so the second `list(g)` works fine.",
        ],
        correctIndex: 0,
        explanation: "Files and generator expressions are iterators (their `__iter__` returns `self`); lists are iterables (their `__iter__` returns a *new* `list_iterator` each call). The first two silently appear empty on the second pass; the list works because it minted a fresh cursor.",
      },
      {
        question: "What does `list(zip([1, 2, 3], ['a', 'b']))` produce, and what's the senior fix when lengths *should* match?",
        options: [
          "`[(1, 'a'), (2, 'b')]` — `zip` truncates to the shortest input silently. Use `zip(..., strict=True)` (3.10+) to raise `ValueError` on length mismatch.",
          "Raises `ValueError` because the lengths differ.",
          "`[(1, 'a'), (2, 'b'), (3, None)]` — `zip` pads with `None`. Use `itertools.zip_longest(..., fillvalue=0)` for explicit zeroes.",
        ],
        correctIndex: 0,
        explanation: "Default `zip` truncation is the cause of countless off-by-one bugs in joining parallel arrays. `strict=True` makes the assumption explicit; `zip_longest` is the alternative when you genuinely want padding.",
      },
      {
        question: "`itertools.groupby(rows, key=lambda r: r['user_id'])` returns a single group when you expected three. What's the most likely cause?",
        options: [
          "`groupby` only collapses **consecutive** equal-key runs — it does not sort. The input must be sorted by the same key first, otherwise the same user_id appears in multiple non-adjacent groups.",
          "`groupby` requires hashable keys; integer `user_id`s are unhashable.",
          "`groupby` returns a single group whenever the iterable is a generator; you must call `list()` first.",
        ],
        correctIndex: 0,
        explanation: "This is the single most-asked `itertools` interview trap. `groupby` is a streaming primitive — it walks once and breaks the stream wherever the key value changes. To get SQL-`GROUP BY` semantics, sort first: `groupby(sorted(rows, key=k), key=k)`.",
      },
    ],
  },

  "py-c3": {
    durationLabel: MODULE_TIME_LABEL,
    outcomes: [
      "Read any Python signature and **classify every parameter** into one of five slots: positional-only, positional-or-keyword, `*args`, keyword-only, `**kwargs`.",
      "Use the **`/`** and **`*`** markers deliberately to lock down API contracts (PEP 570) — and know what each one forbids the caller from doing.",
      "Bind arguments at the call site fluently: positional, keyword, `*iterable` unpack, `**mapping` unpack — and predict every `TypeError` before running the code.",
      "Avoid the four **default-value footguns**: mutable defaults shared across calls, `None`-sentinel patterns, defaults evaluated at definition time, and accidental capture of loop variables.",
      "Choose between **`*args` / `**kwargs` passthrough**, an explicit signature, and a TypedDict / dataclass when designing wrapper functions and decorators.",
    ],
    learnMarkdown: `## The mental model: a signature is a contract with five slots

Every Python function signature is a contract written in **five slots**, in fixed order:

\`\`\`
def f(POS_ONLY,  /,  POS_OR_KW,  *ARGS,  KW_ONLY,  **KWARGS):
                    └── default      └── default       └── absorbs
\`\`\`

Read left to right:

1. **Positional-only** — before the \`/\`. Must be passed by position. Caller cannot use the name. (PEP 570, 3.8+.)
2. **Positional-or-keyword** — between \`/\` and \`*\`. The default. Can be passed either way.
3. **\`*args\`** — soaks up *extra* positional arguments into a tuple. Optional. Acts as a **divider**: anything after it is keyword-only.
4. **Keyword-only** — after \`*args\` (or after a bare \`*\`). Must be passed by name.
5. **\`**kwargs\`** — soaks up *extra* keyword arguments into a dict. Always last.

If you can name those five slots and place a parameter in the right one, you can read 100% of Python signatures and write APIs that hold up under review.

### A signature with all five

\`\`\`
def render(template, /, data, *layers, theme="dark", **opts):
    ...
\`\`\`

- \`template\` — positional-only. \`render(template="...")\` is a \`TypeError\`.
- \`data\` — positional-or-keyword. \`render(t, data={...})\` is fine.
- \`layers\` — \`*args\`. \`render(t, d, "header", "footer")\` makes \`layers == ("header", "footer")\`.
- \`theme\` — keyword-only (it's after \`*layers\`). \`render(t, d, "header", "dark")\` does **not** set theme; \`"dark"\` joins \`layers\`.
- \`opts\` — \`**kwargs\`. Anything else \`render(..., debug=True)\` lands in \`opts\`.

---

## The bare \`*\` — keyword-only without absorbing positionals

If you don't want a variadic but you *do* want the rest of the parameters to be keyword-only, use a **bare** \`*\`:

\`\`\`
def connect(host, port, *, timeout=10, retries=3):
    ...
\`\`\`

\`connect("db", 5432, 30)\` is a \`TypeError\` — the third positional has no slot, because the \`*\` ate the positional cursor without absorbing anything. The caller is *forced* to write \`timeout=30\`. That is how you make boolean and numeric flags self-documenting at the call site.

---

## Default values are evaluated **once**, at definition time

This is the single most asked-about Python footgun:

\`\`\`
def append_to(item, target=[]):
    target.append(item)
    return target

append_to(1)   # [1]
append_to(2)   # [1, 2] — surprise! same list reused across calls
append_to(3)   # [1, 2, 3]
\`\`\`

The default \`[]\` is **one list object**, created when \`def\` runs, and re-used for every call that omits the argument. Same trap with \`{}\`, \`set()\`, \`Counter()\`, or any constructor that returns a fresh mutable object.

### The fix: use \`None\` as a sentinel and build inside

\`\`\`
def append_to(item, target=None):
    if target is None:
        target = []
    target.append(item)
    return target
\`\`\`

The default value is now \`None\` (an immutable singleton, no shared state), and a fresh list is built **inside** the body each call.

### When immutable defaults are fine

\`\`\`
def greet(name, greeting="hello"):  # str is immutable — perfectly safe
def page(rows, page_size=50):       # int is immutable — perfectly safe
def split(line, sep=","):           # str again — safe
\`\`\`

Strings, numbers, tuples, frozensets, \`None\`: all immutable. Defaults are the same object every call, but no one can mutate them.

---

## \`*args\` — variadic positional

\`*args\` packs *zero or more* extra positional arguments into a tuple.

\`\`\`
def total(*nums):
    return sum(nums)

total()           # 0   — empty tuple is fine
total(1)          # 1
total(1, 2, 3)    # 6
\`\`\`

Two senior-level usage rules:

- The name \`args\` is convention, not a rule — \`*nums\` is fine and clearer when you have a domain word.
- \`*args\` produces a **tuple**, not a list. It is *not* shared across calls (each call gets a fresh tuple). The mutable-default trap does not apply.

### Forwarding through wrappers

The whole point of \`*args\` (combined with \`**kwargs\`) is **transparent forwarding**:

\`\`\`
def timed(fn):
    def wrapper(*args, **kwargs):
        t0 = time.perf_counter()
        result = fn(*args, **kwargs)
        log.info("%s took %.3fms", fn.__name__, 1000 * (time.perf_counter() - t0))
        return result
    return wrapper
\`\`\`

\`wrapper\` does not need to know \`fn\`'s signature. It absorbs everything, forwards everything. This is how every decorator you have ever read is written.

---

## \`**kwargs\` — variadic keyword

\`**kwargs\` packs *zero or more* extra keyword arguments into a **dict**.

\`\`\`
def configure(**options):
    return options

configure(host="db", port=5432)   # {"host": "db", "port": 5432}
configure()                       # {}
\`\`\`

The dict is *fresh per call*. Senior idioms:

- **Filter and forward**: \`fn(**{k: v for k, v in opts.items() if k in ALLOWED})\` to strip unknown options before passing through.
- **Merge with defaults**: \`final = {**DEFAULTS, **opts}\` — later keys win, so caller-provided values override defaults. Same as \`DEFAULTS | opts\` in 3.9+.
- **Avoid as the public API**: a function that takes only \`**kwargs\` is undocumented by construction. Reach for it for *forwarding*, not for primary arguments.

---

## The three call-site forms (and unpacking)

At the call site, every argument is one of three things:

\`\`\`
f(value)        # positional — fills the next pos slot
f(name=value)   # keyword     — binds to that named slot
f(*iterable)    # positional unpack — each element fills the next pos slot
f(**mapping)    # keyword unpack    — each key=value binds by name
\`\`\`

You can mix and match:

\`\`\`
def fmt(template, /, *parts, sep=" "):
    return template.format(*parts, sep=sep)

args = ("a", "b", "c")
opts = {"sep": "-"}
fmt("{}/{}/{}", *args, **opts)
\`\`\`

Two rules to memorize:

- **Positionals (and \`*\`-unpacks) come before keywords (and \`**\`-unpacks)** at the call site.
- A name cannot be bound twice — \`f(1, x=1)\` where \`1\` already filled \`x\` is a \`TypeError: got multiple values for argument 'x'\`.

---

## The order of things — the mental rule that prevents 90% of TypeErrors

When Python binds a call to a signature, it walks **positionals first, then keywords**:

1. Pull positional args from left to right, fill positional-only slots, then positional-or-keyword slots, **then** dump the rest into \`*args\` if present.
2. Pull keyword args, bind by name into positional-or-keyword *or* keyword-only slots.
3. Anything left after step 2 lands in \`**kwargs\` if present, else \`TypeError: unexpected keyword argument\`.
4. Any required slot still empty → \`TypeError: missing required argument\`.
5. Any positional-or-keyword slot already filled by a positional that *also* gets a keyword → \`TypeError: got multiple values\`.

Almost every \`TypeError\` you will ever see from a Python call comes from one of these five rules.

---

## Positional-only \`/\` — a contract, not a quirk

\`\`\`
def at(seq, idx, /):
    return seq[idx]
\`\`\`

\`at("ada", 1)\` works. \`at(seq="ada", idx=1)\` is a \`TypeError\`. Why bother forbidding the keyword form?

- **API stability** — once you publish \`def get(key)\`, every caller starts writing \`get(key="x")\`, and you can never rename \`key\` without breaking them. Lock it down with \`/\` and the parameter name is private.
- **Override flexibility** — internal subclasses can rename the parameter without breaking callers.
- **Built-ins do this** — \`len(obj=...)\` does not work; \`obj\` is positional-only. PEP 570 just gave us the syntax.

---

## Forwarding correctly: the \`functools.wraps\` and \`(*args, **kwargs)\` pattern

\`\`\`
from functools import wraps

def cache(fn):
    seen = {}
    @wraps(fn)                       # preserves __name__, __doc__, __wrapped__
    def wrapper(*args, **kwargs):
        key = (args, tuple(sorted(kwargs.items())))
        if key not in seen:
            seen[key] = fn(*args, **kwargs)
        return seen[key]
    return wrapper
\`\`\`

Two non-obvious bits:

- The cache key joins \`args\` (already a tuple, hashable) with \`sorted(kwargs.items())\` because \`{"a":1,"b":2}\` and \`{"b":2,"a":1}\` should hit the same cache entry.
- \`@wraps(fn)\` copies the wrapped function's name and docstring onto the wrapper so introspection (\`help(wrapper)\`, \`wrapper.__name__\`) still shows the original — without it, every cached function looks like \`<function wrapper at ...>\`.

---

## Pitfalls that cost production hours

- **Mutable default arg.** Already covered. The single most-tested Python interview gotcha.
- **\`*args\` greedy capture.** \`def f(*args, x=1)\`: \`f(1, 2, 3)\` puts everything in \`args\` and \`x\` stays \`1\`. The caller must write \`f(1, 2, 3, x=99)\`.
- **\`f(1, x=1)\` when \`x\` is the first parameter.** "TypeError: f() got multiple values for argument 'x'." Common when a positional argument was added later and a caller used the keyword form for the original parameter.
- **\`f(a=1, b=2)\` to a positional-only.** "TypeError: f() got some positional-only arguments passed as keyword arguments."
- **Late binding inside a closure.** \`fns = [lambda: i for i in range(3)]\` — every lambda closes over the *same* \`i\`. Fix: \`lambda i=i: i\` (default args are evaluated at function definition, capturing the current value).
- **\`return\` with no value.** Returns \`None\`. Forgetting \`return\` is the #1 cause of "my function did the work but the result is None" bugs — happens twice as often inside \`if\` chains where one branch forgets it.

---

## Interview hook (answer like a senior)

"A Python signature has five slots in fixed order: positional-only (before \`/\`), positional-or-keyword, \`*args\`, keyword-only (after \`*\` or \`*args\`), \`**kwargs\`. The bare \`*\` is how I make boolean flags keyword-only at the call site so the code reads. Defaults are evaluated once at definition time, so I use \`None\` as a sentinel for any mutable default. Decorators forward with \`(*args, **kwargs)\` plus \`functools.wraps\` to preserve introspection. The \`TypeError\`s — \`missing\`, \`unexpected\`, \`multiple values\` — all map back to the same five binding rules."`,

    video: null,
    videoFallbackMarkdown: `## Deep dive: read every signature in Python

### 1) The signature decoder ring

For any signature you encounter, mark each parameter with one of five letters: **P** (positional-only), **B** (both), **A** (\`*args\`), **K** (keyword-only), **W** (\`**kwargs\`). Then a "weird" signature becomes obvious:

\`\`\`
def f(a, b, /, c, d=1, *e, g, h=2, **i):
#     P  P     B  B     A  K  K     W
\`\`\`

- \`a, b\` — positional-only, must be passed by position
- \`c\` — positional-or-keyword, required
- \`d\` — positional-or-keyword, default 1
- \`e\` — variadic positional → tuple
- \`g\` — keyword-only, required
- \`h\` — keyword-only, default 2
- \`i\` — variadic keyword → dict

Mark every signature you read with that ring for a week and reading Python APIs becomes a glance, not a puzzle.

### 2) The TypeError taxonomy

When a call fails to bind, the error message tells you *exactly* which rule was broken:

\`\`\`
TypeError: f() missing 1 required positional argument: 'x'
    → required slot left empty after positionals + keywords were placed.

TypeError: f() got an unexpected keyword argument 'y'
    → keyword name has no matching slot, and there is no **kwargs to absorb it.

TypeError: f() got multiple values for argument 'x'
    → the same slot was filled by both a positional and a keyword.

TypeError: f() takes 2 positional arguments but 3 were given
    → too many positionals, and there is no *args.

TypeError: f() got some positional-only arguments passed as keyword arguments: 'a'
    → caller used name=value for a parameter behind the / divider.
\`\`\`

If you can recite this taxonomy, you will diagnose 90% of "why does this call fail?" issues from the message alone.

### 3) Mutable defaults — the long version

\`\`\`
def add_user(name, tags=[]):
    tags.append(name + "_default")
    return tags
\`\`\`

What goes wrong, traced step by step:

1. \`def\` runs. Python evaluates \`[]\` once, binds it as the default for \`tags\`.
2. \`add_user("ada")\` — \`tags\` is the shared default list. Append \`"ada_default"\`. Return reference to that list. List is now \`["ada_default"]\`.
3. \`add_user("brad")\` — \`tags\` is the **same** shared list (still \`["ada_default"]\`). Append \`"brad_default"\`. Return same list. Now \`["ada_default", "brad_default"]\`.
4. The caller has the same list reference both times. Any code that retained the first return value sees the second value sneak into its data structure.

The bug is silent — no exception, just slowly corrupted state. Always use \`None\` as the sentinel and build inside.

### 4) Designing wrappers — the \`(*args, **kwargs)\` discipline

The forwarding pattern only works if you commit to it fully:

\`\`\`
def retry(times=3):
    def deco(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            last = None
            for _ in range(times):
                try:
                    return fn(*args, **kwargs)
                except Exception as e:
                    last = e
            raise last
        return wrapper
    return deco

@retry(times=5)
def fetch(url, *, timeout=10):
    ...
\`\`\`

Notice:

- \`wrapper\` accepts **any** call shape, forwards it unchanged. The wrapped \`fetch\` keeps its real signature for tools that introspect it (\`@wraps\` preserves \`__wrapped__\`).
- The \`retry(times=5)\` outer factory takes its *own* arguments — that is why decorators with arguments need an extra level of nesting.

The discipline: **do not rename or reorder \`*args\` / \`**kwargs\` inside a wrapper**. Forward them exactly as received.

### 5) When to escape \`**kwargs\` — TypedDict / dataclass

\`**kwargs\` is a hammer. Most APIs are screws.

\`\`\`
# WRONG — every caller has to read the source to know what's accepted
def render(template, **opts):
    theme = opts.get("theme", "dark")
    layout = opts.get("layout", "wide")
    ...
\`\`\`

\`\`\`
# RIGHT — the type checker, IDE, and every reader can see the shape
@dataclass
class RenderOpts:
    theme: str = "dark"
    layout: str = "wide"

def render(template, opts: RenderOpts = RenderOpts()):
    ...
\`\`\`

Or, if you must keep keyword-flexibility for forwarding:

\`\`\`
from typing import TypedDict, Unpack       # 3.11+

class RenderOpts(TypedDict, total=False):
    theme: str
    layout: str

def render(template: str, **opts: Unpack[RenderOpts]) -> str:
    ...
\`\`\`

Senior judgment: \`**kwargs\` is for **forwarding through layers you don't own**. For your own public API, declare the parameters explicitly.

### 6) The five-second drill

For each call below, predict pass/fail and (if fail) which rule:

\`\`\`
def f(a, b, /, c, *d, e, **g): ...

f(1, 2, 3)                            # ?
f(1, 2, c=3, e=5)                     # ?
f(1, 2, 3, 4, 5, e=6, x=7)            # ?
f(a=1, b=2, c=3, e=5)                 # ?
f(1, 2, 3, e=5, c=99)                 # ?
\`\`\`

Answers: ① fails — \`e\` is required keyword-only, missing. ② passes — \`a=1, b=2, c=3, e=5\`, \`d=()\`, \`g={}\`. ③ passes — \`a=1, b=2, c=3, d=(4,5), e=6, g={"x":7}\`. ④ fails — \`a\` and \`b\` are positional-only, can't be passed as keywords. ⑤ fails — \`c\` is filled by the positional \`3\` and again by the keyword \`c=99\` → multiple values.

If you can do that in five seconds per call, you have internalized the binding rules.`,

    tryGuidance:
      "Open the **argument binder** below and run two experiments. **Mode 1 (signature)**: pick a signature with all five slot kinds (the *render* example) and watch the divider lines for `/` and `*` — every parameter to the left of `/` is positional-only, every parameter to the right of `*` is keyword-only. **Mode 2 (call site)**: add positional, keyword, `*list`, and `**dict` arguments and watch them route into the slots in real time. The arrows turn red the moment a binding rule breaks — *missing required*, *multiple values*, *unexpected keyword*. Toggle the *mutable default* example to see the same default-list object grow across three call frames — that is the bug, made literal.",

    knowledgeCheck: [
      {
        question: "Name the five parameter slots a Python signature can contain, **in the order they must appear**.",
        options: [
          "positional-only (before `/`), positional-or-keyword, `*args`, keyword-only (after `*` or `*args`), `**kwargs` — and `**kwargs` is always last.",
          "`*args`, `**kwargs`, positional-only, keyword-only, positional-or-keyword — the order is flexible as long as `**kwargs` is last.",
          "Required, optional, default, variadic, named — Python normalizes the syntax internally.",
        ],
        correctIndex: 0,
        explanation: "PEP 570 + PEP 3102 give the canonical order. The `/` and `*` are *dividers* between slot kinds, and `**kwargs` is always the rightmost slot. Memorize the ordering and most signature-related TypeErrors become obvious.",
      },
      {
        question: "What does this print, and why?\n\n```\ndef add(item, target=[]):\n    target.append(item)\n    return target\n\nprint(add(1))\nprint(add(2))\n```",
        options: [
          "`[1]` then `[1, 2]` — the default `[]` is created **once** at definition time and reused across every call that omits the argument.",
          "`[1]` then `[2]` — Python builds a fresh empty list per call.",
          "`[1]` then `[1]` — the second call's append silently fails because the default is locked.",
        ],
        correctIndex: 0,
        explanation: "Default values are evaluated once when `def` runs. Mutable defaults persist across calls. The fix is `target=None` plus `if target is None: target = []` inside the body — a fresh list per call, no shared state.",
      },
      {
        question: "Inside `def connect(host, port, *, timeout=10):`, what does the bare `*` do?",
        options: [
          "Makes every parameter to its right **keyword-only** without absorbing any extra positionals — `connect('db', 5432, 30)` raises TypeError because the third positional has no slot.",
          "Marks `timeout` as variadic — it can absorb multiple positional arguments.",
          "Is a syntax error in modern Python; you must write `**timeout=10`.",
        ],
        correctIndex: 0,
        explanation: "A bare `*` is the keyword-only divider without an `args` name. It is the senior idiom for forcing readable call sites: `connect('db', 5432, timeout=30)` is self-documenting; `connect('db', 5432, 30)` would silently swap timeout and port if the signature changed.",
      },
      {
        question: "How does Python decide where each argument goes when binding `f(1, 2, x=3)` to a signature?",
        options: [
          "Positionals fill positional-only and positional-or-keyword slots left-to-right (overflow lands in `*args`); then keywords bind by name into positional-or-keyword and keyword-only slots; leftover keywords land in `**kwargs` or raise.",
          "Keywords are placed first by name; then positionals fill whatever slots remain, including keyword-only ones.",
          "Python tries every permutation and picks whichever produces no TypeError.",
        ],
        correctIndex: 0,
        explanation: "Positionals first (left-to-right), keywords second (by name), then leftovers into `**kwargs` or error. Every signature TypeError — *missing required*, *multiple values*, *unexpected keyword* — comes from a slot left empty or a slot filled twice in this two-pass walk.",
      },
      {
        question: "Why does `def get(key, /):` exist as a pattern? What does the `/` buy you?",
        options: [
          "It makes `key` **positional-only** — callers must write `get(\"x\")`, never `get(key=\"x\")` — which lets you rename the parameter later without breaking any caller.",
          "It enables fast-path lookup; positional-only parameters bypass the keyword-binding step internally.",
          "It is purely cosmetic — `/` has no effect at runtime, only in type checkers.",
        ],
        correctIndex: 0,
        explanation: "PEP 570 introduced `/` so library authors can hide parameter names from the public API. Built-ins like `len(obj, /)` and `dict.pop(key, /, default)` use it precisely so the names are not part of the contract.",
      },
      {
        question: "You write `f(1, 2, x=99)` and `f` is `def f(x, y, z): ...`. What goes wrong?",
        options: [
          "TypeError: got multiple values for argument 'x' — the positional `1` filled `x`, and then `x=99` tried to fill it again.",
          "TypeError: missing required argument 'z' — only `x`, `y`, and `x` were provided; `z` is empty.",
          "It silently overwrites: `x=99`, `y=2`, `z=1`.",
        ],
        correctIndex: 0,
        explanation: "When a positional fills a positional-or-keyword slot, the keyword form for that same slot is now forbidden. *Multiple values for argument* is one of the five canonical TypeErrors and almost always a copy-paste / refactor mistake.",
      },
      {
        question: "What is the correct decorator wrapper signature for transparent forwarding?",
        options: [
          "```\ndef wrapper(*args, **kwargs):\n    return fn(*args, **kwargs)\n```",
          "```\ndef wrapper(args, kwargs):\n    return fn(args, kwargs)\n```",
          "```\ndef wrapper(args=(), kwargs={}):\n    return fn(*args, **kwargs)\n```",
        ],
        correctIndex: 0,
        explanation: "The `*args, **kwargs` form is the only one that absorbs *any* call shape. Option 2 receives a tuple and dict but never unpacks them, so callers must construct them explicitly. Option 3 has the mutable-default footgun and the same unpacking issue. The senior version also adds `@functools.wraps(fn)` so introspection still sees the original.",
      },
      {
        question: "What does `f(*[1, 2], **{\"x\": 3})` mean at the call site?",
        options: [
          "Positional unpack: each element of `[1, 2]` becomes a positional argument. Keyword unpack: each `key=value` from the dict becomes a keyword argument. Equivalent to `f(1, 2, x=3)`.",
          "Builds a list and a dict, then calls `f` with exactly two arguments — a list and a dict.",
          "Raises SyntaxError; you cannot mix `*` and `**` in the same call.",
        ],
        correctIndex: 0,
        explanation: "`*` and `**` at the call site are the inverse of `*args` and `**kwargs` in the signature. They unpack an iterable (or mapping) into individual positional (or keyword) arguments. The same call also follows the binding rules: positionals are placed first, then keywords.",
      },
    ],
  },

  "py-c4": {
    durationLabel: MODULE_TIME_LABEL,
    outcomes: [
      "Read and write a **lambda** fluently — and know its three hard restrictions (single expression, no statements, anonymous in tracebacks).",
      "Use **`map`**, **`filter`**, and **`functools.reduce`** with a clear mental model: *transform / keep / fold* — and remember they all return **iterators** in Python 3.",
      "Default to a **comprehension** over `map` / `filter` when readability is the tiebreaker, and pick the right escape hatch — `operator.*`, `functools.partial`, named `def` — when a lambda becomes a smell.",
      "Pick the right **reducer**: `sum` / `min` / `max` / `any` / `all` / `Counter` / `statistics.fmean` — and only fall back to **`reduce`** for genuinely custom folds.",
      "Avoid the four canonical **lambda traps**: late-binding closures in loops, multi-statement temptation, lambdas as dict keys, and reaching for `lambda` where `operator.itemgetter` / `attrgetter` is shorter and faster.",
    ],
    learnMarkdown: `## The mental model: three primitives, one shape

\`map\`, \`filter\`, and \`reduce\` are the three things you can do to a stream of values:

\`\`\`
map(fn, xs)        # transform each → 1:1
filter(pred, xs)   # keep matches  → 1:0-or-1
reduce(fn, xs)     # fold to one   → N:1
\`\`\`

If you can name those three operations and pick the right one for a problem, you have ~80% of "functional Python" covered. Lambdas are the **inline syntax** for the function each one needs. Together they form the core of every "transform a list" interview question.

> Heuristic: **same shape out → \`map\`. Subset out → \`filter\`. Single value out → \`reduce\` (or one of its specialized siblings: \`sum\`, \`max\`, \`min\`, \`any\`, \`all\`).**

---

## Lambda: anonymous, single-expression, that is the whole story

\`\`\`
square = lambda x: x * x
add    = lambda a, b: a + b
\`\`\`

The grammar:

\`\`\`
lambda PARAMETERS: EXPRESSION
\`\`\`

Three constraints that separate juniors from seniors:

1. **Body is one expression**, not a statement. No \`if/elif/else\` blocks, no \`for\`, no \`return\`. You can use a *conditional expression* (\`x if cond else y\`) which is a single expression.
2. **No annotations.** \`lambda x: int\` is a body of \`int\`, not a return-type hint.
3. **No name.** \`(lambda x: x).__name__\` is the literal string \`"<lambda>"\`. Tracebacks read \`<lambda>\` instead of a useful name — which is why production code prefers \`def\` for anything more than 1 line of logic.

The signature follows all the rules from the previous lesson: positional-only with \`/\`, keyword-only with \`*\`, defaults, \`*args\`, \`**kwargs\`. \`lambda *xs, **kw: …\` is valid Python.

### Conditional expression inside a lambda — the only "branch" available

\`\`\`
sign = lambda x: 1 if x > 0 else -1 if x < 0 else 0
\`\`\`

Three-way branch in one expression. Past two levels of nested ternary, stop and write a \`def\`.

---

## \`map(fn, xs)\` — transform each item

\`\`\`
list(map(str.upper, ["ada", "linus"]))    # ['ADA', 'LINUS']
list(map(len, ["a", "abc", "abcd"]))      # [1, 3, 4]
\`\`\`

Two non-obvious bits:

- In Python 3, \`map\` returns an **iterator**, not a list. \`list(map(...))\` materializes; \`for x in map(...)\` streams. Same memory story as the previous lesson — be aware which one you wrote.
- \`map\` accepts **multiple iterables** and zips them: \`map(operator.add, [1,2,3], [10,20,30])\` → \`[11, 22, 33]\`. It stops at the shortest input, silently. Use \`itertools.zip_longest\` if you need padding.

### \`map\` vs comprehension — the readable choice

\`\`\`
[s.upper() for s in names]            # comprehension — Pythonic
list(map(str.upper, names))           # map — also fine when fn already exists
[ (lambda s: s.upper())(s) for s in names ]   # never write this
list(map(lambda s: s.upper(), names))         # avoid — comprehension reads better
\`\`\`

**Rule of thumb**: if you're typing \`lambda\`, prefer the comprehension. If you have a *named* function to apply, \`map\` is a tie — pick whichever reads better.

---

## \`filter(pred, xs)\` — keep matches

\`\`\`
list(filter(lambda x: x > 0, [-1, 0, 3, -2, 5]))   # [3, 5]
list(filter(None, [0, 1, "", "a", None, 0.0, "b"]))  # [1, 'a', 'b']  — None means "is truthy"
\`\`\`

The \`None\`-as-predicate trick is worth knowing — \`filter(None, xs)\` keeps every truthy value. Same as \`[x for x in xs if x]\`.

Same readability tiebreaker:

\`\`\`
[x for x in xs if x > 0]              # comprehension — usually wins
list(filter(lambda x: x > 0, xs))     # filter + lambda — comprehension is shorter
list(filter(is_valid, xs))            # filter + named — fine, both work
\`\`\`

---

## \`reduce(fn, xs[, initial])\` — fold to one

Lives in \`functools\` as of Python 3 — Guido moved it out of the built-ins to push you toward \`sum\` / \`min\` / \`max\` / \`any\` / \`all\` first.

\`\`\`
from functools import reduce

reduce(lambda a, b: a + b, [1, 2, 3, 4])         # 10  → ((1+2)+3)+4
reduce(lambda a, b: a + b, [1, 2, 3, 4], 100)    # 110 → (((100+1)+2)+3)+4
reduce(lambda a, b: a + b, [], 100)              # 100 — initial returned
reduce(lambda a, b: a + b, [])                   # TypeError — empty + no initial
\`\`\`

The mental model:

\`\`\`
acc = initial (or xs[0])
for x in xs[1:] (or xs[0:] if initial given):
    acc = fn(acc, x)
return acc
\`\`\`

Two senior rules:

- **Pass an \`initial\` value** unless you are sure the iterable is non-empty. Without one, \`reduce\` on an empty iterable raises.
- **Reach for the specialized form first.** Almost every \`reduce(lambda a,b: a+b, xs)\` should be \`sum(xs)\`. Almost every \`reduce(lambda a,b: a if a>b else b, xs)\` should be \`max(xs)\`. Reserve \`reduce\` for genuinely custom folds: dict-merge, set-union with custom semantics, running statistics.

### When \`reduce\` actually wins

\`\`\`
from functools import reduce
from operator import or_

# union of many sets
reduce(or_, [{1,2}, {2,3}, {3,4}])                # {1, 2, 3, 4}

# merge a list of dicts (later keys win)
reduce(lambda a, b: {**a, **b}, dicts, {})

# running product (no built-in until 3.8 added math.prod)
reduce(operator.mul, [1, 2, 3, 4])                # 24
\`\`\`

After Python 3.8, \`math.prod\` covers the multiplication case. The dict merge can also be \`dict(ChainMap(*reversed(dicts)))\` if you don't want \`reduce\`.

---

## The escape hatches: \`operator\` and \`functools.partial\`

Two standard-library tools that **make most lambdas unnecessary**.

### \`operator\` — named functions for arithmetic and indexing

\`\`\`
import operator

list(map(operator.add, [1,2,3], [10,20,30]))     # [11, 22, 33]   → no lambda
sorted(rows, key=operator.itemgetter("revenue")) # → no lambda
sorted(users, key=operator.attrgetter("name"))   # → no lambda
sorted(rows, key=operator.itemgetter(2, 0))      # → tuple key by columns 2, 0
\`\`\`

\`itemgetter\` and \`attrgetter\` are not just shorter than \`lambda r: r["revenue"]\` — they are also implemented in C and **measurably faster** in tight inner loops.

### \`functools.partial\` — fix some args, return a smaller function

\`\`\`
from functools import partial

double = partial(operator.mul, 2)               # partial of mul, with first arg = 2
list(map(double, [1, 2, 3]))                    # [2, 4, 6]

connect_localhost = partial(connect, host="localhost")   # bind a kwarg
\`\`\`

\`partial\` is the right tool whenever you would write \`lambda x: foo(2, x)\`. It preserves \`__wrapped__\` (so introspection works), is hashable when its arguments are, and reads like configuration.

---

## When \`lambda\` is genuinely the right tool

Despite the comprehension preference, lambdas earn their keep in three places:

1. **Sort / min / max keys**: \`sorted(rows, key=lambda r: r["age"])\`. Inline, readable, no name needed. (Even better: \`itemgetter("age")\`.)
2. **One-shot callbacks** registered with a library: \`button.on_click(lambda: app.refresh())\`.
3. **Default-argument trick to capture a value** at definition time: \`fns = [lambda i=i: i for i in range(3)]\`. The trailing \`i=i\` snapshots the loop variable.

If your lambda has more than ~30 characters of body, promote it to a \`def\` for the sake of debuggers and code review.

---

## The four lambda traps

### 1. Late-binding closures in a loop

\`\`\`
fns = [lambda: i for i in range(3)]
[f() for f in fns]      # [2, 2, 2] — every lambda closed over the SAME i
\`\`\`

Every lambda captures the *name* \`i\`, not its current value. By the time you call \`fns[0]()\`, the loop has finished and \`i\` is \`2\`. The fix is the **default-argument trick** — defaults are evaluated at function definition time, snapshotting the value:

\`\`\`
fns = [lambda i=i: i for i in range(3)]
[f() for f in fns]      # [0, 1, 2]
\`\`\`

The same bug appears in any closure created inside a loop, not only lambdas. \`def\`-ed inner functions show it too.

### 2. Trying to write multiple statements

\`\`\`
# illegal — lambda body is a single expression
weird = lambda x: print(x); return x          # SyntaxError
\`\`\`

The moment you want \`print + return\` or \`if/else\` blocks, write a \`def\`. Don't smuggle statements into a lambda by chaining \`or\` / \`and\` for side effects.

### 3. Lambdas as dict keys / set members

\`\`\`
{lambda: 1: "x"}        # legal — lambdas are hashable by *identity*
\`\`\`

But they hash by identity, not by source code. Two lambdas with the same body are different keys. If you ever find yourself doing this, switch to a named \`def\` or a \`callable\` class with \`__hash__\`.

### 4. Lambda where \`operator.itemgetter\` / \`attrgetter\` is shorter

\`\`\`
sorted(rows, key=lambda r: r["revenue"])             # ok
sorted(rows, key=operator.itemgetter("revenue"))     # better — shorter, faster, no lambda

sorted(users, key=lambda u: (u.last_name, u.first_name))     # ok
sorted(users, key=operator.attrgetter("last_name", "first_name"))   # better
\`\`\`

Both work; in code review the second pair is what gets the +1.

---

## Pitfalls in data work specifically

- **\`pandas.DataFrame.apply(lambda row: ...)\` is slow.** Vectorize first (\`df["a"] + df["b"]\` instead of \`df.apply(lambda r: r["a"] + r["b"], axis=1)\`). Lambdas force a Python-call per row; vectorized ops stay in NumPy.
- **\`reduce\` with a list-append builder is O(n²).** \`reduce(lambda a, x: a + [x], items, [])\` reallocates a new list each step. Use a comprehension or a generator.
- **\`map\` over an iterator is exhausted after one pass.** Same one-shot rule from the iterator lesson — the result is itself an iterator.
- **Lambdas are not picklable in some workers** (e.g., \`multiprocessing\` on Windows). Define a top-level \`def\` if the function needs to cross a process boundary.

---

## Interview hook (answer like a senior)

"Map / filter / reduce are *transform / keep / fold*. In Python 3 all three are lazy iterators, and the standard-library defaults — \`sum\`, \`min\`, \`max\`, \`any\`, \`all\` — already cover most reductions, so I only reach for \`functools.reduce\` for genuine custom folds. Lambdas are the inline syntax for the function each primitive needs, but a comprehension is usually shorter and reads top-to-bottom — I save \`lambda\` for sort keys and tiny callbacks, and I prefer \`operator.itemgetter\` or \`functools.partial\` whenever they fit. The classic bug is late binding in a loop — every closure shares the same loop variable; the fix is the default-argument trick \`lambda i=i: i\`."`,

    video: null,
    videoFallbackMarkdown: `## Deep dive: pick the right primitive every time

### 1) The "what shape am I producing?" decision tree

Before you reach for any of the three, ask the shape question:

- **Same shape, item-by-item transform?** → \`map\` or a comprehension. Tie-broken by which reads better.
- **Subset of the input?** → \`filter\` or a comprehension with \`if\`. Comprehension wins on tie.
- **Single value out of N items?** → reach for the *specialized* aggregator first:
  - sum: \`sum(xs)\` (or \`math.fsum\` for floats)
  - product: \`math.prod(xs)\` (3.8+)
  - max/min: \`max(xs, key=...)\` / \`min(xs, key=...)\`
  - any/all: \`any(p(x) for x in xs)\` — short-circuits
  - count-by-key: \`collections.Counter(xs)\`
  - mean/stdev: \`statistics.fmean\` / \`statistics.stdev\`

If none of those fit, *then* \`functools.reduce\` is the right tool — and pass an \`initial\` value so the empty case doesn't crash.

### 2) The \`reduce\` desugaring drill

Trace this on paper:

\`\`\`
reduce(lambda a, b: a + b, [3, 1, 4, 1, 5], 100)
\`\`\`

Step by step:

\`\`\`
acc = 100
acc = 100 + 3 = 103
acc = 103 + 1 = 104
acc = 104 + 4 = 108
acc = 108 + 1 = 109
acc = 109 + 5 = 114
return 114
\`\`\`

Now the same without the initial:

\`\`\`
reduce(lambda a, b: a + b, [3, 1, 4, 1, 5])
acc = 3                   # the FIRST element seeds the accumulator
acc = 3 + 1 = 4
acc = 4 + 4 = 8
acc = 8 + 1 = 9
acc = 9 + 5 = 14
return 14
\`\`\`

This is the most common interview "implement reduce" follow-up, and it is also the line every \`reduce\` user should be able to draw without thinking.

### 3) Pythonic translations — memorize five

\`\`\`
# 1. uppercase a list of strings
list(map(str.upper, names))               # OR
[s.upper() for s in names]

# 2. drop empties
list(filter(None, lines))                 # OR
[l for l in lines if l]

# 3. sum of squares
sum(x * x for x in xs)                    # generator → flat memory

# 4. running max so far (NOT reduce — itertools)
import itertools
list(itertools.accumulate(xs, max))       # [3, 3, 4, 4, 5]

# 5. group dicts by a key (NOT reduce — defaultdict + loop)
from collections import defaultdict
out = defaultdict(list)
for r in rows:
    out[r["dept"]].append(r)
\`\`\`

Note pattern 4 — \`itertools.accumulate\` is the *streaming* sibling of \`reduce\`. \`reduce\` returns one final value; \`accumulate\` yields every intermediate accumulator. It is the right tool for running totals, running max, and "value at each step of a fold".

### 4) The late-binding trap, isolated

\`\`\`
multipliers = [lambda x: x * i for i in range(1, 4)]
[f(10) for f in multipliers]
# expected: [10, 20, 30]
# actual:   [30, 30, 30]
\`\`\`

Every lambda closed over the **same name** \`i\`. The list comprehension finishes; \`i\` is now \`3\`; calling each lambda dereferences the shared name and gets \`3\`. The fix snapshots the value at definition time:

\`\`\`
multipliers = [lambda x, i=i: x * i for i in range(1, 4)]
[f(10) for f in multipliers]              # [10, 20, 30]
\`\`\`

The \`i=i\` reads weirdly but it is the standard idiom. Alternative: \`functools.partial(operator.mul, i)\`.

### 5) The senior \`operator\` cheatsheet

\`\`\`
from operator import add, sub, mul, truediv, mod, pow,
                     itemgetter, attrgetter, methodcaller,
                     and_, or_, xor, not_, eq, ne, lt, le, gt, ge

# arithmetic — drops the lambda
list(map(add, [1, 2, 3], [10, 20, 30]))     # [11, 22, 33]

# sort by nested attribute
sorted(events, key=attrgetter("user.id"))   # walks the dot path

# call a method on each element
list(map(methodcaller("strip"), lines))     # equivalent to [l.strip() for l in lines]

# fold-friendly bitwise ops
reduce(or_, [{1,2}, {2,3}], set())          # set union
\`\`\`

If you're writing a one-line lambda that just unwraps an attribute, indexes a key, or applies a binary operator — there is an \`operator\` callable for that.

### 6) Real-world pandas pattern (data work specifically)

\`\`\`
# slow — Python lambda per row
df["full_name"] = df.apply(lambda r: r["first"] + " " + r["last"], axis=1)

# fast — vectorized, no lambda crossed
df["full_name"] = df["first"] + " " + df["last"]
\`\`\`

A 10× speedup is normal. The senior heuristic in pandas: **if you reach for \`lambda\` inside \`apply\`, ask whether you can vectorize first**. \`apply\` is for genuinely row-shaped logic that can't be expressed as column-wise ops.`,

    tryGuidance:
      "Open the **fold machine** below and run three experiments. **Mode 1 (lambda decoder)**: pick a recipe like `lambda r: r[\"revenue\"]` and watch four equivalents render side-by-side — `def`, comprehension, `operator.itemgetter`, `functools.partial`. The verdict pill tells you which one a senior reviewer would prefer. **Mode 2 (pipeline lab)**: configure a filter and a map; watch the source flow through both stages with rejected items struck out and transformed values lit up. **Mode 3 (fold animation)**: pick a binary reducer (sum / max / product / set-union / dict-merge), step one item at a time, and watch the accumulator update — `acc = fn(acc, x)` — frame by frame. The empty-iterable + no-initial case is one of the buttons; click it to see the actual TypeError Python raises.",

    knowledgeCheck: [
      {
        question: "Which is the **only** legal lambda body?",
        options: [
          "A single expression — including conditional expressions like `1 if x > 0 else -1` — but no statements (no `if/elif`, no `for`, no `return`).",
          "Any sequence of statements separated by semicolons; lambda is just an unnamed `def`.",
          "Statements only — expressions are forbidden because lambdas have no return slot.",
        ],
        correctIndex: 0,
        explanation: "`lambda PARAMETERS: EXPRESSION` is the entire grammar. The body is one expression whose value is implicitly returned. The moment you need branches with bodies, an explicit return, or assignments, promote to `def`.",
      },
      {
        question: "What does `list(filter(None, [0, 1, '', 'a', None, 0.0, 'b']))` produce, and why?",
        options: [
          "`[1, 'a', 'b']` — passing `None` as the predicate is shorthand for *keep truthy values*, identical to `[x for x in xs if x]`.",
          "`[0, 1, '', 'a', None, 0.0, 'b']` — `filter(None, …)` is a no-op that returns the input unchanged.",
          "TypeError — `filter`'s first argument must be a callable.",
        ],
        correctIndex: 0,
        explanation: "When the predicate is `None`, `filter` treats it as 'identity' and keeps every truthy element. The falsy ones (`0`, `''`, `None`, `0.0`) are dropped. It's the cleanest way to drop blanks from a list.",
      },
      {
        question: "What does `reduce(lambda a, b: a + b, [], 100)` return?",
        options: [
          "`100` — when the iterable is empty, the `initial` value is returned unchanged. Without an initial, `reduce` would raise `TypeError`.",
          "`0` — `reduce` ignores `initial` and uses the additive identity.",
          "Raises `TypeError` because the lambda was never called.",
        ],
        correctIndex: 0,
        explanation: "The `initial` slot is exactly the right tool for empty-iterable safety. `reduce(fn, empty)` without an initial raises; `reduce(fn, empty, init)` returns `init`. Always pass an `initial` unless you can prove the iterable is non-empty.",
      },
      {
        question: "Which is the **most Pythonic** rewrite of `list(map(lambda x: x.upper(), names))`?",
        options: [
          "`[name.upper() for name in names]` — a list comprehension, the readability default for transforms.",
          "`list(map(str.upper, names))` — same logic, no lambda needed because `str.upper` is already a callable.",
          "Both A and B are clearly more Pythonic than the lambda version, and choosing between them is a style call.",
        ],
        correctIndex: 2,
        explanation: "The lambda is the smell — Python's idiom is *avoid `lambda` whenever a comprehension or a named callable expresses the same logic*. Both rewrites are clearly better than `map(lambda …)`; senior reviewers accept either as long as the lambda is gone.",
      },
      {
        question: "What does this print, and what is the fix?\n\n```\nfns = [lambda x: x * i for i in range(1, 4)]\nprint([f(10) for f in fns])\n```",
        options: [
          "`[30, 30, 30]` — every lambda closed over the same name `i`, which is `3` after the comprehension finishes. Fix with the default-argument trick: `lambda x, i=i: x * i`.",
          "`[10, 20, 30]` — Python snapshots loop variables when defining lambdas inside a comprehension.",
          "Raises `NameError` — the `i` inside the lambda is out of scope after the comprehension exits.",
        ],
        correctIndex: 0,
        explanation: "Late binding: closures capture *names*, not values. Defaults, however, are evaluated when the function is defined — so `lambda i=i: ...` snapshots `i` at definition time. This is the single most-tested closure trap in Python interviews.",
      },
      {
        question: "Senior code review: which is the right replacement for `key=lambda r: r['revenue']` in `sorted(rows, key=…)`?",
        options: [
          "`key=operator.itemgetter('revenue')` — shorter, implemented in C, faster in tight inner loops, and explicitly named in tracebacks.",
          "Leave the lambda — `operator.itemgetter` is just stylistic preference with no real difference.",
          "`key=functools.partial(dict.get, key='revenue')` — partials always beat lambdas for indexing.",
        ],
        correctIndex: 0,
        explanation: "`itemgetter`/`attrgetter` are the standard-library escape hatches for the most common lambda use case (key extraction). They're *measurably* faster (C implementation), shorter, and produce a useful repr. `functools.partial` is the right tool when you want to *fix arguments* to a function, not extract a key.",
      },
      {
        question: "Why is `reduce(lambda acc, x: acc + [x], items, [])` an anti-pattern?",
        options: [
          "Each step builds a brand-new list (`acc + [x]` allocates), making the whole fold O(n²) in time. The Pythonic alternative is `list(items)` or a comprehension — and if you need the running list, use `itertools.accumulate(items, lambda a, x: a + [x])` only for very small inputs.",
          "It's perfectly fine; `reduce` is internally optimized to mutate the accumulator.",
          "It raises `TypeError` because `acc` is initialized to a mutable `[]`.",
        ],
        correctIndex: 0,
        explanation: "`+` on lists creates a new list every iteration. For N items the total work is 1 + 2 + … + N = O(N²) allocations and copies. If your reduce body is `acc + [x]`, you almost certainly wanted a list comprehension, `list()`, or `extend` in a loop.",
      },
      {
        question: "Which of these is the correct mental model for `map`, `filter`, and `reduce` in Python 3?",
        options: [
          "All three return **iterators**, not lists. They're lazy: nothing computes until you consume them with `list(…)`, a `for` loop, `sum(…)`, or any other consumer. This means a `map(…)` you've already iterated through is exhausted on the next pass.",
          "`map` and `filter` return lists eagerly; `reduce` returns a single value immediately.",
          "`map` and `filter` return generators; `reduce` returns a coroutine you must `await`.",
        ],
        correctIndex: 0,
        explanation: "Python 3 made `map` and `filter` lazy iterators (they were lists in Python 2). `functools.reduce` is *not* lazy — it consumes the entire input and returns a value. The 'iterator exhaustion' rules from the Loops/Iterators lesson apply directly: `m = map(...); list(m); list(m)` returns the data once, then `[]`.",
      },
    ],
  },

  "py-c5": {
    durationLabel: MODULE_TIME_LABEL,
    outcomes: [
      "Read and write the four-clause **`try / except / else / finally`** block fluently — and predict exactly which clauses run for each of the five outcomes (success · caught · uncaught · return · raise inside except).",
      "Catch the **narrowest exception that means what you mean** — never bare `except:` (which swallows `KeyboardInterrupt` / `SystemExit`), rarely `except Exception:` — and use multi-type `except (A, B):` and the `as e` binding correctly.",
      "Re-raise without losing the traceback (`raise`), chain causes (`raise NewError() from e`), and silence chains (`raise NewError() from None`) — and explain the difference between **`__cause__`** (explicit) and **`__context__`** (implicit during handling).",
      "Read a Python traceback **bottom-up**: the actual error is the **last** line; the frames above are the call stack from outermost to innermost. Distinguish the two boilerplate lines — *direct cause of* vs *during handling of*.",
      "Debug like a senior: `breakpoint()` over `print`, `logger.exception()` over `print(e)`, **pdb post-mortem** (`python -m pdb -c continue script.py`), `traceback.format_exc()` for capture, and `assert` for invariants — with the `-O` caveat.",
    ],
    learnMarkdown: `## The mental model: errors are values that travel up the stack

In Python, an exception is just an **object** that gets *raised* and propagates up the call stack until something *catches* it. If nothing does, the interpreter prints a **traceback** and exits with a non-zero status.

\`\`\`
def parse(s):
    return int(s)            # may raise ValueError

def load(row):
    return parse(row["age"]) # may raise KeyError or ValueError

try:
    load({})                 # KeyError: 'age'
except KeyError:
    handle_missing_field()
\`\`\`

The key insight: **catching is a stack operation**. Whichever \`try\` block is closest to the \`raise\` and has a matching \`except\` clause wins. If your handler is three frames up, every frame in between unwinds — \`finally\` blocks run on the way out, generators get \`GeneratorExit\`, context managers get \`__exit__\`.

> Heuristic: **let exceptions travel** until they reach a layer that *can do something useful*. A library function should rarely catch \`Exception\`; an HTTP handler at the edge usually should.

---

## The four clauses: \`try / except / else / finally\`

\`\`\`
try:
    risky()
except ValueError as e:
    handled(e)               # runs only if ValueError raised
except (KeyError, IndexError):
    handled_lookup()         # multi-type
else:
    success_path()           # runs only if try block raised NOTHING
finally:
    cleanup()                # ALWAYS runs — return, raise, no matter what
\`\`\`

**Memorize the truth table** (this is the #1 test case in interviews):

| try outcome              | which clauses run                       |
|--------------------------|-----------------------------------------|
| no exception             | \`try\` → \`else\` → \`finally\`              |
| caught exception         | \`try\` (partial) → matching \`except\` → \`finally\` |
| uncaught exception       | \`try\` (partial) → \`finally\` → re-raised |
| \`return\` inside \`try\`    | expression evaluated → \`finally\` → return |
| \`raise\` inside \`except\`  | new exception → \`finally\` → propagates |

Two clauses people forget about:

- **\`else\`**: code that runs *only on success*. The reason it exists: keep the success path **outside** the \`try\` so an unrelated \`ValueError\` in your success code isn't accidentally caught by the \`except ValueError\` above. **Narrows the catch zone**.
- **\`finally\`**: cleanup, *guaranteed*. Even \`os._exit()\` will run \`finally\` blocks above it. The only way to skip \`finally\` is to crash the interpreter itself.

\`\`\`
def read_csv(path):
    try:
        f = open(path)
        rows = parse(f)        # may raise
    except OSError as e:
        log.error("io: %s", e)
        return []
    else:
        return rows            # success path stays out of the try
    finally:
        if "f" in locals(): f.close()
\`\`\`

---

## EAFP vs LBYL — the Pythonic stance

Two ways to handle "the file might not exist":

\`\`\`
# LBYL — Look Before You Leap (C / Java style)
if os.path.exists(path):
    f = open(path)
else:
    return None

# EAFP — Easier to Ask Forgiveness than Permission (Pythonic)
try:
    f = open(path)
except FileNotFoundError:
    return None
\`\`\`

The Pythonic preference is **EAFP** for two reasons:

1. **Race conditions**: between \`os.path.exists\` and \`open\`, the file could be deleted by another process. The exception version is *atomic*.
2. **Performance in the happy path**: in CPython, raising and catching an exception is more expensive than a successful operation, but \`if\` is cheaper than \`try\` in the rare/error case. If errors are rare, EAFP wins on average.

There are exceptions (pun intended): for **dict access**, \`d.get(key, default)\` is shorter than \`try: d[key] except KeyError\`. Use the right tool — but reach for \`try\` more often than you would in Java.

---

## Catching the right thing

The exception hierarchy looks like this (top of the tree):

\`\`\`
BaseException
 ├── SystemExit              ← raised by sys.exit()
 ├── KeyboardInterrupt       ← Ctrl+C
 ├── GeneratorExit           ← used by generator close()
 └── Exception               ← *everything you should normally catch* descends from here
      ├── ArithmeticError
      │    └── ZeroDivisionError
      ├── LookupError
      │    ├── KeyError
      │    └── IndexError
      ├── OSError
      │    ├── FileNotFoundError
      │    ├── PermissionError
      │    └── ...
      ├── ValueError
      ├── TypeError
      └── ... ~50 more
\`\`\`

Three rules every senior follows:

1. **Never bare \`except:\`** — it catches \`BaseException\`, which means \`Ctrl+C\` and \`sys.exit()\` are silently swallowed. The user can't kill your script.
2. **Rarely \`except Exception:\`** — only at the absolute outermost edge of a long-running service, where the contract is "log everything and keep serving". Inside a function, this is a bug magnet.
3. **Catch the narrowest exception that means what you mean.** If you're parsing a number, catch \`ValueError\`. If you're indexing a dict, catch \`KeyError\`. If you genuinely handle both, write \`except (KeyError, ValueError):\`.

\`\`\`
# bad — swallows Ctrl+C, swallows AttributeError, swallows everything
try:
    do_thing()
except:
    pass

# bad — almost as broad
try:
    do_thing()
except Exception:
    pass

# good — narrow, intentional, names the variable
try:
    parse(line)
except ValueError as e:
    log.warning("skipping bad row: %s", e)
    continue
\`\`\`

### Order matters when subclasses are involved

\`except\` clauses are tried **top-down**. The first one whose class is an ancestor of (or equal to) the raised exception wins. So **subclasses must come before bases**:

\`\`\`
try:
    open("missing")
except OSError:               # this catches everything OSError-shaped
    handle_io_error()
except FileNotFoundError:     # never reachable — FileNotFoundError ⊂ OSError
    handle_missing()
\`\`\`

The second \`except\` is dead code. Linters (\`ruff\`, \`pylint\`) will flag it.

### \`as e\` and the post-block scope rule

\`\`\`
try:
    parse(line)
except ValueError as e:
    log.warning("bad: %s", e)

print(e)                      # NameError — \`e\` was deleted at end of except
\`\`\`

CPython explicitly **deletes** the bound name when the \`except\` block exits, to break a reference cycle (\`e\` → traceback → frame → \`e\`). If you need the value later, copy it: \`err = e\`.

---

## Re-raising and chaining

Three forms, three different traceback shapes.

### Bare \`raise\` — the right way to re-raise

\`\`\`
try:
    do_thing()
except SomeError:
    log.exception("bailing")
    raise                      # re-raise the same exception, same traceback
\`\`\`

The traceback **is preserved** (same \`__traceback__\`). \`raise e\` *also* works but is verbose; bare \`raise\` is the idiom.

### \`raise NewError() from e\` — explicit cause chain

\`\`\`
try:
    int(x)
except ValueError as e:
    raise InvalidConfig(f"bad age: {x!r}") from e
\`\`\`

Traceback prints:

\`\`\`
ValueError: invalid literal for int(): 'old'

The above exception was the direct cause of the following exception:

InvalidConfig: bad age: 'old'
\`\`\`

The \`from e\` sets \`__cause__\`. This is what you want when you're **wrapping** a low-level error in a domain-level one.

### Implicit chain — exception during handling

If a new exception is raised inside an \`except\` block **without** \`from\`, Python automatically chains via \`__context__\`:

\`\`\`
try:
    parse(line)
except ValueError:
    rollback()                 # what if rollback() also raises?
\`\`\`

Traceback:

\`\`\`
ValueError: invalid literal

During handling of the above exception, another exception occurred:

DatabaseError: connection lost
\`\`\`

Two boilerplate strings, two semantics:

- **"direct cause of"** → \`__cause__\` set by \`raise X from Y\` → you wrapped on purpose.
- **"during handling of"** → \`__context__\` set automatically → you accidentally raised while cleaning up.

### Suppress the chain — \`from None\`

\`\`\`
raise InvalidConfig("bad age") from None    # don't show __context__/__cause__
\`\`\`

Useful when the underlying error is implementation noise and the new error fully describes the problem.

---

## Custom exceptions — keep them shallow and named

\`\`\`
class ConfigError(Exception): pass
class MissingField(ConfigError): pass
class InvalidValue(ConfigError):
    def __init__(self, field, value):
        super().__init__(f"{field}={value!r}")
        self.field = field
        self.value = value
\`\`\`

Three guidelines:

1. **Inherit from \`Exception\`**, not \`BaseException\`. Always.
2. **One project-level base** (\`ConfigError\`, \`AppError\`, etc.) so callers can write \`except AppError:\` and not have to enumerate.
3. **Add structured fields** (the \`field\` / \`value\` above) — strings are searchable, attributes are *queryable* in handlers.

---

## Pitfalls senior interviewers love

- **\`except Exception: pass\`** ("Pokémon exception handling" — gotta catch 'em all). The function silently keeps going with a half-broken state. If you must silence, log: \`except Exception:  log.exception("…"); return default\`.
- **Catching exceptions for normal control flow** — using \`KeyError\` to test "did this dict have the key?" is *acceptable* for one access; using exceptions to drive a 3-deep loop is a smell. Use \`dict.get\`, \`getattr(..., default)\`, \`contextlib.suppress\`.
- **Resource leaks**: every \`open()\` / \`acquire()\` outside a \`with\` block needs a \`finally: close()\`. The senior pattern is *always use a context manager*.
- **\`return\` inside \`finally\`** suppresses any pending exception or pending return. Never do this unintentionally.
- **Mutable state half-modified inside \`try\`**: if the \`try\` mutates a list and then raises, the list is left half-mutated. Either rollback in \`except\` or copy-then-replace.
- **\`assert\` is stripped under \`-O\`**: assertions are for *invariants* and *test code*. Don't use \`assert\` for argument validation in production library code — \`python -O\` removes them.

---

## Debugging — beyond \`print\`

The senior toolkit, in order:

1. **\`breakpoint()\`** (3.7+) — drops into \`pdb\` at that line. Set \`PYTHONBREAKPOINT=ipdb.set_trace\` to swap implementations. \`PYTHONBREAKPOINT=0\` disables them — useful in CI.
2. **\`pdb\` essential commands** — \`n\` (next line), \`s\` (step into), \`c\` (continue), \`l\` (list source), \`p expr\` (print), \`pp expr\` (pretty), \`w\` (where = stack), \`u\`/\`d\` (up/down frames), \`b file:line\` (breakpoint), \`q\` (quit).
3. **Post-mortem debugging** — when a script crashes:
   \`\`\`
   python -m pdb script.py            # interactive from the start
   python -m pdb -c continue script.py # run; drop into pdb at the crash
   \`\`\`
   Inside an interactive REPL after a crash: \`import pdb; pdb.pm()\`.
4. **\`logging\` over \`print\`** — \`logger.exception("oh no")\` inside an \`except\` block automatically attaches the **current traceback** to the log record. Use levels (\`debug\` / \`info\` / \`warning\` / \`error\` / \`critical\`); use \`%s\` formatting (\`log.info("user %s", user)\`) so disabled levels skip the format work.
5. **\`traceback\` module** — \`traceback.print_exc()\` from inside an \`except\` block prints the same thing Python would. \`traceback.format_exc()\` returns it as a string — useful for sending to Sentry, writing to a file, or returning in a JSON error response.
6. **\`faulthandler\`** — \`python -X faulthandler script.py\` prints a Python traceback on segfault / fatal error. Worth knowing for native-extension debugging.
7. **\`warnings\`** — \`warnings.warn("deprecated", DeprecationWarning)\` is the right channel for "this still works but won't soon" — *not* exceptions.

---

## Interview hook (answer like a senior)

"\`try/except/else/finally\`: \`else\` runs only on success — it keeps the success path *outside* the \`try\` so I don't accidentally catch unrelated errors; \`finally\` always runs, even on \`return\` or \`raise\`. I catch the narrowest exception that names what I mean — never bare \`except:\` because it eats \`KeyboardInterrupt\`, and \`except Exception:\` only at the outermost edge of a service. To re-raise without losing the traceback I use bare \`raise\`. To wrap a low-level error in a domain one I use \`raise NewError(...) from e\` — that prints *direct cause of* and sets \`__cause__\`; if a new exception leaks out of an \`except\` block on its own, Python sets \`__context__\` and prints *during handling of*, which is usually a bug. For debugging I reach for \`breakpoint()\` and \`pdb.pm()\` for post-mortem before I reach for \`print\`, and \`logger.exception\` is what attaches the traceback to a log record."`,

    video: null,
    videoFallbackMarkdown: `## Deep dive: read every traceback like an SRE

### 1) Read tracebacks **bottom-up**

Most engineers read the traceback top-down. That is wrong. The interpreter prints frames in *call order* — the **last** line is the actual exception; the line **just above it** is where it was raised; the lines further up are the callers. Train the eye:

\`\`\`
Traceback (most recent call last):     ← Python's hint: the most recent call is at the bottom
  File "main.py", line 42, in <module>
    run()
  File "main.py", line 30, in run
    load_user(uid)
  File "users.py", line 14, in load_user
    return int(row["age"])
ValueError: invalid literal for int() with base 10: 'old'   ← THE error, read first
\`\`\`

Senior reading order: **last line → file:line of the raise → walk up only as far as needed**.

### 2) The two boilerplate lines, decoded

These two strings have *different meanings*:

| string                                                                                  | what it says                                                                  |
|-----------------------------------------------------------------------------------------|-------------------------------------------------------------------------------|
| \`The above exception was the direct cause of the following exception:\`                  | someone wrote \`raise NewError() from e\` — explicit chain via \`__cause__\`.    |
| \`During handling of the above exception, another exception occurred:\`                   | a bare \`raise NewError()\` happened *inside* an \`except\` block — implicit \`__context__\`. |

The **first** is intentional. The **second** is almost always a bug — it means cleanup code in your handler raised on top of the real error, so the *original* error is two screens up the traceback and the user only sees the cleanup error.

### 3) Idiom: wrap-and-rethrow at API boundaries

\`\`\`
class UserError(Exception): pass

def get_user(uid):
    try:
        row = db.fetchone("SELECT * FROM users WHERE id=%s", uid)
        return User(**row)
    except (db.DatabaseError, KeyError, ValueError) as e:
        raise UserError(f"could not load user {uid!r}") from e
\`\`\`

Callers handle one named exception type — \`UserError\` — but the underlying \`__cause__\` is preserved for the on-call SRE who reads the log. Best of both worlds.

### 4) The \`contextlib\` shortcuts every senior uses

- \`contextlib.suppress(KeyError)\` — replaces \`try: ... except KeyError: pass\` for a single statement.
  \`\`\`
  with contextlib.suppress(FileNotFoundError):
      os.remove(tmp_path)
  \`\`\`
- \`contextlib.contextmanager\` — turn a generator into a \`with\` block; \`yield\` separates *setup* from *teardown*. The teardown runs in a \`finally\`, so it survives exceptions:
  \`\`\`
  @contextmanager
  def tx(conn):
      conn.begin()
      try:
          yield
          conn.commit()
      except:
          conn.rollback()
          raise
  \`\`\`
- \`contextlib.ExitStack\` — manage a *dynamic* number of context managers without nested \`with\` pyramids.

### 5) The pdb cheat sheet (15 commands you actually use)

\`\`\`
n         next line in same frame
s         step into a function call
c         continue until next breakpoint or end
r         return — run until current frame returns
l / ll    list source / list whole function
p expr    print expression
pp expr   pretty-print
w         where (current stack)
u / d     move up / down the stack
b 42      breakpoint at line 42 of current file
b mod:42  breakpoint at line 42 of mod
cl 1      clear breakpoint #1
display x display x's value at every step
interact  drop into a normal Python REPL with the current locals
q         quit
\`\`\`

\`pdb.pm()\` after an unhandled exception in the REPL drops you at the *site* of the crash with all locals intact — closer to the error than re-running.

### 6) The \`logging\` recipe for production exception handling

\`\`\`
import logging
log = logging.getLogger(__name__)

try:
    process(record)
except Exception:                       # outermost edge of a worker
    log.exception("processing failed for %r", record)   # attaches traceback
    metrics.increment("processor.errors")
    # don't re-raise — keep the worker alive
\`\`\`

Two things to notice:

- \`log.exception(...)\` is shorthand for \`log.error(..., exc_info=True)\` — it attaches the **current traceback** to the log record automatically.
- The \`except Exception:\` here is one of the few places it is *correct* — at a worker's outer loop where the contract is "log and keep going". Inside a small function, this would be a bug.

### 7) The \`assert\` rule

\`\`\`
def transfer(amount):
    assert amount >= 0, "negative transfer"   # invariant — strip in production
    if not user.can_afford(amount):
        raise InsufficientFunds(user, amount) # validation — DO raise
\`\`\`

Two different things:

- **\`assert\`** is for *invariants* — things you believe are *always* true. \`python -O\` strips them. Never put I/O or argument validation behind \`assert\`.
- **\`raise\`** is for *runtime conditions* the user might cause. Always present.

A stripped \`assert\` is one of the most embarrassing production bugs in Python — your validation just disappears.`,

    tryGuidance:
      "Open the **traceback theater** below and run three experiments. **Mode 1 (try/except router)**: pick what happens inside the `try` (raise ValueError, raise KeyError, return early, no error) and an except chain — watch the green/red highlights show *exactly* which clauses run, in order, and check that `finally` is always lit. **Mode 2 (hierarchy match)**: pick a raised exception class and a chain of `except` clauses; the visualization walks the chain top-down using `isinstance` and shows the first match winning — try ordering `OSError` *before* `FileNotFoundError` to see the dead-code case. **Mode 3 (traceback reader)**: toggle `raise` vs `raise from e` vs `raise from None` and read how the boilerplate lines change between *direct cause of* and *during handling of* — and which line is the actual error.",

    knowledgeCheck: [
      {
        question: "In `try / except / else / finally`, when does the `else` clause run?",
        options: [
          "Only when the `try` block completes **without** raising any exception — and `else` runs *before* `finally`.",
          "Only when the `try` block raises an exception that is **not** caught by any `except` clause.",
          "Always — `else` is just a synonym for `finally` in older Python versions.",
        ],
        correctIndex: 0,
        explanation: "`else` is the *success* clause: it runs after a successful `try`, before `finally`. Its purpose is to keep success-path code *outside* the `try` so an unrelated exception isn't accidentally caught. Many engineers go years without learning `else` exists; seniors use it whenever the success path has more than one line.",
      },
      {
        question: "Why is `except:` (bare) different from `except Exception:` and almost always wrong?",
        options: [
          "Bare `except:` catches **`BaseException`**, which includes `KeyboardInterrupt` (Ctrl+C) and `SystemExit` — meaning your script silently swallows the user's request to terminate. `except Exception:` catches normal errors but lets the interpreter still die on Ctrl+C / sys.exit, which is what you want.",
          "They are identical; bare `except:` is just a shorter alias for `except Exception:`.",
          "Bare `except:` is faster because it skips the `isinstance` check; otherwise the behavior matches `except Exception:` exactly.",
        ],
        correctIndex: 0,
        explanation: "The hierarchy distinction matters: `BaseException` → `SystemExit` / `KeyboardInterrupt` / `GeneratorExit` / `Exception`. Bare `except` catches the parent and so eats things you should *never* catch. Linters (ruff `E722`, pylint `W0702`) flag bare `except:` for this exact reason.",
      },
      {
        question: "What is the difference between `raise NewError() from e` and a bare `raise NewError()` written inside an `except` block?",
        options: [
          "`from e` sets `__cause__` and prints **'The above exception was the direct cause of the following exception'** — explicit wrapping. A bare `raise NewError()` inside `except` automatically sets `__context__` and prints **'During handling of the above exception, another exception occurred'** — implicit, usually unintentional.",
          "Both forms are exactly equivalent; `from e` is just more explicit syntax for the same `__context__` mechanism.",
          "`from e` discards the original traceback entirely; the bare form preserves it.",
        ],
        correctIndex: 0,
        explanation: "The two boilerplate strings are not interchangeable: *direct cause of* means a human chose to wrap one error in another (`__cause__`); *during handling of* means a new error was raised while handling the first (`__context__`), which is usually a cleanup bug. To suppress the chain entirely use `raise NewError() from None`.",
      },
      {
        question: "What does this print?\n\n```\ndef f():\n    try:\n        return 1\n    finally:\n        return 2\n```",
        options: [
          "`2` — `finally` runs after the `return 1` expression is evaluated, and a `return` inside `finally` overrides the pending return value (and would also suppress a pending exception). This is why `return` in `finally` is considered a code smell.",
          "`1` — `finally` runs but cannot affect the already-pending return value.",
          "Raises `SyntaxError` — `return` is illegal inside a `finally` clause.",
        ],
        correctIndex: 0,
        explanation: "`finally` is genuinely *final* — its `return` (or `raise`) wins over anything pending from `try`. The same rule means `return` in `finally` will silently swallow an exception that was about to propagate. Never write it unless you really mean it.",
      },
      {
        question: "Which `except` ordering is correct, and why?",
        options: [
          "```\nexcept FileNotFoundError: ...\nexcept OSError: ...\n```\nbecause `except` clauses are tried top-down and the **first** clause whose class is an ancestor of (or equal to) the raised exception wins. Since `FileNotFoundError` is a subclass of `OSError`, a more specific subclass must come *before* the base or it becomes dead code.",
          "```\nexcept OSError: ...\nexcept FileNotFoundError: ...\n```\nbecause base classes should always be listed first to act as a 'default' handler.",
          "Order doesn't matter — Python finds the most specific match regardless of clause position.",
        ],
        correctIndex: 0,
        explanation: "Python doesn't search for the *most specific* match — it picks the *first* match top-down using `isinstance`. So subclasses must come before parents. Linters flag the opposite ordering as 'unreachable except clause'.",
      },
      {
        question: "After `try: ... except ValueError as e: ...`, can you reference `e` after the `except` block?\n\n```\ntry:\n    int('x')\nexcept ValueError as e:\n    pass\nprint(e)\n```",
        options: [
          "No — `e` is **explicitly deleted** by Python at the end of the `except` block (to break a reference cycle through the traceback). Accessing it raises `NameError`. If you need the value later, copy it inside the block: `err = e`.",
          "Yes — `e` is a normal local variable and remains in scope until the function returns.",
          "Only in CPython 3.10+; earlier versions raise `UnboundLocalError`.",
        ],
        correctIndex: 0,
        explanation: "The `as` binding in `except` has special scope rules: the name is unbound when the block ends, breaking the cycle `e → traceback → frame → e`. This is one of the few places Python deletes a local for you. Senior pattern when the value is needed later: `except E as e: err = e; ...; use(err)`.",
      },
      {
        question: "Which line is the *actual* error in this traceback?\n\n```\nTraceback (most recent call last):\n  File \"main.py\", line 42, in <module>\n    run()\n  File \"main.py\", line 30, in run\n    load_user(uid)\n  File \"users.py\", line 14, in load_user\n    return int(row['age'])\nValueError: invalid literal for int() with base 10: 'old'\n```",
        options: [
          "The **last** line — `ValueError: invalid literal...` — is the actual error. The lines above are the call chain in call order; the *site* of the raise is the line just above it (`return int(row['age'])`). Read tracebacks bottom-up: error first, then the raise site, then frames as far up as needed.",
          "The first line `Traceback (most recent call last):` — that's the error message; the rest is debugging noise.",
          "`File \"main.py\", line 42, in <module>` — the entry point is always where the error originated.",
        ],
        correctIndex: 0,
        explanation: "Python's hint *most recent call last* is literally telling you to read bottom-up. The exception type and message are always the last line; the file:line just above is where `raise` was issued; everything above that is the call stack. Senior debuggers learn to scan the bottom 3 lines first and only walk up when the message alone isn't enough.",
      },
      {
        question: "Why is `assert validate_amount(amt)` a dangerous way to validate user input in production code?",
        options: [
          "Because `python -O` (optimize mode) **strips all `assert` statements at compile time**, so in production your validation silently disappears. `assert` is for invariants you believe are always true (and want to catch in dev/test); user-input validation should use `if not …: raise ValueError(...)` instead.",
          "Because `assert` raises `AssertionError`, and `AssertionError` is not catchable by `except Exception`.",
          "Because `assert` only works inside `try` blocks; outside one it's a no-op.",
        ],
        correctIndex: 0,
        explanation: "`assert` exists for testing invariants — when it fires, you have a *bug*, not a *user error*. The `-O` flag (and `PYTHONOPTIMIZE=1`) removes them entirely. Use `assert` for sanity checks in tests and for documenting invariants; use `raise` for any condition that depends on runtime input.",
      },
    ],
  },

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
