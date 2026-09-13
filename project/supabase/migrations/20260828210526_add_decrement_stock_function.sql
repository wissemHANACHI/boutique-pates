/*
# Add decrement_stock function

Creates a SECURITY DEFINER function to atomically decrement product stock
when an order is placed. This prevents race conditions and ensures stock
never goes negative.

## Security
- SECURITY DEFINER so it can bypass RLS for the stock update
- Named args (p_product_id, p_qty) to avoid ambiguity
- Uses GREATEST to prevent negative stock
*/

CREATE OR REPLACE FUNCTION decrement_stock(p_product_id bigint, p_qty integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE products
  SET stock = GREATEST(0, stock - p_qty)
  WHERE id = p_product_id;
END;
$$;

GRANT EXECUTE ON FUNCTION decrement_stock(bigint, integer) TO anon, authenticated;
