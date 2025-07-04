import { supabase } from '@/integrations/supabase/client';

interface ExtractionResponse {
  success: boolean;
  session_id: string;
  message: string;
  status_url?: string;
}

interface ExtractionStatus {
  session_id: string;
  total_competences: number;
  competences_extraites: number;
  page_courante: number;
  total_pages: number;
  statut: 'en_cours' | 'termine' | 'erreur' | 'pause';
  derniere_activite: string;
  erreurs?: any[];
}

interface ExtractionStats {
  total_competences_extraites: number;
  total_competences_attendues: number;
  completude_globale: number;
  items_ern_couverts: number;
  repartition_par_item: Array<{
    item_parent: string;
    competences_attendues: number;
    competences_extraites: number;
    completude_pct: number;
    manquants: string[];
  }>;
}

export class EdnObjectifsExtractor {
  private session_id: string | null = null;
  private statusInterval: number | null = null;

  async startExtraction(): Promise<ExtractionResponse> {
    console.log('🚀 Démarrage de l\'extraction des 4,872 compétences OIC...');
    
    try {
      const { data, error } = await supabase.functions.invoke('extract-edn-objectifs', {
        body: {
          action: 'start'
        }
      });

      if (error) {
        console.error('❌ Erreur lors du démarrage:', error);
        throw error;
      }

      this.session_id = data.session_id;
      console.log('✅ Extraction démarrée avec succès!');
      console.log('📊 Session ID:', this.session_id);
      
      return data;
      
    } catch (error) {
      console.error('❌ Échec du démarrage de l\'extraction:', error);
      throw error;
    }
  }

  async getStatus(session_id?: string): Promise<ExtractionStatus> {
    const id = session_id || this.session_id;
    if (!id) {
      throw new Error('Aucune session active');
    }

    try {
      const { data, error } = await supabase.functions.invoke('extract-edn-objectifs', {
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

  async resumeExtraction(session_id: string, resume_from?: number): Promise<ExtractionResponse> {
    console.log(`🔄 Reprise de l'extraction depuis la page ${resume_from || 'dernière'}...`);
    
    try {
      const { data, error } = await supabase.functions.invoke('extract-edn-objectifs', {
        body: {
          action: 'resume',
          session_id,
          resume_from
        }
      });

      if (error) throw error;
      
      this.session_id = session_id;
      console.log('✅ Extraction reprise avec succès!');
      
      return data;
      
    } catch (error) {
      console.error('❌ Échec de la reprise de l\'extraction:', error);
      throw error;
    }
  }

  async generateRapport(): Promise<ExtractionStats> {
    console.log('📊 Génération du rapport de complétude...');
    
    try {
      const { data, error } = await supabase.functions.invoke('extract-edn-objectifs', {
        body: {
          action: 'rapport'
        }
      });

      if (error) throw error;
      
      console.log('✅ Rapport généré avec succès!');
      return data;
      
    } catch (error) {
      console.error('❌ Erreur lors de la génération du rapport:', error);
      throw error;
    }
  }

  startStatusPolling(callback: (status: ExtractionStatus) => void, interval: number = 5000) {
    if (!this.session_id) {
      throw new Error('Aucune session active pour le polling');
    }

    this.statusInterval = window.setInterval(async () => {
      try {
        const status = await this.getStatus();
        callback(status);
        
        // Arrêter le polling si terminé ou en erreur
        if (status.statut === 'termine' || status.statut === 'erreur') {
          this.stopStatusPolling();
        }
      } catch (error) {
        console.error('Erreur lors du polling:', error);
      }
    }, interval);
  }

  stopStatusPolling() {
    if (this.statusInterval) {
      clearInterval(this.statusInterval);
      this.statusInterval = null;
    }
  }

  async getExtractedCompetences(item_parent?: string, rang?: 'A' | 'B', limit: number = 100) {
    let query = supabase
      .from('oic_competences')
      .select('*')
      .order('item_parent', { ascending: true })
      .order('ordre', { ascending: true })
      .limit(limit);

    if (item_parent) {
      query = query.eq('item_parent', item_parent);
    }

    if (rang) {
      query = query.eq('rang', rang);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Erreur lors de la récupération des compétences: ${error.message}`);
    }

    return data || [];
  }

  async getStatsByItem(item_parent: string) {
    const { data, error } = await supabase
      .from('oic_competences')
      .select('rang, rubrique')
      .eq('item_parent', item_parent);

    if (error) {
      throw new Error(`Erreur lors de la récupération des stats: ${error.message}`);
    }

    const stats = {
      total: data?.length || 0,
      rang_a: data?.filter(obj => obj.rang === 'A').length || 0,
      rang_b: data?.filter(obj => obj.rang === 'B').length || 0,
      rubriques: {} as Record<string, number>
    };

    // Compter par rubrique
    data?.forEach(obj => {
      stats.rubriques[obj.rubrique] = (stats.rubriques[obj.rubrique] || 0) + 1;
    });

    return stats;
  }
}

// Instance globale
export const ednExtractor = new EdnObjectifsExtractor();

// Fonctions utilitaires pour le lancement rapide
export async function launchEdnObjectifsExtraction() {
  const extractor = new EdnObjectifsExtractor();
  
  try {
    const result = await extractor.startExtraction();
    
    // Démarre le polling automatique
    extractor.startStatusPolling((status) => {
      console.log(`📊 Progrès: ${status.competences_extraites}/${status.total_competences} compétences (${Math.round((status.competences_extraites/status.total_competences)*100)}%)`);
      console.log(`📄 Page: ${status.page_courante}/${status.total_pages}`);
      console.log(`🟢 Statut: ${status.statut}`);
      
      if (status.statut === 'termine') {
        console.log('🎉 Extraction terminée avec succès!');
        extractor.generateRapport().then(rapport => {
          console.log('📊 Rapport final:', rapport);
        });
      }
    });
    
    return result;
    
  } catch (error) {
    console.error('💥 Erreur critique lors de l\'extraction:', error);
    throw error;
  }
}

// Export pour utilisation directe