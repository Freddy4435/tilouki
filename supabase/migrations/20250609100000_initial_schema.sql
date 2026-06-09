-- =============================================================================
-- Tilouki — Schéma initial
-- Boutique e-commerce vêtements enfants
-- =============================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Schéma privé pour fonctions SECURITY DEFINER
CREATE SCHEMA IF NOT EXISTS private;

-- -----------------------------------------------------------------------------
-- Types énumérés
-- -----------------------------------------------------------------------------

CREATE TYPE public.product_status AS ENUM ('draft', 'active', 'archived');

CREATE TYPE public.product_gender AS ENUM ('fille', 'garcon', 'mixte');

CREATE TYPE public.order_status AS ENUM (
  'pending',
  'paid',
  'preparing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded'
);

CREATE TYPE public.payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');

CREATE TYPE public.inventory_movement_type AS ENUM (
  'sale',
  'manual_adjustment',
  'restock',
  'cancel'
);

-- -----------------------------------------------------------------------------
-- Utilitaires
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = timezone('utc', now());
  RETURN NEW;
END;
$$;

-- -----------------------------------------------------------------------------
-- 1. shop_settings (singleton métier)
-- -----------------------------------------------------------------------------

CREATE TABLE public.shop_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_name TEXT NOT NULL DEFAULT 'Tilouki',
  legal_name TEXT,
  legal_status TEXT,
  siret TEXT,
  address TEXT,
  email TEXT,
  phone TEXT,
  vat_enabled BOOLEAN NOT NULL DEFAULT false,
  vat_rate NUMERIC(5, 4) NOT NULL DEFAULT 0.2000,
  vat_notice TEXT DEFAULT 'TVA non applicable, art. 293 B du CGI',
  currency TEXT NOT NULL DEFAULT 'EUR' CHECK (char_length(currency) = 3),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

COMMENT ON TABLE public.shop_settings IS 'Paramètres globaux de la boutique (ligne unique en production).';

-- -----------------------------------------------------------------------------
-- 2. categories
-- -----------------------------------------------------------------------------

CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT categories_slug_unique UNIQUE (slug),
  CONSTRAINT categories_name_not_empty CHECK (char_length(trim(name)) > 0),
  CONSTRAINT categories_slug_format CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

-- -----------------------------------------------------------------------------
-- 3. products
-- -----------------------------------------------------------------------------

CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.categories (id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  short_description TEXT,
  description TEXT,
  material TEXT,
  season TEXT,
  brand_label TEXT NOT NULL DEFAULT 'Sans marque',
  made_in TEXT,
  care_instructions TEXT,
  gender public.product_gender NOT NULL DEFAULT 'mixte',
  status public.product_status NOT NULL DEFAULT 'draft',
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT products_slug_unique UNIQUE (slug),
  CONSTRAINT products_name_not_empty CHECK (char_length(trim(name)) > 0),
  CONSTRAINT products_slug_format CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

-- -----------------------------------------------------------------------------
-- 4. product_images
-- -----------------------------------------------------------------------------

CREATE TABLE public.product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products (id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT product_images_url_not_empty CHECK (char_length(trim(url)) > 0)
);

-- -----------------------------------------------------------------------------
-- 5. product_variants
-- -----------------------------------------------------------------------------

CREATE TABLE public.product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products (id) ON DELETE CASCADE,
  sku TEXT NOT NULL,
  size_label TEXT,
  age_label TEXT,
  color TEXT,
  price_cents INTEGER NOT NULL CHECK (price_cents >= 0),
  compare_at_price_cents INTEGER CHECK (compare_at_price_cents IS NULL OR compare_at_price_cents >= 0),
  cost_cents INTEGER CHECK (cost_cents IS NULL OR cost_cents >= 0),
  stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  weight_grams INTEGER CHECK (weight_grams IS NULL OR weight_grams > 0),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT product_variants_sku_unique UNIQUE (sku),
  CONSTRAINT product_variants_compare_price_gte_price CHECK (
    compare_at_price_cents IS NULL OR compare_at_price_cents >= price_cents
  )
);

-- -----------------------------------------------------------------------------
-- 6. orders
-- -----------------------------------------------------------------------------

CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_first_name TEXT NOT NULL,
  customer_last_name TEXT NOT NULL,
  customer_phone TEXT,
  status public.order_status NOT NULL DEFAULT 'pending',
  payment_status public.payment_status NOT NULL DEFAULT 'pending',
  stripe_session_id TEXT,
  stripe_payment_intent_id TEXT,
  subtotal_cents INTEGER NOT NULL DEFAULT 0 CHECK (subtotal_cents >= 0),
  shipping_cents INTEGER NOT NULL DEFAULT 0 CHECK (shipping_cents >= 0),
  discount_cents INTEGER NOT NULL DEFAULT 0 CHECK (discount_cents >= 0),
  total_cents INTEGER NOT NULL DEFAULT 0 CHECK (total_cents >= 0),
  currency TEXT NOT NULL DEFAULT 'EUR' CHECK (char_length(currency) = 3),
  relay_point_id TEXT,
  relay_point_name TEXT,
  relay_point_address TEXT,
  relay_point_zip TEXT,
  relay_point_city TEXT,
  relay_point_country TEXT DEFAULT 'FR',
  tracking_number TEXT,
  invoice_number TEXT,
  tracking_token UUID NOT NULL DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT orders_order_number_unique UNIQUE (order_number),
  CONSTRAINT orders_tracking_token_unique UNIQUE (tracking_token),
  CONSTRAINT orders_customer_email_format CHECK (
    customer_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  ),
  CONSTRAINT orders_total_consistency CHECK (
    total_cents = subtotal_cents + shipping_cents - discount_cents
  )
);

-- -----------------------------------------------------------------------------
-- 7. order_items
-- -----------------------------------------------------------------------------

CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders (id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products (id) ON DELETE SET NULL,
  variant_id UUID REFERENCES public.product_variants (id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  sku TEXT NOT NULL,
  size_label TEXT,
  age_label TEXT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price_cents INTEGER NOT NULL CHECK (unit_price_cents >= 0),
  total_price_cents INTEGER NOT NULL CHECK (total_price_cents >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT order_items_total_consistency CHECK (
    total_price_cents = unit_price_cents * quantity
  )
);

-- -----------------------------------------------------------------------------
-- 8. legal_pages
-- -----------------------------------------------------------------------------

CREATE TABLE public.legal_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT legal_pages_slug_unique UNIQUE (slug),
  CONSTRAINT legal_pages_slug_format CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

-- -----------------------------------------------------------------------------
-- 9. admin_users
-- -----------------------------------------------------------------------------

CREATE TABLE public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT admin_users_user_id_unique UNIQUE (user_id),
  CONSTRAINT admin_users_email_unique UNIQUE (email)
);

-- -----------------------------------------------------------------------------
-- 10. inventory_movements
-- -----------------------------------------------------------------------------

CREATE TABLE public.inventory_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id UUID NOT NULL REFERENCES public.product_variants (id) ON DELETE CASCADE,
  type public.inventory_movement_type NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity <> 0),
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- -----------------------------------------------------------------------------
-- Index
-- -----------------------------------------------------------------------------

CREATE INDEX idx_categories_active_sort ON public.categories (is_active, sort_order);
CREATE INDEX idx_categories_slug ON public.categories (slug);

CREATE INDEX idx_products_status ON public.products (status);
CREATE INDEX idx_products_category ON public.products (category_id) WHERE status = 'active';
CREATE INDEX idx_products_slug ON public.products (slug);
CREATE INDEX idx_products_created_at ON public.products (created_at DESC);

CREATE INDEX idx_product_images_product ON public.product_images (product_id, sort_order);

CREATE INDEX idx_product_variants_product ON public.product_variants (product_id);
CREATE INDEX idx_product_variants_sku ON public.product_variants (sku);
CREATE INDEX idx_product_variants_active_stock ON public.product_variants (product_id, is_active, stock_quantity);

CREATE INDEX idx_orders_status ON public.orders (status, created_at DESC);
CREATE INDEX idx_orders_payment_status ON public.orders (payment_status);
CREATE INDEX idx_orders_customer_email ON public.orders (customer_email);
CREATE INDEX idx_orders_order_number ON public.orders (order_number);
CREATE INDEX idx_orders_stripe_session ON public.orders (stripe_session_id) WHERE stripe_session_id IS NOT NULL;
CREATE INDEX idx_orders_tracking_token ON public.orders (tracking_token);

CREATE INDEX idx_order_items_order ON public.order_items (order_id);
CREATE INDEX idx_order_items_variant ON public.order_items (variant_id);

CREATE INDEX idx_legal_pages_slug ON public.legal_pages (slug);

CREATE INDEX idx_admin_users_user_id ON public.admin_users (user_id);

CREATE INDEX idx_inventory_movements_variant ON public.inventory_movements (variant_id, created_at DESC);
CREATE INDEX idx_inventory_movements_type ON public.inventory_movements (type);

-- -----------------------------------------------------------------------------
-- Triggers updated_at
-- -----------------------------------------------------------------------------

CREATE TRIGGER shop_settings_set_updated_at
  BEFORE UPDATE ON public.shop_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER products_set_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER product_variants_set_updated_at
  BEFORE UPDATE ON public.product_variants
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER orders_set_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER legal_pages_set_updated_at
  BEFORE UPDATE ON public.legal_pages
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
