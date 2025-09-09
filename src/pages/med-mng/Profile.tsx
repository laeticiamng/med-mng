import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/components/med-mng/AuthProvider';
import { 
  User, 
  Mail, 
  Calendar, 
  Award, 
  TrendingUp, 
  Edit3, 
  Camera,
  Star,
  Trophy,
  Activity,
  Clock,
  Stethoscope,
  GraduationCap,
  CheckCircle
} from 'lucide-react';

const Profile: React.FC = () => {
  const { user } = useAuth();
  
  const [profile, setProfile] = useState({
    display_name: '',
    specialty: '',
    medical_school: '',
    graduation_year: '',
    bio: '',
    avatar_url: '',
    experience_years: 0
  });
  
  const [stats, setStats] = useState({
    modules_completed: 12,
    average_score: 87,
    study_streak: 15,
    badges_earned: 8,
    total_study_hours: 45,
    level: 4,
    xp: 2340,
    next_level_xp: 3000
  });

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Simulation du chargement des données
    if (user) {
      setProfile({
        display_name: user.user_metadata?.name || '',
        specialty: 'Médecine Générale',
        medical_school: 'Université Paris Descartes',
        graduation_year: '2023',
        bio: 'Passionné par la médecine et l\'apprentissage continu.',
        avatar_url: '',
        experience_years: 2
      });
    }
  }, [user]);

  const handleSave = async () => {
    setLoading(true);
    // Simulation de la sauvegarde
    setTimeout(() => {
      setEditing(false);
      setLoading(false);
    }, 1000);
  };

  const achievements = [
    { id: 1, name: 'Premier pas', description: 'Première connexion', icon: Star, earned: true },
    { id: 2, name: 'Studieux', description: '10 modules terminés', icon: Trophy, earned: true },
    { id: 3, name: 'Expert', description: 'Score moyen > 85%', icon: Award, earned: true },
    { id: 4, name: 'Régulier', description: '30 jours consécutifs', icon: Clock, earned: false },
  ];

  const progressPercent = (stats.xp / stats.next_level_xp) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Mon Profil Médical</h1>
          <p className="text-gray-600">Gérez votre profil professionnel et suivez vos progrès</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="relative inline-block mb-4">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={profile.avatar_url} />
                      <AvatarFallback className="bg-blue-100 text-blue-600 text-2xl">
                        {profile.display_name ? profile.display_name.split(' ').map(n => n[0]).join('').slice(0, 2) : 
                         user?.email?.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      size="sm"
                      className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <h2 className="text-xl font-bold text-gray-900 mb-1">
                    {profile.display_name || 'Docteur'}
                  </h2>
                  
                  <p className="text-gray-600 text-sm mb-3">{user?.email}</p>
                  
                  <Badge className="bg-blue-100 text-blue-800 mb-4">
                    {profile.specialty}
                  </Badge>
                </div>

                <Separator className="my-6" />

                {/* Level & XP */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-yellow-500" />
                      <span className="font-medium">Niveau {stats.level}</span>
                    </div>
                    <span className="text-gray-600 text-sm">{stats.xp} XP</span>
                  </div>
                  
                  <Progress value={progressPercent} className="h-2" />
                  
                  <p className="text-gray-500 text-xs text-center">
                    {stats.next_level_xp - stats.xp} XP jusqu'au niveau {stats.level + 1}
                  </p>
                </div>

                <Separator className="my-6" />

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{stats.modules_completed}</div>
                    <div className="text-gray-600 text-xs">Modules</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">{stats.average_score}%</div>
                    <div className="text-gray-600 text-xs">Score moyen</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">{stats.study_streak}</div>
                    <div className="text-gray-600 text-xs">Jours consécutifs</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-600">{stats.total_study_hours}h</div>
                    <div className="text-gray-600 text-xs">Temps d'étude</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Professional Info */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Stethoscope className="h-5 w-5" />
                    Informations Professionnelles
                  </CardTitle>
                  <CardDescription>
                    Vos informations médicales et académiques
                  </CardDescription>
                </div>
                <Button
                  onClick={() => editing ? handleSave() : setEditing(true)}
                  disabled={loading}
                  variant={editing ? "default" : "outline"}
                >
                  {editing ? (loading ? 'Sauvegarde...' : 'Sauvegarder') : (
                    <>
                      <Edit3 className="h-4 w-4 mr-2" />
                      Modifier
                    </>
                  )}
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="display_name">Nom complet</Label>
                    <Input
                      id="display_name"
                      value={profile.display_name}
                      onChange={(e) => setProfile(prev => ({ ...prev, display_name: e.target.value }))}
                      disabled={!editing}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="specialty">Spécialité</Label>
                    <Input
                      id="specialty"
                      value={profile.specialty}
                      onChange={(e) => setProfile(prev => ({ ...prev, specialty: e.target.value }))}
                      disabled={!editing}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="medical_school">École de médecine</Label>
                    <Input
                      id="medical_school"
                      value={profile.medical_school}
                      onChange={(e) => setProfile(prev => ({ ...prev, medical_school: e.target.value }))}
                      disabled={!editing}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="graduation_year">Année de diplôme</Label>
                    <Input
                      id="graduation_year"
                      value={profile.graduation_year}
                      onChange={(e) => setProfile(prev => ({ ...prev, graduation_year: e.target.value }))}
                      disabled={!editing}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Biographie professionnelle</Label>
                  <Textarea
                    id="bio"
                    value={profile.bio}
                    onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                    disabled={!editing}
                    rows={4}
                  />
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-gray-600 text-sm">{user?.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-medium">Membre depuis</p>
                      <p className="text-gray-600 text-sm">
                        {user?.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : 'N/A'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <GraduationCap className="h-5 w-5 text-purple-500" />
                    <div>
                      <p className="font-medium">Expérience</p>
                      <p className="text-gray-600 text-sm">{profile.experience_years} ans</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-orange-500" />
                    <div>
                      <p className="font-medium">Progression</p>
                      <p className="text-gray-600 text-sm">Niveau {stats.level}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Succès et Réalisations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {achievements.map((achievement) => {
                    const IconComponent = achievement.icon;
                    return (
                      <div 
                        key={achievement.id} 
                        className={`flex items-center gap-3 p-4 rounded-lg border ${
                          achievement.earned 
                            ? 'bg-yellow-50 border-yellow-200' 
                            : 'bg-gray-50 border-gray-200 opacity-60'
                        }`}
                      >
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                          achievement.earned 
                            ? 'bg-yellow-100 text-yellow-600' 
                            : 'bg-gray-100 text-gray-400'
                        }`}>
                          <IconComponent className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{achievement.name}</h4>
                          <p className="text-gray-600 text-sm">{achievement.description}</p>
                        </div>
                        {achievement.earned && (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Activity Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Résumé d'activité
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                      <span>Dernière connexion</span>
                    </div>
                    <span className="text-gray-600 text-sm">Aujourd'hui</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                      <span>Module terminé</span>
                    </div>
                    <span className="text-gray-600 text-sm">Il y a 2 heures</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 bg-purple-500 rounded-full"></div>
                      <span>Nouveau badge obtenu</span>
                    </div>
                    <span className="text-gray-600 text-sm">Hier</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;