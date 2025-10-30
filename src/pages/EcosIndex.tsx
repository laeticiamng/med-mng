
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
      case 'Urgence': return 'text-red-400 bg-red-400/10';
      case 'Consultation': return 'text-blue-400 bg-blue-400/10';
      case 'Suivi': return 'text-green-400 bg-green-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-teal-900 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-emerald-400/30 rounded-full animate-pulse"
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
        <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <Link to="/" className="flex items-center gap-3 text-white hover:text-emerald-300 transition-colors">
                <Stethoscope className="h-8 w-8" />
                <span className="text-2xl font-bold">DocFlemme ECOS</span>
              </Link>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 h-4 w-4" />
                  <Input
                    placeholder="Rechercher une situation..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:bg-white/20"
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
              <Sparkles className="h-6 w-6 text-emerald-400 animate-pulse" />
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                Situations ECOS
              </h1>
              <Sparkles className="h-6 w-6 text-teal-400 animate-pulse" />
            </div>
            <p className="text-xl text-white/70 max-w-2xl mx-auto mb-4">
              Pratiquez les situations de départ ECOS avec des patients virtuels immersifs
            </p>
            {!loading && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 border border-emerald-400/30 rounded-full">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-emerald-300 font-medium text-sm">
                  {ecosScenarios.length} situations officielles UNESS disponibles
                </span>
              </div>
            )}
          </div>

          {/* Loading state */}
          {loading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-12 w-12 animate-spin text-emerald-400" />
              <span className="ml-4 text-xl text-white/60">Chargement des situations ECOS...</span>
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
                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 hover:border-emerald-400/30 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/10 animate-fade-in"
                         style={{ animationDelay: `${index * 0.05}s` }}>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm">
                            SD{scenario.sd_id}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-white font-semibold text-lg group-hover:text-emerald-300 transition-colors line-clamp-1">
                              {scenario.intitule_sd}
                            </h3>
                            <p className="text-white/60 text-sm line-clamp-1">{specialty}</p>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-white/70 text-sm mb-4 line-clamp-2">
                        {description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(scenarioType)}`}>
                            {scenarioType}
                          </span>
                          <div className="flex items-center gap-1 text-white/40 text-xs">
                            <Clock className="h-3 w-3" />
                            {duration}
                          </div>
                        </div>
                        <Users className="h-4 w-4 text-white/40 group-hover:text-emerald-400 transition-colors" />
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
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Stethoscope className="h-10 w-10 text-emerald-400" />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-3">Aucune situation ECOS disponible</h3>
                <p className="text-white/60 mb-6">
                  Les situations ECOS doivent d'abord être extraites depuis la plateforme UNESS.
                </p>
                <Link to="/admin/extract-ecos">
                  <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">
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
              <Search className="h-16 w-16 text-white/20 mx-auto mb-4" />
              <h3 className="text-xl text-white/60 mb-2">Aucune situation trouvée</h3>
              <p className="text-white/40">Essayez de modifier votre recherche</p>
              <Button 
                variant="outline" 
                className="mt-4 border-white/20 text-white hover:bg-white/10"
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
