import { describe, expect, it } from 'vitest';
import { contientRecherche, motifRecherche } from './motifRecherche';

/**
 * Non-régression (critique finale, 05.10.2026, production) : « accident vasculaire cérébral »
 * ne trouvait pas l'IC-340 « Accidents vasculaires cérébraux ».
 */
describe('motifRecherche : singulier et pluriel confondus', () => {
  it('trouve un titre au pluriel depuis une recherche au singulier, et inversement', () => {
    expect(contientRecherche('Accidents vasculaires cérébraux', 'accident vasculaire cérébral')).toBe(true);
    expect(contientRecherche('Accidents vasculaires cérébraux', 'accident vasculaire cerebral')).toBe(true);
    expect(contientRecherche('Otites infectieuses de l\'adulte et de l\'enfant', 'otite infectieuse')).toBe(true);
    expect(contientRecherche('Infection urinaire', 'infections urinaires')).toBe(true);
    expect(contientRecherche('Œdème de Quincke et anaphylaxie', 'oedemes de quincke')).toBe(true);
  });

  it('ignore accents et casse (diabete → Diabète)', () => {
    expect(contientRecherche('Diabète sucré de type 1 et 2 de l\'enfant et de l\'adulte', 'diabete sucre')).toBe(true);
    expect(contientRecherche('Diabète gestationnel', 'DIABETE')).toBe(true);
  });

  it('garde les mots singuliers en -s, -x, -is, -us', () => {
    expect(contientRecherche('Abcès cutané', 'abces')).toBe(true);
    expect(contientRecherche('Reflux gastro-œsophagien', 'reflux gastro oesophagien')).toBe(true);
    expect(contientRecherche('Sepsis et choc septique', 'sepsis')).toBe(true);
    expect(contientRecherche('Infections à virus', 'virus')).toBe(true);
  });

  it('ne trouve pas ce qui n’y est pas, et exige les séparateurs entre les mots', () => {
    expect(contientRecherche('Ulcère de jambe', 'ulcere gastrique')).toBe(false);
    expect(contientRecherche("l'otite externe et séro-muqueuse", 'seromuqueuse')).toBe(false);
    expect(contientRecherche("l'otite externe et séro-muqueuse", 'séro muqueuse')).toBe(true);
  });

  it('reste compatible PostgreSQL (imatch) : aucune construction propre à JavaScript', () => {
    const motif = motifRecherche('accident vasculaire cérébral')!;
    expect(motif).not.toMatch(/\\[bdwsDWS]|\(\?/);
    expect(motifRecherche('ot')).toBeNull();
  });
});
