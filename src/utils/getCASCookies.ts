// 🍪 Générateur de cookies CAS pour authentification UNESS
// Utilise l'Edge Function Supabase pour gérer l'auth CAS

import { supabase } from '@/integrations/supabase/client';
import { CASCookiesResult } from '@/types/cas';

/**
 * Obtient les cookies CAS valides pour l'authentification UNESS
 * 
 * @returns Promise<CASCookiesResult>
 */
export async function getCASCookies(): Promise<CASCookiesResult> {
  console.log('🔐 Récupération cookies CAS...');
  
  try {
    // Appeler l'Edge Function pour l'authentification CAS
    const { data, error } = await supabase.functions.invoke('cas-auth-puppeteer', {
      body: { 
        action: 'authenticate',
        testOnly: false 
      }
    });
    
    if (error) {
      console.error('❌ Erreur Edge Function:', error);
      return {
        success: false,
        error: `Erreur Edge Function: ${error.message}`
      };
    }
    
    console.log('📊 Réponse CAS:', data);
    
    if (data.success && data.cookies && data.cookies !== 'not_required') {
      console.log('✅ Cookies CAS obtenus');
      return {
        success: true,
        cookies: data.cookies
      };
    }
    
    if (data.success && data.cookies === 'not_required') {
      console.log('✅ Accès direct possible (pas de CAS requis)');
      return {
        success: true,
        cookies: '' // Pas de cookies nécessaires
      };
    }
    
    // Authentification manuelle requise
    console.log('🔄 Authentification CAS manuelle requise');
    return {
      success: false,
      needsManualAuth: true,
      casUrl: data.cas_url,
      instructions: data.instructions,
      error: data.error || 'Authentification CAS manuelle requise'
    };
    
  } catch (error: unknown) {
    console.error('💥 Erreur getCASCookies:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue lors de l\'obtention des cookies CAS';
    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * Valide des cookies CAS existants
 * 
 * @param cookies - Chaîne de cookies à valider
 * @returns Promise<CASCookiesResult>
 */
export async function validateCASCookies(cookies: string): Promise<CASCookiesResult> {
  console.log('🔍 Validation cookies CAS...');
  
  if (!cookies || cookies.trim().length === 0) {
    return {
      success: false,
      error: 'Cookies vides ou non fournis'
    };
  }
  
  try {
    const { data, error } = await supabase.functions.invoke('cas-auth-puppeteer', {
      body: { 
        action: 'validate_cookies',
        cookies: cookies.trim()
      }
    });
    
    if (error) {
      console.error('❌ Erreur validation:', error);
      return {
        success: false,
        error: `Erreur validation: ${error.message}`
      };
    }
    
    console.log('📊 Résultat validation:', data);
    
    if (data.success && data.valid) {
      console.log(`✅ Cookies valides - ${data.pages_accessible} pages accessibles`);
      return {
        success: true,
        cookies: cookies.trim()
      };
    } else {
      console.log('❌ Cookies invalides ou expirés');
      return {
        success: false,
        error: data.error || 'Cookies invalides ou expirés'
      };
    }
    
  } catch (error: unknown) {
    console.error('💥 Erreur validateCASCookies:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erreur validation cookies';
    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * Utilise les cookies CAS pour faire une requête authentifiée à l'API LiSA
 * 
 * @param cookies - Cookies CAS valides
 * @param endpoint - Point de terminaison API à appeler
 * @returns Promise<Response>
 */
export async function fetchWithCASCookies(
  cookies: string, 
  endpoint: string
): Promise<Response> {
  console.log(`🌐 Requête avec cookies CAS: ${endpoint}`);
  
  const headers: HeadersInit = {
    'User-Agent': 'Mozilla/5.0 (compatible; OIC-Extractor/1.0)',
    'Accept': 'application/json',
    'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
    'Cache-Control': 'no-cache'
  };
  
  // Ajouter les cookies si fournis
  if (cookies && cookies.trim().length > 0) {
    headers['Cookie'] = cookies.trim();
  }
  
  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers,
      credentials: 'include'
    });
    
    console.log(`📊 Réponse ${endpoint}: ${response.status}`);
    return response;
    
  } catch (error) {
    console.error(`❌ Erreur requête ${endpoint}:`, error);
    throw error;
  }
}

/**
 * Test rapide d'accès aux compétences OIC avec cookies
 * 
 * @param cookies - Cookies CAS (optionnel)
 * @returns Promise<{accessible: boolean, count: number, error?: string}>
 */
export async function testOICAccess(cookies?: string) {
  console.log('🧪 Test d\'accès aux compétences OIC...');
  
  const testUrl = 'https://livret.uness.fr/lisa/2025/api.php?action=query&list=categorymembers&cmtitle=Catégorie:Objectif_de_connaissance&cmlimit=10&format=json&origin=*';
  
  try {
    const response = await fetchWithCASCookies(cookies || '', testUrl);
    
    if (!response.ok) {
      return {
        accessible: false,
        count: 0,
        error: `HTTP ${response.status}: ${response.statusText}`
      };
    }
    
    const data = await response.json();
    const pages = data.query?.categorymembers || [];
    
    console.log(`📊 ${pages.length} compétences OIC trouvées`);
    
    return {
      accessible: pages.length > 0,
      count: pages.length,
      error: pages.length === 0 ? 'Aucune compétence trouvée - authentification probablement requise' : undefined
    };
    
  } catch (error: unknown) {
    console.error('❌ Erreur test OIC:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    return {
      accessible: false,
      count: 0,
      error: errorMessage
    };
  }
}

// Export pour compatibilité
export default getCASCookies;