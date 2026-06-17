# Plausible — goals funnel Tilouki (Lot A.5)

Événements émis par `trackRetailEvent` (`src/lib/analytics/retail-events.ts`) après consentement analytics.

## Configuration dashboard

1. [plausible.io](https://plausible.io) → site Tilouki → **Settings → Goals**
2. Ajouter des goals **Custom event** :

| Goal | Déclenché quand |
|------|-----------------|
| `add_to_cart` | Ajout panier (fiche, quick-add, vestiaire) |
| `begin_checkout` | Ouverture `/commande` avec panier non vide |
| `add_capsule_to_cart` | Ajout tenue complète depuis l'assistant vestiaire |

## Variables Vercel

| Variable | Exemple |
|----------|---------|
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | `tilouki.fr` ou `tilouki.vercel.app` |

Le script Plausible ne se charge qu'après consentement cookies (`ConsentGatedAnalytics`).

## Vérification

1. Accepter les cookies analytics sur le site
2. Ajouter un article au panier
3. Plausible → **Realtime** : l'événement `add_to_cart` doit apparaître sous ~30 s
