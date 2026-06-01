# Dataspark — Claude Memory

## Repository
- **Repo**: `abdulbasith29/dataspark`
- **Dev branch**: `codex/audit-dataspark-module-for-interview-preparation`
- **Production**: Deployed on Vercel (`dataspark-final-*.vercel.app`)
- **Always push to**: `codex/audit-dataspark-module-for-interview-preparation` (never main without permission)

## Architecture

### Key files
| File | Purpose |
|------|---------|
| `src/app/dataspark-full-platform.jsx` | Main app — TOPICS array, VISUALIZATIONS map, imports |
| `src/data/lesson-modules.js` | `LESSON_MODULES` object — all lesson content |
| `src/lib/ds-platform-tokens.js` | `DS` design tokens (colors, spacing) |
| `src/lib/simple-markdown.jsx` | Markdown renderer — supports fenced code blocks |
| `src/components/platform/LessonModule.jsx` | Lesson UI — renders learn/video/try/check sections + InterviewGraph |
| `src/visualizations/` | All interactive React visualization components |

### VISUALIZATIONS map (in dataspark-full-platform.jsx)
Maps lesson IDs → React components. `resolveLessonVizComponent()` checks this map first.
When adding a new viz: (1) write the `.jsx` file, (2) add `import` at top of platform file, (3) add entry to VISUALIZATIONS map.

### Lesson module structure
```js
"lesson-id": {
  durationLabel: "15 min",
  outcomes: ["...", "..."],
  learnMarkdown: `## Section\n\nContent with **bold** and \`\`\`code blocks\`\`\``,
  video: null,
  videoFallbackMarkdown: `## Deep dive content`,
  tryGuidance: "How to use the interactive viz",
  interviewGraph: { ... },  // see below
  knowledgeCheck: [{ question, options, correctIndex, explanation }],
}
```

### InterviewGraph structure
```js
interviewGraph: {
  initialStageId: "first_stage_id",
  artifactDimensions: [
    { label: "Skill Name", recoveryStageId: "recovery_id" },
    { label: "Another Skill", recoveryStageId: "recovery2_id", passLabel: "Mastery Label" },
  ],
  stages: {
    stage_id: {
      id: "stage_id",
      type: "click_target" | "scenario_choice",
      badge: "Stage 1",
      title: "Stage 1 · description",
      prompt: "What the learner is asked to do",
      code_snippet: `code with -- ds-target:id annotations`,
      // for click_target:
      validationCopy: { target_id: "Feedback text" },
      branches: { target_id: "next_stage_id" },
      // for scenario_choice:
      choices: [{ id: "a", label: "...", description: "..." }],
      branches: { a: "next_stage", b: "recovery", c: "recovery", d: "recovery" },
      rationale: "Shown AFTER learner answers — explains correct reasoning",
      // for terminal stage:
      terminal: true,  // all branches point back to this stage's id
    },
  },
}
```

**Rationale rule**: only shown after `hasAnswered = Boolean(selectedTarget || selectedChoice)` — never spoils before decision.

### Visualization component rules
- Import: `import { useState } from "react";` + `import { DS } from "../lib/ds-platform-tokens.js";`
- ALL styling via inline JSX `style={{}}` objects — no CSS files, no Tailwind
- Declare ALL constants **before** the component function (TDZ safety — forward references crash production builds)
- Dark backgrounds: `rgba(2,6,23,0.72)` for code panels, `rgba(255,255,255,0.02)` for cards
- Monospace font: `fontFamily: "var(--ds-mono), monospace"` | Sans: `fontFamily: "var(--ds-sans), sans-serif"`
- Default export a functional React component

### Course accent colors
| Course | Color |
|--------|-------|
| Statistics & Probability | `#8B5CF6` (purple) |
| SQL | `#F59E0B` (amber) |
| Python | `#10B981` (green) |
| ML | `#0EA5E9` (blue) |

## Completed work (this session)

