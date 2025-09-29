import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Music, 
  Brain,
  Save,
  ArrowLeft,
  Volume2,
  Moon,
  Sun,
  Download,
  Trash2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Settings() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');

  const [profileData, setProfileData] = useState({
    firstName: 'Étudiant',
    lastName: 'Médecine',
    email: 'etudiant@exemple.com',
    specialty: 'médecine-générale',
    year: '3'
  });

  const [preferences, setPreferences] = useState({
    notifications: true,
    emailDigest: true,
    soundEffects: true,
    darkMode: false,
    language: 'fr',
    musicVolume: [75],
    autoPlay: true,
    binaural: false
  });

  const handleSave = () => {
    toast({
      title: "Paramètres sauvegardés",
      description: "Vos préférences ont été mises à jour avec succès.",
    });
  };

  const handleExportData = () => {
    toast({
      title: "Export démarré",
      description: "Vos données sont en cours d'export. Vous recevrez un email.",
    });
  };

  const handleDeleteAccount = () => {
    toast({
      title: "Suppression de compte",
      description: "Un email de confirmation vous a été envoyé.",
      variant: "destructive"
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate(-1)}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Paramètres</h1>
              <p className="text-muted-foreground">Gérez vos préférences et votre compte</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 lg:w-[600px]">
            <TabsTrigger value="profile" className="gap-2">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Profil</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="gap-2">
              <Palette className="w-4 h-4" />
              <span className="hidden sm:inline">Apparence</span>
            </TabsTrigger>
            <TabsTrigger value="music" className="gap-2">
              <Music className="w-4 h-4" />
              <span className="hidden sm:inline">Musique</span>
            </TabsTrigger>
            <TabsTrigger value="privacy" className="gap-2">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Confidentialité</span>
            </TabsTrigger>
          </TabsList>

          {/* Profil */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Informations personnelles
                </CardTitle>
                <CardDescription>
                  Gérez vos informations de profil et préférences académiques
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">Prénom</Label>
                    <Input 
                      id="firstName"
                      value={profileData.firstName}
                      onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Nom</Label>
                    <Input 
                      id="lastName"
                      value={profileData.lastName}
                      onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="specialty">Spécialité</Label>
                    <Select value={profileData.specialty} onValueChange={(value) => setProfileData({...profileData, specialty: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="médecine-générale">Médecine générale</SelectItem>
                        <SelectItem value="cardiologie">Cardiologie</SelectItem>
                        <SelectItem value="neurologie">Neurologie</SelectItem>
                        <SelectItem value="pédiatrie">Pédiatrie</SelectItem>
                        <SelectItem value="psychiatrie">Psychiatrie</SelectItem>
                        <SelectItem value="chirurgie">Chirurgie</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="year">Année d'études</Label>
                    <Select value={profileData.year} onValueChange={(value) => setProfileData({...profileData, year: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1ère année</SelectItem>
                        <SelectItem value="2">2ème année</SelectItem>
                        <SelectItem value="3">3ème année</SelectItem>
                        <SelectItem value="4">4ème année</SelectItem>
                        <SelectItem value="5">5ème année</SelectItem>
                        <SelectItem value="6">6ème année</SelectItem>
                        <SelectItem value="intern">Interne</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Préférences de notifications
                </CardTitle>
                <CardDescription>
                  Contrôlez quand et comment vous souhaitez être notifié
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notifications push</Label>
                    <p className="text-sm text-muted-foreground">
                      Recevoir des notifications dans le navigateur
                    </p>
                  </div>
                  <Switch 
                    checked={preferences.notifications}
                    onCheckedChange={(checked) => setPreferences({...preferences, notifications: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Digest email quotidien</Label>
                    <p className="text-sm text-muted-foreground">
                      Résumé de votre progression par email
                    </p>
                  </div>
                  <Switch 
                    checked={preferences.emailDigest}
                    onCheckedChange={(checked) => setPreferences({...preferences, emailDigest: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Effets sonores</Label>
                    <p className="text-sm text-muted-foreground">
                      Sons de notification et feedback audio
                    </p>
                  </div>
                  <Switch 
                    checked={preferences.soundEffects}
                    onCheckedChange={(checked) => setPreferences({...preferences, soundEffects: checked})}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Apparence */}
          <TabsContent value="appearance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Apparence et accessibilité
                </CardTitle>
                <CardDescription>
                  Personnalisez l'apparence de l'interface
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      {preferences.darkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                      Mode sombre
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Interface sombre pour réduire la fatigue oculaire
                    </p>
                  </div>
                  <Switch 
                    checked={preferences.darkMode}
                    onCheckedChange={(checked) => setPreferences({...preferences, darkMode: checked})}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Langue
                  </Label>
                  <Select value={preferences.language} onValueChange={(value) => setPreferences({...preferences, language: value})}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Musique */}
          <TabsContent value="music" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Music className="w-5 h-5" />
                  Préférences audio
                </CardTitle>
                <CardDescription>
                  Configurez l'expérience audio et musicale
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4" />
                    Volume de la musique : {preferences.musicVolume[0]}%
                  </Label>
                  <Slider
                    value={preferences.musicVolume}
                    onValueChange={(value) => setPreferences({...preferences, musicVolume: value})}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Lecture automatique</Label>
                    <p className="text-sm text-muted-foreground">
                      Démarrer automatiquement la musique générée
                    </p>
                  </div>
                  <Switch 
                    checked={preferences.autoPlay}
                    onCheckedChange={(checked) => setPreferences({...preferences, autoPlay: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <Brain className="w-4 h-4" />
                      Sons binauraux
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Activer les fréquences binaurales pour la concentration
                    </p>
                  </div>
                  <Switch 
                    checked={preferences.binaural}
                    onCheckedChange={(checked) => setPreferences({...preferences, binaural: checked})}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Confidentialité */}
          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Confidentialité et données
                </CardTitle>
                <CardDescription>
                  Gérez vos données personnelles et votre confidentialité
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Export de vos données</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Téléchargez une copie de toutes vos données personnelles
                    </p>
                    <Button variant="outline" onClick={handleExportData} className="gap-2">
                      <Download className="w-4 h-4" />
                      Exporter mes données
                    </Button>
                  </div>

                  <div className="p-4 border rounded-lg border-destructive/20">
                    <h4 className="font-medium mb-2 text-destructive">Zone de danger</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Supprimer définitivement votre compte et toutes vos données
                    </p>
                    <Button variant="destructive" onClick={handleDeleteAccount} className="gap-2">
                      <Trash2 className="w-4 h-4" />
                      Supprimer mon compte
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Actions globales */}
        <div className="flex justify-end mt-8">
          <Button onClick={handleSave} className="gap-2">
            <Save className="w-4 h-4" />
            Sauvegarder les modifications
          </Button>
        </div>
      </div>
    </div>
  );
}