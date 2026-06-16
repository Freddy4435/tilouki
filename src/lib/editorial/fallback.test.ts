import { describe, expect, it } from "vitest";

import { resolveEditorialBlocks } from "@/lib/editorial/fallback";
import { resolveUniverseEditorialImage } from "@/lib/media/editorial-images";
import { CATEGORY_TILOUKI_IMAGE } from "@/lib/tilouki-images";
import type { Category } from "@/types/catalog";

const categories: Category[] = [
  {
    id: "1",
    name: "Bébé",
    slug: "bebe",
    description: "Naissance à 24 mois",
    imageUrl: "/products/body-bebe-coton-bio.svg",
    sortOrder: 1,
  },
  {
    id: "2",
    name: "Fille",
    slug: "fille",
    description: null,
    imageUrl: null,
    sortOrder: 2,
  },
];

const singleConfiguredBlock = [
  {
    title: "Seul bloc",
    hook: "Test",
    imageUrl: "https://example.com/a.jpg",
    href: "/catalogue",
  },
];

describe("resolveEditorialBlocks", () => {
  it("utilise le fallback catégories Tilouki si moins de 2 blocs configurés", () => {
    const blocks = resolveEditorialBlocks(singleConfiguredBlock, categories);

    const expectedBebeImage = resolveUniverseEditorialImage("bebe").src;
    const expectedFilleImage = resolveUniverseEditorialImage("fille").src;

    expect(blocks).toHaveLength(2);
    expect(blocks[0]?.title).toBe("Bébé");
    expect(blocks[0]?.imageUrl).toBe(expectedBebeImage);
    expect(blocks[0]?.imageUrl).toMatch(/^\/images\/tilouki\//);
    expect(blocks[0]?.imageUrl).toContain("bebe");
    expect(CATEGORY_TILOUKI_IMAGE.bebe).toBe("categorie-bebe-combinaison-grise");

    expect(blocks[1]?.title).toBe("Fille");
    expect(blocks[1]?.imageUrl).toBe(expectedFilleImage);
    expect(blocks[1]?.imageUrl).toMatch(/^\/images\/tilouki\//);

    const blocksAgain = resolveEditorialBlocks(singleConfiguredBlock, categories);
    expect(blocksAgain[0]?.imageUrl).toBe(blocks[0]?.imageUrl);
    expect(blocksAgain[1]?.imageUrl).toBe(blocks[1]?.imageUrl);
  });

  it("conserve les blocs administrés quand au moins 2 sont actifs", () => {
    const configured = [
      {
        title: "Look d'été",
        hook: "Léger et coloré",
        imageUrl: "https://example.com/a.jpg",
        href: "/catalogue",
      },
      {
        title: "Cocon hiver",
        hook: "Douceur garantie",
        imageUrl: "https://example.com/b.jpg",
        href: "/categorie/pyjamas",
      },
    ];

    const blocks = resolveEditorialBlocks(configured, categories);
    expect(blocks).toEqual(configured);
  });
});
