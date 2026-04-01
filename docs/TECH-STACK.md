# DataSpark — Tech Stack & Database Architecture

## Tech Stack (Final)

```
┌─────────────────────────────────────────────────────────┐
│                      FRONTEND                            │
│  Next.js 14+ (App Router)                               │
│  TypeScript                                              │
│  Tailwind CSS                                            │
│  Fonts: Outfit + JetBrains Mono                         │
│  Canvas API (visualizations)                             │
│  Monaco Editor (code sandbox)                            │
├─────────────────────────────────────────────────────────┤
│                     BACKEND                              │
│  Next.js API Routes (server-side)                        │
│  Claude API (AI tutors + answer evaluation)              │
│  Judge0 API or Piston (code execution sandbox)           │
├─────────────────────────────────────────────────────────┤
│                    DATABASE                              │
│  Supabase                                                │
│  ├── PostgreSQL (relational data)                        │
│  ├── Auth (Google, GitHub, email/password)               │
│  ├── Row Level Security (user data isolation)            │
│  ├── Real-time subscriptions (live progress updates)     │
│  └── Storage (user uploads if needed)                    │
├─────────────────────────────────────────────────────────┤
│                   DEPLOYMENT                             │
│  Vercel (frontend + API routes)                          │
│  Supabase Cloud (database)                               │
│  Anthropic API (Claude)                                  │
└─────────────────────────────────────────────────────────┘
```

## Why This Stack

| Decision | Choice | Reasoning |
|----------|--------|-----------|
| Framework | Next.js 14 (App Router) | SSR for SEO, API routes for Claude calls, React ecosystem |
| Language | TypeScript | 285+ questions, 9 courses, complex progression = need type safety |
| Database | Supabase (Postgres) | Progression system is deeply relational (prerequisites, scores, spaced repetition). Postgres handles this natively. Auth + RLS included free. |
| Styling | Tailwind CSS | Fast, utility-first, works perfectly with Next.js |
| AI | Claude API (server-side) | AI tutors + rubric evaluation. Server-side keeps API key secure |
| Code Execution | Judge0 / Piston API | Run student Python/SQL safely in sandboxed containers |
| Editor | Monaco Editor | VS Code's editor as a React component. Syntax highlighting, autocomplete |
| Hosting | Vercel | One-click deploy from GitHub, automatic previews on PRs |

---

## Database Schema (Supabase / PostgreSQL)

### Users & Auth
```sql
-- Handled by Supabase Auth, extended with profile
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  display_name TEXT,
  avatar_url TEXT,
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  last_active_date DATE,
  total_xp INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Course & Content Structure
```sql
CREATE TABLE courses (
  id TEXT PRIMARY KEY,              -- 'python', 'sql', 'statistics'
  title TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  accent TEXT,
  description TEXT,
  sort_order INT,
  is_published BOOLEAN DEFAULT true
);

CREATE TABLE modules (
  id TEXT PRIMARY KEY,              -- 'py-basics', 'sql-advanced'
  course_id TEXT REFERENCES courses(id),
  title TEXT NOT NULL,
  sort_order INT,
  prerequisite_module_id TEXT REFERENCES modules(id)
);

