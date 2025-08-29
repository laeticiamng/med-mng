import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  Clock, 
  Target, 
  Brain, 
  Trophy, 
  Zap,
  Eye,
  BarChart3,
  Flame,
  Heart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProgressData {
  sectionTimes: Record<string, number>;
  completionRates: Record<string, number>;
  engagementScore: number;
  learningVelocity: number;
  retentionScore: number;
  currentStreak: number;
  totalXP: number;
  achievements: Achievement[];
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: Date;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface ProgressAnalyticsProps {
  itemCode: string;
  currentSection: string;
  completedSections: Set<string>;
}

export const ProgressAnalytics: React.FC<ProgressAnalyticsProps> = ({
  itemCode,
  currentSection,
  completedSections
}) => {
  const [progressData, setProgressData] = useState<ProgressData>({
    sectionTimes: {},
    completionRates: {},
    engagementScore: 85,
    learningVelocity: 1.2,
    retentionScore: 78,
    currentStreak: 5,
    totalXP: 2480,
    achievements: []
  });

  const [showDetailedAnalytics, setShowDetailedAnalytics] = useState(false);
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);

  useEffect(() => {
    // Simuler la récupération des données d'analytics
    const mockData: ProgressData = {
      sectionTimes: {
        'tableau-a': 8.5,
        'tableau-b': 12.3,
        'scene': 15.2,
        'bd': 6.8,
        'music': 9.4,
        'quiz': 11.7
      },
      completionRates: {
        'tableau-a': 95,
        'tableau-b': 87,
        'scene': 92,
        'bd': 88,
        'music': 91,
        'quiz': 85
      },
      engagementScore: 85 + Math.random() * 10,
      learningVelocity: 1.0 + Math.random() * 0.5,
      retentionScore: 75 + Math.random() * 20,
      currentStreak: 3 + Math.floor(Math.random() * 5),
      totalXP: 2000 + Math.floor(Math.random() * 1000),
      achievements: [
        {
          id: '1',
          title: 'Explorer Débutant',
          description: 'Première section complétée',
          icon: '🌟',
          unlockedAt: new Date(),
          rarity: 'common'
        },
        {
          id: '2',
          title: 'Maître des Tableaux',
          description: 'Rang A et B maîtrisés',
          icon: '📚',
          unlockedAt: new Date(),
          rarity: 'rare'
        }
      ]
    };
    
    setProgressData(mockData);
  }, [itemCode, completedSections]);

  const getRarityColor = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common': return 'text-gray-600 bg-gray-100';
      case 'rare': return 'text-blue-600 bg-blue-100';
      case 'epic': return 'text-purple-600 bg-purple-100';
      case 'legendary': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getEngagementLevel = (score: number) => {
    if (score >= 90) return { level: 'Excellent', color: 'text-green-600', icon: '🔥' };
    if (score >= 75) return { level: 'Très Bon', color: 'text-blue-600', icon: '⚡' };
    if (score >= 60) return { level: 'Bon', color: 'text-yellow-600', icon: '👍' };
    return { level: 'À Améliorer', color: 'text-red-600', icon: '📈' };
  };

  const engagement = getEngagementLevel(progressData.engagementScore);

  const StatCard = ({ icon: Icon, title, value, description, color = "text-blue-600" }: {
    icon: React.ElementType;
    title: string;
    value: string | number;
    description: string;
    color?: string;
  }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-lg p-4 shadow-sm border border-gray-200"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 rounded-lg bg-opacity-10 ${color.replace('text-', 'bg-').replace('-600', '-100')}`}>
          <Icon className={`h-5 w-5 ${color}`} />
        </div>
        <div>
          <h4 className="font-semibold text-gray-900">{title}</h4>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
      <p className="text-sm text-gray-600">{description}</p>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      {/* Vue d'ensemble */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            Analytics de Progression - {itemCode}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatCard
              icon={Trophy}
              title="XP Total"
              value={progressData.totalXP.toLocaleString()}
              description="Points d'expérience"
              color="text-yellow-600"
            />
            
            <StatCard
              icon={Flame}
              title="Série Actuelle"
              value={`${progressData.currentStreak} jours`}
              description="Jours consécutifs"
              color="text-orange-600"
            />
            
            <StatCard
              icon={Zap}
              title="Vélocité"
              value={`${progressData.learningVelocity.toFixed(1)}x`}
              description="Vitesse d'apprentissage"
              color="text-purple-600"
            />
            
            <StatCard
              icon={Brain}
              title="Rétention"
              value={`${Math.round(progressData.retentionScore)}%`}
              description="Score de mémorisation"
              color="text-green-600"
            />
          </div>

          {/* Score d'engagement */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-3xl">{engagement.icon}</div>
                <div>
                  <h3 className="font-semibold text-gray-900">Niveau d'Engagement</h3>
                  <p className={`text-lg font-bold ${engagement.color}`}>{engagement.level}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900">
                  {Math.round(progressData.engagementScore)}
                </div>
                <div className="text-sm text-gray-600">/ 100</div>
              </div>
            </div>
            
            <Progress 
              value={progressData.engagementScore} 
              className="h-3 mb-2"
            />
            <p className="text-sm text-gray-600">
              Basé sur votre interaction avec le contenu, temps passé et performance
            </p>
          </div>

          {/* Bouton pour afficher plus de détails */}
          <Button
            variant="outline"
            onClick={() => setShowDetailedAnalytics(!showDetailedAnalytics)}
            className="w-full"
          >
            <Eye className="h-4 w-4 mr-2" />
            {showDetailedAnalytics ? 'Masquer' : 'Afficher'} les détails
          </Button>
        </CardContent>
      </Card>

      {/* Analytics détaillées */}
      <AnimatePresence>
        {showDetailedAnalytics && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-green-600" />
                  Temps par Section
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(progressData.sectionTimes).map(([section, time]) => {
                    const completion = progressData.completionRates[section] || 0;
                    const sectionNames: Record<string, string> = {
                      'tableau-a': 'Compétences Rang A',
                      'tableau-b': 'Compétences Rang B', 
                      'scene': 'Scène Immersive',
                      'bd': 'Bande Dessinée',
                      'music': 'Génération Musicale',
                      'quiz': 'Quiz Interactif'
                    };

                    return (
                      <div key={section} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          <span className="font-medium">{sectionNames[section]}</span>
                          {currentSection === section && (
                            <Badge variant="secondary" className="text-xs">Actuel</Badge>
                          )}
                          {completedSections.has(section) && (
                            <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                              Complété
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-sm font-semibold">{time.toFixed(1)} min</div>
                            <div className="text-xs text-gray-500">{completion}% maîtrisé</div>
                          </div>
                          <div className="w-20">
                            <Progress value={completion} className="h-2" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Achievements récents */}
      {progressData.achievements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-600" />
              Succès Débloqués
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {progressData.achievements.map((achievement) => (
                <motion.div
                  key={achievement.id}
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex items-center gap-4 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200"
                >
                  <div className="text-2xl">{achievement.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900">{achievement.title}</h4>
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${getRarityColor(achievement.rarity)}`}
                      >
                        {achievement.rarity}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{achievement.description}</p>
                  </div>
                  <div className="text-xs text-gray-500">
                    {achievement.unlockedAt.toLocaleDateString()}
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notification de nouveau succès */}
      <AnimatePresence>
        {newAchievement && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.8 }}
            className="fixed bottom-4 right-4 z-50"
          >
            <Card className="w-80 bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-2xl">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{newAchievement.icon}</div>
                  <div>
                    <h4 className="font-bold">Nouveau Succès !</h4>
                    <p className="text-sm opacity-90">{newAchievement.title}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};