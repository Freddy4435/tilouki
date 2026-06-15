import { describe, expect, it } from "vitest";

import {
  canTransitionReviewStatus,
  resolvePublishedAtOnModeration,
} from "@/lib/reviews/moderation";

describe("moderation", () => {
  it("autorise la publication depuis pending ou rejected", () => {
    expect(canTransitionReviewStatus("pending", "published")).toBe(true);
    expect(canTransitionReviewStatus("rejected", "published")).toBe(true);
    expect(canTransitionReviewStatus("pending", "rejected")).toBe(true);
  });

  it("interdit le retour en pending", () => {
    expect(canTransitionReviewStatus("published", "pending")).toBe(false);
  });

  it("fixe published_at à la première publication", () => {
    expect(
      resolvePublishedAtOnModeration("published", null, "2026-06-15T12:00:00.000Z"),
    ).toBe("2026-06-15T12:00:00.000Z");
    expect(
      resolvePublishedAtOnModeration(
        "published",
        "2026-06-10T12:00:00.000Z",
        "2026-06-15T12:00:00.000Z",
      ),
    ).toBe("2026-06-10T12:00:00.000Z");
    expect(
      resolvePublishedAtOnModeration("rejected", "2026-06-10T12:00:00.000Z", "now"),
    ).toBeNull();
  });
});
