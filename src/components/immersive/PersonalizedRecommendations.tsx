import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Target, 
  TrendingUp, 
  Star, 
  BookOpen, 
  Music, 
  Users, 
  Zap,
  Play,
  Clock,
  Trophy,
  Lightbulb,
  ChevronRight
} from 'lucide-react';

interface Recommendation {
  id: string;
  type: 'study' | 'practice' | 'review' | 'music' | 'social';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  progress?: number;
  timeEstimate: string;
  icon: React.ComponentType<any>;
  action: string;
  color: string;
  benefits: string[];
  isPersonalized: boolean;
}

const generatePersonalizedRecommendations = (): Recommendation[] => {
  const baseRecommendations: Recommendation[] = [
    {
      id: '1',
      type: 'study',
      title: 'Réviser Cardiologie IC-230',
      description: 'Basé sur vos performances récentes, une révision s\'impose',
      priority: 'high',
      progress: 45,
      timeEstimate: '25 min',
      icon: BookOpen,
      action: '/edn/IC-230',
      color: 'from-red-500 to-pink-600',
      benefits: ['Améliore tes scores', 'Points faibles identifiés'],
      isPersonalized: true
    },
    {
      id: '2',
      type: 'music',
      title: 'Créer mnémotechnique Neurologie',
      description: 'Transforme tes difficultés en neurologie en musique mémorable',
      priority: 'high',
      timeEstimate: '15 min',
      icon: Music,
      action: '/generator',
      color: 'from-purple-500 to-indigo-600',
      benefits: ['Mémorisation x3 plus rapide', 'Méthode scientifiquement prouvée'],
      isPersonalized: true
    },
    {
      id: '3',
      type: 'practice',
      title: 'Simulation ECOS Urgences',
      description: 'Entraîne-toi sur des cas cliniques d\'urgence',
      priority: 'medium',
      progress: 70,
      timeEstimate: '45 min',
      icon: Target,
      action: '/ecos',
      color: 'from-orange-500 to-red-600',
      benefits: ['Préparation optimale', 'Confiance renforcée'],
      isPersonalized: false
    },
    {
      id: '4',
      type: 'social',
      title: 'Rejoindre Groupe Cardiologie',
      description: 'Connecte-toi avec 247 étudiants passionnés de cardiologie',
      priority: 'low',
      timeEstimate: '5 min',
      icon: Users,
      action: '/med-mng/community',
      color: 'from-blue-500 to-cyan-600',
      benefits: ['Entraide communautaire', 'Partage d\'expériences'],
      isPersonalized: true
    },
    {
      id: '5',
      type: 'review',
      title: 'Quiz Personnalisé IA',
      description: 'Questions adaptées à ton niveau et tes objectifs',
      priority: 'medium',
      timeEstimate: '20 min',
      icon: Brain,
      action: '/chat',
      color: 'from-green-500 to-emerald-600',
      benefits: ['IA adaptative', 'Progression optimisée'],
      isPersonalized: true
    }
  ];

  return baseRecommendations;
};

