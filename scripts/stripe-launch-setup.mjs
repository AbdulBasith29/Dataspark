#!/usr/bin/env node
// One-command Stripe provisioning for launch. Idempotent — safe to re-run.
//
//   STRIPE_SECRET_KEY=sk_test_... SITE_URL=https://your-domain.com \
//     node scripts/stripe-launch-setup.mjs
//
// Creates (or finds, if already created):
//   1. Product "DataSpark Pro"
//   2. Recurring prices A$20/mo and A$180/yr (lookup keys dataspark_pro_monthly / dataspark_pro_annual)
//   3. Webhook endpoint at ${SITE_URL}/api/stripe/webhook with the events api/stripe/webhook.js handles
//   4. A billing-portal configuration (cancel + payment-method update)
// then prints the exact env vars to set on Vercel.
//
// Run once against test keys, verify the flow, then once against live keys.

import Stripe from "stripe";

const secretKey = process.env.STRIPE_SECRET_KEY;
const siteUrl = (process.env.SITE_URL || "").replace(/\/$/, "");

if (!secretKey || !siteUrl) {
  console.error("Usage: STRIPE_SECRET_KEY=sk_... SITE_URL=https://your-domain.com node scripts/stripe-launch-setup.mjs");
  process.exit(1);
}
if (!/^https:\/\//.test(siteUrl)) {
  console.error(`SITE_URL must be an https:// URL (got "${siteUrl}") — Stripe rejects non-HTTPS webhook endpoints.`);
  process.exit(1);
}

const stripe = new Stripe(secretKey);
const live = secretKey.startsWith("sk_live");
console.log(`Provisioning Stripe (${live ? "LIVE" : "test"} mode) for ${siteUrl}\n`);

// ── 1. Product ──────────────────────────────────────────────────────────────
const PRODUCT_NAME = "DataSpark Pro";
let product = (await stripe.products.search({ query: `active:'true' AND name:'${PRODUCT_NAME}'` })).data[0];
if (product) {
  console.log(`✓ Product exists: ${product.id}`);
} else {
  product = await stripe.products.create({
    name: PRODUCT_NAME,
    description: "Full curriculum, certificates, and the complete AI tutor.",
  });
  console.log(`+ Created product: ${product.id}`);
}

// ── 2. Prices (A$20/mo, A$180/yr — must match src/pages/PricingPage.jsx) ────
async function ensurePrice(lookupKey, unitAmount, interval) {
  const existing = (await stripe.prices.list({ lookup_keys: [lookupKey], limit: 1 })).data[0];
  if (existing) {
    console.log(`✓ Price exists (${lookupKey}): ${existing.id}`);
    return existing;
  }
  const price = await stripe.prices.create({
    product: product.id,
    currency: "aud",
    unit_amount: unitAmount,
    recurring: { interval },
    lookup_key: lookupKey,
    nickname: `Pro ${interval}ly`,
  });
  console.log(`+ Created price (${lookupKey}): ${price.id}`);
  return price;
}
const monthly = await ensurePrice("dataspark_pro_monthly", 2000, "month");
const annual = await ensurePrice("dataspark_pro_annual", 18000, "year");

// ── 3. Webhook endpoint (must match the events api/stripe/webhook.js handles) ─
const WEBHOOK_URL = `${siteUrl}/api/stripe/webhook`;
const WEBHOOK_EVENTS = [
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
];
let endpoint = (await stripe.webhookEndpoints.list({ limit: 100 })).data.find((e) => e.url === WEBHOOK_URL);
let webhookSecretNote;
if (endpoint) {
  console.log(`✓ Webhook endpoint exists: ${endpoint.id}`);
  const missing = WEBHOOK_EVENTS.filter((ev) => !endpoint.enabled_events.includes(ev) && !endpoint.enabled_events.includes("*"));
  if (missing.length) {
    endpoint = await stripe.webhookEndpoints.update(endpoint.id, {
      enabled_events: [...new Set([...endpoint.enabled_events, ...WEBHOOK_EVENTS])],
    });
    console.log(`  updated enabled events (+${missing.join(", +")})`);
  }
  // The signing secret is only revealed at creation time.
  webhookSecretNote = `<unchanged — reveal it in Dashboard → Webhooks → ${endpoint.id}>`;
} else {
  endpoint = await stripe.webhookEndpoints.create({
    url: WEBHOOK_URL,
    enabled_events: WEBHOOK_EVENTS,
    description: "DataSpark plan sync (api/stripe/webhook.js)",
  });
  console.log(`+ Created webhook endpoint: ${endpoint.id}`);
  webhookSecretNote = endpoint.secret;
}

// ── 4. Billing-portal configuration ─────────────────────────────────────────
// api/stripe/portal.js uses STRIPE_PORTAL_CONFIG_ID when set, so this works
// even if no default portal configuration was ever saved in the Dashboard.
let portalConfig = (await stripe.billingPortal.configurations.list({ active: true, limit: 100 })).data
  .find((c) => c.metadata?.app === "dataspark");
if (portalConfig) {
  console.log(`✓ Portal configuration exists: ${portalConfig.id}`);
} else {
  portalConfig = await stripe.billingPortal.configurations.create({
    business_profile: { headline: "DataSpark — manage your Pro subscription" },
    features: {
      customer_update: { enabled: true, allowed_updates: ["email", "address"] },
      invoice_history: { enabled: true },
      payment_method_update: { enabled: true },
      subscription_cancel: { enabled: true, mode: "at_period_end" },
    },
    metadata: { app: "dataspark" },
  });
  console.log(`+ Created portal configuration: ${portalConfig.id}`);
}

// ── Output ──────────────────────────────────────────────────────────────────
console.log(`
Done. Set these on Vercel (${live ? "Production" : "Preview/Development"}) and redeploy:

STRIPE_SECRET_KEY=${secretKey.slice(0, 12)}… (the key you just used)
STRIPE_WEBHOOK_SECRET=${webhookSecretNote}
STRIPE_PRICE_PRO_MONTHLY=${monthly.id}
STRIPE_PRICE_PRO_ANNUAL=${annual.id}
STRIPE_PORTAL_CONFIG_ID=${portalConfig.id}

Remaining (see docs/LAUNCH-CHECKLIST.md): SUPABASE_SERVICE_ROLE_KEY + AI key on
Vercel, apply supabase/migrations/, then run the end-to-end test with card
4242 4242 4242 4242.`);
