import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { QUESTIONS_IC_160 } from '@/data/quizMemorisation/ic-160';
import type { QuestionMemo } from '@/data/quizMemorisation/types';
import { cleStockageNotions } from '@/utils/quizMemorisation';

const m = vi.hoisted(() => ({
  toastErreur: vi.fn(),
  insert: vi.fn(),
  getSession: vi.fn(),
  enregistrer: vi.fn(),
}));
vi.mock('@/hooks/useSRS', () => ({ useSRS: () => ({ recordReview: vi.fn().mockResolvedValue({ success: true }) }) }));
vi.mock('@/integrations/supabase/client', () => ({
  supabase: { auth: { getSession: m.getSession }, from: vi.fn(() => ({ insert: m.insert })) },
}));
vi.mock('@/lib/progressionQuiz', () => ({ enregistrerProgressionQuiz: m.enregistrer }));

vi.mock('sonner', () => ({ toast: { error: m.toastErreur } }));

import { QuizMemorisation } from './QuizMemorisation';

const QUESTIONS: QuestionMemo[] = [...QUESTIONS_IC_160];
const echapper = (t: string) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Question actuellement affichée, retrouvée par son énoncé. */
const courante = (): QuestionMemo => {
  const titre = screen.getByRole('heading', { level: 3 }).textContent;
  const trouvee = QUESTIONS.find((q) => q.question === titre);
  if (!trouvee) throw new Error(`Question inconnue : ${titre}`);
  return trouvee;
};
const optionFausse = (q: Extract<QuestionMemo, { type: 'qcm' }>) => q.options.find((_, i) => i !== q.indexCorrect)!;

/** Répond à la question courante : `bien` = bonne réponse / « Je le savais ». */
const repondre = (bien: boolean) => {
  const q = courante();
  if (q.type === 'qcm') {
    const choix = bien ? q.options[q.indexCorrect] : optionFausse(q);
    fireEvent.click(screen.getByRole('button', { name: new RegExp(echapper(choix)) }));
    fireEvent.click(screen.getByRole('button', { name: /Suivant|Voir le bilan/ }));
  } else {
    fireEvent.click(screen.getByRole('button', { name: /Afficher la réponse/ }));
    fireEvent.click(screen.getByRole('button', { name: bien ? /Je le savais/ : /À revoir/ }));
  }
};

// La lecture de la session est asynchrone : on attend qu'elle soit résolue avant d'interagir.
const rendre = async (questions = QUESTIONS, pilote = true) => {
  await act(async () => {
    render(<QuizMemorisation itemCode="IC-160" itemTitle="Tétanos" questions={questions} pilote={pilote} />);
  });
};

// src/tests/setup.ts remplace localStorage par des vi.fn() inertes : on lui donne une vraie mémoire.
const memoire = new Map<string, string>();
beforeEach(() => {
  memoire.clear();
  vi.mocked(window.localStorage.getItem).mockImplementation((cle) => memoire.get(cle) ?? null);
  vi.mocked(window.localStorage.setItem).mockImplementation((cle, valeur) => void memoire.set(cle, String(valeur)));
  m.toastErreur.mockReset();
  m.insert.mockReset().mockResolvedValue({ error: null });
  m.enregistrer.mockReset().mockResolvedValue({ historique: true, carte: true });
  m.getSession.mockReset().mockResolvedValue({ data: { session: { user: { id: 'u1' } } } });
});

