import PageShell from "./PageShell.jsx";

export default function PrivacyPage() {
  return (
    <PageShell title="Privacy Policy">
      <p style={{ color: "#94A3B8", fontSize: 13, marginBottom: 16 }}>Last updated: May 2, 2026.</p>

      <h2 style={{ marginTop: 16, marginBottom: 8 }}>1) Scope</h2>
      <p>
        This Privacy Policy explains how DataSpark collects, uses, and protects personal information when you use the website, waitlist form, and
        related product experiences.
      </p>

      <h2 style={{ marginTop: 18, marginBottom: 8 }}>2) Information We Collect</h2>
      <ul style={{ paddingLeft: 20 }}>
        <li><strong>Contact data:</strong> email address submitted through waitlist or updates forms.</li>
        <li><strong>Usage data:</strong> basic product and website events (for example, page and interaction events) used for analytics.</li>
        <li><strong>Support data:</strong> messages sent through contact forms or support channels.</li>
      </ul>
      <p style={{ marginTop: 8 }}>
        We do not intentionally collect sensitive categories of personal data unless explicitly requested for support and provided by you.
      </p>

      <h2 style={{ marginTop: 18, marginBottom: 8 }}>3) How We Use Information</h2>
      <ul style={{ paddingLeft: 20 }}>
        <li>operate, maintain, and improve the service,</li>
        <li>manage waitlist and launch communications,</li>
        <li>monitor reliability, quality, and product performance,</li>
        <li>respond to requests, questions, and potential misuse.</li>
      </ul>

      <h2 style={{ marginTop: 18, marginBottom: 8 }}>4) Legal Bases (Where Applicable)</h2>
      <p>
        Depending on your region, we process personal data under one or more legal bases: consent, legitimate interests, contract performance,
        and/or legal compliance obligations.
      </p>

      <h2 style={{ marginTop: 18, marginBottom: 8 }}>5) Data Sharing</h2>
      <p>
        We may share information with trusted service providers who process data on our behalf (for example, hosting, analytics, database, email, or
        support tooling). We do not sell your personal information.
      </p>

      <h2 style={{ marginTop: 18, marginBottom: 8 }}>6) Retention</h2>
      <p>
        We retain personal data only as long as necessary for the purposes described in this policy, legal obligations, dispute resolution, and
        enforcing agreements.
      </p>

      <h2 style={{ marginTop: 18, marginBottom: 8 }}>7) Security</h2>
      <p>
        We use reasonable technical and organizational safeguards to protect information. No method of transmission or storage is fully secure, so
        absolute security cannot be guaranteed.
      </p>

      <h2 style={{ marginTop: 18, marginBottom: 8 }}>8) Your Rights</h2>
      <p>Depending on your jurisdiction, you may have rights to:</p>
      <ul style={{ paddingLeft: 20 }}>
        <li>access, correct, or delete your personal information,</li>
        <li>restrict or object to processing,</li>
        <li>withdraw consent where processing depends on consent,</li>
        <li>request data portability.</li>
      </ul>
      <p style={{ marginTop: 8 }}>
        To exercise these rights, contact us via the <a href="/contact">Contact page</a>.
      </p>

      <h2 style={{ marginTop: 18, marginBottom: 8 }}>9) Cookies and Tracking</h2>
      <p>
        We may use cookies or similar technologies for session behavior and analytics. Browser controls may allow you to limit cookies, though some
        functionality may be affected.
      </p>

      <h2 style={{ marginTop: 18, marginBottom: 8 }}>10) International Transfers</h2>
      <p>
        Your information may be processed in countries other than your own. Where required, we implement appropriate safeguards for cross-border data
        transfers.
      </p>

      <h2 style={{ marginTop: 18, marginBottom: 8 }}>11) Children&apos;s Privacy</h2>
      <p>
        DataSpark is not directed to children under 13 (or the equivalent minimum age in your jurisdiction), and we do not knowingly collect
        personal information from children.
      </p>

      <h2 style={{ marginTop: 18, marginBottom: 8 }}>12) Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. Continued use of the service after an effective date means you acknowledge the updated
        policy.
      </p>

      <h2 style={{ marginTop: 18, marginBottom: 8 }}>13) Contact</h2>
      <p>
        If you have privacy questions or requests, contact us via the <a href="/contact">Contact page</a>.
      </p>
    </PageShell>
  );
}
