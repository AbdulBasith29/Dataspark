# CLAUDE CODE — Development Instructions

## Repo Setup
```bash
cd dataspark
git init
git add -A
git commit -m "Initial commit: DataSpark platform foundation"
gh repo create dataspark --public --push
```

## What's Done
- ✅ Architecture doc (docs/ARCHITECTURE.md)
- ✅ Agent task briefs (docs/AGENT-TASKS.md)
- ✅ Platform prototype V1 (src/app/dataspark-platform.jsx)
- ✅ Platform prototype V2 — full (src/app/dataspark-full-platform.jsx)
- ✅ Python question bank — 40 questions (src/data/questions-python.js)
- ✅ SQL question bank — **34–45 questions** (mastery band; `src/data/questions-sql.js`)
- ✅ Statistics question bank — 40 questions (src/data/questions-statistics.js)
- ✅ AI tutor system prompts — all 9 courses (src/chatbot/system-prompts.js)
- ✅ README with full project overview

## What Needs Building Next

### Priority 1: Remaining Question Banks
Generate these following the exact format in questions-python.js:
```
"Generate 40 ML questions for src/data/questions-ml.js following the spec in docs/AGENT-TASKS.md and the format in src/data/questions-python.js"

"Generate 25 Deep Learning questions for src/data/questions-deep-learning.js"

"Generate 25 GenAI questions for src/data/questions-genai.js"

"Generate 30 Product Sense questions for src/data/questions-product-sense.js"

"Generate 20 System Design questions for src/data/questions-system-design.js"

"Generate 25 MLOps questions for src/data/questions-mlops.js"
```

### Priority 2: Visualizations
Build these as standalone React components:
```
"Build an interactive K-Means clustering visualization. Show random points, click 'step' to see centroid updates. Follow the viz spec in docs/AGENT-TASKS.md"

"Build an interactive confusion matrix that lets you drag a threshold slider and shows how precision/recall/F1 change in real-time"

"Build an interactive SQL JOIN visualizer showing INNER, LEFT, RIGHT, FULL with actual data rows"

"Build a decision tree splitting visualizer that shows entropy/gini calculations at each node"
```

### Priority 3: Integration
```
"Integrate all question banks from src/data/ into the main platform at src/app/dataspark-full-platform.jsx. Each course should load its questions dynamically."

"Wire up the AI chatbot with the system prompts from src/chatbot/system-prompts.js so each course launches its own tutor"
```

### Priority 4: Lesson Content
```
"Write the full lesson content for 'Bias-Variance Tradeoff' — include concept explanation, examples, common interview questions about it, and connect to the existing visualization"
```

## Quality Checks
After each generation, review:
1. Does every question have a complete model answer?
2. Does the rubric have 5-9 specific criteria?
3. Are hints progressive (easy → specific)?
4. Is the difficulty distribution ~30/40/30 (Easy/Medium/Hard)?
5. Do tags enable useful filtering?
6. Are company names realistic?
7. Do open-ended questions have genuine ambiguity?
