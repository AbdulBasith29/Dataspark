import { getSupabaseBrowserClient } from "./supabaseClient.js";

// Client helpers for Stripe. Each calls a serverless route with the user's
// Supabase access token, then redirects the browser to the Stripe-hosted URL.

async function authHeader() {
  const supabase = getSupabaseBrowserClient();
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Distinguishes "the API isn't there" (SPA HTML came back — server not
// serving api/ routes) from a real error the server described.
function describeFailure(res, data, fallback) {
  if (data.message) return data.message;
  if (data.error) return `${fallback} (${data.error})`;
  return `${fallback} — the server returned an unexpected response (HTTP ${res.status}). If this is a deployment, check that the Stripe environment variables are set on Vercel.`;
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
    throw new Error(describeFailure(res, data, "Could not start checkout"));
  }
  window.location.href = data.url;
}

export async function openBillingPortal() {
  const headers = { "Content-Type": "application/json", ...(await authHeader()) };
  const res = await fetch("/api/stripe/portal", { method: "POST", headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.url) {
    throw new Error(describeFailure(res, data, "Could not open billing portal"));
  }
  window.location.href = data.url;
}
