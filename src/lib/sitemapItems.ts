/**
 * Sitemap des fiches item EDN (MM-A21, 07.10.2026).
 *
 * Les 367 fiches `/edn-complete/:slug/apercu` sont publiques (aperçu, rang A et
 * rang B lisibles sans compte, indexables : `getRouteSEO` ne les marque pas
 * `noindex`) mais n'étaient déclarées dans aucun sitemap. Source de vérité :
 * la colonne `slug` de `edn_items_complete` (lisible par le rôle anon), celle
 * qu'utilise la balise canonique de la fiche (`EdnItemSeo`).
 *
 * Fonctions pures : le script `scripts/generate-sitemap-items.ts` lit les slugs
 * en base et écrit `public/sitemap-items.xml`.
 */

export const URL_SITE = 'https://medmng.com';

/** Même chemin que `cheminItemEdn(slug)` (sous-page par défaut : l'aperçu). */
const cheminApercu = (slug: string) => `/edn-complete/${slug}/apercu`;

const SLUG_VALIDE = /^[a-z0-9-]+$/;

const numeroItem = (slug: string) => Number(slug.match(/(\d+)/)?.[1] ?? Number.MAX_SAFE_INTEGER);

/** Tri par numéro d'item (ic-2 avant ic-10). */
export const trierSlugsItems = (slugs: string[]): string[] =>
  [...slugs].sort((a, b) => numeroItem(a) - numeroItem(b) || a.localeCompare(b));

export function construireSitemapItems(slugs: string[], dateMaj: string): string {
  const invalides = slugs.filter((s) => !SLUG_VALIDE.test(s));
  if (invalides.length) throw new Error(`Slugs invalides : ${invalides.join(', ')}`);
  if (new Set(slugs).size !== slugs.length) throw new Error('Slugs en double');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateMaj)) throw new Error(`Date invalide : ${dateMaj}`);

  const urls = slugs
    .map((slug) => `  <url>
    <loc>${URL_SITE}${cheminApercu(slug)}</loc>
    <lastmod>${dateMaj}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`)
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<!-- Généré par scripts/generate-sitemap-items.ts depuis edn_items_complete.slug : ne pas éditer à la main. -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}
