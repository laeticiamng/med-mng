import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { QuestionMemo } from '@/data/quizMemorisation/types';
import { chargerQuestionsMemorisation, pilote } from '@/lib/quizMemorisationChargement';
import React, { useEffect, useState } from 'react';
import { OicQuizGenerator } from './OicQuizGenerator';
import { QuizMemorisation } from './QuizMemorisation';

interface QuizItemModesProps {
  itemCode: string;
  itemTitle: string;
}

/**
 * Quiz d’un item : « Mémoriser » (pilote) et « Reconnaître les compétences »
 * (quiz existant). Sans le drapeau du pilote, ou pour un item sans question de
 * mémorisation, seul le quiz existant est rendu — comportement inchangé.
 */
export const QuizItemModes: React.FC<QuizItemModesProps> = ({ itemCode, itemTitle }) => {
  const actif = pilote();
  const [questions, setQuestions] = useState<QuestionMemo[] | null>(actif ? null : []);

  useEffect(() => {
    if (!actif) return;
    let encore = true;
    setQuestions(null);
    chargerQuestionsMemorisation(itemCode)
      .then((q) => encore && setQuestions(q))
      .catch(() => encore && setQuestions([]));
    return () => { encore = false; };
  }, [actif, itemCode]);

  if (questions === null) {
    return <div className="h-64 animate-pulse rounded-xl bg-muted" aria-busy="true" />;
  }
  if (questions.length === 0) {
    return <OicQuizGenerator itemCode={itemCode} itemTitle={itemTitle} />;
  }

  return (
    <Tabs defaultValue="memoriser" className="w-full">
      <TabsList className="grid h-auto w-full grid-cols-2">
        <TabsTrigger value="memoriser" className="min-h-11 whitespace-normal">Mémoriser</TabsTrigger>
        <TabsTrigger value="reconnaitre" className="min-h-11 whitespace-normal">Reconnaître les compétences</TabsTrigger>
      </TabsList>
      <TabsContent value="memoriser" className="mt-4">
        <QuizMemorisation itemCode={itemCode} itemTitle={itemTitle} questions={questions} pilote />
      </TabsContent>
      <TabsContent value="reconnaitre" className="mt-4">
        <OicQuizGenerator itemCode={itemCode} itemTitle={itemTitle} />
      </TabsContent>
    </Tabs>
  );
};
