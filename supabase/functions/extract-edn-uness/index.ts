import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ExtractRequest {
  action: 'start' | 'resume';
  resumeFromItem?: number;
  credentials?: {
    username: string;
    password: string;
  };
}

interface EdnItem {
  item_id: number;
  intitule: string;
  rangs_a: string[];
  rangs_b: string[];
  contenu_complet_html: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  console.log("🎯 DEBUT FONCTION extract-edn-uness");

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    console.log("✅ Supabase client créé");

    const body = await req.json();
    console.log("📋 Body reçu:", JSON.stringify(body));

    const { action, resumeFromItem = 1, credentials }: ExtractRequest = body;

    console.log(`🚀 DEBUT extraction - Action: ${action}, Items: ${resumeFromItem} à ${resumeFromItem + 2}`);

    // Validation des credentials
    const username = credentials?.username || "laeticia.moto-ngane@etud.u-picardie.fr";
    const password = credentials?.password || "Aiciteal1!";

    console.log(`🔐 Credentials: ${username} / ${password ? '***' : 'MANQUANT'}`);

    if (!username || !password) {
      throw new Error("Credentials UNESS manquants (username/password)");
    }

    console.log("🎯 Appel extractEdnItems...");
    const results = await extractEdnItems(supabaseClient, username, password, resumeFromItem);
    console.log("🎯 Résultats obtenus:", JSON.stringify(results));

    const response = {
      success: true,
      message: `Extraction terminée avec succès`,
      stats: results
    };

    console.log("🎯 Réponse finale:", JSON.stringify(response));

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("❌ ERREUR GLOBALE extraction EDN:", error);
    console.error("❌ Stack:", error.stack);
    
    const errorResponse = { 
      error: error.message,
      details: error.stack 
    };
    
    console.log("❌ Réponse erreur:", JSON.stringify(errorResponse));
    
    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function extractEdnItems(supabase: any, username: string, password: string, startFrom: number) {
  console.log("🔐 Début de l'authentification CAS UNESS...");
  
  let totalProcessed = 0;
  let totalErrors = 0;
  let extractedItems: EdnItem[] = [];
  const maxItems = startFrom + 2; // Traiter seulement 3 items pour le test

  try {
    // Étape 1: Authentification CAS (utilise la méthode éprouvée)
    const sessionCookies = await authenticateCAS(username, password);
    console.log("✅ Authentification CAS réussie");

    // Étape 2: Navigation vers la page des items (méthode éprouvée)
    const itemsPageResponse = await fetch("https://livret.uness.fr/lisa/2025/Item_de_connaissance_2C", {
      headers: {
        'Cookie': sessionCookies,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!itemsPageResponse.ok) {
      throw new Error(`Impossible d'accéder à la page des items: ${itemsPageResponse.status}`);
    }

    console.log("📋 Début de l'extraction des items EDN...");

    // Étape 3: Extraction de chaque item (méthode éprouvée adaptée)
    for (let itemId = startFrom; itemId <= maxItems; itemId++) {
      try {
        console.log(`📄 Traitement item ${itemId}/${maxItems}...`);
        
        const itemData = await extractCompleteItemData(itemId, sessionCookies);
        
        if (itemData) {
          extractedItems.push(itemData);
          
          // Enregistrement en base
          const { error } = await supabase
            .from('edn_items_uness')
            .upsert({
              item_id: itemData.item_id,
              intitule: itemData.intitule,
              rangs_a: itemData.rangs_a,
              rangs_b: itemData.rangs_b,
              contenu_complet_html: itemData.contenu_complet_html,
              date_import: new Date().toISOString()
            });

          if (error) {
            console.error(`❌ Erreur sauvegarde item ${itemId}:`, error);
            totalErrors++;
          } else {
            console.log(`✅ Item ${itemId} sauvegardé avec ${itemData.rangs_a.length} rangs A et ${itemData.rangs_b.length} rangs B`);
            totalProcessed++;
          }
        }

        // Pause entre les requêtes pour éviter la surcharge
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (error) {
        console.error(`❌ Erreur traitement item ${itemId}:`, error);
        totalErrors++;
        
        // En cas d'erreur de session, tenter une reconnexion
        if (error.message.includes('session') || error.message.includes('401')) {
          console.log("🔄 Tentative de reconnexion CAS...");
          try {
            const newSessionCookies = await authenticateCAS(username, password);
            console.log("✅ Reconnexion CAS réussie");
          } catch (reconnectError) {
            console.error("❌ Échec de reconnexion:", reconnectError);
            break; // Arrêter l'extraction en cas d'échec de reconnexion
          }
        }
      }
    }

    return {
      totalProcessed,
      totalErrors,
      extractedItems: extractedItems.slice(0, 3), // Échantillon pour debug
      itemsFound: maxItems - startFrom + 1,
      lastProcessedItem: maxItems
    };

  } catch (error) {
    console.error("❌ Erreur dans l'extraction complète:", error);
    return {
      totalProcessed: 0,
      totalErrors: 1,
      extractedItems: [],
      itemsFound: 0,
      lastProcessedItem: 0,
      error: error.message
    };
  }
}

async function authenticateCAS(username: string, password: string): Promise<string> {
  console.log("🔐 Début de l'authentification CAS UNESS...");
  console.log("🔐 Étape 1: Récupération du formulaire de connexion CAS...");
  
  // Étape 1: Récupérer le formulaire de connexion CAS
  const loginPageResponse = await fetch("https://auth.uness.fr/cas/login", {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1'
    }
  });

  if (!loginPageResponse.ok) {
    throw new Error(`Erreur lors de la récupération de la page de login: ${loginPageResponse.status}`);
  }

  const loginPageHTML = await loginPageResponse.text();
  const loginCookies = extractCookies(loginPageResponse.headers);
  console.log("📋 Cookies de session récupérés");

  // Debug: vérifier si on a bien la page de login
  if (loginPageHTML.includes("Veuillez saisir votre adresse e-mail")) {
    console.log("✅ Page de login CAS récupérée avec succès");
  } else {
    console.log("⚠️ Page inattendue récupérée");
  }

  // Extraire le token CSRF/execution du formulaire
  const executionMatch = loginPageHTML.match(/name="execution" value="([^"]+)"/);
  const execution = executionMatch ? executionMatch[1] : '';
  console.log(`🔑 Token d'exécution CAS: ${execution ? execution.substring(0, 20) + '...' : 'NON TROUVÉ'}`);

  if (!execution) {
    console.log("❌ Token d'exécution non trouvé dans le HTML:");
    console.log(loginPageHTML.substring(0, 1000));
    throw new Error("Token d'exécution CAS non trouvé");
  }

  console.log("🔐 Étape 2: Soumission des credentials...");
  console.log(`🔐 Credentials: ${username} / ***`);

  // Étape 2: Soumettre les credentials
  const formData = new URLSearchParams({
    'username': username,
    'password': password,
    'execution': execution,
    '_eventId': 'submit',
    'geolocation': ''
  });

  const authResponse = await fetch("https://auth.uness.fr/cas/login", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Cookie': loginCookies,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Referer': 'https://auth.uness.fr/cas/login'
    },
    body: formData.toString(),
    redirect: 'manual'
  });

