import { serve } from 'https://deno.land/std@0.190.0/http/server.ts'
import { getErrorMessage } from '../_shared/error-utils.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3'
import * as cheerio from 'https://esm.sh/cheerio@1.0.0-rc.12'
import { corsHeaders } from '../_shared/cors.ts'

interface ExtractRequest {
  action: string
  resumeFromItem?: number
  maxItems?: number
  fullExtraction?: boolean
  credentials?: {
    username: string
    password: string
  }
}

interface EdnItem {
  numero_item: number
  titre: string
  contenu_html: string
  rang_a_html: string | null
  rang_b_html: string | null
  rangs_a: string[]
  rangs_b: string[]
  url_source: string
  date_import: string
}

interface SessionStorage {
  cookies: string
  authToken?: string
  expiresAt: number
}

const supabaseUrl = Deno.env.get('SUPABASE_URL')
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Récupération des secrets UNESS
const UNESS_EMAIL = Deno.env.get('UNESS_EMAIL')
const UNESS_PASSWORD = Deno.env.get('UNESS_PASSWORD')

serve(async (req) => {
  console.log('🚀 Fonction extract-edn-uness démarrée - Version complète UNES')
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const body = await req.json() as ExtractRequest
    const { 
      action, 
      resumeFromItem = 1, 
      maxItems = 367, 
      fullExtraction = false,
      credentials 
    } = body
    
    console.log(`📊 Action: ${action}`)
    console.log(`📍 Items: ${resumeFromItem} → ${resumeFromItem + maxItems - 1}`)
    console.log(`🎯 Mode: ${fullExtraction ? 'EXTRACTION COMPLÈTE' : 'TEST'}`)
    
    // Utiliser les secrets ou les credentials fournis
    const username = UNESS_EMAIL || credentials?.username
    const password = UNESS_PASSWORD || credentials?.password
    
    // ✅ SÉCURISÉ - Ticket 1.2: Logs masqués des credentials
    console.log('🔐 Secrets disponibles:')
    console.log('- UNESS_EMAIL:', UNESS_EMAIL ? 'Configuré' : 'Manquant')
    console.log('- UNESS_PASSWORD:', UNESS_PASSWORD ? 'Configuré' : 'Manquant')
    console.log('- Credentials fournis:', credentials ? 'Oui' : 'Non')
    
    if (!username || !password) {
      const errorMsg = `Credentials UNESS manquants - Email: ${username ? 'OK' : 'MANQUANT'}, Password: ${password ? 'OK' : 'MANQUANT'}`
      console.error('❌', errorMsg)
      
      return new Response(
        JSON.stringify({ 
          success: false,
          error: errorMsg,
          debug: {
            UNESS_EMAIL_available: !!UNESS_EMAIL,
            UNESS_PASSWORD_available: !!UNESS_PASSWORD,
            credentials_provided: !!credentials
          }
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
    
    console.log(`👤 Utilisation du compte: ${username.substring(0, 3)}***`)
    
    // Tentative de récupération de session persistante
    let sessionData: SessionStorage | null = null
    try {
      // Dans un vrai contexte, on lirait depuis un storage persistent
      // Pour l'instant, on authentifie à chaque fois
      sessionData = null
    } catch (e) {
      console.log('ℹ️ Pas de session sauvegardée, nouvelle authentification requise')
    }
    
    const results = await extractCompletEdnItems(
      supabase, 
      username, 
      password, 
      resumeFromItem,
      maxItems,
      fullExtraction,
      sessionData
    )
    
    return new Response(
      JSON.stringify({
        success: true,
        message: `Extraction ${fullExtraction ? 'complète' : 'de test'} terminée`,
        stats: {
          totalProcessed: results.totalProcessed,
          totalSaved: results.totalSaved,
          totalErrors: results.totalErrors,
          itemsWithPrintableVersion: results.itemsWithPrintableVersion
        },
        data: results.extractedItems.slice(0, 5), // Limiter la réponse
        errors: results.errors
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error: unknown) {
    console.error('❌ Erreur critique:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: getErrorMessage(error),
        stack: error instanceof Error ? error.stack : undefined 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

// Authentification UNESS robuste (selon recommandations ticket)
async function authenticateUNESS(username: string, password: string, existingSession?: SessionStorage | null) {
  const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  
  // Vérifier si la session existante est encore valide
  if (existingSession && existingSession.expiresAt > Date.now()) {
    console.log('♻️ Réutilisation de la session existante')
    return {
      success: true,
      cookies: existingSession.cookies,
      sessionData: existingSession
    }
  }
  
  try {
    console.log('🔑 Authentification UNESS - Processus complet')
    const cookies = new Map<string, string>()
    
    // ÉTAPE 1: Page d'accueil pour initialiser la session
    console.log('🏠 Étape 1: Initialisation session cockpit...')
    const initResponse = await fetch('https://cockpit.uness.fr/', {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'fr-FR,fr;q=0.8,en-US;q=0.5,en;q=0.3',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      }
    })
    
    extractCookies(initResponse, cookies)
    
    // ÉTAPE 2: Soumission email avec parsing du formulaire
    console.log('📧 Étape 2: Soumission email...')
    const initHtml = await initResponse.text()
    
    // Extraire le token de sécurité ou les champs cachés
    const $ = cheerio.load(initHtml)
    const form = $('form').first()
    
    const emailFormData = new URLSearchParams()
    emailFormData.append('username', username) // Le champ username pour l'email
    
    // Ajouter tous les champs cachés du formulaire
    form.find('input[type="hidden"]').each((_, element) => {
      const name = $(element).attr('name')
      const value = $(element).attr('value')
      if (name && value) {
        emailFormData.append(name, value)
        console.log(`🔑 Champ caché ajouté: ${name}=${value}`)
      }
    })
    
    console.log('📋 Données envoyées pour l\'email:', emailFormData.toString())
    
    const emailResponse = await fetch('https://cockpit.uness.fr/cas/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': USER_AGENT,
        'Cookie': cookiesToString(cookies),
        'Origin': 'https://cockpit.uness.fr',
        'Referer': 'https://cockpit.uness.fr/',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      body: emailFormData.toString(),
      redirect: 'follow'
    })
    
    extractCookies(emailResponse, cookies)
    console.log(`📧 Réponse email: ${emailResponse.status}`)
    
    // Analyser la réponse pour détecter la page mot de passe
    const emailHtml = await emailResponse.text()
    if (emailHtml.includes('password') || emailHtml.includes('mot de passe')) {
      console.log('✅ Page mot de passe détectée')
    }
    
    // ÉTAPE 3: Soumission mot de passe avec parsing du nouveau formulaire
    console.log('🔐 Étape 3: Soumission mot de passe...')
    const $2 = cheerio.load(emailHtml)
    const passwordForm = $2('form').first()
    
    const passwordFormData = new URLSearchParams()
    passwordFormData.append('password', password)
    passwordFormData.append('username', username) // Garder le username
    
    // Ajouter tous les champs cachés du formulaire de mot de passe
    passwordForm.find('input[type="hidden"]').each((_, element) => {
      const name = $2(element).attr('name')
      const value = $2(element).attr('value')
      if (name && value) {
        passwordFormData.append(name, value)
        console.log(`🔑 Champ caché mot de passe: ${name}`)
      }
    })
    
    // Construire l'URL du formulaire de mot de passe
    const formAction = passwordForm.attr('action') || '/cas/login'
    const passwordUrl = formAction.startsWith('http') ? formAction : `https://cockpit.uness.fr${formAction}`
    
    const passwordResponse = await fetch(passwordUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': USER_AGENT,
        'Cookie': cookiesToString(cookies),
        'Origin': 'https://cockpit.uness.fr',
        'Referer': emailResponse.url,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      body: passwordFormData.toString(),
      redirect: 'follow'
    })
    
    extractCookies(passwordResponse, cookies)
    // ✅ SÉCURISÉ - Ticket 1.2: Log status uniquement
    console.log(`🔐 Réponse auth: ${passwordResponse.status}`)
    
    // ÉTAPE 4: Vérifier l'authentification et accéder à LiSA
    const passwordHtml = await passwordResponse.text()
    console.log(`📋 Taille réponse mot de passe: ${passwordHtml.length} caractères`)
    
    // Debug: vérifier le contenu de la réponse
    if (passwordHtml.includes('Identifiants incorrects')) {
      console.log('❌ Identifiants incorrects détectés')
    }
    if (passwordHtml.includes('Authentication failed')) {
      console.log('❌ Authentication failed détecté')
    }
    if (passwordHtml.includes('Veuillez saisir')) {
      console.log('❌ Demande de saisie détectée - échec authentification')
    }
    if (passwordHtml.includes('mot de passe')) {
      console.log('⚠️ Toujours sur page mot de passe')
    }
    
    // Vérifier si l'authentification a réussi (pas de message d'erreur)
    if (!passwordHtml.includes('Identifiants incorrects') && 
        !passwordHtml.includes('Authentication failed') &&
        !passwordHtml.includes('Veuillez saisir')) {
      
      console.log('✅ Authentification semble réussie - Test accès LiSA...')
      
      const lisaAccess = await followRedirectionToLisa(cookies, USER_AGENT)
      
      if (lisaAccess.success) {
        console.log('🎯 Accès LiSA authentifié confirmé')
        // Sauvegarder la session (valide 2h)
        const sessionData: SessionStorage = {
          cookies: cookiesToString(cookies),
          expiresAt: Date.now() + (2 * 60 * 60 * 1000) // 2 heures
        }
        
        return {
          success: true,
          cookies: cookiesToString(cookies),
          sessionData
        }
      }
    } else {
      console.log('❌ Échec authentification - Message d\'erreur détecté')
    }
    
    // FALLBACK: Accès direct public
    console.log('🔄 Fallback: Test accès public LiSA...')
    const publicTest = await fetch('https://livret.uness.fr/lisa/2025/Accueil', {
      headers: { 'User-Agent': USER_AGENT }
    })
    
    if (publicTest.ok) {
      const html = await publicTest.text()
      if (html.includes('Item de connaissance') || html.includes('Bienvenue')) {
        console.log('✅ Accès public LiSA disponible')
        return {
          success: true,
          cookies: '',
          sessionData: null
        }
      }
    }
    
    throw new Error('Impossible d\'accéder à LiSA avec ces identifiants')
    
  } catch (error) {
    console.error('❌ Erreur authentification:', error)
    return {
      success: false,
      error: error.message,
      sessionData: null
    }
  }
}

// Utilitaires pour la gestion des cookies et redirections
function extractCookies(response: Response, cookieMap: Map<string, string>) {
  const setCookieHeader = response.headers.get('set-cookie')
  if (setCookieHeader) {
    setCookieHeader.split(',').forEach(cookie => {
      const parts = cookie.split(';')[0].split('=')
      if (parts.length === 2) {
        cookieMap.set(parts[0].trim(), parts[1].trim())
      }
    })
  }
}

function cookiesToString(cookieMap: Map<string, string>): string {
  return Array.from(cookieMap.entries()).map(([k, v]) => `${k}=${v}`).join('; ')
}

async function followRedirectionToLisa(cookies: Map<string, string>, userAgent: string) {
  try {
    const lisaResponse = await fetch('https://livret.uness.fr/lisa/2025/Accueil', {
      headers: {
        'User-Agent': userAgent,
        'Cookie': cookiesToString(cookies),
        'Referer': 'https://cockpit.uness.fr/',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      }
    })
    
    extractCookies(lisaResponse, cookies)
    
    if (lisaResponse.ok) {
      const html = await lisaResponse.text()
      if (!html.includes('Veuillez saisir votre adresse e-mail')) {
        console.log('✅ Accès LiSA authentifié réussi')
        return { success: true }
      }
    }
    
    return { success: false, error: 'Accès LiSA refusé' }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Extraction complète des 367 items EDN (inspirée du ticket)
async function extractCompletEdnItems(
  supabase: any, 
  username: string, 
  password: string, 
  startFrom: number,
  maxItems: number,
  fullExtraction: boolean,
  existingSession?: SessionStorage | null
) {
  console.log(`🚀 Extraction ${fullExtraction ? 'COMPLÈTE' : 'TEST'} UNESS LISA 2025`)
  console.log(`📊 Items ${startFrom} → ${startFrom + maxItems - 1}`)
  
  let totalProcessed = 0
  let totalSaved = 0
  let totalErrors = 0
  let itemsWithPrintableVersion = 0
  let extractedItems: EdnItem[] = []
  let errors: string[] = []
  
  try {
    // Authentification
    console.log('🔐 Phase d\'authentification...')
    const authResult = await authenticateUNESS(username, password, existingSession)
    
    if (!authResult.success) {
      throw new Error(`Échec authentification: ${authResult.error}`)
    }
    
    console.log('✅ Authentification réussie')
    
    // Si mode test, utiliser URLs connues
    if (!fullExtraction) {
      return await extractTestItems(supabase, authResult.cookies!)
    }
    
    // Mode complet: découvrir tous les items depuis la page catégorie
    const allItems = await discoverAllItems(authResult.cookies!)
    console.log(`🔍 ${allItems.length} items découverts`)
    
    // Filtrer selon les paramètres
    const itemsToProcess = allItems
      .filter(item => item.numero >= startFrom && item.numero < startFrom + maxItems)
      .slice(0, maxItems)
    
    console.log(`📋 ${itemsToProcess.length} items à traiter`)
    
    // Traitement par lots de 10 pour éviter les timeouts
    const BATCH_SIZE = 10
    for (let i = 0; i < itemsToProcess.length; i += BATCH_SIZE) {
      const batch = itemsToProcess.slice(i, i + BATCH_SIZE)
      console.log(`\n📦 Lot ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(itemsToProcess.length/BATCH_SIZE)} (${batch.length} items)`)
      
      for (const item of batch) {
        try {
          console.log(`\n🔄 Item ${item.numero}: ${item.titre}`)
          
          const extractedItem = await extractSingleItem(item, authResult.cookies!)
          
          if (extractedItem) {
            // Sauvegarder en base avec gestion des conflits
            const { error } = await supabase
              .from('edn_items_uness')
              .upsert({
                item_id: extractedItem.numero_item,
                intitule: extractedItem.titre,
                contenu_complet_html: extractedItem.contenu_html,
                rangs_a: extractedItem.rangs_a,
                rangs_b: extractedItem.rangs_b,
                date_import: extractedItem.date_import
              }, {
                onConflict: 'item_id',
                ignoreDuplicates: false
              })
            
            if (error) {
              console.error(`❌ Erreur DB item ${item.numero}:`, error)
              errors.push(`Item ${item.numero}: ${error.message}`)
              totalErrors++
            } else {
              console.log(`✅ Item ${item.numero} sauvegardé`)
              totalSaved++
              extractedItems.push(extractedItem)
              
              if (extractedItem.rang_a_html || extractedItem.rang_b_html) {
                itemsWithPrintableVersion++
              }
            }
          }
          
          totalProcessed++
          
        } catch (itemError) {
          console.error(`❌ Erreur item ${item.numero}:`, itemError.message)
          errors.push(`Item ${item.numero}: ${itemError.message}`)
          totalErrors++
        }
        
        // Throttling anti-ban (selon ticket)
        await new Promise(resolve => setTimeout(resolve, 1500))
      }
      
      // Pause plus longue entre les lots
      if (i + BATCH_SIZE < itemsToProcess.length) {
        console.log('⏸️ Pause inter-lot (5s)...')
        await new Promise(resolve => setTimeout(resolve, 5000))
      }
    }
    
    return {
      totalProcessed,
      totalSaved,
      totalErrors,
      itemsWithPrintableVersion,
      extractedItems,
      errors
    }
    
  } catch (error) {
    console.error('❌ Erreur critique extraction:', error)
    return {
      totalProcessed,
      totalSaved,
      totalErrors: totalErrors + 1,
      itemsWithPrintableVersion,
      extractedItems,
      errors: [...errors, `Erreur critique: ${error.message}`]
    }
  }
}

// Mode test avec items connus
async function extractTestItems(supabase: any, cookies: string) {
  const testItems = [
    { numero: 1, titre: "La relation médecin-malade", url: "https://livret.uness.fr/lisa/2025/Item_1_-_La_relation_médecin-malade" },
    { numero: 2, titre: "Les droits du patient", url: "https://livret.uness.fr/lisa/2025/Item_2_-_Les_droits_individuels_et_collectifs_du_patient" },
    { numero: 3, titre: "Le raisonnement médical", url: "https://livret.uness.fr/lisa/2025/Item_3_-_Le_raisonnement_et_la_décision_en_médecine" }
  ]
  
  let totalProcessed = 0
  let totalSaved = 0
  let extractedItems: EdnItem[] = []
  
  for (const testItem of testItems) {
    try {
      const extracted = await extractSingleItem(testItem, cookies)
      if (extracted) {
        await supabase.from('edn_items_uness').upsert({
          item_id: extracted.numero_item,
          intitule: extracted.titre,
          contenu_complet_html: extracted.contenu_html,
          rangs_a: extracted.rangs_a,
          rangs_b: extracted.rangs_b,
          date_import: extracted.date_import
        })
        
        totalSaved++
        extractedItems.push(extracted)
      }
      totalProcessed++
    } catch (e) {
      console.error(`Erreur test item ${testItem.numero}:`, e)
    }
  }
  
  return {
    totalProcessed,
    totalSaved,
    totalErrors: 0,
    itemsWithPrintableVersion: 0,
    extractedItems,
    errors: []
  }
}

// Extraction LISA 2025
async function extractLISA2025(cookies: string) {
  console.log('📚 Extraction LISA 2025...')
  
  try {
    // URL directe de la liste des items de connaissance 2C
    const itemsListUrl = 'https://livret.uness.fr/lisa/2025/Item_de_connaissance_2C'
    console.log('🔍 Récupération de la liste des items de connaissance...')
    
    const response = await fetch(itemsListUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Cookie': cookies || '',
      }
    })
    
    if (!response.ok) {
      console.log(`❌ Erreur HTTP: ${response.status}`)
      console.log('🔄 Tentative sans cookies...')
      
      // Essayer sans cookies (accès public)
      const publicResponse = await fetch(itemsListUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        }
      })
      
      if (!publicResponse.ok) {
        throw new Error(`Impossible d'accéder à la page: ${publicResponse.status}`)
      }
      
      const html = await publicResponse.text()
      return extractItemsFromHTML(html, '')
    }
    
    const html = await response.text()
    return extractItemsFromHTML(html, cookies)
    
  } catch (error) {
    console.error('❌ Erreur extraction:', error)
    throw error
  }
}

// Fonction d'extraction du HTML
async function extractItemsFromHTML(html: string, cookies: string) {
  console.log(`📄 HTML reçu: ${html.length} caractères`)
  
  const $ = cheerio.load(html)
  
  // Vérifier si on est sur la bonne page
  if (html.includes('Veuillez saisir votre adresse e-mail')) {
    console.log('⚠️ Page de connexion détectée, accès non autorisé')
    throw new Error('Authentification requise - la page demande une connexion')
  }
  
  // Extraire tous les liens vers les items
  const itemLinks = []
  
  // Chercher dans les catégories MediaWiki
  console.log('🔍 Recherche des items dans les catégories...')
  
  // Méthode 1: Liens dans mw-category
  $('.mw-category li a').each((i, elem) => {
    const href = $(elem).attr('href')
    const title = $(elem).text().trim()
    
    if (href && title.match(/Item\s+\d+/i)) {
      itemLinks.push({
        url: href.startsWith('http') ? href : `https://livret.uness.fr${href}`,
        title: title
      })
    }
  })
  
  // Méthode 2: Tous les liens contenant Item
  if (itemLinks.length === 0) {
    console.log('🔍 Recherche élargie des items...')
    $('a').each((i, elem) => {
      const href = $(elem).attr('href')
      const title = $(elem).text().trim()
      
      if (href && title.match(/Item\s+\d+\s*-/i)) {
        const url = href.startsWith('http') ? href : `https://livret.uness.fr${href}`
        
        // Éviter les doublons
        if (!itemLinks.find(item => item.url === url)) {
          itemLinks.push({ url, title })
        }
      }
    })
  }
  
  console.log(`🔗 ${itemLinks.length} items trouvés`)
  
  if (itemLinks.length === 0) {
    console.log('⚠️ Aucun item trouvé, vérification du contenu HTML...')
    
    // Debug: afficher les premiers éléments trouvés
    const debugInfo = []
    $('a').slice(0, 10).each((i, elem) => {
      debugInfo.push({
        text: $(elem).text().trim(),
        href: $(elem).attr('href')
      })
    })
    console.log('🔍 Premiers liens trouvés:', debugInfo)
    
    throw new Error('Aucun item trouvé sur la page - vérifiez l\'URL ou l\'authentification')
  }
  
  // Trier les items par numéro
  itemLinks.sort((a, b) => {
    const numA = parseInt(a.title.match(/Item\s+(\d+)/i)?.[1] || '0')
    const numB = parseInt(b.title.match(/Item\s+(\d+)/i)?.[1] || '0')
    return numA - numB
  })
  
  // Limiter à 5 items pour le test
  const itemsToProcess = itemLinks.slice(0, 5)
  console.log(`📊 Traitement de ${itemsToProcess.length} items...`)
  
  const results = []
  
  for (const item of itemsToProcess) {
    console.log(`\n🔄 Traitement: ${item.title}`)
    
    try {
      // Récupérer la page de l'item
      const itemResponse = await fetch(item.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Cookie': cookies,
        }
      })
      
      if (!itemResponse.ok) {
        console.error(`❌ Erreur ${itemResponse.status} pour ${item.title}`)
        continue
      }
      
      const itemHtml = await itemResponse.text()
      const $item = cheerio.load(itemHtml)
      
      // Chercher la version imprimable
      let printableUrl = null
      $item('a').each((i, elem) => {
        const text = $item(elem).text()
        const href = $item(elem).attr('href')
        if (text && (text.includes('Version imprimable') || text.includes('version imprimable'))) {
          printableUrl = href?.startsWith('http') ? href : `https://livret.uness.fr${href}`
        }
      })
      
      let finalHtml = itemHtml
      let $final = $item
      
      // Utiliser la version imprimable si disponible
      if (printableUrl) {
        console.log(`📄 Version imprimable trouvée`)
        
        const printResponse = await fetch(printableUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Cookie': cookies,
          }
        })
        
        if (printResponse.ok) {
          finalHtml = await printResponse.text()
          $final = cheerio.load(finalHtml)
          console.log('✅ Version imprimable récupérée')
        }
      }
      
      // Extraire le numéro de l'item
      const itemNumberMatch = item.title.match(/Item\s+(\d+)/i)
      const itemNumber = itemNumberMatch ? parseInt(itemNumberMatch[1]) : null
      
      if (!itemNumber) {
        console.log('⚠️ Numéro d\'item non trouvé')
        continue
      }
      
      // Extraire les compétences
      const competences = extractCompetences($final, finalHtml)
      
      console.log(`✅ Item ${itemNumber}: ${competences.rang_a.length} rang A, ${competences.rang_b.length} rang B`)
      
      results.push({
        item_number: itemNumber,
        title: item.title,
        content: competences,
        html: finalHtml,
        url: item.url
      })
      
    } catch (itemError) {
      console.error(`❌ Erreur item ${item.title}:`, itemError.message)
    }
    
    // Pause entre les requêtes
    await new Promise(resolve => setTimeout(resolve, 500))
  }
  
  return results
}

// Découverte de tous les items depuis la page catégorie
async function discoverAllItems(cookies: string) {
  console.log('🔍 Découverte de tous les items EDN...')
  
  const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  const items: Array<{numero: number, titre: string, url: string}> = []
  
  try {
    // Page principale des items de connaissance
    const response = await fetch('https://livret.uness.fr/lisa/2025/Item_de_connaissance_2C', {
      headers: {
        'User-Agent': USER_AGENT,
        'Cookie': cookies,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      }
    })
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP ${response.status}`)
    }
    
    const html = await response.text()
    const $ = cheerio.load(html)
    
    // Extraire tous les liens d'items
    $('a').each((i, elem) => {
      const href = $(elem).attr('href')
      const title = $(elem).text().trim()
      
      const itemMatch = title.match(/Item\s+(\d+)\s*[-–—]?\s*(.+)?/i)
      if (itemMatch && href) {
        const numero = parseInt(itemMatch[1])
        const titre = itemMatch[2] || title
        const url = href.startsWith('http') ? href : `https://livret.uness.fr${href}`
        
        if (numero >= 1 && numero <= 367) {
          items.push({ numero, titre: titre.trim(), url })
        }
      }
    })
    
    // Trier par numéro
    items.sort((a, b) => a.numero - b.numero)
    
    // Supprimer les doublons
    const uniqueItems = items.filter((item, index, arr) => 
      arr.findIndex(i => i.numero === item.numero) === index
    )
    
    console.log(`✅ ${uniqueItems.length} items uniques découverts`)
    return uniqueItems
    
  } catch (error) {
    console.error('❌ Erreur découverte items:', error)
    
    // Fallback: générer URLs connues pour les 367 items
    console.log('🔄 Fallback: génération URLs systématiques...')
    const fallbackItems = []
    for (let i = 1; i <= 367; i++) {
      fallbackItems.push({
        numero: i,
        titre: `Item EDN ${i}`,
        url: `https://livret.uness.fr/lisa/2025/Item_${i}`
      })
    }
    return fallbackItems
  }
}

