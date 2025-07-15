import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import * as cheerio from 'https://esm.sh/cheerio@1.0.0-rc.12'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Interface pour les requêtes
interface ExtractRequest {
  action: 'test' | 'fullExtraction'
  resumeFromItem?: number
  maxItems?: number
}

// Interface pour les items EDN
interface EdnItem {
  item_id: number
  intitule: string
  contenu_complet_html: string
  rangs_a: string[]
  rangs_b: string[]
  html_raw: string
  date_import: string
}

// Cookie jar simple pour gérer les cookies
class CookieJar {
  private cookies = new Map<string, string>()

  addFromResponse(response: Response): void {
    const setCookieHeaders = response.headers.get('set-cookie')
    if (setCookieHeaders) {
      // Split multiple cookies et traiter chacun
      const cookieStrings = setCookieHeaders.split(/,(?=[^;]+=[^;])/g)
      
      for (const cookieString of cookieStrings) {
        const [fullCookie] = cookieString.split(';')
        const [name, value] = fullCookie.split('=')
        if (name && value) {
          this.cookies.set(name.trim(), value.trim())
        }
      }
    }
  }

  toString(): string {
    return Array.from(this.cookies.entries())
      .map(([name, value]) => `${name}=${value}`)
      .join('; ')
  }

  clear(): void {
    this.cookies.clear()
  }

  has(name: string): boolean {
    return this.cookies.has(name)
  }
}

