# Checklist de test Stripe Sandbox — Tilouki

Environnement : [Stripe Dashboard (mode test)](https://dashboard.stripe.com/test) + [Stripe CLI](https://stripe.com/docs/stripe-cli) pour les webhooks locaux.

## Prérequis

- [ ] Variables Vercel / `.env.local` renseignées :
  - `STRIPE_SECRET_KEY` (sk_test_…)
  - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (pk_test_…)
  - `STRIPE_WEBHOOK_SECRET` (whsec_… — Stripe CLI ou endpoint Dashboard)
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Au moins un produit actif avec stock > 0 dans Supabase
- [ ] Webhook Stripe pointant vers `/api/webhooks/stripe` avec les événements :
  - `checkout.session.completed`
  - `checkout.session.expired`
  - `payment_intent.payment_failed`
  - `charge.refunded` (optionnel remboursements)

### Webhook local (développement)

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copier le `whsec_…` affiché dans `STRIPE_WEBHOOK_SECRET`.

---

## 1. Prix et stock côté serveur

- [ ] Ouvrir DevTools → Network → `POST /api/checkout/create-session`
- [ ] Vérifier que le body ne contient **que** `customer`, `relayPoint`, `items[{ variantId, quantity }]`
- [ ] Tenter d'ajouter `unitPriceCents` ou `totalCents` dans le body → rejet Zod (`.strict()`)
- [ ] Modifier le prix dans le panier local (localStorage) → le montant Stripe reste celui de Supabase

---

## 2. Flux checkout nominal

- [ ] Ajouter un article au panier
- [ ] Aller sur `/commande`, remplir le formulaire + point relais
- [ ] Cliquer « Payer » → redirection Stripe Checkout
- [ ] Vérifier en base **avant paiement** :
  - `orders.status` = `pending`
  - `orders.payment_status` = `pending`
  - `stripe_session_id` renseigné
  - `inventory_movements` type `sale` avec note `order:{orderId}:…`
- [ ] Payer avec la carte test `4242 4242 4242 4242` (date future, CVC quelconque)
- [ ] Webhook `checkout.session.completed` reçu (HTTP 200)
- [ ] Vérifier en base **après paiement** :
  - `orders.status` = `paid`
  - `orders.payment_status` = `paid`
  - `stripe_payment_intent_id` renseigné
  - **Un seul** jeu de mouvements `sale` pour cette commande (pas de double décrément)
- [ ] Page `/commande/succes?session_id=…` affiche le bon numéro de commande
- [ ] E-mail de confirmation reçu (si Resend/SMTP configuré)

---

## 3. Idempotence webhook

- [ ] Repérer l'`event.id` du webhook `checkout.session.completed` dans les logs Stripe
- [ ] Rejouer le même événement :

```bash
stripe events resend evt_XXXXX
```

- [ ] Réponse HTTP 200, log « Événement déjà traité (idempotent) »
- [ ] Commande toujours `paid`, stock inchangé
- [ ] Table `stripe_webhook_events` : une seule ligne pour cet `event.id`

---

## 4. Session expirée

- [ ] Créer une session checkout puis la laisser expirer (ou expirer manuellement dans le Dashboard)
- [ ] Webhook `checkout.session.expired` reçu
- [ ] Commande : `status` = `cancelled`, `payment_status` = `failed`
- [ ] Mouvements `cancel` avec note `cancel-pending:{orderId}:…` → stock restauré

---

## 5. Paiement refusé

- [ ] Utiliser la carte test de refus `4000 0000 0000 0002`
- [ ] Webhook `payment_intent.payment_failed` reçu
- [ ] Commande annulée + stock libéré (comme session expirée)
- [ ] Rejouer le webhook → pas de double libération

---

## 6. Annulation utilisateur (cancel_url)

- [ ] Démarrer un checkout puis cliquer « Retour » sur Stripe
- [ ] Redirection vers `/commande/echec`
- [ ] Si session Stripe échoue à la création : commande annulée côté serveur (`markOrderPaymentFailed`)

---

## 7. Stock insuffisant

- [ ] Mettre le stock d'une variante à 1
- [ ] Tenter d'acheter quantité 2 → `POST /api/checkout/create-session` retourne 400
- [ ] Aucune commande `pending` créée

---

## 8. Montant incohérent (sécurité)

- [ ] (Test avancé) Modifier manuellement `orders.total_cents` en base après création pending
- [ ] Compléter le paiement Stripe
- [ ] Webhook doit échouer (500) avec log « Montant Stripe ≠ total commande »
- [ ] Commande reste `pending` → rollback idempotence permet retry après correction

---

## 9. Signature webhook

- [ ] `POST /api/webhooks/stripe` sans header `stripe-signature` → 400
- [ ] Body modifié avec mauvaise signature → 400 « Signature invalide »
- [ ] Aucune commande modifiée

---

## 10. Remboursement (optionnel)

- [ ] Rembourser le paiement dans Stripe Dashboard (remboursement total)
- [ ] Webhook `charge.refunded` → `payment_status` = `refunded`
- [ ] Stock restauré via mouvements `cancel` note `refund:order:{orderId}:…`
- [ ] Rejouer le webhook → idempotent

---

## Cartes de test utiles

| Scénario            | Numéro              |
|---------------------|---------------------|
| Paiement réussi     | 4242 4242 4242 4242 |
| Paiement refusé     | 4000 0000 0000 0002 |
| 3D Secure requis    | 4000 0027 6000 3184 |

---

## Commandes de vérification rapide

```bash
npm run check
stripe trigger checkout.session.completed
stripe trigger checkout.session.expired
stripe trigger payment_intent.payment_failed
```
