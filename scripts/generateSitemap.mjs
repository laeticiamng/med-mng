#!/usr/bin/env node
import 'dotenv/config';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DEFAULT_BASE_URL = 'https://med-mng.com';
const EDN_SQL_SOURCE = path.join(
  process.cwd(),
  'supabase',
  'migrations',
  '20250704083800-1544d62b-ba86-42f5-a480-ab240c6ea82e.sql'
);
const EDN_ITEM_REGEX = /WHEN 'IC-(\d+)' THEN '([^']+)'/g;
const TODAY = new Date().toISOString().split('T')[0];

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const publicDirectory = path.join(projectRoot, 'public');
const outputPath = path.join(publicDirectory, 'sitemap.xml');

const baseUrl = (process.env.SITEMAP_BASE_URL || process.env.PUBLIC_SITE_URL || DEFAULT_BASE_URL).replace(/\/+$/, '');

const slugify = (value) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-');

const buildUrl = (suffix) => {
  const normalized = suffix.startsWith('/') ? suffix : `/${suffix}`;
  return `${baseUrl}${normalized}`;
};

const readFileSafely = async (filePath) => {
  try {
    return await fs.readFile(filePath, 'utf8');
  } catch (error) {
    throw new Error(`Impossible de lire le fichier ${filePath}: ${error.message}`);
  }
};

const loadEdnItems = async () => {
  const sql = await readFileSafely(EDN_SQL_SOURCE);
  const items = [];
  let match;

  while ((match = EDN_ITEM_REGEX.exec(sql)) !== null) {
    const itemNumber = match[1];
    const title = match[2];
    const slug = `ic-${itemNumber}-${slugify(title)}`;

    items.push({
      loc: buildUrl(`/edn-production/${slug}`),
      lastmod: TODAY,
      changefreq: 'weekly',
      priority: '0.80',
    });
  }

  if (items.length === 0) {
    throw new Error('Aucun item EDN trouvé dans le script SQL de migration.');
  }

  return items;
};

const generateSequentialEntries = (prefix, count, pad, builder) => {
  const entries = [];

  for (let index = 1; index <= count; index += 1) {
    const id = `${prefix}${String(index).padStart(pad, '0')}`;
    entries.push(builder(id));
  }

  return entries;
};

const loadEcosScenarios = () => {
  const count = Number(process.env.SITEMAP_ECOS_COUNT || 60);

  return generateSequentialEntries('SD', count, 3, (id) => ({
    loc: buildUrl(`/ecos/${id}`),
    lastmod: TODAY,
    changefreq: 'monthly',
    priority: '0.60',
  }));
};

const loadKaraokeTracks = () => {
  const count = Number(process.env.SITEMAP_KARAOKE_COUNT || 40);

  return generateSequentialEntries('karaoke-track-', count, 3, (id) => ({
    loc: buildUrl(`/med-mng/player/${id}`),
    lastmod: TODAY,
    changefreq: 'weekly',
    priority: '0.50',
  }));
};

const escapeXml = (value) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const buildSitemapXml = (entries) => {
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ];

  for (const entry of entries) {
    lines.push('  <url>');
    lines.push(`    <loc>${escapeXml(entry.loc)}</loc>`);

    if (entry.lastmod) {
      lines.push(`    <lastmod>${escapeXml(entry.lastmod)}</lastmod>`);
    }

    if (entry.changefreq) {
      lines.push(`    <changefreq>${escapeXml(entry.changefreq)}</changefreq>`);
    }

    if (entry.priority) {
      lines.push(`    <priority>${escapeXml(entry.priority)}</priority>`);
    }

    lines.push('  </url>');
  }

  lines.push('</urlset>');
  lines.push('');

  return lines.join('\n');
};

const generateSitemap = async () => {
  console.log('🗺️  Génération du sitemap local...');

  const itemEntries = await loadEdnItems();

  if (itemEntries.length < 367) {
    throw new Error(`Le sitemap doit contenir au moins 367 items EDN (trouvés: ${itemEntries.length}).`);
  }

  const ecosEntries = loadEcosScenarios();
  const karaokeEntries = loadKaraokeTracks();

  const seen = new Set();
  const entries = [];

  const addEntry = (entry) => {
    if (seen.has(entry.loc)) {
      return;
    }

    seen.add(entry.loc);
    entries.push(entry);
  };

  const coreRoutes = [
    { loc: buildUrl('/'), changefreq: 'daily', priority: '1.00', lastmod: TODAY },
    { loc: buildUrl('/edn-production'), changefreq: 'daily', priority: '0.90', lastmod: TODAY },
    { loc: buildUrl('/ecos'), changefreq: 'weekly', priority: '0.70', lastmod: TODAY },
    { loc: buildUrl('/med-mng/library'), changefreq: 'weekly', priority: '0.60', lastmod: TODAY },
  ];

  coreRoutes.forEach(addEntry);
  itemEntries.forEach(addEntry);
  ecosEntries.forEach(addEntry);
  karaokeEntries.forEach(addEntry);

  const xml = buildSitemapXml(entries);

  await fs.mkdir(publicDirectory, { recursive: true });
  await fs.writeFile(outputPath, xml, 'utf8');

  console.log(`✅ Sitemap généré (${entries.length} URLs)`);
  console.log(`   • Items EDN : ${itemEntries.length}`);
  console.log(`   • Scénarios ECOS : ${ecosEntries.length}`);
  console.log(`   • Pistes karaoké : ${karaokeEntries.length}`);
};

generateSitemap().catch((error) => {
  console.error('❌ Échec de la génération du sitemap:', error instanceof Error ? error.message : error);
  process.exit(1);
});
