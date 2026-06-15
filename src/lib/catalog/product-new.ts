const NEW_PRODUCT_DAYS = 21;

/** Produit considéré comme nouveauté (badge retail). */
export function isProductNew(createdAt: string, now = Date.now()): boolean {
  const created = new Date(createdAt).getTime();
  if (Number.isNaN(created)) return false;
  const ageMs = now - created;
  return ageMs >= 0 && ageMs <= NEW_PRODUCT_DAYS * 24 * 60 * 60 * 1000;
}
