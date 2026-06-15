# Maintenance & CI — Tilouki

Guide de stabilisation pour builds reproductibles et revue de sécurité des dépendances.

## Commandes CI

| Commande               | Rôle                                                                             |
| ---------------------- | -------------------------------------------------------------------------------- |
| `npm run check`        | Secrets, typecheck, lint, **format Prettier**, tests unitaires, build production |
| `npm run qa`           | `check` + tests E2E Playwright (recette complète)                                |
| `npm run format`       | Formater tout le dépôt (Prettier)                                                |
| `npm run format:check` | Vérifier le format sans écrire (utilisé dans `check`)                            |

En local avant push : `npm run check`. Avant release : `npm run qa`.

## Formatage (Prettier)

- Config : `.prettierrc` / `.prettierignore`
- Le pipeline `check` échoue si un fichier n’est pas formaté.
- Correction : `npm run format`

## Fichiers ignorés (ne pas versionner)

Définis dans `.gitignore` :

- `test-results/`, `playwright-report/`, `playwright/.cache/`
- `.next/`, `coverage/`, `.eslintcache`
- `.email-preview/`, `lighthouse*.html`, `lighthouse*.json`
- `screenshots/`, `captures/`, `logs/`, `*.log`

Ces artefacts sont régénérés par les tests ou audits locaux.

## Proxy Next.js 16 (ex-middleware)

Next.js 16 renomme le fichier racine `middleware.ts` en **`proxy.ts`** et l’export `middleware` en **`proxy`**.

| Avant                        | Après                         |
| ---------------------------- | ----------------------------- |
| `src/middleware.ts`          | `src/proxy.ts`                |
| `export function middleware` | `export async function proxy` |

Le module `src/lib/supabase/middleware.ts` reste inchangé : c’est le helper session Supabase / CSP / rate-limit, pas le point d’entrée Next.

Référence : [Next.js Proxy](https://nextjs.org/docs/app/api-reference/file-conventions/proxy).

## Polices déterministes

**Stratégie retenue : polices locales versionnées.**

- Fichiers : `src/assets/fonts/dm-sans-latin.woff2`, `fraunces-latin.woff2`
- Chargement : `next/font/local` via `src/lib/fonts.ts`
- Aucun appel réseau vers Google Fonts au build CI

### Régénérer les fichiers

Si vous changez de famille ou de graisses :

```bash
npm run fonts:fetch
```

Script : `scripts/fetch-fonts.mjs` (télécharge le latin variable depuis Google Fonts une fois, puis commit des `.woff2`).

## npm audit — PostCSS (via Next)

```text
postcss < 8.5.10 — moderate — XSS via Unescaped </style>
  └── next (dépendance transitive : next/node_modules/postcss)
```

### Décision (2026-06)

| Option                       | Verdict                                                          |
| ---------------------------- | ---------------------------------------------------------------- |
| `npm audit fix --force`      | **Refusé** — rétrograde Next vers 9.x (cassant)                  |
| Override `postcss` en direct | **Refusé** — Next embarque sa propre copie ; override peu fiable |
| **Attendre correctif Next**  | **Retenu** — surveiller releases Next ≥ 16.2.x / 16.3 stable     |

**Risque résiduel :** modéré, lié à la chaîne de build PostCSS (stringify CSS), pas à l’exécution côté navigateur sur ce projet. Réévaluer à chaque montée de version Next :

```bash
npm audit
npm outdated next
```

Quand Next embarque `postcss >= 8.5.10`, relancer `npm audit` et mettre à jour cette section.

## Checklist avant merge / déploiement

- [ ] `npm run check` vert
- [ ] Pas de fichiers temporaires ajoutés au commit (rapports Playwright, `.env`, etc.)
- [ ] Polices présentes dans `src/assets/fonts/` si `src/lib/fonts.ts` modifié
- [ ] `npm audit` relu (PostCSS documenté ci-dessus)
