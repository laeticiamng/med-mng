import { supabase } from '@/integrations/supabase/client';

interface ExtractionSession {
  type: 'edn' | 'oic' | 'ecos';
  session_id: string;
  status: 'running' | 'completed' | 'failed';
  progress: {
    total: number;
    processed: number;
    errors: number;
    success_rate: number;
  };
}

class AutoCompleteExtractor {
  private activeSessions: Map<string, ExtractionSession> = new Map();
  private completedExtractions: string[] = [];

  async launchCompleteExtractionPipeline() {
    console.log('🚀 LANCEMENT AUTOMATIQUE DE L\'EXTRACTION COMPLÈTE UNESS');
    console.log('📊 Pipeline: EDN → OIC → ECOS');
    console.log('⚡ Mode autonome activé');

    try {
      // Phase 1: EDN (Items de connaissance)
      await this.launchExtractionPhase('edn', {
        batch_size: 50,
        max_concurrent: 6,
        description: '📚 Items EDN (367 items de connaissance)'
      });

      // Phase 2: OIC (Compétences)
      await this.launchExtractionPhase('oic', {
        batch_size: 100,
        max_concurrent: 10,
        description: '🎯 Compétences OIC (4,872 compétences)'
      });

      // Phase 3: ECOS (Situations cliniques)
      await this.launchExtractionPhase('ecos', {
        batch_size: 30,
        max_concurrent: 5,
        description: '🏥 Situations ECOS (situations cliniques)'
      });

      console.log('✅ PIPELINE COMPLET LANCÉ AVEC SUCCÈS!');
      
      // Démarrer le monitoring global
      this.startGlobalMonitoring();

    } catch (error) {
      console.error('💥 ERREUR CRITIQUE PIPELINE:', error);
      throw error;
    }
  }

  private async launchExtractionPhase(
    type: 'edn' | 'oic' | 'ecos',
    config: {
      batch_size: number;
      max_concurrent: number;
      description: string;
    }
  ) {
    console.log(`\n🚀 Phase ${type.toUpperCase()}: ${config.description}`);
    
    try {
      const { data, error } = await supabase.functions.invoke('extract-uness-enhanced', {
        body: {
          action: 'start',
          extraction_type: type,
          batch_size: config.batch_size,
          max_concurrent: config.max_concurrent
        }
      });

      if (error) {
        throw new Error(`Erreur ${type.toUpperCase()}: ${error.message}`);
      }

      const session: ExtractionSession = {
        type,
        session_id: data.session_id,
        status: 'running',
        progress: { total: 0, processed: 0, errors: 0, success_rate: 0 }
      };

      this.activeSessions.set(data.session_id, session);
      
      console.log(`✅ ${type.toUpperCase()} lancé - Session: ${data.session_id}`);
      console.log(`⚙️ Config: ${config.batch_size} éléments/batch, ${config.max_concurrent} parallèles`);

    } catch (error) {
      console.error(`❌ Erreur phase ${type.toUpperCase()}:`, error);
      throw error;
    }
  }

  private startGlobalMonitoring() {
    console.log('\n📊 MONITORING GLOBAL ACTIVÉ');
    console.log('⏱️ Rafraîchissement toutes les 5 secondes');

    const monitorInterval = setInterval(async () => {
      try {
        let allCompleted = true;
        let totalProcessed = 0;
        let totalExpected = 0;
        let globalErrors = 0;

        console.log('\n📈 STATUS GLOBAL:');
        console.log('═══════════════════════════════════════');

        for (const [sessionId, session] of this.activeSessions) {
          if (session.status === 'running') {
            // Récupérer le status
            const { data: status, error } = await supabase.functions.invoke('extract-uness-enhanced', {
              body: {
                action: 'status',
                session_id: sessionId
              }
            });

            if (!error && status) {
              session.progress = status.progress;
              session.status = status.status;

              const progress = Math.round((status.progress.processed / status.progress.total) * 100);
              const successRate = status.progress.success_rate.toFixed(1);
              
              console.log(`${this.getTypeIcon(session.type)} ${session.type.toUpperCase()}: ${status.progress.processed}/${status.progress.total} (${progress}%) - Réussite: ${successRate}%`);
              
              totalProcessed += status.progress.processed;
              totalExpected += status.progress.total;
              globalErrors += status.progress.errors;

              if (status.status === 'completed' && !this.completedExtractions.includes(session.type)) {
                this.completedExtractions.push(session.type);
                console.log(`🎉 ${session.type.toUpperCase()} TERMINÉ AVEC SUCCÈS!`);
              } else if (status.status === 'failed') {
                console.log(`❌ ${session.type.toUpperCase()} ÉCHOUÉ:`, status.error_message);
              }
            }

            if (session.status !== 'completed' && session.status !== 'failed') {
              allCompleted = false;
            }
          }
        }

        // Affichage des stats globales
        const globalProgress = totalExpected > 0 ? Math.round((totalProcessed / totalExpected) * 100) : 0;
        const globalSuccessRate = totalProcessed > 0 ? ((totalProcessed - globalErrors) / totalProcessed * 100).toFixed(1) : '0.0';

        console.log('═══════════════════════════════════════');
        console.log(`🌍 GLOBAL: ${totalProcessed}/${totalExpected} (${globalProgress}%)`);
        console.log(`✅ Taux de réussite global: ${globalSuccessRate}%`);
        console.log(`❌ Erreurs totales: ${globalErrors}`);
        console.log(`✅ Phases terminées: ${this.completedExtractions.join(', ').toUpperCase()}`);

        // Vérifier si tout est terminé
        if (allCompleted) {
          clearInterval(monitorInterval);
          this.displayFinalResults(totalProcessed, totalExpected, globalErrors);
        }

      } catch (error) {
        console.error('❌ Erreur monitoring global:', error);
      }
    }, 5000);
  }

  private getTypeIcon(type: string): string {
    switch (type) {
      case 'edn': return '📚';
      case 'oic': return '🎯';
      case 'ecos': return '🏥';
      default: return '📊';
    }
  }

  private displayFinalResults(processed: number, expected: number, errors: number) {
    console.log('\n🎉 EXTRACTION COMPLÈTE TERMINÉE!');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`📊 RÉSULTATS FINAUX:`);
    console.log(`   • Total extrait: ${processed}/${expected} éléments`);
    console.log(`   • Taux de réussite: ${((processed - errors) / processed * 100).toFixed(1)}%`);
    console.log(`   • Erreurs: ${errors}`);
    console.log(`   • Phases complétées: ${this.completedExtractions.length}/3`);
    console.log('═══════════════════════════════════════════════════════════');
    
    // Afficher les détails par type
    this.completedExtractions.forEach(type => {
      console.log(`✅ ${type.toUpperCase()}: Extraction réussie`);
    });

    console.log('\n🚀 DONNÉES UNESS COMPLÈTEMENT SYNCHRONISÉES!');
  }
}

// Auto-lancement immédiat
const autoExtractor = new AutoCompleteExtractor();

// Fonction publique pour lancement manuel
export async function launchCompleteAutonomousExtraction() {
  return await autoExtractor.launchCompleteExtractionPipeline();
}

// Lancement automatique au chargement
console.log('🤖 Mode autonome: Lancement automatique dans 3 secondes...');
setTimeout(() => {
  autoExtractor.launchCompleteExtractionPipeline().catch(error => {
    console.error('💥 Erreur auto-extraction:', error);
  });
}, 3000);

export { autoExtractor };