# Dataspark — Claude Memory

## Repository
- **Repo**: `abdulbasith29/dataspark`
- **Active dev branch**: `feat/complete-curriculum` ← all recent work is here
- **Legacy dev branch**: `codex/audit-dataspark-module-for-interview-preparation`
- **Production**: Deployed on Vercel (`dataspark-final-*.vercel.app`)
- **Always push to**: `feat/complete-curriculum` (never main without permission)

## Architecture

### Key files
| File | Purpose |
|------|---------|
| `src/app/dataspark-full-platform.jsx` | Main app — TOPICS array, VISUALIZATIONS map, imports, navbar |
| `src/data/lesson-modules.js` | `LESSON_MODULES` object — all lesson content (~3.19MB) |
| `src/lib/ds-platform-tokens.js` | `DS` design tokens (colors, spacing) |
| `src/lib/simple-markdown.jsx` | Markdown renderer — supports fenced code blocks |
| `src/components/platform/LessonModule.jsx` | Lesson UI — renders learn/video/try/check sections + InterviewGraph |
| `src/visualizations/` | All interactive React visualization components (90+ files) |
| `scripts/validate-interview-graphs.mjs` | Validator: run with `npm run validate:interview-graphs` |

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
      terminal: true,
    },
  },
}
```

**Rationale rule**: only shown after `hasAnswered = Boolean(selectedTarget || selectedChoice)` — never spoils before decision.

**InterviewGraph quality bar**: 1+ click_target per lesson, 8-9 stages total, 3-4 choices on ALL scenario_choice stages (no single-choice recoveries), 650-900 word learnMarkdown with `## Interview-Ready Summary`.

**Recovery stage rule**: A recovery stage's correct branch must point to an *acyclic* next stage — never back to the stage that sent wrong answers into the recovery. Route correct recovery answers to the next main-path stage to avoid validator cycle errors.

### Visualization component rules
- Import ONLY: `import { useState } from "react";` + `import { DS } from "../lib/ds-platform-tokens.js";`
- ALL styling via inline JSX `style={{}}` objects — no CSS files, no Tailwind, no className
- Declare ALL constants **before** the component function (TDZ safety — forward references crash production builds)
- NO useEffect, NO setInterval, NO setTimeout, NO canvas animation loops
- Dark backgrounds: `rgba(2,6,23,0.72)` for code panels, `rgba(255,255,255,0.02)` for cards
- Monospace font: `fontFamily: "var(--ds-mono), monospace"` | Sans: `fontFamily: "var(--ds-sans), sans-serif"`
- Default export a functional React component

### DS token reference
```js
export const DS = {
  bg: "#020617", t1: "#f1f5f9", t2: "#94a3b8", t3: "#64748b",
  border: "rgba(148,163,184,0.12)", grn: "#34d399", red: "#f87171",
  ylw: "#fbbf24", blu: "#38bdf8", ind: "#818cf8",
};
```

### Course accent colors
| Course | Color |
|--------|-------|
| Statistics & Probability | `#8B5CF6` (purple) |
| SQL | `#F59E0B` (amber) |
| Python | `#10B981` (green) |
| ML | `#0EA5E9` (blue) |
| System Design | `#F97316` (orange) |
| MLOps | `#0EA5E9` (blue) |
| Specialized AI | `#8B5CF6` (purple) |

---

## Current state of the curriculum (feat/complete-curriculum branch)

### All courses fully built
- **Statistics & Probability**: 18 lessons (st-f1→st-f4, st-p1→st-p4, st-i1→st-i6, st-a1→st-a4) ✓
- **SQL**: Foundation (sql-found-01→04), Advanced (sq-a1→sq-a5), Database Design (sq-d1→sq-d4) ✓
- **Python**: All lessons ✓
- **ML**: All lessons (foundations, supervised, unsupervised, evaluation) ✓
- **GenAI & LLMs**: All lessons ✓
- **System Design**: sd-p1→sd-m4 — all rewritten to GenAI quality ✓
- **MLOps**: mo-c1→mo-v3 — all rewritten to GenAI quality ✓
- **Specialized AI**: sp-r1→sp-n4 — all rewritten to GenAI quality ✓

