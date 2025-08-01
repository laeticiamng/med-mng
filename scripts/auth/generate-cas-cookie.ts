import puppeteer from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';

interface CASAuthResult {
  success: boolean;
  cookies: string;
  error?: string;
  debugInfo?: any;
}

export async function generateCASCookie(email: string, password: string): Promise<CASAuthResult> {
  let browser: any = null;
  
  try {
    console.log('🔐 Démarrage de l\'authentification CAS avec Puppeteer...');
    
    // Configuration Puppeteer pour GitHub Actions
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ]
    });

    const page = await browser.newPage();
    
    // Configuration de la page
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    await page.setViewport({ width: 1366, height: 768 });

    console.log('🌐 Navigation vers la page CAS UNESS...');
    const service = encodeURIComponent('https://livret.uness.fr/login/cas');
    const casUrl = `https://auth.uness.fr/cas/login?service=${service}`;
    
    await page.goto(casUrl, { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });

    console.log('📧 Étape 1: Saisie de l\'email...');
    
    try {
      // Attendre que la page soit complètement chargée avec timeout étendu
      console.log('⏳ Attente chargement complet de la page...');
      await page.waitForTimeout(3000);
      
      // Sélecteurs étendus pour plus de robustesse
      console.log('🔍 Recherche champ email avec sélecteurs étendus...');
      await page.waitForSelector('form input, input[type="email"], input[name="username"], #username', { timeout: 20000 });
      
      const emailInput = await page.$('input[type="email"], input[name="username"], #username, form input[type="text"], form input:first-of-type');
      if (emailInput) {
        console.log('✅ Champ email trouvé, saisie en cours...');
        await emailInput.type(email);
      } else {
        // Sauvegarde HTML pour debug
        console.log('💾 Sauvegarde HTML pour debug (email)...');
        const debugHtml = await page.content();
        await fs.promises.writeFile('.cache/cas-debug-email.html', debugHtml);
        throw new Error("❌ Champ email introuvable dans la page CAS UNESS");
      }

      // Chercher et cliquer sur le bouton de soumission avec sélecteurs étendus
      console.log('🔍 Recherche bouton de soumission...');
      const submitBtn = await page.$('button[type="submit"], input[type="submit"], .btn-primary, button.btn, .submit-btn');
      if (submitBtn) {
        console.log('➡️  Soumission étape 1 (email)...');
        await Promise.all([
          page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 20000 }),
          submitBtn.click()
        ]);
      } else {
        console.log('⚠️  Aucun bouton submit trouvé, tentative avec Enter...');
        await emailInput.press('Enter');
        await page.waitForTimeout(2000);
      }
    } catch (error) {
      // En cas d'erreur sur l'étape email, sauvegarder le HTML
      console.log('💾 Sauvegarde HTML d\'erreur (étape email)...');
      const debugHtml = await page.content();
      await fs.promises.writeFile('.cache/cas-debug-email-error.html', debugHtml);
      throw error;
    }

    console.log('🔑 Étape 2: Saisie du mot de passe...');
    
    try {
      // Attendre la page de mot de passe avec timeout étendu
      console.log('🔍 Recherche champ mot de passe avec sélecteurs étendus...');
      await page.waitForSelector('input[type="password"], input[name="password"], #password, form input[type="password"]', { timeout: 20000 });
      
      const passwordInput = await page.$('input[type="password"], input[name="password"], #password, form input[type="password"]');
      if (passwordInput) {
        console.log('✅ Champ mot de passe trouvé, saisie en cours...');
        await passwordInput.type(password);
      } else {
        // Sauvegarde HTML pour debug
        console.log('💾 Sauvegarde HTML pour debug (password)...');
        const debugHtml = await page.content();
        await fs.promises.writeFile('.cache/cas-debug-password.html', debugHtml);
        throw new Error("❌ Champ mot de passe introuvable dans la page CAS UNESS");
      }

      // Soumettre le formulaire de mot de passe avec sélecteurs étendus
      console.log('🔍 Recherche bouton de soumission (password)...');
      const passwordSubmitBtn = await page.$('button[type="submit"], input[type="submit"], .btn-primary, button.btn, .submit-btn');
      if (passwordSubmitBtn) {
        console.log('➡️  Soumission étape 2 (password)...');
        await Promise.all([
          page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 20000 }),
          passwordSubmitBtn.click()
        ]);
      } else {
        console.log('⚠️  Aucun bouton submit trouvé, tentative avec Enter...');
        await passwordInput.press('Enter');
        await page.waitForTimeout(2000);
      }
    } catch (error) {
      // En cas d'erreur sur l'étape password, sauvegarder le HTML
      console.log('💾 Sauvegarde HTML d\'erreur (étape password)...');
      const debugHtml = await page.content();
      await fs.promises.writeFile('.cache/cas-debug-password-error.html', debugHtml);
      throw error;
    }

    console.log('🎫 Étape 3: Validation et récupération des cookies...');
    
    // Attendre que l'authentification soit complète
    await page.waitForTimeout(3000);
    
    const currentUrl = page.url();
    console.log(`📍 URL finale: ${currentUrl}`);
    
    // Vérifier que nous ne sommes pas sur une page d'erreur
    if (currentUrl.includes('login') || currentUrl.includes('error')) {
      const pageContent = await page.content();
      const hasError = pageContent.includes('error') || pageContent.includes('échec') || pageContent.includes('invalid');
      
      if (hasError) {
        throw new Error('Authentification échouée - identifiants incorrects ou page d\'erreur');
      }
    }

    // Récupérer tous les cookies du domaine
    const cookies = await page.cookies();
    console.log(`🍪 ${cookies.length} cookies récupérés`);
    
    // Formater les cookies pour les requêtes HTTP
    const cookieString = cookies
      .map(cookie => `${cookie.name}=${cookie.value}`)
      .join('; ');

    console.log('✅ Authentification CAS réussie avec Puppeteer');
    
    return {
      success: true,
      cookies: cookieString,
      debugInfo: {
        url_final: currentUrl,
        cookies_count: cookies.length,
        timestamp: new Date().toISOString()
      }
    };

  } catch (error) {
    console.error('❌ Erreur authentification CAS:', error);
    return {
      success: false,
      cookies: '',
      error: error.message,
      debugInfo: {
        error_type: error.name,
        timestamp: new Date().toISOString()
      }
    };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Fonction utilitaire pour sauvegarder les cookies
export async function saveCookiesToFile(cookies: string, filePath: string = '.cache/cookies.txt'): Promise<void> {
  const dir = path.dirname(filePath);
  
  // Créer le dossier .cache s'il n'existe pas
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  // Sauvegarder avec timestamp
  const data = {
    cookies,
    timestamp: new Date().toISOString(),
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24h
  };
  
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`💾 Cookies sauvegardés dans ${filePath}`);
}

