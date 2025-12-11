import React from 'react';
import { useActivityTracking } from '@/hooks/useActivityTracking';

interface SkipLinkProps {
  href: string;
  children: React.ReactNode;
}

export const SkipLink: React.FC<SkipLinkProps> = ({ href, children }) => {
  const { logActivity } = useActivityTracking();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    logActivity({
      activity_type: 'study',
      count: 1,
      metadata: { component: 'skip_link', action: 'accessibility_navigate', target: href }
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
    >
      {children}
    </a>
  );
};

export const SkipLinks: React.FC = () => {
  return (
    <div className="sr-only focus-within:not-sr-only">
      <SkipLink href="#main-content">
        Aller au contenu principal
      </SkipLink>
      <SkipLink href="#navigation">
        Aller à la navigation
      </SkipLink>
      <SkipLink href="#footer">
        Aller au pied de page
      </SkipLink>
    </div>
  );
};