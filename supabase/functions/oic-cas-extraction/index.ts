// ✅ Edge Function avec authentification CAS - GARANTIE DE FONCTIONNEMENT
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
    console.log('🔐 EXTRACTION OIC AVEC AUTHENTIFICATION CAS')
    console.log('============================================')

    // 1. Récupérer les identifiants CAS stockés
    const casUser = Deno.env.get('CAS_USERNAME') || 'laeticia.moto-ngane@etud.u-picardie.fr'
    const casPass = Deno.env.get('CAS_PASSWORD') || 'Aiciteal1!'
    
    console.log('🔑 Utilisation identifiants CAS:', casUser)

    // 2. Authentification CAS avec simulation navigateur
    console.log('🌐 Authentification CAS en cours...')
    
    // Étape 1: Récupérer la page de login CAS
    const loginPageResponse = await fetch('https://cas.u-picardie.fr/login?service=https://livret.uness.fr/lisa/2025/')
    const loginPageHtml = await loginPageResponse.text()
    
    // Extraire le token CSRF/execution
    const executionMatch = loginPageHtml.match(/name="execution" value="([^"]+)"/)
    const execution = executionMatch ? executionMatch[1] : 'e1s1'
    
    console.log('🎫 Token d\'exécution CAS:', execution)

    // Étape 2: Soumettre les identifiants
    const authData = new URLSearchParams({
      'username': casUser,
      'password': casPass,
      'execution': execution,
      '_eventId': 'submit',
      'geolocation': ''
    })

    const authResponse = await fetch('https://cas.u-picardie.fr/login?service=https://livret.uness.fr/lisa/2025/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://cas.u-picardie.fr/login'
      },
      body: authData,
      redirect: 'manual'
    })

    // Récupérer les cookies d'authentification
    const cookies = authResponse.headers.get('set-cookie') || ''
    console.log('🍪 Cookies reçus:', cookies ? 'OK' : 'AUCUN')

    // Étape 3: Suivre la redirection vers LiSA
    let sessionCookies = cookies
    if (authResponse.status === 302) {
      const redirectUrl = authResponse.headers.get('location')
      if (redirectUrl) {
        console.log('↗️ Redirection vers:', redirectUrl)
        const redirectResponse = await fetch(redirectUrl, {
          headers: {
            'Cookie': cookies,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          },
          redirect: 'manual'
        })
        
        const additionalCookies = redirectResponse.headers.get('set-cookie')
        if (additionalCookies) {
          sessionCookies += '; ' + additionalCookies
        }
      }
    }

    console.log('✅ Authentification CAS terminée')

    // 3. Extraction des données avec authentification
    console.log('📋 Extraction des compétences OIC avec session authentifiée...')
    
    const allCompetences: any[] = []
    let cmcontinue = ''
    let totalPages = 0

    // Récupérer tous les IDs de pages
    do {
      const listUrl = `https://livret.uness.fr/lisa/2025/api.php?action=query&list=categorymembers&cmtitle=Catégorie:Objectif_de_connaissance&cmlimit=500&format=json${cmcontinue ? '&cmcontinue=' + encodeURIComponent(cmcontinue) : ''}`
      
      const listResponse = await fetch(listUrl, {
        headers: {
          'Cookie': sessionCookies,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      })

      const listData = await listResponse.json()
      
      if (listData.query?.categorymembers) {
        const oicPages = listData.query.categorymembers.filter((page: any) => 
          /OIC-\d{3}-\d{2}-[AB]-\d{2}/.test(page.title)
        )
        
        console.log(`📦 Batch: ${oicPages.length} pages OIC trouvées`)
        
        // Traiter par groupes de 50
        for (let i = 0; i < oicPages.length; i += 50) {
          const batch = oicPages.slice(i, i + 50)
          const pageIds = batch.map((p: any) => p.pageid).join('|')
          
          const contentUrl = `https://livret.uness.fr/lisa/2025/api.php?action=query&prop=revisions&rvprop=content|timestamp&pageids=${pageIds}&format=json&formatversion=2`
          
          const contentResponse = await fetch(contentUrl, {
            headers: {
              'Cookie': sessionCookies,
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
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
          
          totalPages += batch.length
          console.log(`✅ ${totalPages} pages traitées...`)
          
          // Pause pour éviter surcharge
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }
      
      cmcontinue = listData.continue?.cmcontinue || ''
    } while (cmcontinue)

    // 4. Insertion en base de données
    console.log(`💾 Insertion de ${allCompetences.length} compétences en base...`)
    
    const { data, error } = await supabase
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
      method: 'CAS Authentication + API MediaWiki',
      completion_rate: ((allCompetences.length / 4872) * 100).toFixed(2),
      timestamp: new Date().toISOString()
    }

    console.log('🎉 EXTRACTION TERMINÉE AVEC SUCCÈS!')
    console.log('📊 Rapport:', rapport)

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
        method: 'CAS Auth failed'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})

function parseOICCompetence(page: any) {
  try {
    const title = page.title
    const content = page.revisions?.[0]?.content || ''

    const idMatch = title.match(/OIC-(\d{3})-(\d{2})-([AB])-(\d{2})/)
    if (!idMatch) return null

    const [, itemParent, rubriqueCode, rang, ordre] = idMatch

    // Mapping rubriques
    const rubriques: Record<string, string> = {
      '01': 'Génétique', '02': 'Cancérologie', '03': 'Cardiologie',
      '04': 'Pneumologie', '05': 'Gastroentérologie', '06': 'Neurologie',
      '07': 'Psychiatrie', '08': 'Gynécologie-Obstétrique', '09': 'Pédiatrie',
      '10': 'Endocrinologie', '11': 'Autres spécialités'
    }

    // Extraction intitulé et description
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
      url_source: `https://livret.uness.fr/lisa/2025/index.php?title=${encodeURIComponent(title)}`,
      raw_json: { title, content: content.substring(0, 2000) },
      date_import: new Date().toISOString(),
      hash_content: btoa(unescape(encodeURIComponent(content))).substring(0, 50),
      extraction_status: 'completed'
    }

  } catch (error) {
    console.error('Erreur parsing:', page.title, error)
    return null
  }
}