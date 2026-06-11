# Déploiement Tilouki sur Vercel

Guide technique pour mettre en ligne la boutique **Tilouki** (Next.js 16, Supabase, Stripe, Mondial Relay).

**URL actuelle (preview Vercel) :** https://tilouki.vercel.app  
**Domaine cible :** https://tilouki.fr (à brancher — voir section Domaine)

---

## 1. Audit du projet (état au 09/06/2026)

| Point | Statut | Détail |
|-------|--------|--------|
| `next.config.ts` | ✅ OK | `poweredByHeader: false`, redirects SEO, images Supabase, en-têtes de base |
| Build production | ✅ OK | `npm run build` et `npm run check` passent |
| Variables d'environnement | ⚠️ À configurer | Voir `.env.example` + script `npm run verify:deploy:prod` |
| Supabase production | ⚠️ À valider | Migrations à appliquer, bucket `product-images`, admin créé |
| Stripe Live | ⚠️ À basculer | Production Vercel : utiliser clés `sk_live_` / `pk_live_` |
| Webhook Stripe prod | ⚠️ À créer | Endpoint `https://votre-domaine.fr/api/webhooks/stripe` |
| Domaine personnalisé | ❌ Non branché | Seul `tilouki.vercel.app` est actif sur le projet Vercel |
| HTTPS | ✅ OK | Certificat Vercel + `Strict-Transport-Security` en production |
| `sitemap.xml` | ✅ OK | Généré dynamiquement (`src/app/sitemap.ts`) |
| `robots.txt` | ✅ OK | Admin, API, panier et checkout exclus de l'indexation |
| Metadata SEO | ✅ OK | `metadataBase`, Open Graph, pages produit/catalogue |
| Page 404 | ✅ OK | `src/app/not-found.tsx` |
| Page erreur | ✅ OK | `src/app/error.tsx` (boundary client) |
| Headers sécurité | ✅ OK | Middleware : CSP, HSTS, X-Frame-Options, etc. |
| Fichiers sensibles git | ✅ OK | `.env*`, `.vercel`, `.next`, `node_modules` dans `.gitignore` |

---

## 2. Prérequis

