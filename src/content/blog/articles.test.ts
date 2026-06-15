import { describe, expect, it } from "vitest";

import {
  blogArticles,
  getAllBlogSlugs,
  getBlogArticleBySlug,
  getPublishedBlogArticles,
} from "@/content/blog/articles";

describe("blog articles", () => {
  it("expose 10 articles publiés au lancement", () => {
    expect(getPublishedBlogArticles()).toHaveLength(10);
    expect(blogArticles).toHaveLength(10);
  });

  it("garantit des slugs uniques", () => {
    const slugs = blogArticles.map((article) => article.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("associe chaque slug publié à un article complet", () => {
    for (const slug of getAllBlogSlugs()) {
      const article = getBlogArticleBySlug(slug);
      expect(article).toBeDefined();
      expect(article?.published).not.toBe(false);
      expect(article?.title.trim()).not.toBe("");
      expect(article?.metaDescription.trim()).not.toBe("");
      expect(article?.content.trim()).not.toBe("");
      expect(article?.keyTakeaways.length).toBeGreaterThan(0);
      expect(article?.content).not.toMatch(/<[^>]+>/);
    }
  });
});
