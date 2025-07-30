import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Mapping des codes rubriques vers noms complets
const RUBRIQUES_MAP: Record<string, string> = {
  '01': 'Génétique',
  '02': 'Embryologie', 
  '03': 'Cancérologie',
  '04': 'Infectiologie',
  '05': 'Immunologie',
  '06': 'Neurologie',
  '07': 'Cardiologie',
  '08': 'Pneumologie',
  '09': 'Gastroentérologie',
  '10': 'Endocrinologie',
  '11': 'Néphrologie'
};

interface OICCompetence {
  objectif_id: string;
  intitule: string;
  item_parent: string;
  rang: 'A' | 'B';
  rubrique: string;
  description: string;
  ordre: number;
  url_source: string;
  raw_json: any;
}

function parseOICPage(page: any): OICCompetence | null {
  try {
    const title = page.title;
    const content = page.revisions?.[0]?.content || '';
    
    // Parser l'identifiant OIC-XXX-YY-R-ZZ
    const oicMatch = title.match(/OIC[_-](\d{3})[_-](\d{2})[_-]([AB])[_-](\d{2})/i);
    if (!oicMatch) {
      console.warn(`Format OIC invalide: ${title}`);
      return null;
    }
    
    const [, itemParent, rubriquCode, rang, ordre] = oicMatch;
    
    // Extraire l'intitulé
    const intitulePatterns = [
      /\|\s*[Ii]ntitulé\s*=\s*([^\n\|]+)/,
      /\|\s*[Tt]itre\s*=\s*([^\n\|]+)/,
      /^\s*(.+)$/m  // Fallback: première ligne non vide
    ];
    
    let intitule = title; // Par défaut
    for (const pattern of intitulePatterns) {
      const match = content.match(pattern);
      if (match) {
        intitule = match[1].trim();
        break;
      }
    }
    
    // Extraire la description
    const descPatterns = [
      /\|\s*[Dd]escription\s*=\s*([^\n\|]+)/,
      /\|\s*[Cc]ontenu\s*=\s*([^\n\|]+)/
    ];
    
    let description = '';
    for (const pattern of descPatterns) {
      const match = content.match(pattern);
      if (match) {
        description = match[1].trim();
        break;
      }
    }
    
    // Si pas de description, prendre le premier paragraphe
    if (!description) {
      const paragraphs = content.split('\n').filter(line => 
        line.trim() && !line.startsWith('|') && !line.startsWith('{{')
      );
      description = paragraphs[0]?.substring(0, 1000) || 'Description à compléter';
    }
    
    return {
      objectif_id: `OIC-${itemParent}-${rubriquCode}-${rang}-${ordre}`,
      intitule: intitule.replace(/^OIC[_-]\d{3}[_-]\d{2}[_-][AB][_-]\d{2}[_-]?/i, '').trim(),
      item_parent: itemParent,
      rang: rang as 'A' | 'B',
      rubrique: RUBRIQUES_MAP[rubriquCode] || `Rubrique ${rubriquCode}`,
      description,
      ordre: parseInt(ordre),
      url_source: `https://livret.uness.fr/lisa/2025/index.php?title=${encodeURIComponent(title)}`,
      raw_json: page
    };
    
  } catch (error) {
    console.error(`Erreur parsing ${page.title}:`, error);
    return null;
  }
}

async function testPublicAPIAccess(): Promise<boolean> {
  try {
    console.log('🔍 Test d\'accès public à l\'API MediaWiki...');
    
    const response = await fetch(
      'https://livret.uness.fr/lisa/2025/api.php?action=query&list=categorymembers&cmtitle=Catégorie:Objectif_de_connaissance&cmlimit=5&format=json'
    );
    
    if (!response.ok) return false;
    
    const data = await response.json();
    const hasOICPages = data.query?.categorymembers?.some((page: any) => 
      page.title.match(/OIC[_-]\d{3}[_-]\d{2}[_-][AB][_-]\d{2}/i)
    );
    
    if (hasOICPages) {
      console.log('✅ API MediaWiki publique accessible!');
      return true;
    }
    
    return false;
  } catch (error) {
    console.log('❌ API publique inaccessible:', error.message);
    return false;
  }
}

async function listAllOICPages(): Promise<string[]> {
  console.log('📋 Récupération des IDs de pages de la catégorie...');
  
  const pageIds: string[] = [];
  let cmcontinue = '';
  
  do {
    const url = new URL('https://livret.uness.fr/lisa/2025/api.php');
    url.searchParams.set('action', 'query');
    url.searchParams.set('list', 'categorymembers');
    url.searchParams.set('cmtitle', 'Catégorie:Objectif_de_connaissance');
    url.searchParams.set('cmlimit', '500');
    url.searchParams.set('format', 'json');
    if (cmcontinue) url.searchParams.set('cmcontinue', cmcontinue);
    
    const response = await fetch(url.toString());
    const data = await response.json();
    
    const members = data.query?.categorymembers || [];
    const oicPages = members.filter((page: any) => 
      page.title.match(/OIC[_-]\d{3}[_-]\d{2}[_-][AB][_-]\d{2}/i)
    );
    
    pageIds.push(...oicPages.map((page: any) => page.pageid.toString()));
    
    console.log(`   → ${oicPages.length} pages OIC trouvées...`);
    
    cmcontinue = data.continue?.cmcontinue || '';
  } while (cmcontinue);
  
  console.log(`✅ ${pageIds.length} pages OIC listées au total`);
  return pageIds;
}

