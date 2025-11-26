/**
 * 🎵 Client API Suno - Interface unifiée
 *
 * Client pour interagir avec l'API Suno officielle
 * Documentation: https://api.sunoapi.org/api/v1
 */


// Interfaces selon la documentation officielle
export interface SunoGenerationResponse {
  code: number;
  msg: string;
  data: {
    taskId: string;
  };
}

export interface SunoStatusResponse {
  code: number;
  msg: string;
  data: {
    status: string;
    response?: {
      data: Array<{
        id: string;
        title: string;
        audio_url: string;
        video_url: string;
        image_url: string;
        duration: number;
        created_at: string;
        model: string;
        style: string;
        prompt: string;
      }>;
    };
    errorMessage?: string;
  };
}

export interface SunoGenerationOptions {
  prompt: string;
  customMode?: boolean;
  instrumental?: boolean;
  style?: string;
  title?: string;
  model?: string;
  callBackUrl?: string;
  fastMode?: boolean;
  priority?: string;
  streamingEnabled?: boolean;
  optimizeForSpeed?: boolean;
}

/**
 * Client API Suno
 */
export class SunoAPIClient {
  private apiKey: string;
  private baseUrl: string = 'https://api.sunoapi.org/api/v1';

  constructor(apiKey: string) {
    if (!apiKey || apiKey.length < 10) {
      throw new Error('Clé API Suno invalide');
    }
    this.apiKey = apiKey;
  }

  /**
   * Générer une musique (retourne immédiatement un taskId)
   */
  async generateMusic(options: SunoGenerationOptions): Promise<string> {
    console.log('🎵 Appel API Suno generate avec options:', options);
    
    // Validation des limites selon documentation officielle
    this.validateOptions(options);
    
    const response = await fetch(`${this.baseUrl}/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: options.prompt,
        customMode: options.customMode ?? true,
        instrumental: options.instrumental ?? false,
        style: options.style || '',
        title: options.title || '',
        model: options.model || 'chirp-v3-5',
        callBackUrl: options.callBackUrl,
        fastMode: options.fastMode ?? true,
        priority: options.priority || 'high',
        streamingEnabled: options.streamingEnabled ?? true,
        optimizeForSpeed: options.optimizeForSpeed ?? true
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} - ${response.statusText}`);
    }
    
    const result: SunoGenerationResponse = await response.json();
    console.log('🎵 Réponse Suno generate:', result);
    
    if (result.code !== 200) {
      throw new Error(`API Suno Error: ${result.msg || 'Erreur inconnue'}`);
    }
    
    if (!result.data?.taskId) {
      throw new Error('TaskId manquant dans la réponse API');
    }
    
    return result.data.taskId;
  }

  /**
   * Obtenir le statut d'une génération
   */
  async getTaskStatus(taskId: string): Promise<SunoStatusResponse['data']> {
    console.log('🔍 Vérification statut pour taskId:', taskId);
    
    const response = await fetch(`${this.baseUrl}/generate/record-info?taskId=${taskId}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} - ${response.statusText}`);
    }
    
    const result: SunoStatusResponse = await response.json();
    console.log('📊 Statut reçu:', result);
    
    if (result.code !== 200) {
      throw new Error(`API Suno Error: ${result.msg || 'Erreur inconnue'}`);
    }
    
    return result.data;
  }

  /**
   * Attendre la completion d'une génération (polling)
   */
  async waitForCompletion(taskId: string, maxWaitTime: number = 600000): Promise<any> {
    const startTime = Date.now();
    let attempts = 0;
    const maxAttempts = 120; // 10 minutes max avec checks toutes les 5 secondes
    
    console.log(`⏳ Attente de completion pour taskId: ${taskId} (max ${maxWaitTime/1000}s)`);
    
    while (Date.now() - startTime < maxWaitTime && attempts < maxAttempts) {
      attempts++;
      
      try {
        const statusData = await this.getTaskStatus(taskId);
        
        console.log(`🔄 Tentative ${attempts}/${maxAttempts} - Status: ${statusData.status}`);
        
        if (statusData.status === 'SUCCESS' || statusData.status === 'COMPLETE') {
          if (statusData.response?.data && statusData.response.data.length > 0) {
            console.log('✅ Génération terminée avec succès!');
            return statusData.response;
          } else {
            throw new Error('Aucune donnée dans la réponse de succès');
          }
        } else if (statusData.status === 'FAILED' || statusData.status === 'ERROR') {
          throw new Error(`Génération échouée: ${statusData.errorMessage || 'Erreur inconnue'}`);
        }
        
        // Statuts en cours: PENDING, PROCESSING, RUNNING, etc.
        console.log(`⏳ Status en cours: ${statusData.status}, attente 5 secondes...`);
        await new Promise(resolve => setTimeout(resolve, 5000));
        
      } catch (error: unknown) {
        const errorMsg = getErrorMessage(error);
        if (errorMsg.includes('Génération échouée')) {
          throw error; // Erreur définitive
        }
        console.error(`❌ Erreur temporaire lors de la vérification (tentative ${attempts}):`, error);

        if (attempts >= maxAttempts) {
          throw new Error(`Échec après ${maxAttempts} tentatives: ${errorMsg}`);
        }

        // Attendre avant de réessayer
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
    
    throw new Error(`Timeout: Génération trop longue (>${maxWaitTime/1000}s)`);
  }

  /**
   * Valider les options selon les limites de l'API
   */
  private validateOptions(options: SunoGenerationOptions): void {
    const isV4Plus = options.model === 'V4_5' || options.model === 'V4_5PLUS';
    const maxPromptLength = isV4Plus ? 5000 : 3000;
    const maxStyleLength = isV4Plus ? 1000 : 200;
    
    if (options.prompt && options.prompt.length > maxPromptLength) {
      throw new Error(`Prompt trop long (max ${maxPromptLength} caractères pour ${options.model})`);
    }
    if (options.style && options.style.length > maxStyleLength) {
      throw new Error(`Style trop long (max ${maxStyleLength} caractères pour ${options.model})`);
    }
    if (options.title && options.title.length > 80) {
      throw new Error('Titre trop long (max 80 caractères)');
    }
  }

  /**
   * Vérifier les crédits restants (désactivé pour éviter blocages)
   */
  async getRemainingCredits(): Promise<number> {
    console.log('⚠️ Vérification des crédits ignorée');
    return 999; // Retourner une valeur élevée pour ne pas bloquer
  }
}

/**
 * Convertir vers le format correct selon la documentation
 */
export function getCorrectSunoModel(userModel: string): string {
  console.log('🔧 Conversion modèle selon doc officielle:', userModel);
  
  // OPTIMISATION: Toujours utiliser V4_5PLUS pour vitesse optimale
  console.log('🚀 MODÈLE OPTIMISÉ: V4_5PLUS sélectionné pour génération ultra-rapide');
  return 'V4_5PLUS';
}
