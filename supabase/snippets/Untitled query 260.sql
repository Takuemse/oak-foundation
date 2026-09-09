SELECT id, email, encrypted_password, email_confirmed_at,
       confirmed_at, aud, role, raw_app_meta_data, raw_user_meta_data,
       is_sso_user, is_anonymous, instance_id
FROM auth.users
WHERE email = 'admin@oak-test.local';