# Plan de finition — Tilouki

Objectif : boutique **belle, cohérente et exploitable en production** sans dette visible côté client.

## Phase 0 — Stabilisation (fait / en cours)

| #   | Tâche                                       | Statut |
| --- | ------------------------------------------- | ------ |
| 0.1 | Prettier + `format:check` dans CI           | ✅     |
| 0.2 | Proxy Next 16 (`src/proxy.ts`)              | ✅     |
| 0.3 | Polices locales CI                          | ✅     |
| 0.4 | Migrations Supabase alignées (18/18)        | ✅     |
| 0.5 | Corriger doublon migration `20260611140000` | ✅     |

## Phase 1 — UX critique storefront (P0)

| #   | Tâche                                        | Fichiers |
| --- | -------------------------------------------- | -------- |
| 1.1 | Drawer panier unique (pas de double montage) | ✅       |
| 1.2 | Checkout sans flash blanc (skeleton)         | ✅       |
| 1.3 | Skip link « Aller au contenu »               | ✅       |
| 1.4 | A11y formulaires (`aria-describedby`)        | ✅       |
| 1.5 | A11y variantes taille (`radiogroup`)         | ✅       |
| 1.6 | Badge panier annoncé (SR)                    | ✅       |
| 1.7 | `aria-current` bottom nav mobile             | ✅       |

## Phase 2 — Polish visuel (P1)

| #   | Tâche                                          | Fichiers |
| --- | ---------------------------------------------- | -------- |
| 2.1 | Section livraison sur l'accueil                | ✅       |
| 2.2 | Hero fallback sans images                      | ✅       |
| 2.3 | Libellés FR (Shop → Découvrir, Close → Fermer) | ✅       |
| 2.4 | Descriptions produit sans « à venir »          | ✅       |
| 2.5 | Filtres sur pages catégorie                    | ✅       |
| 2.6 | Recherche synchronisée URL catalogue           | ✅       |
| 2.7 | Pagination désactivée non focusable            | ✅       |
| 2.8 | `loading.tsx` accueil, produit, panier         | ✅       |
| 2.9 | `prefers-reduced-motion`                       | ✅       |

## Phase 3 — Fiabilité métier (P0 backend)

| #   | Tâche                                                 | Fichiers |
| --- | ----------------------------------------------------- | -------- |
| 3.1 | Gate checkout : pages légales DB sans placeholder     | ✅       |
| 3.2 | Alerte admin si provider e-mail absent (prod)         | ✅       |
| 3.3 | Remboursement partiel : notification (pas de restock) | ✅       |

## Phase 4 — Hors code (exploitant)

- Domaine `tilouki.fr` + variables Vercel prod
- Stripe Live + webhook 4 événements
- Mondial Relay prod, Resend SPF/DKIM
- Catalogue réel (10+ produits, images)
- Recette Live `guide-test-production.md`

## Phase 5 — Post-lancement (P2)

- Chronopost étiquette auto (API shippingV6)
- UI remboursement admin
- Ajustement stock admin
- E2E admin + suivi commande
- Lighthouse ≥ 90

## Critères « site fini »

- [ ] `npm run check` vert
- [ ] `npm run qa` vert
- [ ] Aucun placeholder visible storefront (produits, légal)
- [ ] Parcours achat fluide desktop + mobile
- [ ] Admin opérationnel sans aller dans Stripe/Supabase pour le quotidien
- [ ] Checklist `PRODUCTION_CHECKLIST.md` cochée côté exploitant
