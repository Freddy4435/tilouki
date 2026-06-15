# Rotation des secrets après fuite d'archive

Checklist à suivre **immédiatement** si une archive zip, un **.rar manuel**, un dossier copié ou un dépôt partagé contenait `.env.local`, `.env.vercel`, le dossier `.vercel/` ou tout autre fichier d'environnement avec des valeurs réelles.

> Même envoyé à une personne de confiance, vous ne contrôlez plus la diffusion. Régénérez les clés **avant** tout redéploiement.

## 1. Contenir la fuite

- [ ] Demander la **suppression** de l'archive chez le destinataire (e-mail, cloud, messagerie).
- [ ] Ne pas renvoyer une nouvelle archive avant d'avoir terminé la rotation.
- [ ] Si le fichier a été commité dans git : le retirer du dépôt ne suffit pas — purger l'historique (`git filter-repo`) ou recréer un dépôt privé.

## 2. Régénérer les clés (dans l'ordre)

Cochez chaque service dont la variable était présente dans le fichier fuité.

### Supabase

- [ ] `SUPABASE_SERVICE_ROLE_KEY` — Dashboard Supabase → Settings → API → régénérer la clé service role
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` — si régénérée avec la service role (rotation JWT)
- [ ] Mettre à jour Vercel (Production + Preview) et votre `.env.local` local

### Stripe

- [ ] `STRIPE_SECRET_KEY` — Dashboard Stripe → Développeurs → Clés API → Roll key
- [ ] `STRIPE_WEBHOOK_SECRET` — Webhooks → endpoint `/api/webhooks/stripe` → Roll secret
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` — si la clé secrète live a été compromise

### E-mails (Resend ou SMTP)

- [ ] `RESEND_API_KEY` — Resend → API Keys → révoquer et créer une nouvelle clé
- [ ] Ou `SMTP_PASSWORD` (et utilisateur SMTP si applicable)

### Mondial Relay

- [ ] `MONDIAL_RELAY_PRIVATE_KEY` — contacter Mondial Relay ou régénérer selon votre contrat
- [ ] Vérifier `MONDIAL_RELAY_ENSEIGNE` / `MONDIAL_RELAY_BRAND_ID` si exposé

### Chronopost (si configuré)

- [ ] `CHRONOPOST_PASSWORD` — contacter Chronopost ou changer le mot de passe API

### Upstash (rate limiting)

- [ ] `UPSTASH_REDIS_REST_TOKEN` — Console Upstash → Redis → régénérer le token REST

### Application

- [ ] `CRON_SECRET` — générer une nouvelle valeur aléatoire longue :

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 3. Redéployer et valider

- [ ] Variables mises à jour sur **Vercel** (tous les environnements utilisés)
- [ ] `.env.local` local mis à jour (ne jamais le re-partager)
- [ ] **Redéploiement** Vercel déclenché
- [ ] `npm run verify:deploy:prod` vert
- [ ] Parcours d'achat test (paiement → commande admin → e-mail)
- [ ] Webhooks Stripe : aucune erreur dans le dashboard Stripe
- [ ] Cron `/api/cron/expire-pending-orders` : répond `200` (logs Vercel)

## 4. Prévenir une récidive

- [ ] Ne **jamais** partager un .rar / zip créé à la main — uniquement `npm run delivery:clean`
- [ ] `npm run verify:archive` vert avant livraison
- [ ] `npm run audit:secrets` vert avant chaque release (`npm run check`)
- [ ] Vérifier que `.env*` (sauf `.env.example`) et `.vercel/` restent dans `.gitignore`

Guide : [livraison-archive.md](./livraison-archive.md)

---

Voir aussi la section [Rotation des clés](checklist-mise-en-production.md#rotation-des-clés) pour le détail pas à pas par service.
