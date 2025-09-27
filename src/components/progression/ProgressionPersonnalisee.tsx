import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { 
  Target, Trophy, Zap, Brain, Clock, BarChart, Star, 
  TrendingUp, Award, Sparkles, Rocket, Crown, Medal,
  ChevronRight, Play, Lock, CheckCircle, AlertTriangle
} from 'lucide-react';

interface AmbitionLevel {
  id: string;
  name: string;
  description: string;
  targetRank: string;
  dailyGoals: {
    study_minutes: number;
    items_completed: number;
    docflemme_sessions: number;
    ecos_simulations: number;
  };
  features: string[];
  gradient: string;
  icon: React.ReactNode;
  motivation: string;
  challenge_level: number;
  estimated_success: number;
}

interface ProgressionData {
  current_level: string;
  streak_days: number;
  total_points: number;
  weekly_progress: number[];
  completed_items: number;
  total_items: number;
  mastery_scores: {
    rang_a: number;
    rang_b: number;
    clinical_reasoning: number;
    memorization: number;
  };
  next_milestone: {
    name: string;
    progress: number;
    reward: string;
  };
}

interface ProgressionPersonnaliseeProps {
  className?: string;
  onAmbitionChange?: (ambition: string) => void;
}

export const ProgressionPersonnalisee = ({ className, onAmbitionChange }: ProgressionPersonnaliseeProps) => {
  const [selectedAmbition, setSelectedAmbition] = useState<string>('reussite');
  const [isAnimating, setIsAnimating] = useState(false);
  const [progressionData, setProgressionData] = useState<ProgressionData>({
    current_level: 'reussite',
    streak_days: 12,
    total_points: 2840,
    weekly_progress: [65, 72, 80, 85, 78, 90, 95],
    completed_items: 45,
    total_items: 367,
    mastery_scores: {
      rang_a: 78,
      rang_b: 45,
      clinical_reasoning: 82,
      memorization: 88
    },
    next_milestone: {
      name: 'Maître DocFlemme',
      progress: 67,
      reward: 'Accès exclusif aux styles premium'
    }
  });

  // Niveaux d'ambition MED-MNG
  const ambitionLevels: AmbitionLevel[] = [
    {
      id: 'decouverte',
      name: 'Découverte MED-MNG',
      description: 'Explore les fonctionnalités à ton rythme',
      targetRank: 'Réussir l\'ECN',
      dailyGoals: {
        study_minutes: 30,
        items_completed: 2,
        docflemme_sessions: 1,
        ecos_simulations: 0
      },
      features: ['Tableaux simplifiés', 'DocFlemme basique', 'Support complet'],
      gradient: 'from-blue-400 to-cyan-400',
      icon: <Sparkles className="h-5 w-5" />,
      motivation: '🌱 Commence doucement, progresse sûrement',
      challenge_level: 1,
      estimated_success: 85
    },
    {
      id: 'reussite',
      name: 'Réussite Assurée',
      description: 'Rythme équilibré pour une préparation solide',
      targetRank: 'Top 2000 ECN',
      dailyGoals: {
        study_minutes: 60,
        items_completed: 4,
        docflemme_sessions: 2,
        ecos_simulations: 1
      },
      features: ['DocFlemme complet', 'ECOS chronométrés', 'Analytics détaillés'],
      gradient: 'from-green-500 to-emerald-500',
      icon: <Target className="h-5 w-5" />,
      motivation: '🎯 L\'équilibre parfait entre efficacité et bien-être',
      challenge_level: 3,
      estimated_success: 92
    },
    {
      id: 'excellence',
      name: 'Excellence Clinique',
      description: 'Vise l\'excellence avec un entraînement intensif',
      targetRank: 'Top 500 ECN',
      dailyGoals: {
        study_minutes: 90,
        items_completed: 6,
        docflemme_sessions: 3,
        ecos_simulations: 2
      },
      features: ['IA adaptative', 'Coaching personnalisé', 'Contenus exclusifs'],
      gradient: 'from-orange-500 to-red-500',
      icon: <Trophy className="h-5 w-5" />,
      motivation: '🚀 Pousse tes limites, deviens excellent',
      challenge_level: 4,
      estimated_success: 88
    },
    {
      id: 'legende',
      name: 'Légende Médicale',
      description: 'Pour les futurs leaders de la médecine',
      targetRank: 'Top 50 ECN',
      dailyGoals: {
        study_minutes: 120,
        items_completed: 8,
        docflemme_sessions: 4,
        ecos_simulations: 3
      },
      features: ['Mode expert', 'Défis avancés', 'Communauté élite'],
      gradient: 'from-purple-600 to-pink-600',
      icon: <Crown className="h-5 w-5" />,
      motivation: '👑 Rejoins l\'élite médicale française',
      challenge_level: 5,
      estimated_success: 75
    }
  ];

  const selectedAmbitionData = ambitionLevels.find(level => level.id === selectedAmbition) || ambitionLevels[1];

  // Animation de changement d'ambition
  const handleAmbitionChange = (newAmbition: string) => {
    setIsAnimating(true);
    setTimeout(() => {
      setSelectedAmbition(newAmbition);
      onAmbitionChange?.(newAmbition);
      setIsAnimating(false);
    }, 300);
  };

  // Simulation de progression en temps réel
  useEffect(() => {
    const interval = setInterval(() => {
      setProgressionData(prev => ({
        ...prev,
        next_milestone: {
          ...prev.next_milestone,
          progress: Math.min(100, prev.next_milestone.progress + Math.random() * 0.5)
        }
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const AmbitionCard = ({ ambition }: { ambition: AmbitionLevel }) => (
    <motion.div
      whileHover={{ scale: 1.02, rotateY: 2 }}
      whileTap={{ scale: 0.98 }}
      className="h-full"
    >
      <Card 
        className={`cursor-pointer transition-all duration-500 h-full border-2 ${
          selectedAmbition === ambition.id 
            ? 'border-white/60 bg-white/20 shadow-2xl scale-105' 
            : 'border-white/20 hover:border-white/40 bg-white/10'
        }`}
        onClick={() => handleAmbitionChange(ambition.id)}
      >
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3 mb-3">
            <motion.div 
              className={`p-3 rounded-xl bg-gradient-to-r ${ambition.gradient}`}
              animate={{ 
                rotate: selectedAmbition === ambition.id ? [0, 10, -10, 0] : 0,
                scale: selectedAmbition === ambition.id ? [1, 1.1, 1] : 1
              }}
              transition={{ duration: 2, repeat: selectedAmbition === ambition.id ? Infinity : 0 }}
            >
              {ambition.icon}
            </motion.div>
            <div className="flex-1">
              <CardTitle className="text-white text-lg">{ambition.name}</CardTitle>
              <Badge className={`bg-gradient-to-r ${ambition.gradient} text-white border-0`}>
                {ambition.targetRank}
              </Badge>
            </div>
            {selectedAmbition === ambition.id && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-green-400"
              >
                <CheckCircle className="h-5 w-5" />
              </motion.div>
            )}
          </div>
          
          <motion.div 
            className="text-sm bg-black/30 rounded-lg p-3 border border-white/20"
            animate={{ opacity: selectedAmbition === ambition.id ? [0.8, 1, 0.8] : 0.8 }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <p className="text-yellow-300 font-medium mb-2">{ambition.motivation}</p>
            <p className="text-gray-300">{ambition.description}</p>
          </motion.div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="space-y-4">
            {/* Objectifs quotidiens */}
            <div>
              <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-400" />
                Objectifs Quotidiens
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white/10 rounded p-2">
                  <div className="text-gray-400">Étude</div>
                  <div className="text-white font-bold">{ambition.dailyGoals.study_minutes}min</div>
                </div>
                <div className="bg-white/10 rounded p-2">
                  <div className="text-gray-400">Items</div>
                  <div className="text-white font-bold">{ambition.dailyGoals.items_completed}</div>
                </div>
                <div className="bg-white/10 rounded p-2">
                  <div className="text-gray-400">DocFlemme</div>
                  <div className="text-white font-bold">{ambition.dailyGoals.docflemme_sessions}</div>
                </div>
                <div className="bg-white/10 rounded p-2">
                  <div className="text-gray-400">ECOS</div>
                  <div className="text-white font-bold">{ambition.dailyGoals.ecos_simulations}</div>
                </div>
              </div>
            </div>

            {/* Niveau de défi */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-white">Niveau de défi</span>
                <span className="text-sm text-white font-bold">{ambition.challenge_level}/5</span>
              </div>
              <Progress value={ambition.challenge_level * 20} className="h-2" />
            </div>

            {/* Taux de réussite estimé */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-white">Taux de réussite</span>
                <span className="text-sm text-green-400 font-bold">{ambition.estimated_success}%</span>
              </div>
              <Progress value={ambition.estimated_success} className="h-2" />
            </div>

            {/* Fonctionnalités */}
            <div>
              <h4 className="text-white font-medium mb-2 text-sm">Fonctionnalités incluses</h4>
              <div className="space-y-1">
                {ambition.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs">
                    <CheckCircle className="h-3 w-3 text-green-400" />
                    <span className="text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const ProgressionDashboard = () => (
    <Card className="bg-gradient-to-br from-black/40 to-black/20 backdrop-blur-xl border border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <BarChart className="h-5 w-5 text-purple-400" />
          Tableau de Bord Personnalisé
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stats principales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/10 rounded-lg p-4 border border-white/20">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-yellow-400" />
              <span className="text-sm text-white">Série</span>
            </div>
            <div className="text-2xl font-bold text-white">{progressionData.streak_days}</div>
            <div className="text-xs text-gray-400">jours consécutifs</div>
          </div>

          <div className="bg-white/10 rounded-lg p-4 border border-white/20">
            <div className="flex items-center gap-2 mb-2">
              <Star className="h-4 w-4 text-purple-400" />
              <span className="text-sm text-white">Points</span>
            </div>
            <div className="text-2xl font-bold text-white">{progressionData.total_points.toLocaleString()}</div>
            <div className="text-xs text-green-400">+120 aujourd'hui</div>
          </div>

          <div className="bg-white/10 rounded-lg p-4 border border-white/20">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-white">Items</span>
            </div>
            <div className="text-2xl font-bold text-white">{progressionData.completed_items}</div>
            <div className="text-xs text-gray-400">/ {progressionData.total_items} total</div>
          </div>

          <div className="bg-white/10 rounded-lg p-4 border border-white/20">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-green-400" />
              <span className="text-sm text-white">Progression</span>
            </div>
            <div className="text-2xl font-bold text-white">{Math.round((progressionData.completed_items / progressionData.total_items) * 100)}%</div>
            <div className="text-xs text-green-400">+3% cette semaine</div>
          </div>
        </div>

        {/* Scores de maîtrise */}
        <div>
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Brain className="h-4 w-4 text-purple-400" />
            Scores de Maîtrise
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { key: 'rang_a', label: 'Rang A - Fondamental', color: 'from-green-500 to-emerald-500' },
              { key: 'rang_b', label: 'Rang B - Avancé', color: 'from-orange-500 to-red-500' },
              { key: 'clinical_reasoning', label: 'Raisonnement Clinique', color: 'from-blue-500 to-purple-500' },
              { key: 'memorization', label: 'Mémorisation DocFlemme', color: 'from-pink-500 to-violet-500' }
            ].map(({ key, label, color }) => (
              <div key={key} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-white">{label}</span>
                  <span className="text-sm font-bold text-white">
                    {progressionData.mastery_scores[key as keyof typeof progressionData.mastery_scores]}%
                  </span>
                </div>
                <Progress 
                  value={progressionData.mastery_scores[key as keyof typeof progressionData.mastery_scores]} 
                  className={`h-2 bg-gradient-to-r ${color}`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Prochain jalon */}
        <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-lg p-4 border border-purple-400/30">
          <div className="flex items-center gap-3 mb-3">
            <Medal className="h-5 w-5 text-yellow-400" />
            <div>
              <h3 className="text-white font-semibold">{progressionData.next_milestone.name}</h3>
              <p className="text-sm text-gray-300">{progressionData.next_milestone.reward}</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-white">Progression</span>
              <span className="text-sm font-bold text-white">
                {Math.round(progressionData.next_milestone.progress)}%
              </span>
            </div>
            <Progress value={progressionData.next_milestone.progress} className="h-3" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Header */}
      <div className="text-center space-y-4">
        <motion.h1 
          className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          Progression Personnalisée MED-MNG
        </motion.h1>
        <p className="text-xl text-white/90">
          Adapte ton parcours selon ton ambition. Le <span className="font-bold text-yellow-300">Neuro Learning Generator</span> s'ajuste à tes objectifs.
        </p>
        <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold text-lg px-6 py-2">
          IA ADAPTATIVE RÉVOLUTIONNAIRE
        </Badge>
      </div>

      {/* Sélection d'ambition */}
      <div className="space-y-6">
        <motion.h2 
          className="text-2xl font-bold text-white text-center mb-6"
          animate={{ opacity: isAnimating ? 0.5 : 1 }}
        >
          Choisis ton niveau d'ambition
        </motion.h2>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedAmbition}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {ambitionLevels.map((ambition) => (
              <AmbitionCard key={ambition.id} ambition={ambition} />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Tableau de bord */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <ProgressionDashboard />
      </motion.div>

      {/* Actions rapides */}
      <Card className="bg-white/10 backdrop-blur-xl border border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Rocket className="h-5 w-5 text-orange-400" />
            Actions Recommandées - {selectedAmbitionData.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { 
                action: 'Réviser Rang A', 
                time: '15 min', 
                points: '+50 pts',
                gradient: 'from-green-500 to-emerald-500',
                icon: <Target className="h-4 w-4" />
              },
              { 
                action: 'Session DocFlemme', 
                time: '20 min', 
                points: '+75 pts',
                gradient: 'from-purple-500 to-pink-500',
                icon: <Brain className="h-4 w-4" />
              },
              { 
                action: 'ECOS Simulation', 
                time: '8 min', 
                points: '+100 pts',
                gradient: 'from-blue-500 to-cyan-500',
                icon: <Clock className="h-4 w-4" />
              },
              { 
                action: 'Défi Hebdomadaire', 
                time: '30 min', 
                points: '+200 pts',
                gradient: 'from-orange-500 to-red-500',
                icon: <Trophy className="h-4 w-4" />
              }
            ].map((item, index) => (
              <motion.div
                key={item.action}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size="lg"
                  className={`w-full h-20 p-4 bg-gradient-to-r ${item.gradient} text-white border-0 shadow-lg`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center gap-2">
                      {item.icon}
                      <span className="font-semibold">{item.action}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span>{item.time}</span>
                      <span className="font-bold">{item.points}</span>
                    </div>
                  </div>
                </Button>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};