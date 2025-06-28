
import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';

interface TranslatedTextProps {
  text: string;
  className?: string;
  as?: 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div';
  showLoader?: boolean;
  fallbackText?: string;
}

export const TranslatedText: React.FC<TranslatedTextProps> = ({ 
  text, 
  className = '', 
  as: Component = 'span',
  showLoader = false,
  fallbackText
}) => {
  const { text: translatedText, isLoading, error } = useTranslation(text);

  // En cas d'erreur, utiliser le fallback ou le texte original
  const displayText = error ? (fallbackText || text) : translatedText;

  if (isLoading && showLoader) {
    return (
      <Component className={className}>
        <span className="animate-pulse bg-gray-200 rounded px-2 py-1">
          {text}
        </span>
      </Component>
    );
  }

  if (error && process.env.NODE_ENV === 'development') {
    console.warn('Erreur de traduction pour:', text, error);
  }

  return (
    <Component className={className}>
      {displayText}
    </Component>
  );
};
