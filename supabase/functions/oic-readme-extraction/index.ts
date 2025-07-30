// 🎫 TICKET 4-bis — Extraction API-first des 4,872 objectifs EDN
// Implementation suivant exactement le README-OIC-EXTRACTION.md

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Configuration selon le README
const BATCH_SIZE = 50;
const DELAY_BETWEEN_BATCHES = 1000; // 1s pause pour éviter rate limiting
const TOTAL_EXPECTED = 4872;

// Mapping des rubriques selon le README
const RUBRIQUES_MAP: Record<string, string> = {
  '01': 'Immunologie',
  '02': 'Inflammation - Immunopathologie',
  '03': 'Maturation - Vulnérabilité - Santé mentale - Conduites addictives',
  '04': 'Perception - Système nerveux - Revêtement cutané',
  '05': 'Pharmacologie',
  '06': 'Défaillances organiques et processus dégénératifs',
  '07': 'Santé et environnement - Maladies transmissibles',
  '08': 'Circulation - Métabolismes',
  '09': 'Cancérologie - Onco-hématologie',
  '10': 'Le bon usage du médicament et des thérapeutiques non médicamenteuses',
  '11': 'Urgences et défaillances viscérales aiguës'
};

const API_BASE_URL = 'https://uness.fr/lisa/2025/api.php';

interface OICCompetence {
  objectif_id: string;
  intitule: string;
  item_parent: string;
  rang: 'A' | 'B';
  rubrique: string | null;
  description: string | null;
  ordre: number;
  url_source: string;
  raw_json: any;
  hash_content: string;
}

function parseOICContent(pageData: any): OICCompetence | null {
  try {
    const title = pageData.title;
    console.log(`📄 Parsing page: ${title}`);
    
    // Vérifier le pattern OIC-XXX-YY-R-ZZ
    const oicPattern = /^OIC-(\d{3})-(\d{2})-([AB])-(\d{2})$/;
    const match = title.match(oicPattern);
    
    if (!match) {
      console.log(`⚠️ Titre ne correspond pas au pattern OIC: ${title}`);
      return null;
    }
    
    const [, itemParent, rubriqueCode, rang, ordreStr] = match;
    const ordre = parseInt(ordreStr, 10);
    
    // Extraire le contenu
    let content = '';
    if (pageData.revisions && pageData.revisions[0]) {
      const revision = pageData.revisions[0];
      if (revision.slots && revision.slots.main) {
        content = revision.slots.main.content;
      } else if (revision['*']) {
        content = revision['*'];
      }
    }
    
    if (!content) {
      console.log(`⚠️ Pas de contenu pour ${title}`);
      return null;
    }
    
    // Parsing selon les patterns du README
    const intitulePatterns = [
      /\|\s*[Ii]ntitulé\s*=\s*([^\n\|]+)/,
      /\|\s*[Tt]itre\s*=\s*([^\n\|]+)/,
    ];
    
    let intitule = title; // fallback
    for (const pattern of intitulePatterns) {
      const intituleMatch = content.match(pattern);
      if (intituleMatch) {
        intitule = intituleMatch[1].trim();
        break;
      }
    }
    
    // Description
    const descriptionPattern = /\|\s*[Dd]escription\s*=\s*([^\n\|]+)/;
    const descriptionMatch = content.match(descriptionPattern);
    const description = descriptionMatch 
      ? descriptionMatch[1].trim() 
      : `Description de l'objectif ${title}`;
    
    // Rubrique
    const rubrique = RUBRIQUES_MAP[rubriqueCode] || null;
    
    // URL source reconstituée
    const urlSource = `https://uness.fr/lisa/2025/index.php?title=${encodeURIComponent(title)}`;
    
    // Hash pour détecter les doublons
    const hashContent = btoa(content).slice(0, 32);
    
    return {
      objectif_id: title,
      intitule,
      item_parent: itemParent,
      rang: rang as 'A' | 'B',
      rubrique,
      description,
      ordre,
      url_source: urlSource,
      raw_json: { content, pageData },
      hash_content: hashContent
    };
    
  } catch (error) {
    console.error(`❌ Erreur parsing ${pageData?.title || 'unknown'}:`, error);
    return null;
  }
}

