import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ERRATA_DE_FOND, errataDeFond } from '@/config/errataLisa';
import { AnnotationsCompetence } from '../AnnotationsCompetence';
import { ErrataCompetence } from '../ErrataCompetence';
import { CompetenceCardOptimized } from '../tableau/CompetenceCardOptimized';

// Valeurs réelles de oic_competences.contenu_detaille.corrections (SELECT du 06.10.2026).
const DOBUTAMINE = {
  avant: 'médicament β2 mimétique',
  apres: 'médicament β1 mimétique',
  motif: 'la dobutamine est un agoniste β1 (cf. OIC-234-23-B)',
};
const COQUILLE = {
  avant: 'urgence virale',
  apres: 'urgence vitale',
  motif: 'coquille',
};
const HYPOGLYCEMIE = [
  {
    avant: '<70 mg/l',
    apres: '<0,70 g/l',
    motif: 'unité erronée (70 mg/dl = 0,70 g/l)',
  },
  {
    avant: '<54 mg/l',
    apres: '<0,54 g/l',
    motif: 'unité erronée (54 mg/dl = 0,54 g/l)',
  },
];
const LIGNE_DOBUTAMINE =
  'Texte LiSA : « médicament β2 mimétique » — erratum Med MNG : « médicament β1 mimétique » (la dobutamine est un agoniste β1 (cf. OIC-234-23-B))';

describe('CF-10 bis — errata de fond affichés en clair', () => {
  it('liste blanche : les 10 corrections de fond du dossier, sur 9 compétences', () => {
    expect(ERRATA_DE_FOND).toHaveLength(10);
    expect(new Set(ERRATA_DE_FOND.map((e) => e.objectif_id)).size).toBe(9);
    expect(ERRATA_DE_FOND.map((e) => e.objectif_id)).toEqual([
      'OIC-104-01-B',
      'OIC-104-16-A',
      'OIC-128-05-A',
      'OIC-177-12-B',
      'OIC-222-06-B',
      'OIC-245-07-A',
      'OIC-247-17-A',
      'OIC-247-17-A',
      'OIC-332-11-B',
      'OIC-344-01-A',
    ]);
  });

  it('garde les corrections de fond, écarte les coquilles et les entrées mal formées', () => {
    expect(errataDeFond('OIC-332-11-B', [DOBUTAMINE, COQUILLE])).toEqual([
      DOBUTAMINE,
    ]);
    expect(errataDeFond('OIC-332-09-A', [COQUILLE])).toEqual([]);
    // Même texte « avant », mais sur une autre compétence : pas d'erratum.
    expect(errataDeFond('OIC-332-10-B', [DOBUTAMINE])).toEqual([]);
    expect(errataDeFond('OIC-247-17-A', HYPOGLYCEMIE)).toEqual(HYPOGLYCEMIE);
    expect(
      errataDeFond('OIC-332-11-B', [{ avant: 'médicament β2 mimétique' }])
    ).toEqual([]);
    expect(errataDeFond('OIC-332-11-B', null)).toEqual([]);
    expect(errataDeFond(undefined, [DOBUTAMINE])).toEqual([]);
  });

  it('format « Texte LiSA : … — erratum Med MNG : … (motif) »', () => {
    render(
      <ErrataCompetence
        objectifId="OIC-332-11-B"
        corrections={[DOBUTAMINE, COQUILLE]}
      />
    );
    const erratum = screen.getByTestId('erratum-med-mng');
    expect(erratum).toHaveAttribute('role', 'note');
    expect(screen.getAllByRole('listitem')).toHaveLength(1);
    expect(screen.getByRole('listitem').textContent?.replace(/\s+/g, ' ')).toBe(
      LIGNE_DOBUTAMINE
    );
    expect(erratum).not.toHaveTextContent('urgence virale');
  });

  it('deux errata sur la même compétence (OIC-247-17-A)', () => {
    render(
      <AnnotationsCompetence
        objectifId="OIC-247-17-A"
        corrections={HYPOGLYCEMIE}
      />
    );
    expect(
      screen
        .getAllByRole('listitem')
        .map((li) => li.textContent?.replace(/\s+/g, ' '))
    ).toEqual([
      'Texte LiSA : « <70 mg/l » — erratum Med MNG : « <0,70 g/l » (unité erronée (70 mg/dl = 0,70 g/l))',
      'Texte LiSA : « <54 mg/l » — erratum Med MNG : « <0,54 g/l » (unité erronée (54 mg/dl = 0,54 g/l))',
    ]);
  });

  it('coquille seule : rien n’est affiché', () => {
    const { container } = render(
      <AnnotationsCompetence
        objectifId="OIC-332-09-A"
        corrections={[COQUILLE]}
      />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('sous la compétence OIC-332-11-B (onglet Rang B) : carte fermée et ouverte, coquilles non listées', () => {
    render(
      <CompetenceCardOptimized
        competence={{
          objectif_id: 'OIC-332-11-B',
          intitule:
            'Connaître les principes du traitement du choc cardiogénique',
          description: 'Dobutamine : médicament β1 mimétique',
          corrections: [DOBUTAMINE, COQUILLE],
        }}
        index={0}
        rang="B"
      />
    );
    expect(
      screen.getByTestId('erratum-med-mng').textContent?.replace(/\s+/g, ' ')
    ).toContain(LIGNE_DOBUTAMINE);
    fireEvent.click(screen.getByRole('button', { expanded: false }));
    expect(screen.getAllByTestId('erratum-med-mng')).toHaveLength(1);
    // L'ancien encadré (toutes corrections, coquilles comprises) n'existe plus.
    expect(screen.queryByText(/Corrigé par Med MNG/)).toBeNull();
    expect(screen.queryByText(/urgence virale/)).toBeNull();
  });
});