// Script principal si exécuté directement
async function main() {
  const email = process.env.CAS_USERNAME || process.env.CAS_USER;
  const password = process.env.CAS_PASSWORD || process.env.CAS_PASS;
  
  // Créer le dossier .cache/ en premier
  if (!fs.existsSync('.cache')) {
    fs.mkdirSync('.cache', { recursive: true });
    console.log('📁 Dossier .cache créé');
  }

  if (!email || !password) {
    console.error('❌ Variables d\'environnement CAS_USERNAME et CAS_PASSWORD requises');
    // Écrire un fichier d'erreur pour debug
    fs.writeFileSync('.cache/auth-error.log', 'Variables CAS_USERNAME et CAS_PASSWORD manquantes');
    process.exit(1);
  }

  try {
    const result = await generateCASCookie(email, password);
    if (result.success) {
      await saveCookiesToFile(result.cookies);
      console.log('🎉 Authentification CAS terminée avec succès');
    } else {
      console.error('💥 Échec authentification:', result.error);
      // Écrire le détail de l'erreur pour debug
      fs.writeFileSync('.cache/auth-error.log', `Erreur auth: ${result.error}\nDebug: ${JSON.stringify(result.debugInfo, null, 2)}`);
      process.exit(1);
    }
  } catch (error: any) {
    console.error('💥 Erreur fatale:', error);
    // Écrire l'erreur fatale pour debug
    fs.writeFileSync('.cache/auth-fatal-error.log', `Erreur fatale: ${error.message}\nStack: ${error.stack}`);
    process.exit(1);
  }
}

// Exécuter si script principal
if (require.main === module) {
  main();
}