# Checklist de test e-mails — Tilouki

Objectif : chaque étape importante du parcours client/admin envoie un **e-mail lisible et délivrable**.

Prérequis : [email-deliverability.md](./email-deliverability.md) (SPF/DKIM/DMARC), variables dans [variables-production.md](./variables-production.md).

---

## Critère d'acceptation

| Étape           | Destinataire | Déclencheur                             | E-mail attendu          |
| --------------- | ------------ | --------------------------------------- | ----------------------- |
| Paiement réussi | Client       | Webhook `checkout.session.completed`    | Confirmation commande   |
| Paiement réussi | Admin        | Idem                                    | Nouvelle commande payée |
| Paiement échoué | Client       | Webhook `payment_intent.payment_failed` | Paiement non abouti     |
| Expédition      | Client       | Admin → « Marquer expédiée »            | Colis expédié + suivi   |
| Remboursement   | Client       | Webhook `charge.refunded` (intégral)    | Remboursement confirmé  |

Chaque envoi doit apparaître dans Resend → **Logs** (ou la file SMTP) avec statut **Delivered** ou équivalent.

---

## Préparation

```bash
npm run verify:deploy          # ou verify:deploy:prod
npm run email:preview          # export HTML dans .email-preview/
```

- [ ] `RESEND_API_KEY` **ou** SMTP complet (`HOST` + `USER` + `PASSWORD`)
- [ ] `FROM_EMAIL` = adresse vérifiée (ex. `commandes@tilouki.fr`)
- [ ] `ADMIN_EMAIL` = votre boîte admin
- [ ] (Dev) `EMAIL_DEV_REDIRECT=votre.email@test.com` pour capter tous les envois client

### Preview sans envoi

- [ ] `npm run dev` → [http://localhost:3000/dev/emails](http://localhost:3000/dev/emails)
- [ ] Vérifier les 5 modèles : sujet, montants, point relais, liens CTA

---

## 1. Confirmation commande (client)

**Déclencheur** : paiement Stripe sandbox réussi.

- [ ] Effectuer un achat test ([STRIPE_SANDBOX_CHECKLIST.md](./STRIPE_SANDBOX_CHECKLIST.md))
- [ ] E-mail reçu sous 1–2 min
- [ ] Sujet : `Confirmation de commande TK-…`
- [ ] Contenu : articles, total TTC, point relais, code de suivi Tilouki
- [ ] Bouton « Suivre ma commande » fonctionne
- [ ] Version texte lisible (pas de HTML brut)

**Logs serveur** : `[secure] [email] E-mail envoyé` — adresses masquées (`[email]`), pas de corps HTML.

---

## 2. Notification admin

**Déclencheur** : même webhook que §1.

- [ ] `ADMIN_EMAIL` reçoit `[Tilouki] Nouvelle commande TK-…`
- [ ] Nom, e-mail et téléphone client visibles
- [ ] Lien « Ouvrir la commande dans l'administration » → `/admin/commandes/{id}`

Si absent : vérifier `ADMIN_EMAIL` et les logs `[email] E-mail admin non configuré`.

---

## 3. Paiement échoué (client)

**Déclencheur** : carte test refusée `4000 0000 0000 0002` ou webhook rejoué.

```bash
stripe trigger payment_intent.payment_failed
```

- [ ] E-mail « Paiement non abouti » reçu
- [ ] Montant commande affiché
- [ ] Mention stock réservé temporairement
- [ ] Lien vers `/commande`
- [ ] Commande en base : `failed` / stock libéré

---

## 4. Expédition (client)

**Déclencheur** : admin → commande payée → « Marquer expédiée » (après étiquette si applicable).

- [ ] Sujet : `Votre commande TK-… a été expédiée`
- [ ] Numéro de suivi transporteur présent
- [ ] Lien « Suivre mon colis » (Mondial Relay / Chronopost)
- [ ] Point relais rappelé

> L'e-mail n'est **pas** envoyé à la seule génération d'étiquette — uniquement au marquage expédié.

---

## 5. Remboursement (client)

**Déclencheur** : remboursement intégral depuis Stripe Dashboard (sandbox ou live test).

- [ ] Webhook `charge.refunded` → HTTP 200
- [ ] E-mail « Remboursement confirmé »
- [ ] Montant remboursé affiché
- [ ] Stock restauré en base

---

## 6. Délivrabilité

- [ ] [mail-tester.com](https://www.mail-tester.com) : score ≥ 8/10
- [ ] SPF, DKIM, DMARC **Pass** (voir [email-deliverability.md](./email-deliverability.md))
- [ ] E-mail n'atterrit pas dans spam (Gmail + Outlook)

---

## 7. Sécurité des logs

- [ ] Aucune adresse e-mail en clair dans les logs Vercel (`[email]` attendu)
- [ ] Aucune clé API (`re_…`, `sk_…`) dans les messages d'erreur
- [ ] Corps HTML jamais loggé

Test unitaire : `src/lib/security/log.test.ts`.

---

## Dépannage

| Problème             | Solution                                 |
| -------------------- | ---------------------------------------- |
| `dev-skipped`        | Ajouter `RESEND_API_KEY` ou SMTP         |
| Resend 403           | Vérifier domaine dans Dashboard          |
| Admin silencieux     | `ADMIN_EMAIL` manquant                   |
| Client OK, admin non | Vérifier spam + `ADMIN_EMAIL`            |
| Preview local        | `/dev/emails` ou `npm run email:preview` |
