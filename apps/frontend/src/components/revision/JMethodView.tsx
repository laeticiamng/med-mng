// ============================================================================
// J Method (Méthode des J 2.0) View Component
// ============================================================================

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Calendar,
  CheckCircle2,
  Clock,
  SkipForward,
  AlertCircle,
  TrendingUp,
  BookOpen
} from 'lucide-react';
import { TodayRevisionItem, OverdueRevisionItem } from '@shared/types/revision-methods';
import { useRevisionMethods } from '@/hooks/useRevisionMethods';

interface JMethodViewProps {
  todayItems: TodayRevisionItem[];
  overdueItems: OverdueRevisionItem[];
}

export const JMethodView: React.FC<JMethodViewProps> = ({ todayItems, overdueItems }) => {
  const { completeRevision, skipRevision, rescheduleRevision, loading } = useRevisionMethods();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleCompleteRevision = async (revisionId: string) => {
    setProcessingId(revisionId);
    await completeRevision({
      revision_id: revisionId,
      success_rate: 100 // Could be enhanced with actual success rate input
    });
    setProcessingId(null);
  };

  const handleSkipRevision = async (revisionId: string) => {
    setProcessingId(revisionId);
    await skipRevision(revisionId);
    setProcessingId(null);
  };

  const handleReschedule = async (revisionId: string) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    setProcessingId(revisionId);
    await rescheduleRevision(revisionId, tomorrow);
    setProcessingId(null);
  };

  const getRevisionBadgeColor = (revisionNumber?: number) => {
    if (!revisionNumber) return 'bg-gray-500';
    switch (revisionNumber) {
      case 1:
        return 'bg-blue-500';
      case 2:
        return 'bg-green-500';
      case 3:
        return 'bg-orange-500';
      case 4:
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getRevisionLabel = (revisionNumber?: number) => {
    if (!revisionNumber) return 'Révision';
    const intervals = [2, 7, 14, 30];
    return `J+${intervals[revisionNumber - 1]}`;
  };

  const totalItems = todayItems.length + overdueItems.length;
  const completedCount = 0; // Would need to track completed items from stats

  return (
    <div className="space-y-6">
      {/* Header with progress */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Méthode des J 2.0 - Aujourd'hui
          </CardTitle>
          <CardDescription>
            Répétition espacée : J+2, J+7, J+14, J+30
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-white rounded-lg p-3">
              <p className="text-2xl font-bold text-blue-600">{todayItems.length}</p>
              <p className="text-xs text-gray-600">Prévues aujourd'hui</p>
            </div>
            <div className="bg-white rounded-lg p-3">
              <p className="text-2xl font-bold text-orange-600">{overdueItems.length}</p>
              <p className="text-xs text-gray-600">En retard</p>
            </div>
            <div className="bg-white rounded-lg p-3">
              <p className="text-2xl font-bold text-green-600">{completedCount}</p>
              <p className="text-xs text-gray-600">Complétées</p>
            </div>
          </div>

          {totalItems > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progression du jour</span>
                <span>{Math.round((completedCount / totalItems) * 100)}%</span>
              </div>
              <Progress value={(completedCount / totalItems) * 100} className="w-full" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Overdue Items (priority) */}
      {overdueItems.length > 0 && (
        <Card className="border-orange-200 bg-orange-50/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertCircle className="h-5 w-5" />
              Révisions en retard
            </CardTitle>
            <CardDescription>
              Ces révisions auraient dû être faites. Commence par celles-ci !
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {overdueItems.map((item) => (
              <Card key={item.id} className="border-orange-300 bg-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="destructive" className="text-xs">
                          {item.days_overdue} jour{item.days_overdue > 1 ? 's' : ''} de retard
                        </Badge>
                        <span className="font-mono text-sm text-gray-600">{item.item_code}</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Prévu le {new Date(item.scheduled_for).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleCompleteRevision(item.id)}
                        disabled={processingId === item.id || loading}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Fait
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReschedule(item.id)}
                        disabled={processingId === item.id || loading}
                      >
                        <Calendar className="h-4 w-4 mr-1" />
                        Demain
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Today's Items */}
      {todayItems.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Révisions du jour
            </CardTitle>
            <CardDescription>
              {todayItems.length} révision{todayItems.length > 1 ? 's' : ''} planifiée
              {todayItems.length > 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {todayItems.map((item) => (
              <Card key={item.id} className="border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge
                          className={`${getRevisionBadgeColor(item.revision_number)} text-white text-xs`}
                        >
                          {getRevisionLabel(item.revision_number)}
                        </Badge>
                        <span className="font-mono text-sm text-gray-600">{item.item_code}</span>
                        {item.priority_score && (
                          <Badge variant="outline" className="text-xs">
                            Priorité: {item.priority_score}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <BookOpen className="h-4 w-4" />
                        <span>{item.item_type}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleCompleteRevision(item.id)}
                        disabled={processingId === item.id || loading}
                      >
                        {processingId === item.id ? (
                          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                        ) : (
                          <>
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Révision faite
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReschedule(item.id)}
                        disabled={processingId === item.id || loading}
                      >
                        <SkipForward className="h-4 w-4 mr-1" />
                        Reporter
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      ) : overdueItems.length === 0 ? (
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-8 text-center">
            <CheckCircle2 className="h-12 w-12 mx-auto text-green-500 mb-4" />
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              Toutes tes révisions sont à jour !
            </h3>
            <p className="text-green-600">
              Excellent travail ! Reviens demain pour continuer ta progression.
            </p>
          </CardContent>
        </Card>
      ) : null}

      {/* Info about J Method */}
      <Card className="bg-blue-50/50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Comment fonctionne la Méthode des J ?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white rounded-lg p-3 text-center">
              <Badge className="bg-blue-500 mb-2">J+2</Badge>
              <p className="text-xs text-gray-600">Première révision</p>
            </div>
            <div className="bg-white rounded-lg p-3 text-center">
              <Badge className="bg-green-500 mb-2">J+7</Badge>
              <p className="text-xs text-gray-600">Deuxième révision</p>
            </div>
            <div className="bg-white rounded-lg p-3 text-center">
              <Badge className="bg-orange-500 mb-2">J+14</Badge>
              <p className="text-xs text-gray-600">Troisième révision</p>
            </div>
            <div className="bg-white rounded-lg p-3 text-center">
              <Badge className="bg-purple-500 mb-2">J+30</Badge>
              <p className="text-xs text-gray-600">Dernière révision</p>
            </div>
          </div>
          <p className="text-gray-700">
            Chaque fois que tu découvres un nouveau concept (fiche, QCM, cas clinique), il est
            automatiquement planifié pour ces 4 révisions espacées. Cette méthode optimise ta
            mémorisation à long terme !
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
