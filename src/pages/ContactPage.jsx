import { useState } from "react";
import PageShell from "./PageShell.jsx";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <PageShell title="Contact">
      <p>
        For now, this page is a lightweight placeholder. Prefer email? Reach us at{" "}
        <a href="mailto:hello@dataspark.ai" style={{ color: "#E2E8F0" }}>
          hello@dataspark.ai
        </a>
        .
      </p>

      <form
        style={{ marginTop: 18, padding: 16, border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, background: "rgba(255,255,255,0.02)" }}
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(true);
        }}
      >
        <div style={{ display: "grid", gap: 12 }}>
          <label style={{ display: "grid", gap: 6, fontSize: 12.5, color: "#CBD5E1" }}>
            Name
            <input
              name="name"
              placeholder="Your name"
              style={{
                width: "100%",
                padding: "12px 12px",
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.10)",
                background: "rgba(6,8,20,0.75)",
                color: "#F8FAFC",
                fontFamily: "var(--sans)",
              }}
            />
          </label>
          <label style={{ display: "grid", gap: 6, fontSize: 12.5, color: "#CBD5E1" }}>
            Email
            <input
              name="email"
              type="email"
              placeholder="you@company.com"
              style={{
                width: "100%",
                padding: "12px 12px",
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.10)",
                background: "rgba(6,8,20,0.75)",
                color: "#F8FAFC",
                fontFamily: "var(--sans)",
              }}
            />
          </label>
          <label style={{ display: "grid", gap: 6, fontSize: 12.5, color: "#CBD5E1" }}>
            Message
            <textarea
              name="message"
              rows={5}
              placeholder="What would you like to share?"
              style={{
                width: "100%",
                padding: "12px 12px",
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.10)",
                background: "rgba(6,8,20,0.75)",
                color: "#F8FAFC",
                fontFamily: "var(--sans)",
                resize: "vertical",
              }}
            />
          </label>
        </div>

        <button
          type="submit"
          style={{
            marginTop: 14,
            width: "100%",
            border: "none",
            borderRadius: 10,
            padding: "12px 14px",
            fontWeight: 700,
            cursor: "pointer",
            background: "#6366F1",
            color: "#fff",
          }}
        >
          Send message (placeholder)
        </button>

        {submitted ? (
          <div style={{ marginTop: 12, fontSize: 12.5, color: "#CBD5E1" }}>
            Thanks — this demo form does not send anywhere yet, but your UI wiring is ready for a backend/email provider.
          </div>
        ) : null}

        <div style={{ marginTop: 10, fontSize: 12, color: "#94A3B8", lineHeight: 1.6 }}>
          Note: this form intentionally does not POST to a server yet. Hook it into your support inbox or email API when you are ready.
        </div>
      </form>
    </PageShell>
  );
}
