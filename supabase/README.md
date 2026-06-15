# Supabase — Tilouki

Migrations SQL pour la boutique Tilouki.

## Fichiers

| Fichier                                             | Contenu                                                                |
| --------------------------------------------------- | ---------------------------------------------------------------------- |
| `migrations/20250609100000_initial_schema.sql`      | Tables, index, contraintes, triggers                                   |
| `migrations/20250609100100_functions.sql`           | Fonctions admin, stock, numéro commande, vue catalogue                 |
| `migrations/20250609100200_rls_policies.sql`        | Politiques RLS                                                         |
| `migrations/20250609100300_storage.sql`             | Bucket `product-images`                                                |
| `migrations/20250609100400_shipping_rates.sql`      | Grilles tarifs livraison                                               |
| `migrations/20250609100500_order_admin_fields.sql`  | Historique statuts, notes commandes                                    |
| `migrations/20250609100600_legal_shop_settings.sql` | Paramètres légaux, page rétractation                                   |
| `migrations/20250609100700_security_hardening.sql`  | Suivi commande sécurisé, webhooks, variants catalogue                  |
| `seed.dev.sql`                                      | Paramètres, catégories, pages légales (jamais en prod)                 |
| `seed.catalog-products.sql`                         | **20 produits vendables** + variantes (SKU `TK-`, images `/products/`) |
| `seed.dev-products.sql`                             | **12 produits de démo** optionnels (jamais en prod, SKU `DEV-`)        |

## Prérequis

- [Supabase CLI](https://supabase.com/docs/guides/cli) installée
- Compte Supabase (projet cloud ou local)

```bash
npm install -g supabase
supabase --version
```

## Option A — Projet Supabase Cloud (recommandé)

### 1. Lier le projet

```bash
cd tilouki
supabase login
supabase link --project-ref VOTRE_PROJECT_REF
```

Le `project-ref` se trouve dans l'URL du dashboard : `https://supabase.com/dashboard/project/<project-ref>`.

### 2. Appliquer les migrations

```bash
supabase db push
```

Cette commande exécute toutes les migrations non encore appliquées sur le projet distant.

La migration `20260611180000_shop_settings_bootstrap.sql` crée la **ligne initiale** `shop_settings` et les catégories de navigation (sans produits). Sans elle, `/admin/parametres` affiche « Aucun paramètre boutique trouvé ».

### 3. Seed développement (optionnel)

Le seed **ne s'exécute pas** automatiquement sur le cloud avec `db push`.

**Structure + produits catalogue (recommandé pour tester le storefront) :**

```bash
npm run seed:catalog
# ou bascule complète (catalogue réel + désactivation démos) :
npm run catalog:go-live -- --apply
```

**Structure seule** (sans produits) :

```bash
supabase db execute --file supabase/seed.dev.sql
```

En local, `supabase db reset` exécute les deux fichiers (`config.toml`).

> ⛔ **Ne jamais exécuter `seed.dev.sql` / `seed.dev-products.sql` en production.** Pour la bascule catalogue réel, utiliser `npm run catalog:go-live -- --apply` (UPSERT, sans DELETE).

### 4. Créer un administrateur

1. Créez un utilisateur dans **Authentication → Users** (email + mot de passe).
2. Exécutez dans le SQL Editor :

```sql
INSERT INTO public.admin_users (user_id, email, role)
VALUES (
  'UUID_DE_L_UTILISATEUR_AUTH',
  'admin@tilouki.fr',
  'admin'
);
```

## Option B — Supabase local

### 1. Démarrer la stack locale

```bash
cd tilouki
supabase start
```

Au premier lancement, Docker doit être actif. Notez les URLs et clés affichées.

### 2. Appliquer migrations + seed

```bash
supabase db reset
```

`db reset` recrée la base locale, applique toutes les migrations puis exécute `seed.dev.sql` (configuré dans `config.toml`).

### 3. Variables d'environnement locales

Copiez les valeurs affichées par `supabase start` dans `.env.local` :

```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

## Commandes utiles

| Commande                                                        | Description                                        |
| --------------------------------------------------------------- | -------------------------------------------------- |
| `supabase db push`                                              | Applique les migrations sur le projet lié          |
| `supabase db reset`                                             | Reset local + migrations + seed                    |
| `supabase migration list`                                       | Liste l'état des migrations                        |
| `supabase db diff -f nom`                                       | Génère une migration depuis les changements locaux |
| `supabase gen types typescript --local > src/types/database.ts` | Génère les types TS                                |

## Sécurité RLS — résumé

| Table                 | Public (anon)                      | Admin            |
| --------------------- | ---------------------------------- | ---------------- |
| `shop_settings`       | Lecture                            | CRUD             |
| `categories`          | Lecture si `is_active`             | CRUD             |
| `products`            | Lecture si `status = active`       | CRUD             |
| `product_images`      | Lecture si produit actif           | CRUD             |
| `product_variants`    | Lecture si actif + produit actif   | CRUD             |
| `orders`              | Aucun (API serveur `service_role`) | CRUD             |
| `order_items`         | Aucun                              | CRUD             |
| `legal_pages`         | Lecture                            | CRUD             |
| `admin_users`         | Aucun                              | CRUD             |
| `inventory_movements` | Aucun                              | Insert + lecture |

Suivi commande invité : fonction `get_order_by_tracking_token(uuid)`.

Stock : les insertions dans `inventory_movements` mettent à jour `product_variants.stock_quantity` automatiquement.
