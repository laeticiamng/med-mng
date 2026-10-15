import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { QuestionAffichee } from '@/data/quizMemorisation/types';
import { chargerQuestionsAffichables, quizMemorisationActif } from '@/lib/quizMemorisationChargement';
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
  const actif = quizMemorisationActif();
  const [questions, setQuestions] = useState<QuestionAffichee[] | null>(actif ? null : []);
  // Bandeau « pilote » : le serveur sert aussi du contenu non encore validé, ou pilote statique.
  const [modePilote, setModePilote] = useState(false);

  useEffect(() => {
    if (!actif) return;
    let encore = true;
    setQuestions(null);
    chargerQuestionsAffichables(itemCode)
      .then((r) => {
        if (!encore) return;
        setModePilote(r.pilote);
        setQuestions(r.questions);
      })
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
        <QuizMemorisation itemCode={itemCode} itemTitle={itemTitle} questions={questions} pilote={modePilote} />
      </TabsContent>
      <TabsContent value="reconnaitre" className="mt-4">
        <OicQuizGenerator itemCode={itemCode} itemTitle={itemTitle} />
      </TabsContent>
    </Tabs>
  );
};
