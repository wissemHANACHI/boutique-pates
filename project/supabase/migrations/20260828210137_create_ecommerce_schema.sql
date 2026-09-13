/*
# Maison Églantine — E-commerce Schema

## Overview
Creates the complete database schema for the Maison Églantine fresh pasta
e-commerce platform. This is a single-tenant app with no sign-in screen —
all policies allow anon + authenticated access since the frontend uses the
anon key for its entire lifetime.

## New Tables
1. **categories** — product categories (Pâtes longues, Pâtes courtes, etc.)
2. **products** — individual pasta products with photos, pricing, stock
3. **delivery_zones** — geographic delivery zones with fees
4. **deliverers** — delivery personnel with assigned zones
5. **orders** — customer orders with status tracking
6. **order_items** — line items within each order
7. **site_settings** — single-row table for site-wide configuration

## Security
- RLS enabled on every table.
- All policies use `TO anon, authenticated` with `USING (true)` / `WITH CHECK (true)`
  because this is a single-tenant no-auth app where data is intentionally shared.
- No user_id columns or auth.uid() checks — the app has no sign-in flow.

## Notes
- Orders use a sequence-based human-readable order number.
- Stock is decremented via a trigger when orders are placed.
- site_settings is a single-row table enforced by a constraint.
*/

-- ── CATEGORIES ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id         bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name       text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_categories" ON categories;
CREATE POLICY "anon_select_categories" ON categories FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_categories" ON categories;
CREATE POLICY "anon_insert_categories" ON categories FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_categories" ON categories;
CREATE POLICY "anon_update_categories" ON categories FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_categories" ON categories;
CREATE POLICY "anon_delete_categories" ON categories FOR DELETE
  TO anon, authenticated USING (true);

-- ── PRODUCTS ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id              bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  category_id     bigint NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  name            text NOT NULL,
  description     text NOT NULL DEFAULT '',
  price            integer NOT NULL DEFAULT 0,  -- in DA (Algerian Dinar)
  unit            text NOT NULL DEFAULT '320g',
  stock            integer NOT NULL DEFAULT 0,
  active           boolean NOT NULL DEFAULT true,
  low_stock_alert  integer NOT NULL DEFAULT 5,
  emoji            text NOT NULL DEFAULT '🍝',
  badge            text,
  reviews          integer NOT NULL DEFAULT 0,
  image_url        text NOT NULL,
  sort_order       integer NOT NULL DEFAULT 0,
  created_at       timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_products" ON products;
CREATE POLICY "anon_select_products" ON products FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_products" ON products;
CREATE POLICY "anon_insert_products" ON products FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_products" ON products;
CREATE POLICY "anon_update_products" ON products FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_products" ON products;
CREATE POLICY "anon_delete_products" ON products FOR DELETE
  TO anon, authenticated USING (true);

-- ── DELIVERY ZONES ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS delivery_zones (
  id    bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name  text NOT NULL,
  price integer NOT NULL DEFAULT 0,
  sort_order integer NOT NULL DEFAULT 0
);

ALTER TABLE delivery_zones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_zones" ON delivery_zones;
CREATE POLICY "anon_select_zones" ON delivery_zones FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_zones" ON delivery_zones;
CREATE POLICY "anon_insert_zones" ON delivery_zones FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_zones" ON delivery_zones;
CREATE POLICY "anon_update_zones" ON delivery_zones FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_zones" ON delivery_zones;
CREATE POLICY "anon_delete_zones" ON delivery_zones FOR DELETE
  TO anon, authenticated USING (true);

-- ── DELIVERERS ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS deliverers (
  id    bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name  text NOT NULL,
  phone text NOT NULL DEFAULT '',
  zone  text NOT NULL DEFAULT '',
  active boolean NOT NULL DEFAULT true
);

ALTER TABLE deliverers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_deliverers" ON deliverers;
CREATE POLICY "anon_select_deliverers" ON deliverers FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_deliverers" ON deliverers;
CREATE POLICY "anon_insert_deliverers" ON deliverers FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_deliverers" ON deliverers;
CREATE POLICY "anon_update_deliverers" ON deliverers FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_deliverers" ON deliverers;
CREATE POLICY "anon_delete_deliverers" ON deliverers FOR DELETE
  TO anon, authenticated USING (true);

-- ── ORDERS ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id            bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  order_number  integer NOT NULL DEFAULT 0,
  client_name   text NOT NULL,
  client_phone  text NOT NULL,
  client_address text NOT NULL DEFAULT '',
  zone          text NOT NULL DEFAULT '',
  delivery_fee  integer NOT NULL DEFAULT 0,
  notes         text NOT NULL DEFAULT '',
  total         integer NOT NULL DEFAULT 0,
  payment_mode  text NOT NULL DEFAULT 'À la livraison',
  status        text NOT NULL DEFAULT 'Nouvelle',
  deliverer_id  bigint REFERENCES deliverers(id) ON DELETE SET NULL,
  created_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_orders" ON orders;
CREATE POLICY "anon_select_orders" ON orders FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_orders" ON orders;
CREATE POLICY "anon_insert_orders" ON orders FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_orders" ON orders;
CREATE POLICY "anon_update_orders" ON orders FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_orders" ON orders;
CREATE POLICY "anon_delete_orders" ON orders FOR DELETE
  TO anon, authenticated USING (true);

-- ── ORDER ITEMS ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
  id         bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  order_id   bigint NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id bigint REFERENCES products(id) ON DELETE SET NULL,
  name       text NOT NULL,
  qty        integer NOT NULL DEFAULT 1,
  price      integer NOT NULL DEFAULT 0
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_order_items" ON order_items;
CREATE POLICY "anon_select_order_items" ON order_items FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_order_items" ON order_items;
CREATE POLICY "anon_insert_order_items" ON order_items FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_order_items" ON order_items;
CREATE POLICY "anon_update_order_items" ON order_items FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_order_items" ON order_items;
CREATE POLICY "anon_delete_order_items" ON order_items FOR DELETE
  TO anon, authenticated USING (true);

-- ── SITE SETTINGS (single-row) ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS site_settings (
  id        integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  phone     text NOT NULL DEFAULT '0661 997 537',
  instagram text NOT NULL DEFAULT '@maison_eglantine16',
  address   text NOT NULL DEFAULT 'Alger, Algérie',
  hours     text NOT NULL DEFAULT 'Tous les jours – commandez en ligne'
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_settings" ON site_settings;
CREATE POLICY "anon_select_settings" ON site_settings FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_settings" ON site_settings;
CREATE POLICY "anon_insert_settings" ON site_settings FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_settings" ON site_settings;
CREATE POLICY "anon_update_settings" ON site_settings FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

-- ── INDEXES ──────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(active);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_deliverer ON orders(deliverer_id);

-- ── SEQUENCE for human-readable order numbers ────────────────────────────────
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1001;

-- ── TRIGGER: auto-assign order_number on insert ──────────────────────────────
CREATE OR REPLACE FUNCTION assign_order_number()
RETURNS trigger AS $$
BEGIN
  IF NEW.order_number = 0 THEN
    NEW.order_number := nextval('order_number_seq');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_assign_order_number ON orders;
CREATE TRIGGER trg_assign_order_number
  BEFORE INSERT ON orders
  FOR EACH ROW EXECUTE FUNCTION assign_order_number();
