# Checklist mise en production — Tilouki

**Pour qui ?** Auto-entrepreneur ou micro-entreprise qui lance une boutique en ligne de **vêtements enfants**.  
**Durée estimée :** 2 à 4 heures (hors délais DNS et validation Stripe).  
**Pas besoin de savoir coder** — suivez les cases dans l'ordre.

> Guide technique détaillé : [deploiement-vercel.md](./deploiement-vercel.md)

---

## Avant de commencer

Préparez ces comptes (gratuits ou payants selon l'offre) :

| Service | À quoi ça sert | Lien |
|---------|----------------|------|
| Vercel | Héberger le site | https://vercel.com |
| Supabase | Base de données + photos | https://supabase.com |
| Stripe | Paiement par carte | https://stripe.com |
| Mondial Relay | Livraison en point relais | https://www.mondialrelay.fr |
| Resend (recommandé) | E-mails de confirmation | https://resend.com |
| Registrar domaine | Votre adresse `tilouki.fr` | OVH, Gandi, etc. |

**Conseil :** gardez un carnet avec vos identifiants, numéro SIRET et coordonnées bancaires Stripe à portée de main.

---

## Phase 1 — Mon identité légale (obligatoire en France)

Ces informations apparaissent sur vos **mentions légales** et **CGV**. Sans elles, vous ne pouvez pas vendre sereinement.

- [ ] Nom commercial de la boutique (ex. Tilouki)
- [ ] Nom légal / raison sociale (votre nom si auto-entrepreneur)
- [ ] Statut juridique (ex. Auto-entrepreneur)
- [ ] Numéro **SIRET** (14 chiffres — le vôtre, pas un exemple)
- [ ] Adresse professionnelle
- [ ] E-mail et téléphone de contact boutique
- [ ] Médiateur de la consommation (nom + lien — obligatoire pour le e-commerce B2C)
- [ ] Informations hébergeur (Vercel : nom, adresse, e-mail — modèles dans l'admin)
- [ ] IDU REP textile (recommandé pour la vente de vêtements)

**Où les saisir :** Admin Tilouki → **Paramètres** puis **Pages légales**.  
**Vérification :** ouvrir `/mentions-legales` et `/cgv` sur le site — plus de texte « à personnaliser ».

---

## Phase 1 bis — Dépôt Git privé et partage du code

- [ ] Dépôt **GitHub privé** créé (Settings → visibilité **Private**)
- [ ] Projet local initialisé : `git init`, branche `main`, remote `origin` pointant vers le dépôt privé
- [ ] Premier push : `git push -u origin main`
- [ ] `npm run audit:secrets` vert avant tout commit (inclus dans `npm run check`)
- [ ] Aucun fichier sensible dans git : pas de `.env.local`, `.vercel/`, `node_modules/`, `.next/`, `archives/`, rapports Playwright

**Partage du code source** — règle stricte :

- **Seule méthode autorisée** pour transmettre le code à un tiers : `npm run prepare:archive` → archive `archives/tilouki-AAAA-MM-JJ.zip` (fichiers git uniquement, audit secrets intégré).
- **Interdit** : zip manuel du dossier projet, envoi de `.env.local`, partage du dossier `.vercel/`, dépôt public, ou copie brute incluant `node_modules` / `.next`.

En cas de fuite : rotation des clés (section [Rotation des clés](#rotation-des-clés)) avant tout redéploiement.

---

## Phase 2 — Mettre le site en ligne (Vercel)

- [ ] Le code est sur GitHub **privé** (ou GitLab équivalent)
- [ ] Projet créé sur Vercel, lié au dépôt
- [ ] Le **build** passe au vert sur Vercel (onglet Deployments)
- [ ] Le site répond sur `https://tilouki.vercel.app` (ou URL Vercel fournie)
- [ ] Le cadenas HTTPS est visible dans le navigateur

### Domaine personnalisé `tilouki.fr`

- [ ] Domaine acheté chez votre registrar
- [ ] Domaine ajouté dans Vercel → Settings → Domains
- [ ] DNS configurés chez le registrar (instructions Vercel suivies)
- [ ] `https://tilouki.fr` ouvre bien la boutique (attendre propagation DNS si besoin)
- [ ] Variable `NEXT_PUBLIC_SITE_URL` = `https://tilouki.fr` dans Vercel

---

## Phase 3 — Ma base de données et mes photos (Supabase)

- [ ] Projet Supabase **production** créé (région Europe)
- [ ] Migrations appliquées (demander à votre développeur : `supabase db push`)
- [ ] Bucket photos `product-images` actif
- [ ] Compte **admin** créé pour vous connecter à `/admin/login`
- [ ] Sauvegardes base de données activées (Supabase → Database → Backups)

**Test simple :** connectez-vous à l'admin et vérifiez que le tableau de bord s'affiche.

---

## Phase 4 — Mes produits (vêtements enfants)

- [ ] Au moins **5 à 10 produits** créés ou importés (CSV)
- [ ] Chaque produit a : **photo**, **prix**, **taille/âge**, **stock**, **poids** (pour la livraison)
- [ ] Statut **Actif** (visible sur le site)
- [ ] Vérification sur le catalogue public : photos nettes, prix corrects, tailles lisibles

**Où :** Admin → Produits, ou Admin → Import CSV.

---

## Phase 5 — Paiement Stripe (argent réel)

### D'abord en test (recommandé)

- [ ] Parcours test réussi avec carte `4242 4242 4242 4242` (voir [checklist-recette.md](./checklist-recette.md))

### Puis en production (Live)

- [ ] Compte Stripe **activé** (identité + compte bancaire renseignés)
- [ ] Clés **Live** configurées dans Vercel (`sk_live_…` et `pk_live_…`)
- [ ] Webhook Live créé vers `https://tilouki.fr/api/webhooks/stripe`
- [ ] Événements webhook cochés : paiement réussi, session expirée, paiement échoué
- [ ] Secret webhook `whsec_…` copié dans Vercel
- [ ] **Une vraie commande test** passée (petit montant) puis remboursée si besoin
- [ ] Commande visible en **Payée** dans Admin → Commandes
- [ ] Stock diminué sur la fiche produit

---

## Phase 6 — Livraison Mondial Relay

- [ ] Contrat / identifiants Mondial Relay E-commerce obtenus
- [ ] Code enseigne et clé privée renseignés dans Vercel
- [ ] Recherche de point relais fonctionne sur la page **Commande**
- [ ] Frais de livraison cohérents dans le récapitulatif panier
- [ ] Mode développement (`SHIPPING_DEV_MOCK`) **désactivé** en production

---

## Phase 7 — E-mails clients et notifications

- [ ] Compte Resend (ou SMTP) configuré
- [ ] Domaine d'envoi vérifié (ex. `commandes@tilouki.fr`)
- [ ] `FROM_EMAIL` = adresse vérifiée
- [ ] `ADMIN_EMAIL` = **votre** boîte mail (vous recevez chaque nouvelle commande)
- [ ] E-mail de confirmation reçu après commande test
- [ ] E-mail admin reçu (nouvelle commande)

---

## Phase 8 — Référencement et pages techniques

- [ ] Page d'accueil charge correctement sur mobile
- [ ] `https://tilouki.fr/robots.txt` accessible
- [ ] `https://tilouki.fr/sitemap.xml` liste vos pages et produits
- [ ] Page 404 : tapez une fausse URL → message clair + lien catalogue
- [ ] Bandeau **cookies** visible et fonctionnel

---

## Phase 9 — Sécurité & confidentialité

- [ ] Fichiers secrets **non** envoyés sur Git (pas de `.env.local` dans le dépôt)
- [ ] Accès admin protégé par mot de passe
- [ ] Pages confidentialité et données personnelles à jour
- [ ] Procédure de contact RGPD indiquée (`/donnees-personnelles`)
- [ ] Audit anti-fuite passé : `npm run audit:secrets` (inclus dans `npm run check`)

---

## Rotation des clés

### Quand faire tourner les clés ?

Régénérez **immédiatement** les clés concernées dans ces situations :

- **Fuite avérée ou suspectée** : un secret apparaît dans le dépôt git, dans des logs, dans une capture d'écran, ou `npm run audit:secrets` échoue.
- **Archive ou dossier partagé par erreur** contenant `.env.local`, `.env.vercel`, le dossier `.vercel/` ou tout fichier d'environnement (même envoyé à une personne de confiance : on ne contrôle plus la diffusion).
- **Départ d'un prestataire / développeur** qui avait accès aux variables d'environnement, à Vercel, Supabase ou Stripe.
- Par précaution périodique (ex. une fois par an).

> Après rotation, l'ancienne clé ne fonctionne plus : pensez à **redéployer** le site sur Vercel pour que les nouvelles valeurs soient prises en compte.

### 1. Service role key Supabase (`SUPABASE_SERVICE_ROLE_KEY`)

C'est la clé la plus sensible : elle contourne toutes les règles de sécurité de la base.

1. Ouvrir le dashboard Supabase → votre projet → **Settings → API Keys**.
2. Dans la section **service_role**, cliquer sur **Rotate / Generate new key** (selon l'interface, passer par **JWT Keys → Rotate** si la clé est de type JWT legacy — cela régénère aussi la clé `anon`).
3. Copier la nouvelle clé.
4. Vercel → projet **tilouki** → **Settings → Environment Variables** → remplacer `SUPABASE_SERVICE_ROLE_KEY` (et `NEXT_PUBLIC_SUPABASE_ANON_KEY` si elle a aussi été régénérée).
5. Mettre à jour votre `.env.local` de dev.
6. **Redéployer** (Vercel → Deployments → Redeploy) puis tester : connexion admin, création d'une commande test.

### 2. Webhook secret Stripe (`STRIPE_WEBHOOK_SECRET`)

1. Dashboard Stripe → **Développeurs → Webhooks** → sélectionner l'endpoint `https://tilouki.fr/api/webhooks/stripe`.
2. Cliquer sur **Roll secret** (ou supprimer/recréer l'endpoint avec les mêmes événements : paiement réussi, session expirée, paiement échoué).
3. Copier le nouveau secret `whsec_…`.
4. Vercel → Environment Variables → remplacer `STRIPE_WEBHOOK_SECRET`.
5. **Redéployer**, puis passer une commande test et vérifier qu'elle apparaît **Payée** en admin (Stripe → Webhooks : aucune erreur rouge).
6. Si les clés API Stripe (`sk_live_…`) ont aussi fuité : Stripe → **Développeurs → Clés API → Roll key**, puis remplacer `STRIPE_SECRET_KEY` dans Vercel.

### 3. `CRON_SECRET` (cron Vercel)

Ce secret protège `/api/cron/expire-pending-orders`. Il n'y a pas de dashboard : c'est vous qui le générez.

1. Générer une nouvelle valeur aléatoire longue, par exemple :

```bash
node -e "console.log(crypto.randomBytes(32).toString('hex'))"
```

2. Vercel → Environment Variables → remplacer `CRON_SECRET`.
3. **Redéployer**, puis vérifier au prochain passage du cron (Vercel → Logs) qu'il répond bien `200` et non `401`.

### Après toute rotation

- [ ] `.env.local` de dev mis à jour
- [ ] Variables Vercel mises à jour (Production **et** Preview si utilisées)
- [ ] Site redéployé
- [ ] `npm run verify:deploy:prod` passé (voir [variables-production.md](./variables-production.md) et [guide-test-production.md](./guide-test-production.md))
- [ ] Parcours d'achat test refait (paiement + e-mail + commande en admin)
- [ ] Si le secret était dans git : historique purgé (`git filter-repo` ou nouveau dépôt) — supprimer le fichier ne suffit pas

---

## Phase 10 — Test final avant ouverture

Rejouez le parcours complet comme un parent qui achète un vêtement :

| Étape | OK |
|-------|:--:|
| 1. Accueil | ☐ |
| 2. Catalogue | ☐ |
| 3. Fiche produit + choix taille | ☐ |
| 4. Panier + quantité | ☐ |
| 5. Commande + coordonnées | ☐ |
| 6. Point relais | ☐ |
| 7. Acceptation CGV | ☐ |
| 8. Paiement Stripe | ☐ |
| 9. Page de confirmation | ☐ |
| 10. E-mail reçu | ☐ |
| 11. Commande visible en admin | ☐ |
| 12. Stock mis à jour | ☐ |

Checklist détaillée : [checklist-recette.md](./checklist-recette.md)

**Recette automatisée** (recommandée avant chaque déploiement) : `npm run qa` — voir [recette-automatisee.md](./recette-automatisee.md)

---

## Le jour J — Ouvrir au public

- [ ] Toutes les cases des phases 1 à 10 cochées
- [ ] Dashboard admin sans alerte rouge critique
- [ ] Annonce prête (réseaux sociaux, proches, etc.)
- [ ] Vous savez comment préparer une commande (Admin → Commandes → statut **En préparation** → **Expédiée**)

---

## Grille de synthèse

| Bloc | Prêt ? | Date |
|------|:------:|------|
| Identité légale | ☐ | |
| Site en ligne + domaine | ☐ | |
| Supabase + admin | ☐ | |
| Catalogue produits | ☐ | |
| Stripe Live + webhook | ☐ | |
| Mondial Relay | ☐ | |
| E-mails | ☐ | |
| SEO / pages techniques | ☐ | |
| Test achat complet | ☐ | |

**Nom :** _______________________  
**Date d'ouverture prévue :** _______________________  
**Verdict :** ☐ J'ouvre ☐ J'attends (préciser pourquoi) _______________________

---

## Après l'ouverture (première semaine)

- [ ] Consulter Admin → Tableau de bord chaque jour
- [ ] Vérifier Stripe → Webhooks (pas d'erreurs rouges)
- [ ] Répondre aux e-mails clients sous 48 h
- [ ] Surveiller le stock faible (Admin → Stock)

---

## Besoin d'aide ?

| Problème | Où regarder |
|----------|-------------|
| Site ne s'affiche pas | Vercel → Deployments → logs |
| Paiement bloqué | Admin → alertes Stripe ; Vercel → variables |
| Commande non payée en admin | Stripe → Webhooks ; vérifier `STRIPE_WEBHOOK_SECRET` |
| Pas d'e-mail | Vercel → `RESEND_API_KEY`, `FROM_EMAIL`, `ADMIN_EMAIL` |
| Point relais vide | Variables Mondial Relay ; pas de mode dev mock |

Guide technique : [deploiement-vercel.md](./deploiement-vercel.md)
