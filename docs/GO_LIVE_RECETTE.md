# Recette go-live — Tilouki

**Objectif :** valider que la boutique peut vendre des vêtements enfants **sans mauvaise surprise** (paiement, stock, livraison, e-mails, légal, mobile).

**Public :** dirigeante, testeuse métier, développeur — chaque section indique qui agit.  
**Durée estimée :** 3 à 6 h (réparties sur test → préproduction → production).  
**Aucun secret** ne doit être copié dans ce document : les clés restent dans Vercel ou votre coffre-fort.

---

## Documents complémentaires

| Sujet                                | Document                                                             |
| ------------------------------------ | -------------------------------------------------------------------- |
| Variables Vercel                     | [variables-production.md](./variables-production.md)                 |
| Déploiement technique                | [deploiement-vercel.md](./deploiement-vercel.md)                     |
| Checklist auto-entrepreneur          | [checklist-mise-en-production.md](./checklist-mise-en-production.md) |
| Parcours client détaillé (15 étapes) | [checklist-recette.md](./checklist-recette.md)                       |
| Stripe sandbox                       | [STRIPE_SANDBOX_CHECKLIST.md](./STRIPE_SANDBOX_CHECKLIST.md)         |
| E-mails                              | [EMAIL_TEST_CHECKLIST.md](./EMAIL_TEST_CHECKLIST.md)                 |
| Pages légales                        | [LEGAL_COMPLIANCE.md](./LEGAL_COMPLIANCE.md)                         |
| Archive propre                       | [livraison-archive.md](./livraison-archive.md)                       |

---

## Les trois environnements

Utilisez **toujours** la colonne qui correspond à l’étape en cours. Ne mélangez pas carte test et clés Live.

|                              | **Test** (local ou sandbox)                                     | **Préproduction** (preview Vercel)                   | **Production** (boutique ouverte)           |
| ---------------------------- | --------------------------------------------------------------- | ---------------------------------------------------- | ------------------------------------------- |
| **URL**                      | `http://localhost:3000`                                         | `https://…-git-….vercel.app` ou sous-domaine staging | `https://votre-domaine.fr`                  |
| **Stripe**                   | Mode **Test** (`sk_test_` / `pk_test_`)                         | Mode **Test** recommandé                             | Mode **Live** (`sk_live_` / `pk_live_`)     |
| **Carte bancaire**           | `4242 4242 4242 4242` (succès) ou `4000 0000 0000 0002` (refus) | Idem test                                            | **Vraie carte**, petit montant (ex. 1 €)    |
| **Webhook Stripe**           | Stripe CLI ou endpoint test                                     | Endpoint test vers l’URL preview                     | Endpoint **Live** vers le domaine définitif |
| **Livraison**                | Mock possible (`SHIPPING_DEV_MOCK=true`)                        | Mondial Relay réel de préférence                     | Mondial Relay réel, **pas** de mock         |
| **E-mails**                  | Redirection dev possible                                        | Boîtes de test                                       | `FROM_EMAIL` vérifié, vraies boîtes         |
| **Argent réel**              | Non                                                             | Non                                                  | Oui                                         |
| **Commande `verify:deploy`** | `npm run verify:deploy`                                         | `npm run verify:deploy`                              | `npm run verify:deploy:prod`                |

**Résultat attendu global :** chaque scénario est validé en **test**, rejoué en **préproduction** si une URL preview existe, puis une dernière fois en **production** avant d’annoncer l’ouverture.

---

## Matériel à préparer (une fois)

| Élément           | Détail                                                                                         |
| ----------------- | ---------------------------------------------------------------------------------------------- |
| Navigateur        | Chrome ou Firefox — version bureau **et** téléphone (ou mode responsive)                       |
| Compte admin      | Accès `/admin/login`                                                                           |
| E-mail de test    | Boîte que vous consultez en temps réel                                                         |
| Téléphone         | Numéro valide (10 chiffres)                                                                    |
| Produit témoin    | Un article **actif**, stock ≥ 2, taille connue — notez nom, taille, stock **avant** les achats |
| Produit stock 1   | Un article avec **exactement 1** unité sur une taille (pour le scénario dédié)                 |
| Carnet de recette | Date, environnement, n° de commande, captures si échec                                         |

