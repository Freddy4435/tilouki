# Guide de test production (petit montant)

Procédure pour valider paiement, webhooks, e-mails et libération stock **en mode Stripe Live**, avec un montant minimal (ex. 1 € ou le produit le moins cher).

**Prérequis** : compte Stripe activé, variables prod sur Vercel, `npm run verify:deploy:prod` OK.

---

## 1. Préparation (15 min)

### Variables

- [ ] `STRIPE_SECRET_KEY` = `sk_live_…`
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` = `pk_live_…`
- [ ] `STRIPE_WEBHOOK_SECRET` = `whsec_…` (endpoint **Live**)
- [ ] `NEXT_PUBLIC_SITE_URL` = `https://votre-domaine.fr`
- [ ] `RESEND_API_KEY` + domaine expéditeur vérifié (ou SMTP)
- [ ] `FROM_EMAIL`, `ADMIN_EMAIL` renseignés
- [ ] `CRON_SECRET` (32+ caractères)
- [ ] Mondial Relay configuré, `SHIPPING_DEV_MOCK` absent

```bash
npm run verify:deploy:prod
```

### Boutique

- [ ] Au moins un produit **actif** avec stock ≥ 1
- [ ] Tarifs livraison configurés (`/admin/livraison`)
- [ ] Paramètres boutique complétés (`/admin/parametres`)

### Webhook Stripe Live

Dashboard Stripe (mode Live) → Webhooks → votre endpoint :

| Événement | Rôle |
|-----------|------|
| `checkout.session.completed` | Commande payée + e-mails |
| `checkout.session.expired` | Annulation + stock libéré |
| `payment_intent.payment_failed` | Échec paiement + e-mail client |
| `charge.refunded` | Remboursement + stock restauré |

URL : `https://votre-domaine.fr/api/webhooks/stripe`

---

## 2. Test paiement réussi (~5 min)

1. Ouvrir le site en navigation privée : `https://votre-domaine.fr`
2. Ajouter **un article peu cher** au panier
3. Checkout : renseigner vos coordonnées + **votre vraie adresse e-mail**
4. Choisir un point relais (carte Mondial Relay)
5. Payer avec votre **vraie carte** (montant minimal)
6. Vérifier la page de confirmation / suivi commande

### Contrôles post-paiement

| Contrôle | Où vérifier | Attendu |
|----------|-------------|---------|
| Paiement Stripe | Dashboard Stripe → Paiements | Statut **Réussi** |
| Webhook | Dashboard → Webhooks → événements | `checkout.session.completed` → **200** |
| Commande admin | `/admin/commandes` | Statut payée / en préparation |
| Stock | Fiche produit admin | Stock décrémenté |
| E-mail client | Votre boîte mail | « Confirmation de commande … » |
| E-mail admin | `ADMIN_EMAIL` | Notification nouvelle commande |
| Suivi client | Lien / code dans l'e-mail | Page `/suivi-commande` accessible |

---

## 3. Test expédition (~3 min)

1. Admin → commande de test → **Expédition**
2. Générer l'étiquette Mondial Relay **ou** enregistrer un suivi manuel (Chronopost)
3. Vérifier l'e-mail client « Votre commande … a été expédiée »
4. Vérifier le numéro de suivi et le lien transporteur

---

## 4. Test paiement échoué (optionnel, ~5 min)

Objectif : valider `payment_intent.payment_failed` et l'e-mail d'échec.

1. Nouveau parcours checkout jusqu'à Stripe
2. Utiliser une carte de **déclin** Stripe Live si disponible sur votre compte, **ou** annuler sur la page Stripe sans payer puis attendre l'expiration de session
3. Vérifier :
   - Webhook `payment_intent.payment_failed` ou `checkout.session.expired` en 200
   - Commande annulée dans l'admin
   - Stock libéré (quantité revenue)
   - E-mail « Paiement non abouti » (si `payment_failed`)

> En sandbox, carte `4000 0000 0000 0002` (déclin). En Live, préférer un montant minimal puis remboursement plutôt qu'une carte invalide.

---

## 5. Test remboursement (~3 min)

1. Dashboard Stripe → Paiement de test → **Rembourser** (intégral)
2. Vérifier webhook `charge.refunded` → 200
3. Commande admin : statut remboursé
4. Stock produit : quantité restaurée (remboursement intégral uniquement)

---

## 6. Test cron libération stock (optionnel)

Pour les commandes `pending` expirées sans webhook Stripe :

```powershell
# Remplacer DOMAIN et CRON_SECRET
Invoke-WebRequest -Uri "https://votre-domaine.fr/api/cron/expire-pending-orders" `
  -Headers @{ Authorization = "Bearer VOTRE_CRON_SECRET" }
```

Réponse attendue : `{"ok":true,"expired":0}` (ou `expired` > 0 si des commandes ont expiré).

---

## 7. Nettoyage

- [ ] Rembourser la commande test dans Stripe si vous ne souhaitez pas la conserver
- [ ] Archiver ou annuler la commande test en admin
- [ ] Conserver une capture d'écran des webhooks 200 pour référence

---

## Dépannage rapide

| Problème | Action |
|----------|--------|
| Webhook 400 | Vérifier `STRIPE_WEBHOOK_SECRET` (secret de l'endpoint **Live**, pas test) |
| Pas d'e-mail | Vérifier Resend (domaine vérifié) ou SMTP ; logs Vercel |
| Points relais vides | `MONDIAL_RELAY_*` + pas de `SHIPPING_DEV_MOCK` |
| Paiement indisponible | Clés Live dans Vercel + redéploiement |
| Stock non libéré | Vérifier webhooks expired/failed ; déclencher le cron manuellement |

Voir aussi [variables-production.md](./variables-production.md) et [deploiement-vercel.md](./deploiement-vercel.md).
