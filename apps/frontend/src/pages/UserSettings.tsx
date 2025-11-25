import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import {
  User,
  Bell,
  Shield,
  Eye,
  Palette,
  Database,
  Download,
  Upload,
  Trash2,
  Save,
  AlertTriangle,
  Mail,
  Phone,
  Sun,
  Moon,
  Monitor,
  Type,
  Contrast,
} from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from '@/components/ui/theme-provider';
import { FeedbackSystem } from '@/components/feedback/FeedbackSystem';

// Storage keys for persisting user settings
const STORAGE_KEYS = {
  profile: 'med-mng-user-profile',
  notifications: 'med-mng-user-notifications',
  privacy: 'med-mng-user-privacy',
  appearance: 'med-mng-user-appearance',
} as const;

// Default settings values
const defaultProfileData = {
  firstName: 'Dr. Marie',
  lastName: 'Dubois',
  email: 'marie.dubois@medmng.fr',
  phone: '+33 6 12 34 56 78',
  specialty: 'Cardiologie',
  institution: 'CHU de Lyon',
  bio: 'Cardiologue spécialisée dans les pathologies cardiovasculaires complexes.',
  location: 'Lyon, France',
  website: 'https://dr-dubois.fr',
};

const defaultNotificationSettings = {
  emailNotifications: true,
  pushNotifications: true,
  weeklyDigest: true,
  courseReminders: true,
  communityUpdates: false,
  securityAlerts: true,
  marketingEmails: false,
};

const defaultPrivacySettings = {
  profileVisibility: 'public',
  showEmail: false,
  showPhone: false,
  allowDataCollection: true,
  shareProgress: true,
  allowAnalytics: true,
};

const defaultAppearanceSettings = {
  fontSize: 16,
  reduceMotion: false,
  highContrast: false,
  compactMode: false,
  colorScheme: 'default' as 'default' | 'blue' | 'green' | 'purple',
};

// Helper function to safely load settings from localStorage
function loadSettings<T>(key: string, defaults: T): T {
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      return { ...defaults, ...JSON.parse(stored) };
    }
  } catch {
    // If parsing fails, return defaults
  }
  return defaults;
}

// Helper function to save settings to localStorage
function saveSettings(key: string, data: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // Silently fail if localStorage is not available
  }
}

