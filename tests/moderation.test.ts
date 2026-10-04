import { describe, expect, it } from "vitest";
import { checkUserText, cleanText } from "@/lib/moderation";

describe("checkUserText", () => {
  it("allows normal listing text", () => {
    expect(checkUserText("Need 2 for Cayo elite, chill crew, EU evenings").ok).toBe(true);
  });
  it("blocks links in listings", () => {
    expect(checkUserText("join my discord at discord.gg").ok).toBe(false);
    expect(checkUserText("see https://example.com").ok).toBe(false);
  });
  it("blocks slurs with leetspeak", () => {
    expect(checkUserText("you are a r3tard").ok).toBe(false);
  });
  it("blocks spam patterns", () => {
    expect(checkUserText("CHEAP MONEY DROP SERVICE").ok).toBe(false);
    expect(checkUserText("heyyyyyyyyyyyyyyy").ok).toBe(false);
    expect(checkUserText("THIS IS A VERY LOUD LISTING TITLE").ok).toBe(false);
  });
});

describe("cleanText", () => {
  it("strips control characters and collapses whitespace", () => {
    expect(cleanText("  hello\u0000   world \n\n\n\n bye ")).toBe("hello world \n\n bye");
  });
});
