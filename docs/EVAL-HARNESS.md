# Tutor Eval Harness

Regression test for the AI tutor's evaluator. **No prompt, schema, or model
change ships without running this and comparing to the baseline.**

```sh
ANTHROPIC_API_KEY=sk-ant-... npm run eval:tutor
npm run eval:tutor -- --baseline evals/baseline.json   # compare + gate
```

## What it does

Runs 30 hand-labeled learner answers through the real `api/ai/evaluate.js`
handler — the production path, including the forced tool call, the normalizer
and the retry logic — then grades the evaluator's output against ground truth.

The cases live in `scripts/eval-tutor-cases.mjs`: 11 correct, 12 partial, 7
incorrect, spanning statistics, A/B testing, SQL, ML and product reasoning. The
confident-but-wrong answers are the ones that matter — an evaluator that rewards
fluent writing over correct reasoning will pass the easy cases and fail those.

## What it measures

| Dimension | Weight | Question it answers |
|-----------|--------|---------------------|
| Verdict accuracy | 30% | Did it reach the right correct/partial/incorrect call? |
| Gap recall | 25% | Did it find the concepts the answer genuinely missed? |
| Gap precision | 15% | Did it flag things the learner actually covered? |
| Calibration | 15% | Is the 0-100 score in the expected band? |
| Rubric accuracy | 10% | Do the per-criterion met flags match ground truth? |
| Hint quality | 5% | Hint when needed, absent when not, never leaks the answer |

A case **passes** only if the verdict is right, every required gap was found, no
gap was invented, and the score lands in band. The composite is the weighted
average. `severeVerdictErrors` counts correct↔incorrect flips — those are the
ones that actively mislead a learner, so they are tracked separately and any
increase fails the run.

## Baselines

```sh
npm run eval:tutor -- --save-baseline evals/baseline.json
```

Commit `evals/baseline.json`. Later runs compare against it and exit non-zero
if any dimension drops more than 0.03 or severe flips increase.

Two guards exist because a bad baseline is worse than none — it looks
authoritative while measuring nothing, and every future comparison inherits the
error:

- The harness **refuses to run** without a provider key, rather than measuring
  the fallback path and calling it a score.
- It **refuses to save a baseline** if any case came back `degraded`, since a
  degraded run measures the failure path rather than the model.

Before baselining, confirm the configured model is actually live:

```sh
npm run verify:models
```

## Flags

| Flag | Effect |
|------|--------|
| `--filter <substr>` | Only cases whose id or topic matches |
| `--concurrency <n>` | Parallel requests (default 4) |
| `--verbose` | Print each explanation the evaluator produced |
| `--json <path>` | Write full per-case results |
| `--baseline <path>` | Compare and gate |
| `--save-baseline <path>` | Write this run's summary |

## Adding cases

Add to `CASES` in `scripts/eval-tutor-cases.mjs`. `requiredGaps` entries are
lists of acceptable phrasings, matched as substrings against the lowercased gap
text, so matching stays deterministic and costs nothing.

After adding, sanity-check that your labels are self-consistent: an ideal
responder must score 1.000. If a "perfect" run scores below that, the labels
contradict each other — for example a `forbiddenGaps` term that appears inside a
`requiredGaps` phrasing — and the case will be unpassable by any model.
