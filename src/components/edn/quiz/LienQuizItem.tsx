import { Button } from '@/components/ui/button';
import type { QuestionMemo } from '@/data/quizMemorisation/types';
import { chargerQuestionsMemorisation, pilote } from '@/lib/quizMemorisationChargement';
import { cheminItemEdn } from '@/pages/edn-item/ednItemTabs';
import { Brain } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

interface LienQuizItemProps {
  itemCode: string;
  slugUrl: string;
  /** Accroche selon l’écran d’où l’on vient (fiche, chanson, planches…). */
  accroche?: string;
}

/**
 * Passerelle discrète d’une fiche, d’une chanson ou d’une planche vers les
 * questions de mémorisation du même item. N’affiche rien hors pilote, ni pour un
 * item sans question.
 */
export const LienQuizItem: React.FC<LienQuizItemProps> = ({
  itemCode,
  slugUrl,
  accroche = 'Fixer ces notions en quelques minutes',
}) => {
  const [questions, setQuestions] = useState<QuestionMemo[]>([]);

  useEffect(() => {
    if (!pilote()) return;
    let encore = true;
    chargerQuestionsMemorisation(itemCode)
      .then((q) => encore && setQuestions(q))
      .catch(() => encore && setQuestions([]));
    return () => { encore = false; };
  }, [itemCode]);

  if (questions.length === 0) return null;

  return (
    <div className="mt-6 flex flex-col gap-2 rounded-xl border border-primary/20 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-foreground">{accroche}</p>
      <Button asChild className="min-h-11" variant="outline">
        <Link to={cheminItemEdn(slugUrl, 'quiz')}>
          <Brain className="mr-2 h-4 w-4" aria-hidden="true" />
          Mémoriser avec le quiz
        </Link>
      </Button>
    </div>
  );
};
