// utils/listAllPageIds.js
// Fonction de pagination complète pour récupérer TOUS les IDs de pages OIC

const API_ROOT = 'https://livret.uness.fr/lisa/2025';

export async function listAllPageIds(cookieStr) {
  const ids = [];
  const cat = encodeURIComponent('Catégorie:Objectif_de_connaissance');
  let cont = '';
  let pageCount = 0;
  
  console.log('[PAGINATION] 🔄 Début récupération complète des IDs...');
  
  do {
    const url = `${API_ROOT}/api.php?action=query&list=categorymembers&cmtitle=${cat}&cmlimit=500&format=json${cont ? '&' + cont : ''}`;
    
    console.log(`[PAGINATION] 📄 Lot ${++pageCount} - URL: ${url.substring(0, 100)}...`);
    
    try {
      const response = await fetch(url, {
        headers: { 
          Cookie: cookieStr,
          'User-Agent': 'Mozilla/5.0 (compatible; OIC-Extractor/2.0)'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const j = await response.json();
      
      if (j.error) {
        throw new Error(`API Error: ${j.error.code} - ${j.error.info}`);
      }
      
      if (!j.query?.categorymembers) {
        console.log('[PAGINATION] ⚠️ Pas de categorymembers dans la réponse');
        break;
      }
      
      const currentBatch = j.query.categorymembers.map(p => p.pageid);
      ids.push(...currentBatch);
      
      console.log(`[PAGINATION] ✅ Lot ${pageCount}: ${currentBatch.length} IDs récupérés (total: ${ids.length})`);
      
      // Préparer la continuation
      if (j.continue?.cmcontinue) {
        cont = `cmcontinue=${encodeURIComponent(j.continue.cmcontinue)}`;
        console.log(`[PAGINATION] 🔄 Continuation: ${cont.substring(0, 50)}...`);
      } else {
        cont = '';
        console.log(`[PAGINATION] 🏁 Fin de pagination atteinte`);
      }
      
    } catch (error) {
      console.error(`[PAGINATION] ❌ Erreur lot ${pageCount}: ${error.message}`);
      throw error;
    }
    
    // Délai de courtoisie entre les requêtes
    if (cont) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
  } while (cont && pageCount < 20); // Sécurité : max 20 lots = 10000 pages
  
  console.log(`[PAGINATION] 🎉 Récupération terminée: ${ids.length} IDs au total en ${pageCount} lots`);
  
  if (pageCount >= 20) {
    console.log(`[PAGINATION] ⚠️ Limite de sécurité atteinte (20 lots max)`);
  }
  
  return ids;
}