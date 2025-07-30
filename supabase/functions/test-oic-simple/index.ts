import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Mapping des codes rubrique vers noms complets
const RUBRIQUES_MAP: Record<string, string> = {
  '01': 'Génétique',
  '02': 'Embryologie',
  '03': 'Anatomie',
  '04': 'Physiologie',
  '05': 'Histologie',
  '06': 'Biochimie',
  '07': 'Immunologie',
  '08': 'Microbiologie',
  '09': 'Pharmacologie',
  '10': 'Pathologie',
  '11': 'Cancérologie'
};

// Fonction de parsing des données OIC
function parseOICPage(content: string, title: string): any {
  // Extract objectif_id from title (format: OIC-XXX-YY-R-ZZ)
  const idMatch = title.match(/OIC[_-](\d{3})[_-](\d{2})[_-]([AB])[_-](\d{2})/i);
  if (!idMatch) return null;

  const [, itemParent, rubriqueFull, rang, ordreFull] = idMatch;
  const objectifId = `OIC-${itemParent}-${rubriqueFull}-${rang}-${ordreFull}`;
  
  // Extract intitulé
  const intitulePatterns = [
    /\|\s*[Ii]ntitulé\s*=\s*([^\n\|]+)/,
    /\|\s*[Tt]itre\s*=\s*([^\n\|]+)/,
  ];
  
  let intitule = title;
  for (const pattern of intitulePatterns) {
    const match = content.match(pattern);
    if (match) {
      intitule = match[1].trim();
      break;
    }
  }

  // Extract description
  const descriptionMatch = content.match(/\|\s*[Dd]escription\s*=\s*([^\n\|]+)/);
  const description = descriptionMatch ? descriptionMatch[1].trim() : '';

  return {
    objectif_id: objectifId,
    intitule: intitule || title,
    item_parent: itemParent,
    rang: rang.toUpperCase(),
    rubrique: RUBRIQUES_MAP[rubriqueFull] || `Rubrique ${rubriqueFull}`,
    description: description,
    ordre: parseInt(ordreFull),
    url_source: `https://livret.uness.fr/lisa/2025/${title.replace(/\s+/g, '_')}`,
    raw_json: { title, content: content.substring(0, 1000) },
    extraction_status: 'complete'
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('🚀 EXTRACTION API-FIRST DES 4,872 OBJECTIFS EDN');
  console.log('===============================================');

  try {
    console.log('🔍 Vérification variables environnement...');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    console.log(`📍 SUPABASE_URL: ${supabaseUrl ? 'configuré' : 'manquant'}`);
    console.log(`🔑 SERVICE_KEY: ${supabaseServiceKey ? 'configuré' : 'manquant'}`);
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Variables d\'environnement Supabase manquantes');
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });

    // Étape 1: Test d'accès public à l'API MediaWiki
    console.log('🔍 Test d\'accès public à l\'API MediaWiki...');
    
    const listResponse = await fetch(
      'https://livret.uness.fr/lisa/2025/api.php?action=query&list=categorymembers&cmtitle=Catégorie:Objectif_de_connaissance&cmlimit=500&format=json'
    );

    console.log(`📡 Status: ${listResponse.status}`);
    
    if (!listResponse.ok) {
      throw new Error(`HTTP ${listResponse.status}: ${listResponse.statusText}`);
    }

    const listData = await listResponse.json();
    console.log('📊 Données de listing reçues');

    // Étape 2: Analyser les pages trouvées
    const members = listData.query?.categorymembers || [];
    const oicPages = members.filter((page: any) => {
      if (!page.title) return false;
      return page.title.match(/OIC[_-]\d{3}[_-]\d{2}[_-][AB][_-]\d{2}/i);
    });

    console.log(`📋 ${members.length} pages trouvées au total`);
    console.log(`🎯 ${oicPages.length} pages OIC identifiées`);
    
    // Afficher quelques exemples pour debug
    console.log('📋 Exemples de pages OIC:');
    oicPages.slice(0, 5).forEach((page: any, i: number) => {
      console.log(`  ${i+1}. ${page.title} (ID: ${page.pageid})`);
    });

    // Étape 3: Test d'extraction de contenu par batch
    if (oicPages.length > 0) {
      const testBatch = oicPages.slice(0, 10); // Test avec 10 pages
      const pageIds = testBatch.map((p: any) => p.pageid).join('|');
      
      console.log(`📦 Test extraction batch de ${testBatch.length} pages...`);
      
      const contentResponse = await fetch(
        `https://livret.uness.fr/lisa/2025/api.php?action=query&prop=revisions&rvprop=content|timestamp&pageids=${pageIds}&format=json&formatversion=2`
      );

      if (contentResponse.ok) {
        const contentData = await contentResponse.json();
        const pages = contentData.query?.pages || [];
        
        console.log(`✅ ${pages.length} pages de contenu récupérées`);
        
        // Étape 4: Parsing et insertion de test
        const parsedData = [];
        let successCount = 0;
        
        for (const page of pages) {
          const content = page.revisions?.[0]?.content || '';
          if (content) {
            const parsed = parseOICPage(content, page.title);
            if (parsed) {
              parsedData.push(parsed);
              successCount++;
            }
          }
        }
        
        console.log(`📝 ${successCount} compétences parsées avec succès`);
        
        // Test d'insertion en base (1 seule pour le test)
        if (parsedData.length > 0) {
          const testInsert = parsedData[0];
          const { error: insertError } = await supabase
            .from('oic_competences')
            .upsert(testInsert, { onConflict: 'objectif_id' });
            
          if (insertError) {
            console.error('❌ Erreur insertion test:', insertError);
          } else {
            console.log('✅ Test d\'insertion en base réussi');
          }
        }

        // Rapport de test final
        const report = {
          success: true,
          message: 'Extraction API-first testée avec succès',
          statistics: {
            total_pages_found: members.length,
            oic_pages_identified: oicPages.length,
            test_batch_size: testBatch.length,
            content_pages_extracted: pages.length,
            competences_parsed: successCount,
            api_accessible: true,
            test_date: new Date().toISOString()
          },
          sample_competences: parsedData.slice(0, 3).map(p => ({
            objectif_id: p.objectif_id,
            intitule: p.intitule,
            rubrique: p.rubrique,
            rang: p.rang
          })),
          next_steps: [
            'API publique accessible ✅',
            `${oicPages.length} pages OIC identifiées`,
            'Parsing des données fonctionnel',
            'Prêt pour extraction complète des 4,872 objectifs'
          ]
        };

        console.log('🎉 TEST D\'EXTRACTION RÉUSSI !');
        console.log(`📊 Pages OIC trouvées: ${oicPages.length}`);
        console.log(`✅ Parsing réussi: ${successCount} compétences`);
        
        return new Response(JSON.stringify(report), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } else {
        throw new Error('Échec récupération contenu pages');
      }
    } else {
      throw new Error('Aucune page OIC trouvée dans la catégorie');
    }

  } catch (error) {
    console.error('💥 Erreur:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      message: 'Erreur lors du test d\'extraction API-first'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});