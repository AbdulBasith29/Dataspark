# DataSpark — Agent Task Distribution
## Departments & Assignments

---

## DEPT 1: CURRICULUM CONTENT (Agent: curriculum-agent)
**Mission**: Generate the complete question bank for all 9 courses.
**Output**: JSON files per course with 25-40+ questions each.
**Quality Bar**: Every question must have business context, model answer, rubric, hints, tags.

### Deliverables:
- `/src/data/questions-python.js` — 40 questions
- `/src/data/questions-sql.js` — 40 questions
- `/src/data/questions-statistics.js` — 40 questions
- `/src/data/questions-ml.js` — 40 questions
- `/src/data/questions-deep-learning.js` — 25 questions
- `/src/data/questions-genai.js` — 25 questions
- `/src/data/questions-product-sense.js` — 30 questions
- `/src/data/questions-system-design.js` — 20 questions
- `/src/data/questions-mlops.js` — 25 questions

### Rules:
1. Every coding question needs a COMPLETE working model answer (not pseudocode)
2. Every open-ended question needs a detailed model answer (300-500 words)
3. Rubric must have 5-9 specific, scorable criteria
4. Hints should progressively reveal the approach (easy → specific)
5. Tags must be specific enough to enable filtering
6. Company context should be realistic (use real company names)
7. Difficulty distribution per course: 30% Easy, 40% Medium, 30% Hard
8. Questions should cover ALL subtopics within each course
9. Open-ended questions should have ambiguity — no single right answer
10. Include "commonMistakes" field with 2-3 typical errors

---

## DEPT 2: VISUALIZATION ENGINE (Agent: viz-agent)
**Mission**: Build interactive animated visualizations for key concepts.
**Output**: Self-contained React components that explain concepts visually.
**Quality Bar**: 3Blue1Brown-inspired — smooth animation, interactive controls, builds intuition.

### Deliverables (Priority Order):
- `/src/visualizations/NormalDistribution.jsx` — ✅ Done
- `/src/visualizations/GradientDescent.jsx` — ✅ Done
- `/src/visualizations/BiasVariance.jsx` — ✅ Done
- `/src/visualizations/LinearRegression.jsx` — Fit line to points, show residuals, adjust slope/intercept
- `/src/visualizations/LogisticRegression.jsx` — Decision boundary animation
- `/src/visualizations/DecisionTree.jsx` — Step-by-step splitting with info gain
- `/src/visualizations/KMeansClustering.jsx` — Watch centroids converge step by step
- `/src/visualizations/PCA.jsx` — 2D→1D projection, rotate axes
- `/src/visualizations/ConfusionMatrix.jsx` — Interactive threshold slider showing precision/recall tradeoff
- `/src/visualizations/ROCCurve.jsx` — Threshold sweep animation
- `/src/visualizations/SQLJoins.jsx` — Venn diagram style with actual data rows
- `/src/visualizations/WindowFunctions.jsx` — Show row-by-row computation
- `/src/visualizations/NeuralNetwork.jsx` — Forward pass animation through layers
- `/src/visualizations/Attention.jsx` — Token-to-token attention weights
- `/src/visualizations/BackpropAnimation.jsx` — Gradient flow backwards through network
- `/src/visualizations/ConvolutionFilter.jsx` — Kernel sliding over image
- `/src/visualizations/BayesTheorem.jsx` — Prior → Evidence → Posterior animation
- `/src/visualizations/HypothesisTesting.jsx` — Sampling distribution with rejection region
- `/src/visualizations/ABTestSimulator.jsx` — Run simulated experiments, see p-value distribution
- `/src/visualizations/FunnelAnalysis.jsx` — Animated conversion funnel
- `/src/visualizations/ActivationFunctions.jsx` — Compare ReLU, sigmoid, tanh side by side
- `/src/visualizations/CrossValidation.jsx` — K-fold visual with train/val splits
- `/src/visualizations/RegularizationEffect.jsx` — L1 vs L2 on coefficient paths
- `/src/visualizations/TimeSeriesDecomposition.jsx` — Trend + seasonality + residual
- `/src/visualizations/WordEmbeddings.jsx` — 2D projection of word vectors with analogies
- `/src/visualizations/RecSysCollaborativeFiltering.jsx` — User-item matrix with predictions
- `/src/visualizations/FeatureScaling.jsx` — Before/after normalization
- `/src/visualizations/ETLPipeline.jsx` — Animated data flow through stages
- `/src/visualizations/BatchVsStreaming.jsx` — Side-by-side processing comparison

