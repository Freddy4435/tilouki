# Checklist de recette — Parcours client Tilouki

**Site testé :** https://tilouki.vercel.app (ou votre environnement local)  
**Durée estimée :** 20 à 30 minutes  
**Public :** testeurs métier, support, direction — aucune compétence technique requise

---

## Avant de commencer

Préparez ces éléments une seule fois :

| Élément             | Détail                                                                                                          |
| ------------------- | --------------------------------------------------------------------------------------------------------------- |
| Navigateur          | Chrome ou Firefox, fenêtre normale (pas forcément mobile)                                                       |
| Carte bancaire test | `4242 4242 4242 4242` — date future, CVC quelconque (ex. 123)                                                   |
| E-mail de test      | Une adresse que vous consultez (ex. votre boîte perso)                                                          |
| Téléphone           | Numéro valide (10 chiffres minimum)                                                                             |
| Compte admin        | Identifiants pour https://tilouki.vercel.app/admin                                                              |
| Produit en stock    | Au moins un article **publié** avec stock ≥ 2 sur une taille connue (notez la taille et le stock avant le test) |

**Conseil :** notez sur un papier le **nom du produit**, la **taille choisie** et le **stock affiché** avant d’acheter. Vous en aurez besoin aux étapes 14 et 15.

---

## Parcours client (15 étapes)

Cochez chaque case une fois le résultat vérifié. En cas d’échec, décrivez ce que vous voyiez à l’écran.

### 1. Visiter l’accueil

- [ ] La page d’accueil s’affiche sans erreur
- [ ] Le logo et le menu (Catalogue, Panier…) sont visibles
- [ ] Des produits ou des liens vers le catalogue sont proposés
- [ ] Le pied de page (mentions légales, contact…) est présent

**Résultat attendu :** première impression claire, site chargé en moins de quelques secondes.

---

### 2. Aller au catalogue

- [ ] Cliquer sur **Catalogue** dans le menu
- [ ] La page liste des vêtements enfants
- [ ] Le nombre de produits affiché est cohérent (pas « 0 produit » sauf catalogue vide volontaire)

**Résultat attendu :** URL du type `/catalogue`, grille de produits visible.

---

### 3. Affiner la recherche (taille / filtres)

- [ ] Utiliser les **filtres** à gauche (catégorie, genre, prix…) pour réduire la liste
- [ ] Repérer sur les **cartes produits** les badges de **tailles disponibles**
- [ ] Choisir un produit qui propose la **taille que vous comptez commander**

> **Note :** la taille définitive se choisit sur la fiche produit (étape 5). Ici, l’objectif est de trouver un article disponible dans la bonne taille.

**Résultat attendu :** la liste se met à jour ; au moins un produit correspond à votre besoin.

---

### 4. Ouvrir une fiche produit

- [ ] Cliquer sur un produit
- [ ] La photo, le prix et la description s’affichent
- [ ] Les tailles / âges disponibles sont listés
- [ ] Le bouton d’ajout au panier est visible (peut être grisé tant qu’aucune taille n’est choisie)

**Résultat attendu :** fiche complète, prix en euros lisible.

---

### 5. Choisir une taille

- [ ] Cliquer sur une **taille en stock** (bouton actif, pas « rupture »)
- [ ] La taille sélectionnée est bien mise en évidence
- [ ] Le bouton **Ajouter au panier** devient utilisable

**Résultat attendu :** impossible d’ajouter sans taille ; message clair si taille en rupture.

---

### 6. Ajouter au panier

- [ ] Cliquer **Ajouter au panier**
- [ ] Un message de confirmation apparaît (notification ou texte)
- [ ] L’icône / lien **Panier** indique au moins 1 article

**Résultat attendu :** l’article apparaît dans le panier avec le bon nom, la bonne taille et le bon prix.

---

### 7. Modifier la quantité

- [ ] Aller sur la page **Panier** (`/panier`)
- [ ] Augmenter la quantité (ex. passer de 1 à 2)
- [ ] Vérifier que le **sous-total** et le **total** se mettent à jour
- [ ] Diminuer la quantité et vérifier à nouveau les montants
- [ ] (Optionnel) Tenter une quantité supérieure au stock → message d’alerte ou plafond

**Résultat attendu :** calculs cohérents ; pas de montant figé ou aberrant.

---

### 8. Aller à la commande

- [ ] Depuis le panier, cliquer **Commander** ou équivalent
- [ ] Arriver sur la page **Commande** (`/commande`)
- [ ] Le récapitulatif du panier (articles, livraison, total) est affiché

**Résultat attendu :** même contenu que le panier, frais de livraison en point relais visibles.

---

### 9. Remplir les informations client

- [ ] Saisir **prénom**, **nom**, **e-mail**, **téléphone**
- [ ] Laisser un champ obligatoire vide → un message d’erreur en français apparaît
- [ ] Corriger et valider que les erreurs disparaissent

**Résultat attendu :** formulaire bloque la suite tant que les champs ne sont pas corrects.

---

### 10. Choisir un point relais

- [ ] Saisir un **code postal** (ex. 75001) et lancer la recherche de relais
- [ ] Une liste de points relais s’affiche sur la carte ou en liste
- [ ] Sélectionner un relais → son nom et son adresse apparaissent dans le récapitulatif

**Résultat attendu :** impossible de payer sans relais sélectionné.

---

### 11. Accepter les conditions générales (CGV)

