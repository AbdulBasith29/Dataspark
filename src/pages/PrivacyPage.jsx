import PageShell from "./PageShell.jsx";

const UPDATED_AT = "May 20, 2026";

export default function PrivacyPage() {
  return (
    <PageShell title="Privacy Policy">
      <p><strong>Last updated:</strong> {UPDATED_AT}</p>

      <p style={{ marginTop: 14 }}>
        This Privacy Policy explains how DataSpark collects, uses, and protects personal information when you use our website and related services.
      </p>

      <h3 style={{ marginTop: 20 }}>1. Information we collect</h3>
      <ul style={{ paddingLeft: 20, lineHeight: 1.7 }}>
        <li><strong>Contact information:</strong> email address and any details you provide through waitlist or contact flows.</li>
        <li><strong>Usage data:</strong> pages viewed, button/link interactions, and basic device/browser metadata used for analytics and reliability.</li>
        <li><strong>Communications:</strong> messages you send to us via email or contact form workflows.</li>
      </ul>

      <h3 style={{ marginTop: 20 }}>2. Why we use information</h3>
      <ul style={{ paddingLeft: 20, lineHeight: 1.7 }}>
        <li>Operate, secure, and improve the Service.</li>
        <li>Respond to questions and support requests.</li>
        <li>Manage waitlist notifications, product updates, and launch communication.</li>
        <li>Measure aggregate product engagement and performance.</li>
      </ul>

      <h3 style={{ marginTop: 20 }}>3. Legal bases and consent</h3>
      <p>
        Where applicable, we process personal information based on consent, legitimate interests in operating and improving the Service, and compliance
        with legal obligations.
      </p>

      <h3 style={{ marginTop: 20 }}>4. Data sharing</h3>
      <p>
        We do not sell personal information. We may share data with service providers that help us run the Service (such as hosting, analytics,
        database, and email tools), subject to contractual and security safeguards.
      </p>

      <h3 style={{ marginTop: 20 }}>5. Data retention</h3>
      <p>
        We retain information only as long as needed for the purposes described in this policy, unless a longer retention period is required by law.
      </p>

      <h3 style={{ marginTop: 20 }}>6. Your rights</h3>
      <p>
        Depending on your location, you may have rights to access, correct, delete, or restrict processing of your personal information, and to object
        to certain processing. You may also opt out of non-essential marketing communication at any time.
      </p>

      <h3 style={{ marginTop: 20 }}>7. Security</h3>
      <p>
        We use reasonable administrative, technical, and organizational safeguards to protect personal information. No method of transmission or
        storage is completely secure.
      </p>

      <h3 style={{ marginTop: 20 }}>8. International transfers</h3>
      <p>
        If you access the Service from outside the country where our providers operate, your information may be transferred and processed in other
        jurisdictions.
      </p>

      <h3 style={{ marginTop: 20 }}>9. Children</h3>
      <p>
        The Service is not directed to children under 13, and we do not knowingly collect personal information from children under 13.
      </p>

      <h3 style={{ marginTop: 20 }}>10. Contact</h3>
      <p>
        For privacy requests or questions, contact <strong>hello@dataspark.ai</strong>.
      </p>
    </PageShell>
  );
}
