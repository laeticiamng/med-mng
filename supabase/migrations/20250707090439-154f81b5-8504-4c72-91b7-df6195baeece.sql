-- ========================================================
-- CRÉATION ENVIRONNEMENT TEST SÉCURISÉ MED-MNG
-- ========================================================

-- 1. Créer un schéma sandbox dédié au développement
CREATE SCHEMA IF NOT EXISTS sandbox;

-- 2. Créer les tables de test simplifiées dans le schéma sandbox
CREATE TABLE sandbox.items_test (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'general',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE sandbox.users_test (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    username TEXT,
    role TEXT DEFAULT 'student',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE sandbox.competences_test (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    level TEXT DEFAULT 'beginner',
    category TEXT DEFAULT 'medical',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE sandbox.skills_test (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    difficulty INTEGER DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 5),
    user_id UUID REFERENCES sandbox.users_test(id),
    competence_id UUID REFERENCES sandbox.competences_test(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Créer un rôle de développement avec permissions limitées
CREATE ROLE dev_sandbox_role;

-- 4. Accorder les permissions uniquement sur le schéma sandbox
GRANT USAGE ON SCHEMA sandbox TO dev_sandbox_role;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA sandbox TO dev_sandbox_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA sandbox TO dev_sandbox_role;

-- 5. Activer RLS sur toutes les tables de test
ALTER TABLE sandbox.items_test ENABLE ROW LEVEL SECURITY;
ALTER TABLE sandbox.users_test ENABLE ROW LEVEL SECURITY;
ALTER TABLE sandbox.competences_test ENABLE ROW LEVEL SECURITY;
ALTER TABLE sandbox.skills_test ENABLE ROW LEVEL SECURITY;

-- 6. Créer des politiques RLS permissives pour le développement
CREATE POLICY "Dev sandbox full access items" ON sandbox.items_test FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Dev sandbox full access users" ON sandbox.users_test FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Dev sandbox full access competences" ON sandbox.competences_test FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Dev sandbox full access skills" ON sandbox.skills_test FOR ALL USING (true) WITH CHECK (true);

-- 7. Insérer des données fictives pour les tests
INSERT INTO sandbox.users_test (email, username, role) VALUES
('dev@test.com', 'DevUser1', 'student'),
('test@test.com', 'TestUser2', 'teacher'),
('admin@test.com', 'AdminTest', 'admin');

INSERT INTO sandbox.competences_test (name, description, level, category) VALUES
('Communication médicale', 'Compétences de base en communication', 'beginner', 'medical'),
('Diagnostic clinique', 'Méthodes de diagnostic', 'intermediate', 'medical'),
('Pharmacologie', 'Connaissances pharmacologiques', 'advanced', 'medical'),
('Éthique médicale', 'Principes éthiques', 'beginner', 'ethics');

INSERT INTO sandbox.items_test (title, description, category) VALUES
('Item test 1', 'Premier item de test pour développement', 'test'),
('Item test 2', 'Deuxième item de test', 'demo'),
('Item test 3', 'Troisième item de test', 'sample');

-- Récupérer les IDs pour les relations
DO $$
DECLARE
    user1_id UUID;
    user2_id UUID;
    comp1_id UUID;
    comp2_id UUID;
BEGIN
    SELECT id INTO user1_id FROM sandbox.users_test WHERE email = 'dev@test.com';
    SELECT id INTO user2_id FROM sandbox.users_test WHERE email = 'test@test.com';
    SELECT id INTO comp1_id FROM sandbox.competences_test WHERE name = 'Communication médicale';
    SELECT id INTO comp2_id FROM sandbox.competences_test WHERE name = 'Diagnostic clinique';
    
    INSERT INTO sandbox.skills_test (name, description, difficulty, user_id, competence_id) VALUES
    ('Écoute active', 'Compétence d''écoute du patient', 2, user1_id, comp1_id),
    ('Anamnèse', 'Collecte d''informations patient', 3, user2_id, comp2_id),
    ('Examen clinique', 'Examen physique du patient', 4, user1_id, comp2_id);
END $$;

-- 8. Créer une fonction utilitaire pour le nettoyage des données de test
CREATE OR REPLACE FUNCTION sandbox.reset_test_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Supprimer toutes les données de test
    DELETE FROM sandbox.skills_test;
    DELETE FROM sandbox.items_test;
    DELETE FROM sandbox.competences_test;
    DELETE FROM sandbox.users_test;
    
    -- Réinsérer les données par défaut
    INSERT INTO sandbox.users_test (email, username, role) VALUES
    ('dev@test.com', 'DevUser1', 'student'),
    ('test@test.com', 'TestUser2', 'teacher'),
    ('admin@test.com', 'AdminTest', 'admin');
    
    INSERT INTO sandbox.competences_test (name, description, level, category) VALUES
    ('Communication médicale', 'Compétences de base en communication', 'beginner', 'medical'),
    ('Diagnostic clinique', 'Méthodes de diagnostic', 'intermediate', 'medical'),
    ('Pharmacologie', 'Connaissances pharmacologiques', 'advanced', 'medical'),
    ('Éthique médicale', 'Principes éthiques', 'beginner', 'ethics');
    
    INSERT INTO sandbox.items_test (title, description, category) VALUES
    ('Item test 1', 'Premier item de test pour développement', 'test'),
    ('Item test 2', 'Deuxième item de test', 'demo'),
    ('Item test 3', 'Troisième item de test', 'sample');
END;
$$;

-- 9. Accorder l'accès à la fonction de reset
GRANT EXECUTE ON FUNCTION sandbox.reset_test_data() TO dev_sandbox_role;

-- 10. Renforcer la sécurité sur les tables de production
-- S'assurer que RLS est activé sur les tables critiques existantes
ALTER TABLE public.edn_items_immersive ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.edn_items_complete ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ecos_situations_complete ENABLE ROW LEVEL SECURITY;

-- 11. Créer une vue sécurisée pour le monitoring (lecture seule)
CREATE OR REPLACE VIEW sandbox.test_stats AS
SELECT 
    'items' as table_name, 
    count(*) as record_count,
    max(created_at) as last_update
FROM sandbox.items_test
UNION ALL
SELECT 
    'users' as table_name, 
    count(*) as record_count,
    max(created_at) as last_update
FROM sandbox.users_test
UNION ALL
SELECT 
    'competences' as table_name, 
    count(*) as record_count,
    max(created_at) as last_update
FROM sandbox.competences_test
UNION ALL
SELECT 
    'skills' as table_name, 
    count(*) as record_count,
    max(created_at) as last_update
FROM sandbox.skills_test;

-- Accorder l'accès à la vue
GRANT SELECT ON sandbox.test_stats TO dev_sandbox_role;

-- 12. Commentaires de documentation
COMMENT ON SCHEMA sandbox IS 'Environnement de test sécurisé pour le développement MED-MNG';
COMMENT ON TABLE sandbox.items_test IS 'Table de test pour les items - données fictives uniquement';
COMMENT ON TABLE sandbox.users_test IS 'Table de test pour les utilisateurs - données fictives uniquement';
COMMENT ON TABLE sandbox.competences_test IS 'Table de test pour les compétences - données fictives uniquement';
COMMENT ON TABLE sandbox.skills_test IS 'Table de test pour les compétences utilisateur - données fictives uniquement';