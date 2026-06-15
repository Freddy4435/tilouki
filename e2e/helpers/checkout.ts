import { expect, type Page } from "@playwright/test";

/** Libellé du bouton final — aligné sur checkout-flow.tsx (obligation de paiement). */
export const FINAL_PAYMENT_BUTTON = /commander et payer/i;

const CUSTOMER = {
  firstName: "Marie",
  lastName: "Dupont",
  email: "marie.e2e@tilouki.test",
  phone: "0612345678",
};

/** Ouvre le checkout avec un panier déjà hydraté (évite la course Zustand persist). */
export async function openCheckoutFromCart(page: Page) {
  if (!page.url().includes("/panier")) {
    await page.goto("/panier");
  }
  await expect(page.getByRole("button", { name: /passer commande/i })).toBeVisible({
    timeout: 20_000,
  });
  await page.getByRole("button", { name: /passer commande/i }).click();
  await page.waitForURL(/\/commande/);
  await page
    .getByLabel("Prénom", { exact: true })
    .waitFor({ state: "visible", timeout: 20_000 });
}

export async function fillCustomerStep(page: Page) {
  await page.getByLabel("Prénom", { exact: true }).fill(CUSTOMER.firstName);
  await page.getByLabel("Nom", { exact: true }).fill(CUSTOMER.lastName);
  await page.getByLabel("E-mail", { exact: true }).fill(CUSTOMER.email);
  await page.getByLabel("Téléphone", { exact: true }).fill(CUSTOMER.phone);
  await page.getByRole("button", { name: /continuer vers la livraison/i }).click();
  await page.getByLabel("Code postal").waitFor({ state: "visible" });
}

export async function selectMockRelayPoint(page: Page) {
  await page.getByLabel("Code postal").fill("75001");
  await page.getByRole("button", { name: /^rechercher$/i }).click();
  await page.getByText(/choisissez votre point relais/i).waitFor({ timeout: 20_000 });
  await page
    .getByRole("button", { name: /\[E2E\]/i })
    .first()
    .click();
  await page.getByRole("button", { name: /continuer vers le paiement/i }).click();
  await page
    .getByRole("button", { name: FINAL_PAYMENT_BUTTON })
    .waitFor({ state: "visible" });
}

/** Vérifie que livraison, frais, délai et rétractation sont visibles avant le bouton de paiement. */
export async function assertShippingRecapBeforePayment(page: Page) {
  await expect(page.getByText(/délai indicatif/i).first()).toBeVisible();
  await expect(page.getByText(/frais de livraison/i).first()).toBeVisible();
  await expect(page.getByText(/livraison en point relais/i).first()).toBeVisible();
  await expect(page.getByText(/rétractation de 14 jours/i).first()).toBeVisible();
  await expect(page.getByText(/total ttc/i).first()).toBeVisible();
}

export async function assertCgvBlocksPayment(page: Page) {
  await page.getByRole("button", { name: FINAL_PAYMENT_BUTTON }).click();
  await page
    .getByText(/vous devez accepter les conditions générales de vente avant de payer/i)
    .waitFor({ state: "visible" });
}

export async function acceptCgvAndPay(page: Page) {
  await page.getByRole("checkbox", { name: /j'ai lu et j'accepte/i }).click();
  await page.getByRole("button", { name: FINAL_PAYMENT_BUTTON }).click();
}