- [ ] Cocher la case d’acceptation des **CGV**
- [ ] Sans cette case, le bouton de paiement reste bloqué ou un message s’affiche
- [ ] Un lien vers les CGV est cliquable et ouvre la page légale

**Résultat attendu :** paiement impossible sans acceptation explicite.

---

### 12. Payer via Stripe (mode test)

- [ ] Cliquer **Payer** (ou équivalent)
- [ ] Redirection vers la page de paiement **Stripe** (logo Stripe, formulaire carte)
- [ ] Payer avec la carte test `4242 4242 4242 4242`
- [ ] La transaction se termine sans erreur

**Résultat attendu :** pas de blocage ; retour automatique vers le site Tilouki.

---

### 13. Recevoir la confirmation

- [ ] Arriver sur la page **succès** (`/commande/succes`)
- [ ] Un **numéro de commande** est affiché (notez-le)
- [ ] (Si e-mail configuré) Recevoir un e-mail de confirmation à l’adresse saisie

**Résultat attendu :** message rassurant, numéro de commande lisible et unique.

---

### 14. Vérifier que le stock a diminué

**Méthode simple (sans base de données) :**

- [ ] Revenir sur la **fiche produit** achetée
- [ ] Vérifier que le stock affiché pour la taille commandée a **baissé** du nombre d’articles achetés
- [ ] Si vous aviez acheté tout le stock restant, la taille doit apparaître en **rupture**

**Méthode admin (si accès back-office produits) :**

- [ ] Admin → Produits → ouvrir le produit
- [ ] Stock de la variante = ancien stock − quantité commandée

**Résultat attendu :** le stock ne doit **pas** rester inchangé après un paiement réussi.

---

### 15. Vérifier la commande côté admin

- [ ] Se connecter à **Admin** → **Commandes** (`/admin/commandes`)
- [ ] Trouver la commande par numéro ou e-mail client
- [ ] Statut **payée** (ou équivalent « Payé »)
- [ ] Montant, articles, tailles et point relais correspondent à ce que vous avez commandé
- [ ] Ouvrir le détail de la commande : informations client et livraison correctes

**Résultat attendu :** la commande est traçable et prête pour la préparation / expédition.

---

## Scénarios complémentaires (recommandés)

| Scénario        | Action                                     | Résultat attendu                                              |
| --------------- | ------------------------------------------ | ------------------------------------------------------------- |
| Panier vide     | Aller à `/commande` sans article           | Redirection ou message invitant à remplir le panier           |
| Paiement annulé | Sur Stripe, cliquer « Retour »             | Page d’échec ou retour commande ; commande non payée en admin |
| Double achat    | Rejouer le parcours avec le même produit   | Stock décrémenté une seule fois par commande payée            |
| Stock épuisé    | Commander la dernière unité puis réessayer | Deuxième tentative refusée ou taille indisponible             |

---

## Grille de synthèse

| #   | Étape            | OK  | KO  | Commentaire |
| --- | ---------------- | :-: | :-: | ----------- |
| 1   | Accueil          |  ☐  |  ☐  |             |
| 2   | Catalogue        |  ☐  |  ☐  |             |
| 3   | Filtres / taille |  ☐  |  ☐  |             |
| 4   | Fiche produit    |  ☐  |  ☐  |             |
| 5   | Choix taille     |  ☐  |  ☐  |             |
| 6   | Ajout panier     |  ☐  |  ☐  |             |
| 7   | Quantité         |  ☐  |  ☐  |             |
| 8   | Page commande    |  ☐  |  ☐  |             |
| 9   | Infos client     |  ☐  |  ☐  |             |
| 10  | Point relais     |  ☐  |  ☐  |             |
| 11  | CGV              |  ☐  |  ☐  |             |
| 12  | Paiement Stripe  |  ☐  |  ☐  |             |
| 13  | Confirmation     |  ☐  |  ☐  |             |
| 14  | Stock            |  ☐  |  ☐  |             |
| 15  | Admin            |  ☐  |  ☐  |             |

**Testeur :** **\*\***\_\_\_**\*\***  
**Date :** **\*\***\_\_\_**\*\***  
**Environnement :** production / préproduction / local  
**Verdict global :** ☐ Validé ☐ Validé avec réserves ☐ Refusé

---

## Tests automatiques (équipe technique)

Les règles métier ci-dessus sont aussi couvertes par des tests lancés avec :

```bash
npm run test
```

| Fichier                                             | Ce qui est vérifié                                            |
| --------------------------------------------------- | ------------------------------------------------------------- |
| `src/lib/cart/calculations.test.ts`                 | Sous-total, total, quantités, alertes stock panier            |
| `src/lib/shipping/rates.test.ts`                    | Poids panier, tranches de frais de livraison par transporteur |
| `src/lib/validations/checkout.test.ts`              | Formulaire client, relais, CGV, payload API                   |
| `src/lib/admin/order-transitions.test.ts`           | Changements de statut commande (préparation, expédition…)     |
| `src/app/api/checkout/create-session/route.test.ts` | Réponses API checkout (succès, erreurs, limite de requêtes)   |

Pour les tests Stripe détaillés (webhooks, sandbox), voir aussi [STRIPE_SANDBOX_CHECKLIST.md](./STRIPE_SANDBOX_CHECKLIST.md).

---

## En cas de problème

1. Noter l’**étape**, l’**URL** et une **capture d’écran**
2. Pour les étapes 12–14 : noter l’**heure** et le **numéro de commande**
3. Transmettre au développeur avec le verdict de la grille de synthèse
