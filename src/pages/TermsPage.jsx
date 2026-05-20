import PageShell from "./PageShell.jsx";

const UPDATED_AT = "May 20, 2026";

export default function TermsPage() {
  return (
    <PageShell title="Terms of Service">
      <p><strong>Last updated:</strong> {UPDATED_AT}</p>

      <p style={{ marginTop: 14 }}>
        These Terms of Service ("Terms") govern your access to and use of DataSpark websites, lessons, practice material, and related services
        (the "Service"). By using the Service, you agree to these Terms.
      </p>

      <h3 style={{ marginTop: 20 }}>1. Who can use the Service</h3>
      <p>
        You must be at least 13 years old (or the minimum age required in your jurisdiction) to use the Service. If you use the Service on behalf of
        an organization, you represent that you have authority to bind that organization.
      </p>

      <h3 style={{ marginTop: 20 }}>2. Acceptable use</h3>
      <p>You agree not to misuse the Service. This includes, for example, not doing any of the following:</p>
      <ul style={{ paddingLeft: 20, lineHeight: 1.7 }}>
        <li>Attempting to disrupt, probe, reverse engineer, or bypass platform security.</li>
        <li>Scraping or bulk-exporting protected lesson content in violation of applicable law.</li>
        <li>Using the Service to upload or share unlawful, infringing, or abusive content.</li>
        <li>Misrepresenting your identity or affiliation.</li>
      </ul>

      <h3 style={{ marginTop: 20 }}>3. Educational content and no professional advice</h3>
      <p>
        DataSpark provides educational content for interview preparation and skill development. Content is provided for informational purposes and is
        not legal, financial, tax, employment, or other professional advice.
      </p>

      <h3 style={{ marginTop: 20 }}>4. Accounts, access, and availability</h3>
      <p>
        We may update, suspend, or discontinue parts of the Service at any time. We may also suspend access for behavior that violates these Terms or
        creates risk to users or the platform.
      </p>

      <h3 style={{ marginTop: 20 }}>5. Intellectual property</h3>
      <p>
        The Service, including site design, curriculum structure, interactive labs, and associated branding, is owned by DataSpark or its licensors
        and is protected by applicable intellectual property laws. You retain ownership of content you submit, but grant us a limited license to
        operate and improve the Service.
      </p>

      <h3 style={{ marginTop: 20 }}>6. Third-party services</h3>
      <p>
        The Service may rely on third-party tools (for example hosting, analytics, database, or email services). Your use of those third-party
        services may also be subject to their own terms and policies.
      </p>

      <h3 style={{ marginTop: 20 }}>7. Disclaimer of warranties</h3>
      <p>
        The Service is provided "as is" and "as available" without warranties of any kind, express or implied, including implied warranties of
        merchantability, fitness for a particular purpose, and non-infringement, to the extent permitted by law.
      </p>

      <h3 style={{ marginTop: 20 }}>8. Limitation of liability</h3>
      <p>
        To the maximum extent permitted by law, DataSpark and its affiliates will not be liable for indirect, incidental, special, consequential, or
        punitive damages, or for any loss of profits, data, goodwill, or business interruption arising from your use of the Service.
      </p>

      <h3 style={{ marginTop: 20 }}>9. Changes to these Terms</h3>
      <p>
        We may update these Terms from time to time. If we make material changes, we will post the updated Terms with a new effective date.
        Continued use of the Service after changes become effective means you accept the revised Terms.
      </p>

      <h3 style={{ marginTop: 20 }}>10. Contact</h3>
      <p>
        For questions about these Terms, contact <strong>hello@dataspark.ai</strong>.
      </p>
    </PageShell>
  );
}
