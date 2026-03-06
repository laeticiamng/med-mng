import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Stethoscope, Search, Users, Clock, Sparkles, Loader2, Flame, Trophy, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { MVPFooter } from '@/components/layout/MVPFooter';
import { SEOHead } from '@/components/seo/SEOHead';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ROUTE_PATHS } from '@/config/routes';
import { useGamification } from '@/hooks/useGamification';
import { useActivityTracking } from '@/hooks/useActivityTracking';

interface EcosScenario {
  sd_id: number;
  intitule_sd: string;
  competences_associees?: string[];
  contenu_complet_html: string;
}

const EcosIndex = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [ecosScenarios, setEcosScenarios] = useState<EcosScenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const { stats, loadStats } = useGamification();
  const { logActivity } = useActivityTracking();

  useEffect(() => {
    loadEcosScenarios();
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        loadStats(user.id);
        // Track page view
        logActivity({ activity_type: 'study', metadata: { action: 'ecos_index_view' } });
      }
    };
    checkUser();
  }, [loadStats, logActivity]);

  const loadEcosScenarios = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('ecos_situations_uness')
        .select('sd_id, intitule_sd, competences_associees, contenu_complet_html')
        .order('sd_id')
        .limit(100);

      if (error) {
        console.error('Erreur Supabase:', error);
        throw error;
      }

      if (import.meta.env.DEV) console.log('✅ Situations ECOS chargées:', data?.length || 0);
      setEcosScenarios(data || []);

      if (!data || data.length === 0) {
        toast.info('Aucune situation ECOS trouvée. Veuillez d\'abord extraire les données depuis UNESS.', {
          duration: 5000
        });
      }
    } catch (error: any) {
      console.error('Erreur chargement situations ECOS:', error);
      toast.error(`Erreur: ${error.message || 'Impossible de charger les situations'}`);
    } finally {
      setLoading(false);
    }
  };

  const getDescription = (html: string): string => {
    const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    return text.substring(0, 120) + (text.length > 120 ? '...' : '');
  };

  const filteredScenarios = ecosScenarios.filter(scenario =>
    scenario.intitule_sd?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleScenarioClick = (scenario: EcosScenario) => {
    if (user) {
      logActivity({ 
        activity_type: 'ecos', 
        metadata: { action: 'scenario_click', scenario_id: scenario.sd_id } 
      });
    }
  };

  return (
    <>
      <SEOHead
        title="Simulations ECOS"
        description="Entraînez-vous aux ECOS avec des situations cliniques réalistes. Préparez l'examen clinique en musique."
        keywords="ECOS, simulation, clinique, médecine, examen"
        canonical="/ecos"
      />
      <div className="min-h-screen relative overflow-hidden flex flex-col">
        {/* Animated gradient background */}
        <div className="fixed inset-0 bg-gradient-to-br from-background via-primary/5 to-accent/10 pointer-events-none -z-10" />
      
      {/* Floating orbs */}
      <motion.div 
        className="fixed top-20 left-10 w-72 h-72 rounded-full bg-primary/10 blur-3xl pointer-events-none -z-10"
        animate={{ x: [0, 50, 0], y: [0, 30, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="fixed bottom-20 right-10 w-96 h-96 rounded-full bg-accent/10 blur-3xl pointer-events-none -z-10"
        animate={{ x: [0, -40, 0], y: [0, -50, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 relative z-10">
        {/* Gamification Stats Banner Premium */}
        {user && stats && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="p-3 sm:p-4 mb-4 sm:mb-6 bg-card/60 backdrop-blur-xl border-border/50 rounded-2xl shadow-soft">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                <div className="flex items-center gap-3 sm:gap-6 flex-wrap">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Flame className="h-4 w-4 sm:h-5 sm:w-5 text-warning" />
                    <span className="font-medium text-sm sm:text-base">{stats.currentStreak} jours</span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    <span className="font-medium text-sm sm:text-base">Niveau {stats.level}</span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Star className="h-4 w-4 sm:h-5 sm:w-5 text-accent" />
                    <span className="font-medium text-sm sm:text-base">{stats.totalPoints} XP</span>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {stats.badges.slice(0, 3).map(badge => (
                    <Badge key={badge.id} variant="secondary" className="bg-accent/20 text-xs sm:text-sm backdrop-blur-sm">
                      {badge.icon} {badge.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Header Premium */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 sm:mb-12 px-2"
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 backdrop-blur-sm border border-primary/20 rounded-full px-4 py-2 mb-4">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Simulations ECOS</span>
          </div>
          
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <Stethoscope className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text">
              Simuler un ECOS
            </h1>
          </div>
          <p className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-2xl mx-auto">
            Mets-toi en situation. C'est le meilleur moyen d'être prêt le jour J.
          </p>
        </motion.div>

        {/* Search Premium */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="max-w-md mx-auto mb-6 sm:mb-8 px-2"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Rechercher une situation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 h-12 rounded-2xl border-border/50 bg-card/60 backdrop-blur-xl shadow-soft"
            />
          </div>
        </motion.div>

        {/* Stats */}
        <div className="flex justify-center gap-4 sm:gap-8 mb-6 sm:mb-8 flex-wrap">
          <div className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground text-sm sm:text-base">
            <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>{ecosScenarios.length} situations</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground text-sm sm:text-base">
            <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>~15 min/situation</span>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Chargement des situations ECOS...</p>
          </div>
        ) : filteredScenarios.length === 0 ? (
          <div className="text-center py-16">
            <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {searchTerm ? 'Aucun résultat' : 'Aucune situation disponible'}
            </h3>
            <p className="text-muted-foreground">
              {searchTerm 
                ? 'Essayez un autre terme de recherche'
                : 'Les situations ECOS seront bientôt disponibles'
              }
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredScenarios.map((scenario) => (
              <Link 
                key={scenario.sd_id}
                to={`/ecos/${scenario.sd_id}`}
                onClick={() => handleScenarioClick(scenario)}
              >
                <Card className="p-4 sm:p-6 hover:shadow-lg transition-all duration-300 hover:border-primary/50 h-full flex flex-col">
                  <div className="flex items-start gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10 shrink-0">
                      <Stethoscope className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground line-clamp-2">
                        {scenario.intitule_sd}
                      </h3>
                      <Badge variant="secondary" className="mt-2">
                        Situation {scenario.sd_id}
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground flex-1 line-clamp-3">
                    {getDescription(scenario.contenu_complet_html)}
                  </p>

                  {scenario.competences_associees && scenario.competences_associees.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1">
                      {scenario.competences_associees.slice(0, 3).map((comp, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {comp}
                        </Badge>
                      ))}
                      {scenario.competences_associees.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{scenario.competences_associees.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  <Button variant="ghost" className="mt-4 w-full">
                    Commencer →
                  </Button>
                </Card>
              </Link>
            ))}
          </div>
        )}
        <MVPFooter />
      </div>
    </div>
    </>
  );
};

export default EcosIndex;
