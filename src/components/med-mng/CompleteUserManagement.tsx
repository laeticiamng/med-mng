import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { 
  User, 
  Settings, 
  Crown, 
  CreditCard, 
  Bell, 
  Shield, 
  Activity,
  Calendar,
  Mail,
  Smartphone,
  Globe,
  Eye,
  Download,
  Upload
} from 'lucide-react';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  subscription: 'free' | 'standard' | 'premium' | 'enterprise';
  joinDate: Date;
  lastActive: Date;
  totalStudyTime: number;
  itemsCompleted: number;
}

interface Quota {
  type: 'music' | 'qcm' | 'chat';
  used: number;
  limit: number;
  resetDate: Date;
}

export const CompleteUserManagement = () => {
  const [profile] = useState<UserProfile>({
    id: '1',
    name: 'Dr. Martin Dubois',
    email: 'martin.dubois@med-student.fr',
    avatar: '/placeholder-avatar.jpg',
    subscription: 'premium',
    joinDate: new Date('2024-01-15'),
    lastActive: new Date(),
    totalStudyTime: 247,
    itemsCompleted: 89
  });

  const [quotas] = useState<Quota[]>([
    { type: 'music', used: 45, limit: 100, resetDate: new Date('2025-02-01') },
    { type: 'qcm', used: 123, limit: 200, resetDate: new Date('2025-02-01') },
    { type: 'chat', used: 67, limit: 500, resetDate: new Date('2025-02-01') }
  ]);

  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    generationComplete: true,
    weeklyDigest: false,
    newContent: true,
    achievements: true
  });

  const [privacy, setPrivacy] = useState({
    profileVisibility: 'public',
    studyStats: true,
    activityStatus: true,
    achievements: true
  });

  const subscriptionFeatures = {
    free: ['5 générations musicales/mois', '20 QCM/mois', '50 messages chat/mois'],
    standard: ['25 générations musicales/mois', '100 QCM/mois', '200 messages chat/mois', 'Support prioritaire'],
    premium: ['100 générations musicales/mois', '200 QCM/mois', '500 messages chat/mois', 'Contenu exclusif', 'Analytics avancées'],
    enterprise: ['Illimité', 'API access', 'Support dédié', 'Personnalisation avancée']
  };

  const getSubscriptionColor = (sub: string) => {
    switch (sub) {
      case 'free': return 'bg-gray-100 text-gray-800';
      case 'standard': return 'bg-blue-100 text-blue-800';
      case 'premium': return 'bg-purple-100 text-purple-800';
      case 'enterprise': return 'bg-gold-100 text-gold-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getQuotaColor = (used: number, limit: number) => {
    const percentage = (used / limit) * 100;
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 70) return 'text-orange-600';
    return 'text-green-600';
  };

  return (
    <div className="space-y-6">
      {/* En-tête du profil */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-10 w-10 text-primary" />
            </div>
            
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">{profile.name}</h1>
                <Badge className={getSubscriptionColor(profile.subscription)}>
                  <Crown className="h-3 w-3 mr-1" />
                  {profile.subscription.toUpperCase()}
                </Badge>
              </div>
              <p className="text-muted-foreground">{profile.email}</p>
              <div className="flex gap-6 text-sm text-muted-foreground">
                <span>Membre depuis {profile.joinDate.toLocaleDateString()}</span>
                <span>{profile.totalStudyTime}h d'étude</span>
                <span>{profile.itemsCompleted} items complétés</span>
              </div>
            </div>

            <div className="space-y-2">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Modifier le profil
              </Button>
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Changer photo
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quotas et utilisation */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Quotas et Utilisation
            </CardTitle>
            <CardDescription>
              Suivez votre consommation mensuelle par fonctionnalité
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {quotas.map((quota) => (
                <div key={quota.type} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                        {quota.type === 'music' && <Bell className="h-4 w-4" />}
                        {quota.type === 'qcm' && <User className="h-4 w-4" />}
                        {quota.type === 'chat' && <Mail className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="font-medium capitalize">
                          {quota.type === 'music' ? 'Génération Musicale' : 
                           quota.type === 'qcm' ? 'QCM' : 'Chat IA'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Réinitialisation le {quota.resetDate.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${getQuotaColor(quota.used, quota.limit)}`}>
                        {quota.used}/{quota.limit}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {Math.round((quota.used / quota.limit) * 100)}%
                      </p>
                    </div>
                  </div>
                  <Progress 
                    value={(quota.used / quota.limit) * 100} 
                    className="h-2"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Abonnement */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Abonnement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center p-4 rounded-lg bg-purple-50 border border-purple-200">
              <Crown className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <h3 className="font-bold text-purple-900">Premium</h3>
              <p className="text-sm text-purple-700">Actif jusqu'au 15/02/2025</p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Fonctionnalités incluses:</h4>
              <ul className="space-y-1 text-xs text-muted-foreground">
                {subscriptionFeatures.premium.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            
            <Button className="w-full" variant="outline">
              Gérer l'abonnement
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Paramètres détaillés */}
      <Card>
        <CardHeader>
          <CardTitle>Paramètres Complets</CardTitle>
          <CardDescription>
            Personnalisez votre expérience MED-MNG
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="notifications" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="privacy">Confidentialité</TabsTrigger>
              <TabsTrigger value="preferences">Préférences</TabsTrigger>
              <TabsTrigger value="security">Sécurité</TabsTrigger>
              <TabsTrigger value="data">Données</TabsTrigger>
            </TabsList>
            
            <TabsContent value="notifications" className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Notifications par email</h4>
                <div className="space-y-3">
                  {Object.entries(notifications).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <p className="text-sm font-medium">
                          {key === 'generationComplete' ? 'Génération terminée' :
                           key === 'weeklyDigest' ? 'Résumé hebdomadaire' :
                           key === 'newContent' ? 'Nouveau contenu' :
                           key === 'achievements' ? 'Réalisations' :
                           key === 'email' ? 'Email général' : 'Notifications push'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {key === 'generationComplete' ? 'Recevoir un email quand la génération est prête' :
                           key === 'weeklyDigest' ? 'Résumé de vos progrès chaque semaine' :
                           'Notifications importantes'}
                        </p>
                      </div>
                      <Switch
                        checked={value}
                        onCheckedChange={(checked) => 
                          setNotifications(prev => ({ ...prev, [key]: checked }))
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="privacy" className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Visibilité du profil</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Profil public</p>
                      <p className="text-xs text-muted-foreground">Autres utilisateurs peuvent voir votre profil</p>
                    </div>
                    <Switch
                      checked={privacy.studyStats}
                      onCheckedChange={(checked) => 
                        setPrivacy(prev => ({ ...prev, studyStats: checked }))
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Statistiques d'étude</p>
                      <p className="text-xs text-muted-foreground">Partager vos progrès avec la communauté</p>
                    </div>
                    <Switch
                      checked={privacy.activityStatus}
                      onCheckedChange={(checked) => 
                        setPrivacy(prev => ({ ...prev, activityStatus: checked }))
                      }
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="preferences" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-medium">Interface</h4>
                  <div className="space-y-2">
                    <label className="text-sm">Thème</label>
                    <select className="w-full px-3 py-2 border rounded-md text-sm">
                      <option>Système</option>
                      <option>Clair</option>
                      <option>Sombre</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm">Langue</label>
                    <select className="w-full px-3 py-2 border rounded-md text-sm">
                      <option>Français</option>
                      <option>English</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Contenu</h4>
                  <div className="space-y-2">
                    <label className="text-sm">Spécialité préférée</label>
                    <select className="w-full px-3 py-2 border rounded-md text-sm">
                      <option>Cardiologie</option>
                      <option>Neurologie</option>
                      <option>Urgences</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm">Objectif quotidien</label>
                    <Input type="number" defaultValue="10" className="text-sm" />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm font-medium">Compte sécurisé</p>
                    <p className="text-xs text-muted-foreground">Dernière connexion: Il y a 2 minutes</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <User className="h-4 w-4 mr-2" />
                    Changer le mot de passe
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Smartphone className="h-4 w-4 mr-2" />
                    Authentification à deux facteurs
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Eye className="h-4 w-4 mr-2" />
                    Sessions actives
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="data" className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-medium mb-2">Export des données</h4>
                      <p className="text-xs text-muted-foreground mb-3">
                        Téléchargez toutes vos données personnelles
                      </p>
                      <Button size="sm" variant="outline" className="w-full">
                        <Download className="h-4 w-4 mr-2" />
                        Exporter mes données
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-medium mb-2">Suppression du compte</h4>
                      <p className="text-xs text-muted-foreground mb-3">
                        Suppression définitive de toutes vos données
                      </p>
                      <Button size="sm" variant="destructive" className="w-full">
                        Supprimer le compte
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};