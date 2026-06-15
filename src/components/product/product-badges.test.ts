import { describe, expect, it } from "vitest";

import {
  filterStorefrontCardBadges,
  STOREFRONT_CARD_BADGE_TYPES,
} from "@/components/product/product-badges";

describe("filterStorefrontCardBadges", () => {
  it("ne garde que les 4 badges retail autorisés", () => {
    expect(
      filterStorefrontCardBadges(["new", "spring-summer", "cotton", "autumn-winter"]),
    ).toEqual(["new", "cotton"]);
  });

  it("respecte la priorité et la limite de 2", () => {
    expect(
      filterStorefrontCardBadges(["cotton", "low-price", "new", "last-piece"]),
    ).toEqual(["new", "last-piece"]);
    expect(STOREFRONT_CARD_BADGE_TYPES).toHaveLength(4);
  });
});
