// ============================================================================
// Block Method (Méthode Blocs Profonds) View Component
// ============================================================================

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Target,
  Calendar,
  CheckCircle2,
  Settings,
  TrendingUp,
  BookOpen,
  PlayCircle
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
import { TodayRevisionItem, BlockMethodConfigDB } from '@shared/types/revision-methods';
import { useRevisionMethods } from '@/hooks/useRevisionMethods';

interface BlockMethodViewProps {
  todayItems: TodayRevisionItem[];
  blockConfig: BlockMethodConfigDB | null;
}

export const BlockMethodView: React.FC<BlockMethodViewProps> = ({ todayItems, blockConfig }) => {
  const { createBlockConfig, completeRevision, loading } = useRevisionMethods();
  const [showConfigDialog, setShowConfigDialog] = useState(!blockConfig);
  const [itemsPerDay, setItemsPerDay] = useState(5);
  const [targetDate, setTargetDate] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleCreateConfig = async () => {
    if (!targetDate) {
      alert('Veuillez sélectionner une date cible');
      return;
    }

    // For now, we'll use a placeholder for selected_items
    // In a real implementation, this would come from a multi-select component
    const result = await createBlockConfig({
      items_per_day: itemsPerDay,
      target_date: targetDate,
      selected_items: [] // TODO: Add item selection UI
    });

    if (result.success) {
      setShowConfigDialog(false);
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

  if (!blockConfig) {
    return (
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
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
          <p className="text-sm text-gray-700">
            Tu n'as pas encore configuré la Méthode Blocs Profonds. Définis ton objectif quotidien
            et ta date cible pour commencer.
          </p>
          <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
            <DialogTrigger asChild>
              <Button className="w-full">
                <Settings className="h-4 w-4 mr-2" />
                Configurer la méthode
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Configuration Méthode Blocs Profonds</DialogTitle>
                <DialogDescription>
                  Définis ton rythme et ton objectif pour un apprentissage en profondeur
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="itemsPerDay">
                    Nombre d'items par jour
                    <span className="text-xs text-gray-500 ml-2">(recommandé: 3-8)</span>
                  </Label>
                  <Input
                    id="itemsPerDay"
                    type="number"
                    min={1}
                    max={20}
                    value={itemsPerDay}
                    onChange={(e) => setItemsPerDay(parseInt(e.target.value))}
                  />
                  <p className="text-xs text-gray-600">
                    Moins d'items = plus de temps par sujet (deep focus)
                  </p>
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

                <div className="bg-blue-50 rounded-lg p-4 text-sm">
                  <p className="font-medium mb-2">Estimation :</p>
                  {targetDate && (
                    <>
                      <p className="text-gray-700">
                        Avec <strong>{itemsPerDay} items/jour</strong>, tu peux couvrir environ{' '}
                        <strong>
                          {itemsPerDay *
                            Math.ceil(
                              (new Date(targetDate).getTime() - new Date().getTime()) /
                                (1000 * 60 * 60 * 24)
                            )}{' '}
                          items
                        </strong>{' '}
                        d'ici la date cible.
                      </p>
                    </>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowConfigDialog(false)}>
                  Annuler
                </Button>
                <Button onClick={handleCreateConfig} disabled={loading || !targetDate}>
                  {loading ? 'Création...' : 'Créer le plan'}
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
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
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
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Modifier la configuration</DialogTitle>
                </DialogHeader>
                {/* Same config form as above */}
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-white rounded-lg p-3">
              <p className="text-2xl font-bold text-purple-600">{todayItems.length}</p>
              <p className="text-xs text-gray-600">Items du jour</p>
            </div>
            <div className="bg-white rounded-lg p-3">
              <p className="text-2xl font-bold text-blue-600">{daysUntilTarget}</p>
              <p className="text-xs text-gray-600">Jours restants</p>
            </div>
            <div className="bg-white rounded-lg p-3">
              <p className="text-2xl font-bold text-green-600">{progressPercentage}%</p>
              <p className="text-xs text-gray-600">Progression</p>
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
              <Card key={item.id} className="border-purple-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-purple-600 text-white">
                          Item {index + 1}/{todayItems.length}
                        </Badge>
                        <span className="font-mono text-sm text-gray-600">{item.item_code}</span>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4" />
                          <span>{item.item_type}</span>
                        </div>
                        <p className="text-xs text-gray-500">
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
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-8 text-center">
            <CheckCircle2 className="h-12 w-12 mx-auto text-green-500 mb-4" />
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              Session du jour terminée !
            </h3>
            <p className="text-green-600">
              Excellent travail ! Tu as terminé tous tes items du jour. Repose-toi et reviens demain.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Method Info */}
      <Card className="bg-purple-50/50 border-purple-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Conseils pour la Méthode Blocs Profonds
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-white rounded-lg p-3">
              <p className="font-semibold mb-1">📖 Phase 1 : Lecture active</p>
              <p className="text-xs text-gray-600">Lis la fiche en prenant des notes</p>
            </div>
            <div className="bg-white rounded-lg p-3">
              <p className="font-semibold mb-1">❓ Phase 2 : QCM</p>
              <p className="text-xs text-gray-600">Teste-toi sur les concepts</p>
            </div>
            <div className="bg-white rounded-lg p-3">
              <p className="font-semibold mb-1">✍️ Phase 3 : Synthèse</p>
              <p className="text-xs text-gray-600">Résume ce que tu as appris</p>
            </div>
          </div>
          <p className="mt-3">
            La clé du succès : <strong>ne te disperse pas</strong>. Concentre-toi uniquement sur les
            items du jour et prends le temps de vraiment les comprendre en profondeur.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
