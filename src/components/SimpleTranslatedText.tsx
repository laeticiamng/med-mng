import React from 'react';

interface SimpleTranslatedTextProps {
  text: string;
  className?: string;
  as?: 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div';
}

export const SimpleTranslatedText: React.FC<SimpleTranslatedTextProps> = ({ 
  text, 
  className = '', 
  as: Component = 'span'
}) => {
  // Version simple qui retourne juste le texte sans traduction
  return (
    <Component className={className}>
      {text}
    </Component>
  );
};