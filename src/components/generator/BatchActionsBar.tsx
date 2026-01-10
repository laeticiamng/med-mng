import React from 'react';
import { Trash2, Heart, Download, X, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TranslatedText } from '@/components/TranslatedText';
import { motion, AnimatePresence } from 'framer-motion';

interface BatchActionsBarProps {
  selectedCount: number;
  onDeleteSelected: () => void;
  onFavoriteSelected: () => void;
  onDownloadSelected: () => void;
  onClearSelection: () => void;
  onSelectAll: () => void;
  totalCount: number;
  isDeleting?: boolean;
}

export const BatchActionsBar: React.FC<BatchActionsBarProps> = ({
  selectedCount,
  onDeleteSelected,
  onFavoriteSelected,
  onDownloadSelected,
  onClearSelection,
  onSelectAll,
  totalCount,
  isDeleting = false
}) => {
  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50"
        >
          <div className="bg-card/95 backdrop-blur-xl border border-border shadow-2xl rounded-xl p-3 flex items-center gap-2 sm:gap-3">
            <Badge variant="secondary" className="text-sm font-medium px-3 py-1">
              {selectedCount} sélectionné{selectedCount > 1 ? 's' : ''}
            </Badge>

            <div className="h-6 w-px bg-border" />

            {/* Sélectionner tout */}
            {selectedCount < totalCount && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onSelectAll}
                className="text-xs h-8"
              >
                <CheckSquare className="h-3.5 w-3.5 mr-1" />
                <span className="hidden sm:inline"><TranslatedText text="Tout" /></span>
              </Button>
            )}

            {/* Favoris */}
            <Button
              size="sm"
              variant="ghost"
              onClick={onFavoriteSelected}
              className="text-warning hover:text-warning h-8"
            >
              <Heart className="h-3.5 w-3.5 mr-1" />
              <span className="hidden sm:inline"><TranslatedText text="Favoris" /></span>
            </Button>

            {/* Télécharger */}
            <Button
              size="sm"
              variant="ghost"
              onClick={onDownloadSelected}
              className="h-8"
            >
              <Download className="h-3.5 w-3.5 mr-1" />
              <span className="hidden sm:inline"><TranslatedText text="Télécharger" /></span>
            </Button>

            {/* Supprimer */}
            <Button
              size="sm"
              variant="ghost"
              onClick={onDeleteSelected}
              disabled={isDeleting}
              className="text-destructive hover:text-destructive h-8"
            >
              {isDeleting ? (
                <div className="h-3.5 w-3.5 mr-1 animate-spin border-2 border-current border-t-transparent rounded-full" />
              ) : (
                <Trash2 className="h-3.5 w-3.5 mr-1" />
              )}
              <span className="hidden sm:inline"><TranslatedText text="Supprimer" /></span>
            </Button>

            <div className="h-6 w-px bg-border" />

            {/* Annuler */}
            <Button
              size="sm"
              variant="ghost"
              onClick={onClearSelection}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
