/**
 * Sitemap Generator for MED-MNG
 *
 * Generates sitemap.xml from the SEO config.
 * Run: npx tsx scripts/generate-sitemap.ts
 *
 * Rules:
 * - Include only public routes (no noindex, no admin/*, no app/*, no api/*)
 * - Exclude protected routes (/med-mng/create, /med-mng/music-library, etc.)
 * - Add lastmod, changefreq, priority based on route type
 */

import * as fs from 'fs';
import * as path from 'path';

const SITE_URL = 'https://med-mng.lovable.app';
const TODAY = new Date().toISOString().split('T')[0];

interface SitemapEntry {
  loc: string;
  lastmod: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
}

// Routes to exclude from sitemap (admin, protected, api, internal)
const EXCLUDED_PREFIXES = [
  '/admin',
  '/app/',
  '/api/',
  '/med-mng/create',
  '/med-mng/music-library',
  '/med-mng/items-library',
  '/med-mng/profile',
  '/med-mng/playlists',
  '/med-mng/analytics',
  '/med-mng/progress',
  '/med-mng/favorites',
  '/med-mng/player',
  '/med-mng/items/',
  '/med-mng/success',
  '/med-mng/subscribe',
  '/med-mng/reset-password',
  '/settings',
  '/mes-donnees-rgpd',
  '/diagnostics',
  '/pwa-analytics',
  '/design-system',
  '/monitoring',
  '/system-management',
  '/platform-settings',
  '/platform-status',
  '/security-monitoring',
  '/rls-documentation',
  '/migration-dashboard',
  '/executive-dashboard',
  '/accessibility-dashboard',
  '/effectiveness-dashboard',
  '/audit',
];

function isExcluded(route: string): boolean {
  return EXCLUDED_PREFIXES.some(prefix => route.startsWith(prefix));
}

function getChangefreq(route: string): SitemapEntry['changefreq'] {
  if (route === '/') return 'daily';
  if (route.includes('daily-challenges') || route.includes('leaderboard')) return 'daily';
  if (route.includes('edn') || route.includes('exam') || route.includes('flashcard') || route.includes('clinical') || route.includes('ecos') || route.includes('srs')) return 'weekly';
  if (route.includes('mentions-legales') || route.includes('cgu') || route.includes('politique') || route.includes('declaration')) return 'yearly';
  return 'monthly';
}

function getPriority(route: string): number {
  if (route === '/') return 1.0;
  if (route === '/med-mng/pricing') return 0.9;
  if (route === '/edn-complete') return 0.9;
  if (route === '/demo') return 0.8;
  if (route.includes('edn') || route.includes('ecos')) return 0.8;
  if (route.includes('exam') || route.includes('clinical') || route.includes('flashcard') || route.includes('srs')) return 0.8;
  if (route.includes('login') || route.includes('signup')) return 0.7;
  if (route.includes('leaderboard') || route.includes('daily') || route.includes('generator') || route.includes('store')) return 0.7;
  if (route.includes('smart-study') || route.includes('pomodoro') || route.includes('karaoke') || route.includes('mood')) return 0.6;
  if (route.includes('mentions') || route.includes('cgu') || route.includes('politique') || route.includes('declaration')) return 0.3;
  return 0.5;
}

// All public routes for the sitemap
const PUBLIC_ROUTES: string[] = [
  '/',
  '/demo',
  '/med-mng/login',
  '/med-mng/signup',
  '/med-mng/pricing',
  '/edn-complete',
  '/edn/music-library',
  '/srs-review',
  '/exam-mode',
  '/clinical-cases',
  '/flashcards',
  '/ecos',
  '/leaderboard',
  '/daily-challenges',
  '/pomodoro',
  '/karaoke',
  '/smart-study-planner',
  '/generator',
  '/shared-music',
  '/store',
  '/mng-method',
  '/chat',
  '/community',
  '/library',
  // Pillar pages SEO
  '/preparation-ecos-2026',
  '/reussir-edn',
  '/fiches-ecos-interactives',
  '/simulation-examen-edn',
  '/cas-cliniques-edn',
  '/erreurs-frequentes-ecos',
  '/classement-edn-explique',
  '/rang-a-vs-rang-b',
  '/travailler-cas-cliniques',
  '/exemple-cas-clinique',
  '/mentions-legales',
  '/politique-confidentialite',
  '/cgu',
  '/declaration-accessibilite',
  '/install',
];

function generateSitemap(): string {
  const entries: SitemapEntry[] = PUBLIC_ROUTES
    .filter(route => !isExcluded(route))
    .map(route => ({
      loc: `${SITE_URL}${route}`,
      lastmod: TODAY,
      changefreq: getChangefreq(route),
      priority: getPriority(route),
    }));

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${entries.map(entry => `  <url>
    <loc>${entry.loc}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority.toFixed(1)}</priority>
  </url>`).join('\n')}
</urlset>
`;

  return xml;
}

// Generate and write
const sitemap = generateSitemap();
const outputPath = path.resolve(__dirname, '..', 'public', 'sitemap.xml');
fs.writeFileSync(outputPath, sitemap, 'utf-8');
console.log(`Sitemap generated at ${outputPath} with ${PUBLIC_ROUTES.filter(r => !isExcluded(r)).length} URLs`);
