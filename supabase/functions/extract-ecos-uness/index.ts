import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ExtractRequest {
  action: 'start' | 'resume';
  resumeFromSD?: number;
  credentials?: {
    username: string;
    password: string;
  };
}

interface EcosSituation {
  sd_id: number;
  intitule_sd: string;
  contenu_complet_html: string;
  competences_associees: string[];
  url_source: string;
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

    const { action, resumeFromSD = 1, credentials }: ExtractRequest = await req.json();

    console.log(`🚀 Starting ECOS extraction - Action: ${action}, Resume from SD: ${resumeFromSD}`);

    // Validation des credentials
    const username = credentials?.username || Deno.env.get("UNESS_USERNAME");
    const password = credentials?.password || Deno.env.get("UNESS_PASSWORD");

    if (!username || !password) {
      throw new Error("Credentials UNESS manquants (username/password)");
    }

    const results = await extractEcosSituations(supabaseClient, username, password, resumeFromSD);

    return new Response(JSON.stringify({
      success: true,
      message: `Extraction ECOS terminée avec succès`,
      stats: results
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("❌ Erreur extraction ECOS:", error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: error.stack 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function extractEcosSituations(supabase: any, username: string, password: string, startFrom: number) {
  console.log("🔐 Début de l'authentification CAS UNESS pour ECOS...");
  
  let totalProcessed = 0;
  let totalErrors = 0;

  // Étape 1: Authentification CAS
  const sessionCookies = await authenticateCAS(username, password);
  console.log("✅ Authentification CAS réussie");

  // Étape 2: Navigation vers la page des situations de départ ECOS
  const ecosPageResponse = await fetch("https://livret.uness.fr/lisa/2025/Situation_de_depart", {
    headers: {
      'Cookie': sessionCookies,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  });

  if (!ecosPageResponse.ok) {
    throw new Error(`Impossible d'accéder à la page ECOS: ${ecosPageResponse.status}`);
  }

  const ecosPageHTML = await ecosPageResponse.text();
  console.log("📋 Début de l'extraction des situations ECOS...");

  // Étape 3: Extraction des liens des situations
  const situationLinks = extractSituationLinks(ecosPageHTML);
  console.log(`🔍 ${situationLinks.length} situations trouvées`);

  // Étape 4: Extraction de chaque situation
  for (let i = Math.max(0, startFrom - 1); i < situationLinks.length; i++) {
    const link = situationLinks[i];
    const sdId = i + 1;
    
    try {
      console.log(`📄 Traitement situation ${sdId}/${situationLinks.length}: ${link.title}`);
      
      const situationData = await extractSingleSituation(sdId, link, sessionCookies);
      
      if (situationData) {
        // Enregistrement en base
        const { error } = await supabase
          .from('ecos_situations_uness')
          .upsert({
            sd_id: situationData.sd_id,
            intitule_sd: situationData.intitule_sd,
            contenu_complet_html: situationData.contenu_complet_html,
            competences_associees: situationData.competences_associees,
            url_source: situationData.url_source,
            date_import: new Date().toISOString()
          });

        if (error) {
          console.error(`❌ Erreur sauvegarde situation ${sdId}:`, error);
          totalErrors++;
        } else {
          console.log(`✅ Situation ${sdId} sauvegardée avec succès`);
          totalProcessed++;
        }
      }

      // Pause entre les requêtes
      await new Promise(resolve => setTimeout(resolve, 1500));

    } catch (error) {
      console.error(`❌ Erreur traitement situation ${sdId}:`, error);
      totalErrors++;
      
      // En cas d'erreur de session, tenter une reconnexion
      if (error.message.includes('session') || error.message.includes('401')) {
        console.log("🔄 Tentative de reconnexion CAS...");
        try {
          const newSessionCookies = await authenticateCAS(username, password);
          console.log("✅ Reconnexion CAS réussie");
          Object.assign(sessionCookies, newSessionCookies);
        } catch (reconnectError) {
          console.error("❌ Échec de reconnexion:", reconnectError);
          throw new Error(`Impossible de se reconnecter après la situation ${sdId}`);
        }
      }
    }
  }

  return {
    totalProcessed,
    totalErrors,
    lastProcessedSituation: situationLinks.length
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

function extractSituationLinks(html: string): Array<{url: string, title: string}> {
  const links: Array<{url: string, title: string}> = [];
  
  // Patterns pour identifier les liens vers les situations
  const linkPatterns = [
    /<a[^>]+href="([^"]*Situation_de_depart[^"]*)"[^>]*>([^<]+)<\/a>/gi,
    /<a[^>]+href="([^"]*SD_[^"]*)"[^>]*>([^<]+)<\/a>/gi
  ];

  for (const pattern of linkPatterns) {
    let match;
    while ((match = pattern.exec(html)) !== null) {
      const url = match[1].startsWith('http') ? match[1] : `https://livret.uness.fr${match[1]}`;
      const title = match[2].trim();
      
      if (title && !links.some(l => l.url === url)) {
        links.push({ url, title });
      }
    }
  }

  return links;
}

async function extractSingleSituation(sdId: number, link: {url: string, title: string}, cookies: string): Promise<EcosSituation | null> {
  try {
    console.log(`🔍 Extraction de la situation: ${link.url}`);
    
    const situationResponse = await fetch(link.url, {
      headers: {
        'Cookie': cookies,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!situationResponse.ok) {
      console.warn(`⚠️ Situation ${sdId} non accessible: ${situationResponse.status}`);
      return null;
    }

    const situationHTML = await situationResponse.text();

    // Extraction de l'intitulé
    const intituleMatch = situationHTML.match(/<h1[^>]*>([^<]+)<\/h1>/i) || 
                         situationHTML.match(/<title[^>]*>([^<]+)<\/title>/i);
    const intitule = intituleMatch ? intituleMatch[1].trim() : link.title;

    // Extraction des compétences
    const competences = extractCompetences(situationHTML);

    // Récupération du contenu complet via version imprimable
    const printableUrl = `${link.url}/version_imprimable`;
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
      console.warn(`⚠️ Version imprimable non accessible pour la situation ${sdId}`);
      contenuCompletHtml = situationHTML; // Fallback sur la page normale
    }

    return {
      sd_id: sdId,
      intitule_sd: intitule,
      contenu_complet_html: contenuCompletHtml,
      competences_associees: competences,
      url_source: link.url
    };

  } catch (error) {
    console.error(`❌ Erreur extraction situation ${sdId}:`, error);
    return null;
  }
}

function extractCompetences(html: string): string[] {
  const competences: string[] = [];
  
  // Patterns pour identifier les compétences
  const patterns = [
    /compétence[^<]*<\/[^>]+>([^<]+)/gi,
    /objectif[^<]*<\/[^>]+>([^<]+)/gi,
    /<li[^>]*>([^<]*compétence[^<]*)<\/li>/gi
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(html)) !== null) {
      const competence = match[1].trim();
      if (competence && competence.length > 5 && !competences.includes(competence)) {
        competences.push(competence);
      }
    }
  }

  return competences;
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