const UserSettings: React.FC = () => {
  const [activeSection, setActiveSection] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { theme, setTheme } = useTheme();

  // Initialize state from localStorage or use defaults
  const [profileData, setProfileData] = useState(() =>
    loadSettings(STORAGE_KEYS.profile, defaultProfileData)
  );

  const [notificationSettings, setNotificationSettings] = useState(() =>
    loadSettings(STORAGE_KEYS.notifications, defaultNotificationSettings)
  );

  const [privacySettings, setPrivacySettings] = useState(() =>
    loadSettings(STORAGE_KEYS.privacy, defaultPrivacySettings)
  );

  const [appearanceSettings, setAppearanceSettings] = useState(() =>
    loadSettings(STORAGE_KEYS.appearance, defaultAppearanceSettings)
  );

  // Apply appearance settings on mount and when they change
  useEffect(() => {
    const root = document.documentElement;

    // Apply font size
    root.style.setProperty('--user-font-size', `${appearanceSettings.fontSize}px`);

    // Apply reduced motion preference
    if (appearanceSettings.reduceMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }

    // Apply high contrast mode
    if (appearanceSettings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Apply compact mode
    if (appearanceSettings.compactMode) {
      root.classList.add('compact-mode');
    } else {
      root.classList.remove('compact-mode');
    }

    // Apply color scheme
    root.setAttribute('data-color-scheme', appearanceSettings.colorScheme);
  }, [appearanceSettings]);

  const handleSave = useCallback(
    async (section: string) => {
      setIsLoading(true);
      try {
        // Persist settings to localStorage based on section
        switch (section) {
          case 'profil':
            saveSettings(STORAGE_KEYS.profile, profileData);
            break;
          case 'notifications':
            saveSettings(STORAGE_KEYS.notifications, notificationSettings);
            break;
          case 'confidentialité':
            saveSettings(STORAGE_KEYS.privacy, privacySettings);
            break;
          case 'apparence':
            saveSettings(STORAGE_KEYS.appearance, appearanceSettings);
            break;
        }

        // Small delay for UX feedback
        await new Promise(resolve => setTimeout(resolve, 300));

        toast.success('Paramètres sauvegardés !', {
          description: `Les paramètres de ${section} ont été mis à jour avec succès.`,
        });
      } catch {
        toast.error('Erreur lors de la sauvegarde', {
          description: 'Veuillez réessayer plus tard.',
        });
      } finally {
        setIsLoading(false);
      }
    },
    [profileData, notificationSettings, privacySettings, appearanceSettings]
  );

  const handleExportData = () => {
    // Simulation d'export de données
    const data = {
      profile: profileData,
      settings: {
        notifications: notificationSettings,
        privacy: privacySettings,
        appearance: appearanceSettings,
      },
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'med-mng-user-data.json';
    a.click();
    URL.revokeObjectURL(url);

    toast.success('Données exportées', {
      description: 'Vos données ont été téléchargées avec succès.',
    });
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      try {
        const data = JSON.parse(event.target?.result as string);

        // Validation basique
        if (!data.profile || !data.settings) {
          throw new Error('Format de fichier invalide');
        }

        // Importer les données
        if (data.profile) {
          setProfileData(prev => ({ ...prev, ...data.profile }));
        }
        if (data.settings?.notifications) {
          setNotificationSettings(prev => ({ ...prev, ...data.settings.notifications }));
        }
        if (data.settings?.privacy) {
          setPrivacySettings(prev => ({ ...prev, ...data.settings.privacy }));
        }
        if (data.settings?.appearance) {
          setAppearanceSettings(prev => ({ ...prev, ...data.settings.appearance }));
        }

        toast.success('Données importées', {
          description: 'Vos paramètres ont été restaurés avec succès.',
        });
      } catch {
        toast.error("Erreur d'import", {
          description: "Le fichier sélectionné n'est pas valide.",
        });
      }
    };
    reader.readAsText(file);

    // Réinitialiser l'input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const sections = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Confidentialité', icon: Shield },
    { id: 'appearance', label: 'Apparence', icon: Palette },
    { id: 'data', label: 'Données', icon: Database },
    { id: 'feedback', label: 'Feedback', icon: Mail },
  ];

  const colorSchemes = [
    { id: 'default', label: 'Par défaut', color: 'bg-primary' },
    { id: 'blue', label: 'Bleu', color: 'bg-blue-500' },
    { id: 'green', label: 'Vert', color: 'bg-green-500' },
    { id: 'purple', label: 'Violet', color: 'bg-purple-500' },
  ];

  return (
    <>
      <Helmet>
        <title>Paramètres Utilisateur - MED-MNG</title>
        <meta
          name="description"
          content="Gérez vos paramètres personnels, notifications et préférences sur MED-MNG."
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="medical-container py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:w-64 flex-shrink-0">
              <Card className="medical-card">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Paramètres</CardTitle>
                  <CardDescription>Gérez votre compte</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <nav className="space-y-1">
                    {sections.map(section => (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left text-sm transition-colors ${
                          activeSection === section.id
                            ? 'bg-primary/10 text-primary border-r-2 border-primary'
                            : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                        }`}
                      >
                        <section.icon className="w-4 h-4" />
                        {section.label}
                      </button>
                    ))}
                  </nav>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {/* Profile Section */}
              {activeSection === 'profile' && (
                <Card className="medical-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5 text-primary" />
                      Informations Personnelles
                    </CardTitle>
                    <CardDescription>
                      Gérez vos informations de profil et vos données personnelles
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="medical-label">Prénom</Label>
                        <Input
                          value={profileData.firstName}
                          onChange={e =>
                            setProfileData(prev => ({ ...prev, firstName: e.target.value }))
                          }
                          className="medical-input"
                        />
                      </div>
                      <div>
                        <Label className="medical-label">Nom</Label>
                        <Input
                          value={profileData.lastName}
                          onChange={e =>
                            setProfileData(prev => ({ ...prev, lastName: e.target.value }))
                          }
                          className="medical-input"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="medical-label flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          Email
                        </Label>
                        <Input
                          type="email"
                          value={profileData.email}
                          onChange={e =>
                            setProfileData(prev => ({ ...prev, email: e.target.value }))
                          }
                          className="medical-input"
                        />
                      </div>
                      <div>
                        <Label className="medical-label flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          Téléphone
                        </Label>
                        <Input
                          type="tel"
                          value={profileData.phone}
                          onChange={e =>
                            setProfileData(prev => ({ ...prev, phone: e.target.value }))
                          }
                          className="medical-input"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="medical-label">Spécialité</Label>
                        <Input
                          value={profileData.specialty}
                          onChange={e =>
                            setProfileData(prev => ({ ...prev, specialty: e.target.value }))
                          }
                          className="medical-input"
                        />
                      </div>
                      <div>
                        <Label className="medical-label">Institution</Label>
                        <Input
                          value={profileData.institution}
                          onChange={e =>
                            setProfileData(prev => ({ ...prev, institution: e.target.value }))
                          }
                          className="medical-input"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="medical-label">Biographie</Label>
                      <Textarea
                        value={profileData.bio}
                        onChange={e => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                        className="medical-input resize-none"
                        rows={3}
                        placeholder="Décrivez brièvement votre parcours et vos expertises..."
                      />
                    </div>

                    <div className="flex justify-end">
                      <Button
                        onClick={() => handleSave('profil')}
                        disabled={isLoading}
                        className="medical-btn-primary"
                      >
                        {isLoading ? 'Sauvegarde...' : 'Sauvegarder'}
                        <Save className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Notifications Section */}
              {activeSection === 'notifications' && (
                <Card className="medical-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="w-5 h-5 text-primary" />
                      Préférences de Notification
                    </CardTitle>
                    <CardDescription>
                      Choisissez comment et quand vous souhaitez être notifié
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {Object.entries(notificationSettings).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <div>
                          <Label className="text-sm font-medium">
                            {key === 'emailNotifications' && 'Notifications par email'}
                            {key === 'pushNotifications' && 'Notifications push'}
                            {key === 'weeklyDigest' && 'Résumé hebdomadaire'}
                            {key === 'courseReminders' && 'Rappels de cours'}
                            {key === 'communityUpdates' && 'Mises à jour communauté'}
                            {key === 'securityAlerts' && 'Alertes de sécurité'}
                            {key === 'marketingEmails' && 'Emails marketing'}
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            {key === 'emailNotifications' &&
                              'Recevez les notifications importantes par email'}
                            {key === 'pushNotifications' &&
                              'Notifications en temps réel sur votre appareil'}
                            {key === 'weeklyDigest' && 'Résumé de votre activité chaque semaine'}
                            {key === 'courseReminders' && 'Rappels pour vos cours et formations'}
                            {key === 'communityUpdates' &&
                              'Nouveautés et discussions de la communauté'}
                            {key === 'securityAlerts' && 'Alertes importantes de sécurité'}
                            {key === 'marketingEmails' && 'Promotions et nouveautés produit'}
                          </p>
                        </div>
                        <Switch
                          checked={value}
                          onCheckedChange={checked =>
                            setNotificationSettings(prev => ({ ...prev, [key]: checked }))
                          }
                        />
                      </div>
                    ))}

                    <Separator />

                    <div className="flex justify-end">
                      <Button
                        onClick={() => handleSave('notifications')}
                        disabled={isLoading}
                        className="medical-btn-primary"
                      >
                        {isLoading ? 'Sauvegarde...' : 'Sauvegarder'}
                        <Save className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Privacy Section */}
              {activeSection === 'privacy' && (
                <Card className="medical-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-primary" />
                      Confidentialité et Sécurité
                    </CardTitle>
                    <CardDescription>
                      Contrôlez la visibilité de vos données et votre vie privée
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h4 className="font-medium text-sm">Visibilité du profil</h4>
                      {Object.entries(privacySettings).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between">
                          <div>
                            <Label className="text-sm font-medium">
                              {key === 'profileVisibility' && 'Profil public'}
                              {key === 'showEmail' && "Afficher l'email"}
                              {key === 'showPhone' && 'Afficher le téléphone'}
                              {key === 'allowDataCollection' && 'Collecte de données'}
                              {key === 'shareProgress' && 'Partager les progrès'}
                              {key === 'allowAnalytics' && 'Analytics et amélioration'}
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              {key === 'profileVisibility' &&
                                'Votre profil est visible par les autres utilisateurs'}
                              {key === 'showEmail' &&
                                'Votre email apparaît sur votre profil public'}
                              {key === 'showPhone' &&
                                'Votre téléphone apparaît sur votre profil public'}
                              {key === 'allowDataCollection' &&
                                "Permettre la collecte de données pour améliorer l'expérience"}
                              {key === 'shareProgress' &&
                                'Vos progrès sont visibles par la communauté'}
                              {key === 'allowAnalytics' &&
                                'Autoriser les données analytics pour améliorer la plateforme'}
                            </p>
                          </div>
                          <Switch
                            checked={typeof value === 'boolean' ? value : value === 'public'}
                            onCheckedChange={checked =>
                              setPrivacySettings(prev => ({
                                ...prev,
                                [key]:
                                  key === 'profileVisibility'
                                    ? checked
                                      ? 'public'
                                      : 'private'
                                    : checked,
                              }))
                            }
                          />
                        </div>
                      ))}
                    </div>

                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-4 h-4 text-yellow-600" />
                        <h5 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                          Information importante
                        </h5>
                      </div>
                      <p className="text-xs text-yellow-700 dark:text-yellow-300">
                        Certaines fonctionnalités peuvent être limitées si vous désactivez la
                        collecte de données. Vos données sont toujours protégées selon notre
                        politique de confidentialité.
                      </p>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        onClick={() => handleSave('confidentialité')}
                        disabled={isLoading}
                        className="medical-btn-primary"
                      >
                        {isLoading ? 'Sauvegarde...' : 'Sauvegarder'}
                        <Save className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Appearance Section */}
              {activeSection === 'appearance' && (
                <Card className="medical-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Palette className="w-5 h-5 text-primary" />
                      Apparence
                    </CardTitle>
                    <CardDescription>
                      Personnalisez l'interface selon vos préférences
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    {/* Thème */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-sm flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        Thème
                      </h4>
                      <RadioGroup
                        value={theme}
                        onValueChange={(value: 'light' | 'dark' | 'system') => setTheme(value)}
                        className="grid grid-cols-3 gap-4"
                      >
                        <Label
                          htmlFor="theme-light"
                          className={`flex flex-col items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            theme === 'light'
                              ? 'border-primary bg-primary/5'
                              : 'border-muted hover:border-primary/50'
                          }`}
                        >
                          <RadioGroupItem value="light" id="theme-light" className="sr-only" />
                          <div className="w-12 h-12 rounded-full bg-white border-2 flex items-center justify-center">
                            <Sun className="w-6 h-6 text-yellow-500" />
                          </div>
                          <span className="text-sm font-medium">Clair</span>
                        </Label>

                        <Label
                          htmlFor="theme-dark"
                          className={`flex flex-col items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            theme === 'dark'
                              ? 'border-primary bg-primary/5'
                              : 'border-muted hover:border-primary/50'
                          }`}
                        >
                          <RadioGroupItem value="dark" id="theme-dark" className="sr-only" />
                          <div className="w-12 h-12 rounded-full bg-gray-900 border-2 flex items-center justify-center">
                            <Moon className="w-6 h-6 text-blue-400" />
                          </div>
                          <span className="text-sm font-medium">Sombre</span>
                        </Label>

                        <Label
                          htmlFor="theme-system"
                          className={`flex flex-col items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            theme === 'system'
                              ? 'border-primary bg-primary/5'
                              : 'border-muted hover:border-primary/50'
                          }`}
                        >
                          <RadioGroupItem value="system" id="theme-system" className="sr-only" />
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-white to-gray-900 border-2 flex items-center justify-center">
                            <Monitor className="w-6 h-6 text-gray-600" />
                          </div>
                          <span className="text-sm font-medium">Système</span>
                        </Label>
                      </RadioGroup>
                    </div>

                    <Separator />

                    {/* Schéma de couleurs */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-sm flex items-center gap-2">
                        <Palette className="w-4 h-4" />
                        Schéma de couleurs
                      </h4>
                      <div className="grid grid-cols-4 gap-3">
                        {colorSchemes.map(scheme => (
                          <button
                            key={scheme.id}
                            onClick={() =>
                              setAppearanceSettings(prev => ({
                                ...prev,
                                colorScheme: scheme.id as typeof prev.colorScheme,
                              }))
                            }
                            className={`flex flex-col items-center gap-2 p-3 border-2 rounded-lg transition-all ${
                              appearanceSettings.colorScheme === scheme.id
                                ? 'border-primary bg-primary/5'
                                : 'border-muted hover:border-primary/50'
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-full ${scheme.color}`} />
                            <span className="text-xs font-medium">{scheme.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* Taille de police */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-sm flex items-center gap-2">
                        <Type className="w-4 h-4" />
                        Taille de police
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Petite</span>
                          <Badge variant="outline">{appearanceSettings.fontSize}px</Badge>
                          <span className="text-sm text-muted-foreground">Grande</span>
                        </div>
                        <Slider
                          value={[appearanceSettings.fontSize]}
                          onValueChange={([value]) =>
                            setAppearanceSettings(prev => ({ ...prev, fontSize: value }))
                          }
                          min={12}
                          max={24}
                          step={1}
                          className="w-full"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Exemple:{' '}
                        <span style={{ fontSize: `${appearanceSettings.fontSize}px` }}>
                          Texte de prévisualisation
                        </span>
                      </p>
                    </div>

                    <Separator />

                    {/* Options d'accessibilité */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-sm flex items-center gap-2">
                        <Contrast className="w-4 h-4" />
                        Accessibilité
                      </h4>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-sm font-medium">Réduire les animations</Label>
                            <p className="text-xs text-muted-foreground">
                              Désactive les animations et transitions
                            </p>
                          </div>
                          <Switch
                            checked={appearanceSettings.reduceMotion}
                            onCheckedChange={checked =>
                              setAppearanceSettings(prev => ({ ...prev, reduceMotion: checked }))
                            }
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-sm font-medium">Contraste élevé</Label>
                            <p className="text-xs text-muted-foreground">
                              Améliore le contraste des couleurs
                            </p>
                          </div>
                          <Switch
                            checked={appearanceSettings.highContrast}
                            onCheckedChange={checked =>
                              setAppearanceSettings(prev => ({ ...prev, highContrast: checked }))
                            }
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-sm font-medium">Mode compact</Label>
                            <p className="text-xs text-muted-foreground">
                              Réduit les espacements pour afficher plus de contenu
                            </p>
                          </div>
                          <Switch
                            checked={appearanceSettings.compactMode}
                            onCheckedChange={checked =>
                              setAppearanceSettings(prev => ({ ...prev, compactMode: checked }))
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        onClick={() => handleSave('apparence')}
                        disabled={isLoading}
                        className="medical-btn-primary"
                      >
                        {isLoading ? 'Sauvegarde...' : 'Sauvegarder'}
                        <Save className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Data Management Section */}
              {activeSection === 'data' && (
                <Card className="medical-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="w-5 h-5 text-primary" />
                      Gestion des Données
                    </CardTitle>
                    <CardDescription>
                      Exportez, importez ou supprimez vos données personnelles
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card className="border-2 border-dashed border-muted">
                        <CardContent className="p-6 text-center">
                          <Download className="w-8 h-8 text-primary mx-auto mb-3" />
                          <h4 className="font-medium mb-2">Exporter mes données</h4>
                          <p className="text-sm text-muted-foreground mb-4">
                            Téléchargez toutes vos données dans un fichier JSON
                          </p>
                          <Button
                            onClick={handleExportData}
                            variant="outline"
                            size="sm"
                            className="w-full"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Exporter
                          </Button>
                        </CardContent>
                      </Card>

                      <Card className="border-2 border-dashed border-muted">
                        <CardContent className="p-6 text-center">
                          <Upload className="w-8 h-8 text-primary mx-auto mb-3" />
                          <h4 className="font-medium mb-2">Importer des données</h4>
                          <p className="text-sm text-muted-foreground mb-4">
                            Restaurez vos données depuis un fichier de sauvegarde
                          </p>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept=".json"
                            onChange={handleImportData}
                            className="hidden"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Importer
                          </Button>
                        </CardContent>
                      </Card>
                    </div>

                    <Separator />

                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                        <h4 className="font-medium text-red-800 dark:text-red-200">
                          Zone Dangereuse
                        </h4>
                      </div>

                      <div className="space-y-3">
                        <p className="text-sm text-red-700 dark:text-red-300">
                          La suppression de votre compte est irréversible. Toutes vos données,
                          progression et créations seront définitivement perdues.
                        </p>

                        <Button variant="destructive" size="sm" className="w-full md:w-auto">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Supprimer mon compte
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Feedback Section */}
              {activeSection === 'feedback' && (
                <div>
                  <FeedbackSystem context="user-settings" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserSettings;
