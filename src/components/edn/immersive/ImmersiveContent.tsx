
import { SceneImmersive } from '@/components/edn/SceneImmersive';
import { TableauRangA } from '@/components/edn/TableauRangA';
import { TableauRangB } from '@/components/edn/TableauRangB';
import { ParolesMusicales } from '@/components/edn/ParolesMusicales';
import { BandeDessinee } from '@/components/edn/BandeDessinee';
import { InteractionDragDrop } from '@/components/edn/InteractionDragDrop';
import { QuizFinal } from '@/components/edn/QuizFinal';
import { PitchIntroSection } from './PitchIntroSection';

interface EdnItemImmersive {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  item_code: string;
  pitch_intro: string;
  visual_ambiance: any;
  audio_ambiance: any;
  tableau_rang_a: any;
  tableau_rang_b: any;
  scene_immersive: any;
  paroles_musicales: string[];
  interaction_config: any;
  quiz_questions: any;
  reward_messages: any;
}

interface ImmersiveContentProps {
  currentSection: number;
  item: EdnItemImmersive;
}

export const ImmersiveContent = ({ currentSection, item }: ImmersiveContentProps) => {
  const renderCurrentSection = () => {
    switch (currentSection) {
      case 0:
        return (
          <PitchIntroSection
            title={item.title}
            itemCode={item.item_code}
            subtitle={item.subtitle}
            pitchIntro={item.pitch_intro}
          />
        );
      case 1:
        return <SceneImmersive data={item.scene_immersive} />;
      case 2:
        return <TableauRangA data={item.tableau_rang_a} />;
      case 3:
        return <TableauRangB data={item.tableau_rang_b} />;
      case 4:
        return <ParolesMusicales paroles={item.paroles_musicales} />;
      case 5:
        return <BandeDessinee itemData={{ ...item, slug: item.slug }} />;
      case 6:
        return <InteractionDragDrop config={item.interaction_config} />;
      case 7:
        return <QuizFinal questions={item.quiz_questions} rewards={item.reward_messages} />;
      default:
        return null;
    }
  };

  return (
    <div className="p-8 min-h-[600px]">
      {renderCurrentSection()}
    </div>
  );
};
