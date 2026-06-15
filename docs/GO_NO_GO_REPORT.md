# Rapport go / no-go — Tilouki

**Date :** 15 juin 2026  
**Environnement évalué :** dépôt local + base Supabase projet **Tilouki** (prod) + `.env.local`  
**Verdict :** **PAS PRÊT À VENDRE**

---

## Synthèse exécutive

Le **code** compile, les tests unitaires passent et la majorité des e2e automatisés est verte. En revanche, la **configuration production**, le **catalogue en base** et la **conformité légale admin** ne satisfont pas les critères d’ouverture boutique. Aucune commande réelle n’existe en base ; le parcours paiement live (webhook, e-mail, étiquette, remboursement) n’a pas pu être validé de bout en bout.

---

## 1. Contrôles automatisés

| Commande                     | Résultat | Détail                                         |
| ---------------------------- | -------- | ---------------------------------------------- |
| `npm run audit:secrets`      | ✅       | 431 fichiers scannés, aucun secret dans git    |
| `npm run verify:archive`     | ✅       | Aucun chemin sensible versionné                |
| `npm run typecheck`          | ✅       | —                                              |
| `npm run lint`               | ✅       | 1 avertissement React Compiler (checkout-flow) |
| `npm run format:check`       | ❌       | 22 fichiers non formatés Prettier              |
| `npm run test`               | ✅       | 490 tests passés, 1 ignoré                     |
| `npm run build`              | ✅       | Build production OK                            |
| `npm run e2e`                | ❌       | **28 passés / 10 échoués** (voir §4)           |
| `npm run verify:deploy:prod` | ❌       | **14 points bloquants** (voir §2)              |

---

## 2. Configuration production (`verify:deploy:prod`)

État sur l’environnement local (`.env.local`) — reflète l’écart avant encaissement réel :

| Contrôle                                                | Statut                        |
| ------------------------------------------------------- | ----------------------------- |
| Clés Stripe **Live** (`sk_live_` / `pk_live_`)          | ❌ absentes                   |
| Secret webhook Stripe Live                              | ❌ absent                     |
| Fournisseur e-mail (Resend ou SMTP)                     | ❌ non configuré              |
| `FROM_EMAIL` / `ADMIN_EMAIL`                            | ❌ absents                    |
| Mondial Relay (enseigne + clé privée + brand ID public) | ❌ absents                    |
| Upstash (rate limiting prod)                            | ❌ absent                     |
| `CRON_SECRET`                                           | ❌ absent                     |
| `NEXT_PUBLIC_SITE_URL` en HTTPS                         | ❌ (localhost HTTP)           |
| `SHIPPING_DEV_MOCK=true`                                | ❌ **interdit en production** |
| Routes webhook Stripe + événements requis               | ✅ code présent               |
| Cron expiration commandes                               | ✅ déclaré                    |

**Points OK côté code :** handlers `checkout.session.completed`, `charge.refunded`, etc. ; route `/api/webhooks/stripe`.

---

## 3. Admin & données (Supabase Tilouki)

### Identité légale (SIRET)

| Champ                               | Statut             |
| ----------------------------------- | ------------------ |
| Nom légal, statut, SIRET, adresse   | ✅ renseignés      |
| E-mail de contact boutique          | ❌ vide            |
| Téléphone                           | ❌ vide            |
| Médiateur consommation (nom + URL)  | ❌ vide            |
| Identifiant REP emballages          | ❌ vide            |
| Hébergeur (Vercel)                  | ✅ renseigné       |
| Politiques retours / échanges / TVA | ✅ textes présents |

→ **Identité légale incomplète** pour publication et checkout conforme.

### Pages légales

- Table `legal_pages` : une seule entrée (`formulaire-retractation`), contenu **vide**.
- Les autres pages s’appuient sur les modèles par défaut — **non validées** comme contenu définitif admin.
- Checklist admin `production-readiness` : **pages légales = bloquant**.

### Catalogue produits

| Indicateur                            | Valeur                                                                           |
| ------------------------------------- | -------------------------------------------------------------------------------- |
| Produits actifs                       | 13                                                                               |
| Produits **démo** actifs (slugs seed) | **12**                                                                           |
| Produit technique actif               | `produit-test-csp` (0 image)                                                     |
| Produits réels hors démo              | **1** (test CSP uniquement)                                                      |
| Images actives                        | SVG `/demo-products/*.svg`, alt « visuel démo » — **pas de photos commerciales** |
| Commandes en base                     | **0**                                                                            |

→ **Catalogue non prêt à la vente** : `npm run catalog:go-live -- --apply` non exécuté ; démos encore en ligne.

### Livraison

| Indicateur                           | Statut                       |
| ------------------------------------ | ---------------------------- |
| Barèmes Mondial Relay actifs         | ✅ 5 tranches                |
| Chronopost                           | inactif (optionnel)          |
| API Mondial Relay prod (env)         | ❌ non configurée localement |
| Mock livraison (`SHIPPING_DEV_MOCK`) | ❌ activé en local           |

