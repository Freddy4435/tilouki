import { test, expect } from "./fixtures";

test.describe("Suivi de commande", () => {
  test("affiche le formulaire de suivi", async ({ page }) => {
    await page.goto("/suivi-commande");
    await expect(
      page.getByRole("heading", { name: /suivi de commande/i }),
    ).toBeVisible();
    await expect(page.getByLabel(/numéro de suivi/i)).toBeVisible();
  });

  test("préremplit le jeton depuis l'URL", async ({ page }) => {
    await page.goto("/suivi-commande?token=abc123");
    await expect(page.locator("#tracking-token")).toHaveValue("abc123");
  });
});
