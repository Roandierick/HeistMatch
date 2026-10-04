export const BLOG_CATEGORIES = [
  {
    slug: "news",
    name: "GTA 6 News",
    description: "Confirmed GTA 6 news and what it means for multiplayer and heists. Unconfirmed details are always labelled.",
  },
  {
    slug: "gta-online",
    name: "GTA Online",
    description: "GTA Online updates, events and the multiplayer changes that matter for crews.",
  },
  {
    slug: "heist-guides",
    name: "Heist Guides",
    description: "Heist walkthroughs, crew roles, setups, payouts and strategies.",
  },
  {
    slug: "guides",
    name: "Gameplay Guides",
    description: "Progression, vehicles, businesses, weapons and gameplay systems explained.",
  },
  {
    slug: "crews-lfg",
    name: "Crews & LFG",
    description: "Find teammates, build a reliable crew and get more out of multiplayer.",
  },
  {
    slug: "money",
    name: "Money Guides",
    description: "Money-making methods, payouts and how to get the most out of your time.",
  },
] as const;

export type BlogCategorySlug = (typeof BLOG_CATEGORIES)[number]["slug"];

export function getCategory(slug: string) {
  return BLOG_CATEGORIES.find((c) => c.slug === slug);
}

export const POSTS_PER_PAGE = 12;
