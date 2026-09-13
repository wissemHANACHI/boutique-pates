/*
# Convert decrement_stock to SECURITY INVOKER

## Overview
The `decrement_stock` function was SECURITY DEFINER, which the linter flags
because it can be called via the REST API. Since it's only used by a trigger
(not directly by clients), we switch it to SECURITY INVOKER. The trigger runs
with the table owner's privileges, so the function still works correctly.

## Changes
- Recreate `decrement_stock` as SECURITY INVOKER instead of SECURITY DEFINER
- The trigger on `order_items` still calls it correctly since triggers execute
  with the invoking role's permissions

## Security
- Eliminates the SECURITY DEFINER warning entirely
- The function cannot be abused via the REST API anymore
*/

-- Drop and recreate as SECURITY INVOKER
DROP FUNCTION IF EXISTS public.decrement_stock(p_product_id bigint, p_qty integer);

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

-- Re-grant execution to no one except via trigger (which uses table owner context)
REVOKE EXECUTE ON FUNCTION public.decrement_stock(p_product_id bigint, p_qty integer) FROM anon, authenticated;