### Component Spec:
```jsx
// Every viz component must follow this pattern:
const MyVisualization = () => {
  // 1. State for interactive controls
  // 2. Canvas ref for animations
  // 3. useEffect for drawing
  // 4. Return: title, description, canvas, controls

  return (
    <div style={{ background: "#0B1120", borderRadius: 16, padding: 24, border: "1px solid #1E293B" }}>
      <div style={{ fontSize: 18, fontWeight: 700, color: "#F8FAFC", fontFamily: "'Outfit'" }}>Title</div>
      <div style={{ fontSize: 12, color: "#64748B", fontFamily: "'JetBrains Mono'", marginBottom: 16 }}>Instruction text</div>
      <canvas ref={canvasRef} style={{ width: "100%", height: 280, borderRadius: 8 }} />
      {/* Interactive controls */}
    </div>
  );
};
```

---

## DEPT 3: FRONTEND ENGINEERING (Agent: frontend-agent)
**Mission**: Build the main app shell, navigation, course views, question interface, and progress system.
**Output**: Main App component that integrates all other departments' work.
**Quality Bar**: Production-grade UI, smooth navigation, responsive, polished micro-interactions.

### Deliverables:
- `/src/pages/HomePage.jsx` — Course grid, stats, progress overview
- `/src/pages/CoursePage.jsx` — Learn/Practice tabs, topic list, AI tutor button
- `/src/pages/LessonPage.jsx` — Lesson content, embedded visualizations, mark complete
- `/src/pages/QuestionPage.jsx` — Problem display, code editor, submission, model answer reveal, rubric scoring
- `/src/components/Navigation.jsx` — Sticky nav with course shortcuts
- `/src/components/DifficultyBadge.jsx` — Reusable difficulty pill
- `/src/components/ProgressBar.jsx` — Reusable progress indicator
- `/src/components/QuestionCard.jsx` — Reusable question list item
- `/src/components/Timer.jsx` — Practice timer with start/stop/reset
- `/src/components/SearchFilter.jsx` — Search + difficulty + tag filtering
- `/src/App.jsx` — Root component that wires everything together

### UI Requirements:
1. All navigation state managed via useState (no router needed)
2. Progress stored in state (with structure ready for persistent storage)
3. Smooth transitions between views
4. Course colors propagate throughout child components
5. Mobile-responsive (single column on small screens)
6. Code editor area uses JetBrains Mono
7. Rubric breakdown shows checkmarks per criterion

---

## DEPT 4: AI TUTOR SYSTEM (Agent: chatbot-agent)
**Mission**: Build the topic-scoped AI chatbot system.
**Output**: Chatbot component + system prompts for all 9 courses.
**Quality Bar**: Each tutor is an expert in its domain, stays on-topic, gives clear explanations.

### Deliverables:
- `/src/chatbot/AIChatbot.jsx` — Chat UI component (✅ Done, needs polish)
- `/src/chatbot/system-prompts.js` — 9 detailed system prompts
- `/src/chatbot/chatbot-config.js` — Per-course config (name, personality, scope)

### System Prompt Requirements:
Each prompt must include:
1. Expert identity for that specific topic
2. List of all subtopics/lessons the tutor covers
3. Teaching style instructions (use analogies, build intuition, give examples)
4. Scope boundaries (redirect off-topic questions)
5. Interview prep context (relate everything back to interview readiness)
6. Formatting instructions (use markdown, code blocks where relevant)

---

## DEPT 5: INTEGRATION & CODE REVIEW (Agent: review-agent)
**Mission**: Assemble all departments' work into a single working artifact, review for quality, consistency, and bugs.
**Output**: Final integrated `dataspark-mvp.jsx` file.

### Review Checklist:
- [ ] All courses render with correct data
- [ ] All questions display properly (code + open-ended)
- [ ] All visualizations are interactive and animate smoothly
- [ ] AI chatbot connects and responds per-topic
- [ ] Progress tracking works across lessons
- [ ] Difficulty filtering works
- [ ] Search works across questions
- [ ] Navigation between all views works
- [ ] No console errors
- [ ] Dark theme is consistent
- [ ] Fonts load correctly
- [ ] Mobile layout doesn't break

---

## EXECUTION ORDER

### Phase 1: Data Layer (Parallel)
- Curriculum Agent → Generate all question banks
- Viz Agent → Build priority visualizations (top 10)

### Phase 2: UI Layer
- Frontend Agent → Build all page components

### Phase 3: Intelligence Layer
- Chatbot Agent → System prompts + chat polish

### Phase 4: Assembly
- Review Agent → Integrate everything, test, fix, ship

### Phase 5: Scale
- Curriculum Agent → Expand to 40+ questions per course
- Viz Agent → Build remaining 20 visualizations
