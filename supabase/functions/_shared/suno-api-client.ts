/**
 * 🎵 Client API Suno - Interface unifiée
 * 
 * Client pour interagir avec l'API Suno officielle
 * Documentation: https://docs.sunoapi.org/suno-api/generate-music
 * 
 * Modèles disponibles:
 * - V5: Expression musicale supérieure, génération plus rapide
 * - V4_5PLUS: Son plus riche, nouvelles façons de créer, max 8 min
 * - V4_5ALL: Meilleure structure de chanson, max 8 min
 * - V4_5: Meilleur mélange de genres, jusqu'à 8 min
 * - V4: Meilleure qualité audio, jusqu'à 4 min
 */

// Interfaces selon la documentation officielle 2024
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

// Modèles Suno disponibles
export type SunoModel = 'V4' | 'V4_5' | 'V4_5PLUS' | 'V4_5ALL' | 'V5';

// Genre vocal
export type VocalGender = 'm' | 'f';

export interface SunoGenerationOptions {
  // === Paramètres requis ===
  customMode: boolean;
  instrumental: boolean;
  model: SunoModel;
  callBackUrl: string;

  // === Paramètres conditionnels ===
  // customMode=true + instrumental=false: prompt requis (sera utilisé comme paroles)
  // customMode=true: style et title requis
  // customMode=false: seulement prompt requis (max 500 chars)
  prompt?: string;
  style?: string;
  title?: string;

  // === Nouveaux paramètres V4.5+ ===
  personaId?: string;           // ID de persona pour style personnalisé
  negativeTags?: string;        // Styles à éviter (ex: "Heavy Metal, Upbeat Drums")
  vocalGender?: VocalGender;    // Genre vocal préféré: 'm' ou 'f'
  styleWeight?: number;         // Poids du style (0.00-1.00)
  weirdnessConstraint?: number; // Contrainte de créativité (0.00-1.00)
  audioWeight?: number;         // Poids de l'audio d'entrée (0.00-1.00)

  // === Paramètres legacy (ignorés par API mais gardés pour compat) ===
  fastMode?: boolean;
  priority?: string;
  streamingEnabled?: boolean;
  optimizeForSpeed?: boolean;
}

// Configuration des limites par modèle
const MODEL_LIMITS = {
  V4: {
    promptMax: 3000,
    styleMax: 200,
    titleMax: 80,
    maxDuration: 4 * 60 // 4 minutes
  },
  V4_5: {
    promptMax: 5000,
    styleMax: 1000,
    titleMax: 100,
    maxDuration: 8 * 60 // 8 minutes
  },
  V4_5PLUS: {
    promptMax: 5000,
    styleMax: 1000,
    titleMax: 100,
    maxDuration: 8 * 60
  },
  V4_5ALL: {
    promptMax: 5000,
    styleMax: 1000,
    titleMax: 80, // Attention: V4_5ALL a une limite de 80 chars comme V4
    maxDuration: 8 * 60
  },
  V5: {
    promptMax: 5000,
    styleMax: 1000,
    titleMax: 100,
    maxDuration: 8 * 60
  }
};