async function extractPagesByBatch(pageIds: string[], batchSize = 50): Promise<OICCompetence[]> {
  console.log(`🔄 Traitement par batches de ${batchSize} pages...`);
  
  const competences: OICCompetence[] = [];
  const batches = [];
  
  for (let i = 0; i < pageIds.length; i += batchSize) {
    batches.push(pageIds.slice(i, i + batchSize));
  }
  
  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    console.log(`📦 Batch ${i + 1}/${batches.length} - Pages ${i * batchSize + 1} à ${Math.min((i + 1) * batchSize, pageIds.length)}`);
    
    try {
      const url = new URL('https://livret.uness.fr/lisa/2025/api.php');
      url.searchParams.set('action', 'query');
      url.searchParams.set('prop', 'revisions');
      url.searchParams.set('rvprop', 'content|timestamp');
      url.searchParams.set('pageids', batch.join('|'));
      url.searchParams.set('format', 'json');
      url.searchParams.set('formatversion', '2');
      
      const response = await fetch(url.toString());
      const data = await response.json();
      
      const pages = data.query?.pages || [];
      let successCount = 0;
      let errorCount = 0;
      
      for (const page of pages) {
        const competence = parseOICPage(page);
        if (competence) {
          competences.push(competence);
          successCount++;
        } else {
          errorCount++;
        }
      }
      
      console.log(`   ✅ ${successCount}/${batch.length} compétences extraites (${errorCount} erreurs)`);
      
      // Pause entre batches pour éviter le rate limiting
      if (i < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
    } catch (error) {
      console.error(`❌ Erreur batch ${i + 1}:`, error);
    }
  }
  
  return competences;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('🚀 EXTRACTION API-FIRST DES 4,872 OBJECTIFS EDN');
  console.log('===============================================');

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });

    // 1. Test accès API publique
    const isPublicAccessible = await testPublicAPIAccess();
    if (!isPublicAccessible) {
      throw new Error('API MediaWiki inaccessible - authentification CAS requise');
    }

    // 2. Lister toutes les pages OIC
    const pageIds = await listAllOICPages();
    if (pageIds.length === 0) {
      throw new Error('Aucune page OIC trouvée');
    }

    // 3. Extraire par batches
    const competences = await extractPagesByBatch(pageIds);
    console.log(`📊 ${competences.length} compétences extraites au total`);

    // 4. Insertion en base
    console.log('💾 Insertion en base Supabase...');
    let insertedCount = 0;
    let errorCount = 0;

    for (const competence of competences) {
      try {
        const { error } = await supabase
          .from('oic_competences')
          .upsert({
            objectif_id: competence.objectif_id,
            intitule: competence.intitule,
            item_parent: competence.item_parent,
            rang: competence.rang,
            rubrique: competence.rubrique,
            description: competence.description,
            ordre: competence.ordre,
            url_source: competence.url_source,
            raw_json: competence.raw_json,
            extraction_status: 'complete',
            hash_content: await crypto.subtle.digest('SHA-256', 
              new TextEncoder().encode(JSON.stringify(competence))
            ).then(buffer => 
              Array.from(new Uint8Array(buffer))
                .map(b => b.toString(16).padStart(2, '0'))
                .join('')
            )
          }, {
            onConflict: 'objectif_id'
          });

        if (error) {
          console.error(`❌ Erreur insertion ${competence.objectif_id}:`, error);
          errorCount++;
        } else {
          insertedCount++;
        }
      } catch (error) {
        console.error(`💥 Erreur critique ${competence.objectif_id}:`, error);
        errorCount++;
      }
    }

    // 5. Rapport final
    const report = {
      success: true,
      message: 'Extraction API-first terminée avec succès',
      statistics: {
        pages_found: pageIds.length,
        competences_extracted: competences.length,
        competences_inserted: insertedCount,
        insertion_errors: errorCount,
        success_rate: `${((insertedCount / competences.length) * 100).toFixed(1)}%`
      },
      extraction_date: new Date().toISOString()
    };

    console.log('🎉 EXTRACTION API-FIRST TERMINÉE !');
    console.log(`📊 Pages trouvées: ${pageIds.length}`);
    console.log(`🎯 Compétences extraites: ${competences.length}`);
    console.log(`💾 Compétences insérées: ${insertedCount}`);
    console.log(`❌ Erreurs: ${errorCount}`);
    console.log(`📈 Taux de succès: ${((insertedCount / competences.length) * 100).toFixed(1)}%`);

    return new Response(JSON.stringify(report), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('💥 Erreur critique:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      message: 'Erreur lors de l\'extraction API-first OIC'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});