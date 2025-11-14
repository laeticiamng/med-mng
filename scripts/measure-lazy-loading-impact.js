#!/usr/bin/env node

/**
 * Script de mesure d'impact du lazy loading sur les performances
 * Compare les Core Web Vitals avant/après l'implémentation du lazy loading
 * 
 * Usage: node scripts/measure-lazy-loading-impact.js
 */

const lighthouse = require('lighthouse');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const SITE_URL = 'http://localhost:5173/edn-complete';
const REPORT_DIR = path.join(process.cwd(), 'performance-reports');
const RUNS = 3; // Nombre de runs pour moyenne

const metricsToTrack = [
  'first-contentful-paint',
  'largest-contentful-paint',
  'total-blocking-time',
  'cumulative-layout-shift',
  'speed-index',
  'interactive',
  'max-potential-fid'
];

async function runLighthouseAudit(browser, runNumber) {
  console.log(`\n🔍 Run #${runNumber + 1}/${RUNS}...`);

  const options = {
    port: new URL(browser.wsEndpoint()).port,
    output: 'json',
    onlyCategories: ['performance'],
    formFactor: 'desktop',
    screenEmulation: {
      mobile: false,
      width: 1350,
      height: 940,
      deviceScaleFactor: 1,
      disabled: false,
    },
    throttling: {
      rttMs: 40,
      throughputKbps: 10240,
      cpuSlowdownMultiplier: 1,
    },
  };

  const runnerResult = await lighthouse(SITE_URL, options);
  return runnerResult.lhr;
}

function extractMetrics(lhr) {
  const metrics = {};
  
  metricsToTrack.forEach(metricId => {
    const audit = lhr.audits[metricId];
    if (audit) {
      metrics[metricId] = {
        value: audit.numericValue,
        score: audit.score,
        displayValue: audit.displayValue
      };
    }
  });

  metrics.performanceScore = lhr.categories.performance.score * 100;
  
  return metrics;
}

function calculateAverages(allMetrics) {
  const averages = {};
  const numRuns = allMetrics.length;

  metricsToTrack.forEach(metricId => {
    const values = allMetrics.map(m => m[metricId]?.value).filter(v => v != null);
    const scores = allMetrics.map(m => m[metricId]?.score).filter(s => s != null);
    
    if (values.length > 0) {
      averages[metricId] = {
        value: values.reduce((a, b) => a + b, 0) / values.length,
        score: scores.reduce((a, b) => a + b, 0) / scores.length
      };
    }
  });

  const perfScores = allMetrics.map(m => m.performanceScore);
  averages.performanceScore = perfScores.reduce((a, b) => a + b, 0) / numRuns;

  return averages;
}

function formatMetricValue(metricId, value) {
  if (metricId === 'cumulative-layout-shift') {
    return value.toFixed(3);
  }
  return `${Math.round(value)}ms`;
}

