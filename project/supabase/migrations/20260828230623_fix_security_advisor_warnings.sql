/*
# Fix security advisor warnings on database functions

## Overview
Fixes 3 security warnings flagged by Supabase's database linter:
1. `assign_order_number` has a mutable search_path
2. `decrement_stock` is a SECURITY DEFINER function callable by anon
3. `decrement_stock` is callable by authenticated users

## Changes
- Set `search_path = public` on both functions to prevent search_path hijacking
- Revoke EXECUTE from anon and authenticated on `decrement_stock` (it's only
  called internally from a trigger, never directly from the API)
- Grant EXECUTE back to no one — the trigger runs as the owner, which is sufficient

## Security
- `decrement_stock` is only called by a trigger on the `order_items` table,
  never directly from client code, so removing EXECUTE grants is safe.
- `assign_order_number` is called from a trigger on `orders` insert, same logic.
*/

-- Fix search_path on assign_order_number
ALTER FUNCTION public.assign_order_number() SET search_path = public;

-- Fix search_path on decrement_stock
ALTER FUNCTION public.decrement_stock(p_product_id bigint, p_qty integer) SET search_path = public;

-- Revoke direct execution access on decrement_stock (only used via trigger)
REVOKE EXECUTE ON FUNCTION public.decrement_stock(p_product_id bigint, p_qty integer) FROM anon, authenticated;
