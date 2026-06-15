# Délivrabilité e-mail — SPF, DKIM, DMARC

Guide pour que les e-mails transactionnels Tilouki (confirmation commande, expédition, etc.) arrivent en **boîte de réception** et non en spam.

**Fournisseur recommandé** : [Resend](https://resend.com) avec un domaine personnalisé (`commandes@votredomaine.fr`).

Documentation complémentaire : [EMAIL_TEST_CHECKLIST.md](./EMAIL_TEST_CHECKLIST.md), [variables-production.md](./variables-production.md).

---

## 1. Choisir le domaine d'envoi

| Choix                       | Délivrabilité   | Usage Tilouki  |
| --------------------------- | --------------- | -------------- |
| `onboarding@resend.dev`     | Test uniquement | Sandbox / dev  |
| `commandes@votredomaine.fr` | Production      | **Recommandé** |

Le `FROM_EMAIL` configuré dans Vercel doit correspondre à une adresse **vérifiée** chez Resend (domaine ou sous-domaine).

---

## 2. Resend — configuration domaine

1. [Resend Dashboard](https://resend.com/domains) → **Add Domain**
2. Saisir votre domaine (ex. `tilouki.fr` ou `mail.tilouki.fr`)
3. Resend affiche les enregistrements DNS à créer chez votre registrar (OVH, Gandi, Cloudflare, etc.)
4. Attendre le statut **Verified** (quelques minutes à 48 h)
5. Utiliser `FROM_EMAIL=commandes@tilouki.fr` (ou le sous-domaine choisi)

---

## 3. SPF (Sender Policy Framework)

**Rôle** : indique quels serveurs sont autorisés à envoyer des e-mails pour votre domaine.

Resend fournit un enregistrement **TXT** sur le domaine d'envoi, par exemple :

| Type | Nom / Host          | Valeur (exemple)                    |
| ---- | ------------------- | ----------------------------------- |
| TXT  | `@` ou `tilouki.fr` | `v=spf1 include:amazonses.com ~all` |

> La valeur exacte est affichée dans le Dashboard Resend — ne copiez pas un exemple générique.

**Vérification** :

```bash
nslookup -type=txt tilouki.fr
```

Ou [MXToolbox SPF Lookup](https://mxtoolbox.com/spf.aspx).

**Règle** : un seul enregistrement SPF par domaine. Si vous avez déjà un SPF (ex. Google Workspace), fusionnez les `include:` au lieu d'en créer un second.

---

## 4. DKIM (DomainKeys Identified Mail)

**Rôle** : signature cryptographique prouvant que le message n'a pas été altéré.

Resend fournit généralement **3 enregistrements CNAME** du type :

| Type  | Nom                  | Cible                   |
| ----- | -------------------- | ----------------------- |
| CNAME | `resend._domainkey`  | `…` (fourni par Resend) |
| CNAME | `resend2._domainkey` | `…`                     |
| CNAME | `resend3._domainkey` | `…`                     |

Ajoutez-les tels quels dans la zone DNS. Resend valide automatiquement DKIM une fois propagés.

---

## 5. DMARC (Domain-based Message Authentication)

**Rôle** : politique appliquée quand SPF ou DKIM échouent ; permet aussi des rapports d'abus.

Après SPF + DKIM opérationnels, ajoutez un enregistrement **TXT** :

| Type | Nom / Host | Valeur recommandée (démarrage)                       |
| ---- | ---------- | ---------------------------------------------------- |
| TXT  | `_dmarc`   | `v=DMARC1; p=none; rua=mailto:dmarc@votredomaine.fr` |

**Progression** :

1. `p=none` — surveillance sans blocage (1 à 2 semaines)
2. `p=quarantine` — e-mails non authentifiés en spam
3. `p=reject` — rejet strict (production mature)

Resend documente aussi un enregistrement DMARC optionnel dans le Dashboard.

---

## 6. SMTP (alternative à Resend)

Si vous utilisez `SMTP_HOST` au lieu de Resend :

- SPF/DKIM dépendent de **votre hébergeur SMTP** (Gmail, OVH, SendGrid, etc.)
- Gmail / Outlook personnels ne sont **pas** adaptés à la production (limites, mauvaise délivrabilité)
- Préférez un SMTP transactionnel professionnel avec domaine vérifié

Variables : `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_SECURE`.

---

## 7. Bonnes pratiques Tilouki

- [ ] `FROM_EMAIL` sur le domaine vérifié (pas `@gmail.com` en prod)
- [ ] `ADMIN_EMAIL` distinct pour les notifications internes
- [ ] Lien de désinscription non requis pour e-mails **transactionnels** (commande, expédition)
- [ ] Tester avec [mail-tester.com](https://www.mail-tester.com) avant mise en prod
- [ ] Surveiller le taux de rebond dans Resend → Logs

---

## 8. Diagnostic rapide

| Symptôme               | Cause probable                        | Action                                |
| ---------------------- | ------------------------------------- | ------------------------------------- |
| E-mail absent          | `RESEND_API_KEY` / SMTP non configuré | `npm run verify:deploy:prod`          |
| Resend 403 domain      | Domaine non vérifié                   | Dashboard Resend → Domains            |
| Spam                   | SPF/DKIM/DMARC manquants              | Section 3–5 ci-dessus                 |
| E-mail en dev non reçu | Pas de fournisseur                    | `/dev/emails` ou `EMAIL_DEV_REDIRECT` |
