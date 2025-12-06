import React, { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TranslatedText } from '@/components/TranslatedText';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface EcosSelectorProps {
  selectedSituation: string;
  setSelectedSituation: (situation: string) => void;
  onEnrichWithAI?: (situationId: string) => void;
}

interface EcosSituation {
  sd_id: number;
  intitule_sd: string;
  competences_associees?: string[];
}

export const EcosSelector: React.FC<EcosSelectorProps> = ({
  selectedSituation,
  setSelectedSituation,
  onEnrichWithAI
}) => {
  const [situations, setSituations] = useState<EcosSituation[]>([]);
  const [loading, setLoading] = useState(true);
  const [enriching, setEnriching] = useState<string | null>(null);

  useEffect(() => {
    loadSituations();
  }, []);

  const loadSituations = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('ecos_situations_uness')
        .select('sd_id, intitule_sd, competences_associees')
        .order('sd_id')
        .limit(50); // Charger les 50 premières situations

      if (error) throw error;

      setSituations(data || []);
    } catch (error) {
      console.error('Erreur chargement situations ECOS:', error);
      toast.error('Erreur lors du chargement des situations ECOS');
    } finally {
      setLoading(false);
    }
  };

  const handleEnrichWithAI = async (sdId: number) => {
    try {
      setEnriching(sdId.toString());
      toast.info('Enrichissement IA en cours... Cela peut prendre 30-60 secondes.');

      const { data, error } = await supabase.functions.invoke('ecos-enrich-ai', {
        body: { 
          situation_id: sdId,
          enrich_type: 'complet'
        }
      });

      if (error) throw error;

      toast.success('Situation enrichie avec succès !');
      await loadSituations(); // Recharger pour afficher l'icône enrichie
      
      if (onEnrichWithAI) {
        onEnrichWithAI(sdId.toString());
      }
    } catch (error: any) {
      console.error('Erreur enrichissement IA:', error);
      toast.error(`Erreur: ${error.message || 'Échec de l\'enrichissement IA'}`);
    } finally {
      setEnriching(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <label className="text-lg font-semibold text-foreground">
          <TranslatedText text="Situation ECOS" />
        </label>
        <div className="flex items-center justify-center h-14 bg-card/50 backdrop-blur-sm border border-border/30 rounded-lg">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span className="ml-2 text-sm text-muted-foreground">Chargement des situations...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-lg font-semibold text-foreground">
          <TranslatedText text="Situation ECOS" />
        </label>
        <Badge variant="secondary" className="text-xs">
          {situations.length} situations disponibles
        </Badge>
      </div>
      
      <Select value={selectedSituation} onValueChange={setSelectedSituation}>
        <SelectTrigger className="h-14 text-base bg-card/50 backdrop-blur-sm border-border/30 shadow-lg">
          <SelectValue placeholder="Sélectionnez une situation ECOS officielle" />
        </SelectTrigger>
        <SelectContent className="bg-card/95 backdrop-blur-xl border-border/30 shadow-2xl max-h-[400px]">
          {situations.map((situation) => (
            <SelectItem 
              key={situation.sd_id} 
              value={situation.sd_id.toString()} 
              className="text-base py-3"
            >
              <div className="flex items-center justify-between w-full">
                <span className="flex-1">
                  <span className="font-semibold">SD{situation.sd_id}</span> - {situation.intitule_sd}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selectedSituation && (
        <div className="mt-4 p-4 bg-card/30 backdrop-blur-sm rounded-lg border border-border/20">
          {(() => {
            const selected = situations.find(s => s.sd_id.toString() === selectedSituation);
            if (!selected) return null;

            return (
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Situation sélectionnée:</p>
                  <p className="text-base font-semibold text-foreground">
                    SD{selected.sd_id} - {selected.intitule_sd}
                  </p>
                </div>

                {selected.competences_associees && selected.competences_associees.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Compétences:</p>
                    <div className="flex flex-wrap gap-1">
                      {selected.competences_associees.slice(0, 3).map((comp, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {comp}
                        </Badge>
                      ))}
                      {selected.competences_associees.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{selected.competences_associees.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={() => handleEnrichWithAI(selected.sd_id)}
                  disabled={!!enriching}
                >
                  {enriching === selected.sd_id.toString() ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Enrichissement IA en cours...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Enrichir avec l'IA OpenAI
                    </>
                  )}
                </Button>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};