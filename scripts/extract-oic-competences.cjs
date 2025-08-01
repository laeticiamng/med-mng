#!/usr/bin/env node

/**
 * 🤖 EXTRACTION OIC AUTONOME
 * Script Node.js + Puppeteer pour extraction complète des 4,872 compétences OIC
 * Target: table backup_oic_competences dans Supabase
 */

const puppeteer = require('puppeteer');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

// Configuration
const CONFIG = {
  CAS_USERNAME: process.env.CAS_USERNAME || 'laeticia.moto-ngane@etud.u-picardie.fr',
  CAS_PASSWORD: process.env.CAS_PASSWORD || 'Aiciteal1!',
  SUPABASE_URL: process.env.SUPABASE_URL || 'https://yaincoxihiqdksxgrsrk.supabase.co',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  BASE_URL: 'https://livret.uness.fr/lisa/2025',
  BATCH_SIZE: 50,
  DELAY_BETWEEN_BATCHES: 2000,
  MAX_RETRIES: 3
};

// Variables globales
let supabase;
let browser;
let page;
let extractionStats = {
  total_expected: 4872,
  total_found: 0,
  updated: 0,
  inserted: 0,
  unchanged: 0,
  errors: 0,
  missing: [],
  start_time: new Date().toISOString(),
  end_time: null
};

/**
 * 🏁 Point d'entrée principal
 */
async function main() {
  try {
    console.log('🤖 EXTRACTION OIC AUTONOME - Démarrage');
    console.log('📊 Target: 4,872 compétences OIC');
    console.log('🎯 Table: backup_oic_competences');
    
    await initializeServices();
    await launchBrowser();
    await authenticateWithCAS();
    
    const oicPages = await fetchOICPagesList();
    console.log(`📋 ${oicPages.length} pages OIC trouvées`);
    
    await processOICPages(oicPages);
    await generateReport();
    
    console.log('✅ Extraction OIC terminée avec succès');
    
  } catch (error) {
    console.error('💥 Erreur fatale extraction OIC:', error);
    extractionStats.errors++;
    await generateReport();
    process.exit(1);
    
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * 🔧 Initialisation des services
 */
async function initializeServices() {
  console.log('🔧 Initialisation Supabase...');
  
  if (!CONFIG.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY manquant');
  }
  
  supabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_SERVICE_ROLE_KEY);
  
  // Créer les dossiers nécessaires
  await fs.mkdir('logs', { recursive: true });
  await fs.mkdir('reports', { recursive: true });
  
  console.log('✅ Services initialisés');
}

/**
 * 🌐 Lancement du navigateur Puppeteer
 */
async function launchBrowser() {
  console.log('🚀 Lancement du navigateur...');
  
  browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
      '--window-size=1920x1080',
      '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    ]
  });
  
  page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  
  console.log('✅ Navigateur lancé');
}

/**
 * 🔐 Authentification CAS UNESS
 */
async function authenticateWithCAS() {
  console.log('🔐 Authentification CAS...');
  
  try {
    // Navigation vers LiSA
    await page.goto(`${CONFIG.BASE_URL}/`, {
      waitUntil: 'networkidle0',
      timeout: 30000
    });
    
    console.log('📍 URL actuelle:', page.url());
    
    // Si redirection CAS détectée
    if (page.url().includes('cas') || page.url().includes('login')) {
      console.log('🔑 Page CAS détectée, saisie des credentials...');
      
      // Attendre les champs de connexion
      await page.waitForSelector('input[name="username"], input[id="username"]', { timeout: 10000 });
      
      // Remplir les champs
      await page.type('input[name="username"], input[id="username"]', CONFIG.CAS_USERNAME);
      await page.type('input[name="password"], input[id="password"]', CONFIG.CAS_PASSWORD);
      
      // Soumettre le formulaire
      await Promise.all([
        page.click('input[type="submit"], button[type="submit"]'),
        page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 30000 })
      ]);
      
      console.log('✅ Authentification CAS réussie');
      console.log('📍 URL post-auth:', page.url());
      
    } else {
      console.log('ℹ️ Pas de redirection CAS nécessaire');
    }
    
  } catch (error) {
    throw new Error(`Échec authentification CAS: ${error.message}`);
  }
}

