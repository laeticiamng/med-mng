import React from 'react';

export const SkipLinks: React.FC = () => {
  return (
    <>
      <a 
        href="#main-content" 
        className="skip-link"
        tabIndex={1}
      >
        Aller au contenu principal
      </a>
      <a 
        href="#main-navigation" 
        className="skip-link"
        tabIndex={2}
      >
        Aller à la navigation
      </a>
      <a 
        href="#search" 
        className="skip-link"
        tabIndex={3}
      >
        Aller à la recherche
      </a>
    </>
  );
};