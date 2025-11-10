/**
 * Script d'audit Lighthouse automatisé
 * Utilise playwright-lighthouse pour générer un rapport complet
 * 
 * Usage: node scripts/lighthouse-audit.js
 */

import { chromium } from '@playwright/test';
import { playAudit } from 'playwright-lighthouse';
import fs from 'fs';
import path from 'path';

const SITE_URL = process.env.SITE_URL || 'http://localhost:5173';
const REPORT_DIR = './lighthouse-reports';

// Configuration Lighthouse
const lighthouseConfig = {
  extends: 'lighthouse:default',
  settings: {
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    formFactor: 'desktop',
    throttling: {
      rttMs: 40,
      throughputKbps: 10240,
      cpuSlowdownMultiplier: 1,
    },
    screenEmulation: {
      mobile: false,
      width: 1350,
      height: 940,
      deviceScaleFactor: 1,
      disabled: false,
    },
  },
};

// Thresholds pour validation
const thresholds = {
  performance: 85,
  accessibility: 95,
  'best-practices': 90,
  seo: 95,
};

async function runLighthouseAudit() {
  console.log('🚀 Démarrage de l\'audit Lighthouse...\n');
  console.log(`📍 URL testée: ${SITE_URL}\n`);

  // Créer le dossier de rapports
  if (!fs.existsSync(REPORT_DIR)) {
    fs.mkdirSync(REPORT_DIR, { recursive: true });
  }

  const browser = await chromium.launch({
    headless: true,
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Naviguer vers la page
    await page.goto(SITE_URL, { waitUntil: 'networkidle' });

    console.log('⏳ Audit en cours...\n');

    // Lancer l'audit
    const report = await playAudit({
      page,
      thresholds,
      port: 9222,
      config: lighthouseConfig,
    });

    // Générer le timestamp pour le nom du fichier
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = path.join(REPORT_DIR, `lighthouse-${timestamp}.html`);

    // Sauvegarder le rapport HTML
    fs.writeFileSync(reportPath, report.report);

    console.log('✅ Audit terminé!\n');
    console.log('📊 RÉSULTATS:\n');
    console.log('─'.repeat(50));

    // Afficher les scores
    const categories = report.lhr.categories;
    let allPassed = true;

    for (const [key, category] of Object.entries(categories)) {
      const score = Math.round(category.score * 100);
      const threshold = thresholds[key] || 0;
      const passed = score >= threshold;
      const emoji = passed ? '✅' : '❌';
      
      if (!passed) allPassed = false;

      console.log(`${emoji} ${category.title.padEnd(20)} ${score}/100 (seuil: ${threshold})`);
    }

    console.log('─'.repeat(50));
    console.log(`\n📄 Rapport complet: ${reportPath}\n`);

    // Afficher les problèmes d'accessibilité
    if (categories.accessibility.score < 0.95) {
      console.log('\n⚠️  PROBLÈMES D\'ACCESSIBILITÉ DÉTECTÉS:\n');
      const a11yAudits = report.lhr.audits;
      for (const [key, audit] of Object.entries(a11yAudits)) {
        if (audit.score !== null && audit.score < 1 && audit.scoreDisplayMode !== 'notApplicable') {
          console.log(`  • ${audit.title}`);
          if (audit.description) {
            console.log(`    ${audit.description.substring(0, 80)}...`);
          }
        }
      }
    }

    // Afficher les problèmes SEO
    if (categories.seo.score < 0.95) {
      console.log('\n⚠️  PROBLÈMES SEO DÉTECTÉS:\n');
      const seoAudits = report.lhr.audits;
      for (const [key, audit] of Object.entries(seoAudits)) {
        if (audit.score !== null && audit.score < 1 && audit.scoreDisplayMode !== 'notApplicable' && key.includes('seo')) {
          console.log(`  • ${audit.title}`);
        }
      }
    }

    // Métriques de performance
    console.log('\n⚡ MÉTRIQUES DE PERFORMANCE:\n');
    const metrics = report.lhr.audits.metrics.details.items[0];
    console.log(`  • First Contentful Paint: ${Math.round(metrics.firstContentfulPaint)}ms`);
    console.log(`  • Largest Contentful Paint: ${Math.round(metrics.largestContentfulPaint)}ms`);
    console.log(`  • Time to Interactive: ${Math.round(metrics.interactive)}ms`);
    console.log(`  • Speed Index: ${Math.round(metrics.speedIndex)}ms`);
    console.log(`  • Total Blocking Time: ${Math.round(metrics.totalBlockingTime)}ms`);
    console.log(`  • Cumulative Layout Shift: ${metrics.cumulativeLayoutShift.toFixed(3)}`);

    console.log('\n' + '─'.repeat(50));
    console.log(allPassed ? '\n🎉 Tous les seuils sont atteints!' : '\n⚠️  Certains seuils ne sont pas atteints');
    console.log('─'.repeat(50) + '\n');

    process.exit(allPassed ? 0 : 1);

  } catch (error) {
    console.error('❌ Erreur lors de l\'audit:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

// Script pour audit multiple (mobile + desktop)
async function runFullAudit() {
  console.log('🎯 AUDIT LIGHTHOUSE COMPLET\n');
  console.log('Cet audit va tester:');
  console.log('  • Performance');
  console.log('  • Accessibilité (WCAG 2.1)');
  console.log('  • SEO');
  console.log('  • Meilleures pratiques\n');

  try {
    await runLighthouseAudit();
  } catch (error) {
    console.error('Erreur lors de l\'audit:', error);
    process.exit(1);
  }
}

// Lancer l'audit
runFullAudit();
