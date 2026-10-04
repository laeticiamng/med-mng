import fs from 'node:fs';
import { DOSSIER_SESSIONS } from './helpers';

/** Supprime les états de session (jetons) écrits par connexion.setup.ts. */
export default async function globalTeardown() {
  fs.rmSync(DOSSIER_SESSIONS, { recursive: true, force: true });
}
