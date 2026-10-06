import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  NOTES_ACTUALISATION,
  noteActualisation,
  objectifsCitesDuChapitre,
  texteNoteActualisation,
} from '@/config/notesActualisation';
import { NoteActualisation } from '../NoteActualisation';
import { CompetenceCardOptimized } from '../tableau/CompetenceCardOptimized';

vi.mock('@/hooks/useActivityTracking', () => ({
  useActivityTracking: () => ({ logActivity: vi.fn() }),
}));
vi.mock('@/hooks/useGamification', () => ({
  useGamification: () => ({
    stats: null,
    loadStats: vi.fn(),
    addPoints: vi.fn(),
  }),
}));
vi.mock('@/hooks/useOicCompetences', () => ({
  useOicCompetences: () => ({ competences: [], loading: false }),
}));
vi.mock('@/integrations/supabase/client', () => ({
  supabase: { auth: { getUser: async () => ({ data: { user: null } }) } },
}));
vi.mock('@/utils/exportUtils', () => ({
  exportToPDF: vi.fn(),
  shareContent: vi.fn(),
}));
// Bouton « Signaler une erreur » (CF-10) : visiteur non connecté.
vi.mock('@/components/med-mng/AuthProvider', () => ({
  useAuth: () => ({ user: null, loading: false }),
}));

// Texte EXACT du dossier DECISIONS_MEDICALES.md, section DC2 « Texte prêt (option B) ».
const TEXTE_DOSSIER =
  "Note d'actualisation — HAS. Choix et durées d'antibiothérapies : OMA purulente de l'enfant (validée le 15.07.2021, " +
  'mise à jour le 14.05.2025) : amoxicilline 80 mg/kg/j en 2 prises, sans dépasser 3 g/j, pendant 10 jours avant 2 ans ' +
  "et 5 jours après 2 ans (10 jours si otorrhée ou otite récidivante). OMA purulente de l'adulte (mise à jour le " +
  '13.05.2025) : amoxicilline 3 g/j en 3 prises pendant 5 jours. Le texte ci-dessus reproduit la compétence du ' +
  'référentiel LiSA 2026.';

const URL_ENFANT =
  'https://www.has-sante.fr/jcms/c_2722749/fr/choix-et-durees-d-antibiotherapies-otite-moyenne-aigue-purulente-de-l-enfant';
const URL_ADULTE =
  'https://www.has-sante.fr/jcms/c_2722670/fr/otite-moyenne-aigue-purulente-de-l-adulte';

describe('DC2 — note d’actualisation HAS sous OIC-150-06-A', () => {
  it('le texte de la note est exactement celui du dossier', () => {
    const note = noteActualisation('OIC-150-06-A');
    expect(note).not.toBeNull();
    expect(texteNoteActualisation(note!)).toBe(TEXTE_DOSSIER);
  });

  it('cite les deux pages HAS avec leurs dates', () => {
    const note = noteActualisation('oic-150-06-a')!;
    expect(note.sources.map((s) => s.url)).toEqual([URL_ENFANT, URL_ADULTE]);
    expect(note.sources[0].libelle).toContain('mise à jour le 14.05.2025');
    expect(note.sources[1].libelle).toContain('mise à jour le 13.05.2025');
  });

  it('une seule compétence est annotée ; les autres n’ont pas de note', () => {
    expect(Object.keys(NOTES_ACTUALISATION)).toEqual(['OIC-150-06-A']);
    expect(noteActualisation('OIC-150-05-B')).toBeNull();
    expect(noteActualisation(undefined)).toBeNull();
  });

  it('le composant affiche la note et les deux liens, et rien pour une autre compétence', () => {
    const { container, rerender } = render(
      <NoteActualisation objectifId="OIC-150-06-A" />
    );
    const note = screen.getByTestId('note-actualisation');
    expect(note.textContent?.replace(/\s+/g, ' ')).toContain(TEXTE_DOSSIER);
    const liens = screen.getAllByRole('link');
    expect(liens.map((a) => a.getAttribute('href'))).toEqual([
      URL_ENFANT,
      URL_ADULTE,
    ]);
    liens.forEach((a) =>
      expect(a).toHaveAttribute('rel', 'noopener noreferrer')
    );
    rerender(<NoteActualisation objectifId="OIC-150-07-B" />);
    expect(container).toBeEmptyDOMElement();
  });

  it('sous la compétence (onglet Rang A), carte fermée, le texte LiSA restant inchangé', () => {
    const texteLisa =
      'Chez enfant : amoxicilline 80-90mg/kg/j 8-10j (enfant <2 ans) ; 5j (enfant>2 ans)';
    render(
      <CompetenceCardOptimized
        competence={{
          objectif_id: 'OIC-150-06-A',
          intitule: 'Connaître le traitement',
          description: texteLisa,
        }}
        index={0}
        rang="A"
      />
    );
    expect(screen.getByText(texteLisa)).toBeInTheDocument();
    expect(screen.getByTestId('note-actualisation')).toHaveTextContent(
      "Note d'actualisation — HAS."
    );
  });

  it('extrait les compétences citées par un chapitre (chaînes ou objets)', () => {
    expect(
      objectifsCitesDuChapitre([
        'OIC-150-06-A',
        { objectif_id: 'oic-150-02-b' },
        null,
        3,
      ])
    ).toEqual(['OIC-150-06-A', 'OIC-150-02-B']);
    expect(objectifsCitesDuChapitre(undefined)).toEqual([]);
  });

  it('sous le chapitre du récit qui cite OIC-150-06-A, et pas sous les autres', async () => {
    const { RomanNarratif } = await import('../RomanNarratif');
    render(
      <RomanNarratif
        itemCode="IC-150"
        title="Otites infectieuses"
        romanStory={
          [
            {
              titre: "L'ordonnance",
              texte: 'Amoxicilline, dix jours.',
              competences: ['OIC-150-06-A', 'OIC-150-02-B'],
            },
            {
              titre: 'Le nageur',
              texte: 'Otite externe.',
              competences: ['OIC-150-08-A'],
            },
          ] as never
        }
      />
    );
    const note = screen.getByTestId('note-actualisation');
    expect(note).toHaveTextContent(
      "Ce chapitre s'appuie sur la compétence OIC-150-06-A."
    );
    expect(note.textContent?.replace(/\s+/g, ' ')).toContain(TEXTE_DOSSIER);
    expect(screen.getByText('Amoxicilline, dix jours.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Suivant/ }));
    expect(screen.getByText('Otite externe.')).toBeInTheDocument();
    expect(screen.queryByTestId('note-actualisation')).toBeNull();
  });
});
