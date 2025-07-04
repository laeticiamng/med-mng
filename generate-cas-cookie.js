// 🔐 GÉNÉRATEUR DE COOKIES CAS - Authentification UNESS
const puppeteer = require('puppeteer');
const fs = require('fs/promises');

const CAS_USERNAME = process.env.CAS_USERNAME || 'laeticia.moto-ngane@etud.u-picardie.fr';
const CAS_PASSWORD = process.env.CAS_PASSWORD || 'Aiciteal1!';

async function generateCASCookie() {
  console.log('🔐 Génération cookie CAS avec Puppeteer...');
  console.log(`🔑 Utilisateur: ${CAS_USERNAME}`);
  
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-web-security'
      ]
    });
    
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    console.log('🌐 Navigation vers page protégée...');
    await page.goto('https://livret.uness.fr/lisa/2025/Catégorie:Objectif_de_connaissance', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    const currentUrl = page.url();
    console.log(`📍 URL actuelle: ${currentUrl}`);
    
    if (currentUrl.includes('auth.uness.fr/cas/login')) {
      console.log('🔑 Formulaire CAS détecté');
      
      // Attendre et remplir le formulaire
      await page.waitForSelector('#username', { visible: true, timeout: 10000 });
      await page.waitForSelector('#password', { visible: true, timeout: 10000 });
      
      console.log('📝 Saisie des identifiants...');
      await page.type('#username', CAS_USERNAME);
      await page.type('#password', CAS_PASSWORD);
      
      // Chercher le bouton de connexion
      const submitButton = await page.$('input[name="submit"], input[type="submit"], button[type="submit"]');
      if (submitButton) {
        console.log('🔘 Clic sur le bouton de connexion...');
        await Promise.all([
          page.waitForNavigation({ timeout: 30000 }),
          submitButton.click()
        ]);
      } else {
        throw new Error('Bouton de connexion non trouvé');
      }
      
      console.log('⏳ Attente redirection post-authentification...');
      await page.waitForFunction(
        () => window.location.href.includes('livret.uness.fr'),
        { timeout: 30000 }
      );
      
      console.log('✅ Authentification CAS réussie');
    } else if (currentUrl.includes('livret.uness.fr')) {
      console.log('✅ Déjà authentifié ou pas de redirection CAS');
    } else {
      console.warn(`⚠️  URL inattendue: ${currentUrl}`);
    }
    
    // Récupérer tous les cookies
    const cookies = await page.cookies();
    console.log(`🍪 ${cookies.length} cookies récupérés`);
    
    // Filtrer et formater les cookies UNESS
    const unessCookies = cookies
      .filter(cookie => cookie.domain.includes('uness.fr'))
      .map(cookie => `${cookie.name}=${cookie.value}`)
      .join('; ');
    
    if (unessCookies.length > 0) {
      console.log(`✅ Cookies UNESS: ${unessCookies.length} caractères`);
      console.log('🍪 Cookies détaillés:');
      cookies
        .filter(cookie => cookie.domain.includes('uness.fr'))
        .forEach(cookie => {
          console.log(`   ${cookie.name}: ${cookie.value.substring(0, 30)}...`);
        });
      
      // Sauvegarder dans un fichier
      await fs.writeFile('.cookie', unessCookies);
      console.log('💾 Cookie sauvegardé dans .cookie');
      
      return unessCookies;
    } else {
      throw new Error('Aucun cookie UNESS récupéré');
    }
    
  } catch (error) {
    console.error('❌ Erreur génération cookie:', error.message);
    console.error('📊 Stack:', error.stack);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

async function testWithCookie() {
  console.log('\n🧪 TEST AVEC COOKIE CAS');
  
  try {
    // Lire le cookie
    const cookieHeader = await fs.readFile('.cookie', 'utf8');
    console.log(`🍪 Cookie lu: ${cookieHeader.substring(0, 100)}...`);
    
    // Test API avec cookie
    const response = await fetch('https://livret.uness.fr/lisa/2025/api.php?action=query&list=categorymembers&cmtitle=Catégorie%3AObjectif_de_connaissance&cmlimit=3&format=json&origin=*', {
      headers: {
        'Cookie': cookieHeader,
        'User-Agent': 'Mozilla/5.0 (compatible; OIC-Test/1.0)',
        'Accept': 'application/json'
      }
    });
    
    console.log(`📊 Status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      const members = data.query?.categorymembers || [];
      console.log(`✅ ${members.length} membres trouvés avec cookie`);
      
      members.forEach((member, i) => {
        console.log(`   ${i+1}. ${member.title} (ID: ${member.pageid})`);
      });
      
      return { success: true, count: members.length, members };
    } else {
      const text = await response.text();
      console.log(`❌ Erreur avec cookie: ${text.substring(0, 200)}`);
      return { success: false, error: text };
    }
  } catch (error) {
    console.log(`💥 Exception test cookie: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function main() {
  try {
    console.log('🚀 GÉNÉRATION ET TEST COOKIE CAS');
    console.log('=' .repeat(50));
    
    // Générer le cookie
    const cookie = await generateCASCookie();
    
    // Tester avec le cookie
    const testResult = await testWithCookie();
    
    console.log('\n' + '=' .repeat(50));
    console.log('📊 RÉSULTATS');
    console.log('=' .repeat(50));
    
    if (testResult.success && testResult.count > 0) {
      console.log('✅ Cookie CAS fonctionnel');
      console.log(`✅ ${testResult.count} compétences accessibles`);
      console.log('🎯 Prêt pour extraction par batch');
    } else {
      console.log('❌ Cookie CAS non fonctionnel');
      console.log('🔍 Vérifier identifiants et processus auth');
    }
    
  } catch (error) {
    console.error('💥 Erreur critique:', error);
    process.exit(1);
  }
}

// Lancer si script appelé directement
if (require.main === module) {
  main();
}

module.exports = { generateCASCookie, testWithCookie };