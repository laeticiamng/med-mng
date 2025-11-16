import { useRecommendationAlerts } from '@/hooks/useRecommendationAlerts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Bell, X, Clock, TrendingUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export function RecommendationAlertsPanel() {
  const { triggeredAlerts, pendingAlerts, loading, dismissAlert } = useRecommendationAlerts();

  if (loading) {
    return null;
  }

  const hasAlerts = triggeredAlerts.length > 0 || pendingAlerts.length > 0;

  if (!hasAlerts) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Alertes urgentes */}
      {triggeredAlerts.length > 0 && (
        <Alert variant="destructive" className="border-2">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle className="text-lg font-semibold">
            {triggeredAlerts.length} Recommandation{triggeredAlerts.length > 1 ? 's' : ''} Prioritaire{triggeredAlerts.length > 1 ? 's' : ''} Non Appliquée{triggeredAlerts.length > 1 ? 's' : ''}
          </AlertTitle>
          <AlertDescription>
            Ces recommandations à fort impact n'ont pas été appliquées depuis plus de 7 jours
          </AlertDescription>
        </Alert>
      )}

      {/* Liste des alertes déclenchées */}
      {triggeredAlerts.length > 0 && (
        <Card className="border-destructive/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <Bell className="h-5 w-5" />
                  Alertes Actives
                </CardTitle>
                <CardDescription>
                  Recommandations prioritaires en attente d'action
                </CardDescription>
              </div>
              <Badge variant="destructive" className="text-lg px-3 py-1">
                {triggeredAlerts.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {triggeredAlerts.map((alert) => (
              <Card key={alert.id} className="bg-destructive/5 border-destructive/20">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-base">{alert.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {alert.description}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground ml-8">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Détectée {formatDistanceToNow(new Date(alert.first_seen_at), { 
                            addSuffix: true, 
                            locale: fr 
                          })}
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          Score: {alert.historical_score.toFixed(0)}/100
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {alert.category}
                        </Badge>
                        <Badge variant={
                          alert.impact === 'high' ? 'destructive' :
                          alert.impact === 'medium' ? 'warning' :
                          'success'
                        }>
                          {alert.impact === 'high' ? 'Impact élevé' :
                           alert.impact === 'medium' ? 'Impact moyen' : 'Impact faible'}
                        </Badge>
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => dismissAlert(alert.id)}
                      className="flex-shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Alertes en attente (pas encore 7 jours) */}
      {pendingAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4" />
                  Recommandations Suivies ({pendingAlerts.length})
                </CardTitle>
                <CardDescription className="text-xs">
                  Ces recommandations seront alertées si non appliquées dans 7 jours
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pendingAlerts.map((alert) => {
                const daysSince = Math.floor(
                  (Date.now() - new Date(alert.first_seen_at).getTime()) / (1000 * 60 * 60 * 24)
                );
                const daysRemaining = 7 - daysSince;
                
                return (
                  <div 
                    key={alert.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium">{alert.title}</p>
                      <p className="text-xs text-muted-foreground">
                        Score: {alert.historical_score.toFixed(0)}/100 • {alert.category}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-xs font-medium">
                          {daysRemaining} jour{daysRemaining > 1 ? 's' : ''} restant{daysRemaining > 1 ? 's' : ''}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          avant alerte
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => dismissAlert(alert.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
