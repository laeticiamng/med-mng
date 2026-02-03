/**
 * 🏥 Medical AI Copilot - Client API Révolutionnaire
 * 
 * Orchestration intelligente de tous les services premium:
 * - Perplexity: Recherche médicale temps réel avec sources
 * - Firecrawl: Extraction de contenu médical officiel
 * - Whisper: Transcription vocale médicale
 * 
 * ✨ NOUVEAU: Streaming token-par-token pour UX révolutionnaire
 * 
 * @example
 * // Recherche médicale approfondie
 * const result = await medicalCopilot.research('Traitement insuffisance cardiaque 2024');
 * 
 * // Question vocale
 * const result = await medicalCopilot.voiceQuery(audioBlob);
 * 
 * // Analyse d'une guideline
 * const result = await medicalCopilot.analyzeGuideline('https://has-sante.fr/...');
 * 
 * // 🆕 Streaming temps réel
 * await medicalCopilot.stream('Diagnostic HTA', 'clinical', (chunk) => console.log(chunk));
 */

import { supabase } from '@/integrations/supabase/client';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type CopilotMode = 
  | 'research'           // Recherche médicale approfondie
  | 'scrape-analyze'     // Scrape URL + analyse
  | 'voice-query'        // Audio → Texte → Réponse
  | 'clinical-assistant' // Assistant clinique complet
  | 'quick-answer';      // Réponse rapide

export type StreamMode = 'research' | 'clinical' | 'quick';

export interface CopilotContext {
  specialty?: string;
  itemNumber?: number;
  patientContext?: string;
}

export interface CopilotOptions {
  includeGuidelines?: boolean;
  maxDepth?: number;
  language?: string;
}

