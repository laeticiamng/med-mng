// Client API optimisé pour MediaWiki UNESS
export async function getCategoryMembers(authCookies: string): Promise<{pageIds: number[], titles: string[]}> {
  const apiUrl = 'https://livret.uness.fr/lisa/2025/api.php';
  const pageIds: number[] = [];
  const titles: string[] = [];
  
  let cmcontinue = '';
  let attempts = 0;
  const maxAttempts = 10;

  do {
    if (attempts++ > maxAttempts) break;
    
    const paginationParam = cmcontinue ? `&cmcontinue=${encodeURIComponent(cmcontinue)}` : '';
    const url = `${apiUrl}?action=query&list=categorymembers&cmtitle=Catégorie:Objectif_de_connaissance&cmlimit=500&format=json${paginationParam}`;
    
    const response = await fetch(url, {
      headers: {
        'Cookie': authCookies,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(`API Error: ${data.error.info}`);
    }

    if (data.query?.categorymembers) {
      data.query.categorymembers.forEach((member: any) => {
        pageIds.push(member.pageid);
        titles.push(member.title);
      });
    }

    cmcontinue = data.continue?.cmcontinue || '';
  } while (cmcontinue);

  return { pageIds, titles };
}

export async function getPageContent(pageIds: number[], authCookies: string): Promise<any[]> {
  const apiUrl = 'https://livret.uness.fr/lisa/2025/api.php';
  const idsString = pageIds.join('|');
  
  const url = `${apiUrl}?action=query&pageids=${idsString}&prop=revisions&rvprop=content&format=json`;
  
  const response = await fetch(url, {
    headers: {
      'Cookie': authCookies,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  });

  const data = await response.json();
  
  if (data.error) {
    throw new Error(`API Error: ${data.error.info}`);
  }

  const pages = [];
  if (data.query?.pages) {
    for (const pageId in data.query.pages) {
      const page = data.query.pages[pageId];
      if (page.revisions && page.revisions[0]) {
        pages.push({
          pageid: page.pageid,
          title: page.title,
          revisions: page.revisions
        });
      }
    }
  }

  return pages;
}