// Client API MediaWiki corrigé
export async function getCategoryMembers(authCookies: string = ''): Promise<{ pageIds: number[], titles: Map<number, string> }> {
  const pageIds: number[] = [];
  const titles = new Map<number, string>();
  let cmcontinue = '';
  let totalFound = 0;
  
  console.log('📋 Début de la récupération des membres de la catégorie...');
  console.log(`🔐 Cookies d'auth: ${authCookies ? 'PRÉSENTS' : 'ABSENTS'}`);
  
  do {
    const url = new URL('https://livret.uness.fr/lisa/2025/api.php');
    url.searchParams.set('action', 'query');
    url.searchParams.set('list', 'categorymembers');
    // CORRECTION: Encoding proper du titre de catégorie
    url.searchParams.set('cmtitle', encodeURIComponent('Catégorie:Objectif_de_connaissance'));
    url.searchParams.set('cmlimit', '500');
    url.searchParams.set('format', 'json');
    url.searchParams.set('origin', '*'); // CORS
    
    if (cmcontinue) {
      url.searchParams.set('cmcontinue', cmcontinue);
    }
    
    const headers: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'application/json',
      'Accept-Language': 'fr-FR,fr;q=0.9'
    };
    
    // CORRECTION: Injection des cookies d'authentification
    if (authCookies) {
      headers['Cookie'] = authCookies;
      console.log('🍪 Cookies injectés dans la requête');
    }
    
    try {
      console.log(`🔍 Requête: ${url.toString()}`);
      const response = await fetch(url.toString(), { 
        headers,
        credentials: 'include' // Important pour les cookies
      });
      
      // CORRECTION: Détecter les redirections CAS
      if (response.status === 302 || response.status === 301) {
        console.error('🔐 Redirection détectée - authentification CAS requise');
        throw new Error('AUTH_REQUIRED: Redirection CAS détectée');
      }
      
      if (!response.ok) {
        console.error(`❌ Erreur HTTP: ${response.status} ${response.statusText}`);
        if (response.status === 403) {
          console.error('🔐 Accès interdit - authentification requise');
          throw new Error('AUTH_REQUIRED: Accès interdit (403)');
        }
        const text = await response.text();
        console.error('Réponse:', text.substring(0, 500));
        break;
      }
      
      const data = await response.json();
      console.log(`📊 Réponse API reçue`);
      console.log(`   - Status: ${response.status}`);
      console.log(`   - Membres trouvés: ${data.query?.categorymembers?.length || 0}`);
      
      // Vérifier si on a une erreur API
      if (data.error) {
        console.error('❌ Erreur API MediaWiki:', data.error);
        break;
      }
      
      // CORRECTION: Diagnostic AUTH_REQUIRED si tableau vide
      if (data.query?.categorymembers) {
        if (data.query.categorymembers.length === 0 && !authCookies) {
          console.error('🔐 AUTH_REQUIRED: Catégorie vide sans authentification');
          throw new Error('AUTH_REQUIRED: Catégorie vide - authentification CAS probablement requise');
        }
        
        data.query.categorymembers.forEach((page: any) => {
          console.log(`   - Page trouvée: ${page.title}`);
          // Regex plus flexible pour capturer différents formats
          if (page.title && (
            page.title.match(/OIC-\d{3}-\d{2}-[AB]-\d{2}/) ||
            page.title.includes('OIC-')
          )) {
            pageIds.push(page.pageid);
            titles.set(page.pageid, page.title);
            totalFound++;
          }
        });
      } else {
        console.warn('⚠️  Pas de propriété categorymembers dans la réponse');
        if (!authCookies) {
          console.error('🔐 AUTH_REQUIRED: Pas de données et pas d\'authentification');
          throw new Error('AUTH_REQUIRED: Pas de données sans authentification');
        }
      }
      
      // Gestion de la pagination
      cmcontinue = data.continue?.cmcontinue || data['query-continue']?.categorymembers?.cmcontinue || '';
      
      console.log(`✅ Total cumulé: ${totalFound} compétences`);
      
    } catch (error) {
      console.error('❌ Erreur lors de la requête:', error);
      if (error.message.includes('AUTH_REQUIRED')) {
        throw error; // Propager l'erreur d'authentification
      }
      break;
    }
    
  } while (cmcontinue);
  
  console.log(`📊 Récupération terminée: ${pageIds.length} compétences trouvées`);
  return { pageIds, titles };
}

