import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ExtractRequest {
  action: 'start' | 'resume' | 'test';
  resumeFromItem?: number;
  maxItems?: number;
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
  extraction_status: 'success' | 'partial' | 'failed';
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { action, resumeFromItem = 1, maxItems = 3, credentials }: ExtractRequest = await req.json();

    console.log(`🚀 Starting EDN COMPLETE extraction - Action: ${action}, Items: ${resumeFromItem} to ${resumeFromItem + maxItems - 1}`);

    // Validation des credentials
    const username = credentials?.username || "laeticia.moto-ngane@etud.u-picardie.fr";
    const password = credentials?.password || "Aiciteal1!";

    if (!username || !password) {
      throw new Error("Credentials UNESS manquants (username/password)");
    }

    const results = await extractCompleteEdnItems(supabaseClient, username, password, resumeFromItem, maxItems);

    return new Response(JSON.stringify({
      success: true,
      message: `Extraction complète terminée avec succès`,
      stats: results
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("❌ Erreur extraction EDN complète:", error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: error.stack 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function extractCompleteEdnItems(supabase: any, username: string, password: string, startFrom: number, maxItems: number) {
  console.log("🔐 Début de l'authentification CAS UNESS...");
  
  let totalProcessed = 0;
  let totalErrors = 0;
  let extractedItems: EdnItem[] = [];

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
    const endItem = startFrom + maxItems - 1;
    
    for (let itemId = startFrom; itemId <= endItem; itemId++) {
      try {
        console.log(`📄 Traitement item ${itemId}/${endItem}...`);
        
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
      itemsFound: endItem - startFrom + 1,
      lastProcessedItem: endItem
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
  // Étape 1: Récupérer le formulaire de connexion CAS
  const loginPageResponse = await fetch("https://auth.uness.fr/cas/login", {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  });

  if (!loginPageResponse.ok) {
    throw new Error(`Impossible d'accéder à la page de connexion CAS: ${loginPageResponse.status}`);
  }

  const loginPageHTML = await loginPageResponse.text();
  const loginCookies = extractCookies(loginPageResponse.headers);

  // Extraire le token CSRF/execution du formulaire
  const executionMatch = loginPageHTML.match(/name="execution" value="([^"]+)"/);
  const execution = executionMatch ? executionMatch[1] : '';

  // Étape 2: Soumettre les credentials
  const formData = new URLSearchParams({
    'username': username,
    'password': password,
    'execution': execution,
    '_eventId': 'submit'
  });

  const authResponse = await fetch("https://auth.uness.fr/cas/login", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Cookie': loginCookies,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    body: formData,
    redirect: 'manual'
  });

  // Vérifier la redirection (succès de l'authentification)
  if (authResponse.status === 302 || authResponse.status === 200) {
    const authCookies = extractCookies(authResponse.headers);
    return `${loginCookies}; ${authCookies}`;
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
      contenu_complet_html: contenuCompletHtml,
      extraction_status: (rangsA.length > 0 || rangsB.length > 0) ? 'success' : 'partial'
    };

  } catch (error) {
    console.error(`❌ Erreur extraction complète item ${itemId}:`, error);
    return {
      item_id: itemId,
      intitule: `Item ${itemId}`,
      rangs_a: [],
      rangs_b: [],
      contenu_complet_html: '',
      extraction_status: 'failed'
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