---

# Partie A — Configuration (avant la recette métier)

## A1. Configuration Vercel

**Qui :** développeur ou personne ayant accès au projet Vercel.

| Étape | Action                                                    | Résultat attendu                                            |
| ----- | --------------------------------------------------------- | ----------------------------------------------------------- |
| 1     | Projet Vercel lié au dépôt Git **privé**                  | Onglet Deployments affiche les builds                       |
| 2     | Dernier déploiement **Production** au vert                | Site accessible en HTTPS                                    |
| 3     | Domaine personnalisé ajouté (si applicable)               | Cadenas vert sur `https://votre-domaine.fr`                 |
| 4     | `NEXT_PUBLIC_SITE_URL` = URL HTTPS définitive             | Liens e-mail et redirections Stripe corrects                |
| 5     | Cron `expire-pending-orders` présent (`vercel.json`)      | Visible dans Vercel → Cron Jobs (plan Pro ou crons activés) |
| 6     | Variables renseignées pour l’environnement **Production** | Voir section A2                                             |

**Test rapide (non technique) :** ouvrir l’accueil en navigation privée → logo, catalogue, pied de page sans erreur.

---

## A2. Variables production

**Qui :** développeur configure Vercel ; la dirigeante vérifie le **résultat** du script.

Liste complète : [variables-production.md](./variables-production.md). Groupes obligatoires :

| Groupe           | Variables (noms uniquement)                                                                            | Résultat attendu                                  |
| ---------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------- |
| Site             | `NEXT_PUBLIC_SITE_URL`                                                                                 | Commence par `https://`                           |
| Base de données  | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`               | Admin et catalogue chargent                       |
| Paiement Live    | `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`                     | Préfixes `sk_live_`, `pk_live_`, `whsec_` en prod |
| E-mails          | `FROM_EMAIL`, `ADMIN_EMAIL` + `RESEND_API_KEY` **ou** SMTP (`SMTP_HOST`, `SMTP_USER`, `SMTP_PASSWORD`) | Au moins un fournisseur configuré                 |
| Livraison        | `MONDIAL_RELAY_PRIVATE_KEY`, `MONDIAL_RELAY_ENSEIGNE`, `NEXT_PUBLIC_MONDIAL_RELAY_BRAND_ID`            | Points relais réels au checkout                   |
| Sécurité         | `CRON_SECRET` (32+ caractères), `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`                   | Rate limiting actif en prod                       |
| Interdit en prod | `SHIPPING_DEV_MOCK` absent ou `false`                                                                  | Pas de relais fictifs                             |

**Contrôle automatisé :**

```bash
npm run verify:deploy:prod
```

**Résultat attendu :** message final **sans point bloquant** (les avertissements Chronopost seuls sont acceptables si vous n’utilisez que Mondial Relay).

> En local sans secrets réels, le script **doit échouer** — c’est normal. Lancez-le après avoir copié les variables prod dans `.env.local` ou exporté l’environnement.

---

## A3. Webhook Stripe

**Qui :** développeur (Dashboard Stripe) ; testeur vérifie les événements **200**.

| Étape | Action                                                                                                                                     | Résultat attendu                                  |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------- |
| 1     | Stripe Dashboard → mode adapté (Test puis **Live**)                                                                                        | Bascule visible en haut du Dashboard              |
| 2     | Webhooks → **Ajouter un endpoint**                                                                                                         | —                                                 |
| 3     | URL : `https://votre-domaine.fr/api/webhooks/stripe`                                                                                       | Même domaine que `NEXT_PUBLIC_SITE_URL`           |
| 4     | Cocher **les 4 événements** : `checkout.session.completed`, `checkout.session.expired`, `payment_intent.payment_failed`, `charge.refunded` | Liste enregistrée sur l’endpoint                  |
| 5     | Copier le **Signing secret** dans `STRIPE_WEBHOOK_SECRET` sur Vercel                                                                       | Redéploiement si nécessaire                       |
| 6     | Après un paiement test, ouvrir l’onglet **Événements** du webhook                                                                          | Chaque événement affiche **200** (pas 400 ni 500) |

