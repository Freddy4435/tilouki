# Suite post-bataille — Tilouki

Voir aussi [ROADMAP.md](./ROADMAP.md) pour l'ordre d'exécution autonome.

Le [plan bataille 15 étapes](./plan-bataille-15-etapes.md) est livré en production.

## Lot A — Exploitation (exploitant, hors code)

| # | Action | Statut |
|---|--------|--------|
| A.1 | `npm run verify:deploy:prod` vert sur Vercel | 🔲 |
| A.2 | Admin → identité légale + pages légales complètes | 🔲 |
| A.3 | Catalogue réel (10+ produits, photos commerciales) | 🔲 |
| A.4 | Supabase Auth : redirect `https://tilouki.vercel.app/auth/callback` | 🔲 |
| A.5 | Plausible : goals `add_to_cart`, `begin_checkout`, `add_capsule_to_cart` | 🔲 |
| A.6 | Commande test Live ≤ 5 € ([GO_LIVE_RECETTE.md](./GO_LIVE_RECETTE.md)) | 🔲 |

## Lot B — Compte & sync (code)

| # | Tâche | Statut |
|---|--------|--------|
| B.1 | Icône « Mon compte » dans le header | ✅ |
| B.2 | Lien compte menu mobile | ✅ |
| B.3 | Sync favoris au toggle si connecté | ✅ |
| B.4 | E2E `battle-plan-features.spec.ts` | ✅ |

## Lot C — Admin opérationnel (Phase 5)

| # | Tâche | Statut |
|---|--------|--------|
| C.1 | UI remboursement admin (Stripe) | ✅ |
| C.2 | Ajustement stock admin | ✅ |
| C.3 | E2E suivi commande + tests refund/stock | ✅ |
| C.4 | Chronopost étiquette auto | 🔲 |
| C.5 | Lighthouse ≥ 90 | 🔲 |

## Commandes QA

```bash
npm run check
npm run e2e:journey
npm run e2e:battle-plan
npm run e2e:tracking
```
