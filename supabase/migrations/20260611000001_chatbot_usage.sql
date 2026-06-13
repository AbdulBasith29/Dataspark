-- =============================================================================
-- DataSpark · Chatbot usage tracking (daily rate limiting)
-- Run in: Supabase Dashboard → SQL Editor → New query → Run
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.chatbot_usage (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date          DATE        NOT NULL DEFAULT CURRENT_DATE,
  message_count INTEGER     NOT NULL DEFAULT 0,
  CONSTRAINT chatbot_usage_user_date_unique UNIQUE (user_id, date)
);

ALTER TABLE public.chatbot_usage ENABLE ROW LEVEL SECURITY;

-- Users can only read their own usage (for showing the counter in the UI)
DROP POLICY IF EXISTS "chatbot_usage: owner select" ON public.chatbot_usage;
CREATE POLICY "chatbot_usage: owner select"
  ON public.chatbot_usage FOR SELECT
  USING (auth.uid() = user_id);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS chatbot_usage_user_date_idx
  ON public.chatbot_usage (user_id, date DESC);

-- Grants (service role bypasses RLS anyway, but good practice)
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON TABLE public.chatbot_usage TO authenticated;
