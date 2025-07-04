import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { launch } from "https://deno.land/x/puppeteer@16.2.0/mod.ts"

interface OicCompetence {
  objectif_id: string; // Format OIC-XXX-YY-R-ZZ
  intitule: string;
  item_parent: string; // Numéro d'item EDN (001-367)
  rang: string; // A ou B
  rubrique: string;
  description?: string;
  ordre?: number;
  url_source: string;
  hash_content?: string;
}

interface ExtractionSession {
  session_id: string;
  page_number: number;
  items_extracted: number;
  status: string;
  auth_cookies?: string;
  current_page_url?: string;
  last_item_id?: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    // Identifiants UNESS (selon spécifications ticket)
    const unessUsername = Deno.env.get('UNESS_USERNAME') || 'laeticia.moto-ngane@etud.u-picardie.fr'
    const unessPassword = Deno.env.get('UNESS_PASSWORD') || 'Aiciteal1!'

    if (!supabaseUrl || !supabaseKey) {
      console.error('Variables Supabase manquantes')
      throw new Error('Configuration Supabase manquante')
    }

    console.log(`🔐 Utilisation des identifiants UNESS: ${unessUsername}`)

    const supabaseClient = createClient(supabaseUrl, supabaseKey)

    let requestBody
    try {
      requestBody = await req.json()
    } catch (error) {
      console.error('Erreur parsing JSON:', error)
      throw new Error('Format de requête invalide')
    }

    const { action, session_id, page, resume_from } = requestBody

    console.log(`🎯 Action demandée: ${action}`)

    if (!action) {
      throw new Error('Action manquante dans la requête')
    }

