
-- Améliorer la table des profils utilisateurs pour stocker plus d'informations
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  name TEXT,
  role TEXT DEFAULT 'user',
  is_test_account BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Activer RLS sur la table profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Politique pour que les utilisateurs voient leur propre profil
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Politique pour que les utilisateurs mettent à jour leur propre profil
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Fonction pour créer un profil automatiquement lors de l'inscription avec préfixe MED MNG
CREATE OR REPLACE FUNCTION public.med_mng_handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, is_test_account)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', ''),
    CASE WHEN new.email = 'test@medmng.com' THEN true ELSE false END
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour créer automatiquement le profil avec fonction MED MNG
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.med_mng_handle_new_user();

-- Modifier la fonction de quota pour les comptes test avec préfixe MED MNG
CREATE OR REPLACE FUNCTION public.med_mng_get_remaining_quota()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  remaining_credits INTEGER := 0;
  is_test BOOLEAN := false;
BEGIN
  -- Vérifier si c'est un compte test
  SELECT COALESCE(profiles.is_test_account, false) INTO is_test
  FROM public.profiles
  WHERE profiles.id = auth.uid();
  
  -- Si c'est un compte test, retourner des crédits illimités
  IF is_test THEN
    RETURN 999999;
  END IF;
  
  -- Sinon, retourner les crédits normaux
  SELECT COALESCE(credits_left, 0) INTO remaining_credits
  FROM public.med_mng_subscriptions
  WHERE user_id = auth.uid();
  
  RETURN remaining_credits;
END;
$$;

-- Créer la table pour les templates d'emails
CREATE TABLE IF NOT EXISTS public.email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  variables JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insérer les templates d'emails
INSERT INTO public.email_templates (name, subject, html_content, variables) VALUES
('welcome', 'Bienvenue sur MedMNG ! 🎵', '
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Bienvenue sur MedMNG</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">🎵 Bienvenue sur MedMNG !</h1>
        <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">La plateforme qui révolutionne l''apprentissage médical</p>
    </div>
    
    <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <h2 style="color: #667eea;">Bonjour {{name}} ! 👋</h2>
        
        <p>Félicitations ! Votre compte MedMNG a été créé avec succès. Vous venez de rejoindre une communauté d''étudiants et professionnels de santé qui transforment leur apprentissage grâce à l''IA musicale.</p>
        
        <div style="background: #f8f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #667eea; margin-top: 0;">🚀 Que pouvez-vous faire maintenant ?</h3>
            <ul style="margin: 0; padding-left: 20px;">
                <li><strong>Créer des chansons personnalisées</strong> pour vos contenus pédagogiques</li>
                <li><strong>Explorer notre bibliothèque</strong> de musiques éducatives</li>
                <li><strong>Transformer vos QCM</strong> en expériences immersives</li>
                <li><strong>Générer des bandes dessinées</strong> éducatives</li>
            </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{app_url}}/med-mng/create" style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">🎵 Créer ma première chanson</a>
        </div>
        
        <div style="background: #e8f2ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0;"><strong>💡 Astuce :</strong> Commencez par explorer nos exemples dans la bibliothèque pour vous inspirer !</p>
        </div>
        
        <p>Si vous avez des questions, notre équipe est là pour vous accompagner. Répondez simplement à cet email !</p>
        
        <p style="margin-top: 30px;">À très bientôt sur MedMNG ! 🎶</p>
        <p><strong>L''équipe MedMNG</strong></p>
    </div>
    
    <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
        <p>MedMNG - Révolutionner l''apprentissage médical par l''IA musicale</p>
    </div>
</body>
</html>
', '{"name": "", "app_url": ""}'),

('subscription_success', 'Votre abonnement MedMNG est activé ! 🎉', '
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Abonnement activé - MedMNG</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Abonnement Activé !</h1>
        <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Bienvenue dans l''univers premium de MedMNG</p>
    </div>
    
    <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <h2 style="color: #667eea;">Félicitations {{name}} ! 🚀</h2>
        
        <p>Votre abonnement <strong>{{plan_name}}</strong> est maintenant actif ! Vous avez désormais accès à toutes les fonctionnalités premium de MedMNG.</p>
        
        <div style="background: #f0f8ff; border: 2px solid #667eea; border-radius: 10px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #667eea; margin-top: 0;">📦 Votre abonnement {{plan_name}}</h3>
            <ul style="margin: 0; padding-left: 20px;">
                <li><strong>{{credits}} crédits/mois</strong> pour la génération musicale</li>
                <li><strong>Qualité premium</strong> garantie</li>
                <li><strong>QCM et tableaux illimités</strong></li>
                <li><strong>Support prioritaire</strong></li>
                {{#if_premium}}<li><strong>Bandes dessinées éducatives</strong></li>{{/if_premium}}
            </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{app_url}}/med-mng/create" style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block; margin: 5px;">🎵 Créer une chanson</a>
            <a href="{{app_url}}/med-mng/library" style="background: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block; margin: 5px;">📚 Ma bibliothèque</a>
        </div>
        
        <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <p style="margin: 0;"><strong>🎯 Premiers pas recommandés :</strong></p>
            <ol style="margin: 10px 0 0 0; padding-left: 20px;">
                <li>Explorez les exemples dans votre bibliothèque</li>
                <li>Créez votre première chanson personnalisée</li>
                <li>Testez les QCM immersifs</li>
                <li>Découvrez la génération de bandes dessinées</li>
            </ol>
        </div>
        
        <p>Votre parcours d''apprentissage révolutionnaire commence maintenant ! Notre IA musicale est prête à transformer vos contenus pédagogiques en expériences mémorables.</p>
        
        <p style="margin-top: 30px;">Excellente découverte ! 🎶</p>
        <p><strong>L''équipe MedMNG</strong></p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="font-size: 12px; color: #666;">
            <strong>Détails de facturation :</strong><br>
            Plan : {{plan_name}}<br>
            Montant : {{amount}}€/mois<br>
            Date de renouvellement : {{renewal_date}}
        </p>
    </div>
    
    <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
        <p>MedMNG - Révolutionner l''apprentissage médical par l''IA musicale</p>
    </div>
</body>
</html>
', '{"name": "", "plan_name": "", "credits": "", "amount": "", "renewal_date": "", "app_url": ""}')

ON CONFLICT (name) DO UPDATE SET
  subject = EXCLUDED.subject,
  html_content = EXCLUDED.html_content,
  variables = EXCLUDED.variables,
  updated_at = now();

-- Fonction pour trigger les emails avec préfixe MED MNG
CREATE OR REPLACE FUNCTION public.med_mng_trigger_welcome_email()
RETURNS TRIGGER AS $$
BEGIN
  -- Appeler la fonction d'envoi d'email de bienvenue
  PERFORM pg_notify('med_mng_send_welcome_email', json_build_object(
    'user_id', NEW.id,
    'email', NEW.email,
    'name', COALESCE(NEW.raw_user_meta_data->>'name', ''),
    'platform', 'med-mng'
  )::text);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour envoyer l'email de bienvenue avec fonction MED MNG
DROP TRIGGER IF EXISTS med_mng_welcome_email_trigger ON auth.users;
CREATE TRIGGER med_mng_welcome_email_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.med_mng_trigger_welcome_email();
