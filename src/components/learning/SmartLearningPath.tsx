import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, Clock, Target, Trophy, Star, ChevronRight, 
  Brain, CheckCircle, AlertCircle, TrendingUp, Zap
} from 'lucide-react';

interface LearningModule {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number;
  completed: boolean;
  progress: number;
  prerequisites?: string[];
  skills: string[];
  type: 'theory' | 'practice' | 'assessment';
}

interface LearningPath {
  id: string;
  name: string;
  description: string;
  totalModules: number;
  completedModules: number;
  estimatedDuration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  modules: LearningModule[];
  skills: string[];
}

export const SmartLearningPath: React.FC = () => {
  const [selectedPath, setSelectedPath] = useState<LearningPath | null>(null);
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);

  useEffect(() => {
    // Simulation de données de parcours d'apprentissage
    const mockPaths: LearningPath[] = [
      {
        id: 'cardiology-fundamentals',
        name: 'Fondamentaux de Cardiologie',
        description: 'Parcours complet pour maîtriser les bases de la cardiologie moderne',
        totalModules: 12,
        completedModules: 8,
        estimatedDuration: 480, // minutes
        difficulty: 'intermediate',
        skills: ['Diagnostic', 'ECG', 'Thérapeutique', 'Urgences'],
        modules: [
          {
            id: 'anatomy-heart',
            title: 'Anatomie du Cœur',
            description: 'Structure et fonction cardiaque',
            difficulty: 'beginner',
            estimatedTime: 45,
            completed: true,
            progress: 100,
            skills: ['Anatomie', 'Physiologie'],
            type: 'theory'
          },
          {
            id: 'ecg-basics',
            title: 'ECG - Principes de Base',
            description: 'Lecture et interprétation des ECG',
            difficulty: 'intermediate',
            estimatedTime: 60,
            completed: true,
            progress: 100,
            prerequisites: ['anatomy-heart'],
            skills: ['ECG', 'Diagnostic'],
            type: 'practice'
          },
          {
            id: 'heart-failure',
            title: 'Insuffisance Cardiaque',
            description: 'Diagnostic et prise en charge',
            difficulty: 'intermediate',
            estimatedTime: 75,
            completed: false,
            progress: 65,
            prerequisites: ['ecg-basics'],
            skills: ['Diagnostic', 'Thérapeutique'],
            type: 'theory'
          }
        ]
      },
      {
        id: 'emergency-medicine',
        name: 'Médecine d\'Urgence',
        description: 'Gestion des situations d\'urgence en médecine',
        totalModules: 8,
        completedModules: 3,
        estimatedDuration: 360,
        difficulty: 'advanced',
        skills: ['Urgences', 'Réanimation', 'Triage', 'Gestes techniques'],
        modules: [
          {
            id: 'trauma-assessment',
            title: 'Évaluation du Traumatisme',
            description: 'Approche systématique du patient traumatisé',
            difficulty: 'advanced',
            estimatedTime: 90,
            completed: true,
            progress: 100,
            skills: ['Trauma', 'Évaluation'],
            type: 'practice'
          }
        ]
      }
    ];
    
    setLearningPaths(mockPaths);
    setSelectedPath(mockPaths[0]);
  }, []);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'intermediate': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'advanced': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'theory': return BookOpen;
      case 'practice': return Target;
      case 'assessment': return Trophy;
      default: return BookOpen;
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}min`;
    }
    return `${mins}min`;
  };

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Parcours d'Apprentissage Intelligent
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Suivez des parcours personnalisés adaptés à votre niveau et vos objectifs
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Liste des parcours */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-lg font-semibold mb-4">Parcours Disponibles</h2>
          {learningPaths.map((path) => (
            <motion.div
              key={path.id}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <Card 
                className={`cursor-pointer transition-all duration-300 ${
                  selectedPath?.id === path.id ? 'border-primary shadow-lg' : 'hover:shadow-md'
                }`}
                onClick={() => setSelectedPath(path)}
              >
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <h3 className="font-medium text-sm">{path.name}</h3>
                      <Badge className={getDifficultyColor(path.difficulty)}>
                        {path.difficulty}
                      </Badge>
                    </div>
                    
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {path.description}
                    </p>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Progression</span>
                        <span>{Math.round((path.completedModules / path.totalModules) * 100)}%</span>
                      </div>
                      <Progress 
                        value={(path.completedModules / path.totalModules) * 100} 
                        className="h-2"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        {path.totalModules} modules
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(path.estimatedDuration)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Détail du parcours sélectionné */}
        <div className="lg:col-span-3">
          {selectedPath && (
            <div className="space-y-6">
              {/* En-tête du parcours */}
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="text-2xl">{selectedPath.name}</CardTitle>
                      <p className="text-muted-foreground">{selectedPath.description}</p>
                    </div>
                    <Badge className={getDifficultyColor(selectedPath.difficulty)}>
                      {selectedPath.difficulty}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {selectedPath.completedModules}
                      </div>
                      <div className="text-sm text-muted-foreground">Modules complétés</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-500">
                        {selectedPath.totalModules}
                      </div>
                      <div className="text-sm text-muted-foreground">Total modules</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-500">
                        {formatTime(selectedPath.estimatedDuration)}
                      </div>
                      <div className="text-sm text-muted-foreground">Durée estimée</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-500">
                        {Math.round((selectedPath.completedModules / selectedPath.totalModules) * 100)}%
                      </div>
                      <div className="text-sm text-muted-foreground">Progression</div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="font-medium mb-3">Compétences développées :</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedPath.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Modules du parcours */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Modules du Parcours</h3>
                {selectedPath.modules.map((module, index) => {
                  const TypeIcon = getTypeIcon(module.type);
                  return (
                    <motion.div
                      key={module.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            {/* Numéro et statut */}
                            <div className="flex flex-col items-center">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                module.completed 
                                  ? 'bg-green-500 text-white' 
                                  : module.progress > 0 
                                    ? 'bg-yellow-500 text-white' 
                                    : 'bg-muted text-muted-foreground'
                              }`}>
                                {module.completed ? (
                                  <CheckCircle className="w-4 h-4" />
                                ) : (
                                  <span className="text-sm font-medium">{index + 1}</span>
                                )}
                              </div>
                              {index < selectedPath.modules.length - 1 && (
                                <div className="w-0.5 h-16 bg-border mt-2" />
                              )}
                            </div>

                            {/* Contenu du module */}
                            <div className="flex-1 space-y-3">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h4 className="font-medium">{module.title}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {module.description}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge className={getDifficultyColor(module.difficulty)}>
                                    {module.difficulty}
                                  </Badge>
                                  <TypeIcon className="w-4 h-4 text-muted-foreground" />
                                </div>
                              </div>

                              {/* Progression */}
                              {module.progress > 0 && !module.completed && (
                                <div className="space-y-1">
                                  <div className="flex justify-between text-xs">
                                    <span>Progression</span>
                                    <span>{module.progress}%</span>
                                  </div>
                                  <Progress value={module.progress} className="h-1" />
                                </div>
                              )}

                              {/* Métadonnées */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {formatTime(module.estimatedTime)}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Target className="w-3 h-3" />
                                    {module.skills.length} compétences
                                  </span>
                                </div>
                                
                                <Button 
                                  size="sm" 
                                  variant={module.completed ? "outline" : "default"}
                                  className="gap-2"
                                >
                                  {module.completed ? (
                                    <>
                                      <CheckCircle className="w-3 h-3" />
                                      Revoir
                                    </>
                                  ) : module.progress > 0 ? (
                                    <>
                                      <TrendingUp className="w-3 h-3" />
                                      Continuer
                                    </>
                                  ) : (
                                    module.prerequisites ? (
                                      <>
                                        <AlertCircle className="w-3 h-3" />
                                        Prérequis
                                      </>
                                    ) : (
                                      <>
                                        <Zap className="w-3 h-3" />
                                        Commencer
                                      </>
                                    )
                                  )}
                                </Button>
                              </div>

                              {/* Compétences du module */}
                              <div className="flex flex-wrap gap-1">
                                {module.skills.map((skill, skillIndex) => (
                                  <Badge key={skillIndex} variant="outline" className="text-xs">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SmartLearningPath;