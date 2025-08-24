import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Award, Target, Brain, Eye, Lightbulb, 
  CheckCircle, Clock, Star, Zap, Activity, BarChart3
} from 'lucide-react';
import { ImmersiveCard } from './ImmersiveCard';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface SkillProgress {
  skillId: string;
  name: string;
  category: string;
  currentLevel: number;
  maxLevel: number;
  xp: number;
  nextLevelXp: number;
  masteryPercentage: number;
  recentActivities: string[];
  recommendations: string[];
}

interface LearningPath {
  id: string;
  title: string;
  description: string;
  steps: {
    id: string;
    title: string;
    completed: boolean;
    locked: boolean;
  }[];
  estimatedTime: number;
  difficulty: 1 | 2 | 3;
}

interface SkillMasteryVisualizationProps {
  skills: SkillProgress[];
  learningPaths: LearningPath[];
  overallProgress: number;
  onSkillClick?: (skill: SkillProgress) => void;
  onPathStart?: (path: LearningPath) => void;
  className?: string;
}

export const SkillMasteryVisualization: React.FC<SkillMasteryVisualizationProps> = ({
  skills,
  learningPaths,
  overallProgress,
  onSkillClick,
  onPathStart,
  className = ''
}) => {
  const [selectedSkill, setSelectedSkill] = useState<SkillProgress | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'radar' | 'timeline'>('grid');
  
  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'diagnostic': return <Eye className="h-4 w-4" />;
      case 'thérapeutique': return <Target className="h-4 w-4" />;
      case 'communication': return <Activity className="h-4 w-4" />;
      case 'technique': return <Zap className="h-4 w-4" />;
      case 'analyse': return <BarChart3 className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'diagnostic': return 'primary';
      case 'thérapeutique': return 'success';
      case 'communication': return 'accent';
      case 'technique': return 'warning';
      case 'analyse': return 'destructive';
      default: return 'muted';
    }
  };

  const getMasteryLevel = (percentage: number) => {
    if (percentage >= 90) return { level: 'Expert', color: 'text-warning', bgColor: 'bg-warning/20' };
    if (percentage >= 75) return { level: 'Avancé', color: 'text-success', bgColor: 'bg-success/20' };
    if (percentage >= 50) return { level: 'Intermédiaire', color: 'text-primary', bgColor: 'bg-primary/20' };
    if (percentage >= 25) return { level: 'Débutant', color: 'text-accent', bgColor: 'bg-accent/20' };
    return { level: 'Novice', color: 'text-muted-foreground', bgColor: 'bg-muted/50' };
  };

  const groupedSkills = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) acc[skill.category] = [];
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, SkillProgress[]>);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Overall Progress Header */}
      <ImmersiveCard variant="gradient" glow="purple" size="lg">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                Maîtrise des Compétences
              </h2>
              <p className="text-gray-300 mt-1">
                Suivez votre progression et développez vos compétences médicales
              </p>
            </div>
            
            <div className="text-right">
              <div className="text-3xl font-bold text-white mb-1">
                {Math.round(overallProgress)}%
              </div>
              <div className="text-sm text-gray-300">Progression globale</div>
            </div>
          </div>
          
          <Progress value={overallProgress} className="h-3" />
          
          {/* View Mode Selector */}
          <div className="flex gap-2">
            {[
              { id: 'grid', label: '🔲 Grille', icon: BarChart3 },
              { id: 'radar', label: '🎯 Radar', icon: Target },
              { id: 'timeline', label: '📈 Timeline', icon: TrendingUp }
            ].map((mode) => (
              <Button
                key={mode.id}
                variant={viewMode === mode.id ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode(mode.id as any)}
                className={viewMode === mode.id 
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' 
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
                }
              >
                <mode.icon className="h-4 w-4 mr-1" />
                {mode.label}
              </Button>
            ))}
          </div>
        </div>
      </ImmersiveCard>

      {/* Skills by Category */}
      {viewMode === 'grid' && (
        <div className="space-y-6">
          {Object.entries(groupedSkills).map(([category, categorySkills]) => (
            <ImmersiveCard key={category} variant="glass" glow={getCategoryColor(category) as any}>
              <div className="space-y-4">
              <h3 className="text-xl font-semibold text-foreground flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-${getCategoryColor(category)}/20 text-${getCategoryColor(category)}`}>
                  {getCategoryIcon(category)}
                </div>
                {category}
                <Badge variant="outline" className="border-border text-muted-foreground">
                  {categorySkills.length} compétences
                </Badge>
              </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categorySkills.map((skill) => {
                    const mastery = getMasteryLevel(skill.masteryPercentage);
                    
                    return (
                      <div
                        key={skill.skillId}
                        onClick={() => {
                          setSelectedSkill(skill);
                          onSkillClick?.(skill);
                        }}
                        className="medical-card-premium glass-medical p-4 hover:shadow-premium transition-all duration-200 group cursor-pointer"
                      >
                        <div className="space-y-3">
                          {/* Skill Header */}
                          <div className="flex items-start justify-between">
                            <h4 className="font-medium text-white group-hover:text-purple-300 transition-colors line-clamp-2">
                              {skill.name}
                            </h4>
                            <Badge className={`${mastery.bgColor} ${mastery.color} text-xs`}>
                              {mastery.level}
                            </Badge>
                          </div>

                          {/* Progress */}
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-400">Niveau {skill.currentLevel}</span>
                              <span className="text-white">{skill.masteryPercentage}%</span>
                            </div>
                            <Progress value={skill.masteryPercentage} className="h-2" />
                          </div>

                          {/* XP Progress */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-500">XP</span>
                              <span className="text-gray-400">{skill.xp} / {skill.nextLevelXp}</span>
                            </div>
                            <div className="w-full bg-white/5 rounded-full h-1">
                              <div 
                                className="bg-gradient-to-r from-blue-500 to-purple-500 h-1 rounded-full transition-all duration-300"
                                style={{ width: `${(skill.xp / skill.nextLevelXp) * 100}%` }}
                              />
                            </div>
                          </div>

                          {/* Recent Activity */}
                          {skill.recentActivities.length > 0 && (
                            <div className="pt-2 border-t border-white/10">
                              <div className="text-xs text-gray-400 mb-1">Récent:</div>
                              <div className="text-xs text-gray-300 line-clamp-2">
                                {skill.recentActivities[0]}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </ImmersiveCard>
          ))}
        </div>
      )}

      {/* Learning Paths */}
      <ImmersiveCard variant="glass" glow="green">
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-white flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/20 text-green-400">
              <Lightbulb className="h-5 w-5" />
            </div>
            Parcours d'apprentissage recommandés
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {learningPaths.map((path) => {
              const completedSteps = path.steps.filter(step => step.completed).length;
              const progressPercentage = (completedSteps / path.steps.length) * 100;
              
              return (
                <div
                  key={path.id}
                  className="p-4 bg-white/5 border border-white/10 rounded-lg hover:border-white/20 hover:bg-white/10 transition-all duration-200"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <h4 className="font-medium text-white line-clamp-2">{path.title}</h4>
                      <div className="flex items-center gap-1 shrink-0">
                        {Array.from({ length: 3 }, (_, i) => (
                          <Star 
                            key={i} 
                            className={`h-3 w-3 ${i < path.difficulty ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`} 
                          />
                        ))}
                      </div>
                    </div>

                    <p className="text-gray-300 text-sm line-clamp-2">
                      {path.description}
                    </p>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Progression</span>
                        <span className="text-white">{completedSteps}/{path.steps.length}</span>
                      </div>
                      <Progress value={progressPercentage} className="h-2" />
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-white/10">
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Clock className="h-3 w-3" />
                        {path.estimatedTime}h
                      </div>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onPathStart?.(path)}
                        className="border-white/20 text-white hover:bg-white/10 text-xs"
                      >
                        {progressPercentage > 0 ? 'Continuer' : 'Commencer'}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </ImmersiveCard>

      {/* Selected Skill Detail */}
      {selectedSkill && (
        <ImmersiveCard variant="neon" glow="purple" className="border-2 border-purple-400/50">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold text-white mb-1">{selectedSkill.name}</h3>
                <Badge className={`${getMasteryLevel(selectedSkill.masteryPercentage).bgColor} ${getMasteryLevel(selectedSkill.masteryPercentage).color}`}>
                  {getMasteryLevel(selectedSkill.masteryPercentage).level}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedSkill(null)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Progress Details */}
              <div className="space-y-4">
                <h4 className="font-semibold text-purple-300">Progression détaillée</h4>
                
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-300">Maîtrise globale</span>
                      <span className="text-white">{selectedSkill.masteryPercentage}%</span>
                    </div>
                    <Progress value={selectedSkill.masteryPercentage} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-300">Niveau actuel</span>
                      <span className="text-white">{selectedSkill.currentLevel} / {selectedSkill.maxLevel}</span>
                    </div>
                    <Progress value={(selectedSkill.currentLevel / selectedSkill.maxLevel) * 100} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-300">XP vers niveau suivant</span>
                      <span className="text-white">{selectedSkill.xp} / {selectedSkill.nextLevelXp}</span>
                    </div>
                    <Progress value={(selectedSkill.xp / selectedSkill.nextLevelXp) * 100} className="h-2" />
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <div className="space-y-4">
                <h4 className="font-semibold text-purple-300">Recommandations</h4>
                <div className="space-y-2">
                  {selectedSkill.recommendations.map((recommendation, index) => (
                    <div key={index} className="p-2 bg-white/5 rounded-lg text-sm text-gray-300">
                      {recommendation}
                    </div>
                  ))}
                </div>
                
                {selectedSkill.recentActivities.length > 0 && (
                  <>
                    <h4 className="font-semibold text-purple-300 mt-4">Activités récentes</h4>
                    <div className="space-y-2">
                      {selectedSkill.recentActivities.slice(0, 3).map((activity, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-gray-300">
                          <div className="w-1 h-1 bg-purple-400 rounded-full" />
                          {activity}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </ImmersiveCard>
      )}
    </div>
  );
};