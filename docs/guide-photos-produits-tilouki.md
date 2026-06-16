# Guide photos produits Tilouki

Ce guide décrit **concrètement** comment photographier et publier les vêtements enfants vendus sur Tilouki. Les photos éditoriales (`/editorial/`, `/images/tilouki/`) et les banques d’images (Pexels, Unsplash, Pixabay) sont réservées au blog et à l’accueil — **jamais** en fiche produit.

## En résumé

| État admin | Ce qu’il faut | Ce que voit le parent |
| ---------- | ------------- | --------------------- |
| **Invisible en boutique** | Pas de vraie photo, SVG démo, pack Tilouki ou description manquante | Rien dans le catalogue ni sur l’accueil |
| **Visible catalogue** | **1** photo réelle + description (≥ 8 caractères) | Carte produit + fiche achetable |
| **Prêt à vendre** | **3** photos commerciales | Fiche complète qui rassure avant achat |

## Workflow admin (étape par étape)

1. Ouvrir **Admin → Produits → [votre fiche] → section Photos**.
2. Lire le bandeau **« Pourquoi ce produit n’apparaît pas en boutique »** s’il s’affiche — chaque ligne indique une action précise.
3. Cliquer **Ajouter des photos produit** et sélectionner vos fichiers (JPEG, PNG ou WebP).
4. Pour chaque photo, remplir **Description photo** avec une phrase claire (voir exemples ci-dessous).
5. Glisser-déposer pour ordonner : **la 1ʳᵉ photo = image principale** catalogue.
6. Vérifier la checklist **Photos prêtes à vendre** :
   - vert = critère rempli ;
   - orange = à compléter.
7. Objectif : badge **Prêt à vendre** (3 photos) avant de mettre en avant le produit.

> **Interdit** : copier-coller une URL du pack Tilouki, un SVG `/products/*.svg`, une image Pexels/Unsplash ou un placeholder « Photo à venir ».

## Setup photo rapide (smartphone)

- **Lieu** : près d’une fenêtre, lumière du jour, pas de flash direct.
- **Fond** : drap blanc cassé, lin beige ou plancher clair — éviter le fond encombré.
- **Cadrage** : vêtement entier visible, marges régulières, téléphone en **portrait**.
- **Netteté** : stabiliser le téléphone (ou trépied léger), toucher l’écran sur le tissu pour la mise au point.
- **Couleur** : pas de filtre Instagram ; photographier la couleur réelle du vêtement.

### Dimensions recommandées

- **1200 × 1500 px** (ratio 4:5) — homogène sur catalogue et fiche produit.
- Poids max géré par l’admin : voir le message sous le bouton d’upload.

## Les 3 photos recommandées

### 1. Face / produit entier _(obligatoire)_

- Vêtement **entier** : à plat ou sur cintre neutre.
- C’est la **première photo** de la fiche.

**Exemples de description :**

- `Body bébé face avant, coton écru, col rond`
- `Robe fille 4 ans, imprimé liberty, vue de face`

### 2. Détail matière ou finition _(recommandé)_

- Gros plan tissu, maille, couture ou fermeture.

**Exemples :**

- `Détail matière — maille coton bio douce`
- `Couture renforcée au niveau de l'épaule`

### 3. Vue portée, cintre ou pliage _(recommandé)_

- Mannequin enfant, cintre dans un dressing lumineux, ou pliage soigné.
- Pas d’enfant reconnaissable si vous n’avez pas l’autorisation parentale.

**Exemples :**

- `Pyjama plié sur cintre, motif étoiles`
- `Combinaison portée sur mannequin 12 mois`

## Seconde main

Si l’article est d’occasion ou présente un défaut :

1. Indiquez « seconde main » dans la description courte du produit.
2. Photographiez **chaque défaut visible** (tache, usure, fil tiré).
3. Décrivez-le dans l’alt avec les mots **défaut**, **trace**, **usure**, etc.

**Exemple :** `Petite tache sur la manche gauche — défaut visible seconde main`

La checklist admin marque alors **Défaut documenté** comme obligatoire.

## Ce qui bloque la boutique (messages admin)

| Situation | Message typique | Action |
| --------- | --------------- | ------ |
| SVG catalogue `/products/*.svg` | Visuel démo — pas vendable | Uploader un JPEG/PNG/WebP réel |
| Pack Tilouki `/images/tilouki/...` | Réservé éditorial | Uploader votre propre photo |
| Placeholder / « Photo à venir » | Pas une vraie photo | Remplacer + décrire la vue |
| Alt trop court (< 8 car.) | Description manquante | Compléter la description photo |
| Produit test (`produit-test-csp`, etc.) | Réservé démo | Utiliser un autre slug en prod |

## Ce que le parent voit

- **Catalogue / accueil** : uniquement les produits avec au moins une photo commerciale valide.
- **Fiche produit** : galerie des photos réelles ; pas d’achat si aucune photo valide.
- **Carte produit** : masquée tant qu’il n’y a pas de photo commerciale.

## Rappel confiance

- Ne pas retoucher la couleur de façon trompeuse.
- Ne pas utiliser une photo d’un autre article.
- Les visuels doivent correspondre au vêtement expédié.

---

_Aligné sur `src/lib/catalog/product-sellability.ts`, la checklist `buildProductPhotoChecklist` et l’admin **Photos prêtes à vendre**._
