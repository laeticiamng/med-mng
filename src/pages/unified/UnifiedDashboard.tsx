import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  Brain, 
  Music, 
  Users, 
  Trophy, 
  Clock, 
  Target, 
  TrendingUp,
  Zap,
  Heart,
  Star,
  Activity,
  Award,
  BarChart3,
  ArrowRight,
  Lightbulb,
  HeadphonesIcon,
  GraduationCap
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';

const UnifiedDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats] = useState({
    studyTime: 12450, // minutes
    itemsCompleted: 127,
    streakDays: 15,
    level: 8,
    experience: 2850,
    nextLevelExp: 3500
  });

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h${mins.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <Helmet>
        <title>Dashboard Unifié - MED-MNG</title>
        <meta name="description" content="Tableau de bord principal de votre apprentissage médical avec analytics avancées et outils IA" />
      </Helmet>

      <div className="container mx-auto p-6 space-y-8 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Dashboard Unifié 🏥
          </h1>
          <p className="text-xl text-muted-foreground">
            Vue d'ensemble complète de votre progression médicale
          </p>
        </motion.div>

        {/* Statistiques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Temps d'étude</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatTime(stats.studyTime)}</div>
              <p className="text-xs text-muted-foreground">+2h cette semaine</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Items complétés</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.itemsCompleted}/367</div>
              <Progress value={(stats.itemsCompleted / 367) * 100} className="mt-2 h-2" />
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Série active</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.streakDays} jours</div>
              <p className="text-xs text-muted-foreground">Record personnel !</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Niveau</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Niveau {stats.level}</div>
              <Progress value={(stats.experience / stats.nextLevelExp) * 100} className="mt-2 h-2" />
            </CardContent>
          </Card>
        </div>

        {/* Actions rapides */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Actions Rapides
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { title: 'Explorer EDN', path: '/edn', icon: BookOpen, color: 'bg-blue-500' },
                { title: 'Créer avec IA', path: '/generator', icon: Brain, color: 'bg-purple-500' },
                { title: 'Studio Musical', path: '/med-mng/dashboard', icon: Music, color: 'bg-green-500' },
                { title: 'Simulations ECOS', path: '/ecos', icon: Target, color: 'bg-orange-500' },
                { title: 'Assistant IA', path: '/chat', icon: Lightbulb, color: 'bg-indigo-500' },
                { title: 'Communauté', path: '/community', icon: Users, color: 'bg-pink-500' }
              ].map((action, index) => (
                <Card key={index} className="cursor-pointer hover:shadow-lg transition-all duration-200" onClick={() => navigate(action.path)}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${action.color} text-white`}>
                        <action.icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{action.title}</h3>
                        <Button variant="ghost" size="sm" className="mt-1 p-0 h-auto">
                          Accéder <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default UnifiedDashboard;