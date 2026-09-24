/**
 * 🔎 Perplexity API Client
 * 
 * Chat IA avec recherche web temps réel et sources citées
 * Modèles disponibles:
 * - sonar: Rapide pour questions quotidiennes
 * - sonar-pro: Raisonnement multi-étapes avec 2x plus de citations
 * - sonar-reasoning: Raisonnement chaîné avec recherche temps réel
 * - sonar-reasoning-pro: Raisonnement avancé basé sur DeepSeek R1
 * - sonar-deep-research: Recherche experte multi-requêtes
 */

import { supabase } from '@/integrations/supabase/client';

type PerplexityModel = 
  | 'sonar' 
  | 'sonar-pro' 
  | 'sonar-reasoning' 
  | 'sonar-reasoning-pro' 
  | 'sonar-deep-research';

type PerplexityMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

type PerplexityOptions = {
  max_tokens?: number;
  temperature?: number;
  search_domain_filter?: string[]; // ['wikipedia.org', 'pubmed.ncbi.nlm.nih.gov']
  search_recency_filter?: 'day' | 'week' | 'month' | 'year';
  search_mode?: 'academic' | 'sec';
};

type PerplexityResponse = {
  success: boolean;
  content?: string;
  citations?: string[];
  model?: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  error?: string;
};

export const perplexityApi = {
  /**
   * Chat avec recherche web temps réel et sources
   * @example perplexityApi.chat([{ role: 'user', content: 'Traitement de l\'insuffisance cardiaque 2024' }])
   */
  async chat(
    messages: PerplexityMessage[], 
    model: PerplexityModel = 'sonar',
    options?: PerplexityOptions
  ): Promise<PerplexityResponse> {
    const { data, error } = await supabase.functions.invoke('perplexity-search', {
      body: { messages, model, options },
    });

    if (error) {
      return { success: false, error: error.message };
    }
    return data;
  },

  /**
   * Recherche médicale académique avec sources
   * @example perplexityApi.medicalSearch('Diagnostic différentiel douleur thoracique')
   */
  async medicalSearch(query: string): Promise<PerplexityResponse> {
    return this.chat(
      [{ role: 'user', content: query }],
      'sonar-pro',
      {
        search_mode: 'academic',
        search_domain_filter: [
          'pubmed.ncbi.nlm.nih.gov',
          'has-sante.fr',
          'sfcardio.fr',
          'sfmu.org',
          'uness.fr'
        ],
        temperature: 0.1,
      }
    );
  },

  /**
   * Recherche rapide avec réponse concise
   * @example perplexityApi.quickSearch('Posologie amoxicilline angine')
   */
  async quickSearch(query: string): Promise<PerplexityResponse> {
    return this.chat(
      [
        { role: 'system', content: 'Réponds de manière concise et précise en français.' },
        { role: 'user', content: query }
      ],
      'sonar',
      { max_tokens: 500, temperature: 0.2 }
    );
  },

  /**
   * Recherche approfondie avec raisonnement
   * @example perplexityApi.deepResearch('Physiopathologie du choc septique et prise en charge')
   */
  async deepResearch(query: string): Promise<PerplexityResponse> {
    return this.chat(
      [{ role: 'user', content: query }],
      'sonar-deep-research',
      { 
        max_tokens: 4000, 
        temperature: 0.1,
        search_recency_filter: 'year',
      }
    );
  },
};

export type { PerplexityModel, PerplexityMessage, PerplexityOptions, PerplexityResponse };
