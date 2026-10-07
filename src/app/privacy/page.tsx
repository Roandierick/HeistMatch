import { LegalPage } from "@/components/legal/legal-page";
import { siteConfig } from "@/config/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Privacy Policy",
  description: "How HeistMatch collects, uses and protects your personal data, and the rights you have under the GDPR.",
  path: "/privacy",
});

export default function PrivacyPage() {
  const { entity, address, contactEmail } = siteConfig.legal;
  return (
    <LegalPage title="Privacy Policy" path="/privacy">
      <p>
        This policy explains how {entity}{address ? ` (${address})` : ""} (&quot;HeistMatch&quot;, &quot;we&quot;) processes personal data when you use {siteConfig.domain}. We are
        the data controller. Questions or requests: <a href={`mailto:${contactEmail}`}>{contactEmail}</a>.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li><strong>Account data:</strong> e-mail address, password (stored hashed by our auth provider), username, platform, region and language.</li>
        <li><strong>Profile and activity:</strong> bio, gamertag and Discord handle (shared only with crews you join or host), listings you create, crews you join, reviews and reports.</li>
        <li><strong>Marketing consent:</strong> if you opt in, your e-mail address, the wording version you agreed to, the source and timestamps of opt-in, confirmation and withdrawal.</li>
        <li><strong>Usage analytics:</strong> first-party, cookie-less events (for example page views and searches) with a random per-tab session id. We do not store IP addresses for analytics. We honour Do Not Track and Global Privacy Control.</li>
        <li><strong>Security data:</strong> a salted, one-way hash of your IP address is used briefly for rate limiting and abuse prevention.</li>
      </ul>

      <h2>Why we use it (legal bases)</h2>
      <ul>
        <li>Providing the service and your account: performance of a contract (Art. 6(1)(b) GDPR).</li>
        <li>Security, spam prevention, moderation and product analytics: our legitimate interests (Art. 6(1)(f)).</li>
        <li>Newsletter and marketing e-mails: your consent (Art. 6(1)(a)), which you can withdraw at any time.</li>
      </ul>

      <h2>Marketing e-mails</h2>
      <p>
        Marketing e-mails are always optional and never required for an account. We use double opt-in: we only send them after you confirm your address.
        Every e-mail contains an unsubscribe link, and you can change your preference in your account. We never sell or rent your personal data or our
        e-mail list.
      </p>

      <h2>Who we share data with</h2>
      <p>
        We use processors that act on our instructions: Supabase (database and authentication), Vercel (hosting) and our e-mail delivery provider. Some
        may process data outside the EEA under appropriate safeguards such as Standard Contractual Clauses. Other players only see your public profile;
        contact handles are visible only to members of a crew you are part of.
      </p>

      <h2>How long we keep it</h2>
      <p>
        Account data is kept while your account exists. Heist listings expire automatically. Analytics events are kept for up to 26 months. Consent records
        are kept as proof for as long as we may need to demonstrate consent. When you delete your account we delete your profile, listings, crew history and
        marketing record.
      </p>

      <h2>Your rights</h2>
      <p>
        You have the right to access, rectify, erase, restrict and port your data, to object to processing based on legitimate interests and to withdraw
        consent. You can delete your account yourself in your account settings or contact us. You may lodge a complaint with your supervisory authority; in
        Belgium this is the Gegevensbeschermingsautoriteit / Autorité de protection des données.
      </p>

      <h2>Children</h2>
      <p>HeistMatch is intended for users aged 16 or older. Grand Theft Auto games are rated for adults.</p>

      <h2>Changes</h2>
      <p>We will update this page when our practices change and notify account holders of material changes.</p>
    </LegalPage>
  );
}
