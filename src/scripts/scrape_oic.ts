#!/usr/bin/env node
/**
 * 🎫 TICKET 4-bis — Extraction API-first des 4,872 objectifs EDN via MediaWiki
 * 
 * Script autonome d'extraction des compétences OIC depuis l'API MediaWiki de LiSA UNESS
 * Remplace l'approche Puppeteer par des requêtes HTTP optimisées
 */

import { createClient } from '@supabase/supabase-js';
import puppeteer from 'puppeteer';
import * as fs from 'fs';

// Configuration
const API_BASE = 'https://livret.uness.fr/lisa/2025/api.php';
const CATEGORY_TITLE = 'Catégorie:Objectif_de_connaissance';
const BATCH_SIZE = 50; // Pages par batch (limite MediaWiki)
const LIST_LIMIT = 500; // Pages par requête de listing

// Credentials CAS
const CAS_USERNAME = process.env.CAS_USER || 'laeticia.moto-ngane@etud.u-picardie.fr';
const CAS_PASSWORD = process.env.CAS_PASS || 'Aiciteal1!';

// Supabase
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://yaincoxihiqdksxgrsrk.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY manquant dans l\'environnement');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Types
interface OICCompetence {
  objectif_id: string;
  intitule: string;
  item_parent: string;
  rang: 'A' | 'B';
  rubrique: string;
  description?: string;
  ordre: number;
  url_source: string;
  raw_json?: any;
  date_import?: string;
}

interface ExtractionStats {
  total_pages_found: number;
  total_processed: number;
  total_inserted: number;
  total_errors: number;
  start_time: Date;
  end_time?: Date;
  duration_seconds?: number;
}

// Mapping des rubriques
const RUBRIQUES_MAP: Record<string, string> = {
  '01': 'Génétique',
  '02': 'Immunopathologie',
  '03': 'Inflammation', 
  '04': 'Cancérologie',
  '05': 'Pharmacologie',
  '06': 'Douleur',
  '07': 'Santé publique',
  '08': 'Thérapeutique',
  '09': 'Urgences',
  '10': 'Vieillissement',
  '11': 'Interprétation'
};

/**
 * Teste si l'API MediaWiki est accessible publiquement
 */
async function testPublicAPI(): Promise<boolean> {
  try {
    const response = await fetch(
      `${API_BASE}?action=query&meta=siteinfo&format=json&origin=*`
    );
    console.log('🔍 Test d\'accès public à l\'API MediaWiki...');
    
    if (response.ok) {
      const data = await response.json();
      if (data.query?.general) {
        console.log('✅ API MediaWiki publique accessible!');
        console.log(`   Site: ${data.query.general.sitename}`);
        console.log(`   Version: ${data.query.general.generator}`);
        return true;
      }
    }
    
    console.log('🔐 API MediaWiki protégée - authentification CAS requise');
    return false;
    
  } catch (error) {
    console.error('❌ Erreur test API:', error);
    return false;
  }
}

/**
 * Authentification CAS via Puppeteer minimal
 */
