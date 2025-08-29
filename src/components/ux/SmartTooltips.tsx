import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, Lightbulb, Zap, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SmartTooltipProps {
  children: React.ReactNode;
  content: string;
  type?: 'info' | 'tip' | 'shortcut' | 'feature';
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  className?: string;
  showArrow?: boolean;
  persistent?: boolean;
}

export const SmartTooltip: React.FC<SmartTooltipProps> = ({
  children,
  content,
  type = 'info',
  position = 'top',
  delay = 500,
  className,
  showArrow = true,
  persistent = false
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [actualPosition, setActualPosition] = useState(position);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  const showTooltip = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
      adjustPosition();
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (!persistent) setIsVisible(false);
  };

  const adjustPosition = () => {
    if (!tooltipRef.current || !triggerRef.current) return;

    const tooltip = tooltipRef.current;
    const trigger = triggerRef.current;
    const triggerRect = trigger.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    let newPosition = position;

    // Ajuster si déborde horizontalement
    if (position === 'right' && triggerRect.right + tooltipRect.width > viewport.width) {
      newPosition = 'left';
    } else if (position === 'left' && triggerRect.left - tooltipRect.width < 0) {
      newPosition = 'right';
    }

    // Ajuster si déborde verticalement  
    if (position === 'top' && triggerRect.top - tooltipRect.height < 0) {
      newPosition = 'bottom';
    } else if (position === 'bottom' && triggerRect.bottom + tooltipRect.height > viewport.height) {
      newPosition = 'top';
    }

    setActualPosition(newPosition);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const getIcon = () => {
    switch (type) {
      case 'tip': return <Lightbulb className="h-3 w-3" />;
      case 'shortcut': return <Zap className="h-3 w-3" />;
      case 'feature': return <Star className="h-3 w-3" />;
      default: return <Info className="h-3 w-3" />;
    }
  };

  const getTypeColors = () => {
    switch (type) {
      case 'tip': return 'bg-yellow-500/20 border-yellow-400/30 text-yellow-200';
      case 'shortcut': return 'bg-purple-500/20 border-purple-400/30 text-purple-200';
      case 'feature': return 'bg-blue-500/20 border-blue-400/30 text-blue-200';
      default: return 'bg-gray-500/20 border-gray-400/30 text-gray-200';
    }
  };

  const getPositionClasses = () => {
    const baseClasses = 'absolute z-50';
    switch (actualPosition) {
      case 'top':
        return `${baseClasses} bottom-full left-1/2 -translate-x-1/2 mb-2`;
      case 'bottom':
        return `${baseClasses} top-full left-1/2 -translate-x-1/2 mt-2`;
      case 'left':
        return `${baseClasses} right-full top-1/2 -translate-y-1/2 mr-2`;
      case 'right':
        return `${baseClasses} left-full top-1/2 -translate-y-1/2 ml-2`;
      default:
        return `${baseClasses} bottom-full left-1/2 -translate-x-1/2 mb-2`;
    }
  };

  const getArrowClasses = () => {
    if (!showArrow) return '';
    
    const baseArrow = 'absolute w-0 h-0 border-4';
    switch (actualPosition) {
      case 'top':
        return `${baseArrow} border-t-gray-800 border-l-transparent border-r-transparent border-b-transparent top-full left-1/2 -translate-x-1/2`;
      case 'bottom':
        return `${baseArrow} border-b-gray-800 border-l-transparent border-r-transparent border-t-transparent bottom-full left-1/2 -translate-x-1/2`;
      case 'left':
        return `${baseArrow} border-l-gray-800 border-t-transparent border-b-transparent border-r-transparent left-full top-1/2 -translate-y-1/2`;
      case 'right':
        return `${baseArrow} border-r-gray-800 border-t-transparent border-b-transparent border-l-transparent right-full top-1/2 -translate-y-1/2`;
      default:
        return '';
    }
  };

  return (
    <div 
      ref={triggerRef}
      className="relative inline-block"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}
      
      <AnimatePresence>
        {isVisible && (
          <motion.div
            ref={tooltipRef}
            initial={{ opacity: 0, scale: 0.95, y: actualPosition === 'top' ? 10 : -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: actualPosition === 'top' ? 10 : -10 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={cn(
              getPositionClasses(),
              'px-3 py-2 rounded-lg backdrop-blur-xl border shadow-xl max-w-xs',
              getTypeColors(),
              className
            )}
            role="tooltip"
            aria-label={content}
          >
            <div className="flex items-start gap-2 text-sm">
              <div className="flex-shrink-0 mt-0.5">
                {getIcon()}
              </div>
              <div className="font-medium leading-relaxed">
                {content}
              </div>
            </div>
            
            {showArrow && (
              <div className={getArrowClasses()} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Composant helper pour les tooltips contextuels
export const ContextualHelp: React.FC<{
  page: string;
  element: string;
  children: React.ReactNode;
}> = ({ page, element, children }) => {
  const tips: Record<string, Record<string, string>> = {
    edn: {
      search: 'Utilisez "/" pour rechercher rapidement ou tapez directement',
      filter: 'Combinez plusieurs filtres pour des résultats précis',
      grid: 'Basculez avec "G" ou utilisez la molette pour zoomer',
      item: 'Clic droit pour le menu contextuel, Entrée pour ouvrir'
    },
    ecos: {
      scenario: 'Chaque scénario adapte sa difficulté à vos performances',
      timer: 'Le temps est indicatif, prenez le temps nécessaire',
      evaluation: 'L\'évaluation est automatique et instantanée'
    },
    audit: {
      export: 'Les rapports incluent toutes les métadonnées et analyses',
      refresh: 'Actualisation automatique toutes les 5 minutes',
      compare: 'Glissez-déposez pour comparer différents items'
    },
    generator: {
      style: 'L\'IA apprend de vos préférences pour de meilleurs résultats',
      preview: 'Écoutez avant de générer pour économiser vos crédits',
      save: 'Toutes les générations sont automatiquement sauvegardées'
    }
  };

  const content = tips[page]?.[element] || 'Aide contextuelle non disponible';

  return (
    <SmartTooltip 
      content={content} 
      type="tip" 
      delay={300}
    >
      {children}
    </SmartTooltip>
  );
};