### MLOps lesson ID → content mapping (important — was swapped, now fixed)
| ID | Title | Viz |
|----|-------|-----|
| mo-c1 | CI/CD for Machine Learning | `MLCICDPipelineViz` |
| mo-c2 | Model Versioning & Experiment Tracking | none (hasViz: false) |
| mo-c3 | Monitoring & Drift Detection | `DriftConceptViz` |
| mo-c4 | Automated Retraining Pipelines | `AutoRetrainingViz` |
| mo-t1 | Git Workflows for Data Teams | `GitWorkflowViz` |
| mo-t2 | Virtual Environments: venv/conda/poetry | `VenvCondaViz` |
| mo-t3 | ML Pipeline Orchestration with Airflow | `AirflowDAGViz` |
| mo-t4 | Deployment Strategies: Canary & Blue/Green | `CanaryDeploymentViz` |
| mo-t5 | Cloud Basics: AWS for DS | `AWSDataScienceViz` |
| mo-v1 | Matplotlib & Seaborn | `MatplotlibAnatomyViz` |
| mo-v2 | Plotly: Interactive Visualizations | `PlotlyInteractiveViz` |
| mo-v3 | Dashboard Design Principles | `DashboardDesignViz` |

### All bespoke viz components (src/visualizations/)
90+ components total. Key ones added in recent sessions:
`MLCICDPipelineViz`, `MLDriftMonitorViz` (orphaned — not in map), `AirflowDAGViz`, `CanaryDeploymentViz`, `MatplotlibAnatomyViz`, `MatrixFactorizationViz`, `RecEvalMetricsViz`, `TextPreprocessingPipelineViz`, `ARIMACFViz`, `ProphetDecompositionViz`, `DriftConceptViz`, `AutoRetrainingViz`, `GitWorkflowViz`, `AWSDataScienceViz`, `VenvCondaViz`, `PlotlyInteractiveViz`, `DashboardDesignViz`, `ContentBasedRecViz`, `LSTMSequenceViz`, `NERViz`, `SentimentAnalysisViz`, `WordEmbeddings`

---

## Next planned work (not yet started)

### Mobile responsiveness (agreed plan, not executed)
**Phase 1 — Navbar**: Replace flat nav with responsive design. Below 640px: logo + hamburger → slide-down drawer with course buttons (2-col grid) + Home/Insights links. Above 640px: current layout.

**Phase 2 — Viz scrollability**: 
- In `LessonModule.jsx`: wrap viz render area with `overflow-x: auto; -webkit-overflow-scrolling: touch`
- Per-component: fix hardcoded pixel widths in `ARIMACFViz`, `GitWorkflowViz`, `NERViz`, `LSTMSequenceViz`, `DashboardDesignViz`, `ContentBasedRecViz` — change to `width: "100%"` with `min-width: 360px`

**Phase 3 — Layout polish**: Card grids, knowledge-check options, interview graph stages — make single-column below ~500px.

**Phase 4 — PWA**: Add `vite-plugin-pwa` → `manifest.json` + service worker → "Add to Home Screen" on iOS/Android, enables Android TWA for Play Store.

**Phase 5 — App Store (Capacitor.js)**:
- Run: `npm install @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android`
- Then: `npx cap init` → `npx cap add ios` → `npx cap add android` → `npx cap sync`
- iOS build requires Mac + Xcode + Apple Dev account ($99/yr)
- Android build works on any OS, Play Store = $25 one-time
- I (Claude) can set up all config; you run `npx cap open ios` on a Mac to compile + submit

---

## Workflow for adding a new lesson batch

1. **Concurrent agents** (one per topic): each agent writes viz `.jsx` files to `src/visualizations/` and dumps lesson module JS to `/tmp/<topic>_lessons.js`
2. **Inject lesson modules** into `lesson-modules.js` using Python (naive brace counting — no backtick-awareness needed since naive depth = 0 at lesson boundaries)
3. **Update platform file**: add `import` lines + VISUALIZATIONS map entries + fix any `hasViz: false` flags
4. **Build**: `npm run build` — fix any syntax errors
5. **Validate**: `npm run validate:interview-graphs` — fix any cycle/terminal errors
6. **Commit + push** to `feat/complete-curriculum`

## Common gotchas
- **TDZ crash**: declaring a `const` after it's referenced in module-level code. Always declare color constants at the top of viz files.
- **Double-comma**: when injecting lesson modules, check for `},,` with `grep -n '},,' lesson-modules.js`
- **Stray `const mod = {...};` wrapper**: agents sometimes wrap output in a variable declaration — causes `};,` inside LESSON_MODULES. Fix: find the `};,` line (line.strip() == '};,') and delete it.
- **Recovery cycle**: recovery stage correct branch must NOT point back to the stage that sends wrong answers here. Point to the *next* main-path stage instead.
- **brace matching lesson-modules.js**: Use naive brace counting (no backtick awareness) — template literals with `${...}` confuse backtick-aware scanners, but naive counts are accurate at lesson boundaries.
- **Duplicate VISUALIZATIONS key warning**: `sq-a1` appears twice in the map — harmless, last one wins.
- **MLDriftMonitorViz**: imported but not in VISUALIZATIONS map (orphaned after mo-c2/c3 content swap). Safe to leave or reassign.
