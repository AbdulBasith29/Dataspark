import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

// Stripe webhook — the ONLY writer of plan state. Verifies the signature,
// then upserts the user's row in public.user_subscriptions. Configured in
// the Stripe Dashboard to point at /api/stripe/webhook; the signing secret
// it gives you goes in STRIPE_WEBHOOK_SECRET.

// Stripe needs the raw, unparsed body to verify the signature.
export const config = { api: { bodyParser: false } };

function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

function readRawBody(req) {
  if (Buffer.isBuffer(req.body)) return Promise.resolve(req.body);
  if (typeof req.body === "string") return Promise.resolve(Buffer.from(req.body));

  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

function subscriptionCustomerId(sub) {
  return typeof sub.customer === "string" ? sub.customer : sub.customer?.id;
}

// Maps a Stripe subscription object → the row we persist.
function rowFromSubscription(sub, userId) {
  const active = ["active", "trialing"].includes(sub.status);
  return {
    user_id: userId,
    plan: active ? "pro" : "free",
    status: sub.status,
    stripe_customer_id: subscriptionCustomerId(sub),
    stripe_subscription_id: sub.id,
    current_period_end: sub.current_period_end
      ? new Date(sub.current_period_end * 1000).toISOString()
      : null,
    updated_at: new Date().toISOString(),
  };
}

async function findUserIdForSubscription(supabase, sub) {
  const metadataUserId = sub.metadata?.user_id;
  if (metadataUserId) return metadataUserId;

  const customerId = subscriptionCustomerId(sub);
  let query = supabase
    .from("user_subscriptions")
    .select("user_id")
    .eq("stripe_subscription_id", sub.id);

  if (customerId) query = query.or(`stripe_customer_id.eq.${customerId},stripe_subscription_id.eq.${sub.id}`);

  const { data, error } = await query.maybeSingle();
  if (error) throw error;
  return data?.user_id || null;
}

async function upsertSubscription(supabase, sub, userId) {
  const { error } = await supabase
    .from("user_subscriptions")
    .upsert(rowFromSubscription(sub, userId), { onConflict: "user_id" });

  if (error) throw error;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });

  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secretKey || !webhookSecret) return res.status(500).json({ error: "stripe_not_configured" });

  const stripe = new Stripe(secretKey);
  const sig = req.headers["stripe-signature"];
  if (!sig) return res.status(400).json({ error: "missing_signature" });

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
          const sub = await stripe.subscriptions.retrieve(session.subscription);
          await upsertSubscription(supabase, sub, userId);
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object;
        const userId = await findUserIdForSubscription(supabase, sub);
        if (userId) await upsertSubscription(supabase, sub, userId);
        break;
      }
      default:
        break;
    }
    return res.status(200).json({ received: true });
  } catch (err) {
    return res.status(500).json({ error: "webhook_handler_failed", message: err?.message });
  }
}
