import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ROUTE_PATHS } from '@/config/routes';
import { Settings, ArrowLeft, Bell, Mail, Smartphone, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function NotificationSettings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    inAppNotifications: true,
    smsNotifications: false,

    // Catégories
    challengesNotifications: true,
    achievementsNotifications: true,
    communityNotifications: true,
    updatesNotifications: true,
    marketingNotifications: false,

    // Fréquence
    dailyDigest: true,
    weeklyReport: true,
    instantAlerts: true,
  });

  const handleToggle = (key: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }));
  };

  const handleSave = () => {
    // Sauvegarder dans Supabase
    toast({
      title: "Paramètres sauvegardés",
      description: "Vos préférences de notification ont été mises à jour",
    });
  };

  return (
    <>
      <Helmet>
        <title>Paramètres de Notifications | Med-Mng</title>
        <meta name="description" content="Gérez vos préférences de notification" />
      </Helmet>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <Link to={ROUTE_PATHS.notifications}>
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour aux notifications
            </Button>
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <Settings className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold">Paramètres de Notifications</h1>
          </div>
          <p className="text-muted-foreground">
            Personnalisez comment et quand vous recevez des notifications
          </p>
        </div>

        {/* Channels */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Canaux de Notification</CardTitle>
            <CardDescription>Choisissez comment recevoir vos notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-blue-600" />
                <div>
                  <Label htmlFor="email" className="text-base">Email</Label>
                  <p className="text-sm text-muted-foreground">
                    Recevez des notifications par email
                  </p>
                </div>
              </div>
              <Switch
                id="email"
                checked={settings.emailNotifications}
                onCheckedChange={() => handleToggle('emailNotifications')}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-green-600" />
                <div>
                  <Label htmlFor="push" className="text-base">Notifications Push</Label>
                  <p className="text-sm text-muted-foreground">
                    Notifications sur votre appareil
                  </p>
                </div>
              </div>
              <Switch
                id="push"
                checked={settings.pushNotifications}
                onCheckedChange={() => handleToggle('pushNotifications')}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-purple-600" />
                <div>
                  <Label htmlFor="inApp" className="text-base">Notifications In-App</Label>
                  <p className="text-sm text-muted-foreground">
                    Notifications dans l'application
                  </p>
                </div>
              </div>
              <Switch
                id="inApp"
                checked={settings.inAppNotifications}
                onCheckedChange={() => handleToggle('inAppNotifications')}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-orange-600" />
                <div>
                  <Label htmlFor="sms" className="text-base">SMS</Label>
                  <p className="text-sm text-muted-foreground">
                    Notifications par SMS (alertes importantes uniquement)
                  </p>
                </div>
              </div>
              <Switch
                id="sms"
                checked={settings.smsNotifications}
                onCheckedChange={() => handleToggle('smsNotifications')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Categories */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Catégories de Notifications</CardTitle>
            <CardDescription>Choisissez quels types de notifications recevoir</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { key: 'challengesNotifications', label: 'Challenges et Quêtes', desc: 'Nouveaux challenges et progression' },
              { key: 'achievementsNotifications', label: 'Succès et Badges', desc: 'Déblocage de badges et réalisations' },
              { key: 'communityNotifications', label: 'Communauté', desc: 'Commentaires, mentions et interactions' },
              { key: 'updatesNotifications', label: 'Mises à jour', desc: 'Nouvelles fonctionnalités et contenus' },
              { key: 'marketingNotifications', label: 'Marketing', desc: 'Promotions et annonces' },
            ].map((item) => (
              <div key={item.key}>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor={item.key} className="text-base">{item.label}</Label>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch
                    id={item.key}
                    checked={settings[item.key as keyof typeof settings]}
                    onCheckedChange={() => handleToggle(item.key)}
                  />
                </div>
                {item.key !== 'marketingNotifications' && <Separator className="mt-4" />}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Frequency */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Fréquence</CardTitle>
            <CardDescription>Contrôlez la fréquence des notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { key: 'dailyDigest', label: 'Résumé quotidien', desc: 'Recevoir un résumé chaque jour' },
              { key: 'weeklyReport', label: 'Rapport hebdomadaire', desc: 'Statistiques et progression chaque semaine' },
              { key: 'instantAlerts', label: 'Alertes instantanées', desc: 'Notifications en temps réel' },
            ].map((item) => (
              <div key={item.key}>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor={item.key} className="text-base">{item.label}</Label>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch
                    id={item.key}
                    checked={settings[item.key as keyof typeof settings]}
                    onCheckedChange={() => handleToggle(item.key)}
                  />
                </div>
                {item.key !== 'instantAlerts' && <Separator className="mt-4" />}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end gap-2">
          <Link to={ROUTE_PATHS.notifications}>
            <Button variant="outline">Annuler</Button>
          </Link>
          <Button onClick={handleSave}>
            Sauvegarder les paramètres
          </Button>
        </div>
      </div>
    </>
  );
}