export async function getPageContent(pageIds: number[], authCookies: string = ''): Promise<any[]> {
  const results: any[] = [];
  
  // MediaWiki limite à 50 pages par requête pour le contenu
  const chunks = [];
  for (let i = 0; i < pageIds.length; i += 50) {
    chunks.push(pageIds.slice(i, i + 50));
  }
  
  console.log(`📄 Récupération du contenu de ${pageIds.length} pages en ${chunks.length} requêtes...`);
  console.log(`🔐 Cookies d'auth: ${authCookies ? 'PRÉSENTS' : 'ABSENTS'}`);
  
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const url = new URL('https://livret.uness.fr/lisa/2025/api.php');
    url.searchParams.set('action', 'query');
    url.searchParams.set('prop', 'revisions|categories|info');
    url.searchParams.set('rvprop', 'content|ids|timestamp');
    url.searchParams.set('rvslots', 'main'); // Slot principal pour MediaWiki moderne
    url.searchParams.set('pageids', chunk.join('|'));
    url.searchParams.set('format', 'json');
    url.searchParams.set('formatversion', '2'); // Format JSON plus moderne
    url.searchParams.set('origin', '*');
    
    const headers: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'application/json'
    };
    
    // CORRECTION: Injection des cookies d'authentification
    if (authCookies) {
      headers['Cookie'] = authCookies;
      console.log(`🍪 Cookies injectés pour batch ${i+1}`);
    }
    
    try {
      const response = await fetch(url.toString(), { 
        headers,
        credentials: 'include'
      });
      
      if (!response.ok) {
        console.error(`❌ Erreur HTTP batch ${i+1}: ${response.status}`);
        if (response.status === 403 || response.status === 302) {
          console.error('🔐 Problème d\'authentification détecté pour le contenu');
        }
        continue;
      }
      
      const data = await response.json();
      
      if (data.error) {
        console.error(`❌ Erreur API batch ${i+1}:`, data.error);
        continue;
      }
      
      if (data.query?.pages) {
        results.push(...data.query.pages);
        console.log(`✅ Batch ${i+1}/${chunks.length} - ${data.query.pages.length} pages récupérées`);
      } else {
        console.warn(`⚠️  Batch ${i+1}: Pas de données pages dans la réponse`);
      }
      
      // Délai pour éviter le rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.error(`❌ Erreur batch ${i+1}:`, error);
    }
  }
  
  console.log(`📊 ${results.length} pages récupérées avec succès`);
  return results;
}

