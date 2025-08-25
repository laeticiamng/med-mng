import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { NavButton } from '@/components/navigation/NavButton';
import { findNavNode } from '@/lib/nav-schema';
import type { NavigationContext } from '@/types/nav';
import { 
  BookOpen, 
  Stethoscope, 
  Music, 
  TrendingUp, 
  Users, 
  Star,
  Play,
  Clock,
  Calendar,
  Award,
  Target
} from 'lucide-react';

export const HomePage = () => {
  const [completedModules] = useState(12);
  const [totalModules] = useState(28);
  const progress = (completedModules / totalModules) * 100;

  // Mock navigation context - in real app this would come from auth/context
  const navContext: NavigationContext = {
    isAuthenticated: true,
    userRoles: ['user'],
    featureFlags: {}
  };

  const recentActivities = [
    { id: 1, type: 'ecos', title: 'Simulation cardiologie', time: '2h', completed: true },
    { id: 2, type: 'edn', title: 'Item 234 - Pneumonie', time: '1h', completed: false },
    { id: 3, type: 'music', title: 'Chanson anatomie', time: '30min', completed: true },
  ];

  const quickStats = [
    { label: 'Modules complétés', value: completedModules, icon: Award, color: 'text-green-600' },
    { label: 'Heures d\'étude', value: '156h', icon: Clock, color: 'text-blue-600' },
    { label: 'Rang actuel', value: '4ème', icon: TrendingUp, color: 'text-amber-600' },
    { label: 'Streak', value: '12 jours', icon: Target, color: 'text-purple-600' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-amber-50">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-amber-600 bg-clip-text text-transparent mb-4">
            Bienvenue sur MED-MNG
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Votre plateforme complète d'apprentissage médical innovant
          </p>
          
          {/* Progress Overview */}
          <Card className="max-w-2xl mx-auto mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                Progression globale
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Progress value={progress} className="h-3" />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{completedModules}/{totalModules} modules</span>
                  <span>{Math.round(progress)}% complété</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {quickStats.map((stat, index) => (
            <Card key={index} className="text-center">
              <CardContent className="p-4">
                <stat.icon className={`h-8 w-8 mx-auto mb-2 ${stat.color}`} />
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* ECOS Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="h-6 w-6 text-blue-600" />
                Simulations ECOS
              </CardTitle>
              <CardDescription>
                Entraînez-vous avec des cas cliniques interactifs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Badge variant="secondary">15 simulations disponibles</Badge>
              <p className="text-sm text-muted-foreground">
                Perfectionnez vos compétences cliniques avec nos simulations d'examen
              </p>
              <NavButton 
                node={findNavNode("ecos")!} 
                context={navContext}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <Play className="h-4 w-4 mr-2" />
                Commencer
              </NavButton>
            </CardContent>
          </Card>

          {/* EDN Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-green-600" />
                Items EDN
              </CardTitle>
              <CardDescription>
                Contenu pédagogique structuré et immersif
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Badge variant="secondary">280+ items disponibles</Badge>
              <p className="text-sm text-muted-foreground">
                Apprenez avec du contenu multimédia et des parcours adaptatifs
              </p>
              <NavButton 
                node={findNavNode("edn")!} 
                context={navContext}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Explorer
              </NavButton>
            </CardContent>
          </Card>

          {/* MED-MNG Music Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Music className="h-6 w-6 text-amber-600" />
                MED-MNG Music
              </CardTitle>
              <CardDescription>
                Apprentissage par la musique et création audio
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Badge variant="secondary">Nouveau !</Badge>
              <p className="text-sm text-muted-foreground">
                Créez et partagez des contenus musicaux éducatifs
              </p>
              <NavButton 
                node={findNavNode("medmng-create")!} 
                context={navContext}
                className="w-full bg-amber-600 hover:bg-amber-700"
              >
                <Music className="h-4 w-4 mr-2" />
                Créer
              </NavButton>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                Activité récente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      {activity.type === 'ecos' && <Stethoscope className="h-4 w-4 text-blue-600" />}
                      {activity.type === 'edn' && <BookOpen className="h-4 w-4 text-green-600" />}
                      {activity.type === 'music' && <Music className="h-4 w-4 text-amber-600" />}
                      <div>
                        <div className="font-medium text-sm">{activity.title}</div>
                        <div className="text-xs text-muted-foreground">{activity.time}</div>
                      </div>
                    </div>
                    {activity.completed && (
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        <Star className="h-3 w-3 mr-1" />
                        Complété
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-600" />
                Actions rapides
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <NavButton node={findNavNode("medmng-library")!} context={navContext} variant="outline" className="w-full justify-start">
                <Music className="h-4 w-4 mr-2" />
                Ma bibliothèque musicale
              </NavButton>
              <NavButton node={findNavNode("chat")!} context={navContext} variant="outline" className="w-full justify-start">
                <Users className="h-4 w-4 mr-2" />
                Assistant IA médical
              </NavButton>
              <NavButton node={findNavNode("profile")!} context={navContext} variant="outline" className="w-full justify-start">
                <Users className="h-4 w-4 mr-2" />
                Mon profil
              </NavButton>
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="h-4 w-4 mr-2" />
                Planning d'étude
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};