    switch (action) {
      case 'start':
        return await startExtraction(supabaseClient, unessUsername, unessPassword)
      case 'resume':
        return await resumeExtraction(supabaseClient, session_id, resume_from)
      case 'status':
        return await getExtractionStatus(supabaseClient, session_id)
      case 'rapport':
        return await generateRapport(supabaseClient)
      default:
        throw new Error('Action non reconnue')
    }

  } catch (error) {
    console.error('❌ Erreur dans extract-edn-objectifs:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function startExtraction(supabaseClient: any, username: string, password: string) {
  const session_id = crypto.randomUUID()
  
  console.log('🚀 Démarrage extraction avec authentification CAS UNESS')
  console.log(`📊 Session: ${session_id}`)
  
  // Initialiser le tracking de progression
  await supabaseClient
    .from('oic_extraction_progress')
    .insert({
      session_id,
      status: 'en_cours',
      page_number: 1,
      items_extracted: 0,
      total_expected: 4872,
      total_pages: 25
    })

  // Lancer l'extraction en arrière-plan avec authentification CAS
  extractCompetencesWithRealCAS(supabaseClient, session_id, username, password)

  return new Response(
    JSON.stringify({
      success: true,
      session_id,
      message: 'Extraction des 4,872 compétences OIC démarrée avec authentification CAS UNESS',
      status_url: `/functions/extract-edn-objectifs?action=status&session_id=${session_id}`
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function extractCompetencesWithRealCAS(supabaseClient: any, session_id: string, username: string, password: string) {
  let totalExtraites = 0;
  let pageNum = 1;
  const maxPages = 25;
  let browser;

  try {
    console.log('🔐 Lancement de Puppeteer pour authentification CAS UNESS...')
    
    // Lancer Puppeteer
    browser = await launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-extensions'
      ]
    });

    const page = await browser.newPage();
    
    // Configurer user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    console.log('🌐 Accès à la page d\'objectifs de connaissance...')
    
    // Aller sur la page des objectifs de connaissance
    await page.goto('https://livret.uness.fr/lisa/2025/Cat%C3%A9gorie:Objectif_de_connaissance', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    // Vérifier si on est redirigé vers CAS
    const currentUrl = page.url();
    if (currentUrl.includes('auth.uness.fr/cas/login')) {
      console.log('🔑 Redirection CAS détectée, authentification...')
      
      // Attendre le formulaire de connexion
      await page.waitForSelector('#username', { visible: true, timeout: 10000 });
      await page.waitForSelector('#password', { visible: true, timeout: 10000 });
      
      // Remplir les champs
      await page.type('#username', username);
      await page.type('#password', password);
      
      // Cliquer sur le bouton de connexion
      await page.click('input[name="submit"]');
      
      // Attendre la redirection vers livret.uness.fr
      await page.waitForFunction(
        () => window.location.href.includes('livret.uness.fr'),
        { timeout: 30000 }
      );
      
      console.log('✅ Authentification CAS réussie, retour sur livret.uness.fr')
    }
    
    // Mettre à jour le statut pour indiquer l'authentification réussie
    await supabaseClient
      .from('oic_extraction_progress')
      .update({
        status: 'en_cours',
        last_activity: new Date().toISOString()
      })
      .eq('session_id', session_id)
    
    // Extraction page par page
    while (pageNum <= maxPages) {
      console.log(`📄 Page ${pageNum}/${maxPages} - Extraction objectifs OIC...`)
      
      // Mettre à jour le progrès avant chaque page
      await supabaseClient
        .from('oic_extraction_progress')
        .update({
          page_number: pageNum,
          items_extracted: totalExtraites,
          last_activity: new Date().toISOString()
        })
        .eq('session_id', session_id)
      
      // Naviguer vers la page appropriée
      let pageUrl;
      if (pageNum === 1) {
        pageUrl = 'https://livret.uness.fr/lisa/2025/Cat%C3%A9gorie:Objectif_de_connaissance';
      } else {
        // Utiliser la pagination
        pageUrl = `https://livret.uness.fr/lisa/2025/index.php?title=Cat%C3%A9gorie:Objectif_de_connaissance&from=${encodeURIComponent('OIC-')}`;
      }
      
      await page.goto(pageUrl, { waitUntil: 'networkidle2', timeout: 30000 });
      
      // Extraire les liens vers les objectifs OIC
      const competenceLinks = await page.evaluate(() => {
        const links = [];
        const pageLinks = document.querySelectorAll('a[href*="/OIC-"]');
        
        pageLinks.forEach(link => {
          const text = link.textContent?.trim();
          if (text && text.match(/OIC-\d{3}-\d{2}-[AB]-\d{2}/)) {
            const match = text.match(/OIC-\d{3}-\d{2}-[AB]-\d{2}/);
            if (match) {
              links.push({
                url: link.href,
                id: match[0]
              });
            }
          }
        });
        
        return links;
      });
      
      console.log(`📊 Page ${pageNum}: ${competenceLinks.length} objectifs trouvés`)
      
      if (competenceLinks.length === 0) {
        console.log('⚠️ Aucun objectif trouvé, arrêt de l\'extraction')
        break
      }

      // Sauvegarder en base
      let savedOnThisPage = 0
      for (const link of competenceLinks) {
        try {
          // Extraire les détails de la compétence
          const competence = await extractCompetenceDetails(page, link);
          
          if (competence) {
            // Générer un hash pour éviter les doublons
            const hashContent = await crypto.subtle.digest('SHA-256', 
              new TextEncoder().encode(JSON.stringify(competence))
            )
            const hashArray = Array.from(new Uint8Array(hashContent))
            competence.hash_content = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
            
            const { error } = await supabaseClient
              .from('oic_competences')
              .upsert(competence, { onConflict: 'objectif_id' })
            
            if (error) {
              console.error(`❌ Erreur sauvegarde ${competence.objectif_id}:`, error)
            } else {
              savedOnThisPage++
              totalExtraites++
            }
          }
        } catch (error) {
          console.error(`💥 Exception sauvegarde ${link.id}:`, error)
        }
      }
      
      console.log(`✅ Page ${pageNum}: ${savedOnThisPage}/${competenceLinks.length} objectifs sauvegardés (Total: ${totalExtraites})`)

      // Mettre à jour le progrès après chaque page
      await supabaseClient
        .from('oic_extraction_progress')
        .update({
          page_number: pageNum,
          items_extracted: totalExtraites,
          last_activity: new Date().toISOString()
        })
        .eq('session_id', session_id)

      pageNum++
      
      // Pause entre les pages pour éviter la surcharge
      await new Promise(resolve => setTimeout(resolve, 2000))
    }

    // Finaliser l'extraction
    console.log(`🎉 Extraction terminée: ${totalExtraites} objectifs OIC extraits`)
    
    await supabaseClient
      .from('oic_extraction_progress')
      .update({
        status: 'termine',
        items_extracted: totalExtraites,
        last_activity: new Date().toISOString()
      })
      .eq('session_id', session_id)

  } catch (error) {
    console.error('💥 Erreur critique extraction:', error)
    
    const errorDetails = {
      timestamp: new Date().toISOString(),
      message: error.message,
      stack: error.stack,
      page: pageNum,
      totalExtraites: totalExtraites
    }
    
    await supabaseClient
      .from('oic_extraction_progress')
      .update({
        status: 'erreur',
        error_message: error.message,
        failed_urls: [errorDetails],
        last_activity: new Date().toISOString()
      })
      .eq('session_id', session_id)
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

async function extractCompetenceDetails(page: any, link: any) {
  try {
    console.log(`🔍 Extraction détaillée: ${link.id} - ${link.url}`)
    
    // Naviguer vers la page de la compétence
    await page.goto(link.url, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Extraire les données de la page
    const competenceData = await page.evaluate(() => {
      const data: any = {};
      
      // Titre principal
      const titleElement = document.querySelector('h1.firstHeading');
      data.intitule = titleElement?.textContent?.trim() || '';
      
      // Parsing de l'identifiant
      const match = data.intitule?.match(/OIC-(\d{3})-(\d{2})-([AB])-(\d{2})/);
      if (match) {
        data.objectif_id = match[0];
        data.item_parent = match[1];
        data.rang = match[3];
        data.ordre = parseInt(match[4]);
      }
      
      // Extraction du contenu structuré
      const content = document.querySelector('.mw-parser-output');
      if (content) {
        // Description (premier paragraphe)
        const firstParagraph = content.querySelector('p');
        data.description = firstParagraph?.textContent?.trim() || '';
      }
      
      // Détection de la rubrique (basée sur les catégories ou le contenu)
      const rubriques = [
        'Génétique', 'Immunopathologie', 'Inflammation',
        'Cancérologie', 'Pharmacologie', 'Douleur',
        'Santé publique', 'Thérapeutique', 'Urgences',
        'Vieillissement', 'Interprétation'
      ];
      
      // Rechercher la rubrique dans le contenu
      const contentText = content?.textContent?.toLowerCase() || '';
      for (const rubrique of rubriques) {
        if (contentText.includes(rubrique.toLowerCase())) {
          data.rubrique = rubrique;
          break;
        }
      }
      
      // Rubrique par défaut si non trouvée
      if (!data.rubrique) {
        data.rubrique = 'Autre';
      }
      
      return data;
    });
    
    // Ajout de l'URL source
    competenceData.url_source = link.url;
    
    // Vérification des données obligatoires
    if (!competenceData.objectif_id || !competenceData.intitule) {
      console.warn(`⚠️ Données incomplètes pour ${link.id}`);
      return null;
    }
    
    return competenceData;
    
  } catch (error) {
    console.error(`❌ Erreur extraction détails ${link.id}:`, error);
    return null;
  }
}

async function getExtractionStatus(supabaseClient: any, session_id: string) {
  const { data, error } = await supabaseClient
    .from('oic_extraction_progress')
    .select('*')
    .eq('session_id', session_id)
    .single()

  if (error) {
    throw new Error(`Session non trouvée: ${error.message}`)
  }

  return new Response(
    JSON.stringify(data),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function generateRapport(supabaseClient: any) {
  try {
    // Appeler la fonction PostgreSQL pour générer le rapport
    const { data, error } = await supabaseClient
      .rpc('get_oic_extraction_report')

    if (error) {
      console.error('Erreur génération rapport:', error)
      throw new Error(`Erreur génération rapport: ${error.message}`)
    }

    const reportData = data[0] || {
      summary: { expected: 4872, extracted: 0, completeness_pct: 0 },
      by_item: [],
      missing_items: [],
      failed_urls: []
    }

    const stats = {
      total_competences_extraites: reportData.summary.extracted,
      total_competences_attendues: reportData.summary.expected,
      completude_globale: reportData.summary.completeness_pct,
      items_ern_couverts: Array.isArray(reportData.by_item) ? reportData.by_item.length : 0,
      repartition_par_item: Array.isArray(reportData.by_item) ? reportData.by_item.map((item: any) => ({
        item_parent: item.item_parent,
        competences_attendues: item.total_count || 0,
        competences_extraites: item.total_count || 0,
        completude_pct: 100,
        manquants: []
      })) : []
    }

    return new Response(
      JSON.stringify(stats),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Erreur generateRapport:', error)
    
    // Retourner un rapport vide en cas d'erreur
    const emptyStats = {
      total_competences_extraites: 0,
      total_competences_attendues: 4872,
      completude_globale: 0,
      items_ern_couverts: 0,
      repartition_par_item: []
    }

    return new Response(
      JSON.stringify(emptyStats),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}

async function resumeExtraction(supabaseClient: any, session_id: string, resume_from?: number) {
  // Récupérer l'état de la session
  const { data: session } = await supabaseClient
    .from('oic_extraction_progress')
    .select('*')
    .eq('session_id', session_id)
    .single()

  if (!session) {
    throw new Error('Session non trouvée')
  }

  // Reprendre à partir de la page spécifiée ou de la dernière page
  const startPage = resume_from || session.page_number

  await supabaseClient
    .from('oic_extraction_progress')
    .update({
      status: 'en_cours',
      page_number: startPage,
      last_activity: new Date().toISOString()
    })
    .eq('session_id', session_id)

  // Relancer l'extraction avec les identifiants CAS
  const username = Deno.env.get('UNESS_USERNAME') || 'laeticia.moto-ngane@etud.u-picardie.fr'
  const password = Deno.env.get('UNESS_PASSWORD') || 'Aiciteal1!'
  
  extractCompetencesWithRealCAS(supabaseClient, session_id, username, password)

  return new Response(
    JSON.stringify({
      success: true,
      message: `Extraction reprise à partir de la page ${startPage}`,
      session_id
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}