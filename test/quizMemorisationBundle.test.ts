import { describe, expect, it } from 'vitest';
import { contenuExpose, drapeauActif } from '../scripts/quiz-memorisation/verifier-bundle.mjs';

describe('garde-fou du bundle de production (pilote « Mémoriser »)', () => {
  it('détecte une question du pilote dans un fichier du build', () => {
    expect(contenuExpose('const q={id:"M217-A5",question:"…"}')).toBe(true);
    expect(contenuExpose('x={extraitReferentiel:"…"}')).toBe(true);
    expect(contenuExpose('function QuizMemorisation(){return "Les essentiels"}')).toBe(false);
  });
  it('détecte le drapeau actif, dans l’environnement ou un .env.production', () => {
    expect(drapeauActif({ VITE_QUIZ_MEMORISATION_PILOTE: 'true' }, [])).toBeTruthy();
    expect(drapeauActif({}, [['.env.production', 'A=1\nVITE_QUIZ_MEMORISATION_PILOTE=true\n']])).toBe('.env.production');
    expect(drapeauActif({ VITE_QUIZ_MEMORISATION_PILOTE: 'false' }, [['.env.production', 'VITE_QUIZ_MEMORISATION_PILOTE=false']])).toBeNull();
    expect(drapeauActif({}, [])).toBeNull();
  });
});
