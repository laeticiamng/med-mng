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

interface Connaissance {
  id: string;
  titre: string;
  contenu: string;
  rang: 'A' | 'B';
  item_parent: string;
}

interface EdnItemComplete {
  item_id: number;
  item_title: string;
  item_url: string;
  connaissances: {
    rang_A: Connaissance[];
    rang_B: Connaissance[];
  };
  contenu_html_complet: string;
  extraction_status: 'success' | 'partial' | 'failed';
  extraction_errors: string[];
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

    const { action, resumeFromItem = 1, maxItems = 5, credentials }: ExtractRequest = await req.json();

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
  let extractedItems: EdnItemComplete[] = [];

  // Étape 1: Authentification CAS
  const sessionCookies = await authenticateCAS(username, password);
  console.log("✅ Authentification CAS réussie");

  // Étape 2: Accéder à la liste des items
  console.log("📋 Accès à la liste des items EDN...");
  const itemsListUrl = "https://livret.uness.fr/lisa/2025/Item_de_connaissance_2C";
  
  const itemsResponse = await fetch(itemsListUrl, {
    headers: {
      'Cookie': sessionCookies,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  });

  if (!itemsResponse.ok) {
    throw new Error(`Impossible d'accéder à la liste des items: ${itemsResponse.status}`);
  }

  const itemsListHtml = await itemsResponse.text();
  console.log("✅ Liste des items récupérée");

  // Étape 3: Extraire les liens vers chaque item
  const itemLinks = extractItemLinks(itemsListHtml);
  console.log(`📊 ${itemLinks.length} liens d'items trouvés`);

  // Étape 4: Traiter chaque item individuellement
  const endItem = Math.min(startFrom + maxItems - 1, itemLinks.length);
  
  for (let i = startFrom - 1; i < endItem; i++) {
    const itemLink = itemLinks[i];
    const itemId = i + 1;
    
    try {
      console.log(`\n📄 Traitement item ${itemId}/${itemLinks.length}: ${itemLink.title}`);
      
      const itemData = await extractCompleteItemData(itemLink, sessionCookies, itemId);
      
      if (itemData) {
        extractedItems.push(itemData);
        
        // Sauvegarde en base avec structure complète
        const { error } = await supabase
          .from('edn_items_uness')
          .upsert({
            item_id: itemData.item_id,
            intitule: itemData.item_title,
            rangs_a: itemData.connaissances.rang_A.map(c => c.contenu),
            rangs_b: itemData.connaissances.rang_B.map(c => c.contenu),
            contenu_complet_html: itemData.contenu_html_complet,
            date_import: new Date().toISOString()
          });

        if (error) {
          console.error(`❌ Erreur sauvegarde item ${itemId}:`, error);
          totalErrors++;
        } else {
          console.log(`✅ Item ${itemId} sauvegardé avec ${itemData.connaissances.rang_A.length} connaissances rang A et ${itemData.connaissances.rang_B.length} connaissances rang B`);
          totalProcessed++;
        }
      }

      // Pause entre les requêtes
      await new Promise(resolve => setTimeout(resolve, 2000));

    } catch (error) {
      console.error(`❌ Erreur traitement item ${itemId}:`, error);
      totalErrors++;
    }
  }

  return {
    totalProcessed,
    totalErrors,
    extractedItems: extractedItems.slice(0, 3), // Échantillon pour debug
    itemsFound: itemLinks.length,
    lastProcessedItem: endItem
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

function extractItemLinks(html: string): Array<{title: string, url: string}> {
  const links: Array<{title: string, url: string}> = [];
  
  // Pattern pour extraire les liens vers les items
  const linkPattern = /<a[^>]+href="([^"]*Item_de_connaissance_2C[^"]*)"[^>]*>([^<]+)<\/a>/gi;
  let match;
  
  while ((match = linkPattern.exec(html)) !== null) {
    const url = match[1];
    const title = match[2].trim();
    
    // Construire l'URL complète si nécessaire
    const fullUrl = url.startsWith('http') ? url : `https://livret.uness.fr${url}`;
    
    // Éviter les doublons
    if (!links.some(link => link.url === fullUrl)) {
      links.push({ title, url: fullUrl });
    }
  }
  
  return links;
}

async function extractCompleteItemData(itemLink: {title: string, url: string}, cookies: string, itemId: number): Promise<EdnItemComplete | null> {
  const errors: string[] = [];
  
  try {
    console.log(`🔍 Accès à la page de l'item: ${itemLink.url}`);
    
    // Étape 1: Récupérer la page de l'item
    const itemResponse = await fetch(itemLink.url, {
      headers: {
        'Cookie': cookies,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!itemResponse.ok) {
      errors.push(`Page item non accessible: ${itemResponse.status}`);
      return null;
    }

    const itemHtml = await itemResponse.text();
    
    // Étape 2: Chercher le lien vers la version imprimable
    const printableLinkMatch = itemHtml.match(/href="([^"]*printable[^"]*)"/i) || 
                               itemHtml.match(/href="([^"]*version[_\s]*imprimable[^"]*)"/i);
    
    let printableUrl = '';
    if (printableLinkMatch) {
      printableUrl = printableLinkMatch[1];
      if (!printableUrl.startsWith('http')) {
        printableUrl = `https://livret.uness.fr${printableUrl}`;
      }
    } else {
      // Construire l'URL de la version imprimable manuellement
      printableUrl = `${itemLink.url}?printable=yes`;
    }

    console.log(`📋 Accès à la version imprimable: ${printableUrl}`);

    // Étape 3: Récupérer la version imprimable (contenu complet)
    const printableResponse = await fetch(printableUrl, {
      headers: {
        'Cookie': cookies,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    let contentHtml = '';
    if (printableResponse.ok) {
      contentHtml = await printableResponse.text();
      console.log(`✅ Version imprimable récupérée (${contentHtml.length} caractères)`);
    } else {
      errors.push(`Version imprimable non accessible: ${printableResponse.status}`);
      contentHtml = itemHtml; // Fallback
    }

    // Étape 4: Parser le contenu pour extraire les connaissances par rang
    const connaissancesRangA = extractConnaissancesByRang(contentHtml, 'A', itemId);
    const connaissancesRangB = extractConnaissancesByRang(contentHtml, 'B', itemId);

    console.log(`📊 Extraction terminée: ${connaissancesRangA.length} connaissances rang A, ${connaissancesRangB.length} connaissances rang B`);

    return {
      item_id: itemId,
      item_title: itemLink.title,
      item_url: itemLink.url,
      connaissances: {
        rang_A: connaissancesRangA,
        rang_B: connaissancesRangB
      },
      contenu_html_complet: contentHtml,
      extraction_status: errors.length > 0 ? 'partial' : 'success',
      extraction_errors: errors
    };

  } catch (error) {
    console.error(`❌ Erreur extraction item ${itemId}:`, error);
    errors.push(error.message);
    return {
      item_id: itemId,
      item_title: itemLink.title,
      item_url: itemLink.url,
      connaissances: { rang_A: [], rang_B: [] },
      contenu_html_complet: '',
      extraction_status: 'failed',
      extraction_errors: errors
    };
  }
}

function extractConnaissancesByRang(html: string, rang: 'A' | 'B', itemId: number): Connaissance[] {
  const connaissances: Connaissance[] = [];
  
  try {
    // Nettoyer le HTML et supprimer les balises de script/style
    const cleanHtml = html.replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, '');
    
    // Patterns multiples pour identifier les sections de rang
    const patterns = [
      new RegExp(`<[^>]*>\\s*Rang\\s+${rang}\\s*[:\\-]?\\s*</[^>]*>([\\s\\S]*?)(?=<[^>]*>\\s*Rang\\s+[AB]\\s*|$)`, 'i'),
      new RegExp(`Rang\\s+${rang}[^<]*</[^>]+>([\\s\\S]*?)(?=Rang\\s+[AB]|$)`, 'i'),
      new RegExp(`<h[1-6][^>]*>.*Rang\\s+${rang}.*</h[1-6]>([\\s\\S]*?)(?=<h[1-6][^>]*>.*Rang\\s+[AB]|$)`, 'i')
    ];

    let content = '';
    
    for (const pattern of patterns) {
      const match = cleanHtml.match(pattern);
      if (match && match[1]) {
        content = match[1];
        break;
      }
    }

    if (content) {
      // Extraire les objectifs/connaissances individuelles
      const objectivePatterns = [
        /<li[^>]*>([\s\S]*?)<\/li>/gi,
        /<p[^>]*>([\s\S]*?)<\/p>/gi,
        /<div[^>]*class="[^"]*objectif[^"]*"[^>]*>([\s\S]*?)<\/div>/gi
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
          
          if (cleanText && cleanText.length > 10) {
            objectiveCount++;
            connaissances.push({
              id: `IC-${itemId}-${objectiveCount.toString().padStart(2, '0')}-${rang}`,
              titre: `Objectif ${objectiveCount} - Rang ${rang}`,
              contenu: cleanText,
              rang: rang,
              item_parent: `IC-${itemId}`
            });
          }
        }
        
        if (connaissances.length > 0) break;
      }
    }

    // Si aucune connaissance trouvée avec les patterns, créer une connaissance générique
    if (connaissances.length === 0) {
      console.warn(`⚠️ Aucune connaissance rang ${rang} trouvée pour item ${itemId}, création d'une connaissance générique`);
      connaissances.push({
        id: `IC-${itemId}-01-${rang}`,
        titre: `Connaissance générale Rang ${rang}`,
        contenu: `Connaissances de rang ${rang} pour l'item ${itemId} - contenu à extraire manuellement`,
        rang: rang,
        item_parent: `IC-${itemId}`
      });
    }

  } catch (error) {
    console.error(`❌ Erreur extraction rang ${rang} pour item ${itemId}:`, error);
  }
  
  return connaissances;
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