import { act, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('./OicQuizGenerator', () => ({
  OicQuizGenerator: ({ itemCode }: { itemCode: string }) => <div data-testid="oic">{itemCode}</div>,
}));
vi.mock('./QuizMemorisation', () => ({
  QuizMemorisation: ({ questions, pilote }: { questions: unknown[]; pilote: boolean }) => (
    <div data-testid="memo">{questions.length} questions{pilote ? ' (pilote)' : ''}</div>
  ),
}));

import { LienQuizItem } from './LienQuizItem';
import { QuizItemModes } from './QuizItemModes';

afterEach(() => vi.unstubAllEnvs());

const rendre = async (ui: React.ReactElement) => {
  await act(async () => {
    render(<MemoryRouter>{ui}</MemoryRouter>);
  });
};

describe('QuizItemModes', () => {
  it('sans drapeau : uniquement le quiz existant, aucun onglet (aucune régression)', async () => {
    vi.stubEnv('VITE_QUIZ_MEMORISATION_PILOTE', 'false');
    await rendre(<QuizItemModes itemCode="IC-160" itemTitle="Tétanos" />);
    expect(screen.getByTestId('oic')).toHaveTextContent('IC-160');
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
    expect(screen.queryByTestId('memo')).not.toBeInTheDocument();
  });

  it('pilote actif sur un item pilote : « Mémoriser » par défaut, « Reconnaître les compétences » en second mode', async () => {
    vi.stubEnv('VITE_QUIZ_MEMORISATION_PILOTE', 'true');
    await rendre(<QuizItemModes itemCode="IC-160" itemTitle="Tétanos" />);
    expect(await screen.findByTestId('memo')).toHaveTextContent('8 questions (pilote)');
    expect(screen.getByRole('tab', { name: 'Mémoriser' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Reconnaître les compétences' })).toBeInTheDocument();
    expect(screen.queryByTestId('oic')).not.toBeInTheDocument();
  });

  it('pilote actif sur un item sans question : quiz existant seul', async () => {
    vi.stubEnv('VITE_QUIZ_MEMORISATION_PILOTE', 'true');
    await rendre(<QuizItemModes itemCode="IC-1" itemTitle="Relation" />);
    expect(await screen.findByTestId('oic')).toBeInTheDocument();
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
  });
});

describe('LienQuizItem — passerelle vers le quiz de l’item', () => {
  it('pointe vers la sous-page quiz de l’item quand le pilote a des questions', async () => {
    vi.stubEnv('VITE_QUIZ_MEMORISATION_PILOTE', 'true');
    await rendre(<LienQuizItem itemCode="IC-247" slugUrl="ic-247" />);
    const lien = await screen.findByRole('link', { name: /Mémoriser avec le quiz/ });
    expect(lien).toHaveAttribute('href', '/edn-complete/ic-247/quiz');
  });

  it('n’affiche rien sans drapeau ni pour un item sans question', async () => {
    vi.stubEnv('VITE_QUIZ_MEMORISATION_PILOTE', 'false');
    await rendre(<LienQuizItem itemCode="IC-247" slugUrl="ic-247" />);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    vi.stubEnv('VITE_QUIZ_MEMORISATION_PILOTE', 'true');
    await rendre(<LienQuizItem itemCode="IC-1" slugUrl="ic-1" />);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});
