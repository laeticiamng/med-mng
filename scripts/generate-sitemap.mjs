import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

console.log('🔧 Initialisation du script de génération de sitemap...');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const sitemapPath = path.join(rootDir, 'public', 'sitemap.xml');
const robotsPath = path.join(rootDir, 'public', 'robots.txt');

const DEFAULT_SITE_URL = 'https://med-mng.com';
const rawSiteUrl = process.env.SITE_URL || process.env.PUBLIC_SITE_URL || DEFAULT_SITE_URL;
const siteUrl = rawSiteUrl.replace(/\/?$/, '');

const supabaseUrl =
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://yaincoxihiqdksxgrsrk.supabase.co';

const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU';

const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } })
  : null;

const log = (message) => {
  console.log(`➡️  ${message}`);
};

const warn = (message, error) => {
  console.warn(`⚠️  ${message}`);
  if (error) {
    console.warn(error);
  }
};

function sanitizePathSegment(value) {
  if (!value) {
    return '';
  }
  return value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function formatLastmod(value) {
  if (!value) {
    return undefined;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return undefined;
  }
  return date.toISOString();
}

function generateFallbackItems() {
  const baseDate = new Date('2024-01-01T00:00:00Z');
  return Array.from({ length: 367 }, (_, index) => ({
    slug: `ic-${String(index + 1).padStart(3, '0')}`,
    updated_at: new Date(baseDate.getTime() + index * 86_400_000).toISOString(),
  }));
}

function generateFallbackEcos() {
  const specialties = ['cardio', 'neuro', 'pediatrie', 'urgences', 'dermato'];
  return Array.from({ length: 25 }, (_, index) => ({
    situation_number: `sd-${String(index + 1).padStart(3, '0')}`,
    updated_at: new Date(Date.UTC(2024, index % 12, (index % 27) + 1)).toISOString(),
    id: specialties[index % specialties.length],
  }));
}

function generateFallbackKaraoke() {
  return Array.from({ length: 40 }, (_, index) => ({
    id: `karaoke-track-${String(index + 1).padStart(4, '0')}`,
    updated_at: new Date(Date.UTC(2024, 0, 1, 0, index)).toISOString(),
  }));
}

async function fetchPagedRows(table, columns, orderBy) {
  if (!supabase) {
    return [];
  }

  const pageSize = 200;
  const rows = [];
  let from = 0;

  while (true) {
    let query = supabase.from(table).select(columns).range(from, from + pageSize - 1);

    if (orderBy) {
      query = query.order(orderBy.column, { ascending: orderBy.ascending ?? true, nullsFirst: false });
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      break;
    }

    rows.push(...data);

    if (data.length < pageSize) {
      break;
    }

    from += pageSize;
  }

  return rows;
}

async function loadEdnItems() {
  if (!supabase) {
    log('Supabase non configuré, utilisation du jeu de secours pour les items EDN.');
    return generateFallbackItems();
  }

  try {
    const rows = await fetchPagedRows('edn_items_complete', 'slug, updated_at', {
      column: 'item_code',
      ascending: true,
    });

    if (!rows.length) {
      throw new Error('Aucun item EDN récupéré');
    }

    return rows;
  } catch (error) {
    warn("Impossible de charger les items EDN depuis Supabase, utilisation du fallback.", error);
    return generateFallbackItems();
  }
}

async function loadEcosScenarios() {
  if (!supabase) {
    log('Supabase non configuré, utilisation du jeu de secours pour les scénarios ECOS.');
    return generateFallbackEcos();
  }

  try {
    const rows = await fetchPagedRows('ecos_situations_complete', 'situation_number, id, updated_at', {
      column: 'situation_number',
      ascending: true,
    });

    if (!rows.length) {
      throw new Error('Aucun scénario ECOS récupéré');
    }

    return rows;
  } catch (error) {
    warn("Impossible de charger les scénarios ECOS depuis Supabase, utilisation du fallback.", error);
    return generateFallbackEcos();
  }
}

async function loadKaraokeTracks() {
  if (!supabase) {
    log('Supabase non configuré, utilisation du jeu de secours pour les pistes karaoké.');
    return generateFallbackKaraoke();
  }

  try {
    const rows = await fetchPagedRows('generated_music_tracks', 'id, updated_at, status', {
      column: 'updated_at',
      ascending: false,
    });

    if (!rows.length) {
      throw new Error('Aucune piste karaoké récupérée');
    }

    return rows.filter((row) => !row.status || row.status === 'published');
  } catch (error) {
    warn("Impossible de charger les pistes karaoké depuis Supabase, utilisation du fallback.", error);
    return generateFallbackKaraoke();
  }
}

function buildUrl(pathname) {
  return `${siteUrl}${pathname.startsWith('/') ? '' : '/'}${pathname}`;
}

function toSitemapEntry(entry) {
  const segments = [`  <url>`, `    <loc>${entry.loc}</loc>`];
  if (entry.lastmod) {
    segments.push(`    <lastmod>${entry.lastmod}</lastmod>`);
  }
  if (entry.changefreq) {
    segments.push(`    <changefreq>${entry.changefreq}</changefreq>`);
  }
  if (typeof entry.priority === 'number') {
    segments.push(`    <priority>${entry.priority.toFixed(1)}</priority>`);
  }
  segments.push('  </url>');
  return segments.join('\n');
}

function deduplicateEntries(entries) {
  const map = new Map();
  for (const entry of entries) {
    if (!map.has(entry.loc)) {
      map.set(entry.loc, entry);
    }
  }
  return Array.from(map.values());
}

async function generateRobots() {
  const lines = [
    'User-agent: *',
    'Allow: /',
    '',
    `Sitemap: ${buildUrl('/sitemap.xml')}`,
    '',
  ];

  await writeFile(robotsPath, lines.join('\n'), 'utf-8');
}

async function generateSitemap() {
  log(`Génération du sitemap pour ${siteUrl}`);

  const [items, ecos, karaoke] = await Promise.all([
    loadEdnItems(),
    loadEcosScenarios(),
    loadKaraokeTracks(),
  ]);

  log(`→ Items EDN: ${items.length}`);
  log(`→ Scénarios ECOS: ${ecos.length}`);
  log(`→ Pistes karaoké: ${karaoke.length}`);

  const staticRoutes = [
    { loc: buildUrl('/') },
    { loc: buildUrl('/platform') },
    { loc: buildUrl('/generator') },
    { loc: buildUrl('/edn-production') },
    { loc: buildUrl('/ecos') },
    { loc: buildUrl('/med-mng/platform') },
    { loc: buildUrl('/med-mng/dashboard') },
    { loc: buildUrl('/med-mng/library') },
  ];

  const itemEntries = items.map((item) => ({
    loc: buildUrl(`/edn-production/${sanitizePathSegment(item.slug)}`),
    lastmod: formatLastmod(item.updated_at),
    changefreq: 'weekly',
    priority: 0.9,
  }));

  const ecosEntries = ecos
    .map((scenario) => {
      const slug = sanitizePathSegment(
        scenario.situation_number || scenario.id || 'ecos-scenario'
      );

      if (!slug) {
        return null;
      }

      return {
        loc: buildUrl(`/ecos/${slug}`),
        lastmod: formatLastmod(scenario.updated_at),
        changefreq: 'monthly',
        priority: 0.6,
      };
    })
    .filter(Boolean);

  const karaokeEntries = karaoke
    .map((track) => {
      const slug = sanitizePathSegment(track.id);
      if (!slug) {
        return null;
      }

      return {
        loc: buildUrl(`/med-mng/player/${slug}`),
        lastmod: formatLastmod(track.updated_at),
        changefreq: 'weekly',
        priority: 0.5,
      };
    })
    .filter(Boolean);

  const allEntries = deduplicateEntries([
    ...staticRoutes,
    ...itemEntries,
    ...ecosEntries,
    ...karaokeEntries,
  ]);

  const xmlContent = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...allEntries.map(toSitemapEntry),
    '</urlset>',
    '',
  ].join('\n');

  await writeFile(sitemapPath, xmlContent, 'utf-8');
  log(`Sitemap généré avec ${allEntries.length} URLs.`);
}

async function run() {
  try {
    await generateSitemap();
    await generateRobots();
    log('✅ Sitemap et robots.txt générés avec succès.');
  } catch (error) {
    console.error('❌ Erreur lors de la génération du sitemap:', error);
    process.exitCode = 1;
  }
}

run();