**En test local :** voir [STRIPE_SANDBOX_CHECKLIST.md](./STRIPE_SANDBOX_CHECKLIST.md) (Stripe CLI `stripe listen --forward-to localhost:3000/api/webhooks/stripe`).

---

## A4. Contenu boutique et légal (prérequis)

**Qui :** dirigeante / admin.

| Étape | Action                                                                      | Résultat attendu                                     |
| ----- | --------------------------------------------------------------------------- | ---------------------------------------------------- |
| 1     | Admin → **Préparation** (`/admin/preparation`)                              | Feu vert global                                      |
| 2     | Admin → **Paramètres** : identité, SIRET, contact, médiation, hébergeur     | Bandeau rouge absent                                 |
| 3     | Admin → **Pages légales** : 6 pages sans placeholder                        | Checklist admin verte                                |
| 4     | Ouvrir `/mentions-legales`, `/cgv`, `/livraison-retours` sur le site public | Textes complets, pas de « Contenu à compléter »      |
| 5     | Catalogue : produits réels actifs (pas de démo)                             | Alertes « produit démo » absentes du tableau de bord |

Détail : [LEGAL_COMPLIANCE.md](./LEGAL_COMPLIANCE.md).

---

# Partie B — Scénarios métier (recette principale)

Pour chaque scénario : cochez **OK** / **KO**, notez le n° de commande et l’environnement.

## B1. Paiement test réussi

|       | Test                  | Préproduction | Production                   |
| ----- | --------------------- | ------------- | ---------------------------- |
| Carte | `4242 4242 4242 4242` | `4242…`       | Vraie carte, montant minimal |

**Étapes :**

1. Catalogue → fiche produit → choisir une taille en stock → **Ajouter au panier**
2. Panier → **Commander**
3. Renseigner coordonnées + e-mail de test
4. Choisir un **point relais** (carte Mondial Relay)
5. Cocher les **CGV** → **Commander et payer**
6. Payer sur la page Stripe

**Résultat attendu :**

- Redirection vers `/commande/succes` avec un **numéro de commande** (ex. `TK-…`)
- Admin → Commandes : statut **Payée**
- Dashboard Stripe : paiement **Réussi**
- Webhook `checkout.session.completed` → **200**

---

## B2. Paiement refusé

|       | Test                  | Préproduction | Production                                                       |
| ----- | --------------------- | ------------- | ---------------------------------------------------------------- |
| Carte | `4000 0000 0000 0002` | Idem          | Annuler sur Stripe **ou** laisser échouer sans bloquer le compte |

**Étapes :** même parcours que B1 jusqu’à la page Stripe, puis utiliser la carte de refus ou cliquer **Retour** sans payer.

**Résultat attendu :**

- Page `/commande/echec` ou message d’échec clair
- Admin : commande **non payée** / annulée
- Webhook `payment_intent.payment_failed` ou `checkout.session.expired` → **200**
- **Stock restauré** sur la fiche produit (quantité revenue à l’état d’avant)
- E-mail client « Paiement non abouti » (si `payment_failed` et e-mail configuré)

---

## B3. Stock décrémenté après paiement

**Prérequis :** noter le stock de la variante achetée en B1 **avant** le paiement.

**Résultat attendu :**

- Fiche produit publique : stock diminué du **nombre d’articles commandés**
- Admin → Produit → variante : même quantité
- **Un seul** décrément pour une commande payée (pas de double mouvement si le webhook est rejoué)

---

## B4. Panier / commande expirée (stock libéré)

