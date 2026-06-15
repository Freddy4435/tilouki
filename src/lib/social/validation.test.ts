import { describe, expect, it } from "vitest";

import { hasVisibleSocialLinks } from "@/lib/social/validation";

describe("social links — rendu conditionnel", () => {
  it("masque le bloc si aucun lien n'est renseigné", () => {
    expect(hasVisibleSocialLinks({})).toBe(false);
    expect(
      hasVisibleSocialLinks({ instagram: null, facebook: null, tiktok: null }),
    ).toBe(false);
  });

  it("affiche le bloc dès qu'un réseau est présent", () => {
    expect(hasVisibleSocialLinks({ instagram: "https://instagram.com/tilouki" })).toBe(
      true,
    );
  });
});