async function fetchWithRetry(url: string, options: any = {}, maxRetries = 3): Promise<Response> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response;
      
      if (attempt === maxRetries) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      
      console.log(`⚠️ Tentative ${attempt}/${maxRetries} échouée, retry in 2s...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      if (attempt === maxRetries) throw error;
      console.log(`⚠️ Erreur réseau tentative ${attempt}/${maxRetries}, retry...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  throw new Error('Max retries exceeded');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const startTime = Date.now();
    console.log('🚀 EXTRACTION API-FIRST DES 4,872 OBJECTIFS EDN');
    console.log('===============================================');
    
    // Initialiser Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // 1. Test d'accès public à l'API MediaWiki
    console.log('🔍 Test d\'accès public à l\'API MediaWiki...');
    const testUrl = `${API_BASE_URL}?action=query&meta=siteinfo&format=json`;
    
    try {
      const testResponse = await fetchWithRetry(testUrl);
      const testData = await testResponse.json();
      console.log('✅ API MediaWiki publique accessible!', testData?.query?.general?.sitename || 'OK');
    } catch (error) {
      console.log('❌ API MediaWiki inaccessible:', error.message);
      throw new Error('API MediaWiki non accessible - vérifier la connexion');
    }
    
    // 2. Récupération des IDs de pages de la catégorie
    console.log('📋 Récupération des IDs de pages de la catégorie...');
    const categoryUrl = `${API_BASE_URL}?action=query&list=categorymembers&cmtitle=Catégorie:Objectif_de_connaissance&cmlimit=500&format=json`;
    
    let allPageIds: number[] = [];
    let cmcontinue = '';
    
    do {
      const url = categoryUrl + (cmcontinue ? `&cmcontinue=${encodeURIComponent(cmcontinue)}` : '');
      const response = await fetchWithRetry(url);
      const data = await response.json();
      
      if (data?.query?.categorymembers) {
        const pageIds = data.query.categorymembers.map((page: any) => page.pageid);
        allPageIds.push(...pageIds);
        console.log(`   → ${pageIds.length} pages trouvées dans ce batch...`);
      }
      
      cmcontinue = data?.continue?.cmcontinue || '';
    } while (cmcontinue);
    
    console.log(`✅ ${allPageIds.length} pages OIC listées au total`);
    
    if (allPageIds.length === 0) {
      throw new Error('Aucune page trouvée dans la catégorie Objectif_de_connaissance');
    }
    
    // 3. Traitement par batches de 50 pages
    console.log('🔄 Traitement par batches de 50 pages...');
    const totalBatches = Math.ceil(allPageIds.length / BATCH_SIZE);
    let totalExtracted = 0;
    let totalErrors = 0;
    const results: any[] = [];
    
    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      const startIdx = batchIndex * BATCH_SIZE;
      const endIdx = Math.min(startIdx + BATCH_SIZE, allPageIds.length);
      const batchPageIds = allPageIds.slice(startIdx, endIdx);
      
      console.log(`📦 Batch ${batchIndex + 1}/${totalBatches} - Pages ${startIdx + 1} à ${endIdx}`);
      
      // Récupérer le contenu des pages de ce batch
      const pageidsStr = batchPageIds.join('|');
      const contentUrl = `${API_BASE_URL}?action=query&prop=revisions&rvprop=content|timestamp&pageids=${pageidsStr}&format=json&formatversion=2`;
      
      try {
        const contentResponse = await fetchWithRetry(contentUrl);
        const contentData = await contentResponse.json();
        
        if (contentData?.query?.pages) {
          const batchCompetences: OICCompetence[] = [];
          
          for (const page of contentData.query.pages) {
            const parsed = parseOICContent(page);
            if (parsed) {
              batchCompetences.push(parsed);
            } else {
              totalErrors++;
            }
          }
          
          // Insertion par batch dans Supabase avec upsert
          if (batchCompetences.length > 0) {
            const { error: insertError } = await supabase
              .from('oic_competences')
              .upsert(batchCompetences, {
                onConflict: 'objectif_id',
                ignoreDuplicates: false
              });
            
            if (insertError) {
              console.error(`❌ Erreur insertion batch ${batchIndex + 1}:`, insertError);
              totalErrors += batchCompetences.length;
            } else {
              totalExtracted += batchCompetences.length;
              console.log(`   ✅ ${batchCompetences.length}/${batchPageIds.length} compétences insérées (${batchPageIds.length - batchCompetences.length} erreurs)`);
            }
          }
        }
        
        // Pause entre batches pour éviter rate limiting
        if (batchIndex < totalBatches - 1) {
          await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
        }
        
      } catch (error) {
        console.error(`❌ Erreur batch ${batchIndex + 1}:`, error);
        totalErrors += batchPageIds.length;
      }
    }
    
    // 4. Génération du rapport de complétude
    console.log('📊 Génération du rapport de complétude...');
    
    const { data: finalCount } = await supabase
      .from('oic_competences')
      .select('*', { count: 'exact', head: true });
    
    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);
    const completionRate = ((totalExtracted / TOTAL_EXPECTED) * 100).toFixed(2);
    
    const report = {
      success: true,
      method: 'API-first extraction (README implementation)',
      summary: {
        total_expected: TOTAL_EXPECTED,
        total_found: allPageIds.length,
        total_extracted: totalExtracted,
        total_errors: totalErrors,
        completeness_pct: completionRate,
        duration_seconds: duration,
        final_db_count: finalCount?.length || 0
      },
      performance: {
        pages_per_second: Math.round(allPageIds.length / duration),
        batch_size: BATCH_SIZE,
        total_batches: totalBatches,
        avg_time_per_batch: Math.round(duration / totalBatches)
      },
      generated_at: new Date().toISOString()
    };
    
    console.log('🎉 EXTRACTION API-FIRST TERMINÉE !');
    console.log('=====================================');
    console.log(`📊 Pages trouvées: ${allPageIds.length}`);
    console.log(`✅ Compétences extraites: ${totalExtracted}`);
    console.log(`❌ Erreurs: ${totalErrors}`);
    console.log(`📈 Taux de complétude: ${completionRate}%`);
    console.log(`⏱️ Durée: ${duration}s`);
    console.log(`🚀 Performance: ${Math.round(allPageIds.length / duration)} pages/sec`);
    
    return new Response(JSON.stringify(report, null, 2), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('💥 ERREUR CRITIQUE:', error);
    
    const errorReport = {
      success: false,
      error: error.message,
      method: 'API-first extraction (README implementation)',
      timestamp: new Date().toISOString()
    };
    
    return new Response(JSON.stringify(errorReport, null, 2), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});