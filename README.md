# Tilouki.fr

[![CI](https://github.com/Freddy4435/tilouki/actions/workflows/ci.yml/badge.svg)](https://github.com/Freddy4435/tilouki/actions/workflows/ci.yml)

Boutique e-commerce de vêtements enfants — Next.js 16, Supabase, Stripe Checkout, Mondial Relay.

## Stack

| Couche          | Technologie                                               |
| --------------- | --------------------------------------------------------- |
| Frontend        | Next.js 16 (App Router), React 19, Tailwind v4, shadcn/ui |
| Base de données | Supabase (PostgreSQL + RLS)                               |
| Auth admin      | Supabase Auth + table `admin_users`                       |
| Paiement        | Stripe Checkout                                           |
| Livraison       | Mondial Relay (API + widget)                              |
| E-mails         | Resend (ou SMTP)                                          |
| Hébergement     | Vercel                                                    |

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

### Catalogue de démonstration (DEV uniquement)

Le catalogue vendable (20 produits enfants, 41 variantes) est chargé automatiquement par `supabase db reset` (`seed.catalog-products.sql`). Images dans `public/products/`, SKU `TK-`.

```bash
npm run generate:catalog   # régénère SQL, CSV et visuels depuis data/catalog-products.json
npm run seed:catalog       # sur projet Supabase lié (cloud)
```

Import CSV admin : `/import-catalogue-tilouki.csv` — voir [docs/plan-import-catalogue.md](docs/plan-import-catalogue.md).

**Produits démo optionnels** (12 fictifs, jamais en production) :

```bash
npm run seed:dev
```

Images dans `public/demo-products/`, SKU `DEV-`.

Si le catalogue reste vide après le seed, redémarrez `npm run dev` (cache Next.js).

## Ne jamais partager

> ### ⛔ LIVRAISON INTERDITE : zip / .rar manuel
>
> **Ne transmettez jamais** une archive créée à la main (Explorateur, 7-Zip, WinRAR, « Envoyer vers »…).  
> Elle contient presque toujours `.env.local`, `node_modules/`, `.next/`, `.vercel/`, etc.
>
> **Seule commande autorisée :** `npm run delivery:clean`  
> **Contrôle d'un export suspect :** `npm run scan:deliverable -- <chemin>`  
> **Après fuite d'un .rar partagé :** [rotation des secrets](docs/rotation-secrets-apres-fuite-archive.md)

Avant toute livraison (archive zip, e-mail, cloud public, dépôt Git public), **excluez systématiquement** les éléments suivants. Ils sont listés dans `.gitignore` et ne doivent **jamais** être commités.

| Fichier / dossier                                     | Raison                                                                   |
| ----------------------------------------------------- | ------------------------------------------------------------------------ |
| `.env.local`                                          | Secrets locaux (Supabase, Stripe, Mondial Relay, Resend, Upstash, cron…) |
| `.env.vercel`                                         | Variables exportées depuis Vercel CLI                                    |
| `.env.production`, `.env.development`, tout `.env*`   | Autres variantes d'environnement                                         |
| `.vercel/`                                            | Lien projet Vercel + métadonnées de déploiement                          |
| `node_modules/`                                       | Dépendances réinstallables (`npm install`)                               |
| `.next/`                                              | Build Next.js régénérable (`npm run build`)                              |
| `.email-preview/`                                     | Exports HTML des e-mails de preview (`npm run email:preview`)            |
| `supabase/.temp/`                                     | Cache temporaire Supabase CLI                                            |
| `tsconfig.tsbuildinfo`                                | Cache incrémental TypeScript                                             |
| `archives/`                                           | Archives zip produites localement                                        |
| `playwright-report/`, `test-results/`, `blob-report/` | Rapports et traces Playwright                                            |
| `screenshots/`, `captures/`, `exports/`               | Captures QA et exports temporaires                                       |
| `*.log`, `logs/`                                      | Journaux pouvant contenir des URLs ou tokens                             |
| `*.pem`                                               | Certificats et clés privées                                              |

**Seul modèle public autorisé :** `.env.example` (noms de variables sans valeurs réelles).

⛔ **Ne zippez jamais le dossier à la main** (y compris en .rar) : une archive ainsi créée embarque souvent `.env.local`, `node_modules/` et `.next/`. Un scan propre ne valide pas une archive manuelle.

### Archive propre (seule méthode de partage autorisée)

Ne zippez **pas** le dossier projet à la main. Utilisez :

```bash
npm run delivery:clean
```

Le script :

1. audite les secrets dans les fichiers suivis par git (`audit:secrets`) ;
2. refuse de créer l'archive si un chemin sensible est versionné ;
3. génère `archives/tilouki-AAAA-MM-JJ.zip` via `git archive` (fichiers versionnés uniquement) ;
4. vérifie que le zip ne contient ni `.env` (sauf `.env.example`), ni `.vercel/`, ni `.next/`, ni `node_modules/`, ni rapports Playwright.

Alias : `npm run archive:clean`, `npm run prepare:archive`. Guide détaillé : [docs/livraison-archive.md](docs/livraison-archive.md).

Vérification rapide sans créer de zip : `npm run verify:archive`.

Scanner un zip / .rar / dossier suspect : `npm run scan:deliverable -- <chemin>`.

### Fuite accidentelle — rotation des secrets

Si une archive **manuelle** (.rar, zip du dossier) ou une archive propre partagée contenait **`.env.local`**, **`.env.vercel`** ou **`.vercel/`** (même à une personne de confiance), considérez toutes les clés comme compromises.

Suivez la checklist dédiée : [docs/rotation-secrets-apres-fuite-archive.md](docs/rotation-secrets-apres-fuite-archive.md).

Guide complet (tous cas de fuite) : [docs/checklist-mise-en-production.md](docs/checklist-mise-en-production.md#rotation-des-clés).

## Scripts npm

| Commande                       | Description                                                                |
| ------------------------------ | -------------------------------------------------------------------------- |
| `npm run dev`                  | Serveur de développement Next.js                                           |
| `npm run build`                | Build production                                                           |
| `npm run start`                | Serveur production (après build)                                           |
| `npm run lint`                 | ESLint                                                                     |
| `npm run lint:fix`             | ESLint avec corrections auto                                               |
| `npm run typecheck`            | Vérification TypeScript (`tsc --noEmit`)                                   |
| `npm run test`                 | Tests unitaires (Vitest)                                                   |
| `npm run format`               | Prettier (écriture)                                                        |
| `npm run format:check`         | Prettier (vérification)                                                    |
| `npm run fonts:fetch`          | Télécharge les `.woff2` locaux (`src/assets/fonts/`)                       |
| `npm run check`                | **Pipeline CI** : audit secrets + typecheck + lint + format + test + build |
| `npm run audit:secrets`        | Détecte des secrets dans les fichiers suivis par git                       |
| `npm run delivery:clean`       | **Archive zip partageable** (seule livraison autorisée)                    |
| `npm run archive:clean`        | Alias de `delivery:clean`                                                  |
| `npm run verify:archive`       | Vérifie git (ou un zip/rar/dossier passé en argument)                      |
| `npm run scan:deliverable`     | Scan d'un zip / .rar / dossier — échoue si chemin interdit                 |
| `npm run prepare:archive`      | Alias de `delivery:clean`                                                  |
| `npm run generate:catalog`     | Régénère le catalogue (SQL, CSV, SVG `/products/`)                         |
| `npm run seed:catalog`         | Charge 20 produits vendables sur Supabase lié                              |
| `npm run seed:dev`             | Charge 12 produits de démo optionnels (DEV uniquement)                     |
| `npm run generate:demo-images` | Régénère les SVG dans `public/demo-products/`                              |
| `npm run verify:deploy`        | Vérifie les variables d'environnement (dev)                                |
| `npm run verify:deploy:prod`   | Vérifie les règles production (clés Live, HTTPS, etc.)                     |
| `npm run e2e`                  | Tests E2E Playwright (parcours achat, mobile + desktop)                    |
| `npm run qa`                   | **Recette pré-lancement** : typecheck, lint, tests, build, E2E             |

Avant chaque déploiement :

```bash
npm run qa                   # recette automatisée complète
npm run verify:deploy:prod   # après avoir renseigné les variables prod
```

Guide E2E : [docs/recette-automatisee.md](./docs/recette-automatisee.md)

Guides : [variables-production.md](./docs/variables-production.md) · [guide-test-production.md](./docs/guide-test-production.md) · [deploiement-vercel.md](./docs/deploiement-vercel.md) · [checklist-mise-en-production.md](./docs/checklist-mise-en-production.md) · [maintenance-ci.md](./docs/maintenance-ci.md) · [PLAN-FINITION.md](./docs/PLAN-FINITION.md)

## Intégration continue

Le workflow [`.github/workflows/ci.yml`](.github/workflows/ci.yml) s'exécute sur chaque push et pull request vers `main`.

| Job       | Contenu                                                                                                                                    |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **check** | `npm run check` (audit anti-secrets, TypeScript, ESLint, Prettier, Vitest, build Next.js) avec variables d'environnement factices          |
| **e2e**   | Supabase local (`supabase start` + `supabase db reset` pour migrations et seed produits), puis `npm run e2e` (Playwright desktop + mobile) |

Aucun secret réel n'est versionné : le job **check** utilise des placeholders ; le job **e2e** lit les clés locales générées par Supabase CLI au runtime.

### Lire un échec CI

1. Ouvrir l'onglet **Actions** sur GitHub → workflow **CI** → run en rouge.
2. **check** en échec : cliquer sur l'étape `npm run check` — la première commande en erreur (`audit:secrets`, `typecheck`, `lint`, `format:check`, `test` ou `build`) indique la cause.
3. **e2e** en échec : consulter les logs de `npm run e2e` ; en cas d'échec, télécharger l'artefact **playwright-report** (onglet Summary du run) et l'ouvrir localement avec `npm run e2e:report` après extraction.
4. Reproduire en local : `npm run check` puis `npm run e2e` (avec Supabase seedé : `supabase start` puis `supabase db reset`).

### Secrets GitHub (optionnel)

Le job **e2e** n'exige **pas** de secrets `SUPABASE_URL` / `SUPABASE_ANON_KEY` : la base est Supabase locale dans le runner. Pour un dépôt cloud de test à la place du CLI local, configurez les secrets et adaptez le workflow (voir [docs/recette-automatisee.md](./docs/recette-automatisee.md)).

## Variables d'environnement

Copiez `.env.example` vers `.env.local` (dev) ou configurez les mêmes clés dans **Vercel → Settings → Environment Variables**.

### Obligatoires (production)

| Variable                             | Description                                                   |
| ------------------------------------ | ------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`               | URL publique (`https://tilouki.fr`)                           |
| `NEXT_PUBLIC_SUPABASE_URL`           | URL projet Supabase                                           |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`      | Clé anon Supabase                                             |
| `SUPABASE_SERVICE_ROLE_KEY`          | Clé service role (**serveur uniquement**, jamais côté client) |
| `STRIPE_SECRET_KEY`                  | Clé secrète Stripe (live en prod)                             |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Clé publique Stripe                                           |
| `STRIPE_WEBHOOK_SECRET`              | Secret du webhook Stripe                                      |
| `RESEND_API_KEY`                     | Clé API Resend                                                |
| `FROM_EMAIL`                         | Expéditeur e-mails transactionnels                            |
| `ADMIN_EMAIL`                        | Destinataire notifications nouvelles commandes                |
| `MONDIAL_RELAY_ENSEIGNE`             | Code enseigne Mondial Relay                                   |
| `MONDIAL_RELAY_PRIVATE_KEY`          | Clé privée API Mondial Relay                                  |
| `NEXT_PUBLIC_MONDIAL_RELAY_BRAND_ID` | Code enseigne pour le widget (souvent identique)              |

### Optionnelles

| Variable                                | Description                                                 |
| --------------------------------------- | ----------------------------------------------------------- |
| `NEXT_PUBLIC_SHOP_NAME`                 | Nom affiché                                                 |
| `NEXT_PUBLIC_SHOP_CONTACT_EMAIL`        | E-mail contact                                              |
| `NEXT_PUBLIC_MONDIAL_RELAY_PARCEL_SIZE` | Taille colis widget (`M` par défaut)                        |
| `SHIPPING_DEV_MOCK`                     | `true` en dev pour mock relais ; **ne pas activer en prod** |
| `CRON_SECRET`                           | Secret Bearer pour le cron libération stock (`vercel.json`) |
| `SMTP_*`                                | Alternative à Resend                                        |

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

| Route                          | Description             |
| ------------------------------ | ----------------------- |
| `/`                            | Accueil                 |
| `/catalogue`                   | Catalogue produits      |
| `/produit/[slug]`              | Fiche produit           |
| `/commande`                    | Checkout Stripe         |
| `/admin`                       | Back-office             |
| `/api/webhooks/stripe`         | Webhook paiement        |
| `/api/checkout/create-session` | Création session Stripe |

## Checklist production

Liste complète à cocher : [`docs/PRODUCTION_CHECKLIST.md`](docs/PRODUCTION_CHECKLIST.md)

## Sécurité

- Secrets uniquement côté serveur (`SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, etc.)
- `.env.local` et `.vercel` listés dans `.gitignore` — ne jamais les committer ni les joindre à une archive
- `npm run audit:secrets` avant chaque release ; `npm run delivery:clean` pour une livraison propre
- RLS Supabase activé sur toutes les tables sensibles
- Webhook Stripe signé + idempotence
- Prix et stock validés côté serveur
- Rapport d'audit : [`security_best_practices_report.md`](security_best_practices_report.md)

## Support

- Supabase : [supabase.com/docs](https://supabase.com/docs)
- Stripe : [stripe.com/docs](https://stripe.com/docs)
- Vercel : [vercel.com/docs](https://vercel.com/docs)
