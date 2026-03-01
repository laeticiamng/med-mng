import { serve } from 'https://deno.land/std@0.190.0/http/server.ts'
import { getErrorMessage } from '../_shared/error-utils.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3'
import * as cheerio from 'https://esm.sh/cheerio@1.0.0-rc.12'
import { corsHeaders } from '../_shared/cors.ts'
import { casLogin } from '../lib/casLogin.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

/**
 * Fallback auth via cockpit.uness.fr (comme extract-edn-uness)
 */
async function cockpitLogin(username: string, password: string): Promise<{ success: boolean; cookies: string; error?: string }> {
  const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  const cookieMap = new Map<string, string>()

  function extractCookies(response: Response) {
    const sc = response.headers.get('set-cookie')
    if (!sc) return
    sc.split(',').forEach(c => {
      const [kv] = c.split(';')
      const [k, v] = kv.split('=')
      if (k && v) cookieMap.set(k.trim(), v.trim())
    })
  }

  function cookieStr() {
    return Array.from(cookieMap.entries()).map(([k, v]) => `${k}=${v}`).join('; ')
  }

  try {
    // Step 1: Init
    const initResp = await fetch('https://cockpit.uness.fr/', {
      headers: { 'User-Agent': UA }
    })
    extractCookies(initResp)
    const initHtml = await initResp.text()

    const $1 = cheerio.load(initHtml)
    const form1 = $1('form').first()
    const emailData = new URLSearchParams()
    emailData.append('username', username)
    form1.find('input[type="hidden"]').each((_, el) => {
      const n = $1(el).attr('name'), v = $1(el).attr('value')
      if (n && v) emailData.append(n, v)
    })

    const formAction = form1.attr('action') || '/cas/login'
    const emailUrl = formAction.startsWith('http') ? formAction : `https://cockpit.uness.fr${formAction}`

    // Step 2: Email
    const emailResp = await fetch(emailUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': UA,
        'Cookie': cookieStr(),
        'Origin': 'https://cockpit.uness.fr',
      },
      body: emailData.toString(),
      redirect: 'follow',
    })
    extractCookies(emailResp)
    const emailHtml = await emailResp.text()

    // Step 3: Password
    const $2 = cheerio.load(emailHtml)
    const form2 = $2('form').first()
    const pwdData = new URLSearchParams()
    pwdData.append('password', password)
    pwdData.append('username', username)
    form2.find('input[type="hidden"]').each((_, el) => {
      const n = $2(el).attr('name'), v = $2(el).attr('value')
      if (n && v) pwdData.append(n, v)
    })

    const pwdAction = form2.attr('action') || '/cas/login'
    const pwdUrl = pwdAction.startsWith('http') ? pwdAction : `https://cockpit.uness.fr${pwdAction}`

    const pwdResp = await fetch(pwdUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': UA,
        'Cookie': cookieStr(),
        'Origin': 'https://cockpit.uness.fr',
      },
      body: pwdData.toString(),
      redirect: 'follow',
    })
    extractCookies(pwdResp)
    const pwdHtml = await pwdResp.text()

    if (pwdHtml.includes('Identifiants incorrects') || pwdHtml.includes('Authentication failed')) {
      return { success: false, cookies: '', error: 'Identifiants incorrects' }
    }

    // Step 4: Verify LiSA access
    const lisaResp = await fetch('https://livret.uness.fr/lisa/2025/Accueil', {
      headers: { 'User-Agent': UA, 'Cookie': cookieStr() },
    })
    extractCookies(lisaResp)
    const lisaHtml = await lisaResp.text()

    if (lisaHtml.includes('Veuillez saisir votre adresse')) {
      return { success: false, cookies: '', error: 'Accès LiSA refusé après auth cockpit' }
    }

    console.log('✅ Auth cockpit.uness.fr réussie')
    return { success: true, cookies: cookieStr() }
  } catch (error: unknown) {
    return { success: false, cookies: '', error: getErrorMessage(error) }
  }
}

