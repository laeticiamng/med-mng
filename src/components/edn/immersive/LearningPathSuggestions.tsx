import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Route, 
  ArrowRight, 
  Clock, 
  Target, 
  Brain, 
  Star,
  TrendingUp,
  BookOpen,
  Music,
  Gamepad2,
  Eye,
  ImageIcon,
  ChevronRight,
  Lightbulb,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LearningPath {
  id: string;
  name: string;
  description: string;
  estimatedTime: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  sections: PathSection[];
  benefits: string[];
  icon: React.ElementType;
  color: string;
  recommended: boolean;
}

interface PathSection {
  id: string;
  name: string;
  type: 'tableau-a' | 'tableau-b' | 'scene' | 'bd' | 'music' | 'quiz';
  duration: number;
  description: string;
  icon: React.ElementType;
}

interface UserProgress {
  completedSections: Set<string>;
  timeSpent: Record<string, number>;
  performanceScores: Record<string, number>;
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
  preferredPace: 'slow' | 'normal' | 'fast';
}

interface LearningPathSuggestionsProps {
  itemCode: string;
  currentSection: string;
  userProgress: UserProgress;
  onPathSelect: (path: LearningPath) => void;
  onSectionNavigate: (sectionId: string) => void;
}

export const LearningPathSuggestions: React.FC<LearningPathSuggestionsProps> = ({
  itemCode,
  currentSection,
  userProgress,
  onPathSelect,
  onSectionNavigate
}) => {
  const [suggestedPaths, setSuggestedPaths] = useState<LearningPath[]>([]);
  const [selectedPath, setSelectedPath] = useState<LearningPath | null>(null);
  const [showPathDetails, setShowPathDetails] = useState(false);

  // Définition des parcours d'apprentissage
  const learningPaths: LearningPath[] = [
    {
      id: 'comprehensive',
      name: 'Parcours Complet',
      description: 'Une approche méthodique couvrant tous les aspects de l\'item',
      estimatedTime: 45,
      difficulty: 'intermediate',
      sections: [
        { id: 'tableau-a', name: 'Bases théoriques', type: 'tableau-a', duration: 8, description: 'Maîtrise des concepts fondamentaux', icon: BookOpen },
        { id: 'scene', name: 'Mise en pratique', type: 'scene', duration: 12, description: 'Application dans un contexte réel', icon: Eye },
        { id: 'tableau-b', name: 'Approfondissement', type: 'tableau-b', duration: 10, description: 'Concepts avancés et spécialisés', icon: Target },
        { id: 'quiz', name: 'Évaluation', type: 'quiz', duration: 8, description: 'Test de connaissances', icon: Gamepad2 },
        { id: 'music', name: 'Mémorisation', type: 'music', duration: 7, description: 'Renforcement par la musique', icon: Music }
      ],
      benefits: ['Apprentissage structuré', 'Couverture complète', 'Progression logique'],
      icon: Route,
      color: 'text-blue-600',
      recommended: true
    },
    {
      id: 'visual-focused',
      name: 'Parcours Visuel',
      description: 'Optimisé pour les apprenants visuels avec BD et scènes immersives',
      estimatedTime: 35,
      difficulty: 'beginner',
      sections: [
        { id: 'bd', name: 'Découverte narrative', type: 'bd', duration: 10, description: 'Introduction par la bande dessinée', icon: ImageIcon },
        { id: 'scene', name: 'Immersion visuelle', type: 'scene', duration: 15, description: 'Exploration interactive', icon: Eye },
        { id: 'tableau-a', name: 'Synthèse visuelle', type: 'tableau-a', duration: 6, description: 'Concepts sous forme de tableaux', icon: BookOpen },
        { id: 'quiz', name: 'Validation', type: 'quiz', duration: 4, description: 'Quiz avec supports visuels', icon: Gamepad2 }
      ],
      benefits: ['Apprentissage intuitif', 'Mémorisation visuelle', 'Engagement élevé'],
      icon: Eye,
      color: 'text-green-600',
      recommended: userProgress.learningStyle === 'visual'
    },
    {
      id: 'rapid-review',
      name: 'Révision Rapide',
      description: 'Parcours accéléré pour réviser efficacement',
      estimatedTime: 20,
      difficulty: 'advanced',
      sections: [
        { id: 'tableau-a', name: 'Révision essentielle', type: 'tableau-a', duration: 5, description: 'Points clés uniquement', icon: BookOpen },
        { id: 'music', name: 'Mémorisation express', type: 'music', duration: 8, description: 'Paroles pour retenir', icon: Music },
        { id: 'quiz', name: 'Test final', type: 'quiz', duration: 7, description: 'Évaluation de la rétention', icon: Gamepad2 }
      ],
      benefits: ['Gain de temps', 'Révision ciblée', 'Évaluation rapide'],
      icon: Zap,
      color: 'text-yellow-600',
      recommended: userProgress.preferredPace === 'fast'
    },
    {
      id: 'interactive-immersive',
      name: 'Parcours Immersif',
      description: 'Maximum d\'interactivité avec scènes et quiz gamifiés',
      estimatedTime: 40,
      difficulty: 'intermediate',
      sections: [
        { id: 'scene', name: 'Plongée immersive', type: 'scene', duration: 18, description: 'Expérience interactive complète', icon: Eye },
        { id: 'quiz', name: 'Défis gamifiés', type: 'quiz', duration: 12, description: 'Quiz interactifs avancés', icon: Gamepad2 },
        { id: 'tableau-a', name: 'Consolidation', type: 'tableau-a', duration: 6, description: 'Synthèse des acquis', icon: BookOpen },
        { id: 'music', name: 'Ancrage musical', type: 'music', duration: 4, description: 'Mémorisation musicale', icon: Music }
      ],
      benefits: ['Engagement maximal', 'Apprentissage actif', 'Rétention optimale'],
      icon: Brain,
      color: 'text-purple-600',
      recommended: userProgress.learningStyle === 'kinesthetic'
    }
  ];

  // Calcul des suggestions personnalisées
  useEffect(() => {
    const personalizedPaths = learningPaths.map(path => {
      let score = 0;
      
      // Bonus si recommandé pour le style d'apprentissage
      if (path.recommended) score += 10;
      
      // Ajustement selon les sections déjà complétées
      const completedSectionsInPath = path.sections.filter(section => 
        userProgress.completedSections.has(section.type)
      ).length;
      const progressBonus = (completedSectionsInPath / path.sections.length) * 5;
      score += progressBonus;
      
      // Ajustement selon les performances passées
      const avgPerformance = Object.values(userProgress.performanceScores).reduce((a, b) => a + b, 0) / 
        Object.values(userProgress.performanceScores).length || 0;
      
      if (avgPerformance > 80 && path.difficulty === 'advanced') score += 5;
      if (avgPerformance < 60 && path.difficulty === 'beginner') score += 5;
      
      return { ...path, score };
    });

    // Trier par score et prendre les 3 meilleurs
    const sortedPaths = personalizedPaths.sort((a, b) => b.score - a.score).slice(0, 3);
    setSuggestedPaths(sortedPaths);
  }, [userProgress]);

  const getSectionIcon = (sectionType: string) => {
    const icons = {
      'tableau-a': BookOpen,
      'tableau-b': Target,
      'scene': Eye,
      'bd': ImageIcon,
      'music': Music,
      'quiz': Gamepad2
    };
    return icons[sectionType as keyof typeof icons] || BookOpen;
  };

  const getDifficultyColor = (difficulty: LearningPath['difficulty']) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-100';
      case 'intermediate': return 'text-blue-600 bg-blue-100';
      case 'advanced': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const PathCard = ({ path }: { path: LearningPath }) => {
    const completedSections = path.sections.filter(section => 
      userProgress.completedSections.has(section.type)
    ).length;
    const progressPercentage = (completedSections / path.sections.length) * 100;

    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="relative"
      >
        <Card className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
          path.recommended ? 'ring-2 ring-blue-200 bg-blue-50/30' : ''
        }`}>
          {path.recommended && (
            <div className="absolute -top-2 -right-2 z-10">
              <Badge className="bg-yellow-500 text-white text-xs px-2 py-1">
                <Star className="h-3 w-3 mr-1" />
                Recommandé
              </Badge>
            </div>
          )}
          
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-opacity-10 ${path.color.replace('text-', 'bg-').replace('-600', '-100')}`}>
                  <path.icon className={`h-5 w-5 ${path.color}`} />
                </div>
                <div>
                  <CardTitle className="text-lg">{path.name}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className={getDifficultyColor(path.difficulty)}>
                      {path.difficulty}
                    </Badge>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Clock className="h-3 w-3" />
                      {path.estimatedTime}min
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-2">{path.description}</p>
          </CardHeader>
          
          <CardContent className="pt-0">
            {/* Progression */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-1">
                <span>Progression</span>
                <span>{completedSections}/{path.sections.length} complétés</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>

            {/* Sections du parcours */}
            <div className="space-y-2 mb-4">
              {path.sections.slice(0, 3).map((section, index) => {
                const SectionIcon = getSectionIcon(section.type);
                const isCompleted = userProgress.completedSections.has(section.type);
                const isCurrent = currentSection === section.type;
                
                return (
                  <div key={section.id} className="flex items-center gap-2 text-sm">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      isCompleted ? 'bg-green-100 text-green-600' :
                      isCurrent ? 'bg-blue-100 text-blue-600' :
                      'bg-gray-100 text-gray-400'
                    }`}>
                      {isCompleted ? '✓' : index + 1}
                    </div>
                    <SectionIcon className="h-4 w-4 text-gray-400" />
                    <span className={`flex-1 ${isCurrent ? 'font-medium text-blue-600' : 'text-gray-600'}`}>
                      {section.name}
                    </span>
                    <span className="text-gray-400">{section.duration}min</span>
                  </div>
                );
              })}
              
              {path.sections.length > 3 && (
                <div className="text-xs text-gray-500 pl-8">
                  +{path.sections.length - 3} autres sections...
                </div>
              )}
            </div>

            {/* Bénéfices */}
            <div className="flex flex-wrap gap-1 mb-4">
              {path.benefits.slice(0, 3).map(benefit => (
                <Badge key={benefit} variant="outline" className="text-xs">
                  {benefit}
                </Badge>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                size="sm"
                className="flex-1"
                onClick={() => {
                  setSelectedPath(path);
                  onPathSelect(path);
                }}
              >
                Commencer
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSelectedPath(path);
                  setShowPathDetails(true);
                }}
              >
                Détails
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Route className="h-5 w-5 text-blue-600" />
            Parcours d'Apprentissage Suggérés
          </CardTitle>
          <p className="text-sm text-gray-600">
            Parcours personnalisés basés sur votre style d'apprentissage et vos performances
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {suggestedPaths.map(path => (
              <PathCard key={path.id} path={path} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modal des détails du parcours */}
      <AnimatePresence>
        {showPathDetails && selectedPath && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowPathDetails(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <selectedPath.icon className={`h-6 w-6 ${selectedPath.color}`} />
                        {selectedPath.name}
                      </CardTitle>
                      <p className="text-gray-600 mt-1">{selectedPath.description}</p>
                    </div>
                    <Button variant="ghost" onClick={() => setShowPathDetails(false)}>
                      ✕
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-6">
                    {/* Informations générales */}
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <Clock className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                        <div className="font-semibold">{selectedPath.estimatedTime} min</div>
                        <div className="text-sm text-gray-600">Durée estimée</div>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg">
                        <Target className="h-6 w-6 text-green-600 mx-auto mb-2" />
                        <div className="font-semibold">{selectedPath.sections.length}</div>
                        <div className="text-sm text-gray-600">Sections</div>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <TrendingUp className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                        <div className="font-semibold capitalize">{selectedPath.difficulty}</div>
                        <div className="text-sm text-gray-600">Niveau</div>
                      </div>
                    </div>

                    {/* Sections détaillées */}
                    <div>
                      <h4 className="font-semibold mb-3">Plan du parcours</h4>
                      <div className="space-y-3">
                        {selectedPath.sections.map((section, index) => {
                          const SectionIcon = getSectionIcon(section.type);
                          const isCompleted = userProgress.completedSections.has(section.type);
                          const isCurrent = currentSection === section.type;
                          
                          return (
                            <div
                              key={section.id}
                              className={`p-4 rounded-lg border-2 transition-colors ${
                                isCompleted ? 'bg-green-50 border-green-200' :
                                isCurrent ? 'bg-blue-50 border-blue-200' :
                                'bg-gray-50 border-gray-200'
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                                  isCompleted ? 'bg-green-500 text-white' :
                                  isCurrent ? 'bg-blue-500 text-white' :
                                  'bg-gray-300 text-gray-600'
                                }`}>
                                  {isCompleted ? '✓' : index + 1}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <SectionIcon className="h-4 w-4" />
                                    <h5 className="font-medium">{section.name}</h5>
                                    <Badge variant="outline" className="text-xs">
                                      {section.duration} min
                                    </Badge>
                                    {isCurrent && (
                                      <Badge variant="default" className="text-xs">
                                        En cours
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-600">{section.description}</p>
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    onSectionNavigate(section.type);
                                    setShowPathDetails(false);
                                  }}
                                  disabled={isCompleted}
                                >
                                  {isCompleted ? 'Terminé' : 'Aller'}
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Bénéfices */}
                    <div>
                      <h4 className="font-semibold mb-3">Bénéfices de ce parcours</h4>
                      <div className="grid gap-2">
                        {selectedPath.benefits.map(benefit => (
                          <div key={benefit} className="flex items-center gap-2">
                            <Lightbulb className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm">{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        className="flex-1"
                        onClick={() => {
                          onPathSelect(selectedPath);
                          setShowPathDetails(false);
                        }}
                      >
                        Commencer ce parcours
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowPathDetails(false)}
                      >
                        Fermer
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};