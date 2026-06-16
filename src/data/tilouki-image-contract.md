# Contrat images Tilouki — pack éditorial 2026

Le pack `/images/tilouki/` est **réservé aux surfaces éditoriales** (home, navigation, catégories, rituels, blog, guides). Il ne doit **jamais** servir de photo produit vendable sur une fiche ou dans le panier.

Source de vérité code : `src/lib/tilouki-image-registry.ts` + résolveurs dans `src/lib/tilouki-images.ts`.

## Quelle image pour quel module ?

| Surface | Module / id | Résolveur | Image pack (clé) |
|--------|-------------|-----------|------------------|
| **Home hero** | `hero-home` | `resolveEditorialModuleTiloukiImage` | `home-hero-dressing-couleurs` |
| **Accès rapides** | `bebe`, `fille`, `garcon`, `pyjamas`, `petits-prix` | `resolveQuickAccessTiloukiImage` | voir `QUICK_ACCESS_IMAGE_REGISTRY` |
| **Catégories** | slug catalogue (`bebe`, `fille`, `garcon`, `pyjamas`, `pluie`…) | `resolveCategoryTiloukiImage` | voir `CATEGORY_IMAGE_REGISTRY` |
| **Rituels** | `nuit-calme`, `jour-de-pluie`, `bebe-cocon`, `matin-presse`, `petit-budget` | `resolveRitualTiloukiImage` | voir `RITUAL_IMAGE_REGISTRY` |
| **Catalogue** | bandeau index / catégorie | `resolveCatalogueSurfaceTiloukiImage` | `categorie-boutique-enfants-mannequins` |
| **Blog / guides** | `heroImageId` article | `resolveBlogHeroTiloukiImage` | voir `BLOG_HERO_IMAGE_REGISTRY` |
| **Réassurance** | guide tailles, linge, newsletter, livraison | `resolveReassuranceTiloukiImage` | voir `REASSURANCE_SURFACE_IMAGE_REGISTRY` |

## Règles sémantiques

- **Garçon** → photo garçon (`categorie-garcon-look-moderne`).
- **Fille** → photo fille (`categorie-fille-look-doux`).
- **Bébé** → photo bébé (`categorie-bebe-combinaison-grise` ou rituel cocon).
- **Nuit douce** → scène nuit / sommeil / pyjama (`rituel-nuit-calme-enfant-dort`).
- **Jour de pluie** → pluie, flaque ou bottes (`rituel-jour-de-pluie-flaque`).
- **Petits prix** → rack vêtements enfant (`categorie-vetements-enfant-rack`).

## Ajouter une image

1. Ajouter le fichier dans `public/images/tilouki/` et le manifeste `src/data/manifest-photos-tilouki.json`.
2. Enregistrer la clé dans la registry adaptée (`CATEGORY_IMAGE_REGISTRY`, `RITUAL_IMAGE_REGISTRY`, etc.).
3. Lancer `npm run test` — les tests `tilouki-image-registry` et `tilouki-images` doivent passer.

## Interdit

- Utiliser une URL `/images/tilouki/…` comme `primaryImageUrl` produit.
- Laisser un module connu sans entrée dédiée dans une registry.
- Fallback aléatoire : seuls les repli documentés dans `resolve*FallbackKey` sont autorisés.

Validation produit : `assertNotTiloukiPackProductImage(url)` et `isCommercialProductImage` dans `product-sellability.ts`.
