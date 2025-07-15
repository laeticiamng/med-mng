import { serve } from 'https://deno.land/std@0.131.0/http/server.ts'
import { createClient } from 'https://cdn.skypack.dev/@supabase/supabase-js@1.35.3'
import * as cheerio from 'https://esm.sh/cheerio@1.0.0-rc.12'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ExtractRequest {
  action: string
  resumeFromItem?: number
  credentials?: {
    username: string
    password: string
  }
}

interface EdnItem {
  item_id: number
  intitule: string
  rangs_a: string[]
  rangs_b: string[]
  contenu_complet_html: string
}

const supabaseUrl = Deno.env.get('SUPABASE_URL')
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
const supabase = createClient(supabaseUrl, supabaseServiceKey)

serve(async (req) => {
  console.log('🚀 Fonction extract-edn-uness démarrée')
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const body = await req.json() as ExtractRequest
    const { action, resumeFromItem = 1, credentials } = body
    
    console.log(`📊 Action: ${action}, Starting from item: ${resumeFromItem}`)
    
    if (!credentials) {
      throw new Error('Credentials are required')
    }
    
    const results = await extractEdnItems(supabase, credentials.username, credentials.password, resumeFromItem)
    
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Extraction completed successfully',
        stats: {
          totalProcessed: results.totalProcessed,
          totalSaved: results.totalProcessed
        },
        data: results.extractedItems
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('❌ Erreur:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

// Authentification UNESS avec le nouveau processus en deux étapes
async function authenticateUNESS(username: string, password: string) {
  try {
    console.log('🔑 Authentification UNESS en deux étapes...')
    
    // Gestion des cookies
    const cookies = new Map()
    
    // Étape 1: Soumettre l'email
    console.log('📧 Étape 1: Soumission de l\'email...')
    
    const emailResponse = await fetch('https://cockpit.uness.fr/api/auth/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Origin': 'https://cockpit.uness.fr',
        'Referer': 'https://cockpit.uness.fr/',
      },
      body: JSON.stringify({ email: username })
    })
    
    if (!emailResponse.ok) {
      console.log('❌ Échec soumission email, tentative méthode alternative...')
      
      // Méthode alternative: formulaire classique
      const formData = new URLSearchParams()
      formData.append('email', username)
      
      const altResponse = await fetch('https://cockpit.uness.fr/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        body: formData.toString()
      })
      
      // Extraire les cookies
      const setCookie = altResponse.headers.get('set-cookie')
      if (setCookie) {
        setCookie.split(',').forEach(cookie => {
          const [name, value] = cookie.split('=')
          cookies.set(name.trim(), value.split(';')[0])
        })
      }
    }
    
    // Étape 2: Soumettre le mot de passe
    console.log('🔐 Étape 2: Soumission du mot de passe...')
    
    const passwordData = new URLSearchParams()
    passwordData.append('password', password)
    passwordData.append('email', username)
    
    const passwordResponse = await fetch('https://cockpit.uness.fr/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Cookie': Array.from(cookies.entries()).map(([k, v]) => `${k}=${v}`).join('; '),
        'Origin': 'https://cockpit.uness.fr',
        'Referer': 'https://cockpit.uness.fr/',
      },
      body: passwordData.toString(),
      redirect: 'manual'
    })
    
    // Mettre à jour les cookies
    const newCookies = passwordResponse.headers.get('set-cookie')
    if (newCookies) {
      newCookies.split(',').forEach(cookie => {
        const [name, value] = cookie.split('=')
        cookies.set(name.trim(), value.split(';')[0])
      })
    }
    
    // Vérifier la connexion
    if (passwordResponse.status === 302 || passwordResponse.status === 303) {
      console.log('✅ Authentification réussie!')
      
      // Étape 3: Accéder à LiSA depuis le cockpit
      console.log('🔗 Accès à LiSA...')
      
      const lisaResponse = await fetch('https://livret.uness.fr/lisa/2025/Accueil', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Cookie': Array.from(cookies.entries()).map(([k, v]) => `${k}=${v}`).join('; '),
          'Referer': 'https://cockpit.uness.fr/',
        }
      })
      
      // Ajouter les cookies LiSA
      const lisaCookies = lisaResponse.headers.get('set-cookie')
      if (lisaCookies) {
        lisaCookies.split(',').forEach(cookie => {
          const [name, value] = cookie.split('=')
          cookies.set(name.trim(), value.split(';')[0])
        })
      }
      
      return {
        success: true,
        cookies: Array.from(cookies.entries()).map(([k, v]) => `${k}=${v}`).join('; ')
      }
    }
    
    // Si pas de redirection, tenter une connexion directe à LiSA
    console.log('🔄 Tentative connexion directe LiSA...')
    
    const directLisaResponse = await fetch('https://livret.uness.fr/lisa/2025/Accueil', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      }
    })
    
    const lisaHtml = await directLisaResponse.text()
    
    // Vérifier si on a accès au contenu
    if (lisaHtml.includes('Item de connaissance') || lisaHtml.includes('Bienvenue sur LiSA')) {
      console.log('✅ Accès direct à LiSA réussi')
      return {
        success: true,
        cookies: ''  // Pas besoin de cookies pour l'accès public
      }
    }
    
    return {
      success: false,
      error: 'Échec de l\'authentification - vérifiez les identifiants'
    }
    
  } catch (error) {
    console.error('❌ Erreur authentification:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

async function extractEdnItems(supabase: any, username: string, password: string, startFrom: number) {
  console.log("🔐 Début de l'authentification UNESS...");
  
  let totalProcessed = 0;
  let extractedItems: EdnItem[] = [];
  const maxItems = Math.min(startFrom + 4, 10); // Traiter maximum 5 items pour le test

  try {
    // Étape 1: Authentification
    const authResult = await authenticateUNESS(username, password);
    
    if (!authResult.success) {
      throw new Error(`Échec de l'authentification: ${authResult.error}`)
    }
    
    console.log('✅ Authentification réussie')
    
    // Étape 2: Extraction LISA 2025
    const results = await extractLISA2025(authResult.cookies)
    
    console.log(`📦 ${results.length} items extraits`)
    
    // Sauvegarder les résultats
    for (const result of results) {
      try {
        const { error } = await supabase
          .from('edn_items_uness')
          .upsert({
            item_id: result.item_number,
            intitule: result.title,
            rangs_a: result.content?.rang_a || [],
            rangs_b: result.content?.rang_b || [],
            contenu_complet_html: result.html || '',
            date_import: new Date().toISOString()
          });

        if (error) {
          console.error(`❌ Erreur sauvegarde item ${result.item_number}:`, error);
        } else {
          console.log(`✅ Item ${result.item_number} sauvegardé`);
          totalProcessed++;
        }
      } catch (saveError) {
        console.error(`❌ Erreur sauvegarde item ${result.item_number}:`, saveError);
      }
    }

    return {
      totalProcessed,
      extractedItems: results.map(r => ({
        item_id: r.item_number,
        intitule: r.title,
        rangs_a: r.content?.rang_a || [],
        rangs_b: r.content?.rang_b || [],
        contenu_complet_html: r.html || ''
      }))
    };

  } catch (error) {
    console.error("❌ Erreur dans l'extraction complète:", error);
    return {
      totalProcessed: 0,
      extractedItems: [],
      error: error.message
    };
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

// Fonction d'extraction des compétences
function extractCompetences($: any, html: string) {
  const rang_a: string[] = []
  const rang_b: string[] = []
  
  console.log('🔍 Extraction des compétences...')
  
  // Stratégie 1: Recherche par titres de sections
  $('h2, h3, h4, h5').each((i: number, elem: any) => {
    const heading = $(elem).text().trim()
    
    if (heading.match(/rang\s*a/i) || heading.match(/connaissances?\s+rang\s*a/i)) {
      console.log('📌 Section Rang A trouvée:', heading)
      
      let nextElem = $(elem).next()
      while (nextElem.length && !nextElem.is('h2, h3, h4, h5')) {
        if (nextElem.is('ul, ol')) {
          nextElem.find('li').each((j: number, li: any) => {
            const text = $(li).text().trim()
            if (text.length > 10) rang_a.push(text)
          })
        } else if (nextElem.is('p') || nextElem.is('div')) {
          const text = nextElem.text().trim()
          if (text.length > 10 && !text.match(/rang\s*b/i)) {
            rang_a.push(text)
          }
        }
        nextElem = nextElem.next()
      }
    }
    
    if (heading.match(/rang\s*b/i) || heading.match(/connaissances?\s+rang\s*b/i)) {
      console.log('📌 Section Rang B trouvée:', heading)
      
      let nextElem = $(elem).next()
      while (nextElem.length && !nextElem.is('h2, h3, h4, h5')) {
        if (nextElem.is('ul, ol')) {
          nextElem.find('li').each((j: number, li: any) => {
            const text = $(li).text().trim()
            if (text.length > 10) rang_b.push(text)
          })
        } else if (nextElem.is('p') || nextElem.is('div')) {
          const text = nextElem.text().trim()
          if (text.length > 10 && !text.match(/rang\s*a/i)) {
            rang_b.push(text)
          }
        }
        nextElem = nextElem.next()
      }
    }
  })
  
  // Stratégie 2: Recherche par classes CSS
  $('.rang-a, .rangA, .rang_a').each((i: number, elem: any) => {
    const text = $(elem).text().trim()
    if (text.length > 10 && !rang_a.includes(text)) {
      rang_a.push(text)
    }
  })
  
  $('.rang-b, .rangB, .rang_b').each((i: number, elem: any) => {
    const text = $(elem).text().trim()
    if (text.length > 10 && !rang_b.includes(text)) {
      rang_b.push(text)
    }
  })
  
  // Stratégie 3: Recherche dans les tableaux
  $('table').each((i: number, table: any) => {
    const tableText = $(table).text()
    
    if (tableText.match(/rang\s*a/i)) {
      $(table).find('td, th').each((j: number, cell: any) => {
        const text = $(cell).text().trim()
        if (text.length > 10 && !text.match(/rang/i) && !rang_a.includes(text)) {
          rang_a.push(text)
        }
      })
    }
    
    if (tableText.match(/rang\s*b/i)) {
      $(table).find('td, th').each((j: number, cell: any) => {
        const text = $(cell).text().trim()
        if (text.length > 10 && !text.match(/rang/i) && !rang_b.includes(text)) {
          rang_b.push(text)
        }
      })
    }
  })
  
  // Si toujours rien, recherche par patterns dans le texte
  if (rang_a.length === 0 && rang_b.length === 0) {
    console.log('🔍 Recherche par patterns regex...')
    
    const cleanText = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ')
    
    // Pattern pour rang A
    const rangAMatch = cleanText.match(/rang\s*a[^:]*:\s*([^]*?)(?=rang\s*b|$)/i)
    if (rangAMatch) {
      const items = rangAMatch[1]
        .split(/[•\-–—\n]/)
        .map(s => s.trim())
        .filter(s => s.length > 10)
      rang_a.push(...items)
    }
    
    // Pattern pour rang B
    const rangBMatch = cleanText.match(/rang\s*b[^:]*:\s*([^]*?)(?=rang\s*a|$)/i)
    if (rangBMatch) {
      const items = rangBMatch[1]
        .split(/[•\-–—\n]/)
        .map(s => s.trim())
        .filter(s => s.length > 10)
      rang_b.push(...items)
    }
  }
  
  return {
    rang_a: [...new Set(rang_a)], // Déduplique
    rang_b: [...new Set(rang_b)]
  }
}