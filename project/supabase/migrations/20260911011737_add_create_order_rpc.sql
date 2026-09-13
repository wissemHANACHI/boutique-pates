/*
# Add create_order() RPC for server-side total calculation

## Problem
The order total was calculated client-side and inserted as-is into the
`orders` table. The INSERT policy has `WITH CHECK (true)`, so anyone could
submit a fake total via devtools.

## Fix
Create a SECURITY DEFINER function `create_order()` that:
1. Receives client info + zone name + an array of {product_id, qty} items
2. Looks up real prices from the `products` table
3. Looks up the real delivery fee from `delivery_zones` by zone name
4. Calculates the total server-side
5. Inserts the order (trigger assigns order_number automatically)
6. Inserts the order_items (trigger decrements stock automatically)
7. Returns the created order row

## Security
- SECURITY DEFINER so it can bypass RLS for the inserts
- search_path = public to prevent hijacking
- EXECUTE granted to anon, authenticated (the app has no sign-in)
- Direct INSERT on orders is revoked from anon/authenticated so the
  function is the only path to create orders
*/

CREATE OR REPLACE FUNCTION public.create_order(
  p_client_name    text,
  p_client_phone   text,
  p_client_address text,
  p_zone           text,
  p_notes          text DEFAULT '',
  p_items          jsonb  DEFAULT '[]'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_id      bigint;
  v_delivery_fee   integer := 0;
  v_subtotal       integer := 0;
  v_total          integer := 0;
  v_item           jsonb;
  v_product        record;
  v_item_name      text;
  v_item_price     integer;
  v_item_qty       integer;
  v_product_id     bigint;
BEGIN
  -- Validate required fields
  IF p_client_name IS NULL OR btrim(p_client_name) = '' THEN
    RAISE EXCEPTION 'Le nom du client est requis';
  END IF;
  IF p_client_phone IS NULL OR btrim(p_client_phone) = '' THEN
    RAISE EXCEPTION 'Le numéro de téléphone est requis';
  END IF;
  IF p_zone IS NULL OR btrim(p_zone) = '' THEN
    RAISE EXCEPTION 'La zone de livraison est requise';
  END IF;
  IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Le panier est vide';
  END IF;

  -- Look up delivery fee from the real delivery_zones table
  SELECT price INTO v_delivery_fee
  FROM delivery_zones
  WHERE name = p_zone
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Zone de livraison invalide : %', p_zone;
  END IF;

  -- Calculate subtotal from real product prices
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    v_product_id := (v_item->>'product_id')::bigint;
    v_item_qty   := (v_item->>'qty')::integer;

    IF v_item_qty IS NULL OR v_item_qty <= 0 THEN
      RAISE EXCEPTION 'Quantité invalide pour le produit %', v_product_id;
    END IF;

    SELECT name, price INTO v_item_name, v_item_price
    FROM products
    WHERE id = v_product_id AND active = true;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Produit introuvable ou inactif : %', v_product_id;
    END IF;

    v_subtotal := v_subtotal + (v_item_price * v_item_qty);
  END LOOP;

  v_total := v_subtotal + v_delivery_fee;

  -- Insert the order (order_number assigned by trigger)
  INSERT INTO orders (
    client_name, client_phone, client_address,
    zone, delivery_fee, notes, total,
    payment_mode, status
  )
  VALUES (
    p_client_name, p_client_phone, p_client_address,
    p_zone, v_delivery_fee, p_notes, v_total,
    'À la livraison', 'Nouvelle'
  )
  RETURNING id INTO v_order_id;

  -- Insert order_items (stock decremented by trigger on order_items)
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    v_product_id := (v_item->>'product_id')::bigint;
    v_item_qty   := (v_item->>'qty')::integer;

    SELECT name, price INTO v_item_name, v_item_price
    FROM products
    WHERE id = v_product_id;

    INSERT INTO order_items (order_id, product_id, name, qty, price)
    VALUES (v_order_id, v_product_id, v_item_name, v_item_qty, v_item_price);
  END LOOP;

  -- Return the created order
  SELECT jsonb_build_object(
    'id', o.id,
    'order_number', o.order_number,
    'total', o.total,
    'delivery_fee', o.delivery_fee
  )
  INTO v_item
  FROM orders o
  WHERE o.id = v_order_id;

  RETURN v_item;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_order(
  text, text, text, text, text, jsonb
) TO anon, authenticated;

-- Revoke direct INSERT on orders so create_order() is the only path
REVOKE INSERT ON public.orders FROM anon, authenticated;