### Stripe live & e-mails transactionnels

| Indicateur                            | Statut             |
| ------------------------------------- | ------------------ |
| Stripe Live configuré                 | ❌                 |
| E-mails transactionnels (Resend/SMTP) | ❌                 |
| Commandes / webhooks traités en prod  | ❌ aucune commande |

### Migrations

- Migration `20260615140000_product_reviews` **non appliquée** sur le projet distant (dernière migration distante : `20260611180000`).

---

## 4. Parcours achat (automatisé)

### Ce qui passe (e2e, prod local mocké)

- Accueil, navigation légale
- Catalogue (affichage)
- QA visuelle retail (6 captures)
- Accessibilité checkout + fiche produit
- Suivi commande (formulaire, tokens invalides/inconnus)
- Checkout mobile avec panier injecté + relais **mock** + session Stripe **mockée**

### Ce qui échoue (10 tests)

Échecs concentrés sur **ajout panier** quand le **premier produit du catalogue** est non vendable (`produit-test-csp` ou fiche sans CTA achat) :

- `browse-pages` : fiche produit, panier/checkout
- `purchase-flow` : parcours complet mocké
- `sales-journey` : étape 3+ (desktop + mobile)

**Cause racine :** ordre catalogue + produits démo / test en tête, pas une régression checkout isolée.

### Parcours non exécuté (prérequis prod manquants)

| Étape                              | Statut     | Commentaire                                                                 |
| ---------------------------------- | ---------- | --------------------------------------------------------------------------- |
| Paiement Stripe **Live** test      | ⏸ non fait | Clés Live absentes                                                          |
| Webhook Stripe réel                | ⏸ non fait | Endpoint + secret Live requis                                               |
| E-mail confirmation commande       | ⏸ non fait | Resend/SMTP + `FROM_EMAIL`                                                  |
| Suivi commande post-achat réel     | ⏸ non fait | Aucune commande payée en base                                               |
| Génération étiquette Mondial Relay | ⏸ non fait | Clés API MR + commande payée                                                |
| Remboursement / annulation         | ⏸ non fait | Couvert par tests unitaires webhook `charge.refunded` ; pas de recette live |

**Couverture code (hors recette live) :** tests unitaires sur webhooks Stripe, e-mails (rendu), transitions commande `refunded`, panel admin expédition.

---

## 5. Matrice go / no-go

| Domaine                                                      | Prêt ? |
| ------------------------------------------------------------ | ------ |
| Secrets / archive git                                        | ✅     |
| Qualité code (typecheck, build, tests unitaires)             | ✅     |
| Formatage Prettier (CI `check`)                              | ❌     |
| Config production Vercel                                     | ❌     |
| Identité légale complète (SIRET + contact + médiation + REP) | ❌     |
| Pages légales validées admin                                 | ❌     |
| Catalogue réel sans démo                                     | ❌     |
| Photos commerciales produits                                 | ❌     |
| Livraison réelle (sans mock)                                 | ❌     |
| Stripe Live + webhooks                                       | ❌     |
| E-mails transactionnels                                      | ❌     |
| Parcours achat validé de bout en bout                        | ❌     |
| e2e complets (parcours panier → paiement mock)               | ❌     |

---

## 6. Verdict

## **PAS PRÊT À VENDRE**

La boutique **ne doit pas ouvrir** tant que les points bloquants ci-dessous ne sont pas levés.

---

## 7. Actions bloquantes (ordre recommandé)

1. **Vercel production** — exécuter `npm run verify:deploy:prod` jusqu’au vert : Stripe Live, webhook, Resend/SMTP, Mondial Relay, Upstash, `CRON_SECRET`, HTTPS, `SHIPPING_DEV_MOCK=false`.
2. **Admin → Paramètres** — compléter e-mail, téléphone, médiateur, REP.
3. **Admin → Pages légales** — personnaliser et publier les 6 pages (pas seulement les modèles).
4. **Catalogue** — `npm run catalog:go-live -- --apply` ; retirer `produit-test-csp` ; importer photos commerciales réelles.
5. **Migrations** — `supabase db push` (avis produits + parité migrations).
6. **Recette live** — une commande test ≤ 5 € : paiement Live → webhook → e-mail → admin étiquette → remboursement test ([`docs/GO_LIVE_RECETTE.md`](./GO_LIVE_RECETTE.md), [`docs/EMAIL_TEST_CHECKLIST.md`](./EMAIL_TEST_CHECKLIST.md)).
7. **CI** — `npm run format` sur les 22 fichiers ; corriger les e2e catalogue (produit vendable en premier ou helper `openSellableProduct`).

---

## 8. Ce qui est déjà solide

- Aucun secret dans le dépôt git.
- 490 tests unitaires verts ; build production OK.
- Garde-fous code : blocage checkout si panier démo en production.
- Checklists admin (`production-readiness`, `catalog-sell-readiness`) alignées sur les critères métier.
- Mondial Relay : barème actif en base ; UI checkout et admin expédition en place.

---

_Rapport généré automatiquement — aucune valeur secrète incluse._
