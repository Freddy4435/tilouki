# Parité migrations locale ↔ production

Quand du SQL est appliqué **manuellement** sur le projet Supabase (dashboard SQL Editor, MCP, script ponctuel) sans fichier correspondant dans `supabase/migrations/`, l'historique distant (`supabase_migrations.schema_migrations`) et le dépôt divergent. Symptômes :

- `supabase migration list --linked` affiche une version **distante** sans fichier local ;
- `supabase db push` refuse ou tente de réappliquer du SQL déjà passé ;
- `supabase db reset` (CI) ne reproduit pas l'état production.

## Procédure de resynchronisation

### 1. Identifier l'écart

```bash
supabase login
supabase link --project-ref VOTRE_PROJECT_REF
supabase migration list --linked
```

Repérer les versions **Remote** `applied` sans fichier local, ou les fichiers locaux jamais rejoués en distant.

### 2. Recréer le fichier migration dans le dépôt

1. Choisir le **même horodatage** que celui enregistré en production (ex. `20260611180000`).
2. Créer `supabase/migrations/<version>_description.sql` avec le SQL **idempotent** quand c'est possible :
   - données singleton (`shop_settings`) : `INSERT … SELECT … WHERE NOT EXISTS (SELECT 1 FROM …)` ;
   - DDL : `CREATE … IF NOT EXISTS`, `ADD COLUMN IF NOT EXISTS` ;
   - ne **jamais** écraser des données existantes en production.
3. Vérifier que `npm run check` passe (test `migrations-versions.test.ts`).

Exemple : `20260611180000_shop_settings_bootstrap.sql` — ligne initiale `shop_settings` uniquement si la table est vide.

### 3. Marquer la version comme déjà appliquée (sans réexécuter le SQL)

Sur un environnement **déjà** à jour côté schéma/données :

```bash
supabase migration repair --status applied 20260611180000
```

`repair` met à jour l'historique ; il **n'exécute pas** le fichier SQL. À utiliser quand la prod contient déjà le résultat de la migration.

### 4. Valider

```bash
supabase migration list --linked   # plus d'écart inconnu
supabase db reset                  # local : migrations + seeds
npm run check
```

Pour une nouvelle base (CI, clone) : le fichier recréé doit suffire — pas besoin de `repair`.

### 5. Déployer les migrations suivantes

```bash
supabase db push
```

## Règle d'or

> Après **toute** application manuelle (dashboard, MCP), recréer le fichier dans `supabase/migrations/` puis `supabase migration repair --status applied <version>` sur les environnements déjà migrés.

Voir aussi [`docs/migrations.md`](./migrations.md) et [`supabase/README.md`](../supabase/README.md).
