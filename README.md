# Tilouki.fr

Boutique e-commerce de vêtements enfants — Next.js 16, Supabase, Stripe Checkout, Mondial Relay.

## Stack

| Couche | Technologie |
|--------|-------------|
| Frontend | Next.js 16 (App Router), React 19, Tailwind v4, shadcn/ui |
| Base de données | Supabase (PostgreSQL + RLS) |
| Auth admin | Supabase Auth + table `admin_users` |
| Paiement | Stripe Checkout |
| Livraison | Mondial Relay (API + widget) |
| E-mails | Resend (ou SMTP) |
| Hébergement | Vercel |

## Prérequis

- Node.js 20+
- npm 10+
- Compte [Supabase](https://supabase.com)
- Compte [Stripe](https://stripe.com)
- Compte [Mondial Relay E-commerce](https://www.mondialrelay.fr/) (production)
- Compte [Resend](https://resend.com) (e-mails)
- Compte [Vercel](https://vercel.com) (déploiement)

Optionnel en local : [Supabase CLI](https://supabase.com/docs/guides/cli), [Stripe CLI](https://stripe.com/docs/stripe-cli).

## Installation locale

```bash
git clone <votre-repo> tilouki
cd tilouki
npm install
cp .env.example .env.local
```

Renseignez `.env.local` (voir section Variables ci-dessous), puis :

```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

Admin : [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

## Scripts npm

| Commande | Description |
|----------|-------------|
| `npm run dev` | Serveur de développement Next.js |
| `npm run build` | Build production |
| `npm run start` | Serveur production (après build) |
| `npm run lint` | ESLint |
| `npm run lint:fix` | ESLint avec corrections auto |
| `npm run typecheck` | Vérification TypeScript (`tsc --noEmit`) |
| `npm run test` | Tests unitaires (Vitest) |
| `npm run format` | Prettier (écriture) |
| `npm run format:check` | Prettier (vérification) |
| `npm run check` | **Pipeline CI** : typecheck + lint + test + build |

Avant chaque déploiement :

```bash
npm run check
```

## Variables d'environnement

Copiez `.env.example` vers `.env.local` (dev) ou configurez les mêmes clés dans **Vercel → Settings → Environment Variables**.

### Obligatoires (production)

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SITE_URL` | URL publique (`https://tilouki.fr`) |
| `NEXT_PUBLIC_SUPABASE_URL` | URL projet Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé anon Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé service role (**serveur uniquement**, jamais côté client) |
| `STRIPE_SECRET_KEY` | Clé secrète Stripe (live en prod) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Clé publique Stripe |
| `STRIPE_WEBHOOK_SECRET` | Secret du webhook Stripe |
| `RESEND_API_KEY` | Clé API Resend |
| `FROM_EMAIL` | Expéditeur e-mails transactionnels |
| `ADMIN_EMAIL` | Destinataire notifications nouvelles commandes |
| `MONDIAL_RELAY_ENSEIGNE` | Code enseigne Mondial Relay |
| `MONDIAL_RELAY_PRIVATE_KEY` | Clé privée API Mondial Relay |
| `NEXT_PUBLIC_MONDIAL_RELAY_BRAND_ID` | Code enseigne pour le widget (souvent identique) |

### Optionnelles

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SHOP_NAME` | Nom affiché |
| `NEXT_PUBLIC_SHOP_CONTACT_EMAIL` | E-mail contact |
| `NEXT_PUBLIC_MONDIAL_RELAY_PARCEL_SIZE` | Taille colis widget (`M` par défaut) |
| `SHIPPING_DEV_MOCK` | `true` en dev pour mock relais ; **ne pas activer en prod** |
| `CRON_SECRET` | Secret Bearer pour le cron libération stock (`vercel.json`) |
| `SMTP_*` | Alternative à Resend |

> `MONDIAL_RELAY_BRAND_ID` reste accepté comme alias de `MONDIAL_RELAY_ENSEIGNE`.

---

## Supabase

Documentation détaillée : [`supabase/README.md`](supabase/README.md)

### 1. Créer le projet

1. [supabase.com/dashboard](https://supabase.com/dashboard) → New project
2. Choisir région **EU (Frankfurt ou Paris)** si clients en France
3. Noter l'URL et les clés API (Settings → API)

### 2. Appliquer les migrations

```bash
cd tilouki
supabase login
supabase link --project-ref VOTRE_PROJECT_REF
supabase db push
```

Migrations incluses (dans l'ordre) :

- Schéma initial (produits, commandes, stock…)
- Fonctions SQL (admin, stock, numéro commande)
- Politiques RLS
- Storage `product-images`
- Tarifs livraison
- Champs admin commandes
- Paramètres légaux
- Durcissement sécurité

### 3. Créer un administrateur

1. **Authentication → Users → Add user** (e-mail + mot de passe)
2. Copier l'UUID utilisateur
3. **SQL Editor** :

```sql
INSERT INTO public.admin_users (user_id, email, role)
VALUES (
  'UUID_UTILISATEUR_AUTH',
  'admin@tilouki.fr',
  'admin'
);
```

### 4. Paramètres boutique

Après premier login admin : `/admin/parametres` (identité, TVA, hébergeur, médiation, REP textile).

### 5. Sauvegarde

Supabase Pro inclut des backups quotidiens. Vérifiez **Database → Backups** dans le dashboard.

---

## Stripe

### Mode test (développement)

1. [Dashboard Stripe → Developers → API keys](https://dashboard.stripe.com/test/apikeys)
2. Renseigner dans `.env.local` :
   - `STRIPE_SECRET_KEY=sk_test_...`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...`

Cartes test : `4242 4242 4242 4242`, date future, CVC quelconque.

### Webhook local (Stripe CLI)

```bash
# Installer Stripe CLI : https://stripe.com/docs/stripe-cli
stripe login

# Terminal 1 — app Next.js
npm run dev

# Terminal 2 — forward webhooks
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

La CLI affiche un secret temporaire :

```
> Ready! Your webhook signing secret is whsec_...
```

Copiez-le dans `.env.local` :

```env
STRIPE_WEBHOOK_SECRET=whsec_...
```

Déclencher un test :

```bash
stripe trigger checkout.session.completed
```

### Mode live (production)

1. Activer le compte Stripe (vérification identité)
2. **Developers → API keys** (mode Live) :
   - `sk_live_...` → `STRIPE_SECRET_KEY`
   - `pk_live_...` → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
3. **Developers → Webhooks → Add endpoint** :
   - URL : `https://tilouki.fr/api/webhooks/stripe`
   - Événements :
     - `checkout.session.completed`
     - `checkout.session.expired`
     - `payment_intent.payment_failed`
     - `charge.refunded`
4. Copier le **Signing secret** → `STRIPE_WEBHOOK_SECRET` dans Vercel
5. Tester une commande réelle à petit montant

---

## Mondial Relay

### Variables

```env
MONDIAL_RELAY_ENSEIGNE=VOTRE_CODE
MONDIAL_RELAY_PRIVATE_KEY=VOTRE_CLE
NEXT_PUBLIC_MONDIAL_RELAY_BRAND_ID=VOTRE_CODE
NEXT_PUBLIC_MONDIAL_RELAY_PARCEL_SIZE=M
```

En production : ne pas définir `SHIPPING_DEV_MOCK` (ou `SHIPPING_DEV_MOCK=false`).

### Développement sans API

Si les clés MR sont absentes, `SHIPPING_DEV_MOCK=true` active des points relais fictifs (uniquement hors production).

### Tarifs livraison

Configurer les tranches dans l'admin ou via la table `shipping_rates` (migration `20250609100400`).

---

## Déploiement Vercel

### 1. Importer le projet

1. [vercel.com/new](https://vercel.com/new) → Import Git repository
2. Framework : **Next.js** (détecté automatiquement)
3. Root directory : `tilouki` si le repo est monorepo, sinon racine

### 2. Variables d'environnement

**Settings → Environment Variables** : ajouter toutes les variables de `.env.example` pour l'environnement **Production** (et Preview si besoin).

Variables **serveur uniquement** (ne pas exposer au client) :

- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `RESEND_API_KEY`
- `MONDIAL_RELAY_PRIVATE_KEY`

### 3. Domaine

**Settings → Domains** → ajouter `tilouki.fr` et `www.tilouki.fr`, suivre les instructions DNS (CNAME vers Vercel).

Mettre à jour :

```env
NEXT_PUBLIC_SITE_URL=https://tilouki.fr
```

### 4. Déployer

```bash
git push origin main
```

Ou déploiement manuel depuis le dashboard Vercel.

### 5. Vérifier

- `https://tilouki.fr/api/health` → `{ "status": "ok" }`
- Checkout test en mode live (petit montant)
- Logs Vercel en cas d'erreur webhook

---

## Structure du projet

```
tilouki/
├── src/
│   ├── app/              # Routes (public, admin, API)
│   ├── components/       # UI et domaine métier
│   ├── lib/              # Supabase, Stripe, MR, e-mail, SEO, sécurité
│   ├── server/           # Auth, actions serveur
│   └── types/            # Types TypeScript (database.ts)
├── supabase/
│   ├── migrations/       # Migrations SQL versionnées
│   └── seed.dev.sql      # Seed DEV uniquement
├── docs/
│   └── PRODUCTION_CHECKLIST.md
├── .env.example
└── security_best_practices_report.md
```

## Routes principales

| Route | Description |
|-------|-------------|
| `/` | Accueil |
| `/catalogue` | Catalogue produits |
| `/produit/[slug]` | Fiche produit |
| `/commande` | Checkout Stripe |
| `/admin` | Back-office |
| `/api/webhooks/stripe` | Webhook paiement |
| `/api/checkout/create-session` | Création session Stripe |

## Checklist production

Liste complète à cocher : [`docs/PRODUCTION_CHECKLIST.md`](docs/PRODUCTION_CHECKLIST.md)

## Sécurité

- Secrets uniquement côté serveur (`SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, etc.)
- RLS Supabase activé sur toutes les tables sensibles
- Webhook Stripe signé + idempotence
- Prix et stock validés côté serveur
- Rapport d'audit : [`security_best_practices_report.md`](security_best_practices_report.md)

## Support

- Supabase : [supabase.com/docs](https://supabase.com/docs)
- Stripe : [stripe.com/docs](https://stripe.com/docs)
- Vercel : [vercel.com/docs](https://vercel.com/docs)
