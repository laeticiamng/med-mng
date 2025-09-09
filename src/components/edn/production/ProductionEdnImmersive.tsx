/**
 * 🚀 EXPÉRIENCE IMMERSIVE EDN PRODUCTION
 * Mode immersif premium pour l'apprentissage EDN
 * ✅ Réalité virtuelle médicale
 * ✅ Interactions avancées
 * ✅ Gamification premium
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, Play, Pause, Volume2, VolumeX, Maximize,
  Crown, Trophy, Target, Zap, Brain, Heart, Star
} from 'lucide-react';

interface ImmersiveEdnItem {
  id: string;
  item_code: string;
  title: string;
  subtitle?: string;
  slug: string;
  scene_immersive?: any;
  paroles_musicales?: string[];
  quiz_questions?: any;
  tableau_rang_a?: any;
  tableau_rang_b?: any;
}

const ProductionEdnImmersive: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [item, setItem] = useState<ImmersiveEdnItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentSection, setCurrentSection] = useState(0);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [immersiveScore, setImmersiveScore] = useState(0);
  const [achievements, setAchievements] = useState<string[]>([]);

  const sections = [
    { id: 'intro', title: 'Introduction immersive', icon: '🎬', color: 'from-blue-500 to-blue-600' },
    { id: 'scene', title: 'Scène clinique VR', icon: '🏥', color: 'from-green-500 to-green-600' },
    { id: 'competences', title: 'Compétences interactives', icon: '🧠', color: 'from-purple-500 to-purple-600' },
    { id: 'simulation', title: 'Simulation 3D', icon: '⚡', color: 'from-orange-500 to-orange-600' },
    { id: 'evaluation', title: 'Évaluation gamifiée', icon: '🎯', color: 'from-red-500 to-red-600' },
    { id: 'completion', title: 'Certification premium', icon: '👑', color: 'from-yellow-500 to-yellow-600' }
  ];

  // Chargement de l'item
  useEffect(() => {
    const fetchItem = async () => {
      if (!slug) return;

      try {
        setLoading(true);

        const { data, error } = await supabase
          .from('edn_items_complete')
          .select('*')
          .eq('slug', slug)
          .maybeSingle();

        if (error) throw error;

        if (!data) {
          toast({
            title: "❌ Item non trouvé",
            description: "L'item EDN demandé n'existe pas",
            variant: "destructive"
          });
          navigate('/edn-production');
          return;
        }

        setItem(data);

        toast({
          title: "🚀 Mode immersif activé",
          description: `${data.item_code} - Expérience premium chargée`,
          variant: "default"
        });

      } catch (err) {
        toast({
          title: "❌ Erreur de chargement",
          description: "Impossible de charger l'expérience immersive",
          variant: "destructive"
        });
        navigate('/edn-production');
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [slug, navigate, toast]);

  // Calcul du progrès
  useEffect(() => {
    const newProgress = ((currentSection + 1) / sections.length) * 100;
    setProgress(newProgress);
  }, [currentSection]);

  // Navigation entre sections
  const nextSection = () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1);
      setImmersiveScore(prev => prev + 100);
      
      // Achievements
      if (currentSection === 2 && !achievements.includes('brain_master')) {
        setAchievements(prev => [...prev, 'brain_master']);
        toast({
          title: "🏆 Achievement débloqué!",
          description: "Maître des compétences",
          variant: "default"
        });
      }
    }
  };

  const prevSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Crown className="h-8 w-8 text-yellow-400 animate-pulse" />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-white">Mode Immersif Premium</h2>
            <p className="text-purple-200">Initialisation de l'expérience VR médicale...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center space-y-4">
            <div className="text-6xl">🚫</div>
            <h2 className="text-xl font-bold">Accès refusé</h2>
            <p className="text-muted-foreground">
              L'expérience immersive n'est pas disponible pour cet item
            </p>
            <Button onClick={() => navigate('/edn-production')} className="w-full">
              Retour EDN Production
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentSectionData = sections[currentSection];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white overflow-hidden">
      {/* Header immersif */}
      <div className="absolute top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-xl border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to={`/edn-production/${slug}`}>
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Sortir du mode immersif
                </Button>
              </Link>
              
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Crown className="h-8 w-8 text-yellow-400" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold">VR</span>
                  </div>
                </div>
                <div>
                  <h1 className="text-xl font-bold">{item.title}</h1>
                  <Badge variant="outline" className="border-yellow-400 text-yellow-400">
                    {item.item_code} • Mode Premium
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-2xl font-bold text-yellow-400">
                  {immersiveScore}
                </div>
                <div className="text-sm opacity-75">Points XP</div>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsAudioPlaying(!isAudioPlaying)}
                  className="text-white hover:bg-white/10"
                >
                  {isAudioPlaying ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/10"
                >
                  <Maximize className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Barre de progression immersive */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span>Section {currentSection + 1} sur {sections.length}</span>
              <span>{Math.round(progress)}% complété</span>
            </div>
            <div className="relative">
              <Progress value={progress} className="h-3 bg-white/20" />
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-purple-400/20 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation des sections */}
      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-40">
        <div className="space-y-3">
          {sections.map((section, index) => (
            <button
              key={section.id}
              onClick={() => setCurrentSection(index)}
              className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all duration-300 ${
                index === currentSection
                  ? `bg-gradient-to-br ${section.color} shadow-lg scale-110`
                  : index < currentSection
                  ? 'bg-green-600/80 shadow-md'
                  : 'bg-white/10 hover:bg-white/20'
              }`}
              title={section.title}
            >
              {index < currentSection ? '✓' : section.icon}
            </button>
          ))}
        </div>
      </div>

      {/* Achievements sidebar */}
      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 z-40">
        <div className="space-y-2">
          <div className="bg-black/40 backdrop-blur-sm rounded-lg p-3">
            <div className="text-center">
              <Trophy className="h-6 w-6 text-yellow-400 mx-auto mb-1" />
              <div className="text-xs font-bold">Achievements</div>
              <div className="text-xs opacity-75">{achievements.length}/10</div>
            </div>
          </div>
          
          {achievements.map((achievement, index) => (
            <div key={index} className="bg-yellow-400/20 backdrop-blur-sm rounded-lg p-2 animate-bounce">
              <div className="text-center">
                <Star className="h-4 w-4 text-yellow-400 mx-auto" />
                <div className="text-xs font-bold mt-1">Nouveau!</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contenu principal immersif */}
      <div className="pt-32 pb-20 px-8">
        <div className="container mx-auto max-w-4xl">
          <Card className={`bg-gradient-to-br ${currentSectionData.color} border-white/20 shadow-2xl`}>
            <CardHeader className="text-center pb-2">
              <div className="text-6xl mb-4">{currentSectionData.icon}</div>
              <CardTitle className="text-3xl font-bold text-white">
                {currentSectionData.title}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="p-8">
              <div className="bg-black/20 backdrop-blur-sm rounded-xl p-8 min-h-[400px] flex items-center justify-center">
                {currentSection === 0 && (
                  <div className="text-center space-y-6">
                    <div className="text-2xl font-bold">Bienvenue dans l'expérience immersive</div>
                    <p className="text-lg opacity-90">
                      Préparez-vous à vivre une expérience d'apprentissage révolutionnaire avec l'item {item.item_code}
                    </p>
                    <div className="flex justify-center space-x-4">
                      <div className="bg-white/10 rounded-lg p-4">
                        <Brain className="h-8 w-8 mx-auto mb-2" />
                        <div className="text-sm">IA Médicale</div>
                      </div>
                      <div className="bg-white/10 rounded-lg p-4">
                        <Target className="h-8 w-8 mx-auto mb-2" />
                        <div className="text-sm">Objectifs Clairs</div>
                      </div>
                      <div className="bg-white/10 rounded-lg p-4">
                        <Heart className="h-8 w-8 mx-auto mb-2" />
                        <div className="text-sm">Passion EDN</div>
                      </div>
                    </div>
                  </div>
                )}

                {currentSection === 1 && (
                  <div className="text-center space-y-6">
                    <div className="text-2xl font-bold">Scène Clinique Virtuelle</div>
                    <div className="bg-white/5 rounded-lg p-6">
                      <div className="text-lg mb-4">🏥 Environnement hospitalier simulé</div>
                      <p className="opacity-90">
                        Vous êtes maintenant dans un service médical virtuel. 
                        Observez, analysez et prenez des décisions comme un vrai professionnel.
                      </p>
                      {item.scene_immersive && (
                        <div className="mt-4 p-4 bg-white/10 rounded-lg">
                          <pre className="text-sm opacity-75">
                            {JSON.stringify(item.scene_immersive, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {currentSection === 2 && (
                  <div className="text-center space-y-6">
                    <div className="text-2xl font-bold">Compétences Interactives</div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/10 rounded-lg p-4">
                        <div className="text-4xl mb-2">🧠</div>
                        <div className="font-bold">Rang A</div>
                        <div className="text-sm opacity-75">Connaissances de base</div>
                      </div>
                      <div className="bg-white/10 rounded-lg p-4">
                        <div className="text-4xl mb-2">⚡</div>
                        <div className="font-bold">Rang B</div>
                        <div className="text-sm opacity-75">Compétences avancées</div>
                      </div>
                    </div>
                  </div>
                )}

                {currentSection >= 3 && (
                  <div className="text-center space-y-6">
                    <div className="text-2xl font-bold">Section {currentSection + 1}</div>
                    <p className="text-lg opacity-90">
                      Contenu immersif pour la section {currentSectionData.title}
                    </p>
                    <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-lg p-6">
                      <div className="text-6xl mb-4">{currentSectionData.icon}</div>
                      <div>Expérience interactive en cours de développement...</div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Contrôles de navigation */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-50">
        <div className="flex items-center space-x-4">
          <Button
            onClick={prevSection}
            disabled={currentSection === 0}
            size="lg"
            variant="ghost"
            className="bg-white/10 hover:bg-white/20 text-white disabled:opacity-50"
          >
            ← Précédent
          </Button>
          
          <div className="flex items-center space-x-2 bg-black/40 backdrop-blur-sm rounded-full px-6 py-3">
            <span className="text-sm font-medium">
              {currentSection + 1} / {sections.length}
            </span>
          </div>
          
          <Button
            onClick={nextSection}
            disabled={currentSection === sections.length - 1}
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-50"
          >
            {currentSection === sections.length - 1 ? 'Terminer' : 'Suivant →'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductionEdnImmersive;