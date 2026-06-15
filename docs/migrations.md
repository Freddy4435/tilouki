# Migrations Supabase — Tilouki

Guide pour modifier le schéma PostgreSQL sans casser la production ni la CLI locale.

## Workflow officiel

1. **Nouvelle modification de schéma** → créer un **nouveau** fichier dans `supabase/migrations/` :

   ```bash
   supabase migration new description_courte
   ```

   La CLI génère un horodatage unique (`YYYYMMDDHHMMSS_nom.sql`).

2. **Éditer uniquement ce nouveau fichier** — y placer le SQL (DDL, politiques RLS, etc.).

3. **Tester en local** :

   ```bash
   supabase db reset    # migrations + seeds dev
   npm run check
   ```

4. **Déployer sur le projet lié** :

   ```bash
   supabase migration list --linked   # voir section « Règle d'or » ci-dessous
   supabase db push
   ```

### Ce qu'il ne faut jamais faire

- **Modifier une migration déjà appliquée** en production (ou sur un autre environnement partagé). Le fichier versionné et l'historique distant divergent ; les prochains `db push` échouent ou réappliquent du SQL de façon imprévisible.
- **Réutiliser le même préfixe de version** pour deux fichiers (`20260611140000_*.sql` × 2) — la CLI Supabase exige des versions **uniques** et **strictement croissantes**. Le test `migrations-versions.test.ts` (dans `npm run check`) bloque ce cas.

En cas d'erreur dans une migration **pas encore** poussée : supprimez le fichier et recréez-en un.  
En cas d'erreur **déjà** en production : nouvelle migration corrective (pas d'édition rétroactive).

---

## Historique local vs distant

Les fichiers du dépôt portent un horodatage choisi à la création. Le projet Supabase cloud enregistre la **version réellement appliquée** dans `supabase_migrations.schema_migrations` — les numéros peuvent différer si les migrations ont été générées ou rejouées autrement (CLI, dashboard, MCP).

### Versions enregistrées en production (référence)

| Migration (nom logique)                                | Version distante appliquée                                                         |
| ------------------------------------------------------ | ---------------------------------------------------------------------------------- |
| `orders_shipping_metadata`                             | `20260609132309`                                                                   |
| `security_audit`                                       | `20260609132615`                                                                   |
| `legal_settings_extend`                                | `20260609133828`                                                                   |
| `orders_shipping_label`                                | `20260611105654`                                                                   |
| `chronopost_shipping_rates`                            | `20260611105711`                                                                   |
| `shop_hero_image`                                      | `20260611122927`                                                                   |
| `shipping_rates_method`, `shipments`, `legal_policies` | appliquées le 2026-06-11 (après-midi) via MCP — horodatages distincts côté distant |

### Fichiers locaux (ordre d'application)

| Fichier local                                  | Rôle                                                     |
| ---------------------------------------------- | -------------------------------------------------------- |
| `20250609100800_orders_shipping_metadata.sql`  | Métadonnées livraison commandes                          |
| `20250609100900_security_audit.sql`            | Audit sécurité                                           |
| `20250609101000_legal_settings_extend.sql`     | Extension paramètres légaux                              |
| `20260611120000_orders_shipping_label.sql`     | Étiquettes expédition                                    |
| `20260611130000_chronopost_shipping_rates.sql` | Tarifs Chronopost                                        |
| `20260611140000_shipping_rates_method.sql`     | Méthode sur barème livraison                             |
| `20260611141000_shop_hero_image.sql`           | Image hero boutique                                      |
| `20260611150000_shipments.sql`                 | Table expéditions                                        |
| `20260611160000_legal_policies.sql`            | Politiques légales                                       |
| `20260611170000_shipments_label_pdf_path.sql`  | Chemin PDF étiquette expédition                          |
| `20260611180000_shop_settings_bootstrap.sql`   | Ligne initiale `shop_settings` + catégories (idempotent) |

Le **contenu SQL** fait foi ; le **numéro de version** sert d'identifiant pour l'ordre et l'historique.

### Migration orpheline en production

Si une version est enregistrée côté distant sans fichier local (ex. `20260611180000_shop_settings_bootstrap` appliquée via MCP), suivre [`migrations-remote-parity.md`](./migrations-remote-parity.md) : recréer le fichier, `migration repair`, puis `db push` pour la suite.

---

## Synchroniser l'historique quand local et distant divergent

Quand le SQL a déjà été appliqué en production sous un autre numéro que le fichier local, ou quand la table d'historique est en avance / en retard :

### 1. Comparer

```bash
supabase login
supabase link --project-ref VOTRE_PROJECT_REF
supabase migration list --linked
```

Colonnes utiles : version locale, version distante, statut (`applied` / absent).

### 2. Marquer comme appliquées (sans réexécuter le SQL)

Pour chaque version **déjà passée en production** mais absente ou « pending » côté CLI :

```bash
supabase migration repair --status applied 20260609132309
supabase migration repair --status applied 20260609132615
supabase migration repair --status applied 20260609133828
supabase migration repair --status applied 20260611105654
supabase migration repair --status applied 20260611105711
supabase migration repair --status applied 20260611122927
# … puis les versions MCP du 2026-06-11 (après-midi) pour shipping_rates_method, shipments, legal_policies
```

Adaptez la liste aux versions affichées par `migration list --linked`.  
`repair` met à jour l'historique ; il **n'exécute pas** le fichier SQL.

### 3. Vérifier avant tout push

```bash
supabase migration list --linked
```

- Aucune migration **distante** ne doit être **inconnue** localement (fichier manquant dans `supabase/migrations/`).
- Aucune migration locale « Remote » en attente ne doit recouvrir du SQL déjà appliqué manuellement — utiliser `repair` d'abord.

Ensuite seulement :

```bash
supabase db push
```

---

## Règle d'or

> **Avant tout `supabase db push`**, exécuter `supabase migration list` (ou `--linked`) et vérifier qu'**aucune migration distante n'est inconnue localement** et que l'ordre / les statuts sont cohérents.

En CI, `supabase db reset` applique les fichiers locaux dans l'ordre des préfixes — d'où l'obligation de versions uniques et croissantes (voir test automatisé).

---

## Voir aussi

- [`migrations-remote-parity.md`](./migrations-remote-parity.md) — resynchroniser après application manuelle (dashboard / MCP)
- [`supabase/README.md`](../supabase/README.md) — setup CLI, seeds dev, RLS
- [`docs/checklist-mise-en-production.md`](./checklist-mise-en-production.md) — mise en ligne