// Les 11 items sans OIC Rang B dans backup_oic_competences
const MISSING_ITEMS = [
  { numero: 1, titre: 'La relation médecin-malade' },
  { numero: 29, titre: 'Risques professionnels pour la maternité' },
  { numero: 48, titre: 'Alimentation et besoins nutritionnels du nourrisson' },
  { numero: 59, titre: 'Sujets en situation de précarité' },
  { numero: 137, titre: 'Douleur chez l\'enfant' },
  { numero: 140, titre: 'Soins palliatifs (2) - Accompagnement' },
  { numero: 164, titre: 'Exanthèmes fébriles de l\'enfant' },
  { numero: 180, titre: 'Risques sanitaires liés aux irradiations' },
  { numero: 212, titre: 'Hémogramme chez l\'adulte et l\'enfant' },
  { numero: 269, titre: 'Douleurs abdominales aiguës' },
  { numero: 330, titre: 'Prescription et surveillance des médicaments' },
]

const BASE_URL = 'https://livret.uness.fr'
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'

interface ExtractedObjectif {
  objectif_id: string
  intitule: string
  description: string
  rubrique: string
  item_parent: string
  rang: string
}

/**
 * Parse les sections Rang B d'une page LiSA
 * Reproduit le pattern de unes_scraper.py
 */
function parseRangBSections(html: string, itemNumero: number): ExtractedObjectif[] {
  const $ = cheerio.load(html)
  const objectifs: ExtractedObjectif[] = []
  const paddedNum = String(itemNumero).padStart(3, '0')

  // Trouver tous les headings
  const headings = $('h1, h2, h3, h4, h5')
  let rangBIndex = 0

  headings.each((_, heading) => {
    const text = $(heading).text().toLowerCase()
    if (!text.includes('rang b')) return

    // Extraire le contenu suivant jusqu'au prochain heading
    const contents: string[] = []
    let sibling = $(heading).next()

    while (sibling.length > 0) {
      const tagName = sibling.prop('tagName')?.toLowerCase()
      if (tagName && ['h1', 'h2', 'h3', 'h4', 'h5'].includes(tagName)) break

      if (tagName === 'ul' || tagName === 'ol') {
        sibling.find('li').each((_, li) => {
          const liText = $(li).text().trim()
          if (liText) contents.push(liText)
        })
      } else if (tagName === 'p' || tagName === 'li') {
        const pText = sibling.text().trim()
        if (pText) contents.push(pText)
      } else if (tagName === 'div') {
        // Certaines pages LiSA encapsulent dans des divs
        sibling.find('li, p').each((_, el) => {
          const elText = $(el).text().trim()
          if (elText) contents.push(elText)
        })
      }

      sibling = sibling.next()
    }

    // Déterminer la rubrique depuis le heading parent
    const headingText = $(heading).text().trim()
    const rubriqueMatch = headingText.match(/(\d+)\.\d*/)
    const rubriqueCode = rubriqueMatch ? rubriqueMatch[1].padStart(2, '0') : '01'

    // Créer un objectif par élément de contenu
    for (const content of contents) {
      rangBIndex++
      const idx = String(rangBIndex).padStart(2, '0')
      objectifs.push({
        objectif_id: `OIC-${paddedNum}-${rubriqueCode}-B-${idx}`,
        intitule: content.length > 200 ? content.substring(0, 200) + '...' : content,
        description: content,
        rubrique: headingText.replace(/rang b/i, '').trim() || 'Compétences Rang B',
        item_parent: paddedNum,
        rang: 'B',
      })
    }
  })

  return objectifs
}

/**
 * Scrape une page LiSA avec authentification CAS
 */
