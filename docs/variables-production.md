# Variables d'environnement — production

Référence pour configurer **Vercel → Settings → Environment Variables** (environnement **Production**).

Vérification locale (copier vos valeurs prod dans `.env.local` ou les exporter) :

```bash
npm run verify:deploy:prod
```

---

## Application

| Variable               | Obligatoire | Secret | Description                                                                                                          |
| ---------------------- | ----------- | ------ | -------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL` | Oui         | Non    | URL publique HTTPS, ex. `https://tilouki.fr`. Utilisée pour les liens e-mail, le sitemap et les redirections Stripe. |

---

## Supabase

| Variable                        | Obligatoire | Secret  | Description                                                                             |
| ------------------------------- | ----------- | ------- | --------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Oui         | Non     | URL du projet Supabase production (région EU recommandée).                              |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Oui         | Non     | Clé `anon` publique.                                                                    |
| `SUPABASE_SERVICE_ROLE_KEY`     | Oui         | **Oui** | Clé service role — webhooks Stripe, cron, admin serveur. Ne jamais exposer côté client. |

---

## Stripe (mode Live)

| Variable                             | Obligatoire | Secret  | Description                                                         |
| ------------------------------------ | ----------- | ------- | ------------------------------------------------------------------- |
| `STRIPE_SECRET_KEY`                  | Oui         | **Oui** | Clé secrète Live : `sk_live_…` (Dashboard → Developers → API keys). |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Oui         | Non     | Clé publique Live : `pk_live_…`.                                    |
| `STRIPE_WEBHOOK_SECRET`              | Oui         | **Oui** | Secret de l'endpoint webhook Live : `whsec_…`.                      |

### Endpoint webhook Live