/**
 * 📋 Récupération de la liste des pages OIC
 */
async function fetchOICPagesList() {
  console.log('📋 Récupération liste des objectifs OIC...');
  
  const apiUrl = `${CONFIG.BASE_URL}/api.php?action=query&list=categorymembers&cmtitle=Catégorie:Objectif_de_connaissance&cmlimit=max&format=json`;
  
  try {
    await page.goto(apiUrl, { waitUntil: 'networkidle0' });
    const content = await page.content();
    
    // Extraire le JSON depuis la page
    const jsonMatch = content.match(/<pre[^>]*>(.*?)<\/pre>/s);
    if (!jsonMatch) {
      throw new Error('Impossible d\'extraire les données JSON');
    }
    
    const apiData = JSON.parse(jsonMatch[1]);
    const oicPages = apiData.query?.categorymembers || [];
    
    extractionStats.total_found = oicPages.length;
    
    return oicPages;
    
  } catch (error) {
    throw new Error(`Erreur récupération liste OIC: ${error.message}`);
  }
}

/**
 * 🔄 Traitement des pages OIC par lots
 */
async function processOICPages(oicPages) {
  console.log(`🔄 Traitement de ${oicPages.length} pages par lots de ${CONFIG.BATCH_SIZE}...`);
  
  for (let i = 0; i < oicPages.length; i += CONFIG.BATCH_SIZE) {
    const batch = oicPages.slice(i, i + CONFIG.BATCH_SIZE);
    const batchNumber = Math.floor(i / CONFIG.BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(oicPages.length / CONFIG.BATCH_SIZE);
    
    console.log(`📦 Lot ${batchNumber}/${totalBatches} (${batch.length} pages)`);
    
    const competences = [];
    
    for (const oicPage of batch) {
      try {
        const competence = await extractOICCompetence(oicPage);
        if (competence) {
          competences.push(competence);
        }
      } catch (error) {
        console.error(`❌ Erreur page ${oicPage.title}:`, error.message);
        extractionStats.errors++;
      }
    }
    
    // Sauvegarde du lot
    if (competences.length > 0) {
      await saveCompetencesToSupabase(competences);
    }
    
    // Pause entre les lots
    if (i + CONFIG.BATCH_SIZE < oicPages.length) {
      console.log(`⏳ Pause ${CONFIG.DELAY_BETWEEN_BATCHES}ms...`);
      await new Promise(resolve => setTimeout(resolve, CONFIG.DELAY_BETWEEN_BATCHES));
    }
  }
}

/**
 * 🧬 Extraction d'une compétence OIC individuelle
 */
async function extractOICCompetence(oicPage) {
  const pageTitle = oicPage.title;
  
  try {
    // URL de l'API pour récupérer le contenu de la page
    const pageApiUrl = `${CONFIG.BASE_URL}/api.php?action=query&titles=${encodeURIComponent(pageTitle)}&prop=revisions&rvprop=content&format=json`;
    
    await page.goto(pageApiUrl, { waitUntil: 'networkidle0' });
    const content = await page.content();
    
    const jsonMatch = content.match(/<pre[^>]*>(.*?)<\/pre>/s);
    if (!jsonMatch) {
      throw new Error('Contenu JSON non trouvé');
    }
    
    const pageData = JSON.parse(jsonMatch[1]);
    const pages = pageData.query?.pages || {};
    const pageContent = Object.values(pages)[0];
    
    if (!pageContent?.revisions?.[0]?.['*']) {
      throw new Error('Contenu de révision non trouvé');
    }
    
    const wikiContent = pageContent.revisions[0]['*'];
    return parseOICContent(pageTitle, wikiContent, pageApiUrl);
    
  } catch (error) {
    throw new Error(`Extraction ${pageTitle}: ${error.message}`);
  }
}

/**
 * 🧩 Parsing du contenu MediaWiki
 */
function parseOICContent(title, wikiContent, sourceUrl) {
  try {
    // Extraire l'ID de l'objectif
    const objectifIdMatch = title.match(/Objectif_de_connaissance_(\d+_\d+_[A-Z]_\d+)/);
    if (!objectifIdMatch) {
      return null;
    }
    
    const objectifId = objectifIdMatch[1];
    const rang = objectifId.includes('_A_') ? 'A' : 'B';
    
    // Item parent (IC-XX)
    const itemMatch = objectifId.match(/^(\d+)_/);
    const itemParent = itemMatch ? `IC-${itemMatch[1]}` : '';
    
    // Titre/intitulé
    const intituleMatch = wikiContent.match(/=\s*(.+?)\s*=/) || 
                         wikiContent.match(/'''\s*(.+?)\s*'''/) ||
                         wikiContent.match(/\*\s*(.+?)(?:\n|$)/);
    const intitule = intituleMatch ? intituleMatch[1].trim() : title.replace(/Objectif_de_connaissance_/, '');
    
    // Rubrique
    const rubriqueMatch = wikiContent.match(/\[\[Catégorie:([^\]]+)\]\]/);
    const rubrique = rubriqueMatch ? rubriqueMatch[1] : 'Objectif_de_connaissance';
    
    // Description (premiers paragraphes significatifs)
    const lines = wikiContent.split('\n').filter(line => line.trim());
    const descriptionLines = lines.filter(line => 
      !line.startsWith('=') && 
      !line.startsWith('[[') && 
      !line.startsWith('{') &&
      line.trim().length > 10
    );
    const description = descriptionLines.slice(0, 3).join(' ').substring(0, 500);
    
    // Hash du contenu
    const hashContent = crypto.createHash('md5').update(wikiContent).digest('hex').substring(0, 32);
    
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
        extraction_method: 'puppeteer_autonomous'
      },
      hash_content: hashContent,
      extraction_status: 'completed',
      date_import: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('Erreur parsing:', error);
    return null;
  }
}

