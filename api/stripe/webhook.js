import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

// Stripe webhook — the ONLY writer of plan state. Verifies the signature,
// then upserts the user's row in public.user_subscriptions. Configured in
// the Stripe Dashboard to point at /api/stripe/webhook; the signing secret
// it gives you goes in STRIPE_WEBHOOK_SECRET.
//
// Events to enable on the endpoint: checkout.session.completed,
// customer.subscription.created, customer.subscription.updated,
// customer.subscription.deleted.

// Stripe needs the raw, unparsed body to verify the signature.
export const config = { api: { bodyParser: false } };

const ACTIVE_STATUSES = ["active", "trialing"];

function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

function customerIdOf(sub) {
  return typeof sub.customer === "string" ? sub.customer : sub.customer?.id || null;
}

// API versions from 2025-03-31 (Basil) onward moved current_period_end off
// the subscription onto its items — accept either shape.
function periodEndIso(sub) {
  const ts = sub.current_period_end ?? sub.items?.data?.[0]?.current_period_end ?? null;
  return ts ? new Date(ts * 1000).toISOString() : null;
}

// Maps a Stripe subscription object → the row we persist.
function rowFromSubscription(sub, userId) {
  const active = ACTIVE_STATUSES.includes(sub.status);
  return {
    user_id: userId,
    plan: active ? "pro" : "free",
    status: sub.status,
    stripe_customer_id: customerIdOf(sub),
    stripe_subscription_id: sub.id,
    current_period_end: periodEndIso(sub),
    updated_at: new Date().toISOString(),
  };
}

// Finds the Supabase user a subscription belongs to. Checkout sessions carry
// metadata.user_id, but changes made through the billing portal or the Stripe
// Dashboard may not — fall back to the customer id we stored at first checkout.
async function resolveUserId(supabase, sub) {
  if (sub.metadata?.user_id) return sub.metadata.user_id;
  const customerId = customerIdOf(sub);
  if (!customerId) return null;
  const { data } = await supabase
    .from("user_subscriptions")
    .select("user_id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();
  return data?.user_id || null;
}

async function upsertSubscription(supabase, sub, userId) {
  const row = rowFromSubscription(sub, userId);

  // A cancellation for a subscription we no longer track (e.g. the user
  // resubscribed and a stale one lapsed) must not clobber the newer plan.
  if (!ACTIVE_STATUSES.includes(sub.status)) {
    const { data: existing } = await supabase
      .from("user_subscriptions")
      .select("stripe_subscription_id")
      .eq("user_id", userId)
      .maybeSingle();
    if (existing?.stripe_subscription_id && existing.stripe_subscription_id !== sub.id) return;
  }

  const { error } = await supabase
    .from("user_subscriptions")
    .upsert(row, { onConflict: "user_id" });
  if (error) throw new Error(`user_subscriptions upsert failed: ${error.message}`);
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });

  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secretKey || !webhookSecret) return res.status(500).json({ error: "stripe_not_configured" });

  const stripe = new Stripe(secretKey);
  const sig = req.headers["stripe-signature"];

  let event;
  try {
    const raw = await readRawBody(req);
    event = stripe.webhooks.constructEvent(raw, sig, webhookSecret);
  } catch (err) {
    return res.status(400).json({ error: "invalid_signature", message: err?.message });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) return res.status(500).json({ error: "supabase_not_configured" });

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const userId = session.metadata?.user_id || session.client_reference_id;
        if (userId && session.subscription) {
          const subId = typeof session.subscription === "string" ? session.subscription : session.subscription.id;
          const sub = await stripe.subscriptions.retrieve(subId);
          await upsertSubscription(supabase, sub, userId);
        } else {
          console.warn(`[stripe-webhook] ${event.id} checkout session ${session.id} has no user_id/subscription — skipped`);
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        let sub = event.data.object;
        // Events can arrive out of order and their payload shape depends on
        // the account's API version — re-fetch so we act on current state in
        // the SDK's shape. Canceled subscriptions remain retrievable.
        try {
          sub = await stripe.subscriptions.retrieve(sub.id);
        } catch {
          // Fall back to the event payload if retrieval fails.
        }
        const userId = await resolveUserId(supabase, sub);
        if (userId) {
          await upsertSubscription(supabase, sub, userId);
        } else {
          console.warn(`[stripe-webhook] ${event.id} could not map subscription ${sub.id} (customer ${customerIdOf(sub)}) to a user — skipped`);
        }
        break;
      }
      default:
        break;
    }
    return res.status(200).json({ received: true });
  } catch (err) {
    console.error(`[stripe-webhook] ${event.id} (${event.type}) failed:`, err?.message);
    // Non-2xx makes Stripe retry the event with backoff.
    return res.status(500).json({ error: "webhook_handler_failed", message: err?.message });
  }
}
