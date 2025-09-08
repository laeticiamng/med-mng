import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './AuthProvider';
import { 
  User,
  Mail,
  Calendar,
  BookOpen,
  Music,
  Trophy,
  Settings,
  Camera,
  Save,
  Edit3,
  Star,
  Clock,
  Headphones,
  Target
} from 'lucide-react';

interface UserStats {
  totalListens: number;
  favoriteSongs: number;
  coursesCompleted: number;
  studyStreak: number;
  totalStudyHours: number;
  averageScore: number;
}

interface ProfileData {
  fullName: string;
  email: string;
  bio: string;
  studyLevel: string;
  specialization: string;
  university: string;
  graduationYear: string;
  avatarUrl?: string;
}

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [profileData, setProfileData] = useState<ProfileData>({
    fullName: user?.user_metadata?.full_name || '',
    email: user?.email || '',
    bio: '',
    studyLevel: 'Externe',
    specialization: 'Médecine Générale',
    university: '',
    graduationYear: new Date().getFullYear().toString(),
    avatarUrl: user?.user_metadata?.avatar_url
  });

  const [stats, setStats] = useState<UserStats>({
    totalListens: 127,
    favoriteSongs: 23,
    coursesCompleted: 8,
    studyStreak: 15,
    totalStudyHours: 45.5,
    averageScore: 85.2
  });

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      // Here you would typically save to your backend
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été sauvegardées avec succès"
      });
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder votre profil",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const achievements = [
    { id: 1, title: 'Premier pas', description: 'Première connexion', icon: Star, earned: true },
    { id: 2, title: 'Mélomane', description: '100 écoutes musicales', icon: Music, earned: true },
    { id: 3, title: 'Assidu', description: '7 jours consécutifs', icon: Calendar, earned: true },
    { id: 4, title: 'Expert', description: 'Score moyen > 80%', icon: Trophy, earned: true },
    { id: 5, title: 'Marathonien', description: '50h d\'étude', icon: Target, earned: false }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 to-purple-50/30 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Mon Profil
          </h1>
          <p className="text-muted-foreground mt-2">
            Gérez vos informations et suivez vos progrès
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <Card>
              <CardHeader className="text-center">
                <div className="relative inline-block">
                  <Avatar className="h-24 w-24 mx-auto">
                    <AvatarImage src={profileData.avatarUrl} />
                    <AvatarFallback className="text-lg">
                      {getInitials(profileData.fullName || 'User')}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
                <CardTitle className="mt-4">{profileData.fullName}</CardTitle>
                <p className="text-sm text-muted-foreground">{profileData.email}</p>
                <Badge variant="secondary" className="mt-2">
                  {profileData.studyLevel}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Spécialisation</p>
                  <p className="font-medium">{profileData.specialization}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-blue-600">{stats.studyStreak}</p>
                    <p className="text-xs text-muted-foreground">Jours consécutifs</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-purple-600">{stats.averageScore}%</p>
                    <p className="text-xs text-muted-foreground">Score moyen</p>
                  </div>
                </div>

                <Button
                  onClick={() => setIsEditing(!isEditing)}
                  className="w-full"
                  variant={isEditing ? "outline" : "default"}
                >
                  <Edit3 className="mr-2 h-4 w-4" />
                  {isEditing ? 'Annuler' : 'Modifier le profil'}
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Aperçu</TabsTrigger>
                <TabsTrigger value="stats">Statistiques</TabsTrigger>
                <TabsTrigger value="achievements">Succès</TabsTrigger>
                <TabsTrigger value="settings">Paramètres</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Informations personnelles
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {isEditing ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="fullName">Nom complet</Label>
                            <Input
                              id="fullName"
                              value={profileData.fullName}
                              onChange={(e) => setProfileData(prev => ({
                                ...prev,
                                fullName: e.target.value
                              }))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                              id="email"
                              type="email"
                              value={profileData.email}
                              disabled
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="bio">Biographie</Label>
                          <Textarea
                            id="bio"
                            value={profileData.bio}
                            onChange={(e) => setProfileData(prev => ({
                              ...prev,
                              bio: e.target.value
                            }))}
                            placeholder="Parlez-nous de vous..."
                            rows={3}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="studyLevel">Niveau d'études</Label>
                            <select
                              id="studyLevel"
                              value={profileData.studyLevel}
                              onChange={(e) => setProfileData(prev => ({
                                ...prev,
                                studyLevel: e.target.value
                              }))}
                              className="w-full px-3 py-2 border rounded-md bg-background"
                            >
                              <option value="DFGSM">DFGSM</option>
                              <option value="DFASM">DFASM</option>
                              <option value="Externe">Externe</option>
                              <option value="Interne">Interne</option>
                              <option value="Praticien">Praticien</option>
                            </select>
                          </div>
                          <div>
                            <Label htmlFor="specialization">Spécialisation</Label>
                            <Input
                              id="specialization"
                              value={profileData.specialization}
                              onChange={(e) => setProfileData(prev => ({
                                ...prev,
                                specialization: e.target.value
                              }))}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="university">Université</Label>
                            <Input
                              id="university"
                              value={profileData.university}
                              onChange={(e) => setProfileData(prev => ({
                                ...prev,
                                university: e.target.value
                              }))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="graduationYear">Année de diplôme</Label>
                            <Input
                              id="graduationYear"
                              type="number"
                              value={profileData.graduationYear}
                              onChange={(e) => setProfileData(prev => ({
                                ...prev,
                                graduationYear: e.target.value
                              }))}
                            />
                          </div>
                        </div>

                        <div className="flex gap-2 pt-4">
                          <Button onClick={handleSaveProfile} disabled={loading}>
                            <Save className="mr-2 h-4 w-4" />
                            {loading ? 'Sauvegarde...' : 'Sauvegarder'}
                          </Button>
                          <Button variant="outline" onClick={() => setIsEditing(false)}>
                            Annuler
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Biographie</Label>
                          <p className="mt-1">
                            {profileData.bio || 'Aucune biographie renseignée.'}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">Université</Label>
                            <p className="mt-1">{profileData.university || 'Non renseigné'}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">Année de diplôme</Label>
                            <p className="mt-1">{profileData.graduationYear}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="stats" className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <Headphones className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                      <p className="text-2xl font-bold">{stats.totalListens}</p>
                      <p className="text-sm text-muted-foreground">Écoutes totales</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <Music className="h-8 w-8 mx-auto mb-2 text-red-500" />
                      <p className="text-2xl font-bold">{stats.favoriteSongs}</p>
                      <p className="text-sm text-muted-foreground">Favoris</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <BookOpen className="h-8 w-8 mx-auto mb-2 text-green-500" />
                      <p className="text-2xl font-bold">{stats.coursesCompleted}</p>
                      <p className="text-sm text-muted-foreground">Cours terminés</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <Clock className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                      <p className="text-2xl font-bold">{stats.totalStudyHours}h</p>
                      <p className="text-sm text-muted-foreground">Temps d'étude</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <Calendar className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                      <p className="text-2xl font-bold">{stats.studyStreak}</p>
                      <p className="text-sm text-muted-foreground">Jours consécutifs</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <Trophy className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                      <p className="text-2xl font-bold">{stats.averageScore}%</p>
                      <p className="text-sm text-muted-foreground">Score moyen</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="achievements" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Succès débloqués</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      {achievements.map((achievement) => (
                        <div
                          key={achievement.id}
                          className={`flex items-center gap-4 p-4 rounded-lg border ${
                            achievement.earned
                              ? 'bg-green-50 border-green-200'
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className={`p-2 rounded-full ${
                            achievement.earned
                              ? 'bg-green-100 text-green-600'
                              : 'bg-gray-100 text-gray-400'
                          }`}>
                            <achievement.icon className="h-6 w-6" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{achievement.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {achievement.description}
                            </p>
                          </div>
                          {achievement.earned && (
                            <Badge variant="secondary" className="bg-green-100 text-green-700">
                              Débloqué
                            </Badge>
                          )}
                        </div>
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
                      Paramètres du compte
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">
                      Les paramètres avancés seront bientôt disponibles.
                    </p>
                    <Button variant="outline" disabled>
                      Modifier le mot de passe
                    </Button>
                    <Button variant="outline" disabled>
                      Télécharger mes données
                    </Button>
                    <Button variant="destructive" disabled>
                      Supprimer mon compte
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </div>
  );
};