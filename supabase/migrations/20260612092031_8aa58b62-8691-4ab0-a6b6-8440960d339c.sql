
DO $$
DECLARE v_uid uuid;
BEGIN
  SELECT id INTO v_uid FROM auth.users WHERE email = 'tinashelvurayai@gmail.com';
  IF v_uid IS NULL THEN
    v_uid := gen_random_uuid();
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token, email_change,
      email_change_token_new, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', v_uid, 'authenticated', 'authenticated',
      'tinashelvurayai@gmail.com',
      crypt('ES#1intelligent', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Tinashe Lee Vurayai"}'::jsonb,
      now(), now(), '', '', '', ''
    );
    INSERT INTO auth.identities (
      id, user_id, identity_data, provider, provider_id,
      created_at, updated_at, last_sign_in_at
    ) VALUES (
      gen_random_uuid(), v_uid,
      jsonb_build_object('sub', v_uid::text, 'email', 'tinashelvurayai@gmail.com', 'email_verified', true),
      'email', v_uid::text, now(), now(), now()
    );
  ELSE
    UPDATE auth.users
      SET encrypted_password = crypt('ES#1intelligent', gen_salt('bf')),
          email_confirmed_at = COALESCE(email_confirmed_at, now()),
          updated_at = now()
      WHERE id = v_uid;
  END IF;

  INSERT INTO public.profiles (id, email, full_name, access_level)
  VALUES (v_uid, 'tinashelvurayai@gmail.com', 'Tinashe Lee Vurayai', 'full')
  ON CONFLICT (id) DO UPDATE SET access_level = 'full', full_name = EXCLUDED.full_name;

  INSERT INTO public.user_roles (user_id, role) VALUES (v_uid, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
END $$;
