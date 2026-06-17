# Roadmap Tilouki — exécution autonome

Document maître : ordre d'exécution sans validation intermédiaire. Les statuts sont mis à jour à chaque livraison.

## Vue d'ensemble

| Phase | Document | Objectif |
|-------|----------|----------|
| ✅ Bataille | [plan-bataille-15-etapes.md](./plan-bataille-15-etapes.md) | Conversion & signature Dressing Intelligent |
| 🔄 Suite | [plan-suite-post-bataille.md](./plan-suite-post-bataille.md) | Post-bataille + go-live |
| 🔄 Finition | [PLAN-FINITION.md](./PLAN-FINITION.md) | UX, fiabilité, polish |
| 🔲 Go-live | [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md) | Exploitant — variables & recette Live |

## Ordre d'exécution agent (code)

1. **Lot B** — Compte header, sync favoris, E2E bataille ✅
2. **Lot C.1** — UI remboursement admin (Stripe → webhook) ✅
3. **Lot C.2** — Ajustement stock admin (inventory_movements) ✅
4. **Lot C.3** — E2E suivi commande + tests unitaires admin ✅
5. **Lot C.4** — Chronopost étiquette auto (API shippingV6) 🔲
6. **Lot C.5** — Lighthouse ≥ 90 (perf budget) 🔲

## Ordre exploitant (hors repo)

1. `npm run verify:deploy:prod` vert sur Vercel
2. Admin → identité légale + pages légales
3. Catalogue réel (`catalog:go-live` si applicable)
4. Supabase Auth redirect + Plausible goals
5. Commande test Live ≤ 5 € → [GO_LIVE_RECETTE.md](./GO_LIVE_RECETTE.md)

## QA obligatoire après chaque lot

```bash
npm run typecheck && npm run lint && npm run test && npm run build
npm run e2e:battle-plan   # storefront bataille
npm run e2e:journey       # parcours achat
```

Puis commit + push `main` → déploiement Vercel automatique.

## Règles

- Migrations : nouveau fichier horodaté, jamais modifier une migration appliquée.
- Pas de commit de secrets ; `build-err.txt` / `build-out.txt` ignorés.
- Répondre en français ; boutique = vente, pas blog.
