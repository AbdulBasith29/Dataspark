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
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

// Maps a Stripe subscription object → the row we persist.
function rowFromSubscription(sub, userId) {
  const active = ["active", "trialing"].includes(sub.status);
  return {
    user_id: userId,
    plan: active ? "pro" : "free",
    status: sub.status,
    stripe_customer_id: typeof sub.customer === "string" ? sub.customer : sub.customer?.id,
    stripe_subscription_id: sub.id,
    current_period_end: sub.current_period_end
      ? new Date(sub.current_period_end * 1000).toISOString()
      : null,
    updated_at: new Date().toISOString(),
  };
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
          const sub = await stripe.subscriptions.retrieve(session.subscription);
          await supabase.from("user_subscriptions").upsert(rowFromSubscription(sub, userId), { onConflict: "user_id" });
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object;
        const userId = sub.metadata?.user_id;
        if (userId) {
          await supabase.from("user_subscriptions").upsert(rowFromSubscription(sub, userId), { onConflict: "user_id" });
        }
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
