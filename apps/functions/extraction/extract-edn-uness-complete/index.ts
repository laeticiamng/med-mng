import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from '../../_shared/cors.ts';

import { getErrorMessage } from '../../_shared/error-utils.ts';
// ============================================================================
// TYPES & INTERFACES
// ============================================================================

/**
 * Types d'actions disponibles pour l'extraction
 */
enum ExtractionAction {
  START = 'start',
  RESUME = 'resume',
  TEST = 'test',
  VALIDATE = 'validate'
}

/**
 * Statuts d'extraction possibles
 */
enum ExtractionStatus {
  SUCCESS = 'success',
  PARTIAL = 'partial',
  FAILED = 'failed',
  PENDING = 'pending'
}

/**
 * Niveaux de logging
 */
enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

/**
 * Configuration de l'extraction
 */
interface ExtractConfig {
  maxRetries: number;
  retryDelayMs: number;
  requestDelayMs: number;
  timeout: number;
  batchSize: number;
}

/**
 * Requête d'extraction avec validation
 */
interface ExtractRequest {
  action: 'start' | 'resume' | 'test' | 'validate';
  resumeFromItem?: number;
  maxItems?: number;
  credentials?: {
    username: string;
    password: string;
  };
  config?: Partial<ExtractConfig>;
}

/**
 * Item EDN avec métadonnées complètes
 */
interface EdnItem {
  item_id: number;
  intitule: string;
  rangs_a: string[];
  rangs_b: string[];
  contenu_complet_html: string;
  extraction_status: ExtractionStatus;
  metadata?: {
    extraction_date: string;
    content_length: number;
    rangs_a_count: number;
    rangs_b_count: number;
    version: string;
    quality_score: number;
  };
}

/**
 * Résultat de l'extraction avec statistiques détaillées
 */
interface ExtractionResult {
  totalProcessed: number;
  totalErrors: number;
  totalSuccess: number;
  totalPartial: number;
  extractedItems: EdnItem[];
  itemsFound: number;
  lastProcessedItem: number;
  duration: number;
  averageProcessingTime: number;
  error?: string;
  warnings: string[];
}

/**
 * Erreur personnalisée pour l'extraction EDN
 */
class EdnExtractionError extends Error {
  constructor(
    message: string,
    public code: string,
    public itemId?: number,
    public retryable: boolean = true
  ) {
    super(message);
    this.name = 'EdnExtractionError';
  }
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const DEFAULT_CONFIG: ExtractConfig = {
  maxRetries: 3,
  retryDelayMs: 2000,
  requestDelayMs: 2000,
  timeout: 30000,
  batchSize: 10
};

const URLS = {
  CAS_LOGIN: 'https://auth.uness.fr/cas/login',
  LIVRET_BASE: 'https://livret.uness.fr/lisa/2025',
  ITEMS_PAGE: 'https://livret.uness.fr/lisa/2025/Item_de_connaissance_2C',
  ITEM_TEMPLATE: (id: number) => `https://livret.uness.fr/lisa/2025/Item_de_connaissance_2C/Item_${id}`
};

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

// ============================================================================
// LOGGING UTILITIES
// ============================================================================

/**
 * Logger avec niveaux et timestamps
 */
class Logger {
  private prefix: string;

  constructor(prefix: string = '🔍') {
    this.prefix = prefix;
  }

  private log(level: LogLevel, message: string, data?: any) {
    const timestamp = new Date().toISOString();
    const emoji = {
      [LogLevel.DEBUG]: '🔍',
      [LogLevel.INFO]: '📋',
      [LogLevel.WARN]: '⚠️',
      [LogLevel.ERROR]: '❌'
    }[level];

    const logMessage = `${emoji} [${timestamp}] ${this.prefix} ${message}`;
    console.log(logMessage);

    if (data) {
      console.log(JSON.stringify(data, null, 2));
    }
  }

