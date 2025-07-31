import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { username, password } = await req.json();
    
    if (!username || !password) {
      return new Response(
        JSON.stringify({ error: 'Username et password requis' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('🚀 Génération cookie CAS pour:', username);

    // Utiliser Puppeteer avec Deno
    const puppeteerUrl = "https://deno.land/x/puppeteer@16.2.0/mod.ts";
    const { default: puppeteer } = await import(puppeteerUrl);

    console.log('📦 Lancement navigateur...');
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    
    // Configurer user agent
    await page.setUserAgent('Mozilla/5.0 (compatible; Supabase-CAS-Bot/1.0)');
    
    console.log('🔐 Accès page CAS...');
    await page.goto('https://cas.uness.fr/cas/login?service=https://livret.uness.fr/lisa/2025/', {
      waitUntil: 'networkidle2'
    });

    // Remplir formulaire
    console.log('📝 Remplissage formulaire...');
    await page.type('#username', username);
    await page.type('#password', password);
    
    // Soumettre
    console.log('✅ Soumission...');
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle2' }),
      page.click('input[type="submit"]')
    ]);

    // Récupérer cookies
    console.log('🍪 Récupération cookies...');
    const cookies = await page.cookies();
    
    // Fermer navigateur
    await browser.close();

    // Formater cookie pour l'API
    const cookieString = cookies
      .map(cookie => `${cookie.name}=${cookie.value}`)
      .join('; ');

    console.log('🧪 Test cookie...');
    
    // Tester le cookie
    const testResponse = await fetch(
      'https://livret.uness.fr/lisa/2025/api.php?action=query&list=categorymembers&cmtitle=Catégorie:Objectif_de_connaissance&cmlimit=5&format=json',
      {
        headers: {
          'Cookie': cookieString,
          'User-Agent': 'Mozilla/5.0 (compatible; Supabase-CAS-Bot/1.0)'
        }
      }
    );

    const testData = await testResponse.json();
    const isValid = testData.query?.categorymembers?.length > 0;

    console.log(`${isValid ? '✅' : '❌'} Cookie ${isValid ? 'valide' : 'invalide'}`);

    if (!isValid) {
      return new Response(
        JSON.stringify({ 
          error: 'Authentification échouée',
          details: testData 
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        cookie: cookieString,
        testResult: {
          valid: isValid,
          sampleCount: testData.query.categorymembers.length
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Erreur génération cookie:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Erreur interne',
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});