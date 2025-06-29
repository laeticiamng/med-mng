
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

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
        
        const { data, error } = await supabase
          .from('edn_items_immersive')
          .select('*')
          .eq('slug', slug)
          .single();

        if (error) {
          console.error('❌ Erreur lors du chargement de l\'item:', error);
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
            paroles_musicales: !!data.paroles_musicales,
            interaction_config: !!data.interaction_config,
            quiz_questions: !!data.quiz_questions
          }
        });

        setItem(data);
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
