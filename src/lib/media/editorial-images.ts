import {
  resolveBlogHeroTiloukiImage,
  resolveCategoryTiloukiImage,
  resolveEditorialModuleTiloukiImage,
  resolveTiloukiAltFromSrc,
  type TiloukiImage,
} from "@/lib/tilouki-images";

export type EditorialImageUsage =
  | "hero"
  | "blog"
  | "universe"
  | "guide"
  | "newsletter"
  | "material"
  | "ambiance";

export type EditorialImageId =
  | "hero-home"
  | "baby-clothes-flatlay"
  | "nursery-wardrobe"
  | "cotton-texture"
  | "pajamas-evening"
  | "size-guide"
  | "laundry-care"
  | "weekend-bag"
  | "colors-soft"
  | "blog-default"
  | "newsletter"
  | "material-closeup"
  | "universe-garcon"
  | "universe-fille"
  | "universe-bebe"
  | "universe-pyjamas"
  | "universe-accessoires"
  | "ritual-morning"
  | "ritual-night-calm"
  | "ritual-family-outing"
  | "ritual-baby-cocoon"
  | "ritual-rainy-day";

export interface EditorialImage {
  id: EditorialImageId;
  /** Chemin local servi depuis /public/images/tilouki — jamais d'URL distante en production. */
  src: `/images/tilouki/${string}`;
  alt: string;
  width: number;
  height: number;
  sourceUrl: string;
  licenseUrl: string;
  credit: string;
  /** Contextes autorisés (pas en fiche produit). */
  usage: EditorialImageUsage[];
}

const EDITORIAL_USAGE: Record<EditorialImageId, EditorialImageUsage[]> = {
  "hero-home": ["hero", "ambiance"],
  "baby-clothes-flatlay": ["blog", "universe", "ambiance"],
  "nursery-wardrobe": ["universe", "ambiance"],
  "cotton-texture": ["blog", "material", "ambiance"],
  "pajamas-evening": ["blog", "universe", "ambiance"],
  "size-guide": ["blog", "guide", "ambiance"],
  "laundry-care": ["blog", "ambiance"],
  "weekend-bag": ["blog", "ambiance"],
  "colors-soft": ["blog", "universe", "ambiance"],
  "blog-default": ["blog", "ambiance"],
  newsletter: ["newsletter", "ambiance"],
  "material-closeup": ["blog", "material", "universe", "ambiance"],
  "universe-garcon": ["universe", "ambiance"],
  "universe-fille": ["universe", "ambiance"],
  "universe-bebe": ["universe", "ambiance"],
  "universe-pyjamas": ["universe", "ambiance"],
  "universe-accessoires": ["universe", "ambiance"],
  "ritual-morning": ["universe", "ambiance"],
  "ritual-night-calm": ["universe", "ambiance"],
  "ritual-family-outing": ["universe", "ambiance"],
  "ritual-baby-cocoon": ["universe", "ambiance"],
  "ritual-rainy-day": ["universe", "ambiance"],
};

function toEditorialImage(id: EditorialImageId, tilouki: TiloukiImage): EditorialImage {
  return {
    id,
    src: tilouki.src,
    alt: tilouki.alt,
    width: tilouki.width,
    height: tilouki.height,
    sourceUrl: tilouki.sourceUrl,
    licenseUrl: tilouki.licenseUrl,
    credit: tilouki.credit,
    usage: EDITORIAL_USAGE[id],
  };
}

export const editorialImages: Record<EditorialImageId, EditorialImage> =
  Object.fromEntries(
    (Object.keys(EDITORIAL_USAGE) as EditorialImageId[]).map((id) => [
      id,
      toEditorialImage(id, resolveEditorialModuleTiloukiImage(id)),
    ]),
  ) as Record<EditorialImageId, EditorialImage>;

const BLOG_HERO_TO_EDITORIAL: Partial<Record<string, EditorialImageId>> = {
  "parent-mesure-body-table": "size-guide",
  "gros-plan-matieres-naturelles": "cotton-texture",
  "body-bonnet-pyjama-lit": "baby-clothes-flatlay",
  "pyjama-plie-lit-soir": "pajamas-evening",
  "trois-pieces-tenue-enfant": "colors-soft",
  "linge-enfant-etiquette-lavage": "laundry-care",
  "detail-couture-tissu": "material-closeup",
  "valise-week-end-enfant": "weekend-bag",
  "palette-couleurs-douces": "colors-soft",
  "pile-vetements-petits-prix": "blog-default",
};

const CATEGORY_UNIVERSE_IMAGE: Partial<Record<string, EditorialImageId>> = {
  bebe: "universe-bebe",
  fille: "universe-fille",
  garcon: "universe-garcon",
  pyjamas: "universe-pyjamas",
  accessoires: "universe-accessoires",
  pluie: "ritual-rainy-day",
  robes: "colors-soft",
  bodies: "baby-clothes-flatlay",
};

export function getEditorialImage(id: EditorialImageId): EditorialImage {
  return editorialImages[id];
}

export function getEditorialImageOrNull(
  id: string | null | undefined,
): EditorialImage | null {
  if (!id) return null;
  if (id in editorialImages) {
    return editorialImages[id as EditorialImageId];
  }
  return null;
}

export function resolveBlogHeroImage(heroImageId: string): EditorialImage {
  const tilouki = resolveBlogHeroTiloukiImage(heroImageId);
  const editorialId = BLOG_HERO_TO_EDITORIAL[heroImageId] ?? "blog-default";
  const image = getEditorialImage(editorialId);
  return {
    ...image,
    src: tilouki.src,
    alt: tilouki.alt,
  };
}

export function resolveUniverseEditorialImage(categorySlug: string): EditorialImage {
  const tilouki = resolveCategoryTiloukiImage(categorySlug);
  const editorialId = CATEGORY_UNIVERSE_IMAGE[categorySlug] ?? "blog-default";
  const image = getEditorialImage(editorialId);
  return {
    ...image,
    src: tilouki.src,
    alt: tilouki.alt,
  };
}

export function getDefaultHeroEditorialImage(): EditorialImage {
  return getEditorialImage("hero-home");
}

export function resolveEditorialAltFromSrc(src: string, fallback: string): string {
  if (src.startsWith("/images/tilouki/")) {
    const match = Object.values(editorialImages).find((img) => img.src === src);
    if (match) return match.alt;
    return resolveTiloukiAltFromSrc(src, fallback);
  }
  const legacyId = src.replace(/^\/editorial\//, "").replace(/\.webp$/, "");
  return getEditorialImageOrNull(legacyId)?.alt ?? fallback;
}
