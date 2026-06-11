# Variables d'environnement — production

Référence pour configurer **Vercel → Settings → Environment Variables** (environnement **Production**).

Vérification locale (copier vos valeurs prod dans `.env.local` ou les exporter) :

```bash
npm run verify:deploy:prod
```

---

## Application

| Variable | Obligatoire | Secret | Description |
|----------|-------------|--------|-------------|
| `NEXT_PUBLIC_SITE_URL` | Oui | Non | URL publique HTTPS, ex. `https://tilouki.fr`. Utilisée pour les liens e-mail, le sitemap et les redirections Stripe. |

---

## Supabase

| Variable | Obligatoire | Secret | Description |
|----------|-------------|--------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Oui | Non | URL du projet Supabase production (région EU recommandée). |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Oui | Non | Clé `anon` publique. |
| `SUPABASE_SERVICE_ROLE_KEY` | Oui | **Oui** | Clé service role — webhooks Stripe, cron, admin serveur. Ne jamais exposer côté client. |

---

## Stripe (mode Live)

| Variable | Obligatoire | Secret | Description |
|----------|-------------|--------|-------------|
| `STRIPE_SECRET_KEY` | Oui | **Oui** | Clé secrète Live : `sk_live_…` (Dashboard → Developers → API keys). |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Oui | Non | Clé publique Live : `pk_live_…`. |
| `STRIPE_WEBHOOK_SECRET` | Oui | **Oui** | Secret de l'endpoint webhook Live : `whsec_…`. |

### Endpoint webhook Live

