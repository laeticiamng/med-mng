import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  Target, 
  TrendingUp, 
  Calendar, 
  Star, 
  Award, 
  Clock, 
  BookOpen,
  Music,
  Zap,
  Users,
  CheckCircle2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface LearningGoal {
  id: string;
  title: string;
  progress: number;
  deadline: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface StudySession {
  id: string;
  itemCode: string;
  title: string;
  duration: number;
  score: number;
  timestamp: string;
}

export const PersonalizedDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [currentStreak, setCurrentStreak] = useState(12);
  const [weeklyGoal, setWeeklyGoal] = useState(85);
  
  const [learningGoals] = useState<LearningGoal[]>([
    {
      id: '1',
      title: 'Maîtriser Cardiologie (IC-221 à IC-239)',
      progress: 68,
      deadline: '2024-02-15',
      priority: 'high',
      category: 'Spécialité'
    },
    {
      id: '2', 
      title: 'Révision Items Urgence',
      progress: 45,
      deadline: '2024-02-10',
      priority: 'high',
      category: 'Révision'
    },
    {
      id: '3',
      title: 'Génération 50 chansons EDN',
      progress: 32,
      deadline: '2024-02-20',
      priority: 'medium',
      category: 'Création'
    }
  ]);

  const [achievements] = useState<Achievement[]>([
    {
      id: '1',
      title: 'Virtuose Musical',
      description: 'Généré 25 chansons éducatives',
      icon: '🎵',
      unlockedAt: '2024-01-20',
      rarity: 'rare'
    },
    {
      id: '2',
      title: 'Cardiologue en Herbe', 
      description: 'Maîtrisé tous les items de cardiologie',
      icon: '❤️',
      unlockedAt: '2024-01-18',
      rarity: 'epic'
    },
    {
      id: '3',
      title: 'Étudiant Assidu',
      description: 'Étudié 7 jours consécutifs',
      icon: '📚',
      unlockedAt: '2024-01-15',
      rarity: 'common'
    }
  ]);

  const [recentSessions] = useState<StudySession[]>([
    {
      id: '1',
      itemCode: 'IC-230',
      title: 'Insuffisance cardiaque',
      duration: 45,
      score: 92,
      timestamp: '2024-01-22T14:30:00'
    },
    {
      id: '2',
      itemCode: 'IC-091',
      title: 'Déficit neurologique',
      duration: 38,
      score: 85,
      timestamp: '2024-01-22T10:15:00'
    },
    {
      id: '3',
      itemCode: 'IC-156',
      title: 'BPCO',
      duration: 52,
      score: 88,
      timestamp: '2024-01-21T16:45:00'
    }
  ]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-400/50 bg-red-500/10';
      case 'medium': return 'border-yellow-400/50 bg-yellow-500/10';
      case 'low': return 'border-green-400/50 bg-green-500/10';
      default: return 'border-gray-400/50 bg-gray-500/10';
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-500/20 text-gray-300 border-gray-400/30';
      case 'rare': return 'bg-blue-500/20 text-blue-300 border-blue-400/30';
      case 'epic': return 'bg-purple-500/20 text-purple-300 border-purple-400/30';
      case 'legendary': return 'bg-orange-500/20 text-orange-300 border-orange-400/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-400/30';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'À l\'instant';
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    return `Il y a ${Math.floor(diffInHours / 24)} jours`;
  };

  return (
    <div className="space-y-6">
      {/* Header personnalisé */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          Bonjour ! Prêt à apprendre ?
        </h2>
        <p className="text-gray-300">
          Voici votre progression personnalisée pour aujourd'hui
        </p>
      </div>

      {/* Stats principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-400/30 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <Zap className="h-8 w-8 text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{currentStreak}</div>
            <div className="text-sm text-blue-300">Jours d'affilée</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/20 to-green-600/20 border-green-400/30 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <Target className="h-8 w-8 text-green-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{weeklyGoal}%</div>
            <div className="text-sm text-green-300">Objectif hebdo</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border-purple-400/30 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <Music className="h-8 w-8 text-purple-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">47</div>
            <div className="text-sm text-purple-300">Chansons créées</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 border-orange-400/30 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <Award className="h-8 w-8 text-orange-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">89%</div>
            <div className="text-sm text-orange-300">Score moyen</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Objectifs d'apprentissage */}
        <Card className="bg-black/20 backdrop-blur-sm border border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-400" />
              Objectifs d'Apprentissage
            </CardTitle>
            <CardDescription className="text-gray-300">
              Suivez votre progression vers vos objectifs
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {learningGoals.map((goal) => (
              <div key={goal.id} className={`p-4 rounded-lg border ${getPriorityColor(goal.priority)}`}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-white text-sm">{goal.title}</h4>
                  <Badge variant="outline" className="text-xs">
                    {goal.priority === 'high' ? '🔥' : goal.priority === 'medium' ? '⚡' : '📋'} 
                    {goal.priority}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <Progress value={goal.progress} className="h-2" />
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>{goal.progress}% complété</span>
                    <span>Échéance: {new Date(goal.deadline).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
              </div>
            ))}
            <Button 
              variant="outline" 
              className="w-full text-white border-white/20 hover:bg-white/10"
              onClick={() => navigate('/edn')}
            >
              Continuer l'apprentissage
            </Button>
          </CardContent>
        </Card>

        {/* Succès récents */}
        <Card className="bg-black/20 backdrop-blur-sm border border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-400" />
              Succès Débloqués
            </CardTitle>
            <CardDescription className="text-gray-300">
              Vos derniers accomplissements
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {achievements.map((achievement) => (
              <div key={achievement.id} className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="text-2xl">{achievement.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-white text-sm">{achievement.title}</h4>
                    <Badge className={getRarityColor(achievement.rarity)} variant="outline">
                      {achievement.rarity}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-400 mb-1">{achievement.description}</p>
                  <p className="text-xs text-gray-500">
                    Débloqué le {new Date(achievement.unlockedAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Sessions récentes */}
      <Card className="bg-black/20 backdrop-blur-sm border border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-green-400" />
            Sessions Récentes
          </CardTitle>
          <CardDescription className="text-gray-300">
            Votre activité d'apprentissage récente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentSessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium text-white text-sm">{session.itemCode}</h4>
                    <p className="text-xs text-gray-400">{session.title}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="bg-green-500/20 text-green-300 border-green-400/30">
                      {session.score}%
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="h-3 w-3" />
                    <span>{session.duration}min • {formatTimeAgo(session.timestamp)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Button 
            variant="outline" 
            className="w-full mt-4 text-white border-white/20 hover:bg-white/10"
            onClick={() => navigate('/edn')}
          >
            Voir toute l'activité
          </Button>
        </CardContent>
      </Card>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Button 
          onClick={() => navigate('/generator')} 
          className="h-20 bg-gradient-to-br from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white border-0 flex flex-col items-center justify-center gap-2"
        >
          <Music className="h-6 w-6" />
          Créer une chanson
        </Button>
        <Button 
          onClick={() => navigate('/edn')}
          className="h-20 bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-0 flex flex-col items-center justify-center gap-2"
        >
          <BookOpen className="h-6 w-6" />
          Étudier EDN
        </Button>
        <Button 
          onClick={() => navigate('/ecos')}
          className="h-20 bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0 flex flex-col items-center justify-center gap-2"
        >
          <Users className="h-6 w-6" />
          Simulation ECOS
        </Button>
        <Button 
          onClick={() => navigate('/analytics')}
          className="h-20 bg-gradient-to-br from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white border-0 flex flex-col items-center justify-center gap-2"
        >
          <TrendingUp className="h-6 w-6" />
          Voir Analytics
        </Button>
      </div>
    </div>
  );
};