  debug(message: string, data?: any) { this.log(LogLevel.DEBUG, message, data); }
  info(message: string, data?: any) { this.log(LogLevel.INFO, message, data); }
  warn(message: string, data?: any) { this.log(LogLevel.WARN, message, data); }
  error(message: string, data?: any) { this.log(LogLevel.ERROR, message, data); }
}

const logger = new Logger('EDN-COMPLETE');

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Fonction de délai avec promesse
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry avec backoff exponentiel
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000,
  context: string = ''
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      logger.debug(`${context} - Tentative ${attempt + 1}/${maxRetries + 1}`);
      return await fn();
    } catch (error: unknown) {
      lastError = error;

      if (attempt < maxRetries) {
        const delayMs = baseDelay * Math.pow(2, attempt);
        logger.warn(`${context} - Échec tentative ${attempt + 1}, retry dans ${delayMs}ms`, { error: getErrorMessage(error) });
        await delay(delayMs);
      }
    }
  }

  logger.error(`${context} - Échec après ${maxRetries + 1} tentatives`, { error: lastError.message });
  throw lastError;
}

/**
 * Validation des données extraites
 */
function validateEdnItem(item: EdnItem): { valid: boolean; warnings: string[]; score: number } {
  const warnings: string[] = [];
  let score = 100;

  // Validation de l'intitulé
  if (!item.intitule || item.intitule.length < 10) {
    warnings.push(`Item ${item.item_id}: Intitulé trop court ou manquant`);
    score -= 20;
  }

  // Validation des rangs
  if (item.rangs_a.length === 0 && item.rangs_b.length === 0) {
    warnings.push(`Item ${item.item_id}: Aucun rang A ou B trouvé`);
    score -= 30;
  }

  // Validation du contenu
  if (!item.contenu_complet_html || item.contenu_complet_html.length < 100) {
    warnings.push(`Item ${item.item_id}: Contenu HTML incomplet`);
    score -= 25;
  }

  // Vérification de la qualité des rangs
  const hasGenericRangA = item.rangs_a.some(r => r.includes('Extraction nécessitant une révision manuelle'));
  const hasGenericRangB = item.rangs_b.some(r => r.includes('Extraction nécessitant une révision manuelle'));

  if (hasGenericRangA || hasGenericRangB) {
    warnings.push(`Item ${item.item_id}: Rangs génériques détectés - révision manuelle requise`);
    score -= 15;
  }

  return {
    valid: score >= 40,
    warnings,
    score: Math.max(0, score)
  };
}

/**
 * Calcul du score de qualité d'un item
 */