export async function parseWikitext(wikitext: string): Promise<any> {
  // Parser le wikitext pour extraire les informations structurées
  const result: any = {
    objectif_id: '',
    intitule: '',
    item_parent: '',
    rang: '',
    rubrique: '',
    description: '',
    ordre: 0
  };
  
  // Extraction de l'identifiant depuis le titre ou le contenu
  const idMatch = wikitext.match(/OIC-(\d{3})-(\d{2})-([AB])-(\d{2})/);
  if (idMatch) {
    result.objectif_id = idMatch[0];
    result.item_parent = idMatch[1];
    result.rang = idMatch[3];
    result.ordre = parseInt(idMatch[4]);
  }
  
  // Extraction du titre/intitulé
  const titleMatch = wikitext.match(/'''(.+?)'''/);
  if (titleMatch) {
    result.intitule = titleMatch[1].trim();
  }
  
  // Extraction de la rubrique (peut être dans une catégorie ou un template)
  const rubriques = [
    'Génétique', 'Immunopathologie', 'Inflammation',
    'Cancérologie', 'Pharmacologie', 'Douleur',
    'Santé publique', 'Thérapeutique', 'Urgences',
    'Vieillissement', 'Interprétation'
  ];
  
  for (const rubrique of rubriques) {
    if (wikitext.includes(rubrique)) {
      result.rubrique = rubrique;
      break;
    }
  }
  
  // Extraction de la description (premier paragraphe)
  const descMatch = wikitext.match(/\n\n(.+?)(?=\n\n|\[\[|$)/s);
  if (descMatch) {
    result.description = descMatch[1].replace(/\[\[(.+?)\]\]/g, '$1').trim();
  }
  
  return result;
}

export async function testPublicAccess(): Promise<boolean> {
  try {
    console.log('🔍 Test d\'accès public à l\'API MediaWiki...');
    
    // Test avec plusieurs endpoints possibles
    const endpoints = [
      'https://livret.uness.fr/lisa/2025/api.php?action=query&meta=siteinfo&format=json',
      'https://livret.uness.fr/api.php?action=query&meta=siteinfo&format=json',
      'https://livret.uness.fr/lisa/api.php?action=query&meta=siteinfo&format=json'
    ];
    
    for (const endpoint of endpoints) {
      console.log(`Test: ${endpoint}`);
      
      try {
        const response = await fetch(endpoint, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; OIC-Extractor/1.0)',
            'Accept': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ API accessible à:', endpoint);
          console.log('Version MediaWiki:', data.query?.general?.generator);
          return true;
        }
      } catch (e) {
        console.log(`❌ Échec pour ${endpoint}`);
      }
    }
    
    console.log('🔐 Aucune API publique trouvée - authentification requise');
    return false;
    
  } catch (error) {
    console.error('❌ Erreur test API:', error);
    return false;
  }
}

// Fonction principale d'extraction
export async function extractAllCompetences(authCookies?: string) {
  console.log('🚀 Démarrage de l\'extraction complète...');
  
  // Test d'accès
  const isPublic = await testPublicAccess();
  if (!isPublic && !authCookies) {
    console.error('❌ API privée et pas de cookies d\'authentification fournis');
    return [];
  }
  
  // Récupération des IDs
  const { pageIds, titles } = await getCategoryMembers(authCookies || '');
  
  if (pageIds.length === 0) {
    console.error('❌ Aucune compétence trouvée');
    return [];
  }
  
  // Récupération du contenu
  const pages = await getPageContent(pageIds, authCookies || '');
  
  // Parsing et structuration
  const competences = [];
  for (const page of pages) {
    if (page.revisions?.[0]?.slots?.main?.content || page.revisions?.[0]?.['*']) {
      const content = page.revisions[0].slots?.main?.content || page.revisions[0]['*'];
      const parsed = await parseWikitext(content);
      
      // Ajouter les métadonnées
      parsed.page_id = page.pageid;
      parsed.url_source = `https://livret.uness.fr/lisa/2025/${page.title}`;
      parsed.last_modified = page.revisions[0].timestamp;
      
      competences.push(parsed);
    }
  }
  
  console.log(`✅ Extraction terminée: ${competences.length} compétences extraites`);
  return competences;
}

// Test rapide avec limite
export async function testExtraction(limit: number = 5) {
  console.log(`🧪 Test d'extraction limité à ${limit} éléments...`);
  
  const isPublic = await testPublicAccess();
  if (!isPublic) {
    console.log('⚠️  API privée détectée, les résultats peuvent être limités');
  }
  
  const { pageIds, titles } = await getCategoryMembers();
  
  if (pageIds.length > 0) {
    console.log(`📋 ${pageIds.length} compétences trouvées, test sur les ${Math.min(limit, pageIds.length)} premières`);
    
    const testIds = pageIds.slice(0, limit);
    const pages = await getPageContent(testIds);
    
    for (const page of pages) {
      console.log('\n---');
      console.log('Titre:', page.title);
      console.log('ID:', page.pageid);
      console.log('Contenu disponible:', !!page.revisions?.[0]);
    }
  }
}