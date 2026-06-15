import { test, expect } from "./fixtures";

import {
  addCurrentProductToCart,
  openFirstProductFromCatalogue,
} from "./helpers/catalog";
import {
  fillCustomerStep,
  FINAL_PAYMENT_BUTTON,
  openCheckoutFromCart,
  selectMockRelayPoint,
} from "./helpers/checkout";
import { dismissCookieBanner, setupPurchaseMocks } from "./helpers/mocks";

test.describe("Pages vitrine", () => {
  test.beforeEach(async ({ page }) => {
    await dismissCookieBanner(page);
  });

  test("accueil — hero, navigation et footer légaux", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("main")).toBeVisible();
    await expect(page.getByRole("link", { name: /catalogue/i }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /mentions légales/i })).toBeVisible();
    await expect(page.getByRole("link", { name: "CGV", exact: true })).toBeVisible();
  });

  test("catalogue — liste produits et lien fiche", async ({ page }) => {
    await page.goto("/catalogue");
    await expect(
      page.getByRole("heading", { name: /catalogue vêtements enfants/i }),
    ).toBeVisible();

    const productHref = await openFirstProductFromCatalogue(page, { skipGoto: true });
    test.skip(!productHref, "Aucun produit vendable — photo commerciale requise");

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("button", { name: /ajouter/i }).first()).toBeVisible();
  });

  test("fiche produit — prix et ajout panier", async ({ page }) => {
    const href = await openFirstProductFromCatalogue(page);
    test.skip(!href, "Aucun produit vendable — photo commerciale requise");

    await expect(page.locator("main").locator(".tabular-nums").first()).toBeVisible();
    await dismissCookieBanner(page);
    await page
      .getByRole("button", { name: /ajouter/i })
      .first()
      .click();
    await expect(page.getByRole("link", { name: /panier/i }).first()).toBeVisible();
  });

  test("suivi commande — formulaire vide sans token", async ({ page }) => {
    await page.goto("/suivi-commande");
    await expect(
      page.getByRole("heading", { name: /suivi de commande/i }),
    ).toBeVisible();
    await expect(page.getByLabel(/numéro de suivi/i)).toHaveValue("");
  });

  test("suivi commande — token invalide dans l'URL", async ({ page }) => {
    await page.goto("/suivi-commande?token=pas-un-uuid");
    await expect(page.getByLabel(/numéro de suivi/i)).toHaveValue("pas-un-uuid", {
      timeout: 15_000,
    });
    await expect(page.getByText(/numéro de suivi invalide/i)).toBeVisible({
      timeout: 15_000,
    });
  });

  test("suivi commande — token valide inconnu", async ({ page }) => {
    const unknownToken = "550e8400-e29b-41d4-a716-446655440000";
    await page.goto(`/suivi-commande?token=${unknownToken}`);
    await expect(page.getByLabel(/numéro de suivi/i)).toHaveValue(unknownToken, {
      timeout: 15_000,
    });
    await expect(page.getByText(/aucune commande trouvée/i)).toBeVisible({
      timeout: 15_000,
    });
  });

  test("panier et checkout — récapitulatif complet", async ({ page }) => {
    await setupPurchaseMocks(page);

    const productHref = await openFirstProductFromCatalogue(page);
    test.skip(!productHref, "Aucun produit vendable — photo commerciale requise");

    await addCurrentProductToCart(page);
    await expect(page.getByRole("heading", { name: /votre panier/i })).toBeVisible();
    await expect(page.locator("main").locator(".tabular-nums").first()).toBeVisible();

    await openCheckoutFromCart(page);
    await fillCustomerStep(page);
    await selectMockRelayPoint(page);

    await expect(
      page.getByRole("heading", { name: /résumé de commande/i }),
    ).toBeVisible();
    await expect(page.locator("main").locator(".tabular-nums").first()).toBeVisible();
    await expect(
      page.getByRole("button", { name: FINAL_PAYMENT_BUTTON }),
    ).toBeVisible();
  });
});
