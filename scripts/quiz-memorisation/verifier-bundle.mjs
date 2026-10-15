#!/usr/bin/env node
/**
 * Garde-fou de production du pilote « Mémoriser » (PR #251).
 *
 * Échoue si :
 *  - le drapeau VITE_QUIZ_MEMORISATION_PILOTE vaut « true » dans l'environnement du
 *    build ou dans un fichier .env que Vite charge en mode production (.env, .env.local,
 *    .env.production, .env.production.local) ;
 *  - un fichier JavaScript du build contient une question du pilote (identifiant
 *    M<item>-<A|B><n>, ou un champ de traçabilité). Les questions des items Premium
 *    ne doivent jamais voyager dans un bundle public.
 *
 * Usage : node scripts/quiz-memorisation/verifier-bundle.mjs dist
 * Appelé par « npm run build » (donc par le Dockerfile de production) et par la CI.
 * Un build de préproduction du pilote se fait avec « npx vite build », jamais « npm run build ».
 */
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const MOTIFS_QUESTIONS = [/["'`]M\d{3}-[AB]\d+["'`]/, /extraitReferentiel/, /motifBlocage/];
const DRAPEAU = /^\s*VITE_QUIZ_MEMORISATION_PILOTE\s*=\s*["']?true["']?\s*$/m;

export function contenuExpose(texte) {
  return MOTIFS_QUESTIONS.some((motif) => motif.test(texte));
}

export function drapeauActif(env, fichiersEnv) {
  if (env.VITE_QUIZ_MEMORISATION_PILOTE === 'true') return 'variable d’environnement';
  for (const [nom, texte] of fichiersEnv) if (DRAPEAU.test(texte)) return nom;
  return null;
}

const fichiersJs = (dossier) =>
  readdirSync(dossier).flatMap((nom) => {
    const chemin = join(dossier, nom);
    if (statSync(chemin).isDirectory()) return fichiersJs(chemin);
    return /\.(m?js|map)$/.test(nom) ? [chemin] : [];
  });

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const dist = process.argv[2] ?? 'dist';
  const erreurs = [];
  const envs = readdirSync('.')
    .filter((n) => /^\.env(\.local|\.production(\.local)?)?$/.test(n))
    .map((n) => [n, readFileSync(n, 'utf8')]);
  const actif = drapeauActif(process.env, envs);
  if (actif) erreurs.push(`drapeau du pilote actif (${actif})`);
  if (!existsSync(dist)) erreurs.push(`dossier de build introuvable : ${dist}`);
  else for (const f of fichiersJs(dist)) if (contenuExpose(readFileSync(f, 'utf8'))) erreurs.push(`questions du pilote dans ${f}`);
  if (erreurs.length) {
    console.error('✗ Pilote « Mémoriser » exposé :\n  - ' + erreurs.join('\n  - '));
    process.exit(1);
  }
  console.log('✓ Pilote « Mémoriser » : drapeau éteint, aucune question dans le build.');
}
