<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

## Migrations Supabase — parité locale / production

- Toute modification de schéma ou de données bootstrap passe par un **nouveau** fichier dans `supabase/migrations/` (horodatage unique, versions croissantes).
- **Ne jamais modifier** une migration déjà appliquée en production.
- Si du SQL a été appliqué manuellement (dashboard Supabase, MCP) : recréer le fichier migration correspondant dans le dépôt (SQL **idempotent**), puis sur les environnements déjà migrés exécuter `supabase migration repair --status applied <version>`.
- Avant tout `supabase db push` : `supabase migration list --linked` — aucune version distante ne doit être inconnue localement.

Procédure détaillée : [`docs/migrations-remote-parity.md`](docs/migrations-remote-parity.md).