1. [Stripe Dashboard](https://dashboard.stripe.com/webhooks) → **Add endpoint** (mode Live).
2. **URL** : `https://votre-domaine.fr/api/webhooks/stripe`
3. **Événements à sélectionner** (tous obligatoires) :
   - `checkout.session.completed` — paiement réussi, confirmation commande + e-mails
   - `checkout.session.expired` — session abandonnée, libération stock
   - `payment_intent.payment_failed` — paiement refusé, e-mail client + libération stock
   - `charge.refunded` — remboursement intégral, restauration stock, e-mail client
4. Copier le **Signing secret** (`whsec_…`) dans `STRIPE_WEBHOOK_SECRET` sur Vercel.
5. Vérifier dans le Dashboard que les livraisons renvoient **HTTP 200**.

> En développement, utilisez `sk_test_` / `pk_test_` et la [Stripe CLI](https://stripe.com/docs/stripe-cli) ou un endpoint test. Voir [STRIPE_SANDBOX_CHECKLIST.md](./STRIPE_SANDBOX_CHECKLIST.md).

---

## E-mails transactionnels

Deux options : **Resend** (recommandé) ou **SMTP**.

> **Délivrabilité** : SPF, DKIM et DMARC pour votre domaine — voir [email-deliverability.md](./email-deliverability.md).  
> **Tests** : checklist complète — [EMAIL_TEST_CHECKLIST.md](./EMAIL_TEST_CHECKLIST.md).

### Resend (recommandé)

| Variable         | Obligatoire | Secret  | Description                                                 |
| ---------------- | ----------- | ------- | ----------------------------------------------------------- |
| `RESEND_API_KEY` | Oui\*       | **Oui** | Clé API [Resend](https://resend.com).                       |
| `FROM_EMAIL`     | Oui         | Non     | Expéditeur vérifié dans Resend, ex. `commandes@tilouki.fr`. |
| `ADMIN_EMAIL`    | Oui         | Non     | Destinataire des notifications nouvelle commande.           |

\* Si `RESEND_API_KEY` est absent, configurer SMTP ci-dessous.

### SMTP (alternative)

| Variable        | Obligatoire | Secret  | Description                        |
| --------------- | ----------- | ------- | ---------------------------------- |
| `SMTP_HOST`     | Oui\*       | Non     | Hôte SMTP (ex. `smtp.gmail.com`).  |
| `SMTP_PORT`     | Non         | Non     | Port, défaut `587`.                |
| `SMTP_USER`     | Oui\*       | Non     | Identifiant SMTP.                  |
| `SMTP_PASSWORD` | Oui\*       | **Oui** | Mot de passe ou clé d'application. |
| `SMTP_SECURE`   | Non         | Non     | `true` pour port 465.              |
| `FROM_EMAIL`    | Oui         | Non     | Adresse expéditeur.                |
| `ADMIN_EMAIL`   | Oui         | Non     | Notifications admin.               |

### E-mails envoyés automatiquement

| Événement                      | Destinataire | Déclencheur                                      |
| ------------------------------ | ------------ | ------------------------------------------------ |
| Confirmation de commande       | Client       | Webhook `checkout.session.completed`             |
| Notification nouvelle commande | Admin        | Webhook `checkout.session.completed`             |
| Paiement non abouti            | Client       | Webhook `payment_intent.payment_failed`          |
| Expédition                     | Client       | Admin — génération étiquette ou marquage expédié |

---

## Cron — libération stock

| Variable      | Obligatoire | Secret  | Description                                                                              |
| ------------- | ----------- | ------- | ---------------------------------------------------------------------------------------- |
| `CRON_SECRET` | Oui         | **Oui** | Chaîne aléatoire longue (32+ caractères). Protège `GET /api/cron/expire-pending-orders`. |

Vercel envoie automatiquement `Authorization: Bearer <CRON_SECRET>` sur le cron déclaré dans `vercel.json`.

**Rôle** : annule les commandes `pending` dont `pending_expires_at` est dépassé et **libère le stock** réservé (complément aux webhooks Stripe `expired` / `payment_failed`).

Générer un secret :

```powershell
# PowerShell
[Convert]::ToBase64String((1..48 | ForEach-Object { Get-Random -Maximum 256 }))
```

---

## Mondial Relay (obligatoire en production)

| Variable                                | Obligatoire | Secret  | Description                                                      |
| --------------------------------------- | ----------- | ------- | ---------------------------------------------------------------- |
| `MONDIAL_RELAY_ENSEIGNE`                | Oui\*       | Non     | Code enseigne / brand ID fourni par Mondial Relay.               |
| `MONDIAL_RELAY_PRIVATE_KEY`             | Oui         | **Oui** | Clé privée API WSI (étiquettes, points relais).                  |
| `NEXT_PUBLIC_MONDIAL_RELAY_BRAND_ID`    | Oui         | Non     | **Même code enseigne** — widget carte points relais au checkout. |
| `NEXT_PUBLIC_MONDIAL_RELAY_PARCEL_SIZE` | Non         | Non     | Taille colis widget, défaut `M`.                                 |

\* Alias acceptés : `MONDIAL_RELAY_BRAND_ID`.

**Production** : ne pas définir `SHIPPING_DEV_MOCK`, ou le mettre à `false`.

---

## Chronopost (optionnel — multi-transporteurs)

| Variable                    | Obligatoire   | Secret  | Description                                                         |
| --------------------------- | ------------- | ------- | ------------------------------------------------------------------- |
| `CHRONOPOST_ACCOUNT_NUMBER` | Si Chronopost | Non     | Numéro de contrat (8 chiffres).                                     |
| `CHRONOPOST_PASSWORD`       | Si Chronopost | **Oui** | Mot de passe API associé.                                           |
| `CHRONOPOST_USE_QUICKCOST`  | Non           | Non     | `true` = cotation API QuickCost (cache 10 min, fallback barème DB). |
| `CHRONOPOST_DEPARTURE_ZIP`  | Non           | Non     | CP expédition boutique pour QuickCost, défaut `75001`.              |

Si Chronopost n'est pas configuré, seul Mondial Relay est proposé au checkout.

> Chronopost : génération d'étiquette Chrono Relais via **ShippingServiceWS / shippingV6** (productCode `86`, `recipientRef` = identifiant point relais). Le PDF est stocké en base sous forme de data URL ; l'admin peut aussi enregistrer un suivi manuel.

### Smoke test Pickup (obligatoire avant activation du barème)

Les appels Chronopost utilisent **SOAP POST** (credentials dans le corps XML, jamais dans l'URL). Avant d'activer le transporteur Chronopost dans **Admin → Livraison**, validez vos identifiants avec le script manuel (hors CI) :

```bash
# PowerShell — exporter les variables puis lancer le smoke test
$env:CHRONOPOST_ACCOUNT_NUMBER = "12345678"
$env:CHRONOPOST_PASSWORD = "votre_mot_de_passe"
node scripts/smoke-chronopost.mjs 75001 Paris
```

```bash
# bash
CHRONOPOST_ACCOUNT_NUMBER=12345678 CHRONOPOST_PASSWORD=xxxxxx node scripts/smoke-chronopost.mjs 69001 Lyon
```

Le script affiche le nombre de points relais trouvés et le premier résultat. **N'activez pas le barème Chronopost** (`is_active`) tant que ce test n'est pas vert (code `0` avec au moins un point, ou `601` = aucun point sur la zone test mais identifiants acceptés).

En cas d'échec `1500` : vérifiez le numéro de contrat (8 chiffres) et le mot de passe Chronotrace dans votre espace Chronopost.

---

## Rate limiting (obligatoire en production)

| Variable                   | Obligatoire | Secret  | Description                         |
| -------------------------- | ----------- | ------- | ----------------------------------- |
| `UPSTASH_REDIS_REST_URL`   | Oui         | Non     | URL REST Upstash Redis (région EU). |
| `UPSTASH_REDIS_REST_TOKEN` | Oui         | **Oui** | Token REST Upstash.                 |

Sans Upstash en production, les routes sensibles (checkout, panier, webhooks, suivi commande) répondent **503** — le fallback mémoire n'est utilisé qu'en développement local. `npm run verify:deploy:prod` échoue si ces variables sont absentes.

**Configuration :**

1. [console.upstash.com](https://console.upstash.com) → **Create Database** → Redis, région **EU**
2. Onglet **REST API** → copier `UPSTASH_REDIS_REST_URL` et `UPSTASH_REDIS_REST_TOKEN` dans Vercel (Production)
3. Vérifier : `npm run verify:deploy:prod` doit lister les deux variables comme présentes

---

## Liste exacte des contrôles `verify:deploy:prod`

Le script `scripts/verify-deploy.mjs --production` vérifie **chaque point** ci-dessous. En cas d'échec, le message affiché (`✗ …`) indique la variable ou le prérequis manquant — recopiez-le dans Vercel.

### Variables obligatoires (chaîne non vide)

| Variable                             | Rôle                                |
| ------------------------------------ | ----------------------------------- |
| `NEXT_PUBLIC_SITE_URL`               | URL HTTPS du site                   |
| `NEXT_PUBLIC_SUPABASE_URL`           | Projet Supabase                     |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`      | Clé anon                            |
| `SUPABASE_SERVICE_ROLE_KEY`          | Clé service (serveur)               |
| `STRIPE_SECRET_KEY`                  | Clé secrète **Live** (`sk_live_…`)  |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Clé publique **Live** (`pk_live_…`) |
| `STRIPE_WEBHOOK_SECRET`              | Secret webhook (`whsec_…`)          |
| `FROM_EMAIL`                         | Expéditeur e-mails transactionnels  |
| `ADMIN_EMAIL`                        | Notifications admin                 |
| `MONDIAL_RELAY_PRIVATE_KEY`          | API Mondial Relay                   |
| `NEXT_PUBLIC_MONDIAL_RELAY_BRAND_ID` | Widget points relais                |
| `CRON_SECRET`                        | Protection cron (32+ caractères)    |
| `UPSTASH_REDIS_REST_URL`             | Rate limiting                       |
| `UPSTASH_REDIS_REST_TOKEN`           | Rate limiting                       |

### Contrôles dérivés (même commande)

| ID / contrôle       | Condition                                                           |
| ------------------- | ------------------------------------------------------------------- |
| Code enseigne MR    | `MONDIAL_RELAY_ENSEIGNE` ou `MONDIAL_RELAY_BRAND_ID`                |
| Fournisseur e-mail  | `RESEND_API_KEY` **ou** `SMTP_HOST` + `SMTP_USER` + `SMTP_PASSWORD` |
| Format e-mails      | `FROM_EMAIL` et `ADMIN_EMAIL` valides                               |
| HTTPS               | `NEXT_PUBLIC_SITE_URL` commence par `https://`                      |
| Stripe cohérent     | Pas de mélange `sk_test_` / `pk_live_`                              |
| `SHIPPING_DEV_MOCK` | Absent ou ≠ `true`                                                  |
| Route webhook       | `src/app/api/webhooks/stripe/route.ts`                              |
| Événements Stripe   | 4 événements dans `src/lib/stripe/webhook/events.ts`                |
| Cron Vercel         | `/api/cron/expire-pending-orders` dans `vercel.json`                |
| `.gitignore`        | Couvre `.env*`, `.vercel`, `.next/`, `node_modules`                 |

> **Admin** : `/admin/preparation` reprend ces contrôles dans la section « Configuration production ». L'état **Prêt à encaisser** exige en plus les paramètres boutique, pages légales publiables et catalogue (voir checklist légale sur la même page).

---

## Documents associés

- [guide-test-production.md](./guide-test-production.md) — test réel à petit montant
- [deploiement-vercel.md](./deploiement-vercel.md) — déploiement complet
- [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md) — checklist technique
- [checklist-mise-en-production.md](./checklist-mise-en-production.md) — checklist auto-entrepreneur
