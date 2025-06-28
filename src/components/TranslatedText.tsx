
import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';

interface TranslatedTextProps {
  text: string;
  className?: string;
  as?: 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div';
  showLoader?: boolean;
}

export const TranslatedText: React.FC<TranslatedTextProps> = ({ 
  text, 
  className = '', 
  as: Component = 'span',
  showLoader = false
}) => {
  const { text: translatedText, isLoading } = useTranslation(text);

  if (isLoading && showLoader) {
    return (
      <Component className={className}>
        <span className="animate-pulse bg-gray-200 rounded px-2 py-1">
          {text}
        </span>
      </Component>
    );
  }

  return (
    <Component className={className}>
      {translatedText}
    </Component>
  );
};
