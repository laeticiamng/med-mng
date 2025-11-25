// ============================================================================
// Block Method (Méthode Blocs Profonds) View Component
// ============================================================================

import React, { useState, useMemo, useCallback, useTransition } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Target,
  CheckCircle2,
  Settings,
  TrendingUp,
  BookOpen,
  PlayCircle,
  Search,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';
import { TodayRevisionItem, BlockMethodConfigDB } from '@shared/types/revision-methods';
import { useRevisionMethods } from '@/hooks/useRevisionMethods';
import { toast } from 'sonner';

interface BlockMethodViewProps {
  todayItems: TodayRevisionItem[];
  blockConfig: BlockMethodConfigDB | null;
}

// Liste des items EDN disponibles (exemple)
const EDN_ITEMS_CATEGORIES = [
  {
    category: 'Cardiologie',
    items: [
      { code: 'IC-220', title: 'Insuffisance cardiaque' },
      { code: 'IC-221', title: 'Troubles du rythme' },
      { code: 'IC-222', title: 'Hypertension artérielle' },
      { code: 'IC-223', title: 'Cardiopathies ischémiques' },
      { code: 'IC-224', title: 'Valvulopathies' },
    ]
  },
  {
    category: 'Neurologie',
    items: [
      { code: 'IC-125', title: 'AVC' },
      { code: 'IC-126', title: 'Épilepsie' },
      { code: 'IC-127', title: 'Maladie de Parkinson' },
      { code: 'IC-128', title: 'Sclérose en plaques' },
    ]
  },
  {
    category: 'Pneumologie',
    items: [
      { code: 'IC-154', title: 'BPCO' },
      { code: 'IC-155', title: 'Asthme' },
      { code: 'IC-156', title: 'Pneumopathies infectieuses' },
      { code: 'IC-157', title: 'Cancer bronchique' },
    ]
  },
  {
    category: 'Gastro-entérologie',
    items: [
      { code: 'IC-180', title: 'Hépatites virales' },
      { code: 'IC-181', title: 'Cirrhose' },
      { code: 'IC-182', title: 'MICI' },
      { code: 'IC-183', title: 'Cancer colorectal' },
    ]
  },
  {
    category: 'Endocrinologie',
    items: [
      { code: 'IC-200', title: 'Diabète type 1' },
      { code: 'IC-201', title: 'Diabète type 2' },
      { code: 'IC-202', title: 'Dysthyroïdies' },
      { code: 'IC-203', title: 'Insuffisance surrénale' },
    ]
  }
];

