import { describe, expect, it } from "vitest";

import {
  buildConsultedSizeHref,
  buildPersonalizationSubtitle,
  hasPersonalHomeContent,
} from "@/lib/favorites/personalization";

describe("favorites personalization", () => {
  it("affiche la section si au moins un signal", () => {
    expect(hasPersonalHomeContent({ favoriteCount: 0, recentCount: 0, consultedSizeCount: 0 })).toBe(
      false,
    );
    expect(hasPersonalHomeContent({ favoriteCount: 1, recentCount: 0, consultedSizeCount: 0 })).toBe(
      true,
    );
    expect(hasPersonalHomeContent({ favoriteCount: 0, recentCount: 2, consultedSizeCount: 0 })).toBe(
      true,
    );
    expect(hasPersonalHomeContent({ favoriteCount: 0, recentCount: 0, consultedSizeCount: 1 })).toBe(
      true,
    );
  });

  it("résume les signaux en une phrase marchande", () => {
    expect(
      buildPersonalizationSubtitle({
        favoriteCount: 2,
        recentCount: 3,
        consultedSizeCount: 1,
      }),
    ).toMatch(/2 favoris/);
    expect(
      buildPersonalizationSubtitle({
        favoriteCount: 0,
        recentCount: 0,
        consultedSizeCount: 2,
      }),
    ).toMatch(/tailles repérées/);
  });

  it("pointe vers le catalogue filtré par taille", () => {
    expect(buildConsultedSizeHref("6 ans")).toContain("tailles=6");
  });
});
