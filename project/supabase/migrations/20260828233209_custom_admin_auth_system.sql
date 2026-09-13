/*
# Custom admin authentication system

## Problem
Supabase Auth (GoTrue) is returning "Database error checking email" for all
user operations. This is a service-level issue that cannot be resolved
through schema fixes.

## Solution
Create a custom, secure token-based authentication system that bypasses
GoTrue entirely:

1. **admin_users table** — stores admin email and bcrypt password hash
2. **admin_sessions table** — stores session tokens with 24h expiry
3. **admin_login() function** — verifies credentials, returns session token
4. **admin_verify_token() function** — checks if token is valid
5. **admin_logout() function** — invalidates a session token
6. **admin_*_rpc functions** — SECURITY DEFINER functions for admin CRUD

## Security
- Passwords hashed with crypt() + gen_salt('bf') (bcrypt)
- Session tokens are 32-byte random hex strings
- Sessions expire after 24 hours
- All admin operations go through SECURITY DEFINER functions that
  verify the token before executing, bypassing RLS

## Credentials
- Email: admin@eglantine.com
- Password: Eglantine2026!
*/

-- ── ADMIN USERS TABLE ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_users (
  id                integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  email             text NOT NULL,
  password_hash     text NOT NULL,
  created_at        timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- ── ADMIN SESSIONS TABLE ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_sessions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token       text NOT NULL UNIQUE,
  created_at  timestamptz NOT NULL DEFAULT now(),
  expires_at  timestamptz NOT NULL DEFAULT (now() + interval '24 hours')
);

ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;

-- ── Seed the admin user (idempotent) ───────────────────────────────────────────
INSERT INTO admin_users (id, email, password_hash)
VALUES (1, 'admin@eglantine.com', crypt('Eglantine2026!', gen_salt('bf')))
ON CONFLICT (id) DO UPDATE
SET email = EXCLUDED.email,
    password_hash = EXCLUDED.password_hash;

