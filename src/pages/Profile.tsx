import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  User, 
  Settings, 
  Trophy, 
  Calendar,
  BookOpen,
  Music,
  Target,
  Star,
  Medal,
  Crown,
  Heart,
  Brain,
  Clock,
  TrendingUp,
  Award,
  Camera,
  Edit,
  Save,
  MapPin,
  Mail,
  Phone,
  Globe,
  Shield,
  Zap
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';

const Profile: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: 'Dr. Marie Dubois',
    email: 'marie.dubois@medecine.fr',
    university: 'Faculté de Médecine Paris Descartes',
    year: 5,
    specialization: 'Cardiologie',
    location: 'Paris, France',
    bio: 'Étudiante en 5ème année de médecine, passionnée par la cardiologie et l\'innovation en santé digitale.',
    joinDate: new Date('2023-01-15')
  });

  const [stats] = useState({
    level: 12,
    experience: 4250,
    nextLevelExp: 5000,
    studyTime: 18750,
    itemsCompleted: 189,
    streakDays: 23,
    musicCreated: 15,
    ecosCompleted: 8
  });

  const badges = [
    { name: 'Premier pas', icon: '🏁', rarity: 'common', description: 'Premier item EDN complété' },
    { name: 'Musicien thérapeutique', icon: '🎵', rarity: 'rare', description: '10 musiques créées' },
    { name: 'Cardio Expert', icon: '❤️', rarity: 'epic', description: 'Tous les items cardiologie complétés' },
    { name: 'Légende EDN', icon: '👑', rarity: 'legendary', description: '100% des items EDN maîtrisés' }
  ];

  const formatTime = (minutes: number): string => `${Math.floor(minutes / 60)}h`;

  return (
    <>
      <Helmet>
        <title>Profil - {profile.name} | MED-MNG</title>
        <meta name="description" content={`Profil de ${profile.name}, étudiant en médecine - Progression, badges et réalisations sur MED-MNG`} />
      </Helmet>

      <div className="container mx-auto p-6 space-y-8 max-w-6xl">
        {/* Header du profil */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative">
          <div className="h-48 bg-gradient-to-r from-primary via-purple-500 to-pink-500 rounded-t-lg" />
          
          <Card className="relative -mt-16 mx-4">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="relative">
                  <Avatar className="w-24 h-24 border-4 border-background">
                    <AvatarFallback className="text-xl">
                      {profile.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <Button size="sm" variant="secondary" className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0">
                    <Camera className="h-3 w-3" />
                  </Button>
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-2xl font-bold">{profile.name}</h1>
                      <p className="text-muted-foreground">{profile.specialization} • {profile.university}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {profile.location}
                      </p>
                    </div>
                    <Button variant={isEditing ? "default" : "outline"} onClick={() => setIsEditing(!isEditing)} className="flex items-center gap-2">
                      {isEditing ? <><Save className="h-4 w-4" />Sauvegarder</> : <><Edit className="h-4 w-4" />Modifier</>}
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Crown className="h-3 w-3" />
                      Niveau {stats.level}
                    </Badge>
                    <div className="flex-1 max-w-xs">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Expérience</span>
                        <span>{stats.experience}/{stats.nextLevelExp} XP</span>
                      </div>
                      <Progress value={(stats.experience / stats.nextLevelExp) * 100} />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="h-8 w-8 mx-auto mb-2 text-blue-500" />
              <div className="text-2xl font-bold">{formatTime(stats.studyTime)}</div>
              <p className="text-sm text-muted-foreground">Temps d'étude</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <BookOpen className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <div className="text-2xl font-bold">{stats.itemsCompleted}</div>
              <p className="text-sm text-muted-foreground">Items EDN</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Zap className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
              <div className="text-2xl font-bold">{stats.streakDays}</div>
              <p className="text-sm text-muted-foreground">Jours consécutifs</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Music className="h-8 w-8 mx-auto mb-2 text-purple-500" />
              <div className="text-2xl font-bold">{stats.musicCreated}</div>
              <p className="text-sm text-muted-foreground">Musiques créées</p>
            </CardContent>
          </Card>
        </div>

        {/* Contenu principal avec onglets */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="badges">Badges & Réussites</TabsTrigger>
            <TabsTrigger value="settings">Paramètres</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    À propos
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isEditing ? (
                    <Textarea
                      value={profile.bio}
                      onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                      placeholder="Parlez-nous de vous..."
                      className="min-h-[100px]"
                    />
                  ) : (
                    <p className="text-muted-foreground">{profile.bio}</p>
                  )}
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4" />
                      <span>Inscrit depuis {profile.joinDate.toLocaleDateString('fr-FR')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4" />
                      <span>{profile.email}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Progression récente
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { title: 'Maître des EDN', progress: stats.itemsCompleted, target: 367, icon: BookOpen },
                      { title: 'Compositeur médical', progress: stats.musicCreated, target: 25, icon: Music },
                      { title: 'Expert ECOS', progress: stats.ecosCompleted, target: 15, icon: Target }
                    ].map((achievement, index) => {
                      const percentage = Math.min((achievement.progress / achievement.target) * 100, 100);
                      return (
                        <div key={index} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <achievement.icon className="h-4 w-4" />
                              <span className="font-medium text-sm">{achievement.title}</span>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {achievement.progress}/{achievement.target}
                            </span>
                          </div>
                          <Progress value={percentage} />
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="badges" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Collection de Badges
                </CardTitle>
                <CardDescription>Vos récompenses et reconnaissances gagnées</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {badges.map((badge, index) => (
                    <Card key={index} className="text-center">
                      <CardContent className="p-4">
                        <div className="text-4xl mb-2">{badge.icon}</div>
                        <h3 className="font-semibold mb-1">{badge.name}</h3>
                        <p className="text-sm text-muted-foreground mb-3">{badge.description}</p>
                        <Badge className={`${
                          badge.rarity === 'legendary' ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                          badge.rarity === 'epic' ? 'bg-purple-500' :
                          badge.rarity === 'rare' ? 'bg-blue-500' : 'bg-gray-500'
                        }`}>
                          {badge.rarity === 'legendary' ? 'Légendaire' :
                           badge.rarity === 'epic' ? 'Épique' :
                           badge.rarity === 'rare' ? 'Rare' : 'Commun'}
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Paramètres du Profil
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nom complet</Label>
                      <Input
                        id="name"
                        value={profile.name}
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="university">Université</Label>
                      <Input
                        id="university"
                        value={profile.university}
                        onChange={(e) => setProfile({ ...profile, university: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="location">Localisation</Label>
                      <Input
                        id="location"
                        value={profile.location}
                        onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="specialization">Spécialisation</Label>
                      <Input
                        id="specialization"
                        value={profile.specialization}
                        onChange={(e) => setProfile({ ...profile, specialization: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="border-t pt-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Confidentialité
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Profil public</p>
                        <p className="text-sm text-muted-foreground">Permettre aux autres de voir votre profil</p>
                      </div>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Statistiques visibles</p>
                        <p className="text-sm text-muted-foreground">Afficher vos statistiques d'apprentissage</p>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default Profile;