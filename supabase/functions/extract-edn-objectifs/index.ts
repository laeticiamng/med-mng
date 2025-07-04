import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface EdnObjectif {
  objectif_id: string;
  intitule: string;
  item_parent: number;
  rang: string;
  rubrique: string;
  description?: string;
  ordre?: number;
  url_source: string;
}

interface ExtractionSession {
  session_id: string;
  page_courante: number;
  objectifs_extraits: number;
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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { action, session_id, page, resume_from } = await req.json()

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
    .from('edn_extraction_progress')
    .insert({
      session_id,
      statut: 'en_cours',
      page_courante: 1,
      objectifs_extraits: 0
    })

  // Lancer l'extraction en arrière-plan
  extractObjectifsBackground(supabaseClient, session_id)

  return new Response(
    JSON.stringify({
      success: true,
      session_id,
      message: 'Extraction démarrée en arrière-plan',
      status_url: `/functions/extract-edn-objectifs?action=status&session_id=${session_id}`
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function extractObjectifsBackground(supabaseClient: any, session_id: string) {
  let cookies = '';
  let page = 1;
  const maxPages = 25;
  let totalExtraits = 0;

  try {
    // Étape 1: Authentification CAS UNESS
    console.log('🔐 Connexion au CAS UNESS...')
    cookies = await authenticateUNESS()
    
    // Étape 2: Extraction page par page
    while (page <= maxPages) {
      console.log(`📄 Extraction page ${page}/${maxPages}...`)
      
      const objectifs = await extractPageObjectifs(cookies, page)
      
      if (objectifs.length === 0) {
        console.log('Aucun objectif trouvé, arrêt de l\'extraction')
        break
      }

      // Sauvegarder en base
      for (const objectif of objectifs) {
        try {
          await supabaseClient
            .from('edn_objectifs_connaissance')
            .upsert(objectif, { onConflict: 'objectif_id' })
          
          totalExtraits++
        } catch (error) {
          console.error(`Erreur sauvegarde objectif ${objectif.objectif_id}:`, error)
        }
      }

      // Mettre à jour le progrès
      await supabaseClient
        .from('edn_extraction_progress')
        .update({
          page_courante: page,
          objectifs_extraits: totalExtraits,
          derniere_activite: new Date().toISOString()
        })
        .eq('session_id', session_id)

      page++
      
      // Pause entre les pages pour éviter la surcharge
      await new Promise(resolve => setTimeout(resolve, 2000))
    }

    // Finaliser l'extraction
    await supabaseClient
      .from('edn_extraction_progress')
      .update({
        statut: 'termine',
        objectifs_extraits: totalExtraits,
        derniere_activite: new Date().toISOString()
      })
      .eq('session_id', session_id)

    console.log(`✅ Extraction terminée: ${totalExtraits} objectifs extraits`)

  } catch (error) {
    console.error('❌ Erreur durant l\'extraction:', error)
    
    await supabaseClient
      .from('edn_extraction_progress')
      .update({
        statut: 'erreur',
        erreurs: [{ timestamp: new Date().toISOString(), message: error.message }],
        derniere_activite: new Date().toISOString()
      })
      .eq('session_id', session_id)
  }
}

async function authenticateUNESS(): Promise<string> {
  const loginUrl = 'https://auth.uness.fr/cas/login'
  const username = Deno.env.get('UNESS_USERNAME') || 'laeticia.moto-ngane@etud.u-picardie.fr'
  const password = Deno.env.get('UNESS_PASSWORD') || 'Aiciteal1!'

  // Première requête pour récupérer le formulaire de connexion
  let response = await fetch(loginUrl)
  let html = await response.text()
  let cookies = response.headers.get('set-cookie') || ''

  // Extraire le token CSRF
  const csrfMatch = html.match(/name="execution" value="([^"]+)"/)
  const execution = csrfMatch ? csrfMatch[1] : ''

  // Connexion avec les identifiants
  const loginData = new URLSearchParams({
    username,
    password,
    execution,
    '_eventId': 'submit'
  })

  response = await fetch(loginUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Cookie': cookies
    },
    body: loginData
  })

  // Récupérer les cookies d'authentification
  const authCookies = response.headers.get('set-cookie')
  if (authCookies) {
    cookies += '; ' + authCookies
  }

  return cookies
}

async function extractPageObjectifs(cookies: string, page: number): Promise<EdnObjectif[]> {
  const baseUrl = 'https://livret.uness.fr/lisa/2025/Cat%C3%A9gorie:Objectif_de_connaissance'
  const url = page === 1 ? baseUrl : `${baseUrl}?page=${page}`
  
  const response = await fetch(url, {
    headers: {
      'Cookie': cookies,
      'User-Agent': 'Mozilla/5.0 (compatible; EdnExtractor/1.0)'
    }
  })

  if (!response.ok) {
    throw new Error(`Erreur HTTP ${response.status} pour la page ${page}`)
  }

  const html = await response.text()
  const objectifs: EdnObjectif[] = []

  // Parser le HTML pour extraire les liens vers les objectifs
  const linkRegex = /<a[^>]+href="([^"]*\/Objectif_de_connaissance\/[^"]+)"[^>]*>([^<]+)<\/a>/g
  let match

  while ((match = linkRegex.exec(html)) !== null) {
    const [, relativeUrl, title] = match
    const fullUrl = `https://livret.uness.fr${relativeUrl}`
    
    try {
      // Extraire les détails de chaque objectif
      const objectif = await extractObjectifDetails(cookies, fullUrl, title)
      if (objectif) {
        objectifs.push(objectif)
      }
    } catch (error) {
      console.error(`Erreur extraction objectif ${fullUrl}:`, error)
    }

    // Pause entre chaque objectif
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  return objectifs
}

async function extractObjectifDetails(cookies: string, url: string, title: string): Promise<EdnObjectif | null> {
  const response = await fetch(url, {
    headers: {
      'Cookie': cookies,
      'User-Agent': 'Mozilla/5.0 (compatible; EdnExtractor/1.0)'
    }
  })

  if (!response.ok) {
    console.error(`Erreur HTTP ${response.status} pour ${url}`)
    return null
  }

  const html = await response.text()

  // Extraire l'identifiant (format OIC-XXX-YY-R-ZZ)
  const idMatch = html.match(/OIC-(\d+)-(\d+)-([AB])-?(\d*)/i)
  if (!idMatch) {
    console.warn(`Identifiant OIC non trouvé dans ${url}`)
    return null
  }

  const [fullId, itemNum, rubriqueNum, rang, ordre] = idMatch
  const item_parent = parseInt(itemNum)

  // Extraire les autres informations depuis le HTML
  const rubriqueMatch = html.match(/<th[^>]*>Rubrique<\/th>\s*<td[^>]*>([^<]+)<\/td>/i)
  const descriptionMatch = html.match(/<th[^>]*>Description<\/th>\s*<td[^>]*>([^<]+)<\/td>/i)
  
  return {
    objectif_id: fullId,
    intitule: title.trim(),
    item_parent,
    rang: rang.toUpperCase(),
    rubrique: rubriqueMatch ? rubriqueMatch[1].trim() : 'Non spécifiée',
    description: descriptionMatch ? descriptionMatch[1].trim() : undefined,
    ordre: ordre ? parseInt(ordre) : undefined,
    url_source: url
  }
}

async function getExtractionStatus(supabaseClient: any, session_id: string) {
  const { data, error } = await supabaseClient
    .from('edn_extraction_progress')
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
  const { data, error } = await supabaseClient
    .rpc('get_edn_objectifs_rapport')

  if (error) {
    throw new Error(`Erreur génération rapport: ${error.message}`)
  }

  // Statistiques globales
  const totalExtraits = await supabaseClient
    .from('edn_objectifs_connaissance')
    .select('*', { count: 'exact', head: true })

  const stats = {
    total_objectifs_extraits: totalExtraits.count || 0,
    total_objectifs_attendus: 4872,
    completude_globale: Math.round(((totalExtraits.count || 0) / 4872) * 100),
    repartition_par_item: data || []
  }

  return new Response(
    JSON.stringify(stats),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function resumeExtraction(supabaseClient: any, session_id: string, resume_from?: number) {
  // Récupérer l'état de la session
  const { data: session } = await supabaseClient
    .from('edn_extraction_progress')
    .select('*')
    .eq('session_id', session_id)
    .single()

  if (!session) {
    throw new Error('Session non trouvée')
  }

  // Reprendre à partir de la page spécifiée ou de la dernière page
  const startPage = resume_from || session.page_courante

  await supabaseClient
    .from('edn_extraction_progress')
    .update({
      statut: 'en_cours',
      page_courante: startPage,
      derniere_activite: new Date().toISOString()
    })
    .eq('session_id', session_id)

  // Relancer l'extraction
  extractObjectifsBackground(supabaseClient, session_id)

  return new Response(
    JSON.stringify({
      success: true,
      message: `Extraction reprise à partir de la page ${startPage}`,
      session_id
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}