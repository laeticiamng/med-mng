import { writeFile, readFile, mkdir } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.resolve(__dirname, '../public');

const rawSiteUrl = (process.env.SITE_URL || process.env.VITE_SITE_URL || 'https://medmng.app').trim();
const siteUrl = rawSiteUrl.replace(/\/$/, '');

const staticRoutes = [
  '/',
  '/edn-production',
  '/edn-production/progression',
  '/med-mng',
  '/med-mng/library',
  '/med-mng/analytics',
  '/med-mng/settings'
];

const fallbackItems = [
  { slug: 'item-001', updated_at: new Date().toISOString() },
  { slug: 'item-002', updated_at: new Date().toISOString() },
  { slug: 'item-003', updated_at: new Date().toISOString() }
];

async function fetchItemSlugs() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    console.warn('[sitemap] Missing Supabase credentials, using fallback slugs.');
    return [];
  }

  try {
    const { createClient } = await import('@supabase/supabase-js');
    const client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
    const { data, error } = await client
      .from('edn_items_complete')
      .select('slug, updated_at')
      .not('slug', 'is', null)
      .order('item_code', { ascending: true })
      .limit(500);

    if (error) {
      throw error;
    }

    return (data ?? [])
      .filter((item) => typeof item.slug === 'string' && item.slug.length > 0)
      .map((item) => ({
        slug: item.slug,
        updated_at: item.updated_at ?? new Date().toISOString()
      }));
  } catch (error) {
    console.warn('[sitemap] Failed to fetch items from Supabase:', error);
    return [];
  }
}

function buildUrlEntry(pathname, lastmod) {
  const loc = `${siteUrl}${pathname}`;
  const lastModDate = lastmod ? new Date(lastmod) : new Date();
  const isoDate = (lastModDate instanceof Date && !Number.isNaN(lastModDate.getTime()))
    ? lastModDate.toISOString()
    : new Date().toISOString();

  return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${isoDate}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>`;
}

async function updateRobotsFile() {
  const robotsPath = path.join(publicDir, 'robots.txt');
  const sitemapLine = `Sitemap: ${siteUrl}/sitemap.xml`;

  try {
    let content;
    try {
      content = await readFile(robotsPath, 'utf8');
    } catch (readError) {
      if (readError && readError.code === 'ENOENT') {
        content = 'User-agent: *\nAllow: /\n';
      } else {
        throw readError;
      }
    }

    const sanitized = content
      .split('\n')
      .filter((line) => !line.trim().toLowerCase().startsWith('sitemap:'))
      .join('\n')
      .trimEnd();

    const finalContent = `${sanitized}\n\n${sitemapLine}\n`;
    await writeFile(robotsPath, finalContent, 'utf8');
  } catch (error) {
    console.warn('[sitemap] Unable to update robots.txt:', error);
  }
}

async function generateSitemap() {
  await mkdir(publicDir, { recursive: true });

  const dynamicItems = await fetchItemSlugs();
  const items = dynamicItems.length > 0 ? dynamicItems : fallbackItems;

  const entries = [
    ...staticRoutes.map((route) => buildUrlEntry(route, new Date().toISOString())),
    ...items.map((item) => buildUrlEntry(`/edn-production/${item.slug}`, item.updated_at))
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</urlset>\n`;

  const sitemapPath = path.join(publicDir, 'sitemap.xml');
  await writeFile(sitemapPath, sitemap, 'utf8');
  console.log(`[sitemap] Generated ${entries.length} entries at ${sitemapPath}`);

  await updateRobotsFile();
}

generateSitemap().catch((error) => {
  console.error('[sitemap] Generation failed:', error);
  process.exitCode = 1;
});
