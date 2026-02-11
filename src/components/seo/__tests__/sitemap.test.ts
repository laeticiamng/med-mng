import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Sitemap', () => {
  const sitemapPath = path.resolve(process.cwd(), 'public/sitemap.xml');
  let sitemapContent: string;

  beforeAll(() => {
    sitemapContent = fs.readFileSync(sitemapPath, 'utf-8');
  });

  it('should exist in public directory', () => {
    expect(fs.existsSync(sitemapPath)).toBe(true);
  });

  it('should be valid XML', () => {
    expect(sitemapContent).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(sitemapContent).toContain('<urlset');
    expect(sitemapContent).toContain('</urlset>');
  });

  it('should include homepage with highest priority', () => {
    expect(sitemapContent).toContain('https://med-mng.lovable.app/</loc>');
    expect(sitemapContent).toContain('<priority>1.0</priority>');
  });

  it('should include key public routes', () => {
    const requiredRoutes = [
      '/demo',
      '/med-mng/pricing',
      '/med-mng/login',
      '/med-mng/signup',
      '/edn-complete',
      '/exam-mode',
      '/clinical-cases',
      '/flashcards',
      '/ecos',
    ];
    for (const route of requiredRoutes) {
      expect(sitemapContent).toContain(route);
    }
  });

  it('should NOT include admin routes', () => {
    expect(sitemapContent).not.toContain('/admin/');
    expect(sitemapContent).not.toContain('/admin-panel');
  });

  it('should NOT include protected user routes', () => {
    expect(sitemapContent).not.toContain('/med-mng/create');
    expect(sitemapContent).not.toContain('/med-mng/profile');
    expect(sitemapContent).not.toContain('/med-mng/billing');
    expect(sitemapContent).not.toContain('/med-mng/music-library');
  });

  it('should have lastmod dates', () => {
    const lastmodCount = (sitemapContent.match(/<lastmod>/g) || []).length;
    const urlCount = (sitemapContent.match(/<url>/g) || []).length;
    expect(lastmodCount).toBe(urlCount);
  });

  it('should have changefreq for all URLs', () => {
    const changefreqCount = (sitemapContent.match(/<changefreq>/g) || []).length;
    const urlCount = (sitemapContent.match(/<url>/g) || []).length;
    expect(changefreqCount).toBe(urlCount);
  });

  it('should include legal pages with low priority', () => {
    expect(sitemapContent).toContain('/mentions-legales');
    expect(sitemapContent).toContain('/cgu');
    expect(sitemapContent).toContain('/politique-confidentialite');
  });
});
