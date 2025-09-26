import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Trophy, 
  Star, 
  Heart, 
  Brain,
  Music,
  Target,
  Zap,
  Crown,
  Gift
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/components/providers/AuthProvider';
import { useNavigate } from 'react-router-dom';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
}

interface PersonalizedMessage {
  greeting: string;
  message: string;
  action: string;
  route: string;
  color: string;
}

export const PersonalizedWelcome: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showAchievements, setShowAchievements] = useState(false);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  const achievements: Achievement[] = [
    {
      id: 'first-generation',
      title: 'Premier Pas',
      description: 'Première musique générée',
      icon: Music,
      color: 'from-green-400 to-emerald-500',
      rarity: 'common',
      unlocked: true
    },
    {
      id: 'study-streak',
      title: 'Assidu',
      description: '7 jours consécutifs d\'apprentissage',
      icon: Target,
      color: 'from-blue-400 to-cyan-500',
      rarity: 'rare',
      unlocked: true,
      progress: 5,
      maxProgress: 7
    },
    {
      id: 'master-learner',
      title: 'Maître Apprenant',
      description: '100 items EDN maîtrisés',
      icon: Crown,
      color: 'from-purple-400 to-pink-500',
      rarity: 'epic',
      unlocked: false,
      progress: 67,
      maxProgress: 100
    },
    {
      id: 'legend',
      title: 'Légende Médicale',
      description: 'Tous les objectifs atteints',
      icon: Trophy,
      color: 'from-yellow-400 to-orange-500',
      rarity: 'legendary',
      unlocked: false,
      progress: 3,
      maxProgress: 10
    }
  ];

  const getPersonalizedMessage = (): PersonalizedMessage => {
    const hour = currentTime.getHours();
    const userName = user?.email?.split('@')[0] || 'Futur Médecin';
    
    const messages: PersonalizedMessage[] = [
      {
        greeting: hour < 12 ? '🌅 Bonjour' : hour < 18 ? '☀️ Bon après-midi' : '🌙 Bonsoir',
        message: `${userName} ! Prêt à transformer vos connaissances en mélodies inoubliables ?`,
        action: 'Créer une musique magique',
        route: '/generator',
        color: 'from-purple-500 to-pink-500'
      },
      {
        greeting: '✨ Salut Champion',
        message: `${userName} ! Votre progression est impressionnante. Continuons cette ascension !`,
        action: 'Découvrir mes statistiques',
        route: '/analytics',
        color: 'from-blue-500 to-cyan-500'
      },
      {
        greeting: '🎯 Hey Expert',
        message: `${userName} ! Un nouveau défi ECOS vous attend. Relevez-vous le défi ?`,
        action: 'Lancer une simulation',
        route: '/ecos',
        color: 'from-green-500 to-emerald-500'
      },
      {
        greeting: '🧠 Salut Génie',
        message: `${userName} ! L'assistant IA a hâte de répondre à vos questions brillantes !`,
        action: 'Poser une question',
        route: '/med-chat',
        color: 'from-orange-500 to-red-500'
      }
    ];

    return messages[currentMessageIndex];
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-800';
      case 'rare': return 'bg-blue-100 text-blue-800';
      case 'epic': return 'bg-purple-100 text-purple-800';
      case 'legendary': return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Rotation des messages
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % 4);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  // Mise à jour de l'heure
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const currentMessage = getPersonalizedMessage();

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Message de bienvenue personnalisé */}
      <motion.div
        key={currentMessageIndex}
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.9 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
      >
        <Card className="relative overflow-hidden border-0 shadow-2xl">
          <div className={`absolute inset-0 bg-gradient-to-r ${currentMessage.color} opacity-10`} />
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white to-transparent animate-shimmer" />
          
          <CardContent className="relative p-8">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <motion.h2 
                  className="text-2xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {currentMessage.greeting}
                </motion.h2>
                <motion.p 
                  className="text-muted-foreground mb-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {currentMessage.message}
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Button
                    className={`bg-gradient-to-r ${currentMessage.color} hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300`}
                    onClick={() => navigate(currentMessage.route)}
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    {currentMessage.action}
                  </Button>
                </motion.div>
              </div>

              {/* Mascotte animée */}
              <motion.div
                className="hidden md:block"
                animate={{ 
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.05, 1]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <div className="w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-6xl shadow-xl">
                  🧠
                </div>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Succès et réalisations */}
      <Card className="relative overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <h3 className="font-semibold">Vos Réalisations</h3>
              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                {achievements.filter(a => a.unlocked).length}/{achievements.length}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAchievements(!showAchievements)}
            >
              {showAchievements ? 'Masquer' : 'Voir tout'}
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {achievements.slice(0, showAchievements ? undefined : 4).map((achievement, index) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`
                  relative p-4 rounded-lg border-2 transition-all duration-300 cursor-pointer
                  ${achievement.unlocked 
                    ? 'border-green-300 bg-green-50 hover:shadow-md' 
                    : 'border-gray-200 bg-gray-50 opacity-75'
                  }
                `}
              >
                <div className="text-center">
                  <div className={`
                    w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center
                    bg-gradient-to-r ${achievement.color}
                    ${achievement.unlocked ? 'text-white' : 'text-gray-400'}
                  `}>
                    <achievement.icon className="h-6 w-6" />
                  </div>
                  
                  <h4 className="font-medium text-sm mb-1">{achievement.title}</h4>
                  <p className="text-xs text-muted-foreground mb-2">{achievement.description}</p>
                  
                  <Badge className={`text-xs ${getRarityColor(achievement.rarity)}`}>
                    {achievement.rarity}
                  </Badge>

                  {achievement.progress !== undefined && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                          className={`h-1.5 rounded-full bg-gradient-to-r ${achievement.color}`}
                          style={{ width: `${(achievement.progress! / achievement.maxProgress!) * 100}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {achievement.progress}/{achievement.maxProgress}
                      </p>
                    </div>
                  )}
                </div>

                {achievement.unlocked && (
                  <div className="absolute -top-1 -right-1">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <Star className="h-3 w-3 text-white" />
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Cadeau quotidien */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="relative overflow-hidden border-2 border-dashed border-yellow-300 bg-gradient-to-r from-yellow-50 to-orange-50">
          <CardContent className="p-6 text-center">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-block mb-3"
            >
              <Gift className="h-12 w-12 text-yellow-600" />
            </motion.div>
            <h3 className="font-bold text-yellow-800 mb-2">🎁 Cadeau Quotidien</h3>
            <p className="text-yellow-700 text-sm mb-4">
              Revenez demain pour débloquer une nouvelle récompense !
            </p>
            <Badge className="bg-yellow-200 text-yellow-800">
              Prochaine récompense dans 8h 23min
            </Badge>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};