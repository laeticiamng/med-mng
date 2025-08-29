import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronDown, Eye, EyeOff, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ProgressiveDisclosureProps {
  children: React.ReactNode;
  title: string;
  initialOpen?: boolean;
  level?: 1 | 2 | 3;
  showCount?: number;
  previewContent?: string;
  collapsible?: boolean;
  persistState?: boolean;
  storageKey?: string;
}

export const ProgressiveDisclosure: React.FC<ProgressiveDisclosureProps> = ({
  children,
  title,
  initialOpen = false,
  level = 1,
  showCount,
  previewContent,
  collapsible = true,
  persistState = false,
  storageKey
}) => {
  const [isOpen, setIsOpen] = useState(() => {
    if (persistState && storageKey) {
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : initialOpen;
    }
    return initialOpen;
  });

  useEffect(() => {
    if (persistState && storageKey) {
      localStorage.setItem(storageKey, JSON.stringify(isOpen));
    }
  }, [isOpen, persistState, storageKey]);

  const toggleOpen = () => {
    if (collapsible) {
      setIsOpen(!isOpen);
    }
  };

  const getLevelStyles = () => {
    switch (level) {
      case 1:
        return {
          container: 'border-2 border-white/20 rounded-2xl',
          title: 'text-lg font-semibold',
          padding: 'p-6'
        };
      case 2:
        return {
          container: 'border border-white/10 rounded-xl',
          title: 'text-base font-medium',
          padding: 'p-4'
        };
      case 3:
        return {
          container: 'border-l-2 border-white/20 rounded-r-lg',
          title: 'text-sm font-medium',
          padding: 'p-3'
        };
      default:
        return {
          container: 'border border-white/10 rounded-lg',
          title: 'text-base font-medium',
          padding: 'p-4'
        };
    }
  };

  const styles = getLevelStyles();

  return (
    <div className={cn('bg-black/20 backdrop-blur-sm', styles.container)}>
      <div 
        className={cn(
          'flex items-center justify-between cursor-pointer',
          styles.padding,
          !isOpen && previewContent && 'pb-2'
        )}
        onClick={toggleOpen}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleOpen();
          }
        }}
        aria-expanded={isOpen}
        aria-controls={`content-${storageKey || title.replace(/\s+/g, '-').toLowerCase()}`}
      >
        <div className="flex items-center gap-3">
          {collapsible && (
            <motion.div
              animate={{ rotate: isOpen ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronRight className="h-4 w-4 text-white/60" />
            </motion.div>
          )}
          
          <div>
            <h3 className={cn('text-white', styles.title)}>
              {title}
              {showCount !== undefined && (
                <span className="ml-2 text-white/60 text-sm">({showCount})</span>
              )}
            </h3>
            
            {!isOpen && previewContent && (
              <p className="text-white/70 text-sm mt-1 line-clamp-2">
                {previewContent}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!collapsible && (
            <div className="flex items-center gap-1 text-white/40 text-xs">
              <Eye className="h-3 w-3" />
              Toujours visible
            </div>
          )}
          
          {collapsible && (
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="h-4 w-4 text-white/40" />
            </motion.div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
            id={`content-${storageKey || title.replace(/\s+/g, '-').toLowerCase()}`}
          >
            <div className={cn('border-t border-white/10', styles.padding, 'pt-4')}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Composant pour divulgation de liste avec "Voir plus"
interface ProgressiveListProps {
  items: React.ReactNode[];
  initialShow?: number;
  increment?: number;
  showAllText?: string;
  showLessText?: string;
  className?: string;
}

export const ProgressiveList: React.FC<ProgressiveListProps> = ({
  items,
  initialShow = 3,
  increment = 5,
  showAllText = "Voir plus",
  showLessText = "Voir moins",
  className
}) => {
  const [showCount, setShowCount] = useState(initialShow);
  const [showAll, setShowAll] = useState(false);

  const visibleItems = showAll ? items : items.slice(0, showCount);
  const hasMore = !showAll && items.length > showCount;
  const canShowLess = showAll && items.length > initialShow;

  const showMore = () => {
    if (showCount + increment >= items.length) {
      setShowAll(true);
    } else {
      setShowCount(prev => prev + increment);
    }
  };

  const showLess = () => {
    setShowAll(false);
    setShowCount(initialShow);
  };

  return (
    <div className={className}>
      <AnimatePresence mode="popLayout">
        {visibleItems.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: index * 0.05 }}
          >
            {item}
          </motion.div>
        ))}
      </AnimatePresence>

      {(hasMore || canShowLess) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 text-center"
        >
          {hasMore && (
            <Button
              variant="ghost"
              onClick={showMore}
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              <MoreHorizontal className="h-4 w-4 mr-2" />
              {showAllText} ({items.length - showCount} restants)
            </Button>
          )}
          
          {canShowLess && (
            <Button
              variant="ghost"
              onClick={showLess}
              className="text-white/70 hover:text-white hover:bg-white/10 ml-2"
            >
              <EyeOff className="h-4 w-4 mr-2" />
              {showLessText}
            </Button>
          )}
        </motion.div>
      )}
    </div>
  );
};

// Hook pour gérer l'état de divulgation progressive
export const useProgressiveDisclosure = (key: string, defaultOpen = false) => {
  const [isOpen, setIsOpen] = useState(() => {
    const stored = localStorage.getItem(`disclosure-${key}`);
    return stored ? JSON.parse(stored) : defaultOpen;
  });

  const toggle = () => setIsOpen(!isOpen);
  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  useEffect(() => {
    localStorage.setItem(`disclosure-${key}`, JSON.stringify(isOpen));
  }, [key, isOpen]);

  return { isOpen, toggle, open, close };
};