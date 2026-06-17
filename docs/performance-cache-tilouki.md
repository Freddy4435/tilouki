# Performance, cache et rendu — Tilouki

Document de référence pour l’équilibre **sécurité CSP** / **vitesse** / **SEO** sur la boutique Next.js.

## 1. Impact de `headers()` et du nonce CSP

### Chaîne actuelle

1. **`src/proxy.ts`** → `updateSession()` génère un nonce par requête, construit la CSP (`buildCsp`) et pose :
   - `x-nonce` sur la requête (composants serveur)
   - `Content-Security-Policy` sur la requête **et** la réponse
2. **Next.js** lit `Content-Security-Policy` sur la requête et applique le nonce aux scripts framework.
3. **`getRequestCspNonce()`** (`src/lib/security/request-nonce.ts`) — utilisé pour JSON-LD et le checkout (widget Mondial Relay).

### Ce qui force le rendu dynamique

| Mécanisme                                                     | Effet                                                                                         |
| ------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| CSP à **nonce** (doc Next.js)                                 | Le HTML doit être généré **par requête** : pas de page statique build-time avec nonce valide. |
| `getRequestCspNonce()` / `JsonLdScript` dans le layout public | Opt-in dynamique pour les routes qui rendent le JSON-LD (`SiteJsonLd`).                       |
| `export const dynamic = "force-dynamic"`                      | `/commande`, `/suivi-commande`, admin, API.                                                   |

### Ce qui a été retiré du root layout

`await headers()` dans `src/app/layout.tsx` **n’était pas nécessaire** : le proxy fournit déjà la CSP à Next.js. Le retirer évite un double signal dynamique sans affaiblir la sécurité (build identique : routes en `ƒ`).

## 2. Stratégie cache (sans sacrifier la CSP)

Avec nonce, **le HTML ne peut pas être mis en cache CDN** tel quel (nonce unique). On optimise donc :

### Data Cache — `unstable_cache` + tags

- Fichier central : `src/lib/supabase/cache.ts` (`CACHE_TAGS`, `REVALIDATE`, `PAGE_REVALIDATE`)
- Requêtes catalogue, shop, légal, avis : cache 5–60 min selon segment
- Invalidation admin : `revalidateTag(...)` sur les tags produits / catégories / shop

### `export const revalidate` sur les pages

Aligné sur `PAGE_REVALIDATE` — limite la fraîcheur des **données** même si le symbole build reste `ƒ` :

| Segment      | Secondes | Exemples                                                                 |
| ------------ | -------- | ------------------------------------------------------------------------ |
| Catalogue    | 300      | `/`, `/catalogue`, `/categorie/*`, `/produit/*`, `/panier`, `/rituels/*` |
| Légal / blog | 3600     | `/cgv`, `/mentions-legales`, `/blog/*`                                   |
| Dynamique    | —        | `/commande`, `/suivi-commande`, admin                                    |

### Pages volontairement dynamiques

- **Checkout** : nonce + widget tiers Mondial Relay / Stripe
- **Suivi commande** : token client
- **Admin** : session auth

## 3. Sécurité — invariants

- CSP nonce + `strict-dynamic` : `src/lib/security/headers.ts`
- Tests de non-régression : `src/lib/security/headers.test.ts`
- Ne **pas** réintroduire `unsafe-eval` en production
- Ne déplacer la CSP que via le proxy (pas de CSP permissive dans `next.config` pour les pages HTML)

## 4. Images Next.js (LCP, sizes, lazy)

Constantes partagées : **`src/lib/media/image-sizes.ts`**

| Usage                            | Constante                                | Notes                                            |
| -------------------------------- | ---------------------------------------- | ------------------------------------------------ |
| Hero accueil / rituel            | `IMAGE_SIZES.hero`                       | `priority` + `fetchPriority="high"`              |
| Photo principale produit         | `IMAGE_SIZES.productMain`                | LCP fiche produit                                |
| Cartes catalogue                 | `IMAGE_SIZES.productCard`                | `priority` sur les 2–4 premières cartes visibles |
| Vignettes galerie                | `productThumbColumn` / `productThumbRow` | `loading="lazy"`                                 |
| Sous la ligne de flottaison home | `priorityLimit={0}`                      | Pas de `priority` inutile                        |

Config globale : `next.config.ts` — formats **AVIF/WebP**, `minimumCacheTTL: 86400` pour `/_next/image`.

## 5. SEO

- Métadonnées : `buildPageMetadata` + `metadataBase` dans le root layout
- JSON-LD : `JsonLdScript` (organisation, produit, fil d’Ariane) avec nonce
- `sitemap.xml` : `revalidate = 3600`
- Pages panier / commande : `robots: { index: false }`

## 6. Piste future (hors scope actuel)

Pour retrouver du **HTML statique** avec CSP stricte :

- **SRI / hash CSP** (`experimental.sri` Next.js) — hashes au build, pas de nonce par requête
- Ou **CSP mixte** : nonce uniquement sur `/commande`, hash/static ailleurs (complexité opérationnelle)

Tant que le widget Mondial Relay exige des scripts dynamiques au checkout, la CSP à nonce sur tout le site reste le compromis retenu.

## 7. Vérifications locales

```bash
npm run typecheck
npm run test
npm run build
npm run e2e:journey
```

Après changement cache/CSP : contrôler la table `Route (app)` du build (`ƒ` attendu pour le storefront) et l’absence d’erreurs CSP en console sur `/` et `/commande`.
