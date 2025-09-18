import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Volume2, 
  Globe, 
  Download,
  Trash2,
  Eye,
  EyeOff,
  Smartphone,
  Monitor
} from 'lucide-react';
import { MedMngLayout } from '@/components/med-mng/MedMngLayout';
import { withAuth } from '@/components/med-mng/withAuth';
import { useToast } from '@/hooks/use-toast';
import { useAnalyticsConsent } from '@/hooks/analytics/useAnalyticsConsent';
import { ANALYTICS_CONSENT_VERSION } from '@/services/CanonicalAnalyticsTracker';

const Settings = () => {
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [settings, setSettings] = useState({
    profile: {
      firstName: 'Jean',
      lastName: 'Dupont',
      email: 'jean.dupont@medecine.fr',
      university: 'Université Paris Descartes',
      year: 'D3',
      specialization: 'Médecine Générale'
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      studyReminders: true,
      progressReports: true,
      weeklyDigest: true,
      newContent: false
    },
    privacy: {
      profileVisibility: 'friends',
      shareProgress: true,
      marketingEmails: false
    },
    appearance: {
      theme: 'system',
      language: 'fr',
      fontSize: 'medium',
      reducedMotion: false
    },
    audio: {
      masterVolume: 75,
      effectsVolume: 60,
      voiceVolume: 80,
      backgroundMusic: true,
      soundEffects: true
    },
    study: {
      defaultDifficulty: 'medium',
      sessionDuration: 30,
      autoPlay: true,
      showHints: true,
      trackProgress: true
    }
  });

  const {
    optIn: analyticsOptIn,
    retentionDays,
    loading: analyticsLoading,
    updateConsent,
  } = useAnalyticsConsent();
  const [retentionValue, setRetentionValue] = useState(retentionDays);
  const [updatingAnalytics, setUpdatingAnalytics] = useState(false);

  useEffect(() => {
    setRetentionValue(retentionDays);
  }, [retentionDays]);

  const updateSetting = (section: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [key]: value
      }
    }));

    toast({
      title: "Paramètre mis à jour",
      description: "Vos modifications ont été sauvegardées.",
    });
  };

  const handleToggleAnalytics = async (checked: boolean) => {
    setUpdatingAnalytics(true);
    try {
      await updateConsent(checked, retentionValue);
      toast({
        title: checked ? 'Analytics activées' : 'Analytics désactivées',
        description: checked
          ? 'Merci de contribuer à l’amélioration de la plateforme.'
          : 'Vos données d’usage ne seront plus collectées.',
      });
    } catch (error) {
      console.error('analytics opt-in error', error);
      toast({
        title: 'Erreur analytics',
        description: 'Impossible de mettre à jour vos préférences pour le moment.',
        variant: 'destructive',
      });
    } finally {
      setUpdatingAnalytics(false);
    }
  };

  const handleRetentionChange = async (value: string) => {
    const parsed = Number.parseInt(value, 10) || retentionDays;
    setRetentionValue(parsed);
    if (!analyticsOptIn) {
      return;
    }

    setUpdatingAnalytics(true);
    try {
      await updateConsent(true, parsed);
      toast({
        title: 'Période de conservation mise à jour',
        description: `Les événements seront conservés ${parsed} jours au maximum.`,
      });
    } catch (error) {
      console.error('analytics retention update error', error);
      toast({
        title: 'Erreur analytics',
        description: 'Impossible de modifier la durée de conservation.',
        variant: 'destructive',
      });
    } finally {
      setUpdatingAnalytics(false);
    }
  };

  const exportData = () => {
    const data = {
      settings,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medmng-settings-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Données exportées",
      description: "Vos paramètres ont été téléchargés.",
    });
  };

  return (
    <MedMngLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Paramètres</h1>
          <p className="text-gray-600">
            Personnalisez votre expérience MED-MNG selon vos préférences
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profil</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Confidentialité</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">Apparence</span>
            </TabsTrigger>
            <TabsTrigger value="audio" className="flex items-center gap-2">
              <Volume2 className="h-4 w-4" />
              <span className="hidden sm:inline">Audio</span>
            </TabsTrigger>
            <TabsTrigger value="advanced" className="flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              <span className="hidden sm:inline">Avancé</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informations Personnelles</CardTitle>
                <CardDescription>
                  Gérez vos informations de profil et vos préférences académiques
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">Prénom</Label>
                    <Input
                      id="firstName"
                      value={settings.profile.firstName}
                      onChange={(e) => updateSetting('profile', 'firstName', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Nom</Label>
                    <Input
                      id="lastName"
                      value={settings.profile.lastName}
                      onChange={(e) => updateSetting('profile', 'lastName', e.target.value)}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.profile.email}
                    onChange={(e) => updateSetting('profile', 'email', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="university">Université</Label>
                  <Select
                    value={settings.profile.university}
                    onValueChange={(value) => updateSetting('profile', 'university', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Université Paris Descartes">Université Paris Descartes</SelectItem>
                      <SelectItem value="Sorbonne Université">Sorbonne Université</SelectItem>
                      <SelectItem value="Université Lyon 1">Université Lyon 1</SelectItem>
                      <SelectItem value="Autre">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="year">Année d'étude</Label>
                    <Select
                      value={settings.profile.year}
                      onValueChange={(value) => updateSetting('profile', 'year', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="D1">D1</SelectItem>
                        <SelectItem value="D2">D2</SelectItem>
                        <SelectItem value="D3">D3</SelectItem>
                        <SelectItem value="D4">D4</SelectItem>
                        <SelectItem value="Interne">Interne</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="specialization">Spécialisation</Label>
                    <Select
                      value={settings.profile.specialization}
                      onValueChange={(value) => updateSetting('profile', 'specialization', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Médecine Générale">Médecine Générale</SelectItem>
                        <SelectItem value="Cardiologie">Cardiologie</SelectItem>
                        <SelectItem value="Neurologie">Neurologie</SelectItem>
                        <SelectItem value="Pédiatrie">Pédiatrie</SelectItem>
                        <SelectItem value="Chirurgie">Chirurgie</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="pt-4">
                  <Button>Sauvegarder les modifications</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sécurité du Compte</CardTitle>
                <CardDescription>
                  Gérez vos paramètres de sécurité et mot de passe
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Entrez votre mot de passe actuel"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Entrez votre nouveau mot de passe"
                  />
                </div>
                
                <div>
                  <Label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirmez votre nouveau mot de passe"
                  />
                </div>

                <div className="pt-4">
                  <Button>Changer le mot de passe</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Préférences de Notification</CardTitle>
                <CardDescription>
                  Choisissez comment vous souhaitez être informé des mises à jour
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {Object.entries(settings.notifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        {key === 'emailNotifications' && 'Notifications par email'}
                        {key === 'pushNotifications' && 'Notifications push'}
                        {key === 'studyReminders' && 'Rappels d\'étude'}
                        {key === 'progressReports' && 'Rapports de progression'}
                        {key === 'weeklyDigest' && 'Digest hebdomadaire'}
                        {key === 'newContent' && 'Nouveau contenu'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {key === 'emailNotifications' && 'Recevez des notifications par email'}
                        {key === 'pushNotifications' && 'Notifications directes dans le navigateur'}
                        {key === 'studyReminders' && 'Rappels pour vos sessions d\'étude'}
                        {key === 'progressReports' && 'Rapports hebdomadaires de progression'}
                        {key === 'weeklyDigest' && 'Résumé hebdomadaire de vos activités'}
                        {key === 'newContent' && 'Alertes pour le nouveau contenu'}
                      </p>
                    </div>
                    <Switch
                      checked={value as boolean}
                      onCheckedChange={(checked) => updateSetting('notifications', key, checked)}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Confidentialité et Données</CardTitle>
                <CardDescription>
                  Contrôlez la visibilité de vos informations et l'utilisation de vos données
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>Visibilité du profil</Label>
                  <Select
                    value={settings.privacy.profileVisibility}
                    onValueChange={(value) => updateSetting('privacy', 'profileVisibility', value)}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="friends">Amis seulement</SelectItem>
                      <SelectItem value="private">Privé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="rounded-lg border border-purple-200/70 bg-purple-50/40 p-4 space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="max-w-xl space-y-1">
                      <p className="font-medium text-purple-900">Analytics canoniques (opt-in)</p>
                      <p className="text-sm text-purple-900/80">
                        Collecte distribuée des événements génération, sync EDN et séances pour identifier les frictions sans
                        exposer vos données personnelles.
                      </p>
                      <p className="text-xs text-purple-900/70">
                        Conservation maximale&nbsp;: {retentionValue} jours · Consentement v{ANALYTICS_CONSENT_VERSION}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={analyticsOptIn}
                        onCheckedChange={handleToggleAnalytics}
                        disabled={analyticsLoading || updatingAnalytics}
                        aria-label="Activer les analytics canoniques"
                      />
                      <Badge variant={analyticsOptIn ? 'default' : 'secondary'}>
                        {analyticsLoading ? 'Chargement…' : analyticsOptIn ? 'Activé' : 'Désactivé'}
                      </Badge>
                    </div>
                  </div>
                  <div className="grid gap-3 sm:flex sm:items-center sm:gap-6">
                    <div className="space-y-1">
                      <Label htmlFor="analytics-retention" className="text-xs uppercase tracking-wide text-purple-900/80">
                        Durée de conservation
                      </Label>
                      <Select
                        value={String(retentionValue)}
                        onValueChange={handleRetentionChange}
                        disabled={!analyticsOptIn || analyticsLoading || updatingAnalytics}
                      >
                        <SelectTrigger id="analytics-retention" className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="90">90 jours</SelectItem>
                          <SelectItem value="180">180 jours</SelectItem>
                          <SelectItem value="365">365 jours</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <p className="text-xs text-purple-900/70 max-w-md">
                      Les événements sont pseudonymisés, stockés côté Supabase et purgés automatiquement selon votre choix. Vous
                      pouvez désactiver la collecte à tout moment.
                    </p>
                  </div>
                </div>

                {Object.entries(settings.privacy)
                  .filter(([key]) => key !== 'profileVisibility')
                  .map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        {key === 'shareProgress' && 'Partager la progression'}
                        {key === 'marketingEmails' && 'Emails marketing'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {key === 'shareProgress' && 'Permettre aux autres de voir votre progression'}
                        {key === 'marketingEmails' && 'Recevoir des offres et actualités'}
                      </p>
                    </div>
                    <Switch
                      checked={value as boolean}
                      onCheckedChange={(checked) => updateSetting('privacy', key, checked)}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Apparence et Langue</CardTitle>
                <CardDescription>
                  Personnalisez l'interface selon vos préférences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>Thème</Label>
                  <Select
                    value={settings.appearance.theme}
                    onValueChange={(value) => updateSetting('appearance', 'theme', value)}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Clair</SelectItem>
                      <SelectItem value="dark">Sombre</SelectItem>
                      <SelectItem value="system">Automatique (système)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Langue</Label>
                  <Select
                    value={settings.appearance.language}
                    onValueChange={(value) => updateSetting('appearance', 'language', value)}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Taille de police</Label>
                  <Select
                    value={settings.appearance.fontSize}
                    onValueChange={(value) => updateSetting('appearance', 'fontSize', value)}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Petite</SelectItem>
                      <SelectItem value="medium">Moyenne</SelectItem>
                      <SelectItem value="large">Grande</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Réduire les animations</p>
                    <p className="text-sm text-gray-600">
                      Diminuer les effets visuels pour de meilleures performances
                    </p>
                  </div>
                  <Switch
                    checked={settings.appearance.reducedMotion}
                    onCheckedChange={(checked) => updateSetting('appearance', 'reducedMotion', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audio" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Paramètres Audio</CardTitle>
                <CardDescription>
                  Ajustez les niveaux sonores et les préférences audio
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>Volume principal: {settings.audio.masterVolume}%</Label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.audio.masterVolume}
                    onChange={(e) => updateSetting('audio', 'masterVolume', parseInt(e.target.value))}
                    className="w-full mt-2"
                  />
                </div>

                <div>
                  <Label>Volume des effets: {settings.audio.effectsVolume}%</Label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.audio.effectsVolume}
                    onChange={(e) => updateSetting('audio', 'effectsVolume', parseInt(e.target.value))}
                    className="w-full mt-2"
                  />
                </div>

                <div>
                  <Label>Volume des voix: {settings.audio.voiceVolume}%</Label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.audio.voiceVolume}
                    onChange={(e) => updateSetting('audio', 'voiceVolume', parseInt(e.target.value))}
                    className="w-full mt-2"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Musique de fond</p>
                    <p className="text-sm text-gray-600">Activer la musique d'ambiance</p>
                  </div>
                  <Switch
                    checked={settings.audio.backgroundMusic}
                    onCheckedChange={(checked) => updateSetting('audio', 'backgroundMusic', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Effets sonores</p>
                    <p className="text-sm text-gray-600">Sons pour les interactions</p>
                  </div>
                  <Switch
                    checked={settings.audio.soundEffects}
                    onCheckedChange={(checked) => updateSetting('audio', 'soundEffects', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Paramètres Avancés</CardTitle>
                <CardDescription>
                  Options avancées et gestion des données
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-medium mb-4">Gestion des données</h3>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button variant="outline" onClick={exportData}>
                      <Download className="h-4 w-4 mr-2" />
                      Exporter mes données
                    </Button>
                    <Button variant="outline">
                      <Smartphone className="h-4 w-4 mr-2" />
                      Synchroniser appareils
                    </Button>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-4">Zone de danger</h3>
                  <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-red-800 mb-4">
                      Les actions suivantes sont irréversibles. Procédez avec prudence.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button variant="destructive" size="sm">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Réinitialiser progression
                      </Button>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Supprimer compte
                      </Button>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-4">Informations système</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Version de l'application</p>
                      <Badge variant="outline">v2.1.4</Badge>
                    </div>
                    <div>
                      <p className="text-gray-600">Dernière synchronisation</p>
                      <p>Il y a 2 minutes</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Espace utilisé</p>
                      <p>247 MB / 1 GB</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Connexion</p>
                      <Badge className="bg-green-100 text-green-800">En ligne</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MedMngLayout>
  );
};

export default withAuth(Settings);