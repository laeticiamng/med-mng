/**
 * Génère (ou vérifie) docs/musique-comparaison-abc/requetes-abc.json : les six charges utiles
 * du protocole A/B/C. N'appelle JAMAIS Suno ni aucun service : calcul local uniquement.
 *
 *   bun scripts/musique/generer-requetes-abc.ts            # affiche le résumé
 *   bun scripts/musique/generer-requetes-abc.ts --ecrire   # (ré)écrit le fichier JSON
 *   bun scripts/musique/generer-requetes-abc.ts --verifier # échoue si le fichier est périmé
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { documentRequetesABC } from './comparaison-abc.ts';

const ici = dirname(fileURLToPath(import.meta.url));
const chemin = resolve(ici, '../../docs/musique-comparaison-abc/requetes-abc.json');
const contenu = `${JSON.stringify(documentRequetesABC(), null, 2)}\n`;
const mode = process.argv[2];

if (mode === '--ecrire') {
  mkdirSync(dirname(chemin), { recursive: true });
  writeFileSync(chemin, contenu);
  console.log(`Écrit : ${chemin}`);
} else if (mode === '--verifier') {
  const actuel = readFileSync(chemin, 'utf8');
  if (actuel !== contenu) {
    console.error('requetes-abc.json est périmé : relancer avec --ecrire.');
    process.exit(1);
  }
  console.log('requetes-abc.json à jour.');
} else {
  for (const r of documentRequetesABC().requetes) {
    console.log(`${r.id.padEnd(14)} style ${String(r.longueurs.style).padStart(3)} car. · négatifs ${String(r.longueurs.negativeTags).padStart(3)} · paroles ${r.longueurs.lyrics} · ${r.chargeUtile.duration} s`);
  }
}
