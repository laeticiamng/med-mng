// 🧪 TEST INSERTION UNITAIRE - Diagnostic rapide insertion OIC
console.log('🧪 TEST INSERTION UNITAIRE OIC');
console.log('=' .repeat(50));

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://yaincoxihiqdksxgrsrk.supabase.co';
const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function testInsertion() {
  try {
    console.log('0️⃣ SQL test (exemple du ticket)');
    console.log(
      [
        'INSERT INTO oic_competences (objectif_id, intitule, item_parent, rang, rubrique, url_source)',
        "VALUES ('OIC-001-23-A-01', 'Test', '001', 'A', 'Génétique', 'https://livret.uness.fr/lisa/2025/OIC-001-23-A-01');",
        'SELECT count(*) FROM oic_competences;'
      ].join('\n')
    );

    console.log('\n1️⃣ Vérification count initial...');
    
    // Count initial
    const countInitial = await fetch(`${SUPABASE_URL}/rest/v1/oic_competences?select=count`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'count=exact'
      }
    });
    
    const countInitialResult = await countInitial.text();
    console.log('📊 Count initial:', countInitialResult);
    
    console.log('\n2️⃣ Vérification RLS (policies)...');
    if (SUPABASE_SERVICE_ROLE_KEY) {
      const policyResponse = await fetch(`${SUPABASE_URL}/rest/v1/rpc/list_rls_policies`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });

      if (policyResponse.ok) {
        const policies = await policyResponse.json();
        const oicPolicies = policies.filter((policy) => policy.table_name === 'oic_competences');
        console.log('✅ Policies oic_competences:', JSON.stringify(oicPolicies, null, 2));
      } else {
        console.warn('⚠️ Impossible de lire les policies (service role requis).');
        console.warn(await policyResponse.text());
      }
    } else {
      console.warn('⚠️ SUPABASE_SERVICE_ROLE_KEY manquant - skip vérification policies.');
    }

    console.log('\n3️⃣ Test insertion échantillon (anon -> attendu bloqué si RLS active)...');
    
    // Créer un échantillon de test
    const sampleCompetence = {
      objectif_id: 'OIC-001-23-A-01',
      intitule: 'TEST - Compétence de diagnostic',
      item_parent: '001',
      rang: 'A',
      rubrique: 'Génétique',
      description: 'Compétence de test pour diagnostic',
      ordre: 1,
      url_source: 'https://livret.uness.fr/lisa/2025/OIC-001-23-A-01',
      date_import: new Date().toISOString(),
      extraction_status: 'test'
    };
    
    console.log('SAMPLE ➜', JSON.stringify(sampleCompetence, null, 2));
    
    // Tentative d'insertion avec anon
    console.log('\n4️⃣ Insertion via REST API (anon)...');
    const insertResponse = await fetch(`${SUPABASE_URL}/rest/v1/oic_competences`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(sampleCompetence)
    });
    
    console.log('📊 Status insertion (anon):', insertResponse.status);
    
    if (insertResponse.ok) {
      console.log('✅ INSERTION RÉUSSIE (anon)!');
    } else {
      const errorText = await insertResponse.text();
      console.error('❌ ERREUR INSERTION (anon):', errorText);
      
      // Analyser l'erreur
      try {
        const errorJson = JSON.parse(errorText);
        console.error('📄 Détail erreur:', JSON.stringify(errorJson, null, 2));
      } catch (e) {
        console.error('📄 Erreur brute:', errorText);
      }
    }
    
    if (SUPABASE_SERVICE_ROLE_KEY) {
      console.log('\n5️⃣ Insertion via REST API (service_role)...');
      const serviceInsertResponse = await fetch(`${SUPABASE_URL}/rest/v1/oic_competences`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(sampleCompetence)
      });

      console.log('📊 Status insertion (service_role):', serviceInsertResponse.status);

      if (serviceInsertResponse.ok) {
        console.log('✅ INSERTION RÉUSSIE (service_role)!');
      } else {
        const errorText = await serviceInsertResponse.text();
        console.error('❌ ERREUR INSERTION (service_role):', errorText);
      }
    } else {
      console.warn('⚠️ SUPABASE_SERVICE_ROLE_KEY manquant - skip insertion service_role.');
    }

    console.log('\n6️⃣ Vérification count final...');
    
    // Count final
    const countFinal = await fetch(`${SUPABASE_URL}/rest/v1/oic_competences?select=count`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'count=exact'
      }
    });
    
    const countFinalResult = await countFinal.text();
    console.log('📊 Count final:', countFinalResult);
    
    // Test lecture
    console.log('\n7️⃣ Test lecture de l\'échantillon...');
    const readResponse = await fetch(`${SUPABASE_URL}/rest/v1/oic_competences?objectif_id=eq.${sampleCompetence.objectif_id}&select=*`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (readResponse.ok) {
      const readData = await readResponse.json();
      console.log('✅ Lecture réussie:', readData.length, 'résultat(s)');
      if (readData.length > 0) {
        console.log('📄 Données:', JSON.stringify(readData[0], null, 2));
      }
    } else {
      console.error('❌ Erreur lecture:', await readResponse.text());
    }
    
    console.log('\n' + '=' .repeat(50));
    console.log('🏁 TEST INSERTION TERMINÉ');
    console.log('=' .repeat(50));
    
  } catch (error) {
    console.error('💥 Erreur critique:', error);
  }
}

// Lancer le test
testInsertion();
