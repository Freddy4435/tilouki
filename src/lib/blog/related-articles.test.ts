import { describe, expect, it } from "vitest";

import { getBlogArticleBySlug } from "@/content/blog/articles";
import { pickRelatedBlogArticles } from "@/lib/blog/related-articles";

describe("pickRelatedBlogArticles", () => {
  it("retourne 2 articles distincts hors l'article courant", () => {
    const article = getBlogArticleBySlug("choisir-bonne-taille-vetement-enfant");
    expect(article).toBeDefined();

    const related = pickRelatedBlogArticles(article!);
    expect(related).toHaveLength(2);
    expect(related.every((item) => item.slug !== article!.slug)).toBe(true);
    expect(new Set(related.map((item) => item.slug)).size).toBe(2);
  });

  it("priorise la même catégorie quand plusieurs articles existent", () => {
    const article = getBlogArticleBySlug("choisir-pyjama-enfant-nuit-confortable");
    expect(article).toBeDefined();

    const related = pickRelatedBlogArticles(article!);
    expect(related[0]?.category).toBe("quotidien");
  });
});
