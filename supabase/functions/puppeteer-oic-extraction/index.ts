import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Import the working CAS login function
async function authenticateWithCAS(username: string, password: string): Promise<string> {
  console.log('🔐 Démarrage authentification CAS...')
  
  const jar: Record<string, string> = {}
  
  function addCookie(setCookie: string | null) {
    if (!setCookie) return
    setCookie.split(",").forEach(c => {
      const [kv] = c.split(";")
      const [k, v] = kv.split("=")
      if (k && v) {
        jar[k.trim()] = v.trim()
      }
    })
  }
  
  function cookieHeader() {
    return Object.entries(jar).map(([k, v]) => `${k}=${v}`).join("; ")
  }

  const service = "https://livret.uness.fr/login/cas"
  const loginURL = `https://auth.uness.fr/cas/login?service=${encodeURIComponent(service)}`
  
  // ÉTAPE 1: GET initial CAS page
  console.log('📋 Récupération page CAS...')
  let response = await fetch(loginURL, { 
    redirect: "manual",
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  })
  
  addCookie(response.headers.get("set-cookie"))
  const html = await response.text()
  
  // Parser les champs CAS
  const ltMatch = html.match(/name="lt" value="([^"]+)"/)
  const executionMatch = html.match(/name="execution" value="([^"]+)"/)
  
  const lt = ltMatch?.[1] ?? ""
  const execution = executionMatch?.[1] ?? ""
  
  if (!lt || !execution) {
    throw new Error(`Champs CAS manquants - lt: ${!!lt}, execution: ${!!execution}`)
  }
  
  console.log('🔑 Tokens CAS récupérés')
  
  // ÉTAPE 2: POST credentials
  const body = new URLSearchParams({
    username: username,
    password: password,
    lt,
    execution,
    _eventId: "submit",
    submit: "Se connecter"
  })
  
  response = await fetch(loginURL, {
    method: "POST", 
    redirect: "manual",
    headers: { 
      "Content-Type": "application/x-www-form-urlencoded",
      "Cookie": cookieHeader(),
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    body: body.toString()
  })
  
  addCookie(response.headers.get("set-cookie"))
  const ticketLocation = response.headers.get("location")
  const hasTicket = ticketLocation?.includes("ticket=ST-")
  
  if (!ticketLocation || !hasTicket) {
    throw new Error(`Pas de ticket à l'étape 2. Status: ${response.status}`)
  }
  
  console.log('🎫 Ticket CAS obtenu')
  
  // ÉTAPE 3: Validation du ticket
  response = await fetch(ticketLocation, { 
    redirect: "manual", 
    headers: { 
      "Cookie": cookieHeader(),
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  })
  
  addCookie(response.headers.get("set-cookie"))
  const homeURL = response.headers.get("location")
  
  if (!homeURL) {
    throw new Error(`Pas de redirection après validation ticket. Status: ${response.status}`)
  }
  
  console.log('✅ Authentification CAS réussie')
  return cookieHeader()
}

interface OICCompetence {
  objectif_id: string;
  intitule: string;
  item_parent: string;
  rang: string;
  rubrique: string;
  description?: string;
  ordre?: number;
  url_source: string;
  raw_json: any;
  hash_content: string;
  extraction_status: string;
  date_import: string;
  updated_at: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🤖 OIC EXTRACTION NATIVE: Démarrage avec authentification CAS')
    
    // Initialiser Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Récupérer les credentials CAS
    const casUsername = Deno.env.get('CAS_USERNAME')
    const casPassword = Deno.env.get('CAS_PASSWORD')
    
    if (!casUsername || !casPassword) {
      throw new Error('CAS_USERNAME et CAS_PASSWORD doivent être configurés dans les secrets Supabase')
    }
    
    console.log('🔐 Démarrage authentification CAS native...')
    
    // Authentification CAS
    const cookies = await authenticateWithCAS(casUsername, casPassword)
    
    console.log('📋 Récupération de la liste des objectifs OIC...')
    
    // Récupérer la liste des pages OIC via l'API MediaWiki
    const listUrl = 'https://livret.uness.fr/lisa/2025/api.php?action=query&list=categorymembers&cmtitle=Cat%C3%A9gorie:Objectif_de_connaissance&cmlimit=500&format=json'
    const listResponse = await fetch(listUrl, {
      headers: {
        'Cookie': cookies,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })
    
    const listData = await listResponse.json()
    const oicPages = listData.query?.categorymembers || []
    
    console.log(`📊 ${oicPages.length} objectifs OIC trouvés`)
    
    if (oicPages.length === 0) {
      throw new Error('Aucun objectif OIC trouvé dans la catégorie')
    }
    
    // Récupérer les compétences existantes pour comparaison
    const { data: existingCompetences } = await supabase
      .from('backup_oic_competences')
      .select('objectif_id, description')
    
    const incompletesCount = existingCompetences?.filter(c => !c.description || c.description.trim() === '').length || 0
    console.log(`🔍 ${incompletesCount} compétences sans description trouvées`)
    
    // Traitement par lots
    const batchSize = 20
    const competences: OICCompetence[] = []
    let processed = 0
    let updated = 0
    
    for (let i = 0; i < oicPages.length; i += batchSize) {
      const batch = oicPages.slice(i, i + batchSize)
      console.log(`🔄 Traitement du lot ${Math.floor(i/batchSize) + 1}/${Math.ceil(oicPages.length/batchSize)}`)
      
      for (const oicPage of batch) {
        try {
          processed++
          const pageTitle = oicPage.title
          
          // Vérifier si cette compétence a besoin d'être mise à jour
          const existing = existingCompetences?.find(c => 
            pageTitle.includes(c.objectif_id.replace(/_/g, '_'))
          )
          
          if (existing && existing.description && existing.description.trim() !== '') {
            continue // Skip si déjà complète
          }
          
          const pageApiUrl = `https://livret.uness.fr/lisa/2025/api.php?action=query&titles=${encodeURIComponent(pageTitle)}&prop=revisions&rvprop=content&format=json`
          
          const pageResponse = await fetch(pageApiUrl, {
            headers: {
              'Cookie': cookies,
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
          })
          
          const pageData = await pageResponse.json()
          const pages = pageData.query?.pages || {}
          const pageContent = Object.values(pages)[0] as any
          
          if (pageContent?.revisions?.[0]?.['*']) {
            const wikiContent = pageContent.revisions[0]['*']
            const parsedCompetence = parseOICContent(pageTitle, wikiContent, pageApiUrl)
            
            if (parsedCompetence && parsedCompetence.description) {
              competences.push(parsedCompetence)
              updated++
              console.log(`✅ Mise à jour: ${parsedCompetence.objectif_id}`)
            }
          }
        } catch (error) {
          console.error(`❌ Erreur lors du traitement de ${oicPage.title}:`, error)
        }
      }
      
      // Pause entre les lots
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    
    console.log(`💾 Sauvegarde de ${competences.length} compétences en base...`)
    
    // Mise à jour de la base de données
    if (competences.length > 0) {
      const { error } = await supabase
        .from('backup_oic_competences')
        .upsert(competences, {
          onConflict: 'objectif_id',
          ignoreDuplicates: false
        })
      
      if (error) {
        throw new Error(`Erreur lors de la sauvegarde: ${error.message}`)
      }
    }
    
    const rapport = {
      success: true,
      message: 'Extraction OIC native terminée avec succès',
      competences_traitees: processed,
      competences_mises_a_jour: updated,
      competences_deja_completes: processed - updated,
      incomplets_detectes: incompletesCount,
      timestamp: new Date().toISOString(),
      method: 'native_cas',
      session_id: crypto.randomUUID()
    }
    
    console.log('🎉 EXTRACTION NATIVE TERMINÉE:', rapport)
    
    return new Response(
      JSON.stringify(rapport),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
    
  } catch (error) {
    console.error('💥 Erreur Puppeteer OIC:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

function parseOICContent(title: string, wikiContent: string, sourceUrl: string): OICCompetence | null {
  try {
    // Extraire l'ID de l'objectif depuis le titre
    const objectifIdMatch = title.match(/Objectif_de_connaissance_(\d+_\d+_[A-Z]_\d+)/)
    if (!objectifIdMatch) {
      return null
    }
    
    const objectifId = objectifIdMatch[1]
    
    // Déterminer le rang (A ou B) depuis l'ID
    const rang = objectifId.includes('_A_') ? 'A' : 'B'
    
    // Extraire l'item parent (IC-XX)
    const itemMatch = objectifId.match(/^(\d+)_/)
    const itemParent = itemMatch ? `IC-${itemMatch[1]}` : ''
    
    // Extraire le titre/intitulé depuis le contenu wiki
    const intituleMatch = wikiContent.match(/=\s*(.+?)\s*=/) || 
                         wikiContent.match(/'''\s*(.+?)\s*'''/) ||
                         wikiContent.match(/\*\s*(.+?)(?:\n|$)/)
    const intitule = intituleMatch ? intituleMatch[1].trim() : title.replace(/Objectif_de_connaissance_/, '')
    
    // Extraire la rubrique
    const rubriqueMatch = wikiContent.match(/\[\[Catégorie:([^\]]+)\]\]/)
    const rubrique = rubriqueMatch ? rubriqueMatch[1] : 'Objectif_de_connaissance'
    
    // Extraire la description (premier paragraphe significatif)
    const lines = wikiContent.split('\n').filter(line => line.trim())
    const descriptionLines = lines.filter(line => 
      !line.startsWith('=') && 
      !line.startsWith('[[') && 
      !line.startsWith('{') &&
      line.trim().length > 10
    )
    const description = descriptionLines.slice(0, 3).join(' ').substring(0, 500)
    
    // Calculer un hash du contenu
    const hashContent = btoa(wikiContent).substring(0, 32)
    
    return {
      objectif_id: objectifId,
      intitule: intitule,
      item_parent: itemParent,
      rang: rang,
      rubrique: rubrique,
      description: description || '',
      ordre: parseInt(objectifId.split('_')[3]) || 0,
      url_source: sourceUrl,
      raw_json: {
        title: title,
        wiki_content: wikiContent,
        extraction_method: 'puppeteer_cas'
      },
      hash_content: hashContent,
      extraction_status: 'completed',
      date_import: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
  } catch (error) {
    console.error('Erreur parsing OIC:', error)
    return null
  }
}