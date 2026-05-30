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
