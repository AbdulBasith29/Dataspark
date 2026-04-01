# DataSpark — Master Architecture Document
## "The Jensen Memo"

### Vision
DataSpark is a comprehensive data science learning + interview prep platform that teaches concepts visually, lets students practice with context-rich problems, and provides AI tutoring scoped to each topic.

### What Makes Us Different
1. **Concepts taught visually** — interactive animated diagrams (3Blue1Brown style) for every buzzword
2. **Context-driven questions** — not just "write the query" but "the VP needs this by EOD, here's the messy reality"
3. **AI tutors per topic** — each course gets its own Claude-powered tutor that stays on-topic
4. **Full spectrum** — from Python basics to system design to prompt engineering
5. **Soft skills integrated** — how to communicate findings, push back on bad metrics, handle ambiguity

### Platform Structure

#### 3 Pillars
1. **LEARN** — Structured courses with lessons, animated visualizations, concept explanations
2. **PRACTICE** — Hundreds of questions per topic (coding + open-ended + case studies)
3. **AI TUTOR** — Topic-scoped chatbot that helps you understand concepts and review your answers

### Course Catalog (9 courses)

| # | Course | Topics | Target Lessons | Target Questions |
|---|--------|--------|----------------|-----------------|
| 1 | Python Fundamentals | Core syntax, control flow, OOP, NumPy/Pandas | 18 | 40+ |
| 2 | SQL & Databases | Fundamentals, advanced SQL, DB design | 14 | 40+ |
| 3 | Statistics & Probability | Descriptive, probability, inference, applied | 16 | 40+ |
| 4 | Machine Learning | Foundations, supervised, unsupervised, evaluation | 18 | 40+ |
| 5 | Deep Learning | NN foundations, architectures (CNN/RNN/Transformer) | 9 | 25+ |
| 6 | GenAI & LLMs | LLM foundations, building with LLMs | 9 | 25+ |
| 7 | Product Sense & Cases | Metrics, experimentation, business cases | 10 | 30+ |
| 8 | System Design | Pipeline architecture, ML system design | 8 | 20+ |
| 9 | MLOps, Cloud & Tools | MLOps, Git, APIs, Docker, cloud, viz | 12 | 25+ |

**TOTAL: ~114 lessons, ~285+ questions, 9 AI tutors, 30+ visualizations**

### Question Format Spec

Every question must include:
```json
{
  "id": "unique-id",
  "courseId": "python|sql|statistics|ml|deep-learning|genai|product-sense|system-design|mlops",
  "topicId": "subtopic within course",
  "title": "Short descriptive title",
  "difficulty": "Easy|Medium|Hard",
  "company": "Company name for context (e.g., Spotify, Netflix)",
  "type": "code|open-ended",
  "language": "python|sql|null (for open-ended)",
  "estimatedMinutes": 15,
  "prompt": "Full problem statement with business context",
  "hints": ["hint1", "hint2", "hint3"],
  "modelAnswer": "Complete model answer",
  "rubric": ["criterion1", "criterion2", ...],
  "tags": ["tag1", "tag2"],
  "commonMistakes": ["mistake1", "mistake2"]
}
```

### Visualization Spec

Every visualization must:
- Be a self-contained React component
- Accept no required props
- Include interactive controls (sliders, buttons, toggles)
- Animate smoothly (requestAnimationFrame or CSS)
- Include explanatory labels that update with interaction
- Use canvas for complex animations, SVG/CSS for simpler ones
- Match the dark theme (bg: #0B1120, text: #F8FAFC)

### AI Tutor Spec

Each course gets a tutor with:
- System prompt scoped to that topic
- Knowledge of all lessons and questions in that course
- Ability to explain concepts, work through problems, give feedback
- Stays on-topic — redirects if asked about unrelated subjects

### Tech Stack
- React (JSX artifact)
- Canvas API for visualizations
- Claude API (claude-sonnet-4-20250514) for AI tutors
- Tailwind utility classes for layout
- No external state management — React state + props

### Design System
- Fonts: Outfit (display), JetBrains Mono (code/labels)
- Background: #080E1A (app), #0B1120 (cards), #0C1425 (elevated)
- Border: #1E293B (default), color+30 (hover)
- Each course has a unique color + accent
- Animations: smooth, purposeful, not gratuitous
