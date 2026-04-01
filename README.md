# DataSpark ⚡

**Stop memorizing syntax. Start solving systems.**

DataSpark is the data science interview prep platform that goes beyond SQL drills. It teaches the architecture decisions, business reasoning, and system design thinking that top-tier interviews actually test — and that no other platform covers.

## Why DataSpark Exists

Traditional platforms drill you on queries — write this JOIN, fix this error. But the interviews that decide who gets hired ask you to diagnose a 25% drop in users, decide whether to build or buy ML monitoring, or explain contradictory A/B test results to a non-technical VP. DataSpark teaches the logic behind the code.

## What's Inside

### Learning Platform
- **9 structured courses** — Python, SQL, Statistics, ML, Deep Learning, GenAI/LLMs, Product Sense, System Design, MLOps
- **114+ lessons** with written explanations, curated YouTube embeds, and interactive animated visualizations
- **Progressive mastery system** — level-gated progression, cross-course prerequisites, mastery scoring per subtopic
- **Spaced repetition** — questions you miss resurface at scientifically optimal intervals

### Practice Engine
- **285+ practice questions** across coding and open-ended formats
- Every question wrapped in real business context (not puzzles in a vacuum)
- **AI-powered rubric evaluation** — scored on reasoning quality, not just syntax correctness
- Company-tagged scenarios from Google, Meta, Netflix, Stripe, DoorDash, etc.

### AI Tutors
- **9 topic-scoped Claude-powered tutors** — one per course
- Each tutor stays on-topic and challenges your logic (Socratic, not answer-giving)
- Available inside lessons, practice questions, and standalone

### Waitlist Landing Page
- Production-ready landing page with:
  - Interactive "Syntax vs Strategy" toggle demo
  - Animated trust bar with company logos
  - Mobile-first responsive design (works on 390px phones)
  - Email capture with social proof
  - Full comparison table (category-based, no competitor names)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Database | Supabase (PostgreSQL, Auth, Row Level Security) |
| AI | Claude API (tutors + evaluation), server-side |
| Code Sandbox | Monaco Editor + Judge0/Piston API |
| Fonts | Manrope (display) + JetBrains Mono (code) |
| Hosting | Vercel |

Full schema, API routes, and migration plan in [`docs/TECH-STACK.md`](docs/TECH-STACK.md).

---

## Project Structure

```
dataspark/
├── README.md
├── CLAUDE_CODE_INSTRUCTIONS.md    # Exact prompts for Claude Code to continue building
├── .gitignore
│
├── docs/
│   ├── ARCHITECTURE.md            # Master architecture document
│   ├── AGENT-TASKS.md             # Agent task distribution (5 departments)
│   ├── TECH-STACK.md              # Full tech stack, DB schema, API routes
│   ├── PROGRESSION-SYSTEM.md      # Progression, mastery, spaced repetition specs
│   └── MARKETING-PLAYBOOK.md      # Social media strategy, content calendar, waitlist
│
└── src/
    ├── app/
    │   ├── landing-page.jsx           # ✅ Production waitlist landing (v8, mobile-first)
    │   ├── dataspark-platform.jsx     # ✅ V1 prototype (practice-focused)
    │   ├── dataspark-full-platform.jsx # ✅ V2 prototype (learn + practice + AI tutor)
    │   └── landing-iterations/
    │       └── v7-power-copy.jsx      # Earlier landing version for reference
    │
    ├── data/
    │   ├── questions-python.js        # ✅ 40 Python questions (complete)
    │   └── questions-statistics.js    # ✅ 40 Statistics questions (complete)
    │
    ├── chatbot/
    │   └── system-prompts.js          # ✅ All 9 AI tutor system prompts
    │
    └── visualizations/                # Interactive animated React components
        └── (embedded in platform prototypes, to be extracted)
```

---

## What's Complete

| Deliverable | Status | Details |
|-------------|--------|---------|
| Architecture docs | ✅ | Master architecture, agent briefs, tech stack, progression system |
| Marketing playbook | ✅ | 5 content pillars, platform-specific strategies, content calendar |
| Landing page (v8) | ✅ | Mobile-first, responsive, power copy, interactive demo |
| Platform V1 | ✅ | Practice-focused prototype with 4 categories |
| Platform V2 | ✅ | Full 9-course prototype with lessons, practice, AI chatbot |
| Python questions | ✅ | 40 questions with model answers, rubrics, hints |
| Statistics questions | ✅ | 40 questions with model answers, rubrics, hints |
| AI tutor prompts | ✅ | All 9 course-scoped system prompts |
| 3 visualizations | ✅ | Normal Distribution, Gradient Descent, Bias-Variance |
| DB schema (SQL) | ✅ | 14 tables, RLS policies, indexes |

## What Needs Building Next

| Priority | Task | Estimated Effort |
|----------|------|-----------------|
| P0 | Scaffold Next.js + Supabase project | 2 hours |
| P0 | Deploy landing page to Vercel | 1 hour |
| P1 | Generate remaining question banks (SQL, ML, DL, GenAI, Product, SysDesign, MLOps) | 3-4 hours with Claude Code |
| P1 | Run DB migrations in Supabase | 1 hour |
| P1 | Wire up Claude API for AI tutors | 2 hours |
| P2 | Build 10 more interactive visualizations | 4-6 hours |
| P2 | Write lesson content for all 114 lessons | Ongoing |
| P2 | Curate YouTube videos for all lessons | 2-3 hours |
| P3 | Implement spaced repetition engine | 3 hours |
| P3 | Build code sandbox (Monaco + Judge0) | 4 hours |

---

## Continuing Development with Claude Code

Open Claude Code and run:

```bash
cd dataspark
```

Then use these prompts (detailed instructions in [`CLAUDE_CODE_INSTRUCTIONS.md`](CLAUDE_CODE_INSTRUCTIONS.md)):

```
"Read docs/TECH-STACK.md and scaffold the Next.js + Supabase project"

"Generate 40 ML questions for src/data/questions-ml.js following the format in src/data/questions-python.js"

"Build an interactive K-Means clustering visualization component"

"Integrate all question banks into the main platform"
```

---

## Design System

| Token | Value | Usage |
|-------|-------|-------|
| `--bg` | `#020617` | Page background (Deep Midnight) |
| `--card` | `rgba(255,255,255,0.02)` | Card backgrounds |
| `--border` | `rgba(255,255,255,0.06)` | Default borders |
| `--accent` | `#818CF8` | Electric Indigo (primary accent) |
| `--green` | `#34D399` | Cyber Lime (success, DataSpark highlights) |
| `--t1` | `#F8FAFC` | Primary text |
| `--t2` | `#E2E8F0` | Secondary text |
| `--t3` | `#94A3B8` | Muted text |
| `--sans` | Manrope | Display / body typography |
| `--mono` | JetBrains Mono | Code / data labels |

---

## Target Audience

Data science bootcamp graduates preparing for interviews at top tech companies. The platform bridges the gap between "I can write a GROUP BY" and "I can lead a data team."

## License

MIT
