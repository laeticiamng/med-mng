import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";

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

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { action, resumeFromItem = 1, credentials }: ExtractRequest = await req.json();

    console.log(`🚀 Starting EDN extraction - Action: ${action}, Resume from item: ${resumeFromItem}`);

    // Validation des credentials depuis les secrets Supabase
    const username = credentials?.username || Deno.env.get("CAS_USERNAME");
    const password = credentials?.password || Deno.env.get("CAS_PASSWORD");

    if (!username || !password) {
      throw new Error("Credentials UNESS manquants (username/password)");
    }

    const results = await extractEdnItems(supabaseClient, username, password, resumeFromItem);

    return new Response(JSON.stringify({
      success: true,
      message: `Extraction terminée avec succès`,
      stats: results
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("❌ Erreur extraction EDN:", error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: error.stack 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function extractEdnItems(supabase: any, username: string, password: string, startFrom: number) {
  console.log("🔐 Début de l'authentification CAS UNESS...");
  
  let totalProcessed = 0;
  let totalErrors = 0;
  const maxItems = 367;

  // Étape 1: Authentification CAS
  const sessionCookies = await authenticateCAS(username, password);
  console.log("✅ Authentification CAS réussie");

  // Étape 2: Navigation vers la page des items
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

  // Étape 3: Extraction de chaque item
  for (let itemId = startFrom; itemId <= maxItems; itemId++) {
    try {
      console.log(`📄 Traitement item ${itemId}/${maxItems}...`);
      
      const itemData = await extractSingleItem(itemId, sessionCookies);
      
      if (itemData) {
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
          console.log(`✅ Item ${itemId} sauvegardé avec succès`);
          totalProcessed++;
        }
      }

      // Pause entre les requêtes pour éviter la surcharge
      await new Promise(resolve => setTimeout(resolve, 1000));

    } catch (error) {
      console.error(`❌ Erreur traitement item ${itemId}:`, error);
      totalErrors++;
      
      // En cas d'erreur de session, tenter une reconnexion
      if (error.message.includes('session') || error.message.includes('401')) {
        console.log("🔄 Tentative de reconnexion CAS...");
        try {
          const newSessionCookies = await authenticateCAS(username, password);
          console.log("✅ Reconnexion CAS réussie");
          // Mettre à jour les cookies de session
          Object.assign(sessionCookies, newSessionCookies);
        } catch (reconnectError) {
          console.error("❌ Échec de reconnexion:", reconnectError);
          throw new Error(`Impossible de se reconnecter après l'item ${itemId}`);
        }
      }
    }
  }

  return {
    totalProcessed,
    totalErrors,
    lastProcessedItem: maxItems
  };
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

async function extractSingleItem(itemId: number, cookies: string): Promise<EdnItem | null> {
  try {
    // URL de l'item spécifique
    const itemUrl = `https://livret.uness.fr/lisa/2025/Item_de_connaissance_2C/Item_${itemId}`;
    
    console.log(`🔍 Extraction de l'item: ${itemUrl}`);
    
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

    // Extraction de l'intitulé
    const intituleMatch = itemHTML.match(/<h1[^>]*>([^<]+)<\/h1>/i) || 
                          itemHTML.match(/<title[^>]*>([^<]+)<\/title>/i);
    const intitule = intituleMatch ? intituleMatch[1].trim() : `Item ${itemId}`;

    // Extraction des rangs A et B
    const rangsA = extractRangs(itemHTML, 'Rang A');
    const rangsB = extractRangs(itemHTML, 'Rang B');

    // Récupération du contenu complet via version imprimable
    const printableUrl = `${itemUrl}/version_imprimable`;
    const printableResponse = await fetch(printableUrl, {
      headers: {
        'Cookie': cookies,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    let contenuCompletHtml = '';
    if (printableResponse.ok) {
      contenuCompletHtml = await printableResponse.text();
    } else {
      console.warn(`⚠️ Version imprimable non accessible pour l'item ${itemId}`);
      contenuCompletHtml = itemHTML; // Fallback sur la page normale
    }

    return {
      item_id: itemId,
      intitule: intitule,
      rangs_a: rangsA,
      rangs_b: rangsB,
      contenu_complet_html: contenuCompletHtml
    };

  } catch (error) {
    console.error(`❌ Erreur extraction item ${itemId}:`, error);
    return null;
  }
}

function extractRangs(html: string, rangType: string): string[] {
  const rangs: string[] = [];
  
  try {
    // Parser HTML avec DOMParser si disponible
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    if (doc) {
      // Chercher par sélecteurs CSS plus précis
      const selectors = [
        `h2:contains("${rangType}") + ul li`,
        `h3:contains("${rangType}") + ul li`,
        `th:contains("${rangType}") + td li`,
        `.rang-${rangType.toLowerCase().replace(' ', '-')} li`,
        `[data-rang="${rangType}"] li`
      ];
      
      for (const selector of selectors) {
        try {
          const elements = doc.querySelectorAll(selector);
          if (elements.length > 0) {
            elements.forEach(el => {
              const text = el.textContent?.trim();
              if (text && text.length > 10 && text.length < 500) {
                rangs.push(text);
              }
            });
            if (rangs.length > 0) break;
          }
        } catch (e) {
          continue;
        }
      }
    }
  } catch (e) {
    console.warn('⚠️ Erreur parsing DOM, fallback sur regex');
  }
  
  // Fallback sur les patterns regex améliorés
  if (rangs.length === 0) {
    const patterns = [
      // Headers avec listes qui suivent
      new RegExp(`<h[2-6][^>]*>.*?${rangType}.*?</h[2-6]>\\s*<ul[^>]*>([\\s\\S]*?)</ul>`, 'i'),
      new RegExp(`<th[^>]*>.*?${rangType}.*?</th>\\s*<td[^>]*>([\\s\\S]*?)</td>`, 'i'),
      
      // Sections avec div ou span
      new RegExp(`<div[^>]*class="[^"]*${rangType.toLowerCase()}[^"]*"[^>]*>([\\s\\S]*?)</div>`, 'i'),
      
      // Patterns WikiText
      new RegExp(`===?\\s*${rangType}\\s*===?([\\s\\S]*?)(?====|$)`, 'i'),
      
      // Patterns génériques améliorés
      new RegExp(`${rangType}[^<]*</h[^>]+>([\\s\\S]*?)(?=<h[^>]+>|Rang\\s+[AB]|$)`, 'i'),
      new RegExp(`<[^>]*>${rangType}[^<]*</[^>]+>([\\s\\S]*?)(?=<[^>]*>Rang\\s+[AB]|$)`, 'i')
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        const content = match[1];
        
        // Extraire les éléments de liste de manière robuste
        const listMatches = [
          ...Array.from(content.matchAll(/<li[^>]*>([^<]+)<\/li>/gi)),
          ...Array.from(content.matchAll(/<p[^>]*>\*\s*([^<]+)<\/p>/gi)),
          ...Array.from(content.matchAll(/\*\s*([^\n*]{10,200})/g))
        ];
        
        listMatches.forEach(match => {
          if (match[1]) {
            const cleanText = match[1]
              .replace(/<[^>]+>/g, '')
              .replace(/&[^;]+;/g, ' ')
              .trim();
            if (cleanText && cleanText.length > 10 && cleanText.length < 500) {
              rangs.push(cleanText);
            }
          }
        });
        
        if (rangs.length > 0) break;
      }
    }
  }

  // Nettoyer et valider les résultats
  return rangs
    .map(rang => rang.trim())
    .filter(rang => rang.length > 5 && rang.length < 500)
    .slice(0, 20); // Limiter à 20 éléments max
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