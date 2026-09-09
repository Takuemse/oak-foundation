-- =========================================================
-- LOCAL DEV SEED DATA
-- Recreated automatically on every `supabase db reset`
-- NEVER use this pattern against a production database
-- =========================================================

INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token,
    email_change,
    email_change_token_new,
    email_change_token_current,
    phone_change,
    phone_change_token
)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'admin@oak-test.local',
    crypt('OakAdmin123!', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"email_verified":true}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    '',
    '',
    '',
    ''
);

INSERT INTO public.admin_users (user_id, role)
SELECT id, 'super_admin'
FROM auth.users
WHERE email = 'admin@oak-test.local';