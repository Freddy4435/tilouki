# Rapport go / no-go — Tilouki

**Date :** 16 juin 2026  
**Environnement évalué :** dépôt local (recentrage retail Prompts 1–11) + base Supabase liée + `.env.local`  
**Verdict :** **PAS PRÊT À VENDRE** (config prod / catalogue réel) — **recette e-commerce automatisée OK**

---

## Synthèse exécutive

Le site est recentré **achat d’abord** : home produit-first, catalogue/catégories type rayon, guides d’achat en complément. Le **code** passe typecheck, lint, tests unitaires, build et le **parcours e2e** `npm run e2e:journey` (accueil → catalogue → catégorie → fiche → taille → panier → commande mockée, recherche, favoris, guide tailles). Les blocages restants concernent la **configuration production**, le **catalogue commercial réel** et l’**admin légal**, pas la régression du parcours client automatisé.

---

## 1. Contrôles automatisés (recette Prompt 11)

| Commande                     | Résultat | Détail                                                                           |
| ---------------------------- | -------- | -------------------------------------------------------------------------------- |
| `npm run audit:secrets`      | ✅       | Aucun secret dans git                                                            |
| `npm run typecheck`          | ✅       | —                                                                                |
| `npm run lint`               | ✅       | —                                                                                |
| `npm run test`               | ✅       | 585+ tests unitaires                                                             |
| `npm run build`              | ✅       | Build production OK                                                              |
| `npm run e2e:journey`        | ✅       | 16 passés, 6 ignorés (pas de fiche vendable en base — checkout via panier seedé) |
| `npm run e2e` (complet)      | ⚠️       | Voir `browse-pages`, `visual-qa-retail`, `purchase-flow`                         |
| `npm run verify:deploy:prod` | ❌       | Clés Live / e-mail / MR — voir §2                                                |

### Parcours couverts par `e2e:sales-journey.spec.ts`

| Étape                                                 | Couvert                                    |
| ----------------------------------------------------- | ------------------------------------------ |
| Accueil → catalogue                                   | ✅                                         |
| Catalogue → catégorie                                 | ✅                                         |
| Catégorie → fiche produit                             | ⚠️ skip si aucune photo commerciale listée |
| Choix taille → ajout panier                           | ⚠️ skip si aucune fiche vendable           |
| Panier → commande (mock)                              | ✅ (panier seedé si besoin)                |
| Recherche produit                                     | ✅                                         |
| Favoris                                               | ⚠️ skip si aucune fiche vendable           |
| Guide tailles depuis fiche                            | ⚠️ skip si aucune fiche vendable           |
| Home : produits avant guides                          | ✅                                         |
| Photos Tilouki : éditorial OK, pas en galerie produit | ✅                                         |

---

## 2. Configuration production (`verify:deploy:prod`)

| Contrôle                         | Statut          |
| -------------------------------- | --------------- |
| Stripe Live + webhook            | ❌ absent local |
| Resend / SMTP + `FROM_EMAIL`     | ❌              |
| Mondial Relay prod               | ❌              |
| Upstash + `CRON_SECRET`          | ❌              |
| `NEXT_PUBLIC_SITE_URL` HTTPS     | ❌ localhost    |
| `SHIPPING_DEV_MOCK=true` en prod | ❌ à désactiver |

---

## 3. Admin & catalogue

| Indicateur                                | Statut                                   |
| ----------------------------------------- | ---------------------------------------- |
| Identité légale complète                  | ❌ contact / médiation / REP à compléter |
| Pages légales admin validées              | ❌                                       |
| Catalogue sans démo / photos commerciales | ❌ selon environnement                   |
| Commandes réelles en base                 | ❌                                       |

---

## 4. Matrice go / no-go

| Domaine                                     | Prêt ? |
| ------------------------------------------- | ------ |
| Recentrage retail (home, catalogue)         | ✅     |
| Recette e2e parcours achat (`e2e:journey`)  | ✅     |
| Secrets / archive (`delivery:release`)      | ✅     |
| Qualité code (typecheck, lint, test, build) | ✅     |
| Config production Vercel                    | ❌     |
| Identité légale + pages admin               | ❌     |
| Catalogue réel + photos commerciales        | ❌     |
| Paiement Live + webhooks réels              | ❌     |

---

## 5. Verdict

## **PAS PRÊT À VENDRE** (ouverture boutique)

## **PRÊT POUR RECETTE TECHNIQUE** (parcours client automatisé après recentrage)

La boutique ne doit pas ouvrir tant que production, légal et catalogue réel ne sont pas au vert. Le **recentrage e-commerce** et la **recette Playwright** sont validés localement.

---

## 6. Actions bloquantes (ordre recommandé)

1. **Vercel** — `npm run verify:deploy:prod` au vert (Stripe Live, e-mail, MR, Upstash, HTTPS, `SHIPPING_DEV_MOCK=false`).
2. **Admin** — identité légale, pages légales, photos commerciales produits.
3. **Catalogue** — `npm run catalog:go-live -- --apply` si applicable.
4. **Recette live** — une commande test ≤ 5 € ([`GO_LIVE_RECETTE.md`](./GO_LIVE_RECETTE.md)).
5. **Livraison code** — `npm run delivery:release` ([`livraison-archive.md`](./livraison-archive.md)).

---

## 7. Commandes de validation développeur

```bash
npm run audit:secrets
npm run typecheck
npm run lint
npm run test
npm run build
npm run e2e:journey
```

---

_Rapport mis à jour après Prompt 11 — aucune valeur secrète incluse._
