import React from 'react';
import { useActivityTracking } from '@/hooks/useActivityTracking';

interface SkipLinkProps {
  href: string;
  children: React.ReactNode;
}

const SkipLink: React.FC<SkipLinkProps> = ({ href, children }) => {
  const { logActivity } = useActivityTracking();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    logActivity({
      activity_type: 'study',
      count: 1,
      metadata: { type: 'accessibility_skip_link', target: href }
    });
    const target = document.querySelector(href) as HTMLElement;
    if (target) {
      target.focus();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <a 
      href={href} 
      className="skip-link"
      onClick={handleClick}
      aria-label={typeof children === 'string' ? children : undefined}
    >
      {children}
    </a>
  );
};

/**
 * Skip links for keyboard navigation accessibility (WCAG AAA)
 * Provides quick navigation to main content areas for screen readers
 * and keyboard users
 */
export const SkipLinks: React.FC = () => {
  return (
    <div className="sr-only focus-within:not-sr-only" role="navigation" aria-label="Liens d'accès rapide">
      <SkipLink href="#main-content">
        Aller au contenu principal
      </SkipLink>
      <SkipLink href="#main-navigation">
        Aller à la navigation
      </SkipLink>
      <SkipLink href="#search">
        Aller à la recherche
      </SkipLink>
      <SkipLink href="#footer">
        Aller au pied de page
      </SkipLink>
    </div>
  );
};