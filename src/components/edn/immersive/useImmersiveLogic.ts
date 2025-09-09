
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/structuredLogger';
import { 
  EdnItemImmersive, 
  QuizConfig, 
  QuizQuestion,
  VisualAmbiance,
  AudioAmbiance,
  TableauData,
  SceneImmersive,
  InteractionConfig,
  RewardMessages
} from '@/types/edn';

export const useImmersiveLogic = () => {
  const { slug } = useParams();
  const [item, setItem] = useState<EdnItemImmersive | null>(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);

  const sections = [
    'Pitch d\'introduction',
    'Scène immersive',
    'Tableau Rang A',
    'Tableau Rang B',
    'Paroles musicales',
    'Bande dessinée',
    'Interaction',
    'Quiz final'
  ];

  useEffect(() => {
    const fetchItem = async () => {
      try {
        logger.info('Chargement item immersif', {
          component: 'useImmersiveLogic',
          metadata: { slug }
        });
        
        // Utiliser edn_items_complete au lieu de edn_items_immersive pour avoir les bonnes compétences OIC
        const { data, error } = await supabase
          .from('edn_items_complete')
          .select('*')
          .eq('slug', slug)
          .maybeSingle();

        if (error) {
          logger.error('Erreur chargement item immersif', {
            component: 'useImmersiveLogic',
            metadata: { slug }
          }, error);
          return;
        }

        if (!data) {
          logger.warn('Aucun item trouvé', {
            component: 'useImmersiveLogic',
            metadata: { slug }
          });
          return;
        }

        logger.info('Item immersif chargé avec succès', {
          component: 'useImmersiveLogic',
          metadata: {
            itemCode: data.item_code,
            title: data.title,
            parolesLength: data.paroles_musicales?.length || 0,
            sectionsDisponibles: {
              pitchIntro: !!data.pitch_intro,
              sceneImmersive: !!data.scene_immersive,
              tableauRangA: !!data.tableau_rang_a,
              tableauRangB: !!data.tableau_rang_b,
              parolesMusicales: !!data.paroles_musicales && data.paroles_musicales.length >= 2,
              interactionConfig: !!data.interaction_config,
              quizQuestions: !!data.quiz_questions
            }
          }
        });

        // Vérifier et valider les données critiques
        if (!data.paroles_musicales || data.paroles_musicales.length < 2) {
          logger.warn('Paroles musicales incomplètes', {
            component: 'useImmersiveLogic',
            metadata: {
              itemCode: data.item_code,
              expected: 2,
              actual: data.paroles_musicales?.length || 0
            }
          });
        }

        if (!data.tableau_rang_a || !data.tableau_rang_b) {
          logger.warn('Tableaux Rang A/B manquants', {
            component: 'useImmersiveLogic',
            metadata: {
              itemCode: data.item_code,
              hasRangA: !!data.tableau_rang_a,
              hasRangB: !!data.tableau_rang_b
            }
          });
        }

        if (!data.quiz_questions) {
          logger.warn('Quiz manquant', {
            component: 'useImmersiveLogic',
            metadata: { itemCode: data.item_code }
          });
        }

        // Validation de la structure des quiz (répartition 70% A / 30% B)
        if (data.quiz_questions && typeof data.quiz_questions === 'object' && 'questions' in data.quiz_questions) {
          const quizConfig = data.quiz_questions as unknown as QuizConfig;
          if (Array.isArray(quizConfig.questions)) {
            const rangACount = quizConfig.questions.filter((q: QuizQuestion) => q.rang === 'A').length;
            const rangBCount = quizConfig.questions.filter((q: QuizQuestion) => q.rang === 'B').length;
            const total = quizConfig.questions.length;
            
            logger.debug('Répartition quiz analysée', {
              component: 'useImmersiveLogic',
              metadata: {
                total,
                rangA: rangACount,
                rangB: rangBCount,
                pourcentageA: Math.round((rangACount / total) * 100),
                pourcentageB: Math.round((rangBCount / total) * 100)
              }
            });
          }
        }

        setItem(data as unknown as EdnItemImmersive);
      } catch (error) {
        logger.error('Erreur inattendue chargement item', {
          component: 'useImmersiveLogic'
        }, error as Error);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchItem();
    }
  }, [slug]);

  useEffect(() => {
    const newProgress = ((currentSection + 1) / sections.length) * 100;
    setProgress(newProgress);
    
    logger.debug('Navigation section immersive', {
      component: 'useImmersiveLogic',
      metadata: {
        sectionIndex: currentSection,
        sectionName: sections[currentSection],
        progress: newProgress
      }
    });
  }, [currentSection]);

  const toggleAudio = () => {
    setIsAudioPlaying(!isAudioPlaying);
  };

  const nextSection = () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1);
    }
  };

  const prevSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  const setSection = (index: number) => {
    setCurrentSection(index);
  };

  return {
    item,
    currentSection,
    isAudioPlaying,
    progress,
    loading,
    sections,
    toggleAudio,
    nextSection,
    prevSection,
    setSection
  };
};
