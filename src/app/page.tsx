import Link from "next/link";
import { Container } from "@/components/ui/container";
import { LinkButton } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { IconArrowRight, IconBolt, IconPlus, IconShield, IconUsers } from "@/components/ui/icons";
import { FinderSearch } from "@/components/heists/finder-search";
import { HeistGrid } from "@/components/heists/heist-grid";
import { PostCard } from "@/components/blog/post-card";
import { NewsletterSection } from "@/components/newsletter/newsletter-section";
import { JsonLd } from "@/components/seo/json-ld";
import { getHeistTypes, listOpenHeists } from "@/data/heists";
import { listPosts } from "@/data/blog";
import { organizationJsonLd, pageMetadata, websiteJsonLd } from "@/lib/seo";
import { siteConfig } from "@/config/site";

// Live listings: re-render at most once a minute (ISR) to keep the homepage fast.
export const revalidate = 60;

export const metadata = pageMetadata({
  title: "GTA 6 Heist Finder | Find Players & Crews | HeistMatch",
  absoluteTitle: true,
  description:
    "Find reliable GTA 6 players for your next heist. Filter by platform, region, language and mic, join an open crew or create your own listing on HeistMatch.",
  path: "/",
});

const STEPS = [
  { title: "Find a heist", body: "Filter open listings by platform, region, language, mic and playstyle." },
  { title: "Match with players", body: "Join a crew that fits how you play, or post your own heist in seconds." },
  { title: "Run the job", body: "Connect with your crew, play, and rate who you'd team up with again." },
];

const BENEFITS = [
  {
    icon: IconBolt,
    title: "Built for speed",
    body: "No feeds, no noise. Open the finder, pick a crew and get into the game.",
  },
  {
    icon: IconShield,
    title: "Reputation that matters",
    body: "“Would you play with this player again?” Ratings help you avoid no-shows and quitters.",
  },
  {
    icon: IconUsers,
    title: "The right teammates",
    body: "Match on platform, region, language, mic and skill instead of playing with randoms.",
  },
];

export default async function HomePage() {
  const [heistTypes, { listings }, { posts }] = await Promise.all([
    getHeistTypes(),
    listOpenHeists({ sort: "soonest" }, { limit: 6 }),
    listPosts({ limit: 3 }),
  ]);

  return (
    <>
      <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />

      <section className="hero-glow border-b border-line">
        <Container className="pt-12 pb-10 sm:pt-16 sm:pb-14">
          <p className="text-sm font-medium text-accent">{siteConfig.tagline}</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-fg sm:text-5xl">GTA 6 Heist Finder</h1>
          <p className="mt-4 max-w-2xl text-lg text-muted">
            Find reliable GTA 6 players, match with the right crew and start your next heist.
          </p>
          <div className="mt-8">
            <FinderSearch heistTypes={heistTypes} />
          </div>
          <p className="mt-4 text-sm text-subtle">
            Hosting?{" "}
            <Link href="/create" className="font-medium text-fg underline decoration-line-strong underline-offset-4 hover:decoration-accent">
              Create a heist
            </Link>{" "}
            and let players come to you.
          </p>
        </Container>
      </section>

      <Container className="mt-12">
        <section aria-labelledby="active-heists">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 id="active-heists" className="text-2xl font-semibold tracking-tight">
                Active heists
              </h2>
              <p className="mt-1 text-sm text-muted">Open crews looking for players right now.</p>
            </div>
            <Link href="/find" className="hidden items-center gap-1 text-sm font-medium text-accent hover:text-accent-strong sm:flex">
              View all <IconArrowRight className="size-4" />
            </Link>
          </div>
          <div className="mt-6">
            {listings.length > 0 ? (
              <HeistGrid listings={listings} />
            ) : (
              <EmptyState
                title="No open heists right now"
                description="Be the first: post a heist and players looking for a crew will find you."
                action={
                  <>
                    <LinkButton href="/create">
                      <IconPlus className="size-4" /> Create Heist
                    </LinkButton>
                    <LinkButton href="/find" variant="secondary">
                      Browse the finder
                    </LinkButton>
                  </>
                }
              />
            )}
          </div>
        </section>

        <section aria-labelledby="how-it-works" className="mt-20">
          <h2 id="how-it-works" className="text-2xl font-semibold tracking-tight">
            How it works
          </h2>
          <ol className="mt-6 grid gap-3 sm:grid-cols-3">
            {STEPS.map((step, i) => (
              <li key={step.title} className="rounded-[var(--radius-card)] border border-line bg-surface p-5">
                <span className="font-mono text-sm text-accent">0{i + 1}</span>
                <h3 className="mt-2 font-semibold text-fg">{step.title}</h3>
                <p className="mt-1 text-sm text-muted">{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="why-heistmatch" className="mt-20">
          <h2 id="why-heistmatch" className="text-2xl font-semibold tracking-tight">
            Why HeistMatch
          </h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-3">
            {BENEFITS.map(({ icon: Icon, title, body }) => (
              <li key={title} className="rounded-[var(--radius-card)] border border-line bg-surface p-5">
                <Icon className="size-6 text-accent" />
                <h3 className="mt-3 font-semibold text-fg">{title}</h3>
                <p className="mt-1 text-sm text-muted">{body}</p>
              </li>
            ))}
          </ul>
        </section>

        {posts.length > 0 && (
          <section aria-labelledby="latest-news" className="mt-20">
            <div className="flex items-end justify-between gap-4">
              <h2 id="latest-news" className="text-2xl font-semibold tracking-tight">
                Latest GTA 6 news &amp; guides
              </h2>
              <Link href="/blog" className="flex items-center gap-1 text-sm font-medium text-accent hover:text-accent-strong">
                All articles <IconArrowRight className="size-4" />
              </Link>
            </div>
            <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <li key={post.id}>
                  <PostCard post={post} />
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="mt-20">
          <NewsletterSection source="newsletter_home" />
        </div>
      </Container>
    </>
  );
}
