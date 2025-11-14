/**
 * Modal de recherche avancée pour les items EDN
 * Inclut filtres multi-critères et sauvegarde des favoris
 */

import React, { useState } from 'react';
import { Search, X, Save, Star, Trash2, Filter } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import type { AdvancedFilters, DifficultyLevel, ProgressStatus } from '@/types/advancedFilters';

interface AdvancedSearchModalProps {
  filters: AdvancedFilters;
  onFiltersChange: (filters: Partial<AdvancedFilters>) => void;
  onReset: () => void;
  onSave: (name: string, isFavorite: boolean) => void;
  savedFilters: Array<{
    id: string;
    name: string;
    isFavorite: boolean;
  }>;
  onLoadFilter: (id: string) => void;
  onDeleteFilter: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  availableSpecialites: string[];
  availableDomaines: string[];
  resultsCount: number;
}

export const AdvancedSearchModal: React.FC<AdvancedSearchModalProps> = ({
  filters,
  onFiltersChange,
  onReset,
  onSave,
  savedFilters,
  onLoadFilter,
  onDeleteFilter,
  onToggleFavorite,
  availableSpecialites,
  availableDomaines,
  resultsCount,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filterName, setFilterName] = useState('');
  const [showSaveForm, setShowSaveForm] = useState(false);
  const { toast } = useToast();

  const handleSave = () => {
    if (!filterName.trim()) {
      toast({
        title: 'Nom requis',
        description: 'Veuillez donner un nom à votre filtre',
        variant: 'destructive',
      });
      return;
    }

    onSave(filterName, false);
    setFilterName('');
    setShowSaveForm(false);
    toast({
      title: '✅ Filtre sauvegardé',
      description: `Le filtre "${filterName}" a été sauvegardé`,
    });
  };

  const handleLoadFilter = (id: string, name: string) => {
    onLoadFilter(id);
    toast({
      title: '✅ Filtre chargé',
      description: `Filtre "${name}" appliqué`,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Filter className="h-4 w-4" />
          Recherche avancée
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Recherche avancée
          </DialogTitle>
          <DialogDescription>
            Affinez votre recherche avec des filtres multi-critères
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="space-y-6">
            {/* Filtres sauvegardés */}
            {savedFilters.length > 0 && (
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Filtres sauvegardés</Label>
                <div className="flex flex-wrap gap-2">
                  {savedFilters.map(saved => (
                    <Badge
                      key={saved.id}
                      variant="outline"
                      className="cursor-pointer hover:bg-accent gap-2 pr-1"
                    >
                      <span onClick={() => handleLoadFilter(saved.id, saved.name)}>
                        {saved.name}
                      </span>
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleFavorite(saved.id);
                          }}
                          className="hover:text-warning"
                        >
                          <Star
                            className={`h-3 w-3 ${saved.isFavorite ? 'fill-warning text-warning' : ''}`}
                          />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteFilter(saved.id);
                          }}
                          className="hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </Badge>
                  ))}
                </div>
                <Separator />
              </div>
            )}

            {/* Catégories */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="specialite">Spécialité</Label>
                <Select
                  value={filters.specialite || 'all'}
                  onValueChange={(value) =>
                    onFiltersChange({ specialite: value === 'all' ? undefined : value })
                  }
                >
                  <SelectTrigger id="specialite">
                    <SelectValue placeholder="Toutes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes</SelectItem>
                    {availableSpecialites.map(spec => (
                      <SelectItem key={spec} value={spec}>
                        {spec}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="domaine">Domaine médical</Label>
                <Select
                  value={filters.domaineMedical || 'all'}
                  onValueChange={(value) =>
                    onFiltersChange({ domaineMedical: value === 'all' ? undefined : value })
                  }
                >
                  <SelectTrigger id="domaine">
                    <SelectValue placeholder="Tous" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    {availableDomaines.map(dom => (
                      <SelectItem key={dom} value={dom}>
                        {dom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            {/* Difficulté et statut */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulté</Label>
                <Select
                  value={filters.difficulty}
                  onValueChange={(value: DifficultyLevel) =>
                    onFiltersChange({ difficulty: value })
                  }
                >
                  <SelectTrigger id="difficulty">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes</SelectItem>
                    <SelectItem value="easy">Facile</SelectItem>
                    <SelectItem value="medium">Moyen</SelectItem>
                    <SelectItem value="hard">Difficile</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Statut de progression</Label>
                <Select
                  value={filters.progressStatus}
                  onValueChange={(value: ProgressStatus) =>
                    onFiltersChange({ progressStatus: value })
                  }
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="not-started">Non commencé</SelectItem>
                    <SelectItem value="in-progress">En cours</SelectItem>
                    <SelectItem value="completed">Terminé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            {/* Temps de lecture */}
            <div className="space-y-4">
              <Label>
                Temps de lecture estimé: {filters.readingTimeMin}-{filters.readingTimeMax} min
              </Label>
              <Slider
                value={[filters.readingTimeMin, filters.readingTimeMax]}
                onValueChange={([min, max]) =>
                  onFiltersChange({ readingTimeMin: min, readingTimeMax: max })
                }
                min={5}
                max={60}
                step={5}
                className="w-full"
              />
            </div>

            <Separator />

            {/* Score de complétude */}
            <div className="space-y-4">
              <Label>
                Score de complétude minimum: {filters.minCompletenessScore}%
              </Label>
              <Slider
                value={[filters.minCompletenessScore]}
                onValueChange={([value]) =>
                  onFiltersChange({ minCompletenessScore: value })
                }
                min={0}
                max={100}
                step={10}
                className="w-full"
              />
            </div>

            <Separator />

            {/* Contenu disponible */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Contenu disponible</Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasMusic"
                    checked={filters.hasMusic}
                    onCheckedChange={(checked) =>
                      onFiltersChange({ hasMusic: checked as boolean })
                    }
                  />
                  <Label htmlFor="hasMusic" className="cursor-pointer">
                    🎵 Musique
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasQuiz"
                    checked={filters.hasQuiz}
                    onCheckedChange={(checked) =>
                      onFiltersChange({ hasQuiz: checked as boolean })
                    }
                  />
                  <Label htmlFor="hasQuiz" className="cursor-pointer">
                    ❓ Quiz
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasBD"
                    checked={filters.hasBD}
                    onCheckedChange={(checked) =>
                      onFiltersChange({ hasBD: checked as boolean })
                    }
                  />
                  <Label htmlFor="hasBD" className="cursor-pointer">
                    📖 Scène immersive
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasTableauA"
                    checked={filters.hasTableauA}
                    onCheckedChange={(checked) =>
                      onFiltersChange({ hasTableauA: checked as boolean })
                    }
                  />
                  <Label htmlFor="hasTableauA" className="cursor-pointer">
                    📊 Tableau Rang A
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasTableauB"
                    checked={filters.hasTableauB}
                    onCheckedChange={(checked) =>
                      onFiltersChange({ hasTableauB: checked as boolean })
                    }
                  />
                  <Label htmlFor="hasTableauB" className="cursor-pointer">
                    📊 Tableau Rang B
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isValidated"
                    checked={filters.isValidated === true}
                    onCheckedChange={(checked) =>
                      onFiltersChange({ isValidated: checked ? true : null })
                    }
                  />
                  <Label htmlFor="isValidated" className="cursor-pointer">
                    ✅ Validé
                  </Label>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Footer avec actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            {resultsCount} résultat{resultsCount !== 1 ? 's' : ''}
          </div>

          <div className="flex gap-2">
            {!showSaveForm ? (
              <>
                <Button variant="outline" onClick={onReset}>
                  <X className="h-4 w-4 mr-2" />
                  Réinitialiser
                </Button>
                <Button variant="outline" onClick={() => setShowSaveForm(true)}>
                  <Save className="h-4 w-4 mr-2" />
                  Sauvegarder
                </Button>
                <Button onClick={() => setIsOpen(false)}>
                  Appliquer
                </Button>
              </>
            ) : (
              <>
                <Input
                  placeholder="Nom du filtre..."
                  value={filterName}
                  onChange={(e) => setFilterName(e.target.value)}
                  className="w-48"
                />
                <Button variant="outline" onClick={() => setShowSaveForm(false)}>
                  Annuler
                </Button>
                <Button onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Enregistrer
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