export interface CopilotResponse {
  success: boolean;
  mode: CopilotMode;
  answer?: string;
  citations?: string[];
  extractedContent?: string;
  transcription?: string;
  guidelines?: Array<{ title: string; url: string; summary: string }>;
  relatedItems?: number[];
  processingSteps?: string[];
  metadata?: {
    totalTokens?: number;
    processingTimeMs?: number;
    sourcesCount?: number;
  };
  error?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// MEDICAL AI COPILOT API
// ═══════════════════════════════════════════════════════════════════════════

export const medicalCopilot = {
  /**
   * 🔬 Recherche médicale approfondie avec sources académiques
   * Utilise Perplexity sonar-pro avec filtres médicaux
   * 
   * @example medicalCopilot.research('Physiopathologie du choc septique')
   */
  async research(
    query: string, 
    context?: CopilotContext
  ): Promise<CopilotResponse> {
    const { data, error } = await supabase.functions.invoke('medical-ai-copilot', {
      body: { 
        mode: 'research', 
        query, 
        context,
      },
    });
    if (error) return { success: false, mode: 'research', error: error.message };
    return data;
  },

  /**
   * 📋 Analyse d'une guideline ou ressource web
   * Scrape avec Firecrawl puis analyse avec Perplexity
   * 
   * @example medicalCopilot.analyzeGuideline('https://has-sante.fr/...', 'Résume les recommandations')
   */
  async analyzeGuideline(
    url: string, 
    question?: string
  ): Promise<CopilotResponse> {
    const { data, error } = await supabase.functions.invoke('medical-ai-copilot', {
      body: { 
        mode: 'scrape-analyze', 
        url, 
        query: question,
      },
    });
    if (error) return { success: false, mode: 'scrape-analyze', error: error.message };
    return data;
  },

  /**
   * 🎙️ Question vocale - Transcrit l'audio puis répond
   * Utilise Whisper + Perplexity
   * 
   * @example medicalCopilot.voiceQuery(audioBlob)
   */
  async voiceQuery(
    audioBlob: Blob, 
    options?: CopilotOptions
  ): Promise<CopilotResponse> {
    // Convert blob to base64
    const arrayBuffer = await audioBlob.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    let binary = '';
    for (let i = 0; i < uint8Array.byteLength; i++) {
      binary += String.fromCharCode(uint8Array[i]);
    }
    const audioBase64 = btoa(binary);

    const { data, error } = await supabase.functions.invoke('medical-ai-copilot', {
      body: { 
        mode: 'voice-query', 
        audioBase64,
        options,
      },
    });
    if (error) return { success: false, mode: 'voice-query', error: error.message };
    return data;
  },

  /**
   * 🏥 Assistant clinique complet avec raisonnement avancé
   * Utilise Perplexity sonar-reasoning-pro
   * 
   * @example medicalCopilot.clinicalAssistant('Douleur thoracique chez homme 55 ans', { 
   *   patientContext: 'Tabagique, HTA'
   * })
   */
  async clinicalAssistant(
    query: string, 
    context?: CopilotContext
  ): Promise<CopilotResponse> {
    const { data, error } = await supabase.functions.invoke('medical-ai-copilot', {
      body: { 
        mode: 'clinical-assistant', 
        query, 
        context,
      },
    });
    if (error) return { success: false, mode: 'clinical-assistant', error: error.message };
    return data;
  },

  /**
   * ⚡ Réponse rapide en 2-3 phrases
   * Pour les questions simples
   * 
   * @example medicalCopilot.quickAnswer('Posologie amoxicilline angine')
   */
  async quickAnswer(query: string): Promise<CopilotResponse> {
    const { data, error } = await supabase.functions.invoke('medical-ai-copilot', {
      body: { 
        mode: 'quick-answer', 
        query,
      },
    });
    if (error) return { success: false, mode: 'quick-answer', error: error.message };
    return data;
  },

  /**
   * 📚 Recherche par spécialité médicale
   * Contexte automatique selon la spécialité
   * 
   * @example medicalCopilot.bySpecialty('cardiologie', 'Critères de gravité syncope')
   */
  async bySpecialty(
    specialty: string, 
    query: string
  ): Promise<CopilotResponse> {
    return this.research(query, { specialty });
  },

  /**
   * 🎯 Recherche par numéro d'item EDN
   * Contexte automatique selon l'item
   * 
   * @example medicalCopilot.byItem(234, 'Quels sont les diagnostics différentiels?')
   */
  async byItem(
    itemNumber: number, 
    query: string
  ): Promise<CopilotResponse> {
    return this.research(
      `Item ${itemNumber} EDN: ${query}`, 
      { itemNumber }
    );
  },

  /**
   * 🔍 Scrape multiples URLs de guidelines
   * Pour compilation de recommandations
   * 
   * @example medicalCopilot.compileGuidelines(['https://has-sante.fr/...', 'https://sfcardio.fr/...'])
   */
  async compileGuidelines(
    urls: string[], 
    synthesisQuestion?: string
  ): Promise<CopilotResponse[]> {
    const results = await Promise.all(
      urls.map(url => this.analyzeGuideline(url))
    );
    
    // Optionally synthesize all guidelines
    if (synthesisQuestion && results.every(r => r.success)) {
      const combinedContent = results
        .map(r => r.extractedContent?.slice(0, 2000))
        .join('\n\n---\n\n');
      
      const synthesis = await this.research(
        `${synthesisQuestion}\n\nContenu des guidelines:\n${combinedContent.slice(0, 10000)}`
      );
      
      return [...results, synthesis];
    }
    
    return results;
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 🆕 STREAMING API - Token-par-token révolutionnaire
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * ✨ Streaming temps réel - Tokens affichés au fur et à mesure
   * 
   * @example
   * await medicalCopilot.stream(
   *   'Diagnostic différentiel douleur thoracique',
   *   'clinical',
   *   (chunk) => setResponse(prev => prev + chunk),
   *   () => console.log('Done!')
   * );
   */
  async stream(
    query: string,
    mode: StreamMode = 'quick',
    onDelta: (deltaText: string) => void,
    onDone?: () => void,
    specialty?: string
  ): Promise<void> {
    const SUPABASE_URL = 'https://yaincoxihiqdksxgrsrk.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU';
    
    const response = await fetch(`${SUPABASE_URL}/functions/v1/medical-ai-copilot-stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ query, mode, specialty }),
    });

    if (!response.ok || !response.body) {
      throw new Error('Failed to start stream');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      buffer += decoder.decode(value, { stream: true });

      // Process SSE lines
      let newlineIdx: number;
      while ((newlineIdx = buffer.indexOf('\n')) !== -1) {
        let line = buffer.slice(0, newlineIdx);
        buffer = buffer.slice(newlineIdx + 1);

        if (line.endsWith('\r')) line = line.slice(0, -1);
        if (line.startsWith(':') || line.trim() === '') continue;
        if (!line.startsWith('data: ')) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === '[DONE]') break;

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) onDelta(content);
        } catch {
          // Incomplete JSON, wait for more data
          buffer = line + '\n' + buffer;
          break;
        }
      }
    }

    onDone?.();
  },

  /**
   * 🔬 Streaming recherche approfondie
   */
  async streamResearch(
    query: string,
    onDelta: (text: string) => void,
    onDone?: () => void,
    specialty?: string
  ): Promise<void> {
    return this.stream(query, 'research', onDelta, onDone, specialty);
  },

  /**
   * 🏥 Streaming assistant clinique
   */
  async streamClinical(
    query: string,
    onDelta: (text: string) => void,
    onDone?: () => void
  ): Promise<void> {
    return this.stream(query, 'clinical', onDelta, onDone);
  },
};

export default medicalCopilot;
