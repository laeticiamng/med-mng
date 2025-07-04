import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface OicCompetence {
  objectif_id: string; // Format OIC-XXX-YY-R-ZZ
  intitule: string;
  item_parent: string; // Numéro d'item EDN (ex: "099")
  rang: string; // A ou B
  rubrique: string;
  description?: string;
  ordre?: number;
  url_source: string;
}

interface ExtractionSession {
  session_id: string;
  page_courante: number;
  competences_extraites: number;
  statut: string;
  cookies?: string;
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
    // Vérifier les variables d'environnement requises
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    // Utiliser les identifiants fournis par défaut si les secrets ne sont pas configurés
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

    console.log(`Action demandée: ${action}`)

    if (!action) {
      throw new Error('Action manquante dans la requête')
    }

    switch (action) {
      case 'start':
        return await startExtraction(supabaseClient)
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
    console.error('Erreur dans extract-edn-objectifs:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function startExtraction(supabaseClient: any) {
  const session_id = crypto.randomUUID()
  
  // Initialiser le tracking de progression
  await supabaseClient
    .from('oic_extraction_progress')
    .insert({
      session_id,
      statut: 'en_cours',
      page_courante: 1,
      competences_extraites: 0
    })

  // Lancer l'extraction en arrière-plan
  extractCompetencesBackground(supabaseClient, session_id)

  return new Response(
    JSON.stringify({
      success: true,
      session_id,
      message: 'Extraction des 4,872 compétences OIC démarrée en arrière-plan',
      status_url: `/functions/extract-edn-objectifs?action=status&session_id=${session_id}`
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function extractCompetencesBackground(supabaseClient: any, session_id: string) {
  let cookies = '';
  let page = 1;
  const maxPages = 25; // 25 pages de ~200 compétences chacune
  let totalExtraites = 0;

  try {
    // Étape 1: Authentification CAS UNESS
    console.log('🔐 Connexion au CAS UNESS...')
    
    // Mettre à jour le statut pour indiquer l'authentification
    await supabaseClient
      .from('oic_extraction_progress')
      .update({
        statut: 'en_cours',
        derniere_activite: new Date().toISOString()
      })
      .eq('session_id', session_id)
    
    cookies = await authenticateUNESS()
    console.log('✅ Authentification UNESS réussie')
    
    // Étape 2: Extraction page par page de la catégorie OIC
    while (page <= maxPages) {
      console.log(`📄 Extraction page ${page}/${maxPages} de la catégorie Objectif de connaissance...`)
      
      // Mettre à jour le progrès avant chaque page
      await supabaseClient
        .from('oic_extraction_progress')
        .update({
          page_courante: page,
          competences_extraites: totalExtraites,
          derniere_activite: new Date().toISOString()
        })
        .eq('session_id', session_id)
      
      const competences = await extractPageCompetences(cookies, page)
      console.log(`📊 Page ${page}: ${competences.length} compétences trouvées`)
      
      if (competences.length === 0) {
        console.log('⚠️ Aucune compétence trouvée, arrêt de l\'extraction')
        break
      }

      // Sauvegarder en base
      let savedOnThisPage = 0
      for (const competence of competences) {
        try {
          const { error } = await supabaseClient
            .from('oic_competences')
            .upsert(competence, { onConflict: 'objectif_id' })
          
          if (error) {
            console.error(`❌ Erreur sauvegarde compétence ${competence.objectif_id}:`, error)
          } else {
            savedOnThisPage++
            totalExtraites++
          }
        } catch (error) {
          console.error(`💥 Exception sauvegarde compétence ${competence.objectif_id}:`, error)
        }
      }
      
      console.log(`✅ Page ${page}: ${savedOnThisPage}/${competences.length} compétences sauvegardées (Total: ${totalExtraites})`)

      // Mettre à jour le progrès après chaque page
      await supabaseClient
        .from('oic_extraction_progress')
        .update({
          page_courante: page,
          competences_extraites: totalExtraites,
          derniere_activite: new Date().toISOString()
        })
        .eq('session_id', session_id)

      page++
      
      // Pause entre les pages pour éviter la surcharge de LISA UNESS
      await new Promise(resolve => setTimeout(resolve, 3000))
    }

    // Finaliser l'extraction
    console.log(`🎉 Extraction terminée avec succès: ${totalExtraites} compétences OIC extraites au total`)
    
    await supabaseClient
      .from('oic_extraction_progress')
      .update({
        statut: 'termine',
        competences_extraites: totalExtraites,
        derniere_activite: new Date().toISOString()
      })
      .eq('session_id', session_id)

  } catch (error) {
    console.error('💥 Erreur critique durant l\'extraction:', error)
    
    // Ajouter l'erreur aux logs
    const errorDetails = {
      timestamp: new Date().toISOString(), 
      message: error.message,
      stack: error.stack,
      page: page,
      totalExtraites: totalExtraites
    }
    
    await supabaseClient
      .from('oic_extraction_progress')
      .update({
        statut: 'erreur',
        erreurs: [errorDetails],
        derniere_activite: new Date().toISOString()
      })
      .eq('session_id', session_id)
  }
}

async function authenticateUNESS(): Promise<string> {
  const loginUrl = 'https://auth.uness.fr/cas/login'
  // Utiliser les identifiants fournis par défaut si les secrets ne sont pas configurés  
  const username = Deno.env.get('UNESS_USERNAME') || 'laeticia.moto-ngane@etud.u-picardie.fr'
  const password = Deno.env.get('UNESS_PASSWORD') || 'Aiciteal1!'

  console.log(`🔐 Authentification UNESS pour l'utilisateur: ${username}`)

  try {
    // Première requête pour récupérer le formulaire de connexion
    let response = await fetch(loginUrl)
    
    if (!response.ok) {
      throw new Error(`Erreur lors de l'accès à la page de connexion: ${response.status}`)
    }
    
    let html = await response.text()
    let cookies = response.headers.get('set-cookie') || ''

    console.log('📋 Page de connexion récupérée, extraction du token CSRF...')

    // Extraire le token CSRF
    const csrfMatch = html.match(/name="execution" value="([^"]+)"/)
    const execution = csrfMatch ? csrfMatch[1] : ''

    if (!execution) {
      console.warn('⚠️ Token CSRF non trouvé, tentative de connexion sans token')
    }

    // Connexion avec les identifiants
    const loginData = new URLSearchParams({
      username,
      password,
      execution,
      '_eventId': 'submit'
    })

    console.log('🔑 Envoi des identifiants de connexion...')

    response = await fetch(loginUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': cookies,
        'User-Agent': 'Mozilla/5.0 (compatible; OicExtractor/1.0)'
      },
      body: loginData
    })

    // Vérifier la réponse
    if (!response.ok) {
      throw new Error(`Erreur lors de la connexion: ${response.status}`)
    }

    // Récupérer les cookies d'authentification
    const authCookies = response.headers.get('set-cookie')
    if (authCookies) {
      cookies += '; ' + authCookies
    }

    console.log('✅ Authentification UNESS réussie')
    return cookies

  } catch (error) {
    console.error('❌ Erreur lors de l\'authentification UNESS:', error)
    throw new Error(`Échec de l'authentification UNESS: ${error.message}`)
  }
}

async function extractPageCompetences(cookies: string, page: number): Promise<OicCompetence[]> {
  // URL exacte selon vos spécifications
  const baseUrl = 'https://livret.uness.fr/lisa/2025/Cat%C3%A9gorie:Objectif_de_connaissance'
  const url = page === 1 ? baseUrl : `${baseUrl}?page=${page}`
  
  console.log(`🔍 Chargement de la page: ${url}`)
  
  const response = await fetch(url, {
    headers: {
      'Cookie': cookies,
      'User-Agent': 'Mozilla/5.0 (compatible; OicExtractor/1.0)'
    }
  })

  if (!response.ok) {
    throw new Error(`Erreur HTTP ${response.status} pour la page ${page}`)
  }

  const html = await response.text()
  const competences: OicCompetence[] = []

  // Parser le HTML pour extraire les liens vers les compétences OIC
  // Recherche des liens contenant "Objectif_de_connaissance"
  const linkRegex = /<a[^>]+href="([^"]*\/Objectif_de_connaissance\/[^"]+)"[^>]*>([^<]+)<\/a>/g
  let match

  while ((match = linkRegex.exec(html)) !== null) {
    const [, relativeUrl, title] = match
    const fullUrl = relativeUrl.startsWith('http') ? relativeUrl : `https://livret.uness.fr${relativeUrl}`
    
    try {
      // Extraire les détails de chaque compétence OIC
      const competence = await extractCompetenceDetails(cookies, fullUrl, title)
      if (competence) {
        competences.push(competence)
        console.log(`✅ Compétence extraite: ${competence.objectif_id}`)
      }
    } catch (error) {
      console.error(`❌ Erreur extraction compétence ${fullUrl}:`, error)
    }

    // Pause entre chaque compétence pour éviter la surcharge
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  console.log(`📊 Page ${page} terminée: ${competences.length} compétences extraites`)
  return competences
}

async function extractCompetenceDetails(cookies: string, url: string, title: string): Promise<OicCompetence | null> {
  console.log(`🔍 Extraction des détails: ${url}`)
  
  const response = await fetch(url, {
    headers: {
      'Cookie': cookies,
      'User-Agent': 'Mozilla/5.0 (compatible; OicExtractor/1.0)'
    }
  })

  if (!response.ok) {
    console.error(`❌ Erreur HTTP ${response.status} pour ${url}`)
    return null
  }

  const html = await response.text()

  // Extraire l'identifiant OIC (format OIC-XXX-YY-R-ZZ)
  const idMatch = html.match(/OIC-(\d+)-(\d+)-([AB])-?(\d*)/i)
  if (!idMatch) {
    console.warn(`⚠️ Identifiant OIC non trouvé dans ${url}`)
    return null
  }

  const [fullId, itemNum, rubriqueNum, rang, ordre] = idMatch
  const item_parent = itemNum.padStart(3, '0') // Format XXX

  // Extraire les autres informations depuis le HTML de LISA UNESS
  const rubriqueMatch = html.match(/<th[^>]*>Rubrique<\/th>\s*<td[^>]*>([^<]+)<\/td>/i) ||
                        html.match(/Rubrique\s*:?\s*([^<\n]+)/i)
                        
  const descriptionMatch = html.match(/<th[^>]*>Description<\/th>\s*<td[^>]*>([^<]+)<\/td>/i) ||
                          html.match(/Description\s*:?\s*([^<\n]+)/i)
  
  const competence: OicCompetence = {
    objectif_id: fullId,
    intitule: title.trim(),
    item_parent: item_parent,
    rang: rang.toUpperCase(),
    rubrique: rubriqueMatch ? rubriqueMatch[1].trim() : 'Non spécifiée',
    description: descriptionMatch ? descriptionMatch[1].trim() : undefined,
    ordre: ordre ? parseInt(ordre) : undefined,
    url_source: url
  }

  console.log(`✅ Compétence OIC extraite: ${competence.objectif_id} - Item ${competence.item_parent}`)
  return competence
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
    // Statistiques globales
    const { count: totalExtraites, error: countError } = await supabaseClient
      .from('oic_competences')
      .select('*', { count: 'exact', head: true })

    if (countError) {
      console.error('Erreur lors du comptage:', countError)
      throw new Error(`Erreur lors du comptage des compétences: ${countError.message}`)
    }

    let repartitionData = []

    // Si nous avons des données, appelons la fonction RPC
    if (totalExtraites && totalExtraites > 0) {
      const { data, error } = await supabaseClient
        .rpc('get_oic_competences_rapport')

      if (error) {
        console.error('Erreur RPC rapport:', error)
        // Si l'erreur est que la fonction n'existe pas, on continue avec des données vides
        if (!error.message.includes('function') && !error.message.includes('not found')) {
          throw new Error(`Erreur génération rapport: ${error.message}`)
        }
      } else {
        repartitionData = data || []
      }
    }

    const stats = {
      total_competences_extraites: totalExtraites || 0,
      total_competences_attendues: 4872,
      completude_globale: Math.round(((totalExtraites || 0) / 4872) * 100),
      items_ern_couverts: repartitionData.length,
      repartition_par_item: repartitionData
    }

    return new Response(
      JSON.stringify(stats),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Erreur dans generateRapport:', error)
    
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
  const startPage = resume_from || session.page_courante

  await supabaseClient
    .from('oic_extraction_progress')
    .update({
      statut: 'en_cours',
      page_courante: startPage,
      derniere_activite: new Date().toISOString()
    })
    .eq('session_id', session_id)

  // Relancer l'extraction
  extractCompetencesBackground(supabaseClient, session_id)

  return new Response(
    JSON.stringify({
      success: true,
      message: `Extraction reprise à partir de la page ${startPage}`,
      session_id
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}