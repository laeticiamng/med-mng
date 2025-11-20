-- ========================================
-- Med-MNG Security - Création Users Test
-- ========================================
-- Exécuter dans Supabase SQL Editor

-- User test normal
INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    role,
    created_at,
    updated_at
)
VALUES (
    gen_random_uuid(),
    'test@med-mng.com',
    crypt('test123456', gen_salt('bf')),
    NOW(),
    'authenticated',
    NOW(),
    NOW()
)
ON CONFLICT (email) DO NOTHING;

-- User test admin
INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    role,
    created_at,
    updated_at
)
VALUES (
    gen_random_uuid(),
    'admin@med-mng.com',
    crypt('admin123456', gen_salt('bf')),
    NOW(),
    'authenticated',
    NOW(),
    NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Ajouter le rôle admin
INSERT INTO user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'admin@med-mng.com'
ON CONFLICT DO NOTHING;

-- Vérification
SELECT
    email,
    role,
    email_confirmed_at,
    created_at
FROM auth.users
WHERE email IN ('test@med-mng.com', 'admin@med-mng.com');

-- Instructions pour obtenir les JWT tokens:
-- 1. Se connecter à votre application avec test@med-mng.com / test123456
-- 2. Ouvrir DevTools → Application → Local Storage
-- 3. Chercher la clé "supabase.auth.token" ou similaire
-- 4. Copier la valeur du "access_token"
-- 5. Répéter pour admin@med-mng.com / admin123456

-- Alternative via API:
-- curl -X POST 'https://YOUR_PROJECT.supabase.co/auth/v1/token?grant_type=password' \
--   -H "apikey: YOUR_ANON_KEY" \
--   -H "Content-Type: application/json" \
--   -d '{"email": "test@med-mng.com", "password": "test123456"}'