// Extraction d'un item individuel avec version imprimable
async function extractSingleItem(item: {numero: number, titre: string, url: string}, cookies: string): Promise<EdnItem | null> {
  const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  
  try {
    console.log(`📄 Récupération page item ${item.numero}...`)
    
    // Récupérer la page principale
    const response = await fetch(item.url, {
      headers: {
        'User-Agent': USER_AGENT,
        'Cookie': cookies,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    
    let html = await response.text()
    const $ = cheerio.load(html)
    
    // Rechercher la version imprimable (priorité ticket)
    let printableUrl: string | null = null
    $('a').each((i, elem) => {
      const text = $(elem).text().toLowerCase()
      const href = $(elem).attr('href')
      
      if ((text.includes('version imprimable') || text.includes('printable')) && href) {
        printableUrl = href.startsWith('http') ? href : `https://livret.uness.fr${href}`
        return false // Stop iteration
      }
    })
    
    let rang_a_html: string | null = null
    let rang_b_html: string | null = null
    
    // Si version imprimable trouvée, l'utiliser
    if (printableUrl) {
      console.log(`📋 Version imprimable trouvée: ${printableUrl}`)
      
      try {
        const printResponse = await fetch(printableUrl, {
          headers: {
            'User-Agent': USER_AGENT,
            'Cookie': cookies,
          }
        })
        
        if (printResponse.ok) {
          html = await printResponse.text()
          console.log('✅ Version imprimable récupérée')
        }
      } catch (printError) {
        console.log('⚠️ Erreur version imprimable, utilisation version normale')
      }
    }
    
    // Parser le contenu pour extraire les compétences
    const competences = extractCompetencesAdvanced(html)
    
    // Extraire le HTML spécifique des sections Rang A et B
    const $final = cheerio.load(html)
    rang_a_html = extractRangSection($final, 'A')
    rang_b_html = extractRangSection($final, 'B')
    
    return {
      numero_item: item.numero,
      titre: item.titre,
      contenu_html: html,
      rang_a_html,
      rang_b_html,
      rangs_a: competences.rang_a,
      rangs_b: competences.rang_b,
      url_source: item.url,
      date_import: new Date().toISOString()
    }
    
  } catch (error) {
    console.error(`❌ Erreur extraction item ${item.numero}:`, error.message)
    return null
  }
}

// Extraction avancée des compétences (améliorée selon ticket)
// ---------------------------------------------------------------------------
// CONSTAT D'AUDIT (18/09/2026) — trois filtres faisaient perdre des compétences
// à l'extraction, silencieusement :
//
// 1. `!text.includes('rang')` écartait TOUTE compétence dont l'énoncé contient
//    le mot « rang ». Or les compétences de rang B renvoient couramment au
//    rang A (« Connaître les éléments de rang A relatifs à… »). On ne veut
//    écarter que les EN-TÊTES de colonne, pas les énoncés qui citent un rang.
// 2. `length > 10` écartait les intitulés courts pourtant réels : « Définition »
//    fait exactement 10 caractères et existe bel et bien dans le référentiel
//    (OIC-019-05-A, OIC-055-13-B). Seuil ramené à 3 caractères.
// 3. Dans les tableaux, le rang était déduit du texte du TABLEAU ENTIER. Une
//    page UNESS présente souvent les deux rangs dans un même tableau : les deux
//    tests étaient vrais et chaque cellule partait dans les DEUX rangs. Le rang
//    se lit maintenant par ligne (colonne « Rang »), et on ne retombe sur le
//    tableau entier que s'il ne contient qu'un seul rang.
// ---------------------------------------------------------------------------

/** Un en-tête de colonne de rang — à écarter, ce n'est pas une compétence. */
const EST_ENTETE_RANG = /^\s*(connaissances?\s+|objectifs?\s+|comp[eé]tences?\s+)?rang\s*[ab]\s*$/i

/** Normalise une cellule et dit si elle porte une vraie compétence. */
function texteCompetence(brut: string | null | undefined): string | null {
  const t = (brut || '').replace(/\s+/g, ' ').trim()
  if (t.length < 3) return null
  if (EST_ENTETE_RANG.test(t)) return null
  if (/^(rang|item|n[°o]|num[eé]ro|intitul[eé]|description|rubrique)$/i.test(t)) return null
  return t
}

/** Le rang porté par une cellule isolée ('A', 'B') ou null. */
function rangDeCellule(brut: string | null | undefined): 'A' | 'B' | null {
  const t = (brut || '').trim()
  if (/^a$/i.test(t) || /^rang\s*a$/i.test(t)) return 'A'
  if (/^b$/i.test(t) || /^rang\s*b$/i.test(t)) return 'B'
  return null
}

/**
 * Rang annoncé par le CONTEXTE du tableau (sa légende, ou le titre qui le
 * précède) quand le tableau lui-même ne porte aucun marqueur. Cas courant sur
 * UNESS : « Connaissances Rang A » en <h3>, puis un tableau sans le mot rang.
 * Sans ça, ces tableaux ne produisaient RIEN. Un contexte qui cite les deux
 * rangs reste ambigu : on ne tranche pas.
 */
function rangDuContexte($table: any, $: any): 'A' | 'B' | null {
  const candidats: string[] = []

  const legende = $table.find('caption').first().text()
  if (legende && legende.trim()) candidats.push(legende)

  // Frères précédents (du plus proche au plus lointain), puis ceux du parent.
  let noeud = $table
  for (let saut = 0; saut < 3 && noeud.length; saut++) {
    let frere = noeud.prev()
    let garde = 0
    let trouve = false
    while (frere.length && garde++ < 20) {
      const t = frere.text()
      if (t && t.trim()) { candidats.push(t); trouve = true }
      if (frere.is('h1, h2, h3, h4, h5, h6')) break
      frere = frere.prev()
    }
    if (trouve) break
    noeud = noeud.parent()
  }

  for (const brut of candidats) {
    const t = brut.toLowerCase()
    const a = t.includes('rang a') || t.includes('connaissances a')
    const b = t.includes('rang b') || t.includes('connaissances b')
    if (a && b) return null // contexte ambigu
    if (a) return 'A'
    if (b) return 'B'
  }
  return null
}

function extractCompetencesAdvanced(html: string) {
  const $ = cheerio.load(html)
  const rang_a: string[] = []
  const rang_b: string[] = []
  
  console.log('🔍 Extraction avancée des compétences...')
  
  // Stratégie 1: Sections avec headers (améliorée)
  const rangAHeaders = ['rang a', 'connaissances rang a', 'objectifs rang a', 'compétences rang a']
  const rangBHeaders = ['rang b', 'connaissances rang b', 'objectifs rang b', 'compétences rang b']
  
  $('h1, h2, h3, h4, h5, h6').each((i, elem) => {
    const heading = $(elem).text().toLowerCase().trim()
    
    if (rangAHeaders.some(header => heading.includes(header))) {
      extractContentAfterHeader($(elem), rang_a, $)
    }
    
    if (rangBHeaders.some(header => heading.includes(header))) {
      extractContentAfterHeader($(elem), rang_b, $)
    }
  })
  
  // Stratégie 2: Tableaux spécialisés
  extractFromTables($, rang_a, rang_b)
  
  // Stratégie 3: Listes et paragraphes
  extractFromLists($, rang_a, rang_b)
  
  // Stratégie 4: Patterns textuels avancés
  if (rang_a.length === 0 && rang_b.length === 0) {
    extractFromTextPatterns(html, rang_a, rang_b)
  }
  
  return {
    // Seuil à 3 caractères : « Définition » (10) est une compétence réelle.
    rang_a: [...new Set(rang_a.map(texteCompetence).filter((x): x is string => !!x))],
    rang_b: [...new Set(rang_b.map(texteCompetence).filter((x): x is string => !!x))]
  }
}

function extractContentAfterHeader($header: any, targetArray: string[], $: any) {
  let current = $header.next()
  let foundContent = false
  
  while (current.length && !current.is('h1, h2, h3, h4, h5, h6')) {
    if (current.is('ul, ol')) {
      current.find('li').each((j: number, li: any) => {
        const text = texteCompetence($(li).text())
        if (text) {
          targetArray.push(text)
          foundContent = true
        }
      })
    } else if (current.is('p')) {
      const text = texteCompetence(current.text())
      if (text) {
        targetArray.push(text)
        foundContent = true
      }
    }
    current = current.next()
  }
  
  if (foundContent) {
    console.log(`📌 Contenu extrait pour section: ${targetArray.slice(-3)}`)
  }
}

function extractFromTables($: any, rang_a: string[], rang_b: string[]) {
  $('table').each((_i: number, table: any) => {
    const $table = $(table)

    // Repère une éventuelle colonne « Rang » à partir de la ligne d'en-tête.
    let colonneRang = -1
    const entetes: string[] = []
    $table.find('tr').first().find('th, td').each((idx: number, cell: any) => {
      const t = $(cell).text().trim()
      entetes.push(t)
      if (/^rang$/i.test(t)) colonneRang = idx
    })

    const texteTable = $table.text().toLowerCase()
    const aRangA = texteTable.includes('rang a') || texteTable.includes('connaissances a')
    const aRangB = texteTable.includes('rang b') || texteTable.includes('connaissances b')
    // Tableau muet sur le rang : on lit le titre / la légende qui l'introduit.
    const rangContexte = (!aRangA && !aRangB) ? rangDuContexte($table, $) : null

    $table.find('tr').each((ligneIdx: number, tr: any) => {
      if (ligneIdx === 0 && entetes.length) return // ligne d'en-tête

      const cellules: string[] = []
      $(tr).find('td, th').each((_j: number, cell: any) => cellules.push($(cell).text()))
      if (cellules.length === 0) return

      // Rang de CETTE ligne : colonne dédiée, sinon première cellule qui vaut A/B.
      let rang: 'A' | 'B' | null = null
      if (colonneRang >= 0 && cellules[colonneRang] !== undefined) {
        rang = rangDeCellule(cellules[colonneRang])
      }
      if (!rang) {
        for (const c of cellules) {
          const r = rangDeCellule(c)
          if (r) { rang = r; break }
        }
      }
      // Dernier recours : le tableau ne porte qu'un seul rang…
      if (!rang && aRangA && !aRangB) rang = 'A'
      if (!rang && aRangB && !aRangA) rang = 'B'
      // …ou c'est le titre qui l'introduit qui le dit.
      if (!rang && rangContexte) rang = rangContexte
      if (!rang) return // tableau ambigu : on ne devine pas, on n'invente pas

      for (const c of cellules) {
        const t = texteCompetence(c)
        if (!t) continue
        if (rangDeCellule(c)) continue // la cellule de rang elle-même
        ;(rang === 'A' ? rang_a : rang_b).push(t)
      }
    })
  })
}

function extractFromLists($: any, rang_a: string[], rang_b: string[]) {
  $('ul, ol').each((i: number, list: any) => {
    const listContext = $(list).prev().text().toLowerCase()
    
    if (listContext.includes('rang a')) {
      $(list).find('li').each((j: number, li: any) => {
        const text = texteCompetence($(li).text())
        if (text) rang_a.push(text)
      })
    } else if (listContext.includes('rang b')) {
      $(list).find('li').each((j: number, li: any) => {
        const text = texteCompetence($(li).text())
        if (text) rang_b.push(text)
      })
    }
  })
}

function extractFromTextPatterns(html: string, rang_a: string[], rang_b: string[]) {
  console.log('🔍 Recherche par patterns textuels...')
  
  const cleanText = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ')
  
  // Patterns pour Rang A
  const rangAPatterns = [
    /rang\s*a[^:]*:([^]*?)(?=rang\s*b|$)/i,
    /connaissances?\s+rang\s*a[^:]*:([^]*?)(?=connaissances?\s+rang\s*b|$)/i,
    /objectifs?\s+rang\s*a[^:]*:([^]*?)(?=objectifs?\s+rang\s*b|$)/i
  ]
  
  // Patterns pour Rang B
  const rangBPatterns = [
    /rang\s*b[^:]*:([^]*?)(?=rang\s*a|$)/i,
    /connaissances?\s+rang\s*b[^:]*:([^]*?)(?=connaissances?\s+rang\s*a|$)/i,
    /objectifs?\s+rang\s*b[^:]*:([^]*?)(?=objectifs?\s+rang\s*a|$)/i
  ]
  
  for (const pattern of rangAPatterns) {
    const match = cleanText.match(pattern)
    if (match) {
      const items = match[1]
        .split(/[•\-–—\n]/)
        .map(s => s.trim())
        .map(texteCompetence).filter((s): s is string => !!s)
      rang_a.push(...items)
      break
    }
  }
  
  for (const pattern of rangBPatterns) {
    const match = cleanText.match(pattern)
    if (match) {
      const items = match[1]
        .split(/[•\-–—\n]/)
        .map(s => s.trim())
        .map(texteCompetence).filter((s): s is string => !!s)
      rang_b.push(...items)
      break
    }
  }
}

function extractRangSection($: any, rang: 'A' | 'B'): string | null {
  const searchTerms = [`rang ${rang.toLowerCase()}`, `connaissances rang ${rang.toLowerCase()}`]
  
  for (const term of searchTerms) {
    const header = $('h1, h2, h3, h4, h5, h6').filter((i: number, elem: any) => 
      $(elem).text().toLowerCase().includes(term)
    ).first()
    
    if (header.length) {
      let content = ''
      let current = header.next()
      
      while (current.length && !current.is('h1, h2, h3, h4, h5, h6')) {
        content += $.html(current)
        current = current.next()
      }
      
      if (content.trim()) {
        return content
      }
    }
  }
  
  return null
}