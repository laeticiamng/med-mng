import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  User, Bell, Shield, Eye, Palette, Database, 
  Download, Upload, Trash2, Save, AlertTriangle,
  Mail, Phone, MapPin, Calendar, Globe, Lock
} from 'lucide-react';
import { toast } from 'sonner';
import { FeedbackSystem } from '@/components/feedback/FeedbackSystem';

const UserSettings: React.FC = () => {
  const [activeSection, setActiveSection] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);

  // État des paramètres
  const [profileData, setProfileData] = useState({
    firstName: 'Dr. Marie',
    lastName: 'Dubois',
    email: 'marie.dubois@medmng.fr',
    phone: '+33 6 12 34 56 78',
    specialty: 'Cardiologie',
    institution: 'CHU de Lyon',
    bio: 'Cardiologue spécialisée dans les pathologies cardiovasculaires complexes.',
    location: 'Lyon, France',
    website: 'https://dr-dubois.fr'
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    weeklyDigest: true,
    courseReminders: true,
    communityUpdates: false,
    securityAlerts: true,
    marketingEmails: false
  });

  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false,
    allowDataCollection: true,
    shareProgress: true,
    allowAnalytics: true
  });

  const handleSave = async (section: string) => {
    setIsLoading(true);
    try {
      // Simulation de sauvegarde
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Paramètres sauvegardés !', {
        description: `Les paramètres de ${section} ont été mis à jour avec succès.`
      });
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde', {
        description: 'Veuillez réessayer plus tard.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportData = () => {
    // Simulation d'export de données
    const data = {
      profile: profileData,
      settings: { notifications: notificationSettings, privacy: privacySettings },
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'med-mng-user-data.json';
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Données exportées', {
      description: 'Vos données ont été téléchargées avec succès.'
    });
  };

  const sections = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Confidentialité', icon: Shield },
    { id: 'appearance', label: 'Apparence', icon: Palette },
    { id: 'data', label: 'Données', icon: Database },
    { id: 'feedback', label: 'Feedback', icon: Mail }
  ];

  return (
    <>
      <Helmet>
        <title>Paramètres Utilisateur - MED-MNG</title>
        <meta name="description" content="Gérez vos paramètres personnels, notifications et préférences sur MED-MNG." />
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
                    {sections.map((section) => (
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
                          onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                          className="medical-input"
                        />
                      </div>
                      <div>
                        <Label className="medical-label">Nom</Label>
                        <Input
                          value={profileData.lastName}
                          onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
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
                          onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
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
                          onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                          className="medical-input"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="medical-label">Spécialité</Label>
                        <Input
                          value={profileData.specialty}
                          onChange={(e) => setProfileData(prev => ({ ...prev, specialty: e.target.value }))}
                          className="medical-input"
                        />
                      </div>
                      <div>
                        <Label className="medical-label">Institution</Label>
                        <Input
                          value={profileData.institution}
                          onChange={(e) => setProfileData(prev => ({ ...prev, institution: e.target.value }))}
                          className="medical-input"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="medical-label">Biographie</Label>
                      <Textarea
                        value={profileData.bio}
                        onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
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
                            {key === 'emailNotifications' && 'Recevez les notifications importantes par email'}
                            {key === 'pushNotifications' && 'Notifications en temps réel sur votre appareil'}
                            {key === 'weeklyDigest' && 'Résumé de votre activité chaque semaine'}
                            {key === 'courseReminders' && 'Rappels pour vos cours et formations'}
                            {key === 'communityUpdates' && 'Nouveautés et discussions de la communauté'}
                            {key === 'securityAlerts' && 'Alertes importantes de sécurité'}
                            {key === 'marketingEmails' && 'Promotions et nouveautés produit'}
                          </p>
                        </div>
                        <Switch
                          checked={value}
                          onCheckedChange={(checked) => 
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
                              {key === 'showEmail' && 'Afficher l\'email'}
                              {key === 'showPhone' && 'Afficher le téléphone'}
                              {key === 'allowDataCollection' && 'Collecte de données'}
                              {key === 'shareProgress' && 'Partager les progrès'}
                              {key === 'allowAnalytics' && 'Analytics et amélioration'}
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              {key === 'profileVisibility' && 'Votre profil est visible par les autres utilisateurs'}
                              {key === 'showEmail' && 'Votre email apparaît sur votre profil public'}
                              {key === 'showPhone' && 'Votre téléphone apparaît sur votre profil public'}
                              {key === 'allowDataCollection' && 'Permettre la collecte de données pour améliorer l\'expérience'}
                              {key === 'shareProgress' && 'Vos progrès sont visibles par la communauté'}
                              {key === 'allowAnalytics' && 'Autoriser les données analytics pour améliorer la plateforme'}
                            </p>
                          </div>
                          <Switch
                            checked={typeof value === 'boolean' ? value : value === 'public'}
                            onCheckedChange={(checked) => 
                              setPrivacySettings(prev => ({ 
                                ...prev, 
                                [key]: key === 'profileVisibility' ? (checked ? 'public' : 'private') : checked 
                              }))
                            }
                          />
                        </div>
                      ))}
                    </div>

                    <div className="bg-warning/10 dark:bg-warning/20 border border-warning/30 dark:border-warning/40 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-4 h-4 text-warning" />
                        <h5 className="text-sm font-medium text-warning">
                          Information importante
                        </h5>
                      </div>
                      <p className="text-xs text-warning/80">
                        Certaines fonctionnalités peuvent être limitées si vous désactivez la collecte de données.
                        Vos données sont toujours protégées selon notre politique de confidentialité.
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
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            disabled
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Bientôt disponible
                          </Button>
                        </CardContent>
                      </Card>
                    </div>

                    <Separator />

                    <div className="bg-destructive/10 dark:bg-destructive/20 border border-destructive/30 dark:border-destructive/40 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle className="w-5 h-5 text-destructive" />
                        <h4 className="font-medium text-destructive">
                          Zone Dangereuse
                        </h4>
                      </div>
                      
                      <div className="space-y-3">
                        <p className="text-sm text-red-700 dark:text-red-300">
                          La suppression de votre compte est irréversible. Toutes vos données,
                          progression et créations seront définitivement perdues.
                        </p>
                        
                        <Button
                          variant="destructive"
                          size="sm"
                          className="w-full md:w-auto"
                        >
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