1. [Stripe Dashboard](https://dashboard.stripe.com/webhooks) → **Add endpoint** (mode Live).
2. **URL** : `https://votre-domaine.fr/api/webhooks/stripe`
3. **Événements à sélectionner** (tous obligatoires) :
   - `checkout.session.completed` — paiement réussi, confirmation commande + e-mails
   - `checkout.session.expired` — session abandonnée, libération stock
   - `payment_intent.payment_failed` — paiement refusé, e-mail client + libération stock
   - `charge.refunded` — remboursement intégral, restauration stock
4. Copier le **Signing secret** (`whsec_…`) dans `STRIPE_WEBHOOK_SECRET` sur Vercel.
5. Vérifier dans le Dashboard que les livraisons renvoient **HTTP 200**.

> En développement, utilisez `sk_test_` / `pk_test_` et la [Stripe CLI](https://stripe.com/docs/stripe-cli) ou un endpoint test. Voir [STRIPE_SANDBOX_CHECKLIST.md](./STRIPE_SANDBOX_CHECKLIST.md).

---

## E-mails transactionnels

Deux options : **Resend** (recommandé) ou **SMTP**.

### Resend (recommandé)

| Variable | Obligatoire | Secret | Description |
|----------|-------------|--------|-------------|
| `RESEND_API_KEY` | Oui* | **Oui** | Clé API [Resend](https://resend.com). |
| `FROM_EMAIL` | Oui | Non | Expéditeur vérifié dans Resend, ex. `commandes@tilouki.fr`. |
| `ADMIN_EMAIL` | Oui | Non | Destinataire des notifications nouvelle commande. |

\* Si `RESEND_API_KEY` est absent, configurer SMTP ci-dessous.

### SMTP (alternative)

| Variable | Obligatoire | Secret | Description |
|----------|-------------|--------|-------------|
| `SMTP_HOST` | Oui* | Non | Hôte SMTP (ex. `smtp.gmail.com`). |
| `SMTP_PORT` | Non | Non | Port, défaut `587`. |
| `SMTP_USER` | Oui* | Non | Identifiant SMTP. |
| `SMTP_PASSWORD` | Oui* | **Oui** | Mot de passe ou clé d'application. |
| `SMTP_SECURE` | Non | Non | `true` pour port 465. |
| `FROM_EMAIL` | Oui | Non | Adresse expéditeur. |
| `ADMIN_EMAIL` | Oui | Non | Notifications admin. |

### E-mails envoyés automatiquement

| Événement | Destinataire | Déclencheur |
|-----------|--------------|-------------|
| Confirmation de commande | Client | Webhook `checkout.session.completed` |
| Notification nouvelle commande | Admin | Webhook `checkout.session.completed` |
| Paiement non abouti | Client | Webhook `payment_intent.payment_failed` |
| Expédition | Client | Admin — génération étiquette ou marquage expédié |

---

## Cron — libération stock

| Variable | Obligatoire | Secret | Description |
|----------|-------------|--------|-------------|
| `CRON_SECRET` | Oui | **Oui** | Chaîne aléatoire longue (32+ caractères). Protège `GET /api/cron/expire-pending-orders`. |

Vercel envoie automatiquement `Authorization: Bearer <CRON_SECRET>` sur le cron déclaré dans `vercel.json`.

**Rôle** : annule les commandes `pending` dont `pending_expires_at` est dépassé et **libère le stock** réservé (complément aux webhooks Stripe `expired` / `payment_failed`).

Générer un secret :

```powershell
# PowerShell
[Convert]::ToBase64String((1..48 | ForEach-Object { Get-Random -Maximum 256 }))
```

---

## Mondial Relay (obligatoire en production)

| Variable | Obligatoire | Secret | Description |
|----------|-------------|--------|-------------|
| `MONDIAL_RELAY_ENSEIGNE` | Oui* | Non | Code enseigne / brand ID fourni par Mondial Relay. |
| `MONDIAL_RELAY_PRIVATE_KEY` | Oui | **Oui** | Clé privée API WSI (étiquettes, points relais). |
| `NEXT_PUBLIC_MONDIAL_RELAY_BRAND_ID` | Oui | Non | **Même code enseigne** — widget carte points relais au checkout. |
| `NEXT_PUBLIC_MONDIAL_RELAY_PARCEL_SIZE` | Non | Non | Taille colis widget, défaut `M`. |

\* Alias acceptés : `MONDIAL_RELAY_BRAND_ID`.

**Production** : ne pas définir `SHIPPING_DEV_MOCK`, ou le mettre à `false`.

---

## Chronopost (optionnel — multi-transporteurs)

| Variable | Obligatoire | Secret | Description |
|----------|-------------|--------|-------------|
| `CHRONOPOST_ACCOUNT_NUMBER` | Si Chronopost | Non | Numéro de contrat (8 chiffres). |
| `CHRONOPOST_PASSWORD` | Si Chronopost | **Oui** | Mot de passe API associé. |
| `CHRONOPOST_USE_QUICKCOST` | Non | Non | `true` = cotation API QuickCost (cache 10 min, fallback barème DB). |
| `CHRONOPOST_DEPARTURE_ZIP` | Non | Non | CP expédition boutique pour QuickCost, défaut `75001`. |

Si Chronopost n'est pas configuré, seul Mondial Relay est proposé au checkout.

> Chronopost : pas de génération d'étiquette automatique — saisie manuelle du suivi dans l'admin après expédition.

---

## Rate limiting (fortement recommandé)

| Variable | Obligatoire | Secret | Description |
|----------|-------------|--------|-------------|
| `UPSTASH_REDIS_REST_URL` | Recommandé | Non | URL REST Upstash Redis (région EU). |
| `UPSTASH_REDIS_REST_TOKEN` | Recommandé | **Oui** | Token REST Upstash. |

Sans Upstash, le rate limiting repose sur la mémoire locale — inefficace sur Vercel serverless.

---

## Documents associés

- [guide-test-production.md](./guide-test-production.md) — test réel à petit montant
- [deploiement-vercel.md](./deploiement-vercel.md) — déploiement complet
- [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md) — checklist technique
- [checklist-mise-en-production.md](./checklist-mise-en-production.md) — checklist auto-entrepreneur
