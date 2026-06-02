/**
 * Full lesson modules: Learn (long-form) → Watch / deep dive → Try → Knowledge check.
 * Aligns with docs/CURRICULUM-SCOPE.md §2. Lessons without an entry use buildFallbackModule().
 */

export const MODULE_TIME_LABEL = "18–20 min";
const MD_CODE_TICK = "`";
const MD_CODE_FENCE = "```";

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


const PYTHON_VIDEO_FALLBACKS = {
  "py-o1": { youtubeId: "JeznW_7DlB0", title: "Python Classes and Objects", channel: "freeCodeCamp.org", startSeconds: 0 },
  "py-o2": { youtubeId: "S9uPNppGsGo", title: "Python Inheritance Explained", channel: "Corey Schafer", startSeconds: 0 },
  "py-o3": { youtubeId: "3ohzBxoFHAY", title: "Special (dunder) methods in Python", channel: "Corey Schafer", startSeconds: 0 },
  "py-o4": { youtubeId: "FsAPt_9Bf3U", title: "Python Decorators and Context Managers", channel: "Corey Schafer", startSeconds: 0 },
};

function fallbackDeepDive(lesson) {
  return `## Deep dive until a curated clip ships

Turn this into an active exercise:

1. Open the **Practice** tab and pick **one** question tagged near this topic.
2. Before you write a solution, **predict** the shape of the output (rows/columns or model behavior).
3. Solve, then **diff** your prediction vs reality — that gap is what to rehearse aloud.

If there is no exact tag match, ask the **AI tutor**: "Give me a 5-minute drill on ${lesson.title} with a rubric."`;
}

const PYTHON_EXTENDED_MODULES = {
  "py-o1": {
    durationLabel: MODULE_TIME_LABEL,
    outcomes: [
      "Design constructors that validate inputs without hiding side effects.",
      "Separate object state, dependencies, and runtime services cleanly.",
      "Refactor brittle classes into testable units with clear contracts.",
    ],
    learnMarkdown: `## Outcomes

- Build classes that are easy to initialize, test, and reason about.
- Diagnose constructor anti-patterns before they become production incidents.
- Explain design tradeoffs in code review and interviews.

## Core model

A class should express **state + behavior + invariants**. The constructor (${MD_CODE_TICK}__init__${MD_CODE_TICK}) is not a dumping ground for network calls, global mutation, or hidden file reads.

A useful litmus test: if object creation fails intermittently, your constructor is probably doing too much runtime work.

## Anti-pattern drill: God constructor

### Bad

A constructor that validates inputs, fetches secrets, opens DB pools, makes API calls, and starts background jobs.

### Why it fails

- Instantiation becomes slow and flaky.
- Unit tests require heavy mocking.
- Retries become unclear: did failure happen in validation or side-effect logic?

### Refactor target

1. Keep ${MD_CODE_TICK}__init__${MD_CODE_TICK} for assignment + validation only.
2. Move side effects to explicit methods (${MD_CODE_TICK}connect()${MD_CODE_TICK}, ${MD_CODE_TICK}load()${MD_CODE_TICK}, ${MD_CODE_TICK}start()${MD_CODE_TICK}).
3. Make dependencies injectable (client/session/logger).

## Production scenario

You ship a feature-store client class. During incident response, half of object creations timeout because constructor performs remote schema fetch.

Refactor by caching schema fetch in an explicit warmup step and keeping constructor deterministic.

## Interview framing

Strong answers mention invariants, dependency injection, deterministic initialization, and observability hooks (timings/errors) around explicit lifecycle methods.`,
    video: PYTHON_VIDEO_FALLBACKS["py-o1"],
    videoFallbackMarkdown: `## Guided deep dive

Watch the clip, then run this 10-minute audit on one class from your code:
1. List constructor responsibilities.
2. Mark each as validation vs side effect.
3. Move one side effect behind an explicit method.
4. Add one test that instantiates without network access.`,
    tryGuidance: "Use the interactive to trace object state transitions. After each step, label whether behavior is constructor-safe or should be moved to an explicit lifecycle method.",
    relatedPractice: [
      { label: "Split a god constructor", prompt: "Refactor this god constructor into a pure __init__ (assignment + validation only) plus an explicit connect()/warmup() method, and inject the DB client as a dependency." },
      { label: "Test without the network", prompt: "Write a unit test that instantiates this class with zero network or file access, then explain which responsibilities you had to move out of __init__ to make that possible." },
    ],
    knowledgeCheck: [
      {
        question: "What is the most dangerous constructor anti-pattern?",
        options: [
          "Hidden side effects (network/files/jobs) during object creation",
          "Assigning validated fields",
          "Using type hints in method signatures",
        ],
        correctIndex: 0,
        explanation: "Hidden side effects make creation nondeterministic and hard to test or retry safely.",
      },
      {
        question: "Which refactor most improves testability?",
        options: [
          "Move side effects from __init__ into explicit methods with injected dependencies",
          "Add more print statements in __init__",
          "Instantiate global singletons in __init__",
        ],
        correctIndex: 0,
        explanation: "Explicit lifecycle methods plus DI isolate side effects and simplify deterministic tests.",
      },
      {
        question: "Interview prompt: your constructor is slow in production. Best first move?",
        options: [
          "Measure constructor responsibilities and split runtime work from validation",
          "Ignore because creation is one-time",
          "Increase timeout and keep architecture unchanged",
        ],
        correctIndex: 0,
        explanation: "Diagnose and separate concerns first; latency fixes without design fixes usually regress.",
      },
    ],
  },
  "py-o2": {
    durationLabel: MODULE_TIME_LABEL,
    outcomes: [
      "Use inheritance only when subtype contracts are stable.",
      "Detect Liskov-style contract breaks early.",
      "Choose composition when behavior variants multiply.",
    ],
    learnMarkdown: `## Outcomes

- Model reusable behavior without creating fragile subclass trees.
- Explain polymorphism as contract compatibility, not syntax trivia.
- Refactor inheritance misuse into composition patterns.

## Core model

Inheritance is a **substitutability promise**. If a subclass cannot be used wherever the base class is expected, your abstraction is broken.

## Anti-pattern drill: Inheritance for code reuse only

### Bad

Teams subclass a base class just to reuse utility methods, then override core behavior with different preconditions.

### Failure modes

- Base APIs become ambiguous.
- Callers rely on behavior that silently changes per subclass.
- New subclasses require defensive branching everywhere.

### Refactor target

- Extract shared utilities into collaborators.
- Keep base interface narrow and explicit.
- Use composition (${MD_CODE_TICK}Strategy${MD_CODE_TICK}, policy objects) for behavior variants.

## Production scenario

A pricing pipeline uses ${MD_CODE_TICK}BasePricer.compute(order)${MD_CODE_TICK}; one subclass expects net price, another gross price. Results diverge silently across markets.

Fix by introducing explicit pricing policies and normalized input contracts.

## Interview framing

High-signal answers compare inheritance vs composition with maintainability, discoverability, and contract safety tradeoffs.`,
    video: PYTHON_VIDEO_FALLBACKS["py-o2"],
    videoFallbackMarkdown: `## Guided deep dive

After the clip, sketch one inheritance tree from memory and annotate where contracts differ. Then redesign one branch using composition.`,
    tryGuidance: "In the interactive, predict dispatch path and then state whether the chosen path preserves the base contract.",
    relatedPractice: [
      { label: "Hunt a Liskov violation", prompt: "Given this subclass tree, find one method where a subclass strengthens preconditions or weakens postconditions, then rewrite the caller to show how the substitutability promise breaks." },
      { label: "Inheritance to composition", prompt: "Convert this 'subclass for code reuse' hierarchy into composition using a Strategy/policy object, and explain what each call site no longer has to branch on." },
    ],
    knowledgeCheck: [
      { question: "When is inheritance justified?", options: ["When subtype behavior preserves the base contract", "Whenever two classes share any code", "When subclass count is expected to explode"], correctIndex: 0, explanation: "Inheritance is about substitutability; shared code alone is insufficient." },
      { question: "Best signal of a broken hierarchy?", options: ["Callers need type checks/branching to use subclasses safely", "Base class has docstrings", "Methods return values"], correctIndex: 0, explanation: "If callers branch on subtype, polymorphism likely failed." },
      { question: "First refactor for fragile deep trees?", options: ["Extract behavior strategies and compose them", "Add more inheritance layers", "Rename classes only"], correctIndex: 0, explanation: "Composition localizes variation without expanding brittle hierarchies." },
    ],
  },
  "py-o3": {
    durationLabel: MODULE_TIME_LABEL,
    outcomes: [
      "Implement dunder methods with predictable semantics.",
      "Avoid operator overloads that surprise readers.",
      "Define equality/hash/order contracts that remain consistent.",
    ],
    learnMarkdown: `## Outcomes

- Use dunder protocols intentionally rather than decoratively.
- Avoid semantic traps in equality, hashing, and ordering.
- Make custom objects safe for dict/set usage and debugging.

## Core model

Dunder methods are **protocol contracts**. Overloading should preserve user expectations from built-in types.

## Anti-pattern drill: Clever but misleading operators

### Bad

${MD_CODE_TICK}__add__${MD_CODE_TICK} mutates left operand or triggers I/O; ${MD_CODE_TICK}__eq__${MD_CODE_TICK} compares one field while ${MD_CODE_TICK}__hash__${MD_CODE_TICK} uses another.

### Failure modes

- Bugs in caches/sets due to unstable hashing semantics.
- Non-obvious side effects during arithmetic-looking code.
- Impossible debugging when ${MD_CODE_TICK}repr${MD_CODE_TICK} is vague.

### Refactor target

- Keep operators pure and side-effect free.
- Keep ${MD_CODE_TICK}__eq__${MD_CODE_TICK} and ${MD_CODE_TICK}__hash__${MD_CODE_TICK} consistent.
- Implement informative \`__repr__\` for debugging and logs.

## Production scenario

A feature key object is used as dict key. Equality says two keys match, but hash differs because timestamp included in hash only. Cache miss rates spike.

Fix by aligning equality/hash fields and adding property-based tests.

## Interview framing

Mature answers emphasize predictability, protocol consistency, and testing invariants over syntactic cleverness.`,
    video: PYTHON_VIDEO_FALLBACKS["py-o3"],
    videoFallbackMarkdown: `## Guided deep dive

Watch the clip and then implement \`__repr__\`, ${MD_CODE_TICK}__eq__${MD_CODE_TICK}, and ${MD_CODE_TICK}__hash__${MD_CODE_TICK} for one toy class. Add tests proving equality/hash consistency.`,
    tryGuidance: "Use the interactive to compare expected vs observed behavior after overloaded operations. Flag any semantic surprise as a design bug.",
    knowledgeCheck: [
      { question: "What must remain consistent for dict/set keys?", options: ["Objects considered equal must produce equal hashes", "Hash can change after insertion", "Only repr matters"], correctIndex: 0, explanation: "Hash/equality consistency is required for hash-table correctness." },
      { question: "Which overload is usually unsafe?", options: ["Operator overloads with hidden side effects", "__repr__ returning readable output", "__len__ returning count"], correctIndex: 0, explanation: "Side-effectful operators violate reader expectations and create subtle bugs." },
      { question: "Best debugging support for custom types?", options: ["A precise, unambiguous __repr__ plus protocol tests", "Randomized __str__ for variety", "Disable equality to avoid mistakes"], correctIndex: 0, explanation: "Readable representation and invariant tests shorten incident/debug loops." },
    ],
  },
  "py-o4": {
    durationLabel: "28–35 min",
    outcomes: [
      "Diagnose decorator bugs by simulating definition-time rebinding, closure capture, and wrapper call state.",
      "Refactor retry wrappers for concurrency pressure: per-call state, jittered exponential backoff, and lock boundaries.",
      "Defend a senior architecture choice when strict reliability, observability, and sub-millisecond latency conflict.",
    ],
    learnMarkdown: `## Progressive interview simulation: Stateful decorators in data streams

This module is no longer a passive lesson. Treat it as a three-round staff-level interview: first you debug the language mechanic, then you survive production scale, then you defend an imperfect architecture under business constraints.

## Stage 1 · The initial bug: scoping and mechanics

### Production prompt

Your feature platform wraps flaky feature-store reads with a retry decorator. It passes local tests because developers call it once per process. In production, a long-running worker handles many users and silently stops retrying after earlier failures.

${MD_CODE_FENCE}python
import time

class FeatureStoreTimeout(TimeoutError):
    pass

def retry(max_attempts=3):
    attempts = 0

    def decorator(fn):
        def wrapper(*args, **kwargs):
            nonlocal attempts
            while attempts < max_attempts:
                try:
                    return fn(*args, **kwargs)
                except FeatureStoreTimeout:
                    attempts += 1
                    time.sleep(1)
            return None  # downstream model treats this as "no features"
        return wrapper

    return decorator

@retry(max_attempts=3)
def load_features(user_id):
    raise FeatureStoreTimeout(f"feature store timeout for {user_id}")
${MD_CODE_FENCE}

### Multiple-choice triage

Pick the root cause and fix in the Stage 1 check below before you keep reading. The interviewer is not asking whether decorators are useful; they are asking whether you can mentally execute decorator factories, closure cells, and name rebinding.

### Mastery rationale

${MD_CODE_TICK}retry(max_attempts=3)${MD_CODE_TICK} runs once at definition/import time and returns ${MD_CODE_TICK}decorator${MD_CODE_TICK}. Then Python rebinds ${MD_CODE_TICK}load_features = decorator(load_features)${MD_CODE_TICK}. Because ${MD_CODE_TICK}attempts${MD_CODE_TICK} lives in the outer factory frame, the wrapper closes over one shared cell for the lifetime of that decorated function. Every request shares the same counter, and the terminal ${MD_CODE_TICK}return None${MD_CODE_TICK} converts an availability incident into silent model corruption.

The fix is not "use nonlocal correctly". The fix is to put retry state inside the invocation boundary, preserve metadata with ${MD_CODE_TICK}functools.wraps${MD_CODE_TICK}, and re-raise the terminal exception so the serving layer can trigger fallback, circuit breaking, or an explicit 5xx.

${MD_CODE_FENCE}python
from functools import wraps
import time

def retry(max_attempts=3, delay_seconds=1):
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            last_error = None
            for attempt in range(max_attempts):
                try:
                    return fn(*args, **kwargs)
                except FeatureStoreTimeout as exc:
                    last_error = exc
                    if attempt < max_attempts - 1:
                        time.sleep(delay_seconds)
            raise RuntimeError(f"{fn.__name__} exhausted retries") from last_error
        return wrapper
    return decorator
${MD_CODE_FENCE}

## Stage 2 · The scale crunch: concurrency and systems

### System escalation

Excellent, your fix solved the closure leak. However, Kubernetes now runs 1,000 workers at 10k events/sec. A feature-store brownout causes every worker to retry at exactly one-second intervals. The database sees synchronized retry waves, p99 latency explodes, and autoscaling makes it worse.

### Escalated refactor challenge

The right move is not to slap a global lock around the call. A global lock serializes unrelated users, creates head-of-line blocking, and can deadlock if the wrapped function calls another decorated function that tries to acquire the same lock. You need per-call retry state, bounded waiting, jittered exponential backoff, and a clear exception policy.

A production-grade synchronous retry core should look more like this:

${MD_CODE_FENCE}python
from functools import wraps
import random
import time

def retry_transient(max_attempts=3, base_delay=0.05, cap_delay=1.0,
                    exceptions=(FeatureStoreTimeout,), sleep=time.sleep,
                    rng=random.random):
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            for attempt in range(max_attempts):
                try:
                    return fn(*args, **kwargs)
                except exceptions:
                    if attempt == max_attempts - 1:
                        raise
                    exponential = min(cap_delay, base_delay * (2 ** attempt))
                    delay = rng() * exponential  # full jitter
                    sleep(delay)
        return wrapper
    return decorator
${MD_CODE_FENCE}

### Architectural defense

Naive concurrency fixes fail because they optimize one symptom while damaging the system boundary. Shared counters create data races; coarse locks protect state by destroying throughput; fixed sleeps create thundering herds; catching ${MD_CODE_TICK}Exception${MD_CODE_TICK} retries programmer bugs, cancellation, and non-idempotent side effects. The senior answer narrows shared mutable state to zero, makes time injectable for deterministic tests, uses jitter to decorrelate retries across pods, and refuses to retry operations that cannot safely be repeated.

## Stage 3 · The senior metric: architecture under conflicting constraints

### Ambiguous constraint

Now the platform team mandates this wrapper across batch, streaming, and online inference. But the online path has a sub-millisecond per-record wrapper budget, audit requires retry metrics by function name, and some pipelines are migrating to ${MD_CODE_TICK}asyncio${MD_CODE_TICK}. You cannot have maximal introspection, maximal correctness, and minimal overhead simultaneously.

### Trade-off choice

A principal-level candidate does not pretend there is one perfect decorator. They choose an operating model:

- **A. Universal runtime-introspecting decorator** — easiest API and best observability, but stack/signature inspection and coroutine detection can add overhead and hide performance cliffs.
- **B. Two explicit decorators: ${MD_CODE_TICK}@retry_sync${MD_CODE_TICK} and ${MD_CODE_TICK}@retry_async${MD_CODE_TICK}** — less magical and faster on hot paths, but duplicate policy plumbing and push more responsibility to callers.
- **C. Generated wrappers at registration time** — strongest latency profile after warmup, but harder to debug, harder to review, and more complex to type/test.
- **D. Push retries to infrastructure/client layer** — removes Python wrapper overhead and centralizes policy, but loses function-level context unless tracing and idempotency keys are designed carefully.

### Enterprise rationale

A lead architect evaluates the blast radius first: is this online inference, offline backfill, or human-triggered analytics? On the online path, favor explicit sync/async decorators or infrastructure-level retries with low-cardinality metrics and no stack-frame inspection in the hot loop. In batch, richer wrapper metadata and structured logging may be worth the overhead because debuggability dominates tail latency. Across all paths, the non-negotiables are idempotency policy, bounded retry budgets, cancellation propagation for async work, testable time/randomness injection, and metrics that distinguish transient dependency failure from code defects.`,
    video: PYTHON_VIDEO_FALLBACKS["py-o4"],
    videoFallbackMarkdown: `## Guided deep dive

Watch the clip only after you have answered Stage 1. Then rehearse the simulation aloud as if an interviewer is interrupting you every three minutes:

1. Explain when ${MD_CODE_TICK}retry(max_attempts=3)${MD_CODE_TICK} executes and what object ${MD_CODE_TICK}load_features${MD_CODE_TICK} points to after decoration.
2. Patch the per-call state bug without swallowing the terminal exception.
3. Add jittered exponential backoff and state why a global lock is the wrong concurrency primitive.
4. Defend either explicit sync/async decorators or infrastructure-level retries under the sub-millisecond SLA.`,
    tryGuidance: "Use the Decorator Forge to trace wrapping order first, then run the three-stage knowledge check as an interview simulation: answer Stage 1, pretend the interviewer accepts it, then survive the Stage 2 and Stage 3 pivots without changing your earlier invariants.",
    relatedPractice: [
      { label: "Live-code the retry wrapper", prompt: "Implement a retry decorator with per-call state, functools.wraps, bounded jittered exponential backoff, injectable sleep/rng for tests, and a terminal re-raise policy. Then explain why it is safe under concurrent calls." },
      { label: "Design the async migration", prompt: "Design sync and async retry wrappers for a feature pipeline. Preserve cancellation semantics, avoid duplicated policy logic where reasonable, and explain what observability you keep out of the hot path." },
      { label: "Defend the architecture", prompt: "Given a sub-millisecond online inference SLA and audit requirements for retry metrics, choose between runtime introspection, explicit decorators, generated wrappers, and infrastructure retries. Provide a trade-off matrix." },
    ],
    tutorPrompts: {
      preTry: "Do not read this like a textbook. Before answering each stage, say out loud: what state exists, who owns it, how long it lives, and what happens when 1,000 workers execute it together.",
      postFail: "Ask the tutor to replay only the stage you missed as a hostile interviewer. Require one follow-up about concurrency and one follow-up about production observability.",
      weeklyRecap: "Re-solve the same simulation in one week without seeing the options. If you cannot rebuild the wrapper from scratch, you recognized the answer but did not learn the mechanic.",
    },
    interviewGraph: {
      initialStageId: "stage_1_click_fault",
      stages: {
        stage_1_click_fault: {
          id: "stage_1_click_fault",
          type: "click_target",
          badge: "Stage 1 target",
          title: "Stage 1 · Flag the hidden state leak",
          prompt: "Before you get multiple choice options, click the exact line that creates long-lived shared state across production requests.",
          code_snippet: `import time

class FeatureStoreTimeout(TimeoutError):
    pass

def retry(max_attempts=3):
    attempts = 0  # ds-target:shared_attempts_cell

    def decorator(fn):
        def wrapper(*args, **kwargs):
            nonlocal attempts  # ds-target:nonlocal_symptom
            while attempts < max_attempts:
                try:
                    return fn(*args, **kwargs)
                except FeatureStoreTimeout:
                    attempts += 1
                    time.sleep(1)  # ds-target:fixed_sleep_symptom
            return None  # ds-target:silent_none_corruption
        return wrapper

    return decorator`,
          validationCopy: {
            shared_attempts_cell: "Correct target. The factory frame is created once at decoration time, so attempts is one closure cell shared by every invocation of the decorated function.",
            nonlocal_symptom: "Close, but nonlocal is the symptom. It exposes the outer cell; it did not create the lifetime bug by itself.",
            fixed_sleep_symptom: "This becomes the Stage 2 scale failure, but it is not why later calls immediately skip retries.",
            silent_none_corruption: "This is catastrophic error handling, but the shared counter is what makes the terminal path trigger across future requests.",
          },
          branches: {
            shared_attempts_cell: "stage_1_triage_choice",
            nonlocal_symptom: "recovery_stage_1_closure",
            fixed_sleep_symptom: "recovery_stage_1_closure",
            silent_none_corruption: "recovery_stage_1_closure",
            default: "recovery_stage_1_closure",
          },
        },
        recovery_stage_1_closure: {
          id: "recovery_stage_1_closure",
          type: "scenaro_choice",
          badge: "Recovery 1",
          title: "Recovery · Separate the cause from the symptom",
          prompt: "The interviewer stops you: 'You pointed at a bad line, but not the root memory lifetime. What object survives between calls?' Choose the repair that proves you understand decorator factory frames.",
          code_snippet: `def retry(max_attempts=3):
    attempts = 0
    def decorator(fn):
        def wrapper(*args, **kwargs):
            nonlocal attempts
            ...`,
          choices: [
            { id: "a", label: "Move attempts into wrapper", description: "Create per-invocation retry state and preserve the original function metadata with wraps." },
            { id: "b", label: "Replace nonlocal with global", description: "Coordinate all requests through a single module-level retry counter." },
            { id: "c", label: "Keep attempts outside but reset it on success", description: "Only successful calls clear the shared closure counter." },
            { id: "d", label: "Add a lock around attempts", description: "Serialize access to the shared counter rather than changing its lifetime." },
          ],
          branches: {
            a: "stage_2_concurrency_choice",
            b: "recovery_stage_1_closure",
            c: "recovery_stage_1_closure",
            d: "recovery_stage_2_locking",
          },
          rationale: "The repair is per-call state. A global counter makes cross-request leakage worse; reset-on-success still fails under persistent dependency outages; locking protects the wrong abstraction.",
        },
        stage_1_triage_choice: {
          id: "stage_1_triage_choice",
          type: "scenaro_choice",
          badge: "Stage 1 choice",
          title: "Stage 1 · Triage the correct production fix",
          prompt: "Now that you found the closure lifetime bug, choose the fix you would defend in code review.",
          code_snippet: `from functools import wraps

def retry(max_attempts=3, delay_seconds=1):
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            # where should retry state live?
            ...`,
          choices: [
            { id: "a", label: "Per-call state + explicit terminal failure", description: "Put attempts/last_error inside wrapper, use wraps, and raise when retry budget is exhausted." },
            { id: "b", label: "Global counter", description: "Share retry budget across workers so the whole service backs off together." },
            { id: "c", label: "Return None on exhaustion", description: "Keep serving predictions even if features are missing." },
            { id: "d", label: "Catch Exception broadly", description: "Treat every exception as transient because the feature store is flaky." },
          ],
          branches: {
            a: "stage_2_concurrency_choice",
            b: "recovery_stage_2_locking",
            c: "recovery_stage_1_closure",
            d: "recovery_stage_1_closure",
          },
          rationale: "The correct senior fix changes state lifetime and failure semantics together: per-call retry state prevents cross-request poisoning, and explicit terminal failure keeps downstream models from treating missing features as valid observations.",
        },
        stage_2_concurrency_choice: {
          id: "stage_2_concurrency_choice",
          type: "scenaro_choice",
          badge: "Stage 2 scale",
          title: "Stage 2 · Survive the Kubernetes thundering herd",
          prompt: "Good. Your closure fix ships. During a feature-store brownout, 1,000 pods retry at the same one-second boundaries and crush the dependency. Which refactor addresses the systems failure without creating a new bottleneck?",
          code_snippet: `def wrapper(*args, **kwargs):
    for attempt in range(max_attempts):
        try:
            return fn(*args, **kwargs)
        except FeatureStoreTimeout:
            if attempt == max_attempts - 1:
                raise
            time.sleep(1)`,
          choices: [
            { id: "a", label: "Bounded exponential backoff with full jitter", description: "Use per-call state, transient-only exception taxonomy, injectable sleep/rng, and randomized bounded delays." },
            { id: "b", label: "One module-level threading.Lock", description: "Let only one request execute the wrapped function during a brownout." },
            { id: "c", label: "Process-wide attempts dictionary", description: "Key attempts by function name so all threads share progress." },
            { id: "d", label: "Fixed sleep plus BaseException", description: "Catch everything and sleep exactly one second after every failure." },
          ],
          branches: {
            a: "stage_3_architecture_choice",
            b: "recovery_stage_2_locking",
            c: "recovery_stage_2_locking",
            d: "recovery_stage_2_locking",
          },
          rationale: "Fixed sleeps synchronize failure waves. Shared dictionaries and coarse locks reintroduce mutable shared state or head-of-line blocking. Full jitter decorrelates pods while preserving bounded retry budgets.",
        },
        recovery_stage_2_locking: {
          id: "recovery_stage_2_locking",
          type: "scenaro_choice",
          badge: "Recovery 2",
          title: "Recovery · Do not protect the wrong boundary",
          prompt: "The interviewer pushes back: 'Your lock prevents races by serializing the service. What happens to p99 and nested decorated calls?' Choose the concurrency-safe design.",
          code_snippet: `lock = threading.Lock()

def wrapper(*args, **kwargs):
    with lock:
        return fn(*args, **kwargs)`,
          choices: [
            { id: "a", label: "Remove shared retry state and jitter the waits", description: "No shared counter, no global critical section, randomized bounded retry schedule." },
            { id: "b", label: "Use RLock instead", description: "Permit recursive decorated calls while preserving one global bottleneck." },
            { id: "c", label: "Increase max_attempts", description: "Give each request more chances during brownouts." },
            { id: "d", label: "Move the lock into the database client", description: "Hide serialization one layer lower." },
          ],
          branches: {
            a: "stage_3_architecture_choice",
            b: "recovery_stage_2_locking",
            c: "recovery_stage_2_locking",
            d: "recovery_stage_2_locking",
          },
          rationale: "A lock can make a race disappear while making the product unusable. The principal move is to remove shared state from the hot path and decorrelate retries rather than serialize traffic.",
        },
        stage_3_architecture_choice: {
          id: "stage_3_architecture_choice",
          type: "scenaro_choice",
          badge: "Stage 3 trade-off",
          title: "Stage 3 · Choose the architecture under a sub-millisecond SLA",
          prompt: "The platform now needs sync services, asyncio pipelines, retry metrics by function, and a sub-millisecond online inference budget. None of the choices is perfect; choose the strongest default for the latency-critical path.",
          code_snippet: `# Constraint set:
# - online wrapper budget: < 1 ms per record
# - batch jobs need rich retry diagnostics
# - asyncio migration is in flight
# - audit needs metrics by function name`,
          choices: [
            { id: "a", label: "Explicit sync/async decorators + shared policy helpers", description: "Pre-bind metric labels, avoid per-call stack inspection, and use infrastructure/client retries when function context is not required." },
            { id: "b", label: "One universal introspecting decorator", description: "Call inspect.signature and inspect.iscoroutinefunction on each invocation so one API handles everything." },
            { id: "c", label: "Inline retries in every scoring function", description: "Eliminate wrapper overhead and let each team customize retry semantics." },
            { id: "d", label: "Retry until success with a global lock", description: "Prioritize consistency by ensuring only one wrapped call runs at a time." },
          ],
          branches: {
            a: "terminal_principal_tradeoff",
            b: "recovery_stage_3_tradeoff",
            c: "recovery_stage_3_tradeoff",
            d: "recovery_stage_3_tradeoff",
          },
          rationale: "The strong default separates hot-path mechanics from policy. Explicit wrappers avoid runtime introspection cliffs while shared helpers keep retry budgets, metrics, and exception taxonomy consistent.",
        },
        recovery_stage_3_tradeoff: {
          id: "recovery_stage_3_tradeoff",
          type: "scenaro_choice",
          badge: "Recovery 3",
          title: "Recovery · Defend trade-offs, not magic",
          prompt: "The interviewer rejects the perfect-wrapper fantasy. Pick the answer that names what you sacrifice on the latency-critical path.",
          code_snippet: `# Senior rubric:
# 1. What do you remove from the hot loop?
# 2. Which observability do you keep?
# 3. Where does retry policy live?
# 4. How do sync and async callables avoid semantic drift?`,
          choices: [
            { id: "a", label: "Remove hot-loop introspection", description: "Keep low-cardinality metrics and shared policy helpers; move rich diagnostics to batch or cold paths." },
            { id: "b", label: "Keep maximum introspection everywhere", description: "Optimize later if p99 gets bad." },
            { id: "c", label: "Drop all metrics", description: "Meet latency by removing observability." },
            { id: "d", label: "Promise exactly-once retries", description: "Guarantee correctness through decorator-level locking." },
          ],
          branches: {
            a: "terminal_principal_tradeoff",
            b: "recovery_stage_3_tradeoff",
            c: "recovery_stage_3_tradeoff",
            d: "recovery_stage_3_tradeoff",
          },
          rationale: "Principal engineers state what they give up. In this case, the online path sacrifices universal runtime magic and rich per-call introspection, while retaining bounded policy, low-cardinality metrics, and explicit sync/async semantics.",
        },
        terminal_principal_tradeoff: {
          id: "terminal_principal_tradeoff",
          type: "scenaro_choice",
          badge: "Terminal",
          title: "Simulation complete · Principal-level defense",
          prompt: "You navigated the bug, the scale failure, and the architecture trade-off. Now summarize the invariants you refused to violate before marking the module complete.",
          code_snippet: `# Non-negotiables:
# - per-call retry state
# - transient-only exception taxonomy
# - bounded jittered backoff
# - explicit sync/async semantics
# - no stack inspection in the online hot loop
# - metrics that distinguish dependency failure from code defects`,
          choices: [],
          branches: {},
          terminal: true,
          rationale: "This is the actual interview bar: you debugged the language-level closure leak, handled concurrency without coarse serialization, and chose a production architecture by making explicit latency, observability, and maintainability trade-offs.",
        },
      },
    },
    knowledgeCheck: [],
  },

  "py-d1": {
    durationLabel: MODULE_TIME_LABEL,
    outcomes: [
      "Model ndarrays by shape + dtype before writing transforms.",
      "Use broadcasting intentionally and detect mismatch risks early.",
      "Differentiate views from copies to avoid hidden side effects.",
    ],
    learnMarkdown: `## Outcomes

- Predict array behavior from **shape, dtype, and axis intent**.
- Explain why vectorized code is fast (native loops, contiguous memory).
- Prevent silent bugs from accidental broadcasting and aliasing.

## Mental model

NumPy is a memory model plus optimized kernels, not just “fast lists.” Strong practitioners narrate an array contract before coding: input shape, output shape, dtype change, and memory ownership.

## Broadcasting discipline

Broadcasting compares dimensions from right to left. A dimension pair is compatible when equal or one side is 1. That means many expressions run successfully while still being semantically wrong. Write expected shapes next to key expressions, then verify.

## View vs copy

Basic slicing often returns a **view**; advanced indexing usually returns a **copy**. If you mutate a view, parent data may change unexpectedly. Use explicit .copy() at ownership boundaries (feature handoff, model input assembly, cached artifacts).

## Interview framing

Show correctness on a tiny fixture first, then vectorize, then benchmark. Explain both runtime gains and memory tradeoffs.`,
    video: { youtubeId: "QUT1VHiLmmI", title: "NumPy Arrays and Vectorization", channel: "freeCodeCamp.org", startSeconds: 0 },
    videoFallbackMarkdown: `## Deep dive fallback

1. Build a small \`(10000, 20)\` array and compute row means via Python loop.
2. Rewrite with \`arr.mean(axis=1)\` and compare runtime.
3. Trigger one intentional broadcasting mistake, then fix it.
4. Slice a view, mutate it, and observe parent changes; repeat with .copy().

Finish with a short note: what improved, why it improved, and where memory ownership mattered.`,
    tryGuidance: "In the interactive, predict shape, dtype, and view/copy behavior before each step. Run it, then reconcile prediction vs observed output.",
    relatedPractice: [
      { label: "Catch a silent broadcast", prompt: "Combine a (5000, 1) and a (1, 12) array, write the expected output shape next to the expression, then state whether the (5000, 12) result is the business intent or an accidental cross-product bug." },
      { label: "View vs copy audit", prompt: "Slice an array to get a view, mutate it, and observe the parent change; then add an explicit .copy() at the ownership boundary and explain when each behavior is correct." },
    ],
    knowledgeCheck: [
      {
        question: "What should you verify before relying on broadcasting between shapes (5000, 1) and (1, 12)?",
        options: [
          "That the resulting (5000, 12) expansion matches business intent, not just syntax compatibility.",
          "That NumPy flattens both arrays to 1D first.",
          "That identical shape is required for all arithmetic.",
        ],
        correctIndex: 0,
        explanation: "These shapes are compatible, but semantic correctness still depends on whether cross-combining rows and columns is intended.",
      },
      {
        question: "Why can mutating arr[:, :3] change the original array?",
        options: [
          "Because basic slicing usually returns a view sharing underlying memory.",
          "Because NumPy deep-copies slices and syncs them back.",
          "Because slicing converts arrays into Python lists.",
        ],
        correctIndex: 0,
        explanation: "Shared memory is the key behavior; call copy() when you need isolation.",
      },
      {
        question: "Which interview answer signals mature vectorization judgment?",
        options: [
          "Demonstrate correctness first, then benchmark loop vs vectorized code and discuss memory tradeoffs.",
          "Claim vectorization is always faster without measurement.",
          "Focus only on shorter syntax.",
        ],
        correctIndex: 0,
        explanation: "Measured tradeoff reasoning is stronger than slogan-level optimization advice.",
      },
    ],
  },
  "py-d2": {
    durationLabel: MODULE_TIME_LABEL,
    outcomes: ["Use explicit indexing to avoid chained-assignment ambiguity.","Track dtype/null drift after each transform stage.","Build auditable DataFrame pipelines with clear contracts."],
    learnMarkdown: `## Outcomes

- Apply explicit row/column selection with predictable mutation semantics.
- Detect dtype drift before it corrupts downstream logic.
- Treat row-count, schema, and null-rate checks as first-class QA.

## Core approach

Pandas code fails silently when intent is implicit. Keep transforms staged: ingest, validate schema, normalize types, apply feature logic, then QA output.

Prefer .loc / .iloc with clear targets. Avoid ambiguous chained updates. After key steps, verify dtypes, null rates, and row counts so semantic errors are caught early.

## Interview framing

Strong answers explain reliability controls, not just API memory: schema assertions, null policy, and post-transform checks.`,
    video: { youtubeId: "vmEHCJofslg", title: "Pandas DataFrames Tutorial", channel: "freeCodeCamp.org", startSeconds: 0 },
    videoFallbackMarkdown: `## Deep dive fallback

Load a messy CSV, snapshot dtypes/nulls/row count, perform one filter and one explicit .loc assignment, normalize one column type, then re-snapshot.

Close by writing a mini data contract: required columns, expected dtype families, and null thresholds.`,
    tryGuidance: "Before each interactive step, predict row count and dtype/null changes. After execution, explain any mismatch as a contract violation or expected behavior.",
    relatedPractice: [
      { label: "Kill the chained assignment", prompt: "Rewrite this chained-assignment update into an explicit .loc[mask, col] = value form, then explain what mutation ambiguity the original code risked." },
      { label: "Snapshot a data contract", prompt: "For a messy CSV, snapshot dtypes, null rates, and row count before and after one transform, then write a mini data contract asserting required columns, dtype families, and null thresholds." },
    ],
    knowledgeCheck: [
      { question: "Why prefer explicit .loc assignments in production pandas code?", options: ["They clarify mutation intent and reduce ambiguous chained-assignment behavior.","They are always the fastest possible operation.","They automatically enforce relational constraints."], correctIndex: 0, explanation: "Deterministic, reviewable mutation semantics matter more than micro-optimizations." },
      { question: "Why is dtype drift dangerous when code still runs?", options: ["Operations can change meaning silently, producing wrong business conclusions.","Pandas will always raise compile-time errors.","Drift only changes plotting style."], correctIndex: 0, explanation: "Silent semantic errors are the real risk; assertions catch them." },
      { question: "What signals senior pandas judgment in interviews?", options: ["A staged pipeline with schema checks, null policy, type normalization, and QA.","Listing many pandas methods quickly.","Relying on visual inspection only."], correctIndex: 0, explanation: "Process rigor and validation discipline are key senior signals." },
    ],
  },
  "py-d3": {
    durationLabel: MODULE_TIME_LABEL,
    outcomes: ["Define data grain before groupby/merge/pivot operations.","Prevent join fan-out and aggregate inflation.","Validate reshaped outputs with reconciliation checks."],
    learnMarkdown: `## Outcomes

- State table grain clearly before transformation.
- Merge datasets without accidental duplication.
- Use pivots for communication while preserving reconciled totals.

## Grain-first workflow

Most groupby/merge bugs come from unclear grain. Ask: what does one row represent now, and what should it represent after this step?

Before merges, check key uniqueness and record pre-join row counts. After merges, compare row counts and null deltas. For groupby, choose aggregates that reflect business meaning, then name output columns accordingly.

## Interview framing

Discuss a QA checklist: uniqueness assertions, row-count deltas, and reconciliation totals before trusting metrics.`,
    video: { youtubeId: "txMdrV1Ut64", title: "Pandas GroupBy, Merge, and Pivot", channel: "Data School", startSeconds: 0 },
    videoFallbackMarkdown: `## Deep dive fallback

Create two toy tables with duplicate keys, predict merge row count, run merge, fix fan-out via dedupe/pre-agg policy, then group and pivot results while reconciling totals.`,
    tryGuidance: "In the interactive, say the grain out loud at every stage (e.g., one row per customer-day), then verify whether joins/groupings changed it as predicted.",
    relatedPractice: [
      { label: "Reproduce a join fan-out", prompt: "Build two toy tables with non-unique join keys, predict the post-merge row count, run the merge to confirm the fan-out, then fix it with a dedupe or pre-aggregation policy." },
      { label: "Reconcile a pivot", prompt: "Group then pivot a dataset and prove the pivot totals reconcile back to the pre-pivot aggregate; state the grain at each stage out loud." },
    ],
    knowledgeCheck: [
      { question: "What most often causes inflated metrics after a merge?", options: ["Non-unique join keys multiplying rows.","Using left join instead of right join.","Pivoting before filtering."], correctIndex: 0, explanation: "Duplicate-key fan-out is the classic double-counting failure mode." },
      { question: "Why define grain before groupby logic?", options: ["Aggregate correctness depends on what each row represents.","Pandas requires grain metadata to run.","Grain only affects chart formatting."], correctIndex: 0, explanation: "Without grain clarity, outputs can be plausible but wrong." },
      { question: "Which interview response is strongest?", options: ["State uniqueness assumptions, expected row counts, and reconciliation checks.","Memorize join syntax only.","Trust outputs if nulls are low."], correctIndex: 0, explanation: "Reliability thinking beats syntax-only recall." },
    ],
  },
  "py-d4": {
    durationLabel: MODULE_TIME_LABEL,
    outcomes: ["Classify missingness sources and pick policy intentionally.","Measure metric impact of drop/fill/impute choices.","Document null assumptions as data-contract decisions."],
    learnMarkdown: `## Outcomes

- Distinguish missing-at-source from missing-after-transform.
- Choose null policy by business meaning, not convenience.
- Quantify downstream impact and monitor null behavior over time.

## Nulls are semantic, not cosmetic

A null can mean unknown, inapplicable, delayed ingestion, or pipeline failure. Treating all nulls as zero often rewrites business meaning.

Use a decision loop: identify cause, determine whether missingness is informative, choose policy (drop/fill/impute/indicator), then compare KPI deltas before vs after.

## Interview framing

Mature answers discuss bias, explainability, and monitoring thresholds — not one universal imputation rule.`,
    video: { youtubeId: "f9vYq2xFAm8", title: "Handling Missing Data in Pandas", channel: "Data School", startSeconds: 0 },
    videoFallbackMarkdown: `## Deep dive fallback

Profile null rates by column and segment, apply three policies on one important field (drop, statistical fill, domain sentinel), recompute a KPI under each, then justify one monitored policy choice.`,
    tryGuidance: "Use each interactive branch as a policy fork: predict row-count, null-rate, and downstream metric impact before selecting a strategy.",
    relatedPractice: [
      { label: "Compare null policies on a KPI", prompt: "Pick one important field, apply drop / statistical fill / domain sentinel separately, recompute the same KPI under each, and justify which policy you would monitor in production and why." },
      { label: "Classify the missingness", prompt: "Profile null rates by column and segment, then label each gap as unknown, inapplicable, delayed ingestion, or pipeline failure, and explain how that label changes the right policy." },
    ],
    knowledgeCheck: [
      { question: "Why is blanket zero-fill risky?", options: ["Zero may represent a real value and distort business meaning when substituted for unknowns.","Pandas blocks zero-filled columns.","Zero always causes runtime errors."], correctIndex: 0, explanation: "Imputation must preserve semantics, not just remove nulls." },
      { question: "Best first step for null handling?", options: ["Identify missingness mechanism and business context.","Apply median fill globally.","Drop every row with any null."], correctIndex: 0, explanation: "Policy quality depends on cause and decision context." },
      { question: "Strongest interview answer on missing data?", options: ["Compare strategies, quantify downstream impact, and justify a monitored policy.","State one universal rule.","Treat null handling as cosmetic cleanup."], correctIndex: 0, explanation: "Evidence-backed tradeoff reasoning signals maturity." },
    ],
  },
  "py-d5": {
    durationLabel: MODULE_TIME_LABEL,
    outcomes: ["Profile first, then optimize bottlenecks with evidence.","Replace row-wise loops with vectorized/batched work when appropriate.","Balance runtime gains against memory/readability costs."],
    learnMarkdown: `## Outcomes

- Separate Python-loop overhead from algorithmic or I/O bottlenecks.
- Apply optimization changes that preserve correctness and maintainability.
- Present performance improvements with reproducible measurements.

## Optimization workflow

Use this sequence: profile, lock correctness, optimize dominant cost, re-measure, document tradeoffs. “Vectorize don’t loop” is directionally useful, but not a substitute for measurement.

Vectorized rewrites can raise memory usage via temporary arrays. Good engineering weighs runtime, memory headroom, and long-term readability.

## Interview framing

Tell a concrete before/after story with numbers, mechanism, and one tradeoff you accepted or mitigated.

## When NOT to vectorize

Vectorization is a default, not a religion. Walk this decision tree before rewriting a loop.

- **Tiny N or one-off scripts.** If the data is small or the script runs once, a plain ${MD_CODE_TICK}for${MD_CODE_TICK} loop is clearer and the speed difference is noise. Optimize the reader's time, not the CPU's.
- **Complex stateful logic.** When each step depends on prior results (path-dependent rules, early exits, accumulating side effects), a loop expresses intent honestly. Forcing it into ${MD_CODE_TICK}np.where${MD_CODE_TICK} chains or masked passes often produces unreadable code that hides bugs.
- **Readability for juniors.** On a shared codebase, a loop a teammate can debug at 2am beats a dense one-liner only you understand. Clarity is a maintenance cost you pay every review.
- **Caching beats premature optimization.** If the real cost is recomputation, ${MD_CODE_TICK}functools.lru_cache${MD_CODE_TICK} or memoizing an expensive call removes the work entirely — safer and bigger than micro-tuning a loop body.
- **Memory cost outweighs speed.** Vectorized rewrites materialize big intermediate arrays. If a temporary doubles peak memory and risks an OOM, a streaming or chunked loop that trades a little CPU for bounded memory is the correct engineering call.

Rule of thumb: profile first, then vectorize only the dominant cost where the speed win clears the readability and memory bill.`,
    video: { youtubeId: "0A5x5x9N7YQ", title: "Vectorization vs Loops in Python", channel: "Krish Naik", startSeconds: 0 },
    videoFallbackMarkdown: `## Deep dive fallback

Implement a row-wise baseline transform, profile it, rewrite with vectorized/batched operations, re-measure runtime and memory, then summarize baseline vs optimized metrics and tradeoffs.`,
    tryGuidance: "In the interactive, classify each step before running it: Python iteration, vectorized native execution, or I/O-bound. Compare prediction to observed runtime behavior.",
    relatedPractice: [
      { label: "Profile before you rewrite", prompt: "Profile a row-wise baseline transform, identify the dominant cost, then vectorize only that hotspot and report before/after runtime and peak memory." },
      { label: "Defend keeping the loop", prompt: "Given a small-N, stateful transform, write the loop version and argue why vectorizing it would hurt readability or memory more than it helps runtime." },
    ],
    knowledgeCheck: [
      { question: "What should happen before any performance rewrite?", options: ["Profile to locate the true bottleneck.","Replace all loops immediately.","Tune comments and variable names for speed."], correctIndex: 0, explanation: "Measurement prevents wasted optimization effort." },
      { question: "Why can a vectorized rewrite still be a poor production choice?", options: ["It may increase memory pressure or reduce maintainability despite CPU gains.","Vectorized code cannot be tested.","Vectorized code is numerically random."], correctIndex: 0, explanation: "Performance decisions are multi-objective, not CPU-only." },
      { question: "What interview response best demonstrates optimization maturity?", options: ["Present before/after metrics, explain mechanism, and discuss tradeoffs.","Claim a big speedup without method.","Say optimization is unnecessary if code runs."], correctIndex: 0, explanation: "Evidence plus tradeoff clarity is the strongest signal." },
    ],
  },
};

/**
 * Identity-based cluster milestones: career-framed "you can now…" statements
 * keyed by cluster id. Used to render progression as professional capability,
 * not just completion percentage.
 */
export const PYTHON_CLUSTER_MILESTONES = {
  "py-basics": {
    title: "Python Foundations",
    completionStatement: "You can now debug aliasing and mutation bugs by reasoning about name→object bindings, and defend type-and-format choices the way a senior reviews a junior's first pull request.",
    skills: [
      "Trace a ghost-mutation bug to a shared reference instead of guessing",
      "Choose dict/set/Counter for an ETL task and justify the O(1) lookup story",
      "Reject f-strings in SQL and logging, reaching for parameterized queries and lazy %-format",
    ],
  },
  "py-control": {
    title: "Control Flow and Iteration",
    completionStatement: "You can now structure branching, looping, and error handling so a teammate predicts every code path, and you spot the comprehension or generator that turns an O(n^2) loop into a readable one-pass.",
    skills: [
      "Replace nested branches with guard clauses and early returns reviewers trust",
      "Pick generators over lists when memory and laziness matter, and explain why",
      "Scope try/except to the narrowest failing operation instead of swallowing everything",
    ],
  },
  "py-oop": {
    title: "Object-Oriented Python",
    completionStatement: "You can now review production class designs and justify inheritance-vs-composition tradeoffs in a code review.",
    skills: [
      "Audit constructors for hidden side effects and push them into explicit lifecycle methods",
      "Spot Liskov violations in subclass trees before they ship as silent contract breaks",
      "Read a decorator stack and predict its runtime order, metadata, and exception behavior",
    ],
  },
  "py-data": {
    title: "Data Wrangling with NumPy and Pandas",
    completionStatement: "You can now own a data-cleaning pipeline end to end — defending grain, null policy, and vectorization choices with measurements instead of slogans in a design review.",
    skills: [
      "State table grain before a merge and predict join fan-out before it inflates a metric",
      "Choose a null policy by business meaning and quantify its KPI impact",
      "Decide when NOT to vectorize, weighing memory and readability against CPU wins",
    ],
  },
};

/**
 * @param {string} clusterId - one of "py-basics", "py-control", "py-oop", "py-data"
 * @returns {{ title: string, completionStatement: string, skills: string[] } | null}
 */
export function getClusterMilestone(clusterId) {
  return PYTHON_CLUSTER_MILESTONES[clusterId] || null;
}

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

    tryGuidance: "Use the binding lab below as a prediction game: choose a scenario, decide whether the code will **mutate** an existing object, **rebind** a name, or compare **value vs identity**, then verify the name → object diagram and debugger cue.",

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
      "State the **hashability contract** (${MD_CODE_TICK}__hash__${MD_CODE_TICK} + ${MD_CODE_TICK}__eq__${MD_CODE_TICK}) and predict which types can be keys.",
      "Use dict/set **operators** fluently: `|`, `&`, `-`, `^`, `|=`, `{**a, **b}` — and spot their complexity.",
      "Avoid the bugs: mutating during iteration, shared-reference values, relying on hash order across runs.",
    ],
    learnMarkdown: `## The mental model (say this first)

A \`dict\` is a **hash table**. So is a \`set\` — it is just a hash table that throws away the value and only keeps keys. Everything else follows from two facts:

- You must be able to **hash** a key into a number (fast, deterministic within a run).
- You must be able to **compare** two keys with \`==\` (to resolve collisions and detect duplicates).

That is the entire ${MD_CODE_TICK}__hash__${MD_CODE_TICK} / ${MD_CODE_TICK}__eq__${MD_CODE_TICK} contract. Violate it and the table silently loses data.

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

A value can be a dict key / set element only if it is **hashable**: it has a stable ${MD_CODE_TICK}__hash__${MD_CODE_TICK} and sensible ${MD_CODE_TICK}__eq__${MD_CODE_TICK}. The rules of thumb you must know cold:

- **Hashable**: \`int\`, \`float\`, \`str\`, \`bytes\`, \`tuple\` (if **all** elements are hashable), \`frozenset\`, and your own classes by default (hash on id).
- **Unhashable**: \`list\`, \`dict\`, \`set\`, \`bytearray\`. Anything that can **mutate** in place.

\`\`\`
key = (user_id, date)      # ok — tuple of hashables
key = (user_id, [1, 2])    # TypeError when you try to use it
\`\`\`

**Dataclass gotcha:** \`@dataclass\` gives you equality but **not** hashability by default. Use \`@dataclass(frozen=True)\` to make instances hashable and usable as dict keys / set elements.

**Custom classes:** if you override ${MD_CODE_TICK}__eq__${MD_CODE_TICK}, Python sets \`__hash__ = None\` unless you also define ${MD_CODE_TICK}__hash__${MD_CODE_TICK}. Equal objects **must** hash to the same value — otherwise dict/set silently loses them.

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
- **\`if x == None:\`** works but is non-idiomatic and breaks for proxy objects that override ${MD_CODE_TICK}__eq__${MD_CODE_TICK}. Use \`is None\`.
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
      "Open the **branch router** and run two experiments. **Mode 1 (if-chain)**: pick the empty string \`\"\"\` and notice it falls all the way to the \`isinstance(x, str)\` branch — the truthiness branch never fires. Then pick \`None\` and watch the very first branch catch it. **Mode 2 (match/case)**: send \`Point(0, 0)\` and watch the \`Point(x=0, y=0)\` branch fire instead of \`Point(x, y) if x == y\` — first-match-wins. Then send \`Point(3, 3)\` and watch how the *order* of cases changes the answer. Finally, scroll to the wildcard \`case _:\` and ask yourself: which branches above it are reachable for which subjects?",

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
      "Open the **iterator engine** below and run it in two passes. **Mode 1 (Iterator Protocol)**: pick a small source, then click *next()* repeatedly. Watch the cursor index advance, the consumed items move into the *yielded* tray, and the eventual \`StopIteration\`. Try clicking *next()* one more time after exhaustion — it stays raised, the cursor doesn't reset. **Mode 2 (Lazy Pipeline)**: pick a source and chain a *filter → map → take*. Click *pull* one step at a time and watch *only one item at a time* flow through every stage — that is laziness made visible. Compare with the *eager* toggle to see how the equivalent list-comprehension version would inflate intermediate lists. The bottom \"memory in flight\" counter tells the whole story: lazy stays at 1, eager grows linearly with N.",

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

## Forwarding correctly: the ${MD_CODE_TICK}functools.wraps${MD_CODE_TICK} and \`(*args, **kwargs)\` pattern

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

"A Python signature has five slots in fixed order: positional-only (before \`/\`), positional-or-keyword, \`*args\`, keyword-only (after \`*\` or \`*args\`), \`**kwargs\`. The bare \`*\` is how I make boolean flags keyword-only at the call site so the code reads. Defaults are evaluated once at definition time, so I use \`None\` as a sentinel for any mutable default. Decorators forward with \`(*args, **kwargs)\` plus ${MD_CODE_TICK}functools.wraps${MD_CODE_TICK} to preserve introspection. The \`TypeError\`s — \`missing\`, \`unexpected\`, \`multiple values\` — all map back to the same five binding rules."`,

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
      "Open the **argument binder** below and run two experiments. **Mode 1 (signature)**: pick a signature with all five slot kinds (the *render* example) and watch the divider lines for \`/\` and \`*\` — every parameter to the left of \`/\` is positional-only, every parameter to the right of \`*\` is keyword-only. **Mode 2 (call site)**: add positional, keyword, \`*list\`, and \`**dict\` arguments and watch them route into the slots in real time. The arrows turn red the moment a binding rule breaks — *missing required*, *multiple values*, *unexpected keyword*. Toggle the *mutable default* example to see the same default-list object grow across three call frames — that is the bug, made literal.",

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
      "Default to a **comprehension** over `map` / `filter` when readability is the tiebreaker, and pick the right escape hatch — \`operator.*\`, \`functools.partial\`, named \`def\` — when a lambda becomes a smell.",
      "Pick the right **reducer**: `sum` / `min` / `max` / `any` / `all` / `Counter` / \`statistics.fmean\` — and only fall back to **`reduce`** for genuinely custom folds.",
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

But they hash by identity, not by source code. Two lambdas with the same body are different keys. If you ever find yourself doing this, switch to a named \`def\` or a \`callable\` class with ${MD_CODE_TICK}__hash__${MD_CODE_TICK}.

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
      "Open the **fold machine** below and run three experiments. **Mode 1 (lambda decoder)**: pick a recipe like \`lambda r: r[\"revenue\"]\` and watch four equivalents render side-by-side — \`def\`, comprehension, \`operator.itemgetter\`, \`functools.partial\`. The verdict pill tells you which one a senior reviewer would prefer. **Mode 2 (pipeline lab)**: configure a filter and a map; watch the source flow through both stages with rejected items struck out and transformed values lit up. **Mode 3 (fold animation)**: pick a binary reducer (sum / max / product / set-union / dict-merge), step one item at a time, and watch the accumulator update — \`acc = fn(acc, x)\` — frame by frame. The empty-iterable + no-initial case is one of the buttons; click it to see the actual TypeError Python raises.",

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
      "Catch the **narrowest exception that means what you mean** — never bare \`except:\` (which swallows \`KeyboardInterrupt\` / \`SystemExit\`), rarely \`except Exception:\` — and use multi-type \`except (A, B):\` and the \`as e\` binding correctly.",
      "Re-raise without losing the traceback (`raise`), chain causes (`raise NewError() from e`), and silence chains (`raise NewError() from None`) — and explain the difference between **`__cause__`** (explicit) and **`__context__`** (implicit during handling).",
      "Read a Python traceback **bottom-up**: the actual error is the **last** line; the frames above are the call stack from outermost to innermost. Distinguish the two boilerplate lines — *direct cause of* vs *during handling of*.",
      "Debug like a senior: \`breakpoint()\` over \`print\`, \`logger.exception()\` over \`print(e)\`, **pdb post-mortem** (`python -m pdb -c continue script.py`), \`traceback.format_exc()\` for capture, and \`assert\` for invariants — with the \`-O\` caveat.",
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
      "Open the **traceback theater** below and run three experiments. **Mode 1 (try/except router)**: pick what happens inside the \`try\` (raise ValueError, raise KeyError, return early, no error) and an except chain — watch the green/red highlights show *exactly* which clauses run, in order, and check that \`finally\` is always lit. **Mode 2 (hierarchy match)**: pick a raised exception class and a chain of \`except\` clauses; the visualization walks the chain top-down using \`isinstance\` and shows the first match winning — try ordering \`OSError\` *before* \`FileNotFoundError\` to see the dead-code case. **Mode 3 (traceback reader)**: toggle \`raise\` vs \`raise from e\` vs \`raise from None\` and read how the boilerplate lines change between *direct cause of* and *during handling of* — and which line is the actual error.",

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

  ...PYTHON_EXTENDED_MODULES,

  "sql-found-01": {
    durationLabel: "12 min",
    outcomes: [
      "Explain SQL logical execution order without relying on top-to-bottom reading.",
      "Fix alias-in-WHERE and HAVING misuse under interview pressure.",
      "Choose WHERE vs HAVING based on correctness and early-filter performance.",
    ],
    learnMarkdown: `## Rapid revision: SQL does not execute top-to-bottom

Your eyes read SELECT, FROM, WHERE. The database reasons in a logical order: FROM/JOIN, WHERE, GROUP BY, HAVING, SELECT, then ORDER BY/LIMIT.

That is why a SELECT alias does not exist when WHERE runs. WHERE filters individual rows before SELECT creates aliases. HAVING filters grouped buckets after aggregation.

## Interview muscle memory

- Use WHERE for row-level filters before aggregation.
- Use HAVING for aggregate filters after GROUP BY.
- If you need a SELECT alias in a filter, wrap the query in a subquery/CTE or repeat the expression where the dialect permits it.
- Prefer filtering early in WHERE when the predicate is row-level; it reduces rows before grouping and usually lowers compute cost.`,
    video: null,
    videoFallbackMarkdown: `## 3-minute execution-order drill

Say this sequence out loud until it is automatic: FROM/JOIN -> WHERE -> GROUP BY -> HAVING -> SELECT -> ORDER BY/LIMIT.

Then explain why WHERE cannot see SELECT aliases but ORDER BY often can in many SQL dialects.`,
    tryGuidance: "Run the interview simulation. First click the faulty SQL line, then survive the HAVING pivot and the WHERE-vs-HAVING trade-off.",
    interviewGraph: {
      initialStageId: "sql_order_alias_click",
      artifactDimensions: [
        { label: "Execution Order Recall", recoveryStageId: "sql_order_recovery_alias" },
        { label: "HAVING vs WHERE Edge Case", recoveryStageId: "sql_order_recovery_having" },
        { label: "Performance Filtering Instinct", recoveryStageId: "sql_order_recovery_tradeoff", passLabel: "Foundational Trade-Off Clear" },
      ],
      stages: {
        sql_order_alias_click: {
          id: "sql_order_alias_click",
          type: "click_target",
          badge: "Stage 1 target",
          title: "Stage 1 · Alias used before it exists",
          prompt: "This query looks readable, but it fails in most SQL engines. Click the exact line where the logical execution-order bug occurs.",
          code_snippet: `SELECT
  user_id,
  total_amount * 0.10 AS platform_fee
FROM orders
WHERE platform_fee > 25 -- ds-target:alias_in_where
ORDER BY platform_fee DESC;`,
          validationCopy: {
            alias_in_where: "Correct. WHERE runs before SELECT, so platform_fee has not been created yet when the row filter executes.",
          },
          branches: {
            alias_in_where: "sql_order_fix_choice",
          },
        },
        sql_order_recovery_alias: {
          id: "sql_order_recovery_alias",
          type: "scenario_choice",
          badge: "Recovery 1",
          title: "Recovery · Name the missing mental model",
          prompt: "The interviewer asks why the alias is invisible. Which explanation is strongest?",
          code_snippet: `-- Logical order:
-- FROM/JOIN -> WHERE -> GROUP BY -> HAVING -> SELECT -> ORDER BY/LIMIT`,
          choices: [
            { id: "a", label: "WHERE runs before SELECT", description: "The alias is assigned after row-level filtering." },
            { id: "b", label: "Aliases cannot contain underscores", description: "The name platform_fee violates no standard naming rule." },
            { id: "c", label: "ORDER BY must be removed", description: "ORDER BY is not the reason WHERE fails." },
            { id: "d", label: "WHERE only accepts literal constants", description: "WHERE can use expressions and columns, just not this SELECT alias yet." },
          ],
          branches: {
            a: "sql_order_fix_choice",
            b: "sql_order_recovery_alias",
            c: "sql_order_recovery_alias",
            d: "sql_order_recovery_alias",
          },
          rationale: "The fix begins with logical query processing order, not syntax superstition.",
        },
        sql_order_fix_choice: {
          id: "sql_order_fix_choice",
          type: "scenario_choice",
          badge: "Stage 1 choice",
          title: "Stage 1 · Choose the clean fix",
          prompt: "Which rewrite is the most portable and explicit fix?",
          code_snippet: `-- Goal: keep rows where total_amount * 0.10 > 25`,
          choices: [
            { id: "a", label: "Use a subquery/CTE", description: "Compute platform_fee first, then filter it in the outer query." },
            { id: "b", label: "Move the predicate to HAVING without GROUP BY", description: "Some dialects reject this and it confuses row vs aggregate filtering." },
            { id: "c", label: "Quote the alias in WHERE", description: "Quoting changes identifier parsing, not execution order." },
            { id: "d", label: "Keep the query and rely on optimizer rewrite", description: "The parser still has to resolve the name before optimization." },
          ],
          branches: {
            a: "sql_order_having_choice",
            b: "sql_order_recovery_alias",
            c: "sql_order_recovery_alias",
            d: "sql_order_recovery_alias",
          },
          rationale: "A subquery or CTE creates a new scope where platform_fee is now a real column for the outer WHERE.",
        },
        sql_order_having_choice: {
          id: "sql_order_having_choice",
          type: "scenario_choice",
          badge: "Stage 2 edge",
          title: "Stage 2 · HAVING is filtering the wrong thing",
          prompt: "The interviewer pivots to grouped revenue. Which clause belongs where?",
          code_snippet: `SELECT customer_id, SUM(total_amount) AS revenue
FROM orders
GROUP BY customer_id
HAVING status = 'completed' AND SUM(total_amount) > 1000;`,
          choices: [
            { id: "a", label: "WHERE status, HAVING revenue", description: "Filter completed rows before grouping; filter aggregate buckets after grouping." },
            { id: "b", label: "Put both predicates in HAVING", description: "status is row-level and may be invalid or ambiguous after grouping." },
            { id: "c", label: "Put both predicates in WHERE", description: "SUM(total_amount) does not exist before grouping." },
            { id: "d", label: "Move status into SELECT only", description: "Displaying status does not filter rows and can break grouping." },
          ],
          branches: {
            a: "sql_order_tradeoff_choice",
            b: "sql_order_recovery_having",
            c: "sql_order_recovery_having",
            d: "sql_order_recovery_having",
          },
          rationale: "Row predicates belong in WHERE. Aggregate predicates belong in HAVING.",
        },
        sql_order_recovery_having: {
          id: "sql_order_recovery_having",
          type: "scenario_choice",
          badge: "Recovery 2",
          title: "Recovery · Row filter vs bucket filter",
          prompt: "Choose the rule that repairs the HAVING mistake.",
          code_snippet: `-- WHERE sees rows.
-- HAVING sees grouped buckets.`,
          choices: [
            { id: "a", label: "WHERE before GROUP BY, HAVING after GROUP BY", description: "status goes WHERE; SUM threshold goes HAVING." },
            { id: "b", label: "HAVING always runs faster", description: "Late filters usually process more rows, not fewer." },
            { id: "c", label: "WHERE can use aggregate aliases", description: "WHERE still runs before aggregation and SELECT aliases." },
            { id: "d", label: "GROUP BY fixes all non-aggregated columns", description: "Grouping changes row grain; it does not decide predicate semantics." },
          ],
          branches: {
            a: "sql_order_tradeoff_choice",
            b: "sql_order_recovery_having",
            c: "sql_order_recovery_having",
            d: "sql_order_recovery_having",
          },
          rationale: "This is the core distinction interviewers expect: row filters before grouping, bucket filters after grouping.",
        },
        sql_order_tradeoff_choice: {
          id: "sql_order_tradeoff_choice",
          type: "scenario_choice",
          badge: "Stage 3 trade-off",
          title: "Stage 3 · Performance trade-off",
          prompt: "Both versions can be made correct. Which design is usually better for row-level predicates on a large table?",
          code_snippet: `-- Option 1: WHERE status = 'completed' before GROUP BY
-- Option 2: conditional aggregation or late HAVING-style filtering after grouping`,
          choices: [
            { id: "a", label: "Filter early in WHERE", description: "Reduce rows before grouping when the predicate is truly row-level." },
            { id: "b", label: "Filter late in HAVING", description: "Keep all rows through aggregation even when they cannot affect the result." },
            { id: "c", label: "Always use CTEs for speed", description: "CTEs are readability tools; optimizer behavior depends on the engine." },
            { id: "d", label: "Always use SELECT aliases", description: "Aliases improve readability but do not override logical execution order." },
          ],
          branches: {
            a: "sql_order_terminal",
            b: "sql_order_recovery_tradeoff",
            c: "sql_order_recovery_tradeoff",
            d: "sql_order_recovery_tradeoff",
          },
          rationale: "Early row filtering reduces the data volume entering GROUP BY and usually lowers memory/CPU pressure.",
        },
        sql_order_recovery_tradeoff: {
          id: "sql_order_recovery_tradeoff",
          type: "scenario_choice",
          badge: "Recovery 3",
          title: "Recovery · Correctness plus cost",
          prompt: "The interviewer asks for the performance intuition. Pick the answer that explains both semantics and cost.",
          code_snippet: `-- Big table: 500M orders
-- Only 8% have status = 'completed'`,
          choices: [
            { id: "a", label: "WHERE reduces group input", description: "For row-level predicates, WHERE discards irrelevant rows before aggregation." },
            { id: "b", label: "HAVING reduces scans", description: "HAVING cannot avoid reading/grouping rows needed to build the buckets." },
            { id: "c", label: "ORDER BY fixes performance", description: "Sorting happens late and often adds cost." },
            { id: "d", label: "SELECT aliases materialize indexes", description: "Aliases do not create physical storage or indexes." },
          ],
          branches: {
            a: "sql_order_terminal",
            b: "sql_order_recovery_tradeoff",
            c: "sql_order_recovery_tradeoff",
            d: "sql_order_recovery_tradeoff",
          },
          rationale: "A foundational answer ties logical order to data volume: filter rows as early as correctness allows.",
        },
        sql_order_terminal: {
          id: "sql_order_terminal",
          type: "scenario_choice",
          badge: "Terminal",
          title: "Revision complete · SQL execution order locked",
          prompt: "You handled alias scope, HAVING semantics, and the early-filter trade-off.",
          code_snippet: `-- Mental model:
-- FROM/JOIN -> WHERE -> GROUP BY -> HAVING -> SELECT -> ORDER BY/LIMIT`,
          choices: [],
          branches: {},
          terminal: true,
          rationale: "The candidate-ready answer is simple: WHERE cannot see SELECT aliases because SELECT has not happened yet; HAVING is for aggregate buckets; WHERE is preferred for row-level filters because it reduces work before grouping.",
        },
      },
    },
    knowledgeCheck: [],
  },

  "sql-found-02": {
    durationLabel: "12 min",
    outcomes: [
      "Predict UNKNOWN behavior in SQL three-valued logic.",
      "Avoid NOT IN traps when subqueries can emit NULL.",
      "Choose COALESCE, IFNULL, or CASE based on portability and semantic clarity.",
    ],
    learnMarkdown: `## Rapid revision: NULL means unknown, not empty

SQL predicates can evaluate to TRUE, FALSE, or UNKNOWN. WHERE only keeps TRUE. This is why one hidden NULL inside a NOT IN subquery can make every comparison unknown and return zero rows.

Use NOT EXISTS when checking absence against nullable subquery output. Use explicit CASE branches and ELSE clauses when NULL propagation would hide a business state.`,
    video: null,
    videoFallbackMarkdown: `## Drill

Given values 1, 2, NULL, predict the output of IN, NOT IN, equality, and CASE expressions before running them.`,
    tryGuidance: "Click the line where NULL poisons a NOT IN query, then handle CASE and null-replacement trade-offs.",
    interviewGraph: {
      initialStageId: "sql_null_not_in_click",
      artifactDimensions: [
        { label: "NULL Predicate Instinct", recoveryStageId: "sql_null_recovery_not_in" },
        { label: "CASE ELSE Discipline", recoveryStageId: "sql_null_recovery_case" },
        { label: "Null Replacement Trade-Off", recoveryStageId: "sql_null_recovery_tradeoff", passLabel: "Revision Trade-Off Clear" },
      ],
      stages: {
        sql_null_not_in_click: {
          id: "sql_null_not_in_click",
          type: "click_target",
          badge: "Stage 1 target",
          title: "Stage 1 · NOT IN poisoned by NULL",
          prompt: "This query unexpectedly returns zero customers. Click the line that introduces UNKNOWN into every NOT IN comparison.",
          code_snippet: `SELECT customer_id
FROM customers
WHERE customer_id NOT IN (
  SELECT customer_id -- ds-target:nullable_subquery_output
  FROM chargebacks
);`,
          validationCopy: {
            nullable_subquery_output: "Correct. If chargebacks.customer_id contains NULL, NOT IN can evaluate to UNKNOWN for every customer and WHERE keeps none of them.",
          },
          branches: {
            nullable_subquery_output: "sql_null_fix_choice",
          },
        },
        sql_null_recovery_not_in: {
          id: "sql_null_recovery_not_in",
          type: "scenario_choice",
          badge: "Recovery 1",
          title: "Recovery · Remember UNKNOWN",
          prompt: "Which rule explains the empty result?",
          code_snippet: `-- WHERE keeps TRUE only.
-- FALSE and UNKNOWN are both filtered out.`,
          choices: [
            { id: "a", label: "NOT IN plus NULL can become UNKNOWN", description: "A nullable subquery can poison the anti-filter." },
            { id: "b", label: "NOT IN means INNER JOIN", description: "NOT IN is a predicate, not a join operator." },
            { id: "c", label: "NULL equals every value", description: "NULL equals nothing, not even another NULL under ordinary =." },
            { id: "d", label: "Subqueries cannot return NULL", description: "They can unless constrained or filtered." },
          ],
          branches: { a: "sql_null_fix_choice", b: "sql_null_recovery_not_in", c: "sql_null_recovery_not_in", d: "sql_null_recovery_not_in" },
          rationale: "Three-valued logic is the foundation: UNKNOWN is not TRUE, so WHERE drops it.",
        },
        sql_null_fix_choice: {
          id: "sql_null_fix_choice",
          type: "scenario_choice",
          badge: "Stage 1 choice",
          title: "Stage 1 · Choose the safe anti-join",
          prompt: "What is the safest rewrite when the right-hand key may contain NULL?",
          code_snippet: `-- Goal: customers with no chargebacks`,
          choices: [
            { id: "a", label: "Use NOT EXISTS", description: "Correlate on equality and avoid NULL poisoning." },
            { id: "b", label: "Use NOT IN unchanged", description: "This preserves the bug when NULL is present." },
            { id: "c", label: "Use = NULL", description: "Equality to NULL is UNKNOWN; use IS NULL for null checks." },
            { id: "d", label: "Use COUNT(*) > 0", description: "That verifies presence, not absence, unless wrapped carefully." },
          ],
          branches: { a: "sql_null_case_choice", b: "sql_null_recovery_not_in", c: "sql_null_recovery_not_in", d: "sql_null_recovery_not_in" },
          rationale: "NOT EXISTS is usually the clean absence check when nullability is possible.",
        },
        sql_null_case_choice: {
          id: "sql_null_case_choice",
          type: "scenario_choice",
          badge: "Stage 2 edge",
          title: "Stage 2 · CASE missing ELSE",
          prompt: "The interviewer shows a feature flag computed with CASE. What is the hidden output for users who match no WHEN branch?",
          code_snippet: `CASE
  WHEN plan = 'pro' THEN 1
  WHEN plan = 'team' THEN 1
END AS paid_flag`,
          choices: [
            { id: "a", label: "NULL", description: "Without ELSE, unmatched CASE expressions return NULL." },
            { id: "b", label: "0", description: "SQL does not infer false unless you write ELSE 0." },
            { id: "c", label: "FALSE", description: "The expression returns the type implied by branches; no boolean default is guaranteed." },
            { id: "d", label: "Empty string", description: "There is no implicit text fallback here." },
          ],
          branches: { a: "sql_null_tradeoff_choice", b: "sql_null_recovery_case", c: "sql_null_recovery_case", d: "sql_null_recovery_case" },
          rationale: "CASE without ELSE returns NULL for non-matching rows, which can silently propagate into metrics.",
        },
        sql_null_recovery_case: {
          id: "sql_null_recovery_case",
          type: "scenario_choice",
          badge: "Recovery 2",
          title: "Recovery · Make fallback explicit",
          prompt: "Which rewrite is best for a binary paid flag?",
          code_snippet: `-- Need a 1/0 paid_flag for downstream aggregation`,
          choices: [
            { id: "a", label: "Add ELSE 0", description: "Make unmatched plans explicit and aggregate-safe." },
            { id: "b", label: "Leave NULL", description: "AVG/SUM/COUNT behavior can now diverge unintentionally." },
            { id: "c", label: "Use = NULL", description: "This does not match NULL values." },
            { id: "d", label: "Cast NULL to text", description: "Changing type does not fix missing semantics." },
          ],
          branches: { a: "sql_null_tradeoff_choice", b: "sql_null_recovery_case", c: "sql_null_recovery_case", d: "sql_null_recovery_case" },
          rationale: "Revision-level SQL quality is often about making business defaults explicit.",
        },
        sql_null_tradeoff_choice: {
          id: "sql_null_tradeoff_choice",
          type: "scenario_choice",
          badge: "Stage 3 trade-off",
          title: "Stage 3 · COALESCE vs IFNULL vs CASE",
          prompt: "Which null-handling choice is easiest to defend across SQL dialects and business logic reviews?",
          code_snippet: `-- Need display_name fallback and a more complex paid/free classification`,
          choices: [
            { id: "a", label: "COALESCE for simple fallback, CASE for business rules", description: "Portable fallback plus explicit conditional logic when rules branch." },
            { id: "b", label: "IFNULL everywhere", description: "Common but less portable and only handles simple fallback." },
            { id: "c", label: "CASE for every null fallback", description: "Correct but verbose when COALESCE says exactly what you mean." },
            { id: "d", label: "Never replace NULL", description: "Sometimes preserving unknown is right, but reports often need explicit display defaults." },
          ],
          branches: { a: "sql_null_terminal", b: "sql_null_recovery_tradeoff", c: "sql_null_recovery_tradeoff", d: "sql_null_recovery_tradeoff" },
          rationale: "Use the simplest construct that preserves meaning: COALESCE for fallback, CASE for branching semantics.",
        },
        sql_null_recovery_tradeoff: {
          id: "sql_null_recovery_tradeoff",
          type: "scenario_choice",
          badge: "Recovery 3",
          title: "Recovery · Pick clarity over cleverness",
          prompt: "What principle should guide null replacement?",
          code_snippet: `-- NULL can mean unknown, not applicable, missing ingestion, or intentionally blank`,
          choices: [
            { id: "a", label: "Preserve meaning first", description: "Choose COALESCE/CASE only after naming what NULL means for the metric." },
            { id: "b", label: "Replace all NULLs with zero", description: "Zero is a value and can corrupt averages/revenue." },
            { id: "c", label: "Ignore NULL semantics", description: "That is how NOT IN and CASE bugs ship." },
            { id: "d", label: "Prefer vendor-specific syntax", description: "Portability matters in interview and platform code." },
          ],
          branches: { a: "sql_null_terminal", b: "sql_null_recovery_tradeoff", c: "sql_null_recovery_tradeoff", d: "sql_null_recovery_tradeoff" },
          rationale: "Null handling is a semantic decision before it is a syntax decision.",
        },
        sql_null_terminal: {
          id: "sql_null_terminal",
          type: "scenario_choice",
          badge: "Terminal",
          title: "Revision complete · NULL traps defused",
          prompt: "You handled NOT IN, CASE fallback, and null-replacement trade-offs.",
          code_snippet: `-- Use NOT EXISTS for nullable anti-joins.
-- Add ELSE when NULL is not an acceptable business state.
-- Use COALESCE for simple fallback; CASE for explicit branching.`,
          choices: [],
          branches: {},
          terminal: true,
          rationale: "The interview-ready answer names UNKNOWN and then chooses explicit, portable SQL that preserves business meaning.",
        },
      },
    },
    knowledgeCheck: [],
  },

  "sql-found-03": {
    durationLabel: "12 min",
    outcomes: [
      "Respect GROUP BY grain and non-aggregated column rules.",
      "Explain COUNT(*), COUNT(1), and COUNT(column) under NULLs.",
      "Choose between raw-table aggregation and pre-grouped subqueries based on cost and grain clarity.",
    ],
    learnMarkdown: `## Rapid revision: GROUP BY changes the row grain

After GROUP BY, each output row represents a bucket. Non-aggregated selected columns must be part of that bucket definition in standard SQL.

COUNT(*) and COUNT(1) count rows. COUNT(column) counts non-NULL values in that column. That single difference causes many interview mistakes.`,
    video: null,
    videoFallbackMarkdown: `## Drill

For three rows with values 10, NULL, 20, predict COUNT(*), COUNT(1), COUNT(value), SUM(value), and AVG(value).`,
    tryGuidance: "Click the non-aggregated column that violates GROUP BY, then handle COUNT null semantics and aggregation cost.",
    interviewGraph: {
      initialStageId: "sql_group_click",
      artifactDimensions: [
        { label: "GROUP BY Grain Control", recoveryStageId: "sql_group_recovery_grain" },
        { label: "COUNT Null Semantics", recoveryStageId: "sql_group_recovery_count" },
        { label: "Aggregation Cost Awareness", recoveryStageId: "sql_group_recovery_tradeoff", passLabel: "Aggregation Trade-Off Clear" },
      ],
      stages: {
        sql_group_click: {
          id: "sql_group_click",
          type: "click_target",
          badge: "Stage 1 target",
          title: "Stage 1 · Non-aggregated column leaks grain",
          prompt: "This query fails in strict SQL engines. Click the selected column that is neither grouped nor aggregated.",
          code_snippet: `SELECT
  customer_id,
  customer_name, -- ds-target:ungrouped_column
  SUM(total_amount) AS revenue
FROM orders
GROUP BY customer_id;`,
          validationCopy: {
            ungrouped_column: "Correct. Once grouped by customer_id, customer_name must either be functionally guaranteed by the engine, included in GROUP BY, or aggregated intentionally.",
          },
          branches: { ungrouped_column: "sql_group_fix_choice" },
        },
        sql_group_recovery_grain: {
          id: "sql_group_recovery_grain",
          type: "scenario_choice",
          badge: "Recovery 1",
          title: "Recovery · State the grain",
          prompt: "What should you say before fixing the query?",
          code_snippet: `-- Output grain: one row per customer_id`,
          choices: [
            { id: "a", label: "Every selected field must match the output grain", description: "Group it, aggregate it, or prove functional dependency." },
            { id: "b", label: "GROUP BY sorts rows", description: "Grouping buckets rows; sorting is ORDER BY." },
            { id: "c", label: "SUM makes all columns valid", description: "Aggregating one column does not aggregate the others." },
            { id: "d", label: "Primary keys never matter", description: "Functional dependency can matter, but do not assume it blindly." },
          ],
          branches: { a: "sql_group_fix_choice", b: "sql_group_recovery_grain", c: "sql_group_recovery_grain", d: "sql_group_recovery_grain" },
          rationale: "Interviewers listen for grain awareness before syntax patches.",
        },
        sql_group_fix_choice: {
          id: "sql_group_fix_choice",
          type: "scenario_choice",
          badge: "Stage 1 choice",
          title: "Stage 1 · Fix the grouped query",
          prompt: "Which fix is safest when customer_name comes from a customers dimension table?",
          code_snippet: `-- orders(customer_id, total_amount)
-- customers(customer_id, customer_name)`,
          choices: [
            { id: "a", label: "Join dimension then group both id and name", description: "Keep the output grain explicit and portable." },
            { id: "b", label: "Select customer_name without grouping", description: "Strict engines reject it; permissive engines may choose arbitrary values." },
            { id: "c", label: "Use MAX(customer_name) without thinking", description: "Can be okay if dependency is true, but hides data-quality issues." },
            { id: "d", label: "Drop GROUP BY", description: "That collapses the entire table to one aggregate row." },
          ],
          branches: { a: "sql_group_count_choice", b: "sql_group_recovery_grain", c: "sql_group_recovery_grain", d: "sql_group_recovery_grain" },
          rationale: "Grouping both key and descriptor is the clean revision-level answer when joining a stable dimension.",
        },
        sql_group_count_choice: {
          id: "sql_group_count_choice",
          type: "scenario_choice",
          badge: "Stage 2 edge",
          title: "Stage 2 · COUNT and NULL",
          prompt: "A group has 10 rows and only 6 non-NULL refund_amount values. What do these counts return?",
          code_snippet: `COUNT(*) AS rows_count,
COUNT(1) AS one_count,
COUNT(refund_amount) AS refund_count`,
          choices: [
            { id: "a", label: "10, 10, 6", description: "COUNT(column) ignores NULL; COUNT(*) and COUNT(1) count rows." },
            { id: "b", label: "10, 6, 6", description: "COUNT(1) does not inspect refund_amount." },
            { id: "c", label: "6, 6, 6", description: "COUNT(*) includes rows even when columns are NULL." },
            { id: "d", label: "10, 10, 10", description: "COUNT(refund_amount) skips NULL values." },
          ],
          branches: { a: "sql_group_tradeoff_choice", b: "sql_group_recovery_count", c: "sql_group_recovery_count", d: "sql_group_recovery_count" },
          rationale: "COUNT(column) is a non-null count; COUNT(*) and COUNT(1) are row counts.",
        },
        sql_group_recovery_count: {
          id: "sql_group_recovery_count",
          type: "scenario_choice",
          badge: "Recovery 2",
          title: "Recovery · Count the right thing",
          prompt: "Which expression measures whether any row exists in the group, regardless of NULL columns?",
          code_snippet: `-- Some metric columns are NULL for half the rows`,
          choices: [
            { id: "a", label: "COUNT(*)", description: "Counts rows in the group." },
            { id: "b", label: "COUNT(nullable_metric)", description: "Counts only non-NULL metric values." },
            { id: "c", label: "SUM(nullable_metric)", description: "Sums values and ignores NULL; it is not a row count." },
            { id: "d", label: "AVG(nullable_metric)", description: "Averages non-NULL values; not existence." },
          ],
          branches: { a: "sql_group_tradeoff_choice", b: "sql_group_recovery_count", c: "sql_group_recovery_count", d: "sql_group_recovery_count" },
          rationale: "Pick COUNT(*) when you mean rows; COUNT(column) when you mean populated values.",
        },
        sql_group_tradeoff_choice: {
          id: "sql_group_tradeoff_choice",
          type: "scenario_choice",
          badge: "Stage 3 trade-off",
          title: "Stage 3 · Aggregating raw facts vs pre-grouping",
          prompt: "Dashboards repeatedly compute daily revenue from a billion-row raw events table. What is the best foundational design move?",
          code_snippet: `-- Every dashboard runs:
-- SELECT event_date, SUM(revenue) FROM raw_events GROUP BY event_date`,
          choices: [
            { id: "a", label: "Pre-group to the dashboard grain", description: "Materialize or model daily revenue once, with clear freshness guarantees." },
            { id: "b", label: "Always aggregate raw events live", description: "Simple but repeatedly expensive at scale." },
            { id: "c", label: "Remove GROUP BY", description: "Incorrect output grain." },
            { id: "d", label: "Use COUNT(*) instead of SUM", description: "That changes the metric." },
          ],
          branches: { a: "sql_group_terminal", b: "sql_group_recovery_tradeoff", c: "sql_group_recovery_tradeoff", d: "sql_group_recovery_tradeoff" },
          rationale: "Pre-grouping aligns compute with repeated query grain and makes freshness/correctness explicit.",
        },
        sql_group_recovery_tradeoff: {
          id: "sql_group_recovery_tradeoff",
          type: "scenario_choice",
          badge: "Recovery 3",
          title: "Recovery · Aggregate once when grain repeats",
          prompt: "What is the trade-off of pre-grouped tables?",
          code_snippet: `-- Faster dashboard queries
-- Additional storage and freshness management`,
          choices: [
            { id: "a", label: "Trade storage/freshness complexity for lower repeated compute", description: "This is the normal analytics-engineering trade-off." },
            { id: "b", label: "No trade-off", description: "Materialized aggregates add maintenance and freshness questions." },
            { id: "c", label: "Always less correct", description: "They can be correct if modeled and tested at the right grain." },
            { id: "d", label: "Only useful for small tables", description: "They are most valuable when raw scans are expensive." },
          ],
          branches: { a: "sql_group_terminal", b: "sql_group_recovery_tradeoff", c: "sql_group_recovery_tradeoff", d: "sql_group_recovery_tradeoff" },
          rationale: "Foundational SQL design is grain plus cost: precompute repeated grains, but document freshness and lineage.",
        },
        sql_group_terminal: {
          id: "sql_group_terminal",
          type: "scenario_choice",
          badge: "Terminal",
          title: "Revision complete · Aggregation fundamentals locked",
          prompt: "You handled grouped grain, COUNT null semantics, and pre-aggregation trade-offs.",
          code_snippet: `-- GROUP BY defines output grain.
-- COUNT(*) counts rows; COUNT(column) counts non-NULL values.
-- Pre-group repeated dashboard grains when raw scans are too costly.`,
          choices: [],
          branches: {},
          terminal: true,
          rationale: "The strong candidate states grain first, picks the right count expression, and explains aggregation cost without over-engineering.",
        },
      },
    },
    knowledgeCheck: [],
  },

  "sql-found-04": {
    durationLabel: "12 min",
    outcomes: [
      "Spot row-by-row correlated subquery performance traps.",
      "Predict join fan-out when the right-hand side is one-to-many.",
      "Choose EXISTS vs INNER JOIN when verifying presence.",
    ],
    learnMarkdown: `## Rapid revision: joins change row counts

A correlated subquery in SELECT may execute conceptually once per outer row. Optimizers can sometimes decorrelate it, but you should not rely on magic when a simple grouped join expresses the intent clearly.

A LEFT JOIN does not guarantee one output row per left row. If the right table has multiple matches, it duplicates the left row.`,
    video: null,
    videoFallbackMarkdown: `## Drill

For each join, write the expected output grain before writing SELECT. Then predict whether one-to-many matches will duplicate rows.`,
    tryGuidance: "Click the correlated subquery that creates row-by-row work, then handle join fan-out and EXISTS trade-offs.",
    interviewGraph: {
      initialStageId: "sql_join_click",
      artifactDimensions: [
        { label: "Row-by-Row Subquery Detection", recoveryStageId: "sql_join_recovery_subquery" },
        { label: "Join Fan-Out Awareness", recoveryStageId: "sql_join_recovery_fanout" },
        { label: "EXISTS vs JOIN Trade-Off", recoveryStageId: "sql_join_recovery_tradeoff", passLabel: "Presence-Check Trade-Off Clear" },
      ],
      stages: {
        sql_join_click: {
          id: "sql_join_click",
          type: "click_target",
          badge: "Stage 1 target",
          title: "Stage 1 · Correlated subquery drain",
          prompt: "This query works on 1,000 users but drags on 10M. Click the row-by-row subquery pattern.",
          code_snippet: `SELECT
  u.user_id,
  (SELECT COUNT(*) FROM orders o WHERE o.user_id = u.user_id) AS order_count -- ds-target:correlated_select_subquery
FROM users u;`,
          validationCopy: {
            correlated_select_subquery: "Correct. The subquery is correlated to each user row; many engines can optimize some cases, but the written shape invites row-by-row work.",
          },
          branches: { correlated_select_subquery: "sql_join_fix_choice" },
        },
        sql_join_recovery_subquery: {
          id: "sql_join_recovery_subquery",
          type: "scenario_choice",
          badge: "Recovery 1",
          title: "Recovery · Look for outer references",
          prompt: "What makes a subquery correlated?",
          code_snippet: `WHERE o.user_id = u.user_id`,
          choices: [
            { id: "a", label: "It references the outer query", description: "u.user_id comes from the outer users row." },
            { id: "b", label: "It contains COUNT(*)", description: "Aggregates are not inherently correlated." },
            { id: "c", label: "It is inside SELECT", description: "Location matters for shape, but the outer reference is the defining feature." },
            { id: "d", label: "It uses an alias", description: "Aliases are normal; correlation is cross-scope reference." },
          ],
          branches: { a: "sql_join_fix_choice", b: "sql_join_recovery_subquery", c: "sql_join_recovery_subquery", d: "sql_join_recovery_subquery" },
          rationale: "The mental grep is simple: does the inner query depend on the current outer row?",
        },
        sql_join_fix_choice: {
          id: "sql_join_fix_choice",
          type: "scenario_choice",
          badge: "Stage 1 choice",
          title: "Stage 1 · Rewrite to set-based aggregation",
          prompt: "Which rewrite expresses the count at set level?",
          code_snippet: `-- Need order_count per user`,
          choices: [
            { id: "a", label: "Pre-aggregate orders then LEFT JOIN", description: "One row per user_id in the aggregate, then join to users." },
            { id: "b", label: "Run the subquery twice", description: "More repeated work." },
            { id: "c", label: "Use CROSS JOIN", description: "Likely creates a cartesian explosion." },
            { id: "d", label: "Remove COUNT", description: "Does not answer the metric." },
          ],
          branches: { a: "sql_join_fanout_choice", b: "sql_join_recovery_subquery", c: "sql_join_recovery_subquery", d: "sql_join_recovery_subquery" },
          rationale: "A grouped subquery/CTE gives the join a stable one-row-per-user grain.",
        },
        sql_join_fanout_choice: {
          id: "sql_join_fanout_choice",
          type: "scenario_choice",
          badge: "Stage 2 edge",
          title: "Stage 2 · LEFT JOIN duplicates rows",
          prompt: "You LEFT JOIN users to user_devices, but some users have 3 devices. What happens to one user row?",
          code_snippet: `SELECT u.user_id, d.device_id
FROM users u
LEFT JOIN user_devices d ON d.user_id = u.user_id;`,
          choices: [
            { id: "a", label: "It can become 3 rows", description: "LEFT JOIN preserves unmatched users, but matched one-to-many rows still fan out." },
            { id: "b", label: "It always stays 1 row", description: "Only true if the right side is one-to-one at the join key." },
            { id: "c", label: "It drops users with no devices", description: "That would be INNER JOIN behavior." },
            { id: "d", label: "It errors automatically", description: "SQL usually permits fan-out unless constraints or query logic prevent it." },
          ],
          branches: { a: "sql_join_tradeoff_choice", b: "sql_join_recovery_fanout", c: "sql_join_recovery_fanout", d: "sql_join_recovery_fanout" },
          rationale: "LEFT JOIN controls unmatched-left preservation, not right-side cardinality.",
        },
        sql_join_recovery_fanout: {
          id: "sql_join_recovery_fanout",
          type: "scenario_choice",
          badge: "Recovery 2",
          title: "Recovery · State both table grains",
          prompt: "How do you prevent accidental metric inflation from a one-to-many right table?",
          code_snippet: `-- users grain: one row per user
-- user_devices grain: one row per user-device`,
          choices: [
            { id: "a", label: "Pre-aggregate or dedupe the right side", description: "Make the right side one row per join key before joining if that is the desired grain." },
            { id: "b", label: "Use SELECT DISTINCT blindly", description: "Can hide bugs and drop legitimate duplicates." },
            { id: "c", label: "Switch to RIGHT JOIN", description: "Changes preservation side, not fan-out." },
            { id: "d", label: "Ignore row counts", description: "Fan-out is exactly how metrics inflate." },
          ],
          branches: { a: "sql_join_tradeoff_choice", b: "sql_join_recovery_fanout", c: "sql_join_recovery_fanout", d: "sql_join_recovery_fanout" },
          rationale: "Write table grains before the join; then align the right side to the intended output grain.",
        },
        sql_join_tradeoff_choice: {
          id: "sql_join_tradeoff_choice",
          type: "scenario_choice",
          badge: "Stage 3 trade-off",
          title: "Stage 3 · EXISTS vs INNER JOIN",
          prompt: "You only need users who have at least one completed order. You do not need order columns. Which pattern is usually clearest?",
          code_snippet: `-- Presence verification only`,
          choices: [
            { id: "a", label: "EXISTS semi-join", description: "Expresses presence without duplicating users when multiple orders match." },
            { id: "b", label: "INNER JOIN raw orders", description: "Can duplicate users unless deduped or grouped." },
            { id: "c", label: "LEFT JOIN then no filter", description: "Keeps users without orders too." },
            { id: "d", label: "Correlated SELECT count", description: "Computes more than needed for a yes/no presence check." },
          ],
          branches: { a: "sql_join_terminal", b: "sql_join_recovery_tradeoff", c: "sql_join_recovery_tradeoff", d: "sql_join_recovery_tradeoff" },
          rationale: "EXISTS communicates semi-join intent and avoids accidental fan-out in the result.",
        },
        sql_join_recovery_tradeoff: {
          id: "sql_join_recovery_tradeoff",
          type: "scenario_choice",
          badge: "Recovery 3",
          title: "Recovery · Presence is not projection",
          prompt: "When is INNER JOIN still appropriate?",
          code_snippet: `-- Need columns from both users and orders`,
          choices: [
            { id: "a", label: "When you need matched right-side data", description: "JOIN is right for projection; EXISTS is clean for presence." },
            { id: "b", label: "Never", description: "INNER JOIN is fundamental when you need matched rows/columns." },
            { id: "c", label: "Only if tables are tiny", description: "Correctness and grain matter independent of size." },
            { id: "d", label: "When you want no duplicates", description: "JOIN can duplicate under one-to-many unless controlled." },
          ],
          branches: { a: "sql_join_terminal", b: "sql_join_recovery_tradeoff", c: "sql_join_recovery_tradeoff", d: "sql_join_recovery_tradeoff" },
          rationale: "The trade-off is semantic: EXISTS for yes/no filtering, JOIN when you need columns or matched row combinations.",
        },
        sql_join_terminal: {
          id: "sql_join_terminal",
          type: "scenario_choice",
          badge: "Terminal",
          title: "Revision complete · Join fundamentals locked",
          prompt: "You handled correlated work, join fan-out, and EXISTS vs JOIN semantics.",
          code_snippet: `-- Watch for outer references in subqueries.
-- LEFT JOIN can still multiply rows.
-- EXISTS is usually cleanest for presence checks.`,
          choices: [],
          branches: {},
          terminal: true,
          rationale: "The candidate-ready answer states table grain, predicts fan-out, and chooses EXISTS when only presence matters.",
        },
      },
    },
    knowledgeCheck: [],
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

  "sq-a1": {
    durationLabel: "14 min",
    outcomes: [
      "Explain exactly how ties are handled by ROW_NUMBER, RANK, and DENSE_RANK without confusing them under pressure.",
      "Spot when a PARTITION BY is missing or wrong and predict the resulting rank bleed across groups.",
      "Choose the correct ranking function based on whether gaps or non-determinism matter for the use case.",
    ],
    learnMarkdown: `## Ranking functions: the same, until ties appear

ROW_NUMBER(), RANK(), and DENSE_RANK() all assign an integer to each row based on ORDER BY. With no ties, all three produce identical output. The difference only surfaces when two or more rows share the same ORDER BY value.

- **ROW_NUMBER()** — always unique. Ties broken arbitrarily by the engine. Never two rows with the same number.
- **RANK()** — tied rows share the same rank. The next rank *skips* positions equal to the number of tied rows. Result: gaps (1, 2, 2, 4 — rank 3 vanishes).
- **DENSE_RANK()** — tied rows share the same rank. Next rank is always rank + 1. No gaps ever (1, 2, 2, 3).

## PARTITION BY is not optional for grouped ranking

Without PARTITION BY the function ranks across the entire result set. Add \`PARTITION BY region\` and ranks reset to 1 at every region boundary. Forgetting this is the #1 source of wrong ranking answers in interviews.

## Interview mental model

Ask: "Do I need unique row IDs (ROW_NUMBER), honest gap-showing rank (RANK), or consecutive tier labels (DENSE_RANK)?" Then ask: "Does rank need to reset per group?" If yes, add PARTITION BY.`,
    video: null,
    videoFallbackMarkdown: `## 3-minute ranking drill

Write the output sequence for 5 rows where rows 2 and 3 tie, using each function. Expected:
- ROW_NUMBER: 1 2 3 4 5 (order of ties arbitrary)
- RANK: 1 2 2 4 5
- DENSE_RANK: 1 2 2 3 4

Then add a PARTITION BY and trace how the sequence resets.`,
    tryGuidance: "Open the Window Functions viz, toggle between functions with ties visible, and observe which ranks skip and which stay dense.",
    interviewGraph: {
      initialStageId: "wf_rank_click",
      artifactDimensions: [
        { label: "Tie Semantics Recall",      recoveryStageId: "wf_rank_recovery_ties" },
        { label: "PARTITION BY Scope",         recoveryStageId: "wf_rank_recovery_partition" },
        { label: "Function Selection Instinct", recoveryStageId: "wf_rank_recovery_choice", passLabel: "Ranking Function Mastery" },
      ],
      stages: {
        wf_rank_click: {
          id: "wf_rank_click",
          type: "click_target",
          badge: "Stage 1 target",
          title: "Stage 1 · Wrong ranking function loses tie semantics",
          prompt: "The analyst wants the top 3 distinct salary tiers per department. Click the line that uses the wrong function and will silently produce incorrect tier labels when ties exist.",
          code_snippet: `SELECT
  employee_id,
  department,
  salary,
  RANK() OVER (         -- ds-target:wrong_rank_fn
    PARTITION BY department
    ORDER BY salary DESC
  ) AS tier
FROM employees
WHERE tier <= 3;`,
          validationCopy: {
            wrong_rank_fn: "Correct. RANK() creates gaps: two employees tied for tier 2 produce ranks 2, 2, 4. Tier 3 never appears, so WHERE tier <= 3 misses the real third tier. DENSE_RANK() is needed for consecutive tier labels.",
          },
          branches: {
            wrong_rank_fn: "wf_rank_fix_choice",
          },
        },
        wf_rank_recovery_ties: {
          id: "wf_rank_recovery_ties",
          type: "scenario_choice",
          badge: "Recovery 1",
          title: "Recovery · Tie handling rules",
          prompt: "The interviewer asks you to state the tie rule for each function. Which answer is complete and correct?",
          code_snippet: `-- 5 rows: salaries [9000, 8000, 8000, 7000, 6000]`,
          choices: [
            { id: "a", label: "ROW_NUMBER unique; RANK gaps; DENSE_RANK no gaps", description: "All three rules stated precisely." },
            { id: "b", label: "RANK and DENSE_RANK are identical", description: "RANK creates gaps; DENSE_RANK never does — they are not identical on ties." },
            { id: "c", label: "ROW_NUMBER ties resolved alphabetically by name", description: "ROW_NUMBER tie-breaking order is undefined unless you add a tiebreaker column to ORDER BY." },
            { id: "d", label: "DENSE_RANK skips numbers like RANK", description: "DENSE_RANK is specifically designed to avoid skipping numbers." },
          ],
          branches: {
            a: "wf_rank_fix_choice",
            b: "wf_rank_recovery_ties",
            c: "wf_rank_recovery_ties",
            d: "wf_rank_recovery_ties",
          },
          rationale: "The canonical three-sentence answer: ROW_NUMBER always unique; RANK shares rank and skips; DENSE_RANK shares rank and never skips.",
        },
        wf_rank_fix_choice: {
          id: "wf_rank_fix_choice",
          type: "scenario_choice",
          badge: "Stage 1 fix",
          title: "Stage 1 · Apply the correct function",
          prompt: "Which replacement produces consecutive tier labels 1-3 even when ties exist, and correctly surfaces all employees in the top 3 tiers?",
          code_snippet: `-- Requirement: top 3 DISTINCT salary tiers per department`,
          choices: [
            { id: "a", label: "Replace RANK() with DENSE_RANK()", description: "DENSE_RANK produces 1, 2, 2, 3 — no gaps, all tiers present." },
            { id: "b", label: "Replace RANK() with ROW_NUMBER()", description: "ROW_NUMBER is unique — two employees with the same salary get different tiers, breaking the tier semantics." },
            { id: "c", label: "Add ORDER BY salary ASC inside OVER()", description: "Reversing order changes which tier is #1, it does not fix the gap problem." },
            { id: "d", label: "Remove PARTITION BY so ranks are global", description: "Removing PARTITION BY ranks everyone together, breaking department-level tier logic." },
          ],
          branches: {
            a: "wf_partition_choice",
            b: "wf_rank_recovery_ties",
            c: "wf_rank_recovery_ties",
            d: "wf_rank_recovery_ties",
          },
          rationale: "DENSE_RANK is the correct fix: it handles ties gracefully by sharing ranks without introducing gaps in the tier sequence.",
        },
        wf_partition_choice: {
          id: "wf_partition_choice",
          type: "scenario_choice",
          badge: "Stage 2 partition",
          title: "Stage 2 · PARTITION BY scope bleed",
          prompt: "The analyst forgets PARTITION BY. What does the ranking column now contain?",
          code_snippet: `SELECT employee_id, department, salary,
  DENSE_RANK() OVER (ORDER BY salary DESC) AS tier
FROM employees;
-- departments: Engineering (5 rows), Marketing (3 rows)`,
          choices: [
            { id: "a", label: "Ranks reset to 1 per department bucket", description: "Without PARTITION BY there are no buckets — ranking spans all rows globally." },
            { id: "b", label: "Ranks run globally across all departments — Engineering and Marketing share the same sequence", description: "The rank reflects salary order over the entire table, ignoring departments." },
            { id: "c", label: "Each row gets rank = 1 because there is no group context", description: "The function still ranks all rows; it just treats the whole table as one partition." },
            { id: "d", label: "The query errors because PARTITION BY is required with DENSE_RANK", description: "PARTITION BY is optional — omitting it uses the whole result set as one implicit partition." },
          ],
          branches: {
            a: "wf_rank_recovery_partition",
            b: "wf_rank_fn_choice",
            c: "wf_rank_recovery_partition",
            d: "wf_rank_recovery_partition",
          },
          rationale: "Without PARTITION BY the window spans the entire result set. Ranks bleed across departments and do not reset.",
        },
        wf_rank_recovery_partition: {
          id: "wf_rank_recovery_partition",
          type: "scenario_choice",
          badge: "Recovery 2",
          title: "Recovery · PARTITION BY mental model",
          prompt: "Restore the correct mental model for PARTITION BY.",
          code_snippet: `-- PARTITION BY divides rows into independent windows.
-- The function restarts for each partition.`,
          choices: [
            { id: "a", label: "PARTITION BY resets the ranking counter at each group boundary", description: "Exactly — each partition is ranked independently from 1." },
            { id: "b", label: "PARTITION BY is equivalent to GROUP BY", description: "GROUP BY collapses rows into one; PARTITION BY keeps all rows but scopes the function." },
            { id: "c", label: "PARTITION BY filters rows like WHERE", description: "PARTITION BY divides rows into windows; it does not remove rows from the result." },
            { id: "d", label: "Without PARTITION BY the function returns NULL", description: "Without PARTITION BY the whole table is treated as one partition — the function still runs." },
          ],
          branches: {
            a: "wf_rank_fn_choice",
            b: "wf_rank_recovery_partition",
            c: "wf_rank_recovery_partition",
            d: "wf_rank_recovery_partition",
          },
          rationale: "PARTITION BY is the scoping operator for window functions. It does not remove rows; it restarts the window logic per group.",
        },
        wf_rank_fn_choice: {
          id: "wf_rank_fn_choice",
          type: "scenario_choice",
          badge: "Stage 3 choice",
          title: "Stage 3 · Choose the function for the use case",
          prompt: "You need a deterministic unique row number for pagination (OFFSET/FETCH) where ties must not land on the same page twice. Which function is safest?",
          code_snippet: `-- Table: 10M product reviews, sorted by rating DESC
-- Need: stable page-by-page navigation, no duplicate row IDs`,
          choices: [
            { id: "a", label: "ROW_NUMBER() with a tiebreaker in ORDER BY", description: "Add review_id as a tiebreaker to make ROW_NUMBER deterministic and unique." },
            { id: "b", label: "DENSE_RANK() alone", description: "DENSE_RANK ties share the same number — two rows with the same rank can land on two different pages inconsistently." },
            { id: "c", label: "RANK() alone", description: "RANK gaps can create empty pages and the shared rank on ties breaks deterministic pagination." },
            { id: "d", label: "No window function needed — use OFFSET/LIMIT directly", description: "Without a stable sort key, OFFSET/LIMIT pagination is non-deterministic on ties." },
          ],
          branches: {
            a: "wf_rank_terminal",
            b: "wf_rank_recovery_choice",
            c: "wf_rank_recovery_choice",
            d: "wf_rank_recovery_choice",
          },
          rationale: "ROW_NUMBER with a stable tiebreaker (e.g., primary key) guarantees each row gets a unique sequential integer — essential for offset-based pagination.",
        },
        wf_rank_recovery_choice: {
          id: "wf_rank_recovery_choice",
          type: "scenario_choice",
          badge: "Recovery 3",
          title: "Recovery · Pagination stability requirement",
          prompt: "Why is ROW_NUMBER with a tiebreaker the canonical pagination solution?",
          code_snippet: `-- Safe pattern:
-- ROW_NUMBER() OVER (ORDER BY rating DESC, review_id ASC)`,
          choices: [
            { id: "a", label: "It guarantees every row has a unique sequential integer, making OFFSET math exact", description: "The tiebreaker eliminates non-determinism — every page boundary is stable." },
            { id: "b", label: "It is the only window function that works in WHERE", description: "Window functions are not usable directly in WHERE; wrap in a subquery or CTE regardless of which function you choose." },
            { id: "c", label: "Tiebreakers slow down the query so they should be avoided", description: "A tiebreaker column typically uses an already-indexed primary key — the overhead is minimal." },
            { id: "d", label: "DENSE_RANK works equally well for pagination", description: "DENSE_RANK assigns the same number to tied rows — two rows on page boundary can swap between pages." },
          ],
          branches: {
            a: "wf_rank_terminal",
            b: "wf_rank_recovery_choice",
            c: "wf_rank_recovery_choice",
            d: "wf_rank_recovery_choice",
          },
          rationale: "Pagination requires a strictly unique, deterministic row number. ROW_NUMBER + tiebreaker is the industry-standard pattern.",
        },
        wf_rank_terminal: {
          id: "wf_rank_terminal",
          type: "scenario_choice",
          badge: "Terminal",
          title: "Revision complete · Ranking functions locked",
          prompt: "You navigated tie semantics, PARTITION BY scoping, and function selection for pagination.",
          code_snippet: `-- ROW_NUMBER: unique, use tiebreaker for stability
-- RANK:       gaps on ties (1, 2, 2, 4)
-- DENSE_RANK: no gaps on ties (1, 2, 2, 3)
-- PARTITION BY resets the window per group`,
          choices: [],
          branches: {},
          terminal: true,
          rationale: "The candidate-ready answer covers all three: ROW_NUMBER for unique IDs, RANK for honest competition gaps, DENSE_RANK for consecutive tier labels. Always ask about PARTITION BY scope.",
        },
      },
    },
    knowledgeCheck: [],
  },

  "sq-a2": {
    durationLabel: "13 min",
    outcomes: [
      "Identify when an ORDER BY clause is missing from a window function and explain why that causes an error or undefined results.",
      "Distinguish between a running total (UNBOUNDED PRECEDING) and a moving average (N PRECEDING) window frame.",
      "Write correct ROWS BETWEEN syntax for both patterns without looking it up.",
    ],
    learnMarkdown: `## ORDER BY inside OVER() is not optional for navigational functions

LAG(), LEAD(), and any function using a ROWS BETWEEN frame require an \`ORDER BY\` clause *inside* the \`OVER()\` clause. Omitting it produces either a compile error (most engines) or non-deterministic results. This is the single most common window-function bug in interviews.

\`\`\`sql
-- Wrong: no ORDER BY
LAG(revenue) OVER (PARTITION BY region)

-- Correct
LAG(revenue, 1) OVER (PARTITION BY region ORDER BY sale_date)
\`\`\`

## Running total vs moving average — the frame is everything

| Pattern | Frame clause | Effect |
|---------|-------------|--------|
| Running SUM | \`ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW\` | Grows from first row to current |
| 7-day moving AVG | \`ROWS BETWEEN 6 PRECEDING AND CURRENT ROW\` | Fixed 7-row window |

## Interview trap: early rows in a moving average

When fewer than N rows precede the current row, the engine uses whatever rows exist. Row 1 averages over only itself. Explicitly handle or document this boundary behavior in your answer.`,
    video: null,
    videoFallbackMarkdown: `## Quick frame drill

Without looking: write the OVER() clause for a running total and for a 30-day moving average. Say aloud why ORDER BY cannot be omitted and what UNBOUNDED PRECEDING means versus 29 PRECEDING.`,
    tryGuidance: "Open the LAG/LEAD viz, switch between running SUM and moving AVG, and trace how NULL appears at window boundaries.",
    interviewGraph: {
      initialStageId: "lag_orderby_click",
      artifactDimensions: [
        { label: "ORDER BY Requirement",    recoveryStageId: "lag_orderby_recovery" },
        { label: "Frame Syntax Recall",      recoveryStageId: "lag_frame_recovery" },
        { label: "Running vs Moving Choice", recoveryStageId: "lag_calc_recovery", passLabel: "Window Frame Mastery" },
      ],
      stages: {
        lag_orderby_click: {
          id: "lag_orderby_click",
          type: "click_target",
          badge: "Stage 1 target",
          title: "Stage 1 · Missing ORDER BY in window frame",
          prompt: "This query is supposed to compute the previous day's revenue using LAG. Click the line that contains the critical omission causing undefined or erroneous behavior.",
          code_snippet: `SELECT
  sale_date,
  revenue,
  LAG(revenue, 1) OVER (  -- ds-target:missing_order_by
    PARTITION BY region
  ) AS prev_day_rev
FROM daily_sales;`,
          validationCopy: {
            missing_order_by: "Correct. LAG() needs ORDER BY inside OVER() to know which row is 'previous'. Without it the engine cannot define row order within the partition — result is non-deterministic or an error.",
          },
          branches: {
            missing_order_by: "lag_orderby_fix_choice",
          },
        },
        lag_orderby_recovery: {
          id: "lag_orderby_recovery",
          type: "scenario_choice",
          badge: "Recovery 1",
          title: "Recovery · Why ORDER BY is mandatory here",
          prompt: "The interviewer asks you to explain why ORDER BY inside OVER() is required for LAG(). Which answer is strongest?",
          code_snippet: `-- OVER() defines the window; ORDER BY inside it
-- determines row sequence within that window.`,
          choices: [
            { id: "a", label: "LAG needs row order to know which row is 'previous' within the partition", description: "Without ORDER BY the concept of 'previous row' is undefined." },
            { id: "b", label: "ORDER BY is needed to sort the final output", description: "ORDER BY inside OVER() scopes to the window frame, not the result-set sort order." },
            { id: "c", label: "PARTITION BY already provides the ordering", description: "PARTITION BY divides rows into groups; it does not order rows within those groups." },
            { id: "d", label: "LAG is only valid without PARTITION BY, not with it", description: "LAG works both with and without PARTITION BY; ORDER BY is always required." },
          ],
          branches: {
            a: "lag_orderby_fix_choice",
            b: "lag_orderby_recovery",
            c: "lag_orderby_recovery",
            d: "lag_orderby_recovery",
          },
          rationale: "LAG/LEAD are positional functions — they traverse rows by position in the ORDER BY sequence. Without ORDER BY the position is undefined.",
        },
        lag_orderby_fix_choice: {
          id: "lag_orderby_fix_choice",
          type: "scenario_choice",
          badge: "Stage 1 fix",
          title: "Stage 1 · Write the correct OVER clause",
          prompt: "Which OVER clause correctly computes the previous day's revenue per region?",
          code_snippet: `LAG(revenue, 1) OVER ( ??? ) AS prev_day_rev`,
          choices: [
            { id: "a", label: "OVER (PARTITION BY region ORDER BY sale_date)", description: "Resets the window per region and orders by date — previous row is the previous date in that region." },
            { id: "b", label: "OVER (ORDER BY region, sale_date)", description: "ORDER BY region inside OVER does not partition — it treats the whole table as one window sorted by region then date." },
            { id: "c", label: "OVER (PARTITION BY sale_date ORDER BY revenue)", description: "Partitioning by date groups rows on the same date — LAG would look at a different row on the same date, not the previous date." },
            { id: "d", label: "OVER ()", description: "Empty OVER() has no ORDER BY — LAG remains undefined." },
          ],
          branches: {
            a: "lag_frame_choice",
            b: "lag_orderby_recovery",
            c: "lag_orderby_recovery",
            d: "lag_orderby_recovery",
          },
          rationale: "PARTITION BY region scopes the window; ORDER BY sale_date defines row sequence. Together they make 'previous day within region' unambiguous.",
        },
        lag_frame_choice: {
          id: "lag_frame_choice",
          type: "scenario_choice",
          badge: "Stage 2 frame",
          title: "Stage 2 · Running total vs moving average frame",
          prompt: "The analyst now wants a 7-day moving average of revenue (not a running total). Which ROWS BETWEEN clause is correct?",
          code_snippet: `AVG(revenue) OVER (
  ORDER BY sale_date
  ROWS BETWEEN ??? AND CURRENT ROW
) AS revenue_7d_avg`,
          choices: [
            { id: "a", label: "ROWS BETWEEN 6 PRECEDING AND CURRENT ROW", description: "Current row + 6 rows before = exactly 7 rows (when history exists)." },
            { id: "b", label: "ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW", description: "This is a running average, not a fixed-window moving average — the denominator grows every row." },
            { id: "c", label: "ROWS BETWEEN 7 PRECEDING AND CURRENT ROW", description: "7 PRECEDING + CURRENT ROW = 8 rows total, not 7." },
            { id: "d", label: "ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING", description: "This is a centered 3-row window — not a trailing 7-day window." },
          ],
          branches: {
            a: "lag_calc_choice",
            b: "lag_frame_recovery",
            c: "lag_frame_recovery",
            d: "lag_frame_recovery",
          },
          rationale: "A trailing N-day window uses N-1 PRECEDING AND CURRENT ROW. For 7 days: 6 PRECEDING AND CURRENT ROW.",
        },
        lag_frame_recovery: {
          id: "lag_frame_recovery",
          type: "scenario_choice",
          badge: "Recovery 2",
          title: "Recovery · Frame arithmetic",
          prompt: "Fix the frame arithmetic. If you want exactly 30 rows ending at the current row, which clause do you write?",
          code_snippet: `-- Window of 30 rows: current + 29 before it`,
          choices: [
            { id: "a", label: "ROWS BETWEEN 29 PRECEDING AND CURRENT ROW", description: "29 preceding rows + current row = 30 rows total." },
            { id: "b", label: "ROWS BETWEEN 30 PRECEDING AND CURRENT ROW", description: "30 preceding + current = 31 rows total — one too many." },
            { id: "c", label: "ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW", description: "Unbounded is a running total — the window grows indefinitely." },
            { id: "d", label: "ROWS BETWEEN CURRENT ROW AND 29 FOLLOWING", description: "FOLLOWING looks forward, not backward — this would be a leading window, not a trailing one." },
          ],
          branches: {
            a: "lag_calc_choice",
            b: "lag_frame_recovery",
            c: "lag_frame_recovery",
            d: "lag_frame_recovery",
          },
          rationale: "N-day trailing window = N-1 PRECEDING AND CURRENT ROW. Always subtract 1 because CURRENT ROW counts as one of the N rows.",
        },
        lag_calc_choice: {
          id: "lag_calc_choice",
          type: "scenario_choice",
          badge: "Stage 3 trade-off",
          title: "Stage 3 · Running total vs moving average — when to use each",
          prompt: "A finance dashboard needs both the all-time cumulative revenue and the 30-day smoothed trend line. Which column definitions are correct?",
          code_snippet: `SELECT
  sale_date,
  revenue,
  ??? AS cumulative_rev,
  ??? AS trend_30d
FROM daily_sales;`,
          choices: [
            { id: "a", label: "SUM UNBOUNDED PRECEDING for cumulative; AVG 29 PRECEDING for trend", description: "Running total grows from the beginning; moving average captures a fixed recent window." },
            { id: "b", label: "Both use UNBOUNDED PRECEDING", description: "UNBOUNDED PRECEDING for AVG produces a running average, not a fixed 30-day window." },
            { id: "c", label: "Both use 29 PRECEDING", description: "SUM with 29 PRECEDING gives a 30-day rolling sum, not an all-time cumulative total." },
            { id: "d", label: "Use LAG(revenue, 30) for the trend line", description: "LAG(30) returns the revenue exactly 30 rows back — it is not an average or a trend." },
          ],
          branches: {
            a: "lag_terminal",
            b: "lag_calc_recovery",
            c: "lag_calc_recovery",
            d: "lag_calc_recovery",
          },
          rationale: "Cumulative and moving calculations use different frames. UNBOUNDED PRECEDING is for running totals; N PRECEDING is for fixed rolling windows.",
        },
        lag_calc_recovery: {
          id: "lag_calc_recovery",
          type: "scenario_choice",
          badge: "Recovery 3",
          title: "Recovery · Match pattern to frame",
          prompt: "Match the business requirement to the correct ROWS BETWEEN frame.",
          code_snippet: `-- A: All-time revenue since first row
-- B: Average of last 7 rows only`,
          choices: [
            { id: "a", label: "A → UNBOUNDED PRECEDING AND CURRENT ROW; B → 6 PRECEDING AND CURRENT ROW", description: "Running total uses unbounded start; 7-row moving average uses 6 preceding." },
            { id: "b", label: "A → 6 PRECEDING AND CURRENT ROW; B → UNBOUNDED PRECEDING", description: "These are swapped — unbounded is for cumulative, not fixed window." },
            { id: "c", label: "Both → CURRENT ROW AND UNBOUNDED FOLLOWING", description: "FOLLOWING looks forward — this would be a future-looking window, not historical." },
            { id: "d", label: "A → UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING; B → 6 PRECEDING AND 6 FOLLOWING", description: "UNBOUNDED FOLLOWING includes future rows — inappropriate for a cumulative running total on streaming or date-ordered data." },
          ],
          branches: {
            a: "lag_terminal",
            b: "lag_calc_recovery",
            c: "lag_calc_recovery",
            d: "lag_calc_recovery",
          },
          rationale: "The two canonical frames: UNBOUNDED PRECEDING for running totals; N-1 PRECEDING for N-row trailing windows.",
        },
        lag_terminal: {
          id: "lag_terminal",
          type: "scenario_choice",
          badge: "Terminal",
          title: "Revision complete · LAG/LEAD and window frames locked",
          prompt: "You correctly identified the missing ORDER BY, fixed the frame arithmetic, and distinguished running totals from moving averages.",
          code_snippet: `-- LAG/LEAD: ORDER BY required inside OVER()
-- Running total: SUM() OVER (ORDER BY d ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)
-- Moving avg:   AVG() OVER (ORDER BY d ROWS BETWEEN N-1 PRECEDING AND CURRENT ROW)`,
          choices: [],
          branches: {},
          terminal: true,
          rationale: "Candidate-ready answers: ORDER BY inside OVER() is mandatory for positional functions; UNBOUNDED PRECEDING = cumulative; N-1 PRECEDING = fixed rolling window. Early rows in a rolling window use a shorter effective window.",
        },
      },
    },
    knowledgeCheck: [],
  },

  "sq-a3": {
    durationLabel: "15 min",
    outcomes: [
      "Explain the difference between a CTE that is inlined by the optimizer versus one that is explicitly materialized, and why this matters for performance.",
      "Identify the base case and recursive step in a recursive CTE and predict the termination condition.",
      "Rewrite an over-eager early-filter CTE pattern and a broken recursive base case without help.",
    ],
    learnMarkdown: `## CTEs: readability tool or performance trap?

A WITH clause CTE is primarily a readability and scoping tool. Most engines (PostgreSQL, BigQuery, Snowflake) inline CTEs by default — the optimizer expands them into the main query, and they are NOT guaranteed to be executed only once or stored as a temp table.

**Interview trap:** "Can I use a CTE to cache an expensive subquery?" — Only if the engine materializes it. PostgreSQL 12+ materializes CTEs with \`WITH ... AS MATERIALIZED (...)\`. Other engines vary. Don't assume.

## Recursive CTEs — three-part structure

\`\`\`sql
WITH RECURSIVE cte AS (
  -- 1. Base case (anchor): non-recursive start
  SELECT id, name, 0 AS depth FROM employees WHERE manager_id IS NULL
  UNION ALL
  -- 2. Recursive step: references the CTE
  SELECT e.id, e.name, c.depth + 1
  FROM employees e JOIN cte c ON e.manager_id = c.id
)
SELECT * FROM cte;
\`\`\`

Common bugs: forgetting \`RECURSIVE\` keyword, missing base case, or a recursive step that never returns zero rows (infinite loop).

## Mental model

A recursive CTE is like a loop: anchor runs once, recursive step runs until empty. If the recursive step can always find new rows, the engine hits a depth limit and errors.`,
    video: null,
    videoFallbackMarkdown: `## Quick CTE drill

Write a 2-step CTE chain from memory: one CTE that filters orders, a second that aggregates them. Then write the 3-line structure of a recursive CTE (base case, UNION ALL, recursive step). Say aloud what causes infinite recursion.`,
    tryGuidance: "Open the CTE Explorer viz, click each step to trace the transformation chain, then switch to the Recursive CTE tab to trace the org tree.",
    interviewGraph: {
      initialStageId: "cte_materialize_choice",
      artifactDimensions: [
        { label: "CTE Materialization Semantics", recoveryStageId: "cte_materialize_recovery" },
        { label: "Recursive Base Case Correctness", recoveryStageId: "cte_recursive_recovery" },
        { label: "Termination Condition Reasoning",  recoveryStageId: "cte_terminate_recovery", passLabel: "CTE & Recursive Query Mastery" },
      ],
      stages: {
        cte_materialize_choice: {
          id: "cte_materialize_choice",
          type: "scenario_choice",
          badge: "Stage 1 choice",
          title: "Stage 1 · CTE over-eager materialization",
          prompt: "A teammate wraps an expensive 500M-row aggregation in a CTE, expecting it to execute only once and be reused. Which statement is most accurate?",
          code_snippet: `WITH expensive_agg AS (
  SELECT customer_id, SUM(amount) AS ltv
  FROM orders                        -- 500M rows
  GROUP BY customer_id
)
SELECT * FROM expensive_agg WHERE ltv > 1000
UNION ALL
SELECT * FROM expensive_agg WHERE ltv <= 1000;`,
          choices: [
            { id: "a", label: "CTEs are guaranteed to execute once and cache the result", description: "This is a common myth. Most engines inline CTEs — expensive_agg may run twice, once per reference." },
            { id: "b", label: "By default most engines inline CTEs; the aggregation may run twice", description: "Without explicit MATERIALIZED keyword (Postgres 12+), the optimizer may inline and re-execute the CTE." },
            { id: "c", label: "UNION ALL prevents the optimizer from inlining CTEs", description: "UNION ALL is a set operation on the outer query; it does not affect CTE materialization behavior." },
            { id: "d", label: "Referencing a CTE twice always forces materialization in all engines", description: "Only some engines (e.g., SQL Server in certain versions) materialize on multiple references; behavior varies." },
          ],
          branches: {
            a: "cte_materialize_recovery",
            b: "cte_early_filter_choice",
            c: "cte_materialize_recovery",
            d: "cte_materialize_recovery",
          },
          rationale: "CTEs are NOT a caching mechanism by default. The safe approach is to use a temp table or MATERIALIZED hint when caching is needed.",
        },
        cte_materialize_recovery: {
          id: "cte_materialize_recovery",
          type: "scenario_choice",
          badge: "Recovery 1",
          title: "Recovery · CTE inlining vs materialization",
          prompt: "How do you guarantee that an expensive CTE runs only once in PostgreSQL 12+?",
          code_snippet: `-- Default: optimizer may inline and re-run
WITH cte AS (SELECT ...)

-- Force materialization:
WITH cte AS MATERIALIZED (SELECT ...)`,
          choices: [
            { id: "a", label: "Use WITH cte AS MATERIALIZED (...) to force a single execution", description: "MATERIALIZED keyword tells the planner to store the result rather than inline." },
            { id: "b", label: "Reference the CTE only once", description: "Single reference is a hint that may help, but the optimizer can still inline. MATERIALIZED is the explicit guarantee." },
            { id: "c", label: "Wrap the CTE in a second CTE", description: "Nesting CTEs does not prevent inlining — the optimizer flattens nested CTEs too." },
            { id: "d", label: "Add DISTINCT inside the CTE", description: "DISTINCT deduplicates rows; it has no effect on whether the CTE is materialized." },
          ],
          branches: {
            a: "cte_early_filter_choice",
            b: "cte_materialize_recovery",
            c: "cte_materialize_recovery",
            d: "cte_materialize_recovery",
          },
          rationale: "MATERIALIZED is the explicit keyword (Postgres 12+). For engines without it, a temporary table or subquery with OFFSET 0 hack can force materialization.",
        },
        cte_early_filter_choice: {
          id: "cte_early_filter_choice",
          type: "scenario_choice",
          badge: "Stage 2 early filter",
          title: "Stage 2 · Over-eager early filter in CTE chain",
          prompt: "A CTE chain filters to status = 'active' in step 1. Step 2 later needs both active and inactive rows for a cohort comparison. What went wrong?",
          code_snippet: `WITH step1 AS (
  SELECT * FROM users WHERE status = 'active'  -- filters too early
),
step2 AS (
  SELECT user_id, COUNT(*) AS events
  FROM events
  JOIN step1 USING (user_id)        -- inactive users lost forever
  GROUP BY user_id
)
SELECT * FROM step2;`,
          choices: [
            { id: "a", label: "The WHERE in step1 eliminates inactive users before step2 can include them", description: "Once filtered out in step1, inactive users cannot be recovered in downstream CTEs." },
            { id: "b", label: "JOIN USING is not portable SQL", description: "JOIN USING is standard SQL supported by all major engines — not the issue here." },
            { id: "c", label: "step2 should use a LEFT JOIN instead", description: "A LEFT JOIN would help recover missing rows from step1, but the root cause is the premature filter in step1." },
            { id: "d", label: "CTEs cannot be JOINed to other tables", description: "CTEs can be used anywhere a table reference is valid, including JOINs." },
          ],
          branches: {
            a: "cte_recursive_click",
            b: "cte_materialize_recovery",
            c: "cte_materialize_recovery",
            d: "cte_materialize_recovery",
          },
          rationale: "Push row-level filters as late as correctness allows. Filtering too early in a CTE truncates data for all downstream steps.",
        },
        cte_recursive_click: {
          id: "cte_recursive_click",
          type: "click_target",
          badge: "Stage 3 target",
          title: "Stage 3 · Broken recursive CTE base case",
          prompt: "This recursive CTE is supposed to traverse an employee hierarchy starting from the CEO (manager_id IS NULL). Click the line that contains the base-case error that causes the recursion to return zero rows.",
          code_snippet: `WITH RECURSIVE org AS (
  SELECT id, name, manager_id, 0 AS depth
  FROM employees
  WHERE manager_id = 0         -- ds-target:wrong_base_case
  UNION ALL
  SELECT e.id, e.name, e.manager_id, o.depth + 1
  FROM employees e
  JOIN org o ON e.manager_id = o.id
)
SELECT * FROM org;`,
          validationCopy: {
            wrong_base_case: "Correct. The base case uses manager_id = 0 but root employees have manager_id IS NULL (no manager). The anchor returns zero rows, so the recursive step never fires and the CTE returns nothing.",
          },
          branches: {
            wrong_base_case: "cte_terminate_choice",
          },
        },
        cte_recursive_recovery: {
          id: "cte_recursive_recovery",
          type: "scenario_choice",
          badge: "Recovery 3",
          title: "Recovery · Base case and termination",
          prompt: "State the two rules that a correctly structured recursive CTE must satisfy.",
          code_snippet: `-- A recursive CTE has two required parts:
-- 1. Base case (anchor)
-- 2. Recursive step (references the CTE itself)`,
          choices: [
            { id: "a", label: "Base case returns initial rows; recursive step adds rows until none match", description: "The anchor seeds the result set; recursion continues until the recursive step returns an empty set." },
            { id: "b", label: "The base case must use DISTINCT to prevent loops", description: "DISTINCT does not prevent infinite recursion — the termination condition comes from the JOIN logic." },
            { id: "c", label: "UNION instead of UNION ALL prevents duplicates and automatically terminates", description: "UNION removes duplicates but does not guarantee termination — you can still loop with UNION if the graph has cycles." },
            { id: "d", label: "The recursive step must reference a different table than the base case", description: "Both the base case and recursive step typically reference the same table (e.g., employees); the difference is the JOIN predicate." },
          ],
          branches: {
            a: "cte_terminate_choice",
            b: "cte_recursive_recovery",
            c: "cte_recursive_recovery",
            d: "cte_recursive_recovery",
          },
          rationale: "Anchor seeds the result; recursive step joins the CTE to itself. Termination happens when the recursive step finds no new rows.",
        },
        cte_terminate_choice: {
          id: "cte_terminate_choice",
          type: "scenario_choice",
          badge: "Stage 3 termination",
          title: "Stage 3 · Termination and infinite recursion risk",
          prompt: "A recursive CTE traverses a directed graph of account relationships. Some accounts link to each other in a cycle (A → B → A). What happens and how do you prevent it?",
          code_snippet: `-- Graph: A → B → A (cycle)
-- Recursive step: JOIN cte ON next_id = cte.current_id`,
          choices: [
            { id: "a", label: "The engine recurses forever until it hits the max-depth limit and errors; use a visited-path array or depth limit to break cycles", description: "Cycle detection via array_agg path or a max depth guard is the standard fix." },
            { id: "b", label: "The engine detects cycles automatically and stops", description: "Standard SQL engines do not auto-detect cycles — you must guard against them explicitly." },
            { id: "c", label: "UNION ALL prevents revisiting the same row twice", description: "UNION ALL appends all rows including duplicates — it does not deduplicate or break cycles." },
            { id: "d", label: "Add WHERE depth < 100 to the base case", description: "The depth guard should be on the recursive step (WHERE o.depth + 1 < 100), not the base case." },
          ],
          branches: {
            a: "cte_terminal",
            b: "cte_terminate_recovery",
            c: "cte_terminate_recovery",
            d: "cte_terminate_recovery",
          },
          rationale: "Cycles in recursive CTEs cause infinite recursion. The standard techniques are: depth column with WHERE depth < N guard, or a visited-path array to detect when a node has been seen before.",
        },
        cte_terminate_recovery: {
          id: "cte_terminate_recovery",
          type: "scenario_choice",
          badge: "Recovery 3",
          title: "Recovery · Cycle guard pattern",
          prompt: "Which guard correctly limits recursion depth and prevents runaway queries?",
          code_snippet: `WITH RECURSIVE cte AS (
  SELECT id, name, 0 AS depth FROM nodes WHERE parent_id IS NULL
  UNION ALL
  SELECT n.id, n.name, c.depth + 1
  FROM nodes n JOIN cte c ON n.parent_id = c.id
  WHERE ???        -- cycle guard goes here
)`,
          choices: [
            { id: "a", label: "WHERE c.depth + 1 < 50", description: "Caps the recursion at 50 levels. Recursive step stops generating rows once depth reaches 50." },
            { id: "b", label: "WHERE n.id != c.id", description: "Only prevents a node from being its own direct parent — does not catch longer cycles like A → B → A." },
            { id: "c", label: "WHERE depth = 0", description: "depth = 0 would only include rows at depth 0 in the recursive step — stopping recursion on the first iteration." },
            { id: "d", label: "LIMIT 1000 in the final SELECT", description: "LIMIT on the outer SELECT truncates output rows; it does not limit or terminate the recursion itself." },
          ],
          branches: {
            a: "cte_terminal",
            b: "cte_terminate_recovery",
            c: "cte_terminate_recovery",
            d: "cte_terminate_recovery",
          },
          rationale: "Depth guard in the recursive step WHERE clause is the simplest cycle protection. For true cycle detection use an array path column and check NOT (n.id = ANY(path)).",
        },
        cte_terminal: {
          id: "cte_terminal",
          type: "scenario_choice",
          badge: "Terminal",
          title: "Revision complete · CTEs and recursive queries locked",
          prompt: "You identified CTE inlining semantics, early-filter scoping, base-case errors, and cycle guard patterns.",
          code_snippet: `-- CTEs: inlined by default; use MATERIALIZED to cache
-- Early filters in CTEs truncate data for all downstream steps
-- Recursive CTE: base case seeds; recursive step runs until empty
-- Cycle guard: WHERE depth + 1 < N in the recursive step`,
          choices: [],
          branches: {},
          terminal: true,
          rationale: "Candidate-ready answers: CTEs are not cached by default; over-filtering in CTEs truncates downstream data; recursive CTEs need a correct base case and a cycle guard for graph traversal.",
        },
      },
    },
    knowledgeCheck: [],
  },

  "sq-a4": {
    durationLabel: "14 min",
    outcomes: [
      "Translate any row-to-column transformation into portable SUM(CASE WHEN ...) syntax.",
      "Explain when PIVOT keyword syntax is appropriate and what its portability limits are.",
      "Identify static vs dynamic pivot scenarios and choose the right implementation strategy.",
    ],
    learnMarkdown: `## Rapid revision: PIVOT & conditional aggregation

A pivot turns distinct values in one column into separate output columns. The portable way to do this in any SQL dialect is conditional aggregation:

\`\`\`sql
SELECT
  month,
  SUM(CASE WHEN product = 'Widget' THEN revenue ELSE 0 END) AS Widget,
  SUM(CASE WHEN product = 'Gadget' THEN revenue ELSE 0 END) AS Gadget
FROM sales
GROUP BY month;
\`\`\`

The CASE expression selects the revenue for one product per row and returns 0 for all others. SUM collapses the group.

## PIVOT keyword (dialect-specific)

SQL Server, Snowflake, and BigQuery support a PIVOT clause that does the same thing with less boilerplate. PostgreSQL and MySQL do not.

\`\`\`sql
-- SQL Server / Snowflake
SELECT month, [Widget], [Gadget]
FROM sales
PIVOT (SUM(revenue) FOR product IN ([Widget], [Gadget])) AS pvt;
\`\`\`

## Interview muscle memory

- Default to CASE-based aggregation in cross-dialect interviews.
- Both PIVOT and CASE require static column lists — dynamic value sets need dynamic SQL or a BI layer.
- UNPIVOT (or UNION ALL with literals) reverses the operation: wide table back to narrow.`,
    video: null,
    videoFallbackMarkdown: `## 3-minute pivot drill

Write a CASE-based pivot for a table with columns (year, quarter, sales). Produce columns: year, Q1, Q2, Q3, Q4.

Then explain what changes are needed if the quarters are stored as 1, 2, 3, 4 (integers) instead of 'Q1', 'Q2', etc.`,
    tryGuidance: "Run the interview simulation. Click the CASE pivot query that uses COUNT instead of SUM, then handle the dynamic vs static pivot trade-off.",
    interviewGraph: {
      initialStageId: "pivot_wrong_agg_click",
      artifactDimensions: [
        { label: "CASE Aggregation Precision", recoveryStageId: "pivot_recovery_agg" },
        { label: "PIVOT Portability Awareness", recoveryStageId: "pivot_recovery_portability" },
        { label: "Dynamic vs Static Pivot Trade-Off", recoveryStageId: "pivot_recovery_dynamic", passLabel: "Pivot Trade-Off Clear" },
      ],
      stages: {
        pivot_wrong_agg_click: {
          id: "pivot_wrong_agg_click",
          type: "click_target",
          badge: "Stage 1 target",
          title: "Stage 1 · Wrong aggregation in a CASE pivot",
          prompt: "The analyst wants total revenue per product per month, but the query returns wrong numbers. Click the exact line with the aggregation bug.",
          code_snippet: `SELECT
  month,
  COUNT(CASE WHEN product = 'Widget' THEN revenue END) AS Widget, -- ds-target:wrong_agg
  COUNT(CASE WHEN product = 'Gadget' THEN revenue END) AS Gadget,
  COUNT(CASE WHEN product = 'Donut'  THEN revenue END) AS Donut
FROM sales
GROUP BY month;`,
          validationCopy: {
            wrong_agg: "Correct. COUNT counts how many rows match, not the sum of revenue. The fix is SUM(CASE WHEN product = 'Widget' THEN revenue ELSE 0 END).",
          },
          branches: {
            wrong_agg: "pivot_portability_choice",
          },
        },
        pivot_recovery_agg: {
          id: "pivot_recovery_agg",
          type: "scenario_choice",
          badge: "Recovery 1",
          title: "Recovery · Choose the right aggregation",
          prompt: "The query uses COUNT inside CASE. What is the impact on a month that has 3 Widget rows with revenues 100, 200, 300?",
          code_snippet: `-- COUNT(CASE WHEN product = 'Widget' THEN revenue END)
-- vs
-- SUM(CASE WHEN product = 'Widget' THEN revenue ELSE 0 END)`,
          choices: [
            { id: "a", label: "COUNT returns 3, SUM returns 600 — different answers for different business needs", description: "COUNT answers 'how many Widget rows', SUM answers 'total Widget revenue'." },
            { id: "b", label: "COUNT and SUM always return the same value", description: "COUNT returns row count; SUM returns the sum of values. They are different." },
            { id: "c", label: "COUNT returns 600, SUM returns 3", description: "COUNT returns the number of non-NULL values (3), SUM returns the total (600)." },
            { id: "d", label: "Both return NULL when no rows match", description: "SUM of an empty group returns NULL; COUNT returns 0." },
          ],
          branches: {
            a: "pivot_portability_choice",
            b: "pivot_recovery_agg",
            c: "pivot_recovery_agg",
            d: "pivot_recovery_agg",
          },
          rationale: "COUNT inside CASE counts matching rows. SUM inside CASE totals matching values. The goal (revenue total) requires SUM.",
        },
        pivot_portability_choice: {
          id: "pivot_portability_choice",
          type: "scenario_choice",
          badge: "Stage 2 portability",
          title: "Stage 2 · The interviewer asks about PIVOT syntax",
          prompt: "Your team wants to switch from CASE-based aggregation to the PIVOT keyword. What is the most important portability caveat to raise?",
          code_snippet: `-- CASE version (universal):
SUM(CASE WHEN product = 'Widget' THEN revenue ELSE 0 END)

-- PIVOT version (dialect-specific):
PIVOT (SUM(revenue) FOR product IN ([Widget]))`,
          choices: [
            { id: "a", label: "PIVOT is not supported in PostgreSQL or MySQL", description: "PostgreSQL and MySQL lack native PIVOT — you must use CASE there." },
            { id: "b", label: "PIVOT always runs slower than CASE", description: "Performance depends on the engine; PIVOT is syntactic sugar in engines that support it." },
            { id: "c", label: "CASE cannot handle NULL revenue values", description: "CASE with ELSE 0 handles NULLs correctly." },
            { id: "d", label: "PIVOT requires an index on the pivoted column", description: "PIVOT does not require an index; it is a query-shape change, not an access-path requirement." },
          ],
          branches: {
            a: "pivot_dynamic_choice",
            b: "pivot_recovery_portability",
            c: "pivot_recovery_portability",
            d: "pivot_recovery_portability",
          },
          rationale: "PIVOT is supported in SQL Server, Azure Synapse, Snowflake, BigQuery — but not in PostgreSQL or MySQL. Always name the dialect when recommending PIVOT.",
        },
        pivot_recovery_portability: {
          id: "pivot_recovery_portability",
          type: "scenario_choice",
          badge: "Recovery 2",
          title: "Recovery · Name a database that lacks PIVOT",
          prompt: "The interviewer asks you to name a widely-used database that does NOT support the PIVOT keyword.",
          code_snippet: `-- Engines with PIVOT: SQL Server, Snowflake, BigQuery, Azure Synapse
-- Engines without: ???`,
          choices: [
            { id: "a", label: "PostgreSQL", description: "Correct — PostgreSQL has no native PIVOT. Use CASE or the crosstab() extension." },
            { id: "b", label: "SQL Server", description: "SQL Server introduced PIVOT in 2005 and supports it natively." },
            { id: "c", label: "Snowflake", description: "Snowflake supports PIVOT natively." },
            { id: "d", label: "BigQuery", description: "BigQuery added PIVOT support in 2021." },
          ],
          branches: {
            a: "pivot_dynamic_choice",
            b: "pivot_recovery_portability",
            c: "pivot_recovery_portability",
            d: "pivot_recovery_portability",
          },
          rationale: "PostgreSQL is the most common example without native PIVOT. MySQL also lacks it.",
        },
        pivot_dynamic_choice: {
          id: "pivot_dynamic_choice",
          type: "scenario_choice",
          badge: "Stage 3 trade-off",
          title: "Stage 3 · Dynamic pivot trade-off",
          prompt: "The product catalog grows weekly and now has 300 products. Both PIVOT and CASE require you to list product names statically. What is the correct solution?",
          code_snippet: `-- Problem: new products appear weekly
-- Static list breaks immediately
PIVOT (SUM(revenue) FOR product IN ([Widget], [Gadget], ...300 products))`,
          choices: [
            { id: "a", label: "Dynamic SQL: query distinct products first, then build the CASE/PIVOT list at runtime", description: "Dynamic SQL (EXECUTE/sp_executesql) generates the column list from live data." },
            { id: "b", label: "Add a product column to the WHERE clause", description: "Filtering products does not create dynamic columns." },
            { id: "c", label: "Create 300 separate queries and UNION them", description: "UNION produces rows, not new columns. This would not pivot the data." },
            { id: "d", label: "Use COUNT instead of SUM to avoid listing products", description: "The aggregation function does not determine whether columns are dynamic." },
          ],
          branches: {
            a: "pivot_terminal",
            b: "pivot_recovery_dynamic",
            c: "pivot_recovery_dynamic",
            d: "pivot_recovery_dynamic",
          },
          rationale: "Static pivot lists require maintenance every time the dimension changes. Dynamic SQL reads the live values and constructs the expression at query time.",
        },
        pivot_recovery_dynamic: {
          id: "pivot_recovery_dynamic",
          type: "scenario_choice",
          badge: "Recovery 3",
          title: "Recovery · Dynamic pivot pattern",
          prompt: "Which tool or technique handles pivot columns that are not known at query-write time?",
          code_snippet: `-- Step 1: discover column values
SELECT DISTINCT product FROM sales;

-- Step 2: build and execute dynamic SQL`,
          choices: [
            { id: "a", label: "Dynamic SQL (EXECUTE with a built string) or a BI tool that pivots at render time", description: "Both are correct for different use cases." },
            { id: "b", label: "A materialized view with fixed columns", description: "A fixed materialized view still requires manual column changes when new products appear." },
            { id: "c", label: "DISTINCT in the PIVOT IN clause", description: "PIVOT IN does not accept subqueries in most dialects — you must list values explicitly." },
            { id: "d", label: "A FULL OUTER JOIN on all products", description: "FULL JOIN changes row grain, not column width." },
          ],
          branches: {
            a: "pivot_terminal",
            b: "pivot_recovery_dynamic",
            c: "pivot_recovery_dynamic",
            d: "pivot_recovery_dynamic",
          },
          rationale: "Dynamic SQL builds the PIVOT or CASE column list at execution time from a data query. BI layers (Looker, Power BI) can also pivot at render time, which is often the cleaner production solution.",
        },
        pivot_terminal: {
          id: "pivot_terminal",
          type: "scenario_choice",
          badge: "Terminal",
          title: "Revision complete · Pivot mastered",
          prompt: "You identified the wrong aggregation, named the portability limits of PIVOT, and solved the dynamic column problem.",
          code_snippet: `-- Interview-ready summary:
-- Use SUM(CASE WHEN ...) for portability
-- Use PIVOT keyword in dialects that support it (name them)
-- Use dynamic SQL or a BI layer when column values are not static`,
          choices: [],
          branches: {},
          terminal: true,
          rationale: "The candidate-ready answer covers: CASE is universal; PIVOT is dialect-specific (SQL Server/Snowflake/BigQuery yes, Postgres/MySQL no); dynamic columns require dynamic SQL or a BI rendering layer.",
        },
      },
    },
    knowledgeCheck: [],
  },

  "sq-a5": {
    durationLabel: "16 min",
    outcomes: [
      "Read an EXPLAIN plan and identify Seq Scan, Index Scan, and Hash Join nodes.",
      "Choose between single-column and composite indexes based on query predicate order.",
      "Articulate join order and index selection as interviewer-facing trade-off decisions.",
    ],
    learnMarkdown: `## Rapid revision: EXPLAIN and query optimization

Every SQL engine has a planner that chooses how to execute your query. Use EXPLAIN (or EXPLAIN ANALYZE in Postgres) to see the plan.

\`\`\`sql
EXPLAIN SELECT * FROM orders WHERE customer_id = 'C42';
\`\`\`

## Key plan nodes

- **Seq Scan** — reads every row. Cost is proportional to table size. Unavoidable if no useful index exists.
- **Index Scan** — follows a B-tree to matching rows. Fast for high-selectivity predicates (few rows match).
- **Index Only Scan** — satisfies the query entirely from the index without touching the heap.
- **Hash Join** — builds a hash table on the smaller input, then probes with the larger input. Scales well when the build side fits in memory.
- **Sort** — materializes and sorts rows for ORDER BY or Merge Join. Appears in cost when no pre-sorted index exists.

## Interview muscle memory

- Always check EXPLAIN before assuming a query is slow.
- Composite indexes work left-to-right: \`(customer_id, created_at)\` supports predicates on \`customer_id\` alone or on both columns, but NOT on \`created_at\` alone.
- High estimated rows under a Seq Scan node = primary optimization target.`,
    video: null,
    videoFallbackMarkdown: `## 3-minute plan drill

Given EXPLAIN output showing Seq Scan cost=45000 and Hash Join cost=200, answer:
1. Which node is the bottleneck?
2. What index would convert the Seq Scan to an Index Scan?
3. Does adding LIMIT 10 help before or after the Seq Scan runs?`,
    tryGuidance: "Click the subquery pattern that forces a full scan on every outer row, then handle index selection and join-order trade-offs.",
    interviewGraph: {
      initialStageId: "explain_corr_click",
      artifactDimensions: [
        { label: "Plan Node Recognition", recoveryStageId: "explain_recovery_seqscan" },
        { label: "Index Selection Instinct", recoveryStageId: "explain_recovery_index" },
        { label: "Join Order Trade-Off", recoveryStageId: "explain_recovery_joinorder", passLabel: "Optimization Trade-Off Clear" },
      ],
      stages: {
        explain_corr_click: {
          id: "explain_corr_click",
          type: "click_target",
          badge: "Stage 1 target",
          title: "Stage 1 · Spot the correlated subquery forcing a full scan",
          prompt: "This query returns correct results but EXPLAIN shows a Seq Scan executed millions of times. Click the line that causes row-by-row re-evaluation.",
          code_snippet: `SELECT
  o.order_id,
  o.customer_id,
  (SELECT SUM(oi.amount)          -- ds-target:corr_subq
   FROM order_items oi
   WHERE oi.order_id = o.order_id  -- references outer row each time
  ) AS total_amount
FROM orders o
WHERE o.created_at >= '2024-01-01';`,
          validationCopy: {
            corr_subq: "Correct. This correlated subquery re-executes for each outer row. EXPLAIN will show a Seq Scan or Index Scan inside the subquery repeated N times — one per orders row.",
          },
          branches: {
            corr_subq: "explain_index_choice",
          },
        },
        explain_recovery_seqscan: {
          id: "explain_recovery_seqscan",
          type: "scenario_choice",
          badge: "Recovery 1",
          title: "Recovery · Identify the Seq Scan consequence",
          prompt: "EXPLAIN shows cost=0.00..45000.00 on a Seq Scan node. The table has 5 million rows. What does this tell you?",
          code_snippet: `Seq Scan on orders  (cost=0.00..45000.00 rows=5000000)
  Filter: (created_at >= '2024-01-01')`,
          choices: [
            { id: "a", label: "The engine is reading every row in orders before applying the filter", description: "Seq Scan + Filter means all rows are read; matching rows are kept." },
            { id: "b", label: "The query has a syntax error that prevents index use", description: "Seq Scan is a valid execution choice, not a syntax problem." },
            { id: "c", label: "The optimizer decided this is cheaper than an index scan", description: "Possible for very low-selectivity queries, but not the typical interview answer." },
            { id: "d", label: "EXPLAIN always shows Seq Scan regardless of indexes", description: "EXPLAIN reflects the actual plan chosen, including index usage." },
          ],
          branches: {
            a: "explain_index_choice",
            b: "explain_recovery_seqscan",
            c: "explain_recovery_seqscan",
            d: "explain_recovery_seqscan",
          },
          rationale: "Seq Scan reads the full table heap. For selective predicates on large tables this is the primary bottleneck to address.",
        },
        explain_index_choice: {
          id: "explain_index_choice",
          type: "scenario_choice",
          badge: "Stage 2 index",
          title: "Stage 2 · Choose the right index for two predicates",
          prompt: "The query filters on both customer_id (equality) and created_at (range). Which index design is most efficient?",
          code_snippet: `SELECT customer_id, SUM(amount)
FROM orders
WHERE customer_id = 'C42'        -- equality
  AND created_at >= '2024-01-01' -- range
GROUP BY customer_id;`,
          choices: [
            { id: "a", label: "Composite index: (customer_id, created_at)", description: "Equality column first, range column second — classic composite index design." },
            { id: "b", label: "Two separate indexes: one on customer_id, one on created_at", description: "The planner can bitmap-AND two indexes but a composite is usually cheaper." },
            { id: "c", label: "Composite index: (created_at, customer_id)", description: "Wrong order. The range predicate on created_at at position 0 prevents efficient use on customer_id." },
            { id: "d", label: "No index needed — LIMIT 10 is fast enough", description: "LIMIT does not help if a Seq Scan must produce all rows before limiting." },
          ],
          branches: {
            a: "explain_joinorder_choice",
            b: "explain_recovery_index",
            c: "explain_recovery_index",
            d: "explain_recovery_index",
          },
          rationale: "The composite index rule: put equality predicates first, range predicates last. The planner can jump to the customer_id bucket and then range-scan created_at within it.",
        },
        explain_recovery_index: {
          id: "explain_recovery_index",
          type: "scenario_choice",
          badge: "Recovery 2",
          title: "Recovery · Column order in a composite index",
          prompt: "Why does (customer_id, created_at) work better than (created_at, customer_id) for the query above?",
          code_snippet: `-- Index B-tree nodes are sorted left-to-right
-- (customer_id, created_at):
--   First level: jump to customer_id='C42' bucket
--   Second level: range-scan created_at >= '2024-01-01' within that bucket`,
          choices: [
            { id: "a", label: "Equality predicate on the leading column narrows the search space before the range scan", description: "Correct — jumping to a single customer bucket first is the key insight." },
            { id: "b", label: "created_at is always larger than customer_id in byte size", description: "Column ordering in indexes is about predicate type, not byte size." },
            { id: "c", label: "The planner ignores indexes with range predicates at any position", description: "The planner uses composite indexes even with range predicates — position matters." },
            { id: "d", label: "Both orders are equivalent; the planner reverses them automatically", description: "The planner does not reorder composite index columns." },
          ],
          branches: {
            a: "explain_joinorder_choice",
            b: "explain_recovery_index",
            c: "explain_recovery_index",
            d: "explain_recovery_index",
          },
          rationale: "Equality-first in a composite index means the B-tree search can find the exact bucket for customer_id='C42' before scanning the date range within it.",
        },
        explain_joinorder_choice: {
          id: "explain_joinorder_choice",
          type: "scenario_choice",
          badge: "Stage 3 trade-off",
          title: "Stage 3 · Join order and Hash Join sizing",
          prompt: "EXPLAIN shows a Hash Join between orders (5M rows) and customers (50K rows). Which table should be the build (inner) side of the Hash Join?",
          code_snippet: `Hash Join
  ->  Hash  (build side)
        ->  ???  -- which table goes here?
  ->  ???  (probe side, streamed)`,
          choices: [
            { id: "a", label: "customers (50K rows) as build side — smaller table fits in memory", description: "The hash table is built from the smaller relation to minimize memory use." },
            { id: "b", label: "orders (5M rows) as build side — more rows means a better hash distribution", description: "More rows in the hash table increases memory pressure and spill risk." },
            { id: "c", label: "It never matters — the planner always picks the right side", description: "The planner usually picks correctly but you should verify with EXPLAIN ANALYZE." },
            { id: "d", label: "Hash Join only works when both sides are the same size", description: "Hash Join works with any size ratio; smaller build side is just more efficient." },
          ],
          branches: {
            a: "explain_terminal",
            b: "explain_recovery_joinorder",
            c: "explain_recovery_joinorder",
            d: "explain_recovery_joinorder",
          },
          rationale: "Hash Join loads the build side into an in-memory hash table. Smaller build side = less memory, less chance of spill to disk.",
        },
        explain_recovery_joinorder: {
          id: "explain_recovery_joinorder",
          type: "scenario_choice",
          badge: "Recovery 3",
          title: "Recovery · Hash Join build vs probe",
          prompt: "When a Hash Join spills to disk (work_mem exceeded), what happens to query performance?",
          code_snippet: `-- Hash Join phases:
-- Build: load smaller input into hash table in memory
-- Probe: stream larger input and probe the hash table
-- Spill: if build side exceeds work_mem, write to disk (batches)`,
          choices: [
            { id: "a", label: "Performance degrades significantly due to disk I/O for the spilled batches", description: "Disk spill for hash joins can cause 10x-100x slowdowns vs in-memory execution." },
            { id: "b", label: "The planner automatically switches to a Merge Join when spills occur", description: "The planner chooses the join type at plan time, not at runtime spill time." },
            { id: "c", label: "Spills only affect Hash Aggregate, not Hash Join", description: "Both Hash Join and Hash Aggregate can spill to disk when memory is exceeded." },
            { id: "d", label: "Spills have no impact because SSDs are as fast as RAM", description: "Even NVMe SSDs are orders of magnitude slower than RAM for random I/O." },
          ],
          branches: {
            a: "explain_terminal",
            b: "explain_recovery_joinorder",
            c: "explain_recovery_joinorder",
            d: "explain_recovery_joinorder",
          },
          rationale: "Disk spills in hash operations are a common performance cliff. The fix is increasing work_mem (per-session budget) or ensuring the build side is the smaller relation.",
        },
        explain_terminal: {
          id: "explain_terminal",
          type: "scenario_choice",
          badge: "Terminal",
          title: "Revision complete · Query optimization locked",
          prompt: "You identified the correlated subquery bottleneck, chose the right composite index order, and explained Hash Join sizing.",
          code_snippet: `-- Interview-ready summary:
-- Correlated subquery = per-row subplan = Seq Scan * N
-- Composite index: equality columns first, range columns last
-- Hash Join build side = smaller relation (fits in memory)
-- EXPLAIN ANALYZE shows actual vs estimated rows`,
          choices: [],
          branches: {},
          terminal: true,
          rationale: "The three-part answer covers plan node recognition, composite index column order, and Hash Join memory management — the core query-optimization concepts tested in data engineering interviews.",
        },
      },
    },
    knowledgeCheck: [],
  },

  "sq-d1": {
    durationLabel: "15 min",
    outcomes: [
      "Identify 1NF, 2NF, and 3NF violations given a table schema and functional dependencies.",
      "Decompose a table to 3NF by separating partial and transitive dependencies.",
      "Articulate the read-performance trade-off of normalization vs intentional denormalization.",
    ],
    learnMarkdown: `## Rapid revision: 1NF through 3NF

Normalization removes update anomalies by ensuring each fact is stored in exactly one place.

**1NF** — atomic values, no repeating groups, a primary key exists.

**2NF** — 1NF plus no partial dependencies: every non-key column must depend on the WHOLE primary key, not just part of a composite key.

\`\`\`
BAD: PK = (order_id, product_id), but customer_name depends only on order_id
FIX: Move customer_name to an Orders table keyed by order_id
\`\`\`

**3NF** — 2NF plus no transitive dependencies: non-key columns must not depend on other non-key columns.

\`\`\`
BAD: student_id -> dept -> dept_head (dept_head depends on dept, not student_id)
FIX: Move dept_head to a Departments table keyed by dept
\`\`\`

## Interview muscle memory

- Name the dependency, name the fix, name the table it moves to.
- BCNF is stricter: every determinant must be a candidate key. Mention it if the interviewer pushes.
- Normalization reduces write anomalies; star-schema denormalization improves analytics read speed. Both are valid — state the workload that drives the choice.`,
    video: null,
    videoFallbackMarkdown: `## 3-minute normalization drill

Given table: Enrollment(student_id, course_id, student_name, instructor_id, instructor_office)

1. Identify the primary key.
2. Name one partial dependency.
3. Name one transitive dependency.
4. Sketch the 3NF decomposition.`,
    tryGuidance: "Click the column causing a partial dependency in the 2NF-violating table, then handle the 3NF decomposition trade-off vs denormalization.",
    interviewGraph: {
      initialStageId: "norm_partial_dep_click",
      artifactDimensions: [
        { label: "Dependency Identification", recoveryStageId: "norm_recovery_partial" },
        { label: "3NF Decomposition Skill", recoveryStageId: "norm_recovery_3nf" },
        { label: "Normalization vs Denormalization Trade-Off", recoveryStageId: "norm_recovery_tradeoff", passLabel: "Schema Trade-Off Clear" },
      ],
      stages: {
        norm_partial_dep_click: {
          id: "norm_partial_dep_click",
          type: "click_target",
          badge: "Stage 1 target",
          title: "Stage 1 · Spot the partial dependency",
          prompt: "The table below violates 2NF. The primary key is (order_id, product_id). Click the column that causes the partial dependency.",
          code_snippet: `CREATE TABLE order_lines (
  order_id     INT,
  product_id   INT,
  customer_name VARCHAR(100), -- ds-target:partial_dep
  quantity     INT,
  unit_price   DECIMAL(10,2),
  PRIMARY KEY (order_id, product_id)
);
-- customer_name is determined by order_id alone, not by (order_id, product_id)`,
          validationCopy: {
            partial_dep: "Correct. customer_name depends only on order_id, not on the full composite key (order_id, product_id). That is a partial dependency and a 2NF violation.",
          },
          branches: {
            partial_dep: "norm_3nf_choice",
          },
        },
        norm_recovery_partial: {
          id: "norm_recovery_partial",
          type: "scenario_choice",
          badge: "Recovery 1",
          title: "Recovery · Define partial dependency",
          prompt: "Which statement correctly defines a partial dependency?",
          code_snippet: `-- Table PK = (order_id, product_id)
-- customer_name depends on order_id alone`,
          choices: [
            { id: "a", label: "A non-key column depends on only part of a composite primary key", description: "customer_name is determined by order_id, which is only part of (order_id, product_id)." },
            { id: "b", label: "A column contains NULL in some rows", description: "NULL presence is not a normalization violation by itself." },
            { id: "c", label: "A column depends on a non-key column (transitive)", description: "That describes a transitive dependency — a 3NF violation, not 2NF." },
            { id: "d", label: "Two columns store the same data type", description: "Sharing a data type is not a dependency issue." },
          ],
          branches: {
            a: "norm_3nf_choice",
            b: "norm_recovery_partial",
            c: "norm_recovery_partial",
            d: "norm_recovery_partial",
          },
          rationale: "Partial dependency: part of the composite key determines a non-key column. Fix: extract that column into a table keyed by the partial key.",
        },
        norm_3nf_choice: {
          id: "norm_3nf_choice",
          type: "scenario_choice",
          badge: "Stage 2 decompose",
          title: "Stage 2 · Decompose to 3NF",
          prompt: "After fixing the 2NF violation you notice another problem: in the Students table, dept_head depends on dept, and dept depends on student_id. Which decomposition achieves 3NF?",
          code_snippet: `-- BEFORE (2NF — transitive dependency remains):
-- students(student_id PK, student_name, dept, dept_head)
-- dept_head -> dept -> student_id (transitive)`,
          choices: [
            { id: "a", label: "Create departments(dept PK, dept_head) and students(student_id PK, student_name, dept FK)", description: "dept_head moves to the departments table where dept is the PK." },
            { id: "b", label: "Add dept_head as a second PK column in students", description: "Adding a column to the PK does not remove the dependency." },
            { id: "c", label: "Delete dept_head entirely to simplify the schema", description: "The data must live somewhere; deleting it loses information." },
            { id: "d", label: "Move student_name to the departments table", description: "student_name depends on student_id, not on dept — wrong table." },
          ],
          branches: {
            a: "norm_tradeoff_choice",
            b: "norm_recovery_3nf",
            c: "norm_recovery_3nf",
            d: "norm_recovery_3nf",
          },
          rationale: "The transitive chain dept_head -> dept -> student_id is broken by extracting dept_head into a departments table, so it is directly determined by its own PK (dept).",
        },
        norm_recovery_3nf: {
          id: "norm_recovery_3nf",
          type: "scenario_choice",
          badge: "Recovery 2",
          title: "Recovery · Rule for 3NF decomposition",
          prompt: "Pick the statement that correctly explains why dept_head must leave the students table.",
          code_snippet: `-- students: student_id -> dept -> dept_head
-- dept_head is NOT determined by student_id directly.
-- It is determined by dept (a non-key column).`,
          choices: [
            { id: "a", label: "dept_head is transitively determined by student_id via a non-key column (dept)", description: "3NF requires non-key columns depend ONLY on the PK, not on another non-key column." },
            { id: "b", label: "dept_head has too many characters to belong in the students table", description: "Column width is irrelevant to normalization." },
            { id: "c", label: "dept_head is a repeating group that violates 1NF", description: "dept_head is a scalar value — not a repeating group." },
            { id: "d", label: "dept_head should be moved to the enrollments table", description: "dept_head is a property of dept, not of student-course enrollment." },
          ],
          branches: {
            a: "norm_tradeoff_choice",
            b: "norm_recovery_3nf",
            c: "norm_recovery_3nf",
            d: "norm_recovery_3nf",
          },
          rationale: "3NF definition: non-key attributes may only depend on candidate keys. dept is not a candidate key of students, so dept_head must leave.",
        },
        norm_tradeoff_choice: {
          id: "norm_tradeoff_choice",
          type: "scenario_choice",
          badge: "Stage 3 trade-off",
          title: "Stage 3 · Normalization vs denormalization",
          prompt: "Your 3NF schema has 6 tables. An analytics dashboard that reads customer + order + product data takes 800ms because it joins all 6 tables. The interviewer asks what you would do.",
          code_snippet: `-- 3NF: minimal redundancy, clean writes
-- Analytics query: 6-way JOIN, 800ms

-- Trade-off options:
-- A) Materialized view / wide denormalized table for reads
-- B) Roll back all normalization
-- C) Add more indexes to all FK columns
-- D) Raise the join limit in the database config`,
          choices: [
            { id: "a", label: "Create a materialized view or wide denormalized read model for analytics, keep 3NF for writes", description: "This is the star-schema / CQRS pattern: normalized writes, denormalized reads." },
            { id: "b", label: "Roll back to the unnormalized table to eliminate joins entirely", description: "Undoing all normalization reintroduces update anomalies across all write paths." },
            { id: "c", label: "Add indexes to every foreign key column and nothing else", description: "Indexes help join speed but cannot eliminate the JOIN overhead for wide analytical queries." },
            { id: "d", label: "Raise the join limit — databases are arbitrarily limited by default", description: "The join limit in most engines is high (>100); 6-way joins are not the limit, latency is the issue." },
          ],
          branches: {
            a: "norm_terminal",
            b: "norm_recovery_tradeoff",
            c: "norm_recovery_tradeoff",
            d: "norm_recovery_tradeoff",
          },
          rationale: "The textbook answer is CQRS / star schema: keep writes normalized (3NF eliminates anomalies), maintain a denormalized read model (wide table or materialized view) for analytics.",
        },
        norm_recovery_tradeoff: {
          id: "norm_recovery_tradeoff",
          type: "scenario_choice",
          badge: "Recovery 3",
          title: "Recovery · Name the pattern that combines both",
          prompt: "What is the design pattern name for maintaining a normalized OLTP model for writes and a denormalized model for analytics reads?",
          code_snippet: `-- Write path: normalized 3NF tables (INSERT/UPDATE safe)
-- Read path: materialized wide table or star schema (fast SELECT)`,
          choices: [
            { id: "a", label: "CQRS (Command Query Responsibility Segregation) or star schema separation", description: "Both names are correct and are expected in data engineering interviews." },
            { id: "b", label: "BCNF — Boyce-Codd Normal Form replaces both models", description: "BCNF is a stricter normalization form, not a read/write separation pattern." },
            { id: "c", label: "Sharding — distribute rows to different servers", description: "Sharding addresses scale-out, not read/write model separation." },
            { id: "d", label: "Indexing — add a covering index on all analytics columns", description: "Covering indexes help but do not fully replace a purpose-built denormalized read model for complex analytics." },
          ],
          branches: {
            a: "norm_terminal",
            b: "norm_recovery_tradeoff",
            c: "norm_recovery_tradeoff",
            d: "norm_recovery_tradeoff",
          },
          rationale: "CQRS and star schema are the interview-expected patterns. They acknowledge that normalization is right for writes and denormalization is right for analytics reads.",
        },
        norm_terminal: {
          id: "norm_terminal",
          type: "scenario_choice",
          badge: "Terminal",
          title: "Revision complete · Normalization locked",
          prompt: "You spotted the partial dependency, decomposed to 3NF, and named the normalization vs denormalization trade-off.",
          code_snippet: `-- Interview-ready summary:
-- 2NF: no partial deps (non-key col depends on full composite PK)
-- 3NF: no transitive deps (non-key col depends only on PK)
-- Trade-off: 3NF for writes, materialized view / star schema for reads`,
          choices: [],
          branches: {},
          terminal: true,
          rationale: "The three-part candidate answer: identify the dependency type by name, state the decomposition, and acknowledge that denormalization is intentional and workload-driven for analytics.",
        },
      },
    },
    knowledgeCheck: [],
  },

  "sq-d2": {
    durationLabel: "14 min",
    outcomes: [
      "Identify when a missing or wrong index causes a full-table scan and quantify the cost.",
      "Choose between a single-column B-tree index and a composite index based on query shape.",
      "Explain high-write and low-cardinality scenarios where adding an index hurts rather than helps.",
    ],
    learnMarkdown: `## Indexing strategy: the interview mental model

An index trades write overhead for faster reads. Every INSERT, UPDATE, and DELETE must update all indexes on the table. Choose indexes deliberately.

## B-tree index

The default index type. Stores values in sorted order. Useful for:

- Equality lookups: \`WHERE email = ?\`
- Range scans: \`WHERE created_at BETWEEN ? AND ?\`
- High-cardinality columns (many distinct values)

## Composite index

An index on multiple columns in a defined order: \`(email, created_at)\`.

- Leading column must appear as an equality filter for the index to be used
- Range column goes last
- A composite index on (A, B) cannot efficiently serve a query filtering only on B

## When NOT to index

- **Low cardinality** — a \`status\` column with 3 values: the optimizer skips the index and does a full scan anyway
- **High-write tables** — each write pays maintenance cost on every index
- **Very small tables** — a full scan of 500 rows is faster than index I/O

## Interview muscle memory

Always ask: what is the query shape? What is the cardinality? What is the write frequency?`,
    video: null,
    videoFallbackMarkdown: `## 3-minute indexing drill

Write down three scenarios: one where you add a B-tree index, one where you add a composite index, and one where you explicitly decide NOT to index.

For each, state the column cardinality, the query pattern (equality vs range), and the write frequency. Practice explaining the trade-off in two sentences.`,
    tryGuidance: "Click the unindexed foreign key column causing the full scan, then navigate the composite vs partial index decision and the high-write trade-off.",
    interviewGraph: {
      initialStageId: "sq_d2_fk_scan_click",
      artifactDimensions: [
        { label: "Index Selection Instinct", recoveryStageId: "sq_d2_recovery_index_type" },
        { label: "Composite Index Column Order", recoveryStageId: "sq_d2_recovery_composite" },
        { label: "Write-Penalty Trade-Off", recoveryStageId: "sq_d2_recovery_write_penalty", passLabel: "Indexing Trade-Off Clear" },
      ],
      stages: {
        sq_d2_fk_scan_click: {
          id: "sq_d2_fk_scan_click",
          type: "click_target",
          badge: "Stage 1 target",
          title: "Stage 1 · Full scan through an unindexed FK join",
          prompt: "This query joins two large tables. EXPLAIN shows a sequential scan on one column. Click the exact line causing the full-table scan.",
          code_snippet: `SELECT u.name, COUNT(o.order_id) AS total_orders
FROM users u
JOIN orders o ON o.user_id = u.id  -- ds-target:unindexed_fk
WHERE u.created_at >= '2024-01-01'
GROUP BY u.name
ORDER BY total_orders DESC
LIMIT 20;`,
          validationCopy: {
            unindexed_fk: "Correct. orders.user_id is a foreign key with no index. The engine does a full scan of the orders table for every user row — O(n * m) instead of O(n log m).",
          },
          branches: {
            unindexed_fk: "sq_d2_index_type_choice",
          },
        },
        sq_d2_recovery_index_type: {
          id: "sq_d2_recovery_index_type",
          type: "scenario_choice",
          badge: "Recovery 1",
          title: "Recovery · Why is a FK join so expensive without an index?",
          prompt: "The interviewer asks you to explain the scan cost. Which answer is most precise?",
          code_snippet: `-- orders table: 50 M rows
-- users table:  2 M rows
-- JOIN ON orders.user_id = users.id`,
          choices: [
            { id: "a", label: "Without an index the engine reads the full orders table for every user", description: "Each of 2 M users triggers a full scan of 50 M order rows." },
            { id: "b", label: "Foreign keys are always indexed automatically", description: "In PostgreSQL, MySQL (InnoDB), and most engines, FKs are NOT auto-indexed." },
            { id: "c", label: "The query needs a LIMIT to avoid the scan", description: "LIMIT only affects output rows, not the JOIN scan cost." },
            { id: "d", label: "GROUP BY causes the full scan", description: "GROUP BY aggregates after the JOIN — it does not cause the scan." },
          ],
          branches: {
            a: "sq_d2_index_type_choice",
            b: "sq_d2_recovery_index_type",
            c: "sq_d2_recovery_index_type",
            d: "sq_d2_recovery_index_type",
          },
          rationale: "Unindexed FK joins degrade quadratically. The interviewer wants to hear you quantify the cost.",
        },
        sq_d2_index_type_choice: {
          id: "sq_d2_index_type_choice",
          type: "scenario_choice",
          badge: "Stage 1 choice",
          title: "Stage 1 · Pick the right index for the FK join",
          prompt: "You need to fix the scan on orders.user_id. The table also has a WHERE created_at filter. Which index strategy is best?",
          code_snippet: `-- New requirement: queries always filter by user_id
-- Some queries also add: AND created_at >= ?`,
          choices: [
            { id: "a", label: "Single B-tree on user_id only", description: "Fixes the join scan. Range queries on created_at still scan all user rows." },
            { id: "b", label: "Composite (user_id, created_at)", description: "Fixes the join AND narrows the range scan in a single index." },
            { id: "c", label: "Composite (created_at, user_id)", description: "Wrong column order — the range column must come after the equality column." },
            { id: "d", label: "Index on user_id and a separate index on created_at", description: "The optimizer may pick one but cannot use both simultaneously for the combined predicate." },
          ],
          branches: {
            a: "sq_d2_composite_order_choice",
            b: "sq_d2_composite_order_choice",
            c: "sq_d2_recovery_composite",
            d: "sq_d2_recovery_composite",
          },
          rationale: "When a query filters equality on one column and range on another, a composite index with equality column first is optimal.",
        },
        sq_d2_recovery_composite: {
          id: "sq_d2_recovery_composite",
          type: "scenario_choice",
          badge: "Recovery 2",
          title: "Recovery · Composite index column order",
          prompt: "The interviewer asks why column order matters in a composite index. Which rule is correct?",
          code_snippet: `-- Index A: (user_id, created_at)
-- Index B: (created_at, user_id)
-- Query:   WHERE user_id = ? AND created_at >= ?`,
          choices: [
            { id: "a", label: "Equality column first, range column last", description: "Index A is used efficiently; Index B skips user_id and does a range scan on all dates." },
            { id: "b", label: "Range column first for faster date filtering", description: "The engine cannot use the equality column after the range column efficiently." },
            { id: "c", label: "Column order does not matter", description: "Column order is the single most important decision in composite index design." },
            { id: "d", label: "Always put the primary key first", description: "The primary key column is not necessarily part of every query predicate." },
          ],
          branches: {
            a: "sq_d2_composite_order_choice",
            b: "sq_d2_recovery_composite",
            c: "sq_d2_recovery_composite",
            d: "sq_d2_recovery_composite",
          },
          rationale: "The left-prefix rule: the index is only usable up to the first range or skipped column.",
        },
        sq_d2_composite_order_choice: {
          id: "sq_d2_composite_order_choice",
          type: "scenario_choice",
          badge: "Stage 2 trade-off",
          title: "Stage 2 · High-write table index penalty",
          prompt: "A teammate wants to add five indexes to the orders table to speed up various analytics queries. The orders table receives 20 000 inserts per minute. What do you advise?",
          code_snippet: `-- orders table: 20 000 inserts / min
-- Proposed: 5 new indexes for analytics queries`,
          choices: [
            { id: "a", label: "Add all five — read speed matters most", description: "Each index adds write latency and CPU overhead on every INSERT." },
            { id: "b", label: "Evaluate each index; prefer routing analytics to a warehouse replica", description: "Minimize index count on the hot OLTP table; serve analytics from a read replica or warehouse." },
            { id: "c", label: "Add a single covering index for all five queries", description: "A covering index for five unrelated queries is likely too wide to be selective or efficient." },
            { id: "d", label: "Drop the primary key to make inserts faster", description: "Removing the primary key breaks referential integrity and JOIN correctness." },
          ],
          branches: {
            a: "sq_d2_recovery_write_penalty",
            b: "sq_d2_write_penalty_tradeoff",
            c: "sq_d2_recovery_write_penalty",
            d: "sq_d2_recovery_write_penalty",
          },
          rationale: "Index maintenance cost is proportional to write volume. High-write OLTP tables demand careful index audits.",
        },
        sq_d2_recovery_write_penalty: {
          id: "sq_d2_recovery_write_penalty",
          type: "scenario_choice",
          badge: "Recovery 3",
          title: "Recovery · Quantify the write penalty",
          prompt: "The interviewer asks how an index hurts writes. Which explanation is correct?",
          code_snippet: `-- Every INSERT must:
-- 1. Write the new row to the heap / clustered index
-- 2. Update each secondary index's B-tree`,
          choices: [
            { id: "a", label: "Each index requires an additional B-tree update on every write", description: "N indexes means N additional tree-update operations per INSERT/UPDATE/DELETE." },
            { id: "b", label: "Indexes only slow down UPDATE, not INSERT", description: "All write operations — INSERT, UPDATE, DELETE — pay index maintenance cost." },
            { id: "c", label: "Indexes cause table locks during writes", description: "Modern engines use row-level locking; the overhead is CPU and I/O, not table locks." },
            { id: "d", label: "The optimizer disables indexes during bulk loads automatically", description: "Some tools allow this as an option, but it is not automatic behavior." },
          ],
          branches: {
            a: "sq_d2_write_penalty_tradeoff",
            b: "sq_d2_recovery_write_penalty",
            c: "sq_d2_recovery_write_penalty",
            d: "sq_d2_recovery_write_penalty",
          },
          rationale: "The candidate-ready answer: each index is an additional data structure that every write must maintain.",
        },
        sq_d2_write_penalty_tradeoff: {
          id: "sq_d2_write_penalty_tradeoff",
          type: "scenario_choice",
          badge: "Stage 3 trade-off",
          title: "Stage 3 · Low-cardinality anti-pattern",
          prompt: "A column `status` has three values: pending, active, cancelled. Your colleague adds a B-tree index on it. Will the optimizer use it?",
          code_snippet: `-- users table: 10 M rows
-- status: 'pending' (5%), 'active' (80%), 'cancelled' (15%)
-- Query: WHERE status = 'active'`,
          choices: [
            { id: "a", label: "Yes — equality queries always use indexes", description: "The optimizer estimates 8 M rows match. Random I/O for 80% of the table is slower than a full scan." },
            { id: "b", label: "The optimizer may skip the index because selectivity is too low", description: "When a predicate matches a large fraction of rows, a sequential scan is cheaper than random index I/O." },
            { id: "c", label: "Only if the index is a covering index", description: "Covering index helps with column projection, but selectivity remains the core issue." },
            { id: "d", label: "The index helps if the query uses LIMIT", description: "LIMIT reduces output rows but not the cost of evaluating 8 M matching rows via random I/O." },
          ],
          branches: {
            a: "sq_d2_recovery_write_penalty",
            b: "sq_d2_terminal",
            c: "sq_d2_recovery_write_penalty",
            d: "sq_d2_recovery_write_penalty",
          },
          rationale: "Low-cardinality columns are a classic interview gotcha. The optimizer knows when an index scan costs more than a full scan.",
        },
        sq_d2_terminal: {
          id: "sq_d2_terminal",
          type: "scenario_choice",
          badge: "Terminal",
          title: "Revision complete · Indexing strategy locked",
          prompt: "You identified the unindexed FK, chose the correct composite column order, and articulated the write-penalty and low-cardinality anti-patterns.",
          code_snippet: `-- Index decision checklist:
-- 1. Cardinality high? (many distinct values)
-- 2. Query shape: equality first, range second
-- 3. Write frequency acceptable?
-- 4. Can analytics move to a replica/warehouse?`,
          choices: [],
          branches: {},
          terminal: true,
          rationale: "The candidate-ready answer covers three axes: query shape (equality/range), cardinality (high vs low), and write frequency. Composite index column order is the precision detail interviewers test.",
        },
      },
    },
    knowledgeCheck: [],
  },

  "sq-d3": {
    durationLabel: "13 min",
    outcomes: [
      "Explain the JOIN-count and storage trade-off between Star and Snowflake schemas.",
      "Identify when over-normalization of a dimension table harms analytics query performance.",
      "Choose the appropriate Slowly Changing Dimension (SCD) type for a given business requirement.",
    ],
    learnMarkdown: `## Star vs Snowflake: the interview trade-off

Both schemas organize a data warehouse around a central **fact table** and surrounding **dimension tables**. The difference is how much the dimensions are normalized.

## Star Schema

Dimension tables are flat and denormalized. \`dim_product\` stores category, sub-category, and brand directly.

- Fewer JOINs per query — simpler execution plans
- Preferred for high-volume analytics (BigQuery, Redshift)
- Trade-off: data redundancy in dimension tables

## Snowflake Schema

Dimension tables are normalized. \`dim_product\` references \`dim_category\` by FK.

- More JOINs required for the same query
- Reduced storage, easier to update category metadata
- Trade-off: more complex queries, harder for BI tools

## When to use each

Use Star when: query performance is paramount and dimension tables are read-heavy.

Use Snowflake when: dimension attributes change frequently (category renaming) or storage matters.

## Slowly Changing Dimensions (SCD)

- **Type 1**: Overwrite — no history, just current value
- **Type 2**: New row with effective/expiry date — full history preserved
- **Type 3**: Add a previous-value column — one step of history`,
    video: null,
    videoFallbackMarkdown: `## 3-minute schema drill

Draw a 4-table Star Schema on paper: fact_sales in the center, dim_product, dim_customer, dim_date around it.

Then convert dim_product to Snowflake by splitting it into dim_product and dim_category. Write the SQL query for "revenue by category" in both schemas and count the JOINs.`,
    tryGuidance: "Click the over-normalized dimension table, then handle the star vs snowflake performance trade-off and the SCD Type 2 design choice.",
    interviewGraph: {
      initialStageId: "sq_d3_dim_click",
      artifactDimensions: [
        { label: "Schema Shape Recognition", recoveryStageId: "sq_d3_recovery_schema_shape" },
        { label: "Star vs Snowflake Trade-Off", recoveryStageId: "sq_d3_recovery_star_snowflake" },
        { label: "SCD Type Selection", recoveryStageId: "sq_d3_recovery_scd", passLabel: "Dimensional Modeling Clear" },
      ],
      stages: {
        sq_d3_dim_click: {
          id: "sq_d3_dim_click",
          type: "click_target",
          badge: "Stage 1 target",
          title: "Stage 1 · Over-normalized dimension table",
          prompt: "This warehouse query runs slower than expected. EXPLAIN shows multiple nested hash joins. Click the exact JOIN line that represents the over-normalized dimension causing the extra join depth.",
          code_snippet: `SELECT c.category_name, SUM(f.revenue)
FROM fact_sales f
JOIN dim_product p   ON p.product_id   = f.product_id
JOIN dim_category c  ON c.category_id  = p.category_id  -- ds-target:snowflake_join
JOIN dim_sub_cat  sc ON sc.sub_cat_id  = p.sub_cat_id
WHERE f.sale_date >= '2024-01-01'
GROUP BY c.category_name;`,
          validationCopy: {
            snowflake_join: "Correct. dim_category was split out of dim_product (a Snowflake normalization). This adds a JOIN that a Star Schema would not require — the category_name would live directly on dim_product.",
          },
          branches: {
            snowflake_join: "sq_d3_schema_choice",
          },
        },
        sq_d3_recovery_schema_shape: {
          id: "sq_d3_recovery_schema_shape",
          type: "scenario_choice",
          badge: "Recovery 1",
          title: "Recovery · Star vs Snowflake shape",
          prompt: "The interviewer asks you to name the schema type causing the extra JOIN. Which answer is correct?",
          code_snippet: `-- fact_sales -> dim_product -> dim_category
-- Three tables to answer one category question`,
          choices: [
            { id: "a", label: "Snowflake Schema — dimension tables are normalized into sub-dimensions", description: "The category was extracted into its own table, requiring an extra JOIN." },
            { id: "b", label: "Star Schema — dimension tables are fully denormalized", description: "A Star Schema would have category on dim_product directly — no extra JOIN." },
            { id: "c", label: "Third Normal Form — no schema type applies in warehouses", description: "3NF is an OLTP normalization form; warehouse schemas are described as Star or Snowflake." },
            { id: "d", label: "Galaxy Schema — multiple fact tables", description: "A Galaxy/Constellation schema involves multiple fact tables, not normalized dimensions." },
          ],
          branches: {
            a: "sq_d3_schema_choice",
            b: "sq_d3_recovery_schema_shape",
            c: "sq_d3_recovery_schema_shape",
            d: "sq_d3_recovery_schema_shape",
          },
          rationale: "Snowflake schemas normalize dimension attributes into sub-tables at the cost of additional JOINs.",
        },
        sq_d3_schema_choice: {
          id: "sq_d3_schema_choice",
          type: "scenario_choice",
          badge: "Stage 1 choice",
          title: "Stage 1 · Recommend the schema refactor",
          prompt: "The BI team runs 500 category-level aggregation queries per hour. Category names change roughly once a year. Which schema design do you recommend?",
          code_snippet: `-- Current: Snowflake (dim_product -> dim_category)
-- Category name changes: ~2 per year
-- Analytics queries: 500 / hour`,
          choices: [
            { id: "a", label: "Keep Snowflake — updates are easier when category names change", description: "Correct for consistency, but 500 queries per hour is a strong argument for fewer JOINs." },
            { id: "b", label: "Denormalize to Star — embed category on dim_product", description: "Removes the extra JOIN, simplifies 500 queries/hr. Rare updates are an acceptable trade-off." },
            { id: "c", label: "Add a materialized view over the Snowflake schema", description: "Valid workaround but adds maintenance burden; simpler to denormalize the dimension." },
            { id: "d", label: "Use a JSON column to store all category attributes", description: "JSON lookups inside aggregate queries are significantly slower and harder for the optimizer." },
          ],
          branches: {
            a: "sq_d3_recovery_star_snowflake",
            b: "sq_d3_scd_choice",
            c: "sq_d3_scd_choice",
            d: "sq_d3_recovery_star_snowflake",
          },
          rationale: "High query volume + infrequent updates = Star schema is the pragmatic choice.",
        },
        sq_d3_recovery_star_snowflake: {
          id: "sq_d3_recovery_star_snowflake",
          type: "scenario_choice",
          badge: "Recovery 2",
          title: "Recovery · Articulate the performance trade-off",
          prompt: "The interviewer pushes back: why is one extra JOIN such a big deal? Pick the most convincing answer.",
          code_snippet: `-- 500 queries/hr × 200 M rows each
-- Each extra JOIN = additional hash build + probe phase`,
          choices: [
            { id: "a", label: "Each JOIN adds a hash build and probe phase over potentially millions of rows", description: "At 200 M rows per query, each extra JOIN multiplies CPU and memory pressure." },
            { id: "b", label: "JOINs increase network traffic between nodes in distributed systems", description: "True in some systems but not the primary concern for a single extra JOIN in most warehouses." },
            { id: "c", label: "Extra JOINs prevent query caching", description: "Query caching is usually at the result level, not affected by JOIN count structurally." },
            { id: "d", label: "JOINs require table locks in columnar warehouses", description: "Columnar warehouses are read-optimized and do not lock tables for SELECT queries." },
          ],
          branches: {
            a: "sq_d3_scd_choice",
            b: "sq_d3_recovery_star_snowflake",
            c: "sq_d3_recovery_star_snowflake",
            d: "sq_d3_recovery_star_snowflake",
          },
          rationale: "The precise answer: each JOIN requires building and probing a hash table — multiply that by query volume and row count.",
        },
        sq_d3_scd_choice: {
          id: "sq_d3_scd_choice",
          type: "scenario_choice",
          badge: "Stage 2 design",
          title: "Stage 2 · SCD Type: track customer segment history",
          prompt: "A customer's segment can change (free → pro → enterprise). The business wants to know what segment a customer was in AT THE TIME of each sale. Which SCD type do you use?",
          code_snippet: `-- dim_customer: customer_id, name, email, segment
-- Question: was customer 4201 'pro' when they bought in Jan 2024?`,
          choices: [
            { id: "a", label: "SCD Type 1 — overwrite the segment column", description: "Type 1 loses history. You would never know the segment at time of sale." },
            { id: "b", label: "SCD Type 2 — add a new row with effective_date and expiry_date", description: "Preserves full history. The fact table FK points to the correct dimension row for that point in time." },
            { id: "c", label: "SCD Type 3 — add a prev_segment column", description: "Type 3 only tracks one step back. If a customer changed segment 3 times, history is lost." },
            { id: "d", label: "Store all segment changes in a JSON array on the customer row", description: "JSON point-in-time lookups inside JOIN conditions are extremely slow at warehouse scale." },
          ],
          branches: {
            a: "sq_d3_recovery_scd",
            b: "sq_d3_scd_tradeoff",
            c: "sq_d3_recovery_scd",
            d: "sq_d3_recovery_scd",
          },
          rationale: "SCD Type 2 is the canonical answer for point-in-time historical analysis of slowly changing attributes.",
        },
        sq_d3_recovery_scd: {
          id: "sq_d3_recovery_scd",
          type: "scenario_choice",
          badge: "Recovery 3",
          title: "Recovery · SCD types compared",
          prompt: "The interviewer asks you to distinguish the three SCD types. Which mapping is correct?",
          code_snippet: `-- Type ?: overwrite old value (no history)
-- Type ?: new row per change (full history, effective/expiry dates)
-- Type ?: prev_value column (one step of history)`,
          choices: [
            { id: "a", label: "Type 1=overwrite, Type 2=new row, Type 3=prev column", description: "The canonical definition used in all data warehouse literature." },
            { id: "b", label: "Type 1=new row, Type 2=overwrite, Type 3=prev column", description: "Types 1 and 2 are reversed here." },
            { id: "c", label: "Type 2=overwrite, Type 3=new row, Type 1=prev column", description: "All three types are mapped incorrectly." },
            { id: "d", label: "SCD types only apply to fact tables", description: "SCD types apply to dimension tables, not fact tables." },
          ],
          branches: {
            a: "sq_d3_scd_tradeoff",
            b: "sq_d3_recovery_scd",
            c: "sq_d3_recovery_scd",
            d: "sq_d3_recovery_scd",
          },
          rationale: "Type 1/2/3 are vocabulary every data engineering candidate must have ready.",
        },
        sq_d3_scd_tradeoff: {
          id: "sq_d3_scd_tradeoff",
          type: "scenario_choice",
          badge: "Stage 3 trade-off",
          title: "Stage 3 · SCD Type 2 cost",
          prompt: "Your data engineer pushes back: SCD Type 2 multiplies dim_customer rows over time. What is the main operational cost and how do you manage it?",
          code_snippet: `-- dim_customer before SCD Type 2: 5 M rows
-- After 3 years of segment changes: 12 M rows`,
          choices: [
            { id: "a", label: "Row count grows; manage with is_current flag and expiry_date for efficient current-row lookups", description: "Standard mitigation: filter WHERE is_current = TRUE for current-state queries." },
            { id: "b", label: "Use DELETE to remove old segment rows after 6 months", description: "Deleting history defeats the purpose of SCD Type 2." },
            { id: "c", label: "Switch to SCD Type 1 once the table grows too large", description: "Switching loses all historical accuracy permanently." },
            { id: "d", label: "Move dim_customer to a JSON document store", description: "JSON in a document store does not integrate with SQL warehouse JOINs efficiently." },
          ],
          branches: {
            a: "sq_d3_terminal",
            b: "sq_d3_recovery_scd",
            c: "sq_d3_recovery_scd",
            d: "sq_d3_recovery_scd",
          },
          rationale: "The production answer includes both the trade-off (row multiplication) and the management pattern (is_current, expiry_date).",
        },
        sq_d3_terminal: {
          id: "sq_d3_terminal",
          type: "scenario_choice",
          badge: "Terminal",
          title: "Revision complete · Dimensional modeling locked",
          prompt: "You identified the Snowflake over-normalization, articulated the Star vs Snowflake JOIN trade-off, chose SCD Type 2 for point-in-time history, and managed its row-growth cost.",
          code_snippet: `-- Mental model:
-- Star: fewer JOINs, denormalized, fast analytics
-- Snowflake: normalized, storage-efficient, more JOINs
-- SCD Type 2: new row per change, is_current + expiry_date`,
          choices: [],
          branches: {},
          terminal: true,
          rationale: "Interviewers expect: Star vs Snowflake trade-off in one sentence, SCD Type 2 schema pattern, and awareness that row-multiplication is managed with is_current and effective/expiry dates.",
        },
      },
    },
    knowledgeCheck: [],
  },

  "sq-d4": {
    durationLabel: "13 min",
    outcomes: [
      "Identify when an OLAP-style aggregate query is misrouted to an OLTP database and explain the blast radius.",
      "Articulate the row-store vs columnar storage difference in terms of query performance.",
      "Choose between a data warehouse and a data lake for a given analytics architecture scenario.",
    ],
    learnMarkdown: `## OLTP vs OLAP: the core distinction

Interviewers use OLTP/OLAP to test whether you understand storage engine design, not just query syntax.

## OLTP (Online Transaction Processing)

- **Row-oriented storage**: all columns of a row are stored contiguously
- Optimized for fast single-row reads and high-frequency writes
- Normalized schema (3NF) prevents update anomalies
- Examples: PostgreSQL, MySQL, Aurora

## OLAP (Online Analytical Processing)

- **Columnar storage**: each column stored separately on disk
- Optimized for full-column scans and aggregations — reads only the needed columns
- Denormalized star/snowflake schema reduces JOINs
- Examples: BigQuery, Redshift, Snowflake, DuckDB

## Why you cannot run OLAP queries on OLTP databases

A \`SELECT SUM(revenue) FROM orders GROUP BY region\` on a 500 M row OLTP table:

- Locks rows during the scan, blocking incoming writes
- Row store reads all columns to extract only \`revenue\` and \`region\`
- No partition pruning — scans everything

## Data warehouse vs data lake

- **Warehouse**: structured, schema-on-write, SQL query engine built-in, fast aggregations
- **Data lake**: raw files (Parquet, ORC), schema-on-read, flexible, cheaper storage`,
    video: null,
    videoFallbackMarkdown: `## 3-minute OLTP vs OLAP drill

Explain to a non-engineer why you cannot run a "monthly revenue by region" report directly on the production OLTP database.

Then state what you would do instead and name at least one technology you would use for the analytics side.`,
    tryGuidance: "Click the OLAP-style aggregation query running on the OLTP database, then navigate the data warehouse vs data lake architectural choice.",
    interviewGraph: {
      initialStageId: "sq_d4_olap_on_oltp_click",
      artifactDimensions: [
        { label: "OLTP vs OLAP Recognition", recoveryStageId: "sq_d4_recovery_oltp_olap" },
        { label: "Columnar Storage Intuition", recoveryStageId: "sq_d4_recovery_columnar" },
        { label: "Warehouse vs Lake Architecture", recoveryStageId: "sq_d4_recovery_arch", passLabel: "Analytics Architecture Clear" },
      ],
      stages: {
        sq_d4_olap_on_oltp_click: {
          id: "sq_d4_olap_on_oltp_click",
          type: "click_target",
          badge: "Stage 1 target",
          title: "Stage 1 · OLAP aggregate on an OLTP database",
          prompt: "A data analyst is running this query directly on the production PostgreSQL database. It is causing write timeouts for application users. Click the exact line that represents the OLAP-style operation incompatible with an OLTP database.",
          code_snippet: `-- production_db (PostgreSQL, OLTP)
SELECT
  region,
  SUM(amount) AS total_revenue,   -- ds-target:olap_aggregate
  COUNT(DISTINCT customer_id) AS buyers
FROM orders   -- 500 M rows, row-oriented
GROUP BY region;`,
          validationCopy: {
            olap_aggregate: "Correct. SUM + GROUP BY across 500 M rows is an OLAP workload. Running it on a row-oriented OLTP database forces a full table scan, reads every column of every row, and holds shared locks that block writes.",
          },
          branches: {
            olap_aggregate: "sq_d4_storage_choice",
          },
        },
        sq_d4_recovery_oltp_olap: {
          id: "sq_d4_recovery_oltp_olap",
          type: "scenario_choice",
          badge: "Recovery 1",
          title: "Recovery · Why OLAP queries hurt OLTP databases",
          prompt: "The interviewer asks you to explain the specific mechanism causing write timeouts. Which answer is most precise?",
          code_snippet: `-- PostgreSQL row store: each row = all columns together on disk
-- Full scan of 500 M rows = 500 M row reads`,
          choices: [
            { id: "a", label: "The aggregate holds a shared scan lock, consuming IOPS and blocking vacuum and autovacuum", description: "Full table scans in PostgreSQL can interfere with autovacuum and consume buffer pool, crowding out OLTP working set." },
            { id: "b", label: "GROUP BY requires a table-level exclusive lock", description: "SELECT GROUP BY does not take an exclusive lock — it takes a weak shared lock, but the scan duration is the issue." },
            { id: "c", label: "SUM is not supported in PostgreSQL", description: "SUM is fully supported; the problem is the workload mismatch, not missing functionality." },
            { id: "d", label: "The query uses too many CPU cores", description: "CPU pressure is a symptom, not the primary architectural mismatch explanation." },
          ],
          branches: {
            a: "sq_d4_storage_choice",
            b: "sq_d4_recovery_oltp_olap",
            c: "sq_d4_recovery_oltp_olap",
            d: "sq_d4_recovery_oltp_olap",
          },
          rationale: "The precise mechanism: long scans hold shared locks, consume the buffer pool, and compete with OLTP write I/O.",
        },
        sq_d4_storage_choice: {
          id: "sq_d4_storage_choice",
          type: "scenario_choice",
          badge: "Stage 1 choice",
          title: "Stage 1 · Why columnar storage wins for SUM(revenue)",
          prompt: "The interviewer asks why a columnar warehouse runs this query orders of magnitude faster. Which answer is technically correct?",
          code_snippet: `-- Query only needs: amount, region
-- orders table has 20 columns
-- Row store: reads all 20 columns for each of 500 M rows
-- Column store: reads only 2 column files`,
          choices: [
            { id: "a", label: "Columnar storage reads only the needed column files, skipping all other columns", description: "For SUM(amount) GROUP BY region, only 2 of 20 column files are read from disk." },
            { id: "b", label: "Columnar storage keeps the entire table in memory", description: "Columnar stores do use compression and caching, but do not hold 500 M rows in RAM." },
            { id: "c", label: "Columnar storage avoids GROUP BY entirely", description: "GROUP BY still executes — the gain is in I/O reduction, not avoiding aggregation." },
            { id: "d", label: "Columnar storage uses hash indexes on every column", description: "Columnar stores primarily use partition pruning and compression, not per-column hash indexes." },
          ],
          branches: {
            a: "sq_d4_arch_choice",
            b: "sq_d4_recovery_columnar",
            c: "sq_d4_recovery_columnar",
            d: "sq_d4_recovery_columnar",
          },
          rationale: "The key insight: columnar I/O is proportional to columns selected, not total columns in the table.",
        },
        sq_d4_recovery_columnar: {
          id: "sq_d4_recovery_columnar",
          type: "scenario_choice",
          badge: "Recovery 2",
          title: "Recovery · Columnar I/O model",
          prompt: "The interviewer simplifies: a table has 30 columns and 1 B rows. The query aggregates 2 columns. How much data does each storage model read?",
          code_snippet: `-- Row store:   reads all 30 columns × 1 B rows
-- Column store: reads only 2 column files × 1 B rows`,
          choices: [
            { id: "a", label: "Row store: 30× more I/O than needed; Column store: only 2/30 of the data", description: "Columnar provides 15× I/O reduction for this query shape." },
            { id: "b", label: "Both read the same amount of data from disk", description: "Row stores cannot skip columns mid-row without reading and discarding them." },
            { id: "c", label: "Columnar is slower because it must reassemble rows for output", description: "Aggregates do not need to reassemble full rows — only the aggregate columns are needed." },
            { id: "d", label: "Row store is faster because it reads sequential blocks", description: "Sequential I/O helps row stores, but reading 28 unneeded columns still wastes bandwidth." },
          ],
          branches: {
            a: "sq_d4_arch_choice",
            b: "sq_d4_recovery_columnar",
            c: "sq_d4_recovery_columnar",
            d: "sq_d4_recovery_columnar",
          },
          rationale: "The 2/30 fraction is the interview-ready way to illustrate columnar I/O savings.",
        },
        sq_d4_arch_choice: {
          id: "sq_d4_arch_choice",
          type: "scenario_choice",
          badge: "Stage 2 architecture",
          title: "Stage 2 · Data warehouse vs data lake",
          prompt: "The company wants to run ad-hoc SQL analytics on structured sales data AND store raw clickstream event logs for future ML feature engineering. Which architecture fits best?",
          code_snippet: `-- Requirement A: fast ad-hoc SQL on structured sales data
-- Requirement B: cheap storage for raw JSON clickstream logs
-- Requirement C: ML team may run custom Python jobs on logs`,
          choices: [
            { id: "a", label: "Data warehouse only — load everything into BigQuery/Redshift", description: "Loading raw JSON clickstream into a warehouse is expensive and inflexible for ML pipelines." },
            { id: "b", label: "Data lake only — store everything as Parquet files in S3/GCS", description: "A lake handles raw storage well, but ad-hoc SQL on structured data lacks the query engine layer." },
            { id: "c", label: "Lakehouse — structured data in a warehouse layer, raw data in object storage with a query engine overlay (e.g., Iceberg + Athena)", description: "Lakehouse combines warehouse SQL speed for structured data with lake flexibility for raw files." },
            { id: "d", label: "Replicate everything into the OLTP database and add more indexes", description: "This is the anti-pattern we already identified — OLAP workloads do not belong on OLTP systems." },
          ],
          branches: {
            a: "sq_d4_recovery_arch",
            b: "sq_d4_recovery_arch",
            c: "sq_d4_arch_tradeoff",
            d: "sq_d4_recovery_arch",
          },
          rationale: "The lakehouse pattern (warehouse + data lake) is the modern answer to mixed structured/unstructured analytics requirements.",
        },
        sq_d4_recovery_arch: {
          id: "sq_d4_recovery_arch",
          type: "scenario_choice",
          badge: "Recovery 3",
          title: "Recovery · Warehouse vs lake distinction",
          prompt: "The interviewer asks you to define the key difference between a data warehouse and a data lake in one axis. Which framing is most accurate?",
          code_snippet: `-- Warehouse: schema-on-write, structured, SQL engine built-in
-- Lake: schema-on-read, raw files, flexible format`,
          choices: [
            { id: "a", label: "Warehouse: schema-on-write, structured; Lake: schema-on-read, raw files", description: "The canonical distinction. Warehouses enforce schema at load time; lakes store raw data and apply schema at query time." },
            { id: "b", label: "Warehouse: slower; Lake: always faster", description: "Warehouses are often faster for structured SQL aggregations; lakes win on raw storage cost and flexibility." },
            { id: "c", label: "Warehouse: only for transactional data; Lake: only for analytics", description: "Both are analytics-oriented; the distinction is schema enforcement and storage cost, not use case exclusivity." },
            { id: "d", label: "Lakes use SQL; Warehouses use custom query languages", description: "Modern warehouses (BigQuery, Redshift) and lake query engines (Athena, Spark SQL) both use standard SQL." },
          ],
          branches: {
            a: "sq_d4_arch_tradeoff",
            b: "sq_d4_recovery_arch",
            c: "sq_d4_recovery_arch",
            d: "sq_d4_recovery_arch",
          },
          rationale: "Schema-on-write vs schema-on-read is the single most useful distinguishing axis for interviews.",
        },
        sq_d4_arch_tradeoff: {
          id: "sq_d4_arch_tradeoff",
          type: "scenario_choice",
          badge: "Stage 3 trade-off",
          title: "Stage 3 · When to prefer a data lake over a warehouse",
          prompt: "The ML team says they need to retrain models on 3 years of raw event logs in custom formats. Running this workload through the SQL warehouse is slow and expensive. What do you recommend?",
          code_snippet: `-- 3 years × 500 GB/day = ~550 TB raw event logs
-- ML training: Spark / PyTorch jobs on raw Parquet
-- Analytics: daily revenue reports via SQL`,
          choices: [
            { id: "a", label: "Store raw logs in object storage (S3/GCS) as Parquet, use a warehouse only for curated/aggregated structured data", description: "Object storage is ~10× cheaper than warehouse storage. ML jobs run directly on Parquet without loading into a warehouse." },
            { id: "b", label: "Load all 550 TB into the SQL warehouse and write ML jobs in SQL UDFs", description: "SQL UDFs cannot replace PyTorch/Spark training pipelines, and 550 TB in a warehouse is very expensive." },
            { id: "c", label: "Delete logs older than 6 months to manage storage costs", description: "Deleting training data destroys ML reproducibility and removes business audit history." },
            { id: "d", label: "Compress logs in the OLTP database using JSONB columns", description: "JSONB in PostgreSQL is unsuitable for 550 TB of event data or Spark training jobs." },
          ],
          branches: {
            a: "sq_d4_terminal",
            b: "sq_d4_recovery_arch",
            c: "sq_d4_recovery_arch",
            d: "sq_d4_recovery_arch",
          },
          rationale: "The production answer separates hot structured data (warehouse) from cold raw data (object storage), cutting storage cost and enabling ML workflows.",
        },
        sq_d4_terminal: {
          id: "sq_d4_terminal",
          type: "scenario_choice",
          badge: "Terminal",
          title: "Revision complete · OLTP vs OLAP architecture locked",
          prompt: "You identified the OLAP anti-pattern on an OLTP database, explained columnar I/O savings, and chose the correct lakehouse architecture for mixed workloads.",
          code_snippet: `-- Mental model:
-- OLTP: row store, fast writes, normalized, short transactions
-- OLAP: columnar, fast reads, denormalized, long scans
-- Warehouse: schema-on-write, SQL, structured analytics
-- Lake: schema-on-read, raw files, cheap storage, ML pipelines`,
          choices: [],
          branches: {},
          terminal: true,
          rationale: "The candidate-ready answer covers: row vs columnar I/O model, why OLAP on OLTP causes write contention, and warehouse vs lake as a schema-enforcement distinction — not a speed distinction.",
        },
      },
    },
    knowledgeCheck: [],
  },

  // ── injected from stat_foundations_lessons.js ──
  "st-f1": {
  durationLabel: "15 min",
  outcomes: [
    "Distinguish mean, median, and mode and explain when each is the appropriate summary statistic",
    "Identify how outliers distort the mean while leaving the median stable",
    "Choose the right central tendency measure given a real data distribution",
  ],
  learnMarkdown: `## Mean, Median, Mode — and When Each Actually Matters

Every dataset has a "center," but which center you choose to report can completely change the story you're telling. This is one of the most commonly misused concepts in data communication — and interviewers know it.

## The Three Measures

**Mean (arithmetic average)** — Sum all values, divide by count. Sensitive to every value in the dataset, which makes it mathematically useful (variance, regression, and most ML algorithms depend on it) but fragile in the presence of outliers.

**Median** — Sort the values; take the middle one (or average of the two middle values for even-length datasets). It is robust: a single extreme value cannot move the median by more than one rank position.

**Mode** — The most frequently occurring value. Most useful for categorical data (e.g., "what is the most common subscription tier?") and discrete distributions. For continuous data, mode is often not meaningful or unique.

## The Salary Trap

Imagine a nine-person startup: eight engineers earn between $42k–$85k, and the CEO earns $980k. The **mean salary** is roughly $170k — higher than any individual engineer's pay. The **median salary** is ~$58k, which actually reflects what a typical person at the company earns.

Reporting the mean here isn't technically wrong — it's just misleading. A good data scientist knows to ask: "What question am I actually answering?"

## Symmetric vs Skewed Distributions

For a **symmetric distribution** (think bell curve), mean and median are nearly equal — either is a fine summary.

For a **right-skewed distribution** (income, home prices, social media follower counts), the mean gets pulled upward by the long tail. The median stays near the bulk of the data and is the honest summary statistic.

\`\`\`
Right-skewed:  ▓▓▓▓▓▓▓▓▓▓░░░░░░░       ← most data here
               ↑ median   ↑ mean        ← mean dragged right
\`\`\`

## Mode in Practice

Mode shines for categorical variables: "which product category is most purchased?", "which error type fires most often?". For numeric data, it's most useful in **bimodal distributions** — when you see two peaks, the mode reveals that your "population" might actually be two sub-populations (e.g., two user segments with different behavior patterns).

## Quick Decision Rule

1. **Categorical data** → Mode
2. **Skewed distribution or outliers present** → Median
3. **Symmetric, no outliers, need algebraic properties** → Mean
4. **Reporting to executives** → Median for typical-case framing; mean if you're computing budgets (mean × count = total)

## Interview hook (answer like a senior)

> "I always ask what question the metric is answering. Mean annual salary answers 'what is the total payroll divided by headcount' — useful for budgeting. Median annual salary answers 'what does a typical employee earn' — useful for recruiting messaging. They're both correct statistics for different questions. The mistake is using mean as if it answers the typical-employee question when the distribution is right-skewed."
`,
  video: null,
  videoFallbackMarkdown: `## Video not yet available

Work through the interactive **Mean/Median/Mode Explorer** below. Toggle the CEO outlier in and out of the salary dataset and watch the three statistics update in real time. Pay attention to which measure stays stable and which one jumps — that intuition is exactly what interviewers test.`,
  tryGuidance: "Toggle the CEO outlier on and off. Notice how the mean jumps from ~$57k to over $150k while the median barely moves. Then switch to the 'Symmetric vs Skewed' tab and compare how close mean and median are when the distribution is balanced. Finally, open 'When to Use Which' and read through the decision flowchart — try to commit the three rules to memory.",
  interviewGraph: {
    initialStageId: "s1_click_mean_misuse",
    artifactDimensions: [
      { label: "Outlier robustness", recoveryStageId: "r1_outlier_robustness" },
      { label: "Choosing the right measure", recoveryStageId: "r2_measure_choice", passLabel: "Correct measure selected" },
    ],
    stages: {
      s1_click_mean_misuse: {
        id: "s1_click_mean_misuse",
        type: "click_target",
        badge: "Stage 1",
        title: "Stage 1 · Spot the misleading statistic",
        prompt: "An analyst is summarizing employee compensation for a company with 8 engineers ($42k–$85k) and one CEO ($980k). Click the line in the report that contains the misleading summary statistic.",
        code_snippet: `Company Compensation Summary — FY2024
======================================
Headcount: 9 employees
Total payroll: $1,534,000
Median salary: $58,000
Average (mean) salary: $170,444  -- ds-target:mean_misleading
Salary range: $42,000 – $980,000`,
        validationCopy: {
          mean_misleading: "Correct. The mean salary of $170k is technically accurate but misleading — it's higher than every engineer's pay. For a right-skewed distribution like this, the median ($58k) is the honest summary of what a typical employee earns.",
        },
        branches: { mean_misleading: "s2_ceo_joins" },
      },
      s2_ceo_joins: {
        id: "s2_ceo_joins",
        type: "scenario_choice",
        badge: "Stage 2",
        title: "Stage 2 · CEO joins the dataset",
        prompt: "The company hires a CEO at $2.4M. The mean jumps from $170k to $438k. The median moves from $58k to $62k. A journalist asks: 'What is the typical employee's salary?' Which statistic do you give them?",
        code_snippet: `Before CEO hire:  mean=$170k  median=$58k
After CEO hire:   mean=$438k  median=$62k
                  ^^^^^^^^           ^^^^
                  +157% change       +7% change`,
        choices: [
          { id: "a", label: "Median ($62k)", description: "Report the median — it accurately reflects what most employees earn and is not distorted by the CEO's extreme salary." },
          { id: "b", label: "Mean ($438k)", description: "Report the mean — it is the standard average and the most commonly understood statistic." },
          { id: "c", label: "Mode", description: "Report the mode — it shows the most common salary tier." },
          { id: "d", label: "The range ($42k–$2.4M)", description: "Report the range — it gives the full picture of compensation spread." },
        ],
        branches: { a: "s3_mode_meaning", b: "r1_outlier_robustness", c: "r2_measure_choice", d: "r2_measure_choice" },
        rationale: "The median is correct here. When a distribution is right-skewed due to an extreme outlier, the median is a robust measure of central tendency that reflects the typical case. The mean is distorted upward by the CEO's salary and would misrepresent what a 'typical' employee earns. The range and mode don't answer the 'typical salary' question.",
      },
      s3_mode_meaning: {
        id: "s3_mode_meaning",
        type: "scenario_choice",
        badge: "Stage 3",
        title: "Stage 3 · Interpreting the mode",
        prompt: "A salary dataset shows that the mode is $45,000, appearing 4 times out of 50 employees. A colleague says 'the mode is useless for salary data — just ignore it.' How do you respond?",
        code_snippet: `salary_counts = {
  45000: 4,   # mode
  52000: 3,
  58000: 3,
  63000: 2,
  71000: 1,
  ...
}`,
        choices: [
          { id: "a", label: "Partially agree — mode has limited precision for continuous data, but $45k appearing 4× may reveal a salary band or job grade worth investigating", description: "Nuanced: acknowledge the limitation but surface the potential signal." },
          { id: "b", label: "Agree — mode is only for categorical data and should never be used for salary", description: "Too absolute — mode can be a useful signal even in numeric data." },
          { id: "c", label: "Disagree — mode is the most important statistic because it shows the most common value", description: "Overclaims — mode is one tool among many, not inherently most important." },
          { id: "d", label: "Agree — with 50 employees and many unique salaries, the mode is statistically meaningless", description: "Mode with only 4/50 occurrences is weak, but 'meaningless' is too strong." },
        ],
        branches: { a: "s4_terminal", b: "r2_measure_choice", c: "r2_measure_choice", d: "r2_measure_choice" },
        rationale: "Answer A is correct. Mode is generally weak for continuous data — tied modes or very low frequency modes are unreliable. But a repeated value in salary data often signals a formal salary band or job-level pay grade. A good analyst investigates the signal rather than dismissing it entirely.",
      },
      r1_outlier_robustness: {
        id: "r1_outlier_robustness",
        type: "scenario_choice",
        badge: "Recovery 1",
        title: "Recovery · Outlier robustness",
        prompt: "True or false: adding a single extreme outlier to a 50-person salary dataset will change the median by at most one rank position, regardless of how extreme the outlier is.",
        code_snippet: `dataset (n=50): sorted values v[0] ... v[49]
median = (v[24] + v[25]) / 2

After adding outlier v[50]=10,000,000:
sorted (n=51): v[0] ... v[49], v[50]
new median = v[25]   # shifted by exactly 1 position`,
        choices: [
          { id: "a", label: "True — median can only shift by one rank when a single value is added", description: "Correct — this is exactly why median is called resistant to outliers." },
          { id: "b", label: "False — a large enough outlier will eventually drag the median upward significantly", description: "Incorrect — the median's position is determined by rank, not magnitude." },
          { id: "c", label: "It depends on whether the outlier is above or below the median", description: "Partially right that direction matters, but the magnitude of the outlier never matters for the median." },
          { id: "d", label: "False — the median can shift multiple positions when an outlier is extreme", description: "Incorrect — only one observation is being added, so rank can shift by at most one." },
        ],
        branches: { a: "s3_mode_meaning", b: "r1_outlier_robustness", c: "r1_outlier_robustness", d: "r1_outlier_robustness" },
        rationale: "True. The median is determined purely by rank order, not values. Adding one data point shifts the median's position by at most one rank — no matter how large or small the added value is. This rank-based robustness is why median is preferred for skewed or outlier-prone distributions.",
      },
      r2_measure_choice: {
        id: "r2_measure_choice",
        type: "scenario_choice",
        badge: "Recovery 2",
        title: "Recovery · Choosing the right measure",
        prompt: "A product manager says: 'Our average session duration is 4.2 minutes.' You pull the data and find the distribution is heavily right-skewed (most users leave in under 1 minute; a few power users stay for 30+ minutes). What do you tell the PM?",
        code_snippet: `session_duration distribution (n=10,000):
  P10:  0.3 min
  P25:  0.7 min
  P50:  1.1 min   ← median
  P75:  3.2 min
  P90:  9.8 min
  mean: 4.2 min   ← pulled up by power users`,
        choices: [
          { id: "a", label: "Report the median (1.1 min) as the typical session duration; the mean is inflated by power-user outliers", description: "Correct — for a right-skewed metric, median is the honest 'typical user' summary." },
          { id: "b", label: "The mean is correct — 4.2 minutes is what matters for infrastructure planning", description: "Mean × count = total server-minutes, so mean is useful for capacity, but it does NOT represent the typical user." },
          { id: "c", label: "Use mode — the most common session duration tells you the most about user behavior", description: "Mode is useful for discrete counts, but for a continuous metric like duration, median is more informative." },
          { id: "d", label: "Report both mean and median and let the PM decide", description: "Reporting both is good practice, but a data scientist should also explain which one answers the PM's actual question." },
        ],
        branches: { a: "s3_mode_meaning", b: "r2_measure_choice", c: "r2_measure_choice", d: "r2_measure_choice" },
        rationale: "Answer A is correct. When a metric is right-skewed (engagement time, revenue, LTV), the median is the honest 'typical user' summary. The mean is useful for resource-planning (mean × users = total load) but misleads when describing what a typical user experiences. Always match the statistic to the question being asked.",
      },
      s4_terminal: {
        id: "s4_terminal",
        type: "scenario_choice",
        badge: "Terminal",
        title: "Revision complete · Central tendency mastery check",
        terminal: true,
        prompt: "Final check: for a right-skewed income distribution (e.g., US household income), which single measure best minimizes the influence of extreme high-income values when describing the 'typical' household?",
        code_snippet: `US Household Income (approximate):
  mean:    ~$102,000   ← dragged up by top earners
  median:  ~$70,800    ← middle of the distribution
  mode:    ~$25,000    ← most common bracket (lowest)`,
        choices: [
          { id: "a", label: "Median — it is robust to outliers and reflects the household at the 50th percentile", description: "Correct. Median is unaffected by the magnitude of extreme values." },
          { id: "b", label: "Mean — it incorporates all the data and is the most statistically powerful", description: "Mean is powerful but distorted by right-skew. It represents 'total income / households', not the typical household." },
          { id: "c", label: "Mode — the most common income is the most representative", description: "For continuous income data, mode lands in the lowest bracket and understates what most middle-class households earn." },
        ],
        branches: { a: "s4_terminal", b: "s4_terminal", c: "s4_terminal" },
        rationale: "Median is correct. For right-skewed distributions like income, the top earners pull the mean far above what most households experience. The median — the income level at which exactly half of households earn more and half earn less — is the honest summary of typical household income. This is why the U.S. Census and most economists report median household income, not mean.",
      },
    },
  },
  knowledgeCheck: [
    {
      question: "A startup has 9 employees. Eight engineers earn $45k–$80k; the CEO earns $1.2M. Which measure best represents the typical employee's salary?",
      options: [
        "Median — it is robust to the CEO's extreme salary",
        "Mean — it uses all the data and is more statistically powerful",
        "Mode — it shows the most common salary",
      ],
      correctIndex: 0,
      explanation: "Median is correct. The CEO's $1.2M salary is an extreme outlier that pulls the mean far above what any engineer earns. The median, by contrast, is determined by rank order and barely changes when one extreme value is added. For right-skewed distributions, the median is the honest 'typical' summary.",
    },
    {
      question: "You have a bimodal distribution of session durations — a large cluster at 1–2 minutes and another cluster at 10–12 minutes. Which statistic would reveal that there are two distinct user behavior patterns?",
      options: [
        "Mode — the two peaks each correspond to a mode, revealing the bimodal structure",
        "Mean — it gives the average session duration across all users",
        "Median — it identifies the middle value of all sessions",
      ],
      correctIndex: 0,
      explanation: "Mode (or more precisely, identifying the two modes of the distribution) reveals the bimodal structure. The mean would land somewhere between the two clusters (~5–7 min) and not represent either group well. The median would similarly land in the gap between clusters. Bimodal distributions are a signal that you should segment your analysis — you likely have two different user populations.",
    },
  ],
},

"st-f2": {
  durationLabel: "18 min",
  outcomes: [
    "Compute variance and standard deviation for both populations and samples, and explain why sample variance uses n-1",
    "Interpret standard deviation as a measure of spread and use it to describe distribution shape",
    "Apply standard deviation to real problems involving risk, consistency, and quality control",
  ],
  learnMarkdown: `## Variance, Standard Deviation & The Shape of Data

If central tendency tells you where a dataset lives, **spread** tells you how much the data varies around that center. Two datasets can have identical means but wildly different behavior — and standard deviation is the number that captures that difference.

## Variance: The Average Squared Deviation

Variance measures how far, on average, each point is from the mean. We square the deviations for two reasons: to eliminate sign (positive and negative deviations cancel if not squared) and to penalize large deviations more heavily.

\`\`\`
Population variance:  σ² = Σ(xᵢ - μ)² / N
Sample variance:      s² = Σ(xᵢ - x̄)² / (n-1)
\`\`\`

The units of variance are the square of the original units (e.g., dollars²), which is hard to interpret directly. That's why we usually report **standard deviation** (σ or s), the square root of variance — it's in the same units as the data.

## Why n-1? Bessel's Correction

When estimating the variance of a population from a sample, dividing by n underestimates the true variance. Intuitively: a sample tends to cluster around its own mean more than it clusters around the true population mean. Dividing by **n-1** inflates the estimate just enough to make it unbiased.

In practice: use n-1 whenever you have a sample and want to estimate the population variance (which is almost always). Use n only if you truly have the full population.

## Standard Deviation as a Ruler

Standard deviation gives you a natural unit for measuring "how unusual" a data point is.

- A value 1σ from the mean is typical (in a normal distribution, ~68% of data falls within ±1σ)
- A value 2σ from the mean is noteworthy (~95% of data within ±2σ)
- A value 3σ from the mean is rare (~99.7% within ±3σ)

This "68-95-99.7 rule" is the foundation for z-scores, outlier detection, and control charts.

## Reading Distribution Shape

**Low σ**: Data clusters tightly around the mean → consistent, predictable
**High σ**: Data is spread widely → high variability, less predictable

\`\`\`
Model A (σ=2):   ████████████████  tight cluster
Model B (σ=8):   ████░░░░░░░░░░░░████  wide spread
                 Same mean, very different risk
\`\`\`

For risk analysis, you need both the mean (expected value) and σ (uncertainty). A stock returning 5% mean with σ=20% is far riskier than a bond returning 3% with σ=2%.

## Coefficient of Variation: Relative Spread

When comparing spread across datasets with different scales, use the **coefficient of variation**: CV = σ / μ. This normalizes spread relative to the mean, making cross-scale comparisons fair.

## When Std Dev Misleads

Standard deviation assumes a roughly symmetric distribution. For heavily skewed data, IQR is a more robust measure of spread (just as median beats mean for center). Always plot your data before summarizing it.

## Interview hook (answer like a senior)

> "I think of standard deviation as the 'typical error' around the mean. When I see σ, I immediately ask: is this spread acceptable for my use case? For a manufacturing process, σ drives defect rates. For a recommendation model, σ in predicted scores affects ranking stability. I always report mean and σ together — one without the other is incomplete."
`,
  video: null,
  videoFallbackMarkdown: `## Video not yet available

Use the **Normal Distribution Visualizer** below to explore how changing standard deviation compresses or expands the bell curve. Drag the σ slider and notice how the curve height changes to maintain the same total area — that geometric fact is the foundation of probability.`,
  tryGuidance: "Start by setting σ to a small value and observe the tall, tight bell curve — this represents a consistent process. Then increase σ and watch the curve flatten and widen. Notice how the 68-95-99.7 rule markers move with σ. Finally, try to remember the key insight: two distributions with the same mean but different σ are fundamentally different in terms of risk and predictability.",
  interviewGraph: {
    initialStageId: "s1_click_denominator",
    artifactDimensions: [
      { label: "Bessel's correction (n vs n-1)", recoveryStageId: "r1_bessels" },
      { label: "Interpreting spread in context", recoveryStageId: "r2_spread_context", passLabel: "Applied σ correctly" },
    ],
    stages: {
      s1_click_denominator: {
        id: "s1_click_denominator",
        type: "click_target",
        badge: "Stage 1",
        title: "Stage 1 · Spot the variance formula bug",
        prompt: "A junior analyst wrote a function to compute sample variance. Click the line that contains the statistical error.",
        code_snippet: `def sample_variance(data):
    n = len(data)
    mean = sum(data) / n
    squared_diffs = [(x - mean)**2 for x in data]
    return sum(squared_diffs) / n   -- ds-target:wrong_denom`,
        validationCopy: {
          wrong_denom: "Correct. Sample variance must divide by (n-1), not n. Dividing by n produces a biased estimator that systematically underestimates the population variance. This is called Bessel's correction — the fix is `sum(squared_diffs) / (n - 1)`.",
        },
        branches: { wrong_denom: "s2_consistency" },
      },
      s2_consistency: {
        id: "s2_consistency",
        type: "scenario_choice",
        badge: "Stage 2",
        title: "Stage 2 · Comparing model consistency",
        prompt: "You're evaluating two recommendation models. Both achieve a mean RMSE of 0.42 across 30 evaluation runs. Model A has σ=0.02; Model B has σ=0.11. Which model do you prefer for production and why?",
        code_snippet: `Model A:  mean_RMSE=0.42  σ=0.02  min=0.39  max=0.46
Model B:  mean_RMSE=0.42  σ=0.11  min=0.21  max=0.63`,
        choices: [
          { id: "a", label: "Model A — lower σ means more consistent, predictable performance in production", description: "Correct. Consistent performance is critical for production systems." },
          { id: "b", label: "Model B — its lower minimum (0.21) shows it can be better than Model A at its best", description: "Best-case performance is not what you deploy against — you need to understand the distribution of outcomes." },
          { id: "c", label: "Either — they have the same mean RMSE so they are equivalent", description: "Wrong. Same mean, very different variance. Model B could perform 3× worse than Model A on a bad run." },
          { id: "d", label: "Model B — higher variance means it's exploring more of the solution space", description: "Higher variance in eval metrics is instability, not exploration. That framing applies to training, not evaluation." },
        ],
        branches: { a: "s3_bessels_why", b: "r2_spread_context", c: "r2_spread_context", d: "r2_spread_context" },
        rationale: "Model A is correct. In production, you care about the distribution of outcomes, not just the mean. Model B's σ=0.11 means its RMSE could plausibly hit 0.63 on a bad day (mean + ~2σ). Model A's tight σ=0.02 means you can predict its behavior reliably. All else equal, consistent performance beats high-variance performance.",
      },
      s3_bessels_why: {
        id: "s3_bessels_why",
        type: "scenario_choice",
        badge: "Stage 3",
        title: "Stage 3 · Why n-1?",
        prompt: "An interviewer asks: 'Why do we divide by n-1 instead of n when computing sample variance? Give me the intuition.' Which answer is best?",
        code_snippet: `# Demonstrating the bias
import numpy as np

population = np.random.normal(0, 10, size=10000)
pop_var = np.var(population)              # true ≈ 100

biased = []
unbiased = []
for _ in range(5000):
    sample = np.random.choice(population, 30)
    biased.append(np.var(sample, ddof=0))     # /n
    unbiased.append(np.var(sample, ddof=1))   # /n-1

# biased mean ≈ 97  ← underestimates
# unbiased mean ≈ 100 ← hits the target`,
        choices: [
          { id: "a", label: "The sample clusters around its own mean, which is closer to the data than the true population mean — dividing by n-1 corrects for this underestimation", description: "Correct — the lost degree of freedom accounts for using x̄ (estimated from the data) instead of μ (the true mean)." },
          { id: "b", label: "n-1 is used to make the formula symmetrical and aesthetically cleaner", description: "There is no aesthetic motivation — it is a statistical correction for bias." },
          { id: "c", label: "n-1 gives a larger denominator, which makes the variance estimate more conservative and safe", description: "Partially right (it does increase the estimate), but the reason is unbiasedness, not conservatism." },
          { id: "d", label: "It doesn't matter for large n — the difference between n and n-1 is negligible", description: "For large n this is practically true, but it's not 'why' we use n-1 — the statistical reason is bias correction regardless of sample size." },
        ],
        branches: { a: "s4_terminal", b: "r1_bessels", c: "r1_bessels", d: "r1_bessels" },
        rationale: "Answer A is the best explanation. When we estimate variance using the sample mean x̄ (instead of the true μ), the deviations (xᵢ - x̄) are systematically smaller than (xᵢ - μ) would be — because x̄ is computed from the same data and minimizes those deviations. This 'uses up' one degree of freedom. Dividing by n-1 corrects for this underestimation, producing an unbiased estimator.",
      },
      r1_bessels: {
        id: "r1_bessels",
        type: "scenario_choice",
        badge: "Recovery 1",
        title: "Recovery · Bessel's correction",
        prompt: "You compute sample variance of 30 data points using /n. The result is 144. What is the unbiased sample variance (using /n-1)?",
        code_snippet: `biased_var   = sum_sq_diffs / 30    = 144.0
unbiased_var = sum_sq_diffs / 29    = ?

sum_sq_diffs = 144.0 × 30 = 4320`,
        choices: [
          { id: "a", label: "148.97 (= 4320 / 29)", description: "Correct. Multiply back to get the sum of squared deviations, then divide by n-1=29." },
          { id: "b", label: "140.0 (= 144 × 29/30)", description: "Incorrect — you need to divide by 29, not multiply by 29/30." },
          { id: "c", label: "144.0 — the variance does not change because the data is the same", description: "The denominator changes, so the variance estimate changes. Only the sum of squared deviations is fixed." },
          { id: "d", label: "288.0 (= 144 × 2)", description: "No mathematical basis for doubling the variance." },
        ],
        branches: { a: "s3_bessels_why", b: "r1_bessels", c: "r1_bessels", d: "r1_bessels" },
        rationale: "Correct answer is 148.97. The sum of squared deviations is 144 × 30 = 4320. Dividing by n-1 = 29 gives 4320/29 ≈ 148.97. The unbiased sample variance is always slightly larger than the biased version, and the difference shrinks as n grows.",
      },
      r2_spread_context: {
        id: "r2_spread_context",
        type: "scenario_choice",
        badge: "Recovery 2",
        title: "Recovery · Interpreting spread",
        prompt: "A stock has mean annual return 5% and σ=20%. A bond has mean annual return 3% and σ=2%. Which asset is riskier, and how do you quantify that risk?",
        code_snippet: `Stock:  μ=5%  σ=20%  → CV = σ/μ = 4.0
Bond:   μ=3%  σ=2%   → CV = σ/μ = 0.67

# Within 1 year, stock could plausibly return:
# μ ± 2σ = 5% ± 40%  →  range: -35% to +45%`,
        choices: [
          { id: "a", label: "Stock — its σ=20% means annual returns could plausibly swing ±40% (2σ), while the bond's σ=2% produces ±4% swings", description: "Correct. Higher σ = higher volatility = higher risk, despite the higher mean return." },
          { id: "b", label: "Bond — its lower mean return means less reward, and less reward implies less risk", description: "Incorrect. Risk is measured by variance/volatility, not by return level. Lower return ≠ lower risk in general." },
          { id: "c", label: "They are equally risky — risk depends only on the mean return", description: "Incorrect. Risk is about uncertainty (variance), not expected value. The stock is dramatically riskier." },
          { id: "d", label: "Stock — its higher mean return proves it is riskier since return and risk are always correlated", description: "In this example the stock IS riskier, but saying 'higher return proves higher risk' is a coincidence not a rule." },
        ],
        branches: { a: "s3_bessels_why", b: "r2_spread_context", c: "r2_spread_context", d: "r2_spread_context" },
        rationale: "The stock is riskier. Standard deviation directly quantifies price volatility — the stock's σ=20% means a return 2 standard deviations below the mean is 5% - 40% = -35%. That's a potential 35% loss in a year. The bond's ±4% swing is far less uncertain. Coefficient of variation (CV = σ/μ) lets you compare relative risk: stock CV=4.0 vs bond CV=0.67.",
      },
      s4_terminal: {
        id: "s4_terminal",
        type: "scenario_choice",
        badge: "Terminal",
        title: "Revision complete · Variance and std dev mastery",
        terminal: true,
        prompt: "Final check: a manufacturing process has spec limits of 10.0 ± 0.5 units. The process produces parts with mean=10.0 and σ=0.25. Approximately what percentage of parts will be outside the spec limits?",
        code_snippet: `Spec limits: [9.5, 10.5]
Process:     μ=10.0, σ=0.25

Distance to spec limit = 0.5 / 0.25 = 2σ

68-95-99.7 rule:
  Within ±1σ: ~68%
  Within ±2σ: ~95%  ← applies here
  Within ±3σ: ~99.7%`,
        choices: [
          { id: "a", label: "~5% — spec limits are ±2σ, and 95% fall within ±2σ so ~5% fall outside", description: "Correct. The spec limits are exactly 2 standard deviations from the mean, so ~5% of parts will be out of spec." },
          { id: "b", label: "~32% — spec limits are ±1σ so 32% fall outside ±1σ", description: "Incorrect — 0.5 / 0.25 = 2σ, not 1σ." },
          { id: "c", label: "~0.3% — spec limits are ±3σ so only 0.3% fall outside", description: "Incorrect — 0.5 / 0.25 = 2, so the limits are ±2σ, not ±3σ." },
        ],
        branches: { a: "s4_terminal", b: "s4_terminal", c: "s4_terminal" },
        rationale: "Answer A is correct. The spec limits (9.5 to 10.5) are each 0.5 units from the mean, which equals 0.5/0.25 = 2 standard deviations. By the 68-95-99.7 rule, approximately 95% of a normally distributed process falls within ±2σ, so ~5% of parts will be out of spec. This is the foundation of Six Sigma quality control, which aims to push spec limits to ±6σ, reducing defects to 3.4 per million.",
      },
    },
  },
  knowledgeCheck: [
    {
      question: "Two datasets have the same mean. Dataset A has σ=3; Dataset B has σ=15. Which of the following is true?",
      options: [
        "Dataset B is more spread out — individual values deviate more from the mean on average",
        "Dataset A is more variable — smaller σ means the values are more extreme",
        "They are equally variable because they share the same mean",
      ],
      correctIndex: 0,
      explanation: "Dataset B is more spread out. Standard deviation measures the average distance of data points from the mean. A larger σ means points are farther from the mean on average. Two datasets can have the same mean and completely different spreads — this is exactly why you must report both.",
    },
    {
      question: "Why does sample variance use n-1 in the denominator instead of n?",
      options: [
        "Because the sample mean underestimates the true spread of deviations from the population mean, and n-1 corrects this bias",
        "Because n-1 makes the formula work for both odd and even sample sizes",
        "Because the first data point is reserved as a baseline, leaving n-1 usable observations",
      ],
      correctIndex: 0,
      explanation: "Bessel's correction: when we compute deviations from the sample mean (x̄) rather than the true population mean (μ), those deviations are systematically smaller because x̄ is estimated from the same data and minimizes them. This 'uses up' one degree of freedom. Dividing by n-1 instead of n compensates, producing an unbiased estimator of σ².",
    },
  ],
},

"st-f3": {
  durationLabel: "12 min",
  outcomes: [
    "Calculate Q1, Q2, Q3, IQR, and Tukey fences from a sorted dataset",
    "Apply the 1.5×IQR rule to flag outliers and explain why IQR is robust where standard deviation is not",
    "Interpret percentile values in operational contexts like response time SLAs and growth charts",
  ],
  learnMarkdown: `## Percentiles, IQR & Outlier Detection

Percentiles divide a sorted dataset into 100 equal parts. They're everywhere: the 90th-percentile response time (P90) is a standard SLA metric; growth charts express a child's height as a percentile; the IQR used for outlier detection is built from the 25th and 75th percentiles.

## Quartiles: The Big Four Splits

The most commonly used percentiles are the **quartiles**:

- **Q1 (P25)** — 25% of values fall below this point
- **Q2 (P50)** — the median; 50% fall below
- **Q3 (P75)** — 75% of values fall below
- **IQR = Q3 - Q1** — the middle 50% of the data

\`\`\`
sorted: [12, 18, 24, 28, 31, 35, 41, 47]
         ↑Q1=21         ↑Q3=38
         IQR = 38 - 21 = 17
\`\`\`

The IQR is a **resistant** measure of spread: it ignores the bottom 25% and top 25% entirely, so extreme values cannot inflate it.

## Tukey Fences: Outlier Detection

The standard rule for flagging outliers is the **1.5×IQR criterion** (Tukey fences):

\`\`\`
Lower fence = Q1 - 1.5 × IQR
Upper fence = Q3 + 1.5 × IQR

Any value outside [lower fence, upper fence] is a potential outlier.
\`\`\`

For extreme outliers, a stricter **3×IQR criterion** is sometimes used. Values beyond 3×IQR from the quartile are called "far outliers."

## Why IQR Over Standard Deviation for Outlier Detection?

Standard deviation is itself inflated by outliers — so using σ to detect outliers is circular: a very large outlier increases σ, making the threshold larger, potentially masking the outlier. IQR avoids this problem by ignoring the tails entirely.

## Box Plots: Visualizing the Five-Number Summary

A box plot encodes Q1, Q2, Q3, the fences (whiskers), and outlier points:

\`\`\`
    ○         [==|=====]          ○ ○
    ↑          ↑ ↑    ↑           ↑↑
  outlier     Q1 Q2   Q3       outliers
              |<- IQR ->|
    ←whisker→            ←whisker→
\`\`\`

## Operational Percentiles

In engineering and product analytics, percentiles are used differently from statistics:

- **P50 (median)** — typical case
- **P90 / P95** — "tail latency" — 90% or 95% of requests complete within this time
- **P99** — "long-tail" — 99% of requests; used for SLAs where 1 in 100 slow requests causes user-facing issues

Optimizing for mean latency can mask the fact that 5% of users experience terrible performance. Percentile-based SLAs are more honest.

## When Percentiles Beat Mean/SD

For heavy-tailed distributions (latency, revenue, social engagement), percentiles tell the complete story without any distributional assumptions. Reporting P10, P50, P90 gives you a robust picture of typical and tail behavior that mean ± σ cannot provide for skewed data.

## Interview hook (answer like a senior)

> "When I'm doing exploratory analysis on a new metric, I immediately pull the percentile distribution — P10, P25, P50, P75, P90, P99. The gaps between adjacent percentiles tell me about skew, and P99 vs P95 tells me whether the tail is power-law or approximately normal. I use IQR for outlier flagging rather than ±2σ because σ itself gets inflated by outliers in skewed data — that's a circular trap."
`,
  video: null,
  videoFallbackMarkdown: `## Video not yet available

Work through the **Percentile & IQR Explorer** below. Toggle between the normal and outlier dataset and watch how the IQR barely changes even when an extreme outlier is added — that's the key intuition about IQR's robustness. Use the box plot view to see how whiskers and outlier points are plotted.`,
  tryGuidance: "Switch to the dataset with the extreme outlier (value 97) and observe how the box plot changes. Notice that Q1, Q2, and Q3 all stay close to their original values, but the upper fence is now exceeded. Toggle to the 'Value Inspector' tab and hover over each data point to see its percentile rank. Then open 'Concepts' to review the operational use cases for P90 and P99 in engineering.",
  interviewGraph: {
    initialStageId: "s1_outlier_fence",
    artifactDimensions: [
      { label: "Tukey fence calculation", recoveryStageId: "r1_fence_calc" },
      { label: "Percentile interpretation", recoveryStageId: "r2_percentile_meaning", passLabel: "Percentile applied correctly" },
    ],
    stages: {
      s1_outlier_fence: {
        id: "s1_outlier_fence",
        type: "scenario_choice",
        badge: "Stage 1",
        title: "Stage 1 · Applying the Tukey fence",
        prompt: "A dataset has Q1=20, Q3=40, so IQR=20. A value of 90 appears in the dataset. By the standard Tukey fence rule (1.5×IQR), is this value an outlier?",
        code_snippet: `Q1 = 20
Q3 = 40
IQR = Q3 - Q1 = 20

Upper fence = Q3 + 1.5 × IQR
            = 40  + 1.5 × 20
            = 40  + 30
            = 70

Value to check: 90`,
        choices: [
          { id: "a", label: "Yes — 90 exceeds the upper fence of 70, so it is flagged as an outlier", description: "Correct. 90 > 70, so this value lies outside the Tukey fence and is a potential outlier." },
          { id: "b", label: "No — 90 is only 2.5×IQR above Q1, and the threshold is 3×IQR", description: "Wrong threshold — the standard rule is 1.5×IQR from Q3 (not Q1). The 3×IQR rule is for 'far outliers'." },
          { id: "c", label: "Not enough information — we need the standard deviation to determine if it is an outlier", description: "The Tukey fence rule uses only Q1, Q3, and IQR. No standard deviation needed — and σ would be circular here." },
          { id: "d", label: "No — outliers must be at least 3 standard deviations from the mean", description: "The ±3σ rule is a different (distributional) criterion. The IQR-based Tukey fence is distribution-free." },
        ],
        branches: { a: "s2_click_iqr_bug", b: "r1_fence_calc", c: "r1_fence_calc", d: "r1_fence_calc" },
        rationale: "Yes, 90 is an outlier by the Tukey rule. Upper fence = Q3 + 1.5×IQR = 40 + 30 = 70. Since 90 > 70, it falls outside the fence. The 1.5×IQR rule is the standard (Tukey, 1977) and is distribution-free — you don't need to assume normality.",
      },
      s2_click_iqr_bug: {
        id: "s2_click_iqr_bug",
        type: "click_target",
        badge: "Stage 2",
        title: "Stage 2 · Spot the IQR formula bug",
        prompt: "A data analyst wrote a script to compute IQR. Click the line that contains the formula error.",
        code_snippet: `def compute_iqr(sorted_data):
    n = len(sorted_data)
    q1 = sorted_data[n // 4]
    q2 = sorted_data[n // 2]
    q3 = sorted_data[3 * n // 4]
    iqr = q2 - q1   -- ds-target:wrong_iqr
    return iqr`,
        validationCopy: {
          wrong_iqr: "Correct. IQR = Q3 - Q1, not Q2 - Q1. The line should read `iqr = q3 - q1`. Using Q2 (the median) instead of Q3 computes the distance from Q1 to the median, which is only half of the interquartile range.",
        },
        branches: { wrong_iqr: "s3_p90_meaning" },
      },
      s3_p90_meaning: {
        id: "s3_p90_meaning",
        type: "scenario_choice",
        badge: "Stage 3",
        title: "Stage 3 · Interpreting P90 operationally",
        prompt: "Your service's P90 response time is 850ms. An engineer says 'our average is only 210ms so 850ms doesn't matter.' How do you respond?",
        code_snippet: `Response time distribution (n=100,000 requests):
  P50:  95ms   ← typical request
  P75: 320ms
  P90: 850ms   ← 10% of requests exceed this
  P99: 3200ms  ← 1% of requests hit 3+ seconds

  mean: 210ms  ← dominated by fast requests`,
        choices: [
          { id: "a", label: "P90=850ms means 10% of requests take 850ms or longer — that's 10,000 users per 100,000 experiencing slow responses, which is a real user experience problem", description: "Correct — absolute count of affected users makes the percentile concrete." },
          { id: "b", label: "The engineer is right — if the mean is fast, most users are fine and P90 is an edge case we can ignore", description: "Wrong. 10% is not an edge case — and P90 is often the metric in SLAs precisely because it's user-perceptible." },
          { id: "c", label: "P90 only matters for high-traffic services — at low traffic it is statistically unreliable", description: "P90 is meaningful at any scale proportional to the traffic. 10% of requests are slow regardless of volume." },
          { id: "d", label: "We should optimize for the mean, which is a better overall metric of system health", description: "Mean latency is easily dominated by the large volume of fast requests. It masks slow-tail problems — that's why engineers specifically monitor P90/P99." },
        ],
        branches: { a: "s4_terminal", b: "r2_percentile_meaning", c: "r2_percentile_meaning", d: "r2_percentile_meaning" },
        rationale: "Answer A is correct. P90=850ms means 10% of all requests take at least 850ms. At 100,000 requests, that's 10,000 users per reporting period experiencing slow responses — a real and significant UX problem regardless of the mean. SLAs are typically expressed in percentiles (not mean) precisely because the tail behavior directly impacts user experience.",
      },
      r1_fence_calc: {
        id: "r1_fence_calc",
        type: "scenario_choice",
        badge: "Recovery 1",
        title: "Recovery · Tukey fence calculation",
        prompt: "A dataset has Q1=15, Q3=35. Calculate the upper Tukey fence (1.5×IQR rule).",
        code_snippet: `Q1 = 15
Q3 = 35
IQR = Q3 - Q1 = ?

Upper fence = Q3 + 1.5 × IQR = ?`,
        choices: [
          { id: "a", label: "65  (IQR=20, fence = 35 + 1.5×20 = 35 + 30 = 65)", description: "Correct. IQR = 35-15 = 20; upper fence = 35 + 30 = 65." },
          { id: "b", label: "50  (fence = Q3 + IQR = 35 + 20 = 55)", description: "Off — you need to multiply IQR by 1.5, not use IQR directly." },
          { id: "c", label: "52.5  (fence = Q3 + 0.5×IQR)", description: "Wrong multiplier — the standard Tukey rule uses 1.5×IQR, not 0.5×IQR." },
          { id: "d", label: "42.5  (fence = Q3 + 0.25×IQR)", description: "Wrong multiplier — the rule is 1.5×IQR." },
        ],
        branches: { a: "s2_click_iqr_bug", b: "r1_fence_calc", c: "r1_fence_calc", d: "r1_fence_calc" },
        rationale: "IQR = Q3 - Q1 = 35 - 15 = 20. Upper fence = Q3 + 1.5 × IQR = 35 + 1.5 × 20 = 35 + 30 = 65. Any value above 65 is a potential outlier by the Tukey rule. The lower fence would be Q1 - 1.5×IQR = 15 - 30 = -15.",
      },
      r2_percentile_meaning: {
        id: "r2_percentile_meaning",
        type: "scenario_choice",
        badge: "Recovery 2",
        title: "Recovery · Percentile interpretation",
        prompt: "A standardized test reports that a student scored at the 82nd percentile. Which interpretation is correct?",
        code_snippet: `Test score: 78 / 100
Percentile: 82nd

# What does P82 mean?`,
        choices: [
          { id: "a", label: "82% of test-takers scored at or below this student's score", description: "Correct. Percentile rank = percentage of the reference group at or below your score." },
          { id: "b", label: "The student answered 82% of questions correctly", description: "Incorrect — that's the raw score percentage, not the percentile rank. An 82nd percentile student might have a raw score of 78%." },
          { id: "c", label: "The student scored 82 points out of 100", description: "Incorrect — the student scored 78/100. Percentile rank (82nd) is a different quantity from the raw score (78)." },
          { id: "d", label: "The student is in the top 82% of test-takers", description: "Almost right but backwards — the student is in the top 18% (100 - 82 = 18), not the top 82%." },
        ],
        branches: { a: "s3_p90_meaning", b: "r2_percentile_meaning", c: "r2_percentile_meaning", d: "r2_percentile_meaning" },
        rationale: "Answer A is correct. The Nth percentile is the value below which N% of the data falls. An 82nd percentile score means 82% of test-takers scored at or below that level — equivalently, this student outperformed 82% of the group. Confusing percentile rank with raw score or 'top X%' is a very common error.",
      },
      s4_terminal: {
        id: "s4_terminal",
        type: "scenario_choice",
        badge: "Terminal",
        title: "Revision complete · Percentile & IQR mastery",
        terminal: true,
        prompt: "Final check: a user engagement score distribution has many zeros (users who never engaged) and a long right tail (power users). Which set of summary statistics would you report to give a complete picture?",
        code_snippet: `Engagement score distribution:
  60% of users: score = 0 (never engaged)
  Remaining 40%: scores from 1 to 500

  mean = 8.4   (pulled up by power users)
  σ    = 22.1  (inflated by variance in tail)
  P0   = 0
  P50  = 0     (more than 50% are zero)
  P75  = 3
  P90  = 28
  P99  = 180`,
        choices: [
          { id: "a", label: "P50, P75, P90, P99 plus the percentage of zeros — this captures the spike at zero and the shape of the active-user tail", description: "Correct. Percentiles are distribution-free and capture both the zero spike and the long tail without distortion." },
          { id: "b", label: "Mean ± standard deviation — these are the standard and most widely understood statistics", description: "Mean=8.4 is misleading when 60% of users have score=0. σ=22.1 is dominated by the tail and hard to interpret." },
          { id: "c", label: "Median only — it's robust and gives the best single-number summary", description: "Median=0 just tells you that most users never engaged. You lose all information about the active users." },
          { id: "d", label: "Mode and mean — mode shows the most common value and mean shows the average", description: "Mode=0 just confirms zero is most common. Mean=8.4 is misleading. Neither captures the active-user behavior." },
        ],
        branches: { a: "s4_terminal", b: "s4_terminal", c: "s4_terminal", d: "s4_terminal" },
        rationale: "Answer A is correct. For a distribution with a mass point at zero (60% zeros) and a long right tail, percentiles plus the zero-fraction are the most honest and complete summary. P50=0 confirms the majority never engaged. P75=3, P90=28, P99=180 characterize the active users. Mean and σ are both distorted by the spike at zero and the outlier power users, and would mislead anyone trying to understand typical behavior.",
      },
    },
  },
  knowledgeCheck: [
    {
      question: "A dataset has Q1=25 and Q3=55. A value of 100 appears. Is it an outlier by the Tukey 1.5×IQR rule?",
      options: [
        "Yes — upper fence = 55 + 1.5×30 = 100, and since 100 ≥ 100, it is at or beyond the boundary",
        "No — the value would need to exceed 100 to be an outlier",
        "Cannot determine without knowing the mean and standard deviation",
      ],
      correctIndex: 0,
      explanation: "IQR = 55 - 25 = 30. Upper fence = Q3 + 1.5×IQR = 55 + 45 = 100. The value 100 sits exactly on the fence boundary. By most implementations, values beyond (strictly greater than) the fence are outliers — so 100 sits right at the threshold. Regardless of which convention you use, this is the correct fence calculation and the IQR-based approach requires no distributional assumption.",
    },
    {
      question: "A server's P99 response time jumps from 200ms to 800ms after a deployment. The mean response time stayed at 45ms. What's the most likely explanation?",
      options: [
        "A slow code path or resource contention was introduced that only affects ~1% of requests but dramatically slows them",
        "The mean is more reliable than P99 — the measurement is probably noise",
        "P99 is inherently unstable and this change is within normal statistical variation",
      ],
      correctIndex: 0,
      explanation: "P99 rising 4× while the mean barely moves is a classic signature of a tail-latency regression — a bug or bottleneck that affects a small percentage of requests severely. Common causes include database lock contention, garbage collection pauses, or a code path triggered only under specific conditions. The mean is stable because 99% of requests are unaffected. This is exactly why monitoring P99 is critical — mean latency would completely hide this regression.",
    },
  ],
},

"st-f4": {
  durationLabel: "15 min",
  outcomes: [
    "Distinguish correlation from causation and identify confounding variables in realistic scenarios",
    "Explain the design of randomized controlled trials and why they establish causation where observational data cannot",
    "Apply a systematic framework before drawing causal conclusions from observed correlations",
  ],
  learnMarkdown: `## Correlation vs Causation (Seriously)

This is the single most frequently cited concept in data science interviews — and it's cited so often precisely because it's violated so often. Strong correlation is seductive. It looks like an answer. But it's only a question.

## What Correlation Actually Measures

The Pearson correlation coefficient r measures the **linear relationship** between two variables:

- r = +1: perfect positive linear relationship
- r = 0: no linear relationship (but could have nonlinear!)
- r = -1: perfect negative linear relationship

r tells you how tightly two variables move together. It says nothing about **why** they move together.

## The Classic Trap: Confounding Variables

When X and Y are correlated, there are three possible explanations:

1. **X causes Y** (the one everyone jumps to)
2. **Y causes X** (reverse causation)
3. **Z causes both X and Y** (confounding variable / common cause)

The ice cream and drowning example is perfect: ice cream sales and drowning deaths have r≈0.97. Does ice cream cause drowning? No — summer temperature (the confounder) increases both ice cream consumption and swimming frequency. Remove the seasonal trend and the correlation vanishes.

## Why Observational Data Is Tricky

In an observational study, you can't control who gets "treated." Users who adopt Feature X might already be more engaged. Revenue might be higher in markets where you also spent more on sales. Height correlates with wealth in some studies — because childhood nutrition, a confounder, affects both.

**Selection bias** is the most common form: the people who use a feature aren't randomly selected. They self-selected because of pre-existing characteristics.

## The Causal Ladder (Pearl)

Judea Pearl's causal hierarchy:
1. **Association** (seeing): X and Y are correlated — r is this level
2. **Intervention** (doing): What happens if we force X? — A/B tests live here
3. **Counterfactual** (imagining): What *would* have happened if X had been different?

Most analytics lives at level 1. Most product decisions require level 2.

## How to Establish Causation

**Gold standard: RCT (randomized controlled trial)** — Randomly assign users to treatment and control. Randomization breaks the correlation between treatment and all confounders. Any remaining difference in outcomes is caused by the treatment.

**When RCTs are infeasible:**
- **Instrumental variables** — Find a variable Z that causes X but does not directly cause Y (instrument)
- **Difference-in-differences** — Compare trends before/after in treated vs untreated groups
- **Regression discontinuity** — Exploit sharp cutoffs (e.g., users just above vs just below a threshold)

## The PM Scenario (Classic Interview)

"Users who use Feature X have 3× higher 30-day retention." → What's your concern?

The users who adopted Feature X are not comparable to those who didn't. They may have been more engaged to begin with (self-selection), they may have been power users (survivorship bias), or they may have discovered Feature X because they were already highly retained. You can't assign the 3× lift to Feature X without a randomized test.

## Interview hook (answer like a senior)

> "When I see a strong correlation in product data, I treat it as a hypothesis, not a finding. My first question is always: 'Could there be a confounding variable?' If I'm confident the product team will act on this, I push for an A/B test. Correlation is cheap to compute and easy to misinterpret — causation is expensive to establish and worth fighting for."
`,
  video: null,
  videoFallbackMarkdown: `## Video not yet available

Use the **Correlation Explorer** below to build intuition for r values. Click through the preset scatter plots to see what r=+0.95, r=+0.40, r=0, and r=-0.92 look like visually. Then switch to 'Spurious Correlations' to see real examples of high-r pairs that have no causal relationship. Finally, read through the 'Establishing Causation' framework — it's a checklist worth memorizing.`,
  tryGuidance: "Start with the 'Scatter Plot' tab — toggle between all four presets and notice how the regression line steepens and tightens as |r| approaches 1. Then go to 'Spurious Correlations' and work through all three examples. For each one, try to guess the confounding variable before reading the explanation. Finally, in 'Establishing Causation', trace through each step of the causal checklist and think about a product feature you've used recently — could you establish causation for its claimed effect?",
  interviewGraph: {
    initialStageId: "s1_confound_guess",
    artifactDimensions: [
      { label: "Confounders and spurious correlation", recoveryStageId: "r1_confounders" },
      { label: "Establishing causation from observational data", recoveryStageId: "r2_causal_methods", passLabel: "Causal reasoning applied" },
    ],
    stages: {
      s1_confound_guess: {
        id: "s1_confound_guess",
        type: "scenario_choice",
        badge: "Stage 1",
        title: "Stage 1 · Identify the confounder",
        prompt: "A dataset covering 20 years shows ice cream sales and drowning deaths are strongly correlated (r=0.95, p<0.001). A headline reads: 'Ice cream consumption linked to drowning risk.' What is the most likely explanation?",
        code_snippet: `correlation_matrix:
              ice_cream_sales  drowning_deaths
ice_cream_sales      1.000           0.950
drowning_deaths      0.950           1.000

p-value: 0.0001   (highly 'significant')
n: 240 monthly data points`,
        choices: [
          { id: "a", label: "Confounding variable — summer temperature increases both ice cream sales and swimming activity, creating a spurious correlation", description: "Correct. Temperature is the confounder that drives both variables upward in summer months." },
          { id: "b", label: "Causation — ice cream contains ingredients that impair judgment or swimming ability", description: "No evidence for a physiological mechanism; this is the classic causal fallacy from correlation." },
          { id: "c", label: "Reverse causation — news about drownings causes people to buy comfort food like ice cream", description: "Creative, but implausible as the primary driver of a year-round seasonal pattern." },
          { id: "d", label: "The correlation is real and meaningful — p<0.001 proves statistical significance", description: "Statistical significance confirms the correlation exists, not that it is causal. Significance can arise from confounders." },
        ],
        branches: { a: "s2_click_causal_claim", b: "r1_confounders", c: "r1_confounders", d: "r1_confounders" },
        rationale: "Answer A is correct. The confounder is summer temperature (or season). Hot weather increases outdoor activity, which increases both ice cream consumption and swimming. Remove the seasonal component (e.g., by analyzing within-month data) and the correlation essentially disappears. This example perfectly illustrates why correlation ≠ causation.",
      },
      s2_click_causal_claim: {
        id: "s2_click_causal_claim",
        type: "click_target",
        badge: "Stage 2",
        title: "Stage 2 · Find the invalid causal claim",
        prompt: "A data analyst wrote a summary memo after observing the ice cream/drowning correlation. Click the line that makes an unjustified causal claim.",
        code_snippet: `Analysis Summary: Ice Cream & Safety Data
==========================================
Finding: r=0.95 between monthly ice cream
  sales and drowning incidents (n=240 months)
Observation: Both metrics peak in July-August
Hypothesis: Seasonal confounding (temperature)
  likely explains the co-movement
Recommendation: Restrict ice cream sales near  -- ds-target:causal_claim
  waterways to reduce drowning deaths`,
        validationCopy: {
          causal_claim: "Correct. This line makes an unjustified causal leap — recommending a policy intervention (restricting ice cream sales) that assumes ice cream causes drownings. No intervention should be recommended on the basis of a confounded observational correlation. The analyst's own hypothesis on the previous line correctly identifies seasonal confounding as the likely explanation.",
        },
        branches: { causal_claim: "s3_how_to_cause" },
      },
      s3_how_to_cause: {
        id: "s3_how_to_cause",
        type: "scenario_choice",
        badge: "Stage 3",
        title: "Stage 3 · Establishing causation",
        prompt: "A PM says 'users who enable dark mode have 40% higher 7-day retention. Let's force all new users into dark mode.' What methodological concern do you raise, and what would you propose instead?",
        code_snippet: `Observational data:
  Dark mode users:     7-day retention = 62%
  Non-dark-mode users: 7-day retention = 44%
  Lift: +40% relative

  Caveat: dark mode adoption is self-selected
  n_dark_mode = 12,400 / n_total = 89,000`,
        choices: [
          { id: "a", label: "Self-selection bias — users who seek out dark mode may already be more engaged; propose an A/B test randomly assigning dark mode to new users", description: "Correct. Self-selection is the key confound; randomization breaks it." },
          { id: "b", label: "The sample size is too small — with only 12,400 dark mode users the result is not reliable", description: "12,400 is actually quite large. The problem is selection bias, not sample size." },
          { id: "c", label: "The 40% lift is already strong enough evidence — we don't need an experiment for obvious findings", description: "Correlational strength does not substitute for causal evidence. A 40% lift is precisely the kind of finding that deserves rigor, not shortcuts." },
          { id: "d", label: "Retention is a vanity metric — we should use revenue instead", description: "This avoids the actual question. The methodological concern is causal validity, not metric choice." },
        ],
        branches: { a: "s4_terminal", b: "r2_causal_methods", c: "r2_causal_methods", d: "r2_causal_methods" },
        rationale: "Answer A is correct. Self-selection is the primary threat to validity: power users who customize settings (enabling dark mode) may already have higher baseline retention. Randomizing dark mode assignment (A/B test) breaks the correlation between dark mode and pre-existing engagement, isolating the causal effect of the feature itself.",
      },
      r1_confounders: {
        id: "r1_confounders",
        type: "scenario_choice",
        badge: "Recovery 1",
        title: "Recovery · Confounders and spurious correlation",
        prompt: "A study finds that countries with more TV sets per capita have higher life expectancy (r=0.89). Which explanation is most likely correct?",
        code_snippet: `Country data (n=150 countries):
  TV sets / 1000 people  vs  Life expectancy (years)
  r = 0.89  (p < 0.001)

  Low TV, low life exp:  developing nations
  High TV, high life exp: developed nations`,
        choices: [
          { id: "a", label: "Confounding — wealth (GDP per capita) causes both higher TV ownership and better healthcare/nutrition leading to longer life", description: "Correct. GDP is the confounder. Wealthier countries can afford both more consumer electronics and better health infrastructure." },
          { id: "b", label: "Causation — watching TV improves health literacy and leads to healthier behaviors", description: "While plausible as a minor mechanism, it cannot explain an r=0.89 correlation across all countries. The primary driver is economic development." },
          { id: "c", label: "Reverse causation — people who live longer buy more TVs because they have more years to purchase consumer goods", description: "Plausible in a tongue-in-cheek way but not the primary explanation for a cross-country correlation driven by development levels." },
          { id: "d", label: "The correlation proves that TVs directly improve health through some mechanism we haven't identified yet", description: "A correlation, however strong, does not prove any causal mechanism without experimental evidence." },
        ],
        branches: { a: "s2_click_causal_claim", b: "r1_confounders", c: "r1_confounders", d: "r1_confounders" },
        rationale: "Wealth (GDP per capita) is the confounder. Wealthy countries invest in both consumer technology (TVs) and healthcare (doctors, nutrition, sanitation). Both TV ownership and life expectancy are downstream of economic development. If you could equalize GDP across countries, the TV-life expectancy correlation would shrink dramatically. This is a classic example of a third variable driving two unrelated outcomes.",
      },
      r2_causal_methods: {
        id: "r2_causal_methods",
        type: "scenario_choice",
        badge: "Recovery 2",
        title: "Recovery · Methods for establishing causation",
        prompt: "You want to test whether receiving a promotional email causes higher purchase rates. An A/B test is not feasible because marketing already sent the emails. What is the best alternative approach?",
        code_snippet: `Available data:
  - 50,000 users received the email
  - 200,000 users did not (were not on the list)
  - Email list: users who opted into promotions
  - Purchase data: 30 days before and after

Key concern: email recipients opted IN,
so they may already buy more frequently`,
        choices: [
          { id: "a", label: "Difference-in-differences — compare the change in purchase rate before vs after the campaign for email recipients vs non-recipients", description: "Correct. DiD controls for baseline differences by looking at the change (delta) rather than the level." },
          { id: "b", label: "Compare average purchase rates between the two groups — the email group's higher rate proves the email worked", description: "This is a simple observational comparison that ignores the self-selection bias (opt-in users already buy more)." },
          { id: "c", label: "Run a new A/B test retroactively — randomly reassign users to treatment and control", description: "You cannot retroactively randomize — the email has already been sent. Past data is fixed." },
          { id: "d", label: "Use only the email group's data and compare their post-campaign rate to a historical baseline", description: "A pre-post comparison without a control group confounds the email effect with any other time-varying factors (seasonality, site changes)." },
        ],
        branches: { a: "s3_how_to_cause", b: "r2_causal_methods", c: "r2_causal_methods", d: "r2_causal_methods" },
        rationale: "Difference-in-differences (DiD) is the best available approach. By comparing the change in purchase rate (before vs after) for email recipients against the same change for non-recipients, DiD controls for baseline purchase propensity differences. If email recipients already bought more, DiD accounts for that by looking at the incremental change attributable to the campaign. It is not perfect (assumes parallel trends), but it is far stronger than a simple post-campaign comparison.",
      },
      s4_terminal: {
        id: "s4_terminal",
        type: "scenario_choice",
        badge: "Terminal",
        title: "Revision complete · Causal reasoning mastery",
        terminal: true,
        prompt: "Final check: A PM says 'Users who use Feature X have 3× higher 30-day retention (62% vs 21%). I want to roll out Feature X to all users immediately.' What is your primary statistical concern and your recommended next step?",
        code_snippet: `Feature X adoption data:
  Feature X users:     n=8,400   retention=62%
  Non-Feature-X users: n=91,600  retention=21%
  Relative lift: +195%  (3× higher)

  Feature X users tend to be:
  - Power users (>5 sessions/week)
  - Users who completed onboarding
  - Users from organic acquisition`,
        choices: [
          { id: "a", label: "Self-selection bias — Feature X users are already more engaged and retained; causality requires an A/B test where Feature X exposure is randomly assigned", description: "Correct. The 3× lift reflects who uses Feature X, not what Feature X does." },
          { id: "b", label: "The sample size is too small — we need at least 100,000 Feature X users before drawing conclusions", description: "Sample size is not the issue. 8,400 is statistically powered for a 3× effect. Selection bias is the threat." },
          { id: "c", label: "The effect is too large — a 3× lift is implausible and likely a data error", description: "Large effects from self-selected high-engagement users are entirely plausible. The concern is attribution, not magnitude." },
          { id: "d", label: "The retention metric is flawed — we should use revenue instead before making this decision", description: "Metric choice is secondary. The primary concern is that we cannot attribute retention to Feature X without a causal test." },
        ],
        branches: { a: "s4_terminal", b: "s4_terminal", c: "s4_terminal", d: "s4_terminal" },
        rationale: "Answer A is correct. This is the canonical 'correlation vs causation in product analytics' scenario. Feature X users are a self-selected group of power users who would likely have high retention regardless of Feature X. The 3× lift measures the difference between these users and the rest of the base — but most of that difference existed before Feature X. An A/B test — randomly exposing a subset of new users to Feature X — is the only way to isolate the causal effect. Rolling out on observational data risks optimizing for user type rather than product quality.",
      },
    },
  },
  knowledgeCheck: [
    {
      question: "A dataset shows that countries with more lawyers per capita have higher GDP per capita (r=0.83). The most likely explanation is:",
      options: [
        "Confounding — economic development drives both legal system complexity and GDP; lawyers don't cause GDP growth",
        "Causation — lawyers create economic value through contracts, IP protection, and dispute resolution",
        "Reverse causation — higher GDP creates demand for more legal services",
      ],
      correctIndex: 0,
      explanation: "Confounding is the most likely primary explanation. Economic development, institutions, and rule-of-law create demand for both legal professionals and economic output. While lawyers may contribute to economic activity (causation) and higher GDP creates legal demand (reverse causation), the dominant driver of the cross-country correlation is the underlying level of institutional development — a confounder that causes both. This is why you cannot conclude from this data that hiring more lawyers will increase GDP.",
    },
    {
      question: "Which study design most reliably establishes that a new drug causes lower blood pressure (vs simply correlating with it)?",
      options: [
        "A randomized controlled trial where patients are randomly assigned to drug or placebo",
        "An observational cohort study comparing patients who chose to take the drug vs those who didn't",
        "A cross-sectional survey measuring drug use and blood pressure at the same point in time",
      ],
      correctIndex: 0,
      explanation: "Randomized controlled trials (RCTs) are the gold standard for causal inference. By randomly assigning patients to drug or placebo, RCTs ensure that the two groups are comparable on all confounders (both measured and unmeasured) at baseline. Any difference in blood pressure outcomes can then be attributed to the drug. Observational studies suffer from confounding (sicker patients may preferentially take the drug) and cross-sectional studies cannot even establish temporal order.",
    },
  ],
},

  // ── injected from stat_probability_lessons.js ──
  "st-p1": {
  durationLabel: "20 min",
  outcomes: [
    "Apply Bayes' theorem to compute posterior probabilities from prior, likelihood, and evidence",
    "Recognize and correct base rate neglect in probabilistic reasoning",
    "Distinguish prior vs posterior probability and interpret likelihood ratios",
    "Communicate Bayesian updates clearly to non-technical stakeholders",
  ],
  learnMarkdown: `## Bayes' Theorem: Updating Beliefs

**Bayes' theorem** lets you update a prior belief (probability before seeing evidence) into a posterior belief (probability after seeing evidence).

\`\`\`
P(A | B) = P(B | A) × P(A) / P(B)

where P(B) = P(B|A)·P(A) + P(B|¬A)·P(¬A)
\`\`\`

**Anatomy of the formula**

| Term | Name | Meaning |
|------|------|---------|
| P(A) | Prior | Belief before evidence |
| P(B\|A) | Likelihood | How probable is B if A is true |
| P(B) | Marginal / Evidence | Total probability of observing B |
| P(A\|B) | Posterior | Belief after seeing evidence |

## The Base Rate Trap

The most common interview mistake is ignoring the **prior P(A)**. A test with 90% sensitivity sounds impressive — but if the disease affects only 1% of people, most positives are still false positives.

\`\`\`
Disease prevalence   P(D)  = 0.01
Test sensitivity     P(+|D) = 0.90
Test specificity     P(-|¬D) = 0.91 → P(+|¬D) = 0.09

P(+) = 0.90×0.01 + 0.09×0.99 = 0.009 + 0.0891 = 0.0981

P(D|+) = (0.90 × 0.01) / 0.0981 ≈ 0.0917  ← only ~9%!
\`\`\`

Even with a strong test, 9 out of 10 positive results are false positives when prevalence is low.

## Likelihood Ratio: A Faster Intuition

The **likelihood ratio (LR)** = P(+|D) / P(+|¬D) scales the prior odds:

\`\`\`
Prior odds   = P(D) / P(¬D) = 0.01 / 0.99 ≈ 0.0101
LR           = 0.90 / 0.09 = 10
Posterior odds = 0.0101 × 10 = 0.101
Posterior P  = 0.101 / 1.101 ≈ 0.0917  ✓ same result
\`\`\`

## Updating Beliefs Iteratively

Bayesian reasoning is **sequential** — today's posterior is tomorrow's prior:

\`\`\`
After test 1: P(D|+) ≈ 0.092  (new prior)
After test 2: apply Bayes again with this as the starting point
\`\`\`

## Interview hook (answer like a senior)

> "Bayes' theorem is the formal machinery for belief updating, but the real skill is never forgetting the base rate. When I see a model with 95% precision I always ask: what's the prevalence of positives in production? If it's 0.1%, even 95% precision means most flagged items are wrong. I use the likelihood ratio as a quick mental sanity check before running the full formula — LR > 10 is compelling evidence, LR < 2 barely moves the needle regardless of sensitivity."
`,
  video: null,
  videoFallbackMarkdown: `## Bayes' Theorem Visual

Imagine 10,000 people. With disease prevalence 1%:
- 100 have the disease → ~90 test positive (sensitivity 90%)
- 9,900 don't → ~891 also test positive (false positive rate 9%)

Total positives: 90 + 891 = 981
True positives: 90

P(Disease | Positive) = 90 / 981 ≈ 9.2%

The test is good. The base rate is what limits us.
`,
  tryGuidance: "Use the sliders to set disease prevalence (P(A)), test sensitivity (P(B|A)), and false positive rate (P(B|¬A)). Watch how the posterior P(Disease | Positive) changes. Try setting prevalence to 50% — now most positives are real. This is why screening programs and medical tests behave so differently.",
  interviewGraph: {
    initialStageId: "s1_medical_test",
    artifactDimensions: [
      { label: "Base rate application", recoveryStageId: "r1_base_rate" },
      { label: "Correct Bayes formula construction", recoveryStageId: "r2_formula", passLabel: "Formula correct" },
      { label: "Posterior interpretation", recoveryStageId: "r3_posterior" },
    ],
    stages: {
      s1_medical_test: {
        id: "s1_medical_test",
        type: "scenario_choice",
        badge: "Stage 1",
        title: "Stage 1 · The Medical Test Problem",
        prompt: "A disease affects 1% of the population. A test has 90% sensitivity (P(+|Disease)) and 91% specificity (P(−|No Disease)). A patient tests positive. What is the approximate probability they actually have the disease?",
        code_snippet: `P(Disease)         = 0.01
P(+ | Disease)     = 0.90   -- sensitivity
P(+ | No Disease)  = 0.09   -- 1 - specificity
P(Disease | +)     = ?`,
        choices: [
          { id: "a", label: "~9%", description: "Apply the full Bayes formula accounting for the low prevalence prior." },
          { id: "b", label: "~90%", description: "The test sensitivity is 90%, so a positive result means 90% chance of disease." },
          { id: "c", label: "~50%", description: "Positive or negative — it's roughly 50/50 after testing." },
          { id: "d", label: "~82%", description: "Average of sensitivity and specificity as a combined accuracy estimate." },
        ],
        branches: { a: "s2_formula_click", b: "r1_base_rate", c: "r1_base_rate", d: "r1_base_rate" },
        rationale: "P(+) = 0.90×0.01 + 0.09×0.99 = 0.0981. P(D|+) = 0.009 / 0.0981 ≈ 9.2%. The key insight is that most positives are false positives when prevalence is low — a classic base rate neglect trap that catches even experienced practitioners.",
      },
      s2_formula_click: {
        id: "s2_formula_click",
        type: "click_target",
        badge: "Stage 2 · Formula",
        title: "Stage 2 · Spot the Transposition Error",
        prompt: "An analyst wrote this derivation. One line has the conditional probability backwards — P(A|B) and P(B|A) are swapped. Click the line with the error.",
        code_snippet: `-- Bayes' theorem applied to spam detection
P(Spam | Flagged) = P(Spam) × P(Flagged | Spam) / P(Flagged)  -- line 1
P(Flagged) = P(Flagged|Spam)×P(Spam) + P(Flagged|Ham)×P(Ham)  -- line 2
P(Spam | Flagged) = P(Flagged) × P(Spam) / P(Flagged | Spam)  -- ds-target:swapped_line`,
        validationCopy: {
          swapped_line: "Correct. Line 3 has P(Flagged) and P(Flagged|Spam) swapped in the numerator and denominator — that's P(B)×P(A)/P(B|A), not the correct P(B|A)×P(A)/P(B). This reversal is a subtle but fatal error that produces results far from the true posterior.",
        },
        branches: { swapped_line: "s3_spam_filter" },
      },
      s3_spam_filter: {
        id: "s3_spam_filter",
        type: "scenario_choice",
        badge: "Stage 3",
        title: "Stage 3 · Spam Filter Posterior",
        prompt: "A spam filter flags 'free money' emails as spam 95% of the time. It also incorrectly flags 2% of legitimate emails. If 30% of all email is spam, what is P(Spam | Flagged)?",
        code_snippet: `P(Spam)            = 0.30
P(Flagged | Spam)  = 0.95
P(Flagged | Ham)   = 0.02

P(Flagged) = 0.95×0.30 + 0.02×0.70
           = 0.285 + 0.014 = 0.299

P(Spam | Flagged) = (0.95 × 0.30) / 0.299 = ?`,
        choices: [
          { id: "a", label: "≈ 95.3%", description: "0.285 / 0.299 — the numerator is the joint P(Spam ∩ Flagged)." },
          { id: "b", label: "≈ 30%", description: "The prior stays the same; the filter doesn't change it." },
          { id: "c", label: "≈ 65%", description: "Average of 95% and 30%." },
          { id: "d", label: "≈ 4.7%", description: "The false positive rate dominates." },
        ],
        branches: { a: "s4_terminal", b: "r3_posterior", c: "r3_posterior", d: "r3_posterior" },
        rationale: "0.95 × 0.30 = 0.285. P(Flagged) = 0.299. Posterior = 0.285 / 0.299 ≈ 95.3%. Here base rates are much higher (30% spam is common) so the posterior is very high — contrast with the 1%-prevalence medical case where the same test quality gives only 9% posterior.",
      },
      r1_base_rate: {
        id: "r1_base_rate",
        type: "scenario_choice",
        badge: "Recovery · Base Rate",
        title: "Recovery · Base Rate Neglect",
        prompt: "In a population of 10,000, disease prevalence is 1% (100 people sick). The test catches 90% of sick people (90 true positives) and incorrectly flags 9% of healthy people. How many false positives are there, and what does that tell us about P(Disease | Positive)?",
        code_snippet: `Population: 10,000
Sick:       100  → 90 test positive (true positives)
Healthy:  9,900  → 9,900 × 0.09 = 891 test positive (false positives)

Total positives = 90 + 891 = 981
P(Disease | Positive) = 90 / 981 ≈ 9.2%`,
        choices: [
          { id: "a", label: "891 false positives — only ~9% of positives are real cases", description: "The denominator swamps the numerator when prevalence is low." },
          { id: "b", label: "9 false positives — the specificity is 91% so very few false alarms", description: "Specificity applies to the healthy population of 9,900, not 100." },
          { id: "c", label: "10 false positives — equal to the true positives", description: "There's no reason the counts would be equal." },
        ],
        branches: { a: "s2_formula_click", b: "r1_base_rate", c: "r1_base_rate" },
        rationale: "9,900 healthy people × 9% false positive rate = 891 false positives, far outnumbering 90 true positives. This arithmetic is why base rate neglect is so dangerous — always compute the denominator P(B) in full.",
      },
      r2_formula: {
        id: "r2_formula",
        type: "scenario_choice",
        badge: "Recovery · Formula",
        title: "Recovery · Which Form is Correct?",
        prompt: "Which expression correctly states Bayes' theorem for P(A|B)?",
        code_snippet: `Option 1: P(A|B) = P(B|A) × P(A) / P(B)
Option 2: P(A|B) = P(A|B) × P(B) / P(A)
Option 3: P(A|B) = P(B) × P(A) / P(B|A)
Option 4: P(A|B) = P(A) / (P(B|A) × P(B))`,
        choices: [
          { id: "a", label: "Option 1", description: "Likelihood × Prior / Evidence — the standard form." },
          { id: "b", label: "Option 2", description: "This is circular — P(A|B) defined in terms of itself." },
          { id: "c", label: "Option 3", description: "P(B) in the numerator and P(B|A) in the denominator — swapped." },
          { id: "d", label: "Option 4", description: "P(A) alone divided by product — structurally wrong." },
        ],
        branches: { a: "s3_spam_filter", b: "r2_formula", c: "r2_formula", d: "r2_formula" },
        rationale: "Option 1 is the canonical form: posterior = likelihood × prior / marginal evidence. The numerator P(B|A)×P(A) is the joint probability P(A∩B), divided by the total probability P(B) of the observed evidence.",
      },
      r3_posterior: {
        id: "r3_posterior",
        type: "scenario_choice",
        badge: "Recovery · Posterior",
        title: "Recovery · Computing the Posterior",
        prompt: "P(Spam)=0.30, P(Flagged|Spam)=0.95, P(Flagged|Ham)=0.02. Walk through the calculation step by step. What is P(Flagged)?",
        code_snippet: `Step 1: P(Flagged) = P(Flagged|Spam)×P(Spam) + P(Flagged|Ham)×P(Ham)
Step 2:           = 0.95×0.30 + 0.02×0.70
Step 3:           = 0.285 + 0.014
Step 4:           = ?`,
        choices: [
          { id: "a", label: "0.299", description: "0.285 + 0.014 = 0.299 — the total probability of being flagged." },
          { id: "b", label: "0.97", description: "0.95 + 0.02 = 0.97 — but you can't just add likelihoods directly." },
          { id: "c", label: "0.30", description: "P(Flagged) equals the spam rate — but flagging depends on both groups." },
        ],
        branches: { a: "s4_terminal", b: "r3_posterior", c: "r3_posterior" },
        rationale: "P(Flagged) = 0.299. This is the law of total probability: sum over all mutually exclusive conditions (spam or ham) weighted by their probabilities. Then the posterior is 0.285 / 0.299 ≈ 95.3%.",
      },
      s4_terminal: {
        id: "s4_terminal",
        type: "scenario_choice",
        badge: "Terminal",
        title: "Revision complete · COVID Test Scenario",
        terminal: true,
        prompt: "A COVID test has 99% sensitivity and 99% specificity. Population prevalence is 0.1%. A person tests positive. What is the approximate probability they have COVID? (Think through it — then check all options.)",
        code_snippet: `P(COVID)       = 0.001
P(+ | COVID)   = 0.99
P(+ | No COVID)= 0.01

P(+) = 0.99×0.001 + 0.01×0.999
     = 0.00099 + 0.00999 = 0.01098

P(COVID | +) = 0.00099 / 0.01098 ≈ 9.0%`,
        choices: [
          { id: "a", label: "~9% — base rate dominates even a 99% accurate test", description: "Even with an excellent test, 0.1% prevalence means most positives are false." },
          { id: "b", label: "~99% — the test is 99% accurate", description: "Accuracy doesn't equal posterior probability; the prior matters." },
          { id: "c", label: "~50% — equal chance", description: "No — Bayes gives a precise answer here." },
        ],
        branches: { a: "s4_terminal", b: "s4_terminal", c: "s4_terminal" },
        rationale: "~9%. Even a 99%/99% test gives only ~9% posterior when prevalence is 0.1%. False positives from the healthy majority (0.01 × 99.9% ≈ 1%) swamp true positives (0.99 × 0.1% ≈ 0.1%). This is why mass screening programs always confirm with a second test.",
      },
    },
  },
  knowledgeCheck: [
    {
      question: "Disease prevalence is 2%, sensitivity is 80%, specificity is 95%. Which value do you plug in as P(A) in Bayes' theorem?",
      options: ["0.02 — the prior probability of disease", "0.80 — the sensitivity of the test", "0.95 — the specificity of the test"],
      correctIndex: 0,
      explanation: "P(A) = P(Disease) = 0.02 is the prior. Sensitivity and specificity are likelihoods P(+|Disease) and P(−|No Disease), not priors.",
    },
    {
      question: "After computing P(Disease | Positive) = 0.12, a second independent test is run. What is the correct prior for the second Bayes update?",
      options: ["0.12 — the posterior from the first test becomes the new prior", "0.02 — always use the population prevalence", "0.80 — use the test sensitivity"],
      correctIndex: 0,
      explanation: "Bayesian updating is sequential: the posterior of round N is the prior for round N+1. This is what makes Bayesian reasoning iterative and coherent.",
    },
  ],
},

"st-p2": {
  durationLabel: "15 min",
  outcomes: [
    "Apply the 68-95-99.7 rule to answer probability questions about normal distributions",
    "Compute and interpret z-scores correctly",
    "Use the normal distribution to set tolerance bounds and detect anomalies",
    "Recognize when normality assumptions are appropriate or may be violated",
  ],
  learnMarkdown: `## Normal Distribution & The 68-95-99.7 Rule

The **normal (Gaussian) distribution** is symmetric, bell-shaped, and completely described by two parameters: **mean μ** (center) and **standard deviation σ** (spread).

\`\`\`
X ~ N(μ, σ²)

f(x) = (1 / σ√2π) · exp(−(x−μ)² / 2σ²)
\`\`\`

## The Empirical Rule (68-95-99.7)

| Range | % of data |
|-------|-----------|
| μ ± 1σ | ~68.27% |
| μ ± 2σ | ~95.45% |
| μ ± 3σ | ~99.73% |

**Key corollary:** data beyond 2σ occurs only ~5% of the time, and beyond 3σ only ~0.3%. These thresholds power control charts, anomaly detection, and A/B test significance levels.

## The Z-Score

A **z-score** converts any normal variable to the standard normal N(0,1):

\`\`\`
z = (x − μ) / σ
\`\`\`

Common mistake: dividing by σ² (variance) instead of σ (standard deviation). The units of z must be dimensionless.

**Example:** IQ ~ N(100, 15²). P(IQ > 130)?
\`\`\`
z = (130 − 100) / 15 = 2.0
P(Z > 2) = 1 − 0.9772 = 2.28% ≈ 2.5% (1 tail of the 95% rule)
\`\`\`

## Quality Control Example

Bolt diameter ~ N(10mm, 0.1mm²) — note: σ = 0.1mm, variance = 0.01mm².
\`\`\`
Spec limits: [9.8mm, 10.2mm]
z_lower = (9.8 − 10) / 0.1 = −2.0
z_upper = (10.2 − 10) / 0.1 =  2.0

P(within spec) = P(−2 < Z < 2) ≈ 95.45%
P(out of spec) ≈ 4.55% → ~45,500 defects per million
\`\`\`

## Checking Normality

Before assuming normality:
- **Q-Q plot** — points should fall along a diagonal line
- **Shapiro-Wilk test** — p > 0.05 means can't reject normality (small samples)
- **Histogram + KDE** — visual check for symmetric bell shape
- **Skewness & kurtosis** — |skew| < 0.5, excess kurtosis near 0 for near-normal

## Interview hook (answer like a senior)

> "I use the 68-95-99.7 rule constantly as a mental calculator — if someone asks whether a data point three standard deviations from the mean is unusual, I know immediately it's a 1-in-370 event. For production anomaly detection I set thresholds at ±3σ, but I always check whether the underlying process is actually normal first with a Q-Q plot. Many financial and business metrics are log-normal or heavy-tailed, where the 3σ rule wildly underestimates extreme event frequency."
`,
  video: null,
  videoFallbackMarkdown: `## Normal Distribution Visually

Imagine the bell curve centered at μ=0:

- The middle 68% falls between -1σ and +1σ
- The middle 95% falls between -2σ and +2σ
- Nearly all data (99.7%) falls between -3σ and +3σ

Each additional σ from the center represents increasingly rare events. The symmetry means left and right tails are mirror images — so "beyond +2σ" and "beyond -2σ" each hold ~2.5% of the distribution.
`,
  tryGuidance: "Adjust μ and σ on the visualization to see how the bell curve shifts and stretches. Use the z-score calculator to find exact probabilities. Try IQ > 145 (3σ above mean) and see how rare it really is. Then switch to the 'shaded area' mode to visualize P(a < X < b) for a manufacturing tolerance problem.",
  interviewGraph: {
    initialStageId: "s1_iq",
    artifactDimensions: [
      { label: "Empirical rule application", recoveryStageId: "r1_empirical" },
      { label: "Correct z-score formula", recoveryStageId: "r2_zscore", passLabel: "Formula identified" },
      { label: "Two-tailed probability", recoveryStageId: "r3_twotail" },
    ],
    stages: {
      s1_iq: {
        id: "s1_iq",
        type: "scenario_choice",
        badge: "Stage 1",
        title: "Stage 1 · IQ and the Empirical Rule",
        prompt: "IQ scores are normally distributed with μ=100 and σ=15. What percentage of people have an IQ above 130?",
        code_snippet: `X ~ N(μ=100, σ=15)
z = (130 − 100) / 15 = 2.0

68-95-99.7 rule:
  P(μ − 2σ < X < μ + 2σ) ≈ 95%
  P(X > μ + 2σ)           ≈ ?`,
        choices: [
          { id: "a", label: "~2.5%", description: "130 is exactly 2σ above mean. The upper tail of the 95% range is ~2.5%." },
          { id: "b", label: "~16%", description: "That's the area above 1σ, not 2σ." },
          { id: "c", label: "~5%", description: "5% is the two-tailed area outside ±2σ, not one tail." },
          { id: "d", label: "~32%", description: "That's the area outside ±1σ combined." },
        ],
        branches: { a: "s2_zscore_click", b: "r1_empirical", c: "r1_empirical", d: "r1_empirical" },
        rationale: "130 = 100 + 2×15 is exactly 2σ above the mean. The 95% rule says 95% of data falls within ±2σ, leaving 5% in both tails combined. By symmetry, the upper tail alone (IQ > 130) is 5%/2 = 2.5%. Precisely: P(Z > 2) = 1 − Φ(2) ≈ 2.28%.",
      },
      s2_zscore_click: {
        id: "s2_zscore_click",
        type: "click_target",
        badge: "Stage 2 · Formula",
        title: "Stage 2 · Spot the Z-Score Error",
        prompt: "An analyst wrote three z-score calculations. One has a formula error — it uses the wrong denominator. Click the line with the bug.",
        code_snippet: `-- Standardizing data points
z_height = (175 − 170) / 7          -- line A: z = (x−μ)/σ
z_weight = (80 − 75) / 6.25         -- ds-target:wrong_denominator
z_salary = (95000 − 82000) / 12000  -- line C: z = (x−μ)/σ`,
        validationCopy: {
          wrong_denominator: "Correct. Line B divides by 6.25 which is σ² (variance = 6.25, so σ = 2.5). The z-score formula requires dividing by σ, not σ². Using variance in the denominator produces a value with units of 1/kg rather than a dimensionless standard score, making comparisons meaningless.",
        },
        branches: { wrong_denominator: "s3_bolts" },
      },
      s3_bolts: {
        id: "s3_bolts",
        type: "scenario_choice",
        badge: "Stage 3",
        title: "Stage 3 · Manufacturing Tolerance",
        prompt: "A process produces bolts where diameter ~ N(10mm, 0.01mm²). Note: σ² = 0.01, so σ = 0.1mm. What percentage of bolts fall outside the spec range [9.8mm, 10.2mm]?",
        code_snippet: `μ = 10mm,  σ² = 0.01,  σ = 0.1mm

z_low  = (9.8  − 10) / 0.1 = −2.0
z_high = (10.2 − 10) / 0.1 = +2.0

P(9.8 < X < 10.2) = P(−2 < Z < 2) ≈ 95%
P(outside spec)   = ?`,
        choices: [
          { id: "a", label: "~5%", description: "100% − 95% = 5% falls outside ±2σ by the empirical rule." },
          { id: "b", label: "~0.3%", description: "That's outside ±3σ, not ±2σ." },
          { id: "c", label: "~32%", description: "That's outside ±1σ." },
          { id: "d", label: "~2.5%", description: "That's one tail only; the spec is two-sided." },
        ],
        branches: { a: "s4_terminal", b: "r3_twotail", c: "r3_twotail", d: "r3_twotail" },
        rationale: "The spec [9.8, 10.2] corresponds to [μ−2σ, μ+2σ]. The 95% rule tells us ~95% of bolts are within spec, so ~5% are defective. This is the basis of Six Sigma: pushing tolerances to ±6σ reduces defects to ~3.4 per million.",
      },
      r1_empirical: {
        id: "r1_empirical",
        type: "scenario_choice",
        badge: "Recovery · Empirical Rule",
        title: "Recovery · The 68-95-99.7 Rule",
        prompt: "For a normal distribution, roughly what percentage of data falls within 1, 2, and 3 standard deviations of the mean?",
        code_snippet: `Within ±1σ: ____%
Within ±2σ: ____%
Within ±3σ: ____%`,
        choices: [
          { id: "a", label: "68%, 95%, 99.7%", description: "The empirical rule — memorize these three numbers." },
          { id: "b", label: "50%, 75%, 90%", description: "These are Chebyshev bounds (work for any distribution, not just normal)." },
          { id: "c", label: "68%, 90%, 99%", description: "Close but not the standard values for the normal distribution." },
        ],
        branches: { a: "s2_zscore_click", b: "r1_empirical", c: "r1_empirical" },
        rationale: "68-95-99.7 is the empirical rule for the normal distribution specifically. Chebyshev's inequality gives 0%, 75%, 89% as guaranteed lower bounds for any distribution, but the normal is much tighter.",
      },
      r2_zscore: {
        id: "r2_zscore",
        type: "scenario_choice",
        badge: "Recovery · Z-Score",
        title: "Recovery · Z-Score Formula",
        prompt: "Which is the correct z-score formula, and why does the denominator matter?",
        code_snippet: `Option A: z = (x − μ) / σ
Option B: z = (x − μ) / σ²
Option C: z = (x − μ) × σ
Option D: z = x / σ − μ`,
        choices: [
          { id: "a", label: "Option A: divide by σ (standard deviation)", description: "This makes z dimensionless and maps to the standard normal." },
          { id: "b", label: "Option B: divide by σ² (variance)", description: "Variance has squared units — this produces a non-standard scale." },
          { id: "c", label: "Option C: multiply by σ", description: "Multiplying by σ amplifies the deviation rather than standardizing it." },
          { id: "d", label: "Option D: x/σ then subtract μ", description: "This mixes the operation order incorrectly." },
        ],
        branches: { a: "s3_bolts", b: "r2_zscore", c: "r2_zscore", d: "r2_zscore" },
        rationale: "z = (x − μ) / σ subtracts the mean first (centering) then divides by the standard deviation (scaling), producing a value with mean 0 and std 1. Using σ² in the denominator is the most common mistake — always check whether a problem gives you σ or σ².",
      },
      r3_twotail: {
        id: "r3_twotail",
        type: "scenario_choice",
        badge: "Recovery · Two-Tailed Area",
        title: "Recovery · Outside Both Tails",
        prompt: "The spec [μ−2σ, μ+2σ] is a two-sided range. If 95% falls inside, what falls outside?",
        code_snippet: `P(μ−2σ < X < μ+2σ) = 95%

P(X < μ−2σ)  +  P(X > μ+2σ)
= left tail   +  right tail
= 2.5%        +  2.5%
= ?`,
        choices: [
          { id: "a", label: "5% total outside (2.5% in each tail)", description: "100% − 95% = 5%, split evenly by symmetry." },
          { id: "b", label: "2.5% total outside (one tail only)", description: "The spec is two-sided, so both tails count as out-of-spec." },
          { id: "c", label: "10% total outside", description: "No — if 95% is inside, exactly 5% is outside." },
        ],
        branches: { a: "s4_terminal", b: "r3_twotail", c: "r3_twotail" },
        rationale: "5% outside ±2σ, split 2.5%+2.5% by symmetry of the normal. For a two-sided tolerance, you must account for both tails. Forgetting this gives the answer of 2.5% — which would apply only if the spec were one-sided (e.g., bolt must be no longer than 10.2mm, any length shorter is fine).",
      },
      s4_terminal: {
        id: "s4_terminal",
        type: "scenario_choice",
        badge: "Terminal",
        title: "Revision complete · Normality in Practice",
        terminal: true,
        prompt: "What does it mean for a dataset to be 'approximately normal', and which tools would you use to verify this assumption?",
        code_snippet: `# Checking normality in Python
import scipy.stats as stats
import matplotlib.pyplot as plt

# Q-Q plot: points on diagonal line → normal
stats.probplot(data, plot=plt)

# Shapiro-Wilk (good for n < 2000)
stat, p = stats.shapiro(data)
# p > 0.05: cannot reject normality

# Visual histogram
plt.hist(data, bins='auto', density=True)`,
        choices: [
          { id: "a", label: "Q-Q plot, Shapiro-Wilk test, and checking skewness/kurtosis — use all three together", description: "No single test is definitive; triangulate with visual and statistical checks." },
          { id: "b", label: "Just check that the histogram looks like a bell", description: "Histograms are too sensitive to bin choice to be the sole test." },
          { id: "c", label: "Normal if n > 30 by the CLT", description: "CLT applies to sample means, not individual observations." },
        ],
        branches: { a: "s4_terminal", b: "s4_terminal", c: "s4_terminal" },
        rationale: "Approximately normal means the distribution is close enough to normal that normal-based inference (confidence intervals, t-tests) gives reliable results. Use Q-Q plots for visual diagnosis, Shapiro-Wilk for a formal test (small samples), and check skewness/kurtosis numerically. For large samples, the CLT protects the sample mean but individual observations can remain non-normal.",
      },
    },
  },
  knowledgeCheck: [
    {
      question: "X ~ N(50, 100). Note σ² = 100, so σ = 10. What z-score corresponds to x = 70?",
      options: ["z = 2.0  →  (70−50)/10", "z = 0.2  →  (70−50)/100", "z = 20   →  (70−50)×10"],
      correctIndex: 0,
      explanation: "σ = √100 = 10. z = (70−50)/10 = 2.0. A common mistake is dividing by the variance (100) rather than the standard deviation (10), giving 0.2 — an answer that would represent a very common event rather than a moderately rare one.",
    },
    {
      question: "Using the 68-95-99.7 rule, approximately what percentage of data in N(0,1) lies between -3 and +3?",
      options: ["99.7%", "95%", "68%"],
      correctIndex: 0,
      explanation: "±3σ captures 99.73% of a normal distribution. This is why ±3σ control limits in manufacturing or monitoring catch nearly all natural variation while flagging true anomalies.",
    },
  ],
},

"st-p3": {
  durationLabel: "18 min",
  outcomes: [
    "Select the correct discrete distribution (Binomial vs Poisson) for a given data scenario",
    "Compute probabilities using the Binomial and Poisson PMFs",
    "Identify the conditions under which Poisson approximates Binomial",
    "Calculate mean, variance, and standard deviation for both distributions",
  ],
  learnMarkdown: `## Binomial, Poisson & When to Use Each

Both are **discrete** distributions, but they model fundamentally different processes.

## Binomial Distribution

Use when you have a **fixed number of independent trials**, each with the same probability of success.

\`\`\`
X ~ Binomial(n, p)

P(X = k) = C(n,k) · pᵏ · (1−p)ⁿ⁻ᵏ

Mean     = np
Variance = np(1−p)
Std Dev  = √(np(1−p))
\`\`\`

**Required conditions:**
1. Fixed n trials
2. Each trial is binary (success/failure)
3. Trials are independent
4. Constant probability p per trial

**Example:** 100 website visitors, each converts with probability 0.03.
\`\`\`
X ~ Binomial(100, 0.03)
Mean = 100 × 0.03 = 3 conversions
Std  = √(100 × 0.03 × 0.97) ≈ 1.71
\`\`\`

## Poisson Distribution

Use when modeling **counts of events over a fixed interval** (time, area, volume) with a known average rate.

\`\`\`
X ~ Poisson(λ)

P(X = k) = e⁻λ · λᵏ / k!

Mean     = λ
Variance = λ     ← mean equals variance, a key diagnostic
Std Dev  = √λ
\`\`\`

**Required conditions:**
1. Events occur at a constant average rate λ
2. Events are independent
3. Two events cannot happen at the same instant (rare events)

**Example:** A call center receives an average of 4 calls/minute.
\`\`\`
X ~ Poisson(4)
P(X = 6) = e⁻⁴ · 4⁶ / 6! = 0.1042 ≈ 10.4%
Mean = Variance = 4
\`\`\`

## Poisson as an Approximation for Binomial

When **n is large, p is small, and λ = np is moderate** (say λ < 10), Poisson(λ) closely approximates Binomial(n, p). This is useful because Poisson has only one parameter and is computationally simpler.

\`\`\`
Rule of thumb: n ≥ 20, p ≤ 0.05
Then Binomial(n, p) ≈ Poisson(λ = np)
\`\`\`

## Decision Framework

| Question | Use |
|----------|-----|
| Fixed n trials, binary outcome? | Binomial |
| Counting events over time/space? | Poisson |
| n large, p small (rare events)? | Either (Poisson simpler) |
| Mean ≠ variance in data? | Check Poisson assumption |

## Interview hook (answer like a senior)

> "The quickest way to distinguish them: Binomial asks 'how many successes in n attempts' while Poisson asks 'how many events in a fixed window'. In practice I also use overdispersion as a diagnostic — if I fit Poisson and the observed variance significantly exceeds the mean, the independence assumption is likely violated and I'd consider a Negative Binomial instead. For web analytics, click-through events are almost always Poisson in theory but show overdispersion in practice due to user clustering."
`,
  video: null,
  videoFallbackMarkdown: `## Binomial vs Poisson: Key Visual

Binomial(n=20, p=0.15):
- Discrete bars from k=0 to k=20
- Mean = np = 3, Var = np(1-p) = 2.55

Poisson(λ=3):
- Discrete bars from k=0 to k=∞ (practically k=0..15)
- Mean = Var = 3

At n=20, p=0.15, both distributions look nearly identical — this illustrates the Poisson approximation for small p.
`,
  tryGuidance: "Switch between the Binomial and Poisson tabs. On the Binomial tab, set n=100 and p=0.03, then compare to Poisson with λ=3 — they look nearly identical, demonstrating the approximation. Notice that the Binomial PMF bar chart shifts and widens as you increase n or p. On the Poisson tab, watch how the distribution becomes more symmetric as λ increases (approaching normal by CLT).",
  interviewGraph: {
    initialStageId: "s1_website",
    artifactDimensions: [
      { label: "Distribution selection", recoveryStageId: "r1_selection" },
      { label: "Poisson conditions", recoveryStageId: "r2_poisson_cond" },
      { label: "Approximation rule", recoveryStageId: "r3_approx" },
    ],
    stages: {
      s1_website: {
        id: "s1_website",
        type: "scenario_choice",
        badge: "Stage 1",
        title: "Stage 1 · Website Conversion Modeling",
        prompt: "A website converts at 3%. You show it to 100 visitors. Which distribution models the number of conversions, and why?",
        code_snippet: `n = 100 visitors (fixed)
p = 0.03 (constant conversion rate)
Each visitor independently converts or not

X = number of conversions
X ~ ?`,
        choices: [
          { id: "a", label: "Binomial(n=100, p=0.03)", description: "Fixed n, binary outcome per trial, independent trials, constant p." },
          { id: "b", label: "Poisson(λ=3)", description: "Conversions per unit time with unknown n." },
          { id: "c", label: "Normal(μ=3, σ²=2.91)", description: "Normal is continuous and only approximates discrete counts for large n." },
          { id: "d", label: "Uniform(0, 100)", description: "All counts are equally likely — clearly not the case." },
        ],
        branches: { a: "s2_callcenter", b: "r1_selection", c: "r1_selection", d: "r1_selection" },
        rationale: "Binomial(100, 0.03) is exact: fixed n=100 visitors, each independently converts with p=0.03. Poisson(3) would be a good approximation (n large, p small, λ=np=3) but Binomial is the precise model when n is known and fixed.",
      },
      s2_callcenter: {
        id: "s2_callcenter",
        type: "scenario_choice",
        badge: "Stage 2",
        title: "Stage 2 · Call Center Arrivals",
        prompt: "A call center receives an average of 4 calls per minute. Which distribution models the number of calls in a 1-minute window?",
        code_snippet: `λ = 4 calls per minute (average rate)
Window = 1 minute (fixed interval)
Calls arrive independently

X = number of calls in 1 minute
X ~ ?`,
        choices: [
          { id: "a", label: "Poisson(λ=4)", description: "Counting independent events over a fixed interval with known rate." },
          { id: "b", label: "Binomial(n=4, p=1)", description: "n=4 trials, each certain to succeed — degenerately not what's happening." },
          { id: "c", label: "Normal(μ=4, σ=2)", description: "Normal is continuous and a poor fit for small-count discrete data." },
          { id: "d", label: "Geometric(p=0.25)", description: "Geometric models waiting time to first success, not event counts." },
        ],
        branches: { a: "s3_wrong_dist_click", b: "r2_poisson_cond", c: "r2_poisson_cond", d: "r2_poisson_cond" },
        rationale: "Poisson(4) is the standard model: events arrive independently at constant rate λ=4/min, n is not fixed (could be 0, 4, 10, …). The Poisson assumptions match: constant rate, independence, events can't overlap in time.",
      },
      s3_wrong_dist_click: {
        id: "s3_wrong_dist_click",
        type: "click_target",
        badge: "Stage 3 · Click",
        title: "Stage 3 · Spot the Wrong Distribution",
        prompt: "An analyst is modeling call center data. One line applies Binomial where Poisson is appropriate. Click the line with the distribution error.",
        code_snippet: `# Modeling daily customer contacts
emails_per_day = Binomial(n=500, p=0.08)   -- line A: emails sent, each opens or not
support_calls  = Binomial(n=4, p=1.0)      -- ds-target:wrong_dist_line
chat_sessions  = Poisson(lam=12.5)         -- line C: avg 12.5 chats/hour`,
        validationCopy: {
          wrong_dist_line: "Correct. Line B uses Binomial(n=4, p=1.0) to model support calls — but we don't have a fixed number of 'trials', each of which either becomes a call or not. Calls arrive as a stream at some rate, making Poisson the appropriate distribution. Binomial(4, 1.0) would mean exactly 4 calls always, which is degenerate and wrong.",
        },
        branches: { wrong_dist_line: "s4_approx" },
      },
      s4_approx: {
        id: "s4_approx",
        type: "scenario_choice",
        badge: "Stage 4",
        title: "Stage 4 · Poisson Approximation",
        prompt: "When is Poisson a good approximation for Binomial(n, p)?",
        code_snippet: `Exact:        X ~ Binomial(n=1000, p=0.002)
Approximate:  X ~ Poisson(λ = np = 2.0)

How close are they?
P(X=0): Binomial=0.1353, Poisson=0.1353
P(X=3): Binomial=0.1804, Poisson=0.1804`,
        choices: [
          { id: "a", label: "When n is large, p is small, and λ=np is moderate", description: "Rule of thumb: n ≥ 20, p ≤ 0.05. The approximation improves as n→∞ and p→0 with np fixed." },
          { id: "b", label: "When n and p are both large", description: "Large p means many successes — the distribution is not rare-event dominated." },
          { id: "c", label: "When the variance equals the mean", description: "That's a property of Poisson, not a condition for using it to approximate Binomial." },
          { id: "d", label: "Only when n > 1000", description: "n ≥ 20 with p ≤ 0.05 is sufficient for practical accuracy." },
        ],
        branches: { a: "s5_terminal", b: "r3_approx", c: "r3_approx", d: "r3_approx" },
        rationale: "The Poisson limit theorem: as n→∞ and p→0 with np=λ fixed, Binomial(n,p) → Poisson(λ). Practically, n≥20 and p≤0.05 gives excellent agreement. This matters because Poisson requires only one parameter (λ) and is computationally simpler for large n.",
      },
      r1_selection: {
        id: "r1_selection",
        type: "scenario_choice",
        badge: "Recovery · Selection",
        title: "Recovery · Choosing the Right Distribution",
        prompt: "Match each scenario to the correct distribution.",
        code_snippet: `Scenario A: 20 students take a pass/fail exam, each passes with P=0.8
Scenario B: Defective microchips found per hour in a factory (avg 2.3/hr)
Scenario C: Number of sales calls until first success`,
        choices: [
          { id: "a", label: "A=Binomial, B=Poisson, C=Geometric", description: "Fixed trials → Binomial; rate over interval → Poisson; waiting time → Geometric." },
          { id: "b", label: "A=Poisson, B=Binomial, C=Normal", description: "Scenario A has fixed n=20 trials, not a rate — that's Binomial, not Poisson." },
          { id: "c", label: "All three are Binomial", description: "Poisson and Geometric are distinct — they model different processes." },
        ],
        branches: { a: "s2_callcenter", b: "r1_selection", c: "r1_selection" },
        rationale: "Binomial: fixed n, binary outcome. Poisson: event count over fixed interval with rate λ. Geometric: number of trials until first success. These three together cover most discrete count scenarios in data science.",
      },
      r2_poisson_cond: {
        id: "r2_poisson_cond",
        type: "scenario_choice",
        badge: "Recovery · Poisson Conditions",
        title: "Recovery · When to Use Poisson",
        prompt: "Which scenario violates a core Poisson assumption?",
        code_snippet: `Scenario A: Earthquakes above magnitude 4 per decade in a region
Scenario B: Goals scored per match in a football league
Scenario C: Car accidents at a busy intersection on Fridays at 5pm
            (rate spikes dramatically at rush hour)`,
        choices: [
          { id: "a", label: "Scenario C — the rate is not constant (rush hour spike)", description: "Poisson requires a stationary rate λ; time-varying rates violate this." },
          { id: "b", label: "Scenario A — earthquakes are not independent", description: "Aftershocks can violate independence, but major earthquakes are often modeled as Poisson." },
          { id: "c", label: "Scenario B — goals are not rare enough", description: "Poisson doesn't require events to be rare — only independent with constant rate." },
        ],
        branches: { a: "s3_wrong_dist_click", b: "r2_poisson_cond", c: "r2_poisson_cond" },
        rationale: "Scenario C has a non-constant rate — accidents spike at rush hour, violating the stationary rate assumption. You'd need to model it with a time-varying intensity (inhomogeneous Poisson process) or separate the data by time window.",
      },
      r3_approx: {
        id: "r3_approx",
        type: "scenario_choice",
        badge: "Recovery · Approximation",
        title: "Recovery · Poisson Approximation Conditions",
        prompt: "Binomial(n=500, p=0.004). Is Poisson a good approximation? What is λ?",
        code_snippet: `n = 500,  p = 0.004
n ≥ 20?   500 ≥ 20  ✓
p ≤ 0.05? 0.004 ≤ 0.05  ✓
λ = np = ?`,
        choices: [
          { id: "a", label: "Yes, Poisson(λ=2) is a good approximation", description: "λ = 500×0.004 = 2.0; both conditions satisfied." },
          { id: "b", label: "No, p is too small for Poisson", description: "Small p is exactly when Poisson works best — rare events." },
          { id: "c", label: "No, n must be greater than 1000", description: "n ≥ 20 with p ≤ 0.05 is sufficient — n=500 easily qualifies." },
        ],
        branches: { a: "s5_terminal", b: "r3_approx", c: "r3_approx" },
        rationale: "n=500 ≥ 20 and p=0.004 ≤ 0.05, so Poisson(λ=np=2) is an excellent approximation. The smaller p is (for fixed λ=np), the better the Poisson approximation becomes.",
      },
      s5_terminal: {
        id: "s5_terminal",
        type: "scenario_choice",
        badge: "Terminal",
        title: "Revision complete · Email Open Rate",
        terminal: true,
        prompt: "You send 200 emails with a historical open rate of 15%. Modeling opens as Binomial(200, 0.15), what are the mean and standard deviation of the number of opens?",
        code_snippet: `X ~ Binomial(n=200, p=0.15)

Mean     = n × p      = 200 × 0.15        = ?
Variance = n × p × (1−p) = 200 × 0.15 × 0.85 = ?
Std Dev  = √Variance                      = ?`,
        choices: [
          { id: "a", label: "Mean=30, Std≈5.05", description: "Mean=30, Var=25.5, Std=√25.5≈5.05." },
          { id: "b", label: "Mean=30, Std=30", description: "Std=30 would mean Var=900 — that's the Poisson assumption (Var=Mean), not Binomial." },
          { id: "c", label: "Mean=15, Std=5", description: "Mean=n×p=200×0.15=30, not 15." },
        ],
        branches: { a: "s5_terminal", b: "s5_terminal", c: "s5_terminal" },
        rationale: "Mean = np = 30. Var = np(1−p) = 200×0.15×0.85 = 25.5. Std = √25.5 ≈ 5.05. Note Var < Mean (25.5 < 30) — this is characteristic of Binomial and contrasts with Poisson where Var = Mean. If you observed Var ≈ Mean in email data, Poisson would also be a reasonable model.",
      },
    },
  },
  knowledgeCheck: [
    {
      question: "A factory produces widgets where each has a 0.5% defect probability. You inspect 400 widgets. What is the mean number of defects, and which distribution applies exactly?",
      options: ["Mean=2, Binomial(400, 0.005) exactly; Poisson(2) is a close approximation", "Mean=2, Poisson(2) exactly; Binomial is an approximation", "Mean=0.5%, Normal(2, 2) approximately"],
      correctIndex: 0,
      explanation: "Binomial(n=400, p=0.005) is exact because n is fixed and each widget independently defects with probability p. Mean=np=2. Poisson(2) is an excellent approximation since n≥20 and p≤0.05, but Binomial is the exact model.",
    },
    {
      question: "For X ~ Poisson(λ=9), what is the standard deviation?",
      options: ["3  →  σ = √λ = √9 = 3", "9  →  σ = λ", "81 →  σ = λ²"],
      correctIndex: 0,
      explanation: "For Poisson: Mean = Variance = λ, so Std Dev = √λ = √9 = 3. This is a key property — the standard deviation grows as the square root of the rate, meaning higher-rate Poisson processes are relatively less variable (lower CV = σ/μ = 1/√λ).",
    },
  ],
},

"st-p4": {
  durationLabel: "20 min",
  outcomes: [
    "State the Central Limit Theorem precisely and identify its conditions",
    "Explain why sample means become approximately normal regardless of population shape",
    "Apply the n≥30 rule of thumb appropriately, with caveats for heavy-tailed populations",
    "Distinguish between CLT applying to sample means vs individual observations",
  ],
  learnMarkdown: `## Central Limit Theorem: Why Everything is Normal

The **Central Limit Theorem (CLT)** is the theoretical backbone of most statistical inference. It states:

> If X₁, X₂, …, Xₙ are i.i.d. random variables with mean μ and finite variance σ², then as n → ∞:
>
> X̄ = (X₁ + … + Xₙ) / n  →  N(μ, σ²/n)

In plain language: **the distribution of sample means becomes normal as sample size grows**, regardless of the population's shape.

\`\`\`
X̄ ~ N(μ, σ²/n)

Standard error of the mean: SE = σ / √n
\`\`\`

## Why This Matters

The CLT is why so many statistical tests (t-tests, z-tests, confidence intervals, regression coefficients) assume normality of estimates even when individual data is not normal. We're almost always working with means or totals of many independent observations.

## The n ≥ 30 Rule of Thumb

"At n=30, the sample mean distribution is approximately normal" is a useful heuristic, but:

| Population shape | n needed for approximate normality |
|-----------------|-------------------------------------|
| Symmetric (near-normal) | n ≥ 5 often sufficient |
| Mildly skewed | n ≥ 15–20 |
| Strongly skewed (e.g., income) | n ≥ 50–100+ |
| Heavy-tailed (e.g., Pareto) | n may need to be very large |

## Critical Distinction: Means vs Individuals

**CLT applies to sample means (and sums), NOT to individual observations.**

\`\`\`python
# Individual income values: right-skewed, NOT normal
individual_incomes = [22000, 35000, 48000, 200000, 1500000]

# Sample means of n=50: approximately normal by CLT
sample_means = [np.mean(sample(50)) for _ in range(1000)]
# ↑ this IS approximately normal
\`\`\`

Common mistake: "n=50 so the data is normally distributed." Wrong — n=50 means the *sample mean* is approximately normal; individual observations remain non-normal.

## Standard Error and Precision

As n increases, the standard error SE = σ/√n decreases — sample means cluster tighter around μ:

\`\`\`
n=1:   SE = σ
n=4:   SE = σ/2
n=25:  SE = σ/5
n=100: SE = σ/10
\`\`\`

Quadrupling n halves the standard error — this drives sample size calculations.

## A/B Testing Connection

When you run an A/B test and compute a conversion rate difference, you're comparing two sample means. The CLT justifies using a normal approximation for the sampling distribution of the difference, enabling z-tests and confidence intervals.

## Interview hook (answer like a senior)

> "The CLT is why regression coefficients have standard errors and why t-statistics follow a t-distribution. But I always emphasize the 'i.i.d.' requirement — the CLT breaks down for correlated observations like time series, or when variance is infinite like Pareto-tailed distributions. And I make sure to be precise: the CLT normalizes the *sample mean's distribution*, not the raw data. A dataset of 1000 salaries is still right-skewed — but the mean salary computed from random samples of 1000 would be normally distributed across repeated experiments."
`,
  video: null,
  videoFallbackMarkdown: `## CLT Simulation Description

Imagine a uniform distribution: any value from 0 to 1 is equally likely.

- Draw 1 observation: the distribution of that single value is uniform (flat).
- Draw 5, compute mean: the distribution of means is triangular (less flat).
- Draw 30, compute mean: the distribution of means is clearly bell-shaped.
- Draw 100, compute mean: the distribution is a tight, normal bell centered at 0.5.

The population never changed — it's still uniform. But the *distribution of sample means* converges to normal. That's the CLT in action.
`,
  tryGuidance: "Try all three population shapes with n=1 to see the original distribution. Then increase n to 5, 10, 30, 100 and observe the histogram of sample means transforming into a bell curve. Pay attention to the exponential/skewed population — at n=5 it's still right-skewed, but by n=30 it's approximately normal. Watch the theoretical σ/√n shrink as n grows — this is the standard error narrowing.",
  interviewGraph: {
    initialStageId: "s1_skewed_income",
    artifactDimensions: [
      { label: "CLT convergence rate", recoveryStageId: "r1_convergence" },
      { label: "Sample size rule", recoveryStageId: "r2_n30" },
      { label: "Means vs individuals", recoveryStageId: "r3_means_vs_indiv" },
    ],
    stages: {
      s1_skewed_income: {
        id: "s1_skewed_income",
        type: "scenario_choice",
        badge: "Stage 1",
        title: "Stage 1 · Small Sample from Skewed Population",
        prompt: "You sample n=5 observations from a heavily right-skewed income distribution. The distribution of sample means (across many such samples of n=5) is:",
        code_snippet: `Population: income (strongly right-skewed)
μ = $65,000,  σ = $80,000  (skewness ≈ 3.5)
Sample size: n = 5

X̄ = (X₁ + X₂ + X₃ + X₄ + X₅) / 5`,
        choices: [
          { id: "a", label: "Still noticeably right-skewed — n=5 is too small for CLT to kick in here", description: "For heavily skewed populations, n=5 is far too small for the sample mean to be approximately normal." },
          { id: "b", label: "Approximately normal — CLT applies for any n", description: "CLT is an asymptotic result; for small n and skewed populations, convergence is slow." },
          { id: "c", label: "Exactly normal — individual incomes are large enough", description: "CLT doesn't depend on the magnitude of values, and normality of individuals is irrelevant." },
          { id: "d", label: "Uniform — the mean averages out the skew completely", description: "Averaging reduces skew but doesn't produce a uniform distribution." },
        ],
        branches: { a: "s2_n30_rule", b: "r1_convergence", c: "r1_convergence", d: "r1_convergence" },
        rationale: "For a strongly skewed population (skewness ≈ 3.5), n=5 sample means will still show noticeable right skew. The CLT guarantees normality only in the limit — in practice, strongly skewed populations may need n=50+ for the sample mean distribution to look approximately normal.",
      },
      s2_n30_rule: {
        id: "s2_n30_rule",
        type: "scenario_choice",
        badge: "Stage 2",
        title: "Stage 2 · The n ≥ 30 Rule",
        prompt: "At what sample size does the CLT typically justify treating the sample mean as approximately normally distributed, and what is the important caveat?",
        code_snippet: `Symmetric population  → CLT kicks in at n ≈ 5–10
Moderate skew         → CLT kicks in at n ≈ 20–30
Heavy skew / tails    → CLT may need n > 100

Common interview rule: n ≥ 30`,
        choices: [
          { id: "a", label: "n ≥ 30 as a rule of thumb, but it depends on population skewness — heavier tails need larger n", description: "Correct: 30 is a starting point, not a universal guarantee." },
          { id: "b", label: "n ≥ 30 always guarantees approximate normality for any population", description: "Not for very heavy-tailed distributions like Pareto or Cauchy." },
          { id: "c", label: "n ≥ 100 is always required", description: "n=30 is sufficient for most practical distributions." },
          { id: "d", label: "n ≥ 5 is always enough because averaging smooths everything", description: "Averaging reduces but doesn't eliminate non-normality for small n." },
        ],
        branches: { a: "s3_wrong_claim_click", b: "r2_n30", c: "r2_n30", d: "r2_n30" },
        rationale: "n ≥ 30 is the standard rule of thumb for approximately symmetric distributions. For skewed distributions, more is better — income distributions often need n > 100. For infinite-variance distributions (Cauchy, heavy Pareto), the CLT doesn't apply at all.",
      },
      s3_wrong_claim_click: {
        id: "s3_wrong_claim_click",
        type: "click_target",
        badge: "Stage 3 · Click",
        title: "Stage 3 · Spot the Misapplication of CLT",
        prompt: "An analyst wrote comments in their analysis notebook. One comment misapplies the CLT. Click the line with the incorrect claim.",
        code_snippet: `# A/B test analysis — n=500 users per variant
# The sampling distribution of conversion rate difference is normal by CLT  -- line A
# With n=500, our sample mean estimate is reliable  -- line B
individual_revenues = fetch_user_revenues()  # right-skewed raw data
# Since n=500, individual revenue values are normally distributed  -- ds-target:wrong_clt_claim`,
        validationCopy: {
          wrong_clt_claim: "Correct. Line D claims individual revenue values are normally distributed because n=500. This misapplies the CLT — the theorem says the *distribution of the sample mean* (across repeated experiments) is approximately normal, not that individual observations become normal. The raw revenue data remains right-skewed regardless of sample size.",
        },
        branches: { wrong_clt_claim: "s4_terminal" },
      },
      r1_convergence: {
        id: "r1_convergence",
        type: "scenario_choice",
        badge: "Recovery · Convergence Rate",
        title: "Recovery · How Fast Does CLT Converge?",
        prompt: "You draw samples of size n=1, 5, 30, 100 from a right-skewed population. At which sample size does the distribution of sample means first appear approximately normal?",
        code_snippet: `n=1:   Distribution of X̄ = X₁ = original right-skewed shape
n=5:   Distribution of X̄ is ... still slightly skewed
n=30:  Distribution of X̄ is ... approximately bell-shaped
n=100: Distribution of X̄ is ... tightly normal`,
        choices: [
          { id: "a", label: "Around n=30 for moderate skew (may need more for heavy skew)", description: "n=30 is the rule of thumb, though strongly skewed populations need more." },
          { id: "b", label: "n=5 — any averaging is enough to produce normality", description: "n=5 still retains substantial skew for a skewed population." },
          { id: "c", label: "n=1 — the CLT applies even to single observations", description: "A single observation just has the population's distribution — CLT hasn't acted." },
        ],
        branches: { a: "s2_n30_rule", b: "r1_convergence", c: "r1_convergence" },
        rationale: "CLT convergence speed depends on skewness. For a moderately right-skewed distribution, n=30 is typically sufficient. For the income distribution with skewness > 3, you might need n=50–100. The rule n≥30 assumes 'moderate' departure from normality.",
      },
      r2_n30: {
        id: "r2_n30",
        type: "scenario_choice",
        badge: "Recovery · n ≥ 30",
        title: "Recovery · What the n ≥ 30 Rule Actually Means",
        prompt: "Which statement correctly explains the n ≥ 30 heuristic?",
        code_snippet: `True or false for each:
A) n ≥ 30 means each individual observation is normal
B) n ≥ 30 means the sample mean X̄ is approximately normal
C) n ≥ 30 works for any distribution including Cauchy
D) n ≥ 30 means the standard error is small enough to ignore`,
        choices: [
          { id: "a", label: "Only B is true — CLT applies to the distribution of X̄, not individuals", description: "The theorem is about the sampling distribution of the mean." },
          { id: "b", label: "A and B are true — large n normalizes both individuals and means", description: "Individual observations retain their population distribution regardless of n." },
          { id: "c", label: "B and C are true — n=30 works universally", description: "Cauchy distribution has undefined variance — CLT doesn't apply to it at all." },
        ],
        branches: { a: "s3_wrong_claim_click", b: "r2_n30", c: "r2_n30" },
        rationale: "Only B: the CLT states that the sampling distribution of X̄ is approximately normal for large n (with the caveats about distribution type). Individual observations keep their original distribution. The Cauchy distribution has undefined mean and variance — it violates the finite-variance requirement for the CLT.",
      },
      r3_means_vs_indiv: {
        id: "r3_means_vs_indiv",
        type: "scenario_choice",
        badge: "Recovery · Means vs Individuals",
        title: "Recovery · The Key CLT Distinction",
        prompt: "A dataset of 200 customer purchase amounts is heavily right-skewed (many small purchases, a few very large ones). Which statement is correct?",
        code_snippet: `purchase_amounts = load_data()  # n=200, right-skewed

mean_estimate = np.mean(purchase_amounts)
# The sampling distribution of mean_estimate is approximately normal
# (if we were to repeat the sampling many times)

# But the individual purchase_amounts themselves are... ?`,
        choices: [
          { id: "a", label: "Individuals remain right-skewed; the sample mean's sampling distribution is approximately normal", description: "CLT applies to the mean, not the raw data." },
          { id: "b", label: "Both individuals and the sample mean are right-skewed since n=200 isn't enough", description: "n=200 is enough for the mean to be approximately normal for most distributions." },
          { id: "c", label: "Both are approximately normal because n=200 is large", description: "n=200 doesn't change the shape of individual observations." },
        ],
        branches: { a: "s4_terminal", b: "r3_means_vs_indiv", c: "r3_means_vs_indiv" },
        rationale: "This is the most important CLT distinction. The 200 individual purchase amounts remain right-skewed — you'd need to transform them (e.g., log transform) for them to look normal. But if you repeatedly sampled 200 customers and computed the mean purchase each time, those means would form an approximately normal distribution centered at the true mean.",
      },
      s4_terminal: {
        id: "s4_terminal",
        type: "scenario_choice",
        badge: "Terminal",
        title: "Revision complete · False Positives in A/B Tests",
        terminal: true,
        prompt: "An analyst runs 1000 A/B tests with α=0.05, all on truly null effects (no real difference exists). By the CLT and properties of hypothesis testing, how many false positives should they expect?",
        code_snippet: `α = 0.05 (significance threshold)
Number of tests = 1000
True effect size = 0 for all tests

Under H₀, P(false positive) = α = 0.05

Expected false positives = 1000 × 0.05 = ?`,
        choices: [
          { id: "a", label: "~50 false positives — 5% of tests will cross the threshold by chance", description: "With α=0.05, the false positive rate is exactly 5% under the null." },
          { id: "b", label: "~0 — if there's no effect, no test should be significant", description: "Random variation in test statistics will produce false positives at rate α even with no effect." },
          { id: "c", label: "~500 — half the tests will be significant by coincidence", description: "500 would require α=0.5, not 0.05." },
          { id: "d", label: "Depends on sample size — more data means fewer false positives", description: "Under H₀, P(false positive)=α regardless of sample size; larger n just reduces P(false negative)." },
        ],
        branches: { a: "s4_terminal", b: "s4_terminal", c: "s4_terminal", d: "s4_terminal" },
        rationale: "Expected false positives = 1000 × 0.05 = 50. α is literally the false positive rate under H₀, so running 1000 null tests produces ~50 spurious 'significant' results. This is the multiple testing problem — it motivates Bonferroni correction (α/k) or False Discovery Rate (FDR) control in production A/B testing platforms. The CLT underpins all of this by justifying the normal approximation used to compute p-values.",
      },
    },
  },
  knowledgeCheck: [
    {
      question: "You collect samples of size n=50 from a population with μ=100 and σ=30. What is the standard error of the sample mean?",
      options: ["SE = 30/√50 ≈ 4.24", "SE = 30/50 = 0.60", "SE = 30² / 50 = 18"],
      correctIndex: 0,
      explanation: "SE = σ/√n = 30/√50 ≈ 4.24. This tells you the typical spread of sample means around the true μ=100. Quadrupling the sample size to n=200 would halve the SE to ≈2.12.",
    },
    {
      question: "A researcher claims: 'Our dataset has n=500 rows, so by the CLT the data is normally distributed.' What is wrong with this statement?",
      options: [
        "CLT applies to the sampling distribution of the mean, not to individual observations — the raw data can remain non-normal",
        "Nothing is wrong — n=500 guarantees normality by CLT",
        "The threshold should be n=30, not n=500",
      ],
      correctIndex: 0,
      explanation: "The CLT guarantees that the distribution of sample means is approximately normal for large n — it says nothing about whether individual observations are normal. Raw data (individual rows) retains whatever shape the underlying population has. This is one of the most common misstatements of the CLT in practice.",
    },
  ],
},

  // ── injected from stat_inference1_lessons.js ──
  "st-i1": {
  durationLabel: "22 min",
  outcomes: [
    "State null and alternative hypotheses in testable, pre-specified form.",
    "Explain why HARKing (Hypothesizing After Results Known) invalidates p-value interpretation.",
    "Distinguish one-tailed from two-tailed tests and defend the choice under interview pressure.",
  ],
  learnMarkdown: `## The framework behind every hypothesis test

A hypothesis test is a structured decision procedure, not a truth machine. Before you see data, you commit to:

1. **H₀ (null hypothesis)** — the baseline claim of no effect or no difference. Always includes equality.
2. **H₁ (alternative hypothesis)** — what you believe if H₀ is false.
3. **α (significance level)** — the tolerated Type I error rate (commonly 0.05).
4. **Test statistic** — a summary of the data that has a known distribution under H₀.
5. **Decision rule** — reject H₀ if p-value < α, or equivalently if |z| > z*.

## Pre-registration is the backbone

The framework only works if you commit to hypotheses *before* seeing data. If you peek at results and then frame the hypothesis to match, you commit **HARKing** — the p-value no longer has valid frequentist meaning because you've effectively searched for a pattern.

## Two-sided vs one-sided tests

- **Two-sided (≠)**: H₁ says the effect can go in either direction. More conservative; preferred unless the direction is theoretically fixed and pre-specified.
- **One-sided (> or <)**: H₁ specifies the direction. More power in that direction, but you forfeit the ability to detect an effect in the other direction.

Choosing one-sided *after* seeing data to squeeze significance is p-hacking.

## Common traps

- **Peeking at data early** and stopping when p < 0.05 inflates Type I error (sequential testing problem; use group sequential methods instead).
- **H₀ should never be a directional claim** — the null hypothesis is the equality/no-difference baseline; the alternative carries the directional claim.
- **Failing to reject H₀ ≠ proving H₀** — low power, small samples, or high variance can all hide a real effect.

\`\`\`
Hypothesis test procedure (pseudocode):
  1. Define H₀: μ_A = μ_B  (no difference)
  2. Define H₁: μ_A ≠ μ_B  (two-sided)
  3. Set α = 0.05 before data collection
  4. Collect data; compute test statistic
  5. If p-value < α → reject H₀
             else  → fail to reject H₀
\`\`\`

## Interview hook (answer like a senior)

"Walk me through how you set up a hypothesis test."

Strong answer: "I start by framing a testable null hypothesis that represents no effect — always an equality claim. I choose the alternative based on the scientific question, decide between one-sided and two-sided (and justify it), then set α before touching the data. If it's a product experiment, I also run a power calculation to ensure I'll have enough observations to detect the minimum effect size that matters to the business. After running the test, the p-value is one input — I also look at effect size, confidence intervals, and whether the test assumptions are met."`,
  video: null,
  videoFallbackMarkdown: `## Hypothesis testing drill (5 minutes)

Without looking at notes, write out the five-step procedure for a two-sided two-sample t-test, specifying each of: H₀, H₁, α, test statistic, and decision rule.

Then answer aloud: "Why does peeking at results before forming the hypothesis invalidate the p-value?"

If you cannot answer fluently, return to the Learn section before attempting the simulation.`,
  tryGuidance: "Run the interview simulation. In Stage 1 choose the statistically correct action when p=0.04. In Stage 2 click the line that represents HARKing. In Stage 3 identify the correctly stated null hypothesis.",
  interviewGraph: {
    initialStageId: "ht_action_choice",
    artifactDimensions: [
      { label: "Decision Rule Fluency", recoveryStageId: "ht_recovery_decision" },
      { label: "HARKing Recognition", recoveryStageId: "ht_recovery_harking" },
      { label: "Null Hypothesis Form", recoveryStageId: "ht_recovery_null", passLabel: "Hypothesis Framework Clear" },
    ],
    stages: {
      ht_action_choice: {
        id: "ht_action_choice",
        type: "scenario_choice",
        badge: "Stage 1",
        title: "Stage 1 · Interpreting p = 0.04",
        prompt: "An A/B test has been running for 3 days. The observed p-value is 0.04 with a pre-specified α = 0.05. The sample size was not pre-calculated. What is the most defensible action?",
        code_snippet: `A/B Test Summary (Day 3 of planned 14-day run)
----------------------------------------------
Control:   n = 412,  conversion = 9.2%
Treatment: n = 408,  conversion = 11.7%
p-value (two-sided): 0.04
Pre-specified α: 0.05`,
        choices: [
          { id: "a", label: "Reject H₀ but note the caveats", description: "Reject H₀ since p < α, but flag that the test ran only 3 of 14 planned days — early stopping inflates Type I error unless a sequential testing correction is applied." },
          { id: "b", label: "Immediately ship the treatment", description: "p < 0.05, so the effect is proven and there's no reason to wait." },
          { id: "c", label: "Declare the result not significant", description: "The experiment ran too few days, so ignore the p-value entirely." },
          { id: "d", label: "Lower α to 0.01 and re-evaluate", description: "Change the threshold post-hoc to make the result safer." },
        ],
        branches: { a: "ht_harking_click", b: "ht_recovery_decision", c: "ht_recovery_decision", d: "ht_recovery_decision" },
        rationale: "The correct answer acknowledges the formal decision (reject H₀ per the pre-specified rule) while flagging the practical issue: stopping early inflates error rates. Immediately shipping ignores statistical discipline; ignoring the result entirely throws away valid data; retroactively tightening α is p-hacking in reverse.",
      },
      ht_recovery_decision: {
        id: "ht_recovery_decision",
        type: "scenario_choice",
        badge: "Recovery 1",
        title: "Recovery · When p < α with caveats",
        prompt: "The interviewer stops you: 'You need to make a decision today. p = 0.04 and α = 0.05. What do you do and what do you report?' Choose the strongest answer.",
        code_snippet: `Pre-specified decision rule: reject H₀ if p < α = 0.05
Observed: p = 0.04
Issue: test stopped at Day 3 of planned Day 14`,
        choices: [
          { id: "a", label: "Formally reject H₀, transparently flag early stopping", description: "The rule says reject. Separately document that early stopping was not pre-specified and the error rate is likely inflated." },
          { id: "b", label: "Report the experiment as failed", description: "p < α means the experiment succeeded by its own pre-specified criterion." },
          { id: "c", label: "Run a new experiment from scratch", description: "The existing data still provides valid (if imperfect) information." },
          { id: "d", label: "Change α to 0.03 to account for early stopping", description: "Retroactively adjusting α is p-hacking; the correct tool is a sequential testing procedure." },
        ],
        branches: { a: "ht_harking_click", b: "ht_recovery_decision", c: "ht_recovery_decision", d: "ht_recovery_decision" },
        rationale: "Formally rejecting and transparently reporting the limitation is the senior answer: it respects the pre-specified rule while giving stakeholders the information they need to weigh the decision.",
      },
      ht_harking_click: {
        id: "ht_harking_click",
        type: "click_target",
        badge: "Stage 2 target",
        title: "Stage 2 · Spot the HARKing",
        prompt: "An analyst looked at the data first, then wrote up a hypothesis test. Click the line that represents HARKing — Hypothesizing After Results Known.",
        code_snippet: `STEP 1: Collected experiment data for 14 days
STEP 2: Observed that treatment had higher revenue for male users
STEP 3: Defined H₁: treatment improves revenue for male users  -- ds-target:harking_line
STEP 4: Ran t-test on male-user subgroup; p = 0.03
STEP 5: Reported: "We pre-specified this hypothesis and it is significant"`,
        validationCopy: {
          harking_line: "Correct. H₁ was formed after seeing that males had higher revenue — the test is now circular. The p-value no longer reflects a pre-specified decision rule; it is a post-hoc rationalization.",
        },
        branches: { harking_line: "ht_null_form_choice" },
      },
      ht_recovery_harking: {
        id: "ht_recovery_harking",
        type: "scenario_choice",
        badge: "Recovery 2",
        title: "Recovery · Why HARKing breaks the p-value",
        prompt: "Why does forming H₁ after seeing which subgroup had the largest effect invalidate the p-value?",
        code_snippet: `# The frequentist guarantee:
# P(reject H₀ | H₀ true) = α  —  only if H₁ is pre-specified
# If you search over subgroups and pick the best one,
# you are effectively running many tests simultaneously.`,
        choices: [
          { id: "a", label: "It turns one test into implicit multiple testing", description: "Searching many subgroups and reporting the best result inflates the effective family-wise error rate far above α." },
          { id: "b", label: "t-tests are invalid on subgroups", description: "t-tests are valid on any subset; the problem is with the hypothesis, not the test statistic." },
          { id: "c", label: "The sample is too small", description: "Sample size is a separate concern; HARKing is a problem even in large samples." },
          { id: "d", label: "Male users have different variance", description: "Variance differences affect the test statistic, not the conceptual validity of the p-value framework." },
        ],
        branches: { a: "ht_null_form_choice", b: "ht_recovery_harking", c: "ht_recovery_harking", d: "ht_recovery_harking" },
        rationale: "HARKing is implicit multiple testing: by scanning data for patterns and then framing them as hypotheses, you've searched without adjusting for the search, making the p-value meaningless as a decision threshold.",
      },
      ht_null_form_choice: {
        id: "ht_null_form_choice",
        type: "scenario_choice",
        badge: "Stage 3",
        title: "Stage 3 · Correctly stated null hypothesis",
        prompt: "Which of the following correctly states a null hypothesis for an A/B test comparing email open rates?",
        code_snippet: `Experiment: Two email subject lines (A vs B)
Metric: Open rate (proportion of recipients who opened)
Business goal: Subject B improves open rate`,
        choices: [
          { id: "a", label: "H₀: p_A = p_B", description: "No difference in open rates between the two subject lines. Includes equality — correct null form." },
          { id: "b", label: "H₀: p_B > p_A", description: "This is a directional claim — it belongs in H₁, not H₀. The null is always the equality or no-effect baseline." },
          { id: "c", label: "H₀: subject B is better", description: "Business expectation is not a null hypothesis. H₀ is what you assume in the absence of evidence." },
          { id: "d", label: "H₀: p-value < 0.05", description: "The p-value is a test output, not a hypothesis. H₀ is a claim about population parameters." },
        ],
        branches: { a: "ht_terminal", b: "ht_recovery_null", c: "ht_recovery_null", d: "ht_recovery_null" },
        rationale: "The null hypothesis is always the equality baseline: p_A = p_B. The alternative carries the directional or non-equality claim. This structure ensures the Type I error rate equals α when H₀ is true.",
      },
      ht_recovery_null: {
        id: "ht_recovery_null",
        type: "scenario_choice",
        badge: "Recovery 3",
        title: "Recovery · Null hypothesis must assert equality",
        prompt: "The interviewer asks: 'What must every null hypothesis include, and why?' Choose the strongest answer.",
        code_snippet: `H₀: [parameter] = [baseline value]
H₁: [parameter] ≠ / > / < [baseline value]`,
        choices: [
          { id: "a", label: "An equality or no-effect claim", description: "H₀ always includes = so that the distribution of the test statistic under H₀ is fully specified and the rejection threshold can be computed." },
          { id: "b", label: "A directional prediction", description: "Directional claims belong in H₁; putting them in H₀ inverts the test logic." },
          { id: "c", label: "The researcher's expectation", description: "H₀ is the skeptic's position — no effect. The researcher's expectation is in H₁." },
          { id: "d", label: "A p-value threshold", description: "α is the decision threshold, separate from the hypothesis statement." },
        ],
        branches: { a: "ht_terminal", b: "ht_recovery_null", c: "ht_recovery_null", d: "ht_recovery_null" },
        rationale: "The equality form of H₀ is essential: it pins down the null distribution so the p-value and critical values can be computed. Without equality, you cannot compute P(data | H₀).",
      },
      ht_terminal: {
        id: "ht_terminal",
        type: "scenario_choice",
        badge: "Terminal",
        title: "Revision complete · Early stopping consequences",
        terminal: true,
        prompt: "An experiment runs for 1 week. On day 5, p = 0.03. The analyst stops and declares significance. What statistical problem does this create, and what is the correct approach?",
        code_snippet: `Planned duration: 7 days
Peeked at: Day 5
p = 0.03 at Day 5
α = 0.05 (fixed, not sequential)`,
        choices: [
          { id: "a", label: "Inflated Type I error; use group sequential / alpha-spending methods", description: "Peeking and stopping early without adjustment raises the effective error rate above α. Sequential testing procedures like O'Brien-Fleming or Pocock maintain the promised error rate." },
          { id: "b", label: "No problem; p < 0.05 is p < 0.05", description: "The 0.05 guarantee only holds for a single pre-planned look, not for repeated peeks." },
          { id: "c", label: "Run the full 7 days and ignore day-5 data", description: "The day-5 observation is not invalidated; the stopping rule is the problem." },
        ],
        branches: { a: "ht_terminal", b: "ht_terminal", c: "ht_terminal" },
        rationale: "Early stopping without a sequential testing correction inflates Type I error because the probability of ever observing p < 0.05 during a run is much higher than 5%, even when H₀ is true. Group sequential methods pre-specify interim looks and apportion α across them.",
      },
    },
  },
  knowledgeCheck: [
    {
      question: "Which statement correctly describes a null hypothesis?",
      options: [
        "It asserts no effect or no difference — always includes equality",
        "It asserts the direction of the expected effect",
        "It is chosen after seeing the data to match the observed pattern",
      ],
      correctIndex: 0,
      explanation: "H₀ is the baseline claim of equality (μ_A = μ_B, or p = 0.5). The alternative carries the directional or non-equality claim. This structure lets us compute P(data | H₀) precisely.",
    },
    {
      question: "A researcher examines 20 subgroups, finds one with p = 0.04, then reports it as a pre-specified finding. What is this error called?",
      options: [
        "HARKing — Hypothesizing After Results Known",
        "Type II error — failing to reject a false null",
        "Heteroskedasticity — unequal variance across groups",
      ],
      correctIndex: 0,
      explanation: "HARKing (Hypothesizing After Results Known) converts exploratory data analysis into false confirmatory claims. Scanning 20 subgroups at α = 0.05 gives about a 64% chance of at least one false positive by chance alone.",
    },
  ],
},

"st-i2": {
  durationLabel: "18 min",
  outcomes: [
    "Define a p-value as a conditional probability under H₀, not a posterior probability.",
    "Identify the four most common p-value misconceptions and give the correct interpretation.",
    "Explain why statistical significance does not imply practical significance.",
  ],
  learnMarkdown: `## What a p-value actually is

A **p-value** is the probability of observing data at least as extreme as your sample, *given that H₀ is true*:

\`\`\`
p-value = P(|T| ≥ |t_observed| | H₀ is true)
\`\`\`

It is a **conditional probability** with H₀ in the condition. It is NOT:
- P(H₀ is true | data) — that is a posterior, requiring Bayes
- The probability of replication
- A measure of effect size or importance

## The four misconceptions (memorise these for interviews)

| Myth | Reality |
|------|---------|
| p = 0.03 → 97% chance effect is real | p-value conditions on H₀ true; probability inversion needs a prior |
| Smaller p = bigger effect | p conflates effect size with sample size; always report effect sizes |
| p > 0.05 proves no effect | Absence of evidence ≠ evidence of absence; study may be underpowered |
| p = 0.049 vs p = 0.051 is meaningful | The 0.05 threshold is a convention; treat p as continuous evidence |

## Statistical vs practical significance

A finding can be:
- **Statistically significant, practically trivial**: A drug reduces blood pressure by 0.3 mmHg (p < 0.0001 with n = 100,000). Statistically real, clinically useless.
- **Statistically non-significant, practically important**: A new cancer treatment adds 2 months median survival (p = 0.07, n = 40). Underpowered; shouldn't be dismissed.

Always report **effect size** (Cohen's d, odds ratio, η², lift) alongside the p-value.

## Why the Bayesian inversion error is so common

Humans naturally think in posteriors ("given what I saw, what do I believe?"). The frequentist p-value answers a different question: "If H₀ were true, how surprising is my data?" To convert that to "how likely is H₀?", you need Bayes' theorem and a prior — and that prior is rarely stated.

## Interview hook (answer like a senior)

"What's a p-value?"

Strong answer: "It's the probability of observing data as extreme as mine, or more extreme, assuming the null hypothesis is true. It's a conditional probability — P(data | H₀). It is not the probability that H₀ is false, and it doesn't tell you the effect size or whether the result will replicate. To go from p-value to 'probability H₀ is false,' you'd need Bayes' theorem and a prior. In practice, I always report the p-value alongside a confidence interval and an effect size measure."`,
  video: null,
  videoFallbackMarkdown: `## P-value interpretation drill

Write in your own words — without looking — the one-sentence definition of a p-value using the phrase "given that H₀ is true."

Then list the four common misconceptions from memory and write one sentence correcting each.

If any feels vague, use the AI tutor: "Quiz me on p-value misconceptions with feedback."`,
  tryGuidance: "Use the P-Value Interpreter to slide the z-score and watch the shaded tail change. Notice how a large sample size can produce the same p-value as a small effect — this is the core intuition for why p ≠ effect size.",
  interviewGraph: {
    initialStageId: "pv_definition_choice",
    artifactDimensions: [
      { label: "P-Value Definition Precision", recoveryStageId: "pv_recovery_definition" },
      { label: "Inversion Error Recognition", recoveryStageId: "pv_recovery_inversion" },
      { label: "Effect Size vs Significance", recoveryStageId: "pv_recovery_effectsize", passLabel: "P-Value Mastery" },
    ],
    stages: {
      pv_definition_choice: {
        id: "pv_definition_choice",
        type: "scenario_choice",
        badge: "Stage 1",
        title: "Stage 1 · Which interpretation is correct?",
        prompt: "A study returns p = 0.03 (two-sided, α = 0.05). Which of the following is the correct interpretation of this p-value?",
        code_snippet: `Study results:
  n = 200 (100 per group)
  Treatment mean: 48.2
  Control mean:   44.7
  Two-sided p-value: 0.03`,
        choices: [
          { id: "a", label: "P(data this extreme or more | H₀ true) = 0.03", description: "The probability of observing a difference this large or larger, if H₀ (no difference) were true, is 3%." },
          { id: "b", label: "There is a 97% chance the effect is real", description: "This inverts the conditional — it would require knowing P(H₀) via Bayes." },
          { id: "c", label: "The null hypothesis has a 3% chance of being true", description: "P(H₀ | data) ≠ p-value; again, this requires a prior probability on H₀." },
          { id: "d", label: "This result will replicate 97% of the time", description: "Replication probability depends on power and the true effect size, not directly on the p-value." },
        ],
        branches: { a: "pv_inversion_click", b: "pv_recovery_definition", c: "pv_recovery_definition", d: "pv_recovery_definition" },
        rationale: "The p-value is P(data | H₀), not P(H₀ | data). Options B, C, and D all commit the Bayesian inversion error — they describe posterior probabilities that require a prior.",
      },
      pv_recovery_definition: {
        id: "pv_recovery_definition",
        type: "scenario_choice",
        badge: "Recovery 1",
        title: "Recovery · The conditional in the p-value",
        prompt: "Complete this sentence with the most precise definition: 'The p-value is the probability of...'",
        code_snippet: `p-value = P(  ??? | H₀ is true  )`,
        choices: [
          { id: "a", label: "...observing data as extreme as the sample, or more extreme", description: "Conditional on H₀ being true — the core frequentist definition." },
          { id: "b", label: "...H₀ being true given the observed data", description: "This is P(H₀ | data) — a posterior that needs a prior." },
          { id: "c", label: "...the alternative hypothesis being true", description: "That would require P(H₁) and likelihood ratio; not what p-value computes." },
          { id: "d", label: "...making a Type II error", description: "Type II error (false negative) rate is β, related to power, not the p-value." },
        ],
        branches: { a: "pv_inversion_click", b: "pv_recovery_definition", c: "pv_recovery_definition", d: "pv_recovery_definition" },
        rationale: "P(data | H₀) — observed or more extreme data, given H₀ is true. Every other option inverts or confuses the conditioning.",
      },
      pv_inversion_click: {
        id: "pv_inversion_click",
        type: "click_target",
        badge: "Stage 2 target",
        title: "Stage 2 · Find the inversion error in the report",
        prompt: "A data analyst wrote up these results. Click the exact line that commits the Bayesian inversion error.",
        code_snippet: `RESULTS SUMMARY
===============
Test: two-sample t-test (n = 80 per group)
Observed difference in means: +4.1 points
Test statistic: t(158) = 2.31
p-value: 0.022

INTERPRETATION
p = 0.022, so there is a 97.8% chance the effect is real.  -- ds-target:inversion_error
We therefore recommend shipping the new feature immediately.`,
        validationCopy: {
          inversion_error: "Correct. 'p = 0.022 → 97.8% chance effect is real' inverts the conditional. The p-value is P(data | H₀); converting to P(effect is real | data) requires Bayes with a prior on H₀.",
        },
        branches: { inversion_error: "pv_effectsize_choice" },
      },
      pv_recovery_inversion: {
        id: "pv_recovery_inversion",
        type: "scenario_choice",
        badge: "Recovery 2",
        title: "Recovery · The inversion error",
        prompt: "Why is '97% chance the effect is real' wrong when p = 0.03?",
        code_snippet: `Bayes' theorem:
P(H₀ | data) = P(data | H₀) × P(H₀) / P(data)

The p-value only gives us P(data | H₀).
Without P(H₀) — the prior — we cannot compute P(H₀ | data).`,
        choices: [
          { id: "a", label: "It inverts the conditional without a prior", description: "P(data | H₀) ≠ P(H₀ | data). You need P(H₀) via Bayes to compute the latter." },
          { id: "b", label: "The complement of 0.03 is 0.97, which is correct", description: "1 - p is not the posterior probability of the effect being real." },
          { id: "c", label: "Effect size was not reported, making p meaningless", description: "Effect size is a separate issue; the conditional error is conceptually distinct." },
          { id: "d", label: "Only two-sided tests can be inverted this way", description: "The inversion error applies regardless of sidedness." },
        ],
        branches: { a: "pv_effectsize_choice", b: "pv_recovery_inversion", c: "pv_recovery_inversion", d: "pv_recovery_inversion" },
        rationale: "The inversion error (also called the prosecutor's fallacy) confuses P(data | H₀) with P(H₀ | data). Bayes' theorem shows these are different unless the prior is known.",
      },
      pv_effectsize_choice: {
        id: "pv_effectsize_choice",
        type: "scenario_choice",
        badge: "Stage 3",
        title: "Stage 3 · Statistical vs practical significance",
        prompt: "Study A: n=50, effect size d=0.8, p=0.001. Study B: n=10,000, effect size d=0.05, p=0.04. Which finding is more practically significant?",
        code_snippet: `Study A: small n, large effect, very low p
  n = 50, Cohen's d = 0.80, p = 0.001

Study B: large n, tiny effect, borderline p
  n = 10,000, Cohen's d = 0.05, p = 0.04`,
        choices: [
          { id: "a", label: "Study A — effect size drives practical importance, not p-value", description: "A Cohen's d of 0.80 is a large, meaningful effect. Study B's d=0.05 is negligible even though it's statistically significant." },
          { id: "b", label: "Study B — p = 0.001 is smaller than p = 0.04", description: "Smaller p-values do not imply larger effects. Study B's p is larger and its effect is tiny." },
          { id: "c", label: "They're equally significant since both p < 0.05", description: "Statistical significance at α = 0.05 says nothing about effect magnitude." },
          { id: "d", label: "Study B — larger samples are always more reliable", description: "Larger samples have more power, which is why they can detect trivially small effects as 'significant'." },
        ],
        branches: { a: "pv_terminal", b: "pv_recovery_effectsize", c: "pv_recovery_effectsize", d: "pv_recovery_effectsize" },
        rationale: "Study A has a large effect (d=0.80) — practically meaningful. Study B's d=0.05 is statistically detectable only because n=10,000 gives enormous power. The p-value alone cannot distinguish these cases; always report and interpret effect size.",
      },
      pv_recovery_effectsize: {
        id: "pv_recovery_effectsize",
        type: "scenario_choice",
        badge: "Recovery 3",
        title: "Recovery · Effect size vs significance",
        prompt: "A drug trial with n=100,000 finds blood pressure reduction of 0.4 mmHg (p < 0.0001). What is the most important additional metric to report?",
        code_snippet: `n = 100,000
Blood pressure reduction: 0.4 mmHg
p-value: < 0.0001
Clinical meaningful difference: ≥ 5 mmHg`,
        choices: [
          { id: "a", label: "Effect size and clinical threshold comparison", description: "0.4 mmHg is statistically real (huge n) but clinically trivial. Report effect size vs the minimum clinically important difference." },
          { id: "b", label: "A smaller α to confirm significance", description: "α is already exceeded dramatically; tightening it doesn't change the effect magnitude." },
          { id: "c", label: "More subgroup p-values", description: "More p-values without effect sizes compounds the problem." },
          { id: "d", label: "The confidence interval width only", description: "CI width relates to precision; the key gap is practical vs statistical significance." },
        ],
        branches: { a: "pv_terminal", b: "pv_recovery_effectsize", c: "pv_recovery_effectsize", d: "pv_recovery_effectsize" },
        rationale: "With very large n, almost any non-zero effect is statistically significant. The essential question is whether 0.4 mmHg crosses the minimum clinically important difference threshold — which it does not.",
      },
      pv_terminal: {
        id: "pv_terminal",
        type: "scenario_choice",
        badge: "Terminal",
        title: "Revision complete · The skeptic's challenge",
        terminal: true,
        prompt: "A drug trial finds p = 0.049. A skeptic says: 'The p-value doesn't tell us the probability the drug works.' Is the skeptic right? What would tell us that probability?",
        code_snippet: `Trial result: p = 0.049 (α = 0.05)
Skeptic: "We still don't know if the drug works."

To compute P(drug works | data), we need:
  P(data | drug works) × P(drug works)
  ─────────────────────────────────────
              P(data)`,
        choices: [
          { id: "a", label: "Yes — correct. Posterior requires a prior via Bayes", description: "The skeptic is right. P(drug works | data) = P(data | drug works) × P(drug works) / P(data). The p-value only provides P(data | H₀)." },
          { id: "b", label: "No — p = 0.049 < 0.05 proves the drug works", description: "p < α is a decision rule under frequentist assumptions, not proof of efficacy." },
          { id: "c", label: "Partially — we need to replicate for full certainty", description: "Replication improves confidence but doesn't resolve the inversion error." },
        ],
        branches: { a: "pv_terminal", b: "pv_terminal", c: "pv_terminal" },
        rationale: "The skeptic is completely correct. 'Probability the drug works' is a Bayesian posterior that requires a prior. Frequentist p-values answer a different, narrower question: how surprising is this data if the drug has no effect? Both frameworks have value; confusing them is the most common statistical error in science.",
      },
    },
  },
  knowledgeCheck: [
    {
      question: "A study finds p = 0.02. Which statement is correct?",
      options: [
        "There is a 2% chance of observing data this extreme or more extreme if H₀ is true",
        "There is a 98% probability that the alternative hypothesis is correct",
        "The effect size is large because p is small",
      ],
      correctIndex: 0,
      explanation: "The p-value is P(data | H₀) — a conditional probability given H₀ is true. It says nothing about P(H₀ | data) (requires Bayes) or effect size (requires a separate measure like Cohen's d).",
    },
    {
      question: "Study A (n=100) has d=0.70 and p=0.003. Study B (n=5,000) has d=0.08 and p=0.04. Which has greater practical significance?",
      options: [
        "Study A — effect size d=0.70 is large; Study B's d=0.08 is negligible despite being significant",
        "Study B — p=0.04 < 0.05 and it has a much larger sample",
        "They are equivalent because both p-values are below 0.05",
      ],
      correctIndex: 0,
      explanation: "Large samples have the power to detect trivially small effects as statistically significant. Effect size (Cohen's d) measures practical importance; d=0.70 is large and meaningful, d=0.08 is negligible in most applied contexts.",
    },
  ],
},

"st-i3": {
  durationLabel: "25 min",
  outcomes: [
    "Select the appropriate test (t-test, chi-squared, ANOVA) given data type and study design.",
    "Explain why multiple t-tests inflate Type I error and what ANOVA controls instead.",
    "Interpret post-hoc test results following a significant ANOVA.",
  ],
  learnMarkdown: `## Three tests, one decision framework

When comparing groups, the test you choose depends on two questions: **what type of outcome variable?** and **how many groups?**

\`\`\`
Outcome continuous (means)?
  2 groups → t-test
  3+ groups → ANOVA (+ post-hoc if significant)

Outcome categorical (counts/frequencies)?
  1 categorical variable vs expectation → chi-squared goodness of fit
  2 categorical variables → chi-squared test of independence
\`\`\`

## t-Tests: comparing means

Three flavors — all estimate whether a difference in means is larger than expected by chance:

| Type | When to use |
|------|-------------|
| One-sample | Is μ equal to a known reference value? |
| Two-sample (independent) | Do two separate groups have the same mean? |
| Paired | Do before/after measurements on the same subjects differ? |

**Formula (two-sample):** t = (x̄₁ − x̄₂) / SE_pooled

**Assumptions:** independence, approximate normality (or n ≥ 30), equal variances (or use Welch's t).

## Chi-squared (χ²): comparing frequencies

\`\`\`
χ² = Σ (O − E)² / E
\`\`\`

- **Goodness of fit**: does the observed distribution match an expected one (e.g., 25/25/25/25% across four segments)?
- **Test of independence**: in a contingency table, are two categorical variables independent?

**Key assumption:** expected count in each cell ≥ 5. Below this, use Fisher's exact test.

## ANOVA: comparing 3+ group means

Analysis of Variance decomposes total variance into *between-group* and *within-group* components:

\`\`\`
F = MS_between / MS_within
    = (variance explained by groups) / (unexplained within-group noise)
\`\`\`

H₀: all group means are equal. H₁: at least one group mean differs.

**Why not three t-tests for three groups?** With 3 groups you need 3 pairwise t-tests. At α = 0.05 each, the family-wise error rate (probability of at least one false positive) is:

\`\`\`
P(≥1 false positive) = 1 − (1 − 0.05)³ = 0.143 ≈ 14%
\`\`\`

ANOVA controls this by testing all groups simultaneously under one H₀.

## Post-hoc tests

A significant ANOVA tells you *at least one* mean differs — it doesn't tell you *which* pairs. Post-hoc tests correct for multiple comparisons:

- **Tukey HSD**: controls family-wise error for all pairwise comparisons; balanced designs.
- **Bonferroni**: divides α by the number of comparisons; conservative but widely understood.

## Interview hook (answer like a senior)

"You have three product variants and want to compare average session time. What's your approach?"

Strong answer: "I'd use a one-way ANOVA rather than three paired t-tests to control the family-wise error rate. Before running it, I'd check the assumptions: independence of observations, approximate normality within each group (histograms, Shapiro-Wilk), and equal variances (Levene's test). If ANOVA is significant, I'd run Tukey HSD to identify which specific pairs differ. I'd also report effect size — η² (eta-squared) — alongside the p-value."`,
  video: null,
  videoFallbackMarkdown: `## Test selection drill (5 minutes)

For each scenario below, write the test you'd use and one assumption you'd verify:

1. Comparing average order value between two independent customer segments.
2. Testing whether a 4-option survey question follows a 25/25/25/25% distribution.
3. Comparing NPS scores across 5 geographic regions.
4. Testing whether marketing channel (email / social / search) and purchase outcome (yes/no) are independent.
5. Comparing a user's response time before and after a UI change (same users, measured twice).`,
  tryGuidance: "Use the Statistical Test Selector. Navigate the decision tree for your scenario, then explore each test's formula and worked example. Pay special attention to the 'Multiple t-tests' explainer at the bottom.",
  interviewGraph: {
    initialStageId: "st_multiple_ttest_choice",
    artifactDimensions: [
      { label: "Multiple Comparison Inflation", recoveryStageId: "st_recovery_inflation" },
      { label: "Test Selection Logic", recoveryStageId: "st_recovery_testselect" },
      { label: "Post-Hoc Test Purpose", recoveryStageId: "st_recovery_posthoc", passLabel: "Statistical Tests Mastery" },
    ],
    stages: {
      st_multiple_ttest_choice: {
        id: "st_multiple_ttest_choice",
        type: "scenario_choice",
        badge: "Stage 1",
        title: "Stage 1 · Why not multiple t-tests for 3 groups?",
        prompt: "You have 3 product page variants (A, B, C) and want to compare conversion rates. A colleague suggests running t-tests for every pair: A vs B, A vs C, B vs C. Why is this incorrect?",
        code_snippet: `Groups: Variant A, Variant B, Variant C
Metric: Conversion rate (binary outcome per user)
α = 0.05 per test

Proposed approach:
  Test 1: A vs B → p-value
  Test 2: A vs C → p-value
  Test 3: B vs C → p-value`,
        choices: [
          { id: "a", label: "Each test has 5% false-positive risk; 3 tests ≈ 14% family error rate", description: "Running 3 independent tests at α=0.05 inflates the probability of at least one false positive to 1-(0.95)³ ≈ 14.3%." },
          { id: "b", label: "t-tests cannot compare proportions", description: "Two-proportion z-tests are preferred for conversion rates, but the core problem here is multiple comparisons, not test choice." },
          { id: "c", label: "You need at least 5 groups for multiple testing to matter", description: "Multiple testing inflation begins with the second test; it is not a threshold phenomenon." },
          { id: "d", label: "t-tests require more than 3 groups", description: "t-tests work for 2 groups; the problem is running multiple tests without correction, not the test itself." },
        ],
        branches: { a: "st_contingency_choice", b: "st_recovery_inflation", c: "st_recovery_inflation", d: "st_recovery_inflation" },
        rationale: "Each t-test independently has a 5% chance of false positive under H₀. Running 3 tests means the family-wise Type I error rate is approximately 14%, not 5%. ANOVA tests all groups simultaneously, controlling this under one H₀.",
      },
      st_recovery_inflation: {
        id: "st_recovery_inflation",
        type: "scenario_choice",
        badge: "Recovery 1",
        title: "Recovery · Computing the family error rate",
        prompt: "With 4 groups requiring 6 pairwise comparisons, each at α = 0.05, what is the approximate family-wise error rate?",
        code_snippet: `Family-wise error rate = 1 - (1 - α)^m
  where m = number of comparisons

m = 6, α = 0.05
P(≥ 1 false positive) = 1 - (0.95)^6 = ?`,
        choices: [
          { id: "a", label: "≈ 26%", description: "1 - (0.95)^6 ≈ 0.265. Over one-in-four chance of a false positive even when all nulls are true." },
          { id: "b", label: "5% — same as a single test", description: "Each test contributes its own error probability; they compound across tests." },
          { id: "c", label: "30% — it scales linearly with comparisons", description: "The formula is 1-(1-α)^m, not α×m (though α×m is a reasonable approximation for small m)." },
          { id: "d", label: "< 1% — fewer comparisons mean lower error", description: "More comparisons mean higher, not lower, family-wise error." },
        ],
        branches: { a: "st_contingency_choice", b: "st_recovery_inflation", c: "st_recovery_inflation", d: "st_recovery_inflation" },
        rationale: "1 - (0.95)^6 ≈ 26.5%. This is why ANOVA (or other omnibus tests) is used to test multiple groups simultaneously before any pairwise comparison.",
      },
      st_contingency_choice: {
        id: "st_contingency_choice",
        type: "scenario_choice",
        badge: "Stage 2",
        title: "Stage 2 · Choosing chi-squared",
        prompt: "You have a 2×2 contingency table showing whether users saw a new onboarding flow (yes/no) and whether they completed setup (yes/no). Which test is appropriate?",
        code_snippet: `Contingency table:
                Completed  Not completed
Saw new flow:     142           58
Saw old flow:      97          103

Question: Are onboarding flow and completion independent?`,
        choices: [
          { id: "a", label: "Chi-squared test of independence", description: "Two categorical variables (flow version × completion) — use chi-squared to test independence in the contingency table." },
          { id: "b", label: "Two-sample t-test", description: "t-tests compare means of continuous variables; completion is binary (categorical)." },
          { id: "c", label: "One-way ANOVA", description: "ANOVA compares means across 3+ groups; this is a 2×2 categorical comparison." },
          { id: "d", label: "Pearson correlation", description: "Correlation measures linear association between continuous variables, not categorical independence." },
        ],
        branches: { a: "st_paired_click", b: "st_recovery_testselect", c: "st_recovery_testselect", d: "st_recovery_testselect" },
        rationale: "Chi-squared test of independence is the correct choice for testing whether two categorical variables are related. The null hypothesis is that flow version and completion are independent.",
      },
      st_recovery_testselect: {
        id: "st_recovery_testselect",
        type: "scenario_choice",
        badge: "Recovery 2",
        title: "Recovery · Matching test to data type",
        prompt: "The interviewer asks: 'For each scenario, which test?' Choose the correct set of matches.",
        code_snippet: `Scenario 1: Compare mean load times across 4 server regions
Scenario 2: Test if click-through (yes/no) and ad type (3 types) are independent
Scenario 3: Compare a user's satisfaction score before and after a redesign`,
        choices: [
          { id: "a", label: "One-way ANOVA / Chi-squared independence / Paired t-test", description: "Continuous 4-group comparison → ANOVA; categorical 2-variable independence → chi-squared; same users before/after → paired t-test." },
          { id: "b", label: "Three t-tests / ANOVA / Two-sample t-test", description: "Multiple t-tests for 4 groups inflates error; the before/after design requires a paired test, not independent-samples." },
          { id: "c", label: "Chi-squared / t-test / ANOVA", description: "Chi-squared applies to categorical outcomes; load time is continuous (ANOVA); satisfaction before/after is paired." },
          { id: "d", label: "ANOVA / Pearson correlation / One-sample t-test", description: "Correlation requires continuous variables; one-sample t-test compares to a known reference, not before/after." },
        ],
        branches: { a: "st_paired_click", b: "st_recovery_testselect", c: "st_recovery_testselect", d: "st_recovery_testselect" },
        rationale: "ANOVA for continuous 4-group comparison; chi-squared for categorical independence (click-through type vs ad type); paired t-test for same-subject repeated measurements.",
      },
      st_paired_click: {
        id: "st_paired_click",
        type: "click_target",
        badge: "Stage 3 target",
        title: "Stage 3 · Wrong test for paired data",
        prompt: "An analyst measures page load time for the same 200 users before and after a backend optimization, then applies this code. Click the line with the wrong test choice.",
        code_snippet: `before = [...]  # 200 load times, same users
after  = [...]  # 200 load times, same users

# Analyst's code:
t_stat, p_value = independent_samples_t_test(before, after)  -- ds-target:wrong_test
print(f"p = {p_value:.3f}")`,
        validationCopy: {
          wrong_test: "Correct. Same users measured twice is a paired design — the within-subject correlation is meaningful information. An independent-samples t-test ignores this correlation, losing statistical power and violating the independence assumption.",
        },
        branches: { wrong_test: "st_posthoc_choice" },
      },
      st_posthoc_choice: {
        id: "st_posthoc_choice",
        type: "scenario_choice",
        badge: "Stage 4",
        title: "Stage 4 · After a significant ANOVA",
        prompt: "One-way ANOVA comparing session duration across 5 product tiers returns F(4, 495) = 8.3, p < 0.0001. What is the correct next step?",
        code_snippet: `ANOVA result:
  F(4, 495) = 8.3,  p < 0.0001
  Groups: Free, Starter, Pro, Business, Enterprise

H₀ rejected: at least one group mean differs.
Question: which pairs differ?`,
        choices: [
          { id: "a", label: "Run Tukey HSD or Bonferroni post-hoc tests", description: "Post-hoc tests identify which specific pairs of groups differ while controlling the family-wise error rate across all comparisons." },
          { id: "b", label: "Report that all groups differ from each other", description: "A significant ANOVA only says at least one pair differs — it does not tell you which or how many." },
          { id: "c", label: "Run pairwise t-tests between all 5 groups without correction", description: "10 pairwise comparisons at α=0.05 gives ≈ 40% family error rate." },
          { id: "d", label: "Lower α to 0.01 and re-run the ANOVA", description: "Changing α post-hoc is p-hacking; post-hoc corrections are the appropriate tool." },
        ],
        branches: { a: "st_terminal", b: "st_recovery_posthoc", c: "st_recovery_posthoc", d: "st_recovery_posthoc" },
        rationale: "A significant ANOVA is an omnibus test: it tells you the global H₀ (all means equal) is rejected, but not which pairs differ. Post-hoc tests (Tukey HSD for balanced designs, Bonferroni for any) answer that question while controlling Type I error.",
      },
      st_recovery_posthoc: {
        id: "st_recovery_posthoc",
        type: "scenario_choice",
        badge: "Recovery 4",
        title: "Recovery · Why post-hoc tests are needed",
        prompt: "ANOVA rejects H₀. Why can't you just say 'all group means differ from each other'?",
        code_snippet: `H₀: μ₁ = μ₂ = μ₃ = μ₄ = μ₅
H₁: at least one μᵢ ≠ μⱼ

Rejecting H₀ tells you: ∃ at least one differing pair
It does NOT tell you: which pairs, or how many`,
        choices: [
          { id: "a", label: "ANOVA's H₁ only asserts ≥ 1 pair differs — post-hoc tests find which", description: "The alternative hypothesis is existential (at least one), not universal (all). Post-hoc tests with multiple comparison correction identify the specific pairs." },
          { id: "b", label: "You need to re-run ANOVA with a lower α", description: "Re-running with lower α doesn't identify which pairs differ." },
          { id: "c", label: "All pairs always differ when ANOVA is significant", description: "A single outlier group can drive significance while other pairs are nearly identical." },
          { id: "d", label: "ANOVA p-value tells you the number of differing pairs", description: "The F-statistic and p-value summarize overall variance ratio, not a pairwise breakdown." },
        ],
        branches: { a: "st_terminal", b: "st_recovery_posthoc", c: "st_recovery_posthoc", d: "st_recovery_posthoc" },
        rationale: "ANOVA's H₁ is 'at least one group differs.' You cannot conclude all pairs differ — a single unusual group could drive the result. Post-hoc tests find which specific comparisons are significant.",
      },
      st_terminal: {
        id: "st_terminal",
        type: "scenario_choice",
        badge: "Terminal",
        title: "Revision complete · Paired vs independent design",
        terminal: true,
        prompt: "You're comparing page load times before and after a backend optimization for the same 200 users. Which test and why?",
        code_snippet: `Study design:
  Same 200 users measured at Time 1 (before) and Time 2 (after)
  Outcome: page load time (milliseconds, continuous)

Options:
  A. Independent-samples t-test
  B. Paired t-test
  C. One-way ANOVA
  D. Chi-squared test`,
        choices: [
          { id: "a", label: "Paired t-test — same subjects, repeated measures", description: "The paired t-test uses each user as their own control by analyzing differences (after − before). This eliminates between-subject variability and substantially increases power versus an independent-samples test on the same data." },
          { id: "b", label: "Independent-samples t-test — two conditions", description: "This would ignore the within-subject correlation and treat the two observations per user as if they came from different people, losing power." },
          { id: "c", label: "ANOVA — comparing means", description: "ANOVA is used for 3+ groups; with 2 time points on the same subjects, paired t-test is the direct tool." },
          { id: "d", label: "Chi-squared — comparing before and after", description: "Chi-squared applies to categorical frequency data; load time is continuous." },
        ],
        branches: { a: "st_terminal", b: "st_terminal", c: "st_terminal", d: "st_terminal" },
        rationale: "The paired t-test is correct because measurements come from the same users. The key insight: paired design eliminates individual differences in baseline load time. Each person's (after − before) difference becomes the unit of analysis — dramatically increasing sensitivity to the treatment effect.",
      },
    },
  },
  knowledgeCheck: [
    {
      question: "You compare average revenue across 4 customer segments. What is the main statistical reason to use ANOVA rather than 6 separate t-tests?",
      options: [
        "Multiple t-tests inflate the family-wise Type I error rate; ANOVA controls it under one omnibus null hypothesis",
        "ANOVA is faster to compute than multiple t-tests",
        "t-tests cannot handle continuous revenue data",
      ],
      correctIndex: 0,
      explanation: "With 6 pairwise t-tests at α=0.05, the family-wise error rate is 1-(0.95)^6 ≈ 26.5%. ANOVA tests all groups simultaneously under H₀: all means equal, keeping Type I error at α.",
    },
    {
      question: "An ANOVA across 5 groups returns p = 0.002. What does this tell you, and what is the next step?",
      options: [
        "At least one group mean differs; run post-hoc tests (Tukey HSD / Bonferroni) to find which pairs",
        "All five group means are significantly different from each other",
        "The largest and smallest groups differ; no further testing needed",
      ],
      correctIndex: 0,
      explanation: "ANOVA's H₁ is existential: at least one pair differs. Post-hoc tests identify which specific pairs are different while controlling the family-wise error rate across all pairwise comparisons.",
    },
  ],
},

  // ── injected from stat_inference2_lessons.js ──
  "st-i4": {
  durationLabel: "15 min",
  outcomes: [
    "State the correct frequentist interpretation of a confidence interval without slipping into the probability-of-the-parameter trap.",
    "Predict how changing n, σ, or confidence level affects CI width using the 1/√n relationship.",
    "Use a CI to answer a significance question: if 0 is not inside the CI for a difference, the effect is significant.",
  ],
  learnMarkdown: `## What a confidence interval actually means

A **95% confidence interval** is built from a procedure, not from Bayesian probability. If you repeated the sampling process many times and built a CI each time, approximately 95% of those intervals would contain the true population parameter.

This specific interval you computed either contains μ or it doesn't. There is no "95% chance" — the probability is 0 or 1, you just don't know which.

## The formula

\`\`\`
CI = x̄ ± z* × (σ / √n)
\`\`\`

- **x̄**: sample mean
- **z***: critical value (1.645 for 90%, 1.96 for 95%, 2.576 for 99%)
- **σ / √n**: standard error (SE)

**Width ∝ 1/√n** — doubling n does not halve the width; you must quadruple n to halve it. This surprises most candidates.

## What affects CI width

| Factor | Increase → width | Decrease → width |
|--------|-----------------|-----------------|
| Sample size n | smaller | larger |
| Std deviation σ | larger | smaller |
| Confidence level | larger (99% > 95%) | smaller (90% < 95%) |

## Three misconceptions to kill

**Wrong:** "There is a 95% probability the true mean is in [42, 58]."
- Once computed, the CI is fixed. The parameter is fixed (unknown). Probability language does not apply.

**Right:** "If we ran this study 100 times, about 95 of the resulting CIs would contain μ."

**Wrong:** "The CI contains 95% of the data."
- That's a **prediction interval**. A CI is about the parameter, not individual values.

## Using CIs for significance

If the CI for a **difference** (treatment − control) does not contain 0, the effect is statistically significant at the corresponding α level. This is equivalent to the p-value test and often more informative.

A CI of [0.3%, 1.7%] for a conversion lift means: the effect is significant AND the effect is probably small (less than 2 percentage points).

## Interview hook (answer like a senior)

"A confidence interval is a range estimate that captures the precision of an estimate, not the probability that a specific claim is true. The 95% refers to the hit rate of the construction *procedure* across many samples — not to this one interval. In practice, I always report CIs alongside p-values because they communicate effect size and precision, not just binary significance. And I pay attention to whether the CI is narrow enough to be decision-relevant: a significant but wide CI often means we need more data before acting."`,
  video: null,
  videoFallbackMarkdown: `## Confidence interval deep dive

Work through this sequence before touching the interactive:

1. **State the formula** from memory: CI = x̄ ± z* × σ/√n. Identify each term.
2. **Predict the direction**: if n goes from 100 to 400, does width double, halve, or stay the same? Work it out: √400/√100 = 2, so SE halves → width halves.
3. **Correct the misconception**: write in your own words why "95% probability μ is in this interval" is wrong for a frequentist CI.
4. **Apply it**: a 95% CI for a conversion rate difference is [0.5%, 2.1%]. Is this significant? Does zero fall inside? What should you tell the PM?

The interactive tool then lets you verify each prediction with sliders and a repeated-sampling simulation.`,
  tryGuidance: "Use the CI Builder tab to see how n, σ, and confidence level shift the bracket width. Then switch to Simulation to watch ~95% of bars capture μ and some miss. Finally review Misconceptions and make sure you can explain each one out loud.",
  interviewGraph: {
    initialStageId: "ci_interp_click",
    artifactDimensions: [
      { label: "CI Interpretation Precision", recoveryStageId: "ci_recovery_interp" },
      { label: "Width Determinants (1/√n)", recoveryStageId: "ci_recovery_width" },
      { label: "CI for Significance Decisions", recoveryStageId: "ci_recovery_significance", passLabel: "CI Mastery Clear" },
    ],
    stages: {
      ci_interp_click: {
        id: "ci_interp_click",
        type: "click_target",
        badge: "Stage 1 target",
        title: "Stage 1 · Click the misinterpretation",
        prompt: "A data analyst wrote this report summary. One line contains a classic CI misinterpretation. Click the line that is wrong.",
        code_snippet: `ANALYSIS SUMMARY
────────────────────────────────────────────
Finding 1: 95% CI for mean session time = [42s, 58s]
Finding 2: "There is a 95% probability the true
            mean is inside [42s, 58s]."  -- ds-target:wrong_interp
Finding 3: correct interpretation is about repeated
           sampling — ~95% of CIs from repeated
           experiments would contain the true mean`,
        validationCopy: {
          wrong_interp: "Correct. Once the data are observed the interval is fixed — it either contains μ or it doesn't. The 95% describes the long-run hit rate of the procedure across many samples, not the probability for this specific interval.",
        },
        branches: {
          wrong_interp: "ci_width_choice",
        },
      },
      ci_recovery_interp: {
        id: "ci_recovery_interp",
        type: "scenario_choice",
        badge: "Recovery 1",
        title: "Recovery · Restore the correct mental model",
        prompt: "An interviewer asks: 'What does a 95% confidence level actually mean?' Which answer is correct?",
        code_snippet: `-- Population mean μ is fixed but unknown.
-- We draw one sample and build one CI.`,
        choices: [
          { id: "a", label: "95% of CIs built from repeated samples would contain μ", description: "The confidence level is a property of the procedure, not of this specific interval." },
          { id: "b", label: "There is a 95% chance μ falls inside this interval", description: "Once computed the interval is either right or wrong — no room for probability." },
          { id: "c", label: "95% of the population data values are inside the CI", description: "That describes a prediction interval, not a confidence interval." },
          { id: "d", label: "The CI contains the sample mean with 95% confidence", description: "The sample mean is always at the center of the CI by construction." },
        ],
        branches: { a: "ci_width_choice", b: "ci_recovery_interp", c: "ci_recovery_interp", d: "ci_recovery_interp" },
        rationale: "The frequentist CI is a statement about the procedure: repeat sampling many times and the hit rate approaches the confidence level. This specific interval has no further probability statement attached to it.",
      },
      ci_width_choice: {
        id: "ci_width_choice",
        type: "scenario_choice",
        badge: "Stage 2",
        title: "Stage 2 · Width and sample size",
        prompt: "Your team doubles the sample size from n=100 to n=400. How does the 95% CI width change?",
        code_snippet: `-- Width = 2 × z* × σ/√n
-- z* = 1.96, σ = 20, n₁ = 100, n₂ = 400`,
        choices: [
          { id: "a", label: "Width halves", description: "√400/√100 = 2, so SE halves, and width = 2 × z* × SE halves." },
          { id: "b", label: "Width doubles", description: "Larger n reduces, not increases, the standard error." },
          { id: "c", label: "Width stays the same", description: "Width depends on SE which depends on n." },
          { id: "d", label: "Width quarters", description: "Halving SE requires 4× n — which is what we did — but that halves, not quarters, the width." },
        ],
        branches: { a: "ci_significance_choice", b: "ci_recovery_width", c: "ci_recovery_width", d: "ci_recovery_width" },
        rationale: "Width ∝ 1/√n. Quadrupling n doubles √n, halves SE, and halves the CI width. This is a common numerical check in interviews.",
      },
      ci_recovery_width: {
        id: "ci_recovery_width",
        type: "scenario_choice",
        badge: "Recovery 2",
        title: "Recovery · Width determinants",
        prompt: "Which combination of changes would make a 95% CI narrower?",
        code_snippet: `-- CI = x̄ ± z* × σ/√n`,
        choices: [
          { id: "a", label: "Increase n and decrease σ (or use a more homogeneous sample)", description: "Both reduce the standard error and hence the margin of error." },
          { id: "b", label: "Increase the confidence level from 95% to 99%", description: "Higher confidence level requires a larger z* and produces a wider CI." },
          { id: "c", label: "Decrease n to reduce noise", description: "Smaller n increases SE and widens the CI." },
          { id: "d", label: "Use a one-sided interval instead", description: "One-sided CIs are narrower on one side but change interpretation, not the total precision concept." },
        ],
        branches: { a: "ci_significance_choice", b: "ci_recovery_width", c: "ci_recovery_width", d: "ci_recovery_width" },
        rationale: "Larger n and smaller population variance are the two primary levers for narrowing a CI without sacrificing confidence level.",
      },
      ci_significance_choice: {
        id: "ci_significance_choice",
        type: "scenario_choice",
        badge: "Stage 3",
        title: "Stage 3 · CI for significance",
        prompt: "You run an A/B test. The 95% CI for the conversion rate difference (treatment − control) is [1.2%, 4.8%]. A PM asks if it's statistically significant at α=0.05. What do you say?",
        code_snippet: `-- Control CR: 5.0%
-- Treatment CR: 6.8%
-- 95% CI for difference: [1.2%, 4.8%]`,
        choices: [
          { id: "a", label: "Yes — 0 is not inside the CI, so the effect is significant", description: "If 0 were inside the CI the effect could be zero, which would be non-significant." },
          { id: "b", label: "No — you need a p-value to determine significance", description: "The CI and p-value are mathematically equivalent for this test. If 0 is outside the CI, p < 0.05." },
          { id: "c", label: "Cannot tell — need the sample sizes", description: "The CI already incorporates sample size; if it doesn't contain 0, it's significant." },
          { id: "d", label: "Probably — but only if the CI is symmetric", description: "CIs for proportions can be asymmetric; symmetry is not required for the significance rule." },
        ],
        branches: { a: "ci_terminal", b: "ci_recovery_significance", c: "ci_recovery_significance", d: "ci_recovery_significance" },
        rationale: "A two-sided 95% CI that excludes 0 is exactly equivalent to p < 0.05 for the two-sided test of whether the difference equals zero. This duality lets you answer significance questions directly from CIs.",
      },
      ci_recovery_significance: {
        id: "ci_recovery_significance",
        type: "scenario_choice",
        badge: "Recovery 3",
        title: "Recovery · CI-to-significance rule",
        prompt: "Which statement correctly describes the relationship between a 95% CI and a significance test at α=0.05?",
        code_snippet: `-- H₀: difference = 0
-- Two-sided test, α = 0.05`,
        choices: [
          { id: "a", label: "If the CI excludes 0, reject H₀ (p < 0.05)", description: "The CI and p-value encode the same information; exclusion of 0 equals significance." },
          { id: "b", label: "CIs and p-values are independent calculations", description: "They are mathematically dual: same assumptions, same answer, different format." },
          { id: "c", label: "You need p < 0.025 to match a 95% CI", description: "A 95% CI corresponds to a two-sided p < 0.05, not 0.025 (which would be a 97.5% CI)." },
          { id: "d", label: "A CI that includes 0 always means no practical effect", description: "Statistical non-significance is not the same as practical unimportance; the CI width matters." },
        ],
        branches: { a: "ci_terminal", b: "ci_recovery_significance", c: "ci_recovery_significance", d: "ci_recovery_significance" },
        rationale: "The duality of CIs and hypothesis tests: a 95% CI excluding 0 is exactly α=0.05 two-sided significance. This is more informative than a p-value alone because it shows effect size and precision.",
      },
      ci_terminal: {
        id: "ci_terminal",
        type: "scenario_choice",
        badge: "Terminal",
        title: "Revision complete · Confidence intervals locked",
        terminal: true,
        prompt: "A/B test: control CR=5%, treatment CR=6%. The 95% CI for the difference is [0.3%, 1.7%]. Interpret this for a non-technical PM.",
        code_snippet: `-- CI for (treatment - control): [0.3%, 1.7%]
-- 0 is not in the interval
-- Width: 1.4 percentage points`,
        choices: [
          { id: "a", label: "The effect is real and small: the lift is likely between 0.3 and 1.7 pp", description: "Significant (0 excluded) and the effect is meaningful but modest." },
          { id: "b", label: "We're 95% sure the lift is exactly 1.0%", description: "The CI is a range, not a point. The center is the estimate; the range shows uncertainty." },
          { id: "c", label: "The test is inconclusive because the CI is wide", description: "1.4 pp width may or may not be wide depending on the business context, but significance is clear." },
        ],
        branches: { a: "ci_terminal", b: "ci_terminal", c: "ci_terminal" },
        rationale: "The correct PM-ready answer: 'We're confident the treatment lifts conversion by somewhere between 0.3 and 1.7 percentage points. The effect is statistically real. The question is whether that range of lift is worth shipping.' This anchors the decision in the CI range, not just a yes/no.",
      },
    },
  },
  knowledgeCheck: [
    {
      question: "A 95% CI for a mean is [42, 58]. Which interpretation is correct?",
      options: [
        "If we repeated this sampling procedure many times, about 95% of the resulting CIs would contain the true mean",
        "There is a 95% probability that the true mean is between 42 and 58",
        "95% of individual data values fall between 42 and 58",
      ],
      correctIndex: 0,
      explanation: "The 95% describes the long-run hit rate of the procedure across repeated samples, not a probability statement about this specific fixed interval.",
    },
    {
      question: "Sample size increases from n=25 to n=100 with σ and confidence level fixed. What happens to CI width?",
      options: [
        "Width halves (because √100/√25 = 2, so SE halves)",
        "Width doubles",
        "Width stays the same",
      ],
      correctIndex: 0,
      explanation: "Width = 2 × z* × σ/√n. Quadrupling n doubles √n, halves σ/√n (SE), and halves the width.",
    },
    {
      question: "A 95% CI for a treatment-control difference is [0.5%, 3.2%]. What can you conclude at α=0.05?",
      options: [
        "The effect is statistically significant because 0 is not inside the CI",
        "The effect is not significant because the CI is wider than 1 percentage point",
        "Cannot determine significance without the raw p-value",
      ],
      correctIndex: 0,
      explanation: "A two-sided 95% CI excluding 0 is mathematically equivalent to p < 0.05. The interval directly answers the significance question.",
    },
  ],
},

"st-i5": {
  durationLabel: "15 min",
  outcomes: [
    "Distinguish Type I (false positive, probability α) from Type II (false negative, probability β) errors without confusing them under pressure.",
    "Explain the tradeoff: lowering α to reduce false positives inflates β for fixed sample size.",
    "Choose the right error to prioritize based on asymmetric real-world costs in medical, security, and business contexts.",
  ],
  learnMarkdown: `## The decision matrix

Every hypothesis test produces one of four outcomes:

| | Fail to Reject H₀ | Reject H₀ |
|--|--|--|
| **H₀ True** | Correct (prob = 1−α) | **Type I Error** (prob = α) |
| **H₁ True** | **Type II Error** (prob = β) | Power (prob = 1−β) |

**Type I error (α)**: False positive. You cry wolf when there is no wolf.
**Type II error (β)**: False negative. You miss the wolf that was actually there.
**Power (1−β)**: Correctly detecting a real effect.

## The tradeoff

α and β are inversely related **for a fixed sample size and effect size**. If you make the rejection threshold stricter (lower α), you require stronger evidence before rejecting H₀, which means you'll miss more real effects (higher β).

\`\`\`
Strict α (0.001) → few false alarms, but many real effects missed
Lenient α (0.10) → catches more real effects, but more false alarms
\`\`\`

The only way to reduce both simultaneously: **increase sample size n**.

## Asymmetric error costs

The optimal α depends on the relative costs of each error type:

- **Medical screening** — missing a disease (Type II) is catastrophic. Use higher α to be sensitive. Follow up positives with more specific tests.
- **Fraud detection** — missing fraud (Type II) causes severe damage; false alarms are merely annoying. Minimize β, accept higher α.
- **Marketing A/B test** — costs of both errors are roughly symmetric. Standard α=0.05 is reasonable.

## Base rate matters (Bayes)

In a rare-disease population, even a highly specific test (low α) will produce many false positives relative to true positives, because true cases are rare. This is why a 99%-specific test on a 0.5%-prevalence disease still has a large proportion of false positives among all positives.

## Interview hook (answer like a senior)

"I think of Type I vs Type II through the lens of cost asymmetry. Statistically, they're complementary — α controls false positives, β controls false negatives, and tightening one loosens the other at fixed n. In practice I ask: 'What is the consequence of a false alarm versus a miss?' In healthcare screening I'd raise α to be sensitive and triage false positives. In a low-volume fraud system where every false alarm burns analyst time, I'd be more conservative. The symmetry assumption baked into the standard α=0.05 is a convention, not a law."`,
  video: null,
  videoFallbackMarkdown: `## Type I and Type II errors drill

Work through this before the interactive:

1. **Draw the 2×2 matrix** from memory: rows = (H₀ True, H₁ True), columns = (Fail to Reject, Reject). Label each cell.
2. **Trace the probabilities**: label (H₀ True, Reject) with α; label (H₁ True, Fail to Reject) with β; label (H₁ True, Reject) with 1−β.
3. **Apply to a scenario**: COVID testing in a low-prevalence population. Which error type is more common even with a strict α? Why?
4. **State the tradeoff in one sentence**: why can't you simply set α=0.001 and call it a rigorous study?

Then use the interactive Decision Matrix to click each cell and verify your mental model.`,
  tryGuidance: "Click each cell in the Decision Matrix to see the name, probability, and consequence. Adjust α with the slider and watch Type I vs Type II rates move. Switch to The Tradeoff tab to see the inverse relationship visually. Use Context Matters to apply error cost reasoning to real scenarios.",
  interviewGraph: {
    initialStageId: "errors_base_rate_choice",
    artifactDimensions: [
      { label: "Type I / Type II Definitions", recoveryStageId: "errors_recovery_defs" },
      { label: "Tradeoff Mechanics", recoveryStageId: "errors_recovery_tradeoff" },
      { label: "Cost-Asymmetric α Choice", recoveryStageId: "errors_recovery_cost", passLabel: "Error Tradeoff Clear" },
    ],
    stages: {
      errors_base_rate_choice: {
        id: "errors_base_rate_choice",
        type: "scenario_choice",
        badge: "Stage 1",
        title: "Stage 1 · Base rate and false positives",
        prompt: "A COVID test has α=0.01 (Type I error rate). In a population where 0.5% actually have COVID, you test 10,000 people. Roughly how many false positives do you expect?",
        code_snippet: `-- Population: 10,000 people
-- True prevalence: 0.5% → 50 truly positive
-- True negatives: 9,950
-- Test α (false positive rate): 0.01`,
        choices: [
          { id: "a", label: "~100 false positives", description: "9,950 true negatives × 0.01 ≈ 99.5, rounded to ~100." },
          { id: "b", label: "~50 false positives", description: "50 would be the number of true positives, not false positives from the negative pool." },
          { id: "c", label: "~10 false positives", description: "10,000 × 0.01 counts everyone, not just the true negatives." },
          { id: "d", label: "~1 false positive", description: "Much too low — the large true-negative pool at 1% false-positive rate generates ~100 errors." },
        ],
        branches: { a: "errors_click_analyst", b: "errors_recovery_defs", c: "errors_recovery_defs", d: "errors_recovery_defs" },
        rationale: "9,950 true negatives × α (0.01) ≈ 99.5 false positives. This illustrates why false positives vastly outnumber true positives in low-prevalence settings — even with a 'strict' α.",
      },
      errors_recovery_defs: {
        id: "errors_recovery_defs",
        type: "scenario_choice",
        badge: "Recovery 1",
        title: "Recovery · Type I vs Type II",
        prompt: "Match the term to the correct definition.",
        code_snippet: `-- H₀: no effect / null is true
-- H₁: real effect exists`,
        choices: [
          { id: "a", label: "Type I = false positive (reject true H₀); Type II = false negative (fail to reject false H₀)", description: "α = P(Type I), β = P(Type II)." },
          { id: "b", label: "Type I = false negative; Type II = false positive", description: "These labels are swapped — Type I is the false positive (α)." },
          { id: "c", label: "Type I = missing a real effect; Type II = detecting a non-existent effect", description: "Again swapped. Type I is the alarm with no fire; Type II is the fire with no alarm." },
          { id: "d", label: "Both are the same — they both refer to incorrect decisions", description: "They are different directions of error with different probabilities and costs." },
        ],
        branches: { a: "errors_click_analyst", b: "errors_recovery_defs", c: "errors_recovery_defs", d: "errors_recovery_defs" },
        rationale: "Type I (α) = reject H₀ when it's true = false positive = false alarm. Type II (β) = fail to reject H₀ when it's false = false negative = missed effect.",
      },
      errors_click_analyst: {
        id: "errors_click_analyst",
        type: "click_target",
        badge: "Stage 2 target",
        title: "Stage 2 · Click the incomplete reasoning",
        prompt: "An analyst is tightening the significance threshold to improve rigor. Click the line that ignores the Type II error cost of this decision.",
        code_snippet: `ANALYSIS DECISION LOG
────────────────────────────────────────────
Step 1: Set α = 0.001 to minimize false positives
Step 2: "This guarantees a rigorous study."  -- ds-target:ignores_beta
Step 3: (note: β and power were not calculated
         for the chosen effect size and n)`,
        validationCopy: {
          ignores_beta: "Correct. Declaring rigor from low α alone ignores that stricter α inflates β. If sample size and effect size are unchanged, the study may now be severely underpowered — missing most real effects while avoiding false alarms.",
        },
        branches: {
          ignores_beta: "errors_fraud_choice",
        },
      },
      errors_fraud_choice: {
        id: "errors_fraud_choice",
        type: "scenario_choice",
        badge: "Stage 3",
        title: "Stage 3 · Asymmetric costs",
        prompt: "You're building a fraud detection model. Missing fraud is catastrophic; false alarms are merely annoying and require a brief analyst review. What should you optimize?",
        code_snippet: `-- Missing fraud (Type II): large financial loss, legal risk
-- False alarm (Type I): 5 minutes of analyst review time`,
        choices: [
          { id: "a", label: "Minimize Type II error (β) — accept higher Type I rate (α)", description: "The cost of a miss vastly exceeds the cost of a false alarm. Raise the alarm more often." },
          { id: "b", label: "Minimize Type I error (α) — to avoid wasting analyst time", description: "Analyst time is cheap compared to missed fraud. This optimizes the wrong objective." },
          { id: "c", label: "Keep both equal at α = β = 0.05", description: "Equal error rates are not appropriate when costs are asymmetric — and 0.05 for β implies 95% power which is a separate calculation." },
          { id: "d", label: "Ignore error rates and maximize AUC instead", description: "AUC is a useful summary but optimizing a threshold still requires weighing the cost of each error type." },
        ],
        branches: { a: "errors_terminal", b: "errors_recovery_cost", c: "errors_recovery_cost", d: "errors_recovery_cost" },
        rationale: "Cost-asymmetric decisions require setting α based on the ratio of error costs, not convention. When missing a true event is catastrophic, raise α (be more willing to raise false alarms) to drive β down.",
      },
      errors_recovery_tradeoff: {
        id: "errors_recovery_tradeoff",
        type: "scenario_choice",
        badge: "Recovery 2",
        title: "Recovery · The α-β tradeoff",
        prompt: "You lower α from 0.05 to 0.01 without changing sample size. What happens to β (Type II error rate) for a fixed true effect size?",
        code_snippet: `-- Fixed n, fixed true effect size (d)
-- α: 0.05 → 0.01`,
        choices: [
          { id: "a", label: "β increases (more real effects are missed)", description: "Stricter rejection threshold means weaker evidence is needed to detect — so more real effects slip past." },
          { id: "b", label: "β decreases (fewer effects missed)", description: "This is the tradeoff direction people wish for — but it goes the other way at fixed n." },
          { id: "c", label: "β stays the same — it only depends on sample size", description: "β depends on α, n, and effect size. Changing α changes β." },
          { id: "d", label: "β becomes undefined when α changes", description: "β is always defined; it's the probability of failing to reject a false H₀ at the new α threshold." },
        ],
        branches: { a: "errors_fraud_choice", b: "errors_recovery_tradeoff", c: "errors_recovery_tradeoff", d: "errors_recovery_tradeoff" },
        rationale: "The tradeoff is the core of Neyman-Pearson: stricter α → harder to reject → more real effects missed (higher β). The fix is a larger sample size, not just adjusting α.",
      },
      errors_recovery_cost: {
        id: "errors_recovery_cost",
        type: "scenario_choice",
        badge: "Recovery 3",
        title: "Recovery · Choosing α by error cost",
        prompt: "A patient screening test. Missing a disease costs $500,000 in downstream health outcomes. A false positive triggers a $200 follow-up test. What α direction is appropriate?",
        code_snippet: `-- Cost of Type I error (false positive): $200
-- Cost of Type II error (false negative): $500,000`,
        choices: [
          { id: "a", label: "Use higher α (e.g., 0.10) to maximize sensitivity", description: "With a 2,500:1 cost ratio for missing vs false alarm, being more liberal with alarms is rational." },
          { id: "b", label: "Use lower α (e.g., 0.001) to minimize false positives", description: "This saves $200 per false alarm but risks $500,000 per miss — the wrong direction." },
          { id: "c", label: "Always use α = 0.05 regardless of costs", description: "α = 0.05 is a convention, not a principle. Domain costs should drive threshold choice." },
          { id: "d", label: "α is irrelevant — just maximize the F1-score", description: "F1 balances precision and recall equally; asymmetric costs require cost-weighted evaluation." },
        ],
        branches: { a: "errors_terminal", b: "errors_recovery_cost", c: "errors_recovery_cost", d: "errors_recovery_cost" },
        rationale: "When the cost of a miss vastly exceeds the cost of a false alarm, use a higher α to catch more true positives at the expense of more follow-up tests. This is rational risk management.",
      },
      errors_terminal: {
        id: "errors_terminal",
        type: "scenario_choice",
        badge: "Terminal",
        title: "Revision complete · Type I & II errors locked",
        terminal: true,
        prompt: "A hiring algorithm flags candidates as 'unqualified.' Hiring a bad candidate costs $50k. Rejecting a good candidate costs $200k in lost talent. What error type should you minimize, and what does that imply for α?",
        code_snippet: `-- Type I error: flag a qualified candidate as unqualified
--   (false positive alarm → wrongly rejected)
-- Type II error: pass an unqualified candidate as qualified
--   (false negative → wrongly hired)
-- Cost(Type I) = $200k  |  Cost(Type II) = $50k`,
        choices: [
          { id: "a", label: "Minimize Type I — use lower α to avoid rejecting good candidates", description: "Rejecting a good candidate costs 4× more than hiring a bad one. Be more conservative with the 'unqualified' label." },
          { id: "b", label: "Minimize Type II — use higher α to catch all bad candidates", description: "This optimizes the cheaper error. You would incur many $200k errors to avoid $50k errors." },
          { id: "c", label: "Both errors cost the same so use α=0.05", description: "$200k ≠ $50k. Use cost-weighted thresholds, not convention." },
        ],
        branches: { a: "errors_terminal", b: "errors_terminal", c: "errors_terminal" },
        rationale: "In this framing, Type I = false positive (wrongly rejected good candidate, cost $200k). Type II = false negative (wrongly passed bad candidate, cost $50k). Minimize Type I → lower α on the 'unqualified' classifier → be stricter about applying that label. The 4:1 cost ratio makes this clear.",
      },
    },
  },
  knowledgeCheck: [
    {
      question: "In a hypothesis test, Type I error (α) is best defined as:",
      options: [
        "Rejecting H₀ when H₀ is true — a false positive",
        "Failing to reject H₀ when H₁ is true — a false negative",
        "The probability of detecting a real effect — statistical power",
      ],
      correctIndex: 0,
      explanation: "Type I error = false positive = rejecting a true null hypothesis. Its probability is controlled by the significance level α.",
    },
    {
      question: "You lower α from 0.05 to 0.01 without changing sample size or effect size. What happens to β?",
      options: [
        "β increases — stricter α means more real effects are missed",
        "β decreases — you're being more careful, so fewer errors overall",
        "β is unchanged — it only depends on sample size",
      ],
      correctIndex: 0,
      explanation: "α and β trade off at fixed n and effect size. Stricter α moves the rejection threshold, reducing power (1−β) and increasing β.",
    },
    {
      question: "A disease has 0.1% prevalence. A test has α=0.05 (5% false positive rate). In 10,000 healthy people, how many false positives do you expect?",
      options: [
        "~500 (9,990 × 0.05 ≈ 500)",
        "~5 (10,000 × 0.0005)",
        "~10 (0.1% of 10,000)",
      ],
      correctIndex: 0,
      explanation: "9,990 truly negative people × 5% false positive rate ≈ 500 false alarms. This dwarfs the ~10 true positives, illustrating the base rate problem in rare conditions.",
    },
  ],
},

"st-i6": {
  durationLabel: "18 min",
  outcomes: [
    "Explain why a non-significant result does not prove 'no effect' — it may simply reflect an underpowered study.",
    "Calculate approximate required n per group given Cohen's d, α, and target power using the standard formula.",
    "State what 80% power means and its practical implication for study planning and result interpretation.",
  ],
  learnMarkdown: `## What is statistical power?

**Power = 1 − β** = the probability of correctly detecting a real effect when one truly exists.

At 80% power: if the true effect is present, your study will detect it (p < α) about 80% of the time. The other 20% are false negatives — experiments that miss a real effect.

Power is determined by four factors. Change any one and the others must adjust:

\`\`\`
Power ↑ when:
  n increases (more data)
  effect size d increases (larger true difference)
  α increases (more lenient threshold)
  σ decreases (less noise)
\`\`\`

## Sample size formula (two-sided t-test)

\`\`\`
n per group ≈ 2 × ((z_α/2 + z_β) / d)²

where:
  z_α/2 = 1.96 for α = 0.05
  z_β   = 1.282 for 80% power (β = 0.20)
  d     = Cohen's d = (μ₁ - μ₂) / σ
\`\`\`

## Cohen's d benchmarks

| Effect size | d | Required n (80% power, α=0.05) |
|---|---|---|
| Small | 0.2 | ~394 per group |
| Medium | 0.5 | ~64 per group |
| Large | 0.8 | ~26 per group |

Small effects require enormous samples. This is why underpowered studies in psychology and medicine have high false-negative rates and unreliable replication.

## Absence of evidence ≠ evidence of absence

p = 0.12 does not mean "no effect." It means "we did not detect an effect at this threshold." If power was 30%, a non-significant result is nearly uninformative — you'd expect to miss 70% of real effects.

Always report power alongside non-significant results.

## The replication crisis connection

Many landmark studies in social science were run at n = 20–50 per group. For small-to-medium effects (d ≈ 0.3–0.5), power was often 20–40%. This explains why many findings didn't replicate: the original studies were publishing noise.

## Study design checklist

1. Pre-register α before data collection
2. Determine effect size d from prior work or minimum detectable effect (MDE)
3. Calculate required n (use formula or power calculator)
4. Commit to a stopping rule — no peeking until n is reached
5. Collect full sample before analysis
6. Interpret non-significant results as "inconclusive," not "null"

## Interview hook (answer like a senior)

"Power is the sensitivity of your study — the probability of detecting an effect that's actually there. I always compute required n before starting an experiment. For A/B tests at our company the minimum detectable effect drives the calculation: if we need to detect a 1% lift in conversion and our baseline variance is high, we might need months of data. I also flag underpowered studies explicitly when reviewing others' work — a p = 0.20 from n = 30 is not 'evidence of no effect,' it's a study that was never able to answer the question it was asked."`,
  video: null,
  videoFallbackMarkdown: `## Power analysis deep dive

Work through this sequence before using the interactive:

1. **State the formula** from memory: n ≈ 2 × ((z_α/2 + z_β) / d)². Identify each parameter.
2. **Predict effect size impact**: which requires more subjects — detecting d=0.2 or d=0.5 at the same power and α? Calculate the ratio: (0.5/0.2)² = 6.25×. The small effect needs ~6× more participants.
3. **Interpret a result**: a study finds p=0.15 with n=30 per group. What is the approximate power for d=0.5? (~44%) What does this non-significant result actually tell you?
4. **Run the checklist**: list the 6 study design steps from memory.

Then use the interactive calculator to verify your sample size calculations and explore the power curve.`,
  tryGuidance: "Use the Calculator tab: set effect size d, α, and target power to see required n update in real time. Watch the power curve change as d increases. Switch to Real-World to see the canonical small/medium/large benchmarks. Use the Checklist tab and tick off each study design step to internalize the workflow.",
  interviewGraph: {
    initialStageId: "power_null_choice",
    artifactDimensions: [
      { label: "Absence of Evidence vs Evidence of Absence", recoveryStageId: "power_recovery_null" },
      { label: "Sample Size Calculation", recoveryStageId: "power_recovery_n" },
      { label: "Power Implications for Study Design", recoveryStageId: "power_recovery_design", passLabel: "Power Analysis Clear" },
    ],
    stages: {
      power_null_choice: {
        id: "power_null_choice",
        type: "scenario_choice",
        badge: "Stage 1",
        title: "Stage 1 · Non-significant ≠ no effect",
        prompt: "A study finds p = 0.12 (non-significant). The researcher concludes 'the treatment has no effect.' What is wrong with this conclusion?",
        code_snippet: `-- Study: n = 30 per group
-- True effect size: unknown
-- Result: p = 0.12, α = 0.05
-- Power at d=0.5: approximately 44%`,
        choices: [
          { id: "a", label: "The study may be underpowered — absence of evidence is not evidence of absence", description: "At n=30 for a medium effect, power ≈ 44%. The study misses real effects 56% of the time." },
          { id: "b", label: "p = 0.12 is close to 0.05, so the effect almost exists", description: "p-values do not measure how 'close' an effect is to existing. p = 0.12 means non-significant, not almost significant." },
          { id: "c", label: "The analysis should be repeated until p < 0.05", description: "Repeated peeking inflates Type I error. This is p-hacking." },
          { id: "d", label: "The p-value threshold should be raised to 0.20 to include this result", description: "Post-hoc threshold changes invalidate pre-registration and inflate false positives." },
        ],
        branches: { a: "power_n_choice", b: "power_recovery_null", c: "power_recovery_null", d: "power_recovery_null" },
        rationale: "A non-significant p-value with low power is nearly uninformative. At 44% power, you'd expect to miss a medium effect 56% of the time. The correct conclusion is 'inconclusive' not 'no effect.'",
      },
      power_recovery_null: {
        id: "power_recovery_null",
        type: "scenario_choice",
        badge: "Recovery 1",
        title: "Recovery · What does power tell you?",
        prompt: "A study has 80% power for a given effect size. Which statement is correct?",
        code_snippet: `-- Power = 1 - β = 0.80
-- β = 0.20`,
        choices: [
          { id: "a", label: "If the true effect exists, the study will detect it 80% of the time", description: "Power is the hit rate for real effects — 20% will still be false negatives." },
          { id: "b", label: "80% of the time, the p-value will be below 0.05 regardless of truth", description: "Power is conditional on the effect being real; it doesn't apply when H₀ is true." },
          { id: "c", label: "The study is wrong 20% of the time", description: "20% (β) is the Type II error rate when H₁ is true, not a general error rate." },
          { id: "d", label: "80% confidence the effect is real", description: "Confidence and power are unrelated quantities." },
        ],
        branches: { a: "power_n_choice", b: "power_recovery_null", c: "power_recovery_null", d: "power_recovery_null" },
        rationale: "Power is P(reject H₀ | H₁ is true). At 80% power, 20% of experiments with a real effect will still return p ≥ α. This 20% is β, the Type II error rate.",
      },
      power_n_choice: {
        id: "power_n_choice",
        type: "scenario_choice",
        badge: "Stage 2",
        title: "Stage 2 · Sample size for a small effect",
        prompt: "To detect a small effect (Cohen's d = 0.2) with 80% power at α = 0.05 (two-sided), approximately how many participants per group do you need?",
        code_snippet: `-- Formula: n ≈ 2 × ((z_α/2 + z_β) / d)²
-- z_0.025 = 1.96, z_0.20 = 1.282, d = 0.2`,
        choices: [
          { id: "a", label: "~394 per group", description: "n ≈ 2 × ((1.96 + 1.282) / 0.2)² ≈ 2 × (16.21)² ≈ 394." },
          { id: "b", label: "~64 per group", description: "64 is for a medium effect (d = 0.5), not small." },
          { id: "c", label: "~26 per group", description: "26 is for a large effect (d = 0.8)." },
          { id: "d", label: "~100 per group", description: "100 is a common default but gives only about 17% power for d=0.2." },
        ],
        branches: { a: "power_click_premature", b: "power_recovery_n", c: "power_recovery_n", d: "power_recovery_n" },
        rationale: "n ≈ 2 × ((1.96 + 1.282) / 0.2)² = 2 × 16.21² ≈ 2 × 262.8 ≈ 394 per group. Small effects require large samples — this is why replication of small-effect studies is so difficult.",
      },
      power_recovery_n: {
        id: "power_recovery_n",
        type: "scenario_choice",
        badge: "Recovery 2",
        title: "Recovery · Effect size and required n",
        prompt: "How does required sample size change as effect size d doubles (all else equal)?",
        code_snippet: `-- n ∝ (1/d)²
-- d doubles: d → 2d`,
        choices: [
          { id: "a", label: "Required n quarters (divides by 4)", description: "n ∝ 1/d². If d doubles, d² quadruples, so n = 1/(d²) divides by 4." },
          { id: "b", label: "Required n halves", description: "n ∝ 1/d, not 1/d. The relationship is quadratic." },
          { id: "c", label: "Required n stays the same — d doesn't affect n directly", description: "d is the primary driver of required n. Larger effects need far fewer subjects." },
          { id: "d", label: "Required n doubles", description: "Larger d means easier detection, so n goes down, not up." },
        ],
        branches: { a: "power_click_premature", b: "power_recovery_n", c: "power_recovery_n", d: "power_recovery_n" },
        rationale: "Because n ∝ (1/d)², doubling d quadruples d², so required n is one-quarter as large. This is why detecting large effects is so much cheaper than detecting small ones.",
      },
      power_click_premature: {
        id: "power_click_premature",
        type: "click_target",
        badge: "Stage 3 target",
        title: "Stage 3 · Click the premature conclusion",
        prompt: "A researcher needed n=200 per group but collected only n=50 and stopped early. Click the line where the conclusion is premature given this underpowered study.",
        code_snippet: `STUDY REPORT EXCERPT
────────────────────────────────────────────
Pre-registered: n = 200 per group, α = 0.05
Actual collected: n = 50 per group (stopped early)
Result: p = 0.18 (non-significant)
"We conclude the intervention has no effect."  -- ds-target:premature_null
Note: power at n=50 for target d=0.4 is ~26%`,
        validationCopy: {
          premature_null: "Correct. With only 26% power, the study misses 74% of real effects of the targeted size. A non-significant result from a severely underpowered study is nearly uninformative — 'inconclusive' is the only valid conclusion.",
        },
        branches: {
          premature_null: "power_terminal",
        },
      },
      power_recovery_design: {
        id: "power_recovery_design",
        type: "scenario_choice",
        badge: "Recovery 3",
        title: "Recovery · Study design implications",
        prompt: "A PM asks: 'Can we run the A/B test for 3 weeks instead of 4 to save time?' The original plan was powered for 4 weeks at 80% power. What is the statistical implication?",
        code_snippet: `-- Original plan: 4 weeks, n = 1,000 per group → 80% power
-- Proposed change: 3 weeks, n ≈ 750 per group`,
        choices: [
          { id: "a", label: "Power drops below 80% — the study may miss a real effect", description: "Less time means fewer observations, smaller n, lower power. The study becomes underpowered." },
          { id: "b", label: "Power is unaffected — you can always analyze early and get the same answer", description: "Collecting less data than planned reduces power. Analyzing early inflates Type I error additionally." },
          { id: "c", label: "The α threshold adjusts automatically to compensate", description: "α is pre-registered and fixed; it doesn't auto-adjust for sample size changes." },
          { id: "d", label: "Only a 1-week reduction — the impact is negligible", description: "A 25% reduction in n reduces power non-trivially (from ~80% to potentially ~70% depending on effect size)." },
        ],
        branches: { a: "power_terminal", b: "power_recovery_design", c: "power_recovery_design", d: "power_recovery_design" },
        rationale: "Power scales with n. Collecting 75% of the planned n will reduce power below target. The PM needs to understand that early stopping trades off reliability of the conclusion.",
      },
      power_terminal: {
        id: "power_terminal",
        type: "scenario_choice",
        badge: "Terminal",
        title: "Revision complete · Power analysis locked",
        terminal: true,
        prompt: "An A/B test was run at 80% power. The result is p = 0.07 (non-significant at α = 0.05). A PM asks: 'Does this mean the treatment doesn't work?' What is the most accurate response?",
        code_snippet: `-- Pre-registered: 80% power for d = 0.3
-- Result: p = 0.07 (not significant)
-- 20% chance of missing a real d=0.3 effect`,
        choices: [
          { id: "a", label: "It's inconclusive — we can't rule out a real effect of d=0.3 even with 80% power", description: "At 80% power, 20% of experiments with a true d=0.3 would return p ≥ 0.05. This is one of those 20%." },
          { id: "b", label: "The treatment definitely doesn't work — p = 0.07 is not significant", description: "Non-significance at 80% power does not confirm the null. It means the evidence is insufficient at this threshold." },
          { id: "c", label: "We should lower α to 0.10 to capture this borderline result", description: "Post-hoc threshold changes are p-hacking and inflate false positive rates." },
        ],
        branches: { a: "power_terminal", b: "power_terminal", c: "power_terminal" },
        rationale: "80% power means 20% of experiments with a real effect still return p ≥ α. p = 0.07 is within that 20% possibility. The correct answer to the PM: 'Inconclusive — we had an 80% chance of detecting an effect this size. We may have hit the unlucky 20%. We should consider running a follow-up study with larger n or accepting a wider confidence interval.'",
      },
    },
  },
  knowledgeCheck: [
    {
      question: "A study finds p = 0.15 (non-significant). What is the correct interpretation?",
      options: [
        "The result is inconclusive — the study may be underpowered for the true effect size",
        "The treatment definitively has no effect",
        "The p-value is close to 0.05, so the effect almost exists",
      ],
      correctIndex: 0,
      explanation: "A non-significant p-value is not evidence of no effect. If the study is underpowered, most real effects would also return p > 0.05. Absence of evidence ≠ evidence of absence.",
    },
    {
      question: "To detect a medium effect (Cohen's d = 0.5) with 80% power at α = 0.05, approximately how many participants per group do you need?",
      options: [
        "~64 per group",
        "~394 per group",
        "~26 per group",
      ],
      correctIndex: 0,
      explanation: "n ≈ 2 × ((1.96 + 1.282) / 0.5)² ≈ 64 per group. For small effects (d=0.2) you'd need ~394, and for large (d=0.8) only ~26.",
    },
    {
      question: "An A/B test was planned for 80% power. The PM cuts the run time, reducing n by 30%. What happens to power?",
      options: [
        "Power drops below 80% — the study becomes underpowered",
        "Power is unchanged — α adjusts automatically",
        "Power increases because less noise is introduced",
      ],
      correctIndex: 0,
      explanation: "Power depends on n. Reducing n by 30% reduces power below the planned 80%, increasing the probability of a false negative (missing a real effect).",
    },
  ],
},

  // ── injected from stat_applied_lessons.js ──
  "st-a1": {
  durationLabel: "25 min",
  outcomes: [
    "Design a statistically sound A/B test: hypothesis, metric, sample size, and stopping rule.",
    "Identify peeking, SRM, novelty effects, and post-hoc subgroup analysis as validity threats.",
    "Distinguish statistical significance from practical significance in business contexts.",
  ],
  learnMarkdown: `## Outcomes

- Translate a product hypothesis into a testable H₀ and primary metric.
- Calculate required sample size from expected effect size, α, and power.
- Spot the four most common A/B test validity failures interviewers probe.

## The anatomy of a sound A/B test

An experiment has three checkpoints before the p-value matters:

1. **Pre-registration**: hypothesis, primary metric, sample size, and stopping rule all decided *before* data collection.
2. **Randomization check**: after assignment, verify treatment and control are balanced on key covariates (SRM — sample ratio mismatch — is a red flag).
3. **Duration discipline**: run until the pre-specified n or time window, not until p < 0.05.

## The peeking problem

Checking results daily and stopping when you see p < 0.05 is **optional stopping** — a form of multiple testing that inflates your false-positive rate far above the nominal α. At α = 0.05 with daily peeking over a week, the true error rate can exceed 25%.

Remedies: pre-registered fixed horizons, sequential tests (SPRT, mSPRT), or always-valid p-values.

## Sample ratio mismatch (SRM)

If you planned a 50/50 split and see 70/30, something is broken — a logging bug, a holdback policy, or a redirect race condition. Never interpret results from an experiment with SRM; fix the cause first.

## Post-hoc subgroup analysis

After a neutral overall result, you search subgroups: gender, device, region. Finding one at p < 0.05 across 20 subgroups is expected even if all null effects are true — classic multiple comparisons. Ship only what you pre-specified or replicate in a dedicated experiment.

## Novelty effect

Users engage more with *any* new experience initially, then revert. A 3-day test of a redesigned homepage will overestimate long-run retention lift. Run experiments long enough for novelty to decay (typically 2–4 weeks for engagement metrics).

## Practical vs statistical significance

A conversion rate lift from 10.000% to 10.002% may reach p < 0.05 with n = 5M. That is not worth shipping. Always pair a p-value with an **effect size** (absolute lift, relative lift, MDE) and ask whether the lift justifies the engineering cost, risk, and opportunity cost.

## Sample size formula

\`\`\`
n = 2 * (z_alpha/2 + z_beta)^2 * p*(1-p) / delta^2
\`\`\`

Where δ is the minimum detectable effect. Increasing power from 80% to 95% roughly doubles n. Under-powered tests produce noise disguised as science.

## Interview hook (answer like a senior)

"An A/B test I ran showed a statistically significant 8% lift in 3 days. Before shipping, I checked three things: whether the sample ratio matched the intended 50/50 split (it did), whether the duration was long enough to clear novelty effects (it wasn't — I extended to 2 weeks and the lift shrank to 3%), and whether that 3% lift cleared the business MDE threshold (it did). We shipped with guardrail metrics in place for 72 hours post-launch."`,
  video: null,
  videoFallbackMarkdown: `## Deep dive: build the test yourself

Without a curated clip, do this 15-minute active exercise:

1. Pick a product change (e.g., button color on a signup flow).
2. Write the formal H₀ and H₁ in one sentence each.
3. Choose a primary metric and two guardrail metrics.
4. Use an online sample size calculator (e.g., Evan Miller's) to find n given α=0.05, power=0.8, and a 2% absolute MDE.
5. Identify one peeking temptation you'd face and how you'd resist it.`,
  tryGuidance: "Use the A/B Test Simulator to explore how sampling noise affects a single experiment. Vary the true rates and sample size: notice how often an experiment 'misses' a real effect (Type II error) and how often it 'finds' an effect that isn't there (Type I error). Run the same parameters 10 times and observe the variance in p-values — this is why pre-registration matters.",
  interviewGraph: {
    initialStageId: "stage_1_peeking_click",
    artifactDimensions: [
      { label: "Experimental validity", recoveryStageId: "recovery_srm" },
      { label: "Multiple comparisons discipline", recoveryStageId: "recovery_subgroup" },
      { label: "Duration and novelty reasoning", recoveryStageId: "recovery_novelty", passLabel: "Ready to design end-to-end" },
    ],
    stages: {
      stage_1_peeking_click: {
        id: "stage_1_peeking_click",
        type: "click_target",
        badge: "Stage 1 target",
        title: "Stage 1 · Spot the peeking anti-pattern",
        prompt: "Your team's A/B test workflow is shown below. Click the line that introduces invalid optional stopping.",
        code_snippet: `# Experiment: new checkout CTA button
Step 1: Define H0, metric, MDE, alpha=0.05
Step 2: Assign users 50/50 to control/treatment
Step 3: Check p-value at end of each day     -- ds-target:peeking
Step 4: Stop experiment when p < 0.05        -- ds-target:stop_on_sig
Step 5: Ship treatment if significant`,
        validationCopy: {
          peeking: "Correct. Checking results repeatedly at each day is optional stopping — it inflates the true false-positive rate well above the nominal 5%.",
          stop_on_sig: "This is the consequence of peeking, but the root cause is Step 3. Without daily checking, stopping on significance isn't triggered prematurely.",
        },
        branches: {
          peeking: "stage_2_srm_choice",
          stop_on_sig: "recovery_srm",
          default: "recovery_srm",
        },
      },
      stage_2_srm_choice: {
        id: "stage_2_srm_choice",
        type: "scenario_choice",
        badge: "Stage 2",
        title: "Stage 2 · Diagnose the traffic split anomaly",
        prompt: "Your A/B test was designed as a 50/50 split. After 48 hours you observe a 70/30 split (treatment/control). What should you do?",
        code_snippet: `Planned:   Control 50% | Treatment 50%
Observed:  Control 30% | Treatment 70%
Current p-value: 0.032 (below 0.05)`,
        choices: [
          { id: "a", label: "Stop and investigate the SRM cause", description: "Pause the experiment, find the logging or assignment bug causing the imbalance, fix it, then restart with a clean split." },
          { id: "b", label: "Ship because the p-value is already significant", description: "The result is statistically significant so the split imbalance doesn't matter." },
          { id: "c", label: "Use statistical adjustment to correct for the imbalance", description: "Apply post-hoc weighting to normalize the 70/30 back to 50/50 and proceed." },
          { id: "d", label: "Continue running until planned sample size, then analyze", description: "The imbalance will self-correct as more users are assigned." },
        ],
        branches: {
          a: "stage_3_subgroup_choice",
          b: "recovery_srm",
          c: "recovery_srm",
          d: "recovery_srm",
        },
        rationale: "Sample ratio mismatch signals a broken randomization or logging mechanism. Results from a biased assignment are not interpretable regardless of the p-value. Post-hoc statistical adjustment doesn't recover causal validity — you need clean randomization.",
      },
      stage_3_subgroup_choice: {
        id: "stage_3_subgroup_choice",
        type: "scenario_choice",
        badge: "Stage 3",
        title: "Stage 3 · Evaluate post-hoc subgroup claims",
        prompt: "Your A/B test shows no overall effect (p = 0.43). A stakeholder finds that among female users, the treatment shows a 15% lift at p = 0.04. They want to ship a women-only version. What is the key statistical risk?",
        code_snippet: `Overall result:   p = 0.43 (not significant)
Subgroup female:  p = 0.04 (significant!)
Subgroups tested: gender, age, device, region,
                  plan_type, country (6 total)`,
        choices: [
          { id: "a", label: "Multiple comparisons inflate false-positive risk", description: "Testing 6 subgroups at α=0.05 each gives a ~26% chance of a false positive even if all null effects are true." },
          { id: "b", label: "The female subgroup result is definitely real", description: "p < 0.05 in a subgroup means the effect is statistically valid in that group." },
          { id: "c", label: "The sample is too small for subgroup analysis", description: "Sample size is the only consideration — the p-value within the subgroup is still unbiased." },
          { id: "d", label: "Ship it and monitor with guardrails", description: "A positive result, even if exploratory, is worth shipping quickly." },
        ],
        branches: {
          a: "stage_4_novelty_choice",
          b: "recovery_subgroup",
          c: "recovery_subgroup",
          d: "recovery_subgroup",
        },
        rationale: "With 6 subgroups at α=0.05, FWER = 1 - 0.95^6 ≈ 26%. The subgroup finding is a hypothesis for a new, pre-registered experiment — not a shippable result.",
      },
      stage_4_novelty_choice: {
        id: "stage_4_novelty_choice",
        type: "scenario_choice",
        badge: "Stage 4",
        title: "Stage 4 · Account for novelty effects",
        prompt: "Your new feature shows a 12% engagement lift after 3 days. How does the novelty effect influence your decision about experiment duration?",
        code_snippet: `Metric:    Daily active engagement
Day 1 lift: +18%
Day 2 lift: +14%
Day 3 lift: +12%
Trend: decreasing`,
        choices: [
          { id: "a", label: "Run longer — users engage more with anything new, then revert", description: "Novelty wears off over 2-4 weeks; short tests overestimate long-run lift for engagement metrics." },
          { id: "b", label: "Ship immediately — the lift is already at significance", description: "Reaching significance quickly means the effect is strong and durable." },
          { id: "c", label: "Use only Day 1 data — it has the highest signal", description: "The first day shows the true preference before habituation sets in." },
          { id: "d", label: "Novelty doesn't apply to engagement metrics, only to conversion", description: "Conversion is habitual; engagement is more susceptible to novelty than conversion metrics." },
        ],
        branches: {
          a: "terminal_ab_design",
          b: "recovery_novelty",
          c: "recovery_novelty",
          d: "recovery_novelty",
        },
        rationale: "Novelty effect is especially pronounced for engagement and UI changes. The decreasing trend in lift over 3 days is a classic novelty signature. Pre-specify a minimum duration (typically 2–4 weeks) in your test plan.",
      },
      recovery_srm: {
        id: "recovery_srm",
        type: "scenario_choice",
        badge: "Recovery 1",
        title: "Recovery · Why does SRM invalidate results?",
        prompt: "The interviewer asks: 'You have a 70/30 split instead of 50/50. Why can't you just analyze what you have?'",
        code_snippet: `Planned: 50% Control | 50% Treatment
Actual:  30% Control | 70% Treatment
Q: Is the p-value still valid?`,
        choices: [
          { id: "a", label: "Biased assignment means users self-selected, confounding the effect estimate", description: "SRM suggests the randomization mechanism broke, meaning treatment and control may differ on unmeasured covariates." },
          { id: "b", label: "Unequal splits reduce power so you need more data", description: "The split imbalance is just a power issue — collect more data to compensate." },
          { id: "c", label: "The p-value formula accounts for unequal groups automatically", description: "Two-proportion z-tests handle unequal n, so the result is still valid." },
          { id: "d", label: "You can stratify post-hoc to rebalance the analysis", description: "Weight treatment users by 5/7 and control by 5/3 to restore effective balance." },
        ],
        branches: {
          a: "stage_3_subgroup_choice",
          b: "recovery_srm",
          c: "recovery_srm",
          d: "recovery_srm",
        },
        rationale: "SRM is a validity problem, not just a power problem. If assignment was biased, the unequal split is a symptom of a broken mechanism that likely introduces confounders. Statistical corrections don't restore causal identification.",
      },
      recovery_subgroup: {
        id: "recovery_subgroup",
        type: "scenario_choice",
        badge: "Recovery 2",
        title: "Recovery · What to do with subgroup findings",
        prompt: "You found a promising subgroup result (female users, p=0.04). What is the correct next step?",
        code_snippet: `Post-hoc subgroup: p = 0.04
Subgroups tested: 6 total
FWER at alpha=0.05, k=6: ~26%`,
        choices: [
          { id: "a", label: "Use the subgroup result as a hypothesis for a dedicated pre-registered experiment", description: "Pre-specify the female user subgroup as the primary analysis in a new test with its own sample size calculation." },
          { id: "b", label: "Ship the women-only version since p < 0.05", description: "Statistical significance is the standard — other factors are secondary." },
          { id: "c", label: "Apply Bonferroni correction and re-check significance", description: "Corrected alpha = 0.05/6 = 0.008; if p=0.04 doesn't survive, the finding is noise." },
          { id: "d", label: "Widen the subgroup to include more users to raise power", description: "Add adjacent segments to the female group to get a larger n and more stable estimate." },
        ],
        branches: {
          a: "stage_4_novelty_choice",
          b: "recovery_subgroup",
          c: "recovery_subgroup",
          d: "recovery_subgroup",
        },
        rationale: "Both a new pre-registered experiment AND Bonferroni correction are valid responses. The key is that an exploratory subgroup finding, however promising, cannot be treated as a confirmed result. It's a hypothesis that demands its own test.",
      },
      recovery_novelty: {
        id: "recovery_novelty",
        type: "scenario_choice",
        badge: "Recovery 3",
        title: "Recovery · Why does novelty effect matter for test duration?",
        prompt: "The PM insists: 'We see a significant lift at day 3 — we should ship now.' What's your response?",
        code_snippet: `Day 1: +18%  Day 2: +14%  Day 3: +12%
The lift is still positive and significant.
Is 3 days sufficient?`,
        choices: [
          { id: "a", label: "The downward trend suggests novelty, not a durable effect — need 2-4 weeks minimum", description: "Engagement lifts typically decay after novelty wears off; a 3-day window overestimates long-run value." },
          { id: "b", label: "Significant is significant — three days is standard in the industry", description: "Industry convention is 48-72 hours for fast-moving products." },
          { id: "c", label: "Run another 3 days and ship if still significant", description: "A 6-day test gives a more stable estimate than 3." },
          { id: "d", label: "Novelty effect only matters if the day-1 lift is extremely high", description: "A moderate lift like 12% is stable and not novelty-driven." },
        ],
        branches: {
          a: "terminal_ab_design",
          b: "recovery_novelty",
          c: "recovery_novelty",
          d: "recovery_novelty",
        },
        rationale: "The hallmark of novelty is a decreasing daily lift trend. The business value of the feature is the long-run lift, not the novelty peak. 2-4 week horizons for engagement metrics are standard at companies that care about durable impact.",
      },
      terminal_ab_design: {
        id: "terminal_ab_design",
        type: "scenario_choice",
        badge: "Terminal",
        title: "Simulation complete · Design an end-to-end test",
        terminal: true,
        prompt: "You've navigated peeking, SRM, subgroup inflation, and novelty. Now summarize the components of a rigorous A/B test design for a checkout flow change.",
        code_snippet: `# Complete A/B test design checklist:
# 1. Hypothesis (H0, H1, primary metric)
# 2. Guardrail metrics (latency, error rate, revenue)
# 3. Minimum detectable effect (business threshold)
# 4. Sample size (alpha=0.05, power=0.8)
# 5. Fixed duration (novelty-aware minimum)
# 6. Stopping rule (no peeking)
# 7. Randomization check (SRM detection)
# 8. Pre-specified subgroups only`,
        choices: [],
        branches: {},
        rationale: "A rigorous A/B test is mostly decided before data collection: pre-specify the hypothesis, primary metric, sample size, duration, stopping rule, and the handful of subgroups you care about. Everything discovered post-hoc becomes a hypothesis for the next experiment.",
      },
    },
  },
  knowledgeCheck: [
    {
      question: "You run an A/B test and check results daily, stopping on day 4 when p = 0.03. What is the primary statistical problem?",
      options: [
        "Optional stopping inflates the true false-positive rate above the nominal alpha",
        "Day 4 is too short to detect any effect",
        "The p-value threshold should have been 0.01 for daily checks",
      ],
      correctIndex: 0,
      explanation: "Repeated testing without adjusting the stopping rule is optional stopping. Each peek adds a new chance to cross the threshold by chance, so the true Type I error rate grows far above 5%.",
    },
    {
      question: "An A/B test planned for 50/50 splits shows 68/32 after 2 days. What should you do first?",
      options: [
        "Pause the experiment and investigate the randomization or logging mechanism",
        "Proceed — unequal splits are handled by the two-proportion z-test",
        "Apply inverse probability weighting to rebalance post-hoc",
      ],
      correctIndex: 0,
      explanation: "Sample ratio mismatch (SRM) indicates a broken assignment or logging mechanism, not just a power issue. Until the cause is identified and fixed, results are not causally interpretable.",
    },
    {
      question: "After finding no overall effect, a post-hoc subgroup shows p=0.03 for mobile users. What is the best next step?",
      options: [
        "Treat it as a hypothesis and run a new pre-registered experiment targeting mobile users",
        "Ship the mobile-only version since p < 0.05",
        "Apply Bonferroni and if it fails, the result is confirmed noise and can be ignored forever",
      ],
      correctIndex: 0,
      explanation: "Post-hoc subgroup findings are exploratory hypotheses, not confirmatory results. A pre-registered follow-up experiment with mobile users as the primary analysis is the correct response.",
    },
  ],
},

"st-a2": {
  durationLabel: "12 min",
  outcomes: [
    "Calculate FWER for k simultaneous tests and explain why it grows rapidly.",
    "Apply Bonferroni correction and state its power trade-off.",
    "Choose between FWER control (Bonferroni) and FDR control (Benjamini-Hochberg) given study context.",
  ],
  learnMarkdown: `## Outcomes

- Derive the family-wise error rate formula and feel how quickly it inflates.
- Explain Bonferroni correction and when it is too conservative to use.
- Distinguish FWER and FDR and know which method to apply in practice.

## The multiple testing problem

Every hypothesis test has a false-positive rate α. Run k independent tests and the probability of at least one false positive — the **family-wise error rate** — grows:

\`\`\`
FWER = 1 - (1 - α)^k
\`\`\`

At k=1, FWER = 5%. At k=20, FWER ≈ 64%. At k=100, FWER > 99%. The more tests you run, the more guaranteed false discoveries you accumulate.

## Bonferroni correction

The simplest FWER control: divide α by the number of tests k. Call this new threshold α*.

\`\`\`
α* = α / k
\`\`\`

At k=20 and α=0.05, the corrected per-test threshold is α* = 0.0025. A result must reach p < 0.0025 to be declared significant.

**Trade-off:** Bonferroni is conservative — it reduces power substantially when k is large. Many real effects will be missed.

**When to use Bonferroni:** Confirmatory studies, few tests (k < 20), settings where a single false positive is costly (e.g., clinical trials, regulatory decisions).

## False Discovery Rate (FDR) — Benjamini-Hochberg

FDR control takes a different target: the expected *proportion* of declared discoveries that are false positives. At FDR = 0.05, you accept that 5% of your flagged results may be false.

The Benjamini-Hochberg (BH) procedure:
1. Sort all p-values: p(1) ≤ p(2) ≤ ... ≤ p(k)
2. Find the largest j where p(j) ≤ (j/k) × α
3. Reject all H₀ for i ≤ j

\`\`\`
Reject H(i) if p(i) ≤ (i/k) * FDR_level
\`\`\`

BH controls FDR under independence and positive dependence. It is far more powerful than Bonferroni for large test families.

**When to use BH:** Genomics, feature screening, exploratory data analysis — any setting where missing real effects is costly and a few false positives are acceptable.

## Genomics example

A GWAS tests 20,000 SNPs at α = 0.05:
- Without correction: **1,000 expected false positives**
- Bonferroni threshold: 0.05 / 20,000 = **2.5 × 10⁻⁶**
- BH at FDR = 0.05: threshold adapts to the p-value distribution — often 10–100× less stringent than Bonferroni, recovering many true associations

## Interview hook (answer like a senior)

"When our team runs A/B test fleets of 20 simultaneous tests, we use Benjamini-Hochberg at FDR = 0.10 — we'd rather follow up on a few false positives than miss real improvements. For confirmatory tests that directly gate a regulatory submission, we use Bonferroni because a single false positive there has major downstream consequences. The choice of correction method is a business decision about the cost of false positives vs false negatives in your specific context."`,
  video: null,
  videoFallbackMarkdown: `## Active exercise: feel the FWER growth

1. Use the Multiple Testing Visualizer to drag k from 1 to 50 and watch the FWER bar fill up.
2. At k=20, how many false positives would you expect in a study where all 20 null hypotheses are truly null? (Hint: 20 × 0.05)
3. What Bonferroni threshold would keep the overall FWER at 5%?
4. Now switch to the Genomics tab. Without correction, how many false positives would a 20,000-SNP GWAS produce?`,
  tryGuidance: "Explore all three tabs in the Multiple Testing Visualizer. In the FWER Calculator, move the slider slowly from k=1 to k=50 and watch the inflection — note where FWER crosses 50%. In the False Discovery Grid, count how many of the 20 'truly null' hypotheses get flagged — this is your expected noise floor. In the Genomics tab, feel the scale of the problem that Bonferroni and FDR methods were designed to solve.",
  interviewGraph: {
    initialStageId: "stage_1_fp_count",
    artifactDimensions: [
      { label: "FWER intuition", recoveryStageId: "recovery_fwer_formula" },
      { label: "Bonferroni mechanics", recoveryStageId: "recovery_bonferroni" },
      { label: "FWER vs FDR decision", recoveryStageId: "recovery_bonferroni", passLabel: "Ready to apply corrections in practice" },
    ],
    stages: {
      stage_1_fp_count: {
        id: "stage_1_fp_count",
        type: "scenario_choice",
        badge: "Stage 1",
        title: "Stage 1 · Calculate expected false positives",
        prompt: "You run 20 simultaneous A/B tests. All 20 are truly null (no real effect). Using α = 0.05 per test, how many false positives do you expect?",
        code_snippet: `Tests: k = 20
All truly null: H0 is true for every test
Alpha per test: 0.05

Expected false positives = ?`,
        choices: [
          { id: "a", label: "~1 (0.05 × 20 = 1.0)", description: "The expected count of false positives is simply k × α when all nulls are true." },
          { id: "b", label: "0 — if all nulls are true, no test should be significant", description: "A p-value below 0.05 on a truly null test is impossible." },
          { id: "c", label: "~13 (FWER × 20)", description: "The family-wise error rate is the expected number of false positives." },
          { id: "d", label: "20 — all tests will be false positives eventually", description: "All tests will eventually produce false positives with enough samples." },
        ],
        branches: {
          a: "stage_2_uncorrected_click",
          b: "recovery_fwer_formula",
          c: "recovery_fwer_formula",
          d: "recovery_fwer_formula",
        },
        rationale: "Expected false positives = k × α = 20 × 0.05 = 1.0. FWER (1 - 0.95^20 ≈ 64%) is the probability of at least one false positive — distinct from the expected count. Both are important to understand.",
      },
      stage_2_uncorrected_click: {
        id: "stage_2_uncorrected_click",
        type: "click_target",
        badge: "Stage 2 target",
        title: "Stage 2 · Flag the uncorrected multiple comparison",
        prompt: "This analysis tests 20 features simultaneously and reports significant results. Click the line that represents the multiple testing error.",
        code_snippet: `for feature in features:  # 20 features
    p_val = run_t_test(control, feature_group)
    if p_val < 0.05:  # ds-target:uncorrected_alpha
        report_significant(feature)
# Result: 3 features flagged as significant
# No correction applied for k=20 tests   -- ds-target:no_correction_note`,
        validationCopy: {
          uncorrected_alpha: "Correct. Using raw α=0.05 for each of 20 tests without any correction inflates FWER to ~64%. The threshold should be adjusted (Bonferroni: 0.0025, or BH procedure applied).",
          no_correction_note: "This comment correctly identifies the problem, but the actual error is in the threshold comparison. Clicking the threshold line more precisely targets the mechanical failure.",
        },
        branches: {
          uncorrected_alpha: "stage_3_bonferroni_choice",
          no_correction_note: "stage_3_bonferroni_choice",
          default: "recovery_bonferroni",
        },
      },
      stage_3_bonferroni_choice: {
        id: "stage_3_bonferroni_choice",
        type: "scenario_choice",
        badge: "Stage 3",
        title: "Stage 3 · Apply Bonferroni correction",
        prompt: "You are running 10 pre-specified hypothesis tests at α = 0.05. What is the Bonferroni-corrected per-test threshold, and when would you choose a different method?",
        code_snippet: `k = 10 tests
alpha = 0.05 (desired FWER level)

Bonferroni threshold = ?`,
        choices: [
          { id: "a", label: "0.005 (= 0.05 / 10); switch to BH for large exploratory test families", description: "Bonferroni threshold is α/k = 0.005. For genomics or feature selection with k in the thousands, BH FDR control is far more powerful." },
          { id: "b", label: "0.05 — no correction needed for fewer than 20 tests", description: "Small k doesn't justify skipping correction; even 10 tests at 0.05 inflates FWER to ~40%." },
          { id: "c", label: "0.001 (α / k^2)", description: "Bonferroni is too conservative, so we apply extra conservatism by squaring k." },
          { id: "d", label: "0.01 (α / (k/2))", description: "The correction only applies to half the tests because the other half are confirmatory." },
        ],
        branches: {
          a: "terminal_multiple_testing",
          b: "recovery_bonferroni",
          c: "recovery_bonferroni",
          d: "recovery_bonferroni",
        },
        rationale: "Bonferroni: α* = α/k = 0.05/10 = 0.005. It controls FWER conservatively — acceptable for confirmatory studies with few tests. For large k (genomics, ML feature selection), the power loss from Bonferroni is prohibitive; Benjamini-Hochberg FDR control is the standard alternative.",
      },
      recovery_fwer_formula: {
        id: "recovery_fwer_formula",
        type: "scenario_choice",
        badge: "Recovery 1",
        title: "Recovery · The FWER formula explained",
        prompt: "The interviewer asks: 'Walk me through why running 20 tests at α=0.05 is dangerous even if each individual test is clean.'",
        code_snippet: `P(at least 1 false positive) = ?
Single test: P(FP) = 0.05
k = 20 tests, all truly null`,
        choices: [
          { id: "a", label: "FWER = 1 - (1-α)^k = 1 - 0.95^20 ≈ 64%", description: "The probability of no false positives across all 20 tests is 0.95^20 ≈ 36%, so FWER ≈ 64%." },
          { id: "b", label: "FWER = k × α = 20 × 0.05 = 100%", description: "Multiplying gives the expected count of false positives, not the probability of at least one." },
          { id: "c", label: "FWER stays at 5% because each test is independent", description: "Independence means each test doesn't affect the others, but FWER still inflates." },
          { id: "d", label: "FWER = α^k = 0.05^20 ≈ 0", description: "This would be the probability of ALL 20 tests being false positives simultaneously." },
        ],
        branches: {
          a: "stage_2_uncorrected_click",
          b: "recovery_fwer_formula",
          c: "recovery_fwer_formula",
          d: "recovery_fwer_formula",
        },
        rationale: "FWER = 1 - (1-α)^k because the probability of NO false positives (all k tests correctly non-significant) is (1-α)^k under independence. Subtract from 1 to get the complement.",
      },
      recovery_bonferroni: {
        id: "recovery_bonferroni",
        type: "scenario_choice",
        badge: "Recovery 2",
        title: "Recovery · Bonferroni mechanics and limits",
        prompt: "You need to control FWER at 0.05 across 10 tests. The interviewer asks why Bonferroni may be a bad choice for a genomics team testing 20,000 SNPs.",
        code_snippet: `k = 20,000 SNP tests
desired_FWER = 0.05
Bonferroni threshold = 0.05 / 20,000 = 2.5e-6

Q: Why might this be problematic?`,
        choices: [
          { id: "a", label: "Power collapse — most true effects have p >> 2.5e-6 and are missed entirely", description: "Bonferroni is so conservative at k=20,000 that only the strongest genetic associations survive, missing subtler but real effects." },
          { id: "b", label: "The threshold is miscalculated — it should be α^k not α/k", description: "The formula α/k is wrong; the correct formula involves exponentiation." },
          { id: "c", label: "Genomics always uses p < 0.001 by convention regardless of k", description: "Industry convention overrides statistical theory here." },
          { id: "d", label: "With 20,000 tests, the central limit theorem guarantees no false positives", description: "Large k brings the CLT into play and eliminates false positives." },
        ],
        branches: {
          a: "stage_3_bonferroni_choice",
          b: "recovery_bonferroni",
          c: "recovery_bonferroni",
          d: "recovery_bonferroni",
        },
        rationale: "Bonferroni's α/k threshold becomes 2.5×10⁻⁶ for k=20,000 — far below what most true genetic effects produce. This destroys statistical power. Benjamini-Hochberg FDR control maintains meaningful power while limiting the proportion of false discoveries.",
      },
      terminal_multiple_testing: {
        id: "terminal_multiple_testing",
        type: "scenario_choice",
        badge: "Terminal",
        title: "Simulation complete · Genomics correction design",
        terminal: true,
        prompt: "A genomics team tests 10,000 SNPs at α=0.05. Summarize: how many false positives without correction, the Bonferroni threshold, and when you'd recommend BH instead.",
        code_snippet: `# Genomics multiple testing summary:
# k = 10,000 SNPs tested
# alpha = 0.05 (uncorrected)
#
# Without correction:
#   Expected FP = 10,000 * 0.05 = 500
#
# Bonferroni threshold:
#   0.05 / 10,000 = 5e-6
#
# BH (FDR=0.05) → better power for
# discovery, acceptable FP rate`,
        choices: [],
        branches: {},
        rationale: "500 expected false positives without correction is unacceptable for genomics. Bonferroni threshold of 5×10⁻⁶ is rigorous but very conservative. For exploratory discovery phases, BH at FDR=0.05 is standard practice — it identifies more true associations while controlling the proportion of false discoveries.",
      },
    },
  },
  knowledgeCheck: [
    {
      question: "You run 50 independent tests at α=0.05. Approximately what is the family-wise error rate?",
      options: [
        "~92% (FWER = 1 - 0.95^50)",
        "~5% (each test is still at α=0.05)",
        "~50% (half the tests will produce false positives)",
      ],
      correctIndex: 0,
      explanation: "FWER = 1 - (1-0.05)^50 = 1 - 0.95^50 ≈ 92.3%. Running 50 tests at 0.05 almost guarantees at least one false positive.",
    },
    {
      question: "A team runs 100 feature importance tests. Bonferroni threshold would be 0.0005. They're worried about missing real signals. What's the better approach?",
      options: [
        "Benjamini-Hochberg FDR control at FDR=0.05 — controls the false discovery rate with much more power",
        "Keep α=0.05 on each test — individual test validity is all that matters",
        "Run each test on a separate dataset to avoid the multiple testing problem",
      ],
      correctIndex: 0,
      explanation: "For large exploratory test families, Bonferroni is too conservative. Benjamini-Hochberg controls the expected proportion of false discoveries (FDR), maintaining meaningful power while limiting noise.",
    },
    {
      question: "When is Bonferroni correction most appropriate?",
      options: [
        "Confirmatory studies with few pre-specified tests where any false positive is costly",
        "Exploratory genomics studies testing tens of thousands of markers",
        "Any A/B test fleet where speed matters more than false positive control",
      ],
      correctIndex: 0,
      explanation: "Bonferroni controls FWER (probability of any false positive) — most valuable in confirmatory settings with few tests. For large exploratory test families, FDR control (BH) is far more practical.",
    },
  ],
},

"st-a3": {
  durationLabel: "15 min",
  outcomes: [
    "Explain why bootstrap resampling is done with replacement and what it simulates.",
    "Construct a bootstrap confidence interval for any statistic (mean, median, correlation).",
    "Identify when bootstrap outperforms parametric CI methods.",
  ],
  learnMarkdown: `## Outcomes

- Build an intuitive model of the bootstrap as an empirical sampling distribution.
- Derive a 95% CI from bootstrap percentiles without distributional assumptions.
- Know the settings where bootstrap is necessary and where it merely duplicates parametric methods.

## Core idea: the plug-in principle

We want the sampling distribution of a statistic θ̂ (mean, median, correlation...) but we only have one sample. Bootstrap's insight: treat your sample as a stand-in for the population, and simulate the sampling process by resampling **with replacement**.

Each bootstrap sample:
1. Draw n observations from your sample, **with replacement** (so some appear twice, some zero times)
2. Compute θ̂* on this new sample
3. Repeat B times (typically 1000–10,000)
4. The distribution of {θ̂*₁, ..., θ̂*_B} approximates the sampling distribution of θ̂

## Why with replacement?

Without replacement, you'd get a permutation of your original data — always the same values, always the same statistic. Replacement is what introduces variability and simulates the uncertainty of drawing a new sample from the population.

## Bootstrap confidence interval (percentile method)

\`\`\`
CI_95 = [θ̂*_{2.5th percentile}, θ̂*_{97.5th percentile}]
\`\`\`

This is the simplest bootstrap CI. More accurate variants (BCa — bias-corrected and accelerated) exist for skewed distributions.

## When bootstrap beats parametric methods

| Setting | Parametric CI | Bootstrap |
|---|---|---|
| Mean, large n, normal data | Works great | Works (redundant) |
| Median, any distribution | Doesn't apply cleanly | Works |
| Correlation, small n | Assumes bivariate normality | Distribution-free |
| 90th percentile | Requires order statistic theory | Straightforward |
| Complex estimator (AUC, ratio) | Often intractable | Straightforward |
| n < 30, non-normal | Unreliable | Better (if n ≥ 20-ish) |

## Limitations

- Bootstrap cannot create information that isn't in your data — it fails with extremely small n (< 15-20)
- Does not fix biased estimators
- Computationally intensive for very large datasets (though parallelizable)
- Percentile CI can be inaccurate for highly skewed statistics (use BCa or bias-corrected variants)

## Interview hook (answer like a senior)

"Bootstrap is my go-to for confidence intervals when I can't easily verify normality or when I'm computing statistics beyond the mean — medians, quantiles, AUC, or model-level metrics. At a previous role, I needed a CI for the 90th percentile of transaction latency. Parametric order-statistic intervals require large samples and assumptions I couldn't verify; bootstrap gave me a direct, distribution-free answer in 20 lines of code. The key thing I always communicate to stakeholders: bootstrap tells you about uncertainty given what's in your sample — it doesn't compensate for a small or unrepresentative sample."`,
  video: null,
  videoFallbackMarkdown: `## Active exercise: build bootstrap by hand

With a small dataset of 8 values (e.g., [3, 5, 7, 4, 6, 8, 5, 6]):

1. Draw 3 bootstrap samples with replacement (use a random number generator or dice).
2. Compute the mean and median of each bootstrap sample.
3. Notice which values appear multiple times and which are missing.
4. Conceptually: if you did this 1000 times, the distribution of bootstrap means would estimate the sampling distribution of the mean.
5. The 2.5th and 97.5th percentiles of those 1000 means form the 95% bootstrap CI.`,
  tryGuidance: "Use the Bootstrap Simulator to see resampling in action. Click 'Draw bootstrap sample' 3-5 times and notice: some values from the original dataset appear twice (highlighted ×2), some don't appear at all. This is the with-replacement sampling that drives the method. Then click 'Show distribution (200 samples)' to see the bootstrap distribution of means and the 95% CI derived from its percentiles. Compare the bootstrap CI to the theoretical SE-based CI.",
  interviewGraph: {
    initialStageId: "stage_1_replacement",
    artifactDimensions: [
      { label: "Bootstrap mechanics", recoveryStageId: "recovery_replacement" },
      { label: "Method selection", recoveryStageId: "recovery_median_ci" },
      { label: "Identifying the sampling error", recoveryStageId: "recovery_without_replacement", passLabel: "Ready to apply bootstrap in production" },
    ],
    stages: {
      stage_1_replacement: {
        id: "stage_1_replacement",
        type: "scenario_choice",
        badge: "Stage 1",
        title: "Stage 1 · The essential mechanic",
        prompt: "Bootstrap resampling is done WITH or WITHOUT replacement, and why does the answer matter?",
        code_snippet: `Original data: [3, 7, 5, 9, 4, 6, 8, 5, 7, 4]
n = 10

Bootstrap sample = ???
  (a) sample 10 values with replacement
  (b) sample 10 values without replacement`,
        choices: [
          { id: "a", label: "WITH replacement — creates variability between bootstrap samples", description: "Without replacement, every bootstrap sample is just a permutation of the original, giving the same statistic each time. Replacement introduces the necessary randomness." },
          { id: "b", label: "WITHOUT replacement — preserves the original data distribution", description: "Sampling without replacement avoids duplicates and keeps the sample representative." },
          { id: "c", label: "Either — the choice doesn't affect the confidence interval", description: "The replacement mechanism is arbitrary and doesn't change the resulting CI." },
          { id: "d", label: "WITH replacement — because it increases the effective sample size", description: "Resampling with replacement is correct, but the reason is variability, not sample size inflation." },
        ],
        branches: {
          a: "stage_2_median_choice",
          b: "recovery_replacement",
          c: "recovery_replacement",
          d: "recovery_replacement",
        },
        rationale: "With replacement is essential: it means some observations are drawn multiple times, others not at all. This variability across bootstrap samples is what empirically builds the sampling distribution. Without replacement, every resample is a permutation — same values, zero variance in the statistic.",
      },
      stage_2_median_choice: {
        id: "stage_2_median_choice",
        type: "scenario_choice",
        badge: "Stage 2",
        title: "Stage 2 · Choosing bootstrap vs parametric CI",
        prompt: "You have n=30 customer satisfaction ratings and need a 95% confidence interval for the MEDIAN (not the mean). Which method is most appropriate?",
        code_snippet: `n = 30 customer ratings
Target statistic: MEDIAN
Options:
  (a) Bootstrap CI (percentile method)
  (b) t-interval on the sample mean
  (c) Normal approximation CI
  (d) Exact binomial order-statistic CI`,
        choices: [
          { id: "a", label: "Bootstrap CI — distribution-free, directly applicable to the median", description: "Bootstrap makes no distributional assumptions and works naturally for any statistic including the median." },
          { id: "b", label: "t-interval on the sample mean", description: "The t-interval is for the mean, not the median. It doesn't apply to other statistics." },
          { id: "c", label: "Normal approximation — CLT applies at n=30", description: "CLT gives a normal approximation for the sample mean, not the median. The sampling distribution of the median converges much more slowly." },
          { id: "d", label: "Exact binomial order-statistic CI", description: "This exists but requires large samples and specific assumptions; bootstrap is simpler and more generally applicable." },
        ],
        branches: {
          a: "stage_3_wrong_code_click",
          b: "recovery_median_ci",
          c: "recovery_median_ci",
          d: "recovery_median_ci",
        },
        rationale: "The CLT applies to sample means, not medians. The sampling distribution of the median converges to normality much more slowly and depends on the density at the median. Bootstrap is the natural choice for medians and other non-mean statistics.",
      },
      stage_3_wrong_code_click: {
        id: "stage_3_wrong_code_click",
        type: "click_target",
        badge: "Stage 3 target",
        title: "Stage 3 · Spot the bootstrap implementation error",
        prompt: "A colleague wrote bootstrap code to estimate uncertainty for the median. Click the line that breaks the core bootstrap mechanic.",
        code_snippet: `import numpy as np

def bootstrap_ci(data, n_boot=1000):
    means = []
    for _ in range(n_boot):
        sample = np.random.choice(
            data,
            size=len(data),
            replace=False    # ds-target:wrong_replace
        )
        means.append(np.median(sample))
    return np.percentile(means, [2.5, 97.5])`,
        validationCopy: {
          wrong_replace: "Correct. replace=False produces permutations of the original data — every bootstrap 'sample' has identical values, just in different order. The median is invariant to order, so all bootstrap medians will be identical and the CI will collapse to a point.",
        },
        branches: {
          wrong_replace: "terminal_bootstrap_design",
          default: "recovery_without_replacement",
        },
      },
      recovery_replacement: {
        id: "recovery_replacement",
        type: "scenario_choice",
        badge: "Recovery 1",
        title: "Recovery · Why replacement is mandatory",
        prompt: "The interviewer asks: 'If I sample 10 values WITHOUT replacement from a dataset of 10, what will every bootstrap sample look like?'",
        code_snippet: `Original: [3, 7, 5, 9, 4, 6, 8, 5, 7, 4]
n = 10

Without replacement, each sample = ?`,
        choices: [
          { id: "a", label: "A permutation of the original data — always the same 10 values, just shuffled", description: "Every resample without replacement is a rearrangement, so every statistic (mean, median, etc.) is identical. The bootstrap distribution is a point mass with zero width." },
          { id: "b", label: "A subset — only 7-8 values since some are excluded", description: "Without replacement from 10 into 10 means all are selected exactly once (permutation)." },
          { id: "c", label: "A random draw from the underlying population", description: "Bootstrap operates on the sample only — it has no access to the underlying population." },
          { id: "d", label: "A sample with slightly different values due to rounding", description: "Values come from the original dataset; no rounding is introduced." },
        ],
        branches: {
          a: "stage_2_median_choice",
          b: "recovery_replacement",
          c: "recovery_replacement",
          d: "recovery_replacement",
        },
        rationale: "Sampling n items without replacement from n items gives a permutation — all original values present exactly once. Since statistics like the mean and median are permutation-invariant, all 'bootstrap' samples give the same statistic. No variability = no CI. This is why replacement is not optional.",
      },
      recovery_median_ci: {
        id: "recovery_median_ci",
        type: "scenario_choice",
        badge: "Recovery 2",
        title: "Recovery · Bootstrap vs parametric for non-mean statistics",
        prompt: "The interviewer says: 'The CLT gives a normal approximation. Why doesn't it apply to the median's sampling distribution at n=30?'",
        code_snippet: `CLT: sample mean → Normal as n → ∞
Q: Does sample median → Normal at n=30?`,
        choices: [
          { id: "a", label: "The median's convergence to normality is slower and depends on the density at the median", description: "The CLT for the median requires the density to be positive at the median and converges at rate 1/√n, but with a different variance term — and at n=30, the approximation may be poor." },
          { id: "b", label: "CLT applies to all statistics, including the median, at n=30", description: "The CLT applies to sums/means; other statistics converge differently." },
          { id: "c", label: "n=30 is the universal threshold after which all statistics are normal", description: "The n=30 rule is a heuristic for means from symmetric distributions — it doesn't generalize." },
          { id: "d", label: "The median has no sampling distribution because it's always in the data", description: "All statistics have sampling distributions; the median is computed from a sample and varies across samples." },
        ],
        branches: {
          a: "stage_3_wrong_code_click",
          b: "recovery_median_ci",
          c: "recovery_median_ci",
          d: "recovery_median_ci",
        },
        rationale: "The CLT is specifically about sums/means converging to normal. For medians and quantiles, convergence exists but depends on the local density at the quantile value and is harder to guarantee at small n. Bootstrap sidesteps this by making no distributional assumption.",
      },
      recovery_without_replacement: {
        id: "recovery_without_replacement",
        type: "scenario_choice",
        badge: "Recovery 3",
        title: "Recovery · What does replace=False produce?",
        prompt: "A bootstrap code uses replace=False. If the original data has 20 values and you draw 20 without replacement, what does the bootstrap distribution look like?",
        code_snippet: `data = [... 20 values ...]
# With replace=False:
for _ in range(1000):
    s = np.random.choice(data, size=20, replace=False)
    bootstrap_stats.append(statistic(s))`,
        choices: [
          { id: "a", label: "A point mass — all bootstrap statistics are identical because every sample is a permutation", description: "Order-invariant statistics (mean, median, std) give the exact same value for every permutation of the data." },
          { id: "b", label: "A wide distribution because there are many permutations", description: "The number of permutations is large, but the statistic's value doesn't change between permutations." },
          { id: "c", label: "A valid bootstrap distribution with some variance due to randomness", description: "Randomizing the order of fixed values doesn't change order-invariant statistics." },
          { id: "d", label: "A distribution centered on the population mean, not the sample mean", description: "Bootstrap operates on the sample; it doesn't access the population." },
        ],
        branches: {
          a: "terminal_bootstrap_design",
          b: "recovery_without_replacement",
          c: "recovery_without_replacement",
          d: "recovery_without_replacement",
        },
        rationale: "Every permutation of 20 values has the same mean, median, variance, etc. replace=False produces a degenerate 'distribution' with zero variance — a useless CI. This is the single most common bootstrap implementation error.",
      },
      terminal_bootstrap_design: {
        id: "terminal_bootstrap_design",
        type: "scenario_choice",
        badge: "Terminal",
        title: "Simulation complete · Design a bootstrap CI for a percentile",
        terminal: true,
        prompt: "You have 50 transaction amounts and need a 95% CI for the 90th percentile. Describe the bootstrap procedure step by step.",
        code_snippet: `# Bootstrap CI for the 90th percentile:
# n = 50 transactions
#
# Step 1: Compute p90 = np.percentile(data, 90)
# Step 2: For b in range(B=2000):
#     sample = np.random.choice(data, size=50,
#                               replace=True)  # <- key
#     boot_p90[b] = np.percentile(sample, 90)
# Step 3: CI = np.percentile(boot_p90, [2.5, 97.5])`,
        choices: [],
        branches: {},
        rationale: "Bootstrap applies uniformly: replace 'mean' with any statistic. Resample with replacement, compute the target statistic, collect B replicates, take the 2.5th and 97.5th percentiles. For skewed statistics like high quantiles on small samples, consider BCa (bias-corrected accelerated) intervals for better coverage.",
      },
    },
  },
  knowledgeCheck: [
    {
      question: "You draw a bootstrap sample from n=15 data points. Why must you sample WITH replacement?",
      options: [
        "Without replacement, every resample is a permutation — order-invariant statistics are identical across all resamples, collapsing the bootstrap distribution to a point",
        "Without replacement you get fewer than 15 values and lose statistical power",
        "Replacement doubles the effective sample size, improving CI accuracy",
      ],
      correctIndex: 0,
      explanation: "Sampling without replacement from n values into n values gives a permutation. Statistics like mean and median are identical for all permutations, producing a degenerate 'distribution' with zero width. Replacement is what creates variability across bootstrap samples.",
    },
    {
      question: "Why is bootstrap preferred over a t-interval for a confidence interval on the MEDIAN?",
      options: [
        "Bootstrap makes no distributional assumptions; the CLT doesn't directly apply to the median's sampling distribution",
        "Bootstrap uses more data by resampling 1000 times, giving a more stable estimate",
        "The t-distribution applies to medians when n > 30 per the central limit theorem",
      ],
      correctIndex: 0,
      explanation: "The CLT applies to sums/means. The sampling distribution of the median depends on the density at the median and converges to normality much more slowly. Bootstrap sidesteps these assumptions entirely.",
    },
    {
      question: "A bootstrap CI for the 90th percentile of salary data is [58k, 72k]. How do you construct this?",
      options: [
        "Resample with replacement 1000+ times, compute the 90th percentile each time, then take the 2.5th and 97.5th percentile of those bootstrap statistics",
        "Compute the mean of the salary data and add/subtract 1.96 standard errors",
        "Use the exact binomial order-statistic formula for quantile CIs",
      ],
      correctIndex: 0,
      explanation: "Bootstrap CI for any statistic: resample with replacement, compute the statistic B times, take the [α/2, 1-α/2] percentiles of the bootstrap distribution. No normality assumptions needed.",
    },
  ],
},

"st-a4": {
  durationLabel: "18 min",
  outcomes: [
    "Articulate the philosophical difference between Frequentist and Bayesian probability.",
    "Correctly interpret confidence intervals vs credible intervals — and avoid the most common misinterpretation.",
    "Choose between frameworks given problem structure: sequential testing, small n, domain knowledge, or direct probability statements.",
  ],
  learnMarkdown: `## Outcomes

- State what each framework means by 'probability' and why the definitions lead to different tools.
- Translate a Bayesian credible interval into plain language (and explain why you can't do the same for a frequentist CI).
- Know when Bayesian methods solve problems that frequentist methods structurally cannot.

## The core philosophical divide

**Frequentist:** Probability is long-run frequency. The parameter θ (e.g., drug efficacy) is a fixed, unknown constant — it doesn't have a distribution. Only data are random.

**Bayesian:** Probability is degree of belief. The parameter θ is uncertain and can be represented as a probability distribution — the posterior P(θ | data), updated from a prior P(θ).

This isn't just philosophy — it changes what questions you can answer.

## Frequentist framework

- Hypothesis testing: Fix H₀, compute P(data this extreme | H₀ is true) — the p-value
- Confidence interval: A procedure with 95% long-run coverage, **not** a probability statement about this specific interval
- Correct: "If we repeated this experiment many times, 95% of intervals built this way would contain the true θ"
- Wrong: "There is a 95% probability θ is in [2.1%, 4.7%]" ← this is the Bayesian statement

## Bayesian framework

For the drug scenario (15/20 patients improved):
- **Prior:** P(p) — your belief before data, e.g., Beta(2,2) = "mildly skeptical"
- **Likelihood:** P(data | p) = Binomial(20, p)
- **Posterior:** P(p | data) ∝ Likelihood × Prior = Beta(17, 7)

\`\`\`
Posterior = Beta(a₀ + successes, b₀ + failures)
          = Beta(2 + 15, 2 + 5) = Beta(17, 7)
Posterior mean = 17 / (17+7) = 70.8%
\`\`\`

A 95% **credible interval** from the posterior IS a probability statement: "Given the prior and data, there is a 95% probability the true efficacy is in this range."

## The peeking problem solved by Bayes

Frequentist p-values are invalid when you peek at data and stop when p < 0.05 (optional stopping). Bayesian posterior probabilities update coherently with every new observation — you can check at any time and the interpretation remains valid.

## Prior sensitivity

The prior matters most when n is small and decreases in influence as n grows. With 15/20 observations:
- Skeptical prior Beta(2,8): posterior mean ≈ 60%
- Neutral prior Beta(2,2): posterior mean ≈ 71%
- Optimistic prior Beta(8,2): posterior mean ≈ 79%

With n=2000 observations at 75%, all priors converge near 75%. This convergence (Bernstein-von Mises theorem) reassures frequentists that Bayesian results aren't purely driven by prior choice.

## When to choose Bayesian

| Situation | Frequentist | Bayesian |
|---|---|---|
| "Is the difference significant?" | Yes | Yes |
| "P(treatment is better)?" | Cannot answer | Direct answer |
| Sequential stopping | Invalid peeking | Coherent |
| Domain knowledge available | Ignored | Incorporated as prior |
| Small n, rare events | Unstable | Prior stabilizes |

## Interview hook (answer like a senior)

"A PM asked me: 'Is our new onboarding 60% likely to improve retention?' Under frequentism, I can't answer that directly — I can only say whether our result would be unlikely under H₀. I'd give a p-value and 95% CI. Under a Bayesian framework, I'd build a Beta-Binomial model with a weakly informative prior, update on the observed data, and directly compute P(p > 0.6 | data) from the posterior. If it's 87%, I can literally tell the PM 'there's an 87% chance the treatment works.' The choice of framework depends on whether the team needs a direct probability of success or just a hypothesis test result."`,
  video: null,
  videoFallbackMarkdown: `## Active exercise: the interpretation challenge

Write the following sentence and identify which framework it belongs to:

1. "95% of confidence intervals built by this procedure will contain the true mean." → [Frequentist]
2. "There is a 95% probability the true conversion rate is between 2.1% and 4.7%." → [Bayesian]
3. "The probability this drug works is 87%." → [Bayesian]
4. "If H₀ were true, we'd see this result only 3% of the time." → [Frequentist]

Now: how would you explain the difference between statements 1 and 2 to a product manager who has never taken a statistics course?`,
  tryGuidance: "Use the Bayesian vs Frequentist Explorer to compare both frameworks on the same drug scenario (15/20 patients improved). In 'Side-by-side' view, notice how the frequentist result gives a p-value and CI while the Bayesian result gives a posterior mean and credible interval. Switch priors from Skeptical to Neutral to Optimistic and watch the posterior shift in the 'Posterior chart' tab. In 'Key differences', study the credible vs confidence interval distinction — this is one of the most commonly tested concepts in DS interviews.",
  interviewGraph: {
    initialStageId: "stage_1_credible_meaning",
    artifactDimensions: [
      { label: "Credible vs confidence interval", recoveryStageId: "recovery_ci_interpretation" },
      { label: "Framework probability claims", recoveryStageId: "recovery_freq_probability" },
      { label: "Sequential testing validity", recoveryStageId: "recovery_sequential", passLabel: "Ready to choose frameworks in practice" },
    ],
    stages: {
      stage_1_credible_meaning: {
        id: "stage_1_credible_meaning",
        type: "scenario_choice",
        badge: "Stage 1",
        title: "Stage 1 · Interpret the credible interval",
        prompt: "A Bayesian analysis produces a 95% credible interval [2.1%, 4.7%] for a conversion rate lift. What does this mean?",
        code_snippet: `Bayesian model:
  Prior: Beta(2, 2) -- weakly informative
  Data: 420/10000 conversions in treatment
        vs 380/10000 in control
  Posterior 95% credible interval: [2.1%, 4.7%]`,
        choices: [
          { id: "a", label: "There is a 95% probability the true lift is between 2.1% and 4.7%, given the prior and data", description: "Bayesian credible intervals are direct probability statements about the parameter — unlike frequentist confidence intervals." },
          { id: "b", label: "If we ran this experiment 100 times, 95 of the CIs would contain the true lift", description: "That is the frequentist confidence interval interpretation, not the Bayesian credible interval." },
          { id: "c", label: "The true lift is definitely between 2.1% and 4.7%", description: "The credible interval reflects probabilistic uncertainty, not certainty." },
          { id: "d", label: "The experiment had 95% statistical power at these lift values", description: "Power is a frequentist pre-experiment calculation, not a Bayesian posterior summary." },
        ],
        branches: {
          a: "stage_2_freq_misuse_click",
          b: "recovery_ci_interpretation",
          c: "recovery_ci_interpretation",
          d: "recovery_ci_interpretation",
        },
        rationale: "A Bayesian credible interval IS a probability statement: P(θ ∈ [2.1%, 4.7%] | data, prior) = 0.95. This is the statement frequentist CIs cannot make — frequentist CIs describe a procedure's long-run behavior, not the probability of a specific interval.",
      },
      stage_2_freq_misuse_click: {
        id: "stage_2_freq_misuse_click",
        type: "click_target",
        badge: "Stage 2 target",
        title: "Stage 2 · Flag the misinterpretation",
        prompt: "A report uses a frequentist confidence interval but interprets it incorrectly in a Bayesian way. Click the line with the invalid interpretation.",
        code_snippet: `# Frequentist analysis of drug trial:
p_hat = 0.72  # observed success rate
ci_95 = (0.61, 0.83)  # 95% confidence interval

# Report conclusions:
print("We observed 72% success rate.")
print("95% CI: (61%, 83%)")
print(f"There is a 95% probability the true")
print(f"success rate is between 61% and 83%.") # ds-target:bayes_misuse
print("This result is statistically significant.")`,
        validationCopy: {
          bayes_misuse: "Correct. Frequentist CIs do NOT support 'there is a 95% probability the true parameter is in this interval.' That is the Bayesian credible interval interpretation. The correct frequentist statement: 'this procedure produces intervals that contain the true value in 95% of repeated experiments.'",
        },
        branches: {
          bayes_misuse: "stage_3_probability_choice",
          default: "recovery_freq_probability",
        },
      },
      stage_3_probability_choice: {
        id: "stage_3_probability_choice",
        type: "scenario_choice",
        badge: "Stage 3",
        title: "Stage 3 · Which framework can make this claim?",
        prompt: "An analyst says: 'The probability that the drug is effective is 87%.' Which statistical framework supports this statement?",
        code_snippet: `Statement: "P(drug is effective) = 87%"

Framework A (Frequentist):
  - theta is fixed, not random
  - P-values describe data under H0

Framework B (Bayesian):
  - theta has a probability distribution
  - posterior gives P(theta | data)`,
        choices: [
          { id: "a", label: "Bayesian — only Bayesian posteriors allow direct probability statements about parameters", description: "Frequentists treat θ as a fixed constant, so P(drug effective) is not a meaningful frequentist statement. Bayesians model θ as a random variable and can compute this directly from the posterior." },
          { id: "b", label: "Frequentist — the p-value of 0.13 implies 87% confidence", description: "1 - p-value does not equal the probability of the hypothesis being true. This is a common but fundamental error." },
          { id: "c", label: "Both — any probability statement about results is valid in either framework", description: "The frameworks assign probability to different objects: data (frequentist) vs parameters (Bayesian)." },
          { id: "d", label: "Neither — it is impossible to assign probabilities to scientific hypotheses", description: "Bayesian statistics is explicitly designed to assign probabilities to hypotheses and parameters." },
        ],
        branches: {
          a: "stage_4_sequential_choice",
          b: "recovery_freq_probability",
          c: "recovery_freq_probability",
          d: "recovery_freq_probability",
        },
        rationale: "Frequentists treat θ as a fixed unknown constant — P(drug effective) is not a valid frequentist quantity. Only Bayesian posteriors assign probabilities to parameter values and hypotheses. This is the deepest conceptual difference between the frameworks.",
      },
      stage_4_sequential_choice: {
        id: "stage_4_sequential_choice",
        type: "scenario_choice",
        badge: "Stage 4",
        title: "Stage 4 · Sequential testing and the peeking problem",
        prompt: "An analyst runs a sequential A/B test and checks results weekly, stopping when the Bayesian posterior probability that treatment beats control exceeds 95%. Is this statistically valid?",
        code_snippet: `# Sequential Bayesian A/B test
week = 1
while True:
    observe_new_data()
    update_posterior()
    p_treatment_better = compute_posterior_prob()
    if p_treatment_better > 0.95:
        stop_and_ship()
        break
    week += 1`,
        choices: [
          { id: "a", label: "Yes — Bayesian posteriors update coherently; checking at any point is valid under the Bayesian framework", description: "Unlike frequentist p-values which are invalid under optional stopping, Bayesian posterior probabilities remain coherent regardless of when you check. There is no multiple comparisons inflation." },
          { id: "b", label: "No — checking weekly is peeking, which inflates false-positive rates regardless of framework", description: "The peeking problem is a frequentist issue caused by optional stopping. Bayesian posteriors don't suffer from this." },
          { id: "c", label: "Only valid if you pre-register the stopping threshold before the experiment", description: "Pre-registration is a frequentist requirement to prevent p-hacking. In the Bayesian framework, the posterior is valid at any stopping point." },
          { id: "d", label: "It depends on whether the data are independent week over week", description: "Bayesian updating handles sequential data naturally; independence between observations is an assumption about the likelihood, not about when you check the posterior." },
        ],
        branches: {
          a: "terminal_bayes_freq_comparison",
          b: "recovery_sequential",
          c: "recovery_sequential",
          d: "recovery_sequential",
        },
        rationale: "Bayesian sequential testing is one of the framework's genuine advantages. The posterior probability is a coherent summary of your current belief given all data seen so far. Stopping when P(treatment > control | data) > 95% is a valid and natural Bayesian decision rule — unlike frequentist optional stopping, which inflates Type I error.",
      },
      recovery_ci_interpretation: {
        id: "recovery_ci_interpretation",
        type: "scenario_choice",
        badge: "Recovery 1",
        title: "Recovery · Confidence interval vs credible interval",
        prompt: "The interviewer asks: 'After an experiment, you report CI = [2%, 8%]. What can you NOT say about this if it is a frequentist confidence interval?'",
        code_snippet: `Result: 95% frequentist CI = [2%, 8%]

Which statement is invalid?
(a) "95% of such intervals contain the true value"
(b) "There is a 95% probability true lift is in [2%,8%]"
(c) "This procedure has 95% long-run coverage"
(d) "The interval was computed at alpha=0.05"`,
        choices: [
          { id: "a", label: "Statement (b) — cannot claim 95% probability that THIS specific interval contains the true value", description: "The frequentist CI describes the procedure's long-run behavior, not the probability for the realized interval. Once computed, the true value is either in it or not — no probability applies to a specific interval." },
          { id: "b", label: "Statement (a) — frequentist CIs don't describe long-run coverage", description: "Long-run coverage is exactly what a frequentist CI describes." },
          { id: "c", label: "Statement (c) — frequentist CIs say nothing about the procedure", description: "The procedure's long-run coverage is the frequentist CI's primary claim." },
          { id: "d", label: "Statement (d) — alpha is a Bayesian concept", description: "Alpha is used in frequentist hypothesis testing and interval construction." },
        ],
        branches: {
          a: "stage_2_freq_misuse_click",
          b: "recovery_ci_interpretation",
          c: "recovery_ci_interpretation",
          d: "recovery_ci_interpretation",
        },
        rationale: "The frequentist CI is a procedure: 'If we ran this experiment infinitely many times and computed CIs each time, 95% would contain the true θ.' For the single realized interval [2%, 8%], the true value is either in it or not. We cannot say there is 95% probability it's inside — that's the Bayesian credible interval.",
      },
      recovery_freq_probability: {
        id: "recovery_freq_probability",
        type: "scenario_choice",
        badge: "Recovery 2",
        title: "Recovery · What does a frequentist p-value actually measure?",
        prompt: "A frequentist test produces p = 0.04. The PM asks 'does this mean there's a 96% chance the drug works?' What do you say?",
        code_snippet: `Frequentist test:
  H0: drug has no effect (p_success = 0.5)
  Observed: 15/20 improvements
  p-value = 0.04

PM: "So 96% chance the drug works?"`,
        choices: [
          { id: "a", label: "No — p=0.04 means: if H₀ were true, data this extreme would occur only 4% of the time. It says nothing about P(drug works).", description: "The p-value measures the probability of the observed data (or more extreme) given H₀ is true — P(data | H₀). It does not measure P(H₀ false | data)." },
          { id: "b", label: "Yes — 1 - p-value is the probability the alternative hypothesis is correct", description: "1-p is not P(H₁). This conflation (the 'prosecutor's fallacy') is one of the most common statistical errors." },
          { id: "c", label: "P(drug works) = 0.96 only if we assume a uniform prior", description: "P(drug works | data) requires a Bayesian posterior — it depends on the prior, not on 1-p." },
          { id: "d", label: "Frequentist p-values are equivalent to Bayesian posterior probabilities for large samples", description: "They converge numerically in specific conditions (Jeffreys-Lindley paradox aside), but they answer fundamentally different questions." },
        ],
        branches: {
          a: "stage_4_sequential_choice",
          b: "recovery_freq_probability",
          c: "recovery_freq_probability",
          d: "recovery_freq_probability",
        },
        rationale: "P(data | H₀) ≠ P(H₀ | data). The p-value is not the probability the null is false. It's the probability of observing data at least this extreme assuming H₀ is true. To get P(H₀ false | data), you need Bayes' theorem and a prior.",
      },
      recovery_sequential: {
        id: "recovery_sequential",
        type: "scenario_choice",
        badge: "Recovery 3",
        title: "Recovery · Why Bayesian posteriors handle sequential checking",
        prompt: "The interviewer asks: 'Why does peeking at frequentist p-values daily inflate false positives, but checking Bayesian posteriors daily does not?'",
        code_snippet: `# Frequentist daily check:
for day in experiment:
    if p_value < 0.05:  # invalid: inflates FPR
        ship()

# Bayesian daily check:
for day in experiment:
    update_posterior(new_data)
    if P(treatment > control | data) > 0.95:  # valid
        ship()`,
        choices: [
          { id: "a", label: "Frequentist p-values depend on the stopping rule; Bayesian posteriors are valid summaries of current evidence regardless of when you stop", description: "P-values are calibrated assuming a pre-specified stopping rule. Bayesian posteriors carry no such calibration requirement — they describe current belief given all data seen, at any point." },
          { id: "b", label: "Bayesian methods are also invalid under sequential checking — the same peeking problem applies", description: "Peeking is a frequentist problem caused by violation of optional stopping assumptions. It does not apply to Bayesian posteriors." },
          { id: "c", label: "Bayesian methods use larger sample sizes, giving them more stable estimates", description: "Both frameworks use the same data; the difference is how evidence is accumulated and interpreted." },
          { id: "d", label: "P-values and posteriors are numerically equivalent for large samples, so peeking is equally valid in both", description: "Numerical near-equivalence in some cases doesn't imply the same validity under sequential stopping." },
        ],
        branches: {
          a: "terminal_bayes_freq_comparison",
          b: "recovery_sequential",
          c: "recovery_sequential",
          d: "recovery_sequential",
        },
        rationale: "Frequentist p-values are p-hacked by optional stopping because their calibration assumes a fixed stopping rule. Bayesian posteriors update via Bayes' theorem — each update is coherent regardless of when you check. The posterior P(θ | data so far) is always a valid summary of current belief.",
      },
      terminal_bayes_freq_comparison: {
        id: "terminal_bayes_freq_comparison",
        type: "scenario_choice",
        badge: "Terminal",
        title: "Simulation complete · Answer the PM's question both ways",
        terminal: true,
        prompt: "A PM asks: 'Is our new onboarding 60% likely to improve retention?' How do you answer under frequentism and under Bayesianism?",
        code_snippet: `# PM's question: P(improvement > 0%) = ?
#
# Frequentist response:
#   Cannot directly answer.
#   Report: p-value, 95% CI, reject/fail to reject H0
#   "We cannot quantify P(hypothesis is true)"
#
# Bayesian response:
#   Compute posterior P(delta > 0 | data)
#   Can directly say: "87% probability treatment improves retention"
#   Report: posterior mean, credible interval`,
        choices: [],
        branches: {},
        rationale: "This is the practical punch line: frequentist tools answer 'is the data consistent with H₀?' while Bayesian tools answer 'what do we believe about the parameter?' PMs almost always want the latter. Recognizing when the question demands a Bayesian framework — and being able to set one up — is a senior DS skill.",
      },
    },
  },
  knowledgeCheck: [
    {
      question: "A frequentist 95% CI is [12%, 18%]. Which interpretation is CORRECT?",
      options: [
        "If we built CIs this way across many experiments, 95% of them would contain the true value",
        "There is a 95% probability the true value is between 12% and 18%",
        "The true value is definitely between 12% and 18% with 95% certainty",
      ],
      correctIndex: 0,
      explanation: "Frequentist CIs describe a procedure's long-run behavior. Once computed, the specific interval [12%, 18%] either contains the true value or it doesn't — we can't assign a probability to this specific interval. The 95% refers to the procedure across repeated experiments.",
    },
    {
      question: "Which framework allows the statement 'there is a 73% probability the treatment is better than control'?",
      options: [
        "Bayesian — posteriors assign probability directly to parameter values and hypotheses",
        "Frequentist — 1 - p-value gives the probability the alternative is correct",
        "Both frameworks support this statement for large samples",
      ],
      correctIndex: 0,
      explanation: "Frequentists treat θ as fixed; P(treatment better) is not a frequentist quantity. 1-p-value is not P(H₁). Only Bayesian posteriors allow direct probability statements about hypotheses and parameters.",
    },
    {
      question: "Why can a Bayesian analyst validly check posterior probabilities weekly during a sequential A/B test, while a frequentist analyst cannot check p-values weekly?",
      options: [
        "Frequentist p-values are calibrated assuming a pre-specified stopping rule; Bayesian posteriors update coherently regardless of when you check",
        "Bayesian methods automatically adjust for multiple comparisons; frequentist methods do not",
        "Bayesian sequential testing uses larger sample sizes, avoiding the peeking bias",
      ],
      correctIndex: 0,
      explanation: "Optional stopping inflates frequentist p-values because their Type I error calibration assumes the stopping rule was fixed before data collection. Bayesian posteriors describe current belief given all data seen — there is no inflation from checking at different times.",
    },
  ],
},


"dl-f1": {
  durationLabel: "18 min",
  outcomes: [
    "Explain the **universal approximation theorem** and why it matters — and why it's not the whole story.",
    "Describe how a single perceptron functions as a **linear classifier** and where it fails.",
    "Articulate why **depth** beats raw width in practice through hierarchical feature learning.",
    "Recognize when a network architecture is ignoring depth in favor of brute-force width.",
  ],
  learnMarkdown: `## The Perceptron: A Single Neuron

A **perceptron** is the atomic unit of any neural network. It computes a weighted sum of its inputs, adds a bias, then passes the result through an activation function:

\`\`\`
y = σ(w₁x₁ + w₂x₂ + ... + wₙxₙ + b)
  = σ(w · x + b)
\`\`\`

Without an activation function σ, this is just a linear transformation — you get a **hyperplane** slicing through input space. That makes the perceptron a linear classifier: it can separate classes only when they are **linearly separable**. The classic failure case is XOR: no single straight line can separate the four XOR outputs. This limits the perceptron to problems where the decision boundary is a hyperplane.

## Adding Nonlinearity Changes Everything

The activation function σ is what breaks linearity. Common choices include sigmoid, tanh, and ReLU (covered in dl-f3). Stacking layers with nonlinear activations allows the network to bend and fold input space, creating arbitrarily complex decision boundaries.

A single hidden layer with a nonlinear activation can already separate XOR — the first layer learns a new representation of the inputs where the classes become linearly separable, and the output layer draws the boundary in that new space.

## The Universal Approximation Theorem

The **Universal Approximation Theorem (UAT)** states that a feedforward network with a single hidden layer containing a sufficient number of neurons with a nonlinear activation can approximate any continuous function on a compact subset of ℝⁿ to arbitrary precision.

\`\`\`
f(x) ≈ Σᵢ αᵢ σ(wᵢ · x + bᵢ)    (sum over N hidden units)
\`\`\`

This sounds powerful — and it is, theoretically. But the UAT comes with a critical asterisk: it guarantees existence, not learnability or efficiency. The number of neurons required for a given approximation can be **exponentially large**. A single wide layer might need millions of units to approximate what a modest deep network learns with thousands.

## Why Depth Beats Width in Practice

Here is where theory meets reality. Empirically and theoretically, **deep networks outperform equivalently-expressive wide networks** for structured tasks like vision, language, and speech.

The core intuition is **hierarchical feature learning**. In a deep convolutional network trained on images:

- Layer 1 learns edges and color gradients
- Layer 2 combines edges into textures and corners
- Layer 3 combines textures into parts (eyes, wheels)
- Layer 4 combines parts into objects

Each layer builds on the previous. A single wide layer has no such compositional structure — every hidden unit directly sees raw pixels, with no mechanism to reuse intermediate representations.

Mathematically, deep networks can represent certain function classes (like polynomials of the input) with exponentially fewer parameters than shallow networks. This is the **depth efficiency** argument.

## Practical Consequences

**Optimization**: Wide shallow networks are harder to optimize. All the representational power sits in one layer, creating a harder loss landscape. Deep networks decompose the problem into stages, each with an easier local objective.

**Generalization**: Depth acts as an implicit inductive bias. A deep network with good architecture encodes structural assumptions about the problem (hierarchy, locality, compositionality) that constrain the hypothesis space and improve generalization.

**Gradient flow**: Very wide layers can slow training by making gradient updates diffuse across many parameters with little structured signal.

The practical rule of thumb: prefer **moderate width, greater depth** for most structured tasks. Start with established depth patterns (ResNet, Transformer block counts) rather than guessing single-layer width.

## Interview hook (answer like a senior)

"The universal approximation theorem tells us a single hidden layer is theoretically sufficient, but in practice it's nearly useless as a design principle — the required width can be exponential in problem complexity, optimization becomes much harder with flat wide layers, and you lose the hierarchical feature reuse that makes deep networks data-efficient. Depth isn't just an engineering trick; it's an inductive bias that matches the compositional structure of most real-world problems."`,

  video: null,
  videoFallbackMarkdown: `## Deep dive

### Why the UAT Doesn't Justify Shallow Networks

The UAT is an **existence proof**, not a construction. It says a shallow network with enough neurons *can* represent any function — but it says nothing about:

1. **How many neurons are needed** (often exponential in the input dimension)
2. **Whether gradient descent will find the right weights** (optimization hardness grows with width)
3. **Whether the learned function will generalize** (more parameters without structure → weaker inductive bias)

### Depth and the VC Dimension

Deep networks achieve high VC dimension (expressive power) with **far fewer parameters** than comparably expressive shallow networks. A depth-L network with width W has VC dimension roughly O(W²L log W), while a single-layer network needs O((WL)²) neurons to match — exponential scaling.

### The XOR Proof (Constructive)

Given inputs (x₁, x₂) ∈ {0,1}², XOR outputs 1 iff exactly one input is 1.

A two-layer solution:
- Neuron 1: fires if x₁ OR x₂ (w=[1,1], b=-0.5)
- Neuron 2: fires if x₁ AND x₂ (w=[1,1], b=-1.5)
- Output: Neuron 1 minus Neuron 2 (XOR = OR minus AND)

This demonstrates that a hidden layer creates a new coordinate system where the problem becomes linearly separable.`,

  tryGuidance: "Use the network diagram to add and remove hidden layers. Observe how the decision boundary changes for the XOR dataset as you increase depth vs. width. Try matching the performance of a 2-hidden-layer network using only a single wide layer — note how many neurons you need.",

  interviewGraph: {
    initialStageId: "f1_wide_click",
    artifactDimensions: [
      { label: "Universal Approximation", recoveryStageId: "f1_recovery_uat" },
      { label: "Depth vs Width", recoveryStageId: "f1_recovery_depth" },
      { label: "Linear Separability", recoveryStageId: "f1_recovery_linear", passLabel: "Architecture Mastery" },
    ],
    stages: {
      f1_wide_click: {
        id: "f1_wide_click",
        type: "click_target",
        badge: "Stage 1 · Architecture",
        title: "Stage 1 · Spot the depth problem",
        prompt: "This network is tasked with classifying ImageNet images. Click the line that trades hierarchical depth for brute-force width.",
        code_snippet: `import tensorflow as tf

model = tf.keras.Sequential([
    tf.keras.layers.Flatten(input_shape=(224, 224, 3)),
    tf.keras.layers.Dense(1000, activation='relu'),  # ds-target:f1_wide_layer
    tf.keras.layers.Dense(1000, activation='softmax')
])

model.compile(optimizer='adam', loss='categorical_crossentropy')`,
        validationCopy: {
          f1_wide_layer: "Correct. A single Dense(1000) hidden layer forces all 150,000 pixels to be combined in one step — no hierarchy, no reuse of intermediate features. A deep network would stack many layers of moderate width to learn progressively abstract representations.",
        },
        branches: { f1_wide_layer: "f1_uaf_choice" },
      },
      f1_uaf_choice: {
        id: "f1_uaf_choice",
        type: "scenario_choice",
        badge: "Stage 2 · UAT",
        title: "Stage 2 · Universal approximation in practice",
        prompt: "An interviewer says: 'The universal approximation theorem proves a single hidden layer is sufficient for any task. So why use deep networks?' What is the best response?",
        code_snippet: `# Single hidden layer "universal" network
model = Sequential([
    Dense(10000, activation='sigmoid'),  # very wide
    Dense(num_classes, activation='softmax')
])

# Deep alternative
deep_model = Sequential([
    Dense(256, activation='relu'),
    Dense(256, activation='relu'),
    Dense(256, activation='relu'),
    Dense(num_classes, activation='softmax')
])`,
        choices: [
          {
            id: "a",
            label: "The UAT guarantees existence, not learnability — required width can be exponential and optimization is harder.",
            description: "This is the core rebuttal. The UAT is an existence proof, not a practical design principle.",
          },
          {
            id: "b",
            label: "The UAT only applies to regression tasks, not classification.",
            description: "Incorrect. The UAT applies broadly to continuous function approximation, regardless of task type.",
          },
          {
            id: "c",
            label: "Deep networks use less memory, which is the real reason.",
            description: "Memory is a secondary concern. The primary issues are optimization hardness and lack of hierarchical inductive bias.",
          },
          {
            id: "d",
            label: "Shallow networks cannot use backpropagation.",
            description: "Incorrect. Backpropagation works fine on shallow networks — the issue is not the algorithm but the structural properties.",
          },
        ],
        branches: { a: "f1_hierarchy_choice", b: "f1_recovery_uat", c: "f1_recovery_uat", d: "f1_recovery_uat" },
        rationale: "The UAT is a mathematical existence result: it says a solution *exists* with enough neurons. It makes no promise about how many neurons are needed (often exponential), whether gradient descent will find the weights, or whether the model will generalize. Deep networks earn their advantage through hierarchical feature reuse, better optimization landscapes, and implicit inductive bias.",
      },
      f1_recovery_uat: {
        id: "f1_recovery_uat",
        type: "scenario_choice",
        badge: "Recovery · UAT",
        title: "Recovery · What the UAT actually promises",
        prompt: "Which statement about the Universal Approximation Theorem is TRUE?",
        code_snippet: `# UAT says: for any continuous f and ε > 0,
# there exist weights W such that:
# |network(x; W) - f(x)| < ε  for all x in domain
#
# It does NOT say:
# - how large the network must be
# - that gradient descent finds W
# - that the network generalizes`,
        choices: [
          {
            id: "a",
            label: "A single hidden layer with enough neurons can approximate any continuous function.",
            description: "True — this is precisely what the UAT states, for a compact domain.",
          },
          {
            id: "b",
            label: "The UAT guarantees gradient descent will converge to the optimal approximation.",
            description: "False. The UAT says nothing about optimization — it's a pure existence result.",
          },
          {
            id: "c",
            label: "The UAT means shallow networks are preferable to deep ones.",
            description: "False. The UAT shows theoretical possibility, not practical superiority.",
          },
        ],
        branches: { a: "f1_hierarchy_choice", b: "f1_recovery_uat", c: "f1_recovery_uat" },
        rationale: "The UAT states that a single hidden layer is a universal function approximator — but width may need to grow exponentially, and the theorem says nothing about optimization or generalization.",
      },
      f1_hierarchy_choice: {
        id: "f1_hierarchy_choice",
        type: "scenario_choice",
        badge: "Stage 3 · Depth",
        title: "Stage 3 · What deeper layers actually learn",
        prompt: "You add a second hidden layer to a network trained on images. Relative to the first hidden layer, what does the second hidden layer typically learn?",
        code_snippet: `model = Sequential([
    Dense(256, activation='relu'),  # Layer 1
    Dense(256, activation='relu'),  # Layer 2 — what does this learn?
    Dense(10, activation='softmax')
])`,
        choices: [
          {
            id: "a",
            label: "Higher-level combinations of Layer 1 features — more abstract representations.",
            description: "Correct. Each layer composes the previous layer's features into increasingly abstract concepts.",
          },
          {
            id: "b",
            label: "The same features as Layer 1 but with different random initialization.",
            description: "Incorrect. Without nonlinearity, yes — but with activations and depth, each layer specializes to a different abstraction level.",
          },
          {
            id: "c",
            label: "Raw pixel patterns, since all layers see the same input.",
            description: "Incorrect. Only Layer 1 sees raw pixels. Layer 2 sees Layer 1's activations — a transformed representation.",
          },
          {
            id: "d",
            label: "Lower-level features to provide redundancy.",
            description: "Incorrect. Depth creates a hierarchy of abstraction, not redundancy.",
          },
        ],
        branches: { a: "f1_xor_choice", b: "f1_recovery_depth", c: "f1_recovery_depth", d: "f1_recovery_depth" },
        rationale: "In deep networks, each layer transforms the representation from the previous layer. Layer 1 might learn edges; Layer 2 learns textures (combinations of edges); Layer 3 learns parts (combinations of textures). This compositional hierarchy is the core advantage of depth.",
      },
      f1_recovery_depth: {
        id: "f1_recovery_depth",
        type: "scenario_choice",
        badge: "Recovery · Depth",
        title: "Recovery · Hierarchical representations",
        prompt: "In a deep image classification network, which ordering of learned representations is most accurate?",
        code_snippet: `# Empirically observed in deep CNNs (e.g., Zeiler & Fergus 2014):
# Layer 1: edges, color blobs
# Layer 2: textures, corners, simple shapes
# Layer 3: object parts (eyes, wheels, handles)
# Layer 4+: whole objects, semantic categories`,
        choices: [
          {
            id: "a",
            label: "Early layers: abstract semantics. Later layers: raw pixel patterns.",
            description: "Backwards. Early layers are closest to the input and learn low-level features.",
          },
          {
            id: "b",
            label: "Early layers: low-level features (edges). Later layers: abstract semantics (objects).",
            description: "Correct. The hierarchy of abstraction increases with depth.",
          },
          {
            id: "c",
            label: "All layers learn the same mix of low-level and high-level features.",
            description: "Incorrect. Depth creates specialization — each layer occupies a different level of abstraction.",
          },
        ],
        branches: { a: "f1_recovery_depth", b: "f1_xor_choice", c: "f1_recovery_depth" },
        rationale: "Depth creates a hierarchy: early layers detect simple patterns, later layers compose them into abstract concepts. This matches the compositional structure of natural data.",
      },
      f1_xor_choice: {
        id: "f1_xor_choice",
        type: "scenario_choice",
        badge: "Stage 4 · Perceptron Limits",
        title: "Stage 4 · Why perceptrons fail on XOR",
        prompt: "A single perceptron (no hidden layers) is trained on the XOR problem and never converges to zero training error. What is the fundamental reason?",
        code_snippet: `# XOR truth table
# x1=0, x2=0 -> y=0
# x1=0, x2=1 -> y=1
# x1=1, x2=0 -> y=1
# x1=1, x2=1 -> y=0

# Perceptron decision boundary:
# w1*x1 + w2*x2 + b > 0  =>  class 1

perceptron = Sequential([Dense(1, activation='sigmoid')])`,
        choices: [
          {
            id: "a",
            label: "The perceptron is a linear classifier and XOR is not linearly separable.",
            description: "Correct. No single hyperplane can separate the XOR outputs — (0,1) and (1,0) are class 1, while (0,0) and (1,1) are class 0.",
          },
          {
            id: "b",
            label: "The sigmoid activation saturates and prevents convergence.",
            description: "Saturation is a gradient issue, not the root cause. Even a linear threshold unit (step function) cannot solve XOR.",
          },
          {
            id: "c",
            label: "XOR requires more data than two binary inputs provide.",
            description: "Incorrect. The failure is about decision boundary geometry, not dataset size.",
          },
          {
            id: "d",
            label: "The perceptron learning rule only works for regression tasks.",
            description: "Incorrect. The perceptron learning rule is specifically designed for binary classification.",
          },
        ],
        branches: { a: "f1_terminal", b: "f1_recovery_linear", c: "f1_recovery_linear", d: "f1_recovery_linear" },
        rationale: "A single-layer perceptron defines one linear decision boundary. XOR requires a non-linear boundary — specifically, two half-planes. Adding a hidden layer allows the network to first transform the input space into a linearly separable representation.",
      },
      f1_recovery_linear: {
        id: "f1_recovery_linear",
        type: "scenario_choice",
        badge: "Recovery · Linear Separability",
        title: "Recovery · Linear separability",
        prompt: "Which dataset can a single perceptron (no hidden layers) classify perfectly?",
        code_snippet: `# Dataset A: AND gate
# (0,0)->0, (0,1)->0, (1,0)->0, (1,1)->1

# Dataset B: XOR gate
# (0,0)->0, (0,1)->1, (1,0)->1, (1,1)->0

# Dataset C: Circle classification
# Points inside unit circle -> 1
# Points outside unit circle -> 0`,
        choices: [
          {
            id: "a",
            label: "Dataset A (AND gate).",
            description: "Correct. AND is linearly separable — a single line separates (1,1) from all other inputs.",
          },
          {
            id: "b",
            label: "Dataset B (XOR gate).",
            description: "Incorrect. XOR requires two decision boundaries and is not linearly separable.",
          },
          {
            id: "c",
            label: "Dataset C (circle classification).",
            description: "Incorrect. A circle boundary is nonlinear — no single hyperplane can separate inside from outside.",
          },
        ],
        branches: { a: "f1_terminal", b: "f1_recovery_linear", c: "f1_recovery_linear" },
        rationale: "AND is linearly separable: the hyperplane w₁x₁ + w₂x₂ = 1.5 correctly classifies all four inputs. XOR and circle classification require nonlinear boundaries that a single perceptron cannot form.",
      },
      f1_terminal: {
        id: "f1_terminal",
        type: "scenario_choice",
        badge: "Terminal · Synthesis",
        title: "Revision complete · Architecture mastered",
        terminal: true,
        prompt: "Final check: Why do deep networks generalize better than equivalently-expressive wide networks, empirically?",
        code_snippet: `# Equivalent parameter counts:
wide_model = Sequential([
    Dense(8192, activation='relu'),  # ~600M params
    Dense(num_classes)
])

deep_model = Sequential([
    Dense(512, activation='relu'),   # ~400K params each
    Dense(512, activation='relu'),
    Dense(512, activation='relu'),
    # ... 10 layers total, still far fewer params
    Dense(num_classes)
])`,
        choices: [
          {
            id: "a",
            label: "Depth introduces hierarchical inductive bias matching problem structure, and each layer's gradient signal is more focused.",
            description: "Correct. This captures both the structural and optimization advantages of depth.",
          },
          {
            id: "b",
            label: "Deep networks always use fewer parameters, so they overfit less by default.",
            description: "Parameter count is not the whole story — a wide network can have fewer parameters than a deep one. The advantage of depth is structural, not just quantitative.",
          },
          {
            id: "c",
            label: "Wide networks cannot use dropout, so they overfit more.",
            description: "Incorrect. Dropout can be applied to any layer regardless of width or depth.",
          },
        ],
        branches: { a: "f1_terminal", b: "f1_terminal", c: "f1_terminal" },
        rationale: "Deep networks generalize better because: (1) hierarchical inductive bias matches the compositional structure of real data, (2) each layer has a focused learning objective (local representations), (3) gradient updates are more structured than in wide layers, and (4) depth-efficient representations require fewer parameters for the same expressivity.",
      },
    },
  },

  knowledgeCheck: [
    {
      question: "The Universal Approximation Theorem states that a single hidden layer can approximate any continuous function. Why is this NOT a practical justification for using shallow networks?",
      options: [
        "The required number of neurons can be exponentially large, and optimization becomes significantly harder without hierarchical structure.",
        "The UAT only applies to networks with sigmoid activations, not modern activations like ReLU.",
        "Shallow networks cannot use gradient descent because the loss landscape is always non-convex.",
      ],
      correctIndex: 0,
      explanation: "The UAT is an existence proof — it guarantees a solution exists but says nothing about how large the network must be (potentially exponential) or whether gradient descent will find the weights. Deep networks achieve the same expressivity with far fewer parameters by exploiting compositional structure.",
    },
    {
      question: "A single perceptron trained on XOR fails to reach zero training error regardless of learning rate or epochs. What is the correct diagnosis?",
      options: [
        "The learning rate is too high, causing the weights to oscillate.",
        "XOR is not linearly separable, so no single hyperplane can correctly classify all four input patterns.",
        "The perceptron needs more training data to learn the XOR pattern.",
      ],
      correctIndex: 1,
      explanation: "The perceptron defines a single linear decision boundary. XOR requires two separating hyperplanes — (1,0) and (0,1) must be on one side while (0,0) and (1,1) are on the other. No single straight line achieves this, regardless of training. A hidden layer is needed to transform input space into a linearly separable representation.",
    },
    {
      question: "What does the second hidden layer in a deep vision network primarily learn relative to the first?",
      options: [
        "Duplicate copies of first-layer features for redundancy.",
        "Raw pixel statistics that the first layer missed.",
        "Higher-level combinations of first-layer features, such as textures composed from edges.",
      ],
      correctIndex: 2,
      explanation: "Each layer in a deep network operates on the output of the previous layer, composing features into progressively abstract representations. Layer 1 detects edges; Layer 2 combines edges into textures and corners; later layers build object parts and whole objects. This hierarchical composition is the core advantage of depth over width.",
    },
  ],
},

"dl-f2": {
  durationLabel: "25 min",
  outcomes: [
    "Trace a complete **forward pass** and explain how loss is computed from network outputs.",
    "Apply the **chain rule** to derive how gradients flow backward through a multi-layer network.",
    "Diagnose **vanishing and exploding gradients** by understanding sigmoid saturation and gradient magnitude accumulation.",
    "Explain why **ReLU** improves gradient flow and when **gradient clipping** is the right tool.",
  ],
  learnMarkdown: `## The Forward Pass

Training a neural network is a two-phase loop: **forward pass** then **backward pass**. During the forward pass, input data flows through each layer, producing an output prediction:

\`\`\`
z₁ = W₁x + b₁          # linear transform, layer 1
a₁ = σ(z₁)             # activation
z₂ = W₂a₁ + b₂         # linear transform, layer 2
ŷ  = σ(z₂)             # final prediction
L  = loss(ŷ, y)        # compare to ground truth
\`\`\`

The loss L — cross-entropy for classification, MSE for regression — is a scalar measuring how wrong the prediction is. Backpropagation uses this scalar to compute the gradient of L with respect to every weight in the network.

## The Chain Rule: Gradient Flow

Backpropagation is the chain rule from calculus, applied to a composition of functions. Given L = f(g(h(x))):

\`\`\`
dL/dx = (dL/df) · (df/dg) · (dg/dh) · (dh/dx)
\`\`\`

In a neural network, each layer is a function. The gradient of the loss with respect to a weight in layer k is the product of all the local gradients from the output layer back to layer k. Concretely, for a weight W in layer k of an L-layer network:

\`\`\`
∂L/∂Wₖ = (∂L/∂aₗ) · (∂aₗ/∂aₗ₋₁) · ... · (∂aₖ₊₁/∂aₖ) · (∂aₖ/∂Wₖ)
\`\`\`

Each term \`∂aₙ/∂aₙ₋₁\` includes the **derivative of the activation function** at that layer's pre-activation value.

## Vanishing Gradients: Death by a Thousand Sigmoids

The sigmoid activation saturates at both ends of its output range (0 and 1), and its derivative has a maximum of **0.25** at zero:

\`\`\`
σ(z)  = 1 / (1 + e^(-z))
σ'(z) = σ(z)(1 - σ(z))   # max value: 0.25 at z=0
\`\`\`

In a 10-layer sigmoid network, the gradient reaching layer 1 is roughly the product of 10 local derivatives — each at most 0.25:

\`\`\`
|∂L/∂W₁| ≤ (0.25)^10 ≈ 9.5 × 10⁻⁷
\`\`\`

This is the **vanishing gradient problem**: early layers receive essentially zero gradient signal and stop learning. The network's early layers — which learn fundamental low-level features — stagnate while later layers continue to update. Tanh suffers the same problem (max derivative: 1.0, but still saturates at the tails).

## Exploding Gradients

The mirror pathology: if local gradients are consistently greater than 1, the product of many such gradients grows exponentially. A 10-layer network where each Jacobian has spectral norm 2 produces gradients with magnitude 2¹⁰ = 1024×. This causes **weight updates so large that training diverges**.

Exploding gradients are most common in **recurrent neural networks** (long temporal sequences) and poorly initialized deep networks.

## ReLU: The Gradient Highway

**ReLU** (Rectified Linear Unit) was a breakthrough for deep learning in part because of its gradient properties:

\`\`\`
ReLU(z) = max(0, z)
ReLU'(z) = 1  if z > 0
           0  if z ≤ 0
\`\`\`

For positive pre-activations, the derivative is exactly **1** — the gradient passes through unchanged. The product of ten such derivatives is still 1, not 10⁻⁷. This is why deep networks became practically trainable at scale after the adoption of ReLU (Nair & Hinton, 2010; Krizhevsky et al., AlexNet 2012).

The trade-off: neurons with negative pre-activations have zero gradient — they contribute nothing to learning. If a neuron's pre-activation is negative for all training examples, it becomes a **dead ReLU**: permanently stuck, contributing zero gradient regardless of input.

## Gradient Clipping

For scenarios where exploding gradients are unavoidable (deep RNNs, large batch training), **gradient clipping** caps the gradient norm before the optimizer step:

\`\`\`python
# Clip by global norm
optimizer = tf.keras.optimizers.Adam(clipnorm=1.0)

# Manual clip
grads = [tf.clip_by_norm(g, 1.0) for g in grads]
\`\`\`

Clipping by norm (rescaling the entire gradient vector when its norm exceeds a threshold) is preferred over clipping by value (clipping each gradient independently), as it preserves gradient direction while constraining magnitude.

## Architectural Implications

Vanishing gradients led directly to modern architecture innovations:

- **Batch Normalization**: normalizes layer inputs, keeping pre-activations in a regime where gradients are healthy
- **Residual connections (ResNets)**: add an identity shortcut so gradient has a direct path from output to early layers — ∂L/∂W₁ includes a term that doesn't pass through any activations
- **Careful initialization**: Xavier/Glorot for sigmoid/tanh, He initialization for ReLU — ensures initial gradient magnitudes are well-scaled

## Interview hook (answer like a senior)

"Backpropagation is just the chain rule applied to a composition of differentiable functions — the gradient of the loss with respect to any weight is the product of all local Jacobians from the output back to that weight. The vanishing gradient problem emerges when those local Jacobians are consistently less than 1, as with sigmoid's maximum derivative of 0.25 — after 10 layers, the product is near zero. ReLU fixes this by having a derivative of exactly 1 for positive inputs, so the gradient chain doesn't shrink. When exploding gradients are the problem instead, gradient clipping by norm is the standard fix."`,

  video: null,
  videoFallbackMarkdown: `## Deep dive

### Computing Gradients by Hand (2-Layer Example)

Given a 2-layer network with MSE loss:

\`\`\`
Forward:  z₁ = W₁x,  a₁ = ReLU(z₁),  ŷ = W₂a₁,  L = (ŷ - y)²

Backward:
∂L/∂ŷ  = 2(ŷ - y)
∂L/∂W₂ = ∂L/∂ŷ · a₁ᵀ
∂L/∂a₁ = W₂ᵀ · ∂L/∂ŷ
∂L/∂z₁ = ∂L/∂a₁ ⊙ ReLU'(z₁)    # element-wise, ReLU' is 0 or 1
∂L/∂W₁ = ∂L/∂z₁ · xᵀ
\`\`\`

This shows the clean matrix form: each layer's gradient is the upstream gradient multiplied by the local Jacobian.

### Residual Connections as a Gradient Shortcut

In a ResNet block: y = F(x) + x (F is a stack of conv layers). The gradient:

\`\`\`
∂L/∂x = ∂L/∂y · (∂F/∂x + I)
\`\`\`

The identity term I means there is always a gradient path that bypasses F entirely — even if ∂F/∂x vanishes, ∂L/∂x includes a direct copy of the upstream gradient. This is why ResNets can be trained with hundreds of layers.`,

  tryGuidance: "Use the gradient flow visualizer to step through backpropagation layer by layer. Change the activation function between sigmoid and ReLU and observe how gradient magnitudes change at each layer. Try a 10-layer sigmoid network and a 10-layer ReLU network — compare the gradient norms at layer 1.",

  interviewGraph: {
    initialStageId: "f2_sigmoid_click",
    artifactDimensions: [
      { label: "Chain Rule & Backprop", recoveryStageId: "f2_recovery_chain" },
      { label: "Vanishing Gradients", recoveryStageId: "f2_recovery_vanish" },
      { label: "Architectural Fixes", recoveryStageId: "f2_recovery_fixes", passLabel: "Backprop Mastery" },
    ],
    stages: {
      f2_sigmoid_click: {
        id: "f2_sigmoid_click",
        type: "click_target",
        badge: "Stage 1 · Vanishing Gradient",
        title: "Stage 1 · Spot the gradient killer",
        prompt: "This 10-layer network trains very slowly and gradients in the first layer are near zero. Click the activation function line that is causing the vanishing gradient problem.",
        code_snippet: `model = tf.keras.Sequential([
    Dense(256, activation='sigmoid'),  # ds-target:f2_sig1
    Dense(256, activation='sigmoid'),
    Dense(256, activation='sigmoid'),
    Dense(256, activation='sigmoid'),
    Dense(256, activation='sigmoid'),
    Dense(256, activation='sigmoid'),
    Dense(256, activation='sigmoid'),
    Dense(256, activation='sigmoid'),
    Dense(256, activation='sigmoid'),
    Dense(256, activation='sigmoid'),
    Dense(1, activation='sigmoid')
])`,
        validationCopy: {
          f2_sig1: "Correct. Each sigmoid layer has a maximum gradient of 0.25. Multiplied across 10 layers, the gradient reaching layer 1 is at most (0.25)^10 ≈ 10⁻⁶ — essentially zero. Early layers stop learning entirely.",
        },
        branches: { f2_sig1: "f2_vanish_choice" },
      },
      f2_vanish_choice: {
        id: "f2_vanish_choice",
        type: "scenario_choice",
        badge: "Stage 2 · Diagnosis",
        title: "Stage 2 · Diagnose the vanishing gradient",
        prompt: "In a 10-layer sigmoid network, gradients at layer 1 are approximately 1e-10 after 100 training steps. What is the precise mathematical cause?",
        code_snippet: `# Sigmoid and its derivative:
# σ(z)  = 1 / (1 + exp(-z))
# σ'(z) = σ(z) * (1 - σ(z))
# max(σ'(z)) = 0.25  (at z = 0)

# Gradient at layer 1 via chain rule:
# ∂L/∂W₁ ∝ σ'(z₁₀) * σ'(z₉) * ... * σ'(z₁)
# worst case magnitude: (0.25)^10 ≈ 9.5e-7`,
        choices: [
          {
            id: "a",
            label: "The sigmoid derivative is at most 0.25; multiplying 10 such terms produces a near-zero gradient via the chain rule.",
            description: "Correct. This is the precise mechanism: each backward pass through a sigmoid layer multiplies the gradient by at most 0.25.",
          },
          {
            id: "b",
            label: "The learning rate is too small, causing gradients to appear near zero.",
            description: "A small learning rate scales gradient *updates*, not the gradients themselves. The gradient magnitude of 1e-10 before the learning rate is applied is the actual problem.",
          },
          {
            id: "c",
            label: "The network is overfitting, so it deliberately reduces gradients to prevent further weight updates.",
            description: "Incorrect. Overfitting is about generalization, not gradient magnitude. Vanishing gradients occur even with underfitting networks.",
          },
          {
            id: "d",
            label: "Sigmoid outputs are not zero-centered, causing zig-zagging gradient updates.",
            description: "Non-zero-centered outputs cause inefficient optimization, but that's a separate issue from vanishing gradients. The root cause here is the derivative magnitude.",
          },
        ],
        branches: { a: "f2_explode_choice", b: "f2_recovery_vanish", c: "f2_recovery_vanish", d: "f2_recovery_vanish" },
        rationale: "Vanishing gradients are a direct consequence of the chain rule applied to saturating activations. Sigmoid's derivative σ'(z) = σ(z)(1-σ(z)) achieves a maximum of only 0.25. When multiplied across L layers, this produces exponentially small gradients: (0.25)^L. For L=10, that's ~10^-6. Early layers receive essentially zero training signal.",
      },
      f2_recovery_vanish: {
        id: "f2_recovery_vanish",
        type: "scenario_choice",
        badge: "Recovery · Vanishing Gradient",
        title: "Recovery · Sigmoid saturation mechanics",
        prompt: "Why does the sigmoid activation cause vanishing gradients, while ReLU does not (for positive inputs)?",
        code_snippet: `# Sigmoid derivative: max 0.25
import numpy as np
z = np.linspace(-5, 5, 100)
sigmoid = 1 / (1 + np.exp(-z))
sigmoid_grad = sigmoid * (1 - sigmoid)  # max: 0.25

# ReLU derivative: 1 (for z > 0)
relu_grad = np.where(z > 0, 1.0, 0.0)  # max: 1.0`,
        choices: [
          {
            id: "a",
            label: "Sigmoid compresses all inputs into (0,1), making its derivative always less than 1, while ReLU has derivative exactly 1 for positive inputs.",
            description: "Correct. ReLU's gradient of 1 for positive inputs means the chain rule product doesn't shrink.",
          },
          {
            id: "b",
            label: "ReLU is faster to compute, so gradient updates arrive sooner.",
            description: "Computational speed is not the reason for better gradient flow — it's the derivative magnitude.",
          },
          {
            id: "c",
            label: "Sigmoid is used only in output layers, where gradient magnitude doesn't matter.",
            description: "Incorrect. Sigmoid was historically used in hidden layers, which is exactly where vanishing gradients cause damage.",
          },
        ],
        branches: { a: "f2_explode_choice", b: "f2_recovery_vanish", c: "f2_recovery_vanish" },
        rationale: "The derivative of sigmoid is bounded by 0.25, meaning every backward pass through a sigmoid layer multiplies the gradient by at most 0.25. ReLU's derivative is exactly 1 for positive inputs — the gradient passes through unchanged, preventing exponential decay.",
      },
      f2_explode_choice: {
        id: "f2_explode_choice",
        type: "scenario_choice",
        badge: "Stage 3 · Exploding Gradients",
        title: "Stage 3 · Fix exploding gradients",
        prompt: "During training of a deep RNN, you observe that the gradient norm reaches 1e6 after just 50 steps and loss diverges to NaN. What is the most appropriate immediate fix?",
        code_snippet: `# Gradient norm history:
# Step 10:  ||∇|| = 12.3
# Step 20:  ||∇|| = 847.2
# Step 30:  ||∇|| = 41,203
# Step 40:  ||∇|| = 1,892,441
# Step 50:  ||∇|| = 1.2e9
# Loss: NaN

optimizer = tf.keras.optimizers.Adam(learning_rate=0.001)`,
        choices: [
          {
            id: "a",
            label: "Apply gradient clipping by norm (e.g., clipnorm=1.0) to rescale large gradient vectors.",
            description: "Correct. Gradient clipping by norm rescales the entire gradient vector when its norm exceeds the threshold, preserving direction while bounding magnitude.",
          },
          {
            id: "b",
            label: "Switch from Adam to SGD — Adam amplifies gradients.",
            description: "Incorrect. Adam normalizes gradients using second-moment estimates, which actually helps with exploding gradients. Switching to SGD without clipping would make things worse.",
          },
          {
            id: "c",
            label: "Add more hidden layers to distribute the gradient across more parameters.",
            description: "Adding depth to a network with exploding gradients will worsen the problem — more layers means more multiplications of large Jacobians.",
          },
          {
            id: "d",
            label: "Reduce the batch size to stabilize gradient estimates.",
            description: "Batch size affects gradient variance (noise), not gradient magnitude from the chain rule. Clipping is the right fix here.",
          },
        ],
        branches: { a: "f2_relu_choice", b: "f2_recovery_fixes", c: "f2_recovery_fixes", d: "f2_recovery_fixes" },
        rationale: "Gradient clipping by norm is the standard fix for exploding gradients. When ||g|| > threshold, the gradient is rescaled: g = g * (threshold / ||g||). This preserves the direction of the gradient while capping its magnitude. It's particularly important for RNNs where long sequence dependencies make gradient explosion nearly inevitable without clipping.",
      },
      f2_recovery_fixes: {
        id: "f2_recovery_fixes",
        type: "scenario_choice",
        badge: "Recovery · Architectural Fixes",
        title: "Recovery · Solutions to gradient problems",
        prompt: "Which technique provides a direct gradient highway from the output layer to early layers, bypassing the vanishing gradient problem architecturally?",
        code_snippet: `# Option A: Batch Normalization
x = BatchNormalization()(x)

# Option B: Residual Connection
residual = x
x = Dense(256, activation='relu')(x)
x = x + residual  # skip connection

# Option C: Dropout
x = Dropout(0.5)(x)

# Option D: L2 Regularization
layer = Dense(256, activation='relu', kernel_regularizer='l2')`,
        choices: [
          {
            id: "a",
            label: "Residual connections — the identity shortcut provides a direct gradient path.",
            description: "Correct. In y = F(x) + x, the gradient ∂L/∂x includes an identity term that bypasses F entirely.",
          },
          {
            id: "b",
            label: "Dropout — randomly zeroing neurons prevents gradient buildup.",
            description: "Dropout is a regularization technique. It has no architectural mechanism for routing gradients around vanishing regions.",
          },
          {
            id: "c",
            label: "L2 regularization — penalizing large weights prevents gradient explosion.",
            description: "L2 regularization addresses weight magnitude, not gradient flow paths. It doesn't solve vanishing gradients.",
          },
        ],
        branches: { a: "f2_relu_choice", b: "f2_recovery_fixes", c: "f2_recovery_fixes" },
        rationale: "Residual connections (He et al., 2016) solve vanishing gradients architecturally by adding an identity shortcut: y = F(x) + x. The gradient ∂L/∂x = ∂L/∂y · (∂F/∂x + I). The identity term I ensures the gradient always has a direct path, regardless of whether F's gradient vanishes.",
      },
      f2_relu_choice: {
        id: "f2_relu_choice",
        type: "scenario_choice",
        badge: "Stage 4 · ReLU vs Sigmoid",
        title: "Stage 4 · Why ReLU helps gradient flow",
        prompt: "You replace all sigmoid activations in a 20-layer network with ReLU. Training accelerates significantly. Which property of ReLU is primarily responsible?",
        code_snippet: `# Before: sigmoid throughout
# ∂L/∂W₁ ≈ (0.25)^20 ≈ 10^-12

# After: ReLU throughout (for active neurons)
# ∂L/∂W₁ ≈ (1.0)^20 = 1.0

def relu(z): return np.maximum(0, z)
def relu_grad(z): return (z > 0).astype(float)  # exactly 0 or 1`,
        choices: [
          {
            id: "a",
            label: "ReLU's derivative is exactly 1 for positive inputs, so the gradient product across 20 layers doesn't shrink.",
            description: "Correct. The chain rule product of twenty 1s is still 1 — gradient flows without exponential decay.",
          },
          {
            id: "b",
            label: "ReLU outputs are always positive, making gradients positive and easier to optimize.",
            description: "ReLU outputs are non-negative (not always positive), but this doesn't directly explain gradient flow — it's about the derivative magnitude, not the output sign.",
          },
          {
            id: "c",
            label: "ReLU is a linear function, so the network effectively reduces to a linear model with better gradient flow.",
            description: "Incorrect. ReLU is piecewise linear — the nonlinearity comes from different neurons being active for different inputs. The network remains nonlinear.",
          },
          {
            id: "d",
            label: "ReLU avoids the vanishing gradient problem by using a larger learning rate.",
            description: "Learning rate is a hyperparameter choice, not a property of ReLU itself. The gradient flow improvement is intrinsic to ReLU's derivative being 1.",
          },
        ],
        branches: { a: "f2_terminal", b: "f2_recovery_chain", c: "f2_recovery_chain", d: "f2_recovery_chain" },
        rationale: "ReLU's key property for gradient flow is that its derivative equals 1 for all positive inputs. In a 20-layer network using ReLU, the chain rule product through active neurons is (1)^20 = 1 — no shrinkage. Compare to sigmoid's (0.25)^20 ≈ 10^-12. Dead ReLU neurons (derivative 0) are the trade-off, addressed by careful initialization and learning rate choice.",
      },
      f2_recovery_chain: {
        id: "f2_recovery_chain",
        type: "scenario_choice",
        badge: "Recovery · Chain Rule",
        title: "Recovery · The chain rule in backpropagation",
        prompt: "In a 3-layer network, what does the chain rule say about the gradient of the loss with respect to weights in Layer 1?",
        code_snippet: `# 3-layer network:
# x -> [Layer1] -> a1 -> [Layer2] -> a2 -> [Layer3] -> ŷ -> L

# Chain rule expansion:
# ∂L/∂W₁ = ∂L/∂ŷ · ∂ŷ/∂a₂ · ∂a₂/∂a₁ · ∂a₁/∂W₁
#          (output)  (L3 grad)  (L2 grad)  (L1 local)`,
        choices: [
          {
            id: "a",
            label: "It is the product of all local gradients from the output layer back to Layer 1.",
            description: "Correct. Each term in the chain rule product is the local gradient of one layer's output with respect to its input.",
          },
          {
            id: "b",
            label: "It is computed only from the loss and Layer 1's weights, ignoring intermediate layers.",
            description: "Incorrect. Intermediate layers are part of the composition — their gradients appear as factors in the chain rule product.",
          },
          {
            id: "c",
            label: "It is the average of gradients across all layers.",
            description: "Incorrect. The chain rule involves multiplication, not averaging, of local gradients.",
          },
        ],
        branches: { a: "f2_terminal", b: "f2_recovery_chain", c: "f2_recovery_chain" },
        rationale: "Backpropagation applies the chain rule: ∂L/∂W₁ = ∂L/∂ŷ · ∂ŷ/∂a₂ · ∂a₂/∂a₁ · ∂a₁/∂W₁. Each factor is a local Jacobian at one layer. This product structure is why deep networks can have vanishing gradients — if any factor is small, the product shrinks.",
      },
      f2_terminal: {
        id: "f2_terminal",
        type: "scenario_choice",
        badge: "Terminal · Synthesis",
        title: "Revision complete · Backprop mastered",
        terminal: true,
        prompt: "A 20-layer network with sigmoid activations has zero gradient updates in the first 5 layers after 1,000 training steps. Name the problem, its sigmoid-specific cause, and two architectural solutions.",
        code_snippet: `# Diagnosis log:
# Layer 20 gradient norm: 0.842
# Layer 15 gradient norm: 0.003
# Layer 10 gradient norm: 1.1e-6
# Layer 5  gradient norm: 4.3e-11  # ← effectively zero
# Layer 1  gradient norm: 1.8e-14  # ← zero

# Early layers have learned nothing after 1000 steps.`,
        choices: [
          {
            id: "a",
            label: "Vanishing gradients; sigmoid max derivative 0.25 multiplied 20× ≈ 0; fix with ReLU activations and residual connections.",
            description: "Complete and precise. This covers the problem name, the exact mechanism, and two valid architectural solutions.",
          },
          {
            id: "b",
            label: "Overfitting; too many parameters; fix with dropout and L2 regularization.",
            description: "The gradient norm pattern (decreasing toward early layers, not all-large) is the signature of vanishing gradients, not overfitting. Overfitting would show high training accuracy with high validation loss, not zero gradient updates.",
          },
          {
            id: "c",
            label: "Exploding gradients; weights are too large; fix with gradient clipping and lower learning rate.",
            description: "Exploding gradients produce very large gradient norms, not near-zero ones. The pattern here (norms shrinking toward early layers) is the signature of vanishing, not exploding, gradients.",
          },
        ],
        branches: { a: "f2_terminal", b: "f2_terminal", c: "f2_terminal" },
        rationale: "This is the classic vanishing gradient pattern: gradient norm decays exponentially toward early layers. The cause is sigmoid's derivative being bounded by 0.25 — the chain rule product (0.25)^20 ≈ 10^-12. Solutions: (1) Replace sigmoid with ReLU in hidden layers — derivative of 1 prevents decay. (2) Add residual connections — identity shortcuts provide direct gradient paths that bypass activation layers. (3) Batch normalization can also help by keeping pre-activations in the healthy gradient regime.",
      },
    },
  },

  knowledgeCheck: [
    {
      question: "In a 10-layer network using sigmoid activations, why do gradients at layer 1 become negligibly small?",
      options: [
        "The learning rate is scaled down automatically for early layers by the optimizer.",
        "Each sigmoid backward pass multiplies the gradient by at most 0.25; across 10 layers, (0.25)^10 ≈ 10^-6.",
        "Early layers have fewer parameters, so they receive proportionally less gradient.",
      ],
      correctIndex: 1,
      explanation: "The chain rule requires multiplying local gradients across all layers. Sigmoid's derivative σ'(z) = σ(z)(1-σ(z)) has a maximum of 0.25. Multiplied across 10 layers: (0.25)^10 ≈ 9.5×10^-7. This exponential decay means early layers receive essentially no gradient signal and stop learning — this is the vanishing gradient problem.",
    },
    {
      question: "Why does ReLU improve gradient flow compared to sigmoid in deep networks?",
      options: [
        "ReLU outputs larger values, making the network more expressive.",
        "For positive pre-activations, ReLU's derivative is exactly 1, so the gradient product across layers does not decay exponentially.",
        "ReLU is differentiable everywhere, making backpropagation more numerically stable.",
      ],
      correctIndex: 1,
      explanation: "ReLU'(z) = 1 for z > 0. In a 20-layer ReLU network with active neurons, the chain rule product is (1)^20 = 1 — no exponential decay. Compare to sigmoid's (0.25)^20 ≈ 10^-12. Note: ReLU is not differentiable at zero (but this is handled by convention) and can produce dead neurons, but the gradient flow benefit for active neurons is decisive.",
    },
    {
      question: "Gradient norm explodes to 10^8 during training of a deep RNN. What is the correct fix?",
      options: [
        "Gradient clipping by norm — rescale the gradient vector when its norm exceeds a threshold.",
        "Increase the learning rate to push past the region of large gradients faster.",
        "Add more layers to distribute the large gradients across more parameters.",
      ],
      correctIndex: 0,
      explanation: "Gradient clipping by norm rescales the gradient vector g to g * (threshold / ||g||) whenever ||g|| exceeds the threshold. This preserves the gradient direction while bounding magnitude, stabilizing training. Increasing the learning rate would amplify the already-explosive updates. Adding layers would introduce more large Jacobian multiplications, worsening explosion.",
    },
  ],
},

"dl-f3": {
  durationLabel: "15 min",
  outcomes: [
    "Explain why neural networks require **nonlinear activation functions** and what happens without them.",
    "Compare **sigmoid, tanh, and ReLU** on saturation, gradient flow, and practical use cases.",
    "Diagnose and fix **dead ReLU neurons** caused by initialization or learning rate issues.",
    "Select the correct **output layer activation** for binary classification, multiclass, and regression tasks.",
  ],
  learnMarkdown: `## Why Activations Must Be Nonlinear

Without an activation function, a neural network collapses into a single linear transformation regardless of depth:

\`\`\`
y = W₃(W₂(W₁x)) = (W₃W₂W₁)x = Wx
\`\`\`

Three linear layers are equivalent to one. You can stack as many as you like — the result is always a linear function. **Nonlinear activations are what make depth meaningful.** They allow layers to represent and compose complex, nonlinear mappings of the input.

## Sigmoid: The Classic, With Baggage

\`\`\`
σ(z) = 1 / (1 + e^(-z))     # output ∈ (0, 1)
σ'(z) = σ(z)(1 - σ(z))      # max: 0.25 at z=0
\`\`\`

**Strengths**: Smooth, differentiable, outputs interpretable as probabilities.

**Problems**:
1. **Saturation**: For |z| > 4, σ(z) ≈ 0 or 1, and σ'(z) ≈ 0. Gradients are killed.
2. **Not zero-centered**: Outputs are always in (0,1), meaning gradients are always the same sign — causing inefficient zig-zagging updates.
3. **Computationally expensive**: Requires exponentiation.

**When to use**: Output layer for binary classification only.

## Tanh: Better, Still Saturates

\`\`\`
tanh(z) = (e^z - e^(-z)) / (e^z + e^(-z))    # output ∈ (-1, 1)
tanh'(z) = 1 - tanh²(z)                        # max: 1.0 at z=0
\`\`\`

**Strengths over sigmoid**: Zero-centered outputs (mean near 0) — gradients can be positive or negative, enabling more efficient weight updates. Max derivative of 1 is better than sigmoid's 0.25.

**Same core problem**: Still saturates at the tails. For |z| > 3, tanh'(z) ≈ 0. In deep networks with many layers, vanishing gradients still occur.

**When to use**: Hidden layers where zero-centering matters (e.g., RNNs), output layers for regression to (-1, 1).

## ReLU: The Default Choice

\`\`\`
ReLU(z) = max(0, z)
ReLU'(z) = 1 if z > 0, else 0
\`\`\`

**Strengths**:
- No saturation for positive inputs — gradient is exactly 1
- Computationally trivial (threshold operation)
- Sparse activations (many neurons output 0) — efficient representations

**The Dead Neuron Problem**: If a neuron's pre-activation is negative for all training examples, its gradient is always 0 — it never updates. Causes:
- **High learning rate**: A large weight update drives weights to produce permanently negative pre-activations
- **Poor initialization**: Bias initialized too negative, pre-activations start negative
- **Monitoring**: Check the fraction of activations that are zero per layer

**When to use**: Default for hidden layers in feedforward and convolutional networks.

## Leaky ReLU, ELU, and GELU

**Leaky ReLU** fixes dead neurons by allowing a small gradient for negative inputs:

\`\`\`
LeakyReLU(z) = z if z > 0, else αz    # α typically 0.01
\`\`\`

**ELU (Exponential Linear Unit)** produces smoother outputs for negative inputs:

\`\`\`
ELU(z) = z if z > 0, else α(e^z - 1)
\`\`\`

**GELU (Gaussian Error Linear Unit)** is the dominant activation in Transformers (BERT, GPT):

\`\`\`
GELU(z) ≈ z · Φ(z)    # Φ is the standard normal CDF
\`\`\`

GELU smoothly gates inputs — it stochastically multiplies an input by 0 or 1 depending on the magnitude. This probabilistic interpretation aligns well with the stochastic nature of dropout and the attention mechanisms in Transformers.

## Output Layer Activations: A Hard Rule

The output activation is determined by the task, not by gradient flow considerations:

\`\`\`
# Binary classification  → sigmoid (output: probability in (0,1))
Dense(1, activation='sigmoid')

# Multi-class (K classes) → softmax (outputs sum to 1)
Dense(K, activation='softmax')

# Regression             → linear / no activation
Dense(1)

# Multi-label            → sigmoid per output (independent probabilities)
Dense(K, activation='sigmoid')
\`\`\`

Using ReLU on an output layer for binary classification is a critical error: ReLU outputs are unbounded and non-probabilistic. Binary cross-entropy loss with ReLU output is numerically undefined when predictions are > 1.

## Interview hook (answer like a senior)

"Activations need to be nonlinear because linear layers compose into a single linear transformation — depth without nonlinearity is meaningless. For hidden layers, ReLU is the practical default: its derivative of 1 for positive inputs avoids vanishing gradients, and it's computationally cheap. The tradeoff is dead neurons from negative pre-activations, which Leaky ReLU and careful initialization address. For Transformers, GELU's smooth probabilistic gating is empirically superior. For output layers, the activation is determined by the task: sigmoid for binary classification, softmax for multiclass, linear for regression — getting this wrong is a common interview pitfall."`,

  video: null,
  videoFallbackMarkdown: `## Deep dive

### Why GELU Works So Well in Transformers

GELU(z) = z · Φ(z) where Φ is the Gaussian CDF. Intuitively, GELU stochastically decides to pass or gate an input based on how large it is relative to other inputs. This is conceptually related to dropout (stochastic zeroing) but in a smooth, differentiable form.

In practice, GELU provides:
1. **Smoother gradient landscape** than ReLU — no hard kink at zero
2. **Non-zero gradient for all inputs** — no dead neurons
3. **Probabilistic regularization** built into the activation

BERT, GPT-2, GPT-3, and virtually all modern large language models use GELU in their feedforward layers.

### Softmax: Multinomial Probability Distribution

\`\`\`
softmax(z)ₖ = exp(zₖ) / Σⱼ exp(zⱼ)
\`\`\`

Softmax guarantees: (1) all outputs > 0, (2) outputs sum to 1. Combined with cross-entropy loss, it produces the correct gradient for multi-class classification. The numerically stable implementation shifts by max(z) before exponentiating to prevent overflow.

### Choosing Activations: Quick Decision Table

| Hidden layers | → | ReLU (default), Leaky ReLU if dead neurons are a problem, GELU for Transformers |
| Binary output | → | Sigmoid |
| Multi-class output | → | Softmax |
| Regression output | → | Linear (none) |
| Multi-label output | → | Sigmoid per unit |`,

  tryGuidance: "Use the activation function explorer to plot σ, tanh, and ReLU alongside their derivatives. Then build a small classification network and switch output activations — observe the loss curve behavior when using ReLU instead of sigmoid on the output layer. Use the dead neuron monitor to watch what fraction of ReLU neurons output zero as you vary the learning rate.",

  interviewGraph: {
    initialStageId: "f3_output_click",
    artifactDimensions: [
      { label: "Output Activation Selection", recoveryStageId: "f3_recovery_output" },
      { label: "Dead ReLU Diagnosis", recoveryStageId: "f3_recovery_dead" },
      { label: "Activation Tradeoffs", recoveryStageId: "f3_recovery_tradeoffs", passLabel: "Activation Mastery" },
    ],
    stages: {
      f3_output_click: {
        id: "f3_output_click",
        type: "click_target",
        badge: "Stage 1 · Output Activation",
        title: "Stage 1 · Spot the wrong output activation",
        prompt: "This binary classification model fails to converge — predictions are always outside [0,1] and binary cross-entropy loss returns NaN. Click the line with the incorrect output activation.",
        code_snippet: `model = tf.keras.Sequential([
    Dense(128, activation='relu'),
    Dense(64, activation='relu'),
    Dense(32, activation='relu'),
    Dense(1, activation='relu')   # ds-target:f3_wrong_output
])

model.compile(
    optimizer='adam',
    loss='binary_crossentropy',
    metrics=['accuracy']
)`,
        validationCopy: {
          f3_wrong_output: "Correct. ReLU on a binary classification output is a critical error. ReLU outputs are unbounded non-negative values — not probabilities. Binary cross-entropy is undefined (log of values > 1 is negative, log of values = 0 is -infinity). The output activation should be sigmoid, which maps to (0, 1).",
        },
        branches: { f3_wrong_output: "f3_dead_choice" },
      },
      f3_dead_choice: {
        id: "f3_dead_choice",
        type: "scenario_choice",
        badge: "Stage 2 · Dead ReLU",
        title: "Stage 2 · Diagnose dead ReLU neurons",
        prompt: "After 500 training steps, 30% of neurons in a hidden ReLU layer output 0 for every training example and never activate. What is the most likely cause?",
        code_snippet: `# Monitoring hook output:
# Layer 2 activation sparsity: 30.4% dead (always 0)
# Layer 2 weight norms: large (some > 10.0)
# Training loss: plateaued at 0.68 (near random chance)

model = Sequential([
    Dense(512, activation='relu'),
    Dense(512, activation='relu'),   # ← 30% dead here
    Dense(1, activation='sigmoid')
])
optimizer = Adam(learning_rate=0.1)  # note: high LR`,
        choices: [
          {
            id: "a",
            label: "The learning rate is too high — large weight updates drove pre-activations permanently negative.",
            description: "Correct. A high learning rate causes large weight updates that can permanently push weights into a regime where all inputs produce negative pre-activations for a neuron, giving it zero gradient forever.",
          },
          {
            id: "b",
            label: "The network has too many layers, causing gradient interference between neurons.",
            description: "Layer count doesn't cause dead neurons directly. Dead neurons are caused by negative pre-activations across all inputs, typically from initialization or large updates.",
          },
          {
            id: "c",
            label: "ReLU is inherently unstable with more than 512 neurons per layer.",
            description: "Incorrect. There is no inherent width limit for ReLU stability. The issue is learning rate and initialization, not layer width.",
          },
          {
            id: "d",
            label: "The dataset has too many zero values, causing neurons to output zero to match the data.",
            description: "Neurons don't output zero to 'match' the data — dead neurons arise from the gradient of ReLU being zero when pre-activations are negative.",
          },
        ],
        branches: { a: "f3_softmax_choice", b: "f3_recovery_dead", c: "f3_recovery_dead", d: "f3_recovery_dead" },
        rationale: "Dead ReLU neurons occur when a neuron's pre-activation (z = Wx + b) is negative for every training example. ReLU'(z) = 0 for z ≤ 0, so the neuron receives zero gradient and never updates. Common causes: (1) high learning rate causing large weight updates that lock weights into producing negative z, (2) negative bias initialization. Fixes: lower learning rate, He initialization, Leaky ReLU, or ELU.",
      },
      f3_recovery_dead: {
        id: "f3_recovery_dead",
        type: "scenario_choice",
        badge: "Recovery · Dead ReLU",
        title: "Recovery · Preventing and fixing dead neurons",
        prompt: "You notice 40% of your ReLU neurons are dead. Which combination of fixes directly addresses dead ReLU neurons?",
        code_snippet: `# Current config (problematic):
model = Sequential([Dense(256, activation='relu') for _ in range(5)])
optimizer = SGD(learning_rate=0.5)  # very high LR
initializer = tf.initializers.Zeros()  # zero init

# Proposed fixes — which combination works?`,
        choices: [
          {
            id: "a",
            label: "Lower the learning rate AND switch to He initialization (or use Leaky ReLU).",
            description: "Correct. Lower LR prevents large updates from creating permanent negative pre-activations. He initialization ensures initial pre-activations have healthy variance for ReLU.",
          },
          {
            id: "b",
            label: "Add batch normalization before the output layer only.",
            description: "Batch normalization before the output layer doesn't help neurons in middle layers. You'd need it before ReLU layers to normalize pre-activations.",
          },
          {
            id: "c",
            label: "Increase the number of neurons per layer to compensate for dead ones.",
            description: "Adding neurons adds capacity but doesn't fix the underlying problem — the new neurons will die too under the same conditions.",
          },
        ],
        branches: { a: "f3_softmax_choice", b: "f3_recovery_dead", c: "f3_recovery_dead" },
        rationale: "The two most effective fixes for dead ReLUs: (1) Reduce learning rate — prevents large weight updates from driving pre-activations to permanent negatives. (2) Use He initialization — designed for ReLU, ensures initial weights produce pre-activations with variance ≈ 1. Alternatively, switch to Leaky ReLU or ELU, which have non-zero gradients for negative inputs.",
      },
      f3_softmax_choice: {
        id: "f3_softmax_choice",
        type: "scenario_choice",
        badge: "Stage 3 · Softmax",
        title: "Stage 3 · Multi-class output activation",
        prompt: "You're building a model to classify images into 10 categories (digits 0-9). What output layer configuration is correct?",
        code_snippet: `# Option A
Dense(10, activation='softmax')

# Option B
Dense(10, activation='sigmoid')

# Option C
Dense(10, activation='relu')

# Option D
Dense(1, activation='sigmoid')`,
        choices: [
          {
            id: "a",
            label: "Option A: Dense(10, activation='softmax') — outputs a probability distribution over 10 classes.",
            description: "Correct. Softmax produces 10 outputs that are all positive and sum to 1 — a valid probability distribution over mutually exclusive classes.",
          },
          {
            id: "b",
            label: "Option B: Dense(10, activation='sigmoid') — one sigmoid output per class.",
            description: "Sigmoid on each output independently treats classes as non-exclusive (multi-label). For single-label 10-class classification, the outputs won't sum to 1 and the model won't learn a proper distribution.",
          },
          {
            id: "c",
            label: "Option C: Dense(10, activation='relu') — positive activations for each class.",
            description: "ReLU outputs are unbounded and don't sum to 1. This cannot produce class probabilities.",
          },
          {
            id: "d",
            label: "Option D: Dense(1, activation='sigmoid') — single output for 10 classes.",
            description: "A single sigmoid output represents binary classification. For 10 classes you need 10 outputs.",
          },
        ],
        branches: { a: "f3_gelu_choice", b: "f3_recovery_output", c: "f3_recovery_output", d: "f3_recovery_output" },
        rationale: "Softmax is the canonical output activation for multi-class classification: softmax(z)ₖ = exp(zₖ)/Σexp(zⱼ). It guarantees all outputs are positive and sum to 1 — a proper probability distribution. Use categorical cross-entropy loss with softmax. Sigmoid is for binary or multi-label (independent classes) outputs.",
      },
      f3_recovery_output: {
        id: "f3_recovery_output",
        type: "scenario_choice",
        badge: "Recovery · Output Activation",
        title: "Recovery · Matching activation to task",
        prompt: "Match the task to its correct output activation: regression predicting house prices (continuous), binary spam detection, 5-class sentiment classification.",
        code_snippet: `# Task 1: House price prediction
# Target: $450,000 (unbounded positive number)

# Task 2: Spam detection
# Target: 0 (not spam) or 1 (spam)

# Task 3: Sentiment (very negative, negative, neutral, positive, very positive)
# Target: one of 5 mutually exclusive classes`,
        choices: [
          {
            id: "a",
            label: "Regression: linear. Binary: sigmoid. 5-class: softmax.",
            description: "Correct. Linear for unbounded regression, sigmoid for binary probability, softmax for mutually exclusive multiclass.",
          },
          {
            id: "b",
            label: "Regression: ReLU (prices are positive). Binary: sigmoid. 5-class: softmax.",
            description: "House prices are positive, but ReLU on a regression output prevents predicting via negative pre-activations and introduces a kink. Linear output is standard — the loss function handles the scale.",
          },
          {
            id: "c",
            label: "Regression: sigmoid (scale to 0-1). Binary: softmax. 5-class: sigmoid.",
            description: "Sigmoid for regression would bound predictions in (0,1), requiring manual rescaling. Softmax for binary is technically valid but adds unnecessary complexity. Sigmoid per unit for 5-class treats classes as independent.",
          },
        ],
        branches: { a: "f3_gelu_choice", b: "f3_recovery_output", c: "f3_recovery_output" },
        rationale: "Output activations are task-specific: (1) Regression: linear (no activation) — let the loss handle the range. (2) Binary classification: sigmoid — outputs probability in (0,1). (3) Multi-class (mutually exclusive): softmax — probability distribution summing to 1. (4) Multi-label: sigmoid per unit — independent probabilities.",
      },
      f3_gelu_choice: {
        id: "f3_gelu_choice",
        type: "scenario_choice",
        badge: "Stage 4 · GELU vs ReLU",
        title: "Stage 4 · When GELU beats ReLU",
        prompt: "You're implementing the feedforward layers of a Transformer (like BERT or GPT). Should you use ReLU or GELU, and why?",
        code_snippet: `# Transformer feedforward block:
class FeedForward(tf.keras.layers.Layer):
    def __init__(self, d_model, d_ff):
        super().__init__()
        self.dense1 = Dense(d_ff, activation=???)  # ReLU or GELU?
        self.dense2 = Dense(d_model)

# BERT uses: activation='gelu'
# GPT uses:  activation='gelu'
# Original Transformer (Vaswani 2017): activation='relu'`,
        choices: [
          {
            id: "a",
            label: "GELU — smoother gradient landscape, no dead neurons, and the probabilistic gating aligns with Transformer attention.",
            description: "Correct. GELU = z·Φ(z) provides smooth gradients, non-zero derivatives everywhere, and stochastic gating that complements the attention mechanism's learned weighting.",
          },
          {
            id: "b",
            label: "ReLU — simpler and just as effective; the original Transformer used ReLU.",
            description: "The original Transformer did use ReLU, but BERT, GPT, and all modern large language models switched to GELU. Empirically GELU consistently outperforms ReLU on language tasks.",
          },
          {
            id: "c",
            label: "Neither — Transformers use softmax activations in feedforward layers.",
            description: "Softmax is used in the attention mechanism for weighting attention scores, not in the feedforward layers. Feedforward layers use ReLU or GELU.",
          },
          {
            id: "d",
            label: "Sigmoid — it was the original deep learning activation and is most reliable.",
            description: "Sigmoid is avoided in hidden layers of deep networks due to vanishing gradients. It's appropriate only at output layers for binary classification.",
          },
        ],
        branches: { a: "f3_terminal", b: "f3_recovery_tradeoffs", c: "f3_recovery_tradeoffs", d: "f3_recovery_tradeoffs" },
        rationale: "GELU (Gaussian Error Linear Unit) is the standard for Transformers. Unlike ReLU's hard gate (0 or 1), GELU's soft gate z·Φ(z) provides: (1) smooth gradients at all points, (2) non-zero gradient for negative inputs (no dead neurons), (3) a probabilistic interpretation — larger inputs pass through more reliably. BERT, GPT-2/3/4, and virtually all modern LLMs use GELU in feedforward blocks.",
      },
      f3_recovery_tradeoffs: {
        id: "f3_recovery_tradeoffs",
        type: "scenario_choice",
        badge: "Recovery · Activation Tradeoffs",
        title: "Recovery · Comparing activation functions",
        prompt: "A colleague argues: 'We should always use tanh instead of ReLU in hidden layers because tanh is zero-centered and bounded.' What is the best counter-argument?",
        code_snippet: `# tanh properties:
# Range: (-1, 1)  — zero-centered ✓
# Saturates: yes, for |z| > 3  ✗
# Max derivative: 1.0

# ReLU properties:
# Range: [0, ∞)  — not zero-centered ✗
# Saturates: no (for z > 0)  ✓
# Derivative: 1 for z > 0, 0 for z ≤ 0`,
        choices: [
          {
            id: "a",
            label: "Tanh still saturates at the tails, causing vanishing gradients in deep networks — ReLU avoids saturation for positive inputs.",
            description: "Correct. Zero-centering is a real advantage of tanh, but tail saturation causes vanishing gradients in deep networks — the same fundamental problem as sigmoid.",
          },
          {
            id: "b",
            label: "ReLU is always preferable because it's computationally simpler.",
            description: "Computational simplicity is a minor practical advantage, not the core argument. The main issue with tanh is gradient vanishing from saturation.",
          },
          {
            id: "c",
            label: "Tanh and ReLU are equivalent — the choice doesn't affect training.",
            description: "Incorrect. In deep networks, the saturation behavior of tanh versus the non-saturation of ReLU for positive inputs produces significantly different gradient flow characteristics.",
          },
        ],
        branches: { a: "f3_terminal", b: "f3_recovery_tradeoffs", c: "f3_recovery_tradeoffs" },
        rationale: "Tanh is better than sigmoid (zero-centered, max derivative of 1 vs 0.25), but still saturates for |z| > 3. In a 20-layer tanh network, gradients can still vanish. ReLU's non-saturation for positive inputs is the decisive advantage for deep networks. Tanh remains useful in RNNs and in contexts where zero-centered outputs matter.",
      },
      f3_terminal: {
        id: "f3_terminal",
        type: "scenario_choice",
        badge: "Terminal · Synthesis",
        title: "Revision complete · Activation mastery",
        terminal: true,
        prompt: "You're debugging a network where 40% of hidden layer neurons never activate. Walk me through 3 causes and their corresponding fixes.",
        code_snippet: `# Symptoms:
# - 40% of ReLU neurons output 0 for all inputs
# - These neurons' weights never change
# - Training loss has plateaued early
# - Effective network capacity is 60% of designed capacity

model = Sequential([
    Dense(512, activation='relu'),
    Dense(512, activation='relu'),  # 40% dead here
    Dense(10, activation='softmax')
])`,
        choices: [
          {
            id: "a",
            label: "Causes: high LR (fix: lower LR), zero/negative bias init (fix: He init), no gradient for negative z (fix: Leaky ReLU or ELU).",
            description: "Complete answer covering all three cause-fix pairs for dead ReLU neurons.",
          },
          {
            id: "b",
            label: "Cause: network is too wide. Fix: reduce layer width to 256 neurons.",
            description: "Width doesn't cause dead neurons. The problem is negative pre-activations causing zero gradients — reducing width would just give you fewer total neurons without fixing the underlying issue.",
          },
          {
            id: "c",
            label: "Cause: the ReLU activation itself. Fix: switch to sigmoid throughout.",
            description: "Switching to sigmoid introduces vanishing gradients — a different but equally serious problem. The issue isn't ReLU itself but the conditions causing pre-activations to be permanently negative.",
          },
        ],
        branches: { a: "f3_terminal", b: "f3_terminal", c: "f3_terminal" },
        rationale: "Dead ReLU neurons have 3 main causes and fixes: (1) High learning rate → large weight updates lock pre-activations negative → lower the learning rate or use learning rate warmup. (2) Poor initialization (zeros or large negative biases) → pre-activations negative from the start → use He initialization (variance = 2/fan_in). (3) The ReLU function itself is zero for all negative inputs → switch to Leaky ReLU (αz for z<0, α≈0.01), ELU, or add batch normalization before ReLU to keep pre-activations well-distributed.",
      },
    },
  },

  knowledgeCheck: [
    {
      question: "A binary classification model outputs values of 1.7 and 2.4, and binary cross-entropy loss returns NaN. What is the likely cause?",
      options: [
        "The model is using ReLU on the output layer instead of sigmoid, producing unbounded outputs outside [0,1].",
        "The learning rate is too high, causing numerical instability in the loss computation.",
        "Binary cross-entropy requires normalized input features — the inputs weren't scaled.",
      ],
      correctIndex: 0,
      explanation: "Binary cross-entropy expects predictions in (0,1) to compute log(p) and log(1-p). ReLU on the output layer produces unbounded non-negative values — log(1.7) is negative and defined, but loss semantics break down, and values > 1 mean log(1-p) involves log of a negative number. The fix is to replace ReLU with sigmoid on the output layer.",
    },
    {
      question: "After training for 200 steps, 35% of neurons in a hidden ReLU layer output zero for every input and have stopped updating. What is the most direct fix?",
      options: [
        "Add more training data so the neurons encounter positive pre-activations.",
        "Reduce the learning rate and switch to He initialization to prevent pre-activations from becoming permanently negative.",
        "Replace the ReLU layers with sigmoid layers to ensure all neurons always have non-zero gradients.",
      ],
      correctIndex: 1,
      explanation: "Dead ReLU neurons occur when pre-activations are negative for all inputs, giving zero gradient. The causes are typically high learning rate (causing large updates that drive weights into negative pre-activation regimes) and poor initialization. Fixes: lower learning rate, He initialization (variance 2/fan_in, designed for ReLU), or switch to Leaky ReLU. Replacing with sigmoid introduces vanishing gradients — a different problem.",
    },
    {
      question: "BERT and GPT use GELU instead of ReLU in their feedforward layers. What is the primary reason?",
      options: [
        "GELU is faster to compute than ReLU on GPU hardware.",
        "GELU provides smooth gradients and non-zero derivatives for all inputs, with a probabilistic gating interpretation that empirically improves Transformer training.",
        "ReLU is not differentiable, making it incompatible with Transformer attention mechanisms.",
      ],
      correctIndex: 1,
      explanation: "GELU = z·Φ(z) is smoother than ReLU (no hard kink at zero), has non-zero gradient for negative inputs (no dead neurons), and has a stochastic interpretation where larger inputs are more reliably passed through. Empirically, GELU consistently outperforms ReLU on language modeling benchmarks. ReLU is fully differentiable almost everywhere (undefined only at z=0 by convention) — its non-differentiability is not the issue.",
    },
  ],
},

"dl-f4": {
  durationLabel: "22 min",
  outcomes: [
    "Explain the difference between vanilla SGD, mini-batch SGD, and adaptive optimizers like Adam",
    "Describe how momentum and Adam's moving averages shape the optimization trajectory",
    "Identify when to prefer SGD+momentum over Adam (and vice versa)",
    "Apply learning rate schedules (warmup, cosine decay) and explain why they matter",
  ],
  learnMarkdown: `## The Loss Landscape

Training a neural network is an optimization problem: find the weight values that minimize a loss function over your data. Visualize the loss as a hilly terrain — your goal is to roll a ball to the lowest valley. The challenge is that this landscape is high-dimensional, non-convex, and riddled with saddle points, sharp ravines, and flat plateaus.

**Gradient descent** moves in the direction of steepest descent — the negative gradient of the loss with respect to the weights. The fundamental update rule is:

\`\`\`
w ← w − η · ∇L(w)
\`\`\`

where η (eta) is the **learning rate** — the single most important hyperparameter you will tune.

## Vanilla SGD and Mini-Batch Gradient Descent

**Pure (stochastic) gradient descent** computes the gradient on a single sample at a time. It is very noisy — each step points in a slightly wrong direction — but that noise can help escape shallow local minima. The problem: with 1M rows, you make 1M weight updates per epoch, each requiring a forward and backward pass. This is catastrophically slow on modern hardware, which is built for parallelism.

**Batch gradient descent** computes the gradient over the entire dataset before taking a step. Stable, but for large datasets you wait forever between updates and the memory cost is prohibitive.

**Mini-batch gradient descent** splits the data into small batches (32–512 samples). Each batch gives a noisy-but-useful gradient estimate, and modern GPUs can process a whole batch in parallel. This is what everyone means when they say "SGD" in practice. Typical batch sizes: 32–256 for vision, up to 2048+ with gradient accumulation for language models.

## Momentum

Raw mini-batch SGD can oscillate in narrow ravines — bouncing back and forth across the valley floor while barely advancing toward the minimum. **Momentum** fixes this by accumulating a velocity vector:

\`\`\`
v ← β·v + ∇L(w)
w ← w − η·v
\`\`\`

With β ≈ 0.9, the optimizer "remembers" the last ~10 gradients. Consistent directions accumulate; oscillating directions cancel. The ball rolls faster along the ravine floor and slower across it. Momentum also helps escape shallow local minima and saddle points.

## Adam: Adaptive Learning Rates

**Adam** (Adaptive Moment Estimation) extends momentum with per-parameter learning rate adaptation. It tracks two exponential moving averages of the gradient:

\`\`\`
m ← β₁·m + (1−β₁)·g        # first moment (mean)
v ← β₂·v + (1−β₂)·g²       # second moment (variance)
ŵ ← w − η · m̂ / (√v̂ + ε)   # bias-corrected update
\`\`\`

Defaults: β₁=0.9, β₂=0.999, ε=1e-8, η=0.001. Parameters with large, consistent gradients get smaller effective learning rates; rare, small-gradient parameters get larger updates. This makes Adam nearly **hyperparameter-agnostic in the early stages** — the default lr=0.001 works out of the box for most tasks.

**AdamW** decouples weight decay from the gradient update (applying it directly to weights rather than the gradient), which is the standard choice for transformer training.

## Learning Rate Schedules

Even with Adam, a fixed learning rate is rarely optimal. Common schedules:

- **Warmup**: start with a tiny lr (e.g., 1e-6) and ramp linearly to the target over the first few hundred steps. Prevents early, large gradient steps from destabilizing freshly initialized heads.
- **Cosine decay**: after warmup, decay lr following a cosine curve to near-zero. Smooth, widely used for language models and vision transformers.
- **Step decay**: halve the lr every N epochs. Simple and effective for ResNets.

## Adam vs SGD+Momentum: When to Choose Which

| Situation | Recommendation |
|---|---|
| Default starting point | Adam (AdamW) |
| Fine-tuning a pretrained model | Adam with low lr (1e-5 to 5e-5) + warmup |
| Training ResNets from scratch | SGD + momentum (0.9) + cosine schedule |
| Transformers / NLP | AdamW + warmup + cosine decay |

Research has shown that **SGD+momentum often finds flatter minima** with better generalization on vision benchmarks, but it requires more careful lr tuning. Adam gets you to a good solution faster with less tuning.

## Interview Hook (answer like a senior)

*"Adam is my default — it's robust and converges quickly. But for large vision models trained from scratch, I'll often switch to SGD with momentum and a cosine schedule, because the literature consistently shows better generalization. The most important thing I tune is the learning rate: too high and the loss diverges or oscillates; too low and you waste compute or get stuck. I always pair any schedule with a warmup phase to stabilize early training, especially when fine-tuning pretrained weights."*
`,
  video: null,
  videoFallbackMarkdown: `## Deep Dive: Adam Internals

Adam's bias correction terms (1−β₁ᵗ) and (1−β₂ᵗ) compensate for the fact that m and v are initialized at zero. At step t=1 with β₁=0.9, the raw first moment m is 10× smaller than the true gradient — bias correction rescales it. After ~50 steps the correction becomes negligible.

**Gradient clipping** is orthogonal to optimizer choice: clip the global gradient norm to (e.g.) 1.0 before any optimizer step. This prevents exploding gradients from blowing up training, especially in RNNs and transformers.

**Learning rate finder**: a diagnostic tool that runs a mini-training loop while exponentially increasing the lr, then plots loss vs lr. The optimal starting lr is just before the loss starts to diverge.
`,
  tryGuidance: "Open a Colab notebook. Train a small MLP on MNIST using (a) SGD batch_size=1, (b) SGD batch_size=256, (c) Adam batch_size=256. Compare wall-clock time per epoch and final accuracy. Then try multiplying Adam's default lr by 10 and observe what happens to the loss curve.",
  interviewGraph: {
    initialStageId: "f4_batch_click",
    artifactDimensions: [
      { label: "Batch size & SGD mechanics", recoveryStageId: "f4_rec_batch" },
      { label: "Adam & learning rate selection", recoveryStageId: "f4_rec_adam" },
      { label: "Optimizer trade-offs", recoveryStageId: "f4_rec_tradeoff", passLabel: "Optimizer Mastery" },
    ],
    stages: {
      f4_batch_click: {
        id: "f4_batch_click",
        type: "click_target",
        badge: "Stage 1 · Batch Size",
        title: "Stage 1 · Spot the performance bottleneck",
        prompt: "This training loop runs on a 1,000,000-row dataset. One line makes it catastrophically slow because it processes a single sample per weight update instead of leveraging GPU parallelism. Click that line.",
        code_snippet: `import tensorflow as tf

model = tf.keras.Sequential([
    tf.keras.layers.Dense(128, activation='relu'),
    tf.keras.layers.Dense(1)
])
optimizer = tf.keras.optimizers.SGD(learning_rate=0.01)
model.compile(optimizer=optimizer, loss='mse')

model.fit(X_train, y_train, batch_size=1, epochs=10)  # ds-target:pure_sgd_slow`,
        validationCopy: {
          pure_sgd_slow: "Correct. batch_size=1 means one forward + backward pass per sample — 1,000,000 gradient steps per epoch. GPUs are designed to process hundreds of samples in parallel; a batch_size of 1 wastes ~99% of compute capacity and makes each epoch orders of magnitude slower than mini-batch training with batch_size=256 or higher.",
        },
        branches: { pure_sgd_slow: "f4_adam_finetune_choice" },
      },

      f4_adam_finetune_choice: {
        id: "f4_adam_finetune_choice",
        type: "scenario_choice",
        badge: "Stage 2 · Adam Fine-Tuning Risk",
        title: "Stage 2 · Fine-tuning with default Adam",
        prompt: "You load a ResNet-50 pretrained on ImageNet and fine-tune it on a 5,000-image medical dataset using Adam with its default learning rate (lr=0.001). Training accuracy climbs in epoch 1, then collapses. What is the most likely cause?",
        code_snippet: `base_model = tf.keras.applications.ResNet50(weights='imagenet', include_top=False)
x = tf.keras.layers.GlobalAveragePooling2D()(base_model.output)
output = tf.keras.layers.Dense(2, activation='softmax')(x)
model = tf.keras.Model(base_model.input, output)

optimizer = tf.keras.optimizers.Adam(learning_rate=0.001)  # default lr
model.compile(optimizer=optimizer, loss='categorical_crossentropy')
model.fit(train_ds, epochs=20)`,
        choices: [
          { id: "a", label: "Learning rate too high for fine-tuning", description: "lr=0.001 is appropriate for training from scratch but is ~100× too large for fine-tuning. It destroys the pretrained weight representations in early epochs before the new head can learn anything useful." },
          { id: "b", label: "Model is too large for the small dataset", description: "Model capacity can cause overfitting, but that shows up as a train/val gap — not a training accuracy collapse in epoch 1." },
          { id: "c", label: "Adam is not suitable for transfer learning", description: "Adam works well for fine-tuning. The problem is configuration (lr), not the optimizer family." },
          { id: "d", label: "The dataset is too small for any fine-tuning to work", description: "5,000 images is a common and workable fine-tuning dataset size. The problem is the learning rate, not the dataset size." },
        ],
        branches: { a: "f4_oscillation_choice", b: "f4_rec_adam", c: "f4_rec_adam", d: "f4_rec_batch" },
        rationale: "When fine-tuning a pretrained model, use a much lower learning rate — typically 1e-5 to 5e-5 — with a warmup schedule. The pretrained weights encode years of training; a large lr overwrites them with noise. A common practice is to first freeze the backbone and train only the head for a few epochs, then unfreeze with a low lr.",
      },

      f4_oscillation_choice: {
        id: "f4_oscillation_choice",
        type: "scenario_choice",
        badge: "Stage 3 · Loss Oscillation",
        title: "Stage 3 · Diagnosing an unstable training run",
        prompt: "A model's training loss oscillates wildly between epochs — spiking up and then partially recovering — but never converges. The architecture looks correct and the data is clean. What is the most likely cause?",
        code_snippet: `# Training log:
# Epoch 1: loss=2.31
# Epoch 2: loss=0.85
# Epoch 3: loss=3.12
# Epoch 4: loss=1.02
# Epoch 5: loss=4.78
# ...

model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=0.1),
    loss='sparse_categorical_crossentropy'
)`,
        choices: [
          { id: "a", label: "Learning rate is too high — gradients overshoot the minimum", description: "With lr=0.1 for Adam (100× the usual default), each update step jumps across the loss valley. The model lands on the other side, takes another giant step back, and never settles. Reducing to 0.001 or adding a warmup + decay schedule will fix this." },
          { id: "b", label: "The model has too many layers and is vanishing the gradient", description: "Vanishing gradients cause training to stall (loss plateaus), not oscillate. The pattern here — large swings — points to overshooting, not undershooting." },
          { id: "c", label: "The dataset has too much label noise", description: "Label noise increases irreducible loss and can slow convergence, but it does not cause the oscillating spike-and-recover pattern seen here." },
          { id: "d", label: "Batch normalization is computing incorrect statistics", description: "BatchNorm issues typically cause slower convergence or subtle accuracy problems — not the dramatic epoch-to-epoch oscillation pattern shown." },
        ],
        branches: { a: "f4_sgd_vs_adam_choice", b: "f4_rec_adam", c: "f4_rec_batch", d: "f4_rec_adam" },
        rationale: "Loss oscillation is the canonical symptom of a learning rate that is too large. The optimizer takes steps so large that it repeatedly overshoots the loss minimum. The fix is to lower the lr (start with 10× smaller), add gradient clipping (clip_norm=1.0), or introduce a warmup schedule that ramps from a tiny lr to the target over the first few hundred steps.",
      },

      f4_sgd_vs_adam_choice: {
        id: "f4_sgd_vs_adam_choice",
        type: "scenario_choice",
        badge: "Stage 4 · SGD vs Adam",
        title: "Stage 4 · Optimizer generalization trade-off",
        prompt: "You are training a ResNet-50 from scratch on ImageNet (1.2M images, 1000 classes). A colleague argues you should use Adam because it converges faster. You disagree. What is your best argument for SGD with momentum instead?",
        code_snippet: `# Option A — Adam
optimizer_a = tf.keras.optimizers.Adam(learning_rate=0.001)

# Option B — SGD + momentum
optimizer_b = tf.keras.optimizers.SGD(
    learning_rate=0.1,
    momentum=0.9,
    nesterov=True
)
# paired with cosine decay schedule`,
        choices: [
          { id: "a", label: "SGD+momentum finds flatter minima, which generalize better", description: "Multiple papers (including He et al. ResNet, Keskar et al. 2017) show that well-tuned SGD+momentum reaches flatter regions of the loss landscape on large vision benchmarks, correlating with better test accuracy. Adam converges faster but often to sharper minima with slightly worse generalization." },
          { id: "b", label: "Adam cannot handle large datasets like ImageNet", description: "Adam works fine on large datasets. The generalization gap, not dataset size handling, is the reason to prefer SGD for this task." },
          { id: "c", label: "SGD is faster per step because it computes fewer operations", description: "SGD is marginally cheaper per step (no m/v tracking), but the difference is negligible compared to the forward/backward pass. Speed is not the argument here." },
          { id: "d", label: "Adam's adaptive learning rates break on image data specifically", description: "Adam works on image data — it is widely used in vision (CLIP, ViTs). The issue is generalization quality, not a fundamental incompatibility." },
        ],
        branches: { a: "f4_terminal", b: "f4_rec_tradeoff", c: "f4_rec_tradeoff", d: "f4_rec_tradeoff" },
        rationale: "This is a nuanced trade-off that interviewers love. Adam wins on speed and ease of tuning. SGD+momentum (with careful lr scheduling) wins on final generalization for large-scale vision. In practice: use Adam for fast prototyping and NLP; consider SGD+momentum for production vision models trained from scratch.",
      },

      f4_rec_batch: {
        id: "f4_rec_batch",
        type: "scenario_choice",
        badge: "Recovery · Batch Size",
        title: "Recovery · Batch size effects on training",
        prompt: "You double the batch size from 256 to 512 while keeping all other hyperparameters the same. What is the most likely effect on training?",
        code_snippet: `# Before
model.fit(X, y, batch_size=256, epochs=100)

# After
model.fit(X, y, batch_size=512, epochs=100)`,
        choices: [
          { id: "a", label: "Faster wall-clock time per epoch, but may need a higher learning rate to maintain convergence speed", description: "Larger batches give more stable gradient estimates (less noise), so you can often scale the lr proportionally (linear scaling rule: 2× batch → 2× lr). Each epoch takes fewer steps but each step uses more data, so per-epoch time improves on GPUs." },
          { id: "b", label: "The model will overfit more because it sees less data per update", description: "Larger batches see more data per update, not less. Overfitting risk is more related to model capacity and regularization than batch size directly." },
          { id: "c", label: "Training will always be slower because more data must be processed per step", description: "GPUs parallelize within a batch. Processing 512 samples takes roughly the same time as 256 on modern hardware (up to memory limits), so wall-clock time per epoch decreases." },
        ],
        branches: { a: "f4_adam_finetune_choice", b: "f4_rec_batch", c: "f4_rec_batch" },
        rationale: "The linear scaling rule: when you multiply batch size by k, multiply the learning rate by k (warmup still advised). This preserves the effective gradient step size. Beyond a certain batch size, you get diminishing GPU parallelism returns and potentially worse generalization (sharp minima).",
      },

      f4_rec_adam: {
        id: "f4_rec_adam",
        type: "scenario_choice",
        badge: "Recovery · Adam Mechanics",
        title: "Recovery · How Adam adapts learning rates",
        prompt: "In Adam, what happens to the effective learning rate of a parameter that has received consistently large gradients over many steps?",
        code_snippet: `# Adam update (simplified):
# m = beta1*m + (1-beta1)*g        # 1st moment
# v = beta2*v + (1-beta2)*g**2     # 2nd moment (variance)
# w = w - lr * m / (sqrt(v) + eps)`,
        choices: [
          { id: "a", label: "Its effective learning rate decreases — large v in the denominator shrinks the step size", description: "Correct. If a parameter consistently receives large gradients, v (the second moment estimate) grows large, making sqrt(v) large, which shrinks lr / sqrt(v). This prevents any single parameter from taking runaway steps." },
          { id: "b", label: "Its effective learning rate increases — momentum m builds up", description: "m does grow, but v grows proportionally faster for large gradients (it accumulates g²). The net effect is a smaller effective lr for high-gradient parameters, not a larger one." },
          { id: "c", label: "Its effective learning rate stays constant — Adam normalizes all parameters equally", description: "Adam does not normalize equally. Parameters with large gradient variance get smaller steps; parameters with small, rare gradients get relatively larger steps. That is the entire point of adaptive learning rates." },
        ],
        branches: { a: "f4_oscillation_choice", b: "f4_rec_adam", c: "f4_rec_adam" },
        rationale: "Adam's adaptive property means: common, high-amplitude gradient dimensions (like biases in dense layers) get conservative updates; rare, small-gradient dimensions (like embeddings for infrequent tokens) get larger updates. This is why Adam is so effective for sparse problems like NLP.",
      },

      f4_rec_tradeoff: {
        id: "f4_rec_tradeoff",
        type: "scenario_choice",
        badge: "Recovery · Optimizer Trade-offs",
        title: "Recovery · Choosing the right optimizer",
        prompt: "For a transformer-based language model being trained from scratch, which optimizer configuration is considered the industry standard?",
        code_snippet: `# Which of these is the standard recipe for training transformers?`,
        choices: [
          { id: "a", label: "AdamW + linear warmup + cosine decay schedule", description: "This is the standard recipe from GPT, BERT, and subsequent large language models. AdamW decouples weight decay from the adaptive learning rate (fixing a subtle bug in Adam). Warmup stabilizes early training. Cosine decay smoothly reduces lr as training matures." },
          { id: "b", label: "SGD with momentum=0.9 and a fixed learning rate", description: "SGD with a fixed lr will struggle with transformer training — the adaptive rates in Adam/AdamW are particularly beneficial for the attention mechanism's diverse gradient scales." },
          { id: "c", label: "RMSprop with no weight decay", description: "RMSprop is an older adaptive optimizer predating Adam. It lacks the first-moment (momentum) term and is rarely used for modern large-model training." },
        ],
        branches: { a: "f4_sgd_vs_adam_choice", b: "f4_rec_tradeoff", c: "f4_rec_tradeoff" },
        rationale: "AdamW with warmup+cosine is the default in HuggingFace Trainer, PyTorch Lightning, and every major language model paper since 2018. The weight decay in AdamW is applied directly to weights (not absorbed into the gradient), which is mathematically cleaner and empirically better than vanilla Adam with L2 regularization.",
      },

      f4_terminal: {
        id: "f4_terminal",
        type: "scenario_choice",
        badge: "Terminal · Mastery Check",
        title: "Mastery complete · Optimizer expertise",
        terminal: true,
        prompt: "A model's training loss stops decreasing after epoch 10. Validation loss is still improving slightly. What does this pattern indicate, and what is the most appropriate next action?",
        code_snippet: `# Training metrics:
# Epoch  8: train_loss=0.42, val_loss=0.51
# Epoch  9: train_loss=0.41, val_loss=0.50
# Epoch 10: train_loss=0.41, val_loss=0.49
# Epoch 11: train_loss=0.41, val_loss=0.48
# Epoch 12: train_loss=0.41, val_loss=0.47
# (train loss flat, val loss still falling)`,
        choices: [
          { id: "a", label: "Training loss hit a plateau — reduce the learning rate to escape it and allow finer convergence", description: "This is the right read. The optimizer has found a region where gradients are near-zero at the current lr. A learning rate reduction (or activating cosine decay) allows finer steps that can still improve the model. The fact that val loss is still improving confirms the model has not overfit — it is still generalizing, just not optimizing the training loss further at this lr." },
          { id: "b", label: "The model has overfit — stop training immediately", description: "Overfitting shows as training loss continuing to drop while validation loss rises. Here val loss is still improving, so the model is not overfit. Stopping now would leave performance on the table." },
          { id: "c", label: "The loss function is wrong — switch to a different objective", description: "A flat training loss plateau is almost never caused by a wrong loss function. It is a learning rate / optimization dynamics issue. Changing the loss function would be premature and likely counterproductive." },
        ],
        branches: { a: "f4_terminal", b: "f4_terminal", c: "f4_terminal" },
        rationale: "A flat training loss with still-improving validation loss is a classic learning rate plateau signal — the optimizer is taking steps too small to escape the current basin, but the basin itself is still generalizing. Reduce the lr by 5–10× (or switch to cosine decay), monitor for a few epochs, and the training loss should resume decreasing. If it does not, check for gradient flow issues (dead ReLUs, vanishing gradients) or data pipeline bottlenecks.",
      },
    },
  },
  knowledgeCheck: [
    {
      question: "In Adam, the second moment estimate v accumulates the squared gradients. What is the direct effect of a large v value on the parameter update?",
      options: [
        "It shrinks the effective learning rate for that parameter",
        "It increases the effective learning rate for that parameter",
        "It reverses the sign of the gradient update",
      ],
      correctIndex: 0,
      explanation: "The Adam update is lr * m / (sqrt(v) + eps). A large v makes sqrt(v) large, which divides the step size down. Parameters with consistently large gradient magnitudes get conservative updates — Adam's core adaptive mechanism.",
    },
    {
      question: "You are fine-tuning GPT-2 on a domain-specific text corpus. Which learning rate is most appropriate?",
      options: [
        "0.1 — same as training from scratch on vision benchmarks",
        "0.001 — Adam's default, safe for any task",
        "2e-5 — a small value with warmup to preserve pretrained representations",
      ],
      correctIndex: 2,
      explanation: "Fine-tuning requires a much smaller lr than training from scratch. lr=0.001 (Adam default) will overwrite pretrained weights too aggressively. A value around 1e-5 to 5e-5 with a warmup schedule is the standard HuggingFace recipe for fine-tuning language models.",
    },
    {
      question: "Doubling the mini-batch size from 256 to 512 (with a linear lr scaling rule applied). What is the expected effect?",
      options: [
        "Fewer gradient updates per epoch, but each update uses a more accurate gradient estimate — overall training stability improves",
        "More gradient updates per epoch because there are more samples per step",
        "The model will overfit faster because each batch contains more repeated patterns",
      ],
      correctIndex: 0,
      explanation: "With 512-sample batches on the same dataset, you take half as many gradient steps per epoch. Each step's gradient is computed over more samples, giving a lower-variance (more accurate) estimate. With linear lr scaling (2× lr), effective optimization speed is preserved. Generalization can sometimes degrade at very large batch sizes (sharp minima), but this is a separate concern from the mechanics.",
    },
  ],
},

"dl-f5": {
  durationLabel: "18 min",
  outcomes: [
    "Explain dropout's ensemble interpretation and why you must disable it at inference",
    "Describe how batch normalization differs between training and inference modes",
    "Apply weight decay (L2 regularization) and explain its connection to a Gaussian prior on weights",
    "Choose the appropriate regularization technique given network architecture and task",
  ],
  learnMarkdown: `## Why Regularization?

A neural network with enough parameters can memorize any training set — achieving near-zero training loss while performing poorly on unseen data. This is **overfitting**: the model learns noise and idiosyncrasies of the training data rather than the underlying pattern. Regularization is any technique that reduces this gap between training and generalization performance.

## Dropout

**Dropout** randomly sets a fraction p of neurons to zero during each forward pass in training. With a dropout rate of 0.5, each neuron is independently zeroed with 50% probability.

\`\`\`python
# PyTorch
self.dropout = nn.Dropout(p=0.5)
x = self.dropout(x)  # zeros ~50% of neurons, but only during training
\`\`\`

**Why it works — the ensemble interpretation**: Each training step effectively trains a different sub-network (a random subset of neurons). By the end of training, you have implicitly trained an exponential number of overlapping sub-networks. At inference, the full network acts as an ensemble of these sub-networks, which tends to be more robust.

**Inverted dropout** (the standard modern implementation): during training, surviving neuron activations are scaled up by 1/(1−p) so their expected value is preserved. This means at inference you can use the network exactly as-is — no scaling adjustment needed. This is the default in PyTorch and TensorFlow/Keras.

**Critical detail**: dropout must be **disabled at inference**. In PyTorch: \`model.eval()\`. In Keras: Dropout layers automatically use inference mode during \`model.predict()\`. Forgetting this is a common production bug — activating dropout at inference introduces randomness and degrades predictions.

Where to use dropout: after fully-connected (dense) layers. Using it after conv layers is less common and often less effective (use spatial dropout or batch norm instead for convolutional networks).

## Batch Normalization

**Batch Normalization** (BatchNorm) normalizes the inputs to each layer across the batch dimension, then applies a learned scale (γ) and shift (β):

\`\`\`
x_norm = (x − μ_batch) / sqrt(σ²_batch + ε)
y = γ · x_norm + β
\`\`\`

During training, μ and σ² are computed from the current mini-batch. Simultaneously, BatchNorm maintains **running estimates** of the mean and variance via exponential moving average.

At **inference**, BatchNorm switches to those running estimates — it does not compute statistics from the (potentially single-sample) inference batch. This is why \`model.eval()\` in PyTorch is critical: it switches BatchNorm from "use batch stats" mode to "use running stats" mode.

**Why BatchNorm helps training**:
- Reduces **internal covariate shift** — normalizing layer inputs keeps the distribution consistent as weights update, so later layers do not need to constantly re-adapt to shifting input distributions.
- Allows much **higher learning rates** without divergence.
- Acts as a mild regularizer (the batch-level noise in μ and σ² adds stochasticity).
- Placed **after conv layers, before activation** (or after activation — both are used in practice).

## Weight Decay (L2 Regularization)

**Weight decay** adds a penalty proportional to the squared magnitude of weights to the loss:

\`\`\`
L_total = L_task + λ · Σ wᵢ²
\`\`\`

This pushes weights toward zero, preventing any single weight from dominating. Equivalently, it corresponds to placing a **Gaussian prior** on the weights (Bayesian interpretation: you believe weights are likely small). In SGD, the gradient of the penalty term simply subtracts λ·w from each weight at every step — the "decay."

In Adam, weight decay should be applied as **AdamW** (decoupled weight decay) rather than L2 in the loss, because Adam's adaptive scaling interferes with how L2 interacts with the gradient update.

Typical values: λ = 1e-4 to 1e-2. Too large: underfitting. Too small: no regularization benefit.

## Label Smoothing

Instead of using hard one-hot targets (0 or 1), **label smoothing** distributes a small probability ε across incorrect classes:

\`\`\`
y_smooth = (1 − ε) · y_onehot + ε / K
\`\`\`

This prevents the model from becoming overconfident and improves calibration. Common in image classification (ε=0.1) and neural machine translation.

## Choosing the Right Regularization

| Technique | Best for | Notes |
|---|---|---|
| Dropout | After dense layers, transformers | Rate 0.1–0.5; disable at inference |
| Batch Normalization | After conv layers | Use eval() mode at inference |
| Weight Decay | Almost always | AdamW for adaptive optimizers |
| Label Smoothing | Classification heads | ε=0.1 is a safe default |

## Interview Hook (answer like a senior)

*"The most important thing I check when regularization is in the code is whether training/inference modes are set correctly. A model in train mode at inference has both dropout randomly zeroing neurons and batch norm using noisy batch statistics — your predictions become non-deterministic and degraded. Beyond that, my default recipe is: BatchNorm after conv layers, dropout after dense layers, weight decay everywhere via AdamW. I add label smoothing for classification heads when calibration matters."*
`,
  video: null,
  videoFallbackMarkdown: `## Deep Dive: Batch Norm vs Layer Norm vs Group Norm

BatchNorm normalizes across the batch dimension — it needs a reasonable batch size (≥16 recommended) to compute stable statistics. This makes it unsuitable for small-batch or sequence tasks.

**Layer Normalization** normalizes across the feature dimension for a single sample — no batch dependency. This is why transformers use LayerNorm: self-attention already processes one sequence at a time and batch size shouldn't affect normalization.

**Group Normalization** is a middle ground: normalize across groups of channels within a single sample. Works well for object detection with small batch sizes.

**Spectral Normalization** constrains weight matrices to have spectral norm ≤1, stabilizing GAN training without the training/inference mode switch.
`,
  tryGuidance: "Train a small MLP on MNIST without regularization until it overfits. Then add dropout(0.3) after each hidden layer and retrain. Finally, compare model.predict() outputs with model in train() mode vs eval() mode — you will see different (random) outputs for dropout in train mode. This makes the inference-mode bug viscerally concrete.",
  interviewGraph: {
    initialStageId: "f5_eval_click",
    artifactDimensions: [
      { label: "Dropout train/inference modes", recoveryStageId: "f5_rec_dropout" },
      { label: "Batch normalization mechanics", recoveryStageId: "f5_rec_batchnorm" },
      { label: "Regularization selection", recoveryStageId: "f5_rec_selection", passLabel: "Regularization Mastery" },
    ],
    stages: {
      f5_eval_click: {
        id: "f5_eval_click",
        type: "click_target",
        badge: "Stage 1 · Inference Mode Bug",
        title: "Stage 1 · Find the inference-time mistake",
        prompt: "This PyTorch inference function has a bug that activates dropout during prediction, making outputs non-deterministic and degraded. Click the line responsible for the incorrect behavior.",
        code_snippet: `import torch

def predict(model, dataloader):
    model.train()  # ds-target:wrong_mode
    predictions = []
    with torch.no_grad():
        for batch in dataloader:
            outputs = model(batch)
            predictions.append(outputs.argmax(dim=1))
    return torch.cat(predictions)`,
        validationCopy: {
          wrong_mode: "Correct. model.train() activates dropout (randomly zeroing neurons) and makes BatchNorm use current-batch statistics — both behaviors are harmful at inference. model.eval() must be called before inference to disable dropout and switch BatchNorm to its accumulated running statistics. The torch.no_grad() context manager only disables gradient tracking; it does not affect dropout or BatchNorm behavior.",
        },
        branches: { wrong_mode: "f5_dropout_scale_choice" },
      },

      f5_dropout_scale_choice: {
        id: "f5_dropout_scale_choice",
        type: "scenario_choice",
        badge: "Stage 2 · Inverted Dropout",
        title: "Stage 2 · Dropout scaling at inference",
        prompt: "A model uses dropout with rate p=0.5 during training. Using the standard inverted dropout implementation, what happens to neuron activations at inference time?",
        code_snippet: `# During training (inverted dropout):
# - Each neuron zeroed with probability p=0.5
# - Surviving neurons scaled by 1/(1-p) = 2.0
# - Expected activation = original activation

# At inference:
# model.eval()
# What happens to the dropout layer?`,
        choices: [
          { id: "a", label: "Dropout is disabled — all neurons pass through unchanged, no scaling needed", description: "With inverted dropout, surviving neurons are scaled up during training to preserve expected activation magnitude. So at inference, you can pass activations through without any adjustment — the full network's output matches the expected output of the trained sub-networks." },
          { id: "b", label: "Activations are multiplied by 0.5 (the keep probability) at inference", description: "This describes the older non-inverted dropout approach. Inverted dropout does the scaling at training time so that inference requires no modification. Modern libraries (PyTorch, Keras) use inverted dropout by default." },
          { id: "c", label: "Activations are multiplied by 2.0 (1/(1-p)) at inference", description: "The 2.0 scaling factor is applied during training in inverted dropout, not at inference. Applying it again at inference would double the activations and break the model." },
          { id: "d", label: "Half of neurons are still randomly zeroed, but with a different random seed", description: "At inference with model.eval(), dropout is completely disabled — no neurons are zeroed. Random zeroing is a training-only behavior." },
        ],
        branches: { a: "f5_batchnorm_stats_choice", b: "f5_rec_dropout", c: "f5_rec_dropout", d: "f5_rec_dropout" },
        rationale: "Inverted dropout is the key insight: scale up during training, so inference is clean. This makes model deployment simpler — you don't need inference-time scaling logic. Always check your framework's default: both PyTorch nn.Dropout and Keras Dropout use inverted dropout.",
      },

      f5_batchnorm_stats_choice: {
        id: "f5_batchnorm_stats_choice",
        type: "scenario_choice",
        badge: "Stage 3 · BatchNorm at Inference",
        title: "Stage 3 · Which statistics does BatchNorm use at test time?",
        prompt: "A ResNet model uses BatchNorm throughout. During training, BatchNorm normalizes using batch statistics. A single image is passed at inference time. What statistics does BatchNorm use to normalize the activations?",
        code_snippet: `model = ResNet50()
model.eval()  # switches BatchNorm to inference mode

# Single image inference
with torch.no_grad():
    image = torch.randn(1, 3, 224, 224)  # batch_size=1
    output = model(image)
    # What does BatchNorm do here?`,
        choices: [
          { id: "a", label: "Running mean and running variance accumulated during training", description: "Correct. During training, BatchNorm maintains exponential moving averages of mean and variance across all seen batches. At inference (model.eval()), it uses these stable population statistics instead of the current batch — which would be meaningless with a batch size of 1." },
          { id: "b", label: "Mean and variance of the single inference image's activations", description: "Using single-sample statistics would make normalization meaningless and inconsistent — every image would be normalized to the same distribution regardless of its actual content. This would destroy the model's ability to distinguish different inputs." },
          { id: "c", label: "The learned γ and β parameters only — no normalization is applied", description: "γ and β are the learned scale and shift applied after normalization. The normalization step itself (subtract mean, divide by std) still occurs at inference — but using running statistics, not batch statistics." },
          { id: "d", label: "BatchNorm is automatically disabled at inference, like dropout", description: "Unlike dropout (which is fully disabled at inference), BatchNorm still normalizes at inference — it just switches from batch statistics to running statistics. The normalization step is always active; only the source of statistics changes." },
        ],
        branches: { a: "f5_batchnorm_benefit_choice", b: "f5_rec_batchnorm", c: "f5_rec_batchnorm", d: "f5_rec_dropout" },
        rationale: "The running stats are accumulated via: running_mean = (1-momentum)*running_mean + momentum*batch_mean, typically with momentum=0.1. After sufficient training, these estimates are stable representations of the population statistics. This is why fine-tuning with a tiny dataset can corrupt BatchNorm running stats — the few batches overwrite good running stats with noisy ones.",
      },

      f5_batchnorm_benefit_choice: {
        id: "f5_batchnorm_benefit_choice",
        type: "scenario_choice",
        badge: "Stage 4 · Why BatchNorm Enables Higher LR",
        title: "Stage 4 · The mechanism behind BatchNorm's training speedup",
        prompt: "After adding BatchNorm before every activation in your CNN, training is dramatically faster and you can use a 10× higher learning rate without divergence. What is the primary mechanism behind this improvement?",
        code_snippet: `# Before BatchNorm:
# model.compile(optimizer=Adam(lr=0.0001))  # must use small lr

# After BatchNorm:
model = Sequential([
    Conv2D(64, 3, padding='same'),
    BatchNormalization(),
    Activation('relu'),
    Conv2D(128, 3, padding='same'),
    BatchNormalization(),
    Activation('relu'),
    # ...
])
# model.compile(optimizer=Adam(lr=0.001))  # 10x larger lr is now stable`,
        choices: [
          { id: "a", label: "BatchNorm reduces internal covariate shift — layer inputs stay in a consistent distribution as weights update, stabilizing gradient magnitudes throughout the network", description: "Without BatchNorm, as earlier layers' weights update, the distribution of inputs to later layers shifts constantly ('internal covariate shift'). Later layers must perpetually re-adapt. BatchNorm pins the input distribution to each layer, making the effective optimization landscape smoother and allowing larger gradient steps without instability." },
          { id: "b", label: "BatchNorm reduces the number of trainable parameters, making optimization easier", description: "BatchNorm actually adds parameters (γ and β per channel). It does not reduce parameters — its benefit is distributional stability, not parameter efficiency." },
          { id: "c", label: "BatchNorm acts as strong L2 regularization, shrinking weights and preventing gradient explosion", description: "BatchNorm has a mild regularization effect (due to batch-level noise), but it is not equivalent to L2 regularization. Its primary benefit is distributional normalization of layer inputs, not weight penalization." },
          { id: "d", label: "BatchNorm replaces the activation function, removing the gradient saturation problem", description: "BatchNorm is placed before or after activation functions — it does not replace them. Gradient saturation (in sigmoid/tanh) is addressed by activation function choice (ReLU), not BatchNorm." },
        ],
        branches: { a: "f5_terminal", b: "f5_rec_batchnorm", c: "f5_rec_selection", d: "f5_rec_batchnorm" },
        rationale: "Ioffe and Szegedy's original BatchNorm paper (2015) framed this as reducing internal covariate shift. More recent analysis (e.g., Santurkar et al. 2018) suggests the primary benefit may actually be smoothing the loss landscape — making gradient directions more reliable across steps. Either way, the empirical result is clear: BatchNorm allows higher learning rates and faster convergence.",
      },

      f5_rec_dropout: {
        id: "f5_rec_dropout",
        type: "scenario_choice",
        badge: "Recovery · Dropout Mechanics",
        title: "Recovery · Dropout behavior during training vs inference",
        prompt: "A Keras model includes a Dropout(0.4) layer. During training, a neuron produces activation value 1.0. What activation value propagates forward if this neuron survives the dropout mask?",
        code_snippet: `# Keras Dropout(rate=0.4) — inverted dropout
# rate=0.4 means 40% of neurons are zeroed
# Surviving neurons are scaled

layer = tf.keras.layers.Dropout(rate=0.4)
x = tf.constant([[1.0, 1.0, 1.0, 1.0, 1.0]])
output = layer(x, training=True)
# What are the non-zero values?`,
        choices: [
          { id: "a", label: "1.667 (scaled by 1/(1-0.4) = 1/0.6 ≈ 1.667)", description: "Correct. Inverted dropout scales surviving neurons by 1/(1-p) to preserve the expected activation. With p=0.4, keep probability is 0.6, so surviving activations are multiplied by 1/0.6 ≈ 1.667. At inference, no scaling is needed — the full network is used as-is." },
          { id: "b", label: "1.0 (unchanged — dropout only zeros neurons, no scaling)", description: "Without scaling, the total activation reaching the next layer would be ~60% of normal (since 40% are zeroed). This would create a train/inference mismatch — inference uses all neurons and would have ~1.67× the expected activation." },
          { id: "c", label: "0.6 (scaled by 1-p = the keep probability)", description: "Scaling by keep probability (0.6) is the non-inverted approach: train unchanged, scale down at inference. Modern libraries invert this: scale up at train time so inference needs no modification." },
        ],
        branches: { a: "f5_dropout_scale_choice", b: "f5_rec_dropout", c: "f5_rec_dropout" },
        rationale: "The key invariant inverted dropout preserves: E[output during training] = output during inference. Scaling by 1/(1-p) at train time achieves this. Without it, you'd need to multiply all activations by (1-p) at inference — which is error-prone in deployment.",
      },

      f5_rec_batchnorm: {
        id: "f5_rec_batchnorm",
        type: "scenario_choice",
        badge: "Recovery · BatchNorm Mechanics",
        title: "Recovery · BatchNorm training vs inference statistics",
        prompt: "You fine-tune a pretrained model on a tiny dataset (100 samples, batch_size=32 — only 3 mini-batches per epoch). Training loss improves but inference quality is terrible. BatchNorm is suspected. What is the most likely cause?",
        code_snippet: `# Pretrained model has BatchNorm layers throughout
# Fine-tuning setup:
model.trainable = True  # unfreeze all layers including BatchNorm
optimizer = Adam(1e-4)
model.fit(tiny_dataset, epochs=50, batch_size=32)
# Inference is bad despite good training loss`,
        choices: [
          { id: "a", label: "The tiny fine-tuning batches are corrupting the BatchNorm running statistics accumulated during pretraining", description: "Correct. With only 3 batches per epoch over 50 epochs, the running mean/variance estimates are quickly overwritten by the tiny fine-tuning distribution. At inference, the model uses these corrupted running stats, which no longer represent the true data distribution. Fix: freeze BatchNorm layers during fine-tuning (set layer.trainable=False for BN layers, or use model.layers[i].training=False)." },
          { id: "b", label: "BatchNorm cannot function with batch sizes smaller than 32", description: "BatchNorm works with any batch size during training — though very small batches (≤4) give noisy statistics. The issue here is not the batch size itself but the small number of batches overwriting pretrained running stats." },
          { id: "c", label: "The learning rate is too high for fine-tuning with BatchNorm", description: "A high learning rate can destabilize fine-tuning generally, but the symptom would be training loss not converging — not good training loss with bad inference. The train/inference gap strongly points to BatchNorm running stat corruption." },
        ],
        branches: { a: "f5_batchnorm_stats_choice", b: "f5_rec_batchnorm", c: "f5_rec_batchnorm" },
        rationale: "A common fine-tuning best practice: freeze BatchNorm layers (keep them in eval mode with pretrained running stats) while fine-tuning other layers. In PyTorch: model.apply(lambda m: m.eval() if isinstance(m, nn.BatchNorm2d) else None). This preserves the pretraining-era normalization statistics.",
      },

      f5_rec_selection: {
        id: "f5_rec_selection",
        type: "scenario_choice",
        badge: "Recovery · Regularization Selection",
        title: "Recovery · Choosing the right regularization",
        prompt: "You are building a transformer-based text classifier. The architecture has multi-head attention and feedforward sublayers, no convolutional layers. Which regularization approach is most appropriate?",
        code_snippet: `class TransformerBlock(nn.Module):
    def __init__(self, d_model, nhead, dropout_rate):
        super().__init__()
        self.attention = nn.MultiheadAttention(d_model, nhead)
        self.norm1 = ???  # What normalization?
        self.dropout = nn.Dropout(dropout_rate)
        self.ffn = nn.Sequential(
            nn.Linear(d_model, 4*d_model),
            nn.GELU(),
            nn.Linear(4*d_model, d_model)
        )`,
        choices: [
          { id: "a", label: "LayerNorm (not BatchNorm) + dropout in attention and FFN sublayers + weight decay via AdamW", description: "Transformers use LayerNorm because it normalizes per-sample across features (no batch dependency), which is correct for variable-length sequences and works with any batch size. Dropout is applied in attention weights and after FFN layers. AdamW handles weight decay." },
          { id: "b", label: "BatchNorm after attention + no dropout (transformers don't overfit)", description: "BatchNorm is poorly suited for transformers: it normalizes across the batch, which creates dependencies between sequence positions and breaks with variable-length inputs. Transformers absolutely overfit without regularization." },
          { id: "c", label: "Dropout only — normalization layers are not needed in transformers", description: "All modern transformer architectures (BERT, GPT, T5) include normalization layers. Without normalization, training large transformers is extremely unstable." },
        ],
        branches: { a: "f5_batchnorm_benefit_choice", b: "f5_rec_selection", c: "f5_rec_selection" },
        rationale: "LayerNorm over BatchNorm for transformers is a fundamental architectural decision, not a preference. The original 'Attention is All You Need' paper used LayerNorm. Every major LLM since uses LayerNorm (often pre-norm: applied before the sublayer, not after). Dropout rates of 0.1-0.2 are standard for transformers.",
      },

      f5_terminal: {
        id: "f5_terminal",
        type: "scenario_choice",
        badge: "Terminal · Mastery Check",
        title: "Mastery complete · Regularization expertise",
        terminal: true,
        prompt: "A deployed model performs well during offline evaluation but produces inconsistent predictions in production — the same input sometimes yields different outputs. Dropout and BatchNorm are both used in the model. What inference-time mistake do you check first?",
        code_snippet: `# Production inference service (Python/Flask):
def get_prediction(image_bytes):
    image = preprocess(image_bytes)
    tensor = torch.from_numpy(image).unsqueeze(0)

    # Is something wrong here?
    output = model(tensor)  # model state not explicitly set
    return output.softmax(dim=1).tolist()`,
        choices: [
          { id: "a", label: "model.eval() is never called — the model may be in training mode with dropout active", description: "This is the first thing to check. PyTorch models default to training mode. Without model.eval() (ideally called once at startup, before any inference), dropout randomly zeros neurons on every call — producing different outputs for the same input. BatchNorm also uses noisy batch statistics instead of stable running stats. Add model.eval() and torch.no_grad() to fix both issues." },
          { id: "b", label: "The model is not wrapped in torch.no_grad() — gradient computation adds randomness", description: "torch.no_grad() disables gradient tracking to save memory and speed up inference — it does not affect dropout or BatchNorm behavior. The randomness symptom points specifically to dropout being active, not gradient tracking." },
          { id: "c", label: "The softmax is being applied incorrectly — it should be in the model's forward pass", description: "Applying softmax post-hoc is fine and common in deployment. Softmax is deterministic — it does not introduce the randomness described. The non-determinism symptom points to dropout." },
        ],
        branches: { a: "f5_terminal", b: "f5_terminal", c: "f5_terminal" },
        rationale: "model.eval() is the most critical inference-time call in PyTorch. Best practice for deployment: call model.eval() once when loading the model, wrap all inference in torch.no_grad(), and verify outputs are deterministic for the same input before shipping. This bug is extremely common in production ML code written by engineers who learned from training-focused tutorials.",
      },
    },
  },
  knowledgeCheck: [
    {
      question: "A model uses Dropout(p=0.5) with inverted dropout. At inference time, what is the expected output of a neuron that had activation 2.0 during the equivalent training-time forward pass?",
      options: [
        "2.0 — inverted dropout scales at train time so inference output is unchanged",
        "1.0 — the output is multiplied by keep probability (0.5) at inference",
        "4.0 — the output is multiplied by 1/(1-p) = 2.0 at inference",
      ],
      correctIndex: 0,
      explanation: "Inverted dropout scales surviving neurons by 1/(1-p) during training to preserve expected activation magnitude. This means inference requires no adjustment — all neurons pass through unchanged at eval time. The 2.0 activation would have been 4.0 if it survived training-time dropout (2.0 × 1/0.5 = 4.0), and at inference it passes through as 2.0 from the un-dropped network.",
    },
    {
      question: "BatchNorm is in eval() mode. Which statistics does it use to normalize activations?",
      options: [
        "Mean and variance of the current inference batch",
        "Running mean and running variance accumulated across training batches",
        "The learned γ (scale) and β (shift) parameters only",
      ],
      correctIndex: 1,
      explanation: "In eval mode, BatchNorm uses the running mean and running variance — exponential moving averages accumulated across all training mini-batches. It does NOT use current-batch statistics (which would be meaningless for a single inference sample). γ and β are still applied, but after normalization with the running stats.",
    },
    {
      question: "You have a deep CNN for image classification. Where should you add regularization layers?",
      options: [
        "BatchNorm after convolutional layers; Dropout after fully-connected layers",
        "Dropout after every layer including conv layers; no BatchNorm needed",
        "BatchNorm after fully-connected layers; Dropout after convolutional layers",
      ],
      correctIndex: 0,
      explanation: "The standard CNN regularization recipe: BatchNorm after conv layers (normalizes spatial feature maps, allows higher learning rates), Dropout after dense/fully-connected layers (acts as ensemble regularizer for the classifier head). Applying Dropout to conv layers is less effective and can disrupt spatial feature learning — use Spatial Dropout or BatchNorm there instead.",
    },
  ],
},

"dl-a1": {
  durationLabel: "25 min",
  outcomes: [
    "Describe how a convolution operation produces a feature map and explain parameter sharing",
    "Calculate the output shape of a conv layer given input dimensions, kernel size, padding, and stride",
    "Explain why CNNs need far fewer parameters than fully-connected networks for image tasks",
    "Identify the function of pooling layers and compare max pooling vs average pooling",
  ],
  learnMarkdown: `## Why Not Fully-Connected Layers for Images?

A 224×224 RGB image has 224×224×3 = 150,528 input values. A fully-connected layer with 1,024 hidden units would require 150,528 × 1,024 ≈ **154 million parameters** — just for the first layer. This is computationally expensive, prone to overfitting, and ignores the fundamental structure of images: nearby pixels are related, and the same pattern (an edge, a curve) can appear anywhere in the image.

**Convolutional Neural Networks** exploit two key properties of images: **locality** (features are defined by nearby pixels) and **translation invariance** (a cat is a cat whether it's in the top-left or bottom-right of the frame).

## The Convolution Operation

A **convolution** slides a small filter (kernel) over the input image and computes a dot product at each position. For a 3×3 filter:

\`\`\`
Input patch (3×3):    Filter (3×3):      Output value:
1  2  1               0  1  0            1·0+2·1+1·0
0  0  0          ×    0  0  0    →     + 0·0+0·0+0·0
1  2  1               0  1  0          + 1·0+2·1+1·0 = 4
\`\`\`

The filter slides across every position, producing a 2D **feature map**. One filter detects one type of feature (horizontal edges, diagonal lines, color blobs). A conv layer uses multiple filters in parallel, producing multiple feature maps — one per filter.

**Output shape** (no padding, stride 1):
\`\`\`
H_out = H_in − K + 1
W_out = W_in − K + 1
\`\`\`

With **same padding** (zero-pad the input): H_out = H_in. With **stride s**: H_out = floor((H_in − K) / s) + 1.

**Example**: 28×28×1 input, 32 filters of size 3×3, valid padding, stride 1:
Output shape = 26×26×32 (26 = 28 − 3 + 1, 32 channels from 32 filters).

## Parameter Sharing and Why It Matters

The critical insight: the **same filter weights are reused at every spatial position**. A 3×3×1 filter detecting horizontal edges has only 9 parameters — and those 9 numbers detect horizontal edges anywhere in the image. Compare this to a fully-connected layer where each output neuron has its own connection to every input pixel.

Total parameters in a conv layer:
\`\`\`
Params = (K × K × C_in + 1) × C_out
\`\`\`

Where K is kernel size, C_in is input channels, C_out is number of filters. A 3×3 layer going from 1 to 32 channels: (9 × 1 + 1) × 32 = 320 parameters. The equivalent fully-connected layer: 784 × 832 ≈ 652,288 parameters.

## Receptive Field

Each output cell in a feature map "sees" a small patch of the input — its **receptive field**. A single 3×3 conv has a 3×3 receptive field. Stack two 3×3 convs: each cell now sees a 5×5 patch. Stack three: 7×7. **This is why deep networks with small kernels are preferred** — two 3×3 convs (18 parameters, 5×5 receptive field, two nonlinearities) beats one 5×5 conv (25 parameters, same receptive field, one nonlinearity).

## Pooling: Spatial Downsampling

**Pooling** reduces the spatial dimensions of feature maps, compressing information and making the representation more robust to small translations.

- **Max pooling**: takes the maximum value in each pooling window. Preserves the strongest activation — "was this feature present here?" Preferred in early and middle layers.
- **Average pooling**: takes the mean. Smoother; commonly used as **Global Average Pooling** (GAP) at the end of a network to collapse the spatial dimensions before the classifier head.

A 2×2 max pool with stride 2 halves each spatial dimension: 26×26 → 13×13.

## Typical CNN Architecture

\`\`\`
Input (28×28×1)
  → Conv2D(32, 3×3) + ReLU → (26×26×32)
  → MaxPool(2×2)            → (13×13×32)
  → Conv2D(64, 3×3) + ReLU → (11×11×64)
  → MaxPool(2×2)            → (5×5×64)
  → Flatten                 → (1600,)
  → Dense(128) + ReLU       → (128,)
  → Dense(10) + Softmax     → (10,)
\`\`\`

Early conv layers learn low-level features (edges, colors). Deeper layers combine these into high-level concepts (eyes, wheels, faces). The fully-connected head at the end does classification using the extracted features.

## Key Takeaways

| Property | Fully-Connected | CNN |
|---|---|---|
| Parameter count | O(H × W × C × units) | O(K² × C_in × C_out) |
| Translation invariance | No | Yes (parameter sharing) |
| Exploits spatial structure | No | Yes (local connectivity) |
| Good for images | Poorly | Designed for this |

## Interview Hook (answer like a senior)

*"The two innovations in CNNs that matter most are parameter sharing and local connectivity. Parameter sharing means one edge detector works anywhere in the image — the same 9 weights detect a horizontal edge in the top-left and bottom-right corner. Local connectivity means we only connect each output to a small neighborhood, which massively cuts parameters and encodes the inductive bias that nearby pixels are more related than distant ones. Together, these give CNNs translation equivariance — shift the input, the feature map shifts the same way — which is a fundamentally better inductive bias for image data than a fully-connected layer, which treats all pixels as completely independent inputs."*
`,
  video: null,
  videoFallbackMarkdown: `## Deep Dive: Modern CNN Design Patterns

**Depthwise Separable Convolutions** (MobileNet): split a standard conv into a depthwise conv (one filter per input channel) + pointwise conv (1×1 conv combining channels). This reduces parameters by ~8-9× for a 3×3 conv with negligible accuracy loss.

**Skip connections** (ResNet): add the input directly to the conv layer's output (x → F(x) + x). This creates identity shortcuts that let gradients flow directly to early layers, enabling training of 100+ layer networks.

**Global Average Pooling** replaces the final Flatten + Dense layers with a single average over the spatial dimensions per channel. This dramatically reduces parameters in the classifier head and improves regularization.

**Dilated convolutions**: insert gaps between kernel values to increase receptive field without increasing parameters or losing resolution. Used in segmentation (DeepLab) and WaveNet.
`,
  tryGuidance: "In a Colab notebook: (1) Build a simple model that flattens a 28×28 image directly and connects to Dense layers. Count parameters. (2) Build the equivalent CNN with two Conv2D layers. Count parameters. (3) Run both on MNIST for 5 epochs. Compare parameter counts, training speed, and final accuracy. The CNN should match or beat the MLP with 10× fewer parameters.",
  interviewGraph: {
    initialStageId: "a1_flatten_click",
    artifactDimensions: [
      { label: "Spatial structure & feature maps", recoveryStageId: "a1_rec_spatial" },
      { label: "Conv output shape & parameters", recoveryStageId: "a1_rec_shapes" },
      { label: "Pooling & architectural choices", recoveryStageId: "a1_rec_pooling", passLabel: "CNN Mastery" },
    ],
    stages: {
      a1_flatten_click: {
        id: "a1_flatten_click",
        type: "click_target",
        badge: "Stage 1 · Spatial Structure",
        title: "Stage 1 · Find the line that discards spatial structure",
        prompt: "This model processes 28×28 images. One line immediately destroys the 2D spatial structure — treating the image as a flat 1D vector before any feature extraction can occur. Click that line.",
        code_snippet: `import tensorflow as tf

model = tf.keras.Sequential([
    tf.keras.layers.InputLayer(input_shape=(28, 28, 1)),
    tf.keras.layers.Flatten(),  # ds-target:early_flatten
    tf.keras.layers.Dense(512, activation='relu'),
    tf.keras.layers.Dense(256, activation='relu'),
    tf.keras.layers.Dense(10, activation='softmax')
])`,
        validationCopy: {
          early_flatten: "Correct. Flattening immediately after the input collapses the 28×28 spatial grid into a 784-element vector, discarding all information about which pixels are neighbors. The subsequent Dense layers treat pixel (0,0) and pixel (27,27) as equally related as pixel (0,0) and pixel (0,1). Convolutional layers should process the image first — extracting spatial features — before Flatten is used to connect to the Dense classifier head.",
        },
        branches: { early_flatten: "a1_output_shape_choice" },
      },

      a1_output_shape_choice: {
        id: "a1_output_shape_choice",
        type: "scenario_choice",
        badge: "Stage 2 · Output Shape Calculation",
        title: "Stage 2 · Calculate the conv layer output shape",
        prompt: "A Conv2D layer with 32 filters of size 3×3 is applied to a 28×28×1 input with valid padding (no padding) and stride 1. What is the output shape?",
        code_snippet: `model = tf.keras.Sequential([
    tf.keras.layers.InputLayer(input_shape=(28, 28, 1)),
    tf.keras.layers.Conv2D(
        filters=32,
        kernel_size=(3, 3),
        padding='valid',  # no padding
        strides=(1, 1)
    ),
    # Output shape = ???
])`,
        choices: [
          { id: "a", label: "26×26×32", description: "Correct. With valid padding and stride 1: H_out = H_in − K + 1 = 28 − 3 + 1 = 26. Same for width. The 32 filters each produce one feature map, so depth becomes 32. Output: 26×26×32." },
          { id: "b", label: "28×28×32", description: "This would be the output with same padding (padding='same'), which zero-pads the input to preserve spatial dimensions. With valid padding (no padding), the output is smaller than the input by (K−1) = 2 in each spatial dimension." },
          { id: "c", label: "26×26×1", description: "The depth of the output is determined by the number of filters, not the input channels. 32 filters produce 32 feature maps, so depth = 32." },
          { id: "d", label: "14×14×32", description: "This would be the output after a MaxPool2D(2,2) with stride 2 applied to the conv output. The conv layer itself (stride=1, valid padding) produces 26×26×32." },
        ],
        branches: { a: "a1_maxpool_choice", b: "a1_rec_shapes", c: "a1_rec_shapes", d: "a1_rec_pooling" },
        rationale: "The formula H_out = floor((H_in − K + 2P) / S) + 1 is essential. With valid padding P=0 and stride S=1: H_out = H_in − K + 1. For 'same' padding, P = floor(K/2), giving H_out = ceil(H_in / S). Number of parameters in this layer: (3×3×1 + 1) × 32 = 320 — compare to the equivalent dense layer: 784 × input_units.",
      },

      a1_maxpool_choice: {
        id: "a1_maxpool_choice",
        type: "scenario_choice",
        badge: "Stage 3 · Pooling Strategy",
        title: "Stage 3 · Max pooling vs average pooling in early layers",
        prompt: "In the early convolutional layers of an image classifier, max pooling is almost universally preferred over average pooling. What is the primary reason?",
        code_snippet: `# Which pooling and why?
model = tf.keras.Sequential([
    tf.keras.layers.Conv2D(64, 3, activation='relu', padding='same'),
    tf.keras.layers.MaxPool2D(pool_size=2, strides=2),  # Option A
    # vs:
    # tf.keras.layers.AveragePooling2D(pool_size=2, strides=2),  # Option B
    tf.keras.layers.Conv2D(128, 3, activation='relu', padding='same'),
    # ...
])`,
        choices: [
          { id: "a", label: "Max pooling captures the strongest feature activations and is more robust to small spatial translations", description: "A conv filter produces a high activation when it detects its target feature (e.g., a vertical edge). Max pooling preserves this strong signal — 'yes, this feature was strongly present somewhere in this region' — regardless of the exact pixel position. This introduces spatial invariance. Average pooling dilutes strong activations with surrounding weaker values, potentially losing the detection signal." },
          { id: "b", label: "Max pooling reduces the feature map to fewer channels", description: "Pooling does not change the number of channels — it only reduces spatial dimensions (H and W). Both max and average pooling maintain the same channel count." },
          { id: "c", label: "Max pooling uses fewer parameters than average pooling", description: "Neither max pooling nor average pooling has trainable parameters. Both are parameter-free operations. The choice between them is about information preservation, not parameter count." },
          { id: "d", label: "Average pooling discards too much information by halving the spatial dimensions", description: "Both max and average pooling with stride 2 halve the spatial dimensions equally. The spatial downsampling ratio is the same — what differs is how information is aggregated within each pooling window." },
        ],
        branches: { a: "a1_kernel_stacking_choice", b: "a1_rec_pooling", c: "a1_rec_shapes", d: "a1_rec_pooling" },
        rationale: "Max pooling is the standard for intermediate layers. Global Average Pooling (GAP) is used at the end of modern CNNs to collapse the spatial dimensions before the classifier — it averages each feature map to a single number, creating a compact representation without the large Dense layers that follow Flatten. GAP also acts as a regularizer.",
      },

      a1_kernel_stacking_choice: {
        id: "a1_kernel_stacking_choice",
        type: "scenario_choice",
        badge: "Stage 4 · Kernel Size Trade-offs",
        title: "Stage 4 · Two 3×3 convs vs one 5×5 conv",
        prompt: "Modern CNNs (VGG, ResNet) use stacked 3×3 convolutions instead of single larger kernels. A colleague proposes replacing two stacked 3×3 conv layers with a single 5×5 conv layer, arguing they have the same receptive field. Why is the stacked approach preferred?",
        code_snippet: `# Option A: one 5x5 conv
# Receptive field: 5x5
# Params (64→64 channels): 5*5*64*64 = 102,400
layer_a = tf.keras.layers.Conv2D(64, kernel_size=5, activation='relu')

# Option B: two stacked 3x3 convs
# Receptive field: also 5x5 (3x3 then another 3x3)
# Params: 2 * (3*3*64*64) = 73,728
layer_b1 = tf.keras.layers.Conv2D(64, kernel_size=3, activation='relu')
layer_b2 = tf.keras.layers.Conv2D(64, kernel_size=3, activation='relu')`,
        choices: [
          { id: "a", label: "Two 3×3 convs have fewer parameters, more nonlinearity (two ReLUs), and learn a richer feature hierarchy", description: "Three advantages: (1) Fewer parameters: 2×(9×64×64)=73,728 vs 25×64×64=102,400 — 28% fewer. (2) Two ReLU nonlinearities instead of one, giving the network greater representational power. (3) Deeper feature hierarchy — first 3×3 learns simple features, second 3×3 composes them into more complex patterns." },
          { id: "b", label: "A single 5×5 conv is more efficient because it processes the receptive field in one pass", description: "A single pass through a 5×5 conv is slightly faster in compute, but the parameter inefficiency and loss of nonlinearity make it worse overall. This is why VGGNet (2014) moved entirely to 3×3 convs and outperformed architectures using larger kernels." },
          { id: "c", label: "Two 3×3 convs can be parallelized across GPUs but a single 5×5 conv cannot", description: "Both single and stacked conv layers can be parallelized across GPUs. GPU parallelism is not the reason to prefer stacked 3×3 convs." },
          { id: "d", label: "A 5×5 kernel cannot detect the same features as two 3×3 kernels because the mathematical operations differ", description: "Two stacked 3×3 convs do have the same 5×5 receptive field as a single 5×5 conv — and can theoretically approximate the same functions. The preference for stacked 3×3 is about parameter efficiency and nonlinearity, not an inability to detect the same features." },
        ],
        branches: { a: "a1_terminal", b: "a1_rec_pooling", c: "a1_rec_spatial", d: "a1_rec_shapes" },
        rationale: "The Simonyan & Zisserman (VGG) paper (2014) systematically showed that replacing large kernels (7×7, 5×5) with stacks of 3×3 convs improves accuracy. This principle — small kernels stacked deep — became a defining pattern of modern CNN design. ResNet, EfficientNet, and ConvNeXt all follow it.",
      },

      a1_rec_spatial: {
        id: "a1_rec_spatial",
        type: "scenario_choice",
        badge: "Recovery · Spatial Structure",
        title: "Recovery · Parameter sharing and translation invariance",
        prompt: "A CNN is trained to detect stop signs in images. After training, a stop sign at the top-left of an image is correctly classified. Why does the same CNN also correctly classify a stop sign at the bottom-right, without any additional training?",
        code_snippet: `# The same CNN model processes:
# Image A: stop sign in top-left     → correctly classified ✓
# Image B: stop sign in bottom-right → also correctly classified ✓
# The model was NOT specifically trained on bottom-right examples.
# Why?`,
        choices: [
          { id: "a", label: "Parameter sharing — the same filter weights slide across every position, so a feature learned at one location is automatically detected everywhere", description: "The filter that learned to detect stop-sign edges uses identical weights at every spatial position. When those weights slide over the bottom-right of the image, they produce the same activations as when they were over the top-left. This is translation equivariance: shift the input → the feature map shifts by the same amount. Pooling then adds invariance (small shifts don't change the pooled output)." },
          { id: "b", label: "The network memorizes all possible positions of stop signs during training", description: "CNNs do not memorize positions — they share weights across positions. A fully-connected network would need to see every position during training to generalize; a CNN gets translation equivariance for free from its architecture." },
          { id: "c", label: "Data augmentation during training ensures all positions are covered", description: "Data augmentation can help, but it is not the fundamental reason. Even without augmentation, CNNs have architectural translation equivariance from parameter sharing. The question is asking about the mechanism, not the training technique." },
        ],
        branches: { a: "a1_output_shape_choice", b: "a1_rec_spatial", c: "a1_rec_spatial" },
        rationale: "Translation equivariance (conv layers) + translation invariance (pooling layers) together explain why CNNs generalize spatially. Equivariance: the feature map output shifts when the input shifts. Invariance: pooling absorbs small shifts so the final representation is position-agnostic. This is the core inductive bias that makes CNNs so powerful for image tasks.",
      },

      a1_rec_shapes: {
        id: "a1_rec_shapes",
        type: "scenario_choice",
        badge: "Recovery · Shapes & Parameters",
        title: "Recovery · Parameter count in conv layers",
        prompt: "A Conv2D layer with 64 filters of size 3×3 processes an input with 32 channels. How many trainable parameters does this layer have (including bias terms)?",
        code_snippet: `# Conv2D layer:
# - kernel_size: 3×3
# - input_channels (C_in): 32
# - num_filters (C_out): 64
# - bias: one per filter

layer = tf.keras.layers.Conv2D(
    filters=64,
    kernel_size=(3, 3),
    use_bias=True
)
# How many parameters?`,
        choices: [
          { id: "a", label: "18,496 — (3×3×32 + 1) × 64", description: "Correct. Each filter has 3×3×32 = 288 weights (3×3 spatial, 32 input channels) plus 1 bias = 289 values. With 64 filters: 289 × 64 = 18,496 parameters. Compare to a Dense layer connecting 32-channel 28×28 input to 64 outputs: 32×28×28×64 + 64 = 1,605,696 parameters — 87× more." },
          { id: "b", label: "576 — 3×3×64", description: "This omits the input channels dimension. Each filter must cover all C_in=32 input channels — it's a 3×3×32 volume, not a 3×3 matrix. Also ignores bias terms." },
          { id: "c", label: "9,216 — 3×3×32×32 (treating output channels as input channels)", description: "The filter count (C_out=64) is not multiplied by itself. The formula is (K×K×C_in + 1) × C_out = (9×32+1)×64 = 18,496." },
        ],
        branches: { a: "a1_maxpool_choice", b: "a1_rec_shapes", c: "a1_rec_shapes" },
        rationale: "The parameter formula (K×K×C_in + 1) × C_out is worth memorizing. The +1 is the bias per filter. Notice that this does not depend on the input spatial dimensions (H_in, W_in) — the same filter slides across all positions. This is why a conv layer trained on 28×28 images can be applied to 224×224 images at test time (fully convolutional inference).",
      },

      a1_rec_pooling: {
        id: "a1_rec_pooling",
        type: "scenario_choice",
        badge: "Recovery · Pooling Mechanics",
        title: "Recovery · How pooling affects spatial dimensions",
        prompt: "A feature map of shape 26×26×32 is passed through MaxPool2D with pool_size=(2,2) and strides=(2,2). What is the output shape?",
        code_snippet: `x = tf.random.normal([1, 26, 26, 32])  # batch, H, W, channels

pool = tf.keras.layers.MaxPool2D(
    pool_size=(2, 2),
    strides=(2, 2)
)
output = pool(x)
# output.shape = ???`,
        choices: [
          { id: "a", label: "(1, 13, 13, 32) — spatial dimensions halved, channels unchanged", description: "Correct. MaxPool2D with pool_size=2 and stride=2 takes the max over each non-overlapping 2×2 window. Spatial dimensions: floor(26/2)=13 for both H and W. Channel count (32) is unchanged — pooling operates independently within each channel." },
          { id: "b", label: "(1, 13, 13, 16) — channels also halved because of the 2×2 pooling", description: "Pooling only reduces spatial dimensions (H and W). It never changes the number of channels. To change channel count, you need a conv layer (or pointwise 1×1 conv)." },
          { id: "c", label: "(1, 24, 24, 32) — spatial dimensions reduced by pool_size−1=1 in each dim", description: "This formula applies to convolutions (H_out = H_in − K + 1), not pooling. MaxPool with pool_size=2 and stride=2 halves spatial dimensions: H_out = floor(H_in / stride) = floor(26/2) = 13." },
        ],
        branches: { a: "a1_kernel_stacking_choice", b: "a1_rec_pooling", c: "a1_rec_pooling" },
        rationale: "Pooling is channel-independent — it processes each channel's spatial feature map separately. Pool size controls the window size; stride controls how far the window moves between steps. Stride=2 with pool_size=2 gives non-overlapping windows and halves each spatial dimension. With stride=1, windows overlap (used in some segmentation architectures to preserve spatial resolution).",
      },

      a1_terminal: {
        id: "a1_terminal",
        type: "scenario_choice",
        badge: "Terminal · Mastery Check",
        title: "Mastery complete · CNN expertise",
        terminal: true,
        prompt: "How does a CNN achieve translation invariance for image classification, and why does a fully-connected network lack this property?",
        code_snippet: `# CNN approach:
cnn = Sequential([
    Conv2D(32, 3, activation='relu'),   # parameter sharing
    MaxPool2D(2),                        # spatial invariance
    Conv2D(64, 3, activation='relu'),
    GlobalAveragePooling2D(),
    Dense(10, activation='softmax')
])

# FC approach:
fc = Sequential([
    Flatten(),
    Dense(512, activation='relu'),
    Dense(10, activation='softmax')
])`,
        choices: [
          { id: "a", label: "CNNs use parameter sharing (same filter at all positions) + pooling (absorbs small shifts); FC networks have independent weights per pixel so cannot generalize across locations", description: "Precisely. Parameter sharing gives translation equivariance: shift the input, the feature map shifts the same amount. Pooling converts equivariance to invariance: small shifts within the pooling window produce identical pooled outputs. An FC network has a unique weight for every (input pixel, output neuron) pair — detecting a feature at position (5,5) requires different weights than at position (10,10). It can learn translation invariance from augmented data, but it's not architecturally guaranteed." },
          { id: "b", label: "CNNs use ReLU activations which are location-invariant; FC networks use linear activations that are location-sensitive", description: "ReLU is used in both CNNs and FC networks. The activation function is not the source of translation invariance — the architecture (weight sharing + pooling) is." },
          { id: "c", label: "CNNs process the image in overlapping patches, which forces the network to see every location equally; FC networks favor earlier pixels due to their weight initialization", description: "CNN translation invariance comes from weight sharing and pooling, not from processing order or initialization. FC networks don't favor earlier pixels due to initialization either." },
        ],
        branches: { a: "a1_terminal", b: "a1_terminal", c: "a1_terminal" },
        rationale: "The architectural inductive biases of CNNs — local connectivity, weight sharing, and pooling — encode prior knowledge about images (nearby pixels are related; features appear at multiple locations) directly into the network structure. This is why CNNs need far less data and compute to learn good image representations than FC networks. It also explains why CNNs fail on non-image structured data where spatial locality is not the right inductive bias.",
      },
    },
  },
  knowledgeCheck: [
    {
      question: "A Conv2D layer with 64 filters, kernel size 5×5, is applied to a 32×32×3 input with same padding and stride 1. What is the output shape?",
      options: [
        "32×32×64 — same padding preserves spatial dimensions, 64 filters create 64 channels",
        "28×28×64 — valid padding reduces by (K−1)=4 per spatial dimension",
        "32×32×3 — same padding and stride 1 preserve the original shape including channels",
      ],
      correctIndex: 0,
      explanation: "Same padding adds zeros around the input so H_out = H_in and W_out = W_in (for stride 1). The number of output channels always equals the number of filters. So output: 32×32×64. With valid padding instead, it would be 28×28×64 (32−5+1=28).",
    },
    {
      question: "A Conv2D layer with 128 filters, kernel size 3×3, processes 64-channel input. How many trainable parameters does this layer have (with bias)?",
      options: [
        "73,856 — (3×3×64 + 1) × 128",
        "9,216 — 3×3×128×... (ignoring input channels)",
        "147,456 — 3×3×64×128 (forgetting bias terms)",
      ],
      correctIndex: 0,
      explanation: "Formula: (K×K×C_in + 1) × C_out = (9×64 + 1) × 128 = (576+1) × 128 = 577 × 128 = 73,856. The +1 is the bias per filter. The key insight: this is independent of input spatial dimensions (H, W) because of weight sharing — the same filter slides across all positions.",
    },
    {
      question: "In the early layers of an image classifier, max pooling is preferred over average pooling primarily because:",
      options: [
        "Max pooling preserves the strongest feature activations and is robust to small spatial translations of detected features",
        "Max pooling reduces the channel count, while average pooling only reduces spatial dimensions",
        "Max pooling has trainable parameters that can be optimized, unlike average pooling",
      ],
      correctIndex: 0,
      explanation: "Max pooling answers 'was this feature strongly present anywhere in this region?' — it preserves the peak activation even if the feature is slightly shifted within the pooling window. Average pooling dilutes strong activations with weaker surroundings. Neither operation changes channel count, and neither has trainable parameters. Average pooling is used as Global Average Pooling (GAP) at the network's end to aggregate spatial features before the classifier.",
    },
  ],
},

"dl-a2": {
  durationLabel: "22 min",
  outcomes: [
    "Explain why vanilla RNNs fail on long sequences due to the **vanishing gradient problem** — not as a buzzword, but mechanically.",
    "Describe the LSTM **cell state** and three gates and why they solve the gradient highway problem.",
    "Choose between RNN, LSTM, GRU, and Transformer for a given sequence modeling task based on length, latency, and compute constraints.",
    "Identify the architectural limit that makes vanilla RNNs unsuitable for sequences longer than ~50–100 steps.",
  ],
  learnMarkdown: `## Why sequences are different

Most ML models assume inputs are independent and identically distributed. Sequences break that assumption: the meaning of token t depends on tokens 1 through t-1. Language, time series, audio, DNA — all require **memory of context**.

The simplest solution is an RNN. At each time step t, it maintains a hidden state:

\`\`\`
h_t = tanh(W_h · h_{t-1} + W_x · x_t + b)
\`\`\`

The hidden state is the model's "working memory" — it's supposed to carry relevant history forward. The problem is what happens during training.

## The vanishing gradient problem

Backpropagation through time (BPTT) unrolls the RNN and computes gradients like any deep network. But the gradient for the loss at step T with respect to the hidden state at step 1 involves a product of T Jacobians:

\`\`\`
∂L/∂h_1 = ∂L/∂h_T · ∏(t=2..T) ∂h_t/∂h_{t-1}
\`\`\`

Each factor involves the derivative of tanh, which is bounded by 1. Repeated multiplication over 100 steps drives gradients toward zero exponentially fast. **The model simply cannot learn long-range dependencies** because the gradient signal from distant time steps disappears before it reaches the early parameters.

Exploding gradients are the opposite failure — when the product grows unboundedly. Gradient clipping (clip the norm to a threshold) handles this, but clipping cannot resurrect a vanished gradient.

## LSTMs: the cell state highway

The Long Short-Term Memory (LSTM) adds a **cell state** C_t — a separate memory channel that flows through the network with only minor, multiplicative interactions (unlike the hidden state which is repeatedly squashed by tanh).

Three gates control the cell state:

- **Forget gate** f_t: how much of C_{t-1} to keep. f_t ≈ 0 → clear memory; f_t ≈ 1 → preserve it.
- **Input gate** i_t: how much of the new candidate cell value to write.
- **Output gate** o_t: how much of the cell state to expose as the hidden state h_t.

\`\`\`
f_t = σ(W_f · [h_{t-1}, x_t] + b_f)
i_t = σ(W_i · [h_{t-1}, x_t] + b_i)
C̃_t = tanh(W_C · [h_{t-1}, x_t] + b_C)
C_t = f_t ⊙ C_{t-1} + i_t ⊙ C̃_t
h_t = o_t ⊙ tanh(C_t)
\`\`\`

The cell state update is additive (not multiplicative through a squashing function), so gradients can flow back hundreds of steps without vanishing. This is the fundamental architectural insight.

## GRU: LSTMs with fewer parameters

The Gated Recurrent Unit (GRU) merges the cell and hidden state and uses only two gates (reset, update). Empirically it performs similarly to LSTM on most tasks with fewer parameters — preferred when compute is constrained.

## RNN/LSTM vs Transformer

| | RNN / LSTM | Transformer |
|---|---|---|
| Sequence length | Good up to ~200 tokens | Good for 1k–100k+ tokens |
| Parallelism | Sequential — cannot parallelize | Fully parallel (O(n²) attention) |
| Training speed | Slow on long sequences | Fast with GPUs |
| Inference latency | Low (incremental) | Higher (full attention) |
| Typical use | On-device, short sequences | NLP, long context, SOTA |

For real-time streaming tasks on edge devices or short sequences (sensor data, short text), LSTMs remain competitive. For any task where Transformers are feasible, they win on accuracy.

## Interview hook (answer like a senior)

"Vanilla RNNs fail on long sequences because backprop through time multiplies Jacobians at each step — the gradient vanishes exponentially. LSTMs solve this with a cell state highway that uses additive updates and gated writes, preserving gradients over hundreds of steps. For most modern NLP the Transformer has superseded both due to full parallelism, but LSTMs remain relevant for low-latency streaming tasks on constrained hardware."`,

  video: null,
  videoFallbackMarkdown: `## Deep dive: build the LSTM intuition

### The gradient highway mental model

Think of the cell state as a conveyor belt running along the top of the network. The gates are arms that can add to or remove items from the belt. Unlike the hidden state (which gets squashed by tanh at every step), the conveyor belt can carry items unchanged from step 1 to step T.

This is why forget gate values near 1.0 during a long document mean "keep this context" — the gradient signal travels back through those 1.0 multiplications essentially intact.

### Practical LSTM gotchas

- **Stateful vs stateless**: By default, Keras resets hidden state between batches. For time series, use stateful=True and manually reset between sequences.
- **Bidirectional LSTM**: Runs one LSTM forward, one backward, concatenates hidden states. Useful when the full sequence is available (classification) but impossible for autoregressive generation.
- **Return sequences vs return state**: return_sequences=True returns h_t at every step (for stacked LSTMs or seq-to-seq). return_state=True also returns the final cell state (for encoder-decoder architectures).`,

  tryGuidance: "Use the viz to step through how the hidden state updates at each time step in a vanilla RNN, then switch to the LSTM tab to see how the forget/input/output gates control the cell state. Notice how the gradient magnitude (shown as color intensity) fades in the RNN but stays strong in the LSTM.",

  interviewGraph: {
    initialStageId: "a2_rnn_click",
    artifactDimensions: [
      { label: "Vanishing Gradient Mechanics", recoveryStageId: "a2_rec_vanish" },
      { label: "LSTM Gate Functions", recoveryStageId: "a2_rec_gates" },
      { label: "Sequence Model Selection", recoveryStageId: "a2_rec_selection", passLabel: "Sequence Architecture Mastery" },
    ],
    stages: {
      a2_rnn_click: {
        id: "a2_rnn_click",
        type: "click_target",
        badge: "Stage 1 target",
        title: "Stage 1 · Wrong cell type for long-range dependencies",
        prompt: "The model processes product reviews (avg 300 tokens) to predict sentiment. Click the line that will fail to capture long-range context.",
        code_snippet: `tokenizer = Tokenizer(num_words=10000)
sequences = tokenizer.texts_to_sequences(reviews)  # avg length 300
X = pad_sequences(sequences, maxlen=300)
model.add(SimpleRNN(128))  # ds-target:wrong_cell
model.add(Dense(1, activation='sigmoid'))`,
        validationCopy: {
          wrong_cell: "Correct. SimpleRNN fails on sequences of length 300 due to vanishing gradients — it cannot capture dependencies between the beginning and end of a review. LSTM or a Transformer is needed.",
        },
        branches: { wrong_cell: "a2_vanish_choice" },
      },
      a2_vanish_choice: {
        id: "a2_vanish_choice",
        type: "scenario_choice",
        badge: "Stage 2",
        title: "Stage 2 · Why vanilla RNNs fail on long sequences",
        prompt: "A vanilla RNN on 100 time steps has near-zero gradients in the first 20 layers during training. What is the root cause?",
        code_snippet: `# During BPTT, the gradient at step 1 involves:
# ∂L/∂h_1 ≈ ∏(t=2..100) ∂h_t/∂h_{t-1}
# Each factor involves tanh derivative, max value = ?`,
        choices: [
          { id: "a", label: "Repeated multiplication of tanh derivatives (≤1) over 100 steps → exponential decay", description: "Each step's Jacobian has spectral radius < 1; multiplied 100 times → gradient vanishes." },
          { id: "b", label: "The learning rate is too high for long sequences", description: "Learning rate affects step size, not whether gradients exist at all positions." },
          { id: "c", label: "Weight initialization causes the gradients to start near zero", description: "Initialization affects magnitude at step 0; the vanishing problem compounds over time regardless of initialization." },
          { id: "d", label: "Batch size is too small for long sequences", description: "Batch size affects gradient noise but not the fundamental vanishing gradient problem." },
        ],
        branches: { a: "a2_lstm_gate_choice", b: "a2_rec_vanish", c: "a2_rec_vanish", d: "a2_rec_vanish" },
        rationale: "The vanishing gradient is a product of T Jacobians. Each ∂h_t/∂h_{t-1} involves the derivative of tanh (bounded by 1). Over 100 steps, values like 0.9^100 ≈ 2.6×10^{-5} — effectively zero.",
      },
      a2_rec_vanish: {
        id: "a2_rec_vanish",
        type: "scenario_choice",
        badge: "Recovery 1",
        title: "Recovery · Vanishing gradient mechanics",
        prompt: "Which architectural change in LSTM directly prevents the vanishing gradient (not just slows it)?",
        code_snippet: `# LSTM cell state update:
# C_t = f_t ⊙ C_{t-1} + i_t ⊙ C̃_t
# Compare to RNN: h_t = tanh(W · h_{t-1} + ...)`,
        choices: [
          { id: "a", label: "Additive cell state update — gradient flows back through additions, not multiplications through tanh", description: "The cell state update is additive: gradient ∂C_t/∂C_{t-1} = f_t (a value, not squashed through tanh). With f_t ≈ 1, gradient passes through unchanged." },
          { id: "b", label: "LSTM uses ReLU activations instead of tanh", description: "LSTM gates still use sigmoid and the cell update uses tanh. The key difference is the cell state highway, not the activation." },
          { id: "c", label: "LSTM has more parameters so gradients are larger", description: "More parameters doesn't prevent vanishing gradients — the issue is the multiplicative path through squashing functions." },
        ],
        branches: { a: "a2_lstm_gate_choice", b: "a2_rec_vanish", c: "a2_rec_vanish" },
        rationale: "The cell state update C_t = f_t ⊙ C_{t-1} + i_t ⊙ C̃_t means ∂C_t/∂C_{t-1} = f_t, which can be close to 1. Gradients travel back through this additive path without repeated tanh squashing.",
      },
      a2_lstm_gate_choice: {
        id: "a2_lstm_gate_choice",
        type: "scenario_choice",
        badge: "Stage 3",
        title: "Stage 3 · LSTM gate behavior",
        prompt: "Mid-sequence in a text classification task, the forget gate outputs 0.02 for all positions. What is the model doing?",
        code_snippet: `# Forget gate: f_t = σ(W_f · [h_{t-1}, x_t] + b_f)
# Cell state: C_t = f_t ⊙ C_{t-1} + ...
# f_t ≈ 0.02 → C_t ≈ ?`,
        choices: [
          { id: "a", label: "Erasing almost all prior cell state — treating the current position as a fresh start", description: "C_t = 0.02 × C_{t-1} + new content ≈ entirely new content. This is appropriate when context resets (e.g., new sentence, topic shift)." },
          { id: "b", label: "Preserving nearly all prior cell state unchanged", description: "Forget gate near 0 erases, near 1 preserves. 0.02 means almost everything is forgotten." },
          { id: "c", label: "Blocking all new information from being written to cell state", description: "That's the input gate, not the forget gate. The forget gate only controls how much of C_{t-1} survives." },
          { id: "d", label: "Forcing the hidden state output to zero", description: "The output gate controls h_t. The forget gate only affects C_{t-1} retention." },
        ],
        branches: { a: "a2_seq_selection_choice", b: "a2_rec_gates", c: "a2_rec_gates", d: "a2_rec_gates" },
        rationale: "Forget gate = 0.02 means C_t ≈ 0.02 × C_{t-1} + new_content — the model effectively resets its memory. This is learned behavior at positions where history is irrelevant.",
      },
      a2_rec_gates: {
        id: "a2_rec_gates",
        type: "scenario_choice",
        badge: "Recovery 2",
        title: "Recovery · LSTM gates",
        prompt: "Which gate controls how much new information is written to the cell state (not how much old information is kept)?",
        code_snippet: `# The 3 gates:
# f_t = σ(...)  → controls retention of C_{t-1}
# i_t = σ(...)  → controls writing of C̃_t
# o_t = σ(...)  → controls reading from C_t to h_t`,
        choices: [
          { id: "a", label: "Input gate i_t — scales how much of the candidate cell value C̃_t is written", description: "C_t = f_t ⊙ C_{t-1} + i_t ⊙ C̃_t. The input gate scales the new candidate." },
          { id: "b", label: "Forget gate f_t", description: "Forget gate controls how much of C_{t-1} survives — it's about retention, not new writes." },
          { id: "c", label: "Output gate o_t", description: "Output gate controls what gets exposed as the hidden state h_t — it reads from the cell, doesn't write to it." },
        ],
        branches: { a: "a2_seq_selection_choice", b: "a2_rec_gates", c: "a2_rec_gates" },
        rationale: "The input gate i_t (multiplied by the candidate C̃_t) controls how much new information enters the cell state. Forget gate = what old info to keep; input gate = what new info to add.",
      },
      a2_seq_selection_choice: {
        id: "a2_seq_selection_choice",
        type: "scenario_choice",
        badge: "Stage 4",
        title: "Stage 4 · Sequence model selection",
        prompt: "Real-time anomaly detection on IoT sensor streams: 50-value sequences, must run on a microcontroller at <10ms latency. Which architecture?",
        code_snippet: `# Constraints:
# - Sequence length: 50 time steps
# - Device: ARM Cortex-M4 (no GPU)
# - Latency requirement: <10ms per inference
# - Training data: 500k labeled sequences`,
        choices: [
          { id: "a", label: "LSTM — short sequences, low-latency incremental inference, deployable on-device", description: "Sequence length 50 is well within LSTM's capability. LSTM runs incrementally (update state per new value), has tiny memory footprint, and can be quantized to run on microcontrollers." },
          { id: "b", label: "Transformer — best accuracy on sequence tasks", description: "Transformers need full sequence present at once (O(n²) attention), need GPU for reasonable latency, and are too large for microcontrollers." },
          { id: "c", label: "GRU — same as LSTM but fewer parameters is always better", description: "GRU would also work here, but 'fewer parameters is always better' is wrong — LSTM may learn better with the extra capacity. Both are valid; the key argument is against Transformer." },
          { id: "d", label: "Vanilla RNN — simplest model, best for microcontrollers", description: "Vanilla RNN would work at length 50 (vanishing gradient is less severe), but LSTM is the standard choice since it handles variable-length dependencies better without much overhead." },
        ],
        branches: { a: "a2_terminal", b: "a2_rec_selection", c: "a2_terminal", d: "a2_rec_selection" },
        rationale: "LSTM (or GRU) is the right call: short sequence avoids the vanishing gradient limit, incremental inference fits real-time requirements, and the model is small enough for edge deployment. Transformer is overkill and impractical here.",
      },
      a2_rec_selection: {
        id: "a2_rec_selection",
        type: "scenario_choice",
        badge: "Recovery 3",
        title: "Recovery · Sequence model trade-offs",
        prompt: "Transformers replaced RNNs for most NLP tasks. Which limitation of RNNs does the Transformer most directly address?",
        code_snippet: `# RNN: h_t depends on h_{t-1} → sequential, cannot parallelize
# Transformer: all positions attend to all positions simultaneously`,
        choices: [
          { id: "a", label: "Sequential dependency — RNNs can't be parallelized during training; Transformers process all positions simultaneously", description: "This is the primary win: full GPU parallelism during training. Self-attention is O(n²) in memory but O(1) in sequential steps." },
          { id: "b", label: "RNNs can't handle variable-length sequences", description: "RNNs handle variable-length sequences naturally — they process step by step. Padding is needed but that's not the architectural limitation." },
          { id: "c", label: "RNNs are always slower at inference than Transformers", description: "At inference time, RNNs are actually faster for streaming (one step at a time). Transformers need full context for each prediction." },
        ],
        branches: { a: "a2_terminal", b: "a2_rec_selection", c: "a2_rec_selection" },
        rationale: "The killer feature of Transformers is full parallelism: all tokens are processed simultaneously during training, enabling orders-of-magnitude faster training on long sequences with modern GPU hardware.",
      },
      a2_terminal: {
        id: "a2_terminal",
        type: "scenario_choice",
        badge: "Terminal",
        title: "Revision complete · Sequence modeling mastered",
        terminal: true,
        prompt: "An LSTM model is trained on financial news (avg 400 tokens) for market sentiment. Training loss drops but validation performance plateaus after epoch 3. The forget gates are near 0.9 throughout. What does the forget gate value tell you, and what would you try next?",
        code_snippet: `# Forget gates ≈ 0.9 throughout training
# Train loss: 0.45 → 0.18 (epoch 1-10)
# Val loss: 0.48 → 0.41 → 0.40 (plateau)`,
        choices: [
          { id: "a", label: "Forget gates near 0.9 = model is retaining most context across the 400-token sequence. Plateau = overfitting. Try dropout, L2 regularization, or switch to a Transformer for better long-range modeling.", description: "Forget gate 0.9 means the cell state carries information far back — the model is trying to use long-range context. Plateau with dropping train loss = overfitting. Regularization or a more expressive architecture are the right next steps." },
          { id: "b", label: "Forget gates near 0.9 = bad — the model is not forgetting enough irrelevant context. Lower the learning rate.", description: "High forget gate values are often correct behavior for long documents — the model needs distant context. The plateau is an overfitting issue, not a forget gate issue." },
          { id: "c", label: "The model needs more LSTM units — increase hidden size from 128 to 512.", description: "More units increases capacity but won't address overfitting (plateaued val loss). Adding parameters to an overfitting model makes it worse." },
        ],
        branches: { a: "a2_terminal", b: "a2_terminal", c: "a2_terminal" },
        rationale: "Forget gate ≈ 0.9 is informative: the model is preserving cell state over long distances, which is appropriate for 400-token news articles. The train/val gap indicates overfitting — add dropout (Keras LSTM has a recurrent_dropout parameter), reduce model size, or upgrade to a Transformer which handles long sequences more efficiently.",
      },
    },
  },

  knowledgeCheck: [
    {
      question: "Why does a vanilla RNN fail to learn dependencies between tokens 1 and 300 in a 300-token sequence?",
      options: [
        "Gradients vanish exponentially when backpropagated through 300 tanh-squashed time steps",
        "RNNs can only process sequences up to 100 tokens by design",
        "The hidden state dimension is too small to store 300 tokens of context",
      ],
      correctIndex: 0,
      explanation: "BPTT multiplies Jacobians at each step. Each involves the tanh derivative (max 0.25), so gradients decay exponentially over 300 steps — effectively zero long before they reach step 1.",
    },
    {
      question: "An LSTM forget gate outputs 0.01 for a specific time step. What does this mean for the cell state?",
      options: [
        "The cell state is almost entirely erased at this step — the model treats it as a fresh start",
        "The cell state is preserved unchanged — the model is in 'remember everything' mode",
        "The output gate is preventing the cell state from influencing the hidden state",
      ],
      correctIndex: 0,
      explanation: "C_t = 0.01 × C_{t-1} + i_t × C̃_t ≈ i_t × C̃_t. Nearly all prior cell state is discarded — appropriate at topic boundaries or sentence breaks.",
    },
    {
      question: "You need to classify documents up to 2,000 tokens. LSTM or Transformer?",
      options: [
        "Transformer — self-attention directly connects any two positions in O(1) steps regardless of distance",
        "LSTM — it has been proven to handle longer sequences than Transformers",
        "Either works identically at 2,000 tokens",
      ],
      correctIndex: 0,
      explanation: "At 2,000 tokens, LSTM's vanishing gradient and sequential processing are real limitations. Transformers attend to all positions simultaneously and are the standard choice for long-document tasks when compute is available.",
    },
  ],
},

"dl-a3": {
  durationLabel: "30 min",
  outcomes: [
    "Explain the **query-key-value attention mechanism** and why it enables direct long-range dependency modeling.",
    "Distinguish encoder-only (BERT), decoder-only (GPT), and encoder-decoder (T5) Transformer architectures and their appropriate use cases.",
    "Identify the **O(n²) attention complexity** bottleneck and name two approaches that address it for long contexts.",
    "Explain why positional encoding is required and how learned vs. sinusoidal encodings differ.",
  ],
  learnMarkdown: `## The problem Transformers were designed to solve

RNNs process sequences one token at a time — they cannot be parallelized and struggle with dependencies spanning hundreds of tokens. The 2017 paper "Attention Is All You Need" proposed replacing recurrence entirely with **self-attention**: every position attends to every other position simultaneously.

This one change unlocked three things:
1. **Full parallelism** — all positions computed simultaneously on GPU
2. **Direct long-range connections** — no vanishing gradient over distance
3. **Scalability** — just add more layers, heads, and parameters

## The attention mechanism

Attention takes three inputs for each token: a **Query** (what am I looking for?), a **Key** (what do I contain?), and a **Value** (what do I contribute?). For a sequence of n tokens:

\`\`\`
Attention(Q, K, V) = softmax(QK^T / √d_k) · V
\`\`\`

The dot product QK^T produces an n×n matrix of attention scores — how much each token should attend to every other token. Dividing by √d_k prevents softmax saturation. The softmax produces weights that sum to 1 per row, which are used to aggregate Values.

**Key insight**: The cost is O(n²) in both compute and memory — a 10,000-token sequence requires 100 million attention pairs. This is why long-context Transformers require sparse attention or other approximations.

## Multi-head attention

Rather than a single attention operation, Transformers use H parallel attention heads, each projecting into a smaller subspace:

\`\`\`
MultiHead(Q,K,V) = Concat(head_1, ..., head_H) · W_O
\`\`\`

Different heads learn different relationship types: one might specialize in syntactic structure, another in semantic similarity, another in positional proximity. The multi-head output is a richer representation than any single attention could provide.

## Positional encoding

Self-attention is **permutation-invariant** — shuffle the tokens and get the same attention weights (just reordered). This means the model has no sense of order without an explicit signal. Positional encodings add position information to each token's embedding:

- **Sinusoidal** (original paper): deterministic, generalizes to lengths longer than training
- **Learned**: trainable embeddings per position — simpler, but hard to generalize beyond max training length
- **RoPE / ALiBi** (modern): rotary or bias-based, better length generalization — used in LLaMA, GPT-NeoX

## Three Transformer variants

| Architecture | Training objective | Use case |
|---|---|---|
| Encoder-only (BERT) | Masked Language Modeling | Classification, NER, sentence embeddings |
| Decoder-only (GPT) | Next-token prediction | Text generation, chat, completion |
| Encoder-decoder (T5, BART) | Seq-to-seq | Translation, summarization, Q&A |

BERT is bidirectional — it sees both left and right context for each token. This makes it excellent for understanding tasks but impossible to use for autoregressive generation. GPT is unidirectional (causal mask) — each token only attends to previous tokens, enabling step-by-step generation.

## Interview hook (answer like a senior)

"Transformers replaced RNNs because self-attention connects any two positions in a single layer — there's no path length proportional to sequence distance, so gradients flow freely and the architecture trains orders of magnitude faster on GPUs. The cost is O(n²) attention, which is why long-context models require sparse or linear attention approximations. BERT uses masked LM to build bidirectional representations; GPT uses causal language modeling for generation — the choice of objective creates fundamentally different models from the same architecture."`,

  video: null,
  videoFallbackMarkdown: `## Deep dive: build the attention intuition

### The bank analogy for Q/K/V

Think of a library. You walk in with a **query** ("books about gradient descent"). Each book has a **key** on its spine (title/topic tags). You compute relevance scores (dot products), pick the highest-scoring books, and combine their **values** (actual content) weighted by relevance. That's attention.

In the model, Q, K, V are linear projections of the same input — the model learns what to look for (Q), how to label itself (K), and what to contribute when attended to (V).

### Why scaled dot product?

Without the √d_k scaling, large d_k causes dot products to grow large, pushing softmax into saturation regions where gradients become tiny. The scale keeps variance stable regardless of embedding dimension.

### The causal mask in GPT

GPT uses a lower-triangular mask: position t can only attend to positions 1..t. This enforces autoregressive generation — the model cannot "cheat" by looking at future tokens during training. At inference, tokens are generated one at a time, each conditioning on all previous.`,

  tryGuidance: "Use the Attention visualization to trace how a query token attends to key tokens. Try sentences with coreference (pronouns) — notice how the model learns to attend across long distances. Toggle multi-head mode to see different heads specializing in different relationship types.",

  interviewGraph: {
    initialStageId: "a3_pos_enc_click",
    artifactDimensions: [
      { label: "Attention Mechanics", recoveryStageId: "a3_rec_attention" },
      { label: "Architecture Variants", recoveryStageId: "a3_rec_variants" },
      { label: "Complexity & Scale", recoveryStageId: "a3_rec_complexity", passLabel: "Transformer Architecture Mastery" },
    ],
    stages: {
      a3_pos_enc_click: {
        id: "a3_pos_enc_click",
        type: "click_target",
        badge: "Stage 1 target",
        title: "Stage 1 · Missing positional encoding",
        prompt: "A Transformer built for sentence classification. Click the line whose absence makes all token positions indistinguishable.",
        code_snippet: `embedding = Embedding(vocab_size, d_model)(tokens)
# positional encoding omitted here  # ds-target:missing_pos_enc
x = MultiHeadAttention(num_heads=8, key_dim=64)(embedding, embedding)
x = LayerNormalization()(x + embedding)
output = Dense(num_classes, activation='softmax')(x[:, 0, :])`,
        validationCopy: {
          missing_pos_enc: "Correct. Without positional encoding, self-attention is permutation-invariant — 'The cat sat on the mat' and 'mat the on sat cat The' produce identical attention outputs. Position information must be explicitly injected.",
        },
        branches: { missing_pos_enc: "a3_attn_complexity_choice" },
      },
      a3_attn_complexity_choice: {
        id: "a3_attn_complexity_choice",
        type: "scenario_choice",
        badge: "Stage 2",
        title: "Stage 2 · Attention complexity bottleneck",
        prompt: "A Transformer with standard self-attention processes a 4,096-token legal document. What's the primary bottleneck compared to processing a 512-token document?",
        code_snippet: `# Attention matrix: n × n for sequence length n
# n=512:  512² =   262,144 pairs
# n=4096: 4096² = 16,777,216 pairs`,
        choices: [
          { id: "a", label: "O(n²) memory and compute — 64× more attention pairs, GPU memory explodes", description: "4096² / 512² = 64×. Both memory (storing the full attention matrix) and compute scale quadratically. This is why models like Longformer use sparse attention for long documents." },
          { id: "b", label: "More tokens means more gradient updates — training is slower", description: "Training speed is affected by many factors, but the fundamental bottleneck is the O(n²) attention matrix size, not gradient count." },
          { id: "c", label: "The vocabulary size must increase for longer documents", description: "Vocabulary size is independent of sequence length." },
          { id: "d", label: "Position embeddings run out past 512 tokens", description: "Standard sinusoidal encodings generalize beyond training length; learned embeddings do have this issue, but it's separate from the core complexity bottleneck." },
        ],
        branches: { a: "a3_bert_gpt_choice", b: "a3_rec_attention", c: "a3_rec_attention", d: "a3_rec_attention" },
        rationale: "Self-attention computes n² dot products and stores an n×n matrix. At n=4096, that's 64× the memory vs n=512. This is why long-context models use sliding window attention (Longformer), linear attention approximations, or chunking strategies.",
      },
      a3_rec_attention: {
        id: "a3_rec_attention",
        type: "scenario_choice",
        badge: "Recovery 1",
        title: "Recovery · Attention mechanics",
        prompt: "In scaled dot-product attention, what is the purpose of dividing QK^T by √d_k?",
        code_snippet: `# Attention(Q, K, V) = softmax(QK^T / √d_k) · V
# d_k = key dimension (e.g. 64)`,
        choices: [
          { id: "a", label: "Prevent softmax saturation — large dot products push softmax into near-zero gradient regions", description: "As d_k grows, dot products grow in magnitude. Dividing by √d_k keeps variance ≈ 1, preventing softmax from producing near-uniform or near-one-hot distributions prematurely." },
          { id: "b", label: "Normalize attention weights to sum to 1 per row", description: "That's done by softmax itself. The √d_k scaling happens before softmax, for a different reason." },
          { id: "c", label: "Reduce the number of attention parameters", description: "√d_k is a scalar constant — it doesn't change the parameter count." },
        ],
        branches: { a: "a3_bert_gpt_choice", b: "a3_rec_attention", c: "a3_rec_attention" },
        rationale: "Without √d_k scaling, high-dimensional embeddings produce large dot products, pushing softmax into saturation. Dividing by √d_k (standard deviation of a random dot product) keeps values in the soft-attention region where gradients are informative.",
      },
      a3_bert_gpt_choice: {
        id: "a3_bert_gpt_choice",
        type: "scenario_choice",
        badge: "Stage 3",
        title: "Stage 3 · BERT vs GPT architecture choice",
        prompt: "You need to build a named entity recognition (NER) system — labeling each token as person/org/location/other. BERT or GPT?",
        code_snippet: `# NER: label each token with a class
# Input: "Apple Inc. was founded by Steve Jobs"
# Output: [ORG, ORG, O, O, O, O, PER, PER]`,
        choices: [
          { id: "a", label: "BERT — encoder-only, bidirectional context, ideal for per-token classification tasks", description: "BERT processes each token with full left and right context (bidirectional). NER benefits from seeing what comes after a token ('Jobs' is a person because 'Steve' precedes it and nothing follows suggesting otherwise). Fine-tune a token classification head on top." },
          { id: "b", label: "GPT — larger models generally perform better on all tasks", description: "GPT's causal mask means each token only sees left context. For NER this misses right-context signals. Model size matters, but architecture fit matters more." },
          { id: "c", label: "Encoder-decoder (T5) — always the most flexible choice", description: "T5 can do NER framed as seq-to-seq, but it's overkill and slower than a BERT-style token classifier for this task." },
          { id: "d", label: "GPT — its next-token prediction pre-training teaches it to understand entity boundaries", description: "GPT learns language structure, but its unidirectional attention is a structural disadvantage for token-level tasks that need full context." },
        ],
        branches: { a: "a3_multihead_choice", b: "a3_rec_variants", c: "a3_rec_variants", d: "a3_rec_variants" },
        rationale: "BERT is the natural choice for token classification: bidirectional attention means each token's representation encodes full sentence context. GPT's causal mask limits it to left context only, which is a disadvantage for tasks where right context is informative.",
      },
      a3_rec_variants: {
        id: "a3_rec_variants",
        type: "scenario_choice",
        badge: "Recovery 2",
        title: "Recovery · Transformer architecture variants",
        prompt: "You need to build a system that takes a long English paragraph and outputs a 2-sentence summary. Which Transformer variant?",
        code_snippet: `# Input: long paragraph (variable length)
# Output: short summary (different length)
# Task type: sequence → sequence (different output length)`,
        choices: [
          { id: "a", label: "Encoder-decoder (T5, BART) — designed for input-output sequences of different lengths", description: "Seq-to-seq tasks with different input/output lengths are the natural home for encoder-decoder models. The encoder builds a compressed representation; the decoder generates the summary autoregressively." },
          { id: "b", label: "Encoder-only (BERT) — encode the paragraph, truncate to 2 sentences", description: "BERT produces token-level representations, not generated text. You can't generate summaries by truncating BERT output." },
          { id: "c", label: "Decoder-only (GPT) — frame it as completion: 'paragraph → summary:'", description: "GPT can do summarization via prompting, but it's less efficient than an encoder-decoder which explicitly compresses the input into a representation the decoder can cross-attend to." },
        ],
        branches: { a: "a3_multihead_choice", b: "a3_rec_variants", c: "a3_rec_variants" },
        rationale: "Summarization is a canonical seq-to-seq task. Encoder-decoder models (T5, BART, PEGASUS) were specifically designed and pre-trained for this pattern — they compress the full input in the encoder, then generate variable-length output in the decoder.",
      },
      a3_multihead_choice: {
        id: "a3_multihead_choice",
        type: "scenario_choice",
        badge: "Stage 4",
        title: "Stage 4 · Multi-head attention purpose",
        prompt: "A Transformer uses 12 attention heads. At inference, you visualize head 3 and head 7. Head 3 mostly attends to the previous token; head 7 attends to the subject of the sentence regardless of distance. What does this indicate?",
        code_snippet: `# 12 heads, each with d_k = 64 (d_model = 768)
# head_3: strong attention to position t-1 (local)
# head_7: strong attention to sentence subject (long-range)`,
        choices: [
          { id: "a", label: "Different heads specialize in different relationship types — multi-head attention learns a richer, multi-aspect representation", description: "This is the intended behavior: each head projects to a different subspace and learns to capture a different linguistic or structural relationship. The outputs are concatenated to give a joint representation." },
          { id: "b", label: "This is a training instability — all heads should attend to the same positions", description: "Head specialization is a feature, not a bug. Diversity of attention patterns is what makes multi-head attention more expressive than a single large head." },
          { id: "c", label: "Head 3 is underfitting because it only looks one position back", description: "Local attention heads (focusing on nearby tokens) are valuable for capturing syntactic patterns like subject-verb agreement across short spans." },
          { id: "d", label: "12 heads is too many — reduce to 1 to eliminate redundant computation", description: "Fewer heads means less representational diversity. 12 heads (as in BERT-base) is a standard architecture choice backed by empirical performance." },
        ],
        branches: { a: "a3_terminal", b: "a3_rec_complexity", c: "a3_rec_complexity", d: "a3_rec_complexity" },
        rationale: "Multi-head attention is specifically designed to allow different heads to learn different relationship types in parallel. Head specialization (local vs. long-range, syntactic vs. semantic) is a key empirical finding — it's why multi-head consistently outperforms single-head with equivalent parameter count.",
      },
      a3_rec_complexity: {
        id: "a3_rec_complexity",
        type: "scenario_choice",
        badge: "Recovery 3",
        title: "Recovery · Attention complexity",
        prompt: "A startup wants to run a Transformer on 100,000-token legal contracts in real time. Standard self-attention fails. What's the architectural approach?",
        code_snippet: `# Standard attention: O(n²) memory
# n=100,000 → 10^10 attention pairs
# At fp16: ~20TB memory just for attention matrix`,
        choices: [
          { id: "a", label: "Sparse / sliding window attention — only attend to local windows + selected global tokens", description: "Longformer, BigBird: each token attends to a fixed local window (e.g., 512 tokens) plus a few global tokens. O(n) instead of O(n²). FlashAttention also reduces memory via tiling." },
          { id: "b", label: "Just use a larger GPU", description: "At 100k tokens, even an 80GB A100 cannot fit the standard attention matrix. Hardware cannot solve an algorithmic scaling problem of this magnitude." },
          { id: "c", label: "Reduce vocabulary size to shrink the model", description: "Vocabulary size is unrelated to the attention complexity over sequence length." },
        ],
        branches: { a: "a3_terminal", b: "a3_rec_complexity", c: "a3_rec_complexity" },
        rationale: "For very long sequences, O(n²) attention is infeasible. Sparse attention (Longformer, BigBird) restricts each token to attend only to a local window and designated global tokens, reducing complexity to O(n). FlashAttention achieves the same outputs as standard attention but with O(n) memory via careful tiling.",
      },
      a3_terminal: {
        id: "a3_terminal",
        type: "scenario_choice",
        badge: "Terminal",
        title: "Revision complete · Transformer architecture mastered",
        terminal: true,
        prompt: "Explain the key architectural difference between BERT and GPT, and give one task each is better suited for — in 3 sentences or fewer.",
        code_snippet: `# BERT: bidirectional encoder, masked LM pre-training
# GPT: causal decoder, next-token prediction pre-training`,
        choices: [
          { id: "a", label: "BERT is bidirectional (sees full context per token) → best for classification/NER/QA. GPT is causal (left context only) → best for generation. Both are Transformers but trained with different objectives creating fundamentally different representations.", description: "Complete and accurate — captures the architectural difference (attention mask), the training objective difference, and the task implication." },
          { id: "b", label: "BERT is bigger so it's better for classification; GPT is smaller so it's better for generation", description: "Model size is not the defining difference — the attention mask and pre-training objective are." },
          { id: "c", label: "They are the same architecture with different fine-tuning data", description: "The causal mask in GPT vs. bidirectional attention in BERT creates fundamentally different token representations, not just different fine-tuning behavior." },
        ],
        branches: { a: "a3_terminal", b: "a3_terminal", c: "a3_terminal" },
        rationale: "BERT uses a bidirectional (unmasked) encoder — every token attends to every other token, giving context-rich representations ideal for understanding tasks (classification, NER, QA). GPT uses a causal decoder — each token only attends to previous tokens, which naturally supports autoregressive text generation. The pre-training objectives (masked LM vs. next-token prediction) reinforce these different capabilities.",
      },
    },
  },

  knowledgeCheck: [
    {
      question: "Why is positional encoding required in a Transformer but not in an RNN?",
      options: [
        "Self-attention is permutation-invariant — without position encoding, 'cat sat mat' and 'mat cat sat' produce identical outputs",
        "Transformers use larger vocabularies that require position-aware embeddings",
        "RNNs also require positional encoding but it is implicit in the recurrent weights",
      ],
      correctIndex: 0,
      explanation: "Self-attention computes dot products between all pairs of tokens regardless of order. Without an explicit position signal, the model has no way to distinguish token order. RNNs inherently encode position through the sequential hidden state update.",
    },
    {
      question: "What does the O(n²) complexity of self-attention refer to?",
      options: [
        "The number of attention score computations grows quadratically with sequence length",
        "The model needs n² training examples to learn n attention patterns",
        "The number of parameters in the Transformer grows quadratically with vocabulary size",
      ],
      correctIndex: 0,
      explanation: "For a sequence of n tokens, each token computes a dot product with every other token — n² operations total. Memory required to store the attention matrix is also O(n²), which becomes prohibitive for n > a few thousand tokens.",
    },
    {
      question: "You need to generate product descriptions from structured feature data (price, category, specs). Which Transformer variant?",
      options: [
        "Encoder-decoder — encodes the structured input, decodes to natural language output",
        "Encoder-only (BERT) — best for text generation tasks",
        "A decoder-only model trained only on descriptions with no input conditioning",
      ],
      correctIndex: 0,
      explanation: "Generating text from a structured input of a different format is a seq-to-seq task. Encoder-decoder models (T5, BART) are designed for exactly this: the encoder compresses the structured input, and the decoder generates the output text via cross-attention to the encoder's representation.",
    },
  ],
},

"dl-a4": {
  durationLabel: "18 min",
  outcomes: [
    "Choose between **feature extraction** and **fine-tuning** based on dataset size and domain similarity.",
    "Explain why fine-tuning at a high learning rate causes **catastrophic forgetting** of pretrained weights.",
    "Apply **discriminative learning rates** — lower LR for early layers, higher for later layers.",
    "Describe parameter-efficient fine-tuning (LoRA) and when it is preferred over full fine-tuning.",
  ],
  learnMarkdown: `## Why transfer learning works

Training a deep network from scratch requires vast data and compute. But the lower layers of any network trained on a large, diverse dataset learn surprisingly general features: edges and textures in vision models; token co-occurrence patterns in language models. These features are reusable.

Transfer learning copies a **pretrained model** and adapts it to a new task, letting you benefit from millions of training examples you never had to collect.

## The three strategies

### Feature extraction (freeze everything)

Freeze all pretrained weights. Add a new classification head (or MLP) on top. Only train the head.

**When**: small target dataset (< a few thousand examples), or when target domain is very similar to pretraining domain (e.g., fine-tuning an ImageNet model for a different object category).

**Risk**: if your task is sufficiently different, frozen features may not be expressive enough.

### Partial fine-tuning (unfreeze top N layers)

Freeze early layers (generic features); unfreeze and retrain later layers (task-specific features). Use a small learning rate (1e-5 to 1e-4) to avoid destroying pretrained representations.

**When**: moderate-size dataset, domain shift exists but isn't extreme.

### Full fine-tuning (unfreeze all layers)

Train all weights, with a very low learning rate. Early layers change slowly (they're good already); later layers adapt more aggressively.

**When**: large target dataset, domain shift is significant (e.g., adapting a general LLM to medical records).

**Risk**: catastrophic forgetting — if LR is too high, gradient updates overwrite pretrained knowledge, often performing worse than feature extraction on small data.

## Discriminative learning rates

Different layers need different learning rates:

\`\`\`
layer_1_lr = base_lr / 100    # almost frozen
layer_2_lr = base_lr / 10     # gentle updates
layer_3_lr = base_lr          # full updates (task-specific head)
\`\`\`

Early layers encode low-level, general features (edges, syntax) — a small LR preserves them. Later layers encode high-level, task-specific features — a larger LR lets them adapt quickly.

## LoRA: parameter-efficient fine-tuning

Full fine-tuning of a 7B-parameter LLM requires updating all 7B parameters — expensive in compute and memory. LoRA (Low-Rank Adaptation) instead adds small trainable rank-decomposition matrices alongside the frozen original weights:

\`\`\`
W' = W_frozen + ΔW
ΔW = A · B   where A is (d × r), B is (r × k), r << min(d, k)
\`\`\`

With rank r=8 and d=k=4096, ΔW has 8×2×4096 = 65,536 parameters instead of 4096² = 16.7M. LoRA reduces trainable parameters by 100–10,000× while matching full fine-tuning on most benchmarks. It's the standard approach for fine-tuning large language models.

## Interview hook (answer like a senior)

"Transfer learning reuses pretrained feature hierarchies rather than learning from scratch. The key decision is how much to unfreeze: frozen (feature extraction) for small data or similar domains; partially or fully fine-tuned for larger data or domain shift. The critical constraint is learning rate — fine-tuning at a high LR causes catastrophic forgetting of pretrained representations. For large language models, LoRA reduces this to training <1% of parameters with comparable task performance."`,

  video: null,
  videoFallbackMarkdown: `## Deep dive: the domain shift spectrum

### How to think about domain similarity

Pretrained model → target task combinations fall on a 2D grid:

| | Similar domain | Different domain |
|---|---|---|
| Large dataset | Fine-tune all layers | Fine-tune all layers carefully |
| Small dataset | Feature extraction | Try feature extraction; augment aggressively |

When target domain is very different and you have little data, you're in trouble — feature extraction may not work (wrong features) and fine-tuning will overfit. Collect more data or find a more similar pretrained model.

### Why catastrophic forgetting happens

A pretrained model's weights encode a complex, high-dimensional representation of its training distribution. A high learning rate on a new task's gradient descent takes large steps in weight space — large enough to walk far from the pretrained solution. The new task doesn't have enough signal to rebuild the general representation from scratch, so you end up with a model that partially learns the new task while forgetting the pretrained features entirely.

The fix: small LR keeps you close to the pretrained solution while nudging the weights toward the new task — you're in the "fine-tuning" regime, not the "retraining" regime.`,

  tryGuidance: "Use the Transfer Learning viz to adjust how many layers are frozen. Observe the parameter count change and the learning rate strategy for each configuration. Switch between the three strategies and read the trade-off cards — try to predict the right strategy before reading the recommendation.",

  interviewGraph: {
    initialStageId: "a4_lr_click",
    artifactDimensions: [
      { label: "Fine-Tuning Strategy Selection", recoveryStageId: "a4_rec_strategy" },
      { label: "Catastrophic Forgetting", recoveryStageId: "a4_rec_forgetting" },
      { label: "Parameter-Efficient Methods", recoveryStageId: "a4_rec_lora", passLabel: "Transfer Learning Mastery" },
    ],
    stages: {
      a4_lr_click: {
        id: "a4_lr_click",
        type: "click_target",
        badge: "Stage 1 target",
        title: "Stage 1 · Fine-tuning with a destructively high learning rate",
        prompt: "A pretrained ResNet-50 is being fine-tuned on 500 medical X-ray images. Click the line that will cause catastrophic forgetting of pretrained ImageNet features.",
        code_snippet: `base_model = ResNet50(weights='imagenet', include_top=False)
base_model.trainable = True
optimizer = Adam(learning_rate=0.01)  # ds-target:high_lr
model.compile(optimizer=optimizer, loss='binary_crossentropy')
model.fit(x_train, y_train, epochs=20)`,
        validationCopy: {
          high_lr: "Correct. lr=0.01 is 100–1000× too high for fine-tuning a pretrained model. Large gradient steps overwrite the ImageNet features the network spent millions of images learning. Use lr=1e-4 to 1e-5 for fine-tuning, with even lower rates for early layers.",
        },
        branches: { high_lr: "a4_strategy_choice" },
      },
      a4_strategy_choice: {
        id: "a4_strategy_choice",
        type: "scenario_choice",
        badge: "Stage 2",
        title: "Stage 2 · Feature extraction vs fine-tuning decision",
        prompt: "You have a pretrained ResNet-50 (ImageNet) and 400 labeled medical images (chest X-rays). Which strategy?",
        code_snippet: `# Pretrained on: ImageNet (1.2M images, 1000 classes)
# Target task: pneumonia detection (binary)
# Available labeled data: 400 images
# Domain similarity: low (photos ≠ X-rays)`,
        choices: [
          { id: "a", label: "Feature extraction — freeze all ResNet layers, train only a new binary classification head", description: "With only 400 images and domain shift, full fine-tuning will overfit badly. Frozen ImageNet features (edges, textures) still provide useful signal even for X-rays — start here, then try unfreezing last block if needed." },
          { id: "b", label: "Full fine-tuning with lr=1e-3 — more parameters = better performance on medical images", description: "400 images is far too few for full fine-tuning. You'll overfit to the training set and the high LR will destroy pretrained features without learning medical-specific ones." },
          { id: "c", label: "Train from scratch — ImageNet features are too different from X-rays to be useful", description: "Even with domain shift, low-level features (edges, textures) from ImageNet are transferable. Training from scratch with 400 images will underfit severely." },
          { id: "d", label: "Use a pretrained radiology model — ImageNet is irrelevant for medical imaging", description: "A radiology-pretrained model would be better, but if unavailable, ImageNet transfer still outperforms training from scratch for small medical datasets." },
        ],
        branches: { a: "a4_discrim_lr_choice", b: "a4_rec_strategy", c: "a4_rec_strategy", d: "a4_discrim_lr_choice" },
        rationale: "With 400 images and domain shift, feature extraction is the safe starting point. Freeze all ImageNet layers, add a small classification head, train the head only. If performance is insufficient, gradually unfreeze later blocks with a very low LR.",
      },
      a4_rec_strategy: {
        id: "a4_rec_strategy",
        type: "scenario_choice",
        badge: "Recovery 1",
        title: "Recovery · Fine-tuning strategy selection",
        prompt: "You have 100,000 labeled customer support emails and a pretrained BERT. Domain: similar (English text). Which strategy?",
        code_snippet: `# Pretrained: BERT-base (English Wikipedia + BooksCorpus)
# Target: customer support intent classification
# Data: 100,000 labeled examples
# Domain similarity: high`,
        choices: [
          { id: "a", label: "Full fine-tuning with a low LR (1e-5 to 5e-5) — enough data, similar domain", description: "100k examples is more than sufficient to fine-tune all BERT layers without overfitting. Similar domain means pretrained features are highly relevant. Standard BERT fine-tuning recipe." },
          { id: "b", label: "Feature extraction — freeze BERT, train only a linear classifier head", description: "Feature extraction wastes available training data. With 100k examples and domain match, you can safely update all parameters." },
          { id: "c", label: "Train BERT from scratch on customer support data", description: "Discards millions of training examples worth of pretrained knowledge. Always prefer starting from a pretrained checkpoint if available." },
        ],
        branches: { a: "a4_discrim_lr_choice", b: "a4_rec_strategy", c: "a4_rec_strategy" },
        rationale: "Large dataset + domain similarity = full fine-tuning. Use the standard BERT fine-tuning recipe: unfreeze all layers, lr=2e-5 to 5e-5, 3-5 epochs, linear warmup + decay.",
      },
      a4_discrim_lr_choice: {
        id: "a4_discrim_lr_choice",
        type: "scenario_choice",
        badge: "Stage 3",
        title: "Stage 3 · Discriminative learning rates",
        prompt: "You're fine-tuning a 12-layer BERT for text classification. Why should layer 1 use a smaller LR than layer 12?",
        code_snippet: `# Layer 1 (close to input): learns low-level syntax, subword patterns
# Layer 12 (close to output): learns task-specific representations
# layer_1_lr << layer_12_lr`,
        choices: [
          { id: "a", label: "Early layers encode general language features that transfer well — large updates destroy this; later layers need more task-specific adaptation", description: "Layer 1 of BERT encodes syntax and morphology — useful for almost any NLP task and already well-trained. Layer 12 encodes high-level semantics that should shift toward the target task. Discriminative LRs preserve the former while adapting the latter." },
          { id: "b", label: "Early layers have more parameters so a lower LR prevents gradient explosion", description: "All layers in BERT-base have the same number of parameters per layer. The LR choice is about preserving general vs. adapting task-specific features, not parameter count." },
          { id: "c", label: "Early layers train faster, so a lower LR makes training more uniform", description: "Layer training speed is not the reason. The argument is about what each layer has learned and how much it should change for the new task." },
          { id: "d", label: "Lower LR everywhere is always better to prevent catastrophic forgetting", description: "A uniformly low LR is conservative but misses the insight that later layers should adapt more aggressively than earlier ones to the new task." },
        ],
        branches: { a: "a4_lora_choice", b: "a4_rec_forgetting", c: "a4_rec_forgetting", d: "a4_rec_forgetting" },
        rationale: "Discriminative learning rates (Howard & Ruder, ULMFiT) reflect the feature hierarchy: early layers learn transferable, general features; later layers learn task-specific representations. Smaller LR for early layers preserves general knowledge while later layers adapt.",
      },
      a4_rec_forgetting: {
        id: "a4_rec_forgetting",
        type: "scenario_choice",
        badge: "Recovery 2",
        title: "Recovery · Catastrophic forgetting",
        prompt: "After fine-tuning a pretrained model with lr=0.01, your model performs worse than feature extraction alone. What most likely happened?",
        code_snippet: `# Before fine-tuning: feature extraction val_acc = 0.82
# After full fine-tuning (lr=0.01, 20 epochs): val_acc = 0.71`,
        choices: [
          { id: "a", label: "Catastrophic forgetting — high LR overwrote pretrained feature representations before the new task could be learned from limited data", description: "lr=0.01 takes large parameter update steps. On a small dataset, the gradient signal from the new task is insufficient to rebuild the destroyed pretrained representations. You end up worse than frozen features." },
          { id: "b", label: "The pretrained model is too large for the new task and overfits", description: "Model size contributes to overfitting, but the immediate cause of worse-than-frozen performance is catastrophic forgetting from the high LR." },
          { id: "c", label: "The optimizer (Adam) is incompatible with fine-tuning pretrained models", description: "Adam is standard for fine-tuning. The LR is the problem, not the optimizer choice." },
        ],
        branches: { a: "a4_lora_choice", b: "a4_rec_forgetting", c: "a4_rec_forgetting" },
        rationale: "Catastrophic forgetting is the defining failure mode of fine-tuning with too-high LR. The fix: use lr=1e-4 to 1e-5, apply discriminative LRs, and use gradual unfreezing (unfreeze one block at a time).",
      },
      a4_lora_choice: {
        id: "a4_lora_choice",
        type: "scenario_choice",
        badge: "Stage 4",
        title: "Stage 4 · LoRA vs full fine-tuning for LLMs",
        prompt: "You need to fine-tune a 7B-parameter LLM for a domain-specific task. You have one 24GB GPU. Full fine-tuning requires ~56GB just for the model in fp16 + optimizer states. What's the practical approach?",
        code_snippet: `# 7B params × 2 bytes (fp16) = 14 GB model
# + optimizer states (Adam: 2× params) = 28 GB
# + gradients = 14 GB
# Total: ~56 GB → exceeds single GPU
# LoRA rank=8: adds ~0.1% trainable params`,
        choices: [
          { id: "a", label: "LoRA — freeze original weights, add small trainable rank-decomposition matrices; fits on 24GB GPU", description: "LoRA (rank=8) adds ~50M trainable parameters to a 7B model. Original weights stay frozen (loaded in 4-bit or 8-bit quantization). Total memory budget: ~12GB quantized model + small LoRA gradients — fits easily on 24GB." },
          { id: "b", label: "Use gradient checkpointing and it will fit on one GPU", description: "Gradient checkpointing trades compute for memory (recomputes activations instead of storing), saving ~50% activation memory. It doesn't solve the fundamental issue of optimizer states for 7B parameters." },
          { id: "c", label: "Train from scratch on domain data — full fine-tuning is not possible so LoRA is not worth trying", description: "Training from scratch is orders of magnitude harder and almost always worse than LoRA fine-tuning. LoRA is specifically designed for this exact scenario." },
          { id: "d", label: "Feature extraction — freeze the entire 7B model, add a task-specific head", description: "For generative tasks or when you need the model's generation behavior to change, a frozen head is insufficient. LoRA adapts the model's generation capability while keeping memory manageable." },
        ],
        branches: { a: "a4_terminal", b: "a4_rec_lora", c: "a4_rec_lora", d: "a4_rec_lora" },
        rationale: "LoRA is the standard approach for fine-tuning large language models on consumer hardware. Combined with quantization (QLoRA), a 7B model fine-tuning fits on a 12–24GB GPU. The trainable parameter count drops from 7B to ~50M (rank=8), while performance matches full fine-tuning on most tasks.",
      },
      a4_rec_lora: {
        id: "a4_rec_lora",
        type: "scenario_choice",
        badge: "Recovery 3",
        title: "Recovery · Parameter-efficient fine-tuning",
        prompt: "In LoRA, the weight update is ΔW = A·B where A is (d×r) and B is (r×k). What is r and why is it set to a small value like 4 or 8?",
        code_snippet: `# Original weight matrix W: shape (d, k) = (4096, 4096)
# W_frozen: not updated during training
# A: (4096, 8), B: (8, 4096)  [rank r=8]
# Trainable params: 2 × 4096 × 8 = 65,536 vs 4096² = 16.7M`,
        choices: [
          { id: "a", label: "r is the rank of the decomposition — small r means ΔW is a low-rank matrix, which is the hypothesis that task-specific adaptations live in a low-dimensional subspace", description: "The key insight: the weight changes needed for fine-tuning are often low-rank (they lie in a small-dimensional subspace). r=8 captures most of this with 256× fewer parameters than the full matrix." },
          { id: "b", label: "r controls the learning rate — smaller r means slower, more stable training", description: "r is the rank of the decomposition, not a learning rate schedule. The learning rate is set separately." },
          { id: "c", label: "r is the number of attention heads to adapt — other heads are frozen", description: "LoRA can be applied to attention weights, but r is the matrix rank, not the head count." },
        ],
        branches: { a: "a4_terminal", b: "a4_rec_lora", c: "a4_rec_lora" },
        rationale: "LoRA's hypothesis: fine-tuning weight changes have low intrinsic rank — most of the useful adaptation can be expressed as a product of two small matrices. This lets you train <1% of parameters while achieving comparable performance to full fine-tuning.",
      },
      a4_terminal: {
        id: "a4_terminal",
        type: "scenario_choice",
        badge: "Terminal",
        title: "Revision complete · Transfer Learning mastered",
        terminal: true,
        prompt: "A PM asks: 'We have 200 customer support tickets and want to classify them into 5 intent categories using a pretrained language model. What's your plan?' Give the 3 most important decisions.",
        code_snippet: `# Available: BERT-base pretrained model
# Data: 200 labeled tickets, 5 categories
# Constraint: production latency < 100ms`,
        choices: [
          { id: "a", label: "1) Feature extraction (freeze BERT, train head only — 200 examples is too few for fine-tuning). 2) Evaluate if frozen features are expressive enough; if not, unfreeze last 2 layers with lr=1e-5. 3) Monitor for overfitting with validation split.", description: "The three critical decisions: strategy (feature extraction given small data), progressive unfreezing fallback, and overfitting monitoring. Latency is handled by BERT-base being a standard size." },
          { id: "b", label: "1) Full fine-tuning with high LR. 2) Use all 200 examples for training (no validation). 3) Run for 50 epochs to maximize accuracy.", description: "All three choices are wrong: full fine-tuning with 200 examples causes overfitting/forgetting; no validation means you can't detect overfitting; 50 epochs with small data will massively overfit." },
          { id: "c", label: "1) Train from scratch to avoid domain mismatch. 2) Use 100 examples for training and 100 for test. 3) Increase model size for better accuracy.", description: "Training from scratch with 200 examples is the worst possible choice. Pretrained features are almost always better than random initialization for small datasets." },
        ],
        branches: { a: "a4_terminal", b: "a4_terminal", c: "a4_terminal" },
        rationale: "With 200 examples: (1) Start with feature extraction — frozen BERT + new classification head, trained for 10-20 epochs. (2) If accuracy is insufficient, unfreeze the last 1-2 transformer blocks with lr=1e-5. (3) Use 80/20 train/val split to catch overfitting. This is the industry-standard small-data BERT fine-tuning recipe.",
      },
    },
  },

  knowledgeCheck: [
    {
      question: "You have 300 images and a pretrained ResNet. Training from scratch gives 65% accuracy; feature extraction gives 79%; full fine-tuning gives 61%. Why does full fine-tuning underperform feature extraction?",
      options: [
        "Catastrophic forgetting — high LR with limited data overwrote pretrained ImageNet features before the new task could be learned",
        "Full fine-tuning has too many parameters for 300 images and always overfits",
        "ResNet is not compatible with fine-tuning and must be used as a fixed feature extractor",
      ],
      correctIndex: 0,
      explanation: "With 300 images and insufficient LR tuning, full fine-tuning destroys the pretrained representations faster than the small dataset can rebuild task-specific ones. Use lr=1e-4 or lower, or gradual unfreezing.",
    },
    {
      question: "Why use a lower learning rate for early layers than late layers when fine-tuning a deep network?",
      options: [
        "Early layers encode general, transferable features — large updates destroy them; later layers need more task-specific adaptation",
        "Early layers have more parameters so they need smaller updates to remain numerically stable",
        "Early layers converge faster, so a smaller LR slows them down to match later layers",
      ],
      correctIndex: 0,
      explanation: "Discriminative learning rates reflect the feature hierarchy. Early layers learn transferable, general features (edges, syntax) that should change very little. Later layers encode task-specific features that need aggressive adaptation to the new task.",
    },
    {
      question: "What is the key advantage of LoRA over full fine-tuning for a 7B-parameter LLM?",
      options: [
        "Reduces trainable parameters by 100-1000× by adding low-rank matrices alongside frozen weights, making fine-tuning feasible on consumer hardware",
        "LoRA always achieves higher accuracy than full fine-tuning because it prevents overfitting",
        "LoRA eliminates the need for a learning rate schedule during fine-tuning",
      ],
      correctIndex: 0,
      explanation: "LoRA (rank=8) adds ~50M trainable parameters to a 7B model instead of updating all 7B. Combined with quantization, this makes fine-tuning feasible on 16-24GB GPUs. Performance typically matches full fine-tuning at a fraction of the compute cost.",
    },
  ],
},

};




function ensureMinimumChecks(checks, lessonTitle) {
  const base = Array.isArray(checks) ? checks.slice() : [];
  const fillers = [
    {
      question: `For ${lessonTitle}, what is the most reliable first step when behavior seems unclear?`,
      options: [
        "Write a tiny reproducible example and test observed behavior",
        "Assume your intuition is correct and keep coding",
        "Skip verification and ask for code review first",
      ],
      correctIndex: 0,
      explanation: "Small, explicit repros prevent assumption-driven bugs and speed debugging.",
    },
    {
      question: "What is the strongest interview signal for technical maturity?",
      options: [
        "Explain tradeoffs, failure modes, and validation strategy",
        "List APIs from memory without context",
        "Avoid discussing edge cases",
      ],
      correctIndex: 0,
      explanation: "Mature answers show judgment under ambiguity, not syntax recall alone.",
    },
    {
      question: "Which action improves retention the most after this lesson?",
      options: [
        "Teach the concept back using one concrete production scenario",
        "Reread headings only",
        "Move on without practice",
      ],
      correctIndex: 0,
      explanation: "Active retrieval + scenario transfer improves long-term recall.",
    },
  ];
  while (base.length < 3) base.push(fillers[base.length % fillers.length]);
  return base;
}

function buildPythonTutorPrompts(lesson) {
  return {
    preTry: `Pre-Try for ${lesson.title}: give me 2 likely edge cases, one failure mode to watch for, and a 4-step predict→verify drill before I touch the interactive.`,
    postFail: `I missed checks on ${lesson.title}. Diagnose whether my errors are conceptual, procedural, or careless. Then give me a targeted 6-minute recovery drill with one mini-question and rubric.`,
    weeklyRecap: `Weekly recap for Python: based on ${lesson.title} and related topics, summarize my top 3 error patterns, one habit to fix each, and a spaced-practice plan for the next 7 days.`,
  };
}

function withPythonAssessmentAndTutor(spec, lesson) {
  return {
    ...spec,
    knowledgeCheck: ensureMinimumChecks(spec.knowledgeCheck, lesson.title),
    freeResponsePrompt: spec.freeResponsePrompt || {
      prompt: `In 3–5 sentences for ${lesson.title}: explain one key tradeoff, diagnose one realistic failure mode, and propose one concrete test/assertion you would add in production.`,
      rubric: [
        "Names one concrete tradeoff with when/why",
        "Diagnoses a plausible failure mode",
        "Proposes one test/assertion tied to the failure mode",
        "Uses clear, interview-ready language",
      ],
    },
    tutorPrompts: spec.tutorPrompts || buildPythonTutorPrompts(lesson),
  };
}

/**
 * @param {{ id: string, title: string, duration?: string, hasViz?: boolean }} lesson
 * @param {{ id: string, title: string }} course
 * @returns {LessonModuleSpec}
 */
export function getResolvedLessonModule(lesson, course) {
  const spec = LESSON_MODULES[lesson.id];
  if (spec) {
    const resolved = {
      ...spec,
      durationLabel: lesson.duration || spec.durationLabel || MODULE_TIME_LABEL,
    };
    return course.id === "python" ? withPythonAssessmentAndTutor(resolved, lesson) : resolved;
  }

  const pythonVideo = course.id === "python" ? (PYTHON_VIDEO_FALLBACKS[lesson.id] || null) : null;

  const fallbackSpec = {
    durationLabel: lesson.duration || MODULE_TIME_LABEL,
    outcomes: [
      `Explain **${lesson.title}** in two sentences`,
      "Connect the idea to a product or pipeline failure mode",
      "Drill with Practice + tutor until you can teach it",
    ],
    learnMarkdown: fallbackLearn(lesson, course.title),
    video: pythonVideo,
    videoFallbackMarkdown: pythonVideo
      ? `## Guided deep dive\n\nWatch the clip, pause every 2–3 minutes, and write one concrete example from your own project or interview prep where **${lesson.title}** changes the outcome. Then open the interactive block and run a predict → verify loop before moving on.`
      : fallbackDeepDive(lesson),
    tryGuidance: lesson.hasViz
      ? "Use the interactive lab in the **Try it** section: change one control at a time and narrate what moved before you read the label text."
      : "No primary visualization is mapped for this lesson yet. Use **Practice** questions and the tutor to simulate the same predict→verify loop.",
    knowledgeCheck: FALLBACK_CHECKS,
  };

  return course.id === "python" ? withPythonAssessmentAndTutor(fallbackSpec, lesson) : fallbackSpec;
}


/**
 * Non-throwing integrity checks for Python lesson metadata.
 * Returns a list of issues so callers can decide whether to log/alert.
 */
export function auditPythonLessonIntegrity(curriculum, visualizations) {
  const issues = [];
  const pythonCourse = (curriculum || []).find((c) => c.id === "python");
  if (!pythonCourse) return issues;

  const lessonList = (pythonCourse.topics || []).flatMap((t) => t.lessons || []);
  for (const lesson of lessonList) {
    const hasMappedViz = Boolean(visualizations?.[lesson.id]);
    if (!lesson.hasViz && hasMappedViz) {
      issues.push({
        type: "hasViz_mismatch",
        lessonId: lesson.id,
        message: `Lesson ${lesson.id} hasViz=false but has a mapped visualization.`,
      });
    }

    const spec = LESSON_MODULES[lesson.id];
    if (spec?.video === null && PYTHON_VIDEO_FALLBACKS[lesson.id]) {
      issues.push({
        type: "video_mismatch",
        lessonId: lesson.id,
        message: `Lesson ${lesson.id} sets video=null despite available Python video fallback.`,
      });
    }
  }

  return issues;
}
