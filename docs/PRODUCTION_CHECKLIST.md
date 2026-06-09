# Checklist mise en production — Tilouki

Cocher chaque point avant d'ouvrir la boutique au public.

## Infrastructure

- [ ] Domaine `tilouki.fr` (ou votre domaine) branché sur Vercel
- [ ] HTTPS actif (certificat Let's Encrypt automatique Vercel)
- [ ] `NEXT_PUBLIC_SITE_URL` = URL production (`https://tilouki.fr`)
- [ ] Variables d'environnement Vercel configurées (voir `.env.example`)
- [ ] Build Vercel réussi (`npm run check` en local avant push)

## Supabase

- [ ] Projet Supabase production créé (région EU recommandée)
- [ ] Toutes les migrations appliquées (`supabase db push`)
- [ ] **Ne pas** exécuter `seed.dev.sql` en production
- [ ] RLS vérifié (tables sensibles : `orders`, `admin_users`, `inventory_movements`)
- [ ] Bucket `product-images` public en lecture, écriture admin uniquement
- [ ] Sauvegarde / plan de backup base de données activé (Supabase Dashboard → Database → Backups)
- [ ] Administrateur créé dans `admin_users` (voir README)

## Stripe

- [ ] Compte Stripe activé (mode **Live**)
- [ ] Clés Live : `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- [ ] Webhook Live pointant vers `https://votre-domaine.fr/api/webhooks/stripe`
- [ ] Événements webhook : `checkout.session.completed`, `checkout.session.expired`, `payment_intent.payment_failed`, `charge.refunded`
- [ ] `CRON_SECRET` configuré + cron Vercel actif (`/api/cron/expire-pending-orders`, toutes les heures)
- [ ] `STRIPE_WEBHOOK_SECRET` du endpoint Live renseigné dans Vercel
- [ ] Test commande réelle petit montant (puis remboursement si besoin)

## Mondial Relay

- [ ] `MONDIAL_RELAY_ENSEIGNE` et `MONDIAL_RELAY_PRIVATE_KEY` configurés
- [ ] `NEXT_PUBLIC_MONDIAL_RELAY_BRAND_ID` = même code enseigne (widget)
- [ ] `SHIPPING_DEV_MOCK` absent ou `false` en production
- [ ] Test recherche point relais sur le checkout production
- [ ] Grilles de livraison renseignées dans l'admin (ou migration `shipping_rates`)

## E-mails

- [ ] `RESEND_API_KEY` + domaine expéditeur vérifié dans Resend
- [ ] `FROM_EMAIL` = adresse vérifiée (ex. `commandes@tilouki.fr`)
- [ ] `ADMIN_EMAIL` = boîte de réception des notifications commande
- [ ] Test e-mail confirmation commande
- [ ] Test e-mail notification admin
- [ ] Test e-mail expédition (depuis admin)

## Contenu boutique

- [ ] Paramètres boutique complétés (`/admin/parametres`) : identité, SIRET, hébergeur, médiation
- [ ] Produits importés ou créés, statut **actif**
- [ ] Images produits uploadées
- [ ] Stock vérifié (test décrément après commande payée)
- [ ] Pages légales personnalisées et validées (`/admin/pages-legales`)
- [ ] Bandeau cookies fonctionnel

## Tests finaux

- [ ] Parcours complet : catalogue → panier → checkout → paiement → e-mail
- [ ] Suivi commande avec token reçu par e-mail
- [ ] Admin : changement statut commande (préparation → expédiée)
- [ ] `npm run check` sans erreur en local
- [ ] Lighthouse / performance acceptable sur pages clés

## Post-lancement

- [ ] Monitoring erreurs (Vercel Logs, Supabase Logs)
- [ ] Alertes Stripe webhook en cas d'échec
- [ ] Procédure RGPD documentée (`/donnees-personnelles`)
