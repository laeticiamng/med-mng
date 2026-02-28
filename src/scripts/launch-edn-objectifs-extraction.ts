/**
 * EdnObjectifsExtractor — STUB DÉSACTIVÉ
 * L'Edge Function extract-edn-objectifs a été supprimée.
 * Ce stub conserve l'interface pour éviter les erreurs de build.
 */

interface ExtractionResponse {
  success: boolean;
  session_id: string;
  message: string;
  status_url?: string;
}

interface ExtractionStatus {
  session_id: string;
  total_expected: number;
  items_extracted: number;
  page_number: number;
  total_pages: number;
  status: 'en_cours' | 'termine' | 'erreur' | 'pause';
  last_activity: string;
  error_message?: string;
  failed_urls?: string[];
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
  async startExtraction(): Promise<ExtractionResponse> {
    console.warn('⚠️ EdnObjectifsExtractor désactivé : extract-edn-objectifs supprimée.');
    throw new Error('Extraction désactivée : fonction supprimée');
  }

  async getStatus(_session_id?: string): Promise<ExtractionStatus> {
    throw new Error('Extraction désactivée : fonction supprimée');
  }

  async resumeExtraction(_session_id: string, _resume_from?: number): Promise<ExtractionResponse> {
    throw new Error('Extraction désactivée : fonction supprimée');
  }

  async generateRapport(): Promise<ExtractionStats> {
    throw new Error('Extraction désactivée : fonction supprimée');
  }

  startStatusPolling(_callback: (status: ExtractionStatus) => void, _interval?: number) {
    console.warn('⚠️ Polling désactivé : extract-edn-objectifs supprimée.');
  }

  stopStatusPolling() {
    // no-op
  }

  async getExtractedCompetences(_item_parent?: string, _rang?: 'A' | 'B', _limit?: number) {
    return [];
  }

  async getStatsByItem(_item_parent: string) {
    return { total: 0, rang_a: 0, rang_b: 0, rubriques: {} };
  }
}

export const ednExtractor = new EdnObjectifsExtractor();

export async function launchEdnObjectifsExtraction() {
  console.warn('⚠️ launchEdnObjectifsExtraction désactivé.');
  throw new Error('Extraction désactivée : fonction supprimée');
}
