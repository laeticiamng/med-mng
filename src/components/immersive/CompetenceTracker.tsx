import React, { useState, useEffect } from 'react';
import { 
  Target, CheckCircle, Clock, TrendingUp, Award, Zap, 
  Brain, Eye, Heart, Stethoscope, Microscope, BookOpen,
  Star, Activity, BarChart3, Lightbulb, ArrowRight
} from 'lucide-react';
import { ImmersiveCard } from './ImmersiveCard';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface CompetenceDetail {
  id: string;
  intitule: string;
  description: string;
  rang: 'A' | 'B';
  category: string;
  progress?: number;
  mastered?: boolean;
  lastActivity?: Date;
  prerequisites?: string[];
  relatedObjectives?: string[];
}

interface CompetenceTrackerProps {
  competences: CompetenceDetail[];
  onCompetenceSelect?: (competence: CompetenceDetail) => void;
  onStartPractice?: (competence: CompetenceDetail) => void;
  showProgress?: boolean;
  interactive?: boolean;
  className?: string;
}

export const CompetenceTracker: React.FC<CompetenceTrackerProps> = ({
  competences,
  onCompetenceSelect,
  onStartPractice,
  showProgress = true,
  interactive = true,
  className = ''
}) => {
  const [selectedCompetence, setSelectedCompetence] = useState<CompetenceDetail | null>(null);
  const [filterRang, setFilterRang] = useState<'all' | 'A' | 'B'>('all');
  const [sortBy, setSortBy] = useState<'progress' | 'name' | 'category'>('progress');
  
  // Group competences by category and rank
  const groupedCompetences = competences.reduce((acc, comp) => {
    if (filterRang !== 'all' && comp.rang !== filterRang) return acc;
    
    if (!acc[comp.category]) acc[comp.category] = { A: [], B: [] };
    acc[comp.category][comp.rang].push(comp);
    return acc;
  }, {} as Record<string, { A: CompetenceDetail[], B: CompetenceDetail[] }>);

  // Sort competences
  Object.keys(groupedCompetences).forEach(category => {
    ['A', 'B'].forEach(rang => {
      if (groupedCompetences[category][rang as 'A' | 'B']) {
        groupedCompetences[category][rang as 'A' | 'B'].sort((a, b) => {
          switch (sortBy) {
            case 'progress':
              return (b.progress || 0) - (a.progress || 0);
            case 'name':
              return a.intitule.localeCompare(b.intitule);
            case 'category':
              return a.category.localeCompare(b.category);
            default:
              return 0;
          }
        });
      }
    });
  });

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'diagnostic': return <Microscope className="h-5 w-5" />;
      case 'thérapeutique': return <Heart className="h-5 w-5" />;
      case 'examen clinique': return <Stethoscope className="h-5 w-5" />;
      case 'anatomie': return <Eye className="h-5 w-5" />;
      case 'communication': return <Activity className="h-5 w-5" />;
      case 'analyse': return <BarChart3 className="h-5 w-5" />;
      default: return <Brain className="h-5 w-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'diagnostic': return 'blue';
      case 'thérapeutique': return 'green';
      case 'examen clinique': return 'purple';
      case 'anatomie': return 'orange';
      case 'communication': return 'pink';
      case 'analyse': return 'yellow';
      default: return 'gray';
    }
  };

  const getProgressColor = (progress?: number) => {
    if (!progress) return 'text-gray-400 bg-gray-500/20';
    if (progress >= 90) return 'text-green-400 bg-green-500/20';
    if (progress >= 70) return 'text-blue-400 bg-blue-500/20';
    if (progress >= 50) return 'text-orange-400 bg-orange-500/20';
    return 'text-red-400 bg-red-500/20';
  };

  const getProgressLevel = (progress?: number) => {
    if (!progress) return 'Non démarré';
    if (progress >= 90) return 'Maîtrisé';
    if (progress >= 70) return 'Avancé';
    if (progress >= 50) return 'Intermédiaire';
    return 'Débutant';
  };

  const totalCompetences = competences.length;
  const masteredCompetences = competences.filter(c => c.mastered || (c.progress && c.progress >= 90)).length;
  const averageProgress = competences.reduce((sum, c) => sum + (c.progress || 0), 0) / totalCompetences;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Stats */}
      <ImmersiveCard variant="gradient" glow="purple" size="lg">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center">
                  <Target className="h-6 w-6 text-white" />
                </div>
                Suivi des Compétences OIC
              </h2>
              <p className="text-gray-300 mt-1">
                Maîtrisez les compétences requises pour cet item EDN
              </p>
            </div>
            
            <div className="text-right">
              <div className="text-3xl font-bold text-white mb-1">
                {Math.round(averageProgress)}%
              </div>
              <div className="text-sm text-gray-300">Progression moyenne</div>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-white/10 rounded-lg">
              <div className="text-2xl font-bold text-blue-400">{totalCompetences}</div>
              <div className="text-xs text-gray-300">Total</div>
            </div>
            <div className="p-3 bg-white/10 rounded-lg">
              <div className="text-2xl font-bold text-green-400">{masteredCompetences}</div>
              <div className="text-xs text-gray-300">Maîtrisées</div>
            </div>
            <div className="p-3 bg-white/10 rounded-lg">
              <div className="text-2xl font-bold text-purple-400">{totalCompetences - masteredCompetences}</div>
              <div className="text-xs text-gray-300">En cours</div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2 flex-wrap">
            <div className="flex gap-1">
              {['all', 'A', 'B'].map((rang) => (
                <Button
                  key={rang}
                  variant={filterRang === rang ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setFilterRang(rang as any)}
                  className={filterRang === rang 
                    ? 'bg-purple-600 hover:bg-purple-700' 
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }
                >
                  {rang === 'all' ? 'Tous' : `Rang ${rang}`}
                </Button>
              ))}
            </div>
            
            <div className="flex gap-1">
              {[
                { id: 'progress', label: 'Progression' },
                { id: 'name', label: 'Nom' },
                { id: 'category', label: 'Catégorie' }
              ].map((sort) => (
                <Button
                  key={sort.id}
                  variant={sortBy === sort.id ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setSortBy(sort.id as any)}
                  className={sortBy === sort.id 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }
                >
                  {sort.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </ImmersiveCard>

      {/* Competences by Category */}
      <div className="space-y-6">
        {Object.entries(groupedCompetences).map(([category, ranks]) => {
          const categoryColor = getCategoryColor(category);
          const allCategoryComps = [...ranks.A, ...ranks.B];
          
          if (allCategoryComps.length === 0) return null;

          return (
            <ImmersiveCard 
              key={category} 
              variant="glass" 
              glow={categoryColor as any}
              className="overflow-hidden"
            >
              <div className="space-y-4">
                {/* Category Header */}
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-white flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-${categoryColor}-500/20 text-${categoryColor}-400`}>
                      {getCategoryIcon(category)}
                    </div>
                    {category}
                    <Badge variant="outline" className="border-white/20 text-gray-400">
                      {allCategoryComps.length} compétences
                    </Badge>
                  </h3>
                  
                  <div className="text-right">
                    <div className="text-lg font-bold text-white">
                      {Math.round(allCategoryComps.reduce((sum, c) => sum + (c.progress || 0), 0) / allCategoryComps.length)}%
                    </div>
                    <div className="text-xs text-gray-400">Progression</div>
                  </div>
                </div>

                {/* Competences by Rank */}
                {['A', 'B'].map((rang) => {
                  const rankComps = ranks[rang as 'A' | 'B'];
                  if (rankComps.length === 0) return null;

                  return (
                    <div key={rang} className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Badge className={rang === 'A' ? 'bg-blue-600/20 text-blue-300 border-blue-400/30' : 'bg-purple-600/20 text-purple-300 border-purple-400/30'}>
                          Rang {rang}
                        </Badge>
                        <span className="text-sm text-gray-400">{rankComps.length} compétences</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {rankComps.map((competence) => (
                          <div
                            key={competence.id}
                            className={`p-4 bg-white/5 border border-white/10 rounded-lg transition-all duration-200 ${
                              interactive ? 'hover:border-white/20 hover:bg-white/10 cursor-pointer' : ''
                            } ${selectedCompetence?.id === competence.id ? 'ring-2 ring-purple-400/50' : ''}`}
                            onClick={() => {
                              if (interactive) {
                                setSelectedCompetence(competence);
                                onCompetenceSelect?.(competence);
                              }
                            }}
                          >
                            <div className="space-y-3">
                              {/* Header */}
                              <div className="flex items-start justify-between">
                                <h4 className="font-medium text-white line-clamp-2 flex-1 pr-2">
                                  {competence.intitule}
                                </h4>
                                {competence.mastered && (
                                  <CheckCircle className="h-5 w-5 text-green-400 shrink-0" />
                                )}
                              </div>

                              {/* Description */}
                              <p className="text-gray-300 text-sm line-clamp-2">
                                {competence.description}
                              </p>

                              {/* Progress */}
                              {showProgress && competence.progress !== undefined && (
                                <div className="space-y-2">
                                  <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-400">
                                      {getProgressLevel(competence.progress)}
                                    </span>
                                    <Badge className={`text-xs ${getProgressColor(competence.progress)}`}>
                                      {competence.progress}%
                                    </Badge>
                                  </div>
                                  <Progress value={competence.progress} className="h-2" />
                                </div>
                              )}

                              {/* Actions */}
                              {interactive && (
                                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                                  <div className="flex items-center gap-2">
                                    {competence.lastActivity && (
                                      <div className="flex items-center gap-1 text-xs text-gray-400">
                                        <Clock className="h-3 w-3" />
                                        {competence.lastActivity.toLocaleDateString()}
                                      </div>
                                    )}
                                  </div>
                                  
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onStartPractice?.(competence);
                                    }}
                                    className="border-white/20 text-white hover:bg-white/10 text-xs"
                                  >
                                    <Zap className="h-3 w-3 mr-1" />
                                    Pratiquer
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ImmersiveCard>
          );
        })}
      </div>

      {/* Selected Competence Detail */}
      {selectedCompetence && interactive && (
        <ImmersiveCard variant="neon" glow="purple" className="border-2 border-purple-400/50">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                  {getCategoryIcon(selectedCompetence.category)}
                  {selectedCompetence.intitule}
                </h3>
                <div className="flex items-center gap-2 mb-3">
                  <Badge className={selectedCompetence.rang === 'A' ? 'bg-blue-600/20 text-blue-300' : 'bg-purple-600/20 text-purple-300'}>
                    Rang {selectedCompetence.rang}
                  </Badge>
                  <Badge variant="outline" className="border-white/20 text-gray-400">
                    {selectedCompetence.category}
                  </Badge>
                  {selectedCompetence.mastered && (
                    <Badge className="bg-green-600/20 text-green-300 border-green-400/30">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Maîtrisée
                    </Badge>
                  )}
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedCompetence(null)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </Button>
            </div>

            <p className="text-gray-300 leading-relaxed">
              {selectedCompetence.description}
            </p>

            {/* Progress Detail */}
            {selectedCompetence.progress !== undefined && (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-300">Niveau de maîtrise</span>
                  <span className="text-white font-medium">{selectedCompetence.progress}%</span>
                </div>
                <Progress value={selectedCompetence.progress} className="h-3" />
              </div>
            )}

            {/* Prerequisites */}
            {selectedCompetence.prerequisites && selectedCompetence.prerequisites.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-purple-300 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  Prérequis
                </h4>
                <div className="space-y-1">
                  {selectedCompetence.prerequisites.map((prereq, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-gray-300">
                      <ArrowRight className="h-3 w-3 text-purple-400" />
                      {prereq}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Related Objectives */}
            {selectedCompetence.relatedObjectives && selectedCompetence.relatedObjectives.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-purple-300 flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Objectifs liés
                </h4>
                <div className="space-y-1">
                  {selectedCompetence.relatedObjectives.map((objective, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-gray-300">
                      <Target className="h-3 w-3 text-blue-400" />
                      {objective}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-4 border-t border-white/10">
              <Button
                onClick={() => onStartPractice?.(selectedCompetence)}
                className="bg-purple-600 hover:bg-purple-700 flex-1"
              >
                <Zap className="h-4 w-4 mr-2" />
                Commencer la pratique
              </Button>
              
              <Button
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                <Award className="h-4 w-4 mr-2" />
                Voir détails
              </Button>
            </div>
          </div>
        </ImmersiveCard>
      )}
    </div>
  );
};