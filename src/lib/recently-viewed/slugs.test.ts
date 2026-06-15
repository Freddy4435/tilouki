import { describe, expect, it } from "vitest";

import { entriesToSlugKey, recentSlugsFromEntries } from "@/lib/recently-viewed/slugs";

describe("recentSlugsFromEntries", () => {
  it("retourne les slugs du plus récent au plus ancien", () => {
    expect(recentSlugsFromEntries([{ slug: "a" }, { slug: "b" }])).toEqual(["b", "a"]);
  });
});

describe("entriesToSlugKey", () => {
  it("produit une clé stable pour un même historique", () => {
    const entries = [{ slug: "a" }, { slug: "b" }];
    expect(entriesToSlugKey(entries)).toBe(entriesToSlugKey(entries));
    expect(entriesToSlugKey(entries)).toBe("b\0a");
  });
});
