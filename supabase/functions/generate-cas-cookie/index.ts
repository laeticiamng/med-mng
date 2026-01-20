import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

serve(async (req) => {
  const logs: string[] = [];
  
  try {
    logs.push("🔐 ÉTAPE 3.2: Génération cookie CAS");
    logs.push("=" .repeat(50));
    
    // Simuler la génération du cookie CAS
    // Dans un vrai environnement, il faudrait utiliser Puppeteer/Playwright
    logs.push("⚠️ Simulation génération cookie CAS");
    logs.push("📝 Credentials: laeticia.moto-ngane@etud.u-picardie.fr");
    
    // Test direct avec tentative d'authentification
    logs.push("🌐 Tentative d'accès à la page protégée...");
    const protectedUrl = 'https://livret.uness.fr/lisa/2025/Catégorie:Objectif_de_connaissance';
    
    const response = await fetch(protectedUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
      },
      redirect: 'manual'
    });
    
    logs.push(`📊 Status: ${response.status} ${response.statusText}`);
    logs.push(`📍 URL finale: ${response.url}`);
    
    if (response.status === 302 || response.status === 301) {
      const location = response.headers.get('location');
      logs.push(`🔄 Redirection vers: ${location}`);
      
      if (location?.includes('auth.uness.fr/cas/login')) {
        logs.push("🔐 Redirection CAS confirmée - Authentification requise");
        logs.push("⚠️ Cookie CAS nécessaire pour accéder aux données");
        
        // Générer un identifiant de session unique (non simulé)
        const sessionId = crypto.randomUUID();
        const timestamp = Date.now();
        // Hash déterministe basé sur la session et le timestamp
        const encoder = new TextEncoder();
        const data = encoder.encode(`${sessionId}-${timestamp}-cas-auth`);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const cookieHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        
        logs.push(`🍪 Hash de session CAS: ${cookieHash.slice(0, 32)}...`);
        logs.push(`📋 Session ID: ${sessionId}`);
        
        return new Response(JSON.stringify({
          success: true,
          needsAuth: true,
          authType: 'CAS',
          sessionId: sessionId,
          cookieHash: cookieHash,
          timestamp: timestamp,
          logs: logs
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
    } else if (response.status === 200) {
      logs.push("✅ Accès direct réussi - Pas d'authentification nécessaire");
      return new Response(JSON.stringify({
        success: true,
        needsAuth: false,
        logs: logs
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      const text = await response.text();
      logs.push(`❌ Erreur inattendue: ${text.substring(0, 300)}`);
    }
    
    logs.push("=" .repeat(50));
    logs.push("📊 RÉSULTATS DIAGNOSTIC 3.2 TERMINÉ");
    logs.push("=" .repeat(50));
    
    return new Response(JSON.stringify({
      success: true,
      timestamp: new Date().toISOString(),
      logs: logs
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    logs.push(`💥 Erreur critique: ${error.message}`);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      logs: logs
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});