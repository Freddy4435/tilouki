# Plan d'import — catalogue Tilouki (20 produits)

Guide pour transformer un catalogue vide en boutique vendable avec catégories, tailles, âges, prix, stock, poids et images.

## Vue d'ensemble

| Élément           | Détail                                                            |
| ----------------- | ----------------------------------------------------------------- |
| Produits          | 20 références enfants (bébé, fille, garçon, pyjamas, accessoires) |
| Variantes         | 41 lignes (2 à 3 tailles/âges par produit)                        |
| SKU               | Préfixe `TK-` (catalogue réel) — distinct de `DEV-` (démo)        |
| Images            | SVG locaux `/products/*.svg` (remplaçables par vos photos)        |
| Statut après seed | `active` (visibles immédiatement sur le site)                     |

## Méthode 1 — Seed SQL (recommandé en local)

```bash
npm run generate:catalog   # régénère SQL, CSV et visuels depuis data/catalog-products.json
supabase db reset          # structure + catégories + catalogue (config.toml)
# ou sur projet lié :
npm run seed:catalog
```

## Méthode 2 — Import CSV admin

1. Admin → **Import produits**
2. Télécharger le modèle complet : `/import-catalogue-tilouki.csv` (20 produits, 41 variantes)
3. Vérifier l'aperçu → **Importer**
4. Passer les produits en **Actif** si importés en brouillon (le seed SQL les crée déjà actifs)

### Colonnes CSV

En-têtes anglais **ou** français (alias acceptés) :

| Français    | Anglais        | Obligatoire |
| ----------- | -------------- | :---------: |
| reference   | reference      |      ✓      |
| categorie   | category       |      ✓      |
| nom         | name           |      ✓      |
| description | description    |             |
| composition | material       |             |
| saison      | season         |             |
| origine     | made_in        |             |
| genre       | gender         |      ✓      |
| couleur     | color          |             |
| taille      | size_label     |             |
| age         | age_label      |             |
| prix        | price_eur      |      ✓      |
| prix_achat  | cost_eur       |             |
| stock       | stock_quantity |      ✓      |
| poids       | weight_grams   |             |
| image       | image_url      |             |

**Image** : URL `https://…` ou chemin local `/products/nom-fichier.svg`.

**Règle** : une ligne = une variante. Même `reference` = même produit.

## Répartition des 20 produits

| Catégorie       | Produits                                                                   | Exemples                     |
| --------------- | -------------------------------------------------------------------------- | ---------------------------- |
| Bébé (3)        | Body coton bio, Gigoteuse nuages, Combinaison polaire                      | `BODY-NAT-BIO`, `GIG-NUAGES` |
| Fille (7)       | Robe liberty, Robe smock, Débardeur, Jupe tutu, Legging, Sweat, Blouse lin | `ROB-LIBERTY`, `JUP-TUTU`    |
| Garçon (4)      | T-shirt dinosaure, Jogger, Short surf, Polo marin                          | `TSH-DINO-G`, `POLO-MARIN-G` |
| Pyjamas (3)     | Étoiles, Combi hiver, Fleurs fille                                         | `PYJ-ETOILES`, `PYJ-COMBI-H` |
| Accessoires (3) | Chaussettes x3, Bonnet maille, Cache-cou zippé                             | `CHAUS-LOT3`, `CACHE-COU-Z`  |

## Poids et livraison

Chaque variante a un `weight_grams` renseigné (45 g à 340 g) pour le calcul des frais de port Mondial Relay / Chronopost.

Produits sans poids → alerte admin « compléter les fiches ».

## Images

1. **Placeholder** : `npm run generate:catalog` crée des SVG dans `public/products/`
2. **Production** : remplacez par vos photos (JPEG/WebP) et mettez à jour les URLs dans le CSV ou l'admin

## Produits démo (optionnel, DEV uniquement)

```bash
npm run seed:dev   # 12 produits DEV- — jamais en production
```

Les slugs démo sont bloqués au checkout en production. Désactivez-les via le dashboard admin ou `node scripts/cleanup-demo-products.mjs --apply`.

## Vérification parcours client

| Page              | Vérification                                  |
| ----------------- | --------------------------------------------- |
| `/catalogue`      | ≥ 20 produits actifs, filtres catégorie/genre |
| `/produit/[slug]` | Prix, tailles, bouton « Ajouter au panier »   |
| `/panier`         | Lignes, sous-total, frais de port estimés     |
| `/commande`       | Récapitulatif articles + livraison + total    |

Tests automatisés : `npm run e2e` (nécessite `supabase db reset` avec le catalogue).

## Personnaliser le catalogue

1. Éditez `data/catalog-products.json`
2. `npm run generate:catalog`
3. `supabase db reset` ou `npm run seed:catalog`
