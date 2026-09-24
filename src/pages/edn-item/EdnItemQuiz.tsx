import { EnhancedQuizFinal } from '@/components/edn/EnhancedQuizFinal';
import { QuizLeaderboard } from '@/components/edn/QuizLeaderboard';
import { SocialShare } from '@/components/social/SocialShare';
import { useFicheItemEdn } from './EdnItemContext';
import { EdnItemSeo } from './EdnItemSeo';

/** `/edn-complete/:slug/quiz` — ancien onglet « Quiz » de la modale. */
export default function EdnItemQuiz() {
  const { item, contenu } = useFicheItemEdn();

  // `EnhancedQuizFinal` gère lui-même le cas « pas de question exploitable » :
  // il reconstruit alors le quiz depuis les compétences OIC de l'item.
  const questions = contenu.quiz_questions || item.quiz_questions || {};

  return (
    <>
      <EdnItemSeo segment="quiz" />
      <div className="space-y-6">
        <EnhancedQuizFinal
          questions={questions}
          itemCode={item.item_code}
          itemTitle={item.title}
        />

        <QuizLeaderboard itemCode={item.item_code} limit={10} />

        <div className="flex justify-center">
          <SocialShare
            type="score"
            title={`Quiz ${item.item_code}`}
            description={`J'ai complété le quiz ${item.title} !`}
            value="100%"
          />
        </div>
      </div>
    </>
  );
}