serve(async (req) => {
  console.log('🚀 Fonction extract-edn-uness-auth démarrée - CAS robuste')
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const body = await req.json() as ExtractRequest
    const { action, resumeFromItem = 1, maxItems = 3 } = body
    
    console.log(`📊 Action: ${action}`)
    console.log(`📍 Items: ${resumeFromItem} → ${resumeFromItem + maxItems - 1}`)
    
    // Récupérer les secrets
    const email = Deno.env.get('UNESS_EMAIL')
    const password = Deno.env.get('UNESS_PASSWORD')
    
    if (!email || !password) {
      throw new Error('Secrets UNESS_EMAIL et UNESS_PASSWORD requis')
    }

    console.log(`👤 Utilisation du compte: ${email.substring(0, 3)}***`)
    
    // Phase d'authentification CAS
    console.log('🔐 Phase d\'authentification CAS...')
    const authResult = await authenticateWithCAS(email, password)
    
    if (!authResult.success) {
      throw new Error(`Échec authentification CAS: ${authResult.error}`)
    }
    
    console.log('✅ Authentification CAS réussie')
    
    // Phase d'extraction
    const results = await extractEDNItems(
      supabase,
      authResult.cookieJar,
      resumeFromItem,
      maxItems,
      action === 'fullExtraction'
    )
    
    return new Response(
      JSON.stringify({
        success: true,
        message: `Extraction ${action} terminée avec succès`,
        stats: {
          totalProcessed: results.totalProcessed,
          totalSaved: results.totalSaved,
          totalErrors: results.totalErrors,
          itemsWithContent: results.itemsWithContent
        },
        sampleItems: results.extractedItems.slice(0, 3),
        errors: results.errors
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('❌ Erreur critique:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        stack: error.stack 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

// Authentification CAS complète en 2 étapes
async function authenticateWithCAS(email: string, password: string) {
  const cookieJar = new CookieJar()
  const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  
  try {
    console.log('[AUTH] Étape 1: Initialisation session Cockpit...')
    
    // Étape 1: GET page d'accueil pour initialiser la session
    const initResponse = await fetch('https://cockpit.uness.fr/', {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'fr-FR,fr;q=0.8,en-US;q=0.5,en;q=0.3',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      }
    })
    
    if (!initResponse.ok) {
      throw new Error(`Erreur init page: ${initResponse.status}`)
    }
    
    cookieJar.addFromResponse(initResponse)
    const initHtml = await initResponse.text()
    console.log(`[AUTH] Cookies initiaux: ${cookieJar.toString().substring(0, 50)}...`)
    
    // Étape 2: POST email vers CAS
    console.log('[AUTH] Étape 2: Soumission email...')
    
    const $ = cheerio.load(initHtml)
    const emailFormData = new URLSearchParams()
    emailFormData.append('username', email)
    
    // Ajouter les champs cachés du formulaire
    $('form').first().find('input[type="hidden"]').each((_, element) => {
      const name = $(element).attr('name')
      const value = $(element).attr('value')
      if (name && value) {
        emailFormData.append(name, value)
        console.log(`[AUTH] Champ caché: ${name}`)
      }
    })
    
    const emailResponse = await fetch('https://cockpit.uness.fr/cas/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': USER_AGENT,
        'Cookie': cookieJar.toString(),
        'Origin': 'https://cockpit.uness.fr',
        'Referer': 'https://cockpit.uness.fr/',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      body: emailFormData.toString(),
      redirect: 'manual' // Gérer manuellement les redirections
    })
    
    console.log(`[AUTH] Réponse email: ${emailResponse.status}`)
    cookieJar.addFromResponse(emailResponse)
    
    // Suivre les redirections si nécessaire
    let currentResponse = emailResponse
    let redirectCount = 0
    while (currentResponse.status >= 300 && currentResponse.status < 400 && redirectCount < 5) {
      const location = currentResponse.headers.get('location')
      if (!location) break
      
      const redirectUrl = location.startsWith('http') ? location : `https://cockpit.uness.fr${location}`
      console.log(`[AUTH] Redirection ${redirectCount + 1}: ${redirectUrl}`)
      
      currentResponse = await fetch(redirectUrl, {
        headers: {
          'User-Agent': USER_AGENT,
          'Cookie': cookieJar.toString(),
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        redirect: 'manual'
      })
      
      cookieJar.addFromResponse(currentResponse)
      redirectCount++
    }
    
    const emailHtml = await currentResponse.text()
    
    // Étape 3: POST mot de passe
    console.log('[AUTH] Étape 3: Soumission mot de passe...')
    
    const $2 = cheerio.load(emailHtml)
    const passwordForm = $2('form').first()
    
    // Extraire les champs cachés du formulaire de mot de passe
    const lt = $2('input[name="lt"]').attr('value')
    const execution = $2('input[name="execution"]').attr('value')
    
    if (!lt || !execution) {
      console.log('[AUTH] Debug HTML:', emailHtml.substring(0, 500))
      throw new Error('Champs lt ou execution manquants dans le formulaire CAS')
    }
    
    console.log(`[AUTH] Champs CAS trouvés: lt=${lt.substring(0, 10)}..., execution=${execution}`)
    
    const passwordFormData = new URLSearchParams()
    passwordFormData.append('username', email)
    passwordFormData.append('password', password)
    passwordFormData.append('lt', lt)
    passwordFormData.append('execution', execution)
    passwordFormData.append('_eventId', 'submit')
    
    const formAction = passwordForm.attr('action') || '/cas/login'
    const passwordUrl = formAction.startsWith('http') ? formAction : `https://auth.uness.fr${formAction}`
    
    const passwordResponse = await fetch(passwordUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': USER_AGENT,
        'Cookie': cookieJar.toString(),
        'Origin': 'https://auth.uness.fr',
        'Referer': currentResponse.url,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      body: passwordFormData.toString(),
      redirect: 'manual'
    })
    
    console.log(`[AUTH] Réponse mot de passe: ${passwordResponse.status}`)
    cookieJar.addFromResponse(passwordResponse)
    
    // Étape 4: Suivre les redirections jusqu'à LiSA
    let finalResponse = passwordResponse
    redirectCount = 0
    
    while (finalResponse.status >= 300 && finalResponse.status < 400 && redirectCount < 10) {
      const location = finalResponse.headers.get('location')
      if (!location) break
      
      // Construire l'URL complète
      let redirectUrl: string
      if (location.startsWith('http')) {
        redirectUrl = location
      } else if (location.startsWith('/')) {
        const currentUrl = new URL(finalResponse.url || passwordUrl)
        redirectUrl = `${currentUrl.protocol}//${currentUrl.host}${location}`
      } else {
        redirectUrl = `${new URL(finalResponse.url || passwordUrl).origin}/${location}`
      }
      
      console.log(`[AUTH] Redirection CAS ${redirectCount + 1}: ${redirectUrl}`)
      
      finalResponse = await fetch(redirectUrl, {
        headers: {
          'User-Agent': USER_AGENT,
          'Cookie': cookieJar.toString(),
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        redirect: 'manual'
      })
      
      cookieJar.addFromResponse(finalResponse)
      redirectCount++
      
      // Si on arrive sur LiSA, on s'arrête
      if (finalResponse.url?.includes('livret.uness.fr')) {
        break
      }
    }
    
    // Étape 5: Test d'accès à LiSA
    console.log('[AUTH] Étape 5: Test accès LiSA...')
    
    const lisaTestResponse = await fetch('https://livret.uness.fr/lisa/2025/Accueil', {
      headers: {
        'User-Agent': USER_AGENT,
        'Cookie': cookieJar.toString(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      }
    })
    
    cookieJar.addFromResponse(lisaTestResponse)
    
    if (lisaTestResponse.ok) {
      const lisaHtml = await lisaTestResponse.text()
      
      // Vérifier qu'on n'est pas sur la page de login
      if (!lisaHtml.includes('Veuillez saisir votre adresse e-mail') && 
          !lisaHtml.includes('authentification') &&
          (lisaHtml.includes('LiSA') || lisaHtml.includes('Item de connaissance'))) {
        
        console.log('✅ Accès LiSA authentifié confirmé')
        return {
          success: true,
          cookieJar
        }
      }
    }
    
    throw new Error('Échec final - impossible d\'accéder à LiSA avec authentification')
    
  } catch (error) {
    console.error('[AUTH] Erreur:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Extraction des items EDN avec version imprimable
async function extractEDNItems(
  supabase: any,
  cookieJar: CookieJar,
  startFrom: number,
  maxItems: number,
  isFullExtraction: boolean
) {
  console.log(`🚀 Extraction EDN - Items ${startFrom} → ${startFrom + maxItems - 1}`)
  
  let totalProcessed = 0
  let totalSaved = 0
  let totalErrors = 0
  let itemsWithContent = 0
  const extractedItems: EdnItem[] = []
  const errors: string[] = []
  
  const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  
  try {
    // Récupérer le dernier item traité pour reprendre si nécessaire
    if (isFullExtraction && startFrom === 1) {
      const { data: lastItem } = await supabase
        .from('edn_items_uness')
        .select('item_id')
        .order('item_id', { ascending: false })
        .limit(1)
        .single()
      
      if (lastItem) {
        console.log(`📍 Reprise après item ${lastItem.item_id}`)
        // Note: ici on pourrait ajuster startFrom si nécessaire
      }
    }
    
    // Traitement des items
    for (let itemId = startFrom; itemId < startFrom + maxItems; itemId++) {
      try {
        console.log(`\n[ITEM] ${itemId} - Début extraction...`)
        
        // Construire l'URL avec version imprimable
        const itemUrl = `https://livret.uness.fr/lisa/2025/Item_${itemId}`
        const printableUrl = `${itemUrl}?printable=yes`
        
        // Essayer d'abord la version imprimable
        let response = await fetch(printableUrl, {
          headers: {
            'User-Agent': USER_AGENT,
            'Cookie': cookieJar.toString(),
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          }
        })
        
        let isUsingPrintable = true
        
        // Si échec, essayer la version normale
        if (!response.ok) {
          console.log(`[ITEM] ${itemId} - Version imprimable échec, essai version normale`)
          response = await fetch(itemUrl, {
            headers: {
              'User-Agent': USER_AGENT,
              'Cookie': cookieJar.toString(),
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            }
          })
          isUsingPrintable = false
        }
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }
        
        const html = await response.text()
        
        // Vérifier qu'on n'est pas sur la page de login
        if (html.includes('Veuillez saisir votre adresse e-mail') || 
            html.includes('authentification')) {
          throw new Error('Authentification expirée')
        }
        
        // Extraire le titre
        const $ = cheerio.load(html)
        let titre = $('h1').first().text().trim()
        if (!titre) {
          titre = $('title').text().trim()
        }
        if (!titre) {
          titre = `Item EDN ${itemId}`
        }
        
        // Extraire les compétences Rang A et B
        const competences = extractCompetencesFromHTML(html)
        
        console.log(`[ITEM] ${itemId} rangA ${competences.rang_a.length} rangB ${competences.rang_b.length}`)
        
        if (competences.rang_a.length > 0 || competences.rang_b.length > 0) {
          itemsWithContent++
        }
        
        // Sauvegarder en base
        const ednItem: EdnItem = {
          item_id: itemId,
          intitule: titre,
          contenu_complet_html: html,
          rangs_a: competences.rang_a,
          rangs_b: competences.rang_b,
          html_raw: html,
          date_import: new Date().toISOString()
        }
        
        const { error } = await supabase
          .from('edn_items_uness')
          .upsert(ednItem, {
            onConflict: 'item_id',
            ignoreDuplicates: false
          })
        
        if (error) {
          console.error(`[ITEM] ${itemId} - Erreur DB:`, error)
          errors.push(`Item ${itemId}: ${error.message}`)
          totalErrors++
        } else {
          console.log(`[ITEM] ${itemId} - ✅ Sauvegardé (${isUsingPrintable ? 'printable' : 'normal'})`)
          totalSaved++
          extractedItems.push(ednItem)
        }
        
        totalProcessed++
        
        // Throttling anti-ban (1.5s selon ticket)
        if (itemId < startFrom + maxItems - 1) {
          await new Promise(resolve => setTimeout(resolve, 1500))
        }
        
        // Pause longue toutes les 50 requêtes (selon ticket)
        if (totalProcessed % 50 === 0 && totalProcessed > 0) {
          console.log('⏸️ Pause longue (5s) après 50 items...')
          await new Promise(resolve => setTimeout(resolve, 5000))
        }
        
      } catch (itemError) {
        console.error(`[ITEM] ${itemId} - ❌ Erreur:`, itemError.message)
        errors.push(`Item ${itemId}: ${itemError.message}`)
        totalErrors++
        totalProcessed++
      }
    }
    
    console.log(`\n[SUMMARY] processed ${totalProcessed} saved ${totalSaved} errors ${totalErrors}`)
    
    return {
      totalProcessed,
      totalSaved,
      totalErrors,
      itemsWithContent,
      extractedItems,
      errors
    }
    
  } catch (error) {
    console.error('❌ Erreur critique extraction:', error)
    errors.push(`Erreur critique: ${error.message}`)
    return {
      totalProcessed,
      totalSaved,
      totalErrors: totalErrors + 1,
      itemsWithContent,
      extractedItems,
      errors
    }
  }
}

// Extraction des compétences depuis le HTML (patterns textuels avancés)
function extractCompetencesFromHTML(html: string) {
  const $ = cheerio.load(html)
  const rang_a: string[] = []
  const rang_b: string[] = []
  
  console.log('🔍 Recherche par patterns textuels...')
  
  // Patterns pour identifier les sections Rang A et B
  const rangAPatterns = [
    /rang\s*a\s*[:.-]/i,
    /connaissances?\s*rang\s*a/i,
    /objectifs?\s*rang\s*a/i,
    /compétences?\s*rang\s*a/i,
    /niveau\s*a/i
  ]
  
  const rangBPatterns = [
    /rang\s*b\s*[:.-]/i,
    /connaissances?\s*rang\s*b/i,
    /objectifs?\s*rang\s*b/i,
    /compétences?\s*rang\s*b/i,
    /niveau\s*b/i
  ]
  
  // Recherche dans les headers
  $('h1, h2, h3, h4, h5, h6').each((i, elem) => {
    const headerText = $(elem).text().toLowerCase().trim()
    
    if (rangAPatterns.some(pattern => pattern.test(headerText))) {
      extractContentAfterElement($(elem), rang_a, $)
    }
    
    if (rangBPatterns.some(pattern => pattern.test(headerText))) {
      extractContentAfterElement($(elem), rang_b, $)
    }
  })
  
  // Recherche dans les paragraphes avec texte en gras
  $('p').each((i, elem) => {
    const pText = $(elem).text().toLowerCase()
    
    if (rangAPatterns.some(pattern => pattern.test(pText))) {
      extractContentFromParagraph($(elem), rang_a, $)
    }
    
    if (rangBPatterns.some(pattern => pattern.test(pText))) {
      extractContentFromParagraph($(elem), rang_b, $)
    }
  })
  
  // Recherche dans les tableaux
  $('table').each((i, table) => {
    const tableText = $(table).text().toLowerCase()
    
    if (rangAPatterns.some(pattern => pattern.test(tableText))) {
      $(table).find('td, th').each((j, cell) => {
        const cellText = $(cell).text().trim()
        if (cellText.length > 15 && !rangAPatterns.some(p => p.test(cellText.toLowerCase()))) {
          rang_a.push(cellText)
        }
      })
    }
    
    if (rangBPatterns.some(pattern => pattern.test(tableText))) {
      $(table).find('td, th').each((j, cell) => {
        const cellText = $(cell).text().trim()
        if (cellText.length > 15 && !rangBPatterns.some(p => p.test(cellText.toLowerCase()))) {
          rang_b.push(cellText)
        }
      })
    }
  })
  
  // Dédupliquer et nettoyer
  return {
    rang_a: [...new Set(rang_a.filter(item => item.length > 10))],
    rang_b: [...new Set(rang_b.filter(item => item.length > 10))]
  }
}

function extractContentAfterElement($element: any, targetArray: string[], $: any) {
  let current = $element.next()
  let count = 0
  
  while (current.length && count < 10) {
    // S'arrêter si on trouve un autre header
    if (current.is('h1, h2, h3, h4, h5, h6')) {
      break
    }
    
    if (current.is('ul, ol')) {
      current.find('li').each((j: number, li: any) => {
        const text = $(li).text().trim()
        if (text.length > 15) {
          targetArray.push(text)
        }
      })
    } else if (current.is('p, div')) {
      const text = current.text().trim()
      if (text.length > 15) {
        targetArray.push(text)
      }
    }
    
    current = current.next()
    count++
  }
}

function extractContentFromParagraph($paragraph: any, targetArray: string[], $: any) {
  const fullText = $paragraph.text()
  
  // Diviser par points ou lignes
  const parts = fullText.split(/[.;]\s*|\n/)
  
  for (const part of parts) {
    const trimmed = part.trim()
    if (trimmed.length > 15 && !trimmed.toLowerCase().includes('rang')) {
      targetArray.push(trimmed)
    }
  }
}