import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
    console.log('🤖 PUPPETEER OIC EXTRACTION: Démarrage avec authentification CAS')
    
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
    
    console.log('🔐 Credentials CAS trouvés, démarrage Puppeteer...')
    
    // Import Puppeteer depuis un CDN
    const puppeteer = await import('https://deno.land/x/puppeteer@16.2.0/mod.ts')
    
    console.log('🚀 Lancement du navigateur...')
    const browser = await puppeteer.default.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920x1080'
      ]
    })
    
    const page = await browser.newPage()
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')
    
    try {
      console.log('🔗 Navigation vers LiSA UNESS...')
      
      // Aller à la page de connexion CAS
      await page.goto('https://livret.uness.fr/lisa/2025/', { 
        waitUntil: 'networkidle0',
        timeout: 30000 
      })
      
      // Détecter et gérer la redirection CAS
      const currentUrl = page.url()
      console.log('📍 URL actuelle:', currentUrl)
      
      if (currentUrl.includes('cas') || currentUrl.includes('login')) {
        console.log('🔐 Page CAS détectée, authentification...')
        
        // Attendre et remplir les champs de connexion
        await page.waitForSelector('input[name="username"], input[id="username"]', { timeout: 10000 })
        await page.type('input[name="username"], input[id="username"]', casUsername)
        await page.type('input[name="password"], input[id="password"]', casPassword)
        
        // Soumettre le formulaire
        await Promise.all([
          page.click('input[type="submit"], button[type="submit"]'),
          page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 30000 })
        ])
        
        console.log('✅ Authentification CAS réussie')
      }
      
      // Aller à l'API MediaWiki pour récupérer la liste des OIC
      console.log('📋 Récupération de la liste des objectifs OIC...')
      
      const apiUrl = 'https://livret.uness.fr/lisa/2025/api.php?action=query&list=categorymembers&cmtitle=Cat%C3%A9gorie:Objectif_de_connaissance&cmlimit=500&format=json'
      await page.goto(apiUrl, { waitUntil: 'networkidle0' })
      
      const pageContent = await page.content()
      const jsonMatch = pageContent.match(/<pre[^>]*>(.*?)<\/pre>/s)
      
      if (!jsonMatch) {
        throw new Error('Impossible de récupérer les données JSON de l\'API')
      }
      
      const apiData = JSON.parse(jsonMatch[1])
      const oicPages = apiData.query?.categorymembers || []
      
      console.log(`📊 ${oicPages.length} objectifs OIC trouvés`)
      
      if (oicPages.length === 0) {
        throw new Error('Aucun objectif OIC trouvé dans la catégorie')
      }
      
      // Traitement par lots
      const batchSize = 50
      const competences: OICCompetence[] = []
      
      for (let i = 0; i < oicPages.length; i += batchSize) {
        const batch = oicPages.slice(i, i + batchSize)
        console.log(`🔄 Traitement du lot ${Math.floor(i/batchSize) + 1}/${Math.ceil(oicPages.length/batchSize)}`)
        
        for (const oicPage of batch) {
          try {
            const pageTitle = oicPage.title
            const pageApiUrl = `https://livret.uness.fr/lisa/2025/api.php?action=query&titles=${encodeURIComponent(pageTitle)}&prop=revisions&rvprop=content&format=json`
            
            await page.goto(pageApiUrl, { waitUntil: 'networkidle0' })
            const pageContentRaw = await page.content()
            const pageJsonMatch = pageContentRaw.match(/<pre[^>]*>(.*?)<\/pre>/s)
            
            if (pageJsonMatch) {
              const pageData = JSON.parse(pageJsonMatch[1])
              const pages = pageData.query?.pages || {}
              const pageContent = Object.values(pages)[0] as any
              
              if (pageContent?.revisions?.[0]?.['*']) {
                const wikiContent = pageContent.revisions[0]['*']
                const parsedCompetence = parseOICContent(pageTitle, wikiContent, pageApiUrl)
                
                if (parsedCompetence) {
                  competences.push(parsedCompetence)
                }
              }
            }
          } catch (error) {
            console.error(`❌ Erreur lors du traitement de ${oicPage.title}:`, error)
          }
        }
        
        // Pause entre les lots
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
      
      await browser.close()
      
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
        message: 'Extraction Puppeteer OIC terminée avec succès',
        competences_extraites: competences.length,
        timestamp: new Date().toISOString(),
        method: 'puppeteer_cas',
        session_id: crypto.randomUUID()
      }
      
      console.log('🎉 EXTRACTION PUPPETEER TERMINÉE:', rapport)
      
      return new Response(
        JSON.stringify(rapport),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
      
    } finally {
      if (browser) {
        await browser.close()
      }
    }
    
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