import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Play, 
  RotateCcw, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Settings,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  triggerBulkLyrics, 
  triggerOicFix, 
  getTriggerStatus, 
  resetTriggerStatus,
  runAllBatchTriggers,
  type BatchTriggerResult,
  type BatchTriggerOptions 
} from '@/utils/batch/batchTriggers';

interface TriggerStatus {
  executed: boolean;
  lastExecution?: string;
  executionKey: string;
}

export const BatchTriggersPanel: React.FC = () => {
  const [bulkLyricsStatus, setBulkLyricsStatus] = useState<TriggerStatus>({ executed: false, executionKey: '' });
  const [oicFixStatus, setOicFixStatus] = useState<TriggerStatus>({ executed: false, executionKey: '' });
  const [isExecuting, setIsExecuting] = useState<{ [key: string]: boolean }>({});
  const [lastResults, setLastResults] = useState<{ [key: string]: BatchTriggerResult }>({});
  const [environment, setEnvironment] = useState<'development' | 'production' | 'staging'>('development');

  // Rafraîchir les statuts
  const refreshStatuses = () => {
    setBulkLyricsStatus(getTriggerStatus('bulkLyrics'));
    setOicFixStatus(getTriggerStatus('oicFix'));
  };

  useEffect(() => {
    refreshStatuses();
  }, []);

  // Exécuter un trigger spécifique
  const executeTrigger = async (
    triggerType: 'bulkLyrics' | 'oicFix',
    options: BatchTriggerOptions = {}
  ) => {
    const triggerName = triggerType === 'bulkLyrics' ? 'Génération de paroles' : 'Correction OIC';
    
    setIsExecuting(prev => ({ ...prev, [triggerType]: true }));
    
    try {
      toast.info(`Démarrage ${triggerName}...`, {
        description: 'Cette opération peut prendre plusieurs minutes'
      });

      let result: BatchTriggerResult;
      
      if (triggerType === 'bulkLyrics') {
        result = await triggerBulkLyrics(options);
      } else {
        result = await triggerOicFix(options);
      }

      setLastResults(prev => ({ ...prev, [triggerType]: result }));
      
      if (result.success) {
        toast.success(`${triggerName} terminée avec succès !`, {
          description: `Exécutée à ${new Date(result.timestamp).toLocaleString()}`
        });
      } else {
        toast.error(`Erreur lors de ${triggerName}`, {
          description: result.error
        });
      }
      
      refreshStatuses();
      
    } catch (error: any) {
      toast.error(`Erreur critique lors de ${triggerName}`, {
        description: error.message
      });
    } finally {
      setIsExecuting(prev => ({ ...prev, [triggerType]: false }));
    }
  };

  // Réinitialiser un statut
  const resetStatus = (triggerType: 'bulkLyrics' | 'oicFix') => {
    resetTriggerStatus(triggerType);
    refreshStatuses();
    toast.info(`Statut de ${triggerType === 'bulkLyrics' ? 'génération de paroles' : 'correction OIC'} réinitialisé`);
  };

  // Exécuter tous les triggers
  const executeAllTriggers = async () => {
    setIsExecuting({ bulkLyrics: true, oicFix: true, all: true });
    
    try {
      toast.info('Démarrage de tous les batch triggers...', {
        description: 'Cette opération peut prendre 15-20 minutes'
      });

      const results = await runAllBatchTriggers({ 
        environment,
        forceExecution: true 
      });

      setLastResults(prev => ({ 
        ...prev, 
        bulkLyrics: results.bulkLyrics,
        oicFix: results.oicFix 
      }));

      const successCount = [results.bulkLyrics, results.oicFix].filter(r => r.success).length;
      
      if (successCount === 2) {
        toast.success('Tous les batch triggers terminés avec succès !');
      } else {
        toast.warning(`${successCount}/2 triggers réussis`, {
          description: 'Consultez les détails ci-dessous'
        });
      }
      
      refreshStatuses();
      
    } catch (error: any) {
      toast.error('Erreur lors de l\'exécution des batch triggers', {
        description: error.message
      });
    } finally {
      setIsExecuting({ bulkLyrics: false, oicFix: false, all: false });
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Jamais';
    return new Date(dateString).toLocaleString('fr-FR');
  };

  const getStatusBadge = (status: TriggerStatus) => {
    if (status.executed) {
      return <Badge variant="secondary" className="flex items-center gap-1">
        <CheckCircle className="h-3 w-3" />
        Exécuté
      </Badge>;
    }
    return <Badge variant="outline" className="flex items-center gap-1">
      <Clock className="h-3 w-3" />
      En attente
    </Badge>;
  };

  const getResultBadge = (result?: BatchTriggerResult) => {
    if (!result) return null;
    
    if (result.success) {
      return <Badge variant="default" className="flex items-center gap-1">
        <CheckCircle className="h-3 w-3" />
        Succès
      </Badge>;
    }
    return <Badge variant="destructive" className="flex items-center gap-1">
      <AlertTriangle className="h-3 w-3" />
      Échec
    </Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Gestion des Batch Triggers
          </CardTitle>
          <CardDescription>
            Contrôle manuel des tâches coûteuses précédemment déclenchées automatiquement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <label className="text-sm font-medium">Environnement:</label>
              <select 
                value={environment}
                onChange={(e) => setEnvironment(e.target.value as any)}
                className="px-3 py-1 border rounded text-sm"
              >
                <option value="development">Développement</option>
                <option value="staging">Staging</option>
                <option value="production">Production</option>
              </select>
            </div>
            
            <Button
              onClick={executeAllTriggers}
              disabled={isExecuting.all}
              className="ml-auto"
            >
              {isExecuting.all ? 'Exécution...' : 'Exécuter tous les triggers'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Lyrics Trigger */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              🎵 Génération Massive de Paroles
              {getStatusBadge(bulkLyricsStatus)}
            </span>
            {getResultBadge(lastResults.bulkLyrics)}
          </CardTitle>
          <CardDescription>
            Génère des paroles musicales pour 367 items × 3 versions (Rang A, B, contextualisées)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Statut:</span> {bulkLyricsStatus.executed ? 'Déjà exécuté' : 'En attente'}
            </div>
            <div>
              <span className="font-medium">Dernière exécution:</span> {formatDate(bulkLyricsStatus.lastExecution)}
            </div>
          </div>
          
          {lastResults.bulkLyrics && (
            <Alert variant={lastResults.bulkLyrics.success ? "default" : "destructive"}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Dernier résultat:</strong> {lastResults.bulkLyrics.error || 'Exécution réussie'}
              </AlertDescription>
            </Alert>
          )}
          
          <div className="flex gap-2">
            <Button
              onClick={() => executeTrigger('bulkLyrics', { environment })}
              disabled={isExecuting.bulkLyrics || isExecuting.all}
              className="flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              {isExecuting.bulkLyrics ? 'Génération...' : 'Générer les paroles'}
            </Button>
            
            <Button
              variant="outline"
              onClick={() => executeTrigger('bulkLyrics', { environment, forceExecution: true })}
              disabled={isExecuting.bulkLyrics || isExecuting.all}
            >
              Forcer l'exécution
            </Button>
            
            <Button
              variant="outline"
              onClick={() => resetStatus('bulkLyrics')}
              disabled={isExecuting.bulkLyrics || isExecuting.all}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* OIC Fix Trigger */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              🔧 Correction des Compétences OIC
              {getStatusBadge(oicFixStatus)}
            </span>
            {getResultBadge(lastResults.oicFix)}
          </CardTitle>
          <CardDescription>
            Complète les descriptions manquantes pour ~4 872 compétences OIC depuis url_source
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Statut:</span> {oicFixStatus.executed ? 'Déjà exécuté' : 'En attente'}
            </div>
            <div>
              <span className="font-medium">Dernière exécution:</span> {formatDate(oicFixStatus.lastExecution)}
            </div>
          </div>
          
          {lastResults.oicFix && (
            <Alert variant={lastResults.oicFix.success ? "default" : "destructive"}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Dernier résultat:</strong> {lastResults.oicFix.error || 'Exécution réussie'}
              </AlertDescription>
            </Alert>
          )}
          
          <div className="flex gap-2">
            <Button
              onClick={() => executeTrigger('oicFix', { environment })}
              disabled={isExecuting.oicFix || isExecuting.all}
              className="flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              {isExecuting.oicFix ? 'Correction...' : 'Corriger les OIC'}
            </Button>
            
            <Button
              variant="outline"
              onClick={() => executeTrigger('oicFix', { environment, forceExecution: true })}
              disabled={isExecuting.oicFix || isExecuting.all}
            >
              Forcer l'exécution
            </Button>
            
            <Button
              variant="outline"
              onClick={() => resetStatus('oicFix')}
              disabled={isExecuting.oicFix || isExecuting.all}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Avertissement */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Important:</strong> Ces opérations sont coûteuses en ressources et peuvent prendre 
          10-20 minutes chacune. Elles étaient précédemment déclenchées automatiquement au chargement 
          de la page et sont maintenant contrôlées manuellement pour améliorer les performances.
        </AlertDescription>
      </Alert>
    </div>
  );
};