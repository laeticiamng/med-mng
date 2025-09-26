import React from 'react';
import { SmartLoadingProvider } from './SmartLoadingOrchestrator';
import { IntelligentFeedbackProvider } from './IntelligentFeedbackSystem';
import { SmartNavigationProvider } from './SmartNavigationEnhancer';
import { AdvancedAccessibilityProvider } from './AdvancedAccessibilityEnhancer';

/**
 * UXOrchestrator - Component principal qui orchestre toutes les améliorations UX
 * Combine tous les providers UX pour une expérience utilisateur optimale
 */
export const UXOrchestrator: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AdvancedAccessibilityProvider>
      <SmartNavigationProvider>
        <SmartLoadingProvider>
          <IntelligentFeedbackProvider>
            {children}
          </IntelligentFeedbackProvider>
        </SmartLoadingProvider>
      </SmartNavigationProvider>
    </AdvancedAccessibilityProvider>
  );
};

// Export des hooks pour un accès facile
export { useSmartLoading } from './SmartLoadingOrchestrator';
export { useIntelligentFeedback, useFeedbackShortcuts } from './IntelligentFeedbackSystem';
export { useSmartNavigation } from './SmartNavigationEnhancer';
export { useAdvancedAccessibility } from './AdvancedAccessibilityEnhancer';

// Export des composants utilitaires
export { SmartNavigationToolbar, QuickNavigationMenu } from './SmartNavigationEnhancer';
export { 
  MicroInteraction, 
  InteractiveButton, 
  InteractiveCard, 
  PulsingIcon, 
  RippleButton 
} from './MicroInteractionSystem';