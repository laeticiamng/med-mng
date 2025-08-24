import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Settings, 
  Trophy, 
  Star, 
  Calendar, 
  MapPin, 
  Mail, 
  Phone, 
  Edit,
  Camera,
  Shield,
  Bell,
  Palette,
  Globe,
  Lock,
  Download,
  Share2,
  BookOpen,
  Music,
  Target,
  Clock,
  Award,
  TrendingUp,
  Heart,
  Trash2,
  Eye,
  Users,
  Zap,
  Crown,
  Gift,
  ChevronRight,
  Save,
  X
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ImmersiveLayout } from '@/components/immersive/ImmersiveLayout';

export default function Profile() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const userProfile = {
    id: '1',
    name: 'Dr. Sarah Martinez',
    email: 'sarah.martinez@med-student.fr',
    phone: '+33 6 12 34 56 78',
    location: 'Paris, France',
    university: 'Université Paris Descartes',
    year: 'P2 - 2ème année',
    specialty: 'Cardiologie',
    joinedDate: '2023-09-15',
    avatar: '/api/placeholder/120/120',
    bio: 'Étudiante passionnée en médecine, spécialisée en cardiologie. J\'utilise MED MNG pour révolutionner mon apprentissage grâce à la musique éducative.',
    level: 24,
    xp: 3420,
    xpToNext: 1580,
    rank: 47,
    streak: 12
  };

  const achievements = [
    { id: 1, title: 'Virtuose Musical', description: 'Créé 50 chansons', icon: Music, rarity: 'epic', unlocked: true },
    { id: 2, title: 'Maître Cardiologue', description: '90%+ en cardiologie', icon: Heart, rarity: 'legendary', unlocked: true },
    { id: 3, title: 'Étudiant Assidu', description: '30 jours consécutifs', icon: Calendar, rarity: 'rare', unlocked: false, progress: 12, target: 30 },
    { id: 4, title: 'Expert EDN', description: '200 items maîtrisés', icon: BookOpen, rarity: 'epic', unlocked: false, progress: 142, target: 200 }
  ];

  const statistics = [
    { label: 'Items EDN Maîtrisés', value: 142, total: 367, icon: BookOpen, color: 'from-blue-500 to-indigo-600' },
    { label: 'Musiques Créées', value: 67, icon: Music, color: 'from-purple-500 to-pink-600' },
    { label: 'Heures d\'Étude', value: 234, icon: Clock, color: 'from-green-500 to-emerald-600' },
    { label: 'Score Moyen', value: 87, total: 100, icon: Target, color: 'from-yellow-500 to-orange-600', unit: '%' }
  ];

  const recentActivity = [
    { type: 'achievement', title: 'Badge "Expert Cardiologie" débloqué', time: 'Il y a 2h', icon: Trophy },
    { type: 'study', title: 'Item IC-225 complété (94%)', time: 'Il y a 4h', icon: BookOpen },
    { type: 'music', title: 'Chanson "Arythmie Beat" créée', time: 'Il y a 6h', icon: Music },
    { type: 'social', title: 'Chanson partagée avec 3 amis', time: 'Hier', icon: Share2 }
  ];

  const preferences = {
    notifications: {
      email: true,
      push: true,
      achievements: true,
      reminders: true
    },
    privacy: {
      profile: 'public',
      statistics: 'friends',
      activities: 'private'
    },
    interface: {
      theme: 'dark',
      language: 'fr',
      animations: true,
      sound: true
    }
  };

  const handleSaveProfile = () => {
    setIsEditing(false);
    // Save profile logic
  };

  return (
    <ImmersiveLayout
      variant="medical"
      header={{
        title: "Profil Personnel",
        subtitle: "Gérez votre compte et vos préférences",
        icon: <User className="h-6 w-6" />,
        badge: { text: `Niveau ${userProfile.level}`, color: "blue" },
        actions: (
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                  <X className="h-4 w-4 mr-2" />
                  Annuler
                </Button>
                <Button size="sm" onClick={handleSaveProfile}>
                  <Save className="h-4 w-4 mr-2" />
                  Sauvegarder
                </Button>
              </>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Modifier
              </Button>
            )}
          </div>
        )
      }}
    >
      <div className="space-y-6">
        {/* Profil Header */}
        <Card className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-sm border border-white/10">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="relative group">
                <Avatar className="w-24 h-24 border-4 border-white/20">
                  <AvatarImage src={userProfile.avatar} alt={userProfile.name} />
                  <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-purple-500 to-blue-600 text-white">
                    {userProfile.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <button className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="h-6 w-6 text-white" />
                  </button>
                )}
              </div>
              
              <div className="flex-1 space-y-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl font-bold text-white">{userProfile.name}</h1>
                    <Badge className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white">
                      <Crown className="h-3 w-3 mr-1" />
                      Niveau {userProfile.level}
                    </Badge>
                  </div>
                  <p className="text-gray-300 mb-1">{userProfile.university} • {userProfile.year}</p>
                  <p className="text-gray-400 text-sm">Spécialité: {userProfile.specialty}</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white">Progression vers niveau {userProfile.level + 1}</span>
                    <span className="text-gray-300">{userProfile.xp} / {userProfile.xp + userProfile.xpToNext} XP</span>
                  </div>
                  <Progress value={(userProfile.xp / (userProfile.xp + userProfile.xpToNext)) * 100} className="h-2" />
                </div>
                
                <div className="flex flex-wrap gap-4 text-sm text-gray-300">
                  <div className="flex items-center gap-1">
                    <Trophy className="h-4 w-4 text-yellow-400" />
                    Rang #{userProfile.rank}
                  </div>
                  <div className="flex items-center gap-1">
                    <Zap className="h-4 w-4 text-orange-400" />
                    Série de {userProfile.streak} jours
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-blue-400" />
                    Membre depuis {new Date(userProfile.joinedDate).toLocaleDateString('fr-FR')}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-black/20 border border-white/10 grid grid-cols-5 w-full">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="achievements">Succès</TabsTrigger>
            <TabsTrigger value="statistics">Statistiques</TabsTrigger>
            <TabsTrigger value="profile">Profil</TabsTrigger>
            <TabsTrigger value="settings">Paramètres</TabsTrigger>
          </TabsList>

          {/* Vue d'ensemble */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {statistics.map((stat, index) => (
                <Card key={index} className="bg-black/20 backdrop-blur-sm border border-white/10">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center`}>
                        <stat.icon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-bold text-lg">
                          {stat.value}{stat.unit}
                          {stat.total && <span className="text-sm text-gray-400">/{stat.total}</span>}
                        </p>
                        <p className="text-gray-400 text-sm">{stat.label}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Activité récente */}
              <Card className="bg-black/20 backdrop-blur-sm border border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Activité Récente</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-white/5">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        activity.type === 'achievement' ? 'bg-yellow-500/20' :
                        activity.type === 'study' ? 'bg-blue-500/20' :
                        activity.type === 'music' ? 'bg-purple-500/20' :
                        'bg-green-500/20'
                      }`}>
                        <activity.icon className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-white text-sm font-medium">{activity.title}</p>
                        <p className="text-gray-400 text-xs">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Succès récents */}
              <Card className="bg-black/20 backdrop-blur-sm border border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-400" />
                    Derniers Succès
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {achievements.filter(a => a.unlocked).slice(0, 3).map((achievement) => (
                    <div key={achievement.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                      <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
                        <achievement.icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white font-medium text-sm">{achievement.title}</h4>
                        <p className="text-gray-400 text-xs">{achievement.description}</p>
                      </div>
                      <Badge className={`${
                        achievement.rarity === 'legendary' ? 'bg-orange-500/20 text-orange-300' :
                        achievement.rarity === 'epic' ? 'bg-purple-500/20 text-purple-300' :
                        'bg-blue-500/20 text-blue-300'
                      }`}>
                        {achievement.rarity}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Succès */}
          <TabsContent value="achievements" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements.map((achievement) => (
                <Card key={achievement.id} className={`${
                  achievement.unlocked ? 'bg-white/10 border-yellow-400/30' : 'bg-black/20 border-white/10'
                } backdrop-blur-sm transition-all duration-300 hover:scale-105`}>
                  <CardContent className="p-4 text-center relative">
                    {!achievement.unlocked && (
                      <div className="absolute top-2 right-2">
                        <Lock className="h-4 w-4 text-gray-400" />
                      </div>
                    )}
                    
                    <div className={`w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center ${
                      achievement.unlocked ? 'bg-gradient-to-br from-yellow-500 to-orange-600' : 'bg-gray-600/50'
                    }`}>
                      <achievement.icon className="h-8 w-8 text-white" />
                    </div>
                    
                    <h3 className="text-white font-bold mb-2">{achievement.title}</h3>
                    <p className="text-gray-300 text-sm mb-3">{achievement.description}</p>
                    
                    <Badge className={`${
                      achievement.rarity === 'legendary' ? 'bg-orange-500/20 text-orange-300' :
                      achievement.rarity === 'epic' ? 'bg-purple-500/20 text-purple-300' :
                      achievement.rarity === 'rare' ? 'bg-blue-500/20 text-blue-300' :
                      'bg-gray-500/20 text-gray-300'
                    } mb-3`}>
                      {achievement.rarity}
                    </Badge>

                    {achievement.progress && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-gray-400">
                          <span>Progression</span>
                          <span>{achievement.progress}/{achievement.target}</span>
                        </div>
                        <Progress value={(achievement.progress / achievement.target) * 100} className="h-2" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Statistiques */}
          <TabsContent value="statistics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-black/20 backdrop-blur-sm border border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Progression par Spécialité</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { name: 'Cardiologie', progress: 85, items: 34 },
                    { name: 'Neurologie', progress: 72, items: 28 },
                    { name: 'Pneumologie', progress: 68, items: 22 },
                    { name: 'Gastroentérologie', progress: 45, items: 18 }
                  ].map((specialty, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-white text-sm">{specialty.name}</span>
                        <span className="text-gray-400 text-sm">{specialty.progress}% ({specialty.items} items)</span>
                      </div>
                      <Progress value={specialty.progress} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-black/20 backdrop-blur-sm border border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Temps d'Étude Hebdomadaire</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <span className="text-white text-sm w-8">{day}</span>
                        <Progress value={Math.random() * 100} className="flex-1 h-2" />
                        <span className="text-gray-400 text-sm">{Math.floor(Math.random() * 4 + 1)}h</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Profil */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="bg-black/20 backdrop-blur-sm border border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Informations Personnelles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="text-white">Nom complet</Label>
                    <Input
                      id="name"
                      defaultValue={userProfile.name}
                      disabled={!isEditing}
                      className="bg-white/5 border-white/20 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-white">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      defaultValue={userProfile.email}
                      disabled={!isEditing}
                      className="bg-white/5 border-white/20 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-white">Téléphone</Label>
                    <Input
                      id="phone"
                      defaultValue={userProfile.phone}
                      disabled={!isEditing}
                      className="bg-white/5 border-white/20 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="location" className="text-white">Localisation</Label>
                    <Input
                      id="location"
                      defaultValue={userProfile.location}
                      disabled={!isEditing}
                      className="bg-white/5 border-white/20 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="university" className="text-white">Université</Label>
                    <Input
                      id="university"
                      defaultValue={userProfile.university}
                      disabled={!isEditing}
                      className="bg-white/5 border-white/20 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="year" className="text-white">Année d'étude</Label>
                    <Select disabled={!isEditing}>
                      <SelectTrigger className="bg-white/5 border-white/20 text-white">
                        <SelectValue placeholder={userProfile.year} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="p1">P1 - 1ère année</SelectItem>
                        <SelectItem value="p2">P2 - 2ème année</SelectItem>
                        <SelectItem value="p3">P3 - 3ème année</SelectItem>
                        <SelectItem value="externe">Externe</SelectItem>
                        <SelectItem value="interne">Interne</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="bio" className="text-white">Biographie</Label>
                  <Textarea
                    id="bio"
                    defaultValue={userProfile.bio}
                    disabled={!isEditing}
                    className="bg-white/5 border-white/20 text-white"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Paramètres */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Notifications */}
              <Card className="bg-black/20 backdrop-blur-sm border border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { key: 'email', label: 'Notifications par email', enabled: preferences.notifications.email },
                    { key: 'push', label: 'Notifications push', enabled: preferences.notifications.push },
                    { key: 'achievements', label: 'Succès débloqués', enabled: preferences.notifications.achievements },
                    { key: 'reminders', label: 'Rappels d\'étude', enabled: preferences.notifications.reminders }
                  ].map((setting) => (
                    <div key={setting.key} className="flex items-center justify-between">
                      <Label htmlFor={setting.key} className="text-white">{setting.label}</Label>
                      <Switch id={setting.key} checked={setting.enabled} />
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Interface */}
              <Card className="bg-black/20 backdrop-blur-sm border border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    Interface
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-white">Thème</Label>
                    <Select defaultValue={preferences.interface.theme}>
                      <SelectTrigger className="bg-white/5 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dark">Sombre</SelectItem>
                        <SelectItem value="light">Clair</SelectItem>
                        <SelectItem value="auto">Automatique</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-white">Langue</Label>
                    <Select defaultValue={preferences.interface.language}>
                      <SelectTrigger className="bg-white/5 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-white">Animations</Label>
                    <Switch checked={preferences.interface.animations} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-white">Sons</Label>
                    <Switch checked={preferences.interface.sound} />
                  </div>
                </CardContent>
              </Card>

              {/* Confidentialité */}
              <Card className="bg-black/20 backdrop-blur-sm border border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Confidentialité
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-white">Visibilité du profil</Label>
                    <Select defaultValue={preferences.privacy.profile}>
                      <SelectTrigger className="bg-white/5 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="friends">Amis uniquement</SelectItem>
                        <SelectItem value="private">Privé</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-white">Statistiques</Label>
                    <Select defaultValue={preferences.privacy.statistics}>
                      <SelectTrigger className="bg-white/5 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="friends">Amis uniquement</SelectItem>
                        <SelectItem value="private">Privé</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Actions du compte */}
              <Card className="bg-black/20 backdrop-blur-sm border border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Actions du compte
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Exporter mes données
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Lock className="h-4 w-4 mr-2" />
                    Changer le mot de passe
                  </Button>
                  <Button variant="destructive" className="w-full justify-start">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer le compte
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </ImmersiveLayout>
  );
}