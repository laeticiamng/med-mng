import React, { useState, useEffect } from 'react';
import { 
  Brain, Target, Microscope, Heart, Stethoscope, Eye, Hand, 
  BookOpen, CheckCircle, Star, Clock, Award, Zap, Activity,
  Play, Pause, RotateCcw, Volume2, VolumeX, Settings
} from 'lucide-react';
import { ImmersiveCard } from './ImmersiveCard';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';

interface Competence {
  id: string;
  intitule: string;
  description: string;
  rang: 'A' | 'B';
  category: string;
  mastered?: boolean;
  progress?: number;
}

interface LearningObjective {
  id: string;
  title: string;
  description: string;
  type: 'knowledge' | 'skill' | 'attitude';
  difficulty: 1 | 2 | 3;
  completed: boolean;
  estimatedTime: number;
}

interface EdnImmersiveSceneProps {
  item: {
    id: string;
    title: string;
    item_code: string;
    competences_oic_rang_a?: Competence[];
    competences_oic_rang_b?: Competence[];
    objectifs_apprentissage?: LearningObjective[];
    content?: string;
    difficulty_level?: number;
    estimated_duration?: number;
  };
  onProgressUpdate?: (progress: number) => void;
  className?: string;
}

export const EdnImmersiveScene: React.FC<EdnImmersiveSceneProps> = ({
  item,
  onProgressUpdate,
  className = ''
}) => {
  const [activeMode, setActiveMode] = useState<'overview' | 'competences' | 'objectives' | 'practice'>('overview');
  const [sessionProgress, setSessionProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState([80]);
  const [focusMode, setFocusMode] = useState(false);
  const [selectedCompetence, setSelectedCompetence] = useState<Competence | null>(null);
  
  // Combine competences from both ranks
  const allCompetences = [
    ...(item.competences_oic_rang_a || []),
    ...(item.competences_oic_rang_b || [])
  ];

  const completedObjectives = (item.objectifs_apprentissage || []).filter(obj => obj.completed).length;
  const totalObjectives = (item.objectifs_apprentissage || []).length;
  const objectivesProgress = totalObjectives > 0 ? (completedObjectives / totalObjectives) * 100 : 0;

  useEffect(() => {
    // Simulate learning progress over time
    if (isPlaying) {
      const interval = setInterval(() => {
        setSessionProgress(prev => {
          const newProgress = Math.min(prev + 0.5, 100);
          onProgressUpdate?.(newProgress);
          return newProgress;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isPlaying, onProgressUpdate]);

  const getCompetenceIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'diagnostic': return <Microscope className="h-5 w-5" />;
      case 'thérapeutique': return <Heart className="h-5 w-5" />;
      case 'examen clinique': return <Stethoscope className="h-5 w-5" />;
      case 'anatomie': return <Eye className="h-5 w-5" />;
      case 'geste technique': return <Hand className="h-5 w-5" />;
      default: return <Brain className="h-5 w-5" />;
    }
  };

  const getObjectiveTypeColor = (type: string) => {
    switch (type) {
      case 'knowledge': return 'text-blue-400 bg-blue-500/20 border-blue-400/30';
      case 'skill': return 'text-green-400 bg-green-500/20 border-green-400/30';
      case 'attitude': return 'text-purple-400 bg-purple-500/20 border-purple-400/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-400/30';
    }
  };

  const getDifficultyStars = (level: number) => {
    return Array.from({ length: 3 }, (_, i) => (
      <Star 
        key={i} 
        className={`h-3 w-3 ${i < level ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`} 
      />
    ));
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Scene Header avec contrôles immersifs */}
      <ImmersiveCard variant="gradient" glow="purple" size="lg">
        <div className="space-y-4">
          {/* Title & Controls */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                {item.title}
              </h1>
              <div className="flex items-center gap-3 flex-wrap">
                <Badge className="bg-blue-600/20 text-blue-300 border-blue-400/30">
                  {item.item_code}
                </Badge>
                {item.difficulty_level && (
                  <div className="flex items-center gap-1">
                    {getDifficultyStars(item.difficulty_level)}
                  </div>
                )}
                {item.estimated_duration && (
                  <Badge variant="outline" className="border-white/20 text-white">
                    <Clock className="h-3 w-3 mr-1" />
                    {item.estimated_duration}min
                  </Badge>
                )}
              </div>
            </div>

            {/* Audio Controls */}
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant={focusMode ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFocusMode(!focusMode)}
                className={focusMode ? 'bg-purple-600 hover:bg-purple-700' : 'border-white/20 text-white hover:bg-white/10'}
              >
                <Brain className="h-4 w-4 mr-1" />
                Focus
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPlaying(!isPlaying)}
                className="border-white/20 text-white hover:bg-white/10"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">Progression de la session</span>
              <span className="text-white font-medium">{sessionProgress.toFixed(0)}%</span>
            </div>
            <Progress value={sessionProgress} className="h-2" />
          </div>

          {/* Mode Navigation */}
          <div className="flex gap-2 flex-wrap">
            {[
              { id: 'overview', label: '🎯 Vue d\'ensemble', icon: Target },
              { id: 'competences', label: '🧠 Compétences', icon: Brain },
              { id: 'objectives', label: '📚 Objectifs', icon: BookOpen },
              { id: 'practice', label: '⚡ Pratique', icon: Zap }
            ].map((mode) => (
              <Button
                key={mode.id}
                variant={activeMode === mode.id ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveMode(mode.id as any)}
                className={activeMode === mode.id 
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

      {/* Content Area */}
      {activeMode === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stats Overview */}
          <ImmersiveCard variant="glass" glow="blue">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto">
                <Target className="h-8 w-8 text-blue-400" />
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-400 mb-1">
                  {allCompetences.length}
                </div>
                <div className="text-sm text-gray-300">Compétences ciblées</div>
              </div>
            </div>
          </ImmersiveCard>

          <ImmersiveCard variant="glass" glow="green">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto">
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
              <div>
                <div className="text-3xl font-bold text-green-400 mb-1">
                  {completedObjectives}/{totalObjectives}
                </div>
                <div className="text-sm text-gray-300">Objectifs atteints</div>
              </div>
            </div>
          </ImmersiveCard>

          <ImmersiveCard variant="glass" glow="orange">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-orange-500/20 rounded-2xl flex items-center justify-center mx-auto">
                <Activity className="h-8 w-8 text-orange-400" />
              </div>
              <div>
                <div className="text-3xl font-bold text-orange-400 mb-1">
                  {Math.round(objectivesProgress)}%
                </div>
                <div className="text-sm text-gray-300">Maîtrise globale</div>
              </div>
            </div>
          </ImmersiveCard>
        </div>
      )}

      {activeMode === 'competences' && (
        <div className="space-y-6">
          {/* Competences by Rank */}
          {['A', 'B'].map((rang) => {
            const competencesRank = rang === 'A' ? item.competences_oic_rang_a || [] : item.competences_oic_rang_b || [];
            
            if (competencesRank.length === 0) return null;

            return (
              <ImmersiveCard key={rang} variant="glass" glow={rang === 'A' ? 'blue' : 'purple'}>
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Badge className={rang === 'A' ? 'bg-blue-600/20 text-blue-300' : 'bg-purple-600/20 text-purple-300'}>
                      Rang {rang}
                    </Badge>
                    Compétences OIC
                  </h3>

                  <div className="grid gap-4">
                    {competencesRank.map((competence, index) => (
                      <div
                        key={`${rang}-${index}`}
                        className={`p-4 bg-white/5 border border-white/10 rounded-lg hover:border-white/20 hover:bg-white/10 cursor-pointer transition-all duration-200 ${
                          selectedCompetence?.id === competence.id ? 'ring-2 ring-purple-400/50' : ''
                        }`}
                        onClick={() => setSelectedCompetence(competence)}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`p-2 rounded-lg ${rang === 'A' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>
                            {getCompetenceIcon(competence.category)}
                          </div>
                          
                          <div className="flex-1">
                            <h4 className="font-semibold text-white mb-1">
                              {competence.intitule}
                            </h4>
                            <p className="text-gray-300 text-sm mb-2 line-clamp-2">
                              {competence.description}
                            </p>
                            
                            <div className="flex items-center justify-between">
                              <Badge variant="outline" className="text-xs border-white/20 text-gray-400">
                                {competence.category}
                              </Badge>
                              
                              {competence.progress !== undefined && (
                                <div className="flex items-center gap-2">
                                  <div className="w-16 h-2 bg-white/10 rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                                      style={{ width: `${competence.progress}%` }}
                                    />
                                  </div>
                                  <span className="text-xs text-gray-400">{competence.progress}%</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </ImmersiveCard>
            );
          })}
        </div>
      )}

      {activeMode === 'objectives' && (
        <ImmersiveCard variant="glass" glow="green">
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <BookOpen className="h-6 w-6" />
              Objectifs d'apprentissage
            </h3>

            <div className="grid gap-4">
              {(item.objectifs_apprentissage || []).map((objective, index) => (
                <div
                  key={objective.id}
                  className={`p-4 bg-white/5 border border-white/10 rounded-lg transition-all duration-200 ${
                    objective.completed ? 'bg-green-500/10 border-green-400/30' : 'hover:border-white/20 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg shrink-0 ${
                      objective.completed 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {objective.completed ? <CheckCircle className="h-5 w-5" /> : <Target className="h-5 w-5" />}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className={`font-semibold ${objective.completed ? 'text-green-300' : 'text-white'}`}>
                          {objective.title}
                        </h4>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge className={getObjectiveTypeColor(objective.type)}>
                            {objective.type}
                          </Badge>
                          <div className="flex items-center">
                            {getDifficultyStars(objective.difficulty)}
                          </div>
                        </div>
                      </div>

                      <p className="text-gray-300 text-sm mb-3">
                        {objective.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <Clock className="h-3 w-3" />
                          {objective.estimatedTime} min
                        </div>
                        
                        {!objective.completed && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-white/20 text-white hover:bg-white/10 text-xs"
                          >
                            Commencer
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ImmersiveCard>
      )}

      {activeMode === 'practice' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ImmersiveCard variant="neon" glow="orange">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-orange-500/20 rounded-3xl flex items-center justify-center mx-auto">
                <Zap className="h-10 w-10 text-orange-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Mode Pratique Interactive</h3>
              <p className="text-gray-300 text-sm">
                Exercices et simulations basés sur les compétences de cet item EDN
              </p>
              <Button className="bg-orange-600 hover:bg-orange-700 w-full">
                Démarrer la pratique
              </Button>
            </div>
          </ImmersiveCard>

          <ImmersiveCard variant="glass" glow="pink">
            <div className="space-y-4">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Paramètres de session
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 text-sm">Mode focus</span>
                  <Switch checked={focusMode} onCheckedChange={setFocusMode} />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 text-sm">Volume audio</span>
                    <span className="text-white text-sm">{volume[0]}%</span>
                  </div>
                  <Slider
                    value={volume}
                    onValueChange={setVolume}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                </div>

                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full border-white/20 text-white hover:bg-white/10"
                  onClick={() => setSessionProgress(0)}
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Recommencer la session
                </Button>
              </div>
            </div>
          </ImmersiveCard>
        </div>
      )}

      {/* Selected Competence Detail Modal-like display */}
      {selectedCompetence && (
        <ImmersiveCard variant="neon" glow="purple" className="border-2 border-purple-400/50">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                {getCompetenceIcon(selectedCompetence.category)}
                Compétence sélectionnée
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedCompetence(null)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </Button>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-purple-300">{selectedCompetence.intitule}</h4>
              <p className="text-gray-300">{selectedCompetence.description}</p>
              
              <div className="flex items-center gap-4">
                <Badge className="bg-purple-600/20 text-purple-300">
                  Rang {selectedCompetence.rang}
                </Badge>
                <Badge variant="outline" className="border-white/20 text-gray-400">
                  {selectedCompetence.category}
                </Badge>
              </div>
              
              {selectedCompetence.progress !== undefined && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">Maîtrise</span>
                    <span className="text-purple-300">{selectedCompetence.progress}%</span>
                  </div>
                  <Progress value={selectedCompetence.progress} className="h-2" />
                </div>
              )}
            </div>
          </div>
        </ImmersiveCard>
      )}
    </div>
  );
};