export const PersonalizedRecommendations: React.FC = () => {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setRecommendations(generatePersonalizedRecommendations());
  }, [refreshKey]);

  const handleRecommendationClick = (recommendation: Recommendation) => {
    navigate(recommendation.action);
  };

  const refreshRecommendations = () => {
    setRefreshKey(prev => prev + 1);
  };

  const filteredRecommendations = selectedType === 'all' 
    ? recommendations 
    : recommendations.filter(rec => rec.type === selectedType);

  const typeFilters = [
    { key: 'all', label: 'Toutes', icon: Star },
    { key: 'study', label: 'Études', icon: BookOpen },
    { key: 'music', label: 'Musique', icon: Music },
    { key: 'practice', label: 'Pratique', icon: Target },
    { key: 'social', label: 'Social', icon: Users }
  ];

  return (
    <Card className="bg-gradient-to-br from-black/90 to-gray-900/90 backdrop-blur-xl border-white/10 text-white overflow-hidden">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Recommandations Personnalisées</h2>
              <p className="text-white/60 text-sm">IA adaptée à ton profil d'apprentissage</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-blue-500/20 border-blue-500/40 text-blue-400">
              <Zap className="w-3 h-3 mr-1" />
              IA Personnalisée
            </Badge>
            <Button 
              size="sm" 
              variant="ghost"
              onClick={refreshRecommendations}
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              Actualiser
            </Button>
          </div>
        </div>

        {/* Type Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {typeFilters.map((filter) => {
            const isSelected = selectedType === filter.key;
            const FilterIcon = filter.icon;
            
            return (
              <Button
                key={filter.key}
                variant={isSelected ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setSelectedType(filter.key)}
                className={`${isSelected 
                  ? 'bg-white/20 text-white' 
                  : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <FilterIcon className="w-4 h-4 mr-2" />
                {filter.label}
              </Button>
            );
          })}
        </div>

        {/* Recommendations */}
        <div className="space-y-4">
          <AnimatePresence mode="wait">
            {filteredRecommendations.map((recommendation, index) => {
              const IconComponent = recommendation.icon;
              const priorityColors = {
                high: 'border-red-400/40 bg-red-500/10',
                medium: 'border-yellow-400/40 bg-yellow-500/10',
                low: 'border-blue-400/40 bg-blue-500/10'
              };
              
              return (
                <motion.div
                  key={recommendation.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card 
                    className={`p-4 cursor-pointer transition-all duration-300 hover:border-white/30 ${
                      priorityColors[recommendation.priority]
                    } border backdrop-blur-sm`}
                    onClick={() => handleRecommendationClick(recommendation)}
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className={`p-2 rounded-lg bg-gradient-to-r ${recommendation.color} flex-shrink-0`}>
                        <IconComponent className="w-5 h-5 text-white" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-white truncate">
                                {recommendation.title}
                              </h3>
                              {recommendation.isPersonalized && (
                                <Badge className="bg-purple-500/20 border-purple-500/40 text-purple-400 text-xs">
                                  <Zap className="w-2 h-2 mr-1" />
                                  Perso
                                </Badge>
                              )}
                            </div>
                            <p className="text-white/70 text-sm line-clamp-2">
                              {recommendation.description}
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-1 text-xs text-white/60 ml-4">
                            <Clock className="w-3 h-3" />
                            {recommendation.timeEstimate}
                          </div>
                        </div>

                        {/* Progress */}
                        {recommendation.progress && (
                          <div className="mb-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-white/60">Progression</span>
                              <span className="text-xs text-white/80">{recommendation.progress}%</span>
                            </div>
                            <Progress value={recommendation.progress} className="h-1" />
                          </div>
                        )}

                        {/* Benefits */}
                        <div className="flex flex-wrap gap-1 mb-3">
                          {recommendation.benefits.map((benefit, idx) => (
                            <Badge 
                              key={idx}
                              variant="outline" 
                              className="text-xs bg-white/5 border-white/20 text-white/70"
                            >
                              {benefit}
                            </Badge>
                          ))}
                        </div>

                        {/* Action Button */}
                        <Button 
                          size="sm" 
                          className="w-full bg-white/10 hover:bg-white/20 text-white border-0"
                        >
                          <Play className="w-3 h-3 mr-2" />
                          Commencer
                          <ChevronRight className="w-3 h-3 ml-auto" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Stats Footer */}
        <div className="mt-6 pt-4 border-t border-white/10">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-green-400">92%</div>
              <div className="text-xs text-white/60">Précision IA</div>
            </div>
            <div>
              <div className="text-lg font-bold text-blue-400">
                {recommendations.filter(r => r.isPersonalized).length}
              </div>
              <div className="text-xs text-white/60">Personnalisées</div>
            </div>
            <div>
              <div className="text-lg font-bold text-purple-400">24h</div>
              <div className="text-xs text-white/60">Mis à jour</div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};