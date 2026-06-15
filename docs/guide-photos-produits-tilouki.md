# Guide photos produits Tilouki

Ce document décrit comment photographier les vêtements enfants vendus sur Tilouki. Les photos éditoriales (`/editorial/`) et les banques d’images (Pexels, Unsplash, Pixabay) sont réservées au blog et à l’accueil — **jamais** en fiche produit.

## Règles vitrine

| Règle | Détail |
|--------|--------|
| Minimum catalogue | **1** photo réelle avec description (alt) pour apparaître en catalogue |
| Recommandé pour vendre | **3** photos : face, détail, mise en scène ou couleur |
| Formats acceptés | JPEG, PNG, WebP uploadés dans l’espace admin |
| Interdits | SVG catalogue démo, placeholders, « Photo à venir », URLs stock, images `/editorial/` |
| Alt | Descriptif, ≥ 8 caractères (ex. « Pyjama garçon face avant, coton gris ») |

## Les 3 photos recommandées

### 1. Face / produit entier (obligatoire)

- Vêtement **entier** visible : à plat sur fond clair chaud ou sur cintre neutre.
- **Lumière naturelle** — éviter le flash direct qui déforme les couleurs.
- C’est la **première photo** de la fiche (image principale catalogue).

### 2. Détail matière ou finition

- Gros plan sur le tissu, la maille, une couture ou une fermeture.
- Indiquez « détail matière » dans la description photo.

### 3. Mise en scène ou pliage

- Vêtement plié proprement, sur cintre dans un dressing lumineux, ou contexte doux **sans enfant reconnaissable**.
- Aide le parent à visualiser le volume et la douceur du vêtement.

## Couleur fidèle

- Photographiez près d’une fenêtre, sans filtre orange/bleu fort.
- Mentionnez la **couleur réelle** dans l’alt (ex. « vert jade », « écru »).

## Seconde main

Si l’article est d’occasion ou présente un défaut :

- Photographiez **chaque défaut visible** (tache, usure, fil tiré).
- Décrivez-le dans l’alt avec les mots « défaut », « trace », « usure », etc.
- La checklist admin le marquera comme obligatoire.

## Checklist admin

Dans **Admin → Produit → Photos**, la checklist « Photos prêtes à vendre » reprend :

1. Face / produit entier *(obligatoire)*
2. Description photo alt *(obligatoire)*
3. Détail matière *(recommandé)*
4. Mise en scène ou pliage *(recommandé)*
5. Couleur fidèle *(recommandé)*
6. Défaut documenté *(obligatoire si seconde main)*
7. Ratio portrait cohérent (ex. 4:5)

Tant que la photo principale n’est pas commerciale, la **publication** (`statut actif`) est bloquée.

## Ce que le parent voit

- **Catalogue / home** : uniquement les produits avec au moins une photo commerciale valide.
- **Fiche produit** : galerie ordonnée ; pas d’achat si aucune photo réelle.

## Rappel légal & confiance

- Ne pas retoucher la couleur de façon trompeuse.
- Ne pas utiliser une photo d’un autre article.
- Les visuels doivent correspondre au vêtement expédié.

---

*Document aligné sur `src/lib/catalog/product-sellability.ts` et la checklist `buildProductPhotoChecklist`.*
