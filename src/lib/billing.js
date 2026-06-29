import { getSupabaseBrowserClient } from "./supabaseClient.js";

// Client helpers for Stripe. Each calls a serverless route with the user's
// Supabase access token, then redirects the browser to the Stripe-hosted URL.

async function authHeader() {
  const supabase = getSupabaseBrowserClient();
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// interval: "monthly" | "annual"
export async function startCheckout(interval = "monthly") {
  const headers = { "Content-Type": "application/json", ...(await authHeader()) };
  const res = await fetch("/api/stripe/checkout", {
    method: "POST",
    headers,
    body: JSON.stringify({ interval }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.url) {
    throw new Error(data.message || "Could not start checkout. Please try again.");
  }
  window.location.href = data.url;
}

export async function openBillingPortal() {
  const headers = { "Content-Type": "application/json", ...(await authHeader()) };
  const res = await fetch("/api/stripe/portal", { method: "POST", headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.url) {
    throw new Error(data.message || "Could not open billing portal.");
  }
  window.location.href = data.url;
}
