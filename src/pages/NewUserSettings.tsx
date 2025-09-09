import React, { useState } from 'react';
import { ConsistentBackground } from '@/components/layout/ConsistentBackground';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Volume2, 
  Monitor,
  Moon,
  Sun,
  Settings
} from 'lucide-react';
import { useAuth } from '@/hooks/unified/useAuth';
import { toast } from 'sonner';

const NewUserSettings = () => {
  const { user } = useAuth();
  const [theme, setTheme] = useState('system');
  const [language, setLanguage] = useState('fr');
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    study: true,
    achievements: true
  });
  
  const [profile, setProfile] = useState({
    name: user?.user_metadata?.name || '',
    email: user?.email || '',
    bio: user?.user_metadata?.bio || '',
    speciality: user?.user_metadata?.speciality || ''
  });

  const handleSaveProfile = () => {
    toast.success('Profil mis à jour avec succès');
  };

  const handleSaveNotifications = () => {
    toast.success('Préférences de notification sauvegardées');
  };

  const handleSaveAppearance = () => {
    toast.success('Préférences d\'apparence sauvegardées');
  };

  return (
    <ConsistentBackground variant="primary">
      <div className="container mx-auto px-4 py-8">
        <PageHeader
          title="Paramètres"
          subtitle="Gérez vos préférences et paramètres de compte"
          icon={Settings}
        />

        <Tabs defaultValue="profile" className="space-y-8">
          <TabsList className="grid grid-cols-4 w-full max-w-2xl">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profil
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Apparence
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Sécurité
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informations personnelles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom complet</Label>
                    <Input
                      id="name"
                      value={profile.name}
                      onChange={(e) => setProfile({...profile, name: e.target.value})}
                      placeholder="Votre nom complet"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({...profile, email: e.target.value})}
                      placeholder="votre@email.com"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="speciality">Spécialité</Label>
                  <Select value={profile.speciality} onValueChange={(value) => setProfile({...profile, speciality: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez votre spécialité" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="medecine-generale">Médecine générale</SelectItem>
                      <SelectItem value="cardiologie">Cardiologie</SelectItem>
                      <SelectItem value="neurologie">Neurologie</SelectItem>
                      <SelectItem value="pediatrie">Pédiatrie</SelectItem>
                      <SelectItem value="chirurgie">Chirurgie</SelectItem>
                      <SelectItem value="autre">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={handleSaveProfile} className="w-full">
                  Sauvegarder le profil
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Préférences de notification
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Notifications par email</Label>
                      <p className="text-sm text-muted-foreground">Recevez des notifications importantes par email</p>
                    </div>
                    <Switch
                      checked={notifications.email}
                      onCheckedChange={(checked) => setNotifications({...notifications, email: checked})}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Notifications push</Label>
                      <p className="text-sm text-muted-foreground">Notifications dans le navigateur</p>
                    </div>
                    <Switch
                      checked={notifications.push}
                      onCheckedChange={(checked) => setNotifications({...notifications, push: checked})}
                    />
                  </div>
                </div>

                <Button onClick={handleSaveNotifications} className="w-full">
                  Sauvegarder les préférences
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Apparence et affichage
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label>Thème</Label>
                    <p className="text-sm text-muted-foreground mb-3">Choisissez votre thème préféré</p>
                    <div className="grid grid-cols-3 gap-4">
                      <Card 
                        className={`cursor-pointer border-2 ${theme === 'light' ? 'border-primary' : 'border-border'}`}
                        onClick={() => setTheme('light')}
                      >
                        <CardContent className="p-4 text-center">
                          <Sun className="h-6 w-6 mx-auto mb-2" />
                          <p className="text-sm">Clair</p>
                        </CardContent>
                      </Card>
                      <Card 
                        className={`cursor-pointer border-2 ${theme === 'dark' ? 'border-primary' : 'border-border'}`}
                        onClick={() => setTheme('dark')}
                      >
                        <CardContent className="p-4 text-center">
                          <Moon className="h-6 w-6 mx-auto mb-2" />
                          <p className="text-sm">Sombre</p>
                        </CardContent>
                      </Card>
                      <Card 
                        className={`cursor-pointer border-2 ${theme === 'system' ? 'border-primary' : 'border-border'}`}
                        onClick={() => setTheme('system')}
                      >
                        <CardContent className="p-4 text-center">
                          <Monitor className="h-6 w-6 mx-auto mb-2" />
                          <p className="text-sm">Système</p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Langue</Label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fr">🇫🇷 Français</SelectItem>
                        <SelectItem value="en">🇺🇸 English</SelectItem>
                        <SelectItem value="es">🇪🇸 Español</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button onClick={handleSaveAppearance} className="w-full">
                  Sauvegarder les préférences
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Sécurité et confidentialité
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label>Statut du compte</Label>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary">Compte vérifié</Badge>
                      <Badge variant="outline">2FA désactivé</Badge>
                    </div>
                  </div>

                  <div>
                    <Label>Actions de sécurité</Label>
                    <div className="space-y-2 mt-3">
                      <Button variant="outline" className="w-full justify-start">
                        Changer le mot de passe
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        Activer l'authentification à deux facteurs
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ConsistentBackground>
  );
};

export default NewUserSettings;