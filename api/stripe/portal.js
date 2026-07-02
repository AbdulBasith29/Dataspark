import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

// Creates a Stripe Billing Portal session so a Pro user can manage or cancel
// their subscription. Returns the portal URL for the client to redirect to.

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
  if (!secretKey) return res.status(500).json({ error: "missing_stripe_key" });

  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: "auth_required" });

  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("user_subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  const customerId = data?.stripe_customer_id;
  if (!customerId) return res.status(400).json({ error: "no_customer", message: "No billing account found." });

  const stripe = new Stripe(secretKey);
  const origin = req.headers.origin || `https://${req.headers.host}`;

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/platform`,
      // Optional: pin the configuration created by scripts/stripe-launch-setup.mjs
      // so the portal works even if no default was ever saved in the Dashboard.
      ...(process.env.STRIPE_PORTAL_CONFIG_ID
        ? { configuration: process.env.STRIPE_PORTAL_CONFIG_ID }
        : {}),
    });
    return res.status(200).json({ url: session.url });
  } catch (err) {
    return res.status(500).json({ error: "portal_failed", message: err?.message });
  }
}
