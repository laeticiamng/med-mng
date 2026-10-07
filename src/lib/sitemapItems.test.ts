import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { cheminItemEdn } from '@/pages/edn-item/ednItemTabs';
import { construireSitemapItems, trierSlugsItems, URL_SITE } from './sitemapItems';

const lirePublic = (fichier: string) => readFileSync(resolve(__dirname, '../../public', fichier), 'utf-8');
const locs = (xml: string) => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

describe('Sitemap des fiches item (MM-A21)', () => {
  it('construit une URL canonique par item, dans l\'ordre des numéros', () => {
    const xml = construireSitemapItems(trierSlugsItems(['ic-10', 'ic-2', 'ic-1']), '2026-10-07');
    expect(locs(xml)).toEqual([
      `${URL_SITE}${cheminItemEdn('ic-1')}`,
      `${URL_SITE}${cheminItemEdn('ic-2')}`,
      `${URL_SITE}${cheminItemEdn('ic-10')}`,
    ]);
    expect(xml).toContain('<lastmod>2026-10-07</lastmod>');
  });

  it('refuse un slug inattendu (pas d\'URL fabriquée)', () => {
    expect(() => construireSitemapItems(['ic-1', 'IC 2<'], '2026-10-07')).toThrow();
    expect(() => construireSitemapItems(['ic-1', 'ic-1'], '2026-10-07')).toThrow();
  });

  it('public/sitemap-items.xml déclare les 367 fiches publiques (aperçu)', () => {
    const urls = locs(lirePublic('sitemap-items.xml'));
    expect(urls).toHaveLength(367);
    expect(new Set(urls).size).toBe(367);
    for (let n = 1; n <= 367; n += 1) {
      expect(urls).toContain(`${URL_SITE}${cheminItemEdn(`ic-${n}`)}`);
    }
  });

  it('robots.txt annonce les deux sitemaps et sitemap.xml garde /ecos', () => {
    const robots = lirePublic('robots.txt');
    expect(robots).toContain(`Sitemap: ${URL_SITE}/sitemap.xml`);
    expect(robots).toContain(`Sitemap: ${URL_SITE}/sitemap-items.xml`);
    expect(locs(lirePublic('sitemap.xml'))).toContain(`${URL_SITE}/ecos`);
  });
});
