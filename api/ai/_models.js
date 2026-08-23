/**
 * Single source of truth for the provider model IDs this app calls.
 *
 * These were previously inlined in three files (api/ai/evaluate.js,
 * api/ai/chat.js, vite-dev-ai-api.mjs). They drifted — dev and prod were on
 * different Gemini models — and when claude-sonnet-4-20250514 was retired on
 * 2026-06-15 every Claude call started failing with nothing pointing at the
 * cause. One constant per provider, imported everywhere, so the next
 * retirement is a one-line fix.
 *
 * Both can be overridden per environment without a redeploy of code:
 *   ANTHROPIC_MODEL=claude-... / GEMINI_MODEL=gemini-...
 *
 * Verify these are live before trusting a deploy:  npm run verify:models
 * Retirement schedule: https://docs.claude.com/en/docs/about-claude/model-deprecations
 *
 * Tier note: evaluation and chat are per-submission calls, so they sit on
 * Sonnet deliberately. Opus belongs on the low-confidence escalation path
 * (backlog task 2.3), not on every scoring request.
 */

export const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";

export const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