function calculateQualityScore(item: EdnItem): number {
  const validation = validateEdnItem(item);
  return validation.score;
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ✅ SÉCURITÉ CRITIQUE: Authentification requise pour extract-edn-uness-complete
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Authentication required' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Créer client Supabase si nécessaire
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.50.3');
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Vérifier le token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid or expired token' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // ✅ SÉCURITÉ: Vérifier rôle ADMIN pour extract-edn-uness-complete
    const { data: userRoles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    const isAdmin = userRoles?.some((r) => r.role === 'admin');
    if (!isAdmin) {
      return new Response(
        JSON.stringify({ success: false, error: 'Admin role required' }),
        { status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    console.log(`✅ extract-edn-uness-complete autorisé pour admin ${user.id}`);

    // Code original de la fonction
    
      logger.debug(`${context} - Tentative ${attempt + 1}/${maxRetries + 1}`);
      return await fn();
    } catch (error: unknown) {
      lastError = error;

      if (attempt < maxRetries) {
        const delayMs = baseDelay * Math.pow(2, attempt);
        logger.warn(`${context} - Échec tentative ${attempt + 1}, retry dans ${delayMs}ms`, { error: getErrorMessage(error) });
        await delay(delayMs);
      }
    }
  }

  logger.error(`${context} - Échec après ${maxRetries + 1} tentatives`, { error: lastError.message });
  throw lastError;
}

/**
 * Validation des données extraites
 */
function validateEdnItem(item: EdnItem): { valid: boolean; warnings: string[]; score: number } {
  const warnings: string[] = [];
  let score = 100;

  // Validation de l'intitulé
  if (!item.intitule || item.intitule.length < 10) {
    warnings.push(`Item ${item.item_id}: Intitulé trop court ou manquant`);
    score -= 20;
  }

  // Validation des rangs
  if (item.rangs_a.length === 0 && item.rangs_b.length === 0) {
    warnings.push(`Item ${item.item_id}: Aucun rang A ou B trouvé`);
    score -= 30;
  }

  // Validation du contenu
  if (!item.contenu_complet_html || item.contenu_complet_html.length < 100) {
    warnings.push(`Item ${item.item_id}: Contenu HTML incomplet`);
    score -= 25;
  }

  // Vérification de la qualité des rangs
  const hasGenericRangA = item.rangs_a.some(r => r.includes('Extraction nécessitant une révision manuelle'));
  const hasGenericRangB = item.rangs_b.some(r => r.includes('Extraction nécessitant une révision manuelle'));

  if (hasGenericRangA || hasGenericRangB) {
    warnings.push(`Item ${item.item_id}: Rangs génériques détectés - révision manuelle requise`);
    score -= 15;
  }

  return {
    valid: score >= 40,
    warnings,
    score: Math.max(0, score)
  };
}

/**
 * Calcul du score de qualité d'un item
 */
function calculateQualityScore(item: EdnItem): number {
  const validation = validateEdnItem(item);
  return validation.score;
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  logger.info("🎯 DEBUT FONCTION extract-edn-uness-complete");

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    logger.info("✅ Supabase client créé");

    const body = await req.json();
    logger.debug("📋 Requête reçue", body);

    const {
      action,
      resumeFromItem = 1,
      maxItems = 3,
      credentials,
      config
    }: ExtractRequest = body;

    const extractConfig = { ...DEFAULT_CONFIG, ...config };

    logger.info(`🚀 DEBUT extraction`, {
      action,
      range: `${resumeFromItem} à ${resumeFromItem + maxItems - 1}`,
      config: extractConfig
    });

    // ✅ SÉCURISÉ - Credentials depuis env ou requête
    const username = credentials?.username || Deno.env.get('UNES_EMAIL');
    const password = credentials?.password || Deno.env.get('UNES_PASSWORD');

    if (!username || !password) {
      throw new EdnExtractionError(
        "Credentials UNESS manquants (username/password)",
        'MISSING_CREDENTIALS',
        undefined,
        false
      );
    }

    logger.debug(`🔐 Credentials: ${username ? 'SET ✓' : 'MISSING ✗'} / ${password ? 'SET ✓' : 'MISSING ✗'}`);

    // Extraction avec gestion d'erreurs améliorée
    const results = await extractCompleteEdnItems(
      supabaseClient,
      username,
      password,
      resumeFromItem,
      maxItems,
      extractConfig
    );

    const duration = Date.now() - startTime;
    results.duration = duration;

    const response = {
      success: true,
      message: `Extraction complète terminée avec succès`,
      stats: {
        ...results,
        successRate: results.totalProcessed > 0
          ? ((results.totalSuccess / results.totalProcessed) * 100).toFixed(2) + '%'
          : '0%',
        durationSeconds: (duration / 1000).toFixed(2)
      }
    };

    logger.info("✅ Extraction terminée avec succès", response.stats);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: unknown) {
    const duration = Date.now() - startTime;
    logger.error("❌ ERREUR GLOBALE extraction EDN complète", {
      error: getErrorMessage(error),
      stack: error.stack,
      durationMs: duration
    });

    const errorResponse = {
      success: false,
      error: getErrorMessage(error),
      code: error.code || 'UNKNOWN_ERROR',
      details: error.stack,
      durationMs: duration
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

/**
 * Fonction principale d'extraction complète des items EDN
 * @param supabase - Client Supabase
 * @param username - Identifiant UNESS
 * @param password - Mot de passe UNESS
 * @param startFrom - ID du premier item à extraire
 * @param maxItems - Nombre maximum d'items à extraire
 * @param config - Configuration de l'extraction
 */
async function extractCompleteEdnItems(
  supabase: any,
  username: string,
  password: string,
  startFrom: number,
  maxItems: number,
  config: ExtractConfig = DEFAULT_CONFIG
): Promise<ExtractionResult> {
  const extractionStartTime = Date.now();
  logger.info("🔐 Début de l'authentification CAS UNESS...");

  let totalProcessed = 0;
  let totalErrors = 0;
  let totalSuccess = 0;
  let totalPartial = 0;
  const extractedItems: EdnItem[] = [];
  const warnings: string[] = [];
  const processingTimes: number[] = [];

  try {
    // Étape 1: Authentification CAS avec retry
    const sessionCookies = await retryWithBackoff(
      () => authenticateCAS(username, password),
      config.maxRetries,
      config.retryDelayMs,
      'Authentification CAS'
    );
    logger.info("✅ Authentification CAS réussie");

    // Étape 2: Navigation vers la page des items
    const itemsPageResponse = await fetch(URLS.ITEMS_PAGE, {
      headers: {
        'Cookie': sessionCookies,
        'User-Agent': USER_AGENT
      }
    });

    if (!itemsPageResponse.ok) {
      throw new EdnExtractionError(
        `Impossible d'accéder à la page des items: ${itemsPageResponse.status}`,
        'ITEMS_PAGE_ERROR',
        undefined,
        true
      );
    }

    logger.info("📋 Début de l'extraction des items EDN...");

    // Étape 3: Extraction de chaque item
    const endItem = startFrom + maxItems - 1;

    for (let itemId = startFrom; itemId <= endItem; itemId++) {
      const itemStartTime = Date.now();

      try {
        logger.info(`📄 Traitement item ${itemId}/${endItem}...`);

        // Extraction avec retry
        const itemData = await retryWithBackoff(
          () => extractCompleteItemData(itemId, sessionCookies, config),
          config.maxRetries,
          config.retryDelayMs,
          `Extraction item ${itemId}`
        );

        if (itemData) {
          // Validation des données
          const validation = validateEdnItem(itemData);

          // Ajout des métadonnées
          itemData.metadata = {
            extraction_date: new Date().toISOString(),
            content_length: itemData.contenu_complet_html.length,
            rangs_a_count: itemData.rangs_a.length,
            rangs_b_count: itemData.rangs_b.length,
            version: '2.0',
            quality_score: validation.score
          };

          // Enregistrer les warnings
          if (validation.warnings.length > 0) {
            warnings.push(...validation.warnings);
            logger.warn(`⚠️ Item ${itemId} a des warnings`, validation.warnings);
          }

          extractedItems.push(itemData);

          // Enregistrement en base avec retry
          const dbResult = await retryWithBackoff(
            async () => {
              const { error } = await supabase
                .from('edn_items_uness')
                .upsert({
                  item_id: itemData.item_id,
                  intitule: itemData.intitule,
                  rangs_a: itemData.rangs_a,
                  rangs_b: itemData.rangs_b,
                  contenu_complet_html: itemData.contenu_complet_html,
                  date_import: new Date().toISOString(),
                  extraction_status: itemData.extraction_status,
                  quality_score: itemData.metadata?.quality_score
                });

              if (error) throw error;
              return true;
            },
            config.maxRetries,
            config.retryDelayMs,
            `Sauvegarde DB item ${itemId}`
          );

          const itemDuration = Date.now() - itemStartTime;
          processingTimes.push(itemDuration);

          totalProcessed++;

          if (itemData.extraction_status === ExtractionStatus.SUCCESS) {
            totalSuccess++;
            logger.info(`✅ Item ${itemId} sauvegardé (${itemDuration}ms) - ${itemData.rangs_a.length} rangs A, ${itemData.rangs_b.length} rangs B - Score: ${validation.score}`);
          } else if (itemData.extraction_status === ExtractionStatus.PARTIAL) {
            totalPartial++;
            logger.warn(`⚠️ Item ${itemId} partiellement extrait (${itemDuration}ms) - Score: ${validation.score}`);
          }
        }

        // Pause entre les requêtes
        await delay(config.requestDelayMs);

      } catch (error: unknown) {
        totalErrors++;
        const itemDuration = Date.now() - itemStartTime;
        processingTimes.push(itemDuration);

        logger.error(`❌ Erreur traitement item ${itemId} après ${itemDuration}ms`, {
          error: getErrorMessage(error),
          retryable: error.retryable
        });

        warnings.push(`Item ${itemId}: ${getErrorMessage(error)}`);

        // En cas d'erreur de session, tenter une reconnexion
        if (getErrorMessage(error).includes('session') || getErrorMessage(error).includes('401')) {
          logger.warn("🔄 Tentative de reconnexion CAS...");
          try {
            const newSessionCookies = await retryWithBackoff(
              () => authenticateCAS(username, password),
              config.maxRetries,
              config.retryDelayMs,
              'Reconnexion CAS'
            );
            logger.info("✅ Reconnexion CAS réussie");
          } catch (reconnectError) {
            logger.error("❌ Échec de reconnexion", reconnectError);
            warnings.push('Échec de reconnexion CAS - arrêt de l\'extraction');
            break; // Arrêter l'extraction
          }
        }
      }
    }

    const totalDuration = Date.now() - extractionStartTime;
    const averageProcessingTime = processingTimes.length > 0
      ? processingTimes.reduce((a, b) => a + b, 0) / processingTimes.length
      : 0;

    return {
      totalProcessed,
      totalErrors,
      totalSuccess,
      totalPartial,
      extractedItems: extractedItems.slice(0, 5), // Échantillon pour debug
      itemsFound: endItem - startFrom + 1,
      lastProcessedItem: endItem,
      duration: totalDuration,
      averageProcessingTime,
      warnings
    };

  } catch (error: unknown) {
    const totalDuration = Date.now() - extractionStartTime;
    logger.error("❌ Erreur dans l'extraction complète", error);

    return {
      totalProcessed,
      totalErrors: totalErrors + 1,
      totalSuccess,
      totalPartial,
      extractedItems: [],
      itemsFound: 0,
      lastProcessedItem: 0,
      duration: totalDuration,
      averageProcessingTime: 0,
      error: getErrorMessage(error),
      warnings
    };
  }
}

/**
 * Authentification CAS UNESS avec gestion d'erreurs détaillée
 * @param username - Identifiant UNESS
 * @param password - Mot de passe UNESS
 * @returns Cookies de session CAS
 */
async function authenticateCAS(username: string, password: string): Promise<string> {
  logger.info("🔐 Authentification CAS UNESS...");

  try {
    // Étape 1: Récupérer le formulaire de connexion CAS
    const loginPageResponse = await fetch(URLS.CAS_LOGIN, {
      headers: {
        'User-Agent': USER_AGENT
      }
    });

    if (!loginPageResponse.ok) {
      throw new EdnExtractionError(
        `Impossible d'accéder à la page de connexion CAS: ${loginPageResponse.status}`,
        'CAS_LOGIN_PAGE_ERROR',
        undefined,
        true
      );
    }

    const loginPageHTML = await loginPageResponse.text();
    const loginCookies = extractCookies(loginPageResponse.headers);

    logger.debug("📋 Cookies de connexion récupérés");

    // Extraire le token CSRF/execution du formulaire
    const executionMatch = loginPageHTML.match(/name="execution" value="([^"]+)"/);
    const execution = executionMatch ? executionMatch[1] : '';

    if (!execution) {
      logger.warn("⚠️ Token execution non trouvé dans le formulaire CAS");
    }

    // Étape 2: Soumettre les credentials
    const formData = new URLSearchParams({
      'username': username,
      'password': password,
      'execution': execution,
      '_eventId': 'submit'
    });

    const authResponse = await fetch(URLS.CAS_LOGIN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': loginCookies,
        'User-Agent': USER_AGENT
      },
      body: formData,
      redirect: 'manual'
    });

    // Vérifier la redirection (succès de l'authentification)
    if (authResponse.status === 302 || authResponse.status === 200) {
      const authCookies = extractCookies(authResponse.headers);
      const allCookies = `${loginCookies}; ${authCookies}`;

      logger.info("✅ Authentification CAS réussie");
      return allCookies;
    }

    throw new EdnExtractionError(
      `Échec de l'authentification CAS: ${authResponse.status}`,
      'CAS_AUTH_FAILED',
      undefined,
      false
    );

  } catch (error: unknown) {
    if (error instanceof EdnExtractionError) {
      throw error;
    }

    throw new EdnExtractionError(
      `Erreur lors de l'authentification CAS: ${getErrorMessage(error)}`,
      'CAS_ERROR',
      undefined,
      true
    );
  }
}

/**
 * Extraction complète des données d'un item EDN
 * @param itemId - ID de l'item à extraire
 * @param cookies - Cookies de session CAS
 * @param config - Configuration de l'extraction
 * @returns Données complètes de l'item ou null si non accessible
 */
async function extractCompleteItemData(
  itemId: number,
  cookies: string,
  config: ExtractConfig = DEFAULT_CONFIG
): Promise<EdnItem | null> {
  try {
    const itemUrl = URLS.ITEM_TEMPLATE(itemId);

    logger.debug(`🔍 Extraction complète de l'item: ${itemUrl}`);

    // Récupération de la page principale de l'item
    const itemResponse = await fetch(itemUrl, {
      headers: {
        'Cookie': cookies,
        'User-Agent': USER_AGENT
      }
    });

    if (!itemResponse.ok) {
      logger.warn(`⚠️ Item ${itemId} non accessible: ${itemResponse.status}`);

      if (itemResponse.status === 401 || itemResponse.status === 403) {
        throw new EdnExtractionError(
          `Item ${itemId} non accessible - Authentification requise`,
          'ITEM_UNAUTHORIZED',
          itemId,
          true
        );
      }

      if (itemResponse.status === 404) {
        throw new EdnExtractionError(
          `Item ${itemId} non trouvé`,
          'ITEM_NOT_FOUND',
          itemId,
          false
        );
      }

      return null;
    }

    const itemHTML = await itemResponse.text();
    logger.debug(`✅ Page item ${itemId} récupérée (${itemHTML.length} caractères)`);

    // Extraction de l'intitulé avec patterns multiples
    const intitulé = extractIntitule(itemHTML, itemId);

    // ÉTAPE CRUCIALE: Accéder à la version imprimable pour le contenu COMPLET
    logger.debug(`📋 Accès à la version imprimable pour item ${itemId}...`);

    // Essayer plusieurs URLs possibles pour la version imprimable
    const printableUrls = [
      `${itemUrl}/version_imprimable`,
      `${itemUrl}?printable=yes`,
      `${itemUrl}&printable=yes`,
      `${itemUrl}/print`
    ];

    let contenuCompletHtml = '';
    let printableSuccess = false;

    for (const printableUrl of printableUrls) {
      try {
        logger.debug(`🔍 Tentative version imprimable: ${printableUrl}`);

        const printableResponse = await fetch(printableUrl, {
          headers: {
            'Cookie': cookies,
            'User-Agent': USER_AGENT
          }
        });

        if (printableResponse.ok) {
          contenuCompletHtml = await printableResponse.text();
          logger.debug(`✅ Version imprimable récupérée (${contenuCompletHtml.length} caractères)`);
          printableSuccess = true;
          break;
        }
      } catch (error: unknown) {
        logger.debug(`⚠️ Échec version imprimable ${printableUrl}: ${getErrorMessage(error)}`);
      }
    }

    if (!printableSuccess) {
      logger.warn(`⚠️ Toutes les versions imprimables ont échoué pour l'item ${itemId}, utilisation de la page normale`);
      contenuCompletHtml = itemHTML; // Fallback sur la page normale
    }

    // Extraction améliorée des rangs A et B depuis le contenu complet
    const rangsA = extractRangsAdvanced(contenuCompletHtml, 'A', itemId);
    const rangsB = extractRangsAdvanced(contenuCompletHtml, 'B', itemId);

    logger.info(`📊 Item ${itemId}: ${rangsA.length} connaissances rang A, ${rangsB.length} connaissances rang B`);

    // Déterminer le statut d'extraction
    let extractionStatus: ExtractionStatus;
    if (rangsA.length > 0 && rangsB.length > 0) {
      extractionStatus = ExtractionStatus.SUCCESS;
    } else if (rangsA.length > 0 || rangsB.length > 0) {
      extractionStatus = ExtractionStatus.PARTIAL;
    } else {
      extractionStatus = ExtractionStatus.FAILED;
    }

    return {
      item_id: itemId,
      intitule: intitulé,
      rangs_a: rangsA,
      rangs_b: rangsB,
      contenu_complet_html: contenuCompletHtml,
      extraction_status: extractionStatus
    };

  } catch (error: unknown) {
    logger.error(`❌ Erreur extraction complète item ${itemId}`, error);

    if (error instanceof EdnExtractionError) {
      throw error;
    }

    return {
      item_id: itemId,
      intitule: `Item ${itemId}`,
      rangs_a: [],
      rangs_b: [],
      contenu_complet_html: '',
      extraction_status: ExtractionStatus.FAILED
    };
  }
}

/**
 * Extraction de l'intitulé avec patterns multiples
 */
function extractIntitule(html: string, itemId: number): string {
  const patterns = [
    /<h1[^>]*class="[^"]*titre[^"]*"[^>]*>([^<]+)<\/h1>/i,
    /<h1[^>]*>([^<]+)<\/h1>/i,
    /<title[^>]*>([^<]+)<\/title>/i,
    /<div[^>]*class="[^"]*intitule[^"]*"[^>]*>([^<]+)<\/div>/i
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match && match[1]) {
      const intitule = match[1]
        .trim()
        .replace(/\s+/g, ' ')
        .replace(/Item \d+ - /, '');

      if (intitule.length > 5) {
        return intitule;
      }
    }
  }

  return `Item ${itemId}`;
}

