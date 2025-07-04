// Client API MediaWiki simplifié

export async function getCategoryMembers(authCookies: string = ''): Promise<number[]> {
  const pageIds: number[] = [];
  let cmcontinue = '';
  
  do {
    const url = new URL('https://livret.uness.fr/lisa/2025/api.php');
    url.searchParams.set('action', 'query');
    url.searchParams.set('list', 'categorymembers');
    url.searchParams.set('cmtitle', 'Catégorie:Objectif_de_connaissance');
    url.searchParams.set('cmlimit', '500');
    url.searchParams.set('format', 'json');
    
    if (cmcontinue) {
      url.searchParams.set('cmcontinue', cmcontinue);
    }
    
    const headers: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (compatible; OIC-Extractor/1.0)'
    };
    
    if (authCookies) {
      headers['Cookie'] = authCookies;
    }
    
    const response = await fetch(url.toString(), { headers });
    const data = await response.json();
    
    if (data.query?.categorymembers) {
      data.query.categorymembers.forEach((page: any) => {
        if (page.title?.match(/OIC-\d{3}-\d{2}-[AB]-\d{2}/)) {
          pageIds.push(page.pageid);
        }
      });
    }
    
    cmcontinue = data.continue?.cmcontinue || '';
    
  } while (cmcontinue);
  
  return pageIds;
}

export async function getPageContent(pageIds: number[], authCookies: string = ''): Promise<any[]> {
  const url = new URL('https://livret.uness.fr/lisa/2025/api.php');
  url.searchParams.set('action', 'query');
  url.searchParams.set('prop', 'revisions');
  url.searchParams.set('rvprop', 'content|ids|timestamp');
  url.searchParams.set('pageids', pageIds.join('|'));
  url.searchParams.set('format', 'json');
  
  const headers: Record<string, string> = {
    'User-Agent': 'Mozilla/5.0 (compatible; OIC-Extractor/1.0)'
  };
  
  if (authCookies) {
    headers['Cookie'] = authCookies;
  }
  
  const response = await fetch(url.toString(), { headers });
  const data = await response.json();
  
  return Object.values(data.query?.pages || {});
}

export async function testPublicAccess(): Promise<boolean> {
  try {
    console.log('🔍 Test d\'accès public à l\'API MediaWiki...');
    
    const response = await fetch('https://livret.uness.fr/lisa/2025/api.php?action=query&meta=siteinfo&format=json');
    
    if (response.ok) {
      console.log('✅ API MediaWiki publique accessible!');
      return true;
    }
    
    console.log('🔐 API privée - authentification requise');
    return false;
    
  } catch (error) {
    console.error('❌ Erreur test API:', error);
    return false;
  }
}