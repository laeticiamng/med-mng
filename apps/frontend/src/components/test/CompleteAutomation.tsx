import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PremiumCard } from '@/components/ui/premium-card';
import { Progress } from '@/components/ui/progress';
import { completeAllOICCompetencies, getItemsWithoutOIC } from '../../../../../packages/shared/src/utils/completeOICCompetencies';
import { runCompleteGeneration } from '../../../../../packages/shared/src/utils/runCompleteGeneration';
import { verifyCompleteEDNCompleteness } from '../../../../../packages/shared/src/utils/verifyCompleteCompleteness';
import { Loader2, Play, CheckCircle, AlertCircle } from 'lucide-react';

type Phase = 'idle' | 'analyzing' | 'completing-oic' | 'generating-lyrics' | 'verifying' | 'complete';

export const CompleteAutomation = () => {
  const [phase, setPhase] = useState<Phase>('idle');
  const [logs, setLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState({
    currentPhase: '',
    percentage: 0,
    details: ''
  });

  const [results, setResults] = useState<{
    initialScore?: number;
    oicCompleted?: number;
    lyricsGenerated?: number;
    finalScore?: number;
  }>({});

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const handleCompleteAutomation = async () => {
    setPhase('analyzing');
    setLogs([]);
    addLog('🚀 Démarrage de l\'automation complète...');

    try {
      // PHASE 1: Analyse initiale
      addLog('📊 Phase 1/4: Analyse de l\'état actuel...');
      setProgress({
        currentPhase: 'Analyse initiale',
        percentage: 10,
        details: 'Vérification de la complétude actuelle'
      });

      const initialReport = await verifyCompleteEDNCompleteness();
      addLog(`✅ État initial: ${initialReport.average_completeness.toFixed(1)}% de complétude`);
      addLog(`  - Items complets: ${initialReport.complete_items}/${initialReport.total_items}`);
      addLog(`  - Paroles Rang A: ${initialReport.items_with_paroles_a}/${initialReport.total_items}`);
      addLog(`  - Paroles Rang B: ${initialReport.items_with_paroles_b}/${initialReport.total_items}`);
      addLog(`  - OIC Rang A: ${initialReport.items_with_all_oic_a}/${initialReport.total_items}`);
      addLog(`  - OIC Rang B: ${initialReport.items_with_all_oic_b}/${initialReport.total_items}`);

      setResults({ initialScore: initialReport.average_completeness });

      // Identifier les items sans OIC
      const itemsWithoutOIC = await getItemsWithoutOIC();
      addLog(`\n📋 Items sans compétences OIC:`);
      addLog(`  - Sans Rang A: ${itemsWithoutOIC.withoutA.length}`);
      addLog(`  - Sans Rang B: ${itemsWithoutOIC.withoutB.length}`);
      addLog(`  - Sans aucun rang: ${itemsWithoutOIC.withoutBoth.length}`);

      const totalMissingOIC = new Set([
        ...itemsWithoutOIC.withoutA,
        ...itemsWithoutOIC.withoutB,
        ...itemsWithoutOIC.withoutBoth
      ]).size;

      // PHASE 2: Complétion OIC
      if (totalMissingOIC > 0) {
        setPhase('completing-oic');
        addLog(`\n🔧 Phase 2/4: Complétion des compétences OIC (${totalMissingOIC} items)...`);
        setProgress({
          currentPhase: 'Complétion OIC',
          percentage: 30,
          details: `Enrichissement de ${totalMissingOIC} items`
        });

        const oicResult = await completeAllOICCompetencies();

        addLog(`✅ Complétion OIC terminée:`);
        addLog(`  - Items traités: ${oicResult.items_processed}`);
        addLog(`  - Enrichis depuis UNESS: ${oicResult.items_enriched_from_uness}`);
        addLog(`  - Générés minimaux: ${oicResult.items_generated_minimal}`);
        addLog(`  - Échecs: ${oicResult.items_failed}`);

        setResults(prev => ({ ...prev, oicCompleted: oicResult.items_processed }));

        if (oicResult.items_failed > 0) {
          addLog(`\n⚠️ Échecs de complétion OIC:`);
          oicResult.errors.forEach(err => {
            addLog(`  - ${err.item_code}: ${err.error}`);
          });
        }
      } else {
        addLog('\n✅ Phase 2/4: Tous les items ont déjà des compétences OIC');
        setProgress({
          currentPhase: 'Complétion OIC',
          percentage: 30,
          details: 'Déjà complet'
        });
      }

      // PHASE 3: Génération des paroles
      setPhase('generating-lyrics');
      addLog(`\n🎵 Phase 3/4: Génération des paroles (1,101 ensembles)...`);
      addLog('⏱️  Cette phase prendra 1-2 heures. Suivi de la progression...');

      setProgress({
        currentPhase: 'Génération paroles',
        percentage: 40,
        details: 'Démarrage de la génération batch'
      });

      const lyricsResult = await runCompleteGeneration({
        batchSize: 10,
        pauseBetweenBatches: 1000,
        onProgress: (prog) => {
          const percent = 40 + (prog.processedItems / prog.totalItems) * 50;
          setProgress({
            currentPhase: 'Génération paroles',
            percentage: Math.round(percent),
            details: `${prog.processedItems}/${prog.totalItems} items - ${prog.successfulItems} succès, ${prog.failedItems} échecs`
          });

          if (prog.currentItem) {
            addLog(`  🎵 ${prog.currentItem} - Rang ${prog.currentRang}`);
          }
        }
      });

      addLog(`✅ Génération paroles terminée:`);
      addLog(`  - Items traités: ${lyricsResult.processedItems}`);
      addLog(`  - Succès: ${lyricsResult.successfulItems}`);
      addLog(`  - Échecs: ${lyricsResult.failedItems}`);

      setResults(prev => ({ ...prev, lyricsGenerated: lyricsResult.successfulItems }));

      if (lyricsResult.errors.length > 0) {
        addLog(`\n⚠️ Échecs de génération:`);
        lyricsResult.errors.slice(0, 10).forEach(err => {
          addLog(`  - ${err.item} (Rang ${err.rang}): ${err.error}`);
        });
        if (lyricsResult.errors.length > 10) {
          addLog(`  ... et ${lyricsResult.errors.length - 10} autres erreurs`);
        }
      }

      // PHASE 4: Vérification finale
      setPhase('verifying');
      addLog(`\n📊 Phase 4/4: Vérification finale...`);
      setProgress({
        currentPhase: 'Vérification finale',
        percentage: 95,
        details: 'Analyse de la complétude finale'
      });

      const finalReport = await verifyCompleteEDNCompleteness();

      addLog(`✅ État final: ${finalReport.average_completeness.toFixed(1)}% de complétude`);
      addLog(`  - Items complets: ${finalReport.complete_items}/${finalReport.total_items}`);
      addLog(`  - Paroles Rang A: ${finalReport.items_with_paroles_a}/${finalReport.total_items}`);
      addLog(`  - Paroles Rang B: ${finalReport.items_with_paroles_b}/${finalReport.total_items}`);
      addLog(`  - Paroles Rang AB: ${finalReport.items_with_paroles_ab}/${finalReport.total_items}`);
      addLog(`  - OIC Rang A: ${finalReport.items_with_all_oic_a}/${finalReport.total_items}`);
      addLog(`  - OIC Rang B: ${finalReport.items_with_all_oic_b}/${finalReport.total_items}`);

      setResults(prev => ({ ...prev, finalScore: finalReport.average_completeness }));

      // TERMINÉ
      setPhase('complete');
      setProgress({
        currentPhase: 'Terminé',
        percentage: 100,
        details: 'Automation complète réussie!'
      });

      addLog(`\n═══════════════════════════════════════════════════`);
      addLog(`🎉 AUTOMATION COMPLÈTE RÉUSSIE!`);
      addLog(`═══════════════════════════════════════════════════`);

      const improvement = finalReport.average_completeness - (results.initialScore || 0);
      addLog(`\n📈 AMÉLIORATION GLOBALE: +${improvement.toFixed(1)}%`);
      addLog(`   ${(results.initialScore || 0).toFixed(1)}% → ${finalReport.average_completeness.toFixed(1)}%`);

      if (finalReport.incomplete_items > 0) {
        addLog(`\n⚠️ Items encore incomplets: ${finalReport.incomplete_items}`);
        addLog(`   Ces items peuvent nécessiter une attention manuelle.`);
      }

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Erreur inconnue';
      addLog(`\n❌ ERREUR: ${errorMsg}`);
      setPhase('idle');
    }
  };

  const isRunning = phase !== 'idle' && phase !== 'complete';

  return (
    <div className="space-y-6">
      {/* Header */}
      <PremiumCard variant="elevated" className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          🤖 Automation Complète 100%
        </h2>
        <p className="text-gray-600 mb-6">
          Automatise tout le processus pour atteindre 100% de complétude:
          <br />
          1. Analyse de l'état actuel
          <br />
          2. Complétion des compétences OIC manquantes
          <br />
          3. Génération de toutes les paroles (1-2h)
          <br />
          4. Vérification finale
        </p>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <strong>Important:</strong> Cette automation prendra 1-2 heures pour générer toutes les paroles.
              La progression sera affichée en temps réel. Vous pouvez laisser cette page ouverte en arrière-plan.
            </div>
          </div>
        </div>

        <Button
          onClick={handleCompleteAutomation}
          disabled={isRunning}
          size="lg"
          className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
        >
          {isRunning ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Automation en cours... ({progress.currentPhase})
            </>
          ) : phase === 'complete' ? (
            <>
              <CheckCircle className="mr-2 h-5 w-5" />
              Automation Terminée - Relancer
            </>
          ) : (
            <>
              <Play className="mr-2 h-5 w-5" />
              🚀 Lancer l'Automation Complète
            </>
          )}
        </Button>
      </PremiumCard>

      {/* Progress */}
      {(isRunning || phase === 'complete') && (
        <>
          <PremiumCard className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              📊 Progression
            </h3>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium">{progress.currentPhase}</span>
                  <span>{progress.percentage}%</span>
                </div>
                <Progress value={progress.percentage} className="h-3" />
                <div className="text-xs text-gray-500 mt-1">{progress.details}</div>
              </div>

              {/* Phase indicators */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className={`p-3 rounded-lg border ${
                  ['analyzing', 'completing-oic', 'generating-lyrics', 'verifying', 'complete'].includes(phase)
                    ? 'bg-green-50 border-green-200'
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="text-xs font-medium text-gray-700">1. Analyse</div>
                  <div className="text-lg font-bold text-gray-900">
                    {['analyzing', 'completing-oic', 'generating-lyrics', 'verifying', 'complete'].includes(phase) ? '✅' : '⏳'}
                  </div>
                </div>

                <div className={`p-3 rounded-lg border ${
                  ['completing-oic', 'generating-lyrics', 'verifying', 'complete'].includes(phase)
                    ? 'bg-green-50 border-green-200'
                    : phase === 'analyzing'
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="text-xs font-medium text-gray-700">2. OIC</div>
                  <div className="text-lg font-bold text-gray-900">
                    {['completing-oic', 'generating-lyrics', 'verifying', 'complete'].includes(phase) ? '✅' : phase === 'analyzing' ? '🔄' : '⏳'}
                  </div>
                </div>

                <div className={`p-3 rounded-lg border ${
                  ['generating-lyrics', 'verifying', 'complete'].includes(phase)
                    ? phase === 'generating-lyrics'
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-green-50 border-green-200'
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="text-xs font-medium text-gray-700">3. Paroles</div>
                  <div className="text-lg font-bold text-gray-900">
                    {['verifying', 'complete'].includes(phase) ? '✅' : phase === 'generating-lyrics' ? '🔄' : '⏳'}
                  </div>
                </div>

                <div className={`p-3 rounded-lg border ${
                  phase === 'complete'
                    ? 'bg-green-50 border-green-200'
                    : phase === 'verifying'
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="text-xs font-medium text-gray-700">4. Vérif</div>
                  <div className="text-lg font-bold text-gray-900">
                    {phase === 'complete' ? '✅' : phase === 'verifying' ? '🔄' : '⏳'}
                  </div>
                </div>
              </div>
            </div>
          </PremiumCard>

          {/* Results */}
          {phase === 'complete' && (
            <PremiumCard variant="elevated" className="p-6 bg-green-50">
              <h3 className="text-lg font-bold text-green-900 mb-4">
                🎉 Résultats de l'Automation
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-sm text-green-700 mb-1">Score Initial</div>
                  <div className="text-3xl font-bold text-green-900">
                    {results.initialScore?.toFixed(1)}%
                  </div>
                </div>

                <div>
                  <div className="text-sm text-green-700 mb-1">Score Final</div>
                  <div className="text-3xl font-bold text-green-900">
                    {results.finalScore?.toFixed(1)}%
                  </div>
                </div>

                <div>
                  <div className="text-sm text-green-700 mb-1">OIC Complétés</div>
                  <div className="text-3xl font-bold text-green-900">
                    {results.oicCompleted || 0}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-green-700 mb-1">Paroles Générées</div>
                  <div className="text-3xl font-bold text-green-900">
                    {results.lyricsGenerated || 0}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4">
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-1">Amélioration Globale</div>
                  <div className="text-4xl font-bold text-green-600">
                    +{((results.finalScore || 0) - (results.initialScore || 0)).toFixed(1)}%
                  </div>
                </div>
              </div>
            </PremiumCard>
          )}
        </>
      )}

      {/* Logs */}
      <PremiumCard className="p-6 bg-gray-50">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          📋 Journal d'Exécution
        </h3>

        <div className="bg-black rounded-lg p-4 font-mono text-xs text-green-400 max-h-96 overflow-y-auto">
          {logs.length === 0 ? (
            <div className="text-gray-500">En attente de démarrage...</div>
          ) : (
            logs.map((log, idx) => (
              <div key={idx} className="mb-1">
                {log}
              </div>
            ))
          )}
        </div>
      </PremiumCard>
    </div>
  );
};
