import { test, expect } from "./fixtures";

import {
  expectLabeledInputs,
  expectMinimumContrast,
  expectNamedButtons,
  expectNoSeriousAxeViolations,
  expectVisibleFocusRing,
} from "./helpers/accessibility";
import { ensureSeededCartOnPage } from "./helpers/cart";
import { openCheckoutFromCart } from "./helpers/checkout";
import { dismissCookieBanner, setupPurchaseMocks } from "./helpers/mocks";

test.describe("Accessibilité — formulaire checkout", () => {
  test.beforeEach(async ({ page }) => {
    await setupPurchaseMocks(page);
    await dismissCookieBanner(page);
    await ensureSeededCartOnPage(page);
  });

  test("formulaire client — labels, boutons nommés, focus visible", async ({
    page,
  }) => {
    await openCheckoutFromCart(page);

    await expectLabeledInputs(page, ["Prénom", "Nom", "E-mail", "Téléphone"]);
    await expectNamedButtons(page, [/continuer vers la livraison/i]);
    await expect(page.getByRole("link", { name: /retour au panier/i })).toBeVisible();
    await expectVisibleFocusRing(page, "#firstName");
    await expectMinimumContrast(page, "h1");
    await expectNoSeriousAxeViolations(page);
  });
});

test.describe("Accessibilité — fiche produit", () => {
  test.beforeEach(async ({ page }) => {
    await dismissCookieBanner(page);
  });

  test("bouton d'achat nommé", async ({ page }) => {
    await page.goto("/catalogue");
    const productLink = page
      .getByRole("link", { name: /choisir la taille|voir le produit/i })
      .first();
    test.skip(
      (await productLink.count()) === 0,
      "Aucun produit vendable — photo commerciale requise",
    );

    await productLink.click();
    await expect(
      page
        .locator("main")
        .getByRole("button", { name: /ajouter/i })
        .first(),
    ).toBeVisible();
    await expectNoSeriousAxeViolations(page);
  });
});
