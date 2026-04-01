import { getSupabaseBrowserClient } from "./supabaseClient.js";

export function emailDomainFromEmail(email) {
  const at = email.lastIndexOf("@");
  if (at === -1) return undefined;
  const domain = email.slice(at + 1).trim().toLowerCase();
  return domain || undefined;
}

export async function logClientEvent({ eventName, page, metadata }) {
  let supabase;
  try {
    supabase = getSupabaseBrowserClient();
  } catch {
    throw new Error("supabase_unavailable");
  }

  const { error } = await supabase.from("event_logs").insert({
    event_name: eventName,
    page,
    metadata: metadata ?? null,
  });

  if (error) throw error;
}

export async function safeLogClientEvent(payload) {
  try {
    await logClientEvent(payload);
  } catch {
    // Never block UX on analytics failures.
  }
}