/**
 * Extraction avancée des rangs (A ou B) avec patterns multiples et validation
 * @param html - Contenu HTML complet de l'item
 * @param rang - Type de rang à extraire ('A' ou 'B')
 * @param itemId - ID de l'item pour le logging
 * @returns Liste des connaissances du rang spécifié
 */
function extractRangsAdvanced(html: string, rang: 'A' | 'B', itemId: number): string[] {
  const rangs: string[] = [];

  try {
    // Nettoyer le HTML des scripts et styles
    const cleanHtml = html
      .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, '')
      .replace(/<!--[\s\S]*?-->/g, '');

    logger.debug(`🔍 Extraction rang ${rang} pour item ${itemId}...`);

    // Patterns multiples pour identifier les sections de rang (ordre de priorité)
    const sectionPatterns = [
      // Pattern 1: Section avec classe spécifique
      new RegExp(`<div[^>]*class="[^"]*rang[\\s_-]*${rang.toLowerCase()}[^"]*"[^>]*>([\\s\\S]*?)</div>`, 'i'),
      // Pattern 2: Section avec ID spécifique
      new RegExp(`<div[^>]*id="[^"]*rang[\\s_-]*${rang.toLowerCase()}[^"]*"[^>]*>([\\s\\S]*?)</div>`, 'i'),
      // Pattern 3: Titre h2-h6 avec "Rang A/B"
      new RegExp(`<h[2-6][^>]*>\\s*(?:Connaissances?\\s+)?(?:de\\s+)?Rang\\s+${rang}[^<]*</h[2-6]>([\\s\\S]*?)(?=<h[2-6][^>]*>\\s*(?:Connaissances?\\s+)?(?:de\\s+)?Rang\\s+[AB]|<h[12][^>]*>|$)`, 'i'),
      // Pattern 4: Titre avec délimiteur
      new RegExp(`<[^>]*>\\s*Rang\\s+${rang}\\s*[:\\-]?\\s*</[^>]*>([\\s\\S]*?)(?=<[^>]*>\\s*Rang\\s+[AB]\\s*|$)`, 'i'),
      // Pattern 5: Section table avec rang
      new RegExp(`<table[^>]*>\\s*<[^>]*>\\s*Rang\\s+${rang}[^<]*<[^>]*>([\\s\\S]*?)</table>`, 'i'),
      // Pattern 6: Pattern générique dans le texte
      new RegExp(`Rang\\s+${rang}[^<]*?</[^>]+>([\\s\\S]*?)(?=Rang\\s+[AB]|<h[1-6]|$)`, 'i')
    ];

    let content = '';
    let patternIndex = -1;

    for (let i = 0; i < sectionPatterns.length; i++) {
      const pattern = sectionPatterns[i];
      const match = cleanHtml.match(pattern);
      if (match && match[1] && match[1].trim().length > 50) {
        content = match[1];
        patternIndex = i + 1;
        logger.debug(`📝 Pattern ${patternIndex} trouvé pour rang ${rang} item ${itemId} (${content.length} caractères)`);
        break;
      }
    }

    if (content) {
      // Extraction des objectifs/connaissances individuelles avec priorité
      const objectivePatterns = [
        // Pattern 1: Liste à puces (priorité haute)
        { regex: /<li[^>]*>([\s\S]*?)<\/li>/gi, priority: 1 },
        // Pattern 2: Paragraphes avec classe objectif
        { regex: /<p[^>]*class="[^"]*objectif[^"]*"[^>]*>([\s\S]*?)<\/p>/gi, priority: 2 },
        // Pattern 3: Divs avec classe objectif
        { regex: /<div[^>]*class="[^"]*(?:objectif|connaissance)[^"]*"[^>]*>([\s\S]*?)<\/div>/gi, priority: 2 },
        // Pattern 4: Lignes de tableau (cellules td)
        { regex: /<td[^>]*>([\s\S]*?)<\/td>/gi, priority: 3 },
        // Pattern 5: Paragraphes simples (priorité basse)
        { regex: /<p[^>]*>([\s\S]*?)<\/p>/gi, priority: 4 }
      ];

      // Essayer les patterns par ordre de priorité
      for (const { regex, priority } of objectivePatterns) {
        let objMatch;
        const tempRangs: string[] = [];

        while ((objMatch = regex.exec(content)) !== null) {
          const objectiveHtml = objMatch[1];
          const cleanText = cleanObjectiveText(objectiveHtml);

          // Validation du contenu extrait
          if (isValidObjective(cleanText)) {
            tempRangs.push(cleanText);
          }
        }

        // Si on trouve des objectifs, les utiliser et arrêter
        if (tempRangs.length > 0) {
          rangs.push(...tempRangs);
          logger.debug(`✅ ${tempRangs.length} objectifs trouvés avec pattern priorité ${priority}`);
          break;
        }
      }

      // Déduplication basique
      const uniqueRangs = Array.from(new Set(rangs));
      if (uniqueRangs.length !== rangs.length) {
        logger.debug(`🔄 Déduplication: ${rangs.length} -> ${uniqueRangs.length} objectifs`);
        rangs.length = 0;
        rangs.push(...uniqueRangs);
      }
    }

    // Si aucune connaissance trouvée, créer une connaissance générique
    if (rangs.length === 0) {
      logger.warn(`⚠️ Aucune connaissance rang ${rang} trouvée pour item ${itemId}`);
      rangs.push(`Connaissances de rang ${rang} pour l'item ${itemId} - Extraction nécessitant une révision manuelle`);
    }

    logger.info(`📋 Rang ${rang} item ${itemId}: ${rangs.length} connaissances extraites`);

  } catch (error: unknown) {
    logger.error(`❌ Erreur extraction rang ${rang} pour item ${itemId}`, error);
    rangs.push(`Erreur d'extraction pour rang ${rang} item ${itemId}`);
  }

  return rangs;
}