describe('QuizMemorisation — parcours', () => {
  it('propose les deux rangs avec le bandeau « pilote » et sans vocabulaire d’examen', async () => {
    await rendre();
    expect(screen.getByText(/en cours de relecture médicale/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Les essentiels/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Pour aller plus loin/ })).toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/examen|concours|chrono|EDN blanc/i);
  });

  it('masque le bandeau « pilote » hors pilote et n’offre que les rangs disponibles', async () => {
    await rendre(QUESTIONS.filter((q) => q.rang === 'A'), false);
    expect(screen.queryByText(/relecture médicale/)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Pour aller plus loin/ })).not.toBeInTheDocument();
  });

  it('corrige immédiatement : bonne réponse signalée, explication courte, options verrouillées', async () => {
    await rendre();
    fireEvent.click(screen.getByRole('button', { name: /Les essentiels/ }));
    const q = courante();
    expect(q.type).toBe('qcm');
    if (q.type !== 'qcm') return;
    expect(screen.queryByTestId('memo-explication')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: new RegExp(echapper(optionFausse(q))) }));

    expect(screen.getByTestId('memo-explication')).toHaveTextContent(q.explication);
    const bonne = screen.getByRole('button', { name: new RegExp(echapper(q.options[q.indexCorrect])) });
    expect(bonne).toHaveAttribute('data-etat', 'bonne');
    expect(bonne).toHaveTextContent(/bonne réponse/);
    expect(screen.getAllByRole('button').filter((b) => b.hasAttribute('data-etat') && !(b as HTMLButtonElement).disabled)).toHaveLength(0);
  });

  it('rappel actif : la réponse est cachée jusqu’à la demande, puis auto-évaluation', async () => {
    await rendre();
    fireEvent.click(screen.getByRole('button', { name: /Les essentiels/ }));
    repondre(true); // A1 (QCM)
    const q = courante();
    expect(q.type).toBe('rappel');
    if (q.type !== 'rappel') return;
    expect(screen.queryByText(q.reponse)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Je le savais/ })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Afficher la réponse/ }));
    expect(screen.getByText(q.reponse)).toBeInTheDocument();
    expect(screen.getByTestId('memo-explication')).toBeInTheDocument();
  });

  it('une série tout juste : bilan sans notion à revoir, résultat enregistré une fois', async () => {
    await rendre();
    fireEvent.click(screen.getByRole('button', { name: /Les essentiels/ }));
    for (let i = 0; i < 5; i++) repondre(true);

    expect(screen.getByTestId('memo-bilan')).toHaveTextContent('5 notions retenues sur 5');
    expect(screen.queryByRole('button', { name: /Revoir les notions manquées/ })).not.toBeInTheDocument();
    await waitFor(() => expect(m.insert).toHaveBeenCalledTimes(1));
    const ligne = m.insert.mock.calls[0][0];
    expect(ligne).toMatchObject({
      user_id: 'u1', item_code: 'IC-160', item_title: 'Tétanos',
      score: 100, total_questions: 5, correct_answers: 5, wrong_answers: 0,
    });
    expect(ligne.answers).toMatchObject({ mode: 'memorisation', rang: 'A' });
    expect(ligne.answers.notions).toHaveLength(5);
    await waitFor(() => expect(m.enregistrer).toHaveBeenCalledWith(expect.anything(), expect.any(Function), { userId: 'u1', itemCode: 'IC-160', pourcentage: 100 }));
  });

  it('rappelle les erreurs : liste, rejeu des seules notions manquées, puis elles sortent de la liste', async () => {
    await rendre();
    fireEvent.click(screen.getByRole('button', { name: /Les essentiels/ }));
    const ids: string[] = [];
    // 2 erreurs sur 5 (questions 1 et 3)
    [false, true, false, true, true].forEach((bien) => { ids.push(courante().id); repondre(bien); });

    expect(screen.getByTestId('memo-bilan')).toHaveTextContent('3 notions retenues sur 5');
    const liste = screen.getByRole('list', { name: 'Notions à revoir' });
    expect(liste.querySelectorAll('li')).toHaveLength(2);
    expect(JSON.parse(localStorage.getItem(cleStockageNotions('u1'))!)).toHaveProperty(ids[0]);
    await waitFor(() => expect(m.insert).toHaveBeenCalledTimes(1));
    expect(m.insert.mock.calls[0][0]).toMatchObject({ score: 60, correct_answers: 3, wrong_answers: 2 });

    // Rejeu : seulement les 2 notions manquées, sans nouvelle ligne de résultat.
    fireEvent.click(screen.getByRole('button', { name: /Revoir les notions manquées/ }));
    expect(screen.getByText('1 / 2')).toBeInTheDocument();
    repondre(true);
    repondre(true);
    expect(screen.getByTestId('memo-bilan')).toHaveTextContent('2 notions retenues sur 2');
    expect(m.insert).toHaveBeenCalledTimes(1);
    expect(JSON.parse(localStorage.getItem(cleStockageNotions('u1'))!)).toEqual({});
  });

  it('remet en premier, dès l’accueil suivant, les notions ratées', async () => {
    localStorage.setItem(cleStockageNotions('u1'), JSON.stringify({ 'M160-A5': { erreurs: 2, dernier: '2026-10-14T10:00:00Z' } }));
    await rendre();
    await waitFor(() => expect(screen.getByTestId('memo-a-revoir')).toHaveTextContent('1 notion à revoir'));
    fireEvent.click(screen.getByRole('button', { name: /Les essentiels/ }));
    expect(courante().id).toBe('M160-A5');
  });

  it('visiteur sans compte : parcours complet, rien n’est envoyé, invitation à se connecter', async () => {
    m.getSession.mockResolvedValue({ data: { session: null } });
    await rendre();
    fireEvent.click(screen.getByRole('button', { name: /Pour aller plus loin/ }));
    repondre(true);
    repondre(false);
    expect(screen.getByTestId('memo-bilan')).toHaveTextContent('1 notion retenue sur 2');
    expect(m.insert).not.toHaveBeenCalled();
    expect(m.enregistrer).not.toHaveBeenCalled();
    expect(screen.getByText(/Connectez-vous/)).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem(cleStockageNotions(null))!)).toBeTruthy();
  });

  it('un échec d’enregistrement ne bloque pas le bilan et n’écrit pas la progression', async () => {
    const erreur = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    m.insert.mockResolvedValue({ error: { message: 'hors connexion' } });
    await rendre();
    fireEvent.click(screen.getByRole('button', { name: /Pour aller plus loin/ }));
    repondre(true);
    repondre(true);
    expect(screen.getByTestId('memo-bilan')).toHaveTextContent('2 notions retenues sur 2');
    await waitFor(() => expect(m.insert).toHaveBeenCalled());
    expect(m.enregistrer).not.toHaveBeenCalled();
    // L'étudiant est prévenu : le résultat n'est pas enregistré.
    expect(m.toastErreur).toHaveBeenCalledWith(expect.stringMatching(/non enregistré/));
    erreur.mockRestore();
  });

  it('prévient aussi quand le suivi de révision (historique ou carte) n’est pas mis à jour', async () => {
    m.enregistrer.mockResolvedValue({ historique: true, carte: false });
    await rendre();
    fireEvent.click(screen.getByRole('button', { name: /Pour aller plus loin/ }));
    repondre(true);
    repondre(true);
    await waitFor(() => expect(m.toastErreur).toHaveBeenCalledWith(expect.stringMatching(/suivi de révision/)));
  });

  it('ne prévient pas quand tout est enregistré', async () => {
    await rendre();
    fireEvent.click(screen.getByRole('button', { name: /Pour aller plus loin/ }));
    repondre(true);
    repondre(true);
    await waitFor(() => expect(m.enregistrer).toHaveBeenCalled());
    expect(m.toastErreur).not.toHaveBeenCalled();
  });

  it('ne plante pas sans aucune question', async () => {
    await rendre([]);
    expect(screen.getByText(/Aucune question de mémorisation/)).toBeInTheDocument();
  });
});
