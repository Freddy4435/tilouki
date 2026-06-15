# Rapport d'audit sécurité — Tilouki

Date : juin 2026

## Synthèse

Audit et correctifs appliqués sur l'e-commerce Tilouki (Next.js 16, Supabase, Stripe). Les points critiques (fuite PII suivi commande, survente, open redirect, absence rate limit) ont été traités. Des améliorations continues restent possibles (WAF production, CMP analytics tiers, remboursements partiels Stripe).

## Correctifs appliqués

| ID  | Sévérité | Problème                                                         | Correctif                                                     |
| --- | -------- | ---------------------------------------------------------------- | ------------------------------------------------------------- |
| C1  | Critique | RPC `get_order_by_tracking_token` exposait toute la table orders | Migration : retour colonnes publiques uniquement              |
| H1  | Haute    | Pas de réservation stock sur commandes pending                   | Décrément stock à la création + libération si paiement échoue |
| H2  | Haute    | Aucun rate limiting                                              | Middleware + guards API + action suivi                        |
| H3  | Haute    | Open redirect OAuth                                              | `getSafeRedirectPath()` whitelist `/admin`                    |
| M1  | Moyenne  | `cost_cents` lisible en anon                                     | Vue `catalog_variants` sans coût d'achat                      |
| M2  | Moyenne  | Point relais non validé                                          | `validateRelayPoint()` avant checkout                         |
| M4  | Moyenne  | Pas d'en-têtes sécurité                                          | Middleware + `next.config.ts`                                 |
| M5  | Moyenne  | Middleware sans rôle admin                                       | RPC `is_admin()`                                              |
| M6  | Moyenne  | PII dans logs e-mail                                             | `redactEmail()` via `logSecure`                               |
| L1  | Basse    | Erreurs checkout verbeuses                                       | Messages génériques côté client                               |
| L2  | Basse    | Fallback `app_metadata` admin                                    | Fail-closed : `admin_users` obligatoire                       |
| L3  | Basse    | Pas de bandeau cookies                                           | Composant `CookieConsent`                                     |
| —   | RGPD     | Pas de demande données                                           | Page `/donnees-personnelles` + action admin anonymisation     |

## Architecture sécurité ajoutée

```
src/lib/security/
  headers.ts      — CSP, HSTS, X-Frame-Options
  rate-limit.ts   — limite en mémoire (IP + route)
  safe-redirect.ts
  log.ts          — masquage PII
  api.ts          — guard + parseJsonBody Zod
```

## Tests unitaires

`vitest` — `safe-redirect`, `rate-limit`, `checkout` schema, `log` redaction.

## Recommandations post-déploiement

1. Appliquer la migration `20250609100700_security_hardening.sql` sur Supabase.
2. En production multi-instance : remplacer le rate limit mémoire par Redis/Upstash.
3. Cron pour annuler les commandes `pending` expirées (`pending_expires_at`).
4. Valider la CSP après activation d'outils analytics tiers.
5. Traiter manuellement les demandes RGPD loguées (e-mail admin).

## Points déjà conformes (conservés)

- Prix calculés serveur, jamais depuis le client
- Webhook Stripe signé
- Service role confiné `server-only`
- RLS activé sur les tables sensibles
- Vérification montant Stripe vs commande
