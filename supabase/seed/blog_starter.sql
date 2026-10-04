-- Starter articles for the content engine. Inserted as DRAFTS: review, verify
-- every factual claim against official Rockstar sources, then publish from /admin/posts.
-- Safe to run more than once.

insert into public.blog_posts (slug, title, excerpt, category, tags, seo_title, seo_description, author_name, status, content) values
(
  'gta-6-heist-finder-how-it-works',
  'GTA 6 Heist Finder: How HeistMatch Helps You Find a Crew',
  'Stop playing heists with randoms. Here is how HeistMatch matches you with GTA 6 players by platform, region, language, mic and playstyle.',
  'crews-lfg',
  array['gta 6 heist finder', 'gta 6 lfg', 'crew finder'],
  'GTA 6 Heist Finder: Find Players & Crews Fast',
  'How the HeistMatch GTA 6 Heist Finder works: filter open heists, join a crew or post your own listing, and build a reputation as a reliable player.',
  'HeistMatch Editorial',
  'draft',
$md$
Heists are the best part of multiplayer GTA, and the worst part is finding the right people. Random matchmaking gives you players who quit at the first wipe, never talk, or play a completely different style. **HeistMatch** is a GTA 6 Heist Finder built to fix exactly that.

## How the Heist Finder works

1. **Find a heist.** Open the [Heist Finder](/find) and filter open listings by platform, region, language, microphone, skill level and playstyle.
2. **Match with players.** Join a crew that fits you, or [create your own heist](/create) and let players come to you.
3. **Run the job.** Once you join, the crew sees each other's gamertags so you can team up in-game.

## Filters that actually matter

- **Platform and region** keep you on the same network with low latency.
- **Language and mic** decide whether your crew can communicate during a setup.
- **Playstyle** separates relaxed runs from efficient, optimised or speedrun attempts.
- **Open slots** shows only crews that still have room for you.

## Reputation: "Would you play with this player again?"

After a session, crew members can answer one simple question about each other. Over time that builds a reputation that helps everyone avoid no-shows and quitters, and rewards reliable players.

## Built before launch, ready for GTA 6 Online

GTA 6 multiplayer details have not all been officially confirmed. HeistMatch already works for GTA Online heists today, and we add GTA 6 heists to the finder as soon as they are officially revealed.

[Find a heist now](/find) or [create a free account](/sign-up) to host your own.
$md$
),
(
  'how-to-find-reliable-heist-teammates',
  'How to Find Reliable Heist Teammates (and Keep Them)',
  'Practical tips to find GTA heist teammates who show up, communicate and finish the job, from writing a good listing to building a regular crew.',
  'crews-lfg',
  array['gta 6 teammates', 'gta 6 crew finder', 'heist tips'],
  null,
  'Find reliable GTA heist teammates: write clear listings, filter on what matters, communicate roles and turn good randoms into a regular crew.',
  'HeistMatch Editorial',
  'draft',
$md$
A heist is only as good as the crew running it. These tips work for GTA Online today and will carry over to GTA 6 Online.

## Write a listing people can trust

- **Be specific in the title**: the heist, the approach and the pace ("Casino, aggressive, quick runs").
- **State requirements up front**: mic, minimum rank, what setups are done.
- **Say how you split the payout** so nobody argues at the end.

On HeistMatch you set all of this when you [create a heist](/create), and players can filter on it.

## Filter on what actually breaks runs

Most failed heists come down to three things: no communication, mismatched pace and people leaving. Use the **mic**, **playstyle** and **skill level** filters in the [Heist Finder](/find) to avoid all three.

## Agree on roles before you start

Decide who drives, who hacks and who covers before the finale. Two minutes of planning saves twenty minutes of restarts.

## Turn good randoms into a crew

When a session goes well, add each other in-game and rate them with **"Would you play again?"** on HeistMatch. Reputation makes it easier for good players to find each other next time.

## Red flags

- Listings asking you to pay, buy "money drops" or share account details. Report them.
- Hosts who won't state the split.
- Players with a history of leaving early.

Ready? [Find your next crew](/find).
$md$
),
(
  'gta-6-online-what-we-know',
  'GTA 6 Online: What We Know and What Is Still Unconfirmed',
  'A clear overview of what Rockstar has officially confirmed about GTA 6 and its multiplayer, and which popular claims are still speculation.',
  'news',
  array['gta 6 online', 'gta 6 multiplayer', 'gta 6 heists'],
  'GTA 6 Online: Confirmed Facts vs Speculation',
  'What Rockstar has officially confirmed about GTA 6 and GTA 6 Online, what is still unconfirmed, and how to get ready for multiplayer heists.',
  'HeistMatch Editorial',
  'draft',
$md$
> **Editor note (remove before publishing):** verify every statement below against Rockstar Games' official newsroom on the day of publishing, and update the release information.

Everyone wants to know what GTA 6 Online will look like, especially for heists. This page separates **official information** from **speculation**, and we update it when Rockstar shares more.

## Officially confirmed

- **Setting:** the state of Leonida, including Vice City.
- **Protagonists:** Lucia and Jason.
- **Platforms announced:** PlayStation 5 and Xbox Series X|S.
- **Release date:** check Rockstar's official announcements for the current date.

## Not confirmed yet

- How GTA 6 Online launches and when.
- Which heists will exist, crew sizes and payout systems.
- Cross-play or cross-progression between platforms.
- Whether GTA Online progress carries over.

We label anything unconfirmed clearly in all our articles. If you read a specific heist name or payout figure online before Rockstar publishes it, treat it as rumour.

## How to get ready for multiplayer heists

- Build a list of reliable teammates now in GTA Online.
- Use the [Heist Finder](/find) to find players on your platform and in your region.
- [Subscribe to our newsletter](/blog) to get GTA 6 Online heist news as soon as it is official.
$md$
)
on conflict (slug) do nothing;