### SQL curriculum (PR #7)
- Removed `sql-basics` topic (sq-b1–sq-b5) as unnecessary
- Added SQL Foundation lessons: `sql-found-01` through `sql-found-04` with interviewGraphs + viz
- Added Advanced SQL: `sq-a1` through `sq-a5` with interviewGraphs + viz
- Added Database Design: `sq-d1` through `sq-d4` with interviewGraphs + viz
- Fixed rationale spoiler bug in `LessonModule.jsx`
- Fixed TDZ crash in `SQLNormalizationViz.jsx` (AMBER constant declared after STEPS array)

### SQL Visualizations created
`SQLOrderOfExecution`, `SQLNullLogic`, `SQLGroupByViz`, `SQLSubqueryVsJoin`, `SQLWindowFunctionsViz`, `SQLLagLeadViz`, `SQLCteExplorer`, `SQLPivotViz`, `SQLExplainPlanViz`, `SQLNormalizationViz`, `SQLIndexingViz`, `SQLStarSnowflakeViz`, `SQLOltpOlapViz`

### Statistics & Probability curriculum
All 18 lessons (st-f1→st-f4, st-p1→st-p4, st-i1→st-i6, st-a1→st-a4) fully built with:
- Full `learnMarkdown` + `interviewGraph` + `knowledgeCheck`
- 13 new bespoke visualization components (see below)
- Existing viz retained: `BayesTheorem` (st-p1), `NormalDistViz` (st-f2, st-p2), `HypothesisTesting` (st-i1), `ABTestSimulator` (st-a1)

### Statistics Visualizations created
| Lesson | Component |
|--------|-----------|
| st-f1 Mean/Median/Mode | `StatMeanMedianModeViz` |
| st-f3 Percentiles/IQR | `StatPercentileIQRViz` |
| st-f4 Correlation/Causation | `StatCorrelationViz` |
| st-p3 Binomial/Poisson | `StatBinomialPoissonViz` |
| st-p4 CLT | `StatCLTViz` |
| st-i2 P-Values | `StatPValueViz` |
| st-i3 t-Tests/χ²/ANOVA | `StatTestsViz` |
| st-i4 Confidence Intervals | `StatConfidenceIntervalViz` |
| st-i5 Type I & II Errors | `StatTypeErrorsViz` |
| st-i6 Power Analysis | `StatPowerAnalysisViz` |
| st-a2 Multiple Testing | `StatMultipleTestingViz` |
| st-a3 Bootstrap | `StatBootstrapViz` |
| st-a4 Bayes vs Frequentist | `StatBayesFrequentistViz` |

## Workflow for adding a new lesson batch

1. **Concurrent agents** (one per topic): each agent writes viz `.jsx` files to `src/visualizations/` and dumps lesson module JS to `/tmp/<topic>_lessons.js`
2. **Copy viz files** from worktrees to main repo
3. **Inject lesson modules** into `lesson-modules.js` using Python: find last `\n};`, insert before it, re-validate with `node --input-type=module`
4. **Update platform file**: add `import` lines + VISUALIZATIONS map entries + fix any `hasViz: false` flags
5. **Build**: `npm run build` — fix any syntax errors (common: missing closing quote in JSX string props)
6. **Commit + push** to `codex/audit-dataspark-module-for-interview-preparation`

## Common gotchas
- **TDZ crash**: declaring a `const` after it's referenced in module-level code (e.g. inside a top-level array). Always declare color constants at the top of viz files.
- **Double-comma**: when injecting lesson modules, check for `},,` with `grep -n '},,' lesson-modules.js`
- **Missing quote in JSX**: `color: "#FB923C }` (missing closing `"`) — shows as "unterminated string" in build
- **Duplicate VISUALIZATIONS key warning**: `sq-a1` appears twice in the map — harmless warning, last one wins
- **st-a4 hasViz**: was `false`, now `true` — already fixed
