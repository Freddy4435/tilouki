import { describe, expect, it } from "vitest";

import { buildArticleToc, splitBlogParagraphs } from "@/lib/blog/content";

describe("blog content helpers", () => {
  it("découpe le contenu en paragraphes sans HTML", () => {
    const paragraphs = splitBlogParagraphs("Premier.\n\nDeuxième.");
    expect(paragraphs).toEqual(["Premier.", "Deuxième."]);
  });

  it("construit un sommaire court", () => {
    const toc = buildArticleToc("Un.\n\nDeux.\n\nTrois.");
    expect(toc).toHaveLength(3);
    expect(toc[0]?.id).toBe("section-0");
  });
});
