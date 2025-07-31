// 🎯 Script corrigé - Test OIC avec injection réelle des cookies CAS
// Ce script montre la différence entre les appels avec et sans cookies

import { getCASCookies, validateCASCookies, fetchWithCASCookies, testOICAccess } from '@/utils/getCASCookies';

/**
 * Test complet d'accès OIC avec authentification CAS réelle
 * ATTENTION: Ce script injecte VRAIMENT les cookies dans les requêtes API
 */
export async function testOICAccessWithRealCAS(): Promise<{
  success: boolean;
  withoutAuth: { accessible: boolean; count: number };
  withAuth: { accessible: boolean; count: number; cookies?: string };
  improvement: number;
  error?: string;
  nextSteps?: string[];
}> {
  console.log('🧪 TEST COMPLET - Accès OIC avec authentification CAS réelle');
  console.log('=' .repeat(60));
  
  try {
    // ÉTAPE 1: Test SANS authentification (base de référence)
    console.log('\n📊 ÉTAPE 1: Test sans authentification CAS');
    const withoutAuthResult = await testOICAccess(); // Pas de cookies
    
    console.log(`📋 Résultat SANS auth: ${withoutAuthResult.count} pages`);
    console.log(`✅ Accessible: ${withoutAuthResult.accessible}`);
    
    // ÉTAPE 2: Obtenir les cookies CAS
    console.log('\n🔐 ÉTAPE 2: Obtention des cookies CAS');
    const casResult = await getCASCookies();
    
    if (!casResult.success) {
      console.log('❌ Échec obtention cookies CAS');
      console.log('🔍 Raison:', casResult.error);
      
      if (casResult.needsManualAuth) {
        return {
          success: false,
          withoutAuth: withoutAuthResult,
          withAuth: { accessible: false, count: 0 },
          improvement: 0,
          error: 'Authentification CAS manuelle requise',
          nextSteps: [
            '1. Exécuter: node generate-cas-cookie.js',
            '2. Copier les cookies obtenus',
            '3. Les valider avec validateCASCookies()',
            '4. Relancer l\'extraction avec les cookies valides'
          ]
        };
      }
      
      throw new Error(casResult.error || 'Échec authentification CAS');
    }
    
    console.log('✅ Cookies CAS obtenus');
    const cookies = casResult.cookies || '';
    
    // ÉTAPE 3: Test AVEC authentification CAS
    console.log('\n🍪 ÉTAPE 3: Test avec cookies CAS injectés');
    const withAuthResult = await testOICAccess(cookies);
    
    console.log(`📋 Résultat AVEC auth: ${withAuthResult.count} pages`);
    console.log(`✅ Accessible: ${withAuthResult.accessible}`);
    
    // ÉTAPE 4: Comparaison et analyse
    const improvement = withAuthResult.count - withoutAuthResult.count;
    console.log('\n📈 COMPARAISON:');
    console.log(`   Sans auth: ${withoutAuthResult.count} pages`);
    console.log(`   Avec auth: ${withAuthResult.count} pages`);
    console.log(`   Amélioration: +${improvement} pages`);
    
    if (improvement > 0) {
      console.log('🎉 SUCCÈS - L\'authentification CAS améliore l\'accès !');
      console.log('🚀 Prêt pour l\'extraction complète des compétences OIC');
      
      return {
        success: true,
        withoutAuth: withoutAuthResult,
        withAuth: { ...withAuthResult, cookies },
        improvement,
        nextSteps: [
          '1. Cookies CAS validés et fonctionnels',
          '2. Lancer l\'extraction complète avec ces cookies',
          '3. Extraire les ~4,872 compétences OIC avec authentification'
        ]
      };
    } else if (withAuthResult.count > 0) {
      console.log('ℹ️  Accès possible sans authentification CAS');
      
      return {
        success: true,
        withoutAuth: withoutAuthResult,
        withAuth: withAuthResult,
        improvement: 0,
        nextSteps: [
          '1. L\'API semble accessible publiquement',
          '2. Lancer l\'extraction directement sans cookies',
          '3. Surveiller si l\'authentification devient nécessaire'
        ]
      };
    } else {
      console.log('❌ Authentification CAS inefficace');
      
      return {
        success: false,
        withoutAuth: withoutAuthResult,
        withAuth: withAuthResult,
        improvement: 0,
        error: 'Les cookies CAS n\'améliorent pas l\'accès',
        nextSteps: [
          '1. Vérifier la validité des cookies CAS',
          '2. Tester manuellement dans le navigateur',
          '3. Régénérer les cookies avec Puppeteer'
        ]
      };
    }
    
  } catch (error: any) {
    console.error('💥 Erreur test complet:', error);
    
    return {
      success: false,
      withoutAuth: { accessible: false, count: 0 },
      withAuth: { accessible: false, count: 0 },
      improvement: 0,
      error: error.message,
      nextSteps: [
        '1. Vérifier la connectivité réseau',
        '2. Tester l\'API manuellement',
        '3. Valider les credentials CAS'
      ]
    };
  }
}

/**
 * Exemple d'utilisation correcte avec injection de cookies
 */
export async function extractOICWithCASCookies(cookies: string, limit: number = 50): Promise<{
  success: boolean;
  pages: any[];
  totalFound: number;
  error?: string;
}> {
  console.log(`🔄 Extraction OIC avec cookies CAS (limit: ${limit})`);
  
  try {
    // REQUÊTE AVEC COOKIES INJECTÉS
    const apiUrl = `https://livret.uness.fr/lisa/2025/api.php?action=query&list=categorymembers&cmtitle=Catégorie:Objectif_de_connaissance&cmlimit=${limit}&format=json&origin=*`;
    
    console.log('🌐 Appel API avec cookies...');
    const response = await fetchWithCASCookies(cookies, apiUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    const pages = data.query?.categorymembers || [];
    
    console.log(`✅ ${pages.length} pages extraites avec succès`);
    
    // Extraire quelques exemples
    const examples = pages.slice(0, 5).map((page: any) => ({
      title: page.title,
      pageid: page.pageid,
      url: `https://livret.uness.fr/lisa/2025/${encodeURIComponent(page.title)}`
    }));
    
    console.log('📋 Exemples extraits:');
    examples.forEach((page, i) => {
      console.log(`   ${i+1}. ${page.title} (ID: ${page.pageid})`);
    });
    
    return {
      success: true,
      pages,
      totalFound: pages.length,
    };
    
  } catch (error: any) {
    console.error('❌ Erreur extraction:', error);
    
    return {
      success: false,
      pages: [],
      totalFound: 0,
      error: error.message
    };
  }
}

// Export pour utilisation directe
export default testOICAccessWithRealCAS;