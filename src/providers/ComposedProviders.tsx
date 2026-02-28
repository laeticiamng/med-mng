import React from 'react';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { GlobalAudioProvider } from '@/contexts/GlobalAudioContext';
import { AccessibilityProvider } from '@/components/ui/AccessibilityProvider';
import { TooltipProvider } from '@/components/ui/tooltip';
import { InternationalizationProvider } from '@/contexts/InternationalizationContext';

/**
 * ComposedProviders — Consolidates 5 providers into 1 wrapper
 * Reduces provider nesting depth in App.tsx
 */
export const ComposedProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <InternationalizationProvider>
    <LanguageProvider>
      <GlobalAudioProvider>
        <TooltipProvider>
          <AccessibilityProvider>
            {children}
          </AccessibilityProvider>
        </TooltipProvider>
      </GlobalAudioProvider>
    </LanguageProvider>
  </InternationalizationProvider>
);
