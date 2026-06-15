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
  | "ritual-rainy-day";

export interface EditorialImage {
  id: EditorialImageId;
  /** Chemin local servi depuis /public — jamais d'URL distante en production. */
  src: `/editorial/${string}.webp`;
  alt: string;
  width: number;
  height: number;
  sourceUrl: string;
  licenseUrl: string;
  credit: string;
  /** Contextes autorisés (pas en fiche produit). */
  usage: EditorialImageUsage[];
}

export const editorialImages: Record<EditorialImageId, EditorialImage> = {
  "hero-home": {
    id: "hero-home",
    src: "/editorial/hero-home.webp",
    alt: "Penderie lumineuse avec vêtements enfants rangés sur cintres — ambiance boutique.",
    width: 1600,
    height: 1067,
    sourceUrl: "https://www.pexels.com/photo/white-wooden-wardrobe-7286888/",
    licenseUrl: "https://www.pexels.com/license/",
    credit: "Pexels — Ksenia Chernaya",
    usage: ["hero", "ambiance"],
  },
  "baby-clothes-flatlay": {
    id: "baby-clothes-flatlay",
    src: "/editorial/baby-clothes-flatlay.webp",
    alt: "Bodies et petits vêtements bébé pliés sur un lit clair, vue de dessus.",
    width: 1400,
    height: 933,
    sourceUrl: "https://www.pexels.com/photo/white-and-gray-floral-textile-3875085/",
    licenseUrl: "https://www.pexels.com/license/",
    credit: "Pexels — Laura James",
    usage: ["blog", "universe", "ambiance"],
  },
  "nursery-wardrobe": {
    id: "nursery-wardrobe",
    src: "/editorial/nursery-wardrobe.webp",
    alt: "Armoire et rangements dans une chambre d'enfant lumineuse, sans personne visible.",
    width: 1400,
    height: 933,
    sourceUrl: "https://www.pexels.com/photo/photo-of-children-s-room-1457842/",
    licenseUrl: "https://www.pexels.com/license/",
    credit: "Pexels — Max Vakhtbovyc",
    usage: ["universe", "ambiance"],
  },
  "cotton-texture": {
    id: "cotton-texture",
    src: "/editorial/cotton-texture.webp",
    alt: "Gros plan sur un tissu coton doux et naturel.",
    width: 1200,
    height: 800,
    sourceUrl: "https://www.pexels.com/photo/white-cotton-textile-6287554/",
    licenseUrl: "https://www.pexels.com/license/",
    credit: "Pexels — cottonbro studio",
    usage: ["blog", "material", "ambiance"],
  },
  "pajamas-evening": {
    id: "pajamas-evening",
    src: "/editorial/pajamas-evening.webp",
    alt: "Pyjama plié sur un lit avec lumière douce du soir.",
    width: 1400,
    height: 933,
    sourceUrl: "https://www.pexels.com/photo/brown-wooden-table-near-white-bed-6591639/",
    licenseUrl: "https://www.pexels.com/license/",
    credit: "Pexels — Max Vakhtbovyc",
    usage: ["blog", "universe", "ambiance"],
  },
  "size-guide": {
    id: "size-guide",
    src: "/editorial/size-guide.webp",
    alt: "Mètre ruban posé sur un vêtement enfant à plat pour comparer les tailles.",
    width: 1400,
    height: 933,
    sourceUrl: "https://www.pexels.com/photo/yellow-and-white-floral-textile-4467683/",
    licenseUrl: "https://www.pexels.com/license/",
    credit: "Pexels — Castorly Stock",
    usage: ["blog", "guide", "ambiance"],
  },
  "laundry-care": {
    id: "laundry-care",
    src: "/editorial/laundry-care.webp",
    alt: "Panier de linge et vêtements enfants pliés — entretien du quotidien.",
    width: 1400,
    height: 933,
    sourceUrl: "https://www.pexels.com/photo/assorted-color-textile-lot-373543/",
    licenseUrl: "https://www.pexels.com/license/",
    credit: "Pexels — Burst",
    usage: ["blog", "ambiance"],
  },
  "weekend-bag": {
    id: "weekend-bag",
    src: "/editorial/weekend-bag.webp",
    alt: "Petite valise ouverte avec vêtements pliés pour un week-end.",
    width: 1400,
    height: 933,
    sourceUrl: "https://www.pexels.com/photo/person-holding-black-leather-bag-2901538/",
    licenseUrl: "https://www.pexels.com/license/",
    credit: "Pexels — Andrea Piacquadio",
    usage: ["blog", "ambiance"],
  },
  "colors-soft": {
    id: "colors-soft",
    src: "/editorial/colors-soft.webp",
    alt: "Vêtements enfants aux couleurs douces empilés — palette jade, écru et pastel.",
    width: 1400,
    height: 933,
    sourceUrl: "https://www.pexels.com/photo/assorted-clothes-6348091/",
    licenseUrl: "https://www.pexels.com/license/",
    credit: "Pexels — Ksenia Chernaya",
    usage: ["blog", "universe", "ambiance"],
  },
  "blog-default": {
    id: "blog-default",
    src: "/editorial/blog-default.webp",
    alt: "Carnet, tasse et lumière naturelle — lecture cosy autour du quotidien famille.",
    width: 1400,
    height: 933,
    sourceUrl: "https://www.pexels.com/photo/white-ceramic-mug-beside-black-pen-4239346/",
    licenseUrl: "https://www.pexels.com/license/",
    credit: "Pexels — Lisa Fotios",
    usage: ["blog", "ambiance"],
  },
  newsletter: {
    id: "newsletter",
    src: "/editorial/newsletter.webp",
    alt: "Enveloppes et papeterie sur un bureau clair — invitation à la newsletter.",
    width: 1200,
    height: 800,
    sourceUrl: "https://www.pexels.com/photo/white-envelope-706511/",
    licenseUrl: "https://www.pexels.com/license/",
    credit: "Pexels — Pixabay",
    usage: ["newsletter", "ambiance"],
  },
  "material-closeup": {
    id: "material-closeup",
    src: "/editorial/material-closeup.webp",
    alt: "Détail de couture et texture de maille sur un vêtement enfant.",
    width: 1200,
    height: 800,
    sourceUrl: "https://www.pexels.com/photo/white-and-brown-floral-textile-3771690/",
    licenseUrl: "https://www.pexels.com/license/",
    credit: "Pexels — Miriam Alonso",
    usage: ["blog", "material", "universe", "ambiance"],
  },
  "universe-garcon": {
    id: "universe-garcon",
    src: "/editorial/universe-garcon.webp",
    alt: "Petit garçon de dos dans un parc verdoyant, prêt à courir.",
    width: 1400,
    height: 933,
    sourceUrl:
      "https://www.pexels.com/photo/boy-standing-on-green-grass-field-during-daytime-5251636/",
    licenseUrl: "https://www.pexels.com/license/",
    credit: "Pexels — Gustavo Fring",
    usage: ["universe", "ambiance"],
  },
  "universe-fille": {
    id: "universe-fille",
    src: "/editorial/universe-fille.webp",
    alt: "Petite fille en robe colorée dehors, souriante et prête à jouer.",
    width: 1400,
    height: 933,
    sourceUrl:
      "https://www.pexels.com/photo/a-girl-in-a-colorful-dress-standing-outdoors-15075852/",
    licenseUrl: "https://www.pexels.com/license/",
    credit: "Pexels — MART PRODUCTION",
    usage: ["universe", "ambiance"],
  },
  "universe-bebe": {
    id: "universe-bebe",
    src: "/editorial/universe-bebe.webp",
    alt: "Bébé dans les bras d'un parent — premiers mois et douceur du quotidien.",
    width: 1400,
    height: 933,
    sourceUrl:
      "https://www.pexels.com/photo/a-person-holding-a-baby-in-a-white-shirt-11387533/",
    licenseUrl: "https://www.pexels.com/license/",
    credit: "Pexels — MART PRODUCTION",
    usage: ["universe", "ambiance"],
  },
  "universe-pyjamas": {
    id: "universe-pyjamas",
    src: "/editorial/night-calm.webp",
    alt: "Enfant en pyjama, lecture au coucher à la lumière douce du soir.",
    width: 1400,
    height: 933,
    sourceUrl:
      "https://www.pexels.com/photo/a-child-in-pajamas-reading-a-book-in-bed-7938251/",
    licenseUrl: "https://www.pexels.com/license/",
    credit: "Pexels — cottonbro studio",
    usage: ["universe", "ambiance"],
  },
  "universe-accessoires": {
    id: "universe-accessoires",
    src: "/editorial/universe-accessoires.webp",
    alt: "Petites chaussures bébé posées sur un parquet clair — accessoires du quotidien.",
    width: 1400,
    height: 933,
    sourceUrl: "https://www.pexels.com/photo/pair-of-brown-leather-shoes-on-white-surface-4489702/",
    licenseUrl: "https://www.pexels.com/license/",
    credit: "Pexels — RODNA Images",
    usage: ["universe", "ambiance"],
  },
  "ritual-morning": {
    id: "ritual-morning",
    src: "/editorial/ritual-morning.webp",
    alt: "Garçon avec sac à dos marchant vers l'école un matin ensoleillé.",
    width: 1400,
    height: 933,
    sourceUrl:
      "https://www.pexels.com/photo/a-boy-wearing-a-backpack-walking-on-the-sidewalk-8613145/",
    licenseUrl: "https://www.pexels.com/license/",
    credit: "Pexels — MART PRODUCTION",
    usage: ["universe", "ambiance"],
  },
  "ritual-night-calm": {
    id: "ritual-night-calm",
    src: "/editorial/night-calm.webp",
    alt: "Enfant en pyjama au lit, moment calme avant de dormir.",
    width: 1400,
    height: 933,
    sourceUrl:
      "https://www.pexels.com/photo/a-child-in-pajamas-reading-a-book-in-bed-7938251/",
    licenseUrl: "https://www.pexels.com/license/",
    credit: "Pexels — cottonbro studio",
    usage: ["universe", "ambiance"],
  },
  "ritual-family-outing": {
    id: "ritual-family-outing",
    src: "/editorial/ritual-family-outing.webp",
    alt: "Parent et enfant se promenant main dans la main dans un parc.",
    width: 1400,
    height: 933,
    sourceUrl:
      "https://www.pexels.com/photo/a-woman-and-a-little-girl-walking-on-a-path-8534085/",
    licenseUrl: "https://www.pexels.com/license/",
    credit: "Pexels — Gustavo Fring",
    usage: ["universe", "ambiance"],
  },
  "ritual-rainy-day": {
    id: "ritual-rainy-day",
    src: "/editorial/ritual-rainy-day.webp",
    alt: "Enfant en imperméable jaune sous la pluie, habillé pour affronter la grisaille.",
    width: 1400,
    height: 933,
    sourceUrl:
      "https://www.pexels.com/photo/person-wearing-yellow-raincoat-holding-umbrella-1835670/",
    licenseUrl: "https://www.pexels.com/license/",
    credit: "Pexels — Chris F",
    usage: ["universe", "ambiance"],
  },
};

const CATEGORY_UNIVERSE_IMAGE: Partial<Record<string, EditorialImageId>> = {
  bebe: "universe-bebe",
  fille: "universe-fille",
  garcon: "universe-garcon",
  pyjamas: "universe-pyjamas",
  accessoires: "universe-accessoires",
};

const BLOG_HERO_IMAGE: Partial<Record<string, EditorialImageId>> = {
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
  const mapped = BLOG_HERO_IMAGE[heroImageId];
  if (mapped) return getEditorialImage(mapped);
  return getEditorialImage("blog-default");
}

export function resolveUniverseEditorialImage(categorySlug: string): EditorialImage | null {
  const id = CATEGORY_UNIVERSE_IMAGE[categorySlug];
  return id ? getEditorialImage(id) : null;
}

export function getDefaultHeroEditorialImage(): EditorialImage {
  return getEditorialImage("hero-home");
}
