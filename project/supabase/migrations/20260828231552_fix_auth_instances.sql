/*
# Fix missing auth instance record

## Problem
The `auth.instances` table is empty, which causes the GoTrue auth service to fail
with "Database error checking email" when trying to create or look up users.
The `auth.users` table has an `instance_id` column that references `auth.instances`,
and the GoTrue auth service expects at least one instance row to exist.

## Fix
Insert a default instance row into `auth.instances` so that user creation and
authentication queries work correctly.

## Safety
- This only inserts a row if none exists — it does not modify or delete existing data.
- The UUID is generated randomly so it won't conflict with any existing instance.
*/

DO $$
DECLARE
  inst_id uuid;
  inst_count int;
BEGIN
  SELECT count(*) INTO inst_count FROM auth.instances;
  IF inst_count = 0 THEN
    inst_id := gen_random_uuid();
    INSERT INTO auth.instances (id, uuid, raw_base_config, created_at, updated_at)
    VALUES (
      inst_id,
      inst_id,
      '{}',
      now(),
      now()
    );
  END IF;
END $$;