  console.log(`📊 Réponse authentification CAS: ${authResponse.status}`);

  // Debug: afficher la réponse pour voir ce qui se passe
  const responseText = await authResponse.text();
  console.log(`📋 Taille de la réponse: ${responseText.length} caractères`);
  
  if (responseText.includes("Veuillez saisir votre adresse e-mail")) {
    console.log("❌ Encore sur la page de login - authentification échouée");
    console.log("🔍 Détail erreur:", responseText.substring(0, 500));
    throw new Error("Authentification CAS échouée - identifiants incorrects");
  }

  // Vérifier la redirection (succès de l'authentification)
  if (authResponse.status === 302 || authResponse.status === 200) {
    const authCookies = extractCookies(authResponse.headers);
    const combinedCookies = `${loginCookies}; ${authCookies}`;
    console.log("✅ Authentification CAS réussie");
    console.log("✅ Authentification CAS réussie, cookies combinés");
    return combinedCookies;
  }

  throw new Error(`Échec de l'authentification CAS: ${authResponse.status}`);
}

async function extractCompleteItemData(itemId: number, cookies: string): Promise<EdnItem | null> {
  try {
    // URL de l'item spécifique (méthode éprouvée)
    const itemUrl = `https://livret.uness.fr/lisa/2025/Item_de_connaissance_2C/Item_${itemId}`;
    
    console.log(`🔍 Extraction complète de l'item: ${itemUrl}`);
    
    const itemResponse = await fetch(itemUrl, {
      headers: {
        'Cookie': cookies,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!itemResponse.ok) {
      console.warn(`⚠️ Item ${itemId} non accessible: ${itemResponse.status}`);
      return null;
    }

    const itemHTML = await itemResponse.text();
    console.log(`✅ Page item ${itemId} récupérée (${itemHTML.length} caractères)`);

    // Extraction de l'intitulé
    const intituleMatch = itemHTML.match(/<h1[^>]*>([^<]+)<\/h1>/i) || 
                          itemHTML.match(/<title[^>]*>([^<]+)<\/title>/i);
    const intitule = intituleMatch ? intituleMatch[1].trim() : `Item ${itemId}`;

    // ÉTAPE CRUCIALE: Accéder à la version imprimable pour le contenu COMPLET
    console.log(`📋 Accès à la version imprimable pour item ${itemId}...`);
    
    // Essayer plusieurs URLs possibles pour la version imprimable
    const printableUrls = [
      `${itemUrl}/version_imprimable`,
      `${itemUrl}?printable=yes`,
      `${itemUrl}&printable=yes`
    ];

    let contenuCompletHtml = '';
    let printableSuccess = false;

    for (const printableUrl of printableUrls) {
      try {
        console.log(`🔍 Tentative version imprimable: ${printableUrl}`);
        
        const printableResponse = await fetch(printableUrl, {
          headers: {
            'Cookie': cookies,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });

        if (printableResponse.ok) {
          contenuCompletHtml = await printableResponse.text();
          console.log(`✅ Version imprimable récupérée (${contenuCompletHtml.length} caractères)`);
          printableSuccess = true;
          break;
        }
      } catch (error) {
        console.warn(`⚠️ Échec version imprimable ${printableUrl}:`, error.message);
      }
    }

    if (!printableSuccess) {
      console.warn(`⚠️ Toutes les versions imprimables ont échoué pour l'item ${itemId}, utilisation de la page normale`);
      contenuCompletHtml = itemHTML; // Fallback sur la page normale
    }

    // Extraction améliorée des rangs A et B depuis le contenu complet
    const rangsA = extractRangsAdvanced(contenuCompletHtml, 'A', itemId);
    const rangsB = extractRangsAdvanced(contenuCompletHtml, 'B', itemId);

    console.log(`📊 Item ${itemId}: ${rangsA.length} connaissances rang A, ${rangsB.length} connaissances rang B`);

    return {
      item_id: itemId,
      intitule: intitule,
      rangs_a: rangsA,
      rangs_b: rangsB,
      contenu_complet_html: contenuCompletHtml
    };

  } catch (error) {
    console.error(`❌ Erreur extraction complète item ${itemId}:`, error);
    return {
      item_id: itemId,
      intitule: `Item ${itemId}`,
      rangs_a: [],
      rangs_b: [],
      contenu_complet_html: ''
    };
  }
}

function extractRangsAdvanced(html: string, rang: 'A' | 'B', itemId: number): string[] {
  const rangs: string[] = [];
  
  try {
    // Nettoyer le HTML
    const cleanHtml = html.replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, '');
    
    // Patterns multiples pour identifier les sections de rang
    const patterns = [
      // Pattern 1: Titre avec "Rang A" ou "Rang B"
      new RegExp(`<[^>]*>\\s*Rang\\s+${rang}\\s*[:\\-]?\\s*</[^>]*>([\\s\\S]*?)(?=<[^>]*>\\s*Rang\\s+[AB]\\s*|$)`, 'i'),
      // Pattern 2: Simple "Rang A" dans le texte
      new RegExp(`Rang\\s+${rang}[^<]*</[^>]+>([\\s\\S]*?)(?=Rang\\s+[AB]|$)`, 'i'),
      // Pattern 3: Titre hierarchique
      new RegExp(`<h[1-6][^>]*>.*Rang\\s+${rang}.*</h[1-6]>([\\s\\S]*?)(?=<h[1-6][^>]*>.*Rang\\s+[AB]|$)`, 'i'),
      // Pattern 4: Section spécifique
      new RegExp(`<div[^>]*class="[^"]*rang[^"]*${rang.toLowerCase()}[^"]*"[^>]*>([\\s\\S]*?)</div>`, 'i')
    ];

    let content = '';
    
    for (const pattern of patterns) {
      const match = cleanHtml.match(pattern);
      if (match && match[1]) {
        content = match[1];
        console.log(`📝 Pattern trouvé pour rang ${rang} item ${itemId}`);
        break;
      }
    }

    if (content) {
      // Extraction des objectifs/connaissances individuelles
      const objectivePatterns = [
        /<li[^>]*>([\s\S]*?)<\/li>/gi,
        /<p[^>]*>([\s\S]*?)<\/p>/gi,
        /<div[^>]*class="[^"]*objectif[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
        /<tr[^>]*>([\s\S]*?)<\/tr>/gi // Ajouter support des tableaux
      ];

      let objectiveCount = 0;
      
      for (const objPattern of objectivePatterns) {
        let objMatch;
        while ((objMatch = objPattern.exec(content)) !== null) {
          const objectiveHtml = objMatch[1];
          const cleanText = objectiveHtml
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
          
          // Filtrer le contenu valide
          if (cleanText && 
              cleanText.length > 15 && 
              !cleanText.match(/^(rang|objectif|connaissance)\s*$/i) &&
              !cleanText.match(/^\s*[a-z]\s*$/i)) {
            objectiveCount++;
            rangs.push(cleanText);
          }
        }
        
        if (rangs.length > 0) break; // Arrêter dès qu'on trouve du contenu
      }
    }

    // Si aucune connaissance trouvée, créer une connaissance générique
    if (rangs.length === 0) {
      console.warn(`⚠️ Aucune connaissance rang ${rang} trouvée pour item ${itemId}`);
      rangs.push(`Connaissances de rang ${rang} pour l'item ${itemId} - Extraction nécessitant une révision manuelle`);
    }

    console.log(`📋 Rang ${rang} item ${itemId}: ${rangs.length} connaissances extraites`);

  } catch (error) {
    console.error(`❌ Erreur extraction rang ${rang} pour item ${itemId}:`, error);
    rangs.push(`Erreur d'extraction pour rang ${rang} item ${itemId}`);
  }
  
  return rangs;
}

function extractCookies(headers: Headers): string {
  const cookies: string[] = [];
  headers.forEach((value, name) => {
    if (name.toLowerCase() === 'set-cookie') {
      const cookiePart = value.split(';')[0];
      cookies.push(cookiePart);
    }
  });
  return cookies.join('; ');
}