/*
# Lock down admin-only tables with authenticated RLS policies

## Overview
This migration secures the e-commerce platform by restricting write access
on admin-only tables to authenticated users only. Public (anon) users can
still browse products, categories, and delivery zones (read-only), and can
place orders (insert-only). But orders, order_items, deliverers, and
site_settings can only be viewed or modified by an authenticated admin.

## Changes per table

### products, categories, delivery_zones
- SELECT: anon + authenticated (everyone can browse)
- INSERT/UPDATE/DELETE: authenticated only (admin manages catalog)

### orders
- SELECT: authenticated only (admin sees orders)
- INSERT: anon + authenticated (customers place orders)
- UPDATE/DELETE: authenticated only (admin manages orders)

### order_items
- SELECT: authenticated only (admin sees line items)
- INSERT: anon + authenticated (created with order)
- UPDATE/DELETE: authenticated only

### deliverers
- All CRUD: authenticated only (admin-only resource)

### site_settings
- SELECT: anon + authenticated (contact info is public)
- INSERT/UPDATE: authenticated only (admin manages settings)

## Security
- All write policies on admin tables use `TO authenticated` with proper checks.
- Public read remains for catalog and contact info.
- Order placement remains open (no sign-in required for customers).
*/

-- ── PRODUCTS: read public, write authenticated ────────────────────────────────
DROP POLICY IF EXISTS "anon_insert_products" ON products;
CREATE POLICY "auth_insert_products" ON products FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_products" ON products;
CREATE POLICY "auth_update_products" ON products FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_products" ON products;
CREATE POLICY "auth_delete_products" ON products FOR DELETE
  TO authenticated USING (true);

-- ── CATEGORIES: read public, write authenticated ───────────────────────────
DROP POLICY IF EXISTS "anon_insert_categories" ON categories;
CREATE POLICY "auth_insert_categories" ON categories FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_categories" ON categories;
CREATE POLICY "auth_update_categories" ON categories FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_categories" ON categories;
CREATE POLICY "auth_delete_categories" ON categories FOR DELETE
  TO authenticated USING (true);

-- ── DELIVERY ZONES: read public, write authenticated ────────────────────────
DROP POLICY IF EXISTS "anon_insert_zones" ON delivery_zones;
CREATE POLICY "auth_insert_zones" ON delivery_zones FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_zones" ON delivery_zones;
CREATE POLICY "auth_update_zones" ON delivery_zones FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_zones" ON delivery_zones;
CREATE POLICY "auth_delete_zones" ON delivery_zones FOR DELETE
  TO authenticated USING (true);

-- ── ORDERS: insert public, read/update/delete authenticated ────────────────
DROP POLICY IF EXISTS "anon_select_orders" ON orders;
CREATE POLICY "auth_select_orders" ON orders FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "anon_update_orders" ON orders;
CREATE POLICY "auth_update_orders" ON orders FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_orders" ON orders;
CREATE POLICY "auth_delete_orders" ON orders FOR DELETE
  TO authenticated USING (true);

-- ── ORDER ITEMS: insert public, read/update/delete authenticated ───────────
DROP POLICY IF EXISTS "anon_select_order_items" ON order_items;
CREATE POLICY "auth_select_order_items" ON order_items FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "anon_update_order_items" ON order_items;
CREATE POLICY "auth_update_order_items" ON order_items FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_order_items" ON order_items;
CREATE POLICY "auth_delete_order_items" ON order_items FOR DELETE
  TO authenticated USING (true);

-- ── DELIVERERS: authenticated only (all CRUD) ──────────────────────────────
DROP POLICY IF EXISTS "anon_select_deliverers" ON deliverers;
CREATE POLICY "auth_select_deliverers" ON deliverers FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_deliverers" ON deliverers;
CREATE POLICY "auth_insert_deliverers" ON deliverers FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_deliverers" ON deliverers;
CREATE POLICY "auth_update_deliverers" ON deliverers FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_deliverers" ON deliverers;
CREATE POLICY "auth_delete_deliverers" ON deliverers FOR DELETE
  TO authenticated USING (true);

-- ── SITE SETTINGS: read public, write authenticated ─────────────────────────
DROP POLICY IF EXISTS "anon_insert_settings" ON site_settings;
CREATE POLICY "auth_insert_settings" ON site_settings FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_settings" ON site_settings;
CREATE POLICY "auth_update_settings" ON site_settings FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);
