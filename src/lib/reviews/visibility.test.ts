import { describe, expect, it } from "vitest";

import { filterPublicReviews, isPublicReviewStatus } from "@/lib/reviews/visibility";

describe("visibility RLS côté application", () => {
  it("masque les avis pending ou rejected du public", () => {
    const reviews = [
      { id: "1", status: "published" as const },
      { id: "2", status: "pending" as const },
      { id: "3", status: "rejected" as const },
    ];

    expect(filterPublicReviews(reviews)).toEqual([{ id: "1", status: "published" }]);
    expect(isPublicReviewStatus("pending")).toBe(false);
    expect(isPublicReviewStatus("published")).toBe(true);
  });
});
