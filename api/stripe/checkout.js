import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

// Creates a Stripe Checkout Session for a Pro subscription and returns its URL.
// The client redirects the browser to that URL; the actual plan change is
// confirmed later by the webhook (api/stripe/webhook.js), never here.

function cors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

async function getUser(req) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return null;
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

export default async function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return res.status(500).json({
      error: "missing_stripe_key",
      message: "Payments aren't configured on this deployment yet (STRIPE_SECRET_KEY is not set).",
    });
  }

  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: "auth_required", message: "Sign in to upgrade." });

  const { interval } = req.body || {};
  const priceId =
    interval === "annual"
      ? process.env.STRIPE_PRICE_PRO_ANNUAL
      : process.env.STRIPE_PRICE_PRO_MONTHLY;
  if (!priceId) return res.status(500).json({ error: "missing_price_id", message: "Pricing not configured." });

  const stripe = new Stripe(secretKey);
  const origin = req.headers.origin || `https://${req.headers.host}`;

  // Reuse an existing Stripe customer for this user if we have one, and
  // refuse to open a second checkout for someone who is already on Pro —
  // that would create a second subscription and double-bill them.
  const supabase = getSupabaseAdmin();
  let customerId = null;
  if (supabase) {
    const { data } = await supabase
      .from("user_subscriptions")
      .select("stripe_customer_id, plan, status")
      .eq("user_id", user.id)
      .maybeSingle();
    customerId = data?.stripe_customer_id || null;
    if (data?.plan === "pro" && ["active", "trialing"].includes(data?.status)) {
      return res.status(409).json({
        error: "already_subscribed",
        message: "You're already on Pro. Use “Manage billing” to change your plan.",
      });
    }
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      ...(customerId ? { customer: customerId } : { customer_email: user.email }),
      client_reference_id: user.id,
      // user_id is the link the webhook uses to map Stripe → Supabase.
      subscription_data: { metadata: { user_id: user.id } },
      metadata: { user_id: user.id },
      allow_promotion_codes: true,
      success_url: `${origin}/platform?upgraded=1`,
      cancel_url: `${origin}/pricing?canceled=1`,
    });
    return res.status(200).json({ url: session.url });
  } catch (err) {
    return res.status(500).json({ error: "checkout_failed", message: err?.message || "Could not start checkout." });
  }
}
