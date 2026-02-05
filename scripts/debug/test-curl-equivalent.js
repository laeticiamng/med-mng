// 🧪 TEST CURL ÉQUIVALENT - Diagnostic API MediaWiki
console.log('🚀 DIAGNOSTIC OIC - Test curl équivalent');
console.log('=' .repeat(60));

async function testStep1_ApiSiteinfo() {
  console.log('1️⃣ TEST API SITEINFO (équivalent curl)');
  console.log('URL: https://livret.uness.fr/lisa/2025/api.php?action=query&meta=siteinfo&format=json&origin=*');
  
  try {
    const response = await fetch('https://livret.uness.fr/lisa/2025/api.php?action=query&meta=siteinfo&format=json&origin=*', {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; OIC-Test/1.0)',
        'Accept': 'application/json'
      }
    });
    
    console.log(`📊 Status: ${response.status} ${response.statusText}`);
    console.log(`📊 Headers: ${JSON.stringify(Object.fromEntries(response.headers.entries()))}`);
    
    if (response.status === 200) {
      const text = await response.text();
      console.log(`✅ Réponse OK - ${text.length} caractères`);
      console.log(`📄 Contenu (500 premiers chars): ${text.substring(0, 500)}`);
      
      try {
        const json = JSON.parse(text);
        if (json.query?.general) {
          console.log('✅ API PUBLIQUE confirmée - JSON valide avec données');
          return { status: 'public', data: json };
        } else {
          console.log('⚠️  JSON sans données attendues');
          return { status: 'unknown', data: json };
        }
      } catch (e) {
        console.log('❌ Réponse non-JSON');
        return { status: 'error', error: 'Non-JSON response' };
      }
    } else if (response.status === 302) {
      console.log('🔐 REDIRECTION CAS détectée - API protégée');
      console.log(`📍 Location: ${response.headers.get('location')}`);
      return { status: 'protected', type: 'redirect' };
    } else if (response.status === 403) {
      console.log('🚫 ACCÈS INTERDIT - API protégée');
      return { status: 'protected', type: 'forbidden' };
    } else {
      const text = await response.text();
      console.log(`❌ Erreur HTTP ${response.status}: ${text.substring(0, 200)}`);
      return { status: 'error', httpStatus: response.status, error: text };
    }
  } catch (error) {
    console.log(`💥 Exception: ${error.message}`);
    return { status: 'error', error: error.message };
  }
}