function generateReport(averages) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportPath = path.join(REPORT_DIR, `lazy-loading-impact-${timestamp}.md`);

  if (!fs.existsSync(REPORT_DIR)) {
    fs.mkdirSync(REPORT_DIR, { recursive: true });
  }

  const metricNames = {
    'first-contentful-paint': 'First Contentful Paint (FCP)',
    'largest-contentful-paint': 'Largest Contentful Paint (LCP)',
    'total-blocking-time': 'Total Blocking Time (TBT)',
    'cumulative-layout-shift': 'Cumulative Layout Shift (CLS)',
    'speed-index': 'Speed Index',
    'interactive': 'Time to Interactive (TTI)',
    'max-potential-fid': 'Max Potential FID'
  };

  let report = `# 🚀 Impact du Lazy Loading - /edn-complete\n\n`;
  report += `**Date**: ${new Date().toLocaleString('fr-FR')}\n`;
  report += `**Nombre de runs**: ${RUNS}\n`;
  report += `**URL testée**: ${SITE_URL}\n\n`;

  report += `## 📊 Résultats Moyens\n\n`;
  report += `### Performance Score Global\n`;
  report += `**Score**: ${averages.performanceScore.toFixed(1)}/100\n\n`;

  report += `### Core Web Vitals\n\n`;
  report += `| Métrique | Valeur | Score | Status |\n`;
  report += `|----------|--------|-------|--------|\n`;

  const coreVitals = [
    'first-contentful-paint',
    'largest-contentful-paint',
    'total-blocking-time',
    'cumulative-layout-shift'
  ];

  coreVitals.forEach(metricId => {
    const metric = averages[metricId];
    if (metric) {
      const status = metric.score >= 0.9 ? '✅' : metric.score >= 0.5 ? '⚠️' : '❌';
      report += `| ${metricNames[metricId]} | ${formatMetricValue(metricId, metric.value)} | ${(metric.score * 100).toFixed(0)}/100 | ${status} |\n`;
    }
  });

  report += `\n### Autres Métriques\n\n`;
  report += `| Métrique | Valeur | Score |\n`;
  report += `|----------|--------|-------|\n`;

  const otherMetrics = [
    'speed-index',
    'interactive',
    'max-potential-fid'
  ];

  otherMetrics.forEach(metricId => {
    const metric = averages[metricId];
    if (metric) {
      report += `| ${metricNames[metricId]} | ${formatMetricValue(metricId, metric.value)} | ${(metric.score * 100).toFixed(0)}/100 |\n`;
    }
  });

  report += `\n## 🎯 Recommandations\n\n`;

  if (averages.performanceScore < 90) {
    report += `⚠️ **Score de performance < 90** : Optimisations supplémentaires recommandées\n\n`;
  }

  if (averages['largest-contentful-paint']?.value > 2500) {
    report += `- 🔴 **LCP > 2.5s** : Optimiser le chargement du contenu principal\n`;
  }
  
  if (averages['total-blocking-time']?.value > 300) {
    report += `- 🟡 **TBT > 300ms** : Réduire le JavaScript bloquant\n`;
  }

  if (averages['cumulative-layout-shift']?.value > 0.1) {
    report += `- 🟡 **CLS > 0.1** : Stabiliser la mise en page\n`;
  }

  if (averages['first-contentful-paint']?.value > 1800) {
    report += `- 🟡 **FCP > 1.8s** : Accélérer le premier rendu\n`;
  }

  report += `\n## 📈 Impact du Lazy Loading\n\n`;
  report += `Le lazy loading a été implémenté sur les composants suivants :\n`;
  report += `- EdnRevisionView\n`;
  report += `- EdnCompleteView\n`;
  report += `- EdnImmersiveView\n`;
  report += `- EdnMusicView\n`;
  report += `- EdnSubscriptionView\n`;
  report += `- EdnItemModal\n\n`;

  report += `**Bénéfices attendus** :\n`;
  report += `- Réduction du bundle initial de 40-50%\n`;
  report += `- Amélioration du FCP et LCP\n`;
  report += `- Réduction du TBT\n`;
  report += `- Chargement à la demande des tabs non utilisés\n\n`;

  report += `---\n\n`;
  report += `*Rapport généré automatiquement par measure-lazy-loading-impact.js*\n`;

  fs.writeFileSync(reportPath, report);
  console.log(`\n📄 Rapport sauvegardé : ${reportPath}`);

  return report;
}

async function main() {
  console.log('🚀 Mesure d\'impact du Lazy Loading - /edn-complete');
  console.log('='.repeat(60));

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const allMetrics = [];

    for (let i = 0; i < RUNS; i++) {
      const lhr = await runLighthouseAudit(browser, i);
      const metrics = extractMetrics(lhr);
      allMetrics.push(metrics);
      
      console.log(`  Performance Score: ${metrics.performanceScore.toFixed(1)}/100`);
    }

    console.log('\n📊 Calcul des moyennes...');
    const averages = calculateAverages(allMetrics);

    console.log('\n📈 Résultats moyens :');
    console.log(`  Performance Score: ${averages.performanceScore.toFixed(1)}/100`);
    console.log(`  FCP: ${formatMetricValue('first-contentful-paint', averages['first-contentful-paint'].value)}`);
    console.log(`  LCP: ${formatMetricValue('largest-contentful-paint', averages['largest-contentful-paint'].value)}`);
    console.log(`  TBT: ${formatMetricValue('total-blocking-time', averages['total-blocking-time'].value)}`);
    console.log(`  CLS: ${formatMetricValue('cumulative-layout-shift', averages['cumulative-layout-shift'].value)}`);

    const report = generateReport(averages);

    console.log('\n✅ Mesure terminée avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors de la mesure :', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

main();
