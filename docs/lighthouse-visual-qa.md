# QA visuelle & Lighthouse — Tilouki

Rapport de recette visuelle **mode production local** (`npm run build` + `next start`, port **3002**).

**Date :** 15 juin 2026  
**Commande automatisée :** `node scripts/run-playwright.mjs e2e/visual-qa-retail.spec.ts --project=desktop`

---

## Captures générées

| Page          | Viewport | Fichier                                                                        |
| ------------- | -------- | ------------------------------------------------------------------------------ |
| Accueil       | 1440×900 | [`retail-qa-home-desktop-1440.png`](retail-qa-home-desktop-1440.png)           |
| Accueil       | 390×844  | [`retail-qa-home-mobile-390.png`](retail-qa-home-mobile-390.png)               |
| Catalogue     | 1440×900 | [`retail-qa-catalogue-desktop-1440.png`](retail-qa-catalogue-desktop-1440.png) |
| Catalogue     | 390×844  | [`retail-qa-catalogue-mobile-390.png`](retail-qa-catalogue-mobile-390.png)     |
| Fiche produit | 390×844  | [`retail-qa-product-mobile-390.png`](retail-qa-product-mobile-390.png)         |
| Checkout      | 390×844  | [`retail-qa-checkout-mobile-390.png`](retail-qa-checkout-mobile-390.png)       |

---

## Critères d'acceptation

| Critère                                    | Statut | Notes                                                                                     |
| ------------------------------------------ | ------ | ----------------------------------------------------------------------------------------- |
| Mode production (pas de badge Next.js dev) | ✅     | Vérifié sur toutes les captures + `expectNoNextDevOverlay`                                |
| Texte non coupé                            | ✅     | Aucun débordement visible sur les 6 captures                                              |
| Pas de chevauchement bottom nav            | ✅     | `expectNoBottomNavOverlap` OK (accueil mobile, catalogue mobile, fiche produit, checkout) |
| Contraste lisible                          | ⚠️     | Lisible à l'œil ; Lighthouse signale des badges outline / promo sous le seuil WCAG        |
| Rendu « vraie boutique »                   | ⚠️     | Structure retail crédible ; contenu encore partiellement démo (voir ci-dessous)           |

---

## Lighthouse (mobile, production locale)

**Prérequis :** catalogue seedé (`npm run seed:catalog` ou import go-live), serveur `npm run build && npx next start -p 3002`.

Fichiers JSON : [`lighthouse-home-mobile.json`](lighthouse-home-mobile.json), [`lighthouse-product-mobile.json`](lighthouse-product-mobile.json)

### Éléments LCP identifiés

| Page          | Élément LCP (viewport mobile)                                                       | Optimisations appliquées                                                          |
| ------------- | ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Accueil       | Image `HeroMobileFeatured` (1er produit / hero admin) ou titre `h1` si aucune image | `priority` + `fetchPriority="high"`, `sizes="100vw"`, préchargement Fraunces seul |
| Fiche produit | Image principale galerie (`ProductGalleryMainImage` ou 1ère image galerie)          | Rendu serveur si 1 photo, `sizes` mobile 100vw, `fetchPriority="high"`            |

### Baseline (15 juin 2026, avant optimisations)

| Page                                | Performance | Accessibilité | LCP   | CLS   | TBT    |
| ----------------------------------- | ----------- | ------------- | ----- | ----- | ------ |
| Accueil `/`                         | **83**      | **96**        | 4,2 s | 0,008 | 170 ms |
| Fiche `/produit/short-garcon-promo` | **82**      | **97**        | 4,5 s | 0,008 | 160 ms |

**Cible :** Perf ≥ 90, CLS &lt; 0,05.

### Optimisations performance (juin 2026)

1. **Hero mobile** — bandeau visuel prioritaire (`HeroMobileFeatured`) pour cibler une image LCP au lieu du seul texte.
2. **Fonts** — préchargement uniquement de Fraunces (titres LCP) ; DM Sans en `preload: false`.
3. **Accueil** — pool produits limité en DB (`getActiveProductsForHome`, 96 lignes) ; sections sous la ligne de flottaison en `content-visibility: auto` ; max 2 images `priority` par carrousel.
4. **Fiche produit** — galerie 1 photo rendue côté serveur (`ProductGalleryMainImage`).
5. **Images** — `loading="lazy"` sur miniatures, catégories et looks ; pas de `priority` sur sections différées.

### Pistes si LCP reste &gt; 2,5 s en preview/prod

