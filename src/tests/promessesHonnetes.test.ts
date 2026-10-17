/**
 * Non-régression « promesses honnêtes » (audit du 17.10.2026) : plus aucune
 * fonctionnalité fictive ni promesse non démontrée dans le code source.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const RACINE = resolve(__dirname, '../..');
const SRC = join(RACINE, 'src');

function fichiers(dir: string): string[] {
  return readdirSync(dir).flatMap((nom) => {
    const chemin = join(dir, nom);
    if (statSync(chemin).isDirectory()) return fichiers(chemin);
    return /\.(ts|tsx)$/.test(nom) && !/\.test\.tsx?$/.test(nom) && !chemin.includes(`${join('src', 'integrations')}`)
      ? [chemin]
      : [];
  });
}

const SOURCES = fichiers(SRC).filter((f) => !f.endsWith('translations-dictionary.ts')).map((f) => ({ f: f.replace(RACINE + '/', ''), s: readFileSync(f, 'utf8') }));
const trouver = (re: RegExp) => SOURCES.filter(({ s }) => re.test(s)).map(({ f }) => f);

describe('promesses honnêtes', () => {
  it('aucune statistique fictive codée en dur (rétention 85 %)', () => {
    expect(trouver(/averageRetention:\s*85/)).toEqual([]);
  });

  it('composants fictifs supprimés et non importés', () => {
    for (const c of ['srs/SRSStatsExport', 'export/PDFExportService', 'notifications/SRSNotificationSettings', 'generator/ShareMusicDialog', 'generator/GenerationToast']) {
      expect(existsSync(join(SRC, 'components', `${c}.tsx`))).toBe(false);
    }
    expect(trouver(/SRSStatsExport|PDFExportService|SRSNotificationSettings|ShareMusicDialog|GenerationToast/)).toEqual([]);
  });

  it('aucun lien vers une page de partage inexistante', () => {
    expect(trouver(/shared-music/)).toEqual([]);
  });

  it('aucune promesse de lecture hors connexion ni « 1 chanson par item »', () => {
    expect(trouver(/restent (lisibles|accessibles) (hors connexion|sans connexion)|lisibles hors (connexion|ligne)|fonctionne hors ligne/i)).toEqual([]);
    expect(trouver(/1 chanson par item/)).toEqual([]);
  });

  it('aucune offre retirée dans les données structurées (QRU, QROC, mode examen)', () => {
    const jsonLd = SOURCES.find(({ f }) => f.endsWith('jsonLdSchemas.ts'))!.s;
    expect(jsonLd).not.toMatch(/QRU|QROC|Cas cliniques interactifs|Mode examen EDN/);
  });

  it('accueil : plus d’accroche « Apprenez la médecine en musique »', () => {
    expect(trouver(/Apprenez la médecine/)).toEqual([]);
    expect(readFileSync(join(RACINE, 'index.html'), 'utf8')).not.toMatch(/en musique/);
    expect(trouver(/dès la D2/)).toEqual([]);
  });

  it('pas de filtres fabriqués à partir de tranches de numéros d’item', () => {
    expect(trouver(/getSpecialtyFromCode|getYearFromCode|getSpecialtyFromItemCode/)).toEqual([]);
  });

  it('pas de bascule « Playlist publique » sans page publique', () => {
    expect(trouver(/Playlist publique/)).toEqual([]);
  });
});