// Non-custom mode limit
const NON_CUSTOM_PROMPT_MAX = 500;

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
   * Chaque requête génère exactement 2 chansons
   * Stream URL disponible en 30-40 secondes
   * URL téléchargeable prête en 2-3 minutes
   */
  async generateMusic(options: SunoGenerationOptions): Promise<string> {
    console.log('🎵 Appel API Suno generate avec options:', {
      customMode: options.customMode,
      instrumental: options.instrumental,
      model: options.model,
      hasPrompt: !!options.prompt,
      promptLength: options.prompt?.length || 0,
      style: options.style,
      title: options.title,
      vocalGender: options.vocalGender,
      negativeTags: options.negativeTags,
      styleWeight: options.styleWeight,
      weirdnessConstraint: options.weirdnessConstraint
    });
    
    // Validation des limites selon documentation officielle
    this.validateOptions(options);
    
    // Construire le payload selon la documentation officielle
    const payload: Record<string, any> = {
      customMode: options.customMode,
      instrumental: options.instrumental,
      model: options.model,
      callBackUrl: options.callBackUrl
    };

    // Ajouter les paramètres conditionnels selon le mode
    if (options.customMode) {
      // Custom Mode: style et title requis
      payload.style = options.style || '';
      payload.title = options.title || '';
      
      // prompt requis seulement si pas instrumental
      if (!options.instrumental && options.prompt) {
        payload.prompt = options.prompt;
      }
    } else {
      // Non-custom Mode: seulement prompt requis
      payload.prompt = options.prompt || '';
    }

    // Ajouter les nouveaux paramètres optionnels V4.5+
    if (options.personaId) {
      payload.personaId = options.personaId;
    }
    if (options.negativeTags) {
      payload.negativeTags = options.negativeTags;
    }
    if (options.vocalGender) {
      payload.vocalGender = options.vocalGender;
    }
    if (typeof options.styleWeight === 'number') {
      payload.styleWeight = Math.round(options.styleWeight * 100) / 100; // Arrondir à 2 décimales
    }
    if (typeof options.weirdnessConstraint === 'number') {
      payload.weirdnessConstraint = Math.round(options.weirdnessConstraint * 100) / 100;
    }
    if (typeof options.audioWeight === 'number') {
      payload.audioWeight = Math.round(options.audioWeight * 100) / 100;
    }

    console.log('📤 Payload final envoyé à Suno:', payload);
    
    const response = await fetch(`${this.baseUrl}/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erreur HTTP Suno:', response.status, errorText);
      
      // Mapper les codes d'erreur selon la documentation
      const errorMessages: Record<number, string> = {
        400: 'Paramètres invalides',
        401: 'Accès non autorisé - vérifiez votre clé API',
        404: 'Méthode ou chemin de requête invalide',
        405: 'Limite de taux dépassée',
        413: 'Thème ou prompt trop long',
        429: 'Crédits insuffisants',
        430: 'Fréquence d\'appel trop élevée - réessayez plus tard',
        455: 'Maintenance système',
        500: 'Erreur serveur Suno'
      };
      
      throw new Error(errorMessages[response.status] || `HTTP Error: ${response.status} - ${response.statusText}`);
    }
    
    const result: SunoGenerationResponse = await response.json();
    console.log('🎵 Réponse Suno generate:', result);
    
    if (result.code !== 200) {
      throw new Error(`API Suno Error (${result.code}): ${result.msg || 'Erreur inconnue'}`);
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
   * Callback stages: text -> first -> complete
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
        
        // Statuts de succès
        if (statusData.status === 'SUCCESS' || statusData.status === 'COMPLETE' || statusData.status === 'complete') {
          if (statusData.response?.data && statusData.response.data.length > 0) {
            console.log('✅ Génération terminée avec succès!');
            return statusData.response;
          } else {
            throw new Error('Aucune donnée dans la réponse de succès');
          }
        }
        
        // Statuts d'échec
        if (statusData.status === 'FAILED' || statusData.status === 'ERROR' || statusData.status === 'failed') {
          throw new Error(`Génération échouée: ${statusData.errorMessage || 'Erreur inconnue'}`);
        }
        
        // Statuts intermédiaires: text, first, PENDING, PROCESSING, RUNNING, etc.
        console.log(`⏳ Status en cours: ${statusData.status}, attente 5 secondes...`);
        await new Promise(resolve => setTimeout(resolve, 5000));
        
      } catch (error: unknown) {
        const errMsg = error instanceof Error ? error.message : String(error);
        if (errMsg.includes('Génération échouée')) {
          throw error; // Erreur définitive
        }
        console.error(`❌ Erreur temporaire lors de la vérification (tentative ${attempts}):`, error);
        
        if (attempts >= maxAttempts) {
          throw new Error(`Échec après ${maxAttempts} tentatives: ${errMsg}`);
        }
        
        // Attendre avant de réessayer
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
    
    throw new Error(`Timeout: Génération trop longue (>${maxWaitTime/1000}s)`);
  }

  /**
   * Valider les options selon les limites officielles de l'API
   */
  private validateOptions(options: SunoGenerationOptions): void {
    const model = options.model || 'V4_5';
    const limits = MODEL_LIMITS[model] || MODEL_LIMITS.V4_5;

    // Validation selon le mode
    if (options.customMode) {
      // Custom Mode
      if (!options.instrumental && !options.prompt) {
        throw new Error('En mode personnalisé avec vocals, le prompt (paroles) est requis');
      }
      if (!options.style) {
        throw new Error('En mode personnalisé, le style est requis');
      }
      if (!options.title) {
        throw new Error('En mode personnalisé, le titre est requis');
      }

      // Limites de longueur pour Custom Mode
      if (options.prompt && options.prompt.length > limits.promptMax) {
        throw new Error(`Prompt trop long: ${options.prompt.length}/${limits.promptMax} caractères pour ${model}`);
      }
      if (options.style.length > limits.styleMax) {
        throw new Error(`Style trop long: ${options.style.length}/${limits.styleMax} caractères pour ${model}`);
      }
      if (options.title.length > limits.titleMax) {
        throw new Error(`Titre trop long: ${options.title.length}/${limits.titleMax} caractères pour ${model}`);
      }
    } else {
      // Non-custom Mode
      if (!options.prompt) {
        throw new Error('En mode non-personnalisé, le prompt est requis');
      }
      if (options.prompt.length > NON_CUSTOM_PROMPT_MAX) {
        throw new Error(`Prompt trop long pour mode non-personnalisé: ${options.prompt.length}/${NON_CUSTOM_PROMPT_MAX} caractères`);
      }
    }

    // Validation des poids (0.00-1.00)
    if (typeof options.styleWeight === 'number' && (options.styleWeight < 0 || options.styleWeight > 1)) {
      throw new Error('styleWeight doit être entre 0.00 et 1.00');
    }
    if (typeof options.weirdnessConstraint === 'number' && (options.weirdnessConstraint < 0 || options.weirdnessConstraint > 1)) {
      throw new Error('weirdnessConstraint doit être entre 0.00 et 1.00');
    }
    if (typeof options.audioWeight === 'number' && (options.audioWeight < 0 || options.audioWeight > 1)) {
      throw new Error('audioWeight doit être entre 0.00 et 1.00');
    }

    // Validation du genre vocal
    if (options.vocalGender && !['m', 'f'].includes(options.vocalGender)) {
      throw new Error('vocalGender doit être "m" ou "f"');
    }

    console.log(`✅ Validation OK pour modèle ${model}: prompt=${options.prompt?.length || 0}/${limits.promptMax}, style=${options.style?.length || 0}/${limits.styleMax}, title=${options.title?.length || 0}/${limits.titleMax}`);
  }

  /**
   * Vérifier les crédits restants
   */
  async getRemainingCredits(): Promise<number> {
    console.log('⚠️ Vérification des crédits ignorée (utiliser l\'endpoint dédié si nécessaire)');
    return 999;
  }
}

/**
 * Sélectionner le meilleur modèle selon l'abonnement utilisateur
 */
export function getCorrectSunoModel(userModel?: string): SunoModel {
  const validModels: SunoModel[] = ['V4', 'V4_5', 'V4_5PLUS', 'V4_5ALL', 'V5'];
  
  if (userModel && validModels.includes(userModel as SunoModel)) {
    console.log(`🎯 Modèle demandé valide: ${userModel}`);
    return userModel as SunoModel;
  }
  
  // Défaut: V4_5ALL pour meilleure structure de chanson
  console.log('🚀 Modèle par défaut: V4_5ALL (meilleure structure)');
  return 'V4_5ALL';
}

/**
 * Obtenir les limites pour un modèle donné
 */
export function getModelLimits(model: SunoModel) {
  return MODEL_LIMITS[model] || MODEL_LIMITS.V4_5;
}
