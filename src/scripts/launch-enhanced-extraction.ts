import { supabase } from '@/integrations/supabase/client';

interface EnhancedExtractionResponse {
  success: boolean;
  session_id: string;
  extraction_type: string;
  message: string;
  config: {
    batch_size: number;
    max_concurrent: number;
  };
}

interface EnhancedExtractionStatus {
  session_id: string;
  extraction_type: string;
  status: 'running' | 'paused' | 'completed' | 'failed';
  progress: {
    total: number;
    processed: number;
    errors: number;
    success_rate: number;
  };
  last_activity: string;
  error_message?: string;
}

export class EnhancedExtractionManager {
  private session_id: string | null = null;
  private statusInterval: number | null = null;

  async startExtraction(
    type: 'edn' | 'oic' | 'ecos',
    options: {
      batch_size?: number;
      max_concurrent?: number;
    } = {}
  ): Promise<EnhancedExtractionResponse> {
    console.log(`🚀 Démarrage de l'extraction ${type.toUpperCase()} avec la fonction améliorée...`);
    
    try {
      const { data, error } = await supabase.functions.invoke('extract-uness-enhanced', {
        body: {
          action: 'start',
          extraction_type: type,
          batch_size: options.batch_size || 50,
          max_concurrent: options.max_concurrent || 5
        }
      });

      if (error) {
        throw new Error(`Erreur Edge Function: ${error.message}`);
      }

      if (!data) {
        throw new Error('Aucune donnée reçue de l\'edge function');
      }

      this.session_id = data.session_id;
      console.log(`✅ Extraction ${type.toUpperCase()} démarrée avec succès!`);
      console.log(`📊 Session ID: ${this.session_id}`);
      console.log(`📈 Configuration: ${data.config.batch_size} éléments par batch, ${data.config.max_concurrent} requêtes parallèles`);
      
      return data;
      
    } catch (error) {
      console.error('❌ Échec du démarrage de l\'extraction:', error);
      throw error;
    }
  }

  async getStatus(session_id?: string): Promise<EnhancedExtractionStatus> {
    const id = session_id || this.session_id;
    if (!id) {
      throw new Error('Aucune session active');
    }

    try {
      const { data, error } = await supabase.functions.invoke('extract-uness-enhanced', {
        body: {
          action: 'status',
          session_id: id
        }
      });

      if (error) throw error;
      return data;
      
    } catch (error) {
      console.error('❌ Erreur lors de la récupération du statut:', error);
      throw error;
    }
  }

  async stopExtraction(session_id?: string): Promise<{ success: boolean; message: string }> {
    const id = session_id || this.session_id;
    if (!id) {
      throw new Error('Aucune session active');
    }

    try {
      const { data, error } = await supabase.functions.invoke('extract-uness-enhanced', {
        body: {
          action: 'stop',
          session_id: id
        }
      });

      if (error) throw error;
      
      console.log('⏸️ Extraction arrêtée');
      return data;
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'arrêt:', error);
      throw error;
    }
  }

  startStatusPolling(callback: (status: EnhancedExtractionStatus) => void, interval: number = 3000) {
    if (!this.session_id) {
      throw new Error('Aucune session active pour le polling');
    }

    console.log('📊 Démarrage du monitoring en temps réel...');

    this.statusInterval = window.setInterval(async () => {
      try {
        const status = await this.getStatus();
        callback(status);
        
        // Affichage dans la console
        console.log(`📈 Progrès: ${status.progress.processed}/${status.progress.total} (${Math.round((status.progress.processed/status.progress.total)*100)}%)`);
        console.log(`✅ Taux de réussite: ${status.progress.success_rate.toFixed(1)}%`);
        console.log(`🔥 Statut: ${status.status.toUpperCase()}`);
        
        // Arrêter le polling si terminé ou en erreur
        if (status.status === 'completed' || status.status === 'failed') {
          this.stopStatusPolling();
          
          if (status.status === 'completed') {
            console.log('🎉 Extraction terminée avec succès!');
            console.log(`📊 Résultats finaux: ${status.progress.processed} éléments traités avec un taux de réussite de ${status.progress.success_rate.toFixed(1)}%`);
          } else {
            console.log('❌ Extraction échouée:', status.error_message);
          }
        }
      } catch (error) {
        console.error('❌ Erreur lors du polling:', error);
        this.stopStatusPolling();
      }
    }, interval);
  }

  stopStatusPolling() {
    if (this.statusInterval) {
      clearInterval(this.statusInterval);
      this.statusInterval = null;
      console.log('⏹️ Monitoring arrêté');
    }
  }
}

// Instance globale
export const enhancedExtractor = new EnhancedExtractionManager();

// Fonctions utilitaires pour lancement rapide
export async function launchEDNExtraction() {
  const extractor = new EnhancedExtractionManager();
  
  try {
    const result = await extractor.startExtraction('edn', {
      batch_size: 50,
      max_concurrent: 5
    });
    
    // Démarre le monitoring automatique
    extractor.startStatusPolling((status) => {
      // Le monitoring se fait via les logs console
    });
    
    return result;
    
  } catch (error) {
    console.error('💥 Erreur critique lors de l\'extraction EDN:', error);
    throw error;
  }
}

export async function launchOICExtraction() {
  const extractor = new EnhancedExtractionManager();
  
  try {
    const result = await extractor.startExtraction('oic', {
      batch_size: 100,
      max_concurrent: 8
    });
    
    extractor.startStatusPolling((status) => {
      // Le monitoring se fait via les logs console
    });
    
    return result;
    
  } catch (error) {
    console.error('💥 Erreur critique lors de l\'extraction OIC:', error);
    throw error;
  }
}

export async function launchECOSExtraction() {
  const extractor = new EnhancedExtractionManager();
  
  try {
    const result = await extractor.startExtraction('ecos', {
      batch_size: 30,
      max_concurrent: 4
    });
    
    extractor.startStatusPolling((status) => {
      // Le monitoring se fait via les logs console
    });
    
    return result;
    
  } catch (error) {
    console.error('💥 Erreur critique lors de l\'extraction ECOS:', error);
    throw error;
  }
}

// Fonction pour lancer l'extraction complète (tous les types)
export async function launchCompleteExtraction() {
  console.log('🚀 Démarrage de l\'extraction complète améliorée...');
  
  try {
    // Lancer EDN d'abord
    console.log('📚 Phase 1: Extraction EDN...');
    await launchEDNExtraction();
    
    // Attendre 5 secondes entre les extractions
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Lancer OIC
    console.log('🎯 Phase 2: Extraction OIC...');
    await launchOICExtraction();
    
    // Attendre 5 secondes
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Lancer ECOS
    console.log('🏥 Phase 3: Extraction ECOS...');
    await launchECOSExtraction();
    
    console.log('✅ Extraction complète lancée avec succès!');
    
  } catch (error) {
    console.error('💥 Erreur lors de l\'extraction complète:', error);
    throw error;
  }
}