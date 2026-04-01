# AGENT 5: Integration, Testing & Deployment
## Role: Orchestration Agent
## Scope: Project scaffolding, wiring agents together, testing, deployment

---

## YOUR IDENTITY
You are the Integration Agent for DataSpark. You set up the project skeleton, ensure all agents' work fits together, handle deployment to Vercel, and catch bugs at the seams. You run first (scaffolding) and last (integration testing).

## TASK 1: Scaffold the Next.js Project (RUN THIS FIRST)

```bash
npx create-next-app@latest dataspark --typescript --tailwind --app --src-dir --use-npm
cd dataspark

# Core dependencies
npm install @supabase/supabase-js @supabase/ssr @anthropic-ai/sdk

# UI dependencies  
npm install @monaco-editor/react lucide-react

# Fonts (via next/font)
# Manrope and JetBrains Mono — configure in layout.tsx
```

## TASK 2: Project Structure
Create this folder structure:

```
dataspark/
├── src/
│   ├── app/
│   │   ├── layout.tsx              ← Root layout (fonts, metadata, Supabase provider)
│   │   ├── page.tsx                ← Landing page (Agent 1)
│   │   ├── confirmed/page.tsx      ← Waitlist confirmation (Agent 1)
│   │   ├── privacy/page.tsx        ← Privacy policy (Agent 1)
│   │   ├── terms/page.tsx          ← Terms of service (Agent 1)
│   │   ├── dashboard/page.tsx      ← Main app dashboard (Agent 3)
│   │   ├── courses/
│   │   │   ├── page.tsx            ← Course browser (Agent 3)
│   │   │   └── [courseId]/
│   │   │       ├── page.tsx        ← Course detail (Agent 3)
│   │   │       └── [lessonId]/
│   │   │           └── page.tsx    ← Lesson viewer (Agent 3)
│   │   ├── practice/
│   │   │   ├── page.tsx            ← Question browser (Agent 3)
│   │   │   └── [questionId]/
│   │   │       └── page.tsx        ← Question workspace (Agent 3)
│   │   ├── review/page.tsx         ← Spaced repetition (Agent 3)
│   │   └── api/
│   │       ├── waitlist/route.ts   ← Waitlist signup (Agent 2)
│   │       └── ai/
│   │           ├── chat/route.ts   ← AI tutor (Agent 4)
│   │           └── evaluate/route.ts ← Answer eval (Agent 4)
│   ├── components/
│   │   ├── ui/                     ← Shared: Logo, Footer, buttons
│   │   ├── landing/                ← Landing page components (Agent 1)
│   │   ├── platform/               ← Core app components (Agent 3)
│   │   ├── visualizations/         ← Interactive diagrams (Agent 3)
│   │   └── ai/                     ← Chatbot + eval UI (Agent 4)
│   ├── data/
│   │   ├── courses.ts              ← Course catalog (Agent 3)
│   │   ├── system-prompts.ts       ← AI tutor prompts (Agent 4)
│   │   └── questions/              ← Question banks per course (Agent 3)
│   └── lib/
│       ├── supabase/               ← Supabase clients (Agent 2)
│       ├── claude.ts               ← Claude API wrapper (Agent 4)
│       ├── types.ts                ← Shared TypeScript types
│       ├── progression.ts          ← Mastery + gating logic (Agent 3)
│       └── spaced-repetition.ts    ← SM-2 algorithm (Agent 3)
├── supabase/
│   └── migrations/                 ← SQL migrations (Agent 2)
├── public/
│   └── fonts/
├── docs/                           ← Architecture docs (already exist)
├── tailwind.config.ts
├── next.config.ts
├── tsconfig.json
├── package.json
├── .env.local.example
└── .gitignore
```

## TASK 3: Root Layout
Create `src/app/layout.tsx`:

```typescript
import type { Metadata } from 'next'
import { Manrope, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'DataSpark — Stop Memorizing Syntax. Start Solving Systems.',
  description: 'The data science interview prep platform that teaches architecture decisions, business reasoning, and system design thinking — not just SQL drills.',
  openGraph: {
    title: 'DataSpark — Stop Memorizing Syntax. Start Solving Systems.',
    description: 'Master the logic behind the code. AI-powered evaluation, 285+ practice scenarios, 9 courses.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${manrope.variable} ${jetbrains.variable}`}>
      <body className="bg-[#020617] text-[#F8FAFC] font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
