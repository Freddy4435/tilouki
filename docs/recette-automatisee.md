# Recette automatisée (E2E) — Tilouki

Parcours d'achat couvert par **Playwright** avant chaque mise en ligne.

## Prérequis

1. **Node.js 20+** et `npm install`
2. **Navigateur Chromium** : `npx playwright install chromium`
3. **Variables** : `.env.local` avec Supabase (comme pour `npm run dev`)
4. **Données** : au moins un produit actif en stock

```bash
npm run seed:dev   # dev uniquement — charge produits de démo
```

5. **Mode relais mock** : activé automatiquement (`SHIPPING_DEV_MOCK=true`) par la config Playwright

---

## Commandes

| Commande | Description |
|----------|-------------|
| `npm run qa` | **Recette complète** : typecheck → lint → tests unitaires → build → E2E (serveur prod local) |
| `npm run e2e` | E2E seuls (serveur **production** local sur le port 3002 — build requis) |
| `npm run e2e:ui` | Mode interactif Playwright |
| `npm run e2e:report` | Ouvrir le rapport HTML après un run |

### Avant chaque mise en ligne

```bash
npm run qa
```

Si tout est vert, vous pouvez déployer. En cas d'échec, consultez le rapport :

```bash
npm run e2e:report
```

---

## Parcours couverts

### Pages vitrine (`e2e/browse-pages.spec.ts`)

- Accueil — navigation, footer légal
- Catalogue — liste et lien produit
- Fiche produit — prix, ajout panier

### Parcours achat (`e2e/purchase-flow.spec.ts`)

- Panier → checkout
- Formulaire client (étape 1)
- Recherche point relais **mock** + sélection (étape 2)
- **Blocage paiement sans CGV** (étape 3)
- Création session checkout **mockée** → redirection succès

### Accessibilité (`e2e/accessibility.spec.ts`)

- Labels des champs formulaire checkout
- Boutons avec nom accessible
- Focus clavier visible
- Contraste minimal sur titres
- Scan axe (violations critical / serious)

### Viewports

Chaque test s'exécute sur :

- **Desktop** — 1440×900
- **Mobile** — 390×844

---

## Mocks E2E

Pour reproductibilité sans Stripe ni stock réel :

| Route | Comportement |
|-------|----------------|
| `POST /api/cart/validate` | Stock toujours disponible |
| `GET /api/shipping/relay-points` | Points fictifs `[E2E]…` (sélectionnables en build production) |
| `POST /api/checkout/create-session` | Redirection vers `/commande/succes?e2e=1` |

---

## CI / dépôt

Ajoutez à votre pipeline :

```bash
npx playwright install --with-deps chromium
npm run qa
```

Variables d'environnement recommandées en CI : mêmes clés Supabase qu'en preview, avec catalogue seedé.

---

## Dépannage

| Problème | Action |
|----------|--------|
| Tests skippés « Aucun produit actif » | `npm run seed:dev` |
| Port 3002 occupé | `PLAYWRIGHT_PORT=3003 npm run e2e` |
| Hydratation panier absente | Ne pas réutiliser un `next dev` cassé — lancer `npm run build` puis `npm run e2e` |
| Bandeau cookies sur mobile | Les helpers ferment le bandeau automatiquement avant les clics |
| Bandeau cookies bloque un clic | Les helpers cliquent « Refuser les cookies optionnels » automatiquement |
| Échec build dans `qa` | Corriger `npm run check` d'abord |

Voir aussi [checklist-recette.md](./checklist-recette.md) pour la recette manuelle complémentaire.
