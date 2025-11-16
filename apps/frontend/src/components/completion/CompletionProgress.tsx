import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface CompletionProgressProps {
  totalItems: number;
  completedItems: number;
  inProgressItems: number;
  pendingItems: number;
}

export const CompletionProgress: React.FC<CompletionProgressProps> = ({
  totalItems,
  completedItems,
  inProgressItems,
  pendingItems
}) => {
  const completionPercentage = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
  const progressPercentage = totalItems > 0 ? ((completedItems + inProgressItems) / totalItems) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          Progression Globale
        </CardTitle>
        <CardDescription>
          État d'avancement de votre apprentissage sur la plateforme EDN
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progression principale */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progression totale</span>
            <span className="font-medium">{Math.round(completionPercentage)}%</span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
        </div>

        {/* Statistiques détaillées */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center justify-center gap-1 mb-1">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">Terminés</span>
            </div>
            <div className="text-2xl font-bold text-green-800">{completedItems}</div>
            <div className="text-xs text-green-600">
              {totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0}% du total
            </div>
          </div>

          <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">En cours</span>
            </div>
            <div className="text-2xl font-bold text-blue-800">{inProgressItems}</div>
            <div className="text-xs text-blue-600">
              {totalItems > 0 ? Math.round((inProgressItems / totalItems) * 100) : 0}% du total
            </div>
          </div>

          <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-200">
            <div className="flex items-center justify-center gap-1 mb-1">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-700">À démarrer</span>
            </div>
            <div className="text-2xl font-bold text-orange-800">{pendingItems}</div>
            <div className="text-xs text-orange-600">
              {totalItems > 0 ? Math.round((pendingItems / totalItems) * 100) : 0}% du total
            </div>
          </div>
        </div>

        {/* Badges de statut */}
        <div className="flex flex-wrap gap-2">
          {completionPercentage >= 90 && (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              🏆 Presque terminé !
            </Badge>
          )}
          {completionPercentage >= 50 && completionPercentage < 90 && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              🚀 Bon rythme
            </Badge>
          )}
          {completionPercentage < 25 && (
            <Badge variant="secondary" className="bg-orange-100 text-orange-800">
              🌱 Début du parcours
            </Badge>
          )}
          {inProgressItems > 0 && (
            <Badge variant="outline">
              {inProgressItems} item{inProgressItems > 1 ? 's' : ''} actif{inProgressItems > 1 ? 's' : ''}
            </Badge>
          )}
        </div>

        {/* Message d'encouragement */}
        <div className="text-sm text-muted-foreground">
          {completionPercentage >= 90 ? (
            "🎉 Félicitations ! Vous maîtrisez presque tout le contenu EDN !"
          ) : completionPercentage >= 50 ? (
            "💪 Excellent travail ! Vous êtes sur la bonne voie."
          ) : completionPercentage >= 25 ? (
            "🌟 Continuez vos efforts, vous progressez bien !"
          ) : (
            "🚀 C'est parti ! Votre parcours d'apprentissage EDN commence."
          )}
        </div>
      </CardContent>
    </Card>
  );
};