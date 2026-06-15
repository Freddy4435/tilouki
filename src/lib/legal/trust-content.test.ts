import { describe, expect, it } from "vitest";

import {
  buildFooterTrustLinks,
  buildTrustSectionItems,
} from "@/lib/legal/trust-content";
import { defaultShopSettings } from "@/lib/shop/defaults";
import type { ShopSettings } from "@/lib/shop/types";

function shop(overrides: Partial<ShopSettings> = {}): ShopSettings {
  return { ...defaultShopSettings, ...overrides };
}

describe("trust-content", () => {
  it("n'affiche pas l'e-mail tant qu'il n'est pas configuré en admin", () => {
    const links = buildFooterTrustLinks(shop({ contactEmailConfigured: false }));
    expect(links.some((link) => link.id === "contact-email")).toBe(false);
  });

  it("affiche téléphone et médiation quand renseignés", () => {
    const links = buildFooterTrustLinks(
      shop({
        contactEmailConfigured: true,
        contactEmail: "boutique@example.fr",
        phone: "06 12 34 56 78",
        mediationName: "Médiateur Test",
        mediationUrl: "https://mediateur.example.fr",
      }),
    );
    expect(links.some((link) => link.id === "contact-phone")).toBe(true);
    expect(links.some((link) => link.id === "mediation")).toBe(true);
  });

  it("n'affiche pas la promesse retours sans politique configurée", () => {
    const items = buildTrustSectionItems(shop({ returnPolicy: null }));
    expect(items.some((item) => item.title.includes("Retours"))).toBe(false);
  });

  it("n'affiche pas de frais livraison si barème absent", () => {
    const items = buildTrustSectionItems(shop({ minShippingCents: 0 }));
    expect(items.some((item) => item.title.includes("Livraison"))).toBe(false);
  });
});
