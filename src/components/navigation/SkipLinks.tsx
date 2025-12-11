import React from 'react';
import { useActivityTracking } from '@/hooks/useActivityTracking';

export const SkipLinks: React.FC = () => {
  const { logActivity } = useActivityTracking();

  const handleSkipLinkClick = (target: string) => {
    logActivity({
      activity_type: 'study',
      count: 1,
      metadata: { type: 'accessibility_skip_link', target }
    });
  };

  return (
    <>
      <a 
        href="#main-content" 
        className="skip-link"
        tabIndex={1}
        onClick={() => handleSkipLinkClick('main-content')}
      >
        Aller au contenu principal
      </a>
      <a 
        href="#main-navigation" 
        className="skip-link"
        tabIndex={2}
        onClick={() => handleSkipLinkClick('main-navigation')}
      >
        Aller à la navigation
      </a>
      <a 
        href="#search" 
        className="skip-link"
        tabIndex={3}
        onClick={() => handleSkipLinkClick('search')}
      >
        Aller à la recherche
      </a>
    </>
  );
};