async function authenticateWithCAS(): Promise<string> {
  console.log('🔐 Authentification CAS via Puppeteer...');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
  
  try {
    const page = await browser.newPage();
    
    // Aller sur une page protégée qui redirige vers CAS
    await page.goto(`https://livret.uness.fr/lisa/2025/${encodeURIComponent(CATEGORY_TITLE)}`, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    // Vérifier redirection CAS
    if (page.url().includes('auth.uness.fr/cas/login')) {
      console.log('🔑 Formulaire CAS détecté, saisie des identifiants...');
      
      await page.waitForSelector('#username', { visible: true });
      await page.waitForSelector('#password', { visible: true });
      
      await page.type('#username', CAS_USERNAME);
      await page.type('#password', CAS_PASSWORD);
      await page.click('input[name="submit"]');
      
      // Attendre redirection vers livret.uness.fr
      await page.waitForFunction(
        () => window.location.href.includes('livret.uness.fr'),
        { timeout: 30000 }
      );
      
      console.log('✅ Authentification CAS réussie');
    }
    
    // Récupérer les cookies de session
    const cookies = await page.cookies();
    const cookieString = cookies
      .filter(c => c.domain.includes('uness.fr'))
      .map(c => `${c.name}=${c.value}`)
      .join('; ');
    
    console.log(`🍪 ${cookies.length} cookies récupérés`);
    return cookieString;
    
  } finally {
    await browser.close();
  }
}

/**
 * Récupère tous les IDs des pages de la catégorie
 */
async function getAllPageIds(authCookies: string = ''): Promise<number[]> {
  console.log('📋 Récupération des IDs de pages de la catégorie...');
  
  const pageIds: number[] = [];
  let cmcontinue = '';
  
  do {
    const url = new URL(API_BASE);
    url.searchParams.set('action', 'query');
    url.searchParams.set('list', 'categorymembers');
    url.searchParams.set('cmtitle', CATEGORY_TITLE);
    url.searchParams.set('cmlimit', LIST_LIMIT.toString());
    url.searchParams.set('format', 'json');
    url.searchParams.set('origin', '*');
    
    if (cmcontinue) {
      url.searchParams.set('cmcontinue', cmcontinue);
    }
    
    const headers: Record<string, string> = {
      'User-Agent': 'OIC-Extractor/1.0 (Educational Use)'
    };
    
    if (authCookies) {
      headers['Cookie'] = authCookies;
    }
    
    const response = await fetch(url.toString(), { headers });
    
    if (!response.ok) {
      throw new Error(`Erreur API listing: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.error) {
      throw new Error(`Erreur API: ${data.error.code} - ${data.error.info}`);
    }
    
    // Filtrer uniquement les pages OIC
    if (data.query?.categorymembers) {
      data.query.categorymembers.forEach((page: any) => {
        if (page.title?.match(/OIC-\d{3}-\d{2}-[AB]-\d{2}/)) {
          pageIds.push(page.pageid);
        }
      });
    }
    
    cmcontinue = data.continue?.cmcontinue || '';
    console.log(`   → ${pageIds.length} pages OIC trouvées...`);
    
  } while (cmcontinue);
  
  console.log(`✅ ${pageIds.length} pages OIC listées au total`);
  return pageIds;
}

/**
 * Récupère le contenu d'un batch de pages
 */
async function fetchPagesBatch(pageIds: number[], authCookies: string = ''): Promise<any[]> {
  const url = new URL(API_BASE);
  url.searchParams.set('action', 'query');
  url.searchParams.set('prop', 'revisions');
  url.searchParams.set('rvprop', 'content|timestamp');
  url.searchParams.set('pageids', pageIds.join('|'));
  url.searchParams.set('format', 'json');
  url.searchParams.set('formatversion', '2');
  url.searchParams.set('origin', '*');
  
  const headers: Record<string, string> = {
    'User-Agent': 'OIC-Extractor/1.0 (Educational Use)'
  };
  
  if (authCookies) {
    headers['Cookie'] = authCookies;
  }
  
  const response = await fetch(url.toString(), { headers });
  
  if (!response.ok) {
    throw new Error(`Erreur API batch: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  
  if (data.error) {
    throw new Error(`Erreur API: ${data.error.code} - ${data.error.info}`);
  }
  
  return data.query?.pages || [];
}

/**
 * Parse le contenu d'une page OIC pour extraire les métadonnées
 */
function parseOICPage(page: any): OICCompetence | null {
  try {
    const title = page.title;
    const content = page.revisions?.[0]?.content || '';
    const timestamp = page.revisions?.[0]?.timestamp;
    
    // Extraction de l'identifiant OIC depuis le titre
    const oicMatch = title.match(/OIC-(\d{3})-(\d{2})-([AB])-(\d{2})/);
    if (!oicMatch) {
      console.warn(`⚠️  Titre non conforme: ${title}`);
      return null;
    }
    
    const [objectif_id, item_parent, rubrique_code, rang, ordre_str] = oicMatch;
    
    // Extraction de l'intitulé
    let intitule = title;
    
    // Essayer différents patterns pour l'intitulé
    const intitulePatterns = [
      /\|\s*[Ii]ntitulé\s*=\s*([^\n\|]+)/,
      /\|\s*[Tt]itre\s*=\s*([^\n\|]+)/,
      /<th[^>]*>[Ii]ntitulé<\/th>\s*<td[^>]*>([^<]+)/,
      /^([^{]*?)(?:\s*\{\{|\s*$)/m // Premier texte avant template
    ];
    
    for (const pattern of intitulePatterns) {
      const match = content.match(pattern);
      if (match && match[1].trim()) {
        intitule = match[1].trim();
        break;
      }
    }
    
    // Extraction de la description
    let description = '';
    const descPatterns = [
      /\|\s*[Dd]escription\s*=\s*([^\n\|]+)/,
      /\|\s*[Dd]éfinition\s*=\s*([^\n\|]+)/,
      /<th[^>]*>[Dd]escription<\/th>\s*<td[^>]*>([^<]+)/
    ];
    
    for (const pattern of descPatterns) {
      const match = content.match(pattern);
      if (match && match[1].trim()) {
        description = match[1].trim();
        break;
      }
    }
    
    // Si pas de description explicite, prendre le premier paragraphe significatif
    if (!description) {
      const paragraphMatch = content.match(/\n\n([^{}\n]+)/);
      if (paragraphMatch) {
        description = paragraphMatch[1].trim().substring(0, 500);
      }
    }
    
    const competence: OICCompetence = {
      objectif_id,
      intitule: intitule || title,
      item_parent,
      rang: rang as 'A' | 'B',
      rubrique: RUBRIQUES_MAP[rubrique_code] || 'Autre',
      description: description || undefined,
      ordre: parseInt(ordre_str),
      url_source: `https://livret.uness.fr/lisa/2025/${encodeURIComponent(title)}`,
      raw_json: { content, timestamp },
      date_import: new Date().toISOString()
    };
    
    return competence;
    
  } catch (error) {
    console.error(`❌ Erreur parsing page ${page.title}:`, error);
    return null;
  }
}

/**
 * Insère un batch de compétences dans Supabase
 */
async function insertCompetencesBatch(competences: OICCompetence[]): Promise<number> {
  if (competences.length === 0) return 0;
  
  const { data, error } = await supabase
    .from('oic_competences')
    .upsert(competences, { 
      onConflict: 'objectif_id',
      ignoreDuplicates: false 
    })
    .select();
  
  if (error) {
    console.error('❌ Erreur insertion Supabase:', error);
    throw error;
  }
  
  return data?.length || 0;
}

/**
 * Génère le rapport de complétude
 */
async function generateCompletionReport(): Promise<void> {
  console.log('📊 Génération du rapport de complétude...');
  
  // Statistiques globales
  const { count: totalExtracted } = await supabase
    .from('oic_competences')
    .select('*', { count: 'exact', head: true });
  
  // Répartition par item parent
  const { data: itemStats } = await supabase
    .from('oic_competences')
    .select('item_parent, rang')
    .order('item_parent');
  
  // Grouper par item
  const itemGroups: Record<string, { rang_a: number; rang_b: number }> = {};
  
  itemStats?.forEach(stat => {
    if (!itemGroups[stat.item_parent]) {
      itemGroups[stat.item_parent] = { rang_a: 0, rang_b: 0 };
    }
    if (stat.rang === 'A') itemGroups[stat.item_parent].rang_a++;
    if (stat.rang === 'B') itemGroups[stat.item_parent].rang_b++;
  });
  
  // Générer la liste des items manquants (001-367)
  const allItems = Array.from({ length: 367 }, (_, i) => 
    (i + 1).toString().padStart(3, '0')
  );
  
  const extractedItems = Object.keys(itemGroups);
  const missingItems = allItems.filter(item => !extractedItems.includes(item));
  
  const report = {
    summary: {
      total_expected: 4872,
      total_extracted: totalExtracted || 0,
      completeness_pct: ((totalExtracted || 0) / 4872 * 100).toFixed(2),
      items_covered: extractedItems.length,
      items_missing: missingItems.length
    },
    by_item: Object.entries(itemGroups).map(([item, counts]) => ({
      item_parent: item,
      rang_a_count: counts.rang_a,
      rang_b_count: counts.rang_b,
      total_count: counts.rang_a + counts.rang_b
    })).sort((a, b) => a.item_parent.localeCompare(b.item_parent)),
    missing_items: missingItems,
    generated_at: new Date().toISOString()
  };
  
  // Sauvegarder le rapport
  const reportPath = `rapport-completude-${new Date().toISOString().slice(0, 10)}.json`;
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log('\n📈 RAPPORT DE COMPLÉTUDE:');
  console.log(`✅ Total extrait: ${report.summary.total_extracted} / ${report.summary.total_expected} (${report.summary.completeness_pct}%)`);
  console.log(`📚 Items couverts: ${report.summary.items_covered} / 367`);
  console.log(`❌ Items manquants: ${report.summary.items_missing}`);
  
  if (missingItems.length > 0) {
    console.log(`   → Items manquants: ${missingItems.slice(0, 10).join(', ')}${missingItems.length > 10 ? '...' : ''}`);
  }
  
  console.log(`💾 Rapport sauvegardé: ${reportPath}`);
}

/**
 * Fonction principale d'extraction
 */
async function main() {
  const stats: ExtractionStats = {
    total_pages_found: 0,
    total_processed: 0,
    total_inserted: 0,
    total_errors: 0,
    start_time: new Date()
  };
  
  try {
    console.log('🚀 EXTRACTION API-FIRST DES 4,872 OBJECTIFS EDN');
    console.log('===============================================');
    
    // Étape 1: Test d'accès public à l'API
    const isPublic = await testPublicAPI();
    let authCookies = '';
    
    // Étape 2: Authentification si nécessaire
    if (!isPublic) {
      authCookies = await authenticateWithCAS();
    }
    
    // Étape 3: Récupération des IDs de pages
    const pageIds = await getAllPageIds(authCookies);
    stats.total_pages_found = pageIds.length;
    
    if (pageIds.length === 0) {
      throw new Error('Aucune page OIC trouvée dans la catégorie');
    }
    
    // Étape 4: Traitement par batches
    console.log(`\n🔄 Traitement par batches de ${BATCH_SIZE} pages...`);
    
    const totalBatches = Math.ceil(pageIds.length / BATCH_SIZE);
    
    for (let i = 0; i < totalBatches; i++) {
      const batchStart = i * BATCH_SIZE;
      const batchEnd = Math.min(batchStart + BATCH_SIZE, pageIds.length);
      const batchIds = pageIds.slice(batchStart, batchEnd);
      
      console.log(`📦 Batch ${i + 1}/${totalBatches} - Pages ${batchStart + 1} à ${batchEnd}`);
      
      try {
        // Récupérer le contenu du batch
        const pages = await fetchPagesBatch(batchIds, authCookies);
        
        // Parser chaque page
        const competences: OICCompetence[] = [];
        let batchErrors = 0;
        
        for (const page of pages) {
          const competence = parseOICPage(page);
          if (competence) {
            competences.push(competence);
          } else {
            batchErrors++;
          }
        }
        
        // Insérer en base
        const inserted = await insertCompetencesBatch(competences);
        
        stats.total_processed += pages.length;
        stats.total_inserted += inserted;
        stats.total_errors += batchErrors;
        
        console.log(`   ✅ ${inserted}/${pages.length} compétences insérées (${batchErrors} erreurs)`);
        
        // Pause entre batches
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`❌ Erreur batch ${i + 1}:`, error);
        stats.total_errors += batchIds.length;
      }
    }
    
    // Étape 5: Rapport final
    stats.end_time = new Date();
    stats.duration_seconds = Math.round((stats.end_time.getTime() - stats.start_time.getTime()) / 1000);
    
    console.log('\n🎉 EXTRACTION TERMINÉE');
    console.log('=====================');
    console.log(`⏱️  Durée: ${stats.duration_seconds}s`);
    console.log(`📊 Pages trouvées: ${stats.total_pages_found}`);
    console.log(`✅ Pages traitées: ${stats.total_processed}`);
    console.log(`💾 Compétences insérées: ${stats.total_inserted}`);
    console.log(`❌ Erreurs: ${stats.total_errors}`);
    
    await generateCompletionReport();
    
  } catch (error) {
    console.error('💥 ERREUR CRITIQUE:', error);
    process.exit(1);
  }
}

// Lancement du script
if (require.main === module) {
  main();
}

export { main as extractOICCompetences };