CREATE TABLE lessons (
  id TEXT PRIMARY KEY,              -- 'py-b1', 'ml-f2'
  module_id TEXT REFERENCES modules(id),
  course_id TEXT REFERENCES courses(id),
  title TEXT NOT NULL,
  duration TEXT,                     -- '15 min'
  sort_order INT,
  
  -- Content layers
  written_content TEXT,              -- markdown
  video_url TEXT,
  video_channel TEXT,
  video_title TEXT,
  video_start_time INT DEFAULT 0,
  visualization_component TEXT,      -- 'NormalDistribution', 'GradientDescent'
  code_sandbox_language TEXT,        -- 'python', 'sql', NULL
  code_sandbox_starter TEXT,
  code_sandbox_solution TEXT,
  
  -- Knowledge check (JSONB array)
  knowledge_check JSONB,             -- [{question, options, correct, explanation}]
  
  -- Prerequisites
  requires_lesson_id TEXT REFERENCES lessons(id),
  
  -- Metadata
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cross-course prerequisites
CREATE TABLE course_prerequisites (
  course_id TEXT REFERENCES courses(id),
  requires_course_id TEXT REFERENCES courses(id),
  gate_type TEXT CHECK (gate_type IN ('hard', 'soft')),
  min_mastery_pct INT DEFAULT 60,
  PRIMARY KEY (course_id, requires_course_id)
);
```

### Questions & Practice
```sql
CREATE TABLE questions (
  id TEXT PRIMARY KEY,              -- 'py-q01'
  course_id TEXT REFERENCES courses(id),
  module_id TEXT REFERENCES modules(id),
  title TEXT NOT NULL,
  difficulty TEXT CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  company TEXT,
  question_type TEXT CHECK (question_type IN ('code', 'open-ended')),
  language TEXT,                     -- 'python', 'sql', NULL
  estimated_minutes INT,
  
  prompt TEXT NOT NULL,
  hints TEXT[],                      -- progressive hints array
  model_answer TEXT NOT NULL,
  rubric TEXT[],                     -- scoring criteria
  common_mistakes TEXT[],
  tags TEXT[],
  
  -- Linked lessons
  related_lesson_ids TEXT[],
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### User Progress & Scoring
```sql
-- Lesson completion
CREATE TABLE user_lesson_progress (
  user_id UUID REFERENCES profiles(id),
  lesson_id TEXT REFERENCES lessons(id),
  status TEXT CHECK (status IN ('not_started', 'in_progress', 'completed', 'mastered')),
  knowledge_check_score INT,         -- percentage
  completed_at TIMESTAMPTZ,
  time_spent_seconds INT DEFAULT 0,
  PRIMARY KEY (user_id, lesson_id)
);

-- Question attempts
CREATE TABLE user_question_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  question_id TEXT REFERENCES questions(id),
  user_answer TEXT,
  
  -- AI evaluation results
  ai_score INT,                      -- 0-100
  ai_feedback TEXT,
  rubric_results JSONB,              -- [{criterion, met: bool, feedback}]
  
  time_spent_seconds INT,
  hints_used INT DEFAULT 0,
  attempted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mastery scores (materialized / computed)
CREATE TABLE user_mastery (
  user_id UUID REFERENCES profiles(id),
  course_id TEXT REFERENCES courses(id),
  module_id TEXT REFERENCES modules(id),
  mastery_pct INT DEFAULT 0,         -- 0-100
  lessons_completed INT DEFAULT 0,
  lessons_total INT,
  questions_attempted INT DEFAULT 0,
  questions_avg_score INT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, module_id)
);

-- Course-level mastery (aggregated)
CREATE TABLE user_course_mastery (
  user_id UUID REFERENCES profiles(id),
  course_id TEXT REFERENCES courses(id),
  mastery_pct INT DEFAULT 0,
  is_unlocked BOOLEAN DEFAULT false,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  PRIMARY KEY (user_id, course_id)
);
```

### Spaced Repetition
```sql
CREATE TABLE user_review_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  question_id TEXT REFERENCES questions(id),
  
  -- Spaced repetition state
  next_review_date DATE NOT NULL,
  interval_days INT DEFAULT 1,       -- 1, 3, 7, 14, 30
  ease_factor FLOAT DEFAULT 2.5,     -- SM-2 algorithm
  consecutive_correct INT DEFAULT 0,
  
  -- History
  last_reviewed_at TIMESTAMPTZ,
  times_reviewed INT DEFAULT 0,
  times_correct INT DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for efficient "what's due today" query
CREATE INDEX idx_review_due ON user_review_queue(user_id, next_review_date)
WHERE next_review_date <= CURRENT_DATE;
```

### AI Chat History
```sql
CREATE TABLE chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  course_id TEXT REFERENCES courses(id),
  role TEXT CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  context_lesson_id TEXT REFERENCES lessons(id),  -- which lesson they were on
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Keep last 50 messages per course per user for context
CREATE INDEX idx_chat_recent ON chat_messages(user_id, course_id, created_at DESC);
```

### Streaks & Activity
```sql
CREATE TABLE user_daily_activity (
  user_id UUID REFERENCES profiles(id),
  activity_date DATE NOT NULL,
  lessons_completed INT DEFAULT 0,
  questions_attempted INT DEFAULT 0,
  reviews_completed INT DEFAULT 0,
  minutes_spent INT DEFAULT 0,
  PRIMARY KEY (user_id, activity_date)
);
```

---

## Row Level Security (RLS) Policies

```sql
-- Users can only see/edit their own progress
ALTER TABLE user_lesson_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own progress" ON user_lesson_progress
  FOR ALL USING (auth.uid() = user_id);

ALTER TABLE user_question_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own attempts" ON user_question_attempts
  FOR ALL USING (auth.uid() = user_id);

ALTER TABLE user_review_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own queue" ON user_review_queue
  FOR ALL USING (auth.uid() = user_id);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own chats" ON chat_messages
  FOR ALL USING (auth.uid() = user_id);

-- Everyone can read courses, lessons, questions (public content)
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read courses" ON courses FOR SELECT USING (true);

ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read lessons" ON lessons FOR SELECT USING (true);

ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read questions" ON questions FOR SELECT USING (true);
```

---

## Key API Routes (Next.js)

```
/api/auth/          → Supabase Auth (handled by @supabase/ssr)
/api/ai/chat        → POST: Send message to course-scoped Claude tutor
/api/ai/evaluate    → POST: Submit answer for AI rubric evaluation
/api/code/execute   → POST: Run Python/SQL in sandboxed environment
/api/progress/      → GET/POST: User lesson and question progress
/api/review/        → GET: Today's review queue
/api/review/submit  → POST: Submit review answer, update schedule
```

---

## Project Structure (Next.js)

```
dataspark/
├── app/
│   ├── layout.tsx                 # Root layout with Supabase provider
│   ├── page.tsx                   # Home / dashboard
│   ├── login/page.tsx             # Auth page
│   ├── courses/
│   │   ├── page.tsx               # All courses overview
│   │   └── [courseId]/
│   │       ├── page.tsx           # Course page (modules + progress)
│   │       └── [lessonId]/
│   │           └── page.tsx       # Lesson page (content + video + viz)
│   ├── practice/
│   │   ├── page.tsx               # All questions browser
│   │   └── [questionId]/
│   │       └── page.tsx           # Question workspace
│   ├── review/
│   │   └── page.tsx               # Spaced repetition queue
│   └── api/
│       ├── ai/
│       │   ├── chat/route.ts      # AI tutor endpoint
│       │   └── evaluate/route.ts  # Answer evaluation endpoint
│       ├── code/
│       │   └── execute/route.ts   # Code sandbox execution
│       └── progress/
│           └── route.ts           # Progress tracking
├── components/
│   ├── ui/                        # Reusable UI components
│   ├── visualizations/            # Interactive animated diagrams
│   ├── editor/                    # Monaco code editor wrapper
│   ├── chat/                      # AI chatbot component
│   └── progression/               # Progress bars, mastery badges, etc.
├── lib/
│   ├── supabase/
│   │   ├── client.ts              # Browser client
│   │   ├── server.ts              # Server client
│   │   └── middleware.ts          # Auth middleware
│   ├── claude.ts                  # Claude API wrapper
│   ├── types.ts                   # TypeScript types for all entities
│   └── constants.ts               # Course colors, config
├── data/
│   ├── questions/                 # Question bank JSON files
│   ├── lessons/                   # Lesson content markdown
│   └── videos.ts                  # Curated video database
├── public/
│   └── fonts/
├── supabase/
│   └── migrations/                # Database migration files
├── tailwind.config.ts
├── next.config.ts
├── tsconfig.json
├── package.json
└── .env.local                     # SUPABASE_URL, SUPABASE_ANON_KEY, CLAUDE_API_KEY
```

---

## Environment Variables

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...    # Server-side only
ANTHROPIC_API_KEY=sk-ant-...            # Server-side only
JUDGE0_API_KEY=...                      # Code execution (optional)
```

---

## Getting Started (Development)

```bash
# 1. Clone and install
git clone https://github.com/yourusername/dataspark.git
cd dataspark
npm install

# 2. Set up Supabase
# Create project at supabase.com
# Run migrations: npx supabase db push

# 3. Environment variables
cp .env.example .env.local
# Fill in your Supabase and Claude API keys

# 4. Run dev server
npm run dev
# Open http://localhost:3000

# 5. Seed question data
npm run seed  # loads question banks into Supabase
```

---

## Claude Code Migration Plan

The current prototypes (dataspark-platform.jsx, dataspark-full-platform.jsx) are 
standalone React components. To migrate to Next.js + Supabase:

### Step 1: Scaffold Next.js project
```bash
npx create-next-app@latest dataspark --typescript --tailwind --app --src-dir
cd dataspark
npm install @supabase/supabase-js @supabase/ssr @anthropic-ai/sdk
npm install @monaco-editor/react lucide-react
```

### Step 2: Set up Supabase
- Create project on supabase.com
- Run the SQL schema from this document
- Configure auth providers (Google, GitHub)
- Set up RLS policies

### Step 3: Migrate components
- Extract visualizations from prototype → components/visualizations/
- Extract question data → data/questions/
- Build pages following the app/ structure above
- Wire up Supabase for progress tracking
- Wire up Claude API for AI tutors

### Step 4: Content loading
- Seed question banks into Supabase
- Add curated video URLs to lessons
- Write lesson content (markdown)

### Step 5: Deploy
- Push to GitHub
- Connect to Vercel
- Set environment variables in Vercel dashboard
- Done
