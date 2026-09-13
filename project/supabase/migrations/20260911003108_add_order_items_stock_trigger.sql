/*
# Add trigger to decrement stock on order_items insert

## Problem
The `decrement_stock` function was locked down (REVOKE EXECUTE FROM anon,
authenticated) because it was supposed to be called only by a trigger.
But that trigger was never created. As a result, the client-side
`supabase.rpc("decrement_stock", ...)` call fails silently and stock
never decreases when an order is placed.

## Fix
Create an AFTER INSERT trigger on `order_items` that calls
`decrement_stock` for each inserted row. The trigger runs with the
table owner's privileges, so SECURITY INVOKER + no explicit grants
is correct and safe.

## Security
- `decrement_stock` stays SECURITY INVOKER with no EXECUTE grants to
  anon/authenticated — it can only be invoked by the trigger.
- The trigger fires per-row, passing `product_id` and `qty` from the
  inserted `order_items` row via a trigger wrapper function.
*/

-- Ensure the function exists and is locked down (idempotent)
CREATE OR REPLACE FUNCTION public.decrement_stock(p_product_id bigint, p_qty integer)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  UPDATE products
  SET stock = stock - p_qty
  WHERE id = p_product_id AND stock >= p_qty;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.decrement_stock(bigint, integer) FROM anon, authenticated;

-- Trigger wrapper function: reads NEW record and calls decrement_stock
CREATE OR REPLACE FUNCTION public.decrement_stock_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  IF NEW.product_id IS NOT NULL AND NEW.qty > 0 THEN
    PERFORM public.decrement_stock(NEW.product_id, NEW.qty);
  END IF;
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.decrement_stock_trigger() FROM anon, authenticated;

-- Create the trigger
DROP TRIGGER IF EXISTS trg_decrement_stock ON order_items;

CREATE TRIGGER trg_decrement_stock
  AFTER INSERT ON order_items
  FOR EACH ROW
  EXECUTE FUNCTION public.decrement_stock_trigger();
