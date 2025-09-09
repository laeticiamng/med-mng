/**
 * 🚀 PAGE GAMING & SIMULATIONS MÉDICALES PREMIUM
 * Expériences interactives et ECOS pour formation médicale
 * ✅ Simulations cliniques réalistes
 * ✅ Évaluations ECOS intégrées
 * ✅ Gamification de l'apprentissage
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ConsistentBackground } from '@/components/layout/ConsistentBackground';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Gamepad2, 
  Play, 
  Trophy, 
  Clock,
  Users,
  Star,
  Target,
  Zap,
  Brain,
  HeartHandshake,
  Stethoscope,
  FileText,
  Award,
  TrendingUp,
  Timer,
  CheckCircle2,
  Loader2
} from 'lucide-react';

interface GameScenario {
  id: string;
  title: string;
  description: string;
  type: 'ecos' | 'simulation' | 'quiz' | 'case-study';
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  duration: number; // en minutes
  participants: number;
  rating: number;
  completed: boolean;
  progress: number;
  specialty: string;
  tags: string[];
}

interface PlayerStats {
  totalScenarios: number;
  completedScenarios: number;
  averageScore: number;
  totalPlayTime: number;
  achievements: number;
  currentStreak: number;
}

const difficultyColors = {
  beginner: 'bg-green-100 text-green-700 border-green-200',
  intermediate: 'bg-blue-100 text-blue-700 border-blue-200',
  advanced: 'bg-orange-100 text-orange-700 border-orange-200',
  expert: 'bg-red-100 text-red-700 border-red-200'
};

const typeIcons = {
  ecos: Stethoscope,
  simulation: Brain,
  quiz: FileText,
  'case-study': Target
};

const Gaming = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // États du composant
  const [scenarios, setScenarios] = useState<GameScenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [playerStats, setPlayerStats] = useState<PlayerStats>({
    totalScenarios: 0,
    completedScenarios: 0,
    averageScore: 0,
    totalPlayTime: 0,
    achievements: 0,
    currentStreak: 0
  });
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'ecos' | 'simulation' | 'quiz'>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'all' | 'beginner' | 'intermediate' | 'advanced' | 'expert'>('all');

  // Chargement des données depuis Supabase
  useEffect(() => {
    const loadGamingData = async () => {
      try {
        setLoading(true);

        // Données simulées pour les scénarios gaming/ECOS
        const mockScenarios: GameScenario[] = [
          {
            id: '1',
            title: 'ECOS Cardiologie - Insuffisance Cardiaque',
            description: 'Évaluation complète d\'un patient présentant des signes d\'insuffisance cardiaque. Anamnèse, examen physique et plan thérapeutique.',
            type: 'ecos',
            difficulty: 'intermediate',
            duration: 15,
            participants: 1247,
            rating: 4.8,
            completed: false,
            progress: 0,
            specialty: 'Cardiologie',
            tags: ['IC-232', 'Insuffisance cardiaque', 'NYHA', 'BNP']
          },
          {
            id: '2',
            title: 'Simulation Urgences - Arrêt Cardiaque',
            description: 'Prise en charge d\'un arrêt cardio-respiratoire en service d\'urgences. RCP, défibrillation et protocoles avancés.',
            type: 'simulation',
            difficulty: 'expert',
            duration: 20,
            participants: 892,
            rating: 4.9,
            completed: true,
            progress: 100,
            specialty: 'Médecine d\'urgence',
            tags: ['IC-334', 'ACR', 'RCP', 'Défibrillation']
          },
          {
            id: '3',
            title: 'Quiz Interactif - Antibiotiques',
            description: 'Testez vos connaissances sur les antibiotiques : indications, contre-indications, effets secondaires.',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 10,
            participants: 2156,
            rating: 4.6,
            completed: false,
            progress: 45,
            specialty: 'Infectiologie',
            tags: ['IC-173', 'Antibiotiques', 'Résistance', 'Posologie']
          },
          {
            id: '4',
            title: 'Cas Clinique - Diabète Type 2',
            description: 'Patient de 55 ans avec diabète de type 2 déséquilibré. Analyse des complications et optimisation thérapeutique.',
            type: 'case-study',
            difficulty: 'intermediate',
            duration: 25,
            participants: 1534,
            rating: 4.7,
            completed: false,
            progress: 20,
            specialty: 'Endocrinologie',
            tags: ['IC-233', 'Diabète T2', 'HbA1c', 'Complications']
          },
          {
            id: '5',
            title: 'ECOS Neurologie - AVC Ischémique',
            description: 'Évaluation neurologique d\'un AVC ischémique aigu. Score NIHSS, imagerie et thrombolyse.',
            type: 'ecos',
            difficulty: 'advanced',
            duration: 18,
            participants: 756,
            rating: 4.9,
            completed: true,
            progress: 100,
            specialty: 'Neurologie',
            tags: ['IC-133', 'AVC', 'NIHSS', 'Thrombolyse']
          },
          {
            id: '6',
            title: 'Simulation Pédiatrie - Bronchiolite',
            description: 'Prise en charge d\'un nourrisson avec bronchiolite. Évaluation de la détresse respiratoire et traitement.',
            type: 'simulation',
            difficulty: 'intermediate',
            duration: 12,
            participants: 634,
            rating: 4.5,
            completed: false,
            progress: 0,
            specialty: 'Pédiatrie',
            tags: ['IC-51', 'Bronchiolite', 'Détresse respiratoire', 'VRS']
          }
        ];

        setScenarios(mockScenarios);

        // Calcul des statistiques
        const completed = mockScenarios.filter(s => s.completed).length;
        const totalProgress = mockScenarios.reduce((sum, s) => sum + s.progress, 0);
        const avgScore = totalProgress / mockScenarios.length;

        setPlayerStats({
          totalScenarios: mockScenarios.length,
          completedScenarios: completed,
          averageScore: avgScore,
          totalPlayTime: 127, // minutes simulées
          achievements: 8,
          currentStreak: 3
        });

        toast({
          title: "🎮 Plateforme Gaming chargée",
          description: `${mockScenarios.length} scénarios disponibles, ${completed} complétés`,
        });

      } catch (error) {
        console.error('Erreur chargement gaming:', error);
        toast({
          title: "❌ Erreur de chargement",
          description: "Impossible de charger les scénarios gaming",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadGamingData();
  }, [toast]);

  // Filtrage des scenarios
  const filteredScenarios = scenarios.filter(scenario => {
    const matchesType = selectedFilter === 'all' || scenario.type === selectedFilter;
    const matchesDifficulty = selectedDifficulty === 'all' || scenario.difficulty === selectedDifficulty;
    return matchesType && matchesDifficulty;
  });

  // Lancement d'un scénario
  const handleStartScenario = (scenario: GameScenario) => {
    if (scenario.type === 'ecos') {
      navigate(`/ecos/${scenario.id}`);
    } else {
      toast({
        title: "🎮 Lancement du scénario",
        description: `Démarrage de "${scenario.title}"`,
      });
      // Logique de lancement du scénario
    }
  };

  // Reprise d'un scénario en cours
  const handleContinueScenario = (scenario: GameScenario) => {
    toast({
      title: "⏯️ Reprise du scénario",
      description: `Continuation depuis ${scenario.progress}%`,
    });
  };

  if (loading) {
    return (
      <ConsistentBackground variant="primary">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
              <p className="text-lg font-medium text-foreground">Chargement des scénarios...</p>
              <p className="text-sm text-muted-foreground">Préparation de l'environnement gaming</p>
            </div>
          </div>
        </div>
      </ConsistentBackground>
    );
  }

  return (
    <ConsistentBackground variant="primary">
      <div className="container mx-auto px-4 py-8">
        <PageHeader
          title="Gaming & Simulations Médicales"
          subtitle="Expériences interactives et ECOS pour maîtriser la pratique clinique"
          icon={Gamepad2}
          showBackButton
        />

        {/* Statistiques du joueur */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-200/20">
            <CardContent className="p-4 text-center">
              <Trophy className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{playerStats.completedScenarios}</p>
              <p className="text-xs text-muted-foreground">Complétés</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-200/20">
            <CardContent className="p-4 text-center">
              <Star className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{Math.round(playerStats.averageScore)}%</p>
              <p className="text-xs text-muted-foreground">Score moyen</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-200/20">
            <CardContent className="p-4 text-center">
              <Clock className="h-6 w-6 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{Math.floor(playerStats.totalPlayTime / 60)}h{playerStats.totalPlayTime % 60}m</p>
              <p className="text-xs text-muted-foreground">Temps total</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-200/20">
            <CardContent className="p-4 text-center">
              <Award className="h-6 w-6 text-orange-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{playerStats.achievements}</p>
              <p className="text-xs text-muted-foreground">Réussites</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-200/20">
            <CardContent className="p-4 text-center">
              <Zap className="h-6 w-6 text-red-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{playerStats.currentStreak}</p>
              <p className="text-xs text-muted-foreground">Série actuelle</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border-cyan-200/20">
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-6 w-6 text-cyan-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{Math.round((playerStats.completedScenarios / playerStats.totalScenarios) * 100)}%</p>
              <p className="text-xs text-muted-foreground">Progression</p>
            </CardContent>
          </Card>
        </div>

        {/* Filtres */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>🎯 Filtres & Catégories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-4">
              <Button
                variant={selectedFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter('all')}
              >
                Tous les types
              </Button>
              <Button
                variant={selectedFilter === 'ecos' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter('ecos')}
              >
                <Stethoscope className="h-4 w-4 mr-1" />
                ECOS
              </Button>
              <Button
                variant={selectedFilter === 'simulation' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter('simulation')}
              >
                <Brain className="h-4 w-4 mr-1" />
                Simulations
              </Button>
              <Button
                variant={selectedFilter === 'quiz' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter('quiz')}
              >
                <FileText className="h-4 w-4 mr-1" />
                Quiz
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedDifficulty === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedDifficulty('all')}
              >
                Toutes difficultés
              </Button>
              {(['beginner', 'intermediate', 'advanced', 'expert'] as const).map((difficulty) => (
                <Button
                  key={difficulty}
                  variant={selectedDifficulty === difficulty ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedDifficulty(difficulty)}
                >
                  {difficulty === 'beginner' && '🟢 Débutant'}
                  {difficulty === 'intermediate' && '🔵 Intermédiaire'}
                  {difficulty === 'advanced' && '🟠 Avancé'}
                  {difficulty === 'expert' && '🔴 Expert'}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Grille des scénarios */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredScenarios.map((scenario) => {
            const TypeIcon = typeIcons[scenario.type];
            
            return (
              <Card
                key={scenario.id}
                className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-background to-muted/50"
              >
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <TypeIcon className="h-5 w-5 text-primary" />
                      <Badge className={difficultyColors[scenario.difficulty]}>
                        {scenario.difficulty}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span>{scenario.rating}</span>
                    </div>
                  </div>
                  
                  <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">
                    {scenario.title}
                  </CardTitle>
                  
                  <Badge variant="outline" className="w-fit">
                    {scenario.specialty}
                  </Badge>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {scenario.description}
                    </p>
                    
                    {/* Progress bar si en cours */}
                    {scenario.progress > 0 && scenario.progress < 100 && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span>Progression</span>
                          <span>{scenario.progress}%</span>
                        </div>
                        <Progress value={scenario.progress} className="h-2" />
                      </div>
                    )}
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1">
                      {scenario.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    
                    {/* Métadonnées */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Timer className="h-3 w-3" />
                          <span>{scenario.duration} min</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span>{scenario.participants.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Boutons d'action */}
                    <div className="flex gap-2 pt-2">
                      {scenario.completed ? (
                        <Button
                          size="sm"
                          variant="secondary"
                          className="flex-1"
                          onClick={() => handleStartScenario(scenario)}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Rejouer
                        </Button>
                      ) : scenario.progress > 0 ? (
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => handleContinueScenario(scenario)}
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Continuer
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => handleStartScenario(scenario)}
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Commencer
                        </Button>
                      )}
                      
                      <Button
                        size="sm"
                        variant="outline"
                      >
                        <HeartHandshake className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Message si aucun résultat */}
        {filteredScenarios.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Gamepad2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucun scénario trouvé</h3>
              <p className="text-muted-foreground mb-4">
                Aucun scénario ne correspond à vos critères de filtrage
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedFilter('all');
                  setSelectedDifficulty('all');
                }}
              >
                Réinitialiser les filtres
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Call to action */}
        <div className="mt-12">
          <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold text-foreground mb-4">
                🏆 Défiez-vous avec nos Scenarios Premium
              </h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Perfectionnez vos compétences cliniques avec nos simulations réalistes et évaluations ECOS
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg"
                  onClick={() => navigate('/ecos')}
                >
                  <Stethoscope className="h-5 w-5 mr-2" />
                  Explorer les ECOS
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => navigate('/edn-production')}
                >
                  <Target className="h-5 w-5 mr-2" />
                  Retour aux Items EDN
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ConsistentBackground>
  );
};

export default Gaming;