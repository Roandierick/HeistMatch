import { describe, expect, it } from "vitest";
import { activeFilterCount, findHref, parseFilters } from "@/lib/filters";

describe("parseFilters", () => {
  it("parses valid URL filters", () => {
    const f = parseFilters({ platform: "ps5", region: "eu", mic: "true", slots: "2", heist: "cayo-perico", sort: "newest" });
    expect(f).toMatchObject({ platform: "ps5", region: "eu", mic: true, slots: 2, heist: "cayo-perico", sort: "newest", page: 1 });
    expect(activeFilterCount(f)).toBe(5);
  });

  it("drops unknown or malicious values", () => {
    const f = parseFilters({ platform: "switch", region: "<script>", heist: "a'; drop table", slots: "99", page: "-3", mic: "maybe" });
    expect(f.platform).toBeUndefined();
    expect(f.region).toBeUndefined();
    expect(f.heist).toBeUndefined();
    expect(f.slots).toBeUndefined();
    expect(f.mic).toBeUndefined();
    expect(f.page).toBe(1);
    expect(activeFilterCount(f)).toBe(0);
  });

  it("round-trips into clean URLs", () => {
    expect(findHref({})).toBe("/find");
    expect(findHref(parseFilters({ platform: "xbox", mic: "false" }))).toBe("/find?platform=xbox&mic=false");
    expect(findHref({ ...parseFilters({}), page: 2 })).toBe("/find?page=2");
  });
});
