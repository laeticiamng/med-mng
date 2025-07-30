// ✅ Edge Function utilisant la logique CAS de votre script extract-oic-competences.cjs
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Configuration identique à votre script .cjs
const config = {
  cas: {
    username: Deno.env.get('CAS_USERNAME') || 'laeticia.moto-ngane@etud.u-picardie.fr',
    password: Deno.env.get('CAS_PASSWORD') || 'Aiciteal1!'
  },
  urls: {
    base: 'https://livret.uness.fr/lisa/2025',
    category: 'https://livret.uness.fr/lisa/2025/Catégorie:Objectif_de_connaissance',
    api: 'https://livret.uness.fr/lisa/2025/api.php'
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  try {
    console.log('🚀 EXTRACTION OIC - Méthode de votre script .cjs')
    console.log('===============================================')

    // 1. Authentification CAS complète (votre méthode)
    console.log('🔐 Authentification CAS selon votre méthode...')
    const sessionCookies = await authenticateCASComplete()
    
    if (!sessionCookies) {
      throw new Error('Échec authentification CAS')
    }
    
    console.log('✅ Cookies de session récupérés')

    // 2. Extraction via API avec cookies (votre logique)
    console.log('📡 Extraction via API MediaWiki avec session...')
    const allCompetences = await extractViaAPIWithCookies(sessionCookies)
    
    console.log(`📊 ${allCompetences.length} compétences extraites`)

    // 3. Insertion en base (votre méthode)
    const { error } = await supabase
      .from('backup_oic_competences')
      .upsert(allCompetences, { 
        onConflict: 'objectif_id',
        ignoreDuplicates: false 
      })

    if (error) {
      throw new Error(`Erreur insertion: ${error.message}`)
    }

    const rapport = {
      success: true,
      total_extracted: allCompetences.length,
      method: 'CAS Authentication selon votre script .cjs',
      completion_rate: ((allCompetences.length / 4872) * 100).toFixed(2),
      timestamp: new Date().toISOString()
    }

    console.log('🎉 EXTRACTION TERMINÉE !')
    return new Response(
      JSON.stringify(rapport),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('💥 Erreur:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        method: 'CAS selon votre script'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})

// Authentification CAS selon votre logique exact
async function authenticateCASComplete() {
  console.log('🌐 Navigation vers page protégée pour déclencher authentification...')
  
  // Étape 1: Accéder à la page protégée pour déclencher la redirection CAS
  const initialResponse = await fetch(config.urls.category, {
    redirect: 'manual'
  })
  
  // Suivre les redirections CAS
  let currentUrl = initialResponse.headers.get('location') || config.urls.category
  console.log(`🔍 URL après redirection: ${currentUrl}`)
  
  if (!currentUrl.includes('cas/login') && !currentUrl.includes('auth.uness.fr')) {
    console.log('✅ Pas de redirection CAS - déjà authentifié')
    return extractCookiesFromResponse(initialResponse)
  }
  
  console.log('🔑 Authentification CAS requise - début du processus...')
  
  // Étape 2: Récupérer la page de login CAS
  const loginPageResponse = await fetch(currentUrl)
  const loginPageHtml = await loginPageResponse.text()
  
  // Extraire le token d'exécution (selon votre logique)
  const executionMatch = loginPageHtml.match(/name="execution" value="([^"]+)"/)
  const execution = executionMatch ? executionMatch[1] : 'e1s1'
  console.log(`🎫 Token d'exécution CAS: ${execution}`)
  
  // Étape 3: Soumettre email (première étape selon votre script)
  console.log('📧 Saisie de l\'email...')
  const emailFormData = new FormData()
  emailFormData.append('username', config.cas.username)
  emailFormData.append('execution', execution)
  emailFormData.append('_eventId', 'submit')
  
  const emailResponse = await fetch(currentUrl, {
    method: 'POST',
    body: emailFormData,
    redirect: 'manual'
  })
  
  // Étape 4: Suivre redirection vers étape mot de passe
  const passwordUrl = emailResponse.headers.get('location')
  if (!passwordUrl) {
    throw new Error('Redirection étape mot de passe manquante')
  }
  
  console.log('🔐 Passage à l\'étape mot de passe...')
  const passwordPageResponse = await fetch(passwordUrl)
  const passwordPageHtml = await passwordPageResponse.text()
  
  // Extraire nouveau token d'exécution
  const passwordExecutionMatch = passwordPageHtml.match(/name="execution" value="([^"]+)"/)
  const passwordExecution = passwordExecutionMatch ? passwordExecutionMatch[1] : execution
  
  // Étape 5: Soumettre mot de passe
  console.log('🔐 Saisie du mot de passe...')
  const passwordFormData = new FormData()
  passwordFormData.append('password', config.cas.password)
  passwordFormData.append('execution', passwordExecution)
  passwordFormData.append('_eventId', 'submit')
  
  const authResponse = await fetch(passwordUrl, {
    method: 'POST',
    body: passwordFormData,
    redirect: 'manual'
  })
  
  // Étape 6: Suivre toutes les redirections OAuth2 (votre logique)
  console.log('⏳ Suivi des redirections OAuth2...')
  let finalResponse = authResponse
  let redirectCount = 0
  
  while (finalResponse.headers.get('location') && redirectCount < 10) {
    const nextUrl = finalResponse.headers.get('location')
    console.log(`↗️ Redirection ${redirectCount + 1}: ${nextUrl?.substring(0, 100)}...`)
    
    finalResponse = await fetch(nextUrl!, { redirect: 'manual' })
    redirectCount++
    
    // Si on arrive sur livret.uness.fr, c'est bon
    if (nextUrl?.includes('livret.uness.fr')) {
      console.log('🎉 Arrivé sur livret.uness.fr !')
      break
    }
  }
  
  // Extraire les cookies de session
  const cookies = finalResponse.headers.get('set-cookie')
  if (!cookies) {
    throw new Error('Aucun cookie de session récupéré')
  }
  
  console.log('✅ Authentification CAS terminée avec succès')
  return cookies
}

// Extraction via API avec cookies (votre logique)
async function extractViaAPIWithCookies(cookies: string) {
  const allCompetences: any[] = []
  let continueToken = ''
  
  do {
    const apiUrl = new URL(config.urls.api)
    apiUrl.searchParams.set('action', 'query')
    apiUrl.searchParams.set('list', 'categorymembers')
    apiUrl.searchParams.set('cmtitle', 'Catégorie:Objectif_de_connaissance')
    apiUrl.searchParams.set('cmlimit', '500')
    apiUrl.searchParams.set('format', 'json')
    
    if (continueToken) {
      apiUrl.searchParams.set('cmcontinue', continueToken)
    }
    
    console.log(`🔗 Requête API: ${apiUrl.toString()}`)
    
    const apiResponse = await fetch(apiUrl.toString(), {
      headers: {
        'Cookie': cookies,
        'User-Agent': 'Mozilla/5.0 (compatible; OIC-Extractor/1.0)',
        'Accept': 'application/json',
        'Referer': config.urls.base
      }
    })
    
    if (!apiResponse.ok) {
      throw new Error(`API request failed: ${apiResponse.status}`)
    }
    
    const apiData = await apiResponse.json()
    
    if (apiData.error) {
      throw new Error(`API Error: ${apiData.error.code} - ${apiData.error.info}`)
    }
    
    const allMembers = apiData.query?.categorymembers || []
    console.log(`📋 ${allMembers.length} membres trouvés dans la catégorie`)
    
    // Filtrer selon votre pattern exact
    const oicPattern = /OIC-\d{3}-\d{2}-[AB]/
    const pageIds = allMembers
      .filter((p: any) => p.title?.match(oicPattern))
      .map((p: any) => p.pageid)
    
    console.log(`🎯 ${pageIds.length} pages OIC trouvées`)
    
    // Récupérer le contenu par batches de 50 (votre méthode)
    for (let i = 0; i < pageIds.length; i += 50) {
      const batch = pageIds.slice(i, i + 50)
      const contentUrl = new URL(config.urls.api)
      contentUrl.searchParams.set('action', 'query')
      contentUrl.searchParams.set('prop', 'revisions')
      contentUrl.searchParams.set('rvprop', 'content|timestamp')
      contentUrl.searchParams.set('pageids', batch.join('|'))
      contentUrl.searchParams.set('format', 'json')
      contentUrl.searchParams.set('formatversion', '2')
      
      const contentResponse = await fetch(contentUrl.toString(), {
        headers: {
          'Cookie': cookies,
          'User-Agent': 'Mozilla/5.0 (compatible; OIC-Extractor/1.0)',
          'Accept': 'application/json'
        }
      })
      
      const contentData = await contentResponse.json()
      
      if (contentData.query?.pages) {
        for (const page of contentData.query.pages) {
          const competence = parseOICCompetence(page)
          if (competence) {
            allCompetences.push(competence)
          }
        }
      }
      
      console.log(`✅ Batch ${Math.floor(i/50) + 1} traité - ${allCompetences.length} compétences extraites`)
      
      // Pause selon votre script
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    
    continueToken = apiData.continue?.cmcontinue || ''
    
  } while (continueToken)
  
  return allCompetences
}

// Parse selon votre logique
function parseOICCompetence(page: any) {
  try {
    const title = page.title
    const content = page.revisions?.[0]?.content || ''

    const idMatch = title.match(/OIC-(\d{3})-(\d{2})-([AB])-(\d{2})/)
    if (!idMatch) return null

    const [, itemParent, rubriqueCode, rang, ordre] = idMatch

    const rubriques: Record<string, string> = {
      '01': 'Génétique', '02': 'Cancérologie', '03': 'Cardiologie',
      '04': 'Pneumologie', '05': 'Gastroentérologie', '06': 'Neurologie',
      '07': 'Psychiatrie', '08': 'Gynécologie-Obstétrique', '09': 'Pédiatrie',
      '10': 'Endocrinologie', '11': 'Autres spécialités'
    }

    const intituleMatch = content.match(/\|\s*[Ii]ntitulé\s*=\s*([^\n\|]+)/)
    const descriptionMatch = content.match(/\|\s*[Dd]escription\s*=\s*([^\n\|]+)/)
    
    let description = descriptionMatch ? descriptionMatch[1].trim() : ''
    if (!description) {
      const firstPara = content.split('\n').find((line: string) => 
        line.trim() && !line.startsWith('|') && !line.startsWith('{')
      )
      description = firstPara ? firstPara.trim() : ''
    }

    return {
      objectif_id: title,
      intitule: intituleMatch ? intituleMatch[1].trim() : title,
      item_parent: itemParent,
      rang,
      rubrique: rubriques[rubriqueCode] || `Rubrique ${rubriqueCode}`,
      description: description.substring(0, 1000),
      ordre: parseInt(ordre),
      url_source: `${config.urls.base}/index.php?title=${encodeURIComponent(title)}`,
      raw_json: { title, content: content.substring(0, 2000) },
      date_import: new Date().toISOString(),
      hash_content: btoa(content).substring(0, 50),
      extraction_status: 'completed'
    }

  } catch (error) {
    console.error('Erreur parsing:', page.title, error)
    return null
  }
}

function extractCookiesFromResponse(response: Response): string {
  const cookies = response.headers.get('set-cookie')
  return cookies || ''
}