-- ── LOGIN FUNCTION ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION admin_login(p_email text, p_password text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_hash text;
  v_token text;
BEGIN
  SELECT password_hash INTO v_hash FROM admin_users WHERE email = p_email;
  IF v_hash IS NULL THEN
    RETURN NULL;
  END IF;
  IF v_hash != crypt(p_password, v_hash) THEN
    RETURN NULL;
  END IF;

  v_token := encode(gen_random_bytes(32), 'hex');
  INSERT INTO admin_sessions (token) VALUES (v_token);

  RETURN v_token;
END;
$$;

GRANT EXECUTE ON FUNCTION admin_login(text, text) TO anon, authenticated;

-- ── VERIFY TOKEN FUNCTION ──────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION admin_verify_token(p_token text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM admin_sessions WHERE expires_at < now();
  PERFORM 1 FROM admin_sessions WHERE token = p_token AND expires_at > now();
  RETURN FOUND;
END;
$$;

GRANT EXECUTE ON FUNCTION admin_verify_token(text) TO anon, authenticated;

-- ── LOGOUT FUNCTION ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION admin_logout(p_token text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM admin_sessions WHERE token = p_token;
END;
$$;

GRANT EXECUTE ON FUNCTION admin_logout(text) TO anon, authenticated;

-- ── ADMIN RPC: get_admin_data ──────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION admin_get_data(p_token text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_orders jsonb;
  v_order_items jsonb;
  v_deliverers jsonb;
BEGIN
  IF NOT admin_verify_token(p_token) THEN
    RETURN jsonb_build_object('error', 'invalid_token');
  END IF;

  SELECT COALESCE(jsonb_agg(row_to_json(o)), '[]'::jsonb) INTO v_orders
  FROM (SELECT * FROM orders ORDER BY created_at DESC) o;

  SELECT COALESCE(jsonb_agg(row_to_json(i)), '[]'::jsonb) INTO v_order_items
  FROM (SELECT * FROM order_items) i;

  SELECT COALESCE(jsonb_agg(row_to_json(d)), '[]'::jsonb) INTO v_deliverers
  FROM (SELECT * FROM deliverers) d;

  RETURN jsonb_build_object(
    'orders', v_orders,
    'order_items', v_order_items,
    'deliverers', v_deliverers
  );
END;
$$;

GRANT EXECUTE ON FUNCTION admin_get_data(text) TO anon, authenticated;

-- ── ADMIN RPC: update_order_status ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION admin_update_order_status(p_token text, p_order_id bigint, p_status text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT admin_verify_token(p_token) THEN
    RETURN false;
  END IF;
  UPDATE orders SET status = p_status WHERE id = p_order_id;
  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION admin_update_order_status(text, bigint, text) TO anon, authenticated;

-- ── ADMIN RPC: upsert_product ──────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION admin_upsert_product(
  p_token text,
  p_id bigint,
  p_category_id bigint,
  p_name text,
  p_description text,
  p_price integer,
  p_unit text,
  p_stock integer,
  p_active boolean,
  p_low_stock_alert integer,
  p_emoji text,
  p_badge text,
  p_image_url text,
  p_sort_order integer
)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id bigint;
BEGIN
  IF NOT admin_verify_token(p_token) THEN
    RETURN NULL;
  END IF;

  IF p_id = 0 THEN
    INSERT INTO products (category_id, name, description, price, unit, stock, active, low_stock_alert, emoji, badge, image_url, sort_order)
    VALUES (p_category_id, p_name, p_description, p_price, p_unit, p_stock, p_active, p_low_stock_alert, p_emoji, p_badge, p_image_url, p_sort_order)
    RETURNING id INTO v_id;
  ELSE
    UPDATE products SET
      category_id = p_category_id,
      name = p_name,
      description = p_description,
      price = p_price,
      unit = p_unit,
      stock = p_stock,
      active = p_active,
      low_stock_alert = p_low_stock_alert,
      emoji = p_emoji,
      badge = p_badge,
      image_url = p_image_url,
      sort_order = p_sort_order
    WHERE id = p_id
    RETURNING id INTO v_id;
  END IF;

  RETURN v_id;
END;
$$;

GRANT EXECUTE ON FUNCTION admin_upsert_product(text, bigint, bigint, text, text, integer, text, integer, boolean, integer, text, text, text, integer) TO anon, authenticated;

-- ── ADMIN RPC: delete_product ──────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION admin_delete_product(p_token text, p_id bigint)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT admin_verify_token(p_token) THEN
    RETURN false;
  END IF;
  DELETE FROM products WHERE id = p_id;
  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION admin_delete_product(text, bigint) TO anon, authenticated;

-- ── ADMIN RPC: update_product_stock ────────────────────────────────────────────
CREATE OR REPLACE FUNCTION admin_update_stock(p_token text, p_id bigint, p_stock integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT admin_verify_token(p_token) THEN
    RETURN false;
  END IF;
  UPDATE products SET stock = p_stock WHERE id = p_id;
  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION admin_update_stock(text, bigint, integer) TO anon, authenticated;

-- ── ADMIN RPC: update_delivery_zone ────────────────────────────────────────────
CREATE OR REPLACE FUNCTION admin_update_zone(p_token text, p_id bigint, p_name text, p_price integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT admin_verify_token(p_token) THEN
    RETURN false;
  END IF;
  UPDATE delivery_zones SET name = p_name, price = p_price WHERE id = p_id;
  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION admin_update_zone(text, bigint, text, integer) TO anon, authenticated;

-- ── ADMIN RPC: update_site_settings ────────────────────────────────────────────
CREATE OR REPLACE FUNCTION admin_update_settings(p_token text, p_phone text, p_instagram text, p_address text, p_hours text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT admin_verify_token(p_token) THEN
    RETURN false;
  END IF;
  UPDATE site_settings SET phone = p_phone, instagram = p_instagram, address = p_address, hours = p_hours WHERE id = 1;
  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION admin_update_settings(text, text, text, text, text) TO anon, authenticated;

-- ── RLS POLICY FIXES ───────────────────────────────────────────────────────────
-- Re-enable anon INSERT on orders and order_items so customers can place orders
-- without signing in. Admin reads/writes go through SECURITY DEFINER functions
-- that bypass RLS.
DROP POLICY IF EXISTS "anon_insert_orders" ON orders;
CREATE POLICY "anon_insert_orders" ON orders FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_insert_order_items" ON order_items;
CREATE POLICY "anon_insert_order_items" ON order_items FOR INSERT
  TO anon, authenticated WITH CHECK (true);
