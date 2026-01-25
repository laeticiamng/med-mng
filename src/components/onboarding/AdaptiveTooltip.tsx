import { supabase } from '@/integrations/supabase/client';
import React, { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ContextualHelp } from './ContextualHelp';

interface AdaptiveTooltipProps {
  children: React.ReactNode;
  feature: string;
  title?: string;
  content?: string;
  trigger?: 'hover' | 'first-visit' | 'manual';
  delay?: number;
}

export const AdaptiveTooltip: React.FC<AdaptiveTooltipProps> = ({
  children,
  feature,
  title,
  content,
  trigger = 'hover',
  delay = 1000
}) => {
  const [_shouldShow, setShouldShow] = useState(false);
  const [featureData, setFeatureData] = useState<{ visitCount: number; isFirstVisit: boolean }>({ visitCount: 0, isFirstVisit: true });
  const location = useLocation();

  // Load feature tracking from Supabase
  const loadFeatureData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      // Fallback to localStorage for anonymous users
      const visited = localStorage.getItem(`visited_${feature}`);
      const count = parseInt(localStorage.getItem(`feature_usage_${feature}`) || '0');
      setFeatureData({ visitCount: count, isFirstVisit: !visited });
      return;
    }

    const { data } = await (supabase as any)
      .from('user_feature_tracking')
      .select('visit_count, first_visited_at')
      .eq('user_id', user.id)
      .eq('feature_key', feature)
      .maybeSingle();

    if (data) {
      setFeatureData({ visitCount: data.visit_count, isFirstVisit: false });
    } else {
      setFeatureData({ visitCount: 0, isFirstVisit: true });
    }
  }, [feature]);

  useEffect(() => {
    loadFeatureData();
  }, [loadFeatureData, location.pathname]);

  useEffect(() => {
    const checkIfShouldShow = async () => {
      const userLevel = getUserLevel();
      
      if (trigger === 'first-visit' && featureData.isFirstVisit) {
        setTimeout(() => setShouldShow(true), delay);
        await trackFeatureVisit();
      } else if (userLevel === 'beginner' && featureData.visitCount < 3) {
        setShouldShow(true);
      }
    };
    checkIfShouldShow();
  }, [featureData, trigger, delay]);

  const getUserLevel = (): 'beginner' | 'intermediate' | 'advanced' => {
    if (featureData.visitCount < 5) return 'beginner';
    if (featureData.visitCount < 20) return 'intermediate';
    return 'advanced';
  };

  const trackFeatureVisit = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      localStorage.setItem(`visited_${feature}`, 'true');
      return;
    }

    await (supabase as any)
      .from('user_feature_tracking')
      .upsert({
        user_id: user.id,
        feature_key: feature,
        visit_count: 1,
        first_visited_at: new Date().toISOString(),
        last_visited_at: new Date().toISOString()
      }, { onConflict: 'user_id,feature_key' });
  };

  const incrementFeatureUsage = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      const current = parseInt(localStorage.getItem(`feature_usage_${feature}`) || '0');
      localStorage.setItem(`feature_usage_${feature}`, (current + 1).toString());
      return;
    }

    await (supabase as any)
      .from('user_feature_tracking')
      .upsert({
        user_id: user.id,
        feature_key: feature,
        visit_count: featureData.visitCount + 1,
        last_visited_at: new Date().toISOString()
      }, { onConflict: 'user_id,feature_key' });
    
    setFeatureData(prev => ({ ...prev, visitCount: prev.visitCount + 1 }));
  };

  const contextualContent = getContextualContent();

  function getContextualContent() {
    const route = location.pathname;
    const routeSpecificContent: Record<string, Record<string, string>> = {
      '/': {
        'music-generation': 'Cliquez ici pour créer votre première chanson médicale personnalisée.',
        'edn-access': 'Accédez aux contenus EDN organisés par spécialité et rang.',
        'library': 'Consultez vos créations musicales sauvegardées.'
      },
      '/generator': {
        'style-selection': 'Choisissez le style musical qui convient à votre apprentissage.',
        'item-selection': 'Sélectionnez l\'item EDN correspondant à votre spécialité.',
        'generate-button': 'Lancez la génération de votre chanson personnalisée.'
      },
      '/library': {
        'filters': 'Filtrez vos créations par style, spécialité ou date.',
        'favorites': 'Marquez vos chansons préférées pour un accès rapide.',
        'player': 'Écoutez vos créations directement dans l\'interface.'
      }
    };
    return routeSpecificContent[route]?.[feature] || content;
  }

  return (
    <div onClick={incrementFeatureUsage}>
      <ContextualHelp
        helpKey={feature}
        title={title}
        content={contextualContent}
        side="top"
      >
        {children}
      </ContextualHelp>
    </div>
  );
};