# Launch checklist — Stripe billing & user readiness

Everything the code expects from the outside world before real users can pay.
The code side (checkout, webhook, portal, plan gating) is done; each item below
is a one-time dashboard/console step.

## 1. Supabase

- [ ] Apply every migration in `supabase/migrations/` to the production project
      (SQL editor or `supabase db push`). Billing depends on
      `20260616000002_user_subscriptions.sql`; the AI tutor limits depend on
      `20260611000001_chatbot_usage.sql`.
- [ ] Confirm RLS is enabled on `user_subscriptions` (the migration does this)
      and that no write policy exists — only the webhook writes, via the
      service-role key.
- [ ] In Auth → URL Configuration, make sure the production domain is in the
      redirect allow-list (Google sign-in returns there).

## 2. Stripe Dashboard

- [ ] Create the product **DataSpark Pro** with two recurring prices in AUD:
      - A$20 / month → copy the price ID into `STRIPE_PRICE_PRO_MONTHLY`
      - A$180 / year → copy the price ID into `STRIPE_PRICE_PRO_ANNUAL`
      (These must match `src/pages/PricingPage.jsx`, which displays A$20/mo and
      A$180/yr.)
- [ ] Developers → Webhooks → Add endpoint:
      `https://<production-domain>/api/stripe/webhook`
      with exactly these events:
      - `checkout.session.completed`
      - `customer.subscription.created`
      - `customer.subscription.updated`
      - `customer.subscription.deleted`
      Copy the signing secret into `STRIPE_WEBHOOK_SECRET`.
- [ ] Settings → Billing → Customer portal: click **Save** on the default
      configuration (allow cancel + payment-method update). The portal API
      returns an error until a default configuration has been saved once.

## 3. Vercel environment variables

Server-only (no `VITE_` prefix — never exposed to the browser):

| Variable | Source |
|---|---|
| `STRIPE_SECRET_KEY` | Stripe → API keys |
| `STRIPE_WEBHOOK_SECRET` | webhook endpoint created above |
| `STRIPE_PRICE_PRO_MONTHLY` | monthly price ID |
| `STRIPE_PRICE_PRO_ANNUAL` | annual price ID |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → API settings |
| `SUPABASE_URL` | Supabase → API settings |
| `ANTHROPIC_API_KEY` (or `GEMINI_API_KEY`) | AI tutor + answer evaluation |

Browser (safe to expose):

| Variable | Source |
|---|---|
| `VITE_SUPABASE_URL` | Supabase → API settings |
| `VITE_SUPABASE_ANON_KEY` | Supabase → API settings |

Redeploy after setting them — Vite inlines `VITE_*` values at build time.

## 4. End-to-end test (Stripe test mode first)

1. Sign up with a fresh account → platform loads on the Free plan, lessons
   beyond the first 2 per course show the lock.
2. Pricing page → Upgrade to Pro → pay with card `4242 4242 4242 4242`.
3. Redirect lands on `/platform?upgraded=1`; within a few seconds the PRO
   badge appears and locked lessons open (the page re-polls the plan while the
   webhook catches up).
4. Stripe Dashboard → the webhook delivery for `checkout.session.completed`
   shows `200`; Supabase `user_subscriptions` has the row with `plan = 'pro'`,
   `status = 'active'`, and a non-null `current_period_end`.
5. Avatar menu → Manage billing → cancel the subscription → row flips to
   `plan = 'free'` (immediately if canceled now, at period end otherwise).
6. AI tutor: free account is cut off after 5 messages/day, Pro after 20.
7. Repeat step 2 once with live keys and a real card, then refund yourself
   from the Stripe Dashboard.

## 5. Known behavior to be aware of

- The webhook is the only writer of plan state; if a delivery fails Stripe
  retries with backoff (we return 500 on handler errors on purpose).
- Subscriptions changed from the Stripe Dashboard or billing portal are mapped
  back to the user via the stored `stripe_customer_id`, so manual comps
  ("gift a sub" from the dashboard) work as long as the customer was created
  through our checkout at least once.
- A user who is already Pro gets a 409 from `/api/stripe/checkout` — they
  can't accidentally double-subscribe.
