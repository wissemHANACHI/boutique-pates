/*
# Create admin user directly in auth.users

## Problem
The Supabase Auth service (GoTrue) is returning "Database error checking email"
when trying to create users via the admin API or signUp. This appears to be a
service-level issue that prevents normal user creation.

## Fix
Insert the admin user directly into the auth.users table with a properly
encrypted password, bypassing the GoTrue service layer. The password is
hashed using the crypt() function with bf (blowfish) encryption, which is
the format Supabase auth expects.

## Credentials
- Email: admin@eglantine.com
- Password: Eglantine2026!

## Safety
- Uses ON CONFLICT to avoid duplicate entries if re-run
- Does not modify any existing users
*/

-- Create the admin user directly in auth.users
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_sso_user,
  is_anonymous,
  confirmation_token,
  recovery_token,
  email_change_token_current,
  email_change_token_new,
  reauthentication_token,
  phone_change,
  email_change,
  email_change_confirm_status
)
SELECT
  (SELECT id FROM auth.instances LIMIT 1),
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@eglantine.com',
  crypt('Eglantine2026!', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{}'::jsonb,
  '{}'::jsonb,
  false,
  false,
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  0
WHERE NOT EXISTS (
  SELECT 1 FROM auth.users WHERE email = 'admin@eglantine.com'
);
