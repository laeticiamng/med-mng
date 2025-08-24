import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { 
  User, 
  Settings, 
  Music, 
  Brain, 
  Trophy, 
  Target,
  Calendar,
  Clock,
  Headphones,
  Heart,
  Star,
  TrendingUp,
  BarChart3,
  Award,
  BookOpen,
  Zap,
  Shield,
  Bell,
  Palette,
  Volume2,
  Download,
  Share2
} from 'lucide-react';
import { MedMngLayout } from '@/components/med-mng/MedMngLayout';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  name: string;
  email: string;
  avatar?: string;
  specialization: string;
  year: string;
  university: string;
  bio: string;
  preferences: {
    musicStyle: string;
    difficulty: string;
    sessionDuration: number;
    notifications: boolean;
    autoplay: boolean;
    darkMode: boolean;
  };
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: any;
  progress: number;
  maxProgress: number;
  earned: boolean;
  earnedDate?: string;
}

interface LearningStats {
  totalListenTime: number;
  songsCompleted: number;
  favoriteGenre: string;
  averageScore: number;
  streak: number;
  totalSessions: number;
}

const Profile = () => {
  const { toast } = useToast();
  
  // États
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  
  // Profil utilisateur (simulé)
  const [profile, setProfile] = useState<UserProfile>({
    name: 'Dr. Marie Dubois',
    email: 'marie.dubois@universite.fr',
    specialization: 'Médecine Interne',
    year: 'D4',
    university: 'Université Paris-Descartes',
    bio: 'Passionnée par l\'apprentissage innovant et les nouvelles méthodes pédagogiques en médecine.',
    preferences: {
      musicStyle: 'trap',
      difficulty: 'intermediaire',
      sessionDuration: 30,
      notifications: true,
      autoplay: false,
      darkMode: false
    }
  });

  // Statistiques d'apprentissage (simulées)
  const [learningStats] = useState<LearningStats>({
    totalListenTime: 1247, // minutes
    songsCompleted: 28,
    favoriteGenre: 'Trap Médical',
    averageScore: 87,
    streak: 12, // jours
    totalSessions: 45
  });

  // Achievements (simulés)
  const [achievements] = useState<Achievement[]>([
    {
      id: '1',
      name: 'Premier Pas',
      description: 'Première musique générée',
      icon: Music,
      progress: 1,
      maxProgress: 1,
      earned: true,
      earnedDate: '2024-01-10'
    },
    {
      id: '2',
      name: 'Mélomane Médical',
      description: 'Écoutez 10 musiques complètes',
      icon: Headphones,
      progress: 10,
      maxProgress: 10,
      earned: true,
      earnedDate: '2024-01-15'
    },
    {
      id: '3',
      name: 'Série Parfaite',
      description: '7 jours consécutifs d\'utilisation',
      icon: Trophy,
      progress: 12,
      maxProgress: 7,
      earned: true,
      earnedDate: '2024-01-18'
    },
    {
      id: '4',
      name: 'Expert Trap',
      description: 'Maîtrisez 25 musiques Trap',
      icon: Zap,
      progress: 18,
      maxProgress: 25,
      earned: false
    },
    {
      id: '5',
      name: 'Cardiologue Musical',
      description: 'Complétez tous les items de cardiologie',
      icon: Heart,
      progress: 8,
      maxProgress: 15,
      earned: false
    },
    {
      id: '6',
      name: 'Perfectionniste',
      description: 'Obtenez 95%+ sur 10 sessions',
      icon: Star,
      progress: 3,
      maxProgress: 10,
      earned: false
    }
  ]);

  // Fonctions
  const handleSaveProfile = () => {
    setIsEditing(false);
    toast({
      title: "Profil mis à jour",
      description: "Vos informations ont été sauvegardées avec succès.",
    });
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h${mins > 0 ? ` ${mins}m` : ''}`;
    }
    return `${mins}m`;
  };

  const getStreakEmoji = (streak: number) => {
    if (streak >= 30) return '🔥';
    if (streak >= 14) return '⚡';
    if (streak >= 7) return '✨';
    return '💫';
  };

  return (
    <MedMngLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            
            {/* Header du profil */}
            <Card className="mb-8 overflow-hidden shadow-lg bg-white/80 backdrop-blur-sm border-0">
              <div className="relative">
                {/* Banner gradient */}
                <div className="h-32 bg-gradient-to-r from-blue-600 to-purple-600" />
                
                {/* Avatar et info principale */}
                <div className="relative px-6 pb-6">
                  <div className="flex flex-col md:flex-row items-start md:items-end space-y-4 md:space-y-0 md:space-x-6 -mt-16">
                    {/* Avatar */}
                    <div className="relative">
                      <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-3xl font-bold text-blue-600 border-4 border-white shadow-lg">
                        {profile.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                        <div className="w-3 h-3 bg-white rounded-full" />
                      </div>
                    </div>
                    
                    {/* Informations principales */}
                    <div className="flex-1 text-center md:text-left">
                      <h1 className="text-2xl font-bold text-gray-800 mb-2">{profile.name}</h1>
                      <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-3">
                        <Badge className="bg-blue-100 text-blue-800">
                          {profile.specialization}
                        </Badge>
                        <Badge variant="outline">
                          {profile.year}
                        </Badge>
                        <Badge variant="outline">
                          {profile.university}
                        </Badge>
                      </div>
                      <p className="text-gray-600 max-w-md">{profile.bio}</p>
                    </div>
                    
                    {/* Stats rapides */}
                    <div className="flex flex-col sm:flex-row gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-purple-600">{learningStats.songsCompleted}</div>
                        <div className="text-sm text-gray-500">Musiques</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-600 flex items-center justify-center">
                          {getStreakEmoji(learningStats.streak)} {learningStats.streak}
                        </div>
                        <div className="text-sm text-gray-500">Jours de suite</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">{learningStats.averageScore}%</div>
                        <div className="text-sm text-gray-500">Score moyen</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Onglets principaux */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="profile" className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">Profil</span>
                </TabsTrigger>
                <TabsTrigger value="stats" className="flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4" />
                  <span className="hidden sm:inline">Statistiques</span>
                </TabsTrigger>
                <TabsTrigger value="achievements" className="flex items-center space-x-2">
                  <Trophy className="h-4 w-4" />
                  <span className="hidden sm:inline">Succès</span>
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center space-x-2">
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline">Paramètres</span>
                </TabsTrigger>
              </TabsList>

              {/* Onglet Profil */}
              <TabsContent value="profile">
                <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold">Informations Personnelles</h2>
                    <Button
                      onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                    >
                      {isEditing ? 'Sauvegarder' : 'Modifier'}
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label>Nom complet</Label>
                        <Input
                          value={profile.name}
                          onChange={(e) => setProfile(prev => ({...prev, name: e.target.value}))}
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <Label>Email</Label>
                        <Input
                          value={profile.email}
                          onChange={(e) => setProfile(prev => ({...prev, email: e.target.value}))}
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <Label>Spécialisation</Label>
                        <Select 
                          value={profile.specialization} 
                          onValueChange={(value) => setProfile(prev => ({...prev, specialization: value}))}
                          disabled={!isEditing}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Médecine Générale">Médecine Générale</SelectItem>
                            <SelectItem value="Médecine Interne">Médecine Interne</SelectItem>
                            <SelectItem value="Cardiologie">Cardiologie</SelectItem>
                            <SelectItem value="Neurologie">Neurologie</SelectItem>
                            <SelectItem value="Pédiatrie">Pédiatrie</SelectItem>
                            <SelectItem value="Chirurgie">Chirurgie</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label>Année d'études</Label>
                        <Select 
                          value={profile.year}
                          onValueChange={(value) => setProfile(prev => ({...prev, year: value}))}
                          disabled={!isEditing}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="D1">D1 - DFGSM1</SelectItem>
                            <SelectItem value="D2">D2 - DFGSM2</SelectItem>
                            <SelectItem value="D3">D3 - DFGSM3</SelectItem>
                            <SelectItem value="D4">D4 - DFASM1</SelectItem>
                            <SelectItem value="D5">D5 - DFASM2</SelectItem>
                            <SelectItem value="D6">D6 - DFASM3</SelectItem>
                            <SelectItem value="Interne">Interne</SelectItem>
                            <SelectItem value="Praticien">Praticien</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Université</Label>
                        <Input
                          value={profile.university}
                          onChange={(e) => setProfile(prev => ({...prev, university: e.target.value}))}
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <Label>Biographie</Label>
                        <Textarea
                          value={profile.bio}
                          onChange={(e) => setProfile(prev => ({...prev, bio: e.target.value}))}
                          disabled={!isEditing}
                          className="min-h-[80px]"
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              {/* Onglet Statistiques */}
              <TabsContent value="stats">
                <div className="space-y-6">
                  {/* Stats principales */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="p-4 text-center bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                      <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-blue-600">
                        {formatTime(learningStats.totalListenTime)}
                      </div>
                      <p className="text-sm text-gray-600">Temps total d'écoute</p>
                    </Card>

                    <Card className="p-4 text-center bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                      <Music className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-purple-600">
                        {learningStats.songsCompleted}
                      </div>
                      <p className="text-sm text-gray-600">Musiques complétées</p>
                    </Card>

                    <Card className="p-4 text-center bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                      <Target className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-green-600">
                        {learningStats.averageScore}%
                      </div>
                      <p className="text-sm text-gray-600">Score moyen</p>
                    </Card>

                    <Card className="p-4 text-center bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                      <Calendar className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-orange-600">
                        {learningStats.totalSessions}
                      </div>
                      <p className="text-sm text-gray-600">Sessions d'apprentissage</p>
                    </Card>
                  </div>

                  {/* Graphiques et détails */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                      <h3 className="text-lg font-semibold mb-4">Progression par Spécialité</h3>
                      <div className="space-y-4">
                        {[
                          { name: 'Cardiologie', progress: 85, color: 'bg-red-500' },
                          { name: 'Neurologie', progress: 72, color: 'bg-blue-500' },
                          { name: 'Pneumologie', progress: 90, color: 'bg-green-500' },
                          { name: 'Gastroentérologie', progress: 63, color: 'bg-yellow-500' },
                          { name: 'Endocrinologie', progress: 78, color: 'bg-purple-500' }
                        ].map((specialty) => (
                          <div key={specialty.name}>
                            <div className="flex justify-between mb-2">
                              <span className="text-sm font-medium">{specialty.name}</span>
                              <span className="text-sm text-gray-500">{specialty.progress}%</span>
                            </div>
                            <Progress value={specialty.progress} className="h-2" />
                          </div>
                        ))}
                      </div>
                    </Card>

                    <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                      <h3 className="text-lg font-semibold mb-4">Styles Musicaux Préférés</h3>
                      <div className="space-y-4">
                        {[
                          { style: 'Trap Médical', percentage: 35, plays: 12 },
                          { style: 'Lo-Fi Study', percentage: 28, plays: 9 },
                          { style: 'Pop Éducative', percentage: 20, plays: 7 },
                          { style: 'Jazz Clinique', percentage: 10, plays: 3 },
                          { style: 'Afrobeat Santé', percentage: 7, plays: 2 }
                        ].map((style) => (
                          <div key={style.style} className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{style.style}</p>
                              <p className="text-sm text-gray-500">{style.plays} écoutes</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">{style.percentage}%</p>
                              <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                                  style={{ width: `${style.percentage}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              {/* Onglet Achievements */}
              <TabsContent value="achievements">
                <div className="space-y-6">
                  <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-xl font-semibold">Vos Succès</h2>
                        <p className="text-gray-600">
                          {achievements.filter(a => a.earned).length} sur {achievements.length} succès débloqués
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gold">{achievements.filter(a => a.earned).length}</div>
                        <Trophy className="h-6 w-6 text-yellow-500 mx-auto" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {achievements.map((achievement) => {
                        const Icon = achievement.icon;
                        const progressPercentage = (achievement.progress / achievement.maxProgress) * 100;
                        
                        return (
                          <Card 
                            key={achievement.id}
                            className={`p-4 transition-all duration-300 hover:shadow-lg ${
                              achievement.earned 
                                ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200' 
                                : 'bg-gray-50 border-gray-200'
                            }`}
                          >
                            <div className="text-center">
                              <div className={`w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center ${
                                achievement.earned 
                                  ? 'bg-gradient-to-br from-yellow-400 to-orange-400 text-white' 
                                  : 'bg-gray-300 text-gray-600'
                              }`}>
                                <Icon className="h-8 w-8" />
                              </div>
                              
                              <h3 className={`font-semibold mb-1 ${
                                achievement.earned ? 'text-orange-800' : 'text-gray-600'
                              }`}>
                                {achievement.name}
                              </h3>
                              
                              <p className="text-sm text-gray-600 mb-3">
                                {achievement.description}
                              </p>

                              {!achievement.earned && (
                                <div className="mb-2">
                                  <Progress value={progressPercentage} className="h-2 mb-1" />
                                  <p className="text-xs text-gray-500">
                                    {achievement.progress}/{achievement.maxProgress}
                                  </p>
                                </div>
                              )}

                              {achievement.earned && achievement.earnedDate && (
                                <Badge className="bg-yellow-100 text-yellow-800">
                                  <Award className="h-3 w-3 mr-1" />
                                  Débloqué le {new Date(achievement.earnedDate).toLocaleDateString('fr-FR')}
                                </Badge>
                              )}
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  </Card>
                </div>
              </TabsContent>

              {/* Onglet Paramètres */}
              <TabsContent value="settings">
                <div className="space-y-6">
                  {/* Préférences d'apprentissage */}
                  <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <Brain className="h-5 w-5 mr-2 text-blue-600" />
                      Préférences d'Apprentissage
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label className="text-sm font-medium">Style musical préféré</Label>
                        <Select 
                          value={profile.preferences.musicStyle}
                          onValueChange={(value) => setProfile(prev => ({
                            ...prev, 
                            preferences: { ...prev.preferences, musicStyle: value }
                          }))}
                        >
                          <SelectTrigger className="mt-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="trap">Trap Médical</SelectItem>
                            <SelectItem value="lofi">Lo-Fi Study</SelectItem>
                            <SelectItem value="pop">Pop Éducative</SelectItem>
                            <SelectItem value="jazz">Jazz Clinique</SelectItem>
                            <SelectItem value="afrobeat">Afrobeat Santé</SelectItem>
                            <SelectItem value="classique">Classique Moderne</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-sm font-medium">Niveau de difficulté</Label>
                        <Select 
                          value={profile.preferences.difficulty}
                          onValueChange={(value) => setProfile(prev => ({
                            ...prev, 
                            preferences: { ...prev.preferences, difficulty: value }
                          }))}
                        >
                          <SelectTrigger className="mt-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="debutant">Débutant</SelectItem>
                            <SelectItem value="intermediaire">Intermédiaire</SelectItem>
                            <SelectItem value="avance">Avancé</SelectItem>
                            <SelectItem value="expert">Expert</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-sm font-medium">Durée de session (minutes)</Label>
                        <Select 
                          value={profile.preferences.sessionDuration.toString()}
                          onValueChange={(value) => setProfile(prev => ({
                            ...prev, 
                            preferences: { ...prev.preferences, sessionDuration: parseInt(value) }
                          }))}
                        >
                          <SelectTrigger className="mt-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="15">15 minutes</SelectItem>
                            <SelectItem value="30">30 minutes</SelectItem>
                            <SelectItem value="45">45 minutes</SelectItem>
                            <SelectItem value="60">60 minutes</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </Card>

                  {/* Paramètres de l'application */}
                  <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <Settings className="h-5 w-5 mr-2 text-purple-600" />
                      Paramètres de l'Application
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Bell className="h-5 w-5 text-blue-500" />
                          <div>
                            <p className="font-medium">Notifications push</p>
                            <p className="text-sm text-gray-600">Recevoir des rappels et alertes</p>
                          </div>
                        </div>
                        <Switch 
                          checked={profile.preferences.notifications}
                          onCheckedChange={(checked) => setProfile(prev => ({
                            ...prev, 
                            preferences: { ...prev.preferences, notifications: checked }
                          }))}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Music className="h-5 w-5 text-green-500" />
                          <div>
                            <p className="font-medium">Lecture automatique</p>
                            <p className="text-sm text-gray-600">Démarrer automatiquement la musique suivante</p>
                          </div>
                        </div>
                        <Switch 
                          checked={profile.preferences.autoplay}
                          onCheckedChange={(checked) => setProfile(prev => ({
                            ...prev, 
                            preferences: { ...prev.preferences, autoplay: checked }
                          }))}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Palette className="h-5 w-5 text-purple-500" />
                          <div>
                            <p className="font-medium">Mode sombre</p>
                            <p className="text-sm text-gray-600">Interface avec thème sombre</p>
                          </div>
                        </div>
                        <Switch 
                          checked={profile.preferences.darkMode}
                          onCheckedChange={(checked) => setProfile(prev => ({
                            ...prev, 
                            preferences: { ...prev.preferences, darkMode: checked }
                          }))}
                        />
                      </div>
                    </div>
                  </Card>

                  {/* Actions du compte */}
                  <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <Shield className="h-5 w-5 mr-2 text-red-600" />
                      Gestion du Compte
                    </h3>
                    
                    <div className="space-y-4">
                      <Button variant="outline" className="w-full justify-start">
                        <Download className="h-4 w-4 mr-2" />
                        Exporter mes données
                      </Button>
                      
                      <Button variant="outline" className="w-full justify-start">
                        <Share2 className="h-4 w-4 mr-2" />
                        Partager mon profil
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="w-full justify-start text-red-600 border-red-600 hover:bg-red-50"
                      >
                        <Shield className="h-4 w-4 mr-2" />
                        Supprimer mon compte
                      </Button>
                    </div>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </MedMngLayout>
  );
};

export default Profile;