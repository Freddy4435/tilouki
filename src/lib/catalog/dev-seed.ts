import { DEV_SEED_PRODUCT_SLUGS } from "@/lib/catalog/dev-seed.fixture";

const DEV_SEED_SLUG_SET = new Set<string>(DEV_SEED_PRODUCT_SLUGS);

export function isDevSeedProductSlug(slug: string): boolean {
  return DEV_SEED_SLUG_SET.has(slug);
}

/** Retourne le premier slug démo trouvé, ou null. */
export function findDevSeedSlugAmong(slugs: string[]): string | null {
  return slugs.find(isDevSeedProductSlug) ?? null;
}

export const DEV_SEED_CHECKOUT_BLOCKED_MESSAGE =
  "Ce panier contient des articles de démonstration qui ne peuvent pas être vendus en production. Retirez-les de votre panier ou contactez la boutique.";
