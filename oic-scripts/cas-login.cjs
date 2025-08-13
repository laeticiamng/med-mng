// oic-scripts/cas-login.cjs
// Module d'authentification CAS pour UNESS/LiSA
// Réutilisable par les différents scripts du projet

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const CACHE_DIR = path.join(__dirname, '.cache');
const COOKIE_CACHE_FILE = path.join(CACHE_DIR, 'cas-cookies.json');

// Créer le dossier cache s'il n'existe pas
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

async function casLogin({ http, jar }) {
  const username = process.env.CAS_USERNAME;
  const password = process.env.CAS_PASSWORD;
  
  if (!username || !password) {
    throw new Error('CAS_USERNAME et CAS_PASSWORD requis');
  }

  console.log('🔐 Authentification CAS UNESS...');

  try {
    // Charger les cookies depuis le cache si disponibles
    if (fs.existsSync(COOKIE_CACHE_FILE)) {
      try {
        const cachedCookies = JSON.parse(fs.readFileSync(COOKIE_CACHE_FILE, 'utf8'));
        if (cachedCookies.expires > Date.now()) {
          console.log('🍪 Utilisation cookies CAS en cache');
          for (const cookie of cachedCookies.cookies) {
            jar.setCookie(cookie.key + '=' + cookie.value, cookie.domain);
          }
          return;
        }
      } catch (e) {
        console.warn('Cache cookies invalide, réauthentification...');
      }
    }

    // Étape 1: Récupérer la page de login CAS
    const casLoginUrl = 'https://cas.uness.fr/cas/login';
    const loginPage = await http.get(casLoginUrl);
    
    // Extraire les champs cachés du formulaire
    const ltMatch = loginPage.data.match(/name="lt" value="([^"]+)"/);
    const executionMatch = loginPage.data.match(/name="execution" value="([^"]+)"/);
    
    if (!ltMatch || !executionMatch) {
      throw new Error('Impossible d\'extraire les tokens CAS');
    }

    // Étape 2: Soumettre les credentials
    const loginData = {
      username: username,
      password: password,
      lt: ltMatch[1],
      execution: executionMatch[1],
      _eventId: 'submit'
    };

    const authResponse = await http.post(casLoginUrl, loginData, {
      maxRedirects: 0,
      validateStatus: status => status >= 200 && status < 400
    });

    // Étape 3: Suivre la redirection vers LiSA si nécessaire
    if (authResponse.status === 302 && authResponse.headers.location) {
      await http.get(authResponse.headers.location);
    }

    // Étape 4: Tester l'accès à une page protégée LiSA
    const testUrl = 'https://livret.uness.fr/';
    const testResponse = await http.get(testUrl);
    
    if (testResponse.data.includes('Connexion') || testResponse.status === 401) {
      throw new Error('Échec authentification CAS - vérifiez les credentials');
    }

    // Étape 5: Sauvegarder les cookies en cache
    const cookiesToCache = {
      expires: Date.now() + (4 * 60 * 60 * 1000), // 4h de validité
      cookies: []
    };

    // Extraire les cookies du jar
    const cookies = jar.getCookies(casLoginUrl);
    for (const cookie of cookies) {
      cookiesToCache.cookies.push({
        key: cookie.key,
        value: cookie.value,
        domain: cookie.domain
      });
    }

    fs.writeFileSync(COOKIE_CACHE_FILE, JSON.stringify(cookiesToCache));
    console.log('✅ Authentification CAS réussie et mise en cache');

  } catch (error) {
    console.error('❌ Erreur authentification CAS:', error.message);
    throw error;
  }
}

module.exports = { casLogin };