1. Vérifier le poids des photos Supabase (compression à l'upload).
2. Réduire le JS initial (widgets checkout uniquement sur `/commande`).
3. `await headers()` force le rendu dynamique — TTFB lié à l'hébergement.

### Contraste (Lighthouse `color-contrast`)

Éléments signalés :

- Badges `outline` sur cartes produit (ex. « NOUVEAU », « PETIT PRIX », matière).
- Pastille promo `bg-primary/12 text-primary` (pourcentage de réduction).

**Action recommandée :** assombrir le texte des badges outline ou renforcer le fond ; passer la pastille promo en `text-primary-foreground` sur fond plein.

---

## Accessibilité automatisée (axe / Playwright)

| Suite                                                | Résultat                                                           |
| ---------------------------------------------------- | ------------------------------------------------------------------ |
| `e2e/visual-qa-retail.spec.ts` (axe sur chaque page) | ✅ après correctif `aria-labelledby` sur les selects catalogue     |
| `e2e/accessibility.spec.ts`                          | ✅ checkout (labels, focus) + fiche produit (bouton d'achat nommé) |

**Correctif appliqué pendant la recette :** les `SelectTrigger` du tri et des filtres catégorie/genre n'exposaient pas de nom accessible (`button-name` axe critique). Ajout de `aria-labelledby` / `aria-label` dans `catalogue-sort-select.tsx` et `catalogue-filters.tsx`.

---

## Problèmes visuels / contenu restants

### Bloquant crédibilité boutique (contenu)

1. **Images produit** — Majorité des articles en « Photo à venir » (placeholder bleu/gris). Le catalogue et la home ressemblent encore à un environnement de test tant que le go-live catalogue (`npm run seed:catalog` / import CSV) n'est pas appliqué en prod.
2. **Produit technique** — « Produit Test CSP » visible en tête de catalogue ; à retirer avant mise en ligne (`scripts/cleanup-demo-products.mjs`).
3. **Hero accueil** — Illustration CSS / placeholder si `hero_image_url` admin non renseigné.

### Mineur / polish

4. **Performance mobile** — Score Lighthouse 82–83 : acceptable en dev local, à revalider sur preview Vercel (CDN, compression).
5. **Fiche produit mobile** — Panneau d'achat sticky en bas : OK sur produit vendable ; sur produit non illustré, CTA remplacé par message « Photo à venir » (comportement voulu).
6. **Checkout mobile** — Résumé commande en tête + étapes claires ; article E2E « Article test E2E » dans la capture (panier injecté pour le test, pas visible en parcours client réel).
7. **Migration avis** — La migration `20260615140000_product_reviews.sql` n'était pas appliquée sur la base pointée par `.env.local` ; dégradation gracieuse ajoutée côté code (`isMissingSchemaError`) pour éviter les pages d'erreur. **À faire en prod :** `supabase db push` pour activer les avis réels.

### Validé positivement

- Aucun overlay / badge **Next.js dev**.
- Header, réassurance, footer newsletter, bottom nav mobile cohérents avec une boutique en ligne.
- Catalogue : filtres, tri, pagination, grilles desktop/mobile propres.
- Checkout : stepper, formulaire client, recherche point relais, libellés TTC.

---

## Checklist manuelle complémentaire

### Accueil

- [ ] Hero : photo admin à droite si `hero_image_url` renseigné
- [ ] Bandeau réassurance : Stripe, livraison point relais, retours 14 j, boutique française
- [ ] Cartes produit : élévation au survol (desktop)
- [ ] Images catalogue home : `loading="lazy"` sauf 1ère rangée

### Fiche produit

- [ ] Galerie : swipe mobile, zoom desktop
- [ ] Badge « Dernières pièces » si stock ≤ 2
- [ ] Bouton « Ajouter au panier » + feedback « Ajouté ! »
- [ ] Drawer panier : sous-total visible en bas

### Catalogue

- [ ] Tri reflété dans l'URL (`?tri=…`)
- [ ] Puces filtres actifs + « Tout effacer »
- [ ] Skeleton pendant chargement

### Admin — hero

- [ ] `/admin/parametres` → upload hero → revalidation accueil

---

## Commandes

```bash
# Build + serveur prod + captures + axe
node scripts/run-playwright.mjs e2e/visual-qa-retail.spec.ts --project=desktop

# Accessibilité checkout / produit
node scripts/run-playwright.mjs e2e/accessibility.spec.ts --project=desktop

# Lighthouse mobile (serveur déjà démarré sur 3002)
npx lighthouse@12 http://127.0.0.1:3002/ \
  --only-categories=performance,accessibility \
  --form-factor=mobile --output=json \
  --output-path=docs/lighthouse-home-mobile.json

npm run check   # lint + typecheck + tests unitaires
```
