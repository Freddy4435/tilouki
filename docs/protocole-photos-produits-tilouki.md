# Protocole photos produits Tilouki

Document opérationnel pour remplacer les visuels SVG (`/products/*.svg`, `/demo-products/*`) par de **vraies photos commerciales** avant vente.

## Statuts admin (fiche produit → Photos)

| Statut                    | Condition                                        | Boutique                   |
| ------------------------- | ------------------------------------------------ | -------------------------- |
| **Invisible en boutique** | Aucune photo commerciale valide                  | Absent catalogue / accueil |
| **Visible catalogue**     | ≥ 1 photo JPEG/PNG/WebP + description (≥ 8 car.) | Carte + fiche achetable    |
| **Prêt à vendre**         | ≥ 3 photos commerciales                          | Fiche complète             |

## Les 3 photos attendues

| #   | Vue                             | Nom de fichier (exemple)                 | Description alt (exemple)                        |
| --- | ------------------------------- | ---------------------------------------- | ------------------------------------------------ |
| 1   | **Face avant** — produit entier | `robe-fille-liberty-face-avant.jpg`      | `Robe fille 4 ans, imprimé liberty, vue de face` |
| 2   | **Détail matière** ou finition  | `robe-fille-liberty-detail-matiere.jpg`  | `Détail matière — coton imprimé liberty`         |
| 3   | **Portée** ou mise en situation | `robe-fille-liberty-porte-mannequin.jpg` | `Robe fille portée sur mannequin 4 ans`          |

**Seconde main :** ajoutez une photo **défaut** avec un alt explicite (`défaut`, `trace`, `usure`).

### Dimensions

- **1200 × 1500 px** (ratio 4:5 portrait) — rendu homogène catalogue et fiche.
- Poids : respecter la limite affichée sous le bouton d’upload admin.
- Format : **JPEG**, **PNG** ou **WebP** uniquement.

### Règles de nommage

```
{slug-produit}-{vue}.jpg
```

Exemples :

- `body-bebe-coton-ecru-face-avant.jpg`
- `pyjama-etoiles-detail-matiere.jpg`
- `short-garcon-bleu-porte-flatlay.jpg`

Évitez les espaces et accents dans le nom de fichier ; gardez la description dans le champ **Description photo** (alt).

## Interdits (bloqués storefront)

| Source             | Exemple                              | Pourquoi                          |
| ------------------ | ------------------------------------ | --------------------------------- |
| SVG catalogue seed | `/products/robe-liberty-fleurie.svg` | Visuel démo, pas une photo réelle |
| Dossier démo DEV   | `/demo-products/body-bebe.svg`       | Réservé environnement de test     |
| Pack Tilouki       | `/images/tilouki/...`                | Surfaces éditoriales uniquement   |
| Placeholder        | alt « Photo à venir »                | Pas de confiance parent           |
| Banques stock      | Pexels, Unsplash, Pixabay            | Pas la photo de l’article expédié |

## Workflow admin

1. **Admin → Produits → [fiche] → Photos**
2. Vérifier le bandeau **Statut photo boutique**
3. Si alerte **SVG démo détecté** : supprimer le visuel et uploader vos fichiers
4. Remplir la **Description photo** pour chaque image (≥ 8 caractères, vue réelle)
5. Ordonner : **1ʳᵉ photo = principale** catalogue
6. Compléter les **Photos manquantes attendues** jusqu’à « Prêt à vendre »

## Vérification automatique

Le code signale toute URL encore pointée vers `/products/*.svg` ou `/demo-products/*` :

- checklist **Photos prêtes à vendre** (fiche produit)
- **Prêt à vendre — catalogue** (liste produits admin)
- tests `product-sellability` / `product-image-readiness`

Guide détaillé (setup smartphone, seconde main) : [`guide-photos-produits-tilouki.md`](./guide-photos-produits-tilouki.md).

---

_Aligné sur `src/lib/catalog/product-sellability.ts` et l’admin **Photos prêtes à vendre**._
