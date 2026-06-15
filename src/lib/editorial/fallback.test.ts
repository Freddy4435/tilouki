import { describe, expect, it } from "vitest";

import { resolveEditorialBlocks } from "@/lib/editorial/fallback";
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

describe("resolveEditorialBlocks", () => {
  it("utilise le fallback catégories si moins de 2 blocs configurés", () => {
    const blocks = resolveEditorialBlocks(
      [
        {
          title: "Seul bloc",
          hook: "Test",
          imageUrl: "https://example.com/a.jpg",
          href: "/catalogue",
        },
      ],
      categories,
    );

    expect(blocks).toHaveLength(2);
    expect(blocks[0]?.title).toBe("Bébé");
    expect(blocks[0]?.imageUrl).toBeNull();
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
