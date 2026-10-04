import { describe, expect, it } from "vitest";
import { extractToc } from "@/lib/markdown";
import { readingTimeMinutes } from "@/lib/format";

describe("extractToc", () => {
  it("returns h2/h3 with rehype-slug compatible ids, skipping code fences", () => {
    const md = ["# Title", "## What we know", "### Crew **roles**", "```", "## not a heading", "```", "## What we know"].join("\n");
    expect(extractToc(md)).toEqual([
      { id: "what-we-know", text: "What we know", level: 2 },
      { id: "crew-roles", text: "Crew roles", level: 3 },
      { id: "what-we-know-1", text: "What we know", level: 2 },
    ]);
  });
});

describe("readingTimeMinutes", () => {
  it("never returns zero", () => {
    expect(readingTimeMinutes("short")).toBe(1);
    expect(readingTimeMinutes("word ".repeat(1150))).toBe(5);
  });
});
