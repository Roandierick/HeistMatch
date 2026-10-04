import { LegalPage } from "@/components/legal/legal-page";
import { siteConfig } from "@/config/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Disclaimer",
  description: "HeistMatch is an independent platform and is not affiliated with Rockstar Games or Take-Two Interactive.",
  path: "/disclaimer",
});

export default function DisclaimerPage() {
  return (
    <LegalPage title="Disclaimer" path="/disclaimer">
      <h2>Independent platform</h2>
      <p>{siteConfig.disclaimer}</p>
      <p>
        HeistMatch does not use official Rockstar Games artwork, logos or other protected material as its own branding. Game names are used only to describe
        what our service is for.
      </p>
      <h2>Content accuracy</h2>
      <p>
        Our news and guides are written carefully, but games change and much about GTA 6 multiplayer has not been officially confirmed. We label unconfirmed
        information clearly and update articles when official details are published. Always check official sources for definitive information.
      </p>
      <h2>Affiliate links and sponsorships</h2>
      <p>Some articles may contain affiliate links or sponsored placements in the future. These will always be disclosed and never influence our guides.</p>
      <h2>Other players</h2>
      <p>Listings and profiles are created by users. We moderate reported content, but we are not responsible for the behaviour of other players.</p>
    </LegalPage>
  );
}
