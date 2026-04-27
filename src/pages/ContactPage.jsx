import { useState } from "react";
import PageShell from "./PageShell.jsx";

const P = {
  card: "rgba(255,255,255,0.03)",
  border: "rgba(255,255,255,0.1)",
  borderHi: "rgba(99,102,241,0.35)",
  t1: "#F8FAFC",
  t2: "#E2E8F0",
  t3: "#94A3B8",
  ind: "#818CF8",
  indB: "#6366F1",
  inputBg: "rgba(6,8,20,0.85)",
};

const CONTACT_EMAIL = "hello@dataspark.ai";

function inputStyle(focusError) {
  return {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 10,
    border: `1px solid ${focusError ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.12)"}`,
    background: P.inputBg,
    color: P.t1,
    fontFamily: "var(--sans)",
    fontSize: 14,
    outline: "none",
    transition: "border-color 0.2s",
  };
}

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [openedMailto, setOpenedMailto] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    const trimmed = message.trim();
    if (!trimmed) {
      setError("Please add a short message so we know how to help.");
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email so we can reply.");
      return;
    }

    const subject = `DataSpark — message from ${name.trim() || "website"}`;
    const body = `${trimmed}\n\n—\nName: ${name.trim() || "(not provided)"}\nReply to: ${email.trim()}`;
    const href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setOpenedMailto(true);
    window.location.href = href;
  };

  return (
    <PageShell title="Contact">
      <p style={{ marginBottom: 24, maxWidth: 560 }}>
        Questions about early access, partnerships, or press? Reach the DataSpark team at the address below. We typically reply within a few business days.
      </p>

      <div
        style={{
          maxWidth: 520,
          borderRadius: 16,
          border: `1px solid ${P.borderHi}`,
          background: `linear-gradient(145deg, ${P.card}, rgba(99,102,241,0.04))`,
          boxShadow: "0 24px 48px rgba(0,0,0,0.35)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "20px 22px",
            borderBottom: `1px solid ${P.border}`,
            background: "rgba(99,102,241,0.08)",
          }}
        >
          <div style={{ fontSize: 11, fontFamily: "var(--mono)", letterSpacing: 1.4, color: P.ind, marginBottom: 6 }}>
            PRIMARY INBOX
          </div>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            style={{
              fontSize: 18,
              fontWeight: 800,
              color: P.t1,
              textDecoration: "none",
              wordBreak: "break-all",
            }}
          >
            {CONTACT_EMAIL}
          </a>
          <p style={{ marginTop: 10, fontSize: 13, color: P.t3, lineHeight: 1.55 }}>
            Prefer your own email app? Use the form below — it opens a draft addressed to this inbox (same as Shopify-style “contact us” flows that use your mail client).
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: "22px 22px 20px" }}>
          <div style={{ display: "grid", gap: 16 }}>
            <label style={{ display: "grid", gap: 6, fontSize: 13, fontWeight: 600, color: P.t2 }}>
              Name
              <input
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                autoComplete="name"
                style={inputStyle(false)}
              />
            </label>
            <label style={{ display: "grid", gap: 6, fontSize: 13, fontWeight: 600, color: P.t2 }}>
              Email
              <input
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                autoComplete="email"
                style={inputStyle(!!error && !email.trim())}
              />
            </label>
            <label style={{ display: "grid", gap: 6, fontSize: 13, fontWeight: 600, color: P.t2 }}>
              Message
              <textarea
                name="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                placeholder="How can we help?"
                style={{ ...inputStyle(!!error && !message.trim()), resize: "vertical", minHeight: 120 }}
              />
            </label>
          </div>

          {error ? (
            <div style={{ marginTop: 12, fontSize: 13, color: "#FCA5A5" }}>{error}</div>
          ) : null}

          <button
            type="submit"
            style={{
              marginTop: 18,
              width: "100%",
              border: "none",
              borderRadius: 10,
              padding: "14px 16px",
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
              background: P.indB,
              color: "#fff",
              boxShadow: "0 8px 24px rgba(99,102,241,0.35)",
            }}
          >
            Open email draft
          </button>

          {openedMailto ? (
            <p style={{ marginTop: 14, fontSize: 13, color: "#34D399", lineHeight: 1.5 }}>
              If your mail app did not open, copy{" "}
              <strong style={{ color: P.t2 }}>{CONTACT_EMAIL}</strong> and send your message manually.
            </p>
          ) : (
            <p style={{ marginTop: 14, fontSize: 12.5, color: P.t3, lineHeight: 1.6 }}>
              This sends through your email app to {CONTACT_EMAIL}. No message is stored on our servers from this page.
            </p>
          )}
        </form>
      </div>

      <div
        style={{
          marginTop: 28,
          padding: "14px 16px",
          borderRadius: 12,
          border: `1px solid ${P.border}`,
          background: "rgba(255,255,255,0.02)",
          maxWidth: 560,
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 700, color: P.t2, marginBottom: 8 }}>Domain email forwarding (for you as the owner)</div>
        <p style={{ fontSize: 12.5, color: P.t3, lineHeight: 1.65 }}>
          Incoming mail to <strong style={{ color: P.t2 }}>{CONTACT_EMAIL}</strong> is not configured by this website. Set it up where <strong style={{ color: P.t2 }}>dataspark.ai</strong> DNS and email are managed (for example Cloudflare Email Routing, Google Workspace, or your registrar), and forward to the inbox where you want to read messages — for example your Gmail account. See{" "}
          <code style={{ fontFamily: "var(--mono)", fontSize: 11, color: P.t2 }}>docs/EMAIL-FORWARDING.md</code> in the repository for steps.
        </p>
      </div>
    </PageShell>
  );
}
