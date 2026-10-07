import { describe, expect, it } from "vitest";
import { createHeistSchema } from "@/lib/validation/heist";
import { signUpSchema } from "@/lib/validation/auth";
import { newsletterSchema } from "@/lib/validation/misc";
import { safeNextPath } from "@/lib/safe-next";

const base = {
  title: "Cayo Perico elite run",
  heist_type: "cayo-perico",
  platform: "ps5",
  region: "eu",
  language: "en",
  players_needed: "3",
  skill_level: "any",
  playstyle: "efficient",
  start_mode: "now",
  payout_split: "",
  min_rank: "",
  description: "",
};

describe("createHeistSchema", () => {
  it("accepts a valid start-now listing", () => {
    const r = createHeistSchema.safeParse({ ...base, mic_required: "on" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.mic_required).toBe(true);
      expect(r.data.players_needed).toBe(3);
      expect(r.data.payout_split).toBeNull();
      expect(r.data.description).toBeNull();
    }
  });

  it("requires a start time when scheduled, within 14 days", () => {
    expect(createHeistSchema.safeParse({ ...base, start_mode: "scheduled" }).success).toBe(false);
    const far = new Date(Date.now() + 30 * 24 * 3600_000).toISOString();
    expect(createHeistSchema.safeParse({ ...base, start_mode: "scheduled", start_at: far }).success).toBe(false);
    const soon = new Date(Date.now() + 2 * 3600_000).toISOString();
    expect(createHeistSchema.safeParse({ ...base, start_mode: "scheduled", start_at: soon }).success).toBe(true);
  });

  it("rejects bad enums, sizes and links", () => {
    expect(createHeistSchema.safeParse({ ...base, platform: "switch" }).success).toBe(false);
    expect(createHeistSchema.safeParse({ ...base, players_needed: "12" }).success).toBe(false);
    expect(createHeistSchema.safeParse({ ...base, description: "buy at www.cheap.shop" }).success).toBe(false);
  });
});

describe("signUpSchema", () => {
  const valid = {
    email: "Player@Example.com ",
    password: "correct-horse-battery",
    username: "Heist_Pro",
    platform: "xbox",
    region: "na",
    language: "en",
    accept_terms: "on",
  };
  it("normalises e-mail and keeps marketing opt-in optional", () => {
    const r = signUpSchema.safeParse(valid);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.email).toBe("player@example.com");
      expect(r.data.marketing_opt_in).toBe(false);
    }
  });
  it("requires terms acceptance and a valid username", () => {
    expect(signUpSchema.safeParse({ ...valid, accept_terms: undefined }).success).toBe(false);
    expect(signUpSchema.safeParse({ ...valid, username: "no spaces" }).success).toBe(false);
  });
});

describe("newsletterSchema", () => {
  it("accepts honeypot input so the action can silently discard bots", () => {
    const bot = newsletterSchema.safeParse({ email: "a@b.co", company: "bot inc" });
    expect(bot.success).toBe(true);
    if (bot.success) expect(bot.data.company).toBe("bot inc");
    expect(newsletterSchema.safeParse({ email: "a@b.co", company: "" }).success).toBe(true);
  });
});

describe("safeNextPath", () => {
  it("only allows same-site relative paths", () => {
    expect(safeNextPath("/create")).toBe("/create");
    expect(safeNextPath("//evil.com")).toBe("/");
    expect(safeNextPath("https://evil.com")).toBe("/");
    expect(safeNextPath("/\\evil.com")).toBe("/");
    expect(safeNextPath(undefined, "/find")).toBe("/find");
  });
});
