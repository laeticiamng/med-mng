import React from 'react';

interface SkipLinkProps {
  href: string;
  children: React.ReactNode;
}

export const SkipLink: React.FC<SkipLinkProps> = ({ href, children }) => {
  return (
    <a 
      href={href} 
      className="skip-link"
      onClick={(e) => {
        e.preventDefault();
        const target = document.querySelector(href) as HTMLElement;
        if (target) {
          target.focus();
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }}
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