export const BlockMethodView: React.FC<BlockMethodViewProps> = ({ todayItems, blockConfig }) => {
  const { createBlockConfig, completeRevision, loading } = useRevisionMethods();
  const [showConfigDialog, setShowConfigDialog] = useState(!blockConfig);
  const [itemsPerDay, setItemsPerDay] = useState(5);
  const [targetDate, setTargetDate] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  // État pour la sélection d'items
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  // Use React 18 transitions for better performance on bulk updates
  const [isPending, startTransition] = useTransition();

  // Filtrer les items par recherche
  const filteredCategories = useMemo(() => {
    if (!searchQuery) return EDN_ITEMS_CATEGORIES;

    const query = searchQuery.toLowerCase();
    return EDN_ITEMS_CATEGORIES.map(cat => ({
      ...cat,
      items: cat.items.filter(
        item =>
          item.code.toLowerCase().includes(query) ||
          item.title.toLowerCase().includes(query)
      )
    })).filter(cat => cat.items.length > 0);
  }, [searchQuery]);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  // Toggle item selection using React 18 transitions for better performance
  const toggleItem = useCallback((code: string) => {
    // Use startTransition to mark this as a non-urgent update
    // This allows React to interrupt the update if more urgent work comes in
    startTransition(() => {
      setSelectedItems(prev =>
        prev.includes(code)
          ? prev.filter(c => c !== code)
          : [...prev, code]
      );
    });
  }, []);

  // Select/deselect all items in a category using transitions
  // Uses filteredCategories to only affect visible items when search is active
  const selectAllInCategory = useCallback((category: string) => {
    const categoryData = filteredCategories.find(c => c.category === category);
    if (!categoryData) return;

    const categoryCodes = categoryData.items.map(i => i.code);

    // Use startTransition for non-urgent updates to avoid blocking the UI
    startTransition(() => {
      setSelectedItems(prev => {
        const allSelected = categoryCodes.every(code => prev.includes(code));

        if (allSelected) {
          // Remove all visible category items
          return prev.filter(code => !categoryCodes.includes(code));
        } else {
          // Add all visible category items
          return [...new Set([...prev, ...categoryCodes])];
        }
      });
    });
  }, [filteredCategories]);

  const handleCreateConfig = async () => {
    if (!targetDate) {
      toast.error('Veuillez sélectionner une date cible');
      return;
    }

    if (selectedItems.length === 0) {
      toast.error('Veuillez sélectionner au moins un item à réviser');
      return;
    }

    const result = await createBlockConfig({
      items_per_day: itemsPerDay,
      target_date: targetDate,
      selected_items: selectedItems
    });

    if (result.success) {
      setShowConfigDialog(false);
      toast.success(`Plan créé avec ${selectedItems.length} items`);
    }
  };

  const handleCompleteItem = async (revisionId: string) => {
    setProcessingId(revisionId);
    await completeRevision({
      revision_id: revisionId,
      success_rate: 100
    });
    setProcessingId(null);
  };

  const daysUntilTarget = blockConfig
    ? Math.ceil(
        (new Date(blockConfig.target_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      )
    : 0;

  const progressPercentage = blockConfig
    ? Math.min(
        100,
        Math.round(
          ((blockConfig.selected_items.length - todayItems.length) /
            blockConfig.selected_items.length) *
            100
        )
      )
    : 0;

  // Calculer le nombre de jours nécessaires
  const estimatedDays = targetDate
    ? Math.ceil((new Date(targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const ItemSelectionSection = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-medium">
          Sélection des items à réviser
        </Label>
        <Badge variant="outline">
          {selectedItems.length} sélectionné{selectedItems.length > 1 ? 's' : ''}
        </Badge>
      </div>

      {/* Barre de recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher un item (code ou titre)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
          </button>
        )}
      </div>

      {/* Items sélectionnés */}
      {selectedItems.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedItems.slice(0, 10).map(code => (
            <Badge
              key={code}
              variant="secondary"
              className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
              onClick={() => toggleItem(code)}
            >
              {code}
              <X className="h-3 w-3 ml-1" />
            </Badge>
          ))}
          {selectedItems.length > 10 && (
            <Badge variant="outline">
              +{selectedItems.length - 10} autres
            </Badge>
          )}
        </div>
      )}

      {/* Liste des catégories */}
      <ScrollArea className="h-[300px] border rounded-lg p-2">
        <div className="space-y-2">
          {filteredCategories.map((category) => {
            const isExpanded = expandedCategories.includes(category.category);
            const categorySelected = category.items.filter(i => selectedItems.includes(i.code)).length;
            const allSelected = categorySelected === category.items.length;

            return (
              <Collapsible
                key={category.category}
                open={isExpanded}
                onOpenChange={() => toggleCategory(category.category)}
              >
                <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={() => selectAllInCategory(category.category)}
                  />
                  <CollapsibleTrigger asChild>
                    <button className="flex items-center justify-between flex-1 text-left">
                      <span className="font-medium">{category.category}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {categorySelected}/{category.items.length}
                        </Badge>
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    </button>
                  </CollapsibleTrigger>
                </div>
                <CollapsibleContent className="pl-6 pt-2 space-y-1">
                  {category.items.map((item) => (
                    <div
                      key={item.code}
                      className="flex items-center gap-2 p-2 hover:bg-muted/30 rounded cursor-pointer"
                      onClick={() => toggleItem(item.code)}
                    >
                      <Checkbox
                        checked={selectedItems.includes(item.code)}
                        onCheckedChange={() => toggleItem(item.code)}
                      />
                      <span className="font-mono text-xs text-muted-foreground">{item.code}</span>
                      <span className="text-sm">{item.title}</span>
                    </div>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>
      </ScrollArea>

      {/* Actions rapides */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isPending}
          onClick={() => {
            startTransition(() => {
              // Select all visible items based on current filter
              const allCodes = filteredCategories.flatMap(c => c.items.map(i => i.code));
              setSelectedItems(prev => [...new Set([...prev, ...allCodes])]);
            });
          }}
        >
          {isPending ? 'Chargement...' : 'Tout sélectionner'}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isPending}
          onClick={() => startTransition(() => setSelectedItems([]))}
        >
          Tout désélectionner
        </Button>
      </div>
    </div>
  );

  if (!blockConfig) {
    return (
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Configuration Méthode Blocs Profonds
          </CardTitle>
          <CardDescription>
            Configure ton plan de révision en mode deep focus
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Tu n'as pas encore configuré la Méthode Blocs Profonds. Définis ton objectif quotidien,
            sélectionne les items à réviser et ta date cible pour commencer.
          </p>
          <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
            <DialogTrigger asChild>
              <Button className="w-full">
                <Settings className="h-4 w-4 mr-2" />
                Configurer la méthode
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Configuration Méthode Blocs Profonds</DialogTitle>
                <DialogDescription>
                  Définis ton rythme et sélectionne les items pour un apprentissage en profondeur
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Paramètres de base */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="itemsPerDay">
                      Items par jour
                      <span className="text-xs text-muted-foreground ml-2">(3-8 recommandé)</span>
                    </Label>
                    <Input
                      id="itemsPerDay"
                      type="number"
                      min={1}
                      max={20}
                      value={itemsPerDay}
                      onChange={(e) => setItemsPerDay(parseInt(e.target.value) || 5)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="targetDate">Date cible (examen)</Label>
                    <Input
                      id="targetDate"
                      type="date"
                      value={targetDate}
                      onChange={(e) => setTargetDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>

                {/* Estimation */}
                {targetDate && selectedItems.length > 0 && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-sm">
                    <p className="font-medium mb-2">Estimation :</p>
                    <div className="space-y-1 text-muted-foreground">
                      <p>
                        <strong>{selectedItems.length}</strong> items à réviser
                      </p>
                      <p>
                        <strong>{itemsPerDay}</strong> items/jour × <strong>{estimatedDays}</strong> jours = <strong>{itemsPerDay * estimatedDays}</strong> révisions possibles
                      </p>
                      {selectedItems.length > itemsPerDay * estimatedDays && (
                        <p className="text-amber-600 dark:text-amber-400">
                          ⚠️ Attention : vous avez sélectionné plus d'items que ce qui est possible avant la date cible
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Sélection des items */}
                <ItemSelectionSection />
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowConfigDialog(false)}>
                  Annuler
                </Button>
                <Button
                  onClick={handleCreateConfig}
                  disabled={loading || !targetDate || selectedItems.length === 0}
                >
                  {loading ? 'Création...' : `Créer le plan (${selectedItems.length} items)`}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with progress */}
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Méthode Blocs Profonds - Aujourd'hui
              </CardTitle>
              <CardDescription>
                {blockConfig.items_per_day} items/jour • Deep Focus Mode
              </CardDescription>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Modifier
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Modifier la configuration</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="editItemsPerDay">Items par jour</Label>
                      <Input
                        id="editItemsPerDay"
                        type="number"
                        min={1}
                        max={20}
                        defaultValue={blockConfig.items_per_day}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="editTargetDate">Date cible</Label>
                      <Input
                        id="editTargetDate"
                        type="date"
                        defaultValue={blockConfig.target_date}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Items actuels : {blockConfig.selected_items.length}
                  </p>
                </div>
                <DialogFooter>
                  <Button variant="outline">Annuler</Button>
                  <Button>Sauvegarder</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
              <p className="text-2xl font-bold text-purple-600">{todayItems.length}</p>
              <p className="text-xs text-muted-foreground">Items du jour</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
              <p className="text-2xl font-bold text-blue-600">{daysUntilTarget}</p>
              <p className="text-xs text-muted-foreground">Jours restants</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
              <p className="text-2xl font-bold text-green-600">{progressPercentage}%</p>
              <p className="text-xs text-muted-foreground">Progression</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Objectif : {new Date(blockConfig.target_date).toLocaleDateString('fr-FR')}</span>
              <span>{progressPercentage}%</span>
            </div>
            <Progress value={progressPercentage} className="w-full" />
          </div>
        </CardContent>
      </Card>

      {/* Today's Deep Focus Session */}
      {todayItems.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PlayCircle className="h-5 w-5" />
              Session Deep Focus du jour
            </CardTitle>
            <CardDescription>
              Concentre-toi sur ces {todayItems.length} items aujourd'hui. Prends ton temps pour
              bien les comprendre.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {todayItems.map((item, index) => (
              <Card key={item.id} className="border-purple-200 dark:border-purple-800">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-purple-600 text-white">
                          Item {index + 1}/{todayItems.length}
                        </Badge>
                        <span className="font-mono text-sm text-muted-foreground">{item.item_code}</span>
                      </div>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4" />
                          <span>{item.item_type}</span>
                        </div>
                        <p className="text-xs">
                          Étapes : 1) Lecture active de la fiche 2) QCM associés 3) Mini-synthèse
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        onClick={() => handleCompleteItem(item.id)}
                        disabled={processingId === item.id || loading}
                      >
                        {processingId === item.id ? (
                          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                        ) : (
                          <>
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Terminer
                          </>
                        )}
                      </Button>
                      <Button variant="outline" size="sm">
                        <BookOpen className="h-4 w-4 mr-1" />
                        Voir la fiche
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
          <CardContent className="p-8 text-center">
            <CheckCircle2 className="h-12 w-12 mx-auto text-green-500 mb-4" />
            <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
              Session du jour terminée !
            </h3>
            <p className="text-green-600 dark:text-green-400">
              Excellent travail ! Tu as terminé tous tes items du jour. Repose-toi et reviens demain.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Method Info */}
      <Card className="bg-purple-50/50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-800">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Conseils pour la Méthode Blocs Profonds
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
              <p className="font-semibold mb-1">Phase 1 : Lecture active</p>
              <p className="text-xs text-muted-foreground">Lis la fiche en prenant des notes</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
              <p className="font-semibold mb-1">Phase 2 : QCM</p>
              <p className="text-xs text-muted-foreground">Teste-toi sur les concepts</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
              <p className="font-semibold mb-1">Phase 3 : Synthèse</p>
              <p className="text-xs text-muted-foreground">Résume ce que tu as appris</p>
            </div>
          </div>
          <p className="mt-3 text-muted-foreground">
            La clé du succès : <strong>ne te disperse pas</strong>. Concentre-toi uniquement sur les
            items du jour et prends le temps de vraiment les comprendre en profondeur.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