async function scrapeLisaPage(itemNumero: number, cookies: string): Promise<string | null> {
  const url = `${BASE_URL}/lisa/2025/Item_de_connaissance_${itemNumero}`
  console.log(`📄 Scraping: ${url}`)

  try {
    // D'abord essayer la version imprimable (plus propre pour le parsing)
    const response = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
        'Cookie': cookies,
        'Accept': 'text/html',
      },
    })

    if (!response.ok) {
      console.warn(`⚠️ Item ${itemNumero}: HTTP ${response.status}`)
      return null
    }

    const html = await response.text()

    // Vérifier qu'on n'est pas redirigé vers la page de login
    if (html.includes('Veuillez saisir votre adresse') || html.includes('readapidenied')) {
      console.warn(`⚠️ Item ${itemNumero}: accès refusé (session expirée?)`)
      return null
    }

    // Chercher le lien vers la version imprimable
    const $ = cheerio.load(html)
    const printableLink = $('a').filter((_, el) => {
      return /version imprimable/i.test($(el).text())
    }).attr('href')

    if (printableLink) {
      const printableUrl = printableLink.startsWith('http') ? printableLink : BASE_URL + printableLink
      console.log(`🖨️ Version imprimable trouvée: ${printableUrl}`)

      const printResponse = await fetch(printableUrl, {
        headers: {
          'User-Agent': USER_AGENT,
          'Cookie': cookies,
          'Accept': 'text/html',
        },
      })

      if (printResponse.ok) {
        return await printResponse.text()
      }
    }

    return html
  } catch (error: unknown) {
    console.error(`❌ Erreur scraping item ${itemNumero}:`, getErrorMessage(error))
    return null
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('🚀 extract-rangb-missing démarré')

    // Récupérer les credentials CAS
    const username = Deno.env.get('CAS_USERNAME')
    const password = Deno.env.get('CAS_PASSWORD')

    if (!username || !password) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Secrets CAS_USERNAME/CAS_PASSWORD manquants',
        hint: 'Configurer les secrets dans Supabase Dashboard > Settings > Edge Functions',
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Phase 1: Authentification — CAS d'abord, cockpit en fallback
    console.log('🔐 Phase 1: Authentification CAS UNESS...')
    let authCookies = ''

    const casResult = await casLogin(username, password)
    if (casResult.success) {
      console.log('✅ Auth CAS réussie')
      authCookies = casResult.cookies
    } else {
      console.log(`⚠️ CAS échoué (${casResult.error}), fallback cockpit.uness.fr...`)
      const cockpitResult = await cockpitLogin(username, password)
      if (cockpitResult.success) {
        console.log('✅ Auth cockpit réussie')
        authCookies = cockpitResult.cookies
      } else {
        return new Response(JSON.stringify({
          success: false,
          error: `Auth échouée — CAS: ${casResult.error}, Cockpit: ${cockpitResult.error}`,
          hint: 'Vérifier les secrets CAS_USERNAME/CAS_PASSWORD',
        }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
    }

    // Phase 2: Scraper les 11 pages LiSA
    console.log('📥 Phase 2: Scraping des 11 items manquants...')
    const allObjectifs: ExtractedObjectif[] = []
    const report: { item: number; status: string; count: number }[] = []

    for (const item of MISSING_ITEMS) {
      await new Promise(r => setTimeout(r, 1500)) // Throttling anti-ban

      const html = await scrapeLisaPage(item.numero, authCookies)

      if (!html) {
        report.push({ item: item.numero, status: 'scrape_failed', count: 0 })
        continue
      }

      const objectifs = parseRangBSections(html, item.numero)
      console.log(`📊 IC-${item.numero}: ${objectifs.length} objectifs Rang B extraits`)

      if (objectifs.length === 0) {
        // Certains items n'ont peut-être pas de section Rang B distincte
        report.push({ item: item.numero, status: 'no_rang_b_found', count: 0 })
      } else {
        allObjectifs.push(...objectifs)
        report.push({ item: item.numero, status: 'ok', count: objectifs.length })
      }
    }

    console.log(`📊 Total: ${allObjectifs.length} objectifs Rang B extraits`)

    if (allObjectifs.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: 'Aucun objectif Rang B trouvé sur les 11 pages',
        report,
        hint: 'Les pages LiSA peuvent ne pas avoir de sections Rang B distinctes pour ces items',
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Phase 3: Insertion dans backup_oic_competences
    console.log('💾 Phase 3: Insertion dans backup_oic_competences...')
    let insertedCount = 0
    let insertErrors = 0

    for (const obj of allObjectifs) {
      const { error } = await supabase
        .from('backup_oic_competences')
        .upsert({
          objectif_id: obj.objectif_id,
          intitule: obj.intitule,
          description: obj.description,
          rubrique: obj.rubrique,
          item_parent: obj.item_parent,
          rang: 'B',
          url_source: `${BASE_URL}/lisa/2025/Item_de_connaissance_${parseInt(obj.item_parent)}`,
        }, {
          onConflict: 'objectif_id',
          ignoreDuplicates: false,
        })

      if (error) {
        console.error(`❌ Insert ${obj.objectif_id}:`, error.message)
        insertErrors++
      } else {
        insertedCount++
      }
    }

    console.log(`✅ Insérés: ${insertedCount}, Erreurs: ${insertErrors}`)

    // Phase 4: Propagation JSONB vers edn_items_immersive et edn_items_complete
    console.log('🔄 Phase 4: Propagation JSONB...')
    const itemParents = [...new Set(allObjectifs.map(o => o.item_parent))]

    for (const parent of itemParents) {
      const itemObjectifs = allObjectifs
        .filter(o => o.item_parent === parent)
        .map((o, idx) => ({
          objectif_id: o.objectif_id,
          intitule: o.intitule,
          description: o.description,
          rubrique: o.rubrique,
          ordre: idx + 1,
        }))

      const itemCode = `IC-${parseInt(parent)}`
      const jsonbArray = JSON.stringify(itemObjectifs)

      // Update edn_items_immersive
      const { error: errImm } = await supabase
        .from('edn_items_immersive')
        .update({
          competences_oic_rang_b: itemObjectifs,
          competences_count_rang_b: itemObjectifs.length,
        })
        .eq('item_code', itemCode)

      if (errImm) {
        console.error(`❌ Propagation immersive ${itemCode}:`, errImm.message)
      }

      // Update edn_items_complete
      const { error: errComp } = await supabase
        .from('edn_items_complete')
        .update({
          competences_oic_rang_b: itemObjectifs,
          competences_count_rang_b: itemObjectifs.length,
        })
        .eq('item_code', itemCode)

      if (errComp) {
        console.error(`❌ Propagation complete ${itemCode}:`, errComp.message)
      }
    }

    // Recalculer competences_count_total pour les items touchés
    for (const parent of itemParents) {
      const itemCode = `IC-${parseInt(parent)}`

      const { data: immData } = await supabase
        .from('edn_items_immersive')
        .select('competences_count_rang_a, competences_count_rang_b')
        .eq('item_code', itemCode)
        .single()

      if (immData) {
        const total = (immData.competences_count_rang_a || 0) + (immData.competences_count_rang_b || 0)
        await supabase
          .from('edn_items_immersive')
          .update({ competences_count_total: total })
          .eq('item_code', itemCode)

        await supabase
          .from('edn_items_complete')
          .update({ competences_count_total: total })
          .eq('item_code', itemCode)
      }
    }

    console.log('✅ Propagation terminée')

    return new Response(JSON.stringify({
      success: true,
      message: `${insertedCount} objectifs Rang B extraits et propagés`,
      stats: {
        totalExtracted: allObjectifs.length,
        totalInserted: insertedCount,
        insertErrors,
        itemsProcessed: MISSING_ITEMS.length,
      },
      report,
      sample: allObjectifs.slice(0, 5),
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error: unknown) {
    console.error('❌ Erreur critique:', getErrorMessage(error))
    return new Response(JSON.stringify({
      success: false,
      error: getErrorMessage(error),
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
