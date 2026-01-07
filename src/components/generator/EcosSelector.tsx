import React, { useEffect, useState, useMemo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TranslatedText } from '@/components/TranslatedText';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Stethoscope, Search } from 'lucide-react';
import { toast } from 'sonner';

interface EcosSelectorProps {
  selectedSituation: string;
  setSelectedSituation: (situation: string) => void;
}

interface EcosScenario {
  id: string;
  scenario_code: string;
  title: string;
  speciality: string;
  clinical_case: string;
  difficulty_level: string;
}

export const EcosSelector: React.FC<EcosSelectorProps> = ({
  selectedSituation,
  setSelectedSituation
}) => {
  const [scenarios, setScenarios] = useState<EcosScenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Filtrer les scénarios par recherche
  const filteredScenarios = useMemo(() => {
    if (!searchQuery.trim()) return scenarios;
    const query = searchQuery.toLowerCase();
    return scenarios.filter(s => 
      s.scenario_code.toLowerCase().includes(query) ||
      s.title.toLowerCase().includes(query) ||
      s.speciality.toLowerCase().includes(query)
    );
  }, [scenarios, searchQuery]);

  useEffect(() => {
    loadScenarios();
  }, []);

  const loadScenarios = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('ecos_scenarios')
        .select('id, scenario_code, title, speciality, clinical_case, difficulty_level')
        .eq('is_active', true)
        .order('scenario_code')
        .limit(50);

      if (error) throw error;

      setScenarios(data || []);
    } catch (err) {
      console.error('Erreur chargement ECOS:', err);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'facile': return 'bg-success text-success-foreground';
      case 'moyen': return 'bg-warning text-warning-foreground';
      case 'difficile': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <label className="text-lg font-semibold text-foreground">
          <TranslatedText text="Scénario ECOS" />
        </label>
        <div className="flex items-center justify-center h-14 bg-card/50 backdrop-blur-sm border border-border/30 rounded-lg">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span className="ml-2 text-sm text-muted-foreground">Chargement des scénarios...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-lg font-semibold text-foreground">
          <TranslatedText text="Scénario ECOS" />
        </label>
        <Badge variant="secondary" className="text-xs">
          {scenarios.length} scénarios disponibles
        </Badge>
      </div>
      
      {/* Barre de recherche */}
      <div className="relative mb-2">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher un scénario..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 h-10 bg-card/50"
        />
      </div>
      
      <Select value={selectedSituation} onValueChange={setSelectedSituation}>
        <SelectTrigger className="h-14 text-base bg-card/50 backdrop-blur-sm border-border/30 shadow-lg">
          <SelectValue placeholder="Sélectionnez un scénario ECOS" />
        </SelectTrigger>
        <SelectContent className="bg-card/95 backdrop-blur-xl border-border/30 shadow-2xl max-h-[400px]">
          {filteredScenarios.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              Aucun scénario disponible
            </div>
          ) : (
            filteredScenarios.map((scenario) => (
              <SelectItem 
                key={scenario.id} 
                value={scenario.scenario_code} 
                className="text-base py-3"
              >
                <div className="flex items-center gap-2">
                  <Badge 
                    variant="outline" 
                    className={`text-xs shrink-0 ${getDifficultyColor(scenario.difficulty_level)}`}
                  >
                    {scenario.scenario_code}
                  </Badge>
                  <span className="truncate">{scenario.title}</span>
                  <Badge variant="secondary" className="text-xs ml-auto shrink-0">
                    {scenario.speciality}
                  </Badge>
                </div>
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>

      {selectedSituation && (
        <div className="mt-4 p-4 bg-card/30 backdrop-blur-sm rounded-lg border border-border/20">
          {(() => {
            const selected = scenarios.find(s => s.scenario_code === selectedSituation);
            if (!selected) return null;

            return (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Stethoscope className="h-5 w-5 text-primary" />
                  <p className="text-base font-semibold text-foreground">
                    {selected.scenario_code} - {selected.title}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-xs">
                    {selected.speciality}
                  </Badge>
                  <Badge className={`text-xs ${getDifficultyColor(selected.difficulty_level)}`}>
                    {selected.difficulty_level}
                  </Badge>
                </div>

                {selected.clinical_case && (
                  <p className="text-sm text-muted-foreground italic">
                    "{selected.clinical_case}"
                  </p>
                )}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};