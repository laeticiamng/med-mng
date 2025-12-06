
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Stethoscope, Search, Users, Clock, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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

  useEffect(() => {
    loadEcosScenarios();
  }, []);

  const loadEcosScenarios = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('ecos_situations_uness')
        .select('sd_id, intitule_sd, competences_associees, contenu_complet_html')
        .order('sd_id')
        .limit(100); // Charger les 100 premières situations

      if (error) {
        console.error('Erreur Supabase:', error);
        throw error;
      }

      console.log('✅ Situations ECOS chargées:', data?.length || 0);
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

  // Fonction pour extraire un aperçu du contenu HTML
  const getDescription = (html: string): string => {
    const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    return text.substring(0, 120) + (text.length > 120 ? '...' : '');
  };

  // Fonction pour déterminer le type basé sur les compétences
  const getScenarioType = (competences?: string[]): string => {
    if (!competences || competences.length === 0) return 'Consultation';
    
    const competencesText = competences.join(' ').toLowerCase();
    if (competencesText.includes('urgence') || competencesText.includes('aigu')) return 'Urgence';
    if (competencesText.includes('suivi') || competencesText.includes('grossesse')) return 'Suivi';
    if (competencesText.includes('prévention')) return 'Prévention';
    
    return 'Consultation';
  };

  // Fonction pour obtenir la spécialité principale
  const getSpecialty = (competences?: string[]): string => {
    if (!competences || competences.length === 0) return 'Médecine générale';
    return competences[0] || 'Médecine générale';
  };

  // Estimer la durée basée sur la longueur du contenu
  const estimateDuration = (html: string): string => {
    const textLength = html.replace(/<[^>]*>/g, '').length;
    const minutes = Math.max(10, Math.min(20, Math.round(textLength / 200)));
    return `${minutes} min`;
  };

  const filteredScenarios = ecosScenarios.filter(scenario =>
    scenario.intitule_sd.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getSpecialty(scenario.competences_associees).toLowerCase().includes(searchTerm.toLowerCase()) ||
    getDescription(scenario.contenu_complet_html).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Urgence': return 'text-destructive bg-destructive/10';
      case 'Consultation': return 'text-primary bg-primary/10';
      case 'Suivi': return 'text-accent bg-accent/10';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-primary/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="bg-card/80 backdrop-blur-sm border-b border-border">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <Link to="/" className="flex items-center gap-3 text-foreground hover:text-primary transition-colors">
                <Stethoscope className="h-8 w-8" />
                <span className="text-2xl font-bold">Situations ECOS</span>
              </Link>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Rechercher une situation..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="container mx-auto px-4 py-12">
          {/* Hero section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 mb-6">
              <Sparkles className="h-6 w-6 text-accent animate-pulse" />
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Situations ECOS
              </h1>
              <Sparkles className="h-6 w-6 text-primary animate-pulse" />
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-4">
              Pratiquez les situations de départ ECOS avec des patients virtuels immersifs
            </p>
            {!loading && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/30 rounded-full">
                <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
                <span className="text-accent-foreground font-medium text-sm">
                  {ecosScenarios.length} situations officielles UNESS disponibles
                </span>
              </div>
            )}
          </div>

          {/* Loading state */}
          {loading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <span className="ml-4 text-xl text-muted-foreground">Chargement des situations ECOS...</span>
            </div>
          )}

          {/* Scenarios grid */}
          {!loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredScenarios.map((scenario, index) => {
                const scenarioType = getScenarioType(scenario.competences_associees);
                const specialty = getSpecialty(scenario.competences_associees);
                const duration = estimateDuration(scenario.contenu_complet_html);
                const description = getDescription(scenario.contenu_complet_html);
                
                return (
                  <Link
                    key={scenario.sd_id}
                    to={`/ecos/sd-${scenario.sd_id.toString().padStart(3, '0')}-${scenario.intitule_sd.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`}
                    className="group"
                  >
                    <div className="bg-card backdrop-blur-sm rounded-2xl p-6 border border-border hover:border-primary/50 transition-all duration-300 hover:scale-105 hover:shadow-lg animate-fade-in"
                         style={{ animationDelay: `${index * 0.05}s` }}>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold text-sm">
                            SD{scenario.sd_id}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-foreground font-semibold text-lg group-hover:text-primary transition-colors line-clamp-1">
                              {scenario.intitule_sd}
                            </h3>
                            <p className="text-muted-foreground text-sm line-clamp-1">{specialty}</p>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                        {description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(scenarioType)}`}>
                            {scenarioType}
                          </span>
                          <div className="flex items-center gap-1 text-muted-foreground text-xs">
                            <Clock className="h-3 w-3" />
                            {duration}
                          </div>
                        </div>
                        <Users className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Empty state - no data */}
          {!loading && ecosScenarios.length === 0 && searchTerm === '' && (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                  <Stethoscope className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold text-foreground mb-3">Aucune situation ECOS disponible</h3>
                <p className="text-muted-foreground mb-6">
                  Les situations ECOS doivent d'abord être extraites depuis la plateforme UNESS.
                </p>
                <Link to="/admin/extract-ecos">
                  <Button>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Extraire les situations ECOS
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Empty state - search results */}
          {!loading && filteredScenarios.length === 0 && searchTerm !== '' && (
            <div className="text-center py-16">
              <Search className="h-16 w-16 text-muted-foreground/20 mx-auto mb-4" />
              <h3 className="text-xl text-muted-foreground mb-2">Aucune situation trouvée</h3>
              <p className="text-muted-foreground">Essayez de modifier votre recherche</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setSearchTerm('')}
              >
                Réinitialiser la recherche
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EcosIndex;