/**
 * 💾 Sauvegarde des compétences dans Supabase
 */
async function saveCompetencesToSupabase(competences) {
  console.log(`💾 Sauvegarde de ${competences.length} compétences...`);
  
  try {
    const { data, error } = await supabase
      .from('backup_oic_competences')
      .upsert(competences, {
        onConflict: 'objectif_id',
        ignoreDuplicates: false
      });
    
    if (error) {
      throw new Error(`Erreur Supabase: ${error.message}`);
    }
    
    extractionStats.updated += competences.length;
    console.log(`✅ ${competences.length} compétences sauvegardées`);
    
  } catch (error) {
    throw new Error(`Sauvegarde échouée: ${error.message}`);
  }
}

/**
 * 📊 Génération du rapport final
 */
async function generateReport() {
  extractionStats.end_time = new Date().toISOString();
  
  const reportPath = path.join('reports', 'oic_extraction_report.json');
  const logPath = path.join('logs', `extraction-${new Date().toISOString().split('T')[0]}.log`);
  
  try {
    // Rapport JSON
    await fs.writeFile(reportPath, JSON.stringify(extractionStats, null, 2));
    
    // Log détaillé
    const logContent = [
      `🤖 EXTRACTION OIC AUTONOME - ${extractionStats.start_time}`,
      `📊 Compétences attendues: ${extractionStats.total_expected}`,
      `📋 Compétences trouvées: ${extractionStats.total_found}`,
      `✅ Mises à jour: ${extractionStats.updated}`,
      `❌ Erreurs: ${extractionStats.errors}`,
      `⏱️ Durée: ${new Date(extractionStats.end_time) - new Date(extractionStats.start_time)}ms`,
      ''
    ].join('\n');
    
    await fs.writeFile(logPath, logContent);
    
    console.log('📋 Rapport généré:', reportPath);
    console.log('📋 Log généré:', logPath);
    
  } catch (error) {
    console.error('Erreur génération rapport:', error);
  }
}

// Lancement du script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };