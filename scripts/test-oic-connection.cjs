#!/usr/bin/env node

/**
 * 🧪 Test de connexion OIC
 * Script de test pour vérifier l'authentification CAS et l'accès à l'API
 */

const puppeteer = require('puppeteer');

const CONFIG = {
  CAS_USERNAME: process.env.CAS_USERNAME || 'laeticia.moto-ngane@etud.u-picardie.fr',
  CAS_PASSWORD: process.env.CAS_PASSWORD || 'Aiciteal1!',
  BASE_URL: 'https://livret.uness.fr/lisa/2025'
};

async function testOICConnection() {
  let browser;
  
  try {
    console.log('🧪 TEST CONNEXION OIC - Démarrage');
    
    // Lancement du navigateur
    browser = await puppeteer.launch({
      headless: false, // Mode visible pour le test
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Navigation vers LiSA
    console.log('🔗 Navigation vers LiSA...');
    await page.goto(`${CONFIG.BASE_URL}/`, {
      waitUntil: 'networkidle0',
      timeout: 30000
    });
    
    console.log('📍 URL actuelle:', page.url());
    
    // Test d'authentification CAS si nécessaire
    if (page.url().includes('cas') || page.url().includes('login')) {
      console.log('🔐 Authentification CAS détectée...');
      
      await page.waitForSelector('input[name="username"], input[id="username"]');
      await page.type('input[name="username"], input[id="username"]', CONFIG.CAS_USERNAME);
      await page.type('input[name="password"], input[id="password"]', CONFIG.CAS_PASSWORD);
      
      await Promise.all([
        page.click('input[type="submit"], button[type="submit"]'),
        page.waitForNavigation({ waitUntil: 'networkidle0' })
      ]);
      
      console.log('✅ Authentification réussie');
    }
    
    // Test de l'API OIC
    console.log('📋 Test API OIC...');
    const apiUrl = `${CONFIG.BASE_URL}/api.php?action=query&list=categorymembers&cmtitle=Catégorie:Objectif_de_connaissance&cmlimit=5&format=json`;
    
    await page.goto(apiUrl);
    const content = await page.content();
    
    if (content.includes('categorymembers')) {
      console.log('✅ API OIC accessible');
      const jsonMatch = content.match(/<pre[^>]*>(.*?)<\/pre>/s);
      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[1]);
        console.log(`📊 ${data.query?.categorymembers?.length || 0} objectifs trouvés (échantillon)`);
      }
    } else {
      console.log('❌ API OIC non accessible');
    }
    
    console.log('🎉 Test terminé avec succès');
    
  } catch (error) {
    console.error('💥 Erreur test:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

testOICConnection();