**Objectif :** une commande restée en attente de paiement ne bloque pas le stock indéfiniment.

**Méthode simple (test) :**

1. Démarrer un checkout jusqu’à Stripe puis **fermer** sans payer
2. Attendre l’expiration de la session Stripe **ou** le webhook `checkout.session.expired`

**Méthode complémentaire (cron) :** le système annule les commandes `pending` dont la date d’expiration est dépassée (cron quotidien 3 h UTC). En test technique, voir [guide-test-production.md](./guide-test-production.md) §6.

**Résultat attendu :**

- Commande admin : **annulée** / paiement échoué
- Stock de la variante **libéré** (même quantité qu’avant la tentative)
- Webhook `checkout.session.expired` → **200** (si expiration Stripe)

---

## B5. E-mail client (confirmation)

**Déclencheur :** paiement réussi (B1).

**Résultat attendu :**

- E-mail reçu sous 1–2 min à l’adresse saisie au checkout
- Sujet du type « Confirmation de commande TK-… »
- Contenu : articles, total, point relais, **code de suivi** Tilouki
- Lien « Suivre ma commande » ouvre `/suivi-commande`

Checklist détaillée : [EMAIL_TEST_CHECKLIST.md](./EMAIL_TEST_CHECKLIST.md).

---

## B6. E-mail admin (nouvelle commande)

**Déclencheur :** même paiement que B1.

**Résultat attendu :**

- Boîte `ADMIN_EMAIL` reçoit « Nouvelle commande TK-… »
- Lien vers la commande dans l’admin fonctionne
- Coordonnées client visibles

---

## B7. Point relais au checkout

**Étapes :**

1. Au checkout, saisir un code postal (ex. `75001`)
2. Attendre l’affichage carte / liste Mondial Relay
3. Sélectionner un relais

**Résultat attendu :**

- Impossible de payer **sans** relais sélectionné
- Récapitulatif avant paiement : **nom et adresse du relais**, **frais de livraison**, **délai indicatif**
- Commande admin : mêmes informations relais

> En **test local** uniquement : `SHIPPING_DEV_MOCK=true` affiche des relais fictifs — **interdit en production**.

---

## B8. Génération d’étiquette (expédition)

**Qui :** admin, après commande payée.

**Étapes :**

1. Admin → Commandes → ouvrir la commande de test
2. Section **Expédition** → **Générer l’étiquette Mondial Relay** (ou enregistrer une étiquette Chronopost si ce transporteur est utilisé)
3. Télécharger le PDF si proposé

**Résultat attendu :**

- Message de succès avec numéro d’expédition ou lien PDF
- Bouton **Télécharger l’étiquette** disponible
- Après « Marquer expédiée » : statut commande **Expédiée**
- E-mail client « Votre commande … a été expédiée » avec numéro de suivi

---

## B9. Suivi commande (côté client)

**Étapes :**

1. Depuis l’e-mail de confirmation, cliquer le lien de suivi **ou** aller sur `/suivi-commande`
2. Saisir le **code de suivi** reçu par e-mail (et l’e-mail client si demandé)

**Résultat attendu :**

- Statut lisible : payée, en préparation, expédiée…
- Après expédition (B8) : numéro de suivi transporteur affiché
- Aucune donnée d’un autre client accessible

---

## B10. Annulation / remboursement

**Étapes :**

1. Dashboard Stripe (mode adapté) → paiement de la commande test → **Rembourser** (intégral)
2. Attendre le webhook

**Résultat attendu :**

- Webhook `charge.refunded` → **200**
- Admin : commande **Remboursée**
- Stock : quantité **restaurée** (remboursement total)
- E-mail client « Remboursement confirmé »

Guide : [guide-test-production.md](./guide-test-production.md) §5.

---

## B11. Produit avec stock = 1

**Prérequis :** un article avec **1 seule** unité sur une taille.

