# Checklist mise en production — Tilouki (technique)

> **Version auto-entrepreneur :** [checklist-mise-en-production.md](./checklist-mise-en-production.md)  
> **Guide déploiement Vercel :** [deploiement-vercel.md](./deploiement-vercel.md)  
> **Variables :** [variables-production.md](./variables-production.md)

Cocher chaque point avant d'ouvrir la boutique au public.

## Garde-fou automatisé

Avant toute mise en vente, **tous** les contrôles ci-dessous doivent passer :

```bash
npm run verify:deploy:prod
```

Le script lit `.env.local`, puis `.env.production.local` si présent, puis les variables du shell (comme sur Vercel après configuration). En local sans secrets réels, il **doit échouer** avec des messages actionnables — c'est le comportement attendu.

Pour tester en local avec les mêmes valeurs que Vercel : `cp .env.production.local.example .env.production.local`, renseigner les clés, puis `npm run verify:deploy:prod`. Préflight complet : `npm run go-live:preflight` (scan + verify + archive `delivery:clean`).

### Contrôles bloquants (`verify:deploy:prod`)

| Contrôle       | Variables / prérequis                                                                                                |
| -------------- | -------------------------------------------------------------------------------------------------------------------- |
| URL HTTPS      | `NEXT_PUBLIC_SITE_URL` commence par `https://`                                                                       |
| Supabase       | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`                             |
| Stripe Live    | `STRIPE_SECRET_KEY` (`sk_live_`), `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (`pk_live_`), cohérence test/live             |
| Webhook Stripe | `STRIPE_WEBHOOK_SECRET` (`whsec_`), route `/api/webhooks/stripe`, 4 événements dans le code                          |
| E-mails        | `RESEND_API_KEY` **ou** `SMTP_HOST` + `SMTP_USER` + `SMTP_PASSWORD` ; `FROM_EMAIL`, `ADMIN_EMAIL` valides            |
| Mondial Relay  | `MONDIAL_RELAY_PRIVATE_KEY`, code enseigne (`MONDIAL_RELAY_ENSEIGNE` ou alias), `NEXT_PUBLIC_MONDIAL_RELAY_BRAND_ID` |
| Livraison mock | `SHIPPING_DEV_MOCK` absent ou ≠ `true`                                                                               |
| Cron           | `CRON_SECRET` (32+ caractères), entrée dans `vercel.json`                                                            |
| Rate limiting  | `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`                                                                |
| Dépôt          | `.gitignore` couvre `.env*`, `.vercel`, `.next/`, `node_modules`                                                     |

### Avertissements non bloquants

| Contrôle    | Détail                                                                                   |
| ----------- | ---------------------------------------------------------------------------------------- |
| Chronopost  | Non configuré → mono-transporteur Mondial Relay (OK)                                     |
| Enseigne MR | `MONDIAL_RELAY_ENSEIGNE` ≠ `NEXT_PUBLIC_MONDIAL_RELAY_BRAND_ID` → risque widget checkout |

### État admin « Prêt à encaisser »

Page **Admin → Préparation** :

| État                                                     | Signification                                                                                        |
| -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| **Prêt à encaisser**                                     | Données boutique + pages légales publiables + `verify:deploy:prod` vert                              |
| **Boutique prête — configuration production incomplète** | Paramètres légaux OK, variables Vercel manquantes                                                    |
| Points bloquants                                         | Checkout **production** refusé tant que les pages légales ou paramètres obligatoires sont incomplets |

---

## Infrastructure

- [ ] Domaine branché sur Vercel avec HTTPS
- [ ] `NEXT_PUBLIC_SITE_URL` = URL production (`https://…`)
- [ ] Variables Vercel configurées (voir `.env.example`)
- [ ] `npm run verify:deploy:prod` vert
- [ ] `npm run check` vert en local avant push

## Supabase

- [ ] Projet Supabase production (région EU recommandée)
- [ ] Migrations appliquées (`supabase db push`)
- [ ] **Ne pas** exécuter les seeds dev en production
- [ ] RLS vérifié ; bucket `product-images` ; backup activé
- [ ] Administrateur dans `admin_users`
- [ ] **Auth client** : redirect autorisé `https://votre-domaine.fr/auth/callback` (magic link `/compte`)

## Stripe

- [ ] Compte Stripe activé (mode **Live**)
- [ ] Clés Live + webhook Live → `https://votre-domaine.fr/api/webhooks/stripe`
- [ ] Événements : `checkout.session.completed`, `checkout.session.expired`, `payment_intent.payment_failed`, `charge.refunded`
- [ ] Test commande réel petit montant

## Mondial Relay

- [ ] `MONDIAL_RELAY_ENSEIGNE`, `MONDIAL_RELAY_PRIVATE_KEY`, `NEXT_PUBLIC_MONDIAL_RELAY_BRAND_ID`
- [ ] `SHIPPING_DEV_MOCK` absent ou `false`
- [ ] Test point relais au checkout ; barème dans l'admin

## E-mails

- [ ] `RESEND_API_KEY` (ou SMTP) + `FROM_EMAIL` vérifié + `ADMIN_EMAIL`
- [ ] Tests confirmation client, notification admin, expédition

## Upstash (rate limiting)

- [ ] Base Redis Upstash (région EU) créée
- [ ] `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` sur Vercel

## Contenu boutique

- [ ] Admin → **Préparation** (`/admin/preparation`) feu vert
- [ ] Paramètres légaux, produits actifs, pages légales, bandeau cookies

## Tests finaux

- [ ] Parcours catalogue → paiement → e-mail → suivi commande
- [ ] Admin : préparation → expédition
- [ ] `npm run check` sans erreur

## Post-lancement

- [ ] Monitoring Vercel / Supabase / webhooks Stripe
- [ ] Procédure RGPD documentée

## Livraison du code

- [ ] Archive uniquement via `npm run archive:clean` — jamais de .rar manuel ([livraison-archive.md](./livraison-archive.md))
