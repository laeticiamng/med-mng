import React, { useState, useEffect } from 'react';
import { ContextualHelp } from './ContextualHelp';
import { useLocation } from 'react-router-dom';

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
  const [shouldShow, setShouldShow] = useState(false);
  const location = useLocation();

  useEffect(() => {
    checkIfShouldShow();
  }, [location.pathname, feature]);

  const checkIfShouldShow = () => {
    const userLevel = getUserLevel();
    const featureUsage = getFeatureUsage(feature);
    const isFirstVisit = !localStorage.getItem(`visited_${feature}`);

    // Adaptive logic based on user behavior
    if (trigger === 'first-visit' && isFirstVisit) {
      setTimeout(() => setShouldShow(true), delay);
      localStorage.setItem(`visited_${feature}`, 'true');
    } else if (userLevel === 'beginner' && featureUsage < 3) {
      setShouldShow(true);
    }
  };

  const getUserLevel = (): 'beginner' | 'intermediate' | 'advanced' => {
    const completedActions = parseInt(localStorage.getItem('completed_actions') || '0');
    if (completedActions < 5) return 'beginner';
    if (completedActions < 20) return 'intermediate';
    return 'advanced';
  };

  const getFeatureUsage = (featureName: string): number => {
    return parseInt(localStorage.getItem(`feature_usage_${featureName}`) || '0');
  };

  const incrementFeatureUsage = () => {
    const current = getFeatureUsage(feature);
    localStorage.setItem(`feature_usage_${feature}`, (current + 1).toString());
  };

  const contextualContent = getContextualContent();

  function getContextualContent() {
    const route = location.pathname;
    
    // Dynamic content based on route and feature
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