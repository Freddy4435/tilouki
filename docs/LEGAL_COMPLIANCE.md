# Conformité légale — Tilouki

Guide pour supprimer tous les placeholders avant la mise en production.

> **Avertissement** : les modèles intégrés sont une base structurée. La vendeuse ou un professionnel du droit doit valider chaque texte avant publication définitive.

---

## 1. Pages légales publiques

| Slug                      | URL                        | Contenu                                      |
| ------------------------- | -------------------------- | -------------------------------------------- |
| `mentions-legales`        | `/mentions-legales`        | Éditeur, hébergeur, propriété intellectuelle |
| `cgv`                     | `/cgv`                     | Conditions générales de vente                |
| `confidentialite`         | `/confidentialite`         | RGPD, finalités, droits                      |
| `cookies`                 | `/cookies`                 | Traceurs, consentement                       |
| `livraison-retours`       | `/livraison-retours`       | Livraison, rétractation, retours             |
| `formulaire-retractation` | `/formulaire-retractation` | Formulaire type consommation                 |

Pages complémentaires RGPD :

| URL                     | Rôle                                                          |
| ----------------------- | ------------------------------------------------------------- |
| `/donnees-personnelles` | Formulaire public d'exercice des droits (accès / suppression) |

Le contenu est alimenté par :

1. **Paramètres boutique** (`/admin/parametres`) — variables `{{shop_name}}`, `{{siret}}`, etc.
2. **Modèles HTML** — bouton « Restaurer le modèle » dans `/admin/pages-legales`
3. **Moteur de rendu** — remplace les variables et supprime tout texte provisoire en public

---

## 2. Champs boutique obligatoires

| Groupe      | Champ                            | Admin                                  |
| ----------- | -------------------------------- | -------------------------------------- |
| Identité    | Nom commercial                   | `shopName`                             |
| Identité    | Nom légal / raison sociale       | `legalName`                            |
| Identité    | Statut juridique                 | `legalStatus`                          |
| Identité    | SIRET (14 chiffres)              | `siret`                                |
| Identité    | Adresse professionnelle          | `address`                              |
| Identité    | E-mail de contact                | `email`                                |
| Identité    | Téléphone                        | `phone`                                |
| TVA         | Mention TVA                      | `vatNotice` (si assujetti)             |
| Médiation   | Nom du médiateur                 | `mediationName`                        |
| Médiation   | URL du médiateur                 | `mediationUrl`                         |
| Hébergement | Nom, adresse, e-mail             | `hostName`, `hostAddress`, `hostEmail` |
| Retours     | Politique retours / rétractation | `returnPolicy`                         |

Recommandés : `exchangePolicy`, `repIdu` (REP textile), `hostPhone`.

Checklist interactive : `/admin/parametres` ou `/admin/pages-legales`.

---

## 3. Blocages et alertes admin

| Mécanisme                        | Effet                                        |
| -------------------------------- | -------------------------------------------- |
| Bandeau rouge admin              | Champs boutique obligatoires manquants       |
| Alerte tableau de bord           | « Pages légales incomplètes » (critique)     |
| Checkout production              | `503` si informations légales incomplètes    |
| Enregistrement paramètres (prod) | Refusé tant que la checklist n'est pas verte |

---

## 4. Placeholders interdits en production

Textes automatiquement supprimés ou bloqués sur le site public :

- `Contenu à compléter` / `Contenu à initialiser`
- `[À renseigner : …]`
- Variables non résolues `{{nom}}`

Si le rendu reste invalide, la page affiche un message neutre (sans placeholder).

---

## 5. RGPD

| Exigence                     | Implémentation                                        |
| ---------------------------- | ----------------------------------------------------- |
| Politique de confidentialité | `/confidentialite` + lien formulaire RGPD             |
| Cookies & consentement       | Bandeau `cookie-consent`, `/cookies`                  |
| Droit d'accès / suppression  | `/donnees-personnelles` → notification `ADMIN_EMAIL`  |
| Anonymisation commandes      | `/admin/parametres` → panneau RGPD admin              |
| Paiement Stripe              | Données carte non stockées (mentionnées en politique) |
| Conservation                 | Durées indiquées dans la politique confidentialité    |

Procédure suppression : le client envoie une demande → l'admin anonymise via le panneau RGPD (e-mail, nom, téléphone, relais ; montants conservés).

---

## 6. Checklist avant mise en ligne

- [ ] Tous les champs obligatoires verts dans `/admin/parametres`
- [ ] « Restaurer le modèle » sur chaque page si le contenu DB est vide
- [ ] Relire chaque page publique (aucun « à compléter », aucun `{{variable}}`)
- [ ] Faire valider les textes par un professionnel
- [ ] Tester `/donnees-personnelles` (demande test → e-mail admin)
- [ ] Vérifier le bandeau cookies et la politique cookies
- [ ] `npm run verify:deploy:prod`

---

## 7. Fichiers techniques

| Fichier                        | Rôle                           |
| ------------------------------ | ------------------------------ |
| `src/lib/legal/templates.ts`   | Modèles HTML                   |
| `src/lib/legal/context.ts`     | Variables dynamiques           |
| `src/lib/legal/render.ts`      | Rendu + détection placeholders |
| `src/lib/legal/compliance.ts`  | Checklist champs               |
| `src/lib/legal/publication.ts` | Prêt publication + audit pages |
