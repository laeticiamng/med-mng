import logger from '@/lib/logger';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PremiumCard } from '@/components/ui/premium-card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { runCompleteGeneration, generateSingleItem, resumeGeneration } from '../../../../../packages/shared/src/utils/runCompleteGeneration';
import { Loader2, Play, Pause, RotateCcw, Download } from 'lucide-react';

interface GenerationProgress {
  totalItems: number;
  processedItems: number;
  successfulItems: number;
  failedItems: number;
  currentItem: string | null;
  currentRang: string | null;
  errors: Array<{ item: string; rang: string; error: string }>;
  startTime: Date;
  estimatedTimeRemaining: number | null;
}

export const BatchLyricsGenerator = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState<GenerationProgress | null>(null);
  const [singleItemCode, setSingleItemCode] = useState('IC-001');
  const [resumeFromCode, setResumeFromCode] = useState('');
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const handleFullGeneration = async () => {
    setIsRunning(true);
    setProgress(null);
    setLogs([]);

    addLog('🚀 Démarrage de la génération complète...');

    try {
      const result = await runCompleteGeneration({
        batchSize: 10,
        pauseBetweenBatches: 1000,
        onProgress: (prog) => {
          setProgress(prog);

          if (prog.currentItem) {
            addLog(`Traitement ${prog.currentItem} Rang ${prog.currentRang}`);
          }
        }
      });

      addLog(`✅ Génération terminée! ${result.successfulItems}/${result.totalItems} succès`);

      if (result.errors.length > 0) {
        addLog(`⚠️ ${result.errors.length} erreurs détectées`);
      }

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Erreur inconnue';
      addLog(`❌ Erreur: ${errorMsg}`);
      logger.error('Erreur génération:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSingleGeneration = async () => {
    if (!singleItemCode) {
      addLog('❌ Veuillez entrer un code item');
      return;
    }

    setIsRunning(true);
    addLog(`🎵 Génération pour ${singleItemCode}...`);

    try {
      await generateSingleItem(singleItemCode);
      addLog(`✅ ${singleItemCode} - Paroles générées avec succès`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Erreur inconnue';
      addLog(`❌ Erreur ${singleItemCode}: ${errorMsg}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleResumeGeneration = async () => {
    if (!resumeFromCode) {
      addLog('❌ Veuillez entrer un code item de départ');
      return;
    }

    setIsRunning(true);
    setProgress(null);
    addLog(`🔄 Reprise de la génération depuis ${resumeFromCode}...`);

    try {
      const result = await resumeGeneration(resumeFromCode);
      addLog(`✅ Génération reprise terminée! ${result.successfulItems}/${result.totalItems} succès`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Erreur inconnue';
      addLog(`❌ Erreur: ${errorMsg}`);
    } finally {
      setIsRunning(false);
    }
  };

  const downloadLogs = () => {
    const content = logs.join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `edn-generation-logs-${new Date().toISOString()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const progressPercent = progress
    ? (progress.processedItems / progress.totalItems) * 100
    : 0;

  const formatTime = (ms: number | null): string => {
    if (!ms) return '--:--';
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Full Generation */}
      <PremiumCard variant="elevated" className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          🚀 Génération Complète (367 items × 3 rangs)
        </h2>
        <p className="text-gray-600 mb-6">
          Générer automatiquement les paroles pour TOUS les items EDN avec les 3 rangs.
          <br />
          <strong>Durée estimée: 1-2 heures</strong> (1,101 générations totales)
        </p>

        {!isRunning ? (
          <Button
            onClick={handleFullGeneration}
            size="lg"
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            <Play className="mr-2 h-5 w-5" />
            Lancer la Génération Complète
          </Button>
        ) : (
          <Button disabled size="lg" className="w-full">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Génération en cours...
          </Button>
        )}

        {/* Progress Display */}
        {progress && (
          <div className="mt-6 space-y-4">
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progression: {progress.processedItems}/{progress.totalItems} items</span>
                <span>{progressPercent.toFixed(1)}%</span>
              </div>
              <Progress value={progressPercent} className="h-3" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <PremiumCard className="p-4">
                <div className="text-2xl font-bold text-green-600">{progress.successfulItems}</div>
                <div className="text-xs text-gray-600">Succès</div>
              </PremiumCard>
              <PremiumCard className="p-4">
                <div className="text-2xl font-bold text-red-600">{progress.failedItems}</div>
                <div className="text-xs text-gray-600">Échecs</div>
              </PremiumCard>
              <PremiumCard className="p-4">
                <div className="text-2xl font-bold text-blue-600">
                  {formatTime(progress.estimatedTimeRemaining)}
                </div>
                <div className="text-xs text-gray-600">Temps restant</div>
              </PremiumCard>
              <PremiumCard className="p-4">
                <div className="text-lg font-bold text-purple-600">
                  {progress.currentItem || '--'}
                </div>
                <div className="text-xs text-gray-600">Item actuel</div>
              </PremiumCard>
            </div>

            {progress.currentItem && progress.currentRang && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  🎵 En cours: <strong>{progress.currentItem}</strong> - Rang <strong>{progress.currentRang}</strong>
                </p>
              </div>
            )}

            {progress.errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800 font-medium mb-2">
                  ⚠️ {progress.errors.length} erreur(s) détectée(s)
                </p>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {progress.errors.slice(0, 5).map((err, idx) => (
                    <p key={idx} className="text-xs text-red-700">
                      {err.item} (Rang {err.rang}): {err.error}
                    </p>
                  ))}
                  {progress.errors.length > 5 && (
                    <p className="text-xs text-red-600">
                      ... et {progress.errors.length - 5} autres erreurs
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </PremiumCard>

      {/* Single Item Generation */}
      <PremiumCard className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          🎯 Génération Item Unique
        </h3>
        <p className="text-gray-600 mb-4 text-sm">
          Générer les paroles pour un seul item (3 rangs)
        </p>

        <div className="flex gap-3">
          <Input
            value={singleItemCode}
            onChange={(e) => setSingleItemCode(e.target.value)}
            placeholder="IC-001"
            className="flex-1"
          />
          <Button
            onClick={handleSingleGeneration}
            disabled={isRunning || !singleItemCode}
          >
            {isRunning ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
        </div>
      </PremiumCard>

      {/* Resume Generation */}
      <PremiumCard className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          🔄 Reprendre la Génération
        </h3>
        <p className="text-gray-600 mb-4 text-sm">
          Reprendre depuis un item spécifique (utile si la génération a été interrompue)
        </p>

        <div className="flex gap-3">
          <Input
            value={resumeFromCode}
            onChange={(e) => setResumeFromCode(e.target.value)}
            placeholder="IC-042"
            className="flex-1"
          />
          <Button
            onClick={handleResumeGeneration}
            disabled={isRunning || !resumeFromCode}
            variant="outline"
          >
            {isRunning ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RotateCcw className="h-4 w-4" />
            )}
          </Button>
        </div>
      </PremiumCard>

      {/* Logs */}
      <PremiumCard className="p-6 bg-gray-50">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-900">
            📋 Logs de Génération
          </h3>
          {logs.length > 0 && (
            <Button
              onClick={downloadLogs}
              variant="outline"
              size="sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Télécharger
            </Button>
          )}
        </div>

        <div className="bg-black rounded-lg p-4 font-mono text-xs text-green-400 max-h-96 overflow-y-auto">
          {logs.length === 0 ? (
            <div className="text-gray-500">Aucun log pour le moment...</div>
          ) : (
            logs.map((log, idx) => (
              <div key={idx} className="mb-1">
                {log}
              </div>
            ))
          )}
        </div>
      </PremiumCard>

      {/* Info */}
      <PremiumCard className="p-6 bg-purple-50">
        <h3 className="font-semibold text-gray-900 mb-3">
          ℹ️ Important
        </h3>
        <div className="text-sm text-gray-700 space-y-2">
          <p>
            <strong>Avant de lancer:</strong> Assurez-vous que la migration 20251116220000
            est appliquée (onglet Migration).
          </p>
          <p>
            <strong>Durée:</strong> La génération complète prend 1-2 heures pour 367 items.
          </p>
          <p>
            <strong>Reprise:</strong> Si la génération est interrompue, utilisez "Reprendre"
            avec le code du dernier item traité.
          </p>
          <p>
            <strong>Logs:</strong> Les logs détaillés sont affichés ci-dessus et téléchargeables.
          </p>
        </div>
      </PremiumCard>
    </div>
  );
};
