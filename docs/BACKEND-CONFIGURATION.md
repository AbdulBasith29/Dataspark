# Browser and backend configuration

The current application is React 18 + Vite with hosted handlers in api/.
VITE_* variables are public and must never contain privileged keys.
vite.config.js also explicitly exposes SUPABASE_URL and SUPABASE_ANON_KEY
for existing deployments. No other SUPABASE_* variable is browser configuration.

Production chat requires SUPABASE_URL (or VITE_SUPABASE_URL),
SUPABASE_SERVICE_ROLE_KEY, and ANTHROPIC_API_KEY or GEMINI_API_KEY.
Missing/invalid admin configuration returns 503; a bearer token is never treated
as anonymous authenticated access. Missing AI provider keys return 503 for chat
and evaluation. The practice client already stops before saving a score on non-2xx.

The separate Vite AI middleware is local development infrastructure; it does not
implement production chat identity/quota enforcement. Do not expose the dev
server publicly or use it as the mobile backend. Test hosted-handler behaviour
with the regression suite and a controlled staging deployment.

Run: node --test tests/*.test.mjs, npm run build, npm run lint.
The environment test builds a fixture with harmless secret sentinels; it never
uses real service credentials. Existing VITE_* and legacy public aliases are tested.

Before deployment (not performed by this PR), confirm the backend variables are
configured. NOT VERIFIED: deployed environment, historic secret exposure,
live login/AI/Stripe requests, and database policy enforcement. If an actual
deployed bundle contains a privileged key, rotate it through the owner-managed
credential process; this source change alone cannot revoke exposed credentials.

Follow-ups: evaluation authentication and provider-failure grading, server-owned
chat settings, atomic quota enforcement and database-error handling.
These are not solved by configuration guards. Existing Stripe/certificate
handlers already deny requests when admin configuration is absent.

Rollback: revert this PR to restore prior code, but that restores the exposure
risk and permissive chat fallback. Prefer correcting configuration before rollout.
