
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

// Fonction utilitaire pour parser les données JSON de manière sécurisée
const parseJSONSafely = (data: any, defaultValue: any = null) => {
  if (!data) {
    console.log('parseJSONSafely: No data provided');
    return defaultValue;
  }
  
  if (typeof data === 'string') {
    try {
      const parsed = JSON.parse(data);
      console.log('parseJSONSafely: Successfully parsed JSON string:', parsed);
      return parsed;
    } catch (error) {
      console.error('parseJSONSafely: Error parsing JSON string:', error);
      return defaultValue;
    }
  }
  
  if (typeof data === 'object') {
    console.log('parseJSONSafely: Data is already an object:', data);
    return data;
  }
  
  console.log('parseJSONSafely: Unknown data type:', typeof data, data);
  return defaultValue;
};

// Fonction pour transformer les données brutes en format tableau
const transformToTableauFormat = (rawData: any, rangType: 'A' | 'B') => {
  if (!rawData) return null;
  
  // Si c'est déjà au bon format
  if (rawData.colonnes && rawData.lignes) {
    return rawData;
  }
  
  // Si c'est un objet avec des sections
  if (rawData.sections && Array.isArray(rawData.sections)) {
    const colonnes = ['Titre', 'Contenu'];
    const lignes = rawData.sections.map((section: any) => [
      section.title || 'Sans titre',
      section.content || 'Sans contenu'
    ]);
    
    return {
      theme: rawData.title || `Tableau Rang ${rangType}`,
      colonnes,
      lignes
    };
  }
  
  // Format par défaut si les données ne correspondent à aucun format connu
  return {
    theme: `Tableau Rang ${rangType}`,
    colonnes: ['Information'],
    lignes: [['Données en cours de traitement...']]
  };
};

export const ImmersiveContent = ({ currentSection, item }: ImmersiveContentProps) => {
  console.log('ImmersiveContent - currentSection:', currentSection);
  console.log('ImmersiveContent - item data:', item);

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
        console.log('Rendering TableauRangA - Raw data:', item.tableau_rang_a);
        console.log('Rendering TableauRangA - Data type:', typeof item.tableau_rang_a);
        
        const tableauRangAData = parseJSONSafely(item.tableau_rang_a);
        console.log('Rendering TableauRangA - Parsed data:', tableauRangAData);
        
        const transformedRangA = transformToTableauFormat(tableauRangAData, 'A');
        console.log('Rendering TableauRangA - Transformed data:', transformedRangA);
        
        if (!transformedRangA) {
          return (
            <div className="text-center space-y-6">
              <h2 className="text-3xl font-serif text-amber-900">Tableau Rang A</h2>
              <p className="text-amber-700">Données du tableau non disponibles</p>
            </div>
          );
        }
        
        return <TableauRangA data={transformedRangA} />;
        
      case 3:
        console.log('Rendering TableauRangB - Raw data:', item.tableau_rang_b);
        console.log('Rendering TableauRangB - Data type:', typeof item.tableau_rang_b);
        
        const tableauRangBData = parseJSONSafely(item.tableau_rang_b);
        console.log('Rendering TableauRangB - Parsed data:', tableauRangBData);
        
        const transformedRangB = transformToTableauFormat(tableauRangBData, 'B');
        console.log('Rendering TableauRangB - Transformed data:', transformedRangB);
        
        if (!transformedRangB) {
          return (
            <div className="text-center space-y-6">
              <h2 className="text-3xl font-serif text-amber-900">Tableau Rang B</h2>
              <p className="text-amber-700">Données du tableau non disponibles</p>
            </div>
          );
        }
        
        return <TableauRangB data={transformedRangB} />;
        
      case 4:
        console.log('Rendering ParolesMusicales - Raw data:', item.paroles_musicales);
        
        // Vérifier si les paroles existent et les traiter
        let parolesData = item.paroles_musicales;
        if (!parolesData || !Array.isArray(parolesData) || parolesData.length === 0) {
          // Données par défaut si manquantes
          parolesData = [
            `[Couplet 1]
Dans les couloirs de l'hôpital, résonne l'écho des pas
Médecin, ton cœur se bat, pour chaque vie qui est là
L'éthique guide tes choix, dans chaque diagnostic
Colloque singulier, c'est toi et lui, face à face, authentique

[Refrain]
Écoute, comprends, soigne avec respect
Chaque patient a son histoire, ses craintes à protéger
Dans le silence de la consultation
Naît la confiance, base de la guérison`,
            `[Couplet 1]
Chaque professionnel porte en lui les valeurs sacrées
Responsabilité, compassion, dans chaque geste posé
Organisation des soins, régulation des pratiques
Pour que l'humain reste au centre, de toute notre clinique

[Refrain]
Outils pratiques, dimensions complexes
Médecine fondée sur les preuves
Déontologie, notre code, nos règles
Pour protéger la vie, c'est notre œuvre`
          ];
        }
        
        return <ParolesMusicales paroles={parolesData} />;
        
      case 5:
        return <BandeDessinee itemData={{ ...item, slug: item.slug }} />;
      case 6:
        console.log('Rendering InteractionDragDrop - Raw data:', item.interaction_config);
        const interactionData = parseJSONSafely(item.interaction_config);
        console.log('Rendering InteractionDragDrop - Parsed data:', interactionData);
        
        if (!interactionData) {
          return (
            <div className="text-center space-y-6">
              <h2 className="text-3xl font-serif text-amber-900">Interaction</h2>
              <p className="text-amber-700">Configuration d'interaction non disponible</p>
            </div>
          );
        }
        
        return <InteractionDragDrop config={interactionData} />;
      case 7:
        console.log('Rendering QuizFinal - Questions:', item.quiz_questions);
        console.log('Rendering QuizFinal - Rewards:', item.reward_messages);
        
        const quizData = parseJSONSafely(item.quiz_questions);
        const rewardsData = parseJSONSafely(item.reward_messages);
        
        if (!quizData) {
          return (
            <div className="text-center space-y-6">
              <h2 className="text-3xl font-serif text-amber-900">Quiz Final</h2>
              <p className="text-amber-700">Questions du quiz non disponibles</p>
            </div>
          );
        }
        
        return <QuizFinal questions={quizData} rewards={rewardsData} />;
      default:
        return (
          <div className="text-center space-y-6">
            <h2 className="text-3xl font-serif text-amber-900">Section non trouvée</h2>
            <p className="text-amber-700">Cette section n'existe pas encore.</p>
          </div>
        );
    }
  };

  return (
    <div className="p-8 min-h-[600px]">
      {renderCurrentSection()}
    </div>
  );
};
