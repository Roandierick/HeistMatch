import { LegalPage } from "@/components/legal/legal-page";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Cookie Policy",
  description: "HeistMatch uses only strictly necessary cookies and cookie-less analytics.",
  path: "/cookies",
});

export default function CookiesPage() {
  return (
    <LegalPage title="Cookie Policy" path="/cookies">
      <p>HeistMatch keeps cookies to the minimum needed to run the site. That is why you don&apos;t see a cookie banner.</p>
      <h2>Strictly necessary cookies</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Purpose</th>
            <th>Duration</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>sb-*-auth-token</code></td>
            <td>Keeps you signed in (set only after you sign in).</td>
            <td>Session / up to the session lifetime</td>
          </tr>
        </tbody>
      </table>
      <h2>Analytics without cookies</h2>
      <p>
        Our analytics are first-party and cookie-less. A random id is kept in your browser&apos;s session storage for the current tab only, so we can count
        visits without tracking you across sites or sessions. If your browser sends Do Not Track or Global Privacy Control, we don&apos;t record analytics.
      </p>
      <h2>No advertising or third-party tracking cookies</h2>
      <p>We do not use advertising, social media or cross-site tracking cookies. If that changes, we will ask for your consent first.</p>
    </LegalPage>
  );
}
