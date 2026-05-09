import PageShell from "./PageShell.jsx";

export default function TermsPage() {
  return (
    <PageShell title="Terms of Service">
      <p style={{ color: "#94A3B8", fontSize: 13, marginBottom: 16 }}>Last updated: May 2, 2026.</p>

      <h2 style={{ marginTop: 16, marginBottom: 8 }}>1) Acceptance of Terms</h2>
      <p>
        By accessing or using DataSpark, you agree to these Terms of Service and our Privacy Policy. If you do not agree, do not use the service.
      </p>

      <h2 style={{ marginTop: 18, marginBottom: 8 }}>2) What DataSpark Provides</h2>
      <p>
        DataSpark provides educational content, practice questions, interactive lessons, and optional AI-assisted feedback for interview preparation.
        Content is for educational use and does not guarantee interview outcomes, job offers, or business results.
      </p>

      <h2 style={{ marginTop: 18, marginBottom: 8 }}>3) Eligibility and Accounts</h2>
      <p>
        You must be legally able to enter into a binding agreement in your jurisdiction. You are responsible for activity associated with your email
        and for maintaining the confidentiality of any account credentials.
      </p>

      <h2 style={{ marginTop: 18, marginBottom: 8 }}>4) Acceptable Use</h2>
      <p>You agree not to misuse the service. This includes, without limitation:</p>
      <ul style={{ paddingLeft: 20, marginTop: 8 }}>
        <li>attempting unauthorized access to systems or data,</li>
        <li>using automation to scrape, copy, or redistribute protected content at scale,</li>
        <li>uploading harmful code or interfering with service reliability,</li>
        <li>using the service for unlawful, infringing, or abusive activity.</li>
      </ul>

      <h2 style={{ marginTop: 18, marginBottom: 8 }}>5) AI Features and Output</h2>
      <p>
        AI-generated feedback may be incomplete or inaccurate. You are responsible for reviewing outputs before relying on them. Do not submit
        sensitive personal, health, legal, or financial information to AI chat or evaluation features.
      </p>

      <h2 style={{ marginTop: 18, marginBottom: 8 }}>6) Intellectual Property</h2>
      <p>
        DataSpark and its materials (including curriculum, visualizations, prompts, and branding) are protected by intellectual property laws. You
        may use the service for personal, non-exclusive educational purposes. You may not reproduce or commercially redistribute materials without
        written permission.
      </p>

      <h2 style={{ marginTop: 18, marginBottom: 8 }}>7) Payments, Trials, and Refunds (If Enabled)</h2>
      <p>
        If paid plans are introduced, pricing, billing cycles, and refund terms will be disclosed at checkout and will form part of these Terms.
        Taxes may apply depending on jurisdiction.
      </p>

      <h2 style={{ marginTop: 18, marginBottom: 8 }}>8) Service Changes and Availability</h2>
      <p>
        We may modify, suspend, or discontinue features at any time, with or without notice. We do not guarantee uninterrupted availability, and
        planned maintenance or third-party outages may affect access.
      </p>

      <h2 style={{ marginTop: 18, marginBottom: 8 }}>9) Termination</h2>
      <p>
        We may suspend or terminate access for violations of these Terms or misuse of the platform. You may stop using the service at any time.
      </p>

      <h2 style={{ marginTop: 18, marginBottom: 8 }}>10) Disclaimers</h2>
      <p>
        The service is provided “as is” and “as available.” To the maximum extent permitted by law, we disclaim warranties of merchantability,
        fitness for a particular purpose, and non-infringement.
      </p>

      <h2 style={{ marginTop: 18, marginBottom: 8 }}>11) Limitation of Liability</h2>
      <p>
        To the maximum extent permitted by law, DataSpark will not be liable for indirect, incidental, special, consequential, or punitive damages,
        or any loss of data, revenue, or profits arising from use of the service.
      </p>

      <h2 style={{ marginTop: 18, marginBottom: 8 }}>12) Governing Law</h2>
      <p>
        These Terms are governed by the laws of the jurisdiction where the service operator is established, without regard to conflict-of-law rules,
        except where mandatory consumer laws apply.
      </p>

      <h2 style={{ marginTop: 18, marginBottom: 8 }}>13) Changes to These Terms</h2>
      <p>
        We may update these Terms periodically. Continued use after changes become effective constitutes acceptance of the updated Terms.
      </p>

      <h2 style={{ marginTop: 18, marginBottom: 8 }}>14) Contact</h2>
      <p>
        For legal or account questions, contact us via the <a href="/contact">Contact page</a>.
      </p>
    </PageShell>
  );
}
