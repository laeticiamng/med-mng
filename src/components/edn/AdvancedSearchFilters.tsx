import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { 
  Search, 
  Filter, 
  X, 
  Star, 
  Calendar, 
  Clock, 
  Target, 
  Brain,
  Heart,
  Stethoscope,
  Pill,
  Microscope,
  Activity,
  Eye,
  Ear,
  Baby,
  Users
} from 'lucide-react';

interface FilterState {
  searchTerm: string;
  specialty: string[];
  difficulty: number[];
  completionStatus: string[];
  musicAvailable: boolean;
  lastUpdated: string;
  scoreRange: number[];
  studyTime: number[];
  tags: string[];
}

interface Specialty {
  id: string;
  name: string;
  icon: React.ElementType;
  itemCount: number;
  color: string;
}

export const AdvancedSearchFilters: React.FC<{
  onFiltersChange: (filters: FilterState) => void;
  totalResults: number;
}> = ({ onFiltersChange, totalResults }) => {
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: '',
    specialty: [],
    difficulty: [1, 5],
    completionStatus: [],
    musicAvailable: false,
    lastUpdated: 'all',
    scoreRange: [0, 100],
    studyTime: [5, 120],
    tags: []
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  const specialties: Specialty[] = [
    { id: 'cardio', name: 'Cardiologie', icon: Heart, itemCount: 24, color: 'text-red-500' },
    { id: 'neuro', name: 'Neurologie', icon: Brain, itemCount: 18, color: 'text-purple-500' },
    { id: 'pneumo', name: 'Pneumologie', icon: Activity, itemCount: 15, color: 'text-blue-500' },
    { id: 'gastro', name: 'Gastroentérologie', icon: Stethoscope, itemCount: 21, color: 'text-green-500' },
    { id: 'pediatrie', name: 'Pédiatrie', icon: Baby, itemCount: 12, color: 'text-pink-500' },
    { id: 'psychiatrie', name: 'Psychiatrie', icon: Users, itemCount: 16, color: 'text-indigo-500' },
    { id: 'ophtalmo', name: 'Ophtalmologie', icon: Eye, itemCount: 8, color: 'text-yellow-500' },
    { id: 'orl', name: 'ORL', icon: Ear, itemCount: 9, color: 'text-orange-500' },
    { id: 'pharmacologie', name: 'Pharmacologie', icon: Pill, itemCount: 19, color: 'text-cyan-500' },
    { id: 'anatomie', name: 'Anatomie', icon: Microscope, itemCount: 14, color: 'text-emerald-500' }
  ];

  const popularTags = [
    'Urgences', 'Diagnostic', 'Thérapeutique', 'Prévention', 
    'Épidémiologie', 'Physiopathologie', 'Clinique', 'Paraclinique',
    'Complications', 'Surveillance', 'Éducation', 'Pronostic'
  ];

  const updateFilters = (newFilters: Partial<FilterState>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFiltersChange(updatedFilters);
    
    // Compter les filtres actifs
    let count = 0;
    if (updatedFilters.searchTerm) count++;
    if (updatedFilters.specialty.length > 0) count++;
    if (updatedFilters.difficulty[0] !== 1 || updatedFilters.difficulty[1] !== 5) count++;
    if (updatedFilters.completionStatus.length > 0) count++;
    if (updatedFilters.musicAvailable) count++;
    if (updatedFilters.lastUpdated !== 'all') count++;
    if (updatedFilters.scoreRange[0] !== 0 || updatedFilters.scoreRange[1] !== 100) count++;
    if (updatedFilters.studyTime[0] !== 5 || updatedFilters.studyTime[1] !== 120) count++;
    if (updatedFilters.tags.length > 0) count++;
    
    setActiveFiltersCount(count);
  };

  const clearAllFilters = () => {
    const resetFilters: FilterState = {
      searchTerm: '',
      specialty: [],
      difficulty: [1, 5],
      completionStatus: [],
      musicAvailable: false,
      lastUpdated: 'all',
      scoreRange: [0, 100],
      studyTime: [5, 120],
      tags: []
    };
    setFilters(resetFilters);
    onFiltersChange(resetFilters);
    setActiveFiltersCount(0);
  };

  const toggleSpecialty = (specialtyId: string) => {
    const newSpecialties = filters.specialty.includes(specialtyId)
      ? filters.specialty.filter(id => id !== specialtyId)
      : [...filters.specialty, specialtyId];
    updateFilters({ specialty: newSpecialties });
  };

  const toggleTag = (tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter(t => t !== tag)
      : [...filters.tags, tag];
    updateFilters({ tags: newTags });
  };

  return (
    <Card className="bg-black/20 backdrop-blur-xl border border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Search className="h-5 w-5 text-blue-400" />
            Recherche Avancée
            {activeFiltersCount > 0 && (
              <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/30">
                {activeFiltersCount} filtre{activeFiltersCount > 1 ? 's' : ''}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-gray-300 border-gray-600">
              {totalResults} résultats
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-white border-white/20 hover:bg-white/10"
            >
              <Filter className="h-4 w-4 mr-1" />
              {showAdvanced ? 'Simple' : 'Avancé'}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Recherche textuelle */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Rechercher par titre, code, mots-clés..."
            value={filters.searchTerm}
            onChange={(e) => updateFilters({ searchTerm: e.target.value })}
            className="pl-10 bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-blue-400/50"
          />
        </div>

        {/* Spécialités médicales */}
        <div>
          <h4 className="text-white font-medium mb-3 flex items-center gap-2">
            <Stethoscope className="h-4 w-4 text-purple-400" />
            Spécialités Médicales
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
            {specialties.map((specialty) => (
              <Button
                key={specialty.id}
                variant={filters.specialty.includes(specialty.id) ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleSpecialty(specialty.id)}
                className={`justify-start text-xs h-8 ${
                  filters.specialty.includes(specialty.id)
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                    : 'text-gray-300 border-gray-600 hover:bg-white/10'
                }`}
              >
                <specialty.icon className={`h-3 w-3 mr-1 ${specialty.color}`} />
                {specialty.name}
                <Badge variant="secondary" className="ml-1 text-xs">
                  {specialty.itemCount}
                </Badge>
              </Button>
            ))}
          </div>
        </div>

        {showAdvanced && (
          <>
            {/* Filtres de statut */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-white font-medium mb-3">Statut de Completion</h4>
                <div className="space-y-2">
                  {[
                    { id: 'completed', label: 'Complété', icon: '✅' },
                    { id: 'in-progress', label: 'En cours', icon: '🔄' },
                    { id: 'not-started', label: 'Pas commencé', icon: '⭕' },
                    { id: 'reviewed', label: 'Révisé', icon: '📚' }
                  ].map((status) => (
                    <div key={status.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={status.id}
                        checked={filters.completionStatus.includes(status.id)}
                        onCheckedChange={(checked) => {
                          const newStatuses = checked
                            ? [...filters.completionStatus, status.id]
                            : filters.completionStatus.filter(s => s !== status.id);
                          updateFilters({ completionStatus: newStatuses });
                        }}
                      />
                      <label htmlFor={status.id} className="text-white text-sm cursor-pointer">
                        {status.icon} {status.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-white font-medium mb-3">Options Avancées</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="musicAvailable"
                      checked={filters.musicAvailable}
                      onCheckedChange={(checked) => updateFilters({ musicAvailable: !!checked })}
                    />
                    <label htmlFor="musicAvailable" className="text-white text-sm cursor-pointer">
                      🎵 Paroles musicales disponibles
                    </label>
                  </div>

                  <div className="space-y-2">
                    <label className="text-white text-sm">Dernière mise à jour</label>
                    <Select 
                      value={filters.lastUpdated} 
                      onValueChange={(value) => updateFilters({ lastUpdated: value })}
                    >
                      <SelectTrigger className="bg-white/10 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-black/90 border-white/20 backdrop-blur-xl">
                        <SelectItem value="all" className="text-white hover:bg-white/10">Toute période</SelectItem>
                        <SelectItem value="today" className="text-white hover:bg-white/10">Aujourd'hui</SelectItem>
                        <SelectItem value="week" className="text-white hover:bg-white/10">Cette semaine</SelectItem>
                        <SelectItem value="month" className="text-white hover:bg-white/10">Ce mois</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* Sliders de plage */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-white text-sm mb-2 block">
                  Difficulté: {filters.difficulty[0]} - {filters.difficulty[1]} / 5
                </label>
                <Slider
                  value={filters.difficulty}
                  onValueChange={(value) => updateFilters({ difficulty: value })}
                  max={5}
                  min={1}
                  step={1}
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-white text-sm mb-2 block">
                  Score: {filters.scoreRange[0]}% - {filters.scoreRange[1]}%
                </label>
                <Slider
                  value={filters.scoreRange}
                  onValueChange={(value) => updateFilters({ scoreRange: value })}
                  max={100}
                  min={0}
                  step={5}
                  className="w-full"
                />
              </div>
            </div>

            <div>
              <label className="text-white text-sm mb-2 block">
                Temps d'étude estimé: {filters.studyTime[0]} - {filters.studyTime[1]} min
              </label>
              <Slider
                value={filters.studyTime}
                onValueChange={(value) => updateFilters({ studyTime: value })}
                max={120}
                min={5}
                step={5}
                className="w-full"
              />
            </div>

            {/* Tags populaires */}
            <div>
              <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                <Target className="h-4 w-4 text-green-400" />
                Tags Populaires
              </h4>
              <div className="flex flex-wrap gap-2">
                {popularTags.map((tag) => (
                  <Button
                    key={tag}
                    variant={filters.tags.includes(tag) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleTag(tag)}
                    className={`h-7 text-xs ${
                      filters.tags.includes(tag)
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white'
                        : 'text-gray-300 border-gray-600 hover:bg-white/10'
                    }`}
                  >
                    #{tag}
                  </Button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <div className="flex items-center gap-2">
            {activeFiltersCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllFilters}
                className="text-white border-white/20 hover:bg-white/10"
              >
                <X className="h-4 w-4 mr-1" />
                Effacer tout
              </Button>
            )}
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Clock className="h-4 w-4" />
            Recherche instantanée
          </div>
        </div>
      </CardContent>
    </Card>
  );
};