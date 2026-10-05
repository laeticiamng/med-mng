import { EnhancedQuizFinal } from '@/components/edn/EnhancedQuizFinal';
import { useFicheItemEdn } from './EdnItemContext';
import { EdnItemSeo } from './EdnItemSeo';

/**
 * `/edn-complete/:slug/quiz` — ancien onglet « Quiz » de la modale.
 *
 * Retirés le 05.10.2026 (critique finale), deux fonctions factices :
 * - « Classement Quiz » : quiz_results n'est lisible que par son propriétaire (RLS), le
 *   classement ne pouvait montrer que soi (« 0 participants — Soyez le premier », puis
 *   « 1er sur 1 participants ») ;
 * - « Partager » : publiait « J'ai obtenu 100%% au quiz » quel que soit le score réel,
 *   même avant d'avoir fait le quiz.
 * Le score réel reste dans « Historique des quiz » (onglets Aperçu et Stats).
 */
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
      </div>
    </>
  );
}