/**
 * Nettoyage du texte d'un objectif extrait du HTML
 */
function cleanObjectiveText(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')           // Retirer les balises HTML
    .replace(/&nbsp;/g, ' ')            // Retirer les espaces insécables
    .replace(/&[a-z]+;/gi, ' ')         // Retirer les entités HTML
    .replace(/\s+/g, ' ')               // Normaliser les espaces
    .replace(/^\s*[-•*]\s*/, '')        // Retirer les puces en début
    .trim();
}

/**
 * Validation d'un objectif extrait
 */
function isValidObjective(text: string): boolean {
  if (!text || text.length < 15) {
    return false;
  }

  // Filtres pour exclure le bruit
  const excludePatterns = [
    /^(rang|objectif|connaissance|item)\s*$/i,
    /^\s*[a-z]\s*$/i,
    /^[\s\d\-•*]+$/,
    /^(table des matières|sommaire|introduction)/i,
    /^\s*(voir|cf\.|référence)\s/i
  ];

  for (const pattern of excludePatterns) {
    if (pattern.test(text)) {
      return false;
    }
  }

  // Vérifier qu'il y a au moins quelques mots
  const wordCount = text.split(/\s+/).filter(w => w.length > 2).length;
  if (wordCount < 3) {
    return false;
  }

  return true;
}

/**
 * Extraction des cookies depuis les headers HTTP
 * @param headers - Headers de la réponse HTTP
 * @returns String de cookies formatée pour les requêtes suivantes
 */
function extractCookies(headers: Headers): string {
  const cookies: string[] = [];

  headers.forEach((value, name) => {
    if (name.toLowerCase() === 'set-cookie') {
      const cookiePart = value.split(';')[0];
      if (cookiePart) {
        cookies.push(cookiePart);
      }
    }
  });

  const cookieString = cookies.join('; ');
  logger.debug(`🍪 ${cookies.length} cookies extraits`);

  return cookieString;
}