| Tentative                                          | Résultat attendu                                  |
| -------------------------------------------------- | ------------------------------------------------- |
| Acheter **1** unité et payer                       | Succès ; stock affiché **0** ou taille en rupture |
| Tenter d’en ajouter **2** au panier ou au checkout | Refus ou plafond à 1 avec message clair           |
| Après achat, nouvel ajout au panier                | Taille indisponible / rupture                     |

---

## B12. Produit désactivé

**Étapes :**

1. Admin → Produits → passer un article en **Brouillon** ou **Inactif**
2. Vérifier le site public

**Résultat attendu :**

- Le produit **n’apparaît plus** dans le catalogue ni la recherche
- L’URL directe `/produit/…` affiche une page 404 ou « indisponible »
- Un panier contenant encore l’article affiche une alerte ou empêche le paiement

---

## B13. Pages légales et conformité

**Pages à ouvrir (navigation privée) :**

| URL                        | Résultat attendu                        |
| -------------------------- | --------------------------------------- |
| `/mentions-legales`        | Identité, SIRET, hébergeur              |
| `/cgv`                     | Prix, paiement, livraison, rétractation |
| `/confidentialite`         | RGPD                                    |
| `/cookies`                 | Traceurs + bandeau cookies sur le site  |
| `/livraison-retours`       | Délais et retours                       |
| `/formulaire-retractation` | Formulaire téléchargeable / utilisable  |
| `/donnees-personnelles`    | Formulaire droits RGPD                  |

**Checkout sans légal complet (production) :** le paiement doit être **bloqué** (message explicite), pas de vente silencieuse.

---

## B14. Mobile

**Étapes :** refaire sur **téléphone réel** (ou émulateur ≤ 390 px de large) :

1. Accueil → catalogue → fiche produit
2. Ajout panier (drawer ou page panier)
3. Checkout complet jusqu’à Stripe (sans forcément payer en prod)
4. Menu bas de page, filtres catalogue, lecture des CGV

**Résultat attendu :**

- Pas de texte coupé ni bouton inaccessible
- Images et prix lisibles
- Sélection taille et relais utilisables au doigt
- Bandeau cookies et liens légaux du pied de page accessibles

Référence visuelle : captures dans `docs/retail-qa-*-mobile-390.png` si présentes.

---

## B15. SEO de base

**Qui :** testeur ou développeur (5–10 min).

| Contrôle         | Comment                                        | Résultat attendu                                        |
| ---------------- | ---------------------------------------------- | ------------------------------------------------------- |
| Titre de page    | Onglet navigateur sur `/` et une fiche produit | Titre explicite (boutique + produit)                    |
| `robots.txt`     | Ouvrir `/robots.txt`                           | Fichier présent, référence au sitemap                   |
| Sitemap          | Ouvrir `/sitemap.xml`                          | URLs accueil, catalogue, produits actifs, pages légales |
| Partage social   | Partager l’accueil (aperçu lien)               | Image et titre cohérents (Open Graph)                   |
| Admin non indexé | `/admin`                                       | Non référencé (pas d’indexation souhaitée)              |

Optionnel : [lighthouse-visual-qa.md](./lighthouse-visual-qa.md) (Performance et Accessibilité ≥ 90).

---

## B16. Archive propre (livraison du code)

**Qui :** développeur — **avant** de transmettre le projet à un tiers.

| Étape | Action                   | Résultat attendu                                                           |
| ----- | ------------------------ | -------------------------------------------------------------------------- |
| 1     | `npm run archive:clean`  | Fichier `archives/tilouki-AAAA-MM-JJ.zip` créé                             |
| 2     | `npm run verify:archive` | Aucune erreur                                                              |
| 3     | Contrôle manuel          | **Pas** de `.env.local`, `.vercel/`, `node_modules/`, `.next/` dans le zip |

**Interdit :** zip ou .rar manuel du dossier projet.

Détail : [livraison-archive.md](./livraison-archive.md).

---

# Partie C — Commandes finales (équipe technique)

