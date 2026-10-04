import { Container } from "@/components/ui/container";
import { LinkButton } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { CreateHeistForm } from "@/components/heists/create-heist-form";
import { getCurrentUser } from "@/lib/auth";
import { getHeistTypes } from "@/data/heists";
import { pageMetadata } from "@/lib/seo";

// Per-user page: never statically cached.
export const dynamic = "force-dynamic";

export const metadata = pageMetadata({
  title: "Create a GTA 6 Heist Listing",
  description:
    "Post your GTA 6 heist and find players fast. Set platform, region, language, mic, skill level and playstyle, and let the right crew join you.",
  path: "/create",
});

export default async function CreatePage() {
  const [user, heistTypes] = await Promise.all([getCurrentUser(), getHeistTypes()]);

  return (
    <Container className="max-w-3xl pt-8 pb-16">
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Create Heist", path: "/create" }]} />
      <h1 className="mt-4 text-3xl font-semibold tracking-tight">Create a heist</h1>
      <p className="mt-2 text-muted">Tell players what you&apos;re running. Your listing appears in the GTA 6 Heist Finder immediately.</p>

      <div className="mt-8">
        {!user ? (
          <Card className="p-6 sm:p-8">
            <h2 className="text-lg font-semibold">Sign in to host a heist</h2>
            <p className="mt-2 text-muted">
              A free account keeps listings spam-free and lets crews rate each other, so you end up playing with reliable players.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <LinkButton href="/sign-up?next=/create">Create free account</LinkButton>
              <LinkButton href="/sign-in?next=/create" variant="secondary">Sign in</LinkButton>
            </div>
          </Card>
        ) : !user.emailVerified ? (
          <Card className="p-6 sm:p-8">
            <h2 className="text-lg font-semibold">Verify your e-mail first</h2>
            <p className="mt-2 text-muted">We sent a verification link to {user.email}. Verify your address, then come back to publish your heist.</p>
          </Card>
        ) : (
          <Card className="p-5 sm:p-8">
            <CreateHeistForm
              heistTypes={heistTypes}
              defaults={{
                platform: user.profile?.platform ?? "ps5",
                region: user.profile?.region ?? "eu",
                language: user.profile?.primary_language ?? "en",
              }}
            />
          </Card>
        )}
      </div>
    </Container>
  );
}
