-- Address Supabase security-advisor warnings (applied to prod 2026-07-08):
-- 1. Pin search_path on set_updated_at (mutable search_path warning).
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

-- 2. Trigger-only SECURITY DEFINER functions must not be callable through
--    the public RPC API.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;