- Compte [Vercel](https://vercel.com) (plan Hobby suffit pour démarrer)
- Projet Git connecté à Vercel (GitHub / GitLab / Bitbucket)
- Projet Supabase **production** (région **EU** recommandée pour RGPD)
- Compte Stripe **activé** (passage en mode Live)
- Contrat Mondial Relay E-commerce (production)
- Compte Resend (ou SMTP) pour les e-mails transactionnels
- Nom de domaine (ex. `tilouki.fr`) chez votre registrar

---

## 3. Configuration Vercel

### 3.1 Créer / lier le projet

1. [Vercel Dashboard](https://vercel.com/dashboard) → **Add New → Project**
2. Importer le dépôt Git `tilouki`
3. Framework : **Next.js** (détection automatique)
4. Build Command : `npm run build` (défaut)
5. Output : défaut Next.js
6. Node.js : **20.x** ou **24.x** (le projet `tilouki` utilise 24.x)

### 3.2 Variables d'environnement

Configurer dans **Settings → Environment Variables** pour l'environnement **Production** (et Preview si besoin de tests).

Copier depuis `.env.example`. **Référence détaillée** : [variables-production.md](./variables-production.md)  
**Test réel petit montant** : [guide-test-production.md](./guide-test-production.md)

Tableau des variables critiques :

| Variable | Production | Secret |
|----------|------------|--------|
| `NEXT_PUBLIC_SITE_URL` | `https://tilouki.fr` | Non |
| `NEXT_PUBLIC_SUPABASE_URL` | URL projet Supabase prod | Non |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé anon prod | Non |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role prod | **Oui** |
| `STRIPE_SECRET_KEY` | `sk_live_…` | **Oui** |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_…` | Non |
| `STRIPE_WEBHOOK_SECRET` | `whsec_…` (endpoint Live) | **Oui** |
| `RESEND_API_KEY` | Clé API Resend | **Oui** |
| `FROM_EMAIL` | `commandes@tilouki.fr` (domaine vérifié) | Non |
| `ADMIN_EMAIL` | Votre boîte de réception | Non |
| `MONDIAL_RELAY_ENSEIGNE` | Code enseigne MR | Non |
| `MONDIAL_RELAY_PRIVATE_KEY` | Clé privée MR | **Oui** |
| `NEXT_PUBLIC_MONDIAL_RELAY_BRAND_ID` | Même code enseigne (widget) | Non |
| `CRON_SECRET` | Chaîne aléatoire longue (32+ car.) | **Oui** |
| `UPSTASH_REDIS_REST_URL` | URL REST de la base Upstash (rate limiting) | Non |
| `UPSTASH_REDIS_REST_TOKEN` | Token REST Upstash | **Oui** |

**Ne pas définir en production :**

- `SHIPPING_DEV_MOCK` (ou `false` explicitement)

**Vérification locale avant push :**

```bash
# Copier vos valeurs prod dans .env.local temporairement, ou exporter les variables
npm run verify:deploy:prod
```

### 3.3 Cron Vercel

Le fichier `vercel.json` déclare un cron quotidien :

```json
{
  "crons": [{ "path": "/api/cron/expire-pending-orders", "schedule": "0 3 * * *" }]
}
```

- Libère le stock des commandes `pending` expirées (3 h du matin UTC)
- Nécessite `CRON_SECRET` — Vercel envoie `Authorization: Bearer <CRON_SECRET>`

> Le cron Vercel nécessite un plan **Pro** ou l'activation des crons sur votre compte. Sinon, déclencher manuellement ou via un service externe (cron-job.org) avec le header Bearer.

### 3.4 Rate limiting — Upstash Redis

La limitation de débit (checkout 10/min, points relais 20/min, etc.) utilise une **Map en mémoire** par défaut : suffisant en dev local, mais **inopérant sur Vercel serverless** où chaque instance a sa propre mémoire. En production, configurer **Upstash Redis** (sliding window partagé entre toutes les instances).

**Créer une base gratuite :**

1. [console.upstash.com](https://console.upstash.com) → **Create Database**
2. Type : **Redis**, nom : `tilouki-ratelimit`
3. Région : **eu** (ex. `eu-west-1` / Ireland — proche de Vercel `cdg1`/`fra1` et RGPD-friendly)
4. Plan **Free** : 500 000 commandes/mois — largement suffisant pour le rate limiting
5. Dans l'onglet **REST API**, copier `UPSTASH_REDIS_REST_URL` et `UPSTASH_REDIS_REST_TOKEN`
6. Les ajouter dans Vercel → **Settings → Environment Variables** (Production)

**Comportement :**

- Variables présentes → limitation via Upstash (sliding window, clé `IP:route`)
- Variables absentes → fallback Map mémoire (aucun Redis requis pour `npm run dev`)
- Erreur Redis ponctuelle → bascule automatique sur la Map mémoire (la requête n'est pas bloquée)
- `npm run verify:deploy:prod` avertit si Upstash n'est pas configuré

---

## 4. Supabase production

### 4.1 Migrations

```bash
# Lier le projet local au projet Supabase prod
supabase link --project-ref <VOTRE_PROJECT_REF>

# Appliquer toutes les migrations
supabase db push
```

Migrations présentes dans `supabase/migrations/` (11 fichiers, du schéma initial aux pages légales).

**Ne jamais exécuter** `seed.dev.sql` en production.

### 4.2 Checklist Supabase

- [ ] Région EU (ex. `eu-west-1`)
- [ ] Toutes les migrations appliquées sans erreur
- [ ] Bucket Storage `product-images` créé (migration `20250609100300_storage.sql`)
- [ ] Politiques RLS actives (`orders`, `admin_users`, `inventory_movements`)
- [ ] Utilisateur admin dans `admin_users` + compte Supabase Auth
- [ ] Backups activés (Dashboard → Database → Backups)
- [ ] URL et clés **production** dans Vercel (pas les clés du projet dev)

### 4.3 Vérification rapide

```bash
# Santé API déployée
curl https://tilouki.vercel.app/api/health
# → {"status":"ok","timestamp":"..."}
```

---

## 5. Stripe — Test vs Live

### Mode Test (développement / recette)

| Élément | Valeur |
|---------|--------|
| Clés | `sk_test_…`, `pk_test_…` |
| Carte | `4242 4242 4242 4242` |
| Webhook | Stripe CLI ou endpoint test Dashboard |
| Checklist | [STRIPE_SANDBOX_CHECKLIST.md](./STRIPE_SANDBOX_CHECKLIST.md) |

### Mode Live (production)

1. Activer votre compte Stripe (identité, IBAN)
2. Remplacer les clés dans Vercel par les clés **Live**
3. Créer un endpoint webhook **Live** :
   - URL : `https://tilouki.fr/api/webhooks/stripe`
   - Événements :
     - `checkout.session.completed`
     - `checkout.session.expired`
     - `payment_intent.payment_failed`
     - `charge.refunded`
4. Copier le `whsec_…` dans `STRIPE_WEBHOOK_SECRET` (Production)
5. Tester une commande réelle à petit montant, puis rembourser si besoin

**Vérifier dans Stripe Dashboard → Webhooks :** dernières livraisons en HTTP 200.

---

## 6. Domaine personnalisé & HTTPS

### Brancher `tilouki.fr` sur Vercel

1. Vercel → projet **tilouki** → **Settings → Domains**
2. Ajouter `tilouki.fr` et `www.tilouki.fr`
3. Chez votre registrar (OVH, Gandi, Cloudflare…), configurer les DNS indiqués par Vercel :
   - **A** `76.76.21.21` ou **CNAME** `cname.vercel-dns.com`
4. Attendre la propagation DNS (quelques minutes à 48 h)
5. Mettre à jour `NEXT_PUBLIC_SITE_URL=https://tilouki.fr` dans Vercel
6. Redéployer

### HTTPS

- Certificat TLS automatique (Let's Encrypt) par Vercel
- Redirection HTTP → HTTPS automatique
- HSTS activé via middleware en production (`max-age=63072000`)

**Test :**

```powershell
# PowerShell
(Invoke-WebRequest -Uri "https://tilouki.vercel.app" -Method Head).Headers["Strict-Transport-Security"]
```

---

## 7. SEO & pages techniques

### Sitemap

- URL : `/sitemap.xml`
- Contenu : accueil, catalogue, catégories, produits actifs, pages légales
- Régénération : cache 1 h (`revalidate = 3600`)

Après changement de domaine, vérifier que les URLs du sitemap utilisent `NEXT_PUBLIC_SITE_URL`.

### Robots.txt

- URL : `/robots.txt`
- Exclut : `/admin/`, `/api/`, `/panier`, `/commande`, `/suivi-commande`
- Référence le sitemap

### Metadata

- Racine : `src/app/layout.tsx` (`metadataBase`, titre, description, Open Graph)
- Image OG : `/opengraph-image` (générée dynamiquement)
- Pages produit : titre, description, canonical, `noIndex` si brouillon

### Pages d'erreur

| Route | Fichier | Usage |
|-------|---------|-------|
| 404 | `src/app/not-found.tsx` | Page inexistante |
| 500 | `src/app/error.tsx` | Erreur runtime React (bouton Réessayer) |

---

## 8. Sécurité

### En-têtes (middleware)

Fichier : `src/lib/security/headers.ts`, appliqué via `src/middleware.ts`.

| En-tête | Valeur |
|---------|--------|
| `Content-Security-Policy` | Restreint scripts (Stripe, Mondial Relay), images Supabase |
| `Strict-Transport-Security` | Production uniquement |
| `X-Frame-Options` | `DENY` |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | Caméra, micro, géoloc désactivés |

### Fichiers à ne jamais versionner

Confirmé dans `.gitignore` :

```
.env*
!.env.example
.vercel
/.next/
node_modules
.env.vercel
```

Vérifier avant chaque commit :

```bash
git ls-files .env.local .vercel node_modules
# → aucune sortie attendue
```

---

## 9. Pipeline de déploiement recommandé

```bash
# 1. Qualité code
npm run check

# 2. Variables (règles production)
npm run verify:deploy:prod

# 3. Push sur main → déploiement Vercel automatique
git push origin main

# 4. Vérifications post-déploiement
# - https://votre-domaine.fr/api/health
# - https://votre-domaine.fr/robots.txt
# - https://votre-domaine.fr/sitemap.xml
# - Parcours achat test (voir checklist-mise-en-production.md)
```

---

## 10. Dépannage

| Symptôme | Cause probable | Action |
|----------|----------------|--------|
| Build Vercel échoue | Erreur TypeScript / lint | `npm run check` en local |
| Images produits cassées | `NEXT_PUBLIC_SUPABASE_URL` incorrect | Vérifier variables Vercel |
| Paiement indisponible | Clés Stripe absentes | Dashboard admin → alerte Stripe |
| Webhook 400/503 | `STRIPE_WEBHOOK_SECRET` incorrect | Recréer endpoint, mettre à jour Vercel |
| Points relais vides | MR non configuré | Variables MR + pas de `SHIPPING_DEV_MOCK` |
| Sitemap avec mauvaise URL | `NEXT_PUBLIC_SITE_URL` obsolète | Mettre l'URL finale + redéployer |
| Admin inaccessible | Utilisateur pas dans `admin_users` | Supabase → SQL ou Dashboard |

---

## 11. Documents associés

- [variables-production.md](./variables-production.md) — référence variables Stripe, e-mails, cron, transporteurs
- [guide-test-production.md](./guide-test-production.md) — test Live petit montant
- [checklist-mise-en-production.md](./checklist-mise-en-production.md) — checklist auto-entrepreneur
- [checklist-recette.md](./checklist-recette.md) — tests parcours client
- [STRIPE_SANDBOX_CHECKLIST.md](./STRIPE_SANDBOX_CHECKLIST.md) — tests Stripe test
- [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md) — checklist technique synthétique
