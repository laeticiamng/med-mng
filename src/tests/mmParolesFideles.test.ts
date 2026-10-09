import { describe, expect, it } from 'vitest';
import {
  MOTS_NON_MOLECULES,
  REGLE_FIDELITE_SOURCE,
  ecartsNombres,
  moleculesAbsentesDeLaSource,
  motifNombresInventes,
  motifsInfideliteSource,
  nombresAbsentsDeLaSource,
  nombresDuTexte,
  ordinauxAbsentsDeLaSource,
  ressembleAMolecule,
} from '../../supabase/functions/_shared/mm-paroles-fideles';

// Textes de test neutres : aucune donnée médicale réelle n'est affirmée ici
// (les couples nombre/unité, ordinaux et molécules sont arbitraires) ; seule la
// mécanique de comparaison avec la source est vérifiée.
const SOURCE =
  'Seuil A à 38,5 ; contrôle à 48 h ; dose 0.5 ; 3 critères ; 1re intention';

const lignes = (...l: string[]) => l.join('\n');

describe('mm-paroles-fideles : aucun chiffre absent de la source', () => {
  it('accepte des paroles qui reprennent les nombres de la source (virgule ou point, zéros non significatifs, h = heures)', () => {
    const paroles = lignes(
      '[Couplet 1]',
      'Seuil A à 38.5',
      'Contrôle à 48 heures',
      'Dose 0,50',
      '3 critères à retenir'
    );
    expect(nombresAbsentsDeLaSource(paroles, SOURCE)).toEqual([]);
    expect(motifNombresInventes(paroles, SOURCE)).toBeNull();
    expect(motifsInfideliteSource(paroles, SOURCE)).toEqual([]);
  });

  it('refuse un nombre chanté absent de la source et le nomme dans le motif', () => {
    const paroles = lignes('[Refrain]', 'Seuil A à 39', 'Contrôle à 48 h', 'Dose 0,5 puis 72 h');
    expect(nombresAbsentsDeLaSource(paroles, SOURCE)).toEqual(['39', '72 h']);
    const motif = motifNombresInventes(paroles, SOURCE);
    expect(motif).toContain('« 39 »');
    expect(motif).toContain('« 72 h »');
  });

  it('ignore les nombres des lignes de structure ([Couplet 2], [Pont 4], « Refrain 2 : »)', () => {
    const paroles = lignes('[Couplet 2]', 'Seuil A à 38,5', '[Pont 4]', 'Refrain 2 :', '(Couplet 3)');
    expect(nombresAbsentsDeLaSource(paroles, SOURCE)).toEqual([]);
    expect(motifsInfideliteSource(paroles, SOURCE)).toEqual([]);
  });

  it('ne compte pas un nombre une seule fois en double', () => {
    const paroles = 'Dose 7\nDose 7 encore\nDose 7,0';
    expect(nombresAbsentsDeLaSource(paroles, SOURCE)).toEqual(['7']);
  });

  it('extrait les nombres normalisés de la source (ordinaux exclus)', () => {
    expect([...nombresDuTexte(SOURCE)].sort()).toEqual(['0.5', '3', '38.5', '48'].sort());
  });

  it("la règle ajoutée à l'invite exige la reprise à l'identique des chiffres, seuils et molécules", () => {
    expect(REGLE_FIDELITE_SOURCE).toMatch(/À L'IDENTIQUE/);
    expect(REGLE_FIDELITE_SOURCE).toMatch(/seuils/);
    expect(REGLE_FIDELITE_SOURCE).toMatch(/molécules/);
    expect(REGLE_FIDELITE_SOURCE).toMatch(/jamais apparaître/);
  });
});

describe('mm-paroles-fideles : couple nombre + unité (revue #227)', () => {
  // Exemple du relecteur : la source a « 5 jours » et « 10 mg ».
  const SRC = 'Durée X : 5 jours. Dose Y : 10 mg.';

  it('refuse « 5 mg » et « 10 jours » quand la source a « 5 jours » et « 10 mg »', () => {
    const paroles = lignes('Dose Y : 5 mg', 'Durée X : 10 jours');
    expect(nombresAbsentsDeLaSource(paroles, SRC)).toEqual(['5 mg', '10 jours']);
    const motif = motifNombresInventes(paroles, SRC)!;
    expect(motif).toContain('« 5 mg » (la source dit : 5 jours)');
    expect(motif).toContain('« 10 jours » (la source dit : 10 mg)');
  });

  it('accepte les bons couples, quelle que soit la graphie de l’unité', () => {
    const paroles = lignes('Pendant 5 jours', 'puis 5 j', 'Dose 10 mg', '10 milligrammes', '10mg');
    expect(nombresAbsentsDeLaSource(paroles, SRC)).toEqual([]);
  });

  it('accepte un nombre chanté sans unité s’il figure dans la source, refuse sinon', () => {
    expect(nombresAbsentsDeLaSource('Retiens le 5 et le 10', SRC)).toEqual([]);
    expect(nombresAbsentsDeLaSource('Retiens le 7', SRC)).toEqual(['7']);
    expect(nombresAbsentsDeLaSource('Pendant 7 jours', SRC)).toEqual(['7 jours']);
  });

  it('normalise espaces insécables, virgule/point décimal et µ (micro) / μ (mu grec) / mcg', () => {
    const src = 'A : 38,5 °C ; B : 2,5 mg ; C : 50 µg ; D : 10 %';
    const ok = lignes('A à 38.5°C', 'A : 38,5 degrés', 'B : 2.5 mg', 'C : 50 μg', 'C : 50 mcg', 'D : 10%', 'D : 10 pour cent');
    expect(nombresAbsentsDeLaSource(ok, src)).toEqual([]);
    expect(nombresAbsentsDeLaSource('C : 50 mg', src)).toEqual(['50 mg']);
    expect(nombresAbsentsDeLaSource('B : 2,5 g', src)).toEqual(['2,5 g']);
  });

  it('compare les unités composées (mmol/L, mg/kg/j, « par ») et refuse une autre unité', () => {
    const src = 'Seuil : 3,5 mmol/L ; dose : 15 mg/kg/j ; débit : 100/min';
    const ok = lignes('3,5 mmol par litre', '3.5 mmol/l', '15 mg/kg/j', '15 mg par kg par jour', '100 par minute');
    expect(nombresAbsentsDeLaSource(ok, src)).toEqual([]);
    expect(nombresAbsentsDeLaSource('3,5 mg/L', src)).toEqual(['3,5 mg/L']);
    expect(nombresAbsentsDeLaSource('15 mg/kg', src)).toEqual(['15 mg/kg']);
    expect(nombresAbsentsDeLaSource('100 mg', src)).toEqual(['100 mg']);
  });

  it('reconnaît les durées (semaines, mois, ans, h, min) et refuse une durée d’une autre unité', () => {
    const src = 'Délais : 6 semaines, 3 mois, 2 ans, 24 h, 30 min';
    const ok = lignes('6 sem', '3 mois', '2 années', '24 heures', '30 minutes');
    expect(nombresAbsentsDeLaSource(ok, src)).toEqual([]);
    expect(nombresAbsentsDeLaSource(lignes('6 mois', '3 semaines', '2 h', '24 min', '30 jours'), src)).toEqual([
      '6 mois',
      '3 semaines',
      '2 h',
      '24 min',
      '30 jours',
    ]);
  });

  it('propage l’unité d’un intervalle aux deux bornes (« 5 à 10 mg », « 120/80 mmHg »)', () => {
    const src = 'Plage : 5 à 10 mg ; cible 120/80 mmHg ; durée 5 jours';
    expect(nombresAbsentsDeLaSource(lignes('5 mg', 'de 5 à 10 mg', '120 mmHg', '80 mmHg'), src)).toEqual([]);
    // « 5 et 10 jours » : 10 n'est jamais associé à des jours dans la source.
    expect(nombresAbsentsDeLaSource('entre 5 et 10 jours', src)).toEqual(['10 jours']);
    // « 5 à 10 jours » quand la source n'a que « 5 à 10 mg » : les deux bornes sont refusées.
    expect(nombresAbsentsDeLaSource('de 5 à 10 jours', 'Plage : 5 à 10 mg')).toEqual(['5 à 10 jours', '10 jours']);
  });

  it('lit les milliers groupés (« 1 000 mg » = « 1000 mg ») et les nombres collés à une lettre (J7, CD4)', () => {
    const src = 'Dose : 1 000 mg ; contrôle à J7 ; seuil CD4';
    expect(nombresAbsentsDeLaSource(lignes('1000 mg', '1 000 mg', 'à J7', 'CD4'), src)).toEqual([]);
    expect(nombresAbsentsDeLaSource('à J8', src)).toEqual(['J8']);
    expect(nombresAbsentsDeLaSource('1000 g', src)).toEqual(['1000 g']);
  });

  it('ne confond pas « l’ » ou « j’ » avec une unité', () => {
    const src = 'Groupe 2 ; groupe 3';
    expect(nombresAbsentsDeLaSource("les 2 l'ont dit, les 3 j'y pense", src)).toEqual([]);
  });

  it('renvoie la source du même nombre pour guider la correction', () => {
    expect(ecartsNombres('5 mg', 'Durée 5 jours')).toEqual([{ chante: '5 mg', source: ['5 jours'] }]);
  });
});

describe('mm-paroles-fideles : ordinaux (revue #227)', () => {
  const SRC = 'Traitement de 1re intention ; 2e ligne ; premier trimestre ; troisième âge';

  it('accepte les ordinaux de la source sous toutes leurs graphies (1re/1ère/première, 2e/2ème/deuxième)', () => {
    const paroles = lignes(
      'En 1re intention',
      'en 1ère intention, en première intention',
      'puis 2ème ligne, deuxième ligne, 2e ligne',
      'au 1er trimestre',
      'au 3e âge, au troisième âge'
    );
    expect(ordinauxAbsentsDeLaSource(paroles, SRC)).toEqual([]);
    expect(motifsInfideliteSource(paroles, SRC)).toEqual([]);
  });

  it('refuse un ordinal chanté absent de la source (« 2e intention », « 3e trimestre », « 4e »)', () => {
    const paroles = lignes('En 2e intention', 'au 3e trimestre', 'en deuxième intention', 'le 4e');
    expect(ordinauxAbsentsDeLaSource(paroles, SRC)).toEqual(['2e intention', '3e trimestre', '4e']);
    const motifs = motifsInfideliteSource(paroles, SRC);
    expect(motifs).toHaveLength(1);
    expect(motifs[0]).toContain('« 2e intention » (la source dit : 1re intention)');
    expect(motifs[0]).toContain('« 3e trimestre » (la source dit : premier trimestre)');
    // Un ordinal n'est plus confondu avec un nombre cardinal.
    expect(nombresAbsentsDeLaSource(paroles, SRC)).toEqual([]);
  });

  it('refuse un ordinal en chiffres quand la source n’en contient aucun', () => {
    const src = 'Aucun ordre ici';
    expect(ordinauxAbsentsDeLaSource('En 1re intention', src)).toEqual(['1re intention']);
    expect(ordinauxAbsentsDeLaSource('Au 1er trimestre', src)).toEqual(['1er trimestre']);
    expect(ordinauxAbsentsDeLaSource('En 2nde ligne', src)).toEqual(['2nde ligne']);
    expect(ordinauxAbsentsDeLaSource('Le 3ème âge', src)).toEqual(['3ème âge']);
  });

  it('ignore les ordinaux des lignes de structure et les ordinaux en lettres sans nom médical', () => {
    const src = 'Aucun ordre ici';
    const paroles = lignes('[Couplet 2]', 'Refrain', '[Pont 3]', 'la première fois', 'pendant 30 secondes');
    expect(ordinauxAbsentsDeLaSource(paroles, src)).toEqual([]);
  });

  it('ignore les ordinaux portés par les exposants Unicode comme les autres (1ᵉʳ, 2ᵉ)', () => {
    expect(ordinauxAbsentsDeLaSource('au 1ᵉʳ trimestre', SRC)).toEqual([]);
    expect(ordinauxAbsentsDeLaSource('en 2ᵉ intention', SRC)).toEqual(['2e intention']);
  });
});

describe('mm-paroles-fideles : molécules (revue #227)', () => {
  const SRC = 'Molécule X : amoxicilline ; molécule Y : lévofloxacine ; classe : statines';

  it('accepte une molécule de la source, sans tenir compte de la casse, des accents, du pluriel ou de l’élision', () => {
    const paroles = lignes('Amoxicilline en tête', "puis l'amoxicilline", 'levofloxacine', 'Lévofloxacines', 'les statines');
    expect(moleculesAbsentesDeLaSource(paroles, SRC)).toEqual([]);
  });

  it('refuse une molécule absente de la source et la nomme', () => {
    const paroles = lignes('Ramipril le matin', "l'énoxaparine", 'Métronidazole', 'ceftriaxone', 'ramipril encore');
    expect(moleculesAbsentesDeLaSource(paroles, SRC)).toEqual(['Ramipril', 'énoxaparine', 'Métronidazole', 'ceftriaxone']);
    const motifs = motifsInfideliteSource(paroles, SRC);
    expect(motifs).toHaveLength(1);
    expect(motifs[0]).toContain('« Ramipril »');
    expect(motifs[0]).toContain('« énoxaparine »');
  });

  it('détecte les terminaisons de DCI usuelles', () => {
    for (const m of [
      'pénicilline', 'vancomycine', 'doxycycline', 'ciprofloxacine', 'fluconazole', 'oméprazole',
      'bisoprolol', 'périndopril', 'losartan', 'atorvastatine', 'héparine', 'apixaban',
      'dabigatran', 'rituximab', 'imatinib', 'liraglutide', 'furosémide', 'hydrochlorothiazide',
      'amlodipine', 'diazépam', 'paracétamol',
    ]) {
      expect(ressembleAMolecule(m), m).toBe(true);
    }
  });

  it('ne prend pas les mots courants pour des molécules (liste blanche testée)', () => {
    for (const mot of [
      ...MOTS_NON_MOLECULES,
      'peptides', 'Platine', 'statine', 'intention', 'ligne', 'personne', 'africaine',
      'cyclone', 'maison', 'tension', 'patient', 'cœur', 'sang', 'pompe',
    ]) {
      expect(ressembleAMolecule(mot), mot).toBe(false);
    }
    expect(moleculesAbsentesDeLaSource('Un peptide, du platine, la personne africaine', SRC)).toEqual([]);
  });

  it('ignore les molécules des lignes de structure', () => {
    expect(moleculesAbsentesDeLaSource('[Refrain ramipril]', SRC)).toEqual([]);
  });
});

describe('mm-paroles-fideles : motifs combinés', () => {
  it('renvoie un motif par famille d’écart, chacun nommant le texte fautif', () => {
    const src = 'Durée 5 jours ; 1re intention ; amoxicilline';
    const paroles = lignes('[Couplet 1]', '5 mg', 'en 2e intention', 'ramipril');
    const motifs = motifsInfideliteSource(paroles, src);
    expect(motifs).toHaveLength(3);
    expect(motifs[0]).toMatch(/^chiffres .*« 5 mg » \(la source dit : 5 jours\)/);
    expect(motifs[1]).toMatch(/^ordinaux .*« 2e intention » \(la source dit : 1re intention\)/);
    expect(motifs[2]).toMatch(/^molécules .*« ramipril »/);
  });
});

describe('generer-paroles-item : la règle de fidélité est branchée', () => {
  it("l'invite système contient la règle et le contrôle de qualité appelle la vérification complète", async () => {
    const { readFileSync } = await import('node:fs');
    const code = readFileSync('supabase/functions/generer-paroles-item/index.ts', 'utf8');
    expect(code).toContain('${REGLE_FIDELITE_SOURCE}');
    expect(code).toMatch(/motifs\.push\(\.\.\.motifsInfideliteSource\(paroles, source\)\)/);
    // L'interdiction d'inventer, déjà présente, est conservée.
    expect(code).toContain("N'invente aucun fait, aucun chiffre, aucune molécule");
  });
});
