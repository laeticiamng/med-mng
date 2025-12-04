import logger from '@/lib/logger';
import { Helmet } from 'react-helmet-async';
import { Link, Navigate } from 'react-router-dom';
import { ROUTE_PATHS } from '@/config/routes';
import { ArrowLeft, Shield, Eye, EyeOff, Lock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export default function ProfilePrivacySettings() {
  // ✅ SÉCURITÉ: Vérification d'authentification
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/med-mng/login" replace />;
  }

  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState({
    profilePublic: true,
    showEmail: false,
    showAchievements: true,
    showActivity: true,
    showStats: true,
    allowMessages: true,
    allowFollowers: true,
    searchable: true,
  });

  const handleToggle = (key: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }));
  };

  // ✅ Charger les paramètres existants
  useEffect(() => {
    const loadSettings = async () => {
      const { data, error } = await supabase
        .from('user_privacy_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setSettings({
          profilePublic: data.profile_public ?? true,
          showEmail: data.show_email ?? false,
          showAchievements: data.show_achievements ?? true,
          showActivity: data.show_activity ?? true,
          showStats: data.show_stats ?? true,
          allowMessages: data.allow_messages ?? true,
          allowFollowers: data.allow_followers ?? true,
          searchable: data.searchable ?? true,
        });
      }
    };

    loadSettings();
  }, [user.id]);

  // ✅ CORRECTIF: Vraie sauvegarde dans la base de données
  const handleSave = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('user_privacy_settings')
        .upsert({
          user_id: user.id,
          profile_public: settings.profilePublic,
          show_email: settings.showEmail,
          show_achievements: settings.showAchievements,
          show_activity: settings.showActivity,
          show_stats: settings.showStats,
          allow_messages: settings.allowMessages,
          allow_followers: settings.allowFollowers,
          searchable: settings.searchable,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast({
        title: "Paramètres sauvegardés",
        description: "Vos préférences de confidentialité ont été mises à jour",
      });
    } catch (error) {
      logger.error('Error saving privacy settings:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder vos paramètres",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Confidentialité du Profil | Med-Mng</title>
        <meta name="description" content="Gérez vos paramètres de confidentialité" />
      </Helmet>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Link to={ROUTE_PATHS.settings}>
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour aux paramètres
            </Button>
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold">Confidentialité du Profil</h1>
          </div>
          <p className="text-muted-foreground">
            Contrôlez qui peut voir vos informations
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Visibilité du Profil</CardTitle>
            <CardDescription>
              Gérez ce qui est visible pour les autres utilisateurs
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <Eye className="w-5 h-5 text-blue-600" />
                <div>
                  <Label htmlFor="profilePublic" className="text-base">Profil Public</Label>
                  <p className="text-sm text-muted-foreground">
                    Votre profil est visible dans l'annuaire
                  </p>
                </div>
              </div>
              <Switch
                id="profilePublic"
                checked={settings.profilePublic}
                onCheckedChange={() => handleToggle('profilePublic')}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <EyeOff className="w-5 h-5 text-gray-600" />
                <div>
                  <Label htmlFor="showEmail" className="text-base">Afficher l'Email</Label>
                  <p className="text-sm text-muted-foreground">
                    Votre adresse email sera visible sur votre profil
                  </p>
                </div>
              </div>
              <Switch
                id="showEmail"
                checked={settings.showEmail}
                onCheckedChange={() => handleToggle('showEmail')}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <Shield className="w-5 h-5 text-yellow-600" />
                <div>
                  <Label htmlFor="showAchievements" className="text-base">Afficher les Réalisations</Label>
                  <p className="text-sm text-muted-foreground">
                    Vos badges et trophées seront visibles
                  </p>
                </div>
              </div>
              <Switch
                id="showAchievements"
                checked={settings.showAchievements}
                onCheckedChange={() => handleToggle('showAchievements')}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <Lock className="w-5 h-5 text-purple-600" />
                <div>
                  <Label htmlFor="showActivity" className="text-base">Afficher l'Activité</Label>
                  <p className="text-sm text-muted-foreground">
                    Votre activité récente sera visible
                  </p>
                </div>
              </div>
              <Switch
                id="showActivity"
                checked={settings.showActivity}
                onCheckedChange={() => handleToggle('showActivity')}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <Lock className="w-5 h-5 text-green-600" />
                <div>
                  <Label htmlFor="showStats" className="text-base">Afficher les Statistiques</Label>
                  <p className="text-sm text-muted-foreground">
                    Vos stats (points, rang) seront visibles
                  </p>
                </div>
              </div>
              <Switch
                id="showStats"
                checked={settings.showStats}
                onCheckedChange={() => handleToggle('showStats')}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Interactions</CardTitle>
            <CardDescription>
              Contrôlez comment les autres peuvent interagir avec vous
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="allowMessages" className="text-base">Autoriser les Messages</Label>
                <p className="text-sm text-muted-foreground">
                  Les autres utilisateurs peuvent vous envoyer des messages
                </p>
              </div>
              <Switch
                id="allowMessages"
                checked={settings.allowMessages}
                onCheckedChange={() => handleToggle('allowMessages')}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="allowFollowers" className="text-base">Autoriser les Abonnés</Label>
                <p className="text-sm text-muted-foreground">
                  Les utilisateurs peuvent s'abonner à votre profil
                </p>
              </div>
              <Switch
                id="allowFollowers"
                checked={settings.allowFollowers}
                onCheckedChange={() => handleToggle('allowFollowers')}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="searchable" className="text-base">Profil Recherchable</Label>
                <p className="text-sm text-muted-foreground">
                  Votre profil apparaît dans les recherches
                </p>
              </div>
              <Switch
                id="searchable"
                checked={settings.searchable}
                onCheckedChange={() => handleToggle('searchable')}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Link to={ROUTE_PATHS.settings}>
            <Button variant="outline">Annuler</Button>
          </Link>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Sauvegarde..." : "Sauvegarder les paramètres"}
          </Button>
        </div>
      </div>
    </>
  );
}
