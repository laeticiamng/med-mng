import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, 
  Edit, 
  Save, 
  Mail, 
  Calendar, 
  MapPin, 
  Award,
  BookOpen,
  Music,
  TrendingUp,
  Settings,
  Bell,
  Shield,
  Download,
  Trash2
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export const ProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: 'Dr. Sarah Martin',
    email: 'sarah.martin@medecin.fr',
    bio: 'Interne en cardiologie passionnée par l\'enseignement médical et l\'innovation pédagogique.',
    location: 'Paris, France',
    specialty: 'Cardiologie',
    university: 'Université Paris Descartes',
    year: 'D4',
    joined: '2023-09-15'
  });

  const userStats = {
    totalStudyTime: 127,
    completedModules: 34,
    generatedMusic: 12,
    streakDays: 15,
    achievements: 8,
    rank: 'Avancé'
  };

  const achievements = [
    { id: 1, name: 'Premier pas', description: 'Première connexion', icon: '🎉', earned: true },
    { id: 2, name: 'Musicien', description: '10 créations musicales', icon: '🎵', earned: true },
    { id: 3, name: 'Assidu', description: '30 jours de connexion', icon: '📚', earned: false },
    { id: 4, name: 'Expert', description: '50 modules complétés', icon: '🏆', earned: false },
  ];

  const recentActivity = [
    { id: 1, type: 'study', title: 'Module EDN-245 complété', date: '2024-01-15', points: 50 },
    { id: 2, type: 'music', title: 'Création "Anatomie cardiaque"', date: '2024-01-14', points: 75 },
    { id: 3, type: 'quiz', title: 'Quiz cardiologie réussi', date: '2024-01-13', points: 30 },
    { id: 4, type: 'streak', title: 'Série de 15 jours maintenue', date: '2024-01-12', points: 100 },
  ];

  const handleSave = () => {
    setIsEditing(false);
    toast({
      title: "Profil mis à jour",
      description: "Vos informations ont été sauvegardées avec succès.",
    });
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'study':
        return <BookOpen className="h-4 w-4 text-blue-600" />;
      case 'music':
        return <Music className="h-4 w-4 text-amber-600" />;
      case 'quiz':
        return <Award className="h-4 w-4 text-green-600" />;
      case 'streak':
        return <TrendingUp className="h-4 w-4 text-purple-600" />;
      default:
        return <User className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Mon Profil
          </h1>
          <p className="text-xl text-muted-foreground">
            Gérez vos informations et suivez vos progrès
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card className="mb-6">
              <CardHeader className="text-center">
                <Avatar className="h-24 w-24 mx-auto mb-4">
                  <AvatarImage src="/placeholder-avatar.jpg" />
                  <AvatarFallback className="text-2xl bg-blue-100 text-blue-600">
                    {profileData.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="flex items-center justify-center gap-2">
                  {profileData.name}
                  <Badge variant="outline">{userStats.rank}</Badge>
                </CardTitle>
                <CardDescription>{profileData.specialty} • {profileData.year}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  {profileData.email}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {profileData.location}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Inscrit le {new Date(profileData.joined).toLocaleDateString()}
                </div>
                
                <Button 
                  className="w-full" 
                  variant={isEditing ? "default" : "outline"}
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Sauvegarder
                    </>
                  ) : (
                    <>
                      <Edit className="h-4 w-4 mr-2" />
                      Modifier
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Statistiques</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm">Temps d'étude</span>
                  <Badge variant="outline">{userStats.totalStudyTime}h</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Modules complétés</span>
                  <Badge variant="outline">{userStats.completedModules}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Créations musicales</span>
                  <Badge variant="outline">{userStats.generatedMusic}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Série actuelle</span>
                  <Badge variant="outline">{userStats.streakDays} jours</Badge>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Progression niveau</span>
                    <span className="text-sm text-muted-foreground">75%</span>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="profile">Profil</TabsTrigger>
                <TabsTrigger value="activity">Activité</TabsTrigger>
                <TabsTrigger value="achievements">Succès</TabsTrigger>
                <TabsTrigger value="settings">Paramètres</TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Informations personnelles</CardTitle>
                    <CardDescription>Gérez vos informations de profil</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nom complet</Label>
                        <Input
                          id="name"
                          value={profileData.name}
                          onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="specialty">Spécialité</Label>
                        <Input
                          id="specialty"
                          value={profileData.specialty}
                          onChange={(e) => setProfileData({...profileData, specialty: e.target.value})}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="year">Année d'études</Label>
                        <Input
                          id="year"
                          value={profileData.year}
                          onChange={(e) => setProfileData({...profileData, year: e.target.value})}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Biographie</Label>
                      <Textarea
                        id="bio"
                        value={profileData.bio}
                        onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                        disabled={!isEditing}
                        rows={3}
                      />
                    </div>

                    {isEditing && (
                      <Button onClick={handleSave} className="w-full">
                        <Save className="h-4 w-4 mr-2" />
                        Sauvegarder les modifications
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="activity" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Activité récente</CardTitle>
                    <CardDescription>Vos dernières actions sur la plateforme</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentActivity.map((activity) => (
                        <div key={activity.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                          <div className="flex items-center gap-3">
                            {getActivityIcon(activity.type)}
                            <div>
                              <div className="font-medium text-sm">{activity.title}</div>
                              <div className="text-xs text-muted-foreground">{activity.date}</div>
                            </div>
                          </div>
                          <Badge variant="outline">+{activity.points} pts</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="achievements" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Succès et récompenses</CardTitle>
                    <CardDescription>Vos accomplissements sur la plateforme</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      {achievements.map((achievement) => (
                        <div 
                          key={achievement.id} 
                          className={`p-4 rounded-lg border ${
                            achievement.earned ? 'bg-green-50 border-green-200' : 'bg-muted/30 border-muted'
                          }`}
                        >
                          <div className="text-center">
                            <div className="text-2xl mb-2">{achievement.icon}</div>
                            <div className="font-medium text-sm">{achievement.name}</div>
                            <div className="text-xs text-muted-foreground">{achievement.description}</div>
                            {achievement.earned && (
                              <Badge variant="default" className="mt-2 bg-green-600">
                                <Award className="h-3 w-3 mr-1" />
                                Obtenu
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Paramètres du compte</CardTitle>
                    <CardDescription>Gérez vos préférences et paramètres</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Notifications email</div>
                          <div className="text-sm text-muted-foreground">Recevoir les notifications par email</div>
                        </div>
                        <Button variant="outline">
                          <Bell className="h-4 w-4 mr-2" />
                          Configurer
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Confidentialité</div>
                          <div className="text-sm text-muted-foreground">Gérer vos paramètres de confidentialité</div>
                        </div>
                        <Button variant="outline">
                          <Shield className="h-4 w-4 mr-2" />
                          Paramètres
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Exporter mes données</div>
                          <div className="text-sm text-muted-foreground">Télécharger une copie de vos données</div>
                        </div>
                        <Button variant="outline">
                          <Download className="h-4 w-4 mr-2" />
                          Exporter
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-red-600">Supprimer le compte</div>
                          <div className="text-sm text-muted-foreground">Suppression définitive de votre compte</div>
                        </div>
                        <Button variant="destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Supprimer
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};