async function testStep2_CategoryMembers() {
  console.log('\n2️⃣ TEST CATÉGORIE MEMBRES');
  const url = 'https://livret.uness.fr/lisa/2025/api.php?action=query&list=categorymembers&cmtitle=Catégorie%3AObjectif_de_connaissance&cmlimit=5&format=json&origin=*';
  console.log(`URL: ${url}`);
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; OIC-Test/1.0)',
        'Accept': 'application/json'
      }
    });
    
    console.log(`📊 Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`📄 Réponse JSON (tronquée): ${JSON.stringify(data).substring(0, 500)}...`);
      
      const members = data.query?.categorymembers || [];
      console.log(`📊 Membres trouvés: ${members.length}`);
      
      if (members.length > 0) {
        console.log('✅ CATÉGORIE TROUVÉE - Premiers membres:');
        members.slice(0, 3).forEach((member, i) => {
          console.log(`   ${i+1}. "${member.title}" (ID: ${member.pageid})`);
        });
        
        if (data.continue?.cmcontinue) {
          console.log(`📄 Pagination disponible: ${data.continue.cmcontinue}`);
        }
        
        return { status: 'success', count: members.length, members: members, data: data };
      } else {
        console.log('❌ CATÉGORIE VIDE - Aucun membre trouvé');
        console.log('🔍 Possible problème de nom de catégorie');
        return { status: 'empty', data: data };
      }
    } else {
      const text = await response.text();
      console.log(`❌ Erreur: ${text.substring(0, 500)}`);
      return { status: 'error', httpStatus: response.status, error: text };
    }
  } catch (error) {
    console.log(`💥 Exception: ${error.message}`);
    return { status: 'error', error: error.message };
  }
}

async function testStep3_PageContent(pageId) {
  console.log(`\n3️⃣ TEST CONTENU PAGE (ID: ${pageId})`);
  const url = `https://livret.uness.fr/lisa/2025/api.php?action=query&prop=revisions&rvprop=content&pageids=${pageId}&format=json&formatversion=2&origin=*`;
  console.log(`URL: ${url}`);
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; OIC-Test/1.0)',
        'Accept': 'application/json'
      }
    });
    
    console.log(`📊 Status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      const page = data.query?.pages?.[0];
      
      if (page?.revisions?.[0]?.content) {
        const content = page.revisions[0].content;
        console.log(`✅ CONTENU RÉCUPÉRÉ - ${content.length} caractères`);
        console.log(`📄 Titre: "${page.title}"`);
        console.log(`📄 Contenu (200 premiers chars): ${content.substring(0, 200)}...`);
        return { status: 'success', title: page.title, content: content };
      } else {
        console.log('❌ Contenu vide ou inaccessible');
        console.log(`📄 Réponse: ${JSON.stringify(data).substring(0, 300)}`);
        return { status: 'empty', data: data };
      }
    } else {
      const text = await response.text();
      console.log(`❌ Erreur: ${text.substring(0, 300)}`);
      return { status: 'error', httpStatus: response.status, error: text };
    }
  } catch (error) {
    console.log(`💥 Exception: ${error.message}`);
    return { status: 'error', error: error.message };
  }
}

async function runCompleteTest() {
  console.log('🚀 DIAGNOSTIC COMPLET - Tests séquentiels\n');
  
  // Test 1: API accessibility
  const apiTest = await testStep1_ApiSiteinfo();
  
  // Test 2: Category members (uniquement si API accessible)
  let categoryTest = null;
  if (apiTest.status === 'public' || apiTest.status === 'unknown') {
    categoryTest = await testStep2_CategoryMembers();
    
    // Test 3: Page content (uniquement si on a des membres)
    if (categoryTest?.status === 'success' && categoryTest.members?.length > 0) {
      const firstPageId = categoryTest.members[0].pageid;
      await testStep3_PageContent(firstPageId);
    }
  }
  
  // CONCLUSIONS
  console.log('\n' + '=' .repeat(60));
  console.log('📊 CONCLUSIONS DU DIAGNOSTIC');
  console.log('=' .repeat(60));
  
  if (apiTest.status === 'public') {
    console.log('✅ API MediaWiki: ACCESSIBLE PUBLIQUEMENT');
  } else if (apiTest.status === 'protected') {
    console.log('🔐 API MediaWiki: PROTÉGÉE (authentification CAS requise)');
  } else {
    console.log('❌ API MediaWiki: ERREUR DE CONNEXION');
  }
  
  if (categoryTest?.status === 'success') {
    console.log(`✅ Catégorie OIC: TROUVÉE (${categoryTest.count} membres)`);
  } else if (categoryTest?.status === 'empty') {
    console.log('❌ Catégorie OIC: VIDE (problème de nom?)');
  } else if (apiTest.status === 'protected') {
    console.log('⏸️  Catégorie OIC: NON TESTÉE (API protégée)');
  } else {
    console.log('❌ Catégorie OIC: ERREUR');
  }
  
  console.log('\n🎯 PROCHAINES ÉTAPES:');
  if (apiTest.status === 'protected') {
    console.log('1. Générer cookie CAS avec Puppeteer');
    console.log('2. Relancer tests avec authentification');
  } else if (categoryTest?.status === 'success') {
    console.log('1. Tester batch de 50 pages');
    console.log('2. Parser et insérer première compétence');
  } else {
    console.log('1. Vérifier nom de catégorie correct');
    console.log('2. Tester variantes de noms');
  }
}

// Lancer le test
runCompleteTest().catch(console.error);