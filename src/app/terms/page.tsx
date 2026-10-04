import { LegalPage } from "@/components/legal/legal-page";
import { siteConfig } from "@/config/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Terms of Service",
  description: "The rules for using HeistMatch, the independent GTA 6 Heist Finder.",
  path: "/terms",
});

export default function TermsPage() {
  const { entity, contactEmail } = siteConfig.legal;
  return (
    <LegalPage title="Terms of Service" path="/terms">
      <p>
        These terms apply to your use of HeistMatch, operated by {entity}. By creating an account or using the site you agree to them.
      </p>
      <h2>The service</h2>
      <p>
        HeistMatch helps players find teammates for multiplayer heists. We do not run game servers, and we are not responsible for what happens in-game or
        for the behaviour of other players. {siteConfig.disclaimer}
      </p>
      <h2>Your account</h2>
      <ul>
        <li>You must be at least 16 years old and provide accurate information.</li>
        <li>Keep your login details secure. You are responsible for activity on your account.</li>
        <li>One person, one account. Usernames that impersonate others or are offensive may be changed or removed.</li>
      </ul>
      <h2>Acceptable use</h2>
      <p>You may not use HeistMatch to:</p>
      <ul>
        <li>harass, threaten or discriminate against others;</li>
        <li>post spam, advertising, scams, money-drop or account/recovery services, cheats or mod menus;</li>
        <li>share other people&apos;s personal data;</li>
        <li>circumvent rate limits, scrape the site or interfere with its security.</li>
      </ul>
      <p>We may remove content, limit features or suspend accounts that break these rules.</p>
      <h2>Your content</h2>
      <p>
        You keep ownership of what you post. You give us a non-exclusive licence to host and display it in order to run the service. Listings expire
        automatically.
      </p>
      <h2>Reputation and reviews</h2>
      <p>Reviews must reflect real sessions. Manipulating ratings (fake accounts, review trading) is not allowed.</p>
      <h2>Liability</h2>
      <p>
        The service is provided &quot;as is&quot;. To the extent permitted by law we are not liable for indirect losses or for in-game outcomes. Nothing in these
        terms limits rights you have as a consumer under mandatory law.
      </p>
      <h2>Changes and termination</h2>
      <p>You can delete your account at any time. We may update these terms and will notify you of material changes.</p>
      <h2>Law and contact</h2>
      <p>
        These terms are governed by Belgian law. Contact: <a href={`mailto:${contactEmail}`}>{contactEmail}</a>.
      </p>
    </LegalPage>
  );
}