```

## TASK 4: Tailwind Configuration
Update `tailwind.config.ts` with the DataSpark design system:

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      colors: {
        ds: {
          bg: '#020617',
          card: '#0B1120',
          elevated: '#0C1425',
          border: '#1E293B',
          indigo: '#818CF8',
          lime: '#34D399',
          cta: '#6366F1',
        }
      },
      animation: {
        breathe: 'breathe 3s ease infinite',
        marquee: 'marquee 30s linear infinite',
      },
      keyframes: {
        breathe: {
          '0%, 100%': { boxShadow: '0 4px 16px rgba(99,102,241,0.35)' },
          '50%': { boxShadow: '0 4px 28px rgba(99,102,241,0.55)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
```

## TASK 5: Shared Types
Create `src/lib/types.ts` — the single source of truth for TypeScript types used across all agents:

```typescript
// Course types (Agent 3)
export interface Lesson { ... }
export interface Module { ... }
export interface Course { ... }

// Question types (Agent 3)
export interface Question { ... }

// User progress types (Agent 2 + 3)
export interface UserProgress { ... }
export interface MasteryScore { ... }

// AI types (Agent 4)
export interface ChatMessage { ... }
export interface EvaluationResult { ... }

// Waitlist types (Agent 2)
export interface WaitlistEntry { ... }
```

## TASK 6: Integration Testing Checklist
After all agents have built their parts, verify these end-to-end flows:

### Flow 1: Waitlist Signup
1. Visit landing page → see live waitlist count
2. Enter email → click "Secure Your Spot"
3. Valid email → POST /api/waitlist → success → redirect to /confirmed
4. Invalid email → inline error message
5. Duplicate email → "already on the waitlist" message
6. Confirmation page shows referral code + share link

### Flow 2: Course Browsing
1. Dashboard shows 9 courses with progress
2. Click course → see modules + lessons
3. Locked courses show prerequisite message
4. Click lesson → see content + video + visualization
5. Mark complete → progress bar updates
6. Module quiz unlocks next module

### Flow 3: Practice Question
1. Browse questions → filter by difficulty/course
2. Click question → see problem + context
3. Write answer in editor → start timer
4. Submit → AI evaluation scores against rubric
5. View model answer + rubric breakdown
6. Wrong questions enter spaced repetition queue

### Flow 4: AI Tutor
1. Click "Ask Tutor" from any lesson or question
2. Chat panel opens with correct tutor for that course
3. Send message → get relevant, on-topic response
4. Off-topic question → polite redirect
5. From a question page → tutor has context about the question

## TASK 7: Deployment to Vercel

```bash
# Connect to Vercel
npx vercel

# Set environment variables in Vercel dashboard:
# NEXT_PUBLIC_SUPABASE_URL
# NEXT_PUBLIC_SUPABASE_ANON_KEY
# SUPABASE_SERVICE_ROLE_KEY
# ANTHROPIC_API_KEY

# Deploy
npx vercel --prod
```

Vercel settings:
- Framework: Next.js (auto-detected)
- Build command: `next build`
- Output directory: `.next`
- Node.js version: 20.x

## AGENT EXECUTION ORDER

```
Phase 1 (Parallel):
  Agent 5 (you) → Scaffold project, create structure, shared types
  Agent 2 → Supabase setup, waitlist migration, API route

Phase 2 (Parallel, after Phase 1):
  Agent 1 → Port landing page to Next.js, build confirmation page
  Agent 3 → Build course data, dashboard, lesson viewer
  Agent 4 → Claude wrapper, system prompts, chatbot component

Phase 3 (Sequential):
  Agent 3 → Wire up Supabase for progress tracking
  Agent 4 → Wire up chatbot into lesson/question pages
  Agent 5 → Integration testing, bug fixes

Phase 4:
  Agent 5 → Deploy to Vercel
  Agent 3 → Generate remaining question banks
  Agent 3 → Build remaining visualizations
```

## QUALITY GATES
Before deploying:
- [ ] `npm run build` completes with zero errors
- [ ] `npm run lint` passes
- [ ] All 4 end-to-end flows work
- [ ] Mobile responsive (test at 375px, 768px, 1440px)
- [ ] Lighthouse > 90 on landing page
- [ ] No exposed API keys in client-side code
- [ ] .env.local.example has all required variables documented
- [ ] README updated with setup instructions