Exécuter **dans cet ordre** sur la machine de référence (branche prête à déployer, dépendances installées) :

```bash
npm run audit:secrets
npm run check
npm run test
npm run build
npm run e2e
npm run verify:deploy:prod
```

| Commande             | Résultat attendu                                                                 |
| -------------------- | -------------------------------------------------------------------------------- |
| `audit:secrets`      | Aucun secret détecté dans les fichiers suivis par git                            |
| `check`              | Audit + types + lint + format + tests + build — tout vert                        |
| `test`               | Suite Vitest verte (règles métier, webhooks, déploiement…)                       |
| `build`              | Build Next.js sans erreur                                                        |
| `e2e`                | Parcours Playwright vert (accueil → checkout ; voir `e2e/sales-journey.spec.ts`) |
| `verify:deploy:prod` | Configuration production complète (voir Partie A2)                               |

> `e2e` utilise des mocks Stripe et livraison en local : il valide l’interface, pas les APIs réelles. Les scénarios B1–B10 sur l’URL de production restent **indispensables** pour le go-live.

---

# Grille de synthèse go-live

**Testeur :** **\*\*\*\***\_\_\_**\*\*\*\***  
**Date :** **\*\*\*\***\_\_\_**\*\*\*\***  
**URL production :** **\*\*\*\***\_\_\_**\*\*\*\***

| #   | Scénario              | Test | Préprod | Prod | Commentaire |
| --- | --------------------- | :--: | :-----: | :--: | ----------- |
| A1  | Vercel / HTTPS        |  ☐   |    ☐    |  ☐   |             |
| A2  | Variables prod        |  ☐   |    ☐    |  ☐   |             |
| A3  | Webhook Stripe        |  ☐   |    ☐    |  ☐   |             |
| A4  | Légal + préparation   |  ☐   |    ☐    |  ☐   |             |
| B1  | Paiement réussi       |  ☐   |    ☐    |  ☐   |             |
| B2  | Paiement refusé       |  ☐   |    ☐    |  ☐   |             |
| B3  | Stock décrémenté      |  ☐   |    ☐    |  ☐   |             |
| B4  | Panier expiré         |  ☐   |    ☐    |  ☐   |             |
| B5  | E-mail client         |  ☐   |    ☐    |  ☐   |             |
| B6  | E-mail admin          |  ☐   |    ☐    |  ☐   |             |
| B7  | Point relais          |  ☐   |    ☐    |  ☐   |             |
| B8  | Étiquette             |  ☐   |    ☐    |  ☐   |             |
| B9  | Suivi commande        |  ☐   |    ☐    |  ☐   |             |
| B10 | Remboursement         |  ☐   |    ☐    |  ☐   |             |
| B11 | Stock = 1             |  ☐   |    ☐    |  ☐   |             |
| B12 | Produit désactivé     |  ☐   |    ☐    |  ☐   |             |
| B13 | Pages légales         |  ☐   |    ☐    |  ☐   |             |
| B14 | Mobile                |  ☐   |    ☐    |  ☐   |             |
| B15 | SEO de base           |  ☐   |    ☐    |  ☐   |             |
| B16 | Archive propre        |  ☐   |    —    |  —   |             |
| C   | Commandes npm finales |  ☐   |    —    |  —   |             |

**Verdict :** ☐ Go-live validé ☐ Validé avec réserves ☐ Refusé — corrections requises

---

## En cas d’échec

1. Noter : **environnement**, **scénario**, **URL**, **heure**, **n° commande**, **capture d’écran**
2. Pour paiement / webhook : copier le statut HTTP depuis Stripe Dashboard → Webhooks
3. Transmettre à la personne technique avec cette grille

---

## Après le go-live (rappel)

- [ ] Rembourser ou traiter la commande test production si besoin
- [ ] Surveiller les webhooks Stripe et les logs Vercel les 48 premières heures
- [ ] Conserver une capture des webhooks **200** pour référence
- [ ] Ne jamais repartager une archive sans `npm run archive:clean`
