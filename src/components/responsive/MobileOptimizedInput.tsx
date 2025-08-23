import React from 'react';
import { Input } from '@/components/ui/input';
import { useBreakpoints } from '@/hooks/useBreakpoints';
import { cn } from '@/lib/utils';

interface MobileOptimizedInputProps extends React.ComponentProps<"input"> {
  touchFriendly?: boolean;
  mobileVariant?: 'default' | 'large' | 'compact';
  fullWidth?: boolean;
  smartAutoComplete?: boolean; // Renommé pour éviter le conflit
}

export const MobileOptimizedInput: React.FC<MobileOptimizedInputProps> = ({
  className,
  touchFriendly = true,
  mobileVariant = 'default',
  fullWidth = true,
  smartAutoComplete = true,
  ...props
}) => {
  const { isMobile, isMobileSmall } = useBreakpoints();

  const getInputClasses = () => {
    const baseClasses = [];
    
    // Pleine largeur par défaut sur mobile
    if (fullWidth && isMobile) {
      baseClasses.push('w-full');
    }
    
    if (isMobile) {
      // Hauteur optimisée pour le tactile sur mobile
      if (touchFriendly) {
        if (isMobileSmall) {
          switch (mobileVariant) {
            case 'large':
              baseClasses.push('h-12 text-base px-4');
              break;
            case 'compact':
              baseClasses.push('h-10 text-sm px-3');
              break;
            default:
              baseClasses.push('h-11 text-sm px-3');
          }
        } else {
          switch (mobileVariant) {
            case 'large':
              baseClasses.push('h-14 text-lg px-4');
              break;
            case 'compact':
              baseClasses.push('h-10 text-sm px-3');
              break;
            default:
              baseClasses.push('h-12 text-base px-4');
          }
        }
      }
      
      // Amélioration du focus et de l'interaction sur mobile
      baseClasses.push(
        'focus:ring-2 focus:ring-primary/30 focus:border-primary',
        'transition-all duration-200',
        'touch-manipulation',
        'rounded-lg' // Coins plus arrondis sur mobile
      );
      
      // Padding adaptatif selon la taille d'écran
      if (isMobileSmall) {
        baseClasses.push('py-2');
      } else {
        baseClasses.push('py-3');
      }
    }
    
    return baseClasses.join(' ');
  };

  // Props spécifiques pour mobile
  const getMobileProps = () => {
    const mobileProps: any = {};
    
    if (isMobile) {
      // Amélioration de l'accessibilité sur mobile
      mobileProps.autoCapitalize = props.type === 'email' ? 'none' : 'sentences';
      mobileProps.autoCorrect = props.type === 'email' || props.type === 'password' ? 'off' : 'on';
      
      // Autocomplete intelligent
      if (smartAutoComplete && !props.autoComplete) {
        if (props.type === 'email') mobileProps.autoComplete = 'email';
        if (props.type === 'password') mobileProps.autoComplete = 'current-password';
        if (props.type === 'tel') mobileProps.autoComplete = 'tel';
        if (props.name === 'search') mobileProps.autoComplete = 'off';
      }
      
      // Clavier adaptatif
      if (props.type === 'email') {
        mobileProps.inputMode = 'email';
      } else if (props.type === 'tel') {
        mobileProps.inputMode = 'tel';
      } else if (props.type === 'number') {
        mobileProps.inputMode = 'numeric';
      } else if (props.name?.includes('search')) {
        mobileProps.inputMode = 'search';
      }
    }
    
    return mobileProps;
  };

  return (
    <Input
      className={cn(getInputClasses(), className)}
      {...getMobileProps()}
      {...props}
    />
  );
};