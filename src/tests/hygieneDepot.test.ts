import * as fs from 'fs';
import * as path from 'path';
import { describe, expect, it } from 'vitest';

/**
 * MM-A02 (audit du 07.10.2026) : scripts de débogage (dont un identifiant et
 * un mot de passe CAS en valeur de repli), panneau de test d'abonnement et
 * centres de notifications morts retirés ; dev-dist/ (service worker généré)
 * n'est plus versionné.
 */
const racine = process.cwd();
const existe = (p: string) => fs.existsSync(path.resolve(racine, p));

describe('Hygiène du dépôt', () => {
  it('ne contient plus les scripts et composants de débogage', () => {
    for (const p of [
      'scripts/debug',
      'src/components/subscription/SubscriptionTestPanel.tsx',
      'src/components/common/NotificationCenter.tsx',
      'src/components/system/NotificationCenter.tsx',
    ]) {
      expect({ p, existe: existe(p) }).toEqual({ p, existe: false });
    }
  });

  it('ignore dev-dist/', () => {
    const lignes = fs.readFileSync(path.resolve(racine, '.gitignore'), 'utf-8').split('\n').map((l) => l.trim());
    expect(lignes).toContain('dev-dist/');
  });

  it('aucun identifiant CAS en valeur de repli dans le code', () => {
    const fichiers = (dossier: string): string[] =>
      fs.readdirSync(dossier, { withFileTypes: true }).flatMap((e) => {
        const p = path.join(dossier, e.name);
        if (e.isDirectory()) return ['node_modules', '.git', 'dist'].includes(e.name) ? [] : fichiers(p);
        return /\.(c?js|ts|tsx|md)$/.test(e.name) ? [p] : [];
      });
    const fautifs = [...fichiers(path.resolve(racine, 'src')), ...fichiers(path.resolve(racine, 'supabase/functions')), ...fichiers(path.resolve(racine, 'docs'))]
      .filter((f) => /CAS_(USERNAME|PASSWORD|USER|PASS)['")\]]*\s*(\|\||\?\?|=)\s*['"][^'"<\s]{4,}['"]/.test(fs.readFileSync(f, 'utf-8')));
    expect(fautifs).toEqual([]);
  });
});
