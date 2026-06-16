# Livraison du code — archive propre

Guide pour transmettre le projet Tilouki **sans secrets** ni artefacts de build.

---

## ⛔ INTERDIT — ne jamais envoyer un zip / .rar manuel

> **Un .zip ou .rar créé à la main** (Explorateur Windows, 7-Zip « Ajouter à l'archive », clic droit → Compresser, WinRAR, etc.) **n'est jamais un livrable acceptable**, même si le destinataire est de confiance.

Une archive manuelle inclut presque toujours, sans que vous le voyiez :

| Contenu fréquent dans un .rar manuel  | Risque                                                       |
| ------------------------------------- | ------------------------------------------------------------ |
| `.env.local`, `.env.vercel`           | Clés Supabase, Stripe, Resend, Mondial Relay, Upstash, cron… |
| `.vercel/`                            | Lien projet et métadonnées Vercel                            |
| `node_modules/`                       | Dépendances + chemins locaux                                 |
| `.next/`                              | Build Next.js                                                |
| `.email-preview/`                     | Exports d'e-mails de test                                    |
| `supabase/.temp/`                     | Cache CLI Supabase                                           |
| `playwright-report/`, `test-results/` | Traces et captures de tests                                  |
| `archives/`                           | Autres zip locaux                                            |

**Un scan « propre » sur une archive manuelle ne la rend pas acceptable** — utilisez uniquement la commande officielle ci-dessous.

---

## ✅ Seule méthode autorisée

### Procédure complète (recommandée)

Une seule commande enchaîne audit, création et contrôle du zip :

```bash
npm run delivery:release
```

Équivalent manuel en trois étapes :

```bash
npm run audit:secrets
npm run delivery:clean
npm run verify:archive -- archives/tilouki-AAAA-MM-JJ.zip
```

Ou, après `delivery:clean`, contrôler automatiquement le zip le plus récent :

```bash
npm run verify:archive -- --latest
```

Alias de création seule : `npm run archive:clean`, `npm run prepare:archive`.

Le script `delivery:clean` :

1. audite les secrets dans les fichiers **suivis par git** (`audit:secrets`) ;
2. refuse si un chemin sensible est versionné ;
3. crée `archives/tilouki-AAAA-MM-JJ.zip` via `git archive` (fichiers git uniquement) ;
4. **échoue** si le zip contient l'une des exclusions obligatoires :
   - `.env.local`, `.env.vercel`
   - `.vercel/`, `.next/`, `node_modules/`
   - `test-results/`, `playwright-report/`, `archives/` (anciennes archives locales)

Vérification du dépôt **sans** créer de zip :

```bash
npm run verify:archive
```

Le destinataire réinstalle les dépendances avec `npm install` puis configure `.env.local` à partir de `.env.example`.

---

## Scanner un export suspect (zip, .rar ou dossier)

Avant d'écarter une archive manuelle déjà créée, ou pour auditer un fichier reçu :

```bash
npm run scan:deliverable -- ./mon-export.zip
npm run scan:deliverable -- ./tilouki-manuel.rar
npm run scan:deliverable -- ./dossier-copie
```

Équivalent :

```bash
npm run verify:archive -- ./mon-export.zip
```

Le scan **échoue** si un chemin interdit est présent. Il n'affiche **jamais** le contenu des fichiers — seulement les chemins et motifs bloquants.

Pour les `.rar` : 7-Zip ou UnRAR doit être installé, ou extrayez l'archive puis scannez le dossier.

---

## Règle d'or (récapitulatif)

| ❌ Interdit                                      | ✅ Autorisé                                                  |
| ------------------------------------------------ | ------------------------------------------------------------ |
| Zip / **.rar** manuel du dossier projet          | `npm run delivery:clean` → `archives/tilouki-AAAA-MM-JJ.zip` |
| Partager `.env.local`, `.env.vercel`, `.vercel/` | Partager uniquement le zip produit par le script             |
| Renvoyer une archive après fuite sans rotation   | Régénérer les clés puis nouvelle archive propre              |

Tous les éléments sensibles sont listés dans `.gitignore` et **ne doivent jamais être commités**.

---

## Si une archive incorrecte a été envoyée

**Ne renvoyez pas** le même .rar ou zip. Considérez les clés comme compromises.

1. Demandez la **suppression** du fichier chez le destinataire.
2. Suivez **[rotation-secrets-apres-fuite-archive.md](./rotation-secrets-apres-fuite-archive.md)** — régénération des clés **sans afficher** les anciennes valeurs.
3. Mettez à jour Vercel et votre `.env.local` local (jamais re-partagé).
4. Redéployez, puis `npm run verify:deploy:prod`.
5. Transmettez le code uniquement via une **nouvelle** archive `npm run delivery:clean`.

---

## Avant chaque release

```bash
npm run check          # inclut audit:secrets
npm run verify:archive
```

Voir aussi [README.md](../README.md#ne-jamais-partager) et [checklist-mise-en-production.md](./checklist-mise-en-production.md).
