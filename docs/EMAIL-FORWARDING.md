# Forward hello@dataspark-prep.com to your inbox

Visitors and forms on the site use **hello@dataspark-prep.com**. That address must receive mail in **your** inbox (for example the Gmail account you use day to day) by configuring your domain — the same idea as Shopify or any brand email: the website does not perform email forwarding; your DNS/email provider does.

## Option A — Cloudflare Email Routing (free, common)

1. Add the **dataspark-prep.com** zone to Cloudflare (nameservers at your registrar).
2. In Cloudflare: **Email** → **Email Routing** → enable routing.
3. Create a destination address (your Gmail) and verify it.
4. Add a rule: **Send to** `hello@dataspark-prep.com` → **destination** your verified Gmail.

Mail to `hello@dataspark-prep.com` will arrive in Gmail.

## Option B — Google Workspace

If you use Google Workspace on the domain, create a user or group **hello@** and either use that inbox or forward to a personal Gmail.

## Option C — Registrar email forwarding

Many registrars offer “email forwarding” for free: forward `hello@dataspark-prep.com` → your Gmail.

---

**Security:** Do not commit personal inbox passwords. The anon Supabase key in the frontend is unrelated to receiving email.
