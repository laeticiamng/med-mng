
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
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
        console.log('🔍 Chargement item immersif pour slug:', slug);
        
        // Utiliser edn_items_complete au lieu de edn_items_immersive pour avoir les bonnes compétences OIC
        const { data, error } = await supabase
          .from('edn_items_complete')
          .select('*')
          .eq('slug', slug)
          .maybeSingle();

        if (error) {
          console.error('❌ Erreur lors du chargement de l\'item:', error);
          return;
        }

        if (!data) {
          console.warn('⚠️ Aucun item trouvé pour le slug:', slug);
          return;
        }

        console.log('✅ Item chargé avec succès:', {
          item_code: data.item_code,
          title: data.title,
          paroles_musicales: data.paroles_musicales,
          paroles_length: data.paroles_musicales?.length || 0,
          sections_disponibles: {
            pitch_intro: !!data.pitch_intro,
            scene_immersive: !!data.scene_immersive,
            tableau_rang_a: !!data.tableau_rang_a,
            tableau_rang_b: !!data.tableau_rang_b,
            paroles_musicales: !!data.paroles_musicales && data.paroles_musicales.length >= 2,
            interaction_config: !!data.interaction_config,
            quiz_questions: !!data.quiz_questions
          }
        });

        // Vérifier et valider les données critiques
        if (!data.paroles_musicales || data.paroles_musicales.length < 2) {
          console.warn('⚠️ Paroles musicales incomplètes pour', data.item_code, '- Attendu: 2, Actuel:', data.paroles_musicales?.length || 0);
        }

        if (!data.tableau_rang_a || !data.tableau_rang_b) {
          console.warn('⚠️ Tableaux Rang A/B manquants pour', data.item_code);
        }

        if (!data.quiz_questions) {
          console.warn('⚠️ Quiz manquant pour', data.item_code);
        }

        // Validation de la structure des quiz (répartition 70% A / 30% B)
        if (data.quiz_questions && typeof data.quiz_questions === 'object' && 'questions' in data.quiz_questions) {
          const quizConfig = data.quiz_questions as unknown as QuizConfig;
          if (Array.isArray(quizConfig.questions)) {
            const rangACount = quizConfig.questions.filter((q: QuizQuestion) => q.rang === 'A').length;
            const rangBCount = quizConfig.questions.filter((q: QuizQuestion) => q.rang === 'B').length;
            const total = quizConfig.questions.length;
            
            console.log('📊 Répartition quiz:', {
              total,
              rangA: rangACount,
              rangB: rangBCount,
              pourcentageA: Math.round((rangACount / total) * 100),
              pourcentageB: Math.round((rangBCount / total) * 100)
            });
          }
        }

        setItem(data as unknown as EdnItemImmersive);
      } catch (error) {
        console.error('❌ Erreur inattendue:', error);
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
    
    console.log('📍 Navigation vers section:', {
      index: currentSection,
      section: sections[currentSection],
      progress: newProgress
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
