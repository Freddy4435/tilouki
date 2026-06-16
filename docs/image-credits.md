# Crédits images éditoriales Tilouki

Images stock **libres de droit**, téléchargées puis hébergées localement dans `public/editorial/` (format WebP).  
**Usage autorisé** : ambiance, blog, guide tailles, univers éditoriaux — **jamais** comme photo produit sur une fiche vendue.

Licence Pexels : [https://www.pexels.com/license/](https://www.pexels.com/license/)  
Date de téléchargement dans le dépôt : **15 juin 2026**

| Fichier local               | Source                                                                                                    | Auteur·rice       | Licence        | Usage Tilouki                      |
| --------------------------- | --------------------------------------------------------------------------------------------------------- | ----------------- | -------------- | ---------------------------------- |
| `hero-home.webp`            | [Pexels #7286888](https://www.pexels.com/photo/white-wooden-wardrobe-7286888/)                            | Ksenia Chernaya   | Pexels License | Hero accueil (sans produit)        |
| `baby-clothes-flatlay.webp` | [Pexels #3875085](https://www.pexels.com/photo/white-and-gray-floral-textile-3875085/)                    | Laura James       | Pexels License | Blog, univers bébé                 |
| `nursery-wardrobe.webp`     | [Pexels #1457842](https://www.pexels.com/photo/photo-of-children-s-room-1457842/)                         | Max Vakhtbovyc    | Pexels License | Univers éditorial                  |
| `cotton-texture.webp`       | [Pexels #6287554](https://www.pexels.com/photo/white-cotton-textile-6287554/)                             | cottonbro studio  | Pexels License | Blog matières                      |
| `pajamas-evening.webp`      | [Pexels #6591639](https://www.pexels.com/photo/brown-wooden-table-near-white-bed-6591639/)                | Max Vakhtbovyc    | Pexels License | Blog pyjamas, univers nuit         |
| `size-guide.webp`           | [Pexels #4467683](https://www.pexels.com/photo/yellow-and-white-floral-textile-4467683/)                  | Castorly Stock    | Pexels License | Blog tailles, guide accueil        |
| `laundry-care.webp`         | [Pexels #373543](https://www.pexels.com/photo/assorted-color-textile-lot-373543/)                         | Burst             | Pexels License | Blog entretien                     |
| `weekend-bag.webp`          | [Pexels #2901538](https://www.pexels.com/photo/person-holding-black-leather-bag-2901538/)                 | Andrea Piacquadio | Pexels License | Blog valise week-end               |
| `colors-soft.webp`          | [Pexels #6348091](https://www.pexels.com/photo/assorted-clothes-6348091/)                                 | Ksenia Chernaya   | Pexels License | Blog couleurs, univers fille       |
| `blog-default.webp`         | [Pexels #4239346](https://www.pexels.com/photo/white-ceramic-mug-beside-black-pen-4239346/)               | Lisa Fotios       | Pexels License | Fallback blog                      |
| `newsletter.webp`           | [Pexels #706511](https://www.pexels.com/photo/white-envelope-706511/)                                     | Pixabay           | Pexels License | Bloc newsletter                    |
| `material-closeup.webp`     | [Pexels #3771690](https://www.pexels.com/photo/white-and-brown-floral-textile-3771690/)                   | Miriam Alonso     | Pexels License | Blog durabilité                    |
| `universe-garcon.webp`      | [Pexels #5251636](https://www.pexels.com/photo/boy-standing-on-green-grass-field-during-daytime-5251636/) | Gustavo Fring     | Pexels License | Univers garçon, tuiles catégorie   |
| `universe-fille.webp`       | [Pexels #15075852](https://www.pexels.com/photo/a-girl-in-a-colorful-dress-standing-outdoors-15075852/)   | MART PRODUCTION   | Pexels License | Univers fille, tuiles catégorie    |
| `universe-bebe.webp`        | [Pexels #11387533](https://www.pexels.com/photo/a-person-holding-a-baby-in-a-white-shirt-11387533/)       | MART PRODUCTION   | Pexels License | Univers bébé, tuiles catégorie     |
| `night-calm.webp`           | [Pexels #7938251](https://www.pexels.com/photo/a-child-in-pajamas-reading-a-book-in-bed-7938251/)         | cottonbro studio  | Pexels License | Univers pyjamas, rituel Nuit calme |
| `universe-accessoires.webp` | [Pexels #4489702](https://www.pexels.com/photo/pair-of-brown-leather-shoes-on-white-surface-4489702/)     | RODNA Images      | Pexels License | Univers accessoires                |
| `ritual-morning.webp`       | [Pexels #8613145](https://www.pexels.com/photo/a-boy-wearing-a-backpack-walking-on-the-sidewalk-8613145/) | MART PRODUCTION   | Pexels License | Rituel Matin pressé                |
| `ritual-family-outing.webp` | [Pexels #8534085](https://www.pexels.com/photo/a-woman-and-a-little-girl-walking-on-a-path-8534085/)      | Gustavo Fring     | Pexels License | Rituel Sortie famille              |
| `ritual-rainy-day.webp`     | [Pexels #1835670](https://www.pexels.com/photo/person-wearing-yellow-raincoat-holding-umbrella-1835670/)  | Chris F           | Pexels License | Rituel Jour de pluie               |

## Régénération

```bash
npm run editorial:fetch
```

Le script `scripts/fetch-editorial-images.mjs` télécharge depuis Pexels et compresse en WebP (qualité 82). Mettre à jour ce fichier si les IDs changent.

## Règles métier

- Ne pas remplacer une photo produit réelle par une image de ce dossier.
- Éviter les visages d'enfants reconnaissables dans le hero commercial.
- Toute nouvelle image doit être ajoutée à `src/lib/media/